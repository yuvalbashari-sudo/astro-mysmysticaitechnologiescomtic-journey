import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sun, CalendarDays, Heart, Sparkles, Star, Map, Wand2, MapPin } from "lucide-react";
import { useT, useLanguage } from "@/i18n";
import DailyHoroscopeModal from "./DailyHoroscopeModal";
import MonthlyForecastModal from "./MonthlyForecastModal";
import CompatibilityModal from "./CompatibilityModal";
import TarotModal from "./TarotModal";
import RisingSignModal from "./RisingSignModal";
import BirthChartModal from "./BirthChartModal";
import DailyCardModal from "./DailyCardModal";
import AstrocartographyModal from "./AstrocartographyModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type OptionKey =
  | "daily_horoscope"
  | "monthly_forecast"
  | "compatibility"
  | "tarot"
    | "rising"
    | "birthchart"
    | "daily_card"
    | "astrocarto";

const MobileOptionsSheet = ({ isOpen, onClose }: Props) => {
  const t = useT();
  const { dir } = useLanguage();
  const [active, setActive] = useState<OptionKey | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  const handleSelect = (key: OptionKey) => {
    // Close the sheet first so its z-[120] overlay doesn't sit on top of
    // the nested modal (which uses CinematicModalShell at z-[100]).
    setActive(key);
    onClose();
  };

  const options: {
    key: OptionKey;
    label: string;
    icon: React.ReactNode;
    accent: string;
  }[] = [
    {
      key: "daily_horoscope",
      label: t.hero_menu_daily_horoscope,
      icon: <Sun className="w-6 h-6" aria-hidden="true" />,
      accent: "43 90% 60%",
    },
    {
      key: "monthly_forecast",
      label: t.hero_menu_forecast,
      icon: <CalendarDays className="w-6 h-6" aria-hidden="true" />,
      accent: "270 60% 65%",
    },
    {
      key: "compatibility",
      label: t.hero_menu_compatibility,
      icon: <Heart className="w-6 h-6" aria-hidden="true" />,
      accent: "340 75% 60%",
    },
    {
      key: "tarot",
      label: t.hero_menu_tarot,
      icon: <Sparkles className="w-6 h-6" aria-hidden="true" />,
      accent: "200 80% 60%",
    },
    {
      key: "daily_card",
      label: t.free_tarot_title,
      icon: <Wand2 className="w-6 h-6" aria-hidden="true" />,
      accent: "290 70% 65%",
    },
    {
      key: "rising",
      label: t.hero_menu_rising,
      icon: <Star className="w-6 h-6" aria-hidden="true" />,
      accent: "50 90% 60%",
    },
    {
      key: "birthchart",
      label: t.hero_menu_birthchart,
      icon: <Map className="w-6 h-6" aria-hidden="true" />,
      accent: "180 70% 55%",
    },
    {
      key: "astrocarto",
      label: t.hero_menu_astrocarto,
      icon: <MapPin className="w-6 h-6" aria-hidden="true" />,
      accent: "180 75% 60%",
    },
  ];

  const sheet = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[120] md:hidden"
          dir={dir}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            onClick={onClose}
            style={{
              background:
                "radial-gradient(ellipse 110% 90% at 50% 40%, hsl(225 60% 6% / 0.85) 0%, hsl(225 60% 3% / 0.96) 100%)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
          />

          {/* Floating starlight */}
          <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 22 }).map((_, i) => {
              const x = (i * 47) % 100;
              const y = (i * 73) % 100;
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 2,
                    height: 2,
                    left: `${x}%`,
                    top: `${y}%`,
                    background: i % 5 === 0 ? "hsl(43 80% 70%)" : "hsl(210 100% 95%)",
                    boxShadow:
                      i % 5 === 0
                        ? "0 0 6px hsl(43 80% 60% / 0.7)"
                        : "0 0 4px hsl(210 100% 90% / 0.5)",
                  }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 3 + (i % 4),
                    delay: (i % 7) * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              );
            })}
          </div>

          {/* Sheet content */}
          <motion.div
            className="absolute inset-x-0 bottom-0 top-0 flex flex-col"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              paddingTop: "calc(env(safe-area-inset-top, 0px) + 20px)",
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <button
                type="button"
                onClick={onClose}
                aria-label={t.a11y_close_modal}
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 44,
                  height: 44,
                  background: "hsl(var(--deep-blue-light) / 0.6)",
                  border: "1px solid hsl(var(--gold) / 0.28)",
                  color: "hsl(var(--gold) / 0.9)",
                }}
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
              <span
                className="font-heading uppercase select-none relative"
                style={{
                  fontSize: 19,
                  fontWeight: 600,
                  letterSpacing: "0.28em",
                  background:
                    "linear-gradient(180deg, hsl(43 95% 88%) 0%, hsl(43 85% 65%) 55%, hsl(38 75% 48%) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 8px hsl(43 80% 55% / 0.45)) drop-shadow(0 0 18px hsl(43 75% 50% / 0.25))",
                  textShadow: "0 1px 0 hsl(43 50% 20% / 0.3)",
                }}
              >
                ASTROLOGAI
              </span>
              <Link
                to="/accessibility"
                onClick={onClose}
                aria-label={t.a11y_link_label}
                title={t.a11y_link_label}
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 44,
                  height: 44,
                  background: "hsl(var(--deep-blue-light) / 0.6)",
                  border: "1px solid hsl(var(--gold) / 0.28)",
                  color: "hsl(var(--gold) / 0.9)",
                  fontSize: 18,
                  lineHeight: 1,
                  textDecoration: "none",
                }}
              >
                ♿
              </Link>
            </div>

            {/* Title */}
            <motion.h2
              className="font-heading text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              style={{
                fontSize: "clamp(24px, 6.4vw, 30px)",
                lineHeight: 1.2,
                fontWeight: 600,
                background:
                  "linear-gradient(180deg, hsl(43 90% 88%) 0%, hsl(43 80% 65%) 60%, hsl(38 70% 50%) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                margin: 0,
              }}
            >
              {t.nav_title}
            </motion.h2>
            <motion.p
              className="font-body text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{
                marginTop: 8,
                marginBottom: 22,
                color: "hsl(var(--foreground) / 0.72)",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {t.nav_subtitle}
            </motion.p>

            {/* Cards grid — scrollable */}
            <div
              className="flex-1 overflow-y-auto scrollbar-hide"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div className="grid grid-cols-2 gap-2.5 pb-4">
                {options.map((opt, idx) => (
                  <motion.button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelect(opt.key)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + idx * 0.05, duration: 0.45 }}
                    whileTap={{ scale: 0.96, boxShadow: `0 0 24px hsl(${opt.accent} / 0.45)` }}
                    whileHover={{ scale: 1.02 }}
                    className="relative flex flex-col items-center justify-center text-center"
                    style={{
                      minHeight: 158,
                      padding: "24px 16px",
                      borderRadius: 20,
                      background:
                        "linear-gradient(160deg, hsl(225 50% 9% / 0.92) 0%, hsl(225 55% 5% / 0.94) 100%)",
                      border: `1px solid hsl(${opt.accent} / 0.32)`,
                      boxShadow: `0 8px 26px hsl(${opt.accent} / 0.14), inset 0 1px 0 hsl(var(--gold) / 0.07)`,
                      WebkitTapHighlightColor: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      className="flex items-center justify-center rounded-full mb-4"
                      style={{
                        width: 56,
                        height: 56,
                        background: `radial-gradient(circle at 30% 30%, hsl(${opt.accent} / 0.38) 0%, hsl(${opt.accent} / 0.08) 72%)`,
                        border: `1px solid hsl(${opt.accent} / 0.45)`,
                        color: `hsl(${opt.accent})`,
                        boxShadow: `0 0 18px hsl(${opt.accent} / 0.18)`,
                      }}
                    >
                      {opt.icon}
                    </span>
                    <span
                      className="font-heading"
                      style={{
                        fontSize: 15,
                        lineHeight: 1.32,
                        fontWeight: 600,
                        color: "hsl(var(--foreground) / 0.94)",
                      }}
                    >
                      {opt.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {createPortal(sheet, document.body)}
      {/* Nested option modals — rendered as siblings outside AnimatePresence
          so they animate independently and aren't covered by the sheet's z-[120]. */}
      <DailyHoroscopeModal
        isOpen={active === "daily_horoscope"}
        onClose={() => setActive(null)}
      />
      <MonthlyForecastModal
        isOpen={active === "monthly_forecast"}
        onClose={() => setActive(null)}
      />
      <CompatibilityModal
        isOpen={active === "compatibility"}
        onClose={() => setActive(null)}
      />
      <TarotModal isOpen={active === "tarot"} onClose={() => setActive(null)} />
      <RisingSignModal isOpen={active === "rising"} onClose={() => setActive(null)} />
      <BirthChartModal
        isOpen={active === "birthchart"}
        onClose={() => setActive(null)}
      />
      <DailyCardModal
        isOpen={active === "daily_card"}
        onClose={() => setActive(null)}
      />
      <AstrocartographyModal
        isOpen={active === "astrocarto"}
        onClose={() => setActive(null)}
      />
    </>
  );
};

export default MobileOptionsSheet;
