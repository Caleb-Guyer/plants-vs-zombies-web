// SPDX-License-Identifier: MIT
// Actual packaged C++ and EM_ASM bridge; synthetic JPEG bytes and browser mocks.
// These checks establish source scope and download behavior, not image parity.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const dist = new URL('../dist/', import.meta.url);
const vendor = {exports: {}};
new Function('module', 'exports', 'require',
  fs.readFileSync(new URL('vendor/jszip.min.js', dist), 'utf8')
)(vendor, vendor.exports, require);
const JSZip = vendor.exports;
assert.equal(typeof JSZip.loadAsync, 'function', 'Use the actual vendored ZIP implementation');
const provenanceUrl = new URL('game/engine-provenance.json', dist);
const provenance = JSON.parse(fs.readFileSync(provenanceUrl, 'utf8'));
assert.equal(typeof provenance.artifacts?.source, 'string', 'The engine manifest must identify its corresponding source');
const modifiedSourceUrl = new URL(provenance.artifacts.source, provenanceUrl);
assert(modifiedSourceUrl.href.startsWith(new URL('source/', dist).href)
  && modifiedSourceUrl.pathname.endsWith('.zip'), 'Corresponding source must be a local distribution source ZIP');
const [official, modified] = await Promise.all([
  JSZip.loadAsync(fs.readFileSync(new URL('source/pvz-portable-0.2.6-source.zip', dist)), {checkCRC32: true}),
  JSZip.loadAsync(fs.readFileSync(modifiedSourceUrl), {checkCRC32: true}),
]);

