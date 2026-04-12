/**
 * Aura Meaning Engine — Composes personal, emotional explanations
 * from 3 reusable semantic layers:
 *   1. Primary aura meaning (personality core)
 *   2. Modifier meaning (how the aura behaves)
 *   3. Secondary influence nuance (subtle enrichment)
 *
 * All content is locale-driven via stable keys + dictionaries.
 * No single language is the source of truth.
 */

import type { AuraFamily, EnergyModifier } from "./auraResultBank";

type Lang = "en" | "he" | "ru" | "ar";

/* ═══════════════════════════════════════════
   1. Primary Aura — Identity Lines
   Short emotional sentence under the title
   ═══════════════════════════════════════════ */

const IDENTITY_LINES: Record<Lang, Record<AuraFamily, string>> = {
  en: {
    solar_gold:       "You radiate warmth, presence, and quiet confidence.",
    moon_silver_blue: "You feel deeply and understand what others cannot see.",
    healing_green:    "Your mind moves fast, connecting what others miss.",
    mystical_purple:  "You see beyond the surface into hidden dimensions.",
    vital_red:        "You act with fire, courage, and unstoppable drive.",
    venus_pink:       "You create beauty and connection wherever you go.",
    astral_turquoise: "You think ahead, breaking patterns before others notice.",
    deep_indigo:      "You carry inner authority built from patience and depth.",
    expansive_orange: "You inspire growth, openness, and bigger dreams.",
    pure_white:       "You transform yourself and everything around you.",
  },
  he: {
    solar_gold:       "את/ה מקרין/ה חום, נוכחות וביטחון שקט.",
    moon_silver_blue: "את/ה מרגיש/ה עמוק ומבין/ה מה שאחרים לא רואים.",
    healing_green:    "המחשבה שלך מהירה ומחברת מה שאחרים מפספסים.",
    mystical_purple:  "את/ה רואה מעבר לפני השטח, אל ממדים נסתרים.",
    vital_red:        "את/ה פועל/ת מתוך אש, אומץ ודחף בלתי ניתן לעצירה.",
    venus_pink:       "את/ה יוצר/ת יופי וחיבור בכל מקום שאת/ה הולך/ת.",
    astral_turquoise: "את/ה חושב/ת קדימה, שובר/ת דפוסים לפני שאחרים מבחינים.",
    deep_indigo:      "את/ה נושא/ת סמכות פנימית שנבנתה מסבלנות ועומק.",
    expansive_orange: "את/ה מעורר/ת צמיחה, פתיחות וחלומות גדולים יותר.",
    pure_white:       "את/ה משנה את עצמך ואת כל מה שסביבך.",
  },
  ru: {
    solar_gold:       "Вы излучаете тепло, присутствие и спокойную уверенность.",
    moon_silver_blue: "Вы чувствуете глубоко и понимаете то, что другие не видят.",
    healing_green:    "Ваш ум быстр и соединяет то, что другие упускают.",
    mystical_purple:  "Вы видите за поверхностью — в скрытые измерения.",
    vital_red:        "Вы действуете с огнём, мужеством и неудержимой силой.",
    venus_pink:       "Вы создаёте красоту и связь повсюду, где бываете.",
    astral_turquoise: "Вы думаете наперёд, ломая шаблоны раньше других.",
    deep_indigo:      "Вы несёте внутренний авторитет, рождённый терпением и глубиной.",
    expansive_orange: "Вы вдохновляете рост, открытость и большие мечты.",
    pure_white:       "Вы трансформируете себя и всё вокруг.",
  },
  ar: {
    solar_gold:       "تشع دفئاً وحضوراً وثقة هادئة.",
    moon_silver_blue: "تشعر بعمق وتفهم ما لا يراه الآخرون.",
    healing_green:    "عقلك سريع يربط ما يفوته الآخرون.",
    mystical_purple:  "ترى ما وراء السطح نحو أبعاد خفية.",
    vital_red:        "تتصرف بنار وشجاعة ودافع لا يُوقف.",
    venus_pink:       "تخلق الجمال والتواصل أينما ذهبت.",
    astral_turquoise: "تفكر مسبقاً وتكسر الأنماط قبل أن يلاحظها الآخرون.",
    deep_indigo:      "تحمل سلطة داخلية بُنيت من الصبر والعمق.",
    expansive_orange: "تُلهم النمو والانفتاح وأحلاماً أكبر.",
    pure_white:       "تُحوّل نفسك وكل ما حولك.",
  },
};

