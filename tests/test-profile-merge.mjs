import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const directory = new URL('../dist/', import.meta.url);
const module = { exports: {} };
new Function('module', 'exports', 'require', fs.readFileSync(new URL('vendor/jszip.min.js', directory), 'utf8'))(module, module.exports, require);
const JSZip = module.exports;
const bytes = fs.readFileSync(new URL('testing/test-profiles.zip', directory));
const browser = vm.createContext({ TextEncoder, TextDecoder, Uint8Array, DataView, console });
vm.runInContext('window=globalThis;', browser);
vm.runInContext(fs.readFileSync(new URL('test-profiles.js', directory), 'utf8'), browser);
const add = vm.runInContext('addPvZTestProfiles', browser);
function summary(profiles) {
  const out = [], header = Buffer.alloc(6); header.writeUInt32LE(14); header.writeUInt16LE(profiles.length, 4); out.push(header);
  for (const p of profiles) { const name = Buffer.from(p.name), row = Buffer.alloc(2); row.writeUInt16LE(name.length); const tail = Buffer.alloc(8); tail.writeUInt32LE(p.sequence); tail.writeUInt32LE(p.id, 4); out.push(row, name, tail); }
  return Buffer.concat(out);
}
function parse(bytes) {
  const b = Buffer.from(bytes); assert.equal(b.readUInt32LE(0), 14); const count = b.readUInt16LE(4); let offset = 6; const result = [];
  for (let i = 0; i < count; i++) { const length = b.readUInt16LE(offset); offset += 2; const name = b.toString('utf8', offset, offset + length); offset += length; result.push({ name, sequence: b.readUInt32LE(offset), id: b.readUInt32LE(offset + 4) }); offset += 8; }
  assert.equal(offset, b.length); return result;
}
const INDEX = '/saves/userdata/users.dat';
function filesystem(profiles = []) {
  const files = new Map(), directories = new Set(['/saves', '/saves/userdata']);
  files.set(INDEX, summary(profiles)); const writes = [];
  const error = () => Object.assign(new Error('Missing'), { errno: 44 });
  return {
    files, writes, failAt: null,
    readFile(path) { if (!files.has(path)) throw error(); return new Uint8Array(files.get(path)); },
    stat(path) { if (files.has(path)) return { mode: 0o100644, size: files.get(path).length }; if (directories.has(path)) return { mode: 0o040755 }; throw error(); },
    isFile(mode) { return (mode & 0o170000) === 0o100000; },
    readdir(path) { if (!directories.has(path)) throw error(); return ['.', '..', ...[...files.keys()].filter(p => p.startsWith(path + '/') && !p.slice(path.length + 1).includes('/')).map(p => p.slice(path.length + 1))]; },
    writeFile(path, value, options = {}) { writes.push(path); if (this.failAt === writes.length) throw Error('Simulated write failure'); if (options.flags === 705 && files.has(path)) throw Object.assign(Error('Exists'), { errno: 20 }); files.set(path, Buffer.from(value)); },
    rename(from, to) { if (!files.has(from)) throw error(); files.set(to, files.get(from)); files.delete(from); },
    unlink(path) { if (!files.delete(path)) throw error(); },
    mkdirTree(path) { directories.add(path); },
  };
}

const originalUser = { name: 'BrowserQA1', sequence: 7, id: 1 };
const normal = filesystem([originalUser]);
const userDetail = Buffer.from('existing user detail bytes: preserve exactly');
normal.files.set('/saves/userdata/user1.dat', userDetail);
normal.files.set('/saves/registry.regemu', Buffer.from('CurUser=BrowserQA1; MusicVolume=0'));
normal.files.set('/saves/userdata/user900001.dat', Buffer.from('orphan collision: preserve'));
normal.files.set('/saves/userdata/game900002_0.v4', Buffer.from('orphan board collision: preserve'));
const merged = await add(normal, JSZip, bytes);
assert.equal(merged.added.length, 6); assert.equal(merged.totalProfiles, 7);
const profiles = parse(normal.readFile(INDEX)); assert.deepEqual(profiles[0], originalUser);
assert.equal(profiles[1].id, 900003); assert(profiles.slice(1).every(p => p.sequence > 7));
assert.deepEqual(normal.files.get('/saves/userdata/user1.dat'), userDetail);
assert.equal(normal.files.get('/saves/userdata/user900001.dat').toString(), 'orphan collision: preserve');
assert.equal(normal.files.get('/saves/userdata/game900002_0.v4').toString(), 'orphan board collision: preserve');
assert.equal(normal.files.get('/saves/registry.regemu').toString(), 'CurUser=BrowserQA1; MusicVolume=0');
console.log('PASS existing BrowserQA1 identity/detail/current-selection preserved; orphan user and board ID collisions avoided.');

