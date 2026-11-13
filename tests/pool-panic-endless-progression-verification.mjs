// SPDX-License-Identifier: MIT
// Independent verification of actual late-game combat. Synthetic lawn windows
// are never earned progress; developmental/O1 output is never release proof.
import assert from 'node:assert/strict';
import {CURRENT_ENGINE_ID, CURRENT_SOURCE_COUNT, CURRENT_OBJECT_COUNT, ENDLESS3_ENGINE_ID,
 SCRAP_ENGINE_ID, CURRENT_ENDLESS_RETENTION_SHA256, SCRAP_ENDLESS_RETENTION_SHA256,
 AMBUSH_ENGINE_ID,AMBUSH_ENDLESS_RETENTION_SHA256,
 historicalEngine, verifyRetainedParentInputs,verifyTorchRetainedParentInputs,
 TORCH_ENGINE_ID,TORCH_ARCHIVE_SHA256,verifyPublishedTorchAdapter} from './native-release-context.mjs';

const seeds = [1729, 7331];
const milestones = [8, 12, 20, 40];
const knownFixturePins = {
  'endless3-pre-tuning-acceptance-plan.json': '2ac4db2c7558d39a4fff1813db37862d717c5d84b81f6ef3dc1e98b1257566ba',
  'endless3-acceptance-plan-amendment-1.json': '0c08a13d4b9a1a94323d5ce61e73ece6dd9dff683009297f6f527dd0dff41f37',
  'endless3-acceptance-plan-amendment-2.json': 'e67eb0395e47e0a4285155f6a91a88f49c7ec2c6e3d5da17e21a8b4e7a642107',
  'endless3-established-layout.json': 'd62015fcf710758e380cb31ba8bab4e0c8bc76c7c05dc0228b9c169f68fcda85',
  'endless3-parent-reference.json': 'a27ddd48212673c4224730f7b0053a35dcece19fabdf926688fa2844f9c14d32',
  'endless3-native-art-inputs.json': '292841afb14e16416ea5cbd4b3749fd6ec7faa858cafb3612fe47b22d3fe79d8',
  'endless3-factory-assertion-amendment.json': 'f6113e781bd0747cd06f0961d820877f062704adb72fdd137751a0497746a0ef',
  'endless3-verification-contract-attempt1.json': 'd8d1b19485bd6a343c81547b0083ec52938e543ac927c3fb0263fb7d234e6e9f',
  'endless3-attempt1-native-seal.json': 'fb62b155e119aaf8cb5b6433aacc2baa54b3b144c7a04acf9f9306d0d4854676',
};
// Re-frozen only after the typed clock-metadata comparison amendment.
const finalContractPin = '5d4bc2feddbaddb64354cadb718f6bbdebf717b7a2ca5306318103915dce005d';
const resultPrefix = 'POOL_PANIC_ENDLESS_RESULT ';
const bridgePrefix = 'ENDLESS_BOUNDARY_SYNC_RESULT ';
const warningTexts = ['Too many particle emitters', 'Too many particle systems', 'Too many particles'];

const number = (value, min = 0, max = Number.MAX_SAFE_INTEGER, label = 'integer') => {
  assert(Number.isSafeInteger(value) && value >= min && value <= max, `${label}: ${value}`);
  return value;
};
const digest = value => assert.match(value, /^[a-f0-9]{64}$/);
const fields = (row, expected) => {
  assert(row && typeof row === 'object' && !Array.isArray(row));
  for (const [key, value] of Object.entries(expected)) assert.deepEqual(row[key], value, key);
};
const range = (start, count) => Array.from({length: count}, (_, i) => start + i);
const safeName = name => {
  assert.equal(typeof name, 'string');
  assert(name && !name.startsWith('/') && !name.includes('\\') && !name.includes(':'));
  assert(name.split('/').every(part => part && part !== '.' && part !== '..'));
  return name;
};
const textOf = bytes => Buffer.from(bytes).toString('utf8');
const jsonOf = bytes => JSON.parse(textOf(bytes).replace(/^\uFEFF/, ''));

const crcTable = Uint32Array.from({length: 256}, (_, value) => {
  for (let i = 0; i < 8; i++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});
function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) value = crcTable[(value ^ byte) & 255] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

// This is a comparison copy only. The native save and its provenance pins are
// retained unchanged, and migration loads the original exact bytes.
export function normalizeNativeFactorySave(bytes) {
  const raw = Buffer.from(bytes), copy = Buffer.from(raw);
  assert(raw.length >= 24);
  assert.deepEqual(raw.subarray(0, 12), Buffer.from('PVZP_SAVE4\0\0'));
  assert.equal(raw.readUInt32LE(12), 1, 'Actual native v4 format version');
  assert.equal(raw.readUInt32LE(16), raw.length - 24, 'Actual native payload size');
  assert.equal(raw.readUInt32LE(20), crc32(raw.subarray(24)), 'Validate original CRC before any normalization');
  let offset = 24, chunkCount = 0, ignored = 0;
  while (offset < raw.length) {
    assert(offset + 8 <= raw.length);
    const type = raw.readUInt32LE(offset), length = raw.readUInt32LE(offset + 4), start = offset + 8, end = start + length;
    assert.equal(type, ++chunkCount, 'All twenty native chunks appear once in their native order');
    assert(type <= 20 && length >= 12 && end <= raw.length);
    assert.equal(raw.readUInt32LE(start), 1, 'Native chunk version');
    assert.equal(raw.readUInt32LE(start + 4), 1, 'Native chunk outer field identity');
    assert.equal(raw.readUInt32LE(start + 8), length - 12, 'Native chunk outer field length');
    if (type === 1) {
      assert(length >= 16);
      assert.equal(raw.readUInt32LE(start + 12), length - 16, 'Complete native BoardBase TLV blob length');
      let cursor = start + 16, fieldCount = 0;
      while (cursor < end) {
        assert(cursor + 8 <= end);
        const field = raw.readUInt32LE(cursor), size = raw.readUInt32LE(cursor + 4), data = cursor + 8;
        assert.equal(field, ++fieldCount, 'All native BoardBase fields appear once in format order');
        assert(data + size <= end);
        if (field === 89 || field === 90) {
          assert.equal(size, field === 89 ? 4 : 8, 'Only typed preload int32 and creation-time int64 are excluded');
          if (field === 89) assert(raw.readInt32LE(data) >= 0);
          else assert(raw.readBigInt64LE(data) >= 0n);
          copy.fill(0, data, data + size); ignored++;
        }
        cursor = data + size;
      }
      assert.equal(cursor, end); assert.equal(fieldCount, 103);
    }
    offset = end;
  }
  assert.equal(offset, raw.length); assert.equal(chunkCount, 20); assert.equal(ignored, 2);
  copy.writeUInt32LE(crc32(copy.subarray(24)), 20);
  return copy;
}

function identity(row, name, speed, seed) {
  fields(row, {execution: 'complete-production-engine', name, speed, seed});
  assert(seeds.includes(seed));
  assert([1, 2].includes(speed));
  number(row.checks, 1);
}

function inventory(row) {
  number(row.acceptedPackets);
  number(row.consumedPackets);
  number(row.remainingPackets, 0, 10);
  fields(row, {packetConservation: true});
  assert.equal(row.acceptedPackets, row.consumedPackets + row.remainingPackets);
  assert.equal(row.actualTilePlacements, row.consumedPackets);
  number(row.actualTilePlacements);
  number(row.shovelInputs);
}

function nativeTransactions(row) {
  number(row.completedShovelTransactions); number(row.shovelReplants); number(row.counterSpaceTransactions);
  assert.equal(typeof row.pendingReplacement, 'boolean');
  assert.equal(row.completedShovelTransactions, row.shovelReplants + row.counterSpaceTransactions);
  assert.equal(row.shovelInputs, row.completedShovelTransactions + Number(row.pendingReplacement),
    'Every native shovel removal is completed or has its one reserved replacement pending');
}

