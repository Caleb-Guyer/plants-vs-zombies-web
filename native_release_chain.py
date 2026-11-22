"""Restore published ZomBotany archives and shipping binaries used by the native suites."""
import hashlib
import io
import lzma
import struct
import subprocess
import tarfile
import tempfile
import zipfile
import zlib
from pathlib import Path

I_ZOMBOTANY = "0.2.6-web-izombotany.1"
BEGHOUL = "0.2.6-web-zbeghouled.1"
NIGHT = "0.2.6-web-zsnight.1"
POOL = "0.2.6-web-zspool.1"
FOG = "0.2.6-web-zsfog.1"
ROOF = "0.2.6-web-zsroof.1"
BOWLING = "0.2.6-web-zbowling.1"
PINS = "0.2.6-web-zpins.1"
WHACK = "0.2.6-web-zwhack.1"
TWIST = "0.2.6-web-ztwist.1"
FINAL = "0.2.6-web-zfinal.1"
BOWLING_TAB = "0.2.6-web-wbtab.1"
SHARED_BASE = {"id": I_ZOMBOTANY, "bytes": 100_558_183,
               "sha256": "ab56f8150ddaf8d8985de74afeea2b51c7c09ef800d0f4ba58cd3a270393152c"}
BEGHOUL_BYTES = 103_906_885
BEGHOUL_SHA = "47021a0d7c60380102b6fb18b4d12e44ceb1d612b4ea5d06d537a3bcc96f29a2"
NIGHT_BYTES = 103_925_423
NIGHT_SHA = "cac01b72b470a6b9aa167ed1eed93bb4e78235d496418d1cda118e33656cb1e1"
POOL_BYTES = 103_940_854
POOL_SHA = "a57b215ffd83e8934fcbe5de7ffb1f94bbae34ba0dff33bf8258458b17b02f29"
FOG_BYTES = 103_965_147
FOG_SHA = "122686484ebe6b0a6ac681c60e032303ca595452640e7091b6b3f83d8109be94"
ROOF_BYTES = 103_972_955
ROOF_SHA = "0c70111f1849b2ef3cd94ddf1731d4da04e9209651c0e87a4e1ab6cb16de066b"
BOWLING_BYTES = 104_022_458
BOWLING_SHA = "608feffc5a9743f21d920492487a05be2a8816d2bd617ef9343fa871f1ccccde"
PINS_BYTES = 104_050_137
PINS_SHA = "9efc45935abd69515a2b1fd0f3e6f60b73f87938d029c237ca0e8c7325c22b1c"
WHACK_BYTES = 104_032_353
WHACK_SHA = "05e395c0bd8f08c5f8f09926c8dfc727a62b0b0acb64f66d015fe70b498e6f88"
TWIST_BYTES = 104_037_115
TWIST_SHA = "7a7340590541569e1cd8291f73374e9e6de4988fdd9a1bf4c967f461861641a0"
FINAL_BYTES = 104_066_945
FINAL_SHA = "855725957312215ab31ac3a5149794c779b694436502625a1f7ffd2a4e08e9c2"
POOL_WINNER_SHA256 = "0975e051c8585ab3535697e4d56f895f566c33afcf3946932326d4654f24fefa"
WINNING_PROFILES = {
    "zsfog": ("zspool1-earned.dat", POOL_WINNER_SHA256),
    "zsroof": ("zsfog1-earned.dat", "e265c019f72c08c7beeb114676792dc6e66a4707cc91430b26f8c3ced6a4aac7"),
    "zbowling": ("zsroof1-earned.dat", "0afa64046adb263d6519082ee1ea8ae3bc5ce4640676b12d090d41ec55466ad9"),
    "zwhack": ("zpins1-earned.dat", "7db698deab6e2d99c9b170e8dac1b135a0074eaf9d81f700d355151f61e9ba96"),
    "ztwist": ("zwhack1-earned.dat", "1477f770927fd548c38b1eb8708f3dd255200dd7d2fb6e7e8c52e96806d108a8"),
    "zfinal": ("ztwist1-earned.dat", "6b7639843b03b2aaa80b5e1a4b6a57a5f791b66c95b3c882ce321c010e7ff37b"),
    "wbtab": ("zfinal1-earned.dat", "ea5ecd95df4d834fced369cdd05d023337e65f291fe076422c094e9987e23aee"),
}
REPLAY_FIXTURES = {
    **{key: (profile,) for key, profile in WINNING_PROFILES.items()},
    "zpins": (WINNING_PROFILES["zbowling"],
              ("zbowling1-legacy.zip", "286f846c89dc5fee957a66f4054e7d7edfd2780a9e65319fbe4b08219d460a54")),
}
HISTORY = Path("tests/fixtures/historical")
SUFFIX = HISTORY / "zbeghouled1-published/source-suffix.bin"
NIGHT_SUFFIX = HISTORY / "zsnight1-published/source-suffix.bin"
POOL_SUFFIX = HISTORY / "zspool1-published/source-suffix.xz"
FOG_SUFFIX = HISTORY / "zsfog1-published/source-suffix.xz"
ROOF_SUFFIX = HISTORY / "zsroof1-published/source-suffix.xz"
BOWLING_SUFFIX = HISTORY / "zbowling1-published/source-suffix.xz"
PINS_SUFFIX = HISTORY / "zpins1-published/source-suffix.xz"
WHACK_SUFFIX = HISTORY / "zwhack1-published/source-suffix.xz"
TWIST_SUFFIX = HISTORY / "ztwist1-published/source-suffix.xz"
FINAL_SUFFIX = HISTORY / "zfinal1-published/source-suffix.xz"
BROWSERS = HISTORY / "extension-browsers.tar.xz"
POOL_BROWSER_DELTAS = HISTORY / "zspool1-browser-deltas.tar.xz"
FOG_BROWSER_DELTAS = HISTORY / "zsfog1-browser-deltas.tar.xz"
ROOF_BROWSER_DELTAS = HISTORY / "zsroof1-browser-deltas.tar.xz"
BOWLING_BROWSER_DELTAS = HISTORY / "zbowling1-browser-deltas.tar.xz"
PINS_BROWSER_DELTAS = HISTORY / "zpins1-browser-deltas.tar.xz"
WHACK_BROWSER_DELTAS = HISTORY / "zwhack1-browser-deltas.tar.xz"
TWIST_BROWSER_DELTAS = HISTORY / "ztwist1-browser-deltas.tar.xz"
FINAL_BROWSER_DELTAS = HISTORY / "zfinal1-browser-deltas.tar.xz"
BOWLING_TAB_DELTAS = HISTORY / "wbtab1-browser-deltas.tar.xz"
DELTA_CAPSULES = {POOL: POOL_BROWSER_DELTAS, FOG: FOG_BROWSER_DELTAS, ROOF: ROOF_BROWSER_DELTAS,
                  BOWLING: BOWLING_BROWSER_DELTAS, PINS: PINS_BROWSER_DELTAS, WHACK: WHACK_BROWSER_DELTAS,
                  TWIST: TWIST_BROWSER_DELTAS, FINAL: FINAL_BROWSER_DELTAS, BOWLING_TAB: BOWLING_TAB_DELTAS}
