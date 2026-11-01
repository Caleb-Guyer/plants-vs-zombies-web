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
assert.equal(engine.id, '0.2.6-web-chill.3');
const current = await JSZip.loadAsync(fs.readFileSync(new URL(engine.artifacts.source, new URL('game/engine-provenance.json', dist))), {checkCRC32: true});
const parent = await JSZip.loadAsync(fs.readFileSync(new URL('source/pvz-portable-0.2.6-web-chill.2-source.zip', dist)), {checkCRC32: true});
const prefix = 'chill3-candidate/';
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
const parentBytes = async name => Buffer.from(await parent.file('chill2-candidate/source/' + name).async('uint8array'));
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
assert.equal(artRecord.sourceKind, 'native sprite compositions with custom code-drawn vector plant parts');
assert.equal(artRecord.generatedArtworkUsed, false);
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
function decodeRgbaPng(bytes) {
  assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  let offset = 8, width, height, ended = false;
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
      assert(width > 0 && height > 0 && width <= 256 && height <= 256);
      assert.deepEqual([...data.subarray(8)], [8, 6, 0, 0, 0], 'Noninterlaced RGBA8 PNG');
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
  const stride = width * 4;
  const scanlines = inflateSync(Buffer.concat(compressed), {maxOutputLength: height * (stride + 1)});
  assert.equal(scanlines.length, height * (stride + 1));
  const rgba = Buffer.alloc(width * height * 4);
  const paeth = (left, up, upperLeft) => {
    const prediction = left + up - upperLeft;
    const a = Math.abs(prediction - left), b = Math.abs(prediction - up), c = Math.abs(prediction - upperLeft);
    return a <= b && a <= c ? left : b <= c ? up : upperLeft;
  };
  for (let y = 0; y < height; y++) {
    const source = y * (stride + 1), target = y * stride, filter = scanlines[source];
    assert(filter <= 4, 'Supported PNG row filter');
    for (let x = 0; x < stride; x++) {
      const left = x >= 4 ? rgba[target + x - 4] : 0;
      const up = y ? rgba[target + x - stride] : 0;
      const upperLeft = y && x >= 4 ? rgba[target + x - stride - 4] : 0;
      const prediction = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? up :
        filter === 3 ? Math.floor((left + up) / 2) : paeth(left, up, upperLeft);
      rgba[target + x] = (scanlines[source + 1 + x] + prediction) & 255;
    }
  }
  return {width, height, rgba};
}

const artworkUrl = new URL('content/chill-shroom/', dist);
const artwork = JSON.parse(fs.readFileSync(new URL('provenance.json', artworkUrl)));
assert.equal(artwork.schema, 1);
assert.equal(artwork.version, engine.id);
assert.equal(artwork.method, 'Editable vector paths with deterministic Pillow rasterization');
assert.equal(artwork.imageGenerationUsed, false);
assert.equal(artwork.standaloneChallengeIllustrations, false);
const headerBytes = await read('source/src/Lawn/System/ChillShroomArt.h');
const header = headerBytes.toString();
const recipeBytes = await read('source/artwork/chill-shroom/recipe.json');
const recipe = JSON.parse(recipeBytes);
const generator = await read('source/artwork/chill-shroom/render.py');
assert.equal(sha(headerBytes), artwork.headerSha256);
assert.equal(sha(recipeBytes), artwork.recipeSha256);
assert.equal(sha(generator), artwork.generatorSha256);
assert.equal(recipe.imageGenerationUsed, false);
const sourceManifest = JSON.parse(await read('source-manifest.json'));
assert.equal(sourceManifest.version, engine.id);
for (const name of ['src/Lawn/System/ChillShroomArt.h', 'artwork/chill-shroom/recipe.json', 'artwork/chill-shroom/render.py', 'artwork/chill-shroom/design.py']) {
  const bytes = await read('source/' + name), pin = sourceManifest.files[name];
  assert(pin, 'Editable art source is included in the source manifest: ' + name);
  assert.equal(pin.bytes, bytes.length);
  assert.equal(pin.sha256, sha(bytes));
}