function nativePressure(row, required) {
  number(row.nativeDamageEvents, 1);
  number(row.nativeZombieActorsObserved, 1);
  number(row.peakLiveActors, 1, 1024);
  const mechanics = ['nativeGargSmashes', 'nativeImpThrows', 'nativePogoJumps', 'nativeBackupDancers'];
  for (const key of mechanics) number(row[key]);
  if (required) assert(mechanics.some(key => row[key] > 0), 'Actual native specialist mechanics must exert pressure');
}

export function validateProgressionWindow(row, {name, speed, seed, flag, parent = false}) {
  identity(row, name, speed, seed);
  assert.equal(speed, 1);
  assert((parent ? [12, 20] : milestones).includes(flag));
  const passive = name === `${parent ? 'baseline' : 'late'}-passive-${flag}`;
  assert(passive || (!parent && name === `late-maintain-${flag}`));
  fields(row, {syntheticStartingFixture: true, countedEarnedFlags: 0,
    postStartHPActorStageRNGEdits: false, startingCompletedFlags: flag - 1,
    displayedStartingFlag: flag, originalDPSPlants: 32, originalDefensePlants: 46,
    finiteVictory: false, awardCollected: false, trophyCount: 0});
  assert(['native-loss', 'completed-window'].includes(row.outcome), 'A time budget cannot masquerade as loss or success');
  const clears = number(row.actualFlagsCleared, 0, 2);
  assert.equal(row.terminalCompletedFlags, flag - 1 + clears);
  assert.equal(clears === 2, row.outcome === 'completed-window');
  number(row.actualFormationsSpawned, clears * 10 + (clears < 2 ? 1 : 0), clears < 2 ? clears * 10 + 10 : 20);
  assert.equal(row.terminalWave, clears === 2 ? 0 : row.actualFormationsSpawned - clears * 10);
  number(row.nativeTicks, 1, 80000);
  number(row.originalDPSLost, 0, 32);
  number(row.originalDefenseLost, row.originalDPSLost, 46);
  number(row.mowersRemaining, 0, 6);
  number(row.mowersConsumed, 0, 6);
  assert.equal(row.mowersRemaining + row.mowersConsumed, 6);
  assert.deepEqual(row.actualCompletedFlags, range(flag, clears));
  assert.equal(row.flagMowerHeadroom.length, clears);
  assert.equal(row.flagDPSLosses.length, clears);
  row.flagMowerHeadroom.forEach((value, i) => {
    number(value, 0, 6);
    if (i) assert(value <= row.flagMowerHeadroom[i - 1]);
  });
  row.flagDPSLosses.forEach((value, i) => {
    number(value, 0, row.originalDPSLost);
    if (i) assert(value >= row.flagDPSLosses[i - 1]);
  });
  assert.equal(row.nativeWaveStartingHealth.length, row.actualFormationsSpawned);
  row.nativeWaveStartingHealth.forEach(value => number(value, 1));
  number(row.nativeVariation, 0, 7);
  inventory(row);
  nativePressure(row, !parent && ((passive && [12, 20].includes(flag)) || (!passive && [20, 40].includes(flag))));
  if (passive) fields(row, {shovelInputs: 0, actualTilePlacements: 0, consumedPackets: 0});
  else {
    fields(row, {visibleOnlyMaintenancePolicy: true, policyIntervalTicks: 250, inputLatencyTicks: 25});
    number(row.shovelReplants);
    number(row.layoutRepairPlacements);
    nativeTransactions(row);
  }
  if (parent) {
    assert.equal(row.outcome, 'completed-window', 'All four balanced original-engine windows must reproduce coasting');
    assert(row.mowersRemaining >= 4);
  } else if (passive && [12, 20].includes(flag)) {
    assert(row.outcome === 'native-loss' || row.mowersConsumed >= 2 || row.originalDPSLost >= 8,
      'Current passive12/20 must show the approved real pressure criterion');
  } else if (!passive && flag === 12) {
    assert.equal(row.outcome, 'completed-window', 'Visible active maintenance must clear two native flags at12');
    assert(row.mowersRemaining >= 1);
    assert(row.actualTilePlacements > 0 && row.layoutRepairPlacements > 0, 'Active12 must perform real native repairs');
  }
}

export function validateProgressionEarned(row, {speed, seed}) {
  identity(row, 'late-earned', speed, seed);
  fields(row, {syntheticStartingFixture: false, postStartHPActorStageRNGEdits: false,
    visibleOnlyMaintenancePolicy: true, outcome: 'earned-target', countedEarnedFlags: 12,
    actualFlagsCleared: 12, actualFormationsSpawned: 120, terminalWave: 0,
    policyIntervalTicks: 250, inputLatencyTicks: 25, exportedActualEarnedEight: true,
    nativeBest: 12, persistedNativeBest: 12, finiteVictory: false, trophyCount: 0});
  assert.deepEqual(row.actualCompletedFlags, range(1, 12));
  assert.equal(row.flagMowerHeadroom.length, 12);
  row.flagMowerHeadroom.forEach((value, i) => {
    number(value, 0, 6);
    if (i) assert(value <= row.flagMowerHeadroom[i - 1]);
  });
  assert(row.flagMowerHeadroom[7] >= 3 && row.flagMowerHeadroom[11] >= 1, 'Approved native8/12 recovery headroom');
  assert.equal(row.mowersRemaining, row.flagMowerHeadroom[11]);
  number(row.nativeTicks, 1, 400000);
  number(row.originalDPSLost);
  number(row.layoutRepairPlacements, 1);
  number(row.shovelReplants);
  number(row.nativeDamageEvents, 1);
  number(row.peakLiveActors, 1, 1024);
  for (const key of ['nativeGargSmashes', 'nativeImpThrows', 'nativePogoJumps', 'nativeBackupDancers']) number(row[key]);
  inventory(row);
  nativeTransactions(row);
  assert.deepEqual(row.skippedDecisionIntervals, range(0, 12));
}

export async function verifyProgressionCaseLog(row, {read, sha, logPath}) {
  const bytes = await read(safeName(logPath));
  assert.equal(sha(bytes), row.logSha256, 'Raw complete-engine log must match its reported hash');
  const text = textOf(bytes), lines = text.split(/\r?\n/);
  const records = lines.filter(line => line.startsWith(resultPrefix));
  assert.equal(records.length, 1, 'Exactly one actual native result per case');
  const raw = JSON.parse(records[0].slice(resultPrefix.length));
  const syncs = lines.filter(line => line.startsWith(bridgePrefix)).map(line => JSON.parse(line.slice(bridgePrefix.length)));
  const warnings = warningTexts.reduce((sum, warning) => sum + text.split(warning).length - 1, 0);
  assert.deepEqual(row, {...raw, boundarySyncs: syncs, boundarySyncCount: syncs.length,
    logSha256: sha(bytes), resourceCapacityWarnings: warnings}, 'No reported outcome field may differ from actual native output');
  assert.equal(warnings, 0, 'Native resource-capacity warnings are not passing proof');
  for (const [i, sync] of syncs.entries()) {
    assert.equal(sync.call, i + 1);
    number(sync.boardBytes, 1); number(sync.profileBytes, 1);
    digest(sync.boardSha256); digest(sync.profileSha256);
  }
}

function actorList(actors, expectedLength) {
  assert.equal(actors.length, expectedLength);
  const ids = new Set();
  for (const actor of actors) {
    assert.equal(actor.length, 7);
    const [id, type, row, body, maximum, helm, shield] = actor;
    number(id, 1, 4294967295); number(type, 0, 33); number(row, 0, 5);
    number(body, 1); number(maximum, body); number(helm); number(shield);
    assert(!ids.has(id), 'Every actual native actor ID is unique'); ids.add(id);
    if ([8, 9, 12, 18, 23, 24, 32].includes(type)) assert(![2, 3].includes(row), 'Land specialists cannot be authored into water');
    if ([11, 14].includes(type)) assert([2, 3].includes(row), 'Pool-only specialists stay in water');
    if ([0, 9, 24].includes(type)) assert.equal(maximum, 270);
    if (type === 32) assert.equal(maximum, 6000);
  }
  return ids;
}

