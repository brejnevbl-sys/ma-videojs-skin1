import { mockPexelsMedia } from './pexels-fixture';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => { await mockPexelsMedia(page); });


for (const url of ['/', '/ma.html']) {
  test(`MA landing and real media at ${url}`, async ({ page }) => {
    await page.goto(url);
    await expect(page).toHaveTitle('MA — The Art of Interval');
    await expect(page.getByRole('heading', { name: 'About the skin' })).toBeVisible();
    await expect(page.locator('iframe')).toHaveCount(0);
    if (url === '/') await page.screenshot({ path: 'test-results/m3-home-desktop.png', fullPage: true });
    await expect.poll(() => page.locator('video').evaluate(v => v.readyState)).toBeGreaterThanOrEqual(2);
    await page.getByRole('button', { name: 'Play', exact: true }).last().click();
    await expect.poll(() => page.locator('video').evaluate(v => v.currentTime)).toBeGreaterThan(.1);
    await page.getByRole('button', { name: 'Pause', exact: true }).last().click();
    const film = await page.locator('video').evaluate(v => v.currentSrc);
    expect(film).toBe('http://127.0.0.1:4173/media/pexels/rainy-day.mp4');
    const response = await page.request.get('/media/flower.mp4', { headers: { Range: 'bytes=0-99' } });
    expect(response.status()).toBe(206);
    expect(response.headers()['content-type']).toContain('video/mp4');
    expect((await response.body()).length).toBe(100);
    await expect(page.locator('.media-poster-image')).toHaveAttribute('src', '/media/pexels/rainy-day.jpg');
    const credit = await page.getByRole('link', { name: 'Roberto Lee Cortes · Pexels' }).first().getAttribute('href');
    expect((await page.request.get(credit!)).ok()).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
    await page.getByRole('link', { name: 'Skin workbench' }).click();
    await expect(page).toHaveURL(/\/workbench\/$/);
    await expect(page.locator('iframe')).toHaveAttribute('src', /^\/preview.html#/);
    await page.getByRole('link', { name: 'MA home', exact: true }).click();
    await expect(page).toHaveURL('http://127.0.0.1:4173/');
    if (url === '/') {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({ path: 'test-results/m3-home-phone.png', fullPage: true });
    }
  });
}

test('nested workbench retains options, frame messaging, share URLs and separate preview', async ({ page }) => {
  await page.goto('/workbench/?width=240&ratio=9:16&locale=ar&muted=1&loop=1');
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect.poll(() => frame.locator('video').evaluate(v => v.readyState)).toBeGreaterThanOrEqual(2);
  await expect.poll(() => frame.locator('video').evaluate(v => v.muted && v.loop)).toBe(true);
  await expect(frame.locator('.media-skin')).toHaveCSS('width', '240px');
  await page.getByRole('switch', { name: 'Loop', exact: true }).click();
  await expect.poll(() => frame.locator('video').evaluate(v => v.loop)).toBe(false);
  await expect(page).toHaveURL(/loop=0/);
  await page.reload();
  await expect.poll(() => page.frameLocator('iframe').locator('video').evaluate(v => v.loop)).toBe(false);
  const newTab = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Open the preview in a new tab' }).click();
  const preview = await newTab;
  await expect(preview).toHaveURL(/\/preview.html#.*locale=ar/);
  await expect(preview.locator('html')).toHaveAttribute('lang', 'ar');
  await preview.close();
});

for (const width of [240, 320, 390]) {
  test(`all rates reachable by keyboard and touch scrolling at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 430, height: 850 }, hasTouch: true });
    const page = await context.newPage();
  await mockPexelsMedia(page);
    await page.goto(`http://127.0.0.1:4173/preview.html#width=${width}`);
    await expect.poll(() => page.locator('video').evaluate(v => v.readyState)).toBeGreaterThanOrEqual(2);
    const settings = page.getByRole('button', { name: 'Settings', exact: true });
    await settings.tap();
    await page.getByRole('menuitem', { name: /speed/i }).tap();
    const options = page.getByRole('menuitemradio');
    const count = await options.count();
    expect(count).toBeGreaterThan(4);
    const panel = page.locator('.media-menu-content[data-submenu]');
    await expect.poll(() => panel.evaluate(e => e.scrollHeight - e.clientHeight)).toBeGreaterThan(0);
    // An actual touch swipe, rather than programmatically setting scrollTop.
    const box = (await panel.boundingBox())!;
    const cdp = await context.newCDPSession(page);
    const x = box.x + box.width / 2;
    const bottom = box.y + box.height - 10;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: bottom }] });
    for (let step = 1; step <= 8; step++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: bottom - step * 8 }] });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(() => panel.evaluate(e => e.scrollTop)).toBeGreaterThan(0);
    // Keyboard End must reveal the final option even in the 240px viewport.
    await options.first().focus();
    await page.keyboard.press('End');
    await expect(options.last()).toBeFocused();
    const expected = Number.parseFloat((await options.last().textContent())!);
    await page.keyboard.press('Enter');
    await expect.poll(() => page.locator('video').evaluate(v => v.playbackRate)).toBe(expected);
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect(settings).toBeFocused();
    await settings.tap();
    await page.getByRole('menuitem', { name: /speed/i }).tap();
    const first = page.getByRole('menuitemradio').first();
    await first.scrollIntoViewIfNeeded();
    await first.tap();
    await expect.poll(() => page.locator('video').evaluate(v => v.playbackRate)).toBe(.5);
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await settings.tap();
    await page.getByRole('menuitem', { name: /speed/i }).tap();
    await page.getByRole('menuitemradio').last().focus();
    await expect(page.locator('.media-menu-popup')).toHaveCSS('opacity', '1');
    await page.screenshot({ path: `test-results/m3-menu-${width}.png`, fullPage: true });
    const bounds = (await page.locator('.media-skin').boundingBox())!;
    await page.touchscreen.tap(bounds.x + 3, bounds.y + 80);
    await expect(settings).toHaveAttribute('aria-expanded', 'false');
    await context.close();
  });
}
