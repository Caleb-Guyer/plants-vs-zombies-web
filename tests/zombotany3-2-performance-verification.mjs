// SPDX-License-Identifier: MIT
// Fresh .2 CPU/rAF evidence is separate from all historical performance records.
import assert from 'node:assert/strict';
import {analyzeCapture,statistics} from './performance/metrics.mjs';

const ENGINE='0.2.6-web-zombotany3.2';
const FOLDER='tests/fixtures/performance/zombotany3-2-current/';
const PREREGISTRATION_SHA256='5fba086f1853aa8a1dd5032bd4f5aed0b7ebf74f9d10cfe73860d6a7f2a53378';
const REVIEWED_PROOF_SHA256='8fbd59115a2ad8f9572a2c4e1a2683195c6ac34d3811173a24c088a31ee39dfb'; // All six actual windows and twelve frames reviewed.
const NORMAL_SHA256='805528006b1ce40dbca55cf1bb2b836855e93ba50f72b77c41fddd9ef57a54b4';
const BUDGETS={nativeCallbacks:{p95:8,max:33.5},rafGaps:{p95:25,max:50},saveCaptures:{p95:8,max:16.7},longTasks:{count:0,max:50}};
const RUNTIME=['audio-controls.js','bundled-assets.js','game-assets/manifest.json',
 'game/pvz-portable.js','game/pvz-portable.wasm','index.html','index-port.html','launcher.js',
 'loader.js','original-ui.js','port.css','runtime.js','save-recovery.js','save-storage-core.js',
 'save-storage-worker.js','save-storage.js','save-transfer.js','steam-compat.js','test-profiles.js','vendor/jszip.min.js'].sort();
const json=b=>JSON.parse(Buffer.from(b).toString('utf8').replace(/^\uFEFF/,''));
const safe=name=>{assert(typeof name==='string'&&name&&!name.startsWith('/')&&!/[\\:\x00-\x1f]/.test(name));assert(name.split('/').every(p=>p&&p!=='.'&&p!=='..'));return name;};
const fields=(object,expected)=>{for(const [key,value]of Object.entries(expected))assert.deepEqual(object[key],value,key);};
const digest=value=>assert.match(value,/^[a-f0-9]{64}$/);
const nonnegative=value=>assert(Number.isFinite(value)&&value>=0);
const integer=(value,min=0)=>assert(Number.isSafeInteger(value)&&value>=min);

function checkClockOnly(record,{manifest,label,scenario,observedContext}){
 fields(record,{schemaVersion:2,mode:'raf-only',label,nativeHookAvailable:true,longTaskObserverAvailable:true});
 assert.match(record.status,/^PASS /);assert.deepEqual(record.validationErrors,[]);
 assert.deepEqual(record.declaredScenario,scenario);assert.equal(record.loadedProbeSha256,manifest.probeSha256);
 for(const key of ['pageManifest','captureStartManifest','captureEndManifest','serverManifestAtReceipt'])assert.deepEqual(record[key],manifest,key);
 assert.deepEqual(record.startState,observedContext);assert.deepEqual(record.endState,observedContext);
 fields(record.startState,{visibility:'visible',audioMuted:true});
 for(const key of ['visibilityChanges','audioChanges','resizeChanges','longTasks'])assert.deepEqual(record[key],[]);
 assert.deepEqual(record.samples.nativeCallbacks,[]);assert.deepEqual(record.samples.saveCaptures,[]);
 for(const key of ['startedAt','finishedAt','elapsedMs','requestedMs'])nonnegative(record[key]);
 assert.equal(record.requestedMs,15000);assert(record.elapsedMs>=15000);
 assert(Math.abs(record.finishedAt-record.startedAt-record.elapsedMs)<=1e-6);
 const timestamps=record.samples.rafTimestamps;assert(Array.isArray(timestamps)&&timestamps.length>=2);nonnegative(timestamps[0]);
 const gaps=timestamps.slice(1).map((value,index)=>{nonnegative(value);assert(value>timestamps[index]);return value-timestamps[index];});
 const stats=statistics(gaps),margin=BUDGETS.rafGaps.max;
 assert(timestamps[0]>=record.startedAt-margin&&timestamps[0]<=record.startedAt+margin);
 assert(timestamps.at(-1)>=record.finishedAt-margin&&timestamps.at(-1)<=record.finishedAt+margin);
 assert(stats.p95<=BUDGETS.rafGaps.p95&&stats.max<=BUDGETS.rafGaps.max,'raf-only scheduling budget exceeded');
 for(const [key,values]of [['frameGapMs',gaps],['nativeCallbackMs',[]],['saveCaptureMs',[]]]){
  const s=statistics(values);assert.deepEqual(record[key],{samples:s.count,p50:s.p50??0,p95:s.p95??0,p99:s.p99??0,max:s.max??0,
   over33:values.filter(v=>v>33.5).length,over50:values.filter(v=>v>50).length,over100:values.filter(v=>v>100).length});
 }
 return stats;
}

