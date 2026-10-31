// Actual generated loader + bundle loader + launcher with DOM/network/FS doubles.
// No native game, real browser, audio device or installed game files are opened.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash, webcrypto} from 'node:crypto';
const read = name => fs.readFileSync(new URL('../dist/' + name, import.meta.url), 'utf8');
const html = read('index.html');
assert.equal(read('index-port.html'), html);
for (const id of ['file-input', 'resource-zip-input', 'browse-folder-btn', 'browse-zip-btn', 'files-btn', 'cache-forget']) {
  assert(!html.includes('id="' + id + '"'), 'No resource selection UI: ' + id);
}
assert.deepEqual([...html.matchAll(/<input[^>]+id="([^"]+)"[^>]+type="file"/g)].map(match => match[1]),
  ['upload-save-import-input', 'upload-save-import-dir-input']);
assert.equal((html.match(/<nav id="save-toolbar"[\s\S]*?<\/nav>/)[0].match(/<button /g) || []).length, 5);
assert(!/Choose game|Game files<|Return to game files|not hosted here/.test(html));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const bytes = text => new TextEncoder().encode(text);
const pak = bytes('synthetic-game-pak'), properties = bytes('<properties/>');
const descriptor = (path, value) => ({path, size: value.length, sha256: hash(value),
  parts: [{url: './' + path, size: value.length, sha256: hash(value)}]});
const manifest = {schemaVersion: 1, id: 'sha256:' + 'a'.repeat(64), totalBytes: pak.length + properties.length,
  files: [descriptor('main.pak', pak), descriptor('properties/default.xml', properties)]};
