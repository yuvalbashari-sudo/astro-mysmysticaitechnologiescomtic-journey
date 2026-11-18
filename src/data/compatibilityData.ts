import type { Language } from "@/i18n/types";

export interface CompatibilityResult {
  score: number; // 1-100
  overallMatch: string;
  emotionalConnection: string;
  communicationStyle: string;
  passionLevel: string;
  challengesAndGrowth: string;
  advice: string;
}

const signNames: Record<string, string> = {
  aries: "טלה", taurus: "שור", gemini: "תאומים", cancer: "סרטן",
  leo: "אריה", virgo: "בתולה", libra: "מאזניים", scorpio: "עקרב",
  sagittarius: "קשת", capricorn: "גדי", aquarius: "דלי", pisces: "דגים",
};

const signSymbols: Record<string, string> = {
  aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋",
  leo: "♌", virgo: "♍", libra: "♎", scorpio: "♏",
  sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓",
};

const signElements: Record<string, string> = {
  aries: "אש", taurus: "אדמה", gemini: "אוויר", cancer: "מים",
  leo: "אש", virgo: "אדמה", libra: "אוויר", scorpio: "מים",
  sagittarius: "אש", capricorn: "אדמה", aquarius: "אוויר", pisces: "מים",
};

const signModalities: Record<string, string> = {
  aries: "קרדינלי", taurus: "קבוע", gemini: "משתנה", cancer: "קרדינלי",
  leo: "קבוע", virgo: "משתנה", libra: "קרדינלי", scorpio: "קבוע",
  sagittarius: "משתנה", capricorn: "קרדינלי", aquarius: "קבוע", pisces: "משתנה",
};

const signRulers: Record<string, string> = {
  aries: "מאדים", taurus: "נוגה", gemini: "כוכב חמה", cancer: "הירח",
  leo: "השמש", virgo: "כוכב חמה", libra: "נוגה", scorpio: "פלוטו",
  sagittarius: "צדק", capricorn: "שבתאי", aquarius: "אורנוס", pisces: "נפטון",
};

export function getSignFromDate(date: Date): string {
  const m = date.getMonth() + 1, d = date.getDate();
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return "aries";
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return "taurus";
  if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return "gemini";
  if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return "cancer";
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return "leo";
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return "virgo";
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return "libra";
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return "scorpio";
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return "sagittarius";
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return "capricorn";
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return "aquarius";
  return "pisces";
}

export function getSignHebrew(key: string) { return signNames[key] || key; }
export function getSignSymbol(key: string) { return signSymbols[key] || "★"; }
export function getSignElement(key: string) { return signElements[key] || "לא ידוע"; }
export function getSignModality(key: string) { return signModalities[key] || "לא ידוע"; }
export function getSignRuler(key: string) { return signRulers[key] || "לא ידוע"; }

// Approximate rising sign calculation based on birth time and sun sign
// This is a simplified estimation — true rising sign requires exact location
const signOrder = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];

export function getRisingSign(sunSign: string, birthTime: string): string {
  if (!birthTime) return "";
  const [hours, minutes] = birthTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;
  // The ascendant roughly cycles through all 12 signs in 24 hours
  // At sunrise (~6:00), the rising sign equals the sun sign
  // Each 2 hours shifts the rising sign by one position
  const sunIndex = signOrder.indexOf(sunSign);
  if (sunIndex === -1) return "";
  const offsetFromSunrise = ((totalMinutes - 360) + 1440) % 1440; // minutes since 6:00
  const signOffset = Math.floor(offsetFromSunrise / 120); // each sign ~2 hours
  const risingIndex = (sunIndex + signOffset) % 12;
  return signOrder[risingIndex];
}

