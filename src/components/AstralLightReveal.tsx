import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo, useCallback } from "react";
import { PLANETS } from "@/components/NatalChartWheel";
import { useLanguage } from "@/i18n/LanguageContext";
import { getPlanetName } from "@/lib/astroLocale";
import type { NatalChartResult } from "@/lib/natalChart";
import type { Language } from "@/i18n/types";

/* ═══════════════════════════════════════════════════════
   AstralLightReveal — Cinematic Astral Energy Animation
   ═══════════════════════════════════════════════════════
   Phase 1  (0–4s)     Constellation activation + beam descent
   Phase 2  (4–7s)     Energy absorption — figure illuminates
   Phase 3  (7–10s)    Final climax — powerful inner light, 2s hold
   Phase 4  (10s+)     onComplete fires → map emerges BELOW figure
   ═══════════════════════════════════════════════════════ */

interface Props {
  userName?: string;
  chartData: NatalChartResult;
  onComplete: () => void;
}

/* ── Planet visual config ── */
const PLANET_VIS: Record<string, { color: string; glow: string }> = {
  sun:     { color: "#F5C842", glow: "#F5C84280" },
  moon:    { color: "#D0D6E0", glow: "#D0D6E080" },
  mercury: { color: "#7FD4A8", glow: "#7FD4A880" },
  venus:   { color: "#F28DC7", glow: "#F28DC780" },
  mars:    { color: "#E05252", glow: "#E0525280" },
  jupiter: { color: "#7B8FE8", glow: "#7B8FE880" },
  saturn:  { color: "#C4A86C", glow: "#C4A86C80" },
  uranus:  { color: "#5FC8E8", glow: "#5FC8E880" },
  neptune: { color: "#6070E8", glow: "#6070E880" },
  pluto:   { color: "#9060B8", glow: "#9060B880" },
};

/* Mini constellation patterns */
const CONSTELLATION_STARS: number[][] = [
  [0, -4, 6, 2, -3, 5, 4, -2],
  [-5, 0, 0, -5, 5, -1, -2, 4],
  [-4, -3, 2, -5, 6, 0, -1, 3],
  [0, -6, -4, -1, 3, -4, 5, 2],
  [-3, -5, 4, -3, -1, 1, 6, -1],
  [2, -4, -5, 0, 0, -6, 4, 1],
  [-6, -2, 1, -5, 5, -3, -2, 2],
  [3, -6, -4, -2, 0, -4, 5, 0],
  [-3, -4, 4, -5, -1, -1, 6, 2],
  [0, -5, -5, -1, 3, -3, 5, 1],
];

const STATUS_TEXT: Record<Language, string[]> = {
  he: [
    "מזלות השמיים מתעוררים...",
    "קרני האור יורדות אליך...",
    "האנרגיה נספגת בתוכך...",
    "האור הפנימי מתעצם...",
    "החותם הקוסמי שלך נחשף...",
  ],
  en: [
    "Celestial constellations awakening...",
    "Light beams descending toward you...",
    "Energy is being absorbed within...",
    "Your inner light is intensifying...",
    "Your cosmic signature is revealed...",
  ],
  ru: [
    "Небесные созвездия пробуждаются...",
    "Лучи света нисходят к вам...",
    "Энергия поглощается внутри...",
    "Ваш внутренний свет усиливается...",
    "Ваша космическая подпись раскрывается...",
  ],
  ar: [
    "الأبراج السماوية تستيقظ...",
    "أشعة الضوء تنزل نحوك...",
    "الطاقة تُمتص في داخلك...",
    "نورك الداخلي يتكثف...",
    "بصمتك الكونية تتكشف...",
  ],
};

/* Influence weights */
function computeInfluences(chartData: NatalChartResult): Record<string, number> {
  const w: Record<string, number> = {};
  const base: Record<string, number> = {
    sun: 3, moon: 2.5, mercury: 1, venus: 1, mars: 1,
    jupiter: 1, saturn: 1, uranus: 0.8, neptune: 0.8, pluto: 0.8,
  };
  PLANETS.forEach((p) => { w[p.key] = base[p.key] || 1; });
  chartData.aspects.forEach((a) => {
    if (w[a.planet1Key] !== undefined) w[a.planet1Key] += 0.5;
    if (w[a.planet2Key] !== undefined) w[a.planet2Key] += 0.5;
  });
  chartData.planetPlacements.forEach((p) => {
    if ([1, 4, 7, 10].includes(p.house)) w[p.key] = (w[p.key] || 1) + 1;
  });
  const total = Object.values(w).reduce((s, v) => s + v, 0);
  Object.keys(w).forEach((k) => { w[k] = Math.round((w[k] / total) * 100); });
  return w;
}

