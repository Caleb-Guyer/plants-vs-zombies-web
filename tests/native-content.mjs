// SPDX-License-Identifier: MIT
// Verify published production source/test coherence, then rerun retained native
// tests and complete production-engine Care scenarios on the deployment runner.
// The full engine runs headlessly with audio output disabled.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {inflateSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const vendor = {exports: {}};
new Function('module', 'exports', 'require', fs.readFileSync(new URL('vendor/jszip.min.js', dist), 'utf8'))(vendor, vendor.exports, require);
const JSZip = vendor.exports;
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const engine = JSON.parse(fs.readFileSync(new URL('game/engine-provenance.json', dist)));
assert.equal(engine.id, '0.2.6-web-rally.3');
const currentSourceBytes = fs.readFileSync(new URL(engine.artifacts.source, new URL('game/engine-provenance.json', dist)));
assert.equal(sha(currentSourceBytes), engine.artifacts.sourceSha256, 'Current source archive matches the engine provenance pin');
const current = await JSZip.loadAsync(currentSourceBytes, {checkCRC32: true});
const parentSourceBytes = fs.readFileSync(new URL('source/pvz-portable-0.2.6-web-rally.2-source.zip', dist));
assert.equal(sha(parentSourceBytes), '8d7c3d5a54bdebb57d36cd1b8a6d33f87ca68e7c0b39c905838f1a83173f8b82', 'Parent is the exact published Rally.2 source');
const parent = await JSZip.loadAsync(parentSourceBytes, {checkCRC32: true});
const prefix = 'rally3-candidate/';
const read = async name => {
  const entry = current.file(prefix + name);
  assert(entry, 'Missing current production source/test: ' + name);
  return Buffer.from(await entry.async('uint8array'));
};
const retainedChecks = {'game-speed':66, 'qol-controls':90, 'decks-cooldowns':274,
  'bonus-challenge':387, 'bonus-completion':1272, 'night-shift':231, 'lantern-shroom':548,
  'garden-shuffle':214, 'seed-swap':587, 'mender-bloom':523, 'intensive-care':1135, 'native-layout':7947};
const suites = [...Object.keys(retainedChecks), 'care-fatigue', 'care-full-run', 'chain-reaction', 'rally-zombie'];
const reports = new Map();
let checks = 0;
for (const name of suites) {
  const result = JSON.parse(await read('tests/' + name + '-results.json'));
  assert.match(result.status, /^PASS/);
  assert(result.checks > 0);
  assert.equal(result.failures, 0);
  assert.equal(result.exitCode, 0);
  assert.equal(sha(await read('tests/' + name + '-harness.cpp')), result.generatedHarnessSha256);
  assert(Object.keys(result.sourceSha256).length > 0);
  for (const [source, expected] of Object.entries(result.sourceSha256)) {
    assert.equal(sha(await read(source)), expected, 'Focused result must match current production source');
  }
  checks += result.checks;
  reports.set(name, result);
}
for (const [name, count] of Object.entries(retainedChecks))
  assert.equal(reports.get(name).checks, count, 'Every retained suite keeps its old assertions and reviewed appended coverage: ' + name);
// Original 11,940 checks remain, plus one appended table iteration, 315 native
// layout checks, ten authoring controls and 115 actual Options restart checks.
assert.equal(Object.values(retainedChecks).reduce((sum, count) => sum + count, 0), 13274);
assert.equal(reports.get('care-fatigue').checks, 25042,
  'Fatigue rig coverage retains every crew pose, scoped state and restoration check');
const fullRunReport = reports.get('care-full-run');
assert.equal(fullRunReport.checks, Object.keys(fullRunReport.sourceSha256).length + 152, 'Complete-engine provenance and required native scenario checks are retained');
assert.equal(fullRunReport.execution, 'complete-production-engine',
  'Care scenarios execute the complete linked engine, not an extracted combat model');
assert(Number.isInteger(fullRunReport.productionObjectCount) && fullRunReport.productionObjectCount >= 100,
  'The full-run backend links the complete production object graph');
assert.equal(Object.keys(fullRunReport.sourceSha256).length, 824,
  'Complete engine scenarios pin every production source input, not an extracted combat model');
const fullRunArtifactNames = ['care-full-run-engine.js', 'care-full-run-engine.wasm'];
assert.deepEqual(Object.keys(fullRunReport.testArtifactSha256).sort(), [...fullRunArtifactNames].sort());
for (const name of fullRunArtifactNames)
  assert.equal(sha(await read('tests/' + name)), fullRunReport.testArtifactSha256[name],
    'The executable full-engine test artifact matches its executed report: ' + name);
assert(WebAssembly.validate(await read('tests/care-full-run-engine.wasm')),
  'The packaged full-engine test WASM is valid');
assert.equal(sha(await read('tests/build-care-full-run.py')), fullRunReport.builderSha256,
  'Full-engine report pins its reproducible build recipe');
assert.equal(sha(await read('tests/test-care-full-run.py')), fullRunReport.runnerSha256,
  'Full-engine report pins its executing scenario runner');
const fullRunProductionBuildBytes = await read('logs/build-result.json');
assert.equal(sha(fullRunProductionBuildBytes), fullRunReport.productionBuildReceiptSha256,
  'Full-engine artifacts bind the exact passing production build receipt');
const fullRunProductionBuild = JSON.parse(fullRunProductionBuildBytes);
assert.equal(fullRunProductionBuild.exitCode, 0);
assert.equal(fullRunProductionBuild.sourceUnchangedDuringBuild, true);
const fullRunBuild = JSON.parse(await read('tests/care-full-run-build.json'));
for (const name of ['execution', 'productionObjectCount', 'productionBuildReceiptSha256',
  'generatedHarnessSha256', 'builderSha256', 'testArtifactSha256', 'sourceSha256'])
  assert.deepEqual(fullRunReport[name], fullRunBuild[name], 'Executed full-run report binds its build metadata: ' + name);
assert.equal(sha(await read('tests/care-full-run-assets.json')), fullRunReport.assetFixtureSha256);
assert.equal(fullRunReport.assetBundleId, engine.assetBundleId);
assert.equal(JSON.parse(await read('tests/care-full-run-assets.json')).assetBundleId, engine.assetBundleId);
const battleNames = ['normal', 'late-recovery', 'save-continue', 'no-care'];
const scenarioKey = result => `${result.name}/${result.speed}/${result.seed}`;
const expectedCases = [1729, 7331].flatMap(seed => battleNames.flatMap(name => [1, 2]
  .map(speed => scenarioKey({name, speed, seed}))));
expectedCases.push(...[1, 2].map(speed => scenarioKey({name:'legacy-checkpoint', speed, seed:1729})));
assert.equal(fullRunReport.scenarios.length, 18, 'Sixteen actual battles plus two separately labeled migration checks');
assert.deepEqual(fullRunReport.scenarios.map(scenarioKey).sort(), expectedCases.sort(),
  'Both RNG seeds, both native speeds and every required policy/checkpoint are executed exactly once');
for (const result of fullRunReport.scenarios) {
  assert.equal(result.execution, 'complete-production-engine');
  assert.equal(result.resourceCapacityWarnings, 0, 'Native emitter/particle capacity must never overflow');
  assert.match(result.logSha256, /^[a-f0-9]{64}$/);
  if (result.name === 'legacy-checkpoint') {
    assert.equal(result.outcome, 'migration-pass');
    assert.deepEqual(result.checkpoint, {performed:true, legacySystemsRetired:24,
      finiteClockPreserved:37, attachedControlUnchanged:true, otherEffectUnchanged:true});
    assert.equal(result.simulationTicks, undefined, 'Synthetic migration fixture never claims a full battle');
    continue;
  }
  assert(Number.isInteger(result.simulationTicks) && result.simulationTicks > 0);
  assert(result.maxProjectiles > 0, 'Every battle exercises actual native projectiles');
  assert.equal(result.profileIndex, 77);
  if (result.name === 'no-care') {
    assert.equal(result.outcome, 'loss', 'No-care negative control reaches actual native defeat');
    assert.equal(result.profileWinRecorded, false);
    assert.equal(result.awardCollected, false);
    assert.equal(result.moves, 0);
    assert.equal(result.admissions, 0);
  } else {
    assert.equal(result.outcome, 'win');
    assert.equal(result.waves, 10);
    assert.equal(result.nativeZombiesSeen, 40);
    assert.equal(result.profileWinRecorded, true);
    assert.equal(result.awardCollected, true);
    assert(result.moves > 0 && result.admissions > 0, 'Winning policy uses actual glove and conveyor input');
    assert(result.settledEmitters >= 0 && result.settledEmitters < 128,
      'Finite healing particles settle after combat');
  }
  if (result.name === 'late-recovery') assert(result.exhaustedPlantObservations > 0,
    'Mistake policy genuinely exhausts a fighter before recovering');
  if (result.name === 'save-continue') {
    assert.equal(result.checkpoint.performed, true);
    assert.equal(result.checkpoint.combatGraphPreserved, true);
    for (const field of ['tick', 'plants', 'zombies', 'projectiles']) assert(result.checkpoint[field] > 0,
      'Native save/Continue occurs with an active complete combat graph: ' + field);
  } else assert.equal(result.checkpoint.performed, false);
}
assert.equal(fullRunReport.speedParity.length, 6);
assert.deepEqual(fullRunReport.speedParity.map(result => `${result.name}/${result.seed}`).sort(),
  [1729, 7331].flatMap(seed => ['normal', 'late-recovery', 'no-care'].map(name => `${name}/${seed}`)).sort());
for (const parity of fullRunReport.speedParity) {
  assert.equal(parity.sameSimulationOutcome, true);
  const cases = fullRunReport.scenarios.filter(result => result.name === parity.name && result.seed === parity.seed);
  assert.deepEqual(parity.comparedFields,
    ['simulationTicks', 'moves', 'admissions', 'waves', 'nativeZombiesSeen', 'outcome']);
  for (const field of parity.comparedFields) assert.deepEqual(cases[0][field], cases[1][field],
    'Native 1x/2x simulation outcomes match: ' + parity.name + '/' + field);
}
console.log('PASS 16 complete native Care battles (12 wins, 4 no-care defeats), 2 separate legacy-particle migration fixtures and native 1x/2x outcome parity.');
const chainReport = reports.get('chain-reaction');
assert.equal(chainReport.execution, 'complete-production-engine');
assert.equal(chainReport.optimization, 'O2', 'Development probes cannot stand in for a final puzzle matrix');
assert.equal(chainReport.productionObjectCount, fullRunReport.productionObjectCount);
assert.deepEqual(chainReport.sourceSha256, fullRunReport.sourceSha256);
assert.deepEqual(chainReport.productionObjectSha256, fullRunReport.productionObjectSha256,
  'Both full-engine drivers link the exact same unchanged production objects');
assert.equal(chainReport.productionBuildReceiptSha256, sha(fullRunProductionBuildBytes));
for (const [filename, pin] of Object.entries(chainReport.testArtifactSha256))
  assert.equal(sha(await read('tests/' + filename)), pin, 'Exact executed puzzle artifact: ' + filename);
