// SPDX-License-Identifier: MIT
// Current executable provenance and separately authenticated historical inputs.
import assert from 'node:assert/strict';

export const CURRENT_ENGINE_ID = '0.2.6-web-ambush.1';
export const CURRENT_SOURCE_COUNT = 860;
export const CURRENT_OBJECT_COUNT = 138;
export const SCRAP_ENGINE_ID = '0.2.6-web-scrap.1';
export const SCRAP_ARCHIVE_SHA256 = '6ccb876d55621aa8c31b405c2495b97203fec344905a0920440607557c291a63';
export const AMBUSH_PARENT_REFERENCE_SHA256 = '6771fc13bae02cb70dd8de12192f1f18e50302904a7ef1c784a790e6ccb51dd3';
export const CURRENT_ENDLESS_RETENTION_SHA256 = 'f9259b88c6c901a10c52a4a794f0bd8ac6532ce0db85eab6316ac18a1203db67';
export const CURRENT_SCRAP_RETENTION_SHA256 = 'f01720b1bb81629eac86f9165012c95e46c1dbb04406e3e07f8396422f5a1504';
export const PARENT_TEST_INPUTS_SHA256 = '7d6c2749a2d9d1ae462e964447e017f4fcd0e3146909de210ddacaab06be8c82';
export const AMBUSH_SOURCE_ADDITIONS = ['src/Lawn/System/VaseAmbush.cpp', 'src/Lawn/System/VaseAmbush.h',
  'src/Lawn/System/VaseAmbushPresentation.cpp', 'src/Lawn/System/VaseAmbushPresentation.h'];
export const ENDLESS3_ENGINE_ID = '0.2.6-web-endless.3';
export const ENDLESS3_ARCHIVE_SHA256 = '206e5e16b0c4ae7c8b88afd94e627943b4cd15c56f82113fcaf4bb1adf4c13b1';
export const SCRAP_PARENT_REFERENCE_SHA256 = '8b58d26c299ca9c277f091354c5ec90b4fc5f1af0fc38ab76169880fd164299e';
export const SCRAP_ENDLESS_RETENTION_SHA256 = 'af4c6dfbed0495189e01a9c7b101c748736afc290de880f1fbe4f75ffdf2b6ca';
export const SCRAP_SOURCE_ADDITIONS = ['src/Lawn/System/ScrapYard.cpp', 'src/Lawn/System/ScrapYard.h',
  'src/Lawn/System/ScrapYardPresentation.cpp', 'src/Lawn/System/ScrapYardPresentation.h'];
const modifiedParentPaths = ['CMake/ProjectVersion.cmake', 'src/ConstEnums.h', 'src/Lawn/Plant.cpp',
  'src/Lawn/Board.cpp', 'src/Lawn/Challenge.cpp', 'src/Lawn/Zombie.cpp', 'src/Lawn/System/BonusChallenge.h',
  'src/Lawn/Widget/ChallengeScreen.cpp', 'src/LawnApp.cpp'];
const safeName = name => assert(typeof name === 'string' && name.length && !name.startsWith('/') &&
  !/[\\:]/.test(name) && !name.split('/').some(part => !part || part === '.' || part === '..'));
const digest = value => assert.match(value, /^[a-f0-9]{64}$/);

export async function reconstructEndless3Sources({referenceBytes, read, sha, engine}) {
  assert.equal(sha(referenceBytes), SCRAP_PARENT_REFERENCE_SHA256,
    'Independent parent source pins and reverse edits retain their reviewed fixture bytes');
  const reference = JSON.parse(referenceBytes);
  assert.equal(reference.schemaVersion, 1);
  assert.equal(engine.id, SCRAP_ENGINE_ID);
  assert.equal(engine.parent.id, ENDLESS3_ENGINE_ID);
  assert.equal(engine.parent.artifacts.sourceSha256, ENDLESS3_ARCHIVE_SHA256);
  assert.equal(reference.parent.id, ENDLESS3_ENGINE_ID);
  assert.equal(reference.parent.archiveSha256, ENDLESS3_ARCHIVE_SHA256);
  assert.equal(reference.parent.archivePrefix, 'endless3-candidate/source/');
  assert.equal(reference.current.id, SCRAP_ENGINE_ID);
  assert.equal(reference.current.sourceCount, 856);
  assert.equal(Object.keys(reference.files).length, 852);
  assert.deepEqual(Object.keys(reference.reverseEdits).sort(), [...modifiedParentPaths].sort(),
    'Only the nine reviewed existing source files change for Scrap Yard');
  for (const name of SCRAP_SOURCE_ADDITIONS) assert(!Object.hasOwn(reference.files, name));
  const files = new Map();
  for (const [name, pin] of Object.entries(reference.files)) {
    safeName(name); digest(pin.sha256); digest(pin.normalizedSha256);
    let bytes = Buffer.from(await read('source/' + name));
    const delta = reference.reverseEdits[name];
    if (delta) {
      assert.equal(bytes.length, delta.currentBytes); digest(delta.currentSha256);
      assert.equal(sha(bytes), delta.currentSha256, 'Authenticate the current file before reversing Scrap Yard edits: ' + name);
      assert(Array.isArray(delta.edits) && delta.edits.length > 0);
      let previous = bytes.length + 1;
      for (const edit of [...delta.edits].reverse()) {
        const before = Buffer.from(edit.beforeBase64, 'base64'), after = Buffer.from(edit.afterBase64, 'base64');
        assert(Number.isSafeInteger(edit.offset) && edit.offset >= 0 && edit.offset < previous);
        assert(edit.offset + before.length <= previous && edit.offset + before.length <= bytes.length);
        assert.deepEqual(bytes.subarray(edit.offset, edit.offset + before.length), before,
          'Exact current-to-published-Endless.3 byte edit: ' + name);
        bytes = Buffer.concat([bytes.subarray(0, edit.offset), after, bytes.subarray(edit.offset + before.length)]);
        previous = edit.offset;
      }
    }
    assert.equal(bytes.length, pin.bytes);
    assert.equal(sha(bytes), pin.sha256, 'Every complete historical source matches its independent published Endless.3 pin: ' + name);
    assert.equal(sha(Buffer.from(bytes.toString('latin1').replace(/\r\n?/g, '\n'), 'latin1')), pin.normalizedSha256);
    files.set(name, bytes);
  }
  return {files, manifest: {version: ENDLESS3_ENGINE_ID, files: reference.files}};
}

