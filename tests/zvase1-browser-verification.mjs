// SPDX-License-Identifier: MIT
// Historical Survival captures authenticate only their recorded epoch. The
// current Vasebreaker release makes no unperformed browser or timing claim.
import assert from 'node:assert/strict';
import {CURRENT_ENGINE_ID,CURRENT_SOURCE_COUNT,CURRENT_OBJECT_COUNT,CURRENT_NORMAL_RECEIPT_SHA256,
 ZVASE_PARENT_ENGINE_ID,ZVASE_PARENT_ARCHIVE_SHA256,ZVASE_PARENT_NORMAL_SHA256,historicalEngine}
 from './native-release-context.mjs';
const HISTORY='tests/fixtures/historical/zsurvival1-published/';
const HISTORY_MANIFEST_SHA256='1f5376b1105038ccf3a27c824b3622f3ba38246bce7cc55fa968df8c4f5a9f92'; // Root checked every recorded metadata/evidence byte.
const BROWSER_PROOF_SHA256='262396221ea9c2d61eca268db5886ff70918838c836ce1f7ffcc2c2746fc6f18';
const CAPTURES=['title','family','chooser','planted-2x','continue-dialog','continued'].sort();
const json=b=>JSON.parse(Buffer.from(b).toString('utf8').replace(/^\uFEFF/,''));
const fields=(a,b)=>{for(const[k,v]of Object.entries(b))assert.deepEqual(a[k],v,k);};
const safe=n=>{assert(typeof n==='string'&&n&&!n.startsWith('/')&&!/[\\:\x00-\x1f]/.test(n)&&n.split('/').every(p=>p&&p!=='.'&&p!=='..'));return n;};

export async function verifyZVaseHistoricalBrowserEvidence({currentEngine,read,sha}){
 assert(HISTORY_MANIFEST_SHA256,'The actual published Survival browser snapshot is not independently reviewed');
 const bytes=Buffer.from(await read(HISTORY+'manifest.json'));assert.equal(sha(bytes),HISTORY_MANIFEST_SHA256);
 const manifest=json(bytes);
 fields(manifest,{schemaVersion:1,engineId:ZVASE_PARENT_ENGINE_ID,commit:'385d8d51fe7de7fe07be297751a82e9ae7b8faee',
  sourceArchiveSha256:ZVASE_PARENT_ARCHIVE_SHA256,normalReceiptSha256:ZVASE_PARENT_NORMAL_SHA256,historicalOnly:true,currentExecutableChecks:0});
 assert.deepEqual(Object.keys(manifest.files).sort(),['release.json','engine-provenance.json','browser-availability.json','normal-build.json','runtime-files.json'].sort());
 for(const[n,pin]of Object.entries(manifest.files)){const b=Buffer.from(await read(HISTORY+safe(n)));assert.equal(b.length,pin.bytes);assert.equal(sha(b),pin.sha256);}
 for(const[n,pin]of Object.entries(manifest.externalEvidenceFiles)){safe(n);assert(n.startsWith('tests/fixtures/zsurvival1-browser/'));
  const b=Buffer.from(await read(n));assert.equal(b.length,pin.bytes);assert.equal(sha(b),pin.sha256);}
 const engine=json(await read(HISTORY+'engine-provenance.json')),release=json(await read(HISTORY+'release.json'));
 assert.deepEqual(historicalEngine(currentEngine,ZVASE_PARENT_ENGINE_ID),engine);
 fields(release,{id:ZVASE_PARENT_ENGINE_ID,sourceFiles:888,productionObjects:152,normalReceiptSha256:ZVASE_PARENT_NORMAL_SHA256,sourceSha256:ZVASE_PARENT_ARCHIVE_SHA256});
 fields(engine.artifacts,{sourceSha256:release.sourceSha256,jsSha256:release.jsSha256,wasmSha256:release.wasmSha256});
 const availability=json(await read(HISTORY+'browser-availability.json'));
 fields(availability,{status:'functional-only',currentGameObserved:true,currentBrowserFunctionalPassed:true,screenshots:6,browserEarnedWins:0,
  audioMutedThroughout:true,freshBrowserPerformanceMeasured:false,freshBrowserPerformancePassed:false});
 assert.equal(availability.proof.sha256,BROWSER_PROOF_SHA256);
 const proofBytes=Buffer.from(await read('tests/fixtures/zsurvival1-browser/proof.json'));assert.equal(sha(proofBytes),BROWSER_PROOF_SHA256);
 const proof=json(proofBytes);
 fields(proof,{engineId:ZVASE_PARENT_ENGINE_ID,normalReceiptSha256:ZVASE_PARENT_NORMAL_SHA256,automationProvider:'unified-computer-use',
  automationAPI:'cua_repl',browserEarnedWins:0,audioMutedThroughout:true,currentBrowserFunctionalPassed:true,
  freshBrowserPerformanceMeasured:false,freshBrowserPerformancePassed:false});
 assert.deepEqual(proof.runtimeFiles,json(await read(HISTORY+'runtime-files.json')));
 assert.deepEqual(Object.keys(proof.captures).sort(),CAPTURES);
 for(const pin of Object.values(proof.captures)){assert.equal(pin.width,1280);assert.equal(pin.height,720);assert.equal(pin.audioMuted,true);
  const b=Buffer.from(await read(safe(pin.path)));assert.equal(b.length,pin.bytes);assert.equal(sha(b),pin.sha256);}
 return {verdict:'PASS historical only',historicalOnly:true,historicalEngine:ZVASE_PARENT_ENGINE_ID,historicalScreenshots:6,
  currentBrowserFunctionalPassed:false,currentExecutableChecks:0,currentScreenshots:0,freshBrowserPerformanceMeasured:false};
}