// Deterministic hash for a sign pair so same pair always gets same score
function pairHash(a: string, b: string): number {
  const key = [a, b].sort().join("+");
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = ((h << 5) - h + key.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getCompatibility(sign1: string, sign2: string) {
  const elements: Record<string, string> = {
    aries: "fire", taurus: "earth", gemini: "air", cancer: "water",
    leo: "fire", virgo: "earth", libra: "air", scorpio: "water",
    sagittarius: "fire", capricorn: "earth", aquarius: "air", pisces: "water",
  };
  const e1 = elements[sign1], e2 = elements[sign2];
  const same = sign1 === sign2;
  const sameElement = e1 === e2;
  const compatible = (e1 === "fire" && e2 === "air") || (e1 === "air" && e2 === "fire") ||
    (e1 === "earth" && e2 === "water") || (e1 === "water" && e2 === "earth");
  const opposite = (e1 === "fire" && e2 === "water") || (e1 === "water" && e2 === "fire") ||
    (e1 === "earth" && e2 === "air") || (e1 === "air" && e2 === "earth");

  // Base range per category, then add pair-specific variation
  const hash = pairHash(sign1, sign2);
  const variation = (hash % 11) - 5; // -5 to +5

  let pattern: "sameSign" | "sameElement" | "complementary" | "contrasting" | "mixed";
  let baseScore: number;

  if (same) { pattern = "sameSign"; baseScore = 62 + (hash % 12); }
  else if (sameElement) { pattern = "sameElement"; baseScore = 68 + (hash % 10); }
  else if (compatible) { pattern = "complementary"; baseScore = 72 + (hash % 12); }
  else if (opposite) { pattern = "contrasting"; baseScore = 42 + (hash % 14); }
  else { pattern = "mixed"; baseScore = 50 + (hash % 16); }

  return { ...hebrewReadings[pattern], score: Math.min(98, Math.max(38, baseScore + variation)), pattern };
}

const sameSignResult: CompatibilityResult = {
  score: 78,
  overallMatch: "כשני מזלות זהים נפגשים — נוצרת מראה קוסמית. אתם מבינים אחד את השני ברמה עמוקה, מרגישים את אותם דברים ומגיבים באופן דומה. זה יכול ליצור קשר עוצמתי של הבנה מוחלטת, אבל גם להאיר את אותן חולשות ואתגרים שיש לכם כבודדים. המפתח הוא ללמוד לקבל את מה שאתם רואים במראה — הטוב והפחות טוב.",
  emotionalConnection: "החיבור הרגשי ביניכם אינטואיטיבי ועוצמתי. אתם מרגישים את הרגשות של השני עוד לפני שהם נאמרים. זה יוצר אינטימיות מיידית, אבל גם יכול להוביל להצטברות רגשית כי שניכם מגיבים מאותו מקום. למדו לתת מרחב זה לזה.",
  communicationStyle: "התקשורת ביניכם זורמת וטבעית — אתם מדברים באותה שפה רגשית ומנטלית. האתגר הוא שלפעמים אתם מניחים שהשני יודע מה אתם חושבים, וזה יכול ליצור אי-הבנות. דברו בפירוש גם כשזה נראה מיותר.",
  passionLevel: "התשוקה ביניכם יכולה להיות עמוקה ומפתיעה. אתם מבינים את הצרכים של השני בצורה אינטואיטיבית. אבל שימו לב לא ליפול לשגרה — דווקא כי אתם כל כך דומים, אתם צריכים להפתיע אחד את השני.",
  challengesAndGrowth: "האתגר הגדול הוא שאתם עלולים להגביר את החולשות ההדדיות. אם שניכם עקשנים — המריבות יהיו ארוכות. אם שניכם רגישים — ייתכנו ימים של רגשות מוגברים. הצמיחה מגיעה כשאתם לומדים להיות שונים גם בתוך הדמיון.",
  advice: "תנו מרחב לאינדיבידואליות של כל אחד. אתם לא חייבים להיות אותו דבר — היו גרסאות שונות של אותה אנרגיה. ככה הקשר יישאר מרגש ומתפתח.",
};

const sameElementResult: CompatibilityResult = {
  score: 85,
  overallMatch: "הקשר ביניכם נבנה על בסיס הבנה אלמנטרית עמוקה. אתם חולקים את אותו יסוד — ולכן מבינים אחד את השני ברמה שורשית. יש ביניכם הרמוניה טבעית שלא דורשת מאמץ — הקשר זורם כמו נהר שמוצא את דרכו אל הים. זוהי התאמה שנולדה בכוכבים.",
  emotionalConnection: "החיבור הרגשי ביניכם עמוק ואורגני. אתם מרגישים בנוח לחשוף את הצדדים הפגיעים, כי אתם יודעים שהשני מבין. זו רמה של ביטחון רגשי שקשה למצוא — טפחו אותה.",
  communicationStyle: "אתם מדברים מאותו מקום ומבינים את הניואנסים של השני. השיחות ביניכם יכולות לזרום משעות ארוכות — מעמיקות, מצחיקות ומרגשות. האתגר הוא לא להניח שהשני תמיד מסכים — חפשו גם את ההבדלים.",
  passionLevel: "התשוקה ביניכם נבנית על בסיס של ביטחון ואמון. זה לא תמיד אש פתאומית — אבל זה להבה שלא נכבית. עם הזמן, האינטימיות מתעמקת ונהיית יותר ויותר עשירה.",
  challengesAndGrowth: "האתגר הוא שאתם עלולים להישאר באזור הנוחות. כשהכל זורם — אין תמריץ לצמוח. הכניסו אתגרים משותפים — טיולים, פרויקטים, חוויות חדשות — כדי לשמור על הדינמיות.",
  advice: "אל תיקחו את ההרמוניה כמובנת מאליה. השקיעו בקשר גם כשהכל בסדר — הפתעות, תשומת לב, מחוות אהבה קטנות. כך תשמרו על הניצוץ.",
};

const compatibleResult: CompatibilityResult = {
  score: 90,
  overallMatch: "ביניכם יש כימיה קוסמית שקשה להסביר במילים. אתם משלימים אחד את השני בצורה מושלמת — מה שחסר לאחד, השני מביא. זהו שילוב של ניגודים שיוצרים הרמוניה מושלמת. הקשר ביניכם מרגיש כמו מפגש שהיקום תכנן מראש.",
  emotionalConnection: "החיבור הרגשי ביניכם חשמלי ועמוק. אתם מרגישים משיכה שהיא גם פיזית וגם נשמתית. יש ביניכם דינמיקה של ׳תן וקח׳ רגשי שמעשירה את שניכם ומאפשרת צמיחה אמיתית.",
  communicationStyle: "השיחות ביניכם חיות ומרגשות. אתם מאתגרים אחד את השני אינטלקטואלית ורגשית, וזה יוצר עומק שלא נגמר. גם כשאתם חולקים על דברים — זה מעשיר את הקשר.",
  passionLevel: "התשוקה ביניכם מגנטית ועוצמתית. אתם מושכים אחד את השני כמו כוח כבידה — טבעי, בלתי ניתן לעצירה ובלתי נשכח. החיבור הפיזי ביניכם הוא ביטוי של חיבור נשמתי עמוק.",
  challengesAndGrowth: "האתגר הוא ללמוד לאזן בין הדינמיקה של ׳אש ואוויר׳ או ׳מים ואדמה׳. לפעמים אחד צריך להאט כשהשני רוצה לרוץ. הצמיחה מגיעה כשאתם לומדים לכבד את הקצב השונה.",
  advice: "תנו לכל אחד לתרום את הכוח הייחודי שלו. אל תנסו לשנות אחד את השני — ההבדלים ביניכם הם בדיוק מה שהופך את הקשר למיוחד.",
};

const oppositeResult: CompatibilityResult = {
  score: 65,
  overallMatch: "הקשר ביניכם הוא של משיכת ניגודים — מאתגר, מלהיב ומטלטל. אתם באים ממקומות שונים לחלוטין, וזה יכול ליצור חיכוך עוצמתי, אבל גם צמיחה אדירה. זהו קשר שמלמד אתכם דברים על עצמכם שלעולם לא הייתם לומדים לבד.",
  emotionalConnection: "החיבור הרגשי ביניכם מורכב ורב-שכבתי. יש רגעים של קרבה עצומה לצד רגעים של אי-הבנה. האתגר הוא ללמוד את השפה הרגשית של השני — כי היא שונה משלכם.",
  communicationStyle: "התקשורת ביניכם דורשת מאמץ מודע. אתם מדברים ׳שפות׳ שונות — לא רק מילולית, אלא גם רגשית. אבל כשאתם לומדים ׳לתרגם׳ — השיחות ביניכם הופכות לעמוקות ומעשירות במיוחד.",
  passionLevel: "התשוקה ביניכם נולדת מהמתח של ההפכים. המשיכה יכולה להיות עוצמתית ובלתי צפויה — כמו ברק. האינטימיות ביניכם מלאה הפתעות ועוצמות.",
  challengesAndGrowth: "האתגר הגדול הוא לא לנסות ׳לנצח׳ — כי בקשר הזה, אם אחד מנצח, שניכם מפסידים. הצמיחה מגיעה כשאתם לומדים שהשונות היא לא איום, אלא הזדמנות.",
  advice: "סבלנות, כבוד ורצון אמיתי להבין את השני הם המפתח. אל תנסו לשנות אחד את השני — למדו ממנו. כל ויכוח הוא הזדמנות להעמקה.",
};

const neutralResult: CompatibilityResult = {
  score: 72,
  overallMatch: "הקשר ביניכם הוא שילוב מעניין ומאתגר. אתם לא דומים ולא הפוכים — אתם פשוט שונים, בצורה שיכולה ליצור ריגוש ועניין. זהו קשר שדורש עבודה, אבל התגמול שווה את המאמץ. כשאתם מוצאים את האיזון — הקשר הופך למיוחד ובלתי ניתן להחלפה.",
  emotionalConnection: "החיבור הרגשי ביניכם הוא מסע של גילוי. אתם לומדים אחד את השני בהדרגה, מגלים שכבות חדשות עם הזמן. זה לא ׳אהבה ממבט ראשון׳ — זה אהבה שנבנית ומתעמקת.",
  communicationStyle: "התקשורת ביניכם דורשת תרגול ורצון טוב. לפעמים תרגישו שאתם מדברים על אותו דבר אבל מכיוונים שונים. הפתרון הוא סבלנות והקשבה פעילה — שאלו, חזרו, וודאו שהבנתם.",
  passionLevel: "התשוקה ביניכם יכולה להפתיע. היא לא תמיד ברורה מהרגע הראשון, אבל כשהיא מתעוררת — היא עמוקה ומורכבת. תנו לה זמן להתפתח ואל תשפטו מוקדם.",
  challengesAndGrowth: "האתגר הוא למצוא שפה משותפת. אתם מגיעים מעולמות שונים, ולפעמים צריך גשר ביניהם. הצמיחה מגיעה כשאתם בונים את הגשר הזה יחד — אבן אחר אבן.",
  advice: "היו פתוחים להפתעות. הקשר הזה יכול ללמד אתכם דברים שלא ציפיתם להם. תנו מרחב, תנו זמן, ותנו לאהבה לבנות את הדרך שלה.",
};

const hebrewReadings = { sameSign: sameSignResult, sameElement: sameElementResult, complementary: compatibleResult, contrasting: oppositeResult, mixed: neutralResult };

type Sections = readonly [string, string, string, string, string, string];
const titles: Record<Language, Sections> = {
  he: ["החיבור בין המזלות", "קשר רגשי", "תקשורת", "משיכה וקרבה", "אתגרים וצמיחה", "עצה לקשר"],
  en: ["Your signs together", "Emotional connection", "Communication", "Attraction and closeness", "Challenges and growth", "Something to try"],
  ru: ["Сочетание знаков", "Эмоциональная связь", "Общение", "Притяжение и близость", "Трудности и рост", "Совет для пары"],
  ar: ["العلاقة بين البرجين", "التواصل العاطفي", "الحوار", "الانجذاب والقرب", "التحديات والنمو", "خطوة عملية"],
};

const readings: Record<Exclude<Language, "he">, Record<keyof typeof hebrewReadings, Sections>> = {
  en: {
    sameSign: ["Sharing a sign can make a first conversation feel familiar. The same habits that draw you together may also surface in disagreements.", "You may recognize each other’s moods quickly. Ask what the other person needs before assuming it is what you would want.", "Shared shorthand is a strength until it leaves something unsaid. Spell out what matters when making plans.", "Familiar rituals build closeness. Taking turns choosing a new activity keeps room for surprise.", "When you both dig in or both withdraw, a short pause can break the pattern.", "This week, each choose one thing you want to do together and one you want to do independently."],
    sameElement: ["Your signs share an element, suggesting a similar pace and a common starting point for decisions.", "An easy sense of trust can make it tempting to skip check-ins. Ask how the week actually felt.", "Similar priorities make planning easier. Give the quieter voice a turn before settling on a decision.", "Small, reliable gestures can carry more weight than elaborate plans.", "Comfort can turn into routine. Explore an interest that only one of you knows well.", "Trade roles for one outing: let the person who usually follows plan the day."],
    complementary: ["Your elements complement each other. One person’s suggestion can give the other the spark or support to act.", "Different ways of showing care can work together once you recognize them.", "Invite both an idea and a practical next step into the same conversation.", "A shared project can bring out your chemistry because each person contributes something distinct.", "The same person need not always start things or keep them going. Exchange roles occasionally.", "Choose a small shared goal and let each person pick the part they want to lead."],
    contrasting: ["Your elements point to different instincts. That contrast can be intriguing, especially when you let each other set a pace.", "One of you may want to talk immediately while the other needs time. Agree on when to come back to the conversation.", "Describe one concrete situation before arguing about what it means.", "Curiosity about an unfamiliar interest can open a route to closeness.", "A difference in timing can feel like a difference in commitment. Ask before drawing that conclusion.", "Each name one gesture that feels supportive and try the other person’s suggestion."],
    mixed: ["This pairing may find its rhythm through experience. Notice which settings bring out the best in both of you.", "Everyday gestures can reveal a need that is hard to put into words.", "Ask one follow-up question before offering advice. You may be solving different problems.", "A new shared activity lets the connection grow without prescribing where it should go.", "Different priorities can coexist if you make space for each in the calendar.", "Plan something familiar for one of you and new to the other, then swap next time."],
  },
  ru: {
    sameSign: ["Одинаковый знак даёт много знакомых черт. Сходные привычки заметны и в радости, и в споре.", "Вы можете быстро уловить настроение друг друга. Уточните, какая поддержка нужна сейчас.", "Общий язык упрощает беседу, но важные ожидания стоит произносить вслух.", "Знакомые ритуалы сближают. По очереди предлагайте новое занятие.", "Если оба замыкаются или настаивают на своём, помогает заранее согласованная пауза.", "Назовите по одному делу для двоих и по одному занятию, для которого нужно личное пространство."],
    sameElement: ["Общая стихия указывает на близкий ритм и схожий подход к решениям.", "Доверие растёт, когда вы замечаете даже небольшие перемены в настроении.", "Принимая решение, дайте каждому высказаться отдельно.", "Привычные знаки внимания помогают сохранять тепло.", "Привычный уклад может надоесть. Познакомьте друг друга со своими увлечениями.", "Пусть следующую встречу организует тот, кто обычно принимает приглашение."],
    complementary: ["Ваши стихии дополняют друг друга. Идея одного может получить развитие благодаря другому.", "Забота проявляется по-разному. Обсудите, какие поступки помогают её почувствовать.", "Соедините в разговоре новую идею с одним конкретным шагом.", "Совместное дело помогает увидеть привлекательные стороны друг друга.", "Меняйтесь ролями, чтобы инициатива и ответственность распределялись поровну.", "Выберите небольшую общую цель и разделите задачи по интересам."],
    contrasting: ["Различия стихий указывают на разный темп. Именно он может вызвать взаимный интерес.", "Одному может хотеться немедленного разговора, другому нужно время. Договоритесь, когда вернётесь к теме.", "Начинайте с конкретного случая и спросите, как его воспринял другой.", "Интерес к непривычному занятию партнёра помогает сблизиться.", "Разные сроки принятия решений легко спутать с равнодушием. Спросите о причинах.", "Пусть каждый назовёт один желанный жест поддержки и попробует выполнить просьбу другого."],
    mixed: ["Ритм этой пары раскрывается в совместном опыте. Отмечайте ситуации, в которых обоим легко.", "Повседневные поступки иногда лучше слов показывают, что человеку важно.", "Задайте уточняющий вопрос, прежде чем давать совет.", "Новое совместное занятие позволяет сблизиться естественно.", "Разные приоритеты легче согласовать, если заранее выделить время для каждого.", "Попробуйте занятие, знакомое одному из вас, а в следующий раз поменяйтесь ролями."],
  },
  ar: {
    sameSign: ["قد يمنحكما البرج المشترك شعوراً بالألفة منذ اللقاء الأول. وقد تتكرر العادات نفسها عند الاختلاف.", "يسهل أحياناً فهم مزاج الآخر، لكن السؤال عن نوع الدعم المطلوب يترك مساحة للاختلاف.", "اللغة المشتركة تسهّل الحوار. عبّرا بوضوح عن التوقعات عند وضع الخطط.", "الطقوس اليومية تعزز القرب، وتجربة نشاط جديد تضيف شيئاً من المفاجأة.", "إذا أصرّ كل طرف على رأيه فقد تساعد استراحة قصيرة قبل متابعة النقاش.", "ليختر كل منكما نشاطاً مشتركاً وآخر يستمتع به وحده."],
    sameElement: ["يشير العنصر المشترك إلى إيقاع متقارب وطريقة مألوفة لاتخاذ القرارات.", "يساعد الاطمئنان على التعبير عن المشاعر. اسألا بعضكما كيف مرّ الأسبوع فعلاً.", "قبل الاتفاق على خطة، اتركا لكل طرف فرصة لطرح رأيه.", "قد تحمل لفتة صغيرة منتظمة معنى أكبر من موعد استثنائي.", "الراحة قد تتحول إلى روتين. جرّبا اهتماماً يعرفه أحدكما أكثر من الآخر.", "ليخطط للقاء المقبل الطرف الذي يترك اختيار المكان عادةً للآخر."],
    complementary: ["يتكامل العنصران في هذا اللقاء، فقد تمنح فكرة أحدكما الآخر الحافز أو الدعم لبدء خطوة جديدة.", "تتخذ العناية أشكالاً مختلفة. تحدّثا عن اللفتات التي تجعل كلاً منكما يشعر بها.", "اجمعا في الحوار بين الفكرة الجديدة وخطوة عملية واحدة.", "يمكن لمشروع مشترك أن يكشف جانباً جذاباً عند كل طرف.", "تبادلا الأدوار كي لا تقع المبادرة أو المتابعة دائماً على شخص واحد.", "اختارا هدفاً صغيراً وحدّدا ما يرغب كل طرف في قيادته."],
    contrasting: ["يشير اختلاف العنصرين إلى إيقاعين مختلفين. وقد يكون هذا الاختلاف نفسه مصدر فضول متبادل.", "قد يرغب أحدكما في الحديث فوراً ويحتاج الآخر إلى وقت. حدّدا موعداً للعودة إلى الموضوع.", "ابدآ بموقف محدد واسألا كيف فهمه كل طرف.", "الاهتمام بهواية غير مألوفة لدى الآخر قد يفتح باباً للقرب.", "تفاوت سرعة اتخاذ القرار قد يبدو فتوراً. اسألا عن السبب قبل الحكم.", "ليذكر كل طرف لفتة تشعره بالدعم وليجرّب ما اقترحه الآخر."],
    mixed: ["يتضح إيقاع العلاقة عبر التجربة. لاحظا المواقف التي يشعر فيها كلاكما بالراحة.", "اللفتات اليومية قد تعبّر عن احتياجات يصعب وصفها بالكلام.", "اطرَحا سؤالاً إضافياً قبل تقديم النصيحة للتأكد من فهم المشكلة.", "يسمح نشاط جديد بمزيد من القرب دون فرض توقعات مسبقة.", "يمكن التوفيق بين الأولويات المختلفة إذا خُصص وقت لكل منها.", "اختارا نشاطاً مألوفاً لأحدكما وجديداً للآخر، ثم تبادلا الاختيار في المرة المقبلة."],
  },
};

export function formatCompatibilityReading(match: ReturnType<typeof getCompatibility>, language: Language, pair: string): string {
  const body: Sections = language === "he"
    ? [match.overallMatch, match.emotionalConnection, match.communicationStyle, match.passionLevel, match.challengesAndGrowth, match.advice]
    : readings[language][match.pattern];
  return titles[language].map((title, index) => {
    const heading = index === 0 ? `${pair} — ${title}` : title;
    return `### ${heading}\n${body[index]}`;
  }).join("\n\n");
}
