// SPDX-License-Identifier: MIT
// Current muted native-browser functionality; prior timing stays historical.
import assert from 'node:assert/strict';
import {restoreNativeArtifactPack} from './native-artifact-pack.mjs';

const ENGINE='0.2.6-web-zombotany45.1';
const FOLDER='tests/fixtures/zombotany45-browser/';
const PREREGISTRATION_SHA256='9c866e49f3e6f3697db26467c84558c3e45e4482f6ecf71f89baa441e041ef75';
const AUTOMATION_AMENDMENT_SHA256='a4e22a2c01bcc268c7596219eb7865b0aed5e284e6f5629ea4c76f50b6eff5de';
const ROOF_POTS_AMENDMENT_SHA256='f7a37929684d001c92468be9ce32e0a66e7bf6e721ccac821602d1d1feef148e';
const PREREQUISITE_FIXTURE_SHA256=null; // Fresh actual genuine4 against corrected production source, reviewed separately.
const ACCEPTED_PROOF_SHA256=null; // Only root review of actual nine captures can seal this.
const RUNTIME=['audio-controls.js','bundled-assets.js','game-assets/manifest.json',
 'game/pvz-portable.js','game/pvz-portable.wasm','index.html','index-port.html','launcher.js',
 'loader.js','original-ui.js','port.css','runtime.js','save-recovery.js','save-storage-core.js',
 'save-storage-worker.js','save-storage.js','save-transfer.js','steam-compat.js','test-profiles.js',
 'vendor/jszip.min.js'].sort();
const CAPTURES=['family','fog-chooser','fog-play','fog-continue','roof-chooser','roof-play','roof-continue','fog-attack','roof-attack'].sort();
const json=b=>JSON.parse(Buffer.from(b).toString('utf8').replace(/^\uFEFF/,''));
const safe=name=>{assert(typeof name==='string'&&name&&!name.startsWith('/')&&!/[\\:\x00-\x1f]/.test(name));assert(name.split('/').every(p=>p&&p!=='.'&&p!=='..'));return name;};
const fields=(object,expected)=>{for(const [key,value]of Object.entries(expected))assert.deepEqual(object[key],value,key);};

