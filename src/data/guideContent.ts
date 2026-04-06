/**
 * Multilingual guide content for Tarot and Astrology guides.
 * Each guide stores translated fields per language (he, en, ru, ar).
 */
import type { Language } from "@/i18n/types";

export interface GuideSection {
  title: string;
  blocks?: string[];
  bullets?: string[];
}

export interface GuideEntry {
  slug: string;
  title: string;
  subtitle: string;
  icon: "tarot" | "astrology";
  heroEmoji: string;
  sections: GuideSection[];
  ctaText: string;
  ctaButton: string;
  ctaLink: string;
}

interface GuideTranslated {
  slug: string;
  icon: "tarot" | "astrology";
  heroEmoji: string;
  ctaLink: string;
  translations: Record<Language, {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaButton: string;
    sections: GuideSection[];
  }>;
}

function resolve(g: GuideTranslated, lang: Language): GuideEntry {
  const t = g.translations[lang] ?? g.translations.en;
  return {
    slug: g.slug,
    icon: g.icon,
    heroEmoji: g.heroEmoji,
    ctaLink: g.ctaLink,
    title: t.title,
    subtitle: t.subtitle,
    ctaText: t.ctaText,
    ctaButton: t.ctaButton,
    sections: t.sections,
  };
}

// ─── Tarot Guides (raw data) ────────────────────────────

