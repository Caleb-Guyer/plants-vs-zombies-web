"""Private native zero-credit crowded starting saves, separate from battle tests."""
from pathlib import Path
import argparse,hashlib,importlib.util,json,os,shutil,subprocess,sys

root=Path(__file__).resolve().parents[2];candidate=root/'work/portable-build/zombotany3-candidate'
here=Path(__file__).resolve().parent;out=here/'performance-fixtures';build=candidate/'build'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
load=lambda p:json.loads(p.read_text(encoding='utf-8-sig'))
receipt='805528006b1ce40dbca55cf1bb2b836855e93ba50f72b77c41fddd9ef57a54b4'
names=['zombotany3-harness.cpp','zombotany3-policy.h','zombotany3-controls.h','zombotany3-battles.h','zombotany3-presentation-controls.h']

def source_map():return {'source/'+p.relative_to(candidate/'source').as_posix():sha(p)for p in sorted((candidate/'source').rglob('*'))if p.is_file()}
def verify_normal():
    assert sha(candidate/'logs/build-result.json')==receipt
    normal=load(candidate/'logs/build-result.json');assert normal['status']=='PASS'
    source=source_map();assert len(source)==882
    for name in ['source-before.json','source-after.json']:
        assert source=={'source/'+k:v for k,v in load(candidate/'logs'/name).items()}
    for name,pin in normal['outputs'].items():assert sha(candidate/name)==pin['sha256']
    return source

def prepare():
    out.mkdir(exist_ok=False);inputs=out/'recipe-inputs';inputs.mkdir()
    for name in names:shutil.copyfile(candidate/'tests'/name,inputs/name)
    pins={name:sha(inputs/name)for name in names}
    (out/'input-snapshot.json').write_text(json.dumps(pins,indent=2)+'\n',encoding='utf-8',newline='\n')
    print('Prepared immutable private fixture inputs',len(pins),flush=True)

def link():
    source=verify_normal();inputs=out/'recipe-inputs';pins=load(out/'input-snapshot.json')
    assert set(pins)==set(names)and all(sha(inputs/n)==v for n,v in pins.items())
    toolchain=candidate.parent.parent/'toolchain';sdk=toolchain/'emsdk-d7b4130688bfa348392b921ab04015aa15c4f154'
    python=sdk/'python/3.13.3_64bit/python.exe';cache=toolchain/'em-cache';temp=out/'emscripten-temp';temp.mkdir(exist_ok=True)
    env=os.environ.copy();env.update(EM_CONFIG=str(sdk/'.emscripten'),EM_CACHE=str(cache),EMSDK=str(sdk),EMSDK_PYTHON=str(python),EMSDK_NODE=str(sdk/'node/24.19.0_64bit/node.exe'),EMCC_TEMP_DIR=str(temp),PYTHONNOUSERSITE='1')
    common=[str(python),str(sdk/'upstream/emscripten/em++.py'),'-O2','-DNDEBUG','-std=c++20','-fexceptions','-sUSE_SDL=2','-sUSE_ZLIB=1','-sUSE_LIBPNG=1','-sUSE_LIBJPEG=1']
    includes=[candidate/'source/src',candidate/'source/src/SexyAppFramework',candidate/'source/src/SexyAppFramework/platform/emscripten',build,candidate/'source/src/SexyAppFramework/sound/SDL-Mixer-X/include']
    driver=here/'performance-fixture.cpp';obj=out/'fixture.o'
    objects=[p for p in sorted((build/'CMakeFiles/pvz-portable.dir').rglob('*.o'))if p.name!='main.cpp.o'];assert len(objects)==149
    object_pins={p.relative_to(build).as_posix():sha(p)for p in objects}
    recipe_sha=sha(Path(__file__));driver_sha=sha(driver)
    with (out/'build.log').open('w',encoding='utf-8',newline='\n')as log:
        subprocess.run(common+[f'-I{p}'for p in includes]+['-c',str(driver),'-o',str(obj)],env=env,stdout=log,stderr=subprocess.STDOUT,check=True)
        command=common+[str(obj)]+[str(p)for p in objects]+[str(build/'lib/libSDL2_mixer_ext.a'),str(cache/'sysroot/lib/libopenmpt.a'),'-sASYNCIFY','-sALLOW_MEMORY_GROWTH=1','-sMAXIMUM_MEMORY=1073741824','-sGROWABLE_ARRAYBUFFERS=0','-sFORCE_FILESYSTEM=1','-sEXPORTED_RUNTIME_METHODS=["FS","NODEFS","callMain"]','-sINVOKE_RUN=0','-sMODULARIZE=1','-sEXPORT_NAME=createZ3PerformanceFixture','-sENVIRONMENT=node','-sEXIT_RUNTIME=1','-lnodefs.js','-lidbfs.js','-o',str(out/'fixture.js')]
        subprocess.run(command,env=env,stdout=log,stderr=subprocess.STDOUT,check=True)
    assert source_map()==source and sha(Path(__file__))==recipe_sha and sha(driver)==driver_sha
    assert all(sha(inputs/n)==v for n,v in pins.items())and all(sha(build/n)==v for n,v in object_pins.items())
    record={'status':'PASS','execution':'complete-production-engine-synthetic-fixture','engineId':'0.2.6-web-zombotany3.2','productionBuildReceiptSha256':receipt,'sourceCount':882,'productionObjectCount':149,'optimization':'O2','sourceSha256':source,'productionObjectSha256':object_pins,'driverSha256':driver_sha,'recipeSha256':recipe_sha,'testSnapshotSha256':pins,'artifactSha256':{n:sha(out/n)for n in ['fixture.js','fixture.wasm']}}
    (out/'build-receipt.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8',newline='\n')
    print('PASS actual O2 private fixture driver,882sources/149objects',flush=True)

