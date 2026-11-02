# Bonus minigames, balance and Chill-shroom unlock — locally verified release candidate

## Care.2 - restrained minigame presentation

`0.2.6-web-care.2` corrects Intensive Lawn Care's toolbar spacing and original-font hint placement, including the paused view. Native layout checks cover the full drawn assets and parent translations that were missing from Care.1's presentation review. Chill-shroom, Mender-bloom and all six Bonus game rules remain unchanged.

All twelve silent native suites passed: 11,940 checks, zero failures, including 6,862 layout checks. The layout harness also passed with the installed native compiler; all fourteen browser integration suites passed. The Release build passed with all 817 source inputs unchanged. See [QA scope](PARITY-QA.md) for the verified layout coverage. Earlier sections below retain their named release history.


## Care.1 — sixth Bonus minigame

`0.2.6-web-care.1` adds Intensive Lawn Care alongside the existing five Bonus minigames. Its repair-and-redeploy loop uses ordinary Mender healing, protected pots and the original gardening glove. Completion occupies profile record 77 and adds no plant unlock gate. Chill-shroom still unlocks through Cold Front, and Mender-bloom still unlocks through Seed Swap.

Both plants' accepted artwork, animation, Almanac entries, compact chooser packets and normal-game behavior remain. The new native card adds no tips or extra interface panels.

All eleven silent native suites passed: 5,078 checks, zero failures. All fourteen browser integration suites passed. Muted manual play reached the final huge-wave banner; battle completion and final difficulty balance remain unverified as described in [PARITY-QA.md](PARITY-QA.md). Earlier sections below retain the history and evidence for their named releases.

## Mender.3 head-only art correction

`0.2.6-web-mender.3` replaces the rejected Sunflower-like Mender-bloom head
with a distinct coral cupped blossom and its own expression. The original
stem and leaves remain, while the head avoids Sunflower's brown center disk
and radial petal ring. The intended finish follows the game's painted outlines
and shaded forms without reusing Sunflower's face.

Built-in image generation is limited to the new Mender-bloom head. The source
retains its masters, prompt record and registered extraction recipe. No new
challenge illustration is generated. The accepted Mender.2 idle motion,
Almanac formatting and compact chooser layout remain. Costs, healing, frost,
unlock rules, original IDs, serialized data and Chill-shroom artwork are unchanged.

The full build passed in 147.676 seconds with all 816 source inputs unchanged.
All 3,799 native checks in ten suites, 14 browser suites and 11 worker scenarios
passed. The corresponding source ZIP has 857 entries and 13,544,751 bytes, SHA-256
`5a6392e1d5415c3d7f5d3f2bad3114abb54a35bc13df5366be84b718c2d5bd1f`.
Both binary patches reconstruct every source byte.

Final wrappers verify the selected head, its three exact generation prompts and
draft/master/closed source images, reference pins, compiled/public pixels and
closed-eye alpha. The original stem PNG and RGBA remain byte-identical. All
non-art gameplay/rendering sources, including motion, UI and Chill-shroom, match
Mender.2; the release identity is updated.

Muted browser checks on isolated origin 4226 used a synthetic QA-Boss profile.
The new cupped coral head was compared with the original Sunflower entry; its
Almanac description fits. A 6.2-second idle recording shows the head and stem
connected and grounded. Open/closed source frames were checked. The compact
Almanac portrait and normal Survival chooser footer packet fit, show 125 sun,
select into a full-size bank packet and leave the zombie roster clear. These
checks claim no new battle, healing or gameplay save/resume observation.

Publication and source-download validation use the existing release process;
their separate receipts are recorded after those steps. Earlier Mender.2 results
below describe that historical build.

## Mender.2 Chill-shroom and Mender-bloom presentation

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

## Mender.1 support flower and missing Almanac entry repair

