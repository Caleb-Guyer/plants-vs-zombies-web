// Actual bundle loader with synthetic responses/storage; no game, browser or audio.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash, webcrypto} from 'node:crypto';
const source = fs.readFileSync(new URL('../dist/bundled-assets.js', import.meta.url), 'utf8');
const hash = data => createHash('sha256').update(data).digest('hex');
const base = 'https://game.example/game-assets/manifest.json';
const encode = value => new TextEncoder().encode(value);
function fixture(mark = 'a', id = mark.repeat(64)) {
  const pieces = [encode('first-' + mark), encode('second-' + mark), encode('<properties>' + mark)];
  const main = new Uint8Array([...pieces[0], ...pieces[1]]);
  const part = (index, url) => ({url, size: pieces[index].length, sha256: hash(pieces[index])});
  const manifest = {schemaVersion: 1, id: 'sha256:' + id, totalBytes: main.length + pieces[2].length,
    files: [{path: 'main.pak', size: main.length, sha256: hash(main), parts: [part(0, './parts/0.bin'), part(1, './parts/1.bin')]},
      {path: 'properties/default.xml', size: pieces[2].length, sha256: hash(pieces[2]), parts: [part(2, './properties/default.xml')]}]};
  const parts = new Map([['parts/0.bin', pieces[0]], ['parts/1.bin', pieces[1]], ['properties/default.xml', pieces[2]]]);
  return {manifest, main, parts};
}
function harness(initial = fixture(), cache = {}) {
  let data = initial, saved = cache.value, writes = 0, failure = null;
  const calls = [], progress = [];
  const context = vm.createContext({console, Blob, URL, TextEncoder, Uint8Array, AbortController,
    setTimeout, clearTimeout, crypto: webcrypto, document: {baseURI: 'https://game.example/'}});
  vm.runInContext(source, context);
  const storage = {async get() { if (cache.fail) throw Error('Storage unavailable'); return saved; },
    async put(value) { if (cache.fail) throw Error('Storage unavailable'); saved = value; writes++; }};
  const request = async (url, options) => {
    calls.push(url); assert.equal(options.cache, 'no-store');
    if (failure) { const error = failure; failure = null; if (error === 'http') return {ok: false, status: 503}; throw Error(error); }
    if (url === base) return {ok: true, json: async () => structuredClone(data.manifest)};
    const value = data.parts.get(new URL(url).pathname.replace('/game-assets/', ''));
    assert(value, 'Only declared asset requests occur: ' + url);
    return {ok: true, arrayBuffer: async () => value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength)};
  };
  const create = () => context.PVZAssetBundle.createLoader({fetch: request, crypto: webcrypto, cache: storage, manifestURL: base,
    onProgress: state => progress.push(state)});
  return {context, create, calls, progress, cache: () => saved, writes: () => writes,
    set(next) { data = next; }, fail(message) { failure = message; }};
}
const first = fixture(), h = harness(first), loader = h.create();
const [loaded, duplicate] = await Promise.all([loader.load(), loader.load()]);
assert.equal(loaded, duplicate, 'Concurrent callers share one fetch/reassembly');
assert.deepEqual([...h.calls], [base, 'https://game.example/game-assets/parts/0.bin', 'https://game.example/game-assets/parts/1.bin', 'https://game.example/game-assets/properties/default.xml']);
assert.deepEqual(new Uint8Array(await loaded.files.get('main.pak').arrayBuffer()), first.main);
assert.equal(h.writes(), 1);
assert.equal(h.progress.at(-1).loaded, first.manifest.totalBytes);
h.calls.length = 0;
assert.equal((await h.create().load()).cached, true);
assert.deepEqual(h.calls, [base], 'A verified warm cache downloads only the fresh manifest');
console.log('PASS ordered part reassembly, all-byte integrity, progress, one concurrent download and verified warm cache.');

for (const next of [fixture('b'), fixture('c', 'a'.repeat(64))]) {
  const oldCache = h.cache(), changed = harness(next, {value: oldCache});
  assert.equal((await changed.create().load()).cached, false);
  assert.equal(changed.calls.length, 4, 'New bundle ID or changed catalog must replace old resources');
}
for (const corrupt of [
  {...h.cache(), files: {}},
  {...h.cache(), files: h.cache().files.map(entry => entry.path === 'main.pak' ? {...entry, blob: new Blob([new Uint8Array(first.main.length)])} : entry)},
  {...h.cache(), files: h.cache().files.map(entry => entry.path === 'main.pak' ? {...entry, blob: {size: first.main.length, arrayBuffer: async () => { throw Error('Broken cache'); }}} : entry)},
]) {
  const broken = harness(first, {value: corrupt});
  assert.equal((await broken.create().load()).cached, false);
  assert.equal(broken.calls.length, 4);
}
assert.equal((await harness(first, {fail: true}).create().load()).files.size, 2);
console.log('PASS bundle-version/catalog isolation, corrupt cache recovery and playable download when storage fails.');