export async function verifyZombotany45BrowserEvidence({availability,currentEngine,read,sha,Zip}){
 assert(ACCEPTED_PROOF_SHA256,'Current Zombotany 4/5 browser observations have not been reviewed');
 assert(PREREQUISITE_FIXTURE_SHA256,'The corrected-source genuine native4 prerequisite has not been reviewed');
 assert.equal(currentEngine.id,ENGINE);
 const release=json(await read('tests/fixtures/zombotany45-release.json'));
 fields(release,{id:ENGINE,sourceFiles:886,productionObjects:151});
 const engine={id:ENGINE,jsSha256:release.jsSha256,wasmSha256:release.wasmSha256};
 fields(currentEngine.artifacts,{jsSha256:engine.jsSha256,wasmSha256:engine.wasmSha256,sourceSha256:release.sourceSha256});
 fields(availability,{schemaVersion:1,status:'functional-only',audioMutedThroughout:true,
  freshBrowserPerformanceMeasured:false,freshBrowserPerformancePassed:false,nativeTestsReplaceBrowserPerformance:false});
 assert.deepEqual(availability.engine,engine);
 const pinned=async record=>{
  safe(record.path);assert(record.path.startsWith(FOLDER),'Current browser evidence must stay in its own namespace');
  assert(Number.isSafeInteger(record.bytes)&&record.bytes>0);assert.match(record.sha256,/^[a-f0-9]{64}$/);
  const b=Buffer.from(await read(record.path));assert.equal(b.length,record.bytes,record.path);assert.equal(sha(b),record.sha256,record.path);return b;
 };
 assert.equal(availability.preregistration.path,FOLDER+'preregistration.json');
 assert.equal(availability.preregistration.sha256,PREREGISTRATION_SHA256);
 const prereg=json(await pinned(availability.preregistration));
 fields(prereg,{schemaVersion:1,id:'zombotany45-current-browser-functionality',stage:'preregistered-before-new-browser-interactions',
  engineId:ENGINE,sourceCount:886,productionObjectCount:151});
 assert.deepEqual([...prereg.captureKeys].sort(),CAPTURES);
 assert.equal(availability.automationAmendment.path,FOLDER+'automation-amendment.json');
 assert.equal(availability.automationAmendment.sha256,AUTOMATION_AMENDMENT_SHA256);
 const amendment=json(await pinned(availability.automationAmendment));
 fields(amendment,{schemaVersion:1,id:'zombotany45-browser-automation-amendment',
  stage:'preregistered-before-first-zombotany45-browser-interaction',engineId:ENGINE,automationProvider:'sky',reviewRequiredBeforeAcceptance:true});
 assert.equal(amendment.originalPreregistration.sha256,PREREGISTRATION_SHA256);
 assert.deepEqual([...amendment.unchangedRequirements.captureKeys].sort(),CAPTURES);
 assert.equal(availability.roofStartingPotsAmendment.path,FOLDER+'roof-starting-pots-amendment.json');
 assert.equal(availability.roofStartingPotsAmendment.sha256,ROOF_POTS_AMENDMENT_SHA256);
 const potAmendment=json(await pinned(availability.roofStartingPotsAmendment));
 fields(potAmendment,{schemaVersion:1,id:'zombotany45-browser-native-roof-pots-correction',
  stage:'preregistered-before-first-zombotany45-browser-interaction',engineId:ENGINE,reviewRequiredBeforeAcceptance:true});
 assert.equal(potAmendment.originalPreregistration.sha256,PREREGISTRATION_SHA256);
 assert.equal(potAmendment.automationAmendment.sha256,AUTOMATION_AMENDMENT_SHA256);
 assert.deepEqual(potAmendment.changedAssumption,{path:'modes.roof.startingPots',before:5,after:15});
 assert.deepEqual(potAmendment.nativeOpening,{mode:95,seedType:33,count:15,columns:[0,1,2],rows:[0,1,2,3,4],liveZombies:0,wave:0,tick:1});
 assert.deepEqual([...potAmendment.unchangedRequirements.captureKeys].sort(),CAPTURES);
 const openingLog=(await pinned(potAmendment.observedBeforeSourceCorrection)).toString('utf8').replace(/\r\n?/g,'\n');
 assert(openingLog.includes('45opening mode95 liveZombies0 livePlants15 wave0 tick1'));
 const potLines=openingLog.split('\n').filter(line=>line.startsWith('45openingPlant ')).sort(),expectedPotLines=[];
 for(let col=0;col<3;col++)for(let row=0;row<5;row++)expectedPotLines.push(`45openingPlant seed33 col${col} row${row} hp300 dead0 onBoard1`);
 assert.deepEqual(potLines,expectedPotLines.sort());
 assert.equal(availability.proof.path,FOLDER+'proof.json');assert.equal(availability.proof.sha256,ACCEPTED_PROOF_SHA256);
 const proof=json(await pinned(availability.proof));assert.deepEqual(proof.engine,engine);
 fields(proof,{schemaVersion:1,query:'?testing=1',automationProvider:'sky',audioMutedThroughout:true,
  fileFreeStartup:true,familyPageObserved:true,normalSeedChoosers:true,regularPlantsPlaced:true,
  bothModesAutomaticSaveContinue:true,bothActualNativeAttackCheckpointsImported:true,
  browserEarnedWins:0,performanceProbeLoaded:false,freshBrowserPerformanceMeasured:false,
  genericJavaScriptOrGameStateInjection:false});
 assert.match(proof.automationMethod,/^Official Computer Use,/);
 assert.equal(proof.automationAmendmentSha256,AUTOMATION_AMENDMENT_SHA256);
 assert.equal(proof.roofStartingPotsAmendmentSha256,ROOF_POTS_AMENDMENT_SHA256);
 assert.equal(proof.muteEvidenceSource,'UI Automation toggle and native screenshots');
 const url=new URL(proof.url);assert.equal(url.protocol,'http:');assert(['127.0.0.1','localhost'].includes(url.hostname));
 assert.equal(url.search,'?testing=1');assert.equal(url.pathname,'/');assert(!url.username&&!url.password&&!url.hash);
 assert(Number.isInteger(Number(url.port))&&Number(url.port)>=1024);
 assert.equal(proof.observedEngineMetadata.path,FOLDER+'observed-engine-provenance.json');
 assert.deepEqual(json(await pinned(proof.observedEngineMetadata)),currentEngine);
 fields(proof.family,{page:5,modes:[16,32,93,94,95],profileIndices:[15,31,92,93,94],
  cardRects:[[38,93,104,115],[193,93,104,115],[348,93,104,115],[503,93,104,115],[658,93,104,115]],
  originalAliasesAndTooltipBehaviorPreserved:true,tipsBelowCards:false});
 for(const biome of ['fog','roof']){
  const actual=proof[biome],expected=prereg.modes[biome];
  for(const key of ['mode','profileIndex','background','rows','normalChooser','startingSun','selectedSeeds','planting','speedLabel'])
   assert.deepEqual(actual[key],expected[key],biome+'.'+key);
  fields(actual,{sameBrowserSaveContinue:true,nativeAttackCheckpointImported:true});
  if(biome==='roof')assert.equal(actual.startingPots,15);
 }
 assert.deepEqual(Object.keys(proof.screenshots).sort(),CAPTURES);
 for(const record of Object.values(proof.screenshots)){
  const b=await pinned(record),png=b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),
   jpeg=b[0]===255&&b[1]===216&&b[2]===255&&b.at(-2)===255&&b.at(-1)===217;
  assert(b.length>1024&&(png||jpeg),'Unmodified official native screenshot PNG/JPEG bytes required');
 }
 assert.deepEqual(Object.keys(proof.runtimeFiles).sort(),RUNTIME);
 for(const [name,record]of Object.entries(proof.runtimeFiles)){
  assert.deepEqual(Object.keys(record).sort(),['bytes','sha256']);assert(Number.isSafeInteger(record.bytes)&&record.bytes>0);
  assert.match(record.sha256,/^[a-f0-9]{64}$/);const b=Buffer.from(await read('dist/'+safe(name)));
  assert.equal(b.length,record.bytes,name);assert.equal(sha(b),record.sha256,name);
 }
 for(const kind of ['js','wasm'])assert.equal(proof.runtimeFiles['game/pvz-portable.'+kind].sha256,engine[kind+'Sha256']);
 const sourceName=currentEngine.artifacts.source;assert(/^\.\.\/source\/[A-Za-z0-9._-]+\.zip$/.test(sourceName));
 const sourceBytes=Buffer.from(await read('dist/'+safe(sourceName.slice(3))));assert.equal(sha(sourceBytes),release.sourceSha256);
 const source=await Zip.loadAsync(sourceBytes),prefix='zombotany3-candidate/';
 const normalFile=source.file(prefix+'logs/build-result.json'),buildFile=source.file(prefix+'tests/zombotany45-build.json');assert(normalFile&&buildFile);
 const normalBytes=Buffer.from(await normalFile.async('uint8array')),normal=json(normalBytes),build=json(await buildFile.async('uint8array'));
 assert.equal(sha(normalBytes),release.normalReceiptSha256);assert.equal(proof.normalBuildReceiptSha256,release.normalReceiptSha256);
 fields(normal,{status:'PASS',exitCode:0,sourceFiles:886,sourceUnchangedDuringBuild:true});
 assert.equal(Object.keys(build.sourceSha256).length,886);assert.equal(Object.keys(build.productionObjectSha256).length,151);
 for(const kind of ['js','wasm'])assert.deepEqual(normal.outputs['build/pvz-portable.'+kind],proof.runtimeFiles['game/pvz-portable.'+kind]);
 assert.deepEqual(Object.keys(proof.nativeOrigins).sort(),['fog','roof']);
 const checkpointZips={};
 for(const [biome,mode]of [['fog',94],['roof',95]]){
  const record=proof.nativeOrigins[biome],origin=json(await pinned(record.result)),rawLog=await pinned(record.rawLog);
  fields(record,{engineId:ENGINE,mode,profileIndex:mode-1,profileCreditsAtExport:0,syntheticCheckpoint:false});
  fields(origin,{execution:'complete-production-engine',biome,mode,profileIndex:mode-1,name:'save-attack',
   outcome:'win',profileCredits:1,noAssignedUnlockCredits:true,silentHardware:true,audioDeviceOpened:false,optimization:'O2',resourceCapacityWarnings:0});
  assert.equal(origin.nativeProfileRecordsBefore.length,100);assert.equal(origin.nativeProfileRecordsAfter.length,100);
  assert.equal(origin.nativeProfileRecordsBefore[92],1);assert.equal(origin.nativeProfileRecordsBefore[93],biome==='fog'?0:1);
  assert.equal(origin.nativeProfileRecordsBefore[94],0);
  for(let index=0;index<100;index++)assert.equal(origin.nativeProfileRecordsAfter[index],origin.nativeProfileRecordsBefore[index]+(index===mode-1?1:0));
  assert.equal(origin.productionBuildReceiptSha256,proof.normalBuildReceiptSha256);
  assert.deepEqual(origin.testArtifactSha256,build.testArtifactSha256);assert.deepEqual(origin.testInputSha256,build.testInputSha256);
  assert.equal(sha(rawLog),origin.logSha256);
  const lines=rawLog.toString('utf8').replace(/\r\n?/g,'\n').split('\n').filter(line=>line.startsWith('ZOMBOTANY45_RESULT '));assert.equal(lines.length,1);
  const {logSha256,resourceCapacityWarnings,optimization,productionBuildReceiptSha256,testArtifactSha256,testInputSha256,...raw}=origin;
  assert.deepEqual(JSON.parse(lines[0].slice('ZOMBOTANY45_RESULT '.length)),raw);
  const cp=origin.checkpoint;fields(cp,{performed:true,kind:'save-attack',graphPreserved:true,profileCreditAtExport:0});
  assert.equal(cp.beforeGraph,cp.afterGraph);
  const zip=await Zip.loadAsync(await pinned(proof.inputs[biome+'Checkpoint']),{checkCRC32:true});checkpointZips[biome]=zip;
  const expected=['userdata/game1_'+mode+'.v4','userdata/user1.dat','userdata/users.dat'].sort();
  assert.deepEqual(Object.values(zip.files).filter(f=>!f.dir).map(f=>f.name).sort(),expected);
  assert.deepEqual(Object.keys(record.exportedFiles).sort(),expected);
  for(const [name,pin]of Object.entries(record.exportedFiles)){
   assert.deepEqual(Object.keys(pin).sort(),['bytes','sha256']);const bytes=Buffer.from(await zip.file(name).async('uint8array'));
   assert.equal(bytes.length,pin.bytes);assert.equal(sha(bytes),pin.sha256,'Actual native export: '+name);
  }
  for(const [name,count]of [['userdata/game1_'+mode+'.v4',cp.exportedBoardBytes],['userdata/user1.dat',cp.exportedProfileBytes],['userdata/users.dat',cp.exportedUsersBytes]])
   assert.equal((await zip.file(name).async('uint8array')).length,count);
 }
 // The prerequisite award is an explicitly earlier genuine native run. The
 // final fog/roof attack origins above remain bound to the final executable.
 assert.equal(proof.initialProfilePrerequisites,'genuine native Zombotany 4 win');
 const prerequisite=proof.nativePrerequisite;
 assert.equal(prerequisite.scope,'genuine earlier native Zombotany 4 win; separate from final attack checkpoint cases');
 const fixtureBytes=await pinned(prerequisite.fixture),fixture=json(fixtureBytes);
 assert.equal(sha(fixtureBytes),PREREQUISITE_FIXTURE_SHA256);
 const sourceFixture=source.file(prefix+'tests/zombotany45-earned-z4-fixture.json');assert(sourceFixture);
 assert.deepEqual(Buffer.from(await sourceFixture.async('uint8array')),fixtureBytes);
 assert.equal(build.testInputSha256['zombotany45-earned-z4-fixture.json'],sha(fixtureBytes));
 fields(fixture,{schemaVersion:1,originEngineId:ENGINE,originNormalBuildReceiptSha256:proof.normalBuildReceiptSha256,
  originCase:[94,'save-attack',1,1729],ordinaryNativeMouseInputsOnly:true,postStartStateEdits:false,
  noAssignedUnlockCredits:true,realNativeTrophyCollected:true,earnedRecordIndex:93,earnedRecordValue:1});
 const earlierBytes=await pinned(prerequisite.result),earlier=json(earlierBytes),earlierLog=await pinned(prerequisite.rawLog),
  earlierBuildBytes=await pinned(prerequisite.build),earlierBuild=json(earlierBuildBytes);
 assert.equal(sha(earlierBytes),fixture.originResultSha256);assert.equal(sha(earlierLog),fixture.originRawLogSha256);
 assert.equal(sha(earlierBuildBytes),fixture.originBuildSha256);
 for(const [name,bytes]of [['result.json',earlierBytes],['save-attack.log',earlierLog],['build.json',earlierBuildBytes]]){
  const key='zombotany45-earned-z4-origin/'+name,file=source.file(prefix+'tests/'+key);assert(file);
  assert.deepEqual(Buffer.from(await file.async('uint8array')),bytes);
  assert.equal(build.testInputSha256[key],sha(bytes));
 }
 fields(earlier,{execution:'complete-production-engine',biome:'fog',name:'save-attack',mode:94,profileIndex:93,
  speed:1,seed:1729,outcome:'win',profileCredits:1,noAssignedUnlockCredits:true,
  ordinaryNativeMouseInputsOnly:true,postStartActorHealthPositionStageTimeOrRNGEdits:false,
  silentHardware:true,audioDeviceOpened:false,optimization:'O2',resourceCapacityWarnings:0});
 assert.equal(earlier.productionBuildReceiptSha256,proof.normalBuildReceiptSha256);
 assert.equal(earlier.logSha256,sha(earlierLog));assert.deepEqual(earlier.testArtifactSha256,fixture.originTestArtifacts);
 fields(earlierBuild,{execution:'complete-production-engine',optimization:'O2',productionObjectCount:151,
  productionBuildReceiptSha256:proof.normalBuildReceiptSha256});
 assert.deepEqual(earlierBuild.sourceSha256,build.sourceSha256);
 assert.deepEqual(earlierBuild.productionObjectSha256,build.productionObjectSha256);
 assert.deepEqual(earlierBuild.testArtifactSha256,fixture.originTestArtifacts);
 assert.deepEqual(earlier.testInputSha256,earlierBuild.testInputSha256);
 const earlierLines=earlierLog.toString('utf8').replace(/\r\n?/g,'\n').split('\n').filter(line=>line.startsWith('ZOMBOTANY45_RESULT '));assert.equal(earlierLines.length,1);
 const {logSha256:oldLog,resourceCapacityWarnings:oldWarnings,optimization:oldOptimization,productionBuildReceiptSha256:oldReceipt,
  testArtifactSha256:oldArtifact,testInputSha256:oldInputs,...earlierRaw}=earlier;
 assert.deepEqual(JSON.parse(earlierLines[0].slice('ZOMBOTANY45_RESULT '.length)),earlierRaw);
 assert.equal(earlier.nativeProfileRecordsBefore.length,100);assert.equal(earlier.nativeProfileRecordsAfter.length,100);
 assert.equal(earlier.nativeProfileRecordsBefore[92],1);assert.equal(earlier.nativeProfileRecordsBefore[93],0);assert.equal(earlier.nativeProfileRecordsBefore[94],0);
 for(let i=0;i<100;i++)assert.equal(earlier.nativeProfileRecordsAfter[i],earlier.nativeProfileRecordsBefore[i]+(i===93?1:0));
 assert.deepEqual(fixture.nativeChallengeRecords,earlier.nativeProfileRecordsAfter);
 const snapshotBytes=await pinned(prerequisite.inputSnapshot);assert.equal(sha(snapshotBytes),fixture.originInputSnapshotSha256);
 const snapshot=await Zip.loadAsync(snapshotBytes,{checkCRC32:true});
 for(const [name,digest]of Object.entries(earlierBuild.testInputSha256)){
  safe(name);const file=snapshot.file('tests/'+name);assert(file,'Earlier native input snapshot missing '+name);
  assert.equal(sha(Buffer.from(await file.async('uint8array'))),digest,name);
 }
 assert.equal(sha(Buffer.from(await snapshot.file('tests/build-zombotany45.py').async('uint8array'))),earlierBuild.builderSha256);
 assert.deepEqual(Object.keys(prerequisite.earnedProfileFiles).sort(),['userdata/user1.dat','userdata/users.dat']);
 const profile=await Zip.loadAsync(await pinned(proof.inputs.nativeProfile),{checkCRC32:true});
 assert.deepEqual(Object.values(profile.files).filter(f=>!f.dir).map(f=>f.name).sort(),['userdata/user1.dat','userdata/users.dat']);
 for(const name of ['userdata/user1.dat','userdata/users.dat']){
  const bytes=await pinned(prerequisite.earnedProfileFiles[name]),filename=name.slice('userdata/'.length);
  assert.deepEqual(Buffer.from(await profile.file(name).async('uint8array')),bytes);
  assert.deepEqual(fixture.files[filename],{bytes:bytes.length,sha256:sha(bytes)});
  const sourceFile=source.file(prefix+'tests/zombotany45-earned-z4/'+name);assert(sourceFile);
  assert.deepEqual(Buffer.from(await sourceFile.async('uint8array')),bytes);
 }
 assert.deepEqual(await pinned(proof.nativeOrigins.roof.initialProfileFile),await pinned(prerequisite.earnedProfileFiles['userdata/user1.dat']));
 assert(Array.isArray(proof.operatorObservations)&&proof.operatorObservations.length>=7);
 proof.operatorObservations.forEach(value=>assert(typeof value==='string'&&value.length>=20));
 fields(proof.canvas,{width:800,height:600});
 assert.equal(proof.nativeCanvasSizeSource,'pinned runtime');
 for(const key of ['width','height'])assert(Number.isFinite(proof.viewport[key])&&proof.viewport[key]>0);
 assert.equal(proof.viewport.coordinateSpace,'screenshot pixels');
 assert(proof.viewport.deviceScaleFactor===null||Number.isFinite(proof.viewport.deviceScaleFactor)&&proof.viewport.deviceScaleFactor>0);
 const bounds=proof.canvas.visualBounds;
 for(const key of ['x','y','width','height'])assert(Number.isFinite(bounds[key])&&bounds[key]>=0);
 assert(bounds.width>0&&bounds.height>0&&bounds.x+bounds.width<=proof.viewport.width&&bounds.y+bounds.height<=proof.viewport.height);
 assert(Math.abs(bounds.width*600-bounds.height*800)<=1600,'Native visual game bounds must retain the original aspect ratio within screenshot rounding');
 const actions=(await pinned(proof.actionTranscript)).toString('utf8').trim().split('\n').map(line=>JSON.parse(line));
 const allowed=['navigate','inspect','ax','screenshot','click','key','text','chooseFile','reload','wait','close'];
 assert(actions.length>30);let inspections=0,imports=0,captures=0;
 for(const row of actions){
  assert(allowed.includes(row.action));assert.equal(row.command.action,row.action);assert.equal(row.provider,'sky');
  assert(typeof row.method==='string'&&/^sky\./.test(row.method),'Actual official Computer Use method receipt required');
  assert.equal(row.status,'ok','Unresolved native input or observation failure');
  if(row.action==='navigate')assert.equal(row.command.url,proof.url);
  if(row.action==='chooseFile')imports++;
  if(row.action==='screenshot')captures++;
  if(row.action==='inspect'){
   inspections++;const r=row.result;assert.equal(r.url,proof.url);assert.equal(r.windowVisible,true);
   assert(r.mute.length>0&&r.mute.every(m=>m.label==='Unmute sound'&&m.value===1));
   const raw=(await pinned(r.uiAutomationObservation)).toString('utf8');
   assert(raw.includes('Unmute sound')&&raw.includes(url.host),'Raw native UIA must include the actual mute control and browser address');
  }
 }
 assert(inspections>=6&&imports>=3&&captures>=9);
 assert(['inspect','close'].includes(actions.at(-1).action));
 assert(['paused','closed'].includes(proof.finalBrowserState));
 return {status:'PASS current muted Zombotany 4/5 browser functionality',engine:ENGINE,screenshots:9,runtimeFiles:RUNTIME.length,
  executablePayloadsChecked:2,actualNativeAttackCheckpointsImported:2,bothModesAutomaticSaveContinue:true,
  browserEarnedWins:0,freshBrowserPerformanceMeasured:false,freshBrowserPerformancePassed:false};
}

