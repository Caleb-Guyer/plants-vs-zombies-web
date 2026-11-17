// SPDX-License-Identifier: MIT
// Current functional smoke and exact historical availability have separate epochs.
import assert from 'node:assert/strict';
import {CURRENT_ENGINE_ID,CURRENT_NORMAL_RECEIPT_SHA256,historicalEngine} from './native-release-context.mjs';
const ENGINE='0.2.6-web-zsurvival.1',FOLDER='tests/fixtures/zsurvival1-browser/';
const ACCEPTED_PROOF_SHA256='262396221ea9c2d61eca268db5886ff70918838c836ce1f7ffcc2c2746fc6f18';
const ACCEPTED_BLOCK_SHA256=null;
const SKY_PREREGISTRATION_SHA256='84d9802d925a59402f052b0c3e5e1a8cf787d2508302ad0b1f4b4620d8fc229b';
const PREREGISTRATION_SHA256='a603ba1a4eec379f1a5b277168398f9e82e66e5b25c743b5861175c68fec93e7'; // Root reviewed before native game input.
const PROVIDER_AMENDMENT_SHA256='b834a42b938ad89acd69ca61c7583f6b6787593667156de66374888f3af6a529';
const SPEED_EXPECTATION_CORRECTION_SHA256='1349e4b7cb0970548e57893535aff5b45aae560e8e651bd134e06405b5fd1506'; // Root independently reconciled actual observations with frozen source.
const HISTORY_MANIFEST_SHA256='70725eccefcd1bf6dba28f2bea44f5bb89efd14a89adf9aea520a4d6e8d560a6';
const CAPTURES=['title','family','chooser','planted-2x','continue-dialog','continued'].sort();
const RUNTIME=['audio-controls.js','bundled-assets.js','game-assets/manifest.json','game/pvz-portable.js','game/pvz-portable.wasm',
 'index.html','index-port.html','launcher.js','loader.js','original-ui.js','port.css','runtime.js','save-recovery.js',
 'save-storage-core.js','save-storage-worker.js','save-storage.js','save-transfer.js','steam-compat.js','test-profiles.js','vendor/jszip.min.js'].sort();
const json=b=>JSON.parse(Buffer.from(b).toString('utf8').replace(/^\uFEFF/,''));
const fields=(a,b)=>{for(const[k,v]of Object.entries(b))assert.deepEqual(a[k],v,k);};
const safe=n=>{assert(typeof n==='string'&&n&&!n.startsWith('/')&&!/[\\:\x00-\x1f]/.test(n)&&n.split('/').every(p=>p&&p!=='.'&&p!=='..'));return n;};
const integer=(v,lo=0,hi=Number.MAX_SAFE_INTEGER)=>assert(Number.isSafeInteger(v)&&v>=lo&&v<=hi);

export async function verifyZsurvivalHistoricalAvailability({currentEngine,read,sha}){
 const folder='tests/fixtures/historical/zombotany45-2-published/',bytes=await read(folder+'manifest.json');
 assert.equal(sha(bytes),HISTORY_MANIFEST_SHA256);const manifest=json(bytes);
 fields(manifest,{schemaVersion:1,engineId:'0.2.6-web-zombotany45.2',commit:'fa37aee4a3b6793903cb5e1b4c592e565439560c',
  sourceArchiveSha256:'b7bd098307ffeb7a46379951942c3bc767f016e1c342210e2a43af412a03c7ff'});
 for(const[n,pin]of Object.entries(manifest.files)){const b=Buffer.from(await read(folder+safe(n)));assert.equal(b.length,pin.bytes);assert.equal(sha(b),pin.sha256);}
 const parent=historicalEngine(currentEngine,manifest.engineId),recorded=json(await read(folder+'engine-provenance.json'));
 assert.deepEqual(parent,recorded);const release=json(await read(folder+'release.json'));
 fields(release,{id:manifest.engineId,sourceFiles:886,productionObjects:151,sourceSha256:manifest.sourceArchiveSha256});
 for(const suffix of ['js','wasm'])assert.equal(parent.artifacts[suffix+'Sha256'],release[suffix+'Sha256']);
 const availability=json(await read(folder+'browser-availability.json'));
 fields(availability,{status:'not-run',proof:null,currentGameObserved:false,currentBrowserFunctionalPassed:false,
  screenshots:0,currentBrowserScreenshots:0,browserEarnedWins:0,browserAttemptedForCorrection:false,blockingEvidence:null,
  audioMutedThroughout:null,freshBrowserPerformanceMeasured:false,freshBrowserPerformancePassed:false});
 assert.deepEqual(availability.engine,{id:release.id,jsSha256:release.jsSha256,wasmSha256:release.wasmSha256});
 return {historicalEngine:release.id,verdict:'NOT RUN',currentBrowserFunctionalPassed:false,screenshots:0,historicalOnly:true};
}

