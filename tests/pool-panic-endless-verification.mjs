// SPDX-License-Identifier: MIT
// Independent checks of the packaged complete-engine report and fixed design
// contract. Synthetic controls and render samples never count as earned flags.
import assert from 'node:assert/strict';
import {CURRENT_ENGINE_ID, CURRENT_SOURCE_COUNT, CURRENT_OBJECT_COUNT, SCRAP_ENDLESS_RETENTION_SHA256} from './native-release-context.mjs';

const names=['normal','save-between-flags','save-active','retry-no-action','no-action','controls'];
const matrix=[1729,7331].flatMap(seed=>names.flatMap(name=>[1,2].map(speed=>[name,speed,seed])));
const summary={primaryNativeProgressRuns:16,explicitReplayProgressRuns:4,baseNativeProgressRuns:20,
 baseNativePrefixFlags:84,openingCorpusRuns:8,openingCorpusFlags:8,nativeProgressRuns:28,nativePrefixFlags:92,
 nativeStandaloneLossCases:4,isolatedControlCases:4,finiteVictoryCases:0};
const controlFields=['actualNativeInputs','nativePoolRows','nativeUnpurchasedWaterMowers','illegalKelpOnLandRejected',
 'illegalGroundOnBareWaterRejected','invalidPlacementRetainsPacket','selectionCancelled','nativeFullBankDeliveryFrozen',
 'nativeFullBankBeltMoves','nativeConsumedPacketRemoved','nativeDeliveryResumed','nativePause','checkpointGraphPreserved',
 'nativeHUDSafe','originalSurvivalBestOverlay','nativeShovelRemoveRebuild','weightedUsefulDuplicateCaps',
 'futureRngThroughContinue','legacyV4Migration','legacyAcceptedOrderPreserved','legacyMigrationOnlyOnce',
 'old200TickRegressionNegative','recognizableStreamingCards'];
const fixturePins={
 'pool-panic-endless-native-art-inputs.json':'65c53e2ed9cba7bc53d3dcfd36eb6a8c32c87d55f5e81be280c4a141915eb1e9',
 'pool-panic-endless-first-three-flags.json':'218acce7ee47156547d2e2986123cb5a195ffa0bbca4fd9a978f8cf6df700eee',
 'endless1-supply-negative.json':'07aa74eb81a12c1d554c75e00b5e03fa251c410025ff94bffb44ca605aa65a71',
 'endless2-verification-contract.json':'58e2d59fdcf9ad2c0cae93cbfb3781a79c8924419a8d2611676c8348ff94df2e',
};
const baseActors=[37,47,57,67,67,77];
const palette=['Repeater','Threepeater','Tallnut','Torchwood','Spikeweed','Lilypad','Squash','TangleKelp','CherryBomb','Jalapeno'];
const opening=['Repeater','Threepeater','Tallnut','Repeater','Lilypad','Torchwood'];
const policy={minimumRecognizableCardPixels:47,cardWidthPixels:50,decisionIntervalTicks:250,packetToTileLatencyTicks:25,
 missedDecisionsPerFlag:1,visibleFields:['packet type and visibility','legal tile feedback','plant type and cell','visible zombie type,row,x'],
 noKelpDumping:true,minimumMowerHeadroom:{opening:4,threeFlags:3,sixFlags:1}};
const bestValues=[0,1,999,1000,1500,9999,999499,999500,2147483647,4294967295];
const visualFiles=['pool-panic-endless-start.bmp','pool-panic-endless-bonus-card.bmp','pool-panic-endless-persistent-attacks.bmp',
 ...[1,2,3,4,5,6].map(n=>`pool-panic-endless-flag-${n}.bmp`),'pool-panic-endless-paused.bmp','pool-panic-endless-best-native.bmp',
 ...['new','survival'].flatMap(kind=>bestValues.map(value=>`pool-panic-endless-best-${kind}-${value}.bmp`))];
