// SPDX-License-Identifier: MIT
// Synthetic unit fixtures only: these are not measured game performance.
import assert from 'node:assert/strict';
import {analyzeCapture, percentile, statistics} from './performance/metrics.mjs';

let checks = 0;
const check = fn => { fn(); checks++; };
const reject = (record, options) => check(() => assert.throws(() => analyzeCapture(record, options)));
const copy = value => structuredClone(value);
const pin = character => character.repeat(64);
const manifest = {schemaVersion: 2, engineId: 'synthetic-unit-fixture', engineWasmSha256: pin('a'),
  engineWasmMatchesMetadata: true, serverFileMatchesRunningCode: true,
  serverSha256: pin('b'), probeSha256: pin('c'), saveStorageBaseSha256: pin('d'), saveStorageServedSha256: pin('e'),
  files: {'game/pvz-portable.wasm': {baseSha256: pin('a'), servedSha256: pin('a'), baseBytes: 1, servedBytes: 1},
    'save-storage.js': {baseSha256: pin('d'), servedSha256: pin('e'), baseBytes: 2, servedBytes: 3}},
  nativeHook: {supported: true, global: 'MainLoop', method: 'runIter',
    source: 'MainLoop.runIter(iterFunc) / callUserCallback(func)'}};
const state = {visibility: 'visible', audioMuted: true, viewport: {width: 800, height: 600, dpr: 1},
  canvas: {width: 800, height: 600, cssWidth: 800, cssHeight: 600}};
const fixture = () => ({schemaVersion: 2, label: 'v2-synthetic-unit-20-active-1x', mode: 'native-raf',
  status: 'PASS measurement preconditions; synthetic unit fixture only', validationErrors: [],
  declaredScenario: {crowd: 20, phase: 'active', speed: 1}, startedAt: 100, finishedAt: 1100, requestedMs: 1000, elapsedMs: 1000,
  startState: copy(state), endState: copy(state), visibilityChanges: [], audioChanges: [], resizeChanges: [],
  pageManifest: copy(manifest), captureStartManifest: copy(manifest), captureEndManifest: copy(manifest),
  serverManifestAtReceipt: copy(manifest), loadedProbeSha256: pin('c'), nativeHookAvailable: true, longTaskObserverAvailable: true,
  samples: {rafTimestamps: Array.from({length: 101}, (_, i) => 100 + i * 10),
    nativeCallbacks: Array.from({length: 100}, (_, i) => ({at: i * 10, ms: i % 4 + 1})),
    saveCaptures: [{at: 250, ms: 2, bytes: 100, files: 1}, {at: 750, ms: 3, bytes: 200, files: 2}]}, longTasks: [],
  frameGapMs: {samples: 100, p50: 10, p95: 10, p99: 10, max: 10, over33: 0, over50: 0, over100: 0},
  nativeCallbackMs: {samples: 100, p50: 2, p95: 4, p99: 4, max: 4, over33: 0, over50: 0, over100: 0},
  saveCaptureMs: {samples: 2, p50: 2, p95: 3, p99: 3, max: 3, over33: 0, over50: 0, over100: 0}});
// These bounds exercise the synthetic fixture only. Production callers must
// choose their own observation duration and budgets from real measurements.
const options = () => ({expectedManifest: copy(manifest), expectedLabel: 'v2-synthetic-unit-20-active-1x',
  expectedScenario: {crowd: 20, phase: 'active', speed: 1}, minObservationMs: 1000,
  budgets: {nativeCallbacks: {p95: 4, max: 4}, rafGaps: {p95: 10, max: 20}, longTasks: {count: 0, max: 0}}});

