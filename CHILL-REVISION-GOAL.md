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