const digest=value=>assert.match(value,/^[a-f0-9]{64}$/);
const integer=(value,min=0,max=Number.MAX_SAFE_INTEGER,label='integer')=>{
 assert(Number.isSafeInteger(value)&&value>=min&&value<=max,`${label}: ${value}`);return value;
};
const equalFields=(row,expected)=>{for(const [field,value] of Object.entries(expected))assert.deepEqual(row[field],value,field);};
const method=(text,signature)=>{
 text=text.replace(/\r\n?/g,'\n');const start=text.indexOf(signature),first=text.indexOf('{',start);
 assert(start>=0&&first>start);let end=first+1,depth=1;
 while(depth){assert(end<text.length);depth+=(text[end]==='{')-(text[end]==='}');++end;}
 return text.slice(start,end);
};

function boundarySyncs(row,expected){
 assert.equal(row.boundarySyncCount,expected);assert.equal(row.boundarySyncs.length,expected);
 for(const [index,sync] of row.boundarySyncs.entries()){
  assert.equal(sync.call,index+1);integer(sync.boardBytes,1);integer(sync.profileBytes,1);
  digest(sync.boardSha256);digest(sync.profileSha256);
 }
}

function verifyPrefix(row,prefix,target){
 const get=suffix=>row[prefix+suffix];
 const number=(suffix,min=0,max=Number.MAX_SAFE_INTEGER)=>integer(get(suffix),min,max,prefix+suffix);
 equalFields(row,Object.fromEntries(Object.entries({PrefixFlags:target,FormationsCleared:target*10,
  InitialLilyPads:8,InitialPoolCleaners:0,InitialPoolRowMowers:2,QuotaPerFlag:48,PrefixFrozenAtBoundary:true,
  RosterFixtureMatched:true,PacketConservation:true,PostPrefixInputs:0,AwardsDropped:0,RetainedPadHealingEvents:0,
  TerminalGameOver:false,FlagZombies:target,HugeWaveWarnings:target,SuccessBanners:target,KelpDumpInputs:0})
  .map(([name,value])=>[prefix+name,value])));
 number('Variation',0,7);number('MinimumDecisionCardWidth',47,50);number('MaxPacketTail',0,515);
 number('AcceptedPackets',6,target*48);number('ConsumedPackets',1,target*48);number('RemainingPackets',0,10);
 assert.equal(get('AcceptedPackets'),get('ConsumedPackets')+get('RemainingPackets'),'Accepted packets are consumed or carried');
 const accepted=get('FlagAcceptedSupplies'),expired=get('FlagExpiredSupplies');
 assert.equal(accepted.length,target);assert.equal(expired.length,target);
 accepted.forEach((count,i)=>{integer(count,0,48);assert.equal(expired[i],48-count,'Only unissued quota expires');});
 assert.equal(accepted.reduce((a,b)=>a+b,0),get('AcceptedPackets'));
 const bests=get('FlagBests');assert.equal(bests.length,target);assert.deepEqual(get('FlagPersistedBests'),bests);
 bests.forEach((best,i)=>{integer(best,i+1,4294967295);if(i)assert(best>=bests[i-1],'Earned high-water best cannot fall');});
 number('PrefixBest',target,4294967295);assert.equal(bests.at(-1),get('PrefixBest'));
 assert.equal(get('TerminalFlags'),target);assert.equal(get('TerminalBest'),get('PrefixBest'));
 assert.equal(get('PersistedBest'),get('PrefixBest'));
 number('StopInputTick',1);assert.equal(get('TerminalTick'),get('StopInputTick'),'Positive prefix stops at a real boundary without fabricated loss');
 number('MowersRemaining',0,6);number('MowersTriggered',0,6);assert.equal(get('MowersRemaining')+get('MowersTriggered'),6);
 number('LilyPadsRemaining',0,14);number('PoolRowMowersRemaining',0,2);assert.equal(get('PoolCleanersRemaining'),0);
 assert(get('PoolRowMowersRemaining')<=get('MowersRemaining'));
 const headroom=get('FlagMowerHeadroom');assert.equal(headroom.length,target);
 headroom.forEach((count,i)=>{integer(count,0,6);if(i)assert(count<=headroom[i-1]);});
 assert(headroom[0]>=4);assert(headroom.at(-1)>=(target>=6?1:target>=3?3:4),'Ordinary missed decisions retain recovery headroom');
 assert.deepEqual(get('MissedDecisionFlags'),Array.from({length:target},(_,i)=>i));
 number('OriginalProjectiles',1);number('OriginalDamageEvents',1);number('TorchwoodFirePeas',1);number('HealthAcceleratedWaves',1);assert.equal(get('WarningPause'),true);
 const minimum=baseActors.slice(0,target).reduce((a,b)=>a+b,0);
 number('AuthoredZombies',minimum);number('WaterZombies');number('LandZombies');
 assert.equal(get('WaterZombies')+get('LandZombies'),get('AuthoredZombies'));
 if(target<=3)assert.equal(get('AuthoredZombies'),minimum,'Literal first-three roster actor count remains exact');
 for(const suffix of ['SnorkelsSpawned','DolphinsSpawned','ScreenDoorsSpawned','FootballSpawned','JacksSpawned',
  'LaddersSpawned','ZambonisSpawned','GargantuarsSpawned','SnorkelsEnteredPool','DolphinsEnteredPool'])number(suffix);
 if(target>=3){
  for(const [suffix,min] of Object.entries({SnorkelsSpawned:13,DolphinsSpawned:13,ScreenDoorsSpawned:8,FootballSpawned:6,
   SnorkelsEnteredPool:1,DolphinsEnteredPool:1}))number(suffix,min);
 }
 if(target>=6)for(const suffix of ['JacksSpawned','LaddersSpawned','ZambonisSpawned','GargantuarsSpawned'])number(suffix,1);
}