BLOCK_SIZE = 128
MAX_BROWSER_BYTES = 16 * 1024 * 1024
ARCHIVE_PARENTS = {
    NIGHT: (BEGHOUL, BEGHOUL_BYTES, BEGHOUL_SHA, SUFFIX),
    POOL: (NIGHT, NIGHT_BYTES, NIGHT_SHA, NIGHT_SUFFIX),
    FOG: (POOL, POOL_BYTES, POOL_SHA, POOL_SUFFIX),
    ROOF: (FOG, FOG_BYTES, FOG_SHA, FOG_SUFFIX),
    BOWLING: (ROOF, ROOF_BYTES, ROOF_SHA, ROOF_SUFFIX),
    PINS: (BOWLING, BOWLING_BYTES, BOWLING_SHA, BOWLING_SUFFIX),
    WHACK: (PINS, PINS_BYTES, PINS_SHA, PINS_SUFFIX),
    TWIST: (WHACK, WHACK_BYTES, WHACK_SHA, WHACK_SUFFIX),
    FINAL: (TWIST, TWIST_BYTES, TWIST_SHA, TWIST_SUFFIX),
    BOWLING_TAB: (FINAL, FINAL_BYTES, FINAL_SHA, FINAL_SUFFIX),
}
ZIP_ROOT = "zombotany3-candidate/tests/"
SUFFIX_HEADER = struct.Struct("<4sII32s")


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


def _compressed_member(blob, entry):
    pos = entry.header_offset
    if not 0 <= pos <= len(blob) - 30 or entry.compress_type != zipfile.ZIP_DEFLATED or blob[pos:pos + 4] != b"PK\x03\x04":
        raise ValueError("Unexpected ZIP member representation")
    name_length, extra_length = struct.unpack_from("<HH", blob, pos + 26)
    start = pos + 30 + name_length + extra_length
    end = start + entry.compress_size
    if not 0 <= start < end <= len(blob):
        raise ValueError("Driver extends beyond its ZIP")
    return start, blob[start:end]


def _portable_deflate(raw, level=9):
    # The distributed JSZip reproduces the historical zlib bitstream on hosts
    # whose native encoder produces a different, equally valid representation.
    script = """
        const fs = require('fs');
        const pkg = {exports: {}};
        new Function('module','exports','require',fs.readFileSync(process.argv[1], 'utf8'))(pkg,pkg.exports,require);
        const zip = new pkg.exports();
        zip.file('data', fs.readFileSync(0));
        zip.generateAsync({type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: {level: Number(process.argv[2])}})
           .then(bytes => process.stdout.write(bytes));
    """
    vendor = Path(__file__).resolve().parent / "dist/vendor/jszip.min.js"
    if digest(vendor.read_bytes()) != "acc7e41455a80765b5fd9c7ee1b8078a6d160bbbca455aeae854de65c947d59e":
        raise ValueError("Unexpected portable ZIP encoder")
    result = subprocess.run(["node", "-e", script, str(vendor), str(level)], input=raw, capture_output=True,
                            check=True, timeout=60)
    with zipfile.ZipFile(io.BytesIO(result.stdout)) as archive:
        return _compressed_member(result.stdout, archive.getinfo("data"))[1]