`0.2.6-web-mender.1` fixes the omitted Chill-shroom Almanac entry and adds
Mender-bloom's entry using the existing packet, portrait, description and animated
preview presentation. Chill-shroom remains unlocked by Cold Front; Mender-bloom
is unlocked by Seed Swap. Existing valid completion records count for both,
with no reset or repeat win. Original Almanac positions, seed IDs/cache ranges,
serialized object layouts and automatic saves remain unchanged.

Mender-bloom is a support plant available in the normal seed chooser after
unlocking. It costs 125 sun, has a 15-second recharge, and restores 10 health to
eligible damaged plants in the eight neighboring squares every three simulation
seconds. Healing is capped at maximum health; it never attacks, heals itself or
revives dead plants. Healing pauses outside active gameplay, and existing Plant
counters preserve its cooldown and healing pose through saves.

The distinct coral-and-cream flower has native-size registered head/stem art,
gentle idle motion, blinking and a brief healing lift. Its sprite used the
built-in image generation tool with original flower references; prompts, source
masters and the deterministic extraction recipe are retained with the source
and [art provenance](dist/content/mender-bloom/provenance.json). No challenge
illustration was generated. All five existing Bonus modes, card illustrations,
rules and balance remain unchanged, including the absence of extra card tips.

All 3,769 native checks in ten suites, 14 browser suites, 11 worker scenarios
and the full build of 795 unchanged source inputs passed. Corresponding source
packaging and both binary patch reconstructions were verified. Muted local
browser checks confirmed both custom Almanac entries fit and open, have accurate
cost/recharge and animated portraits, and permit original Sunflower reselection.
Mender-bloom was selectable in Survival, planted for 125 sun and seen idling.
Native Menu/Leave, full reload and Continue restored Sunflower, Wall-nut and
Mender-bloom with the saved bank, zombies and suns. The QA profile's unlock wins
were synthetic, not newly earned clears. Healing amounts are covered by
production-method tests, not a visual battle claim. Public Pages publication and
hosted source-download receipts are controlled by the existing release workflow.
Prior release results below retain their original scope; this update does not
prove exhaustive parity, universal balance or subjective art perfection.

## SeedSwap.1 native seed replacement minigame

The user approved Seed Swap: start with a small complete defense, collect native
seed packets from defeated zombies, and replace existing plants as the enemy mix
changes. This fifth Bonus card uses an original Wall-nut and Repeater packet,
without new generated artwork, extra HUD or tips below the challenge cards.

A fresh game starts with ten Peashooters and five Wall-nuts: two shooters and
one barrier per lane, with a twelve-second opening. Ten authored waves contain 48 zombies,
including screen doors, pole-vaulters, a balloon, a digger and a football zombie.
Drops include Repeater, Snow Pea, Cabbage-pult, Cactus, Split Pea, Kernel-pult,
Tall-nut and Melon-pult. Counter seeds repeat around the special waves. At most
six native packets are present. New loose packets expire after thirty simulation
seconds; native holding and cancellation timing is retained.

Click a dropped packet, then a living plant to replace that plant. There is no
sun cost, seed bank or shovel. Empty squares cannot be filled, so a plant eaten
by zombies leaves a permanent gap. Invalid targets consume nothing. Native
right-click/Escape returns a held packet; cancel before opening Menu. Space
pauses the game. The original planting animation, ghost and packet artwork stay
in use. Existing modes, plant IDs and native serialized members are retained;
new mode 77 owns unused profile record 76, and state 104 identifies the rules.
The drop ordinal uses the existing serialized challenge score.

The initial ten-plant preview left too little room for separate attack and
counter roles after a barrier was lost. The final fresh opening adds a second
Peashooter per lane. Waves, seed drops and all existing checkpoints remain
unchanged; loading a checkpoint never creates extra plants.

Final release validation passed: the unchanged 782-file source built in
182.024 seconds. All 3,199 native checks in nine suites passed, followed by
14 browser suites and 11 worker scenarios. The corresponding engine source ZIP
contains 820 entries and 9,379,580 bytes, SHA-256
`0db62a66059ebc4891181044609fa949d2c623b0a05181930c2734a0f7aeeb18`.
Both the raw-upstream patch and exact Garden.1 delta reconstructed every source
byte. The six accepted sprite PNGs and packed artwork header remain unchanged.

