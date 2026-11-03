// A strict, limited tree reader for the buildless shell and its regression
// fixture. It observes parentage without a browser, network or audio device.
import assert from 'node:assert/strict';

const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img',
  'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

export function readShellTree(html) {
  const root = {tag: '#document', attributes: new Map(), parent: null, children: []};
  const stack = [root], ids = new Map();
  for (const token of html.matchAll(/<!--[\s\S]*?-->|<![^>]*>|<\/?[a-z][^>]*>/gi)) {
    const source = token[0];
    if (source.startsWith('<!')) continue;
    const match = source.match(/^<(\/)?([a-z][\w-]*)\b([\s\S]*?)\/?\s*>$/i);
    assert(match, 'Recognized shell markup');
    const [, closing, rawTag, text] = match, tag = rawTag.toLowerCase();
    if (closing) {
      assert.equal(stack.at(-1).tag, tag, 'Balanced shell element: ' + tag);
      stack.pop();
      continue;
    }
    const attributes = new Map();
    for (const attr of text.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g))
      attributes.set(attr[1].toLowerCase(), attr[2] ?? attr[3] ?? attr[4] ?? '');
    const node = {tag, attributes, parent: stack.at(-1), children: []};
    node.parent.children.push(node);
    if (attributes.has('id')) {
      const id = attributes.get('id');
      assert(!ids.has(id), 'Unique shell element: ' + id);
      ids.set(id, node);
    }
    if (!voidTags.has(tag) && !source.endsWith('/>')) stack.push(node);
  }
  assert.equal(stack.length, 1, 'All shell elements close');
  return {root, ids};
}

export function isInside(node, ancestor) {
  for (let current = node; current; current = current.parent)
    if (current === ancestor) return true;
  return false;
}
