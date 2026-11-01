# Browser parity and QA record

## Chill.4 plant volume and animation revision, 2026-11-01

The user rejected Chill.3's flat/simple appearance and requested better
proportions, shading and animation, explicitly allowing image generation for
the plant. `0.2.6-web-chill.4` is based on Chill.3. One built-in image-generation
call created a plant-parts atlas using original mushroom references. The
restriction on separately generated challenge illustrations remains; cards
continue to render actual Conehead/Puff/custom-Chill sprites over original grass.

Independent comparison of the assembled proof with original Puff, Sun, Fume and
Doom parts found a fuller cap silhouette, rounded shaded body and tucked feet.
The visible cap is 84×46 rather than Chill.3's approximately 100×44 flat umbrella;
the body is 48×38 and feet 40×11 within their native canvases. Cap/body width ratio is
about 1.75. Highlights, midtones and a deep indigo underside give volume while
the blue/cream identity remains distinct from Ice/Puff and has no muzzle.
`outputs/pvz-chill4-release/sprite-proof.png` uses native idle positions and draw
order. Separate native observations below establish bounded in-game review;
neither establishes subjective perfection or full parity.

The atlas extraction recipe records source regions, target boxes and eye
composition. Half/closed expressions replace the full body with pixels identical
outside the eye bounds, avoiding small gradient seams. Native motion uses
gentler whole-plant compression, rebound and independent cap lag up to two
texture pixels. Existing pulse timing, radial chill, saved fields, IDs,
checkpoints, original content, worker and QoL remain the intended behavior.

[Generation](dist/content/chill-shroom/generation.json),
[extraction](dist/content/chill-shroom/extraction.json),
[sprite provenance](dist/content/chill-shroom/provenance.json) and
[native card provenance](dist/content/native-bonus-art.json) record the current
inputs. Frozen-atlas extraction is reproducible; image generation itself is not
claimed to be deterministic. All eight public PNG/JSON files plus the native
header reproduce byte for byte from the frozen atlas and extraction recipe.

Seven native suites pass **1,513 checks**: 66 speed, 90 controls, 105 decks/cooldowns,
139 Cone Zone, 557 completion/rewards/navigation, 131 Night Shift and 425
custom-plant/portrait checks. Source and harness pins match the current code.
These checks cover the production behavior under controlled fixtures, with no
audio or proof of subjective visual equivalence.

Pre-publication local evidence on 2026-11-01: the coherent Emscripten Release
build passed in **226.121 seconds**, with all **776 source files unchanged**
during compilation. All fourteen browser integration suites pass, including
eleven worker scenarios and current native/provenance/source-PNG pixel checks.
The engine-source ZIP passes with **808 entries and 5,813,693 bytes**. Both full
upstream and Chill.3 incremental patches reconstruct all 776 source files byte
for byte. Exact artifact identities remain in manifests.

Actual muted `?testing=1` review confirms centered actual-sprite Bonus pictures
with and without earned ribbons. Hover keeps the native red title without added
tips. Packet preview, lawn and card share the new rounded cap, compact shaded
body and eyes. Native Continue's paused backdrop already shows the new parts;
the existing 50-sun Sun/Chill/Puff board restores. Private proofs are
`outputs/pvz-chill4-release/live-native-sprite.png`, `bonus-earned.png`,
`bonus-unearned.png`, `bonus-hover.png` and `paused-save-restored.png`.

Approximately six seconds of play produced only three sampled clips, at
37, 1,069 and 4,088 ms. The third returned a partial size and is not used as
complete animation evidence. The first two (`attack-cycle/000.png` and
`001.png`) show idle and closed-eye wind-up with rounded shading and no visible
expression seam. A later full Menu/paused screenshot, `after-cycle-paused.png`,
confirms stable paint. This does **not** verify a complete visual cycle, all
blink frames or a captured release. Detailed cap curves, blink/release and save
phase are covered by the 1,513 production-method checks, rather than inferred
from sparse browser samples. No full battle, earned win, fresh save cycle or
save-transfer validation is credited.

Owned muted test tabs 20 and 21 were closed. Local implementation and bounded
checks pass; website/runtime packaging and hosted rollout are separate publisher
records. Earlier results retain their own scope, and the formal parity goal
remains paused and incomplete.

## Historical Chill.3 custom sprite — flat appearance rejected, 2026-10-31

The user subsequently rejected the sprite's flat/simple look and requested
better proportions, shading and animation. The earlier functional results
below are not acceptance of that art or verification of Chill.4.

The user clarified that a custom plant sprite is allowed; AI-generated challenge
pictures are forbidden. The earlier interpretation requiring an unchanged
Ice-shroom appearance was too broad. `0.2.6-web-chill.3` is based
on Chill.2 and uses a distinct five-part vector/code-drawn sprite: rounded
asymmetric dusty frost cap, mint/cream stem, dark pill eyes, organic base and
matching blink patches. No image-generation tool is used.

The native Ice reanimation remains the motion carrier, not the plant's visual
identity. The parts match its pivots and eye clearance, including the
image-bearing sleep track and separate blink reanimation. The native XML has
duplicate `anim_sleep` names; assigning by the first matching name alone would
bind the marker rather than the eyelids. Saved-null image overrides rebind
before paused drawing, without resetting state or changing serialized fields.

Challenge pictures remain centered native compositions of the actual sprites,
not separately generated illustrations: original Conehead, original Puff-shroom
and the new custom Chill-shroom over original grass. Existing uniform alpha-bound
fit, 80×65 frames, trophy/hover paths and absent Bonus tips remain. The custom
sprite is shared by the seed preview, card and lawn. Gameplay,
attack, IDs, saves, worker and QoL retain their prior behavior.

Independent part-level inspection viewed all five native-size PNGs and the
editable vector recipe: low asymmetric cap, broad spots, muted underside,
cream/mint waist, matching blink skin and no muzzle. No critical part-level
style defect was found. Separate native observations below verify assembly.

Seven source-coherent native suites pass **1,476 checks**: 66 speed, 90 controls,
105 decks/cooldowns, 139 Cone Zone, 557 completion/rewards/navigation,
131 Night Shift and 388 custom-plant/portrait checks. The last suite executes
five-part pixel caching/binding, image-bearing duplicate sleep selection,
blink-frame variants, owned-blink portable-null rebinding, existing-Ice upgrade,
original-Ice isolation and shared live/preview/card rendering alongside retained
mechanics/centering checks. These controlled production-method checks do not
establish visual perfection or initialize audio.

Pre-publication local evidence on 2026-10-31: the tested Emscripten Release
build passed in **245.914 seconds**, with all **775 source files unchanged**
during compilation. All fourteen browser integration suites pass, including
eleven worker scenarios. The five-part sprite uses editable SVG/JSON and a Pillow
renderer. After these gameplay checks, Windows-default newlines were found in
SVG/provenance and generator writes. The LF normalization affects formatting,
without changing sprite pixels. Final normalized source/art reproduction,
full/parent patches and package identities have a separate publisher record.
Exact source/binary/patch identities belong in release manifests rather than
duplicated hash lists here.

Actual muted local `?testing=1` review confirms the distinct custom sprite in
the seed bank, lawn and centered Cold Front card. Earned and unearned Bonus
views retain readable centered heroes; hover keeps the native red title and
adds no tip. Private proofs are `outputs/pvz-chill3-release/live-native-sprite.png`,
`bonus-unearned.png`, `bonus-earned.png` and `bonus-hover.png`. The assembled
`sprite-proof.png` uses the actual native idle transforms and draw order; the
earlier unscaled proof is not acceptance evidence.

Native Continue's paused backdrop already shows the new parts. After Continue,
the existing board restores 50 sun and Sun-shroom/Chill-shroom/Puff-shroom.
`paused-save-restored.png` and `after-cycle-paused.png` provide private proof.
A 168-frame, 5.6-second bounded capture shows closed-eye wind-up, a twelve-direction
frost release and recovery to idle without an old Ice part or blue blink flash;
`attack-contact-sheet.jpg` records sample frames. This is visible behavior, not
a precise browser timing/range or FPS measurement. Production-method tests cover
the exact mechanics. No fresh save-transfer, earned win or full playthrough is
credited to this review. The user's existing public GitHub game tab was untouched.

