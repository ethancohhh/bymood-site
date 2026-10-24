import { sitePath } from "../urls";
import { useEffect, useRef, useState } from 'react';
import { brand, contact, navigation, site } from '../data';
import { Arrow } from './ui';

export function Header({ home = true, currentPath = '' }: { home?: boolean; currentPath?: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('accueil');
  const nav = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 1179px)');
    const update = () => setMobile(query.matches);
    update(); setEnhanced(true); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const href = (id: string) => id.startsWith('/') ? id : `${home ? '' : '/'}#${id}`;

  useEffect(() => {
    if (!home) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
    }, { rootMargin: '-15% 0px -70% 0px' });
    document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [home]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    nav.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); }
      if (event.key === 'Tab') {
        const elements = [toggle.current, ...Array.from(nav.current?.querySelectorAll<HTMLAnchorElement>('a') ?? [])].filter(Boolean) as HTMLElement[];
        const first = elements[0]; const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    const resize = () => { if (window.innerWidth >= 1180) setOpen(false); };
    window.addEventListener('keydown', keyboard); window.addEventListener('resize', resize);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', keyboard); window.removeEventListener('resize', resize); };
  }, [open]);

  return <>
    <a className="skip-link" href={sitePath("#main")} aria-label="En savoir plus — aller au contenu">En savoir plus</a>
    <header className={`header ${open ? 'menu-open' : ''}`}>
      <a className="brand" href={sitePath(href('accueil'))} aria-label={`${site.name}, accueil`}><span className="brand-caption">{brand.signature}</span><img className="brand-wordmark" src={sitePath("/brand/bymood-wordmark.png")} alt={site.name} width={2179} height={721} /></a>
      <button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}><span>{open ? 'Fermer' : 'Menu'}</span><span className="menu-lines" aria-hidden="true"><i /><i /></span></button>
      <nav ref={nav} id="main-navigation" className={`navigation ${enhanced ? 'is-enhanced' : ''} ${open ? 'is-open' : ''}`} aria-label="Navigation principale" inert={enhanced && mobile && !open ? true : undefined}>
        {navigation.map(([label, id]) => <a key={id} className={id === '/catalogue/' ? 'nav-catalogue' : undefined} href={sitePath(href(id))} aria-current={id.startsWith('/') ? (currentPath === id ? 'page' : (id === '/catalogue/' && /^\/(prestations|projets|renovation)\//.test(currentPath) ? 'location' : undefined)) : (home && active === id ? 'location' : undefined)} onClick={() => setOpen(false)}>{label}{id === '/catalogue/' && <Arrow diagonal />}</a>)}
        <a className="nav-cta" href={sitePath(href('project-form'))} onClick={() => setOpen(false)}>{contact.cta}<Arrow diagonal /></a>
      </nav>
    </header>
  </>;
}
