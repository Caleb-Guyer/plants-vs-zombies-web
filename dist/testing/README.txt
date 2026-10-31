Optional test profiles

These generated profiles make the game roster, modes, and later environments
available for a quick browser playtest. Their completion, unlock, purchase, and
challenge values are artificial test data. They are not earned game progress and
do not establish that the whole campaign has been played or verified.

The optional Add test profiles button merges six profiles into the browser's
existing profile list. Existing names, profile IDs, save details, and current-user
selection are preserved. New test profiles receive unused IDs. If a matching QA
profile already has a detail file it is skipped, so adding the package again does
not reset test progress. An existing name without a detail file is retained and a
new unique name is used for the added fixture instead.

After adding, use the native Change User menu to select:

  QA - Full Game  — all 49 plant choices, Almanac, shop upgrades, and mode menus
  QA - Night      — Adventure 2-1
  QA - Pool       — Adventure 3-1
  QA - Fog        — Adventure 4-1
  QA - Roof       — Adventure 5-1
  QA - Boss       — Adventure 5-10

All use the normal game's later-playthrough rules. Crazy Dave can choose some
seeds. There are no saved mid-level boards, potted plants, or earned achievement
flags. The original game resources still come from the files selected locally.
The generated test package contains seven small save files and no game assets.

The Add test profiles operation is different from Import save ZIP. Directly
importing the raw test-profiles.zip through the ordinary import control replaces
users.dat and therefore the browser profile list. Use the merge button to preserve
an existing list, or import the raw fixture only in a fresh scratch browser origin.

Developer integration:
  await ensureSaveFsReady();
  const result = await addPvZTestProfiles(Module.FS, JSZip, downloadedZipBytes);
  await syncSaves();

The function validates both indexes and fixture CRCs before writing, copies each
new detail file exactly, uses exclusive new-file creation, and replaces the merged
index with an atomic rename. A malformed existing index is left untouched. It
never reads or writes registry CurUser. Return fields are added, skipped,
totalProfiles, currentSelectionUnchanged, generatedTestProgress, and warnings.

Verification: node tests/test-profile-merge.mjs
Source: test-profiles.js; SPDX-License-Identifier: LGPL-3.0-or-later.
