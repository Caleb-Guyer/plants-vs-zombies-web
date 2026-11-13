// SPDX-License-Identifier: MIT
// Current executable provenance and separately authenticated historical inputs.
import assert from 'node:assert/strict';
import fs from 'node:fs';

export const CURRENT_ENGINE_ID = '0.2.6-web-double.1';
export const CURRENT_SOURCE_COUNT = 872;
export const CURRENT_OBJECT_COUNT = 144;
export const TORCH_ENGINE_ID = '0.2.6-web-torch.1';
export const TORCH_ARCHIVE_SHA256 = '2e7f7d49093a1aa93d350558b568d2b81b615632b33613631f630a484872b3ba';
// Final source/evidence pins are deliberately closed until the actual source
// freeze and the complete current native matrices have been reviewed.
export const DOUBLE_PARENT_REFERENCE_SHA256 = 'a22e68371f7ad0f794b7e1f9221ed8bb45e7220df3501b8281435dcaf244a160';
export const TORCH_FOCUSED_REFERENCE_SHA256 = 'a3c65dcd0e476898ea7c28756a6406f7b9b1e2a594162642bd207b8ec98baba6';
export const DOUBLE_PARENT_TEST_INPUTS_SHA256 = '89fae9ba9689f6b74a44282a51219871d73badee97a4de758b817f972ca2c69b';
export const DOUBLE_SOURCE_ADDITIONS = ['DoubleAgent', 'DoubleAgentPresentation']
  .flatMap(name => ['src/Lawn/System/' + name + '.cpp', 'src/Lawn/System/' + name + '.h']);
export const AMBUSH_ENGINE_ID = '0.2.6-web-ambush.1';
export const AMBUSH_ARCHIVE_SHA256 = '6da0b6e19d56b3b345a684d379453abecff055a6d788cc17bd161f412bf3e7c9';
export const AMBUSH_FOCUSED_REFERENCE_SHA256 = '9463bdd7c262c1749c57b00d25d45257951f8b8b2c8d4511cff630f9c606e9c8';
export const TORCH_PARENT_REFERENCE_SHA256 = '14dc78f0593db13b4e17e559061f84996be9c64f23663bd9ef7556b669fc96f6';
export const TORCH_PARENT_TEST_INPUTS_SHA256 = '011d5162458ab4523ecee51048e9d2d70e7d98a6806f8b9efcc50cecd98e57a6';
export const TORCH_SOURCE_ADDITIONS = ['FireDrill', 'FireDrillPresentation', 'TorchbearerZombie', 'TorchbearerPresentation']
  .flatMap(name => ['src/Lawn/System/' + name + '.cpp', 'src/Lawn/System/' + name + '.h']);
export const SCRAP_ENGINE_ID = '0.2.6-web-scrap.1';
export const SCRAP_ARCHIVE_SHA256 = '6ccb876d55621aa8c31b405c2495b97203fec344905a0920440607557c291a63';
export const AMBUSH_PARENT_REFERENCE_SHA256 = '6771fc13bae02cb70dd8de12192f1f18e50302904a7ef1c784a790e6ccb51dd3';
export const AMBUSH_ENDLESS_RETENTION_SHA256 = 'f9259b88c6c901a10c52a4a794f0bd8ac6532ce0db85eab6316ac18a1203db67';
export const AMBUSH_SCRAP_RETENTION_SHA256 = 'f01720b1bb81629eac86f9165012c95e46c1dbb04406e3e07f8396422f5a1504';
// These current envelopes were reviewed against their completed native matrices;
// each historical gameplay contract and its original assertions remain pinned.
export const TORCH_RETENTION_PINS = Object.freeze({
  endless: '21e08344ad6e58baf78c309d1fe461ec621c2ea7ebe9b0531843bef51fd1188d',
  scrap: '4fbd9e4c8176bbff29c28bace6ec1acbb12a3aac0cd82ff8a705eb086f65ed09',
  vase: '55131a41464c2e319581a656fece9737172cca687a4a3ae01cc83942c6a332db',
});
const reviewedDoubleRetentionPins = Object.freeze({
  endless:'c7b42b90c046abba841153b761d63689b30f0f8962c66912ee74f932ee7b7631',
  scrap:'39f6c0f3a9fc3406039d6f2aae06804e9c8d39940204f32ac95157c7fde9ccff',
  vase:'05025af9fa6976e55aa6d158d875733fac80dde9739449f7c6341468785e71b3',
  torch:'ddfbb060d29ff59dc04770b7c068f4b1f1973a1f14b1d94adde02cb44f0461b7',
});
export const CURRENT_ENDLESS_RETENTION_SHA256 = reviewedDoubleRetentionPins.endless;
export const CURRENT_SCRAP_RETENTION_SHA256 = reviewedDoubleRetentionPins.scrap;
export const CURRENT_VASE_RETENTION_SHA256 = reviewedDoubleRetentionPins.vase;
export const CURRENT_TORCH_RETENTION_SHA256 = reviewedDoubleRetentionPins.torch;
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

