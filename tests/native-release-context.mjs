// SPDX-License-Identifier: MIT
// Current executable provenance and separately authenticated historical inputs.
import assert from 'node:assert/strict';
import fs from 'node:fs';

export const CURRENT_ENGINE_ID = '0.2.6-web-zvase.1';
export const CURRENT_SOURCE_COUNT = 891;
export const CURRENT_OBJECT_COUNT = 153;
// Root reviewed the actual unchanged frozen891/153 normal build.
export const CURRENT_NORMAL_RECEIPT_SHA256 = '7351dfbf72f989cddf155ac334b19e181bb898a86896817f6a26af5e1789c1dd';

export const ZVASE_PARENT_ENGINE_ID = '0.2.6-web-zsurvival.1';
export const ZVASE_PARENT_SOURCE_COUNT = 888;
export const ZVASE_PARENT_OBJECT_COUNT = 152;
export const ZVASE_PARENT_NORMAL_SHA256 = '6ea3a215e5c3e7ac3e4cccd238e9c759173e68ebd248b6cadfbb48e76d033fe8';
export const ZVASE_PARENT_ARCHIVE_SHA256 = 'a3bebe9b89f0816f4e44e00ee4edf3b3a93ec95f1d2e301f26c793252b88d5ba';
export const ZVASE_PARENT_REFERENCE_SHA256 = 'c5d8a49fc25337feb574ffbf8be2114a530310522a1a43fd02dcfb7753c95625'; // Root replayed every888 published byte; current source remains held.
export const ZVASE_SOURCE_ADDITIONS = ['src/Lawn/System/ZombotanyVasebreaker.cpp',
 'src/Lawn/System/ZombotanyVasebreaker.h','src/Lawn/System/ZombotanyVasebreakerBoards.h'];
const ZVASE_PARENT_CHANGED_PATHS = [
 "CMake/ProjectVersion.cmake",
 "src/ConstEnums.h",
 "src/Lawn/Board.cpp",
 "src/Lawn/Challenge.cpp",
 "src/Lawn/GridItem.cpp",
 "src/Lawn/System/ReanimationLawn.cpp",
 "src/Lawn/System/ReanimationLawn.h",
 "src/Lawn/Widget/AwardScreen.cpp",
 "src/Lawn/Widget/ChallengeScreen.cpp",
 "src/Lawn/Widget/ChallengeScreen.h",
 "src/Lawn/Widget/ContinueDialog.cpp",
 "src/Lawn/Widget/LawnDialog.cpp",
 "src/Lawn/Zombie.cpp",
 "src/LawnApp.cpp"
];
export const ZSURVIVAL_PARENT_ENGINE_ID = '0.2.6-web-zombotany45.2';
export const ZSURVIVAL_PARENT_SOURCE_COUNT = 886;
export const ZSURVIVAL_PARENT_OBJECT_COUNT = 151;
export const ZSURVIVAL_PARENT_ARCHIVE_SHA256 = 'b7bd098307ffeb7a46379951942c3bc767f016e1c342210e2a43af412a03c7ff';
export const ZSURVIVAL_PARENT_REFERENCE_SHA256 = 'f785a81fa30c9de62f2527d0c24beeb84a0152bfb8336d7e28a06fdf7bd71ef4';
export const ZSURVIVAL_SOURCE_ADDITIONS = ['src/Lawn/System/ZombotanySurvival.cpp','src/Lawn/System/ZombotanySurvival.h'];
export const GUST_ENGINE_ID = '0.2.6-web-gust.1';
export const GUST_SOURCE_COUNT = 878;
export const GUST_OBJECT_COUNT = 147;
export const GUST_ARCHIVE_SHA256 = '10acb269866b175ed4836c2c64c6a79dc86a11241de9e48c7be54f8f89808be8';
export const ZOMBOTANY3_PARENT_REFERENCE_SHA256 = 'b7be60f52c989f5167b7582b46a4b75824a0748cefe443881c80888e31397cb9';
export const GUST_FOCUSED_REFERENCE_SHA256 = '5f213369ad0e86e5e15c2f75e3eb267243350ac7f310df1efc55dddbc0a4e793';
export const ZOMBOTANY3_PARENT_TEST_INPUTS_SHA256 = '8f6a5558869df5e204496ac89ed5467534fa55b7ce96cb05e1d0eb457a11d52c';
export const ZOMBOTANY3_SOURCE_ADDITIONS = ['Zombotany3','Zombotany3Art','Zombotany45','Zombotany45Art']
 .flatMap(name=>['src/Lawn/System/'+name+'.cpp','src/Lawn/System/'+name+'.h']);
