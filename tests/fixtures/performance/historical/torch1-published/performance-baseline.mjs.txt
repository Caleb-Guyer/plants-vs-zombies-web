// SPDX-License-Identifier: MIT
// Retained real-browser observations, not a fresh benchmark or GPU/FPS proof.
import './performance-metrics.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {analyzeCapture, statistics} from './performance/metrics.mjs';
import {historicalEngine} from './native-release-context.mjs';
import {continuitySnapshotRoot, continuityArchivePath, continuityPatchPath, verifySourceMetadataContinuity} from './performance/source-metadata-continuity.mjs';
import {verifyContinuityNegativeControls} from './performance/source-metadata-continuity-controls.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const safe = name => {
  assert.equal(typeof name, 'string'); assert(name && !name.startsWith('/') && !/[\\:]/.test(name));
  assert(name.split('/').every(part => part && part !== '.' && part !== '..')); return name;
};
const read = name => fs.readFileSync(path.join(root, safe(name)));
const json = bytes => JSON.parse(Buffer.from(bytes).toString('utf8').replace(/^\uFEFF/, ''));
const finite = value => assert(Number.isFinite(value) && value >= 0);
function pinned(pin) {
  assert(Number.isSafeInteger(pin.bytes) && pin.bytes > 0); assert.match(pin.sha256, /^[a-f0-9]{64}$/);
  const bytes = read(pin.path); assert.equal(bytes.length, pin.bytes, pin.path); assert.equal(sha(bytes), pin.sha256, pin.path);
  return bytes;
}
const baselineBytes = read('tests/fixtures/performance/baseline.json');
const baseline = json(baselineBytes);
assert.equal(baseline.schemaVersion, 1);
assert.equal(baseline.minObservationMs, 15000); assert.equal(baseline.minSaveCaptures, 2);
assert.equal(baseline.maxControlP95DeltaMs, 1);
assert.deepEqual(baseline.budgets, {nativeCallbacks: {p95: 8, max: 33.5}, rafGaps: {p95: 25, max: 50},
  saveCaptures: {p95: 8, max: 16.7}, longTasks: {count: 0, max: 50}});
const engine = json(read('dist/game/engine-provenance.json'));
assert.deepEqual(baseline.engine, {id: engine.id, jsSha256: engine.artifacts.jsSha256, wasmSha256: engine.artifacts.wasmSha256});
assert.equal(sha(read('dist/game/pvz-portable.js')), baseline.engine.jsSha256);
assert.equal(sha(read('dist/game/pvz-portable.wasm')), baseline.engine.wasmSha256);
assert.equal(baseline.probe.path, 'tests/performance/probe.js'); const probeBytes = pinned(baseline.probe);
assert.equal(baseline.recorder.path, 'tests/performance/preview.py'); const recorderBytes = pinned(baseline.recorder);
const captureManifestBytes = pinned(baseline.expectedManifest);
const manifest = json(captureManifestBytes);
assert.equal(manifest.engineId, baseline.engine.id); assert.equal(manifest.engineWasmSha256, baseline.engine.wasmSha256);
assert.equal(manifest.probeSha256, baseline.probe.sha256); assert.equal(manifest.serverSha256, baseline.recorder.sha256);
const continuityInput = {
  observedEngineBytes: read(continuitySnapshotRoot + 'observed-engine-provenance.json'),
  observedSourceManifestBytes: read(continuitySnapshotRoot + 'observed-source-manifest.json'),
  observedReceiptBytes: read(continuitySnapshotRoot + 'observed-normal-build-result.json'),
  baselineBytes, captureManifestBytes, probeBytes, recorderBytes,
  runtimeFiles: new Map(Object.keys(manifest.files).map(name => [name, read('dist/' + safe(name))])),
  sourceArchiveBytes: read(continuityArchivePath), patchBytes: read(continuityPatchPath), zipDecoderBytes: read('dist/vendor/jszip.min.js'),
};
const continuity = await verifySourceMetadataContinuity(continuityInput);
const continuityControls = await verifyContinuityNegativeControls(continuityInput);
assert.equal(continuityControls.negativeControls, 13);
for (const [name, pin] of Object.entries(manifest.files)) {
  if (name === 'game/engine-provenance.json' && continuity.kind === 'source-metadata-only-successor') continue;
  const bytes = read('dist/' + safe(name)); assert.equal(bytes.length, pin.baseBytes); assert.equal(sha(bytes), pin.baseSha256, name);
}

