

## Replace SVG continents with a real raster world map

### Problem
Hand-drawn SVG continent paths will never look like the reference. The reference uses a real photographic equirectangular world map (NASA "Black Marble" night-lights style). We need a raster image, not vectors.

### Solution
Use a real equirectangular world-map image as the map background, then keep the existing SVG layer on top for grid, planetary lines, glow bands, labels, and city markers — so all interactivity and astrocartography logic stays exactly as is.

### Changes

**1. Add a real world-map image asset**
- Add `src/assets/world-map-night.jpg` — a public-domain equirectangular world map (NASA "Black Marble" night-lights, dark navy oceans, recognizable continents with city-light clusters matching the reference).
- Equirectangular projection (lon -180..180, lat -90..90) so it aligns perfectly with the existing `projX`/`projY` math.
- Compressed to ~150–250 KB (1920×960 JPG, quality 78) for fast load.

**2. Update `src/components/AstrocartographySection.tsx`**
- Import the asset: `import worldMapNight from "@/assets/world-map-night.jpg"`.
- Inside the map container, **before** the SVG, add an `<img>` layer:
  - `absolute inset-0 w-full h-full object-fill pointer-events-none select-none`
  - `style={{ opacity: 0.85, filter: "saturate(0.7) brightness(0.85)" }}` — keeps the dark mystical mood, lets the gold/colored lines pop on top.
- Add a soft dark gradient overlay (`hsl(222 50% 4% / 0.35)`) above the image so the map blends with the page and city labels stay legible.
- **Remove** the SVG `<g>` block that renders `WORLD_LAND_PATHS` (lines 277–290) and the dark radial gradient backdrop that competes with the image (lines 225–231).
- Slightly reduce the latitude/longitude grid opacity (already 0.06) so it reads as faint over the raster instead of fighting it.
- Keep `viewBox="0 0 100 60"` and `preserveAspectRatio="none"` so SVG overlays stay aligned with the stretched image.

**3. Untouched (zero changes)**
Filter pills, planetary lines (MC/IC/ASC/DSC), glow bands, planet symbol labels, dashed connector to nearest line, city markers + click handlers, hover/focus state, insight card, recommendation cards, planet meanings accordion, exploration hint, in-map legend, RTL, mobile responsive.

**4. Cleanup (optional, follow-up)**
`src/data/worldGeoData.ts` and `src/data/worldMapPaths.ts` become unused — leave for now, can be deleted later.

### Result
Background becomes a real, recognizable photographic world map (matching the reference). Planetary meridians, glow bands, "☉ MC", "♀ ASC" labels, and city pins sit on top exactly as they do today — but now over real geography instead of stylized polygons. All astrocartography behavior identical.

