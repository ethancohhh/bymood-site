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
import { ContactForm } from './components/ContactForm';
import { SocialLinks } from './components/SocialLinks';
import { ScrollReveals } from './components/ScrollReveals';
import { ImageViewer } from './components/ImageViewer';
import { RenovationGallery } from './components/RenovationGallery';

function chooseProject(type: string, label: string) {
  window.dispatchEvent(new CustomEvent('project-interest', { detail: { type, label } }));
}

function Hero() {
  return <section id="accueil" className="hero">
    <div className="container hero-inner">
      <div className="hero-composition">
        <div className="hero-copy">
          <h1>ARCHITECTURE<br />DESIGN<br /><span>RÉNOVATION</span></h1>
          <p>Des rangements mieux pensés, une pièce à réorganiser, un intérieur à transformer.</p>
          <div className="hero-actions">
            <a className="button" href={sitePath("/catalogue/")}>Catalogue<Arrow diagonal /></a>
          </div>
          <SocialLinks />
        </div>
        <figure className="hero-image">
          <Picture name="haven-living" alt="Rendu 3D de l’étude HAVEN : salon ouvert sur la cuisine, avec mobilier et rangements intégrés." eager sizes="(max-width: 767px) 100vw, 58vw" />
          <figcaption><span>HAVEN · Étude d’habitat contemporain</span><span>Étude de conception · Rendu 3D</span></figcaption>
        </figure>
      </div>
    </div>
  </section>;
}

function HomeNeeds() {
  return <section id="expertise" className="container home-needs" aria-labelledby="home-needs-title">
    <h2 id="home-needs-title">Votre point de départ</h2>
    <div className="needs-compact"><div>{expertise.map((item, index) => <a className="text-link need-link" key={item.title} href={sitePath("#project-form")} aria-labelledby={`need-${index}`} onClick={() => chooseProject(item.type, item.type)}><span className="need-copy"><span id={`need-${index}`} className="need-title">{item.title}</span><span className="need-examples">{item.examples}</span></span><Arrow diagonal /></a>)}</div></div>
  </section>;
}

function RenovationImage({ renovation, eager = false, group = 'renovations' }: { renovation: Renovation; eager?: boolean; group?: string }) {
  const series = !!renovation.pairs;
  const caption = series ? `${renovation.title} · ${renovation.pairs![0].title} · Après · Projet d’exemple` : `${renovation.title} · Inspiration avant / après, chantier non attribué à bymood.`;
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
    beforeLabel={project.plan.caption} afterLabel={project.focus.caption} mode="plan-render"
  />;
}

function Decisions({ project }: { project: Project }) {
  return <ol className="study-decisions">{project.decisions.map((decision, index) => <li key={decision.title}>
    <span className="item-number">0{index + 1}</span><h3>{decision.title}</h3><p>{decision.text}</p>
  </li>)}</ol>;
}

function Approach() {
  return <section id="approche" className="section container approach-section">
    <SectionTitle number="01" label="Notre approche" text="Nous avançons par étapes pour passer de vos besoins à une proposition concrète, puis à des travaux clairement définis.">De votre idée<br />à un projet défini.</SectionTitle>
    <p className="approach-intro">Conception des aménagements, choix des fournitures et organisation des travaux : le périmètre se définit ensemble.</p>
    <div className="method-grid">{process.map((step, index) => <article className="process-step" key={step.title}>
      <span className="item-number"><span>0{index + 1}</span></span><h3>{step.title}</h3><p>{step.text}</p><span className="method-output">{step.output}</span>
    </article>)}</div>
    <details className="method-detail"><summary>Un cadre clair avant les travaux<Arrow /></summary><p>Avant le démarrage, nous précisons ensemble le périmètre, les fournitures, les éventuelles exclusions et le calendrier. Le suivi s’appuie sur ces éléments. À la réception, nous faisons le point avec vous sur les travaux et les éventuelles reprises nécessaires.</p></details>
  </section>;
}

function About() {
  return <section id="a-propos" className="section team-section">
    <div className="container team-layout">
      <div className="team-intro"><span className="eyebrow"><span>02</span>Notre équipe</span></div>
      <dl className="team-grid">
        <div><dt><span className="team-portrait"><img src={sitePath("/team/ethan.webp")} className="portrait-ethan" alt="Portrait d’Ethan, en charge de la relation client" width={1200} height={800} loading="lazy" /></span>Ethan<span>Relation client & suivi de projet</span></dt><dd className="team-phone"><a href={sitePath(ethanContact.href)}>{ethanContact.phone}</a></dd><dd>Votre interlocuteur pour comprendre vos besoins, préciser le projet et suivre les échanges à chaque étape.</dd></div>
        <div><dt><span className="team-portrait"><img src={sitePath("/team/aliriza.webp")} alt="Portrait d’Aliriza, en charge de la conception et du design" width={640} height={682} loading="lazy" /></span>Aliriza<span>Architecte d’intérieur & designer</span></dt><dd className="team-phone"><a href={sitePath("tel:+33764230084")}>07 64 23 00 84</a></dd><dd>Conception des aménagements, rendus 3D et coordination des intervenants, de la préparation au suivi du chantier.</dd></div>
      </dl>
    </div>
  </section>;
}