export function validateProgressionNarrow(row, {speed, seed}) {
  identity(row, 'late-narrow-controls', speed, seed);
  fields(row, {syntheticStartingFixture: true, countedEarnedFlags: 0});
  const r = row.narrowControls;
  fields(r, {syntheticActorPositionFreezeAndRemoval: true, countedEarnedFlags: 0,
    nativeZombieCapacity: 1024, softAdmissionCapacity: 128, nativeDancerChildren: 3,
    nativeThrownImps: 1, nativeRedeyeInitialHP: 6000, nativeRedeyePostDamageHP: 2899,
    nativeRedeyeSmash: true, nativePogoTallnutBlocked: true, nativePogoTallnutRemainingHP: 8000, terrainFormationSamples: 640,
    fullCrowdLiveActors: 128, fullCrowdHoldUpdates: 20, allHoldActorIdsAndHPPreserved: true,
    completeFormationHeadroomRequired: true, firstAdmittedFormationSize: 13,
    nativeWarningEntries: 1, nativeWarningCountdownFrames: 750,
    nativeWarningPauseContinue: true, completedWarningHoldTicks: 180,
    completedWarningPauseContinue: true, nativeFinalFormationSize: 17,
    nativeFinalWaveAdvances: 1, noActorDeletionOrPartialSpawn: true, noFiniteAward: true});
  const crowdIds = actorList(r.heldNativeActors, 128);
  actorList(r.nativeChildActors, 4);
  assert.equal(r.nativeChildActors.filter(a => a[1] === 9).length, 3);
  assert.equal(r.nativeChildActors.filter(a => a[1] === 24).length, 1);
  for (const actor of r.nativeChildActors) {
    assert(crowdIds.has(actor[0]));
    assert.deepEqual(r.heldNativeActors.find(a => a[0] === actor[0]), actor, 'Native children count toward actual admission crowd');
  }
  const dancer = r.heldNativeActors.find(a => a[0] === r.nativeDancerParentId);
  const redeye = r.heldNativeActors.find(a => a[0] === r.nativeRedeyeParentId);
  assert(dancer && dancer[1] === 8);
  assert(redeye && redeye[1] === 32 && redeye[3] === 2899 && redeye[4] === 6000);
  const admitted = actorList(r.nativeFirstAdmittedActors, 13);
  for (const id of admitted) assert(!crowdIds.has(id), 'A released whole formation consists of actual new actors');
}

export function validateProgressionMigration(row, {speed, seed, metadata}) {
  identity(row, 'late-migration-controls', speed, seed);
  fields(row, {syntheticStartingFixture: true, countedEarnedFlags: 0});
  fields(metadata, {producerEngine: '0.2.6-web-endless.2', producerRules: 2,
    actualNativeV4AndProfile: true, syntheticStartingFixtures: true, countedEarnedFlags: 0});
  const controls = row.migrationControls;
  fields(controls, {actualParentEngineProducedFiles: true, countedEarnedFlags: 0, sourceRules: 2, targetRules: 3});
  const palette = [7, 18, 23, 22, 21, 16, 17, 19, 2, 20];
  for (const kind of ['early', 'backlog']) {
    const r = controls[kind], expected = metadata[kind];
    fields(r, {profileNativeRoundTrip: true, loadedGraphExactToParent: true,
      onlyRulesMarkerChanged: true, secondMigrationNoOp: true,
      nativeSaveContinueGraphExact: true, acceptedCardsAndOffsetsRetained: true,
      lateAcceptedBacklogSurvivesNewCaps: kind === 'backlog'});
    const {sequence, rngAfter, ...state} = expected;
    assert.deepEqual(r.loadedState, state, 'Current load is the actual frozen parent-produced native state');
    assert.deepEqual(r.migratedState, {...state, rules: 3}, 'The rules marker is the sole migration state change');
    assert.equal(state.rules, 2); assert.equal(state.stage, kind === 'backlog' ? 8 : 0);
    number(state.supplyRng, 0, 4294967295); number(state.mowers, 0, 6);
    assert.equal(state.bankTypes.length, state.bankOffsets.length);
    state.bankOffsets.forEach(value => number(value));
    if (kind === 'early') {
      fields(r, {futureNativeDraws: 12});
      assert.equal(sequence.length, 12); assert.equal(rngAfter.length, 12);
      assert.deepEqual(r.sequence, sequence, 'Early future draws remain identical to the actual parent engine');
      assert.deepEqual(r.rngAfter, rngAfter);
    } else {
      assert.equal(state.bankTypes.length, 6);
      assert.equal(state.bankTypes.filter(type => type === 7).length, 3);
      assert.equal(state.bankTypes.filter(type => type === 18).length, 3);
      assert(state.bankOffsets.some(value => value > 0), 'Old accepted backlog retains genuine native entry offsets');
      fields(r, {currentLateFutureDraws: 12, currentLateFutureThroughContinueExact: true,
        blockedUpdatesRetainRng: true, comparedLateTypesToParent: false});
      number(r.nativeBlockedUpdates, 1);
      assert.equal(r.currentLateSequence.length, 12); assert.equal(r.currentLateRngAfter.length, 12);
      r.currentLateSequence.forEach(type => assert(palette.includes(type)));
      r.currentLateRngAfter.forEach(value => number(value, 0, 4294967295));
    }
  }
}

async function verifyEarnedExports(exports, earnedRuns, {read, sha}) {
  assert.equal(exports.length, 4);
  const keys = exports.map(r => `${r.name}/${r.speed}/${r.seed}`);
  assert.deepEqual([...keys].sort(), seeds.flatMap(seed => [1, 2].map(speed => `late-earned/${speed}/${seed}`)).sort());
  for (const record of exports) {
    fields(record, {name: 'late-earned', actualEarnedFlags: 8, syntheticStartingFixture: false});
    const run = earnedRuns.find(row => row.speed === record.speed && row.seed === record.seed);
    assert(run && run.exportedActualEarnedEight && run.actualFlagsCleared === 12);
    const names = ['earned-flag-8.v4', 'earned-flag-8-profile.dat', 'earned-flag-8-metadata.json'];
    assert.deepEqual(Object.keys(record.files).sort(), [...names].sort());
    const folder = `tests/endless3-earned-checkpoints/late-earned-${record.speed}x-${record.seed}/`;
    for (const name of names) {
      const pin = record.files[name], bytes = await read(folder + name);
      number(pin.bytes, 1); digest(pin.sha256);
      assert.equal(bytes.length, pin.bytes); assert.equal(sha(bytes), pin.sha256);
    }
    const metadata = jsonOf(await read(folder + 'earned-flag-8-metadata.json'));
    fields(metadata, {actualEarnedFlags: 8, nativeBest: 8, syntheticStartingFixture: false,
      postStartHPActorStageRNGEdits: false, board: 'earned-flag-8.v4', profile: 'earned-flag-8-profile.dat'});
    number(metadata.profileId, 1);
  }
}