/* ═══════════════════════════════════════════
   2. Modifier — Behavioral Meanings
   How the aura expresses itself emotionally
   ═══════════════════════════════════════════ */

const MODIFIER_MEANINGS: Record<Lang, Record<EnergyModifier, string>> = {
  en: {
    soft:            "Your energy arrives gently — open, receptive, and quietly inviting.",
    radiant:         "Your energy is visible and warm — people feel it the moment you enter.",
    balanced:        "Your energy is steady and centered — a calm presence others trust.",
    deep:            "Your energy runs inward — layered, intense, and profoundly felt.",
    magnetic:        "Your energy pulls others in — noticeable, attractive, and hard to forget.",
    ethereal:        "Your energy is subtle and otherworldly — dreamlike and spiritually attuned.",
    intense:         "Your energy is concentrated and powerful — strong in every direction.",
    grounded:        "Your energy is rooted and stable — calm under any pressure.",
    fluid:           "Your energy moves and adapts — flowing easily through change.",
    transformative:  "Your energy is evolving — shedding old layers with regenerative power.",
  },
  he: {
    soft:            "האנרגיה שלך מגיעה בעדינות — פתוחה, קולטת ומזמינה בשקט.",
    radiant:         "האנרגיה שלך גלויה וחמה — אנשים מרגישים אותה ברגע שאת/ה נכנס/ת.",
    balanced:        "האנרגיה שלך יציבה ומרוכזת — נוכחות שקטה שאחרים סומכים עליה.",
    deep:            "האנרגיה שלך זורמת פנימה — שכבות, עוצמה ותחושה עמוקה.",
    magnetic:        "האנרגיה שלך מושכת אחרים — בולטת, מקסימה וקשה לשכוח.",
    ethereal:        "האנרגיה שלך עדינה ועולמית — חלומית ומכוונת רוחנית.",
    intense:         "האנרגיה שלך מרוכזת ועוצמתית — חזקה בכל כיוון.",
    grounded:        "האנרגיה שלך מושרשת ויציבה — רגועה תחת כל לחץ.",
    fluid:           "האנרגיה שלך נעה ומתאימה — זורמת בקלות דרך שינויים.",
    transformative:  "האנרגיה שלך מתפתחת — פושטת שכבות ישנות בכוח מתחדש.",
  },
  ru: {
    soft:            "Ваша энергия приходит мягко — открытая, восприимчивая, тихо приглашающая.",
    radiant:         "Ваша энергия видна и тепла — люди чувствуют её, как только вы входите.",
    balanced:        "Ваша энергия устойчива и центрирована — спокойное присутствие, которому доверяют.",
    deep:            "Ваша энергия течёт вглубь — многослойная, интенсивная, глубоко ощутимая.",
    magnetic:        "Ваша энергия притягивает — заметная, привлекательная, незабываемая.",
    ethereal:        "Ваша энергия тонка и потусторонна — призрачная и духовно настроенная.",
    intense:         "Ваша энергия сконцентрирована и мощна — сильна в каждом направлении.",
    grounded:        "Ваша энергия укоренена и стабильна — спокойна под любым давлением.",
    fluid:           "Ваша энергия движется и адаптируется — легко протекая сквозь перемены.",
    transformative:  "Ваша энергия эволюционирует — сбрасывая старые слои с обновляющей силой.",
  },
  ar: {
    soft:            "طاقتك تصل بلطف — منفتحة ومتقبّلة وداعية بهدوء.",
    radiant:         "طاقتك ظاهرة ودافئة — يشعر بها الناس لحظة دخولك.",
    balanced:        "طاقتك ثابتة ومتوازنة — حضور هادئ يثق به الآخرون.",
    deep:            "طاقتك تجري نحو الداخل — متعددة الطبقات وعميقة الأثر.",
    magnetic:        "طاقتك تجذب الآخرين — بارزة وساحرة ويصعب نسيانها.",
    ethereal:        "طاقتك رقيقة وأثيرية — حالمة ومتناغمة روحانياً.",
    intense:         "طاقتك مركّزة وقوية — شديدة في كل اتجاه.",
    grounded:        "طاقتك متجذرة ومستقرة — هادئة تحت أي ضغط.",
    fluid:           "طاقتك تتحرك وتتكيف — تتدفق بسهولة عبر التغيير.",
    transformative:  "طاقتك تتطور — تتخلص من طبقات قديمة بقوة تجدّد.",
  },
};

