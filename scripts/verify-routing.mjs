import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const cases = [
  ['/', 200, 'ARCHITECTURE'],
  ['/catalogue/', 200, 'Des idées concrètes'],
  ['/catalogue', 200, 'Des idées concrètes'],
  ['/catalogue/index.html', 200, 'Des idées concrètes'],
  ['/catalogue-inconnu/', 404],
  ['/index.html', 200, 'ARCHITECTURE'],
  ['/prestations/', 200, 'Des aménagements'],
  ['/prestations', 200, 'Des aménagements'],
  ['/prestations/index.html', 200, 'Des aménagements'],
  ['/prestations-inconnues', 404],
  ['/mentions-legales', 200, 'Mentions légales'],
  ['/mentions-legales/', 200, 'Mentions légales'],
  ['/mentions-legales/index.html', 200, 'Mentions légales'],
  ['/confidentialite', 200, 'Confidentialité'],
  ['/confidentialite/?audit=1', 200, 'Confidentialité'],
  ['/projets/haven', 200, 'HAVEN'],
  ['/projets/nemeto/', 200, 'NEMETO'],
  ['/renovation/renovation-salon-cheminee/', 200, 'Projet rénovation de salon et cheminée'],
  ['/renovation/renovation-salon-cheminee', 200, 'Projet rénovation de salon et cheminée'],
  ['/renovation/renovation-salon-cheminee/index.html', 200, 'Projet rénovation de salon et cheminée'],
  ['/renovation/renovation-cuisine-ouverte-salon/', 200, 'Projet rénovation cuisine ouverte & salon'],
  ['/renovation/renovation-cuisine-entree-rangements/', 200, 'Projet rénovation cuisine, entrée & rangements'],
  ['/renovation/renovation-cuisine-entree-rangements-inconnu/', 404],
  ['/renovation/moderniser-une-douche', 200, 'Moderniser une douche'],
  ['/mentions-legales-bidon', 404],
  ['/mentions-legales/inconnue/', 404],
  ['/confidentialite-bidon', 404],
  ['/confidentialite/inconnue/', 404],
  ['/projets/inconnu/', 404],
  ['/renovation/inconnue/', 404],
  ['/inconnue-audit?test=1', 404],
  ['/inconnue-audit.html', 404],
];
const reports = [];
await mkdir('qa', { recursive: true });
try {
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({ javaScriptEnabled, viewport: { width: 320, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [path, status, heading] of cases) {
      const response = await page.goto(base + path, { waitUntil: 'networkidle' });
      assert.equal(response.status(), status, path);
      assert.ok((await page.locator('h1').innerText()).includes(heading || 'Cette page n’existe pas'), path);
      if (status === 404) {
        assert.equal(await page.title(), 'Page introuvable — bymood.');
        assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow');
      }
      assert.deepEqual(errors, [], path);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path);
      reports.push({ path, javaScriptEnabled, status });
    }
    await page.screenshot({ path: `qa/404-320-js-${javaScriptEnabled}.png`, fullPage: true });
    await page.getByRole('link', { name: 'Retour à l’accueil', exact: true }).click();
    assert.ok((await page.locator('h1').innerText()).includes('ARCHITECTURE'));
    await context.close();
  }
  const legacyContext = await browser.newContext();
  const legacyPage = await legacyContext.newPage();
  for (const [hash, target] of [['univers', '/catalogue/'], ['conception-3d', '/catalogue/#conception-3d'], ['realisations', '/catalogue/#conception-3d'], ['renovation', '/catalogue/#renovation']]) {
    await legacyPage.goto(base + '/#' + hash);
    await legacyPage.waitForURL(base + target);
    assert.ok((await legacyPage.locator('h1').innerText()).includes('Des idées concrètes'));
    reports.push({ legacyHash: hash, target });
  }
  await legacyContext.close();
  // A host serving the homepage as a fallback must not hydrate it as another page.
  const context = await browser.newContext();
  const home = await (await context.request.get(base)).text();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const [path, expected] of [['/mentions-legales-bidon', 'Page introuvable'], ['/confidentialite/', 'Confidentialité']]) {
    await page.route(base + path, route => route.fulfill({ status: 200, contentType: 'text/html', body: home }));
    await page.goto(base + path, { waitUntil: 'networkidle' });
    assert.ok((await page.title()).startsWith(expected));
    assert.ok((await page.locator('h1').innerText()).includes(expected === 'Page introuvable' ? 'Cette page n’existe pas' : expected));
    assert.deepEqual(errors, []);
    reports.push({ path, fallback: true, errors });
  }
  await context.close();
} finally {
  await browser.close();
  await writeFile('qa/routing-report.json', JSON.stringify(reports, null, 2));
}
console.log(JSON.stringify({ routingChecks: reports.length, report: 'qa/routing-report.json' }));
