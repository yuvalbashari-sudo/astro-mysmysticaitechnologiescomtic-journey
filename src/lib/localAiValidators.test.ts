import { describe, it, expect } from "vitest";
import {
  isValidLocale,
  hasMixedGenderSlashes,
  hasRtlIntegrity,
  stripBidiControls,
  repairSlashForms,
  latinLeakRatio,
} from "./localAiValidators";

describe("localAiValidators", () => {
  describe("isValidLocale", () => {
    it("accepts pure Hebrew text in he", () => {
      expect(isValidLocale("שלום עולם, היום יום נפלא", "he")).toBe(true);
    });
    it("rejects Cyrillic chars in he", () => {
      expect(isValidLocale("שלום Привет", "he")).toBe(false);
    });
    it("tolerates a couple of Latin loanwords in he", () => {
      expect(isValidLocale("שלום AI לכולם", "he")).toBe(true);
    });
    it("accepts pure Arabic text in ar", () => {
      expect(isValidLocale("مرحبا بالعالم اليوم", "ar")).toBe(true);
    });
    it("EN passes through with Latin text", () => {
      expect(isValidLocale("Hello there friend", "en")).toBe(true);
    });
    it("RU passes through with Cyrillic text", () => {
      expect(isValidLocale("Привет мир", "ru")).toBe(true);
    });
  });

  describe("hasMixedGenderSlashes", () => {
    it("detects את/ה in he", () => {
      expect(hasMixedGenderSlashes("את/ה אדם נפלא", "he")).toBe(true);
    });
    it("detects חש/ה in he", () => {
      expect(hasMixedGenderSlashes("אתה חש/ה היום", "he")).toBe(true);
    });
    it("returns false for clean masculine he text", () => {
      expect(hasMixedGenderSlashes("אתה חש היום", "he")).toBe(false);
    });
    it("detects Arabic pair", () => {
      expect(hasMixedGenderSlashes("صديقي/صديقتي العزيز", "ar")).toBe(true);
    });
    it("EN/RU always false", () => {
      expect(hasMixedGenderSlashes("he/she friend", "en")).toBe(false);
      expect(hasMixedGenderSlashes("он/она", "ru")).toBe(false);
    });
  });

  describe("repairSlashForms", () => {
    it("male: drops feminine suffix from <base>/ה", () => {
      const r = repairSlashForms("את/ה חזק/ה", "he", "male");
      expect(r.text).toBe("את חזק");
      expect(r.changed).toBe(true);
    });
    it("female: combines base + ה", () => {
      const r = repairSlashForms("את/ה חזק/ה", "he", "female");
      expect(r.text).toBe("אתה חזקה");
      expect(r.changed).toBe(true);
    });
    it("unknown gender: defaults to masculine base, no slash visible", () => {
      const r = repairSlashForms("את/ה חזק/ה", "he", undefined);
      expect(r.text).toBe("את חזק");
      expect(r.changed).toBe(true);
    });
    it("Arabic male picks left side", () => {
      const r = repairSlashForms("صديقي/صديقتي", "ar", "male");
      expect(r.text).toBe("صديقي");
    });
    it("Arabic female picks right side", () => {
      const r = repairSlashForms("صديقي/صديقتي", "ar", "female");
      expect(r.text).toBe("صديقتي");
    });
    it("EN pass-through (no changes)", () => {
      const r = repairSlashForms("he/she", "en", "male");
      expect(r.changed).toBe(false);
      expect(r.text).toBe("he/she");
    });
    it("idempotent — second pass is a no-op", () => {
      const a = repairSlashForms("את/ה", "he", "male");
      const b = repairSlashForms(a.text, "he", "male");
      expect(b.changed).toBe(false);
      expect(b.text).toBe(a.text);
    });
  });

  describe("stripBidiControls", () => {
    it("removes LRM/RLM/embedding marks", () => {
      const dirty = "שלום\u200E\u202Bworld\u202C";
      expect(stripBidiControls(dirty)).toBe("שלוםworld");
    });
    it("leaves clean text untouched", () => {
      expect(stripBidiControls("שלום עולם")).toBe("שלום עולם");
    });
  });

  describe("hasRtlIntegrity", () => {
    it("flags long Latin runs in HE", () => {
      expect(hasRtlIntegrity("שלום ThisIsAVeryLongEnglishWord", "he")).toBe(false);
    });
    it("clean HE passes", () => {
      expect(hasRtlIntegrity("שלום עולם נפלא", "he")).toBe(true);
    });
    it("flags bidi override marks", () => {
      expect(hasRtlIntegrity("שלום\u202Eflip\u202C", "he")).toBe(false);
    });
    it("EN/RU always pass", () => {
      expect(hasRtlIntegrity("Hello world", "en")).toBe(true);
      expect(hasRtlIntegrity("Привет мир", "ru")).toBe(true);
    });
  });

  describe("latinLeakRatio", () => {
    it("0 for pure HE", () => {
      expect(latinLeakRatio("שלום עולם")).toBe(0);
    });
    it("≈1 for pure EN", () => {
      expect(latinLeakRatio("Hello there")).toBeGreaterThan(0.99);
    });
    it("partial for mixed", () => {
      const r = latinLeakRatio("שלום AI");
      expect(r).toBeGreaterThan(0);
      expect(r).toBeLessThan(1);
    });
  });
});
