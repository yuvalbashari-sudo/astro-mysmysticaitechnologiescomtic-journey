/**
 * Aura Locale — Centralized i18n dictionaries for the aura identity system.
 *
 * All display strings for aura families, modifiers, labels, and title patterns
 * live here. Components import helpers; the core engine stays language-free.
 */

import type { AuraFamily, EnergyModifier } from "./auraResultBank";

/* ═══════════════════════════════════════════
   Supported languages (mirrors i18n/types)
   ═══════════════════════════════════════════ */
type Lang = "en" | "he" | "ru" | "ar";

/* ═══════════════════════════════════════════
   Aura family display names
   ═══════════════════════════════════════════ */
const AURA_NAMES: Record<Lang, Record<AuraFamily, string>> = {
  en: {
    solar_gold: "Solar Gold",
    moon_silver_blue: "Lunar Silver",
    healing_green: "Healing Green",
    mystical_purple: "Mystical Purple",
    vital_red: "Vital Red",
    venus_pink: "Venus Pink",
    astral_turquoise: "Astral Turquoise",
    deep_indigo: "Deep Indigo",
    expansive_orange: "Expansive Orange",
    pure_white: "Pure White",
  },
  he: {
    solar_gold: "זהב שמשי",
    moon_silver_blue: "כסף ירחי",
    healing_green: "ירוק מרפא",
    mystical_purple: "סגול מיסטי",
    vital_red: "אדום חיוני",
    venus_pink: "ורוד נוגהי",
    astral_turquoise: "טורקיז אסטרלי",
    deep_indigo: "אינדיגו עמוק",
    expansive_orange: "כתום מתרחב",
    pure_white: "לבן טהור",
  },
  ru: {
    solar_gold: "Солнечное золото",
    moon_silver_blue: "Лунное серебро",
    healing_green: "Целительный зелёный",
    mystical_purple: "Мистический пурпур",
    vital_red: "Жизненный красный",
    venus_pink: "Венерианский розовый",
    astral_turquoise: "Астральная бирюза",
    deep_indigo: "Глубокий индиго",
    expansive_orange: "Расширяющийся оранжевый",
    pure_white: "Чистый белый",
  },
  ar: {
    solar_gold: "ذهب شمسي",
    moon_silver_blue: "فضّي قمري",
    healing_green: "أخضر شافٍ",
    mystical_purple: "بنفسجي صوفي",
    vital_red: "أحمر حيوي",
    venus_pink: "وردي فينوسي",
    astral_turquoise: "فيروزي نجمي",
    deep_indigo: "نيلي عميق",
    expansive_orange: "برتقالي متسع",
    pure_white: "أبيض نقي",
  },
};

/* ═══════════════════════════════════════════
   Modifier display names
   ═══════════════════════════════════════════ */
const MODIFIER_NAMES: Record<Lang, Record<EnergyModifier, string>> = {
  en: {
    radiant: "Radiant",
    soft: "Soft",
    magnetic: "Magnetic",
    deep: "Deep",
    balanced: "Balanced",
    transformative: "Transformative",
    grounded: "Grounded",
    fluid: "Fluid",
    intense: "Intense",
    ethereal: "Ethereal",
  },
  he: {
    radiant: "זורח",
    soft: "רך",
    magnetic: "מגנטי",
    deep: "עמוק",
    balanced: "מאוזן",
    transformative: "טרנספורמטיבי",
    grounded: "מעוגן",
    fluid: "זורם",
    intense: "אינטנסיבי",
    ethereal: "אתרי",
  },
  ru: {
    radiant: "Сияющий",
    soft: "Мягкий",
    magnetic: "Магнетический",
    deep: "Глубокий",
    balanced: "Сбалансированный",
    transformative: "Трансформативный",
    grounded: "Заземлённый",
    fluid: "Текучий",
    intense: "Интенсивный",
    ethereal: "Эфирный",
  },
  ar: {
    radiant: "مشع",
    soft: "ناعم",
    magnetic: "مغناطيسي",
    deep: "عميق",
    balanced: "متوازن",
    transformative: "تحويلي",
    grounded: "راسخ",
    fluid: "سائل",
    intense: "مكثّف",
    ethereal: "أثيري",
  },
};

