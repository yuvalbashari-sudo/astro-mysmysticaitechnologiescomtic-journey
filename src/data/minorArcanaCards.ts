import cardBackImg from "@/assets/tarot/card-back.jpg";
import type { Language } from "@/i18n/types";

export type MinorArcanaSuit = "swords" | "cups" | "wands" | "pentacles";

export interface MinorArcanaCard {
  id: string;
  number: number;
  name: Record<Language, string>;
  suit: MinorArcanaSuit;
  image: string;
  slug: string;
  shortMeaning: Record<Language, string>;
}

// Placeholder image — replace per-card when real assets are uploaded
const placeholder = cardBackImg;

const swordsCards: MinorArcanaCard[] = [
  { id: "ace-of-swords", number: 1, suit: "swords", slug: "ace-of-swords", image: placeholder, name: { he: "אס החרבות", en: "Ace of Swords", ru: "Туз Мечей", ar: "آس السيوف" }, shortMeaning: { he: "בהירות מחשבתית חדשה", en: "New mental clarity", ru: "Новая ясность ума", ar: "وضوح ذهني جديد" } },
  { id: "two-of-swords", number: 2, suit: "swords", slug: "two-of-swords", image: placeholder, name: { he: "שני חרבות", en: "Two of Swords", ru: "Двойка Мечей", ar: "اثنان السيوف" }, shortMeaning: { he: "החלטה קשה, איזון", en: "Difficult decision, balance", ru: "Трудное решение, баланс", ar: "قرار صعب، توازن" } },
  { id: "three-of-swords", number: 3, suit: "swords", slug: "three-of-swords", image: placeholder, name: { he: "שלושה חרבות", en: "Three of Swords", ru: "Тройка Мечей", ar: "ثلاثة السيوف" }, shortMeaning: { he: "כאב לב, שחרור", en: "Heartbreak, release", ru: "Боль сердца, освобождение", ar: "ألم القلب، تحرر" } },
  { id: "four-of-swords", number: 4, suit: "swords", slug: "four-of-swords", image: placeholder, name: { he: "ארבעה חרבות", en: "Four of Swords", ru: "Четверка Мечей", ar: "أربعة السيوف" }, shortMeaning: { he: "מנוחה, התבוננות פנימית", en: "Rest, introspection", ru: "Отдых, самоанализ", ar: "راحة، تأمل داخلي" } },
  { id: "five-of-swords", number: 5, suit: "swords", slug: "five-of-swords", image: placeholder, name: { he: "חמישה חרבות", en: "Five of Swords", ru: "Пятерка Мечей", ar: "خمسة السيوف" }, shortMeaning: { he: "קונפליקט, ניצחון מר", en: "Conflict, hollow victory", ru: "Конфликт, пустая победа", ar: "صراع، انتصار مرير" } },
  { id: "six-of-swords", number: 6, suit: "swords", slug: "six-of-swords", image: placeholder, name: { he: "שישה חרבות", en: "Six of Swords", ru: "Шестерка Мечей", ar: "ستة السيوف" }, shortMeaning: { he: "מעבר, שינוי מרפא", en: "Transition, healing change", ru: "Переход, исцеляющая перемена", ar: "انتقال، تغيير شافٍ" } },
  { id: "seven-of-swords", number: 7, suit: "swords", slug: "seven-of-swords", image: placeholder, name: { he: "שבעה חרבות", en: "Seven of Swords", ru: "Семерка Мечей", ar: "سبعة السيوف" }, shortMeaning: { he: "ערמומיות, אסטרטגיה", en: "Deception, strategy", ru: "Обман, стратегия", ar: "خداع، استراتيجية" } },
  { id: "eight-of-swords", number: 8, suit: "swords", slug: "eight-of-swords", image: placeholder, name: { he: "שמונה חרבות", en: "Eight of Swords", ru: "Восьмерка Мечей", ar: "ثمانية السيوف" }, shortMeaning: { he: "מלכודת מחשבתית, שחרור", en: "Mental trap, liberation", ru: "Ментальная ловушка, освобождение", ar: "فخ ذهني، تحرر" } },
  { id: "nine-of-swords", number: 9, suit: "swords", slug: "nine-of-swords", image: placeholder, name: { he: "תשעה חרבות", en: "Nine of Swords", ru: "Девятка Мечей", ar: "تسعة السيوف" }, shortMeaning: { he: "חרדה, פחדים פנימיים", en: "Anxiety, inner fears", ru: "Тревога, внутренние страхи", ar: "قلق، مخاوف داخلية" } },
  { id: "ten-of-swords", number: 10, suit: "swords", slug: "ten-of-swords", image: placeholder, name: { he: "עשרה חרבות", en: "Ten of Swords", ru: "Десятка Мечей", ar: "عشرة السيوف" }, shortMeaning: { he: "סוף מחזור, התחלה חדשה", en: "End of cycle, new beginning", ru: "Конец цикла, новое начало", ar: "نهاية دورة، بداية جديدة" } },
  { id: "knight-of-swords", number: 11, suit: "swords", slug: "knight-of-swords", image: placeholder, name: { he: "אביר חרבות", en: "Knight of Swords", ru: "Рыцарь Мечей", ar: "فارس السيوف" }, shortMeaning: { he: "פעולה נמרצת, אמביציה", en: "Swift action, ambition", ru: "Стремительное действие, амбиции", ar: "عمل سريع، طموح" } },
  { id: "prince-of-swords", number: 12, suit: "swords", slug: "prince-of-swords", image: placeholder, name: { he: "נסיך חרבות", en: "Prince of Swords", ru: "Принц Мечей", ar: "أمير السيوف" }, shortMeaning: { he: "חשיבה חדה, תעוזה", en: "Sharp thinking, boldness", ru: "Острое мышление, дерзость", ar: "تفكير حاد، جرأة" } },
  { id: "queen-of-swords", number: 13, suit: "swords", slug: "queen-of-swords", image: placeholder, name: { he: "מלכת חרבות", en: "Queen of Swords", ru: "Королева Мечей", ar: "ملكة السيوف" }, shortMeaning: { he: "אינטליגנציה, עצמאות", en: "Intelligence, independence", ru: "Интеллект, независимость", ar: "ذكاء، استقلالية" } },
  { id: "king-of-swords", number: 14, suit: "swords", slug: "king-of-swords", image: placeholder, name: { he: "מלך חרבות", en: "King of Swords", ru: "Король Мечей", ar: "ملك السيوف" }, shortMeaning: { he: "סמכות אינטלקטואלית, הגינות", en: "Intellectual authority, fairness", ru: "Интеллектуальная власть, справедливость", ar: "سلطة فكرية، إنصاف" } },
];

