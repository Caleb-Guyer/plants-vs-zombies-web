// SPDX-License-Identifier: MIT
// Independent checks of the actual current native enemy and Fire Drill matrix.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CURRENT_ENGINE_ID,CURRENT_SOURCE_COUNT,CURRENT_OBJECT_COUNT,AMBUSH_ARCHIVE_SHA256,reconstructAmbushSources,
 TORCH_ENGINE_ID,TORCH_ARCHIVE_SHA256,CURRENT_TORCH_RETENTION_SHA256,DOUBLE_PARENT_TEST_INPUTS_SHA256,
 verifyDoubleRetainedParentInputs,torchSourceReader,reconstructTorchFocusedEvidence}
 from './native-release-context.mjs';

// The complete seventh-build matrix includes the corrected native card and
// the literal headless negative; the sixth-build proof stays historical.
const acceptedContractPins=new Set(['140dc6317bb59cd6f211443b66057c6c2c688f138c54e2e221fcff7282f21b4d']);
const names=['normal','bait','save-lit','save-windup','save-spent','save-extinguished','retry','replay','no-action',
 'mechanics','cold-sources','layer-targets','interruption','presentation','endless-unlock'];
const matrix=[1729,7331].flatMap(seed=>names.flatMap(name=>[1,2].map(speed=>({name,speed,seed}))));
const text=bytes=>Buffer.from(bytes).toString('utf8').replace(/\r\n?/g,'\n');
const digest=value=>assert.match(value,/^[a-f0-9]{64}$/);
const safeName=value=>assert(typeof value==='string'&&value&&!value.startsWith('/')&&
 !/[\\:]/.test(value)&&!value.split('/').some(part=>!part||part==='.'||part==='..'));
const fields=(actual,expected)=>{for(const [name,value]of Object.entries(expected))assert.deepEqual(actual[name],value,name);};
const integer=(value,min=0,max=Number.MAX_SAFE_INTEGER)=>assert(Number.isSafeInteger(value)&&value>=min&&value<=max);
const key=row=>row.name+'/'+row.speed+'/'+row.seed;
const formationLedger=[
 [[34,1,1],[0,2,1],[34,3,1]],
 [[2,0,1],[34,0,1],[34,2,1],[2,4,1],[34,4,1]],
 [[6,1,1],[34,1,1],[6,3,1],[34,3,1],[0,2,1],[34,2,1]],
 [[34,0,2],[34,2,2],[34,4,2],[4,1,1],[4,3,1]],
 [[6,0,1],[34,0,1],[7,1,1],[6,2,1],[34,2,1],[7,3,1],[6,4,1],[34,4,1]],
 [[34,0,1],[34,1,1],[34,2,1],[34,3,1],[34,4,1],[2,0,1],[4,1,1],[6,2,1],[4,3,1],[2,4,1]]
].map(wave=>wave.sort((a,b)=>a[0]-b[0]||a[1]-b[1]));
const zombieGraph=graph=>{
 assert(typeof graph==='string'&&graph.length>0);
 return graph.split(';').filter(part=>part.startsWith('z,')).map(part=>{
  const tokens=part.split(',');assert.equal(tokens.length,26,'Complete native saved zombie observation');
  const n=tokens.slice(1).map(Number);for(const value of n)assert(Number.isFinite(value));
  return {id:n[0],type:n[1],row:n[2],health:n[5],head:n[8],arm:n[9],lit:n[10],
   chilled:n[14],frozen:n[15],buttered:n[16],rig:n[17],counter:n[18],target:n[19]};
 });
};

function once(source,before,after='') {
 assert.equal(source.split(before).length,2,'Exact one-use Torch integration guard: '+before.slice(0,110));
 return source.replace(before,after);
}

export async function verifyTorchSourceBounds({read,sha,engine}) {
 if(engine.id===CURRENT_ENGINE_ID){
  const projected=await torchSourceReader({read,sha,engine});
  return verifyTorchSourceBounds({read:projected.read,sha,engine:projected.engine});
 }
 assert.equal(engine.id,TORCH_ENGINE_ID);
 const referenceBytes=fs.readFileSync(new URL('./fixtures/torch1-parent-reference.json',import.meta.url));
 const parent=await reconstructAmbushSources({referenceBytes,read,sha,engine});
 for(const path of ['src/Lawn/Plant.cpp','src/Lawn/Plant.h','src/Lawn/Zombie.h','src/Lawn/Board.h',
  'src/Lawn/System/SaveGame.cpp','src/Lawn/System/PlayerInfo.cpp','src/Lawn/System/PlayerInfo.h'])
  assert.deepEqual(Buffer.from(await read('source/'+path)),parent.files.get(path),
   'Original plant combat, actor members, fixed board arrays and profile/save layout remain exact: '+path);
 assert.match(text(await read('source/src/Lawn/Board.h')),/bool\s+mZombieAllowed\[100\]/);
 assert.match(text(await read('source/src/Lawn/System/SaveGame.cpp')),/SyncBoolArray\(c, &theBoard->mZombieAllowed\[0\], 100\)/);
 let zombie=text(await read('source/src/Lawn/Zombie.cpp'));
 for(const include of ['#include "System/TorchbearerZombie.h"\n','#include "System/TorchbearerPresentation.h"\n'])
  zombie=once(zombie,include);
 zombie=once(zombie,'    { .mZombieType = ZOMBIE_TORCHBEARER, .mReanimationType = REANIM_ZOMBIE, .mZombieValue = TorchbearerZombie::kZombieValue, .mStartingLevel = 99, .mFirstAllowedWave = 1, .mPickWeight = 0, .mZombieName = "TORCHBEARER_ZOMBIE" },\n');
 zombie=once(zombie,'\n    case ZombieType::ZOMBIE_TORCHBEARER:\n        mVariant = false;\n        LoadPlainZombieReanim();\n        mBodyHealth = TorchbearerZombie::kBodyHealth;\n        mHasObject = true;\n        break;\n');
 for(const hook of ['if (TorchbearerZombie::IsZombie(*this)) TorchbearerPresentation::Initialize(*this);',
  'if (TorchbearerZombie::IsZombie(*this)) TorchbearerZombie::ValidateState(*this);',
  'if (TorchbearerZombie::IsZombie(*this)) TorchbearerZombie::Update(*this);']) zombie=once(zombie,'    '+hook+'\n');
 // Four immediate lifecycle/cold hooks all carry the same strict type guard.
 const extinguish='    if (TorchbearerZombie::IsZombie(*this)) TorchbearerZombie::Extinguish(*this);\n';
 assert.equal(zombie.split(extinguish).length,5);
 zombie=zombie.split(extinguish).join('');
 // One removal leaves the original blank line in ApplyChill; strip the added
 // second blank line only at the exact original CanBeChilled precondition.
 zombie=once(zombie,'\tif (!CanBeChilled())\n\t\treturn;\n\n\n','\tif (!CanBeChilled())\n\t\treturn;\n\n');
 const attack='    if (TorchbearerZombie::IsAttacking(*this)) return;\n';
 assert.equal(zombie.split(attack).length,4);zombie=zombie.split(attack).join('');
 zombie=once(zombie,'    if (TorchbearerZombie::IsZombie(*this) && theBaseRenderGroup == RENDER_GROUP_NORMAL)\n        TorchbearerPresentation::Draw(*this, g, theDrawPos);\n');
 zombie=once(zombie,'\n    if (TorchbearerZombie::TryStartBurn(*this, *thePlant)) return;\n');
 zombie=once(zombie,'    if (FireDrill::IsMode(mApp->mGameMode)) return false;\n');
 zombie=once(zombie,'\n    if (theZombieType == ZOMBIE_TORCHBEARER)\n    {\n        ReanimatorEnsureDefinitionLoaded(REANIM_FLAG, true);\n        ReanimatorEnsureDefinitionLoaded(REANIM_TORCHWOOD, true);\n    }\n');
 assert.equal(zombie,text(parent.files.get('src/Lawn/Zombie.cpp')),
  'Every original enemy statistic, target choice, damage, movement, animation, ability and lifecycle byte remains exact outside the reviewed type34 hooks');
 const header=text(await read('source/src/Lawn/System/TorchbearerZombie.h'));
 assert.match(header,/kBodyHealth = 270/);assert.match(header,/kBurnWindupTicks = 35/);
 assert.match(header,/kZombieValue = 3/);
 const mechanic=text(await read('source/src/Lawn/System/TorchbearerZombie.cpp'));
 assert.match(mechanic,/bool IsZombie\(const Zombie& zombie\) \{ return zombie\.mZombieType == kType; \}/);
 assert(!/zombie\.(?:mVelX|mBodyMaxHealth|mHelmHealth|mShieldHealth)\s*[+*/-]?=/.test(mechanic),
  'The torch ability never rewrites native movement or armor statistics');
 for(const field of ['mHasObject','mSummonCounter','mTargetPlantID'])assert(mechanic.includes(field));
 assert.match(mechanic,/--zombie\.mSummonCounter > 0/);
 assert.match(mechanic,/FindPlantTarget\(ATTACKTYPE_CHEW\) != target/);
 assert.match(mechanic,/target->mPlantHealth = 0;/);
 assert.match(mechanic,/\+\+zombie\.mBoard->mPlantsEaten;/);
 assert.match(mechanic,/mChallenge->ZombieAtePlant\(target\)/);
 assert(!mechanic.includes('SquishAllInSquare')&&!mechanic.includes('BurnRow('),'Burn is limited to the one native current target');
 const fireHeader=text(await read('source/src/Lawn/System/FireDrill.h'));
 assert.match(fireHeader,/kMode = GAMEMODE_CHALLENGE_FIRE_DRILL/);
 assert.match(fireHeader,/constexpr bool IsMode\(GameMode mode\) \{ return mode == kMode; \}/);
 const fireCard=text(await read('source/src/Lawn/System/FireDrillPresentation.cpp'));
 assert.match(fireCard,/plant\.ReanimationInitializeType\(30, 35, REANIM_SNOWPEA\);\s*plant\.SetFramesForLayer\("anim_idle"\);\s*plant\.Draw\(&plantGraphics\);\s*plant\.SetFramesForLayer\("anim_head_idle"\);\s*plant\.Draw\(&plantGraphics\);/,
  'The original Snow Pea card composition requires both native body and head animation layers');
 return parent;
}

