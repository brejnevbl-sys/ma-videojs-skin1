import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Intentionally no route interception or mockPexelsMedia: these tests require the committed binaries.
for (const width of [240, 320, 390, 1440]) {
  test(`actual Pexels files: durations, decoded frames, posters, seek and switching at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const video = page.locator('video');
    await expect.poll(() => video.evaluate(v => v.readyState)).toBeGreaterThanOrEqual(2);
    const node = await video.elementHandle();
    const document = await page.evaluateHandle(() => window.document);
    const cases = [
      { id: 'rainy-day', duration: 60.143417, width: 1280, height: 720, time: '1:00' },
      { id: 'autumn-temple', duration: 14, width: 960, height: 540, time: '0:14' },
    ];
    for (const [index, film] of cases.entries()) {
      if (index) {
        await page.getByRole('radio').first().focus();
        await page.keyboard.press('ArrowRight');
        await expect(page.getByRole('button', { name: 'Play', exact: true }).last()).toBeVisible();
      }
      await expect.poll(() => video.evaluate(v => v.currentSrc)).toContain(`${film.id}.mp4`);
      await expect.poll(() => video.evaluate(v => v.readyState)).toBeGreaterThanOrEqual(2);
      await expect.poll(async () => Math.abs(await video.evaluate(v => v.duration) - film.duration)).toBeLessThan(.25);
      expect(await video.evaluate(v => [v.videoWidth, v.videoHeight])).toEqual([film.width, film.height]);
      if (index) await expect.poll(() => video.evaluate(v => v.paused && v.currentTime < .1)).toBe(true);
      if (index) await expect.poll(() => video.evaluate(v => v.muted)).toBe(true);
      expect(await node!.evaluate(e => e === window.document.querySelector('video'))).toBe(true);
      expect(await document.evaluate(d => d === window.document)).toBe(true);
      await expect(page.locator('.media-time-duration-value')).toHaveText(film.time);
      const poster = page.locator('.media-poster-image');
      await expect(poster).toHaveAttribute('src', `/media/pexels/${film.id}.jpg`);
      await expect.poll(() => poster.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth === 960 && e.naturalHeight === 540)).toBe(true);
      const image = await page.request.get(`/media/pexels/${film.id}.jpg`);
      expect(image.ok()).toBe(true);
      expect(image.headers()['content-type']).toContain('image/jpeg');
      expect(createHash('sha256').update(await image.body()).digest('hex')).toBe(createHash('sha256').update(await readFile(`apps/preview/public/media/pexels/${film.id}.jpg`)).digest('hex'));
      const partial = await page.request.get(`/media/pexels/${film.id}.mp4`, { headers: { Range: 'bytes=0-1023' } });
      expect(partial.status()).toBe(206);
      expect(partial.headers()['content-type']).toContain('video/mp4');
      expect(partial.headers()['content-range']).toMatch(/^bytes 0-1023\//);
      const bytes = await readFile(`apps/preview/public/media/pexels/${film.id}.mp4`);
      expect((await partial.body()).equals(bytes.subarray(0, 1024))).toBe(true);
      // Exercise scoped keyboard playback with the actual MP4 after using the volume popup.
      if (index) await page.getByRole('button', { name: 'Unmute', exact: true }).click();
      const mute = page.getByRole('button', { name: 'Mute', exact: true });
      await page.mouse.move(1, 1);
      await mute.hover();
      await expect(mute).toHaveAttribute('aria-expanded', 'true');
      const volume = page.getByRole('slider', { name: /volume/i });
      await volume.focus();
      await expect(volume).toBeFocused();
      await page.keyboard.press('End');
      await page.keyboard.press('ArrowDown');
      await expect.poll(() => video.evaluate(v => v.volume)).toBeLessThan(1);
      expect(await video.evaluate(v => v.currentTime)).toBe(0);
      await page.keyboard.press('Escape');
      await expect(mute).toBeFocused();
      await page.locator('.media-skin').focus();
      await expect(page.locator('.media-skin')).toBeFocused();
      await page.keyboard.press('Space');
      await expect.poll(() => video.evaluate(v => v.paused)).toBe(false);
      await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(.2);
      await page.keyboard.press('Space');
      await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
      await page.getByRole('button', { name: 'Play', exact: true }).last().click();
      await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(.2);
      await expect.poll(() => video.evaluate(v => v.getVideoPlaybackQuality().totalVideoFrames)).toBeGreaterThan(3);
      await page.getByRole('button', { name: 'Pause', exact: true }).last().click();
      const rail = (await page.locator('.media-time-slider').boundingBox())!;
      await page.mouse.click(rail.x + rail.width * .5, rail.y + rail.height / 2);
      await expect.poll(async () => Math.abs(await video.evaluate(v => v.currentTime) - film.duration * .5)).toBeLessThan(.6);
      await page.getByRole('slider', { name: 'Seek', exact: true }).focus();
      await page.keyboard.press('End');
      await expect.poll(async () => Math.abs(await video.evaluate(v => v.currentTime) - film.duration)).toBeLessThan(.25);
      await page.keyboard.press('Home');
      await expect.poll(() => video.evaluate(v => v.currentTime)).toBeLessThan(.1);
      await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click();
      await expect.poll(() => page.evaluate(() => !!window.document.fullscreenElement)).toBe(true);
      await page.getByRole('button', { name: 'Exit fullscreen', exact: true }).click();
      if (!index) {
        await page.getByRole('button', { name: 'Mute', exact: true }).click();
        // Switch the real source while it is playing, not only while paused.
        await page.getByRole('button', { name: 'Play', exact: true }).last().click();
        await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(.2);
      }
      expect(await page.evaluate(() => window.document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `test-results/real-${film.id}-${width}.png`, fullPage: true });
    }
    await page.getByRole('radio').first().check();
    await expect.poll(() => video.evaluate(v => v.currentSrc)).toContain('rainy-day.mp4');
    await expect.poll(() => video.evaluate(v => v.readyState)).toBeGreaterThanOrEqual(2);
    await expect.poll(() => video.evaluate(v => v.paused && v.currentTime < .1)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('volume hover reopens during its exit transition without losing keyboard seek isolation', async ({ page }) => {
  await page.goto('/');
  const video = page.locator('video');
  await expect.poll(() => video.evaluate(v => v.readyState)).toBeGreaterThanOrEqual(2);
  // Widen the real exit transition so the former race is deterministic, not a timing lottery.
  await page.addStyleTag({ content: '.media-volume-popover-popup { transition-duration: 1s !important; }' });
  const mute = page.getByRole('button', { name: 'Mute', exact: true });
  await mute.hover();
  await expect(mute).toHaveAttribute('aria-expanded', 'true');
  await page.mouse.move(1, 1);
  const popup = page.locator('.media-volume-popover-popup');
  await expect(popup).toHaveAttribute('data-ending-style', '');
  await mute.hover();
  await expect(mute).toHaveAttribute('aria-expanded', 'true');
  const volume = page.getByRole('slider', { name: /volume/i });
  await volume.focus();
  await expect(volume).toBeFocused();
  await page.keyboard.press('Home');
  await expect.poll(() => video.evaluate(v => v.volume)).toBe(0);
  await page.keyboard.press('End');
  await expect.poll(() => video.evaluate(v => v.volume)).toBe(1);
  expect(await video.evaluate(v => v.currentTime)).toBe(0);
  await page.keyboard.press('Escape');
  await expect(mute).toBeFocused();
  await page.locator('.media-skin').focus();
  await page.keyboard.press('Space');
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(false);
  await page.keyboard.press('Space');
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
});
