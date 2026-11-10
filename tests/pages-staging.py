"""Small synthetic Pages staging tests; no engine, network or audio starts."""
from pathlib import Path
import importlib.util
import io
import json
import os
import tempfile
import tarfile
import unittest

SPEC = importlib.util.spec_from_file_location('pages_staging', Path(__file__).resolve().parents[1] / 'stage-pages.py')
pages = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(pages)


class PagesStaging(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='pvz-pages-staging-')
        self.root = Path(self.temporary.name).resolve()
        self.source = self.root / 'dist'
        self.output = self.root / 'pages'
        self.current = 'pvz-portable-0.2.6-web-current-source.zip'
        self.upstream = 'pvz-portable-0.2.6-source.zip'
        self.historical = 'pvz-portable-0.2.6-web-old-source.zip'
        payload = {'index.html': '<script src="./game/pvz-portable.js?v=1"></script><a href="./source/' + self.current + '">source</a><a href="./source/site-source.zip">site</a><a href="./licenses/LGPL-3.0.txt">license</a>',
                   'index-port.html': '<a href="./source/' + self.upstream + '">upstream</a>',
                   'game/pvz-portable.js': 'js', 'game/pvz-portable.wasm': 'wasm', 'game/VERSION': 'current',
                   'source/' + self.current: 'current zip', 'source/' + self.upstream: 'upstream zip',
                   'source/' + self.historical: 'old zip', 'source/site-source.zip': 'self-contained site zip',
                   'source/web-current.patch': 'current patch', 'source/web-old.patch': 'keep historical patches',
                   'source/build-provenance.json': '{}', 'licenses/LGPL-3.0.txt': 'license',
                   'licenses/GPL-3.0.txt': 'license', 'game-assets/data.part': 'unchanged asset', '.nojekyll': ''}
        for name, text in payload.items():
            self.write(name, text)
        self.index = {'schema_version': 1, 'current_engine': 'current', 'upstream_tag': '0.2.6', 'archives': []}
        for name, current, upstream in [(self.current, True, False), (self.upstream, False, True), (self.historical, False, False)]:
            path = self.source / 'source' / name
            self.index['archives'].append({'name': name, 'current': current, 'upstream': upstream,
                'bytes': path.stat().st_size, 'sha256': pages.digest(path),
                'url': './' + name if current or upstream else pages.HISTORICAL_BASE + 'a' * 40 + '/dist/source/' + name})
        self.write_index()
        self.write('game/engine-provenance.json', json.dumps({'id': 'current', 'buildRecord': '../source/build-provenance.json',
            'artifacts': {'source': '../source/' + self.current, 'sourceSha256': pages.digest(self.source / 'source' / self.current),
             'patch': '../source/web-current.patch', 'patchSha256': pages.digest(self.source / 'source/web-current.patch'),
             'jsSha256': pages.digest(self.source / 'game/pvz-portable.js'), 'wasmSha256': pages.digest(self.source / 'game/pvz-portable.wasm')}}))

    def tearDown(self):
        # The only recursive cleanup is this verified, freshly created fixture.
        self.assertEqual(self.source.parent, self.root)
        self.assertTrue(self.root.name.startswith('pvz-pages-staging-'))
        self.temporary.cleanup()

    def write(self, name, text):
        path = self.source / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding='utf-8')

    def write_index(self):
        self.write('source/source-downloads.json', json.dumps(self.index))

    def test_omits_only_historical_zip_and_copies_every_other_byte(self):
        (self.source / 'empty').mkdir()
        result = pages.stage_pages(self.source, self.output)
        self.assertEqual(result['omittedHistoricalSourceZips'], ['source/' + self.historical])
        originals = {p.relative_to(self.source).as_posix(): p for p in self.source.rglob('*') if p.is_file()}
        staged = {p.relative_to(self.output).as_posix(): p for p in self.output.rglob('*') if p.is_file()}
        self.assertEqual(set(staged), set(originals) - {'source/' + self.historical})
        for name, path in staged.items():
            self.assertEqual(path.read_bytes(), originals[name].read_bytes())
            self.assertFalse(path.samefile(originals[name]), name)
        self.assertTrue((self.output / 'empty').is_dir())
        self.assertIn('source/web-old.patch', staged)
        self.assertGreater(result['tarUpperBoundBytes'], result['bytes'])
        archive = io.BytesIO()
        with tarfile.open(fileobj=archive, mode='w', format=tarfile.PAX_FORMAT) as stream:
            stream.add(self.output, arcname='.')
        self.assertLessEqual(len(archive.getvalue()), result['tarUpperBoundBytes'])

    def test_check_only_is_read_only_and_accepts_empty_output(self):
        self.output.mkdir()
        result = pages.stage_pages(self.source, self.output, check_only=True)
        self.assertEqual(list(self.output.iterdir()), [])
        self.assertIn('checked', result['status'])

    def test_tar_limit_rejects_before_output_is_created(self):
        self.write('large.bin', 'x' * 32768)
        with self.assertRaisesRegex(ValueError, 'tar bound'):
            pages.stage_pages(self.source, self.output, max_tar_bytes=32768)
        self.assertFalse(self.output.exists())

    def test_inventory_tampering_fails_before_copy(self):
        for field, value in [('name', '../escape.zip'), ('sha256', '0' * 64),
                             ('url', pages.HISTORICAL_BASE + 'main/dist/source/' + self.historical)]:
            with self.subTest(field=field):
                original = self.index['archives'][2][field]
                self.index['archives'][2][field] = value
                self.write_index()
                with self.assertRaises(ValueError):
                    pages.stage_pages(self.source, self.output)
                self.assertFalse(self.output.exists())
                self.index['archives'][2][field] = original
        self.write_index()

    def test_requires_complete_inventory_and_current_upstream(self):
        historical = self.index['archives'].pop()
        self.write_index()
        with self.assertRaisesRegex(ValueError, 'every versioned'):
            pages.stage_pages(self.source, self.output)
        self.index['archives'].append(historical)
        self.index['archives'][1]['upstream'] = False
        self.index['archives'][1]['url'] = pages.HISTORICAL_BASE + 'a' * 40 + '/dist/source/' + self.upstream
        self.write_index()
        with self.assertRaisesRegex(ValueError, 'Exactly one current and upstream'):
            pages.stage_pages(self.source, self.output)

    def test_refuses_overlap_nonempty_output_and_broken_html_links(self):
        for output in (self.source, self.source / 'child', self.root):
            with self.subTest(output=str(output)), self.assertRaisesRegex(ValueError, 'overlap'):
                pages.stage_pages(self.source, output)
        self.output.mkdir()
        (self.output / 'occupied').write_text('keep')
        with self.assertRaisesRegex(ValueError, 'absent or empty'):
            pages.stage_pages(self.source, self.output)
        self.write('index.html', '<a href="./source/' + self.historical + '">not retained locally</a>')
        with self.assertRaisesRegex(ValueError, 'HTML link'):
            pages.plan_pages(self.source)

    def test_rejects_source_and_output_symlinks(self):
        external = self.root / 'external'
        external.write_text('external')
        link = self.source / 'link'
        try:
            os.symlink(external, link)
        except (OSError, NotImplementedError) as error:
            self.skipTest('Symlinks unavailable: ' + str(error))
        with self.assertRaisesRegex(ValueError, 'Symlink input'):
            pages.stage_pages(self.source, self.output)
        link.unlink()
        os.symlink(self.source, self.output, target_is_directory=True)
        with self.assertRaisesRegex(ValueError, 'symlink'):
            pages.stage_pages(self.source, self.output)


if __name__ == '__main__':
    unittest.main()
