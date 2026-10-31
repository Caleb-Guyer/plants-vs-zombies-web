// All audio is mocked. This test never opens an audio device or game resources.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../dist/audio-controls.js', import.meta.url), 'utf8');
const MIGRATION = 'pvz-audio-registry-migrated-v3';

function browser({ search = '', storage = new Map() } = {}) {
  const warnings = [], listeners = new Map();
  class AudioNode {
    constructor(context) { this.context = context; this.connections = []; }
    connect(destination) { this.connections.push(destination); return destination; }
  }
  class BaseAudioContext {
    constructor() { this.currentTime = 0; this.state = 'suspended'; this.destination = { speaker: true }; this.resumeCalls = 0; this.suspendCalls = 0; }
    createGain() { const gain = new AudioNode(this); gain.gain = { value: 1, cancelScheduledValues() {}, setValueAtTime(value) { this.value = value; } }; return gain; }
    resume() { this.resumeCalls++; this.state = 'running'; return Promise.resolve(); }
    suspend() { this.suspendCalls++; this.state = 'suspended'; return Promise.resolve(); }
  }
  class AudioContext extends BaseAudioContext {}
  class HTMLMediaElement {
    constructor() { this._muted = false; this._volume = 1; this.playCalls = 0; }
    get muted() { return this._muted; } set muted(value) { this._muted = !!value; }
    get volume() { return this._volume; }
    set volume(value) { value = Number(value); if (!Number.isFinite(value) || value < 0 || value > 1) throw RangeError('Invalid native volume'); this._volume = value; }
    play() { this.playCalls++; return Promise.resolve(); }
  }
  class Audio extends HTMLMediaElement {}
  const document = {
    documentElement: {}, querySelectorAll: () => [],
    createElement: tag => /^(audio|video)$/i.test(tag) ? new HTMLMediaElement() : {},
    addEventListener(type, fn) { listeners.set('document:' + type, fn); },
  };
  const context = vm.createContext({
    location: { search }, URLSearchParams, TextEncoder, TextDecoder, DataView, Uint8Array,
    AudioNode, BaseAudioContext, AudioContext, HTMLMediaElement, Audio, document,
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)) },
    addEventListener(type, fn) { listeners.set('window:' + type, fn); },
    console: { warn: (...args) => warnings.push(args) },
  });
  vm.runInContext(source, context, { filename: 'audio-controls.js' });
  return { context, api: context.PVZAudio, storage, warnings, listeners, AudioNode, AudioContext, document };
}
function routedSource(b) {
  const context = new b.AudioContext(), node = new b.AudioNode(context);
  assert.equal(node.connect(context.destination), context.destination);
  const master = node.connections[0]; assert.notEqual(master, context.destination); assert.equal(master.connections[0], context.destination);
  return { context, node, master, hardware: sample => context.state === 'running' ? sample * master.gain.value : 0 };
}

const normal = browser();
assert(Object.isFrozen(normal.api)); assert.equal(normal.api.isMuted(), false); assert.equal(normal.storage.has('pvz-muted'), false);
const output = routedSource(normal); assert.equal(output.master.gain.value, 1); await normal.api.resume(); assert.equal(output.hardware(.75), .75);
const stateChanges = []; const unsubscribe = normal.api.subscribe(value => stateChanges.push(value));
const media = new normal.context.Audio(); media.volume = .42; await media.play(); assert.equal(media.muted, false);
assert.equal(normal.api.setMuted(true), true); assert.equal(output.hardware(.75), 0); assert.equal(media.muted, true); assert.equal(media.volume, .42); assert.equal(normal.storage.get('pvz-muted'), 'true');
media.volume = .27; media.muted = false; assert.equal(media.muted, true);
assert.equal(normal.api.setMuted(false), false); assert.equal(output.hardware(.75), .75); assert.equal(media.muted, false); assert.equal(media.volume, .27);
assert.deepEqual(stateChanges, [false, true, false]); unsubscribe(); normal.api.setMuted(true); assert.equal(stateChanges.length, 3);
const independentlyMuted = new normal.context.Audio(); independentlyMuted.muted = true; independentlyMuted.volume = .12;
normal.api.setMuted(false); assert.equal(independentlyMuted.muted, true); assert.equal(independentlyMuted.volume, .12);
assert.throws(() => { media.volume = 2; }, RangeError);
assert.equal(output.context.suspendCalls, 0);
console.log('PASS audible default, persisted master toggles, subscription, own media mute/volume restoration, and no context suspension.');

