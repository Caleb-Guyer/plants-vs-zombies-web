import assert from 'node:assert/strict';

const names=['normal','save-between-flags','save-active','retry-no-action','no-action','controls'];
const exact={PrefixFlags:3,FormationsCleared:30,AuthoredZombies:138,WaterZombies:68,LandZombies:70,
 SnorkelsSpawned:13,DolphinsSpawned:13,ScreenDoorsSpawned:8,FootballSpawned:6,
 InitialLilyPads:8,InitialPoolCleaners:0,InitialPoolRowMowers:2,QuotaPerFlag:48,
 PrefixFrozenAtThirdBoundary:true,RosterFixtureMatched:true,PacketConservation:true,
 PostPrefixInputs:0,AwardsDropped:0,RetainedPadHealingEvents:0,TerminalGameOver:true};
const minimum={ConsumedPackets:4,KelpDrownings:1,SquashSmashes:1,SquashDamageKills:1,CherryExplosions:1,
 JalapenoBurns:1,SnorkelsEnteredPool:1,DolphinsEnteredPool:1,TerminalFlags:3,TerminalBest:3};
const controls=['actualNativeInputs','nativePoolRows','nativeUnpurchasedWaterMowers','illegalKelpOnLandRejected',
 'illegalGroundOnBareWaterRejected','invalidPlacementRetainsPacket','selectionCancelled','nativeFullBankDeliveryFrozen',
 'nativeFullBankBeltMoves','nativeConsumedPacketRemoved','nativeDeliveryResumed','nativePause',
 'checkpointGraphPreserved','nativeHUDSafe','originalSurvivalBestOverlay'];
const progressParity=['nativePrefixFlags','nativeFormationsCleared','nativeAuthoredZombies','nativeWaterZombies',
 'nativeLandZombies','nativeSnorkelsSpawned','nativeDolphinsSpawned','nativeScreenDoorsSpawned','nativeFootballSpawned',
 'nativeInitialLilyPads','nativeInitialPoolCleaners','nativeInitialPoolRowMowers','nativeQuotaPerFlag',
 'nativePrefixFrozenAtThirdBoundary','nativeRosterFixtureMatched','nativePacketConservation','nativePostPrefixInputs',
 'nativeAwardsDropped','policyIntervalTicks','failureAndRetry','replayCompleted','bestPersistent','noFiniteAward'];
const replayParity=['replayNativePrefixFlags','replayNativeFormationsCleared','replayNativeAuthoredZombies',
 'replayNativeWaterZombies','replayNativeLandZombies','replayNativeRosterFixtureMatched','replayNativePacketConservation'];
const rasterParity=['nativeFooterLabels','nativeFooterBottom','nativeFooterOverflowNegatives',
 'nativeBestOverlaySamples','nativeBestOverlayMismatchPixels','nativeBestHighFitSamples','nativeBestOverflowNegatives',
 'nativeUnsignedBestMaxCorrect','nativeBestCacheResidentImagesStable','nativeBestHighFitNameClear'];

