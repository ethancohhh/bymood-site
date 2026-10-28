import { sitePath } from "../urls";
import { useId, useState } from 'react';
import { getImageSize } from './ui';
import { AnnotatedImage } from './AnnotatedImage';

type ComparisonProps = { before: string; after: string; beforeAlt: string; afterAlt: string; beforeLabel: string; afterLabel: string; mode?: 'before-after' | 'plan-render'; documentLabels?: [string, string]; group?: string; afterName?: string };

// Les labels proviennent des données : une étude n’est jamais appelée « avant/après chantier ».
export function BeforeAfter({ before, after, beforeAlt, afterAlt, beforeLabel, afterLabel, mode = 'before-after', documentLabels, group = 'documents', afterName }: ComparisonProps) {
  const [value, setValue] = useState(50);
  const id = useId();
  if (mode === 'plan-render') return <div className="document-comparison">
    {[{ image: before, alt: beforeAlt, label: beforeLabel }, { image: after, alt: afterAlt, label: afterLabel }].map((document, index) => <figure key={document.image} className={index === 0 ? 'plan-document' : 'render-document'}>
      {index === 1 && afterName ? <AnnotatedImage name={afterName} alt={document.alt} group={group} caption={`${document.label} · Conception Aliriza Bay`} /> : <a href={sitePath(document.image)} target="_blank" rel="noopener" data-viewer={group} data-alt={document.alt} data-caption={`${document.label} · Conception Aliriza Bay`} aria-label={documentLabels?.[index] ?? `Agrandir : ${document.label}`}><img src={sitePath(document.image)} alt={document.alt} width={getImageSize(document.image)[0]} height={getImageSize(document.image)[1]} loading="lazy" decoding="async" /></a>}
      <figcaption><span>{document.label}</span><a href={sitePath(document.image)} target="_blank" rel="noopener" data-viewer={group} data-alt={document.alt} data-caption={`${document.label} · Conception Aliriza Bay`}>Agrandir</a></figcaption>
    </figure>)}
  </div>;
  return <div className={`comparison ${mode}`}>
    <div className="comparison-viewport">
      <img src={sitePath(after)} alt={afterAlt} width="1600" height="1000" loading="lazy" />
      <div className="comparison-before" style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}><img src={sitePath(before)} alt={beforeAlt} width="1600" height="1000" loading="lazy" /></div>
      <span className="comparison-line" style={{ left: `${value}%` }} aria-hidden="true"><span>‹ ›</span></span>
      <span className="comparison-label before">{beforeLabel}</span><span className="comparison-label after">{afterLabel}</span>
    </div>
    <div className="comparison-control"><label htmlFor={id}>Explorer la transformation avant / après</label><input id={id} type="range" min="0" max="100" value={value} onChange={event => setValue(Number(event.target.value))} aria-valuetext={`${value} % de l’état avant visible`} /></div>
  </div>;
}
