import {readFileSync,readdirSync,statSync,existsSync} from 'node:fs';
import {resolve,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash,webcrypto} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const root=fileURLToPath(new URL('./',import.meta.url));
const dist=join(root,'dist');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function walk(folder){return readdirSync(folder).flatMap(name=>{const path=join(folder,name);return statSync(path).isDirectory()?walk(path):[path];});}
for(const file of walk(dist).filter(file=>file.endsWith('.js'))){
  const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  assert.equal(result.status,0,`${relative(root,file)}: ${result.stderr}`);
}
console.log('PASS all browser JavaScript parses.');
const wasm=readFileSync(join(dist,'game/pvz-portable.wasm'));
assert.equal(sha(wasm),'a6e1f8b5ed4293513f1919ff840d74f81b7420112bba08302b03969f82a06a46');
assert(WebAssembly.validate(wasm),'Engine WASM validates');
const glue=readFileSync(join(dist,'game/pvz-portable.js'),'utf8');
assert.equal(sha(glue),'4222ab8ec9b6cc49176fc55fae1aa08174487544a34cee3176907b92b08994d6');
const provenance=JSON.parse(readFileSync(join(dist,'game/engine-provenance.json'),'utf8'));
assert.equal(provenance.id,'0.2.6-web-ambush.1');
assert.equal(provenance.artifacts.jsSha256,sha(glue));
assert.equal(provenance.artifacts.wasmSha256,sha(wasm));
assert.equal(sha(readFileSync(join(dist,'source/pvz-portable-0.2.6-web-ambush.1-source.zip'))),provenance.artifacts.sourceSha256);
assert.equal(sha(readFileSync(join(dist,'source/web-ambush.1.patch'))),provenance.artifacts.patchSha256);
console.log('PASS pinned Vase Ambush engine, full corresponding source and patch provenance.');
const html=readFileSync(join(dist,'index.html'),'utf8');
for(const page of ['index.html','index-port.html'])assert(readFileSync(join(dist,page),'utf8').includes('href="./port.css?v=fullscreen2"'),`${page}: fullscreen shell styles bypass the earlier cache`);
for(const page of ['index.html','index-port.html'])assert(readFileSync(join(dist,page),'utf8').includes('<span id="engine-build-id">'+provenance.id+'</span>'),`${page}: displayed engine label must match the source manifest`);
const scriptPaths=[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match=>match[1]);
const scriptNames=scriptPaths.map(path=>path.split('?')[0]);
const engineScriptIndex=scriptPaths.findIndex(path=>path.split('?')[0]==='./game/pvz-portable.js');
assert(scriptPaths.indexOf('./audio-controls.js')>=0&&scriptPaths.indexOf('./audio-controls.js')<engineScriptIndex);
assert.equal(scriptPaths[engineScriptIndex],'./game/pvz-portable.js?v='+provenance.artifacts.jsSha256.slice(0,12));
assert(scriptNames.indexOf('./save-storage-core.js')>=0&&scriptNames.indexOf('./save-storage-core.js')<scriptNames.indexOf('./save-storage.js'),'Worker fallback core must load before the adapter');
assert(scriptNames.indexOf('./save-storage.js')<scriptNames.indexOf('./loader.js'),'Browser saves must be installed before startup');
for(const name of ['runtime.js','loader.js','save-storage-core.js','save-storage.js','save-recovery.js']){
  const version=['runtime.js','loader.js'].includes(name)?'ambush1':'polish1';
  for(const page of ['index.html','index-port.html'])assert(readFileSync(join(dist,page),'utf8').includes('src="./'+name+'?v='+version+'"'),`${page}: changed browser code must bypass the prior release cache`);
}
assert(scriptNames.indexOf('./save-transfer.js')>=0&&scriptNames.indexOf('./save-transfer.js')<scriptNames.indexOf('./loader.js'),'Save transfers must be available before loader controls');
assert(!html.includes('audio-lock.js'),'Permanent output lock is no longer loaded');
for(const path of scriptPaths){assert(!/^https?:/.test(path),'Runtime dependencies are local');assert(existsSync(resolve(dist,path.split('?')[0])),`Missing ${path}`);}
for(const id of ['canvas','pvz-soft-keyboard','drop-zone','retry-load','upload-save-import-btn','upload-save-import-dir-btn','upload-save-clear-btn','save-export-btn'])assert(html.includes(`id="${id}"`),`Missing shell element ${id}`);
for(const path of ['licenses/LGPL-3.0.txt','licenses/GPL-3.0.txt','licenses/JSZIP.txt','source/pvz-portable-0.2.6-source.zip'])assert(existsSync(join(dist,path)),`Missing corresponding source/license: ${path}`);
for(const file of walk(dist))assert(!/\.(exe|dll)$/i.test(file)&&!['qa-resources.zip','qa-upstream-compat.xml'].includes(file.split(/[\\/]/).pop()),'Native executable/private QA archives must stay outside the public tree');
assert.equal(provenance.gameAssetsIncluded,true,'User-approved hosted asset bundle must be documented');
assert(scriptPaths.indexOf('./bundled-assets.js')<scriptPaths.indexOf('./launcher.js'));
console.log('PASS local dependencies, fileless shell linkage, approved bundle provenance and native/private-data exclusion.');
const nodes=new Map();
const element=id=>{if(!nodes.has(id))nodes.set(id,{value:'',style:{},hidden:false,addEventListener(){},removeEventListener(){},setAttribute(){},removeAttribute(){},focus(){},click(){},classList:{add(){},remove(){},toggle(){},contains:()=>false}});return nodes.get(id);};
const environment=vm.createContext({document:{baseURI:'https://test.example/',getElementById:element,addEventListener(){},visibilityState:'visible'},console,Blob,TextEncoder,TextDecoder,URL,URLSearchParams,AbortController,crypto:webcrypto,fetch:()=>new Promise(()=>{}),indexedDB:{open:()=>({})},addEventListener(){},removeEventListener(){},setInterval:()=>1,clearInterval(){},setTimeout:()=>1,clearTimeout(){},requestAnimationFrame:()=>1,location:{search:'?testing=1',reload(){}}});
vm.runInContext('window=globalThis',environment);
for(const file of ['audio-controls.js','runtime.js','save-storage-core.js','save-storage.js','save-transfer.js','loader.js','bundled-assets.js','launcher.js'])vm.runInContext(readFileSync(join(dist,file),'utf8'),environment,{filename:file});
assert.equal(vm.runInContext('Module.locateFile("pvz-portable.wasm","/game/")',environment),'/game/pvz-portable.wasm?v='+provenance.artifacts.wasmSha256.slice(0,12));
const assetManifest=JSON.parse(readFileSync(join(dist,'game-assets/manifest.json'),'utf8'));
environment.PVZAssetBundle.validateManifest(assetManifest,'https://test.example/game-assets/manifest.json');
assert.equal(assetManifest.id,provenance.assetBundleId);
console.log('PASS actual shipping asset manifest validation and matching bundle identity.');
const pagesStaging=spawnSync(process.platform==='win32'?'python':'python3',[join(root,'tests/pages-staging.py')],{encoding:'utf8'});
if(pagesStaging.stdout)process.stdout.write(pagesStaging.stdout);
assert.equal(pagesStaging.status,0,pagesStaging.stderr);
for(const test of ['tests/audio-controls.mjs','tests/generator-fileless.mjs','tests/bundled-assets.mjs','tests/fileless-startup.mjs','tests/shell-keyboard.mjs','tests/fullscreen-controls.mjs','tests/save-storage.mjs','tests/save-worker.mjs','tests/save-recovery.mjs','tests/save-sync.mjs','tests/save-transfer.mjs','tests/zombatar-export.mjs','tests/steam-compat.mjs','tests/test-profile-merge.mjs','tests/native-content.mjs','tests/performance-baseline.mjs']){
  const result=spawnSync(process.execPath,[join(root,test)],{encoding:'utf8'});
  if(result.stdout)process.stdout.write(result.stdout);
  assert.equal(result.status,0,result.stderr);
}
console.log('All browser-port integration checks passed. This does not certify exhaustive 1:1 game parity.');
