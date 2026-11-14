// SPDX-License-Identifier: MIT
// Independent acceptance of the complete native two-sided puzzle, not a model
// of its combat. A final contract is accepted only after its full actual run.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CURRENT_ENGINE_ID,CURRENT_SOURCE_COUNT,CURRENT_OBJECT_COUNT,reconstructTorchSources,reconstructDoubleSources,historicalEngine}
 from './native-release-context.mjs';

// Reviewed after all52 actual O2 cases and26 native speed pairs completed on
// the final briefing build. Earlier probes remain historical fixtures only.
const gustProjection=Symbol('authenticated current production before historical Double observation checks');
const GUST_DOUBLE_RETENTION_SHA256='e057c9ba7cdec9cffdf157c59d3873293624723180a3a4bbef8db76e84e4c211';
const acceptedContractPins=new Set(['2897a2f15387c4f8b244d92dc587c2437ea370daa02f1e556e6d8ccab24d4ac4']);
const acceptedReportPins=new Set(['185ddbaae03ac20287552b9276064a800b1447d4a8d6cefdd58c9cc3a7e2d55c']);
// Derived only from the sealed report above. Native diagnostics include
// environment-dependent loading/compile timings, so raw log digests differ.
// Every other report field, array order and value must remain exactly reviewed.
const acceptedReportContentPins=new Set(['2cdc322bf037d57a4ede402a509a77a6fe53a66d68264ca7a00ea3979d74c08b']);
const names=['normal','cold','save-planning','save-defense','save-transition','save-offense',
 'retry-defense','retry-offense','replay','empty-defense','waste-offense','controls','presentation'];
const matrix=[1729,7331].flatMap(seed=>names.flatMap(name=>[1,2].map(speed=>[name,speed,seed])));
const key=row=>[row.name,row.speed,row.seed].join('/');
const text=value=>Buffer.from(value).toString('utf8').replace(/\r\n?/g,'\n');
const json=value=>JSON.parse(text(value).replace(/^\uFEFF/,''));
const fields=(actual,expected)=>{for(const [name,value]of Object.entries(expected))assert.deepEqual(actual[name],value,name);};
const integer=(value,min=0,max=Number.MAX_SAFE_INTEGER)=>assert(Number.isSafeInteger(value)&&value>=min&&value<=max);
const digest=value=>assert(typeof value==='string'&&/^[a-f0-9]{64}$/.test(value));
const safeName=value=>{
 assert(typeof value==='string'&&value&&!value.startsWith('/')&&!/[\x00-\x1f\\:]/.test(value));
 assert(value.split('/').every(part=>part&&part!=='.'&&part!=='..'));return value;
};
const ledger=[0,2].map(type=>[0,1,2,3,4].map(row=>[type,row,1]));
const canonical=value=>Array.isArray(value)?value.map(canonical):
 value!==null&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(name=>[name,canonical(value[name])])):value;

export function verifyDoubleAgentReportIdentity({reportBytes,sha}){
 const report=json(reportBytes);
 assert(Array.isArray(report.scenarios)&&report.scenarios.length===52,'The complete reviewed report has 52 native results');
 const scenarios=report.scenarios.map(row=>{
  assert(row!==null&&typeof row==='object'&&!Array.isArray(row));
  digest(row.logSha256);
  const {logSha256,...observations}=row;
  return observations;
 });
 const contentPin=sha(Buffer.from(JSON.stringify(canonical({...report,scenarios}))));
 assert(acceptedReportContentPins.has(contentPin),
  'Only the independently reviewed complete actual matrix is accepted; fresh log digests alone may differ');
 // The published evidence retains its exact byte pin; a fresh run is accepted
 // only with identical reviewed content and the raw-log checks below.
 return {report,sealedReport:acceptedReportPins.has(sha(reportBytes))};
}
const expectedSnapshot=cold=>Array.from({length:54},(_,i)=>{
 const row=Math.floor(i/9),col=i%9;
 return row<5?(col===1?(cold?6:1):col===3?4:0):0;
});

