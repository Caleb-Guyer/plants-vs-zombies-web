// SPDX-License-Identifier: MIT
// Current45.2 browser availability; published45.1 observations remain separate.
import assert from 'node:assert/strict';
import {restoreNativeArtifactPack} from './native-artifact-pack.mjs';
import {CURRENT_ENGINE_ID,CURRENT_NORMAL_RECEIPT_SHA256} from './native-release-context.mjs';
import {verifyZombotanyFamilyFixes} from './zombotany-family-fixes-verification.mjs';
const ENGINE='0.2.6-web-zombotany45.2';
const ACCEPTED_CURRENT_PROOF_SHA256=null;
const json=b=>JSON.parse(Buffer.from(b).toString('utf8').replace(/^\uFEFF/,''));
const safe=name=>{assert(typeof name==='string'&&name&&!name.startsWith('/')&&!/[\\:\x00-\x1f]/.test(name));assert(name.split('/').every(p=>p&&p!=='.'&&p!=='..'));return name;};
const fields=(object,expected)=>{for(const [key,value]of Object.entries(expected))assert.deepEqual(object[key],value,key);};

// No current browser interaction, preregistration or proof has been accepted.
// The original strict45.1 verifier is preserved byte-exact in its own module.
// A future current browser run needs a separately reviewed current proof gate.
export async function verifyZombotany45BrowserEvidence(){
 assert(ACCEPTED_CURRENT_PROOF_SHA256,'No current45.2 browser observations or preregistration have been reviewed');
 assert.fail('Current45.2 browser evidence is not implemented or accepted');
}

