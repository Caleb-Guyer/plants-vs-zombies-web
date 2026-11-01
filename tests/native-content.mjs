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
assert.equal(engine.id, '0.2.6-web-mender.1');
const current = await JSZip.loadAsync(fs.readFileSync(new URL(engine.artifacts.source, new URL('game/engine-provenance.json', dist))), {checkCRC32: true});
const parentSourceBytes = fs.readFileSync(new URL('source/pvz-portable-0.2.6-web-seedswap.1-source.zip', dist));
assert.equal(sha(parentSourceBytes), '0db62a66059ebc4891181044609fa949d2c623b0a05181930c2734a0f7aeeb18', 'Parent is the exact published SeedSwap.1 source');
const parent = await JSZip.loadAsync(parentSourceBytes, {checkCRC32: true});
const prefix = 'mender1-candidate/';
const read = async name => {
  const entry = current.file(prefix + name);
  assert(entry, 'Missing current production source/test: ' + name);
  return Buffer.from(await entry.async('uint8array'));
};
const suites = ['game-speed', 'qol-controls', 'decks-cooldowns', 'bonus-challenge', 'bonus-completion', 'night-shift', 'lantern-shroom', 'garden-shuffle', 'seed-swap', 'mender-bloom'];
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
const parentBytes = async name => Buffer.from(await parent.file('seedswap1-candidate/source/' + name).async('uint8array'));
// SeedPacket.h also defines the serialized SeedBank class.
for (const name of ['src/Lawn/SeedPacket.h', 'src/Lawn/Plant.h', 'src/Lawn/Challenge.h', 'src/Lawn/System/SaveGame.cpp', 'src/Lawn/System/PlayerInfo.h', 'src/Lawn/System/PlayerInfo.cpp', 'src/LawnApp.h', 'src/Lawn/System/ReanimationLawn.h']) {
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
assert.equal(oldModes.get('NUM_GAME_MODES'), 78);
assert.deepEqual([...newModes], [...oldModes], 'Mender adds no game mode or changes any original/custom mode ID');
assert.deepEqual([...enumValues(newEnums, 'ChallengePage')], [...enumValues(oldEnums, 'ChallengePage')],
  'Cold Front uses the existing Bonus page without changing any page IDs');
const oldSeeds = enumValues(oldEnums, 'SeedType'), newSeeds = enumValues(newEnums, 'SeedType');
for (const [key, value] of oldSeeds) assert.equal(newSeeds.get(key), value, 'Every original and special seed ID stays stable: ' + key);
assert.equal(newSeeds.get('SEED_MENDERBLOOM'), 76);
assert.equal(newSeeds.size, oldSeeds.size + 1, 'Exactly one external custom plant ID is appended');
assert.equal(newSeeds.get('SEED_LANTERNSHROOM'), 75);
assert.equal(newSeeds.get('NUM_SEED_TYPES'), 53, 'Original plant cache capacity stays unchanged');
assert.equal(newSeeds.get('NUM_SEEDS_IN_CHOOSER'), 49, 'Original serialized chooser capacity stays unchanged; the custom entry uses a sparse UI mapping');
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
assert.equal(oldDefinitions.length, 77);
assert.deepEqual(newDefinitions, oldDefinitions, 'Mender preserves every original and five Bonus challenge definition');
console.log('PASS Chill-shroom preserves all mode/seed IDs, saved layouts, 53 original plant definitions and all challenge identities and titles.');

const artRecord = JSON.parse(fs.readFileSync(new URL('content/native-bonus-art.json', dist)));
assert.match(artRecord.sourceKind, /native sprite compositions/);
assert.equal(artRecord.generatedArtworkUsed, true, 'Generated artwork is scoped to the permitted plant sprite');
assert.equal(artRecord.standaloneChallengeIllustrations, false, 'Cards contain actual sprites, not separately generated illustrations');
assert.equal(artRecord.assetBundleId, engine.assetBundleId);
assert.equal(artRecord.plant.nativeReanimation, 'REANIM_ICESHROOM');
assert.equal(artRecord.plant.spriteOverride, 'chill-shroom/provenance.json');
assert.deepEqual(artRecord.canvas, {width: 80, height: 65, heroCenterX: 40, heroCenterY: 32.5, maxHeroWidth: 68, maxHeroHeight: 57});
assert.deepEqual(artRecord.cards.map(card => card.mode), [73, 74, 75, 76, 77]);
assert.deepEqual(artRecord.cards.map(card => card.name), ['Cone Zone', 'Night Shift', 'Cold Front', 'Garden Shuffle', 'Seed Swap']);
assert.equal(artRecord.animation.newGeneratedArtwork, false, 'Motion uses existing sprite/effect assets');
assert.equal(artRecord.animation.idlePeriodSeconds, 2.4);
assert.deepEqual(artRecord.animation.idleScaleX, [1, 1.012]);
assert.deepEqual(artRecord.animation.idleScaleY, [0.98, 1]);
assert.deepEqual(artRecord.animation.idleCapCompressionPixels, [0, 0.8]);
for (const [name, expected] of Object.entries({windupTicks: 40, recoilTicks: 30, frostEffectTicks: 100,
  frostTravelTicks: 55, targetRadiusPixels: 150})) assert.equal(artRecord.animation[name], expected);
assert.deepEqual(artRecord.animation.nativeFrostAssets, [
  {resource: 'IMAGE_SNOWPEA_PUFF', originalPath: 'particles/SnowPea_puff.png', sha256: '26e4fd3e388ddc1dfe5a1f7eddfdfc1fbd98850fc50716b57c7ceffce306d308'},
  {resource: 'IMAGE_SNOWFLAKES', originalPath: 'particles/SnowFlakes.png', sha256: '864e8dddb14dd8fcff235d22f5c0d5a9c925aa5cf856f5c855b9a8dbe23a1f03'},
], 'Frost provenance identifies the exact already-bundled original images');
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
assert.equal(artwork.method, 'Approved silhouette with a painted finish and registered shared-canvas layers');
assert.equal(artwork.imageGenerationUsed, true);
assert.equal(artwork.standaloneChallengeIllustrations, false);
const headerBytes = await read('source/src/Lawn/System/ChillShroomArt.h');
const header = headerBytes.toString();
const extractionBytes = await read('source/artwork/chill-shroom/extraction.json');
const extraction = JSON.parse(extractionBytes);
const generationBytes = await read('source/artwork/chill-shroom/generation.json');
const generation = JSON.parse(generationBytes);
const generator = await read('source/artwork/chill-shroom/render.py');

// Independently derived from the user-approved master using Pillow 12.2.0:
// clear alpha <=8, crop [81,134,1232,1119], contain in 72x62, uniformly Lanczos
// resize, then composite at (6,10) on 80x80. Paint may change; this alpha pin and
// the exact pinned parent's cap/body masks keep shape and articulation fixed.
const approvedMasterSha = 'f861148f8c57bbee31595e8fd5692aa23c1282172ab0016a159adf406f2a373d';
const closedMasterSha = 'dd28dbc58d7e8f27bf05ed2dd1842b397de829d6c9b5ed5790e2465058e358e7';
const expectedCanonicalAlphaSha = '0b1b28aa8d5489fe16a29e90c42fd1fb478bfca59a8544c9496306d825383e8e';
const expectedApprovedRgbaSha = 'c00b7d93e79d2fb8f39ea2dbddd178e02d040ac1f4fd2e8bb62f105502317fb7';
const expectedParentRgbaSha = '4aed41439898a5f777b5ccefeb97c87a96bdd81f6b3b1ece0ac7541339378eae';
const expectedParentAlphaSha = {
  cap: 'f1192c2237b44d213838d4bb2d0fc0341281f35331c5b38a029ddf73d2380dfb',
  body: '500cd27bdd00b855b9da91af9964be82eb6a74d2ccba83406aa1d5433a3ae410',
  base: '56a43ef88ddfcd0f56f7dd973312c0e73d62f59655c01d7b4e59aaa3be8b3fb6',
};
const expectedCanonicalRgbaSha = '4aed41439898a5f777b5ccefeb97c87a96bdd81f6b3b1ece0ac7541339378eae';
const paintedMasterSha = 'd00130c39fdb094950074d57aed763784741bbf6c3067525c12155fef1debe86';
const paintedClosedMasterSha = '181a6dcbe55b8d23156135519bc0944da3d5dd214001fba4873420a9169f112a';
const paintedBaseSha = '50d006718af734a54c7aa414cc2e407ecb39b0bb264b9a78667ae0f624f39d4e';
const alphaBytes = rgba => Buffer.from(rgba.filter((value, index) => index % 4 === 3));
function packedRgba(text, name) {
  const symbol = name[0].toUpperCase() + name.slice(1);
  assert.equal(Number(text.match(new RegExp('k' + symbol + 'Width\\s*=\\s*(\\d+)'))?.[1]), 80);
  assert.equal(Number(text.match(new RegExp('k' + symbol + 'Height\\s*=\\s*(\\d+)'))?.[1]), 80);
  const array = text.match(new RegExp('k' + symbol + 'Argb\\[\\]\\s*=\\s*\\{([\\s\\S]*?)\\};'));
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
  return rgba;
}
const parentArtHeader = (await parentBytes('src/Lawn/System/ChillShroomArt.h')).toString();
const parentMasks = new Map();
const parentNeutral = Buffer.alloc(80 * 80 * 4);
for (const name of ['cap', 'body', 'base']) {
  const rgba = packedRgba(parentArtHeader, name), alpha = alphaBytes(rgba);
  assert.equal(sha(alpha), expectedParentAlphaSha[name], 'Independently pinned approved part alpha: ' + name);
  parentMasks.set(name, alpha);
  for (let offset = 0; offset < rgba.length; offset += 4) if (rgba[offset + 3]) {
    assert.equal(parentNeutral[offset + 3], 0, 'Parent layers partition whole approved pixels');
    rgba.copy(parentNeutral, offset, offset, offset + 4);
  }
}
assert.equal(sha(parentNeutral), expectedParentRgbaSha, 'Pinned parent parts reconstruct the reviewed final paint');
assert.equal(sha(alphaBytes(parentNeutral)), expectedCanonicalAlphaSha, 'Approved whole-character alpha was independently derived');
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
const paintedMaster = await sourcePngBase64('painted-master.png.base64.txt');
const paintedClosedMaster = await sourcePngBase64('painted-closed-master.png.base64.txt');
const paintedBase = await sourcePngBase64('painted-base.png.base64.txt');
assert.equal(sha(paintedMaster.bytes), paintedMasterSha, 'The reviewed final paint has an immutable source');
assert.equal(sha(paintedClosedMaster.bytes), paintedClosedMasterSha, 'The current bounded eye edit has an immutable source');
assert.equal(sha(paintedBase.bytes), paintedBaseSha, 'The initial style edit remains available for prompt reproducibility');
assert.equal(sha(master.bytes), approvedMasterSha, 'The source is the exact whole character approved by the user');
assert.equal(sha(closedMaster.bytes), closedMasterSha, 'The bounded eye edit has an immutable source');
assert.deepEqual([master.image.width, master.image.height], [1285, 1224]);
assert.equal(artwork.approvedMasterSha256, approvedMasterSha);
assert.equal(artwork.closedMasterSha256, closedMasterSha);
assert.equal(artwork.paintedMasterSha256, paintedMasterSha);
assert.equal(artwork.paintedClosedMasterSha256, paintedClosedMasterSha);
assert.equal(artwork.approvedCanonicalRgbaSha256, expectedApprovedRgbaSha);
assert.equal(artwork.canonicalAlphaSha256, expectedCanonicalAlphaSha);
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
assert.equal(generation.paintedSource, 'painted-master.png.base64.txt');
assert.equal(generation.paintedClosedSource, 'painted-closed-master.png.base64.txt');
assert.equal(generation.paintedBaseSource, 'painted-base.png.base64.txt');
assert.equal(generation.paintedMasterSha256, paintedMasterSha);
assert.equal(generation.paintedClosedMasterSha256, paintedClosedMasterSha);
assert.equal(generation.paintedBaseSha256, paintedBaseSha);
for (const key of ['masterPrompt', 'closedEyePrompt', 'stylePrompt', 'spotRefinementPrompt', 'paintedClosedEyePrompt']) {
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
assert.equal(extraction.paintRegistration.interiorAlphaThreshold, 240, 'Repaint all fully covered interiors while retaining true antialiased contour paint');
assert.equal(extraction.halfExpressionBlend, 0.5);
assert.deepEqual(fs.readFileSync(new URL('extraction.json', artworkUrl)), extractionBytes, 'Public extraction instructions match source');
assert.deepEqual(fs.readFileSync(new URL('generation.json', artworkUrl)), generationBytes, 'Public generation/edit records match source');

const sourceManifest = JSON.parse(await read('source-manifest.json'));
assert.equal(sourceManifest.version, engine.id);
// Mender and the sparse Almanac repair are isolated to reviewed plant/UI paths.
// Every unrelated engine, existing minigame and old artwork byte is preserved.
const runtimeInputs = new Set([
  'src/ConstEnums.h', 'src/Lawn/Plant.cpp', 'src/LawnApp.cpp', 'src/Lawn/SeedPacket.cpp',
  'src/Lawn/Widget/SeedChooserScreen.cpp', 'src/Lawn/Widget/SeedChooserScreen.h',
  'src/Lawn/Widget/AlmanacDialog.cpp', 'src/Lawn/Widget/AlmanacDialog.h', 'src/Lawn/System/DeckPresets.h',
]);
const releaseIdentityInputs = new Set(['CMake/ProjectVersion.cmake', 'artwork/chill-shroom/render.py']);
for (const entry of Object.values(parent.files)) {
  if (entry.dir || !entry.name.startsWith('seedswap1-candidate/source/')) continue;
  const name = entry.name.slice('seedswap1-candidate/source/'.length);
  if (runtimeInputs.has(name)) continue;
  const before = Buffer.from(await entry.async('uint8array'));
  const after = await read('source/' + name);
  if (releaseIdentityInputs.has(name)) {
    assert.equal(after.toString().replaceAll('0.2.6-web-mender.1', '0.2.6-web-seedswap.1'), before.toString(),
      'Only the release identity may change in metadata source: ' + name);
  } else assert.deepEqual(after, before, 'Mender preserves unrelated engine/content/art bytes: ' + name);
}
const addedProduction = Object.keys(sourceManifest.files).filter(name => !parent.file('seedswap1-candidate/source/' + name));
const newCode = ['src/Lawn/System/MenderBloom.h', 'src/Lawn/System/MenderBloom.cpp', 'src/Lawn/System/MenderBloomArt.h'];
assert.deepEqual(addedProduction.filter(name => name.startsWith('src/')).sort(), newCode.sort(), 'Exactly the focused Mender implementation and registered artwork header are added to engine code');
for (const name of addedProduction) assert(newCode.includes(name) || name.startsWith('artwork/mender-bloom/'), 'New source inputs are restricted to the Mender implementation/artwork recipe: ' + name);
function omitFunction(text, signature) {
  const start = text.indexOf(signature);
  assert(start >= 0 && text.indexOf(signature, start + signature.length) < 0, 'Unique reviewed function: ' + signature);
  let cursor = text.indexOf('{', start), depth = 1;
  assert(cursor > start);
  while (depth && ++cursor < text.length) depth += Number(text[cursor] === '{') - Number(text[cursor] === '}');
  assert.equal(depth, 0);
  return text.slice(0, start) + text.slice(cursor + 1);
}
const sharedFunctionScopes = {
  'src/Lawn/Plant.cpp': ['void Plant::PlantInitialize(', 'void Plant::UpdateAbilities(', 'void Plant::UpdateReanim(',
    'Image* Plant::GetImage(', 'void Plant::Draw(', 'void Plant::DrawSeedType(', 'const PlantDefinition& GetPlantDefinition(',
    'std::string Plant::GetNameString(', 'std::string Plant::GetToolTip('],
  'src/LawnApp.cpp': ['LawnApp::~LawnApp()', 'bool LawnApp::HasSeedType('],
  'src/Lawn/SeedPacket.cpp': ['void SeedPacket::Draw('],
  'src/Lawn/Widget/SeedChooserScreen.cpp': ['void SeedChooserScreen::GetSeedPositionInChooser(', 'void SeedChooserScreen::Draw('],
  'src/Lawn/Widget/SeedChooserScreen.h': ['static constexpr int ChooserSeedCount()', 'static constexpr SeedType ChooserSeedType(',
    'static constexpr bool IsChooserSeed(', 'static constexpr int ChosenSeedIndex('],
  'src/Lawn/Widget/AlmanacDialog.cpp': ['void AlmanacDialog::DrawPlants(', 'void AlmanacDialog::GetSeedPosition(', 'SeedType AlmanacDialog::SeedHitTest('],
  'src/Lawn/System/DeckPresets.h': ['static bool ValidSeed(', 'static bool ValidSeeds('],
};
const addedFunctionScopes = {'src/Lawn/Widget/AlmanacDialog.cpp': ['const char* AlmanacDialog::GetAddonAlmanacDescription(']};
for (const [name, signatures] of Object.entries(sharedFunctionScopes)) {
  let before = (await parentBytes(name)).toString().replace(/\r\n?/g, '\n'), after = (await read('source/' + name)).toString().replace(/\r\n?/g, '\n');
  for (const signature of signatures) { before = omitFunction(before, signature); after = omitFunction(after, signature); }
  for (const signature of addedFunctionScopes[name] || []) {
    assert(!before.includes(signature), 'New helper must not replace a parent method: ' + signature);
    after = omitFunction(after, signature);
  }
  if (name === 'src/Lawn/Plant.cpp') after = after.replace('#include "System/MenderBloom.h"\n', '');
  if (name === 'src/LawnApp.cpp') after = after.replace('#include "Lawn/System/MenderBloom.h"\n', '');
  if (name === 'src/Lawn/Widget/SeedChooserScreen.h') after = after
    .replace('// Appended seeds keep IDs 75/76; unused runtime chooser slots store them.', '// The appended seed keeps ID 75; an unused runtime chooser slot stores it.')
    .replace('static_assert(NUM_SEEDS_IN_CHOOSER + 2 <= NUM_SEED_TYPES);', 'static_assert(NUM_SEEDS_IN_CHOOSER < NUM_SEED_TYPES);');
  assert.equal(after.replace(/\n{3,}/g, '\n\n'), before.replace(/\n{3,}/g, '\n\n'), 'Shared source changes only reviewed Mender/Almanac functions: ' + name);
}
{
  const before = (await parentBytes('src/ConstEnums.h')).toString().replace(/\r\n?/g, '\n');
  const after = (await read('source/src/ConstEnums.h')).toString().replace(/\r\n?/g, '\n');
  assert.equal(after.replace(/^.*SEED_MENDERBLOOM.*\n/m, ''), before, 'Only the appended seed76 changes native enum source');
}
{
  const name = 'src/Lawn/Widget/AlmanacDialog.h';
  const before = (await parentBytes(name)).toString().replace(/\r\n?/g, '\n');
  let after = (await read('source/' + name)).toString().replace(/\r\n?/g, '\n');
  after = omitFunction(omitFunction(after, 'static constexpr int AlmanacSeedCount()'), 'static constexpr SeedType AlmanacSeedType(')
    .replace(/^.*static const char\* GetAddonAlmanacDescription.*\n/m, '')
    .replace('\t// Original entries retain all IDs and positions; addon packets use the\n\t// unused header space beside the native Imitater entry.\n', '');
  const nonempty = text => text.split('\n').filter(line => line.trim()).join('\n');
  assert.equal(nonempty(after), nonempty(before), 'Almanac header adds methods only and preserves all existing fields and declarations');
}

for (const name of ['src/Lawn/System/ChillShroomArt.h', 'artwork/chill-shroom/extraction.json', 'artwork/chill-shroom/generation.json', 'artwork/chill-shroom/render.py', 'artwork/chill-shroom/approved-master.png.base64.txt', 'artwork/chill-shroom/closed-master.png.base64.txt', 'artwork/chill-shroom/painted-master.png.base64.txt', 'artwork/chill-shroom/painted-closed-master.png.base64.txt', 'artwork/chill-shroom/painted-base.png.base64.txt']) {
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
assert.equal(sha(canonical.rgba), expectedCanonicalRgbaSha, 'Canonical pixels match the reviewed final paint');
assert.equal(sha(canonical.rgba), expectedParentRgbaSha, 'Minigame revision preserves the exact reviewed parent paint');
assert.equal(sha(alphaBytes(canonical.rgba)), expectedCanonicalAlphaSha, 'New paint preserves every approved whole-character alpha byte');
assert.deepEqual(alphaBytes(canonical.rgba), alphaBytes(parentNeutral), 'New paint retains the exact parent silhouette, not only matching bounds');
const names = ['cap', 'body', 'base', 'blink1', 'blink2'];
assert.deepEqual(Object.keys(artwork.parts).sort(), [...names].sort());
const decodedParts = new Map();
for (const name of names) {
  const pin = artwork.parts[name];
  assert.equal(pin.width, 80); assert.equal(pin.height, 80, 'All runtime parts use the same registered canvas');
  const png = fs.readFileSync(new URL(name + '.png', artworkUrl));
  assert.equal(sha(png), pin.pngSha256, 'Published PNG pin: ' + name);
  const decoded = decodeRgbaPng(png);
  assert.deepEqual([decoded.width, decoded.height], [80, 80]);
  assert.equal(sha(decoded.rgba), pin.rgbaSha256, 'Decoded pixel pin: ' + name);
  const rgba = packedRgba(header, name);
  const parentMask = parentMasks.get(name === 'blink1' || name === 'blink2' ? 'body' : name);
  assert.deepEqual(alphaBytes(rgba), parentMask, 'Motion preserves the exact approved part geometry: ' + name);
  assert.deepEqual(rgba, packedRgba(parentArtHeader, name), 'Motion preserves every reviewed runtime sprite pixel: ' + name);
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
assert.equal(sha(reconstructed), expectedCanonicalRgbaSha, 'Registered parts reconstruct the reviewed final paint exactly');
assert.equal(sha(alphaBytes(reconstructed)), expectedCanonicalAlphaSha, 'Layer union retains the approved silhouette after repainting');
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
console.log('PASS exact parent Chill pixels/geometry, scoped plant/Almanac changes, independent PNG/runtime pixels, neutral reconstruction, fixed-alpha eye-only expressions and native cards without standalone generated illustrations.');

// Independently decode Mender PNGs and the compiled straight-alpha ARGB arrays.
// Public/source hashes alone cannot establish the actual exported pixel layout.
{
  const artUrl = new URL('content/mender-bloom/', dist);
  const provenance = JSON.parse(fs.readFileSync(new URL('provenance.json', artUrl)));
  assert.equal(provenance.schema, 1);
  assert.equal(provenance.version, engine.id);
  assert.equal(provenance.displayName, 'Mender-bloom');
  assert.equal(provenance.imageGenerationUsed, true);
  assert.equal(provenance.standaloneChallengeIllustrations, false);
  assert.equal(provenance.sourceMasterSha256, '22c912c59fedbad0fd1c006164374e90b04010f8da2fe021e6c012d3184cbc14', 'Reviewed Mender master is independently pinned');
  assert.equal(provenance.sourceClosedSha256, 'd5d17c1b545a0b1a71265cf32afcde2d0996c57a5742c108bc09c305a74e4c24', 'Reviewed closed-eye source is independently pinned');
  assert.equal(provenance.canonicalRgbaSha256, '042db58ae7d45ccd9e3d3b25884c4c0809d1e1dad9aa5580a7fc83fcaf839399', 'Reviewed final Mender pixels are independently pinned');
  const pins = {
    'artwork/mender-bloom/master.png': provenance.sourceMasterSha256,
    'artwork/mender-bloom/closed.png': provenance.sourceClosedSha256,
    'artwork/mender-bloom/generation.json': provenance.generationSha256,
    'artwork/mender-bloom/extraction.json': provenance.extractionSha256,
    'artwork/mender-bloom/render.py': provenance.generatorSha256,
    'src/Lawn/System/MenderBloomArt.h': provenance.headerSha256,
  };
  for (const [name, expected] of Object.entries(pins)) {
    const bytes = await read('source/' + name);
    assert.equal(sha(bytes), expected, 'Mender provenance identifies exact archived source input: ' + name);
    assert.equal(sourceManifest.files[name]?.sha256, expected);
    assert.equal(sourceManifest.files[name]?.bytes, bytes.length);
  }
  for (const name of ['generation.json', 'extraction.json']) assert.deepEqual(fs.readFileSync(new URL(name, artUrl)), await read('source/artwork/mender-bloom/' + name));
  const recipe = JSON.parse(await read('source/artwork/mender-bloom/extraction.json'));
  assert.deepEqual(recipe.canvas, [80, 80]);
  assert.deepEqual(recipe.eyeRegions, [[38,28,45,34],[48,27,53,33]], 'Mender expressions stay inside the reviewed eye regions');
  assert.deepEqual(recipe.normalizedSize, [55,68]);
  assert.deepEqual(recipe.offset, [12,6], 'Mender maintains its shared native ground registration');
  const menderHeader = (await read('source/src/Lawn/System/MenderBloomArt.h')).toString();
  assert.equal(Number(menderHeader.match(/kWidth\s*=\s*(\d+)/)?.[1]), 80);
  assert.equal(Number(menderHeader.match(/kHeight\s*=\s*(\d+)/)?.[1]), 80);
  const arrays = {canonical: 'kArgb', head: 'kHeadArgb', stem: 'kStemArgb', 'head-blink': 'kHeadBlinkArgb'};
  const parts = new Map();
  for (const name of ['canonical', 'head', 'stem', 'head-blink', 'blink']) {
    const png = fs.readFileSync(new URL(name + '.png', artUrl)), pin = provenance.parts[name];
    const decoded = decodeRgbaPng(png);
    assert.deepEqual([decoded.width, decoded.height, pin.width, pin.height], [80, 80, 80, 80]);
    assert.equal(sha(png), pin.pngSha256);
    assert.equal(sha(decoded.rgba), pin.rgbaSha256);
    for (let p = 0; p < decoded.rgba.length; p += 4) if (!decoded.rgba[p + 3]) assert.equal(decoded.rgba.readUInt32BE(p), 0, 'Transparent Mender pixels have no hidden RGB');
    if (arrays[name]) {
      const values = menderHeader.match(new RegExp(arrays[name] + '\\[\\]\\s*=\\s*\\{([\\s\\S]*?)\\};'));
      assert(values, 'Mender packed array is present: ' + name);
      const pixels = [...values[1].matchAll(/0x([0-9a-fA-F]{8})u/g)].map(value => Number.parseInt(value[1], 16));
      assert.equal(pixels.length, 6400);
      const rgba = Buffer.alloc(25600);
      for (let i = 0; i < pixels.length; i++) {
        rgba[i * 4] = pixels[i] >>> 16 & 255; rgba[i * 4 + 1] = pixels[i] >>> 8 & 255;
        rgba[i * 4 + 2] = pixels[i] & 255; rgba[i * 4 + 3] = pixels[i] >>> 24;
      }
      assert.deepEqual(rgba, decoded.rgba, 'Mender public and compiled sprite pixels match exactly: ' + name);
    }
    parts.set(name, decoded.rgba);
  }
  const neutral = parts.get('canonical'), head = parts.get('head'), stem = parts.get('stem'), blink = parts.get('blink'), blinkHead = parts.get('head-blink');
  const reconstructed = Buffer.alloc(neutral.length), closed = Buffer.alloc(neutral.length);
  const changed = recipe.eyeRegions.map(() => 0); let headPixels = 0, stemPixels = 0;
  for (let p = 0; p < neutral.length; p += 4) {
    const ha = head[p + 3], sa = stem[p + 3];
    assert(!(ha && sa), 'Mender neutral layers partition pixels without overlapping alpha');
    if (ha) {head.copy(reconstructed, p, p, p + 4); blinkHead.copy(closed, p, p, p + 4); headPixels++;}
    else if (sa) {stem.copy(reconstructed, p, p, p + 4); stem.copy(closed, p, p, p + 4); stemPixels++;}
    assert.equal(blink[p + 3], neutral[p + 3], 'Mender blink retains canonical alpha');
    assert.equal(blinkHead[p + 3], head[p + 3], 'Mender head expression retains registered layer alpha');
    const x = p / 4 % 80, y = Math.floor(p / 4 / 80);
    const eye = recipe.eyeRegions.findIndex(([l,t,r,b]) => x >= l && x < r && y >= t && y < b);
    if (!neutral.subarray(p, p + 4).equals(blink.subarray(p, p + 4))) {
      assert(eye >= 0, 'Mender expression changes only the fixed eye regions');
      changed[eye]++;
    }
  }
  assert(headPixels > 0 && stemPixels > 0);
  assert.deepEqual(reconstructed, neutral, 'Mender head/stem union exactly reconstructs the canonical whole sprite');
  assert.deepEqual(closed, blink, 'Mender head-blink/stem union exactly reconstructs its closed expression');
  assert.equal(sha(neutral), provenance.canonicalRgbaSha256);
  for (const pixels of changed) assert(pixels > 5, 'Both Mender eyes have actual animation artwork');
  console.log('PASS Mender exact source provenance, independent PNG/runtime pixels, registered head/stem reconstruction and fixed-alpha eye-only blink.');
}


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
