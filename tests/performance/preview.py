"""Serve dist read-only with developer-only browser CPU/scheduling probes.

New captures use this portable server hash. recorded-preview.py preserves the
historical recorder bytes; it is a provenance artifact, not the portable CLI.
"""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from urllib.parse import urlsplit,parse_qs
import argparse,hashlib,json,re

tool_root=Path(__file__).resolve().parent
repo=Path(__file__).resolve().parents[2]
# Assigned only by the CLI. Neither source files nor dist are rewritten.
root=None
dist=None
sha=lambda data:hashlib.sha256(data).hexdigest()
SERVER_SHA=sha(Path(__file__).read_bytes())
CAPTURE_START='    function capture() {\n'
CAPTURE_END='    function replaceFiles(entries) {'

def instrument_save(data):
    text=data.decode('utf-8');assert text.count(CAPTURE_START)==text.count(CAPTURE_END)==1
    start=text.index(CAPTURE_START);end=text.index(CAPTURE_END,start)
    chunk=text[start:end];close='    }\n'
    assert chunk.endswith(close) and chunk.count('return entries;')==1
    body=chunk[len(CAPTURE_START):-len(close)]
    body=body.replace('return entries;','__pvzPerfEntries = entries; return entries;',1)
    replacement=(CAPTURE_START+'      const __pvzPerfToken = globalThis.PVZPerfProbeV2?.captureBegin();\n'
      '      let __pvzPerfEntries;\n      try {\n'+body+
      '      } finally { globalThis.PVZPerfProbeV2?.captureEnd(__pvzPerfToken, __pvzPerfEntries); }\n'+close)
    return (text[:start]+replacement+text[end:]).encode('utf-8')

def manifest():
    engine=json.loads((dist/'game/engine-provenance.json').read_text());probe=(tool_root/'probe.js').read_bytes()
    paths=set(p.name for p in dist.glob('*.js'))|set(p.name for p in dist.glob('*.css'))
    paths|={'index.html','game/pvz-portable.js','game/pvz-portable.wasm','game/engine-provenance.json','game-assets/manifest.json'}
    files={}
    for name in sorted(paths):
        base=(dist/name).read_bytes();served=instrument_save(base) if name=='save-storage.js' else base
        files[name]={'baseSha256':sha(base),'servedSha256':sha(served),'baseBytes':len(base),'servedBytes':len(served)}
    glue=(dist/'game/pvz-portable.js').read_text()
    supported='var MainLoop=' in glue and 'MainLoop.runIter(iterFunc)' in glue and 'runIter(func)' in glue and 'callUserCallback(func)' in glue
    return {'schemaVersion':2,'engineId':engine['id'],'engineWasmSha256':files['game/pvz-portable.wasm']['baseSha256'],
      'engineWasmMatchesMetadata':files['game/pvz-portable.wasm']['baseSha256']==engine['artifacts']['wasmSha256'],
      'serverSha256':SERVER_SHA,'serverFileMatchesRunningCode':sha(Path(__file__).read_bytes())==SERVER_SHA,
      'probeSha256':sha(probe),'saveStorageBaseSha256':files['save-storage.js']['baseSha256'],
      'saveStorageServedSha256':files['save-storage.js']['servedSha256'],'files':files,
      'nativeHook':{'supported':supported,'global':'MainLoop','method':'runIter','source':'MainLoop.runIter(iterFunc) / callUserCallback(func)'},
      'htmlInstrumentation':'Original index bytes are pinned; local JSON manifest/probe tags are added before other head content.'}

