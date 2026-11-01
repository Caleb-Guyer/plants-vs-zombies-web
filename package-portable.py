#!/usr/bin/env python3
"""Package the browser game, source and explicitly bundled original game assets.

No downloads, dependency installation, engine build or installed-game access occurs.
The source archive contains current engine code, its baseline and asset metadata.
Game asset payloads remain separate served files and in the full runtime archive.
Private QA data and original native executables are never distribution inputs.
"""
import argparse
import hashlib
import io
import importlib.util
import json
from pathlib import Path, PurePosixPath
import shutil
import sys
import tempfile
import zipfile


ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
SITE_SOURCE = DIST / "source" / "site-source.zip"
SOURCE_DOWNLOADS = DIST / "source" / "source-downloads.json"
# Cloudflare Workers/Pages both document 25 MiB per served static asset:
# https://developers.cloudflare.com/workers/platform/limits/
# https://developers.cloudflare.com/pages/platform/limits/
MAX_STATIC_ASSET_BYTES = 25 * 1024 * 1024
REQUIRED_ROOT = (
    ".gitattributes", "README.md", "CURRENT-REQUIREMENTS.md", "PARITY-QA.md", "package.json", "server.mjs",
    "verify-port.mjs", "prepare-port.mjs",
    "package-portable.py", "tests/audio-controls.mjs", "tests/shell-keyboard.mjs", "tests/steam-compat.mjs",
    "tests/test-profile-merge.mjs", "tests/save-storage.mjs", "tests/save-sync.mjs", "tests/save-transfer.mjs", "tests/zombatar-export.mjs",
)
FORBIDDEN_SUFFIXES = {".pak", ".exe", ".dll"}
FORBIDDEN_NAMES = {"qa-resources.zip", "qa-upstream-compat.xml"}


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
    if (path.is_symlink() or not path.is_file()
            or not path.resolve().is_relative_to(DIST.resolve())
            or path.resolve().parent != (DIST / "source").resolve()):
        raise ValueError("Immediate-parent source must be a regular file inside dist/source")
    if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
        raise ValueError("Immediate-parent source does not match engine provenance")
    return path.resolve()


def nested_source_inputs(engine, paths, baseline):
    """Keep only the current, immediate-parent and raw-upstream source packages."""
    parent = parent_source_input(engine)
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
        raise ValueError(f"Static asset exceeds Cloudflare 25 MiB limit: {label or path} ({size} bytes)")


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


def regenerate_source_downloads():
    """Deterministic inventory from existing archive bytes; no inferred URL or hash."""
    engine, paths, baseline = engine_inputs()
    nested = nested_source_inputs(engine, paths, baseline)
    archives = []
    for path in sorted((DIST / "source").glob("pvz-portable-*-source.zip")):
        if not path.is_file() or path.is_symlink():
            raise ValueError(f"Source download must be a regular file: {path}")
        data = path.read_bytes()
        archives.append({"name": path.name, "bytes": len(data),
                         "sha256": hashlib.sha256(data).hexdigest(),
                         "current": path.resolve() == paths["source"],
                         "upstream": path == baseline})
    if sum(item["current"] for item in archives) != 1 or sum(item["upstream"] for item in archives) != 1:
        raise ValueError("Current and upstream source downloads must both exist")
    index = {
        "schema_version": 1,
        "current_engine": engine["id"],
        "upstream_tag": engine["upstream"]["tag"],
        "layout": "Site-source nests current corresponding source, its immediate parent when present, the upstream baseline and the current full patch. Other source archives and incremental/historical patches remain standalone downloads beside this index and in the full runtime distribution.",
        "nested_sources": [path.name for path in nested],
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


def write_archive(destination, inputs):
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=destination.parent, suffix=".tmp", delete=False) as file:
        temporary = Path(file.name)
    try:
        with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
            for path in inputs:
                if path.is_symlink():
                    raise ValueError(f"Refusing symbolic-link input: {path}")
                relative = path.relative_to(ROOT).as_posix()
                if forbidden(relative):
                    raise ValueError(f"Prohibited input: {relative}")
                archive.write(path, relative)
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
    regenerate_source_downloads()
    dist_sources = collect_dist(source_bundle=True)
    write_archive(SITE_SOURCE, sources + dist_sources)

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