function verifyScenario(row,identity){
 const [name,speed,seed]=identity;
 equalFields(row,{execution:'complete-production-engine',name,speed,seed,profileIndex:86,profileCredits:0,
  awardCollected:false,finiteVictory:false,trophyCount:0,resourceCapacityWarnings:0});
 integer(row.checks,31);digest(row.logSha256);
 if(name==='controls'){
  equalFields(row,{outcome:'controls-pass',syntheticControls:true,renderOnlyProfileSamples:true});
  for(const field of controlFields)assert.equal(row[field],true,'Actual isolated native control: '+field);
  assert.equal(row.futureSequenceLength,12);assert.equal(row.futureSequence.length,12);
  for(const seedType of row.futureSequence)assert([7,18,23,22,21,16,17,19,2,20].includes(seedType),'Future saved RNG pick belongs to native palette');
  integer(row.legacyV4Bytes,1);integer(row.oldNegativeTail,516);integer(row.oldNegativeHiddenCards,1);
  integer(row.oldNegativeKelpCards,3);integer(row.recognizableFullBankCards,9,10);
  equalFields(row,{nativeFooterLabels:1,nativeFooterOverflowNegatives:1,nativeBestOverlaySamples:10,
   nativeBestOverlayMismatchPixels:0,nativeBestHighFitSamples:9,nativeUnsignedBestMaxCorrect:true,
   nativeBestCacheResidentImagesStable:true,nativeBestHighFitNameClear:true,nativeBestHeroClear:true});
  integer(row.nativeFooterBottom,1,599);integer(row.nativeFooterInkPixels,101);
  integer(row.nativeBestOverflowNegatives,3);integer(row.nativeBestOverlayBottom,1,76);integer(row.nativeBestOverlayInkPixels,1);
  equalFields(row,{nativeSpeedRectDerivedClicks:2,nativeSpeedButtonStates:12,nativeConeheadPoseSamples:24,
   nativeNewSpeedAddedConeObstructionPixels:0,nativeControlGapInkPixels:0});
  integer(row.nativeOldSpeedConeObstructionPixels,1);integer(row.nativeSpeedGlyphInkPixels,241);
  boundarySyncs(row,0);return;
 }
 if(name==='no-action'){
  equalFields(row,{outcome:'native-loss',nativeGameOver:true,nativeLegalPlacements:0,terminalFlags:0,bestFlags:0,persistedBest:0});
  boundarySyncs(row,0);return;
 }
 const target=name==='normal'?6:name==='opening-recovery'?1:3;
 equalFields(row,{outcome:'earned-prefix',nativeStatsUnchanged:true,actualPacketAndTileInputs:true,
  ordinaryVisibleInformationOnly:true,bonusReturned:true,nativeMenuPage:4,bestPersistent:true,noFiniteAward:true,
  policyIntervalTicks:250,mouseLatencyTicks:25});
 verifyPrefix(row,'native',target);
 const replay=name==='normal';assert.equal(row.replayCompleted,replay);assert.equal(row.replayStartsAtFlagZero,replay);
 if(replay){
  verifyPrefix(row,'replayNative',6);assert.equal(row.replayStartingBest,row.nativeTerminalBest);
  assert(row.replayNativePrefixBest>=row.replayStartingBest);assert(row.replayNativeTerminalBest>=row.nativeTerminalBest);
  assert.equal(row.postReplayBest,row.replayNativeTerminalBest);
 }else{assert.equal(row.replayNativePrefixFlags,0);assert.equal(row.replayNativeConsumedPackets,0);}
 const retry=name==='retry-no-action',lower=row.retryLower;
 assert.equal(row.failureAndRetry,retry);assert.equal(lower.performed,retry);
 if(retry){
  equalFields(row,{retryInitialFlags:0});equalFields(lower,{retryRestartFlags:0,bestBeforeLowerRetry:row.nativeTerminalBest,
   lowerRetryFlags:0,bestAfterLowerRetry:row.nativeTerminalBest,persistedBestAfterLowerRetry:row.nativeTerminalBest,
   nativeGameOver:true,noInputs:true,resetPath:'native-main-menu-card-new-game'});
  assert(lower.lowerRetryFlags<lower.bestBeforeLowerRetry,'A genuine lower native loss cannot overwrite a higher best');
 }
 const checkpoint=row.checkpoint,saved=name==='save-between-flags'||name==='save-active';assert.equal(checkpoint.performed,saved);
 if(saved){
  assert.equal(checkpoint.boundaryFieldsPreserved,true);integer(checkpoint.fileBytes,1);integer(checkpoint.tick,1);
  if(name==='save-between-flags')equalFields(checkpoint,{kind:'automatic-between-flags',source:'production-boundary-autosave',
   fileReadBeforeManualSave:true,nativeSavedFlags:1,loadedFlags:1,selectedGraphPreserved:false});
  else{
   equalFields(checkpoint,{kind:'native-active-projectile',source:'native-save-api',selectedGraphPreserved:true});
   integer(checkpoint.nativeSavedFlags,0,target-1);assert.equal(checkpoint.loadedFlags,checkpoint.nativeSavedFlags);
   assert.equal(row.nativeWarningCheckpoint,true);
  }
 }
 boundarySyncs(row,target+(replay?6:0));
}

