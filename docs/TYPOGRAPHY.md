# MA — calligraphic typography

## Reference and choice

Visual reference provided by the owner: **Korean Calligraphy** by hiJoju, a high-contrast, irregular brush-style Latin display face. Reference: https://www.dafont.com/korean-calligraphy.font . The reference font has varying license descriptions across distributors and is **not bundled or embedded** in this repository.

Implementation uses **East Sea Dokdo** by YoonDesign, a similar Korean/Latin brush display font published on Google Fonts under **SIL Open Font License 1.1**:

- https://fonts.google.com/specimen/East+Sea+Dokdo
- https://openfontlicense.org/open-font-license-official-text/

It loads from the Google Fonts stylesheet in `src/video/ma.css` (`font-display: swap`). No font binaries are committed. When offline or CDN access is blocked, Japanese Mincho/system serif fallbacks remain in use.

## Scope

- MA wordmark, landing-page hero, film editorial accent, section heading, and player brand/title/error heading use the brush display style.
- Body copy, keyboard instructions, navigation, accessible buttons, menu labels, seek values and timecode **remain in legible sans/monospace**.
- The Japanese `間` glyph stays in the Mincho stack to preserve its original character and legibility.
- Background, color palette, keyboard interaction, focus behavior, layout structure and Video.js v10 controls are otherwise unchanged.

## QA before merging

- Test at 240/320/390 px and desktop: check hero wraps cleanly, `MA 間` fits in header and small player, and film-selection cards don't overflow.
- Test external font load versus offline fallback, WCAG legibility, keyboard focus and reduced motion.
- Test with PR #7 film selector after integration, as that branch adds additional typography-bearing elements.
- Recheck the effective third-party font license if replacing East Sea Dokdo with any exact reference font. Do not commit unlicensed font files.

PR #7 (Pexels films, mobile/desktop/real-media QA) has merged. This feature is reconciled against that version of `main`; final pre-merge checks must cover both real films and multiple viewport sizes.