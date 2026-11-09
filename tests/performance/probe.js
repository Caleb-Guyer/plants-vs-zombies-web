/* Local-only v2 scheduling/native-CPU/save-capture probe. Never public UI. */
(() => {
  'use strict';
  const nativeRAF=window.requestAnimationFrame.bind(window), now=()=>performance.now();
  const pageManifest=JSON.parse(document.getElementById('__pvz_perf_manifest').textContent);
  const loadedProbeSha256=document.currentScript.dataset.probeSha256;
  const contexts=[], originalGetContext=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type) {
    const context=originalGetContext.apply(this,arguments);
    if(context&&!contexts.some(x=>x.type===type&&x.canvasId===(this.id||null))) {
      const info={type,canvasId:this.id||null};
      if(typeof context.getParameter==='function') {
        info.version=context.getParameter(context.VERSION);info.renderer=context.getParameter(context.RENDERER);info.vendor=context.getParameter(context.VENDOR);
      }
      contexts.push(info);
    }
    return context;
  };
  let run=null,pending=false,timer,loop=null,originalRunIter=null,panel,status,label;
  const timedCallbacks=new WeakMap();
  function configureNative(mode) {
    HTMLCanvasElement.prototype.getContext=originalGetContext;
    if(!window.MainLoop||typeof MainLoop.runIter!=='function')return false;
    if(!loop){loop=MainLoop;originalRunIter=loop.runIter;}
    loop.runIter=originalRunIter;
    if(mode==='raf-only')return true;
    loop.runIter=function(func) {
      let timed=timedCallbacks.get(func);
      if(!timed) {
        timed=function(){
          const active=run?.recording&&run.mode==='native-raf'?run:null;
          if(!active)return func.apply(this,arguments);
          const start=now();try{return func.apply(this,arguments);}finally{active.samples.nativeCallbacks.push({at:start-active.startedAt,ms:now()-start});}
        };
        timedCallbacks.set(func,timed);
      }
      return originalRunIter.call(this,timed);
    };
    return true;
  }
  const mute=()=>document.getElementById('mute-btn')?.getAttribute('aria-pressed')==='true';
  const state=()=>({visibility:document.visibilityState,audioMuted:mute(),
    viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
    canvas:{width:Module.canvas.width,height:Module.canvas.height,cssWidth:Module.canvas.clientWidth,cssHeight:Module.canvas.clientHeight}});
  const relative=()=>now()-run.startedAt;
  document.addEventListener('visibilitychange',()=>{if(run?.recording)run.visibilityChanges.push({at:relative(),state:document.visibilityState});});
  window.addEventListener('resize',()=>{if(run?.recording)run.resizeChanges.push({at:relative(),viewport:state().viewport,canvas:state().canvas});});
  let audioObserver;
  function observeAudio(){
    if(audioObserver)return;
    const button=document.getElementById('mute-btn');
    if(button){audioObserver=new MutationObserver(()=>{if(run?.recording)run.audioChanges.push({at:relative(),muted:mute()});});audioObserver.observe(button,{attributes:true,attributeFilter:['aria-pressed']});}
  }
  let observer=null;
  function longTasks(entries,target){
    if(!target)return;
    const end=target.finishedAt??now();
    for(const e of entries)if(e.startTime>=target.startedAt&&e.startTime<end){
      const key=e.startTime+':'+e.duration;if(target.longTaskKeys.has(key))continue;target.longTaskKeys.add(key);
      target.longTasks.push({at:e.startTime-target.startedAt,ms:e.duration});
    }
  }
  try{observer=new PerformanceObserver(list=>{if(run?.recording)longTasks(list.getEntries(),run);});observer.observe({type:'longtask',buffered:false});}catch(_){observer=null;}
  window.PVZPerfProbeV2=Object.freeze({
    captureBegin(){return run?.recording&&run.mode==='native-raf'?{target:run,start:now()}:null;},
    captureEnd(token,entries){if(!token)return;const elapsed=now()-token.start;if(!token.target.recording)return;
      let bytes=0,files=0;for(const entry of entries||[])if(entry.kind==='file'){++files;bytes+=entry.data?.byteLength||0;}
      token.target.samples.saveCaptures.push({at:token.start-token.target.startedAt,ms:elapsed,bytes,files});}
  });
  const stats=values=>{const sorted=[...values].sort((a,b)=>a-b),q=p=>sorted.length?sorted[Math.ceil(sorted.length*p)-1]:0;
    return {samples:sorted.length,p50:q(.5),p95:q(.95),p99:q(.99),max:sorted.length?sorted[sorted.length-1]:0,
      over33:values.filter(x=>x>33.5).length,over50:values.filter(x=>x>50).length,over100:values.filter(x=>x>100).length};};
  async function manifest(){const response=await fetch('/__perf/manifest',{cache:'no-store'});if(!response.ok)throw Error('Capture manifest unavailable');return response.json();}
  function rafClock(timestamp){const active=run;if(!active?.recording)return;active.samples.rafTimestamps.push(timestamp);nativeRAF(rafClock);}
  async function finish(){
    const finished=run;if(!finished?.recording)return;
    clearTimeout(timer);finished.finishedAt=now();finished.recording=false;
    if(observer)longTasks(observer.takeRecords(),finished);
    if(loop)loop.runIter=originalRunIter;
    const endState=state(),captureEndManifest=await manifest();
    const timestamps=finished.samples.rafTimestamps,gaps=timestamps.slice(1).map((t,i)=>t-timestamps[i]);
    const summary={schemaVersion:2,kind:'actual-browser-rAF-scheduling-native-callback-and-save-capture-CPU',
      label:finished.label,mode:finished.mode,declaredScenario:finished.declaredScenario,
      measuredAt:new Date().toISOString(),startedAt:finished.startedAt,finishedAt:finished.finishedAt,
      elapsedMs:finished.finishedAt-finished.startedAt,requestedMs:finished.requestedMs,
      startState:finished.startState,endState,visibilityChanges:finished.visibilityChanges,audioChanges:finished.audioChanges,resizeChanges:finished.resizeChanges,
      pageManifest,loadedProbeSha256,captureStartManifest:finished.captureStartManifest,captureEndManifest,
      nativeHookAvailable:finished.nativeHookAvailable,contexts,longTaskObserverAvailable:!!observer,longTasks:finished.longTasks,
      samples:finished.samples,frameGapMs:stats(gaps),nativeCallbackMs:stats(finished.samples.nativeCallbacks.map(x=>x.ms)),
      saveCaptureMs:stats(finished.samples.saveCaptures.map(x=>x.ms)),
      averageObservedRAFHz:gaps.length?gaps.length*1000/gaps.reduce((a,b)=>a+b,0):null,
      limitations:'rAF scheduling is not native/delivered FPS or GPU completion. Native callback CPU excludes browser compositor/GPU completion. Capture CPU includes the full unchanged synchronous file walk and byte copies; it does not measure async worker/IndexedDB latency. Scenario/speed/crowd require caller fixture and screenshot evidence. raf-only restores original native callback and disables capture timing; it is an observer-overhead control.'};
    const response=await fetch('/__perf/results',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(summary)});
    if(!response.ok)throw Error('Measurement was not saved: HTTP'+response.status);
    const receipt=await response.json();panel.hidden=false;
    status.textContent=JSON.stringify({...receipt,frameGapMs:summary.frameGapMs,nativeCallbackMs:summary.nativeCallbackMs,saveCaptureMs:summary.saveCaptureMs},null,2);
  }
  document.addEventListener('DOMContentLoaded',()=>{
    panel=document.createElement('aside');panel.style.cssText='position:fixed;bottom:4px;left:4px;z-index:10000;max-width:360px;max-height:65vh;overflow:auto;background:#eee;color:#111;padding:6px;font:12px monospace';
    panel.innerHTML='<details><summary>Local performance v2</summary><label>Label <input id="perf-label" value="v2-paused20-1x-native"></label><label>Seconds <input id="perf-seconds" type="number" value="15" min="10" max="60"></label><label>Probe <select id="perf-mode"><option value="native-raf">Native CPU + rAF + capture CPU</option><option value="raf-only">rAF clock only (overhead control)</option></select></label><label>Scenario <select id="perf-phase"><option>paused</option><option>active</option><option>menu</option></select></label><label>Crowd <select id="perf-crowd"><option>20</option><option>40</option></select></label><label>Speed <select id="perf-speed"><option>1</option><option>2</option></select></label><button id="perf-start">Measure v2</button><pre id="perf-status">Pause, arm, then resume if measuring active play. Starts after2seconds; no GL or per-FS wrappers.</pre></details>';
    document.body.append(panel);status=panel.querySelector('#perf-status');label=panel.querySelector('#perf-label');
    panel.querySelector('#perf-start').onclick=async()=>{
      try{
        if(pending||run?.recording)throw Error('A measurement is already armed/running');
        const name=label.value,requestedMs=Number(panel.querySelector('#perf-seconds').value)*1000;
        if(!/^v2-[a-zA-Z0-9_-]{1,76}$/.test(name))throw Error('Use a unique v2- label');
        if(!(requestedMs>=10000&&requestedMs<=60000))throw Error('Measure10to60seconds');
        if(!window.Module?.FS)throw Error('Load native game first');
        const mode=panel.querySelector('#perf-mode').value,declaredScenario={phase:panel.querySelector('#perf-phase').value,speed:Number(panel.querySelector('#perf-speed').value),crowd:Number(panel.querySelector('#perf-crowd').value)};
        const nativeHookAvailable=configureNative(mode);observeAudio();pending=true;panel.hidden=true;
        setTimeout(async()=>{try{
          const captureStartManifest=await manifest();
          run={label:name,mode,declaredScenario,requestedMs,nativeHookAvailable,captureStartManifest,recording:true,startedAt:now(),startState:state(),
            samples:{rafTimestamps:[],nativeCallbacks:[],saveCaptures:[]},longTasks:[],longTaskKeys:new Set(),visibilityChanges:[],audioChanges:[],resizeChanges:[]};
          pending=false;nativeRAF(rafClock);timer=setTimeout(()=>finish().catch(error=>{panel.hidden=false;status.textContent=error.message;}),requestedMs);
        }catch(error){pending=false;panel.hidden=false;status.textContent=error.message;}},2000);
      }catch(error){status.textContent=error.message;}
    };
  });
})();
