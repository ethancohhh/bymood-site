import { sitePath } from "../urls";
import { contact, projects, renovations } from '../data';
import { exampleServices } from '../demo-content';
import { Header } from './Header';
import { Footer } from './Footer';
import { Arrow, Picture, SectionTitle } from './ui';
import { ScrollReveals } from './ScrollReveals';

export function CataloguePage() {
  return <><Header home={false} currentPath="/catalogue/" /><main id="main" className="catalogue-page">
    <div className="container catalogue-intro">
      <a className="text-link" href={sitePath("/")}><Arrow />Retour à l’accueil</a>
      <span className="eyebrow">Catalogue · Aménagement & rénovation</span>
      <h1>Des idées concrètes<br />pour votre intérieur.</h1>
      <p>Explorez les prestations, découvrez les études 3D et observez des transformations avant / après pour préciser votre projet.</p>
      <nav className="catalogue-index" aria-label="Rubriques du catalogue"><a href={sitePath("#prestations")}>Prestations<Arrow /></a><a href={sitePath("#conception-3d")}>Conception 3D<Arrow /></a><a href={sitePath("#renovation")}>Inspirations avant / après<Arrow /></a></nav>
    </div>
    <section id="prestations" className="section container catalogue-services">
      <SectionTitle number="01" label="Prestations" text="Trois exemples d’accompagnement pour partir de vos usages et comprendre les possibilités d’aménagement.">Un projet adapté<br />à votre quotidien.</SectionTitle>
      <div className="catalogue-service-grid">{exampleServices.map(service => <a key={service.slug} className="catalogue-card" href={sitePath(`/prestations/#${service.slug}`)}>
        <span className="image-frame"><Picture name={service.image} alt={service.alt} sizes="(max-width: 767px) 100vw, 33vw" /></span>
        <div className="catalogue-card-copy"><span className="eyebrow">Exemple de prestation</span><h3>{service.title}</h3><p>{service.summary}</p><span className="text-link">Comprendre l’accompagnement<Arrow diagonal /></span></div>
      </a>)}</div>
      <p className="catalogue-note">Prestations et scénarios d’exemple pour la maquette. Le périmètre et les facteurs de budget sont détaillés dans chaque présentation.</p>
    </section>
    <section id="conception-3d" className="section studies-section catalogue-studies"><span id="realisations" className="legacy-anchor" />
      <div className="container">
        <SectionTitle number="02" label="Conception & rendus 3D" text="HAVEN et NEMETO sont issus du portfolio d’Aliriza Bay. Plans et rendus montrent un travail de conception, distinct des photographies de rénovation.">Imaginer les volumes.<br />Préciser les choix.</SectionTitle>
        <div className="study-gallery">{projects.map(project => <a className="study-card" key={project.slug} href={sitePath(`/projets/${project.slug}/`)}>
          <span className="image-frame"><Picture name={project.image} alt={project.alt} /></span>
          <div className="study-card-copy"><span className="eyebrow">Étude de conception · {project.year}</span><h3>{project.name}</h3><p>{project.subtitle}</p><span className="secondary-caption">{project.area} · Plans & rendus 3D</span><span className="text-link">Découvrir l’étude {project.name}<Arrow diagonal /></span></div>
        </a>)}</div>
        <p className="study-gallery-note">Les études 3D sont des propositions d’aménagement ; elles ne sont pas des chantiers livrés par bymood.</p>
      </div>
    </section>
    <section id="renovation" className="section renovation-section catalogue-renovations">
      <div className="container">
        <SectionTitle number="03" label="Inspirations · Avant / après" text="Pièces de vie, cuisine, rangements ou salle de bains : six exemples pour observer différentes transformations.">Observer ce<br />qui change.</SectionTitle>
        <p className="renovation-attribution">Projets d’exemple et inspirations pour la maquette. Ces images ne sont pas présentées comme des chantiers réalisés par bymood.</p>
        <div className="catalogue-renovation-grid">{renovations.map(item => <a className="catalogue-card catalogue-renovation-card" key={item.slug} href={sitePath(`/renovation/${item.slug}/`)}>
          <span className="image-frame"><Picture name={item.image} alt={item.alt} sizes="(max-width: 767px) 100vw, 33vw" /></span>
          <div className="catalogue-card-copy"><span className="eyebrow">{item.pairs ? 'Projet d’exemple · Vue après' : 'Inspiration · Avant / après'}</span><h3>{item.title}</h3><p>{item.summary}</p><span className="text-link">{item.pairs ? 'Explorer le projet' : 'Voir la transformation'}<Arrow diagonal /></span></div>
        </a>)}</div>
      </div>
    </section>
    <section className="container catalogue-end section" aria-labelledby="catalogue-next"><div><span className="eyebrow">Votre point de départ</span><h2 id="catalogue-next">Une idée pour<br />votre logement ?</h2><p>Décrivez vos envies et les contraintes que vous connaissez déjà pour préparer votre projet.</p></div><a className="button" href={sitePath("/#project-form")}>{contact.cta}<Arrow diagonal /></a></section>
  </main><Footer /><ScrollReveals /></>;
}