export function historicalEngine(engine, id) {
  const visited = new Set();
  for (let current = engine; current; current = current.parent) {
    assert(current && typeof current === 'object' && !visited.has(current.id), 'Invalid release ancestry');
    visited.add(current.id);
    if (current.id === id) return current;
    assert(visited.size < 64, 'Release ancestry is bounded');
  }
  assert.fail('Missing authenticated historical release: ' + id);
}

export async function verifyRetainedParentInputs({read, sha}) {
  const bytes = await read('tests/ambush1-retained-parent/manifest.json');
  assert.equal(sha(bytes), PARENT_TEST_INPUTS_SHA256, 'Independently authenticated published test-input inventory');
  const manifest = JSON.parse(bytes);
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.parentEngineId, SCRAP_ENGINE_ID);
  assert.equal(manifest.parentArchiveSha256, SCRAP_ARCHIVE_SHA256);
  assert.equal(Object.keys(manifest.files).length, 126);
  for (const [name, pin] of Object.entries(manifest.files)) {
    safeName(name); assert(!name.includes('/')); digest(pin.sha256);
    assert.equal(pin.publishedArchivePath, 'scrap1-candidate/tests/' + name);
    const original = await read('tests/ambush1-retained-parent/' + name);
    assert.equal(original.length, pin.bytes);
    assert.equal(sha(original), pin.sha256, 'Retained published test input: ' + name);
  }
  return manifest;
}

export async function reconstructScrapSources({referenceBytes, read, sha, engine}) {
  assert.equal(sha(referenceBytes), AMBUSH_PARENT_REFERENCE_SHA256, 'Reviewed complete Scrap parent projection');
  const reference = JSON.parse(referenceBytes);
  assert.equal(reference.schemaVersion, 1);
  assert.equal(engine.id, CURRENT_ENGINE_ID);
  assert.equal(engine.parent.id, SCRAP_ENGINE_ID);
  assert.equal(engine.parent.artifacts.sourceSha256, SCRAP_ARCHIVE_SHA256);
  assert.equal(reference.parent.id, SCRAP_ENGINE_ID);
  assert.equal(reference.parent.archiveSha256, SCRAP_ARCHIVE_SHA256);
  assert.equal(reference.parent.archivePrefix, 'scrap1-candidate/source/');
  assert.equal(reference.current.id, CURRENT_ENGINE_ID);
  assert.equal(reference.current.sourceCount, CURRENT_SOURCE_COUNT);
  assert.equal(Object.keys(reference.files).length, 856);
  for (const name of AMBUSH_SOURCE_ADDITIONS) assert(!Object.hasOwn(reference.files, name));
  const files = new Map();
  for (const [name, pin] of Object.entries(reference.files)) {
    safeName(name); digest(pin.sha256); digest(pin.normalizedSha256);
    let bytes = Buffer.from(await read('source/' + name));
    const delta = reference.reverseEdits[name];
    if (delta) {
      assert.equal(bytes.length, delta.currentBytes); digest(delta.currentSha256);
      assert.equal(sha(bytes), delta.currentSha256, 'Current parent-projection input: ' + name);
      let previous = bytes.length + 1;
      for (const edit of [...delta.edits].reverse()) {
        const before = Buffer.from(edit.beforeBase64, 'base64'), after = Buffer.from(edit.afterBase64, 'base64');
        assert(Number.isSafeInteger(edit.offset) && edit.offset >= 0 && edit.offset < previous);
        assert(edit.offset + before.length <= previous && edit.offset + before.length <= bytes.length);
        assert.deepEqual(bytes.subarray(edit.offset, edit.offset + before.length), before);
        bytes = Buffer.concat([bytes.subarray(0, edit.offset), after, bytes.subarray(edit.offset + before.length)]);
        previous = edit.offset;
      }
    }
    assert.equal(bytes.length, pin.bytes);
    assert.equal(sha(bytes), pin.sha256, 'Every complete historical Scrap source retains its published pin: ' + name);
    assert.equal(sha(Buffer.from(bytes.toString('latin1').replace(/\r\n?/g, '\n'), 'latin1')), pin.normalizedSha256);
    files.set(name, bytes);
  }
  return {files, manifest: {version: SCRAP_ENGINE_ID, files: reference.files}};
}
