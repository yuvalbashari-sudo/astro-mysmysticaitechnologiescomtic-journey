// @ts-ignore - package main field missing .js extension
import { Horoscope, Origin } from "circular-natal-horoscope-js/dist/index.js";

const SIGN_META: Record<string, { hebrewName: string; symbol: string; element: string; elementKey: string }> = {
  Aries: { hebrewName: "טלה", symbol: "♈", element: "אש", elementKey: "fire" },
  Taurus: { hebrewName: "שור", symbol: "♉", element: "אדמה", elementKey: "earth" },
  Gemini: { hebrewName: "תאומים", symbol: "♊", element: "אוויר", elementKey: "air" },
  Cancer: { hebrewName: "סרטן", symbol: "♋", element: "מים", elementKey: "water" },
  Leo: { hebrewName: "אריה", symbol: "♌", element: "אש", elementKey: "fire" },
  Virgo: { hebrewName: "בתולה", symbol: "♍", element: "אדמה", elementKey: "earth" },
  Libra: { hebrewName: "מאזניים", symbol: "♎", element: "אוויר", elementKey: "air" },
  Scorpio: { hebrewName: "עקרב", symbol: "♏", element: "מים", elementKey: "water" },
  Sagittarius: { hebrewName: "קשת", symbol: "♐", element: "אש", elementKey: "fire" },
  Capricorn: { hebrewName: "גדי", symbol: "♑", element: "אדמה", elementKey: "earth" },
  Aquarius: { hebrewName: "דלי", symbol: "♒", element: "אוויר", elementKey: "air" },
  Pisces: { hebrewName: "דגים", symbol: "♓", element: "מים", elementKey: "water" },
};

const PLANET_META = {
  sun: { name: "שמש", symbol: "☉" },
  moon: { name: "ירח", symbol: "☽" },
  mercury: { name: "מרקורי", symbol: "☿" },
  venus: { name: "ונוס", symbol: "♀" },
  mars: { name: "מאדים", symbol: "♂" },
  jupiter: { name: "יופיטר", symbol: "♃" },
  saturn: { name: "שבתאי", symbol: "♄" },
  uranus: { name: "אורנוס", symbol: "♅" },
  neptune: { name: "נפטון", symbol: "♆" },
  pluto: { name: "פלוטו", symbol: "♇" },
} as const;

const ASPECT_META: Record<string, string> = {
  conjunction: "צמידות",
  opposition: "מולות",
  trine: "טריין",
  square: "ריבוע",
  sextile: "שישון",
  quincunx: "קווינקונקס",
};

const ISRAEL_ALIASES = ["Israel", "ישראל", "Израиль", "إسرائيل"];

const SUPPORTED_PLANETS = Object.keys(PLANET_META) as Array<keyof typeof PLANET_META>;

type SignLabel = string;

export interface GeocodedBirthPlace {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  timezone: string;
}

export interface PlanetPlacement {
  key: string;
  name: string;
  symbol: string;
  sign: string;
  /** English sign key, e.g. "Aries" */
  signKey: string;
  degree: number;
  house: number;
  absoluteDegree: number;
}

export interface NatalAspect {
  label: string;
  type: string;
  orb: number;
  planet1Key: string;
  planet2Key: string;
}

export interface NatalHouseCusp {
  house: number;
  sign: string;
  signKey: string;
  degree: number;
  absoluteDegree: number;
}

export interface NatalChartResult {
  location: GeocodedBirthPlace;
  sunSign: { hebrewName: string; symbol: string; element: string; key: string };
  risingSign: { hebrewName: string; symbol: string; element: string; key: string };
  moonSign: string;
  /** English key of moon sign for localization */
  moonSignKey: string;
  ascendantAngle: number;
  planetPositions: Record<string, number>;
  planetPlacements: PlanetPlacement[];
  aspects: NatalAspect[];
  houseCusps: NatalHouseCusp[];
  dominantElements: Array<{ element: string; elementKey: string; count: number }>;
  dominantHouses: Array<{ house: number; count: number }>;
}

function parseBirthDate(birthDate: string) {
  const [year, month, day] = birthDate.split("-").map(Number);
  if (!year || !month || !day) throw new Error("תאריך הלידה אינו תקין");
  return { year, month, day };
}

