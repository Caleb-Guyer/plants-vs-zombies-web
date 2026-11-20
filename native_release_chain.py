"""Restore published ZomBotany archives and shipping binaries used by the native suites."""
import hashlib
import io
import struct
import tarfile
import tempfile
from pathlib import Path

I_ZOMBOTANY = "0.2.6-web-izombotany.1"
BEGHOUL = "0.2.6-web-zbeghouled.1"
NIGHT = "0.2.6-web-zsnight.1"
POOL = "0.2.6-web-zspool.1"
SHARED_BASE = {"id": I_ZOMBOTANY, "bytes": 100_558_183,
               "sha256": "ab56f8150ddaf8d8985de74afeea2b51c7c09ef800d0f4ba58cd3a270393152c"}
BEGHOUL_BYTES = 103_906_885
BEGHOUL_SHA = "47021a0d7c60380102b6fb18b4d12e44ceb1d612b4ea5d06d537a3bcc96f29a2"
NIGHT_BYTES = 103_925_423
NIGHT_SHA = "cac01b72b470a6b9aa167ed1eed93bb4e78235d496418d1cda118e33656cb1e1"
HISTORY = Path("tests/fixtures/historical")
SUFFIX = HISTORY / "zbeghouled1-published/source-suffix.bin"
NIGHT_SUFFIX = HISTORY / "zsnight1-published/source-suffix.bin"
BROWSERS = HISTORY / "extension-browsers.tar.xz"
POOL_BROWSER_DELTAS = HISTORY / "zspool1-browser-deltas.tar.xz"
BLOCK_SIZE = 128
MAX_BROWSER_BYTES = 16 * 1024 * 1024
ARCHIVE_PARENTS = {
    NIGHT: (BEGHOUL, BEGHOUL_BYTES, BEGHOUL_SHA, SUFFIX),
    POOL: (NIGHT, NIGHT_BYTES, NIGHT_SHA, NIGHT_SUFFIX),
}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def shared_base(parent, release=NIGHT):
    _, size, expected, _ = ARCHIVE_PARENTS[release]
    if len(parent) != size or digest(parent) != expected:
        raise ValueError("Unexpected published source archive")
    base = parent[:SHARED_BASE["bytes"]]
    if digest(base) != SHARED_BASE["sha256"]:
        raise ValueError("Source archive lacks the published I, ZomBotany prefix")
    return base


def parent_source(root, engine, current):
    parent = engine["parent"]
    if engine["id"] in ARCHIVE_PARENTS:
        parent_id, size, expected, suffix = ARCHIVE_PARENTS[engine["id"]]
        if engine.get("sourceArchiveBase") != SHARED_BASE or parent["id"] != parent_id:
            raise ValueError("Unexpected Survival archive ancestry")
        base = current[:SHARED_BASE["bytes"]]
        if digest(base) != SHARED_BASE["sha256"]:
            raise ValueError("Unexpected shared source prefix")
        tail = root / suffix
        if tail.is_symlink() or tail.stat().st_size != size - len(base):
            raise ValueError("Unexpected historical source suffix")
        previous = base + tail.read_bytes()
        if digest(previous) != expected:
            raise ValueError("Reconstructed source differs from the published ZIP")
    else:
        previous = current[:engine["parentArchivePrefixBytes"]]
    if digest(previous) != parent["artifacts"]["sourceSha256"]:
        raise ValueError("Unexpected previous source digest")
    return previous


def _xor(a, b):
    return (int.from_bytes(a, "little") ^ int.from_bytes(b, "little")).to_bytes(len(a), "little")


def _block_position(base, block, guess):
    """Find a nearby matching run when a WebAssembly function has moved."""
    guess = max(0, min(len(base) - len(block), guess))
    if base[guess:guess + len(block)] == block:
        return guess
    for bias in (0, len(block) // 2):
        sample = block[bias:bias + 24]
        center = guess + bias
        left = base.rfind(sample, max(0, center - 65536), center + len(sample))
        right = base.find(sample, center, center + 65536)
        hits = [p for p in (left, right) if 0 <= p - bias <= len(base) - len(block)]
        if hits:
            return min(hits, key=lambda p: abs(center - p)) - bias
    return guess


def _encode_delta(base, original):
    """The offset table aligns functions. The byte-wise difference compresses with XZ."""
    if not 0 < len(original) < MAX_BROWSER_BYTES or len(base) < min(BLOCK_SIZE, len(original)):
        raise ValueError("Unexpected executable size for the historical delta")
    positions, differences = bytearray(), bytearray()
    drift = 0
    for offset in range(0, len(original), BLOCK_SIZE):
        block = original[offset:offset + BLOCK_SIZE]
        start = _block_position(base, block, offset + drift)
        drift = start - offset
        positions.extend(struct.pack("<i", drift))
        differences.extend(_xor(block, base[start:start + len(block)]))
    return struct.pack("<I", len(original)) + positions + differences


def _restore_delta(base, delta):
    if len(delta) < 4:
        raise ValueError("Truncated historical executable delta")
    size, = struct.unpack_from("<I", delta)
    blocks = (size + BLOCK_SIZE - 1) // BLOCK_SIZE
    data_at = 4 + 4 * blocks
    if not 0 < size < MAX_BROWSER_BYTES or len(delta) != data_at + size:
        raise ValueError("Unexpected historical executable delta size")
    original = bytearray()
    for index, offset in enumerate(range(0, size, BLOCK_SIZE)):
        count = min(BLOCK_SIZE, size - offset)
        drift, = struct.unpack_from("<i", delta, 4 + 4 * index)
        start = offset + drift
        if not 0 <= start <= len(base) - count:
            raise ValueError("Historical executable delta exceeds its base")
        original.extend(_xor(delta[data_at + offset:data_at + offset + count], base[start:start + count]))
    return bytes(original)


def pack_browsers(root, binaries, bases=None):
    destination = root / (POOL_BROWSER_DELTAS if bases is not None else BROWSERS)
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=destination.parent) as temp:
        candidate = Path(temp) / destination.name
        with tarfile.open(candidate, "w:xz", preset=8) as output:
            for name, data in sorted(binaries.items()):
                if bases is not None:
                    base = bases[name.rsplit("/", 1)[-1]]
                    delta = _encode_delta(base, data)
                    if _restore_delta(base, delta) != data:
                        raise ValueError("Historical browser failed exact reconstruction")
                    data = delta
                info = tarfile.TarInfo(name + ".delta" if bases is not None else name)
                info.size = len(data)
                info.mode = 0o644
                output.addfile(info, io.BytesIO(data))
        candidate.replace(destination)
    return digest(destination.read_bytes())


def read_browser(root, key, filename, expected, capsule_sha, base=None):
    compact = root / (POOL_BROWSER_DELTAS if base is not None else BROWSERS)
    if compact.is_symlink() or compact.stat().st_size > 8 * 1024 * 1024 or digest(compact.read_bytes()) != capsule_sha:
        raise ValueError("Unexpected historical executable bundle")
    with tarfile.open(compact, "r:xz") as source:
        name = key + "/" + filename + (".delta" if base is not None else "")
        info = source.getmember(name)
        limit = MAX_BROWSER_BYTES if base is None else MAX_BROWSER_BYTES + 4 + 4 * (MAX_BROWSER_BYTES // BLOCK_SIZE)
        if not info.isfile() or not 0 < info.size < limit:
            raise ValueError("Invalid historical executable member")
        data = source.extractfile(info).read()
    if base is not None:
        data = _restore_delta(base, data)
    if digest(data) != expected:
        raise ValueError("Historical browser binary differs from its original release")
    return data