const checkpoints = json(pinned(baseline.checkpoints));
assert.equal(checkpoints.schemaVersion, 1); assert.equal(checkpoints.manualImportOnly, true);
assert.equal(checkpoints.automaticallyImportedByGame, false);
assert.equal(checkpoints.fixtureSetup.startingStagesAreSynthetic, true);
assert.equal(checkpoints.fixtureSetup.postSetupHealthActorOrRngEdits, false);
// These exact checkpoints were exported by the published parent. Fresh current
// captures demonstrate load compatibility without rewriting fixture provenance.
assert.equal(checkpoints.provenance.nativeEngineVersion, '0.2.6-web-endless.3');
assert.equal(checkpoints.provenance.nativePublishedWasmSha256,
  historicalEngine(engine, '0.2.6-web-endless.3').artifacts.wasmSha256);
assert.equal(checkpoints.provenance.nativePublishedWasmBytes, 7782033);
assert.equal(baseline.checkpointCompatibility.sourceEngine, checkpoints.provenance.nativeEngineVersion);
assert.equal(baseline.checkpointCompatibility.loadedByEngine, engine.id);
assert.equal(baseline.checkpointCompatibility.originalBytesPreserved, true);
const require = createRequire(import.meta.url), vendor = {exports: {}};
new Function('module', 'exports', 'require', read('dist/vendor/jszip.min.js').toString())(vendor, vendor.exports, require);
const checkpointNames = Object.keys(checkpoints.checkpoints); assert.equal(checkpointNames.length, 3);
for (const key of checkpointNames) {
  const entry = checkpoints.checkpoints[key]; assert.equal(entry.id, key);
  assert.equal(entry.syntheticStartingFixture, true); assert.equal(entry.earnedFlags, 0);
  assert.equal(entry.boardAndProfileBytesUnchanged, true);
  const folder = path.posix.dirname(baseline.checkpoints.path);
  const archive = pinned({path: folder + '/' + safe(entry.file), bytes: entry.bytes, sha256: entry.sha256});
  const zip = await vendor.exports.loadAsync(archive, {checkCRC32: true});
  assert.deepEqual(Object.values(zip.files).filter(item => !item.dir).map(item => item.name).sort(), Object.keys(entry.entries).sort());
  assert.deepEqual(Object.keys(entry.entries).sort(), ['userdata/game1_87.v4', 'userdata/user1.dat', 'userdata/users.dat']);
  for (const [name, pin] of Object.entries(entry.entries)) {
    const bytes = Buffer.from(await zip.file(name).async('uint8array'));
    assert.equal(bytes.length, pin.bytes); assert.equal(sha(bytes), pin.sha256);
  }
}

function checkpointFor(row, phase) {
  const checkpoint = checkpoints.checkpoints[row.checkpointKey]; assert(checkpoint);
  assert.equal(checkpoint.savedCompletedFlags + 1, row.scenario.crowd);
  assert.equal(checkpoint.benchmarkRole, phase === 'active' ? 'active-gameplay' : 'paused-render-control');
  return checkpoint;
}
function analyze(row) {
  const record = json(pinned(row.report)); assert.deepEqual(record.startState, baseline.observedContext);
  return {record, analysis: analyzeCapture(record, {expectedManifest: manifest, expectedLabel: row.label,
    expectedScenario: row.scenario, minObservationMs: baseline.minObservationMs,
    minSaveCaptures: baseline.minSaveCaptures, budgets: baseline.budgets})};
}
const labels = new Set();
function unique(row) { assert(!labels.has(row.label), 'Capture labels must be unique'); labels.add(row.label); }
assert.equal(baseline.cases.length, 4);
assert.deepEqual(baseline.cases.map(row => `${row.scenario.crowd}/${row.scenario.speed}`).sort(), ['20/1', '20/2', '40/1', '40/2']);
for (const row of baseline.cases) {
  unique(row); assert.equal(row.scenario.phase, 'active'); assert.equal(row.activeThroughout, true);
  const checkpoint = checkpointFor(row, 'active'); assert(checkpoint.nativeSpeedTargets.includes(row.scenario.speed));
  assert.deepEqual(Object.keys(row.screenshots).sort(), ['end', 'start']);
  for (const pin of Object.values(row.screenshots)) {
    const bytes = pinned(pin); assert(bytes[0] === 0xff && bytes[1] === 0xd8, 'Retained browser screenshots are JPEGs');
  }
  analyze(row);
}

