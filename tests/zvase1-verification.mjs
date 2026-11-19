// SPDX-License-Identifier: MIT
// Current finite Vasebreaker proof; Root independently reviewed all native cases.
import assert from 'node:assert/strict';
export const ACCEPTED_CONTRACT_SHA256 = 'd59a48a94de6d3cca123f28d7eb90633e26639ecf57949c98d3db43ac3195adc';
export const ACCEPTED_CONTENT_SHA256 = '88cda52a5240439760302df16e01212304c02bd73de34febaee40e6f08aabe70';
const ENGINE='0.2.6-web-zvase.1';
const CURRENT_NORMAL_RECEIPT_SHA256='7351dfbf72f989cddf155ac334b19e181bb898a86896817f6a26af5e1789c1dd';
const DESIGN_SHA='d272fc800143a9c9b0f3b72a843269745cd7456e33dc422f87ceb2e1c13675b7';
const names=['solution','alternate-replay','save-sequence','retry','release-loss','controls'];
export const ZVASE1_MATRIX=[1729,7331].flatMap(seed=>names.flatMap(name=>[1,2].map(speed=>[name,speed,seed])));
const vases=[23,25,26,25,30],enemies=[10,10,10,10,11],cards=[12,14,15,14,18];
const headLedgers=[[[26,10]],[[26,5],[27,3],[31,2]],[[26,7],[30,3]],[[26,5],[27,3],[29,2]],[[26,5],[27,1],[28,1],[29,1],[30,1],[31,2]]];
const phases=['untouched','mallet','packet','combat','transition'];
const fields=(actual,expected)=>{for(const[k,v]of Object.entries(expected))assert.deepEqual(actual[k],v,k);};
const json=b=>JSON.parse(Buffer.from(b).toString('utf8').replace(/^\uFEFF/,''));
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const safe=p=>{assert(typeof p==='string'&&!/[\\:\x00-\x1f]/.test(p)&&!p.startsWith('/')&&p.split('/').every(s=>s&&s!=='.'&&s!=='..'));return p;};
const digest=s=>assert(typeof s==='string'&&/^[a-f0-9]{64}$/.test(s));
const ints=(xs,count,min,max)=>{assert(Array.isArray(xs)&&xs.length===count);for(const n of xs)assert(Number.isSafeInteger(n)&&n>=min&&n<=max);};

export function verifyZVase1Controls(row){
 fields(row,{execution:'complete-production-engine',family:'synthetic-controls',name:'controls',mode:97,profileIndex:96,outcome:'controls-pass',earnedClears:0,syntheticActorSetup:true,silentHardware:true,audioDeviceOpened:false});
 for(const k of ['nativeClosedVasesWaitForPlayer','nativePauseGraphPreserved','nativeEmptyCellBreakRejected','nativeOneVaseOneCard','nativeDuplicateMalletRejected','nativePacketPickAndDropPreservesIdentity','nativeUnplantedPacketExpiresWithoutDuplication','all100NativeProfileRecordsPreserved'])assert.equal(row[k],true,k);
 fields(row,{nativeOriginalHeadTypes:[26,27,28,29,30,31],nativeOriginalBodyHealth:[270,270,500,270,270,270],nativeOriginalHelmetHealth:[0,1100,0,0,0,2200]});
 fields(row,{nativePresentationFamilyCardCount:7,nativePresentationCardProfile:96,nativePresentationCardPairChecks:21,nativePresentationHitBoundsChecks:9,nativePresentationTrophyDenominator:7,nativePresentationRetainedCardRois:6,nativePresentationSharedCachePreserved:6,nativePresentationHeadTypes:[26,27,28,29,30,31],nativePresentationRevealedVaseVariants:12,nativePresentationOrdinaryHeadNegativesRejected:19});
 assert(row.nativePresentationTrophyGlyphPixels>=10);
 ints(row.nativePresentationPortraitMatchedPixels,6,20,42000);ints(row.nativePresentationPortraitMatchPercentMilli,6,55000,100000);ints(row.nativePresentationOrdinaryMatchPercentMilli,6,0,54999);
 ints(row.nativePresentationVaseMatchedPixels,12,20,42000);ints(row.nativePresentationVaseMatchPercentMilli,12,55000,100000);ints(row.nativePresentationVaseOrdinaryMatchPercentMilli,12,0,54999);
 assert(row.nativePresentationThumbnailMatchedPixels>=20&&row.nativePresentationThumbnailMatchPercentMilli>=55000&&row.nativePresentationThumbnailOrdinaryMatchPercentMilli<55000);
 for(const k of ['nativePresentationNativeSixHeadFactoryReferences','nativePresentationLockedHoverWithinCanvas','nativePresentationOriginalUnlockAndOwnClear','nativePresentationAll100ProfileRecordsRestored','nativePresentationSyntheticZeroCredit'])assert.equal(row[k],true,k);
 return {syntheticControls:true,earnedClears:0};
}

