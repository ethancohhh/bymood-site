import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const reports = [];
async function prepareCapture(page) {
  await page.evaluate(async () => {
    document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
    await Promise.all(Array.from(document.images, image => image.decode().catch(() => {})));
    for (let top = 0; top < document.documentElement.scrollHeight; top += 650) {
      window.scrollTo({ top, behavior: 'instant' });
      await new Promise(resolve => setTimeout(resolve, 180));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.waitForTimeout(1100);
  assert.equal(await page.locator('.reveal-pending').count(), 0, 'All traversed content must be revealed: ' + JSON.stringify(await page.locator('.reveal-pending').evaluateAll(elements => elements.map(element => element.className))));
  const broken = await page.locator('img').evaluateAll(images => images.filter(image => !image.complete || !image.naturalWidth).map(image => image.src));
  assert.deepEqual(broken, []);
}
await mkdir('qa', { recursive: true });
try {
  // Pointer focus must not cancel the hero animation and move the link before mouseup.
  for (const javaScriptEnabled of [true, false]) for (const width of [375, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled });
    const page = await context.newPage();
    await page.goto(base);
    await page.locator('.hero-actions a').click();
    await page.waitForURL(base + '/catalogue/');
    await page.locator('.catalogue-services .catalogue-card').first().waitFor();
    assert.equal(await page.locator('.catalogue-renovation-card').count(), 6);
    reports.push({ scenario: 'Premier clic du hero vers Catalogue', width, javaScriptEnabled, violations: [] });
    await context.close();
  }
  for (const width of [375, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('.hero-copy h1').evaluate(element => getComputedStyle(element).animationName), 'studio-enter');
    const first = page.locator('.process-step').first();
    assert.equal(await first.evaluate(element => getComputedStyle(element).opacity), '0', 'The next block waits for its scroll entry');
    const top = await first.evaluate(element => element.getBoundingClientRect().top + scrollY - 180);
    await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), top);
    await page.waitForFunction(() => {
      const element = document.querySelector('.process-step');
      const opacity = Number(getComputedStyle(element).opacity);
      return opacity > 0 && opacity < .98;
    });
    const intermediate = await first.evaluate(element => {
      const style = getComputedStyle(element);
      return { opacity: Number(style.opacity), translateY: new DOMMatrixReadOnly(style.transform).m42 };
    });
    assert.ok(intermediate.opacity > 0 && intermediate.opacity < 1);
    assert.ok(intermediate.translateY > 0 && intermediate.translateY < 36);
    await page.screenshot({ path: `qa/motion-enter-${width}.png` });
    await page.waitForTimeout(1100);
    const delays = await page.locator('.process-step').evaluateAll(elements => elements.map(element => getComputedStyle(element).getPropertyValue('--reveal-delay').trim() || '0ms'));
    assert.deepEqual(delays, width === 1440 ? ['0ms', '110ms', '220ms'] : ['0ms', '0ms', '0ms']);
    assert.equal(await first.evaluate(element => getComputedStyle(element).opacity), '1');
    assert.equal(await first.evaluate(element => getComputedStyle(element).transform), 'none');
    await page.screenshot({ path: `qa/motion-complete-${width}.png` });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), top);
    assert.equal(await first.evaluate(element => getComputedStyle(element).opacity), '1', 'A visited block must not disappear again');
    reports.push({ motionWidth: width, intermediate, delays, violations: [] });
    await context.close();
  }
  for (const width of [320, 375, 768, 1024, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.__qaMetrics = { cls: 0, lcp: 0 };
      new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__qaMetrics.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver(list => { window.__qaMetrics.lcp = list.getEntries().at(-1)?.startTime || 0; }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    const response = await page.goto(base, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.evaluate(() => document.fonts.check('italic 400 16px "Merriweather"')), true);
    assert.equal(await page.evaluate(() => document.fonts.check('700 40px "Libre Baskerville"')), true);
    const titleStyle = await page.locator('h1').evaluate(el => { const style = getComputedStyle(el); return { family: style.fontFamily, weight: style.fontWeight, style: style.fontStyle }; });
    assert.match(titleStyle.family, /Libre Baskerville/);
    assert.equal(titleStyle.weight, '700');
    assert.equal(titleStyle.style, 'normal');
    const bodyStyle = await page.locator('.hero-copy > p').evaluate(el => { const style = getComputedStyle(el); return { family: style.fontFamily, style: style.fontStyle }; });
    assert.match(bodyStyle.family, /Merriweather/);
    assert.equal(bodyStyle.style, 'italic');
    const geometry = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, primary: getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() }));
    assert.equal(geometry.primary, '#173B4B');
    assert.equal(await page.locator('.hero-actions a').count(), 1);
    assert.equal(await page.locator('.hero-actions a').innerText(), 'Catalogue');
    assert.equal(await page.locator('.hero-actions a').getAttribute('href'), new URL(base + '/catalogue/').pathname);
    assert.equal(await page.locator('nav a').filter({ hasText: 'Réalisations' }).count(), 0);
    const smallLabels = await page.locator('.field label, .form-privacy, .document-comparison figcaption, .need-examples').evaluateAll(elements => elements.filter(element => parseFloat(getComputedStyle(element).fontSize) < 12).map(element => element.className));
    assert.deepEqual(smallLabels, [], 'Functional text must remain readable');
    assert.ok(geometry.scroll <= width, `Overflow at ${width}: ${geometry.scroll}`);
    const initialMetrics = await page.evaluate(() => window.__qaMetrics);
    assert.ok(initialMetrics.cls < 0.1, `Layout shift at ${width}: ${initialMetrics.cls}`);
    await prepareCapture(page);
    await page.screenshot({ path: `qa/home-${width}.png`, fullPage: true });
    await page.screenshot({ path: `qa/hero-${width}.png` });
    await page.locator('#expertise').screenshot({ path: `qa/needs-${width}.png` });
    await page.locator('#approche').screenshot({ path: `qa/approche-${width}.png` });
    await page.locator('.contact-copy').screenshot({ path: `qa/contact-copy-${width}.png` });
    assert.equal(await page.locator('a[href*="example.com"], a[href*="bymood.example"]').count(), 0, 'No fictitious contact destinations');
    assert.equal(await page.locator('.contact-direct a').getAttribute('href'), 'tel:+33666513040');
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    reports.push({ width, errors, initialMetrics, violations: audit.violations.map(item => ({ id: item.id, impact: item.impact, description: item.description, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) })) });
    assert.deepEqual(errors, [], 'Browser errors');
    if (width === 320 || width === 375) {
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      assert.equal(await page.getByRole('button', { name: 'Fermer', exact: true }).getAttribute('aria-expanded'), 'true');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'The open menu must also fit');
      await page.screenshot({ path: 'qa/mobile-menu.png' });
      await page.keyboard.press('Escape');
      assert.equal(await page.getByRole('button', { name: 'Menu', exact: true }).getAttribute('aria-expanded'), 'false');
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      await page.locator('#main-navigation').getByRole('link', { name: 'Préparer mon projet', exact: true }).click();
      await page.waitForTimeout(300);
      assert.equal(await page.getByRole('button', { name: 'Menu', exact: true }).getAttribute('aria-expanded'), 'false');
    }
    await page.locator('#project').selectOption('Bibliothèque / rangement');
    const clippedOptions = await page.locator('select').evaluateAll(selects => selects.flatMap(select => {
      const style = getComputedStyle(select);
      const canvas = document.createElement('canvas').getContext('2d');
      canvas.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const available = select.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 20;
      return Array.from(select.options).filter(option => canvas.measureText(option.text).width > available).map(option => ({ field: select.id, text: option.text, available }));
    }));
    assert.deepEqual(clippedOptions, [], `Select labels must fit at ${width}`);
    await page.locator('.contact-form').screenshot({ path: `qa/form-${width}.png` });
    if (width === 1440) {
      for (const [label, value] of [
        ['Créer des rangements adaptés à votre pièce', 'Bibliothèque / rangement'],
        ['Aménager un espace pour un nouvel usage', 'Optimisation d’espace'],
        ['Repenser l’aménagement d’une pièce', 'Rénovation intérieure'],
      ]) {
        await page.getByRole('link', { name: label, exact: true }).click();
        assert.equal(await page.locator('#project').inputValue(), value);
      }
      assert.equal(await page.getByRole('slider').count(), 0, 'A plan and a perspective must not use an before/after slider');
      assert.equal(await page.locator('.catalogue-card, .renovation-card, .study-card').count(), 0, 'Detailed galleries belong to the catalogue, not the homepage');
      assert.equal(await page.locator('.need-link').count(), 3);
      assert.equal(await page.locator('.process-step').count(), 3);
      await page.getByRole('link', { name: 'Aménager un espace pour un nouvel usage', exact: true }).click();
      assert.equal(await page.locator('#project').inputValue(), 'Optimisation d’espace');
      await page.locator('#form-notice').waitFor({ state: 'visible' });
      assert.ok((await page.locator('#form-notice').innerText()).includes('il n’envoie pas de demande à notre équipe'));
      assert.equal(await page.locator('#email').evaluate(field => field.required), false);
      await page.getByRole('button', { name: 'Créer mon récapitulatif' }).click();
      await page.getByRole('alert').waitFor();
      await page.locator('#name').fill('Test visuel');
      await page.locator('#email').fill('test@example.com');
      await page.locator('#city').fill('Versailles');
      await page.locator('#message').fill('Étudier un bureau intégré avec rangements.');
      await page.getByRole('button', { name: 'Créer mon récapitulatif' }).click();
      await page.getByRole('link', { name: 'Télécharger le récapitulatif' }).waitFor();
      assert.ok((await page.getByRole('status').innerText()).includes('Aucune demande n’a été envoyée à bymood.'));
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('link', { name: 'Télécharger le récapitulatif' }).click();
      const download = await downloadPromise;
      assert.equal(download.suggestedFilename(), 'mon-projet-renovation.txt');
      const downloadedText = await readFile(await download.path(), 'utf8');
      assert.ok(downloadedText.includes('Optimisation d’espace') && downloadedText.includes('bureau intégré'));
      await page.locator('#message').fill('Une nouvelle idée, sans coordonnées.');
      assert.equal(await page.getByRole('link', { name: 'Télécharger le récapitulatif' }).count(), 0, 'An edited draft must not keep a stale download');
      await page.locator('#name').fill(''); await page.locator('#email').fill(''); await page.locator('#city').fill('');
      await page.getByRole('button', { name: 'Créer mon récapitulatif' }).click();
      await page.getByRole('link', { name: 'Télécharger le récapitulatif' }).waitFor();
      await page.locator('.questions summary').first().click();
      assert.equal(await page.locator('.questions details').first().evaluate(details => details.open), true);
      await page.screenshot({ path: 'qa/contact.png' });
    }
    await context.close();
  }
  for (const route of ['/catalogue/', '/renovation/projet-paris/', '/renovation/projet-grenoble/', '/renovation/projet-toulouse/', '/prestations/', '/projets/haven/', '/projets/nemeto/', '/renovation/moderniser-une-douche/', '/renovation/repenser-une-salle-de-bains/', '/renovation/transformer-une-baignoire-en-douche/', '/mentions-legales/', '/confidentialite/', '/404.html']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const response = await page.goto(base + route, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    assert.equal(await page.locator('h1').count(), 1);
    await prepareCapture(page);
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    reports.push({ route, violations: audit.violations.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) })) });
    await page.screenshot({ path: `qa/${route.split('/').filter(Boolean).join('-')}.png`, fullPage: true });
    await page.setViewportSize({ width: 320, height: 1000 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Route overflow at 320: ${route}`);
    await page.setViewportSize({ width: 375, height: 1000 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Route overflow: ${route}`);
    if (route === '/catalogue/') {
      assert.equal(await page.locator('#main-navigation a[aria-current="page"]').innerText(), 'Catalogue');
      assert.equal(await page.locator('.catalogue-services .catalogue-card').count(), 2);
      assert.deepEqual(await page.locator('main > section[id]').evaluateAll(sections => sections.map(section => section.id)), ['renovation', 'inspirations', 'conception-3d']);
      assert.deepEqual(await page.locator('#inspirations h3').allTextContents(), ['Coin TV & rangements', 'Pièce multifonction']);
      assert.equal(await page.locator('#renovation').getByRole('heading', { name: 'Salle de bains', exact: true }).count(), 1);
      assert.equal(await page.locator('#main-navigation').getByRole('link', { name: 'Rénovation', exact: true }).count(), 0);
      assert.equal(await page.locator('.study-card').count(), 2);
      assert.equal(await page.locator('.catalogue-renovation-card').count(), 6);
      assert.equal(await page.locator('#main-navigation a').filter({ hasText: /^(Prestations|Conception 3D)$/ }).count(), 0);
      await prepareCapture(page);
      await page.screenshot({ path: 'qa/catalogue-375.png', fullPage: true });
      await page.locator('.catalogue-services .catalogue-card').first().click();
      await page.waitForURL(base + '/prestations/#coin-tv-rangements');
      await page.getByRole('link', { name: 'Retour au catalogue', exact: true }).click();
      await page.waitForURL(base + '/catalogue/');
      await page.locator('.study-card').first().click();
      await page.waitForURL(base + '/projets/haven/');
      await page.getByRole('link', { name: 'Retour aux études', exact: true }).click();
      await page.waitForURL(base + '/catalogue/#conception-3d');
      await page.locator('.catalogue-renovation-card').first().click();
      await page.waitForURL(base + '/renovation/projet-paris/');
      await page.getByRole('link', { name: 'Retour aux rénovations', exact: true }).click();
      await page.waitForURL(base + '/catalogue/#renovation');

    }
    if (route === '/prestations/') {
      assert.equal(await page.locator('#main-navigation a[aria-current="location"]').innerText(), 'Catalogue');
      for (const [slug, type] of [['coin-tv-rangements', 'Bibliothèque / rangement'], ['piece-multifonction', 'Optimisation d’espace'], ['salle-de-bains', 'Salle d’eau']]) {
        await page.locator('#explore-service').selectOption(slug);
        await page.locator(`#${slug} .service-cta`).click();
        assert.equal(await page.locator('#project').inputValue(), type);
        assert.equal(new URL(page.url()).hash, '#project-form');
      }
      await prepareCapture(page);
      await page.screenshot({ path: 'qa/prestations-375.png', fullPage: true });
    }
    if (route.startsWith('/projets/')) {
      assert.equal(await page.locator('.document-comparison figure').count(), 2);
      assert.equal(await page.locator('.study-decisions > li').count(), 3);
      await page.locator('.plan-document figcaption a').click();
      assert.ok((await page.locator('.image-viewer[open] img').getAttribute('src')).includes('-plan-1600.webp'));
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.image-viewer[open]').count(), 0);
    }
    if (route.startsWith('/renovation/')) {
      await page.locator('.renovation-image figcaption a').click();
      assert.match(await page.locator('.image-viewer[open] img').getAttribute('src'), /\/images\/(renovation-|paris-|grenoble-|toulouse-)/);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.image-viewer[open]').count(), 0);
    }
    if (route.startsWith('/projets/') || route.startsWith('/renovation/')) {
      await prepareCapture(page);
      await page.screenshot({ path: `qa/${route.split('/').filter(Boolean).join('-')}-375.png`, fullPage: true });
    }
    await context.close();
  }
  const page = await browser.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  assert.ok(await page.locator('.reveal-pending').count() > 0, 'Scroll enhancement should activate below the fold');
  await page.locator('#name').focus();
  assert.equal(await page.locator('.contact-form').evaluate(form => getComputedStyle(form).opacity), '1', 'Keyboard focus reveals its content immediately');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => document.querySelectorAll('.reveal-pending').length === 0);
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  assert.equal(await page.locator('.reveal-pending').count(), 0, 'Reduced motion must not hide content');
  assert.equal(await page.locator('.hero-copy h1').evaluate(element => getComputedStyle(element).animationName), 'none');
  await page.close();
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await noJs.newPage(); await staticPage.goto(base);
  assert.equal(await staticPage.locator('h1').count(), 1);
  assert.equal(await staticPage.locator('.home-needs h2').count(), 1);
  assert.equal(await staticPage.locator('.renovation-card, .study-card').count(), 0);
  assert.equal(await staticPage.locator('.prototype-notice').count(), 1);
  assert.equal(await staticPage.locator('.reveal-pending').count(), 0);
  assert.equal(await staticPage.getByRole('button', { name: 'Créer mon récapitulatif' }).isDisabled(), true, 'Without JavaScript, answers must not be submitted in the URL');
  await staticPage.locator('.hero-actions a').click();
  await staticPage.waitForURL(base + '/catalogue/');
  await staticPage.locator('.catalogue-renovation-card').first().waitFor();
  assert.equal(await staticPage.locator('.catalogue-renovation-card').count(), 6);
  await staticPage.locator('.catalogue-services .catalogue-card').first().click();
  await staticPage.waitForURL(base + '/prestations/#coin-tv-rangements');
  await staticPage.locator('.service-detail').first().waitFor();
  assert.equal(await staticPage.locator('.service-detail').count(), 3);
  assert.equal(await staticPage.getByRole('button', { name: 'Créer mon récapitulatif' }).isDisabled(), true);
  await noJs.close();
} finally {
  await writeFile('qa/report.json', JSON.stringify(reports, null, 2));
  await browser.close();
}
const violations = reports.flatMap(report => report.violations);
console.log(JSON.stringify({ checks: reports.length, accessibilityViolations: violations.length, reports: 'qa/report.json' }, null, 2));
assert.equal(violations.length, 0, 'Accessibility violations — inspect qa/report.json');
