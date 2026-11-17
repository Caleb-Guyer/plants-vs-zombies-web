// SPDX-License-Identifier: MIT
// Independent finite native Survival acceptance. Synthetic controls earn no clears.
import assert from 'node:assert/strict';
import {CURRENT_ENGINE_ID,CURRENT_SOURCE_COUNT,CURRENT_OBJECT_COUNT,CURRENT_NORMAL_RECEIPT_SHA256,
 reconstructZsurvivalParentSources,ZSURVIVAL_PARENT_ARCHIVE_SHA256} from './native-release-context.mjs';
const acceptedContractPins=new Set(['a4af8834e7903731d03b1080101e2f0bb3c73e1aeddbfd30ff250c63689f6014']);
const acceptedReportPins=new Set(['caf29629c41df8c5cd3a4b31ccc1160cc4c14c2cdd575308b3ca43746858bbd3']);
const acceptedContentPins=new Set(['8760d7467df0601dc82d19f69a8183e7d6ab3f0f3c25a7d606e0bd0a46a09431']);
const ENGINE='0.2.6-web-zsurvival.1';
const names=['normal','hesitation','save-combat','save-transition','no-action','controls'];
export const ZSURVIVAL1_MATRIX=[1729,7331].flatMap(seed=>names.flatMap(name=>[1,2].map(speed=>[name,speed,seed])));
const types=[26,27,30,29,31,28],pad=row=>[...row,...Array(6-row.length).fill(0)];
const stages=[
 [[1],[1],[2],[2],[2,1],[2,1],[2,1],[3,1],[3,1],[4,2]],
 [[2],[2,1],[2,0,1],[2,1],[3,1],[2,1,1],[3,1],[3,1,1],[3,2],[4,2,1]],
 [[2,1],[2,1],[2,1,0,1],[2,1,1],[3,1,0,1],[2,1,1],[3,1],[3,1,0,1],[3,2,1],[3,2,0,1]],
 [[2,1],[2,1,0,1],[2,1,1],[2,1,0,0,1],[2,1,0,1],[2,1,1],[3,1,0,1],[3,1,0,0,1],[3,1,1,1],[3,1,0,1,1]],
 [[2,1,0,1],[2,1,1],[2,1,0,0,1],[2,1,0,1],[2,1,0,0,0,1],[3,1,1,1],[3,1,0,0,1],[3,1,0,1],[3,1,1,1],[3,2,0,1,1]]
].map(stage=>stage.map(pad));
const ledger=stages.map(stage=>stage.map(row=>row.map((n,i)=>[types[i],n]).filter(([,n])=>n).sort((a,b)=>a[0]-b[0])));
const stageTotals=[29,40,44,45,49],deck=[1,32,3,5,2,17];
const POLICY_SHA256='fa16fc40d5358026652b068eff81903c7eff3f3f2d4c7ed0968cd86c7dca13d9';
const PREREQUISITE_SHA256='7cb3b8e616a9d02b5d47cb05932894d84bfa339950f9c17970ef414efc66ee85';
const fixtureInputs=['zsurvival1-harness.cpp','zsurvival1-policy.h','zsurvival1-battles.h','zsurvival1-controls.h',
 'zsurvival1-initial-plan.json','build-zsurvival1.py','test-zsurvival1.py','zsurvival1-native-art-inputs.json','zsurvival1-assets.json',
 'test-pool-panic.py','zsurvival1-earned-z1/userdata/user1.dat','zsurvival1-earned-z1/userdata/users.dat',
 'zsurvival1-earned-z1-origin/build.json','zsurvival1-earned-z1-origin/inputs.zip','zsurvival1-earned-z1-origin/prerequisite.log',
 'zsurvival1-earned-z1-origin/result.json','zsurvival1-earned-z1-fixture.json','zsurvival1-thumbnail-controls.h',
 'zsurvival1-thumbnail-bad-normal.bmp','zsurvival1-thumbnail-bad-normal-provenance.json',
 'zsurvival1-thumbnail-provenance/controls.log','zsurvival1-thumbnail-provenance/result.json'];