export const DOUBLE_ENGINE_ID = '0.2.6-web-double.1';
export const DOUBLE_SOURCE_COUNT = 872;
export const DOUBLE_OBJECT_COUNT = 144;
export const DOUBLE_ARCHIVE_SHA256 = '35b635770bbb040dd3b2c41c4c86ed49f351cbd29926b8efa286394ff89ad5b3';
export const GUST_PARENT_REFERENCE_SHA256 = '14b5ef8f794cbfb5cb687f24cf05d23fa63620339945f139d2c5d947e9827476';
export const DOUBLE_FOCUSED_REFERENCE_SHA256 = '965a041ea2b3afc736cb756ebf80750aa5cf9478e36dd91426a1f12311e9a2b2';
export const GUST_PARENT_TEST_INPUTS_SHA256 = 'afae585b66dfaef7effed2fcdf4e352bb3d273a2e77b4ad50a093a177e0aea67';
export const GUST_SOURCE_ADDITIONS = ['GustBloom','GustChallenge','GustBloomArt']
 .flatMap(name=>['src/Lawn/System/'+name+'.cpp','src/Lawn/System/'+name+'.h']);
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
export const CURRENT_ENDLESS_RETENTION_SHA256 = '34866b4024eac98dabd6a1b7b376dd117ae76ba7d63904b9cc55b402d25d85c1';
export const CURRENT_SCRAP_RETENTION_SHA256 = '14ad62fb268ca65ed5b9915334d7f1d6610ac7a0fc1608c73f371ad6fc43b12f';
export const CURRENT_VASE_RETENTION_SHA256 = '82ab5ba34b52151045a53f50e4313fba10e1e6391b201b53865d1a053c83138e';
export const CURRENT_TORCH_RETENTION_SHA256 = 'ed86e28c6b2ed12124d65422f2a29613c4f7206a907c5d12a5f4206265234e8c';
export const CURRENT_DOUBLE_RETENTION_SHA256 = 'c5e7bf3fb4774b9b730cdbd1545d3a4ffd893b60cbae9cbfb811dc3e5c54292f';
export const CURRENT_GUST_RETENTION_SHA256 = '1891d45cafb61d5a7001fc8a224902d09126d62f1e267845370105d763bc92f5';
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
  if (engine.id === CURRENT_ENGINE_ID || engine.id === GUST_ENGINE_ID || engine.id === DOUBLE_ENGINE_ID) {
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
  assert.equal(engine.id,DOUBLE_ENGINE_ID);
  assert.equal(engine.parent.id,TORCH_ENGINE_ID);
  assert.equal(engine.parent.artifacts.sourceSha256,TORCH_ARCHIVE_SHA256);
  const reference=JSON.parse(referenceBytes);
  assert.equal(reference.schemaVersion,1);
  assert.deepEqual(reference.parent,{id:TORCH_ENGINE_ID,archiveSha256:TORCH_ARCHIVE_SHA256,
    archivePrefix:'torch1-candidate/source/'});
  assert.deepEqual(reference.current,{id:DOUBLE_ENGINE_ID,sourceCount:DOUBLE_SOURCE_COUNT});
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
  if(engine.id===CURRENT_ENGINE_ID||engine.id===GUST_ENGINE_ID){
    const double=await doubleSourceReader({read,sha,engine});read=double.read;engine=double.engine;
  }
  assert.equal(engine.id,DOUBLE_ENGINE_ID);
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
  assert.equal(manifest.parentArchivePrefix,'torch1-candidate/');assert.equal(manifest.currentEngineId,DOUBLE_ENGINE_ID);
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

export async function reconstructDoubleSources({referenceBytes,read,sha,engine}) {
  if(engine.id===CURRENT_ENGINE_ID){const gust=await gustSourceReader({read,sha,engine});read=gust.read;engine=gust.engine;}
  assert(GUST_PARENT_REFERENCE_SHA256,'The complete Gust-to-Double source projection has not been frozen');
  assert.equal(sha(referenceBytes),GUST_PARENT_REFERENCE_SHA256,'Reviewed complete Double parent projection');
  assert.equal(engine.id,GUST_ENGINE_ID);assert.equal(engine.parent.id,DOUBLE_ENGINE_ID);
  assert.equal(engine.parent.artifacts.sourceSha256,DOUBLE_ARCHIVE_SHA256);
  const reference=JSON.parse(referenceBytes);
  assert.equal(reference.schemaVersion,1);
  assert.deepEqual(reference.parent,{id:DOUBLE_ENGINE_ID,archiveSha256:DOUBLE_ARCHIVE_SHA256,
    archivePrefix:'double1-candidate/source/'});
  assert.deepEqual(reference.current,{id:GUST_ENGINE_ID,sourceCount:GUST_SOURCE_COUNT});
  assert.equal(Object.keys(reference.files).length,DOUBLE_SOURCE_COUNT);
  assert(Array.isArray(reference.changedPaths)&&reference.changedPaths.length>0);
  assert.deepEqual(Object.keys(reference.reverseEdits).sort(),[...reference.changedPaths].sort());
  for(const name of GUST_SOURCE_ADDITIONS)assert(!Object.hasOwn(reference.files,name));
  const files=new Map();
  for(const [name,pin]of Object.entries(reference.files)){
    safeName(name);digest(pin.sha256);digest(pin.normalizedSha256);
    let bytes=Buffer.from(await read('source/'+name));const delta=reference.reverseEdits[name];
    if(delta){
      assert.equal(bytes.length,delta.currentBytes);digest(delta.currentSha256);
      assert.equal(sha(bytes),delta.currentSha256,'Exact Gust source projection input: '+name);
      assert(Array.isArray(delta.edits)&&delta.edits.length>0);let previous=bytes.length+1;
      for(const edit of [...delta.edits].reverse()){
        const before=Buffer.from(edit.beforeBase64,'base64'),after=Buffer.from(edit.afterBase64,'base64');
        assert.equal(before.toString('base64'),edit.beforeBase64);assert.equal(after.toString('base64'),edit.afterBase64);
        assert(Number.isSafeInteger(edit.offset)&&edit.offset>=0&&edit.offset<previous);
        assert(edit.offset+before.length<=previous&&edit.offset+before.length<=bytes.length);
        assert.deepEqual(bytes.subarray(edit.offset,edit.offset+before.length),before);
        bytes=Buffer.concat([bytes.subarray(0,edit.offset),after,bytes.subarray(edit.offset+before.length)]);previous=edit.offset;
      }
    }
    assert.equal(bytes.length,pin.bytes);
    assert.equal(sha(bytes),pin.sha256,'Every complete published Double source retains its independent pin: '+name);
    assert.equal(sha(Buffer.from(bytes.toString('latin1').replace(/\r\n?/g,'\n'),'latin1')),pin.normalizedSha256);
    files.set(name,bytes);
  }
  return {files,manifest:{version:DOUBLE_ENGINE_ID,files:reference.files}};
}

export async function doubleSourceReader({read,sha,engine,referenceBytes}) {
  if(engine.id===DOUBLE_ENGINE_ID)return {read,engine};
  if(engine.id===CURRENT_ENGINE_ID){const gust=await gustSourceReader({read,sha,engine});read=gust.read;engine=gust.engine;}
  assert.equal(engine.id,GUST_ENGINE_ID);
  referenceBytes??=fs.readFileSync(new URL('./fixtures/gust1-parent-reference.json',import.meta.url));
  const projected=await reconstructDoubleSources({referenceBytes,read,sha,engine});
  return {engine:historicalEngine(engine,DOUBLE_ENGINE_ID),files:projected.files,read:async name=>{
    if(!name.startsWith('source/'))return read(name);
    safeName(name);const bytes=projected.files.get(name.slice(7));assert(bytes,'Unreviewed historical Double source: '+name);return bytes;
  }};
}

export async function verifyGustRetainedParentInputs({read,sha}) {
  const bytes=await read('tests/gust1-retained-parent/manifest.json');
  assert.equal(sha(bytes),GUST_PARENT_TEST_INPUTS_SHA256,'Exact published Double test-input inventory');
  const manifest=JSON.parse(bytes);
  assert.equal(manifest.schemaVersion,1);assert.equal(manifest.parentEngineId,DOUBLE_ENGINE_ID);
  assert.equal(manifest.parentArchiveSha256,DOUBLE_ARCHIVE_SHA256);assert.equal(Object.keys(manifest.files).length,131);
  for(const [name,pin]of Object.entries(manifest.files)){
    safeName(name);assert(!name.includes('/'));digest(pin.sha256);assert(Number.isSafeInteger(pin.bytes)&&pin.bytes>0);
    const original=Buffer.from(await read('tests/gust1-retained-parent/'+name));
    assert.equal(original.length,pin.bytes);assert.equal(sha(original),pin.sha256,'Exact published Double input: '+name);
  }
  return manifest;
}

export async function verifyPublishedDoubleAdapter({read,sha,adapter,family}) {
  if(adapter.engineId===CURRENT_ENGINE_ID&&adapter.parentEngineId===GUST_ENGINE_ID){
    const original=await verifyPublishedGustAdapter({read,sha,adapter,family});
    return verifyPublishedDoubleAdapter({read,sha,adapter:original,family});
  }
  assert(Object.hasOwn(reviewedDoubleRetentionPins,family));
  const original=await read('tests/double1-'+family+'-retention.json'),pin=reviewedDoubleRetentionPins[family];
  assert.equal(sha(original),pin);assert.equal(adapter.publishedDoubleAdapterSha256,pin);
  assert.equal(adapter.parentEngineId,DOUBLE_ENGINE_ID);assert.equal(adapter.parentArchiveSha256,DOUBLE_ARCHIVE_SHA256);
  assert.equal(adapter.parentSnapshotManifestSha256,GUST_PARENT_TEST_INPUTS_SHA256);
  const retained=await verifyGustRetainedParentInputs({read,sha});
  assert.equal(retained.files['double1-'+family+'-retention.json'].sha256,pin);
  const old=JSON.parse(original);assert.equal(old.engineId,DOUBLE_ENGINE_ID);
  assert.equal(old.productionObjectCount,DOUBLE_OBJECT_COUNT);
  assert.equal(old[family==='endless'?'productionSourceFiles':'sourceCount'],DOUBLE_SOURCE_COUNT);
  assert.equal(old.historicalContractSha256,adapter.historicalContractSha256);
  if(family!=='torch')await verifyPublishedTorchAdapter({read,sha,adapter:old,family});
  return old;
}

export async function reconstructZVaseParentSources({referenceBytes,read,sha,engine}) {
 assert.equal(engine.id,CURRENT_ENGINE_ID);assert.equal(engine.parent.id,ZVASE_PARENT_ENGINE_ID);
 assert.equal(engine.parent.artifacts.sourceSha256,ZVASE_PARENT_ARCHIVE_SHA256);
 referenceBytes??=fs.readFileSync(new URL('./fixtures/zvase1-parent-reference.json',import.meta.url));
 assert(ZVASE_PARENT_REFERENCE_SHA256,'Current Vasebreaker parent projection has not been independently reviewed');
 assert.equal(sha(referenceBytes),ZVASE_PARENT_REFERENCE_SHA256);
 const reference=JSON.parse(referenceBytes);assert.equal(reference.schemaVersion,1);
 assert.deepEqual(reference.parent,{id:ZVASE_PARENT_ENGINE_ID,archiveSha256:ZVASE_PARENT_ARCHIVE_SHA256,archivePrefix:'zombotany3-candidate/source/'});
 assert.deepEqual(reference.current,{id:CURRENT_ENGINE_ID,sourceCount:CURRENT_SOURCE_COUNT});
 assert.equal(Object.keys(reference.files).length,ZVASE_PARENT_SOURCE_COUNT);
 assert.deepEqual(Object.keys(reference.reverseEdits).sort(),reference.changedPaths);assert.deepEqual(reference.changedPaths,[...ZVASE_PARENT_CHANGED_PATHS].sort());
 const files=new Map();
 for(const[name,pin]of Object.entries(reference.files)){
  safeName(name);digest(pin.sha256);digest(pin.normalizedSha256);
  let bytes=Buffer.from(await read('source/'+name));const delta=reference.reverseEdits[name];
  if(delta){
   assert.equal(bytes.length,delta.currentBytes);digest(delta.currentSha256);assert.equal(sha(bytes),delta.currentSha256);
   assert(Array.isArray(delta.edits)&&delta.edits.length>0);let previous=bytes.length+1;
   for(const edit of [...delta.edits].reverse()){
    const before=Buffer.from(edit.beforeBase64,'base64'),after=Buffer.from(edit.afterBase64,'base64');
    assert.equal(before.toString('base64'),edit.beforeBase64);assert.equal(after.toString('base64'),edit.afterBase64);
    assert(Number.isSafeInteger(edit.offset)&&edit.offset>=0&&edit.offset<previous);
    assert(edit.offset+before.length<=previous&&edit.offset+before.length<=bytes.length);
    assert.deepEqual(bytes.subarray(edit.offset,edit.offset+before.length),before);
    bytes=Buffer.concat([bytes.subarray(0,edit.offset),after,bytes.subarray(edit.offset+before.length)]);previous=edit.offset;
   }
  }
  assert.equal(bytes.length,pin.bytes);assert.equal(sha(bytes),pin.sha256,name);
  assert.equal(sha(Buffer.from(bytes.toString('latin1').replace(/\r\n?/g,'\n'),'latin1')),pin.normalizedSha256);
  files.set(name,bytes);
 }
 for(const name of ZVASE_SOURCE_ADDITIONS)assert(!files.has(name));
 return {files,manifest:{version:ZVASE_PARENT_ENGINE_ID,files:reference.files}};
}
export async function zvaseParentSourceReader({read,sha,engine,referenceBytes}) {
 if(engine.id===ZVASE_PARENT_ENGINE_ID)return {read,engine};
 const parent=await reconstructZVaseParentSources({read,sha,engine,referenceBytes});
 return {engine:engine.parent,files:parent.files,read:async name=>{
  if(!name.startsWith('source/'))return read(name);
  safeName(name);const bytes=parent.files.get(name.slice(7));assert(bytes,name);return bytes;
 }};
}

export async function reconstructZsurvivalParentSources({referenceBytes,read,sha,engine}) {
 if(engine.id===CURRENT_ENGINE_ID){const parent=await zvaseParentSourceReader({read,sha,engine});read=parent.read;engine=parent.engine;}
 assert.equal(engine.id,ZVASE_PARENT_ENGINE_ID);assert.equal(engine.parent.id,ZSURVIVAL_PARENT_ENGINE_ID);
 assert.equal(engine.parent.artifacts.sourceSha256,ZSURVIVAL_PARENT_ARCHIVE_SHA256);
 referenceBytes??=fs.readFileSync(new URL('./fixtures/zsurvival1-parent-reference.json',import.meta.url));
 assert.equal(sha(referenceBytes),ZSURVIVAL_PARENT_REFERENCE_SHA256);
 const reference=JSON.parse(referenceBytes);assert.equal(reference.schemaVersion,1);
 assert.deepEqual(reference.parent,{id:ZSURVIVAL_PARENT_ENGINE_ID,archiveSha256:ZSURVIVAL_PARENT_ARCHIVE_SHA256,archivePrefix:'zombotany3-candidate/source/'});
 assert.deepEqual(reference.current,{id:ZVASE_PARENT_ENGINE_ID,sourceCount:ZVASE_PARENT_SOURCE_COUNT});
 assert.equal(Object.keys(reference.files).length,ZSURVIVAL_PARENT_SOURCE_COUNT);
 assert.deepEqual(Object.keys(reference.reverseEdits).sort(),reference.changedPaths);assert.equal(reference.changedPaths.length,11);
 const files=new Map();
 for(const[name,pin]of Object.entries(reference.files)){
  safeName(name);digest(pin.sha256);digest(pin.normalizedSha256);
  let bytes=Buffer.from(await read('source/'+name));const delta=reference.reverseEdits[name];
  if(delta){
   assert.equal(bytes.length,delta.currentBytes);digest(delta.currentSha256);assert.equal(sha(bytes),delta.currentSha256);
   assert(Array.isArray(delta.edits)&&delta.edits.length>0);let previous=bytes.length+1;
   for(const edit of [...delta.edits].reverse()){
    const before=Buffer.from(edit.beforeBase64,'base64'),after=Buffer.from(edit.afterBase64,'base64');
    assert.equal(before.toString('base64'),edit.beforeBase64);assert.equal(after.toString('base64'),edit.afterBase64);
    assert(Number.isSafeInteger(edit.offset)&&edit.offset>=0&&edit.offset<previous);
    assert(edit.offset+before.length<=previous&&edit.offset+before.length<=bytes.length);
    assert.deepEqual(bytes.subarray(edit.offset,edit.offset+before.length),before);
    bytes=Buffer.concat([bytes.subarray(0,edit.offset),after,bytes.subarray(edit.offset+before.length)]);previous=edit.offset;
   }
  }
  assert.equal(bytes.length,pin.bytes);assert.equal(sha(bytes),pin.sha256,name);
  assert.equal(sha(Buffer.from(bytes.toString('latin1').replace(/\r\n?/g,'\n'),'latin1')),pin.normalizedSha256);
  files.set(name,bytes);
 }
 for(const name of ZSURVIVAL_SOURCE_ADDITIONS)assert(!files.has(name));
 return {files,manifest:{version:ZSURVIVAL_PARENT_ENGINE_ID,files:reference.files}};
}
export async function zsurvivalParentSourceReader({read,sha,engine,referenceBytes}) {
 if(engine.id===CURRENT_ENGINE_ID){const parent=await zvaseParentSourceReader({read,sha,engine});read=parent.read;engine=parent.engine;}
 if(engine.id===ZSURVIVAL_PARENT_ENGINE_ID)return {read,engine};
 const parent=await reconstructZsurvivalParentSources({read,sha,engine,referenceBytes});
 return {engine:engine.parent,files:parent.files,read:async name=>{
  if(!name.startsWith('source/'))return read(name);
  safeName(name);const bytes=parent.files.get(name.slice(7));assert(bytes,name);return bytes;
 }};
}

export async function reconstructGustSources({referenceBytes,read,sha,engine}) {
 if(engine.id===CURRENT_ENGINE_ID){const parent=await zsurvivalParentSourceReader({read,sha,engine});read=parent.read;engine=parent.engine;}
 assert(ZOMBOTANY3_PARENT_REFERENCE_SHA256,'The Zombotany3 source boundary is not frozen');
 assert.equal(sha(referenceBytes),ZOMBOTANY3_PARENT_REFERENCE_SHA256);
 assert.equal(engine.id,ZSURVIVAL_PARENT_ENGINE_ID);assert.equal(engine.parent.id,GUST_ENGINE_ID);
 assert.equal(engine.parent.artifacts.sourceSha256,GUST_ARCHIVE_SHA256);
 const reference=JSON.parse(referenceBytes);
 assert.equal(reference.schemaVersion,1);
 assert.deepEqual(reference.parent,{id:GUST_ENGINE_ID,archiveSha256:GUST_ARCHIVE_SHA256,archivePrefix:'gust1-candidate/source/'});
 assert.deepEqual(reference.current,{id:ZSURVIVAL_PARENT_ENGINE_ID,sourceCount:ZSURVIVAL_PARENT_SOURCE_COUNT});
 assert.equal(Object.keys(reference.files).length,GUST_SOURCE_COUNT);
 assert(reference.changedPaths.length>0);
 assert.deepEqual(Object.keys(reference.reverseEdits).sort(),[...reference.changedPaths].sort());
 for(const name of ZOMBOTANY3_SOURCE_ADDITIONS)assert(!Object.hasOwn(reference.files,name));
 const files=new Map();
 for(const [name,pin]of Object.entries(reference.files)){
  safeName(name);digest(pin.sha256);digest(pin.normalizedSha256);
  let bytes=Buffer.from(await read('source/'+name));const delta=reference.reverseEdits[name];
  if(delta){
   assert.equal(bytes.length,delta.currentBytes);digest(delta.currentSha256);assert.equal(sha(bytes),delta.currentSha256,name);
   assert(Array.isArray(delta.edits)&&delta.edits.length>0);let previous=bytes.length+1;
   for(const edit of [...delta.edits].reverse()){
    const before=Buffer.from(edit.beforeBase64,'base64'),after=Buffer.from(edit.afterBase64,'base64');
    assert.equal(before.toString('base64'),edit.beforeBase64);assert.equal(after.toString('base64'),edit.afterBase64);
    assert(Number.isSafeInteger(edit.offset)&&edit.offset>=0&&edit.offset<previous);
    assert(edit.offset+before.length<=previous&&edit.offset+before.length<=bytes.length);
    assert.deepEqual(bytes.subarray(edit.offset,edit.offset+before.length),before);
    bytes=Buffer.concat([bytes.subarray(0,edit.offset),after,bytes.subarray(edit.offset+before.length)]);previous=edit.offset;
   }
  }
  assert.equal(bytes.length,pin.bytes);assert.equal(sha(bytes),pin.sha256,name);
  assert.equal(sha(Buffer.from(bytes.toString('latin1').replace(/\r\n?/g,'\n'),'latin1')),pin.normalizedSha256);
  files.set(name,bytes);
 }
 return {files,manifest:{version:GUST_ENGINE_ID,files:reference.files}};
}

export async function gustSourceReader({read,sha,engine,referenceBytes}) {
 if(engine.id===GUST_ENGINE_ID)return {read,engine};
 assert.equal(engine.id,CURRENT_ENGINE_ID);
 referenceBytes??=fs.readFileSync(new URL('./fixtures/zombotany3-parent-reference.json',import.meta.url));
 const projected=await reconstructGustSources({referenceBytes,read,sha,engine});
 return {engine:historicalEngine(engine,GUST_ENGINE_ID),files:projected.files,read:async name=>{
  if(!name.startsWith('source/'))return read(name);
  safeName(name);const bytes=projected.files.get(name.slice(7));assert(bytes,name);return bytes;
 }};
}

export async function verifyZombotany3RetainedParentInputs({read,sha}) {
 const raw=await read('tests/zombotany3-retained-parent/manifest.json');
 assert.equal(sha(raw),ZOMBOTANY3_PARENT_TEST_INPUTS_SHA256);
 const manifest=JSON.parse(raw);
 assert.equal(manifest.schemaVersion,1);assert.equal(manifest.parentEngineId,GUST_ENGINE_ID);
 assert.equal(manifest.parentArchiveSha256,GUST_ARCHIVE_SHA256);assert.equal(Object.keys(manifest.files).length,146);
 for(const [name,pin]of Object.entries(manifest.files)){
  safeName(name);assert(!name.includes('/'));digest(pin.sha256);
  const bytes=Buffer.from(await read('tests/zombotany3-retained-parent/'+name));
  assert.equal(bytes.length,pin.bytes);assert.equal(sha(bytes),pin.sha256,name);
 }
 return manifest;
}

const reviewedGustRetentionPins=Object.freeze({
 endless:'4f873bfe77ddaf4a37491bb7626f07cc7c8728f9b0d91172f5b9987f434e5ac6',
 scrap:'fdd57dd1ebf5d8c02e31994f1e36b9e972d49020109b57f67ce988813821c35c',
 vase:'9ecd77d0b25479b6bb17b1674ec7a5a5f0ea5085958487802b7e97e6c262de28',
 torch:'f1b1045cec77507fb85efa8c526789ade7c112787dfe2e6d9bf4fe76b58fc65a',
 double:'e057c9ba7cdec9cffdf157c59d3873293624723180a3a4bbef8db76e84e4c211'
});
export async function verifyPublishedGustAdapter({read,sha,adapter,family}) {
 assert(Object.hasOwn(reviewedGustRetentionPins,family));
 const pin=reviewedGustRetentionPins[family],raw=await read('tests/gust1-'+family+'-retention.json');
 assert.equal(sha(raw),pin);assert.equal(adapter.publishedGustAdapterSha256,pin);
 assert.equal(adapter.parentEngineId,GUST_ENGINE_ID);assert.equal(adapter.parentArchiveSha256,GUST_ARCHIVE_SHA256);
 assert.equal(adapter.parentSnapshotManifestSha256,ZOMBOTANY3_PARENT_TEST_INPUTS_SHA256);
 const snapshot=await verifyZombotany3RetainedParentInputs({read,sha});
 assert.equal(snapshot.files['gust1-'+family+'-retention.json'].sha256,pin);
 const old=JSON.parse(raw);assert.equal(old.engineId,GUST_ENGINE_ID);
 assert.equal(old.productionObjectCount,GUST_OBJECT_COUNT);
 assert.equal(old[family==='endless'?'productionSourceFiles':'sourceCount'],GUST_SOURCE_COUNT);
 assert.equal(old.historicalContractSha256,adapter.historicalContractSha256);return old;
}

export async function reconstructGustFocusedEvidence({referenceBytes,read,sha,engine,sourceFiles}) {
 assert.equal(sha(referenceBytes),GUST_FOCUSED_REFERENCE_SHA256);
 const parent=historicalEngine(engine,GUST_ENGINE_ID);assert.equal(parent.artifacts.sourceSha256,GUST_ARCHIVE_SHA256);
 const reference=JSON.parse(referenceBytes);
 assert.equal(reference.schemaVersion,1);assert.equal(reference.parentEngineId,GUST_ENGINE_ID);
 assert.equal(reference.parentArchiveSha256,GUST_ARCHIVE_SHA256);assert.equal(reference.parentArchiveBytes,36838618);
 assert.equal(reference.sourceProjection,'zombotany3-parent-reference.json');assert.equal(reference.sourceCount,GUST_SOURCE_COUNT);
 assert.equal(sourceFiles.size,GUST_SOURCE_COUNT);
 assert.equal(Object.keys(reference.sourcePins).length,123);assert.equal(Object.keys(reference.files).length,206);
 const files=new Map();let inline=0;
 for(const [name,pin]of Object.entries(reference.sourcePins)){
  safeName(name);assert(name.startsWith('source/'));digest(pin);const bytes=sourceFiles.get(name.slice(7));
  assert(bytes,name);assert.equal(sha(bytes),pin,name);files.set(name,bytes);
 }
 for(const [name,pin]of Object.entries(reference.files)){
  safeName(name);digest(pin.sha256);const stored=Object.hasOwn(pin,'currentPath');
  assert.deepEqual(Object.keys(pin).sort(),['bytes','sha256',stored?'currentPath':'base64'].sort());let bytes;
  if(stored){
   safeName(pin.currentPath);assert(/^tests\/(?:zombotany3|gust1|double1|torch1|ambush1|scrap1)-(?:retained-parent|focused-retention)\//.test(pin.currentPath));
   bytes=Buffer.from(await read(pin.currentPath));
  }else{
   assert(['logs/build-result.json','logs/source-before.json','logs/source-after.json'].includes(name));
   bytes=Buffer.from(pin.base64,'base64');assert.equal(bytes.toString('base64'),pin.base64);inline++;
  }
  assert.equal(bytes.length,pin.bytes);assert.equal(sha(bytes),pin.sha256,name);files.set(name,bytes);
 }
 assert.equal(inline,3);assert.equal(files.size,329);
 const historicalRead=async name=>{safeName(name);const bytes=files.get(name);assert(bytes,name);return bytes;};
 historicalRead.has=name=>{safeName(name);return files.has(name);};return historicalRead;
}

export async function reconstructDoubleFocusedEvidence({referenceBytes,read,sha,engine,sourceFiles}) {
  assert.equal(sha(referenceBytes),DOUBLE_FOCUSED_REFERENCE_SHA256,'Exact published Double focused evidence');
  const parent=historicalEngine(engine,DOUBLE_ENGINE_ID);assert.equal(parent.artifacts.sourceSha256,DOUBLE_ARCHIVE_SHA256);
  const reference=JSON.parse(referenceBytes);
  assert.equal(reference.schemaVersion,1);assert.equal(reference.parentEngineId,DOUBLE_ENGINE_ID);
  assert.equal(reference.parentArchiveSha256,DOUBLE_ARCHIVE_SHA256);assert.equal(reference.parentArchiveBytes,33335884);
  assert.equal(reference.sourceProjection,'gust1-parent-reference.json');assert.equal(reference.sourceCount,DOUBLE_SOURCE_COUNT);
  assert.equal(sourceFiles.size,DOUBLE_SOURCE_COUNT);
  const reports=['game-speed','qol-controls','decks-cooldowns','bonus-challenge','bonus-completion','night-shift',
    'lantern-shroom','garden-shuffle','seed-swap','mender-bloom','intensive-care','native-layout','care-fatigue'];
  assert.deepEqual(reference.reportNames,reports);
  assert.equal(Object.keys(reference.sourcePins).length,117);assert.equal(Object.keys(reference.files).length,119);
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
      safeName(pin.currentPath);assert(/^tests\/(?:double1-(?:focused-retention|retained-parent)\/|gust1-retained-parent\/)/.test(pin.currentPath));
      bytes=Buffer.from(await read(pin.currentPath));
    }else{
      assert(['logs/build-result.json','logs/source-before.json','logs/source-after.json'].includes(name));
      bytes=Buffer.from(pin.base64,'base64');assert.equal(bytes.toString('base64'),pin.base64);inline++;
    }
    assert.equal(bytes.length,pin.bytes,name);assert.equal(sha(bytes),pin.sha256,name);files.set(name,bytes);
  }
  assert.equal(inline,3);assert.equal(files.size,236);
  const historicalRead=async name=>{safeName(name);const bytes=files.get(name);assert(bytes,'Unreviewed historical Double input: '+name);return bytes;};
  historicalRead.has=name=>{safeName(name);return files.has(name);};
  return historicalRead;
}
