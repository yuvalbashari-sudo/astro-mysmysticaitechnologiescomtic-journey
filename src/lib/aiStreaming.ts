import { toast } from "@/components/ui/sonner";
import { Sparkles } from "lucide-react";
import React from "react";
import { mysticalProfile } from "@/lib/mysticalProfile";
import { TEXT_SIZE_CLASSES, type TextSize } from "@/components/TextSizeControl";

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

  // Inject mystical profile context and userName
  const profileContext = mysticalProfile.buildContextForAI();
  const userName = mysticalProfile.getUserName() || undefined;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ type, data, profileContext, language, userName }),
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

// Render mystical markdown text into styled React elements with sacred breathing rhythm
export function renderMysticalText(text: string, textSize: TextSize = "default"): React.ReactNode {
  const s = TEXT_SIZE_CLASSES[textSize];
  const lines = text.split("\n");
  const sections: React.ReactNode[][] = [[]];
  let sectionIndex = 0;

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (!trimmed) {
      sections[sectionIndex].push(React.createElement("div", { key: `sp-${i}`, className: "h-3" }));
      return;
    }

    // Section dividers → create new section
    if (trimmed === "---") {
      sectionIndex++;
      sections[sectionIndex] = [];
      return;
    }

    // Highlighted card/theme headings
    if (trimmed.startsWith("### ✨") || trimmed.startsWith("### 🌟")) {
      sectionIndex++;
      sections[sectionIndex] = [];
      sections[sectionIndex].push(
        React.createElement("div", {
          key: `h-${i}`,
          className: "text-center py-2",
        },
          React.createElement("h3", {
            className: `font-heading ${s.subheading}`,
            style: {
              color: "hsl(var(--gold))",
              textShadow: "0 0 25px hsl(var(--gold) / 0.15)",
              letterSpacing: "0.1em",
            },
          }, trimmed.replace(/### [✨🌟]\s?/, ""))
        )
      );
      return;
    }

    // Section headings → start new section with sacred header
    if (trimmed.startsWith("### ")) {
      sectionIndex++;
      sections[sectionIndex] = [];
      const emoji = trimmed.match(/[\p{Emoji}]/u)?.[0] || "✦";
      const title = trimmed.replace("### ", "");
      sections[sectionIndex].push(
        React.createElement("div", { key: `sh-${i}`, className: "flex items-center gap-3 mb-4" },
          React.createElement("div", {
            className: "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            style: {
              background: "linear-gradient(135deg, hsl(var(--gold) / 0.08), hsl(var(--gold) / 0.03))",
              border: "1px solid hsl(var(--gold) / 0.12)",
            },
          }, React.createElement("span", { className: "text-lg" }, emoji)),
          React.createElement("h3", {
            className: `font-heading ${s.heading}`,
            style: { color: "hsl(var(--gold) / 0.85)", letterSpacing: "0.06em" },
          }, title)
        )
      );
      return;
    }

    // Bold labels → subtle card labels
    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      const label = trimmed.slice(2, -2);
      sections[sectionIndex].push(
        React.createElement("div", { key: `bl-${i}`, className: "flex items-center gap-2 mt-5 mb-2" },
          React.createElement("span", {
            className: "text-xs",
            style: { color: "hsl(var(--gold) / 0.4)" },
          }, "✦"),
          React.createElement("h4", {
            className: `font-heading ${s.subheading}`,
            style: { color: "hsl(var(--gold) / 0.7)", letterSpacing: "0.08em" },
          }, label.replace(/[\p{Emoji}]\s?/u, "").trim())
        )
      );
      return;
    }

    // Quoted text → sacred whisper
    if (trimmed.startsWith("״") || trimmed.startsWith('"') || trimmed.startsWith("\"")) {
      sections[sectionIndex].push(
        React.createElement("div", {
          key: `q-${i}`,
          className: "py-4 px-6 my-4 text-center rounded-2xl",
          style: {
            background: "radial-gradient(ellipse at center, hsl(var(--gold) / 0.04) 0%, transparent 80%)",
            borderTop: "1px solid hsl(var(--gold) / 0.06)",
            borderBottom: "1px solid hsl(var(--gold) / 0.06)",
          },
        },
          React.createElement("p", {
            className: `font-body ${s.quote} leading-relaxed italic`,
            style: {
              color: "hsl(var(--gold) / 0.7)",
              textShadow: "0 0 20px hsl(var(--gold) / 0.08)",
            },
          }, trimmed)
        )
      );
      return;
    }

    // Regular paragraph — check for inline bold as "key truths"
    const parts: React.ReactNode[] = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;
    let hasHighlight = false;

    while ((match = boldRegex.exec(trimmed)) !== null) {
      hasHighlight = true;
      if (match.index > lastIdx) {
        parts.push(trimmed.slice(lastIdx, match.index));
      }
      parts.push(
        React.createElement("span", {
          key: `b-${i}-${match.index}`,
          style: {
            color: "hsl(var(--foreground) / 0.95)",
            fontWeight: 500,
          },
        }, match[1])
      );
      lastIdx = match.index + match[0].length;
    }
    if (lastIdx < trimmed.length) {
      parts.push(trimmed.slice(lastIdx));
    }

    const content = parts.length > 0 ? parts : trimmed;

    sections[sectionIndex].push(
      React.createElement("p", {
        key: `p-${i}`,
        className: `font-body ${s.body}`,
        style: {
          color: hasHighlight ? "hsl(var(--foreground) / 0.85)" : "hsl(var(--foreground) / 0.72)",
          lineHeight: "2.15",
        },
      }, content)
    );
  });

  // Build final output with sacred separators between sections
  const finalElements: React.ReactNode[] = [];

  sections.forEach((section, si) => {
    if (section.length === 0) return;

    // Add sacred separator between sections (not before first)
    if (si > 0 && finalElements.length > 0) {
      finalElements.push(
        React.createElement("div", {
          key: `sep-${si}`,
          className: "flex items-center justify-center gap-3 py-6",
        },
          React.createElement("div", {
            className: "h-px w-8",
            style: { background: "linear-gradient(to right, transparent, hsl(var(--gold) / 0.15))" },
          }),
          React.createElement("span", {
            style: { color: "hsl(var(--gold) / 0.2)", fontSize: "8px" },
          }, "✦"),
          React.createElement("div", {
            className: "h-px w-8",
            style: { background: "linear-gradient(to left, transparent, hsl(var(--gold) / 0.15))" },
          })
        )
      );
    }

    // Wrap section content
    finalElements.push(
      React.createElement("div", {
        key: `sec-${si}`,
        className: "space-y-1",
      }, ...section)
    );
  });

  return React.createElement("div", { className: "space-y-0" }, ...finalElements);
}