const reload = browser({ storage: normal.storage }); assert.equal(reload.api.isMuted(), false);
const preferred = browser({ storage: new Map([['pvz-muted', 'true']]) }); assert.equal(preferred.api.isMuted(), true); assert.equal(routedSource(preferred).master.gain.value, 0);
console.log('PASS explicit mute preference survives reload; absence of a preference remains audible.');

const testing = browser({ search: '?testing=1', storage: new Map([['pvz-muted', 'false']]) });
const testOutput = routedSource(testing); await testing.api.resume(); assert.equal(testing.api.isMuted(), true); assert.equal(testOutput.hardware(1), 0);
testing.api.setMuted(false); assert.equal(testOutput.master.gain.value, 0); assert.equal(testOutput.hardware(1), 0);
testing.api.setMuted(true); testing.api.setMuted(false); assert.equal(testOutput.hardware(1), 0);
const testMedia = new testing.context.Audio(); testMedia.muted = false; testMedia.volume = 1; await testMedia.play(); assert.equal(testMedia.muted, true);
const testVideo = testing.document.createElement('video'); testVideo.muted = false; await testVideo.play(); assert.equal(testVideo.muted, true);
let mixedFrames = 0; const pcm = new Float32Array(32);
const nativeCallback = () => { mixedFrames++; pcm.fill(.75); testOutput.context.currentTime += .01; };
testOutput.node.onaudioprocess = nativeCallback;
for (let i = 0; i < 5; i++) testOutput.node.onaudioprocess();
assert.equal(testOutput.node.onaudioprocess, nativeCallback); assert.equal(mixedFrames, 5); assert.equal(testOutput.context.currentTime, .05);
assert(pcm.every(value => value === .75)); assert.equal(testOutput.hardware(pcm[0]), 0); assert.equal(testOutput.context.suspendCalls, 0);
console.log('PASS testing=1 always silences output despite toggles/resume while native callbacks, PCM, and clocks keep running.');