def exact_deflate(raw, size, expected, level):
    """Recreate the original, authenticated ZIP data stream at its known compression level."""
    encoder = zlib.compressobj(level, zlib.DEFLATED, -15)
    stream = encoder.compress(raw) + encoder.flush()
    if hashlib.sha256(stream).digest() != expected:
        stream = _portable_deflate(raw, level)
    if len(stream) != size or hashlib.sha256(stream).digest() != expected:
        raise ValueError("Recreated driver differs from its original compressed bytes")
    return stream


def _base_driver(base):
    with zipfile.ZipFile(io.BytesIO(base)) as archive:
        return archive.read(ZIP_ROOT + "i-zombotany-engine.wasm")


def pack_source_suffix(root, child, previous):
    """Keep the original ZIP bytes around the driver and encode its raw WASM against the common prefix."""
    parent_id, _, _, suffix = ARCHIVE_PARENTS[child]
    base = shared_base(previous, child)
    key = parent_id.removeprefix("0.2.6-web-").removesuffix(".1")
    with zipfile.ZipFile(io.BytesIO(previous)) as archive:
        entry = archive.getinfo(ZIP_ROOT + key + "-engine.wasm")
        start, compressed = _compressed_member(previous, entry)
        raw = archive.read(entry)
    if start < len(base) or _portable_deflate(raw) != compressed:
        raise ValueError("Published driver must reproduce its original portable DEFLATE stream")
    header = SUFFIX_HEADER.pack(b"PVS1", start - len(base), len(compressed), hashlib.sha256(compressed).digest())
    remaining = previous[len(base):start] + previous[start + len(compressed):]
    data = header + remaining + _encode_delta(_base_driver(base), raw)
    packed = lzma.compress(data, format=lzma.FORMAT_XZ, check=lzma.CHECK_CRC64, preset=8)
    destination = root / suffix.with_suffix(".xz")
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=destination.parent) as folder:
        temporary = Path(folder) / destination.name
        temporary.write_bytes(packed)
        if _restore_suffix(base, temporary, len(previous) - len(base)) != previous[len(base):]:
            raise ValueError("Packed source suffix failed its byte-for-byte round trip")
        temporary.replace(destination)


def _restore_suffix(base, path, size):
    if path.is_symlink() or not path.is_file() or not 0 < path.stat().st_size <= size + 65536:
        raise ValueError("Unexpected packed source suffix")
    max_bytes = SUFFIX_HEADER.size + size + MAX_BROWSER_BYTES + 4 + 4 * (MAX_BROWSER_BYTES // BLOCK_SIZE)
    decoder = lzma.LZMADecompressor(format=lzma.FORMAT_XZ, memlimit=64 * 1024 * 1024)
    try:
        record = decoder.decompress(path.read_bytes(), max_length=max_bytes + 1)
    except lzma.LZMAError as exc:
        raise ValueError("Invalid source suffix XZ stream") from exc
    if (not decoder.eof or decoder.unused_data or decoder.check != lzma.CHECK_CRC64
            or not SUFFIX_HEADER.size < len(record) <= max_bytes):
        raise ValueError("Invalid or oversized packed source suffix")
    magic, offset, length, expected = SUFFIX_HEADER.unpack_from(record)
    retained = size - length
    if magic != b"PVS1" or length == 0 or not 0 <= offset <= retained:
        raise ValueError("Invalid driver span in the source suffix")
    split = SUFFIX_HEADER.size + retained
    raw = _restore_delta(_base_driver(base), record[split:])
    stream = exact_deflate(raw, length, expected, 9)
    literals = record[SUFFIX_HEADER.size:split]
    return literals[:offset] + stream + literals[offset:]


def parent_source(root, engine, current):
    parent = engine["parent"]
    if engine["id"] in ARCHIVE_PARENTS:
        parent_id, size, expected, suffix = ARCHIVE_PARENTS[engine["id"]]
        if engine.get("sourceArchiveBase") != SHARED_BASE or parent["id"] != parent_id:
            raise ValueError("Unexpected ZomBotany archive ancestry")
        base = current[:SHARED_BASE["bytes"]]
        if digest(base) != SHARED_BASE["sha256"]:
            raise ValueError("Unexpected shared source prefix")
        tail = root / suffix
        packed = tail.with_suffix(".xz")
        if packed.is_symlink() or packed.exists() or tail == packed:
            previous = base + _restore_suffix(base, packed, size - len(base))
        else:
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


def pack_browsers(root, binaries, bases=None, delta_capsule=POOL_BROWSER_DELTAS):
    destination = root / (delta_capsule if bases is not None else BROWSERS)
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


def read_browser(root, key, filename, expected, capsule_sha, base=None, delta_capsule=POOL_BROWSER_DELTAS):
    compact = root / (delta_capsule if base is not None else BROWSERS)
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
