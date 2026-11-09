// SPDX-License-Identifier: MIT
// Authenticate the complete retained focused matrix and its bounded additions.
import assert from 'node:assert/strict';

const PARENT_ARCHIVE = '6ccb876d55621aa8c31b405c2495b97203fec344905a0920440607557c291a63';
const PARENT_SNAPSHOT = '7d6c2749a2d9d1ae462e964447e017f4fcd0e3146909de210ddacaab06be8c82';
const PARENT_REPORT_PINS = '3012433b8e56a97c8b3a44241c6fbe5abe370fac0fb30594958a874571048905';
const FOLDER = 'tests/ambush1-focused-retention/';
const COUNTS = {'game-speed':81, 'qol-controls':90, 'decks-cooldowns':274,
  'bonus-challenge':387, 'bonus-completion':1302, 'night-shift':231,
  'lantern-shroom':1724, 'garden-shuffle':214, 'seed-swap':587,
  'mender-bloom':523, 'intensive-care':1135, 'native-layout':26471, 'care-fatigue':25042};
const ADDITIONS = {'bonus-challenge':7, 'bonus-completion':77, 'native-layout':686};
const NEW_SOURCES = ['VaseAmbush.h', 'VaseAmbush.cpp', 'VaseAmbushPresentation.h', 'VaseAmbushPresentation.cpp'];
const NEW_BLOCKS = {'bonus-challenge':['bonus-challenge-additions.inc'],
  'bonus-completion':['bonus-completion-additions.inc'],
  'native-layout':['native-layout-additions.inc', 'native-layout-report-additions.inc']};