const cupsCards: MinorArcanaCard[] = [
  { id: "ace-of-cups", number: 1, suit: "cups", slug: "ace-of-cups", image: placeholder, name: { he: "אס הגביעים", en: "Ace of Cups", ru: "Туз Кубков", ar: "آس الكؤوس" }, shortMeaning: { he: "אהבה חדשה, שפע רגשי", en: "New love, emotional abundance", ru: "Новая любовь, эмоциональное изобилие", ar: "حب جديد، وفرة عاطفية" } },
  { id: "two-of-cups", number: 2, suit: "cups", slug: "two-of-cups", image: placeholder, name: { he: "שני גביעים", en: "Two of Cups", ru: "Двойка Кубков", ar: "اثنان الكؤوس" }, shortMeaning: { he: "שותפות, קשר עמוק", en: "Partnership, deep connection", ru: "Партнёрство, глубокая связь", ar: "شراكة، ارتباط عميق" } },
  { id: "three-of-cups", number: 3, suit: "cups", slug: "three-of-cups", image: placeholder, name: { he: "שלושה גביעים", en: "Three of Cups", ru: "Тройка Кубков", ar: "ثلاثة الكؤوس" }, shortMeaning: { he: "חגיגה, חברות", en: "Celebration, friendship", ru: "Праздник, дружба", ar: "احتفال، صداقة" } },
  { id: "four-of-cups", number: 4, suit: "cups", slug: "four-of-cups", image: placeholder, name: { he: "ארבעה גביעים", en: "Four of Cups", ru: "Четверка Кубков", ar: "أربعة الكؤوس" }, shortMeaning: { he: "שקיעה עצמית, חיפוש", en: "Contemplation, searching", ru: "Самоуглубление, поиск", ar: "تأمل، بحث" } },
  { id: "five-of-cups", number: 5, suit: "cups", slug: "five-of-cups", image: placeholder, name: { he: "חמישה גביעים", en: "Five of Cups", ru: "Пятерка Кубков", ar: "خمسة الكؤوس" }, shortMeaning: { he: "אבל, מה שנשאר", en: "Grief, what remains", ru: "Печаль, что остаётся", ar: "حزن، ما تبقى" } },
  { id: "six-of-cups", number: 6, suit: "cups", slug: "six-of-cups", image: placeholder, name: { he: "שישה גביעים", en: "Six of Cups", ru: "Шестерка Кубков", ar: "ستة الكؤوس" }, shortMeaning: { he: "נוסטלגיה, תמימות", en: "Nostalgia, innocence", ru: "Ностальгия, невинность", ar: "حنين، براءة" } },
  { id: "seven-of-cups", number: 7, suit: "cups", slug: "seven-of-cups", image: placeholder, name: { he: "שבעה גביעים", en: "Seven of Cups", ru: "Семерка Кубков", ar: "سبعة الكؤوس" }, shortMeaning: { he: "חלומות, אשליות", en: "Dreams, illusions", ru: "Мечты, иллюзии", ar: "أحلام، أوهام" } },
  { id: "eight-of-cups", number: 8, suit: "cups", slug: "eight-of-cups", image: placeholder, name: { he: "שמונה גביעים", en: "Eight of Cups", ru: "Восьмерка Кубков", ar: "ثمانية الكؤوس" }, shortMeaning: { he: "עזיבה, חיפוש עומק", en: "Walking away, seeking depth", ru: "Уход, поиск глубины", ar: "مغادرة، البحث عن العمق" } },
  { id: "nine-of-cups", number: 9, suit: "cups", slug: "nine-of-cups", image: placeholder, name: { he: "תשעה גביעים", en: "Nine of Cups", ru: "Девятка Кубков", ar: "تسعة الكؤوس" }, shortMeaning: { he: "שביעות רצון, משאלת לב", en: "Contentment, wish fulfilled", ru: "Удовлетворение, исполнение желания", ar: "رضا، تحقيق الأمنيات" } },
  { id: "ten-of-cups", number: 10, suit: "cups", slug: "ten-of-cups", image: placeholder, name: { he: "עשרה גביעים", en: "Ten of Cups", ru: "Десятка Кубков", ar: "عشرة الكؤوس" }, shortMeaning: { he: "אושר משפחתי, הרמוניה", en: "Family happiness, harmony", ru: "Семейное счастье, гармония", ar: "سعادة عائلية، انسجام" } },
  { id: "knight-of-cups", number: 11, suit: "cups", slug: "knight-of-cups", image: placeholder, name: { he: "אביר הגביעים", en: "Knight of Cups", ru: "Рыцарь Кубков", ar: "فارس الكؤوس" }, shortMeaning: { he: "רומנטיקה, הצעה", en: "Romance, an offer", ru: "Романтика, предложение", ar: "رومانسية، عرض" } },
  { id: "prince-of-cups", number: 12, suit: "cups", slug: "prince-of-cups", image: placeholder, name: { he: "נסיך הגביעים", en: "Prince of Cups", ru: "Принц Кубков", ar: "أمير الكؤوس" }, shortMeaning: { he: "רגישות, אינטואיציה", en: "Sensitivity, intuition", ru: "Чувствительность, интуиция", ar: "حساسية، حدس" } },
  { id: "queen-of-cups", number: 13, suit: "cups", slug: "queen-of-cups", image: placeholder, name: { he: "מלכת הגביעים", en: "Queen of Cups", ru: "Королева Кубков", ar: "ملكة الكؤوس" }, shortMeaning: { he: "חמלה, חוכמה רגשית", en: "Compassion, emotional wisdom", ru: "Сострадание, эмоциональная мудрость", ar: "رحمة، حكمة عاطفية" } },
  { id: "king-of-cups", number: 14, suit: "cups", slug: "king-of-cups", image: placeholder, name: { he: "מלך הגביעים", en: "King of Cups", ru: "Король Кубков", ar: "ملك الكؤوس" }, shortMeaning: { he: "שליטה רגשית, בגרות", en: "Emotional mastery, maturity", ru: "Эмоциональное мастерство, зрелость", ar: "إتقان عاطفي، نضج" } },
];

