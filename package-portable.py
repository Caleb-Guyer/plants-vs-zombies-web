#!/usr/bin/env python3
"""Package the browser game, source and explicitly bundled original game assets.

No downloads, dependency installation, engine build or installed-game access occurs.
The source archive contains current engine code, its baseline and asset metadata.
Shared historical ZIP bytes are restored exactly before offline source checks.
Game asset payloads remain separate served files and in the full runtime archive.
Private QA data and original native executables are never distribution inputs.
"""
import argparse
import base64
import hashlib
import io
import importlib.util
import json
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile


ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
SITE_SOURCE = DIST / "source" / "site-source.zip"
SOURCE_DOWNLOADS = DIST / "source" / "source-downloads.json"
HISTORICAL_BROWSERS = {
    "0.2.6-web-zsnight.1": "extension-browsers.tar.xz",
    "0.2.6-web-zspool.1": "zspool1-browser-deltas.tar.xz",
    "0.2.6-web-zsfog.1": "zsfog1-browser-deltas.tar.xz",
    "0.2.6-web-zsroof.1": "zsroof1-browser-deltas.tar.xz",
    "0.2.6-web-zbowling.1": "zbowling1-browser-deltas.tar.xz",
    "0.2.6-web-zpins.1": "zpins1-browser-deltas.tar.xz",
}
EXTENSIONS = {"0.2.6-web-izombotany.1", "0.2.6-web-zbeghouled.1"} | HISTORICAL_BROWSERS.keys()
# Current publication target is GitHub Pages, via the existing Pages workflow.
# https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github
MAX_STATIC_ASSET_BYTES = 100 * 1024 * 1024
AMBUSH_PARENT_REFERENCE_SHA256 = "6771fc13bae02cb70dd8de12192f1f18e50302904a7ef1c784a790e6ccb51dd3"
GUST_PARENT_REFERENCE_SHA256 = "14b5ef8f794cbfb5cb687f24cf05d23fa63620339945f139d2c5d947e9827476"
ZOMBOTANY3_PARENT_REFERENCE_SHA256 = "b7be60f52c989f5167b7582b46a4b75824a0748cefe443881c80888e31397cb9"
ZSURVIVAL1_PARENT_REFERENCE_SHA256 = "f785a81fa30c9de62f2527d0c24beeb84a0152bfb8336d7e28a06fdf7bd71ef4"
DOUBLE_PARENT_REFERENCE_SHA256 = "a22e68371f7ad0f794b7e1f9221ed8bb45e7220df3501b8281435dcaf244a160"
TORCH_PARENT_REFERENCE_SHA256 = "14dc78f0593db13b4e17e559061f84996be9c64f23663bd9ef7556b669fc96f6"
AMBUSH_FOCUSED_REFERENCE_SHA256 = "9463bdd7c262c1749c57b00d25d45257951f8b8b2c8d4511cff630f9c606e9c8"
LEGACY_SOURCE_NAME = "pvz-portable-0.2.6-web-endless.2-source.zip"
TRANSPORT_MANIFEST = "source-transports/endless2.json"
TRANSPORT_LITERALS = "source-transports/endless2.literals"
ZVASE1_PARENT_REFERENCE_SHA256 = "c5d8a49fc25337feb574ffbf8be2114a530310522a1a43fd02dcfb7753c95625"  # Root replayed all888 published source bytes.
CURRENT_TRANSPORT_MANIFEST = "source-transports/current.json"
CURRENT_TRANSPORT_PAYLOAD = "source-transports/current.xz"
REQUIRED_ROOT = (
    ".gitattributes", "README.md", "CURRENT-REQUIREMENTS.md", "PARITY-QA.md", "package.json", "server.mjs",
    "verify-port.mjs", "prepare-port.mjs",
    "package-portable.py", "source-bundle.py", "tests/audio-controls.mjs", "tests/shell-keyboard.mjs", "tests/steam-compat.mjs",
    "tests/test-profile-merge.mjs", "tests/save-storage.mjs", "tests/save-sync.mjs", "tests/save-transfer.mjs", "tests/zombatar-export.mjs",
)
FORBIDDEN_SUFFIXES = {".pak", ".exe", ".dll"}
FORBIDDEN_NAMES = {"qa-resources.zip", "qa-upstream-compat.xml"}
_source_bundle_helpers = None


def source_bundle_helpers():
    """Use the same authenticated archive restore in checks and packaging."""
    global _source_bundle_helpers
    if _source_bundle_helpers is None:
        specification = importlib.util.spec_from_file_location("pvz_source_bundle_packager", ROOT / "source-bundle.py")
        module = importlib.util.module_from_spec(specification)
        sys.modules[specification.name] = module
        old_bytecode = sys.dont_write_bytecode
        try:
            sys.dont_write_bytecode = True
            specification.loader.exec_module(module)
        finally:
            sys.dont_write_bytecode = old_bytecode
        _source_bundle_helpers = module
    return _source_bundle_helpers


def forbidden(name):
    path = PurePosixPath(str(name).replace("\\", "/"))
    return path.suffix.lower() in FORBIDDEN_SUFFIXES or path.name.lower() in FORBIDDEN_NAMES


def engine_inputs():
    """Resolve the current release from its manifests."""
    manifest = DIST / "game" / "engine-provenance.json"
    if not manifest.is_file():
        raise ValueError(f"Required distribution input is missing: {manifest}")
    engine = json.loads(manifest.read_text("utf-8"))
    tag = engine["upstream"]["tag"]
    if not isinstance(tag, str) or not tag or PurePosixPath(tag).name != tag or "\\" in tag:
        raise ValueError("Invalid upstream tag in engine provenance")
    paths = {}
    for field, reference in (("source", engine["artifacts"]["source"]),
                             ("patch", engine["artifacts"]["patch"]),
                             ("buildRecord", engine["buildRecord"])):
        path = (DIST / "game" / reference).resolve()
        if not path.is_relative_to(DIST.resolve()):
            raise ValueError(f"Current {field} must remain inside dist")
        paths[field] = path
    baseline = DIST / "source" / f"pvz-portable-{tag}-source.zip"
    return engine, paths, baseline


