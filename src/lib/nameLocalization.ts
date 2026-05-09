/**
 * Name localization helpers.
 *
 * When the active UI/AI language is Hebrew but the stored user name uses
 * Latin characters, we transliterate it into a natural Hebrew rendering so
 * that personalized greetings, AI prompts and on-screen labels never break
 * the RTL flow with a stray Latin word like "Jony".
 *
 * The transliterator is intentionally lightweight and rule-based — it's not
 * meant to be perfect linguistics, just to keep the visual experience fully
 * Hebrew when possible. Hebrew/Arabic/Cyrillic input passes through
 * untouched.
 */

const HEBREW_RE = /[\u0590-\u05FF]/;
const LATIN_RE = /[A-Za-z]/;

// Multi-char digraphs first (longest match wins).
const DIGRAPHS: Array<[RegExp, string]> = [
  [/sch/gi, "ש"],
  [/sh/gi, "ש"],
  [/ch/gi, "צ׳"],
  [/tz/gi, "צ"],
  [/ts/gi, "צ"],
  [/ph/gi, "פ"],
  [/th/gi, "ת"],
  [/kh/gi, "ח"],
  [/gh/gi, "ג"],
  [/ck/gi, "ק"],
  [/qu/gi, "קו"],
  [/oo/gi, "ו"],
  [/ee/gi, "י"],
  [/ou/gi, "או"],
  [/ai/gi, "יי"],
  [/ay/gi, "יי"],
  [/ei/gi, "יי"],
  [/ey/gi, "יי"],
  [/ie/gi, "י"],
  [/au/gi, "או"],
  [/aw/gi, "או"],
];

const SINGLES: Record<string, string> = {
  a: "א", b: "ב", c: "ק", d: "ד", e: "א", f: "פ", g: "ג",
  h: "ה", i: "י", j: "ג׳", k: "ק", l: "ל", m: "מ", n: "נ",
  o: "ו", p: "פ", q: "ק", r: "ר", s: "ס", t: "ט", u: "ו",
  v: "ו", w: "ו", x: "קס", y: "י", z: "ז",
};

// Final-form letter substitutions when ending a word.
const FINAL_FORMS: Record<string, string> = {
  מ: "ם", נ: "ן", צ: "ץ", פ: "ף", כ: "ך",
};

function transliterateWord(word: string): string {
  let s = word.toLowerCase();
  for (const [re, rep] of DIGRAPHS) s = s.replace(re, rep);
  let out = "";
  for (const ch of s) {
    if (/[a-z]/.test(ch)) out += SINGLES[ch] ?? ch;
    else out += ch;
  }
  // Drop a trailing silent aleph (e.g. "Mike" → "מאיק" not "מאיקא")
  // Apply final-form to the last Hebrew letter.
  const chars = Array.from(out);
  for (let i = chars.length - 1; i >= 0; i--) {
    if (/[\u0590-\u05FF]/.test(chars[i])) {
      const fin = FINAL_FORMS[chars[i]];
      if (fin) chars[i] = fin;
      break;
    }
  }
  return chars.join("");
}

export function transliterateLatinToHebrew(name: string): string {
  if (!name) return name;
  return name
    .split(/(\s+)/)
    .map((part) => (LATIN_RE.test(part) && !HEBREW_RE.test(part) ? transliterateWord(part) : part))
    .join("")
    .trim();
}

/**
 * Return the user name localized for the given language.
 * - Hebrew + Latin-only name → transliterated to Hebrew letters
 * - Otherwise → original name
 */
export function localizeName(name: string | undefined | null, language: string | undefined): string | undefined {
  if (!name) return name ?? undefined;
  const trimmed = name.trim();
  if (!trimmed) return undefined;
  if (language === "he" && LATIN_RE.test(trimmed) && !HEBREW_RE.test(trimmed)) {
    return transliterateLatinToHebrew(trimmed);
  }
  return trimmed;
}