A fresh final fifteen-plant Seed Swap run cleared all ten waves at 1x with
sound off and native planning pauses. The end board had 15 living plants
and 5 remaining mowers. Native packet selection, ghost preview, valid
replacement, empty-target rejection and cancellation were checked. The native
Menu/Main Menu/Leave path, full browser/engine reload and Continue restored
15 living plants and 4 loose packets. Visible restored board state
was checked through the game; exact saved challenge/drop-ordinal, plant, packet
and cursor fields are covered separately by production serializer tests.

The generated QA profile's earlier campaign wins and trophy ribbons were
synthetic. The full-clear evidence is the actual native replay moneybag,
collected reward and return to Bonus. Private player saves were not read.
The earlier ten-plant trial informed the final opening; it is not presented as
a final-build clear. One successful strategy with planning pauses does not
establish universal difficulty, fun or full original-game parity. Final
packaging, extracted-source and matching Pages publication receipts are
recorded separately by the release process.

## Garden.1 fixed-garden minigame and completed balance checks

The user approved full 1x balance runs and save/resume checks for the existing
three Bonus modes, followed by Garden Shuffle. The new fourth Bonus card uses a
centered original Peashooter and native gardening glove. It starts with three
Repeaters, one Snow Pea and two Wall-nuts facing ten authored rotating-lane waves
(40 zombies). Click a living plant and then an empty legal square to move the
same instance. A one-second move cooldown uses the existing challenge counter;
health, attack clocks and animation IDs persist. Right-click cancels selection.
The original glove occupies the shovel toolbar position; a brief native hint
explains the controls. The field uses the original daytime lawn without a seed
bank or sun economy, and no added tips appear below challenge cards.

Mode 76 owns unused native profile record 75; all earlier IDs, records and
serialized object members remain. A saved garden retains its surviving plants
and moved positions. Cold Front's earned Chill-shroom unlock and the other three
Bonus modes remain. Night Shift now warns every eligible mature grave, so
removing one warned grave cannot promote an unwarned grave into a capped rise.
The three-zombie rise limit and existing wave tuning are unchanged.

Release validation passed: the final 781-file source built in 325.974 seconds;
all 2,462 native checks in eight suites passed, followed by 14 browser suites
and 11 worker scenarios. The 9,342,093-byte engine source archive has 816 entries;
both the full-upstream patch and exact Chill.9 delta reconstructed all 781 source
files byte-for-byte. The accepted six sprite PNGs and packed artwork are unchanged.

Muted full 1x runs, with planning pauses, cleared all four Bonus modes. Cold Front
finished with all 25 plants, all five mowers and 250 of its 1,500 starting sun.
Cone Zone finished with three mowers after a mixed-attachment save/reload/Continue.
Night Shift finished with all five mowers after saving during a grave warning;
the pending rise continued after reload rather than restarting its six seconds.
Garden Shuffle finished all ten waves with four surviving shooters and all five
mowers, after a native save/full reload/Continue preserved moved positions and
the two lost Wall-nuts. Selection, ghost art, valid movement, occupied-square
rejection and the one-second cooldown were checked during the Garden run.

All runs used isolated generated QA profiles with synthetic starting trophies;
the actual native replay moneybag and return to Bonus establish the observed
clears. Private player saves were not read. Cold Front's run used unchanged
Chill.9 gameplay; the other three ran the final Garden.1 build. These successful
strategies do not establish universal balance or full original-game parity.
Packaging, extracted-source and matching GitHub Pages publication receipts are
recorded by the release process after this validation.


## Chill.9 Cone Zone variety and Night Shift graveyard control

The user requested many cone-wearing zombie combinations, native giant bowling
Wall-nuts, and a more distinctive Night Shift. They approved graveyard control:
new graves between waves, zombies emerging from them, and Grave Busters plus a
wider mushroom conveyor. The existing native presentation and absence of added
challenge tips remain.