async function verifyEarlyEquivalence(evidence, {read, sha}) {
  fields(evidence, {execution: 'dual-header-native-comparison', parentRulesVersion: 2,
    currentRulesVersion: 3, formationSamples: 480, supplyBoardSamples: 24,
    formationIntervals: [2200, 2000, 1800, 1700, 1600, 1500],
    supplyIntervals: [400, 400, 400, 400, 400, 425, 425, 500, 500, 1000, 1000]});
  const observations = [];
  for (const [kind, rules] of [['parent', 2], ['current', 3]]) {
    const logPath = `tests/endless3-late-logs/${kind}-early-equivalence-1x-1729.log`;
    const probe = evidence[kind + 'Probe'];
    await verifyProgressionCaseLog(probe, {read, sha, logPath});
    assert.equal(probe.boundarySyncCount, 0);
    const bytes = await read(logPath);
    const lines = textOf(bytes).split(/\r?\n/).filter(line => line.startsWith(resultPrefix));
    assert.equal(lines.length, 1);
    const row = JSON.parse(lines[0].slice(resultPrefix.length));
    fields(row, {execution: 'complete-production-engine', name: 'early-equivalence', rulesVersion: rules,
      syntheticStartingFixture: true, countedEarnedFlags: 0, formationSamples: 480,
      authoredActorsAcrossSamples: 2816, supplyBoardSamples: 24,
      formationIntervals: [2200, 2000, 1800, 1700, 1600, 1500],
      supplyIntervals: [400, 400, 400, 400, 400, 425, 425, 500, 500, 1000, 1000]});
    assert.equal(row.formations.length, 480);
    let index = 0, actors = 0;
    const totals = [37, 47, 57, 67, 67, 77];
    for (let flag = 0; flag < 6; flag++) for (let variation = 0; variation < 8; variation++) {
      let flagActors = 0;
      for (let wave = 0; wave < 10; wave++) {
        const tuple = row.formations[index++];
        assert.equal(tuple.length, 4);
        assert.deepEqual(tuple.slice(0, 3), [flag, variation, wave]);
        for (const actor of tuple[3]) {
          assert.equal(actor.length, 3);
          number(actor[0], 0, 33); number(actor[1], 0, 5); number(actor[2], 800, 880);
          flagActors++; actors++;
        }
      }
      assert.equal(flagActors, totals[flag]);
    }
    assert.equal(actors, 2816);
    assert.equal(row.supplyWeights.length, 24);
    index = 0;
    for (let layout = 0; layout < 4; layout++) for (let flag = 0; flag < 6; flag++) {
      const tuple = row.supplyWeights[index++];
      assert.equal(tuple.length, 3); assert.deepEqual(tuple.slice(0, 2), [layout, flag]);
      assert.equal(tuple[2].length, 10); tuple[2].forEach(value => number(value, 0, 26));
    }
    assert.equal(sha(Buffer.from(JSON.stringify(row.formations))), evidence.formationDigestSha256);
    assert.equal(sha(Buffer.from(JSON.stringify(row.supplyWeights))), evidence.supplyWeightsDigestSha256);
    observations.push(row);
  }
  for (const field of ['formations', 'supplyWeights', 'formationIntervals', 'supplyIntervals'])
    assert.deepEqual(observations[0][field], observations[1][field], 'Both actual engines agree, not merely the same reported totals: ' + field);
}

async function verifyInputMap(map, names, {read, sha}) {
  assert.deepEqual(Object.keys(map).sort(), [...names].sort(), 'Exact test-only input inventory');
  for (const [name, pin] of Object.entries(map)) {
    digest(pin); assert.equal(sha(await read('tests/' + safeName(name))), pin, 'Current test input bytes: ' + name);
  }
}

async function verifyArtifacts(map, prefix, {read, sha}) {
  assert.deepEqual(Object.keys(map).sort(), [prefix + '-engine.js', prefix + '-engine.wasm']);
  for (const [name, pin] of Object.entries(map)) {
    digest(pin); assert.equal(sha(await read('tests/' + name)), pin, 'Actual executed backend bytes');
  }
  assert(WebAssembly.validate(await read('tests/' + prefix + '-engine.wasm')));
}

async function verifyComparator(build, reference, {read, sha}) {
  fields(build, {execution: 'complete-production-engine', optimization: 'O2', productionObjectCount: 134,
    parentEngine: true, productionBuildReceiptSha256: reference.productionBuildReceiptSha256,
    parentReferenceSha256: knownFixturePins['endless3-parent-reference.json'],
    parentBaseHarnessSha256: reference.parentBaseHarnessSha256});
  assert.deepEqual(build.sourceSha256, reference.sourceSha256, 'Comparator links the actual published parent production sources');
  assert.deepEqual(build.productionObjectSha256, reference.productionObjectSha256,
    'Comparator links every actual published parent object, not current rules under an old label');
  await verifyInputMap(build.testInputSha256, ['pool-panic-endless-ordinary-policy.h',
    'endless3-late-policy.h', 'endless3-late-actions.h', 'endless3-early-equivalence.h',
    'endless3-parent-migration-factory.h', 'endless3-migration-controls.h', 'endless3-parent-reference.json',
    'endless3-parent-base-harness.snapshot.cpp', 'endless3-parent-ordinary-policy.snapshot.h',
    'endless3-established-layout.json'], {read, sha});
  assert.equal(sha(await read('tests/build-endless3-late.py')), build.builderSha256);
  const fragment = await read('tests/endless3-parent-fragment.snapshot.cpp');
  assert.equal(sha(fragment), build.fragmentSnapshotSha256);
  assert.equal(textOf(fragment).replace(/\r\n?/g, '\n'),
    textOf(await read('tests/endless3-late-fragment.cpp')).replace(/\r\n?/g, '\n'),
    'The comparator fragment is independently frozen by the current CLI input map');
  const generated = await read('tests/endless3-parent-harness.generated.cpp');
  assert.equal(sha(generated), build.generatedHarnessSha256);
  const base = textOf(await read('tests/' + reference.parentBaseHarnessSnapshot)).replace(/\r\n?/g, '\n');
  const main = base.lastIndexOf('int main(int argc');
  assert(main > 0, 'Historical native entry-point scaffold exists');
  assert.equal(textOf(generated).replace(/\r\n?/g, '\n'),
    base.slice(0, main) + textOf(fragment).replace(/\r\n?/g, '\n'),
    'The comparator is exactly the published native scaffold plus its authenticated test-only fragment');
  await verifyArtifacts(build.testArtifactSha256, 'endless3-parent', {read, sha});
}

async function verifyMigrationFactory(factory, {read, sha}) {
  await verifyProgressionCaseLog(factory, {read, sha,
    logPath: 'tests/endless3-late-logs/parent-migration-factory-1x-1729.log'});
  fields(factory, {producerEngine: '0.2.6-web-endless.2', producerRules: 2,
    actualNativeV4AndProfile: true, syntheticStartingFixtures: true, countedEarnedFlags: 0,
    boundarySyncCount: 0, resourceCapacityWarnings: 0});
  const metadata = jsonOf(await read('tests/endless2-migration-metadata.json'));
  const {boundarySyncs, boundarySyncCount, logSha256, resourceCapacityWarnings, ...raw} = factory;
  assert.deepEqual(raw, metadata, 'Portable native migration metadata is emitted by the actual old engine');
  for (const kind of ['early', 'backlog']) {
    const state = metadata[kind];
    fields(state, {file: `endless2-migration-${kind}.v4`, graphFile: `endless2-migration-${kind}.graph.txt`,
      profileFile: `endless2-migration-${kind}-profile.dat`, nativeProfileId: 1, rules: 2,
      stage: kind === 'early' ? 0 : 8, packetQuotaUsed: 6, plants: 10,
      plantHP: 10700, zombies: 2, zombieHP: 858, mowers: 6});
    for (const key of ['file', 'graphFile', 'profileFile']) {
      safeName(state[key]); assert((await read('tests/' + state[key])).length > 0);
    }
  }
  return metadata;
}