export async function verifyDoubleAgentSourceBounds({read,sha,engine}){
 const referenceBytes=fs.readFileSync(new URL('./fixtures/double1-parent-reference.json',import.meta.url));
 const parent=await reconstructTorchSources({referenceBytes,read,sha,engine});
 for(const path of ['src/Lawn/Board.h','src/Lawn/Challenge.h','src/Lawn/Plant.h','src/Lawn/Zombie.h',
  'src/LawnApp.h','src/Lawn/System/SaveGame.cpp','src/Lawn/System/PlayerInfo.cpp','src/Lawn/System/PlayerInfo.h'])
  assert.deepEqual(Buffer.from(await read('source/'+path)),parent.files.get(path),
   'The native board, actor, challenge, profile and save layouts remain exact: '+path);
 const enums=text(await read('source/src/ConstEnums.h'));
 assert.equal(enums.replace('\tGAMEMODE_CHALLENGE_DOUBLE_AGENT = 91,\n','').replace('\tNUM_GAME_MODES = 92','\tNUM_GAME_MODES = 91'),
  text(parent.files.get('src/ConstEnums.h')),'Only the next stable mode identifier is appended');
 let zombie=text(await read('source/src/Lawn/Zombie.cpp'));
 const guard='    if (DoubleAgent::IsMode(mApp->mGameMode)) return false;\n';
 assert.equal(zombie.split(guard).length,2);zombie=zombie.replace(guard,'');
 assert.equal(zombie,text(parent.files.get('src/Lawn/Zombie.cpp')),
  'All native enemy health, damage, speed, targeting and abilities remain exact');
 const header=text(await read('source/src/Lawn/System/DoubleAgent.h'));
 for(const [name,value]of Object.entries({kProfileIndex:90,kRulesVersion:1,kStartingSun:1500,kOffenseSun:1000,
  kGardenColumns:5,kDeploymentColumn:5,kWaveCount:2,kOpeningDelay:200,kFormationInterval:1200,kTransitionTicks:120}))
  assert(header.includes(`${name} = ${value};`),'Independently fixed puzzle rule: '+name);
 assert.match(header,/kMode = GAMEMODE_CHALLENGE_DOUBLE_AGENT/);
 for(const [name,value]of Object.entries({kPlanning:138,kDefense:139,kTransition:140,kOffense:141,kFinished:142,kFailed:143}))
  assert(header.includes(`${name} = static_cast<ChallengeState>(${value});`));
 assert.match(header,/constexpr bool IsMode\(GameMode mode\) \{ return mode == kMode; \}/);
 const core=text(await read('source/src/Lawn/System/DoubleAgent.cpp'));
 assert(!/->(?:mPlantHealth|mPlantMaxHealth|mBodyHealth|mBodyMaxHealth|mHelmHealth|mShieldHealth|mVelX)\s*[+*/-]?=/.test(core),
  'The puzzle never changes native combat statistics or heals through a direct health assignment');
 for(const exact of ['challenge.mBeghouledEated[plant->mPlantCol][plant->mRow] = static_cast<int>(plant->mSeedType) + 1;',
  'Plant* plant = board.NewPlant(col, row, static_cast<SeedType>(stored - 1), SEED_NONE);',
  'challenge.IZombieSetupPlant(plant);','challenge.IZombieUpdate();',
  'for (SeedPacket& packet : board.mSeedBank->mSeedPackets) packet.mPacketType = SEED_NONE;',
  'board.DisplayAdvice("SWITCH SIDES!", MESSAGE_STYLE_BIG_MIDDLE, ADVICE_NONE);'])assert(core.includes(exact),exact);
 const app=text(await read('source/src/LawnApp.cpp'));
 assert(app.includes('DoubleAgent::IsOffense(*mBoard) ||'),'Original I, Zombie routing is phase-dependent');
 const board=text(await read('source/src/Lawn/Board.cpp'));
 assert(board.includes('if (!DoubleAgent::Validate(*this)) return false;'));
 assert(board.includes('if (DoubleAgent::IsMode(mApp->mGameMode) && !DoubleAgent::IsPlanning(*this)) return;'));
 assert(board.includes('mChallenge->mChallengeState = DoubleAgent::kFailed;'));
 const challenge=text(await read('source/src/Lawn/Challenge.cpp'));
 assert(challenge.includes('mBoard->DisplayAdvice("Build with 1500 sun. Then Let\'s Rock!\\nYou will face this garden next.", MESSAGE_STYLE_BIG_MIDDLE_FAST, ADVICE_NONE);'),
  'The initial native briefing stays clear of the preparation controls');
 assert.match(text(await read('source/src/Lawn/Board.h')),/bool\s+mZombieAllowed\[100\]/);
 return parent;
}

export async function verifyDoubleAgentBuildBindings({report,read,sha,engine,fullRunReport,productionBuildBytes}){
 const current=engine.id==='0.2.6-web-gust.1';
 const sourceCount=current?878:872,objectCount=current?147:144;
 assert(current||engine.id==='0.2.6-web-double.1');
 if(current){assert.equal(CURRENT_SOURCE_COUNT,878);assert.equal(CURRENT_OBJECT_COUNT,147);}
 fields(report,{execution:'complete-production-engine',optimization:'O2',engineId:engine.id,
  mode:91,profileIndex:90,productionObjectCount:objectCount,failures:0,exitCode:0});
 assert.equal(Object.keys(report.sourceSha256).length,sourceCount);
 assert.equal(Object.keys(report.productionObjectSha256).length,objectCount);
 assert.deepEqual(report.sourceSha256,fullRunReport.sourceSha256);
 assert.deepEqual(report.productionObjectSha256,fullRunReport.productionObjectSha256);
 for(const [path,pin]of Object.entries(report.sourceSha256)){
  safeName(path);assert(path.startsWith('source/'));digest(pin);assert.equal(sha(await read(path)),pin,path);
 }
 for(const [path,pin]of Object.entries(report.productionObjectSha256)){safeName(path);digest(pin);assert(path.endsWith('.o'));}
 const normal=json(productionBuildBytes);
 fields(normal,{status:'PASS',exitCode:0,sourceUnchangedDuringBuild:true,sourceFiles:sourceCount});
 assert.equal(report.productionBuildReceiptSha256,sha(productionBuildBytes));
 for(const suffix of ['js','wasm'])assert.equal(normal.outputs['build/pvz-portable.'+suffix].sha256,engine.artifacts[suffix+'Sha256']);
 const build=json(await read('tests/double-agent-build.json'));
 fields(build,{presentationControlsAvailable:true,developmentNoArt:false});
 for(const field of ['execution','optimization','productionObjectCount','productionBuildReceiptSha256',
  'generatedHarnessSha256','builderSha256','policySha256','controlSha256','verificationContractSha256',
  'testArtifactSha256','testInputSha256','sourceSha256','productionObjectSha256'])
  assert.deepEqual(report[field],build[field],'One authenticated actual production-linked driver: '+field);
 for(const [field,path]of Object.entries({generatedHarnessSha256:'double-agent-harness.cpp',builderSha256:'build-double-agent.py',
  runnerSha256:'test-double-agent.py',policySha256:'double-agent-policy.h',controlSha256:'double-agent-controls.h',
  verificationContractSha256:'double-agent-verification-contract.json'}))assert.equal(report[field],sha(await read('tests/'+path)),path);
 for(const [path,pin]of Object.entries(build.testInputSha256)){
  safeName(path);assert(!path.includes('/'));digest(pin);assert.equal(sha(await read('tests/'+path)),pin,path);
 }
 for(const suffix of ['js','wasm'])assert.equal(sha(await read('tests/double-agent-engine.'+suffix)),report.testArtifactSha256['double-agent-engine.'+suffix]);
 assert(WebAssembly.validate(await read('tests/double-agent-engine.wasm')));
 return build;
}

