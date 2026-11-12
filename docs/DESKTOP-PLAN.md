# Issue #9 — desktop/browser implementation

Scope: existing PR #7 / feat/ma-pexels-films. No PR #8 font integration, merge,
production deployment or Contra submission.

- Preserve the original typography and Android breakpoints. Compact spacing only
  on desktop windows shorter than 850/650px; use a shrinkable hero grid column.
- Reserve the final 16:9 player area while HEAD checks are pending, including the
  200px narrow-player minimum. Keep missing-file messages and attribution intact.
- Hide a fine-pointer cursor using Video.js visibility state; restore it on activity
  or focus. No added playback/visibility timer.
- Extend the pinned Video.js patch to recalculate native controls visibility on
  emptied. The desktop real-media test reproduced hidden panels after Replay and
  switching while playing; the existing pause-before-src-change remains in place.
- Keep all 35 existing Chromium tests. Add 11 unmocked desktop regressions for five
  resolutions, narrow/zoom-equivalent windows, both actual MP4s, posters, HEAD/range,
  play/pause/seek/mute/volume/fullscreen/replay, mouse/keyboard, focus, idle, wheel,
  initial layout shift, reduced motion and Axe. Record browser/network JSON and PNGs.
- Firefox/WebKit projects run the same desktop suite. Their official downloads and
  the official Docker image are blocked by this cloud proxy. GitHub Actions adds
  an independent job using the version-matched official Playwright image with its
  browser libraries/codecs; no apt dependency-install step. Results are reported
  separately from local Chrome/Edge and physical-device QA.

## PR #8 reconciliation after PR #7

PR #8 changes demo/style.css and video/ma.css to East Sea Dokdo and adds an external
Google Fonts stylesheet/preconnect. Do not cherry-pick it here. After PR #7 merges,
rebase that branch, retain the new desktop height/spacing rules, loading reservation,
Video.js patch and cursor rule. Recheck the larger 132px hero/56px wordmark on all
five desktop resolutions, 125/150% equivalent resize and 240/320/390px. Test loaded
font and offline fallback, font-swap layout shift, header width and error-dialog
height before choosing final clamps/metrics. Keep body/control/time fonts legible.

See DESKTOP-QA.md for final results, screenshots, CI and deployment limits when available.
