// SPDX-License-Identifier: MIT
// Bind the published source to its tested speed implementation. In CI, rerun
// the actual production-method tests with the runner's native C++ compiler.
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
assert.equal(engine.id, '0.2.6-web-qol.1');
const current = await JSZip.loadAsync(fs.readFileSync(new URL(engine.artifacts.source, new URL('game/engine-provenance.json', dist))), {checkCRC32: true});
const parent = await JSZip.loadAsync(fs.readFileSync(new URL('source/pvz-portable-0.2.6-web-software.10-source.zip', dist)), {checkCRC32: true});
const prefix = 'qol1-candidate/';
const read = async name => {
  const entry = current.file(prefix + name);
  assert(entry, 'Missing current source/test: ' + name);
  return Buffer.from(await entry.async('uint8array'));
};
const result = JSON.parse(await read('tests/game-speed-results.json'));
assert.match(result.status, /^PASS/);
assert.equal(result.checks, 64);
assert.equal(result.failures, 0);
assert.equal(result.exitCode, 0);
assert.equal(sha(await read('tests/game-speed-harness.cpp')), result.generatedHarnessSha256);
for (const [name, expected] of Object.entries(result.sourceSha256)) {
  assert.equal(sha(await read(name)), expected, 'Focused result must match actual packaged production source');
}
for (const name of ['src/Lawn/Board.h', 'src/Lawn/System/SaveGame.cpp']) {
  const old = Buffer.from(await parent.file('software10-candidate/source/' + name).async('uint8array'));
  assert.deepEqual(await read('source/' + name), old, 'QoL must preserve board layout and save serialization');
}
console.log('PASS published speed-test source/harness/result agree; Board layout and save serializer are byte-identical to Software.10.');

if (process.argv.includes('--run-native')) {
  const temporaryRoot = fs.realpathSync(os.tmpdir());
  const temporary = fs.mkdtempSync(path.join(temporaryRoot, 'pvz-game-speed-'));
  try {
    // Explicit files only: do not extract arbitrary archive paths.
    for (const name of ['source/src/LawnApp.cpp', 'source/src/Lawn/Board.cpp', 'tests/test-game-speed.py']) {
      const target = path.join(temporary, name);
      fs.mkdirSync(path.dirname(target), {recursive: true});
      fs.writeFileSync(target, await read(name));
    }
    const run = spawnSync('python', [path.join(temporary, 'tests/test-game-speed.py'), '--native'], {encoding: 'utf8'});
    assert.equal(run.status, 0, (run.error?.message || '') + run.stdout + run.stderr);
    const actual = JSON.parse(fs.readFileSync(path.join(temporary, 'tests/game-speed-results.json')));
    assert.equal(actual.checks, 64);
    assert.equal(actual.failures, 0);
    console.log('PASS 64 actual production-method speed tests on the native CI compiler.');
  } finally {
    const resolved = fs.realpathSync(temporary);
    assert.equal(path.dirname(resolved), temporaryRoot);
    assert(path.basename(resolved).startsWith('pvz-game-speed-'));
    fs.rmSync(resolved, {recursive: true});
  }
}