export function verifyZVase1Matrix(report){
 assert.equal(report.scenarios.length,24);assert.deepEqual(report.scenarios.map(r=>[r.name,r.speed,r.seed]),ZVASE1_MATRIX);
 let clears=0,losses=0,retryLosses=0,synthetic=0;
 for(const row of report.scenarios){
  fields(row,{execution:'complete-production-engine',mode:97,profileIndex:96,silentHardware:true,audioDeviceOpened:false,resourceCapacityWarnings:0});
  assert(Number.isSafeInteger(row.checks)&&row.checks>50);
  if(row.name==='controls'){verifyZVase1Controls(row);synthetic++;continue;}
  fields(row,{family:'zvase1-five-puzzles',visibleOnlyRootOwnedPolicy:true,hiddenBrownPayloadHealthTimerStageOrRngPolicyReads:false,minimumDecisionCadenceTicks:30,postStartActorResourceTimerStageOrRngEdits:false,nativeAllLiveZombiesPlantHeadOnly:true,nativeFreePacketMousePlanting:true,nativeMenuOnlySaveLifecycle:true});
  assert(row.nativeLiveHeadChecks>0);assert(row.nativeObservedPlantHeadTypes.length>0&&row.nativeObservedPlantHeadTypes.every(t=>[26,27,28,29,30,31].includes(t)));assert.deepEqual(row.nativeProfileRecordsBefore,Array.from({length:100},(_,i)=>Number(i===15)));
  assert.equal(row.nativeProfileRecordsAfter.length,100);for(let i=0;i<100;i++)if(i!==96)assert.equal(row.nativeProfileRecordsAfter[i],row.nativeProfileRecordsBefore[i]);
  if(['release-loss','retry'].includes(row.name)){fields(row,{nativeDefeatBoundaryObservations:1,nativeOriginalDefeatCutsceneCompleted:true});assert(Number.isSafeInteger(row.nativeDefeatCutsceneWaitUpdates)&&row.nativeDefeatCutsceneWaitUpdates>0&&row.nativeDefeatCutsceneWaitUpdates<=2000);}
  if(row.name==='release-loss'){fields(row,{outcome:'native-loss',earnedClears:0,nativeNaturalLosses:1,nativePlacements:0,nativeSunClicks:0,nativeSunSpent:0});assert.equal(row.nativeProfileRecordsAfter[96],0);assert(row.nativeTicks===row.nativeLossTicks&&row.nativeLossTicks>0&&row.nativeWinningCourseTicks===0);losses++;continue;}
  const n=row.name==='alternate-replay'?2:1;clears+=n;
  fields(row,{outcome:'win',earnedClears:n,boardsSolved:5*n,nativeAwardType:n===2?18:8,nativeAwardTypes:n===2?[8,18]:[8],nativeAwardBoard:4,nativeAwardPots:0,nativeAwardEnemies:0});
  assert.equal(row.nativeProfileRecordsAfter[96],n);assert.deepEqual(row.nativeBoardHeadLedgers,Array.from({length:n},()=>headLedgers).flat());assert.equal(row.nativeTicks,row.nativeWinningCourseTicks+row.nativeLossTicks);assert.deepEqual(row.nativeBoardVaseCounts,Array.from({length:n},()=>vases).flat());assert.deepEqual(row.nativeBoardEnemyCounts,Array.from({length:n},()=>enemies).flat());assert.deepEqual(row.nativeBoardCardCounts,Array.from({length:n},()=>cards).flat());
  assert(row.nativePlacements>0&&row.nativePacketLifetimeChecks>0&&row.nativeTicks>0&&row.nativeTicks<400000*n);
  assert.equal(row.nativeWinningCourseTicks,row.nativeCourseBoardTickSum+480*n,'Four original120-tick transitions per full course');
  assert.equal(row.nativeSunCollected,row.nativeSunClicks*25);assert.equal(row.nativeSunSpent,row.nativeCherryPurchases*150);assert(row.nativeSunCollected>=0&&row.nativeSunCollected<=750*n&&row.nativeCherryPurchases>=0&&row.nativeCherryPurchases<=5*n);assert(row.nativePlacements<=73*n+row.nativeCherryPurchases);
  assert.equal(row.nativeVaseMouseInputs,129*n+row.nativeFailedAttemptVaseMouseInputs);
  if(row.name==='retry'){fields(row,{nativeActualRetry:true,nativeRetryLosses:1,nativeNaturalLosses:1});assert(row.nativeRetryLossTicks===row.nativeLossTicks&&row.nativeLossTicks>0&&row.nativeFailedAttemptVaseMouseInputs>0);retryLosses++;}
  else fields(row,{nativeActualRetry:false,nativeRetryLosses:0,nativeNaturalLosses:0,nativeLossTicks:0,nativeRetryLossTicks:0,nativeFailedAttemptVaseMouseInputs:0});
  assert.deepEqual(row.checkpoints.map(p=>p.phase),row.name==='save-sequence'?phases:[]);
  for(const cp of row.checkpoints){fields(cp,{graphPreserved:true,nativeMenuLeaveCardContinue:true,nativeSavedFilePreserved:true});assert(cp.beforeGraph.length>200);assert.equal(cp.beforeGraph,cp.afterGraph);
   const phase=phases.indexOf(cp.phase);assert.equal(cp.board,[0,1,2,3,3][phase]);
   if(cp.phase==='mallet')assert(cp.pendingMallet&&cp.pots>0);
   if(cp.phase==='packet')assert(cp.packets>0);
   if(cp.phase==='combat')assert(cp.enemies>0&&cp.projectiles>0);
   if(cp.phase==='transition')assert(cp.pots===0&&cp.enemies===0&&cp.transitionCounter>=1&&cp.transitionCounter<=120);
  }
 }
 assert.deepEqual([clears,losses,retryLosses,synthetic],[20,4,4,4]);verifyZVase1SpeedPairs(report);
 assert.equal(report.checks,891+report.scenarios.reduce((n,r)=>n+r.checks,0));
 return {cases:24,speedPairs:12,earnedFiveBoardClears:20,naturalLosses:4,genuineRetryLosses:4,zeroCreditControls:4};
}

