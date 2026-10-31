// Mocked IndexedDB + MEMFS tests: no browser, audio device, assets, or saves.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../dist/save-storage.js', import.meta.url), 'utf8');
const turns = async () => { for (let i = 0; i < 30; i++) await Promise.resolve(); };

function memoryFS() {
  const nodes = new Map([['/', { mode: 0o40755, mtime: 1000 }], ['/saves', { mode: 0o40755, mtime: 1000 }], ['/outside', { mode: 0o40755, mtime: 1000 }]]);
  let clock = 2000, originalCalls = 0, active = 0, maxActive = 0;
  const parent = path => path.slice(0, path.lastIndexOf('/')) || '/';
  const get = path => { if (!nodes.has(path)) throw new Error('Missing ' + path); return nodes.get(path); };
  const api = {
    isDir: mode => (mode & 0xf000) === 0x4000,
    stat(path) { const n = get(path); return { mode: n.mode, mtime: new Date(n.mtime) }; },
    lstat(path) { return api.stat(path); },
    mkdir(path) { if (nodes.has(path)) throw new Error('Exists'); assert(api.isDir(get(parent(path)).mode)); nodes.set(path, { mode: 0o40755, mtime: ++clock }); },
    writeFile(path, data) { assert(api.isDir(get(parent(path)).mode)); nodes.set(path, { mode: 0o100644, mtime: ++clock, data: new Uint8Array(data) }); },
    readFile(path) { const n = get(path); assert(n.data); return new Uint8Array(n.data); },
    readdir(path) { assert(api.isDir(get(path).mode)); return ['.', '..', ...[...nodes.keys()].filter(n => n !== path && parent(n) === path).map(n => n.slice(n.lastIndexOf('/') + 1))]; },
    unlink(path) { assert(!api.isDir(get(path).mode)); nodes.delete(path); },
    rmdir(path) { assert.equal(api.readdir(path).length, 2); nodes.delete(path); },
    chmod(path, mode) { const n = get(path); n.mode = (n.mode & 0xf000) | mode; },
    utime(path, atime, mtime) { get(path).mtime = mtime; },
    syncfs(populate, callback) { originalCalls++; active++; maxActive = Math.max(maxActive, active); queueMicrotask(() => { active--; callback(null); }); },
  };
  return { api, nodes, originalCalls: () => originalCalls, maxActive: () => maxActive };
}

function fakeIndexedDB() {
  const databases = new Map();
  const controls = { holdWrites: false, pending: [], failOpen: false, failCommit: false, commits: 0, opens: 0 };
  function database(name) {
    if (!databases.has(name)) databases.set(name, new Map());
    return databases.get(name);
  }
  const storage = {
    open(name) {
      controls.opens++;
      const request = {};
      queueMicrotask(() => {
        if (controls.failOpen) { controls.failOpen = false; request.error = new Error('Mock open failure'); request.onerror?.(); return; }
        const fresh = !databases.has(name), data = database(name);
        request.result = {
          objectStoreNames: { contains: key => data.has(key) },
          createObjectStore(key) { data.set(key, new Map()); },
          close() {},
          transaction(key, mode) {
            const original = data.get(key), working = new Map([...original].map(([k, v]) => [k, structuredClone(v)]));
            let count = 0, finished = false, scheduled = false;
            const transaction = {
              error: null,
              abort() { if (finished) return; finished = true; queueMicrotask(() => transaction.onabort?.()); },
              objectStore() {
                function requestFor(fn) {
                  count++;
                  const r = {};
                  queueMicrotask(() => {
                    if (finished) return;
                    try { r.result = fn(); r.onsuccess?.(); }
                    catch (error) { r.error = error; transaction.error = error; r.onerror?.(); transaction.abort(); }
                    count--; schedule();
                  });
                  return r;
                }
                return {
                  get(k) { return requestFor(() => structuredClone(working.get(k))); },
                  put(value, k) { assert.equal(mode, 'readwrite'); return requestFor(() => { working.set(k, structuredClone(value)); return k; }); },
                };
              },
            };
            function finish() {
              if (finished) return;
              if (mode === 'readwrite' && controls.failCommit) {
                controls.failCommit = false; transaction.error = new Error('Mock commit failure'); transaction.abort(); return;
              }
              finished = true;
              if (mode === 'readwrite') { data.set(key, working); controls.commits++; }
              transaction.oncomplete?.();
            }
            function schedule() {
              if (scheduled || finished || count) return;
              scheduled = true;
              queueMicrotask(() => {
                scheduled = false;
                if (count || finished) return;
                if (mode === 'readwrite' && controls.holdWrites) controls.pending.push(finish);
                else finish();
              });
            }
            schedule(); return transaction;
          },
        };
        if (fresh) request.onupgradeneeded?.();
        request.onsuccess?.();
      });
      return request;
    },
  };
  return {
    storage, controls,
    snapshot() { return structuredClone(database('pvz-portable-browser-saves-v1').get('snapshots')?.get('saves')); },
    replace(snapshot) { database('pvz-portable-browser-saves-v1').get('snapshots').set('saves', structuredClone(snapshot)); },
    complete() { const fn = controls.pending.shift(); assert(fn, 'Expected pending atomic commit'); fn(); },
  };
}
function apiFor(db) {
  const context = vm.createContext({ indexedDB: db.storage, Uint8Array, WeakMap, console });
  vm.runInContext('window=globalThis;', context);
  vm.runInContext(source, context, { filename: 'save-storage.js' });
  return context.PVZSaveStorage;
}
const sync = (FS, populate = false) => new Promise((resolve, reject) => FS.syncfs(populate, error => error ? reject(error) : resolve()));
const text = (FS, path) => Buffer.from(FS.readFile(path)).toString();
const put = (FS, path, value) => FS.writeFile(path, Buffer.from(value));

