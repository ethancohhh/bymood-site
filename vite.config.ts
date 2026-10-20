import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

export default defineConfig(({ isPreview }) => ({
  base: process.env.SITE_BASE_PATH || '/',
  appType: isPreview ? 'mpa' : 'spa',
  plugins: [react(), {
    name: 'preview-static-404',
    async configurePreviewServer(server) {
      const base = server.config.base;
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        if (base !== '/' && url.pathname === base.slice(0, -1)) {
          response.statusCode = 308;
          response.setHeader('Location', base + url.search);
          return response.end();
        }
        next();
      });
      const directory = resolve(server.config.root, server.config.build.outDir);
      const notFound = await readFile(resolve(directory, '404.html'));
      // Run after static files and directory indexes, before Vite's final 404.
      return () => server.middlewares.use(async (request, response, next) => {
        if (request.method !== 'GET' && request.method !== 'HEAD') return next();
        const accept = request.headers.accept;
        if (accept && !accept.includes('text/html') && !accept.includes('*/*')) return next();
        let url: URL;
        let path: string;
        try { url = new URL(request.url ?? '/', 'http://localhost'); path = decodeURIComponent(url.pathname); }
        catch { return next(); }
        if (base !== '/' && path.startsWith(base)) path = '/' + path.slice(base.length);
        const file = resolve(directory, `.${path}`);
        if (file.startsWith(directory + sep)) {
          const entry = await stat(file).catch(() => null);
          if (entry?.isFile()) return next();
          if (entry?.isDirectory() && !path.endsWith('/') && (await stat(resolve(file, 'index.html')).catch(() => null))?.isFile()) {
            response.statusCode = 308;
            const pathname = base !== '/' && !url.pathname.startsWith(base) ? base + url.pathname.replace(/^\/+/, '') : url.pathname;
            response.setHeader('Location', `${pathname.replace(/^\/+/, '/')}/${url.search}`);
            return response.end();
          }
        }
        response.statusCode = 404;
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end(request.method === 'HEAD' ? undefined : notFound);
      });
    },
  }],
  build: { target: 'es2022' },
}));
