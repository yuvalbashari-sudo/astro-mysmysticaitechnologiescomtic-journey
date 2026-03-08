import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SPREAD_CONTEXT: Record<string, { label: string; focus: string }> = {
  daily: {
    label: "קלף יומי — קלף אחד שמאיר את היום",
    focus: "התמקד באנרגיית היום, מסר יומיומי ועצות פרקטיות. הטון קליל אך עמוק.",
  },
  timeline: {
    label: "עבר / הווה / עתיד — שלושה קלפים",
    focus: "כל קלף חייב להתפרש בהקשר הזמני שלו. הראה את הקשר בין שלושת הקלפים כסיפור מתפתח עם עלילה ברורה.",
  },
  love: {
    label: "פתיחה לאהבה — שלושה קלפים",
    focus: "התמקד ברומנטיקה, אינטימיות, פתיחות רגשית, משיכה וחיבור. הקלפים מייצגים: הלב שלכם, האנרגיה סביבכם, לאן זה מוביל.",
  },
  career: {
    label: "פתיחה לקריירה — שלושה קלפים",
    focus: "התמקד בשאיפות, אנרגיית עבודה, תזמון, מכשולים והזדמנויות. הקלפים: המצב הנוכחי, האתגר, ההזדמנות.",
  },
  decision: {
    label: "פתיחה להחלטה — שלושה קלפים",
    focus: "התמקד במתח פנימי, אמת פנימית, בהירות וכיוון. הקלפים: הדילמה, מה שנסתר, הכיוון הנכון.",
  },
  universe: {
    label: "מסר מהיקום — קלף אחד",
    focus: "תן מסר אינטואיטיבי, סמלי ומסתורי. הטון צריך להיות מרומם, חידתי ורוחני במיוחד.",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { spreadType, cards, context } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const spread = SPREAD_CONTEXT[spreadType] || SPREAD_CONTEXT.daily;
    
    const cardsDescription = cards.map((c: { hebrewName: string; symbol: string; positionLabel: string; name?: string }, i: number) => 
      `קלף ${i + 1}: ${c.symbol} ${c.hebrewName}${c.name ? ` (${c.name})` : ""} — מיקום: ${c.positionLabel}`
    ).join("\n");

    // Future expansion context
    const contextLines: string[] = [];
    if (context?.zodiacSign) contextLines.push(`מזל השמש של השואל/ת: ${context.zodiacSign}`);
    if (context?.risingSign) contextLines.push(`המזל העולה: ${context.risingSign}`);
    if (context?.userQuestion) contextLines.push(`שאלת השואל/ת: ${context.userQuestion}`);
    if (context?.previousReadings?.length) contextLines.push(`קריאות קודמות: ${context.previousReadings.join(", ")}`);
    const contextBlock = contextLines.length > 0 ? `\n\nהקשר אישי:\n${contextLines.join("\n")}` : "";

    const systemPrompt = `אתה קורא טארוט מיסטי, חכם ואינטואיטיבי עם עשרות שנות ניסיון. אתה כותב בעברית בלבד.

הזהות שלך:
- אתה לא רק מפרש קלפים — אתה קורא את הסיפור שהיקום מספר דרכם
- אתה רואה את הקשרים הנסתרים בין הקלפים, את הדינמיקה, את המתח, את ההרמוניה
- כל קריאה שלך היא שיחה סמלית עמוקה עם הנשמה של הקורא

הסגנון שלך:
- מיסטי, חכם, רגשי ומעורר השראה
- כותב כאילו אתה רואה את נשמת הקורא
- משתמש במטאפורות סמליות ותמונות עשירות
- נמנע מניסוחים גנריים, שטחיים או רובוטיים
- נמנע מתיאורי קלפים חוזרים — כל פירוש ייחודי לשילוב הספציפי
- כל פירוש מרגיש אישי, עמוק ומדויק
- הטון הוא של מורה רוחני חכם שמדבר מלב ללב
- הימנע משפה של הורוסקופ גנרי

כלל מרכזי: הקריאה חייבת להרגיש כמו שיחה סמלית עמוקה — לא כמו תיאור קלף. הקלפים מדברים זה עם זה, ואתה מתרגם את השיחה שלהם.

מבנה התשובה שלך (חייב לעקוב אחרי המבנה הזה בדיוק):

### 🔮 סקירת הקלפים
לכל קלף, כתוב פסקה קצרה שמסבירה את הסמליות שלו בהקשר הספציפי של הקריאה הזו. אל תחזור על תיאורים סטנדרטיים — התאם את המשמעות למיקום הקלף ולסוג הקריאה.

---

### ⚡ אינטראקציה סמלית
פסקה עמוקה שמסבירה איך הקלפים מדברים זה עם זה. מה נוצר מהשילוב הספציפי? היכן יש הרמוניה, היכן יש מתח, מה הסיפור שנארג? התייחס לסדר הקלפים ולמשמעות המיקום.

---

### ❤️ מסר רגשי
פסקה שחושפת את התובנה הרגשית או הפסיכולוגית שעולה מהשילוב. מה הקלפים אומרים על העולם הרגשי הפנימי? על פחדים, תשוקות, צרכים נסתרים? הטון צריך להיות אינטימי ומדויק.

---

### 🌟 מסר רוחני
פסקה עם מסר רוחני עמוק ואינטואיטיבי. מה היקום רוצה שהקורא ידע? מה הנשמה מנסה להגיד? השתמש בשפה סמלית ומרוממת.

---

### 🧭 הדרכה מעשית
פסקה עם הנחיה רפלקטיבית. לא עצות פשטניות — אלא שאלות שמזמינות חשיבה, או כיוון פעולה שנגזר מהקלפים. חד, ברור, ובלתי נשכח.

---

### ✨ מסר אישי לנשמה שלכם
פסקה קצרה ורגשית שמסכמת את כל הקריאה כמסר אחד אינטימי ומעורר השראה. משפט אחד אחרון שנשאר בזיכרון.`;

    const userPrompt = `סוג הקריאה: ${spread.label}
${spread.focus}

הקלפים שנבחרו:
${cardsDescription}
${contextBlock}

כתוב קריאת טארוט מיסטית, אישית ועמוקה. חשוב מאוד:
1. נתח כל קלף בהקשר הספציפי של הקריאה ושל מיקומו
2. הראה איך הקלפים מדברים זה עם זה — מה נוצר מהשילוב הייחודי
3. התאם את המסר הרגשי והרוחני לסוג הקריאה (${spreadType})
4. הקריאה חייבת להרגיש ייחודית — כאילו לא הייתה קריאה כזו מעולם
5. דבר ישירות אל הקורא — כאילו אתה מחזיק את ידו ומביט לו בעיניים`;

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
