// SPDX-License-Identifier: MIT
// Retains old timing evidence only when executable/runtime bytes are unchanged.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';

export const continuityPins = Object.freeze({
  engine: '47c39f2600075d5f40ebbd66e0aa80424ae12ceaa8d6f8d7f8238f9444e6983b',
  sourceArchive: 'f0c4ec0f485878514831dc31df28316211b417608e03cb39855ecb109b8c4f1e',
  sourceManifest: 'bdffed25a151c5cbb5a37f31236f549546202aa15f915752d6e957a81828b8ec',
  productionReceipt: '983236d83833fc9e176cc808a44a44ed836e3e6b43e5ddea9254b5f619089c9f',
  captureManifest: 'b9de8a27f4e91baa6b1a8c6124f624c70529b8028f9b0b8c9d9bb0cf1c6a55ed',
  baseline: '43312dcdce1130b7ea1cb0d0cb1e11c19ad5ef6a7e4d22724257d959ca64770f',
  zipDecoder: 'acc7e41455a80765b5fd9c7ee1b8078a6d160bbbca455aeae854de65c947d59e',
});
export const continuitySnapshotRoot = 'tests/fixtures/performance/source-metadata-continuity/';
export const continuityArchivePath = 'dist/source/pvz-portable-0.2.6-web-torch.1-source.zip';
export const continuityPatchPath = 'dist/source/web-torch.1.patch';
const prefix = 'torch1-candidate/';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const parse = bytes => JSON.parse(Buffer.from(bytes).toString('utf8').replace(/^\uFEFF/, ''));
const bytes = value => { assert(value instanceof Uint8Array, 'Actual byte buffers are required'); return Buffer.from(value); };
function pathName(name, directory = false) {
  assert.equal(typeof name, 'string');
  const value = directory && name.endsWith('/') ? name.slice(0, -1) : name;
  assert(value && !value.startsWith('/') && !/[\\:]/.test(value), 'Unsafe archive/runtime path');
  assert(value.split('/').every(part => part && part !== '.' && part !== '..'), 'Unsafe path component');
  return name;
}
function pinned(value, expected, label) {
  const data = bytes(value); assert.equal(digest(data), expected, label); return data;
}

// Reject ambiguous names before JSZip's normalizing dictionary can hide them.
function centralNames(archive) {
  let end = -1;
  for (let at = archive.length - 22; at >= Math.max(0, archive.length - 65557); --at) {
    if (archive.readUInt32LE(at) === 0x06054b50 && at + 22 + archive.readUInt16LE(at + 20) === archive.length) { end = at; break; }
  }
  assert(end >= 0, 'Native source ZIP has no complete directory');
  assert.equal(archive.readUInt16LE(end + 4), 0); assert.equal(archive.readUInt16LE(end + 6), 0);
  const count = archive.readUInt16LE(end + 10), size = archive.readUInt32LE(end + 12);
  let at = archive.readUInt32LE(end + 16); const start = at;
  assert.equal(archive.readUInt16LE(end + 8), count);
  assert(count > 0 && count < 65535 && at + size === end, 'Unsupported or inconsistent ZIP directory');
  const names = new Set();
  for (let i = 0; i < count; ++i) {
    assert(at + 46 <= end && archive.readUInt32LE(at) === 0x02014b50, 'Truncated source ZIP directory');
    const length = archive.readUInt16LE(at + 28), extra = archive.readUInt16LE(at + 30), comment = archive.readUInt16LE(at + 32);
    assert(at + 46 + length + extra + comment <= end);
    const name = new TextDecoder('utf-8', {fatal: true}).decode(archive.subarray(at + 46, at + 46 + length));
    pathName(name, name.endsWith('/')); assert(!names.has(name), 'Duplicate native source ZIP path'); names.add(name);
    at += 46 + length + extra + comment;
  }
  assert.equal(at - start, size); return names;
}

export function originalZipDecoder(libraryBytes) {
  const script = pinned(libraryBytes, continuityPins.zipDecoder, 'Original verification ZIP decoder changed');
  const require = createRequire(import.meta.url), module = {exports: {}};
  new Function('module', 'exports', 'require', script.toString('utf8'))(module, module.exports, require);
  return module.exports;
}

