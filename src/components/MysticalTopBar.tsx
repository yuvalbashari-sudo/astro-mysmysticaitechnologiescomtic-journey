import { motion } from "framer-motion";
import { MessageCircle, Clock, Sparkles } from "lucide-react";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import { useFontScale, type FontScale } from "@/contexts/FontScaleContext";
import MysticalLanguageDropdown from "@/components/MysticalLanguageDropdown";

interface Props {
  onOpenHistory?: () => void;
  onOpenDashboard?: () => void;
  hasHistory?: boolean;
}

const iconBtn =
  "flex items-center justify-center shrink-0 rounded-full backdrop-blur-md transition-all";

const MysticalTopBar = ({ onOpenHistory, onOpenDashboard, hasHistory }: Props) => {
  const { scale, setScale } = useFontScale();
  const t = useT();

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-[60] px-3 sm:px-4 md:px-8 py-2 md:py-3"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      style={{ background: "transparent" }}
      role="banner"
      aria-label={t.a11y_main_navigation}
    >
      {/* Single-row flex: logo centred, nav end-aligned */}
      <div className="flex items-center justify-between w-full">
        {/* Left spacer – matches nav width so logo stays centred on md+ */}
        <div className="hidden md:flex flex-1" />

        {/* Centre logo */}
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

        {/* Right nav – all icons in a single flex row */}
        <nav
          className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2 md:gap-3"
          aria-label={t.a11y_main_navigation}
        >
          {/* Dashboard */}
          <motion.button
            onClick={onOpenDashboard}
            className={`${iconBtn} w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12`}
            style={{
              background: "hsl(var(--deep-blue-light) / 0.6)",
              border: "1px solid hsl(var(--gold) / 0.15)",
              color: "hsl(var(--gold) / 0.7)",
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            aria-label={t.dashboard_title || "Mystical Profile"}
          >
            <Sparkles className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
          </motion.button>

          {/* History */}
          {hasHistory && (
            <motion.button
              onClick={onOpenHistory}
              className={`${iconBtn} w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12`}
              style={{
                background: "hsl(var(--deep-blue-light) / 0.6)",
                border: "1px solid hsl(var(--gold) / 0.15)",
                color: "hsl(var(--gold) / 0.7)",
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              aria-label={t.a11y_readings_history}
            >
              <Clock className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
            </motion.button>
          )}

          {/* Language */}
          <MysticalLanguageDropdown />

          {/* Font size */}
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
              { key: "default" as FontScale, label: "A", size: 12 },
              { key: "large" as FontScale, label: "A+", size: 13 },
              { key: "xl" as FontScale, label: "A++", size: 14 },
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

          {/* Accessibility */}
          <Link
            to="/accessibility"
            className={`${iconBtn} w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 text-gold/50 hover:text-gold text-base md:text-lg`}
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
            className={`${iconBtn} w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12`}
            style={{
              background:
                "linear-gradient(135deg, hsl(142 70% 40% / 0.8), hsl(142 70% 32% / 0.8))",
              boxShadow: "0 2px 10px hsl(142 70% 35% / 0.3)",
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={t.a11y_whatsapp_contact}
          >
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" aria-hidden="true" />
          </motion.a>
        </nav>
      </div>
    </motion.header>
  );
};

export default MysticalTopBar;
