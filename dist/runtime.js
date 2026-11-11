/* PvZ-Portable web shell, Copyright (C) 2026 Zhou Qiankang.
 * LGPL-3.0-or-later. Adapted from 0.2.6; corresponding source in /source/.
 * The current engine build is documented in /game/engine-provenance.json.
 */
window.moduleReadyPromise=new Promise(function(n,e){window._resolveModuleReady=n,window._rejectModuleReady=e});var Module={canvas:document.getElementById("canvas"),noInitialRun:!0,onRuntimeInitialized:function(){window._resolveModuleReady()},onAbort:function(n){window._rejectModuleReady(new Error(n))},print:function(n){console.log(n)},printErr:function(n){console.warn(n)}};Module.canvas.addEventListener("contextmenu",function(n){n.preventDefault()});
(function preferGameCanvasGPU(canvas) {
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
})(Module.canvas);
Module.locateFile=function(name,prefix){return (prefix||"./game/")+name+"?v=7fa8c0a42b32";};
