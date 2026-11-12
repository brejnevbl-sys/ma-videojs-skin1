# MA — The Art of Interval (間)

A working Video.js **10.3.0** skin built with React, TypeScript and plain CSS.
Milestone 3 makes MA the landing page, retains the full workbench at /workbench/,
and prepares a shared media configuration for the owner’s upcoming film.

## Develop

Use Node.js 24 LTS and npm. From this repository:

```sh
npm ci
npm run dev
```

- `/` — MA's editorial demonstration page.
- `/ma.html` — preserved alias of the same MA page.
- `/workbench/` — official workbench (sizes, aspect ratios, languages and playback options).
- `/preview.html#width=240&ratio=16:9` — isolated narrow player.

The landing page selects two Pexels stock films, with creator credits and keyboard switching.
The four real media files are committed and verified locally: Rainy Day (60.143s) and
Serene Japanese Temple in Autumn Forest (14.000s), each with a separate poster.
Both films are silent (no audio streams). See [real-media QA](docs/PR7-REAL-MEDIA-QA.md).
The unchanged MDN CC0 sample remains only in the technical preview/workbench.
Code is licensed under [Apache 2.0](LICENSE); media rights are separate (see [NOTICE](NOTICE)).

## Validate

```sh
npm run typecheck
npm run build
npx playwright install chromium
npm test
```

Tests start a server for the **production build**, so build before running them.
On Linux with a preinstalled Chromium, use
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test`.
On a fresh Linux runner, `npx playwright install --with-deps chromium` installs browser prerequisites.
There is no configured lint script.

Desktop/browser QA for Issue #9: [results, screenshots and boundaries](docs/DESKTOP-QA.md).
`npm run test:desktop:engines` runs the unmocked desktop suite in Firefox/WebKit.
A separate CI job tests PR #7’s Vercel Preview after verifying its build SHA; reports are retained as artifacts.
Preview access is an explicit CI gate. Initial runs detected Vercel Authentication; the latest vercel-preview job records the current access result.

`npm ci` applies a version-specific Video.js 10.3.0 hover fix using patch-package.
Keep postinstall enabled; see [patch rationale and regression](patches/README.md).

The browser suite covers real playback and replay, pause, timeline pointer/keyboard seeking,
time display, mute/volume, fullscreen, settings/rate selection, Escape and focus return,
status announcements, 240/320/390px players, touch, errors, reduced motion,
bright/dark surfaces, automated accessibility checks, and German/Arabic localization.
This is Chromium validation, not a claim of full assistive-technology or Safari/iOS certification.

## Structure

- `src/video/` — portable Scaffold skin components, hotkeys, gestures, feedback and error dialog.
- `src/video/ma.css` — MA styling; supports `--media-accent-color` and `--media-border-radius`.
- `src/styles/` — official generated foundation and preference styles.
- `apps/preview/` — CLI workbench, local media and MA demo page.
- `tests/` — Playwright functional and axe accessibility checks.
- `.agents/skills/` — official Video.js skills installed for Codex, with `skills-lock.json`.
- [Design direction](design/spec.md), [workbench instructions](docs/WORKBENCH.md),
  [Milestone 1 notes](docs/MILESTONE-1.md), [Milestone 2 report and visuals](docs/MILESTONE-2.md),
  [Contra design description](design/contra-concept.md).

## Official scaffold provenance

Created by `@videojs/cli@10.3.0` using React, CSS, Scaffold and video:

```sh
npx @videojs/cli@10.3.0 skin create /tmp/ma-scaffold --name ma \
  --framework react --styling css --base scaffold --preset video \
  --package-manager npm --no-install --yes \
  --registry /tmp/ma-videojs-docs/packages/skins/dist/shadcn
```

The live docs/registry domains were denied by the cloud network policy. The official
`videojs/video.js` repository at commit `c19191b7fe39f1eb40f716b310de3351f0701ca4`
was read and its registry built with the repository's frozen pnpm lockfile and
`pnpm build:shadcn`, then supplied through the CLI's supported `--registry` option.
Generated files were copied into this checkout, preserving the project's original `AGENTS.md`.
Installed package docs at `node_modules/@videojs/react/docs/llms.txt` were also consulted.

The CLI's Codex plugin installation needed a read-only global directory, so its documented
project-local skills installer was used instead:

```sh
npx skills add https://github.com/videojs/skills --agent codex --yes
```

See [Milestone 3 report](docs/MILESTONE-3.md) for routing and mobile menu QA.

## Scope

The owner has confirmed the Milestone 1 Vercel demo. This branch contains Milestone 3
for review; it has not been deployed or merged, and no contest submission or Mux bonus is claimed. The generated hosting configuration is retained for a
later deployment; publishing the workbench requires a separate explicit request.

See [Pexels implementation status and test boundaries](docs/PEXELS-IMPLEMENTATION.md).
