import { afterEach, expect, it, vi } from "vitest";
import { callLocalAi } from "./localAiPipeline";
import { isLocalizedReading, matchesReadingScript } from "./readingLanguage";
import { streamTarotReading } from "./streamTarotReading";

const samples = {
  he: ["הקשר מתחזק.", "Expression"], en: ["Your connection grows.", "שלום"],
  ru: ["Ваша связь крепнет.", "The Hanged Man"], ar: ["تزداد العلاقة عمقًا.", "weaving"],
} as const;
afterEach(() => vi.unstubAllGlobals());

for (const locale of ["he", "en", "ru", "ar"] as const) {
  const [clean, foreign] = samples[locale];
  for (const feature of ["tarot", "compatibility", "birthChart"]) {
    it(feature + " only emits " + locale + " even before a corrective retry", async () => {
      const response = (...chunks: string[]) => new Response(chunks.map(content =>
        "data: " + JSON.stringify({ choices: [{ delta: { content } }] }) + "\n\n").join("") + "data: [DONE]");
      const fetcher = vi.fn().mockResolvedValueOnce(response(clean, foreign, clean)).mockResolvedValueOnce(response(clean));
      vi.stubGlobal("fetch", fetcher);
      const shown: string[] = [];
      const done = vi.fn(), error = vi.fn();
      if (feature === "tarot") {
        await streamTarotReading("question", [], text => shown.push(text), done, error, locale);
      } else {
        await callLocalAi({ endpoint: "mystical-reading", mode: "stream", promptForGender: false,
          payload: { type: feature, language: locale }, requireComplete: true,
          onDelta: text => shown.push(text), onReplace: text => shown.push(text), onError: error, onDone: done });
      }
      expect(fetcher).toHaveBeenCalledTimes(2);
      expect(error).not.toHaveBeenCalled();
      expect(done).toHaveBeenCalledTimes(1);
      expect(shown.at(-1)).toBe(clean);
      expect(shown.every(text => matchesReadingScript(text, locale))).toBe(true);
    });
  }
  it("rejects mixed saved prose even after a long valid prefix in " + locale, () => {
    expect(isLocalizedReading(clean.repeat(100) + foreign, locale)).toBe(false);
    expect(isLocalizedReading("✨ 12° ♊ " + clean, locale)).toBe(true);
    expect(isLocalizedReading("✨ 12°", locale)).toBe(false);
  });
}
