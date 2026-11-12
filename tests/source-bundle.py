"""Exact historical ZIP transport controls; no game, audio or network starts."""
from pathlib import Path
import copy
import hashlib
import importlib.util
import io
import json
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
OLD = 'dist/source/pvz-portable-0.2.6-web-endless.2-source.zip'
BASE = 'dist/source/pvz-portable-0.2.6-web-torch.1-source.zip'
INDEX = 'source-transports/endless2.json'
LITERALS = 'source-transports/endless2.literals'
OLD_SHA = 'b9095c65547c3d013917ae4188e284f18eabb71a98020ca3d53f71f7365f9566'
BASE_SHA = '2e7f7d49093a1aa93d350558b568d2b81b615632b33613631f630a484872b3ba'
sha = lambda data: hashlib.sha256(data).hexdigest()


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

    def temporary(self):
        temporary = tempfile.TemporaryDirectory(prefix='pvz-source-bundle-')
        self.addCleanup(temporary.cleanup)
        root = Path(temporary.name).resolve()
        self.assertTrue(root.name.startswith('pvz-source-bundle-'))
        return root

    def stage(self, root, with_transport=True):
        donor = root / BASE
        donor.parent.mkdir(parents=True)
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


if __name__ == '__main__':
    unittest.main()
