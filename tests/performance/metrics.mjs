// SPDX-License-Identifier: MIT
// Pure analysis of v2 raw CPU/rAF observations. No thresholds or measurements
// are supplied here. rAF scheduling is not proof of GPU or presented-frame FPS.
import assert from 'node:assert/strict';

const finite = (value, min = 0) => {
  assert(Number.isFinite(value) && value >= min, `Invalid nonnegative number: ${value}`);
  return value;
};
const integer = value => { finite(value); assert(Number.isSafeInteger(value)); return value; };
const hash = value => assert.match(value, /^[a-f0-9]{64}$/);

export function percentile(values, percent) {
  finite(percent); assert(percent <= 100);
  const sorted = values.map(value => finite(value)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  // Nearest rank, including the minimum at p0 and maximum at p100.
  return sorted[Math.max(0, Math.ceil(percent / 100 * sorted.length) - 1)];
}

export function statistics(values) {
  values.forEach(value => finite(value));
  return {count: values.length, min: percentile(values, 0), max: percentile(values, 100),
    mean: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null,
    p50: percentile(values, 50), p95: percentile(values, 95), p99: percentile(values, 99)};
}

function validateManifest(manifest) {
  assert.equal(manifest.schemaVersion, 2);
  assert.equal(manifest.engineWasmMatchesMetadata, true);
  assert.equal(manifest.serverFileMatchesRunningCode, true);
  assert.equal(typeof manifest.engineId, 'string'); assert(manifest.engineId.length > 0);
  for (const key of ['engineWasmSha256', 'serverSha256', 'probeSha256',
    'saveStorageBaseSha256', 'saveStorageServedSha256']) hash(manifest[key]);
  assert(manifest.files && Object.keys(manifest.files).length > 0);
  for (const [path, file] of Object.entries(manifest.files)) {
    assert(path && !path.startsWith('/') && !/[\\:]/.test(path));
    assert(path.split('/').every(part => part && part !== '.' && part !== '..'));
    hash(file.baseSha256); hash(file.servedSha256);
    integer(file.baseBytes); integer(file.servedBytes);
  }
  const wasm = manifest.files['game/pvz-portable.wasm']; assert(wasm);
  assert.equal(wasm.baseSha256, manifest.engineWasmSha256);
  assert.equal(wasm.servedSha256, manifest.engineWasmSha256, 'Native WASM must be unchanged');
  const storage = manifest.files['save-storage.js']; assert(storage);
  assert.equal(storage.baseSha256, manifest.saveStorageBaseSha256);
  assert.equal(storage.servedSha256, manifest.saveStorageServedSha256);
  assert.deepEqual(manifest.nativeHook, {supported: true, global: 'MainLoop', method: 'runIter',
    source: 'MainLoop.runIter(iterFunc) / callUserCallback(func)'});
}

function validateState(state) {
  assert.equal(state.visibility, 'visible', 'Hidden observations are ineligible');
  assert.equal(state.audioMuted, true, 'Audio must stay muted throughout measurement');
  for (const key of ['width', 'height', 'dpr']) assert(finite(state.viewport[key]) > 0);
  for (const key of ['width', 'height', 'cssWidth', 'cssHeight']) assert(finite(state.canvas[key]) > 0);
  integer(state.canvas.width); integer(state.canvas.height);
}

function timedEvents(events, elapsed, kind) {
  assert(Array.isArray(events)); let previous = -1;
  for (const entry of events) {
    finite(entry.at); finite(entry.ms);
    assert(entry.at >= previous && entry.at + entry.ms <= elapsed, `${kind} outside observation or out of order`);
    previous = entry.at;
    if (kind === 'saveCaptures') { integer(entry.bytes); integer(entry.files); }
  }
  return statistics(events.map(entry => entry.ms));
}

function checkBudget(stats, budget, required, label) {
  assert(budget && typeof budget === 'object');
  required.forEach(key => assert(Object.hasOwn(budget, key), `${label} budget must explicitly set ${key}`));
  for (const [key, limit] of Object.entries(budget)) {
    assert(Object.hasOwn(stats, key), `Unknown ${label} budget statistic: ${key}`); finite(limit);
    assert((stats[key] ?? 0) <= limit, `${label}.${key} budget exceeded: ${stats[key]} > ${limit}`);
  }
}

export function analyzeCapture(record, {expectedManifest, expectedLabel, expectedScenario,
  minObservationMs, minSaveCaptures, budgets} = {}) {
  validateManifest(expectedManifest);
  assert.equal(typeof expectedLabel, 'string'); assert(expectedLabel.startsWith('v2-'));
  assert([20, 40].includes(expectedScenario?.crowd), 'Bind the declared20/40 fixture externally');
  assert(['active', 'paused', 'menu'].includes(expectedScenario.phase));
  assert([1, 2].includes(expectedScenario.speed));
  assert(finite(minObservationMs) > 0, 'An observation minimum must be chosen explicitly');
  assert.equal(record.schemaVersion, 2);
  assert.match(record.status, /^PASS /); assert.deepEqual(record.validationErrors, []);
  assert.equal(record.label, expectedLabel);
  assert.equal(record.mode, 'native-raf', 'Scheduling-only controls are not native callback evidence');
  assert.deepEqual(record.declaredScenario, expectedScenario);
  for (const key of ['captureStartManifest', 'captureEndManifest', 'pageManifest', 'serverManifestAtReceipt'])
    assert.deepEqual(record[key], expectedManifest, `Stale or changed ${key}`);
  assert.equal(record.loadedProbeSha256, expectedManifest.probeSha256);
  assert.equal(record.nativeHookAvailable, true);
  assert.equal(record.longTaskObserverAvailable, true, 'Missing long-task observation is not zero long tasks');
  validateState(record.startState); validateState(record.endState);
  assert.deepEqual(record.startState, record.endState, 'Observation state changed');
  for (const key of ['visibilityChanges', 'audioChanges', 'resizeChanges']) assert.deepEqual(record[key], []);
  finite(record.startedAt); finite(record.finishedAt); finite(record.requestedMs); finite(record.elapsedMs);
  assert(Math.abs(record.finishedAt - record.startedAt - record.elapsedMs) <= 1e-6, 'Inconsistent observation clock');
  assert(record.requestedMs >= minObservationMs && record.elapsedMs >= record.requestedMs,
    'Observation ended early or was too short');
  const samples = record.samples; assert(samples);
  const timestamps = samples.rafTimestamps; assert(Array.isArray(timestamps) && timestamps.length >= 2);
  const gaps = timestamps.slice(1).map((value, i) => {
    finite(value); assert(value > timestamps[i], 'rAF timestamps must strictly increase');
    return value - timestamps[i];
  });
  finite(timestamps[0]);
  assert(Array.isArray(samples.nativeCallbacks) && samples.nativeCallbacks.length > 0,
    'Missing actual native callbacks');
  const stats = {nativeCallbacks: timedEvents(samples.nativeCallbacks, record.elapsedMs, 'nativeCallbacks'),
    rafGaps: statistics(gaps), saveCaptures: timedEvents(samples.saveCaptures, record.elapsedMs, 'saveCaptures'),
    longTasks: timedEvents(record.longTasks, record.elapsedMs, 'longTasks')};
  for (const [field, values] of [['frameGapMs', gaps], ['nativeCallbackMs', samples.nativeCallbacks.map(e => e.ms)],
    ['saveCaptureMs', samples.saveCaptures.map(e => e.ms)]]) {
    const s = statistics(values);
    assert.deepEqual(record[field], {samples: s.count, p50: s.p50 ?? 0, p95: s.p95 ?? 0, p99: s.p99 ?? 0,
      max: s.max ?? 0, over33: values.filter(v => v > 33.5).length,
      over50: values.filter(v => v > 50).length, over100: values.filter(v => v > 100).length},
    `${field} must recompute exactly from raw samples`);
  }
  assert(budgets, 'Explicit caller-selected CPU, scheduling and long-task budgets are required');
  checkBudget(stats.nativeCallbacks, budgets.nativeCallbacks, ['p95', 'max'], 'nativeCallbacks');
  checkBudget(stats.rafGaps, budgets.rafGaps, ['p95', 'max'], 'rafGaps');
  checkBudget(stats.longTasks, budgets.longTasks, ['count', 'max'], 'longTasks');
  if (minSaveCaptures !== undefined) {
    integer(minSaveCaptures); assert(stats.saveCaptures.count >= minSaveCaptures, 'Too few full save-capture observations');
  }
  if (budgets.saveCaptures !== undefined) {
    assert(minSaveCaptures > 0, 'Save-capture budgets require an explicitly chosen positive sample minimum');
    checkBudget(stats.saveCaptures, budgets.saveCaptures, ['p95', 'max'], 'saveCaptures');
  }
  // Prevent a few fast samples from masquerading as a complete observation.
  const margin = budgets.rafGaps.max;
  assert(timestamps[0] >= record.startedAt - margin && timestamps[0] <= record.startedAt + margin);
  assert(timestamps.at(-1) >= record.finishedAt - margin && timestamps.at(-1) <= record.finishedAt + margin);
  assert(samples.nativeCallbacks[0].at <= margin);
  assert(samples.nativeCallbacks.at(-1).at + samples.nativeCallbacks.at(-1).ms >= record.elapsedMs - margin);
  return {percentileMethod: 'nearest-rank', observationMs: record.elapsedMs,
    scenario: {...expectedScenario}, stats,
    capturedBytes: samples.saveCaptures.reduce((sum, entry) => sum + entry.bytes, 0),
    scope: 'Raw CPU callback durations and rAF scheduling; no GPU timing or presented-frame FPS claim. Scenario fixture identity is external.'};
}
