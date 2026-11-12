# Pexels films — implementation and verification

## What is ready

- Two selected-film records with exact titles, authors, original Pexels page links,
  stable local MP4 paths and separate local posters (`apps/preview/src/films.ts`).
- Native accessible radio selector in the MA layout, responsive at 240/390/1440px.
- No navigation on selection; a stable Video.js container/media node when both
  films are available. Native time resets and playback pauses; sound settings remain.
- Film-specific captions and authors. Existing Video.js controls and workbench preserved.
- Missing-asset detection checks MP4 and image MIME via HEAD. The public page does
  not use the MDN sample as either selected Pexels film. The sample is retained only
  in the separate technical preview/workbench, clearly documented as a fixture.
- Manual download/optimization/poster instructions: [PEXELS.md](PEXELS.md).

## Media transfer resolved; production QA pending

The four selected Pexels assets have now been added to `feat/ma-pexels-films`
in commit `cfb0f44` by ChatGPT using the owner's uploaded stock originals.
`rainy-day.mp4`: H.264, 1280×720, 60.143 seconds; `autumn-temple.mp4`:
H.264, 960×540, 14.0 seconds. Each file has a matching JPG poster.
The original 403 error affected Codex's remote proxy, not the rights of the
supplied files. Assets are available in Git, and their blob hashes match the
original prepared binaries. Media provenance and attribution remain separate
from Apache 2.0; review the current Pexels terms before submission.

**Still pending:** successful CI browser tests with the assets present, live Vercel
HTTP `video/mp4` and range-response verification, both films' playback on Android,
and final contest license and submission checks. Do not mark production QA complete.

## Validation

- npm ci — passed, no added dependencies.
- npm run typecheck — passed.
- npm run build — passed.
- Playwright: 30 tests covering the 26 previous regressions plus keyboard film
  switching, no document navigation, native media-node identity, reset/pause,
  retained mute, separate posters, seek/fullscreen after switching, responsive
  layout and Axe, plus a no-assets/no-substitution test.
- git diff --check — passed.

Tests needing the two slots intercept local Pexels-path requests with the existing
MDN fixture bytes **only inside Playwright**, with real HTTP byte-range semantics.
They prove player behavior with native media but do not independently verify the
Pexels files' playback in production or their permissions. The actual compressed
assets have now been added and their local codec/durations measured. No fixture
transport ships to production. The technical preview still uses MDN. Real-device
and real-film production QA remain pending.
