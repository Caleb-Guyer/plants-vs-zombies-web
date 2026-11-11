// SPDX-License-Identifier: MIT
// Independent native-case/log verification. Synthetic controls never count as wins.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CURRENT_ENGINE_ID, CURRENT_SOURCE_COUNT, CURRENT_OBJECT_COUNT, ENDLESS3_ENGINE_ID,
 ENDLESS3_ARCHIVE_SHA256, SCRAP_ENGINE_ID, SCRAP_ARCHIVE_SHA256, CURRENT_SCRAP_RETENTION_SHA256,
 AMBUSH_ENGINE_ID,AMBUSH_ARCHIVE_SHA256,AMBUSH_SCRAP_RETENTION_SHA256,
 historicalEngine, verifyRetainedParentInputs,verifyTorchRetainedParentInputs} from './native-release-context.mjs';

// Preregistered contract authenticated after all18 actual O2 cases passed.
const finalContractPin = '2ada5367e1e3683d6adf3c373d3a58b304e5f2311c18c89c2de690e48dd8fb1c';
const preTuningPlanPin = 'a16899a690af106364adc884b835dc9f90a55443cc92cc62022e2e3f8ab79a0a';
const previousArtPin = '538175fc8c54e8efb241a129263f2c99ee8e4193fb09ace213a67e9430f7483b';
const nativeArtPin = '952a51285a84e7b6cf232fdb96ddad60b65eb6d495db4a8b052d38ff241fd45b';
const publishedScrapArtPin = '183cb482642023f7b1ed7102052143b0c5bf543204150626670c832d4db3eaf0';
// Exact inputs from the authenticated published .3 archive's
// tests/endless3-earned-checkpoints/late-earned-1x-1729/earned-flag-8 outputs.
const legacyPins = {
  'scrap-yard-legacy-profile.dat': {bytes: 886, sha256: 'c5da611e351f811048a907ccc5226505c8c1f43e798c6e2bc0117fa8324e6633'},
  'scrap-yard-legacy.v4': {bytes: 346287, sha256: 'f8bab5aca74244f926b3334491af9a965d59dfa99b3a07a2d2425508f086da74'},
};
const names = ['normal', 'save-pull', 'save-sun', 'no-action'];
const matrix = [1729, 7331].flatMap(seed => names.flatMap(name => [1, 2].map(speed => [name, speed, seed])))
  .concat([['controls', 1, 1729], ['controls', 2, 7331]]);
const startingPlants = [
  ...[0, 2, 4].map(row => ({seedType: 0, column: 1, row, nativeHealth: 300})),
  ...[0, 1, 2, 3, 4].map(row => ({seedType: 31, column: 3, row, nativeHealth: 300})),
  ...[0, 1, 2, 3, 4].map(row => ({seedType: 3, column: 5, row, nativeHealth: 4000})),
];
const key = row => `${row.name}/${row.speed}/${row.seed}`;
const integer = (value, low, high = Number.MAX_SAFE_INTEGER) =>
  assert(Number.isSafeInteger(value) && value >= low && value <= high, `Integer ${value} outside [${low}, ${high}]`);
const digest = value => assert.match(value, /^[a-f0-9]{64}$/);
const fields = (record, expected) => {
  for (const [name, value] of Object.entries(expected)) assert.deepEqual(record[name], value, 'Native Scrap observation: ' + name);
};
const safeName = name => {
  assert(typeof name === 'string' && name && !name.startsWith('/') && !/[\\:]/.test(name) &&
    !name.split('/').some(part => !part || part === '.' || part === '..'));
  return name;
};

export async function verifyScrapCaseLog(row, {read, sha}) {
  assert([...names, 'controls'].includes(row.name));
  assert([1, 2].includes(row.speed)); assert([1729, 7331].includes(row.seed));
  const bytes = await read(`tests/scrap-yard-logs/${row.name}-${row.speed}x-${row.seed}.log`);
  digest(row.logSha256); assert.equal(sha(bytes), row.logSha256, 'Scrap outcome binds its actual raw native output');
  const text = Buffer.from(bytes).toString('utf8'), prefix = 'SCRAP_YARD_RESULT ';
  const records = text.split(/\r?\n/).filter(line => line.startsWith(prefix));
  assert.equal(records.length, 1, 'Exactly one actual native Scrap result is required');
  assert(!text.includes('scrap-yard FAIL:'), 'A failed native invocation cannot supply a passing result');
  const raw = JSON.parse(records[0].slice(prefix.length));
  const warnings = ['Too many particle emitters', 'Too many particle systems', 'Too many particles']
    .reduce((sum, warning) => sum + text.split(warning).length - 1, 0);
  assert.deepEqual(row, {...raw, logSha256: sha(bytes), resourceCapacityWarnings: warnings},
    'Every reported native observation comes from the authenticated raw result');
  assert.equal(warnings, 0, 'Native particle/emitter capacity cannot overflow');
}

