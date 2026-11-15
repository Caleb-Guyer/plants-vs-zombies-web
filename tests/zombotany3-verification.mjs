// SPDX-License-Identifier: MIT
// Independent acceptance of the complete production-linked night battle.
// Development probes, projected reports and synthetic controls cannot earn wins.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CURRENT_ENGINE_ID,CURRENT_SOURCE_COUNT,CURRENT_OBJECT_COUNT,reconstructGustSources}
 from './native-release-context.mjs';

// Independently reviewed actual .2 O2 execution: 36 cases, 18 speed pairs and
// 4,965,031 checks against unchanged normal production receipt 80552800... .
// The .1 archive and observations remain immutable history. Only runner raw-log
// hashes are omitted from canonical observation identity.
// ROOT reviewed all36 actual cases/raw logs and23 rejection controls against
// the unchanged published native3 behavior and current886/151 production graph.
const acceptedContractPins=new Set(['75f7538960eaf8be5a2ef90835e2c63f675ce3c1be77f6172935580d7de9df12']);
const acceptedReportPins=new Set(['aabf8f56ca39a9a7eea390423e8f0e4673d5268fcd6a3d98ffdf454864e101d8']);
const acceptedReportContentPins=new Set(['470a691fa8be99eb677e46e3b206d0f80e4d8131dbfc3665068a3adc79d42c1b']);
const names=['normal','hesitation','save-windup','save-freeze','retry','replay','no-action','mechanics','presentation'];
const battleNames=names.slice(0,7);
export const ZOMBOTANY3_MATRIX=[1729,7331].flatMap(seed=>names.flatMap(name=>[1,2].map(speed=>[name,speed,seed])));
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
const nativeStats={bodyHealth:270,puffRange:180,puffDamage:20,puffCadence:150,puffWindup:35,puffLifetime:60,
 fumeRange:240,fumeDamage:20,fumeCadence:200,fumeWindup:50,iceRange:300,iceWindup:125,freezeTicks:150,hostilePuffMarker:-303};
const course={nightOnly:true,pool:false,fog:false,roof:false,nativeSeedChooser:true,conveyor:false,startingSun:50,mowers:5,
 waves:20,openingDelay:1800,authoredZombies:99,authoredTypes:{0:1,1:2,35:61,36:33,37:2},nativeGraveEmergencesSeparate:true};
const waves=[[0,1,0,0],[1,1,0,0],[0,2,0,0],[0,2,0,0],[0,2,1,0],
 [0,2,1,0],[0,3,1,0],[0,3,1,0],[0,3,2,0],[0,3,2,1],
 [0,3,2,0],[0,3,2,0],[0,4,2,0],[0,4,2,0],[0,4,2,0],
 [0,4,3,0],[0,4,3,0],[0,4,3,0],[0,4,3,0],[0,5,3,1]];
const ledger=waves.map(([normal,puff,fume,ice],index)=>[[0,normal],[1,(index+1)%10===0?1:0],[35,puff],[36,fume],[37,ice]].filter(([,count])=>count));
const emptyLedger=waves.map(()=>[]);
const savedPaths=['src/Lawn/Plant.h','src/Lawn/Zombie.h','src/Lawn/Board.h','src/Lawn/Challenge.h','src/LawnApp.h',
 'src/Lawn/System/SaveGame.cpp','src/Lawn/System/PlayerInfo.cpp','src/Lawn/System/PlayerInfo.h'];
const expectedInputs=['zombotany3-harness.cpp','zombotany3-policy.h','zombotany3-verification-contract.json',
 'zombotany3-controls.h','zombotany3-battles.h','test-zombotany3.py','zombotany3-native-art-inputs.json',
 'zombotany3-assets.json','test-pool-panic.py','zombotany3-presentation-controls.h',
 'zombotany3-followup-plan.json','zombotany3-v1-zero-health-fixture.json',
 'zombotany3-v1-zero-health/userdata/game1_93.v4','zombotany3-v1-zero-health/userdata/user1.dat',
 'zombotany3-v1-zero-health/userdata/users.dat'];
const legacySavePins={
 'zombotany3-v1-zero-health/userdata/game1_93.v4':{bytes:43035,sha256:'b5e1fe320075c35443a6e0a27c4d6f8b5a5cd5456bd31bf80b5142f9d9d229db'},
 'zombotany3-v1-zero-health/userdata/user1.dat':{bytes:886,sha256:'86aa42ea66702a533af355141ed9d471eb32c0f68c1c2f3670973769e4308c59'},
 'zombotany3-v1-zero-health/userdata/users.dat':{bytes:41,sha256:'23f294a550cedf91761eaaf333926e4a26a3eef567f7676bc8e14fb661f66888'}
};

