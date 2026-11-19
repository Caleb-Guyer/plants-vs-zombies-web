"""Verify the shipping I, ZomBotany engine and optionally replay its muted gameplay tests."""
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
GAME = ROOT / "dist/game"
PREFIX = "zombotany3-candidate/"
ENGINE = "0.2.6-web-izombotany.1"
CASES = {(name, speed, seed) for name in ("solution", "resume", "retry", "classic")
         for speed in (1, 2) for seed in (1729, 7331)}
RUN_FILES = ("test-izombotany.py", "izombotany-run.cjs", "izombotany-build.json",
             "headless-app.h", "i-zombotany.cpp", "build-izombotany.py",
             "i-zombotany-engine.js", "i-zombotany-engine.wasm", "test-pool-panic.py",
             "pool-panic-assets.json", "zsurvival1-earned-z1/userdata/user1.dat")


def digest(data):
    return hashlib.sha256(data).hexdigest()


def check(condition, message):
    if not condition:
        raise ValueError(message)


def verify_results(report, artifacts):
    check(report["engine"] == ENGINE and report["status"] == "PASS" and
          report["audioDeviceOpened"] is False and report["driver"] == artifacts,
          "Unexpected gameplay engine, audio device, or result")
    rows = {(r["case"], r["speed"], r["seed"]): r for r in report["cases"]}
    check(rows.keys() == CASES and len(report["cases"]) == len(CASES),
          "Incomplete or duplicated gameplay matrix")
    for (name, speed, _), row in rows.items():
        check(row["checks"] > 0, "No engine assertions were evaluated")
        check(row["doubleUpdates"] > 0 if speed == 2 else row["doubleUpdates"] == 0,
              "Observed engine cadence differs from the requested speed")
        if name == "classic":
            check(all(row[k] == 0 for k in ("boards", "types", "purchases", "saves")),
                  "Classic controls accidentally played the new game")
        else:
            check(row["boards"] == 3 and row["types"] == 6 and row["purchases"] >= 15 and
                  row["sunClicks"] > 0 and row["saves"] == (2 if name == "resume" else 0),
                  f"Incomplete {name} course")
    return rows


def verify_archive(archive, engine, receipt, pins):
    def read(name):
        return archive.read(PREFIX + name)
    names = archive.namelist()
    check(len(names) == len(set(names)), "Ambiguous archive paths")
    normal_raw = read("logs/build-result.json")
    link_raw = read("tests/izombotany-build.json")
    results_raw = read("tests/izombotany-results.json")
    for key, data in (("normalReceiptSha256", normal_raw), ("driverBuildSha256", link_raw),
                      ("reportSha256", results_raw)):
        check(digest(data) == pins[key], key)
    normal, linked, report = map(json.loads, (normal_raw, link_raw, results_raw))
    manifest = json.loads(read("source-manifest.json"))
    sources = linked["sources"]
    check(manifest["version"] == linked["engine"] == ENGINE and
          len(sources) == pins["sourceFiles"] == receipt["sourceFiles"] == 893,
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
    check(len(objects) == pins["productionObjects"] == receipt["productionObjects"] == 154 and
          any(name.endswith("/IZombotany.cpp.o") for name in objects), "Missing production objects")
    for ext in ("js", "wasm"):
        filename = "pvz-portable." + ext
        expected = engine["artifacts"][ext + "Sha256"]
        check(digest((GAME / filename).read_bytes()) == expected ==
              normal["outputs"]["build/" + filename]["sha256"] == pins[ext + "Sha256"], filename)
    for name, expected in (linked["driverSources"] | linked["artifacts"]).items():
        check(digest(read("tests/" + name)) == expected, name)
    return verify_results(report, linked["artifacts"]), linked


def main(play):
    engine = json.loads((GAME / "engine-provenance.json").read_bytes())
    receipt = json.loads((GAME / engine["buildRecord"]).read_bytes())
    pins = json.loads((ROOT / "tests/fixtures/izombotany1-release.json").read_bytes())
    check(receipt["id"] == engine["id"] == pins["id"] == ENGINE, "Wrong release")
    artifacts = engine["artifacts"]
    source = (GAME / artifacts["source"]).read_bytes()
    patch = (GAME / artifacts["patch"]).read_bytes()
    check(digest(source) == pins["sourceSha256"] == artifacts["sourceSha256"], "Source ZIP changed")
    check(digest(patch) == pins["patchSha256"] == artifacts["patchSha256"], "Native patch changed")
    parent = engine["parent"]
    prefix = source[:engine["parentArchivePrefixBytes"]]
    check(digest(prefix) == parent["artifacts"]["sourceSha256"] ==
          receipt["incrementalPatch"]["baseSourceSha256"], "Vasebreaker source prefix changed")
    with zipfile.ZipFile(io.BytesIO(source)) as archive, zipfile.ZipFile(io.BytesIO(prefix)) as previous:
        recorded, linked = verify_archive(archive, engine, receipt, pins)
        old = json.loads(previous.read(PREFIX + "source-manifest.json"))["files"]
        changed = {n for n, pin in linked["sources"].items() if old.get(n, {}).get("sha256") != pin}
        check(old.keys() <= linked["sources"].keys() and changed == set(receipt["changedSources"]),
              "Incremental source inventory differs")
        if play:
            with tempfile.TemporaryDirectory(prefix="izombotany-replay-") as folder:
                directory = Path(folder)
                for name in RUN_FILES:
                    target = directory / "tests" / name
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(archive.read(PREFIX + "tests/" + name))
                out = directory / "results"
                subprocess.run([sys.executable, str(directory / "tests/test-izombotany.py"),
                                "--assets", str(ROOT / "dist/game-assets"), "--out", str(out)], check=True)
                fresh = verify_results(json.loads((out / "results.json").read_bytes()), linked["artifacts"])
                for key, row in fresh.items():
                    for field in ("boards", "types", "purchases", "saves"):
                        check(row[field] == recorded[key][field], f"Replay changed {key} {field}")
    print("PASS I, ZomBotany shipping build, corresponding source and 16 muted gameplay cases"
          + (" replayed." if play else " verified from the release report."))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--play", action="store_true", help="Replay the complete matrix with the published assets")
    main(parser.parse_args().play)
