

# Remove "Sun" Core Glow, Keep Soft Full-Body Aura

## Problem
The climax phase renders a large bright white circle (`#fff`, lines 669-680) and a radial gradient circle (lines 659-667) centered at `FIG_CORE_Y` — creating a "sun" that covers the figure's face and chest, hiding its contours.

## Changes (all in `src/components/AstralLightReveal.tsx`)

### 1. Remove the bright core circles (lines 658-695)
Delete these three elements:
- The large radial gradient circle (lines 659-667) — the main "sun"
- The white `#fff` circle (lines 669-680) — the bright core
- The stroke ring around core (lines 682-695) — the pulsing outline ring

### 2. Reduce blurred aura intensity (lines 642-656)
- Lower the aura image opacity from `climaxLevel * 0.55` to `climaxLevel * 0.35`
- Reduce brightness from `1.4 + climaxLevel * 0.8` to `1.1 + climaxLevel * 0.4`
- This keeps a soft colorful envelope without washing out the figure's contours

### 3. Soften the full-body ellipse (lines 628-640)
- Reduce opacity range from `0.3–0.5` to `0.15–0.3` so it's a subtle ambient glow, not a blinding light

### 4. Soften the radiating rays (lines 697-729)
- Reduce `strokeWidth` from `1.5` to `0.8`
- Lower opacity range to `0.1–0.4` so they read as subtle energy lines, not harsh beams

### 5. Reduce chest glow (lines 609-623)
- Lower opacity multiplier from `0.4` to `0.2` and reduce max radius so the chest area doesn't bloom over the face

### Result
The figure stays fully visible with clear contours. A soft, colorful light envelope surrounds the entire body without hiding any details.

### Scope
- Only `src/components/AstralLightReveal.tsx` modified
- No figure design, timing, or other component changes