export function verifyZombotany3ReportIdentity({reportBytes,sha}){
 const report=json(reportBytes);assert(Array.isArray(report.scenarios)&&report.scenarios.length===36);
 const scenarios=report.scenarios.map(row=>{digest(row.logSha256);const {logSha256,...native}=row;return native;});
 assert(acceptedReportContentPins.has(sha(Buffer.from(JSON.stringify(canonical({...report,scenarios}))))),
  'No independently reviewed actual complete 36-case Zombotany3 matrix is accepted yet');
 return {report,sealedReport:acceptedReportPins.has(sha(reportBytes))};
}

export async function verifyZombotany3SourceBounds({read,sha,engine}){
 assert.equal(CURRENT_ENGINE_ID,'0.2.6-web-zombotany45.1');assert.equal(CURRENT_SOURCE_COUNT,886);assert.equal(CURRENT_OBJECT_COUNT,151);
 const parent=await reconstructGustSources({referenceBytes:fs.readFileSync(new URL('./fixtures/zombotany3-parent-reference.json',import.meta.url)),read,sha,engine});
 assert.equal(parent.files.size,878);
 for(const path of savedPaths)assert.deepEqual(Buffer.from(await read('source/'+path)),parent.files.get(path),'Exact existing saved class/serializer: '+path);
 let enums=text(await read('source/src/ConstEnums.h'));
 for(const line of ['\tCHALLENGE_PAGE_ZOMBOTANY = 5,\n','\tGAMEMODE_CHALLENGE_ZOMBOTANY_3 = 93,\n',
  '\tGAMEMODE_CHALLENGE_ZOMBOTANY_4 = 94,\n','\tGAMEMODE_CHALLENGE_ZOMBOTANY_5 = 95,\n',
  '\tZOMBIE_PUFF_HEAD,\n','\tZOMBIE_FUME_HEAD,\n','\tZOMBIE_ICE_HEAD,\n',
  '\tZOMBIE_SEA_HEAD,\n','\tZOMBIE_CABBAGE_HEAD,\n','\tZOMBIE_KERNEL_HEAD,\n','\tZOMBIE_MELON_HEAD,\n']){
  assert.equal(enums.split(line).length,2,'One appended stable ID: '+line.trim());enums=enums.replace(line,'');
 }
 enums=enums.replace('\tNUM_GAME_MODES = 96','\tNUM_GAME_MODES = 93');
 assert.equal(enums,text(parent.files.get('src/ConstEnums.h')),'All prior real mode/seed/zombie IDs remain unchanged');
 const header=text(await read('source/src/Lawn/System/Zombotany3.h'));
 for(const [name,value]of Object.entries({kProfileIndex:92,kRulesVersion:1,kWaveCount:20,kStartingSun:50,kOpeningDelay:1800,
  kPuffRange:180,kPuffDamage:20,kPuffCadence:150,kPuffWindup:35,kPuffLifetime:60,kFumeRange:240,kFumeDamage:20,
  kFumeCadence:200,kFumeWindup:50,kIceRange:300,kIceWindup:125,kFreezeTicks:150,kHostilePuffMarker:-303}))
  assert(header.includes(`${name} = ${value};`),'Independently fixed native rule: '+name);
 assert(header.includes('kActive = static_cast<ChallengeState>(146)'));
 const authored=header.match(/kWaves\s*=\s*\{\{([\s\S]*?)\}\};/);assert(authored);
 assert.deepEqual([...authored[1].matchAll(/\{(\d+),(\d+),(\d+),(\d+)\}/g)].map(match=>match.slice(1).map(Number)),waves);
 assert.equal(ledger.flat().reduce((sum,[,count])=>sum+count,0),99);
 const challenge=text(await read('source/src/Lawn/System/Zombotany3.cpp'));
 for(const exact of ['zombie.mSummonCounter=Cadence(zombie)-Windup(zombie);','zombie.mBossBungeeCounter=Windup(zombie);',
  'zombie.mSummonCounter=-1;','zombie.mBoard->mChallenge->mChallengeGridX=zombie.mBoard->mMainCounter;',
  'board.mChallenge->mChallengeGridX!=board.mMainCounter','plant.mPlantHealth<=0','Zombotany3Art::GetMouthPosition(zombie,x,y)',
  'static_cast<int>(x)-13,static_cast<int>(y)-13','zombie.mMindControlled?9:kHostilePuffMarker',
  'target->mRow!=source.mRow || !target->EffectedByDamage(9)','target->TakeDamage(kFumeDamage,2);',
  'body->PropogateColorToAttachments();',
  'projectile.mProjectileAge>=kPuffLifetime','projectile.mDamageRangeFlags==kHostilePuffMarker'])assert(challenge.includes(exact),exact);
 assert.equal(challenge.split('if(plant->mPlantHealth<=0)plant->Die();').length,3,
  'Both new hostile ranged hits resolve exact-lethal damage through native plant death');
 assert(challenge.includes('plant.mApp->mGameScene==SCENE_PLAYING && plant.mIsOnBoard && !plant.mDead && plant.mPlantHealth<=0'),
  'Legacy zero-health cleanup runs before abilities only on live, on-board plants during play');
 assert(!challenge.includes('EffectedByDamage(2)'),'Native range flags are distinct from native piercing damage flags');
 assert(!/\.(?:mBodyHealth|mBodyMaxHealth|mHelmHealth|mShieldHealth|mVelX)\s*[+*/-]?=/.test(challenge),
  'The new heads do not rewrite native carrier health, gear or gait');
 const definitions=source=>text(source).match(/constinit const ChallengeDefinition gChallengeDefs[^]*?\n\};/)?.[0];
 const oldDefinitions=definitions(parent.files.get('src/Lawn/Widget/ChallengeScreen.cpp'));
 const screen=text(await read('source/src/Lawn/Widget/ChallengeScreen.cpp'));
 const currentDefinitions=definitions(screen);assert(oldDefinitions&&currentDefinitions);
 const currentRows=currentDefinitions.split('\n').filter(line=>line.includes('.mChallengeMode ='));
 const priorRows=oldDefinitions.split('\n').filter(line=>line.includes('.mChallengeMode ='));
 assert.equal(currentRows.length,95);assert.equal(priorRows.length,92);
 assert.deepEqual(currentRows.slice(0,92).map(line=>line.replace(/,?\s*$/,'')),priorRows.map(line=>line.replace(/,?\s*$/,'')),
  'Original challenge definitions, positions, names and record bindings are retained');
 assert(currentRows[92].includes('GAMEMODE_CHALLENGE_ZOMBOTANY_3')&&currentRows[92].includes('CHALLENGE_PAGE_ZOMBOTANY'));
 assert(screen.includes('aDef.mChallengeMode == GAMEMODE_CHALLENGE_WAR_AND_PEAS ? 0 :'));
 assert(screen.includes('aDef.mChallengeMode == GAMEMODE_CHALLENGE_WAR_AND_PEAS_2 ? 1 :'));
 assert(screen.includes('aDef.mChallengeMode == GAMEMODE_CHALLENGE_ZOMBOTANY_3 ? 2 :'));
 assert(screen.includes('aDef.mChallengeMode == GAMEMODE_CHALLENGE_ZOMBOTANY_4 ? 3 :'));
 assert(screen.includes('aDef.mChallengeMode == GAMEMODE_CHALLENGE_ZOMBOTANY_5 ? 4 : -1;'));
 for(const [index,mode,col]of [[93,4,3],[94,5,4]])assert(currentRows[index].includes('GAMEMODE_CHALLENGE_ZOMBOTANY_'+mode)&&
  currentRows[index].includes('CHALLENGE_PAGE_ZOMBOTANY')&&currentRows[index].includes('.mRow = 0')&&currentRows[index].includes('.mCol = '+col));
 assert(screen.includes('const ChallengePage aAccessPage = mPageIndex == CHALLENGE_PAGE_ZOMBOTANY ? aDef.mPage : mPageIndex;'));
 for(const page of ['PUZZLE','SURVIVAL','CHALLENGE'])assert(screen.includes('aAccessPage == CHALLENGE_PAGE_'+page),
  'Family aliases retain the original access-page tooltip branch: '+page);
 return parent;
}

