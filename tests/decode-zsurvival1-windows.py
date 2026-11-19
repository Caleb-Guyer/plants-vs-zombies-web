# SPDX-License-Identifier: MIT
"""Bounded lossless historical golden transport. Writes only stdout."""
from pathlib import Path
import hashlib, lzma, sys
packed=(Path(__file__).resolve().parent/'fixtures/zsurvival1-windows-golden.xz').read_bytes()
assert len(packed)==68196 and hashlib.sha256(packed).hexdigest()=='2edfc5a28f7ae2e6d60448e006e82e9757614d28b9065b6e2b05af65c63a26bd'
decoder=lzma.LZMADecompressor(format=lzma.FORMAT_XZ,memlimit=16*1024*1024)
raw=decoder.decompress(packed,max_length=1323857+1)
assert decoder.eof and not decoder.unused_data and len(raw)==1323857
assert hashlib.sha256(raw).hexdigest()=='4a180ac53d9eb1ef6444692cbc308a9047b23dbb916242682e9e42a3d6d089f2'
sys.stdout.buffer.write(raw)
