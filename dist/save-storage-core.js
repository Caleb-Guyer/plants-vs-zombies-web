/* Browser save transaction core. Copyright (C) 2026. MIT License.
 * Runs in the dedicated save worker; the same implementation is retained for
 * browsers without Worker support. Native payloads and schema remain unchanged. */
(function (global) {
  'use strict';
  const DATABASE = 'pvz-portable-browser-saves-v1', STORE = 'snapshots';
  const KEY = 'saves', HISTORY_KEY = 'save-history';
  const SNAPSHOT_VERSION = 2, HISTORY_VERSION = 1, MAX_BACKUPS = 8;
  const failure = message => new Error(message);
  const unsupported = message => Object.assign(failure(message), {unsupportedVersion: true});
  const now = () => Date.now();
  const safeEngineVersion = value => typeof value === 'string' && /^[a-zA-Z0-9.+_-]{1,80}$/.test(value) ? value : 'unknown';
  function validateEntries(input) {
    if (!Array.isArray(input)) throw failure('Stored browser saves contain invalid entries.');
    const names = new Set(), directories = new Set(['']);
    const entries = input.map(entry => {
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
      return {path: entry.path, kind: entry.kind, mode: entry.mode, mtime: entry.mtime,
        ...(entry.kind === 'file' ? {data: new Uint8Array(entry.data)} : {})};
    });
    for (const entry of entries) {
      const slash = entry.path.lastIndexOf('/');
      if (!directories.has(slash < 0 ? '' : entry.path.slice(0, slash))) throw failure('Stored browser saves contain a missing parent directory.');
    }
    return entries;
  }
  const crcTable = new Uint32Array(256);
  for (let index = 0; index < 256; index++) {
    let value = index;
    for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ value >>> 1 : value >>> 1;
    crcTable[index] = value >>> 0;
  }
  function contentChecksum(entries) {
    const sorted = [...entries].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
    const metadata = JSON.stringify(sorted.map(entry => [entry.path, entry.kind, entry.mode, entry.mtime, entry.data?.length || 0]));
    let crc = 0xffffffff;
    const byte = value => {crc = crcTable[(crc ^ value) & 255] ^ crc >>> 8;};
    // Canonical UTF-16LE metadata plus length-delimited file bytes; no locale or async work.
    for (let i = 0; i < metadata.length; i++) {const code = metadata.charCodeAt(i); byte(code & 255); byte(code >>> 8);}
    for (const entry of sorted) if (entry.kind === 'file') for (const value of entry.data) byte(value);
    return 'crc32:' + ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
  }
  function normalizeSnapshot(snapshot) {
    if (snapshot?.version !== 1 && snapshot?.version !== SNAPSHOT_VERSION) {
      throw unsupported('Stored browser saves use a newer or unsupported format. Keep this browser data and update the game.');
    }
    if (!Number.isSafeInteger(snapshot.revision) || snapshot.revision < 1) throw failure('Stored browser saves contain an invalid revision.');
    if (snapshot.version === SNAPSHOT_VERSION && (!Number.isFinite(snapshot.savedAt) || snapshot.savedAt < 0 ||
        typeof snapshot.engineVersion !== 'string')) throw failure('Stored browser saves contain invalid version metadata.');
    const entries = validateEntries(snapshot.entries), checksum = contentChecksum(entries);
    if (snapshot.version === SNAPSHOT_VERSION && snapshot.checksum !== checksum) throw failure('Stored browser save checksum is invalid.');
    return {version: SNAPSHOT_VERSION, revision: snapshot.revision, entries, checksum,
      savedAt: snapshot.version === 1 ? 0 : snapshot.savedAt,
      engineVersion: snapshot.version === 1 ? 'Earlier version' : snapshot.engineVersion};
  }
  function sameContent(a, b) {
    if (a.length !== b.length) return false;
    const sorted = values => [...values].sort((x, y) => x.path < y.path ? -1 : x.path > y.path ? 1 : 0);
    const left = sorted(a), right = sorted(b);
    return left.every((entry, i) => {
      const other = right[i];
      return entry.path === other.path && entry.kind === other.kind && entry.mode === other.mode &&
        (entry.kind !== 'file' || entry.data.length === other.data.length && entry.data.every((byte, j) => byte === other.data[j]));
    });
  }
  function readHistory(value) {
    if (value === undefined) return {backups: [], damaged: false};
    if (value?.version !== HISTORY_VERSION) throw unsupported('Automatic backups use a newer or unsupported format. Update the game before saving.');
    if (!Array.isArray(value.backups)) return {backups: [], damaged: true};
    const ids = new Set(), backups = [];
    let damaged = false;
    for (const entry of value.backups) {
      try {
        if (!entry || typeof entry.id !== 'string' || !entry.id || ids.has(entry.id) ||
            typeof entry.reason !== 'string') throw failure('Invalid backup metadata.');
        const snapshot = normalizeSnapshot(entry.snapshot);
        ids.add(entry.id); backups.push({id: entry.id, reason: entry.reason, snapshot});
      } catch (error) {
        if (error.unsupportedVersion) throw error;
        damaged = true;
      }
    }
    return {backups: backups.slice(0, MAX_BACKUPS), damaged};
  }
  function addBackup(backups, snapshot, reason) {
    if (!snapshot || !snapshot.entries.some(entry => entry.kind === 'file')) return backups;
    return [{id: 'save-' + snapshot.revision + '-' + (snapshot.savedAt || now()), reason, snapshot},
      ...backups.filter(entry => !sameContent(entry.snapshot.entries, snapshot.entries))].slice(0, MAX_BACKUPS);
  }

  function create(storage) {
    if (!storage || typeof storage.open !== 'function') throw failure('Browser save storage is unavailable.');
    function openDatabase() {
      return new Promise((resolve, reject) => {
        const request = storage.open(DATABASE, 1);
        let settled = false;
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
        };
        request.onerror = () => {settled = true; reject(request.error || failure('Browser save storage could not open.'));};
        request.onblocked = () => {settled = true; reject(failure('Close other game tabs, then retry saving.'));};
        request.onsuccess = () => {
          if (settled) {request.result.close(); return;}
          settled = true; resolve(request.result);
        };
      });
    }
    async function transaction(mode, operation) {
      const db = await openDatabase();
      try {
        return await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE, mode), store = tx.objectStore(STORE);
          const currentRequest = store.get(KEY), historyRequest = store.get(HISTORY_KEY);
          let currentReady = false, historyReady = false, result, error;
          const run = () => {
            if (!currentReady || !historyReady) return;
            try {result = operation(currentRequest.result, historyRequest.result, store);}
            catch (caught) {error = caught; tx.abort();}
          };
          currentRequest.onsuccess = () => {currentReady = true; run();};
          historyRequest.onsuccess = () => {historyReady = true; run();};
          tx.oncomplete = () => resolve(result);
          tx.onerror = tx.onabort = () => reject(error || tx.error || currentRequest.error || historyRequest.error || failure('Browser save transaction failed.'));
        });
      } finally {db.close();}
    }
    function checkRevision(current, revision) {
      const storedRevision = current === undefined ? 0 : current.revision;
      if (storedRevision !== revision) throw failure('Saves changed in another game tab. Keep this page open to protect its progress.');
      if (!Number.isSafeInteger(revision) || revision < 0 || revision >= Number.MAX_SAFE_INTEGER) throw failure('Stored browser save revision is invalid.');
    }
    function validatedCurrent(current) {
      if (current === undefined) return null;
      return normalizeSnapshot(current);
    }
    function quarantine(store, current, history, historyInfo) {
      // Preserve malformed records before replacing them, in this same atomic transaction.
      if (current !== undefined) {
        try {normalizeSnapshot(current);} catch (error) {
          if (error.unsupportedVersion) throw error;
          store.put({capturedAt: now(), value: current}, 'save-damaged-current');
        }
      }
      if (historyInfo.damaged) store.put({capturedAt: now(), value: history}, 'save-damaged-history');
    }
    async function commit(entries, revision, version) {
      entries = validateEntries(entries);
      const nextRevision = await transaction('readwrite', (current, history, store) => {
        checkRevision(current, revision);
        const info = readHistory(history);
        let previous;
        try {previous = validatedCurrent(current);} catch (error) {if (error.unsupportedVersion) throw error;}
        quarantine(store, current, history, info);
        let backups = info.backups;
        if (previous && !sameContent(previous.entries, entries)) backups = addBackup(backups, previous, 'Automatic save');
        const next = revision + 1;
        store.put({version: SNAPSHOT_VERSION, revision: next, entries, checksum: contentChecksum(entries), savedAt: now(), engineVersion: safeEngineVersion(version)}, KEY);
        store.put({version: HISTORY_VERSION, backups}, HISTORY_KEY);
        return next;
      });
      return nextRevision;
    }
    async function read() {
      return transaction('readonly', (current, history) => {
        if (current === undefined) return {snapshot: null, revision: 0};
        try {return {snapshot: normalizeSnapshot(current), revision: current.revision};}
        catch (error) {
          if (error.unsupportedVersion) throw error;
          const info = readHistory(history), backup = info.backups[0];
          if (!backup) throw error;
          if (!Number.isSafeInteger(current.revision) || current.revision < 1) throw failure('Damaged save revision cannot safely be recovered.');
          return {snapshot: backup.snapshot, revision: current.revision,
            notice: 'Your latest browser save was damaged. The most recent valid automatic backup was recovered. The damaged record is preserved; you can choose another backup in Save Backups.'};
        }
      });
    }
    async function listBackups() {
      return transaction('readonly', (current, history) => {
        if (current !== undefined) {try {normalizeSnapshot(current);} catch (error) {if (error.unsupportedVersion) throw error;}}
        return readHistory(history).backups.map(backup => ({id: backup.id, reason: backup.reason,
          savedAt: backup.snapshot.savedAt, engineVersion: backup.snapshot.engineVersion,
          files: backup.snapshot.entries.filter(entry => entry.kind === 'file').length,
          bytes: backup.snapshot.entries.reduce((sum, entry) => sum + (entry.data?.length || 0), 0)}));
      });
    }
    async function restoreBackup(id, revision, version) {
      return transaction('readwrite', (current, history, store) => {
        checkRevision(current, revision);
        const info = readHistory(history), selected = info.backups.find(backup => backup.id === id);
        if (!selected) throw failure('This backup is no longer available. Refresh the backup list.');
        let previous;
        try {previous = validatedCurrent(current);} catch (error) {if (error.unsupportedVersion) throw error;}
        quarantine(store, current, history, info);
        const backups = addBackup(info.backups, previous, 'Before restore');
        const next = revision + 1;
        store.put({version: SNAPSHOT_VERSION, revision: next, entries: selected.snapshot.entries,
          checksum: contentChecksum(selected.snapshot.entries), savedAt: now(), engineVersion: safeEngineVersion(version)}, KEY);
        store.put({version: HISTORY_VERSION, backups}, HISTORY_KEY);
        return next;
      });
    }
    async function purgeRecoveryHistory(revision) {
      return transaction('readwrite', (current, history, store) => {
        checkRevision(current, revision);
        store.put({version: HISTORY_VERSION, backups: []}, HISTORY_KEY);
        store.put(null, 'save-damaged-current');
        store.put(null, 'save-damaged-history');
      });
    }
    return Object.freeze({read, commit, listBackups, restoreBackup, purgeRecoveryHistory});
  }
  global.PVZSaveStorageCore = Object.freeze({create, snapshotVersion: SNAPSHOT_VERSION, maxBackups: MAX_BACKUPS});
})(typeof self === 'undefined' ? window : self);
