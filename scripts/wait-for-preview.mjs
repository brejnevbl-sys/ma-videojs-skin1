import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';

async function waitForPreview() {
  const url = process.env.MA_PREVIEW_URL;
  const expected = process.env.MA_EXPECTED_REVISION;
  if (!url || !expected) throw new Error('MA_PREVIEW_URL and MA_EXPECTED_REVISION are required.');
  let observed = 'no response';
  for (let attempt = 1; attempt <= 36; attempt++) {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { 'Cache-Control': 'no-cache' } });
    if ([401, 403].includes(response.status)) throw new Error(`Preview access denied: HTTP ${response.status}.`);
    const html = await response.text();
    const revision = html.match(/<meta\s+name="ma-revision"\s+content="([^"]+)"/i)?.[1];
    const destination = new URL(response.url);
    observed = `HTTP ${response.status}, revision=${revision ?? 'missing'}, destination=${destination.origin}${destination.pathname}`;
    if (process.env.CI) {
      mkdirSync('test-results/vercel', { recursive: true });
      writeFileSync('test-results/vercel/deployment-access.json', JSON.stringify({
        expected, revision: revision ?? null, status: response.status(),
        destination: `${destination.origin}${destination.pathname}`,
      }, null, 2));
    }
    console.log(`Preview attempt ${attempt}: HTTP ${response.status}, revision=${revision ?? 'missing'}, expected=${expected}`);
    if (response.ok && revision === expected) process.exit(0);
    if (destination.origin !== new URL(url).origin) throw new Error(`Preview redirected outside the site without the expected revision: ${destination.origin}${destination.pathname}`);
    if (attempt < 36) await new Promise(resolve => setTimeout(resolve, 10000));
  }
  throw new Error(`The current revision did not become available on Vercel Preview within six minutes; ${observed}; expected=${expected}.`);
}

waitForPreview().catch(error => {
  const message = `Vercel Preview: ${error.message}`.replace(/\s+/g, ' ').slice(0, 500);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `failure_detail=${message}\n`);
  console.error(message);
  process.exitCode = 1;
});
