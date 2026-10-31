/* PvZ-Portable web shell, Copyright (C) 2026 Zhou Qiankang.
 * LGPL-3.0-or-later. Adapted from 0.2.6; corresponding source in /source/.
 * The current engine build is documented in /game/engine-provenance.json.
 */
"use strict";
const collectedFiles=new Map();
let savesMounted=false,gameStarted=false,saveSyncIntervalId=null,saveSyncInFlight=null,saveSyncQueued=false,lastSaveSyncAt=0,saveFsReadyPromise=null;
const SAVE_SYNC_INTERVAL_MS=5000,SAVE_CLOSE_WARNING_MS=7000;
const dropZone=document.getElementById('drop-zone'),loadStatus=document.getElementById('loading-drop-zone');
const uploadSaveImportBtn=document.getElementById('upload-save-import-btn'),uploadSaveImportDirBtn=document.getElementById('upload-save-import-dir-btn'),uploadSaveClearBtn=document.getElementById('upload-save-clear-btn');
const uploadSaveImportInput=document.getElementById('upload-save-import-input'),uploadSaveImportDirInput=document.getElementById('upload-save-import-dir-input');
let runtimeReloadScheduled=false;
function refreshUI(){}

function resizeCanvas(){var e=document.getElementById("canvas"),t=document.getElementById("canvas-container"),n=t.clientWidth,a=t.clientHeight,o=Math.min(n/e.width,a/e.height);e.style.width=Math.floor(e.width*o)+"px",e.style.height=Math.floor(e.height*o)+"px"}function canSyncSaves(){return savesMounted&&Module.FS&&"function"==typeof Module.FS.syncfs}let saveMountReady=false;
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
}
async function syncSaves(){
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
}
function startSaveAutosync(){null===saveSyncIntervalId&&(saveSyncIntervalId=window.setInterval(()=>{syncSavesInBackground()},5e3))}async function startGame(){dropZone.classList.remove("ready"),dropZone.classList.add("loading"),dropZone.style.pointerEvents="none",loadStatus.style.display="block",loadStatus.classList.remove("has-error");try{loadStatus.textContent="Loading game…",await window.moduleReadyPromise;const e=Array.from(collectedFiles.entries());let t=0;const n=e.reduce((e,[,t])=>e+t.size,0);for(let a=0;a<e.length;a++){const[o,s]=e[a];loadStatus.textContent="Loading game files… "+(a+1)+"/"+e.length+", "+(t/1048576).toFixed(1)+"/"+(n/1048576).toFixed(1)+" MiB";const r=new Uint8Array(await s.arrayBuffer()),i=o.split("/");let l="/";for(let e=0;e<i.length-1;e++){l+=("/"===l?"":"/")+i[e];try{Module.FS.mkdir(l)}catch(e){}}Module.FS.writeFile("/"+o,r),t+=s.size,(a+1)%4==0&&await new Promise(e=>setTimeout(e,0))}loadStatus.textContent="Restoring saved data…",await ensureSaveFsReady(),await window.beforePvZStart?.(),document.body.classList.remove("upload-mode"),document.body.classList.add("game-mode"),document.getElementById("upload-screen").style.display="none",document.getElementById("canvas-container").style.display="flex",resizeCanvas(),window.addEventListener("resize",resizeCanvas),loadStatus.style.display="none",gameStarted=!0,lastSaveSyncAt=Date.now(),startSaveAutosync(),Module.callMain([])}catch(e){gameStarted=false;console.error("Failed to start game:",e),loadStatus.textContent="Error: "+(e.message||e),loadStatus.classList.add("has-error"),document.getElementById("canvas-container").style.display="none",document.getElementById("upload-screen").style.display="",document.body.classList.remove("game-mode"),document.body.classList.add("upload-mode"),dropZone.classList.remove("loading"),dropZone.classList.add("ready"),dropZone.style.pointerEvents=""}}function collectSaveFiles(e){const t=[];let n;try{n=Module.FS.readdir(e)}catch(e){return t}for(const a of n){if("."===a||".."===a)continue;const n=e+"/"+a,o=Module.FS.stat(n);Module.FS.isDir(o.mode)?t.push(...collectSaveFiles(n)):t.push(n)}return t}async function exportSaves(){
  const button=document.getElementById('save-export-btn');
  const previous=button.textContent;
  button.disabled=true;button.textContent='Exporting…';
  try{
    await ensureSaveFsReady();await syncSaves();
    const blob=await PVZSaveTransfer.exportZip(Module.FS,JSZip,{type:'blob'});
    const anchor=document.createElement('a'),url=URL.createObjectURL(blob);
    anchor.href=url;anchor.download='pvz-portable-savedata.zip';anchor.click();
    window.setTimeout(()=>URL.revokeObjectURL(url),0);
  }catch(error){console.error('Export failed:',error);alert('Export failed: '+error.message);}
  finally{button.disabled=false;button.textContent=previous;}
}
async function importSaves(file,button){
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
}
async function importSaveDirectory(files,button){
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
}
async function clearSaves(e){if(await ensureSaveFsReady(),!confirm("This will permanently delete ALL save data from your browser.\nThis cannot be undone. Continue?"))return;e.disabled=!0;const t=e.textContent;e.textContent="⏳ Clearing…";try{const n=collectSaveFiles("/saves");for(const o of n)try{Module.FS.unlink(o)}catch(s){}function a(e){let t;try{t=Module.FS.readdir(e)}catch(e){return}for(const n of t){if("."===n||".."===n)continue;const t=e+"/"+n;try{const e=Module.FS.stat(t);Module.FS.isDir(e.mode)&&a(t)}catch(e){}}if("/saves"!==e)try{Module.FS.rmdir(e)}catch(e){}}a("/saves"),await syncSaves(),await window.PVZSaveStorage?.install(Module.FS).purgeRecoveryHistory?.(),alert("All save data has been cleared.")}catch(r){console.error("Clear failed:",r),alert("Clear failed: "+r.message)}finally{e.disabled=!1,e.textContent=t;window.onSaveOperationFinished?.()}}
window.addEventListener("fullscreenchange",resizeCanvas),document.getElementById("save-export-btn").addEventListener("click",exportSaves),uploadSaveImportBtn.addEventListener("click",()=>{uploadSaveImportInput.click()}),uploadSaveImportInput.addEventListener("change",e=>{const t=e.target.files[0];t&&importSaves(t,uploadSaveImportBtn),e.target.value=""}),uploadSaveImportDirBtn.addEventListener("click",()=>{uploadSaveImportDirInput.click()}),uploadSaveImportDirInput.addEventListener("change",async e=>{const t=e.target.files;t&&t.length>0&&await importSaveDirectory(t,uploadSaveImportDirBtn),e.target.value=""}),uploadSaveClearBtn.addEventListener("click",()=>{clearSaves(uploadSaveClearBtn)}),document.addEventListener("visibilitychange",()=>{"hidden"===document.visibilityState&&syncSavesInBackground()}),window.addEventListener("pagehide",()=>{syncSavesInBackground()}),window.addEventListener("beforeunload",e=>{gameStarted&&(syncSavesInBackground(),Date.now()-lastSaveSyncAt>=7e3&&(e.preventDefault(),e.returnValue="Recent save data may still be syncing. Wait a moment or export saves before leaving."))}),window.onGameExit=async function(){
  if(runtimeReloadScheduled)return;
  runtimeReloadScheduled=true;
  gameStarted=false;
  if(saveSyncIntervalId!==null){clearInterval(saveSyncIntervalId);saveSyncIntervalId=null;}
  if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
  document.getElementById('canvas-container').style.display='none';
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
}