assert.deepEqual(Object.keys(chainReport.testArtifactSha256).sort(), ['chain-reaction-engine.js', 'chain-reaction-engine.wasm']);
assert(WebAssembly.validate(await read('tests/chain-reaction-engine.wasm')));
assert.equal(sha(await read('tests/build-chain-reaction.py')), chainReport.builderSha256);
assert.equal(sha(await read('tests/test-chain-reaction.py')), chainReport.runnerSha256);
const chainBuild = JSON.parse(await read('tests/chain-reaction-build.json'));
for (const field of ['execution', 'optimization', 'productionObjectCount', 'productionBuildReceiptSha256',
  'generatedHarnessSha256', 'builderSha256', 'testArtifactSha256', 'sourceSha256', 'productionObjectSha256'])
  assert.deepEqual(chainReport[field], chainBuild[field], 'Puzzle results bind current build metadata: ' + field);
assert.equal(sha(await read('tests/chain-reaction-assets.json')), chainReport.assetFixtureSha256);
assert.equal(chainReport.assetBundleId, engine.assetBundleId);
assert.equal(JSON.parse(await read('tests/chain-reaction-assets.json')).assetBundleId, engine.assetBundleId);
const chainNames = ['solution', 'save-planning', 'save-resolution', 'save-transition', 'retry-misplaced', 'retry-unused'];
const chainCases = [1729, 7331].flatMap(seed => chainNames.flatMap(name => [1, 2].map(speed => scenarioKey({name, speed, seed}))));
assert.equal(chainReport.scenarios.length, 24);
assert.deepEqual(chainReport.scenarios.map(scenarioKey).sort(), chainCases.sort());
for (const result of chainReport.scenarios) {
  assert.equal(result.execution, 'complete-production-engine');
  assert.equal(result.outcome, 'win');
  assert.equal(result.boardsSolved, 5);
  assert.equal(result.nativeZombies, 26);
  assert.equal(result.toolbarSafeZombies, 26, 'Every actual authored zombie stays below the conveyor row');
  assert.equal(result.legalPlacements, 9);
  assert.equal(result.profileIndex, 78);
  assert.equal(result.profileCredits, 1);
  assert.equal(result.awardCollected, true);
  assert.equal(result.planningHeld, true);
  assert.equal(result.invalidPlacementRejected, true);
  assert.equal(result.failureAndRetry, result.name.startsWith('retry-'));
  assert.equal(result.bonusBackNavigation, result.name === 'retry-unused');
  assert.equal(result.resourceCapacityWarnings, 0);
  assert.match(result.logSha256, /^[a-f0-9]{64}$/);
  assert(result.checks > 0);
  assert.equal(result.stageSimulationTicks.length, 5);
  assert(result.stageSimulationTicks.every(ticks => Number.isInteger(ticks) && ticks > 0));
  assert.equal(result.checkpoint.performed, result.name.startsWith('save-'));
  if (result.name.startsWith('save-')) {
    assert.equal(result.checkpoint.combatGraphPreserved, true);
    const field = result.name === 'save-planning' ? 'planningTick' : result.name === 'save-resolution' ? 'resolutionTick' : 'transitionTick';
    assert(result.checkpoint[field] > 0, 'Checkpoint occurs in the requested live native phase: ' + field);
  }
}
assert.equal(chainReport.speedParity.length, 12);
assert.deepEqual(chainReport.speedParity.map(result => `${result.name}/${result.seed}`).sort(),
  [1729, 7331].flatMap(seed => chainNames.map(name => `${name}/${seed}`)).sort());
for (const parity of chainReport.speedParity) {
  assert.equal(parity.sameNativeOutcome, true);
  assert.deepEqual(parity.comparedFields, ['outcome','boardsSolved','nativeZombies','toolbarSafeZombies','legalPlacements',
    'profileIndex','profileCredits','awardCollected','planningHeld','invalidPlacementRejected','failureAndRetry','bonusBackNavigation']);
  const pair = chainReport.scenarios.filter(result => result.name === parity.name && result.seed === parity.seed);
  for (const field of parity.comparedFields) assert.deepEqual(pair[0][field], pair[1][field]);
}
assert.equal(chainReport.checks, Object.keys(chainReport.sourceSha256).length +
  chainReport.scenarios.reduce((sum, result) => sum + result.checks, 0) + chainReport.speedParity.length);
console.log('PASS 24 complete native five-board Chain Reaction runs, save/Continue in three phases, genuine failed-plan retries, final-only credit and 1x/2x outcomes.');
const rallyReport=reports.get('rally-zombie');
assert.equal(rallyReport.execution,'complete-production-engine');
assert.equal(rallyReport.optimization,'O2');
assert.equal(rallyReport.productionObjectCount,fullRunReport.productionObjectCount);
assert.deepEqual(rallyReport.sourceSha256,fullRunReport.sourceSha256);
assert.deepEqual(rallyReport.productionObjectSha256,fullRunReport.productionObjectSha256);
assert.equal(rallyReport.productionBuildReceiptSha256,sha(fullRunProductionBuildBytes));
assert.deepEqual(Object.keys(rallyReport.testArtifactSha256).sort(),['rally-zombie-engine.js','rally-zombie-engine.wasm']);
for(const [filename,pin] of Object.entries(rallyReport.testArtifactSha256))
  assert.equal(sha(await read('tests/'+filename)),pin,'Executed Rally artifact: '+filename);
assert(WebAssembly.validate(await read('tests/rally-zombie-engine.wasm')));
assert.equal(sha(await read('tests/build-rally-zombie.py')),rallyReport.builderSha256);
assert.equal(sha(await read('tests/test-rally-zombie.py')),rallyReport.runnerSha256);
assert.equal(sha(await read('tests/rally-zombie-assets.json')),rallyReport.assetFixtureSha256);
assert.equal(rallyReport.assetBundleId,engine.assetBundleId);
const rallyBuild=JSON.parse(await read('tests/rally-zombie-build.json'));
for(const field of ['execution','optimization','productionObjectCount','productionBuildReceiptSha256',
 'generatedHarnessSha256','builderSha256','testArtifactSha256','sourceSha256','productionObjectSha256'])
  assert.deepEqual(rallyReport[field],rallyBuild[field],'Rally current production build: '+field);
const rallyNames=['normal','save-continue','retry-no-defense','no-defense','mechanics'];
const rallyCases=[1729,7331].flatMap(seed=>rallyNames.flatMap(name=>[1,2].map(speed=>scenarioKey({name,speed,seed}))));
assert.equal(rallyReport.scenarios.length,20);
assert.deepEqual(rallyReport.scenarios.map(scenarioKey).sort(),rallyCases.sort());
for(const result of rallyReport.scenarios) {
 assert.equal(result.execution,'complete-production-engine');
 assert.equal(result.resourceCapacityWarnings,0);
 assert.match(result.logSha256,/^[a-f0-9]{64}$/);
 assert(result.checks>0);
 if(result.name==='mechanics') {
  assert.equal(result.outcome,'controls-pass');
  assert.equal(result.syntheticActorControls,true);
  assert.equal(result.actualNativeWalking,true);
  assert.equal(result.armBlendComparisons,24);
  assert(result.legacyArmSnapRejections>0,'Legacy skipped-blend rendering must reproduce the native transition defect');
  assert.equal(result.constructorWavePatterns,4,'Native fresh-board counters are defined across recycled allocation patterns');
  assert.equal(result.gripPoseComparisons,52);
  assert.equal(result.gripNegativeControls,208);
  assert(result.gripMinNativeSkinPixels>=8,'Original closed-finger pixels must be visible in each held-object pose');
  assert(result.gripMinWristContactPixels>=2,'Held fist stays joined to the native sleeve');
  assert(result.gripMinHandleOcclusionPixels>=2,'The handle remains behind the fingers');
  assert.deepEqual(result.checkpoint,{performed:true,combatGraphPreserved:true});
  continue;
 }
 const won=result.name!=='no-defense';
 assert.equal(result.outcome,won?'win':'loss');
 assert(result.rallyObservations>0 && result.boostObservations>0 && result.maxProjectiles>0);
 assert.equal(result.profileIndex,79);
 assert.equal(result.profileCredits,won?1:0);
 assert.equal(result.awardCollected,won);
 assert.equal(result.failureAndRetry,result.name==='retry-no-defense');
 assert.equal(result.checkpoint.performed,result.name==='save-continue');
 if(won) {
  assert.equal(result.waves,10);assert.equal(result.nativeZombies,55);assert.equal(result.rallyZombies,13);
  assert(result.legalPlacements>0);
 }
 if(result.name==='save-continue') assert.equal(result.checkpoint.combatGraphPreserved,true);
}
assert.equal(rallyReport.speedParity.length,10);
assert.deepEqual(rallyReport.speedParity.map(r=>`${r.name}/${r.seed}`).sort(),
 [1729,7331].flatMap(seed=>rallyNames.map(name=>`${name}/${seed}`)).sort());
for(const parity of rallyReport.speedParity) {
 assert.equal(parity.sameNativeOutcome,true);
 const fields=parity.name==='mechanics'?['outcome']:['outcome','waves','nativeZombies','rallyZombies','profileIndex','profileCredits','awardCollected','failureAndRetry'];
 assert.deepEqual(parity.comparedFields,fields);
 const pair=rallyReport.scenarios.filter(r=>r.name===parity.name && r.seed===parity.seed);
 for(const field of fields) assert.deepEqual(pair[0][field],pair[1][field]);
}
assert.equal(rallyReport.checks,Object.keys(rallyReport.sourceSha256).length+
 rallyReport.scenarios.reduce((sum,r)=>sum+r.checks,0)+rallyReport.speedParity.length);
console.log('PASS twelve complete native Rally wins, four unattended gameovers, four separately labeled actor-control suites and ten native speed outcome pairs.');
const careBalance = reports.get('intensive-care').balanceModel;
assert.equal(careBalance.kind, 'native healing/fatigue capacity bound; not a battle clear');
assert(careBalance.allBedsHealHpPerSecond > careBalance.maximumCrewFatigueHpPerSecond);
assert(careBalance.slowestSuppliedRecoveryTicks < 3000);
assert.equal(careBalance.authoredEnemies, 40);
const parentPrefix = 'rally2-candidate/source/';
const parentBytes = async name => Buffer.from(await parent.file(parentPrefix + name).async('uint8array'));
const layoutReport = reports.get('native-layout');
assert.equal(layoutReport.hintLines, 1);
assert.equal(layoutReport.hintInkBottom, 576);
assert.equal(layoutReport.legacyHintLines, 2);
assert.equal(layoutReport.legacyHintInkBottom, 596);
assert.equal(layoutReport.legacyOverlapReproduced, true);
assert.equal(layoutReport.parentTranslationMutationRejected, true);
assert.equal(layoutReport.chainHintLines, 1);
assert.equal(layoutReport.chainHintInkBottom, 512);
assert.equal(layoutReport.chainHintOffsetMutationRejected, true);
assert.equal(layoutReport.chainCopiedButtonPlacementRejected, true);
assert.equal(layoutReport.chainHudSafeBoards, 5);
assert.equal(layoutReport.chainHudRejectedBoards, 5);
assert.equal(layoutReport.rallyAlmanacChecks, 760);
assert.equal(layoutReport.rallyAlmanacWindows, 27);
assert.equal(layoutReport.rallyNaiveCatalogMutationRejected, true);
const layoutFixtureBytes = await read('tests/native-layout-assets.json');
assert.equal(sha(layoutFixtureBytes), layoutReport.fixturesSha256['native-layout-assets.json'],
  'Layout report pins the exact original font/sprite and legacy-regression fixture');
