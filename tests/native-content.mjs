// SPDX-License-Identifier: MIT
// Verify published production source/test coherence, then rerun retained native
// tests and complete production-engine scenarios on the deployment runner.
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
import {CURRENT_ENGINE_ID, CURRENT_SOURCE_COUNT, CURRENT_OBJECT_COUNT, SCRAP_SOURCE_ADDITIONS, SCRAP_PARENT_REFERENCE_SHA256, AMBUSH_PARENT_REFERENCE_SHA256, AMBUSH_SOURCE_ADDITIONS, TORCH_SOURCE_ADDITIONS, TORCH_PARENT_REFERENCE_SHA256, reconstructAmbushSources, reconstructAmbushFocusedEvidence, reconstructScrapSources, reconstructEndless3Sources, verifyTorchRetainedParentInputs} from './native-release-context.mjs';
import {restoreNativeArtifactPack} from './native-artifact-pack.mjs';
import {verifyRallyRaid} from './rally-raid-verification.mjs';
import {verifyLightsOut} from './lights-out-verification.mjs';
import {verifyGarlicRun} from './garlic-run-verification.mjs';
import {verifyBungeeBusiness} from './bungee-business-verification.mjs';
import {verifyCobCannonCommand} from './cob-cannon-command-verification.mjs';
import {verifyPoolPanic} from './pool-panic-verification.mjs';
import {verifyPoolPanicEndless} from './pool-panic-endless-verification.mjs';
import {verifyPoolPanicEndlessProgression} from './pool-panic-endless-progression-verification.mjs';
import {verifyScrapYard} from './scrap-yard-verification.mjs';
import {verifyVaseAmbush} from './vase-ambush-verification.mjs';
import {verifyTorchbearer} from './torchbearer-verification.mjs';
import {verifyAmbushFocusedRetention} from './ambush-focused-retention-verification.mjs';
import {verifyTorchFocusedRetention,TORCH_FOCUSED_CHECK_EXTENSIONS} from './torch-focused-retention-verification.mjs';
import {ensureSourceArchive} from './source-bundle.mjs';

