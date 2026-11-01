# Chill-shroom proportions, shading and animation

The user rejected Chill.3 as too flat/simple and requested better proportions,
shading and animation. Image generation is explicitly permitted for the plant.
The restriction on separately generated challenge pictures remains. Current
work is `0.2.6-web-chill.4`, based on Chill.3. The older formal parity goal is
still paused; a new objective was rejected while that unfinished goal exists.
This manual record does not replace or falsely complete it.

Completion criteria:

- Give Chill-shroom a fuller asymmetric blue cap, painted volume and a deep
  underside, compact rounded cream/mint body, expressive eyes and tucked feet.
  Keep it distinct from Ice/Puff with no muzzle or crystal-forest silhouette.
  Use the generated plant atlas as a frozen input with transparent PNG parts.
- Preserve the visible cap at 84 by 46, body at 48 by 38 and feet at 40 by 11
  inside the native canvases, without stretching the fuller cap back to the
  old approximately 100 by 44 umbrella proportions. Preserve pivots/eye clearance.
- Use seamless full-body half/closed expressions whose pixels match the open
  body outside the eye bounds. Restore body/owned-blink binding before paused
  Continue drawing without resetting saved health, placement or pulse phase.
- Improve motion with gentler whole-plant compression, independent cap lag and
  rebound, while retaining the 40-tick wind-up and 30-tick release/recovery.
  Do not change pulse timing, radius, chill duration, cost/recharge, eligibility,
  stronger chill/freeze preservation, no-damage behavior or inactive guards.
- Keep challenge pictures as centered native compositions of actual Conehead,
  Puff-shroom and revised Chill-shroom sprites over original grass. Generate no
  separate challenge illustration. Keep readable earned/unearned states, original
  frames/titles/trophies/hover and no added Bonus tips or extra HUD.
- Preserve all original content, IDs, save layouts/filenames, checkpoint and
  completion routing, worker, schema 2, QoL and normal-player audio.
- Run focused native/browser/artwork/save checks with testing sound off. Inspect
  the actual sprite, idle/wind-up samples, cards and existing checkpoint at game
  size. Verify detailed curves, blink/release and saved phase with production
  tests; do not claim a full visual cycle from sparse samples. Do not substitute
  historical results or claim subjective perfection.
- Preserve frozen atlas, generation/reference records, extraction recipe/code,
  PNG parts, provenance, complete source/dependencies/licenses and original
  resource identities. Verify deterministic extraction separately from image
  generation. Publish to the existing GitHub repository and Pages site, keeping
  the 100 MiB policy and separate source-package/hosted receipts.

Pre-publication local status on 2026-11-01: implementation and bounded checks
pass. The 226.121-second coherent Release build preserves all 776 source files.
Seven native suites pass 1,513 checks (66/90/105/139/557/131/425), with matching
source/harness pins; fourteen browser suites include eleven worker scenarios.
Eight public PNG/JSON files plus the native header reproduce from the frozen
atlas/recipe. Both source patches reconstruct all 776 current files.

Actual muted review confirms centered earned/unearned pictures, red native hover
without added tips, consistent packet/lawn/card paint and new parts already in
the paused Continue backdrop. The existing 50-sun Sun/Chill/Puff board restores.
Two reliable clips show idle and seamless closed-eye wind-up; the third sample
has a partial size and is not full-cycle evidence. Detailed motion, blink/release
and save phase are covered by production tests. No complete visual cycle,
full battle, earned win or fresh save cycle is claimed. Owned test tabs 20/21
are closed. Publication remains, with website/runtime package and hosted
receipts recorded separately by the publisher.

[Generation](dist/content/chill-shroom/generation.json),
[extraction](dist/content/chill-shroom/extraction.json),
[sprite provenance](dist/content/chill-shroom/provenance.json) and
[native card provenance](dist/content/native-bonus-art.json) record current
inputs. Earlier Chill.3 vector art was rejected as too flat; its functional
results remain historical. The new atlas is plant artwork, not a generated
challenge illustration. Deterministic extraction does not mean image generation
itself is reproducible or prove exhaustive original-game parity.
