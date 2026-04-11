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

/* ── Planet visual config ── */
const PLANET_RAYS: Record<string, { color: string; angle: number }> = {
  sun:     { color: "#E8B84B", angle: 18 },
  moon:    { color: "#C4C9D2", angle: 54 },
  mercury: { color: "#8BC4A9", angle: 90 },
  venus:   { color: "#E88BC4", angle: 126 },
  mars:    { color: "#C45B5B", angle: 162 },
  jupiter: { color: "#8B9FE8", angle: 198 },
  saturn:  { color: "#A89070", angle: 234 },
  uranus:  { color: "#70C8E8", angle: 270 },
  neptune: { color: "#7088E8", angle: 306 },
  pluto:   { color: "#9070A8", angle: 342 },
};

const STATUS_TEXT: Record<Language, string[]> = {
  he: [
    "קרני הכוכבים יורדות אליך...",
    "האור נספג לתוך הדמות שלך...",
    "האנרגיה האסטרלית מתעצמת...",
    "החותם הקוסמי שלך נחשף...",
  ],
  en: [
    "Stellar rays descending toward you...",
    "Light is being absorbed into your figure...",
    "Your astral energy is intensifying...",
    "Your cosmic signature is revealed...",
  ],
  ru: [
    "Звёздные лучи нисходят к вам...",
    "Свет поглощается вашей фигурой...",
    "Ваша астральная энергия усиливается...",
    "Ваша космическая подпись раскрывается...",
  ],
  ar: [
    "أشعة النجوم تنزل نحوك...",
    "يُمتص الضوء في صورتك...",
    "طاقتك النجمية تتكثف...",
    "بصمتك الكونية تتكشف...",
  ],
};

/* Influence weights from chart data */
function computeInfluences(chartData: NatalChartResult): Record<string, number> {
  const weights: Record<string, number> = {};
  const basePriority: Record<string, number> = {
    sun: 3, moon: 2.5, mercury: 1, venus: 1, mars: 1,
    jupiter: 1, saturn: 1, uranus: 0.8, neptune: 0.8, pluto: 0.8,
  };
  PLANETS.forEach((p) => { weights[p.key] = basePriority[p.key] || 1; });
  chartData.aspects.forEach((a) => {
    if (weights[a.planet1Key] !== undefined) weights[a.planet1Key] += 0.5;
    if (weights[a.planet2Key] !== undefined) weights[a.planet2Key] += 0.5;
  });
  chartData.planetPlacements.forEach((p) => {
    if ([1, 4, 7, 10].includes(p.house)) weights[p.key] = (weights[p.key] || 1) + 1;
  });
  const total = Object.values(weights).reduce((s, v) => s + v, 0);
  Object.keys(weights).forEach((k) => { weights[k] = Math.round((weights[k] / total) * 100); });
  return weights;
}

/* Human silhouette path */
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

/*
 * TIMING (ms)
 * Phase 1 – Beam descent:       0 → 3500
 * Phase 2 – Absorption + climax: 3500 → 7500 (climax peaks at ~5500, holds 2s)
 * Phase 3 – Hold complete:       7500 → 9000 (stable glow, influence cards)
 * onComplete fires at 9500
 */
const PHASE1_END = 3500;
const CLIMAX_PEAK = 5500;
const CLIMAX_HOLD_END = 7500;
const TOTAL_DURATION = 9000;

