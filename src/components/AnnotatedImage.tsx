import { sitePath } from "../urls";
import { useEffect, useId, useRef, useState } from 'react';
import { Picture } from './ui';
import { Arrow } from './ui';

const annotations: Record<string, { x: number; y: number; title: string; text: string }[]> = {
  'haven-library': [
    { x: 39, y: 71, title: 'Rangements fermés', text: 'Les placards bas regroupent les objets que l’on souhaite garder hors de vue.' },
    { x: 47, y: 36, title: 'Étagères éclairées', text: 'Les étagères et leur éclairage mettent en valeur les livres et les objets.' },
    { x: 63, y: 85, title: 'Coin lecture', text: 'Le fauteuil, le pouf et la table délimitent un usage au sein de la pièce ouverte.' },
  ],
  'haven-bedroom': [
    { x: 51, y: 58, title: 'Bureau près de la fenêtre', text: 'Le bureau prend place devant la fenêtre, dans le prolongement du mobilier.' },
    { x: 81, y: 67, title: 'Rangements regroupés', text: 'Tiroirs, étagère et penderie occupent un même pan de mur.' },
    { x: 50, y: 85, title: 'Passage entre les usages', text: 'Le plan et les dimensions permettent d’examiner le passage entre le lit, le bureau et les rangements.' },
  ],
  'nemeto-stairs': [
    { x: 83, y: 60, title: 'Liaison entre les niveaux', text: 'L’escalier s’appuie sur le volume central et relie les différents niveaux de l’étude.' },
    { x: 24, y: 52, title: 'Filtre en bois', text: 'Les éléments verticaux en bois marquent une limite tout en laissant des vues entre les espaces.' },
    { x: 51, y: 68, title: 'Mobilier d’entrée', text: 'Une console et un miroir accompagnent la circulation au pied du volume central.' },
  ],
};

export function AnnotatedImage({ name, alt, group, caption }: { name: string; alt: string; group: string; caption: string }) {
  const id = useId();
  const details = useRef<(HTMLDetailsElement | null)[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  const points = annotations[name] ?? [];
  return <div className="annotated-image">
    <div className="annotated-stage">
      <a href={sitePath(`/images/${name}-1600.webp`)} target="_blank" rel="noopener" data-viewer={group} data-alt={alt} data-caption={caption} aria-label={`Agrandir : ${caption}`}><Picture name={name} alt={alt} /></a>
      {points.map((point, index) => <button key={point.title} type="button" className="image-pin" hidden={!ready} style={{ left: `${point.x}%`, top: `${point.y}%` }} aria-label={`Repère ${index + 1} : ${point.title}`} aria-controls={`${id}-${index}`} aria-expanded={active === index} onClick={() => {
        const next = active === index ? null : index;
        details.current.forEach((element, position) => { if (element) element.open = position === next; });
        setActive(next);
      }}>{index + 1}</button>)}
    </div>
    {points.length > 0 && <div className="annotation-notes" aria-label="Les choix visibles dans cette étude"><div className="annotation-heading"><p>Les choix de cette étude</p><a className="text-link" href={sitePath(`/images/${name}-1600.webp`)} target="_blank" rel="noopener" data-viewer={group} data-alt={alt} data-caption={caption}>Agrandir<Arrow diagonal /></a></div>{points.map((point, index) => <details key={point.title} ref={element => { details.current[index] = element; }} id={`${id}-${index}`} onToggle={event => {
      if (event.currentTarget.open) { details.current.forEach((element, position) => { if (element && position !== index) element.open = false; }); setActive(index); }
      else setActive(value => value === index ? null : value);
    }}><summary><span><span className="annotation-number">0{index + 1}</span>{point.title}</span><Arrow /></summary><p>{point.text}</p></details>)}</div>}
  </div>;
}
