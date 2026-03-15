import { toast } from "@/components/ui/sonner";
import { Sparkles } from "lucide-react";
import React from "react";
import { mysticalProfile } from "@/lib/mysticalProfile";

// Stream AI reading from edge function
export async function streamMysticalReading(
  type: string,
  data: Record<string, unknown>,
  onDelta: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
  language: string = "he",
) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mystical-reading`;

  // Inject mystical profile context
  const profileContext = mysticalProfile.buildContextForAI();

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ type, data, profileContext, language }),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({ error: "שגיאה לא צפויה" }));
      onError(errData.error || "שגיאה בשירות");
      return;
    }

    if (!resp.body) { onError("No response body"); return; }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") { streamDone = true; break; }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Flush remaining
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  } catch (e) {
    onError(e instanceof Error ? e.message : "שגיאה בחיבור");
  }
}

// Render mystical markdown text into styled React elements
export function renderMysticalText(text: string): React.ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(React.createElement("div", { key: i, className: "h-4 md:h-5" }));
      return;
    }
    if (trimmed === "---") {
      elements.push(React.createElement("div", { key: i, className: "section-divider max-w-[100px] mx-auto my-8 md:my-10" }));
      return;
    }
    if (trimmed.startsWith("### ✨") || trimmed.startsWith("### 🌟")) {
      elements.push(
        React.createElement("div", {
          key: i,
          className: "mt-8 md:mt-10 rounded-xl p-6 md:p-8 text-center",
          style: { background: "linear-gradient(135deg, hsl(var(--crimson) / 0.06), hsl(var(--gold) / 0.04))", border: "1px solid hsl(var(--gold) / 0.12)" },
        },
          React.createElement(Sparkles, { className: "w-6 h-6 text-gold mx-auto mb-3" }),
          React.createElement("h3", { className: "font-heading text-base md:text-lg text-gold" }, trimmed.replace(/### [✨🌟]\s?/, ""))
        )
      );
      return;
    }
    if (trimmed.startsWith("### ")) {
      elements.push(
        React.createElement("div", { key: i, className: "flex items-center gap-3 mt-8 md:mt-10 mb-4" },
          React.createElement("div", {
            className: "w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            style: { background: "linear-gradient(135deg, hsl(0 30% 15%), hsl(222 30% 12%))", border: "1px solid hsl(var(--gold) / 0.25)", boxShadow: "0 0 15px hsl(var(--gold) / 0.08)" },
          }, React.createElement("span", { className: "text-xl" }, trimmed.match(/[\p{Emoji}]/u)?.[0] || "✦")),
          React.createElement("h3", { className: "font-heading text-lg md:text-xl text-gold" }, trimmed.replace("### ", ""))
        )
      );
      return;
    }
    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      const label = trimmed.slice(2, -2);
      elements.push(
        React.createElement("div", { key: i, className: "flex items-center gap-2.5 mt-6 mb-2" },
          React.createElement("div", {
            className: "w-7 h-7 rounded-full flex items-center justify-center",
            style: { background: "hsl(var(--gold) / 0.1)" },
          }, React.createElement("span", { className: "text-sm" }, label.match(/[\p{Emoji}]/u)?.[0] || "✦")),
          React.createElement("h4", { className: "font-heading text-sm md:text-base text-gold" }, label.replace(/[\p{Emoji}]\s?/u, "").trim())
        )
      );
      return;
    }
    if (trimmed.startsWith("״") || trimmed.startsWith('"') || trimmed.startsWith("\"")) {
      elements.push(
        React.createElement("div", {
          key: i,
          className: "rounded-xl p-5 md:p-6 text-center mt-4 mb-4",
          style: { background: "hsl(var(--gold) / 0.04)", border: "1px solid hsl(var(--gold) / 0.1)" },
        }, React.createElement("p", { className: "text-gold/80 font-body text-base md:text-lg leading-relaxed italic" }, trimmed))
      );
      return;
    }
    // Regular paragraph - strip bold markers
    const cleanText = trimmed.replace(/\*\*(.*?)\*\*/g, '$1');
    elements.push(
      React.createElement("p", { key: i, className: "text-foreground/80 font-body text-base md:text-lg leading-[1.9] md:leading-[2]" }, cleanText)
    );
  });

  return React.createElement("div", { className: "space-y-1" }, ...elements);
}