async function verifyFactoryReproduction(evidence, {read, sha}) {
  fields(evidence, {excludedBoardFields: [89, 90]});
  const boards = ['early', 'backlog'].map(kind => `endless2-migration-${kind}.v4`);
  assert.deepEqual(Object.keys(evidence.files).sort(), [...boards].sort());
  for (const name of boards) {
    const fresh = await read('tests/endless3-factory-reproduction/' + name);
    const original = await read('tests/' + name), record = evidence.files[name];
    assert.equal(fresh.length, record.bytes); assert.equal(sha(fresh), record.sha256);
    const freshComparison = normalizeNativeFactorySave(fresh), originalComparison = normalizeNativeFactorySave(original);
    assert.deepEqual(freshComparison, originalComparison,
      'Every native save byte except the two proven typed clock diagnostics must reproduce exactly');
    assert.equal(sha(freshComparison), record.normalizedSha256);
  }
  const companions = ['early', 'backlog'].flatMap(kind => ['.graph.txt', '-profile.dat']
    .map(suffix => `endless2-migration-${kind}${suffix}`)).concat('endless2-migration-metadata.json');
  assert.deepEqual(Object.keys(evidence.exactCompanionFilesSha256).sort(), [...companions].sort());
  for (const name of companions) {
    const fresh = await read('tests/endless3-factory-reproduction/' + name), original = await read('tests/' + name);
    assert.deepEqual(Buffer.from(fresh), Buffer.from(original), 'Full native graphs/profiles/RNG metadata remain raw-byte exact');
    assert.equal(sha(fresh), evidence.exactCompanionFilesSha256[name]);
  }
}

async function verifyBasePrefixReuse(report, build, {read, sha, productionBuildBytes}) {
  if (!Object.hasOwn(report, 'basePrefixReuse')) return;
  const reuse = report.basePrefixReuse;
  fields(reuse, {performed: true, reexecuted: false,
    checkpointSeal: 'endless3-attempt1-native-seal.json',
    checkpointSealSha256: 'fb62b155e119aaf8cb5b6433aacc2baa54b3b144c7a04acf9f9306d0d4854676',
    originalContractSha256: 'd8d1b19485bd6a343c81547b0083ec52938e543ac927c3fb0263fb7d234e6e9f',
    sourceArtifactAndPolicyInputsUnchanged: true});
  const bytes = await read('tests/' + reuse.checkpointSeal);
  assert.equal(sha(bytes), reuse.checkpointSealSha256);
  const seal = jsonOf(bytes);
  fields(seal, {schemaVersion: 1, originalContractSha256: reuse.originalContractSha256,
    originalMainRunnerSha256: '4f5d3a97fd43b74ac7c02fa96d39c635b9831cca855b129642f3168d3af194b0',
    originalLateRunnerSha256: '5b2bc206ec88b39987451c4591331bfe333905f506de9d7efc9dbd2c64127c5a',
    originalNodeScriptSha256: '3ba0698ea4029891926f9acd99244f9b25f7325846fbaa5d8a0e6a2d16c49966',
    originalCommand: ['python', 'tests/test-pool-panic-endless.py', '--native', '--asset-root',
      '../../plants-vs-zombies-web-release/dist/game-assets', '--jobs', '2']});
  for (const key of ['originalMainRunnerSha256', 'originalLateRunnerSha256', 'originalNodeScriptSha256'])
    assert.equal(reuse[key], seal[key]);
  for (const key of ['productionBuildReceiptSha256', 'sourceSha256', 'productionObjectSha256',
    'testArtifactSha256', 'testInputSha256', 'generatedHarnessSha256', 'builderSha256'])
    assert.deepEqual(seal[key], build[key], 'Reused base32 has exactly the current frozen source, objects, binary and seven policy inputs: ' + key);
  assert.equal(seal.productionBuildReceiptSha256, sha(productionBuildBytes));
  assert.equal(seal.assetBundleId, report.assetBundleId);
  assert.equal(seal.assetFixtureSha256, report.assetFixtureSha256);
  assert.equal(seal.assetFixtureSha256, sha(await read('tests/pool-panic-endless-assets.json')));
  assert.equal(Object.keys(seal.archivedFilesSha256).length, 76);
  for (const [name, pin] of Object.entries(seal.archivedFilesSha256)) {
    assert(name.startsWith('endless3-attempt1-native/')); safeName(name); digest(pin);
    assert.equal(sha(await read('tests/' + name)), pin, 'Sealed original attempted-run evidence');
  }
  const folder = 'tests/endless3-attempt1-native/';
  assert.deepEqual(jsonOf(await read(folder + 'pool-panic-endless-build.json')), build);
  assert.equal(sha(await read(folder + 'build-result.json')), sha(productionBuildBytes));
  assert.equal(sha(await read(folder + 'endless3-verification-contract.json')), seal.originalContractSha256);
  for (const [name, pin] of Object.entries(seal.testInputSha256))
    assert.equal(sha(await read(folder + 'inputs/' + name)), pin);
  for (const label of ['before', 'after']) {
    const source = jsonOf(await read(folder + 'source-' + label + '.json'));
    assert.deepEqual(Object.fromEntries(Object.entries(source).map(([name, pin]) => ['source/' + name, pin])), build.sourceSha256);
  }
  for (const [name, pin] of [['test-pool-panic-endless.py', seal.originalMainRunnerSha256],
    ['test-endless3-late.py', seal.originalLateRunnerSha256]]) assert.equal(sha(await read(folder + name)), pin);
  const script = text => {
    const match = text.replace(/\r\n?/g, '\n').match(/NODE_SCRIPT=r'''([\s\S]*?)'''/);
    assert(match, 'Original native Node invocation wrapper is explicit'); return Buffer.from(match[1]);
  };
  assert.equal(sha(script(textOf(await read(folder + 'test-pool-panic-endless.py')))), seal.originalNodeScriptSha256);
  assert.equal(sha(script(textOf(await read('tests/test-pool-panic-endless.py')))), seal.originalNodeScriptSha256);
  const before = textOf(await read(folder + 'test-pool-panic-endless.py')).replace(/\r\n?/g, '\n');
  const after = textOf(await read('tests/test-pool-panic-endless.py')).replace(/\r\n?/g, '\n');
  const start = 'def validate_prefix(', oldEnd = 'def validate_report(', newEnd = 'def validate_base_report(';
  assert(before.indexOf(start) >= 0 && after.indexOf(start) >= 0 && before.indexOf(oldEnd) > before.indexOf(start)
    && after.indexOf(newEnd) > after.indexOf(start));
  assert.equal(before.slice(before.indexOf(start), before.indexOf(oldEnd)),
    after.slice(after.indexOf(start), after.indexOf(newEnd)), 'Every original native case assertion remains exact');
  assert.match(textOf(await read(folder + 'full-native-failure.log')),
    /Final parent factory did not reproduce frozen native fixture endless2-migration-early\.v4/);
  const rows = [...report.scenarios, ...report.openingCorpus];
  assert.equal(rows.length, 32);
  for (const row of rows) {
    const name = `${row.name}-${row.speed}x-${row.seed}.log`;
    await verifyProgressionCaseLog(row, {read, sha, logPath: folder + 'logs/' + name});
    assert.deepEqual(Buffer.from(await read('tests/pool-panic-endless-logs/' + name)),
      Buffer.from(await read(folder + 'logs/' + name)), 'Reused outcomes are those actual already-executed native cases');
  }
  assert.equal(report.openingCorpusSeedScan.length, 28);
  const firstSeeds = new Map();
  for (let index = 0; index < 28; index++) {
    const seed = 100 + index, raw = textOf(await read(folder + `logs/variation-probe-1x-${seed}.log`));
    const lines = raw.split(/\r?\n/).filter(line => line.startsWith(resultPrefix)); assert.equal(lines.length, 1);
    const probe = JSON.parse(lines[0].slice(resultPrefix.length));
    fields(probe, {execution: 'pre-game-variation-scan', seed, preGameSeedOnly: true});
    number(probe.variation, 0, 7);
    assert.deepEqual(report.openingCorpusSeedScan[index], {seed, variation: probe.variation, preGameSeedOnly: true});
    if (!firstSeeds.has(probe.variation)) firstSeeds.set(probe.variation, seed);
    if (index < 27) assert(firstSeeds.size < 8);
  }
  assert.equal(firstSeeds.size, 8);
  for (const row of report.openingCorpus) assert.equal(row.seed, firstSeeds.get(row.nativeVariation));
}

