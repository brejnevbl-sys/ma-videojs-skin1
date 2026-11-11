import { mockPexelsMedia } from './pexels-fixture';
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => { await mockPexelsMedia(page); });


async function open(page: Page, path = '/preview.html#width=960&loop=1') {
  await page.goto(path);
  await expect.poll(() => page.locator('video').evaluate(v => v.readyState)).toBeGreaterThanOrEqual(2);
  return page.locator('video');
}

test('brush keeps a 48px hit area and accurate seeking across the complete rail', async ({ page }) => {
  const video = await open(page);
  const rail = page.locator('.media-time-slider');
  const rect = (await rail.boundingBox())!;
  expect(rect.height).toBeGreaterThanOrEqual(48);
  await expect(page.locator('.media-time-slider-track')).toHaveCSS('height', '12px');
  expect(await page.locator('.media-time-slider-track').evaluate(e => getComputedStyle(e).maskImage)).toContain('svg');
  const duration = await video.evaluate(v => v.duration);
  for (const percent of [.1, .35, .7, .95]) {
    // Click near the top of the invisible target, away from the 12px painted stroke.
    await page.mouse.click(rect.x + rect.width * percent, rect.y + 4);
    await expect.poll(async () => Math.abs(await video.evaluate(v => v.currentTime) - duration * percent)).toBeLessThan(.15);
  }
  const seek = page.getByRole('slider', { name: 'Seek', exact: true });
  await seek.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(seek).toBeFocused();
  await expect(rail).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Home');
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBe(0);
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => Math.abs(await video.evaluate(v => v.currentTime) - 1)).toBeLessThan(.02);
  await page.screenshot({ path: 'test-results/m2-focus.png', fullPage: true });
  await page.keyboard.press('End');
  await expect.poll(async () => Math.abs(await video.evaluate(v => v.currentTime) - duration)).toBeLessThan(.1);
});

test('keyboard tab order follows visible controls, with a visible focus ring', async ({ page }) => {
  await open(page);
  const controls = await page.locator('.media-skin button:visible, .media-skin [role="slider"]:visible').elementHandles();
  const tabbable = [];
  for (const control of controls) {
    if (await control.evaluate(e => (e as HTMLElement).tabIndex >= 0)) tabbable.push(control);
  }
  expect(tabbable.length).toBeGreaterThanOrEqual(7);
  await page.locator('.media-skin').focus();
  for (const control of tabbable) {
    if (await control.evaluate(e => e.textContent === 'Settings')) {
      // Keyboard focus on Mute opens its real volume popover, adding a tab stop.
      const volume = page.getByRole('slider', { name: 'Volume', exact: true });
      await expect(volume).toBeVisible();
      await page.keyboard.press('Tab');
      await expect(volume).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button', { name: 'Mute', exact: true })).toBeFocused();
      await expect(page.getByRole('button', { name: 'Mute', exact: true })).toHaveAttribute('aria-expanded', 'false');
    }
    await page.keyboard.press('Tab');
    expect(await control.evaluate(e => e === document.activeElement)).toBe(true);
    expect(await control.evaluate(e => getComputedStyle(e).outlineStyle)).toBe('solid');
  }
});

for (const width of [240, 390]) {
  test(`settings popup fits the ${width}px player and preserves 44px menu targets`, async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 850 });
    await open(page, `/preview.html#width=${width}`);
    const settings = page.getByRole('button', { name: 'Settings', exact: true });
    await settings.click();
    await page.getByRole('menuitem', { name: /speed/i }).click();
    const popup = page.locator('.media-menu-popup');
    const box = (await popup.boundingBox())!;
    const skin = (await page.locator('.media-skin').boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(skin.x - 1);
    expect(box.x + box.width).toBeLessThanOrEqual(skin.x + skin.width + 1);
    expect(box.y).toBeGreaterThanOrEqual(skin.y - 1);
    expect(box.y + box.height).toBeLessThanOrEqual(skin.y + skin.height + 1);
    const options = page.getByRole('menuitemradio');
    for (const option of await options.elementHandles()) {
      expect((await option.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({ path: `test-results/m2-settings-${width}.png`, fullPage: true });
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect(settings).toBeFocused();
  });
}

test('touch dock stays discoverable when idle, including emulated phone fullscreen', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await mockPexelsMedia(page);
  await open(page, 'http://127.0.0.1:4173/preview.html#width=390&loop=1');
  await page.getByRole('button', { name: 'Play', exact: true }).last().tap();
  await page.locator('.media-skin').tap({ position: { x: 180, y: 80 } });
  await expect(page.locator('.video-controls-content')).not.toHaveAttribute('data-visible', '');
  await expect(page.locator('.video-controls-bottom')).toHaveCSS('opacity', '1');
  await expect(page.getByRole('button', { name: 'Pause', exact: true }).last()).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).last().tap();
  await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).tap();
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
  await page.getByRole('button', { name: 'Exit fullscreen', exact: true }).tap();
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false);
  await open(page, 'http://127.0.0.1:4173/ma.html');
  await page.screenshot({ path: 'test-results/m2-phone-paused.png', fullPage: true });
  await page.getByRole('button', { name: 'Play', exact: true }).last().tap();
  await expect.poll(() => page.locator('video').evaluate(v => v.currentTime)).toBeGreaterThan(.15);
  await page.screenshot({ path: 'test-results/m2-phone-playing.png', fullPage: true });
  await context.close();
});

