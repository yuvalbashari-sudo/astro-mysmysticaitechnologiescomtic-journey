export const focusKeys = ["heights", "joints", "edge"] as const;
export type PalmFocus = typeof focusKeys[number];
export function isPalmFocus(value: unknown): value is PalmFocus {
  return focusKeys.some(key => key === value);
}

export const palmCopy = {
  he: {
    hand: ["איזו יד צולמה?", "ללא בחירה", "היד הדומיננטית שלי", "היד השנייה שלי"],
    main: "צלמו כף יד אחת פתוחה, מבסיס האצבעות עד שורש כף היד, באור אחיד.",
    more: "במה תרצו להעמיק?", unavailable: "הקריאה לא הושלמה. אפשר לנסות שוב.", busy: "הצילום בבדיקה…",
    limited: "הגעתם למכסת הקריאות לשעה. אפשר לחזור מאוחר יותר.", retake: "הפרט המבוקש אינו נראה בבירור. כדאי לצלם שוב.",
    heights: ["גובה האצבעות", "צלמו את אותה היד מלפנים. ישרו את האצבעות בנוחות וכללו את הבסיסים ואת כל הקצוות, כשהמצלמה מקבילה לכף היד."],
    joints: ["החריצים במפרקים", "צלמו מקרוב את הצד הפנימי של אצבע אחת ישרה. כללו את שני המפרקים ואת קצה האצבע, ומקדו את המצלמה בקפלים."],
    edge: ["הקווים בצד כף היד", "סובבו מעט את אותה היד וצלמו מהצד של הזרת. כללו את בסיס הזרת ואת שפת הכף שמתחתיו. השאירו את היד רפויה."],
  },
  en: {
    hand: ["Which hand is pictured?", "No preference", "My dominant hand", "My other hand"],
    main: "Photograph one open palm from the finger bases to the wrist in even light.",
    more: "What would you like to explore?", unavailable: "The reading could not be completed. Please try again.", busy: "Examining the photo…",
    limited: "The hourly reading limit has been reached. Please try later.", retake: "The requested feature is hard to see. Please take another photo.",
    heights: ["Finger heights", "Photograph the same palm straight on. Hold the fingers comfortably straight and include every tip and base, with the camera parallel to the palm."],
    joints: ["Joint creases", "Take a close-up of the palm side of one straight finger. Include both joints and the tip, and focus on the folds."],
    edge: ["Side of the palm", "Turn the same relaxed hand and photograph the little-finger side. Include the base of the little finger and the palm edge just below it."],
  },
  ru: {
    hand: ["Какая рука на снимке?", "Пропустить", "Моя ведущая рука", "Моя другая рука"],
    main: "Снимите раскрытую ладонь от основания пальцев до запястья при ровном свете.",
    more: "Что рассмотреть подробнее?", unavailable: "Не удалось завершить чтение. Попробуйте ещё раз.", busy: "Изучаем снимок…",
    limited: "Достигнут часовой лимит. Попробуйте позже.", retake: "Нужная деталь видна нечётко. Сделайте ещё один снимок.",
    heights: ["Высота пальцев", "Снимите ту же ладонь прямо. Свободно выпрямите пальцы и включите в кадр все кончики и основания. Держите камеру параллельно ладони."],
    joints: ["Складки на суставах", "Снимите крупным планом внутреннюю сторону одного выпрямленного пальца. Включите оба сустава и кончик, наведите резкость на складки."],
    edge: ["Линии на ребре ладони", "Поверните расслабленную руку и снимите её со стороны мизинца. Включите основание мизинца и ребро ладони под ним."],
  },
  ar: {
    hand: ["أي يد تظهر في الصورة؟", "تخطّي الاختيار", "يدي المهيمنة", "يدي الأخرى"],
    main: "صوّر كفاً واحدة مفتوحة من قواعد الأصابع إلى الرسغ في ضوء متجانس.",
    more: "ما الذي تود استكشافه؟", unavailable: "تعذّر إكمال القراءة. يمكنك المحاولة مجدداً.", busy: "يجري فحص الصورة…",
    limited: "بلغت الحد المتاح للقراءات في هذه الساعة. حاول لاحقاً.", retake: "التفصيل المطلوب غير واضح. يُرجى التقاط صورة أخرى.",
    heights: ["ارتفاع الأصابع", "صوّر الكف نفسها من الأمام. مدّ الأصابع براحة وأظهر جميع الأطراف والقواعد، مع إبقاء الكاميرا موازية للكف."],
    joints: ["ثنيات المفاصل", "صوّر عن قرب الجانب الداخلي لإصبع واحد ممدود. أظهر المفصلين وطرف الإصبع وركّز على الثنيات."],
    edge: ["خطوط حافة الكف", "أدر اليد نفسها وهي مسترخية وصوّرها من جانب الخنصر. أظهر قاعدة الخنصر وحافة الكف أسفلها مباشرة."],
  },
} as const;
