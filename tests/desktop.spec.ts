import { test, expect, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

// This entire suite uses committed MP4/JPG files. No fixture imports or request interception.
const sizes = [
  { width: 1280, height: 720, label: '1280' },
  { width: 1366, height: 768, label: '1366' },
  { width: 1440, height: 900, label: '1440' },
  { width: 1920, height: 1080, label: '1920' },
  { width: 2560, height: 1440, label: '2560' },
  { width: 960, height: 720, label: 'narrow-window' },
  { width: 1024, height: 576, label: '1280-at-125-percent' },
  { width: 853, height: 480, label: '1280-at-150-percent' },
];
type NetworkRecord = { path: string; method: string; status: number; type?: string; range?: string };
const audits = new WeakMap<Page, { errors: string[]; network: NetworkRecord[] }>();
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const values: number[] = [];
    const pointers: unknown[] = [];
    Object.assign(window, { maLayoutShifts: values, maPointers: pointers });
    for (const type of ['pointerdown', 'pointerup']) document.addEventListener(type, event => {
      const e = event as PointerEvent;
      pointers.push({ type, target: (e.target as HTMLElement).className, x: e.clientX, y: e.clientY, volume: document.querySelector('video')?.volume });
      if (pointers.length > 10) pointers.shift();
    }, true);
    if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries() as (PerformanceEntry & { hadRecentInput: boolean; value: number })[]) {
          if (!entry.hadRecentInput) values.push(entry.value);
        }
      }).observe({ type: 'layout-shift', buffered: true });
    }
  });
  const audit = { errors: [] as string[], network: [] as NetworkRecord[] };
  audits.set(page, audit);
  page.on('pageerror', e => audit.errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') audit.errors.push(`${m.location().url}: ${m.text()}`); });
  page.on('response', response => {
    const path = new URL(response.url()).pathname;
    if (path.includes('/media/pexels/')) audit.network.push({ path, method: response.request().method(), status: response.status(), type: response.headers()['content-type'], range: response.headers()['content-range'] });
  });
});
test.afterEach(async ({ page, browser }, info) => {
  const audit = audits.get(page)!;
  const capabilities = await page.evaluate(() => ({
    userAgent: navigator.userAgent,
    scope: 'CSSScopeRule' in window, has: CSS.supports('selector(:has(*))'),
    mask: CSS.supports('mask-image', 'url("")'), clip: CSS.supports('clip-path', 'inset(0)'),
    containerQueries: CSS.supports('container-type', 'inline-size'), fullscreen: document.fullscreenEnabled,
    h264: document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"'),
  }));
  await writeFile(info.outputPath('browser-network.json'), JSON.stringify({ engine: info.project.name, version: browser.version(), capabilities, ...audit }, null, 2));
  expect(audit.errors).toEqual([]);
});
async function open(page: Page) {
  await page.goto('/');
  const video = page.locator('video');
  await expect.poll(() => video.evaluate(v => v.readyState)).toBeGreaterThanOrEqual(2);
  return video;
}
async function shot(page: Page, info: TestInfo, width: number, state: string) {
  await page.locator('.media-skin').screenshot({ path: info.outputPath(`${info.project.name}-${width}-${state}.png`) });
}
async function axe(page: Page) {
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
}
for (const size of sizes) {
  test(`desktop layout ${size.label}: 16:9, first screen, no overflow or autoplay`, async ({ page }) => {
    await page.setViewportSize(size);
    const video = await open(page);
    const frame = (await page.locator('.player-frame').boundingBox())!;
    expect(frame.width / frame.height).toBeCloseTo(16 / 9, 2);
    expect(frame.x).toBeGreaterThanOrEqual(0);
    expect(frame.x + frame.width).toBeLessThanOrEqual(size.width);
    expect(frame.y).toBeLessThan(size.height * .82);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const heading = page.locator('h1');
    expect(await heading.evaluate(e => e.scrollWidth <= e.clientWidth)).toBe(true);
    const title = (await heading.boundingBox())!;
    const description = (await page.locator('.description').boundingBox())!;
    expect(title.x + title.width).toBeLessThanOrEqual(description.x);
    expect(await video.evaluate(v => v.paused && v.preload === 'metadata')).toBe(true);
    const shift = await page.evaluate(() => (window as Window & { maLayoutShifts?: number[] }).maLayoutShifts?.reduce((sum, v) => sum + v, 0) ?? 0);
    expect(shift).toBeLessThan(.01);
    // HEAD probes are allowed; the unselected MP4 must not be downloaded before selection.
    expect(audits.get(page)!.network.some(r => r.path.endsWith('autumn-temple.mp4') && r.method === 'GET')).toBe(false);
    await page.locator('.media-skin').scrollIntoViewIfNeeded();
    const skin = (await page.locator('.media-skin').boundingBox())!;
    for (const control of await page.locator('.video-controls-top button:visible, .video-controls-bottom button:visible').all()) {
      const box = (await control.boundingBox())!;
      const cssSize = await control.evaluate(e => [parseFloat(getComputedStyle(e).width), parseFloat(getComputedStyle(e).height)]);
      expect(cssSize.every(value => value >= 44)).toBe(true);
      // Firefox rect subtraction can produce 43.999996px for an exact 44px CSS target.
      expect(Number(box.width.toFixed(3))).toBeGreaterThanOrEqual(44);
      expect(Number(box.height.toFixed(3))).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(skin.x);
      expect(box.x + box.width).toBeLessThanOrEqual(skin.x + skin.width + 1);
    }
  });
}
for (const width of [1366, 1920]) {
  test(`desktop real films and mouse controls at ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: width === 1366 ? 768 : 1080 });
    const video = await open(page);
    const node = await video.elementHandle();
    const documentHandle = await page.evaluateHandle(() => document);
    for (const [index, film] of [{ id: 'rainy-day', duration: 60.143417 }, { id: 'autumn-temple', duration: 14 }].entries()) {
      if (index) await page.locator('.film-selector label').nth(index).click();
      await expect.poll(() => video.evaluate(v => v.currentSrc)).toContain(`${film.id}.mp4`);
      await expect.poll(() => video.evaluate(v => v.readyState)).toBeGreaterThanOrEqual(2);
      await expect(page.locator('.video-controls-content')).toHaveAttribute('data-visible', '');
      await expect.poll(async () => Math.abs(await video.evaluate(v => v.duration) - film.duration)).toBeLessThan(.1);
      await expect(page.locator('.media-poster-image')).toHaveAttribute('src', `/media/pexels/${film.id}.jpg`);
      await expect.poll(() => page.locator('.media-poster-image').evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth === 960)).toBe(true);
      await expect(page.locator('.film-caption')).toContainText('Silent film · no audio.');
      for (const suffix of ['mp4', 'jpg']) {
        const response = await page.request.head(`/media/pexels/${film.id}.${suffix}`);
        expect(response.ok()).toBe(true);
        expect(response.headers()['content-type']).toContain(suffix === 'mp4' ? 'video/mp4' : 'image/jpeg');
      }
      const range = await page.request.get(`/media/pexels/${film.id}.mp4`, { headers: { Range: 'bytes=0-1023' } });
      expect(range.status()).toBe(206);
      expect((await range.body()).length).toBe(1024);
      await page.getByRole('button', { name: 'Play', exact: true }).last().click();
      await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(.2);
      await expect.poll(() => video.evaluate(v => v.getVideoPlaybackQuality().totalVideoFrames)).toBeGreaterThan(3);
      await shot(page, info, width, `${film.id}-playing`);
      await page.getByRole('button', { name: 'Pause', exact: true }).last().click();
      await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
      const oldTime = await video.evaluate(v => v.currentTime);
      const mute = page.getByRole('button', { name: 'Mute', exact: true });
      await page.mouse.move(1, 1);
      await mute.hover();
      await expect(mute).toHaveAttribute('aria-expanded', 'true');
      const volume = page.getByRole('slider', { name: /volume/i });
      await volume.focus();
      await expect(volume).toBeFocused();
      await page.keyboard.press('Home');
      await expect.poll(() => video.evaluate(v => v.volume)).toBe(0);
      await page.keyboard.press('End');
      await expect.poll(() => video.evaluate(v => v.volume)).toBe(1);
      const volumeBox = (await page.locator('.media-volume-slider').boundingBox())!;
      const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.className, { x: volumeBox.x + volumeBox.width / 2, y: volumeBox.y + volumeBox.height / 2 });
      await page.mouse.click(volumeBox.x + volumeBox.width / 2, volumeBox.y + volumeBox.height / 2);
      await expect.poll(() => video.evaluate(v => v.volume)).toBeGreaterThan(.2);
      try { await expect.poll(() => video.evaluate(v => v.volume)).toBeLessThan(.8); }
      catch (error) {
        const trace = await page.evaluate(() => (window as Window & { maPointers?: unknown[] }).maPointers?.slice(-2));
        throw new Error(`Volume pointer hit=${String(hit)}, events=${JSON.stringify(trace)}, box=${JSON.stringify(volumeBox)}; ${String(error)}`);
      }
      expect(await video.evaluate(v => v.currentTime)).toBe(oldTime);
      if (!index) await shot(page, info, width, 'volume');
      await page.keyboard.press('Escape');
      await expect(mute).toBeFocused();
      const rail = (await page.locator('.media-time-slider').boundingBox())!;
      await page.mouse.click(rail.x + rail.width * .5, rail.y + rail.height / 2);
      await expect.poll(async () => Math.abs(await video.evaluate(v => v.currentTime) - film.duration / 2)).toBeLessThan(.6);
      const settings = page.getByRole('button', { name: 'Settings', exact: true });
      await settings.click();
      await page.getByRole('menuitem', { name: /speed/i }).click();
      const menu = (await page.locator('.media-menu-popup').boundingBox())!;
      expect(menu.x).toBeGreaterThanOrEqual(0);
      expect(menu.x + menu.width).toBeLessThanOrEqual(width);
      await axe(page);
      if (!index) await shot(page, info, width, 'settings');
      await page.keyboard.press('Escape');
      await page.keyboard.press('Escape');
      await expect(settings).toBeFocused();
      await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click();
      await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
      if (!index) await page.screenshot({ path: info.outputPath(`${info.project.name}-${width}-fullscreen.png`) });
      await page.getByRole('button', { name: 'Exit fullscreen', exact: true }).click();
      await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false);
      // Real end/replay, after the native seek has finished, rather than a short substitute film.
      await video.evaluate(v => { v.currentTime = v.duration - .15; });
      await expect.poll(() => video.evaluate(v => !v.seeking && v.readyState >= 2)).toBe(true);
      await page.getByRole('button', { name: 'Play', exact: true }).last().click();
      await expect.poll(() => video.evaluate(v => v.ended)).toBe(true);
      await page.getByRole('button', { name: 'Replay', exact: true }).last().click();
      await expect.poll(() => video.evaluate(v => !v.paused && v.currentTime < 3)).toBe(true);
      // The second source is selected while playback is active.
      expect(await node!.evaluate(e => e === document.querySelector('video'))).toBe(true);
      expect(await documentHandle.evaluate(d => d === document)).toBe(true);
    }
    await page.getByRole('button', { name: 'Pause', exact: true }).last().click();
    await axe(page);
  });
}
test('desktop mouse idle, wheel scrolling and scoped keyboard navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  const video = await open(page);
  const skin = page.locator('.media-skin');
  await page.getByRole('button', { name: 'Play', exact: true }).last().click();
  await page.getByRole('heading', { level: 1 }).click();
  await skin.hover();
  const content = page.locator('.video-controls-content');
  await expect(content).not.toHaveAttribute('data-visible', '', { timeout: 8000 });
  await expect(skin).toHaveCSS('cursor', 'none');
  const box = (await skin.boundingBox())!;
  await page.mouse.move(box.x + box.width * .6, box.y + box.height * .4);
  await expect(content).toHaveAttribute('data-visible', '');
  await expect(skin).not.toHaveCSS('cursor', 'none');
  // Wheel over the picture must continue to scroll the document.
  const oldScroll = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 160);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(oldScroll);
  await page.getByRole('button', { name: 'Pause', exact: true }).last().click();
  const selected = page.getByRole('radio').first();
  await selected.focus();
  const time = await video.evaluate(v => v.currentTime);
  await page.keyboard.press('m');
  await page.keyboard.press('f');
  expect(await video.evaluate(v => v.muted)).toBe(false);
  expect(await page.evaluate(() => !!document.fullscreenElement)).toBe(false);
  expect(await video.evaluate(v => v.currentTime)).toBe(time);
  await skin.focus();
  await expect(skin).toBeFocused();
  await page.keyboard.press('Home');
  await page.keyboard.press('Space');
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(false);
  await page.keyboard.press('Space');
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
  await page.keyboard.press('m');
  await expect.poll(() => video.evaluate(v => v.muted)).toBe(true);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThanOrEqual(10);
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeLessThan(1);
  await page.keyboard.press('f');
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
  await page.keyboard.press('f');
  await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false);
  await skin.focus();
  let escaped = false;
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('Tab');
    if (!await skin.evaluate(e => e.contains(document.activeElement))) { escaped = true; break; }
    expect(await page.evaluate(() => !!document.activeElement?.closest('[inert]'))).toBe(false);
  }
  expect(escaped).toBe(true);
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Settings', exact: true })).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle)).toBe('solid');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.locator('.media-button').first().evaluate(e => getComputedStyle(e).transitionDuration)).toBe('0s');
  await axe(page);
});