const beforeRepeat = Buffer.from(normal.readFile(INDEX)), writesBefore = normal.writes.length;
const repeated = await add(normal, JSZip, bytes); assert.equal(repeated.added.length, 0); assert.equal(repeated.skipped.length, 6);
assert.deepEqual(Buffer.from(normal.readFile(INDEX)), beforeRepeat); assert.equal(normal.writes.length, writesBefore);
console.log('PASS repeat addition skips all existing QA fixtures without any filesystem writes.');

const nameCollision = filesystem([originalUser, { name: 'QA - Full Game', sequence: 8, id: 13 }, { name: 'QA - Night', sequence: 9, id: 14 }]);
nameCollision.files.set('/saves/userdata/user1.dat', userDetail);
nameCollision.files.set('/saves/userdata/user13.dat', Buffer.from('player-owned QA-named detail'));
const renamed = await add(nameCollision, JSZip, bytes);
assert.equal(renamed.skipped.length, 1); assert.equal(renamed.skipped[0].id, 13);
assert(renamed.added.some(p => p.name === 'QA - Night (2)')); assert.equal(nameCollision.files.get('/saves/userdata/user13.dat').toString(), 'player-owned QA-named detail');
assert.equal(parse(nameCollision.readFile(INDEX)).find(p => p.id === 14).name, 'QA - Night');
console.log('PASS existing complete QA-named profile skipped; missing-detail name collision gets a unique new name without replacing its record.');

for (const malformed of [Buffer.from([14, 0, 0]), Buffer.from([13, 0, 0, 0, 0, 0]), Buffer.concat([summary([originalUser]), Buffer.from([99])]), summary([originalUser, { name: 'duplicate ID', sequence: 8, id: 1 }])]) {
  const broken = filesystem(); broken.files.set(INDEX, malformed);
  await assert.rejects(() => add(broken, JSZip, bytes)); assert.equal(broken.writes.length, 0); assert.deepEqual(broken.files.get(INDEX), malformed);
}
console.log('PASS truncated, unsupported-version, trailing-data, and duplicate-ID indexes fail before any writes.');

const failure = filesystem([originalUser]); failure.files.set('/saves/userdata/user1.dat', userDetail); const oldIndex = failure.readFile(INDEX); failure.failAt = 2;
await assert.rejects(() => add(failure, JSZip, bytes), /Simulated write failure/);
assert.deepEqual(failure.readFile(INDEX), oldIndex); assert.deepEqual(failure.files.get('/saves/userdata/user1.dat'), userDetail);
assert.equal(failure.files.size, 2);
console.log('PASS staged write failure rolls back new details and leaves existing index/details intact.');

const fixtureZip = await JSZip.loadAsync(bytes);
for (const profile of profiles.slice(1)) {
  const expected = await fixtureZip.file('userdata/user' + (900001 + ['QA - Full Game', 'QA - Night', 'QA - Pool', 'QA - Fog', 'QA - Roof', 'QA - Boss'].indexOf(profile.name)) + '.dat').async('uint8array');
  assert.deepEqual(Buffer.from(normal.readFile('/saves/userdata/user' + profile.id + '.dat')), Buffer.from(expected));
}
console.log('PASS every new detail file is byte-for-byte identical to its generated fixture despite reassigned IDs.');
console.log('All non-destructive QA profile merge checks passed.');
