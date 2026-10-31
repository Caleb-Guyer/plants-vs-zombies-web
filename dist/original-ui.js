/* Original bitmap-font presenter for browser recovery controls. MIT License.
 * Artwork remains copyright PopCap / Electronic Arts; see ui/README.txt. */
(() => {
  'use strict';
  const base = new URL('./ui/', document.currentScript?.src || document.baseURI);
  const fonts = new Map();
  function load(name) {
    if (!fonts.has(name)) fonts.set(name, (async () => {
      const response = await fetch(new URL('qol-font-' + name + '.json', base));
      if (!response.ok) throw Error('Original UI font is unavailable.');
      const metrics = await response.json();
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = new URL(metrics.image, base).href;
      });
      return {metrics, image};
    })());
    return fonts.get(name);
  }
  function draw(text, font, className) {
    const {metrics, image} = font;
    let advance = 0, previous = '';
    const positions = [];
    for (const character of text) {
      const glyph = metrics.glyphs[character] || metrics.glyphs['?'];
      advance += metrics.kerning[previous + character] || 0;
      if (character === ' ') advance += metrics.space;
      else {
        positions.push({glyph, x: advance + glyph.offset[0]});
        advance += glyph.advance;
      }
      previous = character;
    }
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(advance + 8);
    canvas.height = metrics.height;
    canvas.className = className;
    canvas.setAttribute('aria-hidden', 'true');
    const context = canvas.getContext('2d');
    if (!context) throw Error('Original UI font canvas is unavailable.');
    for (const {glyph, x} of positions) {
      const [sx, sy, width, height] = glyph.rect;
      context.drawImage(image, sx, sy, width, height, x + 4, glyph.offset[1], width, height);
    }
    return canvas;
  }
  async function label(element, text = element.textContent) {
    const value = String(text);
    element.textContent = value;
    element.setAttribute('aria-label', value);
    try {
      const [normal, bright] = await Promise.all([load('green'), load('bright')]);
      if (element.textContent !== value) return;
      const canvas = draw(value, normal, 'original-label-normal');
      const hover = draw(value, bright, 'original-label-bright');
      const readable = document.createElement('span');
      readable.className = 'original-label-text';
      readable.textContent = value;
      element.replaceChildren(readable, canvas, hover);
      element.classList.add('original-bitmap-label');
    } catch (_) {
      // Keep the readable original text if the optional art cannot be loaded.
    }
  }
  window.PVZOriginalUI = Object.freeze({label});
})();
