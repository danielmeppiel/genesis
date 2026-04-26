# launch assets

Brand-faithful assets used for genesis launch and ongoing communications.

| File | Use | Dimensions | Format |
|---|---|---|---|
| `linkedin-hero.png` | LinkedIn launch post hero image | 1200x628 (1.91:1) | PNG, 8-bit RGB |
| `linkedin-hero.svg` | Editable source for the hero image | 1200x628 viewBox | SVG |

## hero design notes

Three-band composition tuned for LinkedIn feed scanning:

1. **Identity band** -- logomark + wordmark + two-line tagline (the README H1).
2. **Install band** -- the `npx skills add danielmeppiel/genesis` command rendered as a real terminal panel. The CTA is the centerpiece.
3. **Toolbelt** -- four-column stat block (number + two-line name) showing the catalogue: 6 agent primitives, 9 architectural patterns, 23 design patterns, 4 refactor patterns. Serif numerals are the eye-catchers; monospace names anchor them. No header, no descriptors -- the layout is self-explanatory.

## palette and type

- background `#fcfcf6` (warm off-white)
- ink `#0d1117` (near-black, GitHub palette)
- accent `#daf172` (chartreuse, brand)
- serif: Georgia (logomark G, tagline, numerals)
- monospace: Menlo / SF Mono (wordmark, install line, layer names, context)

## regenerating

The SVG is hand-authored to avoid font-embedding complexity. To re-render the PNG:

```bash
python3 -c "import cairosvg; cairosvg.svg2png(url='linkedin-hero.svg', write_to='linkedin-hero.png', output_width=1200, output_height=628)"
```

Requires `cairosvg` (`pip install cairosvg`). Alternative: open the SVG in any vector editor and export at 1200x628.

## license

Same as the repository: Apache 2.0. The brand mark itself ("genesis"), the chartreuse-on-black logomark, and the wordmark are protected by Section 6 of the license -- attribution is required, but the trademark itself is not granted by the license.