const AstralLightReveal = ({ userName, chartData, onComplete }: Props) => {
  const { language } = useLanguage();
  const [activePlanets, setActivePlanets] = useState(0);
  const [climaxIntensity, setClimaxIntensity] = useState(0); // 0→1
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showInfluences, setShowInfluences] = useState(false);

  const statusTexts = STATUS_TEXT[language] || STATUS_TEXT.en;
  const influences = useMemo(() => computeInfluences(chartData), [chartData]);

  const sortedPlanets = useMemo(
    () => [...PLANETS].sort((a, b) => (influences[b.key] || 0) - (influences[a.key] || 0)),
    [influences],
  );
  const topInfluences = useMemo(() => sortedPlanets.slice(0, 5), [sortedPlanets]);

  useEffect(() => {
    const planetInterval = PHASE1_END / PLANETS.length;

    // Progress bar
    const progTimer = setInterval(() => setProgress((p) => Math.min(p + 1, 100)), TOTAL_DURATION / 100);

    // Phase 1: beams appear one by one
    const planetTimer = setInterval(() => {
      setActivePlanets((p) => {
        if (p >= PLANETS.length) { clearInterval(planetTimer); return p; }
        return p + 1;
      });
    }, planetInterval);

    // Status text
    const statusInterval = TOTAL_DURATION / statusTexts.length;
    const statusTimer = setInterval(() => setStep((s) => Math.min(s + 1, statusTexts.length - 1)), statusInterval);

    // Phase 2: climax ramp from PHASE1_END to CLIMAX_PEAK
    const climaxStart = setTimeout(() => {
      const rampDuration = CLIMAX_PEAK - PHASE1_END;
      const steps = 30;
      const stepMs = rampDuration / steps;
      let i = 0;
      const rampTimer = setInterval(() => {
        i++;
        setClimaxIntensity(Math.min(i / steps, 1));
        if (i >= steps) clearInterval(rampTimer);
      }, stepMs);
    }, PHASE1_END);

    // Phase 3: show influence cards after climax hold
    const influenceTimer = setTimeout(() => setShowInfluences(true), CLIMAX_HOLD_END);

    // Fire onComplete after everything
    const completeTimer = setTimeout(onComplete, TOTAL_DURATION + 500);

    return () => {
      clearInterval(progTimer);
      clearInterval(planetTimer);
      clearInterval(statusTimer);
      clearTimeout(climaxStart);
      clearTimeout(influenceTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  // Dominant color from top influencer
  const dominantColor = useMemo(() => {
    if (activePlanets === 0) return "#E8B84B";
    const topKey = sortedPlanets[0]?.key;
    return PLANET_RAYS[topKey]?.color || "#E8B84B";
  }, [activePlanets, sortedPlanets]);

  // SVG dimensions: figure sits in the lower portion
  const SVG_W = 320;
  const SVG_H = 400;
  const FIGURE_CX = 160;
  const FIGURE_CY = 280; // lower center

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 relative overflow-hidden">
      {/* Background particles */}
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
            animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      {/* Main SVG scene */}
      <div className="relative w-full" style={{ maxWidth: 320, aspectRatio: `${SVG_W} / ${SVG_H}` }}>
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" height="100%" className="absolute inset-0">
          <defs>
            {/* Climax radial glow */}
            <radialGradient id="climax-glow" cx="50%" cy="70%" r="35%">
              <stop offset="0%" stopColor={dominantColor} stopOpacity={0.6 * climaxIntensity} />
              <stop offset="40%" stopColor={dominantColor} stopOpacity={0.3 * climaxIntensity} />
              <stop offset="100%" stopColor={dominantColor} stopOpacity={0} />
            </radialGradient>
            {/* Silhouette gradient */}
            <linearGradient id="silhouette-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={dominantColor} stopOpacity={0.15 + climaxIntensity * 0.4} />
              <stop offset="50%" stopColor={dominantColor} stopOpacity={0.25 + climaxIntensity * 0.5} />
              <stop offset="100%" stopColor={dominantColor} stopOpacity={0.05} />
            </linearGradient>
            {/* Beam gradients */}
            {sortedPlanets.map((planet, idx) => {
              const ray = PLANET_RAYS[planet.key];
              if (!ray || idx >= activePlanets) return null;
              const influence = (influences[planet.key] || 5) / 100;
              // Beams come from the top, spread horizontally
              const spreadX = FIGURE_CX + (idx - PLANETS.length / 2) * 28;
              return (
                <linearGradient
                  key={`beam-grad-${planet.key}`}
                  id={`beam-${planet.key}`}
                  x1={spreadX} y1="0"
                  x2={FIGURE_CX} y2={FIGURE_CY}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor={ray.color} stopOpacity={0.8 * influence + 0.15} />
                  <stop offset="70%" stopColor={ray.color} stopOpacity={0.3 * influence} />
                  <stop offset="100%" stopColor={ray.color} stopOpacity={0} />
                </linearGradient>
              );
            })}
            {/* Beam glow filters */}
            <filter id="beam-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="climax-blur">
              <feGaussianBlur stdDeviation="12" />
            </filter>
          </defs>

          {/* Phase 1: Beams descending from top */}
          {sortedPlanets.map((planet, idx) => {
            const ray = PLANET_RAYS[planet.key];
            if (!ray || idx >= activePlanets) return null;
            const influence = (influences[planet.key] || 5) / 100;
            const spreadX = FIGURE_CX + (idx - PLANETS.length / 2) * 28;
            return (
              <motion.line
                key={`beam-${planet.key}`}
                x1={spreadX} y1={0}
                x2={FIGURE_CX} y2={FIGURE_CY}
                stroke={`url(#beam-${planet.key})`}
                strokeWidth={2 + influence * 5}
                strokeLinecap="round"
                filter="url(#beam-glow)"
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: [0, 1, 1, 0.3], pathLength: 1 }}
                transition={{
                  opacity: { duration: 2, times: [0, 0.2, 0.7, 1], delay: idx * 0.08 },
                  pathLength: { duration: 1.5, delay: idx * 0.08, ease: "easeOut" },
                }}
              />
            );
          })}

          {/* Planet symbols at beam origins */}
          {sortedPlanets.map((planet, idx) => {
            const ray = PLANET_RAYS[planet.key];
            if (!ray || idx >= activePlanets) return null;
            const spreadX = FIGURE_CX + (idx - PLANETS.length / 2) * 28;
            return (
              <motion.text
                key={`sym-${planet.key}`}
                x={spreadX} y={18}
                textAnchor="middle"
                fill={ray.color}
                fontSize={11}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0.4] }}
                transition={{ duration: 2.5, times: [0, 0.15, 0.6, 1], delay: idx * 0.08 }}
              >
                {planet.symbol}
              </motion.text>
            );
          })}

          {/* Phase 2: Climax glow behind figure */}
          <motion.circle
            cx={FIGURE_CX} cy={FIGURE_CY - 20}
            r={60}
            fill="url(#climax-glow)"
            filter="url(#climax-blur)"
            initial={{ opacity: 0, r: 30 }}
            animate={{
              opacity: climaxIntensity,
              r: 40 + climaxIntensity * 50,
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Pulsing energy core inside figure */}
          <motion.circle
            cx={FIGURE_CX} cy={FIGURE_CY - 40}
            r={8 + climaxIntensity * 16}
            fill={dominantColor}
            opacity={0.1 + climaxIntensity * 0.5}
            animate={climaxIntensity > 0.8 ? {
              r: [8 + climaxIntensity * 14, 8 + climaxIntensity * 20, 8 + climaxIntensity * 14],
              opacity: [0.3 + climaxIntensity * 0.3, 0.5 + climaxIntensity * 0.4, 0.3 + climaxIntensity * 0.3],
            } : undefined}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          {/* Secondary shimmer rings during climax */}
          {climaxIntensity > 0.5 && (
            <>
              <motion.circle
                cx={FIGURE_CX} cy={FIGURE_CY - 30}
                r={30}
                fill="none"
                stroke={dominantColor}
                strokeWidth={0.5}
                strokeOpacity={0.3 * climaxIntensity}
                animate={{ r: [30, 55, 30], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.circle
                cx={FIGURE_CX} cy={FIGURE_CY - 30}
                r={50}
                fill="none"
                stroke={dominantColor}
                strokeWidth={0.3}
                strokeOpacity={0.15 * climaxIntensity}
                animate={{ r: [50, 75, 50], opacity: [0.15, 0.05, 0.15] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              />
            </>
          )}

          {/* Human silhouette (lower center) */}
          <g transform={`translate(${FIGURE_CX - 155}, ${FIGURE_CY - 215}) scale(1.95)`}>
            <path
              d={SILHOUETTE_PATH}
              fill="url(#silhouette-fill)"
              stroke={dominantColor}
              strokeWidth="0.5"
              strokeOpacity={0.3 + climaxIntensity * 0.5}
              style={{ filter: `drop-shadow(0 0 ${6 + climaxIntensity * 18}px ${dominantColor}50)` }}
            />
          </g>
        </svg>
      </div>

      {/* User name */}
      {userName && (
        <motion.p
          className="font-heading text-lg md:text-xl gold-gradient-text mt-4 mb-1 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {userName}
        </motion.p>
      )}

      {/* Status text */}
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
      <div className="w-48 h-0.5 mt-5 rounded-full overflow-hidden" style={{ background: "hsl(var(--gold) / 0.1)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${dominantColor}40, ${dominantColor}90, ${dominantColor}40)` }}
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Influence cards – appear during climax hold */}
      <AnimatePresence>
        {showInfluences && (
          <motion.div
            className="flex flex-wrap justify-center gap-2 mt-5 max-w-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
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
