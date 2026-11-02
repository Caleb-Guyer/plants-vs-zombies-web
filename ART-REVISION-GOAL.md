# Lantern-shroom art revision

## Mender.2 native-part artwork and expressive animation

`0.2.6-web-mender.2` updates both custom plants after feedback that their
idle motion was too subtle and their Almanac presentation did not fit the game.

Chill-shroom now has a more visible 2.2-second rocking and squash cycle.
Mender-bloom's 2.8-second cycle flexes the planted stem and sways the head with
it. The layers stay connected, and their ground contact stays fixed. Attack and
healing poses remain distinct from idle motion; no combat timer or saved member
was added.

Both Almanac entries use the original blue introduction, brown keyword labels,
red stat values, short-line spacing and brown flavor text. Chill-shroom's sleep
notice uses the native purple nocturnal style. The bios give the plants specific
quirks: Chill-shroom outwaits a snowman in a staring contest, while Mender-bloom
finds that Wall-nut keeps eating his bandages. Mender-bloom uses the native
recharge label "fast"; her actual recharge remains 15 seconds.

The custom Almanac packets use 34 by 46 thumbnails beside the native Imitater.
The normal chooser puts Chill-shroom at (332,545) and Mender-bloom at (376,545)
in the left panel's footer, with no custom side frames over the zombie preview.
Compact hit areas match the thumbnails. Their native flight expands them to full
bank size and shrinks them on return, using the existing floating-point easing
curve and flight timer. Bank-to-bank reordering keeps full size. Their own
footer tooltips appear above the packets and stay within the left panel.
Original plant positions, Let's Rock, View Lawn and Imitater remain intact.
Only the cheat-only Debug Play button moves to make room for the earned packets.

Mender-bloom's current artwork is composed from checksum-pinned original game
parts: Sunflower's face, blink, stem and leaves, with six native petals recolored
coral. The current sprite does not use image-generated pixels. The earlier
generated masters and prompt record remain historical source inputs and are not
read by the active composer. The deterministic recipe and native-part provenance
are retained with the corresponding source and
[art provenance](dist/content/mender-bloom/provenance.json).

Costs, cooldowns, healing and frost mechanics, earned Cold Front/Seed Swap
unlocks, original IDs, serialized layouts and automatic saves are unchanged.
All five Bonus modes retain their rules and cards. No extra HUD or card tips
were added.

The full build passed in 121.518 seconds with all 810 source inputs unchanged.
All 3,799 checks in ten native suites, 14 browser suites and 11 worker scenarios
passed. Release wrappers authenticate the 13 original native artwork inputs and
the 810-file source tree. The corresponding source ZIP has 851 entries, SHA-256
`2d40f382100860e1f64e3475ee2e0b299875df5458e488099b226c19a3d6ee24`.
Both binary patches reconstruct every source byte.

Muted local browser checks on the isolated 4224 origin used a generated QA-Boss
profile with synthetic existing wins. Both Almanac descriptions fit, with brown
flavor text, Chill-shroom's purple sleep notice and native recharge wording.
The original Sunflower entry remains selectable and served as an on-screen style
reference. Full 2.8-second Mender-bloom and 2.2-second Chill-shroom idle cycles
were observed and recorded: the motion is visible, grounded and keeps the layers
connected.

The normal Survival chooser shows both compact footer packets inside the panel.
The zombie preview and its native click-to-view tooltip stay clear. Both packets
select into the bank at full size; removing Mender-bloom returns her to compact
size while Chill-shroom reorders at full bank size. Mender-bloom's own tooltip
fits above her footer packet within the panel. This presentation pass claims no
new battle clear, newly earned unlock or gameplay save/resume observation;
retained mechanics and serialized layouts are checked separately by production
tests.

Publication is handled by the existing GitHub Pages workflow. Hosted package,
source-download and public-byte receipts belong to the release process and are
recorded after those steps. Earlier release records below describe their own
builds. These checks do not establish subjective perfection or exhaustive
original-game parity.

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
