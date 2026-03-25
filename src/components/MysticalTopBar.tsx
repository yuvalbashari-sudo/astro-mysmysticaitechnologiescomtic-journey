import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, MessageCircle, Clock, Sparkles } from "lucide-react";
import { useLanguage, languageConfig, type Language } from "@/i18n";
import { useT } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import { useFontScale, type FontScale } from "@/contexts/FontScaleContext";

const languages: Language[] = ["he", "ar", "ru", "en"];

interface Props {
  onOpenHistory?: () => void;
  onOpenDashboard?: () => void;
  hasHistory?: boolean;
}

const MysticalTopBar = ({ onOpenHistory, onOpenDashboard, hasHistory }: Props) => {
  const { language, setLanguage, dir } = useLanguage();
  const { scale, setScale } = useFontScale();
  const t = useT();
  const [langOpen, setLangOpen] = useState(false);
  const langContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langContainerRef.current && !langContainerRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
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
      <div className="flex-1" />

      <div className="flex flex-col items-center pointer-events-none select-none">
        <motion.h1
          className="font-heading uppercase"
          style={{
            fontSize: "clamp(22px, 5vw, 78px)",
            fontWeight: 700,
            letterSpacing: "clamp(0.12em, 1.5vw, 0.5em)",
            lineHeight: 1,
            color: "hsl(var(--gold))",
            background: "linear-gradient(135deg, hsl(var(--gold-light)), hsl(var(--gold)), hsl(var(--gold-dark)), hsl(var(--gold-light)))",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "none",
          }}
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          ASTROLOGAI
        </motion.h1>
      </div>

      <div className="flex-1 flex justify-end">
        <nav className="flex items-center gap-3" aria-label={t.a11y_main_navigation}>
          <motion.button
            onClick={onOpenDashboard}
            className="flex items-center justify-center w-14 h-14 rounded-full backdrop-blur-md transition-all"
            style={{
              background: "hsl(var(--deep-blue-light) / 0.6)",
              border: "1px solid hsl(var(--gold) / 0.15)",
              color: "hsl(var(--gold) / 0.7)",
            }}
            whileHover={{ scale: 1.08, borderColor: "hsl(var(--gold) / 0.3)" }}
            whileTap={{ scale: 0.95 }}
            aria-label={t.dashboard_title || "Mystical Profile"}
          >
            <Sparkles className="w-7 h-7" aria-hidden="true" />
          </motion.button>

          {hasHistory && (
            <motion.button
              onClick={onOpenHistory}
              className="flex items-center gap-2 px-5 py-3 rounded-full backdrop-blur-md font-body text-sm transition-all"
              style={{
                background: "hsl(var(--deep-blue-light) / 0.6)",
                border: "1px solid hsl(var(--gold) / 0.15)",
                color: "hsl(var(--gold) / 0.7)",
              }}
              whileHover={{ scale: 1.03, borderColor: "hsl(var(--gold) / 0.3)" }}
              whileTap={{ scale: 0.97 }}
              aria-label={t.a11y_readings_history}
            >
              <Clock className="w-6 h-6" aria-hidden="true" />
            </motion.button>
          )}

          <div
            ref={langContainerRef}
            className="relative isolate"
            style={{ zIndex: langOpen ? 99999 : undefined }}
          >
            <motion.button
              type="button"
              onClick={() => setLangOpen((prev) => !prev)}
              className="flex items-center gap-2 px-5 py-3 rounded-full backdrop-blur-md font-body text-sm transition-all"
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
              <Globe className="w-6 h-6" aria-hidden="true" />
              <span>{languageConfig[language].label}</span>
            </motion.button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute overflow-hidden rounded-2xl p-1.5 text-foreground"
                  style={{
                    top: "calc(100% + 0.35rem)",
                    insetInlineEnd: 0,
                    zIndex: 99999,
                    minWidth: "11rem",
                    maxWidth: "min(18rem, calc(100vw - 1rem))",
                    maxHeight: "min(70vh, 20rem)",
                    boxShadow: "0 20px 50px hsl(0 0% 0% / 0.85), 0 0 0 1px hsl(var(--gold) / 0.18)",
                    background: "hsl(222 47% 7%)",
                    border: "1px solid hsl(var(--gold) / 0.25)",
                    transformOrigin: dir === "rtl" ? "top left" : "top right",
                  }}
                  role="listbox"
                  aria-label={t.a11y_language_selector}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      role="option"
                      aria-selected={lang === language}
                      onClick={() => {
                        setLanguage(lang);
                        setLangOpen(false);
                      }}
                      className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-sm font-body transition-colors cursor-pointer ${
                        lang === language
                          ? "bg-accent/25 text-foreground"
                          : "bg-transparent text-foreground hover:bg-accent/12 hover:text-foreground"
                      }`}
                      style={{
                        border: lang === language
                          ? "1px solid hsl(var(--gold) / 0.22)"
                          : "1px solid transparent",
                      }}
                      aria-label={`${t.a11y_change_language} ${languageConfig[lang].label}`}
                    >
                      <span className="text-base" aria-hidden="true">{languageConfig[lang].flag}</span>
                      <span>{languageConfig[lang].label}</span>
                      {lang === language && (
                        <span className="text-gold/50 text-[10px] ms-auto" aria-hidden="true">
                          ✦
                        </span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div
            className="inline-flex items-center gap-0.5 rounded-full px-1 py-0.5"
            style={{
              background: "hsl(var(--deep-blue-light) / 0.6)",
              border: "1px solid hsl(var(--gold) / 0.15)",
            }}
            role="radiogroup"
            aria-label="Font size"
          >
            {([
              { key: "default" as FontScale, label: "A", size: 14 },
              { key: "large" as FontScale, label: "A+", size: 16 },
              { key: "xl" as FontScale, label: "A++", size: 18 },
            ]).map(({ key, label, size }) => {
              const isActive = scale === key;
              return (
                <button
                  key={key}
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setScale(key)}
                  className="relative px-2.5 py-1.5 rounded-full font-heading transition-colors focus-visible:outline-2 focus-visible:outline-gold"
                  style={{
                    color: isActive ? "hsl(var(--primary-foreground))" : "hsl(var(--gold) / 0.6)",
                    fontSize: size,
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="global-font-pill"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
                        boxShadow: "0 0 10px hsl(var(--gold) / 0.25)",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>

          <Link
            to="/accessibility"
            className="flex items-center justify-center w-14 h-14 rounded-full transition-all text-gold/50 hover:text-gold text-lg"
            style={{
              background: "hsl(var(--deep-blue-light) / 0.6)",
              border: "1px solid hsl(var(--gold) / 0.15)",
            }}
            aria-label={t.a11y_link_label}
            title={t.a11y_link_label}
          >
            ♿
          </Link>

          <motion.a
            href="https://wa.me/972500000000?text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A2%D7%95%D7%93%20%D7%A2%D7%9C%20ASTROLOGAI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-14 h-14 rounded-full transition-all"
            style={{
              background: "linear-gradient(135deg, hsl(142 70% 40% / 0.8), hsl(142 70% 32% / 0.8))",
              boxShadow: "0 2px 10px hsl(142 70% 35% / 0.3)",
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={t.a11y_whatsapp_contact}
          >
            <MessageCircle className="w-7 h-7 text-white" aria-hidden="true" />
          </motion.a>
        </nav>
      </div>
    </motion.header>
  );
};

export default MysticalTopBar;
