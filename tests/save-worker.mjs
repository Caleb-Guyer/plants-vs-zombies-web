// Actual browser save adapter + production classic Worker/core on worker_threads.
// No renderer, game, real user data or audio device is initialized.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {Worker as NodeWorker, isMainThread} from 'node:worker_threads';
import {memoryFS, fakeIndexedDB, sync, put, text} from './save-storage-fixtures.mjs';

assert(isMainThread);
const source = fs.readFileSync(new URL('../dist/save-storage.js', import.meta.url), 'utf8');
const core = fs.readFileSync(new URL('../dist/save-storage-core.js', import.meta.url), 'utf8');
const sleepDeadline = (promise, label) => {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => {timer = setTimeout(() => reject(Error('Test handshake timed out: ' + label)), 10000);})]).finally(() => clearTimeout(timer));
};

async function host() {
  const shared = new SharedArrayBuffer(4), gate = new Int32Array(shared);
  const worker = new NodeWorker(new URL('./save-worker-host.mjs', import.meta.url), {workerData: {gate: shared}});
  const clients = new Map(), controls = new Map(), calls = [], callWaiters = [], gateWaiters = [], heldWaiters = [];
  let nextClient = 1, nextControl = 1, mainDatabaseOpens = 0, readyResolve, gateEvent, heldEvent, stopped = false;
  const ready = new Promise(resolve => {readyResolve = resolve;});
  worker.on('message', packet => {
    assert(packet.threadId > 0, 'All persistence messages originate on another thread');
    if (packet.kind === 'host-ready') readyResolve();
    else if (packet.kind === 'control') {
      const pending = controls.get(packet.id); controls.delete(packet.id);
      if (packet.error) pending.reject(Error(packet.error)); else pending.resolve(packet.value);
    } else if (packet.kind === 'gate-entered') {
      gateEvent = packet;
      for (const resolve of gateWaiters.splice(0)) resolve(packet);
    } else if (packet.kind === 'reply-held') {
      heldEvent = packet;
      for (const resolve of heldWaiters.splice(0)) resolve(packet);
    } else {
      const client = clients.get(packet.client);
      if (!client || client.dead) return;
      if (packet.kind === 'client-error') client.dispatch('error', {message: packet.message, preventDefault() {}});
      else {
        client.received.push(packet);
        client.dispatch('message', {data: packet.message});
      }
    }
  });
  const fail = message => {
    for (const client of clients.values()) if (!client.dead) client.dispatch('error', {message, preventDefault() {}});
    for (const pending of controls.values()) pending.reject(Error(message));
    controls.clear();
  };
  worker.on('error', error => fail(error.message));
  worker.on('exit', () => {if (!stopped) fail('Synthetic worker stopped after startup');});
  await sleepDeadline(ready, 'worker host ready');

  class BrowserWorker {
    constructor(url) {
      this.id = nextClient++; this.url = String(url); this.received = []; this.sent = []; this.dead = false; this.listeners = new Map();
      clients.set(this.id, this);
      worker.postMessage({kind: 'new', client: this.id, script: this.url, failImport: BrowserWorker.failImport});
    }
    addEventListener(type, fn) {if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(fn);}
    removeEventListener(type, fn) {this.listeners.get(type)?.delete(fn);}
    dispatch(type, event) {this['on' + type]?.(event); for (const fn of this.listeners.get(type) || []) fn(event);}
    postMessage(message, transfers = []) {
      this.sent.push({message, transfers: [...transfers]});
      worker.postMessage({kind: 'runtime', client: this.id, message}, transfers);
      calls.push({client: this.id, message});
      for (const pending of [...callWaiters]) if (calls.filter(call => call.message.method === pending.method).length >= pending.count) {
        callWaiters.splice(callWaiters.indexOf(pending), 1); pending.resolve();
      }
    }
    terminate() {this.dead = true; worker.postMessage({kind: 'terminate', client: this.id});}
  }
  return {
    BrowserWorker, clients, calls,
    mainStorage: {open() {mainDatabaseOpens++; throw Error('The game thread must not open IndexedDB when the worker is ready.');}},
    mainDatabaseOpens: () => mainDatabaseOpens,
    async control(operation, value) {
      const id = nextControl++;
      const result = new Promise((resolve, reject) => controls.set(id, {resolve, reject}));
      worker.postMessage({kind: 'control', id, operation, value});
      return sleepDeadline(result, operation);
    },
    waitCall(method, count) {
      if (calls.filter(call => call.message.method === method).length >= count) return Promise.resolve();
      return sleepDeadline(new Promise(resolve => callWaiters.push({method, count, resolve})), 'worker call ' + method);
    },
    waitGate() {return gateEvent ? Promise.resolve(gateEvent) : sleepDeadline(new Promise(resolve => gateWaiters.push(resolve)), 'worker transaction barrier');},
    waitHeld() {return heldEvent ? Promise.resolve(heldEvent) : sleepDeadline(new Promise(resolve => heldWaiters.push(resolve)), 'committed worker reply');},
    releaseGate() {Atomics.store(gate, 0, 1); Atomics.notify(gate, 0);},
    async crash() {await worker.terminate();},
    async close() {stopped = true; Atomics.store(gate, 0, 1); Atomics.notify(gate, 0); await worker.terminate();},
  };
}

