// Run the actual generator in a disposable tree, never against the live checkout.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const temporaryRoot = fs.realpathSync(os.tmpdir());
const temporary = fs.mkdtempSync(path.join(temporaryRoot, 'pvz-fileless-generator-'));
try {
  for (const relative of ['prepare-port.mjs', 'dist/index.html', 'dist/index-port.html',
    'dist/source/upstream-browser-shell.html.txt', 'dist/game/engine-provenance.json']) {
    const destination = path.join(temporary, relative);
    fs.mkdirSync(path.dirname(destination), {recursive: true});
    fs.copyFileSync(new URL(relative, root), destination);
  }
  const outputs = ['dist/runtime.js', 'dist/loader.js', 'dist/game/VERSION', 'dist/index.html', 'dist/index-port.html'];
  const execute = () => {
    const result = spawnSync(process.execPath, ['prepare-port.mjs'], {cwd: temporary, encoding: 'utf8'});
    assert.equal(result.status, 0, result.stderr);
    return new Map(outputs.map(name => [name, fs.readFileSync(path.join(temporary, name))]));
  };
  const first = execute(), second = execute();
  for (const name of outputs) {
    assert.deepEqual(first.get(name), second.get(name), 'Generator is idempotent: ' + name);
    assert.deepEqual(first.get(name), fs.readFileSync(new URL(name, root)), 'Shipping output matches generator: ' + name);
  }
  const loader = first.get('dist/loader.js').toString();
  assert(!/importResourceZip|handleFileList|fileInput|resourceZipInput|browseFolderBtn|webkitGetAsEntry/.test(loader));
  assert(loader.includes('await ensureSaveFsReady(),await window.beforePvZStart?.()'));
  assert(loader.includes('window.onSaveOperationFinished?.()'));
  assert(loader.includes('Loading game\u2026') && loader.includes('Loading game files\u2026 '), 'Generated progress labels preserve their concise UTF-8 text');
  const engine = JSON.parse(fs.readFileSync(path.join(temporary, 'dist/game/engine-provenance.json'), 'utf8'));
  for (const name of ['dist/index.html', 'dist/index-port.html']) {
    assert(first.get(name).toString().includes('</span> ' + engine.caption + ' \u00a9 2026'), 'Displayed caption matches the current engine: ' + name);
  }
  const page = path.join(temporary, 'dist/index.html');
  fs.writeFileSync(page, fs.readFileSync(page, 'utf8').replace('id="retry-load"', 'id="file-input"'));
  const bad = spawnSync(process.execPath, ['prepare-port.mjs'], {cwd: temporary, encoding: 'utf8'});
  assert.notEqual(bad.status, 0); assert.match(bad.stderr, /Fileless browser shell input required/);
  console.log('PASS actual isolated generator is idempotent, matches shipped files, preserves save/start hooks and rejects reintroduced file-picker inputs.');
} finally {
  const resolved = fs.realpathSync(temporary);
  assert.equal(path.dirname(resolved), temporaryRoot);
  assert(path.basename(resolved).startsWith('pvz-fileless-generator-'));
  fs.rmSync(resolved, {recursive: true});
}
