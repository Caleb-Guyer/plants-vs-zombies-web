// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {test} from 'node:test';
import {restoreNativeArtifactPack} from './native-artifact-pack.mjs';
import {verifyDoubleAgentReportIdentity,verifyDoubleAgentCaseLog} from './double-agent-verification.mjs';

const require = createRequire(import.meta.url), vendor = {exports: {}};
new Function('module', 'exports', 'require', fs.readFileSync(new URL('../dist/vendor/jszip.min.js', import.meta.url), 'utf8'))
  (vendor, vendor.exports, require);
const JSZip = vendor.exports;
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const prefix = 'tiny-candidate/';
const folder = prefix + 'tests/';
const members = [
  {path: 'fixture-engine.js', bytes: Buffer.from('export default () => 42;\n')},
  {path: 'fixture-engine.wasm', bytes: Buffer.from([0, 97, 115, 109, 1, 0, 0, 0])},
];
const raw = Buffer.concat(members.map(member => member.bytes));
// Exercise the actual distribution codec, including Python's XZ encoder and
// the helper's independent Python decoder, without compiling or running a game.
const encoded = spawnSync('python', ['-c', 'import lzma,sys;sys.stdout.buffer.write(lzma.compress(sys.stdin.buffer.read(),format=lzma.FORMAT_XZ))'],
  {input: raw, maxBuffer: 1024 * 1024, timeout: 10000});
assert.equal(encoded.status, 0, encoded.error?.message || encoded.stderr?.toString());
const packed = encoded.stdout;
let offset = 0;
const inventory = {
  format: 'pvz-native-artifacts-xz-v1',
  rawBytes: raw.length, rawSha256: sha(raw),
  packedBytes: packed.length, packedSha256: sha(packed),
  files: members.map(member => {
    const file = {path: member.path, offset, bytes: member.bytes.length, sha256: sha(member.bytes)};
    offset += member.bytes.length;
    return file;
  }),
};

function makeZip(index = structuredClone(inventory), bytes = packed) {
  const zip = new JSZip();
  zip.file(folder + 'native-artifacts.json', JSON.stringify(index));
  zip.file(folder + 'native-artifacts.xz', bytes);
  return zip;
}

test('round trip restores exact JavaScript and valid WASM through a serialized ZIP', async () => {
  const zip = await JSZip.loadAsync(await makeZip().generateAsync({type: 'nodebuffer'}), {checkCRC32: true});
  assert.deepEqual(await restoreNativeArtifactPack(zip, prefix), members.map(member => member.path));
  for (const member of members)
    assert.deepEqual(Buffer.from(await zip.file(folder + member.path).async('uint8array')), member.bytes);
  assert(WebAssembly.validate(await zip.file(folder + 'fixture-engine.wasm').async('uint8array')));
});

test('an unpacked archive without an index is left unchanged', async () => {
  const zip = new JSZip();
  zip.file(folder + members[0].path, members[0].bytes);
  const names = Object.keys(zip.files);
  assert.deepEqual(await restoreNativeArtifactPack(zip, prefix), []);
  assert.deepEqual(Object.keys(zip.files), names);
  assert.deepEqual(Buffer.from(await zip.file(folder + members[0].path).async('uint8array')), members[0].bytes);
});

