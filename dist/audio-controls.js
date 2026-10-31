/* Browser master audio controls. SPDX-License-Identifier: LGPL-3.0-or-later.
 * Load before the unmodified PvZ-Portable engine. Native music/SFX volumes remain
 * owned by its Options menu. ?testing=1 keeps hardware output silent during QA.
 */
(() => {
  'use strict';
  const root = globalThis;
  if (root.PVZAudio) return;
  const PREFERENCE = 'pvz-muted';
  const MIGRATION = 'pvz-audio-registry-migrated-v3';
  const testing = new URLSearchParams(root.location?.search || '').get('testing') === '1';
  const subscribers = new Set(), contexts = new Set(), mediaElements = new Set();
  const masterNodes = new WeakMap(), mediaPreferences = new WeakMap();
  let memoryMigrationDone = false, registryPreparation;
  const storageGet = key => { try { return root.localStorage?.getItem(key); } catch (_) { return null; } };
  const storageSet = (key, value) => { try { root.localStorage?.setItem(key, value); } catch (_) {} };
  let preferredMuted = ['true', '1'].includes(storageGet(PREFERENCE));
  const isMuted = () => testing || preferredMuted;

  const nodePrototype = root.AudioNode?.prototype;
  const nativeConnect = nodePrototype?.connect;
  const nativeCreateGain = root.BaseAudioContext?.prototype.createGain || root.AudioContext?.prototype.createGain;
  function updateMaster(gain, context) {
    const value = isMuted() ? 0 : 1;
    gain.gain.cancelScheduledValues?.(context.currentTime);
    gain.gain.value = value;
    gain.gain.setValueAtTime(value, context.currentTime);
  }
  if (nativeConnect && nativeCreateGain) Object.defineProperty(nodePrototype, 'connect', {
    configurable: true, writable: true,
    value: function (destination, ...ports) {
      if (destination && destination === this.context?.destination) {
        let master = masterNodes.get(this.context);
        if (!master) {
          master = nativeCreateGain.call(this.context);
          updateMaster(master, this.context);
          nativeConnect.call(master, destination);
          masterNodes.set(this.context, master); contexts.add(this.context);
        }
        // Keep the graph connected and processing when muted. No PCM buffers,
        // context clocks, native mixer gains, or music positions are changed.
        nativeConnect.call(this, master, ...ports);
        return destination;
      }
      return nativeConnect.call(this, destination, ...ports);
    },
  });

  const media = root.HTMLMediaElement?.prototype;
  const mutedDescriptor = media && Object.getOwnPropertyDescriptor(media, 'muted');
  const volumeDescriptor = media && Object.getOwnPropertyDescriptor(media, 'volume');
  function applyMedia(element) {
    const preference = mediaPreferences.get(element);
    if (!preference) return;
    // Restore this element's own settings; a master toggle never sets its volume
    // to1 or forgets an element that the application independently muted.
    volumeDescriptor?.set?.call(element, preference.volume);
    mutedDescriptor?.set?.call(element, isMuted() || preference.muted);
  }
  function trackMedia(element) {
    if (!element || !mutedDescriptor?.get || !volumeDescriptor?.get) return element;
    if (!mediaPreferences.has(element)) {
      mediaPreferences.set(element, { muted: mutedDescriptor.get.call(element), volume: volumeDescriptor.get.call(element) });
      mediaElements.add(element);
    }
    applyMedia(element);
    return element;
  }
  if (media) {
    if (mutedDescriptor?.configurable && mutedDescriptor.set) Object.defineProperty(media, 'muted', {
      configurable: true, enumerable: mutedDescriptor.enumerable, get: mutedDescriptor.get,
      set(value) { trackMedia(this); mediaPreferences.get(this).muted = !!value; applyMedia(this); },
    });
    if (volumeDescriptor?.configurable && volumeDescriptor.set) Object.defineProperty(media, 'volume', {
      configurable: true, enumerable: volumeDescriptor.enumerable, get: volumeDescriptor.get,
      set(value) {
        trackMedia(this);
        volumeDescriptor.set.call(this, value); // Preserve native range checks.
        mediaPreferences.get(this).volume = volumeDescriptor.get.call(this);
        applyMedia(this);
      },
    });
    const nativePlay = media.play;
    if (nativePlay) Object.defineProperty(media, 'play', {
      configurable: true, writable: true,
      value: function (...args) { trackMedia(this); return nativePlay.apply(this, args); },
    });
  }
  if (root.Audio) {
    const NativeAudio = root.Audio;
    root.Audio = new Proxy(NativeAudio, {
      construct(Target, args, NewTarget) { return trackMedia(Reflect.construct(Target, args, NewTarget)); },
      apply(Target, receiver, args) { return trackMedia(Reflect.apply(Target, receiver, args)); },
    });
  }
  const doc = root.document;
  if (doc?.createElement) {
    const nativeCreateElement = doc.createElement.bind(doc);
    doc.createElement = function (tag, options) {
      const element = nativeCreateElement(tag, options);
      return /^(audio|video)$/i.test(String(tag)) ? trackMedia(element) : element;
    };
    const trackWithin = node => {
      if (node?.matches?.('audio,video')) trackMedia(node);
      node?.querySelectorAll?.('audio,video').forEach(trackMedia);
    };
    trackWithin(doc);
    if (root.MutationObserver) new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) trackWithin(node);
    }).observe(doc.documentElement || doc, { subtree: true, childList: true });
    doc.addEventListener('play', event => trackMedia(event.target), true);
    // Browser autoplay policy may defer a newly created SDL context until the
    // next real interaction. This listener never changes the master mute state.
    doc.addEventListener('pointerdown', () => { void resume(); }, true);
    doc.addEventListener('keydown', () => { void resume(); }, true);
  }
  function notify() {
    const value = isMuted();
    for (const subscriber of subscribers) {
      try { subscriber(value); } catch (error) { console.warn('Audio subscriber failed.', error); }
    }
  }
  async function resume() {
    return Promise.allSettled([...contexts].filter(context => context.state === 'suspended').map(context => {
      try { return context.resume(); } catch (error) { return Promise.reject(error); }
    }));
  }
  function refresh() {
    for (const context of contexts) updateMaster(masterNodes.get(context), context);
    for (const element of mediaElements) applyMedia(element);
    notify();
  }
  function setMuted(value) {
    preferredMuted = !!value;
    storageSet(PREFERENCE, String(preferredMuted));
    refresh();
    if (!isMuted()) void resume();
    return isMuted();
  }
  root.addEventListener?.('storage', event => {
    if (event.key !== PREFERENCE) return;
    preferredMuted = ['true', '1'].includes(event.newValue); refresh();
  });

  const encoder = new TextEncoder(), decoder = new TextDecoder('utf-8', { fatal: true });
  function readRegistry(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength); let offset = 0;
    const need = length => { if (length < 0 || offset + length > bytes.length) throw Error('Truncated RegEmu file'); };
    const take = length => { need(length); const value = bytes.slice(offset, offset + length); offset += length; return value; };
    const u16 = () => { need(2); const value = view.getUint16(offset, true); offset += 2; return value; };
    const u32 = () => { need(4); const value = view.getUint32(offset, true); offset += 4; return value; };
    const string = () => decoder.decode(take(u32())).replace(/\0$/, '');
    if (decoder.decode(take(6)) !== 'REGEMU' || u16() !== 1) throw Error('Unknown RegEmu format');
    const count = u32(), keys = new Map(); if (count > 1000) throw Error('Invalid registry key count');
    for (let i = 0; i < count; i++) {
      const name = string(), values = new Map(), valueCount = u32();
      if (valueCount > 10000 || keys.has(name)) throw Error('Invalid registry values');
      for (let j = 0; j < valueCount; j++) {
        const name = string(), type = u32(), data = take(u32());
        if (values.has(name)) throw Error('Duplicate registry value');
        values.set(name, { type, data });
      }
      keys.set(name, values);
    }
    if (offset !== bytes.length) throw Error('Unexpected registry trailer');
    return keys;
  }
  const intBytes = value => { const bytes = new Uint8Array(4); new DataView(bytes.buffer).setUint32(0, value, true); return bytes; };
  function writeRegistry(keys) {
    const parts = [], append = bytes => parts.push(bytes), u32 = value => append(intBytes(value));
    const string = value => { const bytes = encoder.encode(value + '\0'); u32(bytes.length); append(bytes); };
    append(encoder.encode('REGEMU')); append(new Uint8Array([1, 0])); u32(keys.size);
    for (const [name, values] of keys) {
      string(name); u32(values.size);
      for (const [name, value] of values) { string(name); u32(value.type); u32(value.data.length); append(value.data); }
    }
    const output = new Uint8Array(parts.reduce((sum, bytes) => sum + bytes.length, 0)); let offset = 0;
    for (const part of parts) { output.set(part, offset); offset += part.length; }
    return output;
  }
  function nativeRegistryKey(FS) {
    let partner = 'PopCap\\PlantsVsZombies';
    for (const path of ['/properties/partner.xml', '/Properties/partner.xml']) {
      try {
        const xml = decoder.decode(FS.readFile(path));
        const match = xml.match(/<String\b[^>]*\bid\s*=\s*["']RegistryKey["'][^>]*>([\s\S]*?)<\/String\s*>/i);
        if (match) { partner = match[1].trim().replace(/&amp;/g, '&'); break; }
      } catch (_) {}
    }
    return ('SOFTWARE\\' + partner).replace(/[\\/]+$/, '');
  }
  function markMigrationDone() { memoryMigrationDone = true; storageSet(MIGRATION, '1'); }
  async function prepareRegistryOnce(FS) {
    if (memoryMigrationDone || storageGet(MIGRATION) === '1') return { migrated: false, reason: 'already-checked' };
    let original;
    try { original = FS.readFile('/saves/registry.regemu'); }
    catch (error) {
      if (error?.errno === 44 || error?.errno === 2 || error?.code === 'ENOENT') { markMigrationDone(); return { migrated: false, reason: 'new-player' }; }
      return { migrated: false, reason: 'unavailable' };
    }
    let keys;
    try { keys = readRegistry(original); }
    catch (error) { console.warn('Audio migration kept unrecognized registry unchanged.', error); return { migrated: false, reason: 'unrecognized' }; }
    const wanted = nativeRegistryKey(FS).toLowerCase();
    const entry = [...keys].find(([name]) => name.toLowerCase() === wanted);
    const integer = value => value?.type === 4 && value.data.length === 4 ? new DataView(value.data.buffer, value.data.byteOffset, 4).getUint32(0, true) : null;
    const values = entry?.[1];
    if (!values || integer(values.get('MusicVolume')) !== 0 || integer(values.get('SfxVolume')) !== 0 || integer(values.get('Muted')) !== 1) {
      markMigrationDone(); return { migrated: false, reason: 'native-settings-preserved' };
    }
    // Only the exact three-field fingerprint written by the previous silent
    // shell is migrated, once. Native custom settings are otherwise untouched.
    for (const [name, value] of [['MusicVolume', 85], ['SfxVolume', 55], ['Muted', 0]]) values.set(name, { type: 4, data: intBytes(value) });
    FS.writeFile('/saves/registry.regemu', writeRegistry(keys));
    if (typeof FS.syncfs === 'function') {
      const error = await new Promise(resolve => FS.syncfs(false, resolve));
      if (error) { console.warn('Audio migration will retry after saves can persist.', error); return { migrated: true, persisted: false }; }
    }
    markMigrationDone();
    return { migrated: true, persisted: true };
  }
  function prepareRegistry(FS) {
    if (!registryPreparation) registryPreparation = prepareRegistryOnce(FS);
    return registryPreparation;
  }
  root.PVZAudio = Object.freeze({
    isMuted, setMuted, resume, prepareRegistry,
    subscribe(fn) {
      if (typeof fn !== 'function') throw TypeError('Audio subscriber must be a function');
      subscribers.add(fn); fn(isMuted()); return () => subscribers.delete(fn);
    },
  });
})();