function srcFiles(zip) {
  const files = new Map();
  for (const entry of Object.values(zip.files)) {
    if (entry.dir) continue;
    // Engine sources live at the archive root; build recipes can contain
    // separately hashed prior-source fixtures with their own nested /src/.
    const parts = entry.name.split('/');
    const engineRoot = ['endless3-candidate/source/', 'endless2-candidate/source/', 'endless1-candidate/source/', 'pool1-candidate/source/', 'cob1-candidate/source/', 'bungee1-candidate/source/', 'garlic1-candidate/source/', 'lights2-candidate/source/', 'lights1-candidate/source/', 'raid5-candidate/source/', 'raid4-candidate/source/', 'raid3-candidate/source/', 'raid2-candidate/source/', 'raid1-candidate/source/', 'rally3-candidate/source/', 'rally2-candidate/source/', 'rally1-candidate/source/', 'chain1-candidate/source/', 'care3-candidate/source/', 'care2-candidate/source/', 'care1-candidate/source/', 'mender3-candidate/source/', 'mender2-candidate/source/', 'mender1-candidate/source/', 'seedswap1-candidate/source/', 'garden1-candidate/source/', 'chill9-candidate/source/', 'chill8-candidate/source/', 'chill7-candidate/source/', 'chill6-candidate/source/', 'chill5-candidate/source/', 'chill4-candidate/source/', 'chill3-candidate/source/', 'chill2-candidate/source/', 'chill1-candidate/source/', 'lantern2-candidate/source/', 'lantern1-candidate/source/', 'night1-candidate/source/', 'polish1-candidate/source/', 'content1-candidate/source/', 'qol2-candidate/source/', 'qol1-candidate/source/', 'software10-candidate/source/']
      .find(prefix => entry.name.startsWith(prefix + 'src/'));
    const relative = engineRoot
      ? entry.name.slice(engineRoot.length)
      : parts[0] === 'src' ? entry.name
      : parts[1] === 'src' ? parts.slice(1).join('/') : null;
    if (!relative) continue;
    assert(!files.has(relative), 'Duplicate source path: ' + relative);
    files.set(relative, entry);
  }
  assert(files.size > 400, 'Complete engine source inventory must be present');
  return files;
}
const originals = srcFiles(official);
const candidates = srcFiles(modified);
const addedRendererFiles=['src/SexyAppFramework/graphics/SoftwareScreenImage.cpp','src/SexyAppFramework/graphics/SoftwareScreenImage.h','src/PvzpLib/PvzpNativeScreenPixel888.inc','src/PvzpLib/PvzpNativeScreenTexel.inc'];
const addedContentFiles=['src/Lawn/System/PoolPanicEndless.h','src/Lawn/System/PoolPanicEndless.cpp','src/Lawn/System/PoolPanicEndlessPresentation.h','src/Lawn/System/PoolPanicEndlessPresentation.cpp','src/Lawn/System/PoolPanic.h','src/Lawn/System/PoolPanic.cpp','src/Lawn/System/PoolPanicPresentation.h','src/Lawn/System/PoolPanicPresentation.cpp','src/Lawn/System/CobCannonCommand.h','src/Lawn/System/CobCannonCommand.cpp','src/Lawn/System/CobCannonCommandPresentation.h','src/Lawn/System/CobCannonCommandPresentation.cpp','src/Lawn/System/BungeeBusiness.h','src/Lawn/System/BungeeBusiness.cpp','src/Lawn/System/BungeeBusinessPresentation.h','src/Lawn/System/BungeeBusinessPresentation.cpp','src/Lawn/System/GarlicRun.h','src/Lawn/System/GarlicRun.cpp','src/Lawn/System/GarlicRunPresentation.h','src/Lawn/System/GarlicRunPresentation.cpp','src/Lawn/System/LightsOut.h','src/Lawn/System/LightsOut.cpp','src/Lawn/System/LightsOutPresentation.h','src/Lawn/System/LightsOutPresentation.cpp','src/Lawn/System/RallyRaid.h','src/Lawn/System/RallyRaid.cpp','src/Lawn/System/RallyRaidPresentation.h','src/Lawn/System/RallyRaidPresentation.cpp',"src/Lawn/System/RallyPresentation.cpp","src/Lawn/System/RallyPresentation.h","src/Lawn/System/RallyZombie.cpp","src/Lawn/System/RallyZombie.h",'src/Lawn/System/ChainReaction.h','src/Lawn/System/ChainReaction.cpp','src/Lawn/System/CareFatigue.h','src/Lawn/System/IntensiveCare.h','src/Lawn/System/MenderBloom.h','src/Lawn/System/MenderBloom.cpp','src/Lawn/System/MenderBloomArt.h','src/Lawn/System/SeedSwap.h','src/Lawn/System/GardenShuffle.h','src/Lawn/System/BonusChallenge.h','src/Lawn/System/NightShift.h','src/Lawn/System/LanternGlow.h','src/Lawn/System/LanternShroom.h','src/Lawn/System/LanternShroom.cpp','src/Lawn/System/ChillShroomArt.h'];
const addedQoLFiles=['src/Lawn/System/QoLSettings.h','src/Lawn/System/QoLSettings.cpp','src/Lawn/Widget/QoLDialog.h','src/Lawn/Widget/QoLDialog.cpp','src/Lawn/System/DeckPresets.h','src/Lawn/System/DeckPresets.cpp','src/Lawn/Widget/PlantDecksDialog.h','src/Lawn/Widget/PlantDecksDialog.cpp','src/Lawn/SeedPacketCooldown.h'];
assert.deepEqual([...candidates.keys()].sort(), [...originals.keys(),...addedRendererFiles,...addedQoLFiles,...addedContentFiles].sort(),
  'The complete source adds exactly the retained renderer, QoL and reviewed bonus files');