function verifyPrefix(result,prefix) {
 const get=suffix=>result[prefix+suffix];
 const integer=(suffix,lo,hi=Number.MAX_SAFE_INTEGER)=>assert(Number.isInteger(get(suffix))&&get(suffix)>=lo&&get(suffix)<=hi,prefix+suffix);
 for(const [suffix,value] of Object.entries(exact)) assert.equal(get(suffix),value,prefix+suffix);
 for(const [suffix,value] of Object.entries(minimum)) integer(suffix,value);
 integer('Variation',0,7);integer('AcceptedPackets',4,144);integer('ConsumedPackets',4,144);integer('RemainingPackets',0,10);
 assert.equal(get('AcceptedPackets'),get('ConsumedPackets')+get('RemainingPackets'),'Every accepted native packet must remain accounted for');
 assert(get('AcceptedPackets')>56,'Endless supply must continue past the finite Pool Panic allowance');
 const accepted=get('FlagAcceptedSupplies'),expired=get('FlagExpiredSupplies');
 assert.equal(accepted.length,3);assert.equal(expired.length,3);
 for(let i=0;i<3;i++) {
  assert(Number.isInteger(accepted[i])&&accepted[i]>=0&&accepted[i]<=48);
  assert.equal(expired[i],48-accepted[i],'Only unissued quota expires at flag boundary');
 }
 assert.equal(accepted.reduce((sum,n)=>sum+n,0),get('AcceptedPackets'));
 const bests=get('FlagBests');assert.equal(bests.length,3);assert.deepEqual(get('FlagPersistedBests'),bests);
 bests.forEach((best,index)=>{
  assert(Number.isInteger(best)&&best>=index+1&&best<=get('PrefixBest'));
  if(index) assert(best>=bests[index-1],'A later flag cannot reduce the saved best');
 });
 assert.equal(bests[2],get('PrefixBest'));
 integer('PrefixBest',3);assert(get('PrefixBest')<=get('TerminalBest'));
 integer('MowersRemaining',0,6);integer('MowersTriggered',0,6);assert.equal(get('MowersRemaining')+get('MowersTriggered'),6);
 integer('LilyPadsRemaining',0,8);integer('PoolRowMowersRemaining',0,2);assert.equal(get('PoolCleanersRemaining'),0);
 assert(get('PoolRowMowersRemaining')<=get('MowersRemaining'));integer('PadRestorations',0,24);
 integer('StopInputTick',1);integer('TerminalTick',get('StopInputTick')+1);
 assert(get('TerminalBest')>=get('TerminalFlags'));assert.equal(get('PersistedBest'),get('TerminalBest'));
}

function verifyBoundarySyncs(result,expected) {
 assert.equal(result.boundarySyncCount,expected);
 assert.equal(result.boundarySyncs.length,expected);
 result.boundarySyncs.forEach((sync,index)=>{
  assert.equal(sync.call,index+1);assert(sync.boardBytes>0&&sync.profileBytes>0);
  for(const field of ['boardSha256','profileSha256']) assert.match(sync[field],/^[a-f0-9]{64}$/);
 });
}

