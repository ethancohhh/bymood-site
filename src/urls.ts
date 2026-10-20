// The same base is used by Vite in the browser and tsx during static rendering.
export const basePath = import.meta.env?.BASE_URL ||
  (typeof process !== 'undefined' ? process.env.SITE_BASE_PATH : '') || '/';

/** Prefix internal absolute URLs, leaving anchors, external URLs and downloads intact. */
export function sitePath(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//') || basePath === '/') return path;
  if (path === basePath.slice(0, -1) || path.startsWith(basePath)) return path;
  return basePath + path.slice(1);
}

export function routePath(path: string): string {
  if (basePath === '/') return path;
  if (path === basePath.slice(0, -1)) return '/';
  return path.startsWith(basePath) ? '/' + path.slice(basePath.length) : '/404.html';
}