for (const failure of ['http', 'offline']) {
  const retry = harness(); retry.fail(failure); const client = retry.create();
  await assert.rejects(client.load()); assert.equal(retry.writes(), 0);
  assert.equal((await client.load()).files.size, 2);
  assert.equal(retry.writes(), 1, 'Only a complete successful retry is cached');
}
for (const fault of ['part-hash', 'full-hash', 'part-size']) {
  const wrong = fixture();
  if (fault === 'part-hash') wrong.manifest.files[0].parts[0].sha256 = '0'.repeat(64);
  if (fault === 'full-hash') wrong.manifest.files[0].sha256 = '0'.repeat(64);
  if (fault === 'part-size') wrong.parts.set('parts/0.bin', encode('wrong size'));
  const bad = harness(wrong); await assert.rejects(bad.create().load(), /integrity check/);
  assert.equal(bad.writes(), 0);
}
console.log('PASS HTTP/network retry and rejection of corrupt part, assembled-file hash and byte-length failures before cache publication.');

for (const mutate of [
  m => { m.files[0].path = '../main.pak'; },
  m => { m.files[0].path = 'userdata/user1.dat'; },
  m => { m.files.push(m.files[0]); },
  m => { m.files[0].parts[0].url = 'https://other.example/part'; },
  m => { m.files[0].parts[0].url = '../outside.bin'; },
  m => { m.files[0].parts[0].size = 8 * 1024 * 1024 + 1; },
  m => { m.totalBytes++; },
  m => { m.files[1].path = 'properties/Layout.xml'; },
]) {
  const wrong = fixture(); mutate(wrong.manifest);
  const bad = harness(wrong); await assert.rejects(bad.create().load());
  assert.equal(bad.calls.length, 1, 'Invalid manifests never request asset data');
  assert.equal(bad.writes(), 0);
}
const actualManifest = JSON.parse(fs.readFileSync(new URL('../dist/game-assets/manifest.json', import.meta.url), 'utf8'));
h.context.PVZAssetBundle.validateManifest(actualManifest, base);
console.log('PASS actual shipping manifest schema and strict resource/URL/part-limit/catalog checks.');

// Execute the default IndexedDB adapter: request success is not durable commit.
let value, commit, completed = false;
let signalWriteStarted;
const writeStarted = new Promise(resolve => { signalWriteStarted = resolve; });
const databases = [];
const db = {close() {}, transaction(storeName, mode) {
  assert.equal(storeName, 'bundles'); const transaction = {};
  transaction.objectStore = () => ({
    get(key) { assert.equal(key, 'current'); const request = {};
      queueMicrotask(() => { request.result = value; request.onsuccess(); transaction.oncomplete(); }); return request; },
    put(next, key) { assert.equal(key, 'current'); const request = {};
      queueMicrotask(() => { request.onsuccess(); commit = () => { value = next; transaction.oncomplete(); }; signalWriteStarted(); }); return request; },
  }); return transaction;
}};
const context = vm.createContext({console, Blob, URL, TextEncoder, Uint8Array, AbortController, setTimeout, clearTimeout, crypto: webcrypto,
  document: {baseURI: 'https://game.example/'}, indexedDB: {open(name) { databases.push(name); const request = {};
    queueMicrotask(() => { request.result = db; request.onsuccess(); }); return request; }}});
vm.runInContext(source, context);
const actual = fixture();
const request = async url => url === base ? {ok: true, json: async () => actual.manifest} :
  {ok: true, arrayBuffer: async () => actual.parts.get(new URL(url).pathname.replace('/game-assets/', '')).buffer};
const pending = context.PVZAssetBundle.createLoader({fetch: request}).load().then(result => { completed = true; return result; });
let writeStartTimer;
const writeStartTimeout = new Promise(resolve => {
  writeStartTimer = setTimeout(() => resolve({kind: 'timeout'}), 10000);
});
let writeStart;
try {
  writeStart = await Promise.race([
    writeStarted.then(() => ({kind: 'started'})),
    pending.then(() => ({kind: 'completed'}), error => ({kind: 'failed', error})),
    writeStartTimeout,
  ]);
} finally {
  clearTimeout(writeStartTimer);
}
assert.equal(writeStart.kind, 'started', writeStart.kind === 'failed'
  ? 'Bundle load failed before the IndexedDB write: ' + writeStart.error
  : 'Bundle load must reach its IndexedDB write before completing or timing out');
// Drain the loader's success chain so a request-success/commit regression is visible.
await new Promise(resolve => setImmediate(resolve));
assert(commit); assert.equal(completed, false); assert.equal(value, undefined);
commit(); await pending;
assert(databases.every(name => name === 'pvz-bundled-assets-v1'), 'Resource adapter never opens the save or legacy imported-resource databases');
console.log('PASS actual IndexedDB cache waits for transaction commit and is independent of saves and old imported-resource storage.');