/* ═══════════════════════════════════════════
   Aura subtitles (emotional tagline)
   ═══════════════════════════════════════════ */
const AURA_SUBTITLES: Record<Lang, Record<AuraFamily, string>> = {
  en: {
    solar_gold: "Your essence burns with sovereign light",
    moon_silver_blue: "Your soul speaks in tides and whispers",
    healing_green: "Your mind weaves patterns others overlook",
    mystical_purple: "You dwell where dreams meet vision",
    vital_red: "Your will is forged in fire",
    venus_pink: "Beauty and harmony flow through your being",
    astral_turquoise: "You ride the edge of tomorrow",
    deep_indigo: "Your strength is carved from ancient stone",
    expansive_orange: "Your spirit seeks the horizon",
    pure_white: "You transform everything you touch",
  },
  he: {
    solar_gold: "מהותך בוערת באור ריבוני",
    moon_silver_blue: "נשמתך מדברת בגאויות ובלחישות",
    healing_green: "המוח שלך אורג דפוסים שאחרים מפספסים",
    mystical_purple: "את/ה שוכן/ת היכן שחלומות פוגשים חזון",
    vital_red: "הרצון שלך מחושל באש",
    venus_pink: "יופי והרמוניה זורמים דרך ישותך",
    astral_turquoise: "את/ה רוכב/ת על קצה המחר",
    deep_indigo: "העוצמה שלך חצובה מסלע קדום",
    expansive_orange: "רוחך מחפשת את האופק",
    pure_white: "את/ה משנה כל מה שנוגע בך",
  },
  ru: {
    solar_gold: "Ваша сущность горит суверенным светом",
    moon_silver_blue: "Ваша душа говорит приливами и шёпотом",
    healing_green: "Ваш разум плетёт узоры, которые другие не замечают",
    mystical_purple: "Вы живёте там, где сны встречают видение",
    vital_red: "Ваша воля закалена в огне",
    venus_pink: "Красота и гармония текут через ваше существо",
    astral_turquoise: "Вы на краю завтрашнего дня",
    deep_indigo: "Ваша сила высечена из древнего камня",
    expansive_orange: "Ваш дух ищет горизонт",
    pure_white: "Вы преображаете всё, к чему прикасаетесь",
  },
  ar: {
    solar_gold: "جوهرك يتوهج بنور سيادي",
    moon_silver_blue: "روحك تتحدث بالمد والهمس",
    healing_green: "عقلك ينسج أنماطاً يغفلها الآخرون",
    mystical_purple: "تسكن حيث تلتقي الأحلام بالرؤية",
    vital_red: "إرادتك مصقولة بالنار",
    venus_pink: "الجمال والانسجام يتدفقان عبر كيانك",
    astral_turquoise: "تركب حافة الغد",
    deep_indigo: "قوتك منحوتة من صخر قديم",
    expansive_orange: "روحك تبحث عن الأفق",
    pure_white: "تُحوّل كل ما تلمسه",
  },
};

/* ═══════════════════════════════════════════
   Aura short meanings (personality text)
   ═══════════════════════════════════════════ */