export async function verifySourceMetadataContinuity({
  observedEngineBytes, observedSourceManifestBytes, observedReceiptBytes,
  baselineBytes, captureManifestBytes, probeBytes, recorderBytes,
  runtimeFiles, sourceArchiveBytes, patchBytes, zipDecoderBytes,
}) {
  const oldEngineData = pinned(observedEngineBytes, continuityPins.engine, 'Observed engine snapshot changed');
  const oldManifestData = pinned(observedSourceManifestBytes, continuityPins.sourceManifest, 'Observed source-manifest snapshot changed');
  const oldReceiptData = pinned(observedReceiptBytes, continuityPins.productionReceipt, 'Observed production receipt changed');
  pinned(baselineBytes, continuityPins.baseline, 'Original performance baseline changed');
  const captureData = pinned(captureManifestBytes, continuityPins.captureManifest, 'Original capture manifest changed');
  const oldEngine = parse(oldEngineData), sourceManifest = parse(oldManifestData), manifest = parse(captureData);
  assert.equal(oldEngine.id, '0.2.6-web-torch.1');
  assert.equal(oldEngine.artifacts.sourceSha256, continuityPins.sourceArchive);
  assert.equal(oldEngine.artifacts.source, '../source/pvz-portable-0.2.6-web-torch.1-source.zip');
  assert.equal(oldEngine.artifacts.patch, '../source/web-torch.1.patch');
  assert.equal(digest(bytes(patchBytes)), oldEngine.artifacts.patchSha256, 'Observed production patch bytes changed');
  assert.equal(sourceManifest.version, oldEngine.id);
  assert.equal(Object.keys(sourceManifest.files).length, 868);
  assert.equal(manifest.engineId, oldEngine.id);
  assert.equal(manifest.engineWasmSha256, oldEngine.artifacts.wasmSha256);
  assert.equal(digest(bytes(probeBytes)), manifest.probeSha256, 'Captured browser probe changed');
  assert.equal(digest(bytes(recorderBytes)), manifest.serverSha256, 'Captured browser recorder/server changed');
  assert(runtimeFiles instanceof Map); assert.equal(runtimeFiles.size, 19);
  assert.deepEqual([...runtimeFiles.keys()].sort(), Object.keys(manifest.files).sort());
  const currentEngineData = bytes(runtimeFiles.get('game/engine-provenance.json'));
  const currentEngine = parse(currentEngineData);
  const onlyAllowedChange = structuredClone(oldEngine);
  onlyAllowedChange.artifacts.sourceSha256 = currentEngine.artifacts?.sourceSha256;
  assert.match(onlyAllowedChange.artifacts.sourceSha256, /^[a-f0-9]{64}$/);
  assert.deepEqual(currentEngine, onlyAllowedChange, 'Only artifacts.sourceSha256 may change in observed engine metadata');
  const metadataChanged = digest(currentEngineData) !== continuityPins.engine;
  if (metadataChanged) assert.notEqual(currentEngine.artifacts.sourceSha256, continuityPins.sourceArchive, 'Formatting-only metadata is not a source successor');
  else assert.deepEqual(currentEngineData, oldEngineData);
  for (const [name, pin] of Object.entries(manifest.files)) {
    pathName(name); if (name === 'game/engine-provenance.json') continue;
    const data = bytes(runtimeFiles.get(name)); assert.equal(data.length, pin.baseBytes, name);
    assert.equal(digest(data), pin.baseSha256, `Observed runtime bytes changed: ${name}`);
  }
  assert.equal(digest(bytes(runtimeFiles.get('game/pvz-portable.js'))), oldEngine.artifacts.jsSha256);
  assert.equal(digest(bytes(runtimeFiles.get('game/pvz-portable.wasm'))), oldEngine.artifacts.wasmSha256);
  const archiveData = bytes(sourceArchiveBytes);
  assert.equal(digest(archiveData), currentEngine.artifacts.sourceSha256, 'Actual current source ZIP differs from engine source hash');
  if (!metadataChanged) assert.equal(digest(archiveData), continuityPins.sourceArchive);
  const names = centralNames(archiveData), zip = await originalZipDecoder(zipDecoderBytes).loadAsync(archiveData, {checkCRC32: true});
  assert.equal(Object.keys(zip.files).length, names.size, 'ZIP name normalization changed the directory');
  for (const entry of Object.values(zip.files)) assert.equal(entry.unsafeOriginalName ?? entry.name, entry.name, 'Normalized source ZIP path');
  const sourceNames = [...names].filter(name => !name.endsWith('/') && name.startsWith(prefix + 'source/'));
  const expectedNames = Object.keys(sourceManifest.files).map(name => prefix + 'source/' + pathName(name));
  assert.deepEqual(sourceNames.sort(), expectedNames.sort(), 'The current archive must contain exactly the observed868 source entries');
  const archivedManifest = zip.file(prefix + 'source-manifest.json'); assert(archivedManifest);
  const actualManifest = Buffer.from(await archivedManifest.async('uint8array'));
  assert.deepEqual(actualManifest, oldManifestData, 'Source manifest bytes must remain exactly captured');
  assert.equal(digest(actualManifest), continuityPins.sourceManifest);
  for (const [name, pin] of Object.entries(sourceManifest.files)) {
    assert(Number.isSafeInteger(pin.bytes) && pin.bytes >= 0); assert.match(pin.sha256, /^[a-f0-9]{64}$/);
    const entry = zip.file(prefix + 'source/' + name); assert(entry && !entry.dir);
    const data = Buffer.from(await entry.async('uint8array'));
    assert.equal(data.length, pin.bytes, `Production source size changed: ${name}`);
    assert.equal(digest(data), pin.sha256, `Production source bytes changed: ${name}`);
  }
  // The native archive packs artifacts separately; the served JS/WASM above and
  // the original normal-build receipt below bind their unchanged executable.
  const receipt = zip.file(prefix + 'logs/build-result.json'); assert(receipt);
  assert.deepEqual(Buffer.from(await receipt.async('uint8array')), oldReceiptData, 'Production build receipt must remain captured');
  return Object.freeze({
    kind: metadataChanged ? 'source-metadata-only-successor' : 'captured-metadata-unchanged',
    observedEngineSha256: continuityPins.engine, currentEngineSha256: digest(currentEngineData),
    observedSourceSha256: continuityPins.sourceArchive, currentSourceSha256: digest(archiveData),
    sourceManifestSha256: continuityPins.sourceManifest, productionReceiptSha256: continuityPins.productionReceipt,
    productionPatchSha256: oldEngine.artifacts.patchSha256,
    unchangedProductionSourceEntries: 868, unchangedOtherObservedRuntimeFiles: 18,
    onlyEngineSourceHashChanged: metadataChanged, originalCaptureManifestsPreserved: true,
    freshTimingExecution: false,
  });
}
