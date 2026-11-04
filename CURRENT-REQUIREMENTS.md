# Current requirements

## Raid.5 - custom-content regression pass

Rally Raid refreshes zombie animation speed as its Rally movement effect changes, using the same refresh path already present in Rally Point. The correction extends one mode guard in Zombie::UpdatePlaying; no new animation, clock, content, UI or saved field is introduced.

Across all 828 production files, only CMake/ProjectVersion.cmake and Zombie.cpp differ from the authenticated Raid.4 parent. Accepted art and content metadata, both plant rigs, the still-idle I, Zombie renderer, boards, economy, unlocks and saved layouts remain byte-identical. The browser shell changes only its release/cache identity.

All seventeen muted native suites passed: 1,492,614 checks, zero failures. All fifteen browser integration suites passed. Rally Zombie contributes 327,526 checks in 24 cases and twelve 1x/2x pairs, including four separate custom-content consistency controls. Each inspects seventeen plant-body samples, three native-font Almanac entries and actual gait in Rally Point, Rally Raid and the original Adventure exclusion. The retained Raid suite passes 1,040,562 checks in 32 cases and sixteen pairs, including all 24 legal winning runs. Muted Raid.5 browser inspection verified both custom plant Almanac pages and Rally Zombie, with clear portraits, titles, descriptions, costs and navigation.


## Raid.4 - attack-only Chill cardboard motion

Chill-shroom holds a still, open-eyed cardboard pose during Rally Raid idle: no-target readiness, cooldown and the fading frost tail. It animates during its existing windup, release and recoil. Drawing temporarily uses an exact neutral overlay and then restores the full previous overlay and filter; native animation clocks, blink objects and ability counters continue without changes.

Only CMake/ProjectVersion.cmake and RallyRaidPresentation.cpp differ from Raid.3 across all 828 production files. Normal-mode idle, the shared rigs, Mender behavior, native I, Zombie UI/head routing, accepted artwork and all content metadata remain byte-identical. Boards, budgets, combat, IDs, unlocks and saved layouts are unchanged. Browser shell changes are limited to the release/cache identity.

All seventeen muted native suites passed: 1,485,247 checks, zero failures, along with all fifteen browser integration suites. Raid contributes 1,041,079 checks in 32 scenarios and 16 speed pairs: 24 legal winning runs, four native-UI controls and four plant-animation controls. The Lantern suite passes 1,724 checks, retaining its original 548; native layout passes 10,693. Muted browser capture also confirms still idle, live attack motion and a return to the identical still cooldown pose.


## Raid.3 - current cardboard plant rigs

Rally Raid's custom defenders use the existing live Chill-shroom and Mender-bloom rigs for all four native cardboard passes. Current plant counters and the saved carrier phase supply idle, attack, blink and healing poses. The renderer retains the original colors and offsets, restores the carrier filter, and preserves the caller's graphics state. It creates no per-frame image buffers, new clocks or unbounded filter-cache entries.

Only CMake/ProjectVersion.cmake and RallyRaidPresentation.cpp differ from Raid.2 across all 828 production files. Shared normal-mode plant rigs, the native I, Zombie head/UI routing, accepted artwork and all content metadata remain byte-identical. Authored boards, budgets, combat, IDs, unlocks and saved layouts are unchanged.

All seventeen muted native suites passed: 1,483,032 checks, zero failures, along with all fifteen browser integration suites. Raid contributes 1,039,708 checks in 32 scenarios and 16 speed pairs: 24 legal winning runs, four separate native-UI controls and four separate plant-animation controls. The Lantern suite passes 880 checks, retaining its original 548 and adding 332; native layout passes 10,693.


## Raid.2 - native I, Zombie routing

Rally Raid uses the original I, Zombie rendering paths. The bank draws through the normal lower UI path, and non-fog Menu/speed controls draw there too; fog retains the native top path. Tall lawn actors may draw in front of the bank exactly as in I, Zombie. Packet-pick and ready-flash particles use their original render layers.

The four methods are restored byte-for-byte from the authenticated published Rally.3 source. Only version metadata, Board.cpp and SeedPacket.cpp differ from Raid.1 across all 828 production files. No sprite, geometry, footer, board, economy, combat, content ID, unlock or saved layout changes accompany this correction. The ninth card's interface description is updated; every other card/content metadata field and accepted bitmap remains unchanged.

All seventeen muted native suites passed: 1,474,524 checks, zero failures, along with all fifteen browser integration suites. The Raid suite contributes 1,031,532 checks in the retained 28 scenarios: 24 legal winning runs and four separate native-render controls. The focused layout suite passes 10,693 checks.


## Raid.1 - Rally Raid

The finite `0.2.6-web-raid.1` addition is Rally Raid, the ninth Mini-Games > Bonus card. It contains five fixed I, Zombie boards with the original bank, brains, deployment line, cardboard plant treatment and footer progress. The card combines the repaired native Rally Zombie rig with the original brain artwork. It introduces no separate generated challenge illustration, extra HUD or challenge-card tips.

The five bank packets are normal zombie, Conehead, Buckethead, Screen Door and Rally Zombie. Their costs are 50, 75, 125, 100 and 100 sun. Each board resets its own budget to 450, 550, 600, 650 or 750 sun. Native armor, biting, projectiles, frost, healing and the existing non-stacking Rally movement support resolve combat. Authored mushroom defenders are awake. Thinking time is untimed; exhausting the native economy without surviving attackers can produce the original game-over.

All five native brains must be eaten on each board. Boards one through four transition without awarding completion. The fifth creates the native trophy on a first clear and the normal replay reward on later clears; the unique Bonus trophy count stays one. Native Try Again and confirmed Restart restore the current board and its budget; cancelling Restart preserves the active board. A fresh New Game starts at board one. Save/Continue retains the current board, actors, packet economy, brain score and transition timer.

Mode 81, reserved profile record 80 and zombie packet 77 are appended without shifting existing IDs, plant/cache/chooser ranges or saved object layouts. Challenge state 111/112/113 and the existing survival-stage, score and timer fields carry the new state. The Rally effect extension is confined to Rally Point and Rally Raid. Native UI layers keep the Raid bank and Menu/speed controls in front of top-row actors while retaining packet feedback. Existing content and custom-plant unlock requirements remain.

All seventeen muted native suites passed: 1,194,484 checks, zero failures, along with all fifteen browser integration suites. The Raid matrix contributes 751,506 checks across 24 legal winning runs and four separate synthetic HUD controls; retained Care, Chain Reaction and Rally Zombie regressions remain active.


## Chain.1 - Chain Reaction

`0.2.6-web-chain.1` adds **Chain Reaction** under **Mini-Games > Bonus**. Clear five hand-arranged boards with a limited supply of Cherry Bombs, Jalapenos and Potato Mines. Place the plants, then press the original Let's Rock button. Retry restarts the current board; a first complete clear earns one trophy. Its seventh Bonus card combines the original three plant sprites.

Planning holds zombies and explosive fuses while the finite seed supply is arranged. Let's Rock commits the plan; the original explosions, zombie movement and armor resolve it. Five different spatial layouts introduce the three tools, then combine them. There is no sun economy, mower rescue or bonus loot. The standard footer shows board progress, and the original stone button and brief native hint carry the instructions.

Chain Reaction appends mode 79 and uses reserved profile record 78. Only completion of the fifth board creates the final native award and records one win; the first clear receives the trophy and replays use the native replay reward. Try Again and in-game Restart reset the current puzzle, while a fresh New Game begins at board one. Native save/Continue preserves planning, live resolution and the transition between boards. Existing saved-object layouts, serializers, original mode/plant IDs, the six earlier Bonus games and accepted plant art remain unchanged. The new card composes original game sprites; no separate AI-generated challenge illustration is used.

All fifteen silent native suites passed: 119,694 checks, zero failures. The thirteen focused suites contribute 37,423 checks. Native layout now has 7,187 checks: the previous 6,862 remain, with 315 new Chain UI checks and ten fixed-layout authoring checks. The new checks execute the actual button, footer and advice helpers with independently pinned original 28-point and 16-point font alpha. They cover all five footer labels, pause, both speeds and six viewport shapes. The hint uses one line with ink ending at y=512. Omitting its draw-local offset must obstruct the start button; copying the native Last Stand footer-button position must clip the canvas. Both negative controls fail as intended. All five authored layouts reserve the top lawn row; inserting the observed pre-fix row-zero conehead into each layout must be rejected. This is a fixed-content authoring guard under the unchanged native lane geometry, not a complete raster check of zombie animation frames. Another 115 focused checks execute the actual Options Restart case and Chain ResetStage/Populate with controlled modal, allocation and actor collaborators. Acceptance restores each current puzzle and its full finite inventory; cancellation preserves its old state. Five retained mode paths keep their native Restart captions and routing.


## Care.3 - fatigue cues and complete-engine battles

`0.2.6-web-care.3` makes Intensive Lawn Care fatigue visible in the original plant rigs. Plants begin to droop at 180 HP, settle into a low breathing rest at 60 HP, and rise as Menders heal them. Native attack poses remain aligned with their projectiles. Fatigue no longer borrows the white bite flash; there are no extra status bars or floating icons. The accepted artwork, challenge layout and balance remain unchanged.

