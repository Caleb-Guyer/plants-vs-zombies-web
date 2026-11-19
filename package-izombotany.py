"""Package a tested I, ZomBotany Release build and its corresponding native source.

The previous source ZIP is the unchanged prefix of the new ZIP. Its immutable
test drivers can therefore be recovered offline without a second large download.
The final ZIP directory exposes one version of each source path.
"""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import zipfile
import zlib

ROOT = Path(__file__).resolve().parent
DIST = ROOT / 'dist'
PREFIX = 'zombotany3-candidate/'
PARENT_ID = '0.2.6-web-zvase.1'
ID = '0.2.6-web-izombotany.1'
PARENT_SHA = 'd9d4351181e09f1b0eceacc8203bf4d0bcf46910b7e27027c762b521d8805f2b'
PARENT_COMMIT = 'bba03e481cebbb30fe31b299298ea49a8ebcceea'
TEST_FILES = ('i-zombotany.cpp', 'headless-app.h', 'build-izombotany.py', 'izombotany-run.cjs',
              'test-izombotany.py', 'izombotany-build.json', 'i-zombotany-engine.js', 'i-zombotany-engine.wasm')

def sha(data):
    return hashlib.sha256(data).hexdigest()

def encode(value):
    return (json.dumps(value, indent=2, ensure_ascii=False) + '\n').encode('utf-8')

def parent_file(name):
    return subprocess.check_output(['git','show',PARENT_COMMIT+':'+name],cwd=ROOT)

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

