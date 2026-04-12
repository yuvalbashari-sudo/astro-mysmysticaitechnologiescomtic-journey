import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo, useCallback } from "react";
import { PLANETS } from "@/components/NatalChartWheel";
import { useLanguage } from "@/i18n/LanguageContext";
import { getPlanetName } from "@/lib/astroLocale";
import type { NatalChartResult } from "@/lib/natalChart";
import astralFigureImg from "@/assets/astral-figure.png";
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
  [0, -3, 4, 1, -2, 4, 3, -2],
  [-4, 0, 0, -4, 4, -1, -2, 3],
  [-3, -2, 2, -4, 4, 0, -1, 2],
  [0, -4, -3, -1, 2, -3, 4, 1],
  [-2, -4, 3, -2, -1, 1, 4, -1],
  [2, -3, -4, 0, 0, -4, 3, 1],
  [-4, -2, 1, -4, 4, -2, -2, 2],
  [2, -4, -3, -2, 0, -3, 4, 0],
  [-2, -3, 3, -4, -1, -1, 4, 2],
  [0, -4, -4, -1, 2, -2, 4, 1],
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

/* ── Astral figure is now rendered as a high-fidelity AI-generated image ── */
/* The image is positioned within the same viewBox (0 0 110 175) */

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

  /* ── Personalized planetary color palette ── */
  const planetColors = useMemo(() => {
    const top5 = sortedPlanets.slice(0, 5);
    const weights = top5.map(p => influences[p.key] || 1);
    const totalW = weights.reduce((s, v) => s + v, 0);
    const normalized = weights.map(w => w / totalW);

    const colors = top5.map(p => PLANET_VIS[p.key]?.color || "#F5C842");
    const glows = top5.map(p => PLANET_VIS[p.key]?.glow || "#F5C84280");

    // Build CSS gradient stops weighted by influence
    const gradientStops = (() => {
      let pos = 0;
      return colors.map((c, i) => {
        const start = pos;
        pos += normalized[i] * 100;
        return `${c} ${Math.round(start)}%, ${c} ${Math.round(pos)}%`;
      }).join(", ");
    })();

    return {
      dominant: colors[0] || "#F5C842",
      secondary: colors[1] || "#D0D6E0",
      tertiary: colors[2] || "#7FD4A8",
      accent: colors[3] || "#7B8FE8",
      subtle: colors[4] || "#9060B8",
      weights: normalized,
      colors,
      glows,
      gradientStops,
    };
  }, [sortedPlanets, influences]);

  const dominantColor = planetColors.dominant;
  const secondaryColor = planetColors.secondary;

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

  /* ── Slow orbit rotation state ── */
  const [orbitAngle, setOrbitAngle] = useState(0);
  useEffect(() => {
    const speed = 0.15; // degrees per frame (~9°/sec → full rotation in ~40s)
    let raf: number;
    const tick = () => {
      setOrbitAngle((a) => (a + speed) % 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── Beam positions: elliptical orbit around figure ── */
  const beamPositions = useMemo(() => {
    const count = sortedPlanets.length;
    const rx = 110;
    const ry = 130;
    const jitters = [0.12, -0.08, 0.15, -0.05, 0.1, -0.13, 0.07, -0.11, 0.09, -0.06];
    const orbitRad = (orbitAngle * Math.PI) / 180;
    return sortedPlanets.map((planet, idx) => {
      const baseAngle = (idx / count) * Math.PI * 2 - Math.PI / 2;
      const jitter = jitters[idx % jitters.length];
      const angle = baseAngle + jitter + orbitRad;
      const x = FIG_CX + rx * Math.cos(angle);
      const y = FIG_CORE_Y + ry * Math.sin(angle);
      return { key: planet.key, symbol: planet.symbol, x, y };
    });
  }, [sortedPlanets, orbitAngle]);

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

            {/* Inner glow — radial from chest, uses top 3 planet colors */}
            <radialGradient id="fig-inner-glow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.06 + absorptionLevel * 0.12 + climaxLevel * 0.2} />
              <stop offset="30%" stopColor={planetColors.dominant} stopOpacity={0.04 + absorptionLevel * 0.08} />
              <stop offset="60%" stopColor={planetColors.secondary} stopOpacity={0.02 + absorptionLevel * 0.04} />
              <stop offset="100%" stopColor={planetColors.tertiary} stopOpacity={0} />
            </radialGradient>

            {/* Climax radial — personalized planetary blend */}
            <radialGradient id="climax-radial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.2 * climaxLevel} />
              <stop offset="15%" stopColor={planetColors.dominant} stopOpacity={0.6 * climaxLevel * (planetColors.weights[0] || 0.3) * 2.5} />
              <stop offset="35%" stopColor={planetColors.secondary} stopOpacity={0.4 * climaxLevel * (planetColors.weights[1] || 0.2) * 2} />
              <stop offset="55%" stopColor={planetColors.tertiary} stopOpacity={0.25 * climaxLevel * (planetColors.weights[2] || 0.15) * 2} />
              <stop offset="75%" stopColor={planetColors.accent} stopOpacity={0.1 * climaxLevel} />
              <stop offset="100%" stopColor={planetColors.subtle} stopOpacity={0} />
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

          {/* ─── Phase 1b: Curved beams flowing to figure chest ─── */}
          {beamPositions.map((bp, idx) => {
            const vis = PLANET_VIS[bp.key];
            if (!vis || idx >= beamsFired) return null;
            const inf = (influences[bp.key] || 5) / 100;

            // Compute Bézier control point — perpendicular offset for natural arc
            const midX = (bp.x + FIG_CX) / 2;
            const midY = (bp.y + FIG_CHEST_Y) / 2;
            const dx = FIG_CX - bp.x;
            const dy = FIG_CHEST_Y - bp.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            // Perpendicular direction, alternating sides
            const perpSign = idx % 2 === 0 ? 1 : -1;
            const perpMag = 25 + (idx % 3) * 10; // vary curvature
            const ctrlX = midX + (-dy / len) * perpMag * perpSign;
            const ctrlY = midY + (dx / len) * perpMag * perpSign;
            const pathD = `M ${bp.x} ${bp.y} Q ${ctrlX} ${ctrlY} ${FIG_CX} ${FIG_CHEST_Y}`;

            return (
              <g key={`beam-${bp.key}`}>
                <motion.path
                  d={pathD}
                  stroke={`url(#beam-g-${bp.key})`}
                  strokeWidth={2 + inf * 6}
                  strokeLinecap="round"
                  fill="none"
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

                {/* Traveling energy particle — follows curved path via offset keyframes */}
                <motion.circle
                  r={2 + inf * 2}
                  fill={vis.color}
                  filter="url(#const-glow)"
                  initial={{ cx: bp.x, cy: bp.y, opacity: 0 }}
                  animate={{
                    cx: [bp.x, ctrlX, FIG_CX],
                    cy: [bp.y, ctrlY, FIG_CHEST_Y],
                    opacity: [0, 1, 0.8, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.3,
                    ease: "easeIn",
                    cx: { times: [0, 0.5, 1] },
                    cy: { times: [0, 0.5, 1] },
                    opacity: { times: [0, 0.1, 0.8, 1] },
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
          

          {/* ─── Human figure — AI-generated astral image ─── */}
          <g
            transform={`translate(${figX}, ${figY}) scale(${figScale})`}
            style={{
              filter: `drop-shadow(0 0 ${4 + absorptionLevel * 8 + climaxLevel * 20}px ${dominantColor}${climaxLevel > 0.5 ? 'a0' : '50'}) drop-shadow(0 0 ${climaxLevel * 12}px ${secondaryColor}40)`,
            }}
          >
            <image
              href={astralFigureImg}
              x="0"
              y="0"
              width={FIG_VB_W}
              height={FIG_VB_H}
              opacity={0.15 + absorptionLevel * 0.55 + climaxLevel * 0.3}
              style={{ mixBlendMode: 'screen' }}
            />
            {/* Additional glow overlay during climax */}
            {climaxLevel > 0 && (
              <image
                href={astralFigureImg}
                x="0"
                y="0"
                width={FIG_VB_W}
                height={FIG_VB_H}
                opacity={climaxLevel * 0.4}
                style={{ mixBlendMode: 'screen', filter: `blur(${climaxLevel * 3}px) brightness(${1.5 + climaxLevel})` }}
              />
            )}
          </g>

          {/* ─── Phase 2: Absorption effects inside figure ─── */}
          {absorptionLevel > 0 && (
            <g>
              {/* Pulse rings from chest — each ring uses a different planet color */}
              {[0, 1, 2].map((ring) => {
                const ringColor = planetColors.colors[ring] || dominantColor;
                return (
                  <motion.circle
                    key={`pulse-${ring}`}
                    cx={FIG_CX} cy={FIG_CHEST_Y}
                    fill="none"
                    stroke={ringColor}
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
                );
              })}

              {/* Internal energy veins — anatomical meridians */}
              {/* Spine (central) — dominant planet color */}
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
              {/* Left/right spine parallels — secondary planet color */}
              {[-6, 6].map((offset, vi) => (
                <motion.line
                  key={`vein-${vi}`}
                  x1={FIG_CX + offset} y1={FIG_CORE_Y - 35}
                  x2={FIG_CX + offset} y2={FIG_CORE_Y + 70}
                  stroke={secondaryColor}
                  strokeWidth={0.6}
                  strokeOpacity={absorptionLevel * 0.3}
                  filter="url(#body-glow)"
                  animate={{ strokeOpacity: [absorptionLevel * 0.15, absorptionLevel * 0.35, absorptionLevel * 0.15] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: vi * 0.3 }}
                />
              ))}

              {/* Energy through arms and legs — tertiary planet color */}
              {[
                { x1: FIG_CX - 20, y1: FIG_CHEST_Y - 8, x2: FIG_CX - 40, y2: FIG_CHEST_Y + 38 },
                { x1: FIG_CX + 20, y1: FIG_CHEST_Y - 8, x2: FIG_CX + 40, y2: FIG_CHEST_Y + 38 },
                { x1: FIG_CX - 8, y1: FIG_CORE_Y + 55, x2: FIG_CX - 18, y2: FIG_CORE_Y + 120 },
                { x1: FIG_CX + 8, y1: FIG_CORE_Y + 55, x2: FIG_CX + 18, y2: FIG_CORE_Y + 120 },
                { x1: FIG_CX - 18, y1: FIG_CHEST_Y, x2: FIG_CX + 18, y2: FIG_CHEST_Y },
                { x1: FIG_CX - 12, y1: FIG_CORE_Y + 20, x2: FIG_CX + 12, y2: FIG_CORE_Y + 20 },
              ].map((line, li) => (
                <motion.line
                  key={`limb-${li}`}
                  {...line}
                  stroke={planetColors.colors[li % planetColors.colors.length] || secondaryColor}
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
              r={4 + absorptionLevel * 4}
              fill={dominantColor}
              opacity={absorptionLevel * 0.2}
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
              {/* Full-body elliptical glow — encompasses entire figure */}
              <motion.ellipse
                cx={FIG_CX}
                cy={FIG_CORE_Y + 40}
                fill="url(#climax-radial)"
                filter="url(#climax-mega)"
                animate={{
                  rx: [45 + climaxLevel * 20, 55 + climaxLevel * 30, 45 + climaxLevel * 20],
                  ry: [120 + climaxLevel * 40, 140 + climaxLevel * 55, 120 + climaxLevel * 40],
                  opacity: [climaxLevel * 0.15, climaxLevel * 0.3, climaxLevel * 0.15],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Blurred aura image — full-body silhouette glow */}
              <g transform={`translate(${figX}, ${figY}) scale(${figScale})`}>
                <image
                  href={astralFigureImg}
                  x="-3"
                  y="-4"
                  width={FIG_VB_W + 6}
                  height={FIG_VB_H + 8}
                  opacity={climaxLevel * 0.35}
                  style={{
                    mixBlendMode: 'screen',
                    filter: `blur(8px) brightness(${1.1 + climaxLevel * 0.4})`,
                  }}
                />
              </g>

              {/* Core circles removed — no more "sun" effect */}

              {/* Radiating energy lines — each ray colored by a different planet */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, ri) => {
                const rad = (angle - 90) * (Math.PI / 180);
                const innerR = 12;
                const outerR = 60 + climaxLevel * 50;
                const rayColor = planetColors.colors[ri % planetColors.colors.length] || dominantColor;
                return (
                  <motion.line
                    key={`ray-${angle}`}
                    x1={FIG_CX + Math.cos(rad) * innerR}
                    y1={FIG_CORE_Y + Math.sin(rad) * innerR}
                    x2={FIG_CX + Math.cos(rad) * outerR}
                    y2={FIG_CORE_Y + Math.sin(rad) * outerR}
                    stroke={rayColor}
                    strokeWidth={0.8}
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0.1 * climaxLevel, 0.4 * climaxLevel, 0.1 * climaxLevel],
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
          style={{ background: `linear-gradient(90deg, ${dominantColor}40, ${secondaryColor}90, ${planetColors.tertiary}60, ${dominantColor}40)` }}
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