def parent_source_input(engine):
    """Resolve and authenticate the immediate parent needed by source checks."""
    parent = engine.get("parent")
    if parent is None:
        return None
    if not isinstance(parent, dict) or not isinstance(parent.get("artifacts"), dict):
        raise ValueError("Invalid immediate-parent engine provenance")
    artifacts = parent["artifacts"]
    reference = artifacts.get("source")
    expected = artifacts.get("sourceSha256")
    if not isinstance(reference, str) or "\\" in reference or ":" in reference:
        raise ValueError("Invalid immediate-parent source reference")
    name = PurePosixPath(reference).name
    if (reference != "../source/" + name or not name.startswith("pvz-portable-")
            or not name.endswith("-source.zip")):
        raise ValueError("Immediate-parent source must be a named archive in dist/source")
    if (not isinstance(expected, str) or len(expected) != 64
            or any(character not in "0123456789abcdef" for character in expected)):
        raise ValueError("Invalid immediate-parent source SHA-256")
    path = DIST / "game" / reference
    if engine.get("id") in EXTENSIONS:
        source_bundle_helpers().ensure_vasebreaker_baseline(ROOT)
        return None
    if engine.get("id") == "0.2.6-web-zvase.1":
        authenticate_zvase1_parent(engine)
        return None
    elif engine.get("id") == "0.2.6-web-zsurvival.1":
        authenticate_zsurvival1_parent(engine)
        return None
    if engine.get("id") == "0.2.6-web-zombotany45.2":
        authenticate_zombotany3_parent(engine)
        return None
    if engine.get("id") == "0.2.6-web-gust.1":
        authenticate_gust_parent(engine)
        return None
    if engine.get("id") == "0.2.6-web-double.1":
        authenticate_double_parent(engine)
        return None
    if engine.get("id") == "0.2.6-web-torch.1" and not path.exists():
        authenticate_torch_parent(engine)
        return None
    if engine.get("id") == "0.2.6-web-ambush.1" and not path.exists():
        authenticate_ambush_parent(engine)
        return None
    if engine.get("id") == "0.2.6-web-scrap.1" and not path.exists():
        # Offline site-source retains the independently pinned complete parent
        # projection instead of nesting a second 44 MB engine test archive.
        authenticate_scrap_parent(engine)
        return None
    if (path.is_symlink() or not path.is_file()
            or not path.resolve().is_relative_to(DIST.resolve())
            or path.resolve().parent != (DIST / "source").resolve()):
        raise ValueError("Immediate-parent source must be a regular file inside dist/source")
    if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
        raise ValueError("Immediate-parent source does not match engine provenance")
    return path.resolve()


def authenticate_scrap_parent(engine, current_sources=None):
    fixture = ROOT / "tests/fixtures/scrap1-parent-reference.json"
    raw = fixture.read_bytes()
    if hashlib.sha256(raw).hexdigest() != "8b58d26c299ca9c277f091354c5ec90b4fc5f1af0fc38ab76169880fd164299e":
        raise ValueError("Scrap Yard parent projection differs from its reviewed fixture")
    reference = json.loads(raw)
    if (engine["parent"]["id"] != reference["parent"]["id"] or
            engine["parent"]["artifacts"]["sourceSha256"] != reference["parent"]["archiveSha256"]):
        raise ValueError("Scrap Yard parent identity differs from the projection")
    if current_sources is None:
        current = DIST / "game" / engine["artifacts"]["source"]
        if hashlib.sha256(current.read_bytes()).hexdigest() != engine["artifacts"]["sourceSha256"]:
            raise ValueError("Scrap Yard source archive differs from provenance")
        with zipfile.ZipFile(current) as archive:
            current_sources = {name: archive.read("scrap1-candidate/source/" + name)
                               for name in reference["files"]}
    for name, pin in reference["files"].items():
        data = current_sources[name]
        delta = reference["reverseEdits"].get(name)
        if delta:
            if (len(data) != delta["currentBytes"] or
                    hashlib.sha256(data).hexdigest() != delta["currentSha256"]):
                raise ValueError("Changed current parent-projection input: " + name)
            for edit in reversed(delta["edits"]):
                offset = edit["offset"]
                before = base64.b64decode(edit["beforeBase64"], validate=True)
                after = base64.b64decode(edit["afterBase64"], validate=True)
                if data[offset:offset + len(before)] != before:
                    raise ValueError("Invalid parent reverse edit: " + name)
                data = data[:offset] + after + data[offset + len(before):]
        if len(data) != pin["bytes"] or hashlib.sha256(data).hexdigest() != pin["sha256"]:
            raise ValueError("Parent source projection failed: " + name)
    return reference


def authenticate_ambush_parent(engine, current_sources=None):
    """Authenticate complete Scrap and Endless.3 sources without duplicate ZIPs."""
    raw = (ROOT / "tests/fixtures/ambush1-parent-reference.json").read_bytes()
    if hashlib.sha256(raw).hexdigest() != AMBUSH_PARENT_REFERENCE_SHA256:
        raise ValueError("Vase Ambush parent projection differs from its reviewed fixture")
    reference = json.loads(raw)
    if (engine["id"] != "0.2.6-web-ambush.1" or reference["schemaVersion"] != 1 or
            reference["current"] != {"id": engine["id"], "sourceCount": 860} or
            reference["parent"]["id"] != "0.2.6-web-scrap.1" or
            reference["parent"]["archivePrefix"] != "scrap1-candidate/source/" or
            engine["parent"]["id"] != reference["parent"]["id"] or
            reference["parent"]["archiveSha256"] != "6ccb876d55621aa8c31b405c2495b97203fec344905a0920440607557c291a63" or
            engine["parent"]["artifacts"]["sourceSha256"] != reference["parent"]["archiveSha256"] or
            len(reference["files"]) != 856):
        raise ValueError("Vase Ambush parent identity differs from the projection")
    if current_sources is None:
        current = DIST / "game" / engine["artifacts"]["source"]
        if hashlib.sha256(current.read_bytes()).hexdigest() != engine["artifacts"]["sourceSha256"]:
            raise ValueError("Vase Ambush source differs from provenance")
        with zipfile.ZipFile(current) as archive:
            current_sources = {name: archive.read("ambush1-candidate/source/" + name) for name in reference["files"]}
    restored = {}
    if current_sources is not None:
        for name, pin in reference["files"].items():
            data = current_sources[name]
            delta = reference["reverseEdits"].get(name)
            if delta:
                if len(data) != delta["currentBytes"] or hashlib.sha256(data).hexdigest() != delta["currentSha256"]:
                    raise ValueError("Changed Ambush parent-projection input: " + name)
                previous = len(data) + 1
                for edit in reversed(delta["edits"]):
                    offset = edit["offset"]
                    before = base64.b64decode(edit["beforeBase64"], validate=True)
                    after = base64.b64decode(edit["afterBase64"], validate=True)
                    if (not isinstance(offset, int) or offset < 0 or offset >= previous or
                            offset + len(before) > previous or offset + len(before) > len(data) or
                            data[offset:offset + len(before)] != before):
                        raise ValueError("Invalid Ambush parent reverse edit: " + name)
                    data = data[:offset] + after + data[offset + len(before):]
                    previous = offset
            if len(data) != pin["bytes"] or hashlib.sha256(data).hexdigest() != pin["sha256"]:
                raise ValueError("Complete Scrap parent source failed: " + name)
            restored[name] = data
    authenticate_scrap_parent(engine["parent"], restored)
    return restored


