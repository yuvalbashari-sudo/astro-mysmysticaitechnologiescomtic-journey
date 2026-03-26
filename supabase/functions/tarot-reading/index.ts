import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SPREAD_CONTEXT: Record<string, { label: Record<string, string>; focus: Record<string, string> }> = {
  daily: {
    label: {
      he: "קלף יומי — קלף אחד שמאיר את היום",
      en: "Daily Card — one card illuminating your day",
      ru: "Карта дня — одна карта, освещающая ваш день",
      ar: "بطاقة يومية — بطاقة واحدة تنير يومك",
    },
    focus: {
      he: "התמקד באנרגיית היום, מסר יומיומי ועצות פרקטיות. הטון קליל אך עמוק.",
      en: "Focus on today's energy, daily message and practical advice. Light yet deep tone.",
      ru: "Сосредоточьтесь на энергии дня, ежедневном послании и практических советах. Лёгкий, но глубокий тон.",
      ar: "ركز على طاقة اليوم، رسالة يومية ونصائح عملية. نبرة خفيفة لكن عميقة.",
    },
  },
  timeline: {
    label: {
      he: "עבר / הווה / עתיד — שלושה קלפים",
      en: "Past / Present / Future — three cards",
      ru: "Прошлое / Настоящее / Будущее — три карты",
      ar: "الماضي / الحاضر / المستقبل — ثلاث بطاقات",
    },
    focus: {
      he: "כל קלף חייב להתפרש בהקשר הזמני שלו. הראה את הקשר בין שלושת הקלפים כסיפור מתפתח עם עלילה ברורה.",
      en: "Each card must be interpreted in its temporal context. Show the connection between the three cards as an evolving story with a clear narrative.",
      ru: "Каждая карта должна интерпретироваться в своём временном контексте. Покажите связь между тремя картами как развивающуюся историю с чётким сюжетом.",
      ar: "يجب تفسير كل بطاقة في سياقها الزمني. أظهر الرابط بين البطاقات الثلاث كقصة متطورة بحبكة واضحة.",
    },
  },
  love: {
    label: {
      he: "פתיחה לאהבה — שלושה קלפים",
      en: "Love Opening — three cards",
      ru: "Расклад на любовь — три карты",
      ar: "فتح الحب — ثلاث بطاقات",
    },
    focus: {
      he: "התמקד ברומנטיקה, אינטימיות, פתיחות רגשית, משיכה וחיבור. הקלפים מייצגים: הלב שלכם, האנרגיה סביבכם, לאן זה מוביל.",
      en: "Focus on romance, intimacy, emotional openness, attraction and connection. The cards represent: your heart, the energy around you, where it leads.",
      ru: "Сосредоточьтесь на романтике, близости, эмоциональной открытости, притяжении и связи. Карты представляют: ваше сердце, энергию вокруг вас, куда это ведёт.",
      ar: "ركز على الرومانسية والحميمية والانفتاح العاطفي والجاذبية والتواصل. البطاقات تمثل: قلبكم، الطاقة حولكم، إلى أين تقود.",
    },
  },
  career: {
    label: {
      he: "פתיחה לקריירה — שלושה קלפים",
      en: "Career Opening — three cards",
      ru: "Расклад на карьеру — три карты",
      ar: "فتح المسار المهني — ثلاث بطاقات",
    },
    focus: {
      he: "התמקד בשאיפות, אנרגיית עבודה, תזמון, מכשולים והזדמנויות. הקלפים: המצב הנוכחי, האתגר, ההזדמנות.",
      en: "Focus on aspirations, work energy, timing, obstacles and opportunities. The cards: current situation, challenge, opportunity.",
      ru: "Сосредоточьтесь на стремлениях, рабочей энергии, времени, препятствиях и возможностях. Карты: текущая ситуация, вызов, возможность.",
      ar: "ركز على الطموحات وطاقة العمل والتوقيت والعقبات والفرص. البطاقات: الوضع الحالي، التحدي، الفرصة.",
    },
  },
  decision: {
    label: {
      he: "פתיחה להחלטה — שלושה קלפים",
      en: "Decision Opening — three cards",
      ru: "Расклад на решение — три карты",
      ar: "فتح القرار — ثلاث بطاقات",
    },
    focus: {
      he: "התמקד במתח פנימי, אמת פנימית, בהירות וכיוון. הקלפים: הדילמה, מה שנסתר, הכיוון הנכון.",
      en: "Focus on inner tension, inner truth, clarity and direction. The cards: the dilemma, what is hidden, the right path.",
      ru: "Сосредоточьтесь на внутреннем напряжении, внутренней правде, ясности и направлении. Карты: дилемма, что скрыто, верный путь.",
      ar: "ركز على التوتر الداخلي والحقيقة الداخلية والوضوح والاتجاه. البطاقات: المعضلة، ما هو مخفي، الاتجاه الصحيح.",
    },
  },
  universe: {
    label: {
      he: "מסר מהיקום — קלף אחד",
      en: "Message from the Universe — one card",
      ru: "Послание Вселенной — одна карта",
      ar: "رسالة من الكون — بطاقة واحدة",
    },
    focus: {
      he: "תן מסר אינטואיטיבי, סמלי ומסתורי. הטון צריך להיות מרומם, חידתי ורוחני במיוחד.",
      en: "Give an intuitive, symbolic and mysterious message. The tone should be elevated, enigmatic and deeply spiritual.",
      ru: "Дайте интуитивное, символичное и загадочное послание. Тон должен быть возвышенным, загадочным и глубоко духовным.",
      ar: "قدم رسالة حدسية ورمزية وغامضة. يجب أن تكون النبرة سامية وغامضة وروحانية بعمق.",
    },
  },
  question: {
    label: {
      he: "שאלה לקלפים — שלושה קלפים",
      en: "Question to the Cards — three cards",
      ru: "Вопрос картам — три карты",
      ar: "سؤال للبطاقات — ثلاث بطاقات",
    },
    focus: {
      he: "הקריאה מתבססת על שאלה אישית שהשואל/ת הקליד/ה. הקלפים מייצגים: השפעה נסתרת, אנרגיה נוכחית, כיוון אפשרי. חובה להתייחס ישירות לשאלה ולתת תשובה סמלית ועמוקה שנוגעת בה. התחל בהשתקפות של השאלה — מה היא באמת שואלת ברמה הנשמתית.",
      en: "The reading is based on a personal question the querent typed. The cards represent: hidden influence, current energy, possible direction. You must address the question directly and give a symbolic, deep answer. Start by reflecting on what the question is truly asking at the soul level.",
      ru: "Расклад основан на личном вопросе, который задал спрашивающий. Карты представляют: скрытое влияние, текущую энергию, возможное направление. Вы должны напрямую обратиться к вопросу и дать символичный, глубокий ответ. Начните с размышления о том, что вопрос действительно спрашивает на уровне души.",
      ar: "القراءة مبنية على سؤال شخصي كتبه السائل. البطاقات تمثل: تأثير خفي، طاقة حالية، اتجاه محتمل. يجب التعامل مع السؤال مباشرة وإعطاء إجابة رمزية وعميقة. ابدأ بالتأمل في ما يسأله السؤال حقاً على مستوى الروح.",
    },
  },
};

