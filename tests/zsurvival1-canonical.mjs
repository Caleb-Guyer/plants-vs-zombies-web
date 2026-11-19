// SPDX-License-Identifier: MIT
// Real golden/Linux report identity and strict raw-save/log regression checks.
// No engine build, browser, native game or audio device is started here.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {verifyZsurvivalCloudSourceGuard,projectZsurvival1CloudCanonical,ZSURVIVAL_UNUSED_CLOUD_INDICES,ZSURVIVAL_CLOUD_SOURCE_PINS} from './zsurvival1-cloud-canonical.mjs';
import {verifyZsurvival1Scenario,verifyZsurvival1HistoricalMatrix as verifyZsurvival1Matrix,verifyZsurvival1CaseLog} from './zsurvival1-verification.mjs';
import {openZsurvival1HistoricalCanonicalInputs} from './zvase1-survival-history.mjs';
const root=new URL('../',import.meta.url),sha=b=>createHash('sha256').update(b).digest('hex'),json=b=>JSON.parse(Buffer.from(b).toString('utf8'));
const readRoot=n=>fs.readFileSync(new URL(n,root)),clone=structuredClone;
const vendor={exports:{}};new Function('module','exports','require',readRoot('dist/vendor/jszip.min.js').toString())(vendor,vendor.exports,createRequire(import.meta.url));
const currentEngine=json(readRoot('dist/game/engine-provenance.json'));
const {engine,read}=await openZsurvival1HistoricalCanonicalInputs({root,currentEngine,Zip:vendor.exports,readRoot,sha});
assert.equal(engine.id,'0.2.6-web-zsurvival.1');
const raw=await read('tests/zsurvival1-results.json');assert.equal(sha(raw),'caf29629c41df8c5cd3a4b31ccc1160cc4c14c2cdd575308b3ca43746858bbd3');
const golden=json(raw),unchanged=JSON.stringify(golden);
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
function identity(report,project=true){const value=project?projectZsurvival1CloudCanonical(report):report,scenarios=value.scenarios.map(({logSha256,...row})=>row);return Buffer.from(JSON.stringify(canonical({...value,scenarios})));}
const projectedPin='502dcdc07283fa9dc6c9f0a96bbb222427a521d2554db07df40f6286dacd8fbe';
assert.equal(sha(identity(golden,false)),'8760d7467df0601dc82d19f69a8183e7d6ab3f0f3c25a7d606e0bd0a46a09431');
assert.equal(sha(identity(golden)),projectedPin);assert.deepEqual(ZSURVIVAL_UNUSED_CLOUD_INDICES,[7,9,11,13,15,17]);assert.equal(Object.keys(ZSURVIVAL_CLOUD_SOURCE_PINS).length,10);
const guard={read,sha,engineId:engine.id,normalReceiptSha256:golden.productionBuildReceiptSha256};await verifyZsurvivalCloudSourceGuard(guard);
verifyZsurvival1Matrix(golden);for(const row of golden.scenarios)await verifyZsurvival1CaseLog(row,{read,sha});
const negatives=[];
function bad(name,base,change,fn=verifyZsurvival1Scenario){const value=clone(base);change(value);assert.throws(()=>fn(value),name);negatives.push(name);}
const win=golden.scenarios.find(r=>r.name==='normal'),cp=golden.scenarios.find(r=>r.name==='save-combat'),transition=golden.scenarios.find(r=>r.name==='save-transition'),controls=golden.scenarios.find(r=>r.name==='controls'),loss=golden.scenarios.find(r=>r.name==='no-action');
// Retain the previous21 acceptance protections. The former pre-seal pending
// check is now its durable equivalent: unknown changed native identity differs.
bad('missing matrix case',golden,r=>r.scenarios.pop(),verifyZsurvival1Matrix);
bad('duplicate matrix case',golden,r=>r.scenarios[1]=r.scenarios[0],verifyZsurvival1Matrix);
bad('only four flags',win,r=>r.nativeBestFlags=4);
bad('early stage award',win,r=>r.nativeAwardStage=3);
bad('other profile credit changed',win,r=>r.nativeProfileRecordsAfter[0]++);
bad('repick skipped',win,r=>r.nativeRepicks=3);
bad('authored actor missing',win,r=>r.nativeFormationLedger[4][9][0][1]--);
bad('ordinary actor substituted',win,r=>r.nativeFormationLedger[0][0][0][0]=0);
bad('input cadence weakened',win,r=>r.minimumInputCadenceTicks=149);
bad('post-start resource write',win,r=>r.postStartActorHealthResourceStageTimeOrRNGEdits=true);
bad('saved graph lost',cp,r=>r.checkpoint.afterGraph+=';tampered');
bad('actual Menu Continue bypassed',cp,r=>r.checkpoint.nativeMenuLeaveCardContinue=false);
bad('combat checkpoint stage changed',cp,r=>r.checkpoint.stage=1);
bad('transition counter outside original bound',transition,r=>r.checkpoint.transitionCounter=99);
bad('ordinary thumbnail substituted',controls,r=>r.nativeThumbnailMatchPercentMilli[1]=19481);
bad('partial flags called trophy',controls,r=>r.nativePartialFlagsNotTrophies=false);
bad('synthetic control claimed win',controls,r=>r.earnedClears=1);
bad('no-input case planted',loss,r=>r.nativeOrdinaryPlacements=1);
bad('audio hardware opened',win,r=>r.audioDeviceOpened=true);
const logName=`tests/zsurvival1-logs/${win.name}-${win.speed}x-${win.seed}.log`,log=await read(logName),changed=Buffer.from(log.toString().replace(/ cost50 sun/,' cost49 sun'));assert.notDeepEqual(log,changed);
await assert.rejects(()=>verifyZsurvival1CaseLog({...win,logSha256:sha(changed)},{read:n=>n===logName?changed:read(n),sha}));negatives.push('raw native purchase cost changed');
const unknown=clone(golden);unknown.scenarios[0].nativeSunSpent++;assert.notEqual(sha(identity(unknown)),projectedPin);negatives.push('unknown meaningful native identity rejected');
assert.equal(negatives.length,21);

