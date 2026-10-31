/* Browser save persistence adapter. Copyright (C) 2026. MIT License.
 * Official 0.2.6 glue omits IDBFS; the engine itself remains unchanged. */
(function (global) {
  'use strict';
  const DATABASE = 'pvz-portable-browser-saves-v1';
  const STORE = 'snapshots';
  const KEY = 'saves';
  const ROOT = '/saves';
  const installed = new WeakMap();
  const failure = message => new Error(message);

  function install(FS) {
    if (installed.has(FS)) return installed.get(FS);
    if (FS.filesystems && FS.filesystems.IDBFS) return Object.freeze({ fallback: false });
    const storage = global.indexedDB;
    if (!storage) throw failure('Browser save storage is unavailable.');
    const originalSync = FS.syncfs.bind(FS);
    let queue = Promise.resolve(), restored = false, revision = 0;

    function openDatabase() {
      return new Promise((resolve, reject) => {
        const request = storage.open(DATABASE, 1);
        let settled = false;
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
        };
        request.onerror = () => { settled = true; reject(request.error || failure('Browser save storage could not open.')); };
        request.onblocked = () => { settled = true; reject(failure('Close other game tabs, then retry saving.')); };
        request.onsuccess = () => {
          if (settled) { request.result.close(); return; }
          settled = true; resolve(request.result);
        };
      });
    }

    async function readSnapshot() {
      const db = await openDatabase();
      try {
        return await new Promise((resolve, reject) => {
          const transaction = db.transaction(STORE, 'readonly');
          const request = transaction.objectStore(STORE).get(KEY);
          let result;
          request.onsuccess = () => { result = request.result; };
          transaction.oncomplete = () => resolve(result);
          transaction.onerror = transaction.onabort = () => reject(transaction.error || request.error || failure('Browser saves could not be restored.'));
        });
      } finally { db.close(); }
    }

    async function commitSnapshot(entries) {
      const db = await openDatabase();
      try {
        return await new Promise((resolve, reject) => {
          const transaction = db.transaction(STORE, 'readwrite');
          const store = transaction.objectStore(STORE);
          const request = store.get(KEY);
          let error, nextRevision;
          request.onsuccess = () => {
            const currentRevision = request.result === undefined ? 0 : request.result.revision;
            if (currentRevision !== revision) {
              error = failure('Saves changed in another game tab. Keep this page open to protect its progress.');
              transaction.abort(); return;
            }
            nextRevision = revision + 1;
            store.put({ version: 1, revision: nextRevision, entries }, KEY);
          };
          transaction.oncomplete = () => { revision = nextRevision; resolve(); };
          transaction.onerror = transaction.onabort = () => reject(error || transaction.error || request.error || failure('Browser saves could not be stored.'));
        });
      } finally { db.close(); }
    }

    function validateSnapshot(snapshot) {
      if (!snapshot || snapshot.version !== 1 || !Number.isSafeInteger(snapshot.revision) || snapshot.revision < 1 || !Array.isArray(snapshot.entries)) {
        throw failure('Stored browser saves have an unsupported format.');
      }
      const names = new Set(), directories = new Set(['']);
      const entries = snapshot.entries.map(entry => {
        if (!entry || typeof entry.path !== 'string' || !entry.path || entry.path.includes('\\') || entry.path.includes('\0') ||
            entry.path.split('/').some(part => !part || part === '.' || part === '..') || names.has(entry.path)) {
          throw failure('Stored browser saves contain an invalid path.');
        }
        names.add(entry.path);
        if (!['file', 'directory'].includes(entry.kind) || !Number.isSafeInteger(entry.mode) || !Number.isFinite(entry.mtime)) {
          throw failure('Stored browser saves contain invalid metadata.');
        }
        if (entry.kind === 'directory') directories.add(entry.path);
        else if (!(entry.data instanceof Uint8Array)) throw failure('Stored browser saves contain invalid file data.');
        return { path: entry.path, kind: entry.kind, mode: entry.mode, mtime: entry.mtime,
          ...(entry.kind === 'file' ? { data: new Uint8Array(entry.data) } : {}) };
      });
      for (const entry of entries) {
        const slash = entry.path.lastIndexOf('/');
        if (!directories.has(slash < 0 ? '' : entry.path.slice(0, slash))) throw failure('Stored browser saves contain a missing parent directory.');
      }
      return entries;
    }

    function capture() {
      const entries = [];
      function visit(path, relative) {
        const stat = FS.lstat ? FS.lstat(path) : FS.stat(path);
        const directory = FS.isDir(stat.mode);
        if (!directory && (stat.mode & 0xf000) !== 0x8000) throw failure('Only regular files can be stored in browser saves.');
        if (relative) entries.push({ path: relative, kind: directory ? 'directory' : 'file', mode: stat.mode,
          mtime: Number(stat.mtime), ...(!directory ? { data: new Uint8Array(FS.readFile(path)) } : {}) });
        if (directory) for (const name of FS.readdir(path).sort()) {
          if (name === '.' || name === '..') continue;
          if (!name || name.includes('/') || name.includes('\\') || name.includes('\0')) throw failure('Invalid browser save filename.');
          visit(path + '/' + name, relative ? relative + '/' + name : name);
        }
      }
      visit(ROOT, '');
      return entries;
    }

    function replaceFiles(entries) {
      function remove(path) {
        for (const name of FS.readdir(path)) {
          if (name === '.' || name === '..') continue;
          const child = path + '/' + name;
          const stat = FS.lstat ? FS.lstat(child) : FS.stat(child);
          if (FS.isDir(stat.mode)) { remove(child); FS.rmdir(child); }
          else FS.unlink(child);
        }
      }
      remove(ROOT);
      for (const entry of entries.filter(item => item.kind === 'directory').sort((a, b) => a.path.split('/').length - b.path.split('/').length)) FS.mkdir(ROOT + '/' + entry.path);
      for (const entry of entries) if (entry.kind === 'file') FS.writeFile(ROOT + '/' + entry.path, entry.data);
      // Apply directory times last, after child writes have updated them.
      for (const entry of [...entries].sort((a, b) => b.path.split('/').length - a.path.split('/').length)) {
        const path = ROOT + '/' + entry.path;
        if (FS.chmod) FS.chmod(path, entry.mode & 0o777);
        if (FS.utime) FS.utime(path, entry.mtime, entry.mtime);
      }
    }

    async function synchronize(populate) {
      if (populate) restored = false;
      // Retain any real filesystem mounts outside /saves.
      await new Promise((resolve, reject) => originalSync(populate, error => error ? reject(error) : resolve()));
      if (populate) {
        const snapshot = await readSnapshot();
        if (snapshot !== undefined) {
          const entries = validateSnapshot(snapshot);
          const previous = capture();
          try { replaceFiles(entries); }
          catch (error) { replaceFiles(previous); throw error; }
          revision = snapshot.revision;
        } else revision = 0;
        restored = true;
      } else {
        if (!restored) throw failure('Browser saves have not been restored. Retry loading before saving.');
        await commitSnapshot(capture());
      }
    }

    FS.syncfs = function (populate, callback) {
      if (typeof populate === 'function') { callback = populate; populate = false; }
      if (typeof callback !== 'function') throw new TypeError('FS.syncfs requires a callback.');
      const operation = queue.then(() => synchronize(Boolean(populate)));
      queue = operation.catch(() => {});
      operation.then(() => callback(null), error => callback(error));
    };
    const adapter = Object.freeze({ fallback: true });
    installed.set(FS, adapter);
    return adapter;
  }
  global.PVZSaveStorage = Object.freeze({ install });
})(window);
