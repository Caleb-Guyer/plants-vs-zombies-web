// SPDX-License-Identifier: MIT
// Verify published production source/test coherence, then rerun all native
// content and QoL tests on the deployment runner. No game or audio device is initialized.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {inflateSync} from 'node:zlib';

const require = createRequire(import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const vendor = {exports: {}};
new Function('module', 'exports', 'require', fs.readFileSync(new URL('vendor/jszip.min.js', dist), 'utf8'))(vendor, vendor.exports, require);
const JSZip = vendor.exports;
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const engine = JSON.parse(fs.readFileSync(new URL('game/engine-provenance.json', dist)));
assert.equal(engine.id, '0.2.6-web-chill.5');
const current = await JSZip.loadAsync(fs.readFileSync(new URL(engine.artifacts.source, new URL('game/engine-provenance.json', dist))), {checkCRC32: true});
const parentSourceBytes = fs.readFileSync(new URL('source/pvz-portable-0.2.6-web-chill.4-source.zip', dist));
assert.equal(sha(parentSourceBytes), 'd8551acdc9f49704634b668d5abb2b461c3f1db683e19a228d0a9dd78785edae', 'Parent is the exact published Chill.4 source');
const parent = await JSZip.loadAsync(parentSourceBytes, {checkCRC32: true});
const prefix = 'chill5-candidate/';
const read = async name => {
  const entry = current.file(prefix + name);
  assert(entry, 'Missing current production source/test: ' + name);
  return Buffer.from(await entry.async('uint8array'));
};
const suites = ['game-speed', 'qol-controls', 'decks-cooldowns', 'bonus-challenge', 'bonus-completion', 'night-shift', 'lantern-shroom'];
const reports = new Map();
let checks = 0;
for (const name of suites) {
  const result = JSON.parse(await read('tests/' + name + '-results.json'));
  assert.match(result.status, /^PASS/);
  assert(result.checks > 0);
  assert.equal(result.failures, 0);
  assert.equal(result.exitCode, 0);
  assert.equal(sha(await read('tests/' + name + '-harness.cpp')), result.generatedHarnessSha256);
  assert(Object.keys(result.sourceSha256).length > 0);
  for (const [source, expected] of Object.entries(result.sourceSha256)) {
    assert.equal(sha(await read(source)), expected, 'Focused result must match current production source');
  }
  checks += result.checks;
  reports.set(name, result);
}
const parentBytes = async name => Buffer.from(await parent.file('chill4-candidate/source/' + name).async('uint8array'));
// SeedPacket.h also defines the serialized SeedBank class.
for (const name of ['src/Lawn/SeedPacket.h', 'src/Lawn/Plant.h', 'src/Lawn/Zombie.h', 'src/Lawn/Challenge.h', 'src/Lawn/System/SaveGame.cpp', 'src/Lawn/System/PlayerInfo.h', 'src/Lawn/System/PlayerInfo.cpp', 'src/LawnApp.h', 'src/Lawn/System/ReanimationLawn.h']) {
  assert.deepEqual(await read('source/' + name), await parentBytes(name), 'Saved data layout/serialization must remain unchanged');
}
function boardData(bytes) {
  const text = bytes.toString().replace(/\r\n?/g, '\n');
  const start = text.indexOf('class Board : public');
  const end = text.indexOf('Board(LawnApp*', start);
  assert(start >= 0 && end > start);
  return text.slice(start, end);
}
assert.equal(boardData(await read('source/src/Lawn/Board.h')), boardData(await parentBytes('src/Lawn/Board.h')),
  'Board saved data members stay unchanged; the existing KeyUp method may gain an implementation');
console.log(`PASS ${checks} published native content/QoL checks match their production source; saved object layouts and serializer are preserved.`);

// New IDs append to the catalog. Every original serialized mode and challenge
// definition retains its identity, artwork, placement and display name.
function enumValues(text, name) {
  const match = text.match(new RegExp('enum ' + name + ' : int32_t\\s*\\{([\\s\\S]*?)\\};'));
  assert(match, 'Missing enum: ' + name);
  let next = 0;
  const values = new Map();
  for (const item of match[1].replace(/\/\/[^\n]*/g, '').split(',')) {
    const part = item.trim();
    if (!part) continue;
    const field = part.match(/^(\w+)(?:\s*=\s*(-?\d+))?$/);
    assert(field, 'Unexpected enum expression: ' + part);
    if (field[2] !== undefined) next = Number(field[2]);
    values.set(field[1], next++);
  }
  return values;
}
const oldEnums = (await parentBytes('src/ConstEnums.h')).toString();
const newEnums = (await read('source/src/ConstEnums.h')).toString();
const oldModes = enumValues(oldEnums, 'GameMode'), newModes = enumValues(newEnums, 'GameMode');
assert.equal(oldModes.get('NUM_GAME_MODES'), 76);
assert.deepEqual([...newModes], [...oldModes], 'The visual revision preserves every game mode and mode count');
assert.deepEqual([...enumValues(newEnums, 'ChallengePage')], [...enumValues(oldEnums, 'ChallengePage')],
  'Cold Front uses the existing Bonus page without changing any page IDs');
const oldSeeds = enumValues(oldEnums, 'SeedType'), newSeeds = enumValues(newEnums, 'SeedType');
for (const [key, value] of oldSeeds) assert.equal(newSeeds.get(key), value, 'Every original and special seed ID stays stable: ' + key);
assert.deepEqual([...newSeeds], [...oldSeeds], 'The visual revision preserves every seed ID and sentinel');
assert.equal(newSeeds.get('SEED_LANTERNSHROOM'), 75);
assert.equal(newSeeds.get('NUM_SEED_TYPES'), 53, 'Original plant cache capacity stays unchanged');
assert.equal(newSeeds.get('NUM_SEEDS_IN_CHOOSER'), 49, 'Original chooser and unlock inventory stays unchanged');
function plantDefinitions(text) {
  const table = text.slice(text.indexOf('gPlantDefs['));
  const end = table.indexOf('};');
  assert(end > 0);
  return [...table.slice(0, end).matchAll(/\{\s*\.mSeedType\s*=[^}]+\}/g)].map(match => match[0].replace(/\s+/g, ' ').trim());
}
const oldPlants = plantDefinitions((await parentBytes('src/Lawn/Plant.cpp')).toString());
const newPlants = plantDefinitions((await read('source/src/Lawn/Plant.cpp')).toString());
assert.equal(oldPlants.length, 53);
assert.deepEqual(newPlants, oldPlants, 'Every original plant definition remains unchanged; Chill-shroom uses its separate definition');
function definitions(text) {
  const table = text.slice(text.indexOf('gChallengeDefs['));
  const end = table.indexOf('};');
  assert(end > 0);
  return [...table.slice(0, end).matchAll(/\{\s*\.mChallengeMode\s*=[^}]+\}/g)].map(match => match[0].replace(/\s+/g, ' ').trim());
}
const oldDefinitions = definitions((await parentBytes('src/Lawn/Widget/ChallengeScreen.cpp')).toString());
const newDefinitions = definitions((await read('source/src/Lawn/Widget/ChallengeScreen.cpp')).toString());
assert.equal(oldDefinitions.length, 75);
assert.deepEqual(newDefinitions, oldDefinitions, 'Every original and custom challenge definition stays unchanged');
assert(newDefinitions.at(-1).includes('GAMEMODE_CHALLENGE_LANTERN_GLOW'));
assert(newDefinitions.at(-1).includes('CHALLENGE_PAGE_BONUS'));
assert(newDefinitions.at(-1).includes('.mChallengeIconIndex = 1'));
assert(newDefinitions.at(-1).includes('.mRow = 1, .mCol = 2'));
assert(newDefinitions.at(-1).includes('.mChallengeName = "Cold Front"'));
console.log('PASS Chill-shroom preserves all mode/seed IDs, saved layouts, 53 original plant definitions and all challenge identities and titles.');

