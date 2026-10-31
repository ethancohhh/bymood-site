import { sitePath } from "../urls";
import { brand, navigation, site } from '../data';
import { SocialLinks } from './SocialLinks';

export function Footer() {
  return <footer className="footer container">
    <div className="footer-top"><a className="footer-brand" href={sitePath("/#accueil")} aria-label={`${site.name}, accueil`}><img className="brand-monogram" src={sitePath("/brand/bymood-monogram-176.webp")} alt="" width={176} height={176} loading="lazy" /><div><img className="brand-wordmark" src={sitePath("/brand/bymood-wordmark-420.webp")} alt={site.name} width={420} height={139} loading="lazy" /><span>{brand.signature}</span></div></a></div>
    <SocialLinks />
    <div className="footer-bottom"><nav aria-label="Navigation de pied de page">{navigation.map(([label, id]) => <a key={id} href={sitePath(id.startsWith('/') ? id : `/#${id}`)}>{label}</a>)}</nav><div className="legal-links"><a href={sitePath("/mentions-legales/")}>Mentions légales</a><a href={sitePath("/confidentialite/")}>Confidentialité</a></div></div>
    {site.email && <a className="footer-contact" href={sitePath(`mailto:${site.email}`)}>{site.email}</a>}
    <p className="footer-note">© 2026 {site.name} · Études de conception : Aliriza Bay.</p>
  </footer>;
}
