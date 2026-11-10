"""Copy the current Pages payload while historical source ZIPs stay in GitHub.

The inventory authenticates every source ZIP and its immutable download URL.
Only historical ZIPs are omitted; current source, upstream, site-source and all
other distribution files remain byte-identical. No build or network is used.
"""
from pathlib import Path, PurePosixPath
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit
import argparse
import hashlib
import json
import posixpath
import re
import shutil
import stat
import tarfile

ROOT = Path(__file__).resolve().parent
MAX_TAR_BYTES = 1_000_000_000
HISTORICAL_BASE = 'https://raw.githubusercontent.com/Caleb-Guyer/plants-vs-zombies-web/'
ARCHIVE_NAME = re.compile(r'pvz-portable-[A-Za-z0-9._-]+-source\.zip\Z')


def require(ok, message):
    if not ok:
        raise ValueError(message)


def digest(path):
    value = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            value.update(block)
    return value.hexdigest()


def safe_name(name):
    require(isinstance(name, str) and name and not name.startswith('/') and
            not any(c in name for c in '\\:\0') and
            all(p not in ('', '.', '..') for p in name.split('/')),
            'Unsafe relative path: ' + repr(name))
    return name


def scan(source):
    require(source.is_dir() and not source.is_symlink(), 'Source must be a regular directory')
    files, directories, folded = {}, [], set()
    for path in sorted(source.rglob('*')):
        name = safe_name(path.relative_to(source).as_posix())
        require(name.casefold() not in folded, 'Case-colliding input: ' + name)
        folded.add(name.casefold())
        require(not path.is_symlink(), 'Symlink input: ' + name)
        mode = path.stat().st_mode
        if stat.S_ISDIR(mode):
            directories.append(name)
        else:
            require(stat.S_ISREG(mode), 'Non-regular input: ' + name)
            files[name] = {'bytes': path.stat().st_size, 'sha256': digest(path)}
    return files, directories


def local_reference(base, reference):
    value = urlsplit(reference)
    require(not value.scheme and not value.netloc and not value.path.startswith('/'),
            'Expected a relative local reference: ' + reference)
    return safe_name(posixpath.normpath(posixpath.join(base, unquote(value.path))))


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('href', 'src') and value:
                parsed = urlsplit(value)
                if not parsed.scheme and not parsed.netloc and parsed.path:
                    self.references.append(value)


def tar_bound(files, directories):
    """Padded PAX headers/data plus an extra 2 KiB metadata reserve per entry.

    This also bounds GNU long-name headers used by upload-pages-artifact. The
    final 10 KiB record rounding includes the two end-of-archive zero blocks.
    """
    total = 0
    for name in ['.', *directories, *files]:
        info = tarfile.TarInfo('./' + name)
        info.size = files.get(name, {}).get('bytes', 0)
        if name == '.' or name in directories:
            info.type = tarfile.DIRTYPE
        total += len(info.tobuf(format=tarfile.PAX_FORMAT)) + 2048
        total += (info.size + 511) // 512 * 512
    return (total + 1024 + 10239) // 10240 * 10240