/* ── Anatomically correct human figure — multi-part paths ── */
/* viewBox 0 0 110 175, centered at ~55, proportions: 7.5-head height */

// Head: smooth oval skull, no spike/crest
const HEAD = `M 55,6 C 61,6 66,11 66,18 C 66,25 62,30 58,32 L 52,32 C 48,30 44,25 44,18 C 44,11 49,6 55,6 Z`;

// Neck: tapered cylinder
const NECK = `M 50,32 L 50,38 C 50,40 52,41 55,41 C 58,41 60,40 60,38 L 60,32`;

// Torso: broad shoulders tapering to waist with natural lateral curves
const TORSO = `M 55,41 C 60,41 68,43 73,46 C 76,48 77,51 76,54 L 74,60 C 73,64 72,70 71,76 C 70,82 68,86 66,90 L 64,94 C 62,97 58,98 55,98 C 52,98 48,97 46,94 L 44,90 C 42,86 40,82 39,76 C 38,70 37,64 36,60 L 34,54 C 33,51 34,48 37,46 C 42,43 50,41 55,41 Z`;

// Left arm: natural curve with elbow bend, forearm, hand
const LEFT_ARM = `M 34,48 C 30,50 26,54 24,60 C 22,66 20,72 19,78 C 18,82 17,86 18,88 C 18,90 20,92 22,93 C 23,93 24,92 24,90 C 24,87 25,82 26,78 C 27,74 29,68 31,64 C 33,60 35,56 36,54`;

// Right arm: mirror of left
const RIGHT_ARM = `M 76,48 C 80,50 84,54 86,60 C 88,66 90,72 91,78 C 92,82 93,86 92,88 C 92,90 90,92 88,93 C 87,93 86,92 86,90 C 86,87 85,82 84,78 C 83,74 81,68 79,64 C 77,60 75,56 74,54`;

// Left leg: hip to knee to ankle to foot
const LEFT_LEG = `M 48,96 C 47,100 46,106 45,112 C 44,120 43,128 42,136 C 41,144 40,152 40,158 C 40,162 40,166 41,168 C 41,170 43,172 46,172 C 48,172 49,171 49,169 C 49,166 48,162 48,158 C 48,152 48,144 49,136 C 49,128 50,120 50,112 C 50,106 50,100 50,96`;

// Right leg: mirror of left
const RIGHT_LEG = `M 62,96 C 63,100 64,106 65,112 C 66,120 67,128 68,136 C 69,144 70,152 70,158 C 70,162 70,166 69,168 C 69,170 67,172 64,172 C 62,172 61,171 61,169 C 61,166 62,162 62,158 C 62,152 62,144 61,136 C 61,128 60,120 60,112 C 60,106 60,100 60,96`;

// All body parts for rendering
const BODY_PARTS = [
  { id: "head", d: HEAD },
  { id: "neck", d: NECK },
  { id: "torso", d: TORSO },
  { id: "left-arm", d: LEFT_ARM },
  { id: "right-arm", d: RIGHT_ARM },
  { id: "left-leg", d: LEFT_LEG },
  { id: "right-leg", d: RIGHT_LEG },
];

// Muscle contour hints (subtle anatomical detail lines)
const CONTOURS = [
  // Collar bones
  `M 44,44 C 48,42 52,42 55,42 C 58,42 62,42 66,44`,
  // Pectoral line
  `M 42,52 C 46,56 50,57 55,57 C 60,57 64,56 68,52`,
  // Abdominal midline
  `M 55,58 L 55,92`,
  // Hip line
  `M 44,92 C 48,95 52,96 55,96 C 58,96 62,95 66,92`,
  // Shoulder caps
  `M 34,48 C 36,44 40,42 44,43`,
  `M 76,48 C 74,44 70,42 66,43`,
  // Knee hints
  `M 44,134 C 46,136 48,136 49,134`,
  `M 66,134 C 64,136 62,136 61,134`,
];

