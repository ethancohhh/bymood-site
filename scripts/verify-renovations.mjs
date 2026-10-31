import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.QA_URL || 'http://127.0.0.1:4173';
const cases = [{ city: 'paris', slug: 'renovation-salon-cheminee', pairs: 4, superposed: 2 }, { city: 'grenoble', slug: 'renovation-cuisine-ouverte-salon', pairs: 3, superposed: 0 }, { city: 'toulouse', slug: 'renovation-cuisine-entree-rangements', pairs: 5, superposed: 0 }];
const reports = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
await mkdir('qa', { recursive: true });
try {
  for (const { city, slug, pairs, superposed } of cases) {
    const context = await browser.newContext({ viewport: { width: 375, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    assert.equal((await page.goto(`${base}/renovation/${slug}/`)).status(), 200);
    await page.evaluate(async () => { document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; }); await document.fonts.ready; await Promise.all(Array.from(document.images, image => image.decode().catch(() => {}))); });
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('.renovation-pair').count(), pairs);
    assert.equal(await page.locator('.renovation-gallery img').count(), pairs * 2);
    assert.match(await page.locator('.project-example-note').innerText(), /Prestation réalisée/);
    assert.equal(await page.locator('.project-end .button').getAttribute('href'), new URL(base + '/').pathname + '#project-form');
    assert.deepEqual(await page.locator('.renovation-gallery img').evaluateAll(images => images.filter(image => !image.complete || !image.naturalWidth).map(image => image.src)), []);
    // Comparateur à ligne pour les seules paires alignées ; les autres restent côte à côte.
    assert.equal(await page.locator('.comparison').count(), superposed);
    assert.equal(await page.locator('.renovation-pair-grid').count(), pairs - superposed);
    if (superposed) {
      const handle = page.locator('.comparison-handle').first();
      assert.equal(await handle.getAttribute('aria-valuenow'), '50');
      await handle.focus(); await page.keyboard.press('ArrowLeft'); await page.keyboard.press('Home');
      assert.equal(await handle.getAttribute('aria-valuenow'), '0');
      await page.keyboard.press('End');
      assert.equal(await page.locator('.comparison-before').first().evaluate(element => element.style.clipPath), 'inset(0px 0% 0px 0px)');
      const viewport = page.locator('.comparison-viewport').first(); await viewport.scrollIntoViewIfNeeded();
      const box = await viewport.boundingBox();
      await page.mouse.click(box.x + box.width * .25, box.y + box.height * .5);
      assert.ok(Math.abs(Number(await handle.getAttribute('aria-valuenow')) - 25) <= 2, 'Click moves the line');
    }
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${city}: overflow at ${width}`);
      const geometry = await page.locator('.renovation-pair-grid').first().locator('figure').evaluateAll(figures => figures.map(figure => { const rect = figure.getBoundingClientRect(); return { top: rect.top, left: rect.left, width: rect.width }; }));
      if (width < 768) assert.ok(geometry[1].top > geometry[0].top, 'Before must precede after vertically on mobile');
      else { assert.equal(geometry[0].top, geometry[1].top); assert.ok(geometry[1].left > geometry[0].left, 'Before must precede after horizontally'); }
      assert.deepEqual(await page.locator('.renovation-pair-grid img').evaluateAll(images => images.map(image => getComputedStyle(image).objectFit).filter(fit => fit !== 'contain')), []);
      if (width === 375 || width === 1440) {
        await page.screenshot({ path: `qa/new-${city}-${width}.png`, fullPage: true });
        await page.locator('.renovation-pair').first().scrollIntoViewIfNeeded();
        await page.screenshot({ path: `qa/new-${city}-pair-${width}.png` });
      }
      reports.push({ city, width, pairs, scenario: 'Photos complètes, ordre et responsive' });
    }
    const cover = page.locator('.renovation-image > a');
    await cover.click();
    assert.match(await page.locator('.viewer-pagination').innerText(), new RegExp(`2 / ${pairs * 2}`));
    assert.match(await page.locator('.viewer-stage img').getAttribute('src'), new RegExp(`${city}-1-apres-1600.webp$`));
    await page.keyboard.press('Escape');
    assert.ok(await cover.evaluate(element => element === document.activeElement));
    const firstBefore = page.locator('.renovation-gallery [data-viewer-order="0"]').first();
    await firstBefore.focus(); await page.keyboard.press('Enter');
    for (let index = 0; index < pairs * 2; index++) {
      const expected = `${city}-${Math.floor(index / 2) + 1}-${index % 2 ? 'apres' : 'avant'}-1600.webp`;
      assert.ok((await page.locator('.viewer-stage img').getAttribute('src')).endsWith(expected), 'Gallery order and deduplication');
      assert.match(await page.locator('#viewer-caption').innerText(), index % 2 ? /Après/ : /Avant/);
      assert.match(await page.locator('#viewer-caption').innerText(), /Prestation réalisée/);
      await page.keyboard.press('ArrowRight');
    }
    assert.match(await page.locator('.viewer-stage img').getAttribute('src'), new RegExp(`${city}-1-avant-1600.webp$`));
    await page.getByRole('button', { name: 'Zoomer' }).click();
    assert.ok(await page.locator('.viewer-stage').evaluate(element => element.scrollWidth > element.clientWidth));
    await page.keyboard.press('Escape');
    assert.ok(await firstBefore.evaluate(element => element === document.activeElement));
    assert.deepEqual(errors, []);
    reports.push({ city, galleryPhotos: pairs * 2, scenario: 'Galerie complète, légendes, ordre, zoom et clavier' });
    await context.close();
  }

  const staticContext = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce', viewport: { width: 375, height: 900 } });
  const page = await staticContext.newPage();
  await page.goto(base + '/catalogue/');
  assert.equal(await page.locator('.catalogue-renovation-card').count(), 6);
  for (const { city, slug, pairs } of cases) {
    await page.goto(`${base}/renovation/${slug}/`);
    assert.equal(await page.locator('.renovation-gallery img').count(), pairs * 2);
    assert.equal(await page.locator('.reveal-pending').count(), 0);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const popupPromise = page.waitForEvent('popup');
    await page.locator('.renovation-pair-grid').last().locator('figcaption a').first().click();
    const popup = await popupPromise; await popup.waitForLoadState();
    assert.ok(popup.url().endsWith(`${city}-${pairs}-avant-1600.webp`));
    await popup.close();
    reports.push({ city, scenario: 'HTML pré-rendu et agrandissement sans JavaScript' });
  }
  await staticContext.close();
} finally {
  await browser.close();
  await writeFile('qa/renovations-report.json', JSON.stringify(reports, null, 2));
}
console.log(JSON.stringify({ checks: reports.length, projects: 3, photoPairs: 12, report: 'qa/renovations-report.json' }, null, 2));
