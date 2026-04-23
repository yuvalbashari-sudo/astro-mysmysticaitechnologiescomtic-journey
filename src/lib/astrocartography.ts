// Personalized astrocartography derivation.
//
// Given birth details, we compute each major planet's MC terrestrial longitude:
//   MC_longitude_terrestrial ≈ planet_ecliptic_longitude − GMST(birthUTC)
//
// (Astronomical approximation: a planet is "on the MC" of any place whose local
// sidereal time equals the planet's right ascension. We use ecliptic longitude
// as a near-equivalent within the latitudes the UI actually displays — the goal
// here is *deterministic personalization*, not high-precision celestial computation.)
//
// Different birth date / year / time / city → different GMST → different per-planet
// terrestrial longitudes → different lines → different city strengths/recommendations.

import { calculateNatalChart } from "@/lib/natalChart";

export type LineKey = "love" | "career" | "spirit" | "home" | "abundance";
export type LineType = "MC" | "IC" | "ASC" | "DSC";

export interface DerivedPlanetLine {
  key: string;
  symbol: string;
  name: string;
  lon: number; // -180..180 terrestrial longitude
  lineType: LineType;
  color: string;
  line: LineKey;
  curve?: number;
  mobile?: boolean;
}

export interface AstrocartographyData {
  /** Stable signature of the birth details — used as cache key. */
  signature: string;
  planetLines: DerivedPlanetLine[];
  /** Per-city strength map keyed by city id. */
  cityStrength: Record<string, number>;
}

// Planet → semantic theme (kept in sync with UI categories).
const PLANET_LINE_KEY: Record<string, LineKey> = {
  sun: "career",
  moon: "home",
  venus: "love",
  mars: "abundance",
  jupiter: "spirit",
  saturn: "home",
  mercury: "career",
  uranus: "spirit",
  neptune: "spirit",
  pluto: "abundance",
};

const PLANET_META: Record<string, { symbol: string; name: string; color: string }> = {
  sun: { symbol: "☉", name: "שמש", color: "hsl(43 90% 60%)" },
  moon: { symbol: "☽", name: "ירח", color: "hsl(210 35% 88%)" },
  venus: { symbol: "♀", name: "ונוס", color: "hsl(340 75% 65%)" },
  mars: { symbol: "♂", name: "מאדים", color: "hsl(0 75% 58%)" },
  jupiter: { symbol: "♃", name: "צדק", color: "hsl(270 55% 68%)" },
  saturn: { symbol: "♄", name: "שבתאי", color: "hsl(215 28% 62%)" },
  mercury: { symbol: "☿", name: "מרקורי", color: "hsl(180 50% 60%)" },
  uranus: { symbol: "♅", name: "אורנוס", color: "hsl(190 65% 60%)" },
  neptune: { symbol: "♆", name: "נפטון", color: "hsl(220 65% 65%)" },
  pluto: { symbol: "♇", name: "פלוטו", color: "hsl(280 60% 55%)" },
};

// Subset shown by default — matches the original UI's planetary set.
const PRIMARY_PLANETS = ["sun", "moon", "venus", "mars", "jupiter", "saturn"];

// Cities reflected in the UI; keep id/lon/lat in sync with AstrocartographySection's CITIES.
const CITY_GEO: Array<{ id: string; lon: number; favorLine?: LineKey }> = [
  { id: "london", lon: -0.13 },
  { id: "newyork", lon: -74 },
  { id: "barcelona", lon: 2.17 },
  { id: "bali", lon: 115.2 },
  { id: "tokyo", lon: 139.7 },
];

/** Wrap longitude difference into [0..180] degrees. */
function lonDistance(a: number, b: number) {
  const d = Math.abs(((a - b + 540) % 360) - 180);
  return d;
}

/** Greenwich Mean Sidereal Time (degrees) for a given UTC instant.
 *  Formula: Meeus, Astronomical Algorithms, ch. 12 (low-precision form). */