function api(workerHost, options = {}) {
  const context = vm.createContext({
    indexedDB: options.storage || workerHost.mainStorage,
    Worker: options.Worker || workerHost.BrowserWorker,
    Uint8Array, ArrayBuffer, WeakMap, URL, Promise, console, Date,
    setTimeout: options.timers?.setTimeout || setTimeout,
    clearTimeout: options.timers?.clearTimeout || clearTimeout,
    document: {currentScript: {src: 'https://save.test/save-storage.js'}, baseURI: 'https://save.test/', getElementById: () => ({textContent: '0.2.6-web-polish.1'})},
    location: {href: 'https://save.test/'},
  });
  context.window = context;
  vm.runInContext(core, context, {filename: 'save-storage-core.js'});
  vm.runInContext(source, context, {filename: 'save-storage.js'});
  return context.PVZSaveStorage;
}
const bytes = state => Buffer.from(state.snapshot.entries.find(entry => entry.path === 'userdata/user1.dat').data);
function controlledTimers() {
  let next = 1;
  const pending = new Map();
  return {
    setTimeout(fn, delay) {const id = next++; pending.set(id, {fn, delay}); return id;},
    clearTimeout(id) {pending.delete(id);},
    fire(delay) {
      const entry = [...pending].find(([, timer]) => timer.delay === delay);
      assert(entry, 'Expected a scheduled timeout for ' + delay);
      pending.delete(entry[0]); entry[1].fn();
    },
  };
}