const tarotGuidesData: GuideTranslated[] = [
  {
    slug: "tarot-getting-started",
    icon: "tarot",
    heroEmoji: "🃏",
    ctaLink: "/",
    translations: {
      he: {
        title: "איך להתחיל עם טארוט",
        subtitle: "המדריך המלא למתחילים – מהקלף הראשון ועד להבנה עמוקה",
        ctaText: "רוצים לראות את הקלפים בפעולה?",
        ctaButton: "התחילו קריאה אישית",
        sections: [
          { title: "מה זה טארוט?", blocks: ["טארוט הוא מערכת של 78 קלפים המשמשת ככלי להתבוננות פנימית, הכוונה רוחנית וחקירת תבניות בחיים.", "החפיסה מורכבת מ-22 קלפי ארקנה מאז׳ורית (אבני דרך גדולות) ו-56 קלפי ארקנה מינורית (חוויות יומיומיות).", "טארוט לא חוזה עתיד — הוא מגלה את מה שכבר קיים בתוככם ומעניק פרספקטיבה חדשה."] },
          { title: "איך לבחור חפיסה ראשונה?", blocks: ["למתחילים מומלץ להתחיל עם חפיסת ריידר-ווייט (Rider-Waite) — היא הנפוצה ביותר ויש לה את הסימבוליקה הברורה ביותר.", "בחרו חפיסה שמדברת אליכם ויזואלית. התחברות אישית לאיורים חשובה לא פחות מהמסורת."] },
          { title: "הצעדים הראשונים", bullets: ["הכירו את הקלפים — עברו עליהם אחד אחד, הסתכלו על הציורים", "שאלו שאלה פתוחה — לא ״כן/לא״ אלא ״מה אני צריך/ה לדעת על...?״", "משכו קלף אחד כל בוקר — זה תרגול מצוין ופשוט", "כתבו יומן טארוט — רשמו את הקלף, הרגש שעלה, ומה קרה באותו יום"] },
          { title: "טיפים חשובים", bullets: ["אין צורך לשנן את כל הפירושים — תנו לאינטואיציה לדבר", "אל תפחדו מקלפים ״שליליים״ — כל קלף נושא מסר בונה", "תרגלו על עצמכם לפני שאתם קוראים לאחרים", "היו סבלניים — לוקח זמן לפתח קשר עם החפיסה"] },
        ],
      },
      en: {
        title: "How to Get Started with Tarot",
        subtitle: "The complete beginner's guide — from your first card to deep understanding",
        ctaText: "Want to see the cards in action?",
        ctaButton: "Start a Personal Reading",
        sections: [
          { title: "What is Tarot?", blocks: ["Tarot is a system of 78 cards used as a tool for self-reflection, spiritual guidance, and exploring life patterns.", "The deck consists of 22 Major Arcana cards (major milestones) and 56 Minor Arcana cards (everyday experiences).", "Tarot doesn't predict the future — it reveals what already exists within you and offers a new perspective."] },
          { title: "How to Choose Your First Deck?", blocks: ["Beginners are recommended to start with the Rider-Waite deck — it's the most popular and has the clearest symbolism.", "Choose a deck that speaks to you visually. A personal connection to the artwork is just as important as tradition."] },
          { title: "First Steps", bullets: ["Get to know the cards — go through them one by one, look at the illustrations", "Ask an open-ended question — not 'yes/no' but 'What do I need to know about...?'", "Pull one card every morning — it's an excellent and simple practice", "Keep a tarot journal — note the card, the feeling that arose, and what happened that day"] },
          { title: "Important Tips", bullets: ["No need to memorize all meanings — let intuition speak", "Don't fear 'negative' cards — every card carries a constructive message", "Practice on yourself before reading for others", "Be patient — it takes time to develop a connection with the deck"] },
        ],
      },
      ru: {
        title: "Как начать работу с Таро",
        subtitle: "Полное руководство для начинающих — от первой карты до глубокого понимания",
        ctaText: "Хотите увидеть карты в действии?",
        ctaButton: "Начать личное чтение",
        sections: [
          { title: "Что такое Таро?", blocks: ["Таро — это система из 78 карт, используемая как инструмент для самоанализа, духовного руководства и исследования жизненных закономерностей.", "Колода состоит из 22 карт Старших Арканов (важные вехи) и 56 карт Младших Арканов (повседневный опыт).", "Таро не предсказывает будущее — оно раскрывает то, что уже существует внутри вас, и предлагает новую перспективу."] },
          { title: "Как выбрать первую колоду?", blocks: ["Начинающим рекомендуется колода Райдера-Уэйта — она самая популярная и имеет самую понятную символику.", "Выберите колоду, которая визуально вам откликается. Личная связь с рисунками не менее важна, чем традиция."] },
          { title: "Первые шаги", bullets: ["Познакомьтесь с картами — пройдите их одну за другой, рассмотрите рисунки", "Задайте открытый вопрос — не «да/нет», а «Что мне нужно знать о...?»", "Тяните одну карту каждое утро — это отличная и простая практика", "Ведите дневник Таро — запишите карту, ощущение и что произошло в тот день"] },
          { title: "Важные советы", bullets: ["Не нужно заучивать все значения — дайте интуиции говорить", "Не бойтесь «негативных» карт — каждая карта несёт конструктивное послание", "Практикуйтесь на себе, прежде чем читать другим", "Будьте терпеливы — нужно время, чтобы установить связь с колодой"] },
        ],
      },
      ar: {
        title: "كيف تبدأ مع التاروت",
        subtitle: "الدليل الكامل للمبتدئين — من البطاقة الأولى إلى الفهم العميق",
        ctaText: "هل تريد رؤية البطاقات في العمل؟",
        ctaButton: "ابدأ قراءة شخصية",
        sections: [
          { title: "ما هو التاروت؟", blocks: ["التاروت هو نظام من 78 بطاقة يُستخدم كأداة للتأمل الذاتي والإرشاد الروحي واستكشاف أنماط الحياة.", "تتكون المجموعة من 22 بطاقة أركانا كبرى (معالم رئيسية) و56 بطاقة أركانا صغرى (تجارب يومية).", "التاروت لا يتنبأ بالمستقبل — بل يكشف ما هو موجود بداخلك ويمنحك منظورًا جديدًا."] },
          { title: "كيف تختار مجموعتك الأولى؟", blocks: ["يُنصح المبتدئون بالبدء بمجموعة رايدر-ويت — وهي الأكثر شيوعًا ولديها أوضح رموز.", "اختر مجموعة تتحدث إليك بصريًا. الارتباط الشخصي بالرسومات لا يقل أهمية عن التقاليد."] },
          { title: "الخطوات الأولى", bullets: ["تعرّف على البطاقات — مرّ عليها واحدة تلو الأخرى وانظر إلى الرسومات", "اطرح سؤالًا مفتوحًا — ليس «نعم/لا» بل «ما الذي أحتاج معرفته عن...؟»", "اسحب بطاقة واحدة كل صباح — إنها ممارسة ممتازة وبسيطة", "احتفظ بمفكرة تاروت — سجّل البطاقة والشعور وما حدث في ذلك اليوم"] },
          { title: "نصائح مهمة", bullets: ["لا حاجة لحفظ كل المعاني — دع الحدس يتحدث", "لا تخف من البطاقات «السلبية» — كل بطاقة تحمل رسالة بنّاءة", "تدرّب على نفسك قبل القراءة للآخرين", "كن صبورًا — يستغرق الأمر وقتًا لتطوير علاقة مع المجموعة"] },
        ],
      },
    },
  },
  {
    slug: "tarot-three-card-spread",
    icon: "tarot",
    heroEmoji: "🔮",
    ctaLink: "/",
    translations: {
      he: {
        title: "פתיחה של 3 קלפים",
        subtitle: "עבר, הווה, עתיד — הפריסה הבסיסית והחזקה ביותר",
        ctaText: "רוצים לנסות פריסה עכשיו?",
        ctaButton: "פתחו פריסת טארוט",
        sections: [
          { title: "למה 3 קלפים?", blocks: ["פריסת שלושת הקלפים היא הפריסה הפופולרית ביותר בטארוט. היא פשוטה, ממוקדת ומעניקה תמונה שלמה.", "כל קלף מייצג ציר זמן: עבר, הווה ועתיד — כך שאפשר לראות את המסע השלם."] },
          { title: "איך עושים את זה?", bullets: ["שאלו שאלה ברורה וממוקדת", "ערבבו את הקלפים תוך כדי חשיבה על השאלה", "משכו 3 קלפים והניחו אותם משמאל לימין", "קלף 1 = עבר (מה השפיע), קלף 2 = הווה (מה קורה עכשיו), קלף 3 = עתיד (לאן זה מוביל)"] },
          { title: "איך לפרש?", blocks: ["התחילו מהקלף האמצעי (הווה) — הוא המצב הנוכחי שלכם. אחר כך הסתכלו על העבר כדי להבין את השורש, ועל העתיד כדי לראות את הכיוון.", "חפשו קשרים בין הקלפים — האם יש נושא חוזר? יסוד דומיננטי? מספר שחוזר?", "אל תפרשו כל קלף בנפרד — הסיפור הוא בחיבור ביניהם."] },
          { title: "וריאציות פופולריות", bullets: ["מצב / אתגר / עצה", "גוף / נפש / רוח", "מה לעשות / מה לא לעשות / מה לשים לב", "אני / הזולת / הקשר"] },
        ],
      },
      en: {
        title: "The 3-Card Spread",
        subtitle: "Past, Present, Future — the most fundamental and powerful spread",
        ctaText: "Want to try a spread now?",
        ctaButton: "Open a Tarot Spread",
        sections: [
          { title: "Why 3 Cards?", blocks: ["The three-card spread is the most popular spread in tarot. It's simple, focused, and gives a complete picture.", "Each card represents a time axis: past, present, and future — allowing you to see the entire journey."] },
          { title: "How to Do It?", bullets: ["Ask a clear and focused question", "Shuffle the cards while thinking about the question", "Draw 3 cards and place them left to right", "Card 1 = Past (what influenced), Card 2 = Present (what's happening now), Card 3 = Future (where it leads)"] },
          { title: "How to Interpret?", blocks: ["Start with the middle card (present) — it's your current situation. Then look at the past to understand the root, and the future to see the direction.", "Look for connections between the cards — is there a recurring theme? A dominant element? A repeating number?", "Don't interpret each card separately — the story is in the connection between them."] },
          { title: "Popular Variations", bullets: ["Situation / Challenge / Advice", "Body / Mind / Spirit", "What to do / What not to do / What to notice", "Self / Other / The Relationship"] },
        ],
      },
      ru: {
        title: "Расклад на 3 карты",
        subtitle: "Прошлое, Настоящее, Будущее — самый базовый и мощный расклад",
        ctaText: "Хотите попробовать расклад сейчас?",
        ctaButton: "Открыть расклад Таро",
        sections: [
          { title: "Почему 3 карты?", blocks: ["Расклад на три карты — самый популярный в Таро. Он прост, сфокусирован и даёт полную картину.", "Каждая карта представляет ось времени: прошлое, настоящее и будущее — позволяя увидеть весь путь."] },
          { title: "Как это делать?", bullets: ["Задайте ясный и сфокусированный вопрос", "Тасуйте карты, думая о вопросе", "Вытяните 3 карты и разложите их слева направо", "Карта 1 = Прошлое (что повлияло), Карта 2 = Настоящее (что происходит), Карта 3 = Будущее (куда ведёт)"] },
          { title: "Как интерпретировать?", blocks: ["Начните со средней карты (настоящее) — это ваша текущая ситуация. Затем посмотрите на прошлое, чтобы понять корень, и на будущее, чтобы увидеть направление.", "Ищите связи между картами — есть ли повторяющаяся тема? Доминирующая стихия? Повторяющееся число?", "Не интерпретируйте каждую карту отдельно — история в связи между ними."] },
          { title: "Популярные вариации", bullets: ["Ситуация / Вызов / Совет", "Тело / Разум / Дух", "Что делать / Чего не делать / На что обратить внимание", "Я / Другой / Отношения"] },
        ],
      },
      ar: {
        title: "فتح 3 بطاقات",
        subtitle: "الماضي، الحاضر، المستقبل — أبسط وأقوى توزيع",
        ctaText: "هل تريد تجربة توزيع الآن؟",
        ctaButton: "افتح توزيع تاروت",
        sections: [
          { title: "لماذا 3 بطاقات؟", blocks: ["توزيع البطاقات الثلاث هو الأكثر شعبية في التاروت. بسيط ومركّز ويعطي صورة كاملة.", "كل بطاقة تمثل محورًا زمنيًا: الماضي والحاضر والمستقبل — مما يتيح رؤية الرحلة كاملة."] },
          { title: "كيف تفعل ذلك؟", bullets: ["اطرح سؤالًا واضحًا ومركّزًا", "اخلط البطاقات أثناء التفكير في السؤال", "اسحب 3 بطاقات وضعها من اليسار إلى اليمين", "بطاقة 1 = الماضي (ما أثّر)، بطاقة 2 = الحاضر (ما يحدث)، بطاقة 3 = المستقبل (إلى أين يقود)"] },
          { title: "كيف تفسّر؟", blocks: ["ابدأ بالبطاقة الوسطى (الحاضر) — هي وضعك الحالي. ثم انظر إلى الماضي لفهم الجذر، وإلى المستقبل لرؤية الاتجاه.", "ابحث عن روابط بين البطاقات — هل هناك موضوع متكرر؟ عنصر مهيمن؟ رقم يتكرر؟", "لا تفسّر كل بطاقة على حدة — القصة في الربط بينها."] },
          { title: "تنويعات شائعة", bullets: ["الموقف / التحدي / النصيحة", "الجسد / العقل / الروح", "ما يجب فعله / ما يجب تجنّبه / ما يجب ملاحظته", "أنا / الآخر / العلاقة"] },
        ],
      },
    },
  },
  {
    slug: "tarot-asking-questions",
    icon: "tarot",
    heroEmoji: "❓",
    ctaLink: "/",
    translations: {
      he: {
        title: "איך לשאול שאלות נכונות",
        subtitle: "האמנות של ניסוח שאלה שתוביל לתשובה משמעותית",
        ctaText: "מוכנים לשאול את השאלה שלכם?",
        ctaButton: "התחילו קריאה",
        sections: [
          { title: "למה הניסוח חשוב?", blocks: ["שאלה טובה היא חצי מהתשובה. ניסוח מדויק מוביל לקריאה ממוקדת ובעלת ערך אמיתי.", "שאלות פתוחות עובדות הרבה יותר טוב משאלות סגורות (כן/לא)."] },
          { title: "שאלות שעובדות", bullets: ["״מה אני צריך/ה לדעת על...?״", "״איך אני יכול/ה להתקדם ב...?״", "״מה חוסם אותי ב...?״", "״מה האנרגיה הנכונה עבורי עכשיו?״", "״מה הלקח שאני צריך/ה ללמוד מ...?״"] },
          { title: "שאלות שכדאי להימנע מהן", bullets: ["שאלות כן/לא — ״האם הוא אוהב אותי?״ → עדיף: ״מה אני צריכ/ה לדעת על הקשר הזה?״", "שאלות על תזמון — ״מתי זה יקרה?״ → עדיף: ״מה יעזור לי להתקדם לעבר...?״", "שאלות על אנשים אחרים — ״מה הוא/היא חושב/ת?״ → עדיף: ״מה אני יכול/ה לעשות כדי לשפר את...?״"] },
          { title: "טיפ מתקדם", blocks: ["לפני שאתם שואלים — שבו רגע בשקט. נשמו עמוק. תנו לשאלה לעלות מתוככם באופן טבעי, לא מהראש אלא מהלב."] },
        ],
      },
      en: {
        title: "How to Ask the Right Questions",
        subtitle: "The art of framing a question that leads to a meaningful answer",
        ctaText: "Ready to ask your question?",
        ctaButton: "Start a Reading",
        sections: [
          { title: "Why Does Wording Matter?", blocks: ["A good question is half the answer. Precise wording leads to a focused and truly valuable reading.", "Open-ended questions work much better than closed ones (yes/no)."] },
          { title: "Questions That Work", bullets: ["'What do I need to know about...?'", "'How can I move forward with...?'", "'What is blocking me in...?'", "'What is the right energy for me right now?'", "'What lesson do I need to learn from...?'"] },
          { title: "Questions to Avoid", bullets: ["Yes/No questions — 'Does he love me?' → Better: 'What do I need to know about this relationship?'", "Timing questions — 'When will it happen?' → Better: 'What will help me progress toward...?'", "Questions about others — 'What is he/she thinking?' → Better: 'What can I do to improve...?'"] },
          { title: "Advanced Tip", blocks: ["Before you ask — sit quietly for a moment. Breathe deeply. Let the question arise naturally from within, not from the head but from the heart."] },
        ],
      },
      ru: {
        title: "Как задавать правильные вопросы",
        subtitle: "Искусство формулировки вопроса, ведущего к значимому ответу",
        ctaText: "Готовы задать свой вопрос?",
        ctaButton: "Начать чтение",
        sections: [
          { title: "Почему формулировка важна?", blocks: ["Хороший вопрос — это половина ответа. Точная формулировка ведёт к сфокусированному и по-настоящему ценному чтению.", "Открытые вопросы работают гораздо лучше закрытых (да/нет)."] },
          { title: "Вопросы, которые работают", bullets: ["«Что мне нужно знать о...?»", "«Как я могу продвинуться в...?»", "«Что мне мешает в...?»", "«Какая энергия мне подходит сейчас?»", "«Какой урок мне нужно извлечь из...?»"] },
          { title: "Вопросы, которых стоит избегать", bullets: ["Вопросы да/нет — «Он меня любит?» → Лучше: «Что мне нужно знать об этих отношениях?»", "Вопросы о времени — «Когда это случится?» → Лучше: «Что поможет мне продвинуться к...?»", "Вопросы о других — «Что он/она думает?» → Лучше: «Что я могу сделать, чтобы улучшить...?»"] },
          { title: "Продвинутый совет", blocks: ["Прежде чем спрашивать — сядьте спокойно на минуту. Глубоко вдохните. Позвольте вопросу возникнуть изнутри естественно, не из головы, а из сердца."] },
        ],
      },
      ar: {
        title: "كيف تطرح الأسئلة الصحيحة",
        subtitle: "فن صياغة سؤال يؤدي إلى إجابة ذات معنى",
        ctaText: "مستعد لطرح سؤالك؟",
        ctaButton: "ابدأ القراءة",
        sections: [
          { title: "لماذا الصياغة مهمة؟", blocks: ["السؤال الجيد هو نصف الإجابة. الصياغة الدقيقة تؤدي إلى قراءة مركّزة وذات قيمة حقيقية.", "الأسئلة المفتوحة تعمل بشكل أفضل بكثير من الأسئلة المغلقة (نعم/لا)."] },
          { title: "أسئلة ناجحة", bullets: ["«ما الذي أحتاج معرفته عن...؟»", "«كيف يمكنني التقدم في...؟»", "«ما الذي يعيقني في...؟»", "«ما الطاقة المناسبة لي الآن؟»", "«ما الدرس الذي أحتاج تعلّمه من...؟»"] },
          { title: "أسئلة يجب تجنّبها", bullets: ["أسئلة نعم/لا — «هل يحبني؟» → أفضل: «ما الذي أحتاج معرفته عن هذه العلاقة؟»", "أسئلة عن التوقيت — «متى سيحدث؟» → أفضل: «ما الذي سيساعدني على التقدم نحو...؟»", "أسئلة عن الآخرين — «ماذا يفكر/تفكر؟» → أفضل: «ما الذي يمكنني فعله لتحسين...؟»"] },
          { title: "نصيحة متقدمة", blocks: ["قبل أن تسأل — اجلس بهدوء للحظة. تنفّس بعمق. دع السؤال يظهر من داخلك بشكل طبيعي، ليس من العقل بل من القلب."] },
        ],
      },
    },
  },
  {
    slug: "tarot-common-mistakes",
    icon: "tarot",
    heroEmoji: "⚠️",
    ctaLink: "/",
    translations: {
      he: {
        title: "טעויות נפוצות בקריאת טארוט",
        subtitle: "הימנעו מהמלכודות הנפוצות ושפרו את הקריאות שלכם",
        ctaText: "מרגישים מוכנים?",
        ctaButton: "נסו קריאה אישית",
        sections: [
          { title: "טעויות שכמעט כולם עושים", bullets: ["לקרוא בפאניקה — קריאה מתוך פחד נותנת תוצאות מעוותות", "לחזור על אותה שאלה שוב ושוב — כשלא אוהבים את התשובה", "לפרש הכל באופן מילולי — טארוט מדבר בסמלים, לא בעובדות", "להתעלם מהאינטואיציה — הרגש הראשוני לפעמים חשוב מהפירוש הטכני", "לשפוט קלפים כ״טובים״ או ״רעים״ — כל קלף נושא מסר שלם"] },
          { title: "איך להימנע?", blocks: ["קראו מתוך מקום רגוע ופתוח. אם אתם מרגישים לחץ — חכו ליום אחר.", "קבלו את התשובה שעולה, גם אם היא לא מה שרציתם לשמוע. זה בדיוק הערך של טארוט.", "תרגלו ״קריאה ללא ספר״ — הסתכלו על הקלף ותארו מה אתם רואים לפני שאתם בודקים את הפירוש."] },
          { title: "טעויות טכניות", bullets: ["לערבב יותר מדי — 10-15 ערבובים מספיקים", "לפתוח יותר מדי קלפים — פריסה גדולה לא אומרת קריאה טובה יותר", "להתעלם מהמיקום — קלף הפוך נושא משמעות שונה", "לא לנקות את החפיסה — חשוב לאפס אנרגיות בין קריאות"] },
        ],
      },
      en: {
        title: "Common Tarot Reading Mistakes",
        subtitle: "Avoid common pitfalls and improve your readings",
        ctaText: "Feeling ready?",
        ctaButton: "Try a Personal Reading",
        sections: [
          { title: "Mistakes Almost Everyone Makes", bullets: ["Reading in panic — reading from fear gives distorted results", "Repeating the same question — when you don't like the answer", "Interpreting everything literally — tarot speaks in symbols, not facts", "Ignoring intuition — the first feeling is sometimes more important than the technical meaning", "Judging cards as 'good' or 'bad' — every card carries a complete message"] },
          { title: "How to Avoid Them?", blocks: ["Read from a calm and open place. If you feel stressed — wait for another day.", "Accept the answer that comes, even if it's not what you wanted to hear. That's exactly the value of tarot.", "Practice 'reading without a book' — look at the card and describe what you see before checking the meaning."] },
          { title: "Technical Mistakes", bullets: ["Shuffling too much — 10-15 shuffles are enough", "Drawing too many cards — a large spread doesn't mean a better reading", "Ignoring position — a reversed card carries a different meaning", "Not cleansing the deck — it's important to reset energies between readings"] },
        ],
      },
      ru: {
        title: "Распространённые ошибки при чтении Таро",
        subtitle: "Избегайте типичных ловушек и улучшайте свои чтения",
        ctaText: "Чувствуете себя готовым?",
        ctaButton: "Попробуйте личное чтение",
        sections: [
          { title: "Ошибки, которые совершают почти все", bullets: ["Чтение в панике — чтение из страха даёт искажённые результаты", "Повторение одного и того же вопроса — когда не нравится ответ", "Буквальная интерпретация — Таро говорит символами, а не фактами", "Игнорирование интуиции — первое ощущение иногда важнее технического значения", "Оценка карт как «хороших» или «плохих» — каждая карта несёт полное послание"] },
          { title: "Как избежать?", blocks: ["Читайте из спокойного и открытого состояния. Если чувствуете стресс — подождите другого дня.", "Примите ответ, который приходит, даже если он не тот, что вы хотели услышать. В этом и ценность Таро.", "Практикуйте «чтение без книги» — смотрите на карту и описывайте, что видите, прежде чем проверять значение."] },
          { title: "Технические ошибки", bullets: ["Слишком много тасований — 10-15 перемешиваний достаточно", "Слишком много карт — большой расклад не значит лучшее чтение", "Игнорирование позиции — перевёрнутая карта имеет другое значение", "Не очищать колоду — важно сбрасывать энергии между чтениями"] },
        ],
      },
      ar: {
        title: "أخطاء شائعة في قراءة التاروت",
        subtitle: "تجنّب الأخطاء الشائعة وحسّن قراءاتك",
        ctaText: "تشعر بالاستعداد؟",
        ctaButton: "جرّب قراءة شخصية",
        sections: [
          { title: "أخطاء يرتكبها الجميع تقريبًا", bullets: ["القراءة في حالة ذعر — القراءة من الخوف تعطي نتائج مشوّهة", "تكرار نفس السؤال — عندما لا تعجبك الإجابة", "تفسير كل شيء حرفيًا — التاروت يتحدث بالرموز وليس بالحقائق", "تجاهل الحدس — الشعور الأول أحيانًا أهم من المعنى التقني", "الحكم على البطاقات بأنها «جيدة» أو «سيئة» — كل بطاقة تحمل رسالة كاملة"] },
          { title: "كيف تتجنب ذلك؟", blocks: ["اقرأ من مكان هادئ ومنفتح. إذا شعرت بالتوتر — انتظر يومًا آخر.", "تقبّل الإجابة التي تأتي حتى لو لم تكن ما أردت سماعه. هذه بالضبط قيمة التاروت.", "تدرّب على «القراءة بدون كتاب» — انظر إلى البطاقة وصف ما تراه قبل مراجعة المعنى."] },
          { title: "أخطاء تقنية", bullets: ["الخلط كثيرًا — 10-15 خلطة كافية", "سحب بطاقات كثيرة — التوزيع الكبير لا يعني قراءة أفضل", "تجاهل الموضع — البطاقة المقلوبة تحمل معنى مختلفًا", "عدم تنظيف المجموعة — من المهم إعادة ضبط الطاقات بين القراءات"] },
        ],
      },
    },
  },
];