// An explicit unattempted correction is separate from both a browser pass
// and the actual historical45.1 tool failure. Neither is relabelled as current.
export async function verifyZombotany45BrowserAvailability({availability,currentEngine,read,sha,Zip}){
 if(availability?.status==='functional-only')return verifyZombotany45BrowserEvidence({availability,currentEngine,read,sha,Zip});
 assert.equal(CURRENT_ENGINE_ID,ENGINE);assert.equal(currentEngine.id,ENGINE);
 assert(CURRENT_NORMAL_RECEIPT_SHA256,'The current normal build has not been independently reviewed');
 fields(availability,{schemaVersion:1,status:'not-run',proof:null,currentGameObserved:false,
  currentBrowserFunctionalPassed:false,screenshots:0,currentBrowserScreenshots:0,browserEarnedWins:0,
  browserAttemptedForCorrection:false,blockingEvidence:null,audioMutedThroughout:null,
  freshBrowserPerformanceMeasured:false,freshBrowserPerformancePassed:false,nativeTestsReplaceBrowserPerformance:false,
  currentReason:'Native renderer/compatibility regression performed; browser not attempted for this correction'});
 const release=json(await read('tests/fixtures/zombotany45-release.json'));
 fields(release,{id:ENGINE,sourceFiles:886,productionObjects:151,normalReceiptSha256:CURRENT_NORMAL_RECEIPT_SHA256});
 const engine={id:ENGINE,jsSha256:release.jsSha256,wasmSha256:release.wasmSha256};
 assert.deepEqual(availability.engine,engine);
 fields(currentEngine.artifacts,{jsSha256:release.jsSha256,wasmSha256:release.wasmSha256,sourceSha256:release.sourceSha256});
 const historical=availability.historicalRelease;
 fields(historical,{path:'tests/fixtures/historical/zombotany45-1-published/manifest.json',
  sha256:'ffd8a3da72e0c78c8135715c573a459d56b4fe008133e1bd0876d27722036bcf'});
 const historicalBytes=Buffer.from(await read(historical.path));
 assert.equal(historicalBytes.length,historical.bytes);assert.equal(sha(historicalBytes),historical.sha256);
 const manifest=json(historicalBytes);fields(manifest,{schemaVersion:1,engineId:'0.2.6-web-zombotany45.1',sourceFiles:886,productionObjects:151,
  normalReceiptSha256:'721a1d47b75566e042bf7bd69dc3e34dc8c7cd69fe7a00eb4455f662defaef3b'});
 for(const[path,pin]of Object.entries(manifest.files)){
  safe(path);const bytes=Buffer.from(await read(path));assert.equal(bytes.length,pin.bytes);assert.equal(sha(bytes),pin.sha256,path);
 }
 const prior=json(await read('tests/fixtures/historical/zombotany45-1-published/browser-availability.json'));
 fields(prior,{status:'not-run-tool-blocked',proof:null,currentBrowserFunctionalPassed:false,screenshots:0});
 assert.equal(prior.engine.id,'0.2.6-web-zombotany45.1');
 assert.equal(prior.blockingEvidence.sha256,'3fb43fa7028994d19ebf39bd9e1c84b24785be41474867f21810f0e97a45f491');
 const originalBlock=Buffer.from(await read(prior.blockingEvidence.path));
 assert.equal(sha(originalBlock),prior.blockingEvidence.sha256);assert.equal(originalBlock.length,prior.blockingEvidence.bytes);
 for(const suffix of ['js','wasm']){
  const bytes=Buffer.from(await read('dist/game/pvz-portable.'+suffix));assert.equal(sha(bytes),engine[suffix+'Sha256']);
  if(suffix==='wasm')assert(WebAssembly.validate(bytes));
 }
 assert(/^\.\.\/source\/[A-Za-z0-9._-]+\.zip$/.test(currentEngine.artifacts.source));
 const sourceBytes=Buffer.from(await read('dist/'+safe(currentEngine.artifacts.source.slice(3))));assert.equal(sha(sourceBytes),release.sourceSha256);
 const archive=await Zip.loadAsync(sourceBytes,{checkCRC32:true}),prefix='zombotany3-candidate/';
 await restoreNativeArtifactPack(archive,prefix);
 const nativeRead=async name=>{safe(name);const entry=archive.file(prefix+name);assert(entry,name);return Buffer.from(await entry.async('uint8array'));};
 const normalBytes=await nativeRead('logs/build-result.json');assert.equal(sha(normalBytes),release.normalReceiptSha256);
 const normal=json(normalBytes);fields(normal,{status:'PASS',exitCode:0,sourceUnchangedDuringBuild:true,sourceFiles:886});
 for(const suffix of ['js','wasm']){
  const bytes=Buffer.from(await read('dist/game/pvz-portable.'+suffix));assert.deepEqual(normal.outputs['build/pvz-portable.'+suffix],{bytes:bytes.length,sha256:sha(bytes)});
 }
 const before=json(await nativeRead('logs/source-before.json')),after=json(await nativeRead('logs/source-after.json'));
 assert.deepEqual(before,after);assert.equal(Object.keys(after).length,886);
 const sourceFiles=Object.values(archive.files).filter(file=>!file.dir&&file.name.startsWith(prefix+'source/'));assert.equal(sourceFiles.length,886);
 const sourcePins=new Map();
 for(const[name,digest]of Object.entries(after)){safe(name);const bytes=await nativeRead('source/'+name);assert.equal(sha(bytes),digest);sourcePins.set('source/'+name,digest);}
 const build=json(await nativeRead('tests/zombotany45-build.json'));
 fields(build,{execution:'complete-production-engine',optimization:'O2',productionObjectCount:151,productionBuildReceiptSha256:release.normalReceiptSha256,
  presentationControlsAvailable:true,developmentNoArt:false});
 assert.deepEqual(build.sourceSha256,Object.fromEntries(sourcePins));assert.equal(Object.keys(build.productionObjectSha256).length,151);
 const suites=['game-speed','qol-controls','decks-cooldowns','bonus-challenge','bonus-completion','night-shift','lantern-shroom',
  'garden-shuffle','seed-swap','mender-bloom','intensive-care','native-layout','care-fatigue','care-full-run','chain-reaction',
  'rally-zombie','rally-raid','lights-out','garlic-run','bungee-business','cob-cannon-command','pool-panic','pool-panic-endless',
  'scrap-yard','vase-ambush','torchbearer','double-agent','gust-bloom','zombotany3','zombotany45'];
 assert.equal(new Set(suites).size,30);
 for(const suite of suites){
  const report=json(await nativeRead('tests/'+suite+'-results.json'));
  assert.match(report.status,/^PASS/);fields(report,{failures:0,exitCode:0});assert(Number.isSafeInteger(report.checks)&&report.checks>0);
  assert.equal(report.generatedHarnessSha256,sha(await nativeRead('tests/'+suite+'-harness.cpp')));
  assert(Object.keys(report.sourceSha256).length>0);
  for(const[name,digest]of Object.entries(report.sourceSha256)){safe(name);assert.equal(sourcePins.get(name),digest,name);}
  if(report.execution==='complete-production-engine'){
   assert.equal(report.optimization,'O2');assert.equal(report.productionBuildReceiptSha256,release.normalReceiptSha256);
   assert.equal(report.productionObjectCount,151);assert.deepEqual(report.productionObjectSha256,build.productionObjectSha256);
  }
 }
 await verifyZombotanyFamilyFixes({read:nativeRead,sha,engine:currentEngine,build});
 return {status:'NOT RUN current Zombotany 4/5 browser functionality: browser not attempted for this correction',verdict:'NOT RUN',
  engine:ENGINE,currentBrowserFunctionalPassed:false,currentGameObserved:false,screenshots:0,currentBrowserScreenshots:0,
  browserEarnedWins:0,audioMutedThroughout:null,freshBrowserPerformanceMeasured:false,freshBrowserPerformancePassed:false,
  nativeSuiteReportsBound:30,additionalFamilyFixProofBound:1,sourceFiles:886,productionObjects:151,nativeRuntimePayloadsBound:2,
  browserAttemptedForCorrection:false,historicalBrowserAvailabilityBound:true,
  scope:'Current correction browser functionality was not attempted. Published45.1 tool-block metadata and earlier functional/timing evidence stay historical; current native/source binding is separate.'};
}