const db = fakeIndexedDB(), first = memoryFS(), api = apiFor(db), FS = first.api;
assert(Object.isFrozen(api));
assert.equal(api.install(FS).fallback, true);
const wrapped = FS.syncfs; assert.equal(api.install(FS).fallback, true); assert.equal(FS.syncfs, wrapped);
await assert.rejects(sync(FS), /not been restored/);
FS.mkdir('/saves/userdata'); FS.mkdir('/saves/empty');
put(FS, '/saves/userdata/users.dat', 'synthetic-index');
put(FS, '/outside/keep', 'untouched');
await sync(FS, true); // No snapshot must not erase the current transient files.
await sync(FS);
const initial = db.snapshot();
assert.equal(initial.version, 1); assert.equal(initial.revision, 1);
assert.equal(initial.entries.find(e => e.path === 'userdata/users.dat').data.length, 15);
assert(initial.entries.some(e => e.path === 'empty' && e.kind === 'directory'));
assert(!initial.entries.some(e => e.path.includes('outside')));
assert.equal(text(FS, '/outside/keep'), 'untouched');
console.log('PASS fallback installation, required population, copied file bytes, empty directories and /saves-only snapshots.');

db.controls.holdWrites = true;
put(FS, '/saves/userdata/users.dat', 'first-write');
let firstDone = false, secondDone = false, calls = 0;
const one = new Promise((resolve, reject) => FS.syncfs(false, error => { calls++; firstDone = true; error ? reject(error) : resolve(); }));
const two = new Promise((resolve, reject) => FS.syncfs(false, error => { calls++; secondDone = true; error ? reject(error) : resolve(); }));
await turns(); assert.equal(db.controls.pending.length, 1); assert(!firstDone && !secondDone);
put(FS, '/saves/userdata/user1.dat', 'late-details');
db.complete(); await turns(); assert(firstDone && !secondDone); assert.equal(db.controls.pending.length, 1);
assert(!db.snapshot().entries.some(e => e.path === 'userdata/user1.dat'), 'First transaction captured its own immutable bytes');
db.complete(); await Promise.all([one, two]);
assert.equal(calls, 2); assert.equal(first.maxActive(), 1); assert(db.snapshot().entries.some(e => e.path === 'userdata/user1.dat'));
db.controls.holdWrites = false;
console.log('PASS native/shell sync calls serialize and each callback waits for its own atomic transaction completion.');

