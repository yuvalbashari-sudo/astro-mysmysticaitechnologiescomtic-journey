import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Clock, Sparkles, BookOpen } from "lucide-react";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import { useFontScale, type FontScale } from "@/contexts/FontScaleContext";
import MysticalLanguageDropdown from "@/components/MysticalLanguageDropdown";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  onOpenHistory?: () => void;
  onOpenDashboard?: () => void;
  onOpenCosmicGuide?: () => void;
  hasHistory?: boolean;
}

const iconBtn =
  "flex items-center justify-center shrink-0 rounded-full transition-all";

const iconStyle = {
  background: "hsl(var(--deep-blue-light) / 0.6)",
  border: "1px solid hsl(var(--gold) / 0.15)",
  color: "hsl(var(--gold) / 0.7)",
};

const MysticalTopBar = ({ onOpenHistory, onOpenDashboard, onOpenCosmicGuide, hasHistory }: Props) => {
  const { scale, setScale } = useFontScale();
  const { dir, language } = useLanguage();
  const t = useT();
  const isMobile = useIsMobile();
  const [guideOpen, setGuideOpen] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);

  // Close guide dropdown on outside click
  useEffect(() => {
    if (!guideOpen) return;
    const handler = (e: MouseEvent) => {
      if (guideRef.current && !guideRef.current.contains(e.target as Node)) setGuideOpen(false);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [guideOpen]);

  /* ── Shared icon elements ── */
  const dashboardBtn = (
    <motion.button
      onClick={onOpenDashboard}
      className={`${iconBtn} w-9 h-9 md:w-12 md:h-12`}
      style={iconStyle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      aria-label={t.dashboard_title || "Mystical Profile"}
    >
      <Sparkles className="w-[18px] h-[18px] md:w-6 md:h-6" aria-hidden="true" />
    </motion.button>
  );

  const historyBtn = hasHistory ? (
    <motion.button
      onClick={onOpenHistory}
      className={`${iconBtn} w-9 h-9 md:w-12 md:h-12`}
      style={iconStyle}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      aria-label={t.a11y_readings_history}
    >
      <Clock className="w-[18px] h-[18px] md:w-6 md:h-6" aria-hidden="true" />
    </motion.button>
  ) : null;

  const fontSizeControl = (
    <div
      className="inline-flex items-center gap-0.5 rounded-full px-0.5 py-0.5 shrink-0"
      style={{
        background: "hsl(var(--deep-blue-light) / 0.6)",
        border: "1px solid hsl(var(--gold) / 0.15)",
      }}
      role="radiogroup"
      aria-label="Font size"
    >
      {([
        { key: "default" as FontScale, label: "A", size: isMobile ? 11 : 12 },
        { key: "large" as FontScale, label: "A+", size: isMobile ? 11 : 13 },
        { key: "xl" as FontScale, label: "A++", size: isMobile ? 11 : 14 },
      ]).map(({ key, label, size }) => {
        const isActive = scale === key;
        return (
          <button
            key={key}
            role="radio"
            aria-checked={isActive}
            onClick={() => setScale(key)}
            className="relative px-1.5 sm:px-2 py-1 rounded-full font-heading transition-colors focus-visible:outline-2 focus-visible:outline-gold"
            style={{
              color: isActive
                ? "hsl(var(--primary-foreground))"
                : "hsl(var(--gold) / 0.6)",
              fontSize: size,
            }}
          >
            {isActive && (
              <motion.div
                layoutId="global-font-pill"
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
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
  );

  const a11yLink = (
    <Link
      to="/accessibility"
      className={`${iconBtn} w-9 h-9 md:w-12 md:h-12 text-gold/50 hover:text-gold text-sm md:text-lg`}
      style={{
        background: "hsl(var(--deep-blue-light) / 0.6)",
        border: "1px solid hsl(var(--gold) / 0.15)",
      }}
      aria-label={t.a11y_link_label}
      title={t.a11y_link_label}
    >
      ♿
    </Link>
  );

  const guideLabelText = language === "he" ? "מדריכים" : language === "ar" ? "الأدلة" : language === "ru" ? "Руководства" : "Guides";

  const desktopGuideBtn = (
    <div className="relative" ref={guideRef}>
      <motion.button
        onClick={() => setGuideOpen(!guideOpen)}
        className="flex items-center gap-2 rounded-full px-4 py-2.5 backdrop-blur-md transition-all"
        style={{
          background: "hsl(var(--deep-blue-light) / 0.6)",
          border: "1px solid hsl(var(--gold) / 0.18)",
          color: "hsl(var(--gold) / 0.78)",
        }}
        whileHover={{ scale: 1.05, borderColor: "hsl(var(--gold) / 0.35)" }}
        whileTap={{ scale: 0.95 }}
        aria-label={t.topbar_guide_label}
        aria-expanded={guideOpen}
      >
        <BookOpen className="w-5 h-5 shrink-0" aria-hidden="true" />
        <span className="font-body text-[14px] font-semibold tracking-wide whitespace-nowrap" style={{ color: "hsl(var(--gold) / 0.85)" }}>
          {guideLabelText}
        </span>
      </motion.button>
      <AnimatePresence>
        {guideOpen && (
          <motion.div
            className="absolute flex flex-col gap-2 rounded-xl p-3 z-[100]"
            style={{
              top: 52,
              right: 0,
              width: 220,
              minWidth: 200,
              background: "linear-gradient(145deg, hsl(var(--deep-blue-light) / 0.95), hsl(var(--deep-blue) / 0.95))",
              border: "1px solid hsl(var(--gold) / 0.18)",
              boxShadow: "0 8px 32px hsl(var(--deep-blue) / 0.6), 0 0 12px hsl(var(--gold) / 0.06)",
              backdropFilter: "blur(16px)",
            }}
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.18 }}
          >
            <Link
              to="/tarot-guides"
              onClick={() => setGuideOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-lg font-body text-[15px] font-medium transition-colors hover:bg-gold/10"
              style={{ color: "hsl(var(--foreground) / 0.9)" }}
            >
              <span style={{ color: "hsl(var(--gold) / 0.7)" }}>✦</span>
              {t.topbar_guide_tarot}
            </Link>
            <Link
              to="/astrology-guides"
              onClick={() => setGuideOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-lg font-body text-[15px] font-medium transition-colors hover:bg-gold/10"
              style={{ color: "hsl(var(--foreground) / 0.9)" }}
            >
              <span style={{ color: "hsl(var(--gold) / 0.7)" }}>✦</span>
              {t.topbar_guide_astrology}
            </Link>
            {onOpenCosmicGuide && (
              <button
                type="button"
                onClick={() => { setGuideOpen(false); onOpenCosmicGuide(); }}
                className="flex items-center gap-2.5 px-4 py-3 rounded-lg font-body text-[15px] font-medium transition-colors hover:bg-gold/10 w-full text-start cursor-pointer bg-transparent border-0"
                style={{ color: "hsl(var(--foreground) / 0.9)" }}
              >
                <span style={{ color: "hsl(270 60% 65%)" }}>✦</span>
                {language === "he" ? "השפעה קוסמית" : language === "ar" ? "التأثير الكوني" : language === "ru" ? "Космическое влияние" : "Cosmic Influence"}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const whatsappUrl = "https://wa.me/972500000000?text=%D7%94%D7%99%D7%99%2C%20%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A2%D7%95%D7%93%20%D7%A2%D7%9C%20ASTROLOGAI";

  const whatsappBtn = (
    <motion.button
      onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")}
      className={`${iconBtn} w-9 h-9 md:w-12 md:h-12`}
      style={{
        background:
          "linear-gradient(135deg, hsl(142 70% 40% / 0.8), hsl(142 70% 32% / 0.8))",
        boxShadow: "0 2px 10px hsl(142 70% 35% / 0.3)",
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={t.a11y_whatsapp_contact}
    >
      <MessageCircle className="w-[18px] h-[18px] md:w-6 md:h-6 text-white" aria-hidden="true" />
    </motion.button>
  );

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-[60] px-2 sm:px-4 md:px-8 py-1 md:py-3 pointer-events-auto"
      dir={dir}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      style={{ background: "transparent" }}
      role="banner"
      aria-label={t.a11y_main_navigation}
    >
       {isMobile ? (
        /* ── MOBILE: two rows ── */
        <div className="flex flex-col items-center gap-0 pb-[15px]">
          {/* Row 1: all icons in a single row */}
          <div className="flex items-center justify-between w-full">
            <nav className="flex items-center gap-1.5" aria-label={t.a11y_main_navigation}>
              <MysticalLanguageDropdown />
              {a11yLink}
            </nav>

            {/* Centered logo */}
            <motion.h1
              className="font-heading uppercase pointer-events-none select-none"
              style={{
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "0.1em",
                lineHeight: 1,
                color: "hsl(var(--gold))",
                background:
                  "linear-gradient(135deg, hsl(var(--gold-light)), hsl(var(--gold)), hsl(var(--gold-dark)), hsl(var(--gold-light)))",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "none",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              ASTROLOGAI
            </motion.h1>

            <div className="flex items-center gap-1.5" ref={guideRef}>
              <div className="relative">
                <motion.button
                  onClick={() => setGuideOpen(!guideOpen)}
                  className={`${iconBtn} w-9 h-9`}
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--deep-blue-light) / 0.7), hsl(var(--deep-blue-light) / 0.5))",
                    border: "1px solid hsl(var(--gold) / 0.2)",
                    color: "hsl(var(--gold) / 0.8)",
                  }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={t.topbar_guide_label}
                  aria-expanded={guideOpen}
                >
                  <BookOpen className="w-[18px] h-[18px]" aria-hidden="true" />
                </motion.button>
                <AnimatePresence>
                  {guideOpen && (
                    <motion.div
                      className="fixed flex flex-col gap-2 rounded-xl p-3 z-[100]"
                      style={{
                        top: 44,
                        right: 16,
                        width: 200,
                        minWidth: 180,
                        background: "linear-gradient(145deg, hsl(var(--deep-blue-light) / 0.95), hsl(var(--deep-blue) / 0.95))",
                        border: "1px solid hsl(var(--gold) / 0.18)",
                        boxShadow: "0 8px 32px hsl(var(--deep-blue) / 0.6), 0 0 12px hsl(var(--gold) / 0.06)",
                        backdropFilter: "blur(16px)",
                      }}
                      initial={{ opacity: 0, y: -6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                    >
                      <Link
                        to="/tarot-guides"
                        onClick={() => setGuideOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-lg font-body text-[19px] font-medium transition-colors hover:bg-gold/10"
                        style={{ color: "hsl(var(--foreground) / 0.9)" }}
                      >
                        <span style={{ color: "hsl(var(--gold) / 0.7)" }}>✦</span>
                        {t.topbar_guide_tarot}
                      </Link>
                      <Link
                        to="/astrology-guides"
                        onClick={() => setGuideOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-lg font-body text-[19px] font-medium transition-colors hover:bg-gold/10"
                        style={{ color: "hsl(var(--foreground) / 0.9)" }}
                      >
                        <span style={{ color: "hsl(var(--gold) / 0.7)" }}>✦</span>
                        {t.topbar_guide_astrology}
                      </Link>
                      {onOpenCosmicGuide && (
                        <button
                          type="button"
                          onClick={() => { setGuideOpen(false); onOpenCosmicGuide(); }}
                          className="flex items-center gap-2.5 px-4 py-3 rounded-lg font-body text-[19px] font-medium transition-colors hover:bg-gold/10 w-full text-start cursor-pointer bg-transparent border-0"
                          style={{ color: "hsl(var(--foreground) / 0.9)" }}
                        >
                          <span style={{ color: "hsl(270 60% 65%)" }}>✦</span>
                          {language === "he" ? "השפעה קוסמית" : language === "ar" ? "التأثير الكوني" : language === "ru" ? "Космическое влияние" : "Cosmic Influence"}
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {whatsappBtn}
            </div>
          </div>

        </div>
      ) : (
        /* ── DESKTOP / TABLET: original single-row layout ── */
        <div className="flex items-center justify-between w-full">
          {/* Left side: action icons */}
          <nav
            className="flex flex-1 items-center gap-2 md:gap-3"
            aria-label={t.a11y_main_navigation}
          >
            {dashboardBtn}
            {fontSizeControl}
            {a11yLink}
            {whatsappBtn}
          </nav>

          {/* Center: logo + subtitle */}
          <div className="flex-shrink-0 pointer-events-none select-none flex flex-col items-center">
            <motion.h1
              className="font-heading uppercase"
              style={{
                fontSize: "clamp(20px, 4.2vw, 82px)",
                fontWeight: 700,
                letterSpacing: "clamp(0.08em, 1vw, 0.5em)",
                lineHeight: 1,
                color: "hsl(var(--gold))",
                background:
                  "linear-gradient(135deg, hsl(var(--gold-light)), hsl(var(--gold)), hsl(var(--gold-dark)), hsl(var(--gold-light)))",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "none",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              ASTROLOGAI
            </motion.h1>
            <p
              className="font-body text-center"
              style={{
                fontSize: "clamp(22px, 2.4vw, 32px)",
                fontWeight: 500,
                color: "hsl(40 30% 78% / 0.92)",
                letterSpacing: "0.03em",
                lineHeight: 1.4,
                marginTop: 4,
                direction: "rtl",
                textShadow: "0 0 14px hsl(40 25% 70% / 0.18), 0 0 28px hsl(40 20% 60% / 0.08)",
              }}
            >
              תובנות שמחברות בין הכוכבים לחיים שלכם
            </p>
          </div>

          {/* Right side: navigation/settings */}
          <div className="flex flex-1 items-center justify-end gap-2 md:gap-3">
            {desktopGuideBtn}
            <MysticalLanguageDropdown showLabel />
          </div>
        </div>
      )}
    </motion.header>
  );
};

export default MysticalTopBar;