const invalidInventories = [
  ['compressed hash mismatch', index => { index.packedSha256 = '0'.repeat(64); }],
  ['raw hash mismatch after decompression', index => { index.rawSha256 = '0'.repeat(64); }],
  ['first member hash mismatch', index => { index.files[0].sha256 = '0'.repeat(64); }],
  ['last member hash mismatch', index => { index.files[1].sha256 = '0'.repeat(64); }],
  ['duplicate member paths', index => { index.files[1].path = index.files[0].path; }],
  ['parent path traversal', index => { index.files[0].path = '../fixture-engine.js'; }],
  ['absolute member path', index => { index.files[0].path = '/fixture-engine.js'; }],
  ['nested member path', index => { index.files[0].path = 'nested/fixture-engine.js'; }],
  ['Windows member path', index => { index.files[0].path = 'C:\\fixture-engine.js'; }],
  ['unexpected member extension', index => { index.files[0].path = 'fixture-engine.dll'; }],
  ['nonzero first offset', index => { index.files[0].offset = 1; }],
  ['gap between members', index => { index.files[1].offset++; }],
  ['overlapping members', index => { index.files[1].offset--; }],
  ['unclaimed raw tail', index => { index.files[1].bytes--; }],
  ['declared decoded length mismatch', index => { index.rawBytes++; index.files[1].bytes++; }],
  ['declared compressed length mismatch', index => { index.packedBytes++; }],
  ['zero raw length', index => { index.rawBytes = 0; }],
  ['negative raw length', index => { index.rawBytes = -1; }],
  ['fractional raw length', index => { index.rawBytes = 1.5; }],
  ['raw size above 256 MiB limit', index => { index.rawBytes = 256 * 1024 * 1024 + 1; }],
  ['zero compressed length', index => { index.packedBytes = 0; }],
  ['fractional compressed length', index => { index.packedBytes = 1.5; }],
  ['compressed size above 64 MiB limit', index => { index.packedBytes = 64 * 1024 * 1024 + 1; }],
  ['zero member length', index => { index.files[0].bytes = 0; }],
  ['negative member length', index => { index.files[0].bytes = -1; }],
  ['fractional member length', index => { index.files[0].bytes = 1.5; }],
  ['member outside raw bounds', index => { index.files[0].bytes = index.rawBytes + 1; }],
  ['empty member inventory', index => { index.files = []; }],
  ['more than 80 members', index => { index.files = Array.from({length: 81}, () => ({...index.files[0]})); }],
];
for (const [name, mutate] of invalidInventories) {
  test('rejects ' + name, async () => {
    const index = structuredClone(inventory);
    mutate(index);
    await assert.rejects(restoreNativeArtifactPack(makeZip(index), prefix), {code: 'ERR_ASSERTION'});
  });
}

test('rejects changed compressed bytes before decoding', async () => {
  const damaged = Buffer.from(packed);
  damaged[Math.floor(damaged.length / 2)] ^= 1;
  await assert.rejects(restoreNativeArtifactPack(makeZip(structuredClone(inventory), damaged), prefix), {code: 'ERR_ASSERTION'});
});

test('rejects corrupt XZ even when its declared hash matches', async () => {
  const damaged = Buffer.alloc(packed.length), index = structuredClone(inventory);
  index.packedSha256 = sha(damaged);
  await assert.rejects(restoreNativeArtifactPack(makeZip(index, damaged), prefix), {code: 'ERR_ASSERTION'});
});

test('rejects a pack member that conflicts with an existing executable', async () => {
  const zip = makeZip();
  zip.file(folder + members[0].path, members[0].bytes);
  await assert.rejects(restoreNativeArtifactPack(zip, prefix), /Duplicate or conflicting executable/);
});

test('rejects an index without its compressed pack', async () => {
  const zip = makeZip();
  zip.remove(folder + 'native-artifacts.xz');
  await assert.rejects(restoreNativeArtifactPack(zip, prefix), {code: 'ERR_ASSERTION'});
});

// Actual CI regression: temporary resource paths change raw log bytes while
// the complete reviewed native observations stay identical. No game executes.
let sealedDouble;
function sealedDoubleEvidence() {
  sealedDouble ??= (async () => {
    const engineUrl = new URL('../dist/game/engine-provenance.json', import.meta.url);
    const engine = JSON.parse(fs.readFileSync(engineUrl, 'utf8'));
    assert.equal(engine.id, '0.2.6-web-double.1');
    assert.equal(engine.artifacts.source, '../source/pvz-portable-0.2.6-web-double.1-source.zip');
    const archiveBytes = fs.readFileSync(new URL(engine.artifacts.source, engineUrl));
    assert.equal(sha(archiveBytes), engine.artifacts.sourceSha256);
    const zip = await JSZip.loadAsync(archiveBytes);
    const entry = zip.file('double1-candidate/tests/double-agent-results.json');
    assert(entry);
    const bytes = Buffer.from(await entry.async('uint8array'));
    assert.equal(sha(bytes), '185ddbaae03ac20287552b9276064a800b1447d4a8d6cefdd58c9cc3a7e2d55c');
    return {bytes, report: JSON.parse(bytes), zip};
  })();
  return sealedDouble;
}

