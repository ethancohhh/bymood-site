import { sitePath } from "../urls";
import { socialLinks } from '../data';
import { Arrow } from './ui';

export function SocialLinks() {
  if (!socialLinks.length) return null;
  return <nav className="social-links" aria-label="Réseaux sociaux et email">
    {socialLinks.map(link => <a key={link.label} href={sitePath(link.href)} target={link.href.startsWith('https:') ? '_blank' : undefined} rel={link.href.startsWith('https:') ? 'noopener noreferrer' : undefined}>{link.label}<Arrow diagonal /></a>)}
  </nav>;
}