export async function verifyPoolPanicEndless({report,read,sha,engine,fullRunReport,productionBuildBytes,immediateParentBytes}){
 equalFields(report,{execution:'complete-production-engine',optimization:'O2',failures:0,exitCode:0,nativeArtInputs:643});
 assert.match(report.status,/^PASS/);assert.equal(engine.id,CURRENT_ENGINE_ID);
 assert.equal(report.retentionAdapterSha256,SCRAP_ENDLESS_RETENTION_SHA256);
 assert.equal(sha(await read('tests/scrap1-endless-retention.json')),SCRAP_ENDLESS_RETENTION_SHA256);
 assert.equal(Object.keys(report.sourceSha256).length,CURRENT_SOURCE_COUNT);assert.deepEqual(report.sourceSha256,fullRunReport.sourceSha256);
 for(const [file,pin] of Object.entries(report.sourceSha256)){digest(pin);assert.equal(sha(await read(file)),pin);}
 assert.equal(report.productionObjectCount,CURRENT_OBJECT_COUNT);assert.equal(Object.keys(report.productionObjectSha256).length,CURRENT_OBJECT_COUNT);
 assert.deepEqual(report.productionObjectSha256,fullRunReport.productionObjectSha256);
 for(const pin of Object.values(report.productionObjectSha256))digest(pin);
 assert.equal(report.productionBuildReceiptSha256,sha(productionBuildBytes));
 assert.deepEqual(Object.keys(report.testArtifactSha256).sort(),['pool-panic-endless-engine.js','pool-panic-endless-engine.wasm']);
 for(const [file,pin] of Object.entries(report.testArtifactSha256)){digest(pin);assert.equal(sha(await read('tests/'+file)),pin);}
 assert(WebAssembly.validate(await read('tests/pool-panic-endless-engine.wasm')));
 for(const [file,field] of [['build-pool-panic-endless.py','builderSha256'],['test-pool-panic-endless.py','runnerSha256'],
  ['pool-panic-endless-assets.json','assetFixtureSha256'],['pool-panic-endless-harness.cpp','generatedHarnessSha256']])
  assert.equal(sha(await read('tests/'+file)),report[field]);
 const policyPin=sha(await read('tests/pool-panic-endless-ordinary-policy.h'));
 const inputs=['pool-panic-endless-ordinary-policy.h','endless3-late-fragment.cpp','endless3-late-policy.h',
  'endless3-late-actions.h','endless3-narrow-controls.h','endless3-early-equivalence.h','endless3-migration-controls.h'];
 assert.deepEqual(Object.keys(report.testInputSha256).sort(),inputs.sort(),'Only the reviewed opening, progression and migration drivers extend the test entry point');
 assert.equal(report.testInputSha256['pool-panic-endless-ordinary-policy.h'],policyPin,'The original pure ordinary-player policy remains an explicit unchanged build input');
 for(const name of inputs)assert.equal(report.testInputSha256[name],sha(await read('tests/'+name)),'Exact reviewed test-only input: '+name);
 const build=JSON.parse(await read('tests/pool-panic-endless-build.json'));
 for(const field of ['execution','optimization','productionObjectCount','productionBuildReceiptSha256','generatedHarnessSha256',
  'builderSha256','testArtifactSha256','sourceSha256','productionObjectSha256','testInputSha256'])
  assert.deepEqual(report[field],build[field],'Exact normal production backend/test-only driver binding: '+field);
 assert.equal(report.assetBundleId,engine.assetBundleId);
 const assets=JSON.parse(await read('tests/pool-panic-endless-assets.json'));assert.equal(assets.assetBundleId,engine.assetBundleId);
 assert.deepEqual(assets.files['main.pak'],{bytes:45453180,sha256:'5878326408285cb01f83b4fa4edcc66d65e727f6d6ee88563b5b3b287dd259fc'});
 assert.deepEqual(report.fixturesSha256,fixturePins);assert.equal(report.verificationContractSha256,fixturePins['endless2-verification-contract.json']);
 for(const [file,pin] of Object.entries(fixturePins))assert.equal(sha(await read('tests/'+file)),pin,'Independently frozen fixture: '+file);
 const contract=JSON.parse(await read('tests/endless2-verification-contract.json'));
 equalFields(contract,{schemaVersion:2,mode:87,profileIndex:86,rulesVersion:2,nativeArtInputs:643});
 assert.deepEqual(contract.matrix,matrix);assert.deepEqual(contract.summary,summary);assert.deepEqual(contract.ordinaryPolicy,policy);
 assert.deepEqual(contract.progressTargets,{normal:6,normalReplay:6,'save-between-flags':3,'save-active':3,'retry-no-action':3});
 assert.deepEqual(contract.openingCorpus,{runs:8,flagsPerRun:1,speed:1,actualSavedVariations:[0,1,2,3,4,5,6,7],
  seedSelection:'Fresh-process native pre-game seed scan; no in-game variation/RNG edits'});
 assert.deepEqual(contract.firstSixBaseActors,baseActors);assert.deepEqual(contract.palette,palette);assert.deepEqual(contract.openingSeeds,opening);
 assert.deepEqual(contract.controlFields,controlFields);assert.deepEqual(contract.visualFiles,visualFiles);assert.equal(visualFiles.length,31);
 assert.deepEqual(contract.fixtureSha256,Object.fromEntries(Object.entries(fixturePins).filter(([name])=>name!=='endless2-verification-contract.json')));
 const negative=JSON.parse(await read('tests/endless1-supply-negative.json'));
 assert.equal(typeof immediateParentBytes,'function','Negative is authenticated against exact published Endless.1 source');
 assert.equal(sha(await immediateParentBytes('src/Lawn/System/PoolPanicEndless.cpp')),negative.parentSourceSha256);
 assert.equal(sha(await immediateParentBytes('src/Lawn/System/PoolPanicEndless.h')),negative.parentHeaderSha256);
 assert.equal(negative.authenticatedUpdateSupply,method((await immediateParentBytes('src/Lawn/System/PoolPanicEndless.cpp')).toString(),'void UpdateSupply(')+'\n');
 equalFields(negative,{release:'0.2.6-web-endless.1',repositoryCommit:'b8b78002d2bfdcc1f3c061ef7f9c7a911d67c67f',nativeIntervalTicks:200,openingPackets:4});
 const verifyCaseLog=async row=>{
  const bytes=await read(`tests/pool-panic-endless-logs/${row.name}-${row.speed}x-${row.seed}.log`);
  assert.equal(sha(bytes),row.logSha256,'Each reported case is bound to its actual complete-engine output log');
  const text=bytes.toString(),lines=text.split(/\r?\n/),prefix='POOL_PANIC_ENDLESS_RESULT ',bridge='ENDLESS_BOUNDARY_SYNC_RESULT ';
  const records=lines.filter(line=>line.startsWith(prefix));assert.equal(records.length,1);
  const raw=JSON.parse(records[0].slice(prefix.length)),syncs=lines.filter(line=>line.startsWith(bridge)).map(line=>JSON.parse(line.slice(bridge.length)));
  const warnings=['Too many particle emitters','Too many particle systems','Too many particles'].reduce((sum,warning)=>sum+text.split(warning).length-1,0);
  assert.deepEqual(row,{...raw,boundarySyncs:syncs,boundarySyncCount:syncs.length,logSha256:sha(bytes),resourceCapacityWarnings:warnings},'Actual native JSON and persistence callbacks match every reported outcome field');
 };
 const key=row=>`${row.name}/${row.speed}/${row.seed}`;
 assert.equal(report.scenarios.length,24);assert.deepEqual(report.scenarios.map(key).sort(),matrix.map(([name,speed,seed])=>key({name,speed,seed})).sort());
 for(const row of report.scenarios){verifyScenario(row,[row.name,row.speed,row.seed]);await verifyCaseLog(row);}
 const corpus=report.openingCorpus;assert.equal(corpus.length,8);
 assert.deepEqual(corpus.map(row=>row.nativeVariation).sort((a,b)=>a-b),[0,1,2,3,4,5,6,7]);
 const scan=report.openingCorpusSeedScan;assert(Array.isArray(scan));integer(scan.length,8,256);
 const firstSeedByVariation=new Map();
 scan.forEach((sample,index)=>{
  assert.equal(sample.seed,100+index);integer(sample.variation,0,7);assert.equal(sample.preGameSeedOnly,true);
  if(!firstSeedByVariation.has(sample.variation))firstSeedByVariation.set(sample.variation,sample.seed);
 });
 assert.equal(firstSeedByVariation.size,8);
 for(const sample of scan){
  const text=(await read(`tests/pool-panic-endless-logs/variation-probe-1x-${sample.seed}.log`)).toString();
  const prefix='POOL_PANIC_ENDLESS_RESULT ',records=text.split(/\r?\n/).filter(line=>line.startsWith(prefix));assert.equal(records.length,1);
  const raw=JSON.parse(records[0].slice(prefix.length));equalFields(raw,{execution:'pre-game-variation-scan',...sample});
 }
 for(const row of corpus){assert.equal(row.name,'opening-recovery');assert.equal(row.speed,1);
  assert.equal(row.seed,firstSeedByVariation.get(row.nativeVariation),'Every variation is an actual fresh pre-game native seed, without post-start edits');
  verifyScenario(row,['opening-recovery',1,row.seed]);await verifyCaseLog(row);}
 const pairs=report.speedParity;assert.equal(pairs.length,12);
 assert.deepEqual(pairs.map(pair=>`${pair.name}/${pair.seed}`).sort(),[1729,7331].flatMap(seed=>names.map(name=>`${name}/${seed}`)).sort());
 for(const pair of pairs){
  const rows=report.scenarios.filter(row=>row.name===pair.name&&row.seed===pair.seed);assert.equal(rows.length,2);
  assert.deepEqual(rows.map(row=>row.speed).sort(),[1,2]);
  const fields=['outcome','profileIndex','profileCredits','awardCollected','finiteVictory','trophyCount'];
  if(pair.name==='controls')fields.push(...controlFields,'nativeBestOverlaySamples','nativeBestOverlayMismatchPixels','nativeBestHeroClear');
  else if(pair.name==='no-action')fields.push('nativeGameOver','nativeLegalPlacements','terminalFlags');
  else fields.push('nativePrefixFlags','nativeFormationsCleared','nativeRosterFixtureMatched','nativePacketConservation','nativeFlagZombies',
   'nativeHugeWaveWarnings','nativeSuccessBanners','nativeKelpDumpInputs','ordinaryVisibleInformationOnly','policyIntervalTicks',
   'mouseLatencyTicks','replayCompleted','failureAndRetry','bestPersistent');
  assert.equal(pair.sameNativeOutcome,true);assert.deepEqual(pair.comparedFields,fields,'Exact complete semantic speed-pair field set');
  for(const field of fields)assert.deepEqual(rows[0][field],rows[1][field],'Actual1x/2x scenario comparison: '+field);
 }
 equalFields(report,summary);
 const progress=report.scenarios.filter(row=>row.outcome==='earned-prefix'),replays=progress.filter(row=>row.replayCompleted);
 assert.equal(progress.length,summary.primaryNativeProgressRuns);assert.equal(replays.length,summary.explicitReplayProgressRuns);
 assert.equal(progress.length+replays.length,summary.baseNativeProgressRuns);
 const earnedBaseFlags=progress.reduce((sum,row)=>sum+row.nativePrefixFlags+(row.replayCompleted?row.replayNativePrefixFlags:0),0);
 assert.equal(earnedBaseFlags,summary.baseNativePrefixFlags);
 assert.equal(corpus.reduce((sum,row)=>sum+row.nativePrefixFlags,0),summary.openingCorpusFlags);
 assert.equal(progress.length+replays.length+corpus.length,summary.nativeProgressRuns);
 assert.equal(earnedBaseFlags+corpus.reduce((sum,row)=>sum+row.nativePrefixFlags,0),summary.nativePrefixFlags);
 assert.equal(report.scenarios.filter(row=>row.outcome==='native-loss').length,summary.nativeStandaloneLossCases);
 assert.equal(report.scenarios.filter(row=>row.outcome==='controls-pass').length,summary.isolatedControlCases);
 assert.equal([...report.scenarios,...corpus].filter(row=>row.finiteVictory).length,summary.finiteVictoryCases);
 assert.equal(report.checks,CURRENT_SOURCE_COUNT+[...report.scenarios,...corpus].reduce((sum,row)=>sum+row.checks,0)+pairs.length);
 console.log('PASS Pool Panic Endless2:32 actual cases,28 earned runs/92 flags, all8 saved opening variations, native defeats/checkpoints/high-water bests and12 actual speed-pair comparisons.');
}