assert.equal(baseline.controls.length, 2);
assert.deepEqual(baseline.controls.map(row => row.mode).sort(), ['native-raf', 'raf-only']);
const native = baseline.controls.find(row => row.mode === 'native-raf'), clock = baseline.controls.find(row => row.mode === 'raf-only');
for (const row of baseline.controls) {
  unique(row); assert.deepEqual(row.scenario, {phase: 'paused', speed: 1, crowd: 20}); checkpointFor(row, 'paused');
}
const paused = analyze(native);
const control = json(pinned(clock.report));
assert.equal(control.schemaVersion, 2); assert.equal(control.mode, 'raf-only'); assert.equal(control.label, clock.label);
assert.match(control.status, /^PASS /); assert.deepEqual(control.validationErrors, []);
assert.deepEqual(control.declaredScenario, clock.scenario);
assert.equal(control.nativeHookAvailable, true); assert.equal(control.longTaskObserverAvailable, true);
assert.equal(control.loadedProbeSha256, manifest.probeSha256);
for (const key of ['pageManifest', 'captureStartManifest', 'captureEndManifest', 'serverManifestAtReceipt']) assert.deepEqual(control[key], manifest);
assert.deepEqual(control.startState, baseline.observedContext); assert.deepEqual(control.endState, control.startState);
assert.equal(control.startState.visibility, 'visible'); assert.equal(control.startState.audioMuted, true);
for (const key of ['visibilityChanges', 'audioChanges', 'resizeChanges', 'longTasks']) assert.deepEqual(control[key], []);
assert.deepEqual(control.samples.nativeCallbacks, []); assert.deepEqual(control.samples.saveCaptures, []);
finite(control.startedAt); finite(control.finishedAt); finite(control.elapsedMs); finite(control.requestedMs);
assert.equal(control.requestedMs, baseline.minObservationMs); assert(control.elapsedMs >= control.requestedMs);
assert(Math.abs(control.finishedAt - control.startedAt - control.elapsedMs) <= 1e-6);
const timestamps = control.samples.rafTimestamps; assert(timestamps.length >= 2); finite(timestamps[0]);
const gaps = timestamps.slice(1).map((value, i) => { finite(value); assert(value > timestamps[i]); return value - timestamps[i]; });
const clockStats = statistics(gaps), margin = baseline.budgets.rafGaps.max;
assert(timestamps[0] >= control.startedAt - margin && timestamps[0] <= control.startedAt + margin);
assert(timestamps.at(-1) >= control.finishedAt - margin && timestamps.at(-1) <= control.finishedAt + margin);
assert(clockStats.p95 <= baseline.budgets.rafGaps.p95 && clockStats.max <= margin);
for (const [key, values] of [['frameGapMs', gaps], ['nativeCallbackMs', []], ['saveCaptureMs', []]]) {
  const s = statistics(values);
  assert.deepEqual(control[key], {samples: s.count, p50: s.p50 ?? 0, p95: s.p95 ?? 0, p99: s.p99 ?? 0, max: s.max ?? 0,
    over33: values.filter(v => v > 33.5).length, over50: values.filter(v => v > 50).length, over100: values.filter(v => v > 100).length});
}
assert(Math.abs(paused.analysis.stats.rafGaps.p95 - clockStats.p95) <= baseline.maxControlP95DeltaMs,
  'Native observation overhead exceeds the explicitly chosen paired-control bound');
// Preserve failed observations as failures alongside the passing controlled set.
// A raw hash, unchanged manifest and the actual analyzer must agree on why each
// diagnostic failed; it cannot silently become passing performance evidence.
for (const row of baseline.diagnostics ?? []) {
  unique(row); assert.equal(row.includedInPassingBudgetSet, false);
  assert.equal(row.expectedBudgetFailure, 'rafGaps.max');
  assert.deepEqual(row.scenario, {phase: 'paused', speed: 1, crowd: 20}); checkpointFor(row, 'paused');
  assert.throws(() => analyze(row), /rafGaps\.max budget exceeded/,
    'Retained failed diagnostic must genuinely fail the unchanged scheduling budget');
}
console.log('PASS retained browser CPU/scheduling baseline:4 active15s windows, paired paused controls, raw traces, retained failed diagnostics and fixture/screenshot pins; not fresh execution or GPU/FPS proof.');
console.log(`PASS strict performance continuity: ${continuity.kind};868 exact production source files,18 exact other runtime files,original patch/receipt and13 rejected in-memory negative controls;no fresh timing execution.`);
