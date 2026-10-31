import { sitePath } from "../urls";
import { getImageSize } from './ui';
import { AnnotatedImage } from './AnnotatedImage';

type ComparisonProps = { before: string; after: string; beforeAlt: string; afterAlt: string; beforeLabel: string; afterLabel: string; documentLabels?: [string, string]; group?: string; afterName?: string };

// Les labels proviennent des données : une étude n’est jamais appelée « avant/après chantier ».
export function BeforeAfter({ before, after, beforeAlt, afterAlt, beforeLabel, afterLabel, documentLabels, group = 'documents', afterName }: ComparisonProps) {
  return <div className="document-comparison">
    {[{ image: before, alt: beforeAlt, label: beforeLabel }, { image: after, alt: afterAlt, label: afterLabel }].map((document, index) => <figure key={document.image} className={index === 0 ? 'plan-document' : 'render-document'}>
      {index === 1 && afterName ? <AnnotatedImage name={afterName} alt={document.alt} group={group} caption={`${document.label} · Conception Aliriza Bay`} /> : <a href={sitePath(document.image)} target="_blank" rel="noopener" data-viewer={group} data-alt={document.alt} data-caption={`${document.label} · Conception Aliriza Bay`} aria-label={documentLabels?.[index] ?? `Agrandir : ${document.label}`}><img src={sitePath(document.image)} alt={document.alt} width={getImageSize(document.image)[0]} height={getImageSize(document.image)[1]} loading="lazy" decoding="async" /></a>}
      <figcaption><span>{document.label}</span><a href={sitePath(document.image)} target="_blank" rel="noopener" data-viewer={group} data-alt={document.alt} data-caption={`${document.label} · Conception Aliriza Bay`}>Agrandir</a></figcaption>
    </figure>)}
  </div>;
}