export async function reconstructAmbushFocusedEvidence({referenceBytes,read,sha,engine,sourceFiles}) {
  assert.equal(sha(referenceBytes),AMBUSH_FOCUSED_REFERENCE_SHA256,
    'Exact published focused evidence is independently pinned, not inferred from current test outcomes');
  engine=historicalEngine(engine,TORCH_ENGINE_ID);
  assert.equal(engine.id,TORCH_ENGINE_ID);assert.equal(engine.parent.id,AMBUSH_ENGINE_ID);
  assert.equal(engine.parent.artifacts.sourceSha256,AMBUSH_ARCHIVE_SHA256);
  const reference=JSON.parse(referenceBytes);
  assert.equal(reference.schemaVersion,1);assert.equal(reference.parentEngineId,AMBUSH_ENGINE_ID);
  assert.equal(reference.parentArchiveSha256,AMBUSH_ARCHIVE_SHA256);assert.equal(reference.parentArchiveBytes,25841863);
  assert.equal(reference.sourceProjection,'torch1-parent-reference.json');assert.equal(reference.sourceCount,860);
  assert.equal(sourceFiles.size,860);
  const reports=['game-speed','qol-controls','decks-cooldowns','bonus-challenge','bonus-completion','night-shift',
    'lantern-shroom','garden-shuffle','seed-swap','mender-bloom','intensive-care','native-layout','care-fatigue'];
  assert.deepEqual(reference.reportNames,reports);
  assert.equal(Object.keys(reference.sourcePins).length,105);assert.equal(Object.keys(reference.files).length,88);
  const files=new Map();let inline=0;
  for(const [name,pin]of Object.entries(reference.sourcePins)){
    safeName(name);assert(name.startsWith('source/'));digest(pin);
    const bytes=sourceFiles.get(name.slice(7));assert(bytes,name);assert.equal(sha(bytes),pin,name);files.set(name,bytes);
  }
  for(const [name,pin]of Object.entries(reference.files)){
    safeName(name);digest(pin.sha256);assert(Number.isSafeInteger(pin.bytes)&&pin.bytes>0);
    const stored=Object.hasOwn(pin,'currentPath');
    assert.deepEqual(Object.keys(pin).sort(),['bytes','sha256',stored?'currentPath':'base64'].sort());
    let bytes;
    if(stored){safeName(pin.currentPath);assert(pin.currentPath.startsWith('tests/'));bytes=Buffer.from(await read(pin.currentPath));}
    else{
      assert(reports.some(report=>name==='tests/'+report+'-results.json'),'Only the thirteen actual published reports need inline bytes');
      bytes=Buffer.from(pin.base64,'base64');assert.equal(bytes.toString('base64'),pin.base64);inline++;
    }
    assert.equal(bytes.length,pin.bytes,name);assert.equal(sha(bytes),pin.sha256,name);files.set(name,bytes);
  }
  assert.equal(inline,13);assert.equal(files.size,193);
  return async name=>{safeName(name);const bytes=files.get(name);assert(bytes,'Unreviewed historical focused input: '+name);return bytes;};
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
  assert.equal(engine.id, AMBUSH_ENGINE_ID);
  assert.equal(engine.parent.id, SCRAP_ENGINE_ID);
  assert.equal(engine.parent.artifacts.sourceSha256, SCRAP_ARCHIVE_SHA256);
  assert.equal(reference.parent.id, SCRAP_ENGINE_ID);
  assert.equal(reference.parent.archiveSha256, SCRAP_ARCHIVE_SHA256);
  assert.equal(reference.parent.archivePrefix, 'scrap1-candidate/source/');
  assert.equal(reference.current.id, AMBUSH_ENGINE_ID);
  assert.equal(reference.current.sourceCount, 860);
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

export async function verifyTorchRetainedParentInputs({read, sha}) {
  const bytes = await read('tests/torch1-retained-parent/manifest.json');
  assert.equal(sha(bytes), TORCH_PARENT_TEST_INPUTS_SHA256, 'Immutable published Ambush test-input inventory');
  const manifest = JSON.parse(bytes);
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.parentEngineId, AMBUSH_ENGINE_ID);
  assert.equal(manifest.parentArchiveSha256, AMBUSH_ARCHIVE_SHA256);
  assert.equal(Object.keys(manifest.files).length, 166);
  for (const [name, pin] of Object.entries(manifest.files)) {
    safeName(name); assert(!name.includes('/')); digest(pin.sha256);
    assert.equal(pin.publishedArchivePath, 'ambush1-candidate/tests/' + name);
    const original = await read('tests/torch1-retained-parent/' + name);
    assert.equal(original.length, pin.bytes);
    assert.equal(sha(original), pin.sha256, 'Exact published Ambush test input: ' + name);
  }
  return manifest;
}

