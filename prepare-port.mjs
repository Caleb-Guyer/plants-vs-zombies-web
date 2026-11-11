import {readFile,writeFile} from 'node:fs/promises';
const upstream=await readFile('dist/source/upstream-browser-shell.html.txt','utf8');
const engine=JSON.parse(await readFile('dist/game/engine-provenance.json','utf8'));
const scripts=[...upstream.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match=>match[1]);
if(scripts.length!==2)throw new Error('Unexpected upstream shell; inspect before integrating.');
const notice='/* PvZ-Portable web shell, Copyright (C) 2026 Zhou Qiankang.\n * LGPL-3.0-or-later. Adapted from 0.2.6; corresponding source in /source/.\n * The current engine build is documented in /game/engine-provenance.json.\n */\n';
const assetRevision=engine.artifacts.wasmSha256.slice(0,12);
// A creation-time advisory hint, scoped to the actual game canvas. The browser
// still selects the device; this neither changes native rendering nor OS settings.
function preferGameCanvasGPU(canvas) {
  'use strict';
  if(!canvas)return;
  const own=Object.getOwnPropertyDescriptor(canvas,'getContext');
  if(own&&(!('value' in own)||(!own.configurable&&!own.writable)))return;
  if(!own&&!Object.isExtensible(canvas))return;
  const original=canvas.getContext;
  if(typeof original!=='function')return;
  let completed=false,installed;
  function createContext(type,attributes) {
    if(completed||this!==canvas||!['webgl','webgl2','experimental-webgl'].includes(type))return Reflect.apply(original,this,arguments);
    let forwarded=arguments;
    if(attributes==null||typeof attributes==='object'||typeof attributes==='function') {
      const requested=attributes??Object.create(null);
      const hinted=new Proxy(Object.create(null),{get(_target,key) {
        // Let native WebIDL dictionary reads retain their order, getter receiver,
        // conversion and errors. Only valid primitive preferences are overridden.
        const value=Reflect.get(requested,key,requested);
        return key==='powerPreference'&&(value===undefined||value==='default'||value==='low-power'||value==='high-performance')?'high-performance':value;
      }});
      forwarded=Array.from(arguments);forwarded[1]=hinted;
    }
    const context=Reflect.apply(original,this,forwarded);
    if(context) {
      completed=true;
      try {
        const current=Object.getOwnPropertyDescriptor(canvas,'getContext');
        if(current?.value===createContext&&current.writable===installed?.writable&&
          current.enumerable===installed?.enumerable&&current.configurable===installed?.configurable) {
          if(own)Object.defineProperty(canvas,'getContext',own);
          else delete canvas.getContext;
        }
      }catch{ /* Cleanup must not replace a successful native context result. */ }
    }
    return context;
  }
  try {
    Object.defineProperty(canvas,'getContext',own?{...own,value:createContext}:{value:createContext,writable:true,configurable:true});
    installed=Object.getOwnPropertyDescriptor(canvas,'getContext');
  }catch{ /* Leave protected canvases and native context creation unchanged. */ }
}
await writeFile('dist/runtime.js',notice+scripts[0]+';\n('+preferGameCanvasGPU.toString()+')(Module.canvas);\nModule.locateFile=function(name,prefix){return (prefix||"./game/")+name+"?v='+assetRevision+'";};\n');
const startHook='await ensureSaveFsReady(),document.body';
if(scripts[1].split(startHook).length!==2)throw new Error('Unexpected upstream start sequence; inspect before integrating.');
function replaceOnce(source, before, after) {
  if(source.split(before).length!==2)throw new Error('Unexpected upstream shell segment: '+before.slice(0,80));
  return source.replace(before,after);
}
function replaceBetween(source, start, end, replacement) {
  if(source.split(start).length!==2||source.split(end).length!==2)throw new Error('Unexpected upstream shell function: '+start);
  const first=source.indexOf(start),last=source.indexOf(end,first);
  if(last<first)throw new Error('Unexpected upstream shell function order.');
  return source.slice(0,first)+replacement+'\n'+source.slice(last);
}
let loader=scripts[1].replace(startHook,'await ensureSaveFsReady(),await window.beforePvZStart?.(),document.body')
  .replace('Preparing WebAssembly runtime…','Loading game…').replace('Writing resources… ','Loading game files… ');
