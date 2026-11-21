"""Authenticate extension source, shipping binaries and muted gameplay evidence."""
import argparse
import hashlib
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import native_release_chain as chain

GAME = ROOT / "dist/game"
PREFIX = "zombotany3-candidate/"
RELEASES = {
    "izombotany": (893, 154, "IZombotany.cpp.o", "i-zombotany"),
    "zbeghouled": (895, 155, "ZomBotanyBeghouled.cpp.o", "zbeghouled"),
    "zsnight": (895, 155, "ZombotanySurvival.cpp.o", "zsnight"),
    "zspool": (895, 155, "ZombotanySurvival.cpp.o", "zspool"),
    "zsfog": (895, 155, "ZombotanySurvival.cpp.o", "zsfog"),
    "zsroof": (895, 155, "ZombotanySurvival.cpp.o", "zsroof"),
    "zbowling": (897, 156, "ZomBotanyBowling.cpp.o", "zbowling"),
}
CASES = {(name, speed, seed) for name in ("solution", "resume", "retry", "classic")
         for speed in (1, 2) for seed in (1729, 7331)}

def run_files(key):
    stem = RELEASES[key][3]
    files = (f"test-{key}.py", f"{key}-run.cjs", f"{key}-build.json", "headless-app.h",
            f"{stem}.cpp", f"build-{key}.py", f"{stem}-engine.js", f"{stem}-engine.wasm",
            "test-pool-panic.py", "pool-panic-assets.json", "zsurvival1-earned-z1/userdata/user1.dat")
    if key in chain.WINNING_PROFILES:
        files += (chain.WINNING_PROFILES[key][0],)
    return files


def digest(data):
    return hashlib.sha256(data).hexdigest()


def check(condition, message):
    if not condition:
        raise ValueError(message)


def verify_archive(archive, engine, receipt, pins, key, read_binary, verify_results):
    count, objects_count, object_name, _ = RELEASES[key]
    def read(name):
        return archive.read(PREFIX + name)
    names = archive.namelist()
    check(len(names) == len(set(names)), "Ambiguous archive paths")
    normal_raw = read("logs/build-result.json")
    link_raw = read(f"tests/{key}-build.json")
    results_raw = read(f"tests/{key}-results.json")
    if key in chain.WINNING_PROFILES:
        name, expected = chain.WINNING_PROFILES[key]
        check(digest(read("tests/" + name)) == expected, "Incorrect earned profile: " + name)
    for field, data in (("normalReceiptSha256", normal_raw), ("driverBuildSha256", link_raw),
                        ("reportSha256", results_raw)):
        check(digest(data) == pins[field], field)
    normal, linked, report = map(json.loads, (normal_raw, link_raw, results_raw))
    manifest = json.loads(read("source-manifest.json"))
    sources = linked["sources"]
    check(manifest["version"] == linked["engine"] == engine["id"] and
          len(sources) == pins["sourceFiles"] == receipt["sourceFiles"] == count,
          "Incorrect source tree or version")
    actual = {name.removeprefix(PREFIX + "source/") for name in names
              if name.startswith(PREFIX + "source/") and not name.endswith("/")}
    check(actual == sources.keys() == manifest["files"].keys(), "Source tree incomplete")
    for name, expected in sources.items():
        data = read("source/" + name)
        pin = manifest["files"][name]
        check(digest(data) == expected == pin["sha256"] and len(data) == pin["bytes"], name)
    for stage in ("before", "after"):
        check(json.loads(read(f"logs/source-{stage}.json")) == sources, "Build input changed")
    check(normal["status"] == "PASS" and normal["sourceUnchangedDuringBuild"] and
          normal == receipt["normalBuild"] and normal["outputs"] == linked["normalBuild"],
          "Normal build and gameplay driver have different inputs")
    objects = linked["productionObjects"]
    check(len(objects) == pins["productionObjects"] == receipt["productionObjects"] == objects_count and
          any(name.endswith("/" + object_name) for name in objects), "Missing production objects")
    for ext in ("js", "wasm"):
        filename = "pvz-portable." + ext
        expected = engine["artifacts"][ext + "Sha256"]
        check(digest(read_binary(filename, expected)) == expected ==
              normal["outputs"]["build/" + filename]["sha256"] == pins[ext + "Sha256"], filename)
    for name, expected in (linked["driverSources"] | linked["artifacts"]).items():
        check(digest(read("tests/" + name)) == expected, name)
    return verify_results(report, linked["artifacts"]), linked