check(() => assert.equal(percentile([], 95), null));
check(() => assert.equal(percentile([7], 0), 7));
check(() => assert.deepEqual([0, 50, 95, 100].map(p => percentile([4, 1, 3, 2], p)), [1, 2, 4, 4]));
check(() => {
  const values = [8, 0, 100, 3, 3, 12], original = [...values]; let previous = -Infinity;
  for (let p = 0; p <= 100; p++) { const value = percentile(values, p); assert(value >= previous); previous = value; }
  assert.deepEqual(values, original);
});
for (const value of [-1, Infinity, NaN]) check(() => assert.throws(() => percentile([value], 50)));
for (const percent of [-1, 101, NaN]) check(() => assert.throws(() => percentile([1], percent)));
check(() => assert.deepEqual(statistics([1, 2, 3, 4]), {count: 4, min: 1, max: 4, mean: 2.5, p50: 2, p95: 4, p99: 4}));
check(() => {
  const record = fixture(), before = copy(record); record.untrustedSummary = {nativeCallbacks: {p95: 0}};
  const result = analyzeCapture(record, options());
  assert.equal(result.stats.nativeCallbacks.p95, 4); assert.equal(result.stats.rafGaps.p99, 10);
  assert.equal(result.stats.saveCaptures.mean, 2.5); assert.equal(result.capturedBytes, 300);
  assert.equal(result.stats.longTasks.count, 0); assert.equal(result.stats.longTasks.max, null);
  assert.match(result.scope, /no GPU timing or presented-frame FPS/);
  delete record.untrustedSummary; assert.deepEqual(record, before);
});
for (const crowd of [20, 40]) for (const speed of [1, 2]) check(() => {
  const record = fixture(), config = options(); record.label = `v2-synthetic-unit-${crowd}-paused-${speed}x`;
  record.declaredScenario = {crowd, phase: 'paused', speed}; config.expectedLabel = record.label;
  config.expectedScenario = {crowd, phase: 'paused', speed};
  assert.deepEqual(analyzeCapture(record, config).scenario, config.expectedScenario);
});
const mutations = [
  r => { r.startState.visibility = 'hidden'; }, r => { r.endState.audioMuted = false; },
  r => { r.visibilityChanges.push({at: 200, state: 'hidden'}); }, r => { r.audioChanges.push({at: 300, audioMuted: false}); },
  r => { r.resizeChanges.push({at: 400}); }, r => { r.endState.canvas.cssWidth++; },
  r => { r.pageManifest.engineWasmSha256 = pin('f'); }, r => { r.captureEndManifest.probeSha256 = pin('f'); },
  r => { r.loadedProbeSha256 = pin('f'); }, r => { r.captureStartManifest.files['game/pvz-portable.wasm'].servedSha256 = pin('f'); },
  r => { r.samples.nativeCallbacks = []; }, r => { r.mode = 'raf-only'; }, r => { r.label = 'v2-wrong-scenario'; },
  r => { r.declaredScenario.speed = 2; }, r => { r.finishedAt--; }, r => { r.requestedMs = 1001; },
  r => { r.samples.rafTimestamps[50] = r.samples.rafTimestamps[49]; },
  r => { r.samples.nativeCallbacks[50].ms = 9; },
  r => { r.samples.rafTimestamps.splice(30, 3); }, r => { r.longTasks.push({at: 100, ms: 50}); },
  r => { r.samples.nativeCallbacks = r.samples.nativeCallbacks.slice(0, 2); },
  r => { r.samples.rafTimestamps = r.samples.rafTimestamps.slice(0, 2); },
  r => { r.samples.saveCaptures[0].bytes = -1; }, r => { r.longTasks.push({at: -1, ms: 50}); },
  r => { r.nativeHookAvailable = false; }, r => { r.longTaskObserverAvailable = false; },
  r => { r.status = 'FAIL measurement preconditions'; }, r => { r.validationErrors.push('stale'); },
  r => { r.nativeCallbackMs.p95 = 0; }, r => { r.serverManifestAtReceipt.serverSha256 = pin('f'); },
];
for (const mutate of mutations) { const record = fixture(); mutate(record); reject(record, options()); }
for (const mutate of [o => { delete o.budgets; }, o => { delete o.budgets.nativeCallbacks.max; },
  o => { o.budgets.rafGaps.max = Infinity; }, o => { o.expectedScenario.crowd = 60; },
  o => { o.expectedManifest.nativeHook.supported = false; }, o => { o.minObservationMs = 1001; },
  o => { o.budgets.nativeCallbacks.p95 = 3; }, o => { o.budgets.nativeCallbacks.max = 3; },
  o => { o.budgets.rafGaps.p95 = 9; }, o => { o.budgets.rafGaps.max = 9; }]) {
  const config = options(); mutate(config); reject(fixture(), config);
}
check(() => {
  const record = fixture(), config = options(); record.longTasks.push({at: 100, ms: 50});
  config.budgets.longTasks = {count: 1, max: 50};
  assert.equal(analyzeCapture(record, config).stats.longTasks.max, 50);
  config.budgets.longTasks.max = 49; assert.throws(() => analyzeCapture(record, config));
});
check(() => {
  const config = options(); config.minSaveCaptures = 2; config.budgets.saveCaptures = {p95: 3, max: 3};
  assert.equal(analyzeCapture(fixture(), config).stats.saveCaptures.count, 2);
  config.budgets.saveCaptures.max = 2; assert.throws(() => analyzeCapture(fixture(), config));
  config.budgets.saveCaptures = {p95: 2, max: 3}; assert.throws(() => analyzeCapture(fixture(), config));
  config.budgets.saveCaptures = {p95: 3, max: 3}; config.minSaveCaptures = 3;
  assert.throws(() => analyzeCapture(fixture(), config));
  delete config.minSaveCaptures; assert.throws(() => analyzeCapture(fixture(), config));
});
console.log(`PASS ${checks} performance-metrics unit checks (synthetic fixtures only; no game performance evidence).`);