const artRecord = JSON.parse(fs.readFileSync(new URL('content/native-bonus-art.json', dist)));
assert.match(artRecord.sourceKind, /native sprite compositions/);
assert.equal(artRecord.generatedArtworkUsed, true, 'Generated artwork is scoped to the permitted plant sprite');
assert.equal(artRecord.standaloneChallengeIllustrations, false, 'Cards contain actual sprites, not separately generated illustrations');
assert.equal(artRecord.assetBundleId, engine.assetBundleId);
assert.equal(artRecord.plant.nativeReanimation, 'REANIM_ICESHROOM');
assert.equal(artRecord.plant.spriteOverride, 'chill-shroom/provenance.json');
assert.deepEqual(artRecord.canvas, {width: 80, height: 65, heroCenterX: 40, heroCenterY: 32.5, maxHeroWidth: 68, maxHeroHeight: 57});
assert.deepEqual(artRecord.cards.map(card => card.mode), [73, 74, 75]);
assert.deepEqual(artRecord.cards.map(card => card.name), ['Cone Zone', 'Night Shift', 'Cold Front']);
const renderer = (await read('source/src/Lawn/System/LanternShroom.cpp')).toString();
assert(!/FrostShroomCap|BonusChallengeArt|DecodeBase64|png_image_|DecodeImage/.test(renderer), 'Current rendering cannot load the rejected generated artwork');
assert(renderer.includes('#include "ChillShroomArt.h"') && renderer.includes('BindParts(native)'),
  'Cold Front portraits render the same custom parts as the live plant');