export async function verifyTorchBuildBindings({report,read,sha,engine,fullRunReport,productionBuildBytes}) {
 fields(report,{execution:'complete-production-engine',optimization:'O2',failures:0,exitCode:0,
  engineId:CURRENT_ENGINE_ID,mode:90,profileIndex:89,productionObjectCount:CURRENT_OBJECT_COUNT});
 assert.equal(Object.keys(report.sourceSha256).length,CURRENT_SOURCE_COUNT);
 assert.equal(Object.keys(report.productionObjectSha256).length,CURRENT_OBJECT_COUNT);
 assert.deepEqual(report.sourceSha256,fullRunReport.sourceSha256);
 assert.deepEqual(report.productionObjectSha256,fullRunReport.productionObjectSha256);
 for(const [name,pin]of Object.entries(report.sourceSha256)){
  safeName(name);assert(name.startsWith('source/'));digest(pin);assert.equal(sha(await read(name)),pin,name);
 }
 for(const [name,pin]of Object.entries(report.productionObjectSha256)){safeName(name);digest(pin);}
 assert.equal(report.productionBuildReceiptSha256,sha(productionBuildBytes));
 const normal=JSON.parse(productionBuildBytes);
 fields(normal,{status:'PASS',exitCode:0,sourceUnchangedDuringBuild:true,sourceFiles:CURRENT_SOURCE_COUNT});
 for(const suffix of ['js','wasm'])assert.equal(normal.outputs['build/pvz-portable.'+suffix].sha256,engine.artifacts[suffix+'Sha256']);
 const build=JSON.parse(await read('tests/torchbearer-build.json'));
 for(const field of ['execution','optimization','productionObjectCount','productionBuildReceiptSha256',
  'generatedHarnessSha256','builderSha256','policySha256','controlSha256','verificationContractSha256',
  'testArtifactSha256','testInputSha256','sourceSha256','productionObjectSha256'])
  assert.deepEqual(report[field],build[field],'Exact actual current native driver: '+field);
 assert.equal(report.generatedHarnessSha256,sha(await read('tests/torchbearer-harness.cpp')));
 assert.equal(report.builderSha256,sha(await read('tests/build-torchbearer.py')));
 assert.equal(report.runnerSha256,sha(await read('tests/test-torchbearer.py')));
 assert.equal(report.policySha256,sha(await read('tests/fire-drill-policy.h')));
 assert.equal(report.controlSha256,sha(await read('tests/torchbearer-controls.h')));
 assert.equal(report.verificationContractSha256,sha(await read('tests/torchbearer-verification-contract.json')));
 for(const suffix of ['js','wasm'])assert.equal(sha(await read('tests/torchbearer-engine.'+suffix)),report.testArtifactSha256['torchbearer-engine.'+suffix]);
 assert(WebAssembly.validate(await read('tests/torchbearer-engine.wasm')));
 return build;
}

export async function verifyTorchCaseLog(row,{read,sha}) {
 const log='torchbearer-logs/'+row.name+'-'+row.speed+'x-'+row.seed+'.log';safeName(log);
 if(Object.hasOwn(row,'log'))assert.equal(row.log,log);
 const bytes=await read('tests/'+log);assert.equal(sha(bytes),row.logSha256);
 const raw=text(bytes);
 const diagnostics=raw.split(/\n/).filter(line=>!line.startsWith('TORCHBEARER_RESULT ')).join('\n');
 assert(!/Too many (?:particle|emitters)|DataArray.*(?:full|exhaust|capacity)|(?:particle|reanimation).*capacity|(?:memory access out of bounds|RuntimeError)/i.test(diagnostics),
  'No native overflow, exhaustion or runtime exception can be hidden in a passing log');
 const records=raw.split(/\n/).filter(line=>line.startsWith('TORCHBEARER_RESULT '));
 assert.equal(records.length,1,'Exactly one actual native result per case');
 const actual=JSON.parse(records[0].slice('TORCHBEARER_RESULT '.length));
 for(const [name,value]of Object.entries(actual))assert.deepEqual(row[name],value,'The wrapper cannot replace actual native evidence: '+name);
 return actual;
}

