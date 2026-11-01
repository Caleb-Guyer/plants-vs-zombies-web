# Plants vs. Zombies — browser playtest

[Play on GitHub Pages](https://caleb-guyer.github.io/plants-vs-zombies-web/) · [Existing playtest](https://lawn-defense-caleb-plays.usgi.chatgpt.site) · [Deployment](DEPLOYMENT.md) · [Requirements](CURRENT-REQUIREMENTS.md) · [QA history](PARITY-QA.md)

This source uses **0.2.6-web-chill.3**, based on PvZ-Portable 0.2.6 commit `396f1c7fcf0507dcd1b79dc1ffad139eea2fb6ca` and the Chill.2 parent. The user clarified that a custom plant sprite is allowed; the restriction concerns AI-generated challenge pictures. Chill-shroom's distinct sprite uses editable vector/code-drawn parts instead of copying Ice-shroom's appearance. Challenge cards remain centered native compositions of the actual game sprites. The revision preserves radial slow/attack, challenges, simplified menus, background save worker, controls, save recovery and renderer corrections. Full 1:1 parity remains unverified; broad manual validation stopped at the user's request on 2026-10-31. Earlier release evidence below remains historical.

The Software.10 and earlier QA descriptions below are the frozen v18 evidence snapshot. They retain their original capture-time scope, including earlier limits; they are not a claim that later validation or the full parity goal is complete.

## Play and saves

The website automatically downloads, verifies and caches its bundled original GOTY runtime data. No local game file is required. The original title's Click to Start remains part of the game.

The native 800×600 game fits at 4:3. Five discreet icons provide mute, fullscreen, save import, save export and more. Import/export handles **saves only**. More contains attribution, licenses, source downloads, additional save tools and optional generated QA profiles. Save an active level through the original Menu → Main Menu flow before importing or exporting a checkpoint.

Saves persist automatically in this browser without export/import. The existing five-second autosave interval, schema 2 storage and native save layouts are retained. Checksums, backup history and IndexedDB transactions run in a dedicated worker; capturing written game files remains on the main thread. Saves and asset caches use separate browser stores. Export preserves native profile/registry/detail bytes, portable board saves and per-profile QoL settings and plant decks. Import validates ZIP/folder contents and rolls back failed changes. Browser storage can be cleared by the player or browser; export progress before switching browsers. Generated QA profiles are fixtures, not earned campaign progress.

## Audio and rendering

Normal players have music and sound effects, subject to browser autoplay rules and the saved mute preference. The mute icon remembers the player's choice; original volume controls remain available. **All agent testing uses `?testing=1`, which forces inaudible output without changing the normal-player preference.**

## New plant and Bonus challenge: Cold Front

Once Mini-Games is unlocked, choose **Mini-Games → Bonus → Cold Front**.
Chill-shroom is a support mushroom: every four seconds its cold pulse briefly slows
nearby grounded zombies. It costs **75 sun**, recharges in **7.5 seconds** and
slows for **1.5 seconds** per pulse. It deals no damage, so pair it with Puff-shrooms
and Fume-shrooms. Stronger existing chill and freezing are preserved.

The challenge uses the original night lawn, 150 starting sun, no falling sky sun,
twenty authored waves and two flags. Its fixed bank is Sun-shroom, Puff-shroom,
Fume-shroom, Chill-shroom, Grave Buster and Doom-shroom. Newspapers, poles and
buckets arrive gradually; native graves and final-wave grave zombies remain.
It has an independent checkpoint and completion record. Chill-shroom is
introduced in this challenge; the original campaign, chooser and unlocks retain
their familiar content.

The custom sprite has a rounded, asymmetric dusty-blue frost cap,
simple white spots, a mint/cream stem with dark pill eyes and a low organic base.
Five [editable SVG/PNG parts](dist/content/chill-shroom/) include matching blink
patches; [provenance](dist/content/chill-shroom/provenance.json) records the
vector recipe and code renderer. The native
Ice reanimation supplies motion while the art gives Chill-shroom its own
muzzle-free identity. Its 40-tick wind-up, outward frost release and 30-tick
recovery retain the existing attack behavior. No image-generation tool is used.

The three native 80×65 Bonus pictures stay centered compositions of actual
sprites: original Conehead for Cone Zone, original Puff-shroom for Night Shift
and the actual custom Chill-shroom for Cold Front, over original grass. There is
no separately generated challenge illustration. Their
[resource provenance](dist/content/native-bonus-art.json) records the inputs.
Added Bonus tips remain absent. Original seed packets, menus and flags stay in
use, with no extra HUD. Seed 75, mode 75, checkpoint filenames, completion
records and native save layouts remain compatible. Older generated paintings
remain historical source/Git evidence and are not active card artwork.

## Bonus challenge: Night Shift

Once Mini-Games is unlocked, choose **Mini-Games → Bonus → Night Shift**.
Survive **twenty waves across two flags** on the original nighttime lawn, with
**150 starting sun** and no falling sky sun. Grow Sun-shrooms to fund your defense.
The fixed bank contains Sun-shroom, Puff-shroom, Fume-shroom, Grave Buster,
Ice-shroom and Doom-shroom, with their normal costs, recharge and behavior.

Normal zombies give way to coneheads, newspapers, screen doors and later buckets.
The native night lawn includes graves and its final-wave grave rise; the authored
wave table is separate from those grave zombies. Night Shift uses original artwork,
the standard challenge card and flag banner, with no extra information overlay.
It has its own saved checkpoint and completion record. Save/resume, restart and
save import/export include Night Shift without changing Cone Zone or original
campaign progress, unlocks or trophy totals.

## Bonus challenge: Cone Zone

Once Mini-Games is unlocked, choose **Mini-Games → Bonus → Cone Zone**.
Cone Zone uses a daylight lawn with
**150 starting sun, six fixed plants and twenty authored waves across two flags**.
Sunflowers and falling sun work normally. Coneheads become the main threat,
with a few pole-vaulters and bucketheads later in the level.

The fixed bank contains Sunflower, Peashooter, Wall-nut, Potato Mine, Snow Pea
and Cherry Bomb. Costs and recharge times retain their normal behavior. The
level has its own checkpoint and completion record; it does not advance the
original campaign or original trophy totals. Save/resume, restart, autosaves
and save export/import include the bonus checkpoint. Canceling Continue returns
to Bonus. The Bonus page now uses the standard challenge grid/card layout; the challenge uses the native flag banner. The original Mini-Games grid remains available through its footer.

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

## Chill.3 pre-publication evidence, 2026-10-31

[Revision criteria](CHILL-REVISION-GOAL.md) follow the clarification allowing a
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

Current corresponding source is [Chill.3 engine source](dist/source/pvz-portable-0.2.6-web-chill.3-source.zip), with [web-chill.3.patch](dist/source/web-chill.3.patch) as the full upstream patch and [chill2-to-chill3.patch](dist/source/chill2-to-chill3.patch) as the increment from [Chill.2 source](dist/source/pvz-portable-0.2.6-web-chill.2-source.zip). Final newline-normalized art/source/package identities are recorded separately by the publisher. The complete source builds without applying a patch. [Engine provenance](dist/game/engine-provenance.json) and the [build record](dist/source/build-provenance.json) pin completed release artifacts. Source packages retain complete current source, required parent/upstream inputs, tests, assets, editable art/code, dependencies and licenses; full original runtime payloads remain in the runtime distribution. Packaging uses the GitHub Pages 100 MiB per-file ceiling instead of the obsolete 25 MiB provider limit. The website source contains the save worker and shared storage core, and `dist/ui` records attribution and hashes for original save-recovery artwork.

Public v15 preserved the three approved XML resource files' original CRLF bytes in Git and added the matching attributes rule, closing the fresh-checkout checksum blocker without changing the Software.7 runtime. GitHub Pages publication succeeded on 2026-10-31 through [release workflow 41230962473](https://github.com/Caleb-Guyer/plants-vs-zombies-web/actions/runs/41230962473). The bounded hosted startup check does not establish full game parity. The user authorized publication of the current build on 2026-10-31 while full 1:1 parity remains unverified; publication does not mark that goal complete.

PvZ-Portable © 2026 Zhou Qiankang and contributors, LGPL-3.0-or-later; bundled dependencies retain their licenses. Plants vs. Zombies and its original names, characters and assets belong to PopCap/Electronic Arts. This unofficial community-engine playtest has no affiliation or endorsement.
