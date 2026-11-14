// SPDX-License-Identifier: MIT
// Authenticate the new executable and raw observations before applying the
// unchanged, separately sealed Gust-era gameplay oracles to retained modes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CURRENT_ENGINE_ID,CURRENT_SOURCE_COUNT,CURRENT_OBJECT_COUNT,GUST_ENGINE_ID,
 GUST_ARCHIVE_SHA256,GUST_FOCUSED_REFERENCE_SHA256,ZOMBOTANY3_PARENT_TEST_INPUTS_SHA256,
 reconstructGustSources,verifyZombotany3RetainedParentInputs}from'./native-release-context.mjs';
const families=Object.freeze({
 'double-agent':{adapter:'double',cases:52,mode:91,profileIndex:90,
  parentReportSha256:'b4759164649ae992c1c6e509c914d18f9163a3ab8557452cac3e06404c72c814',
  contractSha256:'2897a2f15387c4f8b244d92dc587c2437ea370daa02f1e556e6d8ccab24d4ac4'},
 'gust-bloom':{adapter:'gust',cases:48,mode:92,profileIndex:91,
  parentReportSha256:'3ec7ccda1a5f1b9c1a5feb33c4e0fd63561d6a0014ade4f2376584ddd9efee98',
  contractSha256:'dfa82fd954932ebd374e073fcd7a52273aac79451763b4e311c9458024e6e320'}
});
const canonical=value=>Array.isArray(value)?value.map(canonical):value!==null&&typeof value==='object'?
 Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
const json=b=>JSON.parse(Buffer.from(b).toString('utf8').replace(/^\uFEFF/,''));
const safe=p=>assert(typeof p==='string'&&p&&!/[\\:\x00-\x1f]/.test(p)&&!p.startsWith('/')&&p.split('/').every(v=>v&&v!=='.'&&v!=='..'));
const sameNative=(a,b)=>assert.deepEqual(canonical({...a,scenarios:a.scenarios.map(({logSha256,...row})=>row)}),
 canonical({...b,scenarios:b.scenarios.map(({logSha256,...row})=>row)}),'Every retained native observation remains exact');