async function currentBindings({availability,currentEngine,read,sha,Zip}){
 assert.equal(CURRENT_ENGINE_ID,ENGINE);assert.equal(currentEngine.id,ENGINE);assert(CURRENT_NORMAL_RECEIPT_SHA256);
 const release=json(await read('tests/fixtures/zsurvival1-release.json'));
 fields(release,{id:ENGINE,sourceFiles:888,productionObjects:152,normalReceiptSha256:CURRENT_NORMAL_RECEIPT_SHA256});
 assert.deepEqual(availability.engine,{id:ENGINE,jsSha256:release.jsSha256,wasmSha256:release.wasmSha256});
 fields(currentEngine.artifacts,{jsSha256:release.jsSha256,wasmSha256:release.wasmSha256,sourceSha256:release.sourceSha256});
 for(const suffix of ['js','wasm']){const b=Buffer.from(await read('dist/game/pvz-portable.'+suffix));assert.equal(sha(b),release[suffix+'Sha256']);if(suffix==='wasm')assert(WebAssembly.validate(b));}
 assert(/^\.\.\/source\/[A-Za-z0-9._-]+\.zip$/.test(currentEngine.artifacts.source));
 const source=await read('dist/'+safe(currentEngine.artifacts.source.slice(3)));assert.equal(sha(source),release.sourceSha256);
 const archive=await Zip.loadAsync(source,{checkCRC32:true}),normalFile=archive.file('zombotany3-candidate/logs/build-result.json');assert(normalFile);
 const normalBytes=Buffer.from(await normalFile.async('uint8array'));assert.equal(sha(normalBytes),CURRENT_NORMAL_RECEIPT_SHA256);
 fields(json(normalBytes),{status:'PASS',exitCode:0,sourceUnchangedDuringBuild:true,sourceFiles:888});
 return {release,archive};
}