const wandsCards: MinorArcanaCard[] = [
  { id: "ace-of-wands", number: 1, suit: "wands", slug: "ace-of-wands", image: placeholder, name: { he: "אס המטות", en: "Ace of Wands", ru: "Туз Жезлов", ar: "آس العصي" }, shortMeaning: { he: "השראה, התחלה חדשה", en: "Inspiration, new beginning", ru: "Вдохновение, новое начало", ar: "إلهام، بداية جديدة" } },
  { id: "two-of-wands", number: 2, suit: "wands", slug: "two-of-wands", image: placeholder, name: { he: "שני מטות", en: "Two of Wands", ru: "Двойка Жезлов", ar: "اثنان العصي" }, shortMeaning: { he: "תכנון, חזון עתידי", en: "Planning, future vision", ru: "Планирование, видение будущего", ar: "تخطيط، رؤية مستقبلية" } },
  { id: "three-of-wands", number: 3, suit: "wands", slug: "three-of-wands", image: placeholder, name: { he: "שלושה מטות", en: "Three of Wands", ru: "Тройка Жезлов", ar: "ثلاثة العصي" }, shortMeaning: { he: "התרחבות, הזדמנויות", en: "Expansion, opportunities", ru: "Расширение, возможности", ar: "توسع، فرص" } },
  { id: "four-of-wands", number: 4, suit: "wands", slug: "four-of-wands", image: placeholder, name: { he: "ארבעה מטות", en: "Four of Wands", ru: "Четверка Жезлов", ar: "أربعة العصي" }, shortMeaning: { he: "חגיגה, יציבות", en: "Celebration, stability", ru: "Праздник, стабильность", ar: "احتفال، استقرار" } },
  { id: "five-of-wands", number: 5, suit: "wands", slug: "five-of-wands", image: placeholder, name: { he: "חמישה מטות", en: "Five of Wands", ru: "Пятерка Жезлов", ar: "خمسة العصي" }, shortMeaning: { he: "תחרות, מאבק", en: "Competition, struggle", ru: "Соревнование, борьба", ar: "منافسة، صراع" } },
  { id: "six-of-wands", number: 6, suit: "wands", slug: "six-of-wands", image: placeholder, name: { he: "שישה מטות", en: "Six of Wands", ru: "Шестерка Жезлов", ar: "ستة العصي" }, shortMeaning: { he: "ניצחון, הכרה", en: "Victory, recognition", ru: "Победа, признание", ar: "انتصار، اعتراف" } },
  { id: "seven-of-wands", number: 7, suit: "wands", slug: "seven-of-wands", image: placeholder, name: { he: "שבעה מטות", en: "Seven of Wands", ru: "Семерка Жезлов", ar: "سبعة العصي" }, shortMeaning: { he: "הגנה, עמידה איתנה", en: "Defense, standing firm", ru: "Защита, стойкость", ar: "دفاع، ثبات" } },
  { id: "eight-of-wands", number: 8, suit: "wands", slug: "eight-of-wands", image: placeholder, name: { he: "שמונה מטות", en: "Eight of Wands", ru: "Восьмерка Жезлов", ar: "ثمانية العصي" }, shortMeaning: { he: "מהירות, התקדמות", en: "Speed, progress", ru: "Скорость, прогресс", ar: "سرعة، تقدم" } },
  { id: "nine-of-wands", number: 9, suit: "wands", slug: "nine-of-wands", image: placeholder, name: { he: "תשעה מטות", en: "Nine of Wands", ru: "Девятка Жезлов", ar: "تسعة العصي" }, shortMeaning: { he: "חוסן, התמדה", en: "Resilience, persistence", ru: "Стойкость, упорство", ar: "مرونة، إصرار" } },
  { id: "ten-of-wands", number: 10, suit: "wands", slug: "ten-of-wands", image: placeholder, name: { he: "עשרה מטות", en: "Ten of Wands", ru: "Десятка Жезлов", ar: "عشرة العصي" }, shortMeaning: { he: "עומס, אחריות", en: "Burden, responsibility", ru: "Бремя, ответственность", ar: "عبء، مسؤولية" } },
  { id: "knight-of-wands", number: 11, suit: "wands", slug: "knight-of-wands", image: placeholder, name: { he: "אביר המטות", en: "Knight of Wands", ru: "Рыцарь Жезлов", ar: "فارس العصي" }, shortMeaning: { he: "הרפתקה, אנרגיה", en: "Adventure, energy", ru: "Приключение, энергия", ar: "مغامرة، طاقة" } },
  { id: "prince-of-wands", number: 12, suit: "wands", slug: "prince-of-wands", image: placeholder, name: { he: "נסיך המטות", en: "Prince of Wands", ru: "Принц Жезлов", ar: "أمير العصي" }, shortMeaning: { he: "יצירתיות, חופש", en: "Creativity, freedom", ru: "Творчество, свобода", ar: "إبداع، حرية" } },
  { id: "queen-of-wands", number: 13, suit: "wands", slug: "queen-of-wands", image: placeholder, name: { he: "מלכת המטות", en: "Queen of Wands", ru: "Королева Жезлов", ar: "ملكة العصي" }, shortMeaning: { he: "ביטחון, כריזמה", en: "Confidence, charisma", ru: "Уверенность, харизма", ar: "ثقة، كاريزما" } },
  { id: "king-of-wands", number: 14, suit: "wands", slug: "king-of-wands", image: placeholder, name: { he: "מלך המטות", en: "King of Wands", ru: "Король Жезлов", ar: "ملك العصي" }, shortMeaning: { he: "מנהיגות, חזון", en: "Leadership, vision", ru: "Лидерство, видение", ar: "قيادة، رؤية" } },
];

