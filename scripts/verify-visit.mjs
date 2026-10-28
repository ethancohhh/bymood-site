import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const checks = [];
await mkdir('qa', { recursive: true });
try {
  for (const width of [320, 375, 768, 1024, 1180, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/prestations/');
    await page.evaluate(() => document.fonts.ready);
    const navigate = async slug => {
      if (width < 768) await page.locator('#explore-service').selectOption(slug);
      else await page.locator(`.service-index-links a[href="#${slug}"]`).click();
      await page.waitForFunction(slug => document.querySelector('.service-navigation [aria-current]')?.getAttribute('href') === '#' + slug, slug);
      const geometry = await page.locator('#' + slug).evaluate(element => ({ top: element.getBoundingClientRect().top, bottom: document.querySelector('.service-navigation').getBoundingClientRect().bottom }));
      assert.ok(geometry.top >= geometry.bottom - 2, 'Section heading must remain below the sticky navigation');
    };
    await navigate('piece-multifonction');
    await page.locator('#salle-de-bains').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('#explore-service').value === 'salle-de-bains');
    await navigate('coin-tv-rangements');
    const pin = page.locator('#coin-tv-rangements .image-pin').first();
    await pin.focus(); await page.keyboard.press('Enter');
    assert.equal(await pin.getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('#coin-tv-rangements .annotation-notes details').first().getAttribute('open'), '');
    await page.locator('#coin-tv-rangements .annotation-notes summary').nth(1).click();
    await page.waitForFunction(() => document.querySelector('#coin-tv-rangements .image-pin:nth-of-type(2)')?.getAttribute('aria-expanded') === 'true');
    assert.equal(await pin.getAttribute('aria-expanded'), 'false');
    await page.locator('#coin-tv-rangements .service-cta').click();
    assert.equal(new URL(page.url()).hash, '#project-form');
    await page.locator('#project-form').screenshot({ path: `qa/visit-call-${width}.png` });
    await navigate('coin-tv-rangements');
    await page.locator('#coin-tv-rangements .annotation-heading a').click();
    const modal = page.getByRole('dialog');
    await modal.waitFor();
    await page.waitForFunction(() => document.querySelector('.viewer-stage img')?.complete);
    assert.equal(await page.getByRole('button', { name: 'Fermer la visionneuse' }).evaluate(element => element === document.activeElement), true);
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
    assert.match(await page.locator('#viewer-caption').innerText(), /Étude HAVEN|étude HAVEN/);
    const initialImage = await page.locator('.viewer-stage img').getAttribute('src');
    await page.getByRole('button', { name: 'Image suivante' }).click();
    assert.notEqual(await page.locator('.viewer-stage img').getAttribute('src'), initialImage);
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.locator('.viewer-stage img').getAttribute('src'), initialImage);
    await page.getByRole('button', { name: 'Zoomer' }).click();
    assert.ok(await page.locator('.viewer-stage').evaluate(element => element.scrollWidth > element.clientWidth));
    await page.getByRole('button', { name: 'Vue entière' }).click();
    const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    assert.deepEqual(accessibility.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })), []);
    await page.screenshot({ path: `qa/visit-viewer-${width}.png` });
    // Native modal focus must stay inside the dialog, including reverse tabbing.
    for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); assert.ok(await modal.evaluate(element => element.contains(document.activeElement) || document.activeElement === document.body)); }
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog[open]').count(), 0);
    assert.equal(await page.locator('#coin-tv-rangements .annotation-heading a').evaluate(element => element === document.activeElement), true);
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    checks.push({ width, scenario: 'Sommaire, repères, sélection, visionneuse, zoom, clavier et axe', violations: accessibility.violations.length });
    await context.close();
  }

  const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
  await page.goto(base);
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.waitForFunction(() => { const opacity = Number(getComputedStyle(document.querySelector('#main-navigation')).opacity); return opacity > 0 && opacity < 1; });
  await page.screenshot({ path: 'qa/visit-menu-enter.png' });
  await page.waitForTimeout(260);
  assert.equal(await page.locator('#main-navigation').evaluate(element => getComputedStyle(element).opacity), '1');
  await page.screenshot({ path: 'qa/visit-menu-open.png' });
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('button', { name: 'Menu', exact: true }).evaluate(element => element === document.activeElement), true);
  assert.equal(await page.locator('#main-navigation').evaluate(element => element.inert), true);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForFunction(() => !document.querySelector('#main-navigation').inert);
  await page.goto(base + '/catalogue/');
  const universe = page.locator('.study-card').last();
  await universe.hover(); await page.waitForTimeout(420);
  assert.ok(await universe.locator('.image-frame img').evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).a > 1));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await universe.locator('.image-frame img').evaluate(element => getComputedStyle(element).transform), 'none');
  await page.goto(base + '/#project-form');
  assert.equal(await page.locator('#project-form a').getAttribute('href'), 'tel:+33666513040');
  await page.locator('#project-form').screenshot({ path: 'qa/visit-result.png' });
  checks.push({ scenario: 'Menu animé, resize, survol, réduction des mouvements et appel à Ethan' });
  await page.close();

  for (const width of [375, 1440]) {
    const motionPage = await browser.newPage({ viewport: { width, height: 900 } });
    await motionPage.goto(base);
    const firstStep = motionPage.locator('.process-step').first();
    const top = await firstStep.evaluate(element => element.getBoundingClientRect().top + scrollY - 260);
    await motionPage.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), top);
    await motionPage.waitForFunction(() => { const opacity = Number(getComputedStyle(document.querySelector('.process-step')).opacity); return opacity > 0 && opacity < .98; });
    await motionPage.screenshot({ path: `qa/visit-method-motion-${width}.png` });
    await motionPage.waitForTimeout(1000);
    assert.equal(await firstStep.evaluate(element => getComputedStyle(element).opacity), '1');
    // On mobile this accordion enters the viewport during the click itself.
    await motionPage.locator('.method-detail summary').click();
    assert.equal(await motionPage.locator('.method-detail').getAttribute('open'), '', 'The first pointer click must open the accordion even during its reveal');
    await motionPage.waitForTimeout(1000);
    await motionPage.locator('.method-detail').screenshot({ path: `qa/visit-method-open-${width}.png` });
    checks.push({ width, scenario: 'Tracé de la méthode et premier clic pendant une révélation' });
    await motionPage.close();
  }

  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 900 }, reducedMotion: 'reduce' });
  const staticPage = await noJs.newPage();
  await staticPage.goto(base + '/prestations/');
  assert.equal(await staticPage.locator('.service-index-links a').count(), 3);
  await staticPage.locator('.service-index-links a').nth(1).click();
  await staticPage.locator('#piece-multifonction .annotation-notes summary').first().click();
  assert.equal(await staticPage.locator('#piece-multifonction .annotation-notes details').first().getAttribute('open'), '');
  assert.equal(await staticPage.locator('.image-pin:visible').count(), 0);
  const popupPromise = staticPage.waitForEvent('popup');
  await staticPage.locator('#piece-multifonction .annotated-stage a').click();
  const popup = await popupPromise; await popup.waitForLoadState();
  assert.match(popup.url(), /haven-bedroom-1600.webp/); await popup.close();
  assert.equal(await staticPage.locator('form').count(), 0);
  checks.push({ scenario: 'Sans JavaScript : ancres, explications et agrandissement de secours' });
  await noJs.close();
} finally {
  await writeFile('qa/visit-report.json', JSON.stringify(checks, null, 2));
  await browser.close();
}
console.log(JSON.stringify({ checks: checks.length, report: 'qa/visit-report.json' }, null, 2));
