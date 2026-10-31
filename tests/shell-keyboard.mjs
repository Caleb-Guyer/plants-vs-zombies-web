// Run the actual launcher against a DOM event path and SDL-like window listeners.
// Browser fullscreen and audio devices are mocked; root also checks real UI input.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = fs.readFileSync(process.argv[2] || new URL('../dist/launcher.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');

function browser() {
  let dispatch;
  class Node {
    constructor(id, tag = 'div') {
      this.id = id; this.tagName = tag.toUpperCase(); this.parent = null;
      this.listeners = new Map(); this.attributes = new Map(); this.open = false;
      this.style = {}; this.value = ''; this.hidden = false; this.disabled = false;
      this.classList = { add() {}, remove() {}, contains() { return false; } };
    }
    addEventListener(type, callback, options = {}) {
      const list = this.listeners.get(type) || [];
      list.push({ callback, capture: typeof options === 'boolean' ? options : !!options.capture });
      this.listeners.set(type, list);
    }
    removeEventListener() {}
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    removeAttribute(name) { this.attributes.delete(name); }
    focus() { document.activeElement = this; }
    click() { return dispatch(this, 'click'); }
    showModal() { this.open = true; }
    close() { this.open = false; dispatch(this, 'close', { bubbles: false }); }
  }
  const windowNode = new Node('window'), document = new Node('document');
  document.parent = windowNode;
  const body = new Node('body', 'body'); body.parent = document; document.body = body;
  const nodes = new Map();
  for (const match of html.matchAll(/<([a-z]+)[^>]*\bid="([^"]+)"/gi)) {
    const node = new Node(match[2], match[1]); node.parent = body; nodes.set(node.id, node);
  }
  const el = id => { assert(nodes.has(id), `Real HTML contains ${id}`); return nodes.get(id); };
  const connect = (parent, ...ids) => { for (const id of ids) el(id).parent = el(parent); };
  connect('save-toolbar', 'fullscreen-btn', 'mute-btn', 'import-btn', 'save-export-btn', 'more-btn');
  connect('upload-screen', 'drop-zone');
  connect('drop-zone', 'retry-load');
  connect('more-dialog', 'more-close', 'upload-save-import-btn', 'upload-save-import-dir-btn', 'upload-save-clear-btn', 'add-test-profiles');
  connect('return-files-dialog', 'return-files-cancel', 'return-files-confirm');
  connect('canvas-container', 'canvas');
  document.getElementById = id => nodes.get(id) || null;
  const counters = { fullscreen: 0, exits: 0, resumes: 0, paused: 0, sdl: [], resize: 0 };
  document.fullscreenElement = null;
  body.requestFullscreen = async () => { counters.fullscreen++; document.fullscreenElement = body; };
  document.exitFullscreen = async () => { counters.exits++; document.fullscreenElement = null; };

  dispatch = (target, type, { key = '', bubbles = true } = {}) => {
    const event = {
      type, key, target, currentTarget: null, eventPhase: 0, defaultPrevented: false,
      stopped: false, immediateStopped: false,
      preventDefault() { this.defaultPrevented = true; },
      stopPropagation() { this.stopped = true; },
      stopImmediatePropagation() { this.stopped = this.immediateStopped = true; },
    };
    const path = [];
    for (let node = target; node; node = node.parent) path.push(node);
    const invoke = (node, capture, phase) => {
      event.currentTarget = node; event.eventPhase = phase;
      for (const listener of node.listeners.get(type) || []) {
        if (listener.capture === capture) listener.callback(event);
        if (event.immediateStopped) break;
      }
      if (!capture && !event.immediateStopped && typeof node['on' + type] === 'function') node['on' + type](event);
    };
    for (const node of path.slice(1).reverse()) {
      invoke(node, true, 1);
      if (event.stopped) break;
    }
    if (!event.stopped) {
      invoke(target, true, 2);
      if (!event.immediateStopped) invoke(target, false, 2);
      if (bubbles) for (const node of path.slice(1)) {
        if (event.stopped) break;
        invoke(node, false, 3);
      }
    }
    event.eventPhase = 0; event.currentTarget = null;
    return event;
  };
  // Simulate native button activation only when keyboard defaults survive.
  // Enter activates on keydown; Space activates after an uncanceled keyup.
  const press = (target, key) => {
    target.focus();
    let button = target;
    while (button && button.tagName !== 'BUTTON') button = button.parent;
    const down = dispatch(target, 'keydown', { key });
    if (key === 'Enter' && button && !down.defaultPrevented) button.click();
    const typed = dispatch(target, 'keypress', { key });
    const up = dispatch(target, 'keyup', { key });
    if (key === ' ' && button && !down.defaultPrevented && !typed.defaultPrevented && !up.defaultPrevented) button.click();
    return [down, typed, up];
  };
  const globals = {
    document, console, Blob, Promise, TextEncoder, Map,
    sessionStorage: { getItem() { return null; }, removeItem() {}, setItem() {} },
    indexedDB: { open() { return {}; } },
    collectedFiles: new Map(), gameStarted: true,
    Module: { canvas: el('canvas') }, moduleReadyPromise: new Promise(() => {}),
    PVZAudio: { subscribe(fn) { fn(false); }, resume() { counters.resumes++; return Promise.resolve(); }, isMuted() { return false; }, setMuted() {} },
    PVZAssetBundle: {createLoader: () => ({load: () => new Promise(() => {})})},
    dropZone: el('drop-zone'), loadStatus: el('loading-drop-zone'),
    uploadSaveImportBtn: el('upload-save-import-btn'), uploadSaveImportDirBtn: el('upload-save-import-dir-btn'), uploadSaveClearBtn: el('upload-save-clear-btn'),
    refreshUI() {}, startGame() {}, resizeCanvas() { counters.resize++; },
    requestAnimationFrame() {}, location: { reload() {} },
    addEventListener: windowNode.addEventListener.bind(windowNode),
  };
  const context = vm.createContext(globals);
  vm.runInContext('window=globalThis', context);
  vm.runInContext(source, context, { filename: 'launcher.js' });
  for (const type of ['keydown', 'keypress', 'keyup']) windowNode.addEventListener(type, event => {
    counters.sdl.push([event.type, event.key]);
    if (event.type === 'keydown' && event.key === ' ') counters.paused++;
    event.preventDefault();
  });
  return { el, dispatch, press, counters, document, Node };
}