def run(key, verify_results, fields):
    parser = argparse.ArgumentParser(description="Verify native build receipts and play the muted suite")
    parser.add_argument("--play", action="store_true")
    args = parser.parse_args()
    engine_id = f"0.2.6-web-{key}.1"
    pins = json.loads((ROOT / f"tests/fixtures/{key}1-release.json").read_bytes())
    engine = json.loads((GAME / "engine-provenance.json").read_bytes())
    source = (GAME / engine["artifacts"]["source"]).read_bytes()
    active_id = engine["id"]
    active_artifacts = engine["artifacts"]
    historical = active_id != engine_id
    while engine["id"] != engine_id:
        check(engine["id"] in chain.ARCHIVE_PARENTS or engine["id"] == chain.BEGHOUL, "Unexpected extension ancestry")
        source = chain.parent_source(ROOT, engine, source)
        engine = engine["parent"]
    binaries = ROOT / f"tests/fixtures/historical/{key}1-published" if historical else GAME
    receipt_path = binaries / "build-provenance.json" if historical else GAME / engine["buildRecord"]
    def read_binary(name, expected):
        if historical and active_id in chain.ARCHIVE_PARENTS:
            active_key = active_id.removeprefix("0.2.6-web-").removesuffix(".1")
            active_pins = json.loads((ROOT / f"tests/fixtures/{active_key}1-release.json").read_bytes())
            base = None
            if active_id in chain.DELTA_CAPSULES:
                base = (GAME / name).read_bytes()
                ext = name.rsplit(".", 1)[-1]
                check(digest(base) == active_artifacts[ext + "Sha256"], "Unexpected current browser")
            data = chain.read_browser(ROOT, key, name, expected, active_pins["historicalBrowserSha256"],
                                      base, chain.DELTA_CAPSULES.get(active_id))
            if (binaries / name).is_file():
                check((binaries / name).read_bytes() == data, "Historical checkout executable differs")
            return data
        return (binaries / name).read_bytes()
    receipt = json.loads(receipt_path.read_bytes())
    check(receipt["id"] == engine["id"] == pins["id"] == engine_id, "Wrong release")
    artifacts = engine["artifacts"]
    patch = (GAME / artifacts["patch"]).read_bytes()
    check(digest(source) == pins["sourceSha256"] == artifacts["sourceSha256"], "Source ZIP changed")
    check(digest(patch) == pins["patchSha256"] == artifacts["patchSha256"], "Native patch changed")
    parent = engine["parent"]
    prefix = chain.parent_source(ROOT, engine, source)
    check(digest(prefix) == parent["artifacts"]["sourceSha256"] ==
          receipt["incrementalPatch"]["baseSourceSha256"], "Parent source prefix changed")
    with zipfile.ZipFile(io.BytesIO(source)) as archive, zipfile.ZipFile(io.BytesIO(prefix)) as previous:
        recorded, linked = verify_archive(archive, engine, receipt, pins, key, read_binary, verify_results)
        old = json.loads(previous.read(PREFIX + "source-manifest.json"))["files"]
        changed = {n for n, pin in linked["sources"].items() if old.get(n, {}).get("sha256") != pin}
        check(old.keys() <= linked["sources"].keys() and changed == set(receipt["changedSources"]),
              "Incremental source inventory differs")
        if args.play:
            with tempfile.TemporaryDirectory(prefix=key+"-replay-") as folder:
                directory = Path(folder)
                for name in run_files(key):
                    target = directory / "tests" / name
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(archive.read(PREFIX + "tests/" + name))
                out = directory / "results"
                subprocess.run([sys.executable, str(directory / f"tests/test-{key}.py"),
                                "--assets", str(ROOT / "dist/game-assets"), "--out", str(out)], check=True)
                fresh = verify_results(json.loads((out / "results.json").read_bytes()), linked["artifacts"])
                for scenario, row in fresh.items():
                    for field in fields:
                        check(row[field] == recorded[scenario][field], f"Replay changed {scenario} {field}")
    print(f"PASS {engine_id} build, source and {len(recorded)} muted cases"
          + (" replayed." if args.play else " verified from release results."))