async function bindBackend(build, {read, sha, fullRunReport, productionBuildBytes}) {
  fields(build, {execution: 'complete-production-engine', optimization: 'O2', productionObjectCount: CURRENT_OBJECT_COUNT});
  assert.equal(build.productionBuildReceiptSha256, sha(productionBuildBytes));
  assert.equal(Object.keys(build.sourceSha256).length, CURRENT_SOURCE_COUNT);
  assert.deepEqual(build.sourceSha256, fullRunReport.sourceSha256);
  assert.equal(Object.keys(build.productionObjectSha256).length, CURRENT_OBJECT_COUNT);
  assert.deepEqual(build.productionObjectSha256, fullRunReport.productionObjectSha256);
  for (const [path, pin] of Object.entries(build.sourceSha256)) {
    assert(path.startsWith('source/')); digest(pin);
    assert.equal(sha(await read(safeName(path))), pin, 'Current source byte binding');
  }
  for (const pin of Object.values(build.productionObjectSha256)) digest(pin);
}

export async function verifyPublishedParentReference({read, parentRead, sha, engine, parentProductionBuildBytes}) {
  assert.equal(engine.id, CURRENT_ENGINE_ID);
  const historyEngine = historicalEngine(engine, ENDLESS3_ENGINE_ID);
  assert.equal(historyEngine.id, ENDLESS3_ENGINE_ID);
  const bytes = await read('tests/endless3-parent-reference.json');
  assert.equal(sha(bytes), knownFixturePins['endless3-parent-reference.json']);
  const reference = jsonOf(bytes);
  fields(reference, {schema: 1, parentEngineId: '0.2.6-web-endless.2',
    parentArchiveSha256: 'b9095c65547c3d013917ae4188e284f18eabb71a98020ca3d53f71f7365f9566',
    parentArchiveBytes: 40424282, parentArchiveEntries: 1076, parentArchivePrefix: 'endless2-candidate/',
    productionSourceFiles: 852, productionObjectCount: 134,
    productionBuildReceiptSha256: 'c73cb555c339c00e51378b88f23f6e648c9a9f677df0fc3edc4d0d4ed315094a',
    parentBaseHarnessSha256: 'c598089df0689497076e24b6be046ba65cc9e5bd9fb83ce5838cbea53f005c32',
    parentBaseHarnessSnapshot: 'endless3-parent-base-harness.snapshot.cpp',
    ordinaryPolicySha256: '61550c6b99cb5ba5868bb3bcd2972fd0d8967a6599b815b7628b645ad3aa5e00',
    ordinaryPolicySnapshot: 'endless3-parent-ordinary-policy.snapshot.h',
    publishedBackendReceiptSha256: 'd5d9a12d18d6a0287871f0f97154afb6980cdb7946bd913f33fd2c54dd228c27'});
  assert.equal(historyEngine.parent.id, reference.parentEngineId);
  assert.equal(historyEngine.parent.artifacts.sourceSha256, reference.parentArchiveSha256);
  const actualReceiptBytes = await parentRead('logs/build-result.json');
  assert.equal(sha(actualReceiptBytes), reference.productionBuildReceiptSha256);
  assert.equal(sha(parentProductionBuildBytes), reference.productionBuildReceiptSha256);
  assert.deepEqual(Buffer.from(actualReceiptBytes), Buffer.from(parentProductionBuildBytes));
  assert.deepEqual(reference.productionBuildReceipt, jsonOf(actualReceiptBytes));
  fields(reference.productionBuildReceipt, {status: 'PASS', exitCode: 0, sourceFiles: 852, sourceUnchangedDuringBuild: true});
  const publishedBuildBytes = await parentRead('tests/pool-panic-endless-build.json');
  assert.equal(sha(publishedBuildBytes), reference.publishedBackendReceiptSha256);
  const publishedBuild = jsonOf(publishedBuildBytes);
  fields(publishedBuild, {execution: 'complete-production-engine', optimization: 'O2', productionObjectCount: 134});
  assert.equal(publishedBuild.productionBuildReceiptSha256, reference.productionBuildReceiptSha256);
  assert.equal(Object.keys(reference.sourceSha256).length, 852);
  assert.deepEqual(reference.sourceSha256, publishedBuild.sourceSha256);
  assert.equal(Object.keys(reference.productionObjectSha256).length, 134);
  assert.deepEqual(reference.productionObjectSha256, publishedBuild.productionObjectSha256);
  for (const [path, pin] of Object.entries(reference.sourceSha256)) {
    assert(path.startsWith('source/')); digest(pin);
    assert.equal(sha(await parentRead(safeName(path))), pin, 'Authenticate every source byte against the nested published .2 archive');
  }
  for (const pin of Object.values(reference.productionObjectSha256)) digest(pin);
  for (const snapshot of ['source-before.json', 'source-after.json']) {
    const source = jsonOf(await parentRead('logs/' + snapshot));
    assert.deepEqual(Object.fromEntries(Object.entries(source).map(([path, pin]) => ['source/' + path, pin])), reference.sourceSha256);
  }
  for (const [parentName, snapshotName, pin] of [
    ['pool-panic-endless-harness.cpp', reference.parentBaseHarnessSnapshot, reference.parentBaseHarnessSha256],
    ['pool-panic-endless-ordinary-policy.h', reference.ordinaryPolicySnapshot, reference.ordinaryPolicySha256],
  ]) {
    const historical = await parentRead('tests/' + parentName), packaged = await read('tests/' + snapshotName);
    assert.equal(sha(historical), pin); assert.equal(sha(packaged), pin);
    assert.deepEqual(Buffer.from(packaged), Buffer.from(historical), 'Portable parent scaffold must be actual historical bytes');
  }
  assert.deepEqual(reference.publishedBackendArtifactSha256, publishedBuild.testArtifactSha256);
  assert.equal(reference.publishedBackendBuilderSha256, publishedBuild.builderSha256);
  assert.equal(sha(await parentRead('tests/build-pool-panic-endless.py')), reference.publishedBackendBuilderSha256);
  assert.deepEqual(reference.publishedBackendTestInputSha256, publishedBuild.testInputSha256);
  assert.deepEqual(reference.publishedBackendTestInputSha256,
    {'pool-panic-endless-ordinary-policy.h': reference.ordinaryPolicySha256});
  assert.deepEqual(Object.keys(reference.publishedBackendArtifactSha256).sort(),
    ['pool-panic-endless-engine.js', 'pool-panic-endless-engine.wasm']);
  for (const [path, pin] of Object.entries(reference.publishedBackendArtifactSha256)) {
    digest(pin); assert.equal(sha(await parentRead('tests/' + path)), pin);
  }
  assert(WebAssembly.validate(await parentRead('tests/pool-panic-endless-engine.wasm')));
  return reference;
}

