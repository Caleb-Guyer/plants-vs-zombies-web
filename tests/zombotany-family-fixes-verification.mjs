// SPDX-License-Identifier: MIT
// Separate zero-credit native renderer/compatibility acceptance on the same45 CLI.
import assert from 'node:assert/strict';
import {CURRENT_ENGINE_ID,CURRENT_NORMAL_RECEIPT_SHA256} from './native-release-context.mjs';
const acceptedContractPins=new Set(['6c6e9d01a0c5376bfbfc1c3cf4ad9d7a824544a2f20f4f9608e9dff787d5e4ad']); // Root reviewed the actual closed current execution.
const acceptedReportPins=new Set(['edcad243c6f410b629bfc4340a92c529cede0f2cef37eecca9e6c8a68f585a7c']); // Root reviewed the actual closed current execution.
const acceptedContentPins=new Set(['11d4b93cb7e4199149ca789ec663e83a2f4f8219266d7385201944f8f70a4f3a']); // Root reviewed the actual closed current execution.
const ENGINE='0.2.6-web-zvase.1';
const MODES=[16,32,93,94,95];
const KINDS=['headless-last','mixed','unsupported-last'];
export const FAMILY_FIX_INPUTS=[
 'zombotany-family-fixes-controls.h','zombotany-family-fixes-legacy.h','zombotany-family-fixes-run.h',
 'zombotany-family-legacy45-expected.h','zombotany-family-fixes-contract.json','zombotany-family-legacy45-fixtures.json',
 ...KINDS.flatMap(kind=>MODES.flatMap(mode=>['fixture.json',`userdata/game1_${mode}.v4`,'userdata/user1.dat','userdata/users.dat']
  .map(name=>`zombotany-family-legacy45/${kind}-${mode}/${name}`))),
 ...['build-old-save-fixtures-v2.py','build-old-save-fixtures-v3.py','native-16.log','native-32.log','native-93.log','native-94.log','native-95.log',
  'old-save-fixtures-v2.cpp','old-save-fixtures-v3.cpp','old-save-v2-build-result.json','old-save-v3-build-result.json','published151-objects-manifest.json']
  .map(name=>'zombotany-family-legacy45-provenance/'+name)
];
const PREFIX='ZOMBOTANY_FAMILY_FIXES_RESULT ';
const json=b=>JSON.parse(Buffer.from(b).toString('utf8').replace(/^\uFEFF/,''));
const text=b=>Buffer.from(b).toString('utf8').replace(/\r\n?/g,'\n');
const fields=(a,b)=>{for(const[k,v]of Object.entries(b))assert.deepEqual(a[k],v,k);};
const integer=(v,lo=0,hi=Number.MAX_SAFE_INTEGER)=>assert(Number.isSafeInteger(v)&&v>=lo&&v<=hi);
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?
 Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const range=(lo,hi)=>Array.from({length:hi-lo+1},(_,i)=>lo+i);
const phases=['preview-idle','preview-idle2','land-anim_walk','land-anim_walk2','land-anim_eat','water-swim',
 'native-pool-entry','native-pool-exit','hypno-land','hypno-swim'];
const samples=[650,650,650,650,650,650,180,180,650,650];
const bodyRanges=[[0,28],[29,43],[44,90],[91,137],[138,177],[250,291]];

export function verifyZombotanyFamilyFixesNative(row){
 fields(row,{execution:'complete-production-engine',family:'zombotany-family-fixes',engineId:ENGINE,name:'family-fixes',mode:94,seed:1729,speed:1,
  seaCycleSamples:4260,hypnoCycleSamples:1300,cacheDraws:40,muzzleQueries:40,cachedMuzzleLiveIdempotent:true,
  legacyFixtures:15,legacyConvertedActors:12,legacyPreservedHeadActors:5,legacyRemovedActors:10,legacyStoppedActorsObserved:10,
  legacyDeferredAwards:10,syntheticAwardCollectionsRestored:10,legacyCountersStatusesAndBodyClocksPreserved:true,
  legacyFirstDrawAttached:true,legacySaveLoadIdempotent:true,legacyNoAwardDuringLoad:true,familyModes:MODES,
  directCreationRequests:210,automaticCreationRequests:207,automaticNativeIneligibleSkipped:3,graveModesSuppressed:5,
  allLiveActorsPlantHeads:true,all100ProfileRecordsRestored:true,syntheticActorSetup:true,profileCredits:0,countedEarnedWins:0,
  silentHardware:true,audioDeviceOpened:false});
 integer(row.checks,5560);assert.equal(row.seaPhases.length,10);
 for(const[i,phase]of row.seaPhases.entries()){
  fields(phase,{phase:phases[i],samples:samples[i],violations:0});
  integer(phase.maxGap,0,4);integer(phase.minimumJointColumns,2,360);integer(phase.maximumPenetration,-320,0);
  if(i<6||i>=8){
   const[lo,hi]=bodyRanges[i<6?i:i===8?3:5];
   assert.deepEqual(phase.bodyKeys,range(lo,hi));assert.deepEqual(phase.idleKeys,range(4,28));assert.deepEqual(phase.shootKeys,range(29,42));
  }
  if(i===6)assert(phase.heights.includes(1),'Actual native pool entry is required');
  if(i===7)assert(phase.heights.includes(2),'Actual native pool exit is required');
 }
 assert.equal(row.seaPhases.slice(0,8).reduce((n,p)=>n+p.samples,0),4260);
 assert.equal(row.seaPhases.slice(8).reduce((n,p)=>n+p.samples,0),1300);
 return {seaSamples:4260,hypnoSamples:1300,legacyFixtures:15,syntheticNativeAwardCollections:10,countedEarnedWins:0};
}