const layoutFixture = JSON.parse(layoutFixtureBytes);
assert.equal(layoutFixture.schema, 1);
assert.equal(layoutFixture.assetBundleId, engine.assetBundleId);
assert.equal(layoutFixture.parentSourceSha256, '540f1ee365b558e10304995692485976e91f23bb1b28c305e6ade6cd17f1ed11',
  'The preserved layout negative-control fixture identifies its original Care.1 source');
const parentLayoutFixtureEntry = parent.file('rally2-candidate/tests/native-layout-assets.json');
assert(parentLayoutFixtureEntry, 'Authenticated Rally.2 parent retains the exact layout regression fixture');
assert.deepEqual(layoutFixtureBytes, Buffer.from(await parentLayoutFixtureEntry.async('uint8array')),
  'Historical Care.1 negative methods and native asset fixtures retain every authenticated Rally.2 fixture byte');
const approvedLayoutHashes = {
  'data/HouseofTerror28.txt':'08d9d6773edc9033512463b33be7c6604b675fadabd1729bb4fda4bed1966d0b',
  'data/HouseofTerror28.png':'e9913355ecccf2840761ce1a2a356067990deb44b326a7eb7d95c012126b9486',
  'images/ConveyorBelt.png':'b945135bd2a18f301f4c42c6d6724fbf797e087286948b987890c0e5a6724611',
  'images/ConveyorBelt_backdrop.png':'7ce8f28f45ba83afa463db197c3f7e9b8f81d14a875c4182988a9c5dd42c34a8',
  'images/SeedBank.png':'6313852cc2b66226a3f112f3077639a75b3714a4f6a6da9c2d4c45a4b55e7fdc',
  'images/ShovelBank.png':'b374366cb607966ab11329fddea3debf695eb60bb3f387b67d918b73748f09dd',
  'images/Zen_GardenGlove.png':'b9f95ce2542e2bee51bde3b5919406fbbaba853fff0c1cb0fe1b022e7b93c329',
  'data/HouseofTerror16.txt':'3435e4111074b4db16c7519ecc972a0786756aeaaeb756f368e4616494958b5c',
  'data/HouseofTerror16Outline.png':'0ab3397e7e60d5e6d07f9c387346c37ac0255a20e479e4d3b0826a0b458cefb1',
  'data/_HouseofTerror16.png':'9de6b80fb8d9f0405db21b0d5c6871a24cb68029f29c983c531e748147bc4cbe',
};
assert.deepEqual(Object.keys(layoutFixture.assets).sort(), Object.keys(approvedLayoutHashes).sort());
assert.deepEqual(layoutReport.nativeAssetSha256, approvedLayoutHashes);
for (const [name, expected] of Object.entries(approvedLayoutHashes)) {
  assert.equal(layoutFixture.assets[name].sha256, expected);
  assert.equal(sha(Buffer.from(layoutFixture.assets[name].base64, 'base64')), expected,
    'Layout measurements use the exact independently pinned native font/sprite: ' + name);
}
function extractLegacyFunction(text, signature) {
  text = text.replace(/\r\n?/g, '\n');
  const start = text.indexOf(signature), first = text.indexOf('{', start);
  assert(start >= 0 && first > start);
  let depth = 1, end = first + 1;
  while (depth) { assert(end < text.length); depth += (text[end] === '{') - (text[end] === '}'); end++; }
  return text.slice(start, end);
}
const parentLayoutFixture = JSON.parse(Buffer.from(await parentLayoutFixtureEntry.async('uint8array')));
const legacySignatures = ['Rect Board::GetShovelButtonRect()', 'void Board::DrawShovel(Graphics* g)',
  'void Board::DrawUITop(Graphics* g)', 'void MessageWidget::Draw(Graphics* g)'];
assert.deepEqual(Object.keys(layoutFixture.legacyMethods).sort(), [...legacySignatures].sort());
for (const signature of legacySignatures)
  assert.equal(layoutFixture.legacyMethods[signature], parentLayoutFixture.legacyMethods[signature],
    'Layout negative control retains its authenticated published Care.1 method: ' + signature);
assert.equal(layoutFixture.legacyHint, 'Use the glove to rotate tired plants through the Mender bed.');
assert.equal(layoutFixture.legacyHint, parentLayoutFixture.legacyHint,
  'Long-hint regression control retains its authenticated original published intro text');
console.log('PASS native layout uses exact original font/sprite bytes, real parent regression controls and missing-parent-origin mutation checks.');
// SeedPacket.h also defines the serialized SeedBank class.
for (const name of ['src/Lawn/SeedPacket.h', 'src/Lawn/Plant.h', 'src/Lawn/System/SaveGame.cpp', 'src/Lawn/System/PlayerInfo.h', 'src/Lawn/System/PlayerInfo.cpp', 'src/LawnApp.h', 'src/Lawn/System/ReanimationLawn.h']) {
  assert.deepEqual(await read('source/' + name), await parentBytes(name), 'Saved data layout/serialization must remain unchanged');
}
function boardData(bytes) {
  const text = bytes.toString().replace(/\r\n?/g, '\n');
  const start = text.indexOf('class Board : public');
  const end = text.indexOf('Board(LawnApp*', start);
  assert(start >= 0 && end > start);
  return text.slice(start, end);
}
assert.equal(boardData(await read('source/src/Lawn/Board.h')), boardData(await parentBytes('src/Lawn/Board.h')),
  'Board saved data members stay unchanged; the existing KeyUp method may gain an implementation');
function challengeData(bytes) {
  const text = bytes.toString().replace(/\r\n?/g, '\n');
  const start = text.indexOf('class Challenge\n{');
  const end = text.indexOf('\npublic:', text.indexOf('\npublic:', start) + 1);
  assert(start >= 0 && end > start);
  return text.slice(start, end);
}
assert.equal(challengeData(await read('source/src/Lawn/Challenge.h')), challengeData(await parentBytes('src/Lawn/Challenge.h')),
  'Challenge saved data members stay unchanged; care adds methods only');
const zombieData = bytes => {
  const text = bytes.toString().replace(/\r\n?/g, '\n');
  const start = text.indexOf('class Zombie : public');
  const end = text.indexOf('Zombie();', start);
  assert(start >= 0 && end > start);
  return text.slice(start, end);
};
assert.equal(zombieData(await read('source/src/Lawn/Zombie.h')), zombieData(await parentBytes('src/Lawn/Zombie.h')),
  'Saved Zombie actor data members remain unchanged');
console.log(`PASS ${checks} published native content/QoL checks match their production source; saved object layouts and serializer are preserved.`);

// New IDs append to the catalog. Every original serialized mode and challenge
// definition retains its identity, artwork, placement and display name.
function enumValues(text, name) {
  const match = text.match(new RegExp('enum ' + name + ' : int32_t\\s*\\{([\\s\\S]*?)\\};'));
  assert(match, 'Missing enum: ' + name);
  let next = 0;
  const values = new Map();
  for (const item of match[1].replace(/\/\/[^\n]*/g, '').split(',')) {
    const part = item.trim();
    if (!part) continue;
    const field = part.match(/^(\w+)(?:\s*=\s*(-?\d+))?$/);
    assert(field, 'Unexpected enum expression: ' + part);
    if (field[2] !== undefined) next = Number(field[2]);
    values.set(field[1], next++);
  }
  return values;
}
const oldEnums = (await parentBytes('src/ConstEnums.h')).toString();
const newEnums = (await read('source/src/ConstEnums.h')).toString();
const oldModes = enumValues(oldEnums, 'GameMode'), newModes = enumValues(newEnums, 'GameMode');
assert.equal(oldModes.get('NUM_GAME_MODES'), 81);
for (const [key, value] of oldModes) if (key !== 'NUM_GAME_MODES') assert.equal(newModes.get(key), value, 'Every existing mode ID remains stable: ' + key);
assert.equal(newModes.get('GAMEMODE_CHALLENGE_RALLY_POINT'), 80);
assert.equal(newModes.get('NUM_GAME_MODES'), 81);
assert.equal(newModes.size, oldModes.size);
assert.deepEqual([...enumValues(newEnums, 'ChallengePage')], [...enumValues(oldEnums, 'ChallengePage')],
  'Cold Front uses the existing Bonus page without changing any page IDs');
const oldZombieIds = enumValues(oldEnums, 'ZombieType'), newZombieIds = enumValues(newEnums, 'ZombieType');
for (const [key,value] of oldZombieIds) if (!['NUM_ZOMBIE_TYPES','ZOMBIE_CACHED_POLEVAULTER_WITH_POLE','NUM_CACHED_ZOMBIE_TYPES'].includes(key))
  assert.equal(newZombieIds.get(key), value, 'Every original gameplay zombie ID remains stable: '+key);
