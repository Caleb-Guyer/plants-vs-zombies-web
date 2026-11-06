import assert from 'node:assert/strict';

const names=['normal','save-before','save-grab','retry-bad-plan','bad-plan','controls'];
const winExact={boardsSolved:5,targetsStolen:10,authoredTargets:10,legalDeployments:18,
 groundDeployments:8,bungeeDeployments:10,budgetSpent:1800,minimumBudgetHeadroom:50,
 nativeGrabs:10,nativeLifts:10,nativeAbductions:10,nativeCoverKills:8};
const winTrue=['nativeCosts','finiteBudget','thinkingSafe','bonusReturned','replayCardAvailable','uniqueTrophy'];
const controlTrue=['syntheticControls','failedLiftLethalHitSynthetic','carryCoordinateMismatchSynthetic','nativeCosts','invalidPlacementRejected',
 'selectionCancelled','sameTargetBeforeCharge','blockedUmbrellaNoCredit','targetEatenRejected','failedLiftNoCredit',
 'carryCoordinateMismatchRejected','nativePause','checkpointGraphPreserved','originalModeUnaffected','finiteBudget','nativeHUDSafe','nativeIZHeadLayer'];
const controlExact={nativeIZSamples:4,nativeIZPixelComparisons:576000,nativeIZMismatchPixels:0,
 nativeFooterLabels:5,nativeFooterBottom:598,nativeFooterOverflowNegatives:5,profileCredits:0,awardCollected:false};
const replayExact={replayBoardsSolved:5,replayTargetsStolen:10,replayLegalDeployments:18,
 replayNativeGrabs:10,replayNativeLifts:10,replayNativeAbductions:10,replayNativeCoverKills:8};
const parityWins=['boardsSolved','targetsStolen','authoredTargets','legalDeployments','groundDeployments','bungeeDeployments',
 'budgetSpent','minimumBudgetHeadroom','failureAndRetry','bonusReturned','replayCardAvailable','replayCompleted',
 'replayBoardsSolved','replayTargetsStolen','replayLegalDeployments','nativeRewardDelta','nativeGrabs','nativeLifts','nativeAbductions','nativeCoverKills'];