const LANGUAGE_NAMES: Record<string, string> = {
  he: "Hebrew (עברית)",
  en: "English",
  ru: "Russian (Русский)",
  ar: "Arabic (العربية)",
};

const SECTION_HEADERS: Record<string, Record<string, string>> = {
  he: {
    cards: "### 🔮 סקירת הקלפים",
    interaction: "### ⚡ אינטראקציה סמלית",
    emotional: "### ❤️ מסר רגשי",
    spiritual: "### 🌟 מסר רוחני",
    guidance: "### 🧭 הדרכה מעשית",
    personal: "### ✨ מסר אישי לנשמה שלכם",
  },
  en: {
    cards: "### 🔮 Card Overview",
    interaction: "### ⚡ Symbolic Interaction",
    emotional: "### ❤️ Emotional Message",
    spiritual: "### 🌟 Spiritual Message",
    guidance: "### 🧭 Practical Guidance",
    personal: "### ✨ A Personal Message for Your Soul",
  },
  ru: {
    cards: "### 🔮 Обзор карт",
    interaction: "### ⚡ Символическое взаимодействие",
    emotional: "### ❤️ Эмоциональное послание",
    spiritual: "### 🌟 Духовное послание",
    guidance: "### 🧭 Практическое руководство",
    personal: "### ✨ Личное послание вашей душе",
  },
  ar: {
    cards: "### 🔮 نظرة على البطاقات",
    interaction: "### ⚡ تفاعل رمزي",
    emotional: "### ❤️ رسالة عاطفية",
    spiritual: "### 🌟 رسالة روحية",
    guidance: "### 🧭 توجيه عملي",
    personal: "### ✨ رسالة شخصية لروحكم",
  },
};

// ── Server-side rate limiting ──────────────
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour
const RATE_LIMIT_MAX = 15; // max requests per IP per hour

