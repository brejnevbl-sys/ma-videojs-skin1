import { expect, test } from '@playwright/test';

// These regressions use the committed Pexels MP4s; no route fixtures.
async function openFilm(page: import('@playwright/test').Page) {
  await page.goto('/');
  const video = page.locator('video');
  await expect.poll(() => video.evaluate(v => v.readyState)).toBeGreaterThanOrEqual(2);
  return video;
}

test('Ma Pause ensō is decorative, state-based and instantly reversible on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const video = await openFilm(page);
  const center = page.locator('.video-controls-center-play');
  await expect(center).toHaveAttribute('data-paused', '');
  const ink = await center.evaluate(el => {
    const css = getComputedStyle(el, '::after');
    return { content: css.content, pointerEvents: css.pointerEvents, animationName: css.animationName };
  });
  expect(ink.content).not.toBe('none');
  expect(ink.pointerEvents).toBe('none');
  expect(ink.animationName).toContain('ma-ink-breathe');

  // Keyboard controls remain native; no decorative animation may delay response.
  await page.locator('.media-skin').focus();
  await page.keyboard.press('Space');
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(false);
  await expect(center).not.toHaveAttribute('data-paused', '');
  await page.keyboard.press('Space');
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
  await expect(center).toHaveAttribute('data-paused', '');

  // The same visual state must work after selecting the second real movie.
  await page.getByRole('radio').last().check();
  await expect.poll(() => video.evaluate(v => v.duration)).toBeGreaterThan(13);
  await expect.poll(() => video.evaluate(v => v.duration)).toBeLessThan(15);
  await expect(center).toHaveAttribute('data-paused', '');
});

test('Ma Pause ink on mobile never changes Play hit target', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const video = await openFilm(page);
  const play = page.locator('.video-controls-start > .media-play-button');
  await expect(play).toHaveAttribute('data-paused', '');
  const ink = await play.evaluate(el => {
    const css = getComputedStyle(el, '::after');
    const box = el.getBoundingClientRect();
    return { content: css.content, pointerEvents: css.pointerEvents, width: box.width, height: box.height };
  });
  expect(ink.content).not.toBe('none');
  expect(ink.pointerEvents).toBe('none');
  expect(ink.width).toBeGreaterThanOrEqual(44);
  expect(ink.height).toBeGreaterThanOrEqual(44);
  await play.click();
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(false);
});

test('Ma Pause respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await openFilm(page);
  const center = page.locator('.video-controls-center-play');
  await expect(center).toHaveAttribute('data-paused', '');
  const style = await center.evaluate(el => {
    const ink = getComputedStyle(el, '::after');
    return { content: ink.content, animationName: ink.animationName, pointerEvents: ink.pointerEvents };
  });
  expect(style.content).not.toBe('none');
  expect(style.animationName).toBe('none');
  expect(style.pointerEvents).toBe('none');
});
