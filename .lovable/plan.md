

# Plan: 3 Outline Variations with Isolated Preview

## What We'll Build

Generate 3 transparent PNG outline figures (thin/medium/strong), display them in a self-contained preview page with the full aura animation, and keep production completely untouched until final approval.

## Steps

### 1. Generate 3 Outline Figures
Using `google/gemini-3-pro-image-preview`, create 3 PNGs:
- **thin** — Delicate contour, still visible at 320px width
- **medium** — Balanced stroke weight, primary candidate
- **strong** — Bold outline, worst-case visibility fallback

All: gender-neutral, transparent PNG, white contour only, no fill/shading/glow baked in, standing centered pose.

Output to `src/assets/astral-outline-thin.png`, `medium.png`, `strong.png`. Also copy to `/mnt/documents/` for review.

### 2. QA Each Image
Inspect each generated image for: actual alpha transparency, no internal fill or color artifacts, visibility at small scale (simulate mobile crop).

### 3. Create Isolated Preview Page
New file: `src/pages/AstralPreview.tsx`

- Shows 4 panels: current figure + 3 new variations
- Each panel renders its own **self-contained mini animation** that duplicates the AstralLightReveal SVG structure (defs, gradients, ellipse, drop-shadow, image layers) using **local props/constants** — does NOT import or modify the real `AstralLightReveal` component
- Uses mock `chartData` and `auraColors` to drive the animation identically
- Toggle buttons for: `mix-blend-mode: screen` on/off, dark/real background
- All tunable values exposed as **adjustable constants** at the top of the file:

```typescript
const PREVIEW_CONFIG = {
  haloRx: 70,
  haloRy: 100,
  haloOpacityMultiplier: 0.5,
  outerGlowBase: 6,
  outerGlowAbsorptionScale: 10,
  outerGlowClimaxScale: 24,
  figBaseOpacity: 0.25,
  figAbsorptionOpacityScale: 0.5,
  figClimaxOpacityScale: 0.25,
};
```

- Responsive: 2×2 grid on desktop, vertical stack on mobile
- Route added to `App.tsx`: `/astral-preview`

### 4. What Stays Untouched
- `src/components/AstralLightReveal.tsx` — **zero changes** until final decision
- `src/assets/astral-figure.png` — **not replaced** until final decision
- All animation timing/phases — untouched
- Production behavior — completely unaffected

### 5. After Final Approval (separate step)
- Copy chosen variation to `src/assets/astral-figure.png`
- Apply the tuned constants from preview into `AstralLightReveal.tsx` (halo ellipse, glow values, base opacity)
- Remove `/astral-preview` route, preview page, and all temporary asset files
- Full cleanup

## Files Created/Changed

| File | Action |
|------|--------|
| `src/assets/astral-outline-thin.png` | New (temporary) |
| `src/assets/astral-outline-medium.png` | New (temporary) |
| `src/assets/astral-outline-strong.png` | New (temporary) |
| `src/pages/AstralPreview.tsx` | New (temporary) |
| `src/App.tsx` | Add `/astral-preview` route (temporary) |

No changes to `AstralLightReveal.tsx` or `astral-figure.png` until final approval.

