import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Intentionally no route interception or mockPexelsMedia: these tests require the committed binaries.
for (const width of [240, 390, 1440]) {
  test(`actual Pexels files: durations, decoded frames, posters, seek and switching at ${width}px`, async ({ page }) => {
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
      } else {
        await expect.poll(() => video.evaluate(v => v.muted)).toBe(true);
        await page.getByRole('button', { name: 'Unmute', exact: true }).click();
      }
      expect(await page.evaluate(() => window.document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `test-results/real-${film.id}-${width}.png`, fullPage: true });
    }
    await page.getByRole('radio').first().check();
    await expect.poll(() => video.evaluate(v => v.currentSrc)).toContain('rainy-day.mp4');
    await expect.poll(() => video.evaluate(v => v.readyState)).toBeGreaterThanOrEqual(2);
    await expect.poll(() => video.evaluate(v => v.paused && v.currentTime < .1)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
  });
}
