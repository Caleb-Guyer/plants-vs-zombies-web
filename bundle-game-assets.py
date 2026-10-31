#!/usr/bin/env python3
"""Build and verify the exact six-file Plants vs. Zombies game-data bundle.

An explicit --zip or --game-dir is required. No download or game execution occurs.
Only the checksum-pinned files below are read; native executables and saves are
never copied. Output defaults to dist/game-assets beside this script.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import stat
import zipfile


ROOT = Path(__file__).resolve().parent
PART_SIZE = 8 * 1024 * 1024
APPROVED = {
    "main.pak": (45453180, "5878326408285cb01f83b4fa4edcc66d65e727f6d6ee88563b5b3b287dd259fc"),
    "properties/Layout.xml": (584, "41112aab62a796e9fe90c0654c127a8f2e053f3cc2ab6ac35aa3f8a99ab5578c"),
    "properties/default.xml": (2570, "4a051495830ca117435c2972dda5af7a4355d33964d904c335eb140dcf2e904c"),
    "properties/partner.xml": (667, "4e7ff623b419e36feb578eaccb5e80b838290b01c2d2ae282a0648cecbd80290"),
    "properties/partner.xml.sig": (24, "ca5b57ce55e4c7dac8086656e7b63c41d56e1cc98a6208391f6fbfa800887537"),
    "properties/partner_logo.jpg": (5499, "8bea233c40ddf74decf3ddd0a3d4cef8e1229ca3a756384e78d319aca0b63113"),
}
README = """Plants vs. Zombies original game data
====================================
Game and original data: PopCap Games, Inc., Plants vs. Zombies (2009).
The browser engine's source and license information are supplied separately in
the site's source downloads. This bundle contains the six original runtime data
files identified by bundle-game-assets.py; it contains no executable, native
library, save, player profile, or test fixture.

Data format
-----------
manifest.json uses schemaVersion 1. Each files entry records its original path,
size, SHA-256 and ordered parts (URL, size, SHA-256). URLs are relative to this
directory. main.pak is split into 8 MiB parts, except its final shorter part;
the five properties files each use one part. Concatenating a file's parts in
order reconstructs its original bytes. totalBytes is the sum of file sizes.

id is 'sha256:' followed by SHA-256 of the UTF-8 JSON object containing only
schemaVersion and files, with keys sorted and compact comma/colon separators.
File entries are sorted by original path. The id includes every part URL/hash.
The browser verifies sizes and hashes before importing the reassembled files.

Regenerate with an explicit input:
  python bundle-game-assets.py --zip <six-file-resource-archive.zip>
  python bundle-game-assets.py --game-dir <installed-game-directory>
Verify the packaged data without access to an installation:
  python bundle-game-assets.py --verify-only
