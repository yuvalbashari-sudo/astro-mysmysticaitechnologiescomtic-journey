import { describe, expect, it } from "vitest";
import { TAROT_SLUG_MAP, ZODIAC_SLUG_MAP } from "../seoData";
import { majorArcana } from "../tarotWorldData";
import { zodiacData } from "../zodiacData";
import { cardReading, signLabels, signReading } from ".";

const scripts = { he: /\p{Script=Hebrew}/u, en: /\p{Script=Latin}/u, ru: /\p{Script=Cyrillic}/u, ar: /\p{Script=Arabic}/u };
const cardFields = ["general", "love", "career", "spiritual", "advice"] as const;
const signFields = ["personality", "monthlyEnergy", "love", "money", "career", "health", "spiritual", "sensual"] as const;

for (const language of ["he", "en", "ru", "ar"] as const) {
  describe(language, () => {
    function check(text: string) {
      expect(text).toMatch(scripts[language]);
      if (language !== "he") expect(text).not.toMatch(scripts.he);
    }

    it.each(Object.entries(TAROT_SLUG_MAP))("localizes all interpretations for %s", (slug, name) => {
      const card = majorArcana.find(c => c.name === name)!;
      const reading = cardReading(slug, card, language);
      for (const field of cardFields) check(reading[field]);
    });

    it.each(Object.keys(ZODIAC_SLUG_MAP))("localizes the sections and labels for %s", slug => {
      const sign = zodiacData[slug];
      const reading = signReading(slug, sign, language);
      for (const field of signFields) check(reading[field]);
      const labels = signLabels(slug, sign, language);
      check(labels.name);
      check(labels.element);
    });
  });
}