// Populated only from a frozen passing production build and fresh 13-suite run.
const REVIEWED_PINS = /* REVIEWED_FOCUSED_PINS_BEGIN */ {
  "pendingFinalFreeze": false,
  "adapterSha256": "e5dae2af676fbc253d792d43e15fccba31518325969921c55e7ce392af4c9844",
  "adaptationsSha256": "165c736fdf9660b1d48090a00e76deae9d51cb33d738a4ada5747b7f3b215eff",
  "runSha256": "b62b414af34ca10de508d6807853745f1ed40a05b641be303133a16cdbdb4268",
  "runners": {
    "game-speed": {
      "runnerSha256": "a087eb9ab217394c493d5f54569d2132eadae6378e70b7a8bbc66a94de95660e",
      "reportSha256": "6e52834909f0aa54a88d8207a47d60c0ba8f67c9405bfae105f93dcb085bcacd",
      "harnessSha256": "0299e42113cdd9a96fdc9e4ac14cf68c6144f2c3660cf14f85bb224bb3a96b6b"
    },
    "qol-controls": {
      "runnerSha256": "dd4bc4f24b193d80fe2f8fdf3d4366841dd55d20ac2e01ccc327f24848fa4408",
      "reportSha256": "b5d200bb006db29adf34d55ed57aa97c889199c67f95a0145d175070382b9f64",
      "harnessSha256": "26baff16227c83705bc47cc2a8afd8b8f84effa24589d2ab63024c3495527316"
    },
    "decks-cooldowns": {
      "runnerSha256": "f5e913448991a55edf45d1398797d3e4198d8ea954d976c6345f0044c1bb9b50",
      "reportSha256": "e4aebe5d70c45dfe6b303d0849596c92ae818d2b5b288b07a87d17f8b7c1913f",
      "harnessSha256": "ae4ac355c15099c69e92d325562a4cb3a60046a052d481119d2f12a5cf6f72d5"
    },
    "bonus-challenge": {
      "runnerSha256": "3e3d126ca83e4992494b048d4de0fd6407f22219bddff441ec212d0a2c11ff12",
      "reportSha256": "47bd8d61576f0f7a3b4b94ec9f878e84add174fff70dddf2eecff94ce548558f",
      "harnessSha256": "a2f1cb86271663aa547198ff48f40f3808962f5115346bdf49248bd2129eae92"
    },
    "bonus-completion": {
      "runnerSha256": "db29b51c3d8c0e7962371c159b78573e4e34057f952131bb88097fd06e579614",
      "reportSha256": "00cd974e0504cb02c4ecbac4630a87eb011f7a934565e5034c2ea264c16bdf57",
      "harnessSha256": "21b54e29c35f0e88b8e3fa811c3800c6f8993807356e3f34a10159757acc48f6"
    },
    "night-shift": {
      "runnerSha256": "7e89544e6fa15504595ca5cc1d9f94d0af1d483ef0535a6364b441c9b6436c60",
      "reportSha256": "90ecda5fb01a2b30dbb6a1a964806410cfb1511493af5109dfe3d0aa468ca691",
      "harnessSha256": "cbe2817fd84cef4b373ffba968ac147126919df8d41b79d535d18098054485ba"
    },
    "lantern-shroom": {
      "runnerSha256": "90da451fb4226dd1a4705bf0babedb2997dcdb3591e821193d88d68573916566",
      "reportSha256": "d030c85f4ff8586a378629903d750a83a5de5fc45b7888466c65d8ae1b90b407",
      "harnessSha256": "0248c0b4e810db527334c7994bbfa6918df44489c1964aa01e1050a540a473c9"
    },
    "garden-shuffle": {
      "runnerSha256": "76a07cd1c187ad844ef31750646b1db82d47a85644d34c52214603a771acfa8a",
      "reportSha256": "1c4a37d96f8dc62d6088111fe4abb31c318e670617b21a3f7551b20d018fe1af",
      "harnessSha256": "7364fe91a888ab3d607b533cf4a1fdba903ed5bf65172b008078c950a1e6d182"
    },
    "seed-swap": {
      "runnerSha256": "ba4f7e37fdc27767a8bc3c922c65647fa89939a9667b660962f6b3b6fc994af0",
      "reportSha256": "5e203ad8a9af8c2951f2674bdd0d623411abf211a9e92b291b4aa7f333a94976",
      "harnessSha256": "d19d1e472acd008c56c21435147aa46c0f9c57cc66b3948d79c2e060f7352180"
    },
    "mender-bloom": {
      "runnerSha256": "e27d83fa44ac19afd4a3c75e43ee5dee5df5b895295160f8f5705b4e2481e0d1",
      "reportSha256": "fec2063ad4f92dee8f72bed85b2375f4dd1f5b407555bd147d48b4b3999f3c1b",
      "harnessSha256": "61586146eb86ff29afcca868b8f65605d50f987a819e9cb98ea99e6fe3b3fba7"
    },
    "intensive-care": {
      "runnerSha256": "9235777b900660fa4da183536e1c0601733b3857dae08067d9a4650183134843",
      "reportSha256": "a28c68d760f6b79d0f918b7d8519dc5adfb0fa9926ad8d916fe364fc8a4023c9",
      "harnessSha256": "601493c8f6051a49c3f6775a68f82c8f3efe48d3585c3887a20643d0a02077aa"
    },
    "native-layout": {
      "runnerSha256": "09bb87f2025c971262c946de94a815c323b0cd5a4f2f1276f7dce02809fabec1",
      "reportSha256": "8833b2bfac0b3cb6bfb5c3423a230275a76f46b2a21ddf8772c272a0777e5367",
      "harnessSha256": "ce862cd95a54514a77717a9144c05abac1cfe3ddadf5049e93a3958d5d493138"
    },
    "care-fatigue": {
      "runnerSha256": "8dc87c765bdded9afc472c000bf3fdd9f42f6d546e66a271b031b59f12688f7e",
      "reportSha256": "477a34d95515e0f974f9245508547ffca8e3dbb1b5805714135f268afce09489",
      "harnessSha256": "60b9b05a2437b088d08bd89ca393dc4ab00d107fc4c382927e2a36068ab92130"
    }
  },
  "blocks": {
    "bonus-challenge-additions.inc": "e10445276aa10e8d5554fe5cb52da8bf08f7c5a79e7057ac4c94cb696ead73f3",
    "bonus-completion-additions.inc": "6bccc0c0dd03eb462bf87983b41fcf5ea31d91075615a81485671406529da43e",
    "native-layout-additions.inc": "b318da59681db4d0049344e83eb3bcc93c6f7a1291c474355b039626a92f6681",
    "native-layout-report-additions.inc": "ba70f3b19c6cc229d5ced051bf129bc2a09bd19c28c580568cee23beadbf70f4"
  },
  "summaryPath": "focused-outer-final/summary.json",
  "summarySha256": "9efa057d0d6ddd81475d555f12e54c57b9a593efae7440ccfbddac8580a531f3"
} /* REVIEWED_FOCUSED_PINS_END */;

function replaceOnce(text, before, after) {
  assert.equal(text.split(before).length, 2, 'Only the reviewed compatibility boundary may change');
  return text.replace(before, after);
}

