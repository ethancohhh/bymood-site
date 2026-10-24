import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const checks = [];
await mkdir('qa', { recursive: true });
try {
  for (const width of [320, 375, 768, 900, 901, 1024, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    const nav = page.locator('#main-navigation');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    if (width <= 900) {
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      assert.equal(await page.locator('.catalogue-panel a:visible').count(), 3);
      assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
      const cta = nav.getByRole('link', { name: 'Préparer mon projet', exact: true });
      await cta.focus(); await page.keyboard.press('Tab');
      assert.equal(await page.getByRole('button', { name: 'Fermer', exact: true }).evaluate(e => e === document.activeElement), true);
      await page.keyboard.press('Shift+Tab'); assert.equal(await cta.evaluate(e => e === document.activeElement), true);
      if ([375, 768].includes(width)) {
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        assert.deepEqual(axe.violations, []);
      }
      await page.screenshot({ path: `qa/header-menu-${width}.png` });
      await page.keyboard.press('Escape');
      assert.equal(await nav.evaluate(e => e.inert), true);
      assert.equal(await page.evaluate(() => document.body.style.overflow), '');
      assert.equal(await page.getByRole('button', { name: 'Menu', exact: true }).evaluate(e => e === document.activeElement), true);
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
    } else {
      const disclosure = page.getByRole('button', { name: 'Rubriques du catalogue' });
      await disclosure.focus(); await page.keyboard.press('Enter');
      assert.equal(await disclosure.getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Tab');
      assert.equal(await page.locator('.catalogue-panel a').first().evaluate(e => e === document.activeElement), true);
      await page.keyboard.press('Escape');
      assert.equal(await disclosure.evaluate(e => e === document.activeElement), true);
      assert.equal(await disclosure.getAttribute('aria-expanded'), 'false');
      await disclosure.click(); await page.locator('.hero-copy h1').click();
      assert.equal(await disclosure.getAttribute('aria-expanded'), 'false');
      await disclosure.click();
      if (width === 1440) {
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
        assert.deepEqual(axe.violations, []);
      }
      await page.screenshot({ path: `qa/header-dropdown-${width}.png` });
    }
    await page.locator('.catalogue-panel a').nth(1).click();
    await page.waitForURL(base + '/catalogue/#inspirations');
    const anchor = await page.locator('#inspirations').evaluate(e => ({ top: e.getBoundingClientRect().top, header: document.querySelector('header').getBoundingClientRect().bottom }));
    assert.ok(anchor.top >= anchor.header - 2, `Anchor hidden by header at ${width}: ${JSON.stringify(anchor)}`);
    assert.ok(Math.abs(await page.locator('header').evaluate(e => e.getBoundingClientRect().top)) <= 1, 'Header remains visible on scroll');
    if (width <= 900) await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await nav.getByRole('link', { name: 'Approche', exact: true }).click();
    await page.waitForURL(base + '/#approche');
    assert.ok(await page.locator('#approche').evaluate(e => e.getBoundingClientRect().top >= document.querySelector('header').getBoundingClientRect().bottom - 2));
    if (width <= 900) await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await nav.getByRole('link', { name: 'Préparer mon projet', exact: true }).click();
    await page.waitForURL(base + '/#project-form');
    assert.ok(await page.locator('#project-form').evaluate(e => e.getBoundingClientRect().top >= document.querySelector('header').getBoundingClientRect().bottom - 2));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    await page.screenshot({ path: `qa/header-contact-${width}.png` });
    checks.push({ width, scenario: 'Catalogue, clavier, fermeture, ancres, bandeau persistant et contact' });
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 375, height: 560 } });
  const page = await context.newPage();
  await page.goto(base); await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.locator('.nav-cta').scrollIntoViewIfNeeded(); assert.equal(await page.locator('.nav-cta').isVisible(), true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('#main-navigation').evaluate(e => getComputedStyle(e).transitionDuration), '0s');
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.waitForFunction(() => document.body.style.overflow === '');
  assert.equal(await page.locator('#main-navigation').evaluate(e => e.inert), false);
  checks.push({ scenario: 'Écran court, mouvement réduit et passage mobile vers tablette' }); await context.close();
  for (const width of [375, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled: false, reducedMotion: 'reduce' });
    const page = await context.newPage(); await page.goto(base);
    const link = width === 375 ? page.locator('.navigation-fallback').getByRole('link', { name: 'Inspirations', exact: true }) : page.locator('#main-navigation').getByRole('link', { name: 'Catalogue', exact: true });
    await link.click(); await page.waitForURL(width === 375 ? base + '/catalogue/#inspirations' : base + '/catalogue/');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    checks.push({ width, scenario: 'Navigation sans JavaScript' }); await context.close();
  }
} finally {
  await writeFile('qa/header-report.json', JSON.stringify(checks, null, 2));
  await browser.close();
}
console.log(JSON.stringify({ checks: checks.length, report: 'qa/header-report.json' }));
