import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Moon, Eye, Hand, Sun } from "lucide-react";
import heroFigure from "@/assets/hero-mystic-figure.jpg";
import crystalBall from "@/assets/crystal-ball.png";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import MonthlyForecastModal from "./MonthlyForecastModal";
import RisingSignModal from "./RisingSignModal";
import CompatibilityModal from "./CompatibilityModal";
import TarotModal from "./TarotModal";
import PalmReadingModal from "./PalmReadingModal";
import DailyCardModal from "./DailyCardModal";
import { useT, useLanguage } from "@/i18n";
import type { Language } from "@/i18n";
import { drawTarotCards, type TarotCard } from "@/data/tarotData";
import { tarotCardImages, cardBack } from "@/data/tarotCardImages";
import ariesIcon from "@/assets/zodiac-icons/aries.png";
import taurusIcon from "@/assets/zodiac-icons/taurus.png";
import geminiIcon from "@/assets/zodiac-icons/gemini.png";
import cancerIcon from "@/assets/zodiac-icons/cancer.png";
import leoIcon from "@/assets/zodiac-icons/leo.png";
import virgoIcon from "@/assets/zodiac-icons/virgo.png";
import libraIcon from "@/assets/zodiac-icons/libra.png";
import scorpioIcon from "@/assets/zodiac-icons/scorpio.png";
import sagittariusIcon from "@/assets/zodiac-icons/sagittarius.png";
import capricornIcon from "@/assets/zodiac-icons/capricorn.png";
import aquariusIcon from "@/assets/zodiac-icons/aquarius.png";
import piscesIcon from "@/assets/zodiac-icons/pisces.png";

const constellations = [
  { stars: [[12, 15], [18, 12], [22, 18], [28, 14], [25, 8]], opacity: 0.4 },
  { stars: [[65, 10], [70, 15], [68, 22], [75, 18], [72, 8]], opacity: 0.35 },
  { stars: [[85, 25], [88, 20], [92, 28], [90, 15]], opacity: 0.3 },
  { stars: [[8, 60], [12, 55], [15, 62], [10, 68]], opacity: 0.25 },
  { stars: [[78, 55], [82, 50], [86, 58], [80, 62], [84, 65]], opacity: 0.3 },
  { stars: [[35, 8], [40, 14], [44, 10], [38, 18]], opacity: 0.3 },
  { stars: [[50, 70], [55, 65], [58, 72], [52, 78]], opacity: 0.2 },
  { stars: [[15, 80], [20, 75], [25, 82], [18, 85]], opacity: 0.2 },
];

const FORTUNE_MESSAGES: Record<Language, string[]> = {
  he: [
    "היקום מאותת לך לשים לב להזדמנות שמופיעה היום.",
    "כוח נסתר מתעורר בתוכך — הקשיבו לאינטואיציה.",
    "הכוכבים מיישרים קו לטובתכם... משהו משמעותי מתקרב.",
    "אנרגיה חדשה נכנסת לחייכם — היו פתוחים לשינוי.",
    "המסלול הקוסמי שלכם מתחיל להיחשף... גלו אותו.",
  ],
  en: [
    "The universe signals you to notice an opportunity appearing today.",
    "A hidden force awakens within you — listen to your intuition.",
    "The stars are aligning in your favor... something meaningful approaches.",
    "New energy enters your life — be open to change.",
    "Your cosmic path begins to reveal itself... discover it.",
  ],
  ru: [
    "Вселенная подаёт вам знак — обратите внимание на возможность, появляющуюся сегодня.",
    "Скрытая сила пробуждается в вас — прислушайтесь к интуиции.",
    "Звёзды выстраиваются в вашу пользу... что-то значимое приближается.",
    "Новая энергия входит в вашу жизнь — будьте открыты переменам.",
    "Ваш космический путь начинает раскрываться... откройте его.",
  ],
  ar: [
    "الكون يشير لك للانتباه إلى فرصة تظهر اليوم.",
    "قوة خفية تستيقظ بداخلك — استمع إلى حدسك.",
    "النجوم تصطف لصالحك... شيء مهم يقترب.",
    "طاقة جديدة تدخل حياتك — كن منفتحاً على التغيير.",
    "مسارك الكوني يبدأ بالانكشاف... اكتشفه.",
  ],
};

/* ── Energy colors per menu item ── */
const ITEM_COLORS = [
  { glow: "hsl(43, 80%, 55%)", bg: "hsl(43, 80%, 55%)", label: "gold" },        // Forecast - gold
  { glow: "hsl(215, 70%, 65%)", bg: "hsl(215, 70%, 65%)", label: "silver-blue" }, // Rising - silver blue
  { glow: "hsl(340, 70%, 60%)", bg: "hsl(340, 70%, 60%)", label: "pink" },       // Compatibility - pink
  { glow: "hsl(0, 65%, 50%)", bg: "hsl(0, 65%, 50%)", label: "red" },            // Tarot - red/gold
  { glow: "hsl(43, 90%, 50%)", bg: "hsl(43, 90%, 50%)", label: "sacred-gold" },  // Palm - sacred gold
  { glow: "hsl(280, 70%, 65%)", bg: "hsl(280, 70%, 65%)", label: "violet" },     // Daily Card - mystical violet
];

/* ── Ambient particle ─────────────────────────────── */
const AmbientParticle = ({ type, delay, x, y }: { type: "dust" | "spark" | "orb"; delay: number; x: string; y: string }) => {
  const size = type === "orb" ? "w-2 h-2" : type === "spark" ? "w-0.5 h-0.5" : "w-1 h-1";
  const color = type === "orb" ? "bg-gold/30" : type === "spark" ? "bg-gold/70" : "bg-gold/40";
  const blur = type === "orb" ? "blur-[1px]" : "";

  return (
    <motion.div
      className={`absolute rounded-full ${size} ${color} ${blur}`}
      style={{ left: x, top: y }}
      animate={{
        opacity: [0, type === "orb" ? 0.6 : 1, 0],
        scale: [0, type === "orb" ? 2 : 1.5, 0],
        y: [0, -(20 + Math.random() * 40), -(40 + Math.random() * 60)],
        x: [0, (Math.random() - 0.5) * 30],
      }}
      transition={{
        duration: type === "orb" ? 6 : 4 + Math.random() * 2,
        repeat: Infinity,
        delay,
        ease: "easeOut",
      }}
    />
  );
};

/* ── Constellation component ──────────────────────── */
const Constellation = ({ stars, baseDelay }: { stars: number[][]; baseDelay: number }) => (
  <motion.svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 0.5, 0.5, 0] }}
    transition={{ duration: 10, repeat: Infinity, delay: baseDelay, ease: "easeInOut" }}
  >
    {stars.slice(0, -1).map((star, j) => (
      <motion.line
        key={`l-${j}`}
        x1={`${star[0]}%`} y1={`${star[1]}%`}
        x2={`${stars[j + 1][0]}%`} y2={`${stars[j + 1][1]}%`}
        stroke="hsl(43, 80%, 55%)"
        strokeWidth="0.5"
        strokeOpacity="0.2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 1, 0] }}
        transition={{ duration: 10, repeat: Infinity, delay: baseDelay + j * 0.4, ease: "easeInOut" }}
      />
    ))}
    {stars.map((star, j) => (
      <motion.circle
        key={`s-${j}`}
        cx={`${star[0]}%`} cy={`${star[1]}%`}
        r="1.5"
        fill="hsl(43, 80%, 70%)"
        animate={{ opacity: [0, 0.9, 0.9, 0], r: [1, 2.5, 2.5, 1] }}
        transition={{ duration: 10, repeat: Infinity, delay: baseDelay + j * 0.25, ease: "easeInOut" }}
      />
    ))}
  </motion.svg>
);

/* ── Energy Pulse ──────────────────────────────────── */
const EnergyPulse = ({ isMobile, activeColor, isNearBall, clickBurst }: { isMobile: boolean; activeColor?: string; isNearBall?: boolean; clickBurst?: number }) => {
  const baseSize = isMobile ? 180 : 280;
  const pulseColor = activeColor || "hsl(var(--gold) / 0.15)";
  const intensity = isNearBall ? 1.4 : 1;

  return (
    <>
      {/* Primary expanding rings — randomized natural timing */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none z-10"
          style={{
            width: baseSize,
            height: baseSize,
            border: `1px solid ${pulseColor}`,
            boxShadow: `0 0 ${isNearBall ? 15 : 8}px ${pulseColor}`,
          }}
          animate={{
            scale: [1, 2.5],
            opacity: [0.4 * intensity, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            delay: i * 1.2 + 6 + Math.random() * 2,
            repeatDelay: 6 + Math.random() * 4,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Secondary blue cosmic wave */}
      <motion.div
        className="absolute rounded-full pointer-events-none z-10"
        style={{
          width: baseSize * 0.8,
          height: baseSize * 0.8,
          background: "radial-gradient(circle, hsl(var(--celestial) / 0.08) 0%, transparent 70%)",
        }}
        animate={{
          scale: [0.8, 2.8],
          opacity: [0.3 * intensity, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: 8 + Math.random() * 2,
          repeatDelay: 7 + Math.random() * 3,
          ease: "easeOut",
        }}
      />

      {/* Light wave shimmer across sphere surface */}
      <motion.div
        className="absolute rounded-full pointer-events-none z-[21] overflow-hidden"
        style={{
          width: isMobile ? 140 : 220,
          height: isMobile ? 140 : 220,
        }}
      >
        <motion.div
          className="absolute"
          style={{
            width: "30%",
            height: "120%",
            top: "-10%",
            background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.08), hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08), transparent)",
            filter: "blur(8px)",
            borderRadius: "50%",
          }}
          animate={{
            left: ["-30%", "130%"],
            opacity: [0, 0.6 * intensity, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 7,
            repeatDelay: 8 + Math.random() * 4,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Scatter particles */}
      {[...Array(isMobile ? 8 : 12)].map((_, i) => {
        const angle = (i / (isMobile ? 8 : 12)) * Math.PI * 2;
        const dist = isMobile ? 80 : 130;
        return (
          <motion.div
            key={`bp-${i}`}
            className="absolute rounded-full pointer-events-none z-10"
            style={{
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              background: i % 2 === 0
                ? (activeColor || "hsl(var(--gold) / 0.7)")
                : "hsl(var(--celestial) / 0.5)",
            }}
            animate={{
              x: [0, Math.cos(angle) * dist * intensity],
              y: [0, Math.sin(angle) * dist * intensity],
              opacity: [0, 0.8 * intensity, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: 6 + Math.random() * 2,
              repeatDelay: 6 + Math.random() * 4,
              ease: "easeOut",
            }}
          />
        );
      })}

      {/* Click burst — strong pulse on click */}
      <AnimatePresence>
        {clickBurst && clickBurst > 0 && (
          <>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={`click-ring-${clickBurst}-${i}`}
                className="absolute rounded-full pointer-events-none z-10"
                style={{
                  width: baseSize * 0.6,
                  height: baseSize * 0.6,
                  border: `2px solid ${activeColor || "hsl(var(--gold) / 0.4)"}`,
                  boxShadow: `0 0 20px ${activeColor || "hsl(var(--gold) / 0.3)"}`,
                }}
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 3, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, delay: i * 0.15, ease: "easeOut" }}
              />
            ))}
            {[...Array(16)].map((_, i) => {
              const angle = (i / 16) * Math.PI * 2;
              return (
                <motion.div
                  key={`click-p-${clickBurst}-${i}`}
                  className="absolute rounded-full pointer-events-none z-10"
                  style={{
                    width: i % 3 === 0 ? 4 : 2,
                    height: i % 3 === 0 ? 4 : 2,
                    background: i % 3 === 0 ? "hsl(var(--gold))" : i % 3 === 1 ? "hsl(var(--celestial))" : "hsl(var(--crimson) / 0.6)",
                  }}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{
                    x: Math.cos(angle) * (100 + Math.random() * 60),
                    y: Math.sin(angle) * (100 + Math.random() * 60),
                    opacity: [0, 1, 0],
                    scale: [0, 2, 0],
                  }}
                  transition={{ duration: 1.2 + Math.random() * 0.5, ease: "easeOut" }}
                />
              );
            })}
          </>
        )}
      </AnimatePresence>
    </>
  );
};

/* ── Crystal Ball Internal Energy — Premium Video Sphere ──────────── */
const CrystalBallEnergy = ({ isMobile }: { isMobile: boolean }) => {
  const s = isMobile ? 180 : 320;
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const activeRef = useRef<"a" | "b">("a");
  const [opacity, setOpacity] = useState<{ a: number; b: number }>({ a: 1, b: 0 });

  useEffect(() => {
    const vA = videoARef.current;
    const vB = videoBRef.current;
    if (!vA || !vB) return;
    vA.playbackRate = 0.65;
    vB.playbackRate = 0.65;

    // Crossfade near end of whichever copy is active
    const crossfade = () => {
      const active = activeRef.current === "a" ? vA : vB;
      const standby = activeRef.current === "a" ? vB : vA;
      if (!active.duration || active.paused) return;
      const remaining = active.duration - active.currentTime;
      if (remaining < 1.0) {
        standby.currentTime = 0;
        standby.play().catch(() => {});
        activeRef.current = activeRef.current === "a" ? "b" : "a";
        setOpacity(activeRef.current === "a" ? { a: 1, b: 0 } : { a: 0, b: 1 });
      }
    };

    const interval = setInterval(crossfade, 100);
    return () => clearInterval(interval);
  }, []);

  const vidBase: React.CSSProperties = {
    objectFit: "cover",
    filter: "saturate(1.3) brightness(1.08) contrast(1.05)",
    transition: "opacity 1.5s ease-in-out",
  };

  return (
    <div
      className="absolute z-[21] pointer-events-none"
      style={{
        width: s, height: s,
        borderRadius: "50%",
        overflow: "hidden",
        clipPath: "circle(48% at 50% 50%)",
      }}
    >
      {/* Dual videos for seamless crossfade loop */}
      <video ref={videoARef} autoPlay loop muted playsInline src="/videos/cosmic-ball.mp4"
        className="absolute inset-0 w-full h-full" style={{ ...vidBase, opacity: opacity.a }} />
      <video ref={videoBRef} muted loop playsInline src="/videos/cosmic-ball.mp4"
        className="absolute inset-0 w-full h-full" style={{ ...vidBase, opacity: opacity.b }} />

      {/* 1. Soft spherical vignette — NO hard black edge */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(circle at 50% 50%, transparent 40%, rgba(20,15,40,0.12) 60%, rgba(10,8,30,0.25) 80%, rgba(5,3,20,0.4) 100%)",
        zIndex: 2,
      }} />

      {/* 2. Chromatic fog — very slow rotation */}
      <motion.div className="absolute inset-0" style={{
        background: `
          radial-gradient(circle at 30% 25%, rgba(200,175,120,0.08) 0%, transparent 40%),
          radial-gradient(circle at 70% 75%, rgba(90,130,210,0.07) 0%, transparent 38%),
          radial-gradient(circle at 55% 45%, rgba(160,120,200,0.05) 0%, transparent 45%)
        `,
        zIndex: 3,
      }} animate={{ rotate: [0, 360] }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} />

      {/* 3. Primary specular highlight — top-left glass reflection */}
      <div className="absolute" style={{
        width: "55%", height: "45%", top: "5%", left: "10%",
        borderRadius: "50%",
        background: "radial-gradient(ellipse at 40% 30%, rgba(255,254,248,0.3) 0%, rgba(255,254,248,0.08) 40%, transparent 100%)",
        zIndex: 6,
      }} />

      {/* 4. Secondary specular — bottom right */}
      <div className="absolute" style={{
        width: "20%", height: "16%", bottom: "12%", right: "14%",
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(255,252,245,0.12) 0%, transparent 100%)",
        zIndex: 6,
      }} />

      {/* 5. Crescent arc — thin glass edge reflection */}
      <div className="absolute" style={{
        width: "84%", height: "84%", top: "3%", left: "8%",
        borderRadius: "50%",
        border: "1px solid rgba(255,252,245,0.12)",
        borderBottom: "none", borderRight: "none",
        zIndex: 6,
      }} />

      {/* 6. Warm inner glow instead of dark rim */}
      <div className="absolute inset-0" style={{
        borderRadius: "50%",
        boxShadow: `
          inset 0 0 20px 4px rgba(180,160,120,0.06),
          inset 0 0 50px 8px rgba(100,120,200,0.04),
          inset 0 6px 15px 0 rgba(255,250,235,0.05)
        `,
        zIndex: 7,
      }} />

      {/* 7. Sweeping light refraction — periodic */}
      <motion.div className="absolute" style={{
        width: "22%", height: "110%", top: "-5%",
        background: "linear-gradient(90deg, transparent, rgba(255,252,245,0.06), rgba(255,252,245,0.12), rgba(255,252,245,0.06), transparent)",
        filter: "blur(6px)",
        borderRadius: "50%",
        zIndex: 8,
      }} animate={{ left: ["-25%", "125%"] }}
         transition={{ duration: 5, repeat: Infinity, repeatDelay: 10, ease: "easeInOut" }} />

      {/* 8. Soft center luminosity */}
      <div className="absolute" style={{
        width: "35%", height: "35%", top: "32%", left: "32%",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,240,185,0.1) 0%, rgba(255,225,140,0.03) 50%, transparent 100%)",
        zIndex: 3,
      }} />

      {/* 9. Edge-softening fade — blends sphere into scene */}
      <div className="absolute inset-0" style={{
        borderRadius: "50%",
        boxShadow: "inset 0 0 8px 4px rgba(20,15,40,0.15)",
        zIndex: 9,
      }} />
    </div>
  );
};

