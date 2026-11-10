import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createTopDockController, type TopDockOptions, ANIMATED_TOP_DOCK_DEFAULTS } from './topDockController';

export const ANIMATED_TOP_DOCK_VARIANTS = ['sable', 'modern', 'retro', 'glass'] as const;
export type AnimatedTopDockVariant = (typeof ANIMATED_TOP_DOCK_VARIANTS)[number];

export type AnimatedTopDockProps = {
  variant?: AnimatedTopDockVariant;
  proximity?: number;
  spring?: number;
  damping?: number;
  widthGrowth?: number;
  heightGrowth?: number;
  drop?: number;
  pixelSize?: number;
  speed?: number;
  noise?: number;
  levels?: number;
  scanlines?: number;
  particles?: number;
  thickness?: number;
  dispersion?: number;
  specular?: number;
  rim?: number;
  drift?: number;
  className?: string;
};

type DockItem = { id: string; label: string; icon: ReactNode };

const ITEMS: readonly DockItem[] = [
  { id: 'system', label: 'SYSTEM', icon: <><rect x="2.25" y="2.25" width="4.5" height="4.5" rx=".8" /><rect x="9.25" y="2.25" width="4.5" height="4.5" rx=".8" /><rect x="2.25" y="9.25" width="4.5" height="4.5" rx=".8" /><rect x="9.25" y="9.25" width="4.5" height="4.5" rx=".8" /></> },
  { id: 'method', label: 'METHOD', icon: <><circle cx="3" cy="8" r="1.5" /><circle cx="12.5" cy="3.5" r="1.5" /><circle cx="12.5" cy="12.5" r="1.5" /><path d="M4.5 7.3 11 4.2M4.5 8.7l6.5 3.1" /></> },
  { id: 'work', label: 'WORK', icon: <><rect x="2" y="3" width="12" height="10" rx="1.5" /><path d="M2 6h12M5 4.5h.01M7 4.5h.01" /></> },
  { id: 'access', label: 'ACCESS', icon: <><circle cx="5.2" cy="6.2" r="2.7" /><path d="m7.2 8.2 5.9 5.1M10.2 10.8l1.5-1.5M12 12.4l1.4-1.4" /></> },
  { id: 'notes', label: 'NOTES', icon: <><path d="M4 2.25h5.4L12 4.85v8.9H4z" /><path d="M9.25 2.25V5h2.7M6 8h4M6 10.5h4" /></> },
];

const MODERN_ITEMS: readonly DockItem[] = [
  { id: 'product', label: 'Product', icon: <><path d="M8 1.9 14.1 5v6L8 14.1 1.9 11V5z" /><path d="M1.9 5 8 8.1 14.1 5M8 8.1v6" /></> },
  { id: 'solutions', label: 'Solutions', icon: <><path d="M8 1.9 14.4 5.6 8 9.3 1.6 5.6z" /><path d="m2.6 8 5.4 3.1L13.4 8M2.6 10.7 8 13.8l5.4-3.1" /></> },
  { id: 'docs', label: 'Docs', icon: <><path d="M3.4 2.4h5.4l3.8 3.8v7.4H3.4z" /><path d="M8.8 2.4v3.8h3.8M5.9 9h4.2M5.9 11.2h3" /></> },
  { id: 'pricing', label: 'Pricing', icon: <><path d="M8.6 2.2H13v4.4l-6.6 6.6a1.2 1.2 0 0 1-1.7 0L2.2 10.5a1.2 1.2 0 0 1 0-1.7z" /><circle cx="10.6" cy="4.6" r=".9" /></> },
  { id: 'changelog', label: 'Changelog', icon: <><circle cx="8" cy="8" r="5.9" /><path d="M8 4.6V8l2.4 1.5" /></> },
];

const BRAND_MARK = (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5">
    <rect width="24" height="24" rx="4.5" fill="#E8E8E3" />
    <path d="M6 6h8.6L18 9.35v8.15H9.15L6 14.35V6Z" fill="#111" />
    <path d="M9 9h5.15L15 9.85V15H9.85L9 14.15V9Z" fill="#E8E8E3" />
    <path d="M12 9v6M9 12h6" stroke="#111" strokeWidth=".7" />
  </svg>
);

function useDock(getOptions: () => TopDockOptions) {
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    return createTopDockController(root, getOptions);
  }, []);
  return rootRef;
}

export function AnimatedTopDock({ className = '', ...props }: AnimatedTopDockProps) {
  const optionsRef = useRef({ ...ANIMATED_TOP_DOCK_DEFAULTS, ...props });
  optionsRef.current = { ...ANIMATED_TOP_DOCK_DEFAULTS, ...props };
  const variant = optionsRef.current.variant || 'modern';
  const items = variant === 'modern' ? MODERN_ITEMS : ITEMS;
  const [active, setActive] = useState(items[0].id);

  const rootRef = useDock(() => ({
    ...optionsRef.current,
    axis: 'x' as const,
    lockTrack: true,
  }));

  return (
    <header className={`sticky top-5 z-50 w-full max-w-[1160px] mx-auto px-4 sm:px-6 ${className}`}>
      <div className="h-[60px] bg-white/[0.04] backdrop-blur-xl border border-white/15 rounded-full px-5 flex items-center justify-between gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="w-5 h-5" aria-hidden="true">{BRAND_MARK}</span>
          <span className="text-[17px] font-medium tracking-tight text-white font-sans">
            Lumina
          </span>
        </div>

        <nav
          ref={rootRef}
          className="hidden lg:flex items-center gap-6 text-[14px] text-white/75 font-normal"
          aria-label="Primary"
          data-dock-state="idle"
          data-dock-max="0.00"
        >
          {items.map((item) => (
            <button
              key={item.id}
              data-dock-item
              type="button"
              aria-pressed={active === item.id}
              onClick={() => setActive(item.id)}
              className="px-3 py-1.5 rounded-full inline-flex items-center gap-2 text-white/75 hover:text-white transition-colors duration-150"
            >
              <span className="w-4 h-4 fill-current shrink-0" aria-hidden="true">
                <svg viewBox="0 0 16 16" className="w-full h-full fill-none stroke-current stroke-[1.2]">
                  {item.icon}
                </svg>
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button type="button" className="text-[13px] text-white/75 hover:text-white px-3 py-1.5 rounded-full">
            Sign in
          </button>
          <button type="button" className="btn-white-pill text-[13px] px-5 py-2 rounded-full">
            Start building
          </button>
        </div>
      </div>
    </header>
  );
}