for (const header of ['FrostShroomCap.h', 'BonusChallengeArt.h']) {
  assert.equal(current.file(prefix + 'source/src/Lawn/System/' + header), null, 'Generated artwork headers are absent from current source');
}
for (const name of ['chill-shroom-cap', 'cone-zone-card', 'night-shift-card', 'cold-front-card', 'lantern-shroom', 'lantern-shroom-cap']) {
  for (const suffix of ['.png', '.svg', '-art.json']) assert(!fs.existsSync(new URL('content/' + name + suffix, dist)), 'Rejected generated-art aliases stay absent: ' + name + suffix);
}

// Decode the actual exported PNGs independently of Pillow and the C++ artwork
// generator. PNG stores unassociated RGBA; the runtime header stores straight ARGB.
function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
  }
  return (value ^ 0xffffffff) >>> 0;
}
function decodeRgbaPng(bytes, allowRgb = false, maxDimension = 256) {
  assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  let offset = 8, width, height, channels = 4, ended = false;
  const compressed = [];
  while (offset < bytes.length) {
    assert(offset + 12 <= bytes.length, 'Complete PNG chunk header');
    const length = bytes.readUInt32BE(offset), end = offset + 12 + length;
    assert(end <= bytes.length, 'Complete PNG chunk payload');
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, end - 4);
    assert.equal(crc32(bytes.subarray(offset + 4, end - 4)), bytes.readUInt32BE(end - 4), 'PNG chunk CRC: ' + type);
    if (type === 'IHDR') {
      assert.equal(offset, 8, 'IHDR is the first and only header');
      assert.equal(length, 13);
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      assert(width > 0 && height > 0 && width <= maxDimension && height <= maxDimension);
      assert.equal(data[8], 8, 'Eight-bit PNG');
      assert(data[9] === 6 || (allowRgb && data[9] === 2), 'RGBA output or RGB/RGBA atlas PNG');
      assert.deepEqual([...data.subarray(10)], [0, 0, 0], 'Noninterlaced PNG');
      channels = data[9] === 2 ? 3 : 4;
    } else if (type === 'IDAT') {
      assert(width && height && !ended);
      compressed.push(data);
    } else if (type === 'IEND') {
      assert.equal(length, 0);
      assert(compressed.length > 0);
      assert.equal(end, bytes.length, 'No bytes follow the PNG end marker');
      ended = true;
    } else {
      assert(type.charCodeAt(0) & 32, 'No unknown critical PNG chunks');
    }
    offset = end;
  }
  assert(ended, 'PNG has an end marker');
  const stride = width * channels;
  const scanlines = inflateSync(Buffer.concat(compressed), {maxOutputLength: height * (stride + 1)});
  assert.equal(scanlines.length, height * (stride + 1));
  const samples = Buffer.alloc(width * height * channels);
  const paeth = (left, up, upperLeft) => {
    const prediction = left + up - upperLeft;
    const a = Math.abs(prediction - left), b = Math.abs(prediction - up), c = Math.abs(prediction - upperLeft);
    return a <= b && a <= c ? left : b <= c ? up : upperLeft;
  };
  for (let y = 0; y < height; y++) {
    const source = y * (stride + 1), target = y * stride, filter = scanlines[source];
    assert(filter <= 4, 'Supported PNG row filter');
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? samples[target + x - channels] : 0;
      const up = y ? samples[target + x - stride] : 0;
      const upperLeft = y && x >= channels ? samples[target + x - stride - channels] : 0;
      const prediction = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? up :
        filter === 3 ? Math.floor((left + up) / 2) : paeth(left, up, upperLeft);
      samples[target + x] = (scanlines[source + 1 + x] + prediction) & 255;
    }
  }
  if (channels === 4) return {width, height, rgba: samples};
  const rgba = Buffer.alloc(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel++) {
    samples.copy(rgba, pixel * 4, pixel * 3, pixel * 3 + 3);
    rgba[pixel * 4 + 3] = 255;
  }
  return {width, height, rgba};
}

