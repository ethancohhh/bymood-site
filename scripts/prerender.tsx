import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { renderToString } from 'react-dom/server';
import { App } from '../src/App';
import { site } from '../src/data';
import { pages } from '../src/pages';

const template = await readFile('dist/index.html', 'utf8');
const base = site.url ? site.url.replace(/\/$/, '') : '';
const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
for (const page of pages) {
  const output = page.path.endsWith('.html') ? `dist${page.path}` : `dist${page.path}index.html`;
  const indexable = base && site.indexing && !page.path.includes('404') && !page.path.includes('mentions') && !page.path.includes('confidentialite');
  let html = template.replace('<div id="root"></div>', `<div id="root" data-page="${page.path}">${renderToString(<App path={page.path} />)}</div>`)
    .replace(/<title>.*?<\/title>/, `<title>${escape(page.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*("\s*\/>)/, `$1${escape(page.description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*("\s*\/>)/, `$1${escape(page.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*("\s*\/>)/, `$1${escape(page.description)}$2`)
    .replace('content="noindex, nofollow"', indexable ? 'content="index, follow"' : 'content="noindex, nofollow"');
  if (base) html = html.replace('</head>', `<link rel="canonical" href="${escape(base + page.path)}"/><meta property="og:url" content="${escape(base + page.path)}"/></head>`).replace(/(<meta property="og:image" content=")[^"]*("\s*\/?>)/, `$1${escape(base)}/images/social.jpg$2`);
  await mkdir(output.slice(0, output.lastIndexOf('/')), { recursive: true });
  await writeFile(output, html);
}
await writeFile('dist/robots.txt', base && site.indexing ? `User-agent: *\nAllow: /\nDisallow: /404.html\nSitemap: ${base}/sitemap.xml\n` : `User-agent: *\nDisallow: /\n${base ? `Sitemap: ${base}/sitemap.xml\n` : ''}`);
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${base ? pages.filter(page => page.path !== '/404.html').map(page => `<url><loc>${escape(base + page.path)}</loc></url>`).join('') : ''}</urlset>`);
await writeFile('dist/.nojekyll', '');
console.log(`Prerendered ${pages.length} pages. Indexing: ${site.indexing}. ${base ? `Canonical URL: ${base}` : 'Set site.config.json.url before publication.'}`);
