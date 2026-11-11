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

## External blocker

The cloud proxy returned 403 CONNECT failures for both supplied Pexels pages and
/license/. No source MP4 or matching poster was downloaded, transcoded or verified.
The requested durations 60/14 seconds and creators are user-supplied metadata, not
independently measured file properties. The stock films are not MA cinematography.
Their Pexels License is separate from Apache 2.0 on the code; review live terms at
manual download time and keep the records in public/media/pexels/ATTRIBUTION.md.

Until all four local files are supplied, the landing shows the availability message
rather than a functioning replacement film. Do not deploy this branch expecting
completed Pexels playback; existing production is not altered by a manual deploy here.

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
They prove player behavior with native media, not that Pexels films were obtained,
that they run for 60/14 seconds, or that their real audio/codec/licensing works.
No fixture transport is shipped to the application. Technical preview tests still
play the original local MDN file normally. Real-device and real-film QA remain pending.