const pentaclesCards: MinorArcanaCard[] = [
  { id: "ace-of-pentacles", number: 1, suit: "pentacles", slug: "ace-of-pentacles", image: placeholder, name: { he: "אס המטבעות", en: "Ace of Pentacles", ru: "Туз Пентаклей", ar: "آس النجوم" }, shortMeaning: { he: "הזדמנות חומרית, שגשוג", en: "Material opportunity, prosperity", ru: "Материальная возможность, процветание", ar: "فرصة مادية، ازدهار" } },
  { id: "two-of-pentacles", number: 2, suit: "pentacles", slug: "two-of-pentacles", image: placeholder, name: { he: "שני מטבעות", en: "Two of Pentacles", ru: "Двойка Пентаклей", ar: "اثنان النجوم" }, shortMeaning: { he: "איזון, גמישות", en: "Balance, flexibility", ru: "Баланс, гибкость", ar: "توازن، مرونة" } },
  { id: "three-of-pentacles", number: 3, suit: "pentacles", slug: "three-of-pentacles", image: placeholder, name: { he: "שלושה מטבעות", en: "Three of Pentacles", ru: "Тройка Пентаклей", ar: "ثلاثة النجوم" }, shortMeaning: { he: "שיתוף פעולה, מומחיות", en: "Collaboration, expertise", ru: "Сотрудничество, мастерство", ar: "تعاون، خبرة" } },
  { id: "four-of-pentacles", number: 4, suit: "pentacles", slug: "four-of-pentacles", image: placeholder, name: { he: "ארבעה מטבעות", en: "Four of Pentacles", ru: "Четверка Пентаклей", ar: "أربعة النجوم" }, shortMeaning: { he: "שמירה, ביטחון חומרי", en: "Security, holding on", ru: "Безопасность, удержание", ar: "أمان، تمسّك" } },
  { id: "five-of-pentacles", number: 5, suit: "pentacles", slug: "five-of-pentacles", image: placeholder, name: { he: "חמישה מטבעות", en: "Five of Pentacles", ru: "Пятерка Пентаклей", ar: "خمسة النجوم" }, shortMeaning: { he: "קושי, חיפוש עזרה", en: "Hardship, seeking help", ru: "Трудности, поиск помощи", ar: "صعوبة، طلب المساعدة" } },
  { id: "six-of-pentacles", number: 6, suit: "pentacles", slug: "six-of-pentacles", image: placeholder, name: { he: "שישה מטבעות", en: "Six of Pentacles", ru: "Шестерка Пентаклей", ar: "ستة النجوم" }, shortMeaning: { he: "נדיבות, שיתוף", en: "Generosity, sharing", ru: "Щедрость, делиться", ar: "كرم، مشاركة" } },
  { id: "seven-of-pentacles", number: 7, suit: "pentacles", slug: "seven-of-pentacles", image: placeholder, name: { he: "שבעה מטבעות", en: "Seven of Pentacles", ru: "Семерка Пентаклей", ar: "سبعة النجوم" }, shortMeaning: { he: "סבלנות, השקעה ארוכת טווח", en: "Patience, long-term investment", ru: "Терпение, долгосрочная инвестиция", ar: "صبر، استثمار طويل الأمد" } },
  { id: "eight-of-pentacles", number: 8, suit: "pentacles", slug: "eight-of-pentacles", image: placeholder, name: { he: "שמונה מטבעות", en: "Eight of Pentacles", ru: "Восьмерка Пентаклей", ar: "ثمانية النجوم" }, shortMeaning: { he: "שקידה, שיפור מיומנויות", en: "Diligence, skill improvement", ru: "Усердие, развитие навыков", ar: "اجتهاد، تطوير المهارات" } },
  { id: "nine-of-pentacles", number: 9, suit: "pentacles", slug: "nine-of-pentacles", image: placeholder, name: { he: "תשעה מטבעות", en: "Nine of Pentacles", ru: "Девятка Пентаклей", ar: "تسعة النجوم" }, shortMeaning: { he: "עצמאות, שפע", en: "Independence, abundance", ru: "Независимость, изобилие", ar: "استقلال، وفرة" } },
  { id: "ten-of-pentacles", number: 10, suit: "pentacles", slug: "ten-of-pentacles", image: placeholder, name: { he: "עשרה מטבעות", en: "Ten of Pentacles", ru: "Десятка Пентаклей", ar: "عشرة النجوم" }, shortMeaning: { he: "עושר משפחתי, ירושה", en: "Family wealth, legacy", ru: "Семейное богатство, наследие", ar: "ثروة عائلية، إرث" } },
  { id: "knight-of-pentacles", number: 11, suit: "pentacles", slug: "knight-of-pentacles", image: placeholder, name: { he: "אביר המטבעות", en: "Knight of Pentacles", ru: "Рыцарь Пентаклей", ar: "فارس النجوم" }, shortMeaning: { he: "אמינות, עבודה קשה", en: "Reliability, hard work", ru: "Надёжность, трудолюбие", ar: "موثوقية، عمل شاق" } },
  { id: "prince-of-pentacles", number: 12, suit: "pentacles", slug: "prince-of-pentacles", image: placeholder, name: { he: "נסיך המטבעות", en: "Prince of Pentacles", ru: "Принц Пентаклей", ar: "أمير النجوم" }, shortMeaning: { he: "למידה, פוטנציאל", en: "Learning, potential", ru: "Обучение, потенциал", ar: "تعلم، إمكانات" } },
  { id: "queen-of-pentacles", number: 13, suit: "pentacles", slug: "queen-of-pentacles", image: placeholder, name: { he: "מלכת המטבעות", en: "Queen of Pentacles", ru: "Королева Пентаклей", ar: "ملكة النجوم" }, shortMeaning: { he: "טיפוח, שפע מעשי", en: "Nurturing, practical abundance", ru: "Забота, практическое изобилие", ar: "رعاية، وفرة عملية" } },
  { id: "king-of-pentacles", number: 14, suit: "pentacles", slug: "king-of-pentacles", image: placeholder, name: { he: "מלך המטבעות", en: "King of Pentacles", ru: "Король Пентаклей", ar: "ملك النجوم" }, shortMeaning: { he: "הצלחה חומרית, מנהיגות", en: "Material success, leadership", ru: "Материальный успех, лидерство", ar: "نجاح مادي، قيادة" } },
];

export const minorArcanaCards: MinorArcanaCard[] = [
  ...swordsCards,
  ...cupsCards,
  ...wandsCards,
  ...pentaclesCards,
];

export function getMinorArcanaBySuit(suit: MinorArcanaSuit): MinorArcanaCard[] {
  return minorArcanaCards.filter((c) => c.suit === suit);
}
