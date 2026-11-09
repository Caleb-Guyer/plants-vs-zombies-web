// SPDX-License-Identifier: MIT
// Lossless distribution codec; every reconstructed executable keeps its own
// executed build/report hash. No dependency download or audio initialization.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';

const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const MAX_RAW=256*1024*1024,MAX_PACKED=64*1024*1024;
export async function restoreNativeArtifactPack(zip,prefix) {
  const indexEntry=zip.file(prefix+'tests/native-artifacts.json');
  if(!indexEntry)return [];
  const index=JSON.parse(await indexEntry.async('string'));
  assert.equal(index.format,'pvz-native-artifacts-xz-v1');
  assert(Number.isSafeInteger(index.rawBytes)&&index.rawBytes>0&&index.rawBytes<=MAX_RAW);
  assert(Number.isSafeInteger(index.packedBytes)&&index.packedBytes>0&&index.packedBytes<=MAX_PACKED);
  for(const field of ['rawSha256','packedSha256'])assert.match(index[field],/^[a-f0-9]{64}$/);
  assert(Array.isArray(index.files)&&index.files.length>0&&index.files.length<=80);
  const names=new Set();let offset=0;
  for(const file of index.files) {
    assert.match(file.path,/^[a-z0-9][a-z0-9-]*-engine\.(js|wasm)$/);
    assert(!names.has(file.path)&&!zip.file(prefix+'tests/'+file.path),'Duplicate or conflicting executable');
    names.add(file.path);assert.equal(file.offset,offset);
    assert(Number.isSafeInteger(file.bytes)&&file.bytes>0&&file.bytes<=index.rawBytes-offset);
    assert.match(file.sha256,/^[a-f0-9]{64}$/);offset+=file.bytes;
  }
  assert.equal(offset,index.rawBytes);
  const entry=zip.file(prefix+'tests/native-artifacts.xz');assert(entry);
  const packed=Buffer.from(await entry.async('uint8array'));
  assert.equal(packed.length,index.packedBytes);assert.equal(sha(packed),index.packedSha256);
  const code='import lzma,sys;sys.stdout.buffer.write(lzma.decompress(sys.stdin.buffer.read(),memlimit=268435456))';
  const process=spawnSync('python',['-c',code],{input:packed,maxBuffer:MAX_RAW,timeout:60000});
  assert.equal(process.status,0,process.error?.message||process.stderr?.toString('utf8').slice(0,1000));
  const raw=process.stdout;assert.equal(raw.length,index.rawBytes);assert.equal(sha(raw),index.rawSha256);
  for(const file of index.files) {
    const bytes=raw.subarray(file.offset,file.offset+file.bytes);assert.equal(sha(bytes),file.sha256,file.path);
    zip.file(prefix+'tests/'+file.path,bytes);
  }
  return [...names];
}
