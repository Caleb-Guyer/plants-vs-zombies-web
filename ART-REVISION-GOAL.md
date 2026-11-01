# Lantern-shroom art revision

The user requested this goal on 2026-10-31 after rejecting Lantern.1's visual
style and feel. The goal tool rejected a new objective because the older parity
goal is still paused; that unfinished goal has not been marked complete.

This revision must:

- Match actual original mushroom proportions, outlines, face simplicity,
  shading and animation behavior using original game resources as references.
- Replace the mismatched Lantern.1 drawing and scaling animation with a
  reference-matched plant and native-feeling animation/pulse presentation.
- Remove every added Bonus challenge tip beneath or on hover over its card.
- Give Cone Zone, Night Shift and Lantern Glow distinct pictures composed in
  the original game's visual language, without reusing Survival thumbnails.
- Preserve all original content, existing saves, Lantern-shroom's intended
  slowing mechanic, muted testing and the minimal native interface.
- Inspect the plant beside original mushrooms at actual game size, correct
  observed discrepancies, run focused automated/save tests, and publish the
  corrected build to the existing GitHub repository and Pages site.

Completion means these concrete criteria pass and no material defect is known.
It does not assert that subjective art perfection or exhaustive original-game
parity can be proved by automated tests.

Status: implementation, reference comparison and muted local verification passed.
Publication is the remaining release step; the deployment workflow and hosted
byte verification provide the final publication record.

Evidence:

- Lantern.2 uses the original Puff-shroom body, eye/blink/sleep/idle animation,
  shadow and proportions, with only its cap image changed at the original pivot.
- The three Bonus cards have separate 80 by 65 compositions; visual inspection
  confirmed their subjects fit around the native trophy ribbons. Hovering a card
  shows its original title highlight without an added tip.
- All 1,333 native assertions, 14 browser suites and 11 worker checks pass.
- Both a previous Lantern.1 save and a freshly saved Lantern.2 board restored
  the native body and cap. The full reload retained 50 sun and adjacent Sun-shroom,
  Lantern-shroom and Puff-shroom plants. Testing remained muted.
- The compiled source receipt and full/incremental patch reconstruction match
  the packaged source bytes. The final native build recorded 772 unchanged
  source inputs throughout compilation.
