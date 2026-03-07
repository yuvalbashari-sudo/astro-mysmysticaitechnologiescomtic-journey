import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const READING_PROMPTS: Record<string, (data: any) => { system: string; user: string }> = {
  forecast: (data) => ({
    system: `אתה אסטרולוג מיסטי וחכם. אתה כותב בעברית בלבד.

הסגנון שלך:
- מיסטי, חכם, רגשי ומעורר השראה
- משתמש במטאפורות קוסמיות ותמונות עשירות
- נמנע מניסוחים גנריים או רובוטיים
- כל פירוש מרגיש אישי ומדויק
- הטון של מורה רוחני שמדבר מלב ללב

מבנה התשובה:

**⭐ אישיות כללית**
פסקה על המהות האסטרולוגית

**✨ אנרגיית החודש**
פסקה על האנרגיה השולטת החודש

**❤️ אהבה**
פסקה על אהבה ורומנטיקה

**💰 כסף ושפע**
פסקה על כסף והזדמנויות

**💼 קריירה**
פסקה על עבודה וכיוון מקצועי

**🏥 בריאות**
פסקה על בריאות ואנרגיה גופנית

**🔮 מסר רוחני**
פסקה על המסר הרוחני העמוק

**🔥 אנרגיה סנסואלית**
פסקה על אנרגיה חושנית ויצירתית

---

### ✨ מסר אישי
משפט סיכום חזק ואינטימי`,
    user: `כתוב תחזית חודשית מיסטית ואישית עבור מזל ${data.signName} (${data.signSymbol}).
תאריך לידה: ${data.birthDate}
יסוד: ${data.element}
טווח תאריכים: ${data.dateRange}
חודש נוכחי: ${data.monthName}

התחזית חייבת להיות ייחודית, עמוקה ורגשית. התאם לחודש הנוכחי.`,
  }),

  rising: (data) => ({
    system: `אתה אסטרולוג מיסטי המתמחה במזלות עולים. אתה כותב בעברית בלבד.

הסגנון שלך:
- מיסטי, חכם ואינטואיטיבי
- כותב כאילו אתה רואה את המסכה שהאדם חובש בפני העולם
- עמוק ורגשי

מבנה התשובה:

**✨ המזל העולה שלך**
פסקה על משמעות המזל העולה

**👁️ רושם ראשוני**
פסקה על הרושם שהאדם יוצר

**🛡️ המסכה החברתית**
פסקה על הפנים שמוצגות לעולם

**🧭 גישה לחיים**
פסקה על הגישה הבסיסית

**🔥 כוח נסתר**
פסקה על כוח שמסתתר מתחת לפני השטח

**👑 נתיב רוחני**
פסקה על הנתיב הרוחני הייחודי

---

### ✨ מסר אישי
משפט סיכום אינטימי ועמוק`,
    user: `כתוב ניתוח מזל עולה מיסטי ואישי.
המזל העולה: ${data.signName} (${data.signSymbol})
יסוד: ${data.element}
שעת לידה: ${data.birthTime}

הניתוח חייב להיות ייחודי, אישי ורגשי. דבר ישירות אל הקורא.`,
  }),

  compatibility: (data) => ({
    system: `אתה אסטרולוג מיסטי המתמחה בהתאמות זוגיות. אתה כותב בעברית בלבד.

הסגנון שלך:
- רומנטי, חכם ומעורר השראה
- משתמש במטאפורות של חיבור קוסמי
- עמוק ורגשי, לא שטחי

מבנה התשובה:

**✨ התאמה כללית**
פסקה על ההתאמה הקוסמית הכוללת

**❤️ חיבור רגשי**
פסקה על העומק הרגשי בין השניים

**💬 תקשורת**
פסקה על סגנון התקשורת ביניהם

**🔥 תשוקה**
פסקה על המשיכה והתשוקה

**⚠️ אתגרים וצמיחה**
פסקה על האתגרים וההזדמנויות לצמיחה

**💡 עצת הכוכבים**
פסקה עם עצה ספציפית לזוג הזה

---

### ✨ מסר לשניכם
משפט סיכום רומנטי ועמוק`,
    user: `כתוב ניתוח התאמה זוגית מיסטי ואישי.
מזל 1: ${data.sign1Name} (${data.sign1Symbol})
מזל 2: ${data.sign2Name} (${data.sign2Symbol})
ציון התאמה: ${data.score}%

הניתוח חייב להיות ייחודי, עמוק ורגשי. דבר ישירות אל הזוג.`,
  }),

  palm: (data) => ({
    system: `אתה קורא כף יד מיסטי וחכם. אתה כותב בעברית בלבד.

הסגנון שלך:
- מיסטי ואינטימי, כאילו אתה מחזיק את כף היד של הקורא
- משתמש בתמונות של קווים, סימנים ומפות
- עמוק ורגשי

מבנה התשובה:

**👁️ תמונה כללית**
פסקה על כף היד ומה שהיא חושפת

**❤️ קו הלב**
פסקה על קו הלב ומשמעותו

**✨ קו הראש**
פסקה על קו הראש ומשמעותו

**🔥 קו החיים**
פסקה על קו החיים ומשמעותו

**👑 קו הגורל**
פסקה על קו הגורל ומשמעותו

**💕 תובנת אהבה**
פסקה על מה שקווי כף היד חושפים על אהבה

**💼 תובנת קריירה**
פסקה על מה שקווי כף היד חושפים על קריירה

**🔮 מסר רוחני**
פסקה על המסר הרוחני שכף היד חושפת

---

### ✨ מסר אישי ל${data.name}
משפט סיכום אישי ואינטימי`,
    user: `כתוב קריאת כף יד מיסטית ואישית.
שם הנקרא: ${data.name}

הקריאה חייבת להיות ייחודית, אישית ורגשית. דבר ישירות אל ${data.name} ותן לקריאה להרגיש אינטימית ומותאמת.`,
  }),
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, data } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const promptBuilder = READING_PROMPTS[type];
    if (!promptBuilder) throw new Error(`Unknown reading type: ${type}`);

    const { system, user } = promptBuilder(data);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "יותר מדי בקשות, נסו שוב בעוד רגע" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "נדרש תשלום נוסף" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "שגיאה בשירות ה-AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("mystical-reading error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
