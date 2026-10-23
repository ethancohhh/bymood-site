import { sitePath } from "../urls";
import { contact, projects, renovations } from '../data';
import { exampleServices } from '../demo-content';
import { Header } from './Header';
import { Footer } from './Footer';
import { Arrow, Picture, SectionTitle } from './ui';
import { ScrollReveals } from './ScrollReveals';
import { ArchitecturalDrawing } from './ArchitecturalDrawing';

export function CataloguePage() {
  return <><Header home={false} currentPath="/catalogue/" /><main id="main" className="catalogue-page">
    <div className="container catalogue-intro">
      <ArchitecturalDrawing className="catalogue-drawing" />
      <a className="text-link" href={sitePath("/")}><Arrow />Retour à l’accueil</a>
      <span className="eyebrow">Catalogue · Aménagement & rénovation</span>
      <h1>Des idées concrètes<br />pour votre intérieur.</h1>
      <p>Découvrez les prestations réalisées, explorez nos inspirations d’aménagement puis les études de conception et rendus 3D.</p>
      <nav className="catalogue-index" aria-label="Rubriques du catalogue"><a href={sitePath("#renovation")}>Prestations réalisées<Arrow /></a><a href={sitePath("#inspirations")}>Inspirations<Arrow /></a><a href={sitePath("#conception-3d")}>Conception & rendus 3D<Arrow /></a></nav>
    </div>
    <section id="renovation" className="section renovation-section catalogue-renovations">
      <span id="prestations" className="legacy-anchor" />
      <div className="container">
        <SectionTitle number="01" label="Prestations réalisées · Avant / après" text="Pièces de vie, cuisine, rangements et salles de bains : découvrez les transformations réalisées à travers leurs vues avant / après.">Des intérieurs<br />transformés.</SectionTitle>
        <div className="catalogue-renovation-grid">{renovations.map(item => <a className="catalogue-card catalogue-renovation-card" key={item.slug} href={sitePath(`/renovation/${item.slug}/`)}>
          <span className="image-frame"><Picture name={item.image} alt={item.alt} sizes="(max-width: 767px) 100vw, 33vw" /></span>
          <div className="catalogue-card-copy"><span className="eyebrow">{item.pairs ? 'Prestation réalisée · Vue après' : 'Prestation réalisée · Avant / après'}</span><h3>{exampleServices.find(service => service.status === 'completed' && service.image === item.image)?.title ?? item.title}</h3><p>{item.summary}</p><span className="text-link">{item.pairs ? 'Explorer le projet' : 'Voir la transformation'}<Arrow diagonal /></span></div>
        </a>)}</div>
      </div>
    </section>
    <section id="inspirations" className="section container catalogue-services catalogue-inspirations">
      <SectionTitle number="02" label="Inspirations" text="Deux pistes d’aménagement issues des études d’Aliriza Bay pour imaginer de nouveaux usages dans votre intérieur.">Des idées à adapter<br />à votre quotidien.</SectionTitle>
      <div className="catalogue-service-grid">{exampleServices.filter(service => service.status === 'inspiration').map((service, index) => <a key={service.slug} className="catalogue-card" href={sitePath(`/prestations/#${service.slug}`)}>
        <span className="drawing-label catalogue-entry-number"><span>0{index + 1}</span> / Explorer les usages<Arrow diagonal /></span>
        <span className="image-frame"><Picture name={service.image} alt={service.alt} sizes="(max-width: 767px) 100vw, 33vw" /></span>
        <div className="catalogue-card-copy"><span className="eyebrow">Inspiration · Étude 3D</span><h3>{service.title}</h3><p>{service.summary}</p><span className="text-link">Explorer cette inspiration<Arrow diagonal /></span></div>
      </a>)}</div>
      <p className="catalogue-note">Le coin TV & rangements et la pièce multifonction sont des inspirations d’aménagement, illustrées par des rendus 3D. Ils ne sont pas présentés comme des prestations réalisées.</p>
    </section>
    <section id="conception-3d" className="section studies-section catalogue-studies"><span id="realisations" className="legacy-anchor" />
      <div className="container">
        <SectionTitle number="03" label="Conception & rendus 3D" text="HAVEN et NEMETO sont issus du portfolio d’Aliriza Bay. Plans et rendus montrent un travail de conception, distinct des photographies de rénovation.">Imaginer les volumes.<br />Préciser les choix.</SectionTitle>
        <div className="study-gallery">{projects.map(project => <a className="study-card" key={project.slug} href={sitePath(`/projets/${project.slug}/`)}>
          <span className="study-visual"><span className="drawing-label study-sheet-label">{project.number} / {project.name} — Étude de conception</span><span className="image-frame"><Picture name={project.image} alt={project.alt} /></span><span className="study-plan"><Picture name={project.plan.image} alt={project.plan.alt} sizes="(max-width: 767px) 35vw, 15vw" /><span className="drawing-label">Le plan</span></span></span>
          <div className="study-card-copy"><span className="eyebrow">Étude de conception · {project.year}</span><h3>{project.name}</h3><p>{project.subtitle}</p><span className="secondary-caption">{project.area} · Plans & rendus 3D</span><span className="text-link">Découvrir l’étude {project.name}<Arrow diagonal /></span></div>
        </a>)}</div>
        <p className="study-gallery-note">Les études 3D sont des propositions d’aménagement ; elles ne sont pas des chantiers livrés par bymood.</p>
      </div>
    </section>
    <section className="container catalogue-end section" aria-labelledby="catalogue-next"><div><span className="eyebrow">Votre point de départ</span><h2 id="catalogue-next">Une idée pour<br />votre logement ?</h2><p>Décrivez vos envies et les contraintes que vous connaissez déjà pour préparer votre projet.</p></div><a className="button" href={sitePath("/#project-form")}>{contact.cta}<Arrow diagonal /></a></section>
  </main><Footer /><ScrollReveals /></>;
}
