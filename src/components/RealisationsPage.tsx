import { sitePath } from "../urls";
import { useEffect } from 'react';
import { contact, projects, renovations } from '../data';
import { exampleServices } from '../demo-content';
import { Header } from './Header';
import { Footer } from './Footer';
import { Arrow, Picture, SectionTitle } from './ui';
import { ScrollReveals } from './ScrollReveals';
import { ArchitecturalDrawing } from './ArchitecturalDrawing';
import { ConceptCubes } from './ConceptCubes';

export function RealisationsPage() {
  // Arrivée depuis le bouton « Nos réalisations » de l'accueil : défilement vers la section.
  useEffect(() => {
    let target: string | null = null;
    try { target = sessionStorage.getItem('realisations-scroll'); sessionStorage.removeItem('realisations-scroll'); } catch { return; }
    const section = target && document.getElementById(target);
    if (!section) return;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => {
      section.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
      history.replaceState(null, '', '#' + target);
    }, smooth ? 400 : 0);
    return () => window.clearTimeout(timer);
  }, []);
  return <><Header home={false} currentPath="/realisations/" /><main id="main" className="catalogue-page">
    <div className="container catalogue-intro">
      <ArchitecturalDrawing className="catalogue-drawing" />
      <a className="text-link" href={sitePath("/")}><Arrow />Retour à l’accueil</a>
      <span className="eyebrow">Réalisations · Aménagement & rénovation</span>
      <h1>Nos réalisations,<br />du rendu 3D au chantier.</h1>
      <p>Découvrez les prestations réalisées, puis nos études conceptuelles 3D : des aménagements et des projets complets en plans et rendus. Pour trouver un style, parcourez aussi nos <a href={sitePath('/inspirations/')}>inspirations par pièce</a>.</p>
      <nav className="catalogue-index" aria-label="Rubriques des réalisations"><a href={sitePath("#renovation")}>Prestations réalisées<Arrow /></a><a href={sitePath("#amenagements-3d")}>Aménagements 3D<Arrow /></a><a href={sitePath("#conception-3d")}>Conception & rendus 3D<Arrow /></a></nav>
    </div>
    <section id="renovation" className="section renovation-section catalogue-renovations">
      <span id="prestations" className="legacy-anchor" />
      <div className="container">
        <SectionTitle number="01" label="Prestations réalisées · Avant / après" text="Pièces de vie, cuisine, rangements et salles de bains : découvrez les transformations que nous avons réalisées avec des photos avant/après.">Des intérieurs<br />transformés.</SectionTitle>
        <div className="catalogue-renovation-grid">{renovations.map(item => <a className="catalogue-card catalogue-renovation-card" key={item.slug} href={sitePath(`/renovation/${item.slug}/`)}>
          <span className="image-frame"><Picture name={item.image} alt={item.alt} sizes="(max-width: 767px) 100vw, 33vw" /></span>
          <div className="catalogue-card-copy"><span className="eyebrow">{item.pairs ? 'Prestation réalisée · Vue après' : 'Prestation réalisée · Avant / après'}</span><h3>{exampleServices.find(service => service.status === 'completed' && service.image === item.image)?.title ?? item.title}</h3><p>{item.summary}</p><span className="text-link">{item.pairs ? 'Explorer le projet' : 'Voir la transformation'}<Arrow diagonal /></span></div>
        </a>)}</div>
      </div>
    </section>
    {/* Une seule rubrique 02 : aménagements puis études complètes ; les ancres du menu restent sur chaque bloc. */}
    <section id="etude-3d" className="section studies-section catalogue-studies catalogue-concept">
      <ConceptCubes />
      <div className="container">
        <SectionTitle number="02" label="Étude conceptuelle 3D" text="Des aménagements et des études complètes d’Aliriza Bay, en plans et rendus 3D, pour visualiser un projet avant les travaux.">Votre imagination<br />pour seule limite.</SectionTitle>
        <div id="amenagements-3d" className="concept-block catalogue-services catalogue-inspirations"><span id="inspirations" className="legacy-anchor" />
          <h3 className="concept-subheading"><span className="drawing-label">Aménagements 3D</span>Des idées à adapter à votre quotidien.</h3>
          <div className="catalogue-service-grid">{exampleServices.filter(service => service.status === 'inspiration').map((service, index) => <a key={service.slug} className="catalogue-card" href={sitePath(`/prestations/#${service.slug}`)}>
            <span className="drawing-label catalogue-entry-number"><span>0{index + 1}</span> / Explorer les usages<Arrow diagonal /></span>
            <span className="image-frame"><Picture name={service.image} alt={service.alt} sizes="(max-width: 767px) 100vw, 33vw" /></span>
            <div className="catalogue-card-copy"><span className="eyebrow">Aménagement · Rendu 3D</span><h3>{service.title}</h3><p>{service.summary}</p><span className="text-link">Explorer cet aménagement<Arrow diagonal /></span></div>
          </a>)}</div>
        </div>
        <div id="conception-3d" className="concept-block"><span id="realisations" className="legacy-anchor" />
          <h3 className="concept-subheading"><span className="drawing-label">Conception & rendus</span>Des projets complets, du plan au rendu.</h3>
          <div className="study-gallery">{projects.map(project => <a className="study-card" key={project.slug} href={sitePath(`/projets/${project.slug}/`)}>
            <span className="study-visual"><span className="drawing-label study-sheet-label">{project.number} / {project.name} — Étude de conception</span><span className="image-frame"><Picture name={project.image} alt={project.alt} /></span><span className="study-plan"><Picture name={project.plan.image} alt={project.plan.alt} sizes="(max-width: 767px) 35vw, 15vw" /><span className="drawing-label">Le plan</span></span></span>
            <div className="study-card-copy"><span className="eyebrow">Étude de conception · {project.year}</span><h3>{project.name}</h3><p>{project.subtitle}</p><span className="secondary-caption">{project.area} · Plans & rendus 3D</span><span className="text-link">Découvrir l’étude {project.name}<Arrow diagonal /></span></div>
          </a>)}</div>
          <p className="study-gallery-note">Les aménagements et les études 3D présentent des propositions, avant réalisation.</p>
        </div>
      </div>
    </section>
    <section className="container catalogue-end section" aria-labelledby="catalogue-next"><div><span className="eyebrow">Votre point de départ</span><h2 id="catalogue-next">Une idée pour<br />votre logement ?</h2></div><a className="button" href={sitePath("/#contact")}>{contact.cta}<Arrow diagonal /></a></section>
  </main><Footer /><ScrollReveals /></>;
}