class Preview(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control','no-store');super().end_headers()
    def respond(self,data,mime,status=200):
        self.send_response(status);self.send_header('Content-Type',mime);self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
    def do_GET(self):
        url=urlsplit(self.path);path=url.path
        if path=='/__perf/manifest':return self.respond(json.dumps(manifest(),sort_keys=True).encode(),'application/json')
        if path=='/__perf/probe.js':
            data=(tool_root/'probe.js').read_bytes();version=parse_qs(url.query).get('v',[None])[0]
            if version and version!=sha(data):return self.send_error(409,'Probe changed; reload the page')
            return self.respond(data,'text/javascript')
        if path=='/save-storage.js':return self.respond(instrument_save((dist/'save-storage.js').read_bytes()),'text/javascript')
        if path in ('/','/index.html'):
            current=manifest();encoded=json.dumps(current,sort_keys=True).replace('<','\\u003c')
            injection=(f'<script id="__pvz_perf_manifest" type="application/json">{encoded}</script>'
              f'<script src="/__perf/probe.js?v={current["probeSha256"]}" data-probe-sha256="{current["probeSha256"]}"></script>').encode()
            original=(dist/'index.html').read_bytes();assert original.count(b'<head>')==1
            return self.respond(original.replace(b'<head>',b'<head>'+injection,1),'text/html')
        return super().do_GET()
    def do_POST(self):
        if self.path!='/__perf/results':return self.send_error(404)
        length=int(self.headers.get('Content-Length',0))
        if not 0<length<3000000:return self.send_error(400)
        try:result=json.loads(self.rfile.read(length));name=result['label']
        except Exception:return self.send_error(400)
        if not isinstance(name,str) or not re.fullmatch(r'v2-[a-zA-Z0-9_-]{1,76}',name):return self.send_error(400,'Unique v2 label required')
        target=root/'measurements'/(name+'.json');target.parent.mkdir(exist_ok=True)
        if target.exists():return self.send_error(409,'Use a unique v2 measurement label')
        current=manifest();errors=[]
        def require(condition,message):
            if not condition:errors.append(message)
        require(result.get('schemaVersion')==2,'Wrong measurement schema')
        require(result.get('mode') in ('native-raf','raf-only'),'Unknown observation mode')
        require(result.get('pageManifest')==result.get('captureStartManifest')==result.get('captureEndManifest')==current,'Served files changed or page was not reloaded before capture')
        require(result.get('loadedProbeSha256')==current['probeSha256'],'Loaded probe differs from capture manifest')
        require(current['serverFileMatchesRunningCode'],'Restart local server after editing it')
        require(current['engineWasmMatchesMetadata'],'Engine binary differs from metadata')
        start=result.get('startState',{});end=result.get('endState',{})
        require(start.get('visibility')==end.get('visibility')=='visible' and not result.get('visibilityChanges'),'Hidden/visibility-changing measurement')
        require(start.get('audioMuted') is True and end.get('audioMuted') is True and not result.get('audioChanges'),'Unmuted/audio-changing measurement')
        require(start.get('viewport')==end.get('viewport') and start.get('canvas')==end.get('canvas') and not result.get('resizeChanges'),'Viewport/canvas changed during capture')
        scenario=result.get('declaredScenario',{});require(scenario.get('phase') in ('paused','active','menu') and scenario.get('speed') in (1,2) and scenario.get('crowd') in (20,40),'Scenario declaration invalid')
        samples=result.get('samples',{});require(len(samples.get('rafTimestamps',[]))>=2,'Missing rAF scheduling samples')
        if result.get('mode')=='native-raf':require(result.get('nativeHookAvailable') is True and len(samples.get('nativeCallbacks',[]))>0,'Actual native callback hook unavailable/empty')
        require(10000<=result.get('requestedMs',0)<=60000 and result.get('elapsedMs',0)>0,'Invalid measurement duration')
        result['status']='FAIL measurement preconditions' if errors else 'PASS measurement preconditions; not a performance-budget verdict'
        result['validationErrors']=errors;result['serverManifestAtReceipt']=current
        target.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
        return self.respond(json.dumps({'status':result['status'],'validationErrors':errors,'file':str(target.relative_to(root))}).encode(),'application/json',201)

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dist',type=Path,default=repo/'dist',help='Existing game dist; served read-only')
    parser.add_argument('--output',type=Path,default=repo/'outputs/performance',help='Separate directory for measurement JSON')
    parser.add_argument('--port',type=int,default=4241)
    args=parser.parse_args();dist=args.dist.resolve();root=args.output.resolve()
    if not dist.is_dir():parser.error('--dist must be an existing game distribution directory')
    if root.is_relative_to(dist) or dist.is_relative_to(root):parser.error('--output and --dist must be separate, nonoverlapping directories')
    (root/'measurements').mkdir(parents=True,exist_ok=True)
    assert manifest()['nativeHook']['supported'],'Unsupported generated native main-loop glue'
    print(f'Developer-only muted performance v2: http://127.0.0.1:{args.port}/?testing=1',flush=True)
    print(f'Results: {root / "measurements"}; dist remains read-only',flush=True)
    ThreadingHTTPServer(('127.0.0.1',args.port),partial(Preview,directory=str(dist))).serve_forever()
