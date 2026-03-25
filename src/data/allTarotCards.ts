import type { Language } from "@/i18n/types";

export type MinorArcanaSuit = "swords" | "cups" | "wands" | "pentacles";
export type TarotSuit = "major" | MinorArcanaSuit;
export type TarotSuitFilter = "all" | TarotSuit;

type LocalizedText = Record<Language, string>;

type TarotAssetInventory = Record<TarotSuit, TarotGalleryCardRecord[]>;

interface MajorArcanaDefinition {
  number: number;
  names: LocalizedText;
}

interface ParsedAssetIdentity {
  slug: string;
  suit: TarotSuit;
  names: LocalizedText;
  shortMeaning: LocalizedText;
  sortOrder: number;
}

export interface UnifiedTarotCard {
  id: string;
  slug: string;
  suit: TarotSuit;
  image: string;
  assetPath: string;
  name: LocalizedText;
  shortMeaning: LocalizedText;
  ctaLabel: LocalizedText;
}

interface TarotGalleryCardRecord extends UnifiedTarotCard {
  sortOrder: number;
}

export const tarotGalleryTranslations = {
  sectionTitle: {
    he: "קלפי טארוט",
    en: "Tarot Cards",
    ru: "Карты Таро",
    ar: "بطاقات التاروت",
  },
  introText: {
    he: "גלו את כל קלפי הטארוט לפי ארקנה גדולה וארבע הסדרות.",
    en: "Explore all tarot cards by Major Arcana and the four suits.",
    ru: "Изучите все карты Таро по Старшим Арканам и четырем мастям.",
    ar: "اكتشف جميع بطاقات التاروت حسب الأركانا الكبرى والسلاسل الأربع.",
  },
  ctaLabel: {
    he: "לצפייה בקלף",
    en: "View Card",
    ru: "Открыть карту",
    ar: "عرض البطاقة",
  },
  backLabel: {
    he: "חזרה",
    en: "Back",
    ru: "Назад",
    ar: "رجوع",
  },
  filterAriaLabel: {
    he: "סינון קלפים",
    en: "Filter cards",
    ru: "Фильтр карт",
    ar: "تصفية البطاقات",
  },
  countLabel: {
    he: "קלפים",
    en: "cards",
    ru: "карт",
    ar: "بطاقة",
  },
  modalComingSoon: {
    he: "דף הקלף המלא יתווסף בקרוב ✦",
    en: "Full card page coming soon ✦",
    ru: "Полная страница карты скоро появится ✦",
    ar: "صفحة البطاقة الكاملة ستضاف قريباً ✦",
  },
  filterLabel: {
    all: { he: "כל הקלפים", en: "All Cards", ru: "Все карты", ar: "جميع البطاقات" },
    major: { he: "ארקנה עליונה", en: "Major Arcana", ru: "Старшие Арканы", ar: "الأركانا الكبرى" },
    swords: { he: "חרבות", en: "Swords", ru: "Мечи", ar: "السيوف" },
    cups: { he: "גביעים", en: "Cups", ru: "Кубки", ar: "الكؤوس" },
    wands: { he: "מטות", en: "Wands", ru: "Жезлы", ar: "العصي" },
    pentacles: { he: "מטבעות", en: "Pentacles", ru: "Пентакли", ar: "البنتاكل" },
  },
  shortMeaningBySuit: {
    major: {
      he: "ארקנה עליונה — מסר רוחני עמוק",
      en: "Major Arcana — a profound spiritual message",
      ru: "Старший Аркан — глубокое духовное послание",
      ar: "الأركانا الكبرى — رسالة روحية عميقة",
    },
    swords: {
      he: "מחשבה, אמת ואתגר פנימי",
      en: "Thought, truth, and inner challenge",
      ru: "Мысль, истина и внутренний вызов",
      ar: "فكر، حقيقة، وتحدٍ داخلي",
    },
    cups: {
      he: "רגש, אינטואיציה וקשרים",
      en: "Emotion, intuition, and relationships",
      ru: "Эмоции, интуиция и отношения",
      ar: "عاطفة، حدس، وعلاقات",
    },
    wands: {
      he: "אש פנימית, רצון ותנועה",
      en: "Inner fire, will, and momentum",
      ru: "Внутренний огонь, воля и движение",
      ar: "نار داخلية، إرادة، وحركة",
    },
    pentacles: {
      he: "חומר, יציבות ושפע מעשי",
      en: "Material life, stability, and practical abundance",
      ru: "Материальный мир, стабильность и практическое изобилие",
      ar: "الحياة المادية، الاستقرار، والوفرة العملية",
    },
  },
} as const;

