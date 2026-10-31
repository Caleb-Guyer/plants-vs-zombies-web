// Actual save-history/recovery code with mocked storage, files and DOM. No audio.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {memoryFS, fakeIndexedDB, apiFor, sync, text, put, turns} from './save-storage-fixtures.mjs';

const content = snapshot => Buffer.from(snapshot.entries.find(e => e.path === 'userdata/user1.dat').data).toString();
async function setup() {
  const db = fakeIndexedDB(), memory = memoryFS(), api = apiFor(db), adapter = api.install(memory.api);
  memory.api.mkdir('/saves/userdata');
  put(memory.api, '/saves/userdata/user1.dat', 'initial');
  put(memory.api, '/saves/userdata/qol-settings-1.txt', 'PVZ-QOL-2\nremember=1');
  await sync(memory.api, true); await sync(memory.api);
  return {db, memory, api, adapter};
}
{
  const {db, memory, api} = await setup();
  const legacy = db.snapshot(); legacy.version = 1; delete legacy.savedAt; delete legacy.engineVersion;
  db.replace(legacy);
  const reload = memoryFS(); api.install(reload.api); await sync(reload.api, true);
  assert.equal(text(reload.api, '/saves/userdata/user1.dat'), 'initial');
  assert.equal(text(reload.api, '/saves/userdata/qol-settings-1.txt'), 'PVZ-QOL-2\nremember=1');
  assert.equal(db.snapshot().version, 1, 'Reading legacy saves does not mutate durable data');
  await sync(reload.api);
  assert.equal(db.snapshot().version, 2);
  assert.deepEqual(db.snapshot().entries, legacy.entries, 'Migration preserves all file bytes and metadata');
  assert.equal(memory.nodes.has('/outside/keep'), false);
}
console.log('PASS v1-to-v2 browser-envelope migration preserves all native and QoL file bytes; old data is untouched until a successful commit.');
{
  const {db, memory, adapter} = await setup();
  for (let i = 1; i <= 12; i++) {put(memory.api, '/saves/userdata/user1.dat', 'progress-' + i); await sync(memory.api);}
  assert.equal(db.history().backups.length, 8);
  assert.deepEqual(db.history().backups.map(b => content(b.snapshot)), ['progress-11','progress-10','progress-9','progress-8','progress-7','progress-6','progress-5','progress-4']);
  const history = db.history();
  for (let i = 0; i < 5; i++) {put(memory.api, '/saves/userdata/user1.dat', 'progress-12'); await sync(memory.api);}
  assert.deepEqual(db.history(), history, 'Identical file content with newer mtimes does not create duplicate backups');
  const list = await adapter.listBackups();
  assert.equal(list.length, 8); assert(list.every(b => b.files === 2 && b.bytes > 0 && typeof b.id === 'string'));
  assert(!('entries' in list[0]), 'Recovery UI receives metadata only');
}
console.log('PASS eight distinct automatic backups are bounded and ordered; repeated unchanged saves/mtime churn do not consume history.');
{
  const {db, memory, adapter, api} = await setup();
  put(memory.api, '/saves/userdata/user1.dat', 'second'); await sync(memory.api);
  put(memory.api, '/saves/userdata/user1.dat', 'third'); await sync(memory.api);
  const other = memoryFS(); apiFor(db).install(other.api); await sync(other.api, true);
  const selected = (await adapter.listBackups())[0];
  await adapter.restoreBackup(selected.id);
  assert.equal(content(db.snapshot()), 'second');
  assert.equal(content(db.history().backups[0].snapshot), 'third');
  assert.equal(db.history().backups[0].reason, 'Before restore');
  await assert.rejects(sync(memory.api), /Reload the game/);
  put(other.api, '/saves/userdata/user1.dat', 'stale'); await assert.rejects(sync(other.api), /another game tab/);
  const fresh = memoryFS(); api.install(fresh.api); await sync(fresh.api, true);
  assert.equal(text(fresh.api, '/saves/userdata/user1.dat'), 'second');
  assert.equal(text(fresh.api, '/saves/userdata/qol-settings-1.txt'), 'PVZ-QOL-2\nremember=1');
}
console.log('PASS restore atomically preserves current progress, advances revision, blocks old RAM/stale tabs and reloads exact previous native/QoL bytes.');
{
  const {db, memory, adapter} = await setup();
  put(memory.api, '/saves/userdata/user1.dat', 'second'); await sync(memory.api);
  const before = db.snapshot(), history = db.history(), selected = (await adapter.listBackups())[0];
  db.controls.failCommit = true;
  await assert.rejects(adapter.restoreBackup(selected.id), /Mock commit failure/);
  assert.deepEqual(db.snapshot(), before); assert.deepEqual(db.history(), history);
  put(memory.api, '/saves/userdata/user1.dat', 'quota-write'); db.controls.failPut = true;
  await assert.rejects(sync(memory.api), /quota failure/);
  assert.deepEqual(db.snapshot(), before); assert.deepEqual(db.history(), history);
  await sync(memory.api); assert.equal(content(db.snapshot()), 'quota-write');
}
console.log('PASS failed restore and quota/transaction failures leave both current save and history untouched and permit retry.');
{
  const {db, memory, adapter} = await setup();
  put(memory.api, '/saves/userdata/user1.dat', 'valid-later'); await sync(memory.api);
  const damaged = db.snapshot(); damaged.entries[0].path = '../outside'; db.replace(damaged);
  const validHistory = db.history();
  validHistory.backups.unshift({id:'bad',reason:'invalid',snapshot:{version:2,revision:1,savedAt:1,engineVersion:'bad',entries:[{path:'../bad',kind:'file',mode:0o100644,mtime:1,data:new Uint8Array([1])}]}});
  db.replaceHistory(validHistory);
  const fresh = memoryFS(), recovered = apiFor(db).install(fresh.api);
  put(fresh.api, '/outside/keep', 'safe');
  await sync(fresh.api, true);
  assert.equal(text(fresh.api, '/saves/userdata/user1.dat'), 'initial');
  assert.equal(text(fresh.api, '/outside/keep'), 'safe');
  assert.match(recovered.getRecoveryNotice(), /damaged.*recovered/i);
  assert.deepEqual(db.snapshot(), damaged, 'Fallback does not silently overwrite damaged durable record');
  await sync(fresh.api);
  assert.deepEqual(db.damagedCurrent().value, damaged, 'Damaged record is preserved when recovered progress is committed');
  assert.equal(content(db.snapshot()), 'initial');
  assert.equal((await recovered.listBackups()).length, 1);
  recovered.acknowledgeRecoveryNotice(); assert.equal(recovered.getRecoveryNotice(), '');
}
console.log('PASS corrupt current/history entries recover the last valid backup with a visible notice and quarantine, without escaping /saves.');
{
  const {db, memory} = await setup();
  put(memory.api, '/saves/userdata/user1.dat', 'second'); await sync(memory.api);
  const future = db.snapshot(); future.version = 999; db.replace(future);
  const fresh = memoryFS(), recovered = apiFor(db).install(fresh.api);
  put(fresh.api, '/saves/keep', 'memory');
  await assert.rejects(sync(fresh.api, true), /newer or unsupported/);
  assert.equal(text(fresh.api, '/saves/keep'), 'memory'); assert.deepEqual(db.snapshot(), future);
  await assert.rejects(sync(fresh.api), /not been restored/);
  await assert.rejects(recovered.listBackups(), /newer or unsupported/);
}
console.log('PASS unknown future schemas never fall back or overwrite newer saves.');
{
  const {db, memory} = await setup();
  put(memory.api, '/saves/userdata/user1.dat', 'second'); await sync(memory.api);
  put(memory.api, '/saves/userdata/user1.dat', 'third'); await sync(memory.api);
  const corrupt = db.snapshot(); corrupt.entries.find(e => e.path === 'userdata/user1.dat').data[0] ^= 1; db.replace(corrupt);
  const history = db.history(); history.backups[0].snapshot.entries.find(e => e.path === 'userdata/user1.dat').data[0] ^= 1;
  db.replaceHistory(history);
  const fresh = memoryFS(), recovered = apiFor(db).install(fresh.api);
  await sync(fresh.api, true);
  assert.equal(text(fresh.api, '/saves/userdata/user1.dat'), 'initial', 'Checksum-invalid current and newest history are skipped');
  assert.match(recovered.getRecoveryNotice(), /damaged.*recovered/i);
  const before = db.snapshot(), beforeHistory = db.history(); db.controls.failCommit = true;
  await assert.rejects(sync(fresh.api), /Mock commit failure/);
  assert.deepEqual(db.snapshot(), before); assert.deepEqual(db.history(), beforeHistory);
  await sync(fresh.api);
  assert.equal(content(db.snapshot()), 'initial');
  assert.match(db.snapshot().checksum, /^crc32:[0-9a-f]{8}$/);
  assert.deepEqual(db.damagedCurrent().value, corrupt);
}
console.log('PASS deterministic checksums catch native-payload bit flips in current/history; recovery and failed commit retain durable records.');