const artworkUrl = new URL('content/chill-shroom/', dist);
const artwork = JSON.parse(fs.readFileSync(new URL('provenance.json', artworkUrl)));
assert.equal(artwork.schema, 2);
assert.equal(artwork.version, engine.id);
assert.equal(artwork.method, 'Approved whole-character master with registered shared-canvas layers');
assert.equal(artwork.imageGenerationUsed, true);
assert.equal(artwork.standaloneChallengeIllustrations, false);
const headerBytes = await read('source/src/Lawn/System/ChillShroomArt.h');
const header = headerBytes.toString();
const extractionBytes = await read('source/artwork/chill-shroom/extraction.json');
const extraction = JSON.parse(extractionBytes);
const generationBytes = await read('source/artwork/chill-shroom/generation.json');
const generation = JSON.parse(generationBytes);
const generator = await read('source/artwork/chill-shroom/render.py');

// The neutral reference is independently derived from the user-approved master,
// not from render.py or a hash supplied by its generated provenance. With Pillow
// 12.2.0: clear source alpha <=8, crop [81,134,1232,1119], uniformly contain in
// 72x62, Lanczos resize to the one rounded size, then composite at (6,10) on an
// empty 80x80 canvas. This pin keeps the approved silhouette, proportions,
// cap/body overlap and ground registration fixed without adding Pillow to CI.
const approvedMasterSha = 'f861148f8c57bbee31595e8fd5692aa23c1282172ab0016a159adf406f2a373d';
const closedMasterSha = 'dd28dbc58d7e8f27bf05ed2dd1842b397de829d6c9b5ed5790e2465058e358e7';
const expectedCanonicalRgbaSha = 'c00b7d93e79d2fb8f39ea2dbddd178e02d040ac1f4fd2e8bb62f105502317fb7';
async function sourcePngBase64(name) {
  const encodedBytes = await read('source/artwork/chill-shroom/' + name);
  const encoded = encodedBytes.toString().replace(/\s+/g, '');
  assert.match(encoded, /^[A-Za-z0-9+/]+={0,2}$/);
  const bytes = Buffer.from(encoded, 'base64');
  assert.equal(bytes.toString('base64'), encoded, 'Canonical complete source Base64: ' + name);
  return {bytes, image: decodeRgbaPng(bytes, true, 4096)};
}
const master = await sourcePngBase64('approved-master.png.base64.txt');
const closedMaster = await sourcePngBase64('closed-master.png.base64.txt');
assert.equal(sha(master.bytes), approvedMasterSha, 'The source is the exact whole character approved by the user');
assert.equal(sha(closedMaster.bytes), closedMasterSha, 'The bounded eye edit has an immutable source');
assert.deepEqual([master.image.width, master.image.height], [1285, 1224]);
assert.equal(artwork.approvedMasterSha256, approvedMasterSha);
assert.equal(artwork.closedMasterSha256, closedMasterSha);
assert.equal(artwork.canonicalRgbaSha256, expectedCanonicalRgbaSha);
assert.equal(sha(headerBytes), artwork.headerSha256);
assert.equal(sha(extractionBytes), artwork.extractionSha256);
assert.equal(sha(generationBytes), artwork.generationSha256);
assert.equal(sha(generator), artwork.generatorSha256);
assert.equal(generation.schema, 1);
assert.equal(generation.tool, 'built-in image_gen.imagegen');
assert.equal(generation.scope, 'custom plant only; no standalone challenge illustrations');
assert.equal(generation.geometryLocked, true);
if ('standaloneChallengeIllustrations' in generation) assert.equal(generation.standaloneChallengeIllustrations, false);
assert.equal(generation.approvedMasterSha256, approvedMasterSha);
assert.equal(generation.masterSource, 'approved-master.png.base64.txt');
assert.equal(generation.closedSource, 'closed-master.png.base64.txt');
for (const key of ['masterPrompt', 'closedEyePrompt']) {
  assert(typeof generation[key] === 'string' && generation[key].length > 100, 'Actual plant generation/edit prompt: ' + key);
}
assert.equal(extraction.schema, 2);
assert.deepEqual(extraction.canonical, {
  canvas: [80, 80], sourceBounds: [81, 134, 1232, 1119], fit: [72, 62], origin: [6, 10],
  groundAnchor: [40, 72], alphaThreshold: 8, filter: 'Pillow Lanczos',
}, 'One approved whole-character transform fixes all layer registration');
assert.equal(extraction.parts, undefined, 'There is no independent per-part crop/fitting recipe');
const eyeRegions = [[26, 50, 36, 62], [37, 50, 47, 62]];
assert.deepEqual(extraction.eyeRegions, eyeRegions, 'Expressions may modify only the two fixed eye regions');
assert.equal(extraction.eyeFeatherPixels, 1);
assert.equal(extraction.halfExpressionBlend, 0.5);
assert.deepEqual(fs.readFileSync(new URL('extraction.json', artworkUrl)), extractionBytes, 'Public extraction instructions match source');
assert.deepEqual(fs.readFileSync(new URL('generation.json', artworkUrl)), generationBytes, 'Public generation/edit records match source');