const code = /\.(?:c|cc|cpp|cxx|h|hh|hpp|hxx|inc|java|bas|rc|sh|cmake|in)$/i;
const normalize = text => text.replace(/\r\n?/g, '\n');
const changed = [];
const decoded = new Map();
for (const [name, entry] of originals) {
  const [before, after] = await Promise.all([
    entry.async('uint8array'), candidates.get(name).async('uint8array'),
  ]);
  let equal;
  if (code.test(name) || name.endsWith('/CMakeLists.txt')) {
    const beforeText = normalize(Buffer.from(before).toString('utf8'));
    const afterText = normalize(Buffer.from(after).toString('utf8'));
    equal = beforeText === afterText;
    if (name.endsWith('/ZombatarWidget.cpp')) decoded.set(name, [beforeText, afterText]);
  } else {
    equal = Buffer.from(before).equals(Buffer.from(after));
  }
  if (!equal) changed.push(name);
}
assert.deepEqual(changed.sort(), [
  "src/Lawn/MessageWidget.cpp",
  "src/Lawn/System/ReanimationLawn.cpp",
  "src/Lawn/Widget/LawnDialog.cpp",
  "src/Lawn/Widget/GameButton.cpp",
  "src/Lawn/Widget/AlmanacDialog.h",
  "src/Lawn/Widget/AlmanacDialog.cpp",
  "src/ConstEnums.h",
  "src/Lawn/Widget/ChallengeScreen.cpp",
  "src/Lawn/Widget/ChallengeScreen.h",
  "src/Lawn/Widget/ContinueDialog.cpp",
  "src/Lawn/Board.cpp",
  "src/Lawn/Board.h",
  "src/Lawn/Challenge.cpp",
  "src/Lawn/Challenge.h",
  "src/Lawn/Coin.cpp",
  "src/Lawn/CursorObject.cpp",
  "src/Lawn/Plant.cpp",
  "src/Lawn/SeedPacket.cpp",
  "src/Lawn/System/PlayerInfo.cpp",
  "src/Lawn/Widget/NewOptionsDialog.cpp",
  "src/Lawn/Widget/NewOptionsDialog.h",
  "src/Lawn/Widget/SeedChooserScreen.cpp",
  "src/Lawn/Widget/SeedChooserScreen.h",
  "src/Lawn/Widget/ZombatarWidget.cpp",
  "src/Lawn/Widget/ZombatarWidget.h",
  "src/Lawn/Zombie.cpp",
  "src/Lawn/Zombie.h",
  "src/LawnApp.cpp",
  "src/LawnApp.h",
  "src/PvzpLib/PvzpDrawTriangle.inc",
  "src/SexyAppFramework/SexyAppBase.cpp",
  "src/SexyAppFramework/SexyAppBase.h",
  "src/SexyAppFramework/graphics/GLImage.cpp",
  "src/SexyAppFramework/graphics/GLInterface.cpp",
  "src/SexyAppFramework/graphics/GLInterface.h",
  "src/SexyAppFramework/graphics/MemoryImage.cpp",
  "src/SexyAppFramework/graphics/MemoryImage.h",
  "src/SexyAppFramework/graphics/inc_routines/MI_SlowStretchBlt.inc",
  "src/SexyAppFramework/imagelib/ImageLib.cpp",
  "src/SexyAppFramework/imagelib/ImageLib.h",
  "src/SexyAppFramework/platform/default/Window.cpp",
  "src/SexyAppFramework/platform/emscripten/Window.cpp"
].sort(), 'The packaged source changes exactly the reviewed existing engine paths; renderer additions are separately constrained');
const [before, source] = decoded.get('src/Lawn/Widget/ZombatarWidget.cpp');
console.log('PASS complete Endless.3 source layout, retained renderer additions and reviewed native QoL/bonus/plant/packet paths; all Zombatar behavior checks remain active.');

