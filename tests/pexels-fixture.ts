import { readFile } from 'node:fs/promises';
import type { Page } from '@playwright/test';

/** Test transport only: MDN fixture bytes exercise source switching, not Pexels film authenticity/durations. */
export async function mockPexelsMedia(page: Page) {
  await page.route('**/media/pexels/*', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('.mp4') || path.endsWith('.jpg')) {
      const video = path.endsWith('.mp4');
      const body = await readFile(`apps/preview/public/media/${video ? 'flower.mp4' : 'flower-poster.jpg'}`);
      const range = route.request().headers().range?.match(/bytes=(\d+)-(\d*)/);
      const start = range ? Number(range[1]) : 0;
      const end = range?.[2] ? Math.min(Number(range[2]), body.length - 1) : body.length - 1;
      await route.fulfill({ status: range ? 206 : 200,
        headers: { 'content-type': video ? 'video/mp4' : 'image/jpeg', 'accept-ranges': 'bytes',
          ...(range ? { 'content-range': `bytes ${start}-${end}/${body.length}` } : {}) },
        body: route.request().method() === 'HEAD' ? '' : body.subarray(start, end + 1) });
    } else await route.continue();
  });
}
