// SPDX-License-Identifier: MIT
// Original browser-side compatibility adapter for the documented PvZ-Portable
// 0.2.6 property-key conventions. No game text or artwork is included here.

/**
 * Derive an optional properties/pvz-portable.xml from a player's own main.pak.
 * Call before Module.callMain(), after writing the selected resource files.
 * Do not replace a user-supplied pvz-portable.xml without their intent.
 *
 * @param {ArrayBuffer|ArrayBufferView} pakData The selected main.pak bytes.
 * @returns {string|null} XML text, or null for packs with no newer string keys.
 * @throws {Error} For malformed/unsupported archives or inconsistent strings.
 */
function buildSteamCompatibilityXml(pakData) {
  const bytes = pakData instanceof ArrayBuffer
    ? new Uint8Array(pakData)
    : ArrayBuffer.isView(pakData)
      ? new Uint8Array(pakData.buffer, pakData.byteOffset, pakData.byteLength)
      : null;
  if (!bytes) throw new TypeError('Expected main.pak as an ArrayBuffer or typed array.');

  // The PAK index is a little-endian directory followed by contiguous payloads.
  // XOR is part of the resource file format; no executable or account is read.
  let cursor = 0;
  const take = () => {
    if (cursor >= bytes.length) throw new Error('main.pak has a truncated directory.');
    return bytes[cursor++] ^ 0xf7;
  };
  const uint32 = () => (take() | take() << 8 | take() << 16 | take() << 24) >>> 0;
  if (uint32() !== 0xbac04ac0) throw new Error('The selected file is not a supported main.pak.');
  if (uint32() !== 0) throw new Error('This main.pak version is not supported.');

  let payloadOffset = 0, stringsOffset = -1, stringsLength = 0;
  for (;;) {
    if (take() & 0x80) break;
    const nameBytes = new Uint8Array(take());
    for (let i = 0; i < nameBytes.length; i++) nameBytes[i] = take();
    const path = new TextDecoder().decode(nameBytes).replaceAll('\\', '/').toLowerCase();
    const size = uint32();
    for (let i = 0; i < 8; i++) take(); // Resource timestamp.
    if (path === 'properties/lawnstrings.txt') {
      stringsOffset = payloadOffset;
      stringsLength = size;
    }
    payloadOffset += size;
    if (!Number.isSafeInteger(payloadOffset)) throw new Error('Invalid resource offsets in main.pak.');
  }
  if (stringsOffset < 0) throw new Error('main.pak is missing its LawnStrings resource.');
  const start = cursor + stringsOffset;
  if (start > bytes.length || stringsLength > bytes.length - start) {
    throw new Error('The LawnStrings resource in main.pak is truncated.');
  }
  const textBytes = new Uint8Array(stringsLength);
  for (let i = 0; i < stringsLength; i++) textBytes[i] = bytes[start + i] ^ 0xf7;

  let text;
  if (textBytes[0] === 0xff && textBytes[1] === 0xfe) text = new TextDecoder('utf-16le').decode(textBytes);
  else if (textBytes[0] === 0xfe && textBytes[1] === 0xff) text = new TextDecoder('utf-16be').decode(textBytes);
  else {
    try { text = new TextDecoder('utf-8', {fatal: true}).decode(textBytes); }
    catch { text = new TextDecoder('windows-1252').decode(textBytes); }
  }
  const fields = new Map();
  const sections = [...text.matchAll(/\[([^\]]+)\]/g)];
  for (let i = 0; i < sections.length; i++) {
    const tag = sections[i];
    fields.set(tag[1].trim().toUpperCase(), text.slice(tag.index + tag[0].length, sections[i + 1]?.index ?? text.length).trim().replaceAll('\r', ''));
  }

  const headerKeys = [...fields.keys()].filter(key => key.endsWith('_DESCRIPTION_HEADER')).sort();
  if (!fields.has('RESTART_LEVEL_BUTTON') && !fields.has('NOT_ENCOUNTERED_YET_DESCRIPTION') && !headerKeys.length) return null;
  for (const key of ['RESTART_LEVEL_BUTTON', 'NOT_ENCOUNTERED_YET_DESCRIPTION', 'CRAZY_DAVE_1700']) {
    if (!fields.has(key)) throw new Error(`The resource pack is missing compatibility key ${key}.`);
  }
  let sellTemplate = fields.get('CRAZY_DAVE_1700');
  if (!sellTemplate.includes('{SELL_PRICE}')) throw new Error('The resource pack has an unsupported sell-price template.');
  if (!sellTemplate.includes('{SELL_PRICE}0')) sellTemplate = sellTemplate.replace('{SELL_PRICE}', '{SELL_PRICE}0');

  const overrides = new Map([
    ['RESTART_LEVEL', fields.get('RESTART_LEVEL_BUTTON')],
    ['NOT_ENCOUNTERED_YET', fields.get('NOT_ENCOUNTERED_YET_DESCRIPTION')],
    ['CRAZY_DAVE_1700', sellTemplate],
  ]);
  for (const headerKey of headerKeys) {
    const key = headerKey.slice(0, -7);
    if (!fields.has(key)) throw new Error(`The resource pack has no description corresponding to ${headerKey}.`);
    const body = fields.get(key);
    overrides.set(key, key === 'ZOMBONI_DESCRIPTION' ? body.replaceAll('{SHORTLINE}\n', '') : fields.get(headerKey) + '\n' + body);
  }

  // PopCap Properties XML adds &cr; and &nbsp; to standard XML entities.
  const encode = value => value
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&apos;').replaceAll('\n', '&cr;')
    .replace(/ {2,}/g, spaces => ' ' + '&nbsp;'.repeat(spaces.length - 1));
  return '<Properties>\n' + [...overrides].map(([key, value]) => `    <String id="${key}">${encode(value)}</String>`).join('\n') + '\n</Properties>\n';
}
