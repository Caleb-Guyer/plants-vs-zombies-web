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
# Current publication target is GitHub Pages, via the existing Pages workflow.
# https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github
MAX_STATIC_ASSET_BYTES = 100 * 1024 * 1024
AMBUSH_PARENT_REFERENCE_SHA256 = "6771fc13bae02cb70dd8de12192f1f18e50302904a7ef1c784a790e6ccb51dd3"
TORCH_PARENT_REFERENCE_SHA256 = "14dc78f0593db13b4e17e559061f84996be9c64f23663bd9ef7556b669fc96f6"
AMBUSH_FOCUSED_REFERENCE_SHA256 = "9463bdd7c262c1749c57b00d25d45257951f8b8b2c8d4511cff630f9c606e9c8"
LEGACY_SOURCE_NAME = "pvz-portable-0.2.6-web-endless.2-source.zip"
TRANSPORT_MANIFEST = "source-transports/endless2.json"
TRANSPORT_LITERALS = "source-transports/endless2.literals"
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


def authenticate_torch_parent(engine):
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
    current = DIST / "game" / engine["artifacts"]["source"]
    if hashlib.sha256(current.read_bytes()).hexdigest() != engine["artifacts"]["sourceSha256"]:
        raise ValueError("Torch corresponding source differs from provenance")
    restored = {}
    with zipfile.ZipFile(current) as archive:
        for name, pin in reference["files"].items():
            data = archive.read("torch1-candidate/source/" + name)
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


def nested_source_inputs(engine, paths, baseline):
    """Include current, parent and upstream; exact UI references ship as fixtures."""
    parent = parent_source_input(engine)
    # Retain the independently authenticated complete Board/SeedPacket files,
    # without nesting an entire historical engine archive for two references.
    # The standalone historical archive and download inventory stay available.
    native_ui = ROOT / "tests/fixtures/native-ui-reference.json"
    if (not native_ui.is_file() or native_ui.is_symlink()
            or hashlib.sha256(native_ui.read_bytes()).hexdigest()
            != "d9861034849eca9d637197aa78a1bae4c90b5656db91ca102d8c903100031edd"):
        raise ValueError("Authenticated native I, Zombie UI fixture is missing or changed")
    if engine.get("id") in {"0.2.6-web-scrap.1", "0.2.6-web-ambush.1", "0.2.6-web-torch.1"}:
        if engine["id"] == "0.2.6-web-torch.1":
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
        return [baseline, paths["source"]]
    return list(dict.fromkeys([baseline, *([parent] if parent else []), paths["source"]]))


def validate_engine_inputs():
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
    transport_entries = transport_entries if transport_entries is not None else source_bundle_helpers().make_source_transport(ROOT)
    if set(transport_entries) != {TRANSPORT_MANIFEST, TRANSPORT_LITERALS}:
        raise ValueError("Unexpected source-archive transport entries")
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
        "layout": "Site-source nests current corresponding source, the upstream baseline, independently pinned complete Ambush.1, Scrap.1 and Endless.3 source projections, the native I, Zombie UI reference and the current full patch. The historical Endless.2 comparator ZIP is restored byte-for-byte before offline checks from compressed byte ranges shared with the current native ZIP and a literal payload. Every original comparator file and archive checksum is preserved. Each archives[].url is its original download location: current and upstream source stay on Pages; historical source archives use immutable GitHub repository URLs and remain in the full runtime distribution. Linked native test artifacts are losslessly packed; the included decoder restores their exact pinned bytes.",
        "nested_sources": [path.name for path in nested],
        "restored_sources": [{
            "name": LEGACY_SOURCE_NAME,
            "path": "dist/source/" + LEGACY_SOURCE_NAME,
            "bytes": 40424282,
            "sha256": "b9095c65547c3d013917ae4188e284f18eabb71a98020ca3d53f71f7365f9566",
            "automatic_before_checks": True,
            "manifest": {"path": TRANSPORT_MANIFEST, "bytes": len(transport_entries[TRANSPORT_MANIFEST]),
                         "sha256": hashlib.sha256(transport_entries[TRANSPORT_MANIFEST]).hexdigest()},
            "literal_payload": {"path": TRANSPORT_LITERALS, "bytes": len(transport_entries[TRANSPORT_LITERALS]),
                                "sha256": hashlib.sha256(transport_entries[TRANSPORT_LITERALS]).hexdigest()},
        }],
        "nested_patches": [paths["patch"].name],
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


def collect_dist(include_site_source=False, source_bundle=False):
    engine, paths, baseline = engine_inputs()
    nested_source_names = {path.name for path in nested_source_inputs(engine, paths, baseline)}
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
                and path.suffix.lower() == ".patch" and path.resolve() != paths["patch"]):
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
    for path in (ROOT / "tests").rglob("*"):
        if path.is_file() and not any(part in {".git", "node_modules", "__pycache__"} for part in path.relative_to(ROOT).parts):
            files.add(path)
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
    transport_entries = source_bundle_helpers().make_source_transport(ROOT)
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