function Contact() {
  const draft = contact.mode === 'draft';
  return <section id="contact" className="section contact-section">
    <div className="container contact-layout">
      <div className="contact-copy"><span className="eyebrow"><span>03</span>Votre projet</span><h2>{draft ? <>Donnons forme<br />à votre idée.</> : <>Parlons de<br />votre espace.</>}</h2><p>{draft ? 'Décrivez la pièce, vos envies et les contraintes que vous connaissez déjà. Vous pourrez télécharger un récapitulatif pour organiser vos idées.' : 'Décrivez l’espace et ce qui vous manque aujourd’hui. Votre projet peut encore être ouvert.'}</p>
        <div className="contact-direct"><h3>Vous préférez en parler directement ?</h3><p>Échangez avec {ethanContact.name} pour préciser votre besoin.</p><a className="text-link" href={sitePath(ethanContact.href)}><span>Appeler {ethanContact.name}<span className="contact-number">{ethanContact.phone}</span></span><Arrow diagonal /></a></div>
        {demoContent.enabled && <div className="contact-area"><h3>Zone d’intervention</h3><p>{demoContent.area.title}</p><p>{demoContent.area.detail}</p><span>Secteur d’exemple pour la maquette.</span><h3>Contact par email</h3><p className="demo-email">{demoContent.email}</p><span>Adresse fictive de présentation, sans réception.</span></div>}
        <div className="questions">{questions.map(item => <details key={item.question}><summary>{item.question}<Arrow /></summary><p>{item.answer}</p></details>)}</div>
        {site.email && <a className="text-link" href={sitePath('mailto:' + site.email)}>{site.email}<Arrow diagonal /></a>}
        {site.phone && <a className="text-link" href={sitePath('tel:' + site.phone.replace(/\s/g, ''))}>{site.phone}</a>}
      </div>
      <ContactForm />
    </div>
  </section>;
}

function ProjectPage({ project }: { project: Project }) {
  return <><Header home={false} currentPath={`/projets/${project.slug}/`} /><main id="main" className="project-page container">
    <a className="back-link text-link" href={sitePath("/catalogue/#conception-3d")}><Arrow />Retour aux études</a>
    <div className="project-page-heading"><div><span className="eyebrow">Portfolio d’Aliriza Bay · Étude de conception</span><h1>{project.name}</h1><p>{project.subtitle}</p></div><dl><div><dt>Lieu d’étude</dt><dd>{project.location.split(' — ')[0]}</dd></div><div><dt>Surface étudiée</dt><dd>{project.area.split(' — ')[0]}</dd></div><div><dt>Année</dt><dd>{project.year}</dd></div></dl></div>
    <figure className="project-cover"><a href={sitePath(`/images/${project.image}-1600.webp`)} target="_blank" rel="noopener" data-viewer={project.slug} data-alt={project.alt} data-caption={`${project.name} · Rendu 3D, portfolio d’Aliriza Bay`} aria-label={`Agrandir la vue d’ensemble de ${project.name}`}><Picture name={project.image} alt={project.alt} eager sizes="100vw" /></a><figcaption>Rendu 3D · Étude de conception</figcaption></figure>
    <div className="project-story"><div><span className="eyebrow">Le défi de conception</span><h2>{project.problem}</h2></div><div><span className="eyebrow">La réponse imaginée</span><p>{project.solution}</p></div></div>
    <section className="project-documents" aria-label="Plan et détail de l’étude"><StudyDocuments project={project} /></section>
    <section className="project-decisions" aria-labelledby="decision-title"><span className="eyebrow">Les choix de conception</span><h2 id="decision-title">Trois choix à découvrir.</h2><Decisions project={project} /><p className="source-note">Source : portfolio 2026 d’Aliriza Bay. Les documents présentent des choix de conception, et non des travaux exécutés.</p></section>
    <figure className="project-detail-photo"><a href={sitePath(`/images/${project.gallery[1].image}-1600.webp`)} target="_blank" rel="noopener" data-viewer={project.slug} data-alt={project.gallery[1].alt} data-caption={`${project.gallery[1].caption} · Étude du portfolio d’Aliriza Bay`} aria-label={`Agrandir : ${project.gallery[1].caption}`}><Picture name={project.gallery[1].image} alt={project.gallery[1].alt} /></a><figcaption>{project.gallery[1].caption}<span>Étude de conception · Rendu 3D</span></figcaption></figure>
    <div className="project-end"><h2>Un projet d’aménagement<br />en tête ?</h2><a className="button" href={sitePath("/#project-form")}>{contact.cta}<Arrow diagonal /></a></div>
  </main><Footer /><ScrollReveals /></>;
}

