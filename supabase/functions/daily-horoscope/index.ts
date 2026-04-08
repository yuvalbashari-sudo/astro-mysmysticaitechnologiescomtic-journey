import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANG_TONE: Record<string, string> = {
  he: `כתוב בעברית טבעית, חמה ואינטואיטיבית. דבר ישירות אל הקורא/ת בגוף שני. השתמש בלשון עשירה אך טבעית — לא תרגומית. אין להשתמש בביטויי מילוי כמו "ניתן לומר", "כדאי לציין". כתוב במשפטים פעילים וישירים.`,
  en: `Write in clear, warm, supportive English with spiritual depth. Address the reader directly as "you". Use vivid imagery and metaphors. Avoid generic horoscope filler phrases.`,
  ru: `Пишите на глубоком, философском русском языке. Обращайтесь к читателю напрямую на "ты". Используйте литературный стиль с интроспективной глубиной. Избегайте шаблонных фраз.`,
  ar: `اكتب بالعربية الفصحى الغنية والشاعرية. خاطب القارئ مباشرة بضمير "أنت". استخدم الصور البلاغية والاستعارات. تجنب العبارات العامة المكررة.`,
};

const LANG_LABELS: Record<string, { love: string; career: string; energy: string }> = {
  he: { love: "אהבה", career: "קריירה", energy: "אנרגיה" },
  en: { love: "Love", career: "Career", energy: "Energy" },
  ru: { love: "Любовь", career: "Карьера", energy: "Энергия" },
  ar: { love: "الحب", career: "المهنة", energy: "الطاقة" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { zodiacSign, birthDate, userName, language = "he", gender } = body;

    if (!zodiacSign && !birthDate) {
      return new Response(JSON.stringify({ error: "Missing zodiac sign or birth date" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lang = ["he", "en", "ru", "ar"].includes(language) ? language : "he";
    const tone = LANG_TONE[lang];
    
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    const isMale = gender === "male";
    const isFemale = gender === "female";
    const genderHint = lang === "he"
      ? (isMale ? "הקורא הוא גבר — כתוב בלשון זכר עקבית." : isFemale ? "הקוראת היא אישה — כתוב בלשון נקבה עקבית." : "")
      : lang === "ar"
      ? (isMale ? "القارئ ذكر — استخدم صيغة المذكر." : isFemale ? "القارئة أنثى — استخدم صيغة المؤنث." : "")
      : "";

    const nameInstruction = userName
      ? (lang === "he" ? `שם הקורא/ת: ${userName}. השתמש בשם בפתיחה ובנקודות רגשיות — אל תשתמש יותר מדי.`
        : lang === "en" ? `Reader's name: ${userName}. Use the name naturally at the opening and emotional moments.`
        : lang === "ru" ? `Имя читателя: ${userName}. Используйте имя в начале и в эмоциональных моментах.`
        : `اسم القارئ: ${userName}. استخدم الاسم في البداية وفي اللحظات العاطفية.`)
      : "";

    const systemPrompt = `You are a premium mystical astrologer generating a personalized daily horoscope.
${tone}
${genderHint}
${nameInstruction}

Today's date: ${dateStr}
Zodiac sign: ${zodiacSign || "Unknown"}
${birthDate ? `Birth date: ${birthDate}` : ""}

Generate a personalized daily horoscope. The response MUST be a valid JSON object with this exact structure:
{
  "content": "The full daily horoscope text (3-4 paragraphs, rich and personal)",
  "love_score": <number 1-5>,
  "career_score": <number 1-5>,
  "energy_score": <number 1-5>
}

Guidelines:
- The horoscope should feel deeply personal, not generic
- Reference current celestial energies and the specific zodiac sign
- Include practical guidance for today
- Content should be 150-250 words
- love_score, career_score, energy_score are integers 1-5
- Respond ONLY with valid JSON, no markdown, no extra text
- Write ALL content in the specified language natively — do NOT translate from another language`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate the daily horoscope for today (${dateStr}) for zodiac sign ${zodiacSign}.` },
        ],
        temperature: 0.85,
        max_tokens: 1200,
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI API error:", errText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    let rawContent = aiData.choices?.[0]?.message?.content || "";
    
    // Strip markdown code fences if present
    rawContent = rawContent.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      // Fallback: use raw content as text
      parsed = {
        content: rawContent,
        love_score: 3,
        career_score: 3,
        energy_score: 3,
      };
    }

    return new Response(JSON.stringify({
      content: parsed.content || rawContent,
      love_score: Math.min(5, Math.max(1, Number(parsed.love_score) || 3)),
      career_score: Math.min(5, Math.max(1, Number(parsed.career_score) || 3)),
      energy_score: Math.min(5, Math.max(1, Number(parsed.energy_score) || 3)),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("daily-horoscope error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
