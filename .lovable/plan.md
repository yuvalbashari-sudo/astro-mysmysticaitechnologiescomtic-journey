

# Expand Final Glow to Encompass Entire Astral Figure

## Problem
The climax glow radiates from `FIG_CORE_Y` (240) — roughly the chest area — creating a halo effect concentrated around the head/upper body. The figure extends from y≈175 to y≈472 in scene coordinates, so the lower body (legs, feet) gets no glow coverage.

## Solution
Modify only the climax glow section in `src/components/AstralLightReveal.tsx` to wrap the entire figure in light:

### Changes (all in `AstralLightReveal.tsx` only)

1. **Add a full-body elliptical glow** (new element in the climax section, lines 625-700)
   - Add a `<motion.ellipse>` centered at FIG_CX / vertical midpoint of figure (~323)
   - rx covers figure width (~55px), ry covers full figure height (~150px)
   - Uses `climax-radial` gradient, pulsates gently
   - Rendered BEHIND the existing core glow circles

2. **Add a second blurred image overlay for full-body aura**
   - Duplicate the figure image with heavy blur (8-12px) and `screen` blend mode
   - Scaled slightly larger (1.05x) to create an aura halo effect around the entire silhouette
   - Opacity tied to `climaxLevel`

3. **Increase the radial rays' reach**
   - Lines 667-698: increase `outerR` from `30 + climaxLevel * 25` to `60 + climaxLevel * 50` so energy lines extend past the full figure height

4. **Keep existing chest glow and core effects** — they add focal intensity at the heart center. The new full-body glow adds the surrounding envelope.

### Scope
- Only `src/components/AstralLightReveal.tsx` is modified
- No figure design changes, no animation timing changes, no other files

