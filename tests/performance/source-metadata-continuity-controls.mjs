// SPDX-License-Identifier: MIT
// In-memory negative controls against the actual installed archive. These are
// verifier tests, never substitute captures or newly measured performance.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {originalZipDecoder, verifySourceMetadataContinuity} from './source-metadata-continuity.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const parse = bytes => JSON.parse(Buffer.from(bytes).toString('utf8').replace(/^\uFEFF/, ''));
const changedByte = bytes => { const copy = Buffer.from(bytes); copy[Math.floor(copy.length / 2)] ^= 1; return copy; };
const engineBytes = engine => Buffer.from(JSON.stringify(engine));
const runtimeWith = (input, name, bytes) => new Map([...input.runtimeFiles, [name, bytes]]);

export async function verifyContinuityNegativeControls(input) {
  const rejected = [];
  const reject = async (name, changes, reason) => {
    await assert.rejects(() => verifySourceMetadataContinuity({...input, ...changes}), reason, name);
    rejected.push(name);
  };
  await reject('altered observed engine snapshot',
    {observedEngineBytes: changedByte(input.observedEngineBytes)}, /Observed engine snapshot changed/);
  await reject('altered observed source witness',
    {observedSourceManifestBytes: changedByte(input.observedSourceManifestBytes)}, /Observed source-manifest snapshot changed/);
  await reject('altered observed normal-build receipt',
    {observedReceiptBytes: changedByte(input.observedReceiptBytes)}, /Observed production receipt changed/);
  const otherMetadata = parse(input.runtimeFiles.get('game/engine-provenance.json'));
  otherMetadata.caption += ' altered';
  await reject('unrelated engine metadata field',
    {runtimeFiles: runtimeWith(input, 'game/engine-provenance.json', engineBytes(otherMetadata))}, /Only artifacts.sourceSha256 may change/);
  await reject('altered executable byte',
    {runtimeFiles: runtimeWith(input, 'game/pvz-portable.js', changedByte(input.runtimeFiles.get('game/pvz-portable.js')))}, /Observed runtime bytes changed/);
  await reject('altered shell byte',
    {runtimeFiles: runtimeWith(input, 'index.html', changedByte(input.runtimeFiles.get('index.html')))}, /Observed runtime bytes changed/);
  await reject('altered browser probe', {probeBytes: changedByte(input.probeBytes)}, /Captured browser probe changed/);
  await reject('altered recorder server', {recorderBytes: changedByte(input.recorderBytes)}, /Captured browser recorder\/server changed/);
  await reject('altered production patch', {patchBytes: changedByte(input.patchBytes)}, /Observed production patch bytes changed/);
  const forgedHash = parse(input.runtimeFiles.get('game/engine-provenance.json'));
  forgedHash.artifacts.sourceSha256 = '0'.repeat(64);
  await reject('source hash without matching actual archive',
    {runtimeFiles: runtimeWith(input, 'game/engine-provenance.json', engineBytes(forgedHash))}, /Actual current source ZIP differs/);

  // Hashes in mutable current metadata are not a witness for unchanged code.
  // Repack actual source bytes and update that metadata consistently; the
  // immutable original source manifest must still reject the modified source.
  const decoder = originalZipDecoder(input.zipDecoderBytes);
  const modifiedArchive = async (entryName, mutate) => {
    const zip = await decoder.loadAsync(input.sourceArchiveBytes, {checkCRC32: true});
    const entry = zip.file(entryName); assert(entry);
    zip.file(entryName, mutate(Buffer.from(await entry.async('uint8array'))));
    return Buffer.from(await zip.generateAsync({type: 'uint8array', compression: 'STORE'}));
  };
  const claimedArchive = archive => {
    const engine = parse(input.runtimeFiles.get('game/engine-provenance.json'));
    engine.artifacts.sourceSha256 = sha(archive);
    return {sourceArchiveBytes: archive, runtimeFiles: runtimeWith(input, 'game/engine-provenance.json', engineBytes(engine))};
  };
  const sourceChanged = await modifiedArchive('torch1-candidate/source/src/Lawn/Zombie.cpp', changedByte);
  await reject('modified production source with consistent new ZIP hash', claimedArchive(sourceChanged), /Production source bytes changed/);
  const manifestChanged = await modifiedArchive('torch1-candidate/source-manifest.json', changedByte);
  await reject('forged archived source witness with consistent new ZIP hash', claimedArchive(manifestChanged), /Source manifest bytes must remain exactly captured/);
  const receiptChanged = await modifiedArchive('torch1-candidate/logs/build-result.json', changedByte);
  await reject('modified archived normal receipt with consistent new ZIP hash', claimedArchive(receiptChanged), /Production build receipt must remain captured/);
  return Object.freeze({negativeControls: rejected.length, rejected: Object.freeze(rejected),
    inMemoryOnly: true, captureBytesRewritten: false, freshTimingExecution: false});
}
