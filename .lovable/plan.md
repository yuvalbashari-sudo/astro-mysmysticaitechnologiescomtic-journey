## Root cause

`src/pages/TarotGuidesPage.tsx` (line 80) and `src/pages/AstrologyGuidesPage.tsx` (line 80) render the guide icon as a raw emoji:

```tsx
<span className="text-4xl shrink-0">{guide.heroEmoji}</span>
```

The data source `src/data/guideContent.ts` provides plain Unicode emoji (`🃏 🔮 ❓ ⚠️ 🌌 ⬆️ 🏛️ 🌱`). On Hebrew/Arabic the system emoji font renders these as flat colorful badges that visually break the premium gold-mystical aesthetic — exactly what the user is reporting. The US version uses real PNG artwork (e.g. `gateway-tarot.png`, `gateway-rising-star.png`) inside a glowing orb. The guide pages were never migrated to that treatment.

This is purely a rendering fix. I will not redesign the cards, change spacing, structure, RTL, typography, or copy.

## Fix

### 1. Add an artwork field for each guide (data layer)

In `src/data/guideContent.ts`, extend `GuideEntry` with an optional `heroArt: string` field (imported PNG). Map each of the 8 guide slugs to a premium artwork:

| slug | artwork |
|---|---|
| `tarot-getting-started` | `gateway-tarot.png` |
| `tarot-three-card-spread` | `gateway-daily-card.png` |
| `tarot-asking-questions` | new glyph: `glyph-question.png` |
| `tarot-common-mistakes` | new glyph: `glyph-warning.png` |
| `astro-reading-chart` | `gateway-birthchart.png` |
| `astro-rising-sign` | `gateway-rising-star.png` |
| `astro-houses` | new glyph: `glyph-houses.png` |
| `astro-personal-growth` | new glyph: `glyph-growth.png` |

The 4 gateway PNGs already exist in `src/assets/`. The 4 missing ones will be generated as gold-mystical glyph artwork on a transparent background, matching the existing gateway-icon visual language (gold linework, soft glow, no flat color badges).

`heroEmoji` stays in the type (kept as a non-rendered fallback) to avoid touching anything else that may read it; rendering switches to `heroArt`.

### 2. Replace the emoji `<span>` in both guide pages

In both `TarotGuidesPage.tsx` and `AstrologyGuidesPage.tsx` `GuideCard`, replace:

```tsx
<span className="text-4xl shrink-0">{guide.heroEmoji}</span>
```

with the same premium orb wrapper used on `MobileOptionsSheet` gateway cards — scaled down to fit the existing 5-gap row, no card-layout changes:

```tsx
<span
  className="shrink-0 flex items-center justify-center rounded-full relative overflow-hidden"
  style={{
    width: 64, height: 64,
    background: "radial-gradient(circle at 30% 28%, hsl(var(--gold) / 0.34) 0%, hsl(225 50% 6% / 0.55) 70%)",
    border: "1px solid hsl(var(--gold) / 0.5)",
    boxShadow: "0 0 24px hsl(var(--gold) / 0.3), inset 0 1px 8px hsl(var(--gold) / 0.2)",
  }}
>
  <img
    src={guide.heroArt}
    alt=""
    aria-hidden
    style={{
      width: 52, height: 52,
      objectFit: "contain",
      filter: "drop-shadow(0 0 6px hsl(var(--gold) / 0.55)) drop-shadow(0 0 10px hsl(270 70% 55% / 0.25))",
    }}
  />
</span>
```

Properties enforced per the user requirements:
- real artwork, not emoji / Lucide / generic SVG
- `object-fit: contain` → no cropping, fully visible
- centered via flex
- soft gold + purple drop-shadow glow
- circular orb integrated into the card, no badge/color-block look
- `shrink-0` preserves the existing flex row, RTL stays intact (the row uses `flex items-start gap-5` which already mirrors under `dir="rtl"`)

### 3. Generate the 4 missing glyph assets

Use the agent image tool (`premium`, transparent PNG) at 512×512 to create:
- `src/assets/glyph-question.png` — gold mystical question-mark glyph, art-nouveau linework, soft glow, transparent bg
- `src/assets/glyph-warning.png` — gold mystical caution sigil (eye + crescent), transparent bg
- `src/assets/glyph-houses.png` — gold mystical 12-house wheel glyph, transparent bg
- `src/assets/glyph-growth.png` — gold mystical sprouting-tree-of-life glyph, transparent bg

All four follow the same visual language as `gateway-tarot.png` / `gateway-rising-star.png` so the set looks cohesive.

## Out of scope (explicitly NOT touched)

- Card structure, spacing, padding, border, gradient background
- Typography, copy, headings
- RTL layout / `dir` handling
- Desktop layout
- AI pipeline, localization logic, prompts, edge functions, backend
- Any other component (`HowItWorksSection`, `MobileOptionsSheet`, hero overlay) — already correct from prior turns

## Files touched

- `src/data/guideContent.ts` — add `heroArt` field + 8 imports
- `src/pages/TarotGuidesPage.tsx` — swap emoji span for orb+img
- `src/pages/AstrologyGuidesPage.tsx` — swap emoji span for orb+img
- `src/assets/glyph-question.png` (new)
- `src/assets/glyph-warning.png` (new)
- `src/assets/glyph-houses.png` (new)
- `src/assets/glyph-growth.png` (new)

## Verification

After implementation, open `/tarot-guides` and `/astrology-guides` in HE and confirm:
- no emoji visible on any card
- gold-glowing circular orb with mystical artwork on every card
- card layout, spacing, RTL alignment unchanged vs. current
