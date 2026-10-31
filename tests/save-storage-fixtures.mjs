// Mocked IndexedDB + MEMFS tests: no browser, audio device, assets, or saves.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../dist/save-storage.js', import.meta.url), 'utf8');
const coreSource = fs.readFileSync(new URL('../dist/save-storage-core.js', import.meta.url), 'utf8');
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
  const controls = { failPut: false, holdWrites: false, pending: [], failOpen: false, failCommit: false, commits: 0, opens: 0 };
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
                  put(value, k) { assert.equal(mode, 'readwrite'); return requestFor(() => { if (controls.failPut) { controls.failPut = false; throw Object.assign(new Error('Mock quota failure'), {name: 'QuotaExceededError'}); } working.set(k, structuredClone(value)); return k; }); },
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
    history() { return structuredClone(database('pvz-portable-browser-saves-v1').get('snapshots')?.get('save-history')); },
    replaceHistory(value) { database('pvz-portable-browser-saves-v1').get('snapshots').set('save-history', structuredClone(value)); },
    damagedCurrent() { return structuredClone(database('pvz-portable-browser-saves-v1').get('snapshots')?.get('save-damaged-current')); },
    replace(snapshot) { database('pvz-portable-browser-saves-v1').get('snapshots').set('saves', structuredClone(snapshot)); },
    complete() { const fn = controls.pending.shift(); assert(fn, 'Expected pending atomic commit'); fn(); },
  };
}
function apiFor(db) {
  const context = vm.createContext({ indexedDB: db.storage, Uint8Array, WeakMap, console });
  vm.runInContext('window=globalThis;', context);
  vm.runInContext(coreSource, context, { filename: 'save-storage-core.js' });
  vm.runInContext(source, context, { filename: 'save-storage.js' });
  return context.PVZSaveStorage;
}
const sync = (FS, populate = false) => new Promise((resolve, reject) => FS.syncfs(populate, error => error ? reject(error) : resolve()));
const text = (FS, path) => Buffer.from(FS.readFile(path)).toString();
const put = (FS, path, value) => FS.writeFile(path, Buffer.from(value));


export {source, memoryFS, fakeIndexedDB, apiFor, sync, text, put, turns};
