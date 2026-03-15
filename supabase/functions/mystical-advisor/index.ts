import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANG_NAMES: Record<string, string> = { he: "Hebrew", en: "English", ru: "Russian", ar: "Arabic" };

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

    let contextBlock = "";
    if (readingContext) {
      contextBlock = `
--- CURRENT READING CONTEXT ---
Reading type: ${readingContext.type}
Reading label: ${readingContext.label}

Full reading result that the user received:
${readingContext.summary}
--- END READING CONTEXT ---

The user is looking at this specific reading right now. EVERY answer you give MUST be anchored in this exact reading result. Reference specific details, cards, signs, lines, and insights from the reading above. Do NOT give generic spiritual advice.`;
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

You may reference the user's past readings when relevant. For example, if the user had a tarot reading 3 days ago and now asks about patterns, connect the dots between readings. But ALWAYS prioritize the current reading context above.`;
    }

    const systemPrompt = `You are a wise, mystical astrology advisor — a personal spiritual guide with deep knowledge of tarot, astrology, palmistry, and cosmic wisdom.

${langInstruction}

Your personality:
- Wise, warm, emotionally intelligent, and insightful
- You speak like an ancient oracle who truly sees the person
- Every response feels personal, specific, and deeply connected to the user's reading
- You use rich cosmic metaphors and mystical imagery
- You are never generic, never vague, never robotic
- You answer follow-up questions with specific references to the actual reading result
- You can explain meanings in simpler language when asked
- You can expand on emotional, romantic, career, or spiritual implications
- Keep responses concise but meaningful (2-4 paragraphs max unless asked for more)

${contextBlock}

If the user asks about something unrelated to their reading or spirituality, gently guide them back to their mystical journey.`;

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
