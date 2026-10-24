import { sitePath } from '../urls';
import { useEffect, useRef, useState } from 'react';
import { brand, contact, navigation, site } from '../data';
import { Arrow } from './ui';

const catalogueSections = [
  { number: '01', title: 'Prestations réalisées', text: 'Transformations avant / après', anchor: 'renovation' },
  { number: '02', title: 'Inspirations', text: 'Idées d’aménagement', anchor: 'inspirations' },
  { number: '03', title: 'Conception & rendus 3D', text: 'Plans, volumes et études', anchor: 'conception-3d' },
];

export function Header({ home = true, currentPath = '' }: { home?: boolean; currentPath?: string }) {
  const [open, setOpen] = useState(false);
  const [catalogueOpen, setCatalogueOpen] = useState(false);
  const [active, setActive] = useState('accueil');
  const [enhanced, setEnhanced] = useState(false);
  const [mobile, setMobile] = useState(false);
  const nav = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const catalogue = useRef<HTMLDivElement>(null);
  const catalogueToggle = useRef<HTMLButtonElement>(null);
  const href = (id: string) => id.startsWith('/') ? id : `${home ? '' : '/'}#${id}`;
  const close = () => { setOpen(false); setCatalogueOpen(false); };
  const inCatalogue = currentPath === '/catalogue/' || /^\/(prestations|projets|renovation)\//.test(currentPath);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 900px)');
    const update = () => { setMobile(query.matches); setOpen(false); setCatalogueOpen(false); };
    update(); setEnhanced(true); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!home) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
    }, { rootMargin: '-15% 0px -65% 0px' });
    document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [home]);

  useEffect(() => {
    if (!open || !mobile) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    nav.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open, mobile]);

  useEffect(() => {
    if (!open && !catalogueOpen) return;
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (catalogueOpen && !mobile) { setCatalogueOpen(false); catalogueToggle.current?.focus(); }
        else { close(); toggle.current?.focus(); }
      }
      if (event.key === 'Tab' && open && mobile) {
        const elements = [toggle.current, ...Array.from(nav.current?.querySelectorAll<HTMLElement>('a, button') ?? [])]
          .filter((element): element is HTMLElement => !!element && element.getClientRects().length > 0 && !element.closest('[hidden]'));
        const first = elements[0]; const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !catalogue.current?.contains(event.target)) setCatalogueOpen(false); };
    document.addEventListener('keydown', keyboard); document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', keyboard); document.removeEventListener('pointerdown', outside); };
  }, [open, catalogueOpen, mobile]);

  return <>
    <a className="skip-link" href={sitePath('#main')} aria-label="En savoir plus — aller au contenu">En savoir plus</a>
    <header className={`header ${open ? 'menu-open' : ''}`}>
      <a className="brand" href={sitePath(href('accueil'))} aria-label={`${site.name}, accueil`}>
        <img className="brand-wordmark" src={sitePath('/brand/bymood-wordmark.png')} alt={site.name} width={2179} height={721} />
        <span className="brand-caption">{brand.signature}</span>
      </a>
      <button ref={toggle} className="menu-toggle" hidden={!enhanced} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>
        <span>{open ? 'Fermer' : 'Menu'}</span><span className="menu-lines" aria-hidden="true"><i /><i /></span>
      </button>
      <nav ref={nav} id="main-navigation" className={`navigation ${enhanced ? 'is-enhanced' : ''} ${open ? 'is-open' : ''}`} aria-label="Navigation principale" inert={enhanced && mobile && !open ? true : undefined}>
        <div className="catalogue-navigation" ref={catalogue} onBlur={event => {
          if (!mobile && !event.currentTarget.contains(event.relatedTarget as Node | null)) setCatalogueOpen(false);
        }}>
          <div className="catalogue-control"><a className="nav-catalogue" href={sitePath('/catalogue/')} aria-current={inCatalogue ? (currentPath === '/catalogue/' ? 'page' : 'location') : undefined} onClick={close}>Catalogue</a>
            <button ref={catalogueToggle} className="catalogue-toggle" hidden={!enhanced} type="button" aria-label="Rubriques du catalogue" aria-expanded={catalogueOpen} aria-controls="catalogue-navigation-links" onClick={() => setCatalogueOpen(!catalogueOpen)}><svg className="arrow" width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.4" /></svg></button>
          </div>
          <div id="catalogue-navigation-links" className="catalogue-panel" hidden={!mobile && !catalogueOpen}>
            {catalogueSections.map(section => <a key={section.anchor} href={sitePath(`/catalogue/#${section.anchor}`)} onClick={close}>
              <span className="catalogue-nav-number">{section.number}</span><span><span className="catalogue-nav-title">{section.title}</span><span className="catalogue-nav-description">{section.text}</span></span><Arrow diagonal />
            </a>)}
          </div>
        </div>
        {navigation.filter(([, id]) => id !== '/catalogue/').map(([label, id]) => <a key={id} href={sitePath(href(id))} aria-current={home && active === id ? 'location' : undefined} onClick={close}>{label}</a>)}
        <a className="nav-cta" href={sitePath(href('project-form'))} onClick={close}>{contact.cta}<Arrow diagonal /></a>
      </nav>
      <span className="header-ruler" aria-hidden="true" />
    </header>
    <noscript><nav className="navigation-fallback" aria-label="Navigation sans JavaScript">
      <a href={sitePath('/catalogue/')}>Catalogue</a>
      {catalogueSections.map(section => <a key={section.anchor} href={sitePath(`/catalogue/#${section.anchor}`)}>{section.title}</a>)}
      {navigation.filter(([, id]) => id !== '/catalogue/').map(([label, id]) => <a key={id} href={sitePath(href(id))}>{label}</a>)}
      <a href={sitePath(href('project-form'))}>{contact.cta}</a>
    </nav></noscript>
  </>;
}
