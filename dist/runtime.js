/* PvZ-Portable web shell, Copyright (C) 2026 Zhou Qiankang.
 * LGPL-3.0-or-later. Adapted from 0.2.6; corresponding source in /source/.
 * The current engine build is documented in /game/engine-provenance.json.
 */
window.moduleReadyPromise=new Promise(function(n,e){window._resolveModuleReady=n,window._rejectModuleReady=e});var Module={canvas:document.getElementById("canvas"),noInitialRun:!0,onRuntimeInitialized:function(){window._resolveModuleReady()},onAbort:function(n){window._rejectModuleReady(new Error(n))},print:function(n){console.log(n)},printErr:function(n){console.warn(n)}};Module.canvas.addEventListener("contextmenu",function(n){n.preventDefault()})
Module.locateFile=function(name,prefix){return (prefix||"./game/")+name+"?v=c92b05020b84";};