"""


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def safe_relative(name):
    path = PurePosixPath(name)
    if (not name or "\\" in name or ":" in name or path.is_absolute()
            or any(part in {"", ".", ".."} for part in name.split("/"))):
        raise ValueError(f"Unsafe relative path: {name!r}")
    return path


def reject_links(path):
    """Reject symlinks/junctions/reparse points, including parent components."""
    absolute = Path(os.path.abspath(path))
    for item in (absolute, *absolute.parents):
        if not item.exists() and not item.is_symlink():
            continue
        info = item.lstat()
        if (item.is_symlink() or getattr(item, "is_junction", lambda: False)()
                or getattr(info, "st_file_attributes", 0) & 0x400):
            raise ValueError(f"Linked/reparse-point input or output is not allowed: {item}")
    return absolute


def checked_bytes(name, data):
    if name not in APPROVED or (len(data), sha256(data)) != APPROVED[name]:
        raise ValueError(f"Unapproved game-data bytes: {name}")
    return data


def read_zip(path):
    path = reject_links(path)
    with zipfile.ZipFile(path) as archive:
        seen = set()
        for info in archive.infolist():
            safe_relative(info.filename)
            if info.filename in seen:
                raise ValueError(f"Duplicate ZIP entry: {info.filename}")
            seen.add(info.filename)
            if (info.filename not in APPROVED or info.is_dir()
                    or stat.S_IFMT(info.external_attr >> 16) == stat.S_IFLNK
                    or info.flag_bits & 1):
                raise ValueError(f"Unexpected/linked/encrypted ZIP entry: {info.filename}")
            if info.file_size != APPROVED[info.filename][0]:
                raise ValueError(f"Unexpected ZIP entry size: {info.filename}")
        if seen != set(APPROVED):
            raise ValueError("ZIP must contain exactly the six approved runtime data files")
        return {name: checked_bytes(name, archive.read(name)) for name in sorted(APPROVED)}


def read_game_dir(path):
    path = reject_links(path).resolve(strict=True)
    if not path.is_dir():
        raise ValueError("--game-dir must name a directory")
    files = {}
    for name in sorted(APPROVED):
        target = reject_links(path.joinpath(*safe_relative(name).parts))
        resolved = target.resolve(strict=True)
        if not resolved.is_relative_to(path) or not resolved.is_file():
            raise ValueError(f"Input escapes the game directory or is not a file: {name}")
        if resolved.stat().st_size != APPROVED[name][0]:
            raise ValueError(f"Unexpected game-data file size: {name}")
        files[name] = checked_bytes(name, resolved.read_bytes())
    return files


def manifest_id(files):
    canonical = json.dumps({"schemaVersion": 1, "files": files}, sort_keys=True,
                           separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return "sha256:" + sha256(canonical)


def make_bundle(originals):
    if set(originals) != set(APPROVED):
        raise ValueError("Build requires exactly the six approved original data files")
    payload = {}
    entries = []
    for name in sorted(APPROVED):
        data = checked_bytes(name, originals[name])
        parts = []
        for index, offset in enumerate(range(0, len(data), PART_SIZE)):
            part = data[offset:offset + PART_SIZE]
            output_name = f"parts/main-{index:03d}.bin" if name == "main.pak" else name
            payload[output_name] = part
            parts.append({"url": "./" + output_name, "size": len(part), "sha256": sha256(part)})
        entries.append({"path": name, "size": len(data), "sha256": sha256(data), "parts": parts})
    manifest = {"schemaVersion": 1, "id": manifest_id(entries),
                "totalBytes": sum(entry["size"] for entry in entries), "files": entries}
    payload["manifest.json"] = (json.dumps(manifest, indent=2, ensure_ascii=False) + "\n").encode("utf-8")
    payload["README.txt"] = README.encode("utf-8")
    return manifest, payload


def expected_payload_names():
    count = (APPROVED["main.pak"][0] + PART_SIZE - 1) // PART_SIZE
    return ({f"parts/main-{index:03d}.bin" for index in range(count)}
            | (set(APPROVED) - {"main.pak"}) | {"manifest.json", "README.txt"})


def audit_output_paths(output, require_complete):
    output = reject_links(output)
    if output.exists() and not output.is_dir():
        raise ValueError("Output must be a directory")
    files = set()
    if output.exists():
        for path in output.rglob("*"):
            reject_links(path)
            relative = path.relative_to(output).as_posix()
            if path.is_dir():
                if relative not in {"parts", "properties"}:
                    raise ValueError(f"Unexpected output directory: {relative}")
            elif path.is_file():
                files.add(relative)
            else:
                raise ValueError(f"Unexpected output object: {relative}")
    expected = expected_payload_names()
    if files - expected or (require_complete and files != expected):
        raise ValueError("Output inventory differs from the approved bundle inventory")
    return output


def verify_bundle(output, originals=None):
    output = audit_output_paths(output, True)
    manifest = json.loads((output / "manifest.json").read_text(encoding="utf-8"))
    if set(manifest) != {"schemaVersion", "id", "totalBytes", "files"} or manifest["schemaVersion"] != 1:
        raise ValueError("Unexpected asset-manifest schema")
    if [entry["path"] for entry in manifest["files"]] != sorted(APPROVED):
        raise ValueError("Manifest files differ from the exact sorted allowlist")
    if manifest["id"] != manifest_id(manifest["files"]):
        raise ValueError("Asset-manifest id mismatch")
    total = 0
    for entry in manifest["files"]:
        name = entry["path"]
        if set(entry) != {"path", "size", "sha256", "parts"}:
            raise ValueError(f"Unexpected file fields: {name}")
        if (entry["size"], entry["sha256"]) != APPROVED[name]:
            raise ValueError(f"Manifest file size/hash differs from approved data: {name}")
        expected_count = (entry["size"] + PART_SIZE - 1) // PART_SIZE
        if len(entry["parts"]) != expected_count:
            raise ValueError(f"Unexpected number of parts: {name}")
        data = bytearray()
        for index, part in enumerate(entry["parts"]):
            relative = f"parts/main-{index:03d}.bin" if name == "main.pak" else name
            size = min(PART_SIZE, entry["size"] - index * PART_SIZE)
            if set(part) != {"url", "size", "sha256"} or part["url"] != "./" + relative or part["size"] != size:
                raise ValueError(f"Unexpected part path/size: {name} part {index}")
            block = output.joinpath(*safe_relative(relative).parts).read_bytes()
            if len(block) != size or sha256(block) != part["sha256"]:
                raise ValueError(f"Part checksum/size mismatch: {relative}")
            data.extend(block)
        checked_bytes(name, data)
        if originals is not None and data != originals[name]:
            raise ValueError(f"Reassembled bytes differ from input: {name}")
        total += len(data)
    if manifest["totalBytes"] != total or (output / "README.txt").read_bytes() != README.encode("utf-8"):
        raise ValueError("Bundle total/readme mismatch")
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--zip", type=Path, help="Archive containing exactly the six approved files")
    source.add_argument("--game-dir", type=Path, help="Installed game directory; reads only approved files")
    source.add_argument("--verify-only", action="store_true", help="Verify existing output without original files")
    parser.add_argument("--output", type=Path, default=ROOT / "dist" / "game-assets")
    args = parser.parse_args()
    if args.verify_only:
        manifest = verify_bundle(args.output)
    else:
        originals = read_zip(args.zip) if args.zip else read_game_dir(args.game_dir)
        output = audit_output_paths(args.output, False)
        if args.game_dir and output.resolve().is_relative_to(args.game_dir.resolve()):
            raise ValueError("Output must be outside the original game installation")
        manifest, payload = make_bundle(originals)
        output.mkdir(parents=True, exist_ok=True)
        for name, data in payload.items():
            target = output.joinpath(*safe_relative(name).parts)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
        manifest = verify_bundle(output, originals)
    print(json.dumps({"status": "PASS", "id": manifest["id"], "totalBytes": manifest["totalBytes"],
                      "files": len(manifest["files"]), "parts": sum(len(f["parts"]) for f in manifest["files"]),
                      "output": str(args.output.resolve())}))


if __name__ == "__main__":
    main()
