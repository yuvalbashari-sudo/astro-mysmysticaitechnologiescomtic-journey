// Realistic world landmass silhouettes — equirectangular projection.
// ViewBox 0..100 (x: lon -180..180) × 0..60 (y: lat 85..-85).
// Helper: lon→x = (lon+180)/3.6 ; lat→y = (85-lat)/2.833.
// Paths use cubic/quadratic Bezier curves for organic, recognizable coastlines.
// Hand-crafted from Natural Earth low-res references; not a precise cartographic source.

export const WORLD_LAND_PATHS: string[] = [
  // ====================== NORTH AMERICA ======================
  // Alaska (with panhandle reaching SE)
  "M 5 11 Q 8 9 12 9.5 Q 16 10 18 12 Q 19 13.5 17 14 Q 14 14.5 12 14 Q 9 14.5 7 13.5 Q 5 13 5 11 Z",
  // Aleutian arc (small)
  "M 2 14.5 Q 5 15 8 14.8 L 7 15.4 Q 4 15.6 2 15.2 Z",
  // Canadian mainland with Hudson Bay indent + Labrador
  "M 14 10 Q 18 8.5 23 8.5 Q 28 8.5 32 9.5 Q 35 10.5 36 13 L 35 16 Q 33 17 31 16.5 Q 29.5 14 27.5 14.5 Q 26 16 26.5 18 Q 26 19.5 24 19 Q 22 18.5 20 17.5 Q 17 17 15 15.5 Q 13.5 13 14 10 Z",
  // Hudson Bay indent (cut-out drawn as second small path overlay isn't possible w/ fill —
  // the bay shape is approximated by the inward Q on the canada path above).
  // USA mainland (curved Pacific coast, Gulf, Atlantic, Florida hook)
  "M 14 17 Q 18 16.5 22 17 Q 27 17 31 17.5 Q 32 19 32 21 Q 31 22.5 29.5 23 Q 28.5 24.5 27.5 24.5 Q 27 26 27.5 27.5 Q 27 28.5 26 28 Q 24.5 26.5 23 25 Q 21 24 19 23.5 Q 16.5 22.5 14.5 21 Q 13.5 19 14 17 Z",
  // Baja California
  "M 22 24.5 Q 23.5 25 24 27 Q 24 28.5 23 28.2 Q 22 27 22 25 Z",
  // Mexico + tapering Central America
  "M 24 25 Q 27 25.5 28.5 27 Q 29.5 28.5 30 30 Q 30.5 31.5 31 32.5 Q 30.5 33.5 29.5 33 Q 28 32 27 30.5 Q 25.5 29 24.5 27.5 Q 24 26 24 25 Z",
  // Cuba
  "M 28 28 Q 30 27.8 31.5 28.2 Q 30 28.8 28.5 28.6 Z",
  // Greenland
  "M 36 5 Q 40 4 44 5 Q 46 7 45.5 10 Q 44 12.5 41 13 Q 38 13 36 11 Q 35 8 36 5 Z",

  // ====================== SOUTH AMERICA ======================
  // Main continent — Brazil bulge + tapering Chile
  "M 28 31 Q 31 30.5 33 31.5 Q 35 33 35.5 36 Q 35.5 39 34.5 42 Q 33 45 31.5 48 Q 30 50.5 28.5 52.5 Q 27 53.5 26 52.5 Q 25.5 50 26 47 Q 26.5 43 27 39 Q 27 35 27.5 32.5 Q 27.5 31.5 28 31 Z",

  // ====================== EUROPE ======================
  // Iberian peninsula
  "M 46 16 Q 48.5 15.5 50.5 16 Q 51 17.5 50 18.5 Q 48.5 19 47 18.5 Q 46 17.5 46 16 Z",
  // France + Central Europe + Eastern Europe (broad mass)
  "M 50 15 Q 53 14 56 14 Q 60 14 63 15 Q 66 15.5 68 16.5 Q 68.5 18 67 19 Q 64 19.5 60 19 Q 56 19 53 18.5 Q 50.5 17.5 50 15 Z",
  // Italy boot
  "M 54 17.5 Q 55 17.5 55.3 18.5 Q 55.5 19.5 54.7 20.2 Q 54 20 54 19 Z",
  // Scandinavia (Norway/Sweden curved)
  "M 52 9 Q 55 7.5 58 8 Q 59 10 57.5 12.5 Q 55 14 53 13 Q 51.5 11 52 9 Z",
  // British Isles (Great Britain)
  "M 47 13 Q 48.5 12.5 49 14 Q 49 15.5 48 16 Q 47 15.5 46.8 14 Z",
  // Ireland
  "M 45.5 14 Q 46.5 14 46.5 15 Q 46 15.8 45.3 15.3 Z",
  // Iceland
  "M 44 9.5 Q 45.5 9 46.5 9.8 Q 46 10.8 44.5 10.7 Z",

  // ====================== AFRICA ======================
  // Main continent (Sahara wide, Congo middle, Cape taper)
  "M 49 20 Q 53 19.5 57 19.8 Q 60 20.5 62 22 Q 63 24 63 27 Q 63 30 62 33 Q 61 37 59 41 Q 56 45 53 47 Q 51 47.5 50 45 Q 49 41 48.5 37 Q 48 33 48 28 Q 48 24 48.5 21.5 Q 48.7 20.5 49 20 Z",
  // Madagascar
  "M 63 40 Q 64.5 40 64.5 43 Q 64 45.5 63 45 Q 62.5 43 63 40 Z",
  // Horn of Africa
  "M 60 25 Q 63 24.5 64.5 26 Q 64 27.5 62 27.5 Q 60.5 27 60 25 Z",

  // ====================== MIDDLE EAST ======================
  // Anatolia / Levant
  "M 58 17 Q 62 16.5 66 17.5 Q 67.5 19 66 20 Q 62 20 59 19 Q 57.5 18 58 17 Z",
  // Arabian peninsula
  "M 60 21 Q 64 20.5 67 22 Q 67.5 24.5 66 26 Q 64 27 62 26 Q 60 24 60 21 Z",

  // ====================== ASIA ======================
  // Russia / Siberia (huge northern band, curved arctic coast)
  "M 55 7 Q 65 5.5 75 5.5 Q 85 6 92 7.5 Q 95 9 94 11.5 Q 90 13 85 12.5 Q 80 12 74 12.5 Q 68 13 62 12.5 Q 57 12 55 10 Q 54 8.5 55 7 Z",
  // Kamchatka
  "M 92 10 Q 94 11 93.5 14 Q 92.5 15 91.5 13 Z",
  // China + Mongolia + Manchuria
  "M 70 13 Q 78 12.5 86 13.5 Q 89 15 89 18 Q 88 21 84 22 Q 79 22.5 75 21.5 Q 71 20 70 17 Q 69.5 15 70 13 Z",
  // Korean peninsula
  "M 86 19 Q 87.5 19 87.7 21.5 Q 87 22.5 86.2 22 Q 85.7 20.5 86 19 Z",
  // Indian subcontinent (triangular)
  "M 70 21 Q 74 21 76.5 22 Q 76 25 75 28 Q 73.5 31 72.5 32.5 Q 71.5 31 71 28 Q 70 25 70 21 Z",
  // Indochina peninsula
  "M 78 23 Q 81.5 23 82.5 25 Q 82.5 29 81 31.5 Q 79.5 32 78.5 30 Q 77.5 26.5 78 23 Z",
  // Malay peninsula tip
  "M 80 31 Q 81 31.5 80.7 33 Q 79.8 33 79.5 32 Z",

  // ====================== INDONESIA / SE ASIA ARCHIPELAGO ======================
  // Sumatra (long diagonal)
  "M 75 33 Q 79 32 81.5 34 Q 81 35.5 78.5 36 Q 76 36 75 34 Z",
  // Java (thin east-west)
  "M 79 36.5 Q 83 36 84.5 36.8 Q 83.5 37.5 80 37.3 Z",
  // Borneo (rounded)
  "M 81 32 Q 84 31.5 85.5 33 Q 85 35.5 83 35.5 Q 81 34.5 81 32 Z",
  // Sulawesi (K-shape simplified)
  "M 84.5 33 Q 86.5 33 86.5 35 Q 85.5 36 84.8 35 Q 84.3 34 84.5 33 Z",
  // Philippines (cluster)
  "M 84.5 26 Q 86 26 86.3 28.5 Q 86 31 84.8 30.5 Q 84.2 28 84.5 26 Z",
  // New Guinea (Papua)
  "M 86 35 Q 90 34.5 93 35.5 Q 92.5 37.5 89 37.5 Q 86.5 37 86 35 Z",

  // ====================== JAPAN (curved archipelago) ======================
  "M 87 14 Q 89 13.5 90 16 Q 90.5 18 88.5 19 Q 87.5 17.5 87 14 Z",
  // Hokkaido (north)
  "M 89 12.5 Q 90.5 12 90.8 13.5 Q 89.5 14 89 13 Z",

  // ====================== AUSTRALIA ======================
  // Australia (Cape York NE + Great Australian Bight on south)
  "M 81 40 Q 85 39 89 39.5 Q 92 40.5 93 42.5 Q 92.5 45 90 47 Q 87 48.5 84 48 Q 82 47 81 45 Q 80.5 42.5 81 40 Z",
  // Tasmania
  "M 87 49 Q 88.5 49 88.5 50 Q 87.5 50.5 87 49.5 Z",
  // New Zealand — North Island
  "M 94 47 Q 95 46.5 95.3 48 Q 94.5 48.8 94 48 Z",
  // New Zealand — South Island
  "M 93.5 48.5 Q 94.5 48.3 95 50 Q 94 51 93.3 49.5 Z",
];