export async function verifyDoubleAgentCaseLog(row,{read,sha}){
 assert(matrix.some(([name,speed,seed])=>key(row)===key({name,speed,seed})));
 const path=`tests/double-agent-logs/${row.name}-${row.speed}x-${row.seed}.log`;
 const bytes=await read(path);digest(row.logSha256);assert.equal(sha(bytes),row.logSha256,path);
 const raw=text(bytes),records=raw.split('\n').filter(line=>line.startsWith('DOUBLE_AGENT_RESULT '));
 assert.equal(records.length,1,'Exactly one actual native result per invocation');
 const diagnostics=raw.split('\n').filter(line=>!line.startsWith('DOUBLE_AGENT_RESULT ')).join('\n');
 assert(!/Too many (?:particle|emitters)|DataArray.*(?:full|exhaust|capacity)|(?:particle|reanimation).*capacity|memory access out of bounds|RuntimeError|double-agent:FAIL/i.test(diagnostics),
  'A native exception or exhausted resource cannot be hidden in a passing result');
 const actual=JSON.parse(records[0].slice('DOUBLE_AGENT_RESULT '.length));
 const {logSha256,resourceCapacityWarnings,...observations}=row;
 assert.deepEqual(actual,observations,'The complete native raw observation equals the report; only runner-added log metadata is excluded');
 fields(row,{resourceCapacityWarnings:0});return actual;
}

