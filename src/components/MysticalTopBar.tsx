import { motion } from "framer-motion";
import { MessageCircle, Clock, Sparkles } from "lucide-react";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import { useFontScale, type FontScale } from "@/contexts/FontScaleContext";
import MysticalLanguageDropdown from "@/components/MysticalLanguageDropdown";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  onOpenHistory?: () => void;
  onOpenDashboard?: () => void;
  hasHistory?: boolean;
}

const iconBtn =
  "flex items-center justify-center shrink-0 rounded-full transition-all";

const iconStyle = {
  background: "hsl(var(--deep-blue-light) / 0.6)",
  border: "1px solid hsl(var(--gold) / 0.15)",
  color: "hsl(var(--gold) / 0.7)",
};

const MysticalTopBar = ({ onOpenHistory, onOpenDashboard, hasHistory }: Props) => {
  const { scale, setScale } = useFontScale();
  const { dir } = useLanguage();
  const t = useT();
  const isMobile = useIsMobile();

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
        <div className="flex flex-col items-center gap-1">
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
                fontSize: 14,
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

            <nav className="flex items-center gap-1.5">
              {dashboardBtn}
              {historyBtn}
              {whatsappBtn}
            </nav>
          </div>

        </div>
      ) : (
        /* ── DESKTOP / TABLET: original single-row layout ── */
        <div className="flex items-center justify-between w-full">
          <div className="hidden md:flex flex-1" />

          <div className="flex-shrink-0 pointer-events-none select-none">
            <motion.h1
              className="font-heading uppercase"
              style={{
                fontSize: "clamp(18px, 4vw, 78px)",
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
          </div>

          <nav
            className="flex flex-1 items-center justify-end gap-2 md:gap-3"
            aria-label={t.a11y_main_navigation}
          >
            {dashboardBtn}
            {historyBtn}
            <MysticalLanguageDropdown />
            {fontSizeControl}
            {a11yLink}
            {whatsappBtn}
          </nav>
        </div>
      )}
    </motion.header>
  );
};

export default MysticalTopBar;
