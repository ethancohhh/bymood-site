import { hydrateRoot, createRoot } from 'react-dom/client';
import { App } from './App';
import { resolvePage } from './pages';
import { site } from './data';
import { routePath } from './urls';
import './styles.css';
import './studio.css';
import './architecture.css';
import './header.css';

const root = document.getElementById('root')!;
const page = resolvePage(routePath(window.location.pathname));
const app = <App path={page.path} />;

// Keep development and any host fallback consistent with the requested page.
document.title = page.title;
document.querySelector('meta[name="description"]')?.setAttribute('content', page.description);
document.querySelector('meta[property="og:title"]')?.setAttribute('content', page.title);
document.querySelector('meta[property="og:description"]')?.setAttribute('content', page.description);
if (site.url) {
  const url = new URL(page.path.slice(1), site.url.replace(/\/?$/, '/')).href;
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
}
if (page.path === '/404.html') document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex, nofollow');
if (root.hasChildNodes() && root.dataset.page === page.path) hydrateRoot(root, app);
else createRoot(root).render(app);