Mender healing sparkles now retire after their native 60-tick pulse instead of accumulating looping emitters. A one-time board-load cleanup also retires old zero-cutoff healing effects while preserving finite saved lifetimes. Shared trophy artwork and serialized layouts remain unchanged.

All fourteen silent native suites passed: 37,952 checks, zero failures, including 25,042 fatigue rendering/state checks. The complete linked production engine ran sixteen battles: normal play, an 18-second recovery lapse, save/Continue and no recovery, at 1x and 2x across two fixed seeds. All twelve required recovery strategies earned the native award; all four no-recovery controls reached actual game over. No battle exhausted the particle pool. Separate migration fixtures exercise real save/load of legacy looping particles. The normal strategy deploys cover at the visible 180-HP cue before resting its predecessor. Two additional strategies (waiting until 100 HP, or withdrawing lone defenders immediately at 180 HP) lost on one seed; their failure receipts and logs are retained locally as characterization limits and excluded from passing battle counts. These are bounded reactive test strategies, not a claim about every player's difficulty or exhaustive parity.


## Care.2 - presentation bounds

`0.2.6-web-care.2` fixes the reported Intensive Lawn Care overlaps while retaining original assets. The complete conveyor backdrop, including its seed-bank parent translation, must be clear of the glove frame and icon; the glove must also clear the native menu/speed controls. Drawing and hit-testing use the same tool rectangle. The original-font opening hint must fit above the footer and must not remain over the pause dialog.

All twelve silent native suites passed: 11,940 checks, zero failures, including 6,862 layout checks. The layout harness also passed with the installed native compiler; all fourteen browser integration suites passed. The Release build passed with all 817 source inputs unchanged. Native layout regressions are part of the release gate. Existing modes, artwork, rules, unlocks and serialized layouts remain unchanged.


## Care.1 — Intensive Lawn Care

`0.2.6-web-care.1` adds the repair-and-redeploy minigame: five fixed Menders, five protected recovery pots, five opening Repeaters, a wounded-plant conveyor, native glove movement and ten authored waves. Recovery-bed plants cannot attack. Front-line combat plants lose four HP per second while live zombies are present and stop attacking at 60 HP or below. The ordinary Mender pulse restores ten HP every three seconds. Moving a patient preserves the native plant instance.

Mode 78 and state 105 use existing serialized fields. Completion and replay use reserved profile record 77. Original IDs, saved layouts, the existing five Bonus modes and plant unlock rules remain. The sixth card uses actual sprite parts; there are no card tips, extra panels or health bars.

All eleven silent native suites passed: 5,078 checks, zero failures. All fourteen browser integration suites passed. The accepted Mender.3 and Chill-shroom art and existing challenge data remain byte-identical. The manual-play validation limit is recorded in [PARITY-QA.md](PARITY-QA.md).

## Mender.3 distinct Mender-bloom identity

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

## Mender.2 accepted presentation corrections

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

## Mender.1 support plant and Almanac repair

The accepted addition is Mender-bloom, a distinct support flower unlocked by
beating Seed Swap. Existing valid Seed Swap completion records unlock it without
rewriting progress. It is available in the normal seed chooser after unlocking,
costs 125 sun and has a 15-second recharge. It restores 10 health to eligible
damaged living plants in the eight neighboring squares every three simulation
seconds. Healing cannot exceed the target's native maximum health. Mender-bloom
does not attack, heal itself, resurrect plants or repair temporary/instant plants,
underplants, squished plants or plants being carried by bungees. Healing runs only
during active gameplay, with no progress during pauses, intros or level awards.

The presentation uses a distinct coral-and-cream six-petal flower, registered
80 by 80 head/stem layers, gentle idle motion, blinking and a brief healing lift.
Only an actual repair emits native sparkles. The built-in image generation tool
was used for this plant's artwork, with prompts, references, source masters and
a deterministic layer recipe retained in the source package. No Bonus card
illustration was generated or replaced.

The missing Chill-shroom Almanac entry is fixed alongside Mender-bloom's new
entry. Both use native seed packets, animated plant previews and descriptive
text. Their unlocks follow the existing Cold Front and Seed Swap wins,
respectively, including prior valid wins. Original Almanac positions, native
seed/cache ranges and serialized object layouts are preserved. All five Bonus
modes retain their existing rules, cards and balance. No additional HUD or
challenge-card tips are introduced.

For `0.2.6-web-mender.1`, all 3,769 native checks in ten suites, 14 browser suites,
11 worker scenarios and the full build of 795 unchanged source inputs passed.
The 836-entry corresponding source ZIP and both binary patch reconstructions
were verified. Muted local checks confirmed both Almanac entries, accurate
cost/recharge, animated portraits, original Sunflower reselection, Survival seed
selection, the 125-sun planting cost and idle animation. Menu/Leave, full reload
and Continue restored Sunflower, Wall-nut and Mender-bloom with the saved bank,
zombies and suns. Unlock visibility used synthetic QA wins, not a newly earned
clear; healing amounts are verified by production-method tests, not a visual
battle claim. Public Pages and hosted source-download receipts are recorded by
the release workflow. These checks do not prove flawless art or complete
original-game parity. Earlier release records describe their own builds.

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

Updated 2026-11-01. This records the latest human clarification for continued work on the public Plants vs. Zombies browser site. It supersedes older requirements for permanent silence, a large landing page or a surrounding promotional interface. Historical QA observations remain historical evidence and must not be treated as current product requirements or instructions to resume manual validation.

## Historical Chill.8 release direction

The user's 2026-11-01 playtesting complaint supersedes the earlier request
to stop manual gameplay. This revision requires an actual muted fresh Cold Front
clear and earned unlock/normal planting check, plus bounded native controls
checks for the other two minigames. Automated checks remain necessary but do
not establish difficulty or fun. Continue publishing verified updates to
Caleb-Guyer/plants-vs-zombies-web and GitHub Pages while stating coverage limits.

