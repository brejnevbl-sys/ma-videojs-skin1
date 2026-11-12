import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mockPexelsMedia } from './pexels-fixture';

for (const width of [240, 390, 1440]) {
  test(`film selector switches real native media without navigation at ${width}px (fixture transport)`, async ({ page }) => {
    await mockPexelsMedia(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const video = page.locator('video');
    await expect.poll(() => video.evaluate(v => v.readyState)).toBeGreaterThanOrEqual(2);
    const originalNode = await video.elementHandle();
    const originalDocument = await page.evaluateHandle(() => document);
    await page.getByRole('button', { name: 'Play', exact: true }).last().click();
    await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(.2);
    await page.getByRole('button', { name: 'Mute', exact: true }).click();
    const choices = page.getByRole('radio');
    await choices.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(choices.last()).toBeChecked();
    await expect.poll(() => video.evaluate(v => v.currentSrc)).toContain('autumn-temple.mp4');
    await expect.poll(() => video.evaluate(v => v.readyState)).toBeGreaterThanOrEqual(2);
    expect(await originalNode!.evaluate(e => e === document.querySelector('video'))).toBe(true);
    expect(await originalDocument.evaluate(e => e === document)).toBe(true);
    await expect.poll(() => video.evaluate(v => v.paused && v.muted && v.currentTime < .1)).toBe(true);
    await expect(page.locator('.media-poster-image')).toHaveAttribute('src', '/media/pexels/autumn-temple.jpg');
    await expect(page.getByRole('link', { name: 'Hideyoshi isai · Pexels' })).toBeVisible();
    await page.getByRole('button', { name: 'Play', exact: true }).last().click();
    await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(.1);
    await page.getByRole('button', { name: 'Pause', exact: true }).last().click();
    await page.getByRole('slider', { name: 'Seek', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(.5);
    await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click();
    await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
    await page.getByRole('button', { name: 'Exit fullscreen', exact: true }).click();
    await choices.first().check();
    await expect.poll(() => video.evaluate(v => v.currentSrc)).toContain('rainy-day.mp4');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  });
}

test('absent film assets are explained and never replaced with MDN footage', async ({ page }) => {
  await page.route('**/media/pexels/*.mp4', route => route.fulfill({ status: 404 }));
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('Film files are not installed yet.');
  await expect(page.locator('video')).toHaveCount(0);
  await page.getByRole('radio').last().check();
  await expect(page.getByRole('status')).toContainText('Hideyoshi isai');
  await expect(page.getByRole('link', { name: 'View the original on Pexels' })).toHaveAttribute('href', /34948034/);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});
