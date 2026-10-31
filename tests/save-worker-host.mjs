// Test-only browser Worker host. Runs the actual classic worker in a real
// worker_thread; all IndexedDB and filesystem data are synthetic.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parentPort, threadId, workerData} from 'node:worker_threads';
import {fakeIndexedDB} from './save-storage-fixtures.mjs';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const db = fakeIndexedDB();
const clients = new Map();
const gate = new Int32Array(workerData.gate);
let armed = false;
let holdReply = null, heldReplies = 0;

// Pause immediately before the actual history-success handler executes the
// production transaction operation. This lets the parent prove that its event
// loop continues while the save worker cannot progress, without timing limits.
function instrumentRequest(request, mode, key) {
  if (mode !== 'readwrite' || key !== 'save-history') return request;
  let listener;
  Object.defineProperty(request, 'onsuccess', {
    configurable: true,
    get() { return listener; },
    set(fn) {
      listener = () => {
        if (armed) {
          armed = false;
          parentPort.postMessage({kind: 'gate-entered', threadId});
          Atomics.wait(gate, 0, 0);
        }
        return fn?.();
      };
    },
  });
  return request;
}
const storage = {
  open(name, version) {
    const request = db.storage.open(name, version);
    let success;
    Object.defineProperty(request, 'onsuccess', {
      configurable: true,
      get() { return success; },
      set(fn) {
        success = () => {
          const database = request.result;
          const transaction = database.transaction.bind(database);
          database.transaction = (storeName, mode) => {
            const tx = transaction(storeName, mode);
            const objectStore = tx.objectStore.bind(tx);
            tx.objectStore = (...args) => {
              const store = objectStore(...args);
              const get = store.get.bind(store);
              store.get = key => instrumentRequest(get(key), mode, key);
              return store;
            };
            return tx;
          };
          return fn?.();
        };
      },
    });
    return request;
  },
};

function makeClient(id, script, failImport) {
  const url = new URL(script);
  if (url.origin !== 'https://save.test' || url.pathname !== '/save-storage-worker.js') throw Error('Unexpected worker URL');
  const client = {dead: false, calls: new Map()};
  const context = vm.createContext({
    indexedDB: storage, Uint8Array, ArrayBuffer, Date, Promise, WeakMap,
    console, URL, setTimeout, clearTimeout, structuredClone,
    location: {href: url.href, search: url.search},
    postMessage(message, transfer = []) {
      if (message.type === 'result' && client.calls.get(message.id) === holdReply) {
        holdReply = null; heldReplies++;
        parentPort.postMessage({kind: 'reply-held', client: id, threadId});
        return;
      }
      if (!client.dead) parentPort.postMessage({kind: 'runtime', client: id, message, threadId, transfers: transfer.length}, transfer);
    },
    importScripts(...references) {
      for (const reference of references) {
        if (failImport) throw Error('Synthetic worker import failed');
        const resolved = new URL(reference, url);
        if (resolved.origin !== url.origin || resolved.pathname !== '/save-storage-core.js') throw Error('Unexpected worker import');
        vm.runInContext(fs.readFileSync(path.join(dist, 'save-storage-core.js'), 'utf8'), context, {filename: resolved.href});
      }
    },
  });
  context.self = context;
  client.context = context;
  clients.set(id, client);
  vm.runInContext(fs.readFileSync(path.join(dist, 'save-storage-worker.js'), 'utf8'), context, {filename: url.href});
}

parentPort.on('message', packet => {
  try {
    if (packet.kind === 'new') makeClient(packet.client, packet.script, packet.failImport);
    else if (packet.kind === 'runtime') {
      const client = clients.get(packet.client);
      if (!client || client.dead) return;
      client.calls.set(packet.message.id, packet.message.method);
      client.context.onmessage?.({data: packet.message});
    } else if (packet.kind === 'terminate') {
      const client = clients.get(packet.client);
      if (client) client.dead = true;
    } else if (packet.kind === 'control') {
      let value;
      switch (packet.operation) {
        case 'inspect': value = {snapshot: db.snapshot(), history: db.history(), damaged: db.damagedCurrent(), pending: db.controls.pending.length, commits: db.controls.commits, opens: db.controls.opens, heldReplies}; break;
        case 'hold': db.controls.holdWrites = packet.value; break;
        case 'complete': db.complete(); break;
        case 'fail-put': db.controls.failPut = true; break;
        case 'fail-commit': db.controls.failCommit = true; break;
        case 'fail-open': db.controls.failOpen = true; break;
        case 'replace': db.replace(packet.value); break;
        case 'hold-next-reply': holdReply = packet.value; break;
        case 'corrupt': {
          const current = db.snapshot();
          current.entries.find(entry => entry.kind === 'file').data[0] ^= 1;
          db.replace(current); break;
        }
        case 'arm': armed = true; Atomics.store(gate, 0, 0); break;
        default: throw Error('Unknown test control');
      }
      parentPort.postMessage({kind: 'control', id: packet.id, value, threadId});
    }
  } catch (error) {
    if (packet.kind === 'control') parentPort.postMessage({kind: 'control', id: packet.id, error: String(error.message), threadId});
    else parentPort.postMessage({kind: 'client-error', client: packet.client, message: String(error.message), threadId});
  }
});
parentPort.postMessage({kind: 'host-ready', threadId});