function parseBirthTime(birthTime: string) {
  const [hour, minute] = birthTime.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) throw new Error("שעת הלידה אינה תקינה");
  return { hour, minute };
}

function getSignMeta(label?: string) {
  const key = (label || "Aries") as string;
  const meta = SIGN_META[key] || SIGN_META.Aries;
  return { ...meta, key };
}

function normalizeDegree(degree: number) {
  return ((degree % 360) + 360) % 360;
}

function degreeInSign(degree: number) {
  return Math.round((normalizeDegree(degree) % 30) * 10) / 10;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizePlaceQuery(query: string) {
  return query
    .replace(/[،]/g, ",")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectGeocodeLanguages(query: string) {
  if (/[\u0590-\u05FF]/.test(query)) return ["he", "en"];
  if (/[\u0600-\u06FF]/.test(query)) return ["ar", "en"];
  if (/[\u0400-\u04FF]/.test(query)) return ["ru", "en"];
  return ["en", "he"];
}

function buildGeocodeCandidates(query: string) {
  const candidates = new Set<string>();

  const addCandidate = (value?: string) => {
    const normalized = normalizePlaceQuery(value || "");
    if (!normalized) return;

    candidates.add(normalized);

    const camelSplit = normalized.replace(/([a-z])([A-Z])/g, "$1 $2");
    if (camelSplit !== normalized) {
      candidates.add(camelSplit);
    }
  };

  addCandidate(query);

  const normalizedQuery = normalizePlaceQuery(query);
  const parts = normalizedQuery.split(/\s+/).filter(Boolean);

  if (!normalizedQuery.includes(",") && parts.length >= 2) {
    addCandidate(`${parts.slice(0, -1).join(" ")}, ${parts[parts.length - 1]}`);
  }

  for (const alias of ISRAEL_ALIASES) {
    const exactCountryPattern = new RegExp(`^${escapeRegExp(alias)}$`, "i");
    const suffixCountryPattern = new RegExp(`^(.+?)(?:,\\s*|\\s+)${escapeRegExp(alias)}$`, "i");

    if (exactCountryPattern.test(normalizedQuery)) {
      addCandidate(alias);
      addCandidate(alias === "Israel" ? "ישראל" : "Israel");
    }

    const suffixMatch = normalizedQuery.match(suffixCountryPattern);
    if (!suffixMatch) continue;

    const cityPart = suffixMatch[1].trim();
    addCandidate(cityPart);
    addCandidate(`${cityPart}, ${alias}`);
    addCandidate(`${cityPart}, Israel`);
    addCandidate(`${cityPart}, ישראל`);
  }

  const firstWord = parts[0] || normalizedQuery;
  if (firstWord.length >= 4 && firstWord.length <= 15 && !firstWord.includes(" ")) {
    for (let i = 2; i < firstWord.length - 1; i++) {
      const splitWord = `${firstWord.slice(0, i)} ${firstWord.slice(i)}`;
      const fullCandidate = parts.length > 1
        ? `${splitWord} ${parts.slice(1).join(" ")}`
        : splitWord;

      addCandidate(fullCandidate);

      const splitParts = normalizePlaceQuery(fullCandidate).split(/\s+/).filter(Boolean);
      if (splitParts.length >= 2 && !fullCandidate.includes(",")) {
        addCandidate(`${splitParts.slice(0, -1).join(" ")}, ${splitParts[splitParts.length - 1]}`);
      }
    }
  }

  return Array.from(candidates);
}

async function tryGeocode(query: string, language: string): Promise<any | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=${encodeURIComponent(language)}&format=json`;
  let response: Response;

  try {
    response = await fetch(url);
  } catch {
    throw new Error("GEOCODE_FETCH_FAILED");
  }

  if (!response.ok) return null;
  const data = await response.json();
  return data?.results?.[0] || null;
}

export async function geocodeBirthPlace(place: string): Promise<GeocodedBirthPlace> {
  const query = normalizePlaceQuery(place);
  if (!query) throw new Error("GEOCODE_EMPTY");

  const candidates = buildGeocodeCandidates(query);
  const languages = detectGeocodeLanguages(query);
  let result: any | null = null;
  let hadFetchFailure = false;

  for (const candidate of candidates) {
    for (const language of languages) {
      try {
        result = await tryGeocode(candidate, language);
      } catch (error) {
        if (error instanceof Error && error.message === "GEOCODE_FETCH_FAILED") {
          hadFetchFailure = true;
          continue;
        }

        throw error;
      }

      if (result) break;
    }

    if (result) break;
  }

  if (!result) {
    if (hadFetchFailure) {
      throw new Error("GEOCODE_FETCH_FAILED");
    }

    throw new Error("GEOCODE_NOT_FOUND");
  }

  return {
    name: [result.name, result.country].filter(Boolean).join(", "),
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country || "",
    timezone: result.timezone || "",
  };
}

export async function calculateNatalChart(input: {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
}): Promise<NatalChartResult> {
  const { year, month, day } = parseBirthDate(input.birthDate);
  const { hour, minute } = parseBirthTime(input.birthTime);
  const location = await geocodeBirthPlace(input.birthPlace);

  // Convert local birth time to UTC using the location's timezone
  // The library expects UTC time for accurate calculations
  const localDate = new Date(year, month - 1, day, hour, minute, 0);
  let utcYear = year, utcMonth = month, utcDay = day, utcHour = hour, utcMinute = minute;

  if (location.timezone) {
    try {
      // Format local date in the birth timezone to find the UTC offset
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: location.timezone,
        year: "numeric", month: "numeric", day: "numeric",
        hour: "numeric", minute: "numeric", hour12: false,
      });
      // Create a UTC date and see what local time it maps to
      // Then reverse-engineer the offset
      const utcRef = Date.UTC(year, month - 1, day, hour, minute, 0);
      const localParts = new Intl.DateTimeFormat("en-US", {
        timeZone: location.timezone,
        year: "numeric", month: "numeric", day: "numeric",
        hour: "numeric", minute: "numeric", second: "numeric", hour12: false,
      }).formatToParts(new Date(utcRef));
      
      const getPart = (type: string) => parseInt(localParts.find(p => p.type === type)?.value || "0", 10);
      const localFromUtc = new Date(getPart("year"), getPart("month") - 1, getPart("day"), getPart("hour") === 24 ? 0 : getPart("hour"), getPart("minute"), getPart("second"));
      
      // offset = local - UTC (in ms)
      const offsetMs = localFromUtc.getTime() - new Date(utcRef).getTime();
      // Subtract offset from local birth time to get UTC birth time
      // If local is UTC+3, we subtract 3 hours to get UTC
      // offsetMs tells us: when it's `hour:minute` UTC, the local time is `hour:minute + offset`
      // So if user says "14:30 local", UTC = 14:30 - offset
      const birthUtcMs = new Date(year, month - 1, day, hour, minute, 0).getTime() - offsetMs;
      const birthUtc = new Date(birthUtcMs);
      
      utcYear = birthUtc.getFullYear();
      utcMonth = birthUtc.getMonth() + 1;
      utcDay = birthUtc.getDate();
      utcHour = birthUtc.getHours();
      utcMinute = birthUtc.getMinutes();
    } catch (e) {
      console.warn("Timezone conversion failed, using local time as-is:", e);
    }
  }

  console.log(`[NatalChart] Location: ${location.name} (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}), TZ: ${location.timezone}`);
  console.log(`[NatalChart] Local: ${year}-${month}-${day} ${hour}:${minute} → UTC: ${utcYear}-${utcMonth}-${utcDay} ${utcHour}:${utcMinute}`);

  const origin = new Origin({
    year: utcYear,
    month: utcMonth - 1,
    date: utcDay,
    hour: utcHour,
    minute: utcMinute,
    latitude: location.latitude,
    longitude: location.longitude,
  });

  const horoscope: any = new Horoscope({
    origin,
    houseSystem: "placidus",
    zodiac: "tropical",
    aspectPoints: ["bodies", "angles"],
    aspectWithPoints: ["bodies", "angles"],
    aspectTypes: ["major"],
    language: "en",
  });

  const planetPlacements: PlanetPlacement[] = SUPPORTED_PLANETS.map((key) => {
    const body = horoscope.CelestialBodies[key];
    const signMeta = getSignMeta(body?.Sign?.label);
    const absoluteDegree = normalizeDegree(body?.ChartPosition?.Ecliptic?.DecimalDegrees || 0);

    return {
      key,
      name: PLANET_META[key].name,
      symbol: PLANET_META[key].symbol,
      sign: signMeta.hebrewName,
      signKey: signMeta.key,
      degree: degreeInSign(absoluteDegree),
      house: body?.House?.id || 1,
      absoluteDegree,
    };
  });

  const planetPositions = Object.fromEntries(
    planetPlacements.map((placement) => [placement.key, placement.absoluteDegree]),
  );

  const ascendantAngle = normalizeDegree(horoscope.Ascendant?.ChartPosition?.Ecliptic?.DecimalDegrees || 0);
  const risingMeta = getSignMeta(horoscope.Ascendant?.Sign?.label);
  const sunMeta = getSignMeta(horoscope.CelestialBodies?.sun?.Sign?.label);
  const moonMeta = getSignMeta(horoscope.CelestialBodies?.moon?.Sign?.label);

  const houseCusps: NatalHouseCusp[] = (horoscope.Houses || []).map((house: any) => {
    const cuspDegree = normalizeDegree(house?.ChartPosition?.StartPosition?.Ecliptic?.DecimalDegrees || 0);
    const signMeta = getSignMeta(house?.Sign?.label);

    return {
      house: house.id,
      sign: signMeta.hebrewName,
      signKey: signMeta.key,
      degree: degreeInSign(cuspDegree),
      absoluteDegree: cuspDegree,
    };
  });

  const aspects: NatalAspect[] = (horoscope.Aspects?.all || [])
    .filter((aspect: any) => {
      const key1 = aspect.point1Key;
      const key2 = aspect.point2Key;
      return SUPPORTED_PLANETS.includes(key1) && (SUPPORTED_PLANETS.includes(key2) || key2 === "ascendant");
    })
    .filter((aspect: any) => (aspect.orb ?? 99) <= 6.5)
    .sort((a: any, b: any) => a.orb - b.orb)
    .slice(0, 8)
    .map((aspect: any) => {
      const left = aspect.point1Key === "ascendant"
        ? "אופק"
        : `${PLANET_META[aspect.point1Key as keyof typeof PLANET_META]?.symbol || ""} ${PLANET_META[aspect.point1Key as keyof typeof PLANET_META]?.name || aspect.point1Label}`;
      const right = aspect.point2Key === "ascendant"
        ? "אופק"
        : `${PLANET_META[aspect.point2Key as keyof typeof PLANET_META]?.symbol || ""} ${PLANET_META[aspect.point2Key as keyof typeof PLANET_META]?.name || aspect.point2Label}`;

      return {
        label: `${left} • ${ASPECT_META[aspect.aspectKey] || aspect.label} • ${right}`,
        type: ASPECT_META[aspect.aspectKey] || aspect.label,
        orb: Math.round((aspect.orb || 0) * 10) / 10,
        planet1Key: aspect.point1Key,
        planet2Key: aspect.point2Key,
      };
    });

  const elementCounts = planetPlacements.reduce<Record<string, { count: number; elementKey: string }>>((acc, placement) => {
    const signEntry = Object.values(SIGN_META).find((sign) => sign.hebrewName === placement.sign);
    const element = signEntry?.element || "אוויר";
    const elementKey = signEntry?.elementKey || "air";
    if (!acc[element]) acc[element] = { count: 0, elementKey };
    acc[element].count += 1;
    return acc;
  }, {});

  const houseCounts = planetPlacements.reduce<Record<number, number>>((acc, placement) => {
    acc[placement.house] = (acc[placement.house] || 0) + 1;
    return acc;
  }, {});

  return {
    location,
    sunSign: { ...sunMeta },
    risingSign: { ...risingMeta },
    moonSign: moonMeta.hebrewName,
    moonSignKey: moonMeta.key,
    ascendantAngle,
    planetPositions,
    planetPlacements,
    aspects,
    houseCusps,
    dominantElements: Object.entries(elementCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([element, data]) => ({ element, elementKey: data.elementKey, count: data.count })),
    dominantHouses: Object.entries(houseCounts)
      .map(([house, count]) => ({ house: Number(house), count }))
      .sort((a, b) => b.count - a.count),
  };
}