/* ── Zodiac Wheel ──────────────────────────────────── */
const ZODIAC_ICONS = [ariesIcon, taurusIcon, geminiIcon, cancerIcon, leoIcon, virgoIcon, libraIcon, scorpioIcon, sagittariusIcon, capricornIcon, aquariusIcon, piscesIcon];

const ZODIAC_META: Record<Language, { element: string; keyword: string }[]> = {
  he: [
    { element: "אש", keyword: "יוזמה" }, { element: "אדמה", keyword: "יציבות" }, { element: "אוויר", keyword: "תקשורת" },
    { element: "מים", keyword: "רגש" }, { element: "אש", keyword: "יצירתיות" }, { element: "אדמה", keyword: "ניתוח" },
    { element: "אוויר", keyword: "איזון" }, { element: "מים", keyword: "עוצמה" }, { element: "אש", keyword: "חופש" },
    { element: "אדמה", keyword: "שאיפה" }, { element: "אוויר", keyword: "חזון" }, { element: "מים", keyword: "אינטואיציה" },
  ],
  en: [
    { element: "Fire", keyword: "Initiative" }, { element: "Earth", keyword: "Stability" }, { element: "Air", keyword: "Communication" },
    { element: "Water", keyword: "Emotion" }, { element: "Fire", keyword: "Creativity" }, { element: "Earth", keyword: "Analysis" },
    { element: "Air", keyword: "Balance" }, { element: "Water", keyword: "Intensity" }, { element: "Fire", keyword: "Freedom" },
    { element: "Earth", keyword: "Ambition" }, { element: "Air", keyword: "Vision" }, { element: "Water", keyword: "Intuition" },
  ],
  ru: [
    { element: "Огонь", keyword: "Инициатива" }, { element: "Земля", keyword: "Стабильность" }, { element: "Воздух", keyword: "Общение" },
    { element: "Вода", keyword: "Эмоция" }, { element: "Огонь", keyword: "Творчество" }, { element: "Земля", keyword: "Анализ" },
    { element: "Воздух", keyword: "Баланс" }, { element: "Вода", keyword: "Мощь" }, { element: "Огонь", keyword: "Свобода" },
    { element: "Земля", keyword: "Амбиция" }, { element: "Воздух", keyword: "Видение" }, { element: "Вода", keyword: "Интуиция" },
  ],
  ar: [
    { element: "نار", keyword: "مبادرة" }, { element: "أرض", keyword: "ثبات" }, { element: "هواء", keyword: "تواصل" },
    { element: "ماء", keyword: "عاطفة" }, { element: "نار", keyword: "إبداع" }, { element: "أرض", keyword: "تحليل" },
    { element: "هواء", keyword: "توازن" }, { element: "ماء", keyword: "قوة" }, { element: "نار", keyword: "حرية" },
    { element: "أرض", keyword: "طموح" }, { element: "هواء", keyword: "رؤية" }, { element: "ماء", keyword: "حدس" },
  ],
};

// Ruling sign date ranges
const ZODIAC_DATE_RANGES: Record<Language, string[]> = {
  he: [
    "21 במרץ – 19 באפריל", "20 באפריל – 20 במאי", "21 במאי – 20 ביוני",
    "21 ביוני – 22 ביולי", "23 ביולי – 22 באוגוסט", "23 באוגוסט – 22 בספטמבר",
    "23 בספטמבר – 22 באוקטובר", "23 באוקטובר – 21 בנובמבר", "22 בנובמבר – 21 בדצמבר",
    "22 בדצמבר – 19 בינואר", "20 בינואר – 18 בפברואר", "19 בפברואר – 20 במרץ",
  ],
  en: [
    "Mar 21 – Apr 19", "Apr 20 – May 20", "May 21 – Jun 20",
    "Jun 21 – Jul 22", "Jul 23 – Aug 22", "Aug 23 – Sep 22",
    "Sep 23 – Oct 22", "Oct 23 – Nov 21", "Nov 22 – Dec 21",
    "Dec 22 – Jan 19", "Jan 20 – Feb 18", "Feb 19 – Mar 20",
  ],
  ru: [
    "21 мар – 19 апр", "20 апр – 20 мая", "21 мая – 20 июн",
    "21 июн – 22 июл", "23 июл – 22 авг", "23 авг – 22 сен",
    "23 сен – 22 окт", "23 окт – 21 ноя", "22 ноя – 21 дек",
    "22 дек – 19 янв", "20 янв – 18 фев", "19 фев – 20 мар",
  ],
  ar: [
    "21 مارس – 19 أبريل", "20 أبريل – 20 مايو", "21 مايو – 20 يونيو",
    "21 يونيو – 22 يوليو", "23 يوليو – 22 أغسطس", "23 أغسطس – 22 سبتمبر",
    "23 سبتمبر – 22 أكتوبر", "23 أكتوبر – 21 نوفمبر", "22 نوفمبر – 21 ديسمبر",
    "22 ديسمبر – 19 يناير", "20 يناير – 18 فبراير", "19 فبراير – 20 مارس",
  ],
};

// Short energy description for the ruling sign hover
const ZODIAC_RULING_ENERGY: Record<Language, string[]> = {
  he: [
    "אנרגיה של התחלות חדשות והובלה נועזת", "זמן לבנות יציבות ולהתחבר לחושים", "תקשורת זורמת וסקרנות אינטלקטואלית",
    "עונה של רגש עמוק וחיבור משפחתי", "זמן ליצירתיות, ביטוי עצמי והקרנה", "תקופה של סדר, ניתוח ותשומת לב לפרטים",
    "חיפוש אחר הרמוניה, שותפות ואיזון", "עוצמה פנימית, טרנספורמציה ועומק", "חופש, הרפתקאות וחיפוש אחר משמעות",
    "שאיפה, משמעת ובניית מסד איתן", "חזון מקורי, חדשנות ורוח חופשית", "אינטואיציה עמוקה, חלומות והשראה רוחנית",
  ],
  en: [
    "A time of bold new beginnings and fearless initiative", "Building stability and connecting with the senses", "Flowing communication and intellectual curiosity",
    "Deep emotion, nurturing, and family connections", "Creativity, self-expression, and radiant confidence", "Order, analysis, and attention to detail",
    "Seeking harmony, partnership, and balance", "Inner power, transformation, and depth", "Freedom, adventure, and the search for meaning",
    "Ambition, discipline, and building strong foundations", "Original vision, innovation, and free spirit", "Deep intuition, dreams, and spiritual inspiration",
  ],
  ru: [
    "Время смелых начинаний и бесстрашной инициативы", "Построение стабильности и связь с чувствами", "Свободное общение и интеллектуальное любопытство",
    "Глубокие эмоции, забота и семейные связи", "Творчество, самовыражение и сияющая уверенность", "Порядок, анализ и внимание к деталям",
    "Поиск гармонии, партнёрства и баланса", "Внутренняя сила, трансформация и глубина", "Свобода, приключения и поиск смысла",
    "Амбиции, дисциплина и построение прочного фундамента", "Оригинальное видение, инновации и свободный дух", "Глубокая интуиция, сны и духовное вдохновение",
  ],
  ar: [
    "وقت البدايات الجريئة والمبادرة الشجاعة", "بناء الاستقرار والتواصل مع الحواس", "تواصل متدفق وفضول فكري",
    "عاطفة عميقة ورعاية وروابط عائلية", "إبداع وتعبير عن الذات وثقة مشعة", "نظام وتحليل واهتمام بالتفاصيل",
    "البحث عن الانسجام والشراكة والتوازن", "قوة داخلية وتحول وعمق", "حرية ومغامرة والبحث عن المعنى",
    "طموح وانضباط وبناء أسس متينة", "رؤية أصيلة وابتكار وروح حرة", "حدس عميق وأحلام وإلهام روحي",
  ],
};

const RULING_LABEL: Record<Language, string> = {
  he: "המזל השולט כעת",
  en: "Current ruling sign",
  ru: "Текущий правящий знак",
  ar: "البرج الحاكم الحالي",
};

const ZODIAC_WHEEL: Record<Language, { name: string; en: string }[]> = {
  he: [
    { name: "טלה", en: "Aries" }, { name: "שור", en: "Taurus" }, { name: "תאומים", en: "Gemini" },
    { name: "סרטן", en: "Cancer" }, { name: "אריה", en: "Leo" }, { name: "בתולה", en: "Virgo" },
    { name: "מאזניים", en: "Libra" }, { name: "עקרב", en: "Scorpio" }, { name: "קשת", en: "Sagittarius" },
    { name: "גדי", en: "Capricorn" }, { name: "דלי", en: "Aquarius" }, { name: "דגים", en: "Pisces" },
  ],
  en: [
    { name: "Aries", en: "Aries" }, { name: "Taurus", en: "Taurus" }, { name: "Gemini", en: "Gemini" },
    { name: "Cancer", en: "Cancer" }, { name: "Leo", en: "Leo" }, { name: "Virgo", en: "Virgo" },
    { name: "Libra", en: "Libra" }, { name: "Scorpio", en: "Scorpio" }, { name: "Sagittarius", en: "Sagittarius" },
    { name: "Capricorn", en: "Capricorn" }, { name: "Aquarius", en: "Aquarius" }, { name: "Pisces", en: "Pisces" },
  ],
  ru: [
    { name: "Овен", en: "Aries" }, { name: "Телец", en: "Taurus" }, { name: "Близнецы", en: "Gemini" },
    { name: "Рак", en: "Cancer" }, { name: "Лев", en: "Leo" }, { name: "Дева", en: "Virgo" },
    { name: "Весы", en: "Libra" }, { name: "Скорпион", en: "Scorpio" }, { name: "Стрелец", en: "Sagittarius" },
    { name: "Козерог", en: "Capricorn" }, { name: "Водолей", en: "Aquarius" }, { name: "Рыбы", en: "Pisces" },
  ],
  ar: [
    { name: "الحمل", en: "Aries" }, { name: "الثور", en: "Taurus" }, { name: "الجوزاء", en: "Gemini" },
    { name: "السرطان", en: "Cancer" }, { name: "الأسد", en: "Leo" }, { name: "العذراء", en: "Virgo" },
    { name: "الميزان", en: "Libra" }, { name: "العقرب", en: "Scorpio" }, { name: "القوس", en: "Sagittarius" },
    { name: "الجدي", en: "Capricorn" }, { name: "الدلو", en: "Aquarius" }, { name: "الحوت", en: "Pisces" },
  ],
};

// Get current ruling zodiac sign index based on date
function getRulingSignIndex(): number {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  // Zodiac date ranges (index matches ZODIAC_WHEEL order)
  const ranges: [number, number, number, number][] = [
    [3, 21, 4, 19],   // 0 Aries
    [4, 20, 5, 20],   // 1 Taurus
    [5, 21, 6, 20],   // 2 Gemini
    [6, 21, 7, 22],   // 3 Cancer
    [7, 23, 8, 22],   // 4 Leo
    [8, 23, 9, 22],   // 5 Virgo
    [9, 23, 10, 22],  // 6 Libra
    [10, 23, 11, 21], // 7 Scorpio
    [11, 22, 12, 21], // 8 Sagittarius
    [12, 22, 1, 19],  // 9 Capricorn
    [1, 20, 2, 18],   // 10 Aquarius
    [2, 19, 3, 20],   // 11 Pisces
  ];
  for (let i = 0; i < ranges.length; i++) {
    const [sm, sd, em, ed] = ranges[i];
    if (i === 9) { // Capricorn wraps year
      if ((m === sm && d >= sd) || (m === 1 && d <= ed)) return i;
    } else {
      if ((m === sm && d >= sd) || (m === em && d <= ed)) return i;
    }
  }
  return 9; // fallback Capricorn
}
// Planetary influence data type
type PlanetaryInfluence = {
  planet: string;
  planet_symbol: string;
  zodiac_sign_index: number;
  influence_area: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  life_area: Record<Language, string>;
};

const PLANET_COLORS: Record<string, string> = {
  Venus: "330 60% 65%",
  Mars: "0 70% 55%",
  Jupiter: "35 60% 55%",
  Saturn: "220 15% 50%",
};

const INFLUENCE_AREA_ICONS: Record<string, string> = {
  love: "❤️",
  energy: "⚡",
  communication: "💬",
  growth: "🌱",
  discipline: "🏛️",
  transformation: "🔮",
  intuition: "👁️",
  creativity: "🎨",
};

// ── Daily Planetary Influence Data ─────────────────────
const PLANETS = [
  { name: "Venus", symbol: "♀", area: "love" },
  { name: "Mars", symbol: "♂", area: "energy" },
  { name: "Jupiter", symbol: "♃", area: "growth" },
  { name: "Saturn", symbol: "♄", area: "discipline" },
] as const;

const SIGN_NAMES_EN = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