def authenticate_torch_parent(engine, current_sources=None):
    """Recover every complete parent source without nesting redundant archives."""
    raw = (ROOT / "tests/fixtures/torch1-parent-reference.json").read_bytes()
    if hashlib.sha256(raw).hexdigest() != TORCH_PARENT_REFERENCE_SHA256:
        raise ValueError("Torch parent projection differs from its independent fixture")
    focused = (ROOT / "tests/fixtures/ambush1-focused-reference.json").read_bytes()
    if hashlib.sha256(focused).hexdigest() != AMBUSH_FOCUSED_REFERENCE_SHA256:
        raise ValueError("Offline Ambush focused evidence differs from its independent fixture")
    reference = json.loads(raw)
    if (engine["id"] != "0.2.6-web-torch.1" or reference["schemaVersion"] != 1 or
            reference["current"] != {"id": engine["id"], "sourceCount": 868} or
            reference["parent"]["id"] != "0.2.6-web-ambush.1" or
            reference["parent"]["archivePrefix"] != "ambush1-candidate/source/" or
            engine["parent"]["id"] != reference["parent"]["id"] or
            reference["parent"]["archiveSha256"] != "6da0b6e19d56b3b345a684d379453abecff055a6d788cc17bd161f412bf3e7c9" or
            engine["parent"]["artifacts"]["sourceSha256"] != reference["parent"]["archiveSha256"] or
            len(reference["files"]) != 860):
        raise ValueError("Torch parent identity differs from the independent projection")
    if current_sources is None:
        current = DIST / "game" / engine["artifacts"]["source"]
        if hashlib.sha256(current.read_bytes()).hexdigest() != engine["artifacts"]["sourceSha256"]:
            raise ValueError("Torch corresponding source differs from provenance")
        with zipfile.ZipFile(current) as archive:
            current_sources = {name: archive.read("torch1-candidate/source/" + name)
                               for name in reference["files"]}
    restored = {}
    for name, pin in reference["files"].items():
        data = current_sources[name]
        delta = reference["reverseEdits"].get(name)
        if delta:
            if len(data) != delta["currentBytes"] or hashlib.sha256(data).hexdigest() != delta["currentSha256"]:
                raise ValueError("Changed Torch projection input: " + name)
            previous = len(data) + 1
            for edit in reversed(delta["edits"]):
                offset = edit["offset"]
                before = base64.b64decode(edit["beforeBase64"], validate=True)
                after = base64.b64decode(edit["afterBase64"], validate=True)
                if (not isinstance(offset, int) or offset < 0 or offset >= previous or
                        offset + len(before) > previous or offset + len(before) > len(data) or
                        data[offset:offset + len(before)] != before):
                    raise ValueError("Invalid Torch parent reverse edit: " + name)
                data = data[:offset] + after + data[offset + len(before):]
                previous = offset
        if len(data) != pin["bytes"] or hashlib.sha256(data).hexdigest() != pin["sha256"]:
            raise ValueError("Complete Ambush parent source failed: " + name)
        restored[name] = data
    authenticate_ambush_parent(engine["parent"], restored)
    return restored


def authenticate_double_parent(engine, current_sources=None):
    """Authenticate all868 exact Torch source files without a second native ZIP."""
    raw = (ROOT / "tests/fixtures/double1-parent-reference.json").read_bytes()
    if hashlib.sha256(raw).hexdigest() != DOUBLE_PARENT_REFERENCE_SHA256:
        raise ValueError("Double Agent parent projection differs from its reviewed fixture")
    reference = json.loads(raw)
    expected_changed = {
        "CMake/ProjectVersion.cmake", "src/ConstEnums.h", "src/Lawn/Board.cpp",
        "src/Lawn/Challenge.cpp", "src/Lawn/Plant.cpp", "src/Lawn/SeedPacket.cpp",
        "src/Lawn/System/BonusChallenge.h", "src/Lawn/Widget/ChallengeScreen.cpp",
        "src/Lawn/Widget/LawnDialog.cpp", "src/Lawn/Zombie.cpp", "src/LawnApp.cpp",
    }
    if (set(reference.get("changedPaths", [])) != expected_changed or
            set(reference.get("reverseEdits", {})) != expected_changed):
        raise ValueError("Double Agent changes exceed the reviewed integration paths")
    if (engine["id"] != "0.2.6-web-double.1" or reference["schemaVersion"] != 1 or
            reference["current"] != {"id": engine["id"], "sourceCount": 872} or
            reference["parent"]["id"] != "0.2.6-web-torch.1" or
            reference["parent"]["archivePrefix"] != "torch1-candidate/source/" or
            reference["parent"]["archiveSha256"] != "2e7f7d49093a1aa93d350558b568d2b81b615632b33613631f630a484872b3ba" or
            engine["parent"]["id"] != reference["parent"]["id"] or
            engine["parent"]["artifacts"]["sourceSha256"] != reference["parent"]["archiveSha256"] or
            len(reference["files"]) != 868):
        raise ValueError("Double Agent parent identity differs from its reviewed projection")
    if current_sources is None:
        current = DIST / "game" / engine["artifacts"]["source"]
        if hashlib.sha256(current.read_bytes()).hexdigest() != engine["artifacts"]["sourceSha256"]:
            raise ValueError("Double Agent source archive differs from provenance")
        with zipfile.ZipFile(current) as archive:
            current_sources = {name: archive.read("double1-candidate/source/" + name) for name in reference["files"]}
    restored = {}
    for name, pin in reference["files"].items():
        if (not name or name.startswith('/') or any(part in ('','.','..') for part in name.split('/'))
                or "\\" in name or ':' in name):
            raise ValueError("Unsafe Double Agent projection input")
        data = current_sources[name]
        delta = reference["reverseEdits"].get(name)
        if delta:
            if len(data) != delta["currentBytes"] or hashlib.sha256(data).hexdigest() != delta["currentSha256"]:
                raise ValueError("Changed Double Agent projection input: " + name)
            previous = len(data) + 1
            for edit in reversed(delta["edits"]):
                offset = edit["offset"]
                before = base64.b64decode(edit["beforeBase64"], validate=True)
                after = base64.b64decode(edit["afterBase64"], validate=True)
                if (not isinstance(offset,int) or offset < 0 or offset >= previous or
                        offset + len(before) > previous or offset + len(before) > len(data) or
                        data[offset:offset+len(before)] != before):
                    raise ValueError("Invalid Double Agent parent reverse edit: " + name)
                data = data[:offset] + after + data[offset+len(before):]
                previous = offset
        if len(data) != pin["bytes"] or hashlib.sha256(data).hexdigest() != pin["sha256"]:
            raise ValueError("Complete Torch parent source failed: " + name)
        restored[name] = data
    authenticate_torch_parent(engine["parent"], restored)
    return restored



