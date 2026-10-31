import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const checks = [];
await mkdir('qa', { recursive: true });
try {
  for (const width of [320, 375, 768, 1024, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = []; const photos = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if (/haven-(living|plan).*webp|architectural-reference/.test(r.url())) photos.push(r.url()); });
    await page.goto(base, { waitUntil: 'networkidle' });
    assert.equal(await page.getByRole('img', { name: 'Une maison dessinée en vue éclatée' }).count(), 1);
    assert.equal(await page.locator('.hero-image img, .hero-plan').count(), 0);
    assert.deepEqual(photos, [], 'The replaced photographs must not be downloaded on the homepage');
    assert.deepEqual(await page.locator('.hero-reference-caption > span').allTextContents(), ['Concevoir l’espace, jusque dans les détails.', 'Illustration']);
    assert.equal(await page.locator('.hero-axo image, .hero-colophon').count(), 0);
    // Légende dans le hero ; sur grand écran, la maison ne passe jamais sous le texte.
    assert.ok(await page.locator('.hero-reference-caption').evaluate(e => e.getBoundingClientRect().bottom <= document.querySelector('.hero').getBoundingClientRect().bottom));
    if (width >= 1024) assert.ok(await page.evaluate(() => document.querySelector('.axo-house').getBoundingClientRect().left >= document.querySelector('.hero-copy').getBoundingClientRect().right), 'The house must stay right of the hero text');
    else assert.ok(await page.evaluate(() => document.querySelector('.hero-banner').getBoundingClientRect().top >= document.querySelector('.hero-copy').getBoundingClientRect().bottom), 'The drawing must sit below the hero text');
    assert.notEqual(await page.locator('.hero').evaluate(e => getComputedStyle(e).backgroundColor), await page.locator('body').evaluate(e => getComputedStyle(e).backgroundColor));
    assert.equal(await page.locator('#approche h2').textContent(), 'Un accompagnement complet, de l’idée à la réalisation.');
    assert.match(await page.locator('#a-propos .team-grid').textContent(), /Ethan Cohen/);
    assert.match(await page.locator('#a-propos .team-grid').textContent(), /Aliriza Bay/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.equal(await page.locator('.axo-wall polygon').first().evaluate(e => getComputedStyle(e).animationName), 'none');
    assert.equal(await page.locator('.axo-wall polygon').first().evaluate(e => getComputedStyle(e).strokeDasharray), 'none');
    assert.equal(await page.locator('.axo-level').last().evaluate(e => getComputedStyle(e).animationName), 'none');
    assert.deepEqual(errors, []);
    if ([375, 1440].includes(width)) {
      const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      assert.deepEqual(audit.violations, []);
    }
    await page.screenshot({ path: `qa/axo-hero-${width}.png` });
    await page.locator('.hero').screenshot({ path: `qa/axo-banner-${width}.png` });
    await page.locator('.hero-actions a').click(); await page.waitForURL(base + '/catalogue/');
    assert.equal(await page.locator('.study-card').count(), 2);
    checks.push({ width, scenario: 'Dessin accessible, aucune ancienne photo chargée, dimensions et Catalogue', errors });
    await context.close();
  }
  for (const width of [375, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage(); await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.locator('.hero-axo').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => { const e = document.querySelector('.axo-wall polygon'); if (!e) return false; const n = parseFloat(getComputedStyle(e).strokeDashoffset); return n > 0 && n < 1; });
    const intermediate = await page.locator('.axo-wall polygon').first().evaluate(e => getComputedStyle(e).strokeDashoffset);
    await page.screenshot({ path: `qa/axo-motion-${width}.png` });
    // Fin de l'apparition (environ 3 s) : tracé complet, niveaux ouverts, aménagement visible.
    await page.waitForFunction(() => document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).every(a => a.playState === 'finished'), null, { timeout: 8000 });
    assert.equal(parseFloat(await page.locator('.axo-wall polygon').first().evaluate(e => getComputedStyle(e).strokeDashoffset)), 0);
    assert.equal(await page.locator('.axo-plant').first().evaluate(e => getComputedStyle(e).opacity), '1');
    const opened = await page.locator('.axo-level').last().evaluate(e => getComputedStyle(e).transform);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.axo-wall polygon').first().evaluate(e => getComputedStyle(e).strokeDasharray), 'none');
    assert.equal(await page.locator('.axo-level').last().evaluate(e => getComputedStyle(e).transform), opened);
    assert.equal(await page.locator('.axo-canopy').first().evaluate(e => getComputedStyle(e).animationName), 'none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    checks.push({ width, scenario: 'Tracé intermédiaire, ouverture complète et mouvement réduit en direct', intermediate });
    await context.close();
    const staticContext = await browser.newContext({ viewport: { width, height: 1000 }, javaScriptEnabled: false, reducedMotion: 'reduce' });
    const staticPage = await staticContext.newPage(); await staticPage.goto(base);
    assert.equal(await staticPage.getByRole('img', { name: 'Une maison dessinée en vue éclatée' }).count(), 1);
    assert.equal(await staticPage.locator('.axo-wall polygon').first().evaluate(e => getComputedStyle(e).strokeDasharray), 'none');
    await staticPage.locator('.hero-actions a').click(); await staticPage.waitForURL(base + '/catalogue/#renovation');
    checks.push({ width, scenario: 'Dessin complet et navigation sans JavaScript' }); await staticContext.close();
  }
} finally {
  await writeFile('qa/hero-report.json', JSON.stringify(checks, null, 2)); await browser.close();
}
console.log(JSON.stringify({ checks: checks.length, report: 'qa/hero-report.json' }));