// This independent whitelist does not execute or trust the Python adapter.
function compatibleRunner(original, name) {
  let text = original;
  if (name === 'game-speed') {
    const token = "ROOT / 'source/src/Lawn/System/ScrapYardPresentation.cpp'";
    text = replaceOnce(text, token, token + ', ' + NEW_SOURCES.map(item => "ROOT / 'source/src/Lawn/System/" + item + "'").join(', '));
  } else if (name === 'native-layout') {
    const line = "SOURCES += ['src/Lawn/System/ScrapYard.h','src/Lawn/System/ScrapYard.cpp']\n";
    text = replaceOnce(text, line, line + "SOURCES += ['" + NEW_SOURCES.map(item => 'src/Lawn/System/' + item).join("', '") + "']\n");
  } else {
    const lines = text.match(/[^\n]*ScrapYardPresentation\.cpp[^\n]*(?:\n|$)/g);
    assert.equal(lines?.length, 1);
    text = replaceOnce(text, lines[0], lines[0] + lines[0].replaceAll('ScrapYard', 'VaseAmbush'));
  }
  if (text.includes('NUM_GAME_MODES==89')) text = replaceOnce(text, 'NUM_GAME_MODES==89', 'NUM_GAME_MODES==90');
  if (name === 'lantern-shroom') {
    const line = 'namespace ScrapYardPresentation { Sexy::Image* GetBonusImage(){return nullptr;} }';
    text = replaceOnce(text, line, line + '\nnamespace VaseAmbushPresentation { Sexy::Image* GetBonusImage(){return nullptr;} }');
  }
  if (name === 'bonus-completion') {
    const global = 'namespace RallyRaid {void ResetStage(Board&,int){assert(false&&"Raid restart is covered by its complete-engine suite");}}';
    text = replaceOnce(text, global, global + '\nnamespace VaseAmbush {void ResetStage(Board&,int){assert(false&&"Vase restart is covered by its complete-engine suite");}}');
    const line = 'namespace RallyRaid {using ::RallyRaid::IsMode;void ResetStage(Board&,int){assert(false&&"Raid restart is covered by its complete-engine suite");}}';
    text = replaceOnce(text, line, line + '\nnamespace VaseAmbush {using ::VaseAmbush::IsMode;void ResetStage(Board&,int){assert(false&&"Vase restart is covered by its complete-engine suite");}}');
  }
  if (name === 'native-layout') {
    text = replaceOnce(text, 'static_cast<int>(GameMode::NUM_GAME_MODES)==89', 'static_cast<int>(GameMode::NUM_GAME_MODES)==90');
    text = replaceOnce(text, 'assert len(raid_card_positions)==16 and', 'assert len(raid_card_positions)==17 and');
    text = replaceOnce(text, "assert scrap_card_position==('4','0')",
      "assert scrap_card_position==('4','0')\nambush_card_position=raid_card_positions[16]\nassert ambush_card_position==('4','1')");
    text = replaceOnce(text, 'return BungeeBusiness::IsMode(mGameMode)||RallyRaid::IsMode(mGameMode);',
      'return VaseAmbush::IsMode(mGameMode)||BungeeBusiness::IsMode(mGameMode)||RallyRaid::IsMode(mGameMode);');
    const label = "methods+='\\nnamespace RallyRaidPresentation {\\n'+extract(raid_presentation,'std::string LevelLabel(')+'\\n}\\n'";
    text = replaceOnce(text, label, label + "\nmethods+='\\nnamespace VaseAmbushPresentation {\\n'+extract(source['source/src/Lawn/System/VaseAmbushPresentation.cpp'],'std::string LevelLabel(')+'\\n}\\n'");
    const guard = "    if signature=='void Board::DrawUIBottom(':\n";
    text = replaceOnce(text, guard, guard + "        vase_guard='!VaseAmbush::IsMode(mApp->mGameMode) && '\n        assert prior_method.count(vase_guard)==1\n        prior_method=prior_method.replace(vase_guard,'',1)\n");
    text = replaceOnce(text, "scrapLayoutChecks=result['checks']-26138", 'scrapLayoutChecks=333');
  }
  return Buffer.from(text);
}

function applyEdits(original, edits) {
  assert(Array.isArray(edits));
  let result = Buffer.from(original), previous = original.length + 1;
  for (const edit of [...edits].reverse()) {
    const before = Buffer.from(edit.beforeBase64, 'base64'), after = Buffer.from(edit.afterBase64, 'base64');
    assert.equal(before.toString('base64'), edit.beforeBase64);
    assert.equal(after.toString('base64'), edit.afterBase64);
    assert(Number.isSafeInteger(edit.offset) && edit.offset >= 0 && edit.offset < previous);
    assert(edit.offset + before.length <= previous && edit.offset + before.length <= result.length);
    assert.deepEqual(result.subarray(edit.offset, edit.offset + before.length), before);
    result = Buffer.concat([result.subarray(0, edit.offset), after, result.subarray(edit.offset + before.length)]);
    previous = edit.offset;
  }
  return result;
}