const sourceManifest = JSON.parse(await read('source-manifest.json'));
assert.equal(sourceManifest.version, engine.id);
for (const name of ['src/Lawn/System/ChillShroomArt.h', 'artwork/chill-shroom/extraction.json', 'artwork/chill-shroom/generation.json', 'artwork/chill-shroom/render.py', 'artwork/chill-shroom/approved-master.png.base64.txt', 'artwork/chill-shroom/closed-master.png.base64.txt']) {
  const bytes = await read('source/' + name), pin = sourceManifest.files[name];
  assert(pin, 'Approved master/edit/extraction input is included in the source manifest: ' + name);
  assert.equal(pin.bytes, bytes.length);
  assert.equal(pin.sha256, sha(bytes));
}
for (const obsolete of ['recipe.json', 'design.py', 'sprite-atlas.png.base64.txt']) {
  assert.equal(current.file(prefix + 'source/artwork/chill-shroom/' + obsolete), null, 'Superseded separately fitted artwork source is absent');
}

const canonicalPng = fs.readFileSync(new URL('canonical.png', artworkUrl));
assert.equal(sha(canonicalPng), artwork.canonicalPngSha256, 'Canonical PNG byte identity');
const canonical = decodeRgbaPng(canonicalPng);
assert.deepEqual([canonical.width, canonical.height], [80, 80]);
assert.equal(sha(canonical.rgba), expectedCanonicalRgbaSha, 'Canonical pixels match the independent approved-master resample');