export async function verifyEndlessRetentionAdapter({report, read, sha}) {
  const bytes = await read('tests/double1-endless-retention.json');
  assert.equal(sha(bytes), CURRENT_ENDLESS_RETENTION_SHA256, 'Independently pinned current execution-envelope adapter');
  const adapter = jsonOf(bytes);
  fields(adapter, {schemaVersion: 1, engineId: CURRENT_ENGINE_ID, historicalContractSha256: finalContractPin,
    productionSourceFiles: CURRENT_SOURCE_COUNT, productionObjectCount: CURRENT_OBJECT_COUNT, freshAllCasesRequired: true,
    parentEngineId:TORCH_ENGINE_ID,parentArchiveSha256:TORCH_ARCHIVE_SHA256});
  await verifyPublishedTorchAdapter({read,sha,adapter,family:'endless'});
  assert.equal(report.retentionAdapterSha256, CURRENT_ENDLESS_RETENTION_SHA256);
  assert.equal(report.lateGame.retentionAdapterSha256, CURRENT_ENDLESS_RETENTION_SHA256);
  assert(!Object.hasOwn(report, 'basePrefixReuse'), 'Every current opening and late native case must execute freshly');
  const retained = await verifyRetainedParentInputs({read, sha});
  const ambushRetained=await verifyTorchRetainedParentInputs({read,sha});
  const ambushAdapterBytes=await read('tests/ambush1-endless-retention.json');
  assert.equal(sha(ambushAdapterBytes),AMBUSH_ENDLESS_RETENTION_SHA256);
  assert.equal(adapter.publishedAmbushAdapterSha256,AMBUSH_ENDLESS_RETENTION_SHA256);
  assert.equal(ambushRetained.files['ambush1-endless-retention.json'].sha256,AMBUSH_ENDLESS_RETENTION_SHA256);
  const ambushAdapter=jsonOf(ambushAdapterBytes);
  fields(ambushAdapter,{schemaVersion:1,engineId:AMBUSH_ENGINE_ID,historicalContractSha256:finalContractPin,
    productionSourceFiles:860,productionObjectCount:138,freshAllCasesRequired:true});
  for(const runner of ['test-endless3-late.py','test-pool-panic-endless.py'])
    assert.equal(ambushAdapter.runnerSha256[runner],ambushRetained.files[runner].sha256);
  const publishedBytes = await read('tests/scrap1-endless-retention.json');
  assert.equal(sha(publishedBytes), SCRAP_ENDLESS_RETENTION_SHA256,
    'The published Scrap execution envelope is retained byte exactly');
  assert.equal(adapter.publishedScrapAdapterSha256, SCRAP_ENDLESS_RETENTION_SHA256);
  assert.equal(retained.files['scrap1-endless-retention.json'].sha256, SCRAP_ENDLESS_RETENTION_SHA256);
  const published = jsonOf(publishedBytes);
  fields(published, {schemaVersion: 1, engineId: SCRAP_ENGINE_ID, historicalContractSha256: finalContractPin,
    productionSourceFiles: 856, productionObjectCount: 136, freshAllCasesRequired: true});
  const contractBytes = await read('tests/endless3-verification-contract.json');
  assert.equal(sha(contractBytes), finalContractPin, 'The original progression contract is retained byte exactly');
  const contract = jsonOf(contractBytes), runners = ['test-endless3-late.py', 'test-pool-panic-endless.py'];
  assert.deepEqual(Object.keys(adapter.runnerSha256).sort(), runners);
  assert.deepEqual(Object.keys(adapter.historicalRunners).sort(), runners);
  assert.deepEqual(Object.keys(published.runnerSha256).sort(), runners);
  assert.deepEqual(adapter.historicalRunners, published.historicalRunners,
    'The historical Endless.3 runners are not rewritten for another current engine');
  assert.deepEqual(adapter.historicalRunners, {
    'test-pool-panic-endless.py': {snapshot: 'scrap1-retained-base-runner.snapshot.py',
      sha256: '39a7a8487081bcca42d71660de9e99a924e6ad1ee9a16fd3f9e07eaef66a3a51'},
    'test-endless3-late.py': {snapshot: 'scrap1-retained-late-runner.snapshot.py',
      sha256: '246c6d6eadb0f050547ef3fca29de7bd2811daac35495f85313d8c0cd66f3d7f'},
  });
  for (const name of runners) {
    const pin = adapter.runnerSha256[name], historical = adapter.historicalRunners[name];
    digest(pin); assert.equal(sha(await read('tests/' + name)), pin, 'Current execution envelope is exactly the reviewed runner: ' + name);
    assert.equal(published.runnerSha256[name], retained.files[name].sha256,
      'Published Scrap runner bytes stay independently authenticated: ' + name);
    assert.equal(historical.sha256, contract.fixtureSha256[name], 'Original runner remains authenticated by the frozen contract');
    assert.equal(sha(await read('tests/' + safeName(historical.snapshot))), historical.sha256,
      'Retain every byte of the published runner and its original assertions: ' + name);
  }
  const fixtures = {...contract.fixtureSha256, ...adapter.runnerSha256};
  assert.deepEqual(Object.keys(fixtures).sort(), Object.keys(contract.fixtureSha256).sort());
  assert.deepEqual(Object.keys(fixtures).filter(name => fixtures[name] !== contract.fixtureSha256[name]).sort(), runners,
    'Only the two current Python runner pins overlay the original frozen fixture inventory');
  return fixtures;
}

