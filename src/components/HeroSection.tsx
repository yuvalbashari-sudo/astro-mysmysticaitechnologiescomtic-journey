import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Moon, Eye, Hand } from "lucide-react";
import heroFigure from "@/assets/hero-mystic-figure.jpg";
import crystalBall from "@/assets/crystal-ball.png";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import MonthlyForecastModal from "./MonthlyForecastModal";
import RisingSignModal from "./RisingSignModal";
import CompatibilityModal from "./CompatibilityModal";
import TarotModal from "./TarotModal";
import PalmReadingModal from "./PalmReadingModal";
import { useT } from "@/i18n";
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

const FORTUNE_MESSAGES = [
  "היקום מאותת לך לשים לב להזדמנות שמופיעה היום.",
  "כוח נסתר מתעורר בתוכך — הקשיבו לאינטואיציה.",
  "הכוכבים מיישרים קו לטובתכם... משהו משמעותי מתקרב.",
  "אנרגיה חדשה נכנסת לחייכם — היו פתוחים לשינוי.",
  "המסלול הקוסמי שלכם מתחיל להיחשף... גלו אותו.",
];

/* ── Energy colors per menu item ── */
const ITEM_COLORS = [
  { glow: "hsl(43, 80%, 55%)", bg: "hsl(43, 80%, 55%)", label: "gold" },        // Forecast - gold
  { glow: "hsl(215, 70%, 65%)", bg: "hsl(215, 70%, 65%)", label: "silver-blue" }, // Rising - silver blue
  { glow: "hsl(340, 70%, 60%)", bg: "hsl(340, 70%, 60%)", label: "pink" },       // Compatibility - pink
  { glow: "hsl(0, 65%, 50%)", bg: "hsl(0, 65%, 50%)", label: "red" },            // Tarot - red/gold
  { glow: "hsl(43, 90%, 50%)", bg: "hsl(43, 90%, 50%)", label: "sacred-gold" },  // Palm - sacred gold
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

/* ── Crystal Ball Internal Energy ──────────────────── */
const CrystalBallEnergy = ({ isMobile }: { isMobile: boolean }) => {
  const size = isMobile ? 140 : 220;
  return (
    <div className="absolute z-[21] pointer-events-none" style={{ width: size, height: size }}>
      {/* Swirling internal energy */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{ mixBlendMode: "screen" }}
      >
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "60%", height: "60%", left: "20%", top: "20%",
            background: "radial-gradient(circle, hsl(var(--gold) / 0.15) 0%, hsl(var(--celestial) / 0.08) 50%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.4, 0.9, 1.2, 1],
            x: [0, 10, -8, 5, 0],
            y: [0, -8, 5, -3, 0],
            opacity: [0.4, 0.7, 0.3, 0.6, 0.4],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "40%", height: "40%", left: "30%", top: "35%",
            background: "radial-gradient(circle, hsl(var(--crimson) / 0.1) 0%, transparent 70%)",
          }}
          animate={{
            scale: [0.8, 1.3, 0.7, 1.1, 0.8],
            x: [0, -12, 8, -5, 0],
            y: [0, 6, -10, 4, 0],
            opacity: [0.2, 0.5, 0.2, 0.4, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "30%", height: "30%", left: "40%", top: "25%",
            background: "radial-gradient(circle, hsl(var(--celestial) / 0.12) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 0.6, 1.5, 0.8, 1],
            x: [0, 15, -10, 8, 0],
            y: [0, -5, 12, -8, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </motion.div>

      {/* Particle emission from crystal ball */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = size * 0.35;
        return (
          <motion.div
            key={`cb-particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: 2,
              height: 2,
              left: "50%",
              top: "50%",
              background: i % 3 === 0 ? "hsl(var(--gold))" : i % 3 === 1 ? "hsl(var(--celestial))" : "hsl(var(--crimson) / 0.8)",
            }}
            animate={{
              x: [0, Math.cos(angle) * radius, Math.cos(angle) * radius * 1.5],
              y: [0, Math.sin(angle) * radius, Math.sin(angle) * radius * 1.5 - 20],
              opacity: [0, 0.8, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5 + Math.random(),
              ease: "easeOut",
            }}
          />
        );
      })}
    </div>
  );
};

/* ── Zodiac Wheel ──────────────────────────────────── */
const ZODIAC_ICONS = [ariesIcon, taurusIcon, geminiIcon, cancerIcon, leoIcon, virgoIcon, libraIcon, scorpioIcon, sagittariusIcon, capricornIcon, aquariusIcon, piscesIcon];
const ZODIAC_WHEEL = [
  { name: "טלה", en: "Aries" },
  { name: "שור", en: "Taurus" },
  { name: "תאומים", en: "Gemini" },
  { name: "סרטן", en: "Cancer" },
  { name: "אריה", en: "Leo" },
  { name: "בתולה", en: "Virgo" },
  { name: "מאזניים", en: "Libra" },
  { name: "עקרב", en: "Scorpio" },
  { name: "קשת", en: "Sagittarius" },
  { name: "גדי", en: "Capricorn" },
  { name: "דלי", en: "Aquarius" },
  { name: "דגים", en: "Pisces" },
];

const ZodiacWheel = ({
  isMobile,
  hoveredMenuItem,
}: {
  isMobile: boolean;
  hoveredMenuItem: number | null;
}) => {
  const [hoveredSign, setHoveredSign] = useState<number | null>(null);
  const radius = isMobile ? 140 : 338;
  const iconSize = isMobile ? 32 : 62;

  // Compatibility mode: highlight two signs when compatibility tab hovered
  const isCompatMode = hoveredMenuItem === 2;
  const isRisingMode = hoveredMenuItem === 1;
  const compatHighlight = isCompatMode ? [0, 6] : []; // Aries & Libra as example pair

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

        {ZODIAC_WHEEL.map((sign, i) => {
          const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * radius + radius + 20;
          const y = Math.sin(angle) * radius + radius + 20;
          const isHighlighted = compatHighlight.includes(i);
          const isHovered = hoveredSign === i;

          return (
            <motion.div
              key={sign.en}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: x - iconSize / 2,
                top: y - iconSize / 2,
                width: iconSize,
                height: iconSize,
              }}
              onMouseEnter={() => setHoveredSign(i)}
              onMouseLeave={() => setHoveredSign(null)}
              // Counter-rotate to keep symbols upright
              animate={{ rotate: -360 }}
              transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            >
              {/* Zodiac illustration */}
              <motion.div
                className="w-full h-full flex items-center justify-center rounded-full overflow-hidden"
                animate={isHighlighted ? {
                  scale: [1, 1.3, 1],
                } : {}}
                whileHover={{ scale: 1.35 }}
                transition={{ duration: 1.5, repeat: isHighlighted ? Infinity : 0, ease: "easeInOut" }}
              >
                <img
                  src={ZODIAC_ICONS[i]}
                  alt={sign.name}
                  className="w-full h-full object-contain transition-all duration-300"
                  style={{
                    opacity: isHovered || isHighlighted ? 1 : 0.75,
                    filter: isHovered || isHighlighted
                      ? "drop-shadow(0 0 12px hsl(43 80% 55% / 0.8)) drop-shadow(0 0 4px hsl(43 80% 55% / 0.5))"
                      : "drop-shadow(0 0 5px hsl(43 80% 55% / 0.35))",
                  }}
                />
              </motion.div>

              {/* Tooltip on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    className="absolute z-50 whitespace-nowrap"
                    style={{
                      left: "50%",
                      bottom: "calc(100% + 6px)",
                      transform: "translateX(-50%)",
                    }}
                    initial={{ opacity: 0, y: 5, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className="px-2 py-1 rounded-md text-[10px] font-heading backdrop-blur-md"
                      style={{
                        background: "hsl(var(--deep-blue-light) / 0.9)",
                        border: "1px solid hsl(var(--gold) / 0.25)",
                        color: "hsl(var(--gold))",
                        boxShadow: "0 0 15px hsl(var(--gold) / 0.1)",
                      }}
                    >
                      {sign.name}
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
const TAROT_MESSAGES: Record<string, string> = {
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

  // Auto-close revealed card after 10 seconds
  useEffect(() => {
    if (phase !== "revealed") return;
    const timer = setTimeout(() => {
      setPhase("idle");
      setTimeout(() => {
        const [drawn] = drawTarotCards(1);
        setCard(drawn);
        setPhase("silhouette");
      }, 3000);
    }, 10000);
    return () => clearTimeout(timer);
  }, [phase]);

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
  const message = TAROT_MESSAGES[card.name] || `${card.hebrewName} מופיע עבורך — סימן מיסטי מהיקום.`;

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
                <p className="text-foreground/70 font-body text-[10px] leading-relaxed mb-2" dir="rtl">
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
                  פתחו קריאה מלאה ✦
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Fortune Preview ──────────────────────────────── */
const FortunePreview = ({ onReveal, hidden }: { onReveal: () => void; hidden?: boolean }) => {
  const t = useT();
  const [message] = useState(() => FORTUNE_MESSAGES[Math.floor(Math.random() * FORTUNE_MESSAGES.length)]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      className="absolute z-30 text-center left-1/2"
      style={{ top: "calc(50% + 130px)", transform: "translateX(-50%)", width: "260px" }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: hidden ? 0 : 1, y: hidden ? 10 : 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="rounded-xl px-4 py-3 backdrop-blur-md"
        style={{
          background: "linear-gradient(135deg, hsl(var(--deep-blue-light) / 0.9), hsl(var(--deep-blue) / 0.95))",
          border: "1px solid hsl(var(--gold) / 0.2)",
          boxShadow: "0 0 30px hsl(var(--gold) / 0.08)",
        }}
        animate={{
          boxShadow: [
            "0 0 20px hsl(43 80% 55% / 0.05)",
            "0 0 35px hsl(43 80% 55% / 0.12)",
            "0 0 20px hsl(43 80% 55% / 0.05)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="text-gold/80 font-body text-xs leading-relaxed mb-2" dir="rtl">
          ✦ {message}
        </p>
        <motion.button
          onClick={onReveal}
          className="text-gold font-heading text-[11px] tracking-wide"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {t.hero_cta_free} ✦
        </motion.button>
      </motion.div>
    </motion.div>
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
  const [entranceComplete, setEntranceComplete] = useState(false);
  const [isNearBall, setIsNearBall] = useState(false);
  const [clickBurst, setClickBurst] = useState(0);
  const [cardPhase, setCardPhase] = useState<"idle" | "silhouette" | "flipping" | "revealed">("idle");
  const sectionRef = useRef<HTMLElement>(null);
  const crystalRef = useRef<HTMLDivElement>(null);

  const menuItems = useMemo(() => [
    { icon: Star, label: t.hero_menu_forecast, angle: -72 },
    { icon: Moon, label: t.hero_menu_rising, angle: -36 },
    { icon: Sparkles, label: t.hero_menu_compatibility, angle: 0 },
    { icon: Eye, label: t.hero_menu_tarot, angle: 36 },
    { icon: Hand, label: t.hero_menu_palm, angle: 72 },
  ], [t]);

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

  const orbRadius = isMobile ? 140 : 240;

  const particles = useMemo(() => {
    const types: Array<"dust" | "spark" | "orb"> = ["dust", "spark", "orb"];
    return [...Array(isMobile ? 20 : 45)].map((_, i) => ({
      type: types[i % 3],
      delay: Math.random() * 6,
      x: `${Math.random() * 100}%`,
      y: `${20 + Math.random() * 70}%`,
    }));
  }, [isMobile]);

  const handleFortuneReveal = useCallback(() => {
    const el = document.getElementById("free");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Active energy color based on hovered item
  const activeColor = hoveredItem !== null ? ITEM_COLORS[hoveredItem]?.glow : undefined;

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center"
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
        <img src={heroFigure} alt="" className="w-full h-full object-cover object-top scale-110" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
      </motion.div>

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

      {/* Content container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-12 md:pt-16">
        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          className="text-center mb-4 md:mb-6"
        >
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl gold-gradient-text tracking-wider">
            ASTROLOGAI
          </h1>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-center mb-2 md:mb-4"
        >
          <h2 className="font-body text-xl md:text-2xl lg:text-3xl text-foreground/90 font-light leading-relaxed">
            {t.hero_headline}
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="text-center text-muted-foreground font-body text-sm md:text-base mb-8 md:mb-6 max-w-xl mx-auto"
        >
          {t.hero_subheadline}
        </motion.p>

        {/* ── Central mystical scene ── */}
        <div className="relative flex items-center justify-center" style={{ minHeight: isMobile ? "620px" : "520px" }}>

          {/* Crystal ball center (parallax layer) */}
          <motion.div
            className="relative flex items-center justify-center"
            style={isMobile ? {} : { x: crystalX, y: crystalY }}
          >
            {!isMobile && (
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
            )}

            {/* Main aura glow - reacts to hovered item color */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: isMobile ? "220px" : "320px",
                height: isMobile ? "220px" : "320px",
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

            {/* Rotating conic gradient */}
            <motion.div
              className="absolute rounded-full pointer-events-none z-15"
              style={{
                width: isMobile ? "140px" : "220px",
                height: isMobile ? "140px" : "220px",
                background: "conic-gradient(from 0deg, transparent 0%, hsl(var(--gold) / 0.08) 15%, transparent 30%, hsl(var(--celestial) / 0.06) 50%, transparent 65%, hsl(var(--crimson) / 0.05) 80%, transparent 100%)",
              }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />

            {/* Inner pulse */}
            <motion.div
              className="absolute rounded-full pointer-events-none z-15"
              style={{
                width: isMobile ? "100px" : "160px",
                height: isMobile ? "100px" : "160px",
                background: activeColor
                  ? `radial-gradient(circle, ${activeColor}22 0%, transparent 70%)`
                  : "radial-gradient(circle, hsl(var(--gold) / 0.1) 0%, transparent 70%)",
              }}
              animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Outer rings */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: isMobile ? "240px" : "350px",
                height: isMobile ? "240px" : "350px",
                background: "radial-gradient(circle, transparent 50%, hsl(var(--gold) / 0.04) 70%, transparent 90%)",
              }}
              animate={{ rotate: [0, 360], scale: [1, 1.08, 1] }}
              transition={{ rotate: { duration: 30, repeat: Infinity, ease: "linear" }, scale: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
            />

            <motion.div
              className="absolute rounded-full mystical-border"
              style={{ width: isMobile ? "260px" : "380px", height: isMobile ? "260px" : "380px", borderColor: "hsl(var(--gold) / 0.1)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute rounded-full mystical-border"
              style={{ width: isMobile ? "300px" : "420px", height: isMobile ? "300px" : "420px", borderColor: "hsl(var(--gold) / 0.06)" }}
              animate={{ rotate: -360 }}
              transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            />

            <EnergyPulse isMobile={isMobile} activeColor={activeColor} isNearBall={isNearBall} clickBurst={clickBurst} />

            {/* Arcane Portal Ring */}
            {entranceComplete && (
              <ArcanePortalRing isMobile={isMobile} activeColor={activeColor} />
            )}

            {/* Zodiac Wheel */}
            {entranceComplete && (
              <ZodiacWheel isMobile={isMobile} hoveredMenuItem={hoveredItem} />
            )}

            {/* Crystal Ball Internal Energy */}
            <CrystalBallEnergy isMobile={isMobile} />

            {/* Crystal ball image */}
            <motion.div
              ref={crystalRef}
              className="relative z-20 cursor-pointer"
              style={{ width: isMobile ? "180px" : "280px", height: isMobile ? "180px" : "280px" }}
              onClick={handleCrystalClick}
            >
              <motion.img
                src={crystalBall}
                alt="Crystal Ball"
                className="w-full h-full"
                style={{ objectFit: "contain" }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  scale: hoveredItem !== null ? [1, 1.04, 1] : 1,
                  filter: hoveredItem !== null
                    ? [
                        `drop-shadow(0 0 40px ${ITEM_COLORS[hoveredItem]?.glow || "hsl(43 80% 55%)"}55)`,
                        `drop-shadow(0 0 70px ${ITEM_COLORS[hoveredItem]?.glow || "hsl(43 80% 55%)"}88)`,
                        `drop-shadow(0 0 40px ${ITEM_COLORS[hoveredItem]?.glow || "hsl(43 80% 55%)"}55)`,
                      ]
                    : ["drop-shadow(0 0 35px hsl(43 80% 55% / 0.25))", "drop-shadow(0 0 55px hsl(43 80% 55% / 0.45))", "drop-shadow(0 0 35px hsl(43 80% 55% / 0.25))"],
                }}
                transition={{
                  opacity: { duration: 1.5, delay: 1 },
                  scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                  filter: { duration: hoveredItem !== null ? 1.5 : 4, repeat: Infinity, ease: "easeInOut" },
                }}
              />

              {/* Ripple effect on mouse proximity */}
              <AnimatePresence>
                {isNearBall && (
                  <>
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={`ripple-${i}`}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          inset: 0,
                          border: "1px solid hsl(var(--gold) / 0.12)",
                        }}
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{
                          scale: [0.85, 1.15],
                          opacity: [0.4, 0],
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.6,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                    {/* Surface shimmer */}
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
                          width: "40%",
                          height: "100%",
                          background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.1), hsl(var(--gold) / 0.18), hsl(var(--gold) / 0.1), transparent)",
                          filter: "blur(6px)",
                          borderRadius: "50%",
                          top: 0,
                        }}
                        animate={{ left: ["-40%", "140%"] }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          repeatDelay: 1,
                          ease: "easeInOut",
                        }}
                      />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Tarot Card Reveal inside crystal ball */}
              <div className="absolute inset-0 flex items-center justify-center" style={{ top: "-10%" }}>
                {entranceComplete && (
                  <TarotCardReveal isMobile={isMobile} onOpenTarot={() => setTarotOpen(true)} onPhaseChange={setCardPhase} />
                )}
              </div>
            </motion.div>

            {/* Fortune Preview */}
            {entranceComplete && (
              <FortunePreview onReveal={handleFortuneReveal} />
            )}

            {/* ── Energy lines from hovered item to crystal ball ── */}
            <AnimatePresence>
              {hoveredItem !== null && !isMobile && (() => {
                const item = menuItems[hoveredItem];
                const angleRad = (item.angle * Math.PI) / 180;
                const itemX = Math.sin(angleRad) * orbRadius;
                const itemY = -Math.cos(angleRad) * orbRadius * 0.55;
                return (
                  <EnergyLine
                    key={`energy-line-${hoveredItem}`}
                    fromX={itemX}
                    fromY={itemY}
                    color={ITEM_COLORS[hoveredItem].glow}
                    isMobile={isMobile}
                  />
                );
              })()}
            </AnimatePresence>

            {/* ── Floating menu items ── */}
            {menuItems.map((item, i) => {
              const angleRad = (item.angle * Math.PI) / 180;
              const x = isMobile ? 0 : Math.sin(angleRad) * orbRadius;
              const y = isMobile
                ? 155 + i * 42
                : -Math.cos(angleRad) * orbRadius * 0.55;
              const itemColor = ITEM_COLORS[i];

              return (
                <motion.div
                  key={i}
                  className="absolute z-30 cursor-pointer"
                  style={{
                    left: isMobile ? `calc(50% - 65px)` : `calc(50% + ${x}px - 80px)`,
                    top: `calc(50% + ${y}px - 20px)`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.5 + i * 0.2 }}
                  onMouseEnter={() => setHoveredItem(i)}
                  onMouseLeave={() => setHoveredItem(null)}
                  whileHover={{ scale: 1.15, y: -10, zIndex: 50 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { if (i === 0) setForecastOpen(true); if (i === 1) setRisingOpen(true); if (i === 2) setCompatibilityOpen(true); if (i === 3) setTarotOpen(true); if (i === 4) setPalmOpen(true); }}
                >
                  <motion.div
                    className="relative flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full backdrop-blur-md transition-all duration-300 whitespace-nowrap"
                    style={{
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: hoveredItem === i ? `${itemColor.glow}99` : "hsl(var(--gold) / 0.15)",
                      background: hoveredItem === i ? `${itemColor.glow}22` : "hsl(var(--muted) / 0.2)",
                      boxShadow: hoveredItem === i
                        ? `0 0 30px ${itemColor.glow}55, 0 0 60px ${itemColor.glow}22`
                        : "0 0 10px hsl(var(--gold) / 0.1)",
                    }}
                    animate={{ y: [0, -4 - i * 0.5, 0] }}
                    transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                  >
                    <motion.div
                      animate={hoveredItem === i ? {
                        filter: [`drop-shadow(0 0 4px ${itemColor.glow}88)`, `drop-shadow(0 0 10px ${itemColor.glow})`, `drop-shadow(0 0 4px ${itemColor.glow}88)`],
                      } : { filter: "none" }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <item.icon
                        className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 transition-colors duration-300"
                        style={{ color: hoveredItem === i ? itemColor.glow : "hsl(var(--gold) / 0.6)" }}
                      />
                    </motion.div>
                    <span
                      className="font-body text-[10px] md:text-xs transition-colors duration-300"
                      style={{ color: hoveredItem === i ? itemColor.glow : "hsl(var(--foreground) / 0.7)" }}
                    >
                      {item.label}
                    </span>

                    {/* Hover glow aura */}
                    {hoveredItem === i && (
                      <motion.div
                        className="absolute -inset-3 rounded-full pointer-events-none"
                        style={{ background: `radial-gradient(circle, ${itemColor.glow}15, transparent 70%)` }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: [0, 0.8, 0.4], scale: [0.8, 1.4, 1.2] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}

                    {/* Mystical icon that appears on hover */}
                    <AnimatePresence>
                      {hoveredItem === i && (
                        <motion.span
                          className="absolute -top-5 left-1/2 text-sm pointer-events-none"
                          style={{ transform: "translateX(-50%)" }}
                          initial={{ opacity: 0, y: 5, scale: 0.5 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -5, scale: 0.5 }}
                          transition={{ duration: 0.3 }}
                        >
                          {["⭐", "🌙", "💫", "🔮", "✋"][i]}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6 md:mt-10 pb-8"
        >
          <a href="#free" className="btn-gold font-body flex items-center gap-2 text-sm md:text-base">
            <Sparkles className="w-4 h-4" />
            {t.hero_cta_free}
          </a>
          <a
            href="https://wa.me/972500000000"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-gold font-body flex items-center gap-2 text-sm md:text-base"
          >
            {t.hero_cta_whatsapp}
          </a>
        </motion.div>

        {/* Premium badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3 }}
          className="text-center pb-6"
        >
          <span className="text-xs text-gold/50 font-body tracking-wider">
            {t.hero_badge}
          </span>
        </motion.div>
      </div>

      {/* ── Cinematic vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none z-[3]"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, hsl(var(--deep-blue) / 0.6) 100%)",
        }}
      />

      {/* ── Subtle film grain overlay ── */}
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

      {/* ── Cinematic lens flare ── */}
      <motion.div
        className="absolute pointer-events-none z-[5]"
        style={{
          width: isMobile ? "200px" : "350px",
          height: isMobile ? "200px" : "350px",
          left: "55%",
          top: "35%",
          background: "radial-gradient(circle, hsl(var(--gold) / 0.06) 0%, hsl(var(--gold) / 0.02) 30%, transparent 60%)",
          filter: "blur(20px)",
        }}
        animate={{
          x: [-20, 30, -10, 20, -20],
          y: [10, -15, 20, -10, 10],
          opacity: [0.3, 0.7, 0.4, 0.6, 0.3],
          scale: [1, 1.2, 0.9, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ── Anamorphic horizontal light streak ── */}
      <motion.div
        className="absolute pointer-events-none z-[5]"
        style={{
          width: isMobile ? "120%" : "100%",
          height: "2px",
          left: "-10%",
          top: "48%",
          background: "linear-gradient(90deg, transparent 0%, hsl(var(--gold) / 0.04) 20%, hsl(var(--gold) / 0.08) 50%, hsl(var(--gold) / 0.04) 80%, transparent 100%)",
          filter: "blur(3px)",
        }}
        animate={{
          opacity: [0, 0.6, 0.3, 0.7, 0],
          scaleY: [1, 2, 1, 1.5, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* ── Slow color grading shift ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-[2]"
        animate={{
          background: [
            "linear-gradient(180deg, hsl(215 70% 40% / 0.03) 0%, transparent 50%, hsl(0 65% 45% / 0.02) 100%)",
            "linear-gradient(180deg, hsl(43 80% 55% / 0.02) 0%, transparent 50%, hsl(215 70% 40% / 0.03) 100%)",
            "linear-gradient(180deg, hsl(215 70% 40% / 0.03) 0%, transparent 50%, hsl(0 65% 45% / 0.02) 100%)",
          ],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <MonthlyForecastModal isOpen={forecastOpen} onClose={() => setForecastOpen(false)} />
      <RisingSignModal isOpen={risingOpen} onClose={() => setRisingOpen(false)} />
      <CompatibilityModal isOpen={compatibilityOpen} onClose={() => setCompatibilityOpen(false)} />
      <TarotModal isOpen={tarotOpen} onClose={() => setTarotOpen(false)} />
      <PalmReadingModal isOpen={palmOpen} onClose={() => setPalmOpen(false)} />
    </section>
  );
};

export default HeroSection;