function gmstDegrees(utc: Date): number {
  const JD =
    utc.getTime() / 86400000 + 2440587.5; // Unix epoch → Julian Date
  const T = (JD - 2451545.0) / 36525.0;
  let gmst =
    280.46061837 +
    360.98564736629 * (JD - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000.0;
  gmst = ((gmst % 360) + 360) % 360;
  return gmst;
}

/** Convert local birth time + IANA timezone → UTC Date. */
function toUtcDate(birthDate: string, birthTime: string, timezone: string): Date {
  const [y, m, d] = birthDate.split("-").map(Number);
  const [hh, mm] = birthTime.split(":").map(Number);
  const localMs = Date.UTC(y, (m || 1) - 1, d || 1, hh || 0, mm || 0);
  if (!timezone) return new Date(localMs);
  // Compute the timezone offset for that wall-clock moment, mirroring natalChart.ts
  try {
    const ref = new Date(localMs);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", second: "numeric", hour12: false,
    }).formatToParts(ref);
    const get = (t: string) => parseInt(parts.find((p) => p.type === t)?.value || "0", 10);
    const localFromUtc = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour") === 24 ? 0 : get("hour"),
      get("minute"),
      get("second"),
    );
    const offsetMs = localFromUtc - localMs;
    return new Date(localMs - offsetMs);
  } catch {
    return new Date(localMs);
  }
}

function normalizeLon(deg: number): number {
  // Map [0..360) → (-180..180]
  let x = ((deg % 360) + 360) % 360;
  if (x > 180) x -= 360;
  return x;
}

/** Compute personalized astrocartography data. */
export async function computeAstrocartography(input: {
  birthDate: string;
  birthTime: string;
  birthCity: string;
}): Promise<AstrocartographyData> {
  const signature = `${input.birthDate}|${input.birthTime}|${input.birthCity.trim().toLowerCase()}`;

  // Use the existing natal engine to get planet ecliptic longitudes + tz-resolved location.
  const chart = await calculateNatalChart({
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    birthPlace: input.birthCity,
  });

  const utc = toUtcDate(input.birthDate, input.birthTime, chart.location.timezone);
  const gmst = gmstDegrees(utc);

  // Build MC + IC lines per primary planet. ASC/DSC kept symbolic via curve+/-.
  const planetLines: DerivedPlanetLine[] = [];
  for (const key of PRIMARY_PLANETS) {
    const meta = PLANET_META[key];
    const eclipticLon = chart.planetPositions[key];
    if (eclipticLon == null || !meta) continue;

    const mcLon = normalizeLon(eclipticLon - gmst);
    const icLon = normalizeLon(mcLon + 180);
    const line = PLANET_LINE_KEY[key];

    planetLines.push({
      key: `${key}-mc`,
      symbol: meta.symbol,
      name: meta.name,
      lon: mcLon,
      lineType: "MC",
      color: meta.color,
      line,
      mobile: true,
    });
    planetLines.push({
      key: `${key}-ic`,
      symbol: meta.symbol,
      name: meta.name,
      lon: icLon,
      lineType: "IC",
      color: meta.color,
      line,
    });
  }

  // Add a couple of ASC-style curved lines for visual richness, derived from
  // Venus & Jupiter shifted ±90° (a deterministic personalization, not a
  // high-precision horizon line).
  const venus = chart.planetPositions["venus"];
  const jupiter = chart.planetPositions["jupiter"];
  if (venus != null) {
    planetLines.push({
      key: "venus-asc",
      symbol: PLANET_META.venus.symbol,
      name: PLANET_META.venus.name,
      lon: normalizeLon(venus - gmst + 90),
      lineType: "ASC",
      color: PLANET_META.venus.color,
      line: "love",
      curve: 1.6,
      mobile: true,
    });
  }
  if (jupiter != null) {
    planetLines.push({
      key: "jupiter-asc",
      symbol: PLANET_META.jupiter.symbol,
      name: PLANET_META.jupiter.name,
      lon: normalizeLon(jupiter - gmst + 90),
      lineType: "ASC",
      color: PLANET_META.jupiter.color,
      line: "spirit",
      curve: 1.2,
    });
  }

  // City strength = how close the city sits to its category's nearest planet line.
  // 0° away → 100. 90° away → ~10. Smooth, monotonic, distinguishable per birth.
  const cityStrength: Record<string, number> = {};
  for (const c of CITY_GEO) {
    let best = 180;
    for (const p of planetLines) {
      const d = lonDistance(p.lon, c.lon);
      if (d < best) best = d;
    }
    // Map distance [0..90] → strength [100..40]; >90 → 30..15 floor.
    const s =
      best <= 90
        ? Math.round(100 - (best / 90) * 60)
        : Math.max(15, Math.round(40 - ((best - 90) / 90) * 25));
    cityStrength[c.id] = Math.max(15, Math.min(99, s));
  }

  return { signature, planetLines, cityStrength };
}