// Scenario acceptance is intentionally exported for bounded negative controls;
// the aggregate path below additionally authenticates all raw logs and inputs.
export function verifyDoubleAgentScenario(row){
 assert(names.includes(row.name));assert([1,2].includes(row.speed)&&[1729,7331].includes(row.seed));
 integer(row.checks,1);fields(row,{execution:'complete-production-engine',silentHardware:true,audioDeviceOpened:false});
 if(row.name==='controls'||row.name==='presentation'){
  fields(row,{family:'synthetic-controls',outcome:'controls-pass',syntheticActorSetup:true,countedEarnedWins:0,profileCredits:0});
  fields(row,{all100ProfileRecordsPreserved:true,mode:91,profileIndex:90});
  if(row.name==='controls'){
   fields(row,{exhaustiveNativePlantingQueries:2106,nativePreparationPlantInputs:5,nativePreparationSunSpent:425,
    nativeOptionsPauseUpdateCalls:12,syntheticTransitionSetup:true,syntheticNativeAttackerSetup:true,
    nativeCommittedSnapshotExact:true,nativeDefenseEditsRejected:true,nativeFullHealthSnapshotRestore:true,
    nativeArmedMineAndReadyChomper:true,nativeCardboardIdleFrozen:true,nativeCardboardAttackObserved:true,
    nativeSixCardBankMarginRejected:true,nativeOptionsPauseGraphExact:true,nativeContinueGraphExact:true,
    nativeRestartCancelGraphExact:true,nativeRestartStartsPlanning:true});
   integer(row.planningNoFreeSunObservedFrames,800,801);integer(row.planningUnarmedMineObservedFrames,1600,1601);
   integer(row.cardboardAttackObservationFrames,1,800);
   assert(typeof row.syntheticOffenseGraphBefore==='string'&&row.syntheticOffenseGraphBefore.length>100);
   assert.equal(row.syntheticOffenseGraphAfter,row.syntheticOffenseGraphBefore);
   const graph=readGraph(row.syntheticOffenseGraphAfter);
   assert.equal(graph.head[5],141);assert.equal(graph.head[1],1000);assert.equal(graph.head[13],6);
  }else{
   fields(row,{nativeCompletePeaCard:true,nativeOriginalZombieCard:true,headlessCardNegativeRejected:true,
    allNineteenCatalogCardsFit:true,allFourNativeFooterStringsFit:true,nativeFrameExports:true,
    nativeDefenseEarnedForVisuals:true,nativeFinalOffenseWin:false,nativeCatalogCards:19,nativeFooterStates:4,
    initialBriefingBandTop:300,initialBriefingBandBottom:410,nativeInitialBriefingClearOfInputs:true,
    historicalHintOverlapRejected:true,nativeIZTopBandSamples:32,nativeIZPixelComparisons:1792000,
    nativeIZMismatchPixels:0,sameFrameOriginalIZombieHeaderMatched:true});
   integer(row.initialBriefingGlyphBottom,331,410);integer(row.historicalBriefingGlyphBottom,551,600);
   integer(row.nativeRow0HeadPixels,513,1792000);
   integer(row.nativeCardHeadPixels,50,80*65);assert.equal(row.nativeCardHeadMatches,row.nativeCardHeadPixels);
   integer(row.headlessNegativeMatches,0);assert(row.headlessNegativeMatches*4<row.nativeCardHeadPixels);
   integer(row.nativeCardZombiePixels,250,80*65);assert.equal(row.nativeCardZombieMatches,row.nativeCardZombiePixels);
  }
  return;
 }
 const loss=['empty-defense','waste-offense'].includes(row.name),empty=row.name==='empty-defense';
 const replay=row.name==='replay',retry=row.name.startsWith('retry-'),cold=row.name==='cold';
 const wins=loss?0:replay?2:1;
 fields(row,{family:'double-agent',mode:91,profileIndex:90,outcome:loss?'native-loss':'win',profileCredits:wins,
  nativeNineteenthBonusCardInput:true,ordinaryNativeMouseInputsOnly:true,postStartHPActorStageTimeOrRNGEdits:false,
  observerNativeTicks:2,minimumInputCadenceTicks:150,nativeActualAwardCollected:!loss,nativeGameOver:loss,
  failureAndRetry:retry,retryWholePuzzleReset:retry,nativeReplayCompleted:replay,
  all100ProfileRecordsPreservedExceptEarnedCredit:true,fullHealthOriginalGardenRestored:!empty,nativeSixZombieOffenseBank:!empty});
 assert.deepEqual(row.originalSnapshot,empty?Array(54).fill(0):expectedSnapshot(cold));
 assert.equal(row.authoredDefenseZombies,10);assert.deepEqual(row.defenseLedger,ledger);
 assert.deepEqual(row.replayDefenseLedger,replay?ledger:[[],[]]);
 assert.deepEqual(row.phaseTrace,empty?[138,139,143]:[138,139,140,141,loss?143:142]);
 assert.equal(row.planningInputs,empty?0:replay?20:10);
 assert.equal(row.planningSpent,empty?0:(cold?1125:750)*(replay?2:1));
 integer(row.defenseDamageObservations,0);
 if(empty){
  fields(row,{armyInputs:0,armySpent:0,defenseTicks:0,offenseTicks:0,nativeAwardState:-1,nativeAwardType:-1,
   terminalPhase:143,remainingSun:0,remainingBrains:0});
  assert.deepEqual(row.restoredSnapshot,[]);assert.deepEqual(row.restoredGardenCells,[]);
 }else{
  assert.deepEqual(row.restoredSnapshot,expectedSnapshot(cold));
  const wanted=[0,1,2,3,4].flatMap(r=>[[cold?5:0,1,r,300,300],[3,3,r,4000,4000]]);
  const ordered=cells=>[...cells].sort((a,b)=>a[1]-b[1]||a[2]-b[2]);
  assert.deepEqual(ordered(row.restoredGardenCells),ordered(wanted),'Every original species/cell/full native health is observed after reconstruction');
  integer(row.defenseTicks,1400,200000);
  assert.equal(row.armyInputs,loss?20:cold||replay?10:5);
  assert.equal(row.armySpent,loss?1000:cold?875:replay?750:375);
  if(loss){
   fields(row,{nativeAwardState:-1,nativeAwardType:-1,terminalPhase:143});
   integer(row.remainingSun,0,49);integer(row.remainingBrains,1,5);
  }else{
   fields(row,{nativeAwardState:142,nativeAwardType:8});
   assert([-1,142].includes(row.terminalPhase));assert([-1,0].includes(row.remainingBrains));
   integer(row.remainingSun,-1,1000);integer(row.offenseTicks,1,200000);
  }
 }
 assert.equal(row.winTicks.length,wins);row.winTicks.forEach(value=>integer(value,1,200000));
 fields(row,{retryLossCredits:0});
 if(retry){assert.equal(row.retryLossPhase,row.name==='retry-defense'?139:141);integer(row.retryLossTick,1,200000);}
 else fields(row,{retryLossPhase:0,retryLossTick:0});
 for(const array of [row.nativeProfileRecordsBefore,row.nativeProfileRecordsAfter]){
  assert(Array.isArray(array)&&array.length===100);array.forEach(value=>integer(value,0,0xffffffff));
 }
 assert.equal(row.nativeProfileRecordsBefore[90],0);
 row.nativeProfileRecordsBefore.forEach((value,i)=>assert.equal(row.nativeProfileRecordsAfter[i],value+(i===90?wins:0)));
 verifyDoubleAgentCheckpoint(row);
}

function readGraph(value){
 assert(typeof value==='string'&&value.length>100);
 const [header,...rows]=value.split(';'),head=header.split(':').map(Number);
 assert.equal(head.length,21);head.forEach(value=>integer(value,-1,0xffffffff));
 const groups=new Map();
 for(const record of rows){const [kind,...values]=record.split(',');assert(['snapshot','p','z','g','s','c','b','r','a'].includes(kind));
  if(kind==='a'){
   assert.equal(values.length,7,'Complete saved native advice observation');
   for(const i of [0,1,2,3,5])integer(Number(values[i]),0,100000);
   integer(Number(values[0]),0,18);integer(Number(values[5]),0,18);
   for(const i of [4,6])assert(/^(?:[a-f0-9]{2}){0,127}$/.test(values[i]),'Native advice uses canonical UTF8 byte hex');
   if(!groups.has(kind))groups.set(kind,[]);groups.get(kind).push(values);continue;
  }
  const numbers=values.map(Number);assert(numbers.every(Number.isFinite));
  const lengths={snapshot:54,p:42,z:25,g:13,s:10,c:5,b:8,r:8};
  assert.equal(numbers.length,lengths[kind],'Complete observed native graph record: '+kind);
  if(!groups.has(kind))groups.set(kind,[]);groups.get(kind).push(numbers);
 }
 assert.equal(groups.get('snapshot')?.length,1);assert.equal(groups.get('a')?.length,1);return {head,groups};
}

