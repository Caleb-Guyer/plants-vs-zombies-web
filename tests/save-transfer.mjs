// Actual transfer module + vendored JSZip; synthetic native-format save bytes.
// No original resources, audio device, or user's real saves are accessed.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url), vendor={exports:{}};
const directory=new URL('../dist/',import.meta.url);
new Function('module','exports','require',fs.readFileSync(new URL('vendor/jszip.min.js',directory),'utf8'))(vendor,vendor.exports,require);
const JSZip=vendor.exports;
const browser=vm.createContext({console,Uint8Array,ArrayBuffer,DataView,TextDecoder,Date,Promise});
vm.runInContext(fs.readFileSync(new URL('save-transfer.js',directory),'utf8'),browser);
const transfer=browser.PVZSaveTransfer;
const fixture=await JSZip.loadAsync(fs.readFileSync(new URL('testing/test-profiles.zip',directory)));
const originals=new Map();
for(const entry of Object.values(fixture.files))if(!entry.dir)originals.set('/saves/'+entry.name,Buffer.from(await entry.async('uint8array')));
assert(originals.has('/saves/userdata/users.dat'));

function registry(user='QA - Pool',music=37){
  const chunks=[];const bytes=value=>chunks.push(Buffer.from(value));
  const u32=value=>{const b=Buffer.alloc(4);b.writeUInt32LE(value);bytes(b);};
  const string=value=>{const b=Buffer.from(value+'\0');u32(b.length);bytes(b);};
  bytes(Buffer.from('REGEMU'));bytes([1,0]);u32(1);string('SOFTWARE\\SteamPopCap\\PlantsVsZombies');u32(5);
  for(const[name,type,data]of[
    ['CurUser',1,Buffer.from(user+'\0')],
    ['MusicVolume',4,Buffer.from([music,0,0,0])],['SfxVolume',4,Buffer.from([63,0,0,0])],
    ['Muted',4,Buffer.alloc(4)],['PrivateNativeBinary',3,Buffer.from([0,255,2,254])],
  ]){string(name);u32(type);u32(data.length);bytes(data);}
  return Buffer.concat(chunks);
}
function crc32(data){let value=0xffffffff;for(const b of data){value^=b;for(let i=0;i<8;i++)value=(value>>>1)^((value&1)?0xedb88320:0);}return(value^0xffffffff)>>>0;}
function board(){
  const payload=Buffer.from([1,0,0,0,9,0,0,0,0,255,2,3,4,5,6,7,8]);
  const header=Buffer.alloc(24);header.write('PVZP_SAVE4');header.writeUInt32LE(1,12);header.writeUInt32LE(payload.length,16);header.writeUInt32LE(crc32(payload),20);
  return Buffer.concat([header,payload]);
}
originals.set('/saves/registry.regemu',registry());
originals.set('/saves/userdata/game900002_0.v4',board());
originals.set('/saves/userdata/game900002_73.v4',board());
originals.set('/saves/userdata/auxiliary/notes.bin',Buffer.from([0,251,255,4]));
originals.set('/saves/userdata/qol-settings-900001.txt',Buffer.from('PVZQOL 1\n1 1 1 1\n49 50 51 52 53 54 55 56 57 48 83 70\n'));
originals.set('/saves/userdata/qol-decks-900001.txt',Buffer.from('PVZDECKS 1\n8\n"Day" 1 0 -1\n"Night" 0\n"Pool" 0\n"Roof" 0\n"Deck 5" 0\n"Deck 6" 0\n"Deck 7" 0\n"Deck 8" 0\n'));
function memoryFS(initial=new Map()){
  let clock=1000,failure=null;
  const nodes=new Map(),mutations=[];
  const normalize=value=>path.posix.normalize(value),parent=value=>path.posix.dirname(value);
  const missing=()=>Object.assign(new Error('Missing'),{code:'ENOENT'});
  const entry=value=>{const node=nodes.get(normalize(value));if(!node)throw missing();return node;};
  const directory=value=>{if((entry(value).mode&0xf000)!==0x4000)throw new Error('Parent is not a directory');};
  const touch=value=>{const node=entry(value);node.mtime=++clock;};
  const fault=(op,from,to)=>{mutations.push({op,from,to});if(failure?.({op,from,to})){failure=null;throw new Error('Injected '+op+' failure');}};
  const addDirectory=value=>{nodes.set(value,{mode:0o40755,mtime:1000,atime:900});};
  addDirectory('/');addDirectory('/saves');
  const FS={
    stat(value){const n=entry(value);return{mode:n.mode,mtime:new Date(n.mtime),atime:new Date(n.atime),size:n.data?.length??0};},
    lstat(value){return FS.stat(value);},isDir:mode=>(mode&0xf000)===0x4000,
    mkdir(value){value=normalize(value);fault('mkdir',value);if(nodes.has(value))throw new Error('Exists');directory(parent(value));addDirectory(value);touch(parent(value));},
    writeFile(value,data){value=normalize(value);fault('writeFile',value);directory(parent(value));const old=nodes.get(value);nodes.set(value,{mode:old?.mode??0o100644,mtime:++clock,atime:old?.atime??clock,data:Buffer.from(data)});touch(parent(value));},
    readFile(value){const n=entry(value);if(!n.data)throw new Error('Not a file');return new Uint8Array(n.data);},
    readdir(value){value=normalize(value);directory(value);return['.','..',...[...nodes.keys()].filter(p=>p!==value&&parent(p)===value).map(p=>path.posix.basename(p))];},
    rename(from,to){from=normalize(from);to=normalize(to);fault('rename',from,to);const n=entry(from);directory(parent(to));nodes.set(to,n);nodes.delete(from);touch(parent(from));touch(parent(to));},
    unlink(value){value=normalize(value);fault('unlink',value);if(!entry(value).data)throw new Error('Is a directory');nodes.delete(value);touch(parent(value));},
    rmdir(value){value=normalize(value);fault('rmdir',value);if(FS.readdir(value).length!==2)throw new Error('Not empty');nodes.delete(value);touch(parent(value));},
    chmod(value,mode){entry(value).mode=(entry(value).mode&0xf000)|mode;},
    utime(value,atime,mtime){const n=entry(value);n.atime=Number(atime);n.mtime=Number(mtime);},
  };
  for(const[value,data]of initial){const parts=value.split('/');let d='';for(let i=1;i<parts.length-1;i++){d+='/'+parts[i];if(!nodes.has(d))addDirectory(d);}nodes.set(value,{mode:0o100640,mtime:1200000000000,atime:1199999999000,data:Buffer.from(data)});}
  return{FS,nodes,mutations,failOnce:fn=>{failure=fn;},snapshot:()=>[...nodes].sort(([a],[b])=>a.localeCompare(b)).map(([name,n])=>({name,mode:n.mode,mtime:n.mtime,atime:n.atime,data:n.data?.toString('hex')}))};
}
const zipOf=async(entries)=>{const zip=new JSZip();for(const[name,data]of entries)zip.file(name,data,{createFolders:false});return zip.generateAsync({type:'uint8array'});};
function noTemporary(f){assert(![...f.nodes.keys()].some(name=>name.includes('.pvz-transfer-')),'No transaction bytes remain during sync');}
const source=memoryFS(originals);
source.FS.writeFile('/saves/outside-backup.note',Buffer.from('not part of backup'));
source.FS.writeFile('/main.pak',Buffer.from('synthetic hosted game data'));
source.FS.mkdir('/properties');
source.FS.writeFile('/properties/default.xml',Buffer.from('<synthetic/>'));
const backup=await transfer.exportZip(source.FS,JSZip,{type:'uint8array'});
const zipped=await JSZip.loadAsync(backup,{checkCRC32:true});
assert(zipped.file('registry.regemu'));assert(zipped.file('userdata/game900002_0.v4'));assert(zipped.file('userdata/game900002_73.v4'));
assert(!zipped.file('outside-backup.note'));
assert(!Object.keys(zipped.files).some(name=>/main\.pak|properties\//i.test(name)),'Export contains saved data only, never game resources');
assert.deepEqual(Object.keys(zipped.files).sort(),[...originals.keys()].map(n=>n.slice('/saves/'.length)).sort());
const target=memoryFS(new Map([['/saves/userdata/unrelated.note',Buffer.from('keep me')]]));
let flushes=0;
const result=await transfer.importZip(target.FS,JSZip,backup,async()=>{noTemporary(target);flushes++;});
assert.equal(result.files,originals.size);assert(result.restoredRegistry);assert.equal(flushes,1);
for(const[name,data]of originals)assert.deepEqual(Buffer.from(target.FS.readFile(name)),data,name);
assert.equal(Buffer.from(target.FS.readFile('/saves/userdata/unrelated.note')).toString(),'keep me');
const reg=Buffer.from(target.FS.readFile('/saves/registry.regemu'));
assert(reg.includes(Buffer.from('QA - Pool\0')));assert(reg.includes(Buffer.from('MusicVolume\0')));assert(reg.includes(Buffer.from([37,0,0,0])));
console.log('PASS actual JSZip roundtrip preserves native index/details, root CurUser/options registry, nested files, original and independent bonus .v4 bytes; unrelated saves survive.');

for(const[prefix,rooted]of[['',false],['backup/',false],['backup/userdata/',true],['BACKUP/UserData/',true]]){
  const entries=[...originals].filter(([name])=>/^\/saves\/userdata\/(?:users\.dat|user\d+\.dat|game\d+_\d+\.v4)$/.test(name)).map(([name,data])=>[prefix+name.slice('/saves/userdata/'.length),data]);
  const native=memoryFS();await transfer.importZip(native.FS,JSZip,await zipOf(entries));
  for(const[name,data]of originals)if(/^\/saves\/userdata\/(?:users\.dat|user\d+\.dat|game\d+_\d+\.v4)$/.test(name))assert.deepEqual(Buffer.from(native.FS.readFile(name)),data);
}
const folderFiles=[...originals].map(([name,data])=>({name:path.posix.basename(name),webkitRelativePath:'Wrapped/'+name.slice('/saves/'.length),lastModified:1200000000000,arrayBuffer:async()=>Uint8Array.from(data).buffer}));
const folder=memoryFS();await transfer.importFiles(folder.FS,folderFiles,async()=>noTemporary(folder));
for(const[name,data]of originals)assert.deepEqual(Buffer.from(folder.FS.readFile(name)),data);
assert(!folder.nodes.has('/saves/userdata/registry.regemu'));
console.log('PASS legacy flat/native/wrapped/case-varied userdata ZIPs and wrapped folder imports route files correctly, including root registry.');

const canonicalRegistry=registry('Canonical player',54),legacyRegistry=registry('Obsolete player',2);
const legacySource=memoryFS(new Map([
  ['/saves/registry.regemu',canonicalRegistry],
  ['/saves/userdata/registry.regemu',legacyRegistry],
  ['/saves/userdata/users.dat',originals.get('/saves/userdata/users.dat')],
]));
const sourceBefore=legacySource.snapshot();
const recoveredBackup=await transfer.exportZip(legacySource.FS,JSZip,{type:'uint8array'});
assert.deepEqual(legacySource.snapshot(),sourceBefore,'Export must not edit the obsolete source artifact');
const recoveredZip=await JSZip.loadAsync(recoveredBackup);
assert(recoveredZip.file('registry.regemu'));assert(!recoveredZip.file('userdata/registry.regemu'));
const recovered=memoryFS();await transfer.importZip(recovered.FS,JSZip,recoveredBackup);
assert.deepEqual(Buffer.from(recovered.FS.readFile('/saves/registry.regemu')),canonicalRegistry);
for(const entries of[
  [['Wrapped/REGISTRY.REGEMU',canonicalRegistry],['Wrapped/UserData/ReGiStRy.ReGeMu',legacyRegistry]],
  [['Wrapped/UserData/ReGiStRy.ReGeMu',legacyRegistry],['Wrapped/REGISTRY.REGEMU',canonicalRegistry]],
]){
  const target=memoryFS();await transfer.importZip(target.FS,JSZip,await zipOf(entries));
  assert.deepEqual(Buffer.from(target.FS.readFile('/saves/registry.regemu')),canonicalRegistry);
  assert(!target.nodes.has('/saves/userdata/registry.regemu'));
}
const legacyOnly=memoryFS();await transfer.importZip(legacyOnly.FS,JSZip,await zipOf([['Wrapped/USERDATA/REGISTRY.REGEMU',legacyRegistry]]));
assert.deepEqual(Buffer.from(legacyOnly.FS.readFile('/saves/registry.regemu')),legacyRegistry);
const ambiguous=memoryFS();
await assert.rejects(transfer.importZip(ambiguous.FS,JSZip,await zipOf([['registry.regemu',canonicalRegistry],['Wrapped/REGISTRY.REGEMU',legacyRegistry]])),/Conflicting save import targets/);
assert.equal(ambiguous.mutations.length,0);
console.log('PASS canonical root registry wins over legacy userdata aliases in either order/case/wrapper; own backups roundtrip without editing the artifact; legacy-only recovery works and true canonical duplicates reject.');

const baseline=new Map(originals);baseline.set('/saves/userdata/keep.note',Buffer.from('existing unrelated bytes'));
const invalidCases=[
  await zipOf([['../userdata/users.dat',originals.get('/saves/userdata/users.dat')]]),
  await zipOf([['users.dat',originals.get('/saves/userdata/users.dat')],['backup/userdata/users.dat',originals.get('/saves/userdata/users.dat')]]),
  await zipOf([['userdata/extra',Buffer.from('a')],['userdata/extra/file.bin',Buffer.from('b')]]),
  await zipOf([['userdata/extra',Buffer.from('a')],['userdata/extra-file',Buffer.from('x')],['userdata/extra/file.bin',Buffer.from('b')]]),
  await zipOf([['registry.regemu',Buffer.from('invalid registry')]]),
  await zipOf([['users.dat',Buffer.from([14,0,0,0,1,0])]]),
  await zipOf([['userdata/game1_0.v4',Buffer.from(board()).fill(1,24)]]),
];
const duplicate=Buffer.from(await zipOf([['userdata/user900001.dat',originals.get('/saves/userdata/user900001.dat')],['userdata/user900002.dat',originals.get('/saves/userdata/user900002.dat')]]));
const beforeName=Buffer.from('userdata/user900002.dat'),afterName=Buffer.from('userdata/user900001.dat');
for(let at=duplicate.indexOf(beforeName);at>=0;at=duplicate.indexOf(beforeName,at+1))afterName.copy(duplicate,at);
invalidCases.push(duplicate);
const badCRC=Buffer.from(await zipOf([['userdata/opaque.bin',Buffer.from('UNIQUE_PAYLOAD')]]));
badCRC[badCRC.indexOf(Buffer.from('UNIQUE_PAYLOAD'))]^=1;invalidCases.push(badCRC);
for(const bytes of invalidCases){const f=memoryFS(baseline),snapshot=f.snapshot();await assert.rejects(transfer.importZip(f.FS,JSZip,bytes));assert.deepEqual(f.snapshot(),snapshot);assert.equal(f.mutations.length,0);}
console.log('PASS traversal, raw duplicate ZIP names, aliases, file/directory conflicts, malformed native data and native/ZIP CRC errors are rejected before writes.');

for(const failure of[
  ({op,from})=>op==='writeFile'&&from.endsWith('/new-1'),
  ({op,from,to})=>op==='rename'&&from.includes('/new-')&&to.endsWith('/users.dat'),
]){
  const f=memoryFS(baseline),snapshot=f.snapshot();f.failOnce(failure);
  await assert.rejects(transfer.importZip(f.FS,JSZip,backup),/Injected/);
  assert.deepEqual(f.snapshot(),snapshot,'Rollback restores bytes, paths, permissions and timestamps');noTemporary(f);
}
const failedPersist=memoryFS(baseline),previous=failedPersist.snapshot();let attempts=0;
await assert.rejects(transfer.importZip(failedPersist.FS,JSZip,backup,async()=>{noTemporary(failedPersist);if(++attempts===1)throw new Error('Mock persistence failure');}),/persistence failure/);
assert.equal(attempts,2);assert.deepEqual(failedPersist.snapshot(),previous);
console.log('PASS staging/rename/persistence failures restore exact previous files and metadata, remove transaction files, and attempt rollback persistence.');

const serialized=memoryFS();let release,firstSync=false;
const hold=new Promise(resolve=>{release=resolve;});
const first=transfer.importZip(serialized.FS,JSZip,backup,async()=>{firstSync=true;noTemporary(serialized);await hold;});
while(!firstSync)await new Promise(resolve=>setTimeout(resolve,0));
const beforeCount=serialized.mutations.length;
const second=transfer.importFiles(serialized.FS,[{name:'users.dat',arrayBuffer:async()=>Uint8Array.from(originals.get('/saves/userdata/users.dat')).buffer}]);
await Promise.resolve();assert.equal(serialized.mutations.length,beforeCount);
release();await Promise.all([first,second]);noTemporary(serialized);
console.log('PASS overlapping imports serialize through awaited persistence.');
