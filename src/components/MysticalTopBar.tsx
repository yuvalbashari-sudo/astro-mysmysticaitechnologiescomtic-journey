import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, MessageCircle, Clock, Sparkles } from "lucide-react";
import { useLanguage, languageConfig, type Language } from "@/i18n";
import { useT } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";

const languages: Language[] = ["he", "ar", "ru", "en"];

const CTA_TEXT: Record<Language, string> = {
  he: "✨ גלו את המסר האישי שלכם",
  en: "✨ Discover Your Personal Message",
  ru: "✨ Откройте ваше личное послание",
  ar: "✨ اكتشفوا رسالتكم الشخصية",
};

const SUBHEADLINE_TEXT: Record<Language, string> = {
  he: "גלו את העתיד שלכם באמצעות בינה מלאכותית ואסטרולוגיה",
  en: "Discover your future through AI and astrology",
  ru: "Откройте своё будущее с помощью ИИ и астрологии",
  ar: "اكتشفوا مستقبلكم من خلال الذكاء الاصطناعي وعلم الفلك",
};

interface Props {
  onOpenHistory?: () => void;
  onOpenDashboard?: () => void;
  hasHistory?: boolean;
}

const MysticalTopBar = ({ onOpenHistory, onOpenDashboard, hasHistory }: Props) => {
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

  const scrollToContent = () => {
    const el = document.getElementById("main-content");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

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

      {/* Center: Hero Title + Subheadline + CTA */}
      <div className="flex flex-col items-center pointer-events-none select-none gap-1 md:gap-2">
        {/* Premium title */}
        <motion.h1
          className="font-heading uppercase relative"
          style={{
            fontSize: "clamp(22px, 5vw, 78px)",
            fontWeight: 800,
            letterSpacing: "clamp(0.15em, 1.8vw, 0.6em)",
            lineHeight: 1,
            background: "linear-gradient(135deg, hsl(43 70% 75%), hsl(var(--gold)), hsl(var(--gold-dark)), hsl(43 90% 60%), hsl(43 70% 75%))",
            backgroundSize: "300% 300%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "none",
            filter: "drop-shadow(0 0 20px hsl(var(--gold) / 0.3)) drop-shadow(0 2px 4px hsl(0 0% 0% / 0.4))",
          }}
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          ASTROLOGAI
          {/* Shimmer sweep */}
          <motion.span
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent 0%, hsl(var(--gold-light) / 0.35) 45%, hsl(var(--gold-light) / 0.6) 50%, hsl(var(--gold-light) / 0.35) 55%, transparent 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              backgroundSize: "200% 100%",
            }}
            animate={{ backgroundPosition: ["-100% 0%", "200% 0%"] }}
            transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
            aria-hidden="true"
          >
            ASTROLOGAI
          </motion.span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="font-body text-center max-w-[90vw] md:max-w-lg"
          style={{
            fontSize: "clamp(11px, 1.8vw, 17px)",
            color: "hsl(var(--foreground) / 0.65)",
            letterSpacing: "0.03em",
            lineHeight: 1.5,
            textShadow: "0 1px 6px hsl(0 0% 0% / 0.5)",
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          {SUBHEADLINE_TEXT[language]}
        </motion.p>

        {/* Premium CTA */}
        <motion.button
          onClick={scrollToContent}
          className="pointer-events-auto relative overflow-hidden rounded-full font-body font-semibold cursor-pointer"
          style={{
            fontSize: "clamp(12px, 1.6vw, 16px)",
            padding: "clamp(8px, 1vw, 14px) clamp(20px, 3vw, 40px)",
            background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)), hsl(var(--gold-dark)))",
            backgroundSize: "200% 200%",
            color: "hsl(var(--background))",
            border: "1px solid hsl(var(--gold-light) / 0.5)",
            boxShadow: "0 0 24px hsl(var(--gold) / 0.25), 0 4px 16px hsl(0 0% 0% / 0.3), inset 0 1px 0 hsl(var(--gold-light) / 0.4)",
            letterSpacing: "0.04em",
          }}
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            opacity: { duration: 0.8, delay: 1.8 },
            y: { duration: 0.8, delay: 1.8 },
            scale: { duration: 0.8, delay: 1.8 },
            backgroundPosition: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 },
          }}
          whileHover={{
            scale: 1.06,
            boxShadow: "0 0 40px hsl(var(--gold) / 0.4), 0 6px 24px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(var(--gold-light) / 0.5)",
          }}
          whileTap={{ scale: 0.96 }}
        >
          {CTA_TEXT[language]}
          {/* Shimmer sweep on CTA */}
          <motion.span
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 40%, hsl(var(--gold-light) / 0.35) 48%, hsl(var(--gold-light) / 0.5) 50%, hsl(var(--gold-light) / 0.35) 52%, transparent 60%)",
              backgroundSize: "250% 100%",
            }}
            animate={{ backgroundPosition: ["-150% 0%", "250% 0%"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
            aria-hidden="true"
          />
        </motion.button>
      </div>

      {/* Left side: Actions */}
      <div className="flex-1 flex justify-end">
      <nav className="flex items-center gap-2" aria-label={t.a11y_main_navigation}>
        {/* Mystical Profile Dashboard */}
        <motion.button
          onClick={onOpenDashboard}
          className="flex items-center justify-center w-8 h-8 rounded-full backdrop-blur-md transition-all"
          style={{
            background: "hsl(var(--deep-blue-light) / 0.6)",
            border: "1px solid hsl(var(--gold) / 0.15)",
            color: "hsl(var(--gold) / 0.7)",
          }}
          whileHover={{ scale: 1.08, borderColor: "hsl(var(--gold) / 0.3)" }}
          whileTap={{ scale: 0.95 }}
          aria-label={t.dashboard_title || "Mystical Profile"}
        >
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
        </motion.button>
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
      </div>
    </motion.header>
  );
};

export default MysticalTopBar;
