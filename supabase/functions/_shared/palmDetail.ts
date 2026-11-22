export const focusKeys = ["heights", "joints", "edge"] as const;
export type PalmFocus = typeof focusKeys[number];
export function isPalmFocus(value: unknown): value is PalmFocus {
  return focusKeys.some(key => key === value);
}

// The upload canvas samples the same photo sent to vision. A height photo
// needs clear background above the tips, independent of any model judgment.
export function hasTopMargin(sample: unknown): boolean {
  if (typeof sample !== "string" || sample.length !== 6144 || !/^[A-Za-z0-9+/]+$/.test(sample)) return false;
  const rgb = atob(sample);
  const channel = (x: number, y: number, c: number) => rgb.charCodeAt((48 * y + x) * 3 + c);
  const distanceFromBackground = (x: number, y: number) => {
    let difference = 0;
    for (let c = 0; c < 3; c++) {
      const left = channel(0, 0, c), right = channel(47, 0, c);
      const background = left + (right - left) * x / 47;
      difference = Math.max(difference, Math.abs(channel(x, y, c) - background));
    }
    return difference;
  };
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 48; x++) {
      if (distanceFromBackground(x, y) > 35) return false;
    }
  }
  // A uniform close-up or blank frame cannot establish a contrasting hand.
  let foreground = 0;
  for (let y = 8; y < 25; y++) {
    for (let x = 8; x < 40; x++) if (distanceFromBackground(x, y) > 45) foreground++;
  }
  return foreground >= 35;
}

export const palmCopy = {
  he: {
    hand: ["איזו יד צולמה?", "ללא בחירה", "היד הדומיננטית שלי", "היד השנייה שלי"],
    main: "צלמו כף יד אחת פתוחה, מבסיס האצבעות עד שורש כף היד, באור אחיד.",
    more: "במה תרצו להעמיק?", unavailable: "הקריאה לא הושלמה. אפשר לנסות שוב.", busy: "הצילום בבדיקה…",
    limited: "הגעתם למכסת הקריאות לשעה. אפשר לחזור מאוחר יותר.", retake: "הפרט המבוקש אינו נראה בבירור. כדאי לצלם שוב.",
    heights: ["גובה האצבעות", "צלמו מלפנים על רקע חלק בצבע שונה מהיד. ישרו את האצבעות כלפי מעלה, כללו את בסיסיהן והשאירו פס רקע פנוי מעל כל הקצוות."],
    joints: ["החריצים במפרקים", "צלמו מקרוב את הצד הפנימי של אצבע אחת ישרה. כללו את שני המפרקים ואת קצה האצבע, ומקדו את המצלמה בקפלים."],
    edge: ["הקווים בצד כף היד", "סובבו מעט את אותה היד וצלמו מהצד של הזרת. כללו את בסיס הזרת ואת שפת הכף שמתחתיו. השאירו את היד רפויה."],
  },
  en: {
    hand: ["Which hand is pictured?", "No preference", "My dominant hand", "My other hand"],
    main: "Photograph one open palm from the finger bases to the wrist in even light.",
    more: "What would you like to explore?", unavailable: "The reading could not be completed. Please try again.", busy: "Examining the photo…",
    limited: "The hourly reading limit has been reached. Please try later.", retake: "The requested feature is hard to see. Please take another photo.",
    heights: ["Finger heights", "Photograph the palm straight on against a plain contrasting background. Point the fingers up, include their bases, and leave a clear strip of background above every tip."],
    joints: ["Joint creases", "Take a close-up of the palm side of one straight finger. Include both joints and the tip, and focus on the folds."],
    edge: ["Side of the palm", "Turn the same relaxed hand and photograph the little-finger side. Include the base of the little finger and the palm edge just below it."],
  },
  ru: {
    hand: ["Какая рука на снимке?", "Пропустить", "Моя ведущая рука", "Моя другая рука"],
    main: "Снимите раскрытую ладонь от основания пальцев до запястья при ровном свете.",
    more: "Что рассмотреть подробнее?", unavailable: "Не удалось завершить чтение. Попробуйте ещё раз.", busy: "Изучаем снимок…",
    limited: "Достигнут часовой лимит. Попробуйте позже.", retake: "Нужная деталь видна нечётко. Сделайте ещё один снимок.",
    heights: ["Высота пальцев", "Снимите ладонь прямо на однотонном контрастном фоне. Направьте пальцы вверх, включите их основания и оставьте полоску свободного фона над всеми кончиками."],
    joints: ["Складки на суставах", "Снимите крупным планом внутреннюю сторону одного выпрямленного пальца. Включите оба сустава и кончик, наведите резкость на складки."],
    edge: ["Линии на ребре ладони", "Поверните расслабленную руку и снимите её со стороны мизинца. Включите основание мизинца и ребро ладони под ним."],
  },
  ar: {
    hand: ["أي يد تظهر في الصورة؟", "تخطّي الاختيار", "يدي المهيمنة", "يدي الأخرى"],
    main: "صوّر كفاً واحدة مفتوحة من قواعد الأصابع إلى الرسغ في ضوء متجانس.",
    more: "ما الذي تود استكشافه؟", unavailable: "تعذّر إكمال القراءة. يمكنك المحاولة مجدداً.", busy: "يجري فحص الصورة…",
    limited: "بلغت الحد المتاح للقراءات في هذه الساعة. حاول لاحقاً.", retake: "التفصيل المطلوب غير واضح. يُرجى التقاط صورة أخرى.",
    heights: ["ارتفاع الأصابع", "صوّر الكف من الأمام أمام خلفية سادة يختلف لونها عن اليد. وجّه الأصابع إلى الأعلى وأظهر قواعدها واترك شريطاً واضحاً من الخلفية فوق جميع الأطراف."],
    joints: ["ثنيات المفاصل", "صوّر عن قرب الجانب الداخلي لإصبع واحد ممدود. أظهر المفصلين وطرف الإصبع وركّز على الثنيات."],
    edge: ["خطوط حافة الكف", "أدر اليد نفسها وهي مسترخية وصوّرها من جانب الخنصر. أظهر قاعدة الخنصر وحافة الكف أسفلها مباشرة."],
  },
} as const;