export function verifyDoubleAgentCheckpoint(row){
 const saved=row.name.startsWith('save-'),cp=row.checkpoint;
 fields(cp,{performed:saved,graphPreserved:saved});
 if(!saved){fields(cp,{phase:'',state:0,sun:0,plants:0,zombies:0,brains:0,nativeEnemiesOnScreen:false,snapshot:[],beforeGraph:'',afterGraph:''});return;}
 const phase=row.name.slice(5),state={planning:138,defense:139,transition:140,offense:141}[phase];
 fields(cp,{phase,state});assert.equal(cp.beforeGraph,cp.afterGraph);
 assert.equal(cp.nativeEnemiesOnScreen,phase==='defense'||phase==='offense',
  'The native enemy predicate distinguishes dying headless bodies from a pending assault');
 const {head,groups}=readGraph(cp.beforeGraph);
 assert.equal(head[5],state);assert.equal(head[1],cp.sun);assert.deepEqual(groups.get('snapshot')[0],cp.snapshot);
 const advice=groups.get('a')[0];
 assert.equal((groups.get('p')||[]).length,cp.plants);
 assert.equal((groups.get('g')||[]).filter(record=>record[1]===12).length,cp.brains);
 if(phase==='planning'){
  fields(cp,{sun:1200,plants:4,zombies:0,brains:0});assert.deepEqual(cp.snapshot,Array(54).fill(0));assert.equal(head[13],7);
  assert.equal(Number(advice[0]),13);integer(Number(advice[1]),1,500);
  assert.equal(Buffer.from(advice[4],'hex').toString('utf8'),"Build with 1500 sun. Then Let's Rock!\nYou will face this garden next.");
 }else{
  assert.deepEqual(cp.snapshot,expectedSnapshot(false));
  if(phase==='defense'){
   fields(cp,{sun:0,brains:0});integer(cp.plants,1,10);integer(cp.zombies,1,10);assert((groups.get('s')||[]).length>0);assert.equal(head[13],0);
  }else if(phase==='transition'){
   fields(cp,{sun:0,brains:0});assert.equal(head[13],0);integer(head[6],1,120);
   assert.equal(Number(advice[0]),12);assert.equal(Buffer.from(advice[4],'hex').toString('utf8'),'SWITCH SIDES!');
  }else{
   integer(cp.sun,0,999);integer(cp.plants,1,10);integer(cp.zombies,1,20);integer(cp.brains,1,5);
   assert((groups.get('s')||[]).length>0);assert.equal(head[13],6);
  }
 }
}

export async function verifyDoubleAgentHistory({contract,read,sha,report}){
 const bytes=await read('tests/double-agent-development-history.json');
 assert.equal(sha(bytes),contract.developmentHistorySha256);
 const history=json(bytes),prefix='tests/double-agent-development-history/initial-planning-ui-and-transition/';
 fields(history,{schemaVersion:1,
  oldNormalReceiptSha256:'2ce4be6cbca24f139b3e6deb1c3649eeea90dc65ad0a3fdc30f7f40cfe58f91f',
  oldChallengeSha256:'38bf545e4fd06cde09d00309d56b7871b362edd9b8854bdc7e37850d7d5499e5',
  newChallengeSha256:'0b20fc3af286884ce773323c2b8df248ed7b51cfc33c71569d58d7f17d7324b8'});
 assert.equal(Object.keys(history.filesSha256).length,19);
 for(const [path,pin]of Object.entries(history.filesSha256)){
  safeName(path);assert(path.startsWith(prefix));digest(pin);
  assert.equal(contract.fixtureSha256[path],pin,'Every preserved development observation is independently registered');
  assert.equal(sha(await read(path)),pin,path);
 }
 const before=json(await read(prefix+'logs/source-before.json')),after=json(await read(prefix+'logs/source-after.json'));
 assert.deepEqual(before,after);assert.equal(Object.keys(before).length,872);
 for(const [path,pin]of Object.entries(before)){
  safeName(path);digest(pin);
  assert.equal(pin,path==='src/Lawn/Challenge.cpp'?history.oldChallengeSha256:report.sourceSha256['source/'+path],
   'Only the planning message changes between the earlier native probes and final engine');
 }
 const previous=Buffer.from(await read(prefix+'source/src/Lawn/Challenge.cpp'));
 assert.equal(sha(previous),history.oldChallengeSha256);
 const oldLine='mBoard->DisplayAdvice("Build with 1500 sun, then Let\'s Rock! You will face this garden next.", MESSAGE_STYLE_HINT_FAST, ADVICE_NONE);';
 const newLine='mBoard->DisplayAdvice("Build with 1500 sun. Then Let\'s Rock!\\nYou will face this garden next.", MESSAGE_STYLE_BIG_MIDDLE_FAST, ADVICE_NONE);';
 assert.equal(text(previous).split(oldLine).length,2);
 assert.equal(text(previous).replace(oldLine,newLine),text(await read('source/src/Lawn/Challenge.cpp')));
 const normalBytes=await read(prefix+'logs/build-result.json'),normal=json(normalBytes);
 assert.equal(sha(normalBytes),history.oldNormalReceiptSha256);
 fields(normal,{status:'PASS',exitCode:0,sourceUnchangedDuringBuild:true,sourceFiles:872});
 const oldBuild=json(await read(prefix+'tests/double-agent-build.json'));
 fields(oldBuild,{execution:'complete-production-engine',optimization:'O2',productionObjectCount:144,
  productionBuildReceiptSha256:history.oldNormalReceiptSha256});
 assert.deepEqual(oldBuild.sourceSha256,Object.fromEntries(Object.entries(before).map(([path,pin])=>['source/'+path,pin])));
 for(const name of ['normal','cold','save-transition']){
  const raw=text(await read(prefix+name+'-actual.log'));
  const lines=raw.split('\n').filter(line=>line.startsWith('DOUBLE_AGENT_RESULT '));assert.equal(lines.length,1);
  const row=JSON.parse(lines[0].slice('DOUBLE_AGENT_RESULT '.length));
  fields(row,{name,speed:1,seed:1729,execution:'complete-production-engine',family:'double-agent',outcome:'win',
   profileCredits:1,nativeAwardState:142,nativeAwardType:8});
  assert.deepEqual(row.originalSnapshot,expectedSnapshot(name==='cold'));
  assert.deepEqual(row.restoredSnapshot,row.originalSnapshot);
  if(name==='save-transition'){
   fields(row.checkpoint,{performed:true,phase:'transition',state:140,zombies:5,graphPreserved:true});
   assert.equal(row.checkpoint.beforeGraph,row.checkpoint.afterGraph);
   const bodies=row.checkpoint.beforeGraph.split(';').filter(part=>part.startsWith('z,')).map(part=>part.split(','));
   assert.equal(bodies.length,5);assert(bodies.every(tokens=>tokens[2]==='2'&&tokens[9]==='0'),
    'The earlier rejected Python assertion retains the actual five headless cone bodies');
  }
 }
 return history;
}

