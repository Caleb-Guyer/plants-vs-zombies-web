// Native Options fullscreen targets an element rather than document.body.
// Test the real HTML ancestry and generated visibility code; the authenticated
// published parent is the regression control, not a model of browser painting.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {readShellTree, isInside} from './html-structure.mjs';

const dist = new URL('../dist/', import.meta.url);
const read = name => fs.readFileSync(new URL(name, dist), 'utf8');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const before = fs.readFileSync(new URL('fixtures/fullscreen-parent-index.html', import.meta.url));
assert.equal(hash(before), '6c1629dad7cbbc79f8394db1a06f79c643e7c5bfec3a6f26f5b7728e1c4af2e0',
  'Negative control retains exact published Rally.1 parent HTML');

// Bind the containment check to the actual shipping native fullscreen target.
const provenanceUrl = new URL('game/engine-provenance.json', dist);
const provenance = JSON.parse(fs.readFileSync(provenanceUrl, 'utf8'));
const sourceUrl = new URL(provenance.artifacts.source, provenanceUrl);
assert(sourceUrl.href.startsWith(new URL('source/', dist).href));
const sourceBytes = fs.readFileSync(sourceUrl);
assert.equal(hash(sourceBytes), provenance.artifacts.sourceSha256);
const vendor = {exports: {}};
new Function('module', 'exports', 'require', read('vendor/jszip.min.js'))(
  vendor, vendor.exports, createRequire(import.meta.url));
const archive = await vendor.exports.loadAsync(sourceBytes, {checkCRC32: true});
const nativeEntries = Object.values(archive.files).filter(entry => !entry.dir &&
  entry.name.endsWith('/source/src/SexyAppFramework/platform/emscripten/Window.cpp'));
assert.equal(nativeEntries.length, 1);
const native = await nativeEntries[0].async('string');
const requests = [...native.matchAll(/emscripten_request_fullscreen\("(#[^"]+)",\s*EM_FALSE\)/g)];
assert.equal(requests.length, 1);
const targetId = requests[0][1].slice(1);
assert.equal(targetId, 'canvas-container');

const controls = ['save-toolbar', 'mute-btn', 'fullscreen-btn', 'import-btn',
  'save-export-btn', 'more-btn', 'pvz-soft-keyboard', 'upload-save-import-input',
  'upload-save-import-dir-input', 'more-dialog', 'return-files-dialog', 'save-recovery-dialog'];
function checkScope(tree) {
  const container = tree.ids.get(targetId);
  assert(container, 'Native fullscreen container exists');
  for (const id of ['canvas', ...controls, 'upload-screen']) {
    assert(tree.ids.has(id), 'Shell retains ' + id);
    assert(isInside(tree.ids.get(id), container), id + ' is outside native fullscreen');
  }
  const viewport = tree.ids.get('game-viewport');
  assert(viewport && isInside(viewport, container));
  assert(isInside(tree.ids.get('canvas'), viewport));
  for (const id of ['upload-screen', ...controls])
    assert(!isInside(tree.ids.get(id), viewport), id + ' is inside the hidden game viewport');
}
assert.throws(() => checkScope(readShellTree(before.toString())), /save-toolbar is outside native fullscreen/,
  'The real original sibling-toolbar layout must reproduce the regression');

const parentTree = readShellTree(before.toString());
for (const page of ['index.html', 'index-port.html']) {
  const tree = readShellTree(read(page));
  checkScope(tree);
  assert.equal(tree.ids.size, parentTree.ids.size + 1, 'Only the viewport wrapper is added');
  for (const [id, node] of parentTree.ids) {
    assert(tree.ids.has(id), 'Every existing shell element remains: ' + id);
    if (id !== 'engine-build-id')
      assert.deepEqual(tree.ids.get(id).attributes, node.attributes, 'Existing UI attributes stay exact: ' + id);
  }
  const toolbar = tree.ids.get('save-toolbar');
  assert.deepEqual(toolbar.children.map(node => node.attributes.get('id')),
    ['mute-btn', 'fullscreen-btn', 'import-btn', 'save-export-btn', 'more-btn']);
  for (const id of ['more-dialog', 'return-files-dialog', 'save-recovery-dialog'])
    assert.equal(tree.ids.get(id).tag, 'dialog', 'Existing dialogs retain native top-layer behavior');
  // A tempting incorrect nesting also brings the toolbar into fullscreen but
  // hides it whenever the game viewport is hidden for startup or save recovery.
  const bad = readShellTree(read(page));
  bad.ids.get('save-toolbar').parent = bad.ids.get('game-viewport');
  assert.throws(() => checkScope(bad), /save-toolbar is inside the hidden game viewport/);
  const outside = readShellTree(read(page));
  outside.ids.get('upload-screen').parent = outside.root;
  assert.throws(() => checkScope(outside), /upload-screen is outside native fullscreen/);
}
const css = read('port.css');
assert.match(css, /#canvas-container\{display:block;/, 'The fullscreen shell stays visible before game startup');
assert.match(css, /#game-viewport\{display:none;/, 'Only the canvas viewport begins hidden');
const loader = read('loader.js');
assert(!/getElementById\(['"]canvas-container['"]\)\.style\.display\s*=/.test(loader),
  'No startup/error/return path hides the controls with the whole fullscreen shell');
const viewportChanges = [...loader.matchAll(/getElementById\(['"]game-viewport['"]\)\.style\.display\s*=\s*['"]([^'"]+)['"]/g)];
assert.deepEqual(viewportChanges.map(match => match[1]), ['flex', 'none', 'none'],
  'Native start, startup failure and game exit control the inner viewport');
assert.match(loader, /function resizeCanvas\(\)[\s\S]*?getElementById\("canvas-container"\)/,
  'Canvas sizing continues to use the full native fullscreen container');
console.log('PASS actual native fullscreen selector, both shipping DOM trees, exact parent negative control, modal/input ancestry and separate startup/error viewport visibility. No game or audio starts.');
