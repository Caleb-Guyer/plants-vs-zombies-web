# Plants vs. Zombies — browser playtest

## Mender.2 animation and Almanac presentation

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

## Mender.1 support plant and Almanac entries

`0.2.6-web-mender.1` adds Mender-bloom, a support flower unlocked by a Seed Swap
win. An existing valid win already qualifies; no profile reset or repeat win is
required. It joins the normal seed chooser after unlocking, costs 125 sun, and
recharges in 15 seconds. Every three simulation seconds it restores 10 health
to each eligible damaged plant in the eight adjacent squares, capped at that
plant's maximum health. It does not attack, heal itself or revive dead plants.

Mender-bloom has a distinct matte coral-and-cream flower sprite, gentle idle
motion, blinking and a short healing lift. Native sparkles appear only when a
plant is actually repaired. Both Mender-bloom and the previously missing
Chill-shroom now have native animated Almanac entries with descriptions, cost
and recharge details. Chill-shroom's entry follows its existing Cold Front win
unlock; Mender-bloom's follows Seed Swap. Existing valid wins count for both.
The original Almanac entries and their positions remain intact.

The five Bonus modes, their rules and card illustrations are unchanged. No new
challenge illustration was generated. Original seed IDs, native plant/cache
ranges, save-object layouts and automatic browser saves remain unchanged.
Mender-bloom uses existing serialized counters for its healing cooldown and pose.
The plant artwork used the built-in image generation tool with original flowers
as style references; its prompts, source images, registered layer recipe and
hashes are retained in the corresponding source and
[art provenance](dist/content/mender-bloom/provenance.json).

All 3,769 native checks in ten suites, 14 browser suites and 11 worker scenarios
passed. The full build passed with 795 unchanged source inputs. The corresponding
engine source ZIP contains 836 entries and 11,905,661 bytes, SHA-256
`d91f663297f7787be7063f478027cd4935ff4285c9dbed600c1c71703d1e08a3`;
both binary patches reconstructed every source byte.

Muted local browser checks confirmed both custom Almanac entries fit and open,
display accurate cost/recharge and animated portraits, and allow returning to
Sunflower. Survival seed selection, the 125-sun planting cost and Mender-bloom's
idle animation worked. Native Menu/Leave, a full reload and Continue restored
Sunflower, Wall-nut and Mender-bloom with the saved bank, zombies and suns.
Unlock visibility used a generated QA profile with synthetic wins; this was not
a newly earned minigame clear. Healing amounts are covered by production-method
tests rather than a visual battle claim. Public Pages and hosted source-download
receipts belong to the release workflow. These scoped checks establish neither
subjective art perfection nor exhaustive original-game parity.

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