function bothGraphs(row,fn){for(const key of ['beforeGraph','afterGraph'])row.checkpoint[key]=fn(row.checkpoint[key]);}
function record(raw,tag,index,value){const parts=raw.split(';'),i=parts.findIndex(p=>p.startsWith(tag+','));assert(i>=0);const tokens=parts[i].split(',');tokens[index]=String(value(tokens[index]));parts[i]=tokens.join(',');return parts.join(';');}
function different(name,fn){const other=clone(golden),row=other.scenarios.find(r=>r.name==='save-combat');fn(row);let rejected=false;try{rejected=sha(identity(other))!==projectedPin;}catch{rejected=true;}assert(rejected,name);negatives.push(name);}
different('graph sun changed',r=>bothGraphs(r,s=>{const p=s.split(';'),b=p[0].split(':');b[1]=String(Number(b[1])+1);p[0]=b.join(':');return p.join(';');}));
different('graph plant row changed',r=>bothGraphs(r,s=>record(s,'p',4,v=>(Number(v)+1)%5)));
different('graph zombie body health changed',r=>bothGraphs(r,s=>record(s,'z',6,v=>Number(v)+1)));
different('meaningful terrain grid changed',r=>bothGraphs(r,s=>record(s,'terrain',18,v=>Number(v)+1)));
different('terrain plant row type changed',r=>bothGraphs(r,s=>record(s,'terrain',6,v=>Number(v)+1)));
different('non-Day background rejected',r=>bothGraphs(r,s=>record(s,'terrain',1,()=>1)));
different('malformed terrain width rejected',r=>bothGraphs(r,s=>{const p=s.split(';'),i=p.findIndex(v=>v.startsWith('terrain,'));p[i]=p[i].split(',').slice(0,-1).join(',');return p.join(';');}));
different('duplicate terrain record rejected',r=>bothGraphs(r,s=>s+';'+s.split(';').find(p=>p.startsWith('terrain,'))));
different('noninteger unused counter rejected',r=>bothGraphs(r,s=>record(s,'terrain',7,()=>'NaN')));
different('out-of-range unused counter rejected',r=>bothGraphs(r,s=>record(s,'terrain',7,()=>2147483648)));
different('full raw before/after mismatch still rejected',r=>{r.checkpoint.afterGraph=record(r.checkpoint.afterGraph,'terrain',7,v=>Number(v)+1);});
different('Fog cannot use Day projection',r=>r.mode=94);
for(const [name,pin]of Object.entries(ZSURVIVAL_CLOUD_SOURCE_PINS)){
 await assert.rejects(()=>verifyZsurvivalCloudSourceGuard({...guard,read:async n=>n===name?Buffer.concat([await read(n),Buffer.from('// changed')]):read(n)}));negatives.push('changed frozen source rejected: '+name);
}
await assert.rejects(()=>verifyZsurvivalCloudSourceGuard({...guard,engineId:'0.2.6-web-zombotany45.2'}));negatives.push('other engine source guard rejected');
await assert.rejects(()=>verifyZsurvivalCloudSourceGuard({...guard,normalReceiptSha256:'0'.repeat(64)}));negatives.push('unknown normal source guard rejected');

// Preserve every original Linux byte, including full raw logs. XZ is only a
// bounded transport; it does not normalize line endings or graph fields.
const fixtureBytes=readRoot('tests/fixtures/zsurvival1-linux-ci.json');
assert.equal(sha(fixtureBytes),'273df3b9b4cb8dfda07461559e9bd376f8316e4c003c21959439901f5002bad2');
const fixture=json(fixtureBytes);assert.equal(fixture.schemaVersion,1);assert.equal(fixture.codec,'xz-u32le-length-framed-v1');
assert.equal(fixture.sourceArchiveSha256,'a3bebe9b89f0816f4e44e00ee4edf3b3a93ec95f1d2e301f26c793252b88d5ba');
assert.equal(fixture.sourceMemberPrefix,'zombotany3-candidate/');
for(const[k,v]of Object.entries({repository:'Caleb-Guyer/plants-vs-zombies-web',workflow:'survival-report-diagnostic.yml',runId:44030432919,runAttempt:1,
 commit:'1cc26dccdaee1ca7a782ea648b59ed51f72feaa8',artifactId:14304518512,artifactZipSha256:'dc0698e128decb8c5fb3445f03d4e6efe02aa3f68753c0e432ba87543d27e0a6',
 normalReceiptSha256:golden.productionBuildReceiptSha256}))assert.deepEqual(fixture.origin[k],v,k);
