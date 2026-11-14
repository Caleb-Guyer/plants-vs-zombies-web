// SPDX-License-Identifier: MIT
// Independent acceptance of the production-linked plant, finite course and
// earned regular-play unlock. Development probes never satisfy this gate.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CURRENT_ENGINE_ID,CURRENT_SOURCE_COUNT,CURRENT_OBJECT_COUNT,reconstructDoubleSources}
 from './native-release-context.mjs';

// One reviewed O2 run: 48 actual native cases, 24 speed pairs and 11,782,636
// checks against the unchanged normal-production receipt 7cf4b25a... . Raw
// logs remain independently bound below; CI may emit different diagnostic
// lines, but its complete native JSON observations must retain this identity.
const acceptedContractPins=new Set(['dfa82fd954932ebd374e073fcd7a52273aac79451763b4e311c9458024e6e320']);
const acceptedReportPins=new Set(['3ec7ccda1a5f1b9c1a5feb33c4e0fd63561d6a0014ade4f2376584ddd9efee98']);
const acceptedReportContentPins=new Set(['a871f4ed715d46bf158c33d74ad4798556c236b363c7bc9b65a0618654c604bb']);
const names=['normal','staggered','save-windup','save-push','save-recovery','retry','replay','no-action',
 'mechanics','resistance','collection','presentation'];
export const GUST_BLOOM_MATRIX=[1729,7331].flatMap(seed=>names.flatMap(name=>[1,2].map(speed=>[name,speed,seed])));
const identity=row=>[row.name,row.speed,row.seed].join('/');
const text=bytes=>Buffer.from(bytes).toString('utf8').replace(/\r\n?/g,'\n');
const json=bytes=>JSON.parse(text(bytes).replace(/^\uFEFF/,''));
const fields=(actual,expected)=>{for(const [name,value]of Object.entries(expected))assert.deepEqual(actual[name],value,name);};
const integer=(value,min=0,max=Number.MAX_SAFE_INTEGER)=>assert(Number.isSafeInteger(value)&&value>=min&&value<=max);
const digest=value=>assert(typeof value==='string'&&/^[a-f0-9]{64}$/.test(value));
const safeName=name=>{assert(typeof name==='string'&&name&&!name.startsWith('/')&&!/[\x00-\x1f\\:]/.test(name));
 assert(name.split('/').every(part=>part&&part!=='.'&&part!=='..'));return name;};
const canonical=value=>Array.isArray(value)?value.map(canonical):value!==null&&typeof value==='object'?
 Object.fromEntries(Object.keys(value).sort().map(name=>[name,canonical(value[name])])):value;
const nativeStats={seed:78,cost:150,health:300,recharge:1500,range:240,windupTicks:35,visibleGustTicks:60,
 cooldownTicks:450,pushTicks:24,lightPushPixels:64,heavyPushPixels:16,mobileRecoveryTicks:2000,rightCap:760};
const course={startingSun:0,startingPlants:15,mowers:0,formations:6,authoredZombies:29,nativeImpChildrenMaximum:1,
 openingDelay:700,formationInterval:1800,bankSize:10,openingPackets:4,supplyInterval:200,packetQuota:32};
const formations=[[[0,1,760],[0,3,760]],[[2,0,800],[2,2,800],[2,4,800]],
 [[0,0,800],[6,1,800],[0,2,840],[6,3,800],[0,4,800]],
 [[7,0,800],[4,1,800],[2,2,800],[4,3,800],[7,4,800]],
 [[0,0,800],[0,1,800],[0,2,800],[0,3,800],[0,4,800],[2,1,860],[2,3,860]],
 [[4,0,800],[7,1,800],[23,2,850],[7,3,800],[4,4,800],[0,0,880],[0,4,880]]];
const ledger=formations.map(wave=>wave.map(([type,row])=>[type,row,1]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]));
const supply=[78,0,78,7,3,78,2,17];

export function verifyGustBloomReportIdentity({reportBytes,sha}){
 const report=json(reportBytes);assert(Array.isArray(report.scenarios)&&report.scenarios.length===48);
 const scenarios=report.scenarios.map(row=>{digest(row.logSha256);const {logSha256,...native}=row;return native;});
 assert(acceptedReportContentPins.has(sha(Buffer.from(JSON.stringify(canonical({...report,scenarios}))))),
  'No independently reviewed complete actual Gust-bloom matrix is accepted yet');
 return {report,sealedReport:acceptedReportPins.has(sha(reportBytes))};
}