export function verifyTorchSyntheticScenario(row) {
 fields(row,{execution:'complete-production-engine',family:'synthetic-controls',outcome:'controls-pass',
  syntheticActorSetup:true,countedEarnedWins:0,profileCredits:0,silentHardware:true,audioDeviceOpened:false,
  all100ProfileRecordsPreserved:true});
 assert([1,2].includes(row.speed)&&[1729,7331].includes(row.seed));integer(row.checks,1);
 if(row.name==='mechanics')fields(row,{nativeWindupActionCalls:35,preBurnUndamagedActions:34,plantsBurned:1,
  spentNativeBites:20,spentPlantDamage:80,oneUseTorch:true,stockBodyAndArmor:true,exactNativeEatingTarget:true,
  nativeOriginalSpawnQueries:100,nativeAdventureAllowedLevelCases:6,nativeOriginalRandomWeightZero:true,
  nativeAll100AllowedFlagsRestored:true});
 else if(row.name==='cold-sources')fields(row,{nativeColdSources:4,actualColdProjectileCollisions:2,
  coldCancelledWindupsBeforeDamage:4,noRelightControls:4,snowpeaNativeCollision:true,winterMelonNativeCollision:true,
  chillShroomNativePulse:true,iceShroomNativeSpecial:true,syntheticChillCountdown:2});
 else if(row.name==='layer-targets')fields(row,{nativeEatingLayerCases:2,cancelledChangedOrMissingTargets:3,
  pumpkinOnlyBurned:true,flowerpotUnderplantPreserved:true,cancelledTorchRetainsUse:true,awakeHypnoNativeCounter:true});
 else if(row.name==='interruption'){
  fields(row,{outerArmRetainsInnerGrip:true,headLossCancels:true,nativeDeathCancels:true,submersionExtinguishes:true,
   butterPausedNativeFrames:20,butterPauseObserverCalls:10,nativeButterRecovery:true,nativeOptionsPauseGraphExact:true,
   nativeResumeButton:true,syntheticSavedWindupGraphExact:true,nativeButterExpiredNaturally:true,
   syntheticEndlessProjectionSamples:1040,syntheticEndlessLegalReplacements:96,syntheticLockedRosterExact:true,
   syntheticWaterHeavyGeometryPreserved:true,syntheticPartialFlagSaveUnlockPreservesQuota:true,
   syntheticPartialFlagHasNoImmediateForcedIce:true,syntheticFullBankDefersColdWithoutRNGQuotaSpend:true,
   syntheticNextFlagFirstAvailableDeliverySnowPea:true,syntheticColdPacketSaveGraphExact:true,syntheticEndlessEarnedFlags:0});
  integer(row.butterRemainingBeforeNaturalExpiry,1,400);
  integer(row.butterRecoveryNativeFrames,row.butterRemainingBeforeNaturalExpiry,
   row.butterRemainingBeforeNaturalExpiry+36);
  assert.equal(row.syntheticWindupGraphBefore,row.syntheticWindupGraphAfter);
  const actors=zombieGraph(row.syntheticWindupGraphAfter).filter(actor=>actor.type===34);
  assert.equal(actors.length,1);fields(actors[0],{health:270,head:1,lit:1,counter:35});integer(actors[0].target,1);
 }else{
  assert.equal(row.name,'presentation','Only the five preregistered isolated control families exist');
  fields(row,{nativePresentationControls:true,nativeOpaqueGripSource:true,nativeFingerForeground:true,
   transparentAnchorNegativeRejected:true,nativeGripSamples:5,nativeWindupStartCounter:35,
   nativeWindupMiddleCounter:17,nativeWindupEndCounter:2,nativeSpentFlamePixels:0,nativeColdFlamePixels:0,
   outerArmLossRetainsInnerGrip:true,nativePoseSamplingSpeed:1,normalizedAlmanacUpdates:10,
   nativePortraitUnclippedBounds:true,nativeAlmanacWindows:28,scaledAlmanacWindowPairs:2268,
   descriptionOverflowNegativeRejected:true,renderGraphUnchanged:true,presentationSyntheticSetup:true,
   nativeCompleteSnowCard:true,headlessCardNegativeRejected:true,nativeCardSnowCachedBoundsMatch:true,
   nativeCardSnowReference:'original complete cache shape and native cache DrawReanimatorFrame at card origin'});
  integer(row.nativeGripMatchingPixels,45);integer(row.wrongAnchorMatchingPixels,0);
  assert(row.wrongAnchorMatchingPixels*2<row.nativeGripMatchingPixels);
  for(const field of ['nativeFingerOcclusionPixels','nativeMidWindupContactPixels','nativeEndWindupContactPixels',
   'nativeDescriptionGlyphPixels','nativeTitleGlyphPixels'])integer(row[field],1);
  for(const field of ['nativeWalkChangedPixels','nativeMidWindupChangedPixels','nativeEndWindupChangedPixels'])integer(row[field],26);
  integer(row.nativeLitFlamePixels,6);integer(row.portraitChangedPixels,51);integer(row.nativeBonusCardChangedPixels,501);
  for(const field of ['originalPortraitInkPixels','torchPortraitInkPixels'])integer(row[field],1);
  for(const field of ['originalPortraitUnclippedHeight','torchPortraitUnclippedHeight'])integer(row[field],1,187);
  integer(row.nativeDescriptionInkBottom,374,538);integer(row.legacyOverflowInkBottom,539);
  integer(row.nativeAlmanacHitTests,135,140);assert.equal(row.nativeAlmanacHitTests%5,0);
  integer(row.nativeCardSnowHeadPixels,60,5200);assert.equal(row.nativeCardSnowHeadMatches,row.nativeCardSnowHeadPixels);
  integer(row.nativeCardSnowBluePixels,30,row.nativeCardSnowHeadPixels);assert.equal(row.nativeCardSnowBlueMatches,row.nativeCardSnowBluePixels);
  integer(row.nativeCardSnowNozzlePixels,3,row.nativeCardSnowHeadPixels);assert.equal(row.nativeCardSnowNozzleMatches,row.nativeCardSnowNozzlePixels);
  integer(row.headlessCardSnowHeadMatches,0);assert(row.headlessCardSnowHeadMatches*4<row.nativeCardSnowHeadPixels);
  assert.equal(row.headlessCardSnowBlueMatches,0);
  integer(row.headlessCardSnowNozzleMatches,0,row.nativeCardSnowNozzlePixels-1);
  assert(Array.isArray(row.nativeCardSnowHeadRoi)&&row.nativeCardSnowHeadRoi.length===4);
  const [x,y,w,h]=row.nativeCardSnowHeadRoi;integer(x,44,78);integer(y,0,64);integer(w,13,80);integer(h,13,65);
  assert(x+w<=79&&y+h<=65);
  assert.deepEqual(row.nativeCardSnowNozzleRoi,[x+Math.floor(w*3/5),y+Math.floor(h/4),w-Math.floor(w*3/5),Math.floor(h*3/4)-Math.floor(h/4)],
   'The nozzle region derives from the original native head matte, not a manually selected passing pixel');
  integer(row.nativeCardSnowCachedBluePixels,100,160*150);
  assert.deepEqual(row.nativeCardSnowReferenceOrigin,[30,35]);
  assert(Array.isArray(row.nativeCardSnowCachedSourceBounds)&&row.nativeCardSnowCachedSourceBounds.length===4);
  const [cx,cy,cw,ch]=row.nativeCardSnowCachedSourceBounds;integer(cx,0,159);integer(cy,0,149);integer(cw,31,160);integer(ch,31,150);
  assert(cx+cw<=160&&cy+ch<=150);
 }
}

