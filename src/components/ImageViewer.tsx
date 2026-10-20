import { useEffect, useRef, useState } from 'react';

type ImageItem = { src: string; alt: string; caption: string };

/** Les liens restent utilisables sans JS ; dialog gère le focus et l’arrière-plan inerte. */
export function ImageViewer() {
  const dialog = useRef<HTMLDialogElement>(null);
  const origin = useRef<HTMLAnchorElement | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [failed, setFailed] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const image = images[index];

  useEffect(() => {
    const open = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[data-viewer]') : null;
      if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !dialog.current?.showModal) return;
      event.preventDefault();
      origin.current = link;
      const group = link.dataset.viewer;
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[data-viewer]'))
        .filter(candidate => candidate.dataset.viewer === group)
        .sort((a, b) => Number(a.dataset.viewerOrder || 0) - Number(b.dataset.viewerOrder || 0))
        .filter((candidate, position, all) => all.findIndex(other => other.href === candidate.href) === position);
      setImages(links.map(candidate => ({ src: candidate.href, alt: candidate.dataset.alt || candidate.querySelector('img')?.alt || '', caption: candidate.dataset.caption || candidate.querySelector('img')?.alt || '' })));
      setIndex(Math.max(0, links.findIndex(candidate => candidate.href === link.href)));
      setZoom(false); setFailed(false);
      dialog.current.showModal();
    };
    document.addEventListener('click', open);
    return () => document.removeEventListener('click', open);
  }, []);

  useEffect(() => {
    if (!image) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; };
  }, [!!image]);

  function close() {
    dialog.current?.close();
    setImages([]); setZoom(false);
    origin.current?.focus({ preventScroll: true });
  }
  function move(direction: number) {
    setIndex(current => (current + direction + images.length) % images.length);
    setZoom(false); setFailed(false);
    stage.current?.scrollTo(0, 0);
  }

  return <dialog ref={dialog} className="image-viewer" aria-labelledby="viewer-title" aria-describedby="viewer-caption" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }} onKeyDown={event => {
    if (!zoom && images.length > 1 && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
  }}>
    <div className="viewer-shell">
      <div className="viewer-toolbar"><h2 id="viewer-title">Les détails du projet</h2><div><button type="button" onClick={() => setZoom(value => !value)} aria-pressed={zoom} disabled={!image || failed}>{zoom ? 'Vue entière' : 'Zoomer'}</button><button type="button" autoFocus onClick={close} aria-label="Fermer la visionneuse">Fermer <span aria-hidden="true">×</span></button></div></div>
      <div ref={stage} className={`viewer-stage ${zoom ? 'is-zoomed' : ''}`} tabIndex={zoom ? 0 : undefined} aria-label={zoom ? 'Image agrandie, défilement disponible' : undefined}>
        {image && !failed && <img key={image.src} src={image.src} alt={image.alt} onError={() => setFailed(true)} />}
        {failed && <p>L’image ne peut pas être chargée. <a href={image?.src} target="_blank" rel="noopener">Ouvrir le fichier</a></p>}
      </div>
      <div className="viewer-bottom"><p id="viewer-caption" aria-live="polite">{image?.caption}</p>{images.length > 1 && <div className="viewer-pagination"><button type="button" onClick={() => move(-1)} aria-label="Image précédente">←</button><span>{index + 1} / {images.length}</span><button type="button" onClick={() => move(1)} aria-label="Image suivante">→</button></div>}</div>
    </div>
  </dialog>;
}
