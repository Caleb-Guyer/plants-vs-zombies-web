// SPDX-License-Identifier: MIT
// Portable exact inputs for the unchanged published Windows/Linux regression.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {reconstructZVaseParentSources,ZVASE_PARENT_ENGINE_ID,ZVASE_PARENT_ARCHIVE_SHA256,
 ZVASE_PARENT_NORMAL_SHA256} from './native-release-context.mjs';
const MANIFEST_SHA256='bedc475d54dca3f0092cb7f9cb0935f7099f880078102aeef2c60c44b5fa76cd'; // Root independently checked all25 bytes against A3.
const DECODER_SHA256='a54252dee2b01a69e1dab0248a6b6bb3a7e80b8b115bf0d02ea9e4185487ec31';
const json=b=>JSON.parse(Buffer.from(b).toString('utf8'));

export async function openZsurvival1HistoricalCanonicalInputs({root,currentEngine,Zip,readRoot,sha}){
 assert.equal(currentEngine.id,'0.2.6-web-zvase.1');
 assert.equal(currentEngine.parent.id,ZVASE_PARENT_ENGINE_ID);
 assert.equal(currentEngine.parent.artifacts.sourceSha256,ZVASE_PARENT_ARCHIVE_SHA256);
 assert(/^\.\.\/source\/[A-Za-z0-9._-]+\.zip$/.test(currentEngine.artifacts.source));
 const source=Buffer.from(readRoot('dist/'+currentEngine.artifacts.source.slice(3)));
 assert.equal(sha(source),currentEngine.artifacts.sourceSha256);
 const zip=await Zip.loadAsync(source,{checkCRC32:true});
 const currentRead=async name=>{const entry=zip.file('zombotany3-candidate/'+name);assert(entry,name);return Buffer.from(await entry.async('uint8array'));};
 const parent=await reconstructZVaseParentSources({read:currentRead,sha,engine:currentEngine});
 assert.equal(parent.files.size,888);
 assert(MANIFEST_SHA256,'The exact published Windows canonical fixture is not independently reviewed');
 const manifestBytes=Buffer.from(readRoot('tests/fixtures/zsurvival1-windows-golden.json'));assert.equal(sha(manifestBytes),MANIFEST_SHA256);
 const manifest=json(manifestBytes);
 assert.equal(manifest.schemaVersion,1);assert.equal(manifest.codec,'xz-u32le-length-framed-v1');assert.equal(manifest.historicalOnly,true);
 assert.equal(manifest.engineId,ZVASE_PARENT_ENGINE_ID);assert.equal(manifest.sourceArchiveSha256,ZVASE_PARENT_ARCHIVE_SHA256);
 assert.equal(manifest.normalReceiptSha256,ZVASE_PARENT_NORMAL_SHA256);assert.equal(manifest.sourceMemberPrefix,'zombotany3-candidate/');
 const packed=Buffer.from(readRoot('tests/fixtures/zsurvival1-windows-golden.xz'));assert.equal(packed.length,68196);assert.equal(packed.length,manifest.xzBytes);
 assert.equal(sha(packed),'2edfc5a28f7ae2e6d60448e006e82e9757614d28b9065b6e2b05af65c63a26bd');assert.equal(sha(packed),manifest.xzSha256);
 assert.equal(sha(readRoot('tests/decode-zsurvival1-windows.py')),DECODER_SHA256);
 const decoded=spawnSync('python',[fileURLToPath(new URL('tests/decode-zsurvival1-windows.py',root))],{maxBuffer:2*1024*1024,timeout:10000});
 assert.equal(decoded.status,0,decoded.error?.message||decoded.stderr?.toString());const raw=decoded.stdout;
 assert.equal(raw.length,1323857);assert.equal(raw.length,manifest.rawBytes);assert.equal(sha(raw),'4a180ac53d9eb1ef6444692cbc308a9047b23dbb916242682e9e42a3d6d089f2');assert.equal(sha(raw),manifest.rawSha256);
 const files=new Map();let offset=0;assert.equal(manifest.files.length,25);
 for(const entry of manifest.files){
  assert.equal(entry.frameOffset,offset);assert(offset+4<=raw.length);assert.equal(raw.readUInt32LE(offset),entry.bytes);
  assert(Number.isSafeInteger(entry.bytes)&&entry.bytes>0&&entry.bytes<=2*1024*1024);offset+=4;
  assert(offset+entry.bytes<=raw.length);const bytes=Buffer.from(raw.subarray(offset,offset+entry.bytes));offset+=entry.bytes;
  assert(!files.has(entry.path));assert.equal(sha(bytes),entry.sha256);files.set(entry.path,bytes);
 }
 assert.equal(offset,raw.length);
 assert.equal(sha(files.get('tests/zsurvival1-results.json')),'caf29629c41df8c5cd3a4b31ccc1160cc4c14c2cdd575308b3ca43746858bbd3');
 const report=json(files.get('tests/zsurvival1-results.json'));
 assert.deepEqual([...files.keys()].sort(),['tests/zsurvival1-results.json',...report.scenarios.map(r=>`tests/zsurvival1-logs/${r.name}-${r.speed}x-${r.seed}.log`)].sort());
 return {engine:currentEngine.parent,read:async name=>{
  if(name.startsWith('source/')){const bytes=parent.files.get(name.slice(7));assert(bytes,name);return bytes;}
  assert(files.has(name),'Only exact historical canonical inputs are available: '+name);return files.get(name);
 }};
}
