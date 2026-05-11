import { toast } from "@/components/ui/sonner";
import { Sparkles } from "lucide-react";
import React from "react";
import { mysticalProfile } from "@/lib/mysticalProfile";
import { TEXT_SIZE_CLASSES, type TextSize } from "@/components/TextSizeControl";
import { supabase } from "@/integrations/supabase/client";
import {
  safeErrorText,
  isValidLanguage,
  autoCorrectLocale,
  trackLocaleEvent,
  getLocalizedFallback,
} from "@/lib/localeGuard";
import type { Language } from "@/i18n/types";
import { ensureGender } from "@/lib/genderGate";

type StreamArgs = {
  type: string;
  data: Record<string, unknown>;
  language: string;
  strict: boolean;
  onDelta: (text: string) => void;
};

// Single attempt: opens a stream, forwards deltas, returns the accumulated text.
async function runStreamAttempt({
  type,
  data,
  language,
  strict,
  onDelta,
}: StreamArgs): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mystical-reading`;

  const profileContext = mysticalProfile.buildContextForAI();
  const userName = mysticalProfile.getLocalizedUserName(language) || undefined;
  const effectiveGender = mysticalProfile.getEffectiveGender();

  let authToken: string | null = null;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    authToken = sessionData?.session?.access_token ?? null;
  } catch { /* ignore */ }

  const adminEmail = localStorage.getItem("astrologai_admin_email") || undefined;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
  };
  if (adminEmail) headers["x-admin-email"] = adminEmail;

  // Auto-inject gender into the data payload (without overriding an explicit one)
  // so every reading type gets consistent gendered grammar.
  const dataWithGender =
    effectiveGender && (data as any).gender == null
      ? { ...data, gender: effectiveGender }
      : data;

  const body = {
    type,
    data: strict
      ? { ...dataWithGender, __languageStrict: true, __languageHint: `Respond ONLY in locale "${language}". No other language words.` }
      : dataWithGender,
    profileContext,
    language,
    userName,
    gender: effectiveGender,
    strict,
  };

  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    return { ok: false, error: safeErrorText(errData?.error, language as Language, "mystical-reading") };
  }
  if (!resp.body) {
    return { ok: false, error: safeErrorText(null, language as Language, "mystical-reading:empty-body") };
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;
  let accumulated = "";

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
        if (content) {
          accumulated += content;
          onDelta(content);
        }
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

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
        if (content) {
          accumulated += content;
          onDelta(content);
        }
      } catch { /* ignore */ }
    }
  }

  return { ok: true, text: accumulated };
}

// Stream AI reading from edge function with language-validation retry.
//
// Flow:
//   1. Open stream, render tokens as they arrive (no buffering).
//   2. When the stream ends, validate the FULL accumulated text against the
//      requested locale.
//   3. If invalid, try silent auto-correction (single-word leaks).
//   4. If still invalid, trigger ONE stricter retry — we tell the caller to
//      replace the rendered text via `onReplace` so the user sees clean
//      output instead of mixed-language text.
//   5. If the retry also fails, surface a localized fallback message via
//      `onReplace`.
export async function streamMysticalReading(
  type: string,
  data: Record<string, unknown>,
  onDelta: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
  language: string = "he",
  onReplace?: (fullText: string) => void,
) {
  const locale = language as Language;
  try {
    // Gate: ensure we have a locked gender before generating any AI content.
    await ensureGender(language);
    const first = await runStreamAttempt({ type, data, language, strict: false, onDelta });
    if (first.ok === false) {
      onError(first.error);
      return;
    }

    // Always run silent autocorrect — even when text passes the validator,
    // a single English leak (e.g. "Guide" inside a Hebrew paragraph) should
    // still be patched in place.
    if (locale !== "en") {
      const fix = autoCorrectLocale(first.text, locale);
      if (fix.changed) onReplace?.(fix.corrected);
    }
    if (isValidLanguage(first.text, locale)) {
      onDone();
      return;
    }

    // Try silent auto-correction first.
    const { corrected, changed } = autoCorrectLocale(first.text, locale);
    if (changed && isValidLanguage(corrected, locale)) {
      onReplace?.(corrected);
      onDone();
      return;
    }

    // Retry once with stricter instruction.
    trackLocaleEvent("language_validation_failed", { locale, context: "mystical-reading", phase: "first" });
    trackLocaleEvent("retry_triggered", { locale, context: "mystical-reading" });

    // Buffer the retry stream and only swap it in at the end so the user
    // doesn't see two competing token streams.
    let retryBuffered = "";
    const retry = await runStreamAttempt({
      type,
      data,
      language,
      strict: true,
      onDelta: (chunk) => { retryBuffered += chunk; },
    });
    if (retry.ok === false) {
      onError(retry.error);
      return;
    }

    if (isValidLanguage(retry.text, locale)) {
      onReplace?.(retry.text);
      onDone();
      return;
    }
    const retryFix = autoCorrectLocale(retry.text, locale);
    if (retryFix.changed && isValidLanguage(retryFix.corrected, locale)) {
      onReplace?.(retryFix.corrected);
      onDone();
      return;
    }

    // Both attempts failed validation — show the localized fallback.
    trackLocaleEvent("language_validation_failed", { locale, context: "mystical-reading", phase: "retry" });
    trackLocaleEvent("fallback_used", { locale, context: "mystical-reading" });
    onReplace?.(getLocalizedFallback(locale, "loading"));
    onDone();
  } catch (e) {
    onError(safeErrorText(e, locale, "mystical-reading:network"));
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
          color: hasHighlight ? "hsl(var(--foreground) / 0.92)" : "hsl(var(--foreground) / 0.78)",
          lineHeight: "2.2",
          marginBottom: "12px",
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