const require = createRequire(import.meta.url);
const dist = new URL('../dist/', import.meta.url);
ensureSourceArchive(new URL('../', import.meta.url));
const vendor = {exports: {}};
new Function('module', 'exports', 'require', fs.readFileSync(new URL('vendor/jszip.min.js', dist), 'utf8'))(vendor, vendor.exports, require);
const JSZip = vendor.exports;
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const engine = JSON.parse(fs.readFileSync(new URL('game/engine-provenance.json', dist)));
assert.equal(engine.id, CURRENT_ENGINE_ID);
const ambushEngine = engine.parent;
assert.equal(ambushEngine.id, '0.2.6-web-ambush.1');
const scrapEngine = ambushEngine.parent;
assert.equal(scrapEngine.id, '0.2.6-web-scrap.1');
const historyEngine = scrapEngine.parent;
assert.equal(historyEngine.id, '0.2.6-web-endless.3');
const currentSourceBytes = fs.readFileSync(new URL(engine.artifacts.source, new URL('game/engine-provenance.json', dist)));
assert.equal(sha(currentSourceBytes), engine.artifacts.sourceSha256, 'Current source archive matches the engine provenance pin');
const current = await JSZip.loadAsync(currentSourceBytes, {checkCRC32: true});
const prefix = 'torch1-candidate/';
await restoreNativeArtifactPack(current, prefix);
const publishedEndless2Bytes = fs.readFileSync(new URL('source/pvz-portable-0.2.6-web-endless.2-source.zip', dist));
assert.equal(sha(publishedEndless2Bytes), 'b9095c65547c3d013917ae4188e284f18eabb71a98020ca3d53f71f7365f9566');
assert.equal(publishedEndless2Bytes.length,40424282);
assert.equal(historyEngine.parent.id,'0.2.6-web-endless.2');
assert.equal(historyEngine.parent.artifacts.sourceSha256,sha(publishedEndless2Bytes));
const publishedEndless2=await JSZip.loadAsync(publishedEndless2Bytes,{checkCRC32:true});
const publishedEndless2Prefix='endless2-candidate/source/';
const publishedEndless2Read=async name=>{
  assert(name&&!name.includes('..')&&!/[\\:]/.test(name)&&!name.startsWith('/'));
  const entry=publishedEndless2.file('endless2-candidate/'+name);assert(entry,'Missing authenticated published Endless.2 input: '+name);
  return Buffer.from(await entry.async('uint8array'));
};
const parentProductionBuildBytes=await publishedEndless2Read('logs/build-result.json');
const publishedEndless2Source=async name=>{
  const entry=publishedEndless2.file(publishedEndless2Prefix+name);assert(entry,'Missing published Endless.2 input: '+name);
  return Buffer.from(await entry.async('uint8array'));
};
// Reconstruct the independently pinned historical inputs from the exact .2
// successor, so a fresh offline source download needs only its immediate parent.
const endless1ReferenceBytes=fs.readFileSync(new URL('./fixtures/endless1-reference.json',import.meta.url));
assert.equal(sha(endless1ReferenceBytes),'a9be67e4a3493cd3b3d182ea4dddced137ce8a553c2a2a3949b0c9d9eb899d86');
const endless1Reference=JSON.parse(endless1ReferenceBytes);
const historicalParentArchiveSha='eee4ae6dfeaaa49bbf203c37cf45ad73dad56b85d3d0079e549ed11bc3d45f25';
assert.equal(endless1Reference.schema,1);
assert.equal(endless1Reference.archiveSha256,historicalParentArchiveSha);
assert.equal(endless1Reference.archiveBytes,39931636);
assert.equal(endless1Reference.archivePrefix,'endless1-candidate/');
assert.equal(endless1Reference.publishedSuccessorSha256,sha(publishedEndless2Bytes));
assert.equal(endless1Reference.publishedSuccessorBytes,publishedEndless2Bytes.length);
assert.equal(endless1Reference.publishedSuccessorPrefix,'endless2-candidate/');
assert.equal(endless1Reference.sourceCount,852);
assert.equal(historyEngine.parent.parent.artifacts.sourceSha256,historicalParentArchiveSha);
assert.equal(Object.keys(endless1Reference.files).length,858);
assert.deepEqual(Object.keys(endless1Reference.reverseEdits).sort(),[
  'source/CMake/ProjectVersion.cmake','source/src/Lawn/Board.cpp','source/src/Lawn/Challenge.cpp',
  'source/src/Lawn/System/PoolPanicEndless.cpp','source/src/Lawn/System/PoolPanicEndless.h',
  'source/src/Lawn/System/PoolPanicEndlessPresentation.cpp','source/src/Lawn/System/PoolPanicEndlessPresentation.h',
  'source/src/Lawn/Widget/GameButton.cpp','source/src/LawnApp.cpp','tests/pool-panic-endless-native-art-inputs.json',
].sort());
const parent=new JSZip();
for(const [name,pin] of Object.entries(endless1Reference.files)){
  assert(/^(source|tests)\//.test(name)&&!name.includes('..')&&!/[\\:]/.test(name));
  const entry=publishedEndless2.file('endless2-candidate/'+name);assert(entry);
  let bytes=Buffer.from(await entry.async('uint8array'));
  const delta=endless1Reference.reverseEdits[name];
  if(delta){
    assert.equal(bytes.length,delta.successorBytes);assert.equal(sha(bytes),delta.successorSha256);
    let previous=bytes.length+1;
    for(const edit of [...delta.edits].reverse()){
      const before=Buffer.from(edit.beforeBase64,'base64'),after=Buffer.from(edit.afterBase64,'base64');
      assert(Number.isSafeInteger(edit.offset)&&edit.offset>=0&&edit.offset<previous);
      assert.deepEqual(bytes.subarray(edit.offset,edit.offset+before.length),before,'Authenticated .2 to .1 byte delta: '+name);
      bytes=Buffer.concat([bytes.subarray(0,edit.offset),after,bytes.subarray(edit.offset+before.length)]);
      previous=edit.offset;
    }
  }
  assert.equal(bytes.length,pin.bytes);assert.equal(sha(bytes),pin.sha256,'Complete historical input: '+name);
  assert.equal(sha(Buffer.from(bytes.toString('latin1').replace(/\r\n?/g,'\n'),'latin1')),pin.normalizedSha256);
  parent.file('endless1-candidate/'+name,bytes);
}
// Reconstruct exact Pool.1 from its authenticated published successor.
// Immutable raw byte deltas and848 independent whole-file pins retain the older
// Pool/Cob/Bungee/Lights preservation proof without shipping another full ZIP.
const parentPrefix='endless1-candidate/source/';
const immediateParentBytes=async name=>{
  const entry=parent.file(parentPrefix+name);assert(entry,'Missing immediate parent source: '+name);
  return Buffer.from(await entry.async('uint8array'));
};
const poolReferenceBytes=fs.readFileSync(new URL('./fixtures/pool1-reference.json',import.meta.url));
assert.equal(sha(poolReferenceBytes),'85c5e0ddfeade744d37e6317c7fb3dfea4e2d7ef5fcce2fa277e34d6045d00da');
const poolReference=JSON.parse(poolReferenceBytes);
assert.equal(poolReference.schema,1);
assert.equal(poolReference.archiveSha256,'9d1cb0b7fdc6e10cb4ea79b869b922d98417b14c829862899c6361f80c7dc988');
assert.equal(poolReference.archiveBytes,37098165);
assert.equal(poolReference.archivePrefix,'pool1-candidate/source/');
assert.equal(poolReference.publishedSuccessorSha256,historicalParentArchiveSha);
assert.equal(poolReference.publishedSuccessorPrefix,parentPrefix);
assert.equal(poolReference.sourceCount,848);
assert.equal(Object.keys(poolReference.sourceFiles).length,848);
assert.deepEqual(Object.keys(poolReference.publishedSuccessorReverseEdits).sort(),['CMake/ProjectVersion.cmake','src/ConstEnums.h','src/Lawn/Board.cpp','src/Lawn/Challenge.cpp','src/Lawn/System/BonusChallenge.h','src/Lawn/Widget/ChallengeScreen.cpp','src/Lawn/Widget/LawnDialog.cpp','src/Lawn/Zombie.cpp','src/LawnApp.cpp'].sort());
const poolSources=new Map();
for(const [name,pin] of Object.entries(poolReference.sourceFiles)) {
  let bytes=await immediateParentBytes(name);
  const delta=poolReference.publishedSuccessorReverseEdits[name];
  if(delta){
    assert.equal(bytes.length,delta.publishedEndless1Bytes);
    assert.equal(sha(bytes),delta.publishedEndless1Sha256);
    let previous=bytes.length+1;
    for(const edit of [...delta.reverseEdits].reverse()){
      const before=Buffer.from(edit.beforeBase64,'base64'),after=Buffer.from(edit.afterBase64,'base64');
      assert(Number.isSafeInteger(edit.offset)&&edit.offset>=0&&edit.offset<previous);
      assert.deepEqual(bytes.subarray(edit.offset,edit.offset+before.length),before,'Exact published Endless.1 byte delta: '+name);
      bytes=Buffer.concat([bytes.subarray(0,edit.offset),after,bytes.subarray(edit.offset+before.length)]);previous=edit.offset;
    }
  }
  assert.equal(bytes.length,pin.bytes);
  assert.equal(sha(bytes),pin.sha256,'Every reconstructed complete Pool.1 source byte retains its independent historical pin: '+name);
  assert.equal(sha(Buffer.from(bytes.toString('latin1').replace(/\r\n?/g,'\n'),'latin1')),pin.normalizedSha256);
  poolSources.set(name,bytes);
}
// Preserve the two exact historical inputs required by the retained fog fix
// without making a portable source checkout carry another complete engine ZIP.
const lights1ReferenceBytes=fs.readFileSync(new URL('./fixtures/lights1-reference.json',import.meta.url));
assert.equal(sha(lights1ReferenceBytes),'f3a00db3d3606d2ebc79ff5de2026b7e290e4f22eaed40042fc6e321e3b9aa12');
const lights1Reference=JSON.parse(lights1ReferenceBytes);
assert.equal(lights1Reference.schema,1);
assert.equal(lights1Reference.archiveSha256,'5f35953986e985af0de8a572fa8bac4657ceaaee42e6db1f9cd84b7c6d3d7b8e');
const lights1InputPins={
  'lights1-candidate/source/src/Lawn/Board.cpp':{bytes:308920,sha256:'3745c3d70394d7f3cd48e788dbc93ebbdd643bd01f34aded9dd3145649fd1e07'},
  'lights1-candidate/tests/lights-native-art-inputs.json':{bytes:2202,sha256:'030644000821aa534569efe39d8c324169708276432e9423caee1eeacb7bf308'},
};
assert.deepEqual(Object.keys(lights1Reference.files).sort(),Object.keys(lights1InputPins).sort());
const lights1Inputs=new Map();
for(const [name,pin] of Object.entries(lights1InputPins)) {
  const entry=lights1Reference.files[name],bytes=Buffer.from(entry.base64,'base64');
  assert.deepEqual({bytes:entry.bytes,sha256:entry.sha256},pin);
  assert.equal(bytes.length,pin.bytes);
  assert.equal(sha(bytes),pin.sha256,'Retained historical input matches its authenticated archive bytes: '+name);
  lights1Inputs.set(name,bytes);
}
// The restoration reference predates Raid.1's foreground override.
// Compact exact inputs retain archive and whole-file authentication without
// forcing source downloads to duplicate another complete historical engine ZIP.
const nativeUiArchiveSha256='2deb50f9a38d8599453f567f5458a20505d552956df0bc442e649e49ea1c5c24';
const nativeUiReferenceBytes=fs.readFileSync(new URL('./fixtures/native-ui-reference.json',import.meta.url));
assert.equal(sha(nativeUiReferenceBytes),'d9861034849eca9d637197aa78a1bae4c90b5656db91ca102d8c903100031edd');
const nativeUiReference=JSON.parse(nativeUiReferenceBytes);
assert.equal(nativeUiReference.schema,1);
assert.equal(nativeUiReference.archiveSha256,nativeUiArchiveSha256);
const nativeUiInputPins={
  'rally3-candidate/source/src/Lawn/Board.cpp':{"bytes":304583,"sha256":"6996143c45dd1dbee6f5d9a092d7d05c3b1ea9b72b79c8fb0ce5ac44bf8fa31c"},
  'rally3-candidate/source/src/Lawn/SeedPacket.cpp':{"bytes":33764,"sha256":"829e0a0818c096bd56ba4c3de7ab21df52e744bce8aeb32f698057950b42a863"},
};
assert.deepEqual(Object.keys(nativeUiReference.files).sort(),Object.keys(nativeUiInputPins).sort());
const nativeUiInputs=new Map();
for(const [name,pin] of Object.entries(nativeUiInputPins)) {
  const entry=nativeUiReference.files[name],bytes=Buffer.from(entry.base64,'base64');
  assert.deepEqual({bytes:entry.bytes,sha256:entry.sha256},pin);
  assert.equal(bytes.length,pin.bytes);
  assert.equal(sha(bytes),pin.sha256,'Complete authenticated original I,Zombie source input: '+name);
  nativeUiInputs.set(name,bytes);
}
const nativeUiBytes=async name=>{const input=nativeUiInputs.get('rally3-candidate/source/'+name);assert(input,'Missing authenticated native UI input: '+name);return input;};
const read = async name => {
  const entry = current.file(prefix + name);
  assert(entry, 'Missing current production source/test: ' + name);
  return Buffer.from(await entry.async('uint8array'));
};
const ambushReferenceBytes = fs.readFileSync(new URL('./fixtures/torch1-parent-reference.json', import.meta.url));
assert.equal(sha(ambushReferenceBytes), TORCH_PARENT_REFERENCE_SHA256);
const ambushSource = await reconstructAmbushSources({referenceBytes:ambushReferenceBytes,read,sha,engine});
const publishedAmbushRead=await reconstructAmbushFocusedEvidence({
  referenceBytes:fs.readFileSync(new URL('./fixtures/ambush1-focused-reference.json',import.meta.url)),
  read,sha,engine,sourceFiles:ambushSource.files});
const ambushSourceRead = async name => {
  assert(name.startsWith('source/'), 'Parent projection supplies only production source');
  const bytes = ambushSource.files.get(name.slice(7)); assert(bytes, 'Missing complete Ambush source: ' + name); return bytes;
};
await verifyTorchRetainedParentInputs({read,sha});
const scrapReferenceBytes = fs.readFileSync(new URL('./fixtures/ambush1-parent-reference.json', import.meta.url));
assert.equal(sha(scrapReferenceBytes), AMBUSH_PARENT_REFERENCE_SHA256);
const scrapSource = await reconstructScrapSources({referenceBytes:scrapReferenceBytes,read:ambushSourceRead,sha,engine:ambushEngine});
const scrapSourceRead = async name => {
  assert(name.startsWith('source/'), 'Parent projection supplies only production source');
  const bytes = scrapSource.files.get(name.slice(7)); assert(bytes, 'Missing complete Scrap source: ' + name); return bytes;
};
const historyReferenceBytes = fs.readFileSync(new URL('./fixtures/scrap1-parent-reference.json', import.meta.url));
assert.equal(sha(historyReferenceBytes), SCRAP_PARENT_REFERENCE_SHA256);
const historySource = await reconstructEndless3Sources({referenceBytes: historyReferenceBytes, read:scrapSourceRead, sha, engine:scrapEngine});
const historyRead = async name => {
  assert(name.startsWith('source/'), 'Historical source projection cannot supply executable/report inputs');
  const bytes = historySource.files.get(name.slice('source/'.length));
  assert(bytes, 'Missing authenticated published Endless.3 source: ' + name);
  return bytes;
};
const retainedChecks = {'game-speed':81, 'qol-controls':90, 'decks-cooldowns':274,
  'bonus-challenge':387, 'bonus-completion':1283, 'night-shift':231, 'lantern-shroom':1724,
  'garden-shuffle':214, 'seed-swap':587, 'mender-bloom':523, 'intensive-care':1135, 'native-layout':26138};
const scrapFocusedCheckExtensions = {'bonus-completion':19, 'native-layout':333};
const vaseFocusedCheckExtensions = {'bonus-challenge':7, 'bonus-completion':77, 'native-layout':686};
const focusedCheckExtensions = {'bonus-challenge':7, 'bonus-completion':96, 'native-layout':1019};
const retainedSuites = [...Object.keys(retainedChecks), 'care-fatigue', 'care-full-run', 'chain-reaction', 'rally-zombie', 'rally-raid', 'lights-out', 'garlic-run', 'bungee-business', 'cob-cannon-command', 'pool-panic', 'pool-panic-endless'];
assert.equal(retainedSuites.length, 23);
const suites = [...retainedSuites, 'scrap-yard', 'vase-ambush', 'torchbearer'];
assert.equal(suites.length, 26);
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
  assert.equal(reports.get(name).checks, count + (focusedCheckExtensions[name] || 0)+(TORCH_FOCUSED_CHECK_EXTENSIONS[name]||0),
    'Every retained suite keeps its old assertions and reviewed appended coverage: ' + name);
// Preserve all retained assertions. Raid adds one challenge-definition
// iteration and 2,732 native footer/card/packet/layer checks; Raid.2
// retains those cases with native-order expectations and adds14 pick controls.
assert.equal(Object.values(retainedChecks).reduce((sum, count) => sum + count, 0), 32667);
assert.equal(Object.values(scrapFocusedCheckExtensions).reduce((sum, count) => sum + count, 0), 352);
assert.equal(Object.values(vaseFocusedCheckExtensions).reduce((sum, count) => sum + count, 0), 770);
assert.equal(Object.values(focusedCheckExtensions).reduce((sum, count) => sum + count, 0), 1122);
assert.equal(reports.get('care-fatigue').checks, 25042+(TORCH_FOCUSED_CHECK_EXTENSIONS['care-fatigue']||0),
  'Fatigue rig coverage retains every crew pose, scoped state and restoration check');
const focusedRetentionBytes = await read('tests/scrap1-focused-retention/adaptations.json');
assert.equal(sha(focusedRetentionBytes), 'd8398969b25626a3449c645d4c3400b6905c14635132ffffebf95cb91d02d0c1');
const focusedRetention = JSON.parse(focusedRetentionBytes);
assert.equal(focusedRetention.schemaVersion,1);
assert.equal(focusedRetention.engineId,scrapEngine.id);
assert.equal(focusedRetention.parentEngineId,historyEngine.id);
assert.equal(focusedRetention.parentArchiveSha256,'206e5e16b0c4ae7c8b88afd94e627943b4cd15c56f82113fcaf4bb1adf4c13b1');
assert.equal(focusedRetention.allCasesFresh,true);
assert.deepEqual(Object.keys(focusedRetention.runners).sort(),[...Object.keys(retainedChecks),'care-fatigue'].sort());
for(const [name,record] of Object.entries(focusedRetention.runners)) {
  assert.equal(record.runner,'test-'+name+'.py');
  assert.equal(record.publishedArchivePath,'endless3-candidate/tests/'+record.runner);
  assert.equal(record.originalSnapshot,'scrap1-focused-retention/originals/'+record.runner);
  const original=await read('tests/'+record.originalSnapshot);
  assert.equal(original.length,record.originalBytes);
  assert.equal(sha(original),record.originalSha256,'Every original focused runner retains its exact authenticated published bytes: '+name);
  assert.equal(sha(await read('tests/ambush1-retained-parent/'+record.runner)),record.runnerSha256,'Published Scrap focused runner remains the reviewed compatibility adaptation: '+name);
  assert.equal(record.baselineChecks,name==='care-fatigue'?25042:retainedChecks[name]);
  assert.equal(record.appendedChecks,scrapFocusedCheckExtensions[name]||0);
  assert.equal(reports.get(name).checks,record.baselineChecks+record.appendedChecks+(vaseFocusedCheckExtensions[name]||0)+(TORCH_FOCUSED_CHECK_EXTENSIONS[name]||0));
}
const publishedAmbushFocusedReports=new Map();
for(const name of [...Object.keys(retainedChecks),'care-fatigue'])
  publishedAmbushFocusedReports.set(name,JSON.parse(await publishedAmbushRead('tests/'+name+'-results.json')));
await verifyAmbushFocusedRetention({read:publishedAmbushRead,sha,engine:ambushEngine,reports:publishedAmbushFocusedReports});
await verifyTorchFocusedRetention({read,sha,engine,reports});
const fullRunReport = reports.get('care-full-run');
assert.equal(fullRunReport.checks, Object.keys(fullRunReport.sourceSha256).length + 152, 'Complete-engine provenance and required native scenario checks are retained');
assert.equal(fullRunReport.execution, 'complete-production-engine',
  'Care scenarios execute the complete linked engine, not an extracted combat model');
assert.equal(fullRunReport.productionObjectCount, CURRENT_OBJECT_COUNT, 'Complete engine drivers link all current normal production objects except main');
assert.equal(Object.keys(fullRunReport.productionObjectSha256).length, CURRENT_OBJECT_COUNT);
for (const digest of Object.values(fullRunReport.productionObjectSha256)) assert.match(digest, /^[a-f0-9]{64}$/);
assert.equal(Object.keys(fullRunReport.sourceSha256).length, CURRENT_SOURCE_COUNT,
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
assert.equal(fullRunProductionBuild.status, 'PASS');
assert.equal(fullRunProductionBuild.sourceFiles, CURRENT_SOURCE_COUNT);
const fullRunBuild = JSON.parse(await read('tests/care-full-run-build.json'));
for (const name of ['execution', 'productionObjectCount', 'productionBuildReceiptSha256',
  'generatedHarnessSha256', 'builderSha256', 'testArtifactSha256', 'sourceSha256', 'productionObjectSha256'])
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
const rallyNames=['normal','save-continue','retry-no-defense','no-defense','mechanics','consistency-controls'];
const consistencyFields=['outcome','syntheticConsistencyControls','customAlmanacEntries',
 'customAlmanacNativeFontInk','customAlmanacActualDrawPlants','customPlantBodySamples',
 'customPlantIdleHealingBlink','customPlantPauseSave','customPlantAlmanacIdle','gaitActualNativeTicks',
 'gaitModes','callEntries','callExits','nativePauses','nativeSaves','nativeInterruptions'];
const rallyCases=[1729,7331].flatMap(seed=>rallyNames.flatMap(name=>[1,2].map(speed=>scenarioKey({name,speed,seed}))));
assert.equal(rallyReport.scenarios.length,24);
assert.deepEqual(rallyReport.scenarios.map(scenarioKey).sort(),rallyCases.sort());
for(const result of rallyReport.scenarios) {
 assert.equal(result.execution,'complete-production-engine');
 assert.equal(result.resourceCapacityWarnings,0);
 assert.match(result.logSha256,/^[a-f0-9]{64}$/);
 assert(result.checks>0);
 if(result.name==='consistency-controls') {
  assert.equal(result.outcome,'consistency-pass');
  for(const field of ['syntheticConsistencyControls','customAlmanacNativeFontInk','customAlmanacActualDrawPlants',
   'customPlantIdleHealingBlink','customPlantPauseSave','customPlantAlmanacIdle','gaitActualNativeTicks'])
   assert.equal(result[field],true,'Actual custom-content consistency proof: '+field);
  assert.equal(result.customAlmanacEntries,3);
  assert.equal(result.customPlantBodySamples,17);
  assert.equal(result.gaitModes,3);
  for(const field of ['callEntries','callExits','nativePauses','nativeSaves','nativeInterruptions']) assert.equal(result[field],2);
  for(const field of ['profileCredits','awardCollected','waves','nativeZombies','rallyZombies'])
   assert.equal(result[field],undefined,'Synthetic consistency controls cannot claim earned battle results: '+field);
  continue;
 }
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
assert.equal(rallyReport.speedParity.length,12);
assert.deepEqual(rallyReport.speedParity.map(r=>`${r.name}/${r.seed}`).sort(),
 [1729,7331].flatMap(seed=>rallyNames.map(name=>`${name}/${seed}`)).sort());
for(const parity of rallyReport.speedParity) {
 assert.equal(parity.sameNativeOutcome,true);
 const fields=parity.name==='consistency-controls'?consistencyFields:parity.name==='mechanics'?['outcome']:['outcome','waves','nativeZombies','rallyZombies','profileIndex','profileCredits','awardCollected','failureAndRetry'];
 assert.deepEqual(parity.comparedFields,fields);
 const pair=rallyReport.scenarios.filter(r=>r.name===parity.name && r.seed===parity.seed);
 for(const field of fields) assert.deepEqual(pair[0][field],pair[1][field]);
}
assert.equal(rallyReport.checks,Object.keys(rallyReport.sourceSha256).length+
 rallyReport.scenarios.reduce((sum,r)=>sum+r.checks,0)+rallyReport.speedParity.length);
console.log('PASS twelve complete native Rally wins, four unattended gameovers, four actor controls, four custom-content consistency controls and twelve native speed outcome pairs.');
await verifyRallyRaid({report:reports.get('rally-raid'), read, sha, engine, fullRunReport, productionBuildBytes:fullRunProductionBuildBytes});
const priorLightsFogEntry=lights1Inputs.get('lights1-candidate/tests/lights-native-art-inputs.json');
assert(priorLightsFogEntry,'The authenticated parent must retain the original twelve artwork input pins');
const priorLightsFogInputs=JSON.parse(priorLightsFogEntry);
assert.equal(Object.keys(priorLightsFogInputs.sourceInputs).length,12);
const expectedLightsFogInputs=structuredClone(priorLightsFogInputs);
expectedLightsFogInputs.sourceInputs['images/fog.jpg']={bytes:31246,sha256:'78d5687316943ae354db21bf8017e8cb4605040571cf6d8ad9caf1eaf1e727d9'};
expectedLightsFogInputs.sourceInputs['images/fog_.jpg']={bytes:40068,sha256:'303364ef61209e4ebf8f5808ab7875926d091c72fab1bf5b76499c2d4fe0550e'};
const currentLightsFogInputs=JSON.parse(await read('tests/lights-native-art-inputs.json'));
assert.deepEqual(currentLightsFogInputs,expectedLightsFogInputs,'All twelve prior artwork pins and metadata remain exact; only the two authenticated original graded-fog JPEGs are appended');
assert.equal(Object.keys(currentLightsFogInputs.sourceInputs).length,14);
await verifyLightsOut({report:reports.get('lights-out'),read,sha,engine,fullRunReport,productionBuildBytes:fullRunProductionBuildBytes});
assert.deepEqual(await read('tests/lights-native-art-inputs.json'), Buffer.from(await parent.file('endless1-candidate/tests/lights-native-art-inputs.json').async('uint8array')), 'All fourteen original fog artwork inputs remain byte-identical to Lights.2');
await verifyGarlicRun({report:reports.get('garlic-run'),read,sha,engine,fullRunReport,productionBuildBytes:fullRunProductionBuildBytes});
await verifyBungeeBusiness({report:reports.get('bungee-business'),read,sha,engine,fullRunReport,productionBuildBytes:fullRunProductionBuildBytes});
await verifyCobCannonCommand({report:reports.get('cob-cannon-command'),read,sha,engine,fullRunReport,productionBuildBytes:fullRunProductionBuildBytes});
await verifyPoolPanic({report:reports.get('pool-panic'),read,sha,engine,fullRunReport,productionBuildBytes:fullRunProductionBuildBytes});
await verifyPoolPanicEndless({report:reports.get('pool-panic-endless'),read,sha,engine,fullRunReport,productionBuildBytes:fullRunProductionBuildBytes,immediateParentBytes});
await verifyPoolPanicEndlessProgression({report:reports.get('pool-panic-endless'),read,sha,engine,fullRunReport,
  productionBuildBytes:fullRunProductionBuildBytes,parentRead:publishedEndless2Read,parentProductionBuildBytes});
await verifyScrapYard({report:reports.get('scrap-yard'),read,sha,engine,fullRunReport,
  productionBuildBytes:fullRunProductionBuildBytes,
  currentArtBytes:fs.readFileSync(new URL('content/native-bonus-art.json',dist)),
  previousArtBytes:fs.readFileSync(new URL('./fixtures/endless3-native-bonus-art.json',import.meta.url))});
await verifyVaseAmbush({report:reports.get('vase-ambush'),read,sha,engine,fullRunReport,
  productionBuildBytes:fullRunProductionBuildBytes,
  currentArtBytes:fs.readFileSync(new URL('content/native-bonus-art.json',dist)),
  previousArtBytes:fs.readFileSync(new URL('./fixtures/scrap1-native-bonus-art.json',import.meta.url))});
await verifyTorchbearer({report:reports.get('torchbearer'),read,sha,engine,fullRunReport,
  productionBuildBytes:fullRunProductionBuildBytes,
  currentArtBytes:fs.readFileSync(new URL('content/native-bonus-art.json',dist)),
  previousArtBytes:fs.readFileSync(new URL('./fixtures/ambush1-native-bonus-art.json',import.meta.url))});
const careBalance = reports.get('intensive-care').balanceModel;
assert.equal(careBalance.kind, 'native healing/fatigue capacity bound; not a battle clear');
assert(careBalance.allBedsHealHpPerSecond > careBalance.maximumCrewFatigueHpPerSecond);
assert(careBalance.slowestSuppliedRecoveryTicks < 3000);
assert.equal(careBalance.authoredEnemies, 40);
const parentBytes=async name=>{const bytes=poolSources.get(name);assert(bytes,'Missing reconstructed historical Pool source: '+name);return bytes;};
const layoutReport = reports.get('native-layout');
assert.equal(layoutReport.scrapRetainedChecks,26138);
assert.equal(layoutReport.scrapLayoutChecks,333);
assert.equal(layoutReport.scrapBonusCards,1);
assert.equal(layoutReport.scrapViewports,6);
assert.equal(layoutReport.scrapFixedBankCases,8);
assert.equal(layoutReport.scrapFooterCases,28);
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
assert.equal(layoutReport.raidRetainedChecks, 7947);
assert.equal(layoutReport.raidBaseLayoutChecks, 1048);
assert.equal(layoutReport.raidBankLayerChecks, 1698);
assert.equal(layoutReport.raidLayoutChecks, 2746);
assert.equal(layoutReport.raidBonusCards, 9);
assert.equal(layoutReport.raidFooterCases, 20);
assert.equal(layoutReport.raidBankRoutingCases, 264);
assert.equal(layoutReport.raidPacketFlashCases, 44);
assert.equal(layoutReport.raidNativeReferenceMatched, true);
assert.equal(layoutReport.raidForegroundRegressionRejected, true);
assert.equal(layoutReport.raidNativePacketFlashMatched, true);
assert.equal(layoutReport.raidNativeRestorationChecks, 14);
assert.equal(layoutReport.raidNativePickCases, 11);
assert.equal(layoutReport.lightsRetainedChecks,10693);
assert.equal(layoutReport.lightsLayoutChecks,155);
assert.equal(layoutReport.lightsBonusCards,1);
assert.equal(layoutReport.lightsViewports,6);
assert.equal(layoutReport.lightsIntroLines,1);
assert.equal(layoutReport.lightsObservedNativeGeometry,true);
assert.equal(layoutReport.garlicRetainedChecks,10848);
assert.equal(layoutReport.garlicLayoutChecks,433);
assert.equal(layoutReport.garlicBonusCards,1);
assert.equal(layoutReport.garlicViewports,6);
assert.equal(layoutReport.garlicFooterCases,20);
assert.equal(layoutReport.garlicObservedNativeGeometry,true);
assert.equal(layoutReport.garlicFooterPlacementMutationRejected,true);
assert.equal(layoutReport.bungeeRetainedChecks,11281);
assert.equal(layoutReport.bungeeLayoutChecks,1019);
assert.equal(layoutReport.bungeeBonusCards,1);
assert.equal(layoutReport.bungeeViewports,6);
assert.equal(layoutReport.bungeeFooterCases,20);
assert.equal(layoutReport.bungeeIntroLines,1);
assert.equal(layoutReport.cobRetainedChecks,12300);
assert.equal(layoutReport.cobLayoutChecks,1170);
assert.equal(layoutReport.cobBonusCards,1);
assert.equal(layoutReport.cobViewports,6);
assert.equal(layoutReport.cobFooterCases,36);
assert.equal(layoutReport.cobIntroLines,1);
assert.equal(layoutReport.cobObservedNativeGeometry,true);
assert.equal(layoutReport.cobFooterBaselineMutationRejected,true);
assert.equal(layoutReport.poolRetainedChecks,13470);
assert.equal(layoutReport.poolLayoutChecks,3305);
assert.equal(layoutReport.poolBonusCards,1);
assert.equal(layoutReport.poolViewports,6);
assert.equal(layoutReport.poolBankCases,32);
assert.equal(layoutReport.poolFooterCases,36);
assert.equal(layoutReport.poolObservedNativeGeometry,true);
assert.equal(layoutReport.poolIntroToolMutationRejected,true);
assert.equal(layoutReport.poolFooterBaselineMutationRejected,true);
assert.equal(layoutReport.speedHeaderRetainedChecks,25398);
assert.equal(layoutReport.speedHeaderLayoutChecks,740);
assert.equal(layoutReport.speedHeaderCases,32);
assert.equal(layoutReport.speedHeaderNoExtraControlPixels,true);
assert.equal(layoutReport.speedHeaderOldLowerBandNegativeRejected,true);
assert.equal(layoutReport.speedHeaderOldNarrowCapsNegativeRejected,true);
const expectedHeaderFontInk={Menu:{advance:57,normalAndDownInk:[[6,2,67,20],[7,3,68,21]]},'1x':{advance:22,normalAndDownInk:[[10,1,36,21],[11,2,37,22]]},'2x':{advance:26,normalAndDownInk:[[8,1,38,21],[9,2,39,22]]}};
assert.deepEqual(layoutReport.speedHeaderFontInk,{DwarvenTodcraft18GreenInset:expectedHeaderFontInk,DwarvenTodcraft18BrightGreenInset:expectedHeaderFontInk});
assert.equal(layoutReport.endlessRetainedChecks,16775);
assert.equal(layoutReport.endlessLayoutChecks,8623);
assert.equal(layoutReport.endlessBonusCards,1);
assert.equal(layoutReport.endlessViewports,6);
assert.equal(layoutReport.endlessFooterCases,84);
assert.equal(layoutReport.endlessBestCases,14);
assert.equal(layoutReport.endlessBankCases,96);
assert.equal(layoutReport.endlessObservedNativeGeometry,true);
assert.equal(layoutReport.endlessAdviceCases,16);
assert.equal(layoutReport.endlessHeroVisibleBestStamp,true);
assert.equal(layoutReport.endlessNativeShovelGap,true);
assert.deepEqual(layoutReport.endlessUnclippedStampInk,{'Best: 1':[20,1,61,15],'Best: 3':[18,1,64,15],'Best: 10':[17,1,65,15],'Best: 99':[14,1,67,15],'Best: 999':[10,1,71,15],'Best: 1k':[16,1,65,15],'Best: 1.5k':[10,1,71,15],'Best: 9.9k':[8,1,74,15],'Best: 10k':[13,1,69,15],'Best: 999k':[6,1,76,15],'Best: 999m':[5,1,76,15],'Best: 1b':[17,1,65,15],'Best: 2.1b':[11,1,71,15],'Best: 4.3b':[9,1,73,15]},'Independent unclipped native Brianne12 glyph envelopes fit every stamp before any cache clipping');
const endless2UiAssetBytes=await read('tests/endless2-ui-assets.json');
assert.equal(sha(endless2UiAssetBytes),'4819dc77398ea7de5ccddf2ba9c7196faac68d7c4806f74cd982a973d8a17330');
assert.equal(layoutReport.fixturesSha256['endless2-ui-assets.json'],sha(endless2UiAssetBytes));
const endless2UiAssets=JSON.parse(endless2UiAssetBytes);
assert.deepEqual(Object.keys(endless2UiAssets).sort(),['images/Shovel.png','images/ShovelBank.png'].sort());
for(const [name,entry] of Object.entries(endless2UiAssets)){
  const bytes=Buffer.from(entry.base64,'base64');assert.equal(bytes.length,entry.bytes);assert.equal(sha(bytes),entry.sha256);
}
const speedHeaderUiBytes=await read('tests/speed-header-ui-assets.json');
assert.equal(sha(speedHeaderUiBytes),'2cb60b5af233ed96704e97c490fa9451ea6f3a9a3a477625c35666a065d84e91');
assert.equal(layoutReport.fixturesSha256['speed-header-ui-assets.json'],sha(speedHeaderUiBytes));
const speedHeaderUi=JSON.parse(speedHeaderUiBytes);
const speedHeaderParentBytes=await read('tests/speed-header-parent.json');
assert.equal(sha(speedHeaderParentBytes),'0279c8f024dceac19403c00d7fb50ae7f1364af17d2ecc24142a4e9b19a0cb8b');
assert.equal(layoutReport.fixturesSha256['speed-header-parent.json'],sha(speedHeaderParentBytes));
const speedHeaderParent=JSON.parse(speedHeaderParentBytes);assert.equal(speedHeaderParent.schema,1);
assert.equal(speedHeaderParent.parentSourceSha256,historicalParentArchiveSha);
for(const [name,entry] of Object.entries(speedHeaderParent.files)){
 const bytes=await immediateParentBytes(name);assert.equal(bytes.length,entry.bytes);assert.equal(sha(bytes),entry.sha256);
 for(const [signature,original] of Object.entries(entry.methods))assert.equal(extractLegacyFunction(bytes.toString(),signature),original,'Focused header reference retains exact complete published native button/application method');
}
assert.equal(speedHeaderUi.schema,1);assert.equal(speedHeaderUi.assetBundleId,engine.assetBundleId);
assert.equal(speedHeaderUi.mainPakSha256,'5878326408285cb01f83b4fa4edcc66d65e727f6d6ee88563b5b3b287dd259fc');
assert.deepEqual(Object.keys(speedHeaderUi.assets).sort(),['images/button_left.png','images/button_middle.png','images/button_right.png','images/button_down_left.png','images/button_down_middle.png','images/button_down_right.png','data/DwarvenTodcraft18GreenInset.txt','data/DwarvenTodcraft18GreenInset.png','data/DwarvenTodcraft18BrightGreenInset.txt','data/DwarvenTodcraft18BrightGreenInset.png'].sort());
for(const [name,entry] of Object.entries(speedHeaderUi.assets)){
 const bytes=Buffer.from(entry.base64,'base64');assert.equal(bytes.length,entry.bytes);assert.equal(sha(bytes),entry.sha256);
}
assert.deepEqual(layoutReport.speedHeaderAssetSha256,Object.fromEntries(Object.entries(speedHeaderUi.assets).map(([name,pin])=>[name,pin.sha256])));
const endlessUiAssetBytes=await read('tests/endless-ui-assets.json');
assert.equal(sha(endlessUiAssetBytes),'1ca4a8ab80e8920beef9d53d4e79c76c4753f882761451060c353dd56350caf7');
assert.equal(layoutReport.fixturesSha256['endless-ui-assets.json'],sha(endlessUiAssetBytes));
const endlessUiAssets=JSON.parse(endlessUiAssetBytes);
const endlessArtInputs=JSON.parse(await read('tests/pool-panic-endless-native-art-inputs.json'));
for(const [name,entry] of Object.entries(endless2UiAssets))assert.deepEqual({bytes:entry.bytes,sha256:entry.sha256},endlessArtInputs.sourceInputs[name],'New focused shovel geometry comes from the same independently authenticated original PAK input: '+name);
assert.equal(Object.keys(endlessArtInputs.sourceInputs).length,643);
const priorEndlessArtEntry=parent.file('endless1-candidate/tests/pool-panic-endless-native-art-inputs.json');
assert(priorEndlessArtEntry,'Authenticated immediate parent retains all469 original Endless.1 artwork inputs');
const priorEndlessArtBytes=Buffer.from(await priorEndlessArtEntry.async('uint8array'));
assert.equal(sha(priorEndlessArtBytes),'bcc6c2fe9450245cea71e85e26cd3db5d9f4fa1da9cbe63c817c211948bbf3a6');
const priorEndlessArt=JSON.parse(priorEndlessArtBytes);
assert.equal(Object.keys(priorEndlessArt.sourceInputs).length,469);
assert.deepEqual({...endlessArtInputs,sourceInputs:{}},{...priorEndlessArt,sourceInputs:{}},'Original PAK/bundle identity and every non-input artwork metadata value remain exact');
for(const [name,pin] of Object.entries(priorEndlessArt.sourceInputs))assert.deepEqual(endlessArtInputs.sourceInputs[name],pin,'All469 prior original input pins remain exact: '+name);
assert.equal(Object.keys(endlessUiAssets).length,8);
for(const [name,entry] of Object.entries(endlessUiAssets)) {
  const bytes=Buffer.from(entry.base64,'base64');
  assert.equal(sha(bytes),entry.sha256);
  assert.equal(entry.sha256,endlessArtInputs.sourceInputs[name].sha256);
  assert.equal(bytes.length,entry.bytes);
  assert.equal(bytes.length,endlessArtInputs.sourceInputs[name].bytes);
}
const endlessFontHelperBytes=await read('tests/native_endless_fonts.py');
assert.equal(sha(endlessFontHelperBytes),'1070e09b6b7f715e70bf1f2c87991c63cd42c94c63491f920f7fc8a0cc7b2c7a');
assert.equal(layoutReport.helpersSha256['native_endless_fonts.py'],sha(endlessFontHelperBytes));
const endlessCardParentBytes=await read('tests/endless-native-card-parent.json');
assert.equal(sha(endlessCardParentBytes),'9fee1a71e67cdb1657021e5a347957029aeab023cc71939f3bafdccdb65caf6f');
assert.equal(layoutReport.fixturesSha256['endless-native-card-parent.json'],sha(endlessCardParentBytes));
assert.deepEqual(layoutReport.endlessCoinBank,{x:57,y:568,width:128,height:31,sha256:'19c3b0e23f8242355348e99cb1912af140d42abf89c5743d90fd2c7f8f2f4f88'});
const cobUiAssetBytes=await read('tests/cob-ui-assets.json');
assert.equal(sha(cobUiAssetBytes),'2e9622894f707e75fe4d3c8569e488ae62f41553ae9d3ceed76b0649acc7f1e8');
assert.equal(layoutReport.fixturesSha256['cob-ui-assets.json'],sha(cobUiAssetBytes));
const cobUiAssets=JSON.parse(cobUiAssetBytes);
const cobNativeArtInputs=JSON.parse(await read('tests/cob-native-art-inputs.json'));
assert.equal(Object.keys(cobNativeArtInputs.sourceInputs).length,53);
assert.deepEqual(Object.keys(cobUiAssets).sort(),['images/FlagMeter.png','images/FlagMeterParts.png','images/FlagMeterLevelProgress.png'].sort());
for(const [name,entry] of Object.entries(cobUiAssets)) {
  const bytes=Buffer.from(entry.base64,'base64');
  assert.equal(sha(bytes),entry.sha256);
  assert.equal(entry.sha256,cobNativeArtInputs.sourceInputs[name].sha256);
  assert.equal(bytes.length,cobNativeArtInputs.sourceInputs[name].bytes);
}
assert.equal(layoutReport.bungeeObservedNativeGeometry,true);
assert.equal(layoutReport.bungeeFooterBaselineMutationRejected,true);
const layoutFixtureBytes = await read('tests/native-layout-assets.json');
assert.equal(sha(layoutFixtureBytes), layoutReport.fixturesSha256['native-layout-assets.json'],
  'Layout report pins the exact original font/sprite and legacy-regression fixture');
const layoutFixture = JSON.parse(layoutFixtureBytes);
assert.equal(layoutFixture.schema, 1);
assert.equal(layoutFixture.assetBundleId, engine.assetBundleId);
assert.equal(layoutFixture.parentSourceSha256, '540f1ee365b558e10304995692485976e91f23bb1b28c305e6ade6cd17f1ed11',
  'The preserved layout negative-control fixture identifies its original Care.1 source');
const parentLayoutFixtureEntry = parent.file('endless1-candidate/tests/native-layout-assets.json');
assert(parentLayoutFixtureEntry, 'Authenticated Lights.1 parent retains the exact layout regression fixture');
assert.deepEqual(layoutFixtureBytes, Buffer.from(await parentLayoutFixtureEntry.async('uint8array')),
  'Historical Care.1 negative methods and native asset fixtures retain every authenticated Lights.1 fixture byte');
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
const endlessCardParent=JSON.parse(endlessCardParentBytes);
assert.equal(endlessCardParent.schema,1);
assert.equal(endlessCardParent.parentSourceSha256,poolReference.archiveSha256);
const endlessCardParentSource=await parentBytes('src/Lawn/Widget/ChallengeScreen.cpp');
assert.equal(endlessCardParent.challengeScreenSha256,sha(endlessCardParentSource));
assert.equal(endlessCardParent.method,extractLegacyFunction(endlessCardParentSource.toString(),'void ChallengeScreen::DrawButton('),'Best-label reference retains the full independently authenticated original native Survival/card method');
const legacySignatures = ['Rect Board::GetShovelButtonRect()', 'void Board::DrawShovel(Graphics* g)',
  'void Board::DrawUITop(Graphics* g)', 'void MessageWidget::Draw(Graphics* g)'];
assert.deepEqual(Object.keys(layoutFixture.legacyMethods).sort(), [...legacySignatures].sort());
for (const signature of legacySignatures)
  assert.equal(layoutFixture.legacyMethods[signature], parentLayoutFixture.legacyMethods[signature],
    'Layout negative control retains its authenticated published Care.1 method: ' + signature);
const raidLayerFixtureBytes=await read('tests/raid-bank-parent.json');
assert.equal(sha(raidLayerFixtureBytes),'fdd6bf6e6d6cc40aac5e77817150cedd87ba3697ce570d4b045ff3699a6483c1');
assert.equal(layoutReport.fixturesSha256['raid-bank-parent.json'],sha(raidLayerFixtureBytes));
const raidLayerFixture=JSON.parse(raidLayerFixtureBytes);
assert.equal(raidLayerFixture.schema,1);
assert.equal(raidLayerFixture.parentSourceSha256,nativeUiArchiveSha256);
assert.equal(raidLayerFixture.boardSourceSha256,sha(await nativeUiBytes('src/Lawn/Board.cpp')));
assert.equal(raidLayerFixture.seedPacketSourceSha256,sha(await nativeUiBytes('src/Lawn/SeedPacket.cpp')));
assert.deepEqual(Object.keys(raidLayerFixture.methods).sort(),
  ['void Board::DrawUIBottom(','void Board::DrawUITop(','void Board::TutorialArrowShow(','void SeedPacket::FlashIfReady('].sort());
for(const [signature,method] of Object.entries(raidLayerFixture.methods))
  assert.equal(method,extractLegacyFunction((await nativeUiBytes(signature.includes('SeedPacket::')?
    'src/Lawn/SeedPacket.cpp':'src/Lawn/Board.cpp')).toString(),signature),
    'Restored UI/effects retain the actual authenticated native I,Zombie method: '+signature);
for(const [signature,method] of Object.entries(raidLayerFixture.methods)) {
  const currentMethod=extractLegacyFunction((await historyRead('source/'+(signature.includes('SeedPacket::')?'src/Lawn/SeedPacket.cpp':'src/Lawn/Board.cpp'))).toString(),signature);
  let nativePath=currentMethod;
  if(signature==='void Board::DrawUIBottom(') {
    const cobBankGuard='!CobCannonCommand::IsMode(mApp->mGameMode) && ';
    assert.equal(nativePath.split(cobBankGuard).length,2);
    nativePath=nativePath.replace(cobBankGuard,'');
    const bankGuard='!GarlicRun::IsMode(mApp->mGameMode) && !LightsOut::IsMode(mApp->mGameMode) && ';
    const bottomGlove='if (!LightsOut::IsMode(mApp->mGameMode) && !GarlicRun::IsMode(mApp->mGameMode)) DrawShovel(g);';
    assert.equal(nativePath.split(bankGuard).length,2);
    assert.equal(nativePath.split(bottomGlove).length,2);
    nativePath=nativePath.replace(bankGuard,'').replace(bottomGlove,'DrawShovel(g);');
  }
  if(signature==='void Board::DrawUITop(') {
    const endlessAdvice='        !(PoolPanicEndless::IsMode(mApp->mGameMode) && (mPaused || mApp->GetDialogCount() > 0)) &&\n';
    assert.equal(nativePath.split(endlessAdvice).length,2);nativePath=nativePath.replace(endlessAdvice,'');
    const lightsGlove='\tif (LightsOut::IsMode(mApp->mGameMode) || GarlicRun::IsMode(mApp->mGameMode)) DrawShovel(g);\n';
    assert.equal(nativePath.split(lightsGlove).length,2);
    nativePath=nativePath.replace(lightsGlove,'');
    const garlicOnly=' || GarlicRun::IsMode(mApp->mGameMode)';
    assert.equal(nativePath.split(garlicOnly).length,3);
    nativePath=nativePath.replaceAll(garlicOnly,'');
  }
  assert.equal(method,nativePath,
    'Native UI/effect paths stay exact after only the Lights/Garlic bank, glove, preparation and paused-advice guards: '+signature);
}
const foregroundFixtureBytes=await read('tests/raid1-foreground-ui.json');
assert.equal(sha(foregroundFixtureBytes),'bb816f27d031bffa79a91ee3f281504ebee7b666fbe4078f6762aecc83a86b95');
assert.equal(layoutReport.fixturesSha256['raid1-foreground-ui.json'],sha(foregroundFixtureBytes));
// Raid.2 authenticated these exact methods against published Raid.1. Retain
// that fixture through the pinned parent archive without bundling another engine.
const inheritedForegroundEntry=parent.file('endless1-candidate/tests/raid1-foreground-ui.json');
assert(inheritedForegroundEntry,'Authenticated Lights.1 source must retain the Raid.1 regression fixture');
const inheritedForegroundBytes=Buffer.from(await inheritedForegroundEntry.async('uint8array'));
assert.equal(sha(inheritedForegroundBytes),'bb816f27d031bffa79a91ee3f281504ebee7b666fbe4078f6762aecc83a86b95');
assert.deepEqual(foregroundFixtureBytes,inheritedForegroundBytes,'The executed regression fixture retains every authenticated parent byte');
const foregroundFixture=JSON.parse(foregroundFixtureBytes);
const inheritedForegroundFixture=JSON.parse(inheritedForegroundBytes);
assert.equal(foregroundFixture.schema,1);
assert.equal(foregroundFixture.parentSourceSha256,'50e122044bb767eb9c78cf8c38c9cd48de022f8b3f966b69b3bd29a7bbafdb8c');
assert.deepEqual(foregroundFixture,inheritedForegroundFixture,'All original source pins, metadata and native methods match the authenticated Lights.1 fixture');
assert.deepEqual(Object.keys(foregroundFixture.methods).sort(),Object.keys(raidLayerFixture.methods).sort());
for(const [signature,method] of Object.entries(foregroundFixture.methods))
  assert.equal(method,inheritedForegroundFixture.methods[signature],
    'Head-obscuring negative retains the authenticated published Raid.1 method: '+signature);
assert.equal(layoutFixture.legacyHint, 'Use the glove to rotate tired plants through the Mender bed.');
assert.equal(layoutFixture.legacyHint, parentLayoutFixture.legacyHint,
  'Long-hint regression control retains its authenticated original published intro text');
const chillReport=reports.get('lantern-shroom');
assert.equal(chillReport.retainedChillChecks,548);
assert.equal(chillReport.raidCardboardChecks,1176);
assert.equal(chillReport.raidIdleParentNegativeRejected,true);
assert.equal(chillReport.raidIdleFrameCases,420);
assert.equal(chillReport.normalIdleControlsRetained,true);
assert.equal(chillReport.raidStaticParentNegativeRejected,true);
const staticPlantFixtureBytes=await read('tests/raid2-static-plant.json');
assert.equal(sha(staticPlantFixtureBytes),'fb2fa6f1cd55ffd2ac0f3b88bb6c98e2a457d753258ef054fdd182df2f7a5ec9');
assert.equal(chillReport.fixturesSha256['raid2-static-plant.json'],sha(staticPlantFixtureBytes));
const staticPlantFixture=JSON.parse(staticPlantFixtureBytes);
assert.equal(staticPlantFixture.schema,1);
assert.equal(staticPlantFixture.parentSourceSha256,'0bb8e6ae265488e1d1da8b472c10730f0bd17df9a56337c8acc34c4c3911a225');
assert.equal(staticPlantFixture.signature,'bool DrawCustomPlant(');
const inheritedStaticEntry=parent.file('endless1-candidate/tests/raid2-static-plant.json');
assert(inheritedStaticEntry,'Authenticated Lights.1 source retains its actual Raid.2 static-attack regression fixture');
const inheritedStaticBytes=Buffer.from(await inheritedStaticEntry.async('uint8array'));
assert.equal(sha(inheritedStaticBytes),'fb2fa6f1cd55ffd2ac0f3b88bb6c98e2a457d753258ef054fdd182df2f7a5ec9');
assert.deepEqual(staticPlantFixtureBytes,inheritedStaticBytes);
assert.deepEqual(staticPlantFixture,JSON.parse(inheritedStaticBytes),'Every inherited Raid.2 static-attack method and source pin remains authenticated');
const breathingFixtureBytes=await read('tests/raid3-breathing-plant.json');
assert.equal(sha(breathingFixtureBytes),'651ae378219d5fa683cb787414138239e89aa45eac6a00e1ec44d4efbe6ab344');
assert.equal(chillReport.fixturesSha256['raid3-breathing-plant.json'],sha(breathingFixtureBytes));
const breathingFixture=JSON.parse(breathingFixtureBytes);
assert.equal(breathingFixture.schema,1);
assert.equal(breathingFixture.parentSourceSha256,'dc02a3d87a227e3b6b890cd03894999dea831c62a6d184fc2a0bc281425e51a3');
assert.equal(breathingFixture.signature,'bool DrawCustomPlant(');
const inheritedBreathingEntry=parent.file('endless1-candidate/tests/raid3-breathing-plant.json');
assert(inheritedBreathingEntry,'Authenticated Lights.1 retains the exact rejected Raid.3 breathing helper');
assert.deepEqual(breathingFixtureBytes,Buffer.from(await inheritedBreathingEntry.async('uint8array')),
  'Every inherited breathing-negative source pin and method stays byte-identical');
console.log('PASS native layout and live Raid cardboard use authenticated original sprite/font inputs, real parent regressions and preserved normal rig assertions.');
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
assert.equal(oldModes.get('NUM_GAME_MODES'), 87);
for (const [key, value] of oldModes) if (key !== 'NUM_GAME_MODES') assert.equal(newModes.get(key), value, 'Every existing mode ID remains stable: ' + key);
assert.equal(newModes.get('GAMEMODE_CHALLENGE_RALLY_POINT'), 80);
assert.equal(newModes.get('GAMEMODE_CHALLENGE_RALLY_RAID'), 81);
assert.equal(newModes.get('GAMEMODE_CHALLENGE_LIGHTS_OUT'),82);
assert.equal(newModes.get('GAMEMODE_CHALLENGE_GARLIC_RUN'),83);
assert.equal(newModes.get('GAMEMODE_CHALLENGE_BUNGEE_BUSINESS'),84);
assert.equal(newModes.get('GAMEMODE_CHALLENGE_COB_CANNON_COMMAND'),85);
assert.equal(newModes.get('GAMEMODE_CHALLENGE_POOL_PANIC'),86);
assert.equal(newModes.get('GAMEMODE_CHALLENGE_POOL_PANIC_ENDLESS'),87);
assert.equal(newModes.get('GAMEMODE_CHALLENGE_SCRAP_YARD'),88);
assert.equal(newModes.get('NUM_GAME_MODES'),91);
assert.equal(newModes.get('GAMEMODE_CHALLENGE_VASE_AMBUSH'),89);
assert.equal(newModes.get('GAMEMODE_CHALLENGE_FIRE_DRILL'),90);
const ambushModes = enumValues((await ambushSourceRead('source/src/ConstEnums.h')).toString(), 'GameMode');
assert.deepEqual([...newModes].filter(([name])=>!['GAMEMODE_CHALLENGE_FIRE_DRILL','NUM_GAME_MODES'].includes(name)),
  [...ambushModes].filter(([name])=>name!=='NUM_GAME_MODES'),'All published mode IDs0..89 remain exact');
const publishedModes = enumValues((await historyRead('source/src/ConstEnums.h')).toString(), 'GameMode');
assert.equal(publishedModes.get('NUM_GAME_MODES'),88);
assert.deepEqual([...newModes].filter(([name])=>!['GAMEMODE_CHALLENGE_SCRAP_YARD','GAMEMODE_CHALLENGE_VASE_AMBUSH','GAMEMODE_CHALLENGE_FIRE_DRILL','NUM_GAME_MODES'].includes(name)), [...publishedModes].filter(([name])=>name!=='NUM_GAME_MODES'), 'All published mode IDs0..87 remain exact');
assert.deepEqual([...newModes].filter(([name])=>!['GAMEMODE_CHALLENGE_POOL_PANIC_ENDLESS','GAMEMODE_CHALLENGE_SCRAP_YARD','GAMEMODE_CHALLENGE_VASE_AMBUSH','GAMEMODE_CHALLENGE_FIRE_DRILL','NUM_GAME_MODES'].includes(name)),[...oldModes].filter(([name])=>name!=='NUM_GAME_MODES'),'Every prior mode ID remains exact');
assert.deepEqual([...enumValues(newEnums, 'ChallengePage')], [...enumValues(oldEnums, 'ChallengePage')],
  'Cold Front uses the existing Bonus page without changing any page IDs');
const oldZombieIds = enumValues(oldEnums, 'ZombieType'), newZombieIds = enumValues(newEnums, 'ZombieType');
for (const [key,value] of oldZombieIds) if (!['NUM_ZOMBIE_TYPES','ZOMBIE_CACHED_POLEVAULTER_WITH_POLE','NUM_CACHED_ZOMBIE_TYPES'].includes(key))
  assert.equal(newZombieIds.get(key), value, 'Every original gameplay zombie ID remains stable: '+key);
assert.equal(oldZombieIds.get('NUM_ZOMBIE_TYPES'),34);
assert.equal(newZombieIds.get('ZOMBIE_RALLY'),33);
assert.equal(newZombieIds.get('ZOMBIE_TORCHBEARER'),34);
assert.equal(newZombieIds.get('NUM_ZOMBIE_TYPES'),35);
assert.equal(newZombieIds.size,oldZombieIds.size+1);
for(const sentinel of ['ZOMBIE_CACHED_POLEVAULTER_WITH_POLE','NUM_CACHED_ZOMBIE_TYPES'])
  assert.equal(newZombieIds.get(sentinel),oldZombieIds.get(sentinel)+1,'Only transient zombie cache capacity grows');
function zombieDefinitions(text) {
  const table=text.slice(text.indexOf('gZombieDefs['));
  return [...table.slice(0,table.indexOf('};')).matchAll(/\{\s*\.mZombieType\s*=[^}]+\}/g)].map(m=>m[0].replace(/\s+/g,' ').trim());
}
const parentZombieDefs=zombieDefinitions((await parentBytes('src/Lawn/Zombie.cpp')).toString());
const currentZombieDefs=zombieDefinitions((await read('source/src/Lawn/Zombie.cpp')).toString());
assert.equal(parentZombieDefs.length,34);
assert.deepEqual(currentZombieDefs.slice(0,34),parentZombieDefs);
assert.equal(currentZombieDefs.length,35);
assert.match(currentZombieDefs[33],/ZOMBIE_RALLY/);
assert.match(currentZombieDefs.at(-1),/ZOMBIE_TORCHBEARER/);
assert.match(currentZombieDefs.at(-1),/mPickWeight = 0/);
const oldSeeds = enumValues(oldEnums, 'SeedType'), newSeeds = enumValues(newEnums, 'SeedType');
for (const [key, value] of oldSeeds) assert.equal(newSeeds.get(key), value, 'Every original and special seed ID stays stable: ' + key);
assert.equal(newSeeds.get('SEED_MENDERBLOOM'), 76);
assert.equal(newSeeds.get('SEED_ZOMBIE_RALLY'), 77);
assert.deepEqual([...newSeeds], [...oldSeeds], 'All existing native and custom seed IDs remain exact');
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
assert.equal(oldDefinitions.length, 86);
assert.deepEqual(newDefinitions.slice(0,oldDefinitions.length), oldDefinitions, 'Every original and all fourteen prior Bonus challenge definitions remain exact');
const publishedDefinitions = definitions((await historyRead('source/src/Lawn/Widget/ChallengeScreen.cpp')).toString());
assert.equal(publishedDefinitions.length, oldDefinitions.length+1);
assert.deepEqual(newDefinitions.slice(0,publishedDefinitions.length), publishedDefinitions, 'Every one of the fifteen published Bonus cards and all original catalog entries remains exact');
assert.equal(newDefinitions.length, publishedDefinitions.length+3);
const scrapDefinitions=definitions((await scrapSourceRead('source/src/Lawn/Widget/ChallengeScreen.cpp')).toString());
assert.equal(scrapDefinitions.length,publishedDefinitions.length+1);
assert.deepEqual(newDefinitions.slice(0,scrapDefinitions.length),scrapDefinitions,'Every original and all sixteen published Bonus definitions are exact');
assert.match(newDefinitions[87], /GAMEMODE_CHALLENGE_SCRAP_YARD/);
assert.match(newDefinitions[87], /Scrap Yard/);
assert.match(newDefinitions[87], /CHALLENGE_PAGE_BONUS/);
assert.match(newDefinitions[87], /\.mRow = 4/);
assert.match(newDefinitions[87], /\.mCol = 0/);
assert.match(newDefinitions[88],/GAMEMODE_CHALLENGE_VASE_AMBUSH/);
assert.match(newDefinitions[88],/Vase Ambush/);
assert.match(newDefinitions[88],/CHALLENGE_PAGE_BONUS/);
assert.match(newDefinitions[88],/\.mRow = 4/);
assert.match(newDefinitions[88],/\.mCol = 1/);
const ambushDefinitions=definitions((await ambushSourceRead('source/src/Lawn/Widget/ChallengeScreen.cpp')).toString());
assert.deepEqual(newDefinitions.slice(0,89),ambushDefinitions,'All seventeen published Bonus cards retain their exact definitions');
assert.equal(newDefinitions.length,90);
assert.match(newDefinitions[89],/GAMEMODE_CHALLENGE_FIRE_DRILL/);
assert.match(newDefinitions[89],/Fire Drill/);
assert.match(newDefinitions[89],/CHALLENGE_PAGE_BONUS/);
assert.match(newDefinitions[89],/\.mRow = 4/);
assert.match(newDefinitions[89],/\.mCol = 2/);
assert.match(newDefinitions[81], /GAMEMODE_CHALLENGE_LIGHTS_OUT/);
assert.match(newDefinitions[81], /Lights Out/);
assert.match(newDefinitions[81], /CHALLENGE_PAGE_BONUS/);
assert.match(newDefinitions[81], /\.mRow = 2/);
assert.match(newDefinitions[81], /\.mCol = 4/);
assert.match(newDefinitions[82], /GAMEMODE_CHALLENGE_GARLIC_RUN/);
assert.match(newDefinitions[83], /GAMEMODE_CHALLENGE_BUNGEE_BUSINESS/);
assert.match(newDefinitions[84], /GAMEMODE_CHALLENGE_COB_CANNON_COMMAND/);
assert.match(newDefinitions[85], /GAMEMODE_CHALLENGE_POOL_PANIC/);
assert.match(newDefinitions[86], /GAMEMODE_CHALLENGE_POOL_PANIC_ENDLESS/);
assert.match(newDefinitions[82], /Garlic Run/);
assert.match(newDefinitions[83], /Bungee Business/);
assert.match(newDefinitions[84], /Cob Cannon Command/);
assert.match(newDefinitions[85], /Pool Panic/);
assert.match(newDefinitions[86], /Pool Panic Endless/);
assert.match(newDefinitions[86], /CHALLENGE_PAGE_BONUS/);
assert.match(newDefinitions[86], /\.mRow = 3/);
assert.match(newDefinitions[82], /\.mCol = 0/);
assert.match(newDefinitions[83], /\.mCol = 1/);
assert.match(newDefinitions[84], /\.mCol = 2/);
assert.match(newDefinitions[85], /\.mCol = 3/);
assert.match(newDefinitions[86], /\.mCol = 4/);
console.log('PASS native I,Zombie presentation restoration preserves every prior mode/seed ID, saved layout, plant and all fourteen prior Bonus challenge identities.');

const artRecordBytes=fs.readFileSync(new URL('content/native-bonus-art.json', dist));
const publishedArtBytes = fs.readFileSync(new URL('./fixtures/endless3-native-bonus-art.json', import.meta.url));
assert.equal(sha(publishedArtBytes),'538175fc8c54e8efb241a129263f2c99ee8e4193fb09ace213a67e9430f7483b','Independent reviewed fifteen-card native Bonus metadata');
const publishedArt = JSON.parse(publishedArtBytes);
const currentArtRecord = JSON.parse(artRecordBytes);
assert.equal(currentArtRecord.cards.length,18);
const ambushArtBytes=fs.readFileSync(new URL('./fixtures/ambush1-native-bonus-art.json',import.meta.url));
assert.equal(sha(ambushArtBytes),'e4b04a29302b31268b9aed1563c7a03bccd174fdb55f36bb7bda75a832df74e4');
const ambushArt=JSON.parse(ambushArtBytes);
assert.equal(ambushArt.cards.length,17);
assert.deepEqual({...currentArtRecord,cards:currentArtRecord.cards.slice(0,17)},ambushArt,'All seventeen prior native card records remain exact');
assert.equal(currentArtRecord.cards[17].mode,90);
assert.equal(currentArtRecord.cards[17].name,'Fire Drill');
assert.equal(currentArtRecord.cards[17].generatedArtworkUsed,false);
for(const field of ['tip','tips','descriptionBelowCard'])assert(!Object.hasOwn(currentArtRecord.cards[17],field));
const scrapArtBytes=fs.readFileSync(new URL('./fixtures/scrap1-native-bonus-art.json',import.meta.url));
assert.equal(sha(scrapArtBytes),'183cb482642023f7b1ed7102052143b0c5bf543204150626670c832d4db3eaf0','Independently retained published sixteen-card metadata');
const scrapArt=JSON.parse(scrapArtBytes);
assert.equal(scrapArt.cards.length,16);
assert.deepEqual({...currentArtRecord,cards:currentArtRecord.cards.slice(0,16)},scrapArt,'All sixteen prior native card records remain exact');
assert.equal(currentArtRecord.cards[16].mode,89);
assert.equal(currentArtRecord.cards[16].name,'Vase Ambush');
assert.equal(currentArtRecord.cards[16].generatedArtworkUsed,false);
assert.deepEqual({...currentArtRecord,cards:currentArtRecord.cards.slice(0,15)},publishedArt, 'All fifteen published card records and every non-card metadata value remain exact');
assert.equal(currentArtRecord.cards[15].mode,88);
assert.equal(currentArtRecord.cards[15].name,'Scrap Yard');
assert.equal(currentArtRecord.cards[15].generatedArtworkUsed,false);
// Retain every older artwork assertion against the authenticated unchanged prefix.
const artRecord = {...currentArtRecord,cards:currentArtRecord.cards.slice(0,15)};
assert.match(artRecord.sourceKind, /native sprite compositions/);
assert.equal(artRecord.generatedArtworkUsed, true, 'Generated artwork is scoped to the permitted plant sprite');
assert.equal(artRecord.standaloneChallengeIllustrations, false, 'Cards contain actual sprites, not separately generated illustrations');
assert.equal(artRecord.assetBundleId, engine.assetBundleId);
assert.equal(artRecord.plant.nativeReanimation, 'REANIM_ICESHROOM');
assert.equal(artRecord.plant.spriteOverride, 'chill-shroom/provenance.json');
assert.deepEqual(artRecord.canvas, {width: 80, height: 65, heroCenterX: 40, heroCenterY: 32.5, maxHeroWidth: 68, maxHeroHeight: 57});
assert.deepEqual(artRecord.cards.map(card => card.mode), [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87]);
assert.deepEqual(artRecord.cards.map(card => card.name), ['Cone Zone', 'Night Shift', 'Cold Front', 'Garden Shuffle', 'Seed Swap', 'Intensive Lawn Care', 'Chain Reaction', 'Rally Point', 'Rally Raid', 'Lights Out', 'Garlic Run', 'Bungee Business', 'Cob Cannon Command', 'Pool Panic', 'Pool Panic Endless']);

const parentArtBytes = await read('tests/raid-parent-native-art.json');
assert.equal(sha(parentArtBytes), '59ae4b436d2a6a5422697561ef91167cd9298a02c4bb6edf9b47254229e2c9c2', 'Independent exact published Rally.3 card metadata fixture');
const parentArtRecord = JSON.parse(parentArtBytes);
assert.deepEqual(artRecord.cards.slice(0, 8), parentArtRecord.cards, 'Every existing card retains all original metadata');
for (const [key, value] of Object.entries(parentArtRecord))
  if (!['cards', 'checkpointCompatibility'].includes(key)) assert.deepEqual(artRecord[key], value, 'Existing art metadata remains unchanged: ' + key);
assert(artRecord.checkpointCompatibility.startsWith(parentArtRecord.checkpointCompatibility));
assert.equal(artRecord.cards[8].mode,81);
const raidCard=artRecord.cards[8];
assert.equal(raidCard.name,'Rally Raid');
assert.equal(raidCard.hero,'Original repaired Rally Zombie rig and IMAGE_BRAIN, composed at native card resolution');
assert.equal(raidCard.background,'IMAGE_BACKGROUND1');
assert.equal(raidCard.generatedArtworkUsed,false);
assert.match(raidCard.gameplay,/Five fixed I, Zombie boards[\s\S]*finite sun budget[\s\S]*Chill-shroom and Mender-bloom[\s\S]*Only board five grants/);
assert.match(raidCard.artwork,/repaired closed grip/);
assert.match(raidCard.artwork,/22(?: by | ?[xÃƒâ€”] ?)20/);
assert.match(raidCard.artwork,/68 by 57[\s\S]*80 by 65/);
assert.equal(raidCard.interface,'Original I, Zombie bank, brains, deployment line, native pause/Menu/speed controls and brain meter. Native footer shows board progress. Raid uses the original I, Zombie draw order and packet-feedback layers; top-row zombie heads render in front of the bank exactly as in that mode.');
const raid1ArtBytes=await read('tests/raid1-parent-native-art.json');
assert.equal(sha(raid1ArtBytes),'de848b0ea094559f2d5287f3d13059cdef72a4a6db6d2ee5c83b7e9a3c66cce8');
const raid1Art=JSON.parse(raid1ArtBytes);
const expectedArt=structuredClone(raid1Art);
expectedArt.cards[8].interface=raidCard.interface;
assert.deepEqual({...artRecord,cards:artRecord.cards.slice(0,9)},expectedArt,'Every prior card/artwork/compatibility value remains exact');
const lightsParentArtBytes=await read('tests/lights-parent-native-art.json');
assert.equal(sha(lightsParentArtBytes),'c94ea4a5a2f77b218b9c045a0f718f8654f03db79c033c7d667247a698e5ea3b');
assert.deepEqual({...artRecord,cards:artRecord.cards.slice(0,9)},JSON.parse(lightsParentArtBytes),'Lights Out only appends one native card record');
assert.equal(artRecord.cards[9].mode,82);
assert.equal(artRecord.cards[9].name,'Lights Out');
assert.equal(artRecord.cards[9].generatedArtworkUsed,false);
assert.match(artRecord.cards[9].hero,/Original REANIM_PLANTERN/);
assert.match(artRecord.cards[9].background,/IMAGE_BACKGROUND2[\s\S]*IMAGE_FOG_SOFTWARE/);
const garlicParentArtBytes=await read('tests/garlic-parent-native-art.json');
assert.equal(sha(garlicParentArtBytes),'5e24ea62e230865ed09640e2b30e23be20860cb5bf3c0cc9e9c4d5877ba92ca0');
assert.deepEqual({...artRecord,cards:artRecord.cards.slice(0,10)},JSON.parse(garlicParentArtBytes),'Garlic Run appends one record and preserves every prior artwork/compatibility byte');
assert.equal(artRecord.cards[10].mode,83);
assert.equal(artRecord.cards[10].name,'Garlic Run');
assert.equal(artRecord.cards[10].generatedArtworkUsed,false);
assert.match(artRecord.cards[10].hero,/Original REANIM_GARLIC/);
const bungeeParentArtBytes=await read('tests/bungee-parent-native-art.json');
assert.equal(sha(bungeeParentArtBytes),'c641c6ddb3479fd75afc46f4f4de68fb831caad18e22acd3fff35a223b988c28');
assert.deepEqual({...artRecord,cards:artRecord.cards.slice(0,11)},JSON.parse(bungeeParentArtBytes),'Bungee Business appends one record and preserves every prior artwork/compatibility value');
assert.equal(artRecord.cards[11].mode,84);
assert.equal(artRecord.cards[11].name,'Bungee Business');
assert.equal(artRecord.cards[11].generatedArtworkUsed,false);
assert.match(artRecord.cards[11].hero,/Original REANIM_BUNGEE[\s\S]*REANIM_SUNFLOWER[\s\S]*REANIM_UMBRELLALEAF/);
assert.equal(sha(await read('tests/bungee-native-art-inputs.json')),'de72c77af01f18c6a34fa73ae96bda1917c3ef7d338ac552e09f0a49292c5793');
const cobParentArtBytes=await read('tests/cob-parent-native-art.json');
assert.equal(sha(cobParentArtBytes),'1b01deaea4c08f6561168c195935ac93df0b715da490791170a281af58120309');
assert.deepEqual({...artRecord,cards:artRecord.cards.slice(0,12)},JSON.parse(cobParentArtBytes),'Cob Cannon Command appends only its own card while all twelve old artwork and non-card values remain exact');
const cobCard=artRecord.cards[12];
assert.equal(cobCard.mode,85);
assert.equal(cobCard.name,'Cob Cannon Command');
assert.equal(cobCard.background,'IMAGE_BACKGROUND1');
assert.equal(cobCard.generatedArtworkUsed,false);
assert.match(cobCard.hero,/Original REANIM_COBCANNON loaded idle rig/);
assert.match(cobCard.artwork,/complete original loaded Cob Cannon assembly[\s\S]*68 by57|complete original loaded Cob Cannon assembly[\s\S]*68 by 57/);
assert.equal(sha(await read('tests/cob-native-art-inputs.json')),'212692d9fa221a0f8865aa900028bcafe4f0322128a7af12d7716271d0241229');
const poolParentArtBytes=await read('tests/pool-parent-native-art.json');
assert.equal(sha(poolParentArtBytes),'4206d7a5c8cf3d237d34922e30717fa06af5696679214d8ec836fae91c72b6a3');
assert.deepEqual({...artRecord,cards:artRecord.cards.slice(0,13)},JSON.parse(poolParentArtBytes),'Pool Panic appends only its own card and preserves all thirteen prior records and every non-card value');
const poolCard=artRecord.cards[13];
assert.equal(poolCard.mode,86);
assert.equal(poolCard.name,'Pool Panic');
assert.equal(poolCard.background,'IMAGE_BACKGROUND3 with original IMAGE_POOL water layer');
assert.equal(poolCard.generatedArtworkUsed,false);
assert.match(poolCard.hero,/Original REANIM_SQUASH[\s\S]*REANIM_TANGLEKELP[\s\S]*REANIM_LILYPAD/);
assert.match(poolCard.artwork,/complete native assembly[\s\S]*68 by57[\s\S]*80 by65/);
assert.equal(sha(await read('tests/pool-native-art-inputs.json')),'b3a57630c55aec10e86186fe6164bd1c7133090fc88baa921b7277f40984c19c');
const endlessParentArtBytes=await read('tests/endless-parent-native-art.json');
assert.equal(sha(endlessParentArtBytes),'9bda9645402a6322b20b29b69b0bdad52d1013835e8db071d07648aa95a905d8');
assert.deepEqual({...artRecord,cards:artRecord.cards.slice(0,14)},JSON.parse(endlessParentArtBytes),'Pool Panic Endless appends only its own card and preserves all fourteen prior records and every non-card value');
const endlessCard=artRecord.cards[14];
const endless2ParentArtBytes=await read('tests/endless2-parent-native-art.json');
assert.equal(sha(endless2ParentArtBytes),'79f63cc7b4003cb55c747561f575605efe03d2ae5edcaa76c59706499c8f13f3');
const endless2ParentArt=JSON.parse(endless2ParentArtBytes);
assert.deepEqual({...artRecord,cards:artRecord.cards.slice(0,14)},{...endless2ParentArt,cards:endless2ParentArt.cards.slice(0,14)},'All fourteen prior card records and every non-card metadata value remain exact to Endless.1');
assert.deepEqual({...artRecord.cards[14],gameplay:'',interface:''},{...endless2ParentArt.cards[14],gameplay:'',interface:''},'The unique original Dolphin composition, name, mode and artwork provenance remain exact');
assert.equal(endlessCard.mode,87);
assert.equal(endlessCard.name,'Pool Panic Endless');
assert.equal(endlessCard.background,'IMAGE_BACKGROUND3 with original IMAGE_POOL water layer');
assert.equal(endlessCard.generatedArtworkUsed,false);
assert.match(endlessCard.hero,/Original REANIM_ZOMBIE_DOLPHINRIDER anim_ride assembly/);
assert.match(endlessCard.artwork,/complete original Dolphin Rider[\s\S]*68 by57[\s\S]*80 by65/);
assert.match(endlessCard.interface,/compact original Brianne12 Best stamp[\s\S]*Dolphin hero and title clear[\s\S]*Every stock Survival card keeps its original rendering/);
assert.match(endlessCard.interface,/No extra persistent HUD or tips below cards/);
assert.match(endlessCard.gameplay,/Repeater, Threepeater, Tall-nut, Torchwood, Spikeweed and Lily Pad[\s\S]*Squash, Tangle Kelp, Cherry Bomb and Jalapeno/);
assert.equal(sha(await read('tests/pool-panic-endless-native-art-inputs.json')),'65c53e2ed9cba7bc53d3dcfd36eb6a8c32c87d55f5e81be280c4a141915eb1e9');
assert.notEqual(raidCard.interface,raid1Art.cards[8].interface);
assert.match(artRecord.checkpointCompatibility,/Rally Raid appends mode81[\s\S]*profile record80[\s\S]*Packet77 remains outside original plant\/cache\/chooser ranges/);
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
assert.deepEqual(Object.keys(sourceManifest.files).sort(),
  [...Object.keys(historySource.manifest.files), ...SCRAP_SOURCE_ADDITIONS, ...AMBUSH_SOURCE_ADDITIONS, ...TORCH_SOURCE_ADDITIONS].sort(),
  'Torchbearer retains every860 published Ambush source path and appends only eight implementation/presentation files');
const completeProductionSources = Object.fromEntries(Object.entries(sourceManifest.files)
  .map(([name, pin]) => ['source/' + name, pin.sha256]));
assert.deepEqual(fullRunReport.sourceSha256, completeProductionSources,
  'Every full-engine source input matches the complete published production manifest');
assert.equal(Object.keys(completeProductionSources).length,CURRENT_SOURCE_COUNT);
for(const [name,result] of reports)
  for(const [input,pin] of Object.entries(result.sourceSha256))
    assert.equal(completeProductionSources[input],pin,'Every native suite uses this same complete release source: '+name+'/'+input);
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
// Existing production changes are limited to the appended native Pool Panic Endless mode and native integration hooks.
const runtimeInputs = new Set(['src/ConstEnums.h','src/Lawn/Board.cpp','src/Lawn/Challenge.cpp','src/Lawn/System/BonusChallenge.h','src/Lawn/Widget/ChallengeScreen.cpp','src/Lawn/Widget/LawnDialog.cpp','src/Lawn/Zombie.cpp','src/LawnApp.cpp']);
const releaseIdentityInputs = new Set(['CMake/ProjectVersion.cmake']);
const addedRaidInputs = ['src/Lawn/System/PoolPanicEndless.cpp','src/Lawn/System/PoolPanicEndless.h','src/Lawn/System/PoolPanicEndlessPresentation.cpp','src/Lawn/System/PoolPanicEndlessPresentation.h'];
const nativeNames = ['PeaShooter_backleaf.png', 'PeaShooter_backleaf_lefttip.png', 'PeaShooter_backleaf_righttip.png',
  'PeaShooter_stalk_bottom.png', 'PeaShooter_stalk_top.png', 'PeaShooter_frontleaf.png',
  'PeaShooter_frontleaf_righttip.png', 'PeaShooter_frontleaf_lefttip.png', 'SunFlower_head.png',
  'SunFlower_blink1.png', 'SunFlower_leftpetal3.png', 'SunFlower_leftpetal4.png', 'SunFlower.reanim'];
const reviewedEndless2Inputs=new Set(['src/Lawn/Board.cpp','src/Lawn/Challenge.cpp','src/LawnApp.cpp','src/Lawn/Widget/GameButton.cpp',...addedRaidInputs]);
const reviewedEndless3Inputs=new Set(['CMake/ProjectVersion.cmake','src/Lawn/System/PoolPanicEndless.cpp','src/Lawn/System/PoolPanicEndless.h']);
const publishedEndless2Names=Object.values(publishedEndless2.files)
  .filter(entry=>!entry.dir&&entry.name.startsWith(publishedEndless2Prefix))
  .map(entry=>entry.name.slice(publishedEndless2Prefix.length));
assert.equal(publishedEndless2Names.length,852);
assert.deepEqual(Object.keys(historySource.manifest.files).sort(),publishedEndless2Names.sort(),'Endless.3 preserves every production path');
const actualEndless3Changes=[];
for(const name of publishedEndless2Names){
  const before=await publishedEndless2Source(name),after=await historyRead('source/'+name);
  const pin=historySource.manifest.files[name];assert.equal(pin.bytes,after.length);assert.equal(pin.sha256,sha(after));
  if(!after.equals(before))actualEndless3Changes.push(name);
  if(!reviewedEndless3Inputs.has(name))assert.deepEqual(after,before,'Every unrelated mode, sprite and UI byte remains exact to published Endless.2: '+name);
  if(releaseIdentityInputs.has(name))assert.equal(after.toString().replaceAll('0.2.6-web-endless.3','0.2.6-web-endless.2'),before.toString());
}
assert.deepEqual(actualEndless3Changes.sort(),[...reviewedEndless3Inputs].sort());
let immediateParentCount=0;
for(const entry of Object.values(parent.files)){
  if(entry.dir||!entry.name.startsWith(parentPrefix))continue;
  ++immediateParentCount;const name=entry.name.slice(parentPrefix.length);
  const before=Buffer.from(await entry.async('uint8array')),after=await publishedEndless2Source(name);
  if(reviewedEndless2Inputs.has(name)){assert(!after.equals(before),'Every reviewed Endless.2 source delta is an actual change: '+name);continue;}
  if(releaseIdentityInputs.has(name))assert.equal(after.toString().replaceAll('0.2.6-web-endless.2','0.2.6-web-endless.1'),before.toString());
  else assert.deepEqual(after,before,'Every unrelated source/artwork byte remains exact to immediate Endless.1: '+name);
}
assert.equal(immediateParentCount,852);
assert.deepEqual(Object.keys(historySource.manifest.files).filter(name=>!parent.file(parentPrefix+name)),[],'Endless.2 adds no production files');
assert.equal(Object.keys(historySource.manifest.files).length,immediateParentCount);
// Preserve the original complete Pool→Endless1 production delta inventory.
let parentSourceCount=0;
for(const [name,before] of poolSources){
  ++parentSourceCount;const after=await immediateParentBytes(name);
  if(runtimeInputs.has(name)){assert(!after.equals(before),'Every historical reviewed Endless.1 delta is actual: '+name);continue;}
  if(releaseIdentityInputs.has(name))assert.equal(after.toString().replaceAll('0.2.6-web-endless.1','0.2.6-web-pool.1'),before.toString());
  else assert.deepEqual(after,before,'Every historical unrelated Pool source/artwork byte remains exact: '+name);
}
assert.equal(parentSourceCount,848);
const addedProduction=Object.keys(historySource.manifest.files).filter(name=>!poolSources.has(name));
assert.deepEqual(addedProduction.sort(),[...addedRaidInputs].sort(),'Endless.1 added exactly four reviewed implementation/presentation files');
assert.equal(Object.keys(historySource.manifest.files).length,parentSourceCount+addedRaidInputs.length);
const normalizeSource = bytes => bytes.toString().replace(/\r\n?/g, '\n');
// Reconstruct the exact historical Lights.2 Zombie from authenticated Garlic.1.
// Its independently obtained normalized SHA pins every old source byte.
const publishedPoolZombie=normalizeSource(await parentBytes('src/Lawn/Zombie.cpp'));
const publishedPoolBoard=normalizeSource(await parentBytes('src/Lawn/Board.cpp'));
const publishedPoolScreen=normalizeSource(await parentBytes('src/Lawn/Widget/ChallengeScreen.cpp'));
// Remove only exact Pool routing. The complete old Board, Zombie and catalog
// then match the authenticated immediate Cob.1 parent without another ZIP.
let parentZombieFromPool=publishedPoolZombie;
const poolZombieGuard='PoolPanic::IsMode(mApp->mGameMode) || ';
assert.equal(parentZombieFromPool.split(poolZombieGuard).length,2);
parentZombieFromPool=parentZombieFromPool.replace(poolZombieGuard,'');
assert.equal(sha(Buffer.from(parentZombieFromPool)),'3fce536701fcc7f88a32f306c886405ece7ad2ffe4cecc1adbad9ecd11c7be92','Reconstructed complete Cob.1 Zombie matches its independently authenticated published-source pin');
const publishedCobZombie=parentZombieFromPool;
let parentBoardFromPool=publishedPoolBoard;
for(const [addition,count] of [
  ['\tcase GameMode::GAMEMODE_CHALLENGE_POOL_PANIC:\n',1],
  ['PoolPanic::IsMode(aGameMode) ? PoolPanic::kActive : ',1],
  ['PoolPanic::IsMode(mApp->mGameMode) || ',3],
  ['    if (PoolPanic::IsMode(mApp->mGameMode)) return;\n',1],
]) {
  assert.equal(parentBoardFromPool.split(addition).length,count+1,'Exact Pool-only Board integration: '+addition);
  parentBoardFromPool=parentBoardFromPool.replaceAll(addition,'');
}
assert.equal(sha(Buffer.from(parentBoardFromPool)),'18b0b53ad2289cc2131cc5a444ca576c2d0984e3eccbc5f0aeac2b4319537d66','Reconstructed complete Cob.1 Board matches its independently authenticated published-source pin');
const publishedCobBoard=parentBoardFromPool;
let parentScreenFromPool=publishedPoolScreen;
for(const [addition,replacement] of [
  ['#include "../System/PoolPanicPresentation.h"\n',''],
  [',\n\t{ .mChallengeMode = GameMode::GAMEMODE_CHALLENGE_POOL_PANIC, .mChallengeIconIndex = 0, .mPage = ChallengePage::CHALLENGE_PAGE_BONUS, .mRow = 3, .mCol = 3, .mChallengeName = "Pool Panic" }',''],
  ['if (Image* image = mode == GAMEMODE_CHALLENGE_POOL_PANIC ? PoolPanicPresentation::GetBonusImage() :\n        mode == GAMEMODE_CHALLENGE_COB_CANNON_COMMAND ?', 'if (Image* image = mode == GAMEMODE_CHALLENGE_COB_CANNON_COMMAND ?'],
]) {
  assert.equal(parentScreenFromPool.split(addition).length,2,'Exact Pool-only native catalog addition');
  parentScreenFromPool=parentScreenFromPool.replace(addition,replacement);
}
assert.equal(sha(Buffer.from(parentScreenFromPool)),'a2278ef11b532c1307d914619f288c6576e0a0f0a1594117ca15ae82a72f6ad7','Reconstructed complete Cob.1 ChallengeScreen retains every independently authenticated prior card, control and source byte');



// Remove only the explicitly reviewed Cob additions. Both full files must
// reconstruct the exact directly authenticated published Bungee.1 parent.
let parentZombieFromCob=publishedCobZombie;
const cobZombieGuard='CobCannonCommand::IsMode(mApp->mGameMode) || ';
assert.equal(parentZombieFromCob.split(cobZombieGuard).length,2);
parentZombieFromCob=parentZombieFromCob.replace(cobZombieGuard,'');
assert.equal(sha(Buffer.from(parentZombieFromCob)),'dd593bf092ea7f824b4aa131550f65a106eee376114457fd06c75716f994d918','Complete reconstructed Bungee Zombie matches the independently authenticated published Bungee.1 source');
const publishedBungeeZombie=parentZombieFromCob;
let parentBoardFromCob=publishedCobBoard;
for(const [addition,count] of [
  ['CobCannonCommand::IsMode(aGameMode) ? CobCannonCommand::kActive : ',1],
  ['CobCannonCommand::IsMode(mApp->mGameMode) || ',4],
  ['!CobCannonCommand::IsMode(mApp->mGameMode) && ',1],
]) {
  assert.equal(parentBoardFromCob.split(addition).length,count+1,'Exact Cob-only Board integration: '+addition);
  parentBoardFromCob=parentBoardFromCob.replaceAll(addition,'');
}
assert.equal(sha(Buffer.from(parentBoardFromCob)),'509942d4e2c1e32a7b8369cbb0522a1bb537d679e234419f9c7d89967b47288c','Complete reconstructed Bungee Board matches the independently authenticated published Bungee.1 source');
const publishedBungeeBoard=parentBoardFromCob;


// Only exact Bungee-only hooks may differ from the complete published Garlic.1
// Board/Zombie. This includes preserving every prior native Bungee mechanic.
let parentZombieFromBungee=publishedBungeeZombie;
for(const addition of [
  '            if (BungeeBusiness::IsMode(mApp->mGameMode)) BungeeBusiness::OnBungeeExit(*this);\n',
  ' && !BungeeBusiness::IsMode(mApp->mGameMode)',
  'BungeeBusiness::IsMode(mApp->mGameMode) || ',
]) {
  assert.equal(parentZombieFromBungee.split(addition).length,2,'Exact Bungee-only Zombie hook: '+addition);
  parentZombieFromBungee=parentZombieFromBungee.replace(addition,'');
}
assert.equal(sha(Buffer.from(parentZombieFromBungee)),'f5f2b7955d990f478b78fd907c2147783ef0a5be2d8e34cf645e1eadde2f3a2d','All reconstructed Garlic Zombie bytes match the independently authenticated published Garlic.1 source');
const afterWalkingZombie=parentZombieFromBungee;
let parentBoardFromBungee=publishedBungeeBoard;
const removeBungeeBoard=(addition,count=1,replacement='')=>{
  assert.equal(parentBoardFromBungee.split(addition).length,count+1,'Exact Bungee-only Board hook: '+addition);
  parentBoardFromBungee=parentBoardFromBungee.replaceAll(addition,replacement);
};
removeBungeeBoard('BungeeBusiness::IsMode(aGameMode) ? BungeeBusiness::kActive : ');
removeBungeeBoard('\t\tif (BungeeBusiness::IsMode(mApp->mGameMode))\n        {\n            aLevelStr = BungeeBusiness::LevelLabel(mChallenge->mSurvivalStage);\n        }\n\t\telse if (GarlicRun::IsMode(mApp->mGameMode))',1,'\t\tif (GarlicRun::IsMode(mApp->mGameMode))');
// Four prefixes include the mode-only correction for the native footer descender.
removeBungeeBoard('BungeeBusiness::IsMode(mApp->mGameMode) || ',4);
assert.equal(sha(Buffer.from(parentBoardFromBungee)),'fd58ac067e264888eb1608c7333345300ed7a0afa52c1568d3ba7c053138c27b','All reconstructed Garlic Board bytes match the independently authenticated published Garlic.1 source');
const afterBoard=parentBoardFromBungee;


const currentWalkingZombie=normalizeSource(await historyRead('source/src/Lawn/Zombie.cpp'));
let priorZombiePath=afterWalkingZombie;
for(const addition of [' || GarlicRun::HoldsZombie(*this)',' || GarlicRun::IsMode(mApp->mGameMode)']) {
  assert.equal(priorZombiePath.split(addition).length,2);
  priorZombiePath=priorZombiePath.replace(addition,'');
}
assert.equal(sha(Buffer.from(priorZombiePath)),'8eb437a83daa301cf56e4ddff1623381c933b26e8abd1dfc2823278d51201160','Only the Garlic planning hold and no-intermediate-award guards may change; the complete reconstructed Zombie matches independently authenticated Lights.2 bytes');
const beforeRaidPresentation=normalizeSource(await parentBytes('src/Lawn/System/RallyRaidPresentation.cpp'));
const afterRaidPresentation=normalizeSource(await historyRead('source/src/Lawn/System/RallyRaidPresentation.cpp'));
for(const signature of ['Sexy::Image* GetBonusImage(', 'std::string LevelLabel(', 'void DisposeImage('])
  assert.equal(extractLegacyFunction(afterRaidPresentation,signature),extractLegacyFunction(beforeRaidPresentation,signature),'Accepted Raid card/progression/cache lifecycle stays exact');
const beforePlant = normalizeSource(await parentBytes('src/Lawn/Plant.cpp'));
const afterPlant = normalizeSource(await historyRead('source/src/Lawn/Plant.cpp'));
for (const signature of ['void DrawCareFatigue(Graphics* g, Plant& plant, Reanimation& body, float baseY)',
  "namespace\n{\n// Reanimation's matrix draw path does not use Graphics::SetScale."])
  assert.equal(extractLegacyFunction(afterPlant, signature), extractLegacyFunction(beforePlant, signature), 'Care fatigue rendering remains exact');
const currentBoard = normalizeSource(await historyRead('source/src/Lawn/Board.cpp'));
// Remove only the five exact reviewed Endless.2 Board edits before stripping
// older guards. Whole-file equality against the authenticated immediate parent
// prevents a new-mode change from erasing or broadening any historic path.
let restoredEndless1Board=currentBoard;
for(const [addition,previous] of [
  [
    "    if (PoolPanicEndless::IsMode(mApp->mGameMode)) return Rect(600 + (mSeedBank ? mSeedBank->mX : SEED_BANK_OFFSET_X_END), 0, Sexy::IMAGE_SHOVELBANK->GetWidth(), Sexy::IMAGE_SHOVELBANK->GetHeight());\n",
    ""
  ],
  [
    "    if (PoolPanicEndless::IsMode(mApp->mGameMode)) PoolPanicEndless::PreloadResources();\n",
    ""
  ],
  [
    "\t\tif (!IsSurvivalStageWithRepick() && mApp->mGameMode != GameMode::GAMEMODE_CHALLENGE_LAST_STAND && !mApp->IsContinuousChallenge() && !PoolPanicEndless::IsMode(mApp->mGameMode))\n",
    "\t\tif (!IsSurvivalStageWithRepick() && mApp->mGameMode != GameMode::GAMEMODE_CHALLENGE_LAST_STAND && !mApp->IsContinuousChallenge())\n"
  ],
  [
    "    if (PoolPanic::IsMode(mApp->mGameMode)) return;\n    if (PoolPanicEndless::IsMode(mApp->mGameMode))\n    {\n        if (!mShowShovel) return;\n        const Rect frame = GetShovelButtonRect();\n        g->DrawImage(IMAGE_SHOVELBANK,frame.mX,frame.mY);\n        if (mCursorObject->mCursorType != CURSOR_TYPE_SHOVEL)\n        {\n            // Keep the full original shovel inside its native frame, clear of\n            // both the conveyor backdrop and the menu/speed buttons.\n            const float scale = std::min((frame.mWidth-4)/static_cast<float>(IMAGE_SHOVEL->GetWidth()),\n                (frame.mHeight-4)/static_cast<float>(IMAGE_SHOVEL->GetHeight()));\n            const int width = FloatRoundToInt(IMAGE_SHOVEL->GetWidth()*scale);\n            const int height = FloatRoundToInt(IMAGE_SHOVEL->GetHeight()*scale);\n            const Rect icon(frame.mX+(frame.mWidth-width)/2,frame.mY+(frame.mHeight-height)/2,width,height);\n            g->DrawImage(IMAGE_SHOVEL,icon,Rect(0,0,IMAGE_SHOVEL->GetWidth(),IMAGE_SHOVEL->GetHeight()));\n        }\n        return;\n    }\n",
    "    if (PoolPanicEndless::IsMode(mApp->mGameMode) || PoolPanic::IsMode(mApp->mGameMode)) return;\n"
  ],
  [
    "        !(PoolPanicEndless::IsMode(mApp->mGameMode) && (mPaused || mApp->GetDialogCount() > 0)) &&\n",
    ""
  ]
]){
  assert.equal(restoredEndless1Board.split(addition).length,2,'Exact reviewed Endless.2-only integration');
  restoredEndless1Board=restoredEndless1Board.replace(addition,previous);
}
assert.equal(restoredEndless1Board,normalizeSource(await immediateParentBytes("src/Lawn/Board.cpp")),'Complete restored Endless.1 source matches every authenticated parent byte before older preservation checks');
let restoredEndless1Challenge=normalizeSource(await historyRead('source/src/Lawn/Challenge.cpp'));
for(const [addition,previous] of [
  [
    "    if (PoolPanic::IsMode(aGameMode)) mBoard->mShowShovel = false;\n",
    "    if (PoolPanicEndless::IsMode(aGameMode) || PoolPanic::IsMode(aGameMode)) mBoard->mShowShovel = false;\n"
  ]
]){
  assert.equal(restoredEndless1Challenge.split(addition).length,2,'Exact reviewed Endless.2-only integration');
  restoredEndless1Challenge=restoredEndless1Challenge.replace(addition,previous);
}
assert.equal(restoredEndless1Challenge,normalizeSource(await immediateParentBytes("src/Lawn/Challenge.cpp")),'Complete restored Endless.1 source matches every authenticated parent byte before older preservation checks');

// Restore only the reviewed compact-header additions before older LawnApp guards.
let restoredEndless1App=normalizeSource(await historyRead("source/src/LawnApp.cpp"));
for(const [addition,previous] of [
  [
    "\t// Share the original combat Menu strip without extending onto the lawn.\n\tmGameSpeedButton->Resize(753, -10, 45, 46);\n",
    "\t// The ten-packet bank and shovel fill the horizontal space beside Menu.\n\tmGameSpeedButton->Resize(681, 32, 117, 46);\n"
  ],
  [
    "\t\t(mBoard->mMenuButton->mWidth == 117 || mBoard->mMenuButton->mWidth == 71) &&\n",
    ""
  ],
  [
    "\tif (mBoard)\n\t{\n\t\tauto& aMenuButton = *mBoard->mMenuButton;\n\t\tif (!mGameSpeedButton->mBtnNoDraw && aMenuButton.mWidth == 117)\n\t\t\taMenuButton.Resize(aMenuButton.mX, aMenuButton.mY, 71, aMenuButton.mHeight);\n\t\telse if (mGameSpeedButton->mBtnNoDraw && aMenuButton.mWidth == 71)\n\t\t\taMenuButton.Resize(aMenuButton.mX, aMenuButton.mY, 117, aMenuButton.mHeight);\n\t}\n",
    ""
  ]
]){
 assert.equal(restoredEndless1App.split(addition).length,2,'Exact reviewed compact-header-only source delta');
 restoredEndless1App=restoredEndless1App.replace(addition,previous);
}
assert.equal(restoredEndless1App,normalizeSource(await immediateParentBytes("src/LawnApp.cpp")),'Every pre-existing button/menu and application source byte matches authenticated Endless.1 after only reviewed speed-header changes');
let restoredEndless1GameButton=normalizeSource(await historyRead("source/src/Lawn/Widget/GameButton.cpp"));
for(const [addition,previous] of [
  [
    "static void DrawCompactSpeedStoneButton(Graphics* g, int x, int y, int theWidth, int theHeight, bool isDown, bool isHighLighted, const std::string& theLabel)\n{\n\tGraphics aButtonGraphics(*g);\n\taButtonGraphics.ClipRect(x, y, theWidth, theHeight);\n\tg = &aButtonGraphics;\n\tImage* aLeftImage = isDown ? Sexy::IMAGE_BUTTON_DOWN_LEFT : Sexy::IMAGE_BUTTON_LEFT;\n\tImage* aRightImage = isDown ? Sexy::IMAGE_BUTTON_DOWN_RIGHT : Sexy::IMAGE_BUTTON_RIGHT;\n\tconst int aLeftWidth = 22;\n\tconst int aRightWidth = 23;\n\tconst int aPressOffset = isDown ? 1 : 0;\n\t// Preserve the original outer stone caps at native size. The full 71px\n\t// pair cannot fit the speed control's share of the original Menu strip.\n\tg->DrawImage(aLeftImage, x + aPressOffset, y, Rect(0, 0, aLeftWidth, aLeftImage->mHeight));\n\tg->DrawImage(aRightImage, x + aPressOffset + aLeftWidth, y,\n\t\tRect(aRightImage->mWidth - aRightWidth, 0, aRightWidth, aRightImage->mHeight));\n\tg->SetFont(isHighLighted ? Sexy::FONT_DWARVENTODCRAFT18BRIGHTGREENINSET : Sexy::FONT_DWARVENTODCRAFT18GREENINSET);\n\tconst int aFontX = x + aPressOffset + (theWidth - Sexy::FONT_DWARVENTODCRAFT18GREENINSET->StringWidth(theLabel)) / 2 + 1;\n\tconst int aFontY = y + aPressOffset + (theHeight - Sexy::FONT_DWARVENTODCRAFT18GREENINSET->GetAscent() / 6 - 1 + Sexy::FONT_DWARVENTODCRAFT18GREENINSET->GetAscent()) / 2 - 4;\n\tg->SetColor(Color::White);\n\tg->DrawString(theLabel, aFontX, aFontY);\n}\n\n",
    ""
  ],
  [
    "\t\tif (mApp && mApp->mGameSpeedButton.get() == this)\n\t\t{\n\t\t\tDrawCompactSpeedStoneButton(g, mX, mY, mWidth, mHeight, isDown, isHighLighted, mLabel);\n\t\t\treturn;\n\t\t}\n",
    ""
  ]
]){
 assert.equal(restoredEndless1GameButton.split(addition).length,2,'Exact reviewed compact-header-only source delta');
 restoredEndless1GameButton=restoredEndless1GameButton.replace(addition,previous);
}
assert.equal(restoredEndless1GameButton,normalizeSource(await immediateParentBytes("src/Lawn/Widget/GameButton.cpp")),'Every pre-existing button/menu and application source byte matches authenticated Endless.1 after only reviewed speed-header changes');
assert.equal(extractLegacyFunction(normalizeSource(await historyRead('source/src/Lawn/Widget/GameButton.cpp')),'void DrawStoneButton('),extractLegacyFunction(restoredEndless1GameButton,'void DrawStoneButton('),'Shared native stone-button renderer remains byte exact');

// Undo only reviewed Endless additions. Full prior source files then match
// the exact authenticated Pool.1 parent, preserving every finite-mode byte.
let parentZombieFromEndless=currentWalkingZombie;
const endlessZombieGuard='PoolPanicEndless::IsMode(mApp->mGameMode) || ';
assert.equal(parentZombieFromEndless.split(endlessZombieGuard).length,2);
parentZombieFromEndless=parentZombieFromEndless.replace(endlessZombieGuard,'');
assert.equal(parentZombieFromEndless,publishedPoolZombie,'Every old zombie source byte and native mechanic remains exact');
let parentBoardFromEndless=restoredEndless1Board;
for(const [addition,count] of [
  ['\tcase GameMode::GAMEMODE_CHALLENGE_POOL_PANIC_ENDLESS:\n',1],
  ['PoolPanicEndless::IsMode(aGameMode) ? PoolPanicEndless::kActive : ',1],
  ['PoolPanicEndless::IsMode(mApp->mGameMode) || ',5],
  ['    if (PoolPanicEndless::IsMode(mApp->mGameMode)) return std::max(mChallenge->mSurvivalStage,0);\n',1],
  [' && !PoolPanicEndless::IsMode(mApp->mGameMode)',1],
]) {
  assert.equal(parentBoardFromEndless.split(addition).length,count+1,'Exact Endless-only Board integration: '+addition);
  parentBoardFromEndless=parentBoardFromEndless.replaceAll(addition,'');
}
assert.equal(parentBoardFromEndless,publishedPoolBoard,'Every previous Board, native flag logic, font, UI, actor/planting and physics path remains byte exact outside the new mode');
let parentScreenFromEndless=normalizeSource(await historyRead('source/src/Lawn/Widget/ChallengeScreen.cpp'));
for(const [addition,replacement] of [
  ['#include "../System/PoolPanicEndlessPresentation.h"\n',''],
  [',\n\t{ .mChallengeMode = GameMode::GAMEMODE_CHALLENGE_POOL_PANIC_ENDLESS, .mChallengeIconIndex = 0, .mPage = ChallengePage::CHALLENGE_PAGE_BONUS, .mRow = 3, .mCol = 4, .mChallengeName = "Pool Panic Endless" }',''],
  ['if (Image* image = mode == GAMEMODE_CHALLENGE_POOL_PANIC_ENDLESS ? PoolPanicEndlessPresentation::GetBonusImage() :\n        mode == GAMEMODE_CHALLENGE_POOL_PANIC ?', 'if (Image* image = mode == GAMEMODE_CHALLENGE_POOL_PANIC ?'],
  ['aDef.mChallengeMode == GAMEMODE_CHALLENGE_POOL_PANIC_ENDLESS || ',''],
  ['\t\t\t\t\tif (aDef.mChallengeMode == GAMEMODE_CHALLENGE_POOL_PANIC_ENDLESS &&\n\t\t\t\t\t\tPoolPanicEndlessPresentation::DrawFittedBestRecord(g, aRecord, aAchievement, aPosX, aPosY)) return;\n',''],
]) {
  assert.equal(parentScreenFromEndless.split(addition).length,2,'Exact Endless-only native card and score guard');
  parentScreenFromEndless=parentScreenFromEndless.replace(addition,replacement);
}
assert.equal(parentScreenFromEndless,publishedPoolScreen,'All fourteen previous card bitmaps/dispatches, native controls, stock Survival high-score code and source bytes remain exact');
let parentDialogFromEndless=normalizeSource(await historyRead('source/src/Lawn/Widget/LawnDialog.cpp'));
for(const addition of ['#include "../System/PoolPanicEndless.h"\n','PoolPanicEndless::IsMode(mApp->mGameMode) || ']) {
  assert.equal(parentDialogFromEndless.split(addition).length,2);
  parentDialogFromEndless=parentDialogFromEndless.replace(addition,'');
}
assert.equal(parentDialogFromEndless,normalizeSource(await parentBytes('src/Lawn/Widget/LawnDialog.cpp')),'Every previous native menu path remains exact; only Endless returns to its own Bonus page');
let parentAppFromEndless=restoredEndless1App;
for(const addition of ['#include "Lawn/System/PoolPanicEndlessPresentation.h"\n',
  '    PoolPanicEndlessPresentation::DisposeImage();\n',
  '    if (PoolPanicEndless::IsMode(mGameMode)) return false;\n',
  '    if (PoolPanicEndless::IsMode(theGameMode)) return false;\n']) {
  assert.equal(parentAppFromEndless.split(addition).length,2);
  parentAppFromEndless=parentAppFromEndless.replace(addition,'');
}
assert.equal(parentAppFromEndless,normalizeSource(await parentBytes('src/LawnApp.cpp')),'Every old application/profile/trophy/classifier and cache lifecycle byte remains exact outside the new presentation and non-trophy mode guards');


// Retain the full previous fog/tooltip fix proof against its exact historical parent.
const lights1Board=normalizeSource(lights1Inputs.get('lights1-candidate/source/src/Lawn/Board.cpp'));
const oldTooltipGuard='if (!(IntensiveCare::IsMode(mApp->mGameMode) && theHitResult->mObjectType == OBJECT_TYPE_GLOVE))';
const newTooltipGuard='if (!((IntensiveCare::IsMode(mApp->mGameMode) || LightsOut::IsMode(mApp->mGameMode)) && theHitResult->mObjectType == OBJECT_TYPE_GLOVE))';
const clippedFogBlock='    Graphics aLightsFogGraphics(*g);\n    if (LightsOut::IsMode(mApp->mGameMode))\n    {\n        aLightsFogGraphics.ClipRect(0, 80, BOARD_WIDTH, 500);\n        g=&aLightsFogGraphics;\n    }\n';
for(const original of [oldTooltipGuard,'\tDrawShovel(g);\n','void Board::DrawUITop(Graphics* g)\n{\n',clippedFogBlock])
  assert.equal(lights1Board.split(original).length,2,'Exact single parent presentation regression: '+original);
const expectedBoard=lights1Board.replace(oldTooltipGuard,newTooltipGuard)
  .replace('\tDrawShovel(g);\n','\tif (!LightsOut::IsMode(mApp->mGameMode)) DrawShovel(g);\n')
  .replace('void Board::DrawUITop(Graphics* g)\n{\n','void Board::DrawUITop(Graphics* g)\n{\n\tif (LightsOut::IsMode(mApp->mGameMode)) DrawShovel(g);\n')
  .replace(clippedFogBlock,'');
const beforeBoard=expectedBoard;
assert.equal(sha(Buffer.from(beforeBoard)),'6f2c71e87bff6472d1f9e7ae6963999931f5635375b47055e8510aa23ceb074b','Authenticated Lights.2 changes only native fog clipping, Lights glove layer and tooltip anchor; every reconstructed byte matches its independent published-source pin');
// Remove only exact appended Garlic branches, then compare every remaining Board byte.
// Match counts reject duplicate routing, accidentally broadened guards or a changed old-mode path.
let parentBoardPath=afterBoard;
const removeGarlicBoard=(addition,count=1,replacement='')=>{
  assert.equal(parentBoardPath.split(addition).length,count+1,'Exact Garlic-only Board routing: '+addition);
  parentBoardPath=parentBoardPath.replaceAll(addition,replacement);
};
const garlicMouse=extractLegacyFunction(afterBoard,'bool Board::MouseDownGarlicRun(');
removeGarlicBoard(garlicMouse+'\n\n');
removeGarlicBoard('    if (GarlicRun::IsMode(mApp->mGameMode)) GarlicRun::RestoreButton(*this);\n');
removeGarlicBoard('\tcase GameMode::GAMEMODE_CHALLENGE_GARLIC_RUN:\n');
removeGarlicBoard('GarlicRun::IsMode(aGameMode) ? GarlicRun::kPlanning : ');
removeGarlicBoard('    if (GarlicRun::IsMode(mApp->mGameMode) &&\n        (!mChallenge || !GarlicRun::CanMoveInState(mChallenge->mChallengeState) || theSeedType != SEED_GARLIC)) return PLANTING_NOT_HERE;\n');
removeGarlicBoard('            (GarlicRun::IsMode(mApp->mGameMode) && GarlicRun::CanMove(*(Plant*)theHitResult->mObject)) ||\n');
removeGarlicBoard('    if (MouseDownGarlicRun(x, y, theClickCount))\n    {\n        UpdateCursor();\n        return;\n    }\n');
removeGarlicBoard('\t\t\telse if (GarlicRun::IsPlanning(*this))\n\t\t\t{\n\t\t\t\tGarlicRun::Commit(*this);\n\t\t\t}\n');
removeGarlicBoard('\t\tif (GarlicRun::IsMode(mApp->mGameMode))\n        {\n            aLevelStr = GarlicRun::LevelLabel(mChallenge->mSurvivalStage);\n        }\n\t\telse if (RallyRaid::IsMode(mApp->mGameMode))',1,'\t\tif (RallyRaid::IsMode(mApp->mGameMode))');
removeGarlicBoard(' || GarlicRun::IsMode(aGameMode)');
removeGarlicBoard('!GarlicRun::IsMode(mApp->mGameMode) && ');
removeGarlicBoard(' && !GarlicRun::IsMode(mApp->mGameMode)',2);
removeGarlicBoard('GarlicRun::IsMode(mApp->mGameMode) || ',6);
removeGarlicBoard(' || GarlicRun::IsMode(mApp->mGameMode)',10);
assert.equal(parentBoardPath,beforeBoard,'Every old-mode Board path, fog/tooltip fix and unrelated byte remains exact after the explicit Garlic additions');
assert.equal(extractLegacyFunction(parentBoardPath, 'Board::Board(LawnApp* theApp)'),
  extractLegacyFunction(beforeBoard, 'Board::Board(LawnApp* theApp)'),
  'Actual Board constructor, including defined Survival wave startup counters, stays exact');
for (const field of ['mCurrentWave', 'mTotalSpawnedWaves'])
  assert.match(extractLegacyFunction(afterBoard, 'Board::Board(LawnApp* theApp)'), new RegExp(field+' = 0;'));
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
    const coinEntry=entries.get('images/coinbank.png');
    assert(coinEntry,'Original native coin bank exists');
    const coinBytes=pak.subarray(cursor+coinEntry.offset,cursor+coinEntry.offset+coinEntry.size);
    assert.equal(sha(coinBytes),layoutReport.endlessCoinBank.sha256);
    assert.deepEqual([...coinBytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);
    assert.deepEqual([coinBytes.readUInt32BE(16),coinBytes.readUInt32BE(20)],[128,31],'Endless cash reserve uses the complete original native coin-bank canvas');
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
      if (['care-full-run','chain-reaction','rally-zombie','rally-raid','lights-out','garlic-run','bungee-business','cob-cannon-command','pool-panic','pool-panic-endless','scrap-yard','vase-ambush','torchbearer'].includes(name)) args.push('--asset-root', fileURLToPath(new URL('game-assets/', dist)));
      const run = spawnSync('python', args, {encoding: 'utf8'});
      assert.equal(run.status, 0, (run.error?.message || '') + run.stdout + run.stderr);
      const actual = JSON.parse(fs.readFileSync(path.join(temporary, 'tests/' + name + '-results.json')));
      assert.equal(actual.checks, reports.get(name).checks);
      assert.equal(actual.failures, 0);
      assert.equal(actual.exitCode, 0);
      assert.match(actual.status, /^PASS/);
      assert.deepEqual(actual.sourceSha256, reports.get(name).sourceSha256);
      if(['care-full-run','chain-reaction','rally-zombie','rally-raid','lights-out','garlic-run','bungee-business','cob-cannon-command','pool-panic','pool-panic-endless','scrap-yard','vase-ambush','torchbearer'].includes(name)) {
        assert.equal(actual.productionObjectCount,CURRENT_OBJECT_COUNT);
        assert.deepEqual(actual.productionObjectSha256,fullRunReport.productionObjectSha256);
        assert.equal(actual.productionBuildReceiptSha256,sha(fullRunProductionBuildBytes));
      }
      if(name==='rally-raid') await verifyRallyRaid({report:actual,
        read:async input=>fs.readFileSync(path.join(temporary,input)),sha,engine,fullRunReport,
        productionBuildBytes:fullRunProductionBuildBytes});
      if(name==='lights-out') await verifyLightsOut({report:actual,
        read:async input=>fs.readFileSync(path.join(temporary,input)),sha,engine,fullRunReport,
        productionBuildBytes:fullRunProductionBuildBytes});
      if(name==='garlic-run') await verifyGarlicRun({report:actual,
        read:async input=>fs.readFileSync(path.join(temporary,input)),sha,engine,fullRunReport,
        productionBuildBytes:fullRunProductionBuildBytes});
      if(name==='bungee-business') await verifyBungeeBusiness({report:actual,
        read:async input=>fs.readFileSync(path.join(temporary,input)),sha,engine,fullRunReport,
        productionBuildBytes:fullRunProductionBuildBytes});
      if(name==='cob-cannon-command') await verifyCobCannonCommand({report:actual,
        read:async input=>fs.readFileSync(path.join(temporary,input)),sha,engine,fullRunReport,
        productionBuildBytes:fullRunProductionBuildBytes});
      if(name==='pool-panic') await verifyPoolPanic({report:actual,
        read:async input=>fs.readFileSync(path.join(temporary,input)),sha,engine,fullRunReport,
        productionBuildBytes:fullRunProductionBuildBytes});
      if(name==='pool-panic-endless') await verifyPoolPanicEndless({report:actual,
        read:async input=>fs.readFileSync(path.join(temporary,input)),sha,engine,fullRunReport,
        productionBuildBytes:fullRunProductionBuildBytes,immediateParentBytes});
      if(name==='pool-panic-endless') await verifyPoolPanicEndlessProgression({report:actual,
        read:async input=>fs.readFileSync(path.join(temporary,input)),sha,engine,fullRunReport,
        productionBuildBytes:fullRunProductionBuildBytes,parentRead:publishedEndless2Read,parentProductionBuildBytes});
      if(name==='scrap-yard') await verifyScrapYard({report:actual,
        read:async input=>fs.readFileSync(path.join(temporary,input)),sha,engine,fullRunReport,
        productionBuildBytes:fullRunProductionBuildBytes,
        currentArtBytes:fs.readFileSync(new URL('content/native-bonus-art.json',dist)),
        previousArtBytes:fs.readFileSync(new URL('./fixtures/endless3-native-bonus-art.json',import.meta.url))});
      if(name==='vase-ambush') await verifyVaseAmbush({report:actual,
        read:async input=>fs.readFileSync(path.join(temporary,input)),sha,engine,fullRunReport,
        productionBuildBytes:fullRunProductionBuildBytes,
        currentArtBytes:fs.readFileSync(new URL('content/native-bonus-art.json',dist)),
        previousArtBytes:fs.readFileSync(new URL('./fixtures/scrap1-native-bonus-art.json',import.meta.url))});
      if(name==='torchbearer') await verifyTorchbearer({report:actual,
        read:async input=>fs.readFileSync(path.join(temporary,input)),sha,engine,fullRunReport,
        productionBuildBytes:fullRunProductionBuildBytes,
        currentArtBytes:fs.readFileSync(new URL('content/native-bonus-art.json',dist)),
        previousArtBytes:fs.readFileSync(new URL('./fixtures/ambush1-native-bonus-art.json',import.meta.url))});
    }
    console.log(`PASS all ${checks} assertions across 26 native suites, including complete headless Care, Chain, Rally, Raid, Lights Out, Garlic Run, Bungee Business, Cob Cannon Command, Pool Panic, Pool Panic Endless, Scrap Yard, Vase Ambush and Torchbearer scenarios on CI.`);
  } finally {
    const resolved = fs.realpathSync(temporary);
    assert.equal(path.dirname(resolved), temporaryRoot);
    assert(path.basename(resolved).startsWith('pvz-native-content-'));
    fs.rmSync(resolved, {recursive: true});
  }
}
