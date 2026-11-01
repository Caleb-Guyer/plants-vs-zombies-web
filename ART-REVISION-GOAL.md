# Lantern-shroom art revision

## Mender.1 current artwork and Almanac update

The new `0.2.6-web-mender.1` addition is Mender-bloom: a compact coral six-petal
flower with a cream face and green stem/leaves, distinct from Sunflower and
Chill-shroom. The plant sprite was produced with the built-in image generation
tool using original Sunflower/Marigold artwork and a game screenshot as style
references. A follow-up pass reduced glossy highlights; a separate closed-eye
expression supplies only the fixed eye regions. Prompts, source masters,
reference attribution and hashes are preserved under `artwork/mender-bloom/`
in the corresponding source package and the packed
[generation record](dist/content/mender-bloom/generation.json).

A deterministic recipe crops and registers the artwork on one 80 by 80 canvas.
Head and stem masks recompose the canonical pixels exactly; blink changes only
the registered eye regions with canonical alpha retained. Independent head sway,
gentle breathing, blinking and a short healing lift use the native animation
clock. Native sparkles appear only on actual repairs. The native-size sprite
and layer registration were inspected, but that inspection does not establish
subjective perfection or indistinguishability from official artwork.

No new challenge illustration was generated, and all five existing Bonus cards,
their rules and their layouts are unchanged. Both custom plants now have native
animated Almanac entries without moving original entries: Chill-shroom after
Cold Front, Mender-bloom after Seed Swap, including existing valid wins.
Mender-bloom costs 125 sun, recharges in 15 seconds and heals eligible plants
in the eight adjacent squares by 10 health every three simulation seconds,
capped at maximum health with no attack, self healing or resurrection. Native
save-object layouts and original seed/cache ranges remain unchanged.

All 3,769 native checks in ten suites, 14 browser suites and 11 worker scenarios
passed; the full build passed with 795 unchanged source inputs. Corresponding
source packaging and both binary patch reconstructions were verified. Muted
local browser checks showed both fitting Almanac entries and animated portraits,
original Sunflower reselection, Mender-bloom seed selection, planting and idle
motion. Native Menu/Leave, full reload and Continue restored Mender-bloom with
Sunflower, Wall-nut and the saved bank, zombies and suns. The generated profile's
wins were synthetic, not newly earned clears; healing amounts are covered by
production-method tests, not a visual battle claim. Public Pages and hosted
source-download receipts are recorded by the release workflow. The Lantern
revision objective and evidence below are historical; this update does not
declare exhaustive parity or art perfection complete.

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
