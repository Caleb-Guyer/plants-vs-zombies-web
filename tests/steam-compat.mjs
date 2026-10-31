import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const adapter = await readFile(new URL('../dist/steam-compat.js', import.meta.url),'utf8');
const buildSteamCompatibilityXml = new Function(adapter + ';return buildSteamCompatibilityXml;')();

function pack(text, utf16 = false) {
  const name = Buffer.from('properties\\LawnStrings.txt');
  const payload = utf16 ? Buffer.concat([Buffer.from([0xff,0xfe]), Buffer.from(text,'utf16le')]) : Buffer.from(text);
  const header = Buffer.alloc(8); header.writeUInt32LE(0xbac04ac0);
  const record = Buffer.alloc(2 + name.length + 12);
  record[1] = name.length; name.copy(record,2); record.writeUInt32LE(payload.length,2+name.length);
  return Buffer.from(Buffer.concat([header,record,Buffer.from([0x80]),payload]).map(value => value ^ 0xf7));
}
const sample = '[RESTART_LEVEL_BUTTON]\nResume & Try <Again>\n[NOT_ENCOUNTERED_YET_DESCRIPTION]\nUnknown\n[CRAZY_DAVE_1700]\n{SELL_PRICE}\n[PEA_DESCRIPTION_HEADER]\nIntro  header\n[PEA_DESCRIPTION]\nBody\n[ZOMBONI_DESCRIPTION_HEADER]\nIgnored\n[ZOMBONI_DESCRIPTION]\nFirst{SHORTLINE}\nLast\n';
const xml = buildSteamCompatibilityXml(pack(sample));
const offsetPack = Buffer.concat([Buffer.alloc(11),pack(sample),Buffer.alloc(7)]);
assert.equal(buildSteamCompatibilityXml(offsetPack.subarray(11,-7)),xml);
assert.equal(buildSteamCompatibilityXml(Uint8Array.from(pack(sample)).buffer),xml);
assert.match(xml, /Resume &amp; Try &lt;Again&gt;/);
assert.match(xml, /Intro &nbsp;header&cr;Body/);
assert.match(xml, /\{SELL_PRICE\}0/);
assert.match(xml, /id="ZOMBONI_DESCRIPTION">FirstLast/);
assert.equal(buildSteamCompatibilityXml(pack(sample,true)),xml);
assert.equal(buildSteamCompatibilityXml(pack('[RESTART_LEVEL]\nOld format\n')),null);
assert.throws(()=>buildSteamCompatibilityXml(new Uint8Array(20)),/supported main.pak/);
assert.throws(()=>buildSteamCompatibilityXml(pack(sample).subarray(0,20)),/truncated/);


console.log('PASS local Steam adapter: synthetic PAK encodings, mappings, offsets, escaping and malformed archive handling.');