const tarotAssetModules = import.meta.glob("/src/assets/tarot/**/*.{png,jpg,jpeg,webp,avif}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const NON_CARD_ASSET_SLUGS = new Set(["card-back", "card-frame"]);
const FILTER_ORDER: TarotSuitFilter[] = ["all", "major", "swords", "cups", "wands", "pentacles"];
const SUIT_ORDER: Record<TarotSuit, number> = { major: 0, swords: 1, cups: 2, wands: 3, pentacles: 4 };
const MINOR_RANKS = ["ace", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "knight", "prince", "queen", "king"] as const;
type MinorRank = typeof MINOR_RANKS[number];
const RANK_ORDER = new Map<MinorRank, number>(MINOR_RANKS.map((rank, index) => [rank, index + 1]));
const MAJOR_ARCANA: Record<string, MajorArcanaDefinition> = {
  fool: { number: 0, names: { he: "השוטה", en: "The Fool", ru: "Шут", ar: "الأحمق" } },
  magician: { number: 1, names: { he: "הקוסם", en: "The Magician", ru: "Маг", ar: "الساحر" } },
  "high-priestess": { number: 2, names: { he: "הכוהנת הגדולה", en: "The High Priestess", ru: "Верховная Жрица", ar: "الكاهنة العظمى" } },
  empress: { number: 3, names: { he: "הקיסרית", en: "The Empress", ru: "Императрица", ar: "الإمبراطورة" } },
  emperor: { number: 4, names: { he: "הקיסר", en: "The Emperor", ru: "Император", ar: "الإمبراطور" } },
  hierophant: { number: 5, names: { he: "ההירופנט", en: "The Hierophant", ru: "Иерофант", ar: "الكاهن الأعلى" } },
  lovers: { number: 6, names: { he: "האוהבים", en: "The Lovers", ru: "Влюблённые", ar: "العشّاق" } },
  chariot: { number: 7, names: { he: "המרכבה", en: "The Chariot", ru: "Колесница", ar: "العربة" } },
  strength: { number: 8, names: { he: "הכוח", en: "Strength", ru: "Сила", ar: "القوة" } },
  hermit: { number: 9, names: { he: "הנזיר", en: "The Hermit", ru: "Отшельник", ar: "الناسك" } },
  "wheel-of-fortune": { number: 10, names: { he: "גלגל המזל", en: "The Wheel of Fortune", ru: "Колесо Фортуны", ar: "عجلة الحظ" } },
  justice: { number: 11, names: { he: "הצדק", en: "Justice", ru: "Справедливость", ar: "العدالة" } },
  "hanged-man": { number: 12, names: { he: "התלוי", en: "The Hanged Man", ru: "Повешенный", ar: "المعلّق" } },
  death: { number: 13, names: { he: "המוות", en: "Death", ru: "Смерть", ar: "الموت" } },
  temperance: { number: 14, names: { he: "המתינות", en: "Temperance", ru: "Умеренность", ar: "الاعتدال" } },
  devil: { number: 15, names: { he: "השטן", en: "The Devil", ru: "Дьявол", ar: "الشيطان" } },
  tower: { number: 16, names: { he: "המגדל", en: "The Tower", ru: "Башня", ar: "البرج" } },
  star: { number: 17, names: { he: "הכוכב", en: "The Star", ru: "Звезда", ar: "النجمة" } },
  moon: { number: 18, names: { he: "הירח", en: "The Moon", ru: "Луна", ar: "القمر" } },
  sun: { number: 19, names: { he: "השמש", en: "The Sun", ru: "Солнце", ar: "الشمس" } },
  judgement: { number: 20, names: { he: "השיפוט", en: "Judgement", ru: "Суд", ar: "الحكم" } },
  world: { number: 21, names: { he: "העולם", en: "The World", ru: "Мир", ar: "العالم" } },
};
const MINOR_RANK_LABELS: Record<MinorRank, LocalizedText> = {
  ace: { he: "אס", en: "Ace", ru: "Туз", ar: "آس" },
  two: { he: "שני", en: "Two", ru: "Двойка", ar: "اثنان" },
  three: { he: "שלושה", en: "Three", ru: "Тройка", ar: "ثلاثة" },
  four: { he: "ארבעה", en: "Four", ru: "Четверка", ar: "أربعة" },
  five: { he: "חמישה", en: "Five", ru: "Пятерка", ar: "خمسة" },
  six: { he: "שישה", en: "Six", ru: "Шестерка", ar: "ستة" },
  seven: { he: "שבעה", en: "Seven", ru: "Семерка", ar: "سبعة" },
  eight: { he: "שמונה", en: "Eight", ru: "Восьмерка", ar: "ثمانية" },
  nine: { he: "תשעה", en: "Nine", ru: "Девятка", ar: "تسعة" },
  ten: { he: "עשרה", en: "Ten", ru: "Десятка", ar: "عشرة" },
  knight: { he: "אביר", en: "Knight", ru: "Рыцарь", ar: "فارس" },
  prince: { he: "נסיך", en: "Prince", ru: "Принц", ar: "أمير" },
  queen: { he: "מלכת", en: "Queen", ru: "Королева", ar: "ملكة" },
  king: { he: "מלך", en: "King", ru: "Король", ar: "ملك" },
};
const MINOR_SUIT_LABELS: Record<MinorArcanaSuit, LocalizedText> = {
  swords: { he: "חרבות", en: "Swords", ru: "Мечей", ar: "السيوف" },
  cups: { he: "גביעים", en: "Cups", ru: "Кубков", ar: "الكؤوس" },
  wands: { he: "מטות", en: "Wands", ru: "Жезлов", ar: "العصي" },
  pentacles: { he: "מטבעות", en: "Pentacles", ru: "Пентаклей", ar: "البنتاكل" },
};
const SUIT_FOLDER_ALIASES: Record<string, TarotSuit> = {
  major: "major",
  "major-arcana": "major",
  majors: "major",
  swords: "swords",
  cups: "cups",
  wands: "wands",
  pentacles: "pentacles",
};

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/\.[^.]+$/, "").replace(/[_\s]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function getPathContext(filePath: string) {
  const segments = filePath.split("/").map(normalizeToken).filter(Boolean);
  const basename = segments.at(-1) ?? "";
  const folders = segments.slice(0, -1);
  const folderSuit = [...folders].reverse().find((segment) => segment in SUIT_FOLDER_ALIASES);

  return {
    basename,
    folderSuit: folderSuit ? SUIT_FOLDER_ALIASES[folderSuit] : null,
  };
}

function canonicalizeMajorSlug(slug: string): string {
  if (slug.startsWith("the-")) {
    const withoutArticle = slug.slice(4);
    if (MAJOR_ARCANA[withoutArticle]) return withoutArticle;
  }
  return slug;
}

function parseMinorSlug(slug: string): { rank: MinorRank; suit: MinorArcanaSuit } | null {
  const match = slug.match(/^(ace|two|three|four|five|six|seven|eight|nine|ten|knight|prince|queen|king)-of-(swords|cups|wands|pentacles)$/);
  if (!match) return null;
  return { rank: match[1] as MinorRank, suit: match[2] as MinorArcanaSuit };
}

function resolveMinorSlug(basename: string, folderSuit: TarotSuit | null): { rank: MinorRank; suit: MinorArcanaSuit; slug: string } | null {
  const direct = parseMinorSlug(basename);
  if (direct) {
    if (folderSuit && folderSuit !== direct.suit) return null;
    return { ...direct, slug: basename };
  }

  if (!folderSuit || folderSuit === "major") return null;
  if (!MINOR_RANKS.includes(basename as MinorRank)) return null;

  return {
    rank: basename as MinorRank,
    suit: folderSuit,
    slug: `${basename}-of-${folderSuit}`,
  };
}

function createMinorNames(rank: MinorRank, suit: MinorArcanaSuit): LocalizedText {
  return {
    he: `${MINOR_RANK_LABELS[rank].he} ${MINOR_SUIT_LABELS[suit].he}`,
    en: `${MINOR_RANK_LABELS[rank].en} of ${MINOR_SUIT_LABELS[suit].en}`,
    ru: `${MINOR_RANK_LABELS[rank].ru} ${MINOR_SUIT_LABELS[suit].ru}`,
    ar: `${MINOR_RANK_LABELS[rank].ar} ${MINOR_SUIT_LABELS[suit].ar}`,
  };
}

function parseAssetIdentity(filePath: string): ParsedAssetIdentity | null {
  const { basename, folderSuit } = getPathContext(filePath);
  if (!basename || NON_CARD_ASSET_SLUGS.has(basename)) return null;

  const majorSlug = canonicalizeMajorSlug(basename);
  const major = MAJOR_ARCANA[majorSlug];
  if (major && (!folderSuit || folderSuit === "major")) {
    return {
      slug: majorSlug,
      suit: "major",
      names: major.names,
      shortMeaning: tarotGalleryTranslations.shortMeaningBySuit.major,
      sortOrder: major.number,
    };
  }

  const minor = resolveMinorSlug(basename, folderSuit);
  if (!minor) return null;

  return {
    slug: minor.slug,
    suit: minor.suit,
    names: createMinorNames(minor.rank, minor.suit),
    shortMeaning: tarotGalleryTranslations.shortMeaningBySuit[minor.suit],
    sortOrder: RANK_ORDER.get(minor.rank) ?? 999,
  };
}

function createCardRecord(filePath: string, image: string, identity: ParsedAssetIdentity): TarotGalleryCardRecord {
  return {
    id: identity.slug,
    slug: identity.slug,
    suit: identity.suit,
    image,
    assetPath: filePath,
    name: identity.names,
    shortMeaning: identity.shortMeaning,
    ctaLabel: tarotGalleryTranslations.ctaLabel,
    sortOrder: identity.sortOrder,
  };
}

function createEmptyInventory(): TarotAssetInventory {
  return {
    major: [],
    swords: [],
    cups: [],
    wands: [],
    pentacles: [],
  };
}

function sortCards(a: TarotGalleryCardRecord, b: TarotGalleryCardRecord): number {
  const suitDifference = SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
  if (suitDifference !== 0) return suitDifference;

  const orderDifference = a.sortOrder - b.sortOrder;
  if (orderDifference !== 0) return orderDifference;

  return a.slug.localeCompare(b.slug);
}

function buildTarotAssetInventory(): TarotAssetInventory {
  const inventory = createEmptyInventory();

  Object.entries(tarotAssetModules)
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([filePath, image]) => {
      const identity = parseAssetIdentity(filePath);
      if (!identity) return;
      inventory[identity.suit].push(createCardRecord(filePath, image, identity));
    });

  (Object.keys(inventory) as TarotSuit[]).forEach((suit) => {
    inventory[suit].sort(sortCards);
  });

  return inventory;
}

export const tarotAssetInventory = buildTarotAssetInventory();
export const allTarotCards: UnifiedTarotCard[] = FILTER_ORDER
  .filter((filter): filter is TarotSuit => filter !== "all")
  .flatMap((suit) => tarotAssetInventory[suit]);

export function filterBySuit(suit: TarotSuitFilter): UnifiedTarotCard[] {
  if (suit === "all") return allTarotCards;
  return tarotAssetInventory[suit];
}

export function getAvailableFilters(): TarotSuitFilter[] {
  return FILTER_ORDER.filter((filter) => filterBySuit(filter).length > 0);
}