export async function reconstructAmbushSources({referenceBytes, read, sha, engine}) {
  if (engine.id === CURRENT_ENGINE_ID) {
    const projected = await torchSourceReader({read,sha,engine});
    read = projected.read;
    engine = projected.engine;
  }
  assert.equal(sha(referenceBytes), TORCH_PARENT_REFERENCE_SHA256, 'Reviewed complete Ambush parent projection');
  const reference = JSON.parse(referenceBytes);
  assert.equal(reference.schemaVersion, 1);
  assert.equal(engine.id, TORCH_ENGINE_ID);
  assert.equal(engine.parent.id, AMBUSH_ENGINE_ID);
  assert.equal(engine.parent.artifacts.sourceSha256, AMBUSH_ARCHIVE_SHA256);
  assert.deepEqual(reference.parent, {id: AMBUSH_ENGINE_ID, archiveSha256: AMBUSH_ARCHIVE_SHA256,
    archivePrefix: 'ambush1-candidate/source/'});
  assert.deepEqual(reference.current, {id: TORCH_ENGINE_ID, sourceCount: 868});
  assert.equal(Object.keys(reference.files).length, 860);
  assert.deepEqual(Object.keys(reference.reverseEdits).sort(), ['CMake/ProjectVersion.cmake', 'src/ConstEnums.h',
    'src/Lawn/Board.cpp', 'src/Lawn/Challenge.cpp', 'src/Lawn/Challenge.h', 'src/Lawn/System/BonusChallenge.h',
    'src/Lawn/System/PoolPanicEndless.cpp', 'src/Lawn/System/PoolPanicEndless.h',
    'src/Lawn/System/ReanimationLawn.cpp', 'src/Lawn/Widget/AlmanacDialog.cpp',
    'src/Lawn/Widget/AlmanacDialog.h', 'src/Lawn/Widget/ChallengeScreen.cpp', 'src/Lawn/Zombie.cpp',
    'src/LawnApp.cpp'].sort(), 'Only the fourteen reviewed existing source paths change for Torchbearer');
  for (const name of TORCH_SOURCE_ADDITIONS) assert(!Object.hasOwn(reference.files, name));
  const files = new Map();
  for (const [name, pin] of Object.entries(reference.files)) {
    safeName(name); digest(pin.sha256); digest(pin.normalizedSha256);
    let bytes = Buffer.from(await read('source/' + name));
    const delta = reference.reverseEdits[name];
    if (delta) {
      assert.equal(bytes.length, delta.currentBytes); digest(delta.currentSha256);
      assert.equal(sha(bytes), delta.currentSha256, 'Exact Torch parent-projection input: ' + name);
      assert(Array.isArray(delta.edits) && delta.edits.length > 0);
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
    assert.equal(sha(bytes), pin.sha256, 'Every complete historical Ambush source retains its published pin: ' + name);
    assert.equal(sha(Buffer.from(bytes.toString('latin1').replace(/\r\n?/g, '\n'), 'latin1')), pin.normalizedSha256);
    files.set(name, bytes);
  }
  return {files, manifest: {version: AMBUSH_ENGINE_ID, files: reference.files}};
}

export async function reconstructTorchSources({referenceBytes,read,sha,engine}) {
  assert(DOUBLE_PARENT_REFERENCE_SHA256,'The Double Agent source projection has not been frozen');
  assert.equal(sha(referenceBytes),DOUBLE_PARENT_REFERENCE_SHA256,'Reviewed complete Torch parent projection');
  assert.equal(engine.id,CURRENT_ENGINE_ID);
  assert.equal(engine.parent.id,TORCH_ENGINE_ID);
  assert.equal(engine.parent.artifacts.sourceSha256,TORCH_ARCHIVE_SHA256);
  const reference=JSON.parse(referenceBytes);
  assert.equal(reference.schemaVersion,1);
  assert.deepEqual(reference.parent,{id:TORCH_ENGINE_ID,archiveSha256:TORCH_ARCHIVE_SHA256,
    archivePrefix:'torch1-candidate/source/'});
  assert.deepEqual(reference.current,{id:CURRENT_ENGINE_ID,sourceCount:CURRENT_SOURCE_COUNT});
  assert.equal(Object.keys(reference.files).length,868);
  // This exact reviewed changed-path inventory is pinned in the complete
  // fixture; no source path can be inserted, dropped or silently repinned.
  assert(Array.isArray(reference.changedPaths));
  assert.deepEqual(Object.keys(reference.reverseEdits).sort(),[...reference.changedPaths].sort());
  for(const name of DOUBLE_SOURCE_ADDITIONS)assert(!Object.hasOwn(reference.files,name));
  const files=new Map();
  for(const [name,pin]of Object.entries(reference.files)){
    safeName(name);digest(pin.sha256);digest(pin.normalizedSha256);
    let bytes=Buffer.from(await read('source/'+name));
    const delta=reference.reverseEdits[name];
    if(delta){
      assert.equal(bytes.length,delta.currentBytes);digest(delta.currentSha256);
      assert.equal(sha(bytes),delta.currentSha256,'Exact Double Agent source projection input: '+name);
      assert(Array.isArray(delta.edits)&&delta.edits.length>0);
      let previous=bytes.length+1;
      for(const edit of [...delta.edits].reverse()){
        const before=Buffer.from(edit.beforeBase64,'base64'),after=Buffer.from(edit.afterBase64,'base64');
        assert(Number.isSafeInteger(edit.offset)&&edit.offset>=0&&edit.offset<previous);
        assert(edit.offset+before.length<=previous&&edit.offset+before.length<=bytes.length);
        assert.deepEqual(bytes.subarray(edit.offset,edit.offset+before.length),before);
        bytes=Buffer.concat([bytes.subarray(0,edit.offset),after,bytes.subarray(edit.offset+before.length)]);
        previous=edit.offset;
      }
    }
    assert.equal(bytes.length,pin.bytes);
    assert.equal(sha(bytes),pin.sha256,'Every complete published Torch source retains its independent pin: '+name);
    assert.equal(sha(Buffer.from(bytes.toString('latin1').replace(/\r\n?/g,'\n'),'latin1')),pin.normalizedSha256);
    files.set(name,bytes);
  }
  return {files,manifest:{version:TORCH_ENGINE_ID,files:reference.files}};
}

export async function torchSourceReader({read,sha,engine,referenceBytes}) {
  if(engine.id===TORCH_ENGINE_ID)return {read,engine};
  assert.equal(engine.id,CURRENT_ENGINE_ID);
  referenceBytes ??= fs.readFileSync(new URL('./fixtures/double1-parent-reference.json',import.meta.url));
  const projected=await reconstructTorchSources({referenceBytes,read,sha,engine});
  return {engine:engine.parent,files:projected.files,
    read:async name=>{
      if(!name.startsWith('source/'))return read(name);
      safeName(name);const bytes=projected.files.get(name.slice(7));
      assert(bytes,'Unreviewed historical Torch source path: '+name);return bytes;
    }};
}

export async function verifyDoubleRetainedParentInputs({read,sha}) {
  const bytes=await read('tests/double1-retained-parent/manifest.json');
  assert.equal(sha(bytes),DOUBLE_PARENT_TEST_INPUTS_SHA256,'Independently authenticated published Torch test inputs');
  const manifest=JSON.parse(bytes);
  assert.equal(manifest.schemaVersion,1);assert.equal(manifest.parentEngineId,TORCH_ENGINE_ID);
  assert.equal(manifest.parentArchiveSha256,TORCH_ARCHIVE_SHA256);
  assert.equal(manifest.parentArchivePrefix,'torch1-candidate/');assert.equal(manifest.currentEngineId,CURRENT_ENGINE_ID);
  assert.equal(Object.keys(manifest.files).length,44);
  for(const [name,pin]of Object.entries(manifest.files)){
    safeName(name);assert(name.startsWith('tests/'));safeName(pin.snapshot);assert(!pin.snapshot.includes('/'));
    digest(pin.sha256);assert(Number.isSafeInteger(pin.bytes)&&pin.bytes>0);
    const original=Buffer.from(await read('tests/double1-retained-parent/'+pin.snapshot));
    assert.equal(original.length,pin.bytes);assert.equal(sha(original),pin.sha256,'Exact published Torch test input: '+name);
  }
  return manifest;
}

export async function verifyPublishedTorchAdapter({read,sha,adapter,family}) {
  assert(Object.hasOwn(TORCH_RETENTION_PINS,family));
  const original=await read('tests/torch1-'+family+'-retention.json');
  const pin=TORCH_RETENTION_PINS[family];assert.equal(sha(original),pin);
  assert.equal(adapter.publishedTorchAdapterSha256,pin,'The current execution envelope retains the exact published Torch adapter');
  const retained=await verifyDoubleRetainedParentInputs({read,sha});
  assert.equal(retained.files['tests/torch1-'+family+'-retention.json'].sha256,pin);
  const old=JSON.parse(original);assert.equal(old.engineId,TORCH_ENGINE_ID);
  if(family==='endless'){
    assert(!Object.hasOwn(old,'parentArchiveSha256'));
    assert.equal(old.publishedAmbushAdapterSha256,AMBUSH_ENDLESS_RETENTION_SHA256);
  }else{
    assert.equal(old.parentEngineId,AMBUSH_ENGINE_ID);
    assert.equal(old.parentArchiveSha256,AMBUSH_ARCHIVE_SHA256);
  }
  assert.equal(old.productionObjectCount,142);
  assert.equal(old[family==='endless'?'productionSourceFiles':'sourceCount'],868);
  assert.equal(old.historicalContractSha256,adapter.historicalContractSha256);
  return old;
}

export async function reconstructTorchFocusedEvidence({referenceBytes,read,sha,engine,sourceFiles}) {
  assert.equal(sha(referenceBytes),TORCH_FOCUSED_REFERENCE_SHA256,'Every old Torch focused input retains its published bytes');
  const parent=historicalEngine(engine,TORCH_ENGINE_ID);assert.equal(parent.artifacts.sourceSha256,TORCH_ARCHIVE_SHA256);
  const reference=JSON.parse(referenceBytes);
  assert.equal(reference.schemaVersion,1);assert.equal(reference.parentEngineId,TORCH_ENGINE_ID);
  assert.equal(reference.parentArchiveSha256,TORCH_ARCHIVE_SHA256);assert.equal(reference.parentArchiveBytes,31579254);
  assert.equal(reference.sourceProjection,'double1-parent-reference.json');assert.equal(reference.sourceCount,868);
  assert.equal(sourceFiles.size,868);
  const reports=['game-speed','qol-controls','decks-cooldowns','bonus-challenge','bonus-completion','night-shift',
    'lantern-shroom','garden-shuffle','seed-swap','mender-bloom','intensive-care','native-layout','care-fatigue'];
  assert.deepEqual(reference.reportNames,reports);
  assert.equal(Object.keys(reference.sourcePins).length,113);assert.equal(Object.keys(reference.files).length,88);
  const files=new Map();let inline=0;
  for(const [name,pin]of Object.entries(reference.sourcePins)){
    safeName(name);assert(name.startsWith('source/'));digest(pin);
    const bytes=sourceFiles.get(name.slice(7));assert(bytes,name);assert.equal(sha(bytes),pin,name);files.set(name,bytes);
  }
  for(const [name,pin]of Object.entries(reference.files)){
    safeName(name);digest(pin.sha256);assert(Number.isSafeInteger(pin.bytes)&&pin.bytes>0);
    const stored=Object.hasOwn(pin,'currentPath');
    assert.deepEqual(Object.keys(pin).sort(),['bytes','sha256',stored?'currentPath':'base64'].sort());
    let bytes;
    if(stored){
      safeName(pin.currentPath);assert(/^tests\/(?:torch1-|scrap1-|ambush1-|double1-retained-parent\/)/.test(pin.currentPath));
      bytes=Buffer.from(await read(pin.currentPath));
    }else{
      assert(['logs/build-result.json','logs/source-before.json','logs/source-after.json'].includes(name)||
        reports.some(report=>['tests/'+report+'-results.json','tests/'+report+'-harness.cpp'].includes(name)),
        'Only exact old reports, harnesses and normal-build observations require inline bytes');
      bytes=Buffer.from(pin.base64,'base64');assert.equal(bytes.toString('base64'),pin.base64);inline++;
    }
    assert.equal(bytes.length,pin.bytes,name);assert.equal(sha(bytes),pin.sha256,name);files.set(name,bytes);
  }
  assert.equal(inline,29);assert.equal(files.size,201);
  const historicalRead=async name=>{safeName(name);const bytes=files.get(name);assert(bytes,'Unreviewed historical Torch input: '+name);return bytes;};
  historicalRead.has=name=>{safeName(name);return files.has(name);};
  return historicalRead;
}
