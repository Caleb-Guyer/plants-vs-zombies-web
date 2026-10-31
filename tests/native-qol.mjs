// SPDX-License-Identifier: MIT
// Verify published production source/test coherence, then rerun all native
// QoL tests on the deployment runner. No game or audio device is initialized.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';

const require = createRequire(import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const vendor = {exports: {}};
new Function('module', 'exports', 'require', fs.readFileSync(new URL('vendor/jszip.min.js', dist), 'utf8'))(vendor, vendor.exports, require);
const JSZip = vendor.exports;
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const engine = JSON.parse(fs.readFileSync(new URL('game/engine-provenance.json', dist)));
assert.equal(engine.id, '0.2.6-web-qol.2');
const current = await JSZip.loadAsync(fs.readFileSync(new URL(engine.artifacts.source, new URL('game/engine-provenance.json', dist))), {checkCRC32: true});
const parent = await JSZip.loadAsync(fs.readFileSync(new URL('source/pvz-portable-0.2.6-web-qol.1-source.zip', dist)), {checkCRC32: true});
const prefix = 'qol2-candidate/';
const read = async name => {
  const entry = current.file(prefix + name);
  assert(entry, 'Missing current production source/test: ' + name);
  return Buffer.from(await entry.async('uint8array'));
};
const suites = ['game-speed', 'qol-controls', 'decks-cooldowns'];
const reports = new Map();
let checks = 0;
for (const name of suites) {
  const result = JSON.parse(await read('tests/' + name + '-results.json'));
  assert.match(result.status, /^PASS/);
  assert(result.checks > 0);
  assert.equal(result.failures, 0);
  assert.equal(result.exitCode, 0);
  assert.equal(sha(await read('tests/' + name + '-harness.cpp')), result.generatedHarnessSha256);
  assert(Object.keys(result.sourceSha256).length > 0);
  for (const [source, expected] of Object.entries(result.sourceSha256)) {
    assert.equal(sha(await read(source)), expected, 'Focused result must match current production source');
  }
  checks += result.checks;
  reports.set(name, result);
}
const parentBytes = async name => Buffer.from(await parent.file('qol1-candidate/source/' + name).async('uint8array'));
for (const name of ['src/Lawn/SeedPacket.h', 'src/Lawn/System/SaveGame.cpp', 'src/Lawn/System/PlayerInfo.h']) {
  assert.deepEqual(await read('source/' + name), await parentBytes(name), 'Saved data layout/serialization must remain unchanged');
}
function boardData(bytes) {
  const text = bytes.toString().replace(/\r\n?/g, '\n');
  const start = text.indexOf('class Board : public');
  const end = text.indexOf('Board(LawnApp*', start);
  assert(start >= 0 && end > start);
  return text.slice(start, end);
}
assert.equal(boardData(await read('source/src/Lawn/Board.h')), boardData(await parentBytes('src/Lawn/Board.h')),
  'Board saved data members stay unchanged; the existing KeyUp method may gain an implementation');
console.log(`PASS ${checks} published native QoL checks match their production source; saved object layouts and serializer are preserved.`);

if (process.argv.includes('--run-native')) {
  const temporaryRoot = fs.realpathSync(os.tmpdir());
  const temporary = fs.mkdtempSync(path.join(temporaryRoot, 'pvz-native-qol-'));
  try {
    for (const entry of Object.values(current.files)) {
      if (entry.dir || !entry.name.startsWith(prefix)) continue;
      const name = entry.name.slice(prefix.length);
      if (!name.startsWith('source/') && !name.startsWith('tests/')) continue;
      assert(!name.includes('\\') && !name.split('/').some(part => !part || part === '.' || part === '..' || part.includes(':')));
      const target = path.resolve(temporary, name);
      assert(target.startsWith(temporary + path.sep));
      fs.mkdirSync(path.dirname(target), {recursive: true});
      fs.writeFileSync(target, await entry.async('uint8array'));
    }
    for (const name of suites) {
      const run = spawnSync('python', [path.join(temporary, 'tests/test-' + name + '.py'), '--native'], {encoding: 'utf8'});
      assert.equal(run.status, 0, (run.error?.message || '') + run.stdout + run.stderr);
      const actual = JSON.parse(fs.readFileSync(path.join(temporary, 'tests/' + name + '-results.json')));
      assert.equal(actual.checks, reports.get(name).checks);
      assert.equal(actual.failures, 0);
    }
    console.log(`PASS all ${checks} production-method QoL tests on the native CI compiler.`);
  } finally {
    const resolved = fs.realpathSync(temporary);
    assert.equal(path.dirname(resolved), temporaryRoot);
    assert(path.basename(resolved).startsWith('pvz-native-qol-'));
    fs.rmSync(resolved, {recursive: true});
  }
}
