// Equirectangular world map silhouettes — coordinates in viewBox 0..100 (x: lon -180..180) × 0..60 (y: lat 85..-85).
// Hand-tuned to be more recognizable than basic polygons: includes coastline curves, peninsulas, and major islands.
// Designed for a minimal dark map look, not a precise cartographic source.

export const CONTINENT_PATHS: string[] = [
  // ---------- NORTH AMERICA ----------
  // Alaska
  "M 8 11 L 13 9 L 17 10 L 18 13 L 14 14 L 10 14 Z",
  // Canada main + Hudson Bay indent
  "M 14 11 L 22 9 L 28 10 L 31 12 L 32 16 L 29 17 L 27 15 L 25 17 L 24 19 L 21 19 L 18 17 L 15 15 Z",
  // USA mainland + Florida
  "M 15 17 L 30 17 L 31 21 L 29 23 L 27 24 L 26 25 L 27 27 L 26 28 L 24 27 L 22 24 L 19 23 L 16 21 Z",
  // Mexico + Central America (long curve)
  "M 22 24 L 26 25 L 27 28 L 28 30 L 30 31 L 31 33 L 29 33 L 27 31 L 25 29 L 23 27 Z",
  // Greenland
  "M 35 6 L 41 5 L 43 9 L 41 12 L 38 13 L 35 11 Z",

  // ---------- SOUTH AMERICA ----------
  // Main continent (Brazil bulge + tapering Chile)
  "M 28 32 L 32 31 L 34 33 L 35 37 L 34 41 L 32 45 L 30 49 L 28 52 L 26 53 L 25 51 L 25 47 L 26 42 L 26 37 L 27 34 Z",

  // ---------- EUROPE ----------
  // Iberia + France + Central Europe
  "M 46 14 L 50 13 L 53 13 L 55 14 L 57 14 L 59 15 L 60 17 L 58 19 L 55 20 L 52 20 L 49 19 L 47 17 Z",
  // Scandinavia
  "M 51 9 L 55 8 L 56 11 L 54 13 L 52 12 Z",
  // Italy boot
  "M 53 17 L 55 17 L 55 20 L 54 20 Z",
  // British Isles
  "M 47 13 L 49 12 L 49 15 L 47 16 Z",

  // ---------- AFRICA ----------
  // Main body (Sahara wide, tapering south)
  "M 49 21 L 56 20 L 60 22 L 62 26 L 62 32 L 60 38 L 56 44 L 53 47 L 51 46 L 49 41 L 48 35 L 48 27 Z",
  // Madagascar
  "M 62 41 L 64 41 L 64 45 L 62 45 Z",
  // Horn of Africa
  "M 60 26 L 63 25 L 64 28 L 61 28 Z",

  // ---------- MIDDLE EAST ----------
  "M 58 18 L 64 17 L 67 19 L 68 22 L 65 24 L 60 23 L 58 21 Z",
  // Arabian peninsula
  "M 60 22 L 65 22 L 66 26 L 63 27 L 61 25 Z",

  // ---------- ASIA ----------
  // Russia / Siberia (huge northern band)
  "M 55 7 L 70 5 L 85 6 L 92 8 L 92 12 L 88 13 L 84 12 L 78 12 L 72 13 L 66 13 L 60 12 L 56 11 Z",
  // China + Mongolia + Korea
  "M 72 13 L 86 13 L 88 17 L 87 21 L 84 22 L 80 22 L 76 21 L 73 19 L 71 16 Z",
  // Korean peninsula
  "M 85 19 L 87 19 L 87 22 L 86 22 Z",
  // India (triangular peninsula)
  "M 70 22 L 76 22 L 75 26 L 74 30 L 72 32 L 71 30 L 70 26 Z",
  // Southeast Asia (Indochina)
  "M 78 24 L 82 24 L 82 30 L 80 32 L 78 31 Z",

  // ---------- INDONESIA / SE ASIA ARCHIPELAGO ----------
  // Sumatra
  "M 76 33 L 80 32 L 81 35 L 78 36 Z",
  // Java
  "M 79 36 L 83 36 L 83 37 L 80 37 Z",
  // Borneo
  "M 81 32 L 84 32 L 84 35 L 82 35 Z",
  // Sulawesi
  "M 84 33 L 86 33 L 86 36 L 84 36 Z",
  // Philippines
  "M 84 27 L 86 27 L 86 31 L 84 31 Z",
  // Papua New Guinea
  "M 86 35 L 91 35 L 91 38 L 87 38 Z",

  // ---------- JAPAN ----------
  "M 87 14 L 89 13 L 90 17 L 88 19 L 87 17 Z",

  // ---------- AUSTRALIA ----------
  "M 82 40 L 89 39 L 92 41 L 92 45 L 89 48 L 84 49 L 81 47 L 81 43 Z",
  // New Zealand
  "M 93 47 L 95 46 L 95 50 L 93 51 Z",

  // ---------- ICELAND ----------
  "M 44 9 L 46 9 L 46 11 L 44 11 Z",
];
