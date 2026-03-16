import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANG_NAMES: Record<string, string> = { he: "Hebrew", en: "English", ru: "Russian", ar: "Arabic" };

const FEATURE_PROMPTS: Record<string, string> = {
  tarot: `TAROT MODE — You are interpreting a specific tarot reading result.
Rules:
- Identify the exact card(s) drawn and the spread type from the reading context
- Explain the meaning specifically for THIS draw — not generic encyclopedia definitions
- Distinguish between emotional meaning, practical meaning, and spiritual meaning
- If multiple cards were drawn, explain the relationships and flow between them
- Answer follow-up questions anchored in the specific cards shown
- Help the user understand: what energy surrounds them, what the card suggests for love/career/decisions, what warnings or invitations appear, and what hidden layer the card may be pointing to
- Never explain tarot in a detached academic way — interpret it as part of the user's present moment`,

  astrology: `ASTROLOGY MODE — You are interpreting a specific astrological reading result.
Rules:
- Use the actual zodiac result, monthly forecast, rising sign, or birth chart shown
- Explain how the monthly sign and rising sign interact with each other
- Expand on personality, emotional expression, attraction, energy, timing, and current themes
- Help the user understand: their current forecast, emotional/romantic tendencies, internal vs external personality, how traits connect to daily life
- When rising sign is available, explain how it modifies the sun sign expression
- Never give generic zodiac summaries detached from the displayed result
- Connect the cosmic analysis to love, money, career, health when asked`,

  compatibility: `COMPATIBILITY MODE — You are interpreting a specific zodiac compatibility result.
Rules:
- Use the exact compatibility analysis that was generated for this specific pairing
- Understand and reference strong areas AND weak areas honestly
- Explain friction points with sensitivity and growth-oriented language
- Cover: communication style, emotional fit, chemistry, intimacy dynamics, and long-term potential
- If compatibility is medium or weak, explain truthfully but gently — never overpromise
- Help with: clarifying match results, explaining emotional gaps, attraction dynamics, communication patterns, and constructive guidance
- CRITICAL: Do NOT always make the match sound amazing. Be honest with care.`,

  palm: `PALM READING MODE — You are interpreting a specific palm reading result.
Rules:
- Use the actual interpreted lines and result summary from the reading
- Reference specific lines: life line, heart line, head line, fate line, and other findings
- Explain what each interpreted line suggests about personality, relationships, career, and future
- Simplify complex palmistry language when the user asks
- Connect the reading to the person's life themes
- Help with: clarifying line meanings, connecting the reading to real life, career and money potential, relationship patterns
- Do NOT provide random palmistry information unrelated to the visible result`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, readingContext, readingsHistory, language } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const lang = language || "he";
    const langName = LANG_NAMES[lang] || "Hebrew";

    const langInstruction = lang === "he"
      ? "אתה כותב בעברית בלבד."
      : `CRITICAL: You MUST write your ENTIRE response in ${langName}. Every word must be in ${langName}. Do NOT use Hebrew or any other language.`;

    // Build feature-specific prompt section
    let featureBlock = "";
    let contextBlock = "";
    if (readingContext) {
      // Determine feature category
      const type = readingContext.type || "";
      let category = "general";
      if (type === "tarot" || type === "dailyCard" || type === "tarotWorld") category = "tarot";
      else if (type === "forecast" || type === "rising" || type === "birthChart") category = "astrology";
      else if (type === "compatibility") category = "compatibility";
      else if (type === "palm") category = "palm";

      featureBlock = FEATURE_PROMPTS[category] || "";

      contextBlock = `
--- CURRENT READING CONTEXT ---
Reading type: ${readingContext.type}
Reading label: ${readingContext.label}

Full reading result that the user received:
${readingContext.summary}
--- END READING CONTEXT ---

The user is looking at this specific reading right now. EVERY answer you give MUST be anchored in this exact reading result. Reference specific details, cards, signs, lines, and insights from the reading above. Do NOT give generic spiritual advice.

When the user asks "what does this mean" — refer to the SPECIFIC content above.
When the user asks about love, career, future — connect it to the SPECIFIC reading above.
When the user asks to explain simply — rephrase the SPECIFIC content above in simpler terms.`;
    }

    let historyBlock = "";
    if (readingsHistory && readingsHistory.length > 0) {
      const historyLines = readingsHistory.map((r: { type: string; title: string; subtitle: string; date: string }, i: number) => {
        const d = new Date(r.date);
        const ago = Math.round((Date.now() - d.getTime()) / 86400000);
        const timeLabel = ago === 0 ? "today" : ago === 1 ? "yesterday" : `${ago} days ago`;
        return `${i + 1}. [${r.type}] ${r.title} — ${r.subtitle} (${timeLabel})`;
      }).join("\n");
      historyBlock = `
--- USER'S READING HISTORY (most recent first) ---
${historyLines}
--- END HISTORY ---

You may reference the user's past readings when relevant to show patterns or connections. But ALWAYS prioritize the current reading context above.`;
    }

    const systemPrompt = `You are a wise, mystical astrology advisor — a personal spiritual interpreter of the user's reading results on ASTROLOGAI.

${langInstruction}

YOUR GOLDEN RULE: Every answer must be rooted in the exact reading result currently shown to the user. You are NOT a generic chatbot. You are a personal mystical interpreter.

Your personality:
- Wise, warm, emotionally intelligent, and deeply insightful
- You speak like an ancient oracle who truly sees the person
- Every response feels personal, specific, and deeply connected to the user's reading
- You use rich cosmic metaphors and mystical imagery naturally
- You are never generic, never vague, never robotic, never repetitive
- You answer follow-up questions with SPECIFIC references to the actual reading result
- You can explain meanings in simpler language when asked
- You can expand on emotional, romantic, career, or spiritual implications
- Keep responses concise but meaningful (2-4 paragraphs max unless asked for more)
- Use markdown formatting: **bold** for emphasis, ### for section headers, bullet lists when appropriate

AVOID these generic phrases unless specifically tied to the reading:
- "follow your heart" / "trust the universe" / "this is a sign" / "everything happens for a reason"
- Instead, say things like: "According to the card you drew..." / "In your compatibility result..." / "Your heart line suggests..."

GOOD response patterns:
- "According to the [specific card/sign/line] in your reading..."
- "The [specific element] in your result reveals..."
- "Because your [rising sign/card position/palm line] shows..."
- "In your compatibility analysis, the main dynamic seems to be..."

BAD response patterns:
- Answering in abstract spiritual clichés
- Ignoring the displayed result
- Giving the same style answer across all features
- Sounding like a generic motivational assistant

${featureBlock}

${contextBlock}
${historyBlock}

If the user asks about something completely unrelated to their reading or spirituality, gently guide them back to their mystical journey with warmth.`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again shortly" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("mystical-advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
