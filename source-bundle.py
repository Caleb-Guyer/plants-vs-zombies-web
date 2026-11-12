#!/usr/bin/env python3
"""Restore the exact historical ZIP from current-ZIP spans and literal bytes.

This transports compressed byte streams; it never recompresses or changes an
archive member. The original complete ZIP digest remains the acceptance gate.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
import struct
import sys
import tempfile
import zipfile

FORMAT = "pvz-exact-zip-reference-v1"
TARGET_REL = "dist/source/pvz-portable-0.2.6-web-endless.2-source.zip"
TARGET_BYTES = 40_424_282
TARGET_SHA256 = "b9095c65547c3d013917ae4188e284f18eabb71a98020ca3d53f71f7365f9566"
MANIFEST_REL = "source-transports/endless2.json"
LITERALS_REL = "source-transports/endless2.literals"
ENGINE_REL = "dist/game/engine-provenance.json"
MAX_SEGMENTS = 4096
MAX_MANIFEST_BYTES = 2 * 1024 * 1024
MAX_DONOR_BYTES = 100 * 1024 * 1024


class SourceBundleError(ValueError):
    pass


def _require(condition, message):
    if not condition:
        raise SourceBundleError(message)


def _sha(data):
    return hashlib.sha256(data).hexdigest()


def _digest(value):
    _require(isinstance(value, str) and re.fullmatch(r"[a-f0-9]{64}", value),
             "Invalid SHA-256")
    return value


def _uint(value, maximum, *, positive=False):
    _require(type(value) is int and (value > 0 if positive else value >= 0)
             and value <= maximum, "Invalid integer bound")
    return value


def _relative(value):
    _require(isinstance(value, str) and value and not value.startswith("/")
             and not any(c in value for c in ("\\", ":", "\0")), "Unsafe relative path")
    _require(all(part and part not in (".", "..") for part in value.split("/")),
             "Unsafe relative path component")
    return value


def _json(data):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            _require(key not in result, "Duplicate JSON key")
            result[key] = value
        return result
    try:
        value = json.loads(data.decode("utf-8"), object_pairs_hook=unique)
    except (UnicodeError, json.JSONDecodeError) as exc:
        raise SourceBundleError("Invalid transport JSON") from exc
    _require(isinstance(value, dict), "Expected JSON object")
    return value


def _bytes(value):
    _require(isinstance(value, (bytes, bytearray, memoryview)), "Expected byte buffer")
    return bytes(value)


def _record(value, maximum, *, path=None):
    _require(isinstance(value, dict) and set(value) == {"path", "bytes", "sha256"},
             "Invalid file record")
    _relative(value["path"])
    if path is not None:
        _require(value["path"] == path, "Unexpected transport path")
    _uint(value["bytes"], maximum, positive=True)
    _digest(value["sha256"])
    return value


def decode_source_transport(manifest_bytes, literals_bytes, base_bytes, *,
                            expected_target_sha256=TARGET_SHA256,
                            expected_target_bytes=TARGET_BYTES):
    """Pure byte decoder. Keyword overrides are for tiny structural unit tests.

    Production restoration always uses the fixed default original ZIP identity.
    """
    manifest_bytes, literals, donor = map(_bytes, (manifest_bytes, literals_bytes, base_bytes))
    _require(0 < len(manifest_bytes) <= MAX_MANIFEST_BYTES, "Transport manifest too large")
    _uint(expected_target_bytes, TARGET_BYTES, positive=True)
    _digest(expected_target_sha256)
    manifest = _json(manifest_bytes)
    _require(set(manifest) == {"format", "target", "donor", "literals", "segments"}
             and manifest["format"] == FORMAT, "Unsupported transport format")
    target = _record(manifest["target"], TARGET_BYTES, path=TARGET_REL)
    _require(target["bytes"] == expected_target_bytes
             and target["sha256"] == expected_target_sha256, "Unexpected original ZIP identity")
    base = _record(manifest["donor"], MAX_DONOR_BYTES)
    _require(base["path"].startswith("dist/source/")
             and len(PurePosixPath(base["path"]).parts) == 3
             and base["path"].endswith(".zip"), "Unsafe donor archive path")
    payload = _record(manifest["literals"], TARGET_BYTES, path=LITERALS_REL)
    _require(len(donor) == base["bytes"] and _sha(donor) == base["sha256"],
             "Donor archive bytes differ")
    _require(len(literals) == payload["bytes"] and _sha(literals) == payload["sha256"],
             "Literal payload bytes differ")
    segments = manifest["segments"]
    _require(isinstance(segments, list) and 0 < len(segments) <= MAX_SEGMENTS,
             "Invalid segment count")
    output = bytearray(expected_target_bytes)
    cursor = literal_cursor = 0
    for segment in segments:
        _require(isinstance(segment, dict) and set(segment) ==
                 {"kind", "targetOffset", "sourceOffset", "bytes", "sha256"},
                 "Invalid segment record")
        _require(segment["kind"] in ("literal", "donor"), "Unknown segment kind")
        start = _uint(segment["targetOffset"], expected_target_bytes)
        length = _uint(segment["bytes"], expected_target_bytes, positive=True)
        source = _uint(segment["sourceOffset"], MAX_DONOR_BYTES)
        _digest(segment["sha256"])
        _require(start == cursor and length <= expected_target_bytes - cursor,
                 "Target segments must cover the original ZIP exactly in order")
        data = literals if segment["kind"] == "literal" else donor
        _require(source <= len(data) and length <= len(data) - source,
                 "Segment exceeds source bounds")
        if segment["kind"] == "literal":
            _require(source == literal_cursor, "Literal segments must consume payload sequentially")
            literal_cursor += length
        chunk = memoryview(data)[source:source + length]
        _require(_sha(chunk) == segment["sha256"], "Segment bytes differ")
        output[cursor:cursor + length] = chunk
        cursor += length
    _require(cursor == expected_target_bytes and literal_cursor == len(literals),
             "Incomplete target or literal coverage")
    _require(_sha(output) == expected_target_sha256, "Restored original ZIP digest differs")
    return bytes(output)


def _root(value):
    value = Path(value)
    info = value.lstat()
    _require(not stat.S_ISLNK(info.st_mode) and stat.S_ISDIR(info.st_mode)
             and not getattr(info, "st_file_attributes", 0) & getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0),
             "Bundle root must be a real directory")
    return value.resolve(strict=True)


def _path(root, relative, *, required=True):
    parts = _relative(relative).split("/")
    current = root
    for index, part in enumerate(parts):
        current = current / part
        try:
            info = current.lstat()
            mode = info.st_mode
        except FileNotFoundError:
            _require(not required and index == len(parts) - 1, "Missing bundle input: " + relative)
            return current
        _require(not stat.S_ISLNK(mode)
                 and not getattr(info, "st_file_attributes", 0) & getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0),
                 "Symlinks and reparse points are not allowed in bundle paths")
        _require(stat.S_ISREG(mode) if index == len(parts) - 1 else stat.S_ISDIR(mode),
                 "Bundle paths require regular files and directories")
    return current


def _read(root, relative, maximum):
    path = _path(root, relative)
    size = path.stat().st_size
    _require(0 < size <= maximum, "Bundle input size outside bounds: " + relative)
    with path.open("rb") as stream:
        data = stream.read(maximum + 1)
    _require(len(data) == size, "Bundle input changed during read: " + relative)
    return data


def _donor(root):
    engine = _json(_read(root, ENGINE_REL, MAX_MANIFEST_BYTES))
    artifacts = engine.get("artifacts")
    _require(isinstance(artifacts, dict), "Engine artifacts are missing")
    reference = artifacts.get("source")
    _require(isinstance(reference, str), "Engine source reference is missing")
    parts = reference.split("/")
    _require(len(parts) == 3 and parts[:2] == ["..", "source"]
             and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*\.zip", parts[2]),
             "Engine source must be a direct native ZIP under dist/source")
    relative = "dist/source/" + parts[2]
    _require(relative != TARGET_REL, "Historical target cannot be its own donor")
    data = _read(root, relative, MAX_DONOR_BYTES)
    _require(_sha(data) == _digest(artifacts.get("sourceSha256")),
             "Current native source differs from engine provenance")
    return {"path": relative, "bytes": len(data), "sha256": _sha(data)}, data


def _target(root):
    path = _path(root, TARGET_REL, required=False)
    if not path.exists():
        return None
    data = _read(root, TARGET_REL, TARGET_BYTES)
    _require(len(data) == TARGET_BYTES and _sha(data) == TARGET_SHA256,
             "Existing historical ZIP is invalid; it will not be overwritten")
    return data


def _report(restored):
    return {"status": "restored" if restored else "already-present", "restored": restored,
            "path": TARGET_REL, "bytes": TARGET_BYTES, "sha256": TARGET_SHA256}


def ensure_source_archive(root):
    """Verify the original ZIP, or atomically create it without replacing a file."""
    root = _root(root)
    if _target(root) is not None:
        return _report(False)
    manifest_bytes = _read(root, MANIFEST_REL, MAX_MANIFEST_BYTES)
    manifest = _json(manifest_bytes)
    donor_record, donor = _donor(root)
    _require(manifest.get("donor") == donor_record,
             "Transport donor differs from the actual current engine source")
    literals = _read(root, LITERALS_REL, TARGET_BYTES)
    output = decode_source_transport(manifest_bytes, literals, donor)
    target = _path(root, TARGET_REL, required=False)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=target.parent, prefix=".endless2-restore-",
                                         suffix=".tmp", delete=False) as stream:
            temporary = Path(stream.name)
            _require(stream.write(output) == len(output), "Incomplete temporary ZIP write")
            stream.flush()
            os.fsync(stream.fileno())
        _require(temporary.stat().st_size == TARGET_BYTES
                 and _sha(temporary.read_bytes()) == TARGET_SHA256, "Temporary ZIP verification failed")
        _path(root, TARGET_REL, required=False)
        try:
            # Windows rename is atomic and fails when the destination exists;
            # POSIX rename can overwrite, so use an atomic no-clobber link there.
            # Both stay on the same filesystem. Never use os.replace.
            if os.name == "nt":
                os.rename(temporary, target)
            else:
                os.link(temporary, target)
        except FileExistsError:
            _require(_target(root) is not None, "Concurrent target disappeared")
            return _report(False)
        except OSError as exc:
            raise SourceBundleError("Atomic no-clobber restoration is unavailable") from exc
        return _report(True)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def _streams(data):
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            infos = archive.infolist()
            _require(len(infos) <= 16_384, "Too many donor ZIP members")
            streams = []
            for info in infos:
                offset = info.header_offset
                _require(0 <= offset <= len(data) - 30 and data[offset:offset + 4] == b"PK\x03\x04",
                         "Invalid local ZIP header")
                name, extra = struct.unpack_from("<HH", data, offset + 26)
                start = offset + 30 + name + extra
                end = start + info.compress_size
                _require(0 <= start <= end <= len(data), "Invalid compressed ZIP data range")
                if end > start:
                    streams.append((start, end))
            return sorted(streams)
    except zipfile.BadZipFile as exc:
        raise SourceBundleError("Invalid native ZIP") from exc


def make_source_transport(root):
    """Return deterministic virtual entries; never writes the input tree."""
    root = _root(root)
    target = _target(root)
    _require(target is not None, "Original historical ZIP is required to build its transport")
    donor_record, donor = _donor(root)
    matches = {}
    for start, end in _streams(donor):
        matches.setdefault((end - start, _sha(memoryview(donor)[start:end])), (start, end))
    segments, literal_parts = [], []
    cursor = literal_size = 0
    for start, end in _streams(target):
        reference = matches.get((end - start, _sha(memoryview(target)[start:end])))
        if reference is None:
            continue
        _require(start >= cursor, "Original ZIP data streams overlap")
        a, b = reference
        _require(donor[a:b] == target[start:end], "Compressed ZIP stream match differs")
        if start > cursor:
            chunk = target[cursor:start]
            segments.append({"kind": "literal", "targetOffset": cursor, "sourceOffset": literal_size,
                             "bytes": len(chunk), "sha256": _sha(chunk)})
            literal_parts.append(chunk)
            literal_size += len(chunk)
        segments.append({"kind": "donor", "targetOffset": start, "sourceOffset": a,
                         "bytes": end - start, "sha256": _sha(target[start:end])})
        cursor = end
    if cursor < len(target):
        chunk = target[cursor:]
        segments.append({"kind": "literal", "targetOffset": cursor, "sourceOffset": literal_size,
                         "bytes": len(chunk), "sha256": _sha(chunk)})
        literal_parts.append(chunk)
    literals = b"".join(literal_parts)
    manifest = {"format": FORMAT,
                "target": {"path": TARGET_REL, "bytes": TARGET_BYTES, "sha256": TARGET_SHA256},
                "donor": donor_record,
                "literals": {"path": LITERALS_REL, "bytes": len(literals), "sha256": _sha(literals)},
                "segments": segments}
    encoded = (json.dumps(manifest, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")
    _require(decode_source_transport(encoded, literals, donor) == target,
             "Transport builder failed exact original ZIP round trip")
    return {MANIFEST_REL: encoded, LITERALS_REL: literals}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", type=Path, default=Path(__file__).resolve().parent)
    arguments = parser.parse_args()
    try:
        print(json.dumps(ensure_source_archive(arguments.root), sort_keys=True))
    except (SourceBundleError, OSError) as exc:
        print("source-bundle: " + str(exc), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