for (const key of [' ', 'Enter']) {
  const b = browser();
  const events = b.press(b.el('fullscreen-btn'), key);
  assert.equal(b.counters.fullscreen, 1, `${JSON.stringify(key)} activates the actual fullscreen handler`);
  assert.equal(b.document.fullscreenElement, b.document.body);
  assert.equal(b.counters.paused, 0, 'A toolbar key must not pause the native game');
  assert.deepEqual(b.counters.sdl, [], 'All three toolbar keyboard events stay out of SDL');
  assert(events.every(event => !event.defaultPrevented), 'Shell isolation preserves browser defaults');
}
console.log('PASS toolbar Space/Enter activate the actual fullscreen handler without leaking SDL keys or pausing the game.');

{
  const b = browser();
  b.press(b.el('more-btn'), ' ');
  assert.equal(b.el('more-dialog').open, true);
  let targetKeys = 0;
  b.el('more-close').addEventListener('keydown', () => { targetKeys++; });
  const events = b.press(b.el('more-close'), ' ');
  assert.equal(targetKeys, 1, 'Modal target handlers are not cut off by document capture');
  assert.equal(b.el('more-dialog').open, false, 'Native default button activation closes More');
  assert(events.every(event => !event.defaultPrevented));
  assert.deepEqual(b.counters.sdl, []);
  assert.equal(b.document.activeElement, b.el('canvas'), 'Closing More restores game focus');
  b.el('import-btn').click();
  assert.equal(b.el('return-files-dialog').open, true);
  b.press(b.el('return-files-cancel'), 'Enter');
  assert.equal(b.el('return-files-dialog').open, false, 'Return-files dialog retains Enter activation');
  assert.deepEqual(b.counters.sdl, []);
}
console.log('PASS modal target handlers, Space/Enter default actions, close controls and game-focus restoration.');

{
  const b = browser();
  let retries = 0;
  b.el('retry-load').onclick = () => { retries++; };
  b.press(b.el('retry-load'), ' ');
  assert.equal(retries, 1, 'Loading retry retains native button defaults');
  assert.deepEqual(b.counters.sdl, []);
  const child = new b.Node('icon-child', 'span'); child.parent = b.el('fullscreen-btn');
  const events = b.press(child, ' ');
  assert.equal(b.counters.fullscreen, 1, 'Nested control content is isolated by its UI root');
  assert(events.every(event => !event.defaultPrevented));
}
console.log('PASS loading retry and nested toolbar content preserve native button behavior.');

for (const id of ['canvas', 'pvz-soft-keyboard']) {
  const b = browser(); let targetKeys = 0;
  b.el(id).addEventListener('keydown', () => { targetKeys++; });
  b.press(b.el(id), ' ');
  assert.equal(targetKeys, 1);
  assert.equal(b.counters.paused, 1, `${id} still reaches native game input`);
  assert.deepEqual(b.counters.sdl, [['keydown', ' '], ['keypress', ' '], ['keyup', ' ']]);
}
console.log('PASS canvas and in-game soft-keyboard events retain all three SDL keyboard phases.');

for (const dialog of ['more-dialog', 'return-files-dialog']) {
  const b = browser(); let targetKeys = 0;
  b.el(dialog).showModal();
  b.el('canvas').addEventListener('keydown', () => { targetKeys++; });
  const events = b.press(b.el('canvas'), ' ');
  assert.equal(targetKeys, 1, 'Modal fallback does not suppress target handlers');
  assert.equal(b.counters.paused, 0, 'A retained game focus cannot send keys behind a modal');
  assert.deepEqual(b.counters.sdl, []);
  assert(events.every(event => !event.defaultPrevented));
}
console.log('PASS modal fallback blocks stray game-target keys at document bubble without canceling defaults or target handlers.');