export function verifyZVase1SpeedPairs(report){
 const expected=[1729,7331].flatMap(seed=>names.map(name=>[name,seed]));
 assert.deepEqual(report.speedPairs.map(p=>[p.name,p.seed]),expected,'Exact12 name/seed pairs without omissions/duplicates');
 for(const pair of report.speedPairs){
  const rows=[1,2].map(speed=>report.scenarios.filter(r=>r.name===pair.name&&r.seed===pair.seed&&r.speed===speed));assert(rows.every(v=>v.length===1));const[a,b]=rows.map(v=>v[0]);
  for(const k of ['outcome','earnedClears','boardsSolved','nativeBoardVaseCounts','nativeBoardEnemyCounts','nativeBoardCardCounts','nativeBoardHeadLedgers','nativeAwardTypes','nativeProfileRecordsBefore','nativeProfileRecordsAfter','nativeActualRetry'])assert.deepEqual(a[k],b[k],`Actual native semantic speed equality ${pair.name}/${pair.seed}/${k}`);
  const delta=Math.abs((a.nativeTicks??0)-(b.nativeTicks??0));assert(Number.isSafeInteger(delta)&&delta<=120);assert.equal(pair.nativeTickDelta,delta);assert.equal(pair.semanticResultEqual,true);
 }
 return true;
}

export function zVase1CanonicalBytes(report){const scenarios=report.scenarios.map(({logSha256,...row})=>row);return Buffer.from(JSON.stringify(canonical({...report,scenarios})));}
export async function verifyZVase1CaseLog(row,{read,sha}){
 safe(row.name);assert([1,2].includes(row.speed)&&[1729,7331].includes(row.seed));const name=`tests/zvase1-logs/${row.name}-${row.speed}x-${row.seed}.log`,log=Buffer.from(await read(name));assert.equal(sha(log),row.logSha256);
 const value=log.toString('utf8'),markers=value.split(/\r?\n/).filter(s=>s.startsWith('ZVASE1_RESULT '));assert.equal(markers.length,1);const{logSha256,resourceCapacityWarnings,...native}=row;assert.deepEqual(JSON.parse(markers[0].slice('ZVASE1_RESULT '.length)),native);assert.equal(resourceCapacityWarnings,0);assert(!/Too many particle (emitters|systems)|Too many particles/.test(value));
 if(row.name==='save-sequence')assert(value.split('Loaded save game (v4)').length-1>=5,'Five actual native v4 loader calls are required');
 return true;
}