export async function verifyZsurvival1BrowserEvidence(options){
 const{availability,currentEngine,read,sha,Zip}=options;
 assert(ACCEPTED_PROOF_SHA256,'Current Survival browser observations have not been independently reviewed');
 assert(PREREGISTRATION_SHA256,'Current Survival preregistration has not been reviewed');const {archive}=await currentBindings(options);
 assert(PROVIDER_AMENDMENT_SHA256,'Current official-provider amendment has not been reviewed');
 fields(availability,{schemaVersion:1,status:'functional-only',currentGameObserved:true,currentBrowserFunctionalPassed:true,
  screenshots:6,browserEarnedWins:0,audioMutedThroughout:true,freshBrowserPerformanceMeasured:false,
  freshBrowserPerformancePassed:false,nativeTestsReplaceBrowserPerformance:false});
 const pinned=async pin=>{safe(pin.path);assert(pin.path.startsWith(FOLDER));integer(pin.bytes,1);assert.match(pin.sha256,/^[a-f0-9]{64}$/);
  const b=Buffer.from(await read(pin.path));assert.equal(b.length,pin.bytes);assert.equal(sha(b),pin.sha256);return b;};
 assert.equal(availability.preregistration.path,FOLDER+'preregistration.json');assert.equal(availability.preregistration.sha256,PREREGISTRATION_SHA256);
 const prereg=json(await pinned(availability.preregistration));fields(prereg,{engineId:ENGINE,stage:'preregistered-before-current-native-game-input',sourceCount:888,productionObjectCount:152,automationProvider:'unified-computer-use',automationAPI:'cua_repl'});
 assert.deepEqual([...prereg.captureKeys].sort(),CAPTURES);
 assert.equal(availability.automationAmendment.path,FOLDER+'automation-amendment.json');assert.equal(availability.automationAmendment.sha256,PROVIDER_AMENDMENT_SHA256);
 const amendment=json(await pinned(availability.automationAmendment));fields(amendment,{schemaVersion:1,id:'zsurvival1-browser-provider-amendment',stage:'preregistered-before-current-native-game-input',engineId:ENGINE,reviewRequiredBeforeAcceptance:true});
 fields(amendment.providerChange,{before:'sky',after:'unified-computer-use',api:'cua_repl'});
 fields(amendment.originalPreregistration,{path:FOLDER+'preregistration-sky.json',bytes:1906,sha256:SKY_PREREGISTRATION_SHA256});
 const originalPrereg=json(await pinned(amendment.originalPreregistration));assert.deepEqual(prereg.captureKeys,originalPrereg.captureKeys);
 for(const key of ['requiredFlow','mute','testEnvironment','privateProfile','browserEarnedWins','freshPerformanceMeasured'])assert.deepEqual(prereg[key],originalPrereg[key]);
 fields(amendment.captureChange,{f11Required:false,actualBrowserCapture:true,croppingOrGeneratedModification:false});
 assert.equal(availability.proof.path,FOLDER+'proof.json');assert.equal(availability.proof.sha256,ACCEPTED_PROOF_SHA256);
 const proof=json(await pinned(availability.proof));
 fields(proof,{schemaVersion:1,engineId:ENGINE,automationProvider:'unified-computer-use',automationAPI:'cua_repl',officialComputerUse:true,osSettingsModified:false,
  existingUserProfilesModified:false,isolatedTestProfileUsed:true,testSaveCreated:true,
  nativeInputsOnly:true,gameStateInjection:false,browserEarnedWins:0,audioMutedThroughout:true,
  currentBrowserFunctionalPassed:true,freshBrowserPerformanceMeasured:false,freshBrowserPerformancePassed:false});
 assert.equal(proof.normalReceiptSha256,CURRENT_NORMAL_RECEIPT_SHA256);assert.equal(proof.preregistrationSha256,PREREGISTRATION_SHA256);
 assert.equal(proof.automationAmendmentSha256,PROVIDER_AMENDMENT_SHA256);
 assert(SPEED_EXPECTATION_CORRECTION_SHA256,'Actual remembered-speed expectation correction has not been reviewed');
 assert.equal(availability.expectationCorrection.path,FOLDER+'speed-expectation-correction.json');assert.equal(availability.expectationCorrection.sha256,SPEED_EXPECTATION_CORRECTION_SHA256);
 const correction=json(await pinned(availability.expectationCorrection));assert.equal(proof.expectationCorrectionSha256,SPEED_EXPECTATION_CORRECTION_SHA256);
 fields(correction,{schemaVersion:1,id:'zsurvival1-browser-speed-expectation-correction',stage:'recorded-after-actual-browser-observation',engineId:ENGINE,
  preservedPreregistrationSha256:PREREGISTRATION_SHA256,preservedProviderAmendmentSha256:PROVIDER_AMENDMENT_SHA256,
  expectedBefore:{nativeSpeedResetOnContinue:true,nativeDoubleSpeedRetoggledAfterContinue:true},
  actualObserved:{nativeSpeedResetOnContinue:false,nativeDoubleSpeedRetoggledAfterContinue:false,nativeRememberedSpeedRestored:true,continuedNativeDoubleSpeed:2}});
 fields(correction.unchanged,{productionSourceChanged:false,sealedNativeGatesChanged:false,oldPreregistrationEdited:false,actualScreenshotsEdited:false,additionalBrowserOrGameTestRun:false,semanticCaptureCount:6,browserEarnedWins:0,freshPerformanceMeasured:false});
 assert.deepEqual(Object.keys(correction.sourceEvidence).sort(),['source/src/LawnApp.cpp','source/src/Lawn/System/QoLSettings.h','source/src/Lawn/Board.cpp','dist/loader.js','dist/save-storage.js'].sort());
 for(const [path,pin]of Object.entries(correction.sourceEvidence)){safe(path);let bytes;if(path.startsWith('source/')){const f=archive.file('zombotany3-candidate/'+path);assert(f);bytes=Buffer.from(await f.async('uint8array'));}else bytes=Buffer.from(await read(path));assert.equal(bytes.length,pin.bytes);assert.equal(sha(bytes),pin.sha256);}
 const url=new URL(proof.url);assert.equal(url.origin,'http://127.0.0.1:4257');assert.equal(url.searchParams.get('testing'),'1');
 const transcript=await pinned(proof.actionTranscript);assert(transcript.length>100);assert.equal(proof.actionRecordKind,'operator-observations-of-official-cua-actions');
 const actions=json(transcript);fields(actions,{provider:'unified-computer-use',api:'cua_repl',audioMutedThroughout:true,browserEarnedWins:0,freshBrowserPerformanceMeasured:false});assert(actions.actions.length>=11);
 assert.deepEqual(Object.keys(proof.runtimeFiles).sort(),RUNTIME);
 for(const[n,pin]of Object.entries(proof.runtimeFiles)){const b=Buffer.from(await read('dist/'+safe(n)));assert.equal(b.length,pin.bytes);assert.equal(sha(b),pin.sha256);}
 const original=Buffer.from(await read('dist/testing/test-profiles.zip')),privateBytes=await pinned(proof.privateProfile.zip),profile=json(await pinned(proof.privateProfile.preparation));
 fields(profile,{publishedBundleModified:false,onlyChangedMember:'userdata/user900001.dat',overrideURLPath:'/testing/test-profiles.zip',
  detailSha256:'dca6daa3906aaf8a8d442f796ea86297242d25a97040d4756c3e38a9db29fc01'});
 assert.equal(sha(original),profile.originalBundleSha256);assert.equal(sha(privateBytes),profile.privateBundleSha256);
 const a=await Zip.loadAsync(original,{checkCRC32:true}),b=await Zip.loadAsync(privateBytes,{checkCRC32:true});
 const names=z=>Object.values(z.files).filter(f=>!f.dir).map(f=>f.name).sort();assert.deepEqual(names(a),names(b));assert.equal(names(a).length,7);
 for(const n of names(a)){const before=Buffer.from(await a.file(n).async('uint8array')),after=Buffer.from(await b.file(n).async('uint8array'));
  if(n===profile.onlyChangedMember){assert.equal(after.length,886);assert.equal(sha(after),profile.detailSha256);}else assert.deepEqual(after,before);}
 assert.deepEqual(Object.keys(proof.captures).sort(),CAPTURES);
 assert.deepEqual(Object.keys(actions.captures).sort(),CAPTURES);
 for(const[key,pin]of Object.entries(proof.captures)){
  for(const field of ['path','bytes','sha256','audioMuted','actualBrowserCapture'])assert.deepEqual(pin[field],actions.captures[key][field]);
  fields(pin,{audioMuted:true,actualBrowserCapture:true});const image=await pinned(pin);assert(image.length>5000,key);
  assert(image.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||image[0]===255&&image[1]===216,'Actual native screenshots must be PNG or JPEG');
  integer(pin.width,800);integer(pin.height,600);
 }
 const o=proof.observations;fields(o,{fileFreeBoot:true,nativeQAProfileSelected:true,nativeFamilyCardCount:6,nativeSurvivalCardSelected:true,
  nativeSeedChooser:true,nativeFiniteSunPurchases:true,nativeDoubleSpeed:2,nativeMenuLeave:true,browserReload:true,
  nativeSameCardContinue:true,nativeSpeedResetOnContinue:false,nativeDoubleSpeedRetoggledAfterContinue:false,nativeRememberedSpeedRestored:true,
  continuedNativeDoubleSpeed:2,survivalBrowserWins:0,noPerformanceClaim:true});
 fields(o,{nativeVisibleFamilyCards:4,nativeHiddenLockedFamilySlots:2,nativeFamilyTrophyText:'1/6',extraNativeWallnutPlacedAndShovelled:true});
 assert.equal(o.nativeSeedTypes.length,6);assert.equal(new Set(o.nativeSeedTypes).size,6);assert(o.nativeSeedTypes.includes(1)&&o.nativeSeedTypes.includes(32));
 assert.equal(o.nativePlantings.length,2);assert.deepEqual(o.nativePlantings.map(p=>p.seed).sort((a,b)=>a-b),[1,32]);
 for(const p of o.nativePlantings){integer(p.col,0,8);integer(p.row,0,4);assert.equal(p.cost,p.seed===1?50:100);integer(p.sunBefore,p.cost);assert.equal(p.sunAfter,p.sunBefore-p.cost);}
 const cells=o.nativePlantings.map(({seed,col,row})=>({seed,col,row}));assert.deepEqual(o.continuedPlantCells,cells);
 integer(o.sunBeforeLeave);assert.equal(o.sunAfterContinue,o.sunBeforeLeave);
 return {status:'PASS current muted Survival UI smoke',verdict:'PASS',currentBrowserFunctionalPassed:true,screenshots:6,browserEarnedWins:0,
  freshBrowserPerformanceMeasured:false,freshBrowserPerformancePassed:false,historicalTimingsRelabelled:false};
}