export async function verifyZombotany3BuildBindings({report,read,sha,engine,fullRunReport,productionBuildBytes}){
 fields(report,{execution:'complete-production-engine',optimization:'O2',engineId:CURRENT_ENGINE_ID,mode:93,profileIndex:92,
  productionObjectCount:151,failures:0,exitCode:0,presentationControlsAvailable:true,developmentNoArt:false});
 assert.equal(engine.id,CURRENT_ENGINE_ID);assert.equal(Object.keys(report.sourceSha256).length,886);
 assert.equal(Object.keys(report.productionObjectSha256).length,151);
 assert.deepEqual(report.sourceSha256,fullRunReport.sourceSha256);assert.deepEqual(report.productionObjectSha256,fullRunReport.productionObjectSha256);
 for(const [name,pin]of Object.entries(report.sourceSha256)){safeName(name);assert(name.startsWith('source/'));digest(pin);assert.equal(sha(await read(name)),pin,name);}
 for(const [name,pin]of Object.entries(report.productionObjectSha256)){safeName(name);digest(pin);assert(name.endsWith('.o'));}
 const normal=json(productionBuildBytes);fields(normal,{status:'PASS',exitCode:0,sourceUnchangedDuringBuild:true,sourceFiles:886});
 assert.equal(report.productionBuildReceiptSha256,sha(productionBuildBytes));
 for(const snapshot of ['source-before.json','source-after.json']){
  const pins=json(await read('logs/'+snapshot));
  assert.deepEqual(Object.fromEntries(Object.entries(pins).map(([name,pin])=>['source/'+safeName(name),pin])),report.sourceSha256,
   'Both ordinary production build snapshots bind all 886 final sources: '+snapshot);
 }
 for(const suffix of ['js','wasm'])assert.equal(normal.outputs['build/pvz-portable.'+suffix].sha256,engine.artifacts[suffix+'Sha256']);
 const build=json(await read('tests/zombotany3-build.json'));
 for(const name of ['execution','optimization','productionObjectCount','productionBuildReceiptSha256','generatedHarnessSha256',
  'builderSha256','policySha256','controlSha256','verificationContractSha256','testInputSha256','testArtifactSha256','sourceSha256','productionObjectSha256'])
  assert.deepEqual(report[name],build[name],'One unchanged complete native driver: '+name);
 fields(build,{presentationControlsAvailable:true,developmentNoArt:false});
 for(const [field,name]of Object.entries({generatedHarnessSha256:'zombotany3-harness.cpp',builderSha256:'build-zombotany3.py',
  runnerSha256:'test-zombotany3.py',policySha256:'zombotany3-policy.h',controlSha256:'zombotany3-controls.h',
  verificationContractSha256:'zombotany3-verification-contract.json'}))assert.equal(report[field],sha(await read('tests/'+name)),name);
 assert.deepEqual(Object.keys(build.testInputSha256).sort(),[...expectedInputs].sort());
 for(const [name,pin]of Object.entries(build.testInputSha256)){
  safeName(name);assert(!name.includes('/')||Object.hasOwn(legacySavePins,name));digest(pin);assert.equal(sha(await read('tests/'+name)),pin,name);
 }
 const legacyBytes=await read('tests/zombotany3-v1-zero-health-fixture.json');
 assert.equal(sha(legacyBytes),'60c578aa36a3f711f8b7c463220f135a1c6022e104876f02da920ccf30acb4e4');
 const legacy=json(legacyBytes);fields(legacy,{schemaVersion:1,originEngineId:'0.2.6-web-zombotany3.1',
  originArchiveSha256:'71d73740aaab996a7cdba2565ecf7aa60841e70184386ede3ab967f33766cdf9',
  nativeBuildReceiptSha256:'4c74070ff45da66e21bbf2c227b4f8532c9a940672963a46bbbf951240458653',
  syntheticFixture:true,binaryPatched:false,profileCredits:0,
  expectedBeforeContinue:{mode:93,row:2,column:4,seed:9,health:0,alive:true,freezeLease:0}});
 assert.deepEqual(legacy.files,Object.fromEntries(Object.entries(legacySavePins).map(([name,pin])=>['tests/'+name,pin])));
 for(const [name,pin]of Object.entries(legacySavePins)){const bytes=await read('tests/'+name);assert.equal(bytes.length,pin.bytes);assert.equal(sha(bytes),pin.sha256);}
 assert.deepEqual(Object.keys(report.testArtifactSha256).sort(),['zombotany3-engine.js','zombotany3-engine.wasm']);
 for(const suffix of ['js','wasm'])assert.equal(sha(await read('tests/zombotany3-engine.'+suffix)),report.testArtifactSha256['zombotany3-engine.'+suffix]);
 assert(WebAssembly.validate(await read('tests/zombotany3-engine.wasm')));return build;
}

