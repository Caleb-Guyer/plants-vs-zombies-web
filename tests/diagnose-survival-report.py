"""Diagnose one exact published Survival24 run; never change its strict gate."""
from pathlib import Path
import argparse, hashlib, json, os, platform, runpy, shutil, stat
import subprocess, sys, time, traceback, zipfile

ENGINE = '0.2.6-web-zsurvival.1'
SOURCE = 'pvz-portable-' + ENGINE + '-source.zip'
SOURCE_SHA = 'a3bebe9b89f0816f4e44e00ee4edf3b3a93ec95f1d2e301f26c793252b88d5ba'
NORMAL_SHA = '6ea3a215e5c3e7ac3e4cccd238e9c759173e68ebd248b6cadfbb48e76d033fe8'
GOLDEN_SHA = 'caf29629c41df8c5cd3a4b31ccc1160cc4c14c2cdd575308b3ca43746858bbd3'
RAW_SHA = '13a846e552c57575f6c8cacf9af4cbf4d07b1f4ae463d5aefbf890faa977d966'
RUNTIME = {'pvz-portable.js': '0091ae18587667ce01b16185f2c463a9de7505d34efdadac48c382201a128a44',
           'pvz-portable.wasm': '72115fe5df5c69b2bc59672cefee7d07d25e9f3d31f2b3a225e137bacb208765'}
PREFIX = 'zombotany3-candidate/'


def require(value, message):
    if not value:
        raise RuntimeError(message)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_json(path):
    return json.loads(path.read_bytes())


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2) + '\n', encoding='utf-8', newline='\n')


def safe(name):
    require(isinstance(name, str) and name and not name.startswith('/') and
            '\\' not in name and ':' not in name and
            all(part not in ('', '.', '..') for part in name.split('/')), 'Unsafe member: ' + str(name))
    return name


def differences(a, b, location=''):
    if type(a) is not type(b):
        return [{'path': location, 'golden': a, 'fresh': b}]
    if isinstance(a, dict):
        result = [{'path': location + '/' + k, 'golden': a.get(k), 'fresh': b.get(k)}
                  for k in sorted(set(a) ^ set(b))]
        return result + [d for k in sorted(a.keys() & b.keys())
                         for d in differences(a[k], b[k], location + '/' + k)]
    if isinstance(a, list):
        if len(a) != len(b):
            return [{'path': location + '/length', 'golden': len(a), 'fresh': len(b)}]
        return [d for i, (x, y) in enumerate(zip(a, b))
                for d in differences(x, y, location + '/' + str(i))]
    return [] if a == b else [{'path': location, 'golden': a, 'fresh': b}]


