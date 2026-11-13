// SPDX-License-Identifier: MIT
// Independent checks of actual native puzzle logs, immutable plans and saved graphs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CURRENT_ENGINE_ID, CURRENT_SOURCE_COUNT, CURRENT_OBJECT_COUNT,
 AMBUSH_ENGINE_ID, AMBUSH_ARCHIVE_SHA256, CURRENT_VASE_RETENTION_SHA256,
 reconstructAmbushSources, reconstructScrapSources, verifyTorchRetainedParentInputs,
 TORCH_ENGINE_ID,TORCH_ARCHIVE_SHA256,verifyPublishedTorchAdapter,torchSourceReader} from './native-release-context.mjs';

// Accepted only after independent review of the complete actual O2 matrix,
// all thirty raw results, sixteen fixed inputs and current production graph.
const acceptedContractPins = new Set(['28389761b0c5f8db9522dc39620727c9ab78839b978bb4817024d00d05753714']);
const names = ['solution', 'save-before', 'save-emergence', 'save-combat', 'save-transition', 'retry', 'replay'];
const matrix = [1729, 7331].flatMap(seed => names.flatMap(name => [1, 2].map(speed => [name, speed, seed])))
 .concat([['controls', 1, 1729], ['controls', 2, 7331]]);
const vaseCounts = [10, 15, 13, 15, 15];
const plantCounts = [5, 12, 13, 10, 8];
const nativeArtPin = 'cecd07bb68c7592959cc9587d5a80ed7c8243934bd96b62cef82549ade7a5f46';
const priorArtPin = '952a51285a84e7b6cf232fdb96ddad60b65eb6d495db4a8b052d38ff241fd45b';
const previousCardPin = '183cb482642023f7b1ed7102052143b0c5bf543204150626670c832d4db3eaf0';
const historicalPins = {
 'tests/vase-ambush-initial-plan.json': '38830c67bbe8062820b90940bc6bef0786786d42501f5d967bc5c730d7674ea8',
 'tests/vase-ambush-pre-tuning-plan.json': 'f464ef05b7f99738d93876301250798b49b21884286b2e855bddf21290918945',
 'tests/vase-ambush-initial-verification-contract.json': '091f375a3647a8ee20a31ea533265e08027ae657e10e58e9607376881c1bd4ee',
 'tests/vase-ambush-initial-policy.h': '7935bdde6dd94ad95889bcd6e2428d7a2196a1d764cba6b14e76d42866f5fdfd',
 'tests/vase-ambush-initial-source.h': 'e40a8417e91a21d5233200862caa24353767db6b7b67607c09a9c67004bf28b6',
 'tests/vase-ambush-development-first-failure.log': '5cb399d538939b66b998ead38b342ea7cf95b23ddc003b542932b9d7d07d54fd',
 'tests/scrap-yard-legacy-profile.dat': 'c5da611e351f811048a907ccc5226505c8c1f43e798c6e2bc0117fa8324e6633',
 'tests/scrap-yard-legacy.v4': 'f8bab5aca74244f926b3334491af9a965d59dfa99b3a07a2d2425508f086da74',
};
const key = row => `${row.name}/${row.speed}/${row.seed}`;
const text = bytes => Buffer.from(bytes).toString('utf8');
const json = bytes => JSON.parse(text(bytes).replace(/^\uFEFF/, ''));
const digest = value => assert.match(value, /^[a-f0-9]{64}$/);
const integer = (value, min = 0, max = Number.MAX_SAFE_INTEGER) =>
 assert(Number.isSafeInteger(value) && value >= min && value <= max, `Integer outside [${min},${max}]: ${value}`);
const fields = (value, expected) => {
 for (const [name, wanted] of Object.entries(expected)) assert.deepEqual(value[name], wanted, 'Native Vase Ambush field: ' + name);
};
const safeName = name => {
 assert(typeof name === 'string' && name.length && !name.startsWith('/') && !/[\x00-\x1f\\:]/.test(name));
 assert(name.split('/').every(part => part && part !== '.' && part !== '..'));
 return name;
};

export async function verifyVaseCaseLog(row, {read, sha}) {
 assert(matrix.some(([name, speed, seed]) => key(row) === key({name, speed, seed})));
 const bytes = await read(`tests/vase-ambush-logs/${row.name}-${row.speed}x-${row.seed}.log`);
 digest(row.logSha256); assert.equal(sha(bytes), row.logSha256);
 const output = text(bytes), lines = output.split(/\r?\n/), prefix = 'VASE_AMBUSH_RESULT ';
 const result = lines.filter(line => line.startsWith(prefix));
 assert.equal(result.length, 1, 'Exactly one actual native result is required');
 assert(!output.includes('vase-ambush:FAIL:'), 'A failed invocation cannot supply release evidence');
 const warnings = ['Too many particle emitters', 'Too many particle systems', 'Too many particles']
  .reduce((sum, warning) => sum + output.split(warning).length - 1, 0);
 assert.deepEqual(row, {...json(Buffer.from(result[0].slice(prefix.length))),
  logSha256: sha(bytes), resourceCapacityWarnings: warnings}, 'Report fields match their actual raw native result');
 assert.equal(warnings, 0);
 if (row.name === 'controls') return;
 const clears = lines.map(line => /^vase-ambush:([a-z-]+) ([12])x solved([1-5]) in(\d+) ticks releases(\d+)$/.exec(line))
  .filter(Boolean);
 assert.equal(clears.length, row.boardsSolved, 'Every solved board has its actual native ledger line');
 clears.forEach((match, index) => {
  assert.equal(match[1], index < 5 ? row.name : 'replay-clear');
  assert.equal(Number(match[2]), row.speed); assert.equal(Number(match[3]), index % 5 + 1);
  assert.equal(Number(match[4]), row.boardTicks[index]);
  assert.equal(Number(match[5]), row.boardReleases[index]);
 });
}

function verifyCheckpoint(row) {
 const saved = row.name.startsWith('save-');
 assert.equal(row.checkpoint, saved); assert.equal(row.checkpointGraphPreserved, saved);
 if (!saved) {
  fields(row, {checkpointPendingMallet: false, checkpointPots: 0, checkpointZombies: 0,
   checkpointActiveZombies: 0, checkpointProjectiles: 0, checkpointState: 0, checkpointStage: 0,
   checkpointBeforeGraph: '', checkpointAfterGraph: ''});
  return;
 }
 assert.equal(typeof row.checkpointBeforeGraph, 'string'); assert(row.checkpointBeforeGraph.length > 100);
 assert.equal(row.checkpointAfterGraph, row.checkpointBeforeGraph, 'Native Continue preserves the observed actor and mallet graph');
 const [head, ...records] = row.checkpointBeforeGraph.split(';'), counters = head.split(':').map(Number);
 assert.equal(counters.length, 14); counters.forEach(value => integer(value));
 assert.equal(counters[1], 0); assert.equal(counters[2], 0); assert.equal(counters[13], 0);
 integer(counters[4], 0, 4); integer(counters[5], 132, 133); integer(counters[6], 0, 120);
 integer(counters[7], 0, 5); integer(counters[8], 0, 8); integer(counters[9], 0, 4);
 integer(counters[10], 0, 15); integer(counters[11], 0, 0xffffffff); integer(counters[12], 0, 150);
 assert.equal(row.checkpointStage, counters[4]); assert.equal(row.checkpointState, counters[5]);
 assert.equal(row.checkpointPendingMallet, counters[11] !== 0);
 const ids = new Set(), rigs = new Set(), plantCells = new Set(), potCells = new Set(), brainRows = new Set();
 let pots = 0, brains = 0, zombies = 0, activeZombies = 0, projectiles = 0, plants = 0;
 for (const record of records) {
  const [tag, ...raw] = record.split(','), values = raw.map(Number);
  assert(['p', 'z', 'g', 's', 'r'].includes(tag), 'Fixed-army checkpoints have no bank packets or economy coins');
  values.forEach(value => assert(Number.isFinite(value)));
  integer(values[0], 1, 0xffffffff); assert(!ids.has(tag + values[0])); ids.add(tag + values[0]);
  if (tag === 'p') {
   assert.equal(values.length, 37); integer(values[1], 0, 48); integer(values[2], 0, 3); integer(values[3], 0, 4);
   integer(values[4], 1, values[1] === 3 ? 4000 : 300); assert.equal(values[5], 0);
   for (let at = 12; at < 37; at += 5) integer(values[at], 0, 21);
   const cell = `${values[2]}/${values[3]}`; assert(!plantCells.has(cell)); plantCells.add(cell);
   rigs.add(values[11]); ++plants;
  } else if (tag === 'z') {
   assert.equal(values.length, 18); assert([0, 2, 4, 6].includes(values[1])); integer(values[2], 0, 4);
   integer(values[13], 0, 3); integer(values[14]); integer(values[15]); integer(values[16]);
   rigs.add(values[17]); ++zombies; activeZombies += ![1, 2, 3].includes(values[13]);
  } else if (tag === 'g') {
   assert.equal(values.length, 13); assert([7, 12].includes(values[1])); integer(values[3], 0, 8); integer(values[4], 0, 4);
   if (values[1] === 7) {
    assert.equal(values[2], 5); assert([0, 2, 4, 6].includes(values[8]));
    assert.equal(values[10], 2); assert.equal(values[11], 50); ++pots;
    const cell = `${values[3]}/${values[4]}`; assert(!potCells.has(cell)); potCells.add(cell);
   } else {
    assert.equal(values[3], 0); integer(values[5], 0, 70); ++brains;
    assert(!brainRows.has(values[4])); brainRows.add(values[4]);
   }
  } else if (tag === 's') { assert.equal(values.length, 10); integer(values[2], 0, 4); ++projectiles; }
  else { assert.equal(values.length, 8); rigs.delete(values[0]); }
 }
 rigs.delete(0); assert.equal(rigs.size, 0, 'Every referenced plant/zombie body rig survives the graph');
 assert.equal(pots, row.checkpointPots); assert.equal(pots, counters[10]);
 assert.equal(zombies, row.checkpointZombies); assert.equal(projectiles, row.checkpointProjectiles);
 assert.equal(activeZombies, row.checkpointActiveZombies); assert.equal(brains + counters[7], 5);
 integer(plants, 0, plantCounts[counters[4]]); integer(brains, 0, 5);
 if (row.checkpointPendingMallet) assert(ids.has('r' + counters[11]), 'Pending native hammer survives Continue');
 if (row.name === 'save-before') {
  fields(row, {checkpointPots: 10, checkpointZombies: 0, checkpointProjectiles: 0,
   checkpointActiveZombies: 0, checkpointPendingMallet: false, checkpointState: 132, checkpointStage: 0});
  assert.equal(brains, 5); assert.equal(plants, 5);
 } else if (row.name === 'save-emergence') {
  fields(row, {checkpointPots: 15, checkpointPendingMallet: true, checkpointStage: 1, checkpointState: 132});
  assert.equal(brains, 5); assert.equal(plants, 12); integer(counters[11], 1);
 } else if (row.name === 'save-combat') {
  fields(row, {checkpointState: 132, checkpointStage: 3}); integer(activeZombies, 1); integer(projectiles, 1);
 } else {
  fields(row, {checkpointState: 133, checkpointStage: 2, checkpointPendingMallet: false});
  assert.equal(counters[7], 5); assert.equal(brains, 0); integer(counters[6], 1, 120);
 }
}