const AURA_MEANINGS: Record<Lang, Record<AuraFamily, string>> = {
  en: {
    solar_gold: "You carry the unmistakable presence of a natural leader — warm, generous, and magnetically confident. Your inner sun illuminates every room you enter.",
    moon_silver_blue: "Deeply intuitive and emotionally perceptive, you sense what others cannot. Your inner world is a rich landscape of feeling, memory, and unspoken understanding.",
    healing_green: "Quick-witted and endlessly curious, you connect ideas at lightning speed. Communication is your gift — you translate complexity into clarity with effortless grace.",
    mystical_purple: "Your consciousness touches realms beyond the ordinary. Artistic, spiritual, and profoundly imaginative, you dissolve boundaries between the seen and unseen.",
    vital_red: "Driven by an unstoppable inner force, you act with courage and intensity. Your passion ignites action — you are the catalyst that moves stagnant energy.",
    venus_pink: "You embody love in its most refined form — appreciating beauty, fostering connection, and creating harmony wherever you go. Relationships are your art.",
    astral_turquoise: "Original, electric, and unafraid of change — you see futures others can't imagine. Your ideas arrive like lightning, disrupting old patterns with brilliant innovation.",
    deep_indigo: "Patient, disciplined, and deeply responsible, you build structures that endure. Your wisdom comes from experience, and your presence is an anchor for those around you.",
    expansive_orange: "Optimistic, philosophical, and generous — you see the grand pattern behind life's details. Your natural abundance inspires others to dream larger and reach further.",
    pure_white: "Intense and penetrating, you see through surfaces to the truth beneath. Your power lies in transformation — you shed old skins and emerge reborn, again and again.",
  },
  he: {
    solar_gold: "את/ה נושא/ת נוכחות בלתי מוטעית של מנהיג/ה טבעי/ת — חמים/ה, נדיב/ה, ובעל/ת כריזמה מגנטית. השמש הפנימית שלך מאירה כל חדר שאת/ה נכנס/ת אליו.",
    moon_silver_blue: "אינטואיטיבי/ת עמוק/ה ורגיש/ה רגשית, את/ה חש/ה מה שאחרים לא מסוגלים. העולם הפנימי שלך הוא נוף עשיר של רגש, זיכרון והבנה שאינה נאמרת.",
    healing_green: "חד/ה וסקרן/ית ללא גבול, את/ה מחבר/ת רעיונות במהירות הבזק. תקשורת היא המתנה שלך — את/ה מתרגם/ת מורכבות לבהירות בחן טבעי.",
    mystical_purple: "התודעה שלך נוגעת בממלכות מעבר לרגיל. אמנותי/ת, רוחני/ת ובעל/ת דמיון עמוק — את/ה ממוסס/ת גבולות בין הנראה לבלתי נראה.",
    vital_red: "מונע/ת מכוח פנימי בלתי ניתן לעצירה, את/ה פועל/ת באומץ ועוצמה. התשוקה שלך מצתה פעולה — את/ה הזרז שמניע אנרגיה קפואה.",
    venus_pink: "את/ה מגלם/ת אהבה בצורתה המעודנת ביותר — מעריך/ה יופי, מטפח/ת קשרים ויוצר/ת הרמוניה בכל מקום. מערכות יחסים הן האמנות שלך.",
    astral_turquoise: "מקורי/ת, חשמלי/ת ולא חושש/ת משינוי — את/ה רואה עתידות שאחרים לא מדמיינים. הרעיונות שלך מגיעים כמו ברק, משבשים דפוסים ישנים בחדשנות מבריקה.",
    deep_indigo: "סבלני/ת, ממושמע/ת ואחראי/ת עמוקות — את/ה בונה מבנים שמחזיקים מעמד. החוכמה שלך נובעת מניסיון, והנוכחות שלך היא עוגן לסובבים אותך.",
    expansive_orange: "אופטימי/ת, פילוסופי/ת ונדיב/ה — את/ה רואה את הדפוס הגדול מאחורי פרטי החיים. השפע הטבעי שלך מעורר אחרים לחלום גדול יותר ולהגיע רחוק יותר.",
    pure_white: "אינטנסיבי/ת וחודרני/ת, את/ה רואה דרך פני השטח אל האמת שמתחת. הכוח שלך טמון בשינוי — את/ה פושט/ת עורות ישנים ונולד/ת מחדש, שוב ושוב.",
  },
  ru: {
    solar_gold: "Вы несёте безошибочное присутствие прирождённого лидера — тёплого, щедрого и магнетически уверенного. Ваше внутреннее солнце освещает каждую комнату.",
    moon_silver_blue: "Глубоко интуитивны и эмоционально восприимчивы — вы чувствуете то, чего не могут другие. Ваш внутренний мир — богатый ландшафт чувств и невысказанного понимания.",
    healing_green: "Остроумны и бесконечно любопытны — вы связываете идеи с молниеносной скоростью. Общение — ваш дар, вы переводите сложность в ясность с лёгкой грацией.",
    mystical_purple: "Ваше сознание касается миров за пределами обычного. Артистичны, духовны и глубоко образны — вы растворяете границы между видимым и невидимым.",
    vital_red: "Движимые неостановимой внутренней силой, вы действуете с мужеством и интенсивностью. Ваша страсть разжигает действие — вы катализатор, двигающий застоявшуюся энергию.",
    venus_pink: "Вы воплощаете любовь в её самой утончённой форме — цените красоту, взращиваете связи и создаёте гармонию повсюду. Отношения — ваше искусство.",
    astral_turquoise: "Оригинальны, электричны и не боитесь перемен — вы видите будущее, которое другие не могут представить. Ваши идеи приходят как молния, разрушая старые паттерны.",
    deep_indigo: "Терпеливы, дисциплинированны и глубоко ответственны — вы строите структуры, которые выдерживают. Ваша мудрость рождена опытом, а ваше присутствие — якорь для окружающих.",
    expansive_orange: "Оптимистичны, философичны и щедры — вы видите великий замысел за деталями жизни. Ваше природное изобилие вдохновляет других мечтать масштабнее.",
    pure_white: "Интенсивны и проницательны — вы видите сквозь поверхность к истине внутри. Ваша сила — в трансформации: вы сбрасываете старую кожу и рождаетесь заново, снова и снова.",
  },
  ar: {
    solar_gold: "تحمل حضوراً لا يُخطئه أحد لقائد بالفطرة — دافئ وكريم وواثق بجاذبية مغناطيسية. شمسك الداخلية تُنير كل غرفة تدخلها.",
    moon_silver_blue: "عميق الحدس ومدرك عاطفياً، تستشعر ما لا يستطيعه الآخرون. عالمك الداخلي منظر غني بالمشاعر والذكريات والفهم غير المنطوق.",
    healing_green: "سريع البديهة وفضولي بلا حدود، تربط الأفكار بسرعة البرق. التواصل هبتك — تترجم التعقيد إلى وضوح بأناقة طبيعية.",
    mystical_purple: "وعيك يلامس عوالم ما وراء المألوف. فني وروحاني وعميق الخيال — تُذيب الحدود بين المرئي وغير المرئي.",
    vital_red: "مدفوع بقوة داخلية لا تُوقف، تتصرف بشجاعة وحدة. شغفك يُشعل الفعل — أنت المحفّز الذي يحرّك الطاقة الراكدة.",
    venus_pink: "تجسّد الحب في أرقى أشكاله — تقدّر الجمال وتغذّي الروابط وتخلق الانسجام أينما ذهبت. العلاقات هي فنّك.",
    astral_turquoise: "أصيل وكهربائي ولا تخشى التغيير — ترى مستقبلاً لا يتخيله الآخرون. أفكارك تأتي كالبرق، تكسر الأنماط القديمة بابتكار لامع.",
    deep_indigo: "صبور ومنضبط ومسؤول بعمق — تبني هياكل تصمد. حكمتك تأتي من الخبرة، وحضورك مرساة لمن حولك.",
    expansive_orange: "متفائل وفلسفي وكريم — ترى النمط الكبير خلف تفاصيل الحياة. وفرتك الطبيعية تُلهم الآخرين أن يحلموا أكبر ويصلوا أبعد.",
    pure_white: "مكثّف ونافذ، ترى ما وراء السطح إلى الحقيقة الكامنة. قوتك في التحوّل — تخلع جلوداً قديمة وتولد من جديد، مرة بعد مرة.",
  },
};

