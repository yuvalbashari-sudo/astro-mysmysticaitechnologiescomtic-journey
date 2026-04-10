import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { PLANETS } from "@/components/NatalChartWheel";
import { useLanguage } from "@/i18n/LanguageContext";
import { getPlanetName } from "@/lib/astroLocale";
import type { NatalChartResult } from "@/lib/natalChart";
import type { Language } from "@/i18n/types";

interface Props {
  userName?: string;
  chartData: NatalChartResult;
  onComplete: () => void;
}

/* ── Planet visual config with vibrant colors ── */
const PLANET_RAYS: Record<string, { color: string; glowColor: string; angle: number }> = {
  sun:     { color: "#E8B84B", glowColor: "#FFD97040", angle: 0 },
  moon:    { color: "#C4C9D2", glowColor: "#C4C9D240", angle: 36 },
  mercury: { color: "#8BC4A9", glowColor: "#8BC4A940", angle: 72 },
  venus:   { color: "#E88BC4", glowColor: "#E88BC440", angle: 108 },
  mars:    { color: "#C45B5B", glowColor: "#C45B5B40", angle: 144 },
  jupiter: { color: "#8B9FE8", glowColor: "#8B9FE840", angle: 180 },
  saturn:  { color: "#A89070", glowColor: "#A8907040", angle: 216 },
  uranus:  { color: "#70C8E8", glowColor: "#70C8E840", angle: 252 },
  neptune: { color: "#7088E8", glowColor: "#7088E840", angle: 288 },
  pluto:   { color: "#9070A8", glowColor: "#9070A840", angle: 324 },
};

const STATUS_TEXT: Record<Language, string[]> = {
  he: [
    "מחשבים את המפה האישית שלך...",
    "מנתחים השפעות פלנטריות...",
    "האור האסטרלי שלך מתגבש...",
    "חותמת האנרגיה שלך נחשפת...",
  ],
  en: [
    "Calculating your personal chart...",
    "Analyzing planetary influences...",
    "Your astral light is taking shape...",
    "Your energy signature is revealed...",
  ],
  ru: [
    "Рассчитываем вашу персональную карту...",
    "Анализируем планетарные влияния...",
    "Ваш астральный свет обретает форму...",
    "Ваша энергетическая подпись раскрывается...",
  ],
  ar: [
    "حساب خريطتك الشخصية...",
    "تحليل التأثيرات الكوكبية...",
    "ضوءك النجمي يتشكل...",
    "بصمة طاقتك تتكشف...",
  ],
};

/* Calculate planet influence weight from chart data */
function computeInfluences(chartData: NatalChartResult): Record<string, number> {
  const weights: Record<string, number> = {};
  const basePriority: Record<string, number> = {
    sun: 3, moon: 2.5, mercury: 1, venus: 1, mars: 1,
    jupiter: 1, saturn: 1, uranus: 0.8, neptune: 0.8, pluto: 0.8,
  };

  PLANETS.forEach((p) => {
    weights[p.key] = basePriority[p.key] || 1;
  });

  // Boost planets with more aspects
  chartData.aspects.forEach((a) => {
    if (weights[a.planet1Key] !== undefined) weights[a.planet1Key] += 0.5;
    if (weights[a.planet2Key] !== undefined) weights[a.planet2Key] += 0.5;
  });

  // Boost angular house planets (1, 4, 7, 10)
  chartData.planetPlacements.forEach((p) => {
    if ([1, 4, 7, 10].includes(p.house)) {
      weights[p.key] = (weights[p.key] || 1) + 1;
    }
  });

  // Normalize to percentage
  const total = Object.values(weights).reduce((s, v) => s + v, 0);
  Object.keys(weights).forEach((k) => {
    weights[k] = Math.round((weights[k] / total) * 100);
  });

  return weights;
}

/* ── Human silhouette SVG path ── */
const SILHOUETTE_PATH = `
M 150,30
C 150,30 140,15 150,8 C 160,1 170,15 170,30
C 172,35 175,40 175,50 C 175,60 170,65 165,70
L 185,100 L 200,160 L 190,162 L 175,115 L 170,160
L 185,260 L 178,262 L 160,170 L 155,262 L 148,260
L 150,170 L 142,262 L 135,260 L 150,160 L 145,115
L 130,162 L 120,160 L 135,100 L 155,70
C 150,65 145,60 145,50 C 145,40 148,35 150,30 Z
`;