Cone Zone now combines native cones with screen-door, newspaper, pole-vaulter,
ladder, jack-in-the-box and football zombies, plus regular coneheads and a cone
flag zombie. Cone armor has 370 health, native damage stages and a knocked-off
cone; shields and special behaviors remain. Football uses the cone in place of
its football helmet. Ten waves contain 80 authored zombies. The native giant
Wall-nut from Bowling 2 is in the five-packet opening, weighted deliveries and
every eighth successful delivery. Its original straight rolling and damage
behavior is retained.

Night Shift retains ten authored waves/66 zombies. Four starting graves can
be joined by one safe new grave before waves 2, 4, 6 and 8, capped at six live
graves and confined to empty right-side tiles. Before waves 4, 7 and 10, native
dirt effects warn of a six-second countdown; at most three normal zombies rise
from mature surviving graves. Grave Busters reduce that pressure. Two are in
the opening bank, and another is supplied when graves remain with none waiting
or working. The wider conveyor includes Doom-, Magnet-, Hypno-, Ice- and
Chill-shrooms. Existing plant/crater tiles are preserved.

Cold Front and its earned normal-chooser unlock are retained. No seed or mode
IDs, serialized fields or accepted sprite pixels change. State-zero legacy
checkpoints keep their old fixed-bank rules. Chill.8 arcade checkpoints retain
their saved board/belt/wave and gain the new mechanics on later events; new
games get the revised opening and wave roster.

Local release gates pass on 2026-11-01: the coherent 120.732-second Release
build left all 780 source files unchanged. All 2,084 native checks, fourteen
browser integration suites and eleven worker scenarios pass. Tests execute the
new armor/damage/drop, original giant-nut physics, safe grave placement, bounded
rises, pending-rise award gate and no-graves final completion path. Original
IDs, serialized member layouts, legacy content and accepted sprite pixels stay
verified. Both upstream and exact Chill.8 patches reconstruct every source byte.
The 812-entry corresponding-source ZIP is 9,308,592 bytes, SHA-256
`7fa3d16079cca928812a965ec7bdcd15c7f157570d14607895c31067d06e49f0`.

Muted browser checks used the isolated `127.0.0.1:4215/?testing=1` origin and
built-in generated QA - Boss! profile. Its campaign and Bonus trophies are
synthetic fixtures, not earned results. Browser file-chooser transport for a
separate generated fixture failed; built-in profile addition succeeded. No
private user saves were read. Actual Cone Zone play verified native giant,
normal and explosive launches, visible door/newspaper/pole/ladder/jack/football
cones, the replaced football helmet and knocked-off cones. Night Shift verified
an added grave between waves, Grave Busters working on graves, at least one
completed removal and a replacement packet, plus awake Chill-/Magnet-shrooms
and the wider native conveyor. These are bounded visual/control checks: no full
clear, universal balance, manual grave-burst timing or manual checkpoint restore
is claimed. Both runs saved through the native menu; the owned test tab/server
are closed. The user's public game tab was not reloaded. Final source-download
extraction and public hosting receipts are recorded separately with the matching
release commit and Pages workflow.


## Chill.8 bonus minigames and unlock — local verification

The user reported Cold Front was extremely hard, asked how Chill-shroom can be
selected in actual gameplay, and rejected three similar fixed-bank wave levels.
Previous short animation samples and method tests were insufficient evidence of
balance. On 2026-11-01 the user confirmed three distinct directions and the
unlock rule: Cone Zone bowling, Night Shift conveyor play, Cold Front a short
setup-and-defend puzzle; a Cold Front win unlocks Chill-shroom in normal native
Adventure/Survival seed selection. Existing valid wins count toward that unlock.