def authenticate_gust_parent(engine, current_sources=None):
    """Restore all872 Double sources, then each earlier authenticated source."""
    raw = (ROOT / "tests/fixtures/gust1-parent-reference.json").read_bytes()
    if hashlib.sha256(raw).hexdigest() != GUST_PARENT_REFERENCE_SHA256:
        raise ValueError("Gust-bloom parent projection differs from the reviewed fixture")
    reference = json.loads(raw)
    expected_changed = {
        "CMake/ProjectVersion.cmake", "src/ConstEnums.h", "src/Lawn/Board.cpp", "src/Lawn/Challenge.cpp",
        "src/Lawn/Plant.cpp", "src/Lawn/SeedPacket.cpp", "src/Lawn/System/BonusChallenge.h",
        "src/Lawn/System/DeckPresets.h", "src/Lawn/System/MenderBloom.h", "src/Lawn/System/ReanimationLawn.cpp",
        "src/Lawn/Widget/AlmanacDialog.cpp", "src/Lawn/Widget/AlmanacDialog.h", "src/Lawn/Widget/ChallengeScreen.cpp",
        "src/Lawn/Widget/LawnDialog.cpp", "src/Lawn/Widget/SeedChooserScreen.cpp", "src/Lawn/Widget/SeedChooserScreen.h",
        "src/Lawn/Zombie.cpp", "src/LawnApp.cpp",
    }
    if (set(reference.get("changedPaths", [])) != expected_changed or set(reference.get("reverseEdits", {})) != expected_changed):
        raise ValueError("Gust-bloom changes exceed the reviewed integration paths")
    if (engine["id"] != "0.2.6-web-gust.1" or reference["schemaVersion"] != 1 or
            reference["current"] != {"id": engine["id"], "sourceCount": 878} or
            reference["parent"]["id"] != "0.2.6-web-double.1" or
            reference["parent"]["archivePrefix"] != "double1-candidate/source/" or
            reference["parent"]["archiveSha256"] != "35b635770bbb040dd3b2c41c4c86ed49f351cbd29926b8efa286394ff89ad5b3" or
            engine["parent"]["id"] != reference["parent"]["id"] or
            engine["parent"]["artifacts"]["sourceSha256"] != reference["parent"]["archiveSha256"] or len(reference["files"]) != 872):
        raise ValueError("Gust-bloom parent identity differs from its reviewed projection")
    if current_sources is None:
        current = DIST / "game" / engine["artifacts"]["source"]
        if hashlib.sha256(current.read_bytes()).hexdigest() != engine["artifacts"]["sourceSha256"]:
            raise ValueError("Gust-bloom source archive differs from provenance")
        with zipfile.ZipFile(current) as archive:
            prefix = "gust1-candidate/source/"
            current_sources = {name[len(prefix):]: archive.read(name) for name in archive.namelist()
                               if name.startswith(prefix) and not name.endswith('/')}
    added = {"src/Lawn/System/" + stem + suffix for stem in ("GustBloom", "GustChallenge", "GustBloomArt") for suffix in (".cpp", ".h")}
    if len(current_sources) != 878 or set(current_sources) != set(reference["files"]) | added:
        raise ValueError("Gust-bloom source graph differs from the six reviewed additions")
    restored = {}
    for name, pin in reference["files"].items():
        if (not name or name.startswith('/') or any(part in ('','.','..') for part in name.split('/')) or "\\" in name or ':' in name):
            raise ValueError("Unsafe Gust-bloom projection input")
        data = current_sources[name]
        delta = reference["reverseEdits"].get(name)
        if delta:
            if len(data) != delta["currentBytes"] or hashlib.sha256(data).hexdigest() != delta["currentSha256"]:
                raise ValueError("Changed Gust-bloom projection input: " + name)
            previous = len(data) + 1
            for edit in reversed(delta["edits"]):
                offset = edit["offset"]
                before = base64.b64decode(edit["beforeBase64"], validate=True)
                after = base64.b64decode(edit["afterBase64"], validate=True)
                if (not isinstance(offset,int) or offset < 0 or offset >= previous or offset + len(before) > previous or
                        offset + len(before) > len(data) or data[offset:offset+len(before)] != before):
                    raise ValueError("Invalid Gust-bloom parent reverse edit: " + name)
                data = data[:offset] + after + data[offset+len(before):]
                previous = offset
        if len(data) != pin["bytes"] or hashlib.sha256(data).hexdigest() != pin["sha256"]:
            raise ValueError("Complete Double parent source failed: " + name)
        restored[name] = data
    authenticate_double_parent(engine["parent"], restored)
    return restored


def authenticate_zombotany3_parent(engine, current_sources=None):
    """Restore all878 Gust sources, then each earlier authenticated source."""
    raw = (ROOT / "tests/fixtures/zombotany3-parent-reference.json").read_bytes()
    if hashlib.sha256(raw).hexdigest() != ZOMBOTANY3_PARENT_REFERENCE_SHA256:
        raise ValueError("Zombotany3 parent projection differs from the reviewed fixture")
    reference = json.loads(raw)
    expected_changed = {
        "CMake/ProjectVersion.cmake", "src/ConstEnums.h", "src/Lawn/Board.cpp", "src/Lawn/Challenge.cpp",
        "src/Lawn/Plant.cpp", "src/Lawn/Projectile.cpp", "src/Lawn/Zombie.cpp", "src/LawnApp.cpp",
        "src/Lawn/System/BonusChallenge.h", "src/Lawn/System/GustBloom.cpp", "src/Lawn/System/ReanimationLawn.cpp",
        "src/Lawn/Widget/ChallengeScreen.cpp", "src/Lawn/Widget/ChallengeScreen.h",
    }
    if (set(reference.get("changedPaths", [])) != expected_changed or set(reference.get("reverseEdits", {})) != expected_changed):
        raise ValueError("Zombotany3 changes exceed the reviewed integration paths")
    if (engine["id"] != "0.2.6-web-zombotany45.2" or reference["schemaVersion"] != 1 or
            reference["current"] != {"id": engine["id"], "sourceCount": 886} or
            reference["parent"]["id"] != "0.2.6-web-gust.1" or
            reference["parent"]["archivePrefix"] != "gust1-candidate/source/" or
            reference["parent"]["archiveSha256"] != "10acb269866b175ed4836c2c64c6a79dc86a11241de9e48c7be54f8f89808be8" or
            engine["parent"]["id"] != reference["parent"]["id"] or
            engine["parent"]["artifacts"]["sourceSha256"] != reference["parent"]["archiveSha256"] or len(reference["files"]) != 878):
        raise ValueError("Zombotany3 parent identity differs from its reviewed projection")
    if current_sources is None:
        current = DIST / "game" / engine["artifacts"]["source"]
        if hashlib.sha256(current.read_bytes()).hexdigest() != engine["artifacts"]["sourceSha256"]:
            raise ValueError("Zombotany3 source archive differs from provenance")
        with zipfile.ZipFile(current) as archive:
            prefix = "zombotany3-candidate/source/"
            current_sources = {name[len(prefix):]: archive.read(name) for name in archive.namelist()
                               if name.startswith(prefix) and not name.endswith('/')}
    added = {"src/Lawn/System/" + stem + suffix for stem in ("Zombotany3", "Zombotany3Art", "Zombotany45", "Zombotany45Art") for suffix in (".cpp", ".h")}
    if len(current_sources) != 886 or set(current_sources) != set(reference["files"]) | added:
        raise ValueError("Zombotany source graph differs from the eight reviewed additions")
    restored = {}
    for name, pin in reference["files"].items():
        if (not name or name.startswith('/') or any(part in ('','.','..') for part in name.split('/')) or "\\" in name or ':' in name):
            raise ValueError("Unsafe Zombotany3 projection input")
        data = current_sources[name]
        delta = reference["reverseEdits"].get(name)
        if delta:
            if len(data) != delta["currentBytes"] or hashlib.sha256(data).hexdigest() != delta["currentSha256"]:
                raise ValueError("Changed Zombotany3 projection input: " + name)
            previous = len(data) + 1
            for edit in reversed(delta["edits"]):
                offset = edit["offset"]
                before = base64.b64decode(edit["beforeBase64"], validate=True)
                after = base64.b64decode(edit["afterBase64"], validate=True)
                if (not isinstance(offset,int) or offset < 0 or offset >= previous or offset + len(before) > previous or
                        offset + len(before) > len(data) or data[offset:offset+len(before)] != before):
                    raise ValueError("Invalid Zombotany3 parent reverse edit: " + name)
                data = data[:offset] + after + data[offset+len(before):]
                previous = offset
        if len(data) != pin["bytes"] or hashlib.sha256(data).hexdigest() != pin["sha256"]:
            raise ValueError("Complete Gust parent source failed: " + name)
        restored[name] = data
    authenticate_gust_parent(engine["parent"], restored)
    return restored