export async function verifyBungeeBusiness({report,read,sha,engine,fullRunReport,productionBuildBytes}) {
 assert.equal(report.execution,'complete-production-engine');
 assert.equal(report.optimization,'O2');
 assert.match(report.status,/^PASS/);
 assert.equal(report.failures,0);
 assert.equal(report.exitCode,0);
 assert.deepEqual(report.sourceSha256,fullRunReport.sourceSha256);
 assert.equal(report.productionObjectCount,128);
 assert.deepEqual(report.productionObjectSha256,fullRunReport.productionObjectSha256);
 assert.equal(report.productionBuildReceiptSha256,sha(productionBuildBytes));
 assert.deepEqual(Object.keys(report.testArtifactSha256).sort(),['bungee-business-engine.js','bungee-business-engine.wasm']);
 for(const [file,pin] of Object.entries(report.testArtifactSha256)) assert.equal(sha(await read('tests/'+file)),pin);
 assert(WebAssembly.validate(await read('tests/bungee-business-engine.wasm')));
 for(const [file,field] of [['build-bungee-business.py','builderSha256'],['test-bungee-business.py','runnerSha256'],['bungee-business-assets.json','assetFixtureSha256']])
  assert.equal(sha(await read('tests/'+file)),report[field]);
 assert.equal(report.assetBundleId,engine.assetBundleId);
 assert.equal(report.nativeArtInputs,78);
 const artBytes=await read('tests/bungee-native-art-inputs.json');
 assert.equal(sha(artBytes),'de72c77af01f18c6a34fa73ae96bda1917c3ef7d338ac552e09f0a49292c5793');
 assert.equal(report.fixturesSha256['bungee-native-art-inputs.json'],sha(artBytes));
 const build=JSON.parse(await read('tests/bungee-business-build.json'));
 for(const field of ['execution','optimization','productionObjectCount','productionBuildReceiptSha256',
  'generatedHarnessSha256','builderSha256','testArtifactSha256','sourceSha256','productionObjectSha256'])
  assert.deepEqual(report[field],build[field],'Bungee Business exact production binding: '+field);
 const key=r=>`${r.name}/${r.speed}/${r.seed}`;
 assert.equal(report.scenarios.length,24);
 assert.deepEqual(report.scenarios.map(key).sort(),[1729,7331].flatMap(seed=>names.flatMap(name=>[1,2].map(speed=>key({name,speed,seed})))).sort());
 for(const result of report.scenarios) {
  assert.equal(result.execution,'complete-production-engine');
  assert.equal(result.profileIndex,83);
  assert.equal(result.resourceCapacityWarnings,0);
  assert(result.checks>0);
  assert.match(result.logSha256,/^[a-f0-9]{64}$/);
  if(result.name==='controls') {
   assert.equal(result.outcome,'controls-pass');
   for(const field of controlTrue) assert.equal(result[field],true,'Actual isolated Bungee control: '+field);
   for(const [field,value] of Object.entries(controlExact)) assert.equal(result[field],value);
   assert(result.nativeIZVisibleHeadPixels>=16,'Header comparison must actually contain the original visible zombie head');
   assert(result.nativeFooterInkPixels>500,'Footer bounds must contain actual native glyph ink');
   continue;
  }
  const won=result.name!=='bad-plan';
  assert.equal(result.outcome,won?'win':'loss');
  assert.equal(result.profileCredits,won?1:0);
  assert.equal(result.awardCollected,won);
  assert.equal(result.failureAndRetry,result.name==='retry-bad-plan');
  const saved=['save-before','save-grab'].includes(result.name);
  assert.equal(result.checkpoint.performed,saved);
  if(saved) {
   assert.equal(result.checkpoint.observedGraphPreserved,true);
   assert.equal(result.checkpoint.phase,result.name==='save-before'?'before-deployment':'rising-with-bungee');
   assert.equal(result.checkpoint.activeCarry,result.name==='save-grab');
   assert(Number.isInteger(result.checkpoint.tick)&&result.checkpoint.tick>0);
  }
  if(won) {
   for(const [field,value] of Object.entries(winExact)) assert.equal(result[field],value,'Earned full heist evidence: '+field);
   for(const field of winTrue) assert.equal(result[field],true);
   for(const field of ['nativeBiteEvents','nativePoleVaults']) assert(result[field]>0);
   const replay=result.name==='normal';
   assert.equal(result.replayCompleted,replay);
   assert.equal(result.nativeRewardDelta,replay?2:1);
   assert.equal(result.retryBudgetSpent,result.name==='retry-bad-plan'?625:0);
   for(const [field,value] of Object.entries(replayExact)) assert.equal(result[field],replay?value:0);
   for(const field of ['replayNativeBiteEvents','replayNativePoleVaults']) {
    if(replay) assert(result[field]>0,'Replay needs independent native observations: '+field);
    else assert.equal(result[field],0);
   }
   if(replay) assert.equal(result.replayStartsAtRoundZero,true);
  } else {
   assert.equal(result.boardsSolved,0);
   assert.equal(result.targetsStolen,0);
   assert.equal(result.protectedBungeePlacements,1);
   assert.equal(result.budgetLeft,100);
  }
 }
 for(const [field,count] of Object.entries({primaryNativeWins:16,explicitReplayWins:4,nativeFiveBoardCompletions:20,nativeLossCases:4,isolatedControlCases:4})) assert.equal(report[field],count);
 assert.equal(report.scenarios.filter(r=>r.outcome==='win').length,16);
 assert.equal(report.scenarios.filter(r=>r.replayCompleted).length,4);
 assert.equal(report.scenarios.filter(r=>r.outcome==='loss').length,4);
 assert.equal(report.scenarios.filter(r=>r.outcome==='controls-pass').length,4);
 assert.equal(report.speedParity.length,12);
 assert.deepEqual(report.speedParity.map(r=>`${r.name}/${r.seed}`).sort(),[1729,7331].flatMap(seed=>names.map(name=>`${name}/${seed}`)).sort());
 for(const pair of report.speedParity) {
  assert.equal(pair.sameNativeOutcome,true);
  const cases=report.scenarios.filter(r=>r.name===pair.name&&r.seed===pair.seed);
  assert.equal(cases.length,2);
  const extra=pair.name==='controls'?[...controlTrue,...Object.keys(controlExact).filter(f=>!['profileCredits','awardCollected'].includes(f))]:
   pair.name==='bad-plan'?['boardsSolved','targetsStolen','protectedBungeePlacements','budgetLeft','failureAndRetry']:
   [...parityWins,...(pair.name==='normal'?['replayNativeGrabs','replayNativeLifts','replayNativeAbductions','replayNativeCoverKills']:[])];
  const fields=['outcome','profileIndex','profileCredits','awardCollected',...extra];
  assert.deepEqual(pair.comparedFields,fields);
  for(const field of fields) assert.deepEqual(cases[0][field],cases[1][field]);
 }
 assert.equal(report.checks,Object.keys(report.sourceSha256).length+report.scenarios.reduce((sum,r)=>sum+r.checks,0)+report.speedParity.length);
 console.log('PASS Bungee Business: sixteen primary five-board wins, four independent full replays, four bad-plan losses, four isolated controls and twelve speed pairs.');
}
