import { sitePath } from "./urls";
import { useEffect } from 'react';
import { contact, ethanContact, expertise, process, projects, questions, renovations, site, type Project, type Renovation } from './data';
import { demoContent } from './demo-content';
import { ServicesPage } from './components/ServicesPage';
import { CataloguePage } from './components/CataloguePage';
import { resolvePage } from './pages';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Arrow, Picture, SectionTitle } from './components/ui';
import { BeforeAfter } from './components/BeforeAfter';
import { SocialLinks } from './components/SocialLinks';
import { ScrollReveals } from './components/ScrollReveals';
import { ImageViewer } from './components/ImageViewer';
import { RenovationGallery } from './components/RenovationGallery';
import { HeroAxoBanner } from './components/hero-axo/svg/HeroAxoBanner';

function Hero() {
  return <section id="accueil" className="hero hero-axo-banner">
    <div className="container hero-inner">
      <div className="hero-copy">
        <h1>ARCHITECTURE<br />DESIGN<br /><span>RÉNOVATION</span></h1>
        <p>Découvrez nos réalisations en cliquant juste en dessous.</p>
        <div className="hero-actions">
          <a className="button" href={sitePath("/catalogue/#renovation")} onClick={event => {
            // Ouvre le catalogue en haut de page, puis le fait défiler jusqu'aux réalisations.
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            try { sessionStorage.setItem('catalogue-scroll', 'renovation'); } catch { return; }
            event.preventDefault(); window.location.assign(sitePath('/catalogue/'));
          }}>Nos réalisations<Arrow diagonal /></a>
        </div>
        <SocialLinks />
      </div>
    </div>
    <figure className="hero-banner">
      <div className="hero-banner-stage"><HeroAxoBanner /></div>
      <figcaption className="container hero-reference-caption drawing-label"><span>Concevoir l’espace, jusque dans les détails.</span><span>Illustration</span></figcaption>
    </figure>
  </section>;
}

function HomeNeeds() {
  return <section id="expertise" className="container home-needs" aria-labelledby="home-needs-title">
    <h2 id="home-needs-title">Par où commencer</h2>
    <div className="needs-compact"><div>{expertise.map((item, index) => <a className="text-link need-link" key={item.title} href={sitePath("#project-form")} aria-labelledby={`need-${index}`}><span className="need-copy"><span id={`need-${index}`} className="need-title">{item.title}</span><span className="need-examples">{item.examples}</span></span><Arrow diagonal /></a>)}</div></div>
  </section>;
}

function RenovationImage({ renovation, eager = false, group = 'renovations' }: { renovation: Renovation; eager?: boolean; group?: string }) {
  const series = !!renovation.pairs;
  const caption = series ? `${renovation.title} · ${renovation.pairs![0].title} · Après · Prestation réalisée` : `${renovation.title} · Prestation réalisée · Avant / après`;
  const viewer = { 'data-viewer': group, 'data-viewer-order': series && group === renovation.slug ? 1 : undefined, 'data-alt': renovation.alt, 'data-caption': caption };
  return <figure className="renovation-image">
    <a href={sitePath('/images/' + renovation.image + '-1600.webp')} target="_blank" rel="noopener" {...viewer} aria-label={'Agrandir : ' + renovation.title + (series ? ' — après' : ' — avant et après')}><Picture name={renovation.image} alt={renovation.alt} eager={eager} sizes="(max-width: 767px) 100vw, 65vw" /></a>
    <figcaption>{series ? <span className="cover-label">Après · Vue du projet</span> : <span className="pair-labels"><span>Avant</span><span>Après</span></span>}<a className="text-link" href={sitePath('/images/' + renovation.image + '-1600.webp')} target="_blank" rel="noopener" {...viewer}>Agrandir<span className="sr-only"> : {renovation.title}</span><Arrow diagonal /></a></figcaption>
  </figure>;
}

function StudyDocuments({ project }: { project: Project }) {
  return <BeforeAfter
    before={'/images/' + project.plan.image + '-1600.webp'} after={'/images/' + project.focus.image + '-1600.webp'}
    beforeAlt={project.plan.alt} afterAlt={project.focus.alt}
    group={project.slug} afterName={project.focus.image}
    documentLabels={project.slug === 'haven' ? ['Agrandir le plan du rez-de-chaussée de HAVEN', 'Agrandir le rendu 3D de la bibliothèque HAVEN'] : ['Agrandir le plan de NEMETO', 'Agrandir le rendu 3D de l’escalier NEMETO']}
    beforeLabel={project.plan.caption} afterLabel={project.focus.caption}
  />;
}