export function verifyVaseScenario(row) {
 assert(matrix.some(([name, speed, seed]) => key(row) === key({name, speed, seed})), 'Known preregistered case identity');
 fields(row, {execution: 'complete-production-engine', profileIndex: 88, silentHardware: true,
  audioDeviceOpened: false, nativeSeventeenthCardInput: true, resourceCapacityWarnings: 0});
 integer(row.checks, 101);
 if (row.name === 'controls') {
  assert.equal(row.syntheticDiagnosticDeadQueueCleanup ?? false, false,
   'Final controls rely on production cleanup and cannot repair state through test-only drains');
  fields(row, {outcome: 'controls-pass', syntheticControls: true, countedEarnedWins: 0,
   unbrokenArmyWaitsForPlayer: true, nativePauseGraphPreserved: true, vaseRulesModeRestricted: true,
   nativeOneVaseOneZombie: true, nativeDoubleBreakRejected: true, nativeActiveGraphPreserved: true,
   nativeStockZombieTypes: 4, nativeBodyAndArmorStatsUnmodified: true,
   publishedEndless3ProfileNativeRoundTrip: true, all100LegacyRecordsPreserved: true,
   legacyRecordCount: 100, legacyMode: 87, legacyProfileIndex: 86, legacyEarnedFlags: 8,
   legacyCardContinueNative: true, legacySaveContinueGraphExact: true, legacyAcceptedCardsPreserved: true,
   legacyNoNewAmbushTrophy: true, legacyControlsCountedEarnedWins: 0,
   nativeContinueNewGameCancelGraphExact: true, nativeContinueNewGameStartsFirstBoard: true,
   syntheticGameOverModal: true, nativeGameOverMainMenuBonusCard: true, navigationControlsCountedEarnedWins: 0,
   syntheticRenderOracleRunsLast: true,
   hudOracle: 'same-frame-native-i-zombie-unused-bank-hidden', nativeIZTopBandHeight: 70,
   nativeIZTopBandSamples: 16, nativeIZPixelComparisons: 896000, nativeIZMismatchPixels: 0,
   nativeHeadTypes: 4, historicalForegroundNegatives: 1, nativePauseUISamples: 1,
   nativeBrainCounterLabels: 30, nativeFooterMeterOverlapPixels: 0});
  assert.equal(row.profileCredits ?? 0, 0); assert.equal(row.boardsSolved ?? 0, 0); assert.equal(row.brainsConsumed ?? 0, 0);
  integer(row.nativeHeadAlphaPixels, 257); integer(row.historicalForegroundOccludedPixels, 16);
  integer(row.nativeFooterBottom, 560, 599); integer(row.nativeFooterInkPixels, 101);
  integer(row.nativeFooterOverflowNegative, 600, 649); integer(row.nativeBrainCounterFontAscent, 1);
  integer(row.nativeBrainCounterFontDescent); integer(row.nativeBrainCounterBottom, 560, 599);
  integer(row.nativeTitleMaximumWidth, 1, 592);
  return;
 }
 const replay = row.name === 'replay', boards = replay ? 10 : 5;
 fields(row, {outcome: 'win', boardsSolved: boards, brainsConsumed: boards * 5,
  profileCredits: replay ? 2 : 1, nativeActualAwardCollected: true,
  all100ProfileRecordsPreservedExceptEarnedCredit: true, postStartHPActorStageRNGEdits: false,
  literalReleasePolicy: false, visibleReactivePolicy: true, preregisteredCellOrder: true,
  hiddenHPOrRNGPolicyReads: false, invalidReleaseRejected: true, replayRewardChecked: replay,
  nativeExistingBonusPageReused: replay,
  failureAndRetry: row.name === 'retry', timingToleranceReplay: replay,
  native150TickHesitations: replay ? 5 : 0});
 assert.equal(row.syntheticControls ?? false, false);
 assert.equal(row.boardTicks.length, boards); assert.equal(row.boardReleases.length, boards);
 assert.deepEqual(row.nativeBrainLedgers, Array(boards).fill(5));
 row.boardTicks.forEach(value => integer(value, 1, 39999));
 row.boardReleases.forEach((value, index) => integer(value, 5, vaseCounts[index % 5]));
 assert.equal(row.abandonedForRestartReleases, row.name === 'solution' ? 1 : 0);
 assert.equal(row.legalVaseReleases, row.boardReleases.reduce((sum, value) => sum + value, 0) +
  (row.name === 'retry' ? 13 : 0) + row.abandonedForRestartReleases,
  'Winning ledgers, genuine failed army and actually abandoned native Restart input account for every release; unused vases need not be opened');
 integer(row.nativeDamageObservations, 1); integer(row.pendingInputsCancelledAtVictory, 0, boards * 2);
 integer(row.duplicateBreakControls, replay ? 2 : 1);
 assert.deepEqual(row.observedNativeZombieTypes, [0, 2, 4, 6], 'Only the four original authored zombie types enter native combat');
 if (row.name === 'retry') integer(row.failedAttemptBrainsRemaining, 1, 5);
 else assert.equal(row.failedAttemptBrainsRemaining, 0);
 assert.equal(row.thinkingTimeObserved, row.name === 'solution');
 assert.equal(row.scriptedModalRestart, row.name === 'solution');
 const cueCount = replay ? 2 : 1;
 for (const field of ['visibleMineCueObservations', 'visibleMagnetCueObservations', 'visibleChomperCueObservations'])
  assert.equal(row[field], cueCount);
 assert.equal(row.visibleCueTrace.length, cueCount * 3);
 row.visibleCueTrace.forEach((event, index) => {
  const kind = index % 3 + 1;
  fields(event, {board: kind === 1 ? 4 : 5, cueKind: kind, presentationOnly: true, humanReactionTicks: 150});
  integer(event.waitTicks, 0, 12000); integer(event.satisfiedAtTick, 1);
  if (kind === 1) fields(event, {absentMines: 2, visualCue: 'both-original-mines-no-longer-on-lawn'});
  else if (kind === 2) fields(event, {heldMetalMagnets: 2, visualCue: 'both-original-magnets-visibly-hold-metal'});
  else {
   assert.equal(event.chomperVisiblyChewing, true); assert(['native-chewing', 'native-swallowing'].includes(event.visualCue));
   assert(event.satisfiedAtTick >= row.visibleCueTrace[index - 1].satisfiedAtTick + 150);
  }
 });
 verifyCheckpoint(row);
}

function method(source, signature) {
 const start = source.indexOf(signature); assert(start >= 0 && source.indexOf(signature, start + 1) < 0);
 const brace = source.indexOf('{', start); assert(brace > start);
 let depth = 0, quote = '', line = false, block = false;
 for (let at = brace; at < source.length; ++at) {
  const char = source[at], next = source[at + 1];
  if (line) { if (char === '\n') line = false; continue; }
  if (block) { if (char === '*' && next === '/') { block = false; ++at; } continue; }
  if (quote) { if (char === '\\') ++at; else if (char === quote) quote = ''; continue; }
  if (char === '/' && next === '/') { line = true; ++at; continue; }
  if (char === '/' && next === '*') { block = true; ++at; continue; }
  if (char === '"' || char === "'") { quote = char; continue; }
  if (char === '{') ++depth;
  if (char === '}' && --depth === 0) return source.slice(start, at + 1);
 }
 assert.fail('Unclosed native method: ' + signature);
}