function verifyCheckpoint(row) {
  const saved = row.name === 'save-pull' || row.name === 'save-sun';
  fields(row, {checkpoint: saved, checkpointGraphPreserved: saved,
    checkpointKind: saved ? row.name === 'save-pull' ? 'native-metal-pull' : 'native-loose-sun' : 'none'});
  if (!saved) {
    fields(row, {checkpointBeforeGraph: '', checkpointAfterGraph: '', checkpointFlyingItems: 0, checkpointLooseSun: 0});
    return;
  }
  assert.equal(typeof row.checkpointBeforeGraph, 'string');
  assert(row.checkpointBeforeGraph.length > 100);
  assert.equal(row.checkpointBeforeGraph, row.checkpointAfterGraph, 'Native Continue preserves the complete observed metal/actor/plant/coin/bank graph');
  const [head, ...items] = row.checkpointBeforeGraph.split(';'), counters = head.split(':').map(Number);
  assert.equal(counters.length, 11); counters.forEach(value => integer(value, 0));
  integer(counters[3], 0, 6); assert.equal(counters[6], counters[3]);
  assert.equal(counters[7], 130); assert.equal(counters[10], 1);
  const bank = [], ids = new Set(); let flying = 0, looseSun = 0;
  for (const item of items) {
    assert(/^[pzcs]/.test(item));
    const tag = item[0], values = item.slice(1).split(',').map(Number);
    values.forEach(value => assert(Number.isFinite(value)));
    if (tag === 's') { assert.equal(values.length, 6); bank.push(values[0]); continue; }
    integer(values[0], 1); assert(!ids.has(tag + values[0])); ids.add(tag + values[0]);
    if (tag === 'p') {
      assert.equal(values.length, 31, 'Native plant graph retains all five existing Magnet item slots');
      for (let at = 6; at < values.length; at += 5) { integer(values[at], 0, 21); flying += values[at] !== 0; }
    } else if (tag === 'c') {
      assert.equal(values.length, 6); integer(values[4], 0, 1);
      looseSun += values[1] === 4 && values[4] === 0;
    } else assert.equal(values.length, 10);
  }
  assert.deepEqual(bank, [31, 3, 2, 20, 17], 'All five native packet identities survive Continue');
  assert.equal(row.checkpointFlyingItems, flying); assert.equal(row.checkpointLooseSun, looseSun);
  if (row.name === 'save-pull') integer(flying, 1);
  else integer(looseSun, 1);
}