const dimensions = {cap: [103, 54], body: [66, 45], base: [75, 21], blink1: [33, 9], blink2: [33, 9]};
assert.deepEqual(Object.keys(artwork.parts).sort(), Object.keys(dimensions).sort());
const decodedParts = new Map();
for (const [name, [width, height]] of Object.entries(dimensions)) {
  const pin = artwork.parts[name], symbol = name[0].toUpperCase() + name.slice(1);
  assert.equal(pin.width, width); assert.equal(pin.height, height);
  const png = fs.readFileSync(new URL(name + '.png', artworkUrl));
  assert.equal(sha(png), pin.pngSha256, 'Published PNG pin: ' + name);
  const decoded = decodeRgbaPng(png);
  assert.equal(decoded.width, width); assert.equal(decoded.height, height);
  assert.equal(sha(decoded.rgba), pin.rgbaSha256, 'Decoded pixel pin: ' + name);
  assert.equal(Number(header.match(new RegExp('k' + symbol + 'Width\\s*=\\s*(\\d+)'))?.[1]), width);
  assert.equal(Number(header.match(new RegExp('k' + symbol + 'Height\\s*=\\s*(\\d+)'))?.[1]), height);
  const array = header.match(new RegExp('k' + symbol + 'Argb\\[\\]\\s*=\\s*\\{([\\s\\S]*?)\\};'));
  assert(array, 'Packed runtime pixels: ' + name);
  const pixels = [...array[1].matchAll(/0x([0-9a-fA-F]{8})u/g)].map(match => Number.parseInt(match[1], 16));
  assert.equal(pixels.length, width * height);
  const rgba = Buffer.alloc(width * height * 4);
  pixels.forEach((pixel, index) => {
    rgba[index * 4] = (pixel >>> 16) & 255;
    rgba[index * 4 + 1] = (pixel >>> 8) & 255;
    rgba[index * 4 + 2] = pixel & 255;
    rgba[index * 4 + 3] = pixel >>> 24;
  });
  assert.deepEqual(decoded.rgba, rgba, 'Public PNG and embedded runtime artwork are pixel-identical: ' + name);
  decodedParts.set(name, decoded);

  const svg = fs.readFileSync(new URL(name + '.svg', artworkUrl), 'utf8');
  assert(!/<image\b|(?:href|src)\s*=|<script\b/i.test(svg), 'Editable SVG contains paths, not external or raster artwork');
  assert.match(svg, new RegExp('<svg[^>]*\\bwidth="' + width + '"[^>]*\\bheight="' + height + '"'));
  const shapes = name.startsWith('blink') ?
    [...recipe.parts.body.shapes.slice(0, -recipe.openEyes.length), ...recipe[name === 'blink1' ? 'halfEyes' : 'closedEyes']] : recipe.parts[name].shapes;
  const svgPaths = [...svg.matchAll(/<path\b([^>]*)\/?\s*>/g)];
  assert.equal(svgPaths.length, shapes.length, 'Editable SVG path count matches the canonical recipe: ' + name);
  svgPaths.forEach((match, index) => {
    const attributes = new Map([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(value => [value[1], value[2]]));
    const tokens = attributes.get('d').match(/[MLCZ]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g)
      .map(value => /^[MLCZ]$/.test(value) ? value : Number(value));
    assert.deepEqual(tokens, shapes[index].path.flat(), 'Editable SVG paths match the canonical recipe: ' + name);
    assert.equal(attributes.get('fill'), shapes[index].fill || 'none');
    assert.equal(attributes.get('stroke'), shapes[index].stroke);
    if (shapes[index].stroke) assert.equal(Number(attributes.get('stroke-width')), shapes[index].width || 1);
  });
}
assert(decodedParts.get('cap').rgba.subarray(46 * 103 * 4).every(value => value === 0),
  'Native cap canvas leaves its lower eight rows clear for the face');
const body = decodedParts.get('body').rgba, blink1 = decodedParts.get('blink1').rgba, blink2 = decodedParts.get('blink2').rgba;
assert(!blink1.equals(blink2), 'Half and closed blink frames differ');
for (let y = 0; y < 9; y++) {
  for (const x of [0, 1, 14, 15, 16, 17, 31, 32]) {
    const eyeOffset = (y * 33 + x) * 4, bodyOffset = (y * 66 + x + 17) * 4;
    const skin = body.subarray(bodyOffset, bodyOffset + 4);
    assert.equal(skin[3], 255, 'Blink skin samples are opaque');
    assert.deepEqual(blink1.subarray(eyeOffset, eyeOffset + 4), skin, 'Half blink retains the same stem skin');
    assert.deepEqual(blink2.subarray(eyeOffset, eyeOffset + 4), skin, 'Closed blink retains the same stem skin');
  }
}
console.log('PASS custom editable vector-part provenance, independently decoded PNG/runtime pixel parity, matching blink skin and native portrait composition without generated challenge illustrations.');


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