export async function authenticateZombotany3RetainedFamily(options){
 const {family,report,read,sha,engine,adapterSha256,verifyBuild,verifyCase}=options;
 assert(Object.hasOwn(families,family));const rule=families[family];assert(adapterSha256,'Current retained adapter is not frozen');
 assert.equal(engine.id,CURRENT_ENGINE_ID);assert.equal(engine.parent.id,GUST_ENGINE_ID);
 assert.equal(engine.parent.artifacts.sourceSha256,GUST_ARCHIVE_SHA256);
 const snapshot=await verifyZombotany3RetainedParentInputs({read,sha});
 const originalRead=async name=>{
  safe(name);assert(name.startsWith('tests/'));const key=name.slice(6),pin=snapshot.files[key];
  // Unchanged contracts were deliberately not duplicated in the selected
  // parent snapshot. Their published identities remain literal, independent
  // pins; they can be read from the current tree only after exact validation.
  if(!pin&&key===family+'-verification-contract.json'){
   const raw=Buffer.from(await read(name));assert.equal(sha(raw),rule.contractSha256);return raw;
  }
  assert(pin,name);
  const raw=Buffer.from(await read('tests/zombotany3-retained-parent/'+key));assert.equal(raw.length,pin.bytes);assert.equal(sha(raw),pin.sha256);return raw;
 };
 const originalBytes=await originalRead('tests/'+family+'-results.json');assert.equal(sha(originalBytes),rule.parentReportSha256);
 const original=json(originalBytes);assert.equal(original.engineId,GUST_ENGINE_ID);
 const adapterBytes=await read('tests/z3-'+rule.adapter+'-retention.json');assert.equal(sha(adapterBytes),adapterSha256);
 const adapter=json(adapterBytes);
 for(const [key,value]of Object.entries({schemaVersion:1,engineId:CURRENT_ENGINE_ID,parentEngineId:GUST_ENGINE_ID,
  parentArchiveSha256:GUST_ARCHIVE_SHA256,parentSnapshotManifestSha256:ZOMBOTANY3_PARENT_TEST_INPUTS_SHA256,
  sourceCount:CURRENT_SOURCE_COUNT,productionObjectCount:CURRENT_OBJECT_COUNT,historicalContractSha256:rule.contractSha256}))
  assert.equal(adapter[key],value,key);
 assert.equal(report.retentionAdapterSha256,sha(adapterBytes));
 const contractBytes=await originalRead('tests/'+family+'-verification-contract.json');assert.equal(sha(contractBytes),rule.contractSha256);
 assert.deepEqual(await read('tests/'+family+'-verification-contract.json'),contractBytes,'The original contract is unchanged');
 const overrides=adapter.fixtureOverrides;assert(overrides&&typeof overrides==='object');
 const allowed=['build-'+family+'.py','test-'+family+'.py',family+'-presentation-controls.h'];
 for(const name of Object.keys(overrides)){
  safe(name);assert(name.startsWith('tests/')&&allowed.includes(name.slice(6)),name);
  assert.equal(sha(await read(name)),overrides[name]);
  assert.equal(sha(await originalRead(name)),adapter.originalFixtureSha256[name]);
 }
 for(const name of ['tests/build-'+family+'.py','tests/test-'+family+'.py'])assert(Object.hasOwn(overrides,name));
 assert.deepEqual(Object.keys(overrides).sort(),Object.keys(adapter.originalFixtureSha256).sort());
 assert.deepEqual(Object.keys(report.testInputSha256).sort(),Object.keys(original.testInputSha256).sort());
 for(const [name,pin]of Object.entries(original.testInputSha256))
  assert.equal(report.testInputSha256[name],overrides['tests/'+name]||pin,name);
 assert.equal(report.scenarios.length,rule.cases);assert.equal(report.mode,rule.mode);assert.equal(report.profileIndex,rule.profileIndex);
 await verifyBuild(options);
 const actualBytes=await read('tests/'+family+'-results.json');assert.deepEqual(json(actualBytes),report);
 for(const row of report.scenarios)await verifyCase(row,{read,sha});
 const normalized=structuredClone(report);
 const metadata=['engineId','productionObjectCount','productionBuildReceiptSha256','sourceSha256',
  'productionObjectSha256','generatedHarnessSha256','builderSha256','runnerSha256','testArtifactSha256','testInputSha256'];
 for(const name of metadata){assert(Object.hasOwn(original,name)&&Object.hasOwn(report,name));normalized[name]=structuredClone(original[name]);}
 assert.equal(report.checks,original.checks+4,'Only four added production-source assertions change this retained total');
 normalized.checks-=4;
 if(Object.hasOwn(original,'retentionAdapterSha256'))normalized.retentionAdapterSha256=original.retentionAdapterSha256;
 else delete normalized.retentionAdapterSha256;
 sameNative(normalized,original);
 const projected=await reconstructGustSources({referenceBytes:fs.readFileSync(new URL('./fixtures/zombotany3-parent-reference.json',import.meta.url)),read,sha,engine});
 const normalizedBytes=Buffer.from(JSON.stringify(normalized));
 const historicalRead=async name=>{
  if(name==='tests/'+family+'-results.json')return normalizedBytes;
  if(name.startsWith('source/')){const bytes=projected.files.get(name.slice(7));assert(bytes,name);return bytes;}
  if(name.startsWith('tests/')&&Object.hasOwn(snapshot.files,name.slice(6)))return originalRead(name);
  return read(name);
 };
 const focusedBytes=fs.readFileSync(new URL('./fixtures/gust1-focused-reference.json',import.meta.url));assert.equal(sha(focusedBytes),GUST_FOCUSED_REFERENCE_SHA256);
 const productionBuildBytes=Buffer.from(json(focusedBytes).files['logs/build-result.json'].base64,'base64');
 return {report:normalized,read:historicalRead,engine:engine.parent,productionBuildBytes,
  actualCases:rule.cases,actualProductionObjects:CURRENT_OBJECT_COUNT};
}
