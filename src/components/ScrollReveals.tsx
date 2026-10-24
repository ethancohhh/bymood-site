import { useEffect } from 'react';

/** Révélation unique de chaque bloc ; un seul observer, sans dépendance. */
export function ScrollReveals() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const targets = Array.from(document.querySelectorAll<HTMLElement>(
      '.catalogue-card, .catalogue-note, .catalogue-end, .need-link, .renovation-pair-heading, .renovation-pair-grid > figure, .service-heading, .service-media, .service-description, .service-scope > div, .section-heading, .universe-link, .renovation-card, .study-card, .renovation-attribution, .study-gallery-note, .renovation-page > .renovation-image, .need-item, .other-ideas, .study-intro, .document-comparison > figure, .study-decisions > li, .study-foot, .secondary-study, .process-step, .method-detail, .team-intro, .team-grid > div, .contact-copy, .contact-form, .project-page-heading, .project-cover, .project-story > div, .project-decisions > .eyebrow, .project-decisions > h2, .source-note, .project-detail-photo, .project-end, .footer-top, .footer-bottom, .footer-note',
    )).filter(target => !(target.matches('.method-detail') && target.closest('.process-step')));
    const revealed = new Set<HTMLElement>();
    let observer: IntersectionObserver | undefined;

    function show(target: HTMLElement, immediate = false) {
      let delay = 0;
      const parent = target.parentElement;
      if (!immediate && parent?.matches('.catalogue-service-grid, .catalogue-renovation-grid, .needs-compact > div, .renovation-pair-grid, .service-layout, .service-scope, .universe-grid, .study-gallery, .needs-grid, .method-grid, .study-decisions, .document-comparison, .project-story')) {
        // Décalage uniquement pour les éléments d’une même ligne, pas en colonne mobile.
        const top = target.offsetTop;
        const row = Array.from(parent.children).filter(element => element instanceof HTMLElement && Math.abs(element.offsetTop - top) < 24);
        delay = Math.max(0, row.indexOf(target)) * 110;
      }
      target.style.setProperty('--reveal-delay', `${delay}ms`);
      if (immediate) target.classList.add('reveal-immediate');
      target.classList.remove('reveal-pending');
      revealed.add(target);
      observer?.unobserve(target);
    }

    function reset() {
      observer?.disconnect();
      targets.forEach(target => {
        target.classList.remove('reveal-pending', 'reveal-block', 'reveal-immediate');
        target.style.removeProperty('--reveal-delay');
      });
      if (preference.matches) return;
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
          show(entry.target as HTMLElement, !entry.isIntersecting);
        }
      }, { threshold: .08 });
      for (const target of targets) {
        // Le contenu déjà lu reste visible ; le hero a sa propre séquence CSS.
        if (!revealed.has(target) && target.getBoundingClientRect().top > window.innerHeight * .9) {
          target.classList.add('reveal-block', 'reveal-pending');
          observer.observe(target);
        } else {
          revealed.add(target);
        }
      }
    }
    const revealFocused = (event: FocusEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('.reveal-block') : null;
      // Un focus au pointeur pendant l’entrée ne doit pas déplacer le contrôle
      // entre pointerdown et pointerup et faire perdre le premier clic.
      if (target && (target.classList.contains('reveal-pending') || (event.target instanceof Element && event.target.matches(':focus-visible')))) show(target, true);
    };
    reset();
    preference.addEventListener('change', reset);
    document.addEventListener('focusin', revealFocused);
    return () => {
      observer?.disconnect();
      targets.forEach(target => {
        target.classList.remove('reveal-pending', 'reveal-block', 'reveal-immediate');
        target.style.removeProperty('--reveal-delay');
      });
      preference.removeEventListener('change', reset);
      document.removeEventListener('focusin', revealFocused);
    };
  }, []);
  return null;
}
