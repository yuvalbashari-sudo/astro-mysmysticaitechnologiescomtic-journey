## Root cause

The HE (and EN/RU/AR) guide cards mix two incompatible icon styles:

- **Correct style** (matches US screenshots): fine **gold-linework mystical glyphs** on a transparent background — the 4 I generated last turn (`glyph-question`, `glyph-warning`, `glyph-houses`, `glyph-growth`).
- **Wrong style** (what user is reporting): the 4 reused `gateway-*.png` files (`gateway-tarot`, `gateway-daily-card`, `gateway-birthchart`, `gateway-rising-star`) are colored, card-shaped illustrations meant for the homepage gateway tiles, not for the guide cards. On the guide page they show as orange/red filled artwork that breaks the cohesive gold-line aesthetic.

The user's reference screenshots confirm: every guide card in the US version uses the same mandala/sigil-style gold glyph — never a colored gateway PNG.

## Fix

Generate 4 NEW gold-linework glyphs to replace the 4 misused `gateway-*` references on the guide pages only. The homepage `MobileOptionsSheet` keeps using the original colorful gateway PNGs — they remain correct in their own context.

| slug | current (wrong) | new asset |
|---|---|---|
| `tarot-getting-started` | `gateway-tarot.png` | `glyph-tarot-mandala.png` — ornate gold tarot sigil mandala (8-point star with eye) |
| `tarot-three-card-spread` | `gateway-daily-card.png` | `glyph-three-cards.png` — three vertical line-art card silhouettes in gold |
| `astro-reading-chart` | `gateway-birthchart.png` | `glyph-natal-chart.png` — gold natal-chart wheel outline with planetary glyphs |
| `astro-rising-sign` | `gateway-rising-star.png` | `glyph-rising-sun.png` — gold rising sun above horizon line with rays |

All 4 generated with the same prompt template as the existing glyphs:
*"premium mystical gold glyph … art-nouveau linework, sacred geometry, soft warm gold gradient, subtle inner glow, on a clean transparent background, no text, centered, matches a tarot/astrology icon set"*

Resolution: 512×512, transparent PNG, agent `standard` tier.

## Files touched

- `src/assets/glyph-tarot-mandala.png` (new)
- `src/assets/glyph-three-cards.png` (new)
- `src/assets/glyph-natal-chart.png` (new)
- `src/assets/glyph-rising-sun.png` (new)
- `src/data/guideContent.ts` — swap 4 imports + 4 entries in `HERO_ART_BY_SLUG`. Drop the now-unused `gatewayTarot / gatewayDailyCard / gatewayBirthchart / gatewayRisingStar` imports from this file.

## Out of scope (not touched)

- Card structure, spacing, padding, RTL, typography, copy
- The 4 already-correct glyphs (`glyph-question/warning/houses/growth`) — kept as-is
- `MobileOptionsSheet` homepage gateway tiles — those still use the colorful PNGs intentionally
- `HowItWorksSection`, hero overlay, AI pipeline, localization, edge functions, desktop, US codepaths

## Verification

After implementation, visit `/tarot-guides` and `/astrology-guides` in HE — every one of the 8 cards should show a delicate gold-line mystical glyph inside the same gold orb, with no colorful card/heart/sun illustrations remaining. Visual parity with the US screenshots achieved.