const service = await host();
try {
  const runtime = api(service), memory = memoryFS(), FS = memory.api;
  FS.mkdir('/saves/userdata'); put(FS, '/saves/userdata/user1.dat', 'initial');
  put(FS, '/outside/keep', 'outside');
  const adapter = runtime.install(FS);
  assert.equal(adapter.fallback, true); assert.equal(adapter.historyAvailable, true);
  assert.equal(runtime.install(FS), adapter);
  await sync(FS, true); await sync(FS);
  let stored = await service.control('inspect');
  assert.equal(bytes(stored).toString(), 'initial'); assert.equal(stored.snapshot.version, 2);
  assert.equal(stored.snapshot.engineVersion, '0.2.6-web-polish.1');
  assert.equal(service.mainDatabaseOpens(), 0);
  const firstClient = [...service.clients.values()][0];
  assert.match(firstClient.url, /^https:\/\/save\.test\/save-storage-worker\.js\?v=/);
  const sent = firstClient.sent.find(call => call.message.method === 'commit');
  assert(sent && sent.transfers.length > 0, 'Captured file copies are transferred to the worker');
  assert(sent.transfers.every(buffer => buffer.byteLength === 0), 'Only the owned capture buffers detach');
  assert.equal(text(FS, '/saves/userdata/user1.dat'), 'initial', 'Live MEMFS bytes remain owned and readable');
  assert.equal(text(FS, '/outside/keep'), 'outside');
  console.log('PASS actual browser adapter uses the production worker/core on a dedicated thread; transferred captures never detach live filesystem bytes.');

  await service.control('hold', true);
  put(FS, '/saves/userdata/user1.dat', 'first-write');
  const startCalls = service.calls.filter(call => call.message.method === 'commit').length;
  let oneDone = false, twoDone = false;
  const one = sync(FS).then(() => {oneDone = true;});
  const two = sync(FS).then(() => {twoDone = true;});
  await service.waitCall('commit', startCalls + 1);
  stored = await service.control('inspect');
  assert.equal(stored.pending, 1); assert(!oneDone && !twoDone);
  put(FS, '/saves/userdata/late.dat', 'late-file');
  await service.control('complete'); await one;
  await service.waitCall('commit', startCalls + 2);
  stored = await service.control('inspect');
  assert.equal(stored.pending, 1); assert(oneDone && !twoDone);
  assert(!stored.snapshot.entries.some(entry => entry.path === 'userdata/late.dat'));
  await service.control('complete'); await two;
  await service.control('hold', false);
  stored = await service.control('inspect');
  assert(stored.snapshot.entries.some(entry => entry.path === 'userdata/late.dat'));
  assert.equal(memory.maxActive(), 1);
  console.log('PASS queued sync callbacks await their own durable worker commit and capture late writes only in the next transaction.');

  const other = memoryFS(); runtime.install(other.api); await sync(other.api, true);
  assert.equal(text(other.api, '/saves/userdata/user1.dat'), 'first-write');
  put(FS, '/saves/userdata/user1.dat', 'newer'); await sync(FS);
  put(other.api, '/saves/userdata/user1.dat', 'stale'); await assert.rejects(sync(other.api), /another game tab/);
  assert.equal(bytes(await service.control('inspect')).toString(), 'newer');
  console.log('PASS separate worker clients retain the atomic stale-tab revision guard and restore exact native bytes.');

  const beforeFailure = await service.control('inspect');
  put(FS, '/saves/userdata/user1.dat', 'retry'); await service.control('fail-commit');
  await assert.rejects(sync(FS), /commit failure/);
  stored = await service.control('inspect');
  assert.deepEqual(stored.snapshot, beforeFailure.snapshot); assert.deepEqual(stored.history, beforeFailure.history);
  await sync(FS); assert.equal(bytes(await service.control('inspect')).toString(), 'retry');
  const list = await adapter.listBackups();
  assert(list.length > 0 && list.every(entry => !('entries' in entry)));
  await adapter.restoreBackup(list[0].id);
  await assert.rejects(sync(FS), /Reload the game/);
  const fresh = memoryFS(); runtime.install(fresh.api); await sync(fresh.api, true);
  assert.equal(text(fresh.api, '/saves/userdata/user1.dat'), 'newer');
  console.log('PASS failed commits preserve durable current/history, retries succeed, and restored backups block stale-RAM saves until reload.');

  const freshAdapter = runtime.install(fresh.api);
  put(fresh.api, '/saves/userdata/user1.dat', 'valid-second'); await sync(fresh.api);
  await service.control('corrupt');
  const recovered = memoryFS(), recoveredAdapter = runtime.install(recovered.api); await sync(recovered.api, true);
  assert.equal(text(recovered.api, '/saves/userdata/user1.dat'), 'newer');
  assert.match(recoveredAdapter.getRecoveryNotice(), /damaged.*recovered/i);
  await sync(recovered.api);
  assert((await service.control('inspect')).damaged?.value);
  recoveredAdapter.acknowledgeRecoveryNotice(); assert.equal(recoveredAdapter.getRecoveryNotice(), '');
  assert.equal(freshAdapter.historyAvailable, true);
  console.log('PASS corruption recovery, quarantine and the visible recovery notice survive the worker protocol.');

  // The dataset resembles the public compiled-cache size, but the assertion is
  // structural: save work is deliberately blocked off-thread while a main task
  // runs. It never relies on a machine-specific millisecond threshold.
  recovered.api.mkdir('/saves/cache32'); recovered.api.mkdir('/saves/cache32/compiled');
  for (let index = 0; index < 251; index++) recovered.api.writeFile('/saves/cache32/compiled/item-' + index, new Uint8Array(5264).fill(index & 255));
  await service.control('arm');
  let saveFinished = false;
  const offThreadSave = sync(recovered.api).then(() => {saveFinished = true;});
  const gate = await service.waitGate(); assert(gate.threadId > 0); assert(!saveFinished);
  let mainTaskRan = false;
  await new Promise(resolve => setImmediate(() => {mainTaskRan = true; resolve();}));
  assert(mainTaskRan && !saveFinished, 'The game-thread event loop stays live while persistence cannot progress');
  service.releaseGate(); await offThreadSave;
  assert.equal(service.mainDatabaseOpens(), 0);
  console.log('PASS a main-thread task completes while the actual worker transaction pipeline is gated; history/checksum work cannot block the game thread.');

  const future = (await service.control('inspect')).snapshot;
  future.version = 999; await service.control('replace', future);
  const unknown = memoryFS(), unknownAdapter = runtime.install(unknown.api);
  put(unknown.api, '/saves/keep', 'unmodified-memory');
  await assert.rejects(sync(unknown.api, true), error => error.unsupportedVersion === true && /newer or unsupported/.test(error.message));
  assert.equal(text(unknown.api, '/saves/keep'), 'unmodified-memory');
  await assert.rejects(sync(unknown.api), /not been restored/);
  await assert.rejects(unknownAdapter.listBackups(), error => error.unsupportedVersion === true);
  assert.deepEqual((await service.control('inspect')).snapshot, future);
  console.log('PASS unsupported-version errors retain their flags across RPC and cannot replace newer durable saves or current memory.');
} finally {await service.close();}

