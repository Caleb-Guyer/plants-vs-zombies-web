/* Browser save persistence adapter. Copyright (C) 2026. MIT License.
 * Filesystem access stays on the game thread. IndexedDB, history validation,
 * checksums and byte comparisons normally run in a dedicated save worker. */
(function (global) {
  'use strict';
  const ROOT = '/saves', WORKER_VERSION = 'save-worker-1', PROTOCOL = 1;
  const STARTUP_TIMEOUT_MS = 10000, OPERATION_TIMEOUT_MS = 30000;
  const installed = new WeakMap();
  const scriptBase = global.document?.currentScript?.src || global.document?.baseURI || global.location?.href;
  const failure = message => new Error(message);
  function engineVersion() {
    const value = global.document?.getElementById?.('engine-build-id')?.textContent || 'unknown';
    return /^[a-zA-Z0-9.+_-]{1,80}$/.test(value) ? value : 'unknown';
  }
  function directBackend(storage) {
    if (!global.PVZSaveStorageCore) throw failure('Browser save storage did not load. Refresh the page to retry.');
    const core = global.PVZSaveStorageCore.create(storage);
    return Object.freeze({call: (method, args) => core[method](...args)});
  }
  function createBackend(storage) {
    if (typeof global.Worker !== 'function' || typeof global.URL !== 'function' ||
        typeof global.setTimeout !== 'function' || typeof global.clearTimeout !== 'function') {
      return Promise.resolve(directBackend(storage));
    }
    return new Promise((resolve, reject) => {
      let worker, settled = false, initialized = false, failed = null, nextId = 1, startupTimer = null;
      const pending = new Map();
      const stop = () => {try {worker?.terminate();} catch (_) {}};
      const fallback = () => {
        if (settled) return;
        settled = true;
        if (startupTimer !== null) global.clearTimeout(startupTimer);
        stop();
        try {resolve(directBackend(storage));} catch (error) {reject(error);}
      };
      const fail = () => {
        if (!settled) {fallback(); return;}
        if (!initialized || failed) return;
        failed = failure('Browser save worker stopped. Reload the game before saving again.');
        stop();
        for (const item of pending.values()) {global.clearTimeout(item.timer); item.reject(failed);}
        pending.clear();
      };
      const client = Object.freeze({call(method, args) {
        if (failed) return Promise.reject(failed);
        return new Promise((resolveCall, rejectCall) => {
          const id = nextId++;
          const timer = global.setTimeout(fail, OPERATION_TIMEOUT_MS);
          pending.set(id, {resolve: resolveCall, reject: rejectCall, timer});
          try {
            // capture() creates independent buffers. Transferring them cannot
            // detach files or the native game's WebAssembly memory.
            const transfer = method === 'commit' ?
              [...new Set(args[0].filter(entry => entry.kind === 'file').map(entry => entry.data.buffer))] : [];
            worker.postMessage({type: 'call', id, method, args}, transfer);
          } catch (_) {fail();}
        });
      }});
      try {
        const url = new global.URL('./save-storage-worker.js', scriptBase);
        url.search = 'v=' + WORKER_VERSION;
        worker = new global.Worker(url.href);
        worker.onmessage = event => {
          const message = event.data;
          if (!settled) {
            if (message?.type === 'ready' && message.protocol === PROTOCOL) {
              settled = true; initialized = true;
              if (startupTimer !== null) global.clearTimeout(startupTimer);
              resolve(client);
            } else if (message?.type === 'startup-error' || message?.type === 'ready') fallback();
            return;
          }
          if (!initialized || failed || !message || !Number.isSafeInteger(message.id)) return;
          const item = pending.get(message.id);
          if (!item) return;
          if (message.type !== 'result' && message.type !== 'error') {fail(); return;}
          pending.delete(message.id); global.clearTimeout(item.timer);
          if (message.type === 'result') item.resolve(message.value);
          else {
            const error = failure(String(message.error?.message || 'Browser save storage failed.'));
            error.name = String(message.error?.name || 'Error');
            if (message.error?.unsupportedVersion) error.unsupportedVersion = true;
            item.reject(error);
          }
        };
        worker.onerror = event => {event?.preventDefault?.(); fail();};
        worker.onmessageerror = fail;
        if (!settled) startupTimer = global.setTimeout(fallback, STARTUP_TIMEOUT_MS);
      } catch (_) {fallback();}
    });
  }
  function install(FS) {
    if (installed.has(FS)) return installed.get(FS);
    if (FS.filesystems && FS.filesystems.IDBFS) return Object.freeze({fallback: false, historyAvailable: false});
    const storage = global.indexedDB;
    if (!storage) throw failure('Browser save storage is unavailable.');
    const originalSync = FS.syncfs.bind(FS);
    const backend = createBackend(storage);
    // The loader awaits its first operation. Keep an early bootstrap failure
    // handled even when another dependency delays that first request.
    backend.catch(() => {});
    let queue = Promise.resolve(), restored = false, revision = 0, reloadRequired = false, recoveryNotice = '';
    function enqueue(operation) {
      const result = queue.then(operation); queue = result.catch(() => {}); return result;
    }
    async function call(method, args = []) {return (await backend).call(method, args);}
    function capture() {
      const entries = [];
      function visit(path, relative) {
        const stat = FS.lstat ? FS.lstat(path) : FS.stat(path), directory = FS.isDir(stat.mode);
        if (!directory && (stat.mode & 0xf000) !== 0x8000) throw failure('Only regular files can be stored in browser saves.');
        if (relative) entries.push({path: relative, kind: directory ? 'directory' : 'file', mode: stat.mode,
          mtime: Number(stat.mtime), ...(!directory ? {data: new Uint8Array(FS.readFile(path))} : {})});
        if (directory) for (const name of FS.readdir(path).sort()) {
          if (name === '.' || name === '..') continue;
          if (!name || name.includes('/') || name.includes('\\') || name.includes('\0')) throw failure('Invalid browser save filename.');
          visit(path + '/' + name, relative ? relative + '/' + name : name);
        }
      }
      visit(ROOT, ''); return entries;
    }
    function replaceFiles(entries) {
      function remove(path) {
        for (const name of FS.readdir(path)) {
          if (name === '.' || name === '..') continue;
          const child = path + '/' + name, stat = FS.lstat ? FS.lstat(child) : FS.stat(child);
          if (FS.isDir(stat.mode)) {remove(child); FS.rmdir(child);} else FS.unlink(child);
        }
      }
      remove(ROOT);
      for (const entry of entries.filter(item => item.kind === 'directory').sort((a, b) => a.path.split('/').length - b.path.split('/').length)) FS.mkdir(ROOT + '/' + entry.path);
      for (const entry of entries) if (entry.kind === 'file') FS.writeFile(ROOT + '/' + entry.path, entry.data);
      for (const entry of [...entries].sort((a, b) => b.path.split('/').length - a.path.split('/').length)) {
        const path = ROOT + '/' + entry.path;
        if (FS.chmod) FS.chmod(path, entry.mode & 0o777);
        if (FS.utime) FS.utime(path, entry.mtime, entry.mtime);
      }
    }
    async function synchronize(populate) {
      if (reloadRequired) throw failure('A backup was restored. Reload the game before saving again.');
      if (populate) restored = false;
      await new Promise((resolve, reject) => originalSync(populate, error => error ? reject(error) : resolve()));
      if (populate) {
        const state = await call('read');
        if (state.snapshot) {
          const previous = capture();
          try {replaceFiles(state.snapshot.entries);} catch (error) {replaceFiles(previous); throw error;}
        }
        revision = state.revision; recoveryNotice = state.notice || ''; restored = true;
      } else {
        if (!restored) throw failure('Browser saves have not been restored. Retry loading before saving.');
        revision = await call('commit', [capture(), revision, engineVersion()]);
      }
    }
    FS.syncfs = function (populate, callback) {
      if (typeof populate === 'function') {callback = populate; populate = false;}
      if (typeof callback !== 'function') throw new TypeError('FS.syncfs requires a callback.');
      enqueue(() => synchronize(Boolean(populate))).then(() => callback(null), error => callback(error));
    };
    const adapter = Object.freeze({
      fallback: true, historyAvailable: true,
      purgeRecoveryHistory: () => enqueue(async () => {
        await call('purgeRecoveryHistory', [revision]); recoveryNotice = '';
      }),
      getRecoveryNotice: () => recoveryNotice,
      acknowledgeRecoveryNotice() {recoveryNotice = '';},
      listBackups: () => enqueue(() => call('listBackups')),
      restoreBackup: id => enqueue(async () => {
        if (!restored || reloadRequired) throw failure('Load browser saves before restoring a backup.');
        revision = await call('restoreBackup', [id, revision, engineVersion()]);
        reloadRequired = true;
        return {reloadRequired: true};
      }),
    });
    installed.set(FS, adapter); return adapter;
  }
  global.PVZSaveStorage = Object.freeze({install, snapshotVersion: 2, maxBackups: 8});
})(window);
