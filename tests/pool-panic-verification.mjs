import assert from 'node:assert/strict';

const names=['normal','save-packet','save-active','retry-no-action','no-action','controls'];
const controls=['actualNativeInputs','nativePoolRows','nativePoolCleaners','illegalKelpOnLandRejected',
 'illegalGroundOnBareWaterRejected','invalidPlacementRetainsPacket','selectionCancelled','nativeFullBankDeliveryFrozen',
 'nativeFullBankBeltMoves','nativeConsumedPacketRemoved','nativeDeliveryResumed','nativePause','checkpointGraphPreserved','nativeHUDSafe'];
const exact={Formations:8,AuthoredZombies:48,WaterZombies:20,LandZombies:28,InitialLilyPads:8,InitialPoolCleaners:0,InitialPoolRowMowers:2,
 HeadroomFrozenAtAward:true,PacketConservation:true,FinitePacketLimit:56};
const minimum={LegalPlacements:4,KelpGrabs:1,KelpDragUnders:1,KelpDrownings:1,SquashSmashes:1,SquashDamageKills:1,
 CherryExplosions:1,JalapenoBurns:1,DolphinsEnteredPool:1,MowersRemaining:3,CompletionTick:10000};
const winTrue=['bonusReturned','replayCardAvailable','uniqueTrophy','nativeStatsUnchanged','actualPacketAndTileInputs'];
const winParity=['nativeFormations','nativeAuthoredZombies','nativeWaterZombies','nativeLandZombies',
 'nativeInitialLilyPads','nativeInitialPoolCleaners','nativeInitialPoolRowMowers','nativePacketConservation','nativeFinitePacketLimit',
 'failureAndRetry','bonusReturned','replayCardAvailable','replayCompleted','replayStartsAtFormationZero','nativeRewardDelta','policyIntervalTicks'];
const replayParity=['replayNativeFormations','replayNativeAuthoredZombies','replayNativeWaterZombies','replayNativeLandZombies','replayNativePacketConservation'];

function verifyBattle(result,prefix) {
 const get=suffix=>result[prefix+suffix];
 const integer=(suffix,lo,hi)=>assert(Number.isInteger(get(suffix))&&get(suffix)>=lo&&get(suffix)<=hi,prefix+suffix);
 for(const [suffix,value] of Object.entries(exact)) assert.equal(get(suffix),value,prefix+suffix);
 for(const [suffix,value] of Object.entries(minimum)) integer(suffix,value,Number.MAX_SAFE_INTEGER);
 integer('DeliveredPackets',4,56);integer('ConsumedPackets',4,56);integer('RemainingPackets',0,10);integer('UnissuedPackets',0,52);
 assert.equal(get('DeliveredPackets'),get('ConsumedPackets')+get('RemainingPackets'),'Native delivery must conserve every packet');
 assert.equal(get('DeliveredPackets')+get('UnissuedPackets'),56,'Supply is finite and unissued packets are not lost');
 assert.equal(get('ConsumedPackets'),get('LegalPlacements'));
 const typeTotals={Squash:14,Kelp:21,Cherry:14,Jalapeno:7};
 for(const [type,total] of Object.entries(typeTotals)) integer(type+'Placements',1,total);
 assert.equal(Object.keys(typeTotals).reduce((sum,type)=>sum+get(type+'Placements'),0),get('LegalPlacements'));
 integer('LilyPadsRemaining',0,8);integer('PoolRowMowersRemaining',0,2);assert.equal(get('PoolCleanersRemaining'),0);
 integer('MowersRemaining',3,6);integer('MowersTriggered',0,6);
 assert(get('PoolRowMowersRemaining')<=get('MowersRemaining'));
 assert.equal(get('MowersRemaining')+get('MowersTriggered'),6);
 assert.equal(get('UnusedMowers'),get('MowersRemaining'),'Frozen award-time mower count must match actual native victory stats');
 integer('CharredDeathRigs',0,48);
}