const wait = async (condition, message) => {
  for (let i = 0; i < 200 && !condition(); i++) await new Promise(resolve => setTimeout(resolve, 0));
  assert(condition(), message);
};
function browser({importFirst = false, failDownload = false, existingSave = true, suspendedAudio = false, importFailure = false} = {}) {
  const events = [], requests = [], pending = [], downloads = [], errors = [], alerts = [];
  const storage = new Map(importFirst ? [['pvz-show-import', '1']] : []);
  let main = 0, reload = 0, badDownload = failDownload, ready;
  class Node {
    constructor(id = '') {
      this.id = id; this.style = {}; this.hidden = false; this.disabled = false; this.open = false;
      this.width = this.clientWidth = 800; this.height = this.clientHeight = 600;
      this.handlers = new Map(); this.attributes = new Map(); this.clicks = 0; this.value = ''; this.files = [];
      const classes = new Set();
      this.classList = {add: value => classes.add(value), remove: value => classes.delete(value), contains: value => classes.has(value), toggle() {}};
    }
    addEventListener(type, fn, options = {}) { const list = this.handlers.get(type) || []; list.push({fn, capture: !!options.capture}); this.handlers.set(type, list); }
    setAttribute(name, value) { this.attributes.set(name, value); }
    removeAttribute(name) { this.attributes.delete(name); }
    emit(type, fields = {}) {
      const event = {target: this, stop: false, preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() { this.stop = true; }, ...fields};
      let result;
      for (const item of [...(this.handlers.get(type) || [])].sort((a, b) => b.capture - a.capture)) {
        result = item.fn(event); if (event.stop) return result;
      }
      return typeof this['on' + type] === 'function' ? this['on' + type](event) : result;
    }
    click() { this.clicks++; if (!this.id) downloads.push({name: this.download, href: this.href}); return this.emit('click'); }
    focus() { events.push('focus:' + this.id); }
    showModal() { this.open = true; }
    close() { if (!this.open) return; this.open = false; this.emit('close'); }
    appendChild() {}
  }
  const nodes = new Map([...html.matchAll(/\bid="([^"]+)"/g)].map(match => [match[1], new Node(match[1])]));
  const el = id => { assert(nodes.has(id), 'Actual HTML contains ' + id); return nodes.get(id); };
  const body = new Node('body');
  const document = {baseURI: 'https://game.example/', body, fullscreenElement: null,
    getElementById: el, createElement: () => new Node(), addEventListener() {}};
  const files = new Map(existingSave ? [['/saves/userdata/users.dat', bytes('existing-profile-index')]] : []);
  const FS = {
    mkdir(path) { events.push('mkdir:' + path); },
    stat(path) { if (path === '/saves') return {mode: 0o40755}; if (!files.has(path)) throw Error('Absent'); return {size: files.get(path).length, mode: 0o100644}; },
    isDir: mode => mode === 0o40755,
    writeFile(path, data) { files.set(path, new Uint8Array(data)); events.push('write:' + path); },
    readFile(path) { assert(files.has(path), path); return files.get(path); },
    syncfs(populate, callback) { events.push(populate ? 'restore-saves' : 'persist-saves'); pending.push({populate, callback}); },
  };
  const readyPromise = new Promise(resolve => { ready = resolve; });
  class URLs extends URL { static createObjectURL() { return 'blob:save-only'; } static revokeObjectURL() {} }
  const context = vm.createContext({console: {warn() {}, error: (...args) => errors.push(args)},
    document, Blob, URL: URLs, URLSearchParams, TextEncoder, TextDecoder, Uint8Array, Map, Promise,
    crypto: webcrypto, AbortController, indexedDB: {open() { throw Error('No resource storage'); }},
    setTimeout, clearTimeout, setInterval: () => 1, clearInterval() {}, requestAnimationFrame() {},
    addEventListener() {}, removeEventListener() {}, location: {reload() { reload++; }}, moduleReadyPromise: readyPromise,
    sessionStorage: {getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key)},
    fetch: async url => {
      requests.push(url);
      if (badDownload) { badDownload = false; throw Error('Network unavailable'); }
      if (url.endsWith('/manifest.json')) return {ok: true, json: async () => structuredClone(manifest)};
      const data = url.endsWith('/main.pak') ? pak : url.endsWith('/properties/default.xml') ? properties : null;
      assert(data, 'Only declared game assets downloaded: ' + url);
      return {ok: true, arrayBuffer: async () => data.buffer};
    },
    Module: {FS, canvas: el('canvas'), callMain() { events.push('native-main'); main++; }},
    PVZSaveStorage: {install() { events.push('install-save-storage'); return {fallback: true}; }},
    PVZAudio: {subscribe(fn) { fn(false); }, isMuted: () => false, setMuted() {}, resume: () => suspendedAudio ? new Promise(() => {}) : Promise.resolve(), prepareRegistry: async () => { events.push('prepare-audio'); }},
    buildSteamCompatibilityXml() { events.push('steam-compat'); return '<compat/>'; },
    PVZSaveTransfer: {
      async importZip(filesystem, zip, file, persist) { assert.equal(filesystem, FS); assert.equal(file.name, 'only-saves.zip');
        if (importFailure) throw Error('Invalid save archive');
        FS.writeFile('/saves/userdata/users.dat', bytes('imported-profile-index')); await persist(); events.push('import-durable'); },
      async importFiles(filesystem, selected, persist) { assert.equal(filesystem, FS); assert.equal(selected[0].webkitRelativePath, 'userdata/users.dat');
        if (importFailure) throw Error('Invalid save folder');
        FS.writeFile('/saves/userdata/users.dat', bytes('imported-profile-index')); await persist(); events.push('import-durable'); },
      async exportZip(filesystem) { assert.equal(filesystem, FS); events.push('export-saves'); return new Blob([FS.readFile('/saves/userdata/users.dat')]); },
    }, JSZip: {}, alert: message => alerts.push(message), confirm: () => true,
  });
  vm.runInContext('window=globalThis', context);
  for (const name of ['loader.js', 'bundled-assets.js', 'launcher.js']) vm.runInContext(read(name), context, {filename: name});
  return {context, el, events, files, requests, pending, downloads, errors, alerts, storage, resolveModule: ready,
    main: () => main, reloads: () => reload,
    finish(populate) { const index = pending.findIndex(item => item.populate === populate); assert(index >= 0); pending.splice(index, 1)[0].callback(null); }};
}

for (const existingSave of [false, true]) {
  const page = browser({existingSave, suspendedAudio: !existingSave});
  await wait(() => page.requests.length === 3, 'Automatic asset fetch without a picker');
  assert.equal(page.main(), 0); assert.equal(page.events.some(value => value.startsWith('write:')), false);
  page.resolveModule(); await wait(() => page.pending.some(item => item.populate), 'Native start waits for existing save restore');
  assert.equal(page.main(), 0);
  page.finish(true); await page.context.PVZLaunch.ready;
  assert.equal(page.main(), 1);
  assert.deepEqual(page.files.get('/main.pak'), pak);
  assert.deepEqual(page.files.get('/properties/default.xml'), properties);
  assert(page.events.indexOf('restore-saves') < page.events.indexOf('steam-compat'));
  assert(page.events.indexOf('prepare-audio') < page.events.indexOf('native-main'));
  assert.equal([...page.files].filter(([path]) => path.startsWith('/saves')).length, existingSave ? 1 : 0, 'No QA profile or synthetic fresh-user save is injected');
  if (existingSave) assert.equal(new TextDecoder().decode(page.files.get('/saves/userdata/users.dat')), 'existing-profile-index');
  await page.context.startGame(); assert.equal(page.main(), 1);
  assert.equal(page.el('upload-save-import-input').clicks, 0); assert.equal(page.el('upload-save-import-dir-input').clicks, 0);
}
console.log('PASS actual automatic asset/module/save/compatibility/audio/native-start order; existing profiles preserved, fresh profiles left to original engine, exactly one start and no file prompt.');

