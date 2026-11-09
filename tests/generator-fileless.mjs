// Run the actual generator in a disposable tree, never against the live checkout.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import vm from 'node:vm';
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
  const runtime = first.get('dist/runtime.js').toString();
  // Execute the actual generated startup before a native-glue context request.
  // The browser double reads dictionary members rather than copying/enumerating
  // the options, matching WebIDL's observable attribute/getter boundary.
  function contextFixture({responses = [], own = null, protectedCanvas = false} = {}) {
    const calls = [], nativeError = {nativeContextError: true};
    const original = function(type, attributes, ...tail) {
      const call = {receiver: this, type, attributes, tail}; calls.push(call);
      if (!['webgl', 'webgl2', 'experimental-webgl'].includes(type)) return {type};
      call.values = {};
      for (const key of ['alpha', 'depth', 'stencil', 'powerPreference', 'antialias',
        'premultipliedAlpha', 'preserveDrawingBuffer', 'failIfMajorPerformanceCaveat', 'desynchronized']) {
        const value = attributes == null ? undefined : Reflect.get(Object(attributes), key, attributes);
        call.values[key] = value;
        if (key === 'powerPreference') {
          if (typeof value === 'symbol') throw nativeError;
          call.convertedPreference = value === undefined ? 'default' : String(value);
          if (!['default', 'low-power', 'high-performance'].includes(call.convertedPreference)) throw nativeError;
        }
      }
      const result = responses.length ? responses.shift() : {nativeContext: true};
      if (result === nativeError) throw nativeError;
      return result;
    };
    // Accessing a function's .apply would change observable method semantics.
    Object.defineProperty(original, 'apply', {get() { throw Error('Use native Reflect.apply'); }});
    const prototype = {getContext: original};
    const canvas = Object.assign(Object.create(prototype), {id: 'canvas', addEventListener() {}});
    if (own === 'data') Object.defineProperty(canvas, 'getContext', {value: original, configurable: false, writable: true, enumerable: true});
    if (own === 'accessor') Object.defineProperty(canvas, 'getContext', {get() { return original; }, configurable: false, enumerable: true});
    if (protectedCanvas) Object.preventExtensions(canvas);
    const beforeOwn = Object.getOwnPropertyDescriptor(canvas, 'getContext');
    const beforePrototype = Object.getPrototypeOf(canvas);
    const context = vm.createContext({console, document: {getElementById(id) { assert.equal(id, 'canvas'); return canvas; }}});
    vm.runInContext('window=globalThis', context);
    vm.runInContext(runtime, context, {filename: 'actual-generated-runtime.js'});
    assert.equal(context.PVZHighPowerHintStatus, undefined, 'No private diagnostic global ships');
    assert.equal(context.preferGameCanvasGPU, undefined, 'Creation helper stays locally scoped');
    return {canvas, prototype, original, calls, nativeError, responses, beforeOwn, beforePrototype};
  }
  const restored = fixture => {
    assert.deepEqual(Object.getOwnPropertyDescriptor(fixture.canvas, 'getContext'), fixture.beforeOwn, 'Exact original own descriptor restored');
    assert.equal(Object.getPrototypeOf(fixture.canvas), fixture.beforePrototype, 'Canvas prototype unchanged');
    assert.equal(fixture.prototype.getContext, fixture.original, 'Shared method/prototype unchanged');
  };
  for (const args of [['webgl'], ['webgl', null], ['webgl', undefined], ['webgl2', {}], ['experimental-webgl', Object.freeze({})]]) {
    const fixture = contextFixture();
    assert.equal(fixture.canvas.getContext(...args).nativeContext, true);
    assert.equal(fixture.calls[0].convertedPreference, 'high-performance');
    for (const key of ['alpha', 'depth', 'stencil', 'antialias']) assert.equal(fixture.calls[0].values[key], undefined, 'Other unspecified browser defaults retained');
    restored(fixture);
  }
  {
    const fixture = contextFixture(), order = [], tail = {nativeArgument: true};
    const inherited = {get depth() { assert.equal(this, requested); order.push('depth'); return false; }};
    const requested = Object.create(inherited);
    Object.defineProperties(requested, {
      alpha: {get() { assert.equal(this, requested); order.push('alpha'); return false; }},
      powerPreference: {get() { assert.equal(this, requested); order.push('preference'); return 'low-power'; }},
      stencil: {value: true}, antialias: {value: false}, premultipliedAlpha: {value: false},
      preserveDrawingBuffer: {value: true}, failIfMajorPerformanceCaveat: {value: false}, desynchronized: {value: false}
    });
    Object.freeze(requested);
    const descriptors = Object.getOwnPropertyDescriptors(requested);
    fixture.canvas.getContext('webgl', requested, tail);
    assert.deepEqual(order, ['alpha', 'depth', 'preference'], 'Original getters run once in native dictionary-read order with original receiver');
    assert.deepEqual(fixture.calls[0].values, {alpha: false, depth: false, stencil: true, powerPreference: 'high-performance',
      antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: true, failIfMajorPerformanceCaveat: false, desynchronized: false});
    assert.equal(fixture.calls[0].tail[0], tail, 'Trailing arguments remain unchanged');
    assert.deepEqual(Object.getOwnPropertyDescriptors(requested), descriptors, 'Caller frozen object/getters untouched');
    restored(fixture);
  }
  {
    const fixture = contextFixture({responses: [null]});
    const installed = fixture.canvas.getContext;
    assert.equal(fixture.canvas.getContext('webgl2', {powerPreference: 'default'}), null, 'Failed native context request returns unchanged');
    assert.equal(fixture.canvas.getContext, installed, 'Retry remains eligible after a failed request');
    fixture.responses.push(fixture.nativeError);
    assert.throws(() => fixture.canvas.getContext('webgl', {}), error => error === fixture.nativeError, 'Native thrown value is not converted/wrapped');
    assert.equal(fixture.canvas.getContext, installed);
    assert.equal(fixture.canvas.getContext('webgl', {}).nativeContext, true);
    restored(fixture);
  }
  {
    const fixture = contextFixture(), requested = {powerPreference: 'default'};
    const other = Object.assign(Object.create(fixture.prototype), {id: 'canvas'});
    const installed = fixture.canvas.getContext;
    other.getContext('webgl', requested);
    assert.equal(fixture.calls.at(-1).attributes, requested, 'Duplicate-ID other canvas is untouched');
    installed.call(other, 'webgl', requested);
    assert.equal(fixture.calls.at(-1).attributes, requested, 'Borrowed receiver is untouched');
    for (const receiver of [undefined, null]) {
      Reflect.apply(installed, receiver, ['webgl', requested]);
      assert.equal(fixture.calls.at(-1).receiver, receiver, 'Classic runtime preserves null/undefined borrowed receiver');
      assert.equal(fixture.calls.at(-1).attributes, requested);
    }
    fixture.canvas.getContext('2d', requested);
    assert.equal(fixture.calls.at(-1).attributes, requested, 'Non-WebGL options forwarded unchanged');
    assert.equal(fixture.canvas.getContext, installed, 'Unrelated calls do not consume target hint');
    fixture.canvas.getContext('webgl', requested); restored(fixture);
    fixture.canvas.getContext('webgl', requested);
    assert.equal(fixture.calls.at(-1).attributes, requested, 'No persistent/per-draw wrapper remains');
  }
  for (const own of ['data', 'accessor']) {
    const fixture = contextFixture({own}); fixture.canvas.getContext('webgl', {}); restored(fixture);
    assert.equal(fixture.calls[0].convertedPreference, own === 'data' ? 'high-performance' : 'default', 'Protected accessor retains native behavior');
  }
  {
    const fixture = contextFixture({protectedCanvas: true}); fixture.canvas.getContext('webgl', {}); restored(fixture);
    assert.equal(fixture.calls[0].convertedPreference, 'default', 'Nonextensible canvas remains usable without hint');
  }
  {
    const fixture = contextFixture(), installed = fixture.canvas.getContext;
    const later = function() { return Reflect.apply(installed, this, arguments); };
    Object.defineProperty(fixture.canvas, 'getContext', {value: later, configurable: true});
    fixture.canvas.getContext('webgl', {});
    assert.equal(fixture.canvas.getContext, later, 'A later owner is not overwritten on success');
    fixture.canvas.getContext('webgl', {powerPreference: 'default'});
    assert.equal(fixture.calls.at(-1).convertedPreference, 'default', 'Completed wrapper delegates unchanged even if retained by later owner');
  }
  for (const own of [null, 'data']) {
    const fixture = contextFixture({own}), installed = fixture.canvas.getContext;
    const requested = {get alpha() {
      if (own === 'data') Object.defineProperty(fixture.canvas, 'getContext', {writable: false});
      else Object.freeze(fixture.canvas);
      return false;
    }};
    assert.equal(fixture.canvas.getContext('webgl', requested).nativeContext, true,
      'Getter sealing/freezing the installed method cannot replace a successful native return with cleanup failure');
    assert.equal(fixture.canvas.getContext, installed, 'Changed descriptor belongs to the later owner');
    fixture.canvas.getContext('webgl', {powerPreference: 'default'});
    assert.equal(fixture.calls.at(-1).convertedPreference, 'default', 'Completed protected method delegates without repeating the hint');
  }
  for (const preference of ['invalid', null, 7, Symbol('invalid')]) {
    const fixture = contextFixture();
    assert.throws(() => fixture.canvas.getContext('webgl', {powerPreference: preference}), error => error === fixture.nativeError,
      'Original browser enum validation is preserved');
  }
  {
    const fixture = contextFixture(); let conversions = 0;
    const preference = {toString() { conversions++; return 'default'; }};
    fixture.canvas.getContext('webgl', {powerPreference: preference});
    assert.equal(fixture.calls[0].values.powerPreference, preference, 'Object-valued preference reaches native conversion unchanged');
    assert.equal(conversions, 1); assert.equal(fixture.calls[0].convertedPreference, 'default'); restored(fixture);
  }
  {
    const fixture = contextFixture(), thrown = {originalGetterFailure: true};
    assert.throws(() => fixture.canvas.getContext('webgl', {get powerPreference() { throw thrown; }}), error => error === thrown,
      'Original preference getter errors preserve identity');
  }
  const loader = first.get('dist/loader.js').toString();
  assert(!/importResourceZip|handleFileList|fileInput|resourceZipInput|browseFolderBtn|webkitGetAsEntry/.test(loader));
  assert(loader.includes('await ensureSaveFsReady(),await window.beforePvZStart?.()'));
  assert(loader.includes('window.onSaveOperationFinished?.()'));
  assert(loader.includes('Loading game\u2026') && loader.includes('Loading game files\u2026 '), 'Generated progress labels preserve their concise UTF-8 text');
  const engine = JSON.parse(fs.readFileSync(path.join(temporary, 'dist/game/engine-provenance.json'), 'utf8'));
  for (const name of ['dist/index.html', 'dist/index-port.html']) {
    assert(first.get(name).toString().includes('</span> ' + engine.caption + ' \u00a9 2026'), 'Displayed caption matches the current engine: ' + name);
    const runtimePosition = first.get(name).toString().indexOf('src="./runtime.js');
    const gluePosition = first.get(name).toString().indexOf('src="./game/pvz-portable.js');
    assert(runtimePosition >= 0 && gluePosition > runtimePosition,
      'Canvas hint installs before native glue can request a context: ' + name);
  }
  const page = path.join(temporary, 'dist/index.html');
  fs.writeFileSync(page, fs.readFileSync(page, 'utf8').replace('id="retry-load"', 'id="file-input"'));
  const bad = spawnSync(process.execPath, ['prepare-port.mjs'], {cwd: temporary, encoding: 'utf8'});
  assert.notEqual(bad.status, 0); assert.match(bad.stderr, /Fileless browser shell input required/);
  console.log('PASS actual isolated generator is idempotent, matches shipped files, preserves save/start hooks and rejects reintroduced file-picker inputs; canvas-only advisory context creation preserves getters, caller data, retries, native errors and method ownership.');
} finally {
  const resolved = fs.realpathSync(temporary);
  assert.equal(path.dirname(resolved), temporaryRoot);
  assert(path.basename(resolved).startsWith('pvz-fileless-generator-'));
  fs.rmSync(resolved, {recursive: true});
}
