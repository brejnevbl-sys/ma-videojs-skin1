# MA — The Art of Interval (間)

Milestone 1 follows the direction in AGENTS.md: a functional cinematic video skin,
with generous negative space and restrained editorial typography. Final motion is deferred.

- Foundation: official Video.js 10 CLI, React, plain CSS, Scaffold, video preset.
- Keep the Scaffold controls, error dialog, hotkeys, gestures and status announcer.
- Required controls: play/pause, seek rail, current/duration time, mute/volume and fullscreen.
- Surfaces: charcoal #131313; text: warm ivory #F2E8D2; accent: muted vermilion #C06855.
- Derived typography: system serif for the MA editorial heading, system sans-serif for
  controls, tabular time digits. No externally downloaded fonts.
- Derived surfaces: dark scrims keep controls readable over bright and dark frames;
  popups use opaque charcoal. Focus uses a clearly visible ivory outline.
- Derived seek rail: tapered ends and vermilion fill, with a generous interaction area.
- Use container queries for narrow players and preserve source/focus order.
- Retain built-in menu dismissal, accessible labels and keyboard operation.
- Respect reduced motion and forced colors. Preserve public accent and radius properties.
- Keep portable skin code in src/; use the generated workbench for validation.
