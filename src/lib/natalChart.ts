// @ts-ignore - package main field missing .js extension
import { Horoscope, Origin } from "circular-natal-horoscope-js/dist/index.js";

const SIGN_META = {
  Aries: { hebrewName: "טלה", symbol: "♈", element: "אש" },
  Taurus: { hebrewName: "שור", symbol: "♉", element: "אדמה" },
  Gemini: { hebrewName: "תאומים", symbol: "♊", element: "אוויר" },
  Cancer: { hebrewName: "סרטן", symbol: "♋", element: "מים" },
  Leo: { hebrewName: "אריה", symbol: "♌", element: "אש" },
  Virgo: { hebrewName: "בתולה", symbol: "♍", element: "אדמה" },
  Libra: { hebrewName: "מאזניים", symbol: "♎", element: "אוויר" },
  Scorpio: { hebrewName: "עקרב", symbol: "♏", element: "מים" },
  Sagittarius: { hebrewName: "קשת", symbol: "♐", element: "אש" },
  Capricorn: { hebrewName: "גדי", symbol: "♑", element: "אדמה" },
  Aquarius: { hebrewName: "דלי", symbol: "♒", element: "אוויר" },
  Pisces: { hebrewName: "דגים", symbol: "♓", element: "מים" },
} as const;

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

const SUPPORTED_PLANETS = Object.keys(PLANET_META) as Array<keyof typeof PLANET_META>;

type SignLabel = keyof typeof SIGN_META;

export interface GeocodedBirthPlace {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  timezone: string;
}

export interface PlanetPlacement {
  key: keyof typeof PLANET_META;
  name: string;
  symbol: string;
  sign: string;
  degree: number;
  house: number;
  absoluteDegree: number;
}

export interface NatalAspect {
  label: string;
  type: string;
  orb: number;
}

export interface NatalHouseCusp {
  house: number;
  sign: string;
  degree: number;
  absoluteDegree: number;
}

export interface NatalChartResult {
  location: GeocodedBirthPlace;
  sunSign: { hebrewName: string; symbol: string; element: string };
  risingSign: { hebrewName: string; symbol: string; element: string };
  moonSign: string;
  ascendantAngle: number;
  planetPositions: Record<string, number>;
  planetPlacements: PlanetPlacement[];
  aspects: NatalAspect[];
  houseCusps: NatalHouseCusp[];
  dominantElements: Array<{ element: string; count: number }>;
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
  return SIGN_META[(label || "Aries") as SignLabel] || SIGN_META.Aries;
}

function normalizeDegree(degree: number) {
  return ((degree % 360) + 360) % 360;
}

function degreeInSign(degree: number) {
  return Math.round((normalizeDegree(degree) % 30) * 10) / 10;
}

export async function geocodeBirthPlace(place: string): Promise<GeocodedBirthPlace> {
  const query = place.trim();
  if (!query) throw new Error("יש להזין מקום לידה");

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=he&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("לא הצלחנו לאתר את מקום הלידה כרגע");

  const data = await response.json();
  const result = data?.results?.[0];
  if (!result) {
    throw new Error("לא הצלחנו לזהות את מקום הלידה. נסו לכתוב עיר ומדינה.");
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

  const origin = new Origin({
    year,
    month: month - 1,
    date: day,
    hour,
    minute,
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
      };
    });

  const elementCounts = planetPlacements.reduce<Record<string, number>>((acc, placement) => {
    const signEntry = Object.values(SIGN_META).find((sign) => sign.hebrewName === placement.sign);
    const element = signEntry?.element || "אוויר";
    acc[element] = (acc[element] || 0) + 1;
    return acc;
  }, {});

  const houseCounts = planetPlacements.reduce<Record<number, number>>((acc, placement) => {
    acc[placement.house] = (acc[placement.house] || 0) + 1;
    return acc;
  }, {});

  return {
    location,
    sunSign: sunMeta,
    risingSign: risingMeta,
    moonSign: moonMeta.hebrewName,
    ascendantAngle,
    planetPositions,
    planetPlacements,
    aspects,
    houseCusps,
    dominantElements: Object.entries(elementCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([element, count]) => ({ element, count })),
    dominantHouses: Object.entries(houseCounts)
      .map(([house, count]) => ({ house: Number(house), count }))
      .sort((a, b) => b.count - a.count),
  };
}
