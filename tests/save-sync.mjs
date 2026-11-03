// Runs the actual generated loader with a controlled async FS. No game or audio.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source = fs.readFileSync(new URL('../dist/loader.js', import.meta.url), 'utf8');
const generator = fs.readFileSync(new URL('../prepare-port.mjs', import.meta.url), 'utf8');
assert(source.includes('await window.beforePvZStart?.()'));
assert(generator.includes("window.PVZSaveStorage?.install(FS)"));
const turns = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
function browser({ mounted = true, backend = true } = {}) {
  const elements = new Map(), documentEvents = new Map(), windowEvents = new Map();
  const pending = [], intervals = [], timers = [], warnings = [];
  let reloads = 0, mounts = 0, mainCalls = 0;
  function element(id = '') {
    if (id && elements.has(id)) return elements.get(id);
    const classes = new Set(), handlers = new Map();
    let content = '';
    const node = {
      id, style: {}, value: '', disabled: false, width: 800, height: 600, clientWidth: 800, clientHeight: 600,
      children: [], handlers,
      get textContent() { return content; },
      set textContent(value) { content = value; node.children.length = 0; },
      appendChild(child) { node.children.push(child); },
      addEventListener(type, fn) { handlers.set(type, fn); }, removeEventListener() {}, setAttribute() {}, removeAttribute() {},
      classList: { add: value => classes.add(value), remove: value => classes.delete(value), contains: value => classes.has(value), toggle() {} },
    };
    if (id) elements.set(id, node); return node;
  }
  const document = {
    body: element('body'), fullscreenElement: null, visibilityState: 'visible',
    getElementById: element, createElement: () => element(),
    addEventListener: (type, fn) => documentEvents.set(type, fn),
  };
  const FS = {
    syncfs(populate, callback) { pending.push({ populate, callback }); },
    mkdir() {}, stat: () => ({ mode: 0o40755 }), isDir: () => true,
    mount() { mounts++; }, ...(backend ? { filesystems: { IDBFS: {} } } : {}),
  };
  const context = vm.createContext({
    document, Module: { FS, callMain: () => { mainCalls++; } },
    console: { warn: (...args) => warnings.push(args), error: (...args) => warnings.push(args) },
    Date, moduleReadyPromise: Promise.resolve(),
    setInterval: fn => { intervals.push(fn); return intervals.length; }, clearInterval() {},
    setTimeout: fn => { timers.push(fn); return timers.length; },
    addEventListener: (type, fn) => windowEvents.set(type, fn), removeEventListener() {},
    location: { reload: () => { reloads++; } },
  });
  vm.runInContext('window=globalThis', context);
  vm.runInContext(source, context, { filename: 'loader.js' });
  if (mounted) vm.runInContext('savesMounted=true;gameStarted=true;', context);
  return {
    context, FS, pending, intervals, timers, warnings, elements, documentEvents, windowEvents,
    flush: () => context.syncSaves(), exit: () => context.onGameExit(),
    finish(error = null) { const operation = pending.shift(); assert(operation, 'Expected pending FS sync'); operation.callback(error); },
    reloads: () => reloads, mounts: () => mounts, mainCalls: () => mainCalls,
  };
}

const overlap = browser();
let firstDone = false, secondDone = false, thirdDone = false;
const first = overlap.flush().then(() => { firstDone = true; });
const second = overlap.flush().then(() => { secondDone = true; });
assert.equal(overlap.pending.length, 1);
overlap.finish(); await turns();
assert.equal(overlap.pending.length, 1); assert(!firstDone && !secondDone);
const third = overlap.flush().then(() => { thirdDone = true; });
overlap.finish(); await turns();
assert.equal(overlap.pending.length, 1); assert(!firstDone && !secondDone && !thirdDone);
overlap.finish(); await Promise.all([first, second, third]);
assert(firstDone && secondDone && thirdDone); assert.equal(overlap.pending.length, 0);
console.log('PASS actual loader overlapping callers await every queued flush, including requests during a trailing flush.');

const failed = browser();
const failure = failed.flush(), alsoFailure = failed.flush();
const failureChecks = Promise.all([assert.rejects(failure, /storage failed/), assert.rejects(alsoFailure, /storage failed/)]);
failed.finish(new Error('storage failed')); await failureChecks;
const retry = failed.flush(); failed.finish(); await retry;
assert.equal(failed.pending.length, 0);
console.log('PASS actual loader rejects all affected callers on failure and permits a successful retry.');

