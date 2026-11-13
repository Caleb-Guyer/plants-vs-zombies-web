// SPDX-License-Identifier: MIT
// Scoped actual-browser evidence. This function never produces timing samples.
import assert from 'node:assert/strict';

const ENGINE='0.2.6-web-double.1';
const JS='3c8fc69ad6a388826cb3a3be3cf3ec07910b7ad4c5a6dcce42a27bd91df278cf';
const WASM='0e9ad8846b33ec2a1823f7637674aa26956619318f2a44c42b8b3f9b28af66e6';
const NORMAL='8ff0dbe3d087ce07f4e861afe5e999d55490684f306d6dcd609a1323aeb1fd62';
const BASELINE='43312dcdce1130b7ea1cb0d0cb1e11c19ad5ef6a7e4d22724257d959ca64770f';
const UNAVAILABLE='e31796eaffff47d04f617e343ae2aa38dd51e0cd32f4f8fe5344925345aabccb';
// Actual completed observations and all five screenshots were reviewed.
const ACCEPTED_BROWSER_PROOF_SHA256='f7e30bf846a7c29a01eebde10ad4d9af3ae383abf495515a404f23444bb54a64';
const FOLDER='tests/fixtures/double-agent-browser/';
const RUNTIME=['audio-controls.js','bundled-assets.js','game-assets/manifest.json',
 'game/pvz-portable.js','game/pvz-portable.wasm','index.html','index-port.html',
 'launcher.js','loader.js','original-ui.js','port.css','runtime.js','save-recovery.js',
 'save-storage-core.js','save-storage-worker.js','save-storage.js','save-transfer.js',
 'steam-compat.js','test-profiles.js','vendor/jszip.min.js'].sort();
const SCREENSHOTS=['catalog','planning','continue-planning','offense','continue-offense'].sort();
const safe=name=>{
 assert(typeof name==='string'&&name&&!name.startsWith('/')&&!/[\x00-\x1f\\:]/.test(name));
 assert(name.split('/').every(part=>part&&part!=='.'&&part!=='..'));return name;
};
const json=bytes=>JSON.parse(Buffer.from(bytes).toString('utf8').replace(/^\uFEFF/,''));
const fields=(actual,expected)=>{for(const [name,value]of Object.entries(expected))assert.deepEqual(actual[name],value,name);};
const dimensions=value=>assert(Number.isFinite(value)&&value>0&&value<=16384);
function jpegSize(data){
 assert(data.length>=4&&data[0]===0xff&&data[1]===0xd8&&data.at(-2)===0xff&&data.at(-1)===0xd9,
  'An actual complete JPEG capture is required');
 const frames=new Set([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf]);
 let offset=2;
 while(offset<data.length-2){
  assert.equal(data[offset++],0xff);
  while(data[offset]===0xff)offset++;
  const marker=data[offset++];assert(marker!==0&&marker!==0xd8&&marker!==0xd9&&marker!==0xda,
   'The JPEG frame must precede its scan');
  if(marker===1||(marker>=0xd0&&marker<=0xd7))continue;
  assert(offset+2<=data.length);const length=data.readUInt16BE(offset);
  assert(length>=2&&offset+length<=data.length);
  if(frames.has(marker)){
   assert(length>=8);return [data.readUInt16BE(offset+5),data.readUInt16BE(offset+3)];
  }
  offset+=length;
 }
 assert.fail('Missing JPEG frame dimensions');
}