/* ═══════════════════════════════════════════
   3. Secondary Influence — Nuance Fragments
   One subtle sentence enriching the primary
   ═══════════════════════════════════════════ */

const SECONDARY_NUANCES: Record<Lang, Record<AuraFamily, string>> = {
  en: {
    solar_gold:       "A thread of natural warmth and quiet confidence supports you.",
    moon_silver_blue: "An undercurrent of emotional depth and empathy enriches your awareness.",
    healing_green:    "A sharp, curious edge sharpens every instinct you carry.",
    mystical_purple:  "A whisper of spiritual sensitivity colors your perception.",
    vital_red:        "A vein of raw courage fuels your most decisive moments.",
    venus_pink:       "A gift for harmony and relational warmth softens your presence.",
    astral_turquoise: "A flash of originality keeps your perspective fresh and ahead.",
    deep_indigo:      "A foundation of discipline and patience steadies your path.",
    expansive_orange: "A generous spirit and natural optimism lift your vision.",
    pure_white:       "The power of reinvention keeps you from ever staying stuck.",
  },
  he: {
    solar_gold:       "חוט של חום טבעי וביטחון שקט תומך בך.",
    moon_silver_blue: "זרם תחתי של עומק רגשי ואמפתיה מעשיר את המודעות שלך.",
    healing_green:    "חדות סקרנית מחדדת כל אינסטינקט שאת/ה נושא/ת.",
    mystical_purple:  "לחישה של רגישות רוחנית צובעת את התפיסה שלך.",
    vital_red:        "גיד של אומץ גולמי מדלק את הרגעים המכריעים שלך.",
    venus_pink:       "כישרון להרמוניה וחום יחסי מרכך את הנוכחות שלך.",
    astral_turquoise: "הבזק של מקוריות שומר את הפרספקטיבה שלך רעננה.",
    deep_indigo:      "בסיס של משמעת וסבלנות מייצב את הדרך שלך.",
    expansive_orange: "רוח נדיבה ואופטימיות טבעית מרוממות את החזון שלך.",
    pure_white:       "כוח ההתחדשות מונע ממך להיתקע.",
  },
  ru: {
    solar_gold:       "Нить природного тепла и тихой уверенности поддерживает вас.",
    moon_silver_blue: "Подводное течение эмоциональной глубины и эмпатии обогащает ваше восприятие.",
    healing_green:    "Острый, любопытный край оттачивает каждый ваш инстинкт.",
    mystical_purple:  "Шёпот духовной чувствительности окрашивает ваше восприятие.",
    vital_red:        "Жила сырого мужества питает ваши самые решительные моменты.",
    venus_pink:       "Дар гармонии и тепла отношений смягчает ваше присутствие.",
    astral_turquoise: "Вспышка оригинальности сохраняет вашу перспективу свежей.",
    deep_indigo:      "Фундамент дисциплины и терпения стабилизирует ваш путь.",
    expansive_orange: "Щедрый дух и природный оптимизм поднимают ваше видение.",
    pure_white:       "Сила обновления не даёт вам застаиваться.",
  },
  ar: {
    solar_gold:       "خيط من الدفء الطبيعي والثقة الهادئة يدعمك.",
    moon_silver_blue: "تيار خفي من العمق العاطفي والتعاطف يُثري وعيك.",
    healing_green:    "حدّة فضولية تشحذ كل غريزة تحملها.",
    mystical_purple:  "همسة من الحساسية الروحية تلوّن إدراكك.",
    vital_red:        "عرق من الشجاعة الخام يغذي لحظاتك الأكثر حسماً.",
    venus_pink:       "موهبة الانسجام والدفء العلائقي تليّن حضورك.",
    astral_turquoise: "ومضة أصالة تُبقي منظورك جديداً ومتقدماً.",
    deep_indigo:      "أساس من الانضباط والصبر يُثبّت مسارك.",
    expansive_orange: "روح كريمة وتفاؤل طبيعي يرفعان رؤيتك.",
    pure_white:       "قوة التجدد تمنعك من البقاء عالقاً.",
  },
};

