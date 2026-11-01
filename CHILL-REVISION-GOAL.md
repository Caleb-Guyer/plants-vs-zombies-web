# Chill-shroom original artwork and centered portraits

The user requested original game artwork instead of AI pictures and a centered
Chill-shroom image on 2026-10-31. This supersedes Chill.1's generated cap and
painted cards. The older parity goal remains paused. The goal tool rejected a
new objective while that unfinished goal exists; this manual record does not
replace or falsely complete it.

The current candidate is `0.2.6-web-chill.2`, based on Chill.1. Player-facing
names remain **Chill-shroom** and **Cold Front**. Seed 75, mode 75, record 74,
checkpoint filenames, gameplay and save layouts stay compatible.

Completion criteria:

- Use unchanged original Ice-shroom cap, body, eyes and native animation for
  Chill-shroom. Remove the generated cap, recoloring and active AI artwork.
  Preserve the muzzle-free silhouette and original alpha contour/eye opening.
- Make all three Bonus pictures from original game resources only: one centered
  Conehead head/cone, Puff-shroom and actual Ice-based Chill-shroom over original
  grass. Fit visible alpha bounds uniformly into the native 80 by 65 picture;
  inspect both earned and unearned trophy states at actual game size.
- Remove generated-image headers/runtime bindings and all twelve standalone AI
  PNG/provenance aliases. Keep historical source archives and Git history;
  direct historical artwork links to pinned old blobs. Record original resource
  identities in [native artwork provenance](dist/content/native-bonus-art.json).
- Retain the 40-tick wind-up, outward cold release and 30-tick recovery, the
  400-active-tick pulse, 150-pixel radius, 150-tick native chill, 75-sun cost,
  750-tick recharge, enemy eligibility and stronger-chill/freeze behavior. Deal
  no damage. Preserve paused/sleep/dead/grabbed/squished behavior and save phase.
- Keep added Bonus tips absent. Retain original frame, trophy, title hover,
  menus, packets, flags and discreet utility icons, without extra HUD or panels.
- Preserve original content, IDs, serialized fields, checkpoint/completion
  routing, schema 2, worker and automatic saves. Verify older custom-image saves
  return to original art without resetting health, placement or pulse phase.
- Run focused automated/native/browser/save checks silently with `?testing=1`.
  Check centered portraits, clear eyes and native plant art at game size; load
  an existing checkpoint through native Continue. Keep attack/save tests and
  earlier fresh-save observations tied to their actual build and scope.
- Publish complete corresponding source, assets, dependencies and provenance to
  the existing GitHub repository and Pages site. Retain normal-player audio and
  the GitHub 100 MiB per-file policy; record outer packaging/hosting separately.

Status: original-reference/native-pivot review, the coherent Release build,
focused native/browser checks and engine-source reconstruction pass. Seven
native suites total 1,431 assertions; fourteen browser suites include eleven
worker scenarios. The 245.717-second build kept all 771 source inputs unchanged.
Native-size earned/unearned pictures are centered and readable around the
original frames/ribbons; hover retains the red title without a tip. Continue
restores an existing Chill.1 checkpoint with 50 sun, Sun-shroom/Chill-shroom/
Puff-shroom and original Ice cap/face, graves and mowers. Local criteria pass.
Publication remains, with website-source packaging and hosted verification
recorded independently. No new battle win or fresh full save cycle is claimed.
Testing stayed muted; no image-generation tool was used for this revision.

Historical Chill.1 functional results remain in QA and its exact source/Git
record. The user superseded its AI artwork; those counts and screenshots are
not current verification. Automated tests and bounded observations do not prove
subjective perfection or exhaustive original-game parity.
