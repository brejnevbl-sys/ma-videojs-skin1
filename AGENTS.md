# MA — The Art of Interval (間)

## Project goal
Build an original, functional Video.js v10 **video skin** for the Contra Video.js Skins Design Challenge, using React + TypeScript + plain CSS. This repository is the source of truth for MA.

## Competition minimum requirements
- Public, no-login URL with a working **Video.js v10** video player playing real media.
- Functional play/pause, timeline seeking, elapsed and duration time display, volume/mute, fullscreen.
- Usable on mobile and desktop, including narrow player widths.
- Accessible keyboard focus, keyboard operation and menu dismissal.
- UI legible over bright and dark footage; touch-friendly controls; reduced-motion compliance.
- A short written design rationale and visuals for submission.
- Optional bonus: a Mux-hosted playable asset with a public playback ID, and a real live site using the skin. Never claim either bonus until verified.

## Official implementation route
1. Read https://videojs.org/docs/framework/react/guides/build-with-ai and https://videojs.org/docs/framework/react/guides/build-your-own-skin .
2. Run `npx @videojs/cli agents skills` to install the current Video.js agent skill, if supported.
3. Use `npx @videojs/cli skin create`, choose **React**, **CSS**, **Scaffold**, **video** preset. Place generated project files in this repository (avoid accidental nested git repositories).
4. Follow the actual generated package structure and current v10 APIs (such as `@videojs/react`); do not use legacy Video.js v8 player APIs or a mockup simulating a player.
5. Scaffold should remain the accessible functional foundation. Preserve components such as Hotkey, StatusAnnouncer and ErrorDialog.
6. Keep the app buildable and check actual behavior before polishing.

## Design system
- Brand: **MA — The Art of Interval**, Japanese **間**: considered space, pauses, rhythm, the interval between moments.
- A sophisticated Japanese-inspired cinematic editorial design, not a generic neon/cyberpunk player.
- Dark charcoal surfaces (#131313), warm ivory typography (#F2E8D2), muted vermilion accent (#C06855), subdued labels.
- Quiet, generous spacing and carefully balanced typography; clear visible focus rings.
- Signature seek rail inspired by a calligraphic stroke, while maintaining a practical hit area and precise seek.
- Reveal/hide controls elegantly but never prevent keyboard or touch access.
- Prefer progressively enhanced animations; honor `prefers-reduced-motion`.
- Responsive layouts: editorial desktop presentation and thumb-friendly compact mobile player.
- Avoid unnecessary dependencies and excessive decorative effects.
- Support common public styling CSS properties such as `--media-accent-color` and `--media-border-radius`, when applicable.

## Quality gates
- Install dependencies and run the production build, type checking, linting and tests when configured. Report actual commands and pass/fail.
- Functionally verify playback and controls; if browser testing is not available, clearly flag unverified items.
- Test narrow width, bright/dark footage, keyboard navigation, visible focus, errors, and reduced motion.
- Avoid copyrighted demo video without permission; use an authorized sample or free-to-use footage with attribution.
- Commit changes on a branch and create a pull request to `main` when supported, so the user can review on mobile.
- Do not claim the site is deployed or the contest entered until the actual public URL and official submission are verified.

## First milestone (do this before elaborate design)
Generate the official Scaffold skin project, implement functional real video playback, apply basic MA colors and typography, and achieve a successful build. Submit a concise Russian-language summary with changed files, commands run, testing evidence, and a pull request link.

## Contest timing
User-provided competition deadline: Nov 16, 2026 at 11:59pm PST (Nov 17, 2026 at 13:59 Bishkek time). Recheck the official deadline and ensure the entry is actually submitted, not merely posted.
