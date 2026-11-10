import { useEffect, useRef } from 'react';

export type TopDockOptions = {
  proximity?: number;
  spring?: number;
  damping?: number;
  widthGrowth?: number;
  heightGrowth?: number;
  drop?: number;
  axis?: 'x' | 'y';
  distribute?: boolean;
  lockTrack?: boolean;
};

export const ANIMATED_TOP_DOCK_DEFAULTS = {
  proximity: 122,
  spring: 0.19,
  damping: 0.7,
  widthGrowth: 17,
  heightGrowth: 16,
  drop: 3.5,
  axis: 'x' as const,
  distribute: false,
  lockTrack: true,
} as const;

interface ItemState {
  currentVal: number;
  velocity: number;
  targetVal: number;
}

export function createTopDockController(
  root: HTMLElement,
  getOptions: () => TopDockOptions
): () => void {
  if (typeof window === 'undefined' || !root) {
    return () => {};
  }

  const stateMap = new WeakMap<HTMLElement, ItemState>();
  let rAF = 0;
  let isRunning = false;
  let pointerActive = false;
  let pointerX = -9999;
  let pointerY = -9999;

  root.setAttribute('data-dock-state', 'idle');
  root.setAttribute('data-dock-max', '0.00');

  const getItems = (): HTMLElement[] => {
    const explicit = Array.from(root.querySelectorAll<HTMLElement>('[data-dock-item]'));
    if (explicit.length > 0) return explicit;
    return Array.from(root.children).filter((el): el is HTMLElement => el instanceof HTMLElement);
  };

  const startLoop = () => {
    if (isRunning) return;
    isRunning = true;
    rAF = requestAnimationFrame(tick);
  };

  const tick = () => {
    const opts = { ...ANIMATED_TOP_DOCK_DEFAULTS, ...getOptions() };
    const proximity = opts.proximity ?? 122;
    const spring = opts.spring ?? 0.19;
    const damping = opts.damping ?? 0.7;
    const widthGrowth = opts.widthGrowth ?? 17;
    const heightGrowth = opts.heightGrowth ?? 16;
    const drop = opts.drop ?? 3.5;
    const axis = opts.axis ?? 'x';

    let maxInfluence = 0;
    const items = getItems();

    for (const item of items) {
      let state = stateMap.get(item);
      if (!state) {
        state = { currentVal: 0, velocity: 0, targetVal: 0 };
        stateMap.set(item, state);
      }

      if (item === document.activeElement || item.contains(document.activeElement)) {
        state.targetVal = 1;
      } else if (pointerActive) {
        const rect = item.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const mainDist = axis === 'y' ? Math.abs(pointerY - cy) : Math.abs(pointerX - cx);
        const crossDist = axis === 'y' ? Math.abs(pointerX - cx) : Math.abs(pointerY - cy);
        const crossThreshold = (axis === 'y' ? rect.width : rect.height) * 1.5 + 45;

        if (mainDist < proximity && crossDist < crossThreshold) {
          const mainFactor = Math.cos((mainDist / proximity) * (Math.PI / 2));
          const crossFactor = Math.cos((crossDist / crossThreshold) * (Math.PI / 2));
          state.targetVal = Math.max(0, mainFactor * crossFactor);
        } else {
          state.targetVal = 0;
        }
      } else {
        state.targetVal = 0;
      }

      // Spring physics
      const force = (state.targetVal - state.currentVal) * spring;
      state.velocity = (state.velocity + force) * damping;
      state.currentVal += state.velocity;

      if (
        Math.abs(state.currentVal) < 0.0003 &&
        Math.abs(state.velocity) < 0.0003 &&
        state.targetVal === 0
      ) {
        state.currentVal = 0;
        state.velocity = 0;
      }

      if (state.currentVal > maxInfluence) {
        maxInfluence = state.currentVal;
      }

      // Apply GPU-accelerated magnification transform
      if (state.currentVal > 0.0005) {
        const scaleX = 1 + (widthGrowth / 100) * state.currentVal;
        const scaleY = 1 + (heightGrowth / 100) * state.currentVal;
        const yDrop = drop * state.currentVal;

        item.style.transform = `translateY(${yDrop.toFixed(2)}px) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})`;
        item.style.transformOrigin = 'center top';
        item.style.willChange = 'transform';
        item.style.setProperty('--dock-val', state.currentVal.toFixed(3));
        item.style.setProperty('--dock-scale', scaleX.toFixed(3));
        item.style.setProperty('--dock-drop', `${yDrop.toFixed(2)}px`);
      } else {
        item.style.transform = '';
        item.style.willChange = 'auto';
        item.style.removeProperty('--dock-val');
        item.style.removeProperty('--dock-scale');
        item.style.removeProperty('--dock-drop');
      }
    }

    root.setAttribute('data-dock-state', maxInfluence > 0.01 ? 'active' : 'idle');
    root.setAttribute('data-dock-max', maxInfluence.toFixed(2));

    if (maxInfluence > 0.0003 || pointerActive) {
      rAF = requestAnimationFrame(tick);
    } else {
      isRunning = false;
    }
  };

  const onPointerMove = (e: PointerEvent | MouseEvent) => {
    const opts = { ...ANIMATED_TOP_DOCK_DEFAULTS, ...getOptions() };
    const proximity = opts.proximity ?? 122;
    const rootRect = root.getBoundingClientRect();

    const isNear =
      e.clientX >= rootRect.left - proximity &&
      e.clientX <= rootRect.right + proximity &&
      e.clientY >= rootRect.top - proximity &&
      e.clientY <= rootRect.bottom + proximity;

    if (isNear) {
      pointerX = e.clientX;
      pointerY = e.clientY;
      pointerActive = true;
      startLoop();
    } else if (pointerActive) {
      pointerActive = false;
      startLoop();
    }
  };

  const onPointerLeave = () => {
    if (pointerActive) {
      pointerActive = false;
      startLoop();
    }
  };

  const onFocusIn = () => {
    startLoop();
  };

  const onFocusOut = () => {
    startLoop();
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('blur', onPointerLeave);
  root.addEventListener('focusin', onFocusIn);
  root.addEventListener('focusout', onFocusOut);

  return () => {
    cancelAnimationFrame(rAF);
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('blur', onPointerLeave);
    root.removeEventListener('focusin', onFocusIn);
    root.removeEventListener('focusout', onFocusOut);

    const items = getItems();
    for (const item of items) {
      item.style.transform = '';
      item.style.willChange = 'auto';
      item.style.removeProperty('--dock-val');
      item.style.removeProperty('--dock-scale');
      item.style.removeProperty('--dock-drop');
    }
    root.removeAttribute('data-dock-state');
    root.removeAttribute('data-dock-max');
  };
}

export function useDockController(getOptions: () => TopDockOptions) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    return createTopDockController(root, getOptions);
  }, []);

  return rootRef;
}
