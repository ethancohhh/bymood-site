import { useEffect, type RefObject } from 'react';

// Mouvements liés au visiteur, sur écran large avec souris uniquement : légère parallaxe
// selon la profondeur des calques et niveaux qui se resserrent quand le hero quitte l'écran.
// Les animations continues sont suspendues hors écran. Rien ne bouge si le mouvement est réduit.
export function useHeroMotion(ref: RefObject<SVGSVGElement | null>) {
  useEffect(() => {
    const svg = ref.current;
    const hero = svg?.closest('section');
    if (!svg || !hero) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)');
    let frame = 0, mx = 0, my = 0, close = 0;
    const active = () => !reduce.matches && desktop.matches;
    const apply = () => {
      frame = 0;
      svg.style.setProperty('--mx', mx.toFixed(3));
      svg.style.setProperty('--my', my.toFixed(3));
      svg.style.setProperty('--close', close.toFixed(3));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(apply); };
    const onPointer = (event: PointerEvent) => {
      if (!active()) return;
      const box = hero.getBoundingClientRect();
      mx = Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width - 0.5) * 2));
      my = Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height - 0.5) * 2));
      schedule();
    };
    const onLeave = () => { mx = my = 0; schedule(); };
    const onScroll = () => {
      const box = hero.getBoundingClientRect();
      close = active() ? Math.max(0, Math.min(0.5, -box.top / box.height)) : 0;
      schedule();
    };
    const onChange = () => { if (!active()) { mx = my = close = 0; schedule(); } else onScroll(); };
    const visibility = new IntersectionObserver(([entry]) => svg.classList.toggle('is-paused', !entry.isIntersecting));
    visibility.observe(svg);
    hero.addEventListener('pointermove', onPointer);
    hero.addEventListener('pointerleave', onLeave);
    addEventListener('scroll', onScroll, { passive: true });
    reduce.addEventListener('change', onChange);
    desktop.addEventListener('change', onChange);
    onScroll();
    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      hero.removeEventListener('pointermove', onPointer);
      hero.removeEventListener('pointerleave', onLeave);
      removeEventListener('scroll', onScroll);
      reduce.removeEventListener('change', onChange);
      desktop.removeEventListener('change', onChange);
    };
  }, [ref]);
}