// Pre-written titles per planet×sign (4 planets × 12 signs = 48)
const INFLUENCE_TITLES: Record<string, Record<Language, string>> = {
  "Venus-0": { he: "ונוס בטלה", en: "Venus in Aries", ru: "Венера в Овне", ar: "الزهرة في الحمل" },
  "Venus-1": { he: "ונוס בשור", en: "Venus in Taurus", ru: "Венера в Тельце", ar: "الزهرة في الثور" },
  "Venus-2": { he: "ונוס בתאומים", en: "Venus in Gemini", ru: "Венера в Близнецах", ar: "الزهرة في الجوزاء" },
  "Venus-3": { he: "ונוס בסרטן", en: "Venus in Cancer", ru: "Венера в Раке", ar: "الزهرة في السرطان" },
  "Venus-4": { he: "ונוס באריה", en: "Venus in Leo", ru: "Венера во Льве", ar: "الزهرة في الأسد" },
  "Venus-5": { he: "ונוס בבתולה", en: "Venus in Virgo", ru: "Венера в Деве", ar: "الزهرة في العذراء" },
  "Venus-6": { he: "ונוס במאזניים", en: "Venus in Libra", ru: "Венера в Весах", ar: "الزهرة في الميزان" },
  "Venus-7": { he: "ונוס בעקרב", en: "Venus in Scorpio", ru: "Венера в Скорпионе", ar: "الزهرة في العقرب" },
  "Venus-8": { he: "ונוס בקשת", en: "Venus in Sagittarius", ru: "Венера в Стрельце", ar: "الزهرة في القوس" },
  "Venus-9": { he: "ונוס בגדי", en: "Venus in Capricorn", ru: "Венера в Козероге", ar: "الزهرة في الجدي" },
  "Venus-10": { he: "ונוס בדלי", en: "Venus in Aquarius", ru: "Венера в Водолее", ar: "الزهرة في الدلو" },
  "Venus-11": { he: "ונוס בדגים", en: "Venus in Pisces", ru: "Венера в Рыбах", ar: "الزهرة في الحوت" },
  "Mars-0": { he: "מאדים בטלה", en: "Mars in Aries", ru: "Марс в Овне", ar: "المريخ في الحمل" },
  "Mars-1": { he: "מאדים בשור", en: "Mars in Taurus", ru: "Марс в Тельце", ar: "المريخ في الثور" },
  "Mars-2": { he: "מאדים בתאומים", en: "Mars in Gemini", ru: "Марс в Близнецах", ar: "المريخ في الجوزاء" },
  "Mars-3": { he: "מאדים בסרטן", en: "Mars in Cancer", ru: "Марс в Раке", ar: "المريخ في السرطان" },
  "Mars-4": { he: "מאדים באריה", en: "Mars in Leo", ru: "Марс во Льве", ar: "المريخ في الأسد" },
  "Mars-5": { he: "מאדים בבתולה", en: "Mars in Virgo", ru: "Марс в Деве", ar: "المريخ في العذراء" },
  "Mars-6": { he: "מאדים במאזניים", en: "Mars in Libra", ru: "Марс в Весах", ar: "المريخ في الميزان" },
  "Mars-7": { he: "מאדים בעקרב", en: "Mars in Scorpio", ru: "Марс в Скорпионе", ar: "المريخ في العقرب" },
  "Mars-8": { he: "מאדים בקשת", en: "Mars in Sagittarius", ru: "Марс в Стрельце", ar: "المريخ في القوس" },
  "Mars-9": { he: "מאדים בגדי", en: "Mars in Capricorn", ru: "Марс в Козероге", ar: "المريخ في الجدي" },
  "Mars-10": { he: "מאדים בדלי", en: "Mars in Aquarius", ru: "Марс в Водолее", ar: "المريخ في الدلو" },
  "Mars-11": { he: "מאדים בדגים", en: "Mars in Pisces", ru: "Марс в Рыбах", ar: "المريخ في الحوت" },
  "Jupiter-0": { he: "צדק בטלה", en: "Jupiter in Aries", ru: "Юпитер в Овне", ar: "المشتري في الحمل" },
  "Jupiter-1": { he: "צדק בשור", en: "Jupiter in Taurus", ru: "Юпитер в Тельце", ar: "المشتري في الثور" },
  "Jupiter-2": { he: "צדק בתאומים", en: "Jupiter in Gemini", ru: "Юпитер в Близнецах", ar: "المشتري في الجوزاء" },
  "Jupiter-3": { he: "צדק בסרטן", en: "Jupiter in Cancer", ru: "Юпитер в Раке", ar: "المشتري في السرطان" },
  "Jupiter-4": { he: "צדק באריה", en: "Jupiter in Leo", ru: "Юпитер во Льве", ar: "المشتري في الأسد" },
  "Jupiter-5": { he: "צדק בבתולה", en: "Jupiter in Virgo", ru: "Юпитер в Деве", ar: "المشتري في العذراء" },
  "Jupiter-6": { he: "צדק במאזניים", en: "Jupiter in Libra", ru: "Юпитер в Весах", ar: "المشتري في الميزان" },
  "Jupiter-7": { he: "צדק בעקרב", en: "Jupiter in Scorpio", ru: "Юпитер в Скорпионе", ar: "المشتري في العقرب" },
  "Jupiter-8": { he: "צדק בקשת", en: "Jupiter in Sagittarius", ru: "Юпитер в Стрельце", ar: "المشتري في القوس" },
  "Jupiter-9": { he: "צדק בגדי", en: "Jupiter in Capricorn", ru: "Юпитер в Козероге", ar: "المشتري في الجدي" },
  "Jupiter-10": { he: "צדק בדלי", en: "Jupiter in Aquarius", ru: "Юпитер в Водолее", ar: "المشتري في الدلو" },
  "Jupiter-11": { he: "צדק בדגים", en: "Jupiter in Pisces", ru: "Юпитер в Рыбах", ar: "المشتري في الحوت" },
  "Saturn-0": { he: "שבתאי בטלה", en: "Saturn in Aries", ru: "Сатурн в Овне", ar: "زحل في الحمل" },
  "Saturn-1": { he: "שבתאי בשור", en: "Saturn in Taurus", ru: "Сатурн в Тельце", ar: "زحل في الثور" },
  "Saturn-2": { he: "שבתאי בתאומים", en: "Saturn in Gemini", ru: "Сатурн в Близнецах", ar: "زحل في الجوزاء" },
  "Saturn-3": { he: "שבתאי בסרטן", en: "Saturn in Cancer", ru: "Сатурн в Раке", ar: "زحل في السرطان" },
  "Saturn-4": { he: "שבתאי באריה", en: "Saturn in Leo", ru: "Сатурн во Льве", ar: "زحل في الأسد" },
  "Saturn-5": { he: "שבתאי בבתולה", en: "Saturn in Virgo", ru: "Сатурн в Деве", ar: "زحل في العذراء" },
  "Saturn-6": { he: "שבתאי במאזניים", en: "Saturn in Libra", ru: "Сатурн в Весах", ar: "زحل في الميزان" },
  "Saturn-7": { he: "שבתאי בעקרב", en: "Saturn in Scorpio", ru: "Сатурн в Скорпионе", ar: "زحل في العقرب" },
  "Saturn-8": { he: "שבתאי בקשת", en: "Saturn in Sagittarius", ru: "Сатурн в Стрельце", ar: "زحل في القوس" },
  "Saturn-9": { he: "שבתאי בגדי", en: "Saturn in Capricorn", ru: "Сатурн в Козероге", ar: "زحل في الجدي" },
  "Saturn-10": { he: "שבתאי בדלי", en: "Saturn in Aquarius", ru: "Сатурн в Водолее", ar: "زحل في الدلو" },
  "Saturn-11": { he: "שבתאי בדגים", en: "Saturn in Pisces", ru: "Сатурн в Рыбах", ar: "زحل في الحوت" },
};

