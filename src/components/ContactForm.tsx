import { sitePath } from "../urls";
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { contact, site } from '../data';
import { Arrow } from './ui';

const projectTypes = ['Rénovation intérieure', 'Optimisation d’espace', 'Bibliothèque / rangement', 'Home cinéma / mur TV', 'Salle d’eau', 'Autre projet', 'À définir ensemble'];
export function ContactForm() {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  const [download, setDownload] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [projectValue, setProjectValue] = useState('');
  const [projectLabel, setProjectLabel] = useState('');
  const project = useRef<HTMLSelectElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const result = useRef<HTMLDivElement>(null);
  const mode = contact.mode;
  const draft = mode === 'draft';

  useEffect(() => {
    const selectProject = (event: Event) => {
      const detail = (event as CustomEvent<string | { type: string; label: string }>).detail;
      const value = typeof detail === 'string' ? detail : detail.type;
      if (!projectTypes.includes(value)) return;
      setProjectValue(value); setProjectLabel(typeof detail === 'string' ? value : detail.label);
      setStatus(''); setDownload(null);
      requestAnimationFrame(() => form.current?.focus({ preventScroll: true }));
    };
    window.addEventListener('project-interest', selectProject);
    return () => window.removeEventListener('project-interest', selectProject);
  }, []);
  useEffect(() => () => { if (download) URL.revokeObjectURL(download); }, [download]);
  useEffect(() => { if (download) result.current?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }, [download]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus(''); setDownload(null);
    const element = event.currentTarget;
    if (!element.checkValidity()) { setInvalid(true); element.reportValidity(); return; }
    const entries = new FormData(element);
    if (entries.get('website')) return;
    setBusy(true); setInvalid(false);
    const payload = Object.fromEntries(entries.entries());
    const body = `Nom : ${payload.name || 'Non renseigné'}\nEmail : ${payload.email || 'Non renseigné'}\nTéléphone : ${payload.phone || 'Non renseigné'}\nProjet : ${payload.project}\nVille : ${payload.city || 'Non renseignée'}\nBudget : ${payload.budget || 'À définir'}\n\n${payload.message}`;
    try {
      if (mode === 'endpoint') {
        const response = await fetch(site.contactEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error('delivery');
        setStatus('Votre demande a été transmise. Merci de nous avoir présenté votre projet.');
        element.reset();
        setProjectValue(''); setProjectLabel('');
      } else if (mode === 'email') {
        window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(`Projet de rénovation — ${payload.city}`)}&body=${encodeURIComponent(body)}`;
        setStatus('Votre messagerie va s’ouvrir avec la demande préparée. Vérifiez le message puis envoyez-le depuis votre messagerie.');
      } else {
        const url = URL.createObjectURL(new Blob([body], { type: 'text/plain;charset=utf-8' }));
        setDownload(url);
        setStatus('Votre récapitulatif est prêt. Téléchargez-le pour le conserver ou le partager. Aucune demande n’a été envoyée à bymood.');
      }
    } catch {
      setStatus('La demande n’a pas pu être transmise. Vos informations restent dans le formulaire ; veuillez réessayer.');
    } finally { setBusy(false); }
  }

  function invalidateDraft() {
    if (download || status) { setDownload(null); setStatus(''); }
  }

  return <form ref={form} id="project-form" tabIndex={-1} className="contact-form" onSubmit={submit} onChange={invalidateDraft} aria-describedby="form-notice" aria-label="Préparer votre projet" noValidate>
    {projectValue && <div className="project-selection"><p aria-live="polite"><span>Votre projet</span><strong>{projectLabel || projectValue}</strong></p><button className="selection-change" type="button" onClick={() => project.current?.focus()}>Modifier le projet<Arrow /></button></div>}
    <div className="form-notice" id="form-notice"><strong>{draft ? 'Mettez votre idée au clair.' : mode === 'email' ? 'Un message préparé dans votre messagerie.' : 'Présentez-nous votre projet.'}</strong><p>{draft ? 'Ce formulaire prépare uniquement un document à télécharger : il n’envoie pas de demande à notre équipe. Vos réponses restent dans votre navigateur et vos coordonnées sont facultatives.' : mode === 'email' ? 'Vous relirez et enverrez vous-même le message depuis votre messagerie.' : 'Ces informations nous permettront d’étudier votre demande.'}</p></div>
    <p className="form-intro">{draft ? 'Seuls le type de projet et la description de votre besoin sont obligatoires (*).' : 'Les champs marqués d’un * sont nécessaires.'}</p>
    <div className="form-grid">
      <div className="field"><label htmlFor="name">Nom{draft ? ' (facultatif)' : ' *'}</label><input id="name" name="name" autoComplete="name" maxLength={100} required={!draft} placeholder="Votre nom" /></div>
      <div className="field"><label htmlFor="email">Email{draft ? ' (facultatif)' : ' *'}</label><input id="email" name="email" type="email" autoComplete="email" maxLength={254} required={!draft} placeholder="vous@exemple.fr" /></div>
      <div className="field"><label htmlFor="phone">Téléphone{draft ? ' (facultatif)' : ''}</label><input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={30} placeholder="Votre numéro" /></div>
      <div className="field"><label htmlFor="project">Type de projet *</label><select ref={project} id="project" name="project" value={projectValue} onChange={event => { setProjectValue(event.target.value); setProjectLabel(''); }} required><option value="" disabled>Choisir un projet</option>{projectTypes.map(type => <option key={type}>{type}</option>)}</select></div>
      <div className="field"><label htmlFor="city">Ville{draft ? ' (facultatif)' : ' *'}</label><input id="city" name="city" autoComplete="address-level2" maxLength={100} required={!draft} placeholder="La ville du projet" /></div>
      <div className="field"><label htmlFor="budget">Budget approximatif{draft ? ' (facultatif)' : ''}</label><select id="budget" name="budget" defaultValue=""><option value="">À définir ensemble</option><option>Moins de 3 000 €</option><option>3 000 à 10 000 €</option><option>10 000 à 30 000 €</option><option>Plus de 30 000 €</option></select></div>
      <div className="field field-wide"><label htmlFor="message">Décrivez votre projet *</label><textarea id="message" name="message" rows={4} maxLength={4000} required placeholder="Quelle pièce souhaitez-vous aménager ? Qu’aimeriez-vous y changer ?" /></div>
    </div>
    <div className="honeypot" aria-hidden="true"><label htmlFor="website">Ne pas remplir ce champ</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
    {invalid && <p className="form-error" role="alert">Précisez le type de projet et votre besoin. Si vous avez indiqué un email, vérifiez son format.</p>}
    <p className="form-privacy">{draft ? 'Vos réponses ne sont pas envoyées à bymood.' : mode === 'email' ? 'L’envoi reste à effectuer depuis votre messagerie.' : 'Ces informations servent uniquement à traiter votre demande.'} <a href={sitePath("/confidentialite/")}>Confidentialité</a></p>
    <div className="form-action"><button className="button" type="submit" disabled={busy || !ready}>{busy ? (draft ? 'Création du récapitulatif…' : 'Transmission en cours…') : contact.submit}<Arrow /></button></div>
    <div ref={result} className={`form-status ${status ? 'has-result' : ''}`} role="status" aria-live="polite">{download && <h3>Votre projet, prêt à conserver.</h3>}{status && <p>{status}</p>}{download && <a className="button" href={sitePath(download)} download="mon-projet-renovation.txt">Télécharger le récapitulatif <Arrow /></a>}</div>
  </form>;
}