def package(candidate, results):
    engine=json.loads(parent_file('dist/game/engine-provenance.json'))
    assert engine['id']==PARENT_ID and engine['artifacts']['sourceSha256']==PARENT_SHA
    parent=DIST/'source'/Path(engine['artifacts']['source']).name
    parent_bytes=parent.read_bytes()
    assert len(parent_bytes)==94_720_307 and sha(parent_bytes)==PARENT_SHA
    normal=json.loads((candidate/'logs/build-result.json').read_bytes())
    src={f.relative_to(candidate/'source').as_posix():f.read_bytes() for f in sorted((candidate/'source').rglob('*')) if f.is_file()}
    source_sha={name:sha(data) for name,data in src.items()}
    linked=json.loads((candidate/'tests/izombotany-build.json').read_bytes())
    assert normal['status']=='PASS' and normal['sourceUnchangedDuringBuild'] and normal['sourceFiles']==len(src)==893
    assert linked['sources']==source_sha and len(linked['productionObjects'])==154 and linked['normalBuild']==normal['outputs']
    for name, pin in normal['outputs'].items(): assert sha((candidate/name).read_bytes())==pin['sha256']
    for name, pin in {**linked['artifacts'],**linked['driverSources']}.items(): assert sha((candidate/'tests'/name).read_bytes())==pin
    report=json.loads(results.read_bytes())
    assert report['status']=='PASS' and report['driver']==linked['artifacts'] and len(report['cases'])==16
    files={}
    with zipfile.ZipFile(parent) as previous:
        old=json.loads(previous.read(PREFIX+'source-manifest.json'))
        assert old['version']==PARENT_ID and old['files'].keys()<=src.keys()
        changes={n:data for n,data in src.items() if old['files'].get(n,{}).get('sha256')!=source_sha[n]}
        patch=source_patch(previous,changes)
        for name,data in changes.items(): files['source/'+name]=data
    for name in ('build-result.json','source-before.json','source-after.json'):
        files['logs/'+name]=(candidate/'logs'/name).read_bytes()
    for name in TEST_FILES: files['tests/'+name]=(candidate/'tests'/name).read_bytes()
    files['tests/izombotany-results.json']=results.read_bytes()
    files['source-manifest.json']=encode({'version':ID,'files':{n:{'bytes':len(data),'sha256':source_sha[n],
                                           'crc32':f'{zlib.crc32(data):08x}'} for n,data in src.items()}})
    files['README-izombotany.md']=(candidate/'README-izombotany.md').read_bytes()
    for ext in ('js','wasm'):
        binary=parent_file('dist/game/pvz-portable.'+ext)
        assert sha(binary)==engine['artifacts'][ext+'Sha256']
        files['history/zvase1/pvz-portable.'+ext]=binary
    archive_name=f'pvz-portable-{ID}-source.zip'
    destination=DIST/'source'/archive_name
    with tempfile.TemporaryDirectory(dir=destination.parent) as temp:
        tmp=Path(temp)/archive_name
        shutil.copyfile(parent,tmp)
        with zipfile.ZipFile(tmp,'a',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
            # Keep the original directory and EOCD inside the immutable prefix.
            # New/replaced entries plus a single updated central directory follow it.
            archive.start_dir=len(parent_bytes)
            names={PREFIX+n for n in files}
            archive.filelist[:]=[info for info in archive.filelist if info.filename not in names]
            archive.NameToInfo={info.filename:info for info in archive.filelist}
            for name,data in sorted(files.items()):
                info=zipfile.ZipInfo(PREFIX+name,(1980,1,1,0,0,0))
                info.external_attr=0o100644<<16
                archive.writestr(info,data,compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
        assert tmp.stat().st_size < 100*1024*1024
        with tmp.open('rb') as stream: assert stream.read(len(parent_bytes))==parent_bytes
        with zipfile.ZipFile(tmp) as z:
            assert not z.testzip() and len(z.namelist())==len(set(z.namelist()))
            assert all(z.read(PREFIX+'source/'+n)==data for n,data in src.items())
            assert all(z.read(PREFIX+n)==data for n,data in files.items())
            entries=len(z.infolist())
        tmp.replace(destination)
    patch_name='zvase1-to-izombotany1.patch'
    (DIST/'source'/patch_name).write_bytes(patch)
    outputs=normal['outputs']
    artifacts={'source':'../source/'+archive_name,'sourceSha256':sha(destination.read_bytes()),
               'patch':'../source/'+patch_name,'patchSha256':sha(patch)}
    for ext in ('js','wasm'):
        name='pvz-portable.'+ext
        artifacts[ext+'Sha256']=outputs['build/'+name]['sha256']
        shutil.copyfile(candidate/'build'/name,DIST/'game'/name)
    current={'id':ID,'upstream':engine['upstream'],'artifacts':artifacts,'buildRecord':'../source/build-provenance.json',
             'change':'Adds three I, ZomBotany puzzles with six playable plant-headed zombies.',
             'caption':'with I, ZomBotany.','gameAssetsIncluded':True,
             'assetManifest':engine['assetManifest'],'assetBundleId':engine['assetBundleId'],
             'parent':engine,'parentArchivePrefixBytes':len(parent_bytes)}
    (DIST/'game/engine-provenance.json').write_bytes(encode(current))
    (DIST/'source/build-provenance.json').write_bytes(encode({'id':ID,'parentId':PARENT_ID,'sourceArchive':{
        'path':archive_name,'sha256':artifacts['sourceSha256'],'bytes':destination.stat().st_size,'entries':entries},
        'incrementalPatch':{'path':patch_name,'sha256':sha(patch),'baseSourceSha256':PARENT_SHA},
        'sourceFiles':len(src),'productionObjects':154,'normalBuild':normal,'changedSources':sorted(changes),
        'silentGameplayDriver':linked['artifacts'],'gameplayScenarios':len(report['cases'])}))
    fixture={'id':ID,'sourceFiles':len(src),'productionObjects':154,'normalReceiptSha256':sha(files['logs/build-result.json']),
             'reportSha256':sha(results.read_bytes()),'driverBuildSha256':sha(files['tests/izombotany-build.json']),
             **{key:value for key,value in artifacts.items() if key.endswith('Sha256')}}
    (ROOT/'tests/fixtures/izombotany1-release.json').write_bytes(encode(fixture))
    print(f'{archive_name}: {destination.stat().st_size:,} bytes, {entries} entries, {len(changes)} changed source files')

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--candidate',type=Path,required=True)
    p.add_argument('--results',type=Path,required=True)
    a=p.parse_args()
    package(a.candidate.resolve(),a.results.resolve())