// Pre-written interpretations per planet×sign
const INFLUENCE_DESCRIPTIONS: Record<string, Record<Language, string>> = {
  "Venus-0": { he: "אהבה נועזת ותשוקה בוערת מנחים את הלב. זה הזמן ליוזמה רומנטית", en: "Bold love and burning passion guide the heart. Time for romantic initiative", ru: "Смелая любовь и горячая страсть ведут сердце. Время для романтической инициативы", ar: "الحب الجريء والعاطفة المشتعلة يقودان القلب. وقت المبادرة الرومانسية" },
  "Venus-1": { he: "חיבור חושני ועמוק לאסתטיקה ונוחות. הנאות פשוטות מביאות אושר", en: "Deep sensual connection to beauty and comfort. Simple pleasures bring happiness", ru: "Глубокая чувственная связь с красотой и комфортом. Простые удовольствия приносят счастье", ar: "ارتباط حسي عميق بالجمال والراحة. المتع البسيطة تجلب السعادة" },
  "Venus-2": { he: "תקשורת מקסימה וקלילות בזוגיות. שיחות עמוקות פותחות דלתות חדשות", en: "Charming communication and lightness in relationships. Deep conversations open new doors", ru: "Очаровательное общение и лёгкость в отношениях. Глубокие разговоры открывают новые двери", ar: "تواصل ساحر وخفة في العلاقات. المحادثات العميقة تفتح أبواباً جديدة" },
  "Venus-3": { he: "רגשות עמוקים וצורך בביטחון רגשי. הבית הופך למקדש של אהבה", en: "Deep emotions and need for emotional security. Home becomes a sanctuary of love", ru: "Глубокие эмоции и потребность в эмоциональной безопасности. Дом становится святилищем любви", ar: "عواطف عميقة وحاجة للأمان العاطفي. المنزل يصبح ملاذاً للحب" },
  "Venus-4": { he: "רומנטיקה דרמטית ונדיבות רגשית. הלב מבקש תשומת לב והערצה", en: "Dramatic romance and emotional generosity. The heart seeks attention and admiration", ru: "Драматическая романтика и эмоциональная щедрость. Сердце ищет внимания и восхищения", ar: "رومانسية درامية وكرم عاطفي. القلب يبحث عن الاهتمام والإعجاب" },
  "Venus-5": { he: "אהבה מעשית ודקדקנית. תשומת לב לפרטים מחזקת את הקשר", en: "Practical and attentive love. Attention to detail strengthens the bond", ru: "Практичная и внимательная любовь. Внимание к деталям укрепляет связь", ar: "حب عملي ودقيق. الاهتمام بالتفاصيل يقوي الرابطة" },
  "Venus-6": { he: "הרמוניה ואיזון בזוגיות. חיפוש אחר יופי ושלווה בכל מערכת יחסים", en: "Harmony and balance in partnerships. Seeking beauty and peace in every relationship", ru: "Гармония и баланс в партнёрстве. Поиск красоты и покоя в каждых отношениях", ar: "انسجام وتوازن في الشراكات. البحث عن الجمال والسلام في كل علاقة" },
  "Venus-7": { he: "משיכה מגנטית ועוצמה רגשית. רגשות עמוקים ומורכבים שולטים", en: "Magnetic attraction and emotional intensity. Deep, complex feelings dominate", ru: "Магнетическое притяжение и эмоциональная интенсивность. Глубокие, сложные чувства доминируют", ar: "جاذبية مغناطيسية وحدة عاطفية. المشاعر العميقة والمعقدة تسيطر" },
  "Venus-8": { he: "הרפתקה רומנטית וחופש רגשי. פתיחות לחוויות חדשות באהבה", en: "Romantic adventure and emotional freedom. Openness to new experiences in love", ru: "Романтическое приключение и эмоциональная свобода. Открытость к новому опыту в любви", ar: "مغامرة رومانسية وحرية عاطفية. انفتاح على تجارب جديدة في الحب" },
  "Venus-9": { he: "אהבה מחויבת ורצינית. בניית יסודות חזקים לעתיד משותף", en: "Committed and serious love. Building strong foundations for a shared future", ru: "Преданная и серьёзная любовь. Строительство крепкого фундамента для совместного будущего", ar: "حب ملتزم وجاد. بناء أسس قوية لمستقبل مشترك" },
  "Venus-10": { he: "אהבה לא שגרתית ומפתיעה. חיבורים ייחודיים שוברים את השגרה", en: "Unconventional and surprising love. Unique connections break the routine", ru: "Нетрадиционная и удивительная любовь. Уникальные связи разрушают рутину", ar: "حب غير تقليدي ومفاجئ. روابط فريدة تكسر الروتين" },
  "Venus-11": { he: "אהבה חלומית ורוחנית. חיבור נשמתי עמוק מעבר למילים", en: "Dreamy, spiritual love. Deep soul connection beyond words", ru: "Мечтательная, духовная любовь. Глубокая связь душ за пределами слов", ar: "حب حالم وروحاني. ارتباط روحي عميق يتجاوز الكلمات" },
  "Mars-0": { he: "אנרגיה בוערת ודחף לפעולה. הכוח הפנימי בשיאו", en: "Burning energy and drive to act. Inner power at its peak", ru: "Горящая энергия и стремление к действию. Внутренняя сила на пике", ar: "طاقة مشتعلة ودافع للعمل. القوة الداخلية في ذروتها" },
  "Mars-1": { he: "נחישות יציבה והתמדה. כוח רצון שאינו נשבר", en: "Steady determination and persistence. Unbreakable willpower", ru: "Устойчивая решимость и настойчивость. Несокрушимая сила воли", ar: "عزيمة ثابتة ومثابرة. إرادة لا تنكسر" },
  "Mars-2": { he: "מחשבה חדה ותגובות מהירות. אנרגיה מנטלית גבוהה", en: "Sharp thinking and quick reactions. High mental energy", ru: "Острое мышление и быстрые реакции. Высокая ментальная энергия", ar: "تفكير حاد وردود فعل سريعة. طاقة ذهنية عالية" },
  "Mars-3": { he: "פעולה מונעת רגש ואינסטינקט. הגנה על הקרובים", en: "Emotion-driven action and instinct. Protecting loved ones", ru: "Действие, движимое эмоциями и инстинктом. Защита близких", ar: "عمل مدفوع بالعاطفة والغريزة. حماية الأحباء" },
  "Mars-4": { he: "ביטחון עצמי גבוה ואומץ. אנרגיה יצירתית שולטת", en: "High confidence and courage. Creative energy dominates", ru: "Высокая уверенность и храбрость. Доминирует творческая энергия", ar: "ثقة عالية بالنفس وشجاعة. الطاقة الإبداعية تسيطر" },
  "Mars-5": { he: "דיוק ויעילות בפעולה. אנרגיה מכוונת למטרה ברורה", en: "Precision and efficiency in action. Energy directed at a clear goal", ru: "Точность и эффективность в действиях. Энергия направлена на чёткую цель", ar: "دقة وكفاءة في العمل. طاقة موجهة نحو هدف واضح" },
  "Mars-6": { he: "פעולה דיפלומטית ומאוזנת. כוח דרך שיתוף פעולה", en: "Diplomatic and balanced action. Strength through cooperation", ru: "Дипломатичное и сбалансированное действие. Сила через сотрудничество", ar: "عمل دبلوماسي ومتوازن. القوة من خلال التعاون" },
  "Mars-7": { he: "עוצמה פנימית אדירה ונחישות. טרנספורמציה דרך פעולה", en: "Immense inner power and determination. Transformation through action", ru: "Огромная внутренняя мощь и решимость. Трансформация через действие", ar: "قوة داخلية هائلة وعزيمة. تحول من خلال العمل" },
  "Mars-8": { he: "דחף להרפתקאות וגבולות חדשים. אנרגיה חופשית ומשחררת", en: "Drive for adventure and new frontiers. Free and liberating energy", ru: "Стремление к приключениям и новым горизонтам. Свободная и раскрепощающая энергия", ar: "دافع للمغامرة وحدود جديدة. طاقة حرة ومحررة" },
  "Mars-9": { he: "משמעת ברזל ושאיפה גבוהה. עבודה קשה מניבה פירות", en: "Iron discipline and high ambition. Hard work bears fruit", ru: "Железная дисциплина и высокие амбиции. Тяжёлый труд приносит плоды", ar: "انضباط حديدي وطموح عالٍ. العمل الشاق يؤتي ثماره" },
  "Mars-10": { he: "פעולה מהפכנית ולא צפויה. שבירת דפוסים ישנים", en: "Revolutionary and unexpected action. Breaking old patterns", ru: "Революционное и неожиданное действие. Разрушение старых шаблонов", ar: "عمل ثوري وغير متوقع. كسر الأنماط القديمة" },
  "Mars-11": { he: "פעולה אינטואיטיבית ורוחנית. כוח שקט מכוון מבפנים", en: "Intuitive and spiritual action. Quiet strength directed from within", ru: "Интуитивное и духовное действие. Тихая сила, направленная изнутри", ar: "عمل حدسي وروحاني. قوة هادئة موجهة من الداخل" },
  "Jupiter-0": { he: "הזדמנויות חדשות ואופטימיות בלתי ניתנת לעצירה", en: "New opportunities and unstoppable optimism", ru: "Новые возможности и неудержимый оптимизм", ar: "فرص جديدة وتفاؤل لا يمكن إيقافه" },
  "Jupiter-1": { he: "שפע חומרי וצמיחה כלכלית. המזל מאיר בתחום הכספי", en: "Material abundance and financial growth. Fortune shines in finances", ru: "Материальное изобилие и финансовый рост. Удача сияет в финансовой сфере", ar: "وفرة مادية ونمو مالي. الحظ يشرق في المجال المالي" },
  "Jupiter-2": { he: "למידה מואצת וסקרנות אינטלקטואלית. ידע חדש פותח שערים", en: "Accelerated learning and intellectual curiosity. New knowledge opens gates", ru: "Ускоренное обучение и интеллектуальное любопытство. Новые знания открывают двери", ar: "تعلم متسارع وفضول فكري. المعرفة الجديدة تفتح أبواباً" },
  "Jupiter-3": { he: "ברכה על המשפחה והבית. הגנה קוסמית על היקרים לך", en: "Blessings on family and home. Cosmic protection over your loved ones", ru: "Благословение семьи и дома. Космическая защита близких", ar: "بركة على العائلة والمنزل. حماية كونية لأحبائك" },
  "Jupiter-4": { he: "הצלחה מזהירה וביטחון עצמי גואה. זמן לזרוח", en: "Brilliant success and rising confidence. Time to shine", ru: "Блестящий успех и растущая уверенность. Время сиять", ar: "نجاح باهر وثقة متصاعدة. حان وقت التألق" },
  "Jupiter-5": { he: "שיפור בריאותי וסדר מושלם. פרטים קטנים מביאים הצלחה גדולה", en: "Health improvement and perfect order. Small details bring great success", ru: "Улучшение здоровья и идеальный порядок. Мелкие детали приносят большой успех", ar: "تحسن صحي ونظام مثالي. التفاصيل الصغيرة تجلب نجاحاً كبيراً" },
  "Jupiter-6": { he: "שותפויות מבורכות ושגשוג דרך אחרים. הרמוניה מושכת שפע", en: "Blessed partnerships and prosperity through others. Harmony attracts abundance", ru: "Благословенные партнёрства и процветание через других. Гармония привлекает изобилие", ar: "شراكات مباركة وازدهار من خلال الآخرين. الانسجام يجذب الوفرة" },
  "Jupiter-7": { he: "טרנספורמציה מעצימה וצמיחה דרך שינוי עמוק", en: "Empowering transformation and growth through deep change", ru: "Преобразующая трансформация и рост через глубокие перемены", ar: "تحول تمكيني ونمو من خلال تغيير عميق" },
  "Jupiter-8": { he: "הרחבת אופקים ומסעות רוחניים. חכמה עתיקה מתגלה", en: "Expanding horizons and spiritual journeys. Ancient wisdom reveals itself", ru: "Расширение горизонтов и духовные путешествия. Древняя мудрость раскрывается", ar: "توسيع الآفاق والرحلات الروحية. الحكمة القديمة تكشف عن نفسها" },
  "Jupiter-9": { he: "קידום מקצועי ובניית מוניטין. השקעות ארוכות טווח משתלמות", en: "Career advancement and reputation building. Long-term investments pay off", ru: "Карьерный рост и построение репутации. Долгосрочные инвестиции окупаются", ar: "تقدم مهني وبناء سمعة. الاستثمارات طويلة الأجل تؤتي ثمارها" },
  "Jupiter-10": { he: "חדשנות מבורכת וחזון עתידי. רעיונות מקוריים פורחים", en: "Blessed innovation and future vision. Original ideas flourish", ru: "Благословенные инновации и видение будущего. Оригинальные идеи расцветают", ar: "ابتكار مبارك ورؤية مستقبلية. الأفكار الأصيلة تزدهر" },
  "Jupiter-11": { he: "חסד רוחני ואמונה עמוקה. חלומות הופכים למציאות", en: "Spiritual grace and deep faith. Dreams become reality", ru: "Духовная благодать и глубокая вера. Мечты становятся реальностью", ar: "نعمة روحية وإيمان عميق. الأحلام تصبح حقيقة" },
  "Saturn-0": { he: "אתגר לחזק את הנחישות. מבחנים מעצבים אופי", en: "Challenge to strengthen resolve. Tests build character", ru: "Вызов для укрепления решимости. Испытания формируют характер", ar: "تحدٍّ لتعزيز العزيمة. الاختبارات تبني الشخصية" },
  "Saturn-1": { he: "בניית יציבות כלכלית דרך סבלנות. משמעת מולידה שפע", en: "Building financial stability through patience. Discipline breeds abundance", ru: "Строительство финансовой стабильности через терпение. Дисциплина рождает изобилие", ar: "بناء الاستقرار المالي من خلال الصبر. الانضباط يولد الوفرة" },
  "Saturn-2": { he: "מחשבה מעמיקה וריכוז מנטלי. זמן ללמוד ולהתמקצע", en: "Deep thinking and mental focus. Time to learn and specialize", ru: "Глубокое мышление и ментальная концентрация. Время учиться и специализироваться", ar: "تفكير عميق وتركيز ذهني. وقت التعلم والتخصص" },
  "Saturn-3": { he: "אחריות משפחתית ובגרות רגשית. חיזוק היסודות", en: "Family responsibility and emotional maturity. Strengthening foundations", ru: "Семейная ответственность и эмоциональная зрелость. Укрепление основ", ar: "مسؤولية عائلية ونضج عاطفي. تعزيز الأسس" },
  "Saturn-4": { he: "ענווה אמיתית וביטחון מושכל. הנהגה דרך דוגמה", en: "True humility and grounded confidence. Leading by example", ru: "Истинное смирение и обоснованная уверенность. Лидерство примером", ar: "تواضع حقيقي وثقة راسخة. القيادة بالقدوة" },
  "Saturn-5": { he: "שיטתיות וסדר מושלם. בניית מערכות שעובדות לאורך זמן", en: "Systematic perfection and order. Building systems that last", ru: "Систематическое совершенство и порядок. Создание систем, которые работают долго", ar: "كمال منهجي ونظام. بناء أنظمة تدوم" },
  "Saturn-6": { he: "צדק ומאזן כרמי. מערכות יחסים עוברות מבחן של אמת", en: "Justice and karmic balance. Relationships face tests of truth", ru: "Справедливость и кармический баланс. Отношения проходят испытание правдой", ar: "عدالة وتوازن كرمي. العلاقات تواجه اختبار الحقيقة" },
  "Saturn-7": { he: "עומק פסיכולוגי ועימות עם צללים. כוח דרך אמת", en: "Psychological depth and shadow confrontation. Strength through truth", ru: "Психологическая глубина и противостояние с тенями. Сила через правду", ar: "عمق نفسي ومواجهة الظلال. القوة من خلال الحقيقة" },
  "Saturn-8": { he: "חכמה מעשית וראייה ארוכת טווח. מסע פנימי של צמיחה", en: "Practical wisdom and long-term vision. An inner journey of growth", ru: "Практическая мудрость и долгосрочное видение. Внутреннее путешествие роста", ar: "حكمة عملية ورؤية طويلة الأمد. رحلة داخلية من النمو" },
  "Saturn-9": { he: "שיא הקריירה דורש מחויבות מלאה. הישגים דרך עמל", en: "Career peak demands full commitment. Achievement through dedication", ru: "Пик карьеры требует полной отдачи. Достижения через труд", ar: "ذروة المهنة تتطلب التزاماً كاملاً. الإنجاز من خلال التفاني" },
  "Saturn-10": { he: "מבנה חדש לרעיונות מהפכניים. חדשנות דרך משמעת", en: "New structure for revolutionary ideas. Innovation through discipline", ru: "Новая структура для революционных идей. Инновации через дисциплину", ar: "هيكل جديد للأفكار الثورية. الابتكار من خلال الانضباط" },
  "Saturn-11": { he: "גבולות רוחניים בריאים. חיבור עמוק בין עולם החומר לרוח", en: "Healthy spiritual boundaries. Deep connection between material and spirit", ru: "Здоровые духовные границы. Глубокая связь между материей и духом", ar: "حدود روحية صحية. ارتباط عميق بين المادة والروح" },
};

const INFLUENCE_LIFE_AREAS: Record<string, Record<Language, string>> = {
  Venus: { he: "אהבה, יופי ומערכות יחסים", en: "Love, beauty, and relationships", ru: "Любовь, красота и отношения", ar: "الحب والجمال والعلاقات" },
  Mars: { he: "אנרגיה, פעולה ומוטיבציה", en: "Energy, action, and motivation", ru: "Энергия, действие и мотивация", ar: "الطاقة والعمل والتحفيز" },
  Jupiter: { he: "צמיחה, שפע והזדמנויות", en: "Growth, abundance, and opportunities", ru: "Рост, изобилие и возможности", ar: "النمو والوفرة والفرص" },
  Saturn: { he: "משמעת, מבנה ואחריות", en: "Discipline, structure, and responsibility", ru: "Дисциплина, структура и ответственность", ar: "الانضباط والهيكل والمسؤولية" },
};

// Deterministic daily seed — same result for all users on the same day
function getDailyInfluence(): PlanetaryInfluence {
  const now = new Date();
  const dayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  // Simple hash from date string
  let hash = 0;
  for (let i = 0; i < dayStr.length; i++) {
    hash = ((hash << 5) - hash + dayStr.charCodeAt(i)) | 0;
  }
  hash = Math.abs(hash);

  const planetIdx = hash % 4;
  const signIdx = (hash >> 4) % 12;
  const planet = PLANETS[planetIdx];
  const key = `${planet.name}-${signIdx}`;

  return {
    planet: planet.name,
    planet_symbol: planet.symbol,
    zodiac_sign_index: signIdx,
    influence_area: planet.area,
    title: INFLUENCE_TITLES[key],
    description: INFLUENCE_DESCRIPTIONS[key],
    life_area: INFLUENCE_LIFE_AREAS[planet.name],
  };
}