FS.chmod('/saves/userdata/user1.dat', 0o600); FS.utime('/saves/userdata/user1.dat', 123456, 123456);
FS.unlink('/saves/userdata/users.dat'); await sync(FS);
const reload = memoryFS(); put(reload.api, '/outside/keep', 'reload-outside'); apiFor(db).install(reload.api); await sync(reload.api, true);
assert.equal(text(reload.api, '/saves/userdata/user1.dat'), 'late-details');
assert(!reload.nodes.has('/saves/userdata/users.dat')); assert(reload.nodes.has('/saves/empty'));
assert.equal(reload.api.stat('/saves/userdata/user1.dat').mode & 0o777, 0o600);
assert.equal(Number(reload.api.stat('/saves/userdata/user1.dat').mtime), 123456);
assert.equal(text(reload.api, '/outside/keep'), 'reload-outside');
console.log('PASS fresh-runtime restoration preserves exact bytes, modes, mtimes and deletions.');

const beforeFailure = db.snapshot();
put(FS, '/saves/userdata/user1.dat', 'retry-data'); db.controls.failCommit = true;
await assert.rejects(sync(FS), /Mock commit failure/); assert.deepEqual(db.snapshot(), beforeFailure);
await sync(FS); assert.equal(Buffer.from(db.snapshot().entries.find(e => e.path === 'userdata/user1.dat').data).toString(), 'retry-data');
const failedRestore = memoryFS(); put(failedRestore.api, '/saves/keep', 'current-memory'); apiFor(db).install(failedRestore.api);
db.controls.failOpen = true; await assert.rejects(sync(failedRestore.api, true), /Mock open failure/);
assert.equal(text(failedRestore.api, '/saves/keep'), 'current-memory');
await assert.rejects(sync(failedRestore.api), /not been restored/);
await sync(failedRestore.api, true); assert.equal(text(failedRestore.api, '/saves/userdata/user1.dat'), 'retry-data');
console.log('PASS failed transactions leave the previous snapshot intact; failed restore retains memory and blocks destructive persistence until retry.');

const safe = db.snapshot();
db.replace({ version: 1, revision: safe.revision, entries: [{ path: '../outside', kind: 'file', mode: 0o100644, mtime: 1, data: new Uint8Array([1]) }] });
const malformed = memoryFS(); put(malformed.api, '/saves/keep', 'preserve'); apiFor(db).install(malformed.api);
await assert.rejects(sync(malformed.api, true), /invalid path/); assert.equal(text(malformed.api, '/saves/keep'), 'preserve');
await assert.rejects(sync(malformed.api), /not been restored/);
db.replace(safe);
await sync(malformed.api, true);
malformed.nodes.set('/saves/link', { mode: 0o120777, mtime: 1 });
await assert.rejects(sync(malformed.api), /regular files/); assert.deepEqual(db.snapshot(), safe);
console.log('PASS malformed/traversal snapshots and symlinks cannot escape /saves or overwrite the valid stored snapshot.');

const a = memoryFS(), b = memoryFS(); apiFor(db).install(a.api); apiFor(db).install(b.api);
await sync(a.api, true); await sync(b.api, true);
put(a.api, '/saves/userdata/user1.dat', 'tab-a'); await sync(a.api);
put(b.api, '/saves/userdata/user1.dat', 'stale-tab-b');
await assert.rejects(sync(b.api), /another game tab/);
assert.equal(Buffer.from(db.snapshot().entries.find(e => e.path === 'userdata/user1.dat').data).toString(), 'tab-a');
console.log('PASS a stale tab cannot atomically replace another tab\'s newer save snapshot.');

const real = memoryFS(); real.api.filesystems = { IDBFS: {} }; const originalSync = real.api.syncfs;
assert.equal(apiFor(db).install(real.api).fallback, false); assert.equal(real.api.syncfs, originalSync);
const unavailable = vm.createContext({ Uint8Array, WeakMap }); vm.runInContext('window=globalThis', unavailable); vm.runInContext(source, unavailable);
assert.throws(() => unavailable.PVZSaveStorage.install(memoryFS().api), /unavailable/);
console.log('PASS an available real IDBFS backend is preserved and unavailable storage fails visibly.');
