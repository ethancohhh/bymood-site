import { sitePath } from "../urls";
import type { Renovation } from '../data';
import { Arrow, Picture } from './ui';

export function RenovationGallery({ renovation }: { renovation: Renovation }) {
  return <div className="renovation-gallery">{renovation.pairs?.map((pair, index) => <section className="renovation-pair" id={`vue-${index + 1}`} aria-labelledby={`vue-title-${index + 1}`} key={pair.title}>
    <div className="renovation-pair-heading"><span className="eyebrow">0{index + 1} · Avant / après</span><h2 id={`vue-title-${index + 1}`}>{pair.title}</h2><p>{pair.description}</p></div>
    <div className="renovation-pair-grid">{(['before', 'after'] as const).map((state, position) => {
      const photo = pair[state];
      const label = state === 'before' ? 'Avant' : 'Après';
      const caption = `${renovation.title} · ${pair.title} · ${label} · Prestation réalisée`;
      const viewer = { 'data-viewer': renovation.slug, 'data-viewer-order': index * 2 + position, 'data-alt': photo.alt, 'data-caption': caption };
      return <figure key={state}>
        <figcaption><span>{label}</span><a className="text-link" href={sitePath(`/images/${photo.image}-1600.webp`)} target="_blank" rel="noopener" {...viewer}>Agrandir<span className="sr-only"> : {pair.title}, {label.toLowerCase()}</span><Arrow diagonal /></a></figcaption>
        <a className="pair-media" href={sitePath(`/images/${photo.image}-1600.webp`)} target="_blank" rel="noopener" {...viewer} aria-label={`Agrandir : ${pair.title}, ${label.toLowerCase()}`}><Picture name={photo.image} alt={photo.alt} sizes="(max-width: 767px) 100vw, 50vw" /></a>
      </figure>;
    })}</div>
  </section>)}</div>;
}
