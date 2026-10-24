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
    page.on('request', r => { if (/haven-(living|plan).*webp/.test(r.url())) photos.push(r.url()); });
    await page.goto(base, { waitUntil: 'networkidle' });
    assert.equal(await page.getByRole('img', { name: 'Un intérieur dessiné en perspective' }).count(), 1);
    assert.equal(await page.locator('.hero-image img, .hero-plan').count(), 0);
    assert.deepEqual(photos, [], 'The replaced photographs must not be downloaded on the homepage');
    assert.equal(await page.locator('.hero-plan-note').innerText(), 'Étude graphique');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.equal(await page.locator('.plan-wall-trace').first().evaluate(e => getComputedStyle(e).animationName), 'none');
    assert.equal(await page.locator('.plan-wall-trace').first().evaluate(e => getComputedStyle(e).strokeDasharray), 'none');
    assert.deepEqual(errors, []);
    if ([375, 1440].includes(width)) {
      const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      assert.deepEqual(audit.violations, []);
    }
    await page.screenshot({ path: `qa/architectural-hero-${width}.png` });
    await page.locator('.hero-blueprint').screenshot({ path: `qa/architectural-plan-${width}.png` });
    await page.locator('.hero-actions a').click(); await page.waitForURL(base + '/catalogue/');
    assert.equal(await page.locator('.study-card').count(), 2);
    checks.push({ width, scenario: 'Dessin accessible, aucune ancienne photo chargée, dimensions et Catalogue', errors });
    await context.close();
  }
  for (const width of [375, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage(); await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => { const e = document.querySelector('.plan-wall-trace'); if (!e) return false; const n = parseFloat(getComputedStyle(e).strokeDashoffset); return n > 0 && n < 1; });
    const intermediate = await page.locator('.plan-wall-trace').first().evaluate(e => getComputedStyle(e).strokeDashoffset);
    await page.screenshot({ path: `qa/architectural-motion-${width}.png` });
    await page.waitForTimeout(1700);
    assert.equal(parseFloat(await page.locator('.plan-wall-trace').first().evaluate(e => getComputedStyle(e).strokeDashoffset)), 0);
    assert.equal(await page.locator('.plan-furniture').evaluate(e => getComputedStyle(e).opacity), '1');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.plan-wall-trace').first().evaluate(e => getComputedStyle(e).strokeDasharray), 'none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.plan-furniture').evaluate(e => getComputedStyle(e).opacity), '1');
    checks.push({ width, scenario: 'Tracé intermédiaire puis complet et mouvement réduit en direct', intermediate });
    await context.close();
    const staticContext = await browser.newContext({ viewport: { width, height: 1000 }, javaScriptEnabled: false, reducedMotion: 'reduce' });
    const staticPage = await staticContext.newPage(); await staticPage.goto(base);
    assert.equal(await staticPage.getByRole('img', { name: 'Un intérieur dessiné en perspective' }).count(), 1);
    assert.equal(await staticPage.locator('.plan-wall-trace').first().evaluate(e => getComputedStyle(e).strokeDasharray), 'none');
    await staticPage.locator('.hero-actions a').click(); await staticPage.waitForURL(base + '/catalogue/');
    checks.push({ width, scenario: 'Dessin complet et navigation sans JavaScript' }); await staticContext.close();
  }
} finally {
  await writeFile('qa/hero-report.json', JSON.stringify(checks, null, 2)); await browser.close();
}
console.log(JSON.stringify({ checks: checks.length, report: 'qa/hero-report.json' }));
