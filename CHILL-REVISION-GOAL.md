# Chill-shroom custom sprite and native challenge pictures

The user clarified on 2026-10-31 that a custom plant sprite is allowed. The ban
concerns AI-generated challenge pictures. Requiring Chill-shroom to copy
Ice-shroom's appearance was an overly broad interpretation and is superseded.
The older formal parity goal remains paused; the goal tool rejected a new
objective while that unfinished goal exists. This manual record does not
replace or falsely complete it.

The current source is `0.2.6-web-chill.3`, based on Chill.2. Player-facing
names remain **Chill-shroom** and **Cold Front**. Gameplay, seed 75, mode 75,
record 74, checkpoint filenames and native save layouts remain compatible.

Completion criteria:

- Give Chill-shroom a distinct custom mushroom appearance: rounded asymmetric
  dusty-blue frost cap with broad white spots, mint/cream stem, dark pill eyes
  and low organic base. Use editable vector/code-drawn parts, not a copied Ice
  crystal crown, yellow lantern or muzzle. No image-generation tool is used.
- Preserve the native Ice motion carrier while binding all five custom parts
  consistently through idle, blink, sleep, wind-up and release. Match pivots,
  eye clearance and skin across body and separate blink reanimations. Restore
  image overrides before the first paused draw after native Continue.
- Keep challenge pictures as centered native compositions of actual sprites:
  original Conehead, original Puff-shroom and actual custom Chill-shroom over
  original grass. Use no separately AI-generated challenge illustration.
  Retain uniform visible-alpha fitting in the 80 by 65 frame and readable
  earned/unearned trophy states. The packet, card and lawn must show one identity.
- Retain the 40-tick wind-up, outward cold release and 30-tick recovery, the
  400-active-tick pulse, 150-pixel radius, 150-tick native chill, 75-sun cost,
  750-tick recharge, enemy eligibility, stronger chill/freeze and no damage.
  Preserve paused/sleep/dead/grabbed/squished behavior and saved pulse phase.
- Keep added Bonus tips absent and retain original title hover, frames, trophies,
  menus, packets, flags and discreet icons without new HUD or instruction panels.
- Preserve original content, all IDs, serialized fields, checkpoint/completion
  routing, schema 2, save worker, automatic saves, QoL and normal-player audio.
- Run focused native/browser/artwork/save checks silently with `?testing=1`.
  Inspect the assembled sprite, attack and centered cards at native game size,
  then check existing checkpoint restoration without substituting old results.
- Publish complete source, editable SVG/JSON and rasterization code, PNG parts,
  provenance, dependencies and licenses to the existing GitHub repository and
  Pages site. Keep the GitHub 100 MiB policy; record packaging/hosting separately.

Pre-publication local status on 2026-10-31: implementation, focused tests and
native visual/save criteria pass. The tested 245.914-second Release snapshot
kept all 775 source files unchanged; seven native suites pass 1,476 checks and
fourteen browser suites include eleven worker scenarios. The sprite has editable
SVG/JSON, PNG parts and a Pillow renderer; final LF-normalized art/source/package
identities have a separate publisher record.

Actual muted review confirms consistent custom art in packets/cards/lawn,
centered earned/unearned pictures and native red hover without tips. Continue's
paused backdrop already shows the new parts; the existing 50-sun Sun/Chill/Puff
board restores. A bounded 168-frame/5.6-second capture shows closed-eye wind-up,
twelve-direction frost release and idle recovery without old Ice/blue blink
flashes. No fresh save-transfer, earned win or full playthrough is claimed.
Publication remains, with website-source/runtime packaging and hosted rollout
recorded separately. The user's existing public game tab was untouched.

[Custom sprite provenance](dist/content/chill-shroom/provenance.json) records
code-drawn inputs; [native card provenance](dist/content/native-bonus-art.json)
records composition inputs. Earlier Chill.2 counts and screenshots remain
historical, including its superseded original-Ice-only interpretation.
Automated tests and bounded observations do not prove subjective perfection or
exhaustive original-game parity.