Fresh games use distinct native mechanics. Cold Front starts with a 1,500-sun
preparation phase, no graves or sun economy, six non-free plant choices and four
short waves. The native LET'S ROCK! button begins combat. Cone Zone uses
native rolling nuts and Night Shift uses timed native conveyor deliveries,
each with ten waves. Final source and playtest receipts establish exact tuning.
Existing state-zero checkpoints keep their old rules and original filenames;
the existing Continue dialog distinguishes saved challenge from new minigame.
No old checkpoint or completion is silently discarded.

Chill-shroom uses a sparse chooser mapping from seed ID75 to unused UI slot49,
without changing original seed/mode IDs, global capacities or native saved
object layouts. The packet uses the original addon frame above Imitater, with
safe selection, bank, Survival repick and saved-deck paths. Original Crazy Dave
forced picks and Imitater choices remain. Accepted plant artwork, original card
compositions, menus and absence of added challenge tips remain unchanged.

The exact parent is the published Chill.7 source ZIP, SHA-256
`450613f4d14df23380549081b154d40c11587151d37e749a74f5118a11534605`.
Current target is `0.2.6-web-chill.8`; full corresponding source and parent delta
must reconstruct all current source bytes. Agent browser tests use `?testing=1`
and isolated QA data; normal-player audio and automatic saves stay available.

Chill.8 local release gates pass on 2026-11-01. The coherent 190.365-second
Release build keeps all 780 source files unchanged during compilation. All
1,831 source-coherent native checks, fourteen browser integration suites and
eleven worker scenarios pass. Coverage includes sparse native chooser/deck
mapping, actual unlock/selection handlers, fresh minigame mechanics and retained
legacy rules. Original IDs, saved layouts and all six sprite PNG/header pixels
remain; nine public artwork/metadata files and the header reproduce exactly.
Both upstream and Chill.7 patches reconstruct every current source byte. The
812-entry engine source ZIP is 9,283,046 bytes, SHA-256
`04bd204805f83ce8322952fbba81a9e5a2d73bdf1eeafaf95b4a5c7ccf33d367`.

Actual muted playtesting used an isolated local origin and a generated campaign
fixture with all three bonus records zero. Fresh Cold Front was played through
at 1x: 1,250 of the 1,500 sun bought five Chill-shrooms, five Fume-shrooms, ten
Scaredy-shrooms and five Wall-nuts. All four waves/32 authored zombies cleared
with 250 sun left, all 25 plants and all five mowers intact, and no Cherry/Squash
use. A trophy was observed by 112.977 wall-clock seconds after combat began;
that is an observation bound, not an exact game-time measurement. The trophy
was collected and only Cold Front gained the native Bonus ribbon.

That earned reward appeared in Adventure's native chooser and selected into
its bank. Actual non-bonus planting used the original Last Stand: Chill cost75
(5000 to4925), slept in daylight, then native Coffee Bean cost75 (to4850) and
woke it. Normal Adventure planting/completion is not claimed. Separate early
synthetic-win and zero-win fixtures verified selectable addon versus absence;
the earned proof is the separate fresh Cold Front run. Native Cone Zone checks
launched normal and explosive bowling nuts and observed the original explosion.
Night Shift checks consumed/replenished conveyor packets, planted an awake
Fume-shroom and used Grave Buster to reduce the four initial graves to three.
These were bounded control checks, not full Cone/Night clears or balance proof.
Legacy checkpoint rules and layouts are source-tested, without a fresh manual
legacy restore claim. Owned test tab/server are closed; the user's public game
tab was not reloaded. Final packages, extracted-source check and hosting results
are recorded separately by the publisher and matching Pages workflow. One
successful strategy does not establish universal balance or original-game parity.

The older formal parity goal remains paused. This scoped current work follows
the new user request; it does not complete or resume exhaustive original parity.

---

## Historical Chill.7 motion/effect record

# Chill-shroom idle, target activation and frost refinement — locally verified release candidate

Requested 2026-11-01. Add restrained idle animation, attack only while an eligible
zombie is within range, and replace the overly fast, abruptly ending frost
presentation with the original game's puff artwork and a readable fading plume.
Preserve the user's accepted proportions, painted character and native UI.