function Decisions({ project }: { project: Project }) {
  return <ol className="study-decisions">{project.decisions.map((decision, index) => <li key={decision.title}>
    <span className="item-number">0{index + 1}</span><h3>{decision.title}</h3><p>{decision.text}</p>
  </li>)}</ol>;
}

function Approach() {
  const stages = [
    { visual: 'quote' as const, image: 'approche-besoins', alt: 'Poignée de main autour d’une table, au début d’un projet', label: 'Devis', title: process[0].title, text: process[0].text, output: process[0].output },
    { visual: 'design' as const, image: 'approche-chiffrer', alt: 'Chiffrage d’un projet à la calculatrice', label: 'Rendu 3D · Dossier complet', title: process[1].title, text: process[1].text },
    { visual: 'review' as const, image: 'approche-echanger', alt: 'Échange autour d’une table entre deux personnes, devant un ordinateur', label: 'Vérification', title: 'Échanger avec le client', text: process[1].output },
    { visual: 'works' as const, image: 'approche-realisation', alt: 'Un artisan présente les plans du chantier à un couple', label: 'Travaux', title: process[2].title, text: process[2].text, output: process[2].output },
  ];
  return <section id="approche" className="section container approach-section">
    <SectionTitle number="01" label="Notre approche" text="Nous avançons par étapes pour passer de vos besoins à une proposition concrète, puis à des travaux clairement définis.">Un accompagnement complet, de l’idée à la réalisation.</SectionTitle>
    <p className="approach-intro">Visualisez votre futur intérieur en 3D, puis définissons ensemble les fournitures et l’organisation des travaux.</p>
    <ol className="method-grid approach-visual-grid">{stages.map((stage, index) => <li className="process-step" key={stage.visual}>
      <div className="method-stage-heading"><span className="item-number"><span>0{index + 1}</span></span><span className="method-stage-label">{stage.label}</span></div>
      <figure className="method-photo"><Picture name={stage.image} alt={stage.alt} sizes="(max-width: 767px) 100vw, (max-width: 1179px) 45vw, 25vw" /></figure>
      <h3>{stage.title}</h3><p>{stage.text}</p>
      {stage.output && <span className="method-output">{stage.output}</span>}
      {stage.visual === 'review' && <details className="method-detail"><summary>Un cadre clair avant les travaux<Arrow /></summary><p>Avant le démarrage, nous précisons ensemble le périmètre, les fournitures, les éventuelles exclusions et le calendrier. Le suivi s’appuie sur ces éléments. À la réception, nous faisons le point avec vous sur les travaux et les éventuelles reprises nécessaires.</p></details>}
    </li>)}</ol>
  </section>;
}

function About() {
  return <section id="a-propos" className="section team-section">
    <div className="container team-layout">
      <div className="team-intro"><span className="eyebrow"><span>02</span>Notre équipe</span></div>
      <dl className="team-grid">
        <div><dt><span className="team-portrait"><img src={sitePath("/team/ethan.webp")} className="portrait-ethan" alt="Portrait d’Ethan Cohen, en charge de la relation client" width={1200} height={800} loading="lazy" /></span>Ethan Cohen<span>Relation client & suivi de projet</span></dt><dd className="team-phone"><a href={sitePath(ethanContact.href)}>{ethanContact.phone}</a></dd><dd>Votre interlocuteur pour comprendre vos besoins, préciser le projet et suivre les échanges à chaque étape.</dd></div>
        <div><dt><span className="team-portrait"><img src={sitePath("/team/aliriza.webp")} alt="Portrait d’Aliriza Bay, en charge de la conception et du design" width={640} height={682} loading="lazy" /></span>Aliriza Bay<span>Architecte d’intérieur & designer</span></dt><dd className="team-phone"><a href={sitePath("tel:+33764230084")}>07 64 23 00 84</a></dd><dd>Conception des aménagements, rendus 3D et coordination des intervenants, de la préparation au suivi du chantier.</dd></div>
      </dl>
    </div>
  </section>;
}