export function verifyScrapScenario(row) {
  assert(matrix.some(([name, speed, seed]) => key(row) === key({name, speed, seed})), 'Known native Scrap case identity');
  fields(row, {execution: 'complete-production-engine', profileIndex: 87, resourceCapacityWarnings: 0,
    silentHardware: true, audioDeviceOpened: false});
  integer(row.checks, 21);
  if (row.name === 'controls') {
    fields(row, {outcome: 'controls-pass', syntheticControls: true, countedEarnedWins: 0,
      nativeSuccessfulMetalKinds: 8, nativeZombieMetalTypes: [4, 7, 6, 21, 18, 15, 17],
      nativeRewardCoinsPerPull: 2, nativeRewardSunPerPull: 50, nativeMetalContinueControls: 1,
      nativeArmorAndAbilitiesRemoved: true, placedLadderReward: true, noDuplicateOrFailedReward: true,
      rewardModeRestricted: true, nativeInvalidPlacementNoCost: true, nativePauseGraphPreserved: true,
      publishedEndless3ProfileNativeRoundTrip: true, all100LegacyRecordsPreserved: true, legacyRecordCount: 100,
      legacyMode: 87, legacyProfileIndex: 86, legacyEarnedFlags: 8, legacyCardContinueNative: true,
      legacySaveContinueGraphExact: true, legacyAcceptedCardsPreserved: true, legacyNoNewScrapTrophy: true,
      legacyControlsCountedEarnedWins: 0});
    return;
  }
  fields(row, {visibleOnlyPolicy: true, postStartHPActorStageRNGEdits: false,
    policyIntervalTicks: 150, inputLatencyTicks: 25, nativeSixteenthCardInput: true});
  integer(row.nativeTicks, 1, 45000);
  integer(row.formations, 0, 6); integer(row.authoredZombies, 0, 38);
  assert.equal(row.formationSpawnTicks.length, row.formations);
  assert.equal(row.formationLiveBodyCounts.length, row.formations);
  const observationLag = row.formations ? row.formationSpawnTicks[0] - 1800 : 0;
  integer(observationLag, 0, row.speed - 1);
  row.formationSpawnTicks.forEach((tick, index) => {
    integer(tick, 1, row.nativeTicks);
    assert.equal(tick, 1800 + observationLag + index * 3500,
      'Post-frame observations retain the native opening and fixed35-second intervals with one consistent sampling lag');
    integer(row.formationLiveBodyCounts[index], 0, 38);
  });
  integer(row.mowersRemaining, 0, 5); integer(row.successfulPulls, 0, 38);
  integer(row.createdSun, 0, 1900); integer(row.sunClicks, 0, row.successfulPulls * 2);
  integer(row.nativePlacements, 0); integer(row.nativeSunSpent, 0, 800 + row.createdSun);
  integer(row.nativeDamageObservations, 0);
  integer(row.nativePeaProjectiles, 0); integer(row.nativePeaBodyDamageEvents, 0);
  integer(row.nativePendingPlacementsCancelledAtVictory, 0, 1);
  integer(row.liveFinalEnemies, 0, 38);
  assert.equal(row.createdSun, row.successfulPulls * 50, 'Every committed native removal creates exactly two original25-sun coins');
  verifyCheckpoint(row);
  if (row.name === 'no-action') {
    fields(row, {outcome: 'native-loss', profileCredits: 0, nativePlacements: 0,
      sunClicks: 0, nativeSunSpent: 0, checkpoint: false, finalChallengeState: 130,
      awardDropped: false, nativeActualAwardCoin: false, nativePendingPlacementsCancelledAtVictory: 0});
    return;
  }
  fields(row, {outcome: 'win', formations: 6, authoredZombies: 38, profileCredits: 1,
    checkpoint: row.name !== 'normal', missedMiddleDecision: true, finalChallengeState: 131,
    liveFinalEnemies: 0, awardDropped: true, nativeActualAwardCoin: true});
  integer(row.mowersRemaining, row.name === 'normal' ? 2 : 1, 5);
  integer(row.successfulPulls, 12, 38); integer(row.createdSun, 600, 1900);
  integer(row.nativePlacements, 1); integer(row.nativeDamageObservations, 1);
  integer(row.sunClicks, 1, row.successfulPulls * 2); integer(row.nativeSunSpent, 1, 800 + row.createdSun);
  integer(row.nativePeaProjectiles, 1); integer(row.nativePeaBodyDamageEvents, 1);
}

