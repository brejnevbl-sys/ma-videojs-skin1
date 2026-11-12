# Pexels films — current implementation and verification

The four real media files are committed in `feat/ma-pexels-films`. No repeat download
from Pexels was performed. Sources/creators are recorded in
`apps/preview/public/media/pexels/ATTRIBUTION.md`; code licensing is separate.

- Rainy Day — Roberto Lee Cortes: H.264/yuv420p, 1280×720, 60.143417 seconds.
- Serene Japanese Temple in Autumn Forest — Hideyoshi isai: H.264/yuv420p, 960×540, 14 seconds.
- Both files have fast start and **no audio tracks**; each has its own 960×540 JPEG.
- Native radio selection preserves the document, Video.js container and media element.
  Playback is paused before changing the source; time resets and mute is preserved.
- The caption discloses silent footage. Controls remain functional for files with audio.
- Missing files still display an explicit availability message; MDN is not a fallback
  for selected stock films. The technical workbench keeps its separate MDN sample.

## Actual-media QA

See [the detailed PR #7 report](PR7-REAL-MEDIA-QA.md). `tests/real-films.spec.ts`
contains **no route interception** and verifies both real films at 240/320/390/1440px:
real durations, decoded frames, native video dimensions, poster images and hashes,
HTTP 206/MIME/range bytes, playback/pause, pointer and keyboard seek, fullscreen,
source switching while playing, retained mute, node identity, layout and Axe.
The touch test also uses both real MP4s. Other fixture-transport regressions remain explicitly labelled as synthetic.
Console errors fail the actual-media tests. A separate deterministic regression covers
hover re-entry during the volume popup exit; see patches/README.md.

The original source-change idle-state issue was fixed by pausing before React
updates src, ensuring Video.js receives the pause event. Media binaries are unchanged.

## Deployment boundaries

Vercel bot supplies this Preview URL:
https://ma-videojs-skin1-git-feat-ma-pexels-films-brejnevbl-sys.vercel.app/

Direct access from this cloud environment is blocked before contacting Vercel:
403 CONNECT from the proxy. Local playback/MIME/ranges are verified; live CDN
playback and physical Android/iOS are **not** certified here. Production device QA,
license approval and owner sign-off remain required before merge/submission.
No merge, new PR, manual deployment or Contra submission was performed.