const json=b=>JSON.parse(Buffer.from(b).toString('utf8').replace(/^\uFEFF/,''));
const text=b=>Buffer.from(b).toString('utf8').replace(/\r\n?/g,'\n');
const fields=(a,b)=>{for(const[k,v]of Object.entries(b))assert.deepEqual(a[k],v,k);};
const integer=(v,lo=0,hi=Number.MAX_SAFE_INTEGER)=>assert(Number.isSafeInteger(v)&&v>=lo&&v<=hi);
const safe=p=>{assert(typeof p==='string'&&p&&!/[\\:\x00-\x1f]/.test(p)&&!p.startsWith('/')&&p.split('/').every(s=>s&&s!=='.'&&s!=='..'));return p;};
const digest=v=>assert(typeof v==='string'&&/^[a-f0-9]{64}$/.test(v));
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const identity=r=>[r.name,r.speed,r.seed].join('/');

export async function verifyZsurvival1SourceBounds({read,sha,engine}){
 assert.equal(CURRENT_ENGINE_ID,ENGINE);assert.equal(CURRENT_SOURCE_COUNT,888);assert.equal(CURRENT_OBJECT_COUNT,152);
 const parent=await reconstructZsurvivalParentSources({read,sha,engine});assert.equal(parent.files.size,886);
 let enums=text(await read('source/src/ConstEnums.h'));
 const appended='\tGAMEMODE_SURVIVAL_ZOMBOTANY_DAY = 96,\n';assert.equal(enums.split(appended).length,2);
 enums=enums.replace(appended,'').replace('\tNUM_GAME_MODES = 97','\tNUM_GAME_MODES = 96');
 assert.equal(enums,text(parent.files.get('src/ConstEnums.h')),'Only the next mode is appended; no prior mode, seed or zombie ID changes');
 const header=text(await read('source/src/Lawn/System/ZombotanySurvival.h'));
 for(const[k,v]of Object.entries({kProfileIndex:95,kStageCount:5,kWavesPerStage:10,kFlagGoal:5,kStartingSun:50}))assert(header.includes(`${k} = ${v};`),k);
 assert(header.includes('kMode = GAMEMODE_SURVIVAL_ZOMBOTANY_DAY'));
 const course=header.match(/kStages\s*=\s*\{\{([^]*?)\}\};/);assert(course);
 assert.deepEqual([...course[1].matchAll(/\{([\d,\s]+)\}/g)].map(m=>m[1].split(',').map(v=>Number(v.trim()))),stages.flat());
 const source=text(await read('source/src/Lawn/System/ZombotanySurvival.cpp'));
 assert(!/(?:\.|->)(?:mBodyHealth|mBodyMaxHealth|mHelmHealth|mShieldHealth|mVelX)\s*(?:[+*/-]=|=(?!=))/.test(source),'Original head stats stay native');
 const screen=text(await read('source/src/Lawn/Widget/ChallengeScreen.cpp'));
 for(const exact of ['ZombotanySurvival::IsMode(aDef.mChallengeMode) ? 5 : -1;',
  '38 + (aFamilySlot % 5) * 155, 93 + (aFamilySlot / 5) * 119, 104, 115',
  'mChallengeRecords[ZombotanySurvival::kProfileIndex] > 0',
  'head.mOverlayMatrix = parent * offset;',
  'body.FindTrackIndex(wallnut ? "Zombie_body" : "anim_head1")',
  'PvzpScaleRotateTransformMatrix(offset, 50.0f, 0.0f, .2f, -.8f, .8f)',
  'PvzpScaleRotateTransformMatrix(offset, 65.0f, -5.0f, .2f, -1.0f, 1.0f)'])assert(screen.includes(exact),exact);
 const battles=text(await read('tests/zsurvival1-battles.h')),policy=await read('tests/zsurvival1-policy.h');
 assert.equal(sha(policy),POLICY_SHA256,'The preregistered finite visible player is fixed');
 const view=battles.match(/ZSPlayer::View View\(Board\*b\)\{([^]*?)return v;\}/);assert(view);
 assert(view[1].includes('z->mPosX<=760'));assert(!/mBodyHealth|mSurvivalStage|mCurrentWave|mBoss\w+|Rand\(/.test(view[1]),'Player view cannot expose hidden combat or future state');
 assert(!/(?:\.|->)(?:mSunMoney|mBodyHealth|mPlantHealth|mCurrentWave|mZombieCountDown)\s*(?:[+*/-]=|=(?!=))/.test(battles+'\n'+text(policy)),
  'Ordinary play cannot rewrite finite resources, health or course clocks');
 assert(battles.includes('b->mSunMoney==sun-cost'));assert(battles.includes('nextAction=b->mMainCounter+150'));
 return {sourceFiles:888,productionObjects:152,parentSourceFiles:886,authoredActors:207};
}

export function verifyZsurvival1Checkpoint(cp,name){
 fields(cp,{performed:true,graphPreserved:true,nativeMenuLeaveCardContinue:true,nativeMenuSavedFilePreserved:true});assert.equal(cp.beforeGraph,cp.afterGraph);assert(cp.beforeGraph.length>500);
 const parts=cp.beforeGraph.split(';'),base=parts[0].split(':').map(Number),survival=parts.find(s=>s.startsWith('survival,'))?.split(',').slice(1).map(Number);
 assert(survival&&survival.length===4);assert.equal(base[4],cp.stage);assert.equal(base[2],cp.wave);assert.equal(cp.wave,10);
 assert.equal(survival[0],cp.transitionCounter);assert.equal(survival[1],10);assert(cp.beforeGraph.includes(';terrain,0,'));assert(parts.includes('future'));
 assert.equal(base.length,21);assert.equal(base[13],6);assert.equal(base[19],10);
 assert.deepEqual(parts.filter(p=>p.startsWith('b,')).map(p=>Number(p.split(',')[1])),deck);
 const future=parts.slice(parts.indexOf('future')+1);assert.equal(future.length,10);
 const actualFuture=future.map(w=>{const values=w.split(',').filter(Boolean).map(Number);assert.equal(values.pop(),-1);
  const counts=new Map();for(const type of values){assert(types.includes(type));counts.set(type,(counts.get(type)||0)+1);}return [...counts].sort((a,b)=>a[0]-b[0]);});
 assert.deepEqual(actualFuture,ledger[cp.stage]);
 if(name==='save-combat'){assert.equal(cp.stage,2);integer(cp.aliveEnemies,1);assert.equal(cp.transitionCounter,0);}
 else{assert.equal(name,'save-transition');assert.equal(cp.stage,1);integer(cp.transitionCounter,100,400);assert.equal(cp.aliveEnemies,0);}
}

export function verifyZsurvival1Scenario(row){
 assert(names.includes(row.name));assert([1,2].includes(row.speed)&&[1729,7331].includes(row.seed));integer(row.checks,1);
 fields(row,{execution:'complete-production-engine',mode:96,profileIndex:95,silentHardware:true,audioDeviceOpened:false});
 if(row.name==='controls'){
  fields(row,{family:'synthetic-controls',outcome:'controls-pass',earnedClears:0,profileCredits:0,nativeCreationRequests:42,
   nativeHeadBodyHealth:[270,270,500,270,270,270],nativeHeadHelmetHealth:[0,1100,0,0,0,2200],nativeStageActorTotals:stageTotals,
   nativeFinalStageStates:[0,0,0,0,1],nativeSyntheticPersistentPlants:3,nativeSyntheticPersistentMowers:4,nativeSyntheticPersistentSun:375,
   nativeNormalClassification:true,nativeAllFiveStageGardensPreserved:true,nativePartialFlagsNotTrophies:true,
   nativeSixthCardGeometryAndPixels:true,nativeThumbnailHeadTypes:[26,29,27],nativeThumbnailBadFrameRejected:true,
   nativeThumbnailOrdinaryHeadSubstitutionsRejected:3,nativeThumbnailActualNativeReferenceActors:3,nativeLockedHoverVisible:true,
   nativePartialSelfUnlockWithoutTrophy:true,nativeOriginalSurvivalDayUnchanged:true,nativeOriginalNormalAndConeheadWaves:true,
   all100ProfileRecordsPreserved:true,syntheticActorSetup:true});
  integer(row.nativeCardDistinctColors,41);
  for(const[k,lo,hi]of [['nativeThumbnailMatchedCorePixels',20,5200],['nativeThumbnailMatchPercentMilli',55000,100000],['nativeThumbnailBadPercentMilli',0,54999]]){
   assert.equal(row[k].length,3);row[k].forEach(v=>integer(v,lo,hi));
  }
  return;
 }
 const loss=row.name==='no-action';
 fields(row,{family:'zsurvival1-day',outcome:loss?'native-loss':'win',earnedClears:loss?0:1,nativeActualTrophyCollected:!loss,
  nativeOriginalChoosers:true,nativeViewLawnAndPacketCooldownsPreserved:!loss,nativeSameBoardAndGardenRepicks:!loss,
  visibleOnlyPolicy:true,minimumInputCadenceTicks:150,postStartActorHealthResourceStageTimeOrRNGEdits:false,
  noAssignedUnlockCredits:true,nativeAllLiveZombiesPlantHeadOnly:true});
 integer(row.nativeTicks,1,599999);integer(row.nativeLiveHeadChecks,1);integer(row.nativeMowersRemaining,0,5);
 assert.equal(row.nativeProfileRecordsBefore.length,100);assert.equal(row.nativeProfileRecordsAfter.length,100);
 assert.deepEqual(row.nativeProfileRecordsBefore,Array.from({length:100},(_,i)=>i===15?1:0));
 row.nativeProfileRecordsAfter.forEach((v,i)=>{integer(v);if(i!==95)assert.equal(v,row.nativeProfileRecordsBefore[i]);});
 assert.equal(row.nativeBestFlags,row.nativeProfileRecordsAfter[95]);
 if(loss){integer(row.nativeBestFlags,0,4);fields(row,{nativeOrdinaryPlacements:0,nativeSunClicks:0,nativeSunSpent:0});assert(!row.checkpoint.performed);return;}
 fields(row,{nativeBestFlags:5,nativeAwardType:8,nativeAwardStage:4,nativeAwardWave:10,nativeAwardEnemies:0,nativeRepicks:4,
  nativeVisitedStages:[0,1,2,3,4],nativePartialBestFlags:[1,2,3,4],nativeFormationLedger:ledger});
 for(const k of ['nativeOrdinaryPlacements','nativeSunClicks','nativeSunSpent','nativeHostilePeas'])integer(row[k],1);
 integer(row.nativePersistedPlantObservations,4,180);integer(row.nativePersistedMowerObservations,0,20);assert.equal(row.nativeStageStartTicks.length,5);
 if(row.name==='hesitation')integer(row.nativeHesitationWindows,49,50);else assert.equal(row.nativeHesitationWindows,0);
 assert.equal(row.checkpoint.performed,row.name.startsWith('save-'));if(row.checkpoint.performed)verifyZsurvival1Checkpoint(row.checkpoint,row.name);
}

export function verifyZsurvival1Matrix(report){
 assert.equal(report.scenarios.length,24);assert.deepEqual(report.scenarios.map(identity).sort(),ZSURVIVAL1_MATRIX.map(r=>r.join('/')).sort());
 report.scenarios.forEach(verifyZsurvival1Scenario);assert.equal(report.scenarios.reduce((s,r)=>s+r.earnedClears,0),16);
 assert.equal(report.checks,888+report.scenarios.reduce((s,r)=>s+r.checks,0));assert.equal(report.speedPairs.length,12);
 assert.deepEqual(report.speedPairs.map(r=>r.name+'/'+r.seed).sort(),names.flatMap(n=>[1729,7331].map(s=>n+'/'+s)).sort());
 for(const pair of report.speedPairs){fields(pair,{semanticResultEqual:true});const rows=report.scenarios.filter(r=>r.name===pair.name&&r.seed===pair.seed).sort((a,b)=>a.speed-b.speed);
  assert.deepEqual(rows.map(r=>r.speed),[1,2]);for(const k of ['family','outcome','earnedClears','nativeBestFlags','nativeFormationLedger',
   'nativeAwardType','nativeAwardStage','nativeAwardWave','nativeRepicks','nativeVisitedStages','nativePartialBestFlags'])assert.deepEqual(rows[0][k],rows[1][k]);
  const delta=Math.abs((rows[0].nativeTicks||0)-(rows[1].nativeTicks||0));assert.equal(pair.nativeTickDelta,delta);
  if(rows[0].outcome==='win')integer(delta,0,60);
 }
 return {cases:24,speedPairs:12,earnedSurvivalClears:16,naturalLosses:4,syntheticControls:4};
}

export async function verifyZsurvival1CaseLog(row,{read,sha}){
 const bytes=await read(`tests/zsurvival1-logs/${row.name}-${row.speed}x-${row.seed}.log`);assert.equal(sha(bytes),row.logSha256);
 const raw=text(bytes),lines=raw.split('\n').filter(l=>l.startsWith('ZSURVIVAL1_RESULT '));assert.equal(lines.length,1);
 const{logSha256,resourceCapacityWarnings,...native}=row;assert.deepEqual(JSON.parse(lines[0].slice('ZSURVIVAL1_RESULT '.length)),native);assert.equal(resourceCapacityWarnings,0);
 assert(!/RuntimeError|memory access out of bounds|Too many (?:particle|emitters)|zombotany-survival:FAIL/.test(raw));
 const inputs=[...raw.matchAll(/^survival-input tick(\d+) seed(\d+) col(\d+) row(\d+) cost(\d+) sun(\d+)$/gm)].map(m=>m.slice(1).map(Number));
 if(row.name==='controls'||row.name==='no-action'){assert.equal(inputs.length,0);return;}
 assert.equal(inputs.length,row.nativeOrdinaryPlacements);const costs={1:50,32:100,3:50,5:175,2:150,17:50};let previous=50,lastTick=null;
 for(const[tick,seed,col,r,cost,sun]of inputs){assert.equal(cost,costs[seed]);integer(col,0,8);integer(r,0,4);integer(sun);
  assert(sun+cost-previous>=0,'Native post-purchase balances cannot imply negative income');previous=sun;
  if(lastTick!==null)integer(tick-lastTick,150);lastTick=tick;
 }
 assert.equal(inputs.reduce((s,r)=>s+r[4],0),row.nativeSunSpent);
}

export async function verifyZsurvival1BuildBindings({report,read,sha,engine,fullRunReport,productionBuildBytes}){
 fields(report,{status:'PASS',execution:'complete-production-engine',optimization:'O2',engineId:ENGINE,productionObjectCount:152,
  exitCode:0,failures:0,presentationControlsAvailable:true,developmentNoArt:false});
 assert.equal(engine.id,ENGINE);assert.equal(Object.keys(report.sourceSha256).length,888);assert.equal(Object.keys(report.productionObjectSha256).length,152);
 assert.deepEqual(report.sourceSha256,fullRunReport.sourceSha256);assert.deepEqual(report.productionObjectSha256,fullRunReport.productionObjectSha256);
 for(const[n,pin]of Object.entries(report.sourceSha256)){safe(n);assert(n.startsWith('source/'));assert.equal(sha(await read(n)),pin);}
 for(const[n,pin]of Object.entries(report.productionObjectSha256)){safe(n);digest(pin);assert(n.endsWith('.o'));}
 assert(CURRENT_NORMAL_RECEIPT_SHA256);assert.equal(sha(productionBuildBytes),CURRENT_NORMAL_RECEIPT_SHA256);assert.equal(report.productionBuildReceiptSha256,CURRENT_NORMAL_RECEIPT_SHA256);
 const normal=json(productionBuildBytes);fields(normal,{status:'PASS',exitCode:0,sourceUnchangedDuringBuild:true,sourceFiles:888});
 for(const suffix of ['js','wasm'])assert.equal(normal.outputs['build/pvz-portable.'+suffix].sha256,engine.artifacts[suffix+'Sha256']);
 const build=json(await read('tests/zsurvival1-build.json'));
 for(const k of ['sourceSha256','productionObjectSha256','productionBuildReceiptSha256','testArtifactSha256','testInputSha256','builderSha256','generatedHarnessSha256','policySha256','verificationContractSha256'])assert.deepEqual(report[k],build[k]);
 for(const[k,file]of Object.entries({builderSha256:'build-zsurvival1.py',runnerSha256:'test-zsurvival1.py',generatedHarnessSha256:'zsurvival1-harness.cpp',policySha256:'zsurvival1-policy.h',verificationContractSha256:'zsurvival1-verification-contract.json'}))assert.equal(report[k],sha(await read('tests/'+file)));
 const expected=fixtureInputs.filter(n=>n!=='build-zsurvival1.py').concat('zsurvival1-verification-contract.json');
 assert.deepEqual(Object.keys(build.testInputSha256).sort(),expected.sort());
 for(const[n,pin]of Object.entries(build.testInputSha256)){safe(n);assert.equal(sha(await read('tests/'+n)),pin);}
 assert.deepEqual(Object.keys(build.testArtifactSha256).sort(),['zsurvival1-engine.js','zsurvival1-engine.wasm']);
 for(const[n,pin]of Object.entries(build.testArtifactSha256))assert.equal(sha(await read('tests/'+n)),pin);assert(WebAssembly.validate(await read('tests/zsurvival1-engine.wasm')));
 assert.equal(report.nativeArtInputs,1027);assert.equal(report.assetFixtureSha256,sha(await read('tests/zsurvival1-assets.json')));
 const art=json(await read('tests/zsurvival1-native-art-inputs.json')),assets=json(await read('tests/zsurvival1-assets.json'));
 assert.equal(report.assetBundleId,assets.assetBundleId);assert.equal(art.assetBundleId,assets.assetBundleId);assert.equal(Object.keys(art.sourceInputs).length,1027);
 return build;
}

export async function verifyZsurvival1Prerequisite({read,sha}){
 const bytes=await read('tests/zsurvival1-earned-z1-fixture.json');assert.equal(sha(bytes),PREREQUISITE_SHA256);const fixture=json(bytes);
 fields(fixture,{schemaVersion:1,originEngineId:ENGINE,originNormalBuildReceiptSha256:'7ad141308c0faa719528cf4664e626cabd221d810d287f6f8740f8834a6edb74',
  earnedRecordIndex:15,earnedRecordValue:1,ordinaryMouseInputsOnly:true,realNativeTrophyCollected:true,binaryPatched:false,postStartStateEdits:false,countsAsSurvivalWin:false});
 assert.deepEqual(fixture.all100NativeChallengeRecords,Array.from({length:100},(_,i)=>i===15?1:0));
 for(const[n,pin]of Object.entries(fixture.files)){const b=await read('tests/'+safe(n));assert.equal(b.length,pin.bytes);assert.equal(sha(b),pin.sha256);}
 for(const[n,pin]of Object.entries(fixture.originFiles))assert.equal(sha(await read('tests/'+safe(n))),pin);
 const origin=json(await read('tests/zsurvival1-earned-z1-origin/result.json'));
 fields(origin,{family:'zsurvival1-original-z1-prerequisite',mode:16,profileIndex:15,outcome:'win',genuinelyEarnedOriginalZ1Clears:1,
  countedSurvivalClears:0,nativeAwardWave:20,nativeActualTrophyCollected:true,noAssignedUnlockCredits:true,silentHardware:true,audioDeviceOpened:false});
 assert.deepEqual(origin.nativeProfileRecordsBefore,Array(100).fill(0));assert.deepEqual(origin.nativeProfileRecordsAfter,fixture.all100NativeChallengeRecords);
 return {genuineOriginalZombotanyPrerequisite:true,prerequisiteSurvivalClears:0};
}

export async function verifyZsurvival1(options){
 const{report,read,sha,engine}=options,bytes=await read('tests/zsurvival1-results.json'),cbytes=await read('tests/zsurvival1-verification-contract.json');
 assert.deepEqual(report,json(bytes));assert(acceptedContractPins.has(sha(cbytes)),'Current Survival contract is not independently reviewed');
 const scenarios=report.scenarios.map(({logSha256,...row})=>row);
 assert(acceptedContentPins.has(sha(Buffer.from(JSON.stringify(canonical({...report,scenarios}))))),'Current actual Survival24 observations are not independently reviewed');
 const c=json(cbytes);fields(c,{schemaVersion:1,engineId:ENGINE,stage:'final-preregistered',sourceCount:888,productionObjectCount:152,mode:96,profileIndex:95,
  stageActorTotals:stageTotals,authoredActors:207,headTypes:types,nativeArtInputs:1027,hardwareAudio:false,speedPairNativeTickTolerance:60,finiteNativeTickLimit:600000});
 assert.deepEqual(c.matrix,ZSURVIVAL1_MATRIX);assert.deepEqual(c.independentStages,stages);assert.deepEqual(Object.keys(c.fixtureSha256).sort(),fixtureInputs.sort());
 for(const[n,pin]of Object.entries(c.fixtureSha256))assert.equal(sha(await read('tests/'+safe(n))),pin);
 fields(c.course,{flags:5,stages:5,wavesPerStage:10,startingSun:50,seedSlots:6,rows:5,initialMowers:5,nativeTransitionTicks:500,
  nativeInitialBank:deck,partialRecordSemantics:'native-best-flags-0-through-5',finalRecord:5,originalHeadsUnmodified:true});
 fields(c.player,{maximumSunflowers:8,cabbageColumns:[2,4],snowPeaColumn:3,wallNutColumn:5,visibleEnemyXMaximum:760,
  tallnutCherryX:520,ordinaryEmergencyX:160,squashFallbackX:620,inputCadenceTicks:150,noHiddenHealthWaveTimerOrRngInput:true});
 fields(c.checkpoints,{'save-combat':{stage:2,wave:10,aliveEnemiesMinimum:1,purpose:'active mid-course native save with retained lawn and original native future RNG left unsaved'},
  'save-transition':{stage:1,wave:10,transitionCounterMinimum:100,transitionCounterMaximum:400,purpose:'actual native500tick repick transition before the next chooser'},
  requiresExactCompleteGraph:true,rngSerializationClaim:false});
 fields(c.saveTransportLifecycleAmendment,{manualBoardResultAssignment:false,productionSourceChanged:false,
  policyStatsRostersCheckpointPhasesGraphAndWinBoundsChanged:false,actualNativeSaveCopyRequired:true});
 await verifyZsurvival1BuildBindings(options);await verifyZsurvival1SourceBounds(options);await verifyZsurvival1Prerequisite(options);
 const facts=verifyZsurvival1Matrix(report);for(const row of report.scenarios)await verifyZsurvival1CaseLog(row,{read,sha});
 assert.equal(engine.parent.artifacts.sourceSha256,ZSURVIVAL_PARENT_ARCHIVE_SHA256);
 return {...facts,sealedReport:acceptedReportPins.has(sha(bytes))};
}