const ZodiacWheel = ({
  isMobile,
  hoveredMenuItem,
}: {
  isMobile: boolean;
  hoveredMenuItem: number | null;
}) => {
  const { language } = useLanguage();
  const t = useT();
  const [hoveredSign, setHoveredSign] = useState<number | null>(null);
  const radius = isMobile ? 242 : 385;
  const iconSize = isMobile ? 42 : 66;
  const rulingIndex = getRulingSignIndex();

  const [planetaryInfluence, setPlanetaryInfluence] = useState(() => getDailyInfluence());
  const [influenceKey, setInfluenceKey] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  });

  // Auto-refresh at midnight
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      const currentKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      if (currentKey !== influenceKey) {
        setInfluenceKey(currentKey);
        setPlanetaryInfluence(getDailyInfluence());
      }
    };
    // Check every 30 seconds near midnight
    const id = setInterval(checkMidnight, 30_000);
    return () => clearInterval(id);
  }, [influenceKey]);

  const influencedIndex = planetaryInfluence.zodiac_sign_index;

  // Compatibility mode: highlight two signs when compatibility tab hovered
  const isCompatMode = hoveredMenuItem === 2;
  const isRisingMode = hoveredMenuItem === 1;
  const compatHighlight = isCompatMode ? [0, 6] : []; // Aries & Libra as example pair
  const pColor = PLANET_COLORS[planetaryInfluence.planet] || "43 80% 55%";

  return (
    <motion.div
      className="absolute pointer-events-none z-[16]"
      style={{ width: radius * 2 + 40, height: radius * 2 + 40 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, delay: 1.5 }}
    >
      {/* Slowly rotating container */}
      <motion.div
        className="relative w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        {/* Faint circle track */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: radius * 2,
            height: radius * 2,
            left: 20,
            top: 20,
            border: `1px solid hsl(var(--gold) / ${isRisingMode ? 0.15 : 0.06})`,
          }}
          animate={isRisingMode ? {
            boxShadow: [
              "0 0 10px hsl(43 80% 55% / 0.05)",
              "0 0 30px hsl(43 80% 55% / 0.15)",
              "0 0 10px hsl(43 80% 55% / 0.05)",
            ],
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {ZODIAC_WHEEL[language].map((sign, i) => {
          const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * radius + radius + 20;
          const y = Math.sin(angle) * radius + radius + 20;
          const isHighlighted = compatHighlight.includes(i);
          const isHovered = hoveredSign === i;
          const meta = ZODIAC_META[language][i];

          const isRuling = i === influencedIndex;
          const rulingIconSize = isRuling ? (isMobile ? 52 : 80) : iconSize;
          const planetColor = planetaryInfluence ? PLANET_COLORS[planetaryInfluence.planet] || "43 80% 55%" : "43 80% 55%";

          return (
            <motion.div
              key={sign.en}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: x - rulingIconSize / 2,
                top: y - rulingIconSize / 2,
                width: rulingIconSize,
                height: rulingIconSize,
              }}
              onMouseEnter={() => setHoveredSign(i)}
              onMouseLeave={() => setHoveredSign(null)}
              // Counter-rotate to keep symbols upright — slow down when hovered
              animate={{ rotate: -360 }}
              transition={{ duration: isHovered ? 600 : 120, repeat: Infinity, ease: "linear" }}
            >
              {/* Permanent planetary influence aura */}
              {isRuling && (
                <>
                  <motion.div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      inset: -10,
                      border: `1px solid hsl(${planetColor} / 0.3)`,
                      background: `radial-gradient(circle, hsl(${planetColor} / 0.08), transparent 70%)`,
                    }}
                    animate={{
                      boxShadow: [
                        `0 0 15px hsl(${planetColor} / 0.12), inset 0 0 10px hsl(${planetColor} / 0.04)`,
                        `0 0 30px hsl(${planetColor} / 0.25), inset 0 0 20px hsl(${planetColor} / 0.1)`,
                        `0 0 15px hsl(${planetColor} / 0.12), inset 0 0 10px hsl(${planetColor} / 0.04)`,
                      ],
                      scale: [1, 1.08, 1],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Outer ring pulse */}
                  <motion.div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      inset: -18,
                      border: `1px solid hsl(${planetColor} / 0.12)`,
                    }}
                    animate={{
                      opacity: [0.3, 0.7, 0.3],
                      scale: [0.95, 1.05, 0.95],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  />
                  {/* Planet symbol indicator */}
                  <motion.div
                    className="absolute pointer-events-none flex items-center justify-center"
                    style={{
                      width: isMobile ? 20 : 26,
                      height: isMobile ? 20 : 26,
                      right: isMobile ? -6 : -8,
                      top: isMobile ? -6 : -8,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, hsl(${planetColor} / 0.25), hsl(${planetColor} / 0.1))`,
                      border: `1px solid hsl(${planetColor} / 0.4)`,
                      fontSize: isMobile ? 10 : 13,
                      color: `hsl(${planetColor})`,
                      zIndex: 10,
                    }}
                    animate={{
                      boxShadow: [
                        `0 0 6px hsl(${planetColor} / 0.2)`,
                        `0 0 14px hsl(${planetColor} / 0.4)`,
                        `0 0 6px hsl(${planetColor} / 0.2)`,
                      ],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {planetaryInfluence.planet_symbol}
                  </motion.div>
                  {/* Rising particles */}
                  {[0, 1, 2].map((pi) => (
                    <motion.div
                      key={pi}
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: 3,
                        height: 3,
                        left: "50%",
                        top: "50%",
                        background: `hsl(${planetColor})`,
                      }}
                      animate={{
                        y: [0, -20, -35],
                        x: [0, (pi - 1) * 8, (pi - 1) * 12],
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.2, 0],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: pi * 0.8,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </>
              )}

              {/* Zodiac illustration */}
              <motion.div
                className="w-full h-full flex items-center justify-center rounded-full overflow-hidden"
                animate={isHighlighted ? {
                  scale: [1, 1.3, 1],
                } : isHovered ? { scale: 1.45 } : { scale: 1 }}
                transition={{ duration: isHighlighted ? 1.5 : 0.4, repeat: isHighlighted ? Infinity : 0, ease: "easeOut" }}
              >
                <img
                  src={ZODIAC_ICONS[i]}
                  alt={sign.name}
                  className="w-full h-full object-contain transition-all duration-500"
                  style={{
                    opacity: isHovered || isHighlighted || isRuling ? 1 : 0.75,
                    filter: isHovered
                      ? `drop-shadow(0 0 18px hsl(${planetColor} / 0.9)) drop-shadow(0 0 8px hsl(${planetColor} / 0.6)) drop-shadow(0 0 35px hsl(${planetColor} / 0.3))`
                      : isRuling
                        ? `drop-shadow(0 0 14px hsl(${planetColor} / 0.7)) drop-shadow(0 0 6px hsl(${planetColor} / 0.4)) drop-shadow(0 0 25px hsl(${planetColor} / 0.2))`
                        : isHighlighted
                          ? "drop-shadow(0 0 12px hsl(43 80% 55% / 0.8)) drop-shadow(0 0 4px hsl(43 80% 55% / 0.5))"
                          : "drop-shadow(0 0 5px hsl(43 80% 55% / 0.35))",
                  }}
                />
              </motion.div>

              {/* Glow ring on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    className="absolute inset-[-6px] rounded-full pointer-events-none"
                    style={{
                      border: `1px solid hsl(${isRuling ? planetColor : "43 80% 55%"} / 0.3)`,
                      background: `radial-gradient(circle, hsl(${isRuling ? planetColor : "43 80% 55%"} / 0.08), transparent 70%)`,
                      boxShadow: `0 0 25px hsl(${isRuling ? planetColor : "43 80% 55%"} / 0.15), inset 0 0 15px hsl(${isRuling ? planetColor : "43 80% 55%"} / 0.05)`,
                    }}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>

              {/* Premium floating label on hover */}
              <AnimatePresence>
                {isHovered && !isRuling && (
                  <motion.div
                    className="absolute z-50 whitespace-nowrap"
                    style={{
                      left: "50%",
                      bottom: "calc(100% + 14px)",
                      transform: "translateX(-50%)",
                    }}
                    initial={{ opacity: 0, y: 8, scale: 0.85 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.85 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <div
                      className="px-4 py-2 rounded-lg font-heading backdrop-blur-xl text-center"
                      style={{
                        background: "linear-gradient(145deg, hsl(var(--deep-blue-light) / 0.95), hsl(var(--deep-blue) / 0.98))",
                        border: "1px solid hsl(var(--gold) / 0.3)",
                        boxShadow: "0 0 25px hsl(var(--gold) / 0.12), 0 8px 32px hsl(var(--deep-blue) / 0.6), inset 0 1px 0 hsl(var(--gold) / 0.1)",
                      }}
                    >
                      <div
                        className="text-[13px] font-semibold tracking-wide"
                        style={{ color: "hsl(var(--gold))" }}
                      >
                        {sign.name}
                      </div>
                      <div
                        className="flex items-center justify-center gap-2 mt-0.5 text-[10px] tracking-widest uppercase"
                        style={{ color: "hsl(var(--gold) / 0.6)" }}
                      >
                        <span>{meta.element}</span>
                        <span style={{ color: "hsl(var(--gold) / 0.3)" }}>·</span>
                        <span>{meta.keyword}</span>
                      </div>
                    </div>
                    <div
                      className="mx-auto"
                      style={{
                        width: 0, height: 0,
                        borderLeft: "5px solid transparent",
                        borderRight: "5px solid transparent",
                        borderTop: "5px solid hsl(var(--gold) / 0.3)",
                        marginTop: -1,
                      }}
                    />
                  </motion.div>
                )}

                {/* Planetary influence — large premium info card */}
                {isHovered && isRuling && (
                  <motion.div
                    className="fixed z-[100] pointer-events-none"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      width: isMobile ? 290 : 400,
                    }}
                    initial={{ opacity: 0, scale: 0.85, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 20 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Outer glow aura */}
                    <motion.div
                      className="absolute rounded-2xl pointer-events-none"
                      style={{ inset: -8 }}
                      animate={{
                        boxShadow: [
                          `0 0 30px hsl(${planetColor} / 0.12), 0 0 60px hsl(${planetColor} / 0.06)`,
                          `0 0 50px hsl(${planetColor} / 0.2), 0 0 90px hsl(${planetColor} / 0.1)`,
                          `0 0 30px hsl(${planetColor} / 0.12), 0 0 60px hsl(${planetColor} / 0.06)`,
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <div
                      className="relative rounded-2xl font-heading backdrop-blur-3xl overflow-hidden"
                      style={{
                        background: "linear-gradient(160deg, hsl(var(--deep-blue-light) / 0.96), hsl(var(--deep-blue) / 0.99))",
                        border: `1px solid hsl(${planetColor} / 0.35)`,
                        boxShadow: `0 0 60px hsl(${planetColor} / 0.12), 0 20px 60px hsl(var(--deep-blue) / 0.8), inset 0 1px 0 hsl(${planetColor} / 0.12)`,
                      }}
                    >
                      {/* Top accent bar */}
                      <div
                        className="absolute top-0 left-0 right-0 h-[2px]"
                        style={{ background: `linear-gradient(90deg, transparent 5%, hsl(${planetColor} / 0.7), transparent 95%)` }}
                      />

                      <div className={`text-center ${isMobile ? "px-5 py-5 space-y-3" : "px-8 py-7 space-y-4"}`}>
                        {/* Planet symbol + name */}
                        {planetaryInfluence && (
                          <div className="flex items-center justify-center gap-3">
                            <motion.span
                              className={`${isMobile ? "text-3xl" : "text-4xl"}`}
                              animate={{ 
                                textShadow: [
                                  `0 0 10px hsl(${planetColor} / 0.4)`,
                                  `0 0 25px hsl(${planetColor} / 0.7)`,
                                  `0 0 10px hsl(${planetColor} / 0.4)`,
                                ] 
                              }}
                              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                              {planetaryInfluence.planet_symbol}
                            </motion.span>
                          </div>
                        )}

                        {/* Planetary aspect title */}
                        <div
                          className={`font-bold tracking-[0.12em] uppercase ${isMobile ? "text-lg" : "text-xl"}`}
                          style={{ color: `hsl(${planetColor})` }}
                        >
                          {planetaryInfluence?.title[language] || `${sign.name}`}
                        </div>

                        {/* Influence area badge */}
                        {planetaryInfluence && (
                          <div
                            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full tracking-[0.18em] uppercase font-semibold ${isMobile ? "text-[11px]" : "text-xs"}`}
                            style={{
                              background: `linear-gradient(135deg, hsl(${planetColor} / 0.12), hsl(${planetColor} / 0.06))`,
                              border: `1px solid hsl(${planetColor} / 0.3)`,
                              color: `hsl(${planetColor} / 0.95)`,
                            }}
                          >
                            <span>{INFLUENCE_AREA_ICONS[planetaryInfluence.influence_area] || "✦"}</span>
                            {planetaryInfluence.life_area[language]}
                          </div>
                        )}

                        {/* Element & keyword */}
                        <div
                          className={`flex items-center justify-center gap-3 tracking-[0.18em] uppercase ${isMobile ? "text-xs" : "text-sm"}`}
                          style={{ color: "hsl(var(--gold) / 0.7)" }}
                        >
                          <span>{meta.element}</span>
                          <span style={{ color: "hsl(var(--gold) / 0.3)" }}>·</span>
                          <span>{meta.keyword}</span>
                        </div>

                        {/* Divider */}
                        <div
                          className="mx-auto"
                          style={{
                            width: 60,
                            height: 1,
                            background: `linear-gradient(90deg, transparent, hsl(${planetColor} / 0.35), transparent)`,
                          }}
                        />

                        {/* Influence description */}
                        <div
                          className={`leading-relaxed ${isMobile ? "text-xs" : "text-sm"}`}
                          style={{ color: "hsl(var(--foreground) / 0.75)" }}
                        >
                          {planetaryInfluence?.description[language] || ZODIAC_RULING_ENERGY[language][influencedIndex]}
                        </div>
                      </div>

                      {/* Bottom accent */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-[1px]"
                        style={{ background: `linear-gradient(90deg, transparent 5%, hsl(${planetColor} / 0.25), transparent 95%)` }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Occasional particle emission */}
              {(i % 4 === 0) && (
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: 2,
                    height: 2,
                    left: "50%",
                    top: "50%",
                    background: "hsl(var(--gold))",
                  }}
                  animate={{
                    y: [0, -15, -25],
                    opacity: [0, 0.7, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.8,
                    ease: "easeOut",
                  }}
                />
              )}
            </motion.div>
          );
        })}

        {/* Compatibility energy lines between two signs */}
        <AnimatePresence>
          {isCompatMode && (
            <motion.svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {(() => {
                const a1 = (compatHighlight[0] / 12) * Math.PI * 2 - Math.PI / 2;
                const a2 = (compatHighlight[1] / 12) * Math.PI * 2 - Math.PI / 2;
                const x1 = Math.cos(a1) * radius + radius + 20;
                const y1 = Math.sin(a1) * radius + radius + 20;
                const x2 = Math.cos(a2) * radius + radius + 20;
                const y2 = Math.sin(a2) * radius + radius + 20;
                return (
                  <>
                    <motion.line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke="hsl(340, 70%, 60%)"
                      strokeWidth="1"
                      strokeOpacity="0.4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    <motion.circle
                      r="3"
                      fill="hsl(340, 70%, 60%)"
                      animate={{
                        cx: [x1, x2],
                        cy: [y1, y2],
                        opacity: [0.8, 0],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeIn" }}
                    />
                  </>
                );
              })()}
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Energy line from hovered sign to center */}
        <AnimatePresence>
          {hoveredSign !== null && (
            <motion.svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {(() => {
                const angle = (hoveredSign / 12) * Math.PI * 2 - Math.PI / 2;
                const sx = Math.cos(angle) * radius + radius + 20;
                const sy = Math.sin(angle) * radius + radius + 20;
                const cx = radius + 20;
                const cy = radius + 20;
                return (
                  <>
                    <motion.line
                      x1={sx} y1={sy} x2={cx} y2={cy}
                      stroke="hsl(43, 80%, 55%)"
                      strokeWidth="0.8"
                      strokeOpacity="0.35"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                    <motion.circle
                      r="2"
                      fill="hsl(43, 80%, 55%)"
                      animate={{
                        cx: [sx, cx],
                        cy: [sy, cy],
                        opacity: [0.6, 0],
                      }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeIn" }}
                    />
                  </>
                );
              })()}
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Cosmic energy pulse on wheel */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: radius * 2,
          height: radius * 2,
          left: 20,
          top: 20,
          border: "1px solid hsl(var(--gold) / 0.08)",
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Planetary Influence Info Card */}
      <motion.div
        className="absolute pointer-events-none z-20"
        style={{
          bottom: isMobile ? -100 : -130,
          left: "50%",
          transform: "translateX(-50%)",
          width: isMobile ? 280 : 360,
        }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 3 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={influenceKey}
            initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            <div
              className="relative rounded-xl font-heading backdrop-blur-2xl overflow-hidden text-center"
              style={{
                background: "linear-gradient(160deg, hsl(var(--deep-blue-light) / 0.95), hsl(var(--deep-blue) / 0.98))",
                border: `1px solid hsl(${pColor} / 0.3)`,
                boxShadow: `0 0 35px hsl(${pColor} / 0.1), 0 8px 32px hsl(var(--deep-blue) / 0.6), inset 0 1px 0 hsl(${pColor} / 0.1)`,
              }}
            >
              {/* Top accent */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent 10%, hsl(${pColor} / 0.6), transparent 90%)` }}
              />

              <div className={`${isMobile ? "px-4 py-3.5 space-y-2" : "px-6 py-5 space-y-2.5"}`}>
                {/* Subtitle */}
                <div
                  className={`tracking-[0.2em] uppercase font-medium ${isMobile ? "text-[9px]" : "text-[10px]"}`}
                  style={{ color: "hsl(var(--foreground) / 0.45)" }}
                >
                  {t.zodiac_planetary_influence}
                </div>

                {/* Planet symbol + aspect title */}
                <div className="flex items-center justify-center gap-2.5">
                  <motion.span
                    className={`${isMobile ? "text-xl" : "text-2xl"}`}
                    animate={{
                      textShadow: [
                        `0 0 8px hsl(${pColor} / 0.3)`,
                        `0 0 20px hsl(${pColor} / 0.6)`,
                        `0 0 8px hsl(${pColor} / 0.3)`,
                      ],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {planetaryInfluence.planet_symbol}
                  </motion.span>
                  <span
                    className={`font-bold tracking-[0.1em] uppercase ${isMobile ? "text-sm" : "text-base"}`}
                    style={{ color: `hsl(${pColor})` }}
                  >
                    {planetaryInfluence.title[language]}
                  </span>
                </div>

                {/* Influence area badge */}
                <div className="flex items-center justify-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full tracking-[0.15em] uppercase font-medium ${isMobile ? "text-[9px]" : "text-[10px]"}`}
                    style={{
                      background: `hsl(${pColor} / 0.08)`,
                      border: `1px solid hsl(${pColor} / 0.2)`,
                      color: `hsl(${pColor} / 0.85)`,
                    }}
                  >
                    <span>{INFLUENCE_AREA_ICONS[planetaryInfluence.influence_area] || "✦"}</span>
                    {planetaryInfluence.life_area[language]}
                  </span>
                </div>

                {/* Interpretation */}
                <div
                  className={`leading-relaxed ${isMobile ? "text-[11px]" : "text-xs"}`}
                  style={{ color: "hsl(var(--foreground) / 0.6)" }}
                >
                  {planetaryInfluence.description[language]}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

/* ── Arcane Portal Ring ────────────────────────────── */
const ARCANE_SYMBOLS = ["☽", "☿", "♀", "⊕", "♂", "♃", "♄", "⛢", "♆", "♇", "☊", "☋", "⚷", "⚸", "✧", "⊛"];

const ArcanePortalRing = ({ isMobile, activeColor }: { isMobile: boolean; activeColor?: string }) => {
  const ringSize = isMobile ? 300 : 460;
  const symbolRadius = ringSize / 2 - 12;
  const glowColor = activeColor || "hsl(var(--gold) / 0.15)";

  return (
    <motion.div
      className="absolute z-[14] pointer-events-none"
      style={{ width: ringSize, height: ringSize }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 2.5, delay: 1.8 }}
    >
      {/* Outer arcane ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: "1px solid hsl(var(--gold) / 0.08)",
          boxShadow: `0 0 20px ${glowColor}, inset 0 0 15px hsl(var(--gold) / 0.03)`,
        }}
        animate={{
          rotate: -360,
          boxShadow: [
            `0 0 15px hsl(43 80% 55% / 0.06), inset 0 0 10px hsl(43 80% 55% / 0.02)`,
            `0 0 35px hsl(43 80% 55% / 0.14), inset 0 0 20px hsl(43 80% 55% / 0.05)`,
            `0 0 15px hsl(43 80% 55% / 0.06), inset 0 0 10px hsl(43 80% 55% / 0.02)`,
          ],
        }}
        transition={{
          rotate: { duration: 90, repeat: Infinity, ease: "linear" },
          boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        {/* Arcane symbols around the ring */}
        {ARCANE_SYMBOLS.map((sym, i) => {
          const angle = (i / ARCANE_SYMBOLS.length) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * symbolRadius + ringSize / 2;
          const y = Math.sin(angle) * symbolRadius + ringSize / 2;
          return (
            <motion.span
              key={`arcane-${i}`}
              className="absolute font-heading select-none"
              style={{
                left: x - 6,
                top: y - 7,
                fontSize: isMobile ? "9px" : "12px",
                color: "hsl(var(--gold) / 0.2)",
                textShadow: "0 0 6px hsl(var(--gold) / 0.15)",
              }}
              animate={{
                opacity: [0.15, 0.45, 0.15],
                textShadow: [
                  "0 0 4px hsl(43 80% 55% / 0.1)",
                  "0 0 12px hsl(43 80% 55% / 0.35)",
                  "0 0 4px hsl(43 80% 55% / 0.1)",
                ],
                rotate: [360, 0],
              }}
              transition={{
                opacity: { duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 },
                textShadow: { duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 },
                rotate: { duration: 90, repeat: Infinity, ease: "linear" },
              }}
            >
              {sym}
            </motion.span>
          );
        })}
      </motion.div>

      {/* Inner ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: isMobile ? 20 : 30,
          border: "1px solid hsl(var(--gold) / 0.05)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
      />

      {/* Pulsing energy fill */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${activeColor || "hsl(var(--gold))"}08 0%, transparent 60%)`,
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

/* ── Nebula Cloud Layer ────────────────────────────── */
const NebulaLayer = ({ isMobile }: { isMobile: boolean }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
    {/* Large nebula cloud 1 */}
    <motion.div
      className="absolute"
      style={{
        width: isMobile ? "300px" : "600px",
        height: isMobile ? "200px" : "400px",
        left: "-5%",
        top: "15%",
        background: "radial-gradient(ellipse, hsl(var(--celestial) / 0.05) 0%, hsl(var(--gold) / 0.02) 40%, transparent 70%)",
        filter: "blur(60px)",
        borderRadius: "50%",
      }}
      animate={{
        x: [0, 40, -20, 0],
        y: [0, -20, 10, 0],
        scale: [1, 1.15, 0.95, 1],
        opacity: [0.4, 0.7, 0.5, 0.4],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
    />
    {/* Large nebula cloud 2 */}
    <motion.div
      className="absolute"
      style={{
        width: isMobile ? "250px" : "500px",
        height: isMobile ? "180px" : "350px",
        right: "-8%",
        top: "30%",
        background: "radial-gradient(ellipse, hsl(var(--crimson) / 0.04) 0%, hsl(var(--celestial) / 0.02) 50%, transparent 70%)",
        filter: "blur(70px)",
        borderRadius: "50%",
      }}
      animate={{
        x: [0, -30, 15, 0],
        y: [0, 15, -25, 0],
        scale: [1.1, 0.9, 1.05, 1.1],
        opacity: [0.3, 0.55, 0.35, 0.3],
      }}
      transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 5 }}
    />
    {/* Top nebula wisp */}
    <motion.div
      className="absolute"
      style={{
        width: isMobile ? "200px" : "400px",
        height: isMobile ? "100px" : "200px",
        left: "30%",
        top: "5%",
        background: "radial-gradient(ellipse, hsl(var(--gold) / 0.03) 0%, transparent 70%)",
        filter: "blur(50px)",
        borderRadius: "50%",
      }}
      animate={{
        x: [-20, 30, -20],
        opacity: [0.2, 0.5, 0.2],
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 8 }}
    />
  </div>
);

/* ── Energy Line connecting tab to crystal ball ───── */
const EnergyLine = ({ fromX, fromY, color, isMobile }: { fromX: number; fromY: number; color: string; isMobile: boolean }) => {
  if (isMobile) return null;
  const centerX = 0;
  const centerY = 0;

  return (
    <motion.svg
      className="absolute pointer-events-none z-25"
      style={{
        left: "50%",
        top: "50%",
        width: 1,
        height: 1,
        overflow: "visible",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.line
        x1={centerX}
        y1={centerY}
        x2={fromX}
        y2={fromY}
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      {/* Traveling energy dot */}
      <motion.circle
        r="3"
        fill={color}
        animate={{
          cx: [fromX, centerX],
          cy: [fromY, centerY],
          opacity: [0.8, 0],
          r: [3, 1],
        }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeIn" }}
      />
      <motion.circle
        r="2"
        fill={color}
        animate={{
          cx: [fromX, centerX],
          cy: [fromY, centerY],
          opacity: [0.6, 0],
        }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeIn", delay: 0.4 }}
      />
    </motion.svg>
  );
};

/* ── Tarot Card Messages ───────────────────────────── */
const TAROT_MESSAGES: Record<Language, Record<string, string>> = {
  he: {
    "The Fool": "קלף השוטה הופיע עבורך — סימן שהתחלות חדשות ומרגשות ממתינות לך.",
    "The Magician": "קלף הקוסם הופיע עבורך היום — סימן שהאנרגיה סביבך תומכת ביצירה ובהתחלות חדשות.",
    "The High Priestess": "הכוהנת הגדולה מזמינה אותך להקשיב לקול הפנימי — האמת כבר בתוכך.",
    "The Empress": "הקיסרית מבשרת על שפע וצמיחה — פתח את ליבך לקבל.",
    "The Emperor": "הקיסר מופיע כשהזמן נכון לקחת אחריות ולהוביל מתוך חוכמה.",
    "The Lovers": "האוהבים מאירים את דרכך — בחירה חשובה מחכה, עקוב אחר הלב.",
    "The Wheel of Fortune": "גלגל המזל סובב לטובתך — שינוי משמעותי בדרך.",
    "The Star": "הכוכב מאיר את דרכך — תקווה, ריפוי והשראה ממלאים את חייך.",
    "The Moon": "הירח חושף סודות נסתרים — הקשב לחלומות ולאינטואיציה.",
    "The Sun": "השמש מאירה את חייך — שמחה, הצלחה ואור ממלאים כל פינה.",
  },
  en: {
    "The Fool": "The Fool appears for you — a sign that exciting new beginnings await.",
    "The Magician": "The Magician appears for you today — the energy around you supports creation and new starts.",
    "The High Priestess": "The High Priestess invites you to listen to your inner voice — the truth is already within you.",
    "The Empress": "The Empress heralds abundance and growth — open your heart to receive.",
    "The Emperor": "The Emperor appears when it's time to take responsibility and lead with wisdom.",
    "The Lovers": "The Lovers illuminate your path — an important choice awaits, follow your heart.",
    "The Wheel of Fortune": "The Wheel of Fortune turns in your favor — a significant change is coming.",
    "The Star": "The Star lights your way — hope, healing and inspiration fill your life.",
    "The Moon": "The Moon reveals hidden secrets — listen to your dreams and intuition.",
    "The Sun": "The Sun illuminates your life — joy, success and light fill every corner.",
  },
  ru: {
    "The Fool": "Шут появляется для вас — знак того, что впереди захватывающие новые начинания.",
    "The Magician": "Маг появляется для вас сегодня — энергия вокруг вас поддерживает творчество и новые начинания.",
    "The High Priestess": "Верховная Жрица приглашает вас прислушаться к внутреннему голосу — истина уже внутри вас.",
    "The Empress": "Императрица предвещает изобилие и рост — откройте сердце для получения.",
    "The Emperor": "Император появляется, когда пришло время взять ответственность и вести с мудростью.",
    "The Lovers": "Влюблённые освещают ваш путь — впереди важный выбор, следуйте за сердцем.",
    "The Wheel of Fortune": "Колесо Фортуны вращается в вашу пользу — значительные перемены на подходе.",
    "The Star": "Звезда освещает ваш путь — надежда, исцеление и вдохновение наполняют вашу жизнь.",
    "The Moon": "Луна раскрывает скрытые тайны — прислушайтесь к мечтам и интуиции.",
    "The Sun": "Солнце освещает вашу жизнь — радость, успех и свет наполняют каждый уголок.",
  },
  ar: {
    "The Fool": "بطاقة المجنون تظهر لك — علامة على بدايات جديدة ومثيرة تنتظرك.",
    "The Magician": "الساحر يظهر لك اليوم — الطاقة من حولك تدعم الإبداع والبدايات الجديدة.",
    "The High Priestess": "الكاهنة العليا تدعوك للاستماع إلى صوتك الداخلي — الحقيقة بداخلك بالفعل.",
    "The Empress": "الإمبراطورة تبشّر بالوفرة والنمو — افتح قلبك للتلقي.",
    "The Emperor": "الإمبراطور يظهر عندما يحين وقت تحمل المسؤولية والقيادة بحكمة.",
    "The Lovers": "العشاق ينيرون طريقك — خيار مهم ينتظرك، اتبع قلبك.",
    "The Wheel of Fortune": "عجلة الحظ تدور لصالحك — تغيير كبير في الطريق.",
    "The Star": "النجمة تنير طريقك — الأمل والشفاء والإلهام يملأون حياتك.",
    "The Moon": "القمر يكشف الأسرار الخفية — استمع إلى أحلامك وحدسك.",
    "The Sun": "الشمس تنير حياتك — الفرح والنجاح والنور يملأون كل زاوية.",
  },
};

/* ── Tarot Card Reveal in Crystal Ball ─────────────── */
const TarotCardReveal = ({
  isMobile,
  onOpenTarot,
  onPhaseChange,
}: {
  isMobile: boolean;
  onOpenTarot: () => void;
  onPhaseChange?: (phase: "idle" | "silhouette" | "flipping" | "revealed") => void;
}) => {
  const { language, dir } = useLanguage();
  const t = useT();
  const [phase, setPhaseInternal] = useState<"idle" | "silhouette" | "flipping" | "revealed">("idle");
  const setPhase = useCallback((p: "idle" | "silhouette" | "flipping" | "revealed") => {
    setPhaseInternal(p);
    onPhaseChange?.(p);
  }, [onPhaseChange]);
  const [card, setCard] = useState<TarotCard | null>(null);
  const cardSize = isMobile ? 70 : 100;

  // Show silhouette after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      const [drawn] = drawTarotCards(1);
      setCard(drawn);
      setPhase("silhouette");
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = useCallback(() => {
    if (phase === "silhouette") {
      setPhase("flipping");
      setTimeout(() => setPhase("revealed"), 1200);
    } else if (phase === "revealed") {
      setPhase("idle");
      // Re-draw a new card and show silhouette again after a brief pause
      setTimeout(() => {
        const [drawn] = drawTarotCards(1);
        setCard(drawn);
        setPhase("silhouette");
      }, 3000);
    }
  }, [phase]);

  if (!card) return null;

  const cardImage = tarotCardImages[card.name] || cardBack;
  const message = TAROT_MESSAGES[language]?.[card.name] || `${card.hebrewName} ${t.hero_tarot_fallback_message}`;

  return (
    <div
      className="absolute z-[22] flex items-center justify-center pointer-events-auto cursor-pointer"
      style={{ width: cardSize * 1.2, height: cardSize * 1.7 }}
      onClick={handleClick}
    >
      <AnimatePresence mode="wait">
        {/* Phase 1: Faint silhouette */}
        {phase === "silhouette" && (
          <motion.div
            key="silhouette"
            className="relative"
            style={{ width: cardSize, height: cardSize * 1.5, perspective: "600px" }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            {/* Swirling particles around card */}
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              return (
                <motion.div
                  key={`swirl-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: 3,
                    height: 3,
                    left: "50%",
                    top: "50%",
                    background: i % 2 === 0 ? "hsl(var(--gold))" : "hsl(var(--celestial))",
                  }}
                  animate={{
                    x: [Math.cos(angle) * 20, Math.cos(angle + Math.PI) * 35, Math.cos(angle) * 20],
                    y: [Math.sin(angle) * 25, Math.sin(angle + Math.PI) * 40, Math.sin(angle) * 25],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.5, 1.5, 0.5],
                  }}
                  transition={{ duration: 3 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
                />
              );
            })}

            {/* Card silhouette with slow rotation */}
            <motion.div
              className="w-full h-full rounded-lg overflow-hidden"
              style={{
                background: "linear-gradient(135deg, hsl(var(--gold) / 0.08), hsl(var(--celestial) / 0.12))",
                border: "1px solid hsl(var(--gold) / 0.15)",
                boxShadow: "0 0 25px hsl(var(--gold) / 0.15), inset 0 0 15px hsl(var(--gold) / 0.05)",
              }}
              animate={{
                rotateY: [0, 8, -8, 0],
                boxShadow: [
                  "0 0 20px hsl(43 80% 55% / 0.1), inset 0 0 10px hsl(43 80% 55% / 0.03)",
                  "0 0 40px hsl(43 80% 55% / 0.25), inset 0 0 20px hsl(43 80% 55% / 0.08)",
                  "0 0 20px hsl(43 80% 55% / 0.1), inset 0 0 10px hsl(43 80% 55% / 0.03)",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src={cardBack}
                alt=""
                className="w-full h-full object-cover"
                style={{ opacity: 0.35, filter: "blur(1px)" }}
              />
            </motion.div>

            {/* Pulsing light overlay */}
            <motion.div
              className="absolute inset-0 rounded-lg"
              style={{
                background: "radial-gradient(circle, hsl(var(--gold) / 0.15) 0%, transparent 70%)",
              }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        )}

        {/* Phase 2: Flipping animation */}
        {phase === "flipping" && (
          <motion.div
            key="flipping"
            className="relative"
            style={{ width: cardSize, height: cardSize * 1.5, perspective: "800px" }}
            initial={{ y: 0, scale: 1 }}
            animate={{ y: isMobile ? -30 : -50, scale: 1.15 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Burst particles */}
            {[...Array(16)].map((_, i) => {
              const angle = (i / 16) * Math.PI * 2;
              return (
                <motion.div
                  key={`burst-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: i % 3 === 0 ? 4 : 2,
                    height: i % 3 === 0 ? 4 : 2,
                    left: "50%",
                    top: "50%",
                    background: i % 3 === 0 ? "hsl(var(--gold))" : i % 3 === 1 ? "hsl(var(--crimson) / 0.8)" : "hsl(var(--celestial))",
                  }}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{
                    x: Math.cos(angle) * (60 + Math.random() * 30),
                    y: Math.sin(angle) * (60 + Math.random() * 30),
                    opacity: [0, 1, 0],
                    scale: [0, 2, 0],
                  }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                />
              );
            })}

            {/* Flip card */}
            <motion.div
              className="w-full h-full rounded-lg overflow-hidden"
              style={{
                transformStyle: "preserve-3d",
                boxShadow: "0 0 50px hsl(43 80% 55% / 0.4)",
              }}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: 180 }}
              transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Back face */}
              <div
                className="absolute inset-0 rounded-lg overflow-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                <img src={cardBack} alt="" className="w-full h-full object-cover" />
              </div>
              {/* Front face */}
              <div
                className="absolute inset-0 rounded-lg overflow-hidden"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <img src={cardImage} alt={card.hebrewName} className="w-full h-full object-cover" />
              </div>
            </motion.div>

            {/* Glow ring during flip */}
            <motion.div
              className="absolute -inset-4 rounded-xl pointer-events-none"
              style={{
                background: "radial-gradient(circle, hsl(var(--gold) / 0.2) 0%, transparent 70%)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5] }}
              transition={{ duration: 1.2 }}
            />
          </motion.div>
        )}

        {/* Phase 3: Revealed */}
        {phase === "revealed" && (
          <motion.div
            key="revealed"
            className="relative flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Card */}
            <motion.div
              className="relative rounded-lg overflow-hidden"
              style={{
                width: cardSize,
                height: cardSize * 1.5,
                boxShadow: "0 0 40px hsl(43 80% 55% / 0.35), 0 0 80px hsl(43 80% 55% / 0.15)",
              }}
              initial={{ y: isMobile ? -30 : -50, scale: 1.15 }}
              animate={{
                y: isMobile ? -20 : -35,
                scale: 1.1,
                boxShadow: [
                  "0 0 30px hsl(43 80% 55% / 0.25), 0 0 60px hsl(43 80% 55% / 0.1)",
                  "0 0 50px hsl(43 80% 55% / 0.4), 0 0 90px hsl(43 80% 55% / 0.2)",
                  "0 0 30px hsl(43 80% 55% / 0.25), 0 0 60px hsl(43 80% 55% / 0.1)",
                ],
              }}
              transition={{
                y: { duration: 0.5 },
                boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <img src={cardImage} alt={card.hebrewName} className="w-full h-full object-cover" />
            </motion.div>

            {/* Card info below */}
            <motion.div
              className="absolute text-center"
              style={{
                top: `${cardSize * 1.5 + (isMobile ? -5 : 0)}px`,
                width: isMobile ? "220px" : "280px",
                transform: "translateY(-10px)",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <motion.div
                className="rounded-xl px-3 py-2.5 backdrop-blur-md"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--deep-blue-light) / 0.92), hsl(var(--deep-blue) / 0.96))",
                  border: "1px solid hsl(var(--gold) / 0.2)",
                  boxShadow: "0 0 25px hsl(var(--gold) / 0.08)",
                }}
              >
                <p className="font-heading text-primary text-sm mb-1">
                  {card.symbol} {card.hebrewName}
                </p>
                <p className="text-foreground/70 font-body text-[10px] leading-relaxed mb-2" dir={dir}>
                  {message}
                </p>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenTarot();
                  }}
                  className="text-primary font-heading text-[11px] tracking-wide px-3 py-1 rounded-full"
                  style={{
                    background: "hsl(var(--gold) / 0.1)",
                    border: "1px solid hsl(var(--gold) / 0.25)",
                  }}
                  whileHover={{ scale: 1.08, boxShadow: "0 0 15px hsl(43 80% 55% / 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {t.hero_open_full_reading} ✦
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Main Hero ─────────────────────────────────────── */
const HeroSection = () => {
  const t = useT();
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [forecastOpen, setForecastOpen] = useState(false);
  const [risingOpen, setRisingOpen] = useState(false);
  const [compatibilityOpen, setCompatibilityOpen] = useState(false);
  const [tarotOpen, setTarotOpen] = useState(false);
  const [palmOpen, setPalmOpen] = useState(false);
  const [dailyCardOpen, setDailyCardOpen] = useState(false);
  const [entranceComplete, setEntranceComplete] = useState(false);
  const [isNearBall, setIsNearBall] = useState(false);
  const [clickBurst, setClickBurst] = useState(0);
  const [cardPhase, setCardPhase] = useState<"idle" | "silhouette" | "flipping" | "revealed">("idle");
  const sectionRef = useRef<HTMLDivElement>(null);
  const crystalRef = useRef<HTMLDivElement>(null);

  // Menu items split into left and right groups for symmetrical side layout
  const menuItems = useMemo(() => [
    { icon: Star, label: t.hero_menu_forecast, side: "left" as const, index: 0 },
    { icon: Sparkles, label: t.hero_menu_compatibility, side: "left" as const, index: 1 },
    { icon: Moon, label: t.hero_menu_rising, side: "left" as const, index: 2 },
    { icon: Sun, label: t.daily_ritual_card_label || "🔮 קלף יומי", side: "right" as const, index: 0 },
    { icon: Eye, label: t.hero_menu_tarot, side: "right" as const, index: 1 },
    { icon: Hand, label: t.hero_menu_palm, side: "right" as const, index: 2 },
  ], [t]);

  // Calculate tab positions: two arced columns on left/right sides
  const getTabPosition = useCallback((side: "left" | "right", idx: number, mobile: boolean) => {
    const sideSign = side === "left" ? -1 : 1;
    const horizontalDist = mobile ? 185 : 340; // distance from center (~12% more breathing space)
    const verticalSpacing = mobile ? 62 : 78;
    const arcCurve = mobile ? 20 : 34;
    const verticalOffset = mobile ? 30 : 20;

    // Soft arc: middle tab is closest to ball, top and bottom curve outward
    const arcOffset = Math.abs(idx - 1) * arcCurve;
    const x = sideSign * (horizontalDist + arcOffset);
    const y = (idx - 1) * verticalSpacing + verticalOffset;
    return { x, y };
  }, []);

  // Mouse tracking
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  const bgX = useTransform(smoothX, [0, 1], [8, -8]);
  const bgY = useTransform(smoothY, [0, 1], [5, -5]);
  const constellationX = useTransform(smoothX, [0, 1], [12, -12]);
  const constellationY = useTransform(smoothY, [0, 1], [8, -8]);
  const smokeX = useTransform(smoothX, [0, 1], [15, -15]);
  const smokeY = useTransform(smoothY, [0, 1], [10, -10]);
  const crystalX = useTransform(smoothX, [0, 1], [20, -20]);
  const crystalY = useTransform(smoothY, [0, 1], [15, -15]);
  const glowShiftX = useTransform(smoothX, [0, 1], [-15, 15]);
  const glowShiftY = useTransform(smoothY, [0, 1], [-10, 10]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setEntranceComplete(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Hero stays perfectly fixed — no parallax shift

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isMobile || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);

    // Check proximity to crystal ball center
    if (crystalRef.current) {
      const ballRect = crystalRef.current.getBoundingClientRect();
      const cx = ballRect.left + ballRect.width / 2;
      const cy = ballRect.top + ballRect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      setIsNearBall(dist < 250);
    }
  }, [isMobile, mouseX, mouseY]);

  const handleCrystalClick = useCallback(() => {
    setClickBurst((c) => c + 1);
  }, []);

  const orbRadius = isMobile ? 190 : 360; // kept for zodiac wheel reference

  const particles = useMemo(() => {
    const types: Array<"dust" | "spark" | "orb"> = ["dust", "spark", "orb"];
    return [...Array(isMobile ? 20 : 45)].map((_, i) => ({
      type: types[i % 3],
      delay: Math.random() * 6,
      x: `${Math.random() * 100}%`,
      y: `${20 + Math.random() * 70}%`,
    }));
  }, [isMobile]);


  // Active energy color based on hovered item
  const activeColor = hoveredItem !== null ? ITEM_COLORS[hoveredItem]?.glow : undefined;

  const heroLayer = typeof document !== "undefined"
    ? createPortal(
        <>
    {/* ── Fixed cinematic background ── */}
    <div
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-0 isolate"
      style={{}}
    >
      {/* ── Cinematic entrance overlay ── */}
      <motion.div
        className="absolute inset-0 z-[100] pointer-events-none"
        style={{ background: "hsl(var(--deep-blue))" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* ── Nebula clouds ── */}
      <NebulaLayer isMobile={isMobile} />

      {/* ── Layer 1: Mystical figure as full background ── */}
      <motion.div
        className="absolute inset-0"
        style={isMobile ? {} : { x: bgX, y: bgY }}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
      >
        <img
          src={heroFigure}
          alt=""
          className="w-full h-full object-cover scale-110"
          style={{ objectPosition: isMobile ? "center calc(0% + 70px)" : "center calc(0% + 100px)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />
      </motion.div>

      {/* ── Site Title overlay — sits in cleared space above character ── */}
      {/* Title moved to MysticalTopBar */}

      {/* ── Layer 1.5: Aura glow from hands area ── */}
      <div className="absolute inset-0 pointer-events-none z-[2]">
        <motion.div
          className="absolute"
          style={{
            left: "50%",
            top: "55%",
            width: isMobile ? "200px" : "350px",
            height: isMobile ? "150px" : "250px",
            transform: "translate(-50%, -50%)",
            background: activeColor
              ? `radial-gradient(ellipse, ${activeColor}33 0%, ${activeColor}11 40%, transparent 70%)`
              : "radial-gradient(ellipse, hsl(var(--gold) / 0.18) 0%, hsl(var(--gold) / 0.06) 40%, transparent 70%)",
            filter: "blur(30px)",
          }}
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute"
          style={{
            left: "50%",
            top: "55%",
            width: isMobile ? "280px" : "480px",
            height: isMobile ? "200px" : "320px",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(ellipse, hsl(var(--celestial) / 0.08) 0%, hsl(var(--gold) / 0.04) 50%, transparent 70%)",
            filter: "blur(50px)",
          }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1.05, 0.95, 1.05] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`hand-spark-${i}`}
            className="absolute rounded-full bg-gold/50"
            style={{
              left: `${48 + (Math.random() - 0.5) * 8}%`,
              top: `${53 + (Math.random() - 0.5) * 6}%`,
              width: "3px",
              height: "3px",
            }}
            animate={{
              opacity: [0, 0.9, 0],
              y: [0, -(15 + Math.random() * 30)],
              x: [(Math.random() - 0.5) * 20],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2.5 + Math.random() * 1.5,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* ── Layer 2: Constellation map (enhanced) ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={isMobile ? {} : { x: constellationX, y: constellationY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3, delay: 0.8 }}
      >
        {constellations.map((c, i) => (
          <Constellation key={i} stars={c.stars} baseDelay={i * 2.5} />
        ))}
      </motion.div>

      {/* ── Layer 3: Smoke / mist (parallax) ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={isMobile ? {} : { x: smokeX, y: smokeY }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 60%, hsl(var(--gold) / 0.06) 0%, transparent 50%)" }}
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.05, 1], x: [0, 15, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 40% 70%, hsl(var(--crimson) / 0.04) 0%, transparent 40%)" }}
          animate={{ opacity: [0.2, 0.5, 0.2], x: [-10, 20, -10], y: [0, -8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 60% 50%, hsl(var(--celestial) / 0.04) 0%, transparent 45%)" }}
          animate={{ opacity: [0.2, 0.4, 0.2], x: [10, -15, 10], y: [5, -5, 5] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        <motion.div
          className="absolute"
          style={{
            top: "40%", left: "-10%", width: "120%", height: "30%",
            background: "linear-gradient(90deg, transparent 0%, hsl(var(--gold) / 0.03) 30%, hsl(var(--gold) / 0.05) 50%, hsl(var(--gold) / 0.03) 70%, transparent 100%)",
            filter: "blur(40px)",
          }}
          animate={{ x: [-50, 50, -50], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute"
          style={{
            top: "55%", left: "-5%", width: "110%", height: "20%",
            background: "linear-gradient(90deg, transparent 0%, hsl(var(--crimson) / 0.02) 40%, hsl(var(--crimson) / 0.04) 60%, transparent 100%)",
            filter: "blur(50px)",
          }}
          animate={{ x: [30, -40, 30], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
      </motion.div>

      {/* ── Layer 4: Ambient particles ── */}
      {particles.map((p, i) => (
        <AmbientParticle key={i} {...p} />
      ))}

      {/* ── Cinematic vignette (in fixed bg) ── */}
      <div
        className="absolute inset-0 pointer-events-none z-[3]"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, hsl(var(--deep-blue) / 0.6) 100%)",
        }}
      />

      {/* ── Film grain, lens flare — desktop only (in fixed bg) ── */}
      {!isMobile && (
        <>
          <motion.div
            className="absolute inset-0 pointer-events-none z-[4] mix-blend-overlay"
            style={{
              opacity: 0.03,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "128px 128px",
            }}
            animate={{ opacity: [0.02, 0.04, 0.02] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute pointer-events-none z-[5]"
            style={{
              width: "350px", height: "350px", left: "55%", top: "35%",
              background: "radial-gradient(circle, hsl(var(--gold) / 0.06) 0%, hsl(var(--gold) / 0.02) 30%, transparent 60%)",
              filter: "blur(20px)",
            }}
            animate={{ x: [-20, 30, -10, 20, -20], y: [10, -15, 20, -10, 10], opacity: [0.3, 0.7, 0.4, 0.6, 0.3], scale: [1, 1.2, 0.9, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}
      {/* ── Crystal ball + zodiac scene (floating, no container) ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[12]" style={{ paddingTop: isMobile ? "calc(5vh + 150px)" : "calc(5vh + 190px)" }}>
        {isMobile ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 1 }}
            className="relative flex items-center justify-center pointer-events-auto"
            style={{ width: "100%", maxWidth: "400px", marginTop: "200px" }}
          >
            {/* Aura glow */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: "200px", height: "200px",
                background: "radial-gradient(circle, hsl(var(--gold) / 0.15) 0%, hsl(var(--celestial) / 0.08) 40%, transparent 70%)",
              }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            {entranceComplete && (
              <ZodiacWheel isMobile={isMobile} hoveredMenuItem={hoveredItem} />
            )}
            <CrystalBallEnergy isMobile={isMobile} />
            <motion.div
              ref={crystalRef}
              className="relative z-20 cursor-pointer"
              style={{ width: "180px", height: "180px" }}
              onClick={handleCrystalClick}
            >
              <img
                src={crystalBall}
                alt="Crystal Ball"
                className="w-full h-full"
                style={{
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 35px hsl(43 80% 55% / 0.4))",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center" style={{ top: "-10%" }}>
                {entranceComplete && (
                  <TarotCardReveal isMobile={isMobile} onOpenTarot={() => setTarotOpen(true)} onPhaseChange={setCardPhase} />
                )}
              </div>
            </motion.div>
            <EnergyPulse isMobile={isMobile} activeColor={activeColor} isNearBall={isNearBall} clickBurst={clickBurst} />
            {entranceComplete && cardPhase === "idle" && (
              <motion.div
                className="absolute z-30 text-center"
                style={{ bottom: "-20px", width: "200px" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.7, 0] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 6, delay: 4 }}
              >
                <span className="text-gold/50 font-body text-[10px]">
                  {t.hero_crystal_hint}
                </span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="relative flex items-center justify-center pointer-events-auto"
            style={{ x: crystalX, y: crystalY, marginTop: "215px" }}
          >
            <motion.div
              className="absolute rounded-full z-15 pointer-events-none"
              style={{
                width: "120px", height: "120px",
                x: glowShiftX, y: glowShiftY,
                background: activeColor
                  ? `radial-gradient(circle, ${activeColor}22 0%, transparent 70%)`
                  : "radial-gradient(circle, hsl(var(--gold) / 0.12) 0%, transparent 70%)",
              }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{
                width: "320px", height: "320px",
                background: hoveredItem !== null
                  ? `radial-gradient(circle, ${ITEM_COLORS[hoveredItem].glow}33 0%, ${ITEM_COLORS[hoveredItem].glow}15 40%, transparent 70%)`
                  : "radial-gradient(circle, hsl(var(--gold) / 0.15) 0%, hsl(var(--celestial) / 0.08) 40%, transparent 70%)",
              }}
              animate={{
                scale: hoveredItem !== null ? [1, 1.25, 1] : [1, 1.15, 1],
                opacity: hoveredItem !== null ? [0.6, 1, 0.6] : [0.5, 0.8, 0.5],
              }}
              transition={{ duration: hoveredItem !== null ? 2 : 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute rounded-full pointer-events-none z-15"
              style={{
                width: "220px", height: "220px",
                background: "conic-gradient(from 0deg, transparent 0%, hsl(var(--gold) / 0.08) 15%, transparent 30%, hsl(var(--celestial) / 0.06) 50%, transparent 65%, hsl(var(--crimson) / 0.05) 80%, transparent 100%)",
              }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute rounded-full pointer-events-none z-15"
              style={{
                width: "160px", height: "160px",
                background: activeColor
                  ? `radial-gradient(circle, ${activeColor}22 0%, transparent 70%)`
                  : "radial-gradient(circle, hsl(var(--gold) / 0.1) 0%, transparent 70%)",
              }}
              animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: "350px", height: "350px",
                background: "radial-gradient(circle, transparent 50%, hsl(var(--gold) / 0.04) 70%, transparent 90%)",
              }}
              animate={{ rotate: [0, 360], scale: [1, 1.08, 1] }}
              transition={{ rotate: { duration: 30, repeat: Infinity, ease: "linear" }, scale: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
            />
            {/* Removed mystical-border rings — they created visible container edges */}
            <EnergyPulse isMobile={isMobile} activeColor={activeColor} isNearBall={isNearBall} clickBurst={clickBurst} />
            {entranceComplete && (
              <ArcanePortalRing isMobile={isMobile} activeColor={activeColor} />
            )}
            {entranceComplete && (
              <ZodiacWheel isMobile={isMobile} hoveredMenuItem={hoveredItem} />
            )}
            <CrystalBallEnergy isMobile={isMobile} />
            <motion.div
              ref={crystalRef}
              className="relative z-20 cursor-pointer"
              style={{ width: "320px", height: "320px" }}
              onClick={handleCrystalClick}
            >
              <img
                src={crystalBall}
                alt="Crystal Ball"
                className="w-full h-full"
                style={{
                  objectFit: "contain",
                  filter: hoveredItem !== null
                    ? `drop-shadow(0 0 40px ${ITEM_COLORS[hoveredItem]?.glow || "hsl(43 80% 55%)"}66) drop-shadow(0 0 80px ${ITEM_COLORS[hoveredItem]?.glow || "hsl(43 80% 55%)"}22) brightness(1.05)`
                    : "drop-shadow(0 0 30px hsl(215 60% 60% / 0.3)) drop-shadow(0 0 60px hsl(43 80% 55% / 0.15)) brightness(1.02)",
                  transition: "filter 0.8s ease-in-out",
                  mixBlendMode: "screen",
                }}
              />
              <AnimatePresence>
                {isNearBall && (
                  <>
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={`ripple-${i}`}
                        className="absolute rounded-full pointer-events-none"
                        style={{ inset: 0, border: "1px solid hsl(var(--gold) / 0.12)" }}
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: [0.85, 1.15], opacity: [0.4, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
                      />
                    ))}
                    <motion.div
                      className="absolute inset-[10%] rounded-full pointer-events-none overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        className="absolute"
                        style={{
                          width: "40%", height: "100%",
                          background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.1), hsl(var(--gold) / 0.18), hsl(var(--gold) / 0.1), transparent)",
                          filter: "blur(6px)", borderRadius: "50%", top: 0,
                        }}
                        animate={{ left: ["-40%", "140%"] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
                      />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
              <div className="absolute inset-0 flex items-center justify-center" style={{ top: "-10%" }}>
                {entranceComplete && (
                  <TarotCardReveal isMobile={isMobile} onOpenTarot={() => setTarotOpen(true)} onPhaseChange={setCardPhase} />
                )}
              </div>
            </motion.div>
            {/* Tabs moved to fixed side panels outside the ball container */}
          </motion.div>
        )}
      </div>

      {/* ── Side-positioned feature tabs (desktop: fixed sides, mobile: bottom row) ── */}
      {!isMobile ? (
        <>
          {/* Left side tabs */}
          <div className="absolute z-[14] pointer-events-auto" style={{ left: "32px", top: "50%", transform: "translateY(-50%)" }}>
            <div className="flex flex-col gap-4">
              {menuItems.filter(item => item.side === "left").map((item, idx) => {
                const globalIdx = idx;
                const itemColor = ITEM_COLORS[globalIdx];
                return (
                  <motion.div
                    key={globalIdx}
                    className="cursor-pointer"
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.5 + idx * 0.15 }}
                    onMouseEnter={() => setHoveredItem(globalIdx)}
                    onMouseLeave={() => setHoveredItem(null)}
                    whileHover={{ scale: 1.08, x: 6 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { if (globalIdx === 0) setForecastOpen(true); if (globalIdx === 1) setCompatibilityOpen(true); if (globalIdx === 2) setRisingOpen(true); }}
                  >
                    <motion.div
                      className="relative flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 whitespace-nowrap"
                      style={{
                        borderWidth: "1px", borderStyle: "solid",
                        borderColor: hoveredItem === globalIdx ? `${itemColor.glow}88` : "hsl(var(--gold) / 0.1)",
                        background: hoveredItem === globalIdx ? `${itemColor.glow}15` : "hsl(var(--deep-blue) / 0.3)",
                        backdropFilter: "blur(12px)",
                        boxShadow: hoveredItem === globalIdx
                          ? `0 0 24px ${itemColor.glow}44, 0 0 48px ${itemColor.glow}18`
                          : "0 2px 12px hsl(0 0% 0% / 0.2)",
                      }}
                      animate={{ y: [0, -5, 1, -3, 0], x: [0, 2, 0, -1, 0], opacity: [0.85, 1, 0.9, 1, 0.85] }}
                      transition={{ duration: 6 + idx * 1.2, repeat: Infinity, ease: "easeInOut", delay: idx * 0.8 }}
                    >
                      <motion.div
                        animate={hoveredItem === globalIdx ? {
                          filter: [`drop-shadow(0 0 4px ${itemColor.glow}88)`, `drop-shadow(0 0 10px ${itemColor.glow})`, `drop-shadow(0 0 4px ${itemColor.glow}88)`],
                        } : { filter: "none" }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0 transition-colors duration-300" style={{ color: hoveredItem === globalIdx ? itemColor.glow : "hsl(var(--gold) / 0.65)" }} />
                      </motion.div>
                      <span className="font-body text-sm font-medium transition-colors duration-300" style={{ color: hoveredItem === globalIdx ? itemColor.glow : "hsl(var(--foreground) / 0.8)" }}>
                        {item.label}
                      </span>
                      {hoveredItem === globalIdx && (
                        <motion.div className="absolute -inset-2 rounded-2xl pointer-events-none" style={{ background: `radial-gradient(circle, ${itemColor.glow}12, transparent 70%)` }} initial={{ opacity: 0 }} animate={{ opacity: [0, 0.7, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
          {/* Right side tabs */}
          <div className="absolute z-[14] pointer-events-auto" style={{ right: "32px", top: "50%", transform: "translateY(-50%)" }}>
            <div className="flex flex-col gap-4">
              {menuItems.filter(item => item.side === "right").map((item, idx) => {
                const globalIdx = idx + 3;
                const itemColor = ITEM_COLORS[globalIdx];
                return (
                  <motion.div
                    key={globalIdx}
                    className="cursor-pointer"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.5 + idx * 0.15 }}
                    onMouseEnter={() => setHoveredItem(globalIdx)}
                    onMouseLeave={() => setHoveredItem(null)}
                    whileHover={{ scale: 1.08, x: -6 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { if (globalIdx === 3) setDailyCardOpen(true); if (globalIdx === 4) setTarotOpen(true); if (globalIdx === 5) setPalmOpen(true); }}
                  >
                    <motion.div
                      className="relative flex items-center justify-end gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 whitespace-nowrap"
                      style={{
                        borderWidth: "1px", borderStyle: "solid",
                        borderColor: hoveredItem === globalIdx ? `${itemColor.glow}88` : "hsl(var(--gold) / 0.1)",
                        background: hoveredItem === globalIdx ? `${itemColor.glow}15` : "hsl(var(--deep-blue) / 0.3)",
                        backdropFilter: "blur(12px)",
                        boxShadow: hoveredItem === globalIdx
                          ? `0 0 24px ${itemColor.glow}44, 0 0 48px ${itemColor.glow}18`
                          : "0 2px 12px hsl(0 0% 0% / 0.2)",
                      }}
                      animate={{ y: [0, -5, 1, -3, 0], x: [0, -2, 0, 1, 0], opacity: [0.85, 1, 0.9, 1, 0.85] }}
                      transition={{ duration: 6 + idx * 1.2, repeat: Infinity, ease: "easeInOut", delay: idx * 0.8 + 0.4 }}
                    >
                      <span className="font-body text-sm font-medium transition-colors duration-300" style={{ color: hoveredItem === globalIdx ? itemColor.glow : "hsl(var(--foreground) / 0.8)" }}>
                        {item.label}
                      </span>
                      <motion.div
                        animate={hoveredItem === globalIdx ? {
                          filter: [`drop-shadow(0 0 4px ${itemColor.glow}88)`, `drop-shadow(0 0 10px ${itemColor.glow})`, `drop-shadow(0 0 4px ${itemColor.glow}88)`],
                        } : { filter: "none" }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0 transition-colors duration-300" style={{ color: hoveredItem === globalIdx ? itemColor.glow : "hsl(var(--gold) / 0.65)" }} />
                      </motion.div>
                      {hoveredItem === globalIdx && (
                        <motion.div className="absolute -inset-2 rounded-2xl pointer-events-none" style={{ background: `radial-gradient(circle, ${itemColor.glow}12, transparent 70%)` }} initial={{ opacity: 0 }} animate={{ opacity: [0, 0.7, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* Mobile: horizontal scroll row below crystal ball */
        <div className="absolute z-[14] pointer-events-auto inset-x-0 px-4" style={{ top: `min(calc(50% + 300px), calc(100dvh - 140px - env(safe-area-inset-bottom, 16px)))` }}>
          <motion.div
            className="flex gap-2.5 justify-center flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
          >
            {menuItems.map((item, i) => {
              const itemColor = ITEM_COLORS[i];
              return (
                <motion.button
                  key={i}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all duration-300"
                  style={{
                    border: "1px solid hsl(var(--gold) / 0.12)",
                    background: "hsl(var(--deep-blue) / 0.4)",
                    backdropFilter: "blur(12px)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { if (i === 0) setForecastOpen(true); if (i === 1) setCompatibilityOpen(true); if (i === 2) setRisingOpen(true); if (i === 3) setDailyCardOpen(true); if (i === 4) setTarotOpen(true); if (i === 5) setPalmOpen(true); }}
                >
                  <item.icon className="w-4 h-4" style={{ color: itemColor.glow }} />
                  <span className="font-body text-xs font-medium" style={{ color: "hsl(var(--foreground) / 0.8)" }}>{item.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* ── Fixed CTA below crystal ball ── */}
      <div
        className="absolute inset-x-0 flex justify-center pointer-events-none z-[13] px-4"
        style={{
          top: isMobile
            ? `min(calc(50% + 335px + 55px), calc(100dvh - 80px - env(safe-area-inset-bottom, 16px)))`
            : `calc(50% + 370px + 55px)`,
        }}
      >
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          onClick={() => setTarotOpen(true)}
          className={`btn-gold rounded-full font-heading tracking-wider pointer-events-auto ${isMobile ? "text-sm px-8 py-3" : "text-base px-12 py-4"}`}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          {t.hero_cta_personal}
        </motion.button>
      </div>
    </div>
        </>,
        document.body
      )
    : null;

  return (
    <>
      {heroLayer}
      <MonthlyForecastModal isOpen={forecastOpen} onClose={() => setForecastOpen(false)} />
      <RisingSignModal isOpen={risingOpen} onClose={() => setRisingOpen(false)} />
      <CompatibilityModal isOpen={compatibilityOpen} onClose={() => setCompatibilityOpen(false)} />
      <TarotModal isOpen={tarotOpen} onClose={() => setTarotOpen(false)} />
      <PalmReadingModal isOpen={palmOpen} onClose={() => setPalmOpen(false)} />
      <DailyCardModal isOpen={dailyCardOpen} onClose={() => setDailyCardOpen(false)} />
    </>
  );
};

export default HeroSection;