// ─── Astrology Guides (raw data) ────────────────────────

const astrologyGuidesData: GuideTranslated[] = [
  {
    slug: "astro-reading-chart",
    icon: "astrology",
    heroEmoji: "🌌",
    ctaLink: "/",
    translations: {
      he: {
        title: "איך לקרוא מפה אסטרולוגית",
        subtitle: "המדריך המלא להבנת מפת הלידה שלכם",
        ctaText: "רוצים לראות את המפה שלכם?",
        ctaButton: "צרו מפת לידה",
        sections: [
          { title: "מה זו מפה אסטרולוגית?", blocks: ["מפה אסטרולוגית (מפת לידה / נטאל צ׳ארט) היא תמונת מצב של השמיים ברגע שנולדתם. היא מראה היכן היו כוכבי הלכת, באיזה מזל ובאיזה בית.", "המפה היא ייחודית לכם — אין שתי מפות זהות. היא כמו טביעת אצבע קוסמית."] },
          { title: "שלושת השחקנים הראשיים", bullets: ["מזל שמש ☉ — המהות שלכם, הזהות המרכזית", "מזל ירח ☽ — העולם הרגשי, מה שאתם צריכים כדי להרגיש בטוחים", "מזל עולה (אסנדנט) ⬆ — הפנים שאתם מציגים לעולם, הרושם הראשוני"] },
          { title: "מעבר לשלישייה", blocks: ["כל כוכב לכת במפה משפיע על תחום אחר בחיים: מרקורי על תקשורת, ונוס על אהבה, מאדים על אנרגיה ודחף.", "כוכבי הלכת החיצוניים (יופיטר, שבתאי, אורנוס, נפטון, פלוטו) משפיעים על תבניות עמוקות יותר ושינויים ארוכי טווח."] },
          { title: "איך לקרוא את המפה?", bullets: ["התחילו מהשמש, הירח והעולה — הם נותנים את התמונה הרחבה", "בדקו באיזה בית נמצא כל כוכב — הבית מראה באיזה תחום הכוכב פועל", "חפשו היבטים (aspects) — קשרים בין כוכבים שיוצרים מתחים או הרמוניות", "שימו לב ליסודות הדומיננטיים — אש, אדמה, אוויר, מים"] },
        ],
      },
      en: {
        title: "How to Read an Astrological Chart",
        subtitle: "The complete guide to understanding your birth chart",
        ctaText: "Want to see your chart?",
        ctaButton: "Create a Birth Chart",
        sections: [
          { title: "What is an Astrological Chart?", blocks: ["An astrological chart (birth chart / natal chart) is a snapshot of the sky at the moment you were born. It shows where the planets were, in which sign and in which house.", "The chart is unique to you — no two charts are identical. It's like a cosmic fingerprint."] },
          { title: "The Three Main Players", bullets: ["Sun sign ☉ — Your essence, your core identity", "Moon sign ☽ — Your emotional world, what you need to feel safe", "Rising sign (Ascendant) ⬆ — The face you present to the world, the first impression"] },
          { title: "Beyond the Big Three", blocks: ["Every planet in the chart influences a different area of life: Mercury rules communication, Venus rules love, Mars rules energy and drive.", "The outer planets (Jupiter, Saturn, Uranus, Neptune, Pluto) influence deeper patterns and long-term changes."] },
          { title: "How to Read the Chart?", bullets: ["Start with Sun, Moon and Rising — they give the broad picture", "Check which house each planet is in — the house shows in which area the planet operates", "Look for aspects — connections between planets that create tensions or harmonies", "Notice the dominant elements — Fire, Earth, Air, Water"] },
        ],
      },
      ru: {
        title: "Как читать астрологическую карту",
        subtitle: "Полное руководство по пониманию вашей натальной карты",
        ctaText: "Хотите увидеть свою карту?",
        ctaButton: "Создать натальную карту",
        sections: [
          { title: "Что такое астрологическая карта?", blocks: ["Астрологическая карта (натальная карта) — это снимок неба в момент вашего рождения. Она показывает, где находились планеты, в каком знаке и в каком доме.", "Карта уникальна для вас — нет двух одинаковых карт. Она как космический отпечаток пальца."] },
          { title: "Три главных игрока", bullets: ["Знак Солнца ☉ — ваша сущность, основная идентичность", "Знак Луны ☽ — ваш эмоциональный мир, что вам нужно для чувства безопасности", "Восходящий знак (Асцендент) ⬆ — лицо, которое вы показываете миру, первое впечатление"] },
          { title: "За пределами большой тройки", blocks: ["Каждая планета в карте влияет на разную сферу жизни: Меркурий — на общение, Венера — на любовь, Марс — на энергию и мотивацию.", "Внешние планеты (Юпитер, Сатурн, Уран, Нептун, Плутон) влияют на более глубокие модели и долгосрочные изменения."] },
          { title: "Как читать карту?", bullets: ["Начните с Солнца, Луны и Асцендента — они дают общую картину", "Проверьте, в каком доме каждая планета — дом показывает, в какой сфере планета действует", "Ищите аспекты — связи между планетами, создающие напряжения или гармонии", "Обратите внимание на доминирующие стихии — Огонь, Земля, Воздух, Вода"] },
        ],
      },
      ar: {
        title: "كيف تقرأ خريطة فلكية",
        subtitle: "الدليل الكامل لفهم خريطة ميلادك",
        ctaText: "هل تريد رؤية خريطتك؟",
        ctaButton: "أنشئ خريطة ميلاد",
        sections: [
          { title: "ما هي الخريطة الفلكية؟", blocks: ["الخريطة الفلكية (خريطة الميلاد) هي لقطة للسماء في لحظة ولادتك. تُظهر أين كانت الكواكب، في أي برج وفي أي بيت.", "الخريطة فريدة لك — لا توجد خريطتان متطابقتان. إنها مثل بصمة كونية."] },
          { title: "اللاعبون الثلاثة الرئيسيون", bullets: ["برج الشمس ☉ — جوهرك وهويتك الأساسية", "برج القمر ☽ — عالمك العاطفي وما تحتاجه للشعور بالأمان", "البرج الطالع (الأسندنت) ⬆ — الوجه الذي تقدّمه للعالم والانطباع الأول"] },
          { title: "ما وراء الثلاثة الكبار", blocks: ["كل كوكب في الخريطة يؤثر على مجال مختلف في الحياة: عطارد يحكم التواصل، الزهرة تحكم الحب، المريخ يحكم الطاقة والدافع.", "الكواكب الخارجية (المشتري، زحل، أورانوس، نبتون، بلوتو) تؤثر على أنماط أعمق وتغييرات طويلة الأمد."] },
          { title: "كيف تقرأ الخريطة؟", bullets: ["ابدأ بالشمس والقمر والطالع — يعطونك الصورة العامة", "تحقق من البيت الذي يوجد فيه كل كوكب — البيت يُظهر في أي مجال يعمل الكوكب", "ابحث عن الجوانب — روابط بين الكواكب تخلق توترات أو انسجامات", "لاحظ العناصر المهيمنة — النار، الأرض، الهواء، الماء"] },
        ],
      },
    },
  },
  {
    slug: "astro-rising-sign",
    icon: "astrology",
    heroEmoji: "⬆️",
    ctaLink: "/",
    translations: {
      he: {
        title: "מה זה מזל עולה?",
        subtitle: "גלו את השכבה הנסתרת שמעצבת את הרושם שאתם עושים",
        ctaText: "רוצים לגלות את המזל העולה שלכם?",
        ctaButton: "צרו מפת לידה",
        sections: [
          { title: "מזל עולה — ההגדרה", blocks: ["מזל עולה (אסנדנט) הוא המזל שעלה באופק המזרחי ברגע המדויק שנולדתם. הוא נקבע לפי שעת ומקום הלידה.", "בעוד מזל השמש הוא ״מי שאתם״, מזל העולה הוא ״איך העולם רואה אתכם״."] },
          { title: "למה הוא כל כך חשוב?", bullets: ["הוא קובע את מבנה הבתים במפה — ולכן משפיע על כל שאר הפירושים", "הוא מעצב את הרושם הראשוני שאתם עושים על אנשים", "הוא משפיע על המראה החיצוני ושפת הגוף", "הוא מייצג את הגישה שלכם לחיים ואת האופן שבו אתם ניגשים לדברים חדשים"] },
          { title: "דוגמאות", blocks: ["שמש באריה עם עולה בסרטן — מבפנים ביטחון ועוצמה, מבחוץ רגישות וחמימות.", "שמש בבתולה עם עולה באריה — מבפנים דייקנות ותשומת לב לפרטים, מבחוץ נוכחות דרמטית ובולטת.", "הפער בין השמש לעולה יוצר עומק — זה מה שהופך כל אדם למורכב ומעניין."] },
          { title: "איך לגלות את המזל העולה?", blocks: ["כדי לדעת את מזל העולה שלכם, אתם צריכים שלושה דברים: תאריך לידה, שעת לידה מדויקת ומקום לידה.", "בלי שעת לידה מדויקת, אי אפשר לחשב את האסנדנט — וזו אחת הסיבות שהוא כל כך מיוחד."] },
        ],
      },
      en: {
        title: "What is a Rising Sign?",
        subtitle: "Discover the hidden layer that shapes the impression you make",
        ctaText: "Want to discover your rising sign?",
        ctaButton: "Create a Birth Chart",
        sections: [
          { title: "Rising Sign — Definition", blocks: ["The rising sign (Ascendant) is the sign that was rising on the eastern horizon at the exact moment you were born. It's determined by your birth time and location.", "While your Sun sign is 'who you are', your Rising sign is 'how the world sees you'."] },
          { title: "Why is It So Important?", bullets: ["It determines the house structure in the chart — influencing all other interpretations", "It shapes the first impression you make on people", "It affects your physical appearance and body language", "It represents your approach to life and how you tackle new things"] },
          { title: "Examples", blocks: ["Sun in Leo with Rising in Cancer — inside: confidence and power; outside: sensitivity and warmth.", "Sun in Virgo with Rising in Leo — inside: precision and attention to detail; outside: dramatic and striking presence.", "The gap between Sun and Rising creates depth — that's what makes every person complex and fascinating."] },
          { title: "How to Find Your Rising Sign?", blocks: ["To find your rising sign, you need three things: birth date, exact birth time, and birth location.", "Without an exact birth time, the Ascendant cannot be calculated — that's one reason it's so special."] },
        ],
      },
      ru: {
        title: "Что такое восходящий знак?",
        subtitle: "Откройте скрытый слой, который формирует впечатление о вас",
        ctaText: "Хотите узнать свой восходящий знак?",
        ctaButton: "Создать натальную карту",
        sections: [
          { title: "Восходящий знак — определение", blocks: ["Восходящий знак (Асцендент) — это знак, восходивший на восточном горизонте в точный момент вашего рождения. Он определяется временем и местом рождения.", "Если знак Солнца — это «кто вы есть», то восходящий знак — это «как мир вас видит»."] },
          { title: "Почему он так важен?", bullets: ["Он определяет структуру домов в карте — влияя на все остальные интерпретации", "Он формирует первое впечатление, которое вы производите", "Он влияет на внешний вид и язык тела", "Он представляет ваш подход к жизни и то, как вы берётесь за новое"] },
          { title: "Примеры", blocks: ["Солнце во Льве с Асцендентом в Раке — внутри: уверенность и сила; снаружи: чувствительность и теплота.", "Солнце в Деве с Асцендентом во Льве — внутри: точность и внимание к деталям; снаружи: драматичное и яркое присутствие.", "Разрыв между Солнцем и Асцендентом создаёт глубину — именно это делает каждого человека сложным и интересным."] },
          { title: "Как узнать свой восходящий знак?", blocks: ["Чтобы узнать свой восходящий знак, вам нужны три вещи: дата рождения, точное время рождения и место рождения.", "Без точного времени рождения Асцендент не может быть рассчитан — это одна из причин, почему он такой особенный."] },
        ],
      },
      ar: {
        title: "ما هو البرج الطالع؟",
        subtitle: "اكتشف الطبقة الخفية التي تشكّل الانطباع الذي تتركه",
        ctaText: "هل تريد اكتشاف برجك الطالع؟",
        ctaButton: "أنشئ خريطة ميلاد",
        sections: [
          { title: "البرج الطالع — التعريف", blocks: ["البرج الطالع (الأسندنت) هو البرج الذي كان يرتفع في الأفق الشرقي في اللحظة الدقيقة لولادتك. يتحدد بوقت ومكان الولادة.", "بينما برج الشمس هو «من أنت»، فإن البرج الطالع هو «كيف يراك العالم»."] },
          { title: "لماذا هو مهم جدًا؟", bullets: ["يحدد بنية البيوت في الخريطة — مما يؤثر على جميع التفسيرات الأخرى", "يشكّل الانطباع الأول الذي تتركه على الآخرين", "يؤثر على المظهر الخارجي ولغة الجسد", "يمثل نهجك في الحياة وكيفية تعاملك مع الأشياء الجديدة"] },
          { title: "أمثلة", blocks: ["شمس في الأسد مع طالع في السرطان — من الداخل: ثقة وقوة؛ من الخارج: حساسية ودفء.", "شمس في العذراء مع طالع في الأسد — من الداخل: دقة واهتمام بالتفاصيل؛ من الخارج: حضور درامي ولافت.", "الفجوة بين الشمس والطالع تخلق عمقًا — هذا ما يجعل كل شخص معقدًا ومثيرًا."] },
          { title: "كيف تكتشف برجك الطالع؟", blocks: ["لمعرفة برجك الطالع تحتاج ثلاثة أشياء: تاريخ الميلاد، وقت الميلاد الدقيق، ومكان الميلاد.", "بدون وقت ميلاد دقيق، لا يمكن حساب الأسندنت — وهذا أحد الأسباب التي تجعله مميزًا جدًا."] },
        ],
      },
    },
  },
  {
    slug: "astro-houses",
    icon: "astrology",
    heroEmoji: "🏛️",
    ctaLink: "/",
    translations: {
      he: {
        title: "איך להבין בתים אסטרולוגיים",
        subtitle: "12 הבתים — 12 תחומי חיים שהמפה חושפת",
        ctaText: "רוצים לראות את הבתים שלכם?",
        ctaButton: "צרו מפת לידה",
        sections: [
          { title: "מה הם הבתים?", blocks: ["המפה האסטרולוגית מחולקת ל-12 בתים. כל בית מייצג תחום חיים שונה — מזהות אישית ועד רוחניות.", "כוכב לכת שנמצא בבית מסוים מראה שהאנרגיה שלו פועלת בתחום הזה בחייכם."] },
          { title: "12 הבתים בקצרה", bullets: ["בית 1 — זהות עצמית, רושם ראשוני, מראה חיצוני", "בית 2 — כסף, ערכים, ביטחון חומרי", "בית 3 — תקשורת, אחים, למידה יומיומית", "בית 4 — בית, משפחה, שורשים", "בית 5 — יצירתיות, רומנטיקה, ילדים", "בית 6 — בריאות, עבודה יומית, שגרה", "בית 7 — יחסים, שותפויות, נישואין", "בית 8 — טרנספורמציה, אינטימיות, כסף משותף", "בית 9 — פילוסופיה, נסיעות, לימודים גבוהים", "בית 10 — קריירה, מוניטין, מטרות חיים", "בית 11 — חברות, חלומות, קהילה", "בית 12 — תת-מודע, רוחניות, בדידות יצירתית"] },
          { title: "איך לפרש?", blocks: ["בדקו אילו כוכבים נמצאים באיזה בית. לדוגמה: ונוס בבית 7 מראה שאהבה ויחסים זוגיים תופסים מקום מרכזי בחיים.", "בתים ריקים לא אומרים שהתחום לא קיים — הם פשוט לא מודגשים כמו בתים עם כוכבים."] },
        ],
      },
      en: {
        title: "Understanding Astrological Houses",
        subtitle: "The 12 Houses — 12 life areas your chart reveals",
        ctaText: "Want to see your houses?",
        ctaButton: "Create a Birth Chart",
        sections: [
          { title: "What Are the Houses?", blocks: ["The astrological chart is divided into 12 houses. Each house represents a different area of life — from personal identity to spirituality.", "A planet located in a specific house shows that its energy operates in that area of your life."] },
          { title: "The 12 Houses in Brief", bullets: ["House 1 — Self-identity, first impression, appearance", "House 2 — Money, values, material security", "House 3 — Communication, siblings, daily learning", "House 4 — Home, family, roots", "House 5 — Creativity, romance, children", "House 6 — Health, daily work, routine", "House 7 — Relationships, partnerships, marriage", "House 8 — Transformation, intimacy, shared finances", "House 9 — Philosophy, travel, higher education", "House 10 — Career, reputation, life goals", "House 11 — Friendships, dreams, community", "House 12 — Subconscious, spirituality, creative solitude"] },
          { title: "How to Interpret?", blocks: ["Check which planets are in which house. For example: Venus in the 7th house shows that love and romantic relationships hold a central place in life.", "Empty houses don't mean the area doesn't exist — they're simply not as emphasized as houses with planets."] },
        ],
      },
      ru: {
        title: "Понимание астрологических домов",
        subtitle: "12 домов — 12 сфер жизни, которые раскрывает ваша карта",
        ctaText: "Хотите увидеть свои дома?",
        ctaButton: "Создать натальную карту",
        sections: [
          { title: "Что такое дома?", blocks: ["Астрологическая карта разделена на 12 домов. Каждый дом представляет разную сферу жизни — от личной идентичности до духовности.", "Планета, находящаяся в определённом доме, показывает, что её энергия действует в этой сфере вашей жизни."] },
          { title: "12 домов кратко", bullets: ["Дом 1 — Самоидентификация, первое впечатление, внешность", "Дом 2 — Деньги, ценности, материальная безопасность", "Дом 3 — Общение, братья и сёстры, повседневное обучение", "Дом 4 — Дом, семья, корни", "Дом 5 — Творчество, романтика, дети", "Дом 6 — Здоровье, ежедневная работа, рутина", "Дом 7 — Отношения, партнёрство, брак", "Дом 8 — Трансформация, близость, общие финансы", "Дом 9 — Философия, путешествия, высшее образование", "Дом 10 — Карьера, репутация, жизненные цели", "Дом 11 — Дружба, мечты, сообщество", "Дом 12 — Подсознание, духовность, творческое одиночество"] },
          { title: "Как интерпретировать?", blocks: ["Проверьте, какие планеты в каком доме. Например: Венера в 7-м доме показывает, что любовь и романтические отношения занимают центральное место в жизни.", "Пустые дома не означают, что сфера не существует — они просто не так подчёркнуты, как дома с планетами."] },
        ],
      },
      ar: {
        title: "فهم البيوت الفلكية",
        subtitle: "12 بيتًا — 12 مجالًا في الحياة تكشفها خريطتك",
        ctaText: "هل تريد رؤية بيوتك؟",
        ctaButton: "أنشئ خريطة ميلاد",
        sections: [
          { title: "ما هي البيوت؟", blocks: ["تنقسم الخريطة الفلكية إلى 12 بيتًا. كل بيت يمثل مجالًا مختلفًا في الحياة — من الهوية الشخصية إلى الروحانية.", "الكوكب الموجود في بيت معين يُظهر أن طاقته تعمل في ذلك المجال من حياتك."] },
          { title: "البيوت الـ12 باختصار", bullets: ["البيت 1 — الهوية الذاتية، الانطباع الأول، المظهر", "البيت 2 — المال، القيم، الأمان المادي", "البيت 3 — التواصل، الأشقاء، التعلم اليومي", "البيت 4 — المنزل، الأسرة، الجذور", "البيت 5 — الإبداع، الرومانسية، الأطفال", "البيت 6 — الصحة، العمل اليومي، الروتين", "البيت 7 — العلاقات، الشراكات، الزواج", "البيت 8 — التحوّل، الحميمية، الأموال المشتركة", "البيت 9 — الفلسفة، السفر، التعليم العالي", "البيت 10 — المهنة، السمعة، أهداف الحياة", "البيت 11 — الصداقات، الأحلام، المجتمع", "البيت 12 — اللاوعي، الروحانية، العزلة الإبداعية"] },
          { title: "كيف تفسّر؟", blocks: ["تحقق من الكواكب الموجودة في أي بيت. مثلًا: الزهرة في البيت 7 تُظهر أن الحب والعلاقات تحتل مكانة مركزية في الحياة.", "البيوت الفارغة لا تعني أن المجال غير موجود — إنها ببساطة ليست مُبرزة كالبيوت التي فيها كواكب."] },
        ],
      },
    },
  },
  {
    slug: "astro-personal-growth",
    icon: "astrology",
    heroEmoji: "🌱",
    ctaLink: "/",
    translations: {
      he: {
        title: "איך להשתמש במפה להתפתחות אישית",
        subtitle: "הפכו את מפת הלידה מתיאוריה לכלי חיים יומיומי",
        ctaText: "רוצים להתחיל את המסע?",
        ctaButton: "צרו מפת לידה",
        sections: [
          { title: "המפה ככלי צמיחה", blocks: ["מפת הלידה היא לא רק תיאור — היא מפת דרכים. היא מראה את הפוטנציאל שלכם, את האתגרים ואת הדרך להתפתח.", "במקום להגיד ״ככה אני״, השתמשו במפה כדי להגיד ״ככה אני יכול/ה לצמוח״."] },
          { title: "שלבים מעשיים", bullets: ["הכירו את שבתאי במפה — הוא מראה את הלקחים הגדולים שלכם", "בדקו את הצומת הצפוני (North Node) — הוא מצביע על כיוון הנשמה שלכם", "שימו לב להיבטי ריבוע (□) — הם מראים היכן יש מתח שדורש עבודה", "היבטי טריין (△) מראים כישרונות טבעיים — נצלו אותם"] },
          { title: "שאלות לעבודה עצמית", bullets: ["מה המפה אומרת על הדפוס שחוזר ביחסים שלי?", "באיזה תחום יש לי הכי הרבה אנרגיה שלא מנוצלת?", "מה הפחד הכי גדול שלי לפי המפה — ואיך אני יכול/ה להתמודד איתו?", "באיזה בית מרוכזים רוב הכוכבים — ומה זה אומר על המיקוד בחיי?"] },
          { title: "טיפ מתקדם", blocks: ["השוו את מפת הלידה שלכם לטרנזיטים הנוכחיים — זה מראה אילו אנרגיות פעילות עכשיו ואיך להשתמש בהן."] },
        ],
      },
      en: {
        title: "Using Your Chart for Personal Growth",
        subtitle: "Turn your birth chart from theory into an everyday life tool",
        ctaText: "Want to start the journey?",
        ctaButton: "Create a Birth Chart",
        sections: [
          { title: "The Chart as a Growth Tool", blocks: ["Your birth chart is not just a description — it's a roadmap. It shows your potential, your challenges, and the path to growth.", "Instead of saying 'that's just how I am', use the chart to say 'that's how I can grow'."] },
          { title: "Practical Steps", bullets: ["Get to know Saturn in your chart — it shows your biggest lessons", "Check the North Node — it points to your soul's direction", "Notice square aspects (□) — they show where there's tension that needs work", "Trine aspects (△) show natural talents — use them"] },
          { title: "Self-Work Questions", bullets: ["What does the chart say about patterns repeating in my relationships?", "In which area do I have the most untapped energy?", "What's my biggest fear according to the chart — and how can I face it?", "In which house are most planets concentrated — and what does that say about my focus in life?"] },
          { title: "Advanced Tip", blocks: ["Compare your birth chart to current transits — this shows which energies are active now and how to use them."] },
        ],
      },
      ru: {
        title: "Использование карты для личностного роста",
        subtitle: "Превратите натальную карту из теории в повседневный инструмент",
        ctaText: "Хотите начать путешествие?",
        ctaButton: "Создать натальную карту",
        sections: [
          { title: "Карта как инструмент роста", blocks: ["Ваша натальная карта — это не просто описание, а дорожная карта. Она показывает ваш потенциал, ваши вызовы и путь к развитию.", "Вместо того чтобы говорить «я такой/такая», используйте карту, чтобы сказать «вот как я могу расти»."] },
          { title: "Практические шаги", bullets: ["Познакомьтесь с Сатурном в вашей карте — он показывает ваши главные уроки", "Проверьте Северный Узел — он указывает направление вашей души", "Обратите внимание на квадратуры (□) — они показывают, где есть напряжение, требующее работы", "Трины (△) показывают природные таланты — используйте их"] },
          { title: "Вопросы для самоанализа", bullets: ["Что карта говорит о повторяющихся моделях в моих отношениях?", "В какой сфере у меня больше всего неиспользованной энергии?", "Каков мой главный страх по карте — и как я могу с ним справиться?", "В каком доме сосредоточено больше всего планет — и что это говорит о моём фокусе в жизни?"] },
          { title: "Продвинутый совет", blocks: ["Сравните свою натальную карту с текущими транзитами — это покажет, какие энергии активны сейчас и как их использовать."] },
        ],
      },
      ar: {
        title: "استخدام خريطتك للنمو الشخصي",
        subtitle: "حوّل خريطة ميلادك من نظرية إلى أداة حياة يومية",
        ctaText: "هل تريد بدء الرحلة؟",
        ctaButton: "أنشئ خريطة ميلاد",
        sections: [
          { title: "الخريطة كأداة نمو", blocks: ["خريطة ميلادك ليست مجرد وصف — إنها خارطة طريق. تُظهر إمكاناتك وتحدياتك والطريق نحو النمو.", "بدلًا من قول «هكذا أنا»، استخدم الخريطة لتقول «هكذا يمكنني أن أنمو»."] },
          { title: "خطوات عملية", bullets: ["تعرّف على زحل في خريطتك — يُظهر أكبر دروسك", "تحقق من العقدة الشمالية — تشير إلى اتجاه روحك", "لاحظ جوانب التربيع (□) — تُظهر أين يوجد توتر يحتاج عملًا", "جوانب التثليث (△) تُظهر مواهب طبيعية — استغلّها"] },
          { title: "أسئلة للعمل الذاتي", bullets: ["ماذا تقول الخريطة عن الأنماط المتكررة في علاقاتي؟", "في أي مجال لديّ أكبر طاقة غير مستغلة؟", "ما هو أكبر مخاوفي وفقًا للخريطة — وكيف يمكنني مواجهته؟", "في أي بيت تتركز معظم الكواكب — وماذا يعني ذلك عن تركيزي في الحياة؟"] },
          { title: "نصيحة متقدمة", blocks: ["قارن خريطة ميلادك بالعبورات الحالية — يُظهر هذا أي الطاقات نشطة الآن وكيفية استخدامها."] },
        ],
      },
    },
  },
];

// ─── Public API ─────────────────────────────────────────

export function getTarotGuides(lang: Language): GuideEntry[] {
  return tarotGuidesData.map((g) => resolve(g, lang));
}

export function getAstrologyGuides(lang: Language): GuideEntry[] {
  return astrologyGuidesData.map((g) => resolve(g, lang));
}

export function getGuideBySlug(slug: string, lang: Language): GuideEntry | undefined {
  const all = [...tarotGuidesData, ...astrologyGuidesData];
  const found = all.find((g) => g.slug === slug);
  if (!found) return undefined;
  return resolve(found, lang);
}

/** @deprecated use getTarotGuides(lang) */
export const tarotGuides = tarotGuidesData.map((g) => resolve(g, "he"));
/** @deprecated use getAstrologyGuides(lang) */
export const astrologyGuides = astrologyGuidesData.map((g) => resolve(g, "he"));