/* figure SVG viewBox: 0 0 110 175 — figure centered at (55, 87) */
const FIG_VB_W = 110;
const FIG_VB_H = 175;

/* ── TIMING ── */
const CONSTELLATION_PHASE = 4000;
const ABSORPTION_PHASE = 7000;
const CLIMAX_START = 7000;
const CLIMAX_PEAK = 8000;
const CLIMAX_HOLD_END = 10000;
const TOTAL = 11000;

/* ── Scene dimensions ── */
const W = 320;
const H = 440;
const FIG_CX = W / 2;       // 160 — perfectly centered
const FIG_CHEST_Y = 255;    // where beams target (chest area in scene coords)
const FIG_CORE_Y = 240;     // energy core center

const AstralLightReveal = ({ userName, chartData, onComplete }: Props) => {
  console.log("NEW ASTRAL SCENE ACTIVE — anatomical multi-part figure");
  const { language } = useLanguage();

  const [constellationsLit, setConstellationsLit] = useState(0);
  const [beamsFired, setBeamsFired] = useState(0);
  const [absorptionLevel, setAbsorptionLevel] = useState(0);
  const [climaxLevel, setClimaxLevel] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showInfluences, setShowInfluences] = useState(false);

  const statusTexts = STATUS_TEXT[language] || STATUS_TEXT.en;
  console.log("NEW ASTRAL SCENE ACTIVE — anatomical multi-part figure");
  const influences = useMemo(() => computeInfluences(chartData), [chartData]);

  const sortedPlanets = useMemo(
    () => [...PLANETS].sort((a, b) => (influences[b.key] || 0) - (influences[a.key] || 0)),
    [influences],
  );
  const topInfluences = useMemo(() => sortedPlanets.slice(0, 5), [sortedPlanets]);

  const dominantColor = useMemo(() => {
    return PLANET_VIS[sortedPlanets[0]?.key]?.color || "#F5C842";
  }, [sortedPlanets]);

  const secondaryColor = useMemo(() => {
    return PLANET_VIS[sortedPlanets[1]?.key]?.color || "#D0D6E0";
  }, [sortedPlanets]);

  useEffect(() => {
    const progTimer = setInterval(() => setProgress((p) => Math.min(p + 1, 100)), TOTAL / 100);
    const statusInterval = TOTAL / statusTexts.length;
    const statusTimer = setInterval(() => setStatusIdx((s) => Math.min(s + 1, statusTexts.length - 1)), statusInterval);

    const constInterval = 1800 / PLANETS.length;
    const constTimer = setInterval(() => {
      setConstellationsLit((c) => { if (c >= PLANETS.length) { clearInterval(constTimer); return c; } return c + 1; });
    }, constInterval);

    const beamDelay = setTimeout(() => {
      const beamInterval = 1800 / PLANETS.length;
      const bTimer = setInterval(() => {
        setBeamsFired((b) => { if (b >= PLANETS.length) { clearInterval(bTimer); return b; } return b + 1; });
      }, beamInterval);
    }, 1800);

    const absStart = setTimeout(() => {
      const dur = ABSORPTION_PHASE - CONSTELLATION_PHASE;
      const steps = 40;
      let i = 0;
      const at = setInterval(() => {
        i++;
        setAbsorptionLevel(Math.min(i / steps, 1));
        if (i >= steps) clearInterval(at);
      }, dur / steps);
    }, CONSTELLATION_PHASE);

    const clxStart = setTimeout(() => {
      const rampDur = CLIMAX_PEAK - CLIMAX_START;
      const steps = 25;
      let i = 0;
      const ct = setInterval(() => {
        i++;
        setClimaxLevel(Math.min(i / steps, 1));
        if (i >= steps) clearInterval(ct);
      }, rampDur / steps);
    }, CLIMAX_START);

    const infTimer = setTimeout(() => setShowInfluences(true), CLIMAX_PEAK + 500);
    const doneTimer = setTimeout(onComplete, TOTAL);

    return () => {
      clearInterval(progTimer);
      clearInterval(constTimer);
      clearInterval(statusTimer);
      clearTimeout(beamDelay);
      clearTimeout(absStart);
      clearTimeout(clxStart);
      clearTimeout(infTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  /* ── Beam positions: spread across top, all aim at figure chest ── */
  const beamPositions = useMemo(() => {
    return sortedPlanets.map((planet, idx) => {
      const spread = W / (PLANETS.length + 1);
      const x = spread * (idx + 1);
      const y = 40;
      return { key: planet.key, symbol: planet.symbol, x, y };
    });
  }, [sortedPlanets]);

  /* ── Figure transform: place SVG centered at FIG_CX, lower-middle ── */
  const figScale = 1.7;
  const figW = FIG_VB_W * figScale;
  const figH = FIG_VB_H * figScale;
  const figX = FIG_CX - figW / 2;
  const figY = 175; // top of scaled figure in scene coords

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 relative overflow-hidden">
      {/* Deep space background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 30%, hsl(var(--deep-blue-light) / 0.15), transparent)",
      }} />

      {/* Floating star particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() > 0.7 ? 2 : 1,
              height: Math.random() > 0.7 ? 2 : 1,
              background: `hsl(var(--gold) / ${0.2 + Math.random() * 0.4})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
            transition={{ duration: 2 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 4 }}
          />
        ))}
      </div>

      {/* ═══ MAIN SVG SCENE ═══ */}
      <div className="relative w-full" style={{ maxWidth: 340, aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" className="absolute inset-0" overflow="visible">
          <defs>
            <filter id="beam-glow-strong">
              <feGaussianBlur stdDeviation="4" result="blur1" />
              <feGaussianBlur stdDeviation="8" in="SourceGraphic" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="const-glow">
              <feGaussianBlur stdDeviation="2" />
            </filter>

            <filter id="climax-mega">
              <feGaussianBlur stdDeviation="18" result="b1" />
              <feGaussianBlur stdDeviation="8" in="SourceGraphic" result="b2" />
              <feMerge>
                <feMergeNode in="b1" />
                <feMergeNode in="b2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="body-glow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="figure-drop-glow">
              <feGaussianBlur stdDeviation="3" />
            </filter>

            {/* Figure volume gradient */}
            <linearGradient id="sil-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={dominantColor} stopOpacity={0.08 + absorptionLevel * 0.25 + climaxLevel * 0.35} />
              <stop offset="35%" stopColor={dominantColor} stopOpacity={0.15 + absorptionLevel * 0.35 + climaxLevel * 0.45} />
              <stop offset="65%" stopColor={secondaryColor} stopOpacity={0.08 + absorptionLevel * 0.2 + climaxLevel * 0.3} />
              <stop offset="100%" stopColor={dominantColor} stopOpacity={0.02} />
            </linearGradient>

            {/* Depth shading — darker edges for 3D volume */}
            <linearGradient id="fig-depth" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={dominantColor} stopOpacity={0.15 + absorptionLevel * 0.15} />
              <stop offset="30%" stopColor={dominantColor} stopOpacity={0.02} />
              <stop offset="70%" stopColor={dominantColor} stopOpacity={0.02} />
              <stop offset="100%" stopColor={dominantColor} stopOpacity={0.15 + absorptionLevel * 0.15} />
            </linearGradient>

            {/* Inner glow — radial from chest */}
            <radialGradient id="fig-inner-glow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.06 + absorptionLevel * 0.12 + climaxLevel * 0.2} />
              <stop offset="50%" stopColor={dominantColor} stopOpacity={0.03 + absorptionLevel * 0.06} />
              <stop offset="100%" stopColor={dominantColor} stopOpacity={0} />
            </radialGradient>

            {/* Climax radial */}
            <radialGradient id="climax-radial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.3 * climaxLevel} />
              <stop offset="20%" stopColor={dominantColor} stopOpacity={0.7 * climaxLevel} />
              <stop offset="50%" stopColor={secondaryColor} stopOpacity={0.3 * climaxLevel} />
              <stop offset="100%" stopColor={dominantColor} stopOpacity={0} />
            </radialGradient>

            {/* Beam gradients — all target figure chest */}
            {beamPositions.map((bp, idx) => {
              const vis = PLANET_VIS[bp.key];
              if (!vis || idx >= beamsFired) return null;
              const inf = (influences[bp.key] || 5) / 100;
              return (
                <linearGradient key={`bg-${bp.key}`} id={`beam-g-${bp.key}`}
                  x1={bp.x} y1={bp.y} x2={FIG_CX} y2={FIG_CHEST_Y}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor={vis.color} stopOpacity={0.9 * inf + 0.3} />
                  <stop offset="50%" stopColor={vis.color} stopOpacity={0.5 * inf + 0.1} />
                  <stop offset="100%" stopColor={vis.color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>

          {/* ─── Phase 1: Constellation nodes ─── */}
          {beamPositions.map((bp, idx) => {
            const vis = PLANET_VIS[bp.key];
            if (!vis || idx >= constellationsLit) return null;
            const stars = CONSTELLATION_STARS[idx % CONSTELLATION_STARS.length];

            return (
              <g key={`const-${bp.key}`}>
                {stars.length >= 4 && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ duration: 0.8, delay: idx * 0.05 }}
                  >
                    {Array.from({ length: Math.floor(stars.length / 2) - 1 }).map((_, si) => (
                      <line
                        key={si}
                        x1={bp.x + stars[si * 2]}
                        y1={bp.y + stars[si * 2 + 1]}
                        x2={bp.x + stars[(si + 1) * 2]}
                        y2={bp.y + stars[(si + 1) * 2 + 1]}
                        stroke={vis.color}
                        strokeWidth="0.4"
                        strokeOpacity="0.5"
                      />
                    ))}
                  </motion.g>
                )}

                {Array.from({ length: Math.floor(stars.length / 2) }).map((_, si) => (
                  <motion.circle
                    key={`star-${si}`}
                    cx={bp.x + stars[si * 2]}
                    cy={bp.y + stars[si * 2 + 1]}
                    r={1}
                    fill={vis.color}
                    initial={{ opacity: 0, r: 0 }}
                    animate={{ opacity: [0, 1, 0.7], r: [0, 1.5, 1] }}
                    transition={{ duration: 0.6, delay: idx * 0.06 + si * 0.08 }}
                  />
                ))}

                <motion.circle
                  cx={bp.x} cy={bp.y}
                  r={6}
                  fill={vis.color}
                  filter="url(#const-glow)"
                  initial={{ opacity: 0, r: 2 }}
                  animate={{ opacity: [0, 0.9, 0.7], r: [2, 7, 5] }}
                  transition={{ duration: 0.8, delay: idx * 0.06 }}
                />
                <motion.text
                  x={bp.x} y={bp.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#fff"
                  fontSize={8}
                  fontWeight="bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.9] }}
                  transition={{ duration: 0.6, delay: idx * 0.06 + 0.2 }}
                >
                  {bp.symbol}
                </motion.text>
              </g>
            );
          })}

          {/* ─── Phase 1b: Beams descending to figure chest ─── */}
          {beamPositions.map((bp, idx) => {
            const vis = PLANET_VIS[bp.key];
            if (!vis || idx >= beamsFired) return null;
            const inf = (influences[bp.key] || 5) / 100;

            return (
              <g key={`beam-${bp.key}`}>
                <motion.line
                  x1={bp.x} y1={bp.y}
                  x2={FIG_CX} y2={FIG_CHEST_Y}
                  stroke={`url(#beam-g-${bp.key})`}
                  strokeWidth={2 + inf * 6}
                  strokeLinecap="round"
                  filter="url(#beam-glow-strong)"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{
                    opacity: [0, 0.9, 0.8, absorptionLevel > 0.5 ? 0.15 : 0.6],
                    pathLength: 1,
                  }}
                  transition={{
                    opacity: { duration: 3, times: [0, 0.15, 0.5, 1] },
                    pathLength: { duration: 1.2, ease: "easeOut" },
                  }}
                />

                {/* Traveling energy particle along beam */}
                <motion.circle
                  r={2 + inf * 2}
                  fill={vis.color}
                  filter="url(#const-glow)"
                  initial={{ cx: bp.x, cy: bp.y, opacity: 0 }}
                  animate={{
                    cx: [bp.x, FIG_CX],
                    cy: [bp.y, FIG_CHEST_Y],
                    opacity: [0, 1, 0.8, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.3,
                    ease: "easeIn",
                    times: [0, 0.1, 0.8, 1],
                  }}
                />

                {/* Impact flash at chest */}
                <motion.circle
                  cx={FIG_CX}
                  cy={FIG_CHEST_Y}
                  r={3}
                  fill={vis.color}
                  initial={{ opacity: 0, r: 2 }}
                  animate={{ opacity: [0, 0.6, 0], r: [2, 8, 3] }}
                  transition={{ duration: 0.8, delay: 1.6 }}
                />
              </g>
            );
          })}

          {/* ─── Human figure — anatomically correct, multi-part ─── */}
          <g
            transform={`translate(${figX}, ${figY}) scale(${figScale})`}
            style={{
              filter: `drop-shadow(0 0 ${4 + absorptionLevel * 8 + climaxLevel * 20}px ${dominantColor}${climaxLevel > 0.5 ? 'a0' : '50'})`,
            }}
          >
            {/* Base fill layer — all body parts */}
            {BODY_PARTS.map((part) => (
              <path
                key={`fill-${part.id}`}
                d={part.d}
                fill="url(#sil-fill)"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

            {/* Depth shading layer — 3D volume */}
            {BODY_PARTS.map((part) => (
              <path
                key={`depth-${part.id}`}
                d={part.d}
                fill="url(#fig-depth)"
                opacity={0.5 + absorptionLevel * 0.3}
              />
            ))}

            {/* Inner glow layer */}
            {BODY_PARTS.map((part) => (
              <path
                key={`glow-${part.id}`}
                d={part.d}
                fill="url(#fig-inner-glow)"
                opacity={absorptionLevel * 0.6 + climaxLevel * 0.4}
              />
            ))}

            {/* Outline stroke — all body parts */}
            {BODY_PARTS.map((part) => (
              <path
                key={`stroke-${part.id}`}
                d={part.d}
                fill="none"
                stroke={dominantColor}
                strokeWidth={0.4 + climaxLevel * 0.4}
                strokeOpacity={0.3 + absorptionLevel * 0.3 + climaxLevel * 0.4}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

            {/* White highlight outline for depth */}
            {BODY_PARTS.map((part) => (
              <path
                key={`highlight-${part.id}`}
                d={part.d}
                fill="none"
                stroke="#ffffff"
                strokeWidth={0.15}
                strokeOpacity={0.08 + absorptionLevel * 0.08 + climaxLevel * 0.12}
                strokeLinejoin="round"
              />
            ))}

            {/* Muscle contour hints */}
            {CONTOURS.map((d, i) => (
              <path
                key={`contour-${i}`}
                d={d}
                fill="none"
                stroke={dominantColor}
                strokeWidth={0.3}
                strokeOpacity={0.06 + absorptionLevel * 0.12 + climaxLevel * 0.1}
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* ─── Phase 2: Absorption effects inside figure ─── */}
          {absorptionLevel > 0 && (
            <g>
              {/* Pulse rings from chest */}
              {[0, 1, 2].map((ring) => (
                <motion.circle
                  key={`pulse-${ring}`}
                  cx={FIG_CX} cy={FIG_CHEST_Y}
                  fill="none"
                  stroke={dominantColor}
                  strokeWidth={0.8}
                  initial={{ r: 5, opacity: 0 }}
                  animate={{
                    r: [5, 35 + ring * 15, 50 + ring * 20],
                    opacity: [0.5 * absorptionLevel, 0.3 * absorptionLevel, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: ring * 0.6,
                    ease: "easeOut",
                  }}
                />
              ))}

              {/* Internal energy veins — anatomical meridians */}
              {/* Spine (central) */}
              <motion.line
                x1={FIG_CX} y1={FIG_CORE_Y - 45}
                x2={FIG_CX} y2={FIG_CORE_Y + 80}
                stroke={dominantColor}
                strokeWidth={1.2}
                strokeOpacity={absorptionLevel * 0.5}
                filter="url(#body-glow)"
                animate={{ strokeOpacity: [absorptionLevel * 0.25, absorptionLevel * 0.55, absorptionLevel * 0.25] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              {/* Left/right spine parallels */}
              {[-6, 6].map((offset, vi) => (
                <motion.line
                  key={`vein-${vi}`}
                  x1={FIG_CX + offset} y1={FIG_CORE_Y - 35}
                  x2={FIG_CX + offset} y2={FIG_CORE_Y + 70}
                  stroke={dominantColor}
                  strokeWidth={0.6}
                  strokeOpacity={absorptionLevel * 0.3}
                  filter="url(#body-glow)"
                  animate={{ strokeOpacity: [absorptionLevel * 0.15, absorptionLevel * 0.35, absorptionLevel * 0.15] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: vi * 0.3 }}
                />
              ))}

              {/* Energy through arms and legs — following anatomy */}
              {[
                // Left arm meridian (shoulder to hand)
                { x1: FIG_CX - 20, y1: FIG_CHEST_Y - 8, x2: FIG_CX - 40, y2: FIG_CHEST_Y + 38 },
                // Right arm meridian
                { x1: FIG_CX + 20, y1: FIG_CHEST_Y - 8, x2: FIG_CX + 40, y2: FIG_CHEST_Y + 38 },
                // Left leg meridian (hip to foot)
                { x1: FIG_CX - 8, y1: FIG_CORE_Y + 55, x2: FIG_CX - 18, y2: FIG_CORE_Y + 120 },
                // Right leg meridian
                { x1: FIG_CX + 8, y1: FIG_CORE_Y + 55, x2: FIG_CX + 18, y2: FIG_CORE_Y + 120 },
                // Cross-chest horizontal
                { x1: FIG_CX - 18, y1: FIG_CHEST_Y, x2: FIG_CX + 18, y2: FIG_CHEST_Y },
                // Solar plexus horizontal
                { x1: FIG_CX - 12, y1: FIG_CORE_Y + 20, x2: FIG_CX + 12, y2: FIG_CORE_Y + 20 },
              ].map((line, li) => (
                <motion.line
                  key={`limb-${li}`}
                  {...line}
                  stroke={secondaryColor}
                  strokeWidth={0.8}
                  strokeLinecap="round"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{
                    opacity: absorptionLevel * 0.35,
                    pathLength: absorptionLevel,
                  }}
                  transition={{ duration: 1.2, delay: li * 0.15 }}
                />
              ))}

              {/* Chakra points along spine */}
              {[
                { cy: FIG_CORE_Y - 42, color: "#9B59B6" }, // Crown
                { cy: FIG_CORE_Y - 30, color: "#5B6AB8" }, // Third eye
                { cy: FIG_CORE_Y - 15, color: "#3498DB" }, // Throat
                { cy: FIG_CORE_Y, color: "#2ECC71" },       // Heart
                { cy: FIG_CORE_Y + 18, color: "#F1C40F" },  // Solar plexus
                { cy: FIG_CORE_Y + 35, color: "#E67E22" },  // Sacral
                { cy: FIG_CORE_Y + 50, color: "#E74C3C" },  // Root
              ].map((chakra, ci) => (
                <motion.circle
                  key={`chakra-${ci}`}
                  cx={FIG_CX}
                  cy={chakra.cy}
                  r={2}
                  fill={chakra.color}
                  opacity={absorptionLevel * 0.4}
                  filter="url(#const-glow)"
                  animate={{
                    r: [1.5, 3, 1.5],
                    opacity: [absorptionLevel * 0.2, absorptionLevel * 0.5, absorptionLevel * 0.2],
                  }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: ci * 0.15 }}
                />
              ))}
            </g>
          )}

          {/* ─── Chest / heart glow ─── */}
          {absorptionLevel > 0.2 && (
            <motion.circle
              cx={FIG_CX} cy={FIG_CHEST_Y}
              r={4 + absorptionLevel * 6}
              fill={dominantColor}
              opacity={absorptionLevel * 0.4}
              filter="url(#body-glow)"
              animate={{
                r: [4 + absorptionLevel * 4, 4 + absorptionLevel * 8, 4 + absorptionLevel * 4],
                opacity: [absorptionLevel * 0.25, absorptionLevel * 0.5, absorptionLevel * 0.25],
              }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          )}

          {/* ─── Phase 3: CLIMAX — mega inner light ─── */}
          {climaxLevel > 0 && (
            <g>
              <motion.circle
                cx={FIG_CX} cy={FIG_CORE_Y}
                fill="url(#climax-radial)"
                filter="url(#climax-mega)"
                animate={{
                  r: [30 + climaxLevel * 30, 40 + climaxLevel * 50, 30 + climaxLevel * 40],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />

              <motion.circle
                cx={FIG_CX} cy={FIG_CORE_Y}
                r={6 + climaxLevel * 14}
                fill="#fff"
                opacity={0.15 + climaxLevel * 0.55}
                filter="url(#body-glow)"
                animate={climaxLevel > 0.7 ? {
                  r: [6 + climaxLevel * 12, 6 + climaxLevel * 18, 6 + climaxLevel * 12],
                  opacity: [0.4 + climaxLevel * 0.3, 0.6 + climaxLevel * 0.35, 0.4 + climaxLevel * 0.3],
                } : undefined}
                transition={{ duration: 1.8, repeat: Infinity }}
              />

              <motion.circle
                cx={FIG_CX} cy={FIG_CORE_Y}
                r={12 + climaxLevel * 10}
                fill="none"
                stroke={dominantColor}
                strokeWidth={2}
                strokeOpacity={climaxLevel * 0.8}
                filter="url(#const-glow)"
                animate={{
                  r: [12 + climaxLevel * 8, 18 + climaxLevel * 14, 12 + climaxLevel * 8],
                  strokeOpacity: [climaxLevel * 0.6, climaxLevel * 0.9, climaxLevel * 0.6],
                }}
                transition={{ duration: 2.2, repeat: Infinity }}
              />

              {/* Radiating energy lines from core */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                const rad = (angle - 90) * (Math.PI / 180);
                const innerR = 12;
                const outerR = 30 + climaxLevel * 25;
                return (
                  <motion.line
                    key={`ray-${angle}`}
                    x1={FIG_CX + Math.cos(rad) * innerR}
                    y1={FIG_CORE_Y + Math.sin(rad) * innerR}
                    x2={FIG_CX + Math.cos(rad) * outerR}
                    y2={FIG_CORE_Y + Math.sin(rad) * outerR}
                    stroke={dominantColor}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0.2 * climaxLevel, 0.7 * climaxLevel, 0.2 * climaxLevel],
                      x2: [
                        FIG_CX + Math.cos(rad) * (outerR - 8),
                        FIG_CX + Math.cos(rad) * (outerR + 5),
                        FIG_CX + Math.cos(rad) * (outerR - 8),
                      ],
                      y2: [
                        FIG_CORE_Y + Math.sin(rad) * (outerR - 8),
                        FIG_CORE_Y + Math.sin(rad) * (outerR + 5),
                        FIG_CORE_Y + Math.sin(rad) * (outerR - 8),
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: angle * 0.002 }}
                  />
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* ─── Text overlay ─── */}
      {userName && (
        <motion.p
          className="font-heading text-lg md:text-xl gold-gradient-text mt-3 mb-1 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {userName}
        </motion.p>
      )}

      <AnimatePresence mode="wait">
        <motion.p
          key={statusIdx}
          className="font-body text-sm md:text-base text-center max-w-sm"
          style={{ color: "hsl(var(--foreground) / 0.6)" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5 }}
        >
          {statusTexts[statusIdx]}
        </motion.p>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="w-48 h-0.5 mt-5 rounded-full overflow-hidden" style={{ background: "hsl(var(--gold) / 0.1)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${dominantColor}40, ${dominantColor}${climaxLevel > 0.5 ? 'ff' : '90'}, ${dominantColor}40)` }}
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Influence cards */}
      <AnimatePresence>
        {showInfluences && (
          <motion.div
            className="flex flex-wrap justify-center gap-2 mt-5 max-w-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {topInfluences.map((planet, i) => {
              const vis = PLANET_VIS[planet.key];
              return (
                <motion.div
                  key={planet.key}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body"
                  style={{
                    background: `${vis?.color || "#fff"}15`,
                    border: `1px solid ${vis?.color || "#fff"}35`,
                    color: vis?.color || "hsl(var(--foreground))",
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.12 }}
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