def authenticate_zvase1_parent(engine, current_sources=None):
    """Restore the exact published45.2 sources without a redundant parent ZIP."""
    raw = (ROOT / "tests/fixtures/zvase1-parent-reference.json").read_bytes()
    if hashlib.sha256(raw).hexdigest() != ZVASE1_PARENT_REFERENCE_SHA256:
        raise ValueError("Zombotany Vasebreaker parent projection is not independently sealed")
    reference = json.loads(raw)
    changed = {'CMake/ProjectVersion.cmake', 'src/ConstEnums.h', 'src/Lawn/Board.cpp', 'src/Lawn/Challenge.cpp', 'src/Lawn/GridItem.cpp', 'src/Lawn/System/ReanimationLawn.cpp', 'src/Lawn/System/ReanimationLawn.h', 'src/Lawn/Widget/AwardScreen.cpp', 'src/Lawn/Widget/ChallengeScreen.cpp', 'src/Lawn/Widget/ChallengeScreen.h', 'src/Lawn/Widget/ContinueDialog.cpp', 'src/Lawn/Widget/LawnDialog.cpp', 'src/Lawn/Zombie.cpp', 'src/LawnApp.cpp'}
    if (engine["id"] != "0.2.6-web-zvase.1" or reference["schemaVersion"] != 1 or
            reference["current"] != {"id": engine["id"], "sourceCount": 891} or
            reference["parent"]["id"] != "0.2.6-web-zsurvival.1" or
            reference["parent"]["archivePrefix"] != "zombotany3-candidate/source/" or
            reference["parent"]["archiveSha256"] != "a3bebe9b89f0816f4e44e00ee4edf3b3a93ec95f1d2e301f26c793252b88d5ba" or
            engine["parent"]["id"] != reference["parent"]["id"] or
            engine["parent"]["artifacts"]["sourceSha256"] != reference["parent"]["archiveSha256"] or
            len(reference["files"]) != 888 or set(reference["changedPaths"]) != changed or
            set(reference["reverseEdits"]) != changed):
        raise ValueError("Zombotany Vasebreaker parent identity or scoped changes differ")
    if current_sources is None:
        current = DIST / "game" / engine["artifacts"]["source"]
        if hashlib.sha256(current.read_bytes()).hexdigest() != engine["artifacts"]["sourceSha256"]:
            raise ValueError("Zombotany Vasebreaker current archive differs from provenance")
        with zipfile.ZipFile(current) as archive:
            prefix = "zombotany3-candidate/source/"
            current_sources = {name[len(prefix):]: archive.read(name) for name in archive.namelist()
                               if name.startswith(prefix) and not name.endswith('/')}
    additions = {"src/Lawn/System/ZombotanyVasebreaker.cpp", "src/Lawn/System/ZombotanyVasebreaker.h", "src/Lawn/System/ZombotanyVasebreakerBoards.h"}
    if len(current_sources) != 891 or set(current_sources) != set(reference["files"]) | additions:
        raise ValueError("Zombotany Vasebreaker source graph exceeds its three additions")
    restored = {}
    for name, pin in reference["files"].items():
        if (not name or name.startswith('/') or any(p in ('', '.', '..') for p in name.split('/')) or
                "\\" in name or ':' in name):
            raise ValueError("Unsafe Zombotany Vasebreaker source path")
        data = current_sources[name]
        delta = reference["reverseEdits"].get(name)
        if delta:
            if len(data) != delta["currentBytes"] or hashlib.sha256(data).hexdigest() != delta["currentSha256"]:
                raise ValueError("Changed Zombotany Vasebreaker projection input: " + name)
            previous = len(data) + 1
            for edit in reversed(delta["edits"]):
                offset = edit["offset"]
                before = base64.b64decode(edit["beforeBase64"], validate=True)
                after = base64.b64decode(edit["afterBase64"], validate=True)
                if (not isinstance(offset, int) or offset < 0 or offset >= previous or
                        offset + len(before) > previous or data[offset:offset + len(before)] != before):
                    raise ValueError("Invalid Zombotany Vasebreaker reverse edit: " + name)
                data = data[:offset] + after + data[offset + len(before):]
                previous = offset
        if len(data) != pin["bytes"] or hashlib.sha256(data).hexdigest() != pin["sha256"]:
            raise ValueError("Published Zombotany Vasebreaker source reconstruction differs: " + name)
        restored[name] = data
    authenticate_zsurvival1_parent(engine["parent"], restored)
    return restored


def authenticate_zsurvival1_parent(engine, current_sources=None):
    """Restore the exact published45.2 sources without a redundant parent ZIP."""
    raw = (ROOT / "tests/fixtures/zsurvival1-parent-reference.json").read_bytes()
    if hashlib.sha256(raw).hexdigest() != ZSURVIVAL1_PARENT_REFERENCE_SHA256:
        raise ValueError("Zombotany Survival parent projection is not independently sealed")
    reference = json.loads(raw)
    changed = {"CMake/ProjectVersion.cmake", "src/ConstEnums.h", "src/Lawn/Board.cpp",
               "src/Lawn/Challenge.cpp", "src/Lawn/Zombie.cpp", "src/LawnApp.cpp",
               "src/Lawn/Widget/AwardScreen.cpp", "src/Lawn/Widget/ChallengeScreen.cpp",
               "src/Lawn/Widget/ChallengeScreen.h", "src/Lawn/Widget/ContinueDialog.cpp",
               "src/Lawn/Widget/LawnDialog.cpp"}
    if (engine["id"] != "0.2.6-web-zsurvival.1" or reference["schemaVersion"] != 1 or
            reference["current"] != {"id": engine["id"], "sourceCount": 888} or
            reference["parent"]["id"] != "0.2.6-web-zombotany45.2" or
            reference["parent"]["archivePrefix"] != "zombotany3-candidate/source/" or
            reference["parent"]["archiveSha256"] != "b7bd098307ffeb7a46379951942c3bc767f016e1c342210e2a43af412a03c7ff" or
            engine["parent"]["id"] != reference["parent"]["id"] or
            engine["parent"]["artifacts"]["sourceSha256"] != reference["parent"]["archiveSha256"] or
            len(reference["files"]) != 886 or set(reference["changedPaths"]) != changed or
            set(reference["reverseEdits"]) != changed):
        raise ValueError("Zombotany Survival parent identity or scoped changes differ")
    if current_sources is None:
        current = DIST / "game" / engine["artifacts"]["source"]
        if hashlib.sha256(current.read_bytes()).hexdigest() != engine["artifacts"]["sourceSha256"]:
            raise ValueError("Zombotany Survival current archive differs from provenance")
        with zipfile.ZipFile(current) as archive:
            prefix = "zombotany3-candidate/source/"
            current_sources = {name[len(prefix):]: archive.read(name) for name in archive.namelist()
                               if name.startswith(prefix) and not name.endswith('/')}
    additions = {"src/Lawn/System/ZombotanySurvival" + ext for ext in (".h", ".cpp")}
    if len(current_sources) != 888 or set(current_sources) != set(reference["files"]) | additions:
        raise ValueError("Zombotany Survival source graph exceeds its two additions")
    restored = {}
    for name, pin in reference["files"].items():
        if (not name or name.startswith('/') or any(p in ('', '.', '..') for p in name.split('/')) or
                "\\" in name or ':' in name):
            raise ValueError("Unsafe Zombotany Survival source path")
        data = current_sources[name]
        delta = reference["reverseEdits"].get(name)
        if delta:
            if len(data) != delta["currentBytes"] or hashlib.sha256(data).hexdigest() != delta["currentSha256"]:
                raise ValueError("Changed Zombotany Survival projection input: " + name)
            previous = len(data) + 1
            for edit in reversed(delta["edits"]):
                offset = edit["offset"]
                before = base64.b64decode(edit["beforeBase64"], validate=True)
                after = base64.b64decode(edit["afterBase64"], validate=True)
                if (not isinstance(offset, int) or offset < 0 or offset >= previous or
                        offset + len(before) > previous or data[offset:offset + len(before)] != before):
                    raise ValueError("Invalid Zombotany Survival reverse edit: " + name)
                data = data[:offset] + after + data[offset + len(before):]
                previous = offset
        if len(data) != pin["bytes"] or hashlib.sha256(data).hexdigest() != pin["sha256"]:
            raise ValueError("Published Zombotany45.2 source reconstruction differs: " + name)
        restored[name] = data
    authenticate_zombotany3_parent(engine["parent"], restored)
    return restored