export async function verifyZombotany3PerformanceEvidence({availability,currentEngine,read,sha}){
 assert(REVIEWED_PROOF_SHA256,'Current Zombotany 3.2 performance observations have not been reviewed');
 assert.equal(currentEngine.id,ENGINE);
 const pinned=async record=>{
  safe(record.path);assert(record.path.startsWith(FOLDER)||['tests/performance/probe.js','tests/performance/preview.py','tests/performance/metrics.mjs'].includes(record.path));
  integer(record.bytes,1);digest(record.sha256);const bytes=Buffer.from(await read(record.path));
  assert.equal(bytes.length,record.bytes,record.path);assert.equal(sha(bytes),record.sha256,record.path);return bytes;
 };
 assert(availability&&typeof availability==='object');
 fields(availability,{schemaVersion:1,status:'measured-current',freshBrowserPerformanceMeasured:true,freshBrowserPerformancePassed:true,browserEarnedWins:0});
 assert.equal(availability.preregistration.path,FOLDER+'preregistration.json');
 assert.equal(availability.preregistration.sha256,PREREGISTRATION_SHA256);
 const prereg=json(await pinned(availability.preregistration));
 fields(prereg,{schemaVersion:1,id:'zombotany3-2-current-performance',stage:'preregistered-before-current-browser-timing',sourceCount:882,productionObjectCount:149,
  minObservationMs:15000,minSaveCaptures:2,maxControlP95DeltaMs:1,budgets:BUDGETS});
 const engine={id:ENGINE,jsSha256:'0ffe49ac17d6c0c73c120c30781b14c49816f12d0743cd740ab13070f73df250',wasmSha256:'8921eb268458f039a48d59cb071fb4c206dc059ca556aba0ab49340e2191f2d5'};
 assert.deepEqual(prereg.engine,engine);assert.deepEqual(availability.engine,engine);
 fields(currentEngine.artifacts,{jsSha256:engine.jsSha256,wasmSha256:engine.wasmSha256});
 assert.deepEqual(prereg.runtimeFiles,RUNTIME);
 assert.equal(availability.proof.path,FOLDER+'proof.json');assert.equal(availability.proof.sha256,REVIEWED_PROOF_SHA256);
 const proof=json(await pinned(availability.proof));assert.deepEqual(proof.engine,engine);
 fields(proof,{schemaVersion:1,query:'?testing=1',normalBuildReceiptSha256:NORMAL_SHA256,
  freshBrowserPerformanceMeasured:true,freshBrowserPerformancePassed:true,audioMutedThroughout:true,
  browserEarnedWins:0,syntheticStartingFixtures:true,startingCountsAreNotEndlessFlags:true,populationsMayEvolve:true,
  gpuTimingMeasured:false,presentedFrameFPSMeasured:false,noPostImportTimerHPPositionOrRNGWrites:true});
 assert.equal(proof.preregistrationSha256,PREREGISTRATION_SHA256);
 assert.equal(proof.browserLaunchAudioFlag,'--mute-audio');
 assert.match(proof.automationMethod,/^isolated headless Chrome,/);
 const normalBytes=await pinned(prereg.normalBuildReceipt);assert.equal(sha(normalBytes),NORMAL_SHA256);
 const normal=json(normalBytes);fields(normal,{status:'PASS',exitCode:0,sourceFiles:882,sourceUnchangedDuringBuild:true});
 for(const kind of ['js','wasm'])assert.equal(normal.outputs['build/pvz-portable.'+kind].sha256,engine[kind+'Sha256']);
 const generation=prereg.fixtureGeneration;
 const nativeBuild=json(await pinned(generation.buildReceipt));
 fields(nativeBuild,{status:'PASS',execution:'complete-production-engine-synthetic-fixture',engineId:ENGINE,
  productionBuildReceiptSha256:NORMAL_SHA256,sourceCount:882,productionObjectCount:149,optimization:'O2'});
 assert.equal(Object.keys(nativeBuild.sourceSha256).length,882);assert.equal(Object.keys(nativeBuild.productionObjectSha256).length,149);
 for(const [name,pin]of Object.entries(nativeBuild.sourceSha256)){safe(name);digest(pin);assert(name.startsWith('source/'));}
 for(const [name,pin]of Object.entries(nativeBuild.productionObjectSha256)){safe(name);digest(pin);assert(name.endsWith('.o'));}
 assert.equal(sha(await pinned(generation.recipe)),nativeBuild.recipeSha256);
 assert.equal(sha(await pinned(generation.driver)),nativeBuild.driverSha256);
 assert.deepEqual(json(await pinned(generation.inputSnapshot)),nativeBuild.testSnapshotSha256);
 assert.deepEqual(Object.keys(generation.snapshots).sort(),Object.keys(nativeBuild.testSnapshotSha256).sort());
 for(const [name,pin]of Object.entries(generation.snapshots))assert.equal(sha(await pinned(pin)),nativeBuild.testSnapshotSha256[name]);
 const closure=json(await pinned(generation.executionClosure));
 fields(closure,{status:'PASS',productionBuildReceiptSha256:NORMAL_SHA256,sourceCount:882,objectCount:149,
  buildReceiptSha256:generation.buildReceipt.sha256,summarySha256:generation.summary.sha256,
  recipeSha256:nativeBuild.recipeSha256,driverSha256:nativeBuild.driverSha256});
 const generated=json(await pinned(generation.summary));
 fields(generated,{status:'PASS',kind:'zero-credit-synthetic-native-starting-saves',engineId:ENGINE,
  sourceCount:882,productionObjectCount:149,productionBuildReceiptSha256:NORMAL_SHA256});
 assert.equal(generated.fixtures.length,2);
 assert.deepEqual(Object.keys(prereg.nativeFixtures).sort(),['20','40']);
 for(const count of [20,40]){
  const setup=prereg.nativeFixtures[count];
  fields(setup,{kind:'zero-credit-synthetic-native-starting-save',startingActors:count,puffHeads:count/2,fumeHeads:count*4/10,iceHeads:count/10});
  const manifest=json(await pinned(setup.manifest));
  assert.deepEqual(manifest,generated.fixtures.find(row=>row.observation.startingCrowd===count));
  fields(manifest,{schemaVersion:1,kind:'zero-credit-synthetic-native-starting-save',engineId:ENGINE,productionBuildReceiptSha256:NORMAL_SHA256,
   sourceCount:882,productionObjectCount:149,buildReceiptSha256:generation.buildReceipt.sha256});
  fields(manifest.observation,{kind:'synthetic-starting-crowd',engineId:ENGINE,mode:93,profileIndex:92,startingCrowd:count,
   puffHeads:count/2,fumeHeads:count*4/10,iceHeads:count/10,nativeOpeningCountDown:1799,nativeOpeningCountDownStart:1800,
   nativeMainCounter:1,nativeWave:0,nativeSun:50,nativeBankSize:6,profileCredits:0,countedEarnedWins:0,savedGraphPreserved:true,
   syntheticInitialActorsAndPlants:true,initialActorPositionAssignmentOnly:true,postSaveTimerHPOrPositionWrites:false,audioDeviceOpened:false});
  assert.equal(manifest.observation.actors.length,count);
  const actualTypes={35:0,36:0,37:0};
  for(const actor of manifest.observation.actors){assert(Object.hasOwn(actualTypes,actor.type));actualTypes[actor.type]++;
   fields(actor,{health:270,maxHealth:270,attackVisualClock:0});integer(actor.row);assert(actor.row<5);assert(actor.x>=0&&actor.x<=760);assert(actor.gait>0);
   assert.equal(actor.abilityCountdown,actor.type===35?115:actor.type===36?150:75);
  }
  assert.deepEqual(actualTypes,{35:count/2,36:count*4/10,37:count/10});
  assert.deepEqual(Object.keys(setup.files).sort(),['userdata/game1_93.v4','userdata/user1.dat','userdata/users.dat']);
  for(const [name,pin]of Object.entries(setup.files)){
   const bytes=await pinned(pin);assert.equal(bytes.length,manifest.files[name].bytes);assert.equal(sha(bytes),manifest.files[name].sha256);
  }
  const raw=await pinned(setup.nativeLog);assert.equal(sha(raw),manifest.nativeLogSha256);
  const lines=raw.toString('utf8').split('\n').filter(line=>line.startsWith('Z3_PERFORMANCE_FIXTURE '));assert.equal(lines.length,1);
  assert.deepEqual(JSON.parse(lines[0].slice('Z3_PERFORMANCE_FIXTURE '.length)),manifest.observation);
 }
 for(const item of ['probe','recorder','metrics'])assert.deepEqual(proof[item],prereg[item]);
 const probeBytes=await pinned(prereg.probe),recorderBytes=await pinned(prereg.recorder);await pinned(prereg.metrics);
 assert.equal(proof.expectedManifest.path,FOLDER+'expected-manifest.json');
 const manifest=json(await pinned(proof.expectedManifest));
 fields(manifest,{schemaVersion:2,engineId:ENGINE,engineWasmSha256:engine.wasmSha256,engineWasmMatchesMetadata:true,serverFileMatchesRunningCode:true,
  probeSha256:sha(probeBytes),serverSha256:sha(recorderBytes)});
 assert.deepEqual(Object.keys(manifest.files).sort(),prereg.previewManifestFiles);
 assert.equal(Object.keys(manifest.files).length,19);
 assert.deepEqual(Object.keys(proof.runtimeFiles).sort(),RUNTIME);
 for(const [name,pin]of Object.entries(proof.runtimeFiles)){
  assert.deepEqual(Object.keys(pin).sort(),['bytes','sha256']);integer(pin.bytes,1);digest(pin.sha256);
  const bytes=Buffer.from(await read('dist/'+safe(name)));assert.equal(bytes.length,pin.bytes);assert.equal(sha(bytes),pin.sha256,name);
 }
 for(const [name,pin]of Object.entries(manifest.files)){
  safe(name);const bytes=Buffer.from(await read('dist/'+name));assert.equal(bytes.length,pin.baseBytes);assert.equal(sha(bytes),pin.baseSha256,name);
  if(name!=='save-storage.js'){assert.equal(pin.servedBytes,pin.baseBytes);assert.equal(pin.servedSha256,pin.baseSha256);}
 }
 for(const kind of ['js','wasm'])assert.equal(proof.runtimeFiles['game/pvz-portable.'+kind].sha256,engine[kind+'Sha256']);
 assert.deepEqual(json(await read('dist/game/engine-provenance.json')),currentEngine);
 const context=proof.observedContext;fields(context,{visibility:'visible',audioMuted:true});
 fields(context.canvas,{width:800,height:600});
 for(const key of ['width','height','dpr'])assert(Number.isFinite(context.viewport[key])&&context.viewport[key]>0);
 for(const key of ['cssWidth','cssHeight'])assert(Number.isFinite(context.canvas[key])&&context.canvas[key]>0);
 assert(context.canvas.cssWidth<=context.viewport.width&&context.canvas.cssHeight<=context.viewport.height);
 assert(Math.abs(context.canvas.cssWidth*600-context.canvas.cssHeight*800)<=800);
 const labels=new Set();
 async function reviewWindow(row,registration){
  assert.equal(row.key,registration.key);assert.deepEqual(row.scenario,registration.scenario);
  assert.equal(row.startingFixture,String(row.scenario.crowd));assert.equal(row.fixtureManifestSha256,prereg.nativeFixtures[row.startingFixture].manifest.sha256);
  fields(row,{actualNativeFixtureImported:true,noInputDuringCapture:true,nativeUiBeforeAndAfterReviewed:true});
  if(row.scenario.phase==='active')assert.equal(row.activeThroughout,true);else assert.equal(row.pausedThroughout,true);
  assert(typeof row.label==='string'&&row.label.startsWith('v2-')&&!labels.has(row.label));labels.add(row.label);
  assert.deepEqual(Object.keys(row.screenshots).sort(),['end','start']);
  for(const pin of Object.values(row.screenshots)){
   const bytes=await pinned(pin);assert(bytes.length>1024&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255&&bytes.at(-2)===255&&bytes.at(-1)===217,'Actual Chrome JPEG screenshots are required');
  }
  const record=json(await pinned(row.report));assert.equal(record.requestedMs,15000);assert.deepEqual(record.startState,context);assert.deepEqual(record.endState,context);
  if(row.mode==='raf-only')return {record,stats:checkClockOnly(record,{manifest,label:row.label,scenario:row.scenario,observedContext:context})};
  const analysis=analyzeCapture(record,{expectedManifest:manifest,expectedLabel:row.label,expectedScenario:row.scenario,
   minObservationMs:15000,minSaveCaptures:2,budgets:BUDGETS});
  return {record,analysis};
 }
 assert.equal(proof.cases.length,4);
 assert.deepEqual(prereg.cases.map(row=>row.key),['20-active-1x','20-active-2x','40-active-1x','40-active-2x']);
 for(const registration of prereg.cases){const matches=proof.cases.filter(row=>row.key===registration.key);assert.equal(matches.length,1);assert.equal(matches[0].mode,'native-raf');await reviewWindow(matches[0],registration);}
 assert.equal(proof.controls.length,2);
 assert.deepEqual(prereg.controls.map(row=>row.mode).sort(),['native-raf','raf-only']);
 const controls={};
 for(const registration of prereg.controls){const matches=proof.controls.filter(row=>row.key===registration.key);assert.equal(matches.length,1);assert.equal(matches[0].mode,registration.mode);controls[registration.mode]=await reviewWindow(matches[0],registration);}
 assert(Math.abs(controls['native-raf'].analysis.stats.rafGaps.p95-controls['raf-only'].stats.p95)<=1,'Paired native-observation scheduling overhead exceeds1ms p95');
 assert(Array.isArray(proof.operatorObservations)&&proof.operatorObservations.length>=6);
 proof.operatorObservations.forEach(value=>assert(typeof value==='string'&&value.length>=20));
 const actions=(await pinned(proof.actionTranscript)).toString('utf8').trim().split('\n').map(line=>JSON.parse(line));
 const allowed=['navigate','inspect','screenshot','click','move','key','text','chooseFile','reload','wait','close'];
 assert(actions.length>30);let inspected=0;
 for(const row of actions){assert(allowed.includes(row.action));assert.equal(row.command.action,row.action);
  if(row.action==='inspect'&&row.status==='ok'){inspected++;assert(Array.isArray(row.result.mute)&&row.result.mute.length>0&&row.result.mute.every(m=>m.pressed==='true'));}
 }
 assert(inspected>=6);assert.equal(actions.at(-1).action,'close');assert.equal(actions.at(-1).status,'ok');
 return {status:'PASS current Zombotany 3.2 performance evidence',engine:ENGINE,measured:true,passed:true,
  freshBrowserPerformanceMeasured:true,freshBrowserPerformancePassed:true,activeWindows:4,pausedControls:2,
  minimumObservationMs:15000,runtimeFiles:20,browserEarnedWins:0,startingActorCounts:[20,40],populationsMayEvolve:true,gpuTimingMeasured:false,presentedFrameFPSMeasured:false};
}
