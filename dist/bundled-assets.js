/* Verified game bundle loading. SPDX-License-Identifier: LGPL-3.0-or-later. */
(() => {
  'use strict';
  const DATABASE = 'pvz-bundled-assets-v1';
  const STORE = 'bundles';
  const MAX_PART_BYTES = 8 * 1024 * 1024;
  const digest = async (bytes, crypto) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
    .map(value => value.toString(16).padStart(2, '0')).join('');
  const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
  const size = value => Number.isSafeInteger(value) && value > 0;

  function validateManifest(manifest, manifestURL) {
    if (manifest?.schemaVersion !== 1 || typeof manifest.id !== 'string' || !/^sha256:[a-f0-9]{64}$/.test(manifest.id)
        || !size(manifest.totalBytes) || !Array.isArray(manifest.files) || !manifest.files.length) {
      throw Error('The game bundle manifest is invalid.');
    }
    const base = new URL('.', manifestURL), paths = new Set();
    let total = 0;
    for (const file of manifest.files) {
      const path = file.path;
      if (typeof path !== 'string' || !/^(main\.pak|properties\/[^\\]+)$/.test(path)
          || path.split('/').some(part => !part || part === '.' || part === '..')
          || /[:\x00-\x1f?#%]/.test(path) || paths.has(path)
          || !size(file.size) || !hash(file.sha256) || !Array.isArray(file.parts) || !file.parts.length) {
        throw Error('The game bundle contains an invalid file.');
      }
      paths.add(path);
      let partBytes = 0;
      for (const part of file.parts) {
        if (typeof part.url !== 'string' || !part.url || /[\\\x00-\x20]/.test(part.url)
            || !size(part.size) || part.size > MAX_PART_BYTES || !hash(part.sha256)) {
          throw Error('The game bundle contains an invalid download part.');
        }
        const url = new URL(part.url, manifestURL);
        if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)
            || url.username || url.password || url.search || url.hash) {
          throw Error('The game bundle download is outside its asset directory.');
        }
        partBytes += part.size;
      }
      if (!Number.isSafeInteger(partBytes) || partBytes !== file.size) throw Error('The game bundle file size is invalid.');
      total += file.size;
    }
    if (!paths.has('main.pak') || !paths.has('properties/default.xml') || total !== manifest.totalBytes
        || !Number.isSafeInteger(total)) throw Error('The game bundle is incomplete.');
    return manifest;
  }

  // Resource storage is independent of the existing save database. A failed or
  // blocked resource cache never prevents a network-backed play session.
  async function cacheOperation(mode, operation) {
    let database;
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (error, result) => {
        if (settled) return;
        settled = true; clearTimeout(timer); database?.close();
        error ? reject(error) : resolve(result);
      };
      const timer = setTimeout(() => finish(Error('Game cache timed out.')), 3000);
      try {
        const request = indexedDB.open(DATABASE, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE);
        request.onerror = () => finish(request.error || Error('Game cache unavailable.'));
        request.onblocked = () => finish(Error('Game cache is blocked.'));
        request.onsuccess = () => {
          database = request.result;
          if (settled) { database.close(); return; }
          try {
            const transaction = database.transaction(STORE, mode);
            const result = operation(transaction.objectStore(STORE));
            let value;
            result.onsuccess = () => { value = result.result; };
            transaction.oncomplete = () => finish(null, value);
            transaction.onerror = () => finish(transaction.error || Error('Game cache unavailable.'));
            transaction.onabort = () => finish(transaction.error || Error('Game cache was interrupted.'));
            result.onerror = () => finish(result.error || Error('Game cache unavailable.'));
          } catch (error) { finish(error); }
        };
      } catch (error) { finish(error); }
    });
  }
  const cache = {
    get: () => cacheOperation('readonly', store => store.get('current')),
    put: value => cacheOperation('readwrite', store => store.put(value, 'current')),
  };

  function createLoader(options = {}) {
    const request = options.fetch || globalThis.fetch.bind(globalThis);
    const crypto = options.crypto || globalThis.crypto;
    const storage = options.cache || cache;
    const manifestURL = new URL(options.manifestURL || './game-assets/manifest.json', options.baseURL || document.baseURI).href;
    const progress = options.onProgress || (() => {});
    let pending = null;
    async function fetchValue(url, kind) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 60000);
      try {
        const response = await request(url, {cache: 'no-store', signal: controller.signal});
        if (!response.ok) throw Error(`Game download failed (${response.status}).`);
        return await response[kind]();
      } finally { clearTimeout(timer); }
    }
    async function load() {
      if (pending) return pending;
      pending = (async () => {
        progress({phase: 'manifest', loaded: 0});
        const manifest = validateManifest(await fetchValue(manifestURL, 'json'), manifestURL);
        // Include the catalog as well as its ID, so an incorrectly reused ID
        // cannot silently select stale cached bytes.
        const catalog = await digest(new TextEncoder().encode(JSON.stringify(manifest.files)), crypto);
        let saved;
        try { saved = await storage.get(); } catch (_) {}
        if (saved?.id === manifest.id && saved.catalog === catalog && Array.isArray(saved.files) && saved.files.length === manifest.files.length) {
          const files = new Map();
          try {
            for (const descriptor of manifest.files) {
              const entry = saved.files.find(item => item?.path === descriptor.path);
              if (typeof entry?.blob?.arrayBuffer !== 'function' || entry.blob.size !== descriptor.size
                  || await digest(await entry.blob.arrayBuffer(), crypto) !== descriptor.sha256) break;
              files.set(descriptor.path, entry.blob);
            }
          } catch (_) { files.clear(); }
          if (files.size === manifest.files.length) {
            progress({phase: 'ready', loaded: manifest.totalBytes, total: manifest.totalBytes, cached: true});
            return {id: manifest.id, files, cached: true};
          }
        }
        const files = new Map();
        let loaded = 0;
        for (const descriptor of manifest.files) {
          const assembled = new Uint8Array(descriptor.size);
          let offset = 0;
          for (const part of descriptor.parts) {
            const bytes = new Uint8Array(await fetchValue(new URL(part.url, manifestURL).href, 'arrayBuffer'));
            if (bytes.byteLength !== part.size || await digest(bytes, crypto) !== part.sha256) {
              throw Error('A game download failed its integrity check. Retry the download.');
            }
            assembled.set(bytes, offset); offset += bytes.byteLength; loaded += bytes.byteLength;
            progress({phase: 'download', loaded, total: manifest.totalBytes});
          }
          if (await digest(assembled, crypto) !== descriptor.sha256) throw Error('A game file failed its integrity check. Retry the download.');
          files.set(descriptor.path, new Blob([assembled]));
        }
        try {
          await storage.put({id: manifest.id, catalog, files: [...files].map(([path, blob]) => ({path, blob}))});
        } catch (_) {}
        progress({phase: 'ready', loaded, total: manifest.totalBytes, cached: false});
        return {id: manifest.id, files, cached: false};
      })();
      try { return await pending; } finally { pending = null; }
    }
    return Object.freeze({load});
  }
  globalThis.PVZAssetBundle = Object.freeze({createLoader, validateManifest});
})();
