"""
Em-dash font hack: rewrite the em-dash glyph as two spaced hyphens.

The browser still sees '—' in the HTML/DOM, but the font renders it
as '--' visually. Copy-paste gives you the real em-dash back.

Inspired by https://will-keleher.com/posts/this-css-makes-me-human/

Usage:
  1. Download Lora-Regular.ttf from https://fonts.google.com/specimen/Lora
  2. pip install fonttools brotli
  3. python hack_emdash.py
  -> outputs lora-hacked.woff2
"""
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._g_l_y_f import GlyphComponent

font = TTFont("Lora-Regular.ttf")

glyf = font["glyf"]
hmtx = font["hmtx"].metrics
cmap = next(t.cmap for t in font["cmap"].tables if t.isUnicode())

emdash = cmap[ord("\u2014")]  # —
hyphen = cmap[ord("-")]

hyphen_width, _ = hmtx[hyphen]

# Two hyphens with a gap between them
gap = int(hyphen_width * 0.8)
new_width = int(hyphen_width * 2 + gap)

hmtx[emdash] = (new_width, 0)

g = glyf[emdash]
g.numberOfContours = -1  # composite glyph
g.components = []

for x_offset in (0, hyphen_width + gap):
    c = GlyphComponent()
    c.glyphName = hyphen
    c.x = int(x_offset)
    c.y = 0
    c.flags = 0x0001 | 0x0002  # ARGS_ARE_XY | ARGS_ARE_WORDS
    g.components.append(c)

# Save as woff2 directly for web delivery
font.flavor = "woff2"
font.save("lora-hacked.woff2")
print(f"Done. Em-dash now renders as two hyphens.")
print(f"  hyphen width: {hyphen_width}")
print(f"  gap: {gap}")
print(f"  new em-dash width: {new_width}")
print(f"  output: lora-hacked.woff2")