/* ═══════════════════════════════════════════
   UI section labels
   ═══════════════════════════════════════════ */
const SECTION_LABELS: Record<Lang, Record<string, string>> = {
  en: {
    dominant: "Your Dominant Aura",
    secondary: "Secondary tones",
    energySignature: "Your Energy Signature",
    primaryLabel: "Primary Aura",
    secondaryLabel: "Supporting Tones",
    modifierLabel: "Energy Tone",
    shareTitle: "Share Your Aura",
    downloadCta: "Download Your Aura",
  },
  he: {
    dominant: "ההילה הדומיננטית שלך",
    secondary: "גוונים משניים",
    energySignature: "חתימת האנרגיה שלך",
    primaryLabel: "הילה ראשית",
    secondaryLabel: "גוונים תומכים",
    modifierLabel: "טון אנרגטי",
    shareTitle: "שתפ/י את ההילה שלך",
    downloadCta: "הורד/י את ההילה שלך",
  },
  ru: {
    dominant: "Ваша доминирующая аура",
    secondary: "Вторичные тона",
    energySignature: "Ваша энергетическая подпись",
    primaryLabel: "Основная аура",
    secondaryLabel: "Поддерживающие тона",
    modifierLabel: "Энергетический тон",
    shareTitle: "Поделитесь своей аурой",
    downloadCta: "Скачать вашу ауру",
  },
  ar: {
    dominant: "هالتك المهيمنة",
    secondary: "نغمات ثانوية",
    energySignature: "بصمتك الطاقية",
    primaryLabel: "الهالة الأساسية",
    secondaryLabel: "نغمات داعمة",
    modifierLabel: "النغمة الطاقية",
    shareTitle: "شارك هالتك",
    downloadCta: "حمّل هالتك",
  },
};

