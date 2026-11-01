# Chill-shroom and Bonus artwork revision

The user requested this revision on 2026-10-31 after rejecting Lantern.2's
plant and challenge pictures. The yellow/brown lantern identity, Puff-shroom
muzzle, radial cold effect and missing attack animation did not communicate one
coherent plant. The older parity goal remains paused. The goal tool rejected a
new objective while that unfinished goal exists; this file tracks the requested
revision without falsely completing or replacing the older goal.

The candidate is `0.2.6-web-chill.1`, based on Lantern.2. Its player-facing plant
is **Chill-shroom** and its third Bonus challenge is **Cold Front**. Existing
internal seed/mode IDs and save filenames remain compatible.

Completion criteria:

- Give Chill-shroom a distinct, squat snowy cyan cap, native Ice-shroom body and
  eyes, and no muzzle, spout, yellow lantern or projectile outlet. Use actual
  original mushroom resources to guide proportions, outlines and simple paint.
- Show an intentional attack: a 40-tick wind-up, outward cold release and
  30-tick recovery, synchronized with the existing radial slow. Preserve the
  400-active-tick pulse, 150-pixel radius, 150-tick native chill, cost, recharge,
  enemy eligibility and stronger-chill/freeze behavior. Add no damage.
- Give Cone Zone, Night Shift and Cold Front separate, cohesive original-style
  illustrations. Inspect each in the native 80 by 65 window, both with and
  without the original trophy ribbon. Keep faces and identifying features clear.
- Keep added Bonus tips absent and retain original title hover, menus, seed
  packets, flags and discreet utility icons. Add no instructions or extra HUD.
- Preserve original content, serialized object layouts, saves, checkpoint and
  completion routing. Upgrade both older bodyless plants and Lantern.2 Puff
  bodies without resetting saved health, placement or pulse phase; restore cap
  binding and attack presentation correctly after a paused Continue draw.
- Run focused automated native/browser/save and artwork-integrity checks with
  sound off. Check the plant beside original mushrooms at actual game size,
  correct material defects, and save/reload/Continue the resulting board.
- Publish complete corresponding source, assets, dependencies and provenance to
  the existing GitHub repository and Pages site. Keep normal-player audio and
  automatic browser saves available; testing remains muted with `?testing=1`.

Status: the corrected coherent build, focused checks and native-size plant,
attack and card reviews pass. The first cap placement hid the eyes and was
rejected; shortening its content to 103×46 within the 103×54 canvas corrected
the face and body join. An older Puff-body checkpoint migrates with its saved
state. Fresh current-Ice-body save/reload also passes: a healthy new board
retained 50 sun and the same Sun-shroom, Chill-shroom and Puff-shroom through
full reload and native Continue, with the eyes and cap intact. Local
implementation, test and visual/save criteria pass. Publication remains, with
website-source packaging and hosted verification recorded independently.
Full prompts and exact asset identities belong in
[`dist/content`](dist/content/), rather than being repeated here.

Final corrected checks: seven native suites total 1,419 assertions; fourteen
browser integration suites include eleven worker scenarios. The 117.519-second
Release build kept all 773 source inputs unchanged. The 805-entry engine-source
archive and both full/upstream and Lantern.2 incremental patches reconstruct the
exact source. Decoder regression fails with the old cap height and passes with
the corrected height. Native review observed visible eyes, the closed-eye
wind-up, radial frost release and idle recovery. All three cards remain readable
with and without trophy ribbons, and hover adds no tip. No earned battle win or
precise browser timing measurement is claimed.

These criteria describe a concrete revision. Automated tests and bounded visual
observations do not prove subjective perfection or exhaustive original-game
parity. Lantern.2's prior functional checks remain historical evidence; the user
rejected its visual result.
