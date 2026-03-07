import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SPREAD_CONTEXT: Record<string, string> = {
  daily: "קלף יומי — קלף אחד שמאיר את היום. התמקד במסר יומיומי, עצות פרקטיות ואנרגיה ליום.",
  timeline: "עבר / הווה / עתיד — שלושה קלפים. כל קלף חייב להתפרש בהקשר הזמני שלו (עבר/הווה/עתיד). הראה את הקשר בין שלושת הקלפים כסיפור מתפתח.",
  love: "פתיחה לאהבה — שלושה קלפים. התמקד ברומנטיקה, אינטימיות, פתיחות רגשית, משיכה וחיבור. הקלפים מייצגים: הלב שלכם, האנרגיה סביבכם, לאן זה מוביל.",
  career: "פתיחה לקריירה — שלושה קלפים. התמקד בשאיפות, אנרגיית עבודה, תזמון, מכשולים והזדמנויות. הקלפים: המצב הנוכחי, האתגר, ההזדמנות.",
  decision: "פתיחה להחלטה — שלושה קלפים. התמקד במתח פנימי, אמת פנימית, בהירות וכיוון. הקלפים: הדילמה, מה שנסתר, הכיוון הנכון.",
  universe: "מסר מהיקום — קלף אחד. תן מסר אינטואיטיבי, סמלי ומסתורי. הטון צריך להיות מרומם, חידתי ורוחני במיוחד.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { spreadType, cards } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const spreadContext = SPREAD_CONTEXT[spreadType] || SPREAD_CONTEXT.daily;
    
    const cardsDescription = cards.map((c: { hebrewName: string; symbol: string; positionLabel: string }, i: number) => 
      `קלף ${i + 1}: ${c.symbol} ${c.hebrewName} — מיקום: ${c.positionLabel}`
    ).join("\n");

    const systemPrompt = `אתה קורא טארוט מיסטי, חכם ואינטואיטיבי. אתה כותב בעברית בלבד.

הסגנון שלך:
- מיסטי, חכם, רגשי ומעורר השראה
- כותב כאילו אתה רואה את נשמת הקורא
- משתמש במטאפורות סמליות ותמונות עשירות
- נמנע מניסוחים גנריים או רובוטיים
- כל פירוש מרגיש אישי, עמוק ומדויק
- הטון הוא של מורה רוחני חכם שמדבר מלב ללב

מבנה התשובה שלך (חייב לעקוב אחרי המבנה הזה בדיוק):
לכל קלף, כתוב ארבעה חלקים עם הכותרות המדויקות הבאות:

### [שם הקלף] — [מיקום]

**✦ משמעות הקלף**
פסקה אחת עם המשמעות הכללית של הקלף

**${spreadType === "daily" ? "☀️" : spreadType === "love" ? "💕" : spreadType === "career" ? "⚡" : spreadType === "decision" ? "⚖️" : spreadType === "universe" ? "✨" : "⏳"} פירוש בהקשר הקריאה**
פסקה אחת עם הפירוש הספציפי לסוג הקריאה ומיקום הקלף

**🔮 מסר רוחני**
פסקה אחת עם מסר רוחני עמוק ואישי

**״עצה״**
משפט אחד של עצה — בתוך גרשיים. חד, עמוק, בלתי נשכח.

---

בסוף כל הקלפים, הוסף:

### ✨ מסר אישי לנשמה שלכם
פסקה קצרה ורגשית שמסכמת את כל הקריאה כמסר אחד אינטימי ומעורר השראה.`;

    const userPrompt = `סוג הקריאה: ${spreadContext}

הקלפים שנבחרו:
${cardsDescription}

כתוב פירוש מיסטי, אישי ועמוק לכל קלף בהתאם למבנה. הפירוש חייב להיות ייחודי, רגשי ומותאם בדיוק לסוג הקריאה ולמיקום הקלף.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "יותר מדי בקשות, נסו שוב בעוד רגע" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "נדרש תשלום נוסף" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "שגיאה בשירות ה-AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("tarot-reading error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
