Plants vs. Zombies original game data
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
