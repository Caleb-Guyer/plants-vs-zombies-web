import assert from 'node:assert/strict';

const names=['normal','save-continue','retry-no-light','no-move','controls'];
const controls=['lightFootprint','fogMatchesLight','litBottomBaseClear','unlitFireBlocked','pendingFireBlocked',
 'litFireObserved','inFlightRetained','idleUnfrozen','gloveMoveIdentity','invalidMovesRejected',
 'selectionCancelled','nativePause','checkpointGraphPreserved','originalModeUnaffected','nativeHUDSafe'];

export async function verifyLightsOut({report,read,sha,engine,fullRunReport,productionBuildBytes}) {
 assert.equal(report.execution,'complete-production-engine');
 assert.equal(report.optimization,'O2');
 assert.equal(report.failures,0);
 assert.equal(report.exitCode,0);
 assert.match(report.status,/^PASS/);
 assert.deepEqual(report.sourceSha256,fullRunReport.sourceSha256);
 assert.equal(report.productionObjectCount,fullRunReport.productionObjectCount);
 assert.deepEqual(report.productionObjectSha256,fullRunReport.productionObjectSha256);
 assert.equal(report.productionBuildReceiptSha256,sha(productionBuildBytes));
 assert.deepEqual(Object.keys(report.testArtifactSha256).sort(),['lights-out-engine.js','lights-out-engine.wasm']);
 for(const [name,pin] of Object.entries(report.testArtifactSha256)) assert.equal(sha(await read('tests/'+name)),pin);
 assert(WebAssembly.validate(await read('tests/lights-out-engine.wasm')));
 assert.equal(sha(await read('tests/build-lights-out.py')),report.builderSha256);
 assert.equal(sha(await read('tests/test-lights-out.py')),report.runnerSha256);
 assert.equal(sha(await read('tests/lights-out-assets.json')),report.assetFixtureSha256);
 assert.equal(report.assetBundleId,engine.assetBundleId);
 assert.equal(report.nativeArtInputs,12);
 assert.equal(report.fixturesSha256['lights-native-art-inputs.json'],sha(await read('tests/lights-native-art-inputs.json')));
 const build=JSON.parse(await read('tests/lights-out-build.json'));
 for(const field of ['execution','optimization','productionObjectCount','productionBuildReceiptSha256',
  'generatedHarnessSha256','builderSha256','testArtifactSha256','sourceSha256','productionObjectSha256'])
  assert.deepEqual(report[field],build[field],'Lights Out exact production binding: '+field);
 const key=r=>`${r.name}/${r.speed}/${r.seed}`;
 assert.equal(report.scenarios.length,20);
 assert.deepEqual(report.scenarios.map(key).sort(),[1729,7331].flatMap(seed=>names.flatMap(name=>[1,2].map(speed=>key({name,speed,seed})))).sort());
 for(const result of report.scenarios) {
  assert.equal(result.execution,'complete-production-engine');
  assert.equal(result.resourceCapacityWarnings,0);
  assert(result.checks>0);
  assert.match(result.logSha256,/^[a-f0-9]{64}$/);
  assert.equal(result.profileIndex,81);
  if(result.name==='controls') {
   assert.equal(result.outcome,'controls-pass');
   assert.equal(result.syntheticControls,true);
   for(const field of controls) assert.equal(result[field],true,'Actual Lights Out control: '+field);
   assert.equal(result.profileCredits,0);
   assert.equal(result.awardCollected,false);
   continue;
  }
  const won=result.name!=='no-move';
  assert.equal(result.outcome,won?'win':'loss');
  assert.equal(result.profileCredits,won?1:0);
  assert.equal(result.awardCollected,won);
  assert.equal(result.failureAndRetry,result.name==='retry-no-light');
  assert.equal(result.checkpoint.performed,result.name==='save-continue');
  if(won) {
   assert.equal(result.policyActionInterval,250);
   assert.equal(result.waves,8);
   assert.equal(result.nativeZombies,26);
   assert.equal(result.authoredEnemies,26);
   assert.equal(result.coveredRows,31);
   assert(result.legalMoves>0);
   assert.equal(result.bonusReturned,true);
   assert.equal(result.replayCardAvailable,true);
   assert.equal(result.headroomFrozenAtAward,true);
   assert(Number.isInteger(result.mowersRemaining)&&result.mowersRemaining>0&&result.mowersRemaining<=5);
   assert(Number.isInteger(result.mowersTriggered)&&result.mowersTriggered>=0&&result.mowersTriggered<5);
   assert.equal(result.nativeUnusedMowers,result.mowersRemaining);
   assert.equal(result.mowersRemaining+result.mowersTriggered,5);
   assert(Number.isInteger(result.wallsRemaining)&&result.wallsRemaining>=0&&result.wallsRemaining<=5);
   assert(result.minimumLampHealth>0);
  }
  if(result.name==='save-continue') {
   assert.equal(result.checkpoint.activeCombat,true);
   assert.equal(result.checkpoint.combatGraphPreserved,true);
  }
 }
 assert.equal(report.speedParity.length,10);
 assert.deepEqual(report.speedParity.map(r=>`${r.name}/${r.seed}`).sort(),[1729,7331].flatMap(seed=>names.map(name=>`${name}/${seed}`)).sort());
 for(const pair of report.speedParity) {
  assert.equal(pair.sameNativeOutcome,true);
  const cases=report.scenarios.filter(r=>r.name===pair.name&&r.seed===pair.seed);
  assert.equal(cases.length,2);
  const fields=['outcome','profileIndex','profileCredits','awardCollected',
   ...(pair.name==='controls'?['syntheticControls',...controls]:['waves','nativeZombies','authoredEnemies','failureAndRetry','bonusReturned','replayCardAvailable'])];
  assert.deepEqual(pair.comparedFields,fields);
  for(const field of pair.comparedFields) assert.deepEqual(cases[0][field],cases[1][field]);
 }
 assert.equal(report.checks,Object.keys(report.sourceSha256).length+report.scenarios.reduce((sum,r)=>sum+r.checks,0)+report.speedParity.length);
 console.log('PASS Lights Out: twelve legal native wins, four static-lamp losses, four isolated controls and ten speed pairs.');
}