// Contact : un appel à Ethan remplace le formulaire. L'ancre #project-form, visée par les
// boutons de l'en-tête, des besoins et des fiches, désigne désormais cet appel à l'action.
// Deux rangées : introduction et appel, puis informations pratiques et questions ; sur
// mobile, l'appel suit directement l'introduction.
function Contact() {
  return <section id="contact" className="section contact-section">
    <div className="container contact-layout">
      <div className="contact-copy"><span className="eyebrow"><span>03</span>Votre projet</span><h2>Parlons de<br />votre espace.</h2><p>Décrivez l’espace et ce qui vous manque aujourd’hui. Votre projet peut encore être ouvert.</p></div>
      <div id="project-form" className="contact-call">
        <h3>Appelez {ethanContact.name}</h3>
        <p>Échangez avec {ethanContact.name} pour préciser votre besoin.</p>
        <a className="button contact-call-button" href={sitePath(ethanContact.href)}><span>Appeler {ethanContact.name}<span className="contact-number">{ethanContact.phone}</span></span><Arrow diagonal /></a>
      </div>
      {(demoContent.enabled || site.email) && <div className="contact-details">
        {demoContent.enabled && <div className="contact-area"><h3>Zone d’intervention</h3><p>{demoContent.area.title}</p><p>{demoContent.area.detail}</p></div>}
        {site.email && <a className="text-link" href={sitePath('mailto:' + site.email)}>{site.email}<Arrow diagonal /></a>}
      </div>}
      <div className="questions">{questions.map(item => <details key={item.question}><summary>{item.question}<Arrow /></summary><p>{item.answer}</p></details>)}</div>
    </div>
  </section>;
}

function ProjectPage({ project }: { project: Project }) {
  return <><Header home={false} currentPath={`/projets/${project.slug}/`} /><main id="main" className="project-page container">
    <a className="back-link text-link" href={sitePath("/catalogue/#conception-3d")}><Arrow />Retour aux études</a>
    <div className="project-page-heading"><div><span className="eyebrow">Étude de conception · Aliriza Bay</span><h1>{project.name}</h1><p>{project.subtitle}</p></div><dl><div><dt>Lieu d’étude</dt><dd>{project.location.split(' — ')[0]}</dd></div><div><dt>Surface étudiée</dt><dd>{project.area.split(' — ')[0]}</dd></div><div><dt>Année</dt><dd>{project.year}</dd></div></dl></div>
    <figure className="project-cover"><a href={sitePath(`/images/${project.image}-1600.webp`)} target="_blank" rel="noopener" data-viewer={project.slug} data-alt={project.alt} data-caption={`${project.name} · Rendu 3D, conception Aliriza Bay`} aria-label={`Agrandir la vue d’ensemble de ${project.name}`}><Picture name={project.image} alt={project.alt} eager sizes="100vw" /></a><figcaption>Rendu 3D · Étude de conception</figcaption></figure>
    <div className="project-story"><div><span className="eyebrow">Le défi de conception</span><h2>{project.problem}</h2></div><div><span className="eyebrow">La réponse imaginée</span><p>{project.solution}</p></div></div>
    <section className="project-documents" aria-label="Plan et détail de l’étude"><StudyDocuments project={project} /></section>
    <section className="project-decisions" aria-labelledby="decision-title"><span className="eyebrow">Les choix de conception</span><h2 id="decision-title">Trois choix à découvrir.</h2><Decisions project={project} /><p className="source-note">Conception, plans et rendus 3D : Aliriza Bay, 2026.</p></section>
    <figure className="project-detail-photo"><a href={sitePath(`/images/${project.gallery[1].image}-1600.webp`)} target="_blank" rel="noopener" data-viewer={project.slug} data-alt={project.gallery[1].alt} data-caption={`${project.gallery[1].caption} · Conception Aliriza Bay`} aria-label={`Agrandir : ${project.gallery[1].caption}`}><Picture name={project.gallery[1].image} alt={project.gallery[1].alt} /></a><figcaption>{project.gallery[1].caption}<span>Étude de conception · Rendu 3D</span></figcaption></figure>
    <div className="project-end"><h2>Un projet d’aménagement<br />en tête ?</h2><a className="button" href={sitePath("/#project-form")}>{contact.cta}<Arrow diagonal /></a></div>
  </main><Footer /><ScrollReveals /></>;
}

