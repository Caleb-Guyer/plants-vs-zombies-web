"""Exact historical ZIP transport controls; no game, audio or network starts."""
from pathlib import Path
import copy
import hashlib
import importlib.util
import io
import json
import lzma
import os
import shutil
import subprocess
import tempfile
import unittest
from unittest import mock
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('source_bundle_codec', ROOT / 'source-bundle.py')
codec = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(codec)
CHAIN_SPEC = importlib.util.spec_from_file_location('native_release_chain', ROOT / 'native_release_chain.py')
chain = importlib.util.module_from_spec(CHAIN_SPEC)
CHAIN_SPEC.loader.exec_module(chain)
OLD = 'dist/source/pvz-portable-0.2.6-web-endless.2-source.zip'
ENGINE = json.loads((ROOT / 'dist/game/engine-provenance.json').read_text('utf-8'))
BASE = 'dist/source/' + Path(ENGINE['artifacts']['source']).name
INDEX = 'source-transports/endless2.json'
LITERALS = 'source-transports/endless2.literals'
OLD_SHA = 'b9095c65547c3d013917ae4188e284f18eabb71a98020ca3d53f71f7365f9566'
BASE_SHA = ENGINE['artifacts']['sourceSha256']
CURRENT_INDEX = 'source-transports/current.json'
CURRENT_PAYLOAD = 'source-transports/current.xz'
sha = lambda data: hashlib.sha256(data).hexdigest()


class HistoricalBrowserTests(unittest.TestCase):
    def test_pool_delta_restores_insertions_and_rejects_invalid_ranges_or_digest(self):
        base = b''.join(hashlib.sha256(bytes([i])).digest() for i in range(128))
        original = base[3:1700] + b'original function body' + base[1900:] + b'tail'
        delta = chain._encode_delta(base, original)
        self.assertEqual(chain._restore_delta(base, delta), original)
        for damaged in (delta[:-1], delta + b'tail', delta[:4] + b'\xff\xff\xff\x7f' + delta[8:]):
            with self.assertRaises(ValueError):
                chain._restore_delta(base, damaged)
        with tempfile.TemporaryDirectory() as path:
            root = Path(path)
            name = 'pvz-portable.wasm'
            packed = chain.pack_browsers(root, {'zsnight/' + name: original}, {name: base})
            self.assertEqual(chain.read_browser(root, 'zsnight', name, sha(original), packed, base), original)
            with self.assertRaises(ValueError):
                chain.read_browser(root, 'zsnight', name, '0' * 64, packed, base)
            with self.assertRaises(ValueError):
                chain.read_browser(root, 'zsnight', name, sha(original), '0' * 64, base)

    def test_standalone_bundle_keeps_each_ancestor_suffix_and_one_browser_capsule(self):
        spec = importlib.util.spec_from_file_location('source_packager', ROOT / 'package-portable.py')
        packager = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(packager)
        roof_parents = (chain.BEGHOUL, chain.NIGHT, chain.POOL, chain.FOG)
        for release, parents in ((chain.ROOF, roof_parents), (chain.BOWLING, roof_parents + (chain.ROOF,)),
                                 (chain.PINS, roof_parents + (chain.ROOF, chain.BOWLING)),
                                 (chain.WHACK, roof_parents + (chain.ROOF, chain.BOWLING, chain.PINS)),
                                 (chain.TWIST, roof_parents + (chain.ROOF, chain.BOWLING, chain.PINS, chain.WHACK)),
                                 (chain.FINAL, roof_parents + (chain.ROOF, chain.BOWLING, chain.PINS, chain.WHACK, chain.TWIST)),
                                 (chain.BOWLING_TAB, roof_parents + (chain.ROOF, chain.BOWLING, chain.PINS, chain.WHACK, chain.TWIST, chain.FINAL))):
            with self.subTest(release=release), tempfile.TemporaryDirectory() as folder:
                root = Path(folder)
                expected = {root / chain.DELTA_CAPSULES[release]}
                history = root / chain.HISTORY
                history.mkdir(parents=True)
                for archive in (chain.BROWSERS, *chain.DELTA_CAPSULES.values()):
                    (root / archive).touch()
                engine = {'id': chain.I_ZOMBOTANY}
                for parent_id in parents:
                    engine = {'id': parent_id, 'parent': engine}
                    key = parent_id.removeprefix('0.2.6-web-').removesuffix('.1')
                    raw = history / (key + '1-published') / 'source-suffix.bin'
                    raw.parent.mkdir()
                    raw.touch()
                    raw.with_suffix('.xz').touch()
                    expected.add(raw.with_suffix('.xz'))
                engine = {'id': release, 'parent': engine}
                with mock.patch.object(packager, 'ROOT', root), mock.patch.object(packager, 'REQUIRED_ROOT', ()), \
                        mock.patch.object(packager, 'engine_inputs', return_value=(engine, {}, None)):
                    self.assertEqual(set(packager.root_sources()), expected)
                    (root / chain.ARCHIVE_PARENTS[release][3]).unlink()
                    with self.assertRaisesRegex(ValueError, 'Missing compact source suffix for ' + key):
                        packager.root_sources()


