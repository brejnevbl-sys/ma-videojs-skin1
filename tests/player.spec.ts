import { mockPexelsMedia } from './pexels-fixture';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => { await mockPexelsMedia(page); });


async function openPlayer(page: import('@playwright/test').Page, url = '/ma.html') {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url);
  await expect.poll(() => page.locator('video').evaluate(v => v.readyState)).toBeGreaterThanOrEqual(2);
  await expect.poll(() => page.locator('video').evaluate(v => v.duration)).toBeGreaterThan(5);
  expect(errors).toEqual([]);
  return page.locator('video');
}

test('real playback, pause, seeking, time display and ended/replay', async ({ page }) => {
  const video = await openPlayer(page);
  await page.getByRole('button', { name: 'Play', exact: true }).last().click();
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(0.2);
  await page.getByRole('button', { name: 'Pause', exact: true }).last().click();
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
  const timeline = page.getByRole('slider', { name: /seek/i });
  await timeline.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(0);
  const rail = await page.locator('.media-time-slider').boundingBox();
  await page.mouse.click(rail!.x + rail!.width * 0.4, rail!.y + rail!.height / 2);
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(1);
  await expect(page.locator('.media-time-current-value')).toBeVisible();
  await expect(page.locator('.media-time-duration-value')).toHaveText('0:05');
  await video.evaluate(v => { v.currentTime = v.duration - 0.2; });
  await page.getByRole('button', { name: 'Play', exact: true }).last().click();
  await expect.poll(() => video.evaluate(v => v.ended)).toBe(true);
  await page.getByRole('button', { name: /replay/i }).last().click();
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeLessThan(3);
});

test('mute, volume, fullscreen and scoped keyboard shortcuts', async ({ page }) => {
  const video = await openPlayer(page);
  await page.getByRole('button', { name: 'Mute', exact: true }).click();
  await expect.poll(() => video.evaluate(v => v.muted)).toBe(true);
  await page.getByRole('button', { name: 'Unmute', exact: true }).click();
  await expect.poll(() => video.evaluate(v => v.muted)).toBe(false);
  // Leave and re-enter so this verifies a real hover after clicking the same trigger.
  await page.mouse.move(1, 1);
  await page.getByRole('button', { name: 'Mute', exact: true }).hover();
  const volume = page.getByRole('slider', { name: /volume/i });
  await expect(volume).toBeVisible();
  await volume.focus();
  await page.keyboard.press('End');
  await page.keyboard.press('ArrowDown');
  await expect.poll(() => video.evaluate(v => v.volume)).toBeLessThan(1);
  await page.keyboard.press('Escape');
  await page.locator('.media-skin').focus();
  await page.keyboard.press('m');
  await expect.poll(() => video.evaluate(v => v.muted)).toBe(true);
  await page.keyboard.press('Space');
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(false);
  await page.keyboard.press('Space');
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
  await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click();
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
  await page.getByRole('button', { name: 'Exit fullscreen', exact: true }).click();
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false);
});

test('settings keyboard dismissal, focus, rate and screen-reader status', async ({ page }) => {
  await openPlayer(page);
  const settings = page.getByRole('button', { name: 'Settings', exact: true });
  await settings.focus();
  await page.keyboard.press('Enter');
  await expect(settings).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(settings).toHaveAttribute('aria-expanded', 'false');
  await expect(settings).toBeFocused();
  expect(await settings.evaluate(e => getComputedStyle(e).outlineStyle)).toBe('solid');
  await settings.click();
  await page.getByRole('menuitem', { name: /speed/i }).click();
  await page.getByRole('menuitemradio', { name: '1.5×', exact: true }).click();
  await expect.poll(() => page.locator('video').evaluate(v => v.playbackRate)).toBe(1.5);
  await page.keyboard.press('Escape');
  await page.locator('.media-skin').focus();
  await page.keyboard.press('m');
  await expect(page.locator('.media-status-announcer')).toContainText(/muted/i);
});

