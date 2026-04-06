import type { Language } from "@/i18n/types";

/** Localized planet names by key */
const PLANET_NAMES: Record<Language, Record<string, string>> = {
  he: { sun: "שמש", moon: "ירח", mercury: "מרקורי", venus: "ונוס", mars: "מאדים", jupiter: "יופיטר", saturn: "שבתאי", uranus: "אורנוס", neptune: "נפטון", pluto: "פלוטו" },
  en: { sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus", mars: "Mars", jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus", neptune: "Neptune", pluto: "Pluto" },
  ru: { sun: "Солнце", moon: "Луна", mercury: "Меркурий", venus: "Венера", mars: "Марс", jupiter: "Юпитер", saturn: "Сатурн", uranus: "Уран", neptune: "Нептун", pluto: "Плутон" },
  ar: { sun: "الشمس", moon: "القمر", mercury: "عطارد", venus: "الزهرة", mars: "المريخ", jupiter: "المشتري", saturn: "زحل", uranus: "أورانوس", neptune: "نبتون", pluto: "بلوتو" },
};

/** Localized zodiac sign names (index 0-11, Aries through Pisces) */
const SIGN_NAMES: Record<Language, string[]> = {
  he: ["טלה", "שור", "תאומים", "סרטן", "אריה", "בתולה", "מאזניים", "עקרב", "קשת", "גדי", "דלי", "דגים"],
  en: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
  ru: ["Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева", "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы"],
  ar: ["الحمل", "الثور", "الجوزاء", "السرطان", "الأسد", "العذراء", "الميزان", "العقرب", "القوس", "الجدي", "الدلو", "الحوت"],
};

/** Chart UI labels */
const CHART_LABELS: Record<Language, {
  birthChart: string;
  astroWheel: string;
  ascendant: string;
  rising: string;
  sun: string;
  moon: string;
  house: string;
  elements: string;
  houses: string;
  notDetected: string;
  dominantElements: string;
  dominantHouses: string;
  noStrongAspects: string;
}> = {
  he: {
    birthChart: "מפת לידה",
    astroWheel: "גלגל אסטרולוגי",
    ascendant: "אופק",
    rising: "עולה",
    sun: "שמש",
    moon: "ירח",
    house: "בית",
    elements: "יסודות",
    houses: "בתים",
    notDetected: "לא זוהו",
    dominantElements: "יסודות דומיננטיים",
    dominantHouses: "בתים דומיננטיים",
    noStrongAspects: "אין היבטים חזקים במיוחד בטווח ההדוק שהודגש לניתוח.",
  },
  en: {
    birthChart: "Birth Chart",
    astroWheel: "Astrological Wheel",
    ascendant: "ASC",
    rising: "Rising",
    sun: "Sun",
    moon: "Moon",
    house: "House",
    elements: "Elements",
    houses: "Houses",
    notDetected: "Not detected",
    dominantElements: "Dominant elements",
    dominantHouses: "Dominant houses",
    noStrongAspects: "No particularly strong aspects in the highlighted tight orb range.",
  },
  ru: {
    birthChart: "Натальная карта",
    astroWheel: "Астрологическое колесо",
    ascendant: "ASC",
    rising: "Восходящий",
    sun: "Солнце",
    moon: "Луна",
    house: "Дом",
    elements: "Стихии",
    houses: "Дома",
    notDetected: "Не определены",
    dominantElements: "Доминирующие стихии",
    dominantHouses: "Доминирующие дома",
    noStrongAspects: "В выделенном узком орбе нет особенно сильных аспектов.",
  },
  ar: {
    birthChart: "خريطة الميلاد",
    astroWheel: "العجلة الفلكية",
    ascendant: "الطالع",
    rising: "الطالع",
    sun: "الشمس",
    moon: "القمر",
    house: "البيت",
    elements: "العناصر",
    houses: "البيوت",
    notDetected: "غير محدد",
    dominantElements: "العناصر المهيمنة",
    dominantHouses: "البيوت المهيمنة",
    noStrongAspects: "لا توجد جوانب قوية بشكل خاص في النطاق الضيق المحدد.",
  },
};

/** Localized element names */
const ELEMENT_NAMES: Record<Language, Record<string, string>> = {
  he: { fire: "אש", earth: "אדמה", air: "אוויר", water: "מים" },
  en: { fire: "Fire", earth: "Earth", air: "Air", water: "Water" },
  ru: { fire: "Огонь", earth: "Земля", air: "Воздух", water: "Вода" },
  ar: { fire: "نار", earth: "أرض", air: "هواء", water: "ماء" },
};

/** Localized aspect names */
const ASPECT_NAMES: Record<Language, Record<string, string>> = {
  he: { conjunction: "צמידות", opposition: "מולות", trine: "טריין", square: "ריבוע", sextile: "שישון", quincunx: "קווינקונקס" },
  en: { conjunction: "Conjunction", opposition: "Opposition", trine: "Trine", square: "Square", sextile: "Sextile", quincunx: "Quincunx" },
  ru: { conjunction: "Соединение", opposition: "Оппозиция", trine: "Тригон", square: "Квадрат", sextile: "Секстиль", quincunx: "Квинконс" },
  ar: { conjunction: "اقتران", opposition: "تقابل", trine: "تثليث", square: "تربيع", sextile: "تسديس", quincunx: "كوينكونكس" },
};

export function getPlanetName(key: string, lang: Language): string {
  return PLANET_NAMES[lang]?.[key] ?? PLANET_NAMES.en[key] ?? key;
}

export function getSignName(index: number, lang: Language): string {
  return SIGN_NAMES[lang]?.[index] ?? SIGN_NAMES.en[index] ?? "";
}

/** Get localized sign name by English key (e.g. "Aries") */
export function getSignNameByKey(key: string, lang: Language): string {
  const SIGN_KEYS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const idx = SIGN_KEYS.indexOf(key);
  if (idx === -1) return key;
  return getSignName(idx, lang);
}

export function getElementName(key: string, lang: Language): string {
  return ELEMENT_NAMES[lang]?.[key] ?? ELEMENT_NAMES.en[key] ?? key;
}

export function getAspectName(key: string, lang: Language): string {
  return ASPECT_NAMES[lang]?.[key] ?? ASPECT_NAMES.en[key] ?? key;
}

export function getSignNames(lang: Language): string[] {
  return SIGN_NAMES[lang] ?? SIGN_NAMES.en;
}

export function getChartLabels(lang: Language) {
  return CHART_LABELS[lang] ?? CHART_LABELS.en;
}

const normalizeAngle = (a: number) => ((a % 360) + 360) % 360;

export function signFromDeg(deg: number, lang: Language): string {
  return getSignName(Math.floor(normalizeAngle(deg) / 30), lang);
}