assert.equal(oldZombieIds.get('NUM_ZOMBIE_TYPES'),34);
assert.equal(newZombieIds.get('ZOMBIE_RALLY'),33);
assert.equal(newZombieIds.get('NUM_ZOMBIE_TYPES'),34);
assert.equal(newZombieIds.size,oldZombieIds.size);
function zombieDefinitions(text) {
  const table=text.slice(text.indexOf('gZombieDefs['));
  return [...table.slice(0,table.indexOf('};')).matchAll(/\{\s*\.mZombieType\s*=[^}]+\}/g)].map(m=>m[0].replace(/\s+/g,' ').trim());
}
const parentZombieDefs=zombieDefinitions((await parentBytes('src/Lawn/Zombie.cpp')).toString());
const currentZombieDefs=zombieDefinitions((await read('source/src/Lawn/Zombie.cpp')).toString());
assert.equal(parentZombieDefs.length,34);
assert.deepEqual(currentZombieDefs.slice(0,34),parentZombieDefs);
assert.equal(currentZombieDefs.length,34);
assert.match(currentZombieDefs.at(-1),/ZOMBIE_RALLY/);
assert.match(currentZombieDefs.at(-1),/mPickWeight = 0/);
const oldSeeds = enumValues(oldEnums, 'SeedType'), newSeeds = enumValues(newEnums, 'SeedType');
for (const [key, value] of oldSeeds) assert.equal(newSeeds.get(key), value, 'Every original and special seed ID stays stable: ' + key);
assert.equal(newSeeds.get('SEED_MENDERBLOOM'), 76);
assert.deepEqual([...newSeeds], [...oldSeeds], 'Animation and Almanac refinements preserve all native and custom seed IDs');
assert.equal(newSeeds.get('SEED_LANTERNSHROOM'), 75);
assert.equal(newSeeds.get('NUM_SEED_TYPES'), 53, 'Original plant cache capacity stays unchanged');
assert.equal(newSeeds.get('NUM_SEEDS_IN_CHOOSER'), 49, 'Original serialized chooser capacity stays unchanged; the custom entry uses a sparse UI mapping');
function plantDefinitions(text) {
  const table = text.slice(text.indexOf('gPlantDefs['));
  const end = table.indexOf('};');
  assert(end > 0);
  return [...table.slice(0, end).matchAll(/\{\s*\.mSeedType\s*=[^}]+\}/g)].map(match => match[0].replace(/\s+/g, ' ').trim());
}
const oldPlants = plantDefinitions((await parentBytes('src/Lawn/Plant.cpp')).toString());
const newPlants = plantDefinitions((await read('source/src/Lawn/Plant.cpp')).toString());
assert.equal(oldPlants.length, 53);
assert.deepEqual(newPlants, oldPlants, 'Every original plant definition remains unchanged; Chill-shroom uses its separate definition');
function definitions(text) {
  const table = text.slice(text.indexOf('gChallengeDefs['));
  const end = table.indexOf('};');
  assert(end > 0);
  return [...table.slice(0, end).matchAll(/\{\s*\.mChallengeMode\s*=[^}]+\}/g)].map(match => match[0].replace(/\s+/g, ' ').trim());
}
const oldDefinitions = definitions((await parentBytes('src/Lawn/Widget/ChallengeScreen.cpp')).toString());
const newDefinitions = definitions((await read('source/src/Lawn/Widget/ChallengeScreen.cpp')).toString());
assert.equal(oldDefinitions.length, 80);
assert.deepEqual(newDefinitions.slice(0, oldDefinitions.length), oldDefinitions, 'Every original and eight existing Bonus challenge definitions remain exact');
assert.equal(newDefinitions.length, oldDefinitions.length);
assert.match(newDefinitions.at(-1), /GAMEMODE_CHALLENGE_RALLY_POINT/);
assert.match(newDefinitions.at(-1), /Rally Point/);
assert.match(newDefinitions.at(-1), /CHALLENGE_PAGE_BONUS/);
assert.match(newDefinitions.at(-1), /\.mRow = 2/);
assert.match(newDefinitions.at(-1), /\.mCol = 2/);
console.log('PASS Rally maintenance preserves all modes and challenges while preserving every existing mode/seed ID, saved layout, plant and challenge identity.');

const artRecord = JSON.parse(fs.readFileSync(new URL('content/native-bonus-art.json', dist)));
assert.match(artRecord.sourceKind, /native sprite compositions/);
assert.equal(artRecord.generatedArtworkUsed, true, 'Generated artwork is scoped to the permitted plant sprite');
assert.equal(artRecord.standaloneChallengeIllustrations, false, 'Cards contain actual sprites, not separately generated illustrations');
assert.equal(artRecord.assetBundleId, engine.assetBundleId);
assert.equal(artRecord.plant.nativeReanimation, 'REANIM_ICESHROOM');
assert.equal(artRecord.plant.spriteOverride, 'chill-shroom/provenance.json');
assert.deepEqual(artRecord.canvas, {width: 80, height: 65, heroCenterX: 40, heroCenterY: 32.5, maxHeroWidth: 68, maxHeroHeight: 57});
assert.deepEqual(artRecord.cards.map(card => card.mode), [73, 74, 75, 76, 77, 78, 79, 80]);
assert.deepEqual(artRecord.cards.map(card => card.name), ['Cone Zone', 'Night Shift', 'Cold Front', 'Garden Shuffle', 'Seed Swap', 'Intensive Lawn Care', 'Chain Reaction', 'Rally Point']);

const parentArtBytes = await read('tests/rally2-parent-native-art.json');
assert.equal(sha(parentArtBytes), '59ae4b436d2a6a5422697561ef91167cd9298a02c4bb6edf9b47254229e2c9c2', 'Independent exact published Rally.2 card metadata fixture');
const parentArtRecord = JSON.parse(parentArtBytes);
assert.deepEqual(artRecord.cards.slice(0, 8), parentArtRecord.cards, 'Every existing card retains all original metadata');
for (const [key, value] of Object.entries(parentArtRecord))
  if (!['cards', 'checkpointCompatibility'].includes(key)) assert.deepEqual(artRecord[key], value, 'Existing art metadata remains unchanged: ' + key);
assert(artRecord.checkpointCompatibility.startsWith(parentArtRecord.checkpointCompatibility));
assert.equal(artRecord.cards.at(-1).mode, 80);
assert.equal(artRecord.animation.newGeneratedArtwork, false, 'Motion uses existing sprite/effect assets');
assert.equal(artRecord.animation.idlePeriodSeconds, 2.2);
assert.deepEqual(artRecord.animation.idleScaleX, [1, 1.045]);
assert.deepEqual(artRecord.animation.idleScaleY, [0.935, 1]);
assert.deepEqual(artRecord.animation.idleCapCompressionPixels, [0, 1.6]);
assert.deepEqual(artRecord.animation.idleBodyAngleRadians, [-0.07, 0.07]);
for (const [name, expected] of Object.entries({windupTicks: 40, recoilTicks: 30, frostEffectTicks: 100,
  frostTravelTicks: 55, targetRadiusPixels: 150})) assert.equal(artRecord.animation[name], expected);
assert.deepEqual(artRecord.animation.nativeFrostAssets, [
  {resource: 'IMAGE_SNOWPEA_PUFF', originalPath: 'particles/SnowPea_puff.png', sha256: '26e4fd3e388ddc1dfe5a1f7eddfdfc1fbd98850fc50716b57c7ceffce306d308'},
  {resource: 'IMAGE_SNOWFLAKES', originalPath: 'particles/SnowFlakes.png', sha256: '864e8dddb14dd8fcff235d22f5c0d5a9c925aa5cf856f5c855b9a8dbe23a1f03'},
], 'Frost provenance identifies the exact already-bundled original images');
const renderer = (await read('source/src/Lawn/System/LanternShroom.cpp')).toString();
assert(!/FrostShroomCap|BonusChallengeArt|DecodeBase64|png_image_|DecodeImage/.test(renderer), 'Current rendering cannot load the rejected generated artwork');
assert(renderer.includes('#include "ChillShroomArt.h"') && renderer.includes('BindParts(native)'),
  'Cold Front portraits render the same custom parts as the live plant');
for (const header of ['FrostShroomCap.h', 'BonusChallengeArt.h']) {
  assert.equal(current.file(prefix + 'source/src/Lawn/System/' + header), null, 'Generated artwork headers are absent from current source');
}
for (const name of ['chill-shroom-cap', 'cone-zone-card', 'night-shift-card', 'cold-front-card', 'lantern-shroom', 'lantern-shroom-cap']) {
  for (const suffix of ['.png', '.svg', '-art.json']) assert(!fs.existsSync(new URL('content/' + name + suffix, dist)), 'Rejected generated-art aliases stay absent: ' + name + suffix);
}

// Decode the actual exported PNGs independently of Pillow and the C++ artwork
// generator. PNG stores unassociated RGBA; the runtime header stores straight ARGB.
function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
  }
  return (value ^ 0xffffffff) >>> 0;
}
function decodeRgbaPng(bytes, allowRgb = false, maxDimension = 256) {
  assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  let offset = 8, width, height, channels = 4, ended = false;
  const compressed = [];
  while (offset < bytes.length) {
    assert(offset + 12 <= bytes.length, 'Complete PNG chunk header');
    const length = bytes.readUInt32BE(offset), end = offset + 12 + length;
    assert(end <= bytes.length, 'Complete PNG chunk payload');
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, end - 4);
    assert.equal(crc32(bytes.subarray(offset + 4, end - 4)), bytes.readUInt32BE(end - 4), 'PNG chunk CRC: ' + type);
    if (type === 'IHDR') {
      assert.equal(offset, 8, 'IHDR is the first and only header');
      assert.equal(length, 13);
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      assert(width > 0 && height > 0 && width <= maxDimension && height <= maxDimension);
      assert.equal(data[8], 8, 'Eight-bit PNG');
      assert(data[9] === 6 || (allowRgb && data[9] === 2), 'RGBA output or RGB/RGBA atlas PNG');
      assert.deepEqual([...data.subarray(10)], [0, 0, 0], 'Noninterlaced PNG');
      channels = data[9] === 2 ? 3 : 4;
    } else if (type === 'IDAT') {
      assert(width && height && !ended);
      compressed.push(data);
    } else if (type === 'IEND') {
      assert.equal(length, 0);
      assert(compressed.length > 0);
      assert.equal(end, bytes.length, 'No bytes follow the PNG end marker');
      ended = true;
    } else {
      assert(type.charCodeAt(0) & 32, 'No unknown critical PNG chunks');
    }
    offset = end;
  }
  assert(ended, 'PNG has an end marker');
  const stride = width * channels;
  const scanlines = inflateSync(Buffer.concat(compressed), {maxOutputLength: height * (stride + 1)});
  assert.equal(scanlines.length, height * (stride + 1));
  const samples = Buffer.alloc(width * height * channels);
  const paeth = (left, up, upperLeft) => {
    const prediction = left + up - upperLeft;
    const a = Math.abs(prediction - left), b = Math.abs(prediction - up), c = Math.abs(prediction - upperLeft);
    return a <= b && a <= c ? left : b <= c ? up : upperLeft;
  };
  for (let y = 0; y < height; y++) {
    const source = y * (stride + 1), target = y * stride, filter = scanlines[source];
    assert(filter <= 4, 'Supported PNG row filter');
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? samples[target + x - channels] : 0;
      const up = y ? samples[target + x - stride] : 0;
      const upperLeft = y && x >= channels ? samples[target + x - stride - channels] : 0;
      const prediction = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? up :
        filter === 3 ? Math.floor((left + up) / 2) : paeth(left, up, upperLeft);
      samples[target + x] = (scanlines[source + 1 + x] + prediction) & 255;
    }
  }
  if (channels === 4) return {width, height, rgba: samples};
  const rgba = Buffer.alloc(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel++) {
    samples.copy(rgba, pixel * 4, pixel * 3, pixel * 3 + 3);
    rgba[pixel * 4 + 3] = 255;
  }
  return {width, height, rgba};
}

const artworkUrl = new URL('content/chill-shroom/', dist);
const artwork = JSON.parse(fs.readFileSync(new URL('provenance.json', artworkUrl)));
assert.equal(artwork.schema, 2);
assert.equal(artwork.version, '0.2.6-web-mender.1', 'Unchanged artwork retains its original release provenance');
assert.equal(artwork.method, 'Approved silhouette with a painted finish and registered shared-canvas layers');
assert.equal(artwork.imageGenerationUsed, true);
assert.equal(artwork.standaloneChallengeIllustrations, false);
const headerBytes = await read('source/src/Lawn/System/ChillShroomArt.h');
const header = headerBytes.toString();
const extractionBytes = await read('source/artwork/chill-shroom/extraction.json');
const extraction = JSON.parse(extractionBytes);
const generationBytes = await read('source/artwork/chill-shroom/generation.json');
const generation = JSON.parse(generationBytes);
const generator = await read('source/artwork/chill-shroom/render.py');