class HistoricalSourceSuffixTests(unittest.TestCase):
    def test_rejects_a_skipped_release_or_a_different_source_base(self):
        for child_id, parent_id, base in ((chain.BOWLING, chain.FOG, chain.SHARED_BASE), (chain.BOWLING, chain.ROOF, {}),
                                          (chain.PINS, chain.ROOF, chain.SHARED_BASE), (chain.PINS, chain.BOWLING, {}),
                                          (chain.WHACK, chain.BOWLING, chain.SHARED_BASE), (chain.WHACK, chain.PINS, {}),
                                          (chain.TWIST, chain.PINS, chain.SHARED_BASE), (chain.TWIST, chain.WHACK, {}),
                                          (chain.FINAL, chain.WHACK, chain.SHARED_BASE), (chain.FINAL, chain.TWIST, {}),
                                          (chain.BOWLING_TAB, chain.TWIST, chain.SHARED_BASE), (chain.BOWLING_TAB, chain.FINAL, {})):
            engine = {'id': child_id, 'sourceArchiveBase': base,
                      'parent': {'id': parent_id, 'sourceArchiveBase': chain.SHARED_BASE}}
            with self.subTest(parent=parent_id), tempfile.TemporaryDirectory() as folder:
                root = Path(folder)
                provenance = root / codec.ENGINE_REL
                provenance.parent.mkdir(parents=True)
                provenance.write_text(json.dumps(engine), encoding='utf-8')
                with self.assertRaisesRegex(codec.SourceBundleError, 'Unexpected ZomBotany archive parent'):
                    codec.ensure_vasebreaker_baseline(root)
                with self.assertRaisesRegex(ValueError, 'Unexpected ZomBotany archive ancestry'):
                    chain.parent_source(root, engine, b'')

    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.path = Path(directory.name) / 'source-suffix.xz'
        base_driver = b''.join(hashlib.sha256(bytes([i])).digest() for i in range(128))
        self.original = base_driver[13:2000] + b'historical driver' + base_driver[2057:]
        self.delta = chain._encode_delta(base_driver, self.original)
        archive_bytes = io.BytesIO()
        with zipfile.ZipFile(archive_bytes, 'w') as archive:
            archive.writestr(chain.ZIP_ROOT + 'i-zombotany-engine.wasm', base_driver)
        self.base = archive_bytes.getvalue()
        self.compressed = chain._portable_deflate(self.original)
        self.before, self.after = b'retained local header', b'retained footer and central directory'
        self.expected = self.before + self.compressed + self.after
        self.header = chain.SUFFIX_HEADER.pack(b'PVS1', len(self.before), len(self.compressed),
                                              hashlib.sha256(self.compressed).digest())
        self.record = self.header + self.before + self.after + self.delta

    def encode(self, data):
        return lzma.compress(data, format=lzma.FORMAT_XZ, check=lzma.CHECK_CRC64)

    def restore(self, data):
        self.path.write_bytes(data)
        return chain._restore_suffix(self.base, self.path, len(self.expected))

    def test_physical_zip_stream_and_host_encoder_fallback(self):
        packed = self.encode(self.record)
        self.assertEqual(self.restore(packed), self.expected)
        with mock.patch.object(chain.zlib, 'compressobj') as encoder:
            encoder.return_value.compress.return_value = b'another implementation'
            encoder.return_value.flush.return_value = b''
            with mock.patch.object(chain, '_portable_deflate', wraps=chain._portable_deflate) as portable:
                self.assertEqual(self.restore(packed), self.expected)
                portable.assert_called_once_with(self.original, 9)

    def test_rejects_invalid_stream_span_delta_or_compressed_digest(self):
        valid = self.encode(self.record)
        wrong_span = chain.SUFFIX_HEADER.pack(b'PVS1', len(self.expected), len(self.compressed),
                                              hashlib.sha256(self.compressed).digest())
        wrong_digest = self.header[:-1] + bytes([self.header[-1] ^ 1])
        body = self.record[len(self.header):]
        for label, damaged in (
            ('truncated stream', valid[:-1]), ('trailing data', valid + b'x'),
            ('concatenated streams', valid + valid),
            ('missing checksum', lzma.compress(self.record, check=lzma.CHECK_NONE)),
            ('out-of-bounds span', self.encode(wrong_span + body)),
            ('truncated delta', self.encode(self.record[:-1])),
            ('wrong compressed digest', self.encode(wrong_digest + body)),
        ):
            with self.subTest(label=label), self.assertRaises(ValueError):
                self.restore(damaged)


class SolidLiteralDriverTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        source = io.BytesIO()
        with zipfile.ZipFile(source, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
            archive.writestr('tests/first-engine.wasm', b'abcd' * 500)
            archive.writestr('readme', b'between the drivers')
            archive.writestr('tests/second-engine.wasm', b'abcd' * 400 + b'bcd' * 100)
        cls.original = source.getvalue()
        cls.expected = {'bytes': len(cls.original), 'sha256': sha(cls.original)}
        cls.packed = codec.pack_driver_literals(cls.original, cls.original)
        cls.filtered = lzma.decompress(cls.packed)

    def test_restores_each_compressed_stream_and_accepts_old_plain_xz(self):
        self.assertEqual(codec.DRIVER_HEADER.unpack_from(self.filtered), (codec.DRIVER_MAGIC, 2))
        self.assertEqual(codec.decode_packed_literals(self.packed, self.expected), self.original)
        self.assertEqual(codec.decode_packed_literals(lzma.compress(self.original), self.expected), self.original)

    def test_portable_level_six_recreates_both_original_deflate_streams(self):
        driver = codec._driver_codec()
        with mock.patch.object(codec, '_driver_codec', return_value=driver), \
                mock.patch.object(driver.zlib, 'compressobj') as native, \
                mock.patch.object(driver, '_portable_deflate', wraps=driver._portable_deflate) as portable:
            native.return_value.compress.return_value = b'different bitstream'
            native.return_value.flush.return_value = b''
            self.assertEqual(codec.decode_packed_literals(self.packed, self.expected), self.original)
            self.assertEqual([call.args[1] for call in portable.call_args_list], [6, 6])

    def test_rejects_changed_bounds_stream_digest_and_trailing_data(self):
        start = codec.DRIVER_HEADER.size
        offset, packed, raw, digest = codec.DRIVER_SPAN.unpack_from(self.filtered, start)
        following = self.filtered[start + codec.DRIVER_SPAN.size:]
        bad_rows = ((offset, packed, 32 * 1024 * 1024, digest), (len(self.original), packed, raw, digest),
                    (offset, packed, raw, bytes(32)))
        damaged = [lzma.compress(self.filtered[:start] + codec.DRIVER_SPAN.pack(*row) + following) for row in bad_rows]
        damaged += [lzma.compress(self.filtered[0:5]), lzma.compress(self.filtered[:-1]), self.packed + self.packed,
                    lzma.compress(self.filtered, check=lzma.CHECK_NONE)]
        for data in damaged:
            with self.subTest(size=len(data)), self.assertRaises(codec.SourceBundleError):
                codec.decode_packed_literals(data, self.expected)


class SourceBundle(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # In an extracted source bundle this restores the exact archive first;
        # the full repository/runtime continues to use its existing original.
        codec.ensure_source_archive(ROOT)
        cls.original = (ROOT / OLD).read_bytes()
        cls.base = (ROOT / BASE).read_bytes()
        assert len(cls.original) == 40424282 and sha(cls.original) == OLD_SHA
        assert sha(cls.base) == BASE_SHA
        cls.transport = codec.make_source_transport(ROOT)
        assert set(cls.transport) == {INDEX, LITERALS}
        cls.manifest_bytes = cls.transport[INDEX]
        cls.literals = cls.transport[LITERALS]
        cls.manifest = json.loads(cls.manifest_bytes)
        cls.current_transport = codec.make_current_transport(ROOT)
        cls.current_manifest_bytes = cls.current_transport[CURRENT_INDEX]
        cls.current_payload = cls.current_transport[CURRENT_PAYLOAD]
        cls.current_manifest = json.loads(cls.current_manifest_bytes)

    def temporary(self):
        temporary = tempfile.TemporaryDirectory(prefix='pvz-source-bundle-')
        self.addCleanup(temporary.cleanup)
        root = Path(temporary.name).resolve()
        self.assertTrue(root.name.startswith('pvz-source-bundle-'))
        return root

    def stage(self, root, with_transport=True, with_donor=True):
        donor = root / BASE
        donor.parent.mkdir(parents=True)
        if with_donor:
            shutil.copyfile(ROOT / BASE, donor)
        metadata = root / 'dist/game/engine-provenance.json'
        metadata.parent.mkdir()
        shutil.copyfile(ROOT / 'dist/game/engine-provenance.json', metadata)
        if with_transport:
            for name, data in self.transport.items():
                target = root / name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(data)

    def decode(self, manifest=None, literals=None, donor=None):
        data = self.manifest_bytes if manifest is None else json.dumps(manifest).encode('utf-8')
        return codec.decode_source_transport(data,
            self.literals if literals is None else literals,
            self.base if donor is None else donor)

    def current_decode(self, manifest=None, payload=None, **kwargs):
        data = self.current_manifest_bytes if manifest is None else json.dumps(manifest).encode('utf-8')
        return codec.decode_current_transport(data,
            self.current_payload if payload is None else payload,
            expected_target_path=BASE, expected_target_sha256=BASE_SHA,
            expected_target_bytes=len(self.base), **kwargs)

    def stage_current(self, root, with_old=False):
        self.stage(root, with_donor=False)
        for name, data in self.current_transport.items():
            target = root / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
        if with_old:
            (root / OLD).write_bytes(self.original)

    def tiny_current(self, output=b'PK\x03\x04tiny-native-zip', *, declared_bytes=None, payload=None):
        encoded = lzma.compress(output, format=lzma.FORMAT_XZ, check=lzma.CHECK_CRC64) if payload is None else payload
        manifest = {'format': codec.CURRENT_FORMAT,
                    'target': {'path': BASE, 'bytes': len(output) if declared_bytes is None else declared_bytes,
                               'sha256': sha(output)},
                    'payload': {'path': CURRENT_PAYLOAD, 'bytes': len(encoded), 'sha256': sha(encoded)}}
        return json.dumps(manifest).encode(), encoded, output

    def test_exact_whole_archive_and_every_original_member(self):
        self.assertEqual(self.manifest['format'], 'pvz-exact-zip-reference-v1')
        self.assertEqual(self.manifest['target'], {'path': OLD, 'bytes': 40424282, 'sha256': OLD_SHA})
        self.assertEqual(self.manifest['donor'], {'path': BASE, 'bytes': len(self.base), 'sha256': BASE_SHA})
        self.assertEqual(self.manifest['literals'], {'path': LITERALS, 'bytes': len(self.literals), 'sha256': sha(self.literals)})
        self.assertGreater(sum(s['bytes'] for s in self.manifest['segments'] if s['kind'] == 'donor'), 10 * 1024 * 1024)
        restored = self.decode()
        self.assertEqual(restored, self.original)
        self.assertEqual(len(restored), 40424282)
        self.assertEqual(sha(restored), OLD_SHA)
        with zipfile.ZipFile(io.BytesIO(self.original)) as old, zipfile.ZipFile(io.BytesIO(restored)) as new:
            self.assertEqual(len(old.infolist()), 1076)
            self.assertEqual(old.namelist(), new.namelist())
            self.assertEqual(new.testzip(), None)
            for item in old.infolist():
                self.assertEqual(old.read(item.filename), new.read(item.filename), item.filename)
            snapshot = json.loads(old.read('endless2-candidate/logs/source-before.json'))
            source_names = [n for n in old.namelist() if n.startswith('endless2-candidate/source/')]
            self.assertEqual(len(source_names), 852)
            self.assertEqual(set(snapshot), {n.removeprefix('endless2-candidate/source/') for n in source_names})
            for name, pin in snapshot.items():
                path = 'endless2-candidate/source/' + name
                data = new.read(path)
                self.assertEqual(len(data), old.getinfo(path).file_size, name)
                self.assertEqual(sha(data), pin, name)

    def test_manifest_paths_sizes_types_and_coverage_rejected(self):
        mutations = [
            ('unknown format', lambda m: m.update(format='untrusted-v2')),
            ('unexpected schema field', lambda m: m.update(escape='../outside')),
            ('target parent traversal', lambda m: m['target'].update(path='../outside.zip')),
            ('target absolute path', lambda m: m['target'].update(path='/outside.zip')),
            ('target Windows path', lambda m: m['target'].update(path='C:\\outside.zip')),
            ('donor parent traversal', lambda m: m['donor'].update(path='../donor.zip')),
            ('literal parent traversal', lambda m: m['literals'].update(path='../payload')),
            ('wrong final target hash', lambda m: m['target'].update(sha256='0' * 64)),
            ('wrong final target length', lambda m: m['target'].update(bytes=40424283)),
            ('wrong donor length', lambda m: m['donor'].update(bytes=len(self.base) + 1)),
            ('wrong donor hash', lambda m: m['donor'].update(sha256='0' * 64)),
            ('wrong literal length', lambda m: m['literals'].update(bytes=len(self.literals) + 1)),
            ('wrong literal hash', lambda m: m['literals'].update(sha256='0' * 64)),
            ('empty coverage', lambda m: m.update(segments=[])),
            ('missing segment', lambda m: m['segments'].pop()),
            ('duplicated segment', lambda m: m['segments'].insert(0, copy.deepcopy(m['segments'][0]))),
            ('reordered segments', lambda m: m['segments'].__setitem__(slice(0, 2), m['segments'][1::-1])),
            ('target gap', lambda m: m['segments'][1].update(targetOffset=m['segments'][1]['targetOffset'] + 1)),
            ('target overlap', lambda m: m['segments'][1].update(targetOffset=m['segments'][1]['targetOffset'] - 1)),
            ('zero segment length', lambda m: m['segments'][0].update(bytes=0)),
            ('negative segment length', lambda m: m['segments'][0].update(bytes=-1)),
            ('fractional segment length', lambda m: m['segments'][0].update(bytes=1.5)),
            ('boolean segment length', lambda m: m['segments'][0].update(bytes=True)),
            ('negative offset', lambda m: m['segments'][0].update(sourceOffset=-1)),
            ('boolean offset', lambda m: m['segments'][0].update(sourceOffset=False)),
            ('unknown stream kind', lambda m: m['segments'][0].update(kind='external-file')),
            ('wrong stream hash', lambda m: m['segments'][0].update(sha256='0' * 64)),
            ('source out of bounds', lambda m: m['segments'][0].update(sourceOffset=len(self.base) + len(self.literals))),
            ('too many segments', lambda m: m.update(segments=[m['segments'][0]] * 4097)),
        ]
        for name, mutate in mutations:
            with self.subTest(name=name):
                manifest = copy.deepcopy(self.manifest)
                mutate(manifest)
                with self.assertRaises(ValueError, msg=name):
                    self.decode(manifest)

    def test_corrupted_donor_and_literal_bytes_rejected(self):
        for kind in ('donor', 'literal'):
            with self.subTest(kind=kind):
                segment = next(s for s in self.manifest['segments'] if s['kind'] == kind)
                data = bytearray(self.base if kind == 'donor' else self.literals)
                data[segment['sourceOffset']] ^= 1
                with self.assertRaises(ValueError):
                    self.decode(donor=bytes(data)) if kind == 'donor' else self.decode(literals=bytes(data))

    def test_forged_stream_hashes_cannot_replace_final_archive_pin(self):
        for kind in ('donor', 'literal'):
            with self.subTest(kind=kind):
                manifest = copy.deepcopy(self.manifest)
                segment = next(s for s in manifest['segments'] if s['kind'] == kind)
                data = bytearray(self.base if kind == 'donor' else self.literals)
                data[segment['sourceOffset']] ^= 1
                manifest['donor' if kind == 'donor' else 'literals']['sha256'] = sha(data)
                start = segment['sourceOffset']
                segment['sha256'] = sha(data[start:start + segment['bytes']])
                with self.assertRaises(ValueError):
                    self.decode(manifest, donor=bytes(data)) if kind == 'donor' else self.decode(manifest, literals=bytes(data))

    def test_unused_literal_tail_and_truncation_rejected(self):
        for data in (self.literals[:-1], self.literals + b'unused tail'):
            with self.subTest(length=len(data)):
                manifest = copy.deepcopy(self.manifest)
                manifest['literals'].update(bytes=len(data), sha256=sha(data))
                with self.assertRaises(ValueError):
                    self.decode(manifest, literals=data)

    def test_full_repository_existing_archive_is_not_rewritten(self):
        target = ROOT / OLD
        before = target.stat()
        codec.ensure_source_archive(ROOT)
        after = target.stat()
        self.assertEqual((before.st_mtime_ns, before.st_ino, before.st_size),
                         (after.st_mtime_ns, after.st_ino, after.st_size))
        self.assertEqual(sha(target.read_bytes()), OLD_SHA)

    def test_missing_archive_restores_atomically_and_is_idempotent(self):
        root = self.temporary()
        self.stage(root)
        target = root / OLD
        self.assertFalse(target.exists())
        codec.ensure_source_archive(root)
        self.assertEqual(target.read_bytes(), self.original)
        before = target.stat()
        codec.ensure_source_archive(root)
        after = target.stat()
        self.assertEqual((before.st_mtime_ns, before.st_ino), (after.st_mtime_ns, after.st_ino))
        self.assertEqual(sorted(p.name for p in target.parent.iterdir()),
                         sorted([Path(BASE).name, Path(OLD).name]))

    def test_javascript_wrapper_bootstraps_direct_entrypoint(self):
        root = self.temporary()
        self.stage(root)
        node = shutil.which('node')
        self.assertTrue(node, 'Node is required by the unchanged offline checks')
        script = 'const {ensureSourceArchive}=await import(process.argv[1]);ensureSourceArchive(process.argv[2]);'
        run = subprocess.run([node, '--input-type=module', '-e', script,
            (ROOT / 'tests/source-bundle.mjs').as_uri(), str(root)],
            capture_output=True, text=True, timeout=60)
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertEqual((root / OLD).read_bytes(), self.original)

    def test_existing_wrong_archive_is_preserved_and_rejected(self):
        root = self.temporary()
        self.stage(root)
        target = root / OLD
        bad = b'existing user file must not be overwritten'
        target.write_bytes(bad)
        with self.assertRaises(ValueError):
            codec.ensure_source_archive(root)
        self.assertEqual(target.read_bytes(), bad)

    def test_racing_existing_file_is_not_overwritten(self):
        root = self.temporary()
        self.stage(root)
        target = root / OLD
        sentinel = b'concurrent user file must not be overwritten'
        operation = 'rename' if os.name == 'nt' else 'link'
        original_publish = getattr(codec.os, operation)
        attempted = []

        def racing_publish(source, destination):
            self.assertEqual(Path(destination), target)
            target.write_bytes(sentinel)
            attempted.append(True)
            return original_publish(source, destination)

        with mock.patch.object(codec.os, operation, side_effect=racing_publish):
            with self.assertRaises(ValueError):
                codec.ensure_source_archive(root)
        self.assertEqual(attempted, [True])
        self.assertEqual(target.read_bytes(), sentinel)
        self.assertEqual(sorted(p.name for p in target.parent.iterdir()),
                         sorted([Path(BASE).name, Path(OLD).name]))

    def test_failed_atomic_publication_leaves_no_partial_archive(self):
        root = self.temporary()
        self.stage(root)
        operation = 'rename' if os.name == 'nt' else 'link'
        with mock.patch.object(codec.os, operation, side_effect=PermissionError('synthetic publish refusal')):
            with self.assertRaises(ValueError):
                codec.ensure_source_archive(root)
        self.assertFalse((root / OLD).exists())
        self.assertEqual([p.name for p in (root / OLD).parent.iterdir()], [Path(BASE).name])

    def test_missing_transport_fails_without_output(self):
        root = self.temporary()
        self.stage(root, with_transport=False)
        with self.assertRaises((ValueError, FileNotFoundError)):
            codec.ensure_source_archive(root)
        self.assertFalse((root / OLD).exists())

    def test_bad_donor_fails_without_output(self):
        root = self.temporary()
        self.stage(root)
        (root / BASE).write_bytes(b'wrong donor archive')
        with self.assertRaises(ValueError):
            codec.ensure_source_archive(root)
        self.assertFalse((root / OLD).exists())

    def test_bad_transport_never_publishes_partial_output(self):
        root = self.temporary()
        self.stage(root)
        (root / LITERALS).write_bytes(b'corrupt transport')
        with self.assertRaises(ValueError):
            codec.ensure_source_archive(root)
        self.assertFalse((root / OLD).exists())
        self.assertEqual([p.name for p in (root / OLD).parent.iterdir()], [Path(BASE).name])

    def test_manifest_target_path_cannot_write_outside_root(self):
        root = self.temporary()
        self.stage(root)
        outside = root.parent / (root.name + '-outside-user-file')
        manifest = copy.deepcopy(self.manifest)
        manifest['target']['path'] = '../' + outside.name
        (root / INDEX).write_text(json.dumps(manifest), encoding='utf-8')
        with self.assertRaises(ValueError):
            codec.ensure_source_archive(root)
        self.assertFalse((root / OLD).exists())
        self.assertFalse(outside.exists())

    def test_target_symlink_is_not_followed_or_replaced(self):
        root = self.temporary()
        self.stage(root)
        external = root / 'outside-user-file'
        external.write_bytes(b'outside data')
        target = root / OLD
        try:
            os.symlink(external, target)
        except (OSError, NotImplementedError) as error:
            self.skipTest('Symlinks unavailable: ' + str(error))
        with self.assertRaises(ValueError):
            codec.ensure_source_archive(root)
        self.assertTrue(target.is_symlink())
        self.assertEqual(external.read_bytes(), b'outside data')

    def test_donor_symlink_is_rejected(self):
        root = self.temporary()
        self.stage(root)
        donor = root / BASE
        donor.unlink()
        try:
            os.symlink(ROOT / BASE, donor)
        except (OSError, NotImplementedError) as error:
            self.skipTest('Symlinks unavailable: ' + str(error))
        with self.assertRaises(ValueError):
            codec.ensure_source_archive(root)
        self.assertTrue(donor.is_symlink())
        self.assertFalse((root / OLD).exists())

    def test_transport_symlink_is_rejected(self):
        root = self.temporary()
        self.stage(root)
        external = root / 'outside-manifest.json'
        external.write_bytes(self.manifest_bytes)
        index = root / INDEX
        index.unlink()
        try:
            os.symlink(external, index)
        except (OSError, NotImplementedError) as error:
            self.skipTest('Symlinks unavailable: ' + str(error))
        with self.assertRaises(ValueError):
            codec.ensure_source_archive(root)
        self.assertTrue(index.is_symlink())
        self.assertFalse((root / OLD).exists())

    def test_root_symlink_is_not_resolved_away_by_wrapper(self):
        root = self.temporary()
        actual = root / 'actual'
        actual.mkdir()
        self.stage(actual)
        link = root / 'linked-root'
        try:
            os.symlink(actual, link, target_is_directory=True)
        except (OSError, NotImplementedError) as error:
            self.skipTest('Symlinks unavailable: ' + str(error))
        with self.assertRaises(ValueError):
            codec.ensure_source_archive(link)
        node = shutil.which('node')
        self.assertTrue(node)
        script = 'const {ensureSourceArchive}=await import(process.argv[1]);ensureSourceArchive(process.argv[2]);'
        run = subprocess.run([node, '--input-type=module', '-e', script,
            (ROOT / 'tests/source-bundle.mjs').as_uri(), str(link)],
            capture_output=True, text=True, timeout=60)
        self.assertNotEqual(run.returncode, 0)
        self.assertFalse((actual / OLD).exists())

    def test_current_exact_zip_size_digest_and_original_fixture_bytes(self):
        self.assertEqual(set(self.current_transport), {CURRENT_INDEX, CURRENT_PAYLOAD})
        self.assertEqual(self.current_manifest['format'], 'pvz-exact-zip-xz-v1')
        self.assertEqual(self.current_manifest['target'], {'path': BASE, 'bytes': len(self.base), 'sha256': BASE_SHA})
        self.assertEqual(self.current_manifest['payload'], {'path': CURRENT_PAYLOAD, 'bytes': len(self.current_payload),
                                                           'sha256': sha(self.current_payload)})
        self.assertLess(len(self.current_payload), len(self.base))
        restored = self.current_decode()
        self.assertEqual(restored, self.base)
        self.assertEqual(sha(restored), BASE_SHA)
        with zipfile.ZipFile(io.BytesIO(self.base)) as old, zipfile.ZipFile(io.BytesIO(restored)) as new:
            self.assertEqual(old.namelist(), new.namelist())
            self.assertEqual(new.testzip(), None)
            for name in ('zombotany3-candidate/logs/source-before.json',
                         'zombotany3-candidate/tests/zombotany3-results.json',
                         'zombotany3-candidate/tests/native-artifacts.json'):
                self.assertEqual(new.read(name), old.read(name))

    def test_combined_builder_has_four_virtual_files_and_preserves_two_file_api(self):
        with mock.patch.object(codec, 'make_source_transport', return_value=self.transport) as historical, \
                mock.patch.object(codec, 'make_current_transport', return_value=self.current_transport) as current:
            combined = codec.make_bundle_transports(ROOT)
        historical.assert_called_once_with(ROOT)
        current.assert_called_once_with(ROOT)
        self.assertEqual(set(combined), {INDEX, LITERALS + '.xz', CURRENT_INDEX, CURRENT_PAYLOAD})
        self.assertEqual(self.transport, {INDEX: self.manifest_bytes, LITERALS: self.literals})
        self.assertEqual(combined[INDEX], self.manifest_bytes)
        packed = combined[LITERALS + '.xz']
        self.assertEqual(codec.decode_packed_literals(packed, self.manifest['literals']), self.literals)
        if ENGINE['id'] in (chain.PINS, chain.WHACK, chain.TWIST, chain.FINAL, chain.BOWLING_TAB):
            header = lzma.LZMADecompressor().decompress(packed, max_length=codec.DRIVER_HEADER.size)
            self.assertEqual(codec.DRIVER_HEADER.unpack(header), (codec.DRIVER_MAGIC, 10))
        self.assertEqual({name: combined[name] for name in (CURRENT_INDEX, CURRENT_PAYLOAD)}, self.current_transport)

    def test_current_manifest_paths_sizes_types_and_hashes_rejected(self):
        mutations = [
            ('unknown format', lambda m: m.update(format='untrusted-xz-v2')),
            ('unknown schema field', lambda m: m.update(command='execute')),
            ('target traversal', lambda m: m['target'].update(path='../outside.zip')),
            ('absolute target', lambda m: m['target'].update(path='/outside.zip')),
            ('Windows target', lambda m: m['target'].update(path='C:\\outside.zip')),
            ('different named native target', lambda m: m['target'].update(path='dist/source/other.zip')),
            ('wrong native hash', lambda m: m['target'].update(sha256='0' * 64)),
            ('wrong native size', lambda m: m['target'].update(bytes=len(self.base) + 1)),
            ('zero native size', lambda m: m['target'].update(bytes=0)),
            ('boolean native size', lambda m: m['target'].update(bytes=True)),
            ('oversized output', lambda m: m['target'].update(bytes=codec.MAX_DONOR_BYTES + 1)),
            ('payload traversal', lambda m: m['payload'].update(path='../payload.xz')),
            ('absolute payload', lambda m: m['payload'].update(path='/payload.xz')),
            ('unexpected payload name', lambda m: m['payload'].update(path='source-transports/other.xz')),
            ('wrong payload size', lambda m: m['payload'].update(bytes=len(self.current_payload) + 1)),
            ('wrong payload hash', lambda m: m['payload'].update(sha256='0' * 64)),
            ('negative payload size', lambda m: m['payload'].update(bytes=-1)),
            ('fractional payload size', lambda m: m['payload'].update(bytes=1.5)),
            ('oversized payload', lambda m: m['payload'].update(bytes=codec.MAX_DONOR_BYTES + 1)),
        ]
        for name, mutate in mutations:
            with self.subTest(name=name):
                manifest = copy.deepcopy(self.current_manifest)
                mutate(manifest)
                with self.assertRaises(ValueError):
                    self.current_decode(manifest)

    def test_current_duplicate_json_and_oversized_manifest_rejected(self):
        duplicate = b'{"format":"pvz-exact-zip-xz-v1","format":"pvz-exact-zip-xz-v1"}'
        for data in (duplicate, b'[]', b' ' * (codec.MAX_MANIFEST_BYTES + 1)):
            with self.subTest(length=len(data)):
                with self.assertRaises(ValueError):
                    codec.decode_current_transport(data, self.current_payload,
                        expected_target_path=BASE, expected_target_sha256=BASE_SHA)

    def test_current_corruption_truncation_and_trailing_streams_rejected(self):
        corrupted = bytearray(self.current_payload)
        corrupted[len(corrupted) // 2] ^= 1
        for payload in (bytes(corrupted), self.current_payload[:-1],
                        self.current_payload + b'unused tail',
                        self.current_payload + lzma.compress(b'second stream')):
            with self.subTest(size=len(payload)):
                manifest = copy.deepcopy(self.current_manifest)
                manifest['payload'].update(bytes=len(payload), sha256=sha(payload))
                with self.assertRaises(ValueError):
                    self.current_decode(manifest, payload)

    def test_current_valid_xz_and_resigned_payload_cannot_replace_native_digest(self):
        manifest, _, output = self.tiny_current()
        forged = lzma.compress(b'X' * len(output), format=lzma.FORMAT_XZ, check=lzma.CHECK_CRC64)
        record = json.loads(manifest)
        record['payload'].update(bytes=len(forged), sha256=sha(forged))
        with self.assertRaises(ValueError):
            codec.decode_current_transport(json.dumps(record).encode(), forged,
                expected_target_path=BASE, expected_target_sha256=sha(output), expected_target_bytes=len(output))

    def test_current_decode_has_hard_output_and_memory_limits(self):
        manifest, payload, output = self.tiny_current()
        with mock.patch.object(codec, 'MAX_DONOR_BYTES', 8), \
                mock.patch.object(codec, '_bytes', wraps=codec._bytes) as convert:
            with self.assertRaises(ValueError):
                codec.decode_current_transport(manifest, memoryview(payload),
                    expected_target_path=BASE, expected_target_sha256=sha(output))
        convert.assert_not_called()
        manifest, payload, output = self.tiny_current(b'PK' + b'A' * 4096, declared_bytes=32)
        decoder = mock.Mock(wraps=lzma.LZMADecompressor(format=lzma.FORMAT_XZ,
                                                       memlimit=codec.MAX_CURRENT_MEMORY_BYTES))
        with mock.patch.object(codec.lzma, 'LZMADecompressor', return_value=decoder) as factory:
            with self.assertRaises(ValueError):
                codec.decode_current_transport(manifest, payload,
                    expected_target_path=BASE, expected_target_sha256=sha(output))
        factory.assert_called_once_with(format=lzma.FORMAT_XZ, memlimit=codec.MAX_CURRENT_MEMORY_BYTES)
        self.assertEqual(decoder.decompress.call_args.kwargs['max_length'], 33)
        manifest, payload, output = self.tiny_current()
        for limit in (1, codec.MAX_CURRENT_MEMORY_BYTES + 1, True):
            with self.subTest(memory_limit=limit):
                with self.assertRaises(ValueError):
                    codec.decode_current_transport(manifest, payload, expected_target_path=BASE,
                        expected_target_sha256=sha(output), decoder_memory_limit=limit)

    def test_current_xz_requires_crc64(self):
        output = b'PK\x03\x04tiny-native-zip'
        payload = lzma.compress(output, format=lzma.FORMAT_XZ, check=lzma.CHECK_CRC32)
        manifest, payload, output = self.tiny_current(output, payload=payload)
        with self.assertRaises(ValueError):
            codec.decode_current_transport(manifest, payload, expected_target_path=BASE,
                expected_target_sha256=sha(output))

    def test_current_and_comparator_restore_in_dependency_order(self):
        root = self.temporary()
        self.stage_current(root)
        with mock.patch.object(codec, '_publish_archive', wraps=codec._publish_archive) as publish:
            codec.ensure_source_archive(root)
        self.assertEqual([call.args[1] for call in publish.call_args_list], [BASE, OLD])
        self.assertEqual((root / BASE).read_bytes(), self.base)
        self.assertEqual((root / OLD).read_bytes(), self.original)
        before = {name: (root / name).stat() for name in (BASE, OLD)}
        codec.ensure_source_archive(root)
        for name in (BASE, OLD):
            after = (root / name).stat()
            self.assertEqual((before[name].st_mtime_ns, before[name].st_ino), (after.st_mtime_ns, after.st_ino))
        self.assertEqual(sorted(path.name for path in (root / BASE).parent.iterdir()),
                         sorted([Path(BASE).name, Path(OLD).name]))

    def test_current_restores_even_when_comparator_already_exists(self):
        root = self.temporary()
        self.stage_current(root, with_old=True)
        report = codec.ensure_source_archive(root)
        self.assertEqual(report['status'], 'already-present')
        self.assertEqual((root / BASE).read_bytes(), self.base)
        self.assertEqual((root / OLD).read_bytes(), self.original)

    def test_current_js_bootstrap_restores_before_existing_comparator_fast_path(self):
        root = self.temporary()
        self.stage_current(root, with_old=True)
        node = shutil.which('node')
        self.assertTrue(node)
        script = 'const {ensureSourceArchive}=await import(process.argv[1]);ensureSourceArchive(process.argv[2]);'
        run = subprocess.run([node, '--input-type=module', '-e', script,
            (ROOT / 'tests/source-bundle.mjs').as_uri(), str(root)],
            capture_output=True, text=True, timeout=60)
        self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
        self.assertEqual((root / BASE).read_bytes(), self.base)

    def test_current_wrong_existing_file_is_preserved_and_blocks_comparator(self):
        root = self.temporary()
        self.stage_current(root)
        sentinel = b'existing native source must never be overwritten'
        (root / BASE).write_bytes(sentinel)
        with self.assertRaises(ValueError):
            codec.ensure_source_archive(root)
        self.assertEqual((root / BASE).read_bytes(), sentinel)
        self.assertFalse((root / OLD).exists())

    def test_current_failed_decode_never_attempts_historical_restore(self):
        root = self.temporary()
        self.stage_current(root)
        (root / CURRENT_PAYLOAD).write_bytes(b'corrupted current XZ')
        with mock.patch.object(codec, 'decode_source_transport', wraps=codec.decode_source_transport) as historical:
            with self.assertRaises(ValueError):
                codec.ensure_source_archive(root)
        historical.assert_not_called()
        self.assertFalse((root / BASE).exists())
        self.assertFalse((root / OLD).exists())

    def test_current_racing_existing_file_is_never_clobbered(self):
        root = self.temporary()
        self.stage_current(root)
        target = root / BASE
        sentinel = b'concurrent native source must never be overwritten'
        operation = 'rename' if os.name == 'nt' else 'link'
        original_publish = getattr(codec.os, operation)
        def racing_publish(source, destination):
            self.assertEqual(Path(destination), target)
            target.write_bytes(sentinel)
            return original_publish(source, destination)
        with mock.patch.object(codec.os, operation, side_effect=racing_publish):
            with self.assertRaises(ValueError):
                codec.ensure_source_archive(root)
        self.assertEqual(target.read_bytes(), sentinel)
        self.assertFalse((root / OLD).exists())
        self.assertEqual([path.name for path in target.parent.iterdir()], [Path(BASE).name])

    def test_current_failed_atomic_publication_leaves_no_partial_zip(self):
        root = self.temporary()
        self.stage_current(root)
        operation = 'rename' if os.name == 'nt' else 'link'
        with mock.patch.object(codec.os, operation, side_effect=PermissionError('synthetic native publish refusal')):
            with self.assertRaises(ValueError):
                codec.ensure_source_archive(root)
        self.assertFalse((root / BASE).exists())
        self.assertFalse((root / OLD).exists())
        self.assertEqual(list((root / BASE).parent.iterdir()), [])

    def test_current_payload_symlink_is_rejected(self):
        root = self.temporary()
        self.stage_current(root)
        payload = root / CURRENT_PAYLOAD
        payload.unlink()
        external = root / 'outside-payload.xz'
        external.write_bytes(self.current_payload)
        try:
            os.symlink(external, payload)
        except (OSError, NotImplementedError) as error:
            self.skipTest('Symlinks unavailable: ' + str(error))
        with self.assertRaises(ValueError):
            codec.ensure_source_archive(root)
        self.assertTrue(payload.is_symlink())
        self.assertEqual(external.read_bytes(), self.current_payload)
        self.assertFalse((root / BASE).exists())

    def test_current_engine_reference_cannot_escape_source_directory(self):
        for reference in ('../source/../../outside.zip', '/outside.zip', '../source/C:\\outside.zip',
                          '../source/' + Path(OLD).name):
            with self.subTest(reference=reference):
                root = self.temporary()
                self.stage_current(root)
                engine = copy.deepcopy(ENGINE)
                engine['artifacts']['source'] = reference
                (root / 'dist/game/engine-provenance.json').write_text(json.dumps(engine), encoding='utf-8')
                with self.assertRaises(ValueError):
                    codec.ensure_source_archive(root)
                self.assertFalse((root / BASE).exists())
                self.assertFalse((root / OLD).exists())

    def test_compressed_historical_literals_restore_only_after_integrity_checks(self):
        root = self.temporary()
        self.stage(root)
        (root / LITERALS).unlink()
        transport = root / (LITERALS + ".xz")
        packed = lzma.compress(self.literals, format=lzma.FORMAT_XZ, check=lzma.CHECK_CRC64, preset=1)
        for damaged in (packed[:-1], packed + b"extra"):
            transport.write_bytes(damaged)
            with self.assertRaises(ValueError):
                codec.ensure_source_archive(root)
            self.assertFalse((root / OLD).exists())
        transport.write_bytes(packed)
        self.assertTrue(codec.ensure_source_archive(root)["restored"])
        self.assertEqual((root / OLD).read_bytes(), self.original)

    def test_current_full_repository_archive_is_not_rewritten(self):
        target = ROOT / BASE
        before = target.stat()
        report = codec.ensure_current_archive(ROOT)
        after = target.stat()
        self.assertEqual(report['status'], 'already-present')
        self.assertEqual((before.st_mtime_ns, before.st_ino, before.st_size),
                         (after.st_mtime_ns, after.st_ino, after.st_size))
        self.assertEqual(sha(target.read_bytes()), BASE_SHA)


if __name__ == '__main__':
    unittest.main()