async function verifySourceBounds({read}) {
  const header = Buffer.from(await read('source/src/Lawn/System/ScrapYard.h')).toString();
  const source = Buffer.from(await read('source/src/Lawn/System/ScrapYard.cpp')).toString();
  for (const expression of [/kMode = GAMEMODE_CHALLENGE_SCRAP_YARD/, /kActive = static_cast<ChallengeState>\(130\)/,
    /kFinished = static_cast<ChallengeState>\(131\)/, /kStartingSun = 800;/, /kWaveCount = 6;/,
    /kOpeningDelay = 1800;/, /kFormationInterval = 3500;/,
    /std::array<StartingPlant,13> kStartingPlants/,
    /kCoinsPerPull = 2;/, /kSunPerPull = 50;/, /static_assert\(static_cast<int>\(kMode\) == 88\)/])
    assert.match(header, expression);
  for (const row of [0, 2, 4]) assert.match(header, new RegExp('SEED_PEASHOOTER,1,' + row));
  const setup = header.slice(header.indexOf('kStartingPlants'), header.indexOf('struct Spawn'));
  const seedIds = {SEED_PEASHOOTER: 0, SEED_MAGNETSHROOM: 31, SEED_WALLNUT: 3};
  assert.deepEqual([...setup.matchAll(/\{(SEED_\w+),(\d+),(\d+)\}/g)].map(([, seed, column, row]) =>
    ({seedType: seedIds[seed], column: Number(column), row: Number(row), nativeHealth: seed === 'SEED_WALLNUT' ? 4000 : 300})), startingPlants);
  assert.match(source, /std::clamp\(challenge\.mSurvivalStage,0,kWaveCount\)/);
  assert.match(source, /if \(next < kWaveCount\)/);
  assert.equal([...source.matchAll(/board\.mZombieHealthToNextWave\s*=\s*-1;/g)].length, 2,
    'Both initial and subsequent Scrap formations disable native health-triggered acceleration');
  assert.match(source, /if \(challenge\.mChallengeStateCounter != 0\) return;/);
  assert.match(source, /challenge\.mChallengeStateCounter = kFormationInterval;/);
  assert(!/TotalZombiesHealthInWave\(next\s*-\s*1\)/.test(source),
    'Successful armor recycling cannot advance the next timed formation');
  assert.match(source, /if \(board\.AreEnemyZombiesOnScreen\(\)\) return;[\s\S]*challenge\.mChallengeState = kFinished;[\s\S]*challenge\.SpawnLevelAward\(4,2\);/);
  assert.match(source, /IsMode\(board->mApp->mGameMode\)/);
  assert.match(source, /board\.AddCoin\([^;]+COIN_SUN,COIN_MOTION_FROM_PLANT\)/);
  assert(!/(?:\.|->)m(?:Plant|Body|Helm|Shield)Health\s*=(?!=)/.test(source),
    'Scrap mechanics use original native plant and zombie health');
  const zombie = Buffer.from(await read('source/src/Lawn/Zombie.cpp')).toString();
  const awardStart = zombie.indexOf('bool Zombie::TrySpawnLevelAward()');
  const nativeGuards = zombie.indexOf('if (!IsOnBoard()', awardStart);
  assert(awardStart >= 0 && nativeGuards > awardStart);
  assert.match(zombie.slice(awardStart, nativeGuards), /ScrapYard::IsMode\(mApp->mGameMode\)[\s\S]*return false;/,
    'The native generic zombie award path defers exclusively to Scrap.Update');
  const presentation = Buffer.from(await read('source/src/Lawn/System/ScrapYardPresentation.cpp')).toString();
  for (const resource of ['REANIM_MAGNETSHROOM', 'IMAGE_REANIM_ZOMBIE_BUCKET1', 'IMAGE_REANIM_ZOMBIE_LADDER_1', 'IMAGE_BACKGROUND2'])
    assert(presentation.includes(resource), 'The new native card composes its authenticated original sprites: ' + resource);
  assert.match(presentation, /Blank\(80, 65\)/);
  assert.match(presentation, /std::min\(58\.0f \/ bounds\.mWidth, 54\.0f \/ bounds\.mHeight\)/);
  assert.match(presentation, /40\.0f - \(bounds\.mX[\s\S]*33\.0f - \(bounds\.mY/);
  const heroDraw = presentation.indexOf('PvzpDrawImageScaledF(&picture, portrait.get()');
  for (const prop of ['ladder', 'bucket']) {
    const propDraw = presentation.indexOf('PvzpDrawImageScaledF(&picture, ' + prop + ',');
    assert(propDraw >= 0 && propDraw < heroDraw, 'Recovered native metal renders behind the independently fitted plant');
  }
  assert.match(presentation, /ladderScale = 30\.0f \/ ladder->GetHeight\(\)/);
  assert.match(presentation, /bucketScale = 14\.0f \/ bucket->GetWidth\(\)/);
  assert(!/DecodeBase64|BonusChallengeArt|png_image_/.test(presentation));
  const harness = Buffer.from(await read('tests/scrap-yard-harness.cpp')).toString();
  for (const expression of [/class SilentSoundManager final/, /mSoundManager=std::make_unique<SilentSoundManager>/,
    /mMusicVolume=0/, /mSfxVolume=0/, /mMusicDisabled=true/]) assert.match(harness, expression);
  assert(!/SDL_Init(?:SubSystem)?\([^)]*SDL_INIT_AUDIO/.test(harness), 'The native test hardware never opens audio');
  const runner = Buffer.from(await read('tests/test-scrap-yard.py')).toString();
  assert.match(runner, /env\['SDL_AUDIODRIVER'\]='dummy'/);
}

export async function verifyScrapYard({report, read, sha, engine, fullRunReport,
  productionBuildBytes, currentArtBytes, previousArtBytes}) {
  assert.equal(engine.id, CURRENT_ENGINE_ID);
  fields(report, {status: 'PASS', execution: 'complete-production-engine', optimization: 'O2', failures: 0,
    exitCode: 0, productionObjectCount: CURRENT_OBJECT_COUNT});
  assert(!Object.hasOwn(report, 'basePrefixReuse'), 'Scrap native cases must execute freshly');
  assert.equal(Object.keys(report.sourceSha256).length, CURRENT_SOURCE_COUNT);
  assert.equal(Object.keys(report.productionObjectSha256).length, CURRENT_OBJECT_COUNT);
  assert.deepEqual(report.sourceSha256, fullRunReport.sourceSha256);
  assert.deepEqual(report.productionObjectSha256, fullRunReport.productionObjectSha256);
  for (const [name, pin] of Object.entries(report.sourceSha256)) {
    assert(name.startsWith('source/')); safeName(name); digest(pin);
    assert.equal(sha(await read(name)), pin, 'Scrap uses the complete current production source');
  }
  for (const pin of Object.values(report.productionObjectSha256)) digest(pin);
  assert.equal(report.productionBuildReceiptSha256, sha(productionBuildBytes));
  fields(JSON.parse(productionBuildBytes), {status: 'PASS', exitCode: 0,
    sourceUnchangedDuringBuild: true, sourceFiles: CURRENT_SOURCE_COUNT});
  const buildBytes = await read('tests/scrap-yard-build.json'), build = JSON.parse(buildBytes);
  for (const field of ['execution', 'optimization', 'productionObjectCount', 'productionBuildReceiptSha256',
    'generatedHarnessSha256', 'policySha256', 'controlSha256', 'legacyControlSha256', 'builderSha256',
    'testArtifactSha256', 'sourceSha256', 'productionObjectSha256'])
    assert.deepEqual(report[field], build[field], 'Actual Scrap report binds its linked backend: ' + field);
  assert.deepEqual(Object.keys(report.testArtifactSha256).sort(), ['scrap-yard-engine.js', 'scrap-yard-engine.wasm']);
  for (const [name, pin] of Object.entries(report.testArtifactSha256)) {
    digest(pin); assert.equal(sha(await read('tests/' + name)), pin, 'Actual executed Scrap backend bytes');
  }
  assert(WebAssembly.validate(await read('tests/scrap-yard-engine.wasm')));
  for (const [name, field] of [['scrap-yard-harness.cpp', 'generatedHarnessSha256'], ['scrap-yard-policy.h', 'policySha256'],
    ['scrap-yard-controls.h', 'controlSha256'], ['scrap-yard-legacy-controls.h', 'legacyControlSha256'], ['build-scrap-yard.py', 'builderSha256'],
    ['test-scrap-yard.py', 'runnerSha256'], ['scrap-yard-assets.json', 'assetFixtureSha256']])
    assert.equal(sha(await read('tests/' + name)), report[field], 'Exact Scrap test input: ' + name);
  assert.equal(typeof finalContractPin, 'string', 'The complete18-case O2 matrix must pass before the final contract is pinned');
  digest(finalContractPin);
  const contractBytes = await read('tests/scrap-yard-verification-contract.json');
  assert.equal(sha(contractBytes), finalContractPin);
  assert.equal(report.verificationContractSha256, finalContractPin);
  const contract = JSON.parse(contractBytes);
  fields(contract, {schemaVersion: 1, engineId: SCRAP_ENGINE_ID, mode: 88, profileIndex: 87,
    rulesVersion: 1, startingSun: 800, historicalPreTuningStartingSun: 200,
    sourceCount: 856, productionObjectCount: 136,
    preTuningPlanSha256: preTuningPlanPin, nativeArtInputs: 866, nativeArtFixtureSha256: nativeArtPin});
  fields(report, {engineId: CURRENT_ENGINE_ID, mode: 88, profileIndex: 87, rulesVersion: 1, startingSun: 800});
  const retained = await verifyRetainedParentInputs({read, sha});
  const adapterBytes = await read('tests/torch1-scrap-retention.json');
  assert.equal(sha(adapterBytes), CURRENT_SCRAP_RETENTION_SHA256,
    'Independently pinned current execution envelope for the unchanged Scrap cases');
  assert.equal(report.retentionAdapterSha256, CURRENT_SCRAP_RETENTION_SHA256);
  const adapter = JSON.parse(adapterBytes);
  fields(adapter, {schemaVersion: 1, parentEngineId: AMBUSH_ENGINE_ID, engineId: CURRENT_ENGINE_ID,
    parentArchiveSha256: AMBUSH_ARCHIVE_SHA256, historicalContractSha256: finalContractPin,
    sourceCount: CURRENT_SOURCE_COUNT, productionObjectCount: CURRENT_OBJECT_COUNT, all18CasesFresh: true});
  const ambushRetained=await verifyTorchRetainedParentInputs({read,sha});
  const oldAdapterBytes=await read('tests/ambush1-scrap-retention.json');
  assert.equal(sha(oldAdapterBytes),AMBUSH_SCRAP_RETENTION_SHA256);
  assert.equal(adapter.publishedAmbushAdapterSha256,AMBUSH_SCRAP_RETENTION_SHA256);
  assert.equal(ambushRetained.files['ambush1-scrap-retention.json'].sha256,AMBUSH_SCRAP_RETENTION_SHA256);
  const oldAdapter=JSON.parse(oldAdapterBytes);
  fields(oldAdapter,{schemaVersion:1,parentEngineId:SCRAP_ENGINE_ID,engineId:AMBUSH_ENGINE_ID,
    parentArchiveSha256:SCRAP_ARCHIVE_SHA256,historicalContractSha256:finalContractPin,
    sourceCount:860,productionObjectCount:138,all18CasesFresh:true});
  assert.equal(oldAdapter.fixtureOverrides['tests/test-scrap-yard.py'],ambushRetained.files['test-scrap-yard.py'].sha256);
  assert.deepEqual(Object.keys(adapter.fixtureOverrides), ['tests/test-scrap-yard.py'],
    'Only the current Scrap Python execution envelope overlays the immutable contract');
  assert.equal(retained.files['scrap-yard-verification-contract.json'].sha256, finalContractPin);
  const historicalRunner = await read('tests/ambush1-retained-parent/test-scrap-yard.py');
  assert.equal(sha(historicalRunner), retained.files['test-scrap-yard.py'].sha256);
  assert.equal(sha(historicalRunner), contract.fixtureSha256['tests/test-scrap-yard.py'],
    'The original runner and all of its assertions retain their published contract pin');
  assert.deepEqual(contract.matrix, matrix);
  assert.deepEqual(contract.startingPlants, startingPlants);
  fields(contract.formationObservation, {nativeOpeningTicks: 1800, nativeFormationGapTicks: 3500,
    postUpdateFramesSamplingLagMaxBySpeed: {'1': 0, '2': 1}, requireSameLagForEveryObservedFormation: true});
  fields(contract.completionInputRace, {abortPendingPlacementOnlyWhenActualNativeAward: true,
    requiredTerminalState: 131, requiredSpawnedFormations: 6, requiredLiveEnemies: 0, exactPriceCooldownAssertionsRetained: true});
  for (const name of ['scrap-yard-pre-tuning-plan.json', 'scrap-yard-balance-revisions.json', 'scrap-yard-native-art-inputs.json', 'scrap-yard-harness.cpp', 'scrap-yard-policy.h',
    'scrap-yard-controls.h', 'scrap-yard-legacy-controls.h', ...Object.keys(legacyPins),
    'build-scrap-yard.py', 'test-scrap-yard.py', 'scrap-yard-assets.json', 'test-pool-panic.py', 'pool-panic-assets.json'])
    assert(Object.hasOwn(contract.fixtureSha256, 'tests/' + name), 'The final contract independently pins every executed test input: ' + name);
  assert.equal(Object.keys(contract.fixtureSha256).length, 14);
  for (const [name, pin] of Object.entries(contract.fixtureSha256)) {
    safeName(name); assert(name.startsWith('tests/')); digest(pin);
    const currentPin = Object.hasOwn(adapter.fixtureOverrides, name) ? adapter.fixtureOverrides[name] : pin;
    digest(currentPin);
    assert.equal(sha(await read(name)), currentPin, 'Frozen Scrap input or its separately authenticated execution envelope: ' + name);
  }
  fields(contract.acceptance, {naturalWinCases: 12, noActionNativeLossCases: 4, isolatedControlCases: 2,
    nativeFormations: 6, nativeAuthoredZombies: 38, normalMinimumMowers: 2, savedMinimumMowers: 1,
    nativeTickBudget: 45000, sunPerCommittedPull: 50, nativeCoinsPerPull: 2,
    formationIntervalsNativeTicks: 3500, policyIntervalNativeTicks: 150, plantInputLatencyNativeTicks: 25,
    missOneMiddleDecision: true, syntheticCasesCountedAsEarnedWins: false,
    checks: '856 + sum of all18 actual native case check counters'});
  fields(contract.legacyProvenance, {publishedArchive: 'pvz-portable-0.2.6-web-endless.3-source.zip',
    publishedArchiveBytes: 44423471, publishedArchiveSha256: ENDLESS3_ARCHIVE_SHA256,
    profileEntry: 'endless3-candidate/tests/endless3-earned-checkpoints/late-earned-1x-1729/earned-flag-8-profile.dat',
    saveEntry: 'endless3-candidate/tests/endless3-earned-checkpoints/late-earned-1x-1729/earned-flag-8.v4',
    fixtureKind: 'actual published native earned flag8 profile/save; not synthetic'});
  const historyEngine = historicalEngine(engine, ENDLESS3_ENGINE_ID);
  assert.equal(historyEngine.id, ENDLESS3_ENGINE_ID);
  assert.equal(historyEngine.artifacts.sourceSha256, ENDLESS3_ARCHIVE_SHA256);
  assert.equal(historicalEngine(engine, SCRAP_ENGINE_ID).artifacts.sourceSha256, SCRAP_ARCHIVE_SHA256);
  for (const [name, pin] of Object.entries(legacyPins)) {
    const bytes = Buffer.from(await read('tests/' + name));
    assert.equal(bytes.length, pin.bytes); assert.equal(sha(bytes), pin.sha256);
    assert.equal(contract.fixtureSha256['tests/' + name], pin.sha256, 'Final contract retains actual published .3 native input bytes');
    if (name.endsWith('.dat')) {
      assert.equal(bytes.readUInt32LE(0), 12);
      assert.equal(bytes.readUInt32LE(16 + 86 * 4), 8);
      assert.equal(bytes.readUInt32LE(16 + 87 * 4), 0, 'The real legacy profile has no credit in the newly appended record87');
    }
  }
  const planBytes = await read('tests/scrap-yard-pre-tuning-plan.json');
  assert.equal(sha(planBytes), preTuningPlanPin);
  const plan = JSON.parse(planBytes);
  fields(JSON.parse(await read('tests/scrap-yard-balance-revisions.json')), {schemaVersion: 1, preTuningPlanUnchanged: true});
  fields(plan, {totalCases: 18, normalMinimumMowers: 2, savedMinimumMowers: 1, nativeTickBudget: 45000,
    nativeFormations: 6, nativeAuthoredZombies: 38, startingSun: 200, sunPerCommittedPull: 50,
    nativeCoinsPerPull: 2, policyIntervalTicks: 150, mouseLatencyTicks: 25,
    deliberatelyMissedMiddleDecision: true, allProgressMustBeNative: true,
    noPostStartHPActorStageRNGChanges: true, idleMustGenuinelyLose: true,
    normalAwardOnlyAfterAllSixAndLastEnemy: true, saveAndContinueMustPreserveNativeMetalItemsAndLooseSun: true,
    legacyProfileRecords0Through86BytePreservedAnd87Zero: true});
  const assets = JSON.parse(await read('tests/scrap-yard-assets.json'));
  assert.equal(assets.assetBundleId, engine.assetBundleId);
  assert.equal(report.assetBundleId, engine.assetBundleId);
  assert.deepEqual(assets.files['main.pak'], {bytes: 45453180,
    sha256: '5878326408285cb01f83b4fa4edcc66d65e727f6d6ee88563b5b3b287dd259fc'});
  const artBytes = await read('tests/scrap-yard-native-art-inputs.json'), art = JSON.parse(artBytes);
  assert.equal(sha(artBytes), nativeArtPin);
  assert.equal(report.nativeArtFixtureSha256, nativeArtPin);
  assert.equal(contract.fixtureSha256['tests/scrap-yard-native-art-inputs.json'], nativeArtPin);
  assert.equal(report.nativeArtInputs, 866); assert.equal(contract.nativeArtInputs, 866);
  assert.equal(Object.keys(art.sourceInputs).length, 866);
  fields(art, {assetBundleId: engine.assetBundleId,
    mainPakSha256: '5878326408285cb01f83b4fa4edcc66d65e727f6d6ee88563b5b3b287dd259fc'});
  for (const [name, pin] of Object.entries(art.sourceInputs)) { safeName(name); integer(pin.bytes, 1); digest(pin.sha256); }
  for (const name of ['compiled/reanim/Magnetshroom.reanim.compiled', 'reanim/Magnetshroom.reanim',
    'reanim/Magnetshroom_head1.png', 'reanim/Magnetshroom_stem.png', 'reanim/Zombie_bucket1.png',
    'reanim/Zombie_ladder_1.png', 'images/background2.jpg', 'compiled/reanim/Sun.reanim.compiled'])
    assert(Object.hasOwn(art.sourceInputs, name), 'Exact native Magnet, metal, night and sun artwork is authenticated: ' + name);
  const originalArtBytes = await read('tests/endless3-native-art-inputs.json');
  assert.equal(sha(originalArtBytes), '292841afb14e16416ea5cbd4b3749fd6ec7faa858cafb3612fe47b22d3fe79d8');
  const originalArt = JSON.parse(originalArtBytes);
  assert.equal(Object.keys(originalArt.sourceInputs).length, 746);
  for (const [name, pin] of Object.entries(originalArt.sourceInputs)) assert.deepEqual(art.sourceInputs[name], pin,
    'Every independently accepted original native artwork input remains exact: ' + name);
  assert.equal(report.scenarios.length, 18);
  assert.deepEqual(report.scenarios.map(key).sort(), matrix.map(([name, speed, seed]) => key({name, speed, seed})).sort());
  for (const row of report.scenarios) {
    verifyScrapScenario(row);
    await verifyScrapCaseLog(row, {read, sha});
  }
  assert.equal(report.scenarios.filter(row => row.outcome === 'win').length, 12);
  assert.equal(report.scenarios.filter(row => row.outcome === 'native-loss').length, 4);
  assert.equal(report.scenarios.filter(row => row.outcome === 'controls-pass').length, 2);
  assert.equal(report.checks, CURRENT_SOURCE_COUNT + report.scenarios.reduce((sum, row) => sum + row.checks, 0));
  await verifySourceBounds({read});
  assert.equal(sha(previousArtBytes), previousArtPin);
  const currentArt = JSON.parse(currentArtBytes), previousArt = JSON.parse(previousArtBytes);
  const publishedArtBytes = fs.readFileSync(new URL('./fixtures/scrap1-native-bonus-art.json', import.meta.url));
  assert.equal(sha(publishedArtBytes), publishedScrapArtPin);
  const publishedArt = JSON.parse(publishedArtBytes);
  assert.equal(publishedArt.cards.length, 16);
  assert.deepEqual({...publishedArt, cards: publishedArt.cards.slice(0, 15)}, previousArt);
  assert.equal(currentArt.cards.length, 18);
  assert.deepEqual({...currentArt, cards: currentArt.cards.slice(0, 16)}, publishedArt,
    'Every published card, including Scrap Yard, retains its exact original metadata');
  fields(publishedArt.cards[15], {mode: 88, name: 'Scrap Yard', generatedArtworkUsed: false, background: 'IMAGE_BACKGROUND2'});
  return {cases: 18, wins: 12, nativeLosses: 4, syntheticControls: 2, checks: report.checks};
}
