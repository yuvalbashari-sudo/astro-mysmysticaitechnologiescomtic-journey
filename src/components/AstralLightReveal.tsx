import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { PLANETS } from "@/components/NatalChartWheel";
import { useLanguage } from "@/i18n/LanguageContext";
import { getPlanetName } from "@/lib/astroLocale";
import type { NatalChartResult } from "@/lib/natalChart";
import { getAuraResult, type AuraResult, type AuraFamily } from "@/lib/auraResultBank";
import {
  buildLocalizedTitle,
  getAuraSubtitle,
  getModifierName,
  getAuraName,
} from "@/lib/auraLocale";
import astralFigureImg from "@/assets/astral-figure.png";
import type { Language } from "@/i18n/types";
import { isAdminTestMode } from "@/lib/adminTestMode";
import AuraDebugPanel from "@/components/AuraDebugPanel";
import { AURA_VISUAL_MODE } from "@/lib/auraVisualMode";
import MinimalAuraEffect from "@/components/MinimalAuraEffect";

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
  onAuraResult?: (result: AuraResult) => void;
  fastMode?: boolean;
}

/* ── Planet visual config (used for constellation nodes & beams) ── */
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

/* ── Aura family → dominant visual color (drives the figure glow) ── */
const AURA_COLOR_MAP: Record<AuraFamily, { primary: string; glow: string }> = {
  solar_gold:        { primary: "#F5C842", glow: "#F5C84290" },
  moon_silver_blue:  { primary: "#A8C4D8", glow: "#A8C4D890" },
  healing_green:     { primary: "#5EC090", glow: "#5EC09090" },
  mystical_purple:   { primary: "#9B6FD0", glow: "#9B6FD090" },
  vital_red:         { primary: "#E05252", glow: "#E0525290" },
  venus_pink:        { primary: "#F28DC7", glow: "#F28DC790" },
  astral_turquoise:  { primary: "#3CC8C8", glow: "#3CC8C890" },
  deep_indigo:       { primary: "#4A5AB8", glow: "#4A5AB890" },
  expansive_orange:  { primary: "#E89040", glow: "#E8904090" },
  pure_white:        { primary: "#E0E0F0", glow: "#E0E0F090" },
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

/* Influence weights — balanced so different charts produce different dominant planets */
export function computeInfluences(chartData: NatalChartResult): Record<string, number> {
  const w: Record<string, number> = {};
  /* Base weights are intentionally close so aspects & houses can shift dominance */
  const base: Record<string, number> = {
    sun: 1.5, moon: 1.4, mercury: 1.2, venus: 1.2, mars: 1.2,
    jupiter: 1.1, saturn: 1.1, uranus: 1.0, neptune: 1.0, pluto: 1.0,
  };
  PLANETS.forEach((p) => { w[p.key] = base[p.key] || 1; });

  /* Aspects add significant weight — a heavily aspected planet rises fast */
  chartData.aspects.forEach((a) => {
    const aspectBoost = a.type === "conjunction" ? 1.2
      : a.type === "opposition" ? 0.9
      : a.type === "trine" ? 0.8
      : a.type === "square" ? 0.7
      : 0.5;
    if (w[a.planet1Key] !== undefined) w[a.planet1Key] += aspectBoost;
    if (w[a.planet2Key] !== undefined) w[a.planet2Key] += aspectBoost;
  });

  /* Angular houses (1, 4, 7, 10) give a strong boost */
  chartData.planetPlacements.forEach((p) => {
    if ([1, 10].includes(p.house)) w[p.key] = (w[p.key] || 1) + 1.5;
    else if ([4, 7].includes(p.house)) w[p.key] = (w[p.key] || 1) + 1.2;
    else if ([5, 9].includes(p.house)) w[p.key] = (w[p.key] || 1) + 0.6;
  });

  /* Sign rulership bonus — planet in its own sign gets a boost */
  const RULERSHIP: Record<string, string[]> = {
    sun: ["Leo"], moon: ["Cancer"], mercury: ["Gemini", "Virgo"],
    venus: ["Taurus", "Libra"], mars: ["Aries", "Scorpio"],
    jupiter: ["Sagittarius", "Pisces"], saturn: ["Capricorn", "Aquarius"],
    uranus: ["Aquarius"], neptune: ["Pisces"], pluto: ["Scorpio"],
  };
  chartData.planetPlacements.forEach((p) => {
    const rules = RULERSHIP[p.key];
    if (rules && rules.includes(p.sign)) {
      w[p.key] = (w[p.key] || 1) + 1.0;
    }
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

const AstralLightReveal = ({ userName, chartData, onComplete, onAuraResult, fastMode = false }: Props) => {
  console.log("NEW ASTRAL SCENE ACTIVE — anatomical multi-part figure", fastMode ? "(fast)" : "");
  const { language } = useLanguage();

  const [constellationsLit, setConstellationsLit] = useState(0);
  const [beamsFired, setBeamsFired] = useState(0);
  const [absorptionLevel, setAbsorptionLevel] = useState(0);
  const [climaxLevel, setClimaxLevel] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showInfluences, setShowInfluences] = useState(false);
  const [showConstellations, setShowConstellations] = useState(true);

  /* ── Admin forced preset state ── */
  const PRESET_KEY = "astrologai_admin_forced_preset";
  const PRESET_NAME_KEY = "astrologai_admin_forced_preset_name";
  const [forcedPreset, setForcedPreset] = useState<string | null>(() => sessionStorage.getItem(PRESET_KEY));
  const [forcedPresetName, setForcedPresetName] = useState<string | null>(() => sessionStorage.getItem(PRESET_NAME_KEY));

  const statusTexts = STATUS_TEXT[language] || STATUS_TEXT.en;

  /* ── Real influences from chart data ── */
  const realInfluences = useMemo(() => computeInfluences(chartData), [chartData]);

  /* ── Active influences: forced preset overrides real in admin mode ── */
  const isForced = isAdminTestMode() && forcedPreset !== null;
  const influences = useMemo(() => {
    if (isForced) {
      try { return JSON.parse(forcedPreset!) as Record<string, number>; }
      catch { return realInfluences; }
    }
    return realInfluences;
  }, [realInfluences, forcedPreset, isForced]);

  /* ── Compute structured aura result (deterministic, memo'd) ── */
  const auraResult = useMemo(() => getAuraResult(influences), [influences]);

  /* ── Ref to always hold the latest auraResult (avoids stale closures in timers) ── */
  const auraResultRef = useRef(auraResult);
  useEffect(() => { auraResultRef.current = auraResult; }, [auraResult]);

  /* ── Live sync: push updated result to parent whenever it changes post-reveal ── */
  useEffect(() => {
    if (showInfluences) {
      onAuraResult?.(auraResult);
    }
  }, [auraResult, showInfluences]);

  const sortedPlanets = useMemo(
    () => [...PLANETS].sort((a, b) => (influences[b.key] || 0) - (influences[a.key] || 0)),
    [influences],
  );
  const topInfluences = useMemo(() => sortedPlanets.slice(0, 5), [sortedPlanets]);

  /* ── Aura-driven color palette (single source of truth: auraResult) ── */
  const auraColors = useMemo(() => {
    const primary = AURA_COLOR_MAP[auraResult.primaryAura];
    const secondaryAura = auraResult.secondaryAuras[0];
    const tertiaryAura = auraResult.secondaryAuras[1];
    const secondary = secondaryAura ? AURA_COLOR_MAP[secondaryAura] : primary;
    const tertiary = tertiaryAura ? AURA_COLOR_MAP[tertiaryAura] : secondary;

    return {
      dominant: primary.primary,
      dominantGlow: primary.glow,
      secondary: secondary.primary,
      tertiary: tertiary.primary,
    };
  }, [auraResult]);

  /* ── Planet-based colors still used for constellation nodes & beams ── */
  const planetColors = useMemo(() => {
    const top5 = sortedPlanets.slice(0, 5);
    const weights = top5.map(p => influences[p.key] || 1);
    const totalW = weights.reduce((s, v) => s + v, 0);
    const normalized = weights.map(w => w / totalW);
    const colors = top5.map(p => PLANET_VIS[p.key]?.color || "#F5C842");

    return { weights: normalized, colors };
  }, [sortedPlanets, influences]);

  const dominantColor = auraColors.dominant;
  const secondaryColor = auraColors.secondary;

  /** Whether the full astral figure + heavy SVG scene should render */
  const renderFullScene = AURA_VISUAL_MODE === "full";

  useEffect(() => {
    const S = fastMode ? 0.45 : 1; // speed multiplier
    const T = TOTAL * S;
    const CP = CONSTELLATION_PHASE * S;
    const AP = ABSORPTION_PHASE * S;
    const CS = CLIMAX_START * S;
    const CPK = CLIMAX_PEAK * S;

    const progTimer = setInterval(() => setProgress((p) => Math.min(p + 1, 100)), T / 100);
    const statusInterval = T / statusTexts.length;
    const statusTimer = setInterval(() => setStatusIdx((s) => Math.min(s + 1, statusTexts.length - 1)), statusInterval);

    const constInterval = (1800 * S) / PLANETS.length;
    const constTimer = setInterval(() => {
      setConstellationsLit((c) => { if (c >= PLANETS.length) { clearInterval(constTimer); return c; } return c + 1; });
    }, constInterval);

    const beamDelay = setTimeout(() => {
      const beamInterval = (1800 * S) / PLANETS.length;
      const bTimer = setInterval(() => {
        setBeamsFired((b) => { if (b >= PLANETS.length) { clearInterval(bTimer); return b; } return b + 1; });
      }, beamInterval);
    }, 1800 * S);

    const absStart = setTimeout(() => {
      const dur = AP - CP;
      const steps = 40;
      let i = 0;
      const at = setInterval(() => {
        i++;
        setAbsorptionLevel(Math.min(i / steps, 1));
        if (i >= steps) clearInterval(at);
      }, dur / steps);
    }, CP);

    const clxStart = setTimeout(() => {
      const rampDur = CPK - CS;
      const steps = 25;
      let i = 0;
      const ct = setInterval(() => {
        i++;
        setClimaxLevel(Math.min(i / steps, 1));
        if (i >= steps) clearInterval(ct);
      }, rampDur / steps);
    }, CS);

    const infTimer = setTimeout(() => setShowInfluences(true), CPK + 500 * S);
    const doneTimer = setTimeout(() => {
      onAuraResult?.(auraResultRef.current);
      onComplete();
    }, T);
    const constFadeTimer = setTimeout(() => setShowConstellations(false), 10000 * S);

    return () => {
      clearInterval(progTimer);
      clearInterval(constTimer);
      clearInterval(statusTimer);
      clearTimeout(beamDelay);
      clearTimeout(absStart);
      clearTimeout(clxStart);
      clearTimeout(infTimer);
      clearTimeout(doneTimer);
      clearTimeout(constFadeTimer);
    };
  }, []);

  /* ── Beam positions: elliptical orbit around figure (only needed in full mode) ── */
  const beamPositions = useMemo(() => {
    if (!renderFullScene) return [];
    const count = sortedPlanets.length;
    const rx = 110;
    const ry = 130;
    const jitters = [0.12, -0.08, 0.15, -0.05, 0.1, -0.13, 0.07, -0.11, 0.09, -0.06];
    return sortedPlanets.map((planet, idx) => {
      const baseAngle = (idx / count) * Math.PI * 2 - Math.PI / 2;
      const jitter = jitters[idx % jitters.length];
      const angle = baseAngle + jitter;
      const x = FIG_CX + rx * Math.cos(angle);
      const y = FIG_CORE_Y + ry * Math.sin(angle);
      return { key: planet.key, symbol: planet.symbol, x, y };
    });
  }, [sortedPlanets, renderFullScene]);

  /* ── Figure transform (only needed in full mode) ── */
  const figScale = 1.7;
  const figW = FIG_VB_W * figScale;
  const figH = FIG_VB_H * figScale;
  const figX = FIG_CX - figW / 2;
  const figY = 175;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 relative overflow-hidden">
      {/* ═══ MINIMAL MODE: lightweight aura glow ═══ */}
      {!renderFullScene && AURA_VISUAL_MODE !== "off" && (
        <MinimalAuraEffect
          primaryAura={auraResult.primaryAura}
          secondaryAuras={auraResult.secondaryAuras}
          modifier={auraResult.modifier}
          intensity={Math.max(absorptionLevel, climaxLevel, 0.5)}
        />
      )}

      {/* ═══ FULL MODE: Complete astral figure SVG scene ═══ */}
      {renderFullScene && (
      <>
      {/* Deep space background with aura-tinted glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${dominantColor}18, ${dominantColor}08 40%, transparent 70%)`,
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

            {/* Soft edge glow — no hard outlines, just a gentle luminous fringe */}
            <filter id="soft-edge-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" in="SourceAlpha" result="soft-spread" />
              <feFlood floodColor={dominantColor} floodOpacity={0.25 + absorptionLevel * 0.2} result="edge-color" />
              <feComposite in="edge-color" in2="soft-spread" operator="in" result="soft-colored-edge" />
              <feComposite in="soft-colored-edge" in2="SourceAlpha" operator="out" result="fringe-only" />
              <feGaussianBlur stdDeviation="5" in="SourceAlpha" result="wide-spread" />
              <feFlood floodColor={dominantColor} floodOpacity={0.1 + absorptionLevel * 0.08} result="wide-color" />
              <feComposite in="wide-color" in2="wide-spread" operator="in" result="wide-fringe" />
              <feComposite in="wide-fringe" in2="SourceAlpha" operator="out" result="wide-fringe-only" />
              <feMerge>
                <feMergeNode in="wide-fringe-only" />
                <feMergeNode in="fringe-only" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="outer-aura-blur">
              <feGaussianBlur stdDeviation="14" />
            </filter>

            <linearGradient id="sil-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={dominantColor} stopOpacity={0.03 + absorptionLevel * 0.08} />
              <stop offset="25%" stopColor={dominantColor} stopOpacity={0.06 + absorptionLevel * 0.12 + climaxLevel * 0.1} />
              <stop offset="50%" stopColor={dominantColor} stopOpacity={0.08 + absorptionLevel * 0.15 + climaxLevel * 0.12} />
              <stop offset="75%" stopColor={secondaryColor} stopOpacity={0.04 + absorptionLevel * 0.1 + climaxLevel * 0.08} />
              <stop offset="100%" stopColor={dominantColor} stopOpacity={0.02 + absorptionLevel * 0.05} />
            </linearGradient>

            <linearGradient id="fig-depth" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={dominantColor} stopOpacity={0.12 + absorptionLevel * 0.12} />
              <stop offset="25%" stopColor={dominantColor} stopOpacity={0.03} />
              <stop offset="75%" stopColor={dominantColor} stopOpacity={0.03} />
              <stop offset="100%" stopColor={dominantColor} stopOpacity={0.12 + absorptionLevel * 0.12} />
            </linearGradient>

            <radialGradient id="fig-core-glow" cx="50%" cy="38%" r="30%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.04 + absorptionLevel * 0.08 + climaxLevel * 0.12} />
              <stop offset="20%" stopColor={dominantColor} stopOpacity={0.08 + absorptionLevel * 0.15 + climaxLevel * 0.18} />
              <stop offset="50%" stopColor={dominantColor} stopOpacity={0.03 + absorptionLevel * 0.06} />
              <stop offset="100%" stopColor={dominantColor} stopOpacity={0} />
            </radialGradient>

            <radialGradient id="fig-inner-glow" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor={auraColors.dominant} stopOpacity={0.02 + absorptionLevel * 0.06} />
              <stop offset="40%" stopColor={auraColors.secondary} stopOpacity={0.01 + absorptionLevel * 0.03} />
              <stop offset="100%" stopColor={auraColors.tertiary} stopOpacity={0} />
            </radialGradient>

            <radialGradient id="climax-radial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.12 * climaxLevel} />
              <stop offset="10%" stopColor={auraColors.dominant} stopOpacity={0.45 * climaxLevel} />
              <stop offset="30%" stopColor={auraColors.dominant} stopOpacity={0.3 * climaxLevel} />
              <stop offset="55%" stopColor={auraColors.secondary} stopOpacity={0.15 * climaxLevel} />
              <stop offset="80%" stopColor={auraColors.tertiary} stopOpacity={0.06 * climaxLevel} />
              <stop offset="100%" stopColor={auraColors.dominant} stopOpacity={0} />
            </radialGradient>

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


          {/* ─── Layer 3: Outer aura ─── */}
          <g transform={`translate(${figX}, ${figY}) scale(${figScale})`} filter="url(#outer-aura-blur)">
            <image
              href={astralFigureImg}
              x="-8"
              y="-8"
              width={FIG_VB_W + 16}
              height={FIG_VB_H + 16}
              opacity={absorptionLevel * 0.2 + climaxLevel * 0.15}
              style={{ mixBlendMode: 'screen' }}
            />
          </g>

          {/* ─── Halo ellipse ─── */}
          <ellipse
            cx={FIG_CX}
            cy={FIG_CORE_Y + 40}
            rx={75 + absorptionLevel * 12 + climaxLevel * 8}
            ry={110 + absorptionLevel * 15 + climaxLevel * 10}
            fill="url(#climax-radial)"
            opacity={absorptionLevel * 0.35 + climaxLevel * 0.2}
          />

          {/* ─── Layer 2: Body fill ─── */}
          <g transform={`translate(${figX}, ${figY}) scale(${figScale})`}>
            <image
              href={astralFigureImg}
              x="0"
              y="0"
              width={FIG_VB_W}
              height={FIG_VB_H}
              opacity={absorptionLevel * 0.25 + climaxLevel * 0.15}
              style={{ mixBlendMode: 'screen', filter: `blur(3px) brightness(${1.1 + absorptionLevel * 0.3})` }}
            />
          </g>

          {/* ─── Layer 1: Core figure ─── */}
          <g
            transform={`translate(${figX}, ${figY}) scale(${figScale})`}
            style={{
              filter: `drop-shadow(0 0 ${2 + absorptionLevel * 4 + climaxLevel * 6}px ${dominantColor}${climaxLevel > 0.5 ? '80' : '50'}) drop-shadow(0 0 ${1 + climaxLevel * 3}px ${secondaryColor}30)`,
            }}
          >
            {absorptionLevel > 0.2 && (
              <motion.g
                filter="url(#soft-edge-glow)"
                animate={{ opacity: [0.35, 0.7, 0.35] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <image
                  href={astralFigureImg}
                  x="-2" y="-2"
                  width={FIG_VB_W + 4} height={FIG_VB_H + 4}
                  opacity={absorptionLevel * 0.3 + climaxLevel * 0.2}
                  style={{ mixBlendMode: 'screen' }}
                />
              </motion.g>
            )}

            <g filter="url(#soft-edge-glow)">
              <image
                href={astralFigureImg}
                x="0"
                y="0"
                width={FIG_VB_W}
                height={FIG_VB_H}
                opacity={0.28 + absorptionLevel * 0.32 + climaxLevel * 0.2}
                style={{ mixBlendMode: 'screen' }}
              />
            </g>

            <rect
              x="0" y="0" width={FIG_VB_W} height={FIG_VB_H}
              fill="url(#fig-core-glow)"
              opacity={absorptionLevel * 0.6 + climaxLevel * 0.4}
              style={{ mixBlendMode: 'screen' }}
            />

            <rect
              x="0" y="0" width={FIG_VB_W} height={FIG_VB_H}
              fill="url(#fig-depth)"
              opacity={absorptionLevel * 0.4}
              style={{ mixBlendMode: 'screen' }}
            />

          </g>

          {/* ─── Phase 1: Constellation nodes + beams ─── */}
          <AnimatePresence>
          {showConstellations && (
          <motion.g
            key="constellation-orbit"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: `${FIG_CX}px ${FIG_CORE_Y}px` }}
          >
            {beamPositions.map((bp, idx) => {
              const vis = PLANET_VIS[bp.key];
              if (!vis) return null;
              const stars = CONSTELLATION_STARS[idx % CONSTELLATION_STARS.length];
              const inf = (influences[bp.key] || 5) / 100;

              const midX = (bp.x + FIG_CX) / 2;
              const midY = (bp.y + FIG_CHEST_Y) / 2;
              const dx = FIG_CX - bp.x;
              const dy = FIG_CHEST_Y - bp.y;
              const len = Math.sqrt(dx * dx + dy * dy) || 1;
              const perpSign = idx % 2 === 0 ? 1 : -1;
              const perpMag = 25 + (idx % 3) * 10;
              const ctrlX = midX + (-dy / len) * perpMag * perpSign;
              const ctrlY = midY + (dx / len) * perpMag * perpSign;
              const pathD = `M ${bp.x} ${bp.y} Q ${ctrlX} ${ctrlY} ${FIG_CX} ${FIG_CHEST_Y}`;

              return (
                <g key={`const-beam-${bp.key}`}>
                  {idx < constellationsLit && (
                    <>
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
                          r={2}
                          fill={vis.color}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 1, 0.7] }}
                          transition={{ duration: 0.6, delay: idx * 0.06 + si * 0.08 }}
                        />
                      ))}

                      <motion.circle
                        cx={bp.x} cy={bp.y}
                        r={12}
                        fill={vis.color}
                        filter="url(#const-glow)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.9, 0.7] }}
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
                    </>
                  )}

                  {idx < beamsFired && (
                    <>
                      <motion.path
                        d={pathD}
                        stroke={`url(#beam-g-${bp.key})`}
                        strokeWidth={4 + inf * 10}
                        strokeLinecap="round"
                        fill="none"
                        filter="url(#beam-glow-strong)"
                        initial={{ opacity: 0, pathLength: 0 }}
                        animate={{
                          opacity: [0, 1, 0.95, absorptionLevel > 0.5 ? 0.3 : 0.8],
                          pathLength: 1,
                        }}
                        transition={{
                          opacity: { duration: 3, times: [0, 0.15, 0.5, 1] },
                          pathLength: { duration: 1.2, ease: "easeOut" },
                        }}
                      />

                      <motion.circle
                        r={4 + inf * 4}
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

                      <motion.circle
                        cx={FIG_CX}
                        cy={FIG_CHEST_Y}
                        r={5}
                        fill={vis.color}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.8, 0] }}
                        transition={{ duration: 0.8, delay: 1.6 }}
                      />
                    </>
                  )}
                </g>
              );
            })}
          </motion.g>
          )}
          </AnimatePresence>


          {/* ─── Phase 3: CLIMAX ─── */}
          {climaxLevel > 0 && (
            <motion.g
              animate={!showConstellations ? { opacity: [1, 0.7, 1] } : undefined}
              transition={!showConstellations ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" } : undefined}
            >
              <motion.ellipse
                cx={FIG_CX}
                cy={FIG_CORE_Y + 30}
                fill="none"
                stroke={dominantColor}
                strokeWidth={0.5}
                animate={{
                  rx: [80 + climaxLevel * 30, 100 + climaxLevel * 40, 80 + climaxLevel * 30],
                  ry: [140 + climaxLevel * 40, 170 + climaxLevel * 55, 140 + climaxLevel * 40],
                  opacity: [climaxLevel * 0.06, climaxLevel * 0.15, climaxLevel * 0.06],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              <motion.ellipse
                cx={FIG_CX}
                cy={FIG_CORE_Y + 35}
                fill="none"
                stroke={dominantColor}
                strokeWidth={0.8}
                animate={{
                  rx: [60 + climaxLevel * 20, 75 + climaxLevel * 30, 60 + climaxLevel * 20],
                  ry: [110 + climaxLevel * 30, 130 + climaxLevel * 40, 110 + climaxLevel * 30],
                  opacity: [climaxLevel * 0.08, climaxLevel * 0.2, climaxLevel * 0.08],
                }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />

              <motion.ellipse
                cx={FIG_CX}
                cy={FIG_CORE_Y + 40}
                fill="url(#climax-radial)"
                filter="url(#climax-mega)"
                animate={{
                  rx: [55 + climaxLevel * 25, 70 + climaxLevel * 35, 55 + climaxLevel * 25],
                  ry: [130 + climaxLevel * 40, 155 + climaxLevel * 55, 130 + climaxLevel * 40],
                  opacity: [climaxLevel * 0.25, climaxLevel * 0.5, climaxLevel * 0.25],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />

              <motion.ellipse
                cx={FIG_CX}
                cy={FIG_CORE_Y + 50}
                fill={secondaryColor}
                filter="url(#climax-mega)"
                animate={{
                  rx: [40 + climaxLevel * 15, 55 + climaxLevel * 22, 40 + climaxLevel * 15],
                  ry: [90 + climaxLevel * 25, 110 + climaxLevel * 35, 90 + climaxLevel * 25],
                  opacity: [climaxLevel * 0.06, climaxLevel * 0.12, climaxLevel * 0.06],
                }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              />

              <g transform={`translate(${figX}, ${figY}) scale(${figScale})`}>
                <image
                  href={astralFigureImg}
                  x="-6"
                  y="-6"
                  width={FIG_VB_W + 12}
                  height={FIG_VB_H + 12}
                  opacity={climaxLevel * 0.4}
                  style={{
                    mixBlendMode: 'screen',
                    filter: `blur(10px) brightness(${1.2 + climaxLevel * 0.4})`,
                  }}
                />
              </g>

              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const rr = 50 + (i % 3) * 20;
                const px = FIG_CX + rr * Math.cos(angle);
                const py = FIG_CORE_Y + rr * 0.7 * Math.sin(angle);
                return (
                  <motion.circle
                    key={`ep-${i}`}
                    cx={px}
                    cy={py}
                    r={1 + (i % 2)}
                    fill={i % 3 === 0 ? secondaryColor : dominantColor}
                    animate={{
                      opacity: [0, climaxLevel * 0.6, 0],
                      cy: [py, py - 8 - i * 2, py],
                    }}
                    transition={{
                      duration: 2.5 + i * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.4,
                    }}
                  />
                );
              })}
            </motion.g>
          )}
        </svg>
      </div>
      </>
      )}

      {/* ─── CINEMATIC IDENTITY REVEAL PANEL ─── */}
      <motion.div
        className="relative w-full flex flex-col items-center mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {/* Premium glass panel behind identity text */}
        {statusIdx === statusTexts.length - 1 && auraResult ? (
          <motion.div
            className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Glass backdrop */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(180deg, hsl(222 47% 4% / 0.75) 0%, hsl(222 47% 6% / 0.65) 100%)`,
                backdropFilter: "blur(20px)",
                border: `1px solid ${dominantColor}18`,
                borderRadius: "1rem",
                boxShadow: `0 0 40px ${dominantColor}15, inset 0 1px 0 ${dominantColor}10`,
              }}
            />
            {/* Aura glow behind panel */}
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: `radial-gradient(ellipse 70% 50% at 50% 30%, ${dominantColor}18, transparent 70%)`,
              }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative px-5 py-6 flex flex-col items-center gap-3">
              {/* User name */}
              {userName && (
                <motion.p
                  className="font-body text-xs tracking-widest uppercase"
                  style={{ color: `${dominantColor}70` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {userName}
                </motion.p>
              )}

              {/* MAIN IDENTITY — locale-aware title */}
              <motion.h2
                className="font-heading text-2xl md:text-3xl text-center tracking-wide leading-tight"
                style={{
                  color: dominantColor,
                  textShadow: `0 0 30px ${dominantColor}50, 0 0 60px ${dominantColor}25, 0 2px 4px rgba(0,0,0,0.5)`,
                }}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {buildLocalizedTitle(language, auraResult.primaryAura, auraResult.modifier)}
              </motion.h2>

              {/* Emotional subtitle in user's language */}
              <motion.p
                className="font-body text-sm text-center italic max-w-[280px]"
                style={{ color: `${dominantColor}AA`, lineHeight: 1.7 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                {getAuraSubtitle(language, auraResult.primaryAura)}
              </motion.p>

              {/* Glowing divider */}
              <div
                className="mx-auto"
                style={{
                  width: "40%",
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${dominantColor}40, transparent)`,
                  boxShadow: `0 0 6px ${dominantColor}20`,
                }}
              />

              {/* Top 3 planetary influences — premium pills */}
              <motion.div
                className="flex flex-wrap justify-center gap-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
              >
                {topInfluences.slice(0, 3).map((planet, i) => {
                  const pv = PLANET_VIS[planet.key];
                  return (
                    <div
                      key={planet.key}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs"
                      style={{
                        background: `${pv?.color || "#fff"}12`,
                        border: `1px solid ${pv?.color || "#fff"}25`,
                        color: pv?.color || "hsl(var(--foreground))",
                      }}
                    >
                      <span style={{ fontSize: 13 }}>{planet.symbol}</span>
                      <span>{getPlanetName(planet.key, language)}</span>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* During loading — show status text + progress as before */
          <>
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
                style={{ background: `linear-gradient(90deg, ${dominantColor}40, ${secondaryColor}90, ${auraColors.tertiary}60, ${dominantColor}40)` }}
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </>
        )}
      </motion.div>

      {/* ── Admin Debug Panel ── */}
      {isAdminTestMode() && createPortal(
          <AuraDebugPanel
            realInfluences={realInfluences}
            activeInfluences={influences}
            auraResult={auraResult}
            language={language}
            isForced={isForced}
            presetName={forcedPresetName}
            onPresetChange={(name, map) => {
              const json = JSON.stringify(map);
              sessionStorage.setItem(PRESET_KEY, json);
              sessionStorage.setItem(PRESET_NAME_KEY, name);
              setForcedPreset(json);
              setForcedPresetName(name);
            }}
            onPresetClear={() => {
              sessionStorage.removeItem(PRESET_KEY);
              sessionStorage.removeItem(PRESET_NAME_KEY);
              setForcedPreset(null);
              setForcedPresetName(null);
            }}
            onRestoreReal={() => {
              sessionStorage.removeItem(PRESET_KEY);
              sessionStorage.removeItem(PRESET_NAME_KEY);
              setForcedPreset(null);
              setForcedPresetName(null);
              localStorage.removeItem("astrologai_birthchart_cache");
            }}
          />,
          document.body
      )}
    </div>
  );
};

export default AstralLightReveal;