export async function verifyZombotany3CaseLog(row,{read,sha}){
 assert(ZOMBOTANY3_MATRIX.some(([name,speed,seed])=>identity(row)===identity({name,speed,seed})));
 const path=`tests/zombotany3-logs/${row.name}-${row.speed}x-${row.seed}.log`,bytes=await read(path);
 digest(row.logSha256);assert.equal(sha(bytes),row.logSha256,path);
 const raw=text(bytes),records=raw.split('\n').filter(line=>line.startsWith('ZOMBOTANY3_RESULT '));assert.equal(records.length,1);
 const diagnostics=raw.split('\n').filter(line=>!line.startsWith('ZOMBOTANY3_RESULT ')).join('\n');
 assert(!/Too many (?:particle|emitters)|DataArray.*(?:full|exhaust|capacity)|(?:particle|reanimation).*capacity|memory access out of bounds|RuntimeError|zombotany3:FAIL/i.test(diagnostics));
 const actual=JSON.parse(records[0].slice('ZOMBOTANY3_RESULT '.length));
 const {logSha256,resourceCapacityWarnings,...observed}=row;assert.deepEqual(actual,observed,'Every raw native observation is retained, excluding only runner log metadata');
 fields(row,{resourceCapacityWarnings:0});return actual;
}

export function verifyZombotany3Checkpoint(cp){
 fields(cp,{performed:true,graphPreserved:true,exportRoot:'earned-zombotany3-checkpoint/userdata',profileCreditAtExport:0});
 assert.equal(cp.beforeGraph,cp.afterGraph);assert(cp.beforeGraph.length>100);
 for(const name of ['exportedBoardBytes','exportedUsersBytes','exportedProfileBytes'])integer(cp[name],1,16*1024*1024);
 const parts=cp.beforeGraph.split(';'),head=parts.shift().split(':').map(Number);
 assert.equal(head.length,21);assert(head.every(Number.isFinite));integer(head[1]);assert.equal(head[5],146);assert.equal(head[9],1);assert.equal(head[13],6);
 const records={a:[],snapshot:[],p:[],z:[],g:[],s:[],c:[],b:[],r:[]};
 // The current native graph adds the plant's actual animation counter to the
 // seventeen original scalar/rig fields and twenty-five magnet-item values.
 const widths={snapshot:54,p:43,z:29,g:13,s:12,c:5,b:8,r:8};
 for(const part of parts){const [tag,...tokens]=part.split(',');assert(Object.hasOwn(records,tag));
  if(tag==='a'){assert.equal(tokens.length,7);for(const i of [0,1,2,3,5])assert(Number.isFinite(Number(tokens[i])));for(const i of [4,6])assert(/^(?:[a-f0-9]{2})*$/.test(tokens[i]));records.a.push(tokens);}
  else {assert.equal(tokens.length,widths[tag]);const values=tokens.map(Number);assert(values.every(Number.isFinite));records[tag].push(values);}
 }
 assert.equal(records.snapshot.length,1);assert.equal(records.a.length,1);assert.equal(records.b.length,6);
 assert.deepEqual(records.b.map(values=>values[0]),[9,8,13,10,3,2]);
 for(const actor of records.z.filter(values=>[35,36,37].includes(values[1])&&values[8]))integer(actor[28],1);
 if(cp.kind==='save-windup'){
  integer(cp.charge,1,125);assert(records.z.some(actor=>[35,36,37].includes(actor[1])&&actor[27]===cp.charge));
 }else{assert.equal(cp.kind,'save-freeze');integer(cp.freezeLease,1,150);assert.equal(head[6],cp.freezeLease);}
 return records;
}

