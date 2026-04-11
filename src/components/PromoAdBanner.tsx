import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/types";

/* ═══════════════════════════════════════════════════════
   PromoAdBanner — Cinematic self-promo with dynamic i18n
   Video background + multilingual text overlay
   ═══════════════════════════════════════════════════════ */

interface AdTranslations {
  headline: string;
  subheadline: string;
  cta: string;
}

const TRANSLATIONS: Record<Language, AdTranslations> = {
  he: {
    headline: "חוויה אסטרולוגית מותאמת אישית",
    subheadline: "הורוסקופ יומי אישי שמותאם לך",
    cta: "גלו עכשיו",
  },
  en: {
    headline: "Personalized Astrology Experience",
    subheadline: "A personal daily horoscope tailored to you",
    cta: "Discover Now",
  },
  ru: {
    headline: "Персонализированный астрологический опыт",
    subheadline: "Личный ежедневный гороскоп, созданный для вас",
    cta: "Узнать сейчас",
  },
  ar: {
    headline: "تجربة فلكية مخصصة لك",
    subheadline: "برج يومي شخصي مصمم خصيصًا لك",
    cta: "اكتشف الآن",
  },
};

const RTL_LANGUAGES: Language[] = ["he", "ar"];

interface Props {
  /** Video source URL — fallback to animated CSS background if not provided */
  videoSrc?: string;
  /** Called when CTA is clicked */
  onCtaClick?: () => void;
  /** Override language (defaults to site language) */
  lang?: Language;
  /** Additional className */
  className?: string;
}

const PromoAdBanner = ({ videoSrc, onCtaClick, lang, className = "" }: Props) => {
  const { language: siteLang } = useLanguage();
  const activeLang = lang || siteLang;
  const isRTL = RTL_LANGUAGES.includes(activeLang);
  const t = TRANSLATIONS[activeLang] || TRANSLATIONS.en;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Auto-play video
  useEffect(() => {
    if (videoRef.current && videoSrc) {
      videoRef.current.play().catch(() => {});
    }
  }, [videoSrc]);

  // Font size scaling for longer languages
  const headlineSize = activeLang === "ru" ? "text-lg md:text-2xl" : "text-xl md:text-3xl";
  const subSize = activeLang === "ru" ? "text-xs md:text-sm" : "text-sm md:text-base";

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl ${className}`}
      style={{
        aspectRatio: "9 / 16",
        maxWidth: 360,
        maxHeight: 640,
        background: "#05081a",
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* ─── Video / Animated background ─── */}
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop
          playsInline
          autoPlay
          onLoadedData={() => setVideoLoaded(true)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: videoLoaded ? 1 : 0, transition: "opacity 0.5s" }}
        />
      ) : (
        <AnimatedFallbackBackground />
      )}

      {/* ─── Gradient overlay for text readability ─── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            to bottom,
            transparent 0%,
            transparent 40%,
            rgba(5, 8, 26, 0.4) 60%,
            rgba(5, 8, 26, 0.85) 80%,
            rgba(5, 8, 26, 0.95) 100%
          )`,
        }}
      />

      {/* ─── Dynamic text overlay ─── */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-8 pb-8 md:pb-12 gap-3">
        {/* Headline */}
        <motion.h3
          key={`headline-${activeLang}`}
          className={`font-heading ${headlineSize} font-bold leading-tight`}
          style={{
            color: "hsl(var(--gold))",
            textShadow: "0 2px 12px rgba(0,0,0,0.6)",
            textAlign: isRTL ? "right" : "left",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {t.headline}
        </motion.h3>

        {/* Subheadline */}
        <motion.p
          key={`sub-${activeLang}`}
          className={`font-body ${subSize} leading-relaxed`}
          style={{
            color: "hsl(var(--foreground) / 0.75)",
            textShadow: "0 1px 8px rgba(0,0,0,0.5)",
            textAlign: isRTL ? "right" : "left",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {t.subheadline}
        </motion.p>

        {/* CTA Button */}
        <motion.button
          key={`cta-${activeLang}`}
          onClick={onCtaClick}
          className="font-heading text-sm md:text-base font-bold py-3 px-6 rounded-full mt-2 self-stretch"
          style={{
            background: "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-light, 43 90% 65%)))",
            color: "#0a0f1e",
            boxShadow: "0 4px 20px hsl(var(--gold) / 0.3), inset 0 1px 0 hsl(var(--gold-light, 43 90% 80%) / 0.5)",
            textAlign: "center",
          }}
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {t.cta}
        </motion.button>

        {/* Subtle "Ad" label */}
        <div
          className="absolute top-3 font-body text-[9px] tracking-wider uppercase"
          style={{
            color: "hsl(var(--foreground) / 0.3)",
            [isRTL ? "left" : "right"]: 12,
          }}
        >
          Ad
        </div>
      </div>
    </div>
  );
};

/* ─── Animated CSS fallback (no video) ─── */
const AnimatedFallbackBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Deep space base */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 30%, #0d1535, #080e28, #030510)",
        }}
      />
      {/* Nebula accent */}
      <motion.div
        className="absolute w-full h-full"
        style={{
          background: "radial-gradient(circle at 30% 25%, rgba(26,10,58,0.4), transparent 60%)",
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      {/* Animated stars */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: i % 3 === 0 ? 2 : 1,
            height: i % 3 === 0 ? 2 : 1,
            background: "#fff",
            left: `${(i * 13.75) % 100}%`,
            top: `${(i * 9.73 + i * i * 0.37) % 100}%`,
          }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
      {/* Central golden glow */}
      <motion.div
        className="absolute"
        style={{
          width: "60%",
          height: "30%",
          left: "20%",
          top: "45%",
          background: "radial-gradient(ellipse, rgba(245,200,66,0.08), transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </div>
  );
};

export default PromoAdBanner;
