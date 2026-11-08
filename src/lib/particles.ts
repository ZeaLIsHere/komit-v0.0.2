/**
 * Trigger helper untuk mengumpulkan atau mengembalikan partikel hero
 */
export function triggerParticleCollapse(active: boolean) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('komit:collapse-particles', {
      detail: { active },
    })
  );
}