test('actual sealed Double matrix retains its exact published report identity', async () => {
  const {bytes, report} = await sealedDoubleEvidence();
  assert.equal(report.scenarios.length, 52);
  const verified = verifyDoubleAgentReportIdentity({reportBytes: bytes, sha});
  assert.equal(verified.sealedReport, true);
  assert.deepEqual(verified.report, report);
});

test('fresh Double evidence permits only valid direct scenario log digests to differ', async () => {
  const {report} = await sealedDoubleEvidence();
  const fresh = structuredClone(report);
  fresh.scenarios.forEach((row, index) => { row.logSha256 = sha(Buffer.from('synthetic fresh resource path/' + index)); });
  const verified = verifyDoubleAgentReportIdentity({reportBytes: Buffer.from(JSON.stringify(fresh)), sha});
  assert.equal(verified.sealedReport, false);
  assert.deepEqual(verified.report, fresh);
});

const alteredDoubleReports = [
  ['gameplay observation', report => { report.scenarios[0].profileCredits++; }],
  ['native check count', report => { report.scenarios[0].checks++; }],
  ['missing matrix case', report => { report.scenarios.pop(); }],
  ['reordered matrix cases', report => { [report.scenarios[0], report.scenarios[1]] = [report.scenarios[1], report.scenarios[0]]; }],
  ['nested log digest', report => { report.scenarios[0].checkpoint.logSha256 = '0'.repeat(64); }],
  ['unreviewed environment field', report => { report.environmentAllowance = '/tmp/new-source'; }],
  ['malformed log digest', report => { report.scenarios[0].logSha256 = 'not-a-sha256'; }],
  ['missing log digest', report => { delete report.scenarios[0].logSha256; }],
];
for (const [name, mutate] of alteredDoubleReports) {
  test('rejects changed Double report ' + name, async () => {
    const {report} = await sealedDoubleEvidence();
    const changed = structuredClone(report);
    mutate(changed);
    assert.throws(() => verifyDoubleAgentReportIdentity({reportBytes: Buffer.from(JSON.stringify(changed)), sha}), {code: 'ERR_ASSERTION'});
  });
}

test('fresh log hash cannot hide an omitted actual native result field', async () => {
  const {report, zip} = await sealedDoubleEvidence();
  const row = report.scenarios[0];
  const name = `tests/double-agent-logs/${row.name}-${row.speed}x-${row.seed}.log`;
  const bytes = Buffer.from(await zip.file('double1-candidate/' + name).async('uint8array'));
  await verifyDoubleAgentCaseLog(row, {read: async path => { assert.equal(path, name); return bytes; }, sha});
  const marker = 'DOUBLE_AGENT_RESULT ';
  const raw = bytes.toString('utf8');
  const records = raw.split(/\r?\n/).filter(line => line.startsWith(marker));
  assert.equal(records.length, 1);
  const observation = JSON.parse(records[0].slice(marker.length));
  assert(Object.hasOwn(observation, 'profileCredits'));
  delete observation.profileCredits;
  const damaged = Buffer.from(raw.replace(records[0], marker + JSON.stringify(observation)));
  await assert.rejects(verifyDoubleAgentCaseLog({...row, logSha256: sha(damaged)},
    {read: async path => { assert.equal(path, name); return damaged; }, sha}), {code: 'ERR_ASSERTION'});
});
