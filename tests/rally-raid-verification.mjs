// SPDX-License-Identifier: MIT
// Authenticate complete-engine Raid runs separately from synthetic HUD controls.
import assert from 'node:assert/strict';

const shaPattern = /^[a-f0-9]{64}$/;
const names = ['solution', 'save-before', 'save-combat', 'save-transition', 'retry', 'replay'];
const key = result => `${result.name}/${result.speed}/${result.seed}`;
const outcomeFields = ['outcome','boardsSolved','brainsConsumed','legalPlacements','profileIndex',
  'profileCredits','awardCollected','failureAndRetry','scriptedModalRestart',
  'invalidPlacementRejected','thinkingTimeObserved','replayRewardChecked'];
const hudFields = ['outcome','syntheticUIControls','hudOracle','nativeIZMode',
  'nativeIZSamples','nativeIZFullFrameSamples','nativeIZTopBandSamples','nativeIZMismatchPixels',
  'nativeIZHeadTypes','nativeIZHeadSamples','foregroundRegressionNegatives','nativePauseSamples'];
const controlNames=['hud-controls','plant-animation-controls'];
const phaseLabels=['idle-a','idle-b','idle-c','windup-early','windup-late','release','recoil','frost-tail-a','frost-tail-b','cooldown',
  'mender-idle-a','mender-idle-b','mender-heal-a','mender-heal-b'];
const animationBooleans=['idleBodyStill','idleOpenEyesPreserved','idleBlinkObserved','frostTailBodyStill',
  'cooldownBodyStill','normalIdleGeometryChanged','attackGeometryChanged','nativeEyesClosedObserved',
  'noTargetHeld','inRangePulseObserved','nativePausePreserved','attackSaveGraphPreserved',
  'attackSaveBodyPreserved','menderIdleChanged','menderHealObserved','menderHealChanged'];
const animationFields=['outcome','syntheticAnimationControls','animationOracle','nativeBlinkInput','phaseLabels',
  'geometryMismatchPixels','opaqueInteriorMismatchPixels','raid2StaticNegatives','raid3BreathingNegatives','legalPlacements',
  ...animationBooleans];

// Respect strings/comments so this audits actual production method bodies.
function body(text, signature) {
  const start=text.indexOf(signature), open=text.indexOf('{',start);
  assert(start>=0 && open>start, 'Missing native method: '+signature);
  let depth=1, at=open+1;
  while(depth) {
    assert(at<text.length, 'Unbalanced native method: '+signature);
    if(text.startsWith('//',at)) {at=text.indexOf('\n',at);assert(at>=0);continue;}
    if(text.startsWith('/*',at)) {at=text.indexOf('*/',at+2);assert(at>=0);at+=2;continue;}
    if(text[at]==='"' || text[at]==="'") {
      const quote=text[at++];
      while(text[at]!==quote) {assert(at<text.length);at+=text[at]==='\\'?2:1;}
      ++at;continue;
    }
    depth+=(text[at]==='{')-(text[at]==='}');++at;
  }
  return text.slice(start,at);
}