// Independently derived from the user-approved master using Pillow 12.2.0:
// clear alpha <=8, crop [81,134,1232,1119], contain in 72x62, uniformly Lanczos
// resize, then composite at (6,10) on 80x80. Paint may change; this alpha pin and
// the exact pinned parent's cap/body masks keep shape and articulation fixed.
const approvedMasterSha = 'f861148f8c57bbee31595e8fd5692aa23c1282172ab0016a159adf406f2a373d';
const closedMasterSha = 'dd28dbc58d7e8f27bf05ed2dd1842b397de829d6c9b5ed5790e2465058e358e7';
const expectedCanonicalAlphaSha = '0b1b28aa8d5489fe16a29e90c42fd1fb478bfca59a8544c9496306d825383e8e';
const expectedApprovedRgbaSha = 'c00b7d93e79d2fb8f39ea2dbddd178e02d040ac1f4fd2e8bb62f105502317fb7';
const expectedParentRgbaSha = '4aed41439898a5f777b5ccefeb97c87a96bdd81f6b3b1ece0ac7541339378eae';
const expectedParentAlphaSha = {
  cap: 'f1192c2237b44d213838d4bb2d0fc0341281f35331c5b38a029ddf73d2380dfb',
  body: '500cd27bdd00b855b9da91af9964be82eb6a74d2ccba83406aa1d5433a3ae410',
  base: '56a43ef88ddfcd0f56f7dd973312c0e73d62f59655c01d7b4e59aaa3be8b3fb6',
};
const expectedCanonicalRgbaSha = '4aed41439898a5f777b5ccefeb97c87a96bdd81f6b3b1ece0ac7541339378eae';
const paintedMasterSha = 'd00130c39fdb094950074d57aed763784741bbf6c3067525c12155fef1debe86';
const paintedClosedMasterSha = '181a6dcbe55b8d23156135519bc0944da3d5dd214001fba4873420a9169f112a';
const paintedBaseSha = '50d006718af734a54c7aa414cc2e407ecb39b0bb264b9a78667ae0f624f39d4e';
const alphaBytes = rgba => Buffer.from(rgba.filter((value, index) => index % 4 === 3));
function packedRgba(text, name) {
  const symbol = name[0].toUpperCase() + name.slice(1);
  assert.equal(Number(text.match(new RegExp('k' + symbol + 'Width\\s*=\\s*(\\d+)'))?.[1]), 80);
  assert.equal(Number(text.match(new RegExp('k' + symbol + 'Height\\s*=\\s*(\\d+)'))?.[1]), 80);
  const array = text.match(new RegExp('k' + symbol + 'Argb\\[\\]\\s*=\\s*\\{([\\s\\S]*?)\\};'));
  assert(array, 'Packed runtime pixels: ' + name);
  const pixels = [...array[1].matchAll(/0x([0-9a-fA-F]{8})u/g)].map(match => Number.parseInt(match[1], 16));
  assert.equal(pixels.length, 80 * 80);
  const rgba = Buffer.alloc(80 * 80 * 4);
  pixels.forEach((pixel, index) => {
    rgba[index * 4] = (pixel >>> 16) & 255;
    rgba[index * 4 + 1] = (pixel >>> 8) & 255;
    rgba[index * 4 + 2] = pixel & 255;
    rgba[index * 4 + 3] = pixel >>> 24;
  });
  return rgba;
}
const parentArtHeader = (await parentBytes('src/Lawn/System/ChillShroomArt.h')).toString();
const parentMasks = new Map();
const parentNeutral = Buffer.alloc(80 * 80 * 4);
for (const name of ['cap', 'body', 'base']) {
  const rgba = packedRgba(parentArtHeader, name), alpha = alphaBytes(rgba);
  assert.equal(sha(alpha), expectedParentAlphaSha[name], 'Independently pinned approved part alpha: ' + name);
  parentMasks.set(name, alpha);
  for (let offset = 0; offset < rgba.length; offset += 4) if (rgba[offset + 3]) {
    assert.equal(parentNeutral[offset + 3], 0, 'Parent layers partition whole approved pixels');
    rgba.copy(parentNeutral, offset, offset, offset + 4);
  }
}
assert.equal(sha(parentNeutral), expectedParentRgbaSha, 'Pinned parent parts reconstruct the reviewed final paint');
assert.equal(sha(alphaBytes(parentNeutral)), expectedCanonicalAlphaSha, 'Approved whole-character alpha was independently derived');
async function sourcePngBase64(name) {
  const encodedBytes = await read('source/artwork/chill-shroom/' + name);
  const encoded = encodedBytes.toString().replace(/\s+/g, '');
  assert.match(encoded, /^[A-Za-z0-9+/]+={0,2}$/);
  const bytes = Buffer.from(encoded, 'base64');
  assert.equal(bytes.toString('base64'), encoded, 'Canonical complete source Base64: ' + name);
  return {bytes, image: decodeRgbaPng(bytes, true, 4096)};
}
const master = await sourcePngBase64('approved-master.png.base64.txt');
const closedMaster = await sourcePngBase64('closed-master.png.base64.txt');
const paintedMaster = await sourcePngBase64('painted-master.png.base64.txt');
const paintedClosedMaster = await sourcePngBase64('painted-closed-master.png.base64.txt');
const paintedBase = await sourcePngBase64('painted-base.png.base64.txt');
assert.equal(sha(paintedMaster.bytes), paintedMasterSha, 'The reviewed final paint has an immutable source');
assert.equal(sha(paintedClosedMaster.bytes), paintedClosedMasterSha, 'The current bounded eye edit has an immutable source');
assert.equal(sha(paintedBase.bytes), paintedBaseSha, 'The initial style edit remains available for prompt reproducibility');
assert.equal(sha(master.bytes), approvedMasterSha, 'The source is the exact whole character approved by the user');
assert.equal(sha(closedMaster.bytes), closedMasterSha, 'The bounded eye edit has an immutable source');
assert.deepEqual([master.image.width, master.image.height], [1285, 1224]);
assert.equal(artwork.approvedMasterSha256, approvedMasterSha);
assert.equal(artwork.closedMasterSha256, closedMasterSha);
assert.equal(artwork.paintedMasterSha256, paintedMasterSha);
assert.equal(artwork.paintedClosedMasterSha256, paintedClosedMasterSha);
assert.equal(artwork.approvedCanonicalRgbaSha256, expectedApprovedRgbaSha);
assert.equal(artwork.canonicalAlphaSha256, expectedCanonicalAlphaSha);
assert.equal(artwork.canonicalRgbaSha256, expectedCanonicalRgbaSha);
assert.equal(sha(headerBytes), artwork.headerSha256);
assert.equal(sha(extractionBytes), artwork.extractionSha256);
assert.equal(sha(generationBytes), artwork.generationSha256);
assert.equal(sha(generator), artwork.generatorSha256);
assert.equal(generation.schema, 1);
assert.equal(generation.tool, 'built-in image_gen.imagegen');
assert.equal(generation.scope, 'custom plant only; no standalone challenge illustrations');
assert.equal(generation.geometryLocked, true);
if ('standaloneChallengeIllustrations' in generation) assert.equal(generation.standaloneChallengeIllustrations, false);
assert.equal(generation.approvedMasterSha256, approvedMasterSha);
assert.equal(generation.masterSource, 'approved-master.png.base64.txt');
assert.equal(generation.closedSource, 'closed-master.png.base64.txt');
assert.equal(generation.paintedSource, 'painted-master.png.base64.txt');
assert.equal(generation.paintedClosedSource, 'painted-closed-master.png.base64.txt');
assert.equal(generation.paintedBaseSource, 'painted-base.png.base64.txt');
assert.equal(generation.paintedMasterSha256, paintedMasterSha);
assert.equal(generation.paintedClosedMasterSha256, paintedClosedMasterSha);
assert.equal(generation.paintedBaseSha256, paintedBaseSha);
for (const key of ['masterPrompt', 'closedEyePrompt', 'stylePrompt', 'spotRefinementPrompt', 'paintedClosedEyePrompt']) {
  assert(typeof generation[key] === 'string' && generation[key].length > 100, 'Actual plant generation/edit prompt: ' + key);
}
assert.equal(extraction.schema, 2);
assert.deepEqual(extraction.canonical, {
  canvas: [80, 80], sourceBounds: [81, 134, 1232, 1119], fit: [72, 62], origin: [6, 10],
  groundAnchor: [40, 72], alphaThreshold: 8, filter: 'Pillow Lanczos',
}, 'One approved whole-character transform fixes all layer registration');
assert.equal(extraction.parts, undefined, 'There is no independent per-part crop/fitting recipe');
const eyeRegions = [[26, 50, 36, 62], [37, 50, 47, 62]];
assert.deepEqual(extraction.eyeRegions, eyeRegions, 'Expressions may modify only the two fixed eye regions');
assert.equal(extraction.eyeFeatherPixels, 1);
assert.equal(extraction.paintRegistration.interiorAlphaThreshold, 240, 'Repaint all fully covered interiors while retaining true antialiased contour paint');
assert.equal(extraction.halfExpressionBlend, 0.5);
assert.deepEqual(fs.readFileSync(new URL('extraction.json', artworkUrl)), extractionBytes, 'Public extraction instructions match source');
assert.deepEqual(fs.readFileSync(new URL('generation.json', artworkUrl)), generationBytes, 'Public generation/edit records match source');

const sourceManifest = JSON.parse(await read('source-manifest.json'));
assert.equal(sourceManifest.version, engine.id);
const completeProductionSources = Object.fromEntries(Object.entries(sourceManifest.files)
  .map(([name, pin]) => ['source/' + name, pin.sha256]));
assert.deepEqual(fullRunReport.sourceSha256, completeProductionSources,
  'Every full-engine source input matches the complete published production manifest');
for (const snapshot of ['source-before.json', 'source-after.json']) {
  const sourcePins = JSON.parse(await read('logs/' + snapshot));
  assert.deepEqual(sourcePins, Object.fromEntries(Object.entries(completeProductionSources)
    .map(([name, pin]) => [name.slice('source/'.length), pin])),
    'The complete engine test sources match the immutable production build snapshot: ' + snapshot);
}
const archivedSourceNames = Object.values(current.files).filter(entry => !entry.dir && entry.name.startsWith(prefix + 'source/'))
  .map(entry => entry.name.slice((prefix + 'source/').length));
assert.deepEqual(archivedSourceNames.sort(), Object.keys(sourceManifest.files).sort(),
  'Every corresponding-source archive member is represented exactly once in its manifest');