export async function verifyPoolPanic({report,read,sha,engine,fullRunReport,productionBuildBytes}) {
 assert.equal(report.execution,'complete-production-engine');
 assert.equal(report.optimization,'O2');
 assert.match(report.status,/^PASS/);
 assert.equal(report.failures,0);assert.equal(report.exitCode,0);
 assert.equal(Object.keys(report.sourceSha256).length,852);
 assert.deepEqual(report.sourceSha256,fullRunReport.sourceSha256);
 assert.equal(report.productionObjectCount,134);
 assert.deepEqual(report.productionObjectSha256,fullRunReport.productionObjectSha256);
 assert.equal(report.productionBuildReceiptSha256,sha(productionBuildBytes));
 assert.deepEqual(Object.keys(report.testArtifactSha256).sort(),['pool-panic-engine.js','pool-panic-engine.wasm']);
 for(const [file,pin] of Object.entries(report.testArtifactSha256)) assert.equal(sha(await read('tests/'+file)),pin);
 assert(WebAssembly.validate(await read('tests/pool-panic-engine.wasm')));
 for(const [file,field] of [['build-pool-panic.py','builderSha256'],['test-pool-panic.py','runnerSha256'],
  ['pool-panic-assets.json','assetFixtureSha256'],['pool-panic-harness.cpp','generatedHarnessSha256']])
  assert.equal(sha(await read('tests/'+file)),report[field]);
 assert.equal(report.assetBundleId,engine.assetBundleId);
 assert.equal(report.nativeArtInputs,218);
 const artBytes=await read('tests/pool-native-art-inputs.json');
 assert.equal(sha(artBytes),'b3a57630c55aec10e86186fe6164bd1c7133090fc88baa921b7277f40984c19c');
 assert.equal(report.fixturesSha256['pool-native-art-inputs.json'],sha(artBytes));
 const build=JSON.parse(await read('tests/pool-panic-build.json'));
 for(const field of ['execution','optimization','productionObjectCount','productionBuildReceiptSha256',
  'generatedHarnessSha256','builderSha256','testArtifactSha256','sourceSha256','productionObjectSha256'])
  assert.deepEqual(report[field],build[field],'Pool Panic exact production binding: '+field);
 const key=r=>`${r.name}/${r.speed}/${r.seed}`;
 assert.equal(report.scenarios.length,24);
 assert.deepEqual(report.scenarios.map(key).sort(),[1729,7331].flatMap(seed=>names.flatMap(name=>[1,2].map(speed=>key({name,speed,seed})))).sort());
 for(const result of report.scenarios) {
  assert.equal(result.execution,'complete-production-engine');assert.equal(result.profileIndex,85);
  assert.equal(result.resourceCapacityWarnings,0);assert(result.checks>30);assert.match(result.logSha256,/^[a-f0-9]{64}$/);
  if(result.name==='controls') {
   assert.equal(result.outcome,'controls-pass');assert.equal(result.syntheticControls,false);
   for(const field of controls) assert.equal(result[field],true,'Native conveyor/pool input: '+field);
   assert.equal(result.nativeFooterLabels,1);assert.equal(result.nativeFooterOverflowNegatives,1);
   assert.equal(result.nativeFooterBottom,595);assert.equal(result.nativeFooterInkPixels,1303);
   assert(result.nativeCardPoolPixels>=16);assert.equal(result.nativeCardWhiteHoleNegatives,1);
   assert.equal(result.profileCredits,0);assert.equal(result.awardCollected,false);
   continue;
  }
  const won=result.name!=='no-action';
  assert.equal(result.outcome,won?'win':'loss');assert.equal(result.profileCredits,won?1:0);assert.equal(result.awardCollected,won);
  if(!won) {
   assert.equal(result.nativeGameOver,true);assert.equal(result.nativeLegalPlacements,0);
   assert(Number.isInteger(result.formationsReached)&&result.formationsReached>=1&&result.formationsReached<=8);
   continue;
  }
  for(const field of winTrue) assert.equal(result[field],true,field);
  assert.equal(result.policyIntervalTicks,result.name==='save-active'?500:250);
  assert.equal(result.failureAndRetry,result.name==='retry-no-action');
  verifyBattle(result,'native');
  const replay=result.name==='normal';
  assert.equal(result.replayCompleted,replay);assert.equal(result.replayStartsAtFormationZero,replay);
  assert.equal(result.nativeRewardDelta,replay?2:1);
  if(replay) verifyBattle(result,'replayNative');
  else { assert.equal(result.replayNativeFormations,0);assert.equal(result.replayNativeLegalPlacements,0); }
  const saved=result.name.startsWith('save-');
  assert.equal(result.checkpoint.performed,saved);assert.equal(result.checkpoint.observedGraphPreserved,saved);
  if(saved) {
   assert.equal(result.checkpoint.phase,result.name==='save-packet'?'native-moving-conveyor':'native-kelp-grab');
   assert(Number.isInteger(result.checkpoint.tick)&&result.checkpoint.tick>0);
  }
 }
 for(const [field,count] of Object.entries({primaryNativeWins:16,explicitReplayWins:4,nativeBattleCompletions:20,nativeLossCases:4,isolatedControlCases:4}))
  assert.equal(report[field],count);
 assert.equal(report.scenarios.filter(r=>r.outcome==='win').length,16);assert.equal(report.scenarios.filter(r=>r.replayCompleted).length,4);
 assert.equal(report.scenarios.filter(r=>r.outcome==='loss').length,4);assert.equal(report.scenarios.filter(r=>r.outcome==='controls-pass').length,4);
 assert.equal(report.speedParity.length,12);
 assert.deepEqual(report.speedParity.map(r=>`${r.name}/${r.seed}`).sort(),[1729,7331].flatMap(seed=>names.map(name=>`${name}/${seed}`)).sort());
 for(const pair of report.speedParity) {
  assert.equal(pair.sameNativeOutcome,true);
  const cases=report.scenarios.filter(r=>r.name===pair.name&&r.seed===pair.seed);assert.equal(cases.length,2);
  const extra=pair.name==='controls'?[...controls,'nativeFooterLabels','nativeFooterBottom','nativeFooterOverflowNegatives']:
   pair.name==='no-action'?['nativeGameOver','nativeLegalPlacements']:[...winParity,...(pair.name==='normal'?replayParity:[])];
  const fields=['outcome','profileIndex','profileCredits','awardCollected',...extra];assert.deepEqual(pair.comparedFields,fields);
  for(const field of fields) assert.deepEqual(cases[0][field],cases[1][field]);
 }
 assert.equal(report.checks,Object.keys(report.sourceSha256).length+report.scenarios.reduce((sum,r)=>sum+r.checks,0)+report.speedParity.length);
 console.log('PASS Pool Panic: sixteen primary mixed-pool wins, four independent full replays, four no-action losses, four native conveyor controls and twelve speed pairs.');
}