{
  const {db, memory, adapter} = await setup();
  put(memory.api, '/saves/userdata/user1.dat', 'second'); await sync(memory.api);
  await adapter.purgeRecoveryHistory(); assert.deepEqual(db.history().backups, []);
  assert.equal(content(db.snapshot()), 'second');
}
console.log('PASS explicit clear-all integration can purge backup/quarantine history without changing current native files.');

const recoverySource = fs.readFileSync(new URL('../dist/save-recovery.js', import.meta.url), 'utf8');
function ui(options = {}) {
  const nodes = new Map(), calls = [];
  class Node {
    constructor(id = '') {this.id=id;this.children=[];this.attributes=new Map();this.listeners=new Map();this.textContent='';this.disabled=false;this.hidden=false;this.open=false;}
    setAttribute(k,v){this.attributes.set(k,String(v));}
    append(...children){this.children.push(...children);}
    appendChild(child){this.children.push(child);return child;}
    replaceChildren(...children){this.children=[...children];}
    querySelectorAll(){return this.children.filter(n=>n.tag==='button');}
    addEventListener(type,fn){this.listeners.set(type,fn);}
    showModal(){this.open=true;}
    close(){this.open=false;}
    click(){if(!this.disabled)return this.listeners.get('click')?.();}
  }
  const el=id=>{if(!nodes.has(id))nodes.set(id,new Node(id));return nodes.get(id);};
  const adapter={historyAvailable:true,getRecoveryNotice:()=>options.notice||'',acknowledgeRecoveryNotice(){calls.push('acknowledge');},
    async listBackups(){if(options.listFail)throw Error('list failed');return [{id:'backup-1',savedAt:1,engineVersion:'<unsafe>',reason:'Automatic save',files:2,bytes:20}];},
    async restoreBackup(id){calls.push('restore:'+id);if(options.restoreFail)throw Error('restore failed');return {reloadRequired:true};}};
  const context=vm.createContext({document:{getElementById:el,createElement(tag){const n=new Node();n.tag=tag;return n;}},console,Date,Promise});
  context.window=context;
  vm.runInContext(recoverySource,context,{filename:'save-recovery.js'});
  context.PVZSaveRecovery.configure({getAdapter:()=>adapter,ensureReady:async()=>{calls.push('ready');},
    closeMore(){calls.push('close-more');},requestOpen:options.guard?()=>calls.push('guard'):undefined,
    async flush(){calls.push('flush');if(options.flushFail)throw Error('flush failed');},
    beforeReload(){calls.push('stop');if(options.stopFail)throw Error('stop failed');},
    reload(){calls.push('reload');if(options.reloadFail)throw Error('reload failed');},onClose(){calls.push('close');}});
  return {context,el,calls};
}
{
  const page=ui({guard:true});page.context.PVZSaveRecovery.open();assert.deepEqual(page.calls,['guard']);assert(!page.el('save-recovery-dialog').open);
}
{
  const page=ui();await page.context.PVZSaveRecovery.show();
  assert(page.el('save-recovery-dialog').open);assert(page.el('save-recovery-restore').disabled);
  const entry=page.el('save-recovery-list').children[0];assert.equal(entry.children[1].textContent,'<unsafe> · 2 saved files · Automatic save');
  entry.click();assert.equal(page.el('save-recovery-restore').disabled,false);assert(!page.calls.some(c=>c.startsWith('restore')));
  page.el('save-recovery-restore').click();await turns();
  assert.deepEqual(page.calls.slice(-4),['flush','restore:backup-1','stop','reload']);
  assert(page.el('save-recovery-close').disabled,'Do not resume stale native RAM after a restore');
}
for(const flag of ['flushFail','restoreFail']){
  const page=ui({[flag]:true});await page.context.PVZSaveRecovery.show();page.el('save-recovery-list').children[0].click();
  page.el('save-recovery-restore').click();await turns();
  assert(!page.calls.includes('reload'));assert(!page.el('save-recovery-close').disabled);assert.match(page.el('save-recovery-status').textContent,/previous save is still kept/);
}
for(const flag of ['stopFail','reloadFail']){
  const page=ui({[flag]:true});await page.context.PVZSaveRecovery.show();page.el('save-recovery-list').children[0].click();
  page.el('save-recovery-restore').click();await turns();
  assert(page.el('save-recovery-close').disabled);assert(!page.el('save-recovery-retry').hidden);assert.match(page.el('save-recovery-status').textContent,/restored safely/);
  await page.context.PVZSaveRecovery.show();assert(page.el('save-recovery-close').disabled,'Repeated open cannot bypass committed-restore guard');
}
{
  const page=ui({notice:'Recovered a damaged save.'});let continued=false;
  const waiting=page.context.PVZSaveRecovery.beforeNativeStart().then(()=>{continued=true;});await turns();
  assert(!continued);assert.match(page.el('save-recovery-status').textContent,/damaged/);
  page.el('save-recovery-close').click();await waiting;assert(continued);assert(page.calls.includes('acknowledge'));
}
{
  const page=ui({listFail:true});await page.context.PVZSaveRecovery.show();assert.match(page.el('save-recovery-status').textContent,/list failed/);
  page.el('save-recovery-close').click();assert(!page.el('save-recovery-dialog').open);
}
console.log('PASS actual recovery UI requires explicit selection/restore, preserves text safety, awaits durable restore, blocks stale-RAM resume and handles save/reload failures without audio.');
