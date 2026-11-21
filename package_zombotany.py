"""Package a tested Zombotany Release build and its corresponding native source.

Each ZIP shares an authenticated published prefix. Historical playtest
drivers can be recovered offline from that prefix and the pinned suffix.
The final ZIP directory exposes one version of each source path.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import zipfile
import zlib
import native_release_chain as chain

ROOT = Path(__file__).resolve().parent
DIST = ROOT / 'dist'
PREFIX = 'zombotany3-candidate/'
RELEASES = {
    'izombotany': dict(tag='izombotany1', stem='i-zombotany', parent_tag='zvase1',
        parent='0.2.6-web-zvase.1', parent_bytes=94_720_307, parent_sha='d9d4351181e09f1b0eceacc8203bf4d0bcf46910b7e27027c762b521d8805f2b',
        commit='bba03e481cebbb30fe31b299298ea49a8ebcceea', sources=893, objects=154,
        caption='with I, ZomBotany.', change='Adds three I, ZomBotany puzzles with six playable plant-headed zombies.'),
    'zbeghouled': dict(tag='zbeghouled1', stem='zbeghouled', parent_tag='izombotany1',
        parent='0.2.6-web-izombotany.1', parent_bytes=100_558_183, parent_sha='ab56f8150ddaf8d8985de74afeea2b51c7c09ef800d0f4ba58cd3a270393152c',
        commit='af09a47b8e445d4c7de2f3d80ea5eea1eee35574', sources=895, objects=155,
        caption='with ZomBotany Beghouled.', change='Adds ZomBotany Beghouled, a 50-match night lawn with final volleys and plant-headed zombies.'),
    'zsnight': dict(tag='zsnight1', stem='zsnight', parent_tag='zbeghouled1',
        parent=chain.BEGHOUL, parent_bytes=chain.BEGHOUL_BYTES, parent_sha=chain.BEGHOUL_SHA,
        commit='996f999ee3e73af601446f5da7acfb78a9ed1dcc', sources=895, objects=155,
        caption='with Zombotany Survival: Night.',
        change='Adds the tenth Zombotany card, a five-flag night Survival with spreading graves and mushroom-headed attackers.'),
    'zspool': dict(tag='zspool1', stem='zspool', parent_tag='zsnight1',
        parent=chain.NIGHT, parent_bytes=chain.NIGHT_BYTES, parent_sha=chain.NIGHT_SHA,
        commit='41834c696beb5689d4083bbac7fa5f6154538288', sources=895, objects=155,
        caption='with ZomBotany Survival: Pool.',
        change='Adds the eleventh ZomBotany card, a five-flag pool Survival with plant-headed zombies on land and in the water.'),
    'zsfog': dict(tag='zsfog1', stem='zsfog', parent_tag='zspool1',
        parent=chain.POOL, parent_bytes=chain.POOL_BYTES, parent_sha=chain.POOL_SHA,
        commit='567e85611a91d89324e65707a7f59595a32c281e', sources=895, objects=155,
        caption='with ZomBotany Survival: Fog.',
        change='Adds the twelfth ZomBotany card, a five-flag Survival on the original foggy pool lawn.'),
    'zsroof': dict(tag='zsroof1', stem='zsroof', parent_tag='zsfog1',
        parent=chain.FOG, parent_bytes=chain.FOG_BYTES, parent_sha=chain.FOG_SHA,
        commit='9ab47551c316bbee0674dbf74579d726b576b55a', sources=895, objects=155,
        caption='with ZomBotany Survival: Roof.',
        change='Adds the thirteenth ZomBotany card, a five-flag Survival on the sloped roof with Flower Pots and pult-headed zombies.'),
    'zbowling': dict(tag='zbowling1', stem='zbowling', parent_tag='zsroof1',
        parent=chain.ROOF, parent_bytes=chain.ROOF_BYTES, parent_sha=chain.ROOF_SHA,
        commit='9c6cb6360056c9687337477cd0ec0001d9af0ce9', sources=897, objects=156,
        caption='with ZomBotany Bowling.',
        change='Adds ZomBotany Bowling, the fourteenth ZomBotany card, with Wall-nut bowling against plant-headed zombies.'),
    'zpins': dict(tag='zpins1', stem='zpins', parent_tag='zbowling1',
        parent=chain.BOWLING, parent_bytes=chain.BOWLING_BYTES, parent_sha=chain.BOWLING_SHA,
        commit='db639cbc636d776c7275f61fec68477b9f3aa97d', sources=897, objects=156,
        caption='with ZomBotany Bowling.',
        change='Adds Tall-nut and Pumpkin bowling packets, shielded Wall-nut-heads, Squash interceptors and Ice-shroom-heads to ZomBotany Bowling. Earlier boards retain their original lineup and deliveries.')
}

def sha(data):
    return hashlib.sha256(data).hexdigest()

def encode(value):
    return (json.dumps(value, indent=2, ensure_ascii=False) + '\n').encode('utf-8')

def parent_file(release, name):
    return subprocess.check_output(['git','show',release['commit']+':'+name],cwd=ROOT)

def source_patch(previous, changes):
    with tempfile.TemporaryDirectory(prefix='izombotany-source-') as temp:
        folder=Path(temp)
        for name, data in changes.items():
            new=folder/'new'/name
            new.parent.mkdir(parents=True,exist_ok=True)
            new.write_bytes(data)
            if PREFIX+'source/'+name in previous.NameToInfo:
                old=folder/'old'/name
                old.parent.mkdir(parents=True,exist_ok=True)
                old.write_bytes(previous.read(PREFIX+'source/'+name))
        result=subprocess.run(['git','-c','core.autocrlf=false','diff','--no-index','--binary','--no-renames',
                               '--no-ext-diff','old','new'],cwd=folder,capture_output=True)
        if result.returncode!=1: raise ValueError('Expected a nonempty source patch: '+result.stderr.decode())
        patch=result.stdout.replace(b'a/old/',b'a/').replace(b'b/new/',b'b/').replace(b'a/new/',b'a/')
        # Apply the actual downloadable patch and compare every changed file.
        p=folder/'update.patch'; p.write_bytes(patch)
        subprocess.run(['git','-c','core.autocrlf=false','apply','--binary','--whitespace=nowarn',str(p)],cwd=folder/'old',check=True)
        if any((folder/'old'/name).read_bytes()!=data for name,data in changes.items()):
            raise ValueError('Applying the incremental patch did not reproduce the source')
        return patch

def package(candidate, results, key):
    release = RELEASES[key]
    engine_id = f'0.2.6-web-{key}.1'
    stem, tag = release['stem'], release['tag']
    test_files = (stem+'.cpp', 'headless-app.h', f'build-{key}.py', key+'-run.cjs',
                  f'test-{key}.py', key+'-build.json', stem+'-engine.js', stem+'-engine.wasm')
    for name, expected in chain.REPLAY_FIXTURES.get(key, ()):
        if sha((candidate/'tests'/name).read_bytes()) != expected:
            raise ValueError('Incorrect replay input: ' + name)
        test_files += (name,)
    engine=json.loads(parent_file(release, 'dist/game/engine-provenance.json'))
    assert engine['id']==release['parent'] and engine['artifacts']['sourceSha256']==release['parent_sha']
    parent=DIST/'source'/Path(engine['artifacts']['source']).name
    parent_bytes=parent.read_bytes()
    assert len(parent_bytes)==release['parent_bytes'] and sha(parent_bytes)==release['parent_sha']
    base = chain.shared_base(parent_bytes, engine_id) if engine_id in chain.ARCHIVE_PARENTS else parent_bytes
    normal=json.loads((candidate/'logs/build-result.json').read_bytes())
    src={f.relative_to(candidate/'source').as_posix():f.read_bytes() for f in sorted((candidate/'source').rglob('*')) if f.is_file()}
    source_sha={name:sha(data) for name,data in src.items()}
    linked=json.loads((candidate/'tests'/(key+'-build.json')).read_bytes())
    assert normal['status']=='PASS' and normal['sourceUnchangedDuringBuild'] and normal['sourceFiles']==len(src)==release['sources']
    assert linked['sources']==source_sha and len(linked['productionObjects'])==release['objects'] and linked['normalBuild']==normal['outputs']
    for name, pin in normal['outputs'].items(): assert sha((candidate/name).read_bytes())==pin['sha256']
    for name, pin in {**linked['artifacts'],**linked['driverSources']}.items(): assert sha((candidate/'tests'/name).read_bytes())==pin
    report=json.loads(results.read_bytes())
    assert report['status']=='PASS' and report['driver']==linked['artifacts'] and len(report['cases'])==16
    files={}
    with zipfile.ZipFile(parent) as previous:
        old=json.loads(previous.read(PREFIX+'source-manifest.json'))
        assert old['version']==release['parent'] and old['files'].keys()<=src.keys()
        changes={n:data for n,data in src.items() if old['files'].get(n,{}).get('sha256')!=source_sha[n]}
        patch=source_patch(previous,changes)
    # The incremental patch uses the immediate release. The distribution
    # carries all changes relative to its physical ZIP prefix.
    with zipfile.ZipFile(io.BytesIO(base)) as baseline:
        manifest = json.loads(baseline.read(PREFIX+'source-manifest.json'))['files']
        for name, data in src.items():
            if manifest.get(name, {}).get('sha256') != source_sha[name]:
                files['source/'+name] = data
    for name in ('build-result.json','source-before.json','source-after.json'):
        files['logs/'+name]=(candidate/'logs'/name).read_bytes()
    for name in test_files: files['tests/'+name]=(candidate/'tests'/name).read_bytes()
    files['tests/'+key+'-results.json']=results.read_bytes()
    files['source-manifest.json']=encode({'version':engine_id,'files':{n:{'bytes':len(data),'sha256':source_sha[n],
                                           'crc32':f'{zlib.crc32(data):08x}'} for n,data in src.items()}})
    files['README-'+key+'.md']=(candidate/('README-'+key+'.md')).read_bytes()
    previous_browsers = {}
    for ext in ('js','wasm'):
        binary=parent_file(release, 'dist/game/pvz-portable.'+ext)
        assert sha(binary)==engine['artifacts'][ext+'Sha256']
        if key == 'izombotany':
            files['history/zvase1/pvz-portable.'+ext]=binary
        elif engine_id in chain.ARCHIVE_PARENTS:
            filename = 'pvz-portable.' + ext
            older = engine
            while True:
                older_key = older['id'].removeprefix('0.2.6-web-').removesuffix('.1')
                assert sha(binary) == older['artifacts'][ext + 'Sha256']
                previous_browsers[older_key + '/' + filename] = binary
                if older_key == 'izombotany':
                    break
                binary = parent_file(RELEASES[older_key], 'dist/game/' + filename)
                older = older['parent']
        else:
            # External historical executables keep the standalone full native source below GitHub's file limit.
            history = ROOT / 'tests/fixtures/historical/izombotany1-published'
            history.mkdir(parents=True, exist_ok=True)
            (history / ('pvz-portable.'+ext)).write_bytes(binary)
    if key == 'zbeghouled':
        (history/'build-provenance.json').write_bytes(parent_file(release, 'dist/source/build-provenance.json'))
    if engine_id in chain.ARCHIVE_PARENTS:
        suffix = ROOT / chain.ARCHIVE_PARENTS[engine_id][3]
        suffix.parent.mkdir(parents=True, exist_ok=True)
        if key == 'zsfog':
            # Fog first published compact versions of the earlier source suffixes.
            parent_record = engine
            child = engine_id
            while child in chain.ARCHIVE_PARENTS:
                archive = DIST/'source'/Path(parent_record['artifacts']['source']).name
                chain.pack_source_suffix(ROOT, child, archive.read_bytes())
                child = parent_record['id']
                parent_record = parent_record['parent']
        elif suffix.suffix == '.xz':
            chain.pack_source_suffix(ROOT, engine_id, parent_bytes)
        else:
            suffix.write_bytes(parent_bytes[len(base):])
        (suffix.parent/'build-provenance.json').write_bytes(parent_file(release, 'dist/source/build-provenance.json'))
        bases = None
        if engine_id in chain.DELTA_CAPSULES:
            bases = {name: (candidate/'build'/name).read_bytes() for name in ('pvz-portable.js','pvz-portable.wasm')}
        historic_digest = chain.pack_browsers(ROOT, previous_browsers, bases, chain.DELTA_CAPSULES.get(engine_id))
    archive_name=f'pvz-portable-{engine_id}-source.zip'
    destination=DIST/'source'/archive_name
    with tempfile.TemporaryDirectory(dir=destination.parent) as temp:
        tmp=Path(temp)/archive_name
        tmp.write_bytes(base)
        with zipfile.ZipFile(tmp,'a',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
            # Keep the original directory and EOCD inside the immutable prefix.
            # New/replaced entries plus a single updated central directory follow it.
            archive.start_dir=len(base)
            names={PREFIX+n for n in files}
            archive.filelist[:]=[info for info in archive.filelist if info.filename not in names]
            archive.NameToInfo={info.filename:info for info in archive.filelist}
            for name,data in sorted(files.items()):
                info=zipfile.ZipInfo(PREFIX+name,(1980,1,1,0,0,0))
                info.external_attr=0o100644<<16
                archive.writestr(info,data,compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
        assert tmp.stat().st_size < 100*1024*1024
        with tmp.open('rb') as stream: assert stream.read(len(base))==base
        with zipfile.ZipFile(tmp) as z:
            assert not z.testzip() and len(z.namelist())==len(set(z.namelist()))
            assert all(z.read(PREFIX+'source/'+n)==data for n,data in src.items())
            assert all(z.read(PREFIX+n)==data for n,data in files.items())
            entries=len(z.infolist())
        tmp.replace(destination)
    patch_name=release['parent_tag']+'-to-'+tag+'.patch'
    (DIST/'source'/patch_name).write_bytes(patch)
    outputs=normal['outputs']
    artifacts={'source':'../source/'+archive_name,'sourceSha256':sha(destination.read_bytes()),
               'patch':'../source/'+patch_name,'patchSha256':sha(patch)}
    for ext in ('js','wasm'):
        name='pvz-portable.'+ext
        artifacts[ext+'Sha256']=outputs['build/'+name]['sha256']
        shutil.copyfile(candidate/'build'/name,DIST/'game'/name)
    current={'id':engine_id,'upstream':engine['upstream'],'artifacts':artifacts,'buildRecord':'../source/build-provenance.json',
             'change':release['change'],
             'caption':release['caption'],'gameAssetsIncluded':True,
             'assetManifest':engine['assetManifest'],'assetBundleId':engine['assetBundleId'],
              'parent':engine}
    if engine_id in chain.ARCHIVE_PARENTS:
        current['sourceArchiveBase'] = chain.SHARED_BASE
        assert chain.parent_source(ROOT, current, destination.read_bytes()) == parent_bytes
    else:
        current['parentArchivePrefixBytes'] = len(parent_bytes)
    (DIST/'game/engine-provenance.json').write_bytes(encode(current))
    (DIST/'source/build-provenance.json').write_bytes(encode({'id':engine_id,'parentId':release['parent'],'sourceArchive':{
        'path':archive_name,'sha256':artifacts['sourceSha256'],'bytes':destination.stat().st_size,'entries':entries},
        'incrementalPatch':{'path':patch_name,'sha256':sha(patch),'baseSourceSha256':release['parent_sha']},
        'sourceFiles':len(src),'productionObjects':release['objects'],'normalBuild':normal,'changedSources':sorted(changes),
        'silentGameplayDriver':linked['artifacts'],'gameplayScenarios':len(report['cases'])}))
    fixture={'id':engine_id,'sourceFiles':len(src),'productionObjects':release['objects'],'normalReceiptSha256':sha(files['logs/build-result.json']),
             'reportSha256':sha(results.read_bytes()),'driverBuildSha256':sha(files['tests/'+key+'-build.json']),
             **{key:value for key,value in artifacts.items() if key.endswith('Sha256')}}
    if engine_id in chain.ARCHIVE_PARENTS:
        fixture['historicalBrowserSha256'] = historic_digest
    (ROOT/'tests/fixtures'/(tag+'-release.json')).write_bytes(encode(fixture))
    print(f'{archive_name}: {destination.stat().st_size:,} bytes, {entries} entries, {len(changes)} changed source files')

def main(default_release=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--candidate',type=Path,required=True)
    p.add_argument('--results',type=Path,required=True)
    p.add_argument('--release', choices=RELEASES, default=default_release, required=default_release is None)
    a=p.parse_args()
    package(a.candidate.resolve(),a.results.resolve(),a.release)


if __name__ == "__main__":
    main()