function RenovationPage({ renovation }: { renovation: Renovation }) {
  return <><Header home={false} currentPath={`/renovation/${renovation.slug}/`} /><main id="main" className="project-page renovation-page container">
    <a className="back-link text-link" href={sitePath("/catalogue/#renovation")}><Arrow />Retour aux rénovations</a>
    <div className="project-page-heading"><div><span className="eyebrow">Rénovation · {renovation.pairs ? 'Projet d’exemple' : 'Exemple d’inspiration'}</span><h1>{renovation.title}</h1><p>{renovation.summary}</p></div></div>
    {renovation.pairs && <p className="project-example-note">Projet d’exemple pour la maquette. Le nom est un intitulé de présentation ; les légendes décrivent les éléments visibles sur les photos.</p>}
    <RenovationImage renovation={renovation} eager group={renovation.pairs ? renovation.slug : undefined} />
    {renovation.pairs && <RenovationGallery renovation={renovation} />}
    <section className="project-decisions"><span className="eyebrow">Lecture des images</span><h2>Ce qui change.</h2><ol className="study-decisions">{renovation.changes.map((change, index) => <li key={change.title}><span className="item-number">0{index + 1}</span><h3>{change.title}</h3><p>{change.text}</p></li>)}</ol><p className="source-note">Exemple d’inspiration fourni par Ethan. Les commentaires décrivent les éléments visibles sur les photographies. Ce projet n’est pas présenté comme un chantier réalisé par bymood.</p></section>
    <div className="project-end"><h2>Et votre<br />{renovation.pairs ? 'intérieur ?' : 'salle de bains ?'}</h2><a className="button" href={sitePath("/#project-form")}>{contact.cta}<Arrow diagonal /></a></div>
  </main><Footer /><ScrollReveals /></>;
}

function LegalPage({ privacy }: { privacy: boolean }) {
  const legal = demoContent.enabled ? demoContent.legal : site.legal;
  const items = [['Éditeur du site', legal.company], ['Statut', legal.status], ['Adresse', legal.address], ['Immatriculation', legal.registration], ['Directeur de publication', legal.publicationDirector], ['Hébergement', legal.hosting]];
  return <><Header home={false} /><main id="main" className="legal-page container"><a className="text-link" href={sitePath("/")}>Retour à l’accueil<Arrow /></a><span className="eyebrow">Informations du site</span><h1>{privacy ? 'Confidentialité' : 'Mentions légales'}</h1><p className="legal-draft">Maquette fictive : les informations d’entreprise ci-dessous sont des exemples de présentation à remplacer dans la version définitive.</p>{privacy ? <><h2>Vos informations</h2><p>{site.contactEndpoint ? 'Le formulaire transmet les informations saisies au service configuré afin de traiter votre demande de projet.' : site.email ? 'Le formulaire prépare un message dans votre messagerie. La transmission a lieu uniquement lorsque vous envoyez ce message.' : 'Dans cette version du site, le formulaire ne transmet pas vos réponses à bymood. Il crée un récapitulatif directement dans votre navigateur, que vous pouvez télécharger. Vos coordonnées sont facultatives.'}</p><h2>Navigation et cookies</h2><p>Cette version du site n’utilise ni outil de mesure d’audience ni cookie publicitaire, et ne stocke pas localement vos réponses. La police et les images sont hébergées avec le site. L’hébergeur peut traiter certaines données techniques nécessaires à son fonctionnement.</p><h2>Responsable et contact</h2><p>{legal.company}<br />Contact relatif aux données : {legal.privacyContact}</p><h2>À préciser avant l’activation des demandes</h2><p>Avant d’activer l’envoi de demandes, cette page devra préciser le responsable du traitement, la base juridique, les destinataires, les durées de conservation et les modalités d’exercice des droits, selon les outils effectivement utilisés.</p><p>Durée de conservation : {legal.retention}</p></> : <><dl className="legal-details">{items.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><h2>Visuels et propriété intellectuelle</h2><p>Les compositions avant / après de salles de bains et les photographies des dossiers « Projet Paris », « Projet Grenoble » et « Projet Toulouse » sont utilisées comme exemples pour cette maquette. Les noms des dossiers sont des intitulés de présentation. Ces images ne sont pas attribuées à des chantiers réalisés par bymood. ou Aliriza. Leur auteur et les droits de diffusion restent à documenter avant une ouverture commerciale.</p><p>Les plans et rendus 3D des études HAVEN et NEMETO proviennent du portfolio d’Aliriza Bay. Ils illustrent un travail de conception et ne représentent pas des chantiers réalisés par bymood.</p><p>Les logos « bymood. » et « By. » constituent l’identité visuelle présentée sur ce site. L’identité de l’éditeur et les droits de diffusion restent à confirmer avant sa publication commerciale.</p></>}</main><Footer /></>;
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
  return <><Header /><main id="main"><Hero /><HomeNeeds /><Approach /><About /><Contact /></main><Footer /><ScrollReveals /></>;
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