const retry = browser({failDownload: true}); retry.resolveModule();
assert.equal(await retry.context.PVZLaunch.ready, false);
assert.equal(retry.main(), 0); assert.equal(retry.el('retry-load').hidden, false);
assert(retry.el('loading-drop-zone').textContent.includes('retry'));
const retrying = retry.el('retry-load').click();
await wait(() => retry.pending.some(item => item.populate), 'Retry reaches native save restore');
retry.finish(true); await retrying; assert.equal(retry.main(), 1);
console.log('PASS actual visible fetch failure and one-click retry; engine never starts from partial/failed resources.');

const importing = browser({importFirst: true}); importing.resolveModule();
await importing.context.PVZLaunch.ready;
assert.equal(importing.el('more-dialog').open, true); assert.equal(importing.main(), 0);
importing.el('upload-save-import-btn').click(); assert.equal(importing.el('upload-save-import-input').clicks, 1);
const input = importing.el('upload-save-import-input'); input.files = [{name: 'only-saves.zip'}]; input.emit('change');
assert.equal(importing.el('save-import-status').textContent, 'Importing saves...');
await wait(() => importing.pending.some(item => item.populate), 'Import first restores saved data');
importing.el('more-close').click(); assert.equal(importing.main(), 0, 'Closing More during import must not race native profile loading');
importing.finish(true); await wait(() => importing.pending.some(item => !item.populate), 'Imported saves must persist');
assert.equal(importing.main(), 0); importing.finish(false);
await wait(() => importing.main() === 1, 'Completion of import resumes automatic start');
assert.equal(importing.el('save-import-status').textContent, 'Save imported. Close controls to continue.');
assert.equal(importing.alerts.length, 0, 'Successful save import never opens a native alert');
assert(importing.events.indexOf('import-durable') < importing.events.indexOf('native-main'));
assert.equal(new TextDecoder().decode(importing.files.get('/saves/userdata/users.dat')), 'imported-profile-index');

importing.el('import-btn').click(); assert.equal(importing.el('return-files-dialog').open, true);
const leaving = importing.el('return-files-confirm').click();
assert.equal(importing.reloads(), 0); assert.equal(importing.storage.has('pvz-show-import'), false);
await wait(() => importing.pending.some(item => !item.populate), 'Live import waits for final durable save flush');
importing.finish(false); await leaving;
assert.equal(importing.reloads(), 1); assert.equal(importing.storage.get('pvz-show-import'), '1');
assert.equal(input.clicks, 1, 'Live import did not open a resource or save picker against stale native RAM');

const exporting = importing.el('save-export-btn').click();
await wait(() => importing.pending.some(item => !item.populate), 'Export awaits save flush');
importing.finish(false); await exporting;
assert.equal(importing.downloads.at(-1).name, 'pvz-portable-savedata.zip');
assert(importing.events.includes('export-saves'));
assert(importing.requests.every(path => !path.includes('test-profiles')), 'No optional QA profiles loaded automatically');
console.log('PASS save-only import/export, import-before-start race, durable reload before live-profile replacement, and no automatic QA fixture changes.');

for (const folder of [false, true]) for (const importFailure of [false, true]) {
  const page = browser({importFirst: true, importFailure}); page.resolveModule();
  await page.context.PVZLaunch.ready;
  const selected = folder ? [{webkitRelativePath: 'userdata/users.dat'}] : {name: 'only-saves.zip'};
  const button = page.el(folder ? 'upload-save-import-dir-btn' : 'upload-save-import-btn');
  const operation = folder ? page.context.importSaveDirectory(selected, button) : page.context.importSaves(selected, button);
  const status = page.el('save-import-status');
  assert.equal(status.hidden, false); assert.equal(status.textContent, 'Importing saves...');
  await wait(() => page.pending.some(item => item.populate), 'Save import awaits native save restoration');
  page.finish(true);
  if (!importFailure) {
    await wait(() => page.pending.some(item => !item.populate), 'Success must wait for transactional import persistence');
    assert.equal(status.textContent, 'Importing saves...');
    page.finish(false);
  }
  await operation;
  assert.equal(status.textContent, importFailure ? 'Save import failed. Please try again.' : 'Save imported. Close controls to continue.');
  assert.equal(button.disabled, false); assert.equal(page.el('more-dialog').open, true); assert.equal(page.main(), 0);
  if (importFailure) assert.equal(new TextDecoder().decode(page.files.get('/saves/userdata/users.dat')), 'existing-profile-index');
  else assert.equal(page.alerts.length, 0);
}
console.log('PASS ZIP/folder import status stays inside More, success follows durable commit without alerts, and failure restores the button and preserves existing data.');