export async function verifyRallyRaid({report, read, sha, engine, fullRunReport, productionBuildBytes}) {
  assert.equal(report.execution,'complete-production-engine');
  assert.equal(report.optimization,'O2','Development probes cannot satisfy the Raid release matrix');
  assert.equal(report.productionObjectCount,122);
  assert.equal(Object.keys(report.sourceSha256).length,828);
  assert.deepEqual(report.sourceSha256,fullRunReport.sourceSha256);
  assert.deepEqual(report.productionObjectSha256,fullRunReport.productionObjectSha256,
    'All complete-engine suites use the same 122 unchanged normal release objects');
  assert.equal(report.productionBuildReceiptSha256,sha(productionBuildBytes));
  const artifacts=['rally-raid-engine.js','rally-raid-engine.wasm'];
  assert.deepEqual(Object.keys(report.testArtifactSha256).sort(),artifacts);
  for(const name of artifacts) assert.equal(sha(await read('tests/'+name)),report.testArtifactSha256[name]);
  assert(WebAssembly.validate(await read('tests/rally-raid-engine.wasm')));
  assert.equal(sha(await read('tests/build-rally-raid.py')),report.builderSha256);
  assert.equal(sha(await read('tests/test-rally-raid.py')),report.runnerSha256);
  assert.equal(sha(await read('tests/rally-raid-assets.json')),report.assetFixtureSha256);
  assert.equal(report.assetBundleId,engine.assetBundleId);
  assert.equal(JSON.parse(await read('tests/rally-raid-assets.json')).assetBundleId,engine.assetBundleId);
  const build=JSON.parse(await read('tests/rally-raid-build.json'));
  for(const field of ['execution','optimization','productionObjectCount','productionBuildReceiptSha256',
    'generatedHarnessSha256','builderSha256','testArtifactSha256','sourceSha256','productionObjectSha256'])
    assert.deepEqual(report[field],build[field],'Raid report binds exact build metadata: '+field);

  const matrix=[1729,7331].flatMap(seed=>[...names,...controlNames].flatMap(name=>[1,2].map(speed=>key({name,speed,seed}))));
  assert.equal(report.scenarios.length,32);
  assert.deepEqual(report.scenarios.map(key).sort(),matrix.sort());
  const wins=report.scenarios.filter(result=>names.includes(result.name));
  const controls=report.scenarios.filter(result=>result.name==='hud-controls');
  const animationControls=report.scenarios.filter(result=>result.name==='plant-animation-controls');
  assert.equal(wins.length,24,'Only legally deployed winning runs count as puzzle completion evidence');
  assert.equal(controls.length,4,'Synthetic stage-selection/render controls are separately labeled');
  assert.equal(animationControls.length,4,'Live body-animation controls are separately labeled');
  for(const result of report.scenarios) {
    assert.equal(result.execution,'complete-production-engine');
    assert.equal(result.resourceCapacityWarnings,0);
    assert.match(result.logSha256,shaPattern);
    assert(Number.isInteger(result.checks) && result.checks>0);
    if(result.name==='plant-animation-controls') {
      assert.equal(result.outcome,'animation-pass');
      assert.equal(result.syntheticAnimationControls,true);
      assert.equal(result.animationOracle,'native-iz-still-idle-live-attack-body');
      assert.equal(result.nativeBlinkInput,'DoBlink-explicit-synthetic','The closed-frame visual control uses explicit native blink input in its synthetic test');
      assert.deepEqual(result.phaseLabels,phaseLabels);
      assert(result.bodySamples>=16 && result.geometryPixelComparisons>5000000 && result.opaqueInteriorComparisons>10000);
      assert.equal(result.geometryMismatchPixels,0);
      assert.equal(result.opaqueInteriorMismatchPixels,0);
      assert.equal(result.raid2StaticNegatives,3,'The published static preview must fail windup, release and recoil body comparisons');
      assert.equal(result.raid3BreathingNegatives,1,'The published Raid.3 helper must fail the neutral idle body reference');
      assert.equal(result.legalPlacements,2);
      for(const field of animationBooleans) assert.equal(result[field],true,'Actual native body/range/pause/save/healing proof: '+field);
      for(const field of ['boardsSolved','brainsConsumed','profileCredits','awardCollected'])
        assert.equal(result[field],undefined,'Synthetic animation control cannot claim a completed battle: '+field);
      continue;
    }
    if(result.name==='hud-controls') {
      assert.equal(result.outcome,'controls-pass');
      assert.equal(result.syntheticUIControls,true);
      assert.equal(result.hudOracle,'same-frame-native-i-zombie');
      assert.equal(result.nativeIZMode,61,'Native I,Zombie1 provides the actual same-state render reference');
      assert.equal(result.nativeIZSamples,27);
      assert.equal(result.nativeIZFullFrameSamples,22);
      assert.equal(result.nativeIZTopBandSamples,5);
      assert(result.nativeIZPixelComparisons>10000000);
      assert.equal(result.nativeIZMismatchPixels,0);
      assert.equal(result.nativeIZHeadTypes,5);
      assert.equal(result.nativeIZHeadSamples,18);
      assert(result.nativeIZVisibleHeadPixels>0);
      assert.equal(result.foregroundRegressionNegatives,3);
      assert(result.foregroundHeadOcclusionPixels>0,'Actual Raid.1 foreground redraws must obscure native zombie heads');
      assert.equal(result.nativePauseSamples,2);
      assert(result.rallyCallStateSamples>0 && result.rallyIdleStateSamples>0);
      for(const field of ['hudOpaquePixels','hudUnderlayNegatives','nativeControlOracle'])
        assert.equal(result[field],undefined,'Foreground-bank coverage is superseded by native I,Zombie image equivalence');
      for(const field of ['boardsSolved','brainsConsumed','profileCredits','awardCollected'])
        assert.equal(result[field],undefined,'Synthetic HUD fixture must not claim a battle/reward: '+field);
      continue;
    }
    const replay=result.name==='replay', saved=result.name.startsWith('save-');
    assert.equal(result.outcome,'win');
    assert.equal(result.syntheticUIControls,undefined);
    assert.equal(result.boardsSolved,replay?10:5);
    assert.equal(result.brainsConsumed,replay?50:25,'Each completed board consumes all five actual native brains');
    assert(result.legalPlacements>0 && result.rallyCallObservations>0 && result.boostObservations>0);
    assert(result.chilledCallerObservations>0 && result.healingObservations>0,
      'Every legal solution exercises the actual defending Chill-shroom and Mender-bloom mechanics');
    assert.equal(result.profileIndex,80);
    assert.equal(result.profileCredits,replay?2:1);
    assert.equal(result.awardCollected,true);
    assert.equal(result.failureAndRetry,result.name==='retry');
    assert.equal(result.scriptedModalRestart,result.name==='solution');
    assert.equal(result.thinkingTimeObserved,result.name==='solution');
    assert.equal(result.invalidPlacementRejected,true);
    assert.equal(result.replayRewardChecked,replay,'Replay checks first trophy then moneybag without duplicating unique completion');
    assert.deepEqual(result.checkpoint,{performed:saved,combatGraphPreserved:saved});
  }
  assert.equal(report.speedParity.length,16);
  assert.deepEqual(report.speedParity.map(result=>`${result.name}/${result.seed}`).sort(),
    [1729,7331].flatMap(seed=>[...names,...controlNames].map(name=>`${name}/${seed}`)).sort());
  for(const parity of report.speedParity) {
    assert.equal(parity.sameNativeOutcome,true);
    const fields=parity.name==='plant-animation-controls'?animationFields:parity.name==='hud-controls'?hudFields:outcomeFields;
    assert.deepEqual(parity.comparedFields,fields);
    const pair=report.scenarios.filter(result=>result.name===parity.name && result.seed===parity.seed);
    assert.equal(pair.length,2);
    for(const field of fields) assert.deepEqual(pair[0][field],pair[1][field],'Actual 1x/2x Raid parity: '+parity.name+'/'+field);
  }
  assert.equal(report.checks,828+report.scenarios.reduce((sum,result)=>sum+result.checks,0)+report.speedParity.length);

  // Packet77 follows the native zombie mapping/cache/cost path. These source
  // checks accompany actual native packet/lawn clicks in the complete driver.
  const text=async name=>(await read('source/'+name)).toString().replace(/\r\n?/g,'\n');
  const [plant,challenge,packet,cache,raid,presentation,harness]=await Promise.all([
    text('src/Lawn/Plant.cpp'),text('src/Lawn/Challenge.cpp'),text('src/Lawn/SeedPacket.cpp'),
    text('src/Lawn/System/ReanimationLawn.cpp'),text('src/Lawn/System/RallyRaid.h'),
    text('src/Lawn/System/RallyRaidPresentation.cpp'),
    read('tests/rally-raid-harness.cpp').then(bytes=>bytes.toString())]);
  assert.match(body(challenge,'ZombieType Challenge::IZombieSeedTypeToZombieType('),/case SEED_ZOMBIE_RALLY:\s*return ZOMBIE_RALLY;/);
  assert.match(body(challenge,'int Challenge::IsZombieSeedType('),/theSeedType == SEED_ZOMBIE_RALLY/);
  assert.match(body(plant,'void Plant::DrawSeedType('),/Challenge::IsZombieSeedType[\s\S]*Challenge::IZombieSeedTypeToZombieType[\s\S]*mReanimatorCache->DrawCachedZombie/);
  assert.match(body(cache,'std::unique_ptr<MemoryImage> ReanimatorCache::MakeCachedZombieFrame('),/RallyPresentation::PrepareRig[\s\S]*RallyPresentation::DrawRig/);
  assert.match(body(plant,'int Plant::GetCost('),/case SeedType::SEED_ZOMBIE_RALLY:\s*return RallyRaid::kRallyCost;/);
  assert.match(raid,/kRallyCost = 100;/);
  assert.match(body(plant,'int Plant::GetRefreshTime('),/Challenge::IsZombieSeedType\(theSeedType\)\)\s*\{\s*return 0;/);
  assert.match(body(packet,'void DrawSeedPacket('),/FONT_PICO129/);
  const flash=body(packet,'void SeedPacket::FlashIfReady(');
  assert.match(flash,/MakeRenderOrder\(RenderLayer::RENDER_LAYER_UI_BOTTOM, 0, 2\)/);
  assert(!flash.includes('RallyRaid::IsMode'),'Native packet feedback has no Raid-specific foreground override');
  const card=body(presentation,'Sexy::Image* GetBonusImage(');
  assert.match(card,/RallyPresentation::PrepareRig[\s\S]*RallyPresentation::DrawRig/);
  assert.match(card,/Blank\(80,65\)/);
  assert.match(card,/std::min\(22\.0f\/brainBounds\.mWidth,20\.0f\/brainBounds\.mHeight\)/);
  assert.match(card,/PvzpDrawImageScaledF\(&picture,Sexy::IMAGE_BRAIN/);
  const liveCardboard=body(presentation,'bool DrawCustomPlant(');
  assert.match(liveCardboard,/ReanimationTryToGet\(plant\.mBodyReanimID\)/);
  assert.match(liveCardboard,/RestoreDrawState[\s\S]*mFilterEffect=previousFilter/);
  assert.match(liveCardboard,/mOverlayMatrix=previousOverlay/);
  assert.match(liveCardboard,/GetAttackPhase[\s\S]*AttackPhase::Idle[\s\S]*mOverlayMatrix\.LoadIdentity\(\)/);
  assert.match(liveCardboard,/if \(stillChill\)[\s\S]*LanternShroom::DrawRig\(&cutout,\*body,LanternShroom::BodyExpression::Auto\)/);
  assert.match(liveCardboard,/LanternShroom::DrawPlantRig[\s\S]*MenderBloom::DrawPlantRig/);
  assert(!liveCardboard.includes('Plant::GetImage'),'Raid cardboard renders the current saved native plant rig instead of a cached packet preview');
  assert.match(harness,/Only the hardware confirmation result is scripted/);
  assert.equal((body(harness,'class IntegrationLawnApp final : public LawnApp').match(/\boverride\b/g)||[]).length,1,
    'The test application overrides only hardware confirmation input');
  const dialog=body(harness,'Sexy::Dialog* DoDialog(');
  assert.match(dialog,/LawnApp::DoDialog\(id,modal,header,lines,footer,buttons\)/);
  assert.match(dialog,/if\(id==DIALOG_CONFIRM_RESTART && restartResponse\) dialog->mResult=restartResponse;/);
  const winning=body(harness,'RunStats Win(');
  assert(!/RallyRaid::ResetStage|(?:mSunMoney|mPlantHealth|mBodyHealth|mChallengeScore)\s*=(?!=)/.test(winning),
    'Winning policy cannot author stages or overwrite economy, combat health or brain credit');
  assert.match(winning,/Require\(award==\(initial\?COIN_AWARD_MONEY_BAG:COIN_TROPHY\)/);
  assert.match(winning,/mChallengeRecords\[kProfile\]==initial&&!b->HasLevelAwardDropped\(\)/);
  assert.match(winning,/mChallengeRecords\[kProfile\]==initial\+1/);
  const checkpoint=body(harness,'void SaveContinue(');
  assert.match(checkpoint,/LawnSaveGame\([\s\S]*Graph\(b\)[\s\S]*TryLoadGame\(\)[\s\S]*Graph\(app->mBoard\)==graph/);
  assert.match(checkpoint,/ContinueDialog_Continue/);
  assert.match(harness,/GetNumTrophies\(CHALLENGE_PAGE_BONUS\)==1/);
  console.log('PASS 24 legal native Rally Raid wins, 4 native I,Zombie render controls, 4 body-animation controls, 16 native speed pairs, three save phases, budget-loss Retry and final-only first/replay credit.');
}
