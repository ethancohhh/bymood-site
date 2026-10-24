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
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    const photo = page.locator('.hero-reference-image');
    assert.equal(await photo.count(), 1);
    assert.equal(await photo.evaluate(i => i.complete && i.naturalWidth === 476 && i.naturalHeight === 280), true);
    assert.equal(await page.locator('.hero-architectural-plan, .hero-colophon').count(), 0);
    assert.deepEqual(await page.locator('.hero-reference-caption > span').allTextContents(), ['Concevoir l’espace, jusque dans les détails.', 'Étude graphique']);
    assert.ok(await page.locator('.hero-reference-caption').evaluate(e => e.getBoundingClientRect().top >= document.querySelector('.hero-reference-image').getBoundingClientRect().bottom));
    assert.notEqual(await page.locator('.hero').evaluate(e => getComputedStyle(e).backgroundColor), await page.locator('body').evaluate(e => getComputedStyle(e).backgroundColor));
    assert.match(await page.locator('#a-propos .team-grid dt').nth(0).textContent(), /Ethan Cohen/);
    assert.match(await page.locator('#a-propos .team-grid dt').nth(1).textContent(), /Aliriza Bay/);
    assert.match(await page.locator('#approche h2').innerText(), /Un accompagnement complet/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if ([375, 1440].includes(width)) {
      const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      assert.deepEqual(audit.violations, []);
    }
    await page.screenshot({ path: `qa/hero-reference-${width}.png` });
    await page.locator('#approche').screenshot({ path: `qa/approach-copy-${width}.png` });
    await page.locator('#a-propos').screenshot({ path: `qa/team-names-${width}.png` });
    await page.locator('.hero-actions a').click(); await page.waitForURL(base + '/catalogue/');
    assert.equal(await page.locator('.study-card').count(), 2); assert.deepEqual(errors, []);
    checks.push({ width, scenario: 'Image fournie, contraste beige, légendes sous le schéma, noms et navigation', errors }); await context.close();
  }
  for (const width of [375, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, javaScriptEnabled: false, reducedMotion: 'reduce' });
    const page = await context.newPage(); await page.goto(base);
    assert.equal(await page.locator('.hero-reference-image').evaluate(i => i.complete && i.naturalWidth > 0), true);
    assert.equal(await page.locator('.hero-reference-caption').count(), 1);
    await page.locator('.hero-actions a').click(); await page.waitForURL(base + '/catalogue/');
    checks.push({ width, scenario: 'Image, légendes et navigation sans JavaScript' }); await context.close();
  }
} finally {
  await writeFile('qa/hero-report.json', JSON.stringify(checks, null, 2)); await browser.close();
}
console.log(JSON.stringify({ checks: checks.length, report: 'qa/hero-report.json' }));