def run():
    source=verify_normal();record=load(out/'build-receipt.json');assert record['sourceSha256']==source
    assert sha(Path(__file__))==record['recipeSha256']and sha(here/'performance-fixture.cpp')==record['driverSha256']
    for n,v in record['artifactSha256'].items():assert sha(out/n)==v
    spec=importlib.util.spec_from_file_location('private_fixture_asset_adapter',candidate/'tests/test-pool-panic.py');base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base)
    node=shutil.which('node');assert node;assets=out/'assets';assets.mkdir(exist_ok=False)
    fixture_pins=base.stage_assets(root/'work/plants-vs-zombies-web-release/dist/game-assets',assets,node)
    script=out/'run.cjs';script.write_text(base.NODE_SCRIPT.replace('const result=game.callMain(args);','const result=await game.callMain(args);'),encoding='utf-8',newline='\n')
    rows=[]
    for count in [20,40]:
        dest=out/f'starting-crowd-{count}';dest.mkdir(exist_ok=False)
        env=os.environ.copy();env['SDL_AUDIODRIVER']='dummy';env['POOL_SAVE_ROOT']=str(dest)
        result=subprocess.run([node,str(script),str(out/'fixture.js'),str(assets),str(count)],capture_output=True,text=True,env=env,timeout=300)
        log=dest/'native.log';log.write_text(result.stdout+'\n'+result.stderr,encoding='utf-8',newline='\n')
        assert result.returncode==0,(count,result.stderr[-6000:])
        observations=[json.loads(line.split(' ',1)[1])for line in result.stdout.splitlines()if line.startswith('Z3_PERFORMANCE_FIXTURE ')]
        assert len(observations)==1;obs=observations[0]
        assert obs['startingCrowd']==count and obs['profileCredits']==obs['countedEarnedWins']==0 and obs['savedGraphPreserved']and not obs['audioDeviceOpened']
        files={n:{'bytes':(dest/n).stat().st_size,'sha256':sha(dest/n)}for n in ['userdata/game1_93.v4','userdata/user1.dat','userdata/users.dat']}
        assert all(v['bytes']>0 for v in files.values())
        item={'schemaVersion':1,'kind':'zero-credit-synthetic-native-starting-save','engineId':record['engineId'],'productionBuildReceiptSha256':receipt,'sourceCount':882,'productionObjectCount':149,'buildReceiptSha256':sha(out/'build-receipt.json'),'recipeSha256':record['recipeSha256'],'driverSha256':record['driverSha256'],'assetBundleId':fixture_pins['assetBundleId'],'files':files,'observation':obs,'nativeLogSha256':sha(log),'scope':'Initial synthetic actors and plants only. Native HP, gait, attack clocks,20 authored waves, opening countdown and normal bank remain unchanged. Runtime crowds may change; this is not an earned win or a stable-count FPS claim.'}
        (dest/'manifest.json').write_text(json.dumps(item,indent=2)+'\n',encoding='utf-8',newline='\n');rows.append(item)
        print('PASS actual native Save/Load starting crowd',count,files['userdata/game1_93.v4']['bytes'],'bytes',flush=True)
    assert source_map()==source and sha(candidate/'logs/build-result.json')==receipt
    (out/'summary.json').write_text(json.dumps({'status':'PASS','kind':'zero-credit-synthetic-native-starting-saves','engineId':record['engineId'],'sourceCount':882,'productionObjectCount':149,'productionBuildReceiptSha256':receipt,'fixtures':rows},indent=2)+'\n',encoding='utf-8',newline='\n')

p=argparse.ArgumentParser();p.add_argument('action',choices=['prepare','build','run']);a=p.parse_args()
if a.action=='prepare':prepare()
elif a.action=='build':link()
else:run()
