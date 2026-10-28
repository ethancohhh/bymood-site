import { sitePath } from "../urls";
import type { ReactNode } from 'react';
import { contact } from '../data';
import { exampleServices } from '../demo-content';
import { Header } from './Header';
import { Footer } from './Footer';
import { Arrow, Picture } from './ui';
import { ScrollReveals } from './ScrollReveals';
import { ServiceNavigation } from './ServiceNavigation';
import { AnnotatedImage } from './AnnotatedImage';

export function ServicesPage({ contactSection }: { contactSection: ReactNode }) {
  return <><Header home={false} currentPath="/prestations/" /><main id="main" className="services-page">
    <div className="container services-intro">
      <a className="text-link" href={sitePath("/catalogue/")}><Arrow />Retour au catalogue</a>
      <span className="eyebrow">Inspirations & prestation réalisée</span>
      <h1>Des aménagements<br />pour votre quotidien.</h1>
      <p>Deux inspirations pour repenser vos rangements et les usages d’une pièce, puis une salle de bains réalisée pour observer une transformation avant / après.</p>
    </div>
    <ServiceNavigation />
    {exampleServices.map((service, index) => <section className="service-detail section" id={service.slug} key={service.slug} aria-labelledby={`title-${service.slug}`}>
      <div className="container">
        <div className="service-heading"><span className="eyebrow">0{index + 1} · {service.status === 'completed' ? 'Prestation réalisée' : 'Inspiration d’aménagement'}</span><h2 id={`title-${service.slug}`}>{service.title}</h2><p>{service.summary}</p></div>
        <div className="service-layout">
          <figure className="service-media">{service.image.startsWith('haven-') ? <AnnotatedImage name={service.image} alt={service.alt} group="services" caption={service.caption} /> : <a href={sitePath(`/images/${service.image}-1600.webp`)} target="_blank" rel="noopener" data-viewer="services" data-alt={service.alt} data-caption={service.caption} aria-label={`Agrandir : ${service.title}`}><Picture name={service.image} alt={service.alt} /></a>}<figcaption>{service.caption}</figcaption></figure>
          <div className="service-description"><span className="service-reading-label">Le projet en bref</span><h3>{service.status === 'completed' ? 'Un besoin similaire ?' : 'Votre besoin'}</h3><p>{service.need}</p><h3>{service.status === 'completed' ? 'La transformation réalisée' : 'La transformation envisagée'}</h3><p>{service.example}</p><span className="service-example-note">{service.status === 'completed' ? 'Prestation réalisée. Un projet similaire nécessite un périmètre et un devis adaptés à votre logement.' : 'Inspiration issue d’une étude 3D ; scénario d’aménagement à adapter à votre logement.'}</span><a className="button service-cta" href={sitePath("#project-form")}>{contact.cta}<span className="sr-only"> : {service.title}</span><Arrow diagonal /></a></div>
        </div>
        <div className="service-scope">
          <div><h3>Ce que peut comprendre l’accompagnement</h3><ul>{service.included.map(item => <li key={item}>{item}</li>)}</ul></div>
          <div className="service-secondary"><details><summary>Le périmètre à préciser<Arrow /></summary><p>{service.limits}</p></details><details><summary>Ce qui fait varier le budget<Arrow /></summary><p>{service.budget}</p></details></div>
        </div>
      </div>
    </section>)}
    <section className="container service-framework section" aria-labelledby="service-framework-title"><span className="eyebrow">Un cadre commun</span><h2 id="service-framework-title">Des choix précis<br />avant les travaux.</h2><div className="service-scope"><div><h3>Conception, fournitures et interventions</h3><p>Le projet définit les plans ou vues nécessaires, les références retenues et les interventions envisagées. Les rôles de chacun et les points à vérifier sont précisés avant de s’engager.</p></div><div><h3>Un devis adapté au logement</h3><p>Le devis rassemble les prestations, les quantités, les exclusions et les étapes. Chaque accompagnement se définit selon le logement : les inspirations et les photographies ne constituent pas un devis ou un périmètre standard.</p></div></div><a className="text-link" href={sitePath("/#approche")}>Découvrir notre approche<Arrow diagonal /></a></section>
    {contactSection}
  </main><Footer /><ScrollReveals /></>;
}