const names = ['cap', 'body', 'base', 'blink1', 'blink2'];
assert.deepEqual(Object.keys(artwork.parts).sort(), [...names].sort());
const decodedParts = new Map();
for (const name of names) {
  const pin = artwork.parts[name], symbol = name[0].toUpperCase() + name.slice(1);
  assert.equal(pin.width, 80); assert.equal(pin.height, 80, 'All runtime parts use the same registered canvas');
  const png = fs.readFileSync(new URL(name + '.png', artworkUrl));
  assert.equal(sha(png), pin.pngSha256, 'Published PNG pin: ' + name);
  const decoded = decodeRgbaPng(png);
  assert.deepEqual([decoded.width, decoded.height], [80, 80]);
  assert.equal(sha(decoded.rgba), pin.rgbaSha256, 'Decoded pixel pin: ' + name);
  assert.equal(Number(header.match(new RegExp('k' + symbol + 'Width\\s*=\\s*(\\d+)'))?.[1]), 80);
  assert.equal(Number(header.match(new RegExp('k' + symbol + 'Height\\s*=\\s*(\\d+)'))?.[1]), 80);
  const array = header.match(new RegExp('k' + symbol + 'Argb\\[\\]\\s*=\\s*\\{([\\s\\S]*?)\\};'));
  assert(array, 'Packed runtime pixels: ' + name);
  const pixels = [...array[1].matchAll(/0x([0-9a-fA-F]{8})u/g)].map(match => Number.parseInt(match[1], 16));
  assert.equal(pixels.length, 80 * 80);
  const rgba = Buffer.alloc(80 * 80 * 4);
  pixels.forEach((pixel, index) => {
    rgba[index * 4] = (pixel >>> 16) & 255;
    rgba[index * 4 + 1] = (pixel >>> 8) & 255;
    rgba[index * 4 + 2] = pixel & 255;
    rgba[index * 4 + 3] = pixel >>> 24;
  });
  assert.deepEqual(decoded.rgba, rgba, 'Public PNG and embedded runtime artwork are pixel-identical: ' + name);
  for (let offset = 0; offset < rgba.length; offset += 4) {
    if (rgba[offset + 3] === 0) assert.equal(rgba.readUInt32BE(offset), 0, 'Transparent registered pixels have no hidden RGB: ' + name);
  }
  decodedParts.set(name, decoded);
}
function visibleBounds(image) {
  let left = image.width, top = image.height, right = -1, bottom = -1;
  for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) if (image.rgba[(y * image.width + x) * 4 + 3] > 8) {
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  assert(right >= left && bottom >= top);
  return [left, top, right + 1, bottom + 1];
}
assert.deepEqual(visibleBounds(master.image), [81, 134, 1232, 1119], 'Approved source alpha bounds are not independently re-fitted');
assert.deepEqual(visibleBounds(canonical), [6, 10, 78, 72], 'The single scale and placement retain the approved ground registration');
assert(decodedParts.get('base').rgba.every(value => value === 0), 'No separate feet/base can alter the approved silhouette');
const cap = decodedParts.get('cap').rgba, body = decodedParts.get('body').rgba;
const half = decodedParts.get('blink1').rgba, closed = decodedParts.get('blink2').rgba;
const reconstructed = Buffer.alloc(canonical.rgba.length);
let capPixels = 0, bodyPixels = 0;
for (let offset = 0; offset < reconstructed.length; offset += 4) {
  const capAlpha = cap[offset + 3], bodyAlpha = body[offset + 3];
  assert(!(capAlpha && bodyAlpha), 'Registered neutral layers partition whole pixels without overlapping alpha');
  if (capAlpha) {cap.copy(reconstructed, offset, offset, offset + 4); capPixels++;}
  else if (bodyAlpha) {body.copy(reconstructed, offset, offset, offset + 4); bodyPixels++;}
}
assert(capPixels > 0 && bodyPixels > 0, 'Both actual cap and body layers contain registered visible art');
assert.deepEqual(reconstructed, canonical.rgba, 'Neutral cap/body union exactly reconstructs the approved whole character');
assert.equal(sha(reconstructed), expectedCanonicalRgbaSha, 'Layer registration cannot silently change master proportions');
assert(!body.equals(half) && !body.equals(closed) && !half.equals(closed), 'Open, half and closed expressions differ');
const changedPerEye = eyeRegions.map(() => 0);
for (let y = 0; y < 80; y++) for (let x = 0; x < 80; x++) {
  const offset = (y * 80 + x) * 4;
  assert.equal(half[offset + 3], body[offset + 3], 'Half expression retains approved alpha');
  assert.equal(closed[offset + 3], body[offset + 3], 'Closed expression retains approved alpha');
  const eyeIndex = eyeRegions.findIndex(([left, top, right, bottom]) => x >= left && x < right && y >= top && y < bottom);
  const differs = !body.subarray(offset, offset + 4).equals(half.subarray(offset, offset + 4)) ||
    !body.subarray(offset, offset + 4).equals(closed.subarray(offset, offset + 4));
  if (eyeIndex < 0) assert(!differs, 'Expressions retain exact approved pixels outside the fixed eye regions');
  else if (differs) changedPerEye[eyeIndex]++;
}
for (const changed of changedPerEye) assert(changed > 5, 'Both eyes have an actual expression change');
console.log('PASS approved-master SHA/registration, independent PNG/runtime pixels, exact neutral whole-character reconstruction, fixed-alpha eye-only expressions and native cards without standalone generated illustrations.');


