// Isolated web-development QA on the dedicated muted headless Chrome only.
// No general JavaScript execution interface, game globals or virtual FS access.
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import {createHash} from 'node:crypto';

const outputRoot=path.resolve(import.meta.dirname);
const endpoint='http://127.0.0.1:9227';
const allowedOrigin='http://127.0.0.1:4248';
const transcript=path.join(outputRoot,'headless-actions.jsonl');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const emit=value=>process.stdout.write(JSON.stringify(value)+'\n');
const check=(value,message)=>{if(!value)throw new Error(message);};
const inside=(root,file)=>{const relative=path.relative(root,file);return relative!==''&&!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative);};
function screenshotPath(name){
 check(typeof name==='string'&&name.length<250,'A PNG or JPEG filename is required');
 const file=path.resolve(outputRoot,name);
 check(inside(outputRoot,file)&&/\.(png|jpe?g)$/i.test(file),'Screenshot must be a PNG or JPEG inside this release output directory');
 check(!fs.existsSync(file),'Use a new screenshot filename; existing evidence is preserved');
 fs.mkdirSync(path.dirname(file),{recursive:true});return file;
}
function inputFiles(files){
 check(Array.isArray(files)&&files.length>0&&files.length<=12,'Select one to twelve actual import files');
 return files.map(name=>{
  check(typeof name==='string'&&path.isAbsolute(name),'Import paths must be absolute');
  const file=fs.realpathSync(name);
  check(inside(outputRoot,file),'Only this release output directory may supply QA imports');
  check(fs.statSync(file).isFile(),'The import must be an actual file');return file;
 });
}
function navigationUrl(input){
 check(typeof input==='string','A localhost QA URL is required');
 const url=new URL(input);check(url.origin===allowedOrigin&&url.username===''&&url.password==='',
  'Navigation is limited to the owned localhost:4248 web-development server');return url.href;
}
const DOM_INSPECTION=String.raw`(() => {
 const box = e => {const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
 const visible = e => {const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
 const name = e => (e.getAttribute('aria-label')||e.getAttribute('title')||e.innerText||'').trim().slice(0,200);
 return {url:location.href,title:document.title,readyState:document.readyState,visibility:document.visibilityState,
  viewport:{width:innerWidth,height:innerHeight,devicePixelRatio},
  canvases:[...document.querySelectorAll('canvas')].map(e=>({id:e.id,width:e.width,height:e.height,visible:visible(e),rect:box(e),label:name(e)})),
  mute:[...document.querySelectorAll('[id*="mute"],button[aria-label*="sound"],button[aria-label*="Sound"]')].map(e=>({id:e.id,label:name(e),pressed:e.getAttribute('aria-pressed'),visible:visible(e),rect:box(e)})),
  buttons:[...document.querySelectorAll('button,[role="button"]')].filter(visible).map(e=>({id:e.id,label:name(e),disabled:!!e.disabled,rect:box(e)})),
  fileInputs:[...document.querySelectorAll('input[type="file"]')].map((e,index)=>({index,id:e.id,accept:e.accept,multiple:e.multiple,visible:visible(e)})),
  formFields:[...document.querySelectorAll('input:not([type="file"]):not([type="password"]),select,textarea')].filter(visible).map(e=>({
   tag:e.tagName.toLowerCase(),id:e.id,name:e.name||'',type:e.type||'',label:[...(e.labels||[])].map(l=>l.innerText.trim()).join(' '),
   value:e.value,checked:!!e.checked,disabled:!!e.disabled,min:e.min||'',max:e.max||'',step:e.step||'',rect:box(e),
   ...(e.tagName==='SELECT'?{options:[...e.options].map(o=>({value:o.value,label:o.text,selected:o.selected,disabled:o.disabled}))}:{})})),
  disclosures:[...document.querySelectorAll('summary')].filter(visible).map(e=>({label:e.innerText.trim(),open:!!e.parentElement?.open,rect:box(e)})),
  visibleText:document.body.innerText.slice(0,4000)};
})()`;

