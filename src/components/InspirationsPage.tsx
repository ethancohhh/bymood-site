import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { sitePath } from '../urls';
import { inspirationSource, pad, universes, type InspirationImage, type Universe } from '../inspirations';
import { Header } from './Header';
import { Footer } from './Footer';

// Même direction artistique et même structure que catalogue.bymood.fr (catalogue/app.js et
// styles.css) : tracés de fond, bandeaux, grille de variantes et visionneuse sombre.
const plural = (count: number) => `${pad(count)} variante${count > 1 ? 's' : ''}`;

function srcSet(universe: Universe, image: InspirationImage) {
  // Une source plus étroite que la largeur demandée n'a pas été agrandie : sa largeur réelle sert de descripteur.
  return ([800, 1600] as const).map(width => `${sitePath(inspirationSource(universe, image, width))} ${Math.min(width, image.largeurSource)}w`).join(', ');
}

function Trace() {
  return <svg className="trace" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <g fill="none" stroke="currentColor">
      <path style={{ '--d': '.1s' } as CSSProperties} pathLength={1} d="M168 0V900" />
      <path style={{ '--d': '.5s' } as CSSProperties} pathLength={1} d="M0 168H1440" />
      <path style={{ '--d': '.9s' } as CSSProperties} pathLength={1} d="M1272 900V0" />
      <path style={{ '--d': '1.4s' } as CSSProperties} pathLength={1} d="M1272 168A300 300 0 0 0 972 468" />
      <path style={{ '--d': '1.8s' } as CSSProperties} pathLength={1} className="trace__dash" d="M168 168L1272 868" />
      <path style={{ '--d': '2.2s' } as CSSProperties} pathLength={1} d="M168 132H560M168 124V140M560 124V140" />
      <path style={{ '--d': '2.6s' } as CSSProperties} pathLength={1} d="M1160 900V772A112 112 0 0 1 1384 772V900" />
      <path style={{ '--d': '3s' } as CSSProperties} pathLength={1} d="M1272 168m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" />
      <path style={{ '--d': '3.2s' } as CSSProperties} pathLength={1} d="M168 168m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" />
      <path style={{ '--d': '3.4s' } as CSSProperties} pathLength={1} d="M972 462V474M966 468H978M560 862V874M554 868H566M1272 542V554M1266 548H1278" />
    </g>
  </svg>;
}

export function InspirationsPage() {
  return <><Header home={false} currentPath="/inspirations/" /><main id="main" className="inspirations inspirations--home">
    <Trace />
    <section className="intro">
      <div className="intro__copy page-enter">
        <h1>Inspirations</h1>
        <p>Choisissez un univers pour découvrir ses différentes variantes de style. Ces photos sont des inspirations, pas des réalisations bymood.</p>
      </div>
    </section>
    <ul className="bands page-enter">{universes.map((universe, index) => <li className="band" key={universe.slug}>
      <a className="band__link" href={sitePath(`/inspirations/${universe.slug}/`)}>
        {universe.couverture && <img className="band__img" src={sitePath(inspirationSource(universe, universe.couverture, 1600))} srcSet={srcSet(universe, universe.couverture)} sizes="(max-width: 1100px) 100vw, 1040px" alt="" loading={index > 1 ? 'lazy' : undefined} decoding="async" />}
        <span className="band__index">{pad(index + 1)}</span>
        <span className="band__count">{plural(universe.variantes.length)}</span>
        <span className="band__title"><span>{universe.titre}</span></span>
      </a>
    </li>)}</ul>
  </main><Footer /></>;
}