// An authenticated lack of browser observations is separate from functional
// evidence. It never satisfies or changes the strict nine-capture verifier.
export async function verifyZombotany45BrowserAvailability({availability,currentEngine,read,sha,Zip}){
 if(availability?.status==='functional-only')return verifyZombotany45BrowserEvidence({availability,currentEngine,read,sha,Zip});
 assert.equal(currentEngine.id,ENGINE);
 fields(availability,{schemaVersion:1,status:'not-run-tool-blocked',proof:null,currentGameObserved:false,
  currentBrowserFunctionalPassed:false,screenshots:0,currentBrowserScreenshots:0,browserEarnedWins:0,
  audioMutedThroughout:null,freshBrowserPerformanceMeasured:false,freshBrowserPerformancePassed:false,
  nativeTestsReplaceBrowserPerformance:false});
 const release=json(await read('tests/fixtures/zombotany45-release.json'));
 fields(release,{id:ENGINE,sourceFiles:886,productionObjects:151,
  normalReceiptSha256:'721a1d47b75566e042bf7bd69dc3e34dc8c7cd69fe7a00eb4455f662defaef3b'});
 const engine={id:ENGINE,jsSha256:release.jsSha256,wasmSha256:release.wasmSha256};
 assert.deepEqual(availability.engine,engine);
 fields(currentEngine.artifacts,{jsSha256:release.jsSha256,wasmSha256:release.wasmSha256,sourceSha256:release.sourceSha256});
 const pinned=async record=>{
  safe(record.path);assert(record.path.startsWith(FOLDER));assert(Number.isSafeInteger(record.bytes)&&record.bytes>0);
  assert.match(record.sha256,/^[a-f0-9]{64}$/);const bytes=Buffer.from(await read(record.path));
  assert.equal(bytes.length,record.bytes);assert.equal(sha(bytes),record.sha256);return bytes;
 };
 for(const[field,name,digest]of [['preregistration','preregistration.json',PREREGISTRATION_SHA256],
  ['automationAmendment','automation-amendment.json',AUTOMATION_AMENDMENT_SHA256],
  ['roofStartingPotsAmendment','roof-starting-pots-amendment.json',ROOF_POTS_AMENDMENT_SHA256]]){
  assert.equal(availability[field].path,FOLDER+name);assert.equal(availability[field].sha256,digest);await pinned(availability[field]);
 }
 assert.equal(availability.blockingEvidence.path,FOLDER+'blocked-control.json');
 assert.equal(availability.blockingEvidence.sha256,'3fb43fa7028994d19ebf39bd9e1c84b24785be41474867f21810f0e97a45f491');
 const blocked=json(await pinned(availability.blockingEvidence));
 fields(blocked,{schemaVersion:1,engineId:ENGINE,provider:'sky',tool:'mcp__node_repl__js',reasonCode:'browser-url-policy-block',
  currentGameObserved:false,currentBrowserFunctionalPassed:false,currentBrowserScreenshots:0,browserEarnedWins:0,
  noFurtherAppInputAfterBlock:true,automatedNativeTestsContinueSeparately:true,originalNineCapturePlanRetained:true,performanceMeasured:false});
 assert.equal(blocked.toolResult.isError,true);assert.equal(blocked.toolResult.content.length,1);
 assert.deepEqual(blocked.toolResult.content[0],{type:'text',text:'Computer Use has been stopped for this turn because it could not determine the current browser URL on Windows with enough confidence to enforce policy. Stop your work and send a final message noting why Computer Use ended.'});
 assert(blocked.attemptedCode.includes('sky.get_window(')&&blocked.attemptedCode.includes('sky.get_window_state('));
 for(const suffix of ['js','wasm']){
  const bytes=Buffer.from(await read('dist/game/pvz-portable.'+suffix));assert.equal(sha(bytes),engine[suffix+'Sha256']);
  if(suffix==='wasm')assert(WebAssembly.validate(bytes));
 }
 assert(/^\.\.\/source\/[A-Za-z0-9._-]+\.zip$/.test(currentEngine.artifacts.source));
 const sourceBytes=Buffer.from(await read('dist/'+safe(currentEngine.artifacts.source.slice(3))));assert.equal(sha(sourceBytes),release.sourceSha256);
 const archive=await Zip.loadAsync(sourceBytes,{checkCRC32:true}),prefix='zombotany3-candidate/';
 await restoreNativeArtifactPack(archive,prefix);
 const nativeRead=async name=>{safe(name);const entry=archive.file(prefix+name);assert(entry,name);return Buffer.from(await entry.async('uint8array'));};
 const normalBytes=await nativeRead('logs/build-result.json');assert.equal(sha(normalBytes),release.normalReceiptSha256);
 const normal=json(normalBytes);fields(normal,{status:'PASS',exitCode:0,sourceUnchangedDuringBuild:true,sourceFiles:886});
 for(const suffix of ['js','wasm']){
  const bytes=Buffer.from(await read('dist/game/pvz-portable.'+suffix));assert.deepEqual(normal.outputs['build/pvz-portable.'+suffix],{bytes:bytes.length,sha256:sha(bytes)});
 }
 const before=json(await nativeRead('logs/source-before.json')),after=json(await nativeRead('logs/source-after.json'));
 assert.deepEqual(before,after);assert.equal(Object.keys(after).length,886);
 const sourceFiles=Object.values(archive.files).filter(file=>!file.dir&&file.name.startsWith(prefix+'source/'));assert.equal(sourceFiles.length,886);
 const sourcePins=new Map();
 for(const[name,digest]of Object.entries(after)){safe(name);const bytes=await nativeRead('source/'+name);assert.equal(sha(bytes),digest);sourcePins.set('source/'+name,digest);}
 const build=json(await nativeRead('tests/zombotany45-build.json'));
 fields(build,{execution:'complete-production-engine',optimization:'O2',productionObjectCount:151,productionBuildReceiptSha256:release.normalReceiptSha256,
  presentationControlsAvailable:true,developmentNoArt:false});
 assert.deepEqual(build.sourceSha256,Object.fromEntries(sourcePins));assert.equal(Object.keys(build.productionObjectSha256).length,151);
 const suites=['game-speed','qol-controls','decks-cooldowns','bonus-challenge','bonus-completion','night-shift','lantern-shroom',
  'garden-shuffle','seed-swap','mender-bloom','intensive-care','native-layout','care-fatigue','care-full-run','chain-reaction',
  'rally-zombie','rally-raid','lights-out','garlic-run','bungee-business','cob-cannon-command','pool-panic','pool-panic-endless',
  'scrap-yard','vase-ambush','torchbearer','double-agent','gust-bloom','zombotany3','zombotany45'];
 assert.equal(new Set(suites).size,30);
 for(const suite of suites){
  const report=json(await nativeRead('tests/'+suite+'-results.json'));
  assert.match(report.status,/^PASS/);fields(report,{failures:0,exitCode:0});assert(Number.isSafeInteger(report.checks)&&report.checks>0);
  assert.equal(report.generatedHarnessSha256,sha(await nativeRead('tests/'+suite+'-harness.cpp')));
  assert(Object.keys(report.sourceSha256).length>0);
  for(const[name,digest]of Object.entries(report.sourceSha256)){safe(name);assert.equal(sourcePins.get(name),digest,name);}
  if(report.execution==='complete-production-engine'){
   assert.equal(report.optimization,'O2');assert.equal(report.productionBuildReceiptSha256,release.normalReceiptSha256);
   assert.equal(report.productionObjectCount,151);assert.deepEqual(report.productionObjectSha256,build.productionObjectSha256);
  }
 }
 return {status:'NOT RUN current Zombotany 4/5 browser functionality: official Computer Use URL policy block',verdict:'NOT RUN',
  engine:ENGINE,currentBrowserFunctionalPassed:false,currentGameObserved:false,screenshots:0,currentBrowserScreenshots:0,
  browserEarnedWins:0,audioMutedThroughout:null,freshBrowserPerformanceMeasured:false,freshBrowserPerformancePassed:false,
  nativeSuiteReportsBound:30,sourceFiles:886,productionObjects:151,nativeRuntimePayloadsBound:2,
  scope:'Authenticated missing current browser observation; source/native-runtime binding only. Full native behavior remains separately verified.'};
}
