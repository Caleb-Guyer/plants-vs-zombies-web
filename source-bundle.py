#!/usr/bin/env python3
"""Restore exact native ZIPs from bounded, lossless outer-only transports.

This transports compressed byte streams; it never recompresses or changes an
archive member. The original complete ZIP digest remains the acceptance gate.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import lzma
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
CURRENT_FORMAT = "pvz-exact-zip-xz-v1"
CURRENT_MANIFEST_REL = "source-transports/current.json"
CURRENT_PAYLOAD_REL = "source-transports/current.xz"
MAX_CURRENT_MEMORY_BYTES = 64 * 1024 * 1024


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


def _native_archive_path(relative):
    parts = _relative(relative).split("/")
    _require(len(parts) == 3 and parts[:2] == ["dist", "source"]
             and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*\.zip", parts[2])
             and relative != TARGET_REL, "Unsafe current native archive path")
    return relative


def decode_current_transport(manifest_bytes, payload_bytes, *, expected_target_path,
                             expected_target_sha256, expected_target_bytes=None,
                             decoder_memory_limit=MAX_CURRENT_MEMORY_BYTES):
    """Decode one XZ stream within its declared output and native memory bounds.

    The caller supplies the independent engine-provenance identity. The stream
    carries the original complete ZIP bytes, not recompressed ZIP members.
    """
    # Bound raw buffers before converting a bytearray/memoryview into a copy.
    # memoryview.nbytes also handles multi-byte element views correctly.
    for value, maximum in ((manifest_bytes, MAX_MANIFEST_BYTES), (payload_bytes, MAX_DONOR_BYTES)):
        _require(isinstance(value, (bytes, bytearray, memoryview)), "Expected byte buffer")
        size = value.nbytes if isinstance(value, memoryview) else len(value)
        _require(0 < size <= maximum, "Current transport input exceeds its byte bound")
    manifest_bytes, payload = map(_bytes, (manifest_bytes, payload_bytes))
    _native_archive_path(expected_target_path)
    _digest(expected_target_sha256)
    _uint(decoder_memory_limit, MAX_CURRENT_MEMORY_BYTES, positive=True)
    manifest = _json(manifest_bytes)
    _require(set(manifest) == {"format", "target", "payload"}
             and manifest["format"] == CURRENT_FORMAT, "Unsupported current transport format")
    target = _record(manifest["target"], MAX_DONOR_BYTES, path=expected_target_path)
    _require(target["sha256"] == expected_target_sha256, "Current ZIP differs from engine provenance")
    if expected_target_bytes is not None:
        _uint(expected_target_bytes, MAX_DONOR_BYTES, positive=True)
        _require(target["bytes"] == expected_target_bytes, "Unexpected current ZIP length")
    encoded = _record(manifest["payload"], MAX_DONOR_BYTES, path=CURRENT_PAYLOAD_REL)
    _require(len(payload) == encoded["bytes"] and _sha(payload) == encoded["sha256"],
             "Current XZ payload bytes differ")
    output = _decode_xz(payload, target["bytes"], decoder_memory_limit)
    _require(_sha(output) == expected_target_sha256, "Restored current ZIP digest differs")
    return output


def _decode_xz(payload, size, decoder_memory_limit=MAX_CURRENT_MEMORY_BYTES):
    try:
        decoder = lzma.LZMADecompressor(format=lzma.FORMAT_XZ, memlimit=decoder_memory_limit)
        output = decoder.decompress(payload, max_length=size + 1)
    except (lzma.LZMAError, MemoryError) as exc:
        raise SourceBundleError("Invalid current XZ stream or decoder memory bound exceeded") from exc
    _require(len(output) == size and decoder.eof and not decoder.unused_data,
             "XZ stream must contain exactly its declared bytes")
    _require(decoder.check == lzma.CHECK_CRC64, "XZ transport requires CRC64")
    return output


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


def _current_reference(root):
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
    _native_archive_path(relative)
    return {"path": relative, "sha256": _digest(artifacts.get("sourceSha256"))}


def _donor(root):
    reference = _current_reference(root)
    relative = reference["path"]
    data = _read(root, relative, MAX_DONOR_BYTES)
    _require(_sha(data) == reference["sha256"],
             "Current native source differs from engine provenance")
    return {"path": relative, "bytes": len(data), "sha256": _sha(data)}, data


def _current_target(root, reference):
    path = _path(root, reference["path"], required=False)
    if not path.exists():
        return None
    data = _read(root, reference["path"], MAX_DONOR_BYTES)
    _require(_sha(data) == reference["sha256"],
             "Existing current native ZIP is invalid; it will not be overwritten")
    return data


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
    """Verify/restore current first, then the exact historical donor comparator.

    The historical return report remains compatible with the original helper.
    """
    root = _root(root)
    ensure_current_archive(root)
    if _target(root) is not None:
        return _report(False)
    manifest_bytes = _read(root, MANIFEST_REL, MAX_MANIFEST_BYTES)
    manifest = _json(manifest_bytes)
    donor_record, donor = _donor(root)
    _require(manifest.get("donor") == donor_record,
             "Transport donor differs from the actual current engine source")
    if _path(root, LITERALS_REL, required=False).exists():
        literals = _read(root, LITERALS_REL, TARGET_BYTES)
    else:
        expected = _record(manifest["literals"], TARGET_BYTES, path=LITERALS_REL)
        payload = _read(root, LITERALS_REL + ".xz", TARGET_BYTES)
        literals = _decode_xz(payload, expected["bytes"])

    output = decode_source_transport(manifest_bytes, literals, donor)
    return _report(_publish_archive(root, TARGET_REL, output,
        {"bytes": TARGET_BYTES, "sha256": TARGET_SHA256}, lambda: _target(root), ".endless2-restore-"))


def _publish_archive(root, relative, output, record, existing, prefix):
    target = _path(root, relative, required=False)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=target.parent, prefix=prefix,
                                         suffix=".tmp", delete=False) as stream:
            temporary = Path(stream.name)
            _require(stream.write(output) == len(output), "Incomplete temporary ZIP write")
            stream.flush()
            os.fsync(stream.fileno())
        _require(temporary.stat().st_size == record["bytes"]
                 and _sha(temporary.read_bytes()) == record["sha256"], "Temporary ZIP verification failed")
        _path(root, relative, required=False)
        try:
            # Windows rename is atomic and fails when the destination exists;
            # POSIX rename can overwrite, so use an atomic no-clobber link there.
            # Both stay on the same filesystem. Never use os.replace.
            if os.name == "nt":
                os.rename(temporary, target)
            else:
                os.link(temporary, target)
        except FileExistsError:
            _require(existing() is not None, "Concurrent target disappeared")
            return False
        except OSError as exc:
            raise SourceBundleError("Atomic no-clobber restoration is unavailable") from exc
        return True
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def ensure_current_archive(root):
    """Verify or atomically restore the current ZIP without clobbering a file."""
    root = _root(root)
    reference = _current_reference(root)
    present = _current_target(root, reference)
    if present is not None:
        return {"status": "already-present", "restored": False,
                **reference, "bytes": len(present)}
    manifest_bytes = _read(root, CURRENT_MANIFEST_REL, MAX_MANIFEST_BYTES)
    manifest = _json(manifest_bytes)
    payload = _read(root, CURRENT_PAYLOAD_REL, MAX_DONOR_BYTES)
    output = decode_current_transport(manifest_bytes, payload,
        expected_target_path=reference["path"], expected_target_sha256=reference["sha256"])
    restored = _publish_archive(root, reference["path"], output, manifest["target"],
        lambda: _current_target(root, reference), ".native-current-restore-")
    return {"status": "restored" if restored else "already-present", "restored": restored,
            **reference, "bytes": len(output)}


def ensure_vasebreaker_baseline(root):
    """Recover the previously published ZIP from the sealed prefix of its successor."""
    root = _root(root)
    engine = _json(_read(root, ENGINE_REL, MAX_MANIFEST_BYTES))
    reference = {"path": "dist/source/pvz-portable-0.2.6-web-zvase.1-source.zip",
                 "sha256": "d9d4351181e09f1b0eceacc8203bf4d0bcf46910b7e27027c762b521d8805f2b"}
    size = 94_720_307
    if engine.get("id") == "0.2.6-web-zspool.1":
        previous = engine.get("parent", {})
        _require(previous.get("id") == "0.2.6-web-zsnight.1" and
                 engine.get("sourceArchiveBase") == previous.get("sourceArchiveBase"),
                 "Unexpected Survival Night parent")
        engine = previous
    if engine.get("id") == "0.2.6-web-zsnight.1":
        base = engine.get("sourceArchiveBase", {})
        previous = engine.get("parent", {})
        _require(previous.get("id") == "0.2.6-web-zbeghouled.1" and
                 base.get("id") == previous.get("parent", {}).get("id") and
                 base.get("bytes") == previous.get("parentArchivePrefixBytes") and
                 base.get("sha256") == previous.get("parent", {}).get("artifacts", {}).get("sourceSha256"),
                 "Unexpected shared source ancestry")
        engine = previous
    if engine.get("id") == "0.2.6-web-zbeghouled.1":
        _require(engine.get("parentArchivePrefixBytes") == 100_558_183 and
                 engine.get("parent", {}).get("artifacts", {}).get("sourceSha256") ==
                 "ab56f8150ddaf8d8985de74afeea2b51c7c09ef800d0f4ba58cd3a270393152c",
                 "Unexpected I, ZomBotany parent")
        engine = engine["parent"]
    _require(engine.get("id") == "0.2.6-web-izombotany.1" and
             engine.get("parent", {}).get("artifacts", {}).get("sourceSha256") == reference["sha256"] and
             engine.get("parentArchivePrefixBytes") == size, "Unexpected regression baseline")
    if _current_target(root, reference) is not None:
        return
    ensure_current_archive(root)
    current = _current_reference(root)
    path = _path(root, current["path"])
    with path.open("rb") as stream:
        original = stream.read(size)
    _require(len(original) == size and _sha(original) == reference["sha256"],
             "Retained Vasebreaker ZIP differs from the previous public release")
    _publish_archive(root, reference["path"], original, {**reference, "bytes": size},
                     lambda: _current_target(root, reference), ".vasebreaker-restore-")


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


def make_current_transport(root):
    """Return two deterministic outer-only entries; leave the native ZIP exact."""
    root = _root(root)
    target, original = _donor(root)
    options = {"preset": 8}
    if target["path"].endswith("/pvz-portable-0.2.6-web-zspool.1-source.zip"):
        # Pool's shared ZIP prefix contains matching spans more than 32 MiB apart.
        # A 48 MiB dictionary still decodes within the existing 64 MiB limit.
        options = {"filters": [{"id": lzma.FILTER_LZMA2, "preset": 8, "dict_size": 48 * 1024 * 1024}]}
    payload = lzma.compress(original, format=lzma.FORMAT_XZ, check=lzma.CHECK_CRC64, **options)
    manifest = {"format": CURRENT_FORMAT, "target": target,
                "payload": {"path": CURRENT_PAYLOAD_REL, "bytes": len(payload), "sha256": _sha(payload)}}
    encoded = (json.dumps(manifest, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")
    _require(decode_current_transport(encoded, payload, expected_target_path=target["path"],
        expected_target_sha256=target["sha256"], expected_target_bytes=target["bytes"]) == original,
        "Current transport builder failed exact native ZIP round trip")
    return {CURRENT_MANIFEST_REL: encoded, CURRENT_PAYLOAD_REL: payload}


def make_bundle_transports(root):
    """Combine four virtual files while retaining the original two-file API."""
    historical = make_source_transport(root)
    packed_literals = lzma.compress(historical[LITERALS_REL], format=lzma.FORMAT_XZ,
                                    check=lzma.CHECK_CRC64, preset=8)
    return {MANIFEST_REL: historical[MANIFEST_REL], LITERALS_REL + ".xz": packed_literals,
            **make_current_transport(root)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", type=Path, default=Path(__file__).resolve().parent)
    parser.add_argument("--with-vasebreaker-baseline", action="store_true")
    arguments = parser.parse_args()
    try:
        print(json.dumps(ensure_source_archive(arguments.root), sort_keys=True))
        if arguments.with_vasebreaker_baseline:
            ensure_vasebreaker_baseline(arguments.root)
    except (SourceBundleError, OSError) as exc:
        print("source-bundle: " + str(exc), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