const safeName = name => assert(typeof name === 'string' && name.length && !name.startsWith('/') &&
  !/[\\:]/.test(name) && !name.split('/').some(part => !part || part === '.' || part === '..'));

export async function verifyAmbushFocusedRetention({read, sha, engine, reports}) {
  assert.equal(REVIEWED_PINS.pendingFinalFreeze, false, 'Final focused evidence has not been frozen');
  assert.equal(engine.id, '0.2.6-web-ambush.1');
  assert.equal(engine.parent.id, '0.2.6-web-scrap.1');
  assert.equal(engine.parent.artifacts.sourceSha256, PARENT_ARCHIVE);
  assert(reports instanceof Map);
  const snapshotBytes = await read('tests/ambush1-retained-parent/manifest.json');
  assert.equal(sha(snapshotBytes), PARENT_SNAPSHOT);
  const snapshot = JSON.parse(snapshotBytes);
  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.parentEngineId, engine.parent.id);
  assert.equal(snapshot.parentArchiveSha256, PARENT_ARCHIVE);
  assert.equal(Object.keys(snapshot.files).length, 126);
  const parentReportBytes = await read(FOLDER + 'parent-report-pins.json');
  assert.equal(sha(parentReportBytes), PARENT_REPORT_PINS);
  const parentReports = JSON.parse(parentReportBytes);
  assert.equal(parentReports.parentEngineId, engine.parent.id);
  assert.equal(parentReports.parentArchiveSha256, PARENT_ARCHIVE);
  assert.deepEqual(Object.keys(parentReports.reports).sort(), Object.keys(COUNTS).sort());
  const adaptationBytes = await read(FOLDER + 'adaptations.json');
  assert.equal(sha(adaptationBytes), REVIEWED_PINS.adaptationsSha256);
  assert.equal(sha(await read(FOLDER + 'adapter.py')), REVIEWED_PINS.adapterSha256);
  assert.equal(sha(await read(FOLDER + 'run.py')), REVIEWED_PINS.runSha256);
  const adaptation = JSON.parse(adaptationBytes);
  assert.equal(adaptation.schemaVersion, 1);
  assert.equal(adaptation.engineId, engine.id);
  assert.equal(adaptation.parentEngineId, engine.parent.id);
  assert.equal(adaptation.parentArchiveSha256, PARENT_ARCHIVE);
  assert.equal(adaptation.parentSnapshotSha256, PARENT_SNAPSHOT);
  assert.equal(adaptation.parentReportPinsSha256, PARENT_REPORT_PINS);
  assert.equal(adaptation.retainedCheckTotal, 58061);
  assert.deepEqual(Object.keys(adaptation.runners).sort(), Object.keys(COUNTS).sort());
  let retained = 0, current = 0;
  for (const [name, count] of Object.entries(COUNTS)) {
    const record = adaptation.runners[name], reviewed = REVIEWED_PINS.runners[name];
    const runnerName = 'test-' + name + '.py';
    assert.equal(record.runner, runnerName);
    assert.equal(record.originalSnapshot, 'ambush1-retained-parent/' + runnerName);
    const original = await read('tests/' + record.originalSnapshot), originalPin = snapshot.files[runnerName];
    assert.equal(original.length, originalPin.bytes);
    assert.equal(sha(original), originalPin.sha256);
    assert.equal(record.originalBytes, original.length);
    assert.equal(record.originalSha256, sha(original));
    const oldReport = await read(FOLDER + 'parent-reports/' + name + '-results.json');
    const oldPin = parentReports.reports[name];
    assert.equal(oldPin.publishedArchivePath, 'scrap1-candidate/tests/' + name + '-results.json');
    assert.equal(oldReport.length, oldPin.bytes);
    assert.equal(sha(oldReport), oldPin.sha256);
    assert.equal(record.parentReportSha256, oldPin.sha256);
    const parentResult = JSON.parse(oldReport);
    assert.equal(parentResult.checks, count);
    assert.equal(oldPin.checks, count);
    assert.equal(parentResult.failures, 0);
    assert.equal(parentResult.exitCode, 0);
    assert.match(parentResult.status, /^PASS /);
    assert.equal(record.baselineChecks, count);
    const compatible = compatibleRunner(original.toString('utf8'), name);
    assert.deepEqual(applyEdits(original, record.compatibilityEdits), compatible,
      'Only independently whitelisted source/identity/non-target collaborator edits: ' + name);
    let expected = compatible.toString('utf8');
    const expectedCases = [];
    for (const file of NEW_BLOCKS[name] || []) {
      const bytes = await read(FOLDER + file);
      assert.equal(sha(bytes), REVIEWED_PINS.blocks[file]);
      expectedCases.push({path:'ambush1-focused-retention/' + file, sha256:sha(bytes)});
      if (file.endsWith('-report-additions.inc')) {
        const marker = "(OUT/'" + name + "-results.json').write_text(";
        expected = replaceOnce(expected, marker, bytes.toString('utf8') + '\n' + marker);
      } else {
        const print = expected.lastIndexOf('std::printf(');
        assert(print >= 0);
        const offset = expected.lastIndexOf('\n', print) + 1;
        expected = expected.slice(0, offset) + bytes.toString('utf8') + '\n' + expected.slice(offset);
      }
    }
    assert.deepEqual(record.newCaseInputs, expectedCases);
    const runner = await read('tests/' + runnerName);
    assert.deepEqual(runner, Buffer.from(expected));
    assert.deepEqual(applyEdits(compatible, record.appendedEdits), runner,
      'New cases are insertions after the preserved parent matrix: ' + name);
    assert.equal(sha(runner), record.runnerSha256);
    assert.equal(sha(runner), reviewed.runnerSha256);
    const reportBytes = await read('tests/' + name + '-results.json');
    assert.equal(sha(reportBytes), reviewed.reportSha256);
    const result = reports.get(name);
    assert.deepEqual(result, JSON.parse(reportBytes));
    assert.match(result.status, /^PASS /);
    assert.equal(result.exitCode, 0); assert.equal(result.failures, 0);
    assert.equal(result.checks, count + (ADDITIONS[name] || 0));
    const harness = await read('tests/' + name + '-harness.cpp');
    assert.equal(sha(harness), reviewed.harnessSha256);
    assert.equal(sha(harness), result.generatedHarnessSha256);
    assert(result.sourceSha256 && Object.keys(result.sourceSha256).length > 0);
    for (const filename of NEW_SOURCES) assert(Object.hasOwn(result.sourceSha256, 'source/src/Lawn/System/' + filename));
    for (const [path, pin] of Object.entries(result.sourceSha256)) {
      safeName(path); assert(path.startsWith('source/'));
      assert.equal(sha(await read(path)), pin, 'Fresh current source dependency: ' + name + '/' + path);
    }
    retained += count; current += result.checks;
  }
  assert.equal(retained, 58061); assert.equal(current, 58831);
  assert.equal(Object.values(ADDITIONS).reduce((sum, count) => sum + count, 0), 770);
  const layout = reports.get('native-layout');
  assert.equal(layout.scrapRetainedChecks, 26138); assert.equal(layout.scrapLayoutChecks, 333);
  assert.equal(layout.ambushRetainedChecks, 26471); assert.equal(layout.ambushLayoutChecks, 686);
  assert.equal(layout.ambushFooterCases, 20); assert.equal(layout.ambushViewports, 6);
  assert.equal(layout.ambushBrainCounterStates, 6); assert.equal(layout.ambushBanklessUI, true);
  assert.equal(layout.ambushShovelOrGloveUI, false);
  safeName(REVIEWED_PINS.summaryPath);
  const summaryBytes = await read(FOLDER + REVIEWED_PINS.summaryPath);
  assert.equal(sha(summaryBytes), REVIEWED_PINS.summarySha256);
  const summary = JSON.parse(summaryBytes);
  assert.equal(summary.status, 'PASS'); assert.equal(summary.audioInitialized, false);
  assert.equal(summary.execution, 'focused-production-methods-with-controlled-collaborators');
  assert.deepEqual(summary.selected, Object.keys(COUNTS)); assert.deepEqual(summary.staleReports, []);
  assert.equal(summary.checks, current);
  assert.deepEqual(summary.runners.map(row => row.name), Object.keys(COUNTS));
  for (const row of summary.runners) {
    assert.equal(row.status, 'PASS'); assert.equal(row.exitCode, 0);
    assert.equal(row.runnerUnchangedDuringRun, true);
    assert.equal(row.runnerSha256, REVIEWED_PINS.runners[row.name].runnerSha256);
    assert.equal(row.reportSha256, REVIEWED_PINS.runners[row.name].reportSha256);
    assert.equal(row.checks, reports.get(row.name).checks);
    safeName(row.log);
    assert(row.log.startsWith('ambush1-focused-retention/'));
    assert.equal(sha(await read('tests/' + row.log)), row.logSha256);
  }
  console.log('PASS Vase focused retention: all58,061 published assertions plus770 scoped additions; exact current runners, harnesses, reports and source dependencies.');
}