def tee(command, log, cwd, env=None):
    with log.open('w', encoding='utf-8', newline='\n') as output:
        process = subprocess.Popen(command, cwd=cwd, env=env, stdout=subprocess.PIPE,
                                   stderr=subprocess.STDOUT, text=True)
        for line in process.stdout:
            output.write(line)
            output.flush()
            print(line, end='', flush=True)
        return process.wait()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    repo = Path(__file__).resolve().parents[1]
    output = args.output.resolve()
    require(not output.exists() and not output.is_relative_to(repo), 'Use a fresh output outside the checkout')
    evidence = output / 'evidence'
    work = output / 'work'
    evidence.mkdir(parents=True)
    work.mkdir()
    started = time.monotonic()
    result = {'kind': 'read-only Linux Survival24 diagnostic', 'deployment': False,
              'gateOrProductionChanges': False, 'runsRequested': 1, 'defaultCaseWorkers': 2}
    try:
        write_json(evidence / 'host.json', {'platform': platform.platform(), 'machine': platform.machine(),
                   'python': sys.version, 'node': subprocess.check_output(['node', '--version'], text=True).strip()})
        # The supported bootstrap only restores/authenticates ignored, exact ZIPs.
        bootstrap = runpy.run_path(str(repo / 'source-bundle.py'))['ensure_source_archive'](repo)
        write_json(evidence / 'bootstrap.json', bootstrap)
        archive = repo / 'dist/source' / SOURCE
        require(archive.stat().st_size == 42204191 and sha(archive) == SOURCE_SHA, 'Published source ZIP differs')
        engine = read_json(repo / 'dist/game/engine-provenance.json')
        require(engine['id'] == ENGINE and engine['artifacts']['sourceSha256'] == SOURCE_SHA, 'Current engine differs')
        for name, pin in RUNTIME.items():
            require(sha(repo / 'dist/game' / name) == pin and
                    engine['artifacts']['jsSha256' if name.endswith('.js') else 'wasmSha256'] == pin,
                    'Published runtime differs: ' + name)
        extracted = {}
        with zipfile.ZipFile(archive) as z:
            infos = z.infolist()
            require(len(infos) == 3613 and sum(i.file_size for i in infos) <= 256 * 1024 * 1024,
                    'Unexpected source ZIP bounds')
            require(z.testzip() is None, 'Source ZIP CRC failure')
            for info in infos:
                require(not info.is_dir() and info.filename.startswith(PREFIX) and
                        stat.S_IFMT(info.external_attr >> 16) != stat.S_IFLNK, 'Unexpected ZIP member')
                name = safe(info.filename[len(PREFIX):])
                require(name not in extracted and info.file_size <= 64 * 1024 * 1024, 'Duplicate/oversize ZIP member')
                target = work / name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(z.read(info))
                extracted[name] = sha(target)
        source_map = {'source/' + p.relative_to(work / 'source').as_posix(): sha(p)
                      for p in sorted((work / 'source').rglob('*')) if p.is_file()}
        build = read_json(work / 'tests/zsurvival1-build.json')
        require(len(source_map) == 888 and source_map == build['sourceSha256'], 'Complete888-source graph differs')
        require(build['productionObjectCount'] == len(build['productionObjectSha256']) == 152 and
                build['optimization'] == 'O2' and build['productionBuildReceiptSha256'] == NORMAL_SHA and
                sha(work / 'logs/build-result.json') == NORMAL_SHA, 'Published native build binding differs')
        golden_path = work / 'tests/zsurvival1-results.json'
        require(sha(golden_path) == GOLDEN_SHA, 'Sealed golden report differs')
        golden = read_json(golden_path)
        shutil.copyfile(golden_path, evidence / 'golden-report.json')
        # Remove only authenticated shipped outputs in this private extraction;
        # later artifact files must come from this execution, including failures.
        golden_path.unlink()
        for row in golden['scenarios']:
            shipped = work / 'tests/zsurvival1-logs' / f"{row['name']}-{row['speed']}x-{row['seed']}.log"
            require(sha(shipped) == row['logSha256'], 'Shipped golden log differs')
            shipped.unlink()
        for source, target in [('tests/zsurvival1-build.json', 'build.json'),
                               ('logs/build-result.json', 'normal.json'),
                               ('tests/zsurvival1-verification-contract.json', 'contract.json')]:
            shutil.copyfile(work / source, evidence / target)
        metadata = read_json(work / 'tests/native-artifacts.json')
        require(metadata['rawBytes'] == 162867755 and metadata['rawSha256'] == RAW_SHA and
                len(metadata['files']) == 38, 'Native38 raw stream differs')
        require(tee([sys.executable, str(work / 'unpack-native-artifacts.py'), '--root', str(work)],
                    evidence / 'decoder.log', work) == 0, 'Unmodified native decoder failed')
        for entry in metadata['files']:
            member = work / 'tests' / safe(entry['path'])
            require(member.stat().st_size == entry['bytes'] and sha(member) == entry['sha256'], 'Decoded member differs')
        for name, pin in build['testInputSha256'].items():
            member = work / 'tests' / safe(name)
            require(sha(member) == pin, 'Actual input differs: ' + name)
            target = evidence / 'inputs' / name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(member, target)
        for name, pin in build['testArtifactSha256'].items():
            require(sha(work / 'tests' / safe(name)) == pin, 'Actual executable differs: ' + name)
        for field, name in [('builderSha256', 'build-zsurvival1.py'), ('runnerSha256', 'test-zsurvival1.py'),
                            ('generatedHarnessSha256', 'zsurvival1-harness.cpp'), ('policySha256', 'zsurvival1-policy.h')]:
            require(sha(work / 'tests' / name) == golden[field], 'Sealed recipe differs: ' + name)
        write_json(evidence / 'before.json', {'archiveSha256': SOURCE_SHA, 'archiveMemberSha256': extracted,
                   'sourceSha256': source_map, 'productionObjectSha256': build['productionObjectSha256'],
                   'normalReceiptSha256': NORMAL_SHA, 'testInputSha256': build['testInputSha256'],
                   'testArtifactSha256': build['testArtifactSha256'], 'goldenReportSha256': GOLDEN_SHA})
        # Do not pass --jobs: the unchanged runner's CI default is two workers.
        command = [sys.executable, str(work / 'tests/test-zsurvival1.py'), '--native',
                   '--asset-root', str(repo / 'dist/game-assets')]
        env = os.environ.copy()
        env.update(SDL_AUDIODRIVER='dummy', PYTHONUNBUFFERED='1')
        result['command'] = command
        code = tee(command, evidence / 'native24.log', work, env)
        result['runnerExitCode'] = code
        fresh_path = work / 'tests/zsurvival1-results.json'
        # Only copied completed-case logs are fresh: old reports/logs shipped in
        # the ZIP cannot stand in for a new execution if the runner failed.
        completed = (evidence / 'native24.log').read_text().count('PASS actual native Survival ')
        result['completedCases'] = completed
        logs = evidence / 'fresh-logs'
        logs.mkdir()
        expected_logs = {f"{r['name']}-{r['speed']}x-{r['seed']}.log" for r in golden['scenarios']}
        for log in (work / 'tests/zsurvival1-logs').glob('*.log'):
            require(log.name in expected_logs, 'Unexpected fresh log name')
            shutil.copyfile(log, logs / log.name)
        require(code == 0 and completed == 24, 'Actual Survival24 did not close PASS; partial logs preserved')
        fresh = read_json(fresh_path)
        shutil.copyfile(fresh_path, evidence / 'fresh-report.json')
        require(sha(work / 'logs/build-result.json') == NORMAL_SHA and
                {'source/' + p.relative_to(work / 'source').as_posix(): sha(p)
                 for p in sorted((work / 'source').rglob('*')) if p.is_file()} == source_map,
                'Production source/normal binding changed during diagnostic')
        require(fresh['status'] == 'PASS' and len(fresh['scenarios']) == 24, 'Fresh report incomplete')
        for name, pin in build['testInputSha256'].items():
            require(sha(work / 'tests' / name) == pin, 'Frozen test input changed during run')
        for name, pin in build['testArtifactSha256'].items():
            require(sha(work / 'tests' / name) == pin, 'Frozen executable changed during run')
        for row in fresh['scenarios']:
            require(sha(logs / f"{row['name']}-{row['speed']}x-{row['seed']}.log") == row['logSha256'], 'Fresh raw log differs')
        all_diff = differences(golden, fresh)
        content_diff = [d for d in all_diff if not (d['path'].startswith('/scenarios/') and d['path'].endswith('/logSha256'))]
        graph_diff = []
        for d in content_diff:
            if d['path'].endswith(('/beforeGraph', '/afterGraph')) and isinstance(d['golden'], str) and isinstance(d['fresh'], str):
                graph_diff += [{**segment, 'path': d['path'] + segment['path']} for segment in
                               differences(d['golden'].split(';'), d['fresh'].split(';'))]
        write_json(evidence / 'all-field-differences.json', all_diff)
        write_json(evidence / 'non-log-field-differences.json', content_diff)
        write_json(evidence / 'changed-graph-segments.json', graph_diff)
        # This is exactly the existing gate's canonicalization: no unknown
        # field, graph value, counter or pointer-like integer is normalized.
        node_code = "const fs=require('fs'),h=require('crypto');const c=v=>Array.isArray(v)?v.map(c):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,c(v[k])])):v;for(const p of process.argv.slice(1)){const r=JSON.parse(fs.readFileSync(p)),scenarios=r.scenarios.map(({logSha256,...v})=>v);console.log(h.createHash('sha256').update(Buffer.from(JSON.stringify(c({...r,scenarios})))).digest('hex'));}"
        pins = subprocess.check_output(['node', '-e', node_code, str(evidence / 'golden-report.json'),
                                       str(evidence / 'fresh-report.json')], text=True).splitlines()
        require(len(pins) == 2, 'Canonical comparison failed')
        result.update(status='DIFFERENCES OBSERVED' if content_diff else 'EXACT NATIVE CONTENT MATCH',
                      freshReportSha256=sha(evidence / 'fresh-report.json'), checks=fresh['checks'],
                      goldenCanonicalMinusOnlyLogSha256=pins[0], freshCanonicalMinusOnlyLogSha256=pins[1],
                      nonLogDifferenceCount=len(content_diff), graphSegmentDifferenceCount=len(graph_diff))
        print(json.dumps(result, indent=2), flush=True)
        for d in content_diff[:24]:
            print('EXACT_FIELD_DIFF ' + json.dumps(d)[:1800], flush=True)
        for d in graph_diff[:16]:
            print('EXACT_GRAPH_SEGMENT_DIFF ' + json.dumps(d)[:1800], flush=True)
        print('Full untruncated differences and exact reports are in the QA artifact. No strict gate or accepted pin changed.', flush=True)
        return 1 if content_diff else 0
    except Exception:
        result['status'] = 'DIAGNOSTIC FAILED; EVIDENCE PRESERVED'
        (evidence / 'error.txt').write_text(traceback.format_exc(), encoding='utf-8')
        traceback.print_exc()
        return 1
    finally:
        result['elapsedSeconds'] = round(time.monotonic() - started, 3)
        write_json(evidence / 'result.json', result)


if __name__ == '__main__':
    raise SystemExit(main())
