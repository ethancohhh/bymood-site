import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { getImageSize, Picture } from './ui';

type PhotoComparisonProps = { before: string; after: string; beforeAlt: string; afterAlt: string; title: string };

// Deux photos alignées superposées : la ligne verticale découvre l'avant à gauche, l'après à droite.
// Souris : clic ou glisser n'importe où ; tactile : glisser horizontalement (le défilement vertical
// reste libre) ; clavier : flèches, Origine et Fin sur la poignée.
export function PhotoComparison({ before, after, beforeAlt, afterAlt, title }: PhotoComparisonProps) {
  const [value, setValue] = useState(50);
  const [dragging, setDragging] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);
  const [width, height] = getImageSize(after);
  const move = (clientX: number) => {
    const box = viewport.current?.getBoundingClientRect();
    if (box?.width) setValue(Math.round(Math.min(100, Math.max(0, (clientX - box.left) / box.width * 100))));
  };
  const start = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    if (event.pointerType === 'mouse') move(event.clientX);
  };
  const keyboard = (event: KeyboardEvent<HTMLSpanElement>) => {
    const next = { ArrowLeft: value - 5, ArrowDown: value - 5, ArrowRight: value + 5, ArrowUp: value + 5, Home: 0, End: 100 }[event.key];
    if (next === undefined) return;
    event.preventDefault(); setValue(Math.min(100, Math.max(0, next)));
  };
  return <div className="comparison">
    <div ref={viewport} className={`comparison-viewport${dragging ? ' is-dragging' : ''}`} style={{ aspectRatio: `${width} / ${height}` }}
      onPointerDown={start} onPointerMove={event => { if (dragging) move(event.clientX); }}
      onPointerUp={() => setDragging(false)} onPointerCancel={() => setDragging(false)}>
      <Picture name={after} alt={afterAlt} sizes="(max-width: 767px) 100vw, 80vw" />
      <div className="comparison-before" style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}><Picture name={before} alt={beforeAlt} sizes="(max-width: 767px) 100vw, 80vw" /></div>
      <span className="comparison-line" style={{ left: `${value}%` }}>
        <span className="comparison-handle" role="slider" tabIndex={0} aria-label={`${title} : position de la ligne avant / après`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-valuetext={`${value} % de l’état avant visible`} onKeyDown={keyboard}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 6-6 6 6 6m6-12 6 6-6 6" stroke="currentColor" strokeWidth="1.5" /></svg>
        </span>
      </span>
      <span className="comparison-label before" aria-hidden="true">Avant</span><span className="comparison-label after" aria-hidden="true">Après</span>
    </div>
    <p className="comparison-hint">Faites glisser la ligne pour comparer l’avant et l’après.</p>
  </div>;
}
