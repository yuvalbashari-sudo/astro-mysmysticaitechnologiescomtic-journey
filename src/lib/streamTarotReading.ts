import type { Language } from "@/i18n/types";
import { getLocalizedFallback } from "@/lib/localeGuard";
import { mysticalProfile } from "@/lib/mysticalProfile";
import { readingAuthorization } from "@/lib/readingAuthorization";
import { isLocalizedReading, matchesReadingScript, readingLanguageInstruction } from "@/lib/readingLanguage";
import { readReadingStream } from "@/lib/readingStream";
import { subscriptionManager } from "@/lib/subscriptionManager";
import { tarotMemory } from "@/lib/tarotMemory";

type Card = { name: string; hebrewName: string; localizedName: string; positionLabel: string; symbol: string };

export async function streamTarotReading(
  spreadType: string, cards: Card[], onText: (text: string) => void, onDone: (readingId?: string) => void,
  onError: (message: string) => void, language: Language, userQuestion?: string,
  signal?: AbortSignal, promptForGender = false,
) {
  const message = getLocalizedFallback(language, "error");
  try {
    const gender = promptForGender
      ? await (await import("@/lib/genderGate")).ensureGender(language)
      : mysticalProfile.getUserGender();
    const profile = mysticalProfile.buildContextForAI();
    const name = mysticalProfile.getLocalizedUserName(language);
    const rule = readingLanguageInstruction(language);
    for (let attempt = 0; attempt < 2; attempt++) {
      if (signal?.aborted) return;
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tarot-reading`, {
        method: "POST", signal,
        headers: { "Content-Type": "application/json", Authorization: readingAuthorization() },
        body: JSON.stringify({
          spreadType, language, includeFollowup: !!subscriptionManager.getAccessToken(), gender: gender === "male" || gender === "female" ? gender : undefined,
          userName: isLocalizedReading(name, language) ? name : undefined,
          cards: cards.map(({ localizedName, symbol, positionLabel }) => ({ hebrewName: localizedName, symbol, positionLabel })),
          context: { memoryContext: tarotMemory.buildMemoryContext(cards), userQuestion,
            profileContext: [profile, rule, "Start with one concrete answer to the question, no more than two short sentences. Answer before explaining: name the action or insight suggested by the cards. Do not restate the question or describe what the reading will cover. Then a blank line and all usual sections with markdown headings.", attempt ? "Review each word before returning the corrected reading." : ""].filter(Boolean).join("\n") },
        }),
      });
      if (!response.ok || !response.body) break;
      let visible = "";
      let mixed = false;
      const result = await readReadingStream(response.body, chunk => {
        if (mixed || signal?.aborted) return;
        if (!matchesReadingScript(chunk, language)) { mixed = true; return; }
        visible += chunk;
        onText(visible);
      });
      if (signal?.aborted) return;
      if (result.complete && isLocalizedReading(result.text, language)) { onDone(response.headers.get("X-Tarot-Reading") || undefined); return; }
      onText("");
      if (!mixed) break;
    }
  } catch { /* The UI displays a message in the requested language. */ }
  if (!signal?.aborted) { onText(""); onError(message); }
}