Local implementation, focused checks and native art/save criteria pass.
Website-source/runtime packaging and hosted publication are separate release
records. [Current criteria](https://github.com/Caleb-Guyer/plants-vs-zombies-web/blob/3ef11e097cd7455f3c0fb9575c8b565a5def4ad3/CHILL-REVISION-GOAL.md) track the clarification;
the older formal parity goal remains paused. Earlier counts/screenshots do not
establish this revision's results or exhaustive original-game parity.

Final LF-normalized artwork source was rebuilt after the pre-publication
observations above. The 153.599-second incremental build preserves all 775
source files and produces the exact same JS/WASM bytes as the visually tested
build. The artwork-dependent suite was rerun: 388 checks pass; all seven current
reports total 1,476. All eleven public SVG/PNG/provenance files and the packed
pixel header reproduce byte for byte with Pillow 12.2.0. The final source ZIP
contains 807 entries / 4,603,427 bytes, SHA-256
`3248007cf32dc65c44b5a8474f3ed8465cb5fe849697cf77695e6c830af53aca`.
Both full-upstream and Chill.2 incremental patches reconstruct all 775 source
files exactly. Final website-package and hosted-byte receipts are checked
separately by the publisher; no broad gameplay or original-reference parity
claim follows from these results.

## Historical Chill.2 original-art revision — interpretation superseded, 2026-10-31

The user later clarified that a distinct custom plant sprite is permitted and
that the restriction concerns generated challenge pictures. The original-Ice
requirement and evidence below retain their historical scope.

The user requested original game artwork instead of AI pictures and a centered
Chill-shroom portrait. The `0.2.6-web-chill.2` candidate is based on Chill.1.
Chill-shroom now uses unchanged original Ice-shroom cap/body/eyes and animation.
The generated cap, embedded generated card images and twelve old standalone
PNG/provenance aliases are removed from the current distribution. Historical
source archives and pinned Git blobs retain the old evidence; they are not
active visual resources. No image-generation call was used for this revision.

Each 80×65 Bonus picture has one centered hero rendered from original game
resources: Conehead head/cone, Puff-shroom and the actual Ice-based Chill-shroom,
over original grass. Native CPU rendering resolves each actor's alpha bounds
before a uniform fit into 68×57 centered at (40,32.5). This centers the visible
art rather than the padded preview canvas. Original artwork, input identities
and composition provenance belong in
[native artwork provenance](https://github.com/Caleb-Guyer/plants-vs-zombies-web/blob/2737e8d76b5fa485ef4b13fc604973d46f27a67b/dist/content/native-bonus-art.json).

The Conehead actor retains original head and jaw plus cone tracks; body, neck,
arms and other accessories are hidden. Original day/night background resources
are loaded idempotently and copied into owned CPU pictures. No resource pointer
is retained by a baked card. Chill's old custom cap override is cleared, so its
native crystal contour and eye opening remain unchanged. The radial slow,
40-tick wind-up, 30-tick release/recovery, enemy eligibility, IDs, saved fields,
checkpoints and completion routing retain Chill.1 behavior. Added Bonus tips
remain absent and original hover/title/frame/trophy paths stay in use.

Seven fresh source-coherent native suites pass **1,431 checks**: 66 speed,
90 controls, 105 decks/cooldowns, 139 Cone Zone, 557 completion/rewards/navigation,
131 Night Shift and 343 new-plant/portrait checks. The last suite exercises
sparse-alpha bounds, uniform centered fit, native hero/track selection, card
caching, resource retry/disposal, stale cap-override clearing and portable
native fallback while retaining attack/pulse/save migration checks. Generated
PNG/decoder tests are removed with that renderer. These execute production
methods under controlled fixtures, without audio or visual-perfection claims.

The coherent Emscripten Release build passed in **245.717 seconds**, with all
**771 source inputs unchanged** throughout compilation. All fourteen browser
integration suites pass, including eleven worker scenarios, original-resource
provenance, absence of generated-art headers and twelve standalone aliases,
and retained catalog IDs/titles. Native source/harness pins match this build.

The engine-source package passes with **803 entries and 4,570,036 bytes**.
Both the full upstream patch and Chill.1 incremental patch reconstruct all
771 source files byte for byte. Artifact hashes remain in release manifests.

Muted native-size review confirms all three large original subjects are centered
and readable inside their original frames both with and without trophy ribbons.
The Conehead face/cone, Puff face and Ice cap/face remain clear. Cold Front hover
retains the original red title without an added tip. Private proofs are
`outputs/pvz-chill2-release/bonus-earned.jpg`, `bonus-unearned.jpg` and
`bonus-hover.jpg`. The native original catalog was also used for comparison.
Earned and unearned states use retained private QA fixtures; neither establishes
an earned battle win, and no fixture edit was needed in this revision.

An existing Chill.1 checkpoint was opened through Cold Front's native Continue.
It restored 50 sun, the same Sun-shroom/Chill-shroom/Puff-shroom and native graves
and mowers. Chill-shroom uses the unchanged original Ice cap and face, matching
its current preview and card. Private proof is `restored-native-plant.jpg`.
This is current-build checkpoint/art restoration, not a new full save cycle or
completed battle. The fresh save/reload evidence below remains specific to Chill.1.

Both owned test tabs 16 and 17 used `?testing=1` with mute checked and were closed.
The user's public tab 4 was untouched. Local criteria pass; website-source
packaging and publication remain independent release records.
[Current criteria](https://github.com/Caleb-Guyer/plants-vs-zombies-web/blob/2737e8d76b5fa485ef4b13fc604973d46f27a67b/CHILL-REVISION-GOAL.md) track this revision while the older
formal parity goal remains paused. Earlier Chill.1/Lantern results do not become
this build's results. No full original-game parity or subjective visual
perfection is claimed.

## Historical Chill.1 revision scope — AI artwork superseded, 2026-10-31

The user subsequently requested original artwork instead of these generated
pictures and a centered Chill-shroom image. The capture-time results below
remain bounded evidence for Chill.1, not approval of its AI artwork or results
for Chill.2.

The user rejected Lantern.2's art and attack presentation after its bounded
functional checks. The new `0.2.6-web-chill.1` candidate is based on Lantern.2.
Its player-facing plant is Chill-shroom and its third Bonus challenge Cold Front;
seed 75, mode 75, completion record 74 and checkpoint filenames remain unchanged.
[Revision criteria](https://github.com/Caleb-Guyer/plants-vs-zombies-web/blob/136d440a4daa0ac4f876a7200eb13d4382405845/CHILL-REVISION-GOAL.md) track the explicit user request. The
formal goal tool rejected a new objective while the older parity goal remains
paused; the unfinished parity goal is not marked complete.

Reference work extracted exact original Ice/Fume/Doom/Gloom PNGs, reanimation XML,
the challenge atlas, frame and trophy from the authenticated bundled main.pak.
The original bytes remain unchanged and private inventories pin their hashes.
Ice-shroom's muzzle-free body and half-lidded eyes provide the new native basis;
its original animation has idle and sleep but no shooting layer. The new
attack therefore includes an explicit 40-tick wind-up, radial frost release and
30-tick recovery synchronized to the retained slow mechanic.

The new cap decoder normalizes alpha bounds above 8, fitting visible content
to 103×46 at the top of the unchanged 103×54 native canvas. The bottom eight
rows remain transparent so the original eyes are not covered. Native Ice
idle/sleep/blink supplies the body and eyes; the wind-up closes eyes and compresses
the body before rebound. The finite burst draws original Snowflakes and
SnowPeaPuff frames in all directions, without a projectile, full-screen particle
effect or new looping emitter. Existing saved countdown fields drive the phase
and pose. Ensure paths migrate old Puff/bodyless saves once, preserve existing
Ice animation time and bind custom cap overrides before paused drawing. Cap,
preview and three card caches are disposed while app/graphics owners are alive.

Independent inspection viewed all four generated production assets against the
original references: a snowy cyan cap and three separate Bonus paintings.
Cone Zone uses a large conehead portrait; Night Shift purple Puff-shroom and
amber Sun-shroom; Cold Front the new cyan mushroom and a subordinate chilled
zombie. The cap and Cold Front picture share the same muzzle-free design.
The native 80×65 trophy mask obscures roughly the upper-left `x+y<=46` triangle;
critical faces are placed below/right of it. These are source-art composition
observations; separate final native-size observations below establish the bounded
body/cap joining, trophy-state and attack review.
Full prompts and exact asset identities are recorded in
[`dist/content`](https://github.com/Caleb-Guyer/plants-vs-zombies-web/tree/136d440a4daa0ac4f876a7200eb13d4382405845/dist/content/).

The final corrected Emscripten Release build passed in **117.519 seconds**, with
all **773 source files unchanged** throughout compilation. Seven fresh,
source-coherent native suites pass **1,419 checks**: 66 speed, 90 controls,
105 decks/cooldowns, 139 Cone Zone, 557 completion/rewards/navigation,
131 Night Shift and 331 new-plant checks. The seventh suite exercises phase/pose,
radial effects, image binding, legacy Puff/blink migration and actual portable
save-tail boundaries. All fourteen browser integration suites pass, including
eleven worker scenarios, retained catalog/saved-ID checks and exact four-PNG
Base64/header/provenance coherence. An executed controlled-PNG decoder regression
fails six checks with the old 54-row cap-content rule and passes with the new
46-row content/eight-row clearance; it checks actual output pixels and retains
the untrimmed 80×65 card path. Automated checks initialize no audible game.

Generator checks also verify concise UTF-8 file-free loading text and the current
engine caption in both HTML outputs. They fail against the encoding-damaged
generator and pass after restoring its original UTF-8 bytes with only the current
cache token changed. Regenerated shell output and the complete fourteen-browser/
1,419-native check run pass again; native source and binaries are unchanged.

The final engine-source package passes with **805 entries and 10,943,275 bytes**.
Both the full upstream patch and Lantern.2 incremental patch reconstruct all
773 current source files byte for byte. Manifests pin exact release artifacts;
their hashes are not duplicated here.

The first actual muted review accepted the three earned-card illustrations:
large subjects remain clear inside their frames around the original trophy
ribbons. Private proof is `outputs/pvz-chill1-release/bonus-cards-earned.jpg`.
A legacy Lantern.2 checkpoint migrated to the Ice body, retaining 50 sun and
Sun-shroom/custom mushroom/Puff-shroom. The same native-size view rejected the
plant's appearance: the continuous cap underside covered the half-lidded eyes,
leaving a blank body. Private proof is `legacy-migration-native.jpg`. Migration
success is functional evidence only; the plant visual gate failed.

The 103×46 correction supersedes that first 153.677-second/1,405-check snapshot.
Final muted native-size review shows clear half-lidded eyes, a continuous
cap/body join and no muzzle beside original Sun-shroom and Puff-shroom. Private
proof is `outputs/pvz-chill1-release/plant-final.jpg`. A 5.2-second capture
sequence contains the closed-eye compressed wind-up (`attack-000.png`), rebound
with snowflake/puff release in all directions and a blue-chilled conehead
(`attack-005.png`), outward fading (`attack-008.png`) and open-eye idle
(`attack-025.png`). This establishes visible attack presentation, not a precise
browser tick/range measurement; those mechanics have production-method checks.

Final earned and unearned card views retain all three distinct pictures inside
the native frames, with their subjects visible around the trophy ribbons.
Native hover makes the title red and adds no tip. Private proofs are
`bonus-cards-earned.jpg`, `bonus-cards-unearned.jpg` and `bonus-hover.jpg`.
The unearned state came from a private generated QA fixture imported only into
an isolated localhost origin, with reserved Bonus records 72–74 zeroed. Existing
earned-state fixture ribbons do not establish earned wins. The public game and
real player saves were not changed.

A separate fresh Cold Front board started at 150 sun. Planting Sun-shroom in
column 0, Chill-shroom in column 1 and Puff-shroom in column 2 of the middle row
left 50 sun. The healthy board was paused and saved through native Menu → Main
Menu → Leave. After full reload, title/profile selection and Bonus → Cold Front →
Continue → Back to Game, it restored the same 50 sun, all three plants, graves
and mowers. Chill-shroom retained its visible half-lidded eyes, new cap and
native body. Private proof is `fresh-save-before.jpg` and the full-board
`fresh-save-resumed.jpg`. This establishes current-Ice-body cap restoration
separately from the earlier Puff-body migration. A prior near-death attempt is
not credited because the zombie ate the plant before the post-Continue capture.

The `?testing=1` mute indicator remained checked. Owned test tabs 13, 14 and 15
were closed; the user's public tab 4 was untouched. Local implementation,
automated and visual/save criteria pass. Website-source packaging and hosted
publication remain independent release records. Earlier Lantern.2 builds,
1,333 checks and screenshots are not credited to this revision.
No completed battle, precise browser pulse measurement, subjective perfection
or exhaustive original-game parity is claimed.

## Historical Lantern.2 art-revision scope — visual result rejected, 2026-10-31

The user rejected Lantern.1's visual style and feel, its added Bonus tips and the
use of Survival thumbnail pictures. `0.2.6-web-lantern.2` attempted those concrete
issues. The user subsequently rejected its visual result and attack presentation;
the observations here retain their bounded functional scope. This release does
not establish user acceptance, perfect subjective art or exhaustive original-game
parity. [Revision criteria](ART-REVISION-GOAL.md) track the requested goal manually:
the goal tool rejected a new objective because the older parity goal remains
paused; that unfinished goal has not been marked complete.

Reference extraction used the authenticated bundled main.pak, without modifying
original images. Original Puff-shroom cap, body, eyes, blink and reanimation XML
provided exact dimensions, tracks, transforms and timing. Lantern-shroom now uses
the native Puff-shroom body/face and idle, blink and sleep animation, native
geometry, half-size Puff shadow and height offset. A cap-only edit uses the
original 81×53 cap canvas and exact per-pixel alpha contour; only its color
channels change. [Cap provenance](https://github.com/Caleb-Guyer/plants-vs-zombies-web/blob/136d440a4daa0ac4f876a7200eb13d4382405845/dist/content/lantern-shroom-cap-art.json) records
the built-in image edit, original cap identity and full prompt. The old full-body
bitmap, bespoke scaling motion and large ring are removed. Pulse presentation is
a short native cap-track color lift, with no new HUD.

The cap override is per reanimation instance. Encoded atlas images are resolved
through their native atlas entry to the original cap pixels. Previews render once
to a CPU MemoryImage. Cap and preview textures are disposed before their app and
graphics owners. Legacy Lantern.1 plants with no body reanimation reconstruct a
native Puff body; restored custom-image overrides, which the native image codec
stores as null, rebind before the paused Continue/background draw. These paths
preserve the existing saved pulse counters, health, placement and other state;
no save-field, mode, seed or challenge-definition IDs change.

The three Bonus cards have distinct 80×65 pictures composed from original game
resources: a conehead on the day lawn, mushrooms and a grave on the night lawn,
and Lantern-shroom with a chilled zombie. The Bonus branch no longer draws the
Survival thumbnail atlas. All added Bonus rule tips beneath/on hover over the
cards are removed; original unlock tooltips stay on their native paths.

All **seven native suites pass 1,333 checks**: 66 speed, 90 controls,
105 decks/cooldowns, 139 Cone Zone waves, 557 completion/rewards/navigation,
131 Night Shift and 245 Lantern-shroom. The updated suite exercises native cap
binding and legacy-body migration, no repeated allocations across 1,000 ensures,
portable plant-tail phase and image-null roundtrips, paused-draw cap restoration,
dead-body guards, actual Bonus tooltip behavior and distinct thumbnail dispatch.
It retains original Survival dispatch. These are controlled production-method
checks with no game/audio device and no pixel-equivalence claim.

The final coordinate-corrected Emscripten Release build passed in
**97.754 seconds**, with all **772 source files unchanged** during compilation.
The two affected native suites were rerun after the thumbnail-coordinate change;
all **1,333 native checks** match the current production source. All **fourteen
browser integration suites** pass, including the retained **eleven worker
scenarios**, saved-layout/catalog invariants, exact cap PNG/provenance/header
identity and transfer behavior.

The final engine-source package passes with **804 entries and 6,037,932 bytes**.
Both the complete upstream patch and Lantern.1 increment reconstruct every one of
the 772 source files byte for byte. Release manifests pin the final binaries,
source archive and patches. These results supersede the earlier 89.303-second
pre-release snapshot whose thumbnail framing was rejected.

The first native-size pixel review rejected the thumbnail framing: Cone Zone's
portrait was obscured by the fixture's trophy ribbon and the Night Shift/Lantern
Glow faces sat too low and clipped. Distinct pictures alone did not satisfy the
visual criterion. Only DrawBonusIcon coordinates were then adjusted. On the
final coordinate-corrected WASM, all three distinct pictures passed the visual
check: cone, zombie and mushroom faces fit inside their original frames and remain
visible around the fixture's trophy ribbons. Hover retained the native red title
without an added tip. Private proof is `outputs/pvz-lantern2-release/bonus-cards-final.jpg`
and `bonus-hover-final.jpg`. No initial card-framing pass is claimed.

The same bounded muted preview loaded an existing Lantern.1 checkpoint through
the native Continue flow. After Continue, the saved 50 sun, Sun-shroom, Puff-shroom
and Lantern-shroom appeared on the same night lawn. The revised Lantern-shroom's
native Puff body and brown cap were visible beside the original Puff-shroom with
matching field geometry. Private working proof is
`outputs/pvz-lantern2-release/legacy-continue.jpg` and `native-body-initial.jpg`.
This establishes the bounded legacy-body reconstruction observation, not precise
animation frame parity. The synthetic board later reached Game Over while code
review continued unattended; no completed battle or earned win is claimed.

The final muted preview then planted adjacent Sun-shroom, Lantern-shroom and
original Puff-shroom on a fresh board, leaving 50 sun. The new cap and native
body were compared at actual game size beside the original mushrooms; private
proof is `outputs/pvz-lantern2-release/plant-comparison-final.jpg`. Native Menu →
Main Menu → Leave saved that current-body board. After a full browser reload,
title/profile selection and Bonus → Lantern Glow, native Continue restored the
same 50 sun and all three plants, including the correct native body and cap.
Private proof is `native-save-resumed.jpg`. This verifies the bounded current-body
save/reload/cap-rebinding path alongside the separate legacy-body observation.
It does not measure precise animation dynamics or claim a completed battle.

The `?testing=1` mute indicator stayed checked through reload. The owned test tab
was closed; the user's public game tab was left untouched. Website-source
packaging and hosted verification are independent release records, separate from
these observed engine/browser results. Earlier Lantern.1 evidence below is
historical and its artwork was rejected by the user. Normal-player audio remains
available. Broad original-game parity playthroughs remain stopped.

Historical source: [Lantern.2 source](dist/source/pvz-portable-0.2.6-web-lantern.2-source.zip),
[complete upstream patch](dist/source/web-lantern.2.patch),
[Lantern.1 increment](dist/source/lantern1-to-lantern2.patch) and retained
[Lantern.1 parent source](dist/source/pvz-portable-0.2.6-web-lantern.1-source.zip).
Engine and build manifests pin exact release identities.

## Historical Lantern.1 release scope — artwork rejected, 2026-10-31

The user subsequently rejected this release's style and feel. The earlier agent
observations below are functional evidence, not approval of that visual match.

`0.2.6-web-lantern.1` adds Lantern-shroom and the optional Lantern Glow challenge.
The new mushroom costs 75 sun, recharges in 750 native ticks, and pulses every
400 active gameplay ticks. Within a 150-pixel radius of zombie centers, it applies
150 ticks of the native chill effect to eligible living grounded enemies, without
damage, stacking a speed multiplier or shortening stronger existing chill/freeze.
It is nocturnal. Sleeping, squished, dead, grabbed and inactive-gameplay plants do
not pulse. Existing Plant counters store the remaining pulse and visible glow;
no serialized object fields or native save formats are added.

Lantern-shroom appends seed ID 75 while retaining every previous SeedType value,
`NUM_SEED_TYPES=53` and the 49 original chooser entries. Its separate definition
and draw paths bypass the original 53-entry plant/reanimation caches. Its PNG is
decoded and downsampled once; native image disposal runs while the app and graphics
owners are still alive. The original 53 plant definitions remain intact. Artwork
is new, generated with the built-in image tool, and uses a transparent blue-green
mushroom with amber light. The exact published PNG, dimensions and full prompt
are recorded in [art provenance](https://github.com/Caleb-Guyer/plants-vs-zombies-web/blob/136d440a4daa0ac4f876a7200eb13d4382405845/dist/content/lantern-shroom-art.json); the native
sprite header embeds those same bytes. No additional HUD is introduced.

Lantern Glow appends mode 75 and reserved completion record 74 on the existing
Bonus page, beside Cone Zone and Night Shift. It uses the native night lawn,
150 starting sun, twenty authored waves and two flags. The fixed bank is
Sun-shroom, Puff-shroom, Fume-shroom, Lantern-shroom, Grave Buster and Doom-shroom.
Newspapers arrive on wave 5, poles on wave 8 and buckets on wave 15. Native graves
and final-wave grave rises remain. Original campaign progression, unlocks,
trophy totals and gold-sunflower routing are retained; all 74 prior challenge
definitions and both earlier bonus checkpoints/records stay independent.

The full Emscripten Release build passed in **127.343 seconds**, with all
**772 source files unchanged** during compilation.

All **seven native production-method suites pass 1,295 checks**: 66 speed,
90 controls, 105 decks/cooldowns, 139 retained Cone Zone waves, 557 completion,
rewards and navigation across all three Bonus modes, 131 Night Shift and
207 Lantern-shroom/Lantern Glow. The new suite executes the actual pulse routing,
eligibility, cadence, range, native chill duration and preservation of stronger
chill, cost/recharge and custom seed drawing dispatch. Actual PortableSaveContext
and SyncPlantTailPortable code roundtrips seed 75, pulse phase and glow through a
controlled little-endian byte transport, then verifies the same future pulse.
These fixtures initialize no real game or audio device and do not certify pixels.

All **fourteen browser integration suites pass**, including the retained
**eleven real-worker scenarios**, distinct mode-75 save-transfer bytes and current
native source/report coherence. The artwork check verifies the exact public PNG,
RGBA dimensions/provenance and equality to the native embedded bytes.

The final engine-source package passes with **804 entries, 6,034,293 bytes and
772 production source files**. Both the full upstream patch and Night.1 increment
reconstruct every current source byte exactly. The archive contains full source,
recipes, tests and matching receipts; it avoids duplicating the large PNG-bearing
patches internally. Exact patches remain separately served and pinned in the
release manifests, and full source builds without applying a patch. An earlier
local staging package is not the release input.

The owned muted preview loaded the final Lantern.1 WASM with the existing
synthetic QA-Boss profile. Bonus displayed the third Lantern Glow card beside
Cone Zone and Night Shift, using the native card/title treatment without extra
UI. Launch showed the original night lawn, nine graves, 150 sun, all six intended
packets, the new Lantern-shroom sprite in its packet, two flags and the 1x control.
Planting Lantern-shroom spent 75 sun, Sun-shroom spent 25 and Puff-shroom spent
zero, leaving 50 sun. The new sprite appeared correctly on the lawn and was awake.
Native Menu → Main Menu → Leave saved and returned to the main menu. The fixture
pre-populates completion records, so trophy ribbons are not evidence of an earned
win. Private working screenshots are `outputs/pvz-lantern1-release/bonus-cards.jpg`
and `lantern-game.jpg`, not downloadable GitHub files. No completed battle is
claimed.

After saving, the preview reloaded and selected Lantern Glow again through the
existing QA-Boss profile and Bonus page. The native Continue prompt appeared;
Continue restored the same Lantern-shroom, Sun-shroom and Puff-shroom on the night
lawn, with the saved graves, wave progress and 50 sun. The new packet and lawn
sprite still rendered correctly after reload. A nearby zombie in the adjacent
row displayed the native blue chill visual, with no Ice-shroom or Snow Pea in the
bank. This is a bounded observation of the native chill visual, not a browser
measurement of exact pulse cadence, duration or range. Automated production-method
checks establish those timing and eligibility properties. Private proof is
`outputs/pvz-lantern1-release/lantern-continue.jpg` and `lantern-resumed.jpg`.

Final website-source packaging and hosted release verification remain independent
observations. Historical Night.1 results below are not Lantern.1 runtime evidence.
Agent testing uses `?testing=1`; normal-player audio remains available. No broad
original-game parity playthrough is a release gate.

Current corresponding source: [Lantern.1 source](dist/source/pvz-portable-0.2.6-web-lantern.1-source.zip),
[complete upstream patch](dist/source/web-lantern.1.patch),
[Night.1 increment](dist/source/night1-to-lantern1.patch) and retained
[Night.1 parent source](dist/source/pvz-portable-0.2.6-web-night.1-source.zip).
Release identities belong in [engine provenance](dist/game/engine-provenance.json)
and the [build record](dist/source/build-provenance.json).

## Historical Night.1 release scope, 2026-10-31

`0.2.6-web-night.1` adds the optional **Night Shift** card beside Cone Zone on the existing native Bonus page. It uses the original night lawn, 150 starting sun, no falling sky sun, twenty authored waves and two flags. Its six fixed packets are Sun-shroom, Puff-shroom, Fume-shroom, Grave Buster, Ice-shroom and Doom-shroom; normal costs, recharge, nocturnal behavior and sun production remain native. Normal zombies open the level, with newspapers on wave 4, screen doors on wave 8 and buckets on wave 15. The authored wave table peaks at sixteen zombies including its flag bearer. Native nighttime setup adds nine graves, and the standard final-wave grave rise can add zombies outside that table. No new plant or zombie mechanics, artwork or information overlay is introduced.

Night Shift appends mode 74, its own native checkpoint and reserved completion record 73. The prior 73 challenge definitions, including Cone Zone, retain their identities; Bonus page IDs, original campaign progression, unlock flags, original trophy totals and gold-sunflower routing remain unchanged. The saved Board, Challenge, SeedBank, SeedPacket and PlayerInfo layouts and serializer remain unchanged. Polish.1's save worker and concise native controls remain in place.

Six focused native production-method suites pass **952 checks**: 66 speed, 90 controls, 105 decks/cooldowns, 139 retained bonus waves, 421 completion/rewards/navigation and 131 Night Shift. Night Shift coverage executes the production background setup with five lawn lanes and nine graves, night/grave predicates, sky-sun suppression, native mushroom sleeping and Sun-shroom sun production, fixed bank, authored waves, roster and invalid-buffer cases. Completion coverage exercises both bonus modes, independent records/checkpoint names, first/replay awards, unchanged original trophies/campaign/gold-sunflower decisions, cancel/continue and confirmed restart routing. Native tests initialize no game or audio device.

The full Emscripten Release build passed in **134.523 seconds**, with all **768 source files unchanged** during compilation. All **fourteen browser integration suites** pass, including the retained **eleven real-worker scenarios** and current-source coherence for the 952 native checks. The transfer suite roundtrips distinct CRC-valid original, Cone Zone and Night Shift checkpoints, so one bonus checkpoint cannot silently alias the other.

Engine-source packaging passes with **799 archive entries and 4,791,403 bytes**. Both the full upstream patch and the Polish.1 increment reconstruct every current source byte exactly through `git apply`. Artifact identities are pinned in the release manifests below. This engine-source check is separate from the final website-source package check.

The owned muted preview loaded the final Night.1 WASM with the existing synthetic QA-Boss profile and forced-mute indicator set. Mini-Games → Bonus displayed the second matching Night Shift card, with the native night thumbnail beside Cone Zone. Launch showed the original night lawn, nine graves, 150 sun, all six intended packets, the native two-flag progress bar and 1x control. Planting a Sun-shroom spent 25 sun, leaving 125; Puff-shroom planting spent zero. Both mushrooms were awake. Native Menu → Main Menu → Leave saved and returned to the main menu. The fixture pre-populates completion records, so trophy ribbons in these screenshots are not evidence of an earned Night Shift win. Private working screenshots are `outputs/pvz-night1-release/bonus-cards.jpg` and `night-game.jpg`, not downloadable GitHub files.

After that save, the preview reloaded and selected Night Shift again through the existing QA-Boss profile and Bonus page. The native Continue Game prompt showed the saved 125 sun and Sun-shroom on the night lawn with graves and the wave bar. Continue resumed that same board with 125 sun and the same Sun-shroom. The Puff-shroom had already been eaten before saving, so no Puff-shroom persistence is claimed. Private proof is `outputs/pvz-night1-release/night-continue.jpg` and `night-resumed.jpg`. This establishes the bounded native save/reload/Continue path, not a completed battle.

Final website-source packaging and hosted Night.1 verification remain separate observations. Earlier Polish.1 results below are historical parent evidence. Agent browser testing uses `?testing=1`, while normal-player audio remains available. Broad original-game parity playtesting remains stopped.

Current corresponding source: [Night.1 source](dist/source/pvz-portable-0.2.6-web-night.1-source.zip), [complete upstream patch](dist/source/web-night.1.patch), [Polish.1 increment](dist/source/polish1-to-night1.patch) and retained [Polish.1 parent source](dist/source/pvz-portable-0.2.6-web-polish.1-source.zip). Release identities belong in [engine provenance](dist/game/engine-provenance.json) and the [build record](dist/source/build-provenance.json).

## Historical Polish.1 release scope, 2026-10-31

`0.2.6-web-polish.1` retains Content.1 gameplay and the earlier QoL and renderer behavior. It adds no gameplay features. Native dialogs use **More Options**, **Controls** and **Backups**, concise labels and a deck preview made from original seed-packet artwork. The Bonus page uses the standard challenge grid/card layout; the challenge uses the native flag banner. Browser backup rows use date labels on stone buttons.

The save adapter captures written filesystem data on the main thread, then transfers it to a dedicated worker. CRC/checksums, history validation and IndexedDB transactions run in the worker/shared core. The existing five-second autosave interval, schema 2, eight-version history limit, native save layouts, revision guards, corruption recovery and durable callback semantics remain unchanged. Startup failures fall back safely before any operation; a failure or timeout after startup rejects uncertain writes without retrying through a second backend.

The final native alignment rebuild passed in 101.496 seconds with all 767 source files unchanged during compilation. Five production-method suites pass **678 checks**: 66 speed, 90 controls, 105 decks/cooldowns, 139 bonus waves and 278 completion/rewards/navigation. The controls report was rerun successfully after the final alignment change, before that rebuild. All **fourteen browser integration suites** pass, including **eleven real-worker scenarios** covering durable queue ordering, transferred-byte safety, stale-tab rejection, failed commits, corruption recovery, main-thread responsiveness under a gated worker, unsupported versions, safe startup fallback and fail-closed worker death/timeouts.

The Node benchmark uses synthetic bytes following public compiled-file size distributions and mocked IndexedDB, with eight backups. For the representative cache and cache-plus-1-MiB-board datasets, the old instrumented synchronous transaction blocks reached **177.38 ms / 305.80 ms**. New main-thread capture plus transferable dispatch measured **1.60 ms / 2.51 ms median**, with **1.87 ms / 2.76 ms maxima**. These compare the work left on the main thread; they are not total save latency. Heavy work continues asynchronously in the worker. Evidence is recorded in `outputs/stutter-audit/benchmark-results.json` and `worker-benchmark-results.json` in the private working records. This is a Node fixture measurement, not browser FPS, a browser frame-time trace or proof that every source of stutter is eliminated.

A bounded muted preview loaded the worker and existing schema 2 synthetic QA-Boss profile. On the final WASM (`852d8a02…`), screenshots confirmed the centered More Options form, Controls screen and native Bonus page with its standard top-left card and no rules paragraph. In the same preview, Survival: Day's chooser selected Sunflower, Peashooter, Wall-nut and Cherry Bomb; saving the Day deck through Decks displayed all four native seed packets cleanly, without count, name-list, helper or success text. No battle was started. Private working evidence: `outputs/pvz-polish-more-options.jpg`, `pvz-polish-controls.jpg`, `pvz-polish-bonus.jpg` and `pvz-polish-decks.jpg`; these screenshots are not downloadable GitHub files. Final website-source package verification and hosted Polish.1 verification remain separate and are not credited here. No new campaign win, full bonus battle, new ability, authentic-original runtime comparison or full-parity result is claimed. Broad manual gameplay remains stopped; normal-player audio stays available and agent browser checks use `?testing=1`.

Current corresponding source: [Polish.1 source](dist/source/pvz-portable-0.2.6-web-polish.1-source.zip), [complete upstream patch](dist/source/web-polish.1.patch), [Content.1 increment](dist/source/content1-to-polish1.patch) and retained [Content.1 parent source](dist/source/pvz-portable-0.2.6-web-content.1-source.zip). The engine source package passes staging/package checks with 795 entries and 767 source files; its SHA-256 is `aba3e5a40370a81826c6dc61e5f04ad1742dda405bffc3da86e24edcd981391d`. Full and incremental patches each reconstruct the current source bytes exactly through `git apply`. The website source includes `dist/save-storage.js`, `dist/save-storage-core.js` and `dist/save-storage-worker.js`; its final package check is distinct from these engine-source results. Final release hashes are recorded together in [engine provenance](dist/game/engine-provenance.json) and the [build record](dist/source/build-provenance.json); the historical identities below retain their original scope.

## Historical Content.1 release scope, 2026-10-31

`0.2.6-web-content.1` adds one optional level, Cone Zone, under Mini-Games → Bonus.
It uses the existing daytime lawn, six classic plants, normal sun production,
150 starting sun and twenty authored waves with two flags. Normal zombies lead
into coneheads, occasional pole-vaulters and bucketheads. No new plant/zombie
mechanics or new artwork are introduced.

The bonus appends mode 73 and page 4, retaining all original IDs and 72 original
challenge definitions. Its checkpoint uses the existing native mode-specific
filename; its completion uses reserved record 72 in the existing array of 100 records.
Original campaign progression, trophy totals and unlock/award routing stay on
their existing paths. Bonus victory cannot award the original gold sunflower.
Saved Board, Challenge, SeedBank, SeedPacket and PlayerInfo layouts and the
serializer are retained byte for byte. Focused automated tests and the bounded
silent new-feature check do not certify complete original-game parity.

The full Content.1 Emscripten Release build passed in 162.386 seconds with all
767 source files unchanged during compilation. Five production-method suites
passed 678 checks: 66 speed, 90 controls, 105 decks/cooldowns, 139 bonus waves and
278 completion/rewards/navigation. The bonus checks cover first/replay wins,
unchanged original trophy totals and awards, original mode IDs, exact native
cancel/continue behavior, and checkpoint/profile preservation. Both full and
incremental source patches reconstructed every current source byte. Published
source and binary hashes are recorded together in the manifests.

All thirteen browser integration suites passed, including the independent bonus
checkpoint in save export/import. A bounded local UI check with `?testing=1` and
generated profiles verified the original-style Bonus footer/page, daytime lawn,
150 starting sun, all six fixed packets and normal sunflower planting/cost. After
saving through the native Main Menu and fully reloading the browser, Continue
restored the same sunflower and 100 remaining sun. No full bonus battle or broad
original-campaign playthrough was performed. The unlocked QA fixture pre-fills
completion records; first-clear/replay rewards were tested by the native suite.

## Historical QoL.2 release scope, 2026-10-31

`0.2.6-web-qol.2` retains the renderer and 1x/2x control and adds six authorized QoL features: focus-loss/hidden-tab auto-pause with explicit resume; remappable seed, shovel and speed keys (defaults `1`–`9`, `0`, `S`, `F`); eight named plant decks per profile; remembered speed enabled by default; optional numeric seed cooldowns; and browser-local recovery of up to eight previous save versions. New profiles start at 1x, cooldown numbers start off, and Space/Escape retain the original pause/menu actions. Deck loading preserves forced picks and respects unlocks, Imitater and capacity.

QoL settings and decks are per-profile files included in save export/import. Recovery history stays in this browser, restores all profiles and backs up current progress first. Existing native profile and board-save formats remain unchanged. The focused automation covers production speed/control/deck/cooldown behavior and browser save storage, recovery and transfer; it does not initialize game audio. Browser checks remain forced silent with `?testing=1`.

The final Emscripten Release build passed in 101.829 seconds with all 766 source files unchanged during compilation. The focused production tests passed 261 checks (66 speed, 90 controls/settings, 105 decks/cooldowns); all 13 browser integration suites passed, including version migration, checksum corruption recovery, stale-tab protection, failure rollback and QoL-file export/import. Full and incremental patches independently reconstructed every current source byte. Published source and binaries are pinned together in the manifests.

A bounded silent local UI check used synthetic profiles: enabled cooldown numbers, remapped seed slot 1 to Z, planted a sunflower with that binding, toggled 2x with F, saved a ten-plant Day deck, and restored an automatic backup back to the title screen. This is feature smoke-test evidence only.

This section records the current feature and validation scope, not a new whole-game parity result. Broad campaign playtesting remains stopped. The QoL.1 and Software.10 observations below retain their original builds and scope.

## Historical QoL.1 speed control, 2026-10-31

`0.2.6-web-qol.1` retains the Software.10 renderer and adds a native 1x/2x gameplay toggle. Its full Emscripten Release build passed in 132.228 seconds with all 757 input source files unchanged during compilation. Four source paths differ from Software.10: the version file, Board.cpp, LawnApp.cpp and LawnApp.h. Board.h and the save serializer are byte-identical to the parent.

The focused harness compiled actual production method bodies and added input handlers through Emscripten and passed 64 checks with zero failures. It covers exact 1x/2x update counts, switching back, holding seeds/tools, pause/dialog/chooser exclusions, mid-update level/menu/board transitions, valid press/release behavior and 1x reset for a new/resumed board. GitHub deployment also reruns these production-method tests using its native C++ compiler. These tests do not initialize the game, renderer or audio.

A short private `?testing=1` browser check used a generated QA profile in Survival: Day. With ten selected packets and the shovel visible, the native stone button fit directly below Menu. Clicking changed 1x to the pressed 2x state; the original Menu opened, Back to Game retained 2x, and a second click restored 1x. No level was completed and no earned unlock or full-mode result is claimed. Normal-player audio code was retained and output remained forced silent during the check.

The Software.10 descriptions below remain historical. Broad campaign playtesting remains stopped; this feature receives only targeted validation.

The frozen public v18 baseline uses **0.2.6-web-software.10** (source `877bbbf3f001fc2f9202700ba790e27665179e92`). Software.10's own scoped private first-level and save-transfer observations are recorded below; prior observations retain their named build and scope. Normal players have audio; agent tests use `?testing=1`. No complete 1:1 or authentic-original runtime result is claimed. Further manual validation stopped at the user's request on 2026-10-31; historical active-goal statements below do not authorize resuming it.

GitHub Pages release, 2026-10-31: [workflow 41230962473](https://github.com/Caleb-Guyer/plants-vs-zombies-web/actions/runs/41230962473) succeeded for commit `5ba4d0d7279145dcbdfa3e91d19b91218ef1c04a`. The normal [Play URL](https://caleb-guyer.github.io/plants-vs-zombies-web/) is live. A `?testing=1` check automatically reached the original Click to Start title without a file prompt; index/glue/manifest matched local bytes and WASM returned HTTP 200 as `application/wasm` (7,411,823 bytes). No campaign gameplay was performed on GitHub, and this is not full-parity or original-runtime comparison credit.

The detailed QA descriptions below are the frozen v18 evidence snapshot. They retain their original capture-time scope, including earlier limits; they are not a claim that later validation or the full parity goal is complete.

## Historical Software.10 source/build and private UI/save evidence, 2026-10-29

Software.10 changes exactly three source paths relative to Software.9: the version file, callback admission and the narrow native-screen pixel include; all other 754 of 757 engine files are byte-identical. Its isolated full Release compile/link passed with exit 0 in 135.885 seconds. The paired actual-code suite runs 2,372,278 assertions per variant: frozen Software.9 has 47,270 and 50,870 expected additive differences in the two families, while Software.10 has zero failures. The 90 unchanged expanded callback bodies include both normal dispatchers and remain byte-identical to Software.9.

The two corrections apply only to guarded dedicated CPU-screen RGB888 nearest-additive routes: texture-alpha with constant original vertex color plus global color, and opaque texture with global color. The combined route preserves the original global/256 vertex prepass and second per-pixel global multiplication; the opaque route ignores stored texture alpha before global modulation. Existing exact target-buffer/pitch, dimensions, UV, valid-channel and offscreen fallbacks remain. Geometry, clipping, scan conversion, interpolation, game rules and audio are unchanged. No ordinary scene using either new additive route has been established; conditional API tests do not prove original framebuffer or full renderer parity.

Historical Software.10 corresponding source is `dist/source/pvz-portable-0.2.6-web-software.10-source.zip` (807 archive entries, 757 engine files); `web-software.10.patch` is the complete raw-upstream patch. `software9-to-software10.patch` is the separately labeled three-path increment from Software.9. The full source builds without applying a patch. Historical packages, upstream baseline, build provenance and licenses remain available. Approved asset payloads remain separate from code/source archives and are included only in the full-runtime distribution. The source archive SHA-256 is `62bf399ffeedde34ec9946b4aece8fce4cb4ffb119739d3b55d2025bc4cda261`.

Software.10's own muted private browser check used a fresh Web10QA profile without generated QA fixtures. Native CPU mode was selected before Adventure and remained unchecked on Options reopen during 1-1. The first attempt completed 1-1 without Restart or Game Over: Peashooter placement, sun collection and projectiles were observed, the Sunflower reward was collected, and Next Level entered 1-2. One Sunflower was planted in the leftmost middle cell, with zero sun remaining.

During 1-2, CPU/hardware/CPU requests were applied and each setting was checked through a separately reopened native menu, retaining the visible board. Original Main Menu/Leave and Quit/confirmation reached a fresh title before export. Import into a separate fresh browser origin showed Save imported; exporting again before Start preserved all four payloads and 44,120 expanded bytes exactly, including the 42,863-byte Adventure checkpoint with internal CRC32 `ec6bbc32`. The fresh profile records level 2 and finishedAdventure 0; this is first-level progress, not a completed campaign. After Start, the imported Web10QA 1-2 menu and actual Continue prompt were observed; Continue restored the visible one-Sunflower/zero-sun board, and its native menu showed CPU unchecked.

These are private Software.10 first-level and scoped save-transfer/visible-Continue results. No 1-2 win, complete actor enumeration, ordinary invocation of either new additive route, hardware combat, authentic-original/public-runtime comparison or dense-scene performance result is credited. The five-to-thirteen-minute chooser/download tool waits are not game-performance measurements. Earlier Software.9/8/7 gameplay, wins and persistence remain historical and do not transfer to Software.10. All 228 coverage entries, all 50 Adventure levels and the full original roster, modes and abilities remain required; authentic-original runtime comparisons remain zero and exact 1:1 parity remains incomplete. Normal-player audio and forced-quiet agent testing are unchanged.

The focused paired suite compiles actual callbacks and extracted screen context/virtual boundaries with flat-triangle/image/app doubles. It covers ordinary and additive controls, constant/fractional channels, global alpha, effective-alpha boundaries, saturation and invalid/gradient/offscreen/buffer-pitch fallbacks. These are bounded arithmetic and preservation checks, not native geometry/cache reconstruction or an ordinary additive-scene trace. Older broad suites were not rerun as Software.10 results.

## Historical Software.9 source/build and initial private UI evidence, 2026-10-28

Software.9 changes only the version file and callback admission relative to Software.8; the other 755 of 757 engine files are byte-identical. Its isolated Release compile/link passed with exit 0 in 136.647 seconds. The paired actual-code suite runs 92,637 assertions per variant: frozen Software.8 has 24,880 expected differences, and Software.9 has zero failures. All 91 other expanded callback bodies, including the matching normal callback, remain byte-identical to Software.8.

The correction admits only the dedicated CPU-screen RGB888, texture-alpha, vertex-only nearest ADDITIVE specialization with equal input vertex colors. It reuses the unchanged pixel/sampler math and existing exact-buffer/pitch, complete-dimension, UV and current-channel guards; clipping, geometry, interpolation and context ownership remain unchanged. Nonconstant input colors and other unsupported inputs retain the Software.8 path. An ordinary additive scene has not been established; the CPU Pause/Newspaper source route uses the already-matching normal callback.

Per variant, the focused suite comprises 5,184 normal, 5,184 additive, 53,824 extra arithmetic/boundary and 28,445 state assertions. Frozen Software.8 has 2,160 additive and 22,720 extra expected failures; Software.9 has zero. The suite compiles actual callbacks and extracted screen RAII/virtual boundaries, with base drawing and triangle geometry supplied by doubles. Fractional constant channels, the effective-alpha-240 threshold, saturation, flattened nearest UV boundaries and invalid/gradient/offscreen/buffer-pitch fallbacks are scoped controls. It does not prove native geometry, cache/device recovery, an ordinary additive scene or a full framebuffer. Earlier broad suites were not rerun as Software.9 results.

Historical Software.9 corresponding source is `dist/source/pvz-portable-0.2.6-web-software.9-source.zip` (806 archive entries, 757 engine files); `web-software.9.patch` is the complete raw-upstream patch. `software8-to-software9.patch` is the separately labeled two-path increment from Software.8. The full source builds without applying a patch. Historical packages, upstream baseline, build provenance and licenses remain available. Approved asset payloads remain separate from code/source archives and are included only in the full-runtime distribution. The source archive SHA-256 is `b4ca8b710fe2c61ead0ab5ee1f1a4dffbae92e7c9c705b8ac2e3c4e0f4f83fc4`.

Software.9's own muted private browser check reached the automatic ready title and Information/version/source links, retained the five icons, and installed six generated profiles through ordinary More/Advanced controls. With QA-Boss selected, native 3D Acceleration was changed from checked to unchecked and remained unchecked on Options reopen. The first Vasebreaker puzzle showed 25 unopened vases and the fixture's 99,990 coins. Canvas Space opened GAME PAUSED with the Newspaper animation visible at two times; Resume Game returned to the same 25-vase board. Original Main Menu/Leave and Quit/confirmation returned to a fresh ready title; Start/Options still showed CPU unchecked. This verifies scoped normal pause/resume and CPU-setting persistence, not puzzle checkpoint restoration or earned progress.

The error-level query and `Failed to find track` filter (30 entries each) were empty; this does not certify the entire log. Final normal Quit reached a ready title before the private tab was closed and its owned loopback server stopped.

At that initial Software.9 UI checkpoint, no vases were opened and no combat, finite win, earned unlock, corrected-additive invocation, hardware/fullscreen roundtrip, save-export byte comparison, performance result or authentic-original/public-runtime comparison is credited. The pause animation is a normal-path preservation sample, not a traced additive scene or native-frame comparison. All 228 coverage entries, 50 Adventure levels and every original plant, zombie, mode and ability remain required; authentic-original runtime comparisons remain zero and the full 1:1 goal remains active.

## Historical Software.8 source/build and private UI evidence, 2026-10-28

Historical Software.8 changes four source paths relative to Software.7; all other 753 of 757 files remain byte-identical. Its isolated Release compile/link passed with exit 0 in 127.734 seconds. The paired actual-code AA suite runs 10,866 assertions per variant: Software.8 has zero failures; frozen Software.7 has 1,168 expected failures, including 888 differing pixels. These are focused source/build checks, not new gameplay or original-runtime comparisons.

The Vasebreaker Hammer now requests the original track name `anim_open_pot`. The bundled asset already selected that track through index-0 fallback, so the established correction removes an invalid lookup/log message without claiming changed frames or timing. A separate CPU-screen override matches the original nonaxis additive-AA no-op and auxiliary-cache cleanup only for the reviewed forced-opaque, nonvolatile raw screen state. It retains the authoritative framebuffer and dirty/drawn state; other states and normal/axis drawing retain Software.7 behavior. No ordinary game caller of that AA API has been established. Software.8's own scoped private browser observations follow; original-runtime comparisons remain incomplete.

Software.8's own muted private browser check observed automatic file-free startup, Information/version and matching source links, and six generated profiles installed through More. The native 3D Acceleration checkbox remained unchecked (CPU mode) on Options reopen and after normal Quit/reload. In the first Vasebreaker puzzle, two green vases released Snow Pea packets; they were planted at c0/r1 and c0/r2, leaving 23 vases. Original Menu/Main Menu/Leave, Quit, a fresh ready title and Puzzle/Continue visibly restored those 23 vases, two Snow Peas and the fixture's 99,990 coins. This is a scoped visible checkpoint pass, not an exported-byte comparison or earned progress.

The retrieved `anim_pot_open` and missing-track filters (50 entries each), and the error-level query (30 entries), were empty; this does not certify the entire log. No mid-swing Hammer frame was captured: the Hammer-named image shows debris and a seed packet. No Software.8 finite win, released-zombie combat, exact animation timing, native pixel equality, direct corrected-AA invocation, hardware/fullscreen roundtrip or performance result is credited. These are private Software.8 observations, not public or original-runtime validation.

Final private cleanup used normal Leave/Quit and reached title artwork with LOADING, then closed the private tab and stopped only its owned loopback server. It did not establish a second ready-title state; the earlier checkpoint cycle did observe the ready title. Producer source/archive metadata remains its unchanged as-built snapshot; later UI evidence is separate.

Historical Software.8 corresponding source is `dist/source/pvz-portable-0.2.6-web-software.8-source.zip` (757 engine files); `web-software.8.patch` is the complete upstream patch and `software7-to-software8.patch` is the four-path increment. Software.7's large callback/context and retained-suite results below are historical; those full suites were not rerun as Software.8 results. All 228 coverage entries, 50 Adventure levels and the full original content/behavior goal remain in scope, with authentic-original runtime comparisons still zero.

Public v15 preserved the three approved XML resource files' original CRLF bytes in Git and added the matching attributes rule, closing the fresh-checkout checksum blocker without changing the Software.7 runtime. GitHub Pages publication succeeded on 2026-10-31 through [release workflow 41230962473](https://github.com/Caleb-Guyer/plants-vs-zombies-web/actions/runs/41230962473). The bounded hosted startup check does not establish full game parity. The user authorized publication of the current build on 2026-10-31 while full 1:1 parity remains unverified; publication does not mark that goal complete.

Historical private Software.7 later completed the third Zombiquarium attempt and the five-flag Survival: Day (Normal) run, each with reward pickup and return to its settled catalog. Prefilled profiles prevent earned-unlock claims. These two specific wins, Software.7's basic renderer/save checks and Software.5's To the Left win do not transfer to Software.8 or Software.9. Software.8's own scoped Vasebreaker/persistence observations above are separate; no finite win, corrected-AA invocation, performance, export-byte, original-frame or public-gameplay pass is inferred.

## Historical public builds and test scope

The public v6/v7 engine changed exactly `src/Lawn/Widget/ZombatarWidget.cpp` and its `.h`, `src/LawnApp.cpp`, and `src/SexyAppFramework/platform/emscripten/Window.cpp`. It preserved native saved-record avatar composition/`SaveDraft`, added browser JPEG download and synchronized native Full Screen status with browser status. Public v8/parity.3 adds `src/Lawn/Zombie.cpp` and `src/SexyAppFramework/imagelib/ImageLib.cpp`/`.h`, seven changed source paths in total. The parity.4 candidate changes only export initialization relative to parity.3, retaining those seven paths and byte-identical compositor/`SaveDraft` functions. These are local rebuilds, not unmodified official binaries. Historical parity.4 corresponding source and patch remain retained; historical Software.6 identities and checks are recorded below; current Software.10 source/build scope is recorded above.

Runtime checks belong to their named builds. They are not automatically recertified by the next candidate. The v5 portrait/JPEG and garden/Tree persistence checks, v6 repeat-Adventure 2-1 win/restored Level 2-2, and v7 keyboard checks remain scoped below. V7 first I, Zombie attempts establish placement, brain-consumption and observed loss paths, with no puzzle win. The original-byte comparisons/isolated harnesses and the separate parity.3 browser export/retry/reload checks have distinct scopes; none is an authentic original-game runtime capture. Normal players retain working audio controls; agent browser tests use `?testing=1` and native reference attempts use a temporary output-mute guard.

## Source inventory

| Area | Implemented upstream / browser shell | Historical baseline and explicitly scoped custom-build checks |
| --- | --- | --- |
| Original presentation | 800×600 canvas, resource-driven UI, fonts, backgrounds, plant/zombie reanimations and effects | Current title and original 5-10 roof/boss sequence observed; historical v2 gameplay checks below; full comparison pending |
| Adventure | Five areas × ten levels; day, night, pool, fog, roof and final boss | Historical v2 1-1 completion; public v6 repeat 2-1 twenty-wave/two-flag completion and fresh-reload Level 2-2; historical v3 fog/roof samples and local 5-10 boss opening/save transfer; full campaign pending |
| Plant/zombie catalog | 49 standard plants including Imitater; 26 standard zombie Almanac entries including Dr. Zomboss; seven further implemented zombie variants (33 active types); four special plant forms | Static roster/name/base-resource coverage audited; historical v2 Almanac and scoped v6 night mechanic samples below; full individual behavior parity pending |
| Minigames | Twenty standard minigames, plus hidden challenge content | Historical v2 catalog and Wall-nut Bowling sample; full coverage pending |
| Puzzle | Nine+endless Vasebreaker; nine+endless I, Zombie | Historical v2 catalog/vase-break sample; public v8 first Vasebreaker complete repeat win/reward; public v7 first I, Zombie attempts lost at 2/5 and 3/5 brains; wider coverage pending |
| Survival | Normal/hard scenes and pool endless; hidden additional endless scenes | Historical v2 catalog and pool scene; continued play pending |
| Metagame | Shop, Zen Garden, Tree of Wisdom, achievements, profiles and Zombatar | Historical Almanac/profile and scoped Zombatar checks; public v5 Marigold purchase/first growth, canceled-sale quotes, garden backgrounds, one Tree feed and fresh-reload garden/tree field persistence observed; broader behavior pending |
| Browser adaptation | Automatic verified bundled startup, asset cache/retry, five utility icons, more popup, save-only transfer, 4:3 fitting | Historical file-free controls/save checks; historical private Software.9 ready title, five icons, CPU preference and normal pause/resume scoped above; Software.10 fresh 1-1 win and exact four-payload transfer/visible 1-2 Continue scoped above; Software.8 visible Vasebreaker checkpoint remains historical |
| Player audio / quiet QA | Native audio with no audio changes in the scoped export patch; switchable browser master mute; `?testing=1` forces silent test output | Current nonzero native Options values, settings persistence and automated controls/migration checks; audible listening not performed |

Evidence: upstream `src/GameConstants.h`, `src/ConstEnums.h`, `src/Lawn/Widget/ChallengeScreen.cpp`, `src/Lawn/Challenge.cpp`, `src/Lawn/ZenGarden.cpp`, associated widgets, and the browser shell in the included upstream source ZIP.

## Roster counting and canonical mappings

This is a static audit of the pinned 0.2.6 source, corroborated by name keys and base reanimation paths in the privately selected original Steam GOTY pack. It adds no runtime behavior test. `NUM_SEEDS_IN_CHOOSER` and `NUM_ALMANAC_SEEDS` are 49; `NUM_ALMANAC_ZOMBIES` is 26. The 26 already include Flag Zombie, Backup Dancer, Imp and Dr. Zomboss. Adding the boss again incorrectly implies 27 standard cards.

| Plant IDs / category | Original names |
| --- | --- |
| 0–7 / first eight | Peashooter, Sunflower, Cherry Bomb, Wall-nut, Potato Mine, Snow Pea, Chomper, Repeater |
| 8–15 | Puff-shroom, Sun-shroom, Fume-shroom, Grave Buster, Hypno-shroom, Scaredy-shroom, Ice-shroom, Doom-shroom |
| 16–23 | Lily Pad, Squash, Threepeater, Tangle Kelp, Jalapeno, Spikeweed, Torchwood, Tall-nut |
| 24–31 | Sea-shroom, Plantern, Cactus, Blover, Split Pea, Starfruit, Pumpkin, Magnet-shroom |
| 32–39 | Cabbage-pult, Flower Pot, Kernel-pult, Coffee Bean, Garlic, Umbrella Leaf, Marigold, Melon-pult |
| 40–47 / upgrades | Gatling Pea, Twin Sunflower, Gloom-shroom, Cattail, Winter Melon, Gold Magnet, Spikerock, Cob Cannon |
| 48 / included in 49 | Imitater; rendered separately from the Almanac's 48-card rectangular grid |
| 49–52 / outside ordinary chooser | Explode-o-nut, Giant Wall-nut, Sprout, left-facing Repeater (`SEED_LEFTPEATER`, original name key `REPEATER`) |

| Zombie IDs / category | Original names or explicit source mapping |
| --- | --- |
| 0–4 | Zombie, Flag Zombie, Conehead Zombie, Pole Vaulting Zombie, Buckethead Zombie |
| 5–9 | Newspaper Zombie, Screen Door Zombie, Football Zombie, Dancing Zombie, Backup Dancer |
| 10–14 | Ducky Tube Zombie, Snorkel Zombie, Zomboni, Zombie Bobsled Team, Dolphin Rider Zombie |
| 15–19 | Jack-in-the-Box Zombie, Balloon Zombie, Digger Zombie, Pogo Zombie, Zombie Yeti |
| 20–24 | Bungee Zombie, Ladder Zombie, Catapult Zombie, Gargantuar, Imp |
| 25 / included in 26 | Dr. Zomboss (`ZOMBIE_BOSS`) |
| 26–31 / additional ZomBotany variants | Peashooter-headed (`ZOMBIE_PEA_HEAD`), Wall-nut-headed, Jalapeno-headed, Gatling Pea-headed, Squash-headed and Tall-nut-headed; these descriptive mappings share the original generic `ZOMBIE` name key |
| 32 / additional Survival variant | Giga-gargantuar (`ZOMBIE_REDEYE_GARGANTUAR`, original name key `REDEYED_GARGANTUAR`) |

There are **33 implemented active zombie types**, including the 26 standard Almanac entries. `ZOMBIE_CACHED_POLEVAULTER_WITH_POLE` is a render-cache alias outside `NUM_ZOMBIE_TYPES`, not another gameplay species. Team members, armor loss and aquatic/accessory states do not each add a new roster entry. The six plant-head variants are selected by ZomBotany/ZomBotany 2; Giga-gargantuar is implemented for later Survival. Special plants and variants remain part of the intended original scope even when they have no ordinary chooser/Almanac card.

Primary source points: `src/ConstEnums.h:1037–1113,1343–1378`; `src/Lawn/Plant.cpp:48–102`; `src/Lawn/Zombie.cpp:80–114`; `src/Lawn/Widget/AlmanacDialog.h:29–30`; plant/zombie draw loops in `AlmanacDialog.cpp:282,362`; boss index/position at `AlmanacDialog.cpp:252–254,611–616`; chooser loop at `SeedChooserScreen.cpp:162–173`; ZomBotany selection at `Challenge.cpp:2433–2445`; special bowling packets at `Challenge.cpp:1508–1524`; cache alias mapping at `src/Lawn/System/ReanimationLawn.cpp:267–272`.

The local audit found every standard definition/name key and every base reanimation reference for all 53 plant definitions and 33 zombie definitions in the selected pack. This does not check every transitive texture/effect/sound dependency, unlock path, description page, ability, interaction or animation. Full per-entry behavior and native GOTY comparison remain pending. The detailed private-workspace report is `work/portable-review/roster-audit.txt`; proprietary resource bytes and descriptions remain outside the public source.

## Required browser smoke tests

| Test | Expected observation | Result/evidence |
| --- | --- | --- |
| Clean startup | Launcher and WebAssembly load without uncaught errors | Historical v2 clean boot; current cached autostart reaches original title |
| Automatic bundled startup | Original title without local game files; asset validation/cache/retry preserve separate saves | Historical public startup and old v3 resource-import results remain historical; own private Software.9 ready title observed without local game files |
| First Adventure level | Original tutorial, planting, sunshine, zombie and projectile animation | Historical v2 1-1 completion below; current 1-1 gameplay retest pending |
| Win/loss and menus | Rewards/transitions, loss, pause, restart and main-menu paths work | Historical v2 reward/pause/main-menu checks; public v6 repeat 2-1 full win/reward/2-2 transition and fresh-reload progression; boss pause/Leave/Quit/Continue verified; full boss win and loss/restart coverage pending |
| Environment samples | Night, pool, fog, roof and boss scenes load and render | Public v6 complete repeat 2-1 night; historical v3 4-1 fog/night-pool and 5-1 roof samples, plus local 5-10 boss opening; broader play and exact rendering/timing comparison pending |
| Secondary modes | Minigame, puzzle and Survival selections open; representative play works | Historical v2 samples, public v7 first I, Zombie placement/brain/loss paths and public v8 first Vasebreaker complete repeat win/reward; wider mode coverage pending |
| Metagame samples | Almanac, shop, garden, achievements and Zombatar screens render | Historical Almanac and scoped Zombatar PASS; public v5 Marigold purchase/first growth, canceled-sale quotes, garden backgrounds, Tree feed and fresh-reload fields observed; broader metagame coverage pending |
| Browser save | Save/exit, reload and import preserve scratch profile/progress | Baseline profile/settings/5-10 transfer PASS; custom gallery/boss reload PASS; public v5 portrait/JPEG and scoped garden/tree persistence PASS; public v6 post-win Level 2-2 restored after fresh reload; broader compatibility pending |
| Cache controls | Reload restores local resources; forget removes resources without deleting saves | Current cached autostart observed; resource-forget isolation pending |
| Save import/export | Separate scratch save round-trip; no writes to installed native saves | PASS: actual browser export/import/export preserves all ten files byte-for-byte and native UI restores player/settings/5-10 .v4 state; automated transfer/rollback tests also PASS |
| Minimal browser UI | Only game and five discreet utility icons; more menu opens/closes | PASS: current title view, five icons, more popup and confirmed prestart import flow observed |
| Resize/fullscreen | Canvas retains 4:3; pointer placement matches rendered squares and native Options reflects actual fullscreen | Historical v5 status mismatch reproduced; local parity.2 toolbar/native/prestart/staged-choice and 4:3 fit PASS; public v6 toolbar/native status entry/exit PASS; actual browser Escape-exit and broader pointer placement pending |
| Utility keyboard input | Focused browser controls do not send their keys to active gameplay | Public v6 failure reproduced; public v7 corrected title/active-board controls, canvas Space, More/Escape and local actual-launcher regression PASS |
| Normal player audio | Default output enabled, user mute/unmute works, native volume settings usable | Automated controls PASS; native music/SFX sliders nonzero after migration and changed positions survive native Quit/reload; audible listening not performed |
| Quiet agent tests | `?testing=1` forces inaudible output despite mute toggles, with clocks running | Automated PASS; current browser checks use the silent testing URL |
| Distribution audit | Code/source archives exclude asset payloads; full-runtime archive may include only the six approved data files; no executable/DLL, actual native saves or private QA exports | Scoped historical archives audited; Software.9 final site archives require their own exact-byte/CRC/allowlist audit |

## Known boundaries

- Source implementation of the full content catalog does not establish that every entry was played or that frame timing, RNG, collision edge cases and all animations exactly match the commercial executable.
- The engine's reference resources are PopCap GOTY 1.2.0.1073 EN. Steam GOTY 1.2.0.1096 renames several string keys. Browser-generated overrides should be checked for restart labels, almanac introductions, unseen-zombie text and garden sell-price formatting.
- The 0.2.6 release fixes a historical duplicated sell-price zero; 0.2.5 fixes pot glow and Another Chain Reaction seed selection. These are regression targets, not claims that they remain broken.
- Browser storage, file selection, fullscreen and the compact browser controls differ from desktop behavior. Normal player audio is enabled by default, subject to browser user-gesture rules and saved mute preference. Agent tests use `?testing=1`; permanent public-site silence is obsolete.
- The historical public v5 fullscreen-status mismatch is corrected in public v6: toolbar entry/exit and live native Options checkbox updates passed on the deployed engine. Local parity.2 checks also cover native Options/pre-initialization paths. Actual browser Escape exit and browser-level rejected requests remain unverified. Native Options enters fullscreen on the canvas container, which hides sibling utility controls until exit; this observed upstream behavior remains distinct from toolbar fullscreen on the body.
- The utility-control keyboard-routing failure reproduced on public v6 is corrected and scoped browser checks passed on public v7. This does not certify every input/device path; real UA Escape fullscreen exit remains unverified.
- Global profile/index and detail saves use original-compatible formats. Original mid-level `.dat` memory dumps are architecture-dependent; portable `.v4` saves are the cross-platform path. Browser transfer preserves bytes rather than converting native memory dumps.
- Export captures written save files, not a new checkpoint of live engine memory. Use the original pause/save or Main Menu flow before export when current-board freshness matters. Atomic persistence and transfer tests do not prove that unsaved RAM state has been checkpointed.
- The official 0.2.6 engine JavaScript has no compiled IDBFS backend. The previous loader swallowed its mount error and still marked saves mounted, leaving in-memory save files without working persistence. An independent IndexedDB snapshot bridge (`dist/save-storage.js`) handles persistence outside the engine, independently of the custom Zombatar export patch. Native Quit/reload profile and audio-setting persistence, plus one 5-10 saved-board reload path, have been manually verified; additional gameplay-progress paths remain pending.
- Upstream `DO_FIX_BUGS` defaults OFF; the custom builds keep it OFF. Public parity.3 adds the statically grounded JPEG settings and piñata particle target; candidate parity.4 additionally restores the original export-buffer setup. No speculative gameplay/rounding change is included. Mute remains in the shell. Prior browser passes are not automatic candidate regression results.
- Upstream issue #473 reports an x87/pixel-rounding difference; its closure does not demonstrate a fix. A reproduction in the current WASM runtime has not been established here, so this is unverified rendering parity, not a confirmed current runtime defect. Existing browser checks do not establish exact rendering or timing equivalence.
- Nonzero native Options sliders and automated output-routing checks are not an audible listening test. Normal-user music/effects listening has not been recorded here.
- The observed boss opening and restored conveyor/zombie state verify one board path. A full boss win was not attempted, and this does not establish all fifty Adventure levels or every save-state field.

Upstream references: [repository](https://github.com/wszqkzqk/PvZ-Portable), [0.2.6 release](https://github.com/wszqkzqk/PvZ-Portable/releases/tag/0.2.6), [version compatibility](https://github.com/wszqkzqk/PvZ-Portable#game-version-compatibility).

## Historical baseline browser results (v2–v4)

Results identify the tested build, browser, date, resource edition and observations. Pending tests remain pending; a successful startup is not a claim of complete parity.

### Historical v2 checks, 2026-10-26 (Chromium in-app browser, Windows, Steam GOTY resources)

This earlier build permanently silenced output through registry defaults, a PCM callback patch and `audio-lock.js`. The observations below are preserved as history. Their silence assertions are superseded by the current player-audio requirements and do not verify current audible playback.

- PASS: asset-free launcher and WASM boot without JavaScript errors. Pinned release ZIP SHA-256 verified before integrating; engine WASM hash remains identical to the official build.
- PASS: local resource ZIP import, generated Steam compatibility labels, original title screen, animated original main menu and original player-name entry.
- PASS: fresh Browser QA profile, original Adventure 1-1 tutorial, Peashooter selection and placement, 100-sun cost, falling-sun collection, combat completion, Sunflower reward and transition to 1-2.
- PASS: original pause menu, volume defaults at zero, main-menu confirmation and saved return. Browser save ZIP exported successfully (scratch browser profile only).
- PASS: resource cache survives browser-tab closure and reopening; no second game-resource import was needed. Synthetic six-profile save import loaded QA - Boss and preserved the original game UI.
- PASS (historical report, count clarified): plant Almanac roster/selected descriptions and zombie Almanac entries rendered with original art/reanimations. Correct counts are 49 standard plants including Imitater and 26 standard zombie entries including Dr. Zomboss. The earlier wording "all 26 base types and the Dr. Zomboss entry" double-counted the boss; no 27th standard entry is claimed. Saved evidence `outputs/pvz-classic-plants.jpg` shows the plant grid, separate Imitater icon and selected Peashooter page; it does not document every description or the zombie grid.
- PASS: all 20 standard minigame tiles render. Wall-nut Bowling loads its conveyor, armor variants, lane mowers and rolling Wall-nut behavior. A full bowling win was not attempted.
- PASS: Puzzle catalog shows 18 finite puzzles and two endless variants. Vasebreaker loads the original night lawn; clicking a green vase breaks it and reveals a plant packet. A full puzzle win was not attempted.
- PASS: Survival catalog shows the ten normal/hard environments and pool endless. Pool Survival loads the original pool background. Continued verification is pending below.
- PASS (automated): actual glue PCM callback zeros all channels even on a mixer exception; WebAudio output is routed through a zero-gain boundary; HTML media cannot unmute; registry writes preserve the current player and unrelated settings. These tests validate silence without recording user microphone/system audio.
- PASS (automated): actual launcher filtering handles case variants and rejects unrelated/native executable/save paths. Generated tester profiles parse independently with CRC and exact end-of-file checks. Non-destructive test-profile merge preserves existing profile bytes and registry selection, avoids ID collisions, is idempotent, and rolls back write failures.

These are observed checks and source-contract checks, not a claim that all 50 levels, every ability, RNG/timing edge case or every mode has been exhaustively compared with the native executable.

### Current minimal-UI/audio checks, 2026-10-26 (Chromium in-app browser, Windows, Steam GOTY resources)

Agent browser checks in this section use `?testing=1` to keep output inaudible. They do not record microphone/system audio or claim an audible listening test.

- PASS (observed): cached resources automatically start the original title screen. The surrounding interface has five small utility icons for fullscreen, import, export, mute and more.
- PASS (observed): the more popup opens and closes.
- PASS (observed): original Options shows nonzero music and sound-effect sliders after migration from the legacy silent configuration. This confirms usable native settings, not audible playback.
- PASS (observed): fullscreen in a 1708×1067 viewport retains the original canvas's 4:3 fit. Broader resize and pointer-placement checks remain pending.
- PASS (automated, `tests/audio-controls.mjs`): normal output defaults enabled; master mute/unmute persists and restores each media element's own mute/volume settings without suspending audio contexts.
- PASS (automated, `tests/audio-controls.mjs`): `?testing=1` forces zero output despite toggle/resume attempts while native callbacks, PCM and clocks continue running.
- PASS (automated, `tests/audio-controls.mjs`): the one-time migration recognizes only the exact legacy `MusicVolume=0`, `SfxVolume=0`, `Muted=1` combination, restores native defaults, and preserves `CurUser` and unrelated registry data. Custom native settings remain preserved.
- FAIL (observed, before save-bridge repair): created the scratch profile `Save Test` through the original UI. A save export contained `/saves/userdata/users.dat` (25 bytes), but normal native Quit/reload returned to the new-user flow instead of restoring the profile. File creation/export alone did not establish persistence.
- FINDING AND REPAIR: the official engine glue lacks an IDBFS backend, while the previous loader swallowed the mount error and treated the save filesystem as ready. The external IndexedDB snapshot bridge repairs this without changing the official engine files.
- PASS (observed, after repair): created `Persistent Q` through the original player UI, selected the original Quit command and confirmed Quit. The page automatically reloaded cached resources and the title screen. After clicking Start, the native menu displayed `WELCOME BACK Persistent Q` without a new-user prompt. This verifies profile persistence through this path; the later boss-board test below adds one gameplay-state persistence path.
- PASS (observed, subsequent settings check): changed the original Options music and sound-effect sliders to different nonzero positions, used original Quit and its confirmation, then followed automatic reload, title Start and Options. Both changed slider positions persisted. This was performed with `?testing=1`, so it verifies setting persistence without claiming audible playback.
- PASS (observed): the import icon while playing opens an in-page confirmation. Continue reloads to the compact pre-engine more view without automatic game start. Under Advanced, Add unlocked test profiles reported six profiles added while preserving `Persistent Q`; closing more and starting the game worked.
- PASS (automated, `tests/save-storage.mjs`): native/shell sync calls serialize and callbacks wait for atomic transaction completion. Fresh-runtime restoration preserves exact file bytes, modes, modification times and deletions.
- PASS (automated, `tests/save-storage.mjs`): failed transactions retain the previous stored snapshot; failed restoration retains memory and blocks destructive persistence until retry. Stale tabs cannot overwrite a newer snapshot from another tab.
- PASS (automated, `tests/save-sync.mjs`): the actual loader drains overlapping queued flushes, waits for the final flush before native-exit reload, propagates failures and permits retry. Failed exit keeps the page open and offers retry before reloading; failed restoration blocks startup.
- PASS (automated): the complete `verify-port.mjs` check suite passed, including current audio controls, save storage/synchronization, save transfer with actual JSZip, Steam compatibility, test-profile merge and shell/provenance checks. This does not certify exhaustive 1:1 parity.

### Current boss scene and board persistence, 2026-10-26 (same browser/resources, `?testing=1`)

- PASS (observed): Adventure 5-10 shows the original roof scene, Crazy Dave being taken by a Bungee Zombie, Dr. Zomboss, the conveyor and zombies. This checks the opening scene and active board presentation; a full boss win was not attempted.
- PASS (observed): while this board was active, used the original Menu, Main Menu and Leave path, then the original Quit command and confirmation. The page automatically reloaded cached resources and the original title screen.
- PASS (observed): after title Start, selected `QA - Boss`, opened Adventure, chose Continue Game and confirmed Continue. The saved conveyor and zombie state returned. Escape opened the original pause menu on the restored board.
- PASS (observed): the latest browser error-log check was empty. Screenshot evidence of the resumed boss board and native pause menu is saved as `outputs/pvz-classic-boss-resume.jpg` in the task output directory.

This verifies **one boss-board save/quit/reload/continue path**. The later browser transfer check below additionally verifies export/import of this board. Other board/environment save paths, complete modes and exhaustive 1:1 comparison remain pending. Neither the boss opening nor this saved-board restoration is a completed boss fight or a full-game parity certification.

### Historical public v3 representative night checks, 2026-10-26 (`?testing=1`, original Steam GOTY resources)

- PASS (observed): fresh resource ZIP import from the locally owned QA pack reached the original title screen without JavaScript errors. The prestart utility successfully added six unlocked test profiles.
- PASS (observed): `QA - Night` Adventure 2-1 rendered the original night lawn, graves and seed chooser with ten slots and three Dave-forced seeds.
- PASS (observed): planting Sun-shroom cost 25 sun (50 to 25). Puff-shroom was planted twice without reducing the remaining 25 sun. These observations verify those planting/cost actions; Sun-shroom production/growth, Puff-shroom projectiles and a full night win were not verified.
- PASS (observed): a bottom-row zombie breach triggered the lawn mower. The original Main Menu/Leave path returned from the level.
- Evidence: `outputs/pvz-classic-night.jpg` in the task output directory. This is representative public runtime coverage, not exhaustive roster or original-game parity verification.

### Current save-transfer implementation checks, 2026-10-26

- IMPLEMENTED: `dist/save-transfer.js` exports root `registry.regemu` and all `userdata/` file bytes, rather than exporting only the userdata subtree. It accepts legacy flat, native/wrapped ZIP and folder layouts, including root registry data.
- PASS (automated, `tests/save-transfer.mjs`, actual bundled JSZip): round-trip preserves native profile index/details, `CurUser`/options registry, nested files and portable `.v4` bytes; unrelated saves survive.
- PASS (automated): legacy flat/native/wrapped/case-varied ZIPs and wrapped folder imports route correctly. Traversal, raw duplicate ZIP names, normalized aliases, file/directory conflicts, malformed native formats and native/ZIP CRC failures are rejected before writes.
- PASS (automated): staging, rename and persistence failures restore prior file bytes and metadata, remove transaction staging files and attempt rollback persistence. Overlapping imports serialize through awaited atomic persistence.
- LIMIT: the actual browser round-trip is recorded separately below. Export preserves files already written by the engine; it does not force an immediate live-RAM board checkpoint. These unit/integration checks do not establish full original save compatibility across architectures.

### Historical public v3 representative fog checks, 2026-10-26 (`?testing=1`, original Steam GOTY resources)

- PASS (observed): Adventure 4-1 rendered the original six-lane night pool/fog lawn.
- PASS (observed): planting Plantern cost 25 sun (50 to 25) and visibly cleared the bottom-right area while the top fog remained. This checks local fog clearing, not full fog behavior/timing parity.
- PASS (observed): Sea-shroom was planted free directly in water without a Lily Pad; Puff-shroom was planted free on land. Projectile behavior and a full fog win were not verified.
- PASS (observed): original Main Menu/Leave returned from the level. No additional fog-board reload/persistence claim is made from this exit alone.
- Evidence: `outputs/pvz-classic-fog.jpg` in the task output directory. Exact wave timing and full fog-level completion remain unverified.

### Historical public v3 representative roof checks, 2026-10-26 (`?testing=1`, original Steam GOTY resources)

- PASS (observed): Adventure 5-1 rendered the original sloped daytime roof and preplaced Flower Pots. The chooser displayed the 49-plant catalog including Cabbage-pult, Kernel-pult and Melon-pult; ten packets were selected with three Dave-forced seeds.
- PASS (observed): a Flower Pot placed on a previously bare roof tile cost 25 sun (50 to 25), and the new pot was visible. Original Menu, Main Menu and Leave completed.
- Evidence: `outputs/pvz-classic-roof.jpg` in the task output directory. Pult projectiles, a full roof win and exact slope calculations were not verified by this sample.

### Actual browser save-transfer round-trip, 2026-10-26 (latest local transfer build, `?testing=1`)

- PASS (observed): exported through the browser UI to `pvz-portable-savedata (2).zip`. It contained ten files: root `registry.regemu` (329 bytes), actual `userdata/game900006_0.v4` (66,435 bytes), seven player-detail files and the player index.
- PASS (observed): changed the selected player to `Persistent Q`, moved both native audio sliders away from the backed-up positions and used original Quit/confirmation. Imported the older backup through the prestart more tools; the operation completed without an error. Re-exported before starting the engine to `pvz-portable-savedata (3).zip`.
- PASS (file comparison): Python ZIP CRC checks passed, and all ten uncompressed file byte sequences matched exactly between the original export and the post-import export. The private workspace record `work/portable-review/actual-save-roundtrip.json` records the two archive names, per-file byte counts/SHA-256 values and `all_files_identical: true`.
- PASS (observed, native UI after restore): Start returned to `WELCOME BACK QA - Boss`, restoring the exported player selection rather than the later `Persistent Q` selection. Original Options restored the two earlier, distinct music/SFX slider positions rather than the newer matching positions. These are slider positions, not asserted numeric volume values, and audio remained forced silent for testing.
- PASS (observed): Adventure offered Continue Game. Continue restored the actual 5-10 conveyor/zombie board state, and Escape opened the original pause menu. The latest browser error-log result was empty (`[]`).
- Evidence: `outputs/pvz-classic-save-roundtrip.jpg` and `outputs/pvz-classic-restored-options.jpg` in the task output directory.

This verifies **one actual browser portable `.v4` export/import/export path**, including selected player, native audio settings, exact saved bytes and native board continuation. It does not establish all boards, exhaustive native global-save compatibility or cross-architecture import of original mid-level `.dat` memory dumps. Complete modes, a fifty-level play-through, all abilities/interactions, exact timing and rendering/x87 parity remain active verification work. The official engine JavaScript and WebAssembly remain unchanged.

### Legacy registry transfer compatibility, automated verification

- Confirmed the former self-round-trip defect using the actual transfer module and vendored JSZip: a source with both `/saves/registry.regemu` and the old misplaced `/saves/userdata/registry.regemu` exported two entries that normalized to the same import target.
- PASS after repair: the canonical root registry is authoritative. Export omits obsolete userdata registry aliases when the canonical file exists without modifying the source artifact; import ignores those aliases when a canonical registry is supplied. Legacy-only alias recovery remains supported. Other genuinely conflicting canonical registry entries are rejected before writes.
- PASS: actual-JSZip tests cover own-backup round-trip with both source paths, exact authoritative bytes, untouched source artifact, mixed order/case/wrappers, legacy-only recovery and true canonical duplicates. The previously observed ten-file native browser round-trip exercises the ordinary canonical path.

## Zombatar baseline finding and custom candidate, 2026-10-26

### Observed original-binary public v4 baseline (`?testing=1`)

- AUTHORIZATION: the user approved the original Zombatar license at action time in this session; it was accepted through the normal original UI. This records the authorization already given and does not alter the license.
- PASS (observed baseline): created a bright-green portrait with orange hair, sunglasses and a roof backdrop. The native editor, flag preview and saved portrait list worked; the list showed 1/1.
- STALLED OBSERVATION: a browser download wait requested with a three-second limit eventually returned after a reported 9,119 seconds. This is a stalled tool observation, not proof of a correctly bounded three-second no-download result.
- SOURCE FINDING: baseline `ZombatarWidget.cpp` saves the profile record and changes to the list after confirmed Finished, but has no standalone JPEG writer/download call in that path. Source inspection establishes this baseline export gap independently of the stalled wait. A saved profile portrait is not itself a downloaded JPEG.

### Locally built `0.2.6-web-zombatar.1` candidate

- IMPLEMENTED, first candidate browser path verified below: the second confirmed Finished preserves `SaveDraft`, renders the saved record with native `DrawAvatar`, writes a JPEG and requests a browser download. Download again reuses the same image without adding a profile record.
- SOURCE SCOPE: only `src/Lawn/Widget/ZombatarWidget.cpp` and `.h` differ from the exact official tag; the patch is web-only. The local Emscripten rebuild produces different JS/WASM artifacts, documented in the engine/build provenance and matching custom source ZIP.
- PASS (build/codec checks recorded in build provenance): clean baseline and patched compilation; generated JS parsing/WASM validation; synthetic existing-JPEG encoder/decoder checks for 180×180 dimensions, channel order and orientation; mock native-to-browser bridge checks for copied bytes, download request before asynchronous persistence, failure and retry. These checks are not an actual game-portrait browser download.
- CANDIDATE POLICY / LIMIT: native 180×180 output, encoder quality 80 and opaque black matte are candidate choices. Original GOTY export dimensions, matte, quality and exact pixel parity have not been established. The Crazy Dave backdrop includes meaningful partially transparent pixels, so matte/compositing comparison matters; no original-reference match is claimed.
- REMAINING: first-candidate and final-rebuild browser checks below cover specific portrait and boss-resume paths. Public v5 narrow image-backup import/reload is verified below. Broader save/audio/gameplay regression coverage and original-reference image comparison remain pending. Keep tests forced silent with `?testing=1`. Complete original-game 1:1 parity remains active.

### Actual first-candidate browser JPEG/cancel/retry check (`?testing=1`)

- TESTED ARTIFACT: first candidate WASM SHA-256 `0c799235374004658be2be108211254fb74d3731886efeac919bc02f8b94aac2`. The already approved-consent profile began with one saved portrait (1/1).
- PASS (observed): canceling the Finished confirmation added no portrait. Confirming a new portrait saved exactly one additional record, with the gallery at 2/2.
- PASS (observed/file): actual `Zombatar_1.jpg` download is 11,625 bytes and decodes to 180×180. It is upright and contains the selected blond afro, white glasses and roof backdrop without editor chrome. Evidence copy: `outputs/pvz-zombatar-export.jpg`; editor evidence: `outputs/pvz-zombatar-candidate-editor.jpg`.
- PASS (observed/file): Download again returned byte-identical JPEG content, SHA-256 `d901fe82f224b364a328b6bd1d55a4e882414cef84858493eecd70dccd4b7e61`. The gallery remained 2/2, so this retry did not add another profile record.
- LIMIT: observed current JPEG dimensions/content/orientation do not establish original GOTY export dimensions, encoder quality, matte or pixel equivalence. The Crazy Dave partial-alpha backdrop still needs an original-reference comparison.

### Public v5 caption-only rebuild and deployment status

- Public v5 WASM SHA-256: `6ded4f1b09165773668c12e86255a9dae3450fef9e5d45374729ec3cc1168764`; generated JS remains unchanged from the tested first candidate (`8e065d3f0cea3b5e381d69674d126a4fdbb4f126ebe1c48fba887c9eec78518d`). This revision changes captions only; its evidence must remain distinct from the earlier binary hash and the later fullscreen build.
- PASS (automated, reported by root): the full `verify-port.mjs` suite on this v5 rebuild at its integration. Its JS/WASM/corresponding-source hashes matched the manifest at that time; the current manifest now identifies the later fullscreen build.
- PASS: final rebuild native Quit/reload/gallery/caption/download/backup smoke and existing boss-board Continue were subsequently observed below. Public v5 deployment and the scoped image-backup import/reload were subsequently verified below. Earlier v2–v4 evidence and first-candidate JPEG tests remain scoped to their actual binaries. Full gameplay, all fifty Adventure levels/modes/abilities, exact timing/rendering/x87 behavior and original JPEG comparison remain active verification work.

### Final `6ded4f1b…` browser gallery/JPEG/backup smoke (`?testing=1`)

- PASS (observed): original Quit/confirmation automatically reloaded the page. Selecting `QA - Roof` and opening Zombatar showed gallery 1/2 with both previously saved portraits available. This verifies those existing records survived the native Quit/reload path.
- PASS (observed): created a third portrait with a bald/plain zombie and the first tree/fence backdrop. Confirmed Finished opened the native export dialog, which fit its text and included Download JPG. The gallery showed 3/3.
- PASS (observed/file): actual `Zombatar_2.jpg` download is 7,641 bytes, SHA-256 `3881d37d1c3007ab9629dbff63a05b0e7fd93a3f86979c2c4fedb51c68789613`, decoded upright with the selected plain zombie and tree/fence backdrop. `Zombatar_1.jpg` retained SHA-256 `d901fe82f224b364a328b6bd1d55a4e882414cef84858493eecd70dccd4b7e61`. Evidence copies: `outputs/pvz-zombatar-export-2.jpg` and `outputs/pvz-zombatar-export.jpg`; native-dialog evidence: `outputs/pvz-zombatar-final-dialog.jpg`.
- PASS (actual browser backup/file comparison): the new save ZIP contained twelve files and passed ZIP CRC checks. Its nested `userdata/zombatars/user900005/Zombatar_1.jpg` and `Zombatar_2.jpg` entries each matched the corresponding actual download byte-for-byte.
- SCOPE: this local check verified new JPEG download and inclusion in save export. The later public v5 test below additionally verifies narrow image-containing import/export and fresh-reload gallery/JPEG persistence. Original GOTY dimensions/quality/matte/pixel parity remain unverified.

### Final custom-build existing boss-board regression (`?testing=1`)

- PASS (observed): `QA - Boss` Adventure offered Continue and restored the existing actual 5-10 conveyor/zombie board from the same 66,435-byte `.v4` save lineage. Escape opened the original pause menu; Main Menu/Leave saved and returned. The latest JavaScript error log was empty (`[]`).
- Evidence: `outputs/pvz-custom-engine-boss-resume.jpg` in the task output directory. This verifies that existing continuation path on the final custom build, not a boss win, new abilities or broad gameplay parity.

The final local build has the scoped browser smoke and automated results above. Public version 5 deployment and the additional narrow-transfer verification are recorded below. The full original-game parity goal remains active.

## Public version 5 deployment and image-transfer verification

- DEPLOYMENT PASS: source commit `ee56cc133d11cc451aae484c563e351b7106e441`, version 5, deployment `appgdep_6ae01ba24a14819187c054ac45a8c838`, status succeeded at https://lawn-defense-caleb-plays.usgi.chatgpt.site. Anonymous HTML, generated JS and WASM requests returned HTTP200. Served WASM SHA-256 matched `6ded4f1b09165773668c12e86255a9dae3450fef9e5d45374729ec3cc1168764`; JS matched the recorded `8e065d3f0cea3b5e381d69674d126a4fdbb4f126ebe1c48fba887c9eec78518d` build.
- PASS (actual public browser, `?testing=1`): imported only root `registry.regemu`, the `QA - Roof` detail file and both nested Zombatar JPEGs. The resulting `pvz-portable-savedata (6).zip` preserved all four incoming file byte sequences exactly and contained thirteen files in total, retaining other browser saves.
- Incoming-file comparison: `registry.regemu` 329 bytes; `userdata/user900005.dat` 1,102 bytes; `userdata/zombatars/user900005/Zombatar_1.jpg` 11,625 bytes; `Zombatar_2.jpg` 7,641 bytes. All four were marked identical in private evidence `work/portable-review/zombatar-public-transfer.json`. This is a scoped merge, not replacement of the complete save tree.
- PASS (observed public fresh-runtime reload): original Quit/confirmation triggered automatic reload. Selecting `QA - Roof` and reopening Zombatar showed gallery 1/3, with all three saved portrait records remaining.
- PASS (post-reload export/file comparison): `pvz-portable-savedata (7).zip` retained both JPEGs byte-for-byte. SHA-256 values remained `d901fe82f224b364a328b6bd1d55a4e882414cef84858493eecd70dccd4b7e61` and `3881d37d1c3007ab9629dbff63a05b0e7fd93a3f86979c2c4fedb51c68789613`. This post-reload comparison covers the two JPEG files; it does not assert every registry/profile byte stayed fixed during normal native use.
- PASS (observed): latest public JavaScript error-log result was empty (`[]`). Screenshot evidence: `outputs/pvz-public-v5-restored-gallery.jpg`. Deployment/progress evidence: `work/portable-review/v5-progress.json`.

These checks verify the deployed build and one narrow profile/registry/JPEG transfer plus fresh-reload persistence path. The separate Shop/garden observations follow below; these transfer checks alone do not add those passes or verify Tree of Wisdom or achievement behavior. Original JPEG dimensions/quality/matte/pixel reference comparison, complete fifty-level and mode/ability coverage, exact timing/rendering/x87 differences and native renderer-selection parity remain open. The full original-game parity goal remains active.

## Public v5 Shop and first garden growth, 2026-10-27 (`?testing=1`)

- TEST SCOPE: normal original UI on the selected synthetic `QA - Roof` profile, using game coins. No clock changes, save-field edits or injected game state were used. These observations apply to the public v5 `6ded4f1b…` engine; they do not establish all metagame behavior or original-game timing parity.
- PASS (observed Shop transaction; corrected currency reading): the starting displayed balance was $99,990. Shop page 3 offered a Marigold for $2,500. Confirming the native purchase changed the balance to $97,490 and the first Marigold stock slot to Sold Out. One tiny white sprout appeared in the main Zen Garden at grid (1,2). Evidence: `outputs/pvz-shop-marigold-purchase.jpg`.
- PASS (observed sprout quote): the normal sell tool quoted $1500 for the Marigold Sprout. Choosing No preserved the plant. This verifies the displayed quote and canceled-sale path, not an actual sale or sale proceeds. Evidence: `outputs/pvz-garden-sprout-quote.jpg`.
- PASS (observed watering/need transition): normal gold-watering-can use produced silver rewards, and later legitimate need cycles reached a fertilizer icon. The exact number of fulfilled waterings is not asserted because earlier interrupted observations and cursor/reticle interpretation did not support a reliable count. The input-source follow-up did not establish a garden input defect. Evidence: `outputs/pvz-garden-fertilizer-need.jpg`.
- PASS (observed first growth): fertilizer charges decreased from 5 to 4, and the sprout grew into a small red Marigold. A gold coin was visible; its collection is not claimed. Evidence: `outputs/pvz-garden-first-growth.jpg`.
- PASS (observed small-plant quote; corrected currency reading): the normal sell tool quoted $2000 for the Marigold. Choosing No kept it. The displayed balance at the quote was $97,520 after the three $10 silver rewards; the exact number of test clicks is still not asserted. Evidence: `outputs/pvz-garden-small-quote.jpg`.
- EVIDENCE CORRECTION: earlier visual notes read the stylized dollar sign as a leading 5 and reported $599,990/$597,490/$597,520. Actual `QA - Roof` detail bytes in backups (4), (5), (6) and (7) each contain 9,999 internal coins, which display as $99,990. Backup (8) contains 9,752 internal coins, which display as $97,520. `LawnApp.cpp`'s money formatter multiplies internal coins by ten and prefixes the currency sign. The corrected $99,990 → $97,490 → $97,520 sequence preserves the $2,500 deduction and $30 silver rewards. This was an observation error, not a game bug or fixture-balance change.
- REMAINING: broader garden behavior is unverified; the following section adds observed Tree feeding, written save fields and scoped fresh-reload persistence. No full-grown Marigold or later fertilization stage is claimed; the original real-time growth gates remain in effect. These checks do not verify every shop item, every need, every garden, achievement triggers or exhaustive 1:1 parity.

### Public v5 garden backgrounds, Tree feed and written save fields

- PASS (observed normal garden cycle): Next Garden rendered the Mushroom Garden and Aquarium Garden, then reached Tree of Wisdom. These are background/navigation samples, not proof of every garden plant interaction. Evidence: `outputs/pvz-mushroom-garden.jpg`, `outputs/pvz-aquarium-garden.jpg`.
- PASS (observed Tree feeding): Tree Food decreased from 5 to 4; the curled tree grew into a taller neck and displayed wisdom text. No numeric height label is claimed from the UI. Evidence: `outputs/pvz-tree-before-feed.jpg`, `outputs/pvz-tree-after-feed.jpg`.
- PASS (actual browser-written export/file inspection): Tree Main Menu returned normally, then the actual browser UI exported `pvz-portable-savedata (8).zip`, which passed ZIP CRC checks. Its `userdata/user900005.dat` is 1,190 bytes, SHA-256 `be337dd650b3e3f4c64832ad21b1fa6614b6bf37190bafe2f2b0c3e546f4d627`. The private authoritative record is `work/portable-review/metagame-actual-save.json`; these bytes were read, not changed.
- Serialized fields: 9,752 internal coins ($97,520); tree height 2 at detail-file offset 212; fertilizer purchase index 14 = 1004 and Tree Food index 28 = 1004, each encoding four remaining charges. Potted-plant count is 1; the Marigold record has seed 38, main garden 0, grid (1,2), age 1 (small), times fed 0, required feedings 3 and last-fertilized timestamp 1793104831. This agrees with the scoped observed first-growth and single-feed actions.
- PASS (observed public v5 fresh runtime): original Quit/confirmation triggered a fresh page load. Start restored `QA - Roof`; Zen Garden showed the small red Marigold and four fertilizer charges. Evidence: `outputs/pvz-garden-after-reload.jpg`.
- PASS (post-reload actual browser export/file inspection): `pvz-portable-savedata (9).zip` passed ZIP CRC checks and contained the 1,190-byte detail file with potted count 1, age 1, four fertilizer charges, tree height 2 and four Tree Food charges. Its first 88-byte potted-plant record matched backup (8) byte-for-byte. These results are in the `fresh_reload` object of `work/portable-review/metagame-actual-save.json`.
- LIMIT: this verifies the visible garden and durable garden/Tree fields through one fresh-runtime path. The Tree screen was not reopened for a post-reload screenshot; no such visual claim is made. No later growth, every garden need, exact real-time interval, complete Tree dialogue or achievement-trigger pass is claimed.

## Public v5 native fullscreen-status defect, 2026-10-27 (`?testing=1`)

- FAIL (observed): entering fullscreen with the toolbar produced one actual browser `:fullscreen` element while the original Options Full Screen checkbox remained unchecked. Evidence: `outputs/pvz-fullscreen-native-status-before-fix.jpg`.
- The scoped `0.2.6-web-parity.2` correction passed the full automated verifier, the scoped local paths below and the later public v6 toolbar/native status check. The preceding failure remains historical public v5 evidence.

## Integrated fullscreen build `0.2.6-web-parity.2`, scoped local UI checks

- WASM SHA-256: `75e997b1ae4c35f3731682bd4a11f06ee4c72b5879efc573a1b0719e94bae293`; JS SHA-256: `a72af2c9a0fd44a2355444762e1f9b06922c9e899c0c6ca94a3b1aeed871eeef`.
- Matching corresponding source: `dist/source/pvz-portable-0.2.6-web-parity.2-source.zip`, SHA-256 `42d91e6841a48214888d6b50e95e4249b050f6ccd7b520512693d079af53f580`; patch: `dist/source/web-parity.patch`, SHA-256 `ce7a09fe0335977f73633e4535c68a3ecd76dcabf346762e592bfb186c992cca`. These values are from the current engine manifest.
- PASS (automated, reported by root after integration): full `verify-port.mjs`, including a strict exact-four-source-file scope and the retained actual Zombatar compositor/profile/download-bridge checks. This does not certify browser Fullscreen API transitions or complete game parity.
- PASS (local browser, `?testing=1`, reported by root): the loaded engine script used query revision `a72af2c9a0fd`. Toolbar entry from the title, followed by Main Menu/Options, produced one actual browser fullscreen element and a checked native Full Screen box. Toolbar exit while Options remained open produced no fullscreen element and updated the same checkbox to unchecked.
- PASS (local browser): checking native Full Screen staged the choice while the actual fullscreen-element count remained zero; OK then entered fullscreen on the canvas container. Reopening Options showed checked. Unchecking and OK exited fullscreen, with the count returning to zero and utility controls restored. The 4:3 fit was preserved. Evidence: `outputs/pvz-fullscreen-status-fixed.jpg`.
- AUTOMATION LIMIT: `Tab.pressKey` sent Escape to the page, producing the normal native Quit prompt while the browser remained fullscreen. This is not an actual browser/UA Escape-exit pass. The isolated C++ harness covers the external-exit callback; that is distinct from verifying a real browser Escape transition.
- OBSERVED BOUNDARY: native Options targets the canvas container and therefore hides sibling browser utility controls until native exit; toolbar entry targets the body. This existing target difference is not described as repaired by status synchronization.
- PASS (before game initialization, local build): returned to the file picker before engine game startup and imported a narrow four-file garden/registry/JPEG save. Entering toolbar/body fullscreen produced one actual fullscreen element before Start. Start booted to Title, Main Menu and Options; the native Full Screen checkbox was checked while the fullscreen count remained one. This exercises initial-status synchronization rather than only a later fullscreen event. Evidence: `outputs/pvz-fullscreen-before-start-fixed.jpg`.
- PASS (local narrow-import/regression sample): toolbar exit with Options open updated the native checkbox to unchecked. Closing Options and opening Zen Garden rendered the imported small red Marigold with four fertilizer charges. Original Main Menu/Quit/confirmation automatically reloaded a fresh page showing save restoration; the latest JavaScript error-log result was empty (`[]`). Evidence: `outputs/pvz-parity2-imported-garden.jpg`. This is not an assertion of a new post-reload garden-byte comparison on parity.2.
- STILL UNVERIFIED: real browser Escape exit, browser-level request rejection, broader pointer behavior and exhaustive game parity. Public v6 deployment and its scoped checks follow. Public v5 metagame/JPEG observations remain scoped to their tested engine hash.

## Public version 6 deployment and scoped UI checks, 2026-10-27 (`?testing=1`)

- DEPLOYMENT PASS: source commit `90290eeb9c2a1b1551583a7e0b2af2003044f721`, version 6, deployment `appgdep_6ae0a1516f108191930e6c353fbe676a`, status succeeded at https://lawn-defense-caleb-plays.usgi.chatgpt.site. Anonymous artifacts were verified against the parity.2 JS/WASM/source/patch hashes recorded above. Deployment and public UI evidence is in `work/portable-review/v6-progress.json`.
- PASS (actual public browser, reported by root): loaded engine query revision `a72af2c9a0fd`; toolbar entry produced one browser fullscreen element and a checked native Full Screen box. Toolbar exit produced zero fullscreen elements and an unchecked native box. Evidence: `outputs/pvz-public-v6-fullscreen.jpg`.
- PASS (actual public browser): the upgraded garden rendered the small red Marigold with four fertilizer charges. The latest JavaScript error-log result was empty (`[]`). Evidence: `outputs/pvz-public-v6-garden.jpg`. This is a render/regression sample; the independent v5 fresh-reload garden/Tree byte comparisons remain scoped to v5.
- FAIL (historical public v6): utility-control keyboard routing was reproduced; keys aimed at a focused HTML utility control also reached the game. Evidence: `outputs/pvz-v6-utility-keyboard-bug.png`. Local checks below preceded the later public v7 deployment/checks.

### Local utility keyboard correction before public v7 deployment

- PASS (actual local browser, `?testing=1`, reported by root): on the title screen, Space on the fullscreen utility entered fullscreen (one actual element), and Enter exited (zero). On an active Another Chain Reaction board, the same focused-control Space/Enter sequence entered/exited fullscreen without opening native pause. Canvas Space still opened the original GAME PAUSED screen; the board then resumed.
- PASS (actual local browser): Space on More opened the HTML Controls dialog; Escape closed it without opening native pause or Options. A fresh fullscreen frame measured 1422×1067, preserving the 4:3 fit. The latest JavaScript error log was empty. Evidence: `outputs/pvz-local-utility-keyboard-fixed.png`.
- PASS (automated, reported by root): `tests/shell-keyboard.mjs` exercises the actual launcher, fails against the old routing and passes the correction. The full verifier passed after integration. These checks establish the scoped local shell behavior; no Another Chain Reaction win or other gameplay coverage is added.
- SCOPE: the engine remains `0.2.6-web-parity.2` with the same recorded JS/WASM/source/patch hashes. These local checks preceded the public v7 pass recorded below. Real browser/UA Escape fullscreen exit remains unverified; the dialog Escape check above is a page-level action.

### Public v6 repeat Adventure 2-1 win and progression persistence

- TEST SCOPE: selected synthetic `QA - Night`, already carrying `finishedAdventure = 2`. The complete run used normal original controls, including Space to pause, with no game-state injection or clock changes. This is an earned repeat-Adventure level win on that fixture, not a first-campaign play-through or normal unlock test.
- PASS (observed): completed all twenty waves/two flags of repeat 2-1. The actual moneybag reward appeared and was clicked; five gold coins animated, the next seed chooser appeared, and Main Menu showed Level 2-2. Evidence: `outputs/pvz-public-v6-night-2-1-win.png` captures the actual award before pausing. An earlier attempt returned to Main Menu without an observed win or loss; it is counted as neither.
- PASS (scoped mechanic samples): a small Sun-shroom produced a collected 15-sun drop and later matured to 25-sun production; Puff-shroom killed an ordinary zombie; Newspaper lost its paper and entered rage; Fume-shroom's area-shaped shot and Scaredy-shroom projectiles were seen; Wall-nut tanked in the bottom lane. Grave Buster removed the grave near native x720/row0 before the final rise; three other graves rose. Potato Mine was planted and armed.
- LIMITS: Fume-shroom screen-door/paper bypass, Scaredy-shroom proximity fear, all Wall-nut damage thresholds, Potato Mine hit/explosion and exact growth/shot timing were not established by these samples. A full level win does not prove every ability or original-runtime parity.
- PASS (actual browser export/file inspection): `pvz-portable-savedata (10).zip` passed ZIP CRC checks. Its `userdata/user900002.dat` is 886 bytes, SHA-256 `cee581ad9e3c3ad1eebd4bc3117a5be57acc76048dd4dc0132a9d76f7d1a93a8`; detail offsets 4/8/12 contain level 12, 10,042 internal coins and completed-Adventure count 2. Earlier actual backups (4)–(9) contained level 11/9,999 coins for this profile. The net increase is 43 internal coins ($430), including level collections that were not individually itemized. Source `Coin.cpp` fans five gold coins for this moneybag; each gold is five internal coins, so its nominal reward is $250. Neither a $500 bag nor attribution of the whole $430 to that bag is claimed.
- PASS (actual public fresh runtime, reported by root): original Quit/confirmation triggered automatic reload. After the title click, the selected `QA - Night` profile showed Level 2-2. Evidence: `outputs/pvz-public-v6-night-2-2-restored.png`. This verifies post-win progression persistence; no post-reload coin-byte comparison or active 2-2 combat is claimed.
- REMAINING: the other forty-eight Adventure levels lack an observed full win in this record; 1-1 has only its historical v2 completion. Full campaigns, other modes, normal unlocks, all plant/zombie behaviors and matched commercial-reference rendering/timing remain unverified. Normal player audio remains available; every check in this section used `?testing=1`.

## Public version 7 deployment and input verification (`?testing=1`)

- DEPLOYMENT PASS: source `171e38f7a75927ba1114bde048ab4b4ff2ecf29f`, deployment `appgdep_6ae0ada1f9cc81918299c5392abcd157`, succeeded at the public URL. The parity.2 engine JS/WASM/corresponding-source/patch stayed unchanged from v6. Anonymous checks matched launcher, engine, source/patch and site-source bytes; hosting-transformed HTML was checked by script links/engine label. Evidence: `work/portable-review/v7-progress.json` and `v7-anonymous-artifacts.json`.
- PASS (actual public UI, reported by root): title fullscreen utility Space entered one actual fullscreen element and Enter exited to zero. On an active Another Chain Reaction board, utility Space/Enter entered/exited without native pause. Canvas Space opened original pause. More Space opened HTML Controls and Escape closed it without native pause/options. The Information label showed parity.2, QA-Night still showed Level 2-2 and the JavaScript error log was empty. Evidence: `outputs/pvz-public-v7-keyboard-fullscreen.png`, `outputs/pvz-public-v7-menu.png`.
- SCOPE: this proves the named browser-control paths and preserved progression display. It adds no Another Chain Reaction win, no broad device/input certification and no real UA Escape fullscreen-exit pass.

### First I, Zombie attempts on public v7

- TEST SCOPE: actual normal UI on synthetic QA-Night, finite `GAMEMODE_PUZZLE_I_ZOMBIE_1`. Starting sun was 150; Basic/Buckethead/Football packets cost 50/125/175. Source requires all five row brains to be consumed before the award; generated challenge unlocks do not count as an earned win.
- LOSS OBSERVED, attempt 1: 2/5 brains consumed, 25 sun, no remaining zombies or collectible sun, with the native loss dialog visible. Attempt 2 used ordinary Try Again and reached 3/5 brains before the same observed 25-sun/no-zombie/no-sun loss condition. No puzzle win or award is credited for either attempt.
- COLLECTION LIMIT: the normal sun lifetime is 750 grounded updates, approximately 7.5 seconds at the normal 10 ms step, followed by 15 fade updates. Native pause stops coin updates; paused clicks cannot collect. The source supports one coin per click with overlapping piles; ordinary holding/dragging does not harvest. These rules were preserved. Missed collections during tool/model delays are not evidence of a timing bug or authorization to change clocks.
- BEFORE-WIN BASELINE (actual export, read-only): `pvz-portable-savedata (11).zip` passes CRC. `userdata/user900002.dat` is version 12, 886 bytes, SHA-256 `cee581ad9e3c3ad1eebd4bc3117a5be57acc76048dd4dc0132a9d76f7d1a93a8`, matching backup (10). It contains Adventure level 12 and challenge-record index 60 = 1 at byte offset 256. This preexisting nonzero fixture record is not proof of either attempted win. Evidence: `work/portable-review/izombie-actual-save-baseline.json` and `coverage-ledger.json`.
- REMAINING: a complete finite puzzle win/reward and actual post-win record increment/persistence remain unverified.

## Original byte comparisons and parity.3, 2026-10-27

- STATUS: `0.2.6-web-parity.3` compiled and packaged successfully, then deployed as public v8. The full verifier passed the exact seven-file source scope, unchanged saved-record compositor/download bridge and shell/audio/save/keyboard checks. Four compiled C++ test groups and generated JS/WASM validation passed. Actual local browser export/retry/native-Quit/fresh-reload checks also passed below. The scoped public v8 deployment checks follow later.
- PUBLIC V8 ARTIFACTS: JS SHA-256 `191855138ecd39b8516b2b891d7506c86d3b3f431eaf1f08153eef8d2086a672`; WASM SHA-256 `ab6441474e4438292ee594a5028f33439ba269d6ea30dad04757b49b64fb74ec`; corresponding source `dist/source/pvz-portable-0.2.6-web-parity.3-source.zip`, SHA-256 `d12c29eec4885dfd9419cba57b17980a6506812aa634dd9de85cf63eed260230`; patch `dist/source/web-parity.3.patch`, SHA-256 `cdf5d805c93dc7b0faa5044950a2b110e83d4ce4718994ea9e7a88c792df980c`. These identify deployed parity.3; the current checkout manifest describes the separate parity.4 candidate.
- SOURCE PACKAGE AUDIT PASS (reported by root/build agent): ZIP CRC checks and byte comparison of the five added test files passed. Functional test parameters/sources are included; original executable bytes, private disassembly and original artwork are excluded. This packaging check adds no runtime or original-pixel pass.

### Zombatar JPEG parameters: static original evidence and actual codec checks

- STATIC REFERENCE: the unmodified installed Steam GOTY 1.2.0.1096 executable SHA-256 is `868f8e2bab0d6a7ef8afc4c5960c608eccef82bd086bd6e0c0e2670199a5ca45`. Its embedded PE begins at outer offset `0x1A71A2`, image base `0x400000`, suffix SHA-256 `ffbe8a75bc920c8415ccbcafb6588dc0018f8322a78fb4d6b17a27ca80fa5131`. Bytes were piped to a disassembler without executing the original inner/outer game, modifying DRM or publishing binary/asset bytes.
- STATIC FINDING: original export pushes decimal 40 at VA `0x5356C8`, then calls JPEG writer `0x633640` at `0x5356DC`. Helper `0x633490` selects/interpolates custom quantizer banks; parameter 40 selects row 4 exactly. This is **not IJG/libjpeg quality 40**. Original luma begins `[12,8,8,12,17,21,24,23]`; chroma begins `[13,11,13,16,20,20,29,37]`. The two recovered 64-entry tables differ from the prior web quality-80 tables. Exact arrays/proof are in the private audit and functional codec fixture; independent read-only review agreed with the argument chain and all 128 selected values.
- STATIC SETTINGS: original writer sets optimized Huffman coding after defaults (`0x636128`); YCbCr setup uses Y2×2/Cb1×1/Cr1×1, with the Y1×1 override restricted to parameters greater than 50. Export dimensions come from `IMAGE_ZOMBATAR_BACKGROUND_BLANK`, which is 180×180 in the installed pack. This establishes static parameter/geometry behavior, not captured original JPEG metadata or pixels.
- CANDIDATE IMPLEMENTATION: separate `ImageLib::WriteZombatarJPEGImage` applies those exact tables, explicit 4:2:0 and optimized Huffman coding after defaults. The web exporter calls it while native saved-record composition and `SaveDraft` remain unchanged. The general `WriteJPEGImage` retains its prior behavior; the new policy is restricted to the Zombatar call.
- PASS (actual compiled codec, synthetic pixels): untouched baseline and patched ImageLib were compiled separately. Both fixtures decode at 180×180 with correct RGB channels/orientation and baseline 4:2:0. New output contains both exact recovered DQTs and optimized DHTs; luma-AC symbol counts were 23 for color quadrants and 37 for texture. General-writer JPEG bytes stayed exactly identical across baseline/patched for both fixtures. Failed-open handling passed and the generated isolated test contained no audio initialization.
- REPRODUCTION: `python work/portable-build/tests/run-zombatar-jpeg-codec.py`. Test sources are `zombatar-jpeg-codec.cpp`, `run-zombatar-jpeg-codec.py` and `zombatar-jpeg-expected.json`; result is `work/portable-build/codec-test/zombatar/results.json`. The JSON fixture contains functional codec parameters and provenance hashes, not original artwork or executable bytes. Static audit: `work/portable-review/original-zombatar-static-audit.json`/`.txt`.
- HISTORICAL MATTE POLICY: parity.3 retained opaque-black offscreen initialization while the original's zero-ARGB setup was being investigated. Later original blitter tracing and actual-code tests establish its RGB effect and motivate the separate parity.4 correction below. Crazy Dave has 9,220 partially transparent backdrop pixels and remains a useful matched case. JPEG62 versus JPEG9f can also differ despite matching settings. No authentic original JPEG, pixel-equivalence or full-avatar claim is made.

### Actual local parity.3 JPEG, retry and fresh-reload persistence (`?testing=1`)

- PASS (actual original UI, reported by root): cached quiet startup selected QA-Roof; gallery initially showed 1/3. Creating the default skin-0 zombie with no optional parts and first Crazy Dave/tree-fence backdrop, then confirming Finished, grew the gallery to 4/4. The actual JPEG was upright, had the correct colors/composition and contained no editor chrome. Ordinary retry left four records.
- PASS (actual files): `Zombatar_3.jpg` is 6,318 bytes, SHA-256 `a0382d6c668724243c6868fa588c1c669ef474dc13dd59fbf5ec1d46ec3eb743`, RGB 180×180 baseline/non-progressive JPEG. Both 64-entry quantization tables match the original-static functional fixture exactly; sampling is Y2×2/Cb1×1/Cr1×1. Actual Huffman symbol counts DC8/7 and AC51/28 are reduced/nonstandard relative to the generic tables and support the configured optimized coding. `Zombatar_3 (1).jpg` is byte-identical. Preserved exact output: `outputs/pvz-parity3-zombatar-export.jpg`.
- PASS (fresh runtime, reported by root): original Quit/confirmation reloaded the page. QA-Roof/Zombatar restored gallery 1/4; normal navigation reached 4/4 and showed the correct new plain zombie/tree-fence preview, without another record. Evidence: `outputs/pvz-parity3-zombatar-restored.png`.
- PASS (actual post-reload UI export/file inspection): `pvz-portable-savedata (12).zip` passes CRC. Its QA-Roof detail is 1,262 bytes with exactly four portrait records. Nested `userdata/zombatars/user900005/Zombatar_3.jpg` occurs once and matches the downloaded/preserved 6,318-byte file exactly. The three standalone JPEGs coexist with four records because the earliest baseline portrait had no exported JPEG. Evidence: `work/portable-review/parity3-zombatar-actual-export.json`/`.txt`.
- SCOPE: these are actual local parity.3 browser/codec/backup/persistence passes, recorded before its v8 deployment. They do not recertify parity.4 or establish original-runtime JPEG, decoded-pixel/byte identity, matte match or exhaustive parity.

### Piñata target correction and unchanged Cob Cannon behavior

- STATIC FINDING: original `DropHead` creates the piñata effect at `0x53E7D0`, moves the returned particle pointer into `edx` at `0x53E7D5`, then calls scale helper `0x53E0A0` at `0x53E7D9`. The port previously discarded the new pointer and applied its second scale call to the head particle. Candidate parity.3 passes the newly returned piñata particle instead. Small-zombie scale 0.5 now targets the piñata; the head keeps its original single scaling. Normal scale is 1.
- PASS (isolated actual-method harness, reported by root/agent): baseline fails ten checks as expected; patched code passes nine scenarios, including null head/new-particle, disabled piñata mode and mowed cases. The test extracts the actual `DropHead` branch and actual scale helpers; it starts no game or audio. Command: `powershell -NoProfile -ExecutionPolicy Bypass -File work/portable-build/tests/run-pinata-particle-test.ps1`. Evidence: `work/portable-review/plant-zombie-gap-audit.txt`, `work/portable-build/logs/pinata-particle-test.log`. This is not an actual browser/native piñata visual pass.
- NO CHANGE: original Cob `UpdateMotion` at `0x475CA0` compares projectile type `0xB` at `0x475D03`, then uses `fldz`/zero store at `0x475D0D`/`0x475D0F`. The port's current roof-velocity zeroing matches that static original behavior. It was retained; no Cob gameplay fix or runtime parity pass is claimed.

### Original runtime capture remains unavailable

- The attempted ordinary original startup reached a Steam startup error and produced no game/JPEG reference capture. Root subsequently reported native baseline comparison true, no remaining GOTY process and all five temporary audio-output mute states restored, with zero outputs muted at that check. This is cleanup/status evidence, not a successful game launch or authentic reference frame.
- Private Steam-window inspection was rejected by automatic approval review; further authorization remains pending. No private window inspection, original JPEG capture or matched native gameplay trace is claimed. Existing human Zombatar consent and the normal acceptance path remain recorded; no new agreement was patched or silently accepted.
- The full 1:1 goal remains active. Static original comparisons and isolated tests close only the named implementation gaps; all original-runtime rendering/timing/matte comparisons and the wider level/mode/ability coverage retain their stated limits.

## Public version 8 deployment and scoped checks (`?testing=1`)

- DEPLOYMENT PASS: source `46eee27f19484936d27dff7083b7b76e8eba0b8a`, deployment `appgdep_6ae1111abdc48191b6b9839bb944e692`, status succeeded at the public URL. Engine is `0.2.6-web-parity.3`. Anonymous checks matched seven artifacts byte-for-byte, with hosting HTML checked for the updated label/cache/source links. Evidence: `work/portable-review/v8-progress.json`, `v8-anonymous-artifacts.json`.
- PASS (actual public UI, reported by root): Information shows `0.2.6-web-parity.3` and its corresponding-source link; the engine script uses `./game/pvz-portable.js?v=191855138ecd`. The QA-Night Main Menu still shows Level 2-2, with no JavaScript errors. Evidence: `outputs/pvz-public-v8-menu.png`. This is a deployment/menu/retained-progress check, not a new level win or original-reference comparison.

### First Vasebreaker complete repeat win (`?testing=1`)

- PASS (actual public UI, reported by root): selected the first Vasebreaker puzzle from the catalog on QA-Night, opened all 25 vases, used Peashooter/Snow Pea/Squash against normal, Buckethead and Jack-in-the-Box zombies, and cleared all enemies. The moneybag appeared at the bottom; clicking it produced the reward zoom/shine animation and returned to the puzzle catalog. Evidence: `outputs/pvz-public-v8-vasebreaker-finish.png` shows the cleared board and moneybag. This is a complete finite repeat win of `GAMEMODE_SCARY_POTTER_1` (mode 51), credited from observed gameplay.
- PASS (actual post-run UI export/file inspection): backup `pvz-portable-savedata (13).zip` passes CRC. QA-Night `userdata/user900002.dat` remains 886 bytes/version 12/Adventure level 12/finished-Adventure count 2; SHA-256 is `082a73f0630e87feac7975bf1b45186deeb71dc9e6322bc6d9c25c770d8262cc`. Compared with actual backups (10)/(11), first Vasebreaker challenge record 50 at offset 216 increases 1 → 2. All other 99 challenge records remain identical, including I, Zombie record 60 = 1. Internal currency rises 10,042 → 10,052, a net $100; this is not labeled as the moneybag's value alone. Evidence: `work/portable-review/v8-vasebreaker-actual-save.json` and the private coverage ledger.
- SCOPE: the catalog showed 18/18 before and after because those trophies were prefilled in the fixture. No new trophy, first unlock, other puzzle win or original commercial runtime comparison is credited. Fresh public reload of this reward has not yet been observed; the post-run saved-file check alone does not earn a fresh-reload persistence pass.

## Original export initialization proof and parity.4 candidate

- STATIC ORIGINAL CHAIN: export at `0x535540` zeroes its ARGB pixels at `0x5355E7..0x5355F5` and sets destination transparency/alpha flags true. MemoryImage construction/initialization at `0x5ABDC0`/`0x5AC3A0` leaves forced mode false; Graphics construction and the direct DrawImage path preserve those flags. The dispatch runs through `0x59F180`/`0x5B2E70` to normal blit `0x5B1950`. Its white general branch at `0x5B19EE..0x5B1B57` matches the current optimized `MI_NormalBlt` alpha normalization and packed-RGB arithmetic. JPEG writing subsequently discards alpha, retaining the resulting RGB.
- EFFECT PROVEN (static/actual-code, synthetic pixels): source `0x80C86432` over original zero ARGB yields `0x80C76331`, while parity.3's opaque-black forced mode yields `0xFF643219`. Even opaque `0xFFC86432` follows the original general branch to `0xFFC76331`. Thus the specific export-initialization RGB effect is established; an authentic original portrait capture remains unavailable.
- CANDIDATE CHANGE: `0.2.6-web-parity.4` zero-initializes the export image and removes the forced opaque-image mode. It retains the existing blitter, encoder, compositor and `SaveDraft`. All four composition/save functions remain byte-identical. Relative to parity.3, only `src/Lawn/Widget/ZombatarWidget.cpp` changes; total scope against upstream remains seven files.
- PASS (isolated actual-code compositor): nine fixtures cover alpha 0/1/64/127/128/254/255, offset drawing and sorted overlap. The parity.3 control fails 120 assertions with 96 RGB mismatches; changing zero fill alone or alpha mode alone also fails. The combined candidate passes all fixtures against the independently translated original white-blit oracle. This test extracts actual production setup, compositor and blitter code and uses synthetic resources; it starts no game/audio and includes no original binary/artwork. Evidence: `work/portable-review/original-zombatar-matte-audit.txt` and `work/portable-build/matte-candidate/tests/results.json`.
- BUILD / INTEGRATION PASS (reported by root): private compilation and all 15 checks passed. Actual local browser export/retry/Quit/reload/backup checks also passed below; publication remains pending. No original-runtime composed-pixel or exact JPEG-byte equivalence is claimed, and untested tint/mask/asset paths and broad gameplay/rendering/timing coverage remain open.
- CANDIDATE ARTIFACTS: JS SHA-256 `191855138ecd39b8516b2b891d7506c86d3b3f431eaf1f08153eef8d2086a672`; WASM SHA-256 `a4b7b7e8cc6d000a4b553499b628b286f54b4e4fedac35ed0abe87044c76decf`; source `dist/source/pvz-portable-0.2.6-web-parity.4-source.zip`, SHA-256 `574e760c35cd4409da74a30c8d8d196bddf05e78efc5453e99eb782ff7c6a208`; patch `dist/source/web-parity.4.patch`, SHA-256 `1a74bf280a16c1d12a30931b14ecccbf97135b73840008a03e739bb656a130ab`. Prior sources/patches remain retained. These candidate hashes do not describe a later public deployment.

### Actual local parity.4 JPEG, retry and fresh-reload persistence (`?testing=1`)

- PASS (actual UI, reported by root): QA-Roof gallery began at 1/4. Creating a skin-0 zombie without optional parts and with the first Crazy Dave/tree-fence backdrop grew it to 5/5. The exported portrait was upright, correctly composed and free of editor chrome. Ordinary retry/Done left 5/5.
- PASS (actual files, read-only inspection): `Zombatar_4.jpg` is 6,302 bytes, SHA-256 `7f29c207b5deb2e1d85f3e7e3d3edcc61fb094bef29823b9c1b390692d102059`, RGB 180×180 baseline JPEG. All 128 DQT values match the static-original functional fixture, sampling is Y2×2/Cb1×1/Cr1×1, and reduced DHT symbol counts DC8/7 and AC51/28 support configured optimized coding. Retry `Zombatar_4 (1).jpg` is byte-identical. Preserved output: `outputs/pvz-parity4-zombatar-export.jpg`.
- PASS (fresh runtime, reported by root): original Quit/confirmation reloaded the page. QA-Roof Main Menu → Zombatar restored 1/5; four ordinary Next actions reached 5/5 with the correct new plain portrait and no extra record. Evidence: `outputs/pvz-parity4-zombatar-restored.png`.
- PASS (actual post-reload UI export/file inspection): `pvz-portable-savedata (14).zip` passes CRC. QA-Roof detail is 1,334 bytes and contains exactly five portrait records. `userdata/zombatars/user900005/Zombatar_4.jpg` occurs once and matches the 6,302-byte actual download/hash exactly. All three prior standalone JPEGs remain byte-identical to backup (12). The five records have four JPEGs because the earliest baseline portrait lacked a standalone export. Evidence: `work/portable-review/parity4-zombatar-actual-export.json`/`.txt`.
- SCOPE: these are actual local candidate export/codec/retry/save/reload checks; publication remains pending. They do not establish authentic original composed pixels or exact JPEG bytes. Original source-image loading/cache-conversion proof and untested native tint/mask/asset paths remain separate limits; full original-game parity remains active.


## Bundled automatic startup update, 2026-10-27

- AUTHORIZATION: user requested startup without selecting game files, kept import/export for saves, and explicitly approved "Bundle the original assets publicly". This supersedes the previous public-asset exclusion.
- ASSETS: six exact installed GOTY runtime files, total45,462,524bytes in11parts. Manifest id `sha256:b468b22439430ca4a36035b886a74bd831a86b2a1a36c39d3203396f5b75d093`. No native executable, library, original save or private QA export is included.
- PIPELINE: original ZIP and installed-directory inputs reassemble byte-for-byte; repeated build is byte-identical. Fourteen private deterministic/integrity/rejection checks pass; published recipe can verify the complete output without an installation.
- ENGINE: stable parity.4 hashes/source remain unchanged; Software.2/.3 work remains private.
- PASS ACTUAL LOCAL: first visit at127.0.0.1:4198/?testing=1 reached the original title automatically with zero filechooser actions; original new-user flow created Fileless QA and reached the normal menu. Import icon opened save management, flushed/reloaded safely, imported actual backup15, and resumed automatically after closing More. Export16 passes CRC and preserves all13 imported regular file bytes exactly, including registry/index/details/JPEGs. QA-Night Level2-2 restored; final JavaScript error log empty. Screenshots outputs/pvz-fileless-local-fresh.png, pvz-fileless-local-new-user.png and pvz-fileless-local-restored.png. Resource cache/durable failure/retry, startup/save ordering, native/modal keyboard and new import feedback pass actual-code automated tests; offline-payload and browser feedback retests are not claimed. Public deployment verification follows packaging.


## 2026-10-27 — Historical Software.4 scoped renderer release checks

Engine0.2.6-web-software.4 uses exact WASM c309fbb5aff76fa0a3880932b2348debd2656db84e06051d3606c11810ead88b and JS6d0f4b08aa4bcaee8c7ed1236e2947acd63e64a22e225daf2a1589d2f751171d. Source ZIP649863914351065e939ada9a09cd61f63c12839de970912eb984420910b94458 and combined upstream patch19021e7958c36beb53a2bfb3f1aa2a029cde17123fbc47f9fc94d02eed630ea1 passed independent byte/CRC/scope checks. All755 engine files reconstruct exactly; no original executable/disassembly or real saves occur in corresponding source.

Root observed fresh automatic bundle startup, generated QA-profile merge, native3D checked→CPU unchecked/reopened, fog/pool planting, repeated CPU/hardware switching and fullscreen icon entry/exit. A separate controlled repeat4-1 test used three left-column plants (Puff80,145; Lily80,310; Plantern80,480), holding the board with its native Menu. Seven independently viewed screenshots show all three retained through the fullscreen/mode sequence, original saved exit/Quit/fresh boot, unchecked CPU/fullscreen options and actual Continue restoration with seed bar/sun0. The tested implementation/binaries/assets matched the frozen52-file stage; only release documentation/provenance is updated afterward. Scoped error-level console queries returned none.

Earlier Software.4 live gameplay showed three Puff-shrooms and no visible Plantern after time elapsed between actions. Its historical cause is unverified; the controlled three-plant test did not reproduce the change. Do not retroactively certify the earlier run. Synthetic Escape did not exit browser fullscreen, so actual browser-reserved Escape exit remains unverified; icon exit and native checkbox synchronization passed.

An existing native diagnostic session recorded Seconds311.334, SleepCount12962, UpdateCount29738, DrawCount26011, DrawTime196816, last ScreenBlt1 and internal AvgFPS132. This mixed-mode/menu/pause session is not delivered or dense-scene FPS; the native formula uses only the last blit interval. No performance comparison to the prior internal237 value is valid.

Known software-screen mirror-stretch sampling and FillRect rounding differences are separately supported by addressed native equations and actual-code counterexamples. Private next-candidate fixes remain excluded here. Other renderer paths, original composed JPEG/frame equality, all campaign levels/modes/abilities and timing remain incomplete. The goal is active. The first staged I,Zombie attempt ended in an observed loss at1/5brains with25sun after missed income; no puzzle win is credited.

## 2026-10-27 — Historical Software.5 scaled-mirror and fill source checks

Software.5 changes only `CMake/ProjectVersion.cmake` and the dedicated `SoftwareScreenImage.cpp`/`.h` relative to frozen Software.4. Its other 752 source files, ordinary screen Blt/Stretch and literal offscreen MemoryImage arithmetic remain unchanged. It retains earlier Zombatar/JPEG, fullscreen, piñata, save, audio, keyboard and file-free startup corrections.

- PASS BUILD/PACKAGE: isolated full Release compile/link and JS/WASM validation; independent source ZIP CRC/scope/byte checks and real Git application of both patches reconstruct all 755 engine-source files. JS SHA-256 `6d0f4b08aa4bcaee8c7ed1236e2947acd63e64a22e225daf2a1589d2f751171d`; WASM `9880df0563d4d677de68297fa6418647496c07aec233fc7cfbca6226daaa84e1`. Corresponding source ZIP `pvz-portable-0.2.6-web-software.5-source.zip` is 5,150,995 bytes/873 entries, SHA-256 `82abbd0420c088805756598398ceecbbf07dbd93412a4e58117fe4e1ffe567af`. Complete upstream `web-software.5.patch` SHA-256 `dd009d78e31563b9c4eb73d16545ae09c652a2cc3f5a0757bb349d2199278320`; incremental `software4-to-software5.patch` SHA-256 `4673bd0339459b2d87777f0b2e4348922aa096a9b73dc1512bd43b1f7fdb5884`.
- PASS ADDRESSED MIRROR: original software path clips then reads forward 16.16 source coordinates while writing destination right-to-left, independent of the fast flag. Normal/tint/global-alpha and nonzero additive modes follow the addressed original equations. Actual virtual-method tests cover raw and indexed sources, alpha endpoints/partials, forced metadata, clipping and both fast flags. Indexed fixtures use distinct palette colors, null raw bits immediately before the call and faithful lazy expansion. Of 98,802 assertions/16,964 draws/226 indexed calls, frozen Software.4 fails 21,208 as expected; Software.5 fails zero.
- PASS ADDRESSED FILL: an independently authored scalar native reference checks the actual packed implementation and virtual/inherited fill routes. Opaque normal positive channels map to channel minus one; partial normal fill rounds the source and floors the destination separately; additive fill uses its original saturated contribution. Across 2,118,543 checks, frozen Software.4 fails 539,971 as expected and Software.5 fails zero. Scope includes valid rectangles, mode handling, channel/alpha grids, guards and inherited axis-line/span routes; offscreen and normal nonaxis bodies remain unchanged.
- PASS RETAINED: 149 primitive assertions, 20 offscreen native-stretch fixtures, 20,900 DD32 pixel/dispatch assertions, mode transition, final presenter and nine matte fixtures. Source and arithmetic reviews are static/synthetic evidence, not authentic original runtime screenshots.
- HISTORICAL OWN RUNTIME: Historical private Software.5 checks completed the second ordinary To the Left run: all 25 vases and enemies cleared, the reward was clicked, the white fade/Achievements/Continue sequence returned to the settled puzzle catalog. Left-facing Repeater attacks, Snow Pea slowing, Jack explosion chains, Bucket armor loss, Wall-nut chewing and Potato Mine rising were observed. The 18/18 trophies and four achievements were prefilled, so no earned unlock is credited. Native CPU/fullscreen switching retained known placements. Later visible CPU tooltips and normal Main Menu/Leave/Quit/fresh-title/Continue restored CPU preference, Sun-shroom and Puff-shroom placements, 25 sun and the ten-packet bar. These are Software.5 observations only; no save-export byte comparison or original framebuffer equality is claimed. Software.6's separate scoped observations are recorded below; this historical result supplies no Software.6 finite-win or pixel-equivalence credit.
- REMAINING: successful ordinary nonvolatile RGB888 screen conditions only; complete unscaled mirroring, other host formats/DD16, driver/volatile/cache paths, fractional/rotated/matrix/triangle/coverage math, original composed JPEG/frame pixels and dense-scene performance remain incompletely verified. Nonaxis additive AA remains a native-no-op/port-extension difference with no game caller found. All levels/modes/plant and zombie behaviors remain in scope. No Software.5 deployment or full 1:1 completion is claimed here.

## 2026-10-27 — Software.6 unscaled-mirror source checks

Software.6 changes only the version and dedicated `SoftwareScreenImage.cpp`/`.h` relative to Software.5. All other 752 engine files and all seven prior screen method bodies remain unchanged. Its new BltMirror commits the source, retains the reversed temporary and selects the native general pixel-alpha mirror route. Deferred unforced raw and palette changes are ordinary API counterexamples: `80808080` over `202020` produced `404040` in Software.5 versus native-derived `505050`; alpha-zero produced black versus unchanged destination. Source flags do not choose that native mirror equation. Normal/additive/tint/global-alpha, valid Graphics right-side source cropping and fresh current-cache conditions are addressed; preserved alias safety is a compatibility control, not an added native cache/alias-equivalence claim.

The full isolated Release compile/link and JS/WASM validation pass. The paired actual-class regression has 3,039,478 assertions over 1,505,732 draws/226 genuine indexed calls: Software.5 fails 14,336 as expected, Software.6 zero. Indexed fixtures null raw bits and install distinct palette colors immediately before the virtual call. Ordinary unforced opaque-to-dirty-partial/zero sources and source CommitBits postconditions are checked. The new runner writes UTF-8/LF and hashes the actual compiled generated C++ bytes. Retained 98,802 scaled-mirror, 2,118,543 fill, 20,900 DD32/dispatch, 149 primitive, 20 MI-stretch, mode, presenter and nine matte checks pass.

JS SHA-256 `6d0f4b08aa4bcaee8c7ed1236e2947acd63e64a22e225daf2a1589d2f751171d`; WASM `29253249c1697d79f4a89ba405e4bf5b8996bc90830897c32b55a7ecb1473ba1`. Source ZIP `pvz-portable-0.2.6-web-software.6-source.zip` is 5,460,587 bytes/911 entries, SHA-256 `0358d6b633c2c900f49a89d948dc6b72ab542a56bea6fa8de66f33f40d708794`. Complete raw-upstream patch `web-software.6.patch` SHA-256 `169d806a879973f31a1cd557dd80a9dce3b9d6854d9d6a3c119bcfa9b3723d32`; labeled `software5-to-software6.patch` SHA-256 `d3b751ec2942b73d141d41bb1da24a7eb4515c4517cbefe791d3e72f3f5cb404`. The full 755-file current source builds without the incremental patch.

The source/build/math evidence above remains separate from Software.6's own scoped local runtime observations below. No Software.5 runtime result transfers. No original framebuffer, DD16/other formats, volatile/device/cache-recovery, fractional/rotated/matrix/triangle/coverage or whole-game equivalence follows. Nonaxis additive AA and offscreen tint/additive remain distinct limits. No deployment or complete 1:1 result is inferred.

## 2026-10-27 — Software.6 own scoped local browser checks

The actual private 4198 run used exact Software.6 WASM/source identities above and `?testing=1` forced inaudible output. Information/source URLs and automatic file-free original title passed. Six generated QA profiles were added through the ordinary More/Advanced controls; their progress/unlocks are fixtures, not earned campaign progress. Native 3D initially checked, then unchecked selected CPU composition.

On QA-Night repeat Adventure 2-1, Sun-shroom at c1/r0 and Puff-shroom at c2/r1 with 25 sun were visible. The exact ten-packet bank was Cherry Bomb, Jalapeno, Torchwood, Puff-shroom, Sun-shroom, Fume-shroom, Grave Buster, Wall-nut, Peashooter and Sunflower. The CPU yellow/black “recharging… Cherry Bomb” tooltip was captured in `pvz-software6-checkpoint-tooltip.png`. This is an ordinary visible fill scene, not an original RGB comparison or a direct new-mirror invocation trace.

The fullscreen icon entered/exited with DOM fullscreen and the original Full Screen checkbox synchronized; the observed canvas rectangle was 1422×1067. CPU → hardware checked → CPU unchecked preserved both plants, 25 sun and the seed bank. Original Menu → Main Menu → Leave saved the board, then main-menu Quit/confirmation returned automatically to the original title. Start → Options restored the unchecked CPU preference (`pvz-software6-restored-cpu-preference.png`); Adventure → Continue restored both known plants, 25 sun, all ten packets, four graves and the existing zombie (`pvz-software6-restored-checkpoint.png`). Zombie movement after resuming was observed; the board was then held with its native Menu. The post-restart error-level console query returned `[]`.

Seven native session diagnostics recorded Seconds 312.028, Sleep Count 14,769, Update Count 30,852, Draw Count 26,242, Draw Time 189,470, last Screen Blt 2 and internal Avg FPS 138. This was a mixed hardware/CPU/menu/pause/tool-delay session. The internal value is not delivered or dense-scene FPS, and no comparison to older internal counters is valid.

These are Software.6's own bounded local startup/identity/CPU/tooltip/fullscreen/mode/preference/visible-checkpoint observations. No Software.6 finite win, save-export byte comparison, original framebuffer/JPEG equality, direct new BltMirror/StretchBltMirror invocation, dense-scene performance or all-level/mode/ability parity is credited. Software.5's To the Left win remains historical to that build. No anonymous public Software.6 verification or deployment is claimed here.

## 2026-10-27 — Software.7 scoped RGB888 reanimation raster source checks

Software.7 keeps the dedicated ordinary RGB888 CPU screen and earlier bitmap, stretch, mirror and fill corrections. It corrects two addressed reanimation callback differences: additive passes now use saturated addition, and bilinear sampling repeats whole-texture edge neighbors with the original fixed-point floors. The correction is enabled only inside the actual screen matrix/triangle virtual calls, with the same target buffer and pitch. Five alpha-textured white/global/constant-vertex combinations are covered; other callbacks and offscreen MemoryImages retain Software.6 behavior. The triangle clipping, scan conversion and interpolants stay unchanged. Other formats, driver/volatile/cache/device paths, unclosed modulation combinations, transformed geometry, original framebuffer equality and dense-scene performance remain incomplete. CPU composition still presents through WebGL.

Software.7 passes the isolated full Release compile/link and JS/WASM/version checks. The paired actual-code callback regression compares 36,175,872 broad buffer assertions and 222,720 assertions from 13,920 independently authored mixed-alpha/texture-dimension fixtures per variant. Frozen Software.6 has 13,512,240 broad and 47,990 fixture differences as expected; Software.7 has zero. The independent scalar header agrees with all 13,920 authored expected cases. Both variants produce identical offscreen hashes. A separate extracted production context/virtual-method suite passes 169 checks per variant, and all 82 unclosed expanded callbacks are identical to Software.6. Retained unscaled/scaled-mirror, fill, DD32, primitive, offscreen-stretch, renderer-mode, presenter and nine portrait tests pass. The complete raw-upstream patch reconstructs all 757 engine files byte for byte. These are bounded source/build/synthetic checks, not an original runtime capture.

The ordinary source route is reanimation direct matrix/global tint or atlas triangles/constant vertex tint into software callbacks. This is source/API evidence, not a captured native/web pixel trace. For an interior tinted additive fixture, Software.6 produces `FF275ADE` while the addressed native equation and Software.7 produce `FF379EFF`. A whole-texture edge normal fixture produces `FF208ADF` in Software.6 versus `FF7F7ED3` in native math and Software.7. The sampler uses full texture dimensions, never an atlas subrectangle clamp. Actual production RAII/query and virtual screen wrappers are exercised with a base-draw double; unchanged MI geometry is not emulated or re-proved by that test.

JS SHA-256 `905679974d24b7657297c42cfb39b3201f4168cf2e607efb7a8a45cf0a1d9669`; WASM `e8a1621e32e4edffd44a47efb51f9798cb609478b6865a7583e7c057915eafb9`. Source ZIP `pvz-portable-0.2.6-web-software.7-source.zip` is 5816054 bytes/974 entries, SHA-256 `66b4cf8c473f1c9e6293a60cb2d7864b24cd91b0803745a77ef62c1669cacc3a`. Complete raw-upstream patch SHA-256 `370f8ac85247d02ef214e6c23ed8db0ae07948fba557edb25519e22cc4c50f67`; six-path increment `software6-to-software7.patch` SHA-256 `e81c2ca22abca546db02e630d57ed5e71b850b6f15ebfd3f2a5eca5bbaeb68d9`. Four existing engine files change and two narrow includes are added; all 751 other files and eight old screen method bodies remain Software.6. Whole-file source hashes use raw bytes; historical per-method metadata uses decoded text and is labeled separately in the source review.

A muted local Software.7 run observed its automatic original title, Information/version/source links and six generated QA profiles installed through ordinary More controls. Native CPU selection remained unchecked on Options reopen; the fullscreen icon enlarged the layout with the original Full Screen checkbox checked and returned, and a hardware/CPU roundtrip retained the planted board. Original Menu/Main Menu/Leave and Quit/confirmation returned to a fresh file-free title. The selected QA-Night profile and unchecked CPU preference persisted; Adventure/Continue visibly restored the same ten-packet bank, zero sun, Sunflower at c0/r2, Puff-shroom at c1/r2, graves, enemy and mowers. This is Software.7's own bounded ordinary-UI pass, with visible checkpoint restoration rather than exported-byte or exact-actor comparison.

The post-restart error-level console query returned no entries.

At this earlier basic Software.7 checkpoint, no finite win, earned unlock, explicit hit/chill comparison, save-export byte comparison, direct corrected-callback trace, authentic original frame/JPEG equality or dense-scene performance was credited. Later private Software.7 Zombiquarium and Survival: Day wins are separately recorded in the current source/build context above; they do not transfer to Software.8. Full 1:1 parity remains active and incomplete.


## 2026-10-28 — Software.7 own scoped local browser checks

The private 4199 run used the exact Software.7 engine/source identities above and an early testing guard that forces inaudible output. The original title appeared without a resource chooser; Information showed Software.7 and corresponding-source links. Six generated profiles were added through ordinary More/Advanced. Their unlocks are test fixtures, not earned progress.

On repeat Adventure 2-1 with QA-Night, the ten-packet bank was Hypno-shroom, Doom-shroom, Puff-shroom, Snow Pea, Sunflower, Sun-shroom, Peashooter, Wall-nut, Grave Buster and Potato Mine. Sunflower(c0/r2), Puff-shroom(c1/r2) and zero sun were recorded. CPU selection survived Options reopen; toolbar fullscreen enlarged the layout, native Full Screen checked and returned. The hardware/CPU roundtrip retained the known planted board. This records layout/native-checkbox evidence, with no additional browser Escape/rejection or callback-invocation claim.

Original Menu/Main Menu/Leave saved the checkpoint; main Quit/confirmation returned to an automatic fresh title. QA-Night and unchecked CPU preference persisted. Adventure/Continue prompt and Continue visibly restored the same bank, zero sun, two left plants, graves, enemy and mowers; the checkpoint was saved again and the game returned to a native menu. This is visible restoration only, not actor-byte or save-export equality. Seven proof filenames are pvz-software7-fileless-title.png, info.png, cpu-options.png, fullscreen.png, night-checkpoint.png, cpu-preference-restored.png and night-restored.png (each with the pvz-software7- prefix). No screenshot file is distributed with this source.

The post-restart error-level console query returned no entries.

At this earlier basic Software.7 checkpoint, no finite win, earned unlock, explicit hit/chill comparison, save-export byte comparison, direct corrected-callback trace, authentic original frame/JPEG equality or dense-scene performance was credited. Later private Software.7 Zombiquarium and Survival: Day wins are separately recorded in the current source/build context above; they do not transfer to Software.8. Full 1:1 parity remains active and incomplete.