async function checkServerRateLimit(clientIp: string, action: string): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count } = await supabase
      .from("rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("client_ip", clientIp)
      .eq("action", action)
      .gte("created_at", windowStart);

    const current = count || 0;
    if (current >= RATE_LIMIT_MAX) {
      // Log abuse
      await supabase.from("abuse_logs").insert({
        client_ip: clientIp,
        action,
        reason: "rate_limit_exceeded",
        metadata: { count: current, limit: RATE_LIMIT_MAX },
      });
      return { allowed: false, remaining: 0 };
    }

    // Record this request
    await supabase.from("rate_limits").insert({ client_ip: clientIp, action });
    return { allowed: true, remaining: RATE_LIMIT_MAX - current - 1 };
  } catch (e) {
    console.error("Rate limit check failed, allowing request:", e);
    return { allowed: true, remaining: -1 }; // fail-open
  }
}

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Server-side rate limiting
    const clientIp = getClientIp(req);
    const rateCheck = await checkServerRateLimit(clientIp, "tarot_reading");
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "300" },
      });
    }

    const { spreadType, cards, context, language: rawLang, userName: reqUserName } = await req.json();
    const language = (rawLang && ["he", "en", "ru", "ar"].includes(rawLang)) ? rawLang : "he";
    
    // Resolve userName from explicit param or context
    const userName = reqUserName || context?.userName || null;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const spreadData = SPREAD_CONTEXT[spreadType] || SPREAD_CONTEXT.daily;
    const spreadLabel = spreadData.label[language] || spreadData.label.he;
    const spreadFocus = spreadData.focus[language] || spreadData.focus.he;
    const headers = SECTION_HEADERS[language] || SECTION_HEADERS.he;
    const langName = LANGUAGE_NAMES[language] || "Hebrew";
    
    const cardsDescription = cards.map((c: { hebrewName: string; symbol: string; positionLabel: string; name?: string }, i: number) => 
      `Card ${i + 1}: ${c.symbol} ${c.hebrewName}${c.name ? ` (${c.name})` : ""} — Position: ${c.positionLabel}`
    ).join("\n");

    // Future expansion context
    const contextLines: string[] = [];
    if (context?.zodiacSign) contextLines.push(`Sun sign: ${context.zodiacSign}`);
    if (context?.risingSign) contextLines.push(`Rising sign: ${context.risingSign}`);
    if (context?.userQuestion) contextLines.push(`Querent's question: ${context.userQuestion}`);
    if (context?.previousReadings?.length) contextLines.push(`Previous readings: ${context.previousReadings.join(", ")}`);
    if (context?.memoryContext) contextLines.push(context.memoryContext);
    if (context?.profileContext) contextLines.push(context.profileContext);
    const contextBlock = contextLines.length > 0 ? `\n\nPersonal context:\n${contextLines.join("\n")}` : "";

    const languageInstruction = language === "he"
      ? "אתה כותב בעברית בלבד."
      : `CRITICAL: You MUST write your ENTIRE response in ${langName}. Every single word, heading, and sentence must be in ${langName}. Do NOT use Hebrew or any other language.`;

    const systemPrompt = `You are a mystical, wise and intuitive tarot reader with decades of experience. ${languageInstruction}

Your identity:
- You don't just interpret cards — you read the story the universe tells through them
- You see the hidden connections between cards, the dynamics, the tension, the harmony
- Every reading you give is a deep symbolic conversation with the reader's soul

Your style:
- Mystical, wise, emotional and inspiring
- Write as if you see the reader's soul
- Use symbolic metaphors and rich imagery
- Avoid generic, shallow or robotic phrasing
- Avoid repetitive card descriptions — every interpretation is unique to the specific combination
- Every interpretation feels personal, deep and precise
- The tone is that of a wise spiritual teacher speaking heart to heart
- Avoid generic horoscope language
- NEVER use generic zodiac group phrasing like "for Virgos", "בן מזל", "для Дев", "لبرج العذراء" — address the person directly

${userName ? `PERSONALIZATION — CRITICAL:
The reader's name is "${userName}".
- Address them by name in the opening and at key emotional moments.
- Do NOT overuse the name — weave it in naturally, like a caring guide would.
- Never use zodiac sign as form of address when you have their name.` : `ADDRESSING:
- The reader's name is unknown. Use warm, direct second-person address.
- Never use zodiac-based group phrasing.`}

Central rule: The reading must feel like a deep symbolic conversation — not a card description. The cards speak to each other, and you translate their conversation.

Response structure (you MUST follow this structure exactly):

${headers.cards}
For each card, write a short paragraph explaining its symbolism in the specific context of this reading. Don't repeat standard descriptions — adapt the meaning to the card's position and the reading type.

---

${headers.interaction}
A deep paragraph explaining how the cards speak to each other. What emerges from this specific combination? Where is there harmony, where is there tension, what story is woven? Address the order of cards and the meaning of positions.

---

${headers.emotional}
A paragraph revealing the emotional or psychological insight from the combination. What do the cards say about the inner emotional world? About fears, desires, hidden needs? The tone should be intimate and precise.

---

${headers.spiritual}
A paragraph with a deep, intuitive spiritual message. What does the universe want the reader to know? What is the soul trying to say? Use symbolic, elevated language.

---

${headers.guidance}
A paragraph with reflective guidance. Not simplistic advice — but questions that invite thinking, or a course of action derived from the cards. Sharp, clear, and unforgettable.

---

${headers.personal}
A short, emotional paragraph summarizing the entire reading as one intimate, inspiring message. One final sentence that stays in memory.`;

    const userPrompt = `Reading type: ${spreadLabel}
${spreadFocus}

Selected cards:
${cardsDescription}
${contextBlock}

Write a mystical, personal and deep tarot reading. Important:
1. Analyze each card in the specific context of this reading and its position
2. Show how the cards speak to each other — what emerges from this unique combination
3. Adapt the emotional and spiritual message to the reading type (${spreadType})
4. The reading must feel unique — as if there has never been a reading like this
5. Speak directly to the reader — as if you're holding their hand and looking into their eyes
6. REMEMBER: Write EVERYTHING in ${langName}. Not a single word in any other language.`;

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
        return new Response(JSON.stringify({ error: "Too many requests, try again in a moment" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
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
