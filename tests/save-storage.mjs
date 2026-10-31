// Mocked IndexedDB + MEMFS tests; no browser/audio/real saves.
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {source, memoryFS, fakeIndexedDB, apiFor, sync, text, put, turns} from './save-storage-fixtures.mjs';

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
assert.equal(initial.version, 2); assert.equal(initial.revision, 1);
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

const safe = db.snapshot(), safeHistory = db.history();
db.replaceHistory({version: 1, backups: []});
db.replace({ version: 1, revision: safe.revision, entries: [{ path: '../outside', kind: 'file', mode: 0o100644, mtime: 1, data: new Uint8Array([1]) }] });
const malformed = memoryFS(); put(malformed.api, '/saves/keep', 'preserve'); apiFor(db).install(malformed.api);
await assert.rejects(sync(malformed.api, true), /invalid path/); assert.equal(text(malformed.api, '/saves/keep'), 'preserve');
await assert.rejects(sync(malformed.api), /not been restored/);
db.replace(safe); db.replaceHistory(safeHistory);
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