export async function verifyZVase1({report,read,sha,engine,fullRunReport,productionBuildBytes}){
 const bytes=await read('tests/zvase1-results.json'),contractBytes=await read('tests/zvase1-verification-contract.json');assert.deepEqual(report,json(bytes));
 const scenarios=report.scenarios.map(({logSha256,...row})=>row);
 const c=json(contractBytes);fields(c,{engineId:ENGINE,sourceCount:891,productionObjectCount:153,mode:97,profileIndex:96,stage:'final-preregistered',boardCount:5,boardVaseCounts:vases,boardEnemyCounts:enemies,boardCardCounts:cards,hardwareAudio:false,nativeArtInputs:1027});assert.deepEqual(c.matrix,ZVASE1_MATRIX);
 assert.equal(sha(await read('tests/zvase1-board-design.json')),DESIGN_SHA);
 fields(report,{status:'PASS',execution:'complete-production-engine',optimization:'O2',engineId:ENGINE,productionObjectCount:153,exitCode:0,failures:0,presentationControlsAvailable:true,developmentNoArt:false});assert.equal(engine.id,ENGINE);
 assert.equal(Object.keys(report.sourceSha256).length,891);assert.equal(Object.keys(report.productionObjectSha256).length,153);assert.deepEqual(report.sourceSha256,fullRunReport.sourceSha256);assert.deepEqual(report.productionObjectSha256,fullRunReport.productionObjectSha256);assert.equal(report.productionBuildReceiptSha256,CURRENT_NORMAL_RECEIPT_SHA256);assert.equal(sha(productionBuildBytes),CURRENT_NORMAL_RECEIPT_SHA256);const normal=json(productionBuildBytes);fields(normal,{status:'PASS',exitCode:0,sourceFiles:891,sourceUnchangedDuringBuild:true});for(const ext of ['js','wasm'])assert.equal(normal.outputs['build/pvz-portable.'+ext].sha256,engine.artifacts[ext+'Sha256']);
 for(const[path,pin]of Object.entries(report.sourceSha256)){safe(path);digest(pin);assert(path.startsWith('source/'));assert.equal(sha(await read(path)),pin);}
 const build=json(await read('tests/zvase1-build.json'));
 for(const k of ['sourceSha256','productionObjectSha256','productionBuildReceiptSha256','testArtifactSha256','testInputSha256','builderSha256','generatedHarnessSha256','verificationContractSha256'])assert.deepEqual(report[k],build[k]);
 const expectedInputs=Object.keys(c.fixtureSha256).filter(n=>n!=='build-zvase1.py').concat('zvase1-verification-contract.json');assert.deepEqual(Object.keys(build.testInputSha256).sort(),expectedInputs.sort());
 for(const[name,pin]of Object.entries(c.fixtureSha256)){safe(name);assert.equal(sha(await read('tests/'+name)),pin);}
 for(const[k,n]of Object.entries({builderSha256:'build-zvase1.py',runnerSha256:'test-zvase1.py',generatedHarnessSha256:'zvase1-harness.cpp',policySha256:'zvase1-policy.h',verificationContractSha256:'zvase1-verification-contract.json'}))assert.equal(report[k],sha(await read('tests/'+n)));
 assert.equal(c.player.rootPolicySha256,report.policySha256);
 for(const[name,pin]of Object.entries(build.testInputSha256)){safe(name);assert.equal(sha(await read('tests/'+name)),pin);}
 for(const[name,pin]of Object.entries(build.testArtifactSha256)){safe(name);assert.equal(sha(await read('tests/'+name)),pin);}assert(WebAssembly.validate(await read('tests/zvase1-engine.wasm')));
 for(const row of report.scenarios)await verifyZVase1CaseLog(row,{read,sha});
 const facts=verifyZVase1Matrix(report);
 assert(ACCEPTED_CONTRACT_SHA256&&ACCEPTED_CONTENT_SHA256,'Root review of actual native24 is still required; acceptance pins are unset');assert.equal(sha(contractBytes),ACCEPTED_CONTRACT_SHA256);assert.equal(sha(zVase1CanonicalBytes(report)),ACCEPTED_CONTENT_SHA256);return facts;
}