def nested_source_inputs(engine, paths, baseline):
    """Nest upstream/needed parents; restore the exact current ZIP before checks."""
    source_bundle_helpers().ensure_source_archive(ROOT)
    parent = parent_source_input(engine)
    # Retain the independently authenticated complete Board/SeedPacket files,
    # without nesting an entire historical engine archive for two references.
    # The standalone historical archive and download inventory stay available.
    native_ui = ROOT / "tests/fixtures/native-ui-reference.json"
    if (not native_ui.is_file() or native_ui.is_symlink()
            or hashlib.sha256(native_ui.read_bytes()).hexdigest()
            != "d9861034849eca9d637197aa78a1bae4c90b5656db91ca102d8c903100031edd"):
        raise ValueError("Authenticated native I, Zombie UI fixture is missing or changed")
    if engine.get("id") in EXTENSIONS:
        # The current ZIP and historical suffixes reconstruct the extension archives.
        return [baseline]
    if engine.get("id") in {"0.2.6-web-scrap.1", "0.2.6-web-ambush.1", "0.2.6-web-torch.1", "0.2.6-web-double.1", "0.2.6-web-gust.1", "0.2.6-web-zombotany45.2", "0.2.6-web-zsurvival.1", "0.2.6-web-zvase.1"}:
        if engine["id"] == "0.2.6-web-zvase.1":
            authenticate_zvase1_parent(engine)
        elif engine["id"] == "0.2.6-web-zsurvival.1":
            authenticate_zsurvival1_parent(engine)
        elif engine["id"] == "0.2.6-web-zombotany45.2":
            authenticate_zombotany3_parent(engine)
        elif engine["id"] == "0.2.6-web-gust.1":
            authenticate_gust_parent(engine)
        elif engine["id"] == "0.2.6-web-double.1":
            authenticate_double_parent(engine)
        elif engine["id"] == "0.2.6-web-torch.1":
            authenticate_torch_parent(engine)
        elif engine["id"] == "0.2.6-web-ambush.1":
            authenticate_ambush_parent(engine)
        else:
            authenticate_scrap_parent(engine)
        source_bundle_helpers().ensure_source_archive(ROOT)
        comparator = DIST / "source" / LEGACY_SOURCE_NAME
        if hashlib.sha256(comparator.read_bytes()).hexdigest() != "b9095c65547c3d013917ae4188e284f18eabb71a98020ca3d53f71f7365f9566":
            raise ValueError("Historical Endless.2 comparator archive differs")
        # The exact comparator is restored from shared compressed streams. Its
        # original ZIP bytes remain in the full repository/runtime distribution.
        return [baseline]
    return list(dict.fromkeys([baseline, *([parent] if parent else [])]))


def validate_engine_inputs():
    source_bundle_helpers().ensure_source_archive(ROOT)
    engine, paths, baseline = engine_inputs()
    parent_source_input(engine)  # Fail before packaging writes if the parent is missing or changed.
    for path in [*paths.values(), baseline]:
        if not path.is_file() or path.stat().st_size == 0:
            raise ValueError(f"Required current distribution input is missing: {path}")
    build = json.loads(paths["buildRecord"].read_text("utf-8"))
    if build["id"] != engine["id"]:
        raise ValueError("Engine and build provenance identify different releases")
    for path, expected in (
        (DIST / "game" / "pvz-portable.js", engine["artifacts"]["jsSha256"]),
        (DIST / "game" / "pvz-portable.wasm", engine["artifacts"]["wasmSha256"]),
        (paths["source"], engine["artifacts"]["sourceSha256"]),
        (paths["patch"], engine["artifacts"]["patchSha256"]),
    ):
        if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            raise ValueError(f"Current artifact does not match engine provenance: {path}")
    return engine, paths, baseline


def assert_static_asset_limit(path, label=None):
    size = path.stat().st_size
    if size > MAX_STATIC_ASSET_BYTES:
        raise ValueError(f"Static asset exceeds GitHub 100 MiB file limit: {label or path} ({size} bytes)")


def validate_game_assets():
    """Verify only the six approved bundled data files, never installed game state."""
    recipe = ROOT / "bundle-game-assets.py"
    if not recipe.is_file():
        raise ValueError("The bundled game-asset recipe is missing")
    specification = importlib.util.spec_from_file_location("bundled_game_assets", recipe)
    module = importlib.util.module_from_spec(specification)
    old_bytecode = sys.dont_write_bytecode
    try:
        sys.dont_write_bytecode = True
        specification.loader.exec_module(module)
    finally:
        sys.dont_write_bytecode = old_bytecode
    manifest = module.verify_bundle(DIST / "game-assets")
    engine, _, _ = engine_inputs()
    if (engine.get("gameAssetsIncluded") is not True
            or engine.get("assetBundleId") != manifest["id"]
            or engine.get("assetManifest") != "../game-assets/manifest.json"):
        raise ValueError("Engine distribution metadata does not identify the bundled assets")


