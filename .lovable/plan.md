

## Replace blocky continents with realistic world silhouettes

### File 1 — Create `src/data/worldGeoData.ts`
New file exporting `WORLD_LAND_PATHS: string[]` — realistic equirectangular landmass silhouettes pre-projected to the existing `0..100 × 0..60` viewBox (lon -180..180, lat 85..-85).

Coverage with recognizable coastlines (curved Bezier paths, not straight polygons):
- **North America**: Alaska panhandle, curved Canadian coast with Hudson Bay indent, US east/west coasts, Gulf of Mexico arc, Florida peninsula, Baja California, tapered Central America
- **South America**: Brazil's eastern bulge, tapering Chilean coast to Tierra del Fuego
- **Europe**: Iberian peninsula, France, Italy boot, Balkans, Scandinavian curve, British Isles, Ireland, Iceland
- **Africa**: Mediterranean coast, Horn of Africa, Cape of Good Hope taper, Madagascar
- **Asia**: Siberian arc, Arabian peninsula, Indian subcontinent triangle, Indochina, Korean peninsula, Kamchatka
- **Oceania/Islands**: Australia with Cape York + Great Australian Bight, New Zealand (2 islands), Japan archipelago (curved), Philippines, Indonesia (Sumatra/Java/Borneo/Sulawesi/Papua)
- **Greenland**

Paths use SVG cubic/quadratic curves (`C`, `Q`) for organic coastlines. Total file size <15KB.

### File 2 — Update `src/components/AstrocartographySection.tsx`
- Swap import: `CONTINENT_PATHS` from `@/data/worldMapPaths` → `WORLD_LAND_PATHS` from `@/data/worldGeoData`
- Update the continents `.map()` render block to iterate `WORLD_LAND_PATHS`
- Refine landmass styling for the higher detail:
  - `fill="hsl(220 35% 14%)"` `fillOpacity="0.6"`
  - `stroke="hsl(215 55% 62%)"` `strokeWidth="0.15"` `strokeOpacity="0.4"`
  - `vectorEffect="non-scaling-stroke"` (crisp coastlines at any size)

### Untouched (zero changes)
Longitude/latitude grid, MC/IC/ASC/DSC planetary lines, glow bands, planet labels, city markers + click handlers, insight card, filters, recommendation cards, accordion, mobile responsive logic, RTL.

### Result
The map background becomes a recognizable world — curved coastlines, real peninsulas, island chains — in the same dark-navy / faint-gold-coastline palette. All astrocartography behavior identical.