[Play on GitHub Pages](https://caleb-guyer.github.io/plants-vs-zombies-web/) · [Existing playtest](https://lawn-defense-caleb-plays.usgi.chatgpt.site) · [Deployment](DEPLOYMENT.md) · [Requirements](CURRENT-REQUIREMENTS.md) · [QA history](PARITY-QA.md)

Current release **0.2.6-web-seedswap.1** adds Seed Swap to the four existing native Bonus minigames. Cold Front still unlocks Chill-shroom in the normal chooser. The original campaign, saved layouts and approved artwork remain. Full original-game parity is unverified. Earlier release records below are historical.

The Software.10 and earlier QA descriptions below are the frozen v18 evidence snapshot. They retain their original capture-time scope, including earlier limits; they are not a claim that later validation or the full parity goal is complete.

## Play and saves

The website automatically downloads, verifies and caches its bundled original GOTY runtime data. No local game file is required. The original title's Click to Start remains part of the game.

The native 800×600 game fits at 4:3. Five discreet icons provide mute, fullscreen, save import, save export and more. Import/export handles **saves only**. More contains attribution, licenses, source downloads, additional save tools and optional generated QA profiles. Save an active level through the original Menu → Main Menu flow before importing or exporting a checkpoint.

Saves persist automatically in this browser without export/import. The existing five-second autosave interval, schema 2 storage and native save layouts are retained. Checksums, backup history and IndexedDB transactions run in a dedicated worker; capturing written game files remains on the main thread. Saves and asset caches use separate browser stores. Export preserves native profile/registry/detail bytes, portable board saves and per-profile QoL settings and plant decks. Import validates ZIP/folder contents and rolls back failed changes. Browser storage can be cleared by the player or browser; export progress before switching browsers. Generated QA profiles are fixtures, not earned campaign progress.

## Audio and rendering

Normal players have music and sound effects, subject to browser autoplay rules and the saved mute preference. The mute icon remembers the player's choice; original volume controls remain available. **All agent testing uses `?testing=1`, which forces inaudible output without changing the normal-player preference.**

## New plant and Bonus challenge: Cold Front

Once Mini-Games is unlocked, choose **Mini-Games → Bonus → Cold Front**.
Chill-shroom is a support mushroom. When charged, it winds up only if an
eligible grounded zombie is nearby, then releases a frost pulse. If all targets
leave range during wind-up, it returns to idle. Pulses are at least **four seconds**
apart. It costs **75 sun**, recharges in **7.5 seconds** and slows for **1.5 seconds**
per pulse. It deals no damage, so pair it with Puff-shrooms and Fume-shrooms.
Stronger existing chill and freezing are preserved. A gentle idle motion gives
way to the attack, whose original-game frost puffs travel outward and fade.

Fresh Cold Front is a setup-and-defend puzzle on the original night lawn.
Spend **1,500 sun** before pressing **LET'S ROCK!**, then survive **four waves**
with no new income or graves. Its bank contains Chill-shroom, Fume-shroom,
Scaredy-shroom, Wall-nut, Cherry Bomb and Squash. Packets refresh during setup.
It has an independent checkpoint and completion record.

**Beat Cold Front to unlock Chill-shroom in Adventure/Survival's native seed
chooser.** Its packet appears above Imitater; existing Cold Front wins count.
It behaves like other mushrooms in daytime and needs Coffee Bean to wake.
Old bonus checkpoints retain their previous rules. Choose **New Game** in the
Continue dialog to play the redesigned minigame.

The accepted Chill.5 silhouette has a broad rounded cap directly over a short
wide body, without a pinched neck or separate feet. Chill.6 refined its painted
finish and bounded eye patches beside original mushroom references. Chill.7
keeps all six sprite PNGs and the packed artwork unchanged while adding gentle
idle motion, target-aware wind-up and a longer native frost effect. All layers
keep their shared scale, registration and ground anchor. [Canonical artwork](dist/content/chill-shroom/canonical.png),
[generation prompts](dist/content/chill-shroom/generation.json),
[extraction recipe](dist/content/chill-shroom/extraction.json) and
[provenance](dist/content/chill-shroom/provenance.json) preserve the exact inputs.
The shared rig retains blink/sleep, native tint/filter/flash and bounded cap
motion, with target-aware activation and the same radial slow, cost, range and
saved layouts.

The five native 80×65 Bonus pictures stay centered compositions of actual
sprites: original Conehead for Cone Zone, original Puff-shroom for Night Shift,
the actual custom Chill-shroom for Cold Front, and original Peashooter plus
gardening glove for Garden Shuffle, and original Wall-nut with Repeater packet
for Seed Swap, over original grass. There is
no separately generated challenge illustration. Their
[resource provenance](dist/content/native-bonus-art.json) records the inputs.
Added Bonus tips remain absent. Original seed packets, menus and flags stay in
use, with no extra HUD. Seed 75, mode 75, checkpoint filenames, completion
records and native save layouts remain compatible. Older generated paintings
remain historical source/Git evidence and are not active card artwork.

## Bonus challenge: Night Shift

Once Mini-Games is unlocked, choose **Mini-Games → Bonus → Night Shift**.
Fresh Night Shift is a **graveyard-control conveyor minigame** with **ten waves
and one flag** and no sun economy. New graves can appear between waves, capped
at six and placed only on empty tiles on the right. Three warned grave rises
can add up to three normal zombies each. Grave Busters remove future spawn
points; two arrive in the opening, with a replacement supplied when needed.
The conveyor combines combat mushrooms with Doom-, Magnet-, Hypno-, Ice- and
Chill-shrooms.

Night Shift uses the original night lawn, native packets, challenge card and
flag banner, with no extra information overlay. It has its own checkpoint and
completion record. Existing checkpoints keep their old fixed-bank rules;
choose **New Game** to play the conveyor version.

## Bonus challenge: Cone Zone

Once Mini-Games is unlocked, choose **Mini-Games → Bonus → Cone Zone**.
Fresh Cone Zone is **Wall-nut bowling** on the original daylight lawn, with
**ten waves and one flag**. Screen-door, newspaper, pole-vaulter, ladder,
jack-in-the-box and football zombies wear functioning native cones alongside
regular coneheads. Launch normal, explosive and **giant Wall-nuts** from the
native conveyor behind the red foul line. The Bowling 2 giant rolls straight
through its targets and is guaranteed in the opening and regular deliveries.

The level has its own checkpoint and completion record. Save/resume, restart,
autosaves and save export/import include the bonus checkpoint. Existing
checkpoints retain their old fixed-bank rules; choose **New Game** for bowling.
The Bonus page uses the standard native challenge grid and card layout. The
original Mini-Games grid remains available through its footer.

## Bonus minigame: Seed Swap

Once Mini-Games is unlocked, choose **Mini-Games → Bonus → Seed Swap**.
Click a seed packet dropped by a zombie, then click a living plant to replace
it. Right-click or Escape cancels the held packet. Every planting is a trade:
replacing a Wall-nut adds firepower but removes its protection. Protect existing
plants, because an eaten plant's empty square cannot be replanted. There is no
sun or seed bank. The native Menu saves the game after canceling any held seed.

## Bonus minigame: Garden Shuffle

Once Mini-Games is unlocked, choose **Mini-Games → Bonus → Garden Shuffle**.
Move the fixed garden to cover changing lanes: three Repeaters, a Snow Pea and
two Wall-nuts face ten short waves. **Click a plant, then an empty square** to
move it; right-click cancels. Moves have a one-second cooldown. Damage and attack
state travel with the plant, and eaten plants are permanently lost for that run.
Your checkpoint preserves the surviving garden and its positions.

## Gameplay controls

Click the stone **1x** button directly below Menu to switch to **2x**. It uses the game's original button artwork, green inset font, hover and pressed states. Click again to return to normal speed. The full seed tray and shovel keep their existing positions.

Only active gameplay accelerates. Menus, pause, seed selection and level transitions keep their normal behavior, and audio playback keeps its normal pitch. New profiles start at 1x. Remember Speed is enabled by default and restores that profile's chosen speed for new or resumed boards; disabling it makes those boards start at 1x.

Open the original **Options → More Options** dialog for these additions:

- **Auto Pause:** enabled by default; losing window focus or hiding the tab pauses active play. Resume explicitly when you return.
- **Controls:** `1`–`9`, `0` select seed slots, `S` selects the shovel and `F` switches speed. Remap or clear these keys in Controls; Space and Escape retain the original pause/menu behavior.
- **Plant decks:** the chooser's stone **Decks** button saves and loads eight named presets per profile, with a preview using native seed-packet artwork. Loading respects unlocked seeds, bank capacity, Imitater and forced selections.
- **Remember Speed:** retain each profile's 1x/2x choice between boards and browser visits.
- **Recharge Timers:** optional remaining recharge seconds on seed packets, disabled by default.
- **Backups:** recover one of up to eight previous saved versions, shown as date-labeled stone buttons. Recovery restores all profiles and saves the current version before replacement. History stays in this browser and is separate from exported save data.

The native options and deck dialogs use the original game artwork and concise labels. QoL preferences and decks travel with save exports in separate files; existing native profile and board-save formats remain unchanged. Backups is also available through the small More utility icon.

## Chill.7 idle and frost revision, 2026-11-01

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

## Historical Chill.6 final style pass, 2026-11-01

[Scoped goal](CHILL-REVISION-GOAL.md) records the accepted geometry, original-plant
style references and muted verification criteria. Built-in image generation is
limited to the custom plant; exact prompts and immutable inputs are published in
[generation.json](dist/content/chill-shroom/generation.json). Native challenge
cards compose the actual sprite, with no standalone AI challenge illustration.

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

## Historical Chill.5 verification — proportions accepted, 2026-11-01

The user accepted the proportions in this release. Its paint and verification
record are retained below while Chill.6 refines the finish without reshaping him.

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

## Historical Chill.4 evidence — shape rejected, 2026-11-01

The user rejected these proportions after the earlier review. Technical results
below remain historical and do not establish visual acceptance.


[Revision criteria](CHILL-REVISION-GOAL.md) follow the user's request for fuller
proportions, painted volume and better motion. Reference and native review
find improved silhouette and shading without a critical defect in the bounded
observations. The 226.121-second coherent Release
build kept all 776 source files unchanged. Seven native suites pass **1,513
checks**; fourteen browser suites include eleven worker scenarios. Eight public
PNG/JSON files and the native header reproduce byte for byte, and both source
patches reconstruct all current source files.

Muted native review confirms consistent packet/lawn/card art, centered earned/
unearned pictures, red title hover without tips and restored new parts before
unpausing the existing 50-sun Sun/Chill/Puff checkpoint. Reliable sampled frames
show idle and seamless closed-eye wind-up. Complete visual-cycle coverage is
not claimed; detailed motion/blink/release/save phase have automated checks.
No full battle or earned win is credited. Local checks pass; website/runtime
packaging and hosted rollout have separate publisher records.

## Historical Chill.3 evidence — flat sprite rejected, 2026-10-31

The user subsequently rejected this sprite's flat/simple look and asked for
better proportions, shading and animation, explicitly permitting generated
plant artwork. Functional observations below retain their original scope.

[Revision criteria](https://github.com/Caleb-Guyer/plants-vs-zombies-web/blob/3ef11e097cd7455f3c0fb9575c8b565a5def4ad3/CHILL-REVISION-GOAL.md) follow the clarification allowing a
distinct custom sprite while forbidding AI-generated challenge pictures.
The tested Release build passes with 775 unchanged source files. Seven native
suites pass **1,476 checks**; all fourteen browser suites, including eleven
worker scenarios, pass. The sprite has editable SVG/JSON, PNG parts and a Pillow
renderer. Final newline-normalized art/source package identities belong in the
publisher's separate release record and manifests.

Muted native review confirms consistent custom art in packets, centered earned/
unearned cards and the lawn; native hover adds no tip. Continue shows the new
parts before unpausing and restores the existing 50-sun Sun/Chill/Puff board.
A bounded attack capture shows closed-eye wind-up, radial frost release and
idle recovery without an old Ice/blink flash. No new save-transfer or completed
battle is claimed. Local implementation/checks pass; website-source packaging
and hosted publication have separate release records. Earlier screenshots and
counts retain their own build scope.

## Historical Chill.2 verification — custom-art restriction superseded

The user clarified that replacing the custom plant with Ice-shroom was an overly
broad interpretation: custom plant art is allowed. The observations below retain
their actual build and functional scope.

[Revision criteria](https://github.com/Caleb-Guyer/plants-vs-zombies-web/blob/2737e8d76b5fa485ef4b13fc604973d46f27a67b/CHILL-REVISION-GOAL.md) track the original-art-only and
centering request. Source review uses the original challenge atlas, native
Ice/Puff/Sun assets and their reanimation pivots. Seven native suites pass
**1,431 checks**. The coherent Release build retains 771 unchanged source inputs;
fourteen browser suites, including eleven worker scenarios, pass. Engine-source
packaging and both patch reconstructions pass. Muted native-size review confirms
three centered readable portraits with and without ribbons, original red title
hover without tips, and original Chill art in its preview, card and restored
game. Continue restores an existing Chill.1 board with 50 sun and the same
Sun-shroom, Chill-shroom and Puff-shroom. No new battle win or fresh full save
cycle is claimed. Local criteria pass; website-source packaging and publication
remain independent release records.
Chill.1's test counts and screenshots are historical evidence for that build;
they do not establish this revision's result.

## Historical Chill.1 verification — AI artwork superseded

The user subsequently requested original artwork instead of this AI-art revision
and a centered Chill-shroom picture. The observations below retain their bounded
functional scope. Original reference extraction and generated-art review completed.
The corrected Release build passes with 773 unchanged source inputs. Seven
native suites pass **1,419 checks**; fourteen browser suites include eleven
worker scenarios. Engine-source packaging and both patch reconstructions pass.
Muted native-size review confirms visible eyes, a joined cap/body, closed-eye
wind-up, radial frost release and idle recovery beside original mushrooms.
All three cards fit with and without trophy ribbons; hover retains the native
red title and adds no tip. An older checkpoint migrates with its 50 sun and
three plants. A fresh current-body board also saves and restores through full
reload/Continue with 50 sun and the same Sun-shroom, Chill-shroom and Puff-shroom,
including the visible eyes and cap. Local feature/save checks pass.
Website-source packaging and publication were separate capture-time release
records. These checks do not establish Chill.2's visual or save result.

## Historical Lantern.2 verification — visual result rejected

The final coordinate-corrected Release build, seven native suites totaling
**1,333 checks**, fourteen browser suites and corresponding engine-source
packaging pass. Coverage includes native cap binding, legacy-body migration,
save-tail phase preservation, distinct card dispatch and removed Bonus tips.
A muted native-size comparison confirmed the revised plant beside original
mushrooms and the corrected three-card framing, with no added hover tips. Both a
legacy checkpoint and a fresh current-body save restored through reload/Continue;
the fresh board retained all three plants, 50 sun and the correct cap. Observed
scope and separate release records are in [QA](PARITY-QA.md). Automated checks do
not certify subjective perfection or exhaustive visual equivalence.

The [earlier art revision criteria](ART-REVISION-GOAL.md) followed the user's
rejection of Lantern.1. The user subsequently rejected Lantern.2's visual result
and attack presentation as well. These bounded functional checks are not user
acceptance of either artwork revision or proof of a perfect original-game match.

## Historical Lantern.1 verification — artwork rejected


The full engine build, seven native suites totaling **1,295 checks**, fourteen
browser integration suites and corresponding engine-source packaging pass. The
new checks cover pulse behavior, native save-tail roundtrips, the exact embedded
artwork, independent Bonus completion and retained original content. Both patches
reconstruct the current engine source exactly. A bounded muted preview confirmed
the third native Bonus card, new seed-packet/lawn sprite, planting costs, a native
chill visual and save/reload/Continue with the three planted mushrooms and 50 sun.
Precise pulse timing and range come from the automated checks, not a browser
measurement. Website-source packaging and hosted verification are recorded
separately in [QA](PARITY-QA.md). Earlier Night.1 and Polish.1 results below remain
historical.

## Historical Night.1 verification

The full engine build, six native suites totaling **952 checks**, fourteen browser integration suites and corresponding engine-source packaging pass. The native checks cover Night Shift's nighttime setup and economy, authored waves, independent saves, completion, awards and retained controls. Both source patches reconstruct the current engine source exactly. A bounded muted preview confirmed the matching card, nighttime setup, mushroom planting and native save/reload/Continue with the saved Sun-shroom and 125 sun. Website-source packaging and hosted verification are recorded separately in [QA](PARITY-QA.md).

## Historical Polish.1 verification

Eleven dedicated-worker scenarios, fourteen browser integration suites and 678 native checks passed. A muted preview of the final build loaded existing schema 2 synthetic saves and confirmed the centered More Options form, Controls screen and standard Bonus card layout. Further observations and hosted verification are recorded separately in [QA](PARITY-QA.md).

In Node fixtures modeled on public file sizes, the old synchronous transaction work reached 177/306 ms for the two larger datasets. The new main-thread capture and dispatch measured 1.60/2.51 ms median, with maxima of 1.87/2.76 ms. Heavy persistence work still takes time in the worker. These measurements do not establish browser FPS or complete stutter elimination.

## Rendering

The original 3D Acceleration checkbox now selects hardware rendering or CPU scene composition. CPU mode uses the existing WebGL context to transport its final bitmap. Its dedicated opaque RGB888 screen preserves the original distinction between screen and offscreen-image arithmetic. Normal/colored/additive bitmap drawing and clipped fast/slow stretch have addressed native-reference regression tests. Hardware remains the browser default when no preference exists; original native automatic hardware selection is a separate conditional policy.

Software.7 keeps the dedicated ordinary RGB888 CPU screen and earlier bitmap, stretch, mirror and fill corrections. It corrects two addressed reanimation callback differences: additive passes now use saturated addition, and bilinear sampling repeats whole-texture edge neighbors with the original fixed-point floors. The correction is enabled only inside the actual screen matrix/triangle virtual calls, with the same target buffer and pitch. Five alpha-textured white/global/constant-vertex combinations are covered; other callbacks and offscreen MemoryImages retain Software.6 behavior. The triangle clipping, scan conversion and interpolants stay unchanged. Other formats, driver/volatile/cache/device paths, unclosed modulation combinations, transformed geometry, original framebuffer equality and dense-scene performance remain incomplete. CPU composition still presents through WebGL.

## Content and verification

Software.10 changes exactly three source paths relative to Software.9: the version file, callback admission and the narrow native-screen pixel include; all other 754 of 757 engine files are byte-identical. Its isolated full Release compile/link passed with exit 0 in 135.885 seconds. The paired actual-code suite runs 2,372,278 assertions per variant: frozen Software.9 has 47,270 and 50,870 expected additive differences in the two families, while Software.10 has zero failures. The 90 unchanged expanded callback bodies include both normal dispatchers and remain byte-identical to Software.9.

The two corrections apply only to guarded dedicated CPU-screen RGB888 nearest-additive routes: texture-alpha with constant original vertex color plus global color, and opaque texture with global color. The combined route preserves the original global/256 vertex prepass and second per-pixel global multiplication; the opaque route ignores stored texture alpha before global modulation. Existing exact target-buffer/pitch, dimensions, UV, valid-channel and offscreen fallbacks remain. Geometry, clipping, scan conversion, interpolation, game rules and audio are unchanged. No ordinary scene using either new additive route has been established; conditional API tests do not prove original framebuffer or full renderer parity.

Software.10's own muted private browser check used a fresh Web10QA profile without generated QA fixtures. Native CPU mode was selected before Adventure and remained unchecked on Options reopen during 1-1. The first attempt completed 1-1 without Restart or Game Over: Peashooter placement, sun collection and projectiles were observed, the Sunflower reward was collected, and Next Level entered 1-2. One Sunflower was planted in the leftmost middle cell, with zero sun remaining.

During 1-2, CPU/hardware/CPU requests were applied and each setting was checked through a separately reopened native menu, retaining the visible board. Original Main Menu/Leave and Quit/confirmation reached a fresh title before export. Import into a separate fresh browser origin showed Save imported; exporting again before Start preserved all four payloads and 44,120 expanded bytes exactly, including the 42,863-byte Adventure checkpoint with internal CRC32 `ec6bbc32`. The fresh profile records level 2 and finishedAdventure 0; this is first-level progress, not a completed campaign. After Start, the imported Web10QA 1-2 menu and actual Continue prompt were observed; Continue restored the visible one-Sunflower/zero-sun board, and its native menu showed CPU unchecked.

These are private Software.10 first-level and scoped save-transfer/visible-Continue results. No 1-2 win, complete actor enumeration, ordinary invocation of either new additive route, hardware combat, authentic-original/public-runtime comparison or dense-scene performance result is credited. The five-to-thirteen-minute chooser/download tool waits are not game-performance measurements. Earlier Software.9/8/7 gameplay, wins and persistence remain historical and do not transfer to Software.10. All 228 coverage entries, all 50 Adventure levels and the full original roster, modes and abilities remain required; authentic-original runtime comparisons remain zero and exact 1:1 parity remains incomplete. Normal-player audio and forced-quiet agent testing are unchanged.

Historical Software.9 changes only the version file and callback admission relative to Software.8; the other 755 of 757 engine files are byte-identical. Its isolated Release compile/link passed with exit 0 in 136.647 seconds. The paired actual-code suite runs 92,637 assertions per variant: frozen Software.8 has 24,880 expected differences, and Software.9 has zero failures. All 91 other expanded callback bodies, including the matching normal callback, remain byte-identical to Software.8.

The correction admits only the dedicated CPU-screen RGB888, texture-alpha, vertex-only nearest ADDITIVE specialization with equal input vertex colors. It reuses the unchanged pixel/sampler math and existing exact-buffer/pitch, complete-dimension, UV and current-channel guards; clipping, geometry, interpolation and context ownership remain unchanged. Nonconstant input colors and other unsupported inputs retain the Software.8 path. An ordinary additive scene has not been established; the CPU Pause/Newspaper source route uses the already-matching normal callback.

Software.9's own muted private browser check reached the automatic ready title and Information/version/source links, retained the five icons, and installed six generated profiles through ordinary More/Advanced controls. With QA-Boss selected, native 3D Acceleration was changed from checked to unchecked and remained unchecked on Options reopen. The first Vasebreaker puzzle showed 25 unopened vases and the fixture's 99,990 coins. Canvas Space opened GAME PAUSED with the Newspaper animation visible at two times; Resume Game returned to the same 25-vase board. Original Main Menu/Leave and Quit/confirmation returned to a fresh ready title; Start/Options still showed CPU unchecked. This verifies scoped normal pause/resume and CPU-setting persistence, not puzzle checkpoint restoration or earned progress.

The error-level query and `Failed to find track` filter (30 entries each) were empty; this does not certify the entire log. Final normal Quit reached a ready title before the private tab was closed and its owned loopback server stopped.

At that initial Software.9 UI checkpoint, no vases were opened and no combat, finite win, earned unlock, corrected-additive invocation, hardware/fullscreen roundtrip, save-export byte comparison, performance result or authentic-original/public-runtime comparison is credited. The pause animation is a normal-path preservation sample, not a traced additive scene or native-frame comparison. All 228 coverage entries, 50 Adventure levels and every original plant, zombie, mode and ability remain required; authentic-original runtime comparisons remain zero and the full 1:1 goal remains active.

Historical Software.8 changes four source paths relative to Software.7; all other 753 of 757 files remain byte-identical. Its isolated Release compile/link passed with exit 0 in 127.734 seconds. The paired actual-code AA suite runs 10,866 assertions per variant: Software.8 has zero failures; frozen Software.7 has 1,168 expected failures, including 888 differing pixels. These are focused source/build checks, not new gameplay or original-runtime comparisons.

The Vasebreaker Hammer now requests the original track name `anim_open_pot`. The bundled asset already selected that track through index-0 fallback, so the established correction removes an invalid lookup/log message without claiming changed frames or timing. A separate CPU-screen override matches the original nonaxis additive-AA no-op and auxiliary-cache cleanup only for the reviewed forced-opaque, nonvolatile raw screen state. It retains the authoritative framebuffer and dirty/drawn state; other states and normal/axis drawing retain Software.7 behavior. No ordinary game caller of that AA API has been established. Software.8's own scoped private browser observations follow; original-runtime comparisons remain incomplete.

Software.8's own muted private browser check observed automatic file-free startup, Information/version and matching source links, and six generated profiles installed through More. The native 3D Acceleration checkbox remained unchecked (CPU mode) on Options reopen and after normal Quit/reload. In the first Vasebreaker puzzle, two green vases released Snow Pea packets; they were planted at c0/r1 and c0/r2, leaving 23 vases. Original Menu/Main Menu/Leave, Quit, a fresh ready title and Puzzle/Continue visibly restored those 23 vases, two Snow Peas and the fixture's 99,990 coins. This is a scoped visible checkpoint pass, not an exported-byte comparison or earned progress.

The retrieved `anim_pot_open` and missing-track filters (50 entries each), and the error-level query (30 entries), were empty; this does not certify the entire log. No mid-swing Hammer frame was captured: the Hammer-named image shows debris and a seed packet. No Software.8 finite win, released-zombie combat, exact animation timing, native pixel equality, direct corrected-AA invocation, hardware/fullscreen roundtrip or performance result is credited. These are private Software.8 observations, not public or original-runtime validation.

The implemented catalog includes 49 standard plants including Imitater, four special plant forms, 26 standard zombie Almanac entries including Dr. Zomboss plus seven variants, 50 Adventure levels, 20 standard minigames, Vasebreaker/I,Zombie puzzles and endless variants, Survival, Zen Garden, Tree of Wisdom, shop, Almanac, achievements, profiles and Zombatar. Catalog presence does not prove every behavior or unlock.

Historical Software.7 source checks passed the isolated full Release compile/link and JS/WASM/version checks. The paired actual-code callback regression compares 36,175,872 broad buffer assertions and 222,720 assertions from 13,920 independently authored mixed-alpha/texture-dimension fixtures per variant. Frozen Software.6 has 13,512,240 broad and 47,990 fixture differences as expected; Software.7 has zero. The independent scalar header agrees with all 13,920 authored expected cases. Both variants produce identical offscreen hashes. A separate extracted production context/virtual-method suite passes 169 checks per variant, and all 82 unclosed expanded callbacks are identical to Software.6. Retained unscaled/scaled-mirror, fill, DD32, primitive, offscreen-stretch, renderer-mode, presenter and nine portrait tests pass. The complete raw-upstream patch reconstructs all 757 engine files byte for byte. These are bounded source/build/synthetic checks, not an original runtime capture.

Historical Software.4 muted browser checks cover automatic startup, native renderer selection, fog/pool planting, repeated renderer switches, fullscreen icon entry/exit, checkbox/pointer synchronization, normal Quit/restart preference persistence and a controlled three-plant checkpoint restoration. Those checks do not certify Software.6 runtime behavior or every scene, level, ability or timing detail. Software.6's own scoped browser observations are recorded separately below. An earlier live-gameplay run showed extra Puff-shrooms; the later controlled run did not reproduce them, and its historical cause remains unverified.

Historical private Software.5 checks completed the second ordinary To the Left run: all 25 vases and enemies cleared, the reward was clicked, the white fade/Achievements/Continue sequence returned to the settled puzzle catalog. Left-facing Repeater attacks, Snow Pea slowing, Jack explosion chains, Bucket armor loss, Wall-nut chewing and Potato Mine rising were observed. The 18/18 trophies and four achievements were prefilled, so no earned unlock is credited. Native CPU/fullscreen switching retained known placements. Later visible CPU tooltips and normal Main Menu/Leave/Quit/fresh-title/Continue restored CPU preference, Sun-shroom and Puff-shroom placements, 25 sun and the ten-packet bar. These are Software.5 observations only; no save-export byte comparison or original framebuffer equality is claimed. Software.6's separate scoped observations are recorded below; this historical result supplies no Software.6 finite-win or pixel-equivalence credit.

A historical muted local Software.6 run verified its Information/source identity, automatic original title, visible CPU tooltip, fullscreen icon entry/exit and CPU/hardware/CPU changes. Original Main Menu/Leave and Quit/restart preserved the CPU preference; Continue restored the visible Night 2-1 checkpoint with Sun-shroom and Puff-shroom, 25 sun, the same ten packets, four graves and the existing zombie. Resumed zombie movement was observed, and the error-level console query after restart returned no entries. This is a scoped Software.6 pass, not a finite-level win, save-export byte comparison, direct new-mirror invocation, dense-scene FPS or original framebuffer/JPEG equality claim. Full 1:1 parity remains incomplete.

Historical finite wins include Adventure 1-1, repeat Adventure 2-1 and the first Vasebreaker puzzle, on the exact builds/profiles recorded in PARITY-QA.md. No complete first campaign or exhaustive mode coverage is claimed. Original-runtime composed Zombatar JPEG equality remains unverified even though the custom parameter 40 quantizers, optimized Huffman policy, 4:2:0 format and browser export/persistence paths have scoped evidence.

A muted local Software.7 run observed its automatic original title, Information/version/source links and six generated QA profiles installed through ordinary More controls. Native CPU selection remained unchecked on Options reopen; the fullscreen icon enlarged the layout with the original Full Screen checkbox checked and returned, and a hardware/CPU roundtrip retained the planted board. Original Menu/Main Menu/Leave and Quit/confirmation returned to a fresh file-free title. The selected QA-Night profile and unchecked CPU preference persisted; Adventure/Continue visibly restored the same ten-packet bank, zero sun, Sunflower at c0/r2, Puff-shroom at c1/r2, graves, enemy and mowers. This is Software.7's own bounded ordinary-UI pass, with visible checkpoint restoration rather than exported-byte or exact-actor comparison.

The post-restart error-level console query returned no entries.

Those basic Software.7 checks did not include a finite win, earned unlock, explicit hit/chill comparison, save-export byte comparison, direct corrected-callback trace, authentic original frame/JPEG equality or dense-scene performance. Later private Software.7 gameplay results are recorded separately below and do not transfer to Software.8 or Software.9. Full 1:1 parity remains active and incomplete.

Historical private Software.7 subsequently completed Zombiquarium on its third attempt and all five flags of Survival: Day (Normal), with final reward pickup and return to the settled mode catalog. The generated profiles already had trophies/unlocks, so these wins do not establish newly earned unlocks, other modes or native equivalence. They provide no Software.8 or Software.9 win or gameplay credit; Software.5's To the Left win remains separately historical.

## GitHub Pages release

This release targets [`Caleb-Guyer/plants-vs-zombies-web`](https://github.com/Caleb-Guyer/plants-vs-zombies-web) and the normal Play URL https://caleb-guyer.github.io/plants-vs-zombies-web/. The user authorized publishing the current build on 2026-10-31 and stopping further manual gameplay. GitHub Pages is published: [release workflow 41230962473](https://github.com/Caleb-Guyer/plants-vs-zombies-web/actions/runs/41230962473) completed successfully on 2026-10-31. Full original-game 1:1 parity remains unverified. The historical QA descriptions below and above retain their capture-time scope and do not certify every level, mode or ability.

All original runtime assets are bundled in the prebuilt `dist/` site, so play starts without a local game installation or resource upload. The manual-only workflow publishes `dist/` directly and derives the owner's project URL from GitHub. It does not run a backend or rebuild the engine. The hosted site reached the original Click to Start title automatically without a local file prompt during a silent `?testing=1` startup check. The WASM response returned HTTP 200 with `application/wasm`; no campaign gameplay was performed on GitHub. See [deployment instructions](DEPLOYMENT.md) for the release flow and bounded verification results.

## Local run and source

Use Node.js 18 or newer:

```text
npm run dev
npm run check
```

Open `http://localhost:4196`. There is no dependency installation or browser-code build step. The server binds to loopback and serves only dist. For another port use `node server.mjs 4197`. Use HTTP rather than opening index.html through file URLs.

Python 3 is needed for packaging and asset verification:

```text
python bundle-game-assets.py --verify-only
python package-portable.py --output-dir outputs
```

The approved bundle consists of six exact original runtime data files totaling 45,462,524 bytes, split into 11 verified parts. It contains no Windows executable, DLL or installed save data. To regenerate it, explicitly supply `--zip <resource-archive.zip>` or `--game-dir <installed-game-directory>`.

Current corresponding source is [Chill.4 engine source](dist/source/pvz-portable-0.2.6-web-chill.4-source.zip), with [web-chill.4.patch](dist/source/web-chill.4.patch) as the full upstream patch and [chill3-to-chill4.patch](dist/source/chill3-to-chill4.patch) as the increment from [Chill.3 source](dist/source/pvz-portable-0.2.6-web-chill.3-source.zip). The engine package and both source reconstructions pass; final website/runtime package and hosted receipts have separate publisher records. The complete source builds without applying a patch. [Engine provenance](dist/game/engine-provenance.json) and the [build record](dist/source/build-provenance.json) pin completed release artifacts. Source packages retain complete current source, required parent/upstream inputs, tests, frozen atlas/recipe, generation records, dependencies and licenses; full original runtime payloads remain in the runtime distribution. Packaging uses the GitHub Pages 100 MiB per-file ceiling instead of the obsolete 25 MiB provider limit. The website source contains the save worker and shared storage core, and `dist/ui` records attribution and hashes for original save-recovery artwork.

Public v15 preserved the three approved XML resource files' original CRLF bytes in Git and added the matching attributes rule, closing the fresh-checkout checksum blocker without changing the Software.7 runtime. GitHub Pages publication succeeded on 2026-10-31 through [release workflow 41230962473](https://github.com/Caleb-Guyer/plants-vs-zombies-web/actions/runs/41230962473). The bounded hosted startup check does not establish full game parity. The user authorized publication of the current build on 2026-10-31 while full 1:1 parity remains unverified; publication does not mark that goal complete.

PvZ-Portable © 2026 Zhou Qiankang and contributors, LGPL-3.0-or-later; bundled dependencies retain their licenses. Plants vs. Zombies and its original names, characters and assets belong to PopCap/Electronic Arts. This unofficial community-engine playtest has no affiliation or endorsement.
