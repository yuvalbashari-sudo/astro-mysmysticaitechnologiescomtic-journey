

# Fix Astral Figure in AstralLightReveal — Anatomically Correct Human Model

## Problem
The `SILHOUETTE` path (line 104-116) in `AstralLightReveal.tsx` creates a blocky, LEGO-like figure with a pointed crest on the head (`C 55,-1` causes a spike above the skull). The body uses crude straight lines with no anatomical curves.

## Reference Analysis
The uploaded images show:
1. A tall, proportional human figure with natural head shape (smooth oval skull)
2. Visible shoulders, tapered waist, natural arm/leg proportions
3. Semi-transparent body with internal energy flow lines
4. The figure is dominant and central, not small or symbolic

## Plan

### 1. Replace the SILHOUETTE path with multi-part anatomical figure
**File: `src/components/AstralLightReveal.tsx`** — lines 103-116 only

Replace the single crude path with 8 discrete body part paths:
- **SKULL**: Smooth oval with natural cranial dome (no spike/crest). Proper forehead-to-chin curve.
- **NECK**: Tapered cylinder connecting head to shoulders
- **TORSO**: Broad shoulders → tapered waist with natural lateral curves (not rectangular)
- **PELVIS**: Hip structure connecting torso to legs
- **LEFT/RIGHT ARM**: Slightly away from body, natural elbow bend, visible forearms and hands
- **LEFT/RIGHT LEG**: Proper hip-knee-ankle proportions with slight stance width

All paths stay within the existing viewBox (0 0 110 175), centered at (55, 87). Using 7.5-head height proportions.

### 2. Add volumetric rendering layers
**File: `src/components/AstralLightReveal.tsx`** — lines 463-488

Replace the single `<path d={SILHOUETTE}>` with a layered rendering stack:
- **Base fill**: Multi-stop gradient for body volume (not flat color)
- **Depth shading**: Side gradient (darker edges, lighter center) for 3D effect
- **Muscle contour hints**: Very low-opacity strokes for shoulder line, torso midline, pectoral hints
- **Inner glow**: Radial gradient centered on chest for energy emanation

### 3. Update energy vein positions
**File: `src/components/AstralLightReveal.tsx`** — lines 516-552

Adjust the internal energy lines to follow the new anatomical paths:
- Spine path down center of new torso
- Arm meridians following the new arm paths
- Leg meridians following the new leg paths

### 4. Add SVG gradient definitions
Add new gradient defs for the volumetric figure (`fig-volume`, `fig-depth`, `fig-inner-glow`) to the existing `<defs>` section.

### Scope
- **ONLY** `src/components/AstralLightReveal.tsx` is modified
- No changes to hero, navigation, layout, or any other component
- Same viewBox, same FIG_CX/FIG_CHEST_Y/FIG_CORE_Y constants
- Same animation phases and timing logic

### Verification
- Render Remotion stills to confirm the figure looks human
- Render full video to verify animation flow