if (process.argv.includes('--run-native')) {
  const temporaryRoot = fs.realpathSync(os.tmpdir());
  const temporary = fs.mkdtempSync(path.join(temporaryRoot, 'pvz-native-content-'));
  try {
    for (const entry of Object.values(current.files)) {
      if (entry.dir || !entry.name.startsWith(prefix)) continue;
      const name = entry.name.slice(prefix.length);
      if (!name.startsWith('source/') && !name.startsWith('tests/')) continue;
      assert(!name.includes('\\') && !name.split('/').some(part => !part || part === '.' || part === '..' || part.includes(':')));
      const target = path.resolve(temporary, name);
      assert(target.startsWith(temporary + path.sep));
      fs.mkdirSync(path.dirname(target), {recursive: true});
      fs.writeFileSync(target, await entry.async('uint8array'));
    }
    for (const name of suites) {
      const run = spawnSync('python', [path.join(temporary, 'tests/test-' + name + '.py'), '--native'], {encoding: 'utf8'});
      assert.equal(run.status, 0, (run.error?.message || '') + run.stdout + run.stderr);
      const actual = JSON.parse(fs.readFileSync(path.join(temporary, 'tests/' + name + '-results.json')));
      assert.equal(actual.checks, reports.get(name).checks);
      assert.equal(actual.failures, 0);
    }
    console.log(`PASS all ${checks} production-method content and QoL tests on the native CI compiler.`);
  } finally {
    const resolved = fs.realpathSync(temporary);
    assert.equal(path.dirname(resolved), temporaryRoot);
    assert(path.basename(resolved).startsWith('pvz-native-content-'));
    fs.rmSync(resolved, {recursive: true});
  }
}