Target `0.2.6-web-chill.7` adds gentle idle breathing, attacks only while an
eligible zombie is within the existing 150-pixel radius, and a slower frost
plume with readable outward movement and fade. The accepted Chill.5 proportions
and published Chill.6 paint are preserved: all six sprite PNGs and the packed
artwork header stay unchanged. The shared rig, centered packet/native card,
original menus and absence of added challenge tips remain.

A ready plant waits at counter 41 without a target, then begins a 40-tick
wind-up when an eligible zombie enters range. Recheck eligibility during that
wind-up and cancel if every target leaves. Pulses remain at least 400 ticks
apart, with the existing 75-sun cost, 750-tick recharge, 150-tick slow and no
damage. Stronger chill/freeze is preserved. Keep idle movement gentle, about
one to two percent, ground-anchored and derived from the saved native carrier phase.

Use the original Snow Pea puff artwork for the frost plume, with staggered
outward movement over 55 ticks and a fading tail lasting 100 ticks in total
(about one second at normal speed). Keep the 30-tick recoil separate from the
longer visual tail. Preserve pause, 1x/2x speed, saved phase and native tint,
filter, flash, blink/sleep and attachment ownership. Add no serialized fields,
new plant/challenge IDs, gameplay HUD or new image-generated artwork.

The exact parent is the published Chill.6 source ZIP, SHA-256
`518d779b9948ac8a2d124db8f7929f13acf1121f38953d4ebee367518da17104`.
Current source targets are [Chill.7 source](dist/source/pvz-portable-0.2.6-web-chill.7-source.zip),
[full upstream patch](dist/source/web-chill.7.patch),
[Chill.6 delta](dist/source/chill6-to-chill7.patch), and
[pinned parent](dist/source/pvz-portable-0.2.6-web-chill.6-source.zip).
All agent browser checks remain silent with `?testing=1`; normal-player audio
and automatic saves remain available. Historical art prompts and inputs are
retained; this motion/effect revision does not generate new plant or card art.

Completion criteria:

- Keep the exact published Chill.6 canonical paint and six PNG/header pixels,
  registered cap/body geometry, packet/card compositions and original content.
- Hold ready without targets; begin wind-up only with an eligible zombie in
  range, cancel when all targets leave, and preserve the existing minimum pulse
  interval, cost/recharge, slow duration, no-damage behavior and stronger chill.
- Add subtle saved-phase breathing with fixed ground contact, coherent blink,
  sleep and attack poses, and no per-frame image allocation or visual seams.
- Give the native frost puffs staggered outward movement and a lingering fade,
  separate from recoil, with no abrupt cutoff or HUD spill.
- Verify targeting/cancellation/boundaries, idle/effect timing, saved phase and
  unchanged layouts/IDs with meaningful current-source tests; keep browser
  testing silent and report the limits of the bounded visual sample.
- Publish matching binaries, complete source, tests, patches and provenance;
  commit/push and verify the matching Pages run and served release bytes.

Status: implementation and validation in progress. The scoped work is recorded
here without new formal-goal actions. The older formal parity goal remains
paused and unfinished; this task does not complete, replace or resume it.