export async function verifyPoolPanicEndless({report,read,sha,engine,fullRunReport,productionBuildBytes}) {
 assert.equal(report.execution,'complete-production-engine');assert.equal(report.optimization,'O2');
 assert.match(report.status,/^PASS/);assert.equal(report.failures,0);assert.equal(report.exitCode,0);
 assert.equal(Object.keys(report.sourceSha256).length,852);assert.deepEqual(report.sourceSha256,fullRunReport.sourceSha256);
 assert.equal(report.productionObjectCount,134);assert.deepEqual(report.productionObjectSha256,fullRunReport.productionObjectSha256);
 assert.equal(report.productionBuildReceiptSha256,sha(productionBuildBytes));
 assert.deepEqual(Object.keys(report.testArtifactSha256).sort(),['pool-panic-endless-engine.js','pool-panic-endless-engine.wasm']);
 for(const [file,pin] of Object.entries(report.testArtifactSha256)) assert.equal(sha(await read('tests/'+file)),pin);
 assert(WebAssembly.validate(await read('tests/pool-panic-endless-engine.wasm')));
 for(const [file,field] of [['build-pool-panic-endless.py','builderSha256'],['test-pool-panic-endless.py','runnerSha256'],
  ['pool-panic-endless-assets.json','assetFixtureSha256'],['pool-panic-endless-harness.cpp','generatedHarnessSha256']])
  assert.equal(sha(await read('tests/'+file)),report[field]);
 assert.equal(report.assetBundleId,engine.assetBundleId);assert.equal(report.nativeArtInputs,469);
 for(const [file,pin] of Object.entries({
  'pool-panic-endless-native-art-inputs.json':'bcc6c2fe9450245cea71e85e26cd3db5d9f4fa1da9cbe63c817c211948bbf3a6',
  'pool-panic-endless-first-three-flags.json':'17909bb3a7df302a7b3ac2417cd813aa378282ff231e7fd77d645cafbc5267c0'})) {
  assert.equal(sha(await read('tests/'+file)),pin);assert.equal(report.fixturesSha256[file],pin);
 }
 const build=JSON.parse(await read('tests/pool-panic-endless-build.json'));
 for(const field of ['execution','optimization','productionObjectCount','productionBuildReceiptSha256',
  'generatedHarnessSha256','builderSha256','testArtifactSha256','sourceSha256','productionObjectSha256'])
  assert.deepEqual(report[field],build[field],'Endless exact production binding: '+field);
 const key=r=>`${r.name}/${r.speed}/${r.seed}`;
 assert.equal(report.scenarios.length,24);
 assert.deepEqual(report.scenarios.map(key).sort(),[1729,7331].flatMap(seed=>names.flatMap(name=>[1,2].map(speed=>key({name,speed,seed})))).sort());
 for(const r of report.scenarios) {
  assert.equal(r.execution,'complete-production-engine');assert.equal(r.profileIndex,86);
  assert.equal(r.resourceCapacityWarnings,0);assert(r.checks>30);assert.match(r.logSha256,/^[a-f0-9]{64}$/);
  for(const [field,value] of Object.entries({profileCredits:0,awardCollected:false,finiteVictory:false,trophyCount:0})) assert.equal(r[field],value);
  if(r.name==='controls') {
   assert.equal(r.outcome,'controls-pass');assert.equal(r.syntheticControls,true);assert.equal(r.renderOnlyProfileSamples,true);
   for(const field of controls) assert.equal(r[field],true,'Actual isolated Endless control: '+field);
   assert(Number.isInteger(r.nativeFooterBottom)&&r.nativeFooterBottom>0&&r.nativeFooterBottom<600);
   assert.equal(r.nativeFooterLabels,1);assert.equal(r.nativeFooterOverflowNegatives,1);assert(r.nativeFooterInkPixels>100);
   for(const [field,value] of Object.entries({nativeBestOverlaySamples:7,nativeBestOverlayMismatchPixels:0,
    nativeBestHighFitSamples:4,nativeBestOverflowNegatives:3})) assert.equal(r[field],value);
   assert(r.nativeBestOverlayBottom>0&&r.nativeBestOverlayBottom<77);
   for(const field of ['nativeBestHighFitNameClear','nativeUnsignedBestMaxCorrect','nativeBestCacheResidentImagesStable']) assert.equal(r[field],true);
   verifyBoundarySyncs(r,0);
   continue;
  }
  if(r.name==='no-action') {
   assert.equal(r.outcome,'native-loss');assert.equal(r.nativeGameOver,true);assert.equal(r.nativeLegalPlacements,0);
   assert(Number.isInteger(r.terminalFlags)&&r.terminalFlags>=0);assert(r.bestFlags>=r.terminalFlags);assert.equal(r.persistedBest,r.bestFlags);
   verifyBoundarySyncs(r,r.terminalFlags);continue;
  }
  assert.equal(r.outcome,'progress-then-loss');
  for(const field of ['nativeStatsUnchanged','actualPacketAndTileInputs','bonusReturned','bestPersistent','noFiniteAward']) assert.equal(r[field],true);
  assert.equal(r.policyIntervalTicks,r.name==='save-active'?500:250);assert.equal(r.failureAndRetry,r.name==='retry-no-action');
  verifyPrefix(r,'native');
  const replay=r.name==='normal';assert.equal(r.replayCompleted,replay);assert.equal(r.replayStartsAtFlagZero,replay);
  if(replay) {
   verifyPrefix(r,'replayNative');assert.equal(r.replayStartingBest,r.nativeTerminalBest);
   assert(r.replayNativePrefixBest>=r.replayStartingBest);assert(r.replayNativeTerminalBest>=r.nativeTerminalBest);
   assert.equal(r.postReplayBest,r.replayNativeTerminalBest);
  } else {
   assert.equal(r.replayNativePrefixFlags,0);assert.equal(r.replayNativeConsumedPackets,0);
  }
  const retry=r.name==='retry-no-action';assert.equal(r.retryLower.performed,retry);
  if(retry) {
   const lower=r.retryLower;assert.equal(lower.retryRestartFlags,0);assert.equal(lower.bestBeforeLowerRetry,r.nativeTerminalBest);
   assert(Number.isInteger(lower.lowerRetryFlags)&&lower.lowerRetryFlags>=0&&lower.lowerRetryFlags<lower.bestBeforeLowerRetry);
   assert.equal(lower.bestAfterLowerRetry,lower.bestBeforeLowerRetry);assert.equal(lower.persistedBestAfterLowerRetry,lower.bestBeforeLowerRetry);
   assert.equal(lower.nativeGameOver,true);assert.equal(lower.noInputs,true);
  }
  const saved=r.name.startsWith('save-');assert.equal(r.checkpoint.performed,saved);
  if(saved) {
   const boundary=r.name==='save-between-flags',c=r.checkpoint;
   assert.equal(c.kind,boundary?'automatic-between-flags':'native-active-kelp');
   assert.equal(c.source,boundary?'production-boundary-autosave':'native-save-api');
   assert.equal(c.boundaryFieldsPreserved,true);assert.equal(c.selectedGraphPreserved,!boundary);
   if(boundary) { assert.equal(c.fileReadBeforeManualSave,true);assert.equal(c.nativeSavedFlags,1);assert.equal(c.loadedFlags,1);assert(c.fileBytes>0); }
   else assert.equal(c.loadedFlags,c.nativeSavedFlags);
  }
  const syncs=r.nativeTerminalFlags+(replay?r.replayNativeTerminalFlags:0)+(retry?r.retryInitialFlags+r.retryLower.lowerRetryFlags:0);
  verifyBoundarySyncs(r,syncs);
 }
 for(const [field,count] of Object.entries({primaryNativeProgressRuns:16,explicitReplayProgressRuns:4,nativeProgressRuns:20,
  nativePrefixFlags:60,nativeStandaloneLossCases:4,isolatedControlCases:4,finiteVictoryCases:0})) assert.equal(report[field],count);
 assert.equal(report.scenarios.filter(r=>r.outcome==='progress-then-loss').length,16);
 assert.equal(report.scenarios.filter(r=>r.replayCompleted).length,4);
 assert.equal(report.scenarios.filter(r=>r.outcome==='native-loss').length,4);assert.equal(report.scenarios.filter(r=>r.outcome==='controls-pass').length,4);
 assert.equal(report.speedParity.length,12);
 assert.deepEqual(report.speedParity.map(r=>`${r.name}/${r.seed}`).sort(),[1729,7331].flatMap(seed=>names.map(name=>`${name}/${seed}`)).sort());
 for(const pair of report.speedParity) {
  assert.equal(pair.sameNativeOutcome,true);
  const cases=report.scenarios.filter(r=>r.name===pair.name&&r.seed===pair.seed);assert.equal(cases.length,2);
  const common=['outcome','profileIndex','profileCredits','awardCollected','finiteVictory','trophyCount'];
  const extra=pair.name==='no-action'?['nativeGameOver','nativeLegalPlacements']:
   pair.name==='controls'?[...controls,...rasterParity]:[...progressParity,...(pair.name==='normal'?replayParity:[])];
  const required=[...common,...extra];
  assert.deepEqual(pair.comparedFields,required,'Exact semantic speed-parity fields');
  for(const field of pair.comparedFields) assert.deepEqual(cases[0][field],cases[1][field]);
 }
 assert.equal(report.checks,Object.keys(report.sourceSha256).length+report.scenarios.reduce((sum,r)=>sum+r.checks,0)+report.speedParity.length);
 console.log('PASS Pool Panic Endless: twenty independent three-flag prefixes, native defeats, automatic checkpoints, persistent bests, quota accounting and twelve speed pairs.');
}
