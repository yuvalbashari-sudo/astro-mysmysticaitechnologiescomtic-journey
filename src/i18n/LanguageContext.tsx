import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { Language, languageConfig, TranslationKeys } from "./types";
import { he } from "./translations/he";
import { ar } from "./translations/ar";
import { ru } from "./translations/ru";
import { en } from "./translations/en";

const rawTranslations: Record<Language, TranslationKeys> = { he, ar, ru, en };

/** Returns a Proxy that falls back to English when a key is missing or empty */
function withFallback(lang: Language): TranslationKeys {
  if (lang === "en") return rawTranslations.en;
  return new Proxy(rawTranslations[lang], {
    get(target, prop: string) {
      const val = (target as any)[prop];
      if (val !== undefined && val !== "") return val;
      return (rawTranslations.en as any)[prop] ?? prop;
    },
  }) as TranslationKeys;
}

const translations: Record<Language, TranslationKeys> = {
  he: withFallback("he"),
  ar: withFallback("ar"),
  ru: withFallback("ru"),
  en: rawTranslations.en,
};

const STORAGE_KEY = "astrologai_lang";

function detectBrowserLanguage(): Language {
  const browserLang = navigator.language?.toLowerCase() || "";
  if (browserLang.startsWith("ar")) return "ar";
  if (browserLang.startsWith("ru")) return "ru";
  if (browserLang.startsWith("en")) return "en";
  return "he";
}

function getSavedLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Language;
    if (saved && translations[saved]) return saved;
  } catch {}
  return detectBrowserLanguage();
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  dir: "rtl" | "ltr";
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "he",
  setLanguage: () => {},
  t: he,
  dir: "rtl",
  isRTL: true,
});

export const useLanguage = () => useContext(LanguageContext);
export const useT = () => useContext(LanguageContext).t;

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(getSavedLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage failures and still update UI language in-memory.
    }
  }, []);

  // Apply direction and lang to document
  useEffect(() => {
    const config = languageConfig[language];
    document.documentElement.lang = language;
    document.documentElement.dir = config.dir;
    document.body.style.direction = config.dir;

    // Update meta tags
    const t = translations[language];
    document.title = t.meta_title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", t.meta_description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", t.meta_title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", t.meta_description);
  }, [language]);

  const config = languageConfig[language];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        dir: config.dir,
        isRTL: config.dir === "rtl",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
