/* Dedicated browser save worker. Copyright (C) 2026. MIT License. */
(function (global) {
  'use strict';
  const protocol = 1;
  const methods = new Set(['read', 'commit', 'listBackups', 'restoreBackup', 'purgeRecoveryHistory']);
  const errorValue = error => ({name: String(error?.name || 'Error'),
    message: String(error?.message || 'Browser save storage failed.'),
    ...(error?.unsupportedVersion ? {unsupportedVersion: true} : {})});
  let core, queue = Promise.resolve();
  try {
    const url = new URL('./save-storage-core.js', global.location.href);
    url.search = global.location.search;
    global.importScripts(url.href);
    core = global.PVZSaveStorageCore.create(global.indexedDB);
  } catch (error) {
    global.postMessage({type: 'startup-error', error: errorValue(error)});
    return;
  }
  global.onmessage = event => {
    const message = event.data;
    if (!message || message.type !== 'call' || !Number.isSafeInteger(message.id) || message.id < 1) return;
    const operation = async () => {
      try {
        if (!methods.has(message.method) || !Array.isArray(message.args)) throw new Error('Invalid browser save request.');
        const value = await core[message.method](...message.args);
        // These are normalized, worker-owned copies, never IndexedDB's values
        // or the native game's WebAssembly heap.
        const buffers = message.method === 'read' && value.snapshot ?
          [...new Set(value.snapshot.entries.filter(entry => entry.kind === 'file').map(entry => entry.data.buffer))] : [];
        global.postMessage({type: 'result', id: message.id, value}, buffers);
      } catch (error) {
        global.postMessage({type: 'error', id: message.id, error: errorValue(error)});
      }
    };
    queue = queue.then(operation, operation);
  };
  global.postMessage({type: 'ready', protocol});
})(self);
