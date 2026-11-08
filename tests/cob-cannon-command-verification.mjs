import assert from 'node:assert/strict';

const names=['normal','save-flight','save-reload','retry-no-fire','no-fire','controls'];
const controls=['actualNativeInputs','nativeMisclickGuard','selectionCancelled','topMarginRejected','reloadingRejected',
 'native206Attack','native3000Reload','nativePause','checkpointGraphPreserved','nativeHUDSafe'];
const exact={Formations:8,AuthoredZombies:36,Garg1800Hits:2,Imps:2,ImpThrows:2,HeadroomFrozenAtAward:true};
const minimum={Shots:8,Projectiles:8,Descents:8,Impacts:8,ReloadedCannons:4,ReusedCannons:1,
 BurnDeaths:20,CannonsRemaining:4,CannonHealth:1000,MowersRemaining:2,CompletionTick:9600};
const earnedTrue=['bonusReturned','replayCardAvailable','uniqueTrophy','nativeStatsUnchanged','actualCannonAndLawnInputs'];
const winParity=['nativeFormations','nativeAuthoredZombies','nativeGarg1800Hits','nativeImps','nativeImpThrows',
 'failureAndRetry','bonusReturned','replayCardAvailable','replayCompleted','replayStartsAtFormationZero','nativeRewardDelta','policyIntervalTicks'];
const replayParity=['replayNativeFormations','replayNativeAuthoredZombies','replayNativeGarg1800Hits','replayNativeImps','replayNativeImpThrows'];

function verifyBattle(result,prefix) {
 for(const [suffix,value] of Object.entries(exact)) assert.equal(result[prefix+suffix],value,prefix+suffix);
 for(const [suffix,value] of Object.entries(minimum)) {
  assert(Number.isInteger(result[prefix+suffix])&&result[prefix+suffix]>=value,prefix+suffix);
 }
 for(const suffix of ['WallsRemaining','MowersTriggered','MowersRemaining'])
  assert(Number.isInteger(result[prefix+suffix])&&result[prefix+suffix]>=0&&result[prefix+suffix]<=5,prefix+suffix);
 assert.equal(result[prefix+'MowersRemaining']+result[prefix+'MowersTriggered'],5);
 assert.equal(result[prefix+'UnusedMowers'],result[prefix+'MowersRemaining'],'Award-time headroom must agree with native victory statistics');
 assert(result[prefix+'CannonsRemaining']<=6);
 assert(result[prefix+'CannonHealth']<=1800);
}

