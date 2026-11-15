// SPDX-License-Identifier: MIT
// Authenticate the original .2 observations without attributing them to .45.
import assert from 'node:assert/strict';
import {verifyZombotany3BrowserEvidence} from './zombotany3-2-browser-verification.mjs';
import {verifyZombotany3PerformanceEvidence} from './zombotany3-2-performance-verification.mjs';
const FOLDER='tests/fixtures/zombotany3-2-history/';
const MANIFEST='84272fd343f7ce53ad3122c5f3f9158671b54e79340fd4cbac81e2f934ac955d';
const json=b=>JSON.parse(Buffer.from(b).toString('utf8').replace(/^\uFEFF/,''));
export async function verifyZombotany3HistoricalEvidence({read,sha,Zip}){
 const raw=Buffer.from(read(FOLDER+'manifest.json'));assert.equal(sha(raw),MANIFEST);
 const manifest=json(raw);assert.equal(manifest.engine,'0.2.6-web-zombotany3.2');
 assert.equal(manifest.publishedSourceSha256,'9e4186372f80a9b59d119f8bf9cb0217e17a072d5fa178ea9f96cd120a4b5efb');
 assert.equal(manifest.executablePayloadsStored,0);assert.equal(Object.keys(manifest.files).length,21);
 const preserved=new Map();
 for(const [name,pin]of Object.entries(manifest.files)){
  assert(name&&!/[\\:\x00-\x1f]/.test(name)&&!name.startsWith('/')&&name.split('/').every(p=>p&&p!=='.'&&p!=='..'));
  const b=Buffer.from(read(FOLDER+name));assert.equal(b.length,pin.bytes,name);assert.equal(sha(b),pin.sha256,name);preserved.set(name,b);
 }
 const historicalRead=name=>{
  if(name.startsWith('dist/')){const b=preserved.get('runtime/'+name.slice(5));assert(b,'Historical runtime payload not stored or reviewed: '+name);return b;}
  return read(name);
 };
 const engine=json(preserved.get('runtime/game/engine-provenance.json'));assert.equal(engine.id,manifest.engine);
 assert.equal(engine.artifacts.sourceSha256,manifest.publishedSourceSha256);
 const functional=await verifyZombotany3BrowserEvidence({
  availability:json(read('tests/fixtures/performance/zombotany3-2-browser-validation.json')),
  currentEngine:engine,read:historicalRead,sha,Zip,historical:true,
  historicalNormalBytes:preserved.get('normal-build.json'),historicalBuildBytes:preserved.get('native-build.json')});
 const timing=await verifyZombotany3PerformanceEvidence({
  availability:json(read('tests/fixtures/performance/zombotany3-2-current-validation.json')),
  currentEngine:engine,read:historicalRead,sha,historical:true});
 assert.equal(functional.executablePayloadsChecked,0);assert.equal(timing.executablePayloadsChecked,0);
 assert.equal(timing.freshBrowserPerformanceMeasured,false);assert.equal(timing.freshBrowserPerformancePassed,false);
 return {status:'PASS historical .2 browser and timing observations; no current timing claim',historical:true,
  engine:engine.id,executablePayloadsChecked:0,currentTimingClaim:false,nonbinaryFiles:21};
}