The last verified publication before this pass is Chill.6 commit
`3dfc2e9952961fa6b02c63a6fa8aebe0f016fd55`, deployed by successful
[workflow 41325541238](https://github.com/Caleb-Guyer/plants-vs-zombies-web/actions/runs/41325541238).
That result does not establish Chill.7 publication or full parity.

Chill.7 local release gates pass on 2026-11-01. The coherent 113.347-second
Release build retains all 780 source files unchanged while building. All 1,577
native checks, fourteen browser integration suites and eleven worker scenarios
pass with current source/harness pins. New coverage includes empty-lawn ready
hold, exact range entry, interrupted wind-up/reacquisition, eligibility, unchanged
cadence/slow, skipped long-cooldown scans, saved-phase grounded breathing and
actual native puff centering, staggered travel, late visibility and fading.
No new serialized fields or IDs are introduced. Original plant logic outside
the reviewed custom update/pose hook remains byte-identical to the exact parent.

All six artwork PNGs and the packed header are unchanged from Chill.6. Nine
public artwork/metadata files and that header reproduce exactly. Both upstream
and Chill.6 delta patches reconstruct all 780 source files. The current engine
source ZIP has 812 entries and 9,257,802 bytes, SHA-256
`450613f4d14df23380549081b154d40c11587151d37e749a74f5118a11534605`.

The muted native review restored the existing Sun/Chill/Puff fixture and
captured 74 full 1280x720 frames over 8.2 seconds. Sampled idle poses, two frost
releases, outward plume travel and dissipation are coherent; there are no
observed detached parts, plant seams, clipping or paint changes. Packet and
centered native Bonus card remain consistent. Menu paused the game; the owned
test tab and server were closed without reloading the user's public game tab.
Empty-range gating is automated coverage, not a separate browser observation.
This is not an earned win, full battle, every-frame/style equivalence or new
save-transfer cycle. Final website-package identity, extracted-source check and
hosting result are recorded by the publisher and matching Pages workflow.

---

## Historical Chill.6 final style pass

Requested 2026-11-01. Preserve the exact whole-character silhouette and proportions the user approved in Chill.5. Refine only the painted finish and restrained expression/motion so the character sits naturally beside the original Sun-shroom, Puff-shroom and Fume-shroom at native game scale.

Completion criteria:

- Keep the approved alpha silhouette, cap/body registration, broad cap, short wide body, centered shared 80x80 rig and ground anchor. No new neck, pedestal or feet.
- Use the authentic original sprite references to refine outlined forms, smooth painted light/mid/shadow transitions, distinct cap markings and economical facial features. Avoid large shiny highlights, watercolor bands and modern toy-like gloss.
- Verify the same design in the lawn, seed packet and centered native Cold Front portrait. Keep existing idle/wind-up/release/recovery motion, blink/sleep ownership and fixed mechanics unless a concrete animation defect is found.
- Reproduce all sprite/header outputs from published inputs. Test current source and the unchanged save/content/audio behavior; keep all browser testing muted with ?testing=1.
- Commit, push and verify the tested release on the existing GitHub Pages site. Report visual judgment separately from automated correctness.

The formal goal tool rejected creation because an older paused parity goal is unfinished. This scoped goal records the user’s request without falsely completing, replacing or resuming that historical goal. Target release: 0.2.6-web-chill.6.

Status: final release candidate complete and locally verified. The approved silhouette and cap/body masks are byte-identical, paint and bounded eye frames are refined, all 1,532 native checks and all browser integration checks pass, and the muted lawn/packet/card review found no blocking draw defects. Publication is verified separately by the matching GitHub Pages workflow and public-byte receipt.

Chill.6 local release gates pass on 2026-11-01. The coherent 90.230-second
Release build contains 780 source files. All 1,532 native production checks,
fourteen browser integration suites and eleven worker scenarios pass. Independent
parent comparisons retain every approved canonical and cap/body alpha byte and
all runtime, mechanics, animation and save code. Nine public artwork/metadata
files and the packed header reproduce exactly. Both the full upstream and
Chill.5 delta patches reconstruct every current source byte. The 812-entry
engine source ZIP is 9,249,381 bytes, SHA-256
`518d779b9948ac8a2d124db8f7929f13acf1121f38953d4ebee367518da17104`.

A muted native review inspected the centered earned-fixture card, seed packet,
restored Sun/Chill/Puff checkpoint and 32 full-size frames over a bounded
5.6-second idle/wind-up/release/recovery sample. The corrected paint is consistent
across these views, with no observed seam, detached part, clipping or layer jump.
The original Menu paused the game and the owned test tab was closed. This is
fixture-based visual coverage, not an earned win, full battle, new save-transfer
cycle, every animation frame, subjective perfection or full original-game parity.
Final website-package identity, extracted-source check and hosting result are
recorded separately by the publisher and matching Pages workflow.


---

## Historical Chill.5 completion record

# Chill-shroom approved proportions and registered rendering

The user rejected Chill.4 and identified shape/proportions as the main issue.
A complete replacement preview was shown before implementation; the user replied
“Proportions look right.” Chill.5 locks that approved whole-character silhouette:
a broad asymmetric rounded cap, short wide body, no pinched neck and no feet.
The approved master SHA is
`f861148f8c57bbee31595e8fd5692aa23c1282172ab0016a159adf406f2a373d`.

One uniform resize places the character on a shared 80×80 canvas. The registered
cap/body neutral union must equal the approved canonical pixels exactly, SHA
`c00b7d93e79d2fb8f39ea2dbddd178e02d040ac1f4fd2e8bb62f105502317fb7`.
Individual parts are never resized to Ice-shroom pivots. A shared DrawRig renders
the live plant, packet and Cold Front card; the invisible native carrier retains
blink/sleep clocks, attachments and save ownership. Eye edits are bounded to the
face, keeping the approved outline/alpha and all other paint unchanged.

Keep all original content, IDs, save layouts, pulse/range/chill/cost/recharge,
eligibility, QoL, workers, schema 2 and normal-player audio. Challenge pictures
remain centered native sprite compositions, without separately generated
challenge illustrations or added tips. Agent browser checks stay `?testing=1`.

The older formal parity goal remains paused; this scoped revision does not
complete or replace it. Current source target is `0.2.6-web-chill.5`.

Completion criteria:

- Preserve the accepted master, one uniform canonical scale, common layer
  coordinates and exact neutral RGBA. No old Ice-art pivot fitting or new feet.
- Reuse one cached rig for plant/packet/card with bounded cap motion, native
  clock/blink/sleep, tint/flash/filter, attachments and paused saved-phase draw.
- Preserve the original game's content, all mechanics, save formats/IDs, QoL,
  audio and native card/title/hover/trophy layout with no added tips.
- Verify production behavior, approved-master pixel registration, source/build
  coherence and muted in-game appearance. Preserve truthful coverage limits.
- Publish complete source/art/prompts/dependencies/licenses and tested artifacts
  to the existing GitHub repository and Pages, within the 100 MiB file policy.

Pre-publication current evidence on 2026-11-01: all 1,532 production checks
pass with current source/harness pins. The final 95.879-second incremental
Release build retains all 777 source files unchanged (the initial full build
also passed). Nine public art/JSON files and the packed header reproduce byte
for byte. The canonical neutral pixels independently match the accepted master.
Both upstream and Chill.4 delta patches reconstruct all 777 current source
files. The 809-entry source ZIP is 6,500,652 bytes, SHA-256
`8e97e5f49981a5e7a9a230e6651c586d6b9e3434ab22092dc30c7aa897d1c0ab`.
All fourteen browser integration suites and eleven worker scenarios pass.

Actual muted native review shows the same accepted proportions in the packet,
centered earned Cold Front portrait and restored 50-sun Sun/Chill/Puff board.
The new art is already present behind paused Continue. Original title hover is
red and no added Bonus tips appear. A bounded5.6-second sample captured33 valid
1280×720 frames showing idle, wind-up, release and recovery; sampled phases keep
the short body connected and show no old Ice artwork. The native Menu pauses
correctly. This is not full-game or every-blink/frame coverage, a full battle,
an earned win or a fresh import/export/save cycle. Owned test tab22 is closed;
the user's public game tab was not reloaded. Website-package and hosting
verification have separate publisher receipts.

Current input records: [generation](dist/content/chill-shroom/generation.json),
[extraction](dist/content/chill-shroom/extraction.json),
[sprite provenance](dist/content/chill-shroom/provenance.json),
[native cards](dist/content/native-bonus-art.json). Earlier Chill.4 art was rejected.
Deterministic extraction is separate from stochastic image generation. Automated
checks and bounded observations do not certify subjective perfection or full
original-game parity.
