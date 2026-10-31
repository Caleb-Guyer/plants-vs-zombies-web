"""Extract unchanged UI artwork from the approved bundled game resources."""
from pathlib import Path
import hashlib
import json
import re
import struct

ROOT = Path(__file__).resolve().parent
BUNDLE = ROOT / 'dist/game-assets'
OUT = ROOT / 'dist/ui'
manifest = json.loads((BUNDLE / 'manifest.json').read_text())
item = next(f for f in manifest['files'] if f['path'] == 'main.pak')
packed = b''.join((BUNDLE / part['url']).read_bytes() for part in item['parts'])
assert hashlib.sha256(packed).hexdigest() == item['sha256']
data = bytes(value ^ 0xf7 for value in packed)
assert struct.unpack_from('<II', data) == (0xbac04ac0, 0)
cursor, offset, records = 8, 0, []
while not data[cursor] & 0x80:
    cursor += 1
    length = data[cursor]
    cursor += 1
    name = data[cursor:cursor + length].decode().replace('\\', '/')
    cursor += length
    size = struct.unpack_from('<I', data, cursor)[0]
    cursor += 12
    records.append((name, offset, size))
    offset += size
cursor += 1
assert cursor + offset == len(data)
files = {name: data[cursor + start:cursor + start + size] for name, start, size in records}
OUT.mkdir(exist_ok=True)
inventory = []

def put(name, payload, origin):
    path = OUT / name
    if path.exists():
        assert path.read_bytes() == payload, 'Existing UI artwork differs: ' + name
    else:
        path.write_bytes(payload)
    inventory.append({'file': name, 'original': origin, 'bytes': len(payload),
                      'sha256': hashlib.sha256(payload).hexdigest()})

for section in ['left', 'middle', 'right']:
    source = 'images/button_' + section + '.png'
    put('qol-stone-' + section + '.png', files[source], source)
for section in ['topleft', 'topmiddle', 'topright', 'centerleft', 'centermiddle',
                'centerright', 'bottomleft', 'bottommiddle', 'bottomright']:
    source = 'images/dialog_' + section + '.png'
    put('qol-dialog-' + section + '.png', files[source], source)

for name, tag in [('DwarvenTodcraft18GreenInset', 'green'),
                  ('DwarvenTodcraft18BrightGreenInset', 'bright')]:
    text = files['data/' + name + '.txt'].decode('cp1252')
    block = lambda key: re.search(r'Define\s+' + key + r'\s*\((.*?)\);', text, re.S).group(1)
    chars = [a or b for a, b in re.findall(r"'([^']{1})'|\"([^\"]{1})\"", block('CharList'))]
    widths = list(map(int, re.findall(r'-?\d+', block('WidthList'))))
    rects = [list(map(int, values)) for values in re.findall(r'\(\s*(-?\d+),\s*(-?\d+),\s*(\d+),\s*(\d+)\)', block('RectList'))]
    offsets = [list(map(int, values)) for values in re.findall(r'\(\s*(-?\d+),\s*(-?\d+)\)', block('OffsetList'))]
    assert len(chars) == len(widths) == len(rects) == len(offsets)
    pairs = re.findall(r'"(.*?)"', block('KerningPairs'))
    values = list(map(int, re.findall(r'-?\d+', block('KerningValues'))))
    assert len(pairs) == len(values)
    image = 'qol-font-' + tag + '.png'
    put(image, files['data/' + name + '.png'], 'data/' + name + '.png')
    metrics = {'image': image, 'space': 11, 'height': 28,
               'glyphs': {ch: {'advance': w, 'rect': r, 'offset': o}
                          for ch, w, r, o in zip(chars, widths, rects, offsets)},
               'kerning': dict(zip(pairs, values))}
    put('qol-font-' + tag + '.json', (json.dumps(metrics, ensure_ascii=True) + '\n').encode(),
        'data/' + name + '.txt (parsed metrics)')

put('README.txt', b'Original Plants vs. Zombies artwork and bitmap glyphs belong to PopCap/Electronic Arts.\nExtracted unchanged from the user-approved bundled main.pak for browser save recovery.\nRun python extract-original-ui.py to reproduce these assets.\n', 'Attribution')
(OUT / 'original-ui-inventory.json').write_text(json.dumps({'bundleId': manifest['id'], 'files': inventory}, indent=2) + '\n', encoding='utf-8', newline='\n')
print('Extracted', len(inventory), 'original UI images, metrics and attribution files.')