def plan_pages(source, max_tar_bytes=MAX_TAR_BYTES):
    source = Path(source)
    files, directories = scan(source)
    index_path = 'source/source-downloads.json'
    require(index_path in files, 'Missing source download inventory')
    index = json.loads((source / index_path).read_text(encoding='utf-8-sig'))
    require(index['schema_version'] == 1 and isinstance(index['archives'], list), 'Invalid source inventory')
    archives, current, upstream, omitted = {}, [], [], []
    for entry in index['archives']:
        name = entry['name']
        require(isinstance(name, str) and ARCHIVE_NAME.fullmatch(name), 'Unsafe archive inventory name')
        require(name.casefold() not in {n.casefold() for n in archives}, 'Duplicate archive inventory name')
        require(type(entry['current']) is bool and type(entry['upstream']) is bool and
                not (entry['current'] and entry['upstream']), 'Invalid archive role: ' + name)
        relative = 'source/' + name
        require(relative in files, 'Missing inventoried source archive: ' + name)
        require(type(entry['bytes']) is int and entry['bytes'] > 0 and
                re.fullmatch(r'[a-f0-9]{64}', entry['sha256']) and
                files[relative] == {'bytes': entry['bytes'], 'sha256': entry['sha256']},
                'Source archive bytes differ from inventory: ' + name)
        if entry['current'] or entry['upstream']:
            require(entry.get('url') == './' + name, 'Current/upstream download must remain local: ' + name)
            (current if entry['current'] else upstream).append(name)
        else:
            expected = re.escape(HISTORICAL_BASE) + r'[a-f0-9]{40}/dist/source/' + re.escape(name)
            require(re.fullmatch(expected, entry.get('url', '')), 'Historical URL must pin an immutable repository commit: ' + name)
            omitted.append(relative)
        archives[name] = entry
    actual_archives = {PurePosixPath(name).name for name in files
                       if name.startswith('source/') and name.count('/') == 1 and
                       ARCHIVE_NAME.fullmatch(PurePosixPath(name).name)}
    require(set(archives) == actual_archives, 'Inventory must cover every versioned source ZIP')
    require(len(current) == len(upstream) == 1, 'Exactly one current and upstream source archive required')
    require(upstream[0] == 'pvz-portable-' + index['upstream_tag'] + '-source.zip', 'Upstream identity differs')
    retained = {name: pin for name, pin in files.items() if name not in omitted}
    required = {'index.html', 'index-port.html', 'game/VERSION', 'game/pvz-portable.js',
                'game/pvz-portable.wasm', 'game/engine-provenance.json', 'source/site-source.zip',
                'source/build-provenance.json', index_path, 'source/' + current[0],
                'source/' + upstream[0], 'licenses/LGPL-3.0.txt', 'licenses/GPL-3.0.txt'}
    require(required <= retained.keys(), 'Required runtime/source/license input missing')
    engine = json.loads((source / 'game/engine-provenance.json').read_text(encoding='utf-8-sig'))
    require(engine['id'] == index['current_engine'], 'Current engine and inventory differ')
    require(local_reference('game', engine['artifacts']['source']) == 'source/' + current[0] and
            engine['artifacts']['sourceSha256'] == archives[current[0]]['sha256'], 'Current source provenance differs')
    for artifact, key in [('game/pvz-portable.js', 'jsSha256'), ('game/pvz-portable.wasm', 'wasmSha256'),
                          (local_reference('game', engine['artifacts']['patch']), 'patchSha256')]:
        require(artifact in retained and retained[artifact]['sha256'] == engine['artifacts'][key],
                'Current runtime/patch provenance differs: ' + artifact)
    require(local_reference('game', engine['buildRecord']) in retained, 'Build record reference omitted')
    for name in ('index.html', 'index-port.html'):
        parser = Links()
        parser.feed((source / name).read_text(encoding='utf-8-sig'))
        for reference in parser.references:
            require(local_reference('', reference) in retained, 'HTML link would be missing: ' + reference)
    bound = tar_bound(retained, directories)
    require(bound <= max_tar_bytes, f'Pages tar bound {bound} exceeds {max_tar_bytes} bytes')
    return {'files': retained, 'allFiles': files, 'directories': directories,
            'omitted': sorted(omitted), 'tarUpperBoundBytes': bound,
            'bytes': sum(pin['bytes'] for pin in retained.values())}


def stage_pages(source, output, check_only=False, max_tar_bytes=MAX_TAR_BYTES):
    source, output = Path(source), Path(output)
    require(not any(p.is_symlink() for p in [output, *output.parents]), 'Output or ancestor is a symlink')
    resolved_source, resolved_output = source.resolve(), output.resolve()
    require(not resolved_output.is_relative_to(resolved_source) and
            not resolved_source.is_relative_to(resolved_output), 'Output and source must not overlap')
    require(not output.exists() or (output.is_dir() and not any(output.iterdir())), 'Output must be absent or empty')
    plan = plan_pages(source, max_tar_bytes)
    result = {'status': 'PASS checked Pages staging' if check_only else 'PASS staged Pages payload',
              'files': len(plan['files']), 'bytes': plan['bytes'], 'omittedHistoricalSourceZips': plan['omitted'],
              'tarUpperBoundBytes': plan['tarUpperBoundBytes'], 'tarLimitBytes': max_tar_bytes}
    if check_only:
        return result
    output.mkdir(parents=True, exist_ok=True)
    require(not any(output.iterdir()), 'Output changed during validation')
    for name in plan['directories']:
        (output / name).mkdir(parents=True, exist_ok=True)
    for name, pin in plan['files'].items():
        target = output / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source / name, target)
        require(not target.samefile(source / name) and target.stat().st_size == pin['bytes'] and
                digest(target) == pin['sha256'], 'Staged copy differs: ' + name)
    final_files, final_directories = scan(source)
    require(final_files == plan['allFiles'] and final_directories == plan['directories'], 'Distribution changed during staging')
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True, help='New or empty directory outside dist')
    parser.add_argument('--check-only', action='store_true', help='Validate and report without copying')
    args = parser.parse_args()
    print(json.dumps(stage_pages(ROOT / 'dist', args.output, args.check_only), indent=2))


if __name__ == '__main__':
    main()