function RenovationPage({ renovation }: { renovation: Renovation }) {
  return <><Header home={false} currentPath={`/renovation/${renovation.slug}/`} /><main id="main" className="project-page renovation-page container">
    <a className="back-link text-link" href={sitePath("/catalogue/#renovation")}><Arrow />Retour aux rénovations</a>
    <div className="project-page-heading"><div><span className="eyebrow">Rénovation · Prestation réalisée</span><h1>{renovation.title}</h1><p>{renovation.summary}</p></div></div>
    {renovation.pairs && <p className="project-example-note">Prestation réalisée · Les vues avant / après présentent les transformations de cet intérieur.</p>}
    <RenovationImage renovation={renovation} eager group={renovation.pairs ? renovation.slug : undefined} />
    {renovation.pairs && <RenovationGallery renovation={renovation} />}
    <section className="project-decisions"><span className="eyebrow">Lecture des images</span><h2>Ce qui change.</h2><ol className="study-decisions">{renovation.changes.map((change, index) => <li key={change.title}><span className="item-number">0{index + 1}</span><h3>{change.title}</h3><p>{change.text}</p></li>)}</ol><p className="source-note">Prestation réalisée · Photographies bymood. Les commentaires décrivent les transformations visibles.</p></section>
    <div className="project-end"><h2>Et votre<br />{renovation.pairs ? 'intérieur ?' : 'salle de bains ?'}</h2><a className="button" href={sitePath("/#project-form")}>{contact.cta}<Arrow diagonal /></a></div>
  </main><Footer /><ScrollReveals /></>;
}

function LegalPage({ privacy }: { privacy: boolean }) {
  const legal = demoContent.enabled ? demoContent.legal : site.legal;
  const items: [string, string][] = [['Éditeur du site', legal.company], ['Statut', legal.status], ['Adresse', legal.address], ['Immatriculation', legal.registration], ['Directeur de publication', legal.publicationDirector], ...('contact' in legal ? [['Contact', legal.contact] as [string, string]] : []), ['Hébergement', legal.hosting]];
  return <><Header home={false} /><main id="main" className="legal-page container"><a className="text-link" href={sitePath("/")}>Retour à l’accueil<Arrow /></a><span className="eyebrow">Informations du site</span><h1>{privacy ? 'Confidentialité' : 'Mentions légales'}</h1>{privacy ? <><h2>Vos informations</h2><p>Ce site ne comporte pas de formulaire et ne collecte aucune information saisie. Pour parler d’un projet, vous appelez directement {ethanContact.name} au {ethanContact.phone}.</p><h2>Navigation et cookies</h2><p>Ce site n’utilise ni outil de mesure d’audience ni cookie publicitaire, et ne stocke pas localement vos réponses. La police et les images sont hébergées avec le site. L’hébergeur peut traiter certaines données techniques nécessaires à son fonctionnement.</p><h2>Responsable et contact</h2><p>{legal.company}<br />Contact relatif aux données : {legal.privacyContact}</p><p>Durée de conservation : {legal.retention}</p></> : <><dl className="legal-details">{items.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></>}</main><Footer /></>;
}

function SiteContent({ path = '/' }: { path?: string }) {
  path = resolvePage(path).path;
  if (path === '/catalogue/') return <CataloguePage />;
  if (path === '/prestations/') return <ServicesPage contactSection={<Contact />} />;
  if (path === '/mentions-legales/' || path === '/mentions-legales') return <LegalPage privacy={false} />;
  if (path === '/confidentialite/' || path === '/confidentialite') return <LegalPage privacy />;
  const renovation = renovations.find(item => path === '/renovation/' + item.slug + '/' || path === '/renovation/' + item.slug);
  if (renovation) return <RenovationPage renovation={renovation} />;
  const project = projects.find(item => path === '/projets/' + item.slug + '/' || path === '/projets/' + item.slug);
  if (project) return <ProjectPage project={project} />;
  if (path !== '/') return <><Header home={false} /><main id="main" className="legal-page container"><span className="eyebrow">404</span><h1>Cette page n’existe pas, ou a changé d’adresse.</h1><a className="button" href={sitePath("/")}>Retour à l’accueil<Arrow /></a></main><Footer /></>;
  return <><Header /><main id="main"><Hero /><Approach /><HomeNeeds /><About /><Contact /></main><Footer /><ScrollReveals /></>;
}

export function App({ path = '/' }: { path?: string }) {
  useEffect(() => {
    if (resolvePage(path).path !== '/') return;
    const targets: Record<string, string> = { '#univers': '', '#conception-3d': '#conception-3d', '#realisations': '#conception-3d', '#renovation': '#renovation' };
    const redirect = () => { if (Object.hasOwn(targets, window.location.hash)) window.location.replace(sitePath('/catalogue/' + targets[window.location.hash])); };
    redirect(); window.addEventListener('hashchange', redirect);
    return () => window.removeEventListener('hashchange', redirect);
  }, [path]);
  return <><SiteContent path={path} /><ImageViewer /></>;
}