const failed = await host();
try {
  const runtime = api(failed), memory = memoryFS();
  memory.api.mkdir('/saves/userdata'); put(memory.api, '/saves/userdata/user1.dat', 'live-memory');
  runtime.install(memory.api); await sync(memory.api, true); await sync(memory.api);
  await failed.control('hold-next-reply', 'commit');
  put(memory.api, '/saves/userdata/user1.dat', 'pending-memory');
  const calls = failed.calls.filter(call => call.message.method === 'commit').length;
  const writing = sync(memory.api);
  const rejected = assert.rejects(writing, /worker|reload|stopped/i);
  await failed.waitCall('commit', calls + 1); await failed.waitHeld();
  const committed = await failed.control('inspect');
  assert.equal(bytes(committed).toString(), 'pending-memory');
  assert.equal(committed.heldReplies, 1, 'The actual atomic commit completed before its reply was withheld');
  await failed.crash(); await rejected;
  await assert.rejects(sync(memory.api), /worker|reload|stopped/i);
  assert.equal(text(memory.api, '/saves/userdata/user1.dat'), 'pending-memory');
  assert.equal(failed.mainDatabaseOpens(), 0, 'A worker failure after a possible commit never falls back and risks duplicate writes');
  console.log('PASS worker death after a durable commit but before acknowledgement rejects pending/future persistence and never duplicates the write through another backend.');
} finally {await failed.close();}

const startup = await host();
try {
  startup.BrowserWorker.failImport = true;
  const direct = fakeIndexedDB(), runtime = api(startup, {storage: direct.storage}), memory = memoryFS();
  memory.api.mkdir('/saves/userdata'); put(memory.api, '/saves/userdata/user1.dat', 'startup-fallback');
  runtime.install(memory.api); await sync(memory.api, true); await sync(memory.api);
  assert.equal(Buffer.from(direct.snapshot().entries.find(entry => entry.path === 'userdata/user1.dat').data).toString(), 'startup-fallback');
  assert.equal(startup.calls.length, 0, 'Startup fallback occurs before any worker operation');
  assert.equal(memory.originalCalls(), 2, 'A fallback does not repeat native sync callbacks');
  const real = memoryFS(); real.api.filesystems = {IDBFS: {}};
  const count = startup.clients.size, originalSync = real.api.syncfs;
  assert.equal(runtime.install(real.api).fallback, false); assert.equal(real.api.syncfs, originalSync); assert.equal(startup.clients.size, count);
  console.log('PASS worker startup failure safely uses the existing direct backend before any operation; a real IDBFS backend remains untouched.');
} finally {await startup.close();}

{
  let terminated = 0, posted = 0;
  class NeverReadyWorker {
    postMessage() {posted++;}
    terminate() {terminated++;}
  }
  const direct = fakeIndexedDB(), timers = controlledTimers();
  const runtime = api({mainStorage: direct.storage}, {Worker: NeverReadyWorker, timers});
  const memory = memoryFS(); memory.api.mkdir('/saves/userdata'); put(memory.api, '/saves/userdata/user1.dat', 'timeout-fallback');
  runtime.install(memory.api);
  const populated = sync(memory.api, true);
  timers.fire(10000); await populated; await sync(memory.api);
  assert.equal(posted, 0); assert.equal(terminated, 1);
  assert.equal(bytes({snapshot: direct.snapshot()}).toString(), 'timeout-fallback');
  assert.equal(memory.originalCalls(), 2);
  console.log('PASS a stalled worker startup times out into the direct backend before any worker request or duplicated native sync.');
}

const timed = await host();
try {
  const timers = controlledTimers(), runtime = api(timed, {timers}), memory = memoryFS();
  memory.api.mkdir('/saves/userdata'); put(memory.api, '/saves/userdata/user1.dat', 'before-timeout');
  runtime.install(memory.api); await sync(memory.api, true); await sync(memory.api);
  await timed.control('hold-next-reply', 'commit');
  put(memory.api, '/saves/userdata/user1.dat', 'durable-no-ack');
  const saving = sync(memory.api), rejected = assert.rejects(saving, /worker|reload/i);
  await timed.waitHeld();
  const durable = await timed.control('inspect');
  assert.equal(bytes(durable).toString(), 'durable-no-ack');
  timers.fire(30000); await rejected;
  await assert.rejects(sync(memory.api), /worker|reload/i);
  const after = await timed.control('inspect');
  assert.equal(after.commits, durable.commits);
  assert.deepEqual(after.snapshot, durable.snapshot);
  assert.equal(timed.mainDatabaseOpens(), 0);
  assert.equal(text(memory.api, '/saves/userdata/user1.dat'), 'durable-no-ack');
  console.log('PASS an operation timeout after a durable commit fails closed without retrying, overwriting history or touching live native bytes.');
} finally {await timed.close();}

// Reused by the standalone, non-gating performance comparison in the QA output.
export {host, api};
