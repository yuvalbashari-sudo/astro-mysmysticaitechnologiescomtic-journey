import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { language = "en" } = await req.json();

    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    const prompt = `You are an expert astrologer. Today is ${dateStr}.

Based on real current planetary transits for today, determine the single most dominant planetary influence right now.

Return a JSON object with EXACTLY this structure (no markdown, no explanation, just raw JSON):
{
  "planet": "Venus",
  "planet_symbol": "♀",
  "zodiac_sign_index": 11,
  "zodiac_sign_en": "Pisces",
  "aspect": "Venus in Pisces",
  "influence_area": "love",
  "title": { "he": "...", "en": "...", "ru": "...", "ar": "..." },
  "description": { "he": "...", "en": "...", "ru": "...", "ar": "..." },
  "life_area": { "he": "...", "en": "...", "ru": "...", "ar": "..." }
}

Rules:
- zodiac_sign_index must be 0-11 matching: Aries=0, Taurus=1, Gemini=2, Cancer=3, Leo=4, Virgo=5, Libra=6, Scorpio=7, Sagittarius=8, Capricorn=9, Aquarius=10, Pisces=11
- planet must be one of: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
- influence_area must be one of: love, energy, communication, growth, discipline, transformation, intuition, creativity
- title should be like "Venus in Pisces" translated to each language (2-4 words)
- description should be 1-2 sentences about what this influence means emotionally/practically
- life_area should be a short phrase about which life areas are affected (e.g. "Love, creativity, and emotional depth")
- All translations must be natural and fluent in each language
- Base your answer on REAL approximate planetary positions for ${dateStr}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an astrology data API. Return only valid JSON, no markdown fences, no extra text." },
          { role: "user", content: prompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content from AI");
    }

    // Parse JSON from AI response (strip markdown fences if present)
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const planetaryData = JSON.parse(cleanContent);

    return new Response(JSON.stringify(planetaryData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("planetary-influence error:", e);
    
    // Fallback: return a sensible default based on date
    const fallback = getFallbackInfluence();
    return new Response(JSON.stringify(fallback), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getFallbackInfluence() {
  // Simple fallback based on current date
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  
  // Approximate Sun sign as fallback
  let signIndex = 11; // Pisces default
  const ranges: [number, number, number, number][] = [
    [3, 21, 4, 19], [4, 20, 5, 20], [5, 21, 6, 20],
    [6, 21, 7, 22], [7, 23, 8, 22], [8, 23, 9, 22],
    [9, 23, 10, 22], [10, 23, 11, 21], [11, 22, 12, 21],
    [12, 22, 1, 19], [1, 20, 2, 18], [2, 19, 3, 20],
  ];
  for (let i = 0; i < ranges.length; i++) {
    const [sm, sd, em, ed] = ranges[i];
    if (i === 9) {
      if ((m === sm && d >= sd) || (m === 1 && d <= ed)) { signIndex = i; break; }
    } else {
      if ((m === sm && d >= sd) || (m === em && d <= ed)) { signIndex = i; break; }
    }
  }

  const signNames = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

  return {
    planet: "Sun",
    planet_symbol: "☉",
    zodiac_sign_index: signIndex,
    zodiac_sign_en: signNames[signIndex],
    aspect: `Sun in ${signNames[signIndex]}`,
    influence_area: "energy",
    title: {
      he: `השמש ב${signNames[signIndex]}`,
      en: `Sun in ${signNames[signIndex]}`,
      ru: `Солнце в ${signNames[signIndex]}`,
      ar: `الشمس في ${signNames[signIndex]}`,
    },
    description: {
      he: "אנרגיית השמש מאירה את הנתיב שלך היום",
      en: "The Sun's energy illuminates your path today",
      ru: "Энергия Солнца освещает ваш путь сегодня",
      ar: "طاقة الشمس تنير طريقك اليوم",
    },
    life_area: {
      he: "אנרגיה, ביטוי עצמי וחיוניות",
      en: "Energy, self-expression, and vitality",
      ru: "Энергия, самовыражение и жизненная сила",
      ar: "الطاقة والتعبير عن الذات والحيوية",
    },
  };
}