const AstralLightReveal = ({ userName, chartData, onComplete }: Props) => {
  const { language } = useLanguage();
  const [step, setStep] = useState(0);
  const [activePlanets, setActivePlanets] = useState(0);
  const [showInfluences, setShowInfluences] = useState(false);
  const [progress, setProgress] = useState(0);

  const statusTexts = STATUS_TEXT[language] || STATUS_TEXT.en;
  const influences = useMemo(() => computeInfluences(chartData), [chartData]);

  // Sort planets by influence for reveal order
  const sortedPlanets = useMemo(() => {
    return [...PLANETS].sort((a, b) => (influences[b.key] || 0) - (influences[a.key] || 0));
  }, [influences]);

  // Top 5 for influence cards
  const topInfluences = useMemo(() => {
    return sortedPlanets.slice(0, 5);
  }, [sortedPlanets]);

  useEffect(() => {
    const totalDuration = 6000;
    const planetInterval = totalDuration * 0.6 / PLANETS.length;
    const statusInterval = totalDuration / statusTexts.length;

    // Progress bar
    const progTimer = setInterval(() => {
      setProgress((p) => Math.min(p + 1, 100));
    }, totalDuration / 100);

    // Reveal planets one by one
    const planetTimer = setInterval(() => {
      setActivePlanets((p) => {
        if (p >= PLANETS.length) {
          clearInterval(planetTimer);
          return p;
        }
        return p + 1;
      });
    }, planetInterval);

    // Status text progression
    const statusTimer = setInterval(() => {
      setStep((s) => Math.min(s + 1, statusTexts.length - 1));
    }, statusInterval);

    // Show influence cards
    const influenceTimer = setTimeout(() => setShowInfluences(true), totalDuration * 0.75);

    // Complete
    const completeTimer = setTimeout(onComplete, totalDuration + 800);

    return () => {
      clearInterval(progTimer);
      clearInterval(planetTimer);
      clearInterval(statusTimer);
      clearTimeout(influenceTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  // Core glow intensity grows with active planets
  const coreIntensity = Math.min(activePlanets / PLANETS.length, 1);

  // Compute the dominant color blend for the core
  const dominantColor = useMemo(() => {
    if (activePlanets === 0) return "hsl(43 80% 55% / 0.1)";
    const active = sortedPlanets.slice(0, activePlanets);
    // Weighted average toward top influencer
    const topKey = active[0]?.key;
    const topColor = PLANET_RAYS[topKey]?.color || "#E8B84B";
    return topColor;
  }, [activePlanets, sortedPlanets]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 relative overflow-hidden">
      {/* Cosmic background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full"
            style={{
              background: "hsl(var(--gold) / 0.4)",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Central figure with rays */}
      <div className="relative w-full" style={{ maxWidth: 320, aspectRatio: "1 / 1" }}>
        {/* Outer cosmic ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, transparent 55%, ${dominantColor}10 70%, transparent 85%)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />

        {/* Planet rays */}
        {sortedPlanets.map((planet, idx) => {
          const ray = PLANET_RAYS[planet.key];
          if (!ray || idx >= activePlanets) return null;
          const influence = (influences[planet.key] || 5) / 100;
          const angle = ray.angle;
          const radians = (angle - 90) * (Math.PI / 180);
          const startX = 160 + Math.cos(radians) * 140;
          const startY = 160 + Math.sin(radians) * 140;

          return (
            <motion.div
              key={planet.key}
              className="absolute"
              style={{
                inset: 0,
                position: "absolute",
                pointerEvents: "none",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <svg viewBox="0 0 320 320" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
                <defs>
                  <linearGradient id={`ray-${planet.key}`} x1={startX} y1={startY} x2="160" y2="160" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={ray.color} stopOpacity={0.7 * influence + 0.2} />
                    <stop offset="100%" stopColor={ray.color} stopOpacity={0} />
                  </linearGradient>
                  <filter id={`glow-${planet.key}`}>
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <line
                  x1={startX}
                  y1={startY}
                  x2={160}
                  y2={160}
                  stroke={`url(#ray-${planet.key})`}
                  strokeWidth={2 + influence * 4}
                  filter={`url(#glow-${planet.key})`}
                  strokeLinecap="round"
                />
              </svg>

              {/* Planet symbol at ray origin */}
              <motion.div
                className="absolute flex items-center justify-center"
                style={{
                  left: `${(startX / 320) * 100}%`,
                  top: `${(startY / 320) * 100}%`,
                  width: "8.75%",
                  height: "8.75%",
                  transform: "translate(-50%, -50%)",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${ray.color}30, transparent)`,
                  border: `1px solid ${ray.color}50`,
                  fontSize: 12,
                  color: ray.color,
                  textShadow: `0 0 8px ${ray.color}80`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 6px ${ray.color}30`,
                    `0 0 16px ${ray.color}60`,
                    `0 0 6px ${ray.color}30`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.15 }}
              >
                {planet.symbol}
              </motion.div>
            </motion.div>
          );
        })}

        {/* Human silhouette */}
        <svg
          viewBox="0 0 320 320"
          className="absolute inset-0 w-full h-full"
          style={{ filter: `drop-shadow(0 0 ${10 + coreIntensity * 20}px ${dominantColor}40)` }}
        >
          <defs>
            <radialGradient id="core-glow" cx="50%" cy="50%" r="40%">
              <stop offset="0%" stopColor={dominantColor} stopOpacity={0.15 + coreIntensity * 0.25} />
              <stop offset="60%" stopColor={dominantColor} stopOpacity={0.05 + coreIntensity * 0.1} />
              <stop offset="100%" stopColor={dominantColor} stopOpacity={0} />
            </radialGradient>
            <linearGradient id="silhouette-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={dominantColor} stopOpacity={0.15 + coreIntensity * 0.3} />
              <stop offset="50%" stopColor={dominantColor} stopOpacity={0.25 + coreIntensity * 0.35} />
              <stop offset="100%" stopColor={dominantColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>

          {/* Inner glow */}
          <circle cx="160" cy="160" r="80" fill="url(#core-glow)" />

          {/* Pulsing energy core */}
          <motion.circle
            cx="160"
            cy="130"
            r={12 + coreIntensity * 8}
            fill={dominantColor}
            opacity={0.15 + coreIntensity * 0.2}
            animate={{
              r: [12 + coreIntensity * 6, 16 + coreIntensity * 10, 12 + coreIntensity * 6],
              opacity: [0.15 + coreIntensity * 0.15, 0.25 + coreIntensity * 0.25, 0.15 + coreIntensity * 0.15],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />

          {/* Silhouette figure */}
          <g transform="translate(5, 25) scale(1.95)">
            <path
              d={SILHOUETTE_PATH}
              fill="url(#silhouette-fill)"
              stroke={dominantColor}
              strokeWidth="0.5"
              strokeOpacity={0.3 + coreIntensity * 0.3}
            />
          </g>
        </svg>

        {/* Central rings */}
        <motion.div
          className="absolute rounded-full"
          style={{
            left: "50%",
            top: "50%",
            width: 60,
            height: 60,
            marginLeft: -30,
            marginTop: -30,
            border: `1px solid ${dominantColor}20`,
          }}
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            left: "50%",
            top: "50%",
            width: 100,
            height: 100,
            marginLeft: -50,
            marginTop: -50,
            border: `1px solid ${dominantColor}12`,
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Status text */}
      {userName && (
        <motion.p
          className="font-heading text-lg md:text-xl gold-gradient-text mt-6 mb-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {userName}
        </motion.p>
      )}

      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          className="font-body text-sm md:text-base text-center max-w-sm"
          style={{ color: "hsl(var(--foreground) / 0.6)" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5 }}
        >
          {statusTexts[step]}
        </motion.p>
      </AnimatePresence>

      {/* Progress bar */}
      <div
        className="w-48 h-0.5 mt-6 rounded-full overflow-hidden"
        style={{ background: "hsl(var(--gold) / 0.1)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${dominantColor}40, ${dominantColor}90, ${dominantColor}40)`,
          }}
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Influence cards preview */}
      <AnimatePresence>
        {showInfluences && (
          <motion.div
            className="flex flex-wrap justify-center gap-2 mt-6 max-w-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, staggerChildren: 0.08 }}
          >
            {topInfluences.map((planet, i) => {
              const ray = PLANET_RAYS[planet.key];
              return (
                <motion.div
                  key={planet.key}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body"
                  style={{
                    background: `${ray?.color || "#fff"}12`,
                    border: `1px solid ${ray?.color || "#fff"}30`,
                    color: ray?.color || "hsl(var(--foreground))",
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <span style={{ fontSize: 13 }}>{planet.symbol}</span>
                  <span>{getPlanetName(planet.key, language)}</span>
                  <span style={{ opacity: 0.6 }}>{influences[planet.key]}%</span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AstralLightReveal;