export async function verifyDoubleAgent(options){
 const {report,read,sha,engine,fullRunReport,productionBuildBytes,currentArtBytes,previousArtBytes}=options;
 const projected=options[gustProjection]===gustProjection;
 if(engine.id==='0.2.6-web-gust.1')return verifyGustRetainedDouble(options);
 const actualReportBytes=await read('tests/double-agent-results.json');
 const authenticated=verifyDoubleAgentReportIdentity({reportBytes:actualReportBytes,sha});
 assert.deepEqual(report,authenticated.report,'The caller supplies the actual authenticated complete native report');
 const contractBytes=await read('tests/double-agent-verification-contract.json');
 assert(acceptedContractPins.has(sha(contractBytes)),'No complete actual Double Agent matrix has been accepted for this contract');
 const contract=json(contractBytes);
 fields(contract,{schemaVersion:1,stage:'final-preregistered',engineId:engine.id,mode:91,profileIndex:90,sourceCount:872,productionObjectCount:144,rulesVersion:1});
 assert.deepEqual(contract.matrix,matrix);
 fields(contract.planning,{sun:1500,allowedColumns:[0,1,2,3,4],seeds:[0,5,7,3,6,4,21],noSkySun:true,noMowers:true});
 fields(contract.planning,{nativeLastStandPreparationCooldownRule:true,normalCombatCooldowns:true});
 fields(contract.offense,{sun:1000,brains:5,deploymentColumns:[5,6,7,8],nativeIZombieCombat:true,noFreeIncome:true});
 assert.deepEqual(contract.nativeDefenseLedger,ledger);
 fields(contract.timing,{nativeObservationQuantum:2,minimumInputCadenceTicks:150,speedPairMaxDeltaTicks:30,
  noPostStartActorHealthTimeOrRNGEdits:true,ordinaryNativeMouseInputsOnly:true});
 assert.deepEqual(contract.savePhases,['planning','defense','transition','offense']);
 assert.equal(contract.syntheticCasesEarnCredits,false);
 fields(contract.presentation,{nativeCardHeadMinimum:50,nativeCardZombieMinimum:250,nativeCatalogCards:19,
  nativeFooterStates:4,initialBriefingBand:[300,410],historicalHintOverlapMustReject:true,
  nativeIZHeaderSamples:32,nativeIZHeaderPixels:1792000,nativeRow0HeadPixelsMinimum:513});
 assert.equal(contract.nativeGraphAdviceRecord,'a,style,duration,displayTime,slideOffTime,labelUTF8hex,nextStyle,nextLabelUTF8hex');
 const mandatory=['build-double-agent.py','double-agent-harness.cpp','double-agent-policy.h','double-agent-battles.h',
  'double-agent-controls.h','double-agent-presentation-controls.h','test-double-agent.py',
  'double-agent-assets.json','double-agent-native-art-inputs.json','double-agent-initial-plan.json','test-pool-panic.py'];
 for(const path of mandatory)assert(Object.hasOwn(contract.fixtureSha256,'tests/'+path),'Every executed input is preregistered: '+path);
 for(const [path,pin]of Object.entries(contract.fixtureSha256)){
  safeName(path);assert(path.startsWith('tests/'));digest(pin);assert.equal(sha(await read(path)),pin,path);
 }
 assert.equal(contract.priorAuthoredPlanSha256,sha(await read('tests/double-agent-initial-plan.json')));
 const history=await verifyDoubleAgentHistory({contract,read,sha,report});
 assert.deepEqual(Object.keys(contract.fixtureSha256).sort(),[
  ...mandatory.map(path=>'tests/'+path),'tests/double-agent-development-history.json',...Object.keys(history.filesSha256)
 ].sort(),'The final contract contains exactly the reviewed live inputs and preserved earlier evidence');
 if(!projected)await verifyDoubleAgentBuildBindings({report,read,sha,engine,fullRunReport,productionBuildBytes});
 await verifyDoubleAgentSourceBounds({read,sha,engine});
 fields(report,{status:'PASS',assetBundleId:engine.assetBundleId,nativeArtInputs:942});
 const assetsBytes=await read('tests/double-agent-assets.json'),assets=json(assetsBytes);
 assert.equal(report.assetFixtureSha256,sha(assetsBytes));assert.equal(assets.assetBundleId,engine.assetBundleId);
 fields(assets.files['main.pak'],{bytes:45453180,sha256:'5878326408285cb01f83b4fa4edcc66d65e727f6d6ee88563b5b3b287dd259fc'});
 const artBytes=await read('tests/double-agent-native-art-inputs.json'),nativeArt=json(artBytes);
 assert.equal(report.nativeArtFixtureSha256,sha(artBytes));
 assert.equal(sha(artBytes),'cecd07bb68c7592959cc9587d5a80ed7c8243934bd96b62cef82549ade7a5f46');
 fields(nativeArt,{assetBundleId:engine.assetBundleId,mainPakSha256:assets.files['main.pak'].sha256});
 assert.equal(Object.keys(nativeArt.sourceInputs).length,942);
 for(const [path,pin]of Object.entries(nativeArt.sourceInputs)){safeName(path);integer(pin.bytes,1);digest(pin.sha256);}
 assert.equal(report.scenarios.length,52);
 assert.deepEqual(report.scenarios.map(key).sort(),matrix.map(([name,speed,seed])=>key({name,speed,seed})).sort());
 for(const row of report.scenarios){verifyDoubleAgentScenario(row);if(!projected)await verifyDoubleAgentCaseLog(row,{read,sha});}
 assert.equal(report.checks,872+report.scenarios.reduce((sum,row)=>sum+row.checks,0));
 const battles=report.scenarios.filter(row=>row.family==='double-agent');
 assert.equal(battles.length,44);assert.equal(report.scenarios.filter(row=>row.family==='synthetic-controls').length,8);
 assert.equal(battles.reduce((sum,row)=>sum+row.profileCredits,0),40);
 assert.equal(battles.reduce((sum,row)=>sum+row.winTicks.length,0),40);
 assert.equal(battles.filter(row=>row.nativeGameOver).length+battles.filter(row=>row.failureAndRetry).length,16);
 assert.equal(battles.filter(row=>row.checkpoint.performed).length,16);
 assert.equal(report.scenarios.filter(row=>row.family==='synthetic-controls').reduce((sum,row)=>sum+row.countedEarnedWins,0),0);
 assert.equal(report.speedPairs.length,26);
 assert.deepEqual(report.speedPairs.map(pair=>pair.name+'/'+pair.seed).sort(),names.flatMap(name=>[1729,7331].map(seed=>name+'/'+seed)).sort());
 for(const pair of report.speedPairs){
  fields(pair,{semanticResultEqual:true});
  const rows=report.scenarios.filter(row=>row.name===pair.name&&row.seed===pair.seed).sort((a,b)=>a.speed-b.speed);
  assert.deepEqual(rows.map(row=>row.speed),[1,2]);
  const compare=['family','outcome','profileCredits'];
  if(rows[0].family==='double-agent')compare.push('planningInputs','planningSpent','armyInputs','armySpent',
   'authoredDefenseZombies','defenseLedger','replayDefenseLedger','originalSnapshot','restoredSnapshot',
   'restoredGardenCells','nativeAwardState','nativeAwardType','remainingBrains','failureAndRetry','retryLossPhase','retryWholePuzzleReset');
  for(const field of compare)assert.deepEqual(rows[0][field],rows[1][field],'Exact native1x/2x semantics: '+field);
  const one=rows[0].winTicks||[],two=rows[1].winTicks||[];assert.equal(one.length,two.length);
  const delta=one.map((tick,i)=>Math.abs(tick-two[i]));
  assert.deepEqual(pair.nativeTickDeltas,delta);delta.forEach(value=>integer(value,0,30));
 }
 assert.equal(sha(previousArtBytes),'723db18c923402cee80e0ea5299c04c4e61efebc42ade83e2ebfd0557722720c');
 const oldArt=json(previousArtBytes),art=json(currentArtBytes);
 assert.equal(oldArt.cards.length,18);assert.equal(art.cards.length,19);
 assert.deepEqual({...art,cards:art.cards.slice(0,18)},oldArt);
 fields(art.cards[18],{mode:91,name:'Double Agent',generatedArtworkUsed:false,background:'IMAGE_BACKGROUND1'});
 for(const field of ['tip','tips','descriptionBelowCard'])assert(!Object.hasOwn(art.cards[18],field));
 return {cases:report.scenarios.length};
}