export async function verifyVaseSourceBounds({read, sha, engine}) {
 if (engine.id === CURRENT_ENGINE_ID) {
  const projected=await torchSourceReader({read,sha,engine});
  return verifyVaseSourceBounds({read:projected.read,sha,engine:projected.engine});
 }
 if (engine.id === TORCH_ENGINE_ID) {
  const referenceBytes = fs.readFileSync(new URL('./fixtures/torch1-parent-reference.json', import.meta.url));
  const parent = await reconstructAmbushSources({referenceBytes,read,sha,engine});
  const projectedRead = async name => name.startsWith('source/') ?
   (assert(parent.files.has(name.slice(7))), parent.files.get(name.slice(7))) : read(name);
  for(const name of ['VaseAmbush.cpp','VaseAmbush.h','VaseAmbushPresentation.cpp','VaseAmbushPresentation.h'])
   assert.deepEqual(await read('source/src/Lawn/System/'+name),parent.files.get('src/Lawn/System/'+name),
    'Every existing Vase puzzle and renderer byte remains unchanged by Torchbearer: '+name);
  return verifyVaseSourceBounds({read:projectedRead,sha,engine:engine.parent});
 }
 assert.equal(engine.id,AMBUSH_ENGINE_ID);
 const referenceBytes = fs.readFileSync(new URL('./fixtures/ambush1-parent-reference.json', import.meta.url));
 const parent = await reconstructScrapSources({referenceBytes, read, sha, engine});
 const normalized = bytes => text(bytes).replace(/\r\n?/g, '\n');
 for (const name of ['src/Lawn/Plant.cpp', 'src/Lawn/System/PlayerInfo.h', 'src/Lawn/System/SaveGame.cpp'])
  assert.deepEqual(Buffer.from(await read('source/' + name)), parent.files.get(name), 'Original combat/save layout remains byte exact: ' + name);
 const zombie = normalized(await read('source/src/Lawn/Zombie.cpp'));
 const newGuard = '    if (VaseAmbush::IsMode(mApp->mGameMode)) return false;\n';
 assert.equal(zombie.split(newGuard).length, 2);
 assert.equal(zombie.replace(newGuard, ''), normalized(parent.files.get('src/Lawn/Zombie.cpp')),
  'Every original zombie body, armor, damage, movement and ability byte is retained outside the finite-award guard');
 const challenge = normalized(await read('source/src/Lawn/Challenge.cpp'));
 const oldChallenge = normalized(parent.files.get('src/Lawn/Challenge.cpp'));
 for (const signature of ['void Challenge::IZombieSetupPlant(', 'void Challenge::ScaryPotterMalletPot('])
  assert.equal(method(challenge, signature), method(oldChallenge, signature), 'Original native setup/hammer method: ' + signature);
 const open = method(challenge, 'void Challenge::ScaryPotterOpenPot(');
 assert.equal(open.replace('!VaseAmbush::IsMode(mApp->mGameMode) && ScaryPotterIsCompleted()', 'ScaryPotterIsCompleted()'),
  method(oldChallenge, 'void Challenge::ScaryPotterOpenPot('), 'Native spawn, sound and shatter factory remain original');
 const board = normalized(await read('source/src/Lawn/Board.cpp'));
 assert.equal(method(board, 'Zombie* Board::AddZombieInRow('),
  method(normalized(parent.files.get('src/Lawn/Board.cpp')), 'Zombie* Board::AddZombieInRow('));
 const app = normalized(await read('source/src/LawnApp.cpp')), oldApp = normalized(parent.files.get('src/LawnApp.cpp'));
 const retryGuard = '    if (VaseAmbush::IsMode(mGameMode) && mBoard && mBoard->mChallenge)\n' +
  '    {\n        const int stage = mBoard->mChallenge->mSurvivalStage;\n        NewGame();\n' +
  '        VaseAmbush::ResetStage(*mBoard, stage);\n        return;\n    }\n';
 const restartStage = '    const int aVaseStage = VaseAmbush::IsMode(mGameMode) && mBoard->mChallenge &&\n' +
  '        !GetDialog(Dialogs::DIALOG_CONTINUE) ? mBoard->mChallenge->mSurvivalStage : -1;\n';
 const restartReset = '    if (aVaseStage >= 0 && mBoard) VaseAmbush::ResetStage(*mBoard, aVaseStage);\n';
 for (const part of [retryGuard, restartStage, restartReset]) assert.equal(app.split(part).length, 2);
 assert.equal(method(app, 'void LawnApp::EndLevel(').replace(retryGuard, ''),
  method(oldApp, 'void LawnApp::EndLevel('), 'Only Vase Ambush Try Again preserves its current authored puzzle');
 assert.equal(method(app, 'void LawnApp::FinishRestartConfirmDialog(').replace(restartStage, '').replace(restartReset, ''),
  method(oldApp, 'void LawnApp::FinishRestartConfirmDialog('), 'Existing Continue New Game and every old restart route retain their exact behavior');
 assert.equal(method(app, 'void LawnApp::NewGame('), method(oldApp, 'void LawnApp::NewGame('));
 const optionsPath = 'src/Lawn/Widget/NewOptionsDialog.cpp';
 const options = normalized(await read('source/' + optionsPath));
 const optionsStage = '                const int aVaseStage = VaseAmbush::IsMode(mApp->mGameMode) && mApp->mBoard->mChallenge\n' +
  '                    ? mApp->mBoard->mChallenge->mSurvivalStage : -1;\n';
 const optionsReset = '                if (aVaseStage >= 0 && mApp->mBoard) VaseAmbush::ResetStage(*mApp->mBoard, aVaseStage);\n';
 for (const part of ['#include "../System/VaseAmbush.h"\n', ' || VaseAmbush::IsMode(mApp->mGameMode)', optionsStage, optionsReset])
  assert.equal(options.split(part).length, 2, 'One mode-restricted Options integration: ' + part);
 assert.equal(options.replace('#include "../System/VaseAmbush.h"\n', '').replace(' || VaseAmbush::IsMode(mApp->mGameMode)', '')
  .replace(optionsStage, '').replace(optionsReset, ''), normalized(parent.files.get(optionsPath)),
  'Every previous Options, native string, button and layout byte remains exact outside the mode89 current-puzzle guard');
 const dialogPath = 'src/Lawn/Widget/LawnDialog.cpp', dialog = normalized(await read('source/' + dialogPath));
 for (const part of ['#include "../System/VaseAmbush.h"\n', ' || VaseAmbush::IsMode(mApp->mGameMode)'])
  assert.equal(dialog.split(part).length, 2);
 assert.equal(dialog.replace('#include "../System/VaseAmbush.h"\n', '').replace(' || VaseAmbush::IsMode(mApp->mGameMode)', ''),
  normalized(parent.files.get(dialogPath)), 'Original dialogs retain all old bytes; Vase Ambush alone returns its defeat Menu to Bonus');
 const header = normalized(await read('source/src/Lawn/System/VaseAmbush.h'));
 for (const expression of [/kMode = GAMEMODE_CHALLENGE_VASE_AMBUSH/, /kActive = static_cast<ChallengeState>\(132\)/,
  /kTransition = static_cast<ChallengeState>\(133\)/, /kFinished = static_cast<ChallengeState>\(134\)/,
  /kFailed = static_cast<ChallengeState>\(135\)/, /kBoardCount = 5;/]) assert.match(header, expression);
 const core = normalized(await read('source/src/Lawn/System/VaseAmbush.cpp'));
 for (const expression of [/ScaryPotterMalletPot\(pot\)/, /ScaryPotterOpenPot\(vase\)/,
  /IZombieSetupPlant\(plant\)/, /IZombieUpdate\(\)/, /PuzzleNextStageClear\(\)/,
  /GRIDITEM_IZOMBIE_BRAIN/, /GRIDITEM_STATE_SCARY_POT_ZOMBIE/, /mTransparentCounter\s*=\s*50/,
  /mSeedBank->mNumPackets\s*=\s*0/, /mSunMoney\s*=\s*0/]) assert.match(core, expression);
 assert(!/\b(?:mBody(?:Max)?Health|mHelmHealth|mShieldHealth|mPlantHealth|mVelX)\s*=|\bTakeDamage\s*\(/.test(core));
 assert(!/DisplayAdvice\s*\(|MakeNewButton\s*\(/.test(core), 'No added gameplay tips or HUD controls');
 const harness = normalized(await read('tests/vase-ambush-harness.cpp'));
 for (const expression of [/class SilentSoundManager/, /DummyMusicInterface/, /mMusicVolume\s*=\s*0/,
  /mSfxVolume\s*=\s*0/, /mMusicDisabled\s*=\s*true/, /mWidgetManager->MouseDown\(/,
  /mWidgetManager->MouseUp\(/, /mChallengeButtons\[kProfile\]/]) assert.match(harness, expression);
 assert(!/SDL_Init(?:SubSystem)?\([^)]*SDL_INIT_AUDIO/.test(harness));
 const policy = normalized(await read('tests/vase-ambush-policy.h')).replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '');
 assert(!/VaseAmbush::kBoards|(?:mBodyHealth|mPlantHealth|mVelX|mSurvivalStage)\s*=(?!=)/.test(policy),
  'Literal player actions cannot derive choices from hidden production data or edit combat');
 for (const signature of ['Plant* VisiblePlant(', 'bool VisibleMetal(', 'bool VisibleCue(', 'bool WaitVisibleCue(', 'bool HumanSequence(']) {
  const controller = method(harness, signature).replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '');
  assert(!/\b(?:m(?:Body|Helm|Shield|Plant)(?:Max)?Health|mStateCountdown|mShootingCounter|mLaunchCounter|mJustGotShotCounter|mChilledCounter|mIceTrapCounter|mAppRandSeed|SRand|Rand|kBoards|ResetStage|TakeDamage)\b/.test(controller),
   'Winning timing uses drawn native cues without hidden health, cooldown, RNG or combat mutation: ' + signature);
 }
 assert.match(method(harness, 'bool VisibleMetal('), /mMagnetItems/);
 assert.match(method(harness, 'bool VisibleCue('), /STATE_CHOMPER_DIGESTING/);
 assert.match(method(harness, 'bool WaitVisibleCue('), /mMainCounter\+150/);
 assert(!/\bProcessDeleteQueue\s*\(/.test(method(harness, 'void NavigationControls(')),
  'Navigation regression coverage cannot contain its own cleanup workaround');
 const card = method(harness, 'void Card(');
 assert.match(card, /if\(!app->mChallengeScreen\)app->ShowChallengeScreen\(CHALLENGE_PAGE_BONUS\);else Require\(app->mChallengeScreen->mPageIndex==CHALLENGE_PAGE_BONUS/);
 assert.match(card, /dialog->mContinueButton\.get\(\)/);
 assert.match(card, /Require\(!app->GetDialog\(DIALOG_CONTINUE\),"native card Continue input did not dismiss"\)/);
 const tick = method(harness, 'void Tick('), step = method(harness, 'void Step(');
 assert.equal(tick.split('app->UpdateFrames()').length, 2);
 assert.match(tick, /mAppCounter-before==\(doubled\?2:1\)/);
 assert.equal(step.split('Tick(app,speed)').length, 3);
 assert.match(step, /if\(speed==1&&app->mBoard&&app->mGameScene==SCENE_PLAYING&&!app->GetDialog\(DIALOG_GAME_OVER\)\)Tick\(app,speed\)/);
 const controls = method(harness, 'void Controls('), lastOracle = controls.lastIndexOf('UIControls(app,speed,proof)');
 assert(lastOracle > controls.indexOf('NavigationControls(app,speed,seed,proof)'));
 assert(lastOracle > controls.indexOf('VerifyAmbushLegacy(app,speed,seed,proof)'));
 assert(!/\b(?:SaveContinue|LawnSaveGame|TryLoadGame|Card|NavigationControls|VerifyAmbushLegacy)\s*\(/.test(controls.slice(lastOracle + 'UIControls(app,speed,proof)'.length)),
  'Synthetic native-mode comparison draws remain isolated after all real save, navigation and legacy controls');
 assert.match(normalized(await read('tests/test-vase-ambush.py')), /env\['SDL_AUDIODRIVER'\]\s*=\s*'dummy'/);
}

export async function verifyVaseDevelopmentHistory({read, sha}) {
 for (const [name, pin] of Object.entries(historicalPins)) assert.equal(sha(await read(name)), pin);
 const initial = json(await read('tests/vase-ambush-initial-verification-contract.json'));
 assert.deepEqual(initial.matrix, matrix);
 fields(initial, {expectedPrimaryWins: 28, expectedReplayWins: 4, expectedGenuineBadPlanLosses: 4,
  maximumBoardTicks: 40000, maximumSpeedPairTickDelta: 30});
 const firstFailure = text(await read('tests/vase-ambush-development-first-failure.log'));
 assert.match(firstFailure, /solved1 in5810 ticks releases10/);
 assert.match(firstFailure, /Ambush stage1 state135 ticks15591 pots0 zombies0 score3 brains2/);
 assert.match(firstFailure, /vase-ambush:FAIL:independent literal release schedule failed its puzzle/);
 const revisions = json(await read('tests/vase-ambush-balance-revisions.json'));
 assert.equal(revisions.schemaVersion, 1);
 assert.equal(revisions.priorContractSha256, historicalPins['tests/vase-ambush-initial-verification-contract.json']);
 assert.equal(revisions.priorPolicySha256, historicalPins['tests/vase-ambush-initial-policy.h']);
 assert.equal(revisions.initialSourceHeaderSha256, historicalPins['tests/vase-ambush-initial-source.h']);
 assert.equal(revisions.failedNativeLogSha256, historicalPins['tests/vase-ambush-development-first-failure.log']);
 assert.deepEqual(revisions.changes, [{board: 2, col: 6, row: 1, before: 'ZOMBIE_NORMAL', after: 'ZOMBIE_DOOR'},
  {board: 2, col: 6, row: 3, before: 'ZOMBIE_NORMAL', after: 'ZOMBIE_DOOR'}]);
 fields(revisions.policyRefinement, {priorPolicySha256: 'ca2d177f609d36dbcfc4cb06c1dde73aba7998be940d13eeef6b517d015c938a',
  frostCounterSourceHeaderSha256: '1fa8eb23c17f229503c4718515ea46d0c81645f88d171704d77983717e9a68ad',
  currentPolicySha256: 'cd3ca389d8424a499f04febf245d42d6a52d06c5cc113ea90104512e9b481837',
  productionDataChanges: 0, matrixAndGatesUnchanged: true});
 assert.deepEqual(revisions.marginRevision.changes, [1, 2, 3].map(row =>
  ({board: 2, col: 7, row, before: 'ZOMBIE_NORMAL', after: 'ZOMBIE_TRAFFIC_CONE'})));
 assert.equal(revisions.marginRevision.priorPolicySha256, revisions.policyRefinement.currentPolicySha256);
 fields(revisions.marginRevision, {currentSourceHeaderSha256: '980ef224bd3baaf71846d975d31a873b37aa8d7be38049a4db805c872d3d17ac',
  currentPolicySha256: 'f0a78cec2f6564c1289241c533427215b057678cf46a32efca8754a25fafb561'});
 const failedProbes = {
  'frost-counter-1x-failed': {bytes: 26364, sha256: '75c18d428ed20b39b7806012803cadefa641547e491b440547622ce94f27f38f',
   final: /Ambush stage1 state135 ticks\d+ pots0 zombies0 score4 brains1/, remaining: / p5 col2 row2 hp28/},
  'center-bait-1x-failed': {bytes: 26186, sha256: '53dc181ad1b89a893efbcec36d4d4e58aabe7616fba4a5f64c2bfaadeed7ba22',
   final: /Ambush stage1 state135 ticks14983 pots0 zombies0 score4 brains1/, remaining: / p7 col1 row3 hp300/},
 };
 for (const [name, pin] of Object.entries(failedProbes)) {
  const capsule = revisions.retainedNativeFailureLogs[name], bytes = Buffer.from(capsule.rawLogBase64, 'base64');
  fields(capsule, {bytes: pin.bytes, sha256: pin.sha256}); assert.equal(bytes.length, pin.bytes); assert.equal(sha(bytes), pin.sha256);
  const output = text(bytes); assert(!output.includes('VASE_AMBUSH_RESULT '));
  assert.match(output, /vase-ambush:solution 1x solved1 in5810 ticks releases10/);
  assert.match(output, /vase-ambush:FAIL:independent literal release schedule failed its puzzle/);
  assert.match(output, pin.final); assert.match(output, pin.remaining);
 }
 const late = revisions.lateBoardBatch;
 assert.equal(late.priorSourceHeaderSha256, revisions.marginRevision.currentSourceHeaderSha256);
 assert.equal(late.priorPolicySha256, revisions.marginRevision.currentPolicySha256);
 assert.equal(late.currentSourceHeaderSha256, '65ff1f3f1f83cb0724ca55e9fe1f672997776b991e04e0f961240912c646a93d');
 assert.equal(late.currentPolicySha256, '3481028ffc1f0a9d2c16e1f25c963bf68c8b3137bddfae83733b2340abd33a19');
 assert.deepEqual(late.sourceChanges, [
  ...[0, 2, 4].map(row => ({board: 3, col: 6, row, before: 'ZOMBIE_NORMAL', after: 'ZOMBIE_TRAFFIC_CONE'})),
  ...[1, 3].map(row => ({board: 3, col: 8, row, before: 'ZOMBIE_TRAFFIC_CONE', after: 'ZOMBIE_PAIL'})),
 ]);
 assert.deepEqual(late.policyChanges, [
  {board: 4, change: 'Door bait first; delay Bucket8 volley from750to1500ticks and Normal7 volley from1500to2250ticks to separate the original mine blast.'},
  {board: 5, change: 'Open sideDoor7rows1/3 beforecenterDoor7row2, draining nativeMagnets before the center shield advances towardChomper.'},
 ]);
 const lateFailurePins = {
  'solution-1x-1729.log': {bytes: 27592, sha256: '1dcb94f59082f55ae3ba00a4e23f47feee3cba41dd5d081ee76590175e6b47d4'},
  'stage-probe-3-1x-1729.log': {bytes: 28023, sha256: '3b17305548f3cc53ed445cd8555e205a6f00418d13c837dd6f32472c0af37348'},
  'stage-probe-4-1x-1729.log': {bytes: 27478, sha256: 'eb63709b2e3866d118937bf4dd5bc80fc404dff26dbdfb1d4288809f4d633548'},
  'stage-probe-5-1x-1729.log': {bytes: 27465, sha256: '6429b1ad3e160ee476007a6d3a5c8ca22b5f1a59364673a5042174c586049e6e'},
 };
 assert.deepEqual(Object.keys(late.rawNativeEvidence).sort(), Object.keys(lateFailurePins).sort());
 for (const [name, pin] of Object.entries(lateFailurePins)) {
  const capsule = late.rawNativeEvidence[name], bytes = Buffer.from(capsule.rawLogBase64, 'base64');
  fields(capsule, pin); assert.equal(bytes.length, pin.bytes); assert.equal(sha(bytes), pin.sha256);
  const output = text(bytes), results = output.split(/\r?\n/).filter(line => line.startsWith('VASE_AMBUSH_RESULT '));
  if (name === 'solution-1x-1729.log') {
   assert.equal(results.length, 0);
   assert.match(output, /solved1 in5810 ticks releases10/); assert.match(output, /solved2 in8334 ticks releases15/);
   assert.match(output, /Ambush stage2 state135 ticks18996 pots0 zombies0 score0 brains5/);
   assert.match(output, /vase-ambush:FAIL:independent literal release schedule failed its puzzle/);
  } else {
   assert.equal(results.length, 1); const result = json(Buffer.from(results[0].slice('VASE_AMBUSH_RESULT '.length)));
   const stage = Number(name.match(/^stage-probe-(\d)-/)[1]), score = {3: 0, 4: 3, 5: 4}[stage];
   fields(result, {execution: 'synthetic-stage-exploration', name: 'stage-probe', stage, speed: 1, seed: 1729,
    syntheticStageSelection: true, postStartSetupEdits: true, postSetupCombatEdits: false,
    countedEarnedWins: 0, profileCredits: 0, outcome: 'native-loss', finalChallengeState: 135,
    nativeBrainScore: score, remainingBrains: 5 - score, remainingVases: 0, livingZombies: 0,
    nativeAwardDroppedWithoutCollection: false, silentHardware: true, audioDeviceOpened: false});
  }
 }
 const controller = revisions.visibleControllerAmendment;
 assert.equal(controller.priorPolicySha256, late.currentPolicySha256);
 const priorPolicy = Buffer.from(controller.priorFixedPolicyBase64, 'base64');
 assert.equal(priorPolicy.length, 3902); assert.equal(controller.priorFixedPolicyBytes, priorPolicy.length);
 assert.equal(sha(priorPolicy), late.currentPolicySha256);
 assert.equal(controller.currentSourceHeaderSha256, late.currentSourceHeaderSha256);
 assert.equal(controller.currentPolicySha256, 'd59744b584d9aa2c87043bbc47fd42b36ee7c4848c716e1e53f19ce9c0ac77fe');
 fields(controller, {cueDeadlineTicks: 12000, reactionTicks: 150, caseMatrixUnchanged: 30,
  speedPairsUnchanged: 14, replayHesitationsPerFullReplayUnchanged: 5});
 assert.deepEqual(controller.allowedDecisionInputs, ['visibleplantpresence', 'actualdrawnMagnetItemtype',
  'nativeChomperchewing/swallowingvisualphase', '150tickhumaninput/reactioncadence']);
 assert.deepEqual(controller.forbiddenDecisionInputs, ['HP', 'remainingcooldowns', 'futureRNG', 'futureevents',
  'directpoststartactor/stat/timeredits']);
 const fixedEvidence = {
  'solution-1x-1729.log': {bytes: 26907, sha256: '4dcdefaf06efc7bd0574061c889ad6fba55e13607536c2569df7b8d42afdf64c'},
  'stage-probe-3-1x-1729.log': {bytes: 27819, sha256: '663620ae6f6d6c9309f0da3d11e30e29d2bdf7706838a8edd0cc6509fc52ec73'},
  'stage-probe-4-1x-1729.log': {bytes: 27706, sha256: '6f3aa79f678fe2c53ea75f6909d440aef6c22c1257b67f7dbf8395cb2e418674'},
  'stage-probe-5-1x-1729.log': {bytes: 27702, sha256: '4e8fbcded3997bff7964d849b7b8a35e53173ad3456a2dce08bbb806a60c0a58'},
 };
 assert.deepEqual(Object.keys(controller.rawPriorFixedEvidence).sort(), Object.keys(fixedEvidence).sort());
 for (const [name, pin] of Object.entries(fixedEvidence)) {
  const capsule = controller.rawPriorFixedEvidence[name], bytes = Buffer.from(capsule.rawLogBase64, 'base64');
  fields(capsule, pin); assert.equal(bytes.length, pin.bytes); assert.equal(sha(bytes), pin.sha256);
  const output = text(bytes), results = output.split(/\r?\n/).filter(line => line.startsWith('VASE_AMBUSH_RESULT '));
  if (name === 'solution-1x-1729.log') {
   assert.equal(results.length, 0); assert.match(output, /solved3 in7110 ticks releases13/);
   assert.match(output, /vase-ambush:FAIL:puzzle skipped or repeated/);
  } else {
   assert.equal(results.length, 1); const result = json(Buffer.from(results[0].slice('VASE_AMBUSH_RESULT '.length)));
   const stage = Number(name.match(/^stage-probe-(\d)-/)[1]), score = {3: 5, 4: 4, 5: 3}[stage];
   fields(result, {execution: 'synthetic-stage-exploration', name: 'stage-probe', stage, speed: 1, seed: 1729,
    syntheticStageSelection: true, postStartSetupEdits: true, postSetupCombatEdits: false,
    countedEarnedWins: 0, profileCredits: 0, nativeBrainScore: score, remainingBrains: 5 - score,
    outcome: stage === 3 ? 'authored-board-clear' : 'native-loss'});
  }
 }
 const humane = revisions.humaneMargin;
 assert.equal(humane.priorPolicySha256, controller.currentPolicySha256);
 const priorReactivePolicy = Buffer.from(humane.priorPolicyBase64, 'base64');
 assert.equal(priorReactivePolicy.length, 4743); assert.equal(humane.priorPolicyBytes, priorReactivePolicy.length);
 assert.equal(sha(priorReactivePolicy), controller.currentPolicySha256);
 assert.equal(humane.priorSourceHeaderSha256, controller.currentSourceHeaderSha256);
 assert.equal(humane.currentSourceHeaderSha256, '441081e5121e4e6a429250d5db667bf51cd81942d7afe2e985f2c2dcbb544b61');
 assert.equal(humane.currentPolicySha256, 'c0a67495dd2742201b9221fbaa904d3b30a1d0dd4d86b573e89d653f2136a74a');
 assert.deepEqual(humane.changes, {
  board4: {removedPlants: [['SEED_PEASHOOTER', 1, 1], ['SEED_PEASHOOTER', 1, 3], ['SEED_PEASHOOTER', 2, 2]],
   allCol7Vases: 'ZOMBIE_NORMAL -> ZOMBIE_TRAFFIC_CONE'},
  board5: {removedPlants: [['SEED_WALLNUT', 3, 0], ['SEED_REPEATER', 1, 2]],
   changedPlants: [['SEED_THREEPEATER -> SEED_PEASHOOTER', 1, 3]], allCol8Vases: 'ZOMBIE_PAIL -> ZOMBIE_TRAFFIC_CONE',
   allCol6Vases: 'ZOMBIE_NORMAL -> ZOMBIE_TRAFFIC_CONE', centerCol7Vase: 'ZOMBIE_DOOR -> ZOMBIE_TRAFFIC_CONE'},
 });
 const reactiveFailurePins = {
  'solution-1x-1729.log': {bytes: 27733, sha256: '72e8593554570422fef6aa2a411a5410bcbc7989357251ecb1887cc1119ffa1f'},
  'stage-probe-4-1x-1729.log': {bytes: 28506, sha256: '427cfe7c6ba0ad6a6745340231c1022a2a67ed5b4413c1249a7bb1e471f8c067'},
  'stage-probe-5-1x-1729.log': {bytes: 28501, sha256: 'de3b37e397bb3e5adce28bac4d9ce6615a665a603e9f4865f1363f06f59ee4ed'},
  'controls-1x-1729.log': {bytes: 28014, sha256: '746732dcc6b1cca64a1d9b8b8bc8150110008f53db95fa1c299feb97879337e2'},
 };
 assert.deepEqual(Object.keys(humane.rawNativeEvidence).sort(), Object.keys(reactiveFailurePins).sort());
 for (const [name, pin] of Object.entries(reactiveFailurePins)) {
  const capsule = humane.rawNativeEvidence[name], bytes = Buffer.from(capsule.rawLogBase64, 'base64');
  fields(capsule, pin); assert.equal(bytes.length, pin.bytes); assert.equal(sha(bytes), pin.sha256);
  const output = text(bytes), results = output.split(/\r?\n/).filter(line => line.startsWith('VASE_AMBUSH_RESULT '));
  if (name === 'controls-1x-1729.log') {
   assert.equal(results.length, 0); assert.match(output, /RuntimeError: memory access out of bounds/);
  } else if (name === 'solution-1x-1729.log') {
   assert.equal(results.length, 0); assert.match(output, /solved3 in7110 ticks releases13/);
   assert.match(output, /Ambush stage3 state135 ticks8515 pots0 zombies0 score2 brains3/);
   assert.match(output, /vase-ambush:FAIL:preregistered human release policy failed its puzzle/);
  } else {
   assert.equal(results.length, 1); const result = json(Buffer.from(results[0].slice('VASE_AMBUSH_RESULT '.length)));
   const stage = Number(name.match(/^stage-probe-(\d)-/)[1]), score = stage === 4 ? 1 : 0;
   fields(result, {execution: 'synthetic-stage-exploration', stage, countedEarnedWins: 0, profileCredits: 0,
    outcome: 'native-loss', nativeBrainScore: score, remainingBrains: 5 - score});
  }
 }
 const cadence = revisions.controllerObservationCadence;
 fields(cadence, {nativeTicksPerObservation: 2, oneXActualUpdateFramesCalls: 2,
  twoXActualUpdateFramesCalls: 1, postStartCombatEdits: false,
  native150TickInputCadenceUnchanged: true, same30TickPairGateUnchanged: true});
 const priorCadencePins = {
  'solution-1x-1729.log': {bytes: 27668, sha256: '2073c4f408e609ceb8b582835fe4866f29f386d1165fde92a17c5b2eceed8314'},
  'solution-2x-1729.log': {bytes: 27173, sha256: '1415929d081fb87921ae3b8fe357e1674f7a42e110d8f0a01d0914276f145c25'},
  'controls-1x-1729.log': {bytes: 25879, sha256: '8ddce0748fbf1055959d2997feda3f289b69e4e77feb549d9ce3fe170b6071c2'},
 };
 assert.deepEqual(Object.keys(cadence.rawPriorEvidence).sort(), Object.keys(priorCadencePins).sort());
 const oldCadenceRows = [];
 for (const [name, pin] of Object.entries(priorCadencePins)) {
  const capsule = cadence.rawPriorEvidence[name], bytes = Buffer.from(capsule.rawLogBase64, 'base64');
  fields(capsule, pin); assert.equal(bytes.length, pin.bytes); assert.equal(sha(bytes), pin.sha256);
  const output = text(bytes), results = output.split(/\r?\n/).filter(line => line.startsWith('VASE_AMBUSH_RESULT '));
  if (name.startsWith('controls')) {
   assert.equal(results.length, 0); assert.match(output, /vase-ambush:FAIL:native card did not load the published \.3 flag-eight board/);
  } else {
   assert.equal(results.length, 1); const row = json(Buffer.from(results[0].slice('VASE_AMBUSH_RESULT '.length)));
   fields(row, {execution: 'complete-production-engine', name: 'solution', seed: 1729,
    outcome: 'win', boardsSolved: 5, brainsConsumed: 25, profileCredits: 1}); oldCadenceRows.push(row);
  }
 }
 oldCadenceRows.sort((a, b) => a.speed - b.speed);
 assert.deepEqual(oldCadenceRows.map(row => row.speed), [1, 2]);
 assert.equal(Math.max(...oldCadenceRows[0].boardTicks.map((ticks, at) => Math.abs(ticks - oldCadenceRows[1].boardTicks[at]))), 477,
  'The actual previously failed speed-pair bound remains recorded; it is not a passing release pair');
 const spike = revisions.spikeCrossingMargin;
 fields(spike, {priorContractSha256: '4fead4046fb7b7fb91bc83e7923b435057061987873e16041962d4eb601039c7',
  priorContractBytes: 8338, priorPolicySha256: humane.currentPolicySha256, priorPolicyBytes: 4763,
  priorSourceHeaderSha256: humane.currentSourceHeaderSha256});
 const priorContract = Buffer.from(spike.priorContractBase64, 'base64'), priorFixedPolicy = Buffer.from(spike.priorPolicyBase64, 'base64');
 assert.equal(priorContract.length, spike.priorContractBytes); assert.equal(sha(priorContract), spike.priorContractSha256);
 assert.equal(priorFixedPolicy.length, spike.priorPolicyBytes); assert.equal(sha(priorFixedPolicy), spike.priorPolicySha256);
 const failedContract = json(priorContract); assert.deepEqual(failedContract.matrix, matrix);
 fields(failedContract, {maximumBoardTicks: 40000, maximumSpeedPairTickDelta: 30, expectedPrimaryWins: 28,
  expectedReplayWins: 4, expectedGenuineBadPlanLosses: 4, productionObjectCount: 138, sourceCount: 860});
 assert.equal(Object.keys(failedContract.fixtureSha256).length, 16);
 assert.deepEqual(spike.changes, [0, 2, 4].map(row =>
  ({board: 3, col: 7, row, before: 'ZOMBIE_NORMAL', after: 'ZOMBIE_TRAFFIC_CONE'})));
 const outer = revisions.outerConeMargin;
 fields(outer, {priorContractSha256: '06d05a41dbaaadbe8681dc040afa119e513fbfb7b073a3ea0eefbbde40d499c9',
  priorContractBytes: 8785, priorPolicySha256: '9987874e09bd94b402c75e73058bf95de2ebccb0fbbe8d11776251864443d369',
  priorPolicyBytes: 4783, priorSourceHeaderSha256: '3ea325bdfda14c2475f046638a5ce7d28ee600c3d3cbb716197b6e099c826c32'});
 const outerPriorContract = Buffer.from(outer.priorContractBase64, 'base64'), outerPriorPolicy = Buffer.from(outer.priorPolicyBase64, 'base64');
 assert.equal(outerPriorContract.length, outer.priorContractBytes); assert.equal(sha(outerPriorContract), outer.priorContractSha256);
 assert.equal(outerPriorPolicy.length, outer.priorPolicyBytes); assert.equal(sha(outerPriorPolicy), outer.priorPolicySha256);
 const failedTargetsContract = json(outerPriorContract); assert.deepEqual(failedTargetsContract.matrix, matrix);
 fields(failedTargetsContract, {maximumBoardTicks: 40000, maximumSpeedPairTickDelta: 30,
  expectedPrimaryWins: 28, expectedReplayWins: 4, expectedGenuineBadPlanLosses: 4});
 assert.equal(Object.keys(failedTargetsContract.fixtureSha256).length, 16);
 assert.deepEqual(outer.changes, [0, 4].map(row =>
  ({board: 5, col: 7, row, before: 'ZOMBIE_DOOR', after: 'ZOMBIE_TRAFFIC_CONE'})));
 const currentHeaderBytes = await read('source/src/Lawn/System/VaseAmbush.h');
 assert.equal(outer.currentSourceHeaderSha256, sha(currentHeaderBytes));
 assert.equal(outer.currentPolicySha256, sha(await read('tests/vase-ambush-policy.h')));
 const currentHeader = text(currentHeaderBytes), fifthStart = currentHeader.indexOf('// Shared Threepeater fire'), fifthEnd = currentHeader.indexOf('constexpr int PlantCount', fifthStart);
 assert(fifthStart > 0 && fifthEnd > fifthStart); let fifth = currentHeader.slice(fifthStart, fifthEnd);
 for (const row of [0, 4]) {
  const now = `{ZOMBIE_TRAFFIC_CONE,7,${row}}`, before = `{ZOMBIE_DOOR,7,${row}}`;
  assert.equal(fifth.split(now).length, 2); assert(!fifth.includes(before)); fifth = fifth.replace(now, before);
 }
 const headerBytes = Buffer.from(currentHeader.slice(0, fifthStart) + fifth + currentHeader.slice(fifthEnd));
 assert.equal(sha(headerBytes), outer.priorSourceHeaderSha256,
  'Reversing only the two outer fifth-board escorts recovers the exact failed O2 target header');
 assert.equal(spike.currentSourceHeaderSha256, outer.priorSourceHeaderSha256);
 assert.equal(spike.currentPolicySha256, outer.priorPolicySha256);
 const header = text(headerBytes), start = header.indexOf('// Three Chompers need bait;'), end = header.indexOf('// Two mines and two magnets', start);
 assert(start > 0 && end > start); let third = header.slice(start, end);
 for (const row of [0, 2, 4]) {
  const now = `{ZOMBIE_TRAFFIC_CONE,7,${row}}`, before = `{ZOMBIE_NORMAL,7,${row}}`;
  assert.equal(third.split(now).length, 2); assert(!third.includes(before)); third = third.replace(now, before);
 }
 assert.equal(sha(Buffer.from(header.slice(0, start) + third + header.slice(end))), spike.priorSourceHeaderSha256,
  'Reversing only the three authored support vases recovers the exact failed O2 header');
 const spikeFailurePins = {
  'replay-1x-7331.log': {bytes: 25060, sha256: '6a4bf2e709bc309f7775b23a88d4d3ab5757ebdf6c285cad40bf8f70731de4c5'},
  'replay-2x-7331.log': {bytes: 25054, sha256: '4d835d9b288cceea03cf32b5f3d4875b285d2e45b57de58ce9f5472ce4829c38'},
 };
 assert.deepEqual(Object.keys(spike.rawNativeEvidence).sort(), Object.keys(spikeFailurePins).sort());
 for (const [name, pin] of Object.entries(spikeFailurePins)) {
  const capsule = spike.rawNativeEvidence[name], bytes = Buffer.from(capsule.rawLogBase64, 'base64');
  fields(capsule, pin); assert.equal(bytes.length, pin.bytes); assert.equal(sha(bytes), pin.sha256);
  const output = text(bytes); assert(!output.includes('VASE_AMBUSH_RESULT '));
  assert.match(output, /Ambush stage2 state135 ticks21904 pots0 zombies0 score4 brains1/);
  assert.match(output, /vase-ambush:FAIL:preregistered human release policy failed its puzzle/);
  assert.equal(output.split(/\r?\n/).filter(line => /^vase-ambush:replay(?:-clear)? [12]x solved/.test(line)).length, 7);
  for (const row of [0, 2, 4]) assert(output.includes(` p21 col2 row${row} hp300 state0 timer0`));
 }
 const outerFailurePins = {
  'replay-1x-1729.log': {bytes: 24066, sha256: '539dbc808fae825f3cefd9b5f732d5772f2618ca85eb9680e6210171dd02a4f2'},
  'replay-2x-1729.log': {bytes: 24063, sha256: '3562cf50cd1d2552f610baa31ec0d026f708549e6067da83dae814407f5ff518'},
 };
 assert.deepEqual(Object.keys(outer.rawNativeEvidence).sort(), Object.keys(outerFailurePins).sort());
 for (const [name, pin] of Object.entries(outerFailurePins)) {
  const capsule = outer.rawNativeEvidence[name], bytes = Buffer.from(capsule.rawLogBase64, 'base64');
  fields(capsule, pin); assert.equal(bytes.length, pin.bytes); assert.equal(sha(bytes), pin.sha256);
  const output = text(bytes); assert(!output.includes('VASE_AMBUSH_RESULT '));
  assert.match(output, /Ambush stage4 state135 ticks\d+ pots0 zombies0 score4 brains1/);
  assert.match(output, / p0 col1 row4 hp32 state0 timer0/);
  assert.match(output, /vase-ambush:FAIL:preregistered human release policy failed its puzzle/);
  assert.equal(output.split(/\r?\n/).filter(line => /^vase-ambush:replay(?:-clear)? [12]x solved/.test(line)).length, 9);
 }
}

export async function verifyVaseAmbush({report, read, sha, engine, fullRunReport,
 productionBuildBytes, currentArtBytes, previousArtBytes}) {
 assert.equal(engine.id, CURRENT_ENGINE_ID);
 fields(report, {status: 'PASS', execution: 'complete-production-engine', optimization: 'O2', failures: 0,
  exitCode: 0, engineId: CURRENT_ENGINE_ID, mode: 89, profileIndex: 88, rulesVersion: 1,
  productionObjectCount: CURRENT_OBJECT_COUNT});
 assert(!Object.hasOwn(report, 'basePrefixReuse'));
 const contractBytes = await read('tests/vase-ambush-verification-contract.json'), contractPin = sha(contractBytes);
 digest(contractPin);
 assert(acceptedContractPins.has(contractPin), 'The complete final O2 Vase Ambush matrix and contract have not been accepted');
 const contract = json(contractBytes);
 assert.equal(report.verificationContractSha256, contractPin);
 fields(contract, {schemaVersion: 1, engineId: AMBUSH_ENGINE_ID, mode: 89, profileIndex: 88, rulesVersion: 1,
  sourceCount: 860, productionObjectCount: 138, playablePrimaryRuns: 28,
  isolatedSyntheticControls: 2, nativeSpeedPairs: 14, expectedFullBoards: 5, expectedBrainsPerBoard: 5,
  expectedPrimaryWins: 28, expectedReplayWins: 4, expectedGenuineBadPlanLosses: 4, originalArtInputs: 942,
  maximumBoardTicks: 40000, maximumSpeedPairTickDelta: 30});
 assert.deepEqual(contract.matrix, matrix);
 assert.deepEqual(contract.policyModel, {literalReleasePolicy: false, visibleReactivePolicy: true,
  preregisteredCellOrder: true, hiddenHPOrRNGPolicyReads: false,
  usedCuesPerFullRun: {minesGone: 1, magnetsHoldingMetal: 1, chomperChewing: 1}, reactionTicks: 150, cueDeadlineTicks: 12000,
  observationNativeTicks: 2, oneXActualUpdateFramesCalls: 2, twoXActualUpdateFramesCalls: 1});
 assert.deepEqual(contract.syntheticNavigationControls, {continueSavedBoard: 4, continueNewGameCancelGraphExact: true,
  continueNewGameAcceptStartsBoard: 1, gameOverModal: 'explicitly-synthetic-production-dialog',
  mainMenuReturnsToBonus: true, actualBonusCardStartsBoard: 1, countedEarnedWins: 0,
  genuineRetryRemainsNaturalBoardThreeLoss: true});
 assert.deepEqual(contract.nativeScreenLifecycle, {cardUsesExistingNativeBonusPage: true,
  neverReplaceAttachedChallengeScreen: true, syntheticRenderOracleRunsLast: true,
  saveNavigationLegacyProofsRunBeforeSyntheticModeSwitchingDraws: true, noPostOracleSaveOrNavigation: true,
  nativeCardContinueDismissedByActualMouse: true});
 assert.deepEqual(contract.humaneMargin, {beforeExecution: true,
  currentSourceHeaderSha256: '441081e5121e4e6a429250d5db667bf51cd81942d7afe2e985f2c2dcbb544b61', plantCounts,
  vaseCounts, stockCombatUnchanged: true, humanVisibleTimingUnchanged: true});
 assert.deepEqual(contract.spikeCrossingMargin, {currentSourceHeaderSha256: '3ea325bdfda14c2475f046638a5ce7d28ee600c3d3cbb716197b6e099c826c32',
  board: 3, nativeConeEscortsAt: [[7, 0], [7, 2], [7, 4]], allActorCountsAndPositionsUnchanged: true,
  allAcceptanceGatesUnchanged: true, priorFinalO2AttemptFailed: true});
 assert.deepEqual(contract.outerConeMargin, {currentSourceHeaderSha256: sha(await read('source/src/Lawn/System/VaseAmbush.h')),
  board: 5, nativeConeEscortsAt: [[7, 0], [7, 4]], nativeSideDoorsAndActualMagnetCueRetained: true,
  allActorCountsAndPositionsUnchanged: true, allAcceptanceGatesUnchanged: true, priorO2TargetsFailed: true});
 assert.deepEqual(contract.timingTolerance, {case: 'replay', secondFullRunOnly: true,
  hesitationTicks: 150, hesitationsPerReplay: 5,
  policy: 'During the second actual five-board replay, delay one middle input by150ticks on every board. Earlier boards retain literal input schedules; boards4/5 retain preregistered cell orders and human-visible cue/reaction timing.'});
 assert.deepEqual(contract.saveGraphMagnetExtension, {plantFieldsBeforeExtension: 13, magnetItemsPerPlant: 5,
  appendedFieldsPerMagnet: ['itemType', 'posX', 'posY', 'destOffsetX', 'destOffsetY'], plantFieldsAfterExtension: 38,
  usedForDecisions: false});
 assert.deepEqual(contract.releaseAccounting, {earnedBoardReleases: 'sum(boardReleases)', actualWrongOrderRetryReleases: 13,
  actualAbandonedOptionsRestartReleases: 1, abandonedReleaseAppliesOnlyTo: 'solution'});
 fields(contract.diagnosticCleanup, {includedInAcceptedHarness: false});
 assert.deepEqual(contract.checkpointCounts, {checkpointZombies: 'all nondead graph zombie records including native dying actors',
  checkpointActiveZombies: 'nondead nondying native zombies on board', checkpointProjectiles: 'all nondead graph projectile records',
  saveCombatRequiresActiveZombiesAndLiveProjectiles: true});
 const requiredFixtures = [...Object.keys(historicalPins), 'tests/vase-ambush-policy.h',
  'tests/vase-ambush-legacy-controls.h', 'tests/vase-ambush-native-art-inputs.json', 'tests/vase-ambush-assets.json',
  'tests/vase-ambush-balance-revisions.json', 'tests/vase-ambush-harness.cpp',
  'tests/build-vase-ambush.py', 'tests/test-vase-ambush.py'];
 assert.deepEqual(Object.keys(contract.fixtureSha256).sort(), [...requiredFixtures].sort(),
  'The final sixteen actual native inputs are complete and bounded');
 const retained=await verifyTorchRetainedParentInputs({read,sha});
 const adapterBytes=await read('tests/double1-vase-retention.json');
 assert(CURRENT_VASE_RETENTION_SHA256,'The current Vase execution envelope has not been accepted');
 assert.equal(sha(adapterBytes),CURRENT_VASE_RETENTION_SHA256);
 assert.equal(report.retentionAdapterSha256,CURRENT_VASE_RETENTION_SHA256);
 const adapter=json(adapterBytes);
 fields(adapter,{schemaVersion:1,parentEngineId:TORCH_ENGINE_ID,parentArchiveSha256:TORCH_ARCHIVE_SHA256,
  engineId:CURRENT_ENGINE_ID,historicalContractSha256:contractPin,sourceCount:CURRENT_SOURCE_COUNT,
  productionObjectCount:CURRENT_OBJECT_COUNT,all30CasesFresh:true});
 await verifyPublishedTorchAdapter({read,sha,adapter,family:'vase'});
 assert.deepEqual(Object.keys(adapter.fixtureOverrides),['tests/test-vase-ambush.py']);
 assert.equal(retained.files['vase-ambush-verification-contract.json'].sha256,contractPin);
 const originalRunner=await read('tests/torch1-retained-parent/test-vase-ambush.py');
 assert.equal(sha(originalRunner),retained.files['test-vase-ambush.py'].sha256);
 assert.equal(sha(originalRunner),contract.fixtureSha256['tests/test-vase-ambush.py']);
 for (const name of requiredFixtures) assert(Object.hasOwn(contract.fixtureSha256, name), 'Independent final input pin: ' + name);
 for (const [name, pin] of Object.entries(contract.fixtureSha256)) {
  safeName(name); assert(name.startsWith('tests/')); digest(pin);
  const currentPin=Object.hasOwn(adapter.fixtureOverrides,name)?adapter.fixtureOverrides[name]:pin;
  digest(currentPin);assert.equal(sha(await read(name)),currentPin,'Original frozen Vase input or independently accepted current execution envelope: '+name);
 }
 for (const [name, pin] of Object.entries(historicalPins)) {
  assert.equal(contract.fixtureSha256[name], pin); assert.equal(sha(await read(name)), pin, 'Original development/legacy bytes remain separate: ' + name);
 }
 await verifyVaseDevelopmentHistory({read, sha});
 assert.equal(Object.keys(report.sourceSha256).length, CURRENT_SOURCE_COUNT);
 assert.equal(Object.keys(report.productionObjectSha256).length, CURRENT_OBJECT_COUNT);
 assert.deepEqual(report.sourceSha256, fullRunReport.sourceSha256);
 assert.deepEqual(report.productionObjectSha256, fullRunReport.productionObjectSha256);
 for (const [name, pin] of Object.entries(report.sourceSha256)) {
  safeName(name); assert(name.startsWith('source/')); digest(pin); assert.equal(sha(await read(name)), pin);
 }
 for (const [name, pin] of Object.entries(report.productionObjectSha256)) { safeName(name); digest(pin); }
 assert.equal(report.productionBuildReceiptSha256, sha(productionBuildBytes));
 const normal = json(productionBuildBytes);
 fields(normal, {status: 'PASS', exitCode: 0, sourceFiles: CURRENT_SOURCE_COUNT, sourceUnchangedDuringBuild: true});
 for (const suffix of ['js', 'wasm']) assert.equal(normal.outputs['build/pvz-portable.' + suffix].sha256, engine.artifacts[suffix + 'Sha256']);
 const build = json(await read('tests/vase-ambush-build.json'));
 for (const name of ['execution', 'optimization', 'productionObjectCount', 'productionBuildReceiptSha256',
  'generatedHarnessSha256', 'policySha256', 'legacyControlSha256', 'verificationContractSha256',
  'builderSha256', 'testArtifactSha256', 'sourceSha256', 'productionObjectSha256'])
  assert.deepEqual(report[name], build[name], 'Actual complete-engine driver binding: ' + name);
 for (const [name, field] of [['vase-ambush-harness.cpp', 'generatedHarnessSha256'], ['vase-ambush-policy.h', 'policySha256'],
  ['vase-ambush-legacy-controls.h', 'legacyControlSha256'], ['build-vase-ambush.py', 'builderSha256'],
  ['test-vase-ambush.py', 'runnerSha256'], ['vase-ambush-assets.json', 'assetFixtureSha256']])
  assert.equal(sha(await read('tests/' + name)), report[field]);
 assert.deepEqual(Object.keys(report.testArtifactSha256).sort(), ['vase-ambush-engine.js', 'vase-ambush-engine.wasm']);
 for (const [name, pin] of Object.entries(report.testArtifactSha256)) { digest(pin); assert.equal(sha(await read('tests/' + name)), pin); }
 assert(WebAssembly.validate(await read('tests/vase-ambush-engine.wasm')));
 const assets = json(await read('tests/vase-ambush-assets.json'));
 assert.equal(assets.assetBundleId, engine.assetBundleId); assert.equal(report.assetBundleId, engine.assetBundleId);
 assert.deepEqual(assets.files['main.pak'], {bytes: 45453180, sha256: '5878326408285cb01f83b4fa4edcc66d65e727f6d6ee88563b5b3b287dd259fc'});
 const artBytes = await read('tests/vase-ambush-native-art-inputs.json'), art = json(artBytes);
 assert.equal(sha(artBytes), nativeArtPin); assert.equal(report.nativeArtFixtureSha256, nativeArtPin);
 assert.equal(contract.fixtureSha256['tests/vase-ambush-native-art-inputs.json'], nativeArtPin);
 assert.equal(report.nativeArtInputs, 942); assert.equal(Object.keys(art.sourceInputs).length, 942);
 fields(art, {assetBundleId: engine.assetBundleId, mainPakSha256: assets.files['main.pak'].sha256});
 const priorBytes = await read('tests/scrap-yard-native-art-inputs.json'); assert.equal(sha(priorBytes), priorArtPin);
 const priorArt = json(priorBytes); assert.equal(Object.keys(priorArt.sourceInputs).length, 866);
 for (const [name, pin] of Object.entries(priorArt.sourceInputs)) assert.deepEqual(art.sourceInputs[name], pin);
 for (const [name, pin] of Object.entries(art.sourceInputs)) { safeName(name); integer(pin.bytes, 1); digest(pin.sha256); }
 for (const name of ['images/Scary_Pot.png', 'images/brain.png', 'compiled/reanim/Hammer.reanim.compiled',
  'compiled/particles/VaseShatterZombie.xml.compiled', 'compiled/particles/ScreenFlash.xml.compiled'])
  assert(Object.hasOwn(art.sourceInputs, name), 'Original vase, hammer, brain and effect resource: ' + name);
 assert.equal(report.scenarios.length, 30);
 assert.deepEqual(report.scenarios.map(key).sort(), matrix.map(([name, speed, seed]) => key({name, speed, seed})).sort());
 for (const row of report.scenarios) { verifyVaseScenario(row); await verifyVaseCaseLog(row, {read, sha}); }
 assert.equal(report.scenarios.filter(row => row.outcome === 'win').length, 28);
 assert.equal(report.scenarios.filter(row => row.outcome === 'controls-pass').length, 2);
 assert.equal(report.checks, CURRENT_SOURCE_COUNT + report.scenarios.reduce((sum, row) => sum + row.checks, 0));
 assert.equal(report.speedPairs.length, 14);
 assert.deepEqual(report.speedPairs.map(row => `${row.name}/${row.seed}`).sort(), names.flatMap(name => [1729, 7331].map(seed => `${name}/${seed}`)).sort());
 for (const pair of report.speedPairs) {
  const rows = report.scenarios.filter(row => row.name === pair.name && row.seed === pair.seed).sort((a, b) => a.speed - b.speed);
  assert.deepEqual(rows.map(row => row.speed), [1, 2]); assert.equal(pair.semanticResultEqual, true);
  for (const field of ['outcome', 'boardsSolved', 'brainsConsumed', 'profileCredits', 'boardReleases',
   'nativeBrainLedgers', 'failureAndRetry', 'replayRewardChecked', 'native150TickHesitations',
   'visibleMineCueObservations', 'visibleMagnetCueObservations', 'visibleChomperCueObservations']) assert.deepEqual(rows[0][field], rows[1][field]);
  const deltas = rows[0].boardTicks.map((ticks, index) => Math.abs(ticks - rows[1].boardTicks[index]));
  assert.deepEqual(pair.boardTickDeltas, deltas); deltas.forEach(delta => integer(delta, 0, 30));
 }
 assert.equal(sha(previousArtBytes), previousCardPin);
 const currentArt = json(currentArtBytes), previousArt = json(previousArtBytes);
 assert.equal(previousArt.cards.length, 16); assert.equal(currentArt.cards.length, 19);
 assert.deepEqual({...currentArt, cards: currentArt.cards.slice(0, 16)}, previousArt);
 fields(currentArt.cards[16], {mode: 89, name: 'Vase Ambush', generatedArtworkUsed: false, background: 'IMAGE_BACKGROUND1'});
 for (const name of ['tip', 'tips', 'descriptionBelowCard']) assert(!Object.hasOwn(currentArt.cards[16], name));
 await verifyVaseSourceBounds({read, sha, engine});
 return {cases: 30, primaryWins: 28, replayWins: 4, genuineBadOrderLosses: 4, syntheticControls: 2,
  nativeSpeedPairs: 14, checks: report.checks};
}
