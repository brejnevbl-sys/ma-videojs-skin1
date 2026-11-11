# MA — The Art of Interval (間)

## Milestone 2: Visual Identity & Interaction Polish

Source of direction: AGENTS.md and [Issue #2](https://github.com/brejnevbl-sys/ma-videojs-skin1/issues/2).
MA expresses deliberate space, rather than Japanese ornament. The identity must survive
when the skin is removed from its demonstration page.

### Composition and typography (derived execution)

- Quiet MA wordmark inside the player, with a short separating rule and the brand's subtitle.
- Editorial system serif for the wordmark/headings; system sans-serif for controls;
  monospaced, tabular time digits. Japanese system Mincho fallbacks for 間. No font downloads.
- Charcoal #131313, ivory #F2E8D2, muted vermilion #C06855. Dark control surfaces
  remain legible over bright/dark pictures. Use accent sparingly for the timeline and active detail.
- Top: brand/title at start, device/fullscreen controls at end. Center: an open-ring play
  control with quiet skip controls. Bottom: calligraphic seek rail, then play, volume,
  current/duration time, captions/settings. Source order is visual/tab order.
- The showcase stays at /ma.html; the technical workbench remains at /.

### Signature timeline (derived execution)

Keep the actual Video.js TimeSlider, chapter geometry, buffer, fill, thumb, preview and
keyboard semantics. A hand-drawn vector silhouette shapes the complete track, including
its buffer and progress planes; its uneven pressure and tapered ends suggest a single
brush gesture. The interactive root is 48px high, independent of the 12px visual stroke.
A slim ivory seal indicates the exact position. Focus adds a strong outline; dragging
retains precise position, with no interpolation of progress. RTL preserves Video.js
geometry without transforming the progress planes. Forced colors restores a solid rail.

### Controls and states (derived execution)

- Keep the official Scaffold icon family consistently; original treatment comes from
  spacing, shape, open-ring framing and responsive layout, without changing intuitive labels.
- Buttons: 44px minimum; immediate press feedback, restrained hover on fine pointers.
- Paused: central play appears in an open ring; playing: it fades out to clear the image,
  unless it holds keyboard focus. Bottom play/pause always follows confirmed Video.js state.
- Controls: reveal 120ms, hide 220ms with a 6px movement, driven by Video.js data-visible.
  Focus overrides hiding immediately. Touch always keeps a small bottom control dock available.
- Loading: existing BufferingIndicator with a bespoke open ring; no invented playback state.
- Settings, volume and tooltips: charcoal paper surfaces, ivory borders, consistent offsets,
  44px menu items, visible selection and a short 140ms entrance from the trigger.
- Error: existing modal semantics, localised title/description/close, editorial typography
  and an accent rule; keep focus containment and Escape dismissal.
- Reduced motion disables all transitions and rotation, preserving a static loading symbol.
- Forced colors/high contrast remove translucent styling and maintain borders and focus.

### Responsive rules and validation

Use player container queries rather than viewport sizing. At 240/320/390px, keep both
times, play, mute/volume, settings, seek and fullscreen available. Remove central controls
when they would overlap; compress decorative branding before controls. Keep 44px targets
and avoid synthetic touch hit-area overlap. No new runtime dependencies.

Run npm ci, typecheck, build and all Playwright tests against production output. Add
regressions for the brush's hit area and precise pointer seek, keyboard/tab order, touch
discovery, idle/focus revival, forced colors, reduced motion, buffering and popup bounds.
Capture desktop, phone, 240px, paused/playing, settings, focus, loading, errors and
bright/dark frames. Record emulation separately from physical-device testing.

## Pexels film selection

The landing page now selects two explicitly credited stock films using a native
radio group: primary Rainy Day (Roberto Lee Cortes), secondary Serene Japanese
Temple in Autumn Forest (Hideyoshi isai). Ivory outlined cards, small ordinal
numbers, restrained vermilion selection and an independent focus outline follow
MA's existing typography and spacing. Cards stack at narrow widths and preserve
native arrow-key navigation. Source changes reuse the Video.js container and media
node when both slots are available, pause playback and reset native time.
Unavailable assets show a clear message and original source link, never substitute
footage. Actual Pexels files remain pending manual download; see docs/PEXELS.md.
