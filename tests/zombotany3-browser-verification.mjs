// SPDX-License-Identifier: MIT
// Published .1 functionality is retained as historical evidence, not current timing.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const ENGINE='0.2.6-web-zombotany3.1';
const FOLDER='tests/fixtures/zombotany3-browser/';
const ACCEPTED_PROOF_SHA256='b15056e436760872206dfc1731a3ea877c02e9007e7d6e73fb971383992df2b4';
const HISTORY_SHA256='b56d4ec2a34ca07b10156bb87536ec1cdb55979a3c5a10c29e9ef7255363f7b2';
const HISTORICAL_RUNTIME='tests/fixtures/performance/historical/zombotany3-1-published/';
const RUNTIME=['audio-controls.js','bundled-assets.js','game-assets/manifest.json',
 'game/pvz-portable.js','game/pvz-portable.wasm','index.html','index-port.html','launcher.js',
 'loader.js','original-ui.js','port.css','runtime.js','save-recovery.js','save-storage-core.js',
 'save-storage-worker.js','save-storage.js','save-transfer.js','steam-compat.js','test-profiles.js',
 'vendor/jszip.min.js'].sort();
const json=b=>JSON.parse(Buffer.from(b).toString('utf8').replace(/^\uFEFF/,''));
const safe=name=>{assert(typeof name==='string'&&name&&!name.startsWith('/')&&!/[\\:\x00-\x1f]/.test(name));assert(name.split('/').every(p=>p&&p!=='.'&&p!=='..'));return name;};
const fields=(object,expected)=>{for(const [key,value]of Object.entries(expected))assert.deepEqual(object[key],value,key);};
export async function verifyZombotany3BrowserEvidence({availability,currentEngine,read,sha,Zip,historical=false,historicalNormalBytes,historicalBuildBytes}){
 assert(ACCEPTED_PROOF_SHA256,'Current Zombotany 3 browser observations have not been reviewed');
 const release=json(fs.readFileSync(new URL('./fixtures/zombotany3-1-release.json',import.meta.url)));
 assert.equal(release.id,ENGINE);assert.equal(currentEngine.id,ENGINE);
 if(historical){
  const historyBytes=fs.readFileSync(new URL('./fixtures/zombotany3-1-browser-history.json',import.meta.url));
  assert.equal(sha(historyBytes),HISTORY_SHA256);const history=json(historyBytes);
  fields(history,{schemaVersion:1,engineId:ENGINE,releaseCommit:'1e50a64a05668e983f469ff34fba50ee711f3975',
   sourceArchiveBytes:39772249,sourceArchiveSha256:'71d73740aaab996a7cdba2565ecf7aa60841e70184386ede3ab967f33766cdf9',proofSha256:ACCEPTED_PROOF_SHA256});
  assert.equal(Object.keys(history.files).length,21);
  for(const [name,record]of Object.entries(history.files)){
   safe(name);const bytes=Buffer.from(read(name));assert.equal(bytes.length,record.bytes,name);assert.equal(sha(bytes),record.sha256,name);
  }
  assert.equal(currentEngine.artifacts.sourceSha256,history.sourceArchiveSha256);
 }

 const engine={id:ENGINE,jsSha256:release.jsSha256,wasmSha256:release.wasmSha256};
 assert.deepEqual(availability.engine,engine);
 fields(currentEngine.artifacts,{jsSha256:engine.jsSha256,wasmSha256:engine.wasmSha256});
 fields(availability,{schemaVersion:1,status:'functional-only',audioMutedThroughout:true,
  freshBrowserPerformancePassed:false,nativeTestsReplaceBrowserPerformance:false});
 const pin=record=>{safe(record.path);assert(Number.isSafeInteger(record.bytes)&&record.bytes>0);assert.match(record.sha256,/^[a-f0-9]{64}$/);const b=Buffer.from(read(record.path));assert.equal(b.length,record.bytes,record.path);assert.equal(sha(b),record.sha256,record.path);return b;};
 assert.equal(availability.proof.path,FOLDER+'proof.json');assert.equal(availability.proof.sha256,ACCEPTED_PROOF_SHA256);
 const proof=json(pin(availability.proof));assert.deepEqual(proof.engine,engine);
 fields(proof,{schemaVersion:1,query:'?testing=1',audioMutedThroughout:true,fileFreeStartup:true,
  familyPageObserved:true,normalChooserSelection:true,nightLawnObserved:true,
  regularPlantsPlaced:true,sameBrowserSaveContinue:true,speedLabel:'2x',
  actualNativeCheckpointImported:true,browserEarnedWins:0,
  performanceProbeLoaded:false,freshBrowserPerformanceMeasured:false});
 assert.match(proof.automationMethod,/^isolated headless Chrome,/);
 assert.equal(proof.browserLaunchAudioFlag,'--mute-audio');
 fields(proof.planting,{sunBefore:50,sunAfter:25,seeds:[9,8]});
 assert.equal(proof.observedEngineMetadata.path,FOLDER+'observed-engine-provenance.json');
 const observed=json(pin(proof.observedEngineMetadata));assert.equal(observed.id,ENGINE);
 fields(observed.artifacts,{jsSha256:engine.jsSha256,wasmSha256:engine.wasmSha256});
 assert.deepEqual(Object.keys(proof.screenshots).sort(),['family','chooser','night','continue-night','native-checkpoint'].sort());
 for(const record of Object.values(proof.screenshots)){
  assert(record.path.startsWith(FOLDER));const b=pin(record);
  assert(b[0]===255&&b[1]===216&&b[2]===255&&b.at(-2)===255&&b.at(-1)===217,'Actual native Chrome JPEG capture');assert(b.length>1024);
 }
 assert.deepEqual(Object.keys(proof.runtimeFiles).sort(),RUNTIME);
 for(const [name,record]of Object.entries(proof.runtimeFiles)){
  assert.deepEqual(Object.keys(record).sort(),['bytes','sha256']);
  if(historical&&['game/pvz-portable.js','game/pvz-portable.wasm'].includes(name)){
   assert(Number.isSafeInteger(record.bytes)&&record.bytes>0);assert.match(record.sha256,/^[a-f0-9]{64}$/);continue;
  }
  pin({...record,path:historical?HISTORICAL_RUNTIME+safe(name):'dist/'+safe(name)});
 }
 assert.equal(proof.runtimeFiles['game/pvz-portable.js'].sha256,engine.jsSha256);
 assert.equal(proof.runtimeFiles['game/pvz-portable.wasm'].sha256,engine.wasmSha256);
 let normalBytes,build;
 if(historical){
  normalBytes=Buffer.from(historicalNormalBytes);const buildBytes=Buffer.from(historicalBuildBytes);
  assert.deepEqual(normalBytes,Buffer.from(read('tests/fixtures/zombotany3-1-normal-build-reference.json')));
  assert.deepEqual(buildBytes,Buffer.from(read('tests/fixtures/zombotany3-1-native-build-reference.json')));
  assert.equal(sha(normalBytes),'4c74070ff45da66e21bbf2c227b4f8532c9a940672963a46bbbf951240458653');
  assert.equal(sha(buildBytes),'b859930d7663869d3f8b1873311bc8b1f55e064e864df9cc2571b070c529367f');
  build=json(buildBytes);
 }else{
  const sourceName=currentEngine.artifacts.source;assert(/^\.\.\/source\/[A-Za-z0-9._-]+\.zip$/.test(sourceName));
  const sourceBytes=Buffer.from(read('dist/'+safe(sourceName.slice(3))));assert.equal(sha(sourceBytes),currentEngine.artifacts.sourceSha256);
  const source=await Zip.loadAsync(sourceBytes),prefix='zombotany3-candidate/';
  const receipt=source.file(prefix+'logs/build-result.json');assert(receipt);
  normalBytes=Buffer.from(await receipt.async('uint8array'));
  const sourceBuild=source.file(prefix+'tests/zombotany3-build.json');assert(sourceBuild);build=json(await sourceBuild.async('uint8array'));
 }
 assert.equal(sha(normalBytes),proof.normalBuildReceiptSha256);
 const normal=json(normalBytes);fields(normal,{status:'PASS',exitCode:0,sourceFiles:882,sourceUnchangedDuringBuild:true});
 for(const [kind,name]of [['js','game/pvz-portable.js'],['wasm','game/pvz-portable.wasm']])assert.deepEqual(normal.outputs['build/pvz-portable.'+kind],proof.runtimeFiles[name]);
 const origin=json(pin(proof.nativeProfileOrigin.result)),originLog=pin(proof.nativeProfileOrigin.rawLog);
 fields(proof.nativeProfileOrigin,{engineId:ENGINE,mode:93,profileIndex:92,profileCreditsAtExport:0,syntheticCheckpoint:false});
 fields(origin,{execution:'complete-production-engine',name:'save-freeze',speed:1,seed:1729,
  family:'night-zombotany',outcome:'win',profileCredits:1,optimization:'O2',resourceCapacityWarnings:0});
 assert.equal(origin.productionBuildReceiptSha256,proof.normalBuildReceiptSha256);
 assert.deepEqual(origin.testArtifactSha256,build.testArtifactSha256);assert.deepEqual(origin.testInputSha256,build.testInputSha256);
 assert.equal(sha(originLog),origin.logSha256);
 const lines=originLog.toString('utf8').replace(/\r\n?/g,'\n').split('\n').filter(line=>line.startsWith('ZOMBOTANY3_RESULT '));assert.equal(lines.length,1);
 const {logSha256,resourceCapacityWarnings,optimization,productionBuildReceiptSha256,testArtifactSha256,testInputSha256,...raw}=origin;
 assert.deepEqual(JSON.parse(lines[0].slice('ZOMBOTANY3_RESULT '.length)),raw);
 const cp=origin.checkpoint;fields(cp,{performed:true,kind:'save-freeze',graphPreserved:true,profileCreditAtExport:0});assert(cp.freezeLease>0&&cp.freezeLease<=150);
 const zip=await Zip.loadAsync(pin(proof.inputs.nativeCheckpoint),{checkCRC32:true});
 assert.deepEqual(Object.values(zip.files).filter(f=>!f.dir).map(f=>f.name).sort(),['userdata/game1_93.v4','userdata/user1.dat','userdata/users.dat']);
 assert.deepEqual(Object.keys(proof.nativeProfileOrigin.exportedFiles).sort(),['userdata/game1_93.v4','userdata/user1.dat','userdata/users.dat']);
 for(const [name,record]of Object.entries(proof.nativeProfileOrigin.exportedFiles)){
  assert.deepEqual(Object.keys(record).sort(),['bytes','sha256']);assert.match(record.sha256,/^[a-f0-9]{64}$/);
  const bytes=Buffer.from(await zip.file(name).async('uint8array'));assert.equal(bytes.length,record.bytes);assert.equal(sha(bytes),record.sha256,'Actual pre-award export bytes: '+name);
 }
 for(const [name,count]of [['userdata/game1_93.v4',cp.exportedBoardBytes],['userdata/user1.dat',cp.exportedProfileBytes],['userdata/users.dat',cp.exportedUsersBytes]])assert.equal((await zip.file(name).async('uint8array')).length,count);
 const profile=await Zip.loadAsync(pin(proof.inputs.nativeProfile),{checkCRC32:true});
 assert.deepEqual(Object.values(profile.files).filter(f=>!f.dir).map(f=>f.name).sort(),['userdata/user1.dat','userdata/users.dat']);
 for(const name of ['userdata/user1.dat','userdata/users.dat'])assert.deepEqual(Buffer.from(await profile.file(name).async('uint8array')),Buffer.from(await zip.file(name).async('uint8array')),'Browser setup uses the actual zero-credit checkpoint profile');
 assert(Array.isArray(proof.operatorObservations)&&proof.operatorObservations.length>=4);
 for(const observation of proof.operatorObservations)assert(typeof observation==='string'&&observation.length>=20);
 fields(proof.canvas,{width:800,height:600});
 for(const key of ['width','height','deviceScaleFactor'])assert(Number.isFinite(proof.viewport[key])&&proof.viewport[key]>0);
 assert(proof.canvas.cssWidth>0&&proof.canvas.cssHeight>0&&proof.canvas.cssWidth<=proof.viewport.width&&proof.canvas.cssHeight<=proof.viewport.height);
 assert(Math.abs(proof.canvas.cssWidth*600-proof.canvas.cssHeight*800)<=800);
 const actions=pin(proof.actionTranscript).toString('utf8').trim().split('\n').map(line=>JSON.parse(line));
 const allowed=['navigate','inspect','screenshot','click','move','key','text','chooseFile','reload','wait','close'];assert(actions.length>30);let inspections=0;
 for(const row of actions){
  assert(allowed.includes(row.action));assert.equal(row.command.action,row.action);
  if(row.action==='navigate')assert.equal(row.command.url,'http://127.0.0.1:4248/?testing=1');
  if(row.action==='inspect'&&row.status==='ok'){
   inspections++;assert.equal(row.result.url,'http://127.0.0.1:4248/?testing=1');
   assert(row.result.mute.length>0&&row.result.mute.every(m=>m.pressed==='true'));
  }
 }
 assert(inspections>=4);assert.equal(actions.at(-1).action,'close');assert.equal(actions.at(-1).status,'ok');
 return {status:historical?'PASS historical Zombotany 3.1 browser functionality':'PASS current muted Zombotany 3 browser functionality',engine:ENGINE,screenshots:5,runtimeFiles:RUNTIME.length,
  executablePayloadsChecked:historical?0:2,executableIdentitiesCrossChecked:2,
  actualNativeCheckpointImported:true,browserEarnedWins:0,freshBrowserPerformancePassed:false};
}