for (const trigger of ['interval', 'hidden', 'pagehide', 'beforeunload']) {
  const background = browser();
  if (trigger === 'interval') { background.context.startSaveAutosync(); background.intervals[0](); }
  else if (trigger === 'hidden') { background.context.document.visibilityState = 'hidden'; background.documentEvents.get('visibilitychange')(); }
  else background.windowEvents.get(trigger)({ preventDefault() {} });
  assert.equal(background.pending.length, 1, trigger);
  background.finish(new Error('background failed')); await turns();
  assert(background.warnings.some(args => String(args[0]).includes('background persist error')), trigger);
}
console.log('PASS interval, visibility, pagehide and unload flush errors are caught and logged.');

const exit = browser();
const earlier = exit.flush();
const leaving = exit.exit(); await exit.exit();
assert.equal(exit.elements.get('game-viewport').style.display, 'none', 'Native exit hides only the game viewport');
assert.equal(exit.elements.get('canvas-container')?.style.display, undefined, 'Native exit leaves browser controls in a visible shell');
assert.equal(exit.pending.length, 1); assert.equal(exit.timers.length, 0);
exit.finish(); await turns();
assert.equal(exit.pending.length, 1); assert.equal(exit.timers.length, 0, 'No reload before final queued sync');
exit.finish(); await Promise.all([earlier, leaving]);
assert.equal(exit.timers.length, 1); assert.equal(exit.reloads(), 0);
exit.timers[0](); assert.equal(exit.reloads(), 1);
await exit.exit(); assert.equal(exit.timers.length, 1, 'Repeated native callback must not schedule another reload');
console.log('PASS native onGameExit waits for its final queued flush and schedules exactly one reload.');

const exitFailure = browser();
const leavingWithFailure = exitFailure.exit();
exitFailure.finish(new Error('disk unavailable')); await leavingWithFailure;
assert.equal(exitFailure.elements.get('game-viewport').style.display, 'none');
assert.equal(exitFailure.elements.get('canvas-container')?.style.display, undefined, 'Failed exit keeps the retry/save management shell visible');
assert.equal(exitFailure.timers.length, 0); assert.equal(exitFailure.reloads(), 0);
const status = exitFailure.elements.get('loading-drop-zone');
assert(status.classList.contains('has-error')); assert.match(status.textContent, /Keep this page open/);
assert.equal(status.children.length, 1); assert.equal(status.children[0].textContent, 'Retry saving');
let stopped = false;
status.children[0].handlers.get('click')({ stopPropagation() { stopped = true; } });
assert(stopped); assert.equal(exitFailure.pending.length, 1);
exitFailure.finish(); await turns();
assert.equal(exitFailure.timers.length, 1); assert.equal(status.children.length, 0);
console.log('PASS failed exit preserves the page, shows a usable retry button, and reloads only after successful retry.');

const restore = browser({ mounted: false });
const firstRestore = restore.context.ensureSaveFsReady(); await turns();
assert.equal(restore.pending[0].populate, true); assert.equal(restore.mounts(), 1);
const rejectedRestore = assert.rejects(firstRestore, /restore failed/);
restore.finish(new Error('restore failed')); await rejectedRestore;
assert.equal(vm.runInContext('savesMounted', restore.context), false);
const restored = restore.context.ensureSaveFsReady(); await turns();
assert.equal(restore.mounts(), 1, 'Retry must not mount twice');
restore.finish(); await restored;
assert.equal(vm.runInContext('savesMounted', restore.context), true);
const missing = browser({ mounted: false, backend: false });
await assert.rejects(missing.context.ensureSaveFsReady(), /save storage did not load/);
assert.equal(vm.runInContext('savesMounted', missing.context), false);
console.log('PASS failed population and missing backend stop startup; restoration can retry without mounting twice.');

const fallback = browser({ mounted: false, backend: false });
let installations = 0, hookCalls = 0;
fallback.context.PVZSaveStorage = { install(FS) { assert.equal(FS, fallback.FS); installations++; return { fallback: true }; } };
fallback.context.beforePvZStart = async () => { hookCalls++; assert.equal(vm.runInContext('savesMounted', fallback.context), true); };
const started = fallback.context.startGame(); await turns();
assert.equal(installations, 1); assert.equal(fallback.mounts(), 0); assert.equal(fallback.mainCalls(), 0);
fallback.finish(); await started;
assert.equal(hookCalls, 1); assert.equal(fallback.mainCalls(), 1);
assert.equal(fallback.elements.get('game-viewport').style.display, 'flex');
assert.equal(fallback.elements.get('canvas-container')?.style.display, undefined, 'Successful start only shows the inner game viewport');
console.log('PASS fallback restoration completes before beforePvZStart and untouched engine callMain.');