// Hosted assets load automatically. Keep the native startup/save machinery,
// while removing the original folder/ZIP/drop selection surface and handlers.
loader=replaceBetween(loader,'"use strict";const collectedFiles=','function resizeCanvas(){',`"use strict";
const collectedFiles=new Map();
let savesMounted=false,gameStarted=false,saveSyncIntervalId=null,saveSyncInFlight=null,saveSyncQueued=false,lastSaveSyncAt=0,saveFsReadyPromise=null;
const SAVE_SYNC_INTERVAL_MS=5000,SAVE_CLOSE_WARNING_MS=7000;
const dropZone=document.getElementById('drop-zone'),loadStatus=document.getElementById('loading-drop-zone');
const uploadSaveImportBtn=document.getElementById('upload-save-import-btn'),uploadSaveImportDirBtn=document.getElementById('upload-save-import-dir-btn'),uploadSaveClearBtn=document.getElementById('upload-save-clear-btn');
const uploadSaveImportInput=document.getElementById('upload-save-import-input'),uploadSaveImportDirInput=document.getElementById('upload-save-import-dir-input');
let runtimeReloadScheduled=false;
function refreshUI(){}
`);
loader=replaceBetween(loader,'dropZone.addEventListener("dragover"','window.addEventListener("fullscreenchange",resizeCanvas)','');
loader=replaceOnce(loader,'catch(e){console.error("Failed to start game:",e),','catch(e){gameStarted=false;console.error("Failed to start game:",e),');
// The official release omits its requested IDBFS library. Do not treat an
// undefined backend or a failed populate as successful persistence.
loader=replaceBetween(loader,'async function ensureSaveFsReady(){','async function syncSaves(){',`let saveMountReady=false;
async function ensureSaveFsReady(){
  if(!saveFsReadyPromise){
    saveFsReadyPromise=(async()=>{
      await window.moduleReadyPromise;
      const FS=Module.FS;
      if(!saveMountReady){
        try{FS.mkdir('/saves');}catch(error){if(!FS.isDir(FS.stat('/saves').mode))throw error;}
        const adapter=window.PVZSaveStorage?.install(FS);
        if(!adapter?.fallback){
          if(!FS.filesystems?.IDBFS)throw new Error('Browser save storage did not load. Refresh the page to retry.');
          FS.mount(FS.filesystems.IDBFS,{},'/saves');
        }
        saveMountReady=true;
      }
      await new Promise((resolve,reject)=>FS.syncfs(true,error=>error?reject(error):resolve()));
      savesMounted=true;
      lastSaveSyncAt=Date.now();
    })().catch(error=>{saveFsReadyPromise=null;savesMounted=false;throw error;});
  }
  return saveFsReadyPromise;
}`);
// Every caller waits for all flushes requested while its shared worker runs.
// A rejected flush remains visible to foreground callers and permits retry.
loader=replaceBetween(loader,'async function syncSaves(){','function startSaveAutosync()',`async function syncSaves(){
  if(!canSyncSaves())return;
  saveSyncQueued=true;
  if(!saveSyncInFlight){
    saveSyncInFlight=(async()=>{
      try{
        while(saveSyncQueued){
          saveSyncQueued=false;
          await new Promise((resolve,reject)=>Module.FS.syncfs(false,error=>{
            if(error){reject(error);return;}
            lastSaveSyncAt=Date.now();
            resolve();
          }));
        }
      }finally{saveSyncInFlight=null;}
    })();
  }
  return saveSyncInFlight;
}
function syncSavesInBackground(){
  void syncSaves().catch(error=>console.warn('IDBFS background persist error:',error));
}`);
loader=replaceOnce(loader,'window.setInterval(()=>{syncSaves()},5e3)','window.setInterval(()=>{syncSavesInBackground()},5e3)');
loader=replaceOnce(loader,'"hidden"===document.visibilityState&&syncSaves()','"hidden"===document.visibilityState&&syncSavesInBackground()');
loader=replaceOnce(loader,'window.addEventListener("pagehide",()=>{syncSaves()})','window.addEventListener("pagehide",()=>{syncSavesInBackground()})');
loader=replaceOnce(loader,'gameStarted&&(syncSaves(),Date.now()','gameStarted&&(syncSavesInBackground(),Date.now()');
// The engine normally finishes a native sync first. This final awaited flush
// also covers its !mRunning exit path and any pending loader writes.
const exitStart='window.onGameExit=function(){';
if(loader.split(exitStart).length!==2||!loader.trimEnd().endsWith('}'))throw new Error('Unexpected upstream exit handler.');
loader=loader.slice(0,loader.indexOf(exitStart))+`window.onGameExit=async function(){
  if(runtimeReloadScheduled)return;
  runtimeReloadScheduled=true;
  gameStarted=false;
  if(saveSyncIntervalId!==null){clearInterval(saveSyncIntervalId);saveSyncIntervalId=null;}
  if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
  document.getElementById('game-viewport').style.display='none';
  document.getElementById('upload-screen').style.display='';
  document.body.classList.remove('game-mode');
  document.body.classList.add('upload-mode');
  window.removeEventListener('resize',resizeCanvas);
  dropZone.classList.remove('loading');
  dropZone.style.pointerEvents='';
  collectedFiles.clear();
  refreshUI();
  loadStatus.textContent='Saving game…';
  loadStatus.classList.remove('has-error');
  loadStatus.style.display='block';
  try{
    await syncSaves();
    loadStatus.textContent='Restarting game…';
    window.setTimeout(()=>window.location.reload(),0);
  }catch(error){
    runtimeReloadScheduled=false;
    console.warn('IDBFS final persist error:',error);
    loadStatus.classList.add('has-error');
    loadStatus.textContent='Your saves could not be stored. Keep this page open and try again. ';
    const retry=document.createElement('button');
    retry.type='button';retry.className='text-button';retry.textContent='Retry saving';
    retry.addEventListener('click',event=>{event.stopPropagation();void window.onGameExit();});
    loadStatus.appendChild(retry);
  }
}\n`;
// The native fullscreen target also contains browser controls. Hide only the
// inner game viewport during startup/error/save management, keeping those
// controls and modal focus targets available in every shell state.
loader=replaceOnce(loader,'document.getElementById("canvas-container").style.display="flex"','document.getElementById("game-viewport").style.display="flex"');
loader=replaceOnce(loader,'document.getElementById("canvas-container").style.display="none"','document.getElementById("game-viewport").style.display="none"');
// Transfer native bytes without losing the root registry or misrouting wrapped
// userdata directories. Persistence/exit routines above remain independent.
loader=replaceBetween(loader,'async function exportSaves(){','async function importSaves(',`async function exportSaves(){
  const button=document.getElementById('save-export-btn');
  const previous=button.textContent;
  button.disabled=true;button.textContent='Exporting…';
  try{
    await ensureSaveFsReady();
    try{await syncSaves();}catch(error){console.warn('Save persistence failed; exporting live saved data:',error);}
    const blob=await PVZSaveTransfer.exportZip(Module.FS,JSZip,{type:'blob'});
    const anchor=document.createElement('a'),url=URL.createObjectURL(blob);
    anchor.href=url;anchor.download='pvz-portable-savedata.zip';anchor.click();
    window.setTimeout(()=>URL.revokeObjectURL(url),0);
  }catch(error){console.error('Export failed:',error);alert('Export failed: '+error.message);}
  finally{button.disabled=false;button.textContent=previous;}
}`);
loader=replaceBetween(loader,'async function importSaves(','async function importSaveDirectory(',`async function importSaves(file,button){
  const previous=button.textContent;
  const status=document.getElementById('save-import-status');
  status.hidden=false;status.textContent='Importing saves...';
  button.disabled=true;button.textContent='Importing…';
  try{
    await ensureSaveFsReady();
    await PVZSaveTransfer.importZip(Module.FS,JSZip,file,()=>syncSaves());
    status.textContent='Save imported. Close controls to continue.';
  }catch(error){status.textContent='Save import failed. Please try again.';console.error('Import failed:',error);alert('Import failed: '+error.message);}
  finally{button.disabled=false;button.textContent=previous;window.onSaveOperationFinished?.();}
}`);
loader=replaceBetween(loader,'async function importSaveDirectory(','async function clearSaves(',`async function importSaveDirectory(files,button){
  const previous=button.textContent;
  const status=document.getElementById('save-import-status');
  status.hidden=false;status.textContent='Importing saves...';
  button.disabled=true;button.textContent='Importing…';
  try{
    await ensureSaveFsReady();
    await PVZSaveTransfer.importFiles(Module.FS,files,()=>syncSaves());
    status.textContent='Save imported. Close controls to continue.';
  }catch(error){status.textContent='Save import failed. Please try again.';console.error('Save folder import failed:',error);alert('Import failed: '+error.message);}
  finally{button.disabled=false;button.textContent=previous;window.onSaveOperationFinished?.();}
}`);
loader=replaceOnce(loader,'finally{e.disabled=!1,e.textContent=t}}','finally{e.disabled=!1,e.textContent=t;window.onSaveOperationFinished?.()}}');
// Explicit clear-all also removes automatic history after the cleared current
// save commits. Ordinary saves and imports retain their recoverable history.
loader=replaceOnce(loader,'a("/saves"),await syncSaves(),alert("All save data has been cleared.")',
  'a("/saves"),await syncSaves(),await window.PVZSaveStorage?.install(Module.FS).purgeRecoveryHistory?.(),alert("All save data has been cleared.")');