/* ═══════════════════════════════════════════
   Title composition patterns
   Word order differs per language.
   ═══════════════════════════════════════════ */

/**
 * Build a locale-aware identity title from keys.
 * Word order is correct per language (e.g. Hebrew adjective follows noun).
 */
export function buildLocalizedTitle(
  lang: string,
  primaryAuraKey: AuraFamily,
  modifierKey: EnergyModifier,
): string {
  const l = (lang as Lang) in AURA_NAMES ? (lang as Lang) : "en";
  const auraName = AURA_NAMES[l][primaryAuraKey] ?? AURA_NAMES.en[primaryAuraKey];
  const modName = MODIFIER_NAMES[l][modifierKey] ?? MODIFIER_NAMES.en[modifierKey];

  // RTL languages: noun first, then adjective
  if (l === "he" || l === "ar") {
    return `${auraName} ${modName}`;
  }
  // LTR: modifier first
  return `${modName} ${auraName}`;
}

/** Get localized aura family name */
export function getAuraName(lang: string, key: AuraFamily): string {
  const l = (lang as Lang) in AURA_NAMES ? (lang as Lang) : "en";
  return AURA_NAMES[l][key] ?? AURA_NAMES.en[key];
}

/** Get localized modifier name */
export function getModifierName(lang: string, key: EnergyModifier): string {
  const l = (lang as Lang) in MODIFIER_NAMES ? (lang as Lang) : "en";
  return MODIFIER_NAMES[l][key] ?? MODIFIER_NAMES.en[key];
}

/** Get localized subtitle */
export function getAuraSubtitle(lang: string, key: AuraFamily): string {
  const l = (lang as Lang) in AURA_SUBTITLES ? (lang as Lang) : "en";
  return AURA_SUBTITLES[l][key] ?? AURA_SUBTITLES.en[key];
}

/** Get localized short meaning */
export function getAuraMeaning(lang: string, key: AuraFamily): string {
  const l = (lang as Lang) in AURA_MEANINGS ? (lang as Lang) : "en";
  return AURA_MEANINGS[l][key] ?? AURA_MEANINGS.en[key];
}

/** Get localized section labels */
export function getSectionLabels(lang: string): Record<string, string> {
  const l = (lang as Lang) in SECTION_LABELS ? (lang as Lang) : "en";
  return SECTION_LABELS[l];
}

/* Re-export for backward compat */
export { AURA_NAMES, MODIFIER_NAMES, AURA_SUBTITLES, AURA_MEANINGS, SECTION_LABELS };