export async function verifyPoolPanicEndlessProgression({report, read, sha, engine, fullRunReport,
  productionBuildBytes, parentRead, parentProductionBuildBytes}) {
  assert.equal(engine.id, CURRENT_ENGINE_ID);
  const historyEngine = historicalEngine(engine, ENDLESS3_ENGINE_ID);
  assert.equal(historyEngine.id, ENDLESS3_ENGINE_ID);
  assert.equal(historyEngine.parent.id, '0.2.6-web-endless.2');
  assert(!Object.hasOwn(report, 'basePrefixReuse'), 'The current release must freshly execute every retained Endless native case');
  fields(report, {execution: 'complete-production-engine', optimization: 'O2', failures: 0, exitCode: 0});
  assert.match(report.status, /^PASS/);
  assert(report.lateGame && typeof report.lateGame === 'object', 'Final lateGame evidence is required');
  assert.equal(typeof parentRead, 'function', 'Authenticate the comparator against the actual nested published .2 archive');
  for (const [path, pin] of Object.entries(knownFixturePins)) assert.equal(sha(await read('tests/' + path)), pin);
  const reference = await verifyPublishedParentReference({read, parentRead, sha, engine, parentProductionBuildBytes});
  digest(finalContractPin);
  const contractBytes = await read('tests/endless3-verification-contract.json');
  assert.equal(sha(contractBytes), finalContractPin, 'Independently frozen progression contract');
  const contract = jsonOf(contractBytes), late = report.lateGame;
  fields(contract, {schemaVersion: 1, engineId: '0.2.6-web-endless.3', rulesVersion: 3,
    historicalBaseContractSha256: '58e2d59fdcf9ad2c0cae93cbfb3781a79c8924419a8d2611676c8348ff94df2e',
    nativeArtInputs: 746, nativeArtFixture: 'endless3-native-art-inputs.json', authenticationObservations: 1490});
  assert.equal(contract.previousContractAttemptSha256, knownFixturePins['endless3-verification-contract-attempt1.json']);
  assert.deepEqual(contract.factoryReproduction, {originalSevenPinnedFixturesUnchanged: true,
    normalizedBoardFields: [{id: 89, name: 'mPreloadTime', bytes: 4}, {id: 90, name: 'mGameID', bytes: 8}],
    nativeHeaderCRCAllChunksRequired: true, allOtherBytesExact: true, originalGraphProfileMetadataExact: true,
    amendment: 'endless3-factory-assertion-amendment.json',
    amendmentSha256: knownFixturePins['endless3-factory-assertion-amendment.json']});
  assert.deepEqual(contract.localBasePrefixReuse, {allowed: true, seal: 'endless3-attempt1-native-seal.json',
    sealSha256: knownFixturePins['endless3-attempt1-native-seal.json'], completedNativeCases: 32, actualScanRows: 28,
    gameEngineHarnessSevenInputsAssetSourceMustBeExact: true, originalAssertionsAndParityMustBeExact: true,
    reexecutedClaimAllowed: false, ciDefaultNativeMustExecuteAll32And28Fresh: true});
  fields(late, {schemaVersion: 1, rulesVersion: 3, status: 'PASS', contractSha256: finalContractPin,
    parentReferenceSha256: knownFixturePins['endless3-parent-reference.json'],
    earnedFlagCount: 48, syntheticEarnedFlagCount: 0});
  const retainedFixturePins = await verifyEndlessRetentionAdapter({report, read, sha});
  assert.deepEqual(late.fixtureSha256, retainedFixturePins);
  for (const [path, pin] of Object.entries(late.fixtureSha256)) {
    safeName(path); digest(pin); assert.equal(sha(await read('tests/' + path)), pin, 'Final frozen fixture: ' + path);
  }
  for (const [path, pin] of Object.entries(knownFixturePins)) assert.equal(late.fixtureSha256[path], pin);
  for (const name of ['pool-panic-endless-native-art-inputs.json',
    'endless3-native-art-inputs.json', 'endless3-established-layout-original-study.json', 'endless2-migration-metadata.json',
    ...['early', 'backlog'].flatMap(kind => ['.v4', '.graph.txt', '-profile.dat'].map(suffix => `endless2-migration-${kind}${suffix}`))])
    digest(late.fixtureSha256[name]);
  const artBytes = await read('tests/endless3-native-art-inputs.json'), art = jsonOf(artBytes);
  assert.equal(sha(artBytes), late.nativeArtFixtureSha256);
  fields(art, {assetBundleId: engine.assetBundleId,
    mainPakSha256: '5878326408285cb01f83b4fa4edcc66d65e727f6d6ee88563b5b3b287dd259fc'});
  assert.equal(Object.keys(art.sourceInputs).length, late.nativeArtInputs);
  assert.equal(late.nativeArtInputs, contract.nativeArtInputs);
  assert.equal(late.nativeArtInputs, 746);
  const originalArt = jsonOf(await read('tests/pool-panic-endless-native-art-inputs.json'));
  assert.equal(Object.keys(originalArt.sourceInputs).length, 643);
  for (const [path, pin] of Object.entries(originalArt.sourceInputs)) assert.deepEqual(art.sourceInputs[path], pin,
    'Original native inputs remain byte-identical in the expanded resource audit');
  for (const [path, pin] of Object.entries(art.sourceInputs)) {
    safeName(path); number(pin.bytes, 1); digest(pin.sha256);
  }

  const buildBytes = await read('tests/pool-panic-endless-build.json'), build = jsonOf(buildBytes);
  await bindBackend(build, {read, sha, fullRunReport, productionBuildBytes});
  await verifyInputMap(build.testInputSha256, ['pool-panic-endless-ordinary-policy.h',
    'endless3-late-fragment.cpp', 'endless3-late-policy.h', 'endless3-late-actions.h',
    'endless3-narrow-controls.h', 'endless3-early-equivalence.h', 'endless3-migration-controls.h'], {read, sha});
  assert.deepEqual(contract.currentPolicyInputs, build.testInputSha256,
    'The independently frozen contract authenticates the actual final current player/controller inputs');
  assert.equal(build.testInputSha256['pool-panic-endless-ordinary-policy.h'], reference.ordinaryPolicySha256,
    'All first-six ordinary player choices remain the published policy');
  assert.equal(sha(await read('tests/build-pool-panic-endless.py')), build.builderSha256);
  assert.equal(sha(await read('tests/pool-panic-endless-harness.cpp')), build.generatedHarnessSha256);
  await verifyArtifacts(build.testArtifactSha256, 'pool-panic-endless', {read, sha});
  await verifyBasePrefixReuse(report, build, {read, sha, productionBuildBytes});
  for (const field of ['sourceSha256', 'productionObjectSha256', 'testArtifactSha256', 'testInputSha256']) {
    assert.deepEqual(late[field], build[field]);
    assert.deepEqual(report[field], build[field]);
  }
  assert.equal(late.normalBuildReceiptSha256, sha(productionBuildBytes));
  assert.equal(late.buildReceiptSha256, sha(buildBytes));
  assert.equal(late.runnerSha256, sha(await read('tests/test-endless3-late.py')));
  const parentBuildBytes = await read('tests/endless3-parent-build.json'), parentBuild = jsonOf(parentBuildBytes);
  await verifyComparator(parentBuild, reference, {read, sha});
  assert.deepEqual(contract.parentTestInputs, parentBuild.testInputSha256);
  assert.equal(late.parentBuildReceiptSha256, sha(parentBuildBytes));
  assert.deepEqual(late.parentTestArtifactSha256, parentBuild.testArtifactSha256);

  const metadata = await verifyMigrationFactory(late.migrationFactory, {read, sha});
  await verifyFactoryReproduction(late.migrationFactoryReproduction, {read, sha});
  const matrices = [
    ['earnedRuns', seeds.flatMap(seed => [1, 2].map(speed => ['late-earned', speed, seed]))],
    ['syntheticWindows', milestones.flatMap(flag => ['passive', 'maintain'].flatMap(policy =>
      seeds.map(seed => [`late-${policy}-${flag}`, 1, seed])))],
    ['parentWindows', [12, 20].flatMap(flag => seeds.map(seed => [`baseline-passive-${flag}`, 1, seed]))],
    ['narrowControls', [['late-narrow-controls', 1, 1729], ['late-narrow-controls', 2, 7331]]],
    ['migrationControls', [['late-migration-controls', 1, 1729], ['late-migration-controls', 2, 7331]]],
  ];
  const allRows = [], key = row => `${row.name}/${row.speed}/${row.seed}`;
  assert.deepEqual(contract.matrices, Object.fromEntries(matrices.map(([group, matrix]) =>
    [({earnedRuns: 'earned', syntheticWindows: 'windows', parentWindows: 'parentWindows',
      narrowControls: 'narrow', migrationControls: 'migration'})[group], matrix])));
  for (const [group, matrix] of matrices) {
    const rows = late[group];
    assert(Array.isArray(rows)); assert.equal(rows.length, matrix.length);
    assert.deepEqual(rows.map(key).sort(), matrix.map(([name, speed, seed]) => key({name, speed, seed})).sort(),
      'Exact independent late matrix: ' + group);
    for (const row of rows) {
      const {name, speed, seed} = row;
      if (group === 'earnedRuns') validateProgressionEarned(row, {speed, seed});
      else if (group === 'narrowControls') validateProgressionNarrow(row, {speed, seed});
      else if (group === 'migrationControls') validateProgressionMigration(row, {speed, seed, metadata});
      else validateProgressionWindow(row, {name, speed, seed, flag: Number(name.split('-').at(-1)), parent: group === 'parentWindows'});
      number(row.checks, 101);
      await verifyProgressionCaseLog(row, {read, sha, logPath: `tests/endless3-late-logs/${name}-${speed}x-${seed}.log`});
      if (!['narrowControls', 'migrationControls'].includes(group)) assert.equal(row.boundarySyncCount, row.actualFlagsCleared);
      allRows.push(row);
    }
  }
  assert.equal(allRows.reduce((sum, row) => sum + row.countedEarnedFlags, 0), 48);
  assert.equal(late.syntheticWindows.concat(late.parentWindows, late.narrowControls, late.migrationControls)
    .reduce((sum, row) => sum + row.countedEarnedFlags, 0), 0);
  await verifyEarlyEquivalence(late.earlyEquivalence, {read, sha});
  await verifyEarnedExports(late.exports, late.earnedRuns, {read, sha});
  assert.equal(late.checks, CURRENT_SOURCE_COUNT + CURRENT_OBJECT_COUNT + 480 + 24 + allRows.reduce((sum, row) => sum + row.checks, 0),
    'Native checks plus explicit source/object and complete early-comparison observations');
  return {earnedRuns: 4, earnedFlags: 48, syntheticWindows: 16, parentWindows: 4,
    narrowControls: 2, migrationControls: 2, checks: late.checks};
}
