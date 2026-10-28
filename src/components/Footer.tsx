import { sitePath } from "../urls";
import { brand, ethanContact, navigation, site } from '../data';
import { SocialLinks } from './SocialLinks';
import { Arrow } from './ui';

export function Footer() {
  return <footer className="footer container">
    <div className="footer-top"><a className="footer-brand" href={sitePath("/#accueil")} aria-label={`${site.name}, accueil`}><img className="brand-monogram" src={sitePath("/brand/bymood-monogram.png")} alt="" width={1024} height={1024} loading="lazy" /><div><img className="brand-wordmark" src={sitePath("/brand/bymood-wordmark.png")} alt={site.name} width={2179} height={721} loading="lazy" /><span>{brand.signature}</span></div></a><a className="text-link footer-phone" href={sitePath(ethanContact.href)} aria-label={`Appeler ${ethanContact.name} au ${ethanContact.phone}`}><span><span className="footer-phone-label">Votre projet</span>{ethanContact.name} · {ethanContact.phone}</span><Arrow diagonal /></a></div>
    <SocialLinks />
    <div className="footer-bottom"><nav aria-label="Navigation de pied de page">{navigation.map(([label, id]) => <a key={id} href={sitePath(id.startsWith('/') ? id : `/#${id}`)}>{label}</a>)}</nav><div className="legal-links"><a href={sitePath("/mentions-legales/")}>Mentions légales</a><a href={sitePath("/confidentialite/")}>Confidentialité</a></div></div>
    {site.email && <a className="footer-contact" href={sitePath(`mailto:${site.email}`)}>{site.email}</a>}
    <p className="footer-note">© 2026 {site.name} · Études de conception : Aliriza Bay.</p>
  </footer>;
}
