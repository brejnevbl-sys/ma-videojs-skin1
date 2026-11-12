# Video.js 10.3.0 interaction fixes

`@videojs+core+10.3.0+001+hover-reopen.patch` changes only the hover-entry guard in Video.js's
`createPopover`, in its development and production distributions. An active
popover with status `ending` must be allowed to reopen. The existing `applyOpen`
and dismiss-layer transition cancellation already support that state.

Without this guard change, returning to the volume trigger during the exit
animation clears the close timer but schedules no reopen. The visible popup is
inert, so a premature focus attempt fails; `End` can then reach the player hotkey
and seek to the end instead of adjusting volume. This explained the intermittent
Space assertion at `tests/player.spec.ts:61` reported on PR #7.

`npm ci` applies the version-specific patch through `patch-package --error-on-fail`.
Do not edit node_modules manually or skip postinstall. Review/remove the patch
when upgrading Video.js; installation must fail if it no longer applies.
Upstream code remains Apache-2.0; this is a local modification, not a new upstream release.

`tests/real-films.spec.ts` includes a deterministic regression: it extends the exit
transition, returns the pointer while `data-ending-style` is present, then checks
reopening, actual slider focus, volume Home/End without seeking, Escape focus return
and Space playback. It uses the committed MP4, without route interception.
The original keyboard test additionally waits for `aria-expanded=true` and asserts
focus and unchanged media time; the Space assertions and timeouts remain intact.

Issue #9 also reproduced hidden controls after Replay followed by source switching.
`HTMLMediaElement.load()` can cancel the queued native pause event; playback resets,
but the controls feature only listened to play/pause/ended. Its existing visibility
calculation now also runs on `emptied`, in both distributions. This keeps controls
consistent with the reset native media without new playback state or custom timers.
The desktop suite replays each real film and selects the next source while playing,
then requires the native paused controls to be visible before the next Play click.

The fixes are separate sequenced patches (001 hover, 002 controls reset). Extending
one already-applied patch made a cached installation containing only the previous
hover fix fail as partially applied. Separate patches support that cache, a clean
`npm ci`, and a repeated postinstall; all three installation paths were checked.

Issue #9 adds patch 003: popup viewport bounds use (0,0,clientWidth,clientHeight),
not the scrolling document rectangle (whose top is -scrollY and height is the
whole page). Container bounds are still intersected with the actual viewport.
The desktop suite requires the volume thumb to remain in view before a real
mouse click, and checks that mouse volume changes do not seek.

The additional `@videojs+utils+10.3.0.patch` disables native CSS anchor positioning
for WebKit, identified by its WebKit user agent without Blink's Chrome/Chromium/Edg
tokens. That engine resolves fixed top-layer anchors against document coordinates
after page scroll (the measured error was exactly scrollY). CSS.supports accepts the
syntax, so it cannot detect this behavioral failure. Video.js's existing manual
viewport positioning/resize/scroll tracking is used instead. Other engines keep
native positioning. Review this compatibility workaround when upgrading Video.js/WebKit.
