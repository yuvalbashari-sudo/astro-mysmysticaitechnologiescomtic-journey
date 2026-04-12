

# Plan: Generate Clean Astral Figure Image

## Current State
The astral figure (`src/assets/astral-figure.png`) contains colored chakra dots baked into the image itself. All SVG overlay code has already been removed, but the dots persist in the source image.

## Plan

1. **Generate a new astral figure image** using AI image generation (Lovable AI with Gemini image model)
   - Prompt: A photorealistic, translucent human silhouette glowing with soft ethereal light against a dark/transparent background. No chakra points, no colored dots on the body. Clean, luminous silhouette only — suitable as a mystical/astral overlay.
   - Output a preview to `/mnt/documents/astral-figure-preview.png` for your review first

2. **After your approval** — replace `src/assets/astral-figure.png` with the approved image

No code changes needed beyond swapping the image file. The component already references it via the existing import.

## Technical Details
- Will use `google/gemini-3-pro-image-preview` for high-quality generation
- The image needs a dark or transparent background to work with the existing SVG overlay system
- The silhouette should be centered and roughly match the current figure's proportions

