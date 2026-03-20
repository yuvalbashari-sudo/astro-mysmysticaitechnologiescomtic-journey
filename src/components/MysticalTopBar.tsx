import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, MessageCircle, Clock } from "lucide-react";
import { useLanguage, languageConfig, type Language } from "@/i18n";
import { useT } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";

const languages: Language[] = ["he", "ar", "ru", "en"];

interface Props {
  onOpenHistory?: () => void;
  hasHistory?: boolean;
}

const MysticalTopBar = ({ onOpenHistory, hasHistory }: Props) => {
  const { language, setLanguage } = useLanguage();
  const t = useT();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 md:px-8 py-3 md:py-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      style={{
        background: "transparent",
      }}
      role="banner"
      aria-label={t.a11y_main_navigation}
    >
      {/* Right side: Empty spacer for balance */}
      <div className="flex-1" />

      {/* Center: Hero Title */}
      <motion.h1
        className="font-heading uppercase pointer-events-none select-none"
        style={{
          fontSize: "clamp(30px, 4vw, 52px)",
          fontWeight: 600,
          letterSpacing: "0.4em",
          background: "linear-gradient(135deg, hsl(var(--gold-light)), hsl(var(--gold)), hsl(var(--gold-dark)), hsl(var(--gold-light)))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 0 12px hsl(43 80% 55% / 0.2)) drop-shadow(0 0 30px hsl(43 80% 55% / 0.08))",
        }}
        animate={{
          filter: [
            "drop-shadow(0 0 12px hsl(43 80% 55% / 0.2)) drop-shadow(0 0 30px hsl(43 80% 55% / 0.08))",
            "drop-shadow(0 0 18px hsl(43 80% 55% / 0.35)) drop-shadow(0 0 40px hsl(43 80% 55% / 0.15))",
            "drop-shadow(0 0 12px hsl(43 80% 55% / 0.2)) drop-shadow(0 0 30px hsl(43 80% 55% / 0.08))",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        ASTROLOGAI
      </motion.h1>

      {/* Left side: Actions */}
      <div className="flex-1 flex justify-end">

      {/* Left side: Actions */}
      <nav className="flex items-center gap-2" aria-label={t.a11y_main_navigation}>
        {/* Readings History */}
        {hasHistory && (
          <motion.button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md font-body text-xs transition-all"
            style={{
              background: "hsl(var(--deep-blue-light) / 0.6)",
              border: "1px solid hsl(var(--gold) / 0.15)",
              color: "hsl(var(--gold) / 0.7)",
            }}
            whileHover={{ scale: 1.03, borderColor: "hsl(var(--gold) / 0.3)" }}
            whileTap={{ scale: 0.97 }}
            aria-label={t.a11y_readings_history}
          >
            <Clock className="w-3 h-3" aria-hidden="true" />
          </motion.button>
        )}

        {/* Language Selector */}
        <div ref={langRef} className="relative">
          <motion.button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md font-body text-xs transition-all"
            style={{
              background: "hsl(var(--deep-blue-light) / 0.6)",
              border: "1px solid hsl(var(--gold) / 0.15)",
              color: "hsl(var(--gold) / 0.7)",
            }}
            whileHover={{ scale: 1.03, borderColor: "hsl(var(--gold) / 0.3)" }}
            whileTap={{ scale: 0.97 }}
            aria-label={t.a11y_language_selector}
            aria-expanded={langOpen}
            aria-haspopup="listbox"
          >
            <Globe className="w-3 h-3" aria-hidden="true" />
            <span>{languageConfig[language].label}</span>
          </motion.button>

          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 right-0 rounded-xl overflow-hidden z-[70]"
                style={{
                  background: "linear-gradient(145deg, hsl(222 40% 10% / 0.98), hsl(222 47% 8% / 0.98))",
                  border: "1px solid hsl(var(--gold) / 0.2)",
                  boxShadow: "0 8px 30px hsl(0 0% 0% / 0.4)",
                  minWidth: "170px",
                }}
                role="listbox"
                aria-label={t.a11y_language_selector}
              >
                {languages.map((lang) => (
                  <button
                    key={lang}
                    role="option"
                    aria-selected={lang === language}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setLanguage(lang);
                      setLangOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-body transition-colors cursor-pointer ${
                      lang === language
                        ? "text-gold bg-gold/10"
                        : "text-foreground/70 hover:text-gold hover:bg-gold/5"
                    }`}
                    aria-label={`${t.a11y_change_language} ${languageConfig[lang].label}`}
                  >
                    <span className="text-base" aria-hidden="true">{languageConfig[lang].flag}</span>
                    <span>{languageConfig[lang].label}</span>
                    {lang === language && <span className="mr-auto text-gold/50 text-[10px]" aria-hidden="true">✦</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accessibility link */}
        <Link
          to="/accessibility"
          className="flex items-center justify-center w-8 h-8 rounded-full transition-all text-gold/50 hover:text-gold text-xs"
          style={{
            background: "hsl(var(--deep-blue-light) / 0.6)",
            border: "1px solid hsl(var(--gold) / 0.15)",
          }}
          aria-label={t.a11y_link_label}
          title={t.a11y_link_label}
        >
          ♿
        </Link>

        {/* WhatsApp */}
        <motion.a
          href="https://wa.me/972500000000?text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A2%D7%95%D7%93%20%D7%A2%D7%9C%20ASTROLOGAI"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
          style={{
            background: "linear-gradient(135deg, hsl(142 70% 40% / 0.8), hsl(142 70% 32% / 0.8))",
            boxShadow: "0 2px 10px hsl(142 70% 35% / 0.3)",
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={t.a11y_whatsapp_contact}
        >
          <MessageCircle className="w-3.5 h-3.5 text-white" aria-hidden="true" />
        </motion.a>
      </nav>
    </motion.header>
  );
};

export default MysticalTopBar;