test('forced colors restores a solid rail and reduced motion removes transitions', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await open(page);
  await expect(page.locator('.media-time-slider-track')).toHaveCSS('mask-image', 'none');
  await expect(page.locator('.media-time-slider-track')).toHaveCSS('clip-path', 'none');
  await expect(page.locator('.media-button').first()).toHaveCSS('transition-duration', '0s');
  await page.getByRole('slider', { name: 'Seek', exact: true }).focus();
  await page.screenshot({ path: 'test-results/m2-forced-colors.png', fullPage: true });
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => Math.abs(await page.locator('video').evaluate(v => v.currentTime) - 1)).toBeLessThan(.02);
});

test('real delayed media shows the loading ring and recovers when the network resumes', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/media/flower.mp4', async route => { await gate; await route.continue(); });
  await page.goto('/preview.html#width=960', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Play', exact: true }).last().click();
  try {
    const loading = page.locator('.media-buffering-indicator-backdrop');
    await expect(loading).toHaveAttribute('data-visible', '');
    await expect(loading).toBeVisible();
    await page.screenshot({ path: 'test-results/m2-loading.png', fullPage: true });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await loading.evaluate(e => getComputedStyle(e, '::after').animationName)).toBe('none');
  } finally {
    release();
  }
  await expect.poll(() => page.locator('video').evaluate(v => v.currentTime)).toBeGreaterThan(.1);
  await expect(page.locator('.media-buffering-indicator-backdrop')).not.toBeVisible();
});

test('MA identity and state visuals: paused, playing, idle, menu, bright and dark', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await open(page, '/ma.html');
  await page.mouse.move(1, 1);
  await page.screenshot({ path: 'test-results/m2-desktop-paused.png', fullPage: true });
  await page.getByRole('button', { name: 'Play', exact: true }).last().click();
  await expect.poll(() => page.locator('video').evaluate(v => v.currentTime)).toBeGreaterThan(.15);
  await expect(page.locator('.video-controls-center')).toHaveCSS('opacity', '0');
  await page.screenshot({ path: 'test-results/m2-desktop-playing.png', fullPage: true });
  await page.getByRole('button', { name: 'Pause', exact: true }).last().click();
  await expect(page.locator('.video-controls-center')).toHaveCSS('opacity', '1');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.screenshot({ path: 'test-results/m2-settings-desktop.png', fullPage: true });
  await page.keyboard.press('Escape');
  for (const [name, filter] of [['dark', 'brightness(0)'], ['bright', 'brightness(0) invert(1)']]) {
    await page.locator('video').evaluate((v, filter) => { v.style.filter = filter; }, filter);
    await expect(page.locator('.media-poster')).not.toHaveAttribute('data-visible', '');
    const violations = (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations;
    expect(violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
    await page.screenshot({ path: `test-results/m2-${name}.png`, fullPage: true });
  }
});

test('center play never hides keyboard focus; compact widescreen removes overlapping center controls', async ({ page }) => {
  await open(page);
  const center = page.locator('.video-controls-center .media-play-button');
  await center.focus();
  await page.keyboard.press('Space');
  await expect.poll(() => page.locator('video').evaluate(v => v.paused)).toBe(false);
  await expect(center).toBeFocused();
  await expect(page.locator('.video-controls-center')).toHaveCSS('visibility', 'visible');
  await page.goto('/preview.html#width=512&ratio=21:9');
  await page.reload();
  await expect(page.locator('.video-controls-center')).not.toBeVisible();
  const top = (await page.locator('.video-controls-top').boundingBox())!;
  const bottom = (await page.locator('.video-controls-bottom').boundingBox())!;
  expect(top.y + top.height).toBeLessThanOrEqual(bottom.y);
});

test('public styling properties and contrast of rail and time survive a white video frame', async ({ page }) => {
  await open(page);
  const ratios = await page.locator('.media-skin').evaluate(skin => {
    const color = (value: string) => value.match(/[\d.]+/g)!.map(Number);
    const luminance = (rgb: number[]) => rgb.slice(0, 3).map(v => {
      v /= 255;
      return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
    }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    const surface = color(getComputedStyle(skin.querySelector('.video-controls-bottom')!).backgroundColor);
    const alpha = surface[3] ?? 1;
    const whiteFrame = surface.slice(0, 3).map(v => v * alpha + 255 * (1 - alpha));
    const ratio = (foreground: number[]) => {
      const [light, dark] = [luminance(foreground), luminance(whiteFrame)].sort((a, b) => b - a);
      return (light + .05) / (dark + .05);
    };
    return {
      rail: ratio(color(getComputedStyle(skin.querySelector('.media-time-slider-track')!, '::before').backgroundColor)),
      fill: ratio(color(getComputedStyle(skin.querySelector('.media-time-slider-fill')!).backgroundColor)),
      text: ratio(color(getComputedStyle(skin.querySelector('.media-time-current-value')!).color)),
    };
  });
  expect(ratios.rail).toBeGreaterThanOrEqual(3);
  expect(ratios.fill).toBeGreaterThanOrEqual(3);
  expect(ratios.text).toBeGreaterThanOrEqual(4.5);
  await page.locator('.media-skin').evaluate((e: HTMLElement) => {
    e.style.setProperty('--media-accent-color', '#71a99b');
    e.style.setProperty('--media-border-radius', '12px');
  });
  await expect(page.locator('.media-time-slider-fill')).toHaveCSS('background-color', 'rgb(113, 169, 155)');
  await expect(page.locator('.media-skin')).toHaveCSS('border-radius', '12px');
});