export async function verifyZVase1BrowserAvailability({availability,currentEngine,read,sha,Zip}){
 assert.equal(CURRENT_ENGINE_ID,'0.2.6-web-zvase.1');assert.equal(currentEngine.id,CURRENT_ENGINE_ID);
 assert.equal(CURRENT_SOURCE_COUNT,891);assert.equal(CURRENT_OBJECT_COUNT,153);assert(CURRENT_NORMAL_RECEIPT_SHA256);
 fields(availability,{schemaVersion:1,status:'not-run',proof:null,currentGameObserved:false,currentBrowserFunctionalPassed:false,
  screenshots:0,currentBrowserScreenshots:0,browserEarnedWins:0,browserAttempted:false,blockingEvidence:null,audioMutedThroughout:null,
  freshBrowserPerformanceMeasured:false,freshBrowserPerformancePassed:false,nativeTestsReplaceBrowserPerformance:false});
 assert.equal(availability.currentReason,'Browser not attempted for this feature; official Computer Use is unavailable in this session.');
 const release=json(await read('tests/fixtures/zvase1-release.json'));
 fields(release,{id:CURRENT_ENGINE_ID,sourceFiles:891,productionObjects:153,normalReceiptSha256:CURRENT_NORMAL_RECEIPT_SHA256});
 assert.deepEqual(availability.engine,{id:CURRENT_ENGINE_ID,jsSha256:release.jsSha256,wasmSha256:release.wasmSha256});
 fields(currentEngine.artifacts,{sourceSha256:release.sourceSha256,jsSha256:release.jsSha256,wasmSha256:release.wasmSha256});
 for(const ext of ['js','wasm']){const b=Buffer.from(await read('dist/game/pvz-portable.'+ext));assert.equal(sha(b),release[ext+'Sha256']);if(ext==='wasm')assert(WebAssembly.validate(b));}
 assert(/^\.\.\/source\/[A-Za-z0-9._-]+\.zip$/.test(currentEngine.artifacts.source));
 const source=Buffer.from(await read('dist/'+safe(currentEngine.artifacts.source.slice(3))));assert.equal(sha(source),release.sourceSha256);
 const zip=await Zip.loadAsync(source,{checkCRC32:true}),normalFile=zip.file('zombotany3-candidate/logs/build-result.json');assert(normalFile);
 const normal=Buffer.from(await normalFile.async('uint8array'));assert.equal(sha(normal),CURRENT_NORMAL_RECEIPT_SHA256);
 fields(json(normal),{status:'PASS',exitCode:0,sourceUnchangedDuringBuild:true,sourceFiles:891});
 return {verdict:'NOT RUN',status:'Current Vasebreaker browser functionality not run',currentBrowserFunctionalPassed:false,
  screenshots:0,browserEarnedWins:0,freshBrowserPerformanceMeasured:false,freshBrowserPerformancePassed:false};
}
