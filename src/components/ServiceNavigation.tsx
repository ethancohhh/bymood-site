import { sitePath } from "../urls";
import { useEffect, useState } from 'react';
import { exampleServices } from '../demo-content';
import { Arrow } from './ui';

export function ServiceNavigation() {
  const [active, setActive] = useState(exampleServices[0].slug);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
    document.documentElement.classList.add('has-service-nav');
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const sections = exampleServices.map(item => document.getElementById(item.slug));
        const readingLine = Math.max(document.querySelector('.service-navigation')?.getBoundingClientRect().bottom ?? 0, parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) + 2;
        const current = sections.filter(section => section && section.getBoundingClientRect().top <= readingLine).at(-1);
        setActive(current?.id || exampleServices[0].slug);
      });
    };
    update(); window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); document.documentElement.classList.remove('has-service-nav'); };
  }, []);
  return <nav className="service-navigation" aria-label="Inspirations et prestation réalisée" data-ready={ready}>
    <div className="container">
      <div className="service-index-links">{exampleServices.map((service, index) => <a className="text-link" key={service.slug} href={sitePath(`#${service.slug}`)} aria-current={active === service.slug ? 'location' : undefined}><span>0{index + 1}</span>{service.title}<Arrow diagonal /></a>)}</div>
      <label className="service-index-select" htmlFor="explore-service"><span>Explorer un aménagement</span><select id="explore-service" value={active} onChange={event => { setActive(event.target.value); window.location.hash = event.target.value; }}>{exampleServices.map(service => <option key={service.slug} value={service.slug}>{service.title}</option>)}</select></label>
    </div>
  </nav>;
}