export function verifyZombotany3Scenario(row){
 assert(names.includes(row.name));assert([1,2].includes(row.speed)&&[1729,7331].includes(row.seed));integer(row.checks,21);
 fields(row,{execution:'complete-production-engine',mode:93,profileIndex:92,silentHardware:true,audioDeviceOpened:false});
 if(!battleNames.includes(row.name)){
  fields(row,{family:'synthetic-controls',outcome:'controls-pass',syntheticActorSetup:true,profileCredits:0,countedEarnedWins:0,all100ProfileRecordsPreserved:true});
  if(row.name==='mechanics'){
   fields(row,{nativeUntargetedUpdates:450,nativeTargetRejectionQueries:3,nativePuffWindupTicks:35,nativePuffDamage:20,
    nativePuffMovesLeft:true,nativePuffTerminates:true,nativeFumeDamagePerPlant:[0,40,40,40],nativeFumeWindupTicks:50,
    nativeFumeCadenceTicks:200,nativeHypnoPuffMovesRight:true,nativeHypnoPuffGroundDamage:20,nativeHypnoPuffRangeMask:9,
    nativeHypnoFumeGroundDamage:[20,20,20],nativeHypnoFumeForwardSameRowOnly:true,
    nativeIceWindupTicks:125,nativeFrozenPlantUpdates:150,nativeMaximumFreezeLease:150,
    nativeFrozenAbilityAndAnimationClocksHeld:true,nativeFrozenAttachedHeadUpdates:150,nativeFrozenBodyHeadFrameLoopClocksHeld:true,
    nativeFrostTintBodyAndAttachedHead:true,nativeFrostTintClearedAfterThaw:true,
    nativeThawResumed:true,nativeIceOneUse:true,nativeIceInterruptKinds:4,
    nativeNewHeadsGustQueries:3,nativeCounterHeadSaveGraphExact:true,directProductionAbilityUpdates:true,nativeSingleTickControlMeasurement:true});
   fields(row,{nativeLethalInitialHealth:[1,20,21,40],nativePuffLethalHealthAfter:[-19,0,1,20],
    nativeFumeLethalHealthAfter:[-19,0,1,20],nativePuffLethalDead:[1,1,0,0],nativeFumeLethalDead:[1,1,0,0],
    nativeLethalDamageChecks:8,nativeLethalAbilityClocksUnadvanced:true,nativeLegacyZeroHealthImported:true,
    nativeLegacyZeroHealthRemovedBeforeAbilities:true,nativeLegacyZeroHealthProfilePreserved:true,
    nativeLegacyZeroHealthOriginalModeUnchanged:true});
   integer(row.nativePuffMaximumObservedAge,3,59);integer(row.nativePuffMuzzleErrorMilliPixels,0,7999);
  }else{
   fields(row,{nativeAttachedMushroomHeads:3,nativeMouthNormalHypnoQueries:6,nativeIndependentPuffSpoutPoseQueries:8,
    nativeOriginalHeadTransformsExact:true,nativeUniqueNightCardExact:true,nativeBonusCardsPreserved:20,
    nativeFamilyRecordIndices:[15,31,92,93,94],nativeFamilyActualFooterInput:true,nativeFamilyOriginalRecordsPreserved:true,
    nativeFamilyCardFooterNoOverlap:true,native800x600Canvas:true});
   fields(row,{nativeAliasTooltipSyntheticProfile:true,nativeAliasTooltipOriginalVisible:true,
    nativeAliasTooltipFamilyVisible:true,nativeAliasTooltipLabelMatchesOriginal:true,
    nativeAliasTooltipDimensionsMatchOriginal:true,nativeAliasTooltipCanvasAndNeighborsClear:true,
    nativeAliasTooltipProfileRestored:true,nativeAliasTooltipHoverInputs:2,
    nativeAliasTooltipOriginalTrophiesNeeded:1,nativeAliasTooltipFamilyTrophiesNeeded:1,
    nativeAliasTooltipWidth:159,nativeAliasTooltipHeight:28,nativeAliasTooltipFamilyRect:[166,93,159,28]});
   for(const [name,maximum]of [['nativeVisiblePuffCenterMouthErrorMilliPixels',7999],['nativeVisiblePuffCenterOpaqueEdgeErrorMilliPixels',9999]]){
    assert.equal(row[name].length,8);row[name].forEach(value=>integer(value,0,maximum));
   }
   for(const [name,minimum]of [['nativeHeadDifferencePixels',201],['nativeAttackDifferencePerHead',81]]){
    assert.equal(row[name].length,3);row[name].forEach(value=>integer(value,minimum));
   }
   integer(row.nativeMissingHeadDifferencePixels,603);integer(row.nativeUpperBodyIdleDifferencePixels,243);
   integer(row.nativeAttackDifferencePixels,243);integer(row.nativeFamilyLayoutPairChecks,10);
  }
  return;
 }
 const loss=row.name==='no-action',replay=row.name==='replay',retry=row.name==='retry',credits=loss?0:replay?2:1;
 fields(row,{family:'night-zombotany',outcome:loss?'native-loss':'win',profileCredits:credits,nativeFamilyThirdCardInput:true,
  nativeSixMouseSeedChoices:true,nativeChooserOutroCompleted:true,nativeIntroCancelled:false,ordinaryNativeMouseInputsOnly:true,
  visibleOnlyPolicy:true,postStartActorHealthPositionStageTimeOrRNGEdits:false,observerNativeTicks:2,minimumInputCadenceTicks:150,
  nativeNightOnly:true,nativeConveyorBank:false,nativeOpeningSun:50,nativeOpeningMowers:5,
  all100ProfileRecordsPreservedExceptEarnedCredit:true,failureAndRetry:retry,nativeRetryResetsNight:retry,nativeReplayCompleted:replay,
  syntheticInitialAdventureProfile:true,nativeGameOver:loss});
 assert.equal(row.nativeProfileRecordsBefore.length,100);assert.equal(row.nativeProfileRecordsAfter.length,100);
 row.nativeProfileRecordsBefore.forEach(value=>integer(value));assert.equal(row.nativeProfileRecordsBefore[92],0);
 assert.deepEqual(row.nativeProfileRecordsAfter,row.nativeProfileRecordsBefore.map((value,index)=>value+(index===92?credits:0)));
 integer(row.nativeMaximumFreezeLease,0,150);integer(row.nativeGraveEmergences);integer(row.nativeMowersRemaining,0,5);
 if(loss){fields(row,{nativeActualAwardCollected:false,nativePlacements:0,nativeSunClicks:0,winTicks:[],replayWinTicks:[]});return;}
 fields(row,{nativeActualAwardCollected:true,nativeAwardWave:20,nativeAwardEnemies:0,nativeAwardType:8});
 assert.deepEqual(row.nativeFormationLedger,ledger);
 for(const name of ['nativePlacements','nativeSunClicks','nativeSunValueCollected','nativeSunSpent','nativeWindupsObserved','nativeTravelingPuffsObserved','nativeFumeReleasesObserved'])integer(row[name],1);
 assert.equal(row.winTicks.length,1);row.winTicks.forEach(value=>integer(value,1,260000));
 if(replay){assert.deepEqual(row.replayFormationLedger,ledger);assert.equal(row.replayWinTicks.length,1);integer(row.replayWinTicks[0],1,260000);}
 else {assert.deepEqual(row.replayFormationLedger,emptyLedger);assert.deepEqual(row.replayWinTicks,[]);}
 if(retry)integer(row.nativeRetryLossTick,1);else assert.equal(row.nativeRetryLossTick,0);
 if(row.name==='hesitation')integer(row.nativeHesitationWindows,19,20);
 assert.equal(row.checkpoint.performed,row.name.startsWith('save-'));
 if(row.checkpoint.performed){assert.equal(row.checkpoint.kind,row.name);verifyZombotany3Checkpoint(row.checkpoint);}
}