function makeRegistry({ music = 0, sfx = 0, muted = 1, key = 'SOFTWARE\\PopCap\\PlantsVsZombies' } = {}) {
  const parts = []; const bytes = value => parts.push(Buffer.from(value));
  const u32 = value => { const data = Buffer.alloc(4); data.writeUInt32LE(value); bytes(data); };
  const string = value => { const data = Buffer.from(value + '\0'); u32(data.length); bytes(data); };
  bytes('REGEMU'); bytes([1, 0]); u32(2);
  string(key); u32(5);
  for (const [name, value] of [['MusicVolume', music], ['SfxVolume', sfx], ['Muted', muted]]) { string(name); u32(4); u32(4); u32(value); }
  string('CurUser'); u32(1); const name = Buffer.from('BrowserQA1'); u32(name.length); bytes(name);
  string('OtherBinary'); u32(3); u32(4); bytes([1, 2, 254, 255]);
  string('SOFTWARE\\UnrelatedApp'); u32(3);
  for (const [name, value] of [['MusicVolume', 0], ['SfxVolume', 0], ['Muted', 1]]) { string(name); u32(4); u32(4); u32(value); }
  return new Uint8Array(Buffer.concat(parts));
}
function readRegistry(value) {
  const bytes = Buffer.from(value); let offset = 8;
  const u32 = () => { const value = bytes.readUInt32LE(offset); offset += 4; return value; };
  const string = () => { const size = u32(), value = bytes.toString('utf8', offset, offset + size - 1); offset += size; return value; };
  const count = u32(), keys = new Map();
  for (let i = 0; i < count; i++) {
    const key = string(), count = u32(), values = new Map();
    for (let j = 0; j < count; j++) { const name = string(), type = u32(), size = u32(), data = bytes.subarray(offset, offset + size); offset += size; values.set(name, { type, data }); }
    keys.set(key, values);
  }
  assert.equal(offset, bytes.length); return keys;
}
function filesystem(registry) {
  const files = new Map(); if (registry) files.set('/saves/registry.regemu', registry);
  return {
    files, writes: 0, syncs: 0, syncError: null,
    readFile(path) { if (!files.has(path)) throw Object.assign(Error('Missing'), { errno: 44 }); return new Uint8Array(files.get(path)); },
    writeFile(path, value) { this.writes++; files.set(path, new Uint8Array(value)); },
    syncfs(populate, callback) { assert.equal(populate, false); this.syncs++; queueMicrotask(() => callback(this.syncError)); },
  };
}
const customKey = 'SOFTWARE\\PopCap\\PlantsVsZombies\\Steam';
const legacy = browser(), legacyFS = filesystem(makeRegistry({ key: customKey }));
legacyFS.files.set('/properties/partner.xml', new TextEncoder().encode('<Properties><String id="RegistryKey">PopCap\\PlantsVsZombies\\Steam</String></Properties>'));
const migration = await legacy.api.prepareRegistry(legacyFS); assert.equal(migration.migrated, true); assert.equal(migration.persisted, true);
assert.equal(legacyFS.writes, 1); assert.equal(legacyFS.syncs, 1); assert.equal(legacy.storage.get(MIGRATION), '1');
const parsed = readRegistry(legacyFS.files.get('/saves/registry.regemu')), settings = parsed.get(customKey);
for (const [name, expected] of [['MusicVolume', 85], ['SfxVolume', 55], ['Muted', 0]]) assert.equal(settings.get(name).data.readUInt32LE(), expected);
assert.equal(settings.get('CurUser').data.toString(), 'BrowserQA1'); assert.deepEqual([...settings.get('OtherBinary').data], [1, 2, 254, 255]);
assert.equal(parsed.get('SOFTWARE\\UnrelatedApp').get('Muted').data.readUInt32LE(), 1);
assert.equal(legacy.api.isMuted(), false); assert.equal(legacy.storage.has('pvz-muted'), false);
await legacy.api.prepareRegistry(legacyFS); assert.equal(legacyFS.writes, 1);
console.log('PASS one-time exact legacy migration restores native defaults, preserves current user/binary/other keys, and persists before its marker.');

for (const original of [makeRegistry({ music: 25, sfx: 13, muted: 1 }), makeRegistry({ music: 0, sfx: 0, muted: 0 }), makeRegistry({ music: 0, sfx: 55, muted: 1 })]) {
  const b = browser(), f = filesystem(original); const result = await b.api.prepareRegistry(f);
  assert.equal(result.migrated, false); assert.equal(f.writes, 0); assert.deepEqual(f.files.get('/saves/registry.regemu'), original); assert.equal(b.storage.get(MIGRATION), '1');
}
const alreadyChecked = browser({ storage: new Map([[MIGRATION, '1']]) }), zeroSettings = filesystem(makeRegistry());
assert.equal((await alreadyChecked.api.prepareRegistry(zeroSettings)).migrated, false); assert.equal(zeroSettings.writes, 0);
const newUser = browser(), emptyFS = filesystem(); assert.equal((await newUser.api.prepareRegistry(emptyFS)).reason, 'new-player'); assert.equal(emptyFS.writes, 0); assert.equal(newUser.api.isMuted(), false);
const malformed = browser(), brokenFS = filesystem(new Uint8Array([1, 2, 3])); assert.equal((await malformed.api.prepareRegistry(brokenFS)).reason, 'unrecognized'); assert.equal(brokenFS.writes, 0); assert.equal(malformed.storage.has(MIGRATION), false);
const retry = browser(), unsynced = filesystem(makeRegistry()); unsynced.syncError = Error('Storage unavailable');
assert.equal((await retry.api.prepareRegistry(unsynced)).persisted, false); assert.equal(retry.storage.has(MIGRATION), false);
console.log('PASS custom native volumes, later intentional zero settings, new users, malformed registries, and failed persistence remain safe.');
console.log('All audio control checks passed with fully mocked output.');