const tabs=await (await fetch(endpoint+'/json/list')).json();
const pages=tabs.filter(tab=>tab.type==='page');
check(pages.length===1&&pages[0].url==='about:blank','Dedicated Chrome must have exactly its single owned blank page at startup');
const target=pages[0];
check(typeof target.id==='string'&&typeof target.webSocketDebuggerUrl==='string','Missing owned page debugging address');
const socketUrl=new URL(target.webSocketDebuggerUrl);
check(socketUrl.hostname==='127.0.0.1'&&socketUrl.port==='9227'&&socketUrl.pathname==='/devtools/page/'+target.id,
 'Debugger target must remain on the dedicated localhost Chrome page');
const socket=new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
let sequence=0,closed=false;
const pending=new Map();
socket.addEventListener('message',event=>{
 const message=JSON.parse(event.data);if(!message.id)return;
 const request=pending.get(message.id);if(!request)return;pending.delete(message.id);clearTimeout(request.timer);
 if(message.error)request.reject(new Error(message.error.message));else request.resolve(message.result||{});
});
socket.addEventListener('close',()=>{closed=true;for(const request of pending.values()){clearTimeout(request.timer);request.reject(new Error('Dedicated Chrome page disconnected'));}pending.clear();});
function call(method,params={}){
 check(!closed,'Dedicated Chrome page is closed');const id=++sequence;
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{pending.delete(id);reject(new Error('CDP timed out: '+method));},60000);
  pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}));
 });
}
async function currentUrl(){const history=await call('Page.getNavigationHistory');return history.entries[history.currentIndex]?.url;}
async function ownedPage(){const url=await currentUrl();check(url==='about:blank'||new URL(url).origin===allowedOrigin,'Owned page left the authorized localhost origin');return url;}
async function inspect(){
 const response=await call('Runtime.evaluate',{expression:DOM_INSPECTION,returnByValue:true,awaitPromise:false});
 check(!response.exceptionDetails,'Read-only DOM inspection failed');return response.result.value;
}
await call('Page.enable');
await call('Network.enable');
await call('Emulation.setDeviceMetricsOverride',{width:1100,height:850,deviceScaleFactor:1,mobile:false});
await call('Page.setWebLifecycleState',{state:'active'});
emit({status:'ready',targetId:target.id,debugger:endpoint,allowedOrigin,viewport:{width:1100,height:850},transcript,
 commands:['navigate','inspect','screenshot','click','move','key','text','chooseFile','reload','wait','close']});

const keys={Enter:{key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13},
 Escape:{key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27},
 Space:{key:' ',code:'Space',windowsVirtualKeyCode:32,nativeVirtualKeyCode:32},
 Tab:{key:'Tab',code:'Tab',windowsVirtualKeyCode:9,nativeVirtualKeyCode:9},
 Backspace:{key:'Backspace',code:'Backspace',windowsVirtualKeyCode:8,nativeVirtualKeyCode:8},
 ArrowLeft:{key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37,nativeVirtualKeyCode:37},
 ArrowUp:{key:'ArrowUp',code:'ArrowUp',windowsVirtualKeyCode:38,nativeVirtualKeyCode:38},
 ArrowRight:{key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39,nativeVirtualKeyCode:39},
 ArrowDown:{key:'ArrowDown',code:'ArrowDown',windowsVirtualKeyCode:40,nativeVirtualKeyCode:40},
 Delete:{key:'Delete',code:'Delete',windowsVirtualKeyCode:46,nativeVirtualKeyCode:46}};
