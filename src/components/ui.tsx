import { sitePath } from "../urls";
import type { ReactNode } from 'react';
import imageDimensions from '../image-dimensions.json';

export function getImageSize(source: string): number[] {
  const name = source.split('/').pop()?.replace(/-(?:800|1600)\.webp$/, '') ?? source;
  return imageDimensions[name as keyof typeof imageDimensions] ?? [1600, 1000];
}

export function Arrow({ diagonal = false, className = '' }: { diagonal?: boolean; className?: string }) {
  return <svg className={`arrow ${className}`} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.4" /></svg>;
}

export function SectionTitle({ number, label, children, text }: { number: string; label: string; children: ReactNode; text?: string }) {
  return <div className="section-heading"><div className="eyebrow"><span>{number}</span>{label}</div><div className="heading-content"><h2>{children}</h2>{text && <p>{text}</p>}</div></div>;
}

export function Picture({ name, alt, className = '', eager = false, sizes = '(max-width: 767px) 100vw, 50vw' }: { name: string; alt: string; className?: string; eager?: boolean; sizes?: string }) {
  const [width, height] = getImageSize(name);
  const srcSet = width > 800 ? `${sitePath(`/images/${name}-800.webp`)} 800w, ${sitePath(`/images/${name}-1600.webp`)} ${width}w` : undefined;
  return <img className={className} src={sitePath(`/images/${name}-1600.webp`)} srcSet={srcSet} sizes={sizes} alt={alt} width={width} height={height} loading={eager ? 'eager' : 'lazy'} decoding="async" fetchPriority={eager ? 'high' : 'auto'} />;
}