// Repair only the held megaphone presentation; stock game logic stays exact.
const runtimeInputs = new Set(['src/Lawn/System/RallyPresentation.cpp']);
const releaseIdentityInputs = new Set(['CMake/ProjectVersion.cmake']);
const addedChainInputs = [];
const nativeNames = ['PeaShooter_backleaf.png', 'PeaShooter_backleaf_lefttip.png', 'PeaShooter_backleaf_righttip.png',
  'PeaShooter_stalk_bottom.png', 'PeaShooter_stalk_top.png', 'PeaShooter_frontleaf.png',
  'PeaShooter_frontleaf_righttip.png', 'PeaShooter_frontleaf_lefttip.png', 'SunFlower_head.png',
  'SunFlower_blink1.png', 'SunFlower_leftpetal3.png', 'SunFlower_leftpetal4.png', 'SunFlower.reanim'];
let parentSourceCount = 0;
for (const entry of Object.values(parent.files)) {
  if (entry.dir || !entry.name.startsWith(parentPrefix)) continue;
  parentSourceCount++;
  const name = entry.name.slice(parentPrefix.length);
  const before = Buffer.from(await entry.async('uint8array'));
  const after = await read('source/' + name);
  const pin = sourceManifest.files[name];
  assert(pin && pin.bytes === after.length && pin.sha256 === sha(after));
  if (runtimeInputs.has(name)) {
    assert(!after.equals(before), 'Every allowed existing source delta is an actual reviewed change: ' + name);
    continue;
  }
  if (releaseIdentityInputs.has(name))
    assert.equal(after.toString().replaceAll('0.2.6-web-rally.3', '0.2.6-web-rally.2'), before.toString());
  else assert.deepEqual(after, before, 'Every unrelated source/artwork byte remains exact: ' + name);
}
assert.equal(parentSourceCount, 824);
const addedProduction = Object.keys(sourceManifest.files).filter(name => !parent.file(parentPrefix + name));
assert.deepEqual(addedProduction.sort(), [...addedChainInputs].sort(), 'Maintenance adds no production files');
assert.equal(Object.keys(sourceManifest.files).length, parentSourceCount + addedChainInputs.length);
const normalizeSource = bytes => bytes.toString().replace(/\r\n?/g, '\n');
const beforePlant = normalizeSource(await parentBytes('src/Lawn/Plant.cpp'));
const afterPlant = normalizeSource(await read('source/src/Lawn/Plant.cpp'));
for (const signature of ['void DrawCareFatigue(Graphics* g, Plant& plant, Reanimation& body, float baseY)',
  "namespace\n{\n// Reanimation's matrix draw path does not use Graphics::SetScale."])
  assert.equal(extractLegacyFunction(afterPlant, signature), extractLegacyFunction(beforePlant, signature), 'Care fatigue rendering remains exact');
const beforeBoard = normalizeSource(await parentBytes('src/Lawn/Board.cpp'));
const afterBoard = normalizeSource(await read('source/src/Lawn/Board.cpp'));
assert.equal(afterBoard, beforeBoard, 'All Board logic, including defined Survival startup, stays exact');
for (const signature of ['void Board::UpdateIntensiveCare()', 'bool Board::MoveIntensiveCarePlant(Plant* thePlant, int theGridX, int theGridY)'])
  assert.equal(extractLegacyFunction(afterBoard, signature), extractLegacyFunction(beforeBoard, signature), 'Existing Care mechanics stay exact');

const beforeLantern = normalizeSource(await parentBytes('src/Lawn/System/LanternShroom.cpp'));
const afterLantern = normalizeSource(await read('source/src/Lawn/System/LanternShroom.cpp'));
for (const signature of ['void ConfigureAttackAnimation(Plant& plant)', 'void EnsurePlantReanimation(Plant& plant)',
  'Sexy::Image* GetImage()', 'void DrawAttackPulse(Sexy::Graphics* graphics, const Plant& plant, float offsetY)'])
  assert.equal(extractLegacyFunction(afterLantern, signature), extractLegacyFunction(beforeLantern, signature), 'Accepted Chill-shroom motion and frost stay exact');

for (const name of ['src/Lawn/System/ChillShroomArt.h', 'artwork/chill-shroom/extraction.json', 'artwork/chill-shroom/generation.json', 'artwork/chill-shroom/render.py', 'artwork/chill-shroom/approved-master.png.base64.txt', 'artwork/chill-shroom/closed-master.png.base64.txt', 'artwork/chill-shroom/painted-master.png.base64.txt', 'artwork/chill-shroom/painted-closed-master.png.base64.txt', 'artwork/chill-shroom/painted-base.png.base64.txt']) {
  const bytes = await read('source/' + name), pin = sourceManifest.files[name];
  assert(pin, 'Approved master/edit/extraction input is included in the source manifest: ' + name);
  assert.equal(pin.bytes, bytes.length);
  assert.equal(pin.sha256, sha(bytes));
}
for (const obsolete of ['recipe.json', 'design.py', 'sprite-atlas.png.base64.txt']) {
  assert.equal(current.file(prefix + 'source/artwork/chill-shroom/' + obsolete), null, 'Superseded separately fitted artwork source is absent');
}

const canonicalPng = fs.readFileSync(new URL('canonical.png', artworkUrl));
assert.equal(sha(canonicalPng), artwork.canonicalPngSha256, 'Canonical PNG byte identity');
const canonical = decodeRgbaPng(canonicalPng);
assert.deepEqual([canonical.width, canonical.height], [80, 80]);
assert.equal(sha(canonical.rgba), expectedCanonicalRgbaSha, 'Canonical pixels match the reviewed final paint');
assert.equal(sha(canonical.rgba), expectedParentRgbaSha, 'Minigame revision preserves the exact reviewed parent paint');
assert.equal(sha(alphaBytes(canonical.rgba)), expectedCanonicalAlphaSha, 'New paint preserves every approved whole-character alpha byte');
assert.deepEqual(alphaBytes(canonical.rgba), alphaBytes(parentNeutral), 'New paint retains the exact parent silhouette, not only matching bounds');
const names = ['cap', 'body', 'base', 'blink1', 'blink2'];
assert.deepEqual(Object.keys(artwork.parts).sort(), [...names].sort());
const decodedParts = new Map();
for (const name of names) {
  const pin = artwork.parts[name];
  assert.equal(pin.width, 80); assert.equal(pin.height, 80, 'All runtime parts use the same registered canvas');
  const png = fs.readFileSync(new URL(name + '.png', artworkUrl));
  assert.equal(sha(png), pin.pngSha256, 'Published PNG pin: ' + name);
  const decoded = decodeRgbaPng(png);
  assert.deepEqual([decoded.width, decoded.height], [80, 80]);
  assert.equal(sha(decoded.rgba), pin.rgbaSha256, 'Decoded pixel pin: ' + name);
  const rgba = packedRgba(header, name);
  const parentMask = parentMasks.get(name === 'blink1' || name === 'blink2' ? 'body' : name);
  assert.deepEqual(alphaBytes(rgba), parentMask, 'Motion preserves the exact approved part geometry: ' + name);
  assert.deepEqual(rgba, packedRgba(parentArtHeader, name), 'Motion preserves every reviewed runtime sprite pixel: ' + name);
  assert.deepEqual(decoded.rgba, rgba, 'Public PNG and embedded runtime artwork are pixel-identical: ' + name);
  for (let offset = 0; offset < rgba.length; offset += 4) {
    if (rgba[offset + 3] === 0) assert.equal(rgba.readUInt32BE(offset), 0, 'Transparent registered pixels have no hidden RGB: ' + name);
  }
  decodedParts.set(name, decoded);
}
function visibleBounds(image) {
  let left = image.width, top = image.height, right = -1, bottom = -1;
  for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) if (image.rgba[(y * image.width + x) * 4 + 3] > 8) {
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  assert(right >= left && bottom >= top);
  return [left, top, right + 1, bottom + 1];
}
assert.deepEqual(visibleBounds(master.image), [81, 134, 1232, 1119], 'Approved source alpha bounds are not independently re-fitted');
assert.deepEqual(visibleBounds(canonical), [6, 10, 78, 72], 'The single scale and placement retain the approved ground registration');
assert(decodedParts.get('base').rgba.every(value => value === 0), 'No separate feet/base can alter the approved silhouette');
const cap = decodedParts.get('cap').rgba, body = decodedParts.get('body').rgba;
const half = decodedParts.get('blink1').rgba, closed = decodedParts.get('blink2').rgba;
const reconstructed = Buffer.alloc(canonical.rgba.length);
let capPixels = 0, bodyPixels = 0;
for (let offset = 0; offset < reconstructed.length; offset += 4) {
  const capAlpha = cap[offset + 3], bodyAlpha = body[offset + 3];
  assert(!(capAlpha && bodyAlpha), 'Registered neutral layers partition whole pixels without overlapping alpha');
  if (capAlpha) {cap.copy(reconstructed, offset, offset, offset + 4); capPixels++;}
  else if (bodyAlpha) {body.copy(reconstructed, offset, offset, offset + 4); bodyPixels++;}
}
assert(capPixels > 0 && bodyPixels > 0, 'Both actual cap and body layers contain registered visible art');
assert.deepEqual(reconstructed, canonical.rgba, 'Neutral cap/body union exactly reconstructs the approved whole character');
assert.equal(sha(reconstructed), expectedCanonicalRgbaSha, 'Registered parts reconstruct the reviewed final paint exactly');
assert.equal(sha(alphaBytes(reconstructed)), expectedCanonicalAlphaSha, 'Layer union retains the approved silhouette after repainting');
assert(!body.equals(half) && !body.equals(closed) && !half.equals(closed), 'Open, half and closed expressions differ');
const changedPerEye = eyeRegions.map(() => 0);
for (let y = 0; y < 80; y++) for (let x = 0; x < 80; x++) {
  const offset = (y * 80 + x) * 4;
  assert.equal(half[offset + 3], body[offset + 3], 'Half expression retains approved alpha');
  assert.equal(closed[offset + 3], body[offset + 3], 'Closed expression retains approved alpha');
  const eyeIndex = eyeRegions.findIndex(([left, top, right, bottom]) => x >= left && x < right && y >= top && y < bottom);
  const differs = !body.subarray(offset, offset + 4).equals(half.subarray(offset, offset + 4)) ||
    !body.subarray(offset, offset + 4).equals(closed.subarray(offset, offset + 4));
  if (eyeIndex < 0) assert(!differs, 'Expressions retain exact approved pixels outside the fixed eye regions');
  else if (differs) changedPerEye[eyeIndex]++;
}
for (const changed of changedPerEye) assert(changed > 5, 'Both eyes have an actual expression change');
console.log('PASS exact parent custom-plant motion, Almanac/chooser and Chill pixels; independent PNG/runtime pixels and fixed-alpha eye expressions remain intact.');

function sourceOver(back, front) {
  assert.equal(back.length, front.length); const result = Buffer.alloc(back.length);
  const div255 = value => ((value >>> 8) + value) >>> 8;
  for (let p = 0; p < back.length; p += 4) {
    const af = front[p+3], ab = back[p+3];
    if (!af) {back.copy(result, p, p, p+4); continue;}
    const outA255 = af*255 + ab*(255-af);
    const cf = Math.floor(af*255*255*128/outA255), cb = 255*128-cf;
    for (let c=0;c<3;c++) result[p+c] = div255(front[p+c]*cf + back[p+c]*cb + 16384) >>> 7;
    result[p+3] = div255(outA255 + 128);
  }
  return result;
}

