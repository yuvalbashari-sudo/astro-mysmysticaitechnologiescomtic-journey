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
    const knownGender = isMale || isFemale;
    const genderHint = lang === "he"
      ? (isMale ? "🚻 GENDER LOCK: הקורא הוא גבר — כתוב את כל הטקסט בלשון זכר עקבית. אסור לשון נקבה, אסור כתיבה כפולה ('את/ה')."
        : isFemale ? "🚻 GENDER LOCK: הקוראת היא אישה — כתוב את כל הטקסט בלשון נקבה עקבית. אסור לשון זכר, אסור כתיבה כפולה ('את/ה')."
        : "🚻 NEUTRAL ADDRESS: מגדר הקורא לא ידוע — אסור להשתמש בכתיבה כפולה כמו 'את/ה' או 'חש/ה' או בלוכסנים מגדריים. השתמש בפנייה ניטרלית מכובדת ופואטית כמו 'נשמה יקרה', 'הלב שלך', 'הדרך שלך' — לעולם אל תניח מגדר.")
      : lang === "ar"
      ? (isMale ? "🚻 GENDER LOCK: القارئ ذكر — استخدم صيغة المذكر فقط في كل النص."
        : isFemale ? "🚻 GENDER LOCK: القارئة أنثى — استخدم صيغة المؤنث فقط في كل النص."
        : "🚻 NEUTRAL ADDRESS: جنس القارئ غير معروف — ممنوع تماماً استخدام الكتابة المزدوجة مثل 'أنت/ي' أو الشرطات بين المذكر والمؤنث. استخدم تعابير محايدة شاعرية مثل 'أيتها الروح'، 'قلبك'، 'دربك' — لا تفترض الجنس أبداً.")
      : lang === "ru"
      ? (isMale ? "🚻 GENDER LOCK: читатель — мужчина. Весь текст строго в мужском роде, без смешения родов и форм 'готов/готова'."
        : isFemale ? "🚻 GENDER LOCK: читатель — женщина. Весь текст строго в женском роде, без смешения родов и форм 'готов/готова'."
        : "")
      : (isMale || isFemale ? `🚻 GENDER LOCK: the reader identifies as ${isMale ? "male" : "female"}. Use ${isMale ? "he/him" : "she/her"} pronouns where needed and stay consistent — never mix genders or use slashes ("he/she").` : "");

    // Detect if the name's script matches the target language
    const isHebrew = (s: string) => /[\u0590-\u05FF]/.test(s);
    const isArabic = (s: string) => /[\u0600-\u06FF]/.test(s);
    const isCyrillic = (s: string) => /[\u0400-\u04FF]/.test(s);
    const isLatin = (s: string) => /^[A-Za-z\s\-']+$/.test(s);

    let safeName = userName || "";
    if (safeName) {
      const scriptOk =
        (lang === "he" && (isHebrew(safeName) || isLatin(safeName))) ||
        (lang === "ar" && (isArabic(safeName) || isLatin(safeName))) ||
        (lang === "ru" && (isCyrillic(safeName) || isLatin(safeName))) ||
        (lang === "en" && isLatin(safeName));
      if (!scriptOk) safeName = ""; // omit name if script doesn't match
    }

    const nameInstruction = safeName
      ? (lang === "he" ? `שם הקורא/ת: ${safeName}. השתמש בשם בפתיחה ובנקודות רגשיות — אל תשתמש יותר מדי.`
        : lang === "en" ? `Reader's name: ${safeName}. Use the name naturally at the opening and emotional moments.`
        : lang === "ru" ? `Имя читателя: ${safeName}. Используйте имя в начале и в эмоциональных моментах.`
        : `اسم القارئ: ${safeName}. استخدم الاسم في البداية وفي اللحظات العاطفية.`)
      : (lang === "he" ? "אין שם — השתמש בפנייה כללית חמה."
        : lang === "en" ? "No name available — use a warm generic greeting instead."
        : lang === "ru" ? "Имя недоступно — используйте тёплое общее приветствие."
        : "الاسم غير متاح — استخدم تحية عامة دافئة.");

    const LANG_NAMES: Record<string, string> = { he: "Hebrew", en: "English", ru: "Russian", ar: "Arabic" };
    const langName = LANG_NAMES[lang] || "Hebrew";

    const scriptRule = lang === "he"
      ? "EVERY single word in the \"content\" value MUST be written using HEBREW letters only. Do NOT use any Latin/English letters anywhere in the content — not even one word like \"Guide\", \"Energy\" or \"Love\". Translate every concept into native Hebrew."
      : lang === "ar"
        ? "EVERY single word in the \"content\" value MUST be written using ARABIC letters only. Do NOT use any Latin/English letters anywhere in the content — not even one word. Translate every concept into native Arabic."
        : lang === "ru"
          ? "EVERY word in the \"content\" value MUST be written using CYRILLIC letters only. Do NOT use any Latin/English letters anywhere in the content."
          : "Write entirely in English.";

    const systemPrompt = `⚠️ ABSOLUTE LANGUAGE RULE — READ THIS FIRST:
You MUST respond ONLY in the user's selected language: ${langName} (locale code: "${lang}").
Never mix languages. Every word, label, and sentence (including the JSON string values) MUST be in ${langName}.
${scriptRule}
The JSON KEYS stay in English ("content", "love_score", "career_score", "energy_score") — only the string VALUE of "content" is written in ${langName}.

You are a premium mystical astrologer generating a personalized daily horoscope.
${tone}
${genderHint}
${nameInstruction}

Today's date: ${dateStr}
Zodiac sign: ${zodiacSign || "Unknown"}
${birthDate ? `Birth date: ${birthDate}` : ""}

Generate a personalized daily horoscope. The response MUST be a valid JSON object with this exact structure:
{
  "content": "The full daily horoscope text (3-4 paragraphs, rich and personal) — ENTIRELY in ${langName}",
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
- Write ALL content in ${langName} natively — do NOT translate from another language. Not a single word in any other language.`;


    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