await writeFile('dist/loader.js',notice+loader);
await writeFile('dist/game/VERSION',`PvZ-Portable ${engine.id}\n${engine.change}\nEngine JavaScript SHA-256: ${engine.artifacts.jsSha256}\nEngine WASM SHA-256: ${engine.artifacts.wasmSha256}\nCorresponding modified source and build record: ../source/\nOriginal JPEG equivalence and full game parity remain unverified.\n`);
const sourceHref='./source/'+engine.artifacts.source.split('/').at(-1);
for(const path of ['dist/index.html','dist/index-port.html']){
  const html=await readFile(path,'utf8');
  if(/id="(?:file-input|resource-zip-input|browse-folder-btn|browse-zip-btn|files-btn|cache-forget)"/.test(html))throw new Error('Fileless browser shell input required: '+path);
  if(!html.includes('<script src="./bundled-assets.js"></script>'))throw new Error('Bundled asset loader missing from '+path);
  const revised=html.replace(/src="\.\/game\/pvz-portable\.js(?:\?v=[^"]*)?"/,'src="./game/pvz-portable.js?v='+engine.artifacts.jsSha256.slice(0,12)+'"')
    .replace(/href="\.\/port\.css(?:\?v=[^"]*)?"/,'href="./port.css?v=fullscreen2"')
    .replace(/src="\.\/(runtime|loader)\.js(?:\?v=[^"]*)?"/g,'src="./$1.js?v=torch1"')
    .replace(/href="\.\/source\/[^"]+" download>Engine source/,'href="'+sourceHref+'" download>Engine source')
    .replace(/(<span id="engine-build-id">)[^<]*(<\/span>)/,'$1'+engine.id+'$2')
    .replace(/(<span id="engine-build-id">[^<]*<\/span>)[^<]*(?= © 2026)/,'$1 '+engine.caption);
  if(revised===html&&!html.includes('pvz-portable.js?v='+engine.artifacts.jsSha256.slice(0,12)))throw new Error('Engine script missing from '+path);
  if(!revised.includes('href="'+sourceHref+'" download>Engine source'))throw new Error('Matching engine source link missing from '+path);
  if(!revised.includes('<span id="engine-build-id">'+engine.id+'</span>'))throw new Error('Matching engine label missing from '+path);
  await writeFile(path,revised);
}
console.log('Browser shell regenerated with versioned engine asset URLs.');