// Find the actual complete body, respecting quoted strings and comments.
function functionText(text, signature) {
  const start = text.indexOf(signature);
  assert(start >= 0, 'Missing function: ' + signature);
  assert.equal(text.indexOf(signature, start + signature.length), -1,
    'Ambiguous function: ' + signature);
  const open = text.indexOf('{', start + signature.length);
  assert(open > start);
  let depth = 0, quote = null, lineComment = false, blockComment = false;
  for (let i = open; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (lineComment) { if (ch === '\n') lineComment = false; continue; }
    if (blockComment) { if (ch === '*' && next === '/') { blockComment = false; i++; } continue; }
    if (quote) {
      if (ch === '\\') { i++; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '/' && next === '/') { lineComment = true; i++; continue; }
    if (ch === '/' && next === '*') { blockComment = true; i++; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '{') depth++;
    if (ch === '}' && --depth === 0) return text.slice(start, i + 1);
  }
  assert.fail('Unbalanced function: ' + signature);
}
for (const signature of [
  'bool ZombatarWidget::SaveDraft()',
  'void ZombatarWidget::DrawAvatar(',
  'void ZombatarWidget::DrawPartImage(',
  'void ZombatarWidget::DrawImageColorized(',
]) assert.equal(functionText(source, signature), functionText(before, signature),
  signature + ' must retain the existing profile serialization/composition');
const exportFunction = functionText(source, 'void ZombatarWidget::ExportCurrentPortrait()');
assert(!exportFunction.includes('SaveDraft('), 'Image retries must not create another profile portrait');
assert.match(exportFunction, /std::string aPath;[\s\S]*while\s*\(/);
assert.match(exportFunction, /if\s*\(aPath\.empty\(\)\s*&&\s*!WriteCurrentPortraitImage\(aPath\)\)/,
  'Create once; a retry with a stored image must reuse that path');
assert.match(exportFunction, /RequestZombatarDownload\(aPath\)/);
const confirmFunction = functionText(source, 'void ZombatarWidget::ButtonDepress(int theId)');
assert.equal((confirmFunction.match(/ExportCurrentPortrait\(\)/g) || []).length, 1);
assert.match(confirmFunction, /else if\s*\(mState == ZOMBATAR_STATE_CONFIRM\)\s*\{\s*if\s*\(SaveDraft\(\)\)\s*\{[\s\S]*?ExportCurrentPortrait\(\)/,
  'Only a successful confirmed save starts image export');
const writer = functionText(source, 'bool ZombatarWidget::WriteCurrentPortraitImage(');
assert.match(writer, /std::fill_n\(aPixels, aPixelCount, 0u\)/,
  'The export destination must start with the original zero ARGB pixels');
assert(!/aPortrait\.SetImageMode\s*\(/.test(writer),
  'Preserve Create\'s alpha/transparency-aware destination; do not force opaque mode');
assert.match(writer, /ImageLib::WriteZombatarJPEGImage\(aPath, &aEncoded\)/,
  'The production Zombatar exporter must use its original-specific encoder profile');
assert.match(writer, /std::array<uint8_t, ZOMBATAR_RECORD_SIZE>/);
assert.match(writer, /memcpy\(aRecord\.data\(\),[\s\S]*aRecord\.size\(\)\)/,
  'Copy the saved record before composition');
assert.match(writer, /DrawAvatar\(&aGraphics, 0, 0, aRecord\.data\(\)\)/);
assert.match(writer, /aEncoded\.mBits = std::make_unique<uint32_t\[\]>\(aPixelCount\)/);
assert.match(writer, /memcpy\(aEncoded\.mBits\.get\(\), aPortrait\.GetBits\(\), aPixelCount \* sizeof\(uint32_t\)\)/,
  'The encoder must own its copy without the MemoryImage sentinel');
assert(!writer.includes('DrawDraftAvatar('));
console.log('PASS existing SaveDraft/DrawAvatar bodies are unchanged; only confirmed success exports and retries reuse one image without adding records.');

const bridge = functionText(source, 'static bool RequestZombatarDownload(');
const prefix = 'return EM_ASM_INT({';
const suffix = '}, thePath.c_str()) != 0;';
assert.equal(bridge.split(prefix).length, 2, 'One actual EM_ASM body');
const begin = bridge.indexOf(prefix) + prefix.length;
const end = bridge.indexOf(suffix, begin);
assert(end > begin, 'Extract the actual packaged C++ download body');
const body = bridge.slice(begin, end);

function harness({
  clickFails = false, readFails = false, persistFails = false,
  persistThrows = false, objectURLFails = false, appendFails = false,
} = {}) {
  const events = [], warnings = [], timers = [], blobs = [], syncCallbacks = [];
  const bytes = new Uint8Array([255, 216, 255, 224, 0, 16, 74, 70, 73, 70, 0, 255, 217]);
  const path = '/saves/userdata/zombatars/user900001/Zombatar_7.jpg';
  let anchor, audioCalls = 0;
  const noAudio = function () { audioCalls++; throw new Error('Image export must not initialize audio'); };
  const context = vm.createContext({
    $0: 1234, Uint8Array, Blob,
    UTF8ToString(pointer) {
      assert.equal(pointer, 1234);
      events.push('path');
      return path;
    },
    FS: {
      readFile(target) {
        assert.equal(target, path, 'Read only the selected stored portrait');
        events.push('read');
        if (readFails) throw new Error('read failed');
        return bytes;
      },
      syncfs(populate, callback) {
        assert.equal(populate, false);
        events.push('sync');
        if (persistThrows) throw new Error('persist threw');
        syncCallbacks.push(callback);
      },
    },
    document: {
      createElement(tag) {
        assert.equal(tag, 'a', 'No audio or other element should be created');
        anchor = {
          click() { events.push('click'); if (clickFails) throw new Error('click failed'); },
          remove() { events.push('remove'); },
        };
        return anchor;
      },
      body: {
        appendChild(value) {
          assert.equal(value, anchor);
          events.push('append');
          if (appendFails) throw new Error('append failed');
        },
      },
    },
    URL: {
      createObjectURL(blob) {
        if (objectURLFails) throw new Error('object URL failed');
        blobs.push(blob);
        return 'blob:synthetic-portrait-' + blobs.length;
      },
      revokeObjectURL(url) {
        assert.match(url, /^blob:synthetic-portrait-\d+$/);
        events.push('revoke');
      },
    },
    setTimeout(fn, delay) { timers.push({fn, delay}); },
    console: {warn: (...args) => warnings.push(args)},
    Audio: noAudio, AudioContext: noAudio, webkitAudioContext: noAudio,
    OfflineAudioContext: noAudio, webkitOfflineAudioContext: noAudio,
  });
  context.window = context;
  context.self = context;
  const request = vm.runInContext('(function(){' + body + '\n})', context,
    {filename: 'packaged-ZombatarWidget-EM_ASM.js'});
  return {
    request, events, warnings, timers, blobs, bytes, anchor: () => anchor,
    flushSync() { while (syncCallbacks.length) syncCallbacks.shift()(persistFails ? new Error('persist failed') : null); },
    assertNoAudio() { assert.equal(audioCalls, 0, 'Download code must not initialize audio'); },
  };
}

const success = harness();
assert.equal(success.request(), 1);
assert.deepEqual(success.events, ['path', 'read', 'append', 'click', 'remove', 'sync']);
assert.equal(success.anchor().download, 'Zombatar_7.jpg');
assert.equal(success.anchor().hidden, true);
assert.equal(success.blobs[0].type, 'image/jpeg');
const expected = [...success.bytes];
success.bytes.fill(0);
assert.deepEqual([...new Uint8Array(await success.blobs[0].arrayBuffer())], expected,
  'Blob must own exact bytes before FS buffers change');
assert.equal(success.timers.length, 1);
assert.equal(success.timers[0].delay, 60000);
assert(!success.events.includes('revoke'), 'Do not revoke the URL before the browser can consume it');
success.flushSync();
success.timers[0].fn();
assert.equal(success.events.at(-1), 'revoke');
success.assertNoAudio();
console.log('PASS actual bridge owns exact JPEG bytes, sets MIME/filename, clicks before async persistence, and delays URL cleanup.');

for (const options of [
  {clickFails: true}, {readFails: true}, {objectURLFails: true}, {appendFails: true},
]) {
  const failed = harness(options);
  assert.equal(failed.request(), 0, 'Failed download setup must not claim it requested a download');
  assert(failed.warnings.some(w => String(w[0]).includes('download request failed')));
  assert(failed.events.includes('sync'), 'Persist the stored image even if a download request fails');
  if (options.clickFails || options.appendFails) {
    assert(failed.events.includes('remove'));
    assert.equal(failed.timers.length, 1);
  } else {
    assert.equal(failed.blobs.length, 0);
    assert.equal(failed.timers.length, 0);
  }
  failed.flushSync();
  failed.assertNoAudio();
}
for (const options of [{persistFails: true}, {persistThrows: true}]) {
  const storage = harness(options);
  assert.equal(storage.request(), 1, 'A persistence failure must not undo an already requested download');
  storage.flushSync();
  assert(storage.warnings.some(w => String(w[0]).includes('persist failed')));
  assert.equal(storage.blobs.length, 1);
  storage.assertNoAudio();
}
console.log('PASS read/DOM/click failures return failure; sync errors are reported without canceling a requested download or touching audio.');

const repeat = harness();
assert.equal(repeat.request(), 1);
assert.equal(repeat.request(), 1);
assert.equal(repeat.blobs.length, 2);
assert.equal(repeat.events.filter(e => e === 'read').length, 2);
assert.equal(repeat.anchor().download, 'Zombatar_7.jpg');
assert.deepEqual(
  [...new Uint8Array(await repeat.blobs[0].arrayBuffer())],
  [...new Uint8Array(await repeat.blobs[1].arrayBuffer())],
  'Retry downloads the same stored image bytes',
);
repeat.flushSync();
repeat.assertNoAudio();
console.log('PASS same-file retry requests the same portrait again without regenerating a profile record; no audio APIs run.');