The last verified publication before this pass is Chill.7 commit
`fb8b9b39d2dcf77aa183ca5f293a36cda3ed7c89`, deployed by successful
[workflow 41328439292](https://github.com/Caleb-Guyer/plants-vs-zombies-web/actions/runs/41328439292).
That result does not establish Chill.8 publication or full parity.

## Historical Chill.7 idle, target activation and frost request, 2026-11-01

The user reports that Chill-shroom needs an idle animation, should attack only
when zombies are in range, and emits frost too quickly with an abrupt disappearance.
The current task is to correct those observed behaviors while retaining the
accepted appearance and original game's restrained presentation.

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

[Scoped current work](CHILL-REVISION-GOAL.md) records the acceptance criteria.
The older formal parity goal remains paused; this task does not complete,
replace or resume that historical goal.

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

## Historical Chill.6 painted style pass, 2026-11-01

The user accepted Chill.5's proportions and requested one final pass matching the
other plants' style. Target **0.2.6-web-chill.6**, based on the exact published
Chill.5 source archive, SHA-256
`8e97e5f49981a5e7a9a230e6651c586d6b9e3434ab22092dc30c7aa897d1c0ab`.
Do not reshape the accepted character. Keep the original alpha silhouette,
cap/body pixel partition, shared 80×80 registration and ground anchor exactly.
Refine cap-spot contrast/size, shading, face and bounded eye patches using the
original Sun-shroom, Puff-shroom and Fume-shroom references. Runtime code,
mechanics, animation, serialized fields, save formats and original content stay
unchanged from Chill.5; verify their byte identity and current-source coherence.

Built-in image generation is allowed for the custom plant only. Preserve exact
prompts and immutable inputs in `source/artwork/chill-shroom/generation.json`
and corresponding public metadata. Native Bonus cards continue to compose the
actual sprites; no separately AI-generated challenge illustrations or added tips.
Keep QoL, workers, schema 2, normal-player audio and silent `?testing=1` testing.

[Scoped active goal](CHILL-REVISION-GOAL.md) records this work. The formal goal
tool cannot create another goal while the older paused parity goal is unfinished;
this scope does not complete, replace or resume that historical goal.

Historical Chill.6 local release gates passed on 2026-11-01. The coherent 90.230-second
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

## Historical Chill.5 approved shape, 2026-11-01

The proportions below remain accepted. The exact neutral RGBA pin describes
Chill.5 paint, not a restriction against the requested Chill.6 painted finish.


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

Historical Chill.5 pre-publication evidence on 2026-11-01: all 1,532 production checks
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

## Historical Chill.4 proportions — shape rejected, 2026-11-01

The user rejected the shape below; its earlier technical observations retain
their original scope and do not validate the Chill.5 appearance.


The user rejected Chill.3 as too flat/simple and asked for improved proportions,
shading and animation. Image generation is explicitly allowed for the custom
plant. Current source uses **0.2.6-web-chill.4**, based on Chill.3. Keep the
ban on separately AI-generated challenge pictures: use centered native
compositions of the actual game sprites, including the revised Chill-shroom.

Use a fuller asymmetric blue cap, painted highlight/midtone/deep underside,
compact rounded cream/mint body, expressive dark eyes and tucked feet. Preserve
native pivots and eye clearance without copying Ice's crystal crown or Puff's
muzzle. Use full-body half/closed expression variants with identical skin pixels
outside the eye bounds. Motion should have gentler body squash, independent cap
lag and rebound while preserving the mechanical attack cycle.

Retain 75 sun, 750-tick recharge, 400-active-tick pulse, 150-pixel radius,
150-tick native chill, stronger chill/freeze, eligibility and no damage. Preserve
all IDs, saved fields, phase, checkpoint/completion routing, original content,
workers, schema 2, QoL, minimal menus and normal-player audio. Keep added Bonus
tips absent and testing muted with `?testing=1`.

[Current criteria](CHILL-REVISION-GOAL.md) track this request. Independent
assembled-proof review finds improved proportions and volume without a critical
proof-level defect. Dated local evidence records a 226.121-second Release build
with 776 unchanged source files, 1,513 native checks, fourteen browser suites/
eleven worker scenarios, reproducible eight-file/header extraction and exact
full/parent patch reconstruction. Muted native review confirms consistent new
art across packets/lawn/cards, centered earned/unearned pictures, original hover
without tips and the existing 50-sun three-plant Continue with new parts visible
before unpausing. Two reliable samples show idle and closed-eye wind-up; sparse
sampling does not verify a full visual cycle or all release/blink frames.
Automated production tests cover detailed curves, expressions and saved phase.
Local checks pass; packaging/hosted rollout have separate publisher records.
No full battle or earned win is claimed. Preserve
the frozen atlas, full generation/extraction provenance, reproducible asset code,
complete source/dependencies/licenses and GitHub 100 MiB policy.

## Historical Chill.3 vector-art direction — superseded, 2026-10-31

The user later rejected the flat/simple appearance and allowed generated plant
art. The vector-only restriction and observations below retain historical scope.

The user clarified that a distinct custom plant sprite is allowed. The ban is
on AI-generated challenge pictures; it does not require copying Ice-shroom's
visual identity. Current source uses **0.2.6-web-chill.3**, based on Chill.2.
The custom sprite uses five editable vector/code-drawn parts: a rounded
asymmetric dusty-blue frost cap with simple white spots, mint/cream stem with
dark pill eyes, low organic base and matching blink patches. Use no image-generation
tool or separately generated challenge illustration.

Retain the native Ice motion carrier and existing wind-up/release, with no muzzle
or crystal-forest silhouette. Preserve consistent skin/eyes through idle, blink,
sleep, attack and saved Continue; bind the correct image-bearing sleep track and
separate blink instance. Keep the sprite centered and consistent across packets,
Cold Front's card and lawn. Native cards continue to compose the actual Conehead,
Puff and custom Chill sprites over original grass with the established uniform
alpha-bound fit. Keep trophy/title hover behavior and no added Bonus tips.

Preserve 75-sun cost, 750-tick recharge, 400-active-tick pulse, 150-pixel radius,
150-tick native chill, enemy eligibility, stronger chill/freeze and no damage.
Keep seed 75, mode 75, record 74, page IDs, native save layouts/filenames,
checkpoint migration, original content, workers, schema 2, QoL and normal-player
audio. Test silently with `?testing=1`; do not add HUD or instruction panels.

[Current criteria](https://github.com/Caleb-Guyer/plants-vs-zombies-web/blob/3ef11e097cd7455f3c0fb9575c8b565a5def4ad3/CHILL-REVISION-GOAL.md) track this clarification. Dated
pre-publication evidence on 2026-10-31 records a 245.914-second tested Release
build with 775 unchanged source files, 1,476 native checks and
fourteen browser suites/eleven worker scenarios. Editable SVG/JSON, PNG parts and
the Pillow renderer accompany the sprite. Final LF-normalized art/source
reproduction and package identities belong in separate publisher records.

Actual muted native review confirms the distinct sprite across preview/card/lawn,
centered earned/unearned heroes, red title hover without tips and custom parts
already visible before unpausing Continue. The existing 50-sun Sun/Chill/Puff
board restores; bounded capture shows closed-eye wind-up, radial release and
idle recovery without old Ice/blue blink flashes. No new save-transfer, earned
win or full playthrough is claimed. Local criteria pass; website-source/runtime
packaging and hosted rollout remain separate release records. Historical
Chill.2 results keep their own scope. Retain complete source, editable art/code,
assets, dependencies, licenses and the GitHub 100 MiB policy.

## Historical Chill.2 original-art interpretation — superseded, 2026-10-31

The broad no-custom-art interpretation below was superseded by the clarification
above. Its build/results remain historical; unchanged Ice-shroom art is no longer
the current product requirement.

The user explicitly requested no AI art for the pictures and a centered
Chill-shroom picture like the other plants. Current source targets
**0.2.6-web-chill.2**, based on Chill.1. Use unchanged original Ice-shroom artwork
for Chill-shroom, with no generated cap or recoloring. Give Cone Zone, Night Shift
and Cold Front separate native 80×65 pictures with one centered original hero:
Conehead, Puff-shroom and the actual Ice-based Chill-shroom, over original grass.
Center visible alpha bounds and fit uniformly rather than centering a padded
120×120 bitmap. Inspect the results with and without original trophy ribbons.

Remove active generated-image headers/bindings and all twelve standalone
AI PNG/provenance aliases from `dist/content`. Preserve exact historical source
archives and Git history; historical artwork links must point to the pinned
old commit. Record current original resource identities and composition in
[native artwork provenance](https://github.com/Caleb-Guyer/plants-vs-zombies-web/blob/2737e8d76b5fa485ef4b13fc604973d46f27a67b/dist/content/native-bonus-art.json). No artwork
generation tool is used for this revision.

Keep Chill-shroom's 75 sun, 750-tick recharge, 400-active-tick radial pulse,
150-pixel radius, 150-tick native chill, visible wind-up/release and no damage.
Keep enemy eligibility and stronger chill/freeze behavior. Preserve seed 75,
mode 75, record 74, page IDs, all original content, serialized fields, save
filenames, checkpoint migration, workers, schema 2 and normal-player audio.
Added Bonus tips stay removed; keep original title hover, menus, packets and
minimal icons without extra HUD or instructions.

[Current revision criteria](https://github.com/Caleb-Guyer/plants-vs-zombies-web/blob/2737e8d76b5fa485ef4b13fc604973d46f27a67b/CHILL-REVISION-GOAL.md) record this explicit request.
The old formal parity goal remains paused; a new objective could not be created
while that unfinished goal exists. The coherent Release build keeps all 771
source inputs unchanged; seven native suites pass 1,431 checks, fourteen browser
suites include eleven worker scenarios, and engine packaging/both patch
reconstructions pass. Native-size earned/unearned views confirm centered,
readable original subjects and native title hover without added tips. An existing
Chill.1 checkpoint restores 50 sun, Sun-shroom/Chill-shroom/Puff-shroom and the
original Ice art through native Continue, with graves and mowers retained.
Local criteria pass. No new battle win or fresh full save cycle is claimed;
website-source packaging and publication remain independent release checks.
Earlier Chill.1 results remain historical. Test silently with `?testing=1` and
publish the corrected complete source/runtime to the existing GitHub Pages site.
Retain the 100 MiB served-file policy and all required source, parent/upstream,
assets, tests, dependencies and licenses.

## Historical Chill.1 identity/attack revision — AI art superseded, 2026-10-31

The user later requested original artwork instead of this generated-art design
and a centered plant portrait. Requirements/results here retain their historical
scope and do not override the Chill.2 direction above.

The user rejected Lantern.2's plant and challenge art. A yellow/brown Lantern
with a Puff-shroom muzzle did not communicate its radial cold mechanic, and a
cap tint alone did not show an attack. The current candidate targets
**0.2.6-web-chill.1**, based on Lantern.2. Use **Chill-shroom** and **Cold Front**
as player-facing names. Preserve internal seed 75, mode 75, completion record 74,
existing checkpoint filenames and all other original/Bonus identities.

The [Chill revision criteria](https://github.com/Caleb-Guyer/plants-vs-zombies-web/blob/136d440a4daa0ac4f876a7200eb13d4382405845/CHILL-REVISION-GOAL.md) track this explicit request.
The goal tool rejected a new objective because the older parity goal remains
paused. Do not falsely mark that unfinished goal complete or claim that this
manual revision record is a new formal goal.

Use the native Ice-shroom body, eyes, idle, blink and sleep with a new squat,
rounded snowy cyan cap on its 103×54 canvas. Remove the Puff muzzle, projectile
outlet and yellow lantern identity. Give the existing pulse a visible 40-tick
wind-up, outward frost release and 30-tick recovery. Keep the four-second active
cycle, 150-pixel radial native chill for 150 ticks, 75 sun, 750-tick recharge,
no damage, enemy eligibility and stronger-chill/freeze preservation. Sleeping,
paused, grabbed, squished and dead plants must not advance the attack.

Generate separate integrated 80×65 paintings for Cone Zone, Night Shift and
Cold Front using the actual original challenge atlas as a style reference.
They must remain readable in the native frame both before and after the trophy
ribbon covers the upper-left triangle. Keep native titles and hover color;
retain the removal of added Bonus tips. Add no extra HUD or instructions.
Full prompts, reference identities and PNG hashes belong beside the four new
assets in [`dist/content`](https://github.com/Caleb-Guyer/plants-vs-zombies-web/tree/136d440a4daa0ac4f876a7200eb13d4382405845/dist/content/).

Preserve native saved object layouts, schema 2, worker and automatic saves.
Upgrade both Lantern.1 bodyless saves and Lantern.2 Puff-body saves to the new
body/cap without resetting pulse phase, health, position or checkpoint progress.
Restore cap overrides and attack pose before the paused Continue/background draw.
Keep the existing night challenge's waves, fixed bank, original graves and
completion/reward routing unchanged apart from its displayed names and pictures.

The corrected coherent build passes with 773 unchanged source inputs; seven
native suites pass 1,419 checks, fourteen browser suites include eleven worker
scenarios, and engine packaging/both patch reconstructions pass. The initial
native review rejected hidden eyes. Corrected cap content is 103×46 at the top
of the unchanged 103×54 canvas, with transparent lower clearance. Final native
review confirms clear half-lidded eyes, a joined cap/body, no muzzle, visible
wind-up/radial release/recovery, readable earned/unearned cards and native hover
without added tips. An old checkpoint retains 50 sun and three plants through
migration. A fresh healthy current-body board also restores the same 50 sun and
Sun-shroom/Chill-shroom/Puff-shroom through full reload and native Continue, with
clear eyes and cap intact. Local criteria pass; website-source packaging and
publication are independent remaining release checks. Earlier snapshots remain
historical. Test
with sound off and publish to the existing GitHub repository and Pages site.
Source packaging must retain complete current source, required parent/upstream,
assets, tests, dependencies and licenses. Use the GitHub 100 MiB per-file ceiling;
the older provider's 25 MiB restriction must not cause required inputs to be lost.

## Historical Lantern.2 art revision — visual result rejected, 2026-10-31

The user rejected Lantern.1's art style and feel, requested removal of the added
Bonus tips and required distinct challenge pictures instead of Survival images.
That revision used **0.2.6-web-lantern.2**. The [art revision criteria](ART-REVISION-GOAL.md)
record the requested work. A new goal-tool objective was rejected because the
older parity goal is paused; do not falsely mark that older goal complete.

Use the actual original Puff-shroom body, face, eyes, blink, idle, sleep, shadow
and geometry. Change only the cap texture, based on the original cap reference,
with the original 81×53 native canvas and exact alpha contour. Keep the edited
cap restrained and the pulse as a short native track-color lift. Remove the
mismatched full-body bitmap, scaling motion and large ring. Preserve intended
Lantern-shroom slowing, costs, recharge and all prior gameplay. Full edit prompt
and reference identity belong in [cap provenance](https://github.com/Caleb-Guyer/plants-vs-zombies-web/blob/136d440a4daa0ac4f876a7200eb13d4382405845/dist/content/lantern-shroom-cap-art.json).

Give Cone Zone, Night Shift and Lantern Glow distinct pictures composed from
original resources in their native 80×65 windows. Remove every added Bonus card
tip beneath or on hover. Preserve the original card titles, menus, unlock tips,
seed packets and minimal utility rail. Do not add instruction panels or HUD.

Keep every mode/seed/page ID and challenge definition, all saved object fields,
original campaign, trophy routing, worker and schema 2. Legacy Lantern.1 saves
must recreate missing native plant bodies and rebind custom cap overrides before
the paused Continue/background draw without resetting health, position or pulse
phase. Inspect the new plant beside original mushrooms at actual game size,
correct observed discrepancies, run focused automated/save checks with sound off
and publish the corrected source and binary to the existing GitHub Pages site.
Earlier Lantern.1 art-match claims are historical and rejected, not acceptance
criteria. The user later rejected Lantern.2's plant identity, attack and card
pictures too. The observations below retain only their bounded functional scope.
Automated tests cannot prove subjective visual perfection.

The final coordinate-corrected build and 1,333 native/fourteen browser checks pass.
The muted native-size comparison confirmed the new body/cap beside original
mushrooms, three corrected distinct card pictures and no added hover tips.
Legacy reconstruction and a fresh current-body save both passed native Continue
after reload; the fresh board retained 50 sun and all three planted mushrooms.
These bounded observations are recorded in QA. Website-source and publication
verification remain separate release records, not borrowed parity evidence.

Publish [Lantern.2 source](dist/source/pvz-portable-0.2.6-web-lantern.2-source.zip),
[full patch](dist/source/web-lantern.2.patch), [increment](dist/source/lantern1-to-lantern2.patch),
retained [Lantern.1 source](dist/source/pvz-portable-0.2.6-web-lantern.1-source.zip),
cap metadata and current website source together. The website-source ZIP retains
current full source, parent, upstream baseline, tests and only the current full
patch. Incremental/historical patches and old archives remain separate downloads
and in the full runtime archive to avoid repeated PNG-bearing patch payloads.

## Historical Lantern.1 authorization — visual direction superseded, 2026-10-31

The user approved the proposed first new plant, **Lantern-shroom**, introduced
through its own **Lantern Glow** Bonus challenge. Continue the established
original-style presentation, muted automated testing and GitHub Pages release
workflow. That release used **0.2.6-web-lantern.1**. Keep the normal campaign,
chooser, unlocks, native menus and five discreet utility icons familiar; introduce
the new plant through the third standard Bonus card, with brief native hover text
and no extra HUD or instruction panel.

Lantern-shroom costs 75 sun, recharges in 750 native ticks and pulses every 400
active gameplay ticks, briefly slowing eligible living grounded enemy zombies
within 150 pixels for 150 ticks through native chill. It is nocturnal, deals no
damage, respects immune/friendly/dead/airborne states, and does not shorten
existing stronger chill or freeze. Pause, sleep, squish, death and grabbing stop
its pulse. Use existing Plant countdown fields so phase survives saves without
changing serialized layouts. Append seed 75 after the original special IDs;
retain NUM_SEED_TYPES 53, original chooser 49 and all existing plant definitions.
Use the generated transparent blue-green/amber artwork, original seed packets,
a quiet breathing motion and short expanding pulse. The full generation prompt
and exact PNG identity belong in [art provenance](https://github.com/Caleb-Guyer/plants-vs-zombies-web/blob/136d440a4daa0ac4f876a7200eb13d4382405845/dist/content/lantern-shroom-art.json).

Lantern Glow appends mode 75, an independent checkpoint and reserved completion
record 74. Use the native night lawn, 150 starting sun, no falling sky sun,
twenty waves/two flags, native graves and six fixed packets: Sun-shroom,
Puff-shroom, Fume-shroom, Lantern-shroom, Grave Buster and Doom-shroom. Preserve
all 74 prior challenge definitions/IDs, Night Shift, Cone Zone, original trophy
and campaign routing, saved layouts, background save worker and schema 2.

Use seven native suites, the fourteen browser suites and a bounded muted feature
check, then publish matching [Lantern.1 source](dist/source/pvz-portable-0.2.6-web-lantern.1-source.zip),
[full patch](dist/source/web-lantern.1.patch), [Night.1 increment](dist/source/night1-to-lantern1.patch),
retained [Night.1 source](dist/source/pvz-portable-0.2.6-web-night.1-source.zip),
website source, art provenance and release identities together. Record observed
results without borrowing prior-release evidence or resuming broad parity testing.

## Historical authorized Night Shift release, 2026-10-31

The user explicitly approved adding **Night Shift**, keeping the original game's look and feel, testing with sound off, and publishing to the existing GitHub Pages site. That release used **0.2.6-web-night.1**. Put the second card beside Cone Zone under **Mini-Games → Bonus** using native night artwork, fonts, the standard card layout and two-flag banner. Keep instructions to the brief native hover label; add no information panels or overlays.

Use the original nighttime lawn with 150 starting sun, no falling sky sun and twenty authored waves. The fixed bank is Sun-shroom, Puff-shroom, Fume-shroom, Grave Buster, Ice-shroom and Doom-shroom. Preserve their normal costs, recharge and behavior. Introduce newspapers, screen doors and buckets gradually after a gentle opening; retain native graves and final-wave grave zombies. There are no new plant or zombie mechanics or new artwork.

Append mode 74 with its own native checkpoint and reserved completion record 73. Preserve the prior 73 challenge definitions and mode IDs, Cone Zone gameplay/checkpoint/record, original campaign progress, unlocks, trophy totals, gold-sunflower awards and serialized object layouts. Retain the Polish.1 worker, five-second automatic persistence, schema 2, save recovery, save-only transfers and concise QoL controls. Add distinct Night Shift and Cone Zone checkpoints to save-transfer regression coverage.

Use six focused native suites, the fourteen browser integration suites and a bounded muted feature check. Build, test and hosted Night.1 results must be recorded after observation; do not borrow historical parent results or resume broad original-game parity playtesting. Normal-player audio remains available. Publish matching [Night.1 source](dist/source/pvz-portable-0.2.6-web-night.1-source.zip), [full upstream patch](dist/source/web-night.1.patch), [Polish.1 increment](dist/source/polish1-to-night1.patch), retained [Polish.1 parent source](dist/source/pvz-portable-0.2.6-web-polish.1-source.zip), website source and release provenance together.

## Historical Polish.1 release, 2026-10-31

Polish.1 uses **0.2.6-web-polish.1**, retaining Content.1 gameplay and all previously authorized QoL behavior. That release polishes the existing interface and save processing; it introduces no new game features. Retain the native **Options → More Options**, **Controls** and **Backups** labels, concise text, original seed-packet artwork for deck previews, the standard grid/card layout on the Bonus page, the native flag banner in the challenge, and date-labeled stone backup rows. Keep the five discreet browser utility icons.

Move heavy CRC/checksum, backup-history and IndexedDB transaction work off the main thread into the dedicated save worker. Preserve the existing five-second autosave interval, schema 2 storage, eight-version history limit, native save bytes/layouts, stale-tab protection, corruption recovery, atomic durable callbacks and recovery/transfer behavior. Keep per-profile QoL/deck files exportable and history browser-local. A worker startup failure may use the safe direct fallback before any operation; an uncertain failure after startup must fail closed rather than retry a potentially committed write through another backend.

Focused validation passes eleven worker scenarios, fourteen browser integration suites and 678 native checks (66 speed, 90 controls, 105 decks/cooldowns, 139 bonus waves, 278 completion/rewards/navigation). A muted final-build preview loaded the worker and existing schema 2 synthetic QA-Boss profile, confirming the centered More Options form, Controls screen and standard top-left Bonus card without a rules paragraph. Final website-source package and hosted release checks remain separate observations; do not turn Node fixture timing into a browser FPS or stutter-free claim. Do not resume broad original-game playtesting.

Publish matching [Polish.1 source](dist/source/pvz-portable-0.2.6-web-polish.1-source.zip), [full upstream patch](dist/source/web-polish.1.patch), [Content.1 increment](dist/source/content1-to-polish1.patch), website worker/core source and provenance together. Retain the [Content.1 parent source](dist/source/pvz-portable-0.2.6-web-content.1-source.zip), historical records and baseline source. Release identities are pinned in `dist/game/engine-provenance.json` and `dist/source/build-provenance.json`.

## Authorized optional content, 2026-10-31

The user approved a first small expansion using existing plants, zombies and
artwork, with new content optional and the original game available. Content.1
adds Cone Zone at Mini-Games → Bonus: daylight, 150 starting sun, six fixed classic
plants, normal sun production, twenty authored waves and two flags. Use stable
appended mode 73/page 4, a separate checkpoint and reserved completion record 72.
Preserve all original mode IDs, 72 challenge definitions, campaign progress,
original trophy totals, unlock flags, gold-sunflower awards and native saved
object layouts. Keep native artwork, typography and discreet shell controls.
Use silent focused automated tests and a bounded feature UI/save-resume check;
do not resume broad original-game parity playtesting. Publish to the existing
GitHub repository and Pages through the established release workflow.

## Requested QoL updates, 2026-10-31

The user requested a 1x/2x speed button near Menu that matches the game's visual style. QoL.1 added a native stone button directly below Menu, leaving room for the full seed tray and shovel. The user then authorized all six proposed QoL additions, automated tests with sound off and a GitHub Pages update. These intentional options extend the earlier strict 1:1 requirement. Pause, dialogs, chooser and transitions do not accelerate; audio pitch and existing native save formats remain unchanged. Do not resume broad campaign playtesting.

The published QoL.2 parent uses `0.2.6-web-qol.2`, retaining the Software.10 rendering code. Current source and binary hashes are in `dist/game/engine-provenance.json`; prior release records below retain their historical scope. The six additions are:

- Auto-pause on window blur or a hidden tab, enabled by default, with explicit resume and no automatic resume.
- Remappable seed-slot, shovel and speed keys: defaults `1`–`9`, `0`, `S` and `F`. Space and Escape retain their original pause/menu behavior; native costs, cooldowns and unlocks still apply.
- Eight named plant-deck presets per profile, respecting capacity, unlocked plants, Imitater and forced picks.
- Per-profile remembered 1x/2x speed, enabled by default. A new profile starts at 1x; disabling Remember Speed resets new/resumed boards to 1x.
- Optional numeric seed cooldowns, disabled by default.
- Browser-local automatic save history with up to eight previous versions. Recovery applies to all profiles and backs up the current version before replacement.

Keep the options, keyboard and deck dialogs in the game's original visual style. Store QoL settings and decks per profile in separate save files and include them in save export/import. Save history remains local to this browser and is not part of the export. Normal saves persist automatically without export/import. Focused automated tests and a bounded silent visual check are sufficient for this update; neither adds a full-parity claim.

## Objective and completion status

The user wants original **Plants vs. Zombies GOTY**, with complete content, original graphics and 1:1 game behavior, on the public site at https://lawn-defense-caleb-plays.usgi.chatgpt.site.

Full 1:1 parity remains unverified; further manual validation stopped at the user's request on 2026-10-31. The current objective is to ship the reviewed build, not to resume broader manual gameplay. Do not mark it complete or describe the game as verified 1:1 until the necessary comparisons are finished. Existing smoke tests and upstream source coverage are useful evidence, but they do not prove every mode, level, animation, timing detail or edge case. Broader runtime comparisons would be required to substantiate verified 1:1 parity; they are not a prerequisite for this authorized current-build release. Upstream issue #473 reports an x87/pixel-rounding difference, but its closure does not establish a fix or a reproduction in this WASM build; current rendering parity remains unverified.

The coverage ledger tracks 228 required entries; source presence, untested behavior and confirmed defects must remain distinct. Retain the original scope: 49 standard plants including Imitater; 26 standard zombie Almanac entries including Dr. Zomboss; seven additional implemented zombie variant types (33 active types total); four special plant forms outside the ordinary chooser; 50 Adventure levels; 20 standard minigames; Vasebreaker and I, Zombie puzzles with endless variants; Survival; Zen Garden; Tree of Wisdom; Almanac; shop; achievements; player profiles; Zombatar; and original boss content. Dr. Zomboss is included in the 26, not an extra 27th standard zombie. These are counting categories, not a reduction in scope or proof of behavior coverage. Do not substitute the smaller procedural demo for the original-game engine.

## Presentation

The public page should be just the game with small, discreet utility icons for fullscreen, import, export, mute and more. Fit the native 800×600 canvas at 4:3 without stretching. Preserve the original game menus and artwork.

Always start from bundled original game resources automatically, including a fresh browser with no cached files. The user explicitly approved "Bundle the original assets publicly" on 2026-10-27; this supersedes the older no-proprietary-assets/public resource-picker constraint. Import/export is for SAVE DATA ONLY. Keep attribution, licenses, source links, additional save tools and optional QA profiles inside the more menu. A loading failure may offer Retry; it must not require a local game file.

## Audio

**Normal players must have working music and sound effects.** Audio starts enabled by default, subject to the browser's user-gesture/autoplay rules and the player's saved mute preference. Provide a switchable master mute and remember it in local storage. Preserve the original in-game volume controls.

**Agent tests must be muted.** Use `?testing=1` to force inaudible output for test sessions. Test muting must not turn into a permanent user-facing lock or overwrite the normal player's mute preference. Keep audio timing running during muted tests.

Use `dist/audio-controls.js` for browser mute behavior. The old `audio-lock.js`, PCM-zero callback modification and permanent-zero registry policy are obsolete. Do not reapply them because an older goal-tool objective or historical QA file mentions permanent silence.

Migrate only recognized audio values imposed by the legacy silent build so returning players regain usable audio. Preserve player selection, progress and unrelated registry/preferences. Do not reset whole registries or save stores to restore sound.

## Engine, resources and storage

Public version 5 used the locally built **0.2.6-web-zombatar.1**, based on the exact official **PvZ-Portable 0.2.6** tag/commit with scoped changes to `src/Lawn/Widget/ZombatarWidget.cpp` and its `.h`. It added browser JPEG export after the second confirmed Finished while preserving native profile saving and avatar composition. Keep browser controls/audio in the shell. Publish the matching custom source ZIP, patch and engine/build provenance; retain the original tag source. Do not call a custom build unmodified or byte-identical to the official release.

Public v6 introduced **0.2.6-web-parity.2**, adding scoped web fullscreen synchronization in `src/LawnApp.cpp` and `src/SexyAppFramework/platform/emscripten/Window.cpp`. Its source `90290eeb9c2a1b1551583a7e0b2af2003044f721` deployed as `appgdep_6ae0a1516f108191930e6c353fbe676a`; scoped fullscreen/garden checks passed. Public version **7** retained that engine and deployed the browser utility-keyboard correction from source `171e38f7a75927ba1114bde048ab4b4ff2ecf29f`, deployment `appgdep_6ae0ada1f9cc81918299c5392abcd157`. Anonymous artifacts and scoped public keyboard/fullscreen checks passed. Earlier local parity.2 checks also cover staged native Options choices, 4:3 fitting and pre-initialization entry. Real browser Escape exit and browser-level request rejection remain unverified. Public v6/v7 WASM SHA-256 is `75e997b1ae4c35f3731682bd4a11f06ee4c72b5879efc573a1b0719e94bae293`; corresponding source ZIP SHA-256 is `42d91e6841a48214888d6b50e95e4249b050f6ccd7b520512693d079af53f580`. Preserve the existing Zombatar compositor/profile behavior and keep historical observations tied to their actual builds.

Public version **8** ran **0.2.6-web-parity.3** from source `46eee27f19484936d27dff7083b7b76e8eba0b8a`, deployment `appgdep_6ae1111abdc48191b6b9839bb944e692`, status succeeded. It adds two statically grounded corrections: Zombatar's original custom parameter-40 quantization tables/optimized Huffman coding, and scaling the returned piñata particle instead of the head particle. Seven source paths change in total: the four prior paths, `src/Lawn/Zombie.cpp`, and `src/SexyAppFramework/imagelib/ImageLib.cpp`/`.h`. The full build, four compiled C++ test groups, JS/WASM validation and integration verifier passed, including exact source scope, unchanged compositor/download bridge and shell/audio/save/keyboard checks. Actual local revised-export, identical retry and native Quit/fresh-reload persistence checks passed. Public v8 checks matched seven anonymous artifacts exactly and observed the new Information label/cache key and QA-Night Level 2-2 menu without JavaScript errors. Original Cob Cannon velocity zeroing matched the existing port and stays unchanged.

Public v8/parity.3 JS SHA-256 is `191855138ecd39b8516b2b891d7506c86d3b3f431eaf1f08153eef8d2086a672`; WASM is `ab6441474e4438292ee594a5028f33439ba269d6ea30dad04757b49b64fb74ec`. Corresponding source `dist/source/pvz-portable-0.2.6-web-parity.3-source.zip` has SHA-256 `d12c29eec4885dfd9419cba57b17980a6506812aa634dd9de85cf63eed260230`; patch `dist/source/web-parity.3.patch` has SHA-256 `cdf5d805c93dc7b0faa5044950a2b110e83d4ce4718994ea9e7a88c792df980c`. Prior source/patch versions remain retained.

Public version **9**, engine **0.2.6-web-parity.4**, changes only Zombatar export-buffer initialization relative to parity.3: zero ARGB with alpha/transparency enabled, matching the statically traced original setup and normal blitter. All four compositor/`SaveDraft` functions stay byte-identical. Private compiled checks, all 15 integration checks and actual local export/retry/Quit/reload/backup checks passed. Public v9 deployed successfully from `037128de3309cc94d5eb9d2f15eb77745fb1929d`; anonymous artifact and scoped public reload checks passed. Its JS SHA-256 remains `191855138ecd39b8516b2b891d7506c86d3b3f431eaf1f08153eef8d2086a672`; WASM is `a4b7b7e8cc6d000a4b553499b628b286f54b4e4fedac35ed0abe87044c76decf`; source `dist/source/pvz-portable-0.2.6-web-parity.4-source.zip` is `574e760c35cd4409da74a30c8d8d196bddf05e78efc5453e99eb782ff7c6a208`; patch `dist/source/web-parity.4.patch` is `1a74bf280a16c1d12a30931b14ecccbf97135b73840008a03e739bb656a130ab`. Keep these v9 results distinct from historical v8 checks and the pending file-free startup update.

The first custom candidate passed a real browser export check: upright 180×180 selected portrait, cancel without a new record, confirmed gallery growth from 1/1 to 2/2, and byte-identical retry with the gallery unchanged. The public v5 caption-only rebuild passed native Quit/reload, a third portrait/JPEG, exact JPEG-byte backup export and a saved boss-board continuation. Public v5 also passed narrow registry/QA-profile/two-JPEG import/export and fresh-reload record/JPEG persistence. These historical browser checks used the prior quality-80 encoder; they do not certify later exports. Static original Steam GOTY 1.2.0.1096 inspection establishes custom parameter-40 tables (not ordinary IJG quality 40), optimized Huffman coding after defaults, 4:2:0 sampling and 180×180 geometry. The separate Zombatar writer emits those tables/settings in actual compiled codec tests, while generic JPEG bytes remain identical for two synthetic fixtures. Later original blitter tracing proves that zero-ARGB/alpha-aware initialization changes RGB values retained by JPEG; parity.4 restores that setup without changing composition functions. The former uncertainty about this specific initialization effect is resolved by static/actual-code evidence, while authentic original composed JPEG pixels remain unavailable. Retrying download must not add a duplicate profile portrait. Do not introduce speculative gameplay or rounding changes.

Actual local parity.3 UI created a fourth QA-Roof portrait and downloaded a 6,318-byte, upright 180×180 plain zombie/tree-fence JPEG with all 128 expected quantizer values and 4:2:0 sampling. Retry was identical. Original Quit/fresh reload restored gallery 1/4 and navigation reached 4/4 with the correct new preview. Actual backup (12) passed CRC, held four portrait records and preserved the new JPEG exactly. This establishes the named browser path; original-runtime pixel/byte/matte equivalence remains unverified.

Actual local parity.4 UI created the fifth QA-Roof portrait using skin 0/no optional parts/first Crazy Dave tree-fence backdrop. Its 6,302-byte 180×180 JPEG matches all 128 expected quantizer values and 4:2:0 sampling; retry is byte-identical and adds no record. Original Quit/fresh reload restored 1/5; four ordinary Next actions reached 5/5 with the correct new preview. Actual backup (14) passes CRC, holds exactly five records and one new `Zombatar_4.jpg` with SHA-256 `7f29c207b5deb2e1d85f3e7e3d3edcc61fb094bef29823b9c1b390692d102059`, and retains all three prior JPEGs byte-identically to backup (12). This is a scoped local candidate export/persistence pass; publication and authentic original composed-pixel/byte comparison remain separate.

The user approved the original in-game Zombatar license at action time in this session, and the normal UI acceptance was performed. Preserve that recorded authorization and existing profile acceptance; do not patch the license text or silently preaccept another agreement.

The older local-resource-only policy is superseded by the user's explicit public-bundle approval. Serve the six approved original runtime data files through the verified bundle. Original Windows executables/DLLs, native or personal saves and private QA archives remain excluded. Keep runtime libraries, source and license downloads local to the site.

Keep resource caching separate from browser saves. Preserve the user's installed game and native saves. Resource forgetting must not erase progress. Save import/export and optional QA-profile merging must preserve existing user data; clearly destructive browser-save clearing requires confirmation.

## Verification and records

The current release has the recorded automated checks and bounded hosted startup proof. Further manual validation stopped at the user's request on 2026-10-31; do not resume broader gameplay from historical plans or remaining-work lists. Preserve normal-player audio and silent agent-testing behavior. Keep results tied to what was actually observed; a working title or content inventory does not verify a full play-through or 1:1 parity.

Public v5 normal-UI checks observed one Marigold purchase, first garden growth and one Tree of Wisdom feeding. Original Quit/fresh reload restored the visible small Marigold and four fertilizer charges; a new export retained the same 88-byte plant record, tree height 2 and four Tree Food charges. This is a scoped persistence pass; reopening the Tree screen after that reload was not claimed. **Evidence correction:** the stylized currency sign was initially read as a leading 5. Actual save bytes establish **$99,990 → $97,490 → $97,520**, correcting earlier $599,990/$597,490/$597,520 visual notes. This is an observation correction, not a game defect or a changed fixture balance; keep this distinction in later reports.

Public v6 completed repeat Adventure 2-1: twenty waves/two flags, the clicked moneybag reward, next chooser and Main Menu Level 2-2 were observed using normal UI. Original Quit/confirmation and fresh reload restored `QA - Night` at Level 2-2. The synthetic profile already had `finishedAdventure = 2`; this earned level win does not establish a first campaign or normal unlocks. Actual backup (10) contains level 12 and 10,042 internal coins, compared with level 11/9,999 coins in earlier backups. The net $430 includes level collections; it is not the value of the five-gold moneybag alone. Keep the observed mushroom, Newspaper, grave-removal and other mechanic samples scoped as recorded in `PARITY-QA.md`.

Public v6 reproduced utility-control key events reaching the game. Public v7 verifies the correction on the title and active Another Chain Reaction board: focused utility Space/Enter toggles fullscreen without native pause; canvas Space retains original pause; More opens with Space and closes with Escape without native pause/options. The engine remains `0.2.6-web-parity.2`; a regression against the actual launcher fails old routing and passes the correction. This is keyboard/continuation evidence, not an Another Chain Reaction win. Preserve ordinary game input while isolating focused browser controls.

Actual first I, Zombie attempts on v7 ended in observed losses at 2/5 and 3/5 brains, each with 25 sun, no zombies or collectible sun and the native loss dialog. No puzzle win is credited. Actual UI backup (11) passes CRC and retains QA-Night level 12/challenge record 60 = 1 as the before-win baseline. Preserve normal sun expiry and native pause; missed collections during tool/model delays are not evidence of a timing defect.

Public v8 completed the first Vasebreaker puzzle as a normal-UI repeat run: all 25 vases were opened, Peashooter/Snow Pea/Squash were used against normal/Buckethead/Jack-in-the-Box zombies, all enemies cleared, the moneybag was clicked and the puzzle catalog returned. Its 18/18 trophies were already prefilled; credit this one observed finite win without claiming a new trophy or ordinary unlock. Actual backup (13) passes CRC; compared with (10)/(11), QA-Night remains level 12, first Vasebreaker challenge record 50 at offset 216 increases 1 → 2, and internal coins rise 10,042 → 10,052 (net $100). Other challenge records, including I, Zombie record 60 = 1, remain unchanged. Do not equate the net currency change with the moneybag alone. A fresh public v9 reload restored the complete 886-byte QA-Night profile byte-identically to backup (13), including this record and currency; this is scoped persistence of the observed first-Vasebreaker win.

The original native launch reached a Steam startup error without a game/JPEG capture. Root reported the native save/settings baseline comparison true, no GOTY process remaining and all five audio-output mute states restored (zero muted). Private Steam-window inspection was blocked by automatic approval review; additional authorization remains pending. Static disassembly evidence must not be presented as an authentic original runtime capture.

`PARITY-QA.md` contains historical checks, including checks of the superseded permanent-silence build. Preserve the history and distinguish later results by build/date. Do not reinterpret those older silence checks as evidence that normal-user audio works, or as authorization to mute the public site permanently.


## Automatic startup and current source

The user explicitly requested immediate play without choosing game files, save-only import/export and public bundling of original assets. The six approved runtime files total 45,462,524 bytes in eleven parts, under manifest ID `sha256:b468b22439430ca4a36035b886a74bd831a86b2a1a36c39d3203396f5b75d093`. Preserve exact validated bundle bytes, separate save stores, automatic first visit/cache/retry and existing progress. No executable, native library, real save or private QA export belongs in distribution inputs.

The current source target is **0.2.6-web-chill.4**; completed engine/source/patch identities belong in `dist/game/engine-provenance.json`. It retains the fileless shell, five icons, normal player audio, native profiles, save-only transfers, public storage keys and keyboard behavior. The frozen public v18 baseline uses Software.10 (source `877bbbf3f001fc2f9202700ba790e27665179e92`); Software.10's own scoped private first-level and save-transfer observations below remain historical. Earlier observations retain their actual build and private/public scope.

Public v15 preserved the three approved XML resource files' original CRLF bytes in Git and added the matching attributes rule, closing the fresh-checkout checksum blocker without changing the Software.7 runtime. GitHub Pages publication succeeded on 2026-10-31 through [release workflow 41230962473](https://github.com/Caleb-Guyer/plants-vs-zombies-web/actions/runs/41230962473). The bounded hosted startup check does not establish full game parity. The user authorized publication of the current build on 2026-10-31 while full 1:1 parity remains unverified; publication does not mark that goal complete.

## Historical Software.10 build scope and remaining work

Software.10 changes exactly three source paths relative to Software.9: the version file, callback admission and the narrow native-screen pixel include; all other 754 of 757 engine files are byte-identical. Its isolated full Release compile/link passed with exit 0 in 135.885 seconds. The paired actual-code suite runs 2,372,278 assertions per variant: frozen Software.9 has 47,270 and 50,870 expected additive differences in the two families, while Software.10 has zero failures. The 90 unchanged expanded callback bodies include both normal dispatchers and remain byte-identical to Software.9.

The two corrections apply only to guarded dedicated CPU-screen RGB888 nearest-additive routes: texture-alpha with constant original vertex color plus global color, and opaque texture with global color. The combined route preserves the original global/256 vertex prepass and second per-pixel global multiplication; the opaque route ignores stored texture alpha before global modulation. Existing exact target-buffer/pitch, dimensions, UV, valid-channel and offscreen fallbacks remain. Geometry, clipping, scan conversion, interpolation, game rules and audio are unchanged. No ordinary scene using either new additive route has been established; conditional API tests do not prove original framebuffer or full renderer parity.

Historical Software.10 corresponding source is `dist/source/pvz-portable-0.2.6-web-software.10-source.zip` (807 archive entries, 757 engine files); `web-software.10.patch` is the complete raw-upstream patch. `software9-to-software10.patch` is the separately labeled three-path increment from Software.9. The full source builds without applying a patch. Historical packages, upstream baseline, build provenance and licenses remain available. Approved asset payloads remain separate from code/source archives and are included only in the full-runtime distribution.

Software.10's own muted private browser check used a fresh Web10QA profile without generated QA fixtures. Native CPU mode was selected before Adventure and remained unchecked on Options reopen during 1-1. The first attempt completed 1-1 without Restart or Game Over: Peashooter placement, sun collection and projectiles were observed, the Sunflower reward was collected, and Next Level entered 1-2. One Sunflower was planted in the leftmost middle cell, with zero sun remaining.

During 1-2, CPU/hardware/CPU requests were applied and each setting was checked through a separately reopened native menu, retaining the visible board. Original Main Menu/Leave and Quit/confirmation reached a fresh title before export. Import into a separate fresh browser origin showed Save imported; exporting again before Start preserved all four payloads and 44,120 expanded bytes exactly, including the 42,863-byte Adventure checkpoint with internal CRC32 `ec6bbc32`. The fresh profile records level 2 and finishedAdventure 0; this is first-level progress, not a completed campaign. After Start, the imported Web10QA 1-2 menu and actual Continue prompt were observed; Continue restored the visible one-Sunflower/zero-sun board, and its native menu showed CPU unchecked.

These are private Software.10 first-level and scoped save-transfer/visible-Continue results. No 1-2 win, complete actor enumeration, ordinary invocation of either new additive route, hardware combat, authentic-original/public-runtime comparison or dense-scene performance result is credited. The five-to-thirteen-minute chooser/download tool waits are not game-performance measurements. Earlier Software.9/8/7 gameplay, wins and persistence remain historical and do not transfer to Software.10. All 228 coverage entries, all 50 Adventure levels and the full original roster, modes and abilities remain required; authentic-original runtime comparisons remain zero and exact 1:1 parity remains incomplete. Normal-player audio and forced-quiet agent testing are unchanged.

## Historical Software.9 source/build and initial private UI evidence

Software.9 changes only the version file and callback admission relative to Software.8; the other 755 of 757 engine files are byte-identical. Its isolated Release compile/link passed with exit 0 in 136.647 seconds. The paired actual-code suite runs 92,637 assertions per variant: frozen Software.8 has 24,880 expected differences, and Software.9 has zero failures. All 91 other expanded callback bodies, including the matching normal callback, remain byte-identical to Software.8.

The correction admits only the dedicated CPU-screen RGB888, texture-alpha, vertex-only nearest ADDITIVE specialization with equal input vertex colors. It reuses the unchanged pixel/sampler math and existing exact-buffer/pitch, complete-dimension, UV and current-channel guards; clipping, geometry, interpolation and context ownership remain unchanged. Nonconstant input colors and other unsupported inputs retain the Software.8 path. An ordinary additive scene has not been established; the CPU Pause/Newspaper source route uses the already-matching normal callback.

Software.9's own muted private browser check reached the automatic ready title and Information/version/source links, retained the five icons, and installed six generated profiles through ordinary More/Advanced controls. With QA-Boss selected, native 3D Acceleration was changed from checked to unchecked and remained unchecked on Options reopen. The first Vasebreaker puzzle showed 25 unopened vases and the fixture's 99,990 coins. Canvas Space opened GAME PAUSED with the Newspaper animation visible at two times; Resume Game returned to the same 25-vase board. Original Main Menu/Leave and Quit/confirmation returned to a fresh ready title; Start/Options still showed CPU unchecked. This verifies scoped normal pause/resume and CPU-setting persistence, not puzzle checkpoint restoration or earned progress.

The error-level query and `Failed to find track` filter (30 entries each) were empty; this does not certify the entire log. Final normal Quit reached a ready title before the private tab was closed and its owned loopback server stopped.

At that initial Software.9 UI checkpoint, no vases were opened and no combat, finite win, earned unlock, corrected-additive invocation, hardware/fullscreen roundtrip, save-export byte comparison, performance result or authentic-original/public-runtime comparison is credited. The pause animation is a normal-path preservation sample, not a traced additive scene or native-frame comparison. All 228 coverage entries, 50 Adventure levels and every original plant, zombie, mode and ability remain required; authentic-original runtime comparisons remain zero and the full 1:1 goal remains active.

Historical Software.9 corresponding source is `dist/source/pvz-portable-0.2.6-web-software.9-source.zip` (806 archive entries, 757 engine files); `web-software.9.patch` is the complete raw-upstream patch. `software8-to-software9.patch` is the separately labeled two-path increment from Software.8. The full source builds without applying a patch. Historical packages, upstream baseline, build provenance and licenses remain available. Approved asset payloads remain separate from code/source archives and are included only in the full-runtime distribution.

## Historical Software.8 build and private browser evidence

Historical Software.8 changes four source paths relative to Software.7; all other 753 of 757 files remain byte-identical. Its isolated Release compile/link passed with exit 0 in 127.734 seconds. The paired actual-code AA suite runs 10,866 assertions per variant: Software.8 has zero failures; frozen Software.7 has 1,168 expected failures, including 888 differing pixels. These are focused source/build checks, not new gameplay or original-runtime comparisons.

The Vasebreaker Hammer now requests the original track name `anim_open_pot`. The bundled asset already selected that track through index-0 fallback, so the established correction removes an invalid lookup/log message without claiming changed frames or timing. A separate CPU-screen override matches the original nonaxis additive-AA no-op and auxiliary-cache cleanup only for the reviewed forced-opaque, nonvolatile raw screen state. It retains the authoritative framebuffer and dirty/drawn state; other states and normal/axis drawing retain Software.7 behavior. No ordinary game caller of that AA API has been established. Software.8's own scoped private browser observations follow; original-runtime comparisons remain incomplete.

Software.8's own muted private browser check observed automatic file-free startup, Information/version and matching source links, and six generated profiles installed through More. The native 3D Acceleration checkbox remained unchecked (CPU mode) on Options reopen and after normal Quit/reload. In the first Vasebreaker puzzle, two green vases released Snow Pea packets; they were planted at c0/r1 and c0/r2, leaving 23 vases. Original Menu/Main Menu/Leave, Quit, a fresh ready title and Puzzle/Continue visibly restored those 23 vases, two Snow Peas and the fixture's 99,990 coins. This is a scoped visible checkpoint pass, not an exported-byte comparison or earned progress.

The retrieved `anim_pot_open` and missing-track filters (50 entries each), and the error-level query (30 entries), were empty; this does not certify the entire log. No mid-swing Hammer frame was captured: the Hammer-named image shows debris and a seed packet. No Software.8 finite win, released-zombie combat, exact animation timing, native pixel equality, direct corrected-AA invocation, hardware/fullscreen roundtrip or performance result is credited. These are private Software.8 observations, not public or original-runtime validation.

All 50 Adventure levels, all named modes and every plant/zombie ability remain required. Software.8's two-vase checkpoint observations do not establish a finite win or supply Software.9 gameplay credit. Authentic-original C comparisons remain zero. The current-build GitHub/Pages release is authorized separately by the latest user instruction; these narrow fixes do not mark the full parity goal complete.

## Historical Software.7 evidence

Software.7 keeps the dedicated ordinary RGB888 CPU screen and earlier bitmap, stretch, mirror and fill corrections. It corrects two addressed reanimation callback differences: additive passes now use saturated addition, and bilinear sampling repeats whole-texture edge neighbors with the original fixed-point floors. The correction is enabled only inside the actual screen matrix/triangle virtual calls, with the same target buffer and pitch. Five alpha-textured white/global/constant-vertex combinations are covered; other callbacks and offscreen MemoryImages retain Software.6 behavior. The triangle clipping, scan conversion and interpolants stay unchanged. Other formats, driver/volatile/cache/device paths, unclosed modulation combinations, transformed geometry, original framebuffer equality and dense-scene performance remain incomplete. CPU composition still presents through WebGL.

Historical Software.7 source checks passed the isolated full Release compile/link and JS/WASM/version checks. The paired actual-code callback regression compares 36,175,872 broad buffer assertions and 222,720 assertions from 13,920 independently authored mixed-alpha/texture-dimension fixtures per variant. Frozen Software.6 has 13,512,240 broad and 47,990 fixture differences as expected; Software.7 has zero. The independent scalar header agrees with all 13,920 authored expected cases. Both variants produce identical offscreen hashes. A separate extracted production context/virtual-method suite passes 169 checks per variant, and all 82 unclosed expanded callbacks are identical to Software.6. Retained unscaled/scaled-mirror, fill, DD32, primitive, offscreen-stretch, renderer-mode, presenter and nine portrait tests pass. The complete raw-upstream patch reconstructs all 757 engine files byte for byte. These are bounded source/build/synthetic checks, not an original runtime capture.

Historical Software.8 corresponding source is `dist/source/pvz-portable-0.2.6-web-software.8-source.zip`; `web-software.8.patch` is the complete raw-upstream patch. `software7-to-software8.patch` is the separately labeled increment from Software.7. The full 757-file source builds without applying a patch. Historical packages, upstream baseline, build provenance and licenses remain available. Packaging supplies source and full-runtime archives and checks artifact hashes and hosting file limits. The code archive contains asset metadata/recipe; approved asset payloads remain separate served files and are included in the full-runtime archive.

A muted local Software.7 run observed its automatic original title, Information/version/source links and six generated QA profiles installed through ordinary More controls. Native CPU selection remained unchecked on Options reopen; the fullscreen icon enlarged the layout with the original Full Screen checkbox checked and returned, and a hardware/CPU roundtrip retained the planted board. Original Menu/Main Menu/Leave and Quit/confirmation returned to a fresh file-free title. The selected QA-Night profile and unchecked CPU preference persisted; Adventure/Continue visibly restored the same ten-packet bank, zero sun, Sunflower at c0/r2, Puff-shroom at c1/r2, graves, enemy and mowers. This is Software.7's own bounded ordinary-UI pass, with visible checkpoint restoration rather than exported-byte or exact-actor comparison.

The post-restart error-level console query returned no entries.

Those basic Software.7 checks did not include a finite win, earned unlock, explicit hit/chill comparison, save-export byte comparison, direct corrected-callback trace, authentic original frame/JPEG equality or dense-scene performance. Later private Software.7 gameplay results are recorded separately below and do not transfer to Software.8 or Software.9. Full 1:1 parity remains active and incomplete.

Historical private Software.7 subsequently completed Zombiquarium on its third attempt and all five flags of Survival: Day (Normal), with final reward pickup and return to the settled mode catalog. The generated profiles already had trophies/unlocks, so these wins do not establish newly earned unlocks, other modes or native equivalence. They provide no Software.8 or Software.9 win or gameplay credit; Software.5's To the Left win remains separately historical.

## Historical Software.6 evidence

The original 3D checkbox selects hardware drawing or CPU composition. Software.6 retains a dedicated ordinary nonvolatile RGB888 screen, the Software.5 scaled-mirror and FillRect corrections, and separate literal offscreen MemoryImage arithmetic. Relative to frozen Software.5 only its version and `SoftwareScreenImage.cpp`/`.h` change; all other 752 engine files and all seven previous screen method bodies remain identical.

The new unscaled mirror override commits deferred source changes, preserves the alias-safe reversed temporary, and forces the temporary's general pixel-alpha route. It matches the addressed native mirror equations even when current raw or palette alpha disagrees with source opacity flags. Normal/additive and unsupported-mode gates, white/tint/global-alpha cases, transparent skips, opaque tint special cases and valid integer mirrored clipping have scoped static and actual-code proof. Volatile handling falls back to the previous path; that fallback is not newly certified.

The isolated Release build and 3,039,478 actual-code unscaled-mirror assertions pass (1,505,732 draws and 226 indexed calls). Frozen Software.5 fails 14,336 paired checks; Software.6 fails zero. Retained 98,802 scaled-mirror, 2,118,543 fill and 20,900 DD32 assertions, 149 primitive assertions, 20 offscreen stretch fixtures, mode/presenter and nine portrait fixtures pass. The true raw-upstream patch reconstructs all 755 engine files exactly. That build's corresponding source is `dist/source/pvz-portable-0.2.6-web-software.6-source.zip`; `web-software.6.patch` is the complete upstream patch and `software5-to-software6.patch` is the separately labeled increment from the unpublished Software.5 source. Full current source builds without using that incremental patch.

Historical private Software.5 checks completed the second ordinary To the Left run: all 25 vases and enemies cleared, the reward was clicked, the white fade/Achievements/Continue sequence returned to the settled puzzle catalog. Left-facing Repeater attacks, Snow Pea slowing, Jack explosion chains, Bucket armor loss, Wall-nut chewing and Potato Mine rising were observed. The 18/18 trophies and four achievements were prefilled, so no earned unlock is credited. Native CPU/fullscreen switching retained known placements. Later visible CPU tooltips and normal Main Menu/Leave/Quit/fresh-title/Continue restored CPU preference, Sun-shroom and Puff-shroom placements, 25 sun and the ten-packet bar. These are Software.5 observations only; no save-export byte comparison or original framebuffer equality is claimed. Software.6's separate scoped observations are recorded below; this historical result supplies no Software.6 finite-win or pixel-equivalence credit.

A historical muted local Software.6 run verified its Information/source identity, automatic original title, visible CPU tooltip, fullscreen icon entry/exit and CPU/hardware/CPU changes. Original Main Menu/Leave and Quit/restart preserved the CPU preference; Continue restored the visible Night 2-1 checkpoint with Sun-shroom and Puff-shroom, 25 sun, the same ten packets, four graves and the existing zombie. Resumed zombie movement was observed, and the error-level console query after restart returned no entries. This is a scoped Software.6 pass, not a finite-level win, save-export byte comparison, direct new-mirror invocation, dense-scene FPS or original framebuffer/JPEG equality claim. Full 1:1 parity remains incomplete.

Agent testing remains `?testing=1` quiet; normal-player audio and public preference/save keys remain unchanged. These local observations do not establish deployment or anonymous public-runtime verification.

Static native equations and synthetic actual-code tests do not certify an authentic original framebuffer. DD16/other layouts, driver/D3D shortcuts, volatile/cache/device recovery, fractional/rotated/matrix/triangle/coverage paths, offscreen tint/additive, dense-scene performance and complete gameplay comparisons remain separate. Software.6 left the native nonaxis additive-AA no-op discrepancy unchanged; the strict Software.8 screen override described above addresses its reviewed API/state scope, with no ordinary game caller proved. Keep all levels, modes and every plant/zombie ability in the active exact-game goal.
