import assert from 'node:assert/strict';

const names=['normal','save-planning','save-active','retry-no-route','no-route','controls'];
const controls=['gloveMoveIdentity','invalidMovesRejected','selectionCancelled','nativeCooldown','nativePause',
 'checkpointGraphPreserved','originalModeUnaffected','nativeHUDSafe','nativeGloveTooltip','originalGlovePixels'];

export async function verifyGarlicRun({report,read,sha,engine,fullRunReport,productionBuildBytes}) {
 assert.equal(report.execution,'complete-production-engine');
 assert.equal(report.optimization,'O2');
 assert.match(report.status,/^PASS/);
 assert.equal(report.failures,0);
 assert.equal(report.exitCode,0);
 assert.deepEqual(report.sourceSha256,fullRunReport.sourceSha256);
 assert.equal(report.productionObjectCount,130);
 assert.deepEqual(report.productionObjectSha256,fullRunReport.productionObjectSha256);
 assert.equal(report.productionBuildReceiptSha256,sha(productionBuildBytes));
 assert.deepEqual(Object.keys(report.testArtifactSha256).sort(),['garlic-run-engine.js','garlic-run-engine.wasm']);
 for(const [name,pin] of Object.entries(report.testArtifactSha256)) assert.equal(sha(await read('tests/'+name)),pin);
 assert(WebAssembly.validate(await read('tests/garlic-run-engine.wasm')));
 for(const [file,field] of [['build-garlic-run.py','builderSha256'],['test-garlic-run.py','runnerSha256'],['garlic-run-assets.json','assetFixtureSha256']])
  assert.equal(sha(await read('tests/'+file)),report[field]);
 assert.equal(report.assetBundleId,engine.assetBundleId);
 assert.equal(report.nativeArtInputs,51);
 assert.equal(sha(await read('tests/garlic-native-art-inputs.json')),'fc538e9305064dfc6967b16491e47c9665ab6f31e11c80ef82415987baf51c5f');
 assert.equal(report.fixturesSha256['garlic-native-art-inputs.json'],sha(await read('tests/garlic-native-art-inputs.json')));
 const build=JSON.parse(await read('tests/garlic-run-build.json'));
 for(const field of ['execution','optimization','productionObjectCount','productionBuildReceiptSha256',
  'generatedHarnessSha256','builderSha256','testArtifactSha256','sourceSha256','productionObjectSha256'])
  assert.deepEqual(report[field],build[field],'Garlic Run exact production binding: '+field);
 const key=r=>`${r.name}/${r.speed}/${r.seed}`;
 assert.equal(report.scenarios.length,24);
 assert.deepEqual(report.scenarios.map(key).sort(),[1729,7331].flatMap(seed=>names.flatMap(name=>[1,2].map(speed=>key({name,speed,seed})))).sort());
 for(const result of report.scenarios) {
  assert.equal(result.execution,'complete-production-engine');
  assert.equal(result.resourceCapacityWarnings,0);
  assert(result.checks>0);
  assert.match(result.logSha256,/^[a-f0-9]{64}$/);
  assert.equal(result.profileIndex,82);
  if(result.name==='controls') {
   assert.equal(result.outcome,'controls-pass');
   assert.equal(result.syntheticControls,true);
   for(const field of controls) assert.equal(result[field],true,'Actual native Garlic Run control: '+field);
   assert(result.glovePixelSamples>100);
   assert.equal(result.gloveMismatchPixels,0);
   assert.equal(result.profileCredits,0);
   assert.equal(result.awardCollected,false);
   continue;
  }
  const won=result.name!=='no-route';
  assert.equal(result.outcome,won?'win':'loss');
  assert.equal(result.profileCredits,won?1:0);
  assert.equal(result.awardCollected,won);
  assert.equal(result.failureAndRetry,result.name==='retry-no-route');
  const saved=['save-planning','save-active'].includes(result.name);
  assert.equal(result.checkpoint.performed,saved);
  if(saved) {
   assert.equal(result.checkpoint.combatGraphPreserved,true);
   assert.equal(result.checkpoint.phase,result.name==='save-planning'?'planning':'active');
   if(result.name==='save-active') assert.equal(result.checkpoint.activeCombat,true);
  }
  assert.equal(result.mowerCount,0);
  if(won) {
   assert.equal(result.boardsSolved,5);
   assert.equal(result.nativeZombies,17);
   assert.equal(result.authoredEnemies,17);
   for(const field of ['legalMoves','nativeDiversions','nativeSpikeDamageEvents','nativeMineArmings','nativeMineExplosions']) assert(result[field]>0);
   for(const field of ['planningHeld','garlicHealthUnmodified','bonusReturned','replayCardAvailable']) assert.equal(result[field],true);
   const replay=result.name==='normal';
   assert.equal(result.replayCompleted,replay);
   assert.equal(result.replayBoardsSolved,replay?5:0);
   assert.equal(result.nativeRewardDelta,replay?2:1);
   if(replay) {
    assert.equal(result.replayStartsAtRoundZero,true);
    assert.equal(result.uniqueTrophy,true);
   }
   assert.equal(result.replayNativeZombies,replay?17:0);
   for(const field of ['replayLegalMoves','replayNativeDiversions','replayNativeSpikeDamageEvents','replayNativeMineArmings','replayNativeMineExplosions']) {
    if(replay) assert(result[field]>0,'Replay must earn independent native evidence: '+field);
    else assert.equal(result[field],0);
   }
  } else {
   assert.equal(result.legalMoves,0);
   assert.equal(result.boardsSolved,0);
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
  const fields=['outcome','profileIndex','profileCredits','awardCollected',...(pair.name==='controls'?
   ['syntheticControls',...controls]:['boardsSolved','nativeZombies','authoredEnemies','failureAndRetry','bonusReturned','replayCardAvailable','replayCompleted','replayBoardsSolved','nativeRewardDelta',
    ...(pair.name==='normal'?['replayNativeZombies','replayLegalMoves']:[])])];
  assert.deepEqual(pair.comparedFields,fields);
  for(const field of fields) assert.deepEqual(cases[0][field],cases[1][field]);
 }
 assert.equal(report.checks,Object.keys(report.sourceSha256).length+report.scenarios.reduce((sum,r)=>sum+r.checks,0)+report.speedParity.length);
 console.log('PASS Garlic Run: sixteen primary native wins, four full five-board replays, four no-route losses, four isolated controls and twelve speed pairs.');
}