// Independently decode the distinct head, preserved native stem and every
// compiled straight-alpha ARGB part. Source/provenance hashes alone cannot
// establish exported layout or blink invariants.
{
  const artUrl = new URL('content/mender-bloom/', dist);
  const provenance = JSON.parse(fs.readFileSync(new URL('provenance.json', artUrl)));
  assert.equal(provenance.schema, 3);
  assert.equal(provenance.version, '0.2.6-web-mender.3', 'Unchanged accepted art keeps its original provenance identity');
  assert.equal(provenance.displayName, 'Mender-bloom');
  assert.equal(provenance.imageGenerationUsed, true, 'The distinct blossom head uses the permitted built-in image tool');
  assert.equal(provenance.historicalImageGenerationUsed, true);
  assert.equal(provenance.historicalGeneratedArtworkActive, false, 'Rejected historical masters are inactive');
  assert.equal(provenance.historicalNativeHeadActive, false, 'The Sunflower face, blink and radial petals are inactive');
  assert.equal(provenance.standaloneChallengeIllustrations, false);
  assert.equal(provenance.assetBundleId, engine.assetBundleId);
  const approvedHeadMasterSha = 'f4bd5415a6da077ff55d92aebfec23ba46d12209b99172d6b37bbdee3eb5ca36';
  const approvedHeadClosedSha = '4c7c7a4b43bafb6ccbdbb7637b27dcee4ed416707c5200b95fa343fffd24c0e0';
  const approvedCanonicalSha = '9d4c9c41d2870640b6464ca308fed57cb6ecbfcb62aa3d78a9e298f7963e6602';
  assert.equal(provenance.canonicalRgbaSha256, approvedCanonicalSha, 'Reviewed distinct blossom pixels are independently pinned');
  assert.equal(provenance.sourceMasterSha256, approvedHeadMasterSha);
  assert.equal(provenance.sourceClosedSha256, approvedHeadClosedSha);
  assert.deepEqual(provenance.generatedHead, {masterPath:'head-master.png', closedPath:'head-closed.png',
    masterSha256:approvedHeadMasterSha, closedSha256:approvedHeadClosedSha});
  assert.deepEqual(provenance.unchangedStem, {parentVersion:'0.2.6-web-mender.2',
    pngSha256:'e23f660180de218dca4ca7692f005b67115d7998e0303a7b1a68b4e9a78b2f02',
    rgbaSha256:'d306df9ab8d66cf3d7854bb599341525550b0f665cc529d2d708ad3cc18da2c1'});
  const pins = {
    'artwork/mender-bloom/generation.json': provenance.generationSha256,
    'artwork/mender-bloom/extraction.json': provenance.extractionSha256,
    'artwork/mender-bloom/render.py': provenance.generatorSha256,
    'artwork/mender-bloom/native-provenance.json': provenance.nativeInputsSha256,
    'artwork/mender-bloom/generation-history.json': provenance.historicalGenerationSha256,
    'artwork/mender-bloom/generation-mender2-history.json': provenance.historicalNativeGenerationSha256,
    'artwork/mender-bloom/head-master.png': approvedHeadMasterSha,
    'artwork/mender-bloom/head-closed.png': approvedHeadClosedSha,
    'src/Lawn/System/MenderBloomArt.h': provenance.headerSha256,
  };
  for (const [name, expected] of Object.entries(pins)) {
    const bytes = await read('source/' + name);
    assert.equal(sha(bytes), expected, 'Distinct-head provenance identifies exact archived input: ' + name);
    assert.equal(sourceManifest.files[name]?.sha256, expected);
    assert.equal(sourceManifest.files[name]?.bytes, bytes.length);
  }
  assert.deepEqual(await read('source/artwork/mender-bloom/generation-history.json'),
    await parentBytes('artwork/mender-bloom/generation-history.json'), 'Historical first generated draft stays unchanged and inactive');
  assert.deepEqual(await read('source/artwork/mender-bloom/generation-mender2-history.json'),
    await parentBytes('artwork/mender-bloom/generation-mender2-history.json'), 'Prior native-head record is retained accurately as inactive history');
  for (const name of ['generation.json', 'extraction.json'])
    assert.deepEqual(fs.readFileSync(new URL(name, artUrl)), await read('source/artwork/mender-bloom/' + name));
  const recipe = JSON.parse(await read('source/artwork/mender-bloom/extraction.json'));
  const parentRecipe = JSON.parse(await parentBytes('artwork/mender-bloom/extraction.json'));
  const artGeneration = JSON.parse(await read('source/artwork/mender-bloom/generation.json'));
  assert.equal(recipe.schema, 4);
  assert.deepEqual(recipe.canvas, [80, 80]);
  assert.deepEqual(recipe.groundAnchor, [40, 72]);
  assert.deepEqual(recipe.headStemJoint, [40, 50]);
  assert.deepEqual(recipe.stem, parentRecipe.stem, 'Every original leaf/stalk pose and native input remains unchanged');
  assert.equal(recipe.oversample, parentRecipe.oversample);
  assert.equal(recipe.discardAlphaAtMost, parentRecipe.discardAlphaAtMost);
  assert(!('face' in recipe) && !('petals' in recipe), 'The active recipe no longer composes a Sunflower disk or radial petal ring');
  assert.deepEqual(recipe.head, {source:'head-master.png',closedSource:'head-closed.png',
    sourceCanvas:[1296,1213],crop:[233,256,1127,981],size:[58,47],offset:[15,4]},
    'Reviewed source normalization keeps the distinct blossom proportions and shared-neck placement');
  assert.deepEqual(recipe.eyeRegions, [[47,25,54,34],[55,24,61,32]]);
  const master = decodeRgbaPng(await read('source/artwork/mender-bloom/head-master.png'), false, 4096);
  const expression = decodeRgbaPng(await read('source/artwork/mender-bloom/head-closed.png'), false, 4096);
  assert.deepEqual([master.width,master.height], recipe.head.sourceCanvas);
  assert.deepEqual([expression.width,expression.height], recipe.head.sourceCanvas);
  for (const image of [master, expression]) {
    const alpha = alphaBytes(image.rgba);
    assert(alpha.some(value => value === 0) && alpha.some(value => value > 240), 'Source head has actual transparent padding and solid artwork');
  }
  assert.equal(artGeneration.schema,3);
  assert.equal(artGeneration.tool,'Built-in image_gen tool');
  assert.equal(artGeneration.imageGenerationUsed,true);
  assert.equal(artGeneration.cliOrApiKeyUsed,false);
  assert.equal(artGeneration.headOnly,true);
  assert.equal(artGeneration.originalStemLeavesBytePreserved,true);
  assert.equal(artGeneration.historicalNativeComposition.active,false);
  assert.equal(artGeneration.historicalWholeFlowerGeneration.active,false);
  assert.deepEqual(artGeneration.calls.map(call=>call.output),['head-draft.png','head-master.png','head-closed.png']);
  const approvedGeneratedOutputs={
    'head-draft.png':'248ec8817f77b869478ac8a351ca78c6a6926d57673d5a7f35f8861df823b89e',
    'head-master.png':approvedHeadMasterSha,'head-closed.png':approvedHeadClosedSha,
  };
  const approvedStyleInputs={
    'head-style-game.jpg':'efa379dda990972337989fe5e4285391d9316194a9f12f5e6349a05acbc04fde',
    'head-style-stem.png':provenance.unchangedStem.pngSha256,
  };
  const approvedImageInputs={...approvedGeneratedOutputs,...approvedStyleInputs};
  for(const call of artGeneration.calls) {
    assert.equal(call.transparentBackground,true);
    assert(typeof call.prompt==='string'&&call.prompt.length>200,'Exact substantive prompt is retained for every built-in generation/edit call');
    assert.equal(call.sha256,approvedGeneratedOutputs[call.output]);
    assert.equal(sha(await read('source/artwork/mender-bloom/'+call.output)),approvedGeneratedOutputs[call.output]);
    assert.deepEqual(Object.keys(call.referencedSha256).sort(),[...call.referencedImages].sort());
    for(const name of call.referencedImages) {
      assert.equal(call.referencedSha256[name],approvedImageInputs[name]);
      assert.equal(sha(await read('source/artwork/mender-bloom/'+name)),approvedImageInputs[name]);
    }
  }
  for(const [name,pin]of Object.entries(approvedStyleInputs))
    assert.equal(sha(await read('source/artwork/mender-bloom/'+name)),pin,'Approved style reference remains exact: '+name);
  const nativeRecord = JSON.parse(await read('source/artwork/mender-bloom/native-provenance.json'));
  assert.equal(nativeRecord.assetBundleId, engine.assetBundleId);
  assert.deepEqual(nativeRecord.sourceInputs.map(item => item.path).sort(), nativeNames.map(name => 'native/' + name).sort());
  const activeNativeNames = new Set(recipe.stem.tracks.map(item => 'native/' + item.source).concat('native/SunFlower.reanim'));
  assert.equal(activeNativeNames.size, 9);
  assert.deepEqual(provenance.sourceInputs, nativeRecord.sourceInputs.filter(item => activeNativeNames.has(item.path)));
  assert.deepEqual(provenance.historicalNativeInputs, nativeRecord.sourceInputs.filter(item => !activeNativeNames.has(item.path)));
  assert.equal(provenance.historicalNativeInputs.length, 4);
  const approvedNativeHashes = {
    'PeaShooter_backleaf.png': 'db925b5ce54fec6324cde2a635d160353fa06511948429636601011f25a0dab3',
    'PeaShooter_backleaf_lefttip.png': 'feb34aa6cc279ca31156f924c54a53861b9a79cb70c35aa7aeea3c6e79cb77f2',
    'PeaShooter_backleaf_righttip.png': '60419cd6e7b7619077078ddd35aada8fc4fc9fbc2ea5fb4917e8c777ce49bf03',
    'PeaShooter_stalk_bottom.png': '79de9bd29cb7297fc218e564676a36ea0cbb3738e16b47da16b3dbc1ec5cfbd4',
    'PeaShooter_stalk_top.png': '0628a9cf3676bc78a8532ac97266091aff348611f162318a069e13db46b37f67',
    'PeaShooter_frontleaf.png': '26ce3afa0788a624d8a1747dab2ba51223489a04aed61f08a453c0d073bfbddd',
    'PeaShooter_frontleaf_righttip.png': 'a5a5245bd884c6cc90ff13666f147b9ece85c6e6453dbeb56857c5d50caf785d',
    'PeaShooter_frontleaf_lefttip.png': 'fac7ced98626e9a9f91aa9746025e3713496cde453c1999ab89bdad6ed966f4d',
    'SunFlower_head.png': '3813ea881b25465dec25e75b7fa2a20fde4b421e7dd7c3b1ffabf4eb1fd61fb3',
    'SunFlower_blink1.png': '5a6238d1ecc8a59f47fdc66fdbd6b83823d1c9fd00d7a4707cb1111dc129fefa',
    'SunFlower_leftpetal3.png': '93bad940e7841f7758768b036e1cd89d068727e4cffdfacce231754b1bf03ec8',
    'SunFlower_leftpetal4.png': '346abc1f138aac79eb7d0ec2aeb2e655a7cbd8473592854f2e0c3a9a2c23993c',
    'SunFlower.reanim': 'c1f67f3784cd199d36feb0a7a44426d180acb289ca4c2a2e308ca2b26e0008dd',
  };

  assert.deepEqual(Object.keys(approvedNativeHashes).sort(), [...nativeNames].sort());
  for (const input of nativeRecord.sourceInputs) {
    const name = input.path.slice('native/'.length);
    assert.equal(input.originalPath, 'reanim/' + name);
    assert.equal(input.sha256, approvedNativeHashes[name], 'Native catalog metadata matches independently approved input: ' + name);
    assert.equal(sha(await read('source/artwork/mender-bloom/' + input.path)), approvedNativeHashes[name],
      'Native source bytes match the independently approved original: ' + name);
  }
  // When the full runtime asset bundle is present, additionally reauthenticate
  // those same inputs against their exact original resource payloads.
  const assetManifest = JSON.parse(fs.readFileSync(new URL('game-assets/manifest.json', dist)));
  assert.equal(assetManifest.id, engine.assetBundleId);
  const pakRecord = assetManifest.files.find(item => item.path === 'main.pak');
  assert(pakRecord && pakRecord.parts.length > 0);
  const presentParts = pakRecord.parts.map(part => fs.existsSync(new URL('game-assets/' + part.url, dist)));
  assert(presentParts.every(Boolean) || presentParts.every(value => !value), 'A partially present runtime PAK is invalid; only complete runtime or metadata-only source packaging is supported');
  if (presentParts.every(Boolean)) {
    const pak = Buffer.concat(pakRecord.parts.map(part => fs.readFileSync(new URL('game-assets/' + part.url, dist))));
    assert.equal(sha(pak), pakRecord.sha256);
    for (let i = 0; i < pak.length; i++) pak[i] ^= 0xf7;
    assert.deepEqual([...pak.subarray(0,8)], [0xc0,0x4a,0xc0,0xba,0,0,0,0]);
    let cursor = 8, payloadOffset = 0; const entries = new Map();
    for (;;) {
      assert(cursor < pak.length); const flag = pak[cursor++]; if (flag & 0x80) break;
      const length = pak[cursor++]; assert(cursor + length + 12 <= pak.length);
      const name = pak.toString('utf8', cursor, cursor + length).replaceAll('\\', '/'); cursor += length;
      const size = pak.readUInt32LE(cursor); cursor += 12;
      assert(!entries.has(name)); entries.set(name, {offset: payloadOffset, size}); payloadOffset += size;
    }
    assert(cursor + payloadOffset <= pak.length);
    for (const input of nativeRecord.sourceInputs) {
      const entry = entries.get(input.originalPath); assert(entry, 'Original native resource exists: ' + input.originalPath);
      const original = pak.subarray(cursor + entry.offset, cursor + entry.offset + entry.size);
      const archived = await read('source/artwork/mender-bloom/' + input.path);
      assert.equal(sha(original), input.sha256);
      assert.deepEqual(archived, original, 'Catalog retains exact approved original resource bytes: ' + input.originalPath);
    }
    for (const [name, expected] of Object.entries(approvedLayoutHashes)) {
      const entry = entries.get(name); assert(entry, 'Original layout font/sprite exists in runtime PAK: ' + name);
      const original = pak.subarray(cursor + entry.offset, cursor + entry.offset + entry.size);
      assert.equal(sha(original), expected);
      assert.deepEqual(original, Buffer.from(layoutFixture.assets[name].base64, 'base64'),
        'Layout fixture retains exact original runtime resource bytes: ' + name);
    }
    console.log('PASS full runtime PAK reauthentication of all ten original layout font/sprite inputs.');
    console.log('PASS full runtime PAK reauthentication of all thirteen approved native catalog inputs.');
  } else {
    console.log('PASS code-only source package: all ten layout font/sprite fixtures match independently pinned original payload hashes.');
    console.log('PASS code-only source package: all thirteen native catalog inputs match independently approved original hashes; large runtime PAK payloads are intentionally absent.');
  }

  const menderHeader = (await read('source/src/Lawn/System/MenderBloomArt.h')).toString();
  const parentMenderHeader = (await parentBytes('src/Lawn/System/MenderBloomArt.h')).toString();
  assert.equal(Number(menderHeader.match(/kWidth\s*=\s*(\d+)/)?.[1]), 80);
  assert.equal(Number(menderHeader.match(/kHeight\s*=\s*(\d+)/)?.[1]), 80);
  const arrays = {canonical:'kArgb', head:'kHeadArgb', stem:'kStemArgb', 'head-blink':'kHeadBlinkArgb'};
  const unpack = (text, array) => {
    const values = text.match(new RegExp(array + '\\[\\]\\s*=\\s*\\{([\\s\\S]*?)\\};'));
    assert(values, 'Packed array is present: ' + array);
    const pixels = [...values[1].matchAll(/0x([0-9a-fA-F]{8})u/g)].map(value => Number.parseInt(value[1],16));
    assert.equal(pixels.length, 6400);
    const rgba = Buffer.alloc(25600);
    for (let i=0;i<pixels.length;i++) {
      rgba[i*4]=pixels[i]>>>16&255; rgba[i*4+1]=pixels[i]>>>8&255;
      rgba[i*4+2]=pixels[i]&255; rgba[i*4+3]=pixels[i]>>>24;
    }
    return rgba;
  };
  const parts = new Map();
  for (const name of ['canonical','head','stem','head-blink','blink']) {
    const png=fs.readFileSync(new URL(name+'.png',artUrl)), pin=provenance.parts[name];
    const decoded=decodeRgbaPng(png);
    assert.deepEqual([decoded.width,decoded.height,pin.width,pin.height],[80,80,80,80]);
    assert.equal(sha(png),pin.pngSha256);
    assert.equal(sha(decoded.rgba),pin.rgbaSha256);
    for(let p=0;p<decoded.rgba.length;p+=4) if(!decoded.rgba[p+3])
      assert.equal(decoded.rgba.readUInt32BE(p),0,'Transparent Mender pixels have no hidden RGB');
    if(arrays[name]) assert.deepEqual(decoded.rgba,unpack(menderHeader,arrays[name]),
      'Public and compiled sprite pixels match exactly: '+name);
    parts.set(name,decoded.rgba);
  }
  assert.equal(sha(fs.readFileSync(new URL('stem.png',artUrl))),provenance.unchangedStem.pngSha256);
  assert.equal(sha(parts.get('stem')),provenance.unchangedStem.rgbaSha256);
  assert.deepEqual(parts.get('stem'),unpack(parentMenderHeader,'kStemArgb'),
    'Every original stem/leaf output pixel is identical to the published Mender.3 parent');
  assert.deepEqual(parts.get('head'),unpack(parentMenderHeader,'kHeadArgb'),
    'The accepted distinct blossom head remains exactly the Mender.3 artwork');
  const neutral=parts.get('canonical'),head=parts.get('head'),stem=parts.get('stem'),blink=parts.get('blink'),blinkHead=parts.get('head-blink');
  const reconstructed=sourceOver(stem,head),closed=sourceOver(stem,blinkHead);
  const changed=recipe.eyeRegions.map(()=>0); let headPixels=0,stemPixels=0,overlap=0;
  for(let p=0;p<neutral.length;p+=4) {
    if(head[p+3])headPixels++; if(stem[p+3])stemPixels++; if(head[p+3]&&stem[p+3])overlap++;
    assert.equal(blink[p+3],neutral[p+3],'Blink retains canonical alpha');
    assert.equal(blinkHead[p+3],head[p+3],'Head expression retains registered layer alpha');
    const x=p/4%80,y=Math.floor(p/4/80);
    const eye=recipe.eyeRegions.findIndex(([l,t,r,b])=>x>=l&&x<r&&y>=t&&y<b);
    if(!neutral.subarray(p,p+4).equals(blink.subarray(p,p+4))) {
      assert(eye>=0,'Blink changes only the fixed reviewed eye regions'); changed[eye]++;
    }
  }
  assert(headPixels>0&&stemPixels>0&&overlap>0,'Head and native stem overlap at the shared neck');
  assert.deepEqual(reconstructed,neutral,'Independent source-over reconstruction matches every canonical pixel');
  assert.deepEqual(closed,blink,'Independent source-over reconstruction matches every closed expression pixel');
  assert.equal(sha(neutral),approvedCanonicalSha);
  for(const count of changed)assert(count>5,'Both eyes have actual blink-expression artwork');
  console.log('PASS distinct generated head sources and inactive Sunflower head, exact original stem pixels, independent PNG/compiled pixels and fixed-alpha eye-only blink.');
}

