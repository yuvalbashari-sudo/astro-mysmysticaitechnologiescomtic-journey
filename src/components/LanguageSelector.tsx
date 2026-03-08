import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";
import { useLanguage, languageConfig, type Language } from "@/i18n";

const languages: Language[] = ["he", "ar", "ru", "en"];

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]">
      <motion.button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md font-body text-sm transition-all"
        style={{
          background: "hsl(var(--deep-blue-light) / 0.8)",
          border: "1px solid hsl(var(--gold) / 0.2)",
          color: "hsl(var(--gold))",
        }}
        whileHover={{ scale: 1.03, borderColor: "hsl(var(--gold) / 0.4)" }}
        whileTap={{ scale: 0.97 }}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{languageConfig[language].label}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 rounded-xl overflow-hidden"
            style={{
              background: "linear-gradient(145deg, hsl(222 40% 10% / 0.98), hsl(222 47% 8% / 0.98))",
              border: "1px solid hsl(var(--gold) / 0.2)",
              boxShadow: "0 8px 30px hsl(0 0% 0% / 0.4)",
              minWidth: "160px",
            }}
          >
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => { setLanguage(lang); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-body transition-colors ${
                  lang === language
                    ? "text-gold bg-gold/10"
                    : "text-foreground/70 hover:text-gold hover:bg-gold/5"
                }`}
              >
                <span className="text-base">{languageConfig[lang].flag}</span>
                <span>{languageConfig[lang].label}</span>
                {lang === language && <span className="mr-auto text-gold/50 text-xs">✦</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