function Viewer({ universe, index, onMove, onClose }: { universe: Universe; index: number | null; onMove: (index: number) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const count = universe.variantes.length;
  const variant = index === null ? null : universe.variantes[index];
  const move = (step: number) => { if (index !== null) onMove((index + step + count) % count); };

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (index !== null && !element.open) element.showModal();
    if (index === null && element.open) element.close();
  }, [index]);

  return <dialog ref={dialog} className="viewer" aria-label="Visionneuse" onClose={onClose}
    onClick={event => { if (event.target === event.currentTarget || (event.target as Element).classList.contains('viewer__figure')) onClose(); }}
    onKeyDown={event => { if (event.key === 'ArrowLeft') move(-1); if (event.key === 'ArrowRight') move(1); }}
    onTouchStart={event => { touchX.current = event.touches[0].clientX; }}
    onTouchEnd={event => {
      // Balayage sur tablette et téléphone.
      if (touchX.current === null) return;
      const delta = event.changedTouches[0].clientX - touchX.current;
      if (Math.abs(delta) > 50 && count > 1) move(delta < 0 ? 1 : -1);
      touchX.current = null;
    }}>
    <figure className="viewer__figure">
      {variant && <img className="viewer__img" src={sitePath(inspirationSource(universe, variant, 1600))} alt={variant.legende} />}
      {variant && <figcaption className="viewer__caption"><span className="label">Variante {pad(index! + 1)} / {pad(count)}</span>{variant.legende}</figcaption>}
    </figure>
    <button className="viewer__btn viewer__close" type="button" aria-label="Fermer" onClick={onClose}>Fermer</button>
    <button className="viewer__btn viewer__prev" type="button" aria-label="Variante précédente" hidden={count < 2} onClick={() => move(-1)}>←</button>
    <button className="viewer__btn viewer__next" type="button" aria-label="Variante suivante" hidden={count < 2} onClick={() => move(1)}>→</button>
  </dialog>;
}

export function InspirationUniversePage({ universe }: { universe: Universe }) {
  const position = universes.indexOf(universe);
  const next = universes[(position + 1) % universes.length];
  const [open, setOpen] = useState<number | null>(null);
  const origin = useRef<HTMLElement | null>(null);
  const close = () => { setOpen(null); origin.current?.focus({ preventScroll: true }); };

  return <><Header home={false} currentPath={`/inspirations/${universe.slug}/`} /><main id="main" className="inspirations">
    <Trace />
    <article className="category page-enter">
      <a className="back" href={sitePath('/inspirations/')}><span aria-hidden="true">←</span> Tous les univers</a>
      <header className="category__head">
        <h1>{universe.titre}</h1>
        <p>{universe.accroche}</p>
        <span className="label">{pad(position + 1)} — {plural(universe.variantes.length)}</span>
      </header>
      <div className="grid">{universe.variantes.map((variant, index) => <figure className="variant" key={variant.id}>
        {/* Lien vers l'image : sans JavaScript, elle s'ouvre seule ; avec, la visionneuse prend le relais. */}
        <a className="variant__btn" href={sitePath(inspirationSource(universe, variant, 1600))} aria-label={`Agrandir la variante ${pad(index + 1)}`} onClick={event => {
          if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault(); origin.current = event.currentTarget; setOpen(index);
        }}>
          <img src={sitePath(inspirationSource(universe, variant, 800))} srcSet={srcSet(universe, variant)} sizes="(max-width: 767px) 100vw, 33vw" width={800} height={Math.round(800 / variant.ratio)} alt={variant.legende} loading={index < 3 ? 'eager' : 'lazy'} decoding="async" />
        </a>
        <figcaption><span className="label">Variante {pad(index + 1)}</span>{variant.legende && <span>{variant.legende}</span>}</figcaption>
      </figure>)}</div>
      {next !== universe && <nav className="nextcat" aria-label="Univers suivant">
        <span className="label">Univers suivant</span>
        <a href={sitePath(`/inspirations/${next.slug}/`)}>{next.titre} <span aria-hidden="true">→</span></a>
      </nav>}
    </article>
    <Viewer universe={universe} index={open} onMove={setOpen} onClose={close} />
  </main><Footer /></>;
}