const packed=readRoot('tests/fixtures/zsurvival1-linux-ci.xz');assert.equal(packed.length,68696);assert.equal(packed.length,fixture.xzBytes);
assert.equal(sha(packed),'f421456502d800869c9b890dfe5988bb99497260899dbd800314b87c91923a4d');assert.equal(sha(packed),fixture.xzSha256);
assert.equal(sha(readRoot('tests/decode-zsurvival1-linux.py')),'800b205390565a2179fc78ce8a0afb5bceced083af1317088d621f26b0aa15ed');
const decoded=spawnSync('python',[fileURLToPath(new URL('tests/decode-zsurvival1-linux.py',root))],{maxBuffer:2*1024*1024,timeout:10000});
assert.equal(decoded.status,0,decoded.error?.message||decoded.stderr?.toString());const frame=decoded.stdout;
assert.equal(frame.length,1300298);assert.equal(frame.length,fixture.rawBytes);assert.equal(sha(frame),'17dc718dc74f891cd79fec64c9fdf63bcce477dec017374803aaf9551a8f5157');assert.equal(sha(frame),fixture.rawSha256);
assert.equal(fixture.files.length,25);const linuxFiles=new Map();let offset=0;
for(const record of fixture.files){
 assert.equal(record.frameOffset,offset);assert(offset+4<=frame.length);assert.equal(frame.readUInt32LE(offset),record.bytes);
 assert(Number.isSafeInteger(record.bytes)&&record.bytes>0&&record.bytes<=2*1024*1024);assert(!linuxFiles.has(record.path));
 offset+=4;assert(offset+record.bytes<=frame.length);const bytes=Buffer.from(frame.subarray(offset,offset+record.bytes));offset+=record.bytes;
 assert.equal(sha(bytes),record.sha256);const original=await read(record.path);assert.equal(original.length,record.baseBytes);assert.equal(sha(original),record.baseSha256);linuxFiles.set(record.path,bytes);
}
assert.equal(offset,frame.length);assert.deepEqual([...linuxFiles.keys()].sort(),['tests/zsurvival1-results.json',...golden.scenarios.map(r=>`tests/zsurvival1-logs/${r.name}-${r.speed}x-${r.seed}.log`)].sort());
const linuxRaw=linuxFiles.get('tests/zsurvival1-results.json');assert.equal(sha(linuxRaw),'2cdbaa3237a3981705582f325bd76122d4e47a1a659716ffa380685f059f800e');
const linux=json(linuxRaw),linuxUnchanged=JSON.stringify(linux);verifyZsurvival1Matrix(linux);
for(const row of linux.scenarios)await verifyZsurvival1CaseLog(row,{read:async n=>{assert(linuxFiles.has(n),n);return linuxFiles.get(n);},sha});
assert.notEqual(sha(identity(linux,false)),sha(identity(golden,false)));assert.deepEqual(identity(linux),identity(golden));assert.equal(sha(identity(linux)),projectedPin);
let changedGraphFields=0,changedUnusedIntegers=0,changedLogDigests=0;
for(let i=0;i<golden.scenarios.length;i++){
 const a=golden.scenarios[i],b=linux.scenarios[i];if(a.logSha256!==b.logSha256)changedLogDigests++;
 for(const key of ['beforeGraph','afterGraph'])if(a.checkpoint?.[key]!==b.checkpoint?.[key]){
  changedGraphFields++;const x=a.checkpoint[key].split(';'),y=b.checkpoint[key].split(';');assert.equal(x.length,y.length);
  for(let j=0;j<x.length;j++)if(x[j]!==y[j]){assert(x[j].startsWith('terrain,')&&y[j].startsWith('terrain,'));const before=x[j].split(','),after=y[j].split(',');assert.equal(before.length,135);assert.equal(after.length,135);
   const changed=before.map((v,k)=>v!==after[k]?k:-1).filter(k=>k>=0);assert.deepEqual(changed,[7,9,11,13,15,17]);changedUnusedIntegers+=changed.length;
  }
 }
}
assert.equal(changedGraphFields,16);assert.equal(changedUnusedIntegers,96);assert.equal(changedLogDigests,24);
assert.equal(JSON.stringify(linux),linuxUnchanged,'Actual Linux report must stay raw and unchanged');
assert.equal(JSON.stringify(golden),unchanged,'The native golden report must stay raw and unchanged');
console.log(`PASS Survival canonical regression: all48 actual raw cases/logs, exact25-file Linux evidence,96 unused integers only, prior21 protections and${negatives.length-21} source/cloud negatives; no native run.`);