export async function verifyZsurvival1BrowserAvailability(options){
 if(options.availability?.status==='functional-only')return verifyZsurvival1BrowserEvidence(options);
 assert(ACCEPTED_BLOCK_SHA256,'No current Survival browser attempt or actual tool block has been reviewed');
 await currentBindings(options);const{availability,read,sha}=options;
 fields(availability,{schemaVersion:1,status:'not-run-tool-blocked',proof:null,currentGameObserved:false,currentBrowserFunctionalPassed:false,
  screenshots:0,browserEarnedWins:0,audioMutedThroughout:null,freshBrowserPerformanceMeasured:false,freshBrowserPerformancePassed:false,nativeTestsReplaceBrowserPerformance:false});
 assert.equal(availability.blockingEvidence.path,FOLDER+'blocked-control.json');assert.equal(availability.blockingEvidence.sha256,ACCEPTED_BLOCK_SHA256);
 const b=Buffer.from(await read(availability.blockingEvidence.path));assert.equal(b.length,availability.blockingEvidence.bytes);assert.equal(sha(b),ACCEPTED_BLOCK_SHA256);
 const block=json(b);fields(block,{engineId:ENGINE,automationProvider:'unified-computer-use',automationAPI:'cua_repl',currentGameObserved:false,currentBrowserScreenshots:0,currentBrowserFunctionalPassed:false});
 assert(JSON.stringify(block).includes('could not determine the current browser URL on Windows with enough confidence to enforce policy'));
 return {status:'NOT RUN current Survival browser functionality: actual official URL-policy tool block',verdict:'NOT RUN',
  currentBrowserFunctionalPassed:false,screenshots:0,browserEarnedWins:0,freshBrowserPerformanceMeasured:false,freshBrowserPerformancePassed:false};
}