export function verifyTorchFireScenario(row) {
 assert(names.slice(0,9).includes(row.name));
 const loss=row.name==='no-action',replay=row.name==='replay',saved=row.name.startsWith('save-');
 fields(row,{execution:'complete-production-engine',family:'fire-drill',profileIndex:89,
  outcome:loss?'native-loss':'win',profileCredits:loss?0:replay?2:1,
  nativeActualAwardCollected:!loss,nativeEighteenthBonusCardInput:true,
  failureAndRetry:row.name==='retry',replayCompleted:replay,nativeExistingBonusPageReused:replay,
  all100ProfileRecordsPreservedExceptEarnedCredit:true,visibleOnlyPolicy:true,
  postStartHPActorStageRNGEdits:false,observerNativeTicks:2,policyIntervalTicks:100,
  native150TickHesitations:replay?6:0,silentHardware:true,audioDeviceOpened:false});
 integer(row.checks,51);integer(row.nativeBurnsObserved,0,44);integer(row.nativeColdExtinguishesObserved,0,44);
 for(const field of ['peakParticleSystems','peakEmitters','peakParticles'])integer(row[field],0,1023);
 assert(Array.isArray(row.winTicks));
 if(loss){
  fields(row,{nativePlacements:0,nativeSunClicks:0,nativeSunSpent:0});assert.deepEqual(row.winTicks,[]);
  integer(row.formations,1,6);integer(row.authoredZombies,1,40);integer(row.torchbearers,1,22);
  fields(row,{nativeAwardState:-1,nativeAwardWave:-1,nativeAwardLiveEnemies:-1,nativeAwardCoinType:-1});
 }else{
  fields(row,{formations:6,authoredZombies:40,torchbearers:22});
  fields(row,{nativeAwardState:137,nativeAwardWave:6,nativeAwardLiveEnemies:0,nativeAwardCoinType:8});
  integer(row.nativeMowersRemaining,0,5);integer(row.nativePlantsRemaining,0,45);
  assert.deepEqual(row.nativeFormationLedger,formationLedger,'Actual six-wave native type/row ledger');
  for(const field of ['nativePlacements','nativeSunSpent','nativeDamageObservations','nativeColdExtinguishesObserved'])integer(row[field],1);
  assert.equal(row.winTicks.length,replay?2:1);for(const ticks of row.winTicks)integer(ticks,1,80000);
  if(['bait','save-windup','save-spent'].includes(row.name)){
   integer(row.nativeBurnsObserved,1,44);assert.equal(row.visibleBaitSpentCue,true);
  }
 }
 assert(Array.isArray(row.nativeFormationLedger)&&row.nativeFormationLedger.length===6);
 let actors=0,torches=0;
 for(let wave=0;wave<6;++wave){
  const expected=new Map(formationLedger[wave].map(([type,row,count])=>[type+'/'+row,count]));
  const seen=new Set();
  for(const entry of row.nativeFormationLedger[wave]){
   assert(Array.isArray(entry)&&entry.length===3);const [type,lane,count]=entry,identity=type+'/'+lane;
   assert(!seen.has(identity)&&expected.has(identity));seen.add(identity);integer(count,1,expected.get(identity));
   actors+=count;if(type===34)torches+=count;
  }
 }
 assert.equal(actors,row.authoredZombies);assert.equal(torches,row.torchbearers);
 if(replay){
  assert.deepEqual(row.replayFormationLedger,formationLedger);
  fields(row,{replayAwardState:137,replayAwardWave:6,replayAwardLiveEnemies:0,replayAwardCoinType:18});
 }else{
  assert.deepEqual(row.replayFormationLedger,[[],[],[],[],[],[]]);
  fields(row,{replayAwardState:-1,replayAwardWave:-1,replayAwardLiveEnemies:-1,replayAwardCoinType:-1});
 }
 for(const profile of [row.nativeProfileRecordsBefore,row.nativeProfileRecordsAfter]){
  assert(Array.isArray(profile)&&profile.length===100);for(const value of profile)integer(value,0,0xffffffff);
 }
 assert.equal(row.nativeProfileRecordsBefore[89],0);
 assert.equal(row.nativeProfileRecordsAfter[89],row.profileCredits);
 for(let i=0;i<100;++i)if(i!==89)assert.equal(row.nativeProfileRecordsBefore[i],row.nativeProfileRecordsAfter[i]);
 fields(row,{nativeRetryLossObserved:row.name==='retry',nativeRetryLostProfileCredits:0,
  nativeRetryStartsAtFormationZero:row.name==='retry'});
 if(row.name==='retry'){
  integer(row.nativeRetryLossTick,1,80000);integer(row.nativeRetryLossFormation,1,6);
  fields(row,{nativeRetryStartingSun:425,nativeRetryStartingPlants:8});
 }else fields(row,{nativeRetryLossTick:0,nativeRetryLossFormation:0,nativeRetryStartingSun:0,nativeRetryStartingPlants:0});
 const cp=row.checkpoint;assert.equal(cp.performed,saved);
 if(saved){
  fields(cp,{kind:row.name,graphPreserved:true,lit:['save-lit','save-windup'].includes(row.name)});
  integer(cp.actor,1);assert.equal(cp.beforeGraph,cp.afterGraph);
  const actor=zombieGraph(cp.afterGraph).find(z=>z.id===cp.actor);assert(actor,'Exact saved native Torch actor is present');
  fields(actor,{type:34,lit:cp.lit?1:0,counter:cp.counter,target:cp.target});integer(actor.health,1,270);
  if(row.name==='save-windup'){integer(cp.counter,1,35);integer(cp.target,1);}
  else fields(cp,{counter:0,target:0});
  if(row.name==='save-spent')integer(cp.plantsEaten,1);
  if(row.name==='save-extinguished')assert(actor.chilled>0||actor.frozen>0,'Saved spent torch was actually extinguished by native cold');
 }else fields(cp,{kind:'',actor:0,lit:false,counter:0,target:0,plantsEaten:0,beforeGraph:'',afterGraph:'',graphPreserved:false});
}