for (const width of [240, 320, 390]) {
  test(`narrow ${width}px player: controls fit, remain labeled and work`, async ({ page }) => {
    await page.setViewportSize({ width: Math.max(320, width), height: 850 });
    const video = await openPlayer(page, `/preview.html#width=${width}&ratio=16:9`);
    const skin = page.locator('.media-skin');
    const bounds = await skin.boundingBox();
    const controls = page.locator('.video-controls-bottom');
    const boxes = await controls.locator('button:visible').evaluateAll(elements =>
      elements.map(e => { const r = e.getBoundingClientRect(); return { x: r.x, right: r.right, width: r.width, height: r.height }; }));
    for (const box of boxes) {
      expect(box.x).toBeGreaterThanOrEqual(bounds!.x);
      expect(box.right).toBeLessThanOrEqual(bounds!.x + bounds!.width + 1);
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await expect(page.locator('.media-time-duration-value')).toBeVisible();
    await page.getByRole('button', { name: 'Play', exact: true }).last().click();
    await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(0.1);
    await page.getByRole('button', { name: 'Pause', exact: true }).last().click();
    await page.screenshot({ path: `test-results/ma-${width}.png`, fullPage: true });
  });
}

test('reduced motion, bright/dark video surfaces, accessibility and screenshots', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openPlayer(page);
  await page.getByRole('button', { name: 'Play', exact: true }).last().click();
  await expect.poll(() => page.locator('video').evaluate(v => v.currentTime)).toBeGreaterThan(0.1);
  await page.getByRole('button', { name: 'Pause', exact: true }).last().click();
  await expect(page.locator('.media-poster')).not.toHaveAttribute('data-visible', '');
  for (const filter of ['brightness(0)', 'brightness(0) invert(1)']) {
    await page.locator('video').evaluate((v, filter) => { v.style.filter = filter; }, filter);
    const violations = (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations;
    expect(violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
  }
  await page.locator('video').evaluate(v => { v.style.filter = ''; });
  await page.screenshot({ path: 'test-results/ma-desktop.png', fullPage: true });
  expect(await page.locator('.media-button').first().evaluate(e => getComputedStyle(e).transitionDuration)).toBe('0s');
});

test('failed media opens the real error dialog and can be dismissed', async ({ page }) => {
  await page.route('**/media/flower.mp4', route => route.abort());
  await page.goto('/preview.html');
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(/error|load|supported|play/i);
  await page.screenshot({ path: 'test-results/ma-error.png', fullPage: true });
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('touch playback and menu dismissal on a phone', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await mockPexelsMedia(page);
  const video = await openPlayer(page, 'http://127.0.0.1:4173/ma.html');
  await page.getByRole('button', { name: 'Play', exact: true }).last().tap();
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(0.1);
  await page.getByRole('button', { name: 'Pause', exact: true }).last().tap();
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
  const settings = page.getByRole('button', { name: 'Settings', exact: true });
  await settings.tap();
  await expect(settings).toHaveAttribute('aria-expanded', 'true');
  await page.locator('h1').tap();
  await expect(settings).toHaveAttribute('aria-expanded', 'false');
  await page.screenshot({ path: 'test-results/ma-phone.png', fullPage: true });
  await context.close();
});

test('idle controls return with keyboard focus; German and Arabic labels load', async ({ page }) => {
  await openPlayer(page, '/preview.html#width=672&loop=1&locale=de');
  await page.getByRole('button', { name: 'Wiedergabe', exact: true }).last().click();
  await page.mouse.click(1, 1);
  await expect(page.locator('.video-controls-content')).not.toHaveAttribute('data-visible', '', { timeout: 8000 });
  const button = page.locator('.video-controls-bottom .media-play-button');
  await button.focus();
  await expect(page.locator('.video-controls-bottom')).toHaveCSS('opacity', '1');
  await expect(button).toBeFocused();
  await page.keyboard.press('Space');
  await expect.poll(() => page.locator('video').evaluate(v => v.paused)).toBe(true);
  await page.goto('/preview.html#width=320&locale=ar');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toHaveCount(0);
  await expect(page.locator('.media-time-duration-value')).toBeVisible();
});
