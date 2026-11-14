/* Optional assets-free QA profile merger. SPDX-License-Identifier: LGPL-3.0-or-later.
 * Generated fixtures are test progress, not earned campaign completion.
 * Existing player records, details, and registry selection are preserved.
 */
(() => {
  'use strict';
  const root = typeof window === 'undefined' ? globalThis : window;
  const DIRECTORY = '/saves/userdata';
  const INDEX = DIRECTORY + '/users.dat';
  const UINT32_MAX = 0xffffffff;
  const EXCLUSIVE_CREATE = 705; // Emscripten O_WRONLY|O_CREAT|O_EXCL|O_TRUNC.
  const FIXTURES = new Map([
    ['QA - Full Game', 1], ['QA - Night', 11], ['QA - Pool', 21],
    ['QA - Fog', 31], ['QA - Roof', 41], ['QA - Boss', 50],
  ]);
  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  const asBytes = value => value instanceof Uint8Array ? value : new Uint8Array(value);
  const sameBytes = (a, b) => a.length === b.length && a.every((value, index) => value === b[index]);

  function parseIndex(value, label) {
    const bytes = asBytes(value), view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let offset = 0;
    const need = length => { if (offset + length > bytes.length) throw Error(label + ' is truncated. No profiles were changed.'); };
    const u16 = () => { need(2); const value = view.getUint16(offset, true); offset += 2; return value; };
    const u32 = () => { need(4); const value = view.getUint32(offset, true); offset += 4; return value; };
    if (u32() !== 14) throw Error(label + ' is not a supported version14 profile index. No profiles were changed.');
    const count = u16(), profiles = [], ids = new Set(), names = new Set();
    for (let i = 0; i < count; i++) {
      const size = u16(); need(size);
      const nameBytes = bytes.slice(offset, offset + size); offset += size;
      let name;
      try { name = decoder.decode(nameBytes); } catch (_) { throw Error(label + ' contains an invalid UTF-8 profile name. No profiles were changed.'); }
      const sequence = u32(), id = u32();
      if (!name || ids.has(id) || names.has(name)) throw Error(label + ' contains ambiguous profile records. No profiles were changed.');
      profiles.push({ name, nameBytes, sequence, id }); ids.add(id); names.add(name);
    }
    if (offset !== bytes.length) throw Error(label + ' contains unexpected trailing data. No profiles were changed.');
    return profiles;
  }

  function encodeIndex(profiles) {
    if (profiles.length > 65535) throw Error('The merged profile list is too large. No profiles were changed.');
    const length = 6 + profiles.reduce((sum, profile) => sum + 10 + profile.nameBytes.length, 0);
    const bytes = new Uint8Array(length), view = new DataView(bytes.buffer); let offset = 0;
    const u16 = value => { view.setUint16(offset, value, true); offset += 2; };
    const u32 = value => { view.setUint32(offset, value, true); offset += 4; };
    u32(14); u16(profiles.length);
    for (const profile of profiles) {
      if (profile.nameBytes.length > 65535) throw Error('A profile name is too long. No profiles were changed.');
      u16(profile.nameBytes.length); bytes.set(profile.nameBytes, offset); offset += profile.nameBytes.length;
      u32(profile.sequence); u32(profile.id);
    }
    return bytes;
  }

  function fileExists(FS, path) {
    try { FS.stat(path); return true; }
    catch (error) {
      if (error?.errno === 44 || error?.errno === 2 || error?.code === 'ENOENT') return false;
      throw error;
    }
  }
  function detailExists(FS, id) {
    const name = DIRECTORY + '/user' + id + '.dat';
    if (!fileExists(FS, name)) return false;
    const stat = FS.stat(name);
    return typeof FS.isFile !== 'function' || FS.isFile(stat.mode);
  }
  function isFixtureName(existingName, fixtureName) {
    const current = existingName.toLowerCase(), wanted = fixtureName.toLowerCase();
    return current === wanted || current.startsWith(wanted + ' (');
  }
  function validateDetail(bytes, fixture) {
    if (bytes.length !== 886) throw Error('The test profile package contains an unexpected detail file. No profiles were changed.');
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (view.getUint32(0, true) !== 12 || view.getUint32(4, true) !== FIXTURES.get(fixture.name) || view.getUint32(816, true) !== 0 || view.getUint32(861, true) !== 0) throw Error('The test profile package does not match the expected generated fixtures. No profiles were changed.');
  }

  async function addPvZTestProfiles(FS, JSZip, zipBytes) {
    for (const method of ['readFile', 'writeFile', 'stat', 'readdir', 'rename', 'unlink']) if (typeof FS?.[method] !== 'function') throw Error('The save filesystem is not ready.');
    if (typeof JSZip?.loadAsync !== 'function') throw Error('The ZIP reader is not ready.');
    // Parse the existing index before any writes. Unknown/corrupt formats are
    // preserved for the player to export rather than guessed or overwritten.
    const hadIndex = fileExists(FS, INDEX);
    const originalIndex = hadIndex ? asBytes(FS.readFile(INDEX)).slice() : null;
    const existing = hadIndex ? parseIndex(originalIndex, 'Your existing save') : [];
    const zip = await JSZip.loadAsync(zipBytes, { checkCRC32: true });
    const summaryEntry = zip.file('userdata/users.dat');
    if (!summaryEntry) throw Error('The generated test profile package is incomplete. No profiles were changed.');
    const fixtures = parseIndex(await summaryEntry.async('uint8array'), 'The test profile package');
    if (fixtures.length !== 6 || fixtures.some(profile => !FIXTURES.has(profile.name))) throw Error('The generated test profile package has an unexpected roster. No profiles were changed.');
    const expectedFiles = new Set(['userdata/users.dat', ...fixtures.map(profile => 'userdata/user' + profile.id + '.dat')]);
    const actualFiles = Object.keys(zip.files).filter(name => !zip.files[name].dir);
    if (actualFiles.length !== expectedFiles.size || actualFiles.some(name => !expectedFiles.has(name))) throw Error('Only the generated assets-free test profile package can be added here. No profiles were changed.');
    const fixtureDetails = new Map();
    for (const fixture of fixtures) {
      const file = zip.file('userdata/user' + fixture.id + '.dat');
      if (!file) throw Error('A generated test profile is missing. No profiles were changed.');
      const bytes = asBytes(await file.async('uint8array')).slice(); validateDetail(bytes, fixture); fixtureDetails.set(fixture.id, bytes);
    }

    const usedIds = new Set(existing.map(profile => profile.id));
    if (fileExists(FS, DIRECTORY)) for (const filename of FS.readdir(DIRECTORY)) {
      const match = filename.match(/^user(\d+)\.dat$/i) || filename.match(/^game(\d+)_\d+\.(?:dat|v4)$/i);
      if (match) { const id = Number(match[1]); if (Number.isInteger(id) && id >= 0 && id <= UINT32_MAX) usedIds.add(id); }
    }
    const usedNames = new Set(existing.map(profile => profile.name.toLowerCase()));
    const added = [], skipped = [], planned = [];
    let candidateId = 900001;
    let highestSequence = existing.reduce((highest, profile) => Math.max(highest, profile.sequence), 0);
    for (const fixture of fixtures) {
      const previous = existing.find(profile => isFixtureName(profile.name, fixture.name) && detailExists(FS, profile.id));
      if (previous) { skipped.push({ name: previous.name, id: previous.id, fixture: fixture.name }); continue; }
      while (usedIds.has(candidateId)) candidateId++;
      if (candidateId > UINT32_MAX) throw Error('No unused test profile ID is available. No profiles were changed.');
      let name = fixture.name, suffix = 2;
      while (usedNames.has(name.toLowerCase())) name = fixture.name + ' (' + suffix++ + ')';
      const sequence = highestSequence < UINT32_MAX ? ++highestSequence : UINT32_MAX;
      const profile = { name, nameBytes: encoder.encode(name), sequence, id: candidateId++ };
      usedIds.add(profile.id); usedNames.add(name.toLowerCase());
      planned.push({ profile, bytes: fixtureDetails.get(fixture.id) }); added.push({ name, id: profile.id, fixture: fixture.name });
    }
    const profiles = [...existing, ...planned.map(item => item.profile)];
    const newIndex = encodeIndex(profiles);
    const result = { added, skipped, totalProfiles: profiles.length, currentSelectionUnchanged: true, generatedTestProgress: true, warnings: profiles.length > 200 ? ['The native game trims profiles above200 when a new profile is later created. Export your saves before creating additional users.'] : [] };
    if (!planned.length) return result;

    const created = []; let temporaryIndex, temporaryCreated = false;
    try {
      if (!fileExists(FS, DIRECTORY)) {
        if (typeof FS.mkdirTree === 'function') FS.mkdirTree(DIRECTORY);
        else if (typeof FS.mkdir === 'function') FS.mkdir(DIRECTORY);
        else throw Error('The save folder is unavailable.');
      }
      for (const item of planned) {
        const path = DIRECTORY + '/user' + item.profile.id + '.dat';
        FS.writeFile(path, item.bytes, { flags: EXCLUSIVE_CREATE }); created.push(path);
      }
      temporaryIndex = DIRECTORY + '/.qa-profile-index-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2) + '.tmp';
      FS.writeFile(temporaryIndex, newIndex, { flags: EXCLUSIVE_CREATE });
      temporaryCreated = true;
      const nowHasIndex = fileExists(FS, INDEX);
      if (nowHasIndex !== hadIndex || (hadIndex && !sameBytes(asBytes(FS.readFile(INDEX)), originalIndex))) throw Error('The profile list changed while test profiles were being prepared. Please try again.');
      FS.rename(temporaryIndex, INDEX); temporaryIndex = null;
    } catch (error) {
      // Only files created exclusively by this attempt are removed on failure.
      if (temporaryIndex && temporaryCreated) { try { FS.unlink(temporaryIndex); } catch (_) {} }
      for (const path of created) { try { FS.unlink(path); } catch (_) {} }
      throw error;
    }
    return result;
  }
  root.addPvZTestProfiles = addPvZTestProfiles;
})();