def regenerate_source_downloads(transport_entries=None):
    """Deterministic inventory from existing archive bytes; no inferred URL or hash."""
    engine, paths, baseline = engine_inputs()
    nested = nested_source_inputs(engine, paths, baseline)
    transport_entries = transport_entries if transport_entries is not None else source_bundle_helpers().make_bundle_transports(ROOT)
    literal_path = TRANSPORT_LITERALS + ".xz" if TRANSPORT_LITERALS + ".xz" in transport_entries else TRANSPORT_LITERALS
    literal_encoding = "xz" if literal_path.endswith(".xz") else "raw"
    if engine["id"] == "0.2.6-web-zpins.1" and literal_encoding == "xz":
        literal_encoding = "xz-deflate-streams-v1"
    if set(transport_entries) != {TRANSPORT_MANIFEST, literal_path,
                                 CURRENT_TRANSPORT_MANIFEST, CURRENT_TRANSPORT_PAYLOAD}:
        raise ValueError("Unexpected source-archive transport entries")
    helpers = source_bundle_helpers()
    current_zip = helpers.decode_current_transport(
        transport_entries[CURRENT_TRANSPORT_MANIFEST], transport_entries[CURRENT_TRANSPORT_PAYLOAD],
        expected_target_path=paths["source"].relative_to(ROOT).as_posix(),
        expected_target_sha256=engine["artifacts"]["sourceSha256"],
        expected_target_bytes=paths["source"].stat().st_size)
    historical_manifest = transport_entries[TRANSPORT_MANIFEST]
    literals = transport_entries[literal_path]
    if literal_path.endswith(".xz"):
        literals = helpers.decode_packed_literals(literals, json.loads(historical_manifest)["literals"])
    helpers.decode_source_transport(historical_manifest, literals, current_zip)
    # The outer inspector sees an opaque XZ file, so retain the same complete
    # native-member/path/private-file/CRC audit before writing any transport.
    inspect_zip(current_zip, paths["source"].name)
    previous = {}
    if SOURCE_DOWNLOADS.is_file():
        previous = {item["name"]: item for item in json.loads(SOURCE_DOWNLOADS.read_text("utf-8"))["archives"]}
    revision = None

    def historical_url(path, digest):
        nonlocal revision
        old = previous.get(path.name, {})
        pattern = (r"https://raw\.githubusercontent\.com/Caleb-Guyer/plants-vs-zombies-web/"
                   r"[0-9a-f]{40}/dist/source/" + re.escape(path.name))
        if old.get("sha256") == digest and re.fullmatch(pattern, old.get("url", "")):
            return old["url"]  # Also keeps offline source repackaging independent of Git.
        if revision is None:
            repository = Path(subprocess.check_output(
                ["git", "rev-parse", "--show-toplevel"], cwd=ROOT, text=True).strip()).resolve()
            if repository != ROOT.resolve():
                raise ValueError("New historical source URLs require this release repository")
            revision = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
            if not re.fullmatch(r"[0-9a-f]{40}", revision):
                raise ValueError("Invalid historical source revision")
        committed = subprocess.check_output(["git", "show", revision + ":dist/source/" + path.name], cwd=ROOT)
        if hashlib.sha256(committed).hexdigest() != digest:
            raise ValueError("Commit the exact historical source archive before publishing: " + path.name)
        return ("https://raw.githubusercontent.com/Caleb-Guyer/plants-vs-zombies-web/"
                + revision + "/dist/source/" + path.name)

    archives = []
    for path in sorted((DIST / "source").glob("pvz-portable-*-source.zip")):
        if not path.is_file() or path.is_symlink():
            raise ValueError(f"Source download must be a regular file: {path}")
        data = path.read_bytes()
        digest = hashlib.sha256(data).hexdigest()
        current = path.resolve() == paths["source"]
        upstream = path == baseline
        archives.append({"name": path.name, "bytes": len(data),
                         "sha256": digest, "current": current, "upstream": upstream,
                         "url": "./" + path.name if current or upstream else historical_url(path, digest)})
    if sum(item["current"] for item in archives) != 1 or sum(item["upstream"] for item in archives) != 1:
        raise ValueError("Current and upstream source downloads must both exist")
    index = {
        "schema_version": 1,
        "current_engine": engine["id"],
        "upstream_tag": engine["upstream"]["tag"],
        "layout": ("Site source includes the upstream baseline and the native ZomBotany extension patches. "
                   "The current complete native source ZIP is restored offline from the lossless XZ transport. "
                   "The shared I, ZomBotany prefix and published source suffixes restore the earlier extensions. "
                   "Shared byte ranges restore the earlier regression inputs. "
                   "The archive list links the current and upstream sources on Pages and historical releases at immutable GitHub revisions."),
        "nested_sources": [path.name for path in nested],
        "restored_sources": [{
            "name": paths["source"].name,
            "path": paths["source"].relative_to(ROOT).as_posix(),
            "bytes": paths["source"].stat().st_size,
            "sha256": engine["artifacts"]["sourceSha256"],
            "automatic_before_checks": True,
            "encoding": "xz",
            "manifest": {"path": CURRENT_TRANSPORT_MANIFEST,
                         "bytes": len(transport_entries[CURRENT_TRANSPORT_MANIFEST]),
                         "sha256": hashlib.sha256(transport_entries[CURRENT_TRANSPORT_MANIFEST]).hexdigest()},
            "compressed_payload": {"path": CURRENT_TRANSPORT_PAYLOAD,
                                   "bytes": len(transport_entries[CURRENT_TRANSPORT_PAYLOAD]),
                                   "sha256": hashlib.sha256(transport_entries[CURRENT_TRANSPORT_PAYLOAD]).hexdigest()},
        }, {
            "name": LEGACY_SOURCE_NAME,
            "path": "dist/source/" + LEGACY_SOURCE_NAME,
            "bytes": 40424282,
            "sha256": "b9095c65547c3d013917ae4188e284f18eabb71a98020ca3d53f71f7365f9566",
            "automatic_before_checks": True,
            "manifest": {"path": TRANSPORT_MANIFEST, "bytes": len(transport_entries[TRANSPORT_MANIFEST]),
                         "sha256": hashlib.sha256(transport_entries[TRANSPORT_MANIFEST]).hexdigest()},
            "literal_payload": {"path": literal_path, "bytes": len(transport_entries[literal_path]),
                                "encoding": literal_encoding,
                                "sha256": hashlib.sha256(transport_entries[literal_path]).hexdigest()},
        }],
        "nested_patches": sorted(nested_patches(engine)),
        "archives": archives,
    }
    SOURCE_DOWNLOADS.write_text(json.dumps(index, indent=2, ensure_ascii=True) + "\n", encoding="utf-8", newline="\n")


def inspect_zip(data, label, depth=0):
    """Audit nested source archives as well as the outer distribution."""
    if depth > 4:
        raise ValueError(f"Unexpected archive nesting in {label}")
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        names = set()
        for info in archive.infolist():
            path = PurePosixPath(info.filename.replace("\\", "/"))
            if path.is_absolute() or ".." in path.parts or ":" in str(path):
                raise ValueError(f"Unsafe archive path in {label}: {info.filename}")
            if info.filename in names:
                raise ValueError(f"Duplicate archive entry in {label}: {info.filename}")
            names.add(info.filename)
            if forbidden(info.filename):
                raise ValueError(f"Prohibited resource/private file in {label}: {info.filename}")
            if not info.is_dir() and path.suffix.lower() == ".zip":
                inspect_zip(archive.read(info), f"{label}/{info.filename}", depth + 1)
        bad = archive.testzip()
        if bad:
            raise ValueError(f"Archive CRC failure in {label}: {bad}")


def nested_patches(engine):
    names = {PurePosixPath(engine["artifacts"]["patch"]).name}
    while engine["id"] in EXTENSIONS and engine["id"] != "0.2.6-web-izombotany.1":
        engine = engine["parent"]
        names.add(PurePosixPath(engine["artifacts"]["patch"]).name)
    return names