export function verifyZombotanyFamilyFixesContract(c){
 fields(c,{schemaVersion:1,engineId:ENGINE,execution:'complete-production-engine',case:[94,'family-fixes',1,1729],
  normalBuildReceiptSha256:CURRENT_NORMAL_RECEIPT_SHA256,sourceCount:891,productionObjectCount:153,countedEarnedWins:0,profileCredits:0,hardwareAudio:false});
 fields(c.sea,{mainCycleSamples:4260,hypnoSamples:1300,maximumBaseToNamedNeckGapPixels:4,minimumJointColumns:2,
  maximumBasePenetrationBelowNeckBottom:0,phaseNames:phases,samples,firstSixBodyKeyCounts:[29,15,47,47,40,42],
  idleKeyCount:25,shootKeyCount:14,cacheDraws:40,muzzleQueries:40});
 fields(c.legacy,{oldEngineId:'0.2.6-web-zombotany45.1',oldNormalReceiptSha256:'721a1d47b75566e042bf7bd69dc3e34dc8c7cd69fe7a00eb4455f662defaef3b',
  fixtureCount:15,convertedActors:12,preservedHeadActors:5,removedActors:10,stoppedActorsFirstUpdate:10,deferredAwards:10,
  syntheticAwardCollectionsRestored:10,modes:MODES,nativeFinalWaveByMode:[20,30,20,20,20],
  noAwardDuringLoad:true,all100RecordsRestored:true,phaseCounter150OnlyConvertedNativePea:true});
 fields(c.roster,{modes:MODES,directCreationRequests:210,eligibleAutomaticRequests:207,poolOnlySeaIneligibleAutomaticSkips:3,
  graveModesSuppressed:5,nativeWavePrefixStopsAtInvalid:true});
}

export async function verifyZombotanyFamilyFixesBindings({report,read,sha,engine,build}){
 assert.equal(CURRENT_ENGINE_ID,ENGINE);assert.equal(engine.id,ENGINE);assert(CURRENT_NORMAL_RECEIPT_SHA256);
 fields(report,{status:'PASS',exitCode:0,failures:0,engineId:ENGINE,execution:'complete-production-engine',optimization:'O2',
  productionObjectCount:153,productionBuildReceiptSha256:CURRENT_NORMAL_RECEIPT_SHA256,resourceCapacityWarnings:0});
 for(const key of ['sourceSha256','productionObjectSha256','testInputSha256','testArtifactSha256','builderSha256','generatedHarnessSha256'])
  assert.deepEqual(report[key],build[key],key);
 assert.equal(Object.keys(report.sourceSha256).length,891);assert.equal(Object.keys(report.productionObjectSha256).length,153);
 for(const[name,pin]of Object.entries(report.sourceSha256))assert.equal(sha(await read(name)),pin,name);
 assert.equal(report.runnerSha256,sha(await read('tests/test-zombotany45.py')));
 const contractBytes=await read('tests/zombotany-family-fixes-contract.json'),contract=json(contractBytes);
 assert.equal(sha(contractBytes),report.familyFixContractSha256);verifyZombotanyFamilyFixesContract(contract);
 for(const[name,pin]of Object.entries(contract.fixtureSha256)){
  assert(FAMILY_FIX_INPUTS.includes(name),'Unreviewed family fixture path: '+name);
  assert.equal(sha(await read('tests/'+name)),pin,name);assert.equal(build.testInputSha256[name],pin,name);
 }
 assert.deepEqual(Object.keys(contract.fixtureSha256).sort(),FAMILY_FIX_INPUTS.filter(n=>n!=='zombotany-family-fixes-contract.json').sort());
 const fixture=json(await read('tests/zombotany-family-legacy45-fixtures.json'));
 fields(fixture,{schemaVersion:1,engineId:'0.2.6-web-zombotany45.1',normalBuildReceiptSha256:'721a1d47b75566e042bf7bd69dc3e34dc8c7cd69fe7a00eb4455f662defaef3b',count:15,countedEarnedWins:0});
 assert.deepEqual(fixture.rows.map(r=>r.name).sort(),KINDS.flatMap(kind=>MODES.map(mode=>kind+'-'+mode)).sort());
 const logBytes=await read('tests/zombotany-family-fixes.log');assert.equal(sha(logBytes),report.logSha256);
 const raw=text(logBytes),rows=raw.split('\n').filter(line=>line.startsWith(PREFIX));assert.equal(rows.length,1);
 assert.deepEqual(JSON.parse(rows[0].slice(PREFIX.length)),report.native);
 assert(!/Too many (?:particle|emitters)|memory access out of bounds|RuntimeError/.test(raw));
 const facts=verifyZombotanyFamilyFixesNative(report.native);assert.equal(report.checks,report.native.checks);
 return facts;
}

export async function verifyZombotanyFamilyFixes(options){
 const bytes=await options.read('tests/zombotany-family-fixes-results.json'),report=json(bytes);
 const contractBytes=await options.read('tests/zombotany-family-fixes-contract.json');
 assert(acceptedContractPins.has(options.sha(contractBytes)),'Current family correction contract is not independently reviewed');
 const{logSha256,...nativeIdentity}=report;
 assert(acceptedContentPins.has(options.sha(Buffer.from(JSON.stringify(canonical(nativeIdentity))))),'Current family correction native observations are not independently reviewed');
 const facts=await verifyZombotanyFamilyFixesBindings({...options,report});
 return {...facts,sealedReport:acceptedReportPins.has(options.sha(bytes)),additionalProof:true,ordinaryCasesAdded:0};
}