export async function verifyGustBloomSourceBounds({read,sha,engine}){
 const parent=await reconstructDoubleSources({referenceBytes:fs.readFileSync(new URL('./fixtures/gust1-parent-reference.json',import.meta.url)),read,sha,engine});
 assert.equal(parent.files.size,872);
 for(const path of ['src/Lawn/Plant.h','src/Lawn/Zombie.h','src/Lawn/Board.h','src/Lawn/Challenge.h','src/LawnApp.h',
  'src/Lawn/System/SaveGame.cpp','src/Lawn/System/PlayerInfo.cpp','src/Lawn/System/PlayerInfo.h'])
  assert.deepEqual(Buffer.from(await read('source/'+path)),parent.files.get(path),'Exact existing saved class/serializer: '+path);
 let enums=text(await read('source/src/ConstEnums.h'));
 enums=enums.replace('\tSEED_GUSTBLOOM = 78,\n','').replace('\tGAMEMODE_CHALLENGE_HEADWIND = 92,\n','').replace('\tNUM_GAME_MODES = 93','\tNUM_GAME_MODES = 92');
 assert.equal(enums,text(parent.files.get('src/ConstEnums.h')),'Only the next sparse seed and stable mode IDs are appended');
 const header=text(await read('source/src/Lawn/System/GustBloom.h'));
 for(const [name,value]of Object.entries({kCost:150,kHealth:300,kRecharge:1500,kRange:240,kWindupTicks:35,
  kGustFrames:60,kPlantCooldown:450,kPushTicks:24,kLightPushPixels:64,kHeavyPushPixels:16,kRecoveryTicks:nativeStats.mobileRecoveryTicks,kRightCap:760}))
  assert(header.includes(`${name} = ${value};`),'Fixed independently reviewed ability rule: '+name);
 const ability=text(await read('source/src/Lawn/System/GustBloom.cpp'));
 assert(!/\b(?:TakeDamage|ApplyChill|HitIceTrap)\s*\(/.test(ability),'Wind does not copy another plant damage/freeze ability');
 assert(!/\.(?:mBodyHealth|mBodyMaxHealth|mHelmHealth|mShieldHealth|mChilledCounter|mIceTrapCounter|mButteredCounter|mVelX)\s*[+*/-]?=/.test(ability),
  'The ability never changes original health, armor, cold, immobilization or walking statistics');
 for(const exact of ['zombie.mZombieType == ZOMBIE_BOSS ||','zombie.mBossStompCounter = 0;',
  'zombie.mShieldType == SHIELDTYPE_LADDER && zombie.mShieldHealth > 0',
  'zombie.mShieldType == SHIELDTYPE_DOOR && zombie.mShieldHealth > 0',
  'zombie.mHelmType != HELMTYPE_NONE && zombie.mHelmHealth > 0',
  'zombie->mBossStompCounter = kPushTicks;','zombie->mBossHeadCounter = kRecoveryTicks;',
  'zombie.mBoard->mPaused || zombie.mBoard->mTimeStopCounter > 0'])assert(ability.includes(exact),exact);
 let zombie=text(await read('source/src/Lawn/Zombie.cpp'));
 for(const addition of ['#include "System/GustBloom.h"\n','#include "System/GustChallenge.h"\n',
  '        GustBloom::UpdateZombie(*this);\n','    if (GustChallenge::IsMode(mApp->mGameMode)) return false;\n']){
  assert.equal(zombie.split(addition).length,2);zombie=zombie.replace(addition,'');
 }
 assert.equal(zombie,text(parent.files.get('src/Lawn/Zombie.cpp')),'All original enemy mechanics remain byte-equivalent apart from the bounded ability/award hooks');
 let method='';const uses=[];
 for(const line of zombie.split('\n')){
  const declaration=line.match(/^\w[\w:*&<> ]*\bZombie::(\w+)\(/);if(declaration)method=declaration[1];
  if(/mBoss(?:Stomp|Head)Counter/.test(line))uses.push({method,line:line.trim()});
 }
 assert.equal(uses.length,13);assert(uses.every(use=>['ZombieInitialize','BossRVLanding','BossStompAttack','BossHeadAttack','UpdateBoss'].includes(use.method)),
  'Original stomp/head-counter reads belong only to boss initialization and boss methods');
 for(const path of ['src/Lawn/Plant.h','src/Lawn/Zombie.h','src/Lawn/Board.h'])assert(!text(await read('source/'+path)).includes('GustBloom'));
 const challengeHeader=text(await read('source/src/Lawn/System/GustChallenge.h'));
 for(const [name,value]of Object.entries({kProfileIndex:91,kRulesVersion:1,kStartingSun:0,kWaveCount:6,kLargestFormation:8,
  kOpeningDelay:700,kFormationInterval:1800,kBankSize:10,kOpeningPackets:4,kPacketCount:32,kSupplyInterval:200}))assert(challengeHeader.includes(`${name} = ${value};`));
 assert(challengeHeader.includes('kActive = static_cast<ChallengeState>(144)'));
 assert(challengeHeader.includes('kFinished = static_cast<ChallengeState>(145)'));
 assert(text(await read('source/src/LawnApp.cpp')).includes('return GustBloom::IsUnlocked(this);'));
 assert(text(await read('source/src/Lawn/System/DeckPresets.h')).includes('seed.mSeed == 78 ? 51 : seed.mSeed'));
 const art=text(await read('source/src/Lawn/System/GustBloomArt.cpp'));
 for(const component of ['reanim/Blover_head','reanim/Blover_head2','reanim/Cabbagepult_head','reanim/PeaShooter_frontleaf',
  'reanim/PeaShooter_stalk_bottom','reanim/PeaShooter_stalk_top','reanim/puff_1','reanim/puff_7'])assert(art.includes(component));
 assert(art.includes('const float phase = active && !cardboard ? carrier.mAnimTime'));
 const label=art.match(/std::string LevelLabel\(int\)\s*\{([^}]+)\}/);
 assert(label);assert.equal(label[1].replace(/\s+/g,''),'return"Headwind";',
  'The native footer contains only the level title; the stock progress meter reports the waves');
 return parent;
}

export async function verifyGustBloomBuildBindings({report,read,sha,engine,fullRunReport,productionBuildBytes}){
 fields(report,{execution:'complete-production-engine',optimization:'O2',engineId:CURRENT_ENGINE_ID,mode:92,profileIndex:91,
  productionObjectCount:CURRENT_OBJECT_COUNT,failures:0,exitCode:0,presentationControlsAvailable:true,developmentNoArt:false});
 assert.equal(CURRENT_SOURCE_COUNT,878);assert.equal(CURRENT_OBJECT_COUNT,147);
 assert.equal(Object.keys(report.sourceSha256).length,878);assert.equal(Object.keys(report.productionObjectSha256).length,147);
 assert.deepEqual(report.sourceSha256,fullRunReport.sourceSha256);assert.deepEqual(report.productionObjectSha256,fullRunReport.productionObjectSha256);
 for(const [name,pin]of Object.entries(report.sourceSha256)){safeName(name);assert(name.startsWith('source/'));digest(pin);assert.equal(sha(await read(name)),pin,name);}
 for(const [name,pin]of Object.entries(report.productionObjectSha256)){safeName(name);digest(pin);assert(name.endsWith('.o'));}
 const normal=json(productionBuildBytes);fields(normal,{status:'PASS',exitCode:0,sourceUnchangedDuringBuild:true,sourceFiles:878});
 assert.equal(report.productionBuildReceiptSha256,sha(productionBuildBytes));
 for(const snapshot of ['source-before.json','source-after.json']){
  const values=json(await read('logs/'+snapshot));
  assert.deepEqual(Object.fromEntries(Object.entries(values).map(([name,pin])=>['source/'+safeName(name),pin])),report.sourceSha256,
   'Every final source is bound to both sides of the ordinary production build: '+snapshot);
 }
 for(const suffix of ['js','wasm'])assert.equal(normal.outputs['build/pvz-portable.'+suffix].sha256,engine.artifacts[suffix+'Sha256']);
 const build=json(await read('tests/gust-bloom-build.json'));
 for(const name of ['execution','optimization','productionObjectCount','productionBuildReceiptSha256','generatedHarnessSha256',
  'builderSha256','policySha256','controlSha256','verificationContractSha256','testInputSha256','testArtifactSha256','sourceSha256','productionObjectSha256'])
  assert.deepEqual(report[name],build[name],'One current complete native driver: '+name);
 for(const [field,name]of Object.entries({generatedHarnessSha256:'gust-bloom-harness.cpp',builderSha256:'build-gust-bloom.py',
  runnerSha256:'test-gust-bloom.py',policySha256:'gust-bloom-policy.h',controlSha256:'gust-bloom-controls.h',
  verificationContractSha256:'gust-bloom-verification-contract.json'}))assert.equal(report[field],sha(await read('tests/'+name)),name);
 assert.deepEqual(Object.keys(build.testInputSha256).sort(),['gust-bloom-harness.cpp','gust-bloom-policy.h',
  'gust-bloom-verification-contract.json','gust-bloom-controls.h','gust-bloom-battles.h','gust-bloom-collection-controls.h',
  'gust-bloom-earned-collection.h','test-gust-bloom.py','gust-bloom-native-art-inputs.json','gust-bloom-assets.json',
  'test-pool-panic.py','gust-bloom-presentation-controls.h'].sort(),'Exact executed fixture set');
 assert.deepEqual(Object.keys(report.testArtifactSha256).sort(),['gust-bloom-engine.js','gust-bloom-engine.wasm']);
 for(const [name,pin]of Object.entries(build.testInputSha256)){safeName(name);assert(!name.includes('/'));digest(pin);assert.equal(sha(await read('tests/'+name)),pin,name);}
 for(const suffix of ['js','wasm'])assert.equal(sha(await read('tests/gust-bloom-engine.'+suffix)),report.testArtifactSha256['gust-bloom-engine.'+suffix]);
 assert(WebAssembly.validate(await read('tests/gust-bloom-engine.wasm')));return build;
}

export async function verifyGustBloomCaseLog(row,{read,sha}){
 assert(GUST_BLOOM_MATRIX.some(([name,speed,seed])=>identity(row)===identity({name,speed,seed})));
 const name=`tests/gust-bloom-logs/${row.name}-${row.speed}x-${row.seed}.log`,bytes=await read(name);
 digest(row.logSha256);assert.equal(sha(bytes),row.logSha256,name);
 const raw=text(bytes),records=raw.split('\n').filter(line=>line.startsWith('GUST_BLOOM_RESULT '));assert.equal(records.length,1);
 const diagnostics=raw.split('\n').filter(line=>!line.startsWith('GUST_BLOOM_RESULT ')).join('\n');
 assert(!/Too many (?:particle|emitters)|DataArray.*(?:full|exhaust|capacity)|(?:particle|reanimation).*capacity|memory access out of bounds|RuntimeError|gust-bloom:FAIL/i.test(diagnostics));
 const actual=JSON.parse(records[0].slice('GUST_BLOOM_RESULT '.length));
 const {logSha256,resourceCapacityWarnings,...observed}=row;assert.deepEqual(actual,observed,'Complete actual raw JSON, excluding only runner-added log metadata');
 fields(row,{resourceCapacityWarnings:0});return actual;
}

export function verifyGustBloomCheckpoint(cp){
 fields(cp,{performed:true,graphPreserved:true});assert.equal(cp.beforeGraph,cp.afterGraph);assert(cp.beforeGraph.length>100);
 const parts=cp.beforeGraph.split(';'),head=parts.shift().split(':').map(Number);assert.equal(head.length,21);head.forEach(value=>assert(Number.isFinite(value)));
 assert.equal(head[1],0);assert.equal(head[5],144);assert.equal(head[9],1);assert.equal(head[13],10);
 const records={a:[],snapshot:[],p:[],z:[],g:[],s:[],c:[],b:[],r:[]};
 const widths={snapshot:54,p:42,z:27,g:13,s:10,c:5,b:8,r:8};
 for(const part of parts){const [tag,...tokens]=part.split(',');assert(Object.hasOwn(records,tag));
  if(tag==='a'){assert.equal(tokens.length,7);for(const i of [0,1,2,3,5])assert(Number.isFinite(Number(tokens[i])));for(const i of [4,6])assert(/^(?:[a-f0-9]{2})*$/.test(tokens[i]));records.a.push(tokens);}
  else {assert.equal(tokens.length,widths[tag]);const values=tokens.map(Number);assert(values.every(Number.isFinite));records[tag].push(values);}}
 assert.equal(records.snapshot.length,1);assert.equal(records.b.length,10);assert.equal(records.a.length,1);
 for(const values of records.p){integer(values[0],1);integer(values[2],0,8);integer(values[3],0,4);integer(values[4],1);}
 if(cp.kind==='save-windup'){
  integer(cp.plant,1);integer(cp.windup,1,35);const plant=records.p.find(values=>values[0]===cp.plant);
  assert(plant);assert.equal(plant[1],78);assert.equal(plant[10],cp.windup);assert.equal(plant[8],cp.plume);assert.equal(plant[7],cp.cooldown);
 }else{
  assert(['save-push','save-recovery'].includes(cp.kind));integer(cp.zombie,1);integer(cp.recovery,1,nativeStats.mobileRecoveryTicks);
  const actor=records.z.find(values=>values[0]===cp.zombie);assert(actor);assert.equal(actor[25],cp.push);assert.equal(actor[26],cp.recovery);
  if(cp.kind==='save-push')integer(cp.push,1,24);else assert(cp.push<=0);
 }
 return records;
}

export function verifyGustBloomScenario(row){
 assert(names.includes(row.name));assert([1,2].includes(row.speed)&&[1729,7331].includes(row.seed));integer(row.checks,21);
 fields(row,{execution:'complete-production-engine',mode:92,profileIndex:91,silentHardware:true,audioDeviceOpened:false});
 if(['mechanics','resistance','collection','presentation'].includes(row.name)){
  fields(row,{family:'synthetic-controls',outcome:'controls-pass',syntheticActorSetup:true,profileCredits:0,countedEarnedWins:0,all100ProfileRecordsPreserved:true});
  if(row.name==='mechanics'){
   fields(row,{nativeIdleFrames:120,nativeRangeBoundaryQueries:10,nativeWindupSaveGraphExact:true,nativePushSaveGraphExact:true,
    nativeRecoverySaveGraphExact:true,naturalNoDamageOrCold:true,targetLeavesWindupCancelled:true,syntheticTargetInterruptionSetup:true,
    nativeChilledStackCannotPin:true,directImpulseNativeCalls:24,directSmoothStepSamples:24,syntheticDirectImpulseSetup:true,
    directRightCapMilliPixels:760000,initialWindowPushCount:1,stackedPushCount:4});
   integer(row.naturalWindupTicks,35,36);integer(row.naturalPushFramesObserved,22,25);
   integer(row.directLightPushMilliPixels,63990,64010);integer(row.minimumStackedPushGapTicks,2000);
   integer(row.initialWindowNetForwardMilliPixels,1);integer(row.stackedNetForwardMilliPixels,1);
   const probe=row.nativeSteadyRecoveryProbe;
   fields(probe,{naturalCandidates:64,nativeChillRefreshedWithoutDamage:true,nativeVelocityAssigned:false,
    nativeVelocityUnchanged:true,nativeBiteTargetsAbsent:true,nativeEatingObservations:0,
    positiveEveryMatchedPeriod:true,retainsOneThirdNativeProgress:true});
   integer(probe.naturalVelocityMilli,230,250);assert.equal(probe.matchedPushEndTicks.length,4);
   assert.equal(probe.matchedPushEndPositionsMilli.length,4);assert.equal(probe.matchedPhaseAdvancesMilli.length,3);
   const intervals=probe.matchedPushEndTicks.slice(1).map((value,i)=>value-probe.matchedPushEndTicks[i]);
   intervals.forEach(value=>integer(value,2000));assert.equal(row.minimumStackedPushGapTicks,Math.min(...intervals));
   assert.equal(probe.matchedNativeTicks,probe.matchedPushEndTicks[3]-probe.matchedPushEndTicks[0]);
   const advances=probe.matchedPushEndPositionsMilli.slice(1).map((value,i)=>probe.matchedPushEndPositionsMilli[i]-value);
   advances.forEach(value=>integer(value,1));assert.deepEqual(probe.matchedPhaseAdvancesMilli,advances);
   assert.equal(probe.nativeWithGustAdvanceMilli,advances.reduce((sum,value)=>sum+value,0));
   assert.equal(row.stackedNetForwardMilliPixels,probe.nativeWithGustAdvanceMilli);
   integer(probe.nativeNoGustAdvanceMilli,1);assert(probe.nativeWithGustAdvanceMilli*3>=probe.nativeNoGustAdvanceMilli,
    'Matched three complete periods retain at least one third of the same natively chilled walker movement');
  }
  if(row.name==='resistance'){
   fields(row,{nativeWeightMatrixRows:35,syntheticTypeProjection:true,nativeIntactGearCases:4,nativeRemovedGearCases:3,
    nativeBossGuardPreserved:true,groundedBiomeQueries:4,nativeFreezeCancelPush:true,nativeFreezeNoLatentPush:true,
    nativeFreezeRecoveryPaused:true,nativeButterCancelPush:true,nativeButterNoLatentPush:true,nativeButterRecoveryPaused:true});
   const light=new Set([0,1,2,5,8,9,19,24,33,34]),heavy=new Set([4,6,7,21]);
   assert.deepEqual(row.nativeWeightMatrix,Array.from({length:35},(_,type)=>[type,light.has(type)?64:heavy.has(type)?16:0]));
   assert.equal(row.actualHeavyImpulseMilliPixels.length,4);row.actualHeavyImpulseMilliPixels.forEach(value=>integer(value,15990,16010));
   assert.equal(row.naturalThawTicks.length,2);row.naturalThawTicks.forEach(value=>integer(value,298,600));
  }
  return;
 }
 const loss=row.name==='no-action',replay=row.name==='replay',retry=row.name==='retry',credits=loss?0:replay?2:1;
 fields(row,{family:'headwind',outcome:loss?'native-loss':'win',profileCredits:credits,nativeTwentiethBonusCardInput:true,
  ordinaryNativeMouseInputsOnly:true,visibleOnlyPolicy:true,postStartHPActorStageTimeOrRNGEdits:false,observerNativeTicks:2,
  minimumInputCadenceTicks:150,all100ProfileRecordsPreservedExceptEarnedCredit:true,failureAndRetry:retry,nativeReplayCompleted:replay});
 assert.equal(row.nativeProfileRecordsBefore.length,100);assert.equal(row.nativeProfileRecordsAfter.length,100);
 row.nativeProfileRecordsBefore.forEach(value=>integer(value));
 assert.deepEqual(row.nativeProfileRecordsAfter,row.nativeProfileRecordsBefore.map((value,i)=>value+(i===91?credits:0)));
 if(row.name==='normal')verifyGustBloomEarnedCollection(row.earnedRegularCollection);
 else fields(row.earnedRegularCollection,{performed:false});
 if(loss){fields(row,{nativeGameOver:true,nativeActualAwardCollected:false,nativePlacements:0,nativeGustPlacements:0,winTicks:[]});return;}
 fields(row,{nativeActualAwardCollected:true,nativeRegularChooserUnlockEarned:true,nativeAwardState:145,nativeAwardType:8,
  nativeAwardWave:6,nativeAwardEnemies:0,authoredZombies:29,deliveredPackets:32,nativeGiantCounterUsed:true});
 fields(row,{nativeGiantCounterPlacementObserved:true});
 integer(row.nativeGiantInstantDamageHits,1);integer(row.nativeGiantInstantDamageObserved,1000);
 assert.deepEqual(row.nativeFormationLedger,ledger);integer(row.nativeImpChildren,0,1);
 for(const name of ['nativePlacements','nativeGustPlacements','nativePushesObserved','nativeWindupsObserved','nativeVisibleGustsObserved','nativeDamageObservations'])integer(row[name],1);
 assert.equal(row.winTicks.length,replay?2:1);row.winTicks.forEach(value=>integer(value,1,49999));
 integer(row.remainingPackets,0,10);integer(row.remainingPlants,1,45);
 if(replay){assert.deepEqual(row.replayFormationLedger,ledger);fields(row,{replayAwardState:145,replayAwardType:18,native150TickHesitations:6});}
 if(retry){fields(row,{nativeRetryLossObserved:true,nativeRetryResetsWholeCourse:true});integer(row.nativeRetryLossTick,1);}
 assert.equal(row.checkpoint.performed,row.name.startsWith('save-'));
 if(row.checkpoint.performed){assert.equal(row.checkpoint.kind,row.name);verifyGustBloomCheckpoint(row.checkpoint);}
}

export function verifyGustBloomEarnedCollection(earned){
 fields(earned,{performed:true,earnedHeadwindCredit:1,profileCreditAssigned:false,nativeSurvivalChooser:true,nativeMouseChoices:6,
  nativeSelectedSeedOrder:[1,0,5,3,4,78],nativeDeckFileRoundtrip:true,nativeLetsRockOutroCompleted:true,nativeIntroCancelled:false,
  nativeRegularSunCost:150,nativeRegularHealth:300,nativeRechargeStillCoolingAt:1500,nativeRegularRechargeTicks:1500,
  nativeReadyObservedAt:1502,nativeActualReadyCounter:0,nativeRegularContinueGraphExact:true,nativeExportRoot:'earned-gust-regular/userdata'});
 integer(earned.nativeSkySunClicks,1);integer(earned.purchaseSunBefore,150);integer(earned.purchaseSunAfter);
 assert.equal(earned.purchaseSunBefore-earned.purchaseSunAfter,150);
 assert.equal(earned.nativeRegularGraphBefore,earned.nativeRegularGraphAfter);assert(earned.nativeRegularGraphBefore.length>100);
 const parts=earned.nativeRegularGraphBefore.split(';'),head=parts.shift().split(':').map(Number);
 assert.equal(head.length,21);assert(head.every(Number.isFinite));integer(head[1]);assert.equal(head[13],6);
 const packets=parts.filter(part=>part.startsWith('b,')).map(part=>part.split(',').slice(1).map(Number));
 assert.deepEqual(packets.map(values=>values[0]),[1,0,5,3,4,78]);packets.forEach(values=>assert.equal(values.length,8));
 const gust=packets[5];assert.equal(gust[3],1500);assert.equal(gust[4],0);assert.equal(gust[5],1);integer(gust[6],1,1500);
 const plants=parts.filter(part=>part.startsWith('p,')).map(part=>part.split(',').slice(1).map(Number));
 assert(plants.some(values=>values[1]===78&&values[2]===2&&values[3]===2&&values[4]>0));
 for(const name of ['nativeProfileSaveBytes','nativeUsersSaveBytes','nativeRegularBoardSaveBytes'])integer(earned[name],1,16*1024*1024);
}

export async function verifyGustBloom({report,read,sha,engine,fullRunReport,productionBuildBytes,currentArtBytes,previousArtBytes}){
 const bytes=await read('tests/gust-bloom-results.json'),authenticated=verifyGustBloomReportIdentity({reportBytes:bytes,sha});
 assert.deepEqual(report,authenticated.report);
 const contractBytes=await read('tests/gust-bloom-verification-contract.json');
 assert(acceptedContractPins.has(sha(contractBytes)),'The final actual complete Gust-bloom contract has not been reviewed');
 const contract=json(contractBytes);fields(contract,{schemaVersion:1,stage:'final-preregistered',engineId:CURRENT_ENGINE_ID,mode:92,profileIndex:91,sourceCount:878,productionObjectCount:147,nativeArtInputs:949});
 assert.deepEqual(contract.matrix,GUST_BLOOM_MATRIX);assert.deepEqual(contract.nativeStats,nativeStats);assert.deepEqual(contract.course,course);
 assert.deepEqual(contract.formations,formations);assert.deepEqual(contract.supplyCycle,supply);
 fields(contract.timing,{nativeObservationQuantum:2,minimumInputCadenceTicks:150,speedPairMaxDeltaTicks:30,replayAdditionalHesitationTicks:150,replayHesitations:6});
 const mandatory=['gust-bloom-harness.cpp','gust-bloom-policy.h','gust-bloom-battles.h','gust-bloom-controls.h',
  'gust-bloom-collection-controls.h','gust-bloom-earned-collection.h','gust-bloom-presentation-controls.h','build-gust-bloom.py',
  'test-gust-bloom.py','gust-bloom-initial-plan.json','gust-bloom-native-art-inputs.json','gust-bloom-assets.json','test-pool-panic.py'];
 for(const name of mandatory)assert(Object.hasOwn(contract.fixtureSha256,'tests/'+name),'Every executed input is preregistered: '+name);
 for(const [name,pin]of Object.entries(contract.fixtureSha256)){safeName(name);assert(name.startsWith('tests/'));digest(pin);assert.equal(sha(await read(name)),pin,name);}
 assert.equal(contract.priorAuthoredPlanSha256,sha(await read('tests/gust-bloom-initial-plan.json')));
 await verifyGustBloomBuildBindings({report,read,sha,engine,fullRunReport,productionBuildBytes});
 await verifyGustBloomSourceBounds({read,sha,engine});fields(report,{status:'PASS',assetBundleId:engine.assetBundleId,nativeArtInputs:949});
 const assetBytes=await read('tests/gust-bloom-assets.json'),assets=json(assetBytes);assert.equal(report.assetFixtureSha256,sha(assetBytes));
 fields(assets.files['main.pak'],{bytes:45453180,sha256:'5878326408285cb01f83b4fa4edcc66d65e727f6d6ee88563b5b3b287dd259fc'});
 const artBytes=await read('tests/gust-bloom-native-art-inputs.json'),inputs=json(artBytes);assert.equal(report.nativeArtFixtureSha256,sha(artBytes));
 fields(inputs,{assetBundleId:engine.assetBundleId,mainPakSha256:assets.files['main.pak'].sha256});assert.equal(Object.keys(inputs.sourceInputs).length,949);
 const originalBytes=await read('tests/double-agent-native-art-inputs.json');assert.equal(sha(originalBytes),'cecd07bb68c7592959cc9587d5a80ed7c8243934bd96b62cef82549ade7a5f46');
 for(const [name,pin]of Object.entries(json(originalBytes).sourceInputs))assert.deepEqual(inputs.sourceInputs[name],pin);
 for(const [name,pin]of Object.entries(inputs.sourceInputs)){safeName(name);integer(pin.bytes,1);digest(pin.sha256);}
 assert.equal(report.scenarios.length,48);assert.deepEqual(report.scenarios.map(identity).sort(),GUST_BLOOM_MATRIX.map(([name,speed,seed])=>identity({name,speed,seed})).sort());
 for(const row of report.scenarios){verifyGustBloomScenario(row);await verifyGustBloomCaseLog(row,{read,sha});
  if(row.family==='synthetic-controls'){
   assert(Object.keys(contract.controlExact[row.name]).length>=6);fields(row,contract.controlExact[row.name]);
   for(const [name,min]of Object.entries(contract.controlMinimum?.[row.name]||{}))integer(row[name],min);
   for(const [name,bounds]of Object.entries(contract.controlBounds?.[row.name]||{})){
    assert.equal(bounds.length,2);integer(row[name],bounds[0],bounds[1]);
   }
   for(const [name,rule]of Object.entries(contract.controlArrays?.[row.name]||{})){
    assert(Array.isArray(row[name]));assert.equal(row[name].length,rule.length);
    row[name].forEach(value=>integer(value,rule.minimum,rule.maximum));
   }
  }
 }
 assert.equal(report.checks,878+report.scenarios.reduce((sum,row)=>sum+row.checks,0));
 assert.equal(report.scenarios.filter(row=>row.family==='headwind').length,32);
 assert.equal(report.scenarios.reduce((sum,row)=>sum+row.profileCredits,0),32);
 assert.equal(report.scenarios.filter(row=>row.family==='headwind'&&row.checkpoint.performed).length,12);
 assert.equal(report.scenarios.filter(row=>row.nativeGameOver||row.failureAndRetry).length,8);
 assert.equal(report.scenarios.filter(row=>row.family==='synthetic-controls').length,16);
 assert.equal(report.speedPairs.length,24);assert.deepEqual(report.speedPairs.map(row=>row.name+'/'+row.seed).sort(),names.flatMap(name=>[1729,7331].map(seed=>name+'/'+seed)).sort());
 for(const pair of report.speedPairs){fields(pair,{semanticResultEqual:true});const rows=report.scenarios.filter(row=>row.name===pair.name&&row.seed===pair.seed).sort((a,b)=>a.speed-b.speed);
  assert.deepEqual(rows.map(row=>row.speed),[1,2]);
  const compare=['family','outcome','profileCredits'];if(rows[0].family==='headwind')compare.push('nativePlacements','nativeGustPlacements','nativeInstantPlacements',
   'nativeFormationLedger','replayFormationLedger','nativeAwardState','nativeAwardType','nativeAwardWave','authoredZombies','nativeImpChildren',
   'deliveredPackets','remainingPackets','remainingPlants','nativeGiantCounterUsed','failureAndRetry','nativeReplayCompleted');
  for(const name of compare)assert.deepEqual(rows[0][name],rows[1][name],'Exact native1x/2x result: '+name);
  const one=rows[0].winTicks||[],two=rows[1].winTicks||[];assert.equal(one.length,two.length);const delta=one.map((value,i)=>Math.abs(value-two[i]));
  assert.deepEqual(pair.nativeTickDeltas,delta);delta.forEach(value=>integer(value,0,30));
 }
 assert.equal(sha(previousArtBytes),'70fe4cb3279ab896f114046533cc50bfbc21667a5660f7c3a44eac5219180190');
 const prior=json(previousArtBytes),current=json(currentArtBytes);assert.equal(prior.cards.length,19);assert.equal(current.cards.length,20);
 assert.deepEqual({...current,cards:current.cards.slice(0,19)},prior);fields(current.cards[19],{mode:92,name:'Headwind',generatedArtworkUsed:false,background:'IMAGE_BACKGROUND1'});
 for(const field of ['tip','tips','descriptionBelowCard'])assert(!Object.hasOwn(current.cards[19],field));
 return {cases:48};
}