function point(command){check(Number.isFinite(command.x)&&Number.isFinite(command.y)&&command.x>=0&&command.y>=0&&command.x<1100&&command.y<850,'Mouse coordinates must lie inside the owned viewport');return {x:command.x,y:command.y};}
async function perform(command){
 check(command&&typeof command==='object'&&!Array.isArray(command),'One JSON command object per line is required');
 await ownedPage();
 switch(command.action){
  case 'navigate':{const url=navigationUrl(command.url);const result=await call('Page.navigate',{url});check(!result.errorText,result.errorText);return {navigatingTo:url};}
  case 'inspect':return inspect();
  case 'screenshot':{
   const file=screenshotPath(command.path),jpeg=/\.jpe?g$/i.test(file);
   const response=await call('Page.captureScreenshot',{format:jpeg?'jpeg':'png',...(jpeg?{quality:90}:{}),fromSurface:true,captureBeyondViewport:false});
   const bytes=Buffer.from(response.data,'base64');
   check(jpeg?(bytes[0]===255&&bytes[1]===216&&bytes.at(-2)===255&&bytes.at(-1)===217):bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'Chrome screenshot framing differs');
   fs.writeFileSync(file,bytes,{flag:'wx'});return {path:file,bytes:bytes.length,sha256:sha(bytes),format:jpeg?'jpeg':'png',width:1100,height:850};
  }
  case 'move':{const position=point(command);await call('Input.dispatchMouseEvent',{type:'mouseMoved',...position});return position;}
  case 'click':{
   const position=point(command),button=command.button||'left';check(['left','right'].includes(button),'Only left/right native clicks are supported');
   const count=command.count||1;check(count===1||count===2,'Click count must be one or two');
   await call('Input.dispatchMouseEvent',{type:'mouseMoved',...position});
   for(let clickCount=1;clickCount<=count;clickCount++){
    await call('Input.dispatchMouseEvent',{type:'mousePressed',...position,button,buttons:button==='left'?1:2,clickCount});
    await call('Input.dispatchMouseEvent',{type:'mouseReleased',...position,button,buttons:0,clickCount});
   }return {...position,button,count};
  }
  case 'key':{
   const literal=typeof command.key==='string'&&/^[A-Za-z0-9]$/.test(command.key);
   const key=keys[command.key]||(literal?{key:command.key,code:/^[0-9]$/.test(command.key)?'Digit'+command.key:'Key'+command.key.toUpperCase(),
    windowsVirtualKeyCode:command.key.toUpperCase().charCodeAt(0),nativeVirtualKeyCode:command.key.toUpperCase().charCodeAt(0)}:null);
   check(key,'Unsupported key; use a documented key name, letter or digit');
   const modifiers=command.modifiers||0;check(Number.isInteger(modifiers)&&modifiers>=0&&modifiers<=15,'Invalid native key modifiers');
   await call('Input.dispatchKeyEvent',{type:'rawKeyDown',...key,modifiers});await call('Input.dispatchKeyEvent',{type:'keyUp',...key,modifiers});
   return {key:command.key,modifiers};
  }
  case 'text':{
   check(typeof command.text==='string'&&command.text.length<=120&&!/[\x00-\x1f\x7f]/.test(command.text),'Text input is limited to120 printable characters');
   for(const character of command.text)await call('Input.dispatchKeyEvent',{type:'char',text:character,unmodifiedText:character});
   return {characters:command.text.length};
  }
  case 'chooseFile':{
   const files=inputFiles(command.files),index=command.index??0;check(Number.isInteger(index)&&index>=0&&index<=10,'Use the visible DOM file-input index');
   const {root}=await call('DOM.getDocument',{depth:1});const {nodeIds}=await call('DOM.querySelectorAll',{nodeId:root.nodeId,selector:'input[type="file"]'});
   check(nodeIds[index],'DOM file input does not exist at that index');
   const {node}=await call('DOM.describeNode',{nodeId:nodeIds[index]});
   const attributes=Object.fromEntries(Array.from({length:node.attributes.length/2},(_,i)=>[node.attributes[i*2],node.attributes[i*2+1]]));
   check(attributes.type==='file','Target is not a native DOM file input');
   await call('DOM.setFileInputFiles',{nodeId:nodeIds[index],files});return {index,id:attributes.id||'',files};
  }
  case 'reload':await call('Page.reload',{ignoreCache:!!command.ignoreCache});return {reloading:true};
  case 'wait':{const ms=command.ms??1000;check(Number.isInteger(ms)&&ms>=0&&ms<=60000,'Wait must be0..60000 milliseconds');await new Promise(resolve=>setTimeout(resolve,ms));return {waitedMs:ms};}
  case 'close':await call('Page.close');return {closed:true};
  default:throw new Error('Unknown command; no generic CDP or JavaScript execution is exposed');
 }
}

const input=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
for await(const line of input){
 if(!line.trim())continue;const started=new Date().toISOString();let command,result;
 try{command=JSON.parse(line);result={status:'ok',action:command.action,result:await perform(command)};}
 catch(error){result={status:'error',action:command?.action||null,error:String(error.message)};}
 fs.appendFileSync(transcript,JSON.stringify({started,finished:new Date().toISOString(),command:command||{invalidJSON:true},...result})+'\n');
 emit(result);if(command?.action==='close'&&result.status==='ok')break;
}
socket.close();
