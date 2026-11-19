"""Restore the exact Beghouled parent and the historical browser binaries shared by native tests."""
import hashlib
import io
import tarfile
from pathlib import Path

I_ZOMBOTANY = "0.2.6-web-izombotany.1"
BEGHOUL = "0.2.6-web-zbeghouled.1"
NIGHT = "0.2.6-web-zsnight.1"
SHARED_BASE = {"id": I_ZOMBOTANY, "bytes": 100_558_183,
               "sha256": "ab56f8150ddaf8d8985de74afeea2b51c7c09ef800d0f4ba58cd3a270393152c"}
BEGHOUL_BYTES = 103_906_885
BEGHOUL_SHA = "47021a0d7c60380102b6fb18b4d12e44ceb1d612b4ea5d06d537a3bcc96f29a2"
HISTORY = Path("tests/fixtures/historical")
SUFFIX = HISTORY / "zbeghouled1-published/source-suffix.bin"
BROWSERS = HISTORY / "extension-browsers.tar.xz"


def digest(data):
    return hashlib.sha256(data).hexdigest()


def shared_base(parent):
    if len(parent) != BEGHOUL_BYTES or digest(parent) != BEGHOUL_SHA:
        raise ValueError("Unexpected published Beghouled source")
    base = parent[:SHARED_BASE["bytes"]]
    if digest(base) != SHARED_BASE["sha256"]:
        raise ValueError("Beghouled source lacks the published I, ZomBotany prefix")
    return base


def parent_source(root, engine, current):
    parent = engine["parent"]
    if engine["id"] == NIGHT:
        if engine.get("sourceArchiveBase") != SHARED_BASE or parent["id"] != BEGHOUL:
            raise ValueError("Unexpected Survival: Night archive ancestry")
        base = current[:SHARED_BASE["bytes"]]
        if digest(base) != SHARED_BASE["sha256"]:
            raise ValueError("Unexpected shared source prefix")
        tail = root / SUFFIX
        if tail.is_symlink() or tail.stat().st_size != BEGHOUL_BYTES - len(base):
            raise ValueError("Unexpected Beghouled suffix file")
        previous = base + tail.read_bytes()
        if digest(previous) != BEGHOUL_SHA:
            raise ValueError("Reconstructed Beghouled source differs from the published ZIP")
    else:
        previous = current[:engine["parentArchivePrefixBytes"]]
    if digest(previous) != parent["artifacts"]["sourceSha256"]:
        raise ValueError("Unexpected previous source digest")
    return previous


def pack_browsers(root, binaries):
    destination = root / BROWSERS
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tarfile.open(destination, "w:xz", preset=8) as output:
        for name, data in sorted(binaries.items()):
            info = tarfile.TarInfo(name)
            info.size = len(data)
            info.mode = 0o644
            output.addfile(info, io.BytesIO(data))
    return digest(destination.read_bytes())


def read_browser(root, key, filename, expected, capsule_sha):
    compact = root / BROWSERS
    if compact.is_symlink() or compact.stat().st_size > 8 * 1024 * 1024 or digest(compact.read_bytes()) != capsule_sha:
        raise ValueError("Unexpected historical executable bundle")
    with tarfile.open(compact, "r:xz") as source:
        name = key + "/" + filename
        info = source.getmember(name)
        if not info.isfile() or not 0 < info.size < 16 * 1024 * 1024:
            raise ValueError("Invalid historical executable member")
        data = source.extractfile(info).read()
    if digest(data) != expected:
        raise ValueError("Historical browser binary differs from its original release")
    return data