export async function verifyDoubleBrowserEvidence({availability,currentEngine,read,sha,Zip}){
 assert(ACCEPTED_BROWSER_PROOF_SHA256,'Actual Double Agent browser observations have not been reviewed');
 fields(availability,{schemaVersion:1,status:'functional-only',freshBrowserPerformancePassed:false,
  nativeTestsReplaceBrowserPerformance:false,browserControlRecovered:true});
 const expectedEngine={id:ENGINE,jsSha256:JS,wasmSha256:WASM};
 assert.deepEqual(availability.engine,expectedEngine);
 assert.equal(currentEngine.id,ENGINE);assert.equal(currentEngine.artifacts.jsSha256,JS);
 assert.equal(currentEngine.artifacts.wasmSha256,WASM);
 const pin=record=>{
  safe(record.path);assert(Number.isSafeInteger(record.bytes)&&record.bytes>0);
  assert.match(record.sha256,/^[a-f0-9]{64}$/);
  const data=Buffer.from(read(record.path));assert.equal(data.length,record.bytes,record.path);
  assert.equal(sha(data),record.sha256,record.path);return data;
 };
 assert.equal(availability.historicalUnavailability.path,'tests/fixtures/performance/historical/double1-initial-unavailability.json');
 assert.equal(availability.historicalUnavailability.bytes,1331);
 assert.equal(availability.historicalUnavailability.sha256,UNAVAILABLE);
 const historical=json(pin(availability.historicalUnavailability));
 assert.deepEqual(historical.engine,expectedEngine);
 fields(historical,{schemaVersion:1,status:'unavailable',freshBrowserPerformancePassed:false,nativeTestsReplaceBrowserPerformance:false,
  historicalBaselineSha256:BASELINE});
 assert.deepEqual(historical.attempts.map(row=>row.tool),['cua_repl','cua_repl_after_reset','node_repl']);
 for(const row of historical.attempts)assert.equal(row.error,
  'failed to write kernel assets: The system cannot find the path specified. (os error 3)');
 assert.equal(availability.proof.path,FOLDER+'proof.json');
 assert.equal(availability.proof.sha256,ACCEPTED_BROWSER_PROOF_SHA256);
 const proof=json(pin(availability.proof));
 assert.deepEqual(proof.engine,expectedEngine);
 fields(proof,{schemaVersion:1,normalBuildReceiptSha256:NORMAL,audioMutedThroughout:true,query:'?testing=1',
  browserControlRecovered:true,syntheticProfile:true,browserEarnedWins:0,freshBrowserPerformanceMeasured:false,
  performanceProbeLoaded:false,sameBuildBrowserPlanningRoundTrip:true,sameBuildBrowserOffenseRoundTrip:true});
 fields(proof.planning,{sunBefore:1500,sunAfter:1400,manualPeashooterPlaced:true});
 fields(proof.offense,{sunBefore:1000,sunAfter:950,ordinaryNormalZombiePlaced:true,speedLabel:'2x',
  restoredSpeedLabel:'1x',restoredBrainsEaten:0});
 assert(Array.isArray(proof.operatorObservations)&&proof.operatorObservations.length>=4);
 for(const observation of proof.operatorObservations)assert(typeof observation==='string'&&observation.length>=20);
 dimensions(proof.viewport.width);dimensions(proof.viewport.height);
 assert(Number.isFinite(proof.viewport.deviceScaleFactor)&&proof.viewport.deviceScaleFactor>0&&proof.viewport.deviceScaleFactor<=8);
 fields(proof.canvas,{width:800,height:600});dimensions(proof.canvas.cssWidth);dimensions(proof.canvas.cssHeight);
 assert(proof.canvas.cssWidth<=proof.viewport.width&&proof.canvas.cssHeight<=proof.viewport.height);
 assert(Math.abs(proof.canvas.cssWidth*600-proof.canvas.cssHeight*800)<=800,
  'Observed native canvas preserves its original aspect ratio within one CSS pixel');
 assert.deepEqual(Object.keys(proof.screenshots).sort(),SCREENSHOTS);
 assert.equal(new Set(Object.values(proof.screenshots).map(record=>record.path)).size,SCREENSHOTS.length);
 const imageSizes={};
 for(const [kind,record]of Object.entries(proof.screenshots)){
  assert(record.path.startsWith(FOLDER)&&record.path.endsWith('.jpg'));
  const data=pin(record),[width,height]=jpegSize(data);dimensions(width);dimensions(height);
  imageSizes[kind]=[width,height];
 }
 assert.deepEqual(Object.keys(proof.inputs).sort(),['earnedOffense','profileOnly']);
 assert.notEqual(proof.inputs.profileOnly.path,proof.inputs.earnedOffense.path);
 const inputEntries={};
 for(const [role,record]of Object.entries(proof.inputs)){
  assert(record.path.startsWith(FOLDER)&&record.path.endsWith('.zip'));
  const bytes=pin(record),zip=await Zip.loadAsync(bytes,{checkCRC32:true});
  const entries=Object.values(zip.files).filter(entry=>!entry.dir);
  const names=entries.map(entry=>safe(entry.name)).sort();
  const expected=['userdata/user1.dat','userdata/users.dat'];
  if(role==='earnedOffense')expected.push('userdata/game1_91.v4');
  assert.deepEqual(names,expected.sort(),'Only the actually imported native profile and mode91 save files are allowed');
  inputEntries[role]={};
  for(const entry of entries){
   const data=Buffer.from(await entry.async('uint8array'));assert(data.length>0);
   inputEntries[role][entry.name]={bytes:data.length,sha256:sha(data)};
  }
 }
 assert.deepEqual(Object.keys(proof.runtimeFiles).sort(),RUNTIME);
 for(const [name,record]of Object.entries(proof.runtimeFiles)){
  safe(name);assert(!name.includes('probe')&&!name.includes('performance'));
  assert.deepEqual(Object.keys(record).sort(),['bytes','sha256']);
  const data=pin({...record,path:'dist/'+name});
  if(name==='game/pvz-portable.js')assert.equal(sha(data),JS);
  if(name==='game/pvz-portable.wasm')assert.equal(sha(data),WASM);
 }
 assert(proof.observedEngineMetadata.path.startsWith(FOLDER)&&proof.observedEngineMetadata.path.endsWith('.json'));
 const observed=json(pin(proof.observedEngineMetadata));
 assert.equal(observed.id,ENGINE);assert.equal(observed.artifacts.jsSha256,JS);assert.equal(observed.artifacts.wasmSha256,WASM);
 assert.equal(observed.assetBundleId,currentEngine.assetBundleId);assert.equal(observed.assetManifest,currentEngine.assetManifest);
 const assetManifest=json(read('dist/game-assets/manifest.json'));assert.equal(assetManifest.id,currentEngine.assetBundleId);
 // The browser saw the exact production executable. A later corresponding-
 // source recipe repack may change its metadata source hash, so authenticate
 // the current archive independently instead of rewriting the observed record.
 assert(/^\.\.\/source\/[A-Za-z0-9._-]+\.zip$/.test(currentEngine.artifacts.source));
 const sourceBytes=Buffer.from(read('dist/'+safe(currentEngine.artifacts.source.slice(3))));
 assert.equal(sha(sourceBytes),currentEngine.artifacts.sourceSha256);
 const source=await Zip.loadAsync(sourceBytes);
 const receipt=source.file('double1-candidate/logs/build-result.json');assert(receipt);
 const receiptBytes=Buffer.from(await receipt.async('uint8array'));assert.equal(sha(receiptBytes),NORMAL);
 const normal=json(receiptBytes);fields(normal,{status:'PASS',exitCode:0,sourceFiles:872,sourceUnchangedDuringBuild:true});
 assert.equal(normal.outputs['build/pvz-portable.js'].sha256,JS);assert.equal(normal.outputs['build/pvz-portable.wasm'].sha256,WASM);
 return {status:'PASS functional-only browser evidence',screenshots:SCREENSHOTS.length,inputs:inputEntries,
  imageSizes,runtimeFiles:RUNTIME.length,normalBuildReceiptSha256:NORMAL,
  freshBrowserPerformancePassed:false,browserEarnedWins:0};
}
