/* Browser save backup/import. SPDX-License-Identifier: LGPL-3.0-or-later.
 * Native profile, board and registry bytes are preserved without conversion.
 * This module never reads original game resources or changes browser audio.
 */
(() => {
  'use strict';
  let transactionNumber = 0;
  const queues = new WeakMap();
  function queued(FS, operation) {
    const previous = queues.get(FS) || Promise.resolve();
    const result = previous.then(operation);
    const settled = result.catch(() => {});
    queues.set(FS, settled);
    return result.finally(() => { if (queues.get(FS) === settled) queues.delete(FS); });
  }
  const decoder = new TextDecoder();
  const nativeFile = /^(?:users\.dat|user\d+\.dat|game\d+_\d+\.(?:dat|v4))$/i;
  const prohibited = /\.(?:pak|exe|dll)$/i;
  const bytesOf = value => {
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    throw new TypeError('Save data must be a byte array.');
  };
  const asBytes = async value => typeof value?.arrayBuffer === 'function' ? new Uint8Array(await value.arrayBuffer()) : bytesOf(value);
  const timestamp = value => value instanceof Date ? value.getTime() : Number(value);
  const missing = error => error?.errno === 44 || error?.code === 'ENOENT';
  function stat(FS, path) {
    try { return (FS.lstat || FS.stat).call(FS, path); }
    catch (error) { if (missing(error)) return null; throw error; }
  }
  const isDirectory = entry => (entry.mode & 0xf000) === 0x4000;
  function safeParts(raw) {
    if (typeof raw !== 'string' || !raw || /[\x00-\x1f]/.test(raw)) throw new Error('Invalid save archive path.');
    const path = raw.replace(/\\/g, '/');
    if (path.startsWith('/') || /^[a-z]:/i.test(path)) throw new Error('Absolute save archive paths are not allowed.');
    const parts = path.split('/').filter(Boolean);
    if (!parts.length || parts.some(part => part === '.' || part === '..' || part.includes(':'))) throw new Error('Save archive path traversal is not allowed.');
    return parts;
  }
  function normalizePath(raw) {
    const parts = safeParts(raw);
    const leaf = parts.at(-1);
    if (leaf.toLowerCase() === 'registry.regemu') return 'registry.regemu';
    const marker = parts.findIndex(part => part.toLowerCase() === 'userdata');
    let relative;
    if (marker >= 0) relative = parts.slice(marker + 1);
    else if (nativeFile.test(leaf)) relative = [leaf];
    else return null;
    if (!relative.length) return null;
    if (prohibited.test(leaf)) throw new Error('Original game resources and executables are not save files.');
    if (relative.length === 1 && nativeFile.test(leaf)) relative[0] = leaf.toLowerCase();
    return 'userdata/' + relative.join('/');
  }
  function registryLocation(raw) {
    const parts = safeParts(raw);
    if (parts.at(-1).toLowerCase() !== 'registry.regemu') return null;
    return parts.some(part => part.toLowerCase() === 'userdata') ? 'legacy' : 'canonical';
  }
  function crc32(data) {
    let crc = 0xffffffff;
    for (const byte of data) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
  function validateData(path, data) {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    let offset = 0;
    const take = count => {
      if (!Number.isSafeInteger(count) || count < 0 || count > data.length - offset) throw new Error(`Truncated save file: ${path}`);
      const result = data.subarray(offset, offset + count); offset += count; return result;
    };
    const u16 = () => { const at = offset; take(2); return view.getUint16(at, true); };
    const u32 = () => { const at = offset; take(4); return view.getUint32(at, true); };
    if (path === 'registry.regemu') {
      if (decoder.decode(take(6)) !== 'REGEMU' || u16() !== 1) throw new Error('Unsupported registry.regemu format.');
      const string = () => { const value = take(u32()); if (!value.length || value.at(-1) !== 0) throw new Error('Invalid registry string.'); };
      const count = u32();
      for (let i = 0; i < count; i++) {
        string(); const values = u32();
        for (let j = 0; j < values; j++) { string(); u32(); take(u32()); }
      }
      if (offset !== data.length) throw new Error('Unexpected trailing registry data.');
    } else if (path.toLowerCase() === 'userdata/users.dat') {
      if (u32() !== 14) throw new Error('Unsupported native profile index version.');
      const count = u16(), ids = new Set(), names = new Set();
      for (let i = 0; i < count; i++) {
        const name = take(u16());
        if (!name.length) throw new Error('Empty native profile name.');
        const key = [...name].map(byte => byte >= 65 && byte <= 90 ? byte + 32 : byte).join(',');
        u32(); const id = u32();
        if (!id || ids.has(id) || names.has(key)) throw new Error('Conflicting native profile index entries.');
        ids.add(id); names.add(key);
      }
      if (offset !== data.length) throw new Error('Unexpected trailing native profile index data.');
    } else if (/^userdata\/user\d+\.dat$/i.test(path)) {
      if (u32() !== 12 || data.length < 860) throw new Error('Unsupported or truncated GOTY profile details.');
      const plants = view.getUint32(816, true);
      if (plants > 200 || data.length < 860 + plants * 88) throw new Error('Truncated native garden profile data.');
    } else if (/\.v4$/i.test(path)) {
      if (decoder.decode(take(12)).replace(/\0+$/, '') !== 'PVZP_SAVE4' || u32() !== 1) throw new Error('Unsupported portable board save.');
      const size = u32(), expected = u32();
      if (size !== data.length - 24 || crc32(take(size)) !== expected) throw new Error('Portable board save checksum failed.');
    } else if (/^userdata\/game\d+_\d+\.dat$/i.test(path)) {
      if (u32() !== 0xfeeddead || u32() !== 2) throw new Error('Unsupported legacy board save.');
      take(4); // Original build-date checksum; the engine owns compatibility.
    }
  }
  // JSZip collapses identical entry names and sanitizes ../ before exposing
  // zip.files. Inspect its central directory first so these cannot disappear.
  function inspectArchive(data) {
    if (data.length < 22) throw new Error('Truncated save ZIP.');
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    let end = -1;
    for (let at = data.length - 22; at >= Math.max(0, data.length - 65557); at--) {
      if (view.getUint32(at, true) === 0x06054b50 && at + 22 + view.getUint16(at + 20, true) === data.length) { end = at; break; }
    }
    if (end < 0) throw new Error('Invalid save ZIP directory.');
    if (view.getUint16(end + 4, true) || view.getUint16(end + 6, true)) throw new Error('Multi-part save ZIPs are not supported.');
    const count = view.getUint16(end + 10, true), size = view.getUint32(end + 12, true);
    let at = view.getUint32(end + 16, true);
    if (count === 0xffff || size === 0xffffffff || at === 0xffffffff) throw new Error('ZIP64 save archives are not supported.');
    if (view.getUint16(end + 8, true) !== count || at + size !== end) throw new Error('Invalid save ZIP directory bounds.');
    const names = new Set();
    for (let i = 0; i < count; i++) {
      if (at + 46 > end || view.getUint32(at, true) !== 0x02014b50) throw new Error('Truncated save ZIP entry.');
      const length = view.getUint16(at + 28, true), extra = view.getUint16(at + 30, true), comment = view.getUint16(at + 32, true);
      if (at + 46 + length + extra + comment > end) throw new Error('Truncated save ZIP filename.');
      const raw = decoder.decode(data.subarray(at + 46, at + 46 + length));
      const key = safeParts(raw).join('/');
      if (names.has(key)) throw new Error(`Duplicate save ZIP entry: ${raw}`);
      names.add(key);
      at += 46 + length + extra + comment;
    }
    if (at !== end) throw new Error('Unexpected save ZIP directory data.');
  }
  function stageEntries(entries) {
    const plans = new Map();
    // Earlier shell imports misplaced this file inside userdata. A genuine
    // root registry (possibly under an archive wrapper) is authoritative.
    const hasCanonicalRegistry = entries.some(entry => registryLocation(entry.name) === 'canonical');
    for (const entry of entries) {
      const path = normalizePath(entry.name);
      if (!path) continue;
      if (hasCanonicalRegistry && registryLocation(entry.name) === 'legacy') continue;
      if (plans.has(path)) throw new Error(`Conflicting save import targets: ${path}`);
      const data = new Uint8Array(bytesOf(entry.data));
      validateData(path, data);
      plans.set(path, { path, data, date: entry.date, mode: entry.mode });
    }
    for (const path of plans.keys()) {
      let ancestor = path;
      while (ancestor.includes('/')) {
        ancestor = ancestor.slice(0, ancestor.lastIndexOf('/'));
        if (plans.has(ancestor)) throw new Error('A save file conflicts with an imported directory.');
      }
    }
    if (!plans.size) throw new Error('No recognized save files were found.');
    return [...plans.values()];
  }
  function metadata(entry) {
    return { mode: entry.mode, atime: timestamp(entry.atime ?? entry.mtime), mtime: timestamp(entry.mtime) };
  }
  function applyMetadata(FS, path, values) {
    if (values.mode != null && FS.chmod) FS.chmod(path, values.mode & 0o7777);
    if (Number.isFinite(values.mtime) && FS.utime) FS.utime(path, Number.isFinite(values.atime) ? values.atime : values.mtime, values.mtime);
  }
  async function commit(FS, plans, persist) {
    const parents = new Map(), created = [], snapshots = new Map();
    const root = stat(FS, '/saves');
    if (!root || !isDirectory(root)) throw new Error('Browser save storage is not ready.');
    parents.set('/saves', metadata(root));
    for (const plan of plans) {
      const target = '/saves/' + plan.path;
      plan.target = target;
      const existing = stat(FS, target);
      if (existing && (existing.mode & 0xf000) !== 0x8000) throw new Error(`Save target is not a regular file: ${plan.path}`);
      snapshots.set(target, existing ? { ...metadata(existing), data: new Uint8Array(FS.readFile(target)) } : null);
      const parts = target.split('/'); let path = '';
      for (let i = 1; i < parts.length - 1; i++) {
        path += '/' + parts[i];
        const value = stat(FS, path);
        if (value && !isDirectory(value)) throw new Error(`Save parent is not a directory: ${path}`);
        if (value && !parents.has(path)) parents.set(path, metadata(value));
      }
    }
    let temporary;
    do { temporary = '/saves/.pvz-transfer-' + Date.now().toString(36) + '-' + (++transactionNumber); } while (stat(FS, temporary));
    let cleaned = false, persistenceAttempted = false;
    const removeTemp = () => {
      if (!stat(FS, temporary)) return;
      for (const name of FS.readdir(temporary)) if (name !== '.' && name !== '..') FS.unlink(temporary + '/' + name);
      FS.rmdir(temporary);
    };
    const restore = () => {
      for (const plan of [...plans].reverse()) {
        if (!plan.moved && !plan.written) continue;
        const previous = snapshots.get(plan.target);
        if (plan.written && stat(FS, plan.target)) FS.unlink(plan.target);
        if (previous) {
          if (!cleaned && plan.backup && stat(FS, plan.backup)) FS.rename(plan.backup, plan.target);
          else FS.writeFile(plan.target, previous.data);
          applyMetadata(FS, plan.target, previous);
        }
      }
      removeTemp();
      for (const path of [...created].reverse()) if (stat(FS, path) && FS.readdir(path).every(name => name === '.' || name === '..')) FS.rmdir(path);
      for (const [path, values] of [...parents].reverse()) applyMetadata(FS, path, values);
    };
    try {
      FS.mkdir(temporary);
      for (let i = 0; i < plans.length; i++) {
        plans[i].staged = temporary + '/new-' + i;
        FS.writeFile(plans[i].staged, plans[i].data);
      }
      for (const plan of plans) {
        const parts = plan.target.split('/'); let path = '';
        for (let i = 1; i < parts.length - 1; i++) {
          path += '/' + parts[i];
          if (!stat(FS, path)) { FS.mkdir(path); created.push(path); }
        }
      }
      for (let i = 0; i < plans.length; i++) {
        const plan = plans[i];
        if (snapshots.get(plan.target)) {
          plan.backup = temporary + '/old-' + i;
          FS.rename(plan.target, plan.backup); plan.moved = true;
        }
        FS.rename(plan.staged, plan.target); plan.written = true;
        const previous = snapshots.get(plan.target);
        applyMetadata(FS, plan.target, { mode: plan.mode ?? previous?.mode ?? 0o644, mtime: timestamp(plan.date), atime: timestamp(plan.date) });
      }
      // The storage adapter snapshots the entire /saves tree. No transaction
      // directory or old backup bytes may be present during persistence.
      removeTemp(); cleaned = true;
      persistenceAttempted = true;
      if (persist) await persist();
      return { files: plans.length, paths: plans.map(plan => plan.path), restoredRegistry: plans.some(plan => plan.path === 'registry.regemu') };
    } catch (error) {
      try {
        restore();
        if (persistenceAttempted && persist) {
          try { await persist(); } catch (rollbackError) { error.rollbackPersistError = rollbackError; }
        }
      } catch (rollbackError) { error.rollbackError = rollbackError; }
      throw error;
    }
  }
  async function readZip(FS, JSZip, input, persist) {
    const bytes = await asBytes(input);
    inspectArchive(bytes);
    const archive = await JSZip.loadAsync(bytes, { checkCRC32: true });
    const entries = [];
    for (const entry of Object.values(archive.files)) {
      safeParts(entry.unsafeOriginalName || entry.name);
      if (entry.dir) continue;
      entries.push({ name: entry.unsafeOriginalName || entry.name, data: await entry.async('uint8array'), date: entry.date, mode: entry.unixPermissions });
    }
    return commit(FS, stageEntries(entries), persist);
  }
  async function readFiles(FS, files, persist) {
    const entries = [];
    for (const file of Array.from(files)) entries.push({ name: file.webkitRelativePath || file.name, data: await asBytes(file), date: file.lastModified });
    return commit(FS, stageEntries(entries), persist);
  }
  async function createZip(FS, JSZip, { type = 'blob' } = {}) {
    const archive = new JSZip(), paths = [];
    const hasCanonicalRegistry = !!stat(FS, '/saves/registry.regemu');
    const walk = path => {
      const value = stat(FS, path);
      if (!value) return;
      if (isDirectory(value)) {
        for (const name of FS.readdir(path).sort()) if (name !== '.' && name !== '..') walk(path + '/' + name);
      } else {
        if ((value.mode & 0xf000) !== 0x8000) throw new Error('Save backup contains a non-regular file.');
        const relative = path.slice('/saves/'.length);
        if (prohibited.test(relative)) throw new Error('Game resources do not belong in a save backup.');
        safeParts(relative);
        // Do not delete the obsolete source artifact; simply leave it out of
        // a backup when the engine's actual root registry already exists.
        if (hasCanonicalRegistry && registryLocation(relative) === 'legacy') return;
        const date = new Date(timestamp(value.mtime));
        archive.file(relative, new Uint8Array(FS.readFile(path)), { date: Number.isFinite(date.getTime()) ? date : new Date(), unixPermissions: value.mode, createFolders: false });
        paths.push(relative);
      }
    };
    walk('/saves/registry.regemu'); walk('/saves/userdata');
    if (!paths.length) throw new Error('No save data found.');
    return archive.generateAsync({ type, platform: 'UNIX', compression: 'DEFLATE' });
  }
  const exportZip = (FS, JSZip, options) => queued(FS, () => createZip(FS, JSZip, options));
  const importZip = (FS, JSZip, input, persist) => queued(FS, () => readZip(FS, JSZip, input, persist));
  const importFiles = (FS, files, persist) => queued(FS, () => readFiles(FS, files, persist));
  Object.defineProperty(globalThis, 'PVZSaveTransfer', { configurable: false, writable: false, value: Object.freeze({ exportZip, importZip, importFiles, normalizePath }) });
})();