/* ═══════════════════════════════════════════
   4. Strengths Bank — 3 traits per aura family
   ═══════════════════════════════════════════ */

const STRENGTHS: Record<Lang, Record<AuraFamily, [string, string, string]>> = {
  en: {
    solar_gold:       ["Natural Presence", "Warm Confidence", "Inner Radiance"],
    moon_silver_blue: ["Deep Intuition", "Emotional Awareness", "Gentle Sensitivity"],
    healing_green:    ["Quick Perception", "Clear Communication", "Mental Agility"],
    mystical_purple:  ["Rich Imagination", "Spiritual Depth", "Creative Vision"],
    vital_red:        ["Decisive Action", "Inner Courage", "Passionate Drive"],
    venus_pink:       ["Relational Warmth", "Aesthetic Sense", "Harmonious Energy"],
    astral_turquoise: ["Original Thinking", "Future Awareness", "Bold Innovation"],
    deep_indigo:      ["Patient Wisdom", "Structural Strength", "Quiet Authority"],
    expansive_orange: ["Generous Spirit", "Philosophical Mind", "Expansive Vision"],
    pure_white:       ["Transformative Power", "Deep Insight", "Regenerative Will"],
  },
  he: {
    solar_gold:       ["נוכחות טבעית", "ביטחון חם", "זוהר פנימי"],
    moon_silver_blue: ["אינטואיציה עמוקה", "מודעות רגשית", "רגישות עדינה"],
    healing_green:    ["תפיסה מהירה", "תקשורת ברורה", "זריזות מחשבתית"],
    mystical_purple:  ["דמיון עשיר", "עומק רוחני", "חזון יצירתי"],
    vital_red:        ["פעולה נחרצת", "אומץ פנימי", "דחף נלהב"],
    venus_pink:       ["חום יחסי", "חוש אסתטי", "אנרגיה הרמונית"],
    astral_turquoise: ["חשיבה מקורית", "מודעות עתידית", "חדשנות נועזת"],
    deep_indigo:      ["חוכמה סבלנית", "עוצמה מבנית", "סמכות שקטה"],
    expansive_orange: ["רוח נדיבה", "מחשבה פילוסופית", "חזון מתרחב"],
    pure_white:       ["כוח טרנספורמטיבי", "תובנה עמוקה", "רצון מתחדש"],
  },
  ru: {
    solar_gold:       ["Природное присутствие", "Тёплая уверенность", "Внутреннее сияние"],
    moon_silver_blue: ["Глубокая интуиция", "Эмоциональная чуткость", "Нежная чувствительность"],
    healing_green:    ["Быстрое восприятие", "Ясная коммуникация", "Ментальная гибкость"],
    mystical_purple:  ["Богатое воображение", "Духовная глубина", "Творческое видение"],
    vital_red:        ["Решительное действие", "Внутреннее мужество", "Страстный порыв"],
    venus_pink:       ["Теплота отношений", "Чувство эстетики", "Гармоничная энергия"],
    astral_turquoise: ["Оригинальное мышление", "Чувство будущего", "Смелые инновации"],
    deep_indigo:      ["Терпеливая мудрость", "Структурная сила", "Тихий авторитет"],
    expansive_orange: ["Щедрый дух", "Философский ум", "Расширенное видение"],
    pure_white:       ["Трансформативная сила", "Глубокое проникновение", "Обновляющая воля"],
  },
  ar: {
    solar_gold:       ["حضور طبيعي", "ثقة دافئة", "إشعاع داخلي"],
    moon_silver_blue: ["حدس عميق", "وعي عاطفي", "حساسية لطيفة"],
    healing_green:    ["إدراك سريع", "تواصل واضح", "مرونة ذهنية"],
    mystical_purple:  ["خيال ثري", "عمق روحاني", "رؤية إبداعية"],
    vital_red:        ["فعل حاسم", "شجاعة داخلية", "دافع متّقد"],
    venus_pink:       ["دفء علائقي", "حس جمالي", "طاقة متناغمة"],
    astral_turquoise: ["تفكير أصيل", "وعي مستقبلي", "ابتكار جريء"],
    deep_indigo:      ["حكمة صبورة", "قوة هيكلية", "سلطة هادئة"],
    expansive_orange: ["روح كريمة", "عقل فلسفي", "رؤية متسعة"],
    pure_white:       ["قوة تحويلية", "بصيرة عميقة", "إرادة متجددة"],
  },
};