// The current game and every raw observation are authenticated first. Only then
// are production metadata and the explicitly added twentieth catalog iteration
// projected back to the separately sealed Double rules for its unchanged oracle.
async function verifyGustRetainedDouble(options){
 const {report,read,sha,engine,fullRunReport,productionBuildBytes,currentArtBytes,previousArtBytes}=options;
 const bytes=await read('tests/double-agent-results.json');assert.deepEqual(report,json(bytes));
 const adapterBytes=await read('tests/gust1-double-retention.json');
 assert.equal(sha(adapterBytes),GUST_DOUBLE_RETENTION_SHA256);
 const adapter=json(adapterBytes);
 fields(adapter,{schemaVersion:1,parentEngineId:'0.2.6-web-double.1',
  parentArchiveSha256:'35b635770bbb040dd3b2c41c4c86ed49f351cbd29926b8efa286394ff89ad5b3',
  engineId:'0.2.6-web-gust.1',sourceCount:878,productionObjectCount:147,
  historicalContractSha256:'2897a2f15387c4f8b244d92dc587c2437ea370daa02f1e556e6d8ccab24d4ac4',
  originalReportSha256:'185ddbaae03ac20287552b9276064a800b1447d4a8d6cefdd58c9cc3a7e2d55c',
  originalRunnerSha256:'ae09ff50b44df063cf511c34c13c293f543a913ca1bc63845dcf5417da86df07',
  parentSnapshotManifestSha256:'afae585b66dfaef7effed2fcdf4e352bb3d273a2e77b4ad50a093a177e0aea67',
  all52CasesFresh:true});
 fields(adapter.catalogExtension,{parentCards:19,currentCards:20,checksAddedPerPresentation:21,
  presentationCases:4,aggregateNativeChecksAdded:84,allNineteenOriginalCardChecksPreserved:true});
 assert.equal(report.retentionAdapterSha256,sha(adapterBytes));
 const snapshotBytes=await read('tests/gust1-retained-parent/manifest.json');
 assert.equal(sha(snapshotBytes),adapter.parentSnapshotManifestSha256);
 const snapshot=json(snapshotBytes);
 fields(snapshot,{schemaVersion:1,parentEngineId:adapter.parentEngineId,parentArchiveSha256:adapter.parentArchiveSha256});
 assert.equal(Object.keys(snapshot.files).length,131);
 const originalRead=async name=>{
  safeName(name);assert(name.startsWith('tests/'));
  const relative=name.slice(6),pin=snapshot.files[relative];assert(pin,'Exact published Double input: '+name);
  const value=Buffer.from(await read('tests/gust1-retained-parent/'+relative));
  assert.equal(value.length,pin.bytes);assert.equal(sha(value),pin.sha256);return value;
 };
 const originalBytes=await originalRead('tests/double-agent-results.json');
 assert.equal(sha(originalBytes),adapter.originalReportSha256);
 const original=verifyDoubleAgentReportIdentity({reportBytes:originalBytes,sha}).report;
 const contractBytes=await read('tests/double-agent-verification-contract.json');
 assert.equal(sha(contractBytes),adapter.historicalContractSha256);
 const contract=json(contractBytes);
 const overrides=['tests/build-double-agent.py','tests/test-double-agent.py','tests/double-agent-presentation-controls.h'].sort();
 assert.deepEqual(Object.keys(adapter.fixtureOverrides).sort(),overrides);
 assert.deepEqual(Object.keys(adapter.originalFixtureSha256).sort(),overrides);
 for(const name of overrides){
  assert.equal(sha(await originalRead(name)),adapter.originalFixtureSha256[name]);
  assert.equal(adapter.originalFixtureSha256[name],contract.fixtureSha256[name]);
  assert.equal(sha(await read(name)),adapter.fixtureOverrides[name]);
 }
 assert.equal(adapter.builderOverrideSha256,adapter.fixtureOverrides['tests/build-double-agent.py']);
 // Production normalization cannot hide a missing or changed driver input.
 assert.deepEqual(Object.keys(report.testInputSha256).sort(),Object.keys(original.testInputSha256).sort());
 for(const [name,pin]of Object.entries(original.testInputSha256))
  assert.equal(report.testInputSha256[name],adapter.fixtureOverrides['tests/'+name]||pin,
   'Every exact historical input remains pinned, except the three bounded successor edits: '+name);
 // These are the actual current147 objects and878 sources, not the historical
 // maps substituted only for comparing the original reviewed observations.
 await verifyDoubleAgentBuildBindings({report,read,sha,engine,fullRunReport,productionBuildBytes});
 assert.equal(report.scenarios.length,52);
 const baseline=new Map(original.scenarios.map(row=>[key(row),row]));
 const normalized=structuredClone(report);
 let addedChecks=0;
 for(let index=0;index<report.scenarios.length;index++){
  const row=report.scenarios[index],before=baseline.get(key(row));assert(before);
  await verifyDoubleAgentCaseLog(row,{read,sha});
  const addition=row.name==='presentation'?21:0;
  assert.equal(row.checks,before.checks+addition);
  if(addition){assert.equal(row.nativeCatalogCards,20);normalized.scenarios[index].nativeCatalogCards=19;}
  normalized.scenarios[index].checks-=addition;addedChecks+=addition;
 }
 assert.equal(addedChecks,84);
 assert.equal(report.checks,878+report.scenarios.reduce((sum,row)=>sum+row.checks,0));
 assert.equal(report.checks,original.checks+90);
 normalized.checks-=90;
 const metadata=['engineId','productionObjectCount','productionBuildReceiptSha256','sourceSha256',
  'productionObjectSha256','builderSha256','runnerSha256','testArtifactSha256','testInputSha256'];
 for(const name of metadata){assert(Object.hasOwn(original,name)&&Object.hasOwn(report,name));normalized[name]=structuredClone(original[name]);}
 delete normalized.retentionAdapterSha256;
 const normalizedBytes=Buffer.from(JSON.stringify(normalized));
 verifyDoubleAgentReportIdentity({reportBytes:normalizedBytes,sha});
 const referenceBytes=fs.readFileSync(new URL('./fixtures/gust1-parent-reference.json',import.meta.url));
 const parent=await reconstructDoubleSources({referenceBytes,read,sha,engine});
 const historicalRead=async name=>{
  if(name==='tests/double-agent-results.json')return normalizedBytes;
  if(name.startsWith('source/')){const value=parent.files.get(name.slice(7));assert(value,name);return value;}
  if(name.startsWith('tests/')&&Object.hasOwn(snapshot.files,name.slice(6)))return originalRead(name);
  return read(name);
 };
 const oldArtBytes=fs.readFileSync(new URL('./fixtures/double1-native-bonus-art.json',import.meta.url));
 assert.equal(sha(oldArtBytes),'70fe4cb3279ab896f114046533cc50bfbc21667a5660f7c3a44eac5219180190');
 const currentArt=json(currentArtBytes),oldArt=json(oldArtBytes);
 assert.equal(currentArt.cards.length,20);assert.deepEqual({...currentArt,cards:currentArt.cards.slice(0,19)},oldArt);
 const result=await verifyDoubleAgent({...options,report:normalized,read:historicalRead,
  engine:historicalEngine(engine,'0.2.6-web-double.1'),currentArtBytes:oldArtBytes,previousArtBytes,
  [gustProjection]:gustProjection});
 return {...result,currentProductionObjects:147,retainedCases:52,additionalCatalogChecks:84};
}