export function verifyTorchEarnedUnlockScenario(row) {
 fields(row,{execution:'complete-production-engine',family:'earned-unlock-chain',name:'endless-unlock',
  outcome:'ten-flags',profileCredits:1,nativeActualFireDrillAwardCollected:true,
  nativeBonusCardsAndFlagZeroStart:true,fireDrillAuthoredZombies:40,fireDrillTorches:22,
  earnedEndlessFlags:10,firstSnowPeaFlag:8,observerNativeTicks:2,policyIntervalTicks:100,
  visibleOnlyPolicy:true,postStartHPActorStageRNGEdits:false,coldAheadOfTorchwood:true,
  allEarlyFlagsTorchFree:true,noFiniteEndlessAward:true,silentHardware:true,audioDeviceOpened:false,
  all100ProfileRecordsPreservedExceptEarnedFireAndEndlessBest:true,fireDrillAwardState:137,
  fireDrillAwardWave:6,fireDrillAwardLiveEnemies:0,nativeDancerPhasePeriod:5060,
  nativeBonusDwellHasNoBoard:true,nativeNoClockAssignment:true});
 integer(row.nativePreDwellAppCounter);integer(row.nativeBeforeEndlessCardAppCounter);
 integer(row.nativeInitialEndlessAppCounter);integer(row.nativeBonusDwellUpdateCalls,0,5059);
 integer(row.nativeBonusDwellFrames,0,5059);
 assert.equal(row.nativeBeforeEndlessCardAppCounter-row.nativePreDwellAppCounter,row.nativeBonusDwellFrames);
 assert.equal(row.nativeBonusDwellUpdateCalls,row.nativeBonusDwellFrames,
  'A board-free Bonus update advances one real native frame, with no counter assignment');
 assert.equal(row.nativeBeforeEndlessCardAppCounter%5060,0);
 assert.equal(row.nativeInitialEndlessAppCounter%5060,3);
 assert.equal(row.nativeInitialEndlessAppCounter,row.nativeBeforeEndlessCardAppCounter+3);
 assert.deepEqual(row.fireDrillFormationLedger,formationLedger);
 integer(row.checks,51);integer(row.torchbearers,1,4);integer(row.nativeSnowPeaPlacements,1);
 integer(row.nativePlacements,1);integer(row.nativeColdExtinguishesObserved,0,4);
 integer(row.remainingPackets,0,10);integer(row.nativeAcceptedPackets,6);
 assert.equal(row.nativeAcceptedPackets,row.nativePlacements+row.remainingPackets,
  'Every natural conveyor packet is either committed through native input or remains in its native bank');
 integer(row.mowersRemaining,0,6);
 assert(Array.isArray(row.flagTicks)&&row.flagTicks.length===10);
 let prior=0;for(const tick of row.flagTicks){integer(tick,prior+1,1200000);prior=tick;}
 assert(Array.isArray(row.firstPacketTypes)&&row.firstPacketTypes.length===10);
 for(const type of row.firstPacketTypes)integer(type,-1,77);
 assert.equal(row.firstPacketTypes[8],5);assert.equal(row.firstPacketTypes[9],5);
}