def collect_dist(include_site_source=False, source_bundle=False):
    engine, paths, baseline = engine_inputs()
    nested_source_names = {path.name for path in nested_source_inputs(engine, paths, baseline)}
    patch_names = nested_patches(engine)
    files = []
    for path in sorted(DIST.rglob("*")):
        if not path.is_file():
            continue
        if path.is_symlink():
            raise ValueError(f"Refusing symbolic-link input: {path}")
        if path == SITE_SOURCE and not include_site_source:
            continue
        # Check every served file, including historical archives omitted only
        # from the nested site-source bundle. The rebuilt site-source is checked
        # before replacement below, then included in the final dist check.
        assert_static_asset_limit(path)
        if (source_bundle and path.is_relative_to(DIST / "game-assets")
                and path.name not in {"manifest.json", "README.txt"}):
            continue  # Asset data is served separately; avoid duplicating it in code source.
        if (source_bundle and path.parent == DIST / "source"
                and path.name.startswith("pvz-portable-") and path.suffix.lower() == ".zip"
                and path.name not in nested_source_names):
            continue  # Exact historical source downloads remain standalone in dist/source.
        if (source_bundle and path.parent == DIST / "source"
                and path.suffix.lower() == ".patch" and path.name not in patch_names):
            continue  # Complete source/current full patch suffice for checks and rebuilding.
        if forbidden(path.name):
            raise ValueError(f"Remove prohibited resource/private file from dist: {path}")
        if any(part in {".git", "node_modules", "__pycache__"} for part in path.relative_to(DIST).parts):
            continue
        files.append(path)
    return files


def root_sources():
    missing = [name for name in REQUIRED_ROOT if not (ROOT / name).is_file() or (ROOT / name).stat().st_size == 0]
    if missing:
        raise ValueError("Finalize the required source files before packaging: " + ", ".join(missing))
    files = {ROOT / name for name in REQUIRED_ROOT}
    # Retain supporting original source/docs without accidentally including
    # runtime caches, downloaded QA packs, or repository/credential metadata.
    for pattern in ("*.mjs", "*.js", "*.py", "*.md"):
        files.update(ROOT.glob(pattern))
    files.update((ROOT / ".github" / "workflows").glob("*.yml"))
    for path in (ROOT / "tests").rglob("*"):
        if path.is_file() and not any(part in {".git", "node_modules", "__pycache__"} for part in path.relative_to(ROOT).parts):
            files.add(path)
    # Include the historical representation decoded by this release's test suites.
    engine = engine_inputs()[0]
    active_id = engine["id"]
    if active_id in HISTORICAL_BROWSERS:
        history = ROOT / "tests/fixtures/historical"
        capsule = history / HISTORICAL_BROWSERS[active_id]
        for release, name in HISTORICAL_BROWSERS.items():
            if release != active_id:
                files.discard(history / name)
        if active_id not in ("0.2.6-web-zsnight.1", "0.2.6-web-zspool.1"):
            parent = engine["parent"]
            while parent["id"] in HISTORICAL_BROWSERS or parent["id"] == "0.2.6-web-zbeghouled.1":
                key = parent["id"].removeprefix("0.2.6-web-").removesuffix(".1")
                raw = history / (key + "1-published") / "source-suffix.bin"
                if not raw.with_suffix(".xz").is_file():
                    raise ValueError("Missing compact source suffix for " + key)
                files.discard(raw)
                parent = parent["parent"]
        if not capsule.is_file():
            raise ValueError("Missing historical browser executables")
        for ext in ("js", "wasm"):
            files.discard(history / f"izombotany1-published/pvz-portable.{ext}")
    manifest = ROOT / ".openai" / "hosting.json"
    if manifest.is_file():
        files.add(manifest)
    return sorted(files)


def write_archive(destination, inputs, virtual_entries=None):
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=destination.parent, suffix=".tmp", delete=False) as file:
        temporary = Path(file.name)
    try:
        with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
            names = set()
            for path in inputs:
                if path.is_symlink():
                    raise ValueError(f"Refusing symbolic-link input: {path}")
                relative = path.relative_to(ROOT).as_posix()
                if forbidden(relative):
                    raise ValueError(f"Prohibited input: {relative}")
                if relative in names:
                    raise ValueError(f"Duplicate source input: {relative}")
                names.add(relative)
                archive.write(path, relative)
            for relative, data in sorted((virtual_entries or {}).items()):
                if not isinstance(relative, str):
                    raise ValueError("Virtual source input names must be strings")
                name = PurePosixPath(relative)
                if (not relative or "\\" in relative or ":" in relative
                        or name.is_absolute() or any(part in {"", ".", ".."} for part in relative.split("/"))
                        or relative in names or forbidden(relative) or not isinstance(data, bytes)):
                    raise ValueError(f"Invalid virtual source input: {relative}")
                names.add(relative)
                info = zipfile.ZipInfo(relative, date_time=(1980, 1, 1, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = 0o100644 << 16
                archive.writestr(info, data, compresslevel=9)
        inspect_zip(temporary.read_bytes(), destination.name)
        if destination.resolve().is_relative_to(DIST.resolve()):
            assert_static_asset_limit(temporary, destination)
        temporary.replace(destination)
    finally:
        if temporary.exists():
            temporary.unlink()


def report(path):
    data = path.read_bytes()
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        count = len(archive.infolist())
    print(f"{path}\n  {count} files; {len(data):,} bytes; SHA-256 {hashlib.sha256(data).hexdigest()}")


def main():
    default_output = ROOT.parent.parent / "outputs" if ROOT.parent.name == "work" else ROOT / "outputs"
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=default_output)
    args = parser.parse_args()
    output = args.output_dir.resolve()
    # Fail before writing anything when required finalized inputs are missing.
    sources = root_sources()
    _, current, baseline = validate_engine_inputs()
    validate_game_assets()
    required_dist = (
        DIST / "index.html", DIST / "game" / "pvz-portable.js",
        DIST / "game" / "pvz-portable.wasm",
        baseline, current["source"], current["patch"], current["buildRecord"],
        DIST / "game" / "engine-provenance.json",
        DIST / "licenses" / "LGPL-3.0.txt", DIST / "licenses" / "GPL-3.0.txt",
    )
    for path in required_dist:
        if not path.is_file():
            raise ValueError(f"Required distribution input is missing: {path}")
    collect_dist()  # Validate every served input before updating generated metadata.
    transport_entries = source_bundle_helpers().make_bundle_transports(ROOT)
    regenerate_source_downloads(transport_entries)
    dist_sources = collect_dist(source_bundle=True)
    write_archive(SITE_SOURCE, sources + dist_sources, transport_entries)

    output.mkdir(parents=True, exist_ok=True)
    source_output = output / "pvz-classic-browser-source.zip"
    if source_output != SITE_SOURCE:
        shutil.copyfile(SITE_SOURCE, source_output)
    # Runtime also carries build/check/source files so every supplied npm script
    # works after extraction, and embeds the nonrecursive corresponding source.
    runtime_output = output / "pvz-classic-browser.zip"
    write_archive(runtime_output, sources + collect_dist(include_site_source=True))
    for path in (SITE_SOURCE, source_output, runtime_output):
        report(path)


if __name__ == "__main__":
    main()