/* ═══════════════════════════════════════════
   5. Section labels for the meaning UI
   ═══════════════════════════════════════════ */

const MEANING_LABELS: Record<Lang, { identityHeader: string; coreHeader: string; strengthsHeader: string }> = {
  en: { identityHeader: "Your Energetic Identity", coreHeader: "What This Means for You", strengthsHeader: "Your Core Strengths" },
  he: { identityHeader: "הזהות האנרגטית שלך", coreHeader: "מה זה אומר עליך", strengthsHeader: "החוזקות המרכזיות שלך" },
  ru: { identityHeader: "Ваша энергетическая идентичность", coreHeader: "Что это значит для вас", strengthsHeader: "Ваши основные сильные стороны" },
  ar: { identityHeader: "هويتك الطاقية", coreHeader: "ماذا يعني هذا لك", strengthsHeader: "نقاط قوتك الأساسية" },
};

/* ═══════════════════════════════════════════
   Composer — public API
   ═══════════════════════════════════════════ */

export interface ComposedMeaning {
  /** Short identity sentence under title */
  identityLine: string;
  /** 2-3 sentence personal explanation composed from layers */
  coreParagraph: string;
  /** 3 key strengths/traits */
  strengths: [string, string, string];
  /** Section labels */
  labels: { identityHeader: string; coreHeader: string; strengthsHeader: string };
}

/**
 * Compose the full visible meaning from the 3-layer system.
 * Deterministic — same keys + language always produce the same output.
 */
export function composeAuraMeaning(
  lang: string,
  primaryAura: AuraFamily,
  modifier: EnergyModifier,
  secondaryAuras: AuraFamily[],
): ComposedMeaning {
  const l: Lang = (lang as Lang) in IDENTITY_LINES ? (lang as Lang) : "en";

  const identityLine = IDENTITY_LINES[l][primaryAura] ?? IDENTITY_LINES.en[primaryAura];

  // Core paragraph: modifier meaning + secondary nuance
  const modMeaning = MODIFIER_MEANINGS[l][modifier] ?? MODIFIER_MEANINGS.en[modifier];
  const topSecondary = secondaryAuras[0];
  const nuance = topSecondary
    ? (SECONDARY_NUANCES[l][topSecondary] ?? SECONDARY_NUANCES.en[topSecondary])
    : "";

  const coreParagraph = nuance ? `${modMeaning} ${nuance}` : modMeaning;

  const strengths = STRENGTHS[l][primaryAura] ?? STRENGTHS.en[primaryAura];

  const labels = MEANING_LABELS[l] ?? MEANING_LABELS.en;

  return { identityLine, coreParagraph, strengths, labels };
}
