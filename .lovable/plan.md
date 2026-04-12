

# Replace SVG Figure with AI-Generated Astral Human Image

## Problem
SVG paths — no matter how refined — cannot produce the photorealistic, translucent, glowing human figure shown in the reference image. The current approach of drawing body parts with geometric curves will always look like a flat outline or "LEGO" figure. The reference shows a photorealistic ethereal body with internal light networks, volumetric transparency, and organic muscle definition.

## Solution
Use the Lovable AI image generation model (`google/gemini-2.5-flash-image`) to generate a high-quality astral human figure image matching the reference, then use it as the base visual instead of SVG paths.

### Step 1: Generate the astral figure image
Use the AI image generation API to create a transparent/dark-background astral human figure matching the reference:
- Tall, proportional human body
- Semi-transparent ethereal glow
- Internal energy/light networks visible
- Standing pose with arms slightly open
- Dark background (will blend with the scene)

Save the generated image to `src/assets/astral-figure.png`.

### Step 2: Replace SVG body rendering with the image
In `src/components/AstralLightReveal.tsx`:
- Remove the `BODY_PARTS`, `CONTOURS`, `HEAD`, `NECK`, `TORSO`, `LEFT_ARM`, `RIGHT_ARM`, `LEFT_LEG`, `RIGHT_LEG` SVG path constants
- Replace the SVG `<g>` block (lines 587-664) that renders body parts with an `<image>` element referencing the generated PNG
- Keep the same positioning (`figX`, `figY`, `figScale`) and animation behavior
- Maintain all energy effects (beams, chakras, pulse rings) overlaid on top of the image

### Step 3: Keep all existing animation logic
- Same phase timing (constellation → beam → absorption → climax)
- Same beam targeting to chest center
- Same pulse rings and energy veins overlaid
- Same glow/opacity animations driven by `absorptionLevel` and `climaxLevel`
- The image opacity and glow filter will still respond to animation phases

### Scope
- Only `src/components/AstralLightReveal.tsx` is modified
- One new asset file: `src/assets/astral-figure.png`
- No changes to hero, navigation, layout, or any other component

