// SPDX-License-Identifier: MIT
// Actual current-browser functionality is separate from historical timings.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const ENGINE='0.2.6-web-gust.1';
const FOLDER='tests/fixtures/gust-bloom-browser/';
const ACCEPTED_PROOF_SHA256='95cec1f3c8c04dafc6c0f7013957a6035ecd6e2d1f9a47b680f20efa26b3fdbe';
const RUNTIME=['audio-controls.js','bundled-assets.js','game-assets/manifest.json',
 'game/pvz-portable.js','game/pvz-portable.wasm','index.html','index-port.html','launcher.js',
 'loader.js','original-ui.js','port.css','runtime.js','save-recovery.js','save-storage-core.js',
 'save-storage-worker.js','save-storage.js','save-transfer.js','steam-compat.js','test-profiles.js',
 'vendor/jszip.min.js'].sort();
const json=bytes=>JSON.parse(Buffer.from(bytes).toString('utf8').replace(/^\uFEFF/,''));
const safe=name=>{assert(typeof name==='string'&&name&&!name.startsWith('/')&&!/[\\:\x00-\x1f]/.test(name));assert(name.split('/').every(p=>p&&p!=='.'&&p!=='..'));return name;};
const fields=(object,expected)=>{for(const [key,value]of Object.entries(expected))assert.deepEqual(object[key],value,key);};
export async function verifyGustBrowserEvidence({availability,currentEngine,read,sha,Zip}){
 assert(ACCEPTED_PROOF_SHA256,'Current Gust-bloom browser observations have not been reviewed');
 const release=json(fs.readFileSync(new URL('./fixtures/gust1-release.json',import.meta.url)));
 assert.equal(release.id,ENGINE);assert.equal(currentEngine.id,ENGINE);
 const engine={id:ENGINE,jsSha256:release.jsSha256,wasmSha256:release.wasmSha256};
 assert.deepEqual(availability.engine,engine);
 assert.equal(currentEngine.artifacts.jsSha256,engine.jsSha256);assert.equal(currentEngine.artifacts.wasmSha256,engine.wasmSha256);
 fields(availability,{schemaVersion:1,status:'functional-only',audioMutedThroughout:true,
  freshBrowserPerformancePassed:false,nativeTestsReplaceBrowserPerformance:false});
 const pin=record=>{safe(record.path);assert(Number.isSafeInteger(record.bytes)&&record.bytes>0);assert.match(record.sha256,/^[a-f0-9]{64}$/);const bytes=Buffer.from(read(record.path));assert.equal(bytes.length,record.bytes,record.path);assert.equal(sha(bytes),record.sha256,record.path);return bytes;};
 assert.equal(availability.proof.path,FOLDER+'proof.json');assert.equal(availability.proof.sha256,ACCEPTED_PROOF_SHA256);
 const proof=json(pin(availability.proof));assert.deepEqual(proof.engine,engine);
 fields(proof,{schemaVersion:1,query:'?testing=1',audioMutedThroughout:true,fileFreeStartup:true,
  earnedHeadwindProfileImported:true,normalChooserSelection:true,regularPlantPlaced:true,
  sameBrowserSaveContinue:true,speedLabel:'2x',almanacEntryObserved:true,catalogCardObserved:true,
  browserEarnedWins:0,performanceProbeLoaded:false,freshBrowserPerformanceMeasured:false});
 assert.match(proof.automationMethod,/^isolated headless Chrome,/);
 assert.equal(proof.browserLaunchAudioFlag,'--mute-audio');
 assert(Number.isInteger(proof.planting.sunBefore)&&proof.planting.sunBefore>=150);
 assert.equal(proof.planting.sunBefore-proof.planting.sunAfter,150);
 assert.equal(proof.planting.seed,78);
 fields(proof.nativeProfileOrigin,{engineId:ENGINE,mode:92,profileIndex:91,earnedHeadwindCredits:1});
 assert.equal(proof.nativeProfileOrigin.normalBuildReceiptSha256,proof.normalBuildReceiptSha256);
 assert.equal(proof.observedEngineMetadata.path,FOLDER+'observed-engine-provenance.json');
 const observed=json(pin(proof.observedEngineMetadata));assert.equal(observed.id,ENGINE);
 assert.equal(observed.artifacts.jsSha256,engine.jsSha256);assert.equal(observed.artifacts.wasmSha256,engine.wasmSha256);
 assert.deepEqual(Object.keys(proof.screenshots).sort(),['catalog','almanac','chooser','regular','continue-regular'].sort());
 for(const record of Object.values(proof.screenshots)){
  assert(record.path.startsWith(FOLDER));const bytes=pin(record);
  const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpeg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255&&bytes.at(-2)===255&&bytes.at(-1)===217;
  assert(png||jpeg,'Actual screenshot framing');assert(bytes.length>1024);
 }
 assert.deepEqual(Object.keys(proof.runtimeFiles).sort(),RUNTIME);
 for(const [name,record]of Object.entries(proof.runtimeFiles)){
  assert.deepEqual(Object.keys(record).sort(),['bytes','sha256']);pin({...record,path:'dist/'+safe(name)});
 }
 assert.equal(proof.runtimeFiles['game/pvz-portable.js'].sha256,engine.jsSha256);
 assert.equal(proof.runtimeFiles['game/pvz-portable.wasm'].sha256,engine.wasmSha256);
 assert.equal(proof.inputs.earnedProfile.path.startsWith(FOLDER),true);
 const zip=await Zip.loadAsync(pin(proof.inputs.earnedProfile),{checkCRC32:true});
 const entries=Object.values(zip.files).filter(file=>!file.dir);assert(entries.length>=2&&entries.length<=12);
 for(const entry of entries)assert(/^userdata\/[A-Za-z0-9._-]+\.(?:dat|v4|json)$/.test(safe(entry.name)));
 assert(zip.file('userdata/users.dat')&&zip.file('userdata/user1.dat'));
 assert(Array.isArray(proof.operatorObservations)&&proof.operatorObservations.length>=4);
 for(const observation of proof.operatorObservations)assert(typeof observation==='string'&&observation.length>=20);
 fields(proof.canvas,{width:800,height:600});
 for(const key of ['width','height','deviceScaleFactor'])assert(Number.isFinite(proof.viewport[key])&&proof.viewport[key]>0);
 assert(proof.canvas.cssWidth>0&&proof.canvas.cssHeight>0&&proof.canvas.cssWidth<=proof.viewport.width&&proof.canvas.cssHeight<=proof.viewport.height);
 assert(Math.abs(proof.canvas.cssWidth*600-proof.canvas.cssHeight*800)<=800);
 const sourceName=currentEngine.artifacts.source;assert(/^\.\.\/source\/[A-Za-z0-9._-]+\.zip$/.test(sourceName));
 const sourceBytes=Buffer.from(read('dist/'+safe(sourceName.slice(3))));assert.equal(sha(sourceBytes),currentEngine.artifacts.sourceSha256);
 const source=await Zip.loadAsync(sourceBytes);const receipt=source.file('gust1-candidate/logs/build-result.json');assert(receipt);
 const normalBytes=Buffer.from(await receipt.async('uint8array'));assert.equal(sha(normalBytes),proof.normalBuildReceiptSha256);
 const normal=json(normalBytes);fields(normal,{status:'PASS',exitCode:0,sourceFiles:878,sourceUnchangedDuringBuild:true});
 for(const [kind,name]of [['js','game/pvz-portable.js'],['wasm','game/pvz-portable.wasm']])
  assert.deepEqual(normal.outputs['build/pvz-portable.'+kind],proof.runtimeFiles[name]);
 const sourceBuild=source.file('gust1-candidate/tests/gust-bloom-build.json');assert(sourceBuild);
 const nativeBuild=json(await sourceBuild.async('uint8array'));
 const origin=json(pin(proof.nativeProfileOrigin.result));
 const originLog=pin(proof.nativeProfileOrigin.rawLog);
 fields(proof.nativeProfileOrigin,{newPlantUnlockAssigned:false,standardCampaignUnlocks:'native test setup'});
 fields(origin,{execution:'complete-production-engine',name:'normal',speed:1,seed:1729,
  family:'headwind',outcome:'win',profileCredits:1,optimization:'O2',resourceCapacityWarnings:0});
 assert.equal(origin.productionBuildReceiptSha256,proof.normalBuildReceiptSha256);
 assert.deepEqual(origin.testArtifactSha256,nativeBuild.testArtifactSha256);
 assert.deepEqual(origin.testInputSha256,nativeBuild.testInputSha256);
 assert.equal(sha(originLog),origin.logSha256);
 const lines=originLog.toString('utf8').replace(/\r\n?/g,'\n').split('\n').filter(line=>line.startsWith('GUST_BLOOM_RESULT '));
 assert.equal(lines.length,1);
 const {logSha256,resourceCapacityWarnings,optimization,productionBuildReceiptSha256,testArtifactSha256,testInputSha256,...rawObservation}=origin;
 assert.deepEqual(JSON.parse(lines[0].slice('GUST_BLOOM_RESULT '.length)),rawObservation);
 fields(origin.earnedRegularCollection,{performed:true,earnedHeadwindCredit:1,profileCreditAssigned:false});
 assert.equal(origin.nativeRegularChooserUnlockEarned,true);
 assert.equal((await zip.file('userdata/users.dat').async('uint8array')).length,origin.earnedRegularCollection.nativeUsersSaveBytes);
 assert.equal((await zip.file('userdata/user1.dat').async('uint8array')).length,origin.earnedRegularCollection.nativeProfileSaveBytes);
 const actions=pin(proof.actionTranscript).toString('utf8').trim().split('\n').map(line=>JSON.parse(line));
 const allowed=['navigate','inspect','screenshot','click','move','key','text','chooseFile','reload','wait','close'];
 assert(actions.length>50);let inspections=0;
 for(const row of actions){
  assert(allowed.includes(row.action));assert.equal(row.command.action,row.action);
  if(row.action==='navigate')assert.equal(row.command.url,'http://127.0.0.1:4246/?testing=1');
  if(row.action==='inspect'&&row.status==='ok'){
   inspections++;assert.equal(row.result.url,'http://127.0.0.1:4246/?testing=1');
   assert(row.result.mute.length>0&&row.result.mute.every(mute=>mute.pressed==='true'));
  }
 }
 assert(inspections>=4);assert.equal(actions.at(-1).action,'close');assert.equal(actions.at(-1).status,'ok');
 return {status:'PASS current muted Gust-bloom browser functionality',screenshots:Object.keys(proof.screenshots).length,
  runtimeFiles:RUNTIME.length,earnedNativeProfileImported:true,browserEarnedWins:0,freshBrowserPerformancePassed:false};
}