export async function verifyZombotany3(options){
 const {report,read,sha,engine,fullRunReport,productionBuildBytes,familyArtBytes}=options;
 const reportBytes=await read('tests/zombotany3-results.json');
 const authenticated=verifyZombotany3ReportIdentity({reportBytes,sha});assert.deepEqual(report,authenticated.report);
 const contractBytes=await read('tests/zombotany3-verification-contract.json');
 assert(acceptedContractPins.has(sha(contractBytes)),'The actual final preregistered complete Zombotany3 contract is not accepted yet');
 const contract=json(contractBytes);fields(contract,{schemaVersion:1,stage:'final-preregistered',engineId:CURRENT_ENGINE_ID,
  mode:93,profileIndex:92,sourceCount:886,productionObjectCount:151,rulesVersion:1,syntheticCasesEarnCredits:false,
  parentArchiveSha256:'10acb269866b175ed4836c2c64c6a79dc86a11241de9e48c7be54f8f89808be8'});assert.deepEqual(contract.matrix,ZOMBOTANY3_MATRIX);
 assert.deepEqual(contract.nativeStats,nativeStats);assert.deepEqual(contract.course,course);assert.deepEqual(contract.waves,waves);
 fields(contract.timing,{nativeObservationQuantum:2,minimumInputCadenceTicks:150,speedPairMaxDeltaTicks:30,
  noPostStartActorHealthPositionStageTimeOrRNGEdits:true,ordinaryNativeMouseInputsOnly:true});
 for(const name of [...expectedInputs.filter(name=>!name.endsWith('verification-contract.json')),'build-zombotany3.py','zombotany3-initial-plan.json'])
  assert(Object.hasOwn(contract.fixtureSha256,'tests/'+name),'Every executed input is preregistered: '+name);
 for(const [name,pin]of Object.entries(contract.fixtureSha256)){safeName(name);assert(name.startsWith('tests/'));digest(pin);assert.equal(sha(await read(name)),pin,name);}
 assert.equal(contract.priorAuthoredPlanSha256,sha(await read('tests/zombotany3-initial-plan.json')));
 await verifyZombotany3BuildBindings(options);await verifyZombotany3SourceBounds(options);
 fields(report,{status:'PASS',assetBundleId:engine.assetBundleId,nativeArtInputs:970});assert.equal(contract.nativeArtInputs,970);
 const assetBytes=await read('tests/zombotany3-assets.json'),assets=json(assetBytes);assert.equal(report.assetFixtureSha256,sha(assetBytes));
 fields(assets.files['main.pak'],{bytes:45453180,sha256:'5878326408285cb01f83b4fa4edcc66d65e727f6d6ee88563b5b3b287dd259fc'});
 const artBytes=await read('tests/zombotany3-native-art-inputs.json'),inputs=json(artBytes);assert.equal(report.nativeArtFixtureSha256,sha(artBytes));
 fields(inputs,{assetBundleId:engine.assetBundleId,mainPakSha256:assets.files['main.pak'].sha256});
 assert.equal(Object.keys(inputs.sourceInputs).length,report.nativeArtInputs);assert.equal(contract.nativeArtInputs,report.nativeArtInputs);
 const priorBytes=await read('tests/gust-bloom-native-art-inputs.json');
 assert.equal(sha(priorBytes),'900983b35e7346d6a6120af8257fa340937ff9d3b537df5ad70b35034959d3b8',
  'The 949 prior native art inputs retain their independently authenticated published Gust bytes');
 const prior=json(priorBytes);assert.equal(Object.keys(prior.sourceInputs).length,949);
 for(const [name,pin]of Object.entries(prior.sourceInputs))assert.deepEqual(inputs.sourceInputs[name],pin,'All prior original art remains pinned: '+name);
 for(const [name,pin]of Object.entries(inputs.sourceInputs)){safeName(name);integer(pin.bytes,1);digest(pin.sha256);}
 assert.equal(report.scenarios.length,36);assert.deepEqual(report.scenarios.map(identity).sort(),ZOMBOTANY3_MATRIX.map(([name,speed,seed])=>identity({name,speed,seed})).sort());
 for(const row of report.scenarios){verifyZombotany3Scenario(row);await verifyZombotany3CaseLog(row,{read,sha});
  if(row.family==='synthetic-controls'){
   assert(Object.keys(contract.controlExact[row.name]).length>=6);fields(row,contract.controlExact[row.name]);
   for(const [name,min]of Object.entries(contract.controlMinimum?.[row.name]||{}))integer(row[name],min);
   for(const [name,bounds]of Object.entries(contract.controlBounds?.[row.name]||{})){assert.equal(bounds.length,2);integer(row[name],bounds[0],bounds[1]);}
   for(const [name,rule]of Object.entries(contract.controlArrays?.[row.name]||{})){
    assert(Array.isArray(row[name]));assert.equal(row[name].length,rule.length);row[name].forEach(value=>integer(value,rule.minimum,rule.maximum));
   }
  }
 }
 assert.equal(report.checks,886+report.scenarios.reduce((sum,row)=>sum+row.checks,0));
 assert.equal(report.scenarios.filter(row=>row.family==='night-zombotany').length,28);
 assert.equal(report.scenarios.filter(row=>row.family==='synthetic-controls').length,8);
 assert.equal(report.scenarios.reduce((sum,row)=>sum+row.profileCredits,0),28);
 assert.equal(report.scenarios.filter(row=>row.family==='night-zombotany'&&row.checkpoint.performed).length,8);
 assert.equal(report.scenarios.filter(row=>row.nativeGameOver||row.failureAndRetry).length,8);
 assert.equal(report.speedPairs.length,18);assert.deepEqual(report.speedPairs.map(row=>row.name+'/'+row.seed).sort(),names.flatMap(name=>[1729,7331].map(seed=>name+'/'+seed)).sort());
 for(const pair of report.speedPairs){fields(pair,{semanticResultEqual:true});const rows=report.scenarios.filter(row=>row.name===pair.name&&row.seed===pair.seed).sort((a,b)=>a.speed-b.speed);
  assert.deepEqual(rows.map(row=>row.speed),[1,2]);for(const name of ['family','outcome','profileCredits'])assert.deepEqual(rows[0][name],rows[1][name]);
  if(rows[0].family==='night-zombotany')for(const name of ['nativePlacements','nativeSunClicks','nativeSunSpent','nativeFormationLedger',
   'replayFormationLedger','nativeAwardType','nativeAwardWave','nativeMowersRemaining','failureAndRetry','nativeReplayCompleted'])
   assert.deepEqual(rows[0][name],rows[1][name],'Exact native1x/2x result: '+name);
  const one=[...(rows[0].winTicks||[]),...(rows[0].replayWinTicks||[])],two=[...(rows[1].winTicks||[]),...(rows[1].replayWinTicks||[])];
  assert.equal(one.length,two.length);const deltas=one.map((value,index)=>Math.abs(value-two[index]));assert.deepEqual(pair.nativeTickDeltas,deltas);deltas.forEach(value=>integer(value,0,30));
 }
 const family=json(familyArtBytes);fields(family,{schemaVersion:1,family:'Zombotany',page:5,generatedArtworkUsed:false,
  sourceKind:'original native mushroom reanimation heads attached to original Zombotany zombie bodies',
  assetBundleId:engine.assetBundleId,assetManifest:'../game-assets/manifest.json',nativeWindow:{width:80,height:65}});
 assert.equal(family.cards.length,3);
 assert.deepEqual(family.cards.slice(0,2),[
  {mode:16,profileIndex:15,nativeName:'[WAR_AND_PEAS]',renderer:'IMAGE_CHALLENGE_THUMBNAILS',iconIndex:0,originalDefinitionUnchanged:true},
  {mode:32,profileIndex:31,nativeName:'[WAR_AND_PEAS_2]',renderer:'IMAGE_CHALLENGE_THUMBNAILS',iconIndex:0,originalDefinitionUnchanged:true}]);
 fields(family.cards[2],{mode:93,profileIndex:92,nativeName:'Zombotany 3',renderer:'Zombotany3Art::GetImage',background:'IMAGE_BACKGROUND2',
  heads:[{zombieType:35,reanimation:'REANIM_PUFFSHROOM'},{zombieType:36,reanimation:'REANIM_FUMESHROOM'},{zombieType:37,reanimation:'REANIM_ICESHROOM'}]});
 for(const card of family.cards)for(const field of ['tip','tips','descriptionBelowCard'])assert(!Object.hasOwn(card,field));
 return {cases:36,earnedCredits:28,nativeLosses:8};
}