export async function verifyTorchbearer({report,read,sha,engine,fullRunReport,productionBuildBytes,
 currentArtBytes,previousArtBytes}) {
 assert.equal(engine.id,CURRENT_ENGINE_ID);
 const contractBytes=await read('tests/torchbearer-verification-contract.json');
 assert(acceptedContractPins.has(sha(contractBytes)),
  'The complete current O2 Torchbearer/Fire Drill/earned-Endless matrix has not been accepted');
 const contract=JSON.parse(contractBytes);
 const adapterBytes=await read('tests/double1-torch-retention.json');
 assert.equal(sha(adapterBytes),CURRENT_TORCH_RETENTION_SHA256);
 assert.equal(report.retentionAdapterSha256,CURRENT_TORCH_RETENTION_SHA256);
 const adapter=JSON.parse(adapterBytes);
 fields(adapter,{schemaVersion:1,parentEngineId:TORCH_ENGINE_ID,parentArchiveSha256:TORCH_ARCHIVE_SHA256,
  engineId:CURRENT_ENGINE_ID,historicalContractSha256:sha(contractBytes),sourceCount:CURRENT_SOURCE_COUNT,
  productionObjectCount:CURRENT_OBJECT_COUNT,all60CasesFresh:true,parentSnapshotManifestSha256:DOUBLE_PARENT_TEST_INPUTS_SHA256});
 assert.deepEqual(Object.keys(adapter.fixtureOverrides),['tests/test-torchbearer.py']);
 const retained=await verifyDoubleRetainedParentInputs({read,sha});
 assert.equal(retained.files['tests/test-torchbearer.py'].sha256,contract.fixtureSha256['tests/test-torchbearer.py']);
 const projected=await torchSourceReader({read,sha,engine});
 const historicalRead=await reconstructTorchFocusedEvidence({
  referenceBytes:fs.readFileSync(new URL('./fixtures/torch1-focused-reference.json',import.meta.url)),
  read,sha,engine,sourceFiles:projected.files});
 const historicalProductionBuildBytes=await historicalRead('logs/build-result.json');
 fields(contract,{schemaVersion:1,engineId:TORCH_ENGINE_ID,mode:90,profileIndex:89,sourceCount:868,
  productionObjectCount:142,enemyType:34,parentArchiveSha256:AMBUSH_ARCHIVE_SHA256,
  observerNativeTicks:2,policyIntervalTicks:100,nativeBurnWindupActions:35,authoredFormations:6,
  authoredEnemyCount:40,authoredTorchCount:22,originalBodyHealth:270,originalHelmetHealth:0,originalShieldHealth:0,
  stage:'final-preregistered',authoredStartingSun:425,nativeFinishedAwardState:137,
  nativeMandatoryCompleteFireBattles:40,nativeMandatoryEarnedEndlessFlags:40,nativeMandatoryNaturalLosses:8,
  originalProfileRecordCount:100,nativeSpeedPairCount:30,nativeTimelineToleranceTicks:30});
 assert.deepEqual(contract.matrix,matrix.map(row=>[row.name,row.speed,row.seed]));
 assert.deepEqual(contract.authoredStartingPlants,[[1,0,0],[1,0,1],[1,0,2],[1,0,3],[1,0,4],[0,1,0],[0,1,2],[0,1,4]]);
 assert.deepEqual(contract.originalInitialRechargeTicks,[0,0,0,2000,2000,3500,2000]);
 assert.deepEqual(contract.nativeFormationLedger,formationLedger);
 assert.deepEqual(contract.ordinaryPlayer,{visibleOnly:true,observerNativeTicks:2,policyIntervalTicks:100,
  replaySecondBattle150TickHesitations:6,hiddenHPAttackClockRNGOrFutureWaveReads:false,postStartActorHealthSpawnStageRNGEdits:false});
 assert.deepEqual(contract.syntheticControls,{families:names.slice(9,14),countedEarnedWins:0,profileCredits:0,
  explicitlyAuthoredActorsAndDirectNativeActionBudget:true});
 assert.deepEqual(contract.nativeEntryPhaseFixture,{
  priorContractSha256:'5c2095bff5bcd23975dfa97647ac5a579a6f9e6bd11f86e4ca788d9f6e201e4a',
  reason:'Original DO_FIX_BUGS-off native Dancers use global appCounter for110/460-frame behavior. Award return left a one-frame difference before the compared Endless games.',
  nativePhasePeriod:5060,nativeBeforeEndlessCardAppCounterModulo:0,nativeInitialEndlessAppCounterModulo:3,
  realBonusUIUpdateFramesOnly:true,noBoardDuringDwell:true,nativeDwellFramesMinimum:0,nativeDwellFramesMaximum:5059,
  clockAssignments:false,postStartActorHealthStageRNGEdits:false,existingSeededNativeCardPathUnchanged:true,
  nativeTimelineToleranceTicksUnchanged:30,
  priorUnmeasuredOffsetContractSha256:'2ffe03ca5ee9c87bc8264dc17ef4bb0d40f1d8ad2285329c5504a41397ac5ce7',
  measuredNativeIntroFrameOffset:3,measuredEntryCases:4,
  measurement:'All actual1729/7331 and1x/2x entry-only probes observed beforeCard25300, afterEntry25303. No clock was assigned; processes stopped immediately after observation.'});
 assert.deepEqual(contract.cardCompletenessRegression,{
  historicalAcceptedNormal6ContractSha256:'bfc9d9c293be6923c46f9c72fc8a764b02e5a387ca80aab6de414d5bf616f503',
  sourceWitness:'tests/torch-fire-drill-card-source-revision.json',negative:'tests/torch-fire-drill-headless-card-parent.bmp',
  reference:'Original complete MakeCachedPlantFrame raw-pixel shape/bounds plus unchanged original cache DrawReanimatorFrame body+head at the exact card raster origin30,35 for exact target-color comparison',
  minimumOpaqueExactHeadPixels:60,minimumExactIcyBluePixels:30,minimumExactDarkBlueNozzlePixels:3,
  allOpaqueReferencePixelsMustMatch:true,negativeHeadMatchFractionStrictlyBelow:0.25,negativeBlueMatches:0,
  negativeNozzleBelowReferenceCount:true,
  productionChange:'Only two original native anim_head_idle SetFramesForLayer/Draw lines in FireDrillPresentation.cpp; game rules/policies/stats/cooldowns/phase3 unchanged',
  privateHistoricalFull26NotEmbedded:true,
  referenceCalibration:'First reference added one extra blit causing uniform1RGBdarkening. Direct cache bytes removed it but11/363opaque head pixels still differed1RGB because native cache rasterized at20,20 before integer transport while card rasterized at30,35. Final reference preserves independent complete cache shape/bounds and uses its unchanged native frame renderer at identical30,35 origin. No target-color tolerance, color compensation, threshold reduction or production change.',
  nativeCachedShapeBoundsMustMatch:true,minimumIndependentCachedBluePixels:100,exactOriginalReferenceRasterOrigin:[30,35]});
 assert.equal(Object.keys(contract.fixtureSha256).length,282);
 const live=['torchbearer-harness.cpp','build-torchbearer.py','test-torchbearer.py','torchbearer-controls.h',
  'torchbearer-presentation-controls.h','torch-fire-drill-battles.h','torch-endless-tests.h','fire-drill-policy.h',
  'pool-panic-endless-ordinary-policy.h','torch-native-art-inputs.json','torchbearer-assets.json','test-pool-panic.py',
  'torch1-development-history.json'].map(name=>'tests/'+name);
 for(const name of live)assert(Object.hasOwn(contract.fixtureSha256,name),'Every actual native input is independently pinned: '+name);
 for(const [name,pin]of Object.entries(contract.fixtureSha256)){
  safeName(name);assert(name.startsWith('tests/'));digest(pin);
  const actualPin=Object.hasOwn(adapter.fixtureOverrides,name)?adapter.fixtureOverrides[name]:pin;
  digest(actualPin);assert.equal(sha(await read(name)),actualPin,name);
 }
 const history=JSON.parse(await read('tests/torch1-development-history.json'));
 fields(history,{schemaVersion:1,status:'Historical real failures retained; no final acceptance from development probes'});
 assert.deepEqual(history.phases.map(phase=>phase.phase),['initial-policy-failures','award-routing-and-art-reference',
  'save-retry-margin-and-compositing','first-o2-matrix-policy-and-counter','native-dancer-phase-parity','measured-native-intro-offset']);
 const cardFixtures=['tests/torch-fire-drill-headless-card-parent.bmp','tests/torch-fire-drill-card-parent.cpp','tests/torch-fire-drill-card-source-revision.json'];
 const completeFixtures=[...live,...cardFixtures];
 const cardBefore=await read('tests/torch-fire-drill-card-parent.cpp');
 assert.equal(sha(cardBefore),'fb4399bb8d7bf1339da97e3e24321ef7996cea3e91506592d7e1a6513562062e');
 const cardNow=await read('source/src/Lawn/System/FireDrillPresentation.cpp');
 assert.equal(sha(cardNow),'680f6e6a3b573288e64c65848ea628cde3f25d5cf5c7bc25dcd1243debdb6265');
 assert.equal(once(text(cardNow),'    plant.SetFramesForLayer("anim_head_idle");\n    plant.Draw(&plantGraphics);\n'),text(cardBefore),
  'The complete card source differs only by the two original native head-layer draw lines');
 const cardWitness=JSON.parse(await read('tests/torch-fire-drill-card-source-revision.json'));
 fields(cardWitness,{schemaVersion:1,historicalNormal6ReceiptSha256:'0bc8dc6334743302f0371afbac296ef81dc15ec19de3e41afe2774352dd156a1',
  historicalNativeTorchContractSha256:'bfc9d9c293be6923c46f9c72fc8a764b02e5a387ca80aab6de414d5bf616f503',
  historicalNativeTorchReportSha256:'9e467c4b5d51800ad7f669c41b49994ffcdbabd8a28f1caf4c7cb42a25d3ce94',
  currentNormal7ReceiptSha256:sha(historicalProductionBuildBytes),sourceFiles:868,productionObjectCount:142});
 assert.deepEqual(cardWitness.changedProductionFiles,{'src/Lawn/System/FireDrillPresentation.cpp':{before:sha(cardBefore),after:sha(cardNow)}});
 const currentMapBytes=await historicalRead('logs/source-before.json');
 assert.deepEqual(Buffer.from(currentMapBytes),Buffer.from(await historicalRead('logs/source-after.json')));
 assert.equal(sha(currentMapBytes),cardWitness.currentNormal7SourceMapSha256);
 const oldMapBytes=Buffer.from(once(Buffer.from(currentMapBytes).toString(),sha(cardNow),sha(cardBefore)));
 assert.equal(sha(oldMapBytes),cardWitness.historicalNormal6SourceMapSha256,
  'The exact complete normal6 source-map bytes reconstruct by reversing this one new-card file hash');
 assert.deepEqual(Object.fromEntries(Object.entries(JSON.parse(currentMapBytes)).map(([name,pin])=>['source/'+name,pin])),
  Object.fromEntries([...projected.files].map(([name,bytes])=>['source/'+name,sha(bytes)])),
  'The historical card witness still binds every exact published Torch source; current build bindings are checked separately');
 const oldCard=Buffer.from(await read('tests/torch-fire-drill-headless-card-parent.bmp'));
 assert.equal(oldCard.length,15654);assert.equal(sha(oldCard),'b37e088856f3b36a1e4c4bca5f5d59ba581d4240ad80427ddda4eccbea096675');
 assert.deepEqual(cardWitness.headlessNegative,{path:'tests/torch-fire-drill-headless-card-parent.bmp',bytes:15654,sha256:sha(oldCard)});
 assert.equal(oldCard.toString('ascii',0,2),'BM');assert.equal(oldCard.readUInt32LE(18),80);assert.equal(oldCard.readUInt32LE(22),65);
 for(const phase of history.phases){
  assert.equal(phase.scope,phase.phase==='first-o2-matrix-policy-and-counter'?
   'Historical failed O2 attempt: real7331 saved-windup late losses and incomplete portrait-backdrop ink counter. No final acceptance.':
   phase.phase==='native-dancer-phase-parity'?
   'All60 native cases individually passed; aggregate rejected unequal pre-game global native Dancer phases. Private read-only trace confirmed every observation2nativeframes and first156actions identical. No final acceptance.':
   phase.phase==='measured-native-intro-offset'?
   'The2ffe preregistration assumed post-cardphase1; four actually executed entry probes rejected it. Four subsequent entry-only native measurements observed25300to25303, offset3, and were terminated immediately after observation with no accepted wins.':
   'Historical development diagnosis; not final acceptance');
  let failures=0;
  for(const [name,pin]of Object.entries(phase.copiedInputsAndRawLogs)){
   safeName(name);assert(name.startsWith('torch1-development-history/'+phase.phase+'/'));digest(pin);
   const bytes=await read('tests/'+name);assert.equal(sha(bytes),pin);assert.equal(contract.fixtureSha256['tests/'+name],pin);
   completeFixtures.push('tests/'+name);if(name.endsWith('.log')&&/torchbearer:FAIL:/.test(text(bytes)))++failures;
  }
  if(phase.phase==='native-dancer-phase-parity'){
   const base='tests/torch1-development-history/native-dancer-phase-parity/';
   const failed=JSON.parse(await read(base+'failed-aggregate-observation.json'));
   fields(failed,{status:'FAILED aggregate parity; all60 individual native cases passed, not final acceptance',
    contractSha256:'5c2095bff5bcd23975dfa97647ac5a579a6f9e6bd11f86e4ca788d9f6e201e4a'});
   assert.equal(failed.cases.length,60);assert.deepEqual(failed.cases.map(key).sort(),matrix.map(key).sort());
   for(const oldRow of failed.cases){
    const log=text(await read(base+`raw60/${oldRow.name}-${oldRow.speed}x-${oldRow.seed}.log`));
    const values=log.split('\n').filter(line=>line.startsWith('TORCHBEARER_RESULT ')).map(line=>JSON.parse(line.slice('TORCHBEARER_RESULT '.length)));
    assert.equal(values.length,1);assert.deepEqual(values[0],oldRow,'All sixty original individual outcomes remain exact historical raw observations');
   }
   const oldPair=failed.cases.filter(row=>row.name==='endless-unlock'&&row.seed===1729).sort((a,b)=>a.speed-b.speed);
   assert.deepEqual(oldPair.map(row=>row.nativePlacements),[193,194]);
   assert.deepEqual(oldPair.map(row=>row.nativeAcceptedPackets),[195,198]);
   assert.deepEqual(oldPair[0].flagTicks.slice(0,9),oldPair[1].flagTicks.slice(0,9));
   assert.equal(oldPair[1].flagTicks[9]-oldPair[0].flagTicks[9],1120);
   assert.match(text(await read(base+'matrix-runner.log')),/1x\/2x semantic mismatch: endless-unlock nativePlacements/);
   assert.equal(sha(await read(base+'torchbearer-verification-contract.json')),failed.contractSha256);
   const traces=await Promise.all([1,2].map(async speed=>text(await read(base+`private-diagnostic/speed${speed}/diagnostic.log`))));
   assert(traces.every(trace=>!/^EQ /m.test(trace)),'Actual trace ruled out an unequal native observation quantum');
   const actions=traces.map(trace=>trace.split('\n').filter(line=>line.startsWith('EA ')));
   assert.deepEqual(actions[0].slice(0,156).map(line=>line.replace(/ app\d+/,'')),
    actions[1].slice(0,156).map(line=>line.replace(/ app\d+/,'')));
   assert.notEqual(actions[0][156].replace(/ app\d+/,''),actions[1][156].replace(/ app\d+/,''));
  }else{
   assert(failures>0,'Actual developmental failures remain visible for every revision phase');
   if(phase.phase==='measured-native-intro-offset'){
    const base='tests/torch1-development-history/measured-native-intro-offset/';
    assert.equal(failures,4);
    assert.equal(sha(await read(base+'torchbearer-verification-contract.json')),
     '2ffe03ca5ee9c87bc8264dc17ef4bb0d40f1d8ad2285329c5504a41397ac5ce7');
    const measurements=JSON.parse(await read(base+'actual-entry-measurements.json'));
    assert.equal(measurements.length,4);
    assert.deepEqual(measurements.map(row=>row.speed+'/'+row.seed).sort(),['1/1729','1/7331','2/1729','2/7331']);
    for(const row of measurements){
     fields(row,{scope:'Private entry-only observation; terminated after native entry; no accepted wins',terminatedAtEntry:true});
     const match=row.observed.match(/^NATIVE_ENTRY beforeDwell(\d+) beforeCard25300 afterEntry25303 delta3 phase3 dwellCalls(\d+)$/);
     assert(match);assert.equal(Number(match[1])+Number(match[2]),25300);
     const log=text(await read(base+`measured-entry-${row.speed}x-${row.seed}.log`));
     assert(log.includes(row.observed));assert(!log.includes('TORCHBEARER_RESULT '),'An entry-only probe cannot be presented as an earned victory');
     assert.match(text(await read(base+`failed-entry-${row.speed}x-${row.seed}.log`)),
      /torchbearer:FAIL:native Endless entry lost its common original Dancer phase/);
    }
   }
  }
  for(const [name,pin]of Object.entries(phase.historicalExecutableHashesOnly)){
   assert(['torchbearer-engine.js','torchbearer-engine.wasm'].includes(name));digest(pin);
   if(name.endsWith('.wasm'))assert.notEqual(pin,report.testArtifactSha256[name],'A developmental driver cannot be relabeled final');
  }
 }
 assert.deepEqual(Object.keys(contract.fixtureSha256).sort(),completeFixtures.sort(),'No missing or unreviewed test-input fixture');
 await verifyTorchBuildBindings({report,read,sha,engine,fullRunReport,productionBuildBytes});
 assert.equal(contract.productionBuildReceiptSha256,sha(historicalProductionBuildBytes));
 const normal=JSON.parse(historicalProductionBuildBytes);
 assert.deepEqual(contract.normalArtifactSha256,Object.fromEntries(Object.entries(normal.outputs).map(([name,pin])=>[name,pin.sha256])));
 await verifyTorchSourceBounds({read,sha,engine});
 fields(report,{status:'PASS',assetBundleId:engine.assetBundleId,nativeArtInputs:942});
 const assetsBytes=await read('tests/torchbearer-assets.json'),assets=JSON.parse(assetsBytes);
 assert.equal(report.assetFixtureSha256,sha(assetsBytes));assert.equal(assets.assetBundleId,engine.assetBundleId);
 assert.deepEqual(assets.files['main.pak'],{bytes:45453180,sha256:'5878326408285cb01f83b4fa4edcc66d65e727f6d6ee88563b5b3b287dd259fc'});
 const artBytes=await read('tests/torch-native-art-inputs.json');
 assert.equal(sha(artBytes),'cecd07bb68c7592959cc9587d5a80ed7c8243934bd96b62cef82549ade7a5f46');
 assert.equal(report.nativeArtFixtureSha256,sha(artBytes));const art=JSON.parse(artBytes);
 assert.equal(Object.keys(art.sourceInputs).length,942);fields(art,{assetBundleId:engine.assetBundleId,mainPakSha256:assets.files['main.pak'].sha256});
 for(const [name,pin]of Object.entries(art.sourceInputs)){safeName(name);integer(pin.bytes,1);digest(pin.sha256);}
 for(const name of ['compiled/reanim/Zombie_FlagPole.reanim.compiled','compiled/reanim/Torchwood.reanim.compiled',
  'reanim/Zombie_flaghand.png','reanim/Zombie_flagpole.png','reanim/Torchwood_fire1a.png',
  'reanim/Torchwood_fire1b.png','reanim/Torchwood_fire1c.png'])
  assert(Object.hasOwn(art.sourceInputs,name),'Original torch/hand/flame artwork resource: '+name);
 assert.equal(report.scenarios.length,60);assert.deepEqual(report.scenarios.map(key).sort(),matrix.map(key).sort());
 const executedInputs=[...live.filter(name=>!name.endsWith('/build-torchbearer.py')&&!name.endsWith('/torch1-development-history.json')),
  'tests/torchbearer-verification-contract.json','tests/torch-fire-drill-headless-card-parent.bmp'].map(name=>name.slice(6)).sort();
 assert.deepEqual(Object.keys(report.testInputSha256).sort(),executedInputs);
 for(const [name,pin]of Object.entries(report.testInputSha256)){
  safeName(name);assert(!name.includes('/'));digest(pin);assert.equal(sha(await read('tests/'+name)),pin,'The complete matrix executes the same frozen inputs: '+name);
 }
 const runner=text(await read('tests/test-torchbearer.py'));
 assert(runner.includes("process=subprocess.run([node,str(script),str(TESTS/'torchbearer-engine.js'),str(assets),name,str(speed),str(seed)]"),
  'Every case executes the one authenticated production-linked driver, rather than selecting an artifact per row');
 assert(runner.includes('verify_inputs(build);report={**build'),
  'The report reauthenticates the full source, artifact and input graph after all sixty executions');
 for(const row of report.scenarios){
  fields(row,{resourceCapacityWarnings:0});
  if(names.slice(0,9).includes(row.name))verifyTorchFireScenario(row);
  else if(row.name==='endless-unlock')verifyTorchEarnedUnlockScenario(row);else verifyTorchSyntheticScenario(row);
  await verifyTorchCaseLog(row,{read,sha});
 }
 assert.equal(report.checks,CURRENT_SOURCE_COUNT+report.scenarios.reduce((sum,row)=>sum+row.checks,0));
 const controls=report.scenarios.filter(row=>row.family==='synthetic-controls');assert.equal(controls.length,20);
 assert.equal(controls.reduce((sum,row)=>sum+row.countedEarnedWins,0),0);
 const fires=report.scenarios.filter(row=>row.family==='fire-drill'),chains=report.scenarios.filter(row=>row.family==='earned-unlock-chain');
 assert.equal(fires.length,36);assert.equal(chains.length,4);
 assert.equal(fires.reduce((sum,row)=>sum+row.winTicks.length,0)+chains.length,40);
 assert.equal([...fires,...chains].reduce((sum,row)=>sum+row.profileCredits,0),40);
 assert.equal(chains.reduce((sum,row)=>sum+row.earnedEndlessFlags,0),40);
 assert.equal(fires.filter(row=>row.outcome==='native-loss').length+fires.filter(row=>row.nativeRetryLossObserved).length,8);
 assert.equal(fires.filter(row=>row.checkpoint.performed).length,16);
 assert.equal(report.speedPairs.length,30);
 assert.deepEqual(report.speedPairs.map(pair=>pair.name+'/'+pair.seed).sort(),names.flatMap(name=>[1729,7331].map(seed=>name+'/'+seed)).sort());
 for(const pair of report.speedPairs){
  fields(pair,{semanticResultEqual:true});const rows=report.scenarios.filter(row=>row.name===pair.name&&row.seed===pair.seed).sort((a,b)=>a.speed-b.speed);
  assert.deepEqual(rows.map(row=>row.speed),[1,2]);
  const compare=['family','outcome','profileCredits'];
  if(!names.slice(9,14).includes(pair.name)){
   compare.push('nativePlacements');
   if(pair.name==='endless-unlock')compare.push('earnedEndlessFlags','torchbearers','firstSnowPeaFlag','nativeSnowPeaPlacements',
    'nativeAcceptedPackets','remainingPackets','mowersRemaining');
   else compare.push('authoredZombies','torchbearers','native150TickHesitations','failureAndRetry','replayCompleted',
    'nativeMowersRemaining','nativePlantsRemaining','nativeFormationLedger','nativeAwardState');
  }
  for(const name of compare)assert.deepEqual(rows[0][name],rows[1][name],'Actual1x/2x outcome: '+name);
  const time=pair.name==='endless-unlock'?'flagTicks':'winTicks';
  assert.equal((rows[0][time]||[]).length,(rows[1][time]||[]).length);
  const deltas=(rows[0][time]||[]).map((tick,i)=>Math.abs(tick-rows[1][time][i]));
  assert.deepEqual(pair.nativeTickDeltas,deltas);for(const delta of deltas)integer(delta,0,30);
 }
 assert.equal(sha(previousArtBytes),'e4b04a29302b31268b9aed1563c7a03bccd174fdb55f36bb7bda75a832df74e4');
 const previous=JSON.parse(previousArtBytes),current=JSON.parse(currentArtBytes);
 assert.equal(previous.cards.length,17);assert.equal(current.cards.length,19);
 assert.deepEqual({...current,cards:current.cards.slice(0,17)},previous);
 fields(current.cards[17],{mode:90,name:'Fire Drill',generatedArtworkUsed:false,background:'IMAGE_BACKGROUND1'});
 for(const field of ['tip','tips','descriptionBelowCard'])assert(!Object.hasOwn(current.cards[17],field));
 console.log('PASS all60 actual O2 Torch cases:40 earned FireDrill clears,40 earned Endless flags,16 battle saves,8 natural losses,20 isolated controls and30 native speed pairs.');
}