export async function verifyCobCannonCommand({report,read,sha,engine,fullRunReport,productionBuildBytes}) {
 assert.equal(report.execution,'complete-production-engine');
 assert.equal(report.optimization,'O2');
 assert.match(report.status,/^PASS/);
 assert.equal(report.failures,0);
 assert.equal(report.exitCode,0);
 assert.equal(Object.keys(report.sourceSha256).length,852);
 assert.deepEqual(report.sourceSha256,fullRunReport.sourceSha256);
 assert.equal(report.productionObjectCount,134);
 assert.deepEqual(report.productionObjectSha256,fullRunReport.productionObjectSha256);
 assert.equal(report.productionBuildReceiptSha256,sha(productionBuildBytes));
 assert.deepEqual(Object.keys(report.testArtifactSha256).sort(),['cob-cannon-command-engine.js','cob-cannon-command-engine.wasm']);
 for(const [file,pin] of Object.entries(report.testArtifactSha256)) assert.equal(sha(await read('tests/'+file)),pin);
 assert(WebAssembly.validate(await read('tests/cob-cannon-command-engine.wasm')));
 for(const [file,field] of [['build-cob-cannon-command.py','builderSha256'],['test-cob-cannon-command.py','runnerSha256'],
  ['cob-cannon-command-assets.json','assetFixtureSha256'],['cob-cannon-command-harness.cpp','generatedHarnessSha256']])
  assert.equal(sha(await read('tests/'+file)),report[field]);
 assert.equal(report.assetBundleId,engine.assetBundleId);
 assert.equal(report.nativeArtInputs,53);
 const artBytes=await read('tests/cob-native-art-inputs.json');
 assert.equal(sha(artBytes),'212692d9fa221a0f8865aa900028bcafe4f0322128a7af12d7716271d0241229');
 assert.equal(report.fixturesSha256['cob-native-art-inputs.json'],sha(artBytes));
 const build=JSON.parse(await read('tests/cob-cannon-command-build.json'));
 for(const field of ['execution','optimization','productionObjectCount','productionBuildReceiptSha256',
  'generatedHarnessSha256','builderSha256','testArtifactSha256','sourceSha256','productionObjectSha256'])
  assert.deepEqual(report[field],build[field],'Cob Cannon Command exact production binding: '+field);
 const key=r=>`${r.name}/${r.speed}/${r.seed}`;
 assert.equal(report.scenarios.length,24);
 assert.deepEqual(report.scenarios.map(key).sort(),[1729,7331].flatMap(seed=>names.flatMap(name=>[1,2].map(speed=>key({name,speed,seed})))).sort());
 for(const result of report.scenarios) {
  assert.equal(result.execution,'complete-production-engine');
  assert.equal(result.profileIndex,84);
  assert.equal(result.resourceCapacityWarnings,0);
  assert(result.checks>30);
  assert.match(result.logSha256,/^[a-f0-9]{64}$/);
  if(result.name==='controls') {
   assert.equal(result.outcome,'controls-pass');
   assert.equal(result.syntheticControls,false);
   if(Object.hasOwn(result,'actorMutations')) assert.equal(result.actorMutations,false);
   for(const field of controls) assert.equal(result[field],true,'Native cannon control: '+field);
   for(const [field,value] of Object.entries({nativeFooterLabels:1,nativeFooterBottom:594,nativeFooterOverflowNegatives:1,
    nativeFooterInkPixels:2631,profileCredits:0,awardCollected:false})) assert.equal(result[field],value,field);
   continue;
  }
  const won=result.name!=='no-fire';
  assert.equal(result.outcome,won?'win':'loss');
  assert.equal(result.profileCredits,won?1:0);
  assert.equal(result.awardCollected,won);
  if(!won) {
   assert.equal(result.nativeGameOver,true);
   assert.equal(result.nativeShots,0);
   assert(Number.isInteger(result.formationsReached)&&result.formationsReached>=1&&result.formationsReached<=8);
   continue;
  }
  for(const field of earnedTrue) assert.equal(result[field],true,field);
  assert.equal(result.policyIntervalTicks,result.name==='save-reload'?500:250);
  assert.equal(result.failureAndRetry,result.name==='retry-no-fire');
  verifyBattle(result,'native');
  const replay=result.name==='normal';
  assert.equal(result.replayCompleted,replay);
  assert.equal(result.replayStartsAtFormationZero,replay);
  assert.equal(result.nativeRewardDelta,replay?2:1);
  if(replay) verifyBattle(result,'replayNative');
  else {
   assert.equal(result.replayNativeFormations,0);
   assert.equal(result.replayNativeShots,0);
  }
  const saved=result.name.startsWith('save-');
  assert.equal(result.checkpoint.performed,saved);
  assert.equal(result.checkpoint.observedGraphPreserved,saved);
  if(saved) {
   assert.equal(result.checkpoint.phase,result.name==='save-flight'?'native-cob-midflight':'native3000tick-reload');
   assert(Number.isInteger(result.checkpoint.tick)&&result.checkpoint.tick>0);
  }
 }
 for(const [field,count] of Object.entries({primaryNativeWins:16,explicitReplayWins:4,nativeBattleCompletions:20,nativeLossCases:4,isolatedControlCases:4}))
  assert.equal(report[field],count);
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
  const extra=pair.name==='controls'?[...controls,'nativeFooterLabels','nativeFooterBottom','nativeFooterOverflowNegatives']:
   pair.name==='no-fire'?['nativeGameOver','nativeShots']:[...winParity,...(pair.name==='normal'?replayParity:[])];
  const fields=['outcome','profileIndex','profileCredits','awardCollected',...extra];
  assert.deepEqual(pair.comparedFields,fields);
  for(const field of fields) assert.deepEqual(cases[0][field],cases[1][field]);
 }
 assert.equal(report.checks,Object.keys(report.sourceSha256).length+report.scenarios.reduce((sum,r)=>sum+r.checks,0)+report.speedParity.length);
 console.log('PASS Cob Cannon Command: sixteen primary eight-formation wins, four independent full replays, four no-fire losses, four native input controls and twelve speed pairs.');
}