if (process.argv.includes('--run-native')) {
  const temporaryRoot = fs.realpathSync(os.tmpdir());
  const temporary = fs.mkdtempSync(path.join(temporaryRoot, 'pvz-native-content-'));
  try {
    for (const entry of Object.values(current.files)) {
      if (entry.dir || !entry.name.startsWith(prefix)) continue;
      const name = entry.name.slice(prefix.length);
      if (!name.startsWith('source/') && !name.startsWith('tests/') &&
        !['logs/build-result.json', 'logs/source-before.json', 'logs/source-after.json'].includes(name)) continue;
      assert(!name.includes('\\') && !name.split('/').some(part => !part || part === '.' || part === '..' || part.includes(':')));
      const target = path.resolve(temporary, name);
      assert(target.startsWith(temporary + path.sep));
      fs.mkdirSync(path.dirname(target), {recursive: true});
      fs.writeFileSync(target, await entry.async('uint8array'));
    }
    for (const name of suites) {
      const args = [path.join(temporary, 'tests/test-' + name + '.py'), '--native'];
      if (name === 'care-full-run' || name === 'chain-reaction' || name === 'rally-zombie') args.push('--asset-root', fileURLToPath(new URL('game-assets/', dist)));
      const run = spawnSync('python', args, {encoding: 'utf8'});
      assert.equal(run.status, 0, (run.error?.message || '') + run.stdout + run.stderr);
      const actual = JSON.parse(fs.readFileSync(path.join(temporary, 'tests/' + name + '-results.json')));
      assert.equal(actual.checks, reports.get(name).checks);
      assert.equal(actual.failures, 0);
    }
    console.log(`PASS all ${checks} retained production-method tests and complete headless Care scenarios on CI.`);
  } finally {
    const resolved = fs.realpathSync(temporary);
    assert.equal(path.dirname(resolved), temporaryRoot);
    assert(path.basename(resolved).startsWith('pvz-native-content-'));
    fs.rmSync(resolved, {recursive: true});
  }
}
