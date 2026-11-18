"""Decode authenticated CI evidence to stdout only; no game execution or writes."""
from pathlib import Path
import hashlib,lzma,sys

XZ_BYTES=68696
XZ_SHA='f421456502d800869c9b890dfe5988bb99497260899dbd800314b87c91923a4d'
RAW_BYTES=1300298
RAW_SHA='17dc718dc74f891cd79fec64c9fdf63bcce477dec017374803aaf9551a8f5157'

def main():
 root=Path(__file__).resolve().parent
 path=root/'fixtures/zsurvival1-linux-ci.xz'
 if not path.is_file() or path.is_symlink() or not path.resolve().is_relative_to(root):
  raise RuntimeError('Expected local authenticated evidence fixture')
 if path.stat().st_size!=XZ_BYTES:
  raise RuntimeError('Compressed evidence length differs')
 data=path.read_bytes()
 if hashlib.sha256(data).hexdigest()!=XZ_SHA:
  raise RuntimeError('Compressed evidence digest differs')
 decoder=lzma.LZMADecompressor(format=lzma.FORMAT_XZ,memlimit=16*1024*1024)
 raw=decoder.decompress(data,max_length=RAW_BYTES+1)
 if not decoder.eof or decoder.unused_data or len(raw)!=RAW_BYTES or hashlib.sha256(raw).hexdigest()!=RAW_SHA:
  raise RuntimeError('Exact bounded evidence decoding differs')
 sys.stdout.buffer.write(raw)

if __name__=='__main__':
 try:main()
 except Exception:
  print('Authenticated Linux evidence decoding failed',file=sys.stderr)
  raise SystemExit(1)
