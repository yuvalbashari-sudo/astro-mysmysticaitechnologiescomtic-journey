import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { PLANETS } from "@/components/NatalChartWheel";
import { useLanguage } from "@/i18n/LanguageContext";
import { getPlanetName } from "@/lib/astroLocale";
import type { NatalChartResult } from "@/lib/natalChart";
import type { Language } from "@/i18n/types";

/* ═══════════════════════════════════════════════════════════
   FullChartAstralTransformation — v2 ENHANCED ANATOMY
   ═══════════════════════════════════════════════════════════ */

console.log("NEW ASTRAL SCENE ACTIVE — FullChartAstralTransformation loaded");

interface Props {
  userName?: string;
  chartData: NatalChartResult;
  onComplete: () => void;
}

const P_COLOR: Record<string, string> = {
  sun: "#F5C842", moon: "#D0D6E0", mercury: "#7FD4A8", venus: "#F28DC7",
  mars: "#E05252", jupiter: "#7B8FE8", saturn: "#C4A86C", uranus: "#5FC8E8",
  neptune: "#6070E8", pluto: "#9060B8",
};

function computeInfluences(cd: NatalChartResult): Record<string, number> {
  const w: Record<string, number> = {};
  const base: Record<string, number> = {
    sun: 3, moon: 2.5, mercury: 1, venus: 1, mars: 1,
    jupiter: 1, saturn: 1, uranus: 0.8, neptune: 0.8, pluto: 0.8,
  };
  PLANETS.forEach(p => { w[p.key] = base[p.key] || 1; });
  cd.aspects.forEach(a => {
    if (w[a.planet1Key] !== undefined) w[a.planet1Key] += 0.5;
    if (w[a.planet2Key] !== undefined) w[a.planet2Key] += 0.5;
  });
  cd.planetPlacements.forEach(p => {
    if ([1, 4, 7, 10].includes(p.house)) w[p.key] = (w[p.key] || 1) + 1;
  });
  const total = Object.values(w).reduce((s, v) => s + v, 0);
  Object.keys(w).forEach(k => { w[k] = Math.round((w[k] / total) * 100); });
  return w;
}

const STATUS_TEXT: Record<Language, string[]> = {
  he: ["מזלות השמיים מתעוררים...", "קרני האור יורדות אליך...", "האנרגיה נספגת בתוכך...", "האור הפנימי מתעצם...", "החותם הקוסמי שלך נחשף..."],
  en: ["Celestial constellations awakening...", "Light beams descending toward you...", "Energy is being absorbed within...", "Your inner light is intensifying...", "Your cosmic signature is revealed..."],
  ru: ["Небесные созвездия пробуждаются...", "Лучи света нисходят к вам...", "Энергия поглощается внутри...", "Ваш внутренний свет усиливается...", "Ваша космическая подпись раскрывается..."],
  ar: ["الأبراج السماوية تستيقظ...", "أشعة الضوء تنزل نحوك...", "الطاقة تُمتص في داخلك...", "نورك الداخلي يتكثف...", "بصمتك الكونية تتكشف..."],
};

const W = 500;
const H = 720;
const CX = W / 2;
const CHEST_Y = 295;
const CORE_Y = 310;

/* ═══ DETAILED ANATOMICAL SVG PATHS ═══ */

// Head — rounder, more natural with subtle jaw
const HEAD = "M 250,138 C 234,138 222,150 220,168 C 218,186 222,202 232,212 C 238,218 244,222 250,223 C 256,222 262,218 268,212 C 278,202 282,186 280,168 C 278,150 266,138 250,138 Z";

// Face details — subtle eye sockets, nose bridge, brow line
const BROW_LINE = "M 233,165 C 238,162 244,161 250,161 C 256,161 262,162 267,165";
const LEFT_EYE = "M 237,172 C 240,169 244,169 247,172 C 244,174 240,174 237,172 Z";
const RIGHT_EYE = "M 253,172 C 256,169 260,169 263,172 C 260,174 256,174 253,172 Z";
const NOSE_BRIDGE = "M 250,168 L 249,178 C 248,182 247,185 245,187 C 247,188 250,189 253,188 L 255,187 C 253,185 252,182 251,178 Z";
const MOUTH_LINE = "M 243,196 C 246,198 250,199 254,198 C 257,196 254,198 250,199 C 246,198 243,196 243,196 Z";

// Neck — with subtle sternocleidomastoid muscle lines
const NECK = "M 243,223 L 242,240 C 242,244 246,246 250,246 C 254,246 258,244 258,240 L 257,223";
const NECK_MUSCLE_L = "M 237,220 C 235,228 230,236 226,244";
const NECK_MUSCLE_R = "M 263,220 C 265,228 270,236 274,244";

// Collarbones
const COLLARBONE_L = "M 250,248 C 240,246 225,244 208,250";
const COLLARBONE_R = "M 250,248 C 260,246 275,244 292,250";

// Torso — with natural shoulder curve and waist taper
const TORSO = "M 250,246 C 262,246 284,248 300,256 C 308,260 312,268 312,276 L 310,310 L 306,358 C 304,372 298,382 290,386 L 272,392 L 250,394 L 228,392 L 210,386 C 202,382 196,372 194,358 L 190,310 L 188,276 C 188,268 192,260 200,256 C 216,248 238,246 250,246 Z";

// Ribcage hints — subtle curved lines inside torso
const RIBS = [
  "M 218,272 C 228,268 240,266 250,266 C 260,266 272,268 282,272",
  "M 214,284 C 226,279 240,277 250,277 C 260,277 274,279 286,284",
  "M 212,296 C 226,290 240,288 250,288 C 260,288 274,290 288,296",
  "M 214,308 C 228,302 240,300 250,300 C 260,300 272,302 286,308",
  "M 218,320 C 230,314 242,312 250,312 C 258,312 270,314 282,320",
];

// Sternum line
const STERNUM = "M 250,250 L 250,335";

// Left arm — natural with elbow bend, forearm, wrist, open hand with fingers
const LEFT_UPPER_ARM = "M 188,262 C 182,270 176,282 170,296";
const LEFT_FOREARM = "M 170,296 C 164,314 158,334 154,352";
const LEFT_WRIST = "M 154,352 C 152,360 150,368 148,376";
const LEFT_HAND = "M 148,376 C 146,382 144,388 142,394 M 142,394 C 140,398 138,402 136,404 M 142,394 C 141,400 140,404 140,408 M 142,394 C 143,400 143,406 142,410 M 142,394 C 145,399 147,404 148,408 M 148,376 C 150,382 152,387 154,390";

// Right arm — mirrored
const RIGHT_UPPER_ARM = "M 312,262 C 318,270 324,282 330,296";
const RIGHT_FOREARM = "M 330,296 C 336,314 342,334 346,352";
const RIGHT_WRIST = "M 346,352 C 348,360 350,368 352,376";
const RIGHT_HAND = "M 352,376 C 354,382 356,388 358,394 M 358,394 C 360,398 362,402 364,404 M 358,394 C 359,400 360,404 360,408 M 358,394 C 357,400 357,406 358,410 M 358,394 C 355,399 353,404 352,408 M 352,376 C 350,382 348,387 346,390";

// Pelvis hints
const PELVIS = "M 220,380 C 230,390 240,394 250,395 C 260,394 270,390 280,380";

// Left leg — with knee and calf definition
const LEFT_THIGH = "M 234,392 C 232,410 230,430 228,455";
const LEFT_KNEE = "M 228,455 C 226,462 225,468 224,475";
const LEFT_SHIN = "M 224,475 C 222,500 220,530 218,560";
const LEFT_CALF_CONTOUR = "M 230,480 C 228,500 226,520 224,540";
const LEFT_ANKLE = "M 218,560 C 217,570 216,580 214,590";
const LEFT_FOOT = "M 214,590 C 212,596 208,600 204,602 C 202,603 204,606 210,605 L 226,602 C 230,601 232,598 232,594 L 230,590";

// Right leg — mirrored
const RIGHT_THIGH = "M 266,392 C 268,410 270,430 272,455";
const RIGHT_KNEE = "M 272,455 C 274,462 275,468 276,475";
const RIGHT_SHIN = "M 276,475 C 278,500 280,530 282,560";
const RIGHT_CALF_CONTOUR = "M 270,480 C 272,500 274,520 276,540";
const RIGHT_ANKLE = "M 282,560 C 283,570 284,580 286,590";
const RIGHT_FOOT = "M 286,590 C 288,596 292,600 296,602 C 298,603 296,606 290,605 L 274,602 C 270,601 268,598 268,594 L 270,590";

// Internal spine — detailed vertebrae
const SPINE = "M 250,218 L 250,248 L 250,280 L 250,310 L 250,340 L 250,370 L 250,395";

// Dense energy meridian network — like nervous system
const ENERGY_NETWORK = [
  // Torso — horizontal flows
  "M 210,270 C 225,265 250,264 275,265 C 290,268 295,270 290,270",
  "M 215,290 C 230,285 250,283 270,285 C 285,288 288,290 285,290",
  "M 218,310 C 232,305 250,303 268,305 C 282,308 285,310 282,310",
  "M 220,330 C 234,326 250,325 266,326 C 278,328 280,330 278,330",
  "M 224,350 C 236,346 250,345 264,346 C 274,348 276,350 274,350",
  // Torso — vertical flows
  "M 230,255 C 228,280 226,310 228,340 C 230,360 232,375 234,390",
  "M 270,255 C 272,280 274,310 272,340 C 270,360 268,375 266,390",
  // Arm flows
  "M 200,260 C 192,275 180,300 170,325 C 162,345 156,362 150,378",
  "M 300,260 C 308,275 320,300 330,325 C 338,345 344,362 350,378",
  // Leg flows
  "M 240,395 C 236,420 232,460 228,500 C 225,530 222,555 220,575",
  "M 260,395 C 264,420 268,460 272,500 C 275,530 278,555 280,575",
  // Cross-body diagonals
  "M 215,265 C 230,290 245,310 250,330 C 255,310 270,290 285,265",
  "M 230,350 C 240,370 248,390 250,395 C 252,390 260,370 270,350",
  // Head energy paths
  "M 240,155 C 245,165 248,180 250,195",
  "M 260,155 C 255,165 252,180 250,195",
  // Shoulder-to-hand flows
  "M 208,255 C 195,270 178,296 164,320 C 155,340 148,358 144,376",
  "M 292,255 C 305,270 322,296 336,320 C 345,340 352,358 356,376",
];

// Subtle muscle contour lines for depth
const MUSCLE_CONTOURS = [
  // Deltoid hints
  "M 200,256 C 195,262 192,268 190,274",
  "M 300,256 C 305,262 308,268 310,274",
  // Pectoral hints
  "M 218,260 C 230,264 240,268 250,270",
  "M 282,260 C 270,264 260,268 250,270",
  // Abdominal hints
  "M 240,320 C 242,325 244,330 245,335",
  "M 260,320 C 258,325 256,330 255,335",
  // Oblique hints
  "M 210,315 C 215,325 220,340 225,355",
  "M 290,315 C 285,325 280,340 275,355",
  // Thigh muscle
  "M 236,400 C 234,420 232,440 230,460",
  "M 264,400 C 266,420 268,440 270,460",
];

// Chakra positions
const CHAKRAS = [
  { cy: 155, color: "#C77DFF", label: "Crown", r: 5 },
  { cy: 175, color: "#7B2FBE", label: "Third Eye", r: 4 },
  { cy: 248, color: "#48BFE3", label: "Throat", r: 4.5 },
  { cy: 290, color: "#56CFE1", label: "Heart", r: 6 },
  { cy: 335, color: "#F9C74F", label: "Solar", r: 5 },
  { cy: 365, color: "#F3722C", label: "Sacral", r: 4.5 },
  { cy: 392, color: "#E63946", label: "Root", r: 5 },
];

function zodiacPositions() {
  const R = 230;
  return PLANETS.map((planet, i) => {
    const angle = (i / PLANETS.length) * Math.PI * 2 - Math.PI / 2;
    return {
      key: planet.key,
      symbol: planet.symbol,
      x: CX + Math.cos(angle) * R,
      y: CORE_Y + Math.sin(angle) * (R * 0.72),
    };
  });
}

const T_CONSTELLATION_END = 3500;
const T_BEAM_START = 2000;
const T_ABSORPTION_START = 4000;
const T_ABSORPTION_END = 7000;
const T_CLIMAX_START = 7000;
const T_CLIMAX_PEAK = 8500;
const T_HOLD_END = 11000;
const T_TOTAL = 11500;

const FullChartAstralTransformation = ({ userName, chartData, onComplete }: Props) => {
  const { language } = useLanguage();

  const [constellationsLit, setConstellationsLit] = useState(0);
  const [beamsActive, setBeamsActive] = useState(0);
  const [absorption, setAbsorption] = useState(0);
  const [climax, setClimax] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showInfluences, setShowInfluences] = useState(false);

  const statusTexts = STATUS_TEXT[language] || STATUS_TEXT.en;
  const influences = useMemo(() => computeInfluences(chartData), [chartData]);
  const sortedPlanets = useMemo(() => [...PLANETS].sort((a, b) => (influences[b.key] || 0) - (influences[a.key] || 0)), [influences]);
  const topInfluences = useMemo(() => sortedPlanets.slice(0, 5), [sortedPlanets]);
  const dominant = P_COLOR[sortedPlanets[0]?.key] || "#F5C842";
  const secondary = P_COLOR[sortedPlanets[1]?.key] || "#D0D6E0";

  const zodiac = useMemo(() => zodiacPositions(), []);

  useEffect(() => {
    const progTimer = setInterval(() => setProgress(p => Math.min(p + 1, 100)), T_TOTAL / 100);
    const statusInterval = T_TOTAL / statusTexts.length;
    const statusTimer = setInterval(() => setStatusIdx(s => Math.min(s + 1, statusTexts.length - 1)), statusInterval);

    const constDelay = T_CONSTELLATION_END / PLANETS.length;
    const constTimer = setInterval(() => {
      setConstellationsLit(c => { if (c >= PLANETS.length) return c; return c + 1; });
    }, constDelay);
    setTimeout(() => clearInterval(constTimer), T_CONSTELLATION_END + 500);

    const beamTimer = setTimeout(() => {
      const bd = 2000 / PLANETS.length;
      const bt = setInterval(() => {
        setBeamsActive(b => { if (b >= PLANETS.length) { clearInterval(bt); return b; } return b + 1; });
      }, bd);
    }, T_BEAM_START);

    const absTimer = setTimeout(() => {
      const dur = T_ABSORPTION_END - T_ABSORPTION_START;
      const steps = 50;
      let i = 0;
      const at = setInterval(() => { i++; setAbsorption(Math.min(i / steps, 1)); if (i >= steps) clearInterval(at); }, dur / steps);
    }, T_ABSORPTION_START);

    const clxTimer = setTimeout(() => {
      const dur = T_CLIMAX_PEAK - T_CLIMAX_START;
      const steps = 30;
      let i = 0;
      const ct = setInterval(() => { i++; setClimax(Math.min(i / steps, 1)); if (i >= steps) clearInterval(ct); }, dur / steps);
    }, T_CLIMAX_START);

    const infTimer = setTimeout(() => setShowInfluences(true), T_CLIMAX_PEAK + 400);
    const doneTimer = setTimeout(onComplete, T_TOTAL);

    return () => {
      clearInterval(progTimer);
      clearInterval(constTimer);
      clearInterval(statusTimer);
      clearTimeout(beamTimer);
      clearTimeout(absTimer);
      clearTimeout(clxTimer);
      clearTimeout(infTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  const bodyOpacity = 0.12 + absorption * 0.48 + climax * 0.4;
  const strokeOp = 0.25 + absorption * 0.35 + climax * 0.4;
  const glowSize = 3 + absorption * 12 + climax * 30;
  const innerLineOp = 0.05 + absorption * 0.25 + climax * 0.3;
  const energyNetOp = absorption * 0.35 + climax * 0.45;

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-2 relative overflow-hidden">
      {/* Debug proof label */}
      <div
        className="fixed top-16 left-4 z-[200] px-3 py-1.5 rounded font-mono text-xs font-bold"
        style={{ background: "#00ff88", color: "#000", border: "2px solid #000" }}
      >
        NEW ASTRAL SCENE ACTIVE
      </div>

      {/* Deep space bg */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 90% 70% at 50% 35%, hsl(var(--deep-blue-light) / 0.18), transparent)",
      }} />

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() > 0.7 ? 2.5 : 1.5,
              height: Math.random() > 0.7 ? 2.5 : 1.5,
              background: `hsl(var(--gold) / ${0.12 + Math.random() * 0.35})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: 2.5 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5 }}
          />
        ))}
      </div>

      {/* ═══ MAIN SVG SCENE ═══ */}
      <div className="relative w-full" style={{ maxWidth: 540, aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" className="absolute inset-0" overflow="visible">
          <defs>
            <filter id="fcat-beam-glow">
              <feGaussianBlur stdDeviation="6" result="b1" />
              <feGaussianBlur stdDeviation="14" in="SourceGraphic" result="b2" />
              <feMerge><feMergeNode in="b2" /><feMergeNode in="b1" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="fcat-body-glow">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="fcat-soft-glow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="fcat-climax-mega">
              <feGaussianBlur stdDeviation="22" result="b1" />
              <feGaussianBlur stdDeviation="8" in="SourceGraphic" result="b2" />
              <feMerge><feMergeNode in="b1" /><feMergeNode in="b2" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="fcat-node-glow">
              <feGaussianBlur stdDeviation="3.5" />
            </filter>
            <filter id="fcat-inner-glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>

            {/* Multi-stop body gradient for depth */}
            <linearGradient id="fcat-body-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={dominant} stopOpacity={bodyOpacity * 0.4} />
              <stop offset="15%" stopColor={dominant} stopOpacity={bodyOpacity * 0.8} />
              <stop offset="35%" stopColor="#fff" stopOpacity={bodyOpacity * 0.2} />
              <stop offset="50%" stopColor={dominant} stopOpacity={bodyOpacity} />
              <stop offset="70%" stopColor={secondary} stopOpacity={bodyOpacity * 0.6} />
              <stop offset="100%" stopColor={dominant} stopOpacity={bodyOpacity * 0.15} />
            </linearGradient>

            {/* Head gradient — slightly brighter */}
            <radialGradient id="fcat-head-fill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity={bodyOpacity * 0.3} />
              <stop offset="40%" stopColor={dominant} stopOpacity={bodyOpacity * 0.9} />
              <stop offset="100%" stopColor={dominant} stopOpacity={bodyOpacity * 0.4} />
            </radialGradient>

            {/* Climax radial */}
            <radialGradient id="fcat-climax-rad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.45 * climax} />
              <stop offset="20%" stopColor={dominant} stopOpacity={0.8 * climax} />
              <stop offset="50%" stopColor={secondary} stopOpacity={0.35 * climax} />
              <stop offset="100%" stopColor={dominant} stopOpacity={0} />
            </radialGradient>

            {/* Energy line gradient */}
            <linearGradient id="fcat-energy-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={dominant} stopOpacity={0.6} />
              <stop offset="50%" stopColor="#fff" stopOpacity={0.3} />
              <stop offset="100%" stopColor={secondary} stopOpacity={0.5} />
            </linearGradient>
          </defs>

          {/* ─── Zodiac nodes around figure ─── */}
          {zodiac.map((z, idx) => {
            const col = P_COLOR[z.key] || "#fff";
            if (idx >= constellationsLit) return null;
            return (
              <g key={`zn-${z.key}`}>
                {/* Outer halo */}
                <motion.circle
                  cx={z.x} cy={z.y} r={16}
                  fill="none" stroke={col} strokeWidth={0.5}
                  filter="url(#fcat-node-glow)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0.2] }}
                  transition={{ duration: 0.8, delay: idx * 0.08 }}
                />
                <motion.circle
                  cx={z.x} cy={z.y} r={10}
                  fill={col} filter="url(#fcat-node-glow)"
                  initial={{ opacity: 0, r: 3 }}
                  animate={{ opacity: [0, 0.9, 0.75], r: [3, 12, 9] }}
                  transition={{ duration: 0.7, delay: idx * 0.08 }}
                />
                <motion.text
                  x={z.x} y={z.y + 1.5}
                  textAnchor="middle" dominantBaseline="central"
                  fill="#fff" fontSize={11} fontWeight="bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.9] }}
                  transition={{ duration: 0.5, delay: idx * 0.08 + 0.15 }}
                >
                  {z.symbol}
                </motion.text>
              </g>
            );
          })}

          {/* ─── Beams from zodiac to chest ─── */}
          {zodiac.map((z, idx) => {
            const col = P_COLOR[z.key] || "#fff";
            if (idx >= beamsActive) return null;
            const inf = (influences[z.key] || 5) / 100;
            return (
              <g key={`beam-${z.key}`}>
                {/* Wide diffuse beam */}
                <motion.line
                  x1={z.x} y1={z.y} x2={CX} y2={CHEST_Y}
                  stroke={col} strokeWidth={3 + inf * 6}
                  strokeLinecap="round" filter="url(#fcat-beam-glow)"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: [0, 0.25, absorption > 0.5 ? 0.06 : 0.18], pathLength: 1 }}
                  transition={{ opacity: { duration: 2.5, times: [0, 0.2, 1] }, pathLength: { duration: 1, ease: "easeOut" } }}
                />
                {/* Sharp core beam */}
                <motion.line
                  x1={z.x} y1={z.y} x2={CX} y2={CHEST_Y}
                  stroke={col} strokeWidth={1 + inf * 2.5}
                  strokeLinecap="round"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: [0, 0.9, absorption > 0.5 ? 0.2 : 0.7], pathLength: 1 }}
                  transition={{ opacity: { duration: 2.5, times: [0, 0.2, 1] }, pathLength: { duration: 1, ease: "easeOut" } }}
                />
                {/* Traveling particle */}
                <motion.circle
                  r={2.5 + inf * 2} fill={col} filter="url(#fcat-node-glow)"
                  initial={{ cx: z.x, cy: z.y, opacity: 0 }}
                  animate={{ cx: [z.x, CX], cy: [z.y, CHEST_Y], opacity: [0, 1, 0.7, 0] }}
                  transition={{ duration: 1.4, delay: 0.2, ease: "easeIn", times: [0, 0.1, 0.8, 1] }}
                />
              </g>
            );
          })}

          {/* ─── HUMAN FIGURE — detailed multi-part anatomy ─── */}
          <g style={{ filter: `drop-shadow(0 0 ${glowSize}px ${dominant}${climax > 0.5 ? 'c0' : '60'})` }}>
            {/* === FILLED BODY PARTS === */}
            {/* Head with radial gradient */}
            <path d={HEAD} fill="url(#fcat-head-fill)" stroke={dominant} strokeWidth={0.8 + climax * 0.6} strokeOpacity={strokeOp} strokeLinejoin="round" />

            {/* Face details — very subtle */}
            <path d={BROW_LINE} fill="none" stroke="#fff" strokeWidth={0.4} strokeOpacity={innerLineOp * 0.7} />
            <path d={LEFT_EYE} fill="#fff" fillOpacity={innerLineOp * 0.4} stroke="#fff" strokeWidth={0.3} strokeOpacity={innerLineOp * 0.5} />
            <path d={RIGHT_EYE} fill="#fff" fillOpacity={innerLineOp * 0.4} stroke="#fff" strokeWidth={0.3} strokeOpacity={innerLineOp * 0.5} />
            <path d={NOSE_BRIDGE} fill="none" stroke="#fff" strokeWidth={0.3} strokeOpacity={innerLineOp * 0.4} />
            <path d={MOUTH_LINE} fill="none" stroke="#fff" strokeWidth={0.3} strokeOpacity={innerLineOp * 0.35} />

            {/* Torso filled */}
            <path d={TORSO} fill="url(#fcat-body-fill)" stroke={dominant} strokeWidth={0.7 + climax * 0.5} strokeOpacity={strokeOp} strokeLinejoin="round" />

            {/* Neck */}
            <path d={NECK} fill="none" stroke={dominant} strokeWidth={0.5} strokeOpacity={strokeOp * 0.8} />
            <path d={NECK_MUSCLE_L} fill="none" stroke={dominant} strokeWidth={0.3} strokeOpacity={innerLineOp * 0.6} />
            <path d={NECK_MUSCLE_R} fill="none" stroke={dominant} strokeWidth={0.3} strokeOpacity={innerLineOp * 0.6} />

            {/* Collarbones */}
            <path d={COLLARBONE_L} fill="none" stroke="#fff" strokeWidth={0.5} strokeOpacity={innerLineOp * 0.7} strokeLinecap="round" />
            <path d={COLLARBONE_R} fill="none" stroke="#fff" strokeWidth={0.5} strokeOpacity={innerLineOp * 0.7} strokeLinecap="round" />

            {/* Sternum */}
            <path d={STERNUM} fill="none" stroke="#fff" strokeWidth={0.4} strokeOpacity={innerLineOp * 0.5} strokeLinecap="round" />

            {/* Ribs */}
            {RIBS.map((rib, i) => (
              <path key={`rib-${i}`} d={rib} fill="none" stroke="#fff" strokeWidth={0.3} strokeOpacity={innerLineOp * 0.4} strokeLinecap="round" />
            ))}

            {/* Muscle contours for depth */}
            {MUSCLE_CONTOURS.map((mc, i) => (
              <path key={`mc-${i}`} d={mc} fill="none" stroke={dominant} strokeWidth={0.35} strokeOpacity={innerLineOp * 0.5} strokeLinecap="round" />
            ))}

            {/* Arms */}
            <path d={LEFT_UPPER_ARM} fill="none" stroke={dominant} strokeWidth={0.8 + climax * 0.4} strokeOpacity={strokeOp} strokeLinecap="round" strokeLinejoin="round" />
            <path d={LEFT_FOREARM} fill="none" stroke={dominant} strokeWidth={0.7 + climax * 0.3} strokeOpacity={strokeOp} strokeLinecap="round" />
            <path d={LEFT_WRIST} fill="none" stroke={dominant} strokeWidth={0.6 + climax * 0.2} strokeOpacity={strokeOp * 0.9} strokeLinecap="round" />
            <path d={LEFT_HAND} fill="none" stroke={dominant} strokeWidth={0.5 + climax * 0.2} strokeOpacity={strokeOp * 0.8} strokeLinecap="round" />

            <path d={RIGHT_UPPER_ARM} fill="none" stroke={dominant} strokeWidth={0.8 + climax * 0.4} strokeOpacity={strokeOp} strokeLinecap="round" strokeLinejoin="round" />
            <path d={RIGHT_FOREARM} fill="none" stroke={dominant} strokeWidth={0.7 + climax * 0.3} strokeOpacity={strokeOp} strokeLinecap="round" />
            <path d={RIGHT_WRIST} fill="none" stroke={dominant} strokeWidth={0.6 + climax * 0.2} strokeOpacity={strokeOp * 0.9} strokeLinecap="round" />
            <path d={RIGHT_HAND} fill="none" stroke={dominant} strokeWidth={0.5 + climax * 0.2} strokeOpacity={strokeOp * 0.8} strokeLinecap="round" />

            {/* Pelvis */}
            <path d={PELVIS} fill="none" stroke={dominant} strokeWidth={0.5} strokeOpacity={innerLineOp * 0.6} strokeLinecap="round" />

            {/* Legs */}
            <path d={LEFT_THIGH} fill="none" stroke={dominant} strokeWidth={0.8 + climax * 0.3} strokeOpacity={strokeOp} strokeLinecap="round" />
            <path d={LEFT_KNEE} fill="none" stroke={dominant} strokeWidth={0.7 + climax * 0.2} strokeOpacity={strokeOp * 0.9} strokeLinecap="round" />
            <path d={LEFT_SHIN} fill="none" stroke={dominant} strokeWidth={0.7 + climax * 0.3} strokeOpacity={strokeOp} strokeLinecap="round" />
            <path d={LEFT_CALF_CONTOUR} fill="none" stroke={dominant} strokeWidth={0.35} strokeOpacity={innerLineOp * 0.5} strokeLinecap="round" />
            <path d={LEFT_ANKLE} fill="none" stroke={dominant} strokeWidth={0.6} strokeOpacity={strokeOp * 0.8} strokeLinecap="round" />
            <path d={LEFT_FOOT} fill="none" stroke={dominant} strokeWidth={0.5 + climax * 0.2} strokeOpacity={strokeOp * 0.7} strokeLinecap="round" />

            <path d={RIGHT_THIGH} fill="none" stroke={dominant} strokeWidth={0.8 + climax * 0.3} strokeOpacity={strokeOp} strokeLinecap="round" />
            <path d={RIGHT_KNEE} fill="none" stroke={dominant} strokeWidth={0.7 + climax * 0.2} strokeOpacity={strokeOp * 0.9} strokeLinecap="round" />
            <path d={RIGHT_SHIN} fill="none" stroke={dominant} strokeWidth={0.7 + climax * 0.3} strokeOpacity={strokeOp} strokeLinecap="round" />
            <path d={RIGHT_CALF_CONTOUR} fill="none" stroke={dominant} strokeWidth={0.35} strokeOpacity={innerLineOp * 0.5} strokeLinecap="round" />
            <path d={RIGHT_ANKLE} fill="none" stroke={dominant} strokeWidth={0.6} strokeOpacity={strokeOp * 0.8} strokeLinecap="round" />
            <path d={RIGHT_FOOT} fill="none" stroke={dominant} strokeWidth={0.5 + climax * 0.2} strokeOpacity={strokeOp * 0.7} strokeLinecap="round" />

            {/* White outline highlights for volumetric depth */}
            <path d={HEAD} fill="none" stroke="#fff" strokeWidth={0.25} strokeOpacity={0.04 + absorption * 0.06 + climax * 0.12} />
            <path d={TORSO} fill="none" stroke="#fff" strokeWidth={0.25} strokeOpacity={0.04 + absorption * 0.06 + climax * 0.12} />
          </g>

          {/* ─── ENERGY NETWORK — nervous system-like lines ─── */}
          {absorption > 0 && (
            <g>
              {/* Spine — bright central line */}
              <motion.path
                d={SPINE} fill="none" stroke={dominant} strokeWidth={1.8}
                strokeLinecap="round" filter="url(#fcat-soft-glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: absorption, opacity: absorption * 0.7 }}
                transition={{ duration: 1.5 }}
              />

              {/* Dense energy network */}
              {ENERGY_NETWORK.map((path, i) => (
                <motion.path
                  key={`en-${i}`} d={path} fill="none"
                  stroke={i % 3 === 0 ? dominant : i % 3 === 1 ? secondary : "#fff"}
                  strokeWidth={0.4 + (i % 4) * 0.15}
                  strokeLinecap="round"
                  filter="url(#fcat-inner-glow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: absorption, opacity: energyNetOp * (0.4 + (i % 3) * 0.2) }}
                  transition={{ duration: 1.3, delay: 0.1 + i * 0.06 }}
                />
              ))}

              {/* Chakra points — glowing orbs */}
              {CHAKRAS.map((ck, ci) => (
                <g key={`ck-${ci}`}>
                  {/* Outer glow */}
                  <motion.circle
                    cx={CX} cy={ck.cy} fill={ck.color}
                    filter="url(#fcat-body-glow)"
                    initial={{ r: 0, opacity: 0 }}
                    animate={{
                      r: [0, ck.r + absorption * 4, ck.r + absorption * 3],
                      opacity: [0, absorption * 0.4, absorption * 0.25],
                    }}
                    transition={{ duration: 1, delay: ci * 0.12 + 0.5 }}
                  />
                  {/* Core dot */}
                  <motion.circle
                    cx={CX} cy={ck.cy} fill="#fff"
                    initial={{ r: 0, opacity: 0 }}
                    animate={{
                      r: [0, ck.r * 0.4 + absorption * 1.5, ck.r * 0.35 + absorption * 1],
                      opacity: [0, absorption * 0.7, absorption * 0.5],
                    }}
                    transition={{ duration: 0.8, delay: ci * 0.12 + 0.7 }}
                  />
                </g>
              ))}

              {/* Pulse rings from chest */}
              {[0, 1, 2].map(ring => (
                <motion.circle
                  key={`pulse-${ring}`} cx={CX} cy={CHEST_Y}
                  fill="none" stroke={dominant} strokeWidth={0.6}
                  initial={{ r: 5, opacity: 0 }}
                  animate={{ r: [5, 45 + ring * 20, 65 + ring * 22], opacity: [0.35 * absorption, 0.15 * absorption, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: ring * 0.8, ease: "easeOut" }}
                />
              ))}
            </g>
          )}

          {/* ─── Climax: mega inner light + aura ─── */}
          {climax > 0 && (
            <g>
              {/* Aura around entire body */}
              <motion.ellipse
                cx={CX} cy={350} rx={120 + climax * 40} ry={200 + climax * 50}
                fill="none" stroke={dominant} strokeWidth={1}
                filter="url(#fcat-climax-mega)"
                animate={{
                  opacity: [0.05 * climax, 0.15 * climax, 0.05 * climax],
                  rx: [120 + climax * 35, 130 + climax * 50, 120 + climax * 35],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Core explosion */}
              <motion.circle
                cx={CX} cy={CORE_Y} fill="url(#fcat-climax-rad)" filter="url(#fcat-climax-mega)"
                animate={{ r: [35 + climax * 40, 55 + climax * 65, 35 + climax * 50] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.circle
                cx={CX} cy={CORE_Y} r={10 + climax * 18} fill="#fff"
                opacity={0.2 + climax * 0.55} filter="url(#fcat-body-glow)"
                animate={climax > 0.6 ? {
                  r: [10 + climax * 16, 10 + climax * 22, 10 + climax * 16],
                  opacity: [0.35 + climax * 0.3, 0.6 + climax * 0.35, 0.35 + climax * 0.3],
                } : undefined}
                transition={{ duration: 1.8, repeat: Infinity }}
              />

              {/* Chakras intensify */}
              {CHAKRAS.map((ck, ci) => (
                <motion.circle
                  key={`ck-clx-${ci}`} cx={CX} cy={ck.cy}
                  fill={ck.color} filter="url(#fcat-body-glow)"
                  animate={{
                    r: [ck.r * 0.6 + climax * 2, ck.r + climax * 5, ck.r * 0.6 + climax * 2],
                    opacity: [climax * 0.45, climax * 0.85, climax * 0.45],
                  }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: ci * 0.1 }}
                />
              ))}

              {/* Energy rays from core — like reference */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => {
                const rad = (angle - 90) * (Math.PI / 180);
                const inner = 15;
                const outer = 40 + climax * 35;
                return (
                  <motion.line
                    key={`ray-${angle}`}
                    x1={CX + Math.cos(rad) * inner} y1={CORE_Y + Math.sin(rad) * inner}
                    x2={CX + Math.cos(rad) * outer} y2={CORE_Y + Math.sin(rad) * outer}
                    stroke={dominant} strokeWidth={1.2} strokeLinecap="round"
                    filter="url(#fcat-inner-glow)"
                    animate={{
                      opacity: [0.1 * climax, 0.55 * climax, 0.1 * climax],
                      x2: [CX + Math.cos(rad) * (outer - 12), CX + Math.cos(rad) * (outer + 8), CX + Math.cos(rad) * (outer - 12)],
                      y2: [CORE_Y + Math.sin(rad) * (outer - 12), CORE_Y + Math.sin(rad) * (outer + 8), CORE_Y + Math.sin(rad) * (outer - 12)],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: angle * 0.003 }}
                  />
                );
              })}

              {/* Secondary energy network pulses during climax */}
              {ENERGY_NETWORK.filter((_, i) => i % 2 === 0).map((path, i) => (
                <motion.path
                  key={`en-clx-${i}`} d={path} fill="none"
                  stroke="#fff" strokeWidth={0.6}
                  filter="url(#fcat-inner-glow)"
                  animate={{
                    opacity: [0.05 * climax, 0.25 * climax, 0.05 * climax],
                  }}
                  transition={{ duration: 1.6 + i * 0.1, repeat: Infinity, delay: i * 0.08 }}
                />
              ))}
            </g>
          )}
        </svg>

        {/* Final hold debug label */}
        {climax > 0.8 && (
          <div
            className="absolute bottom-2 left-2 z-[200] px-2 py-1 rounded font-mono text-[10px] font-bold"
            style={{ background: "#ff6600", color: "#000", border: "1px solid #000" }}
          >
            FINAL FIGURE SHOULD STILL BE VISIBLE
          </div>
        )}
      </div>

      {/* ─── Text overlay ─── */}
      {userName && (
        <motion.p className="font-heading text-lg md:text-xl gold-gradient-text mt-3 mb-1 text-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {userName}
        </motion.p>
      )}

      <AnimatePresence mode="wait">
        <motion.p key={statusIdx}
          className="font-body text-sm md:text-base text-center max-w-sm"
          style={{ color: "hsl(var(--foreground) / 0.6)" }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5 }}>
          {statusTexts[statusIdx]}
        </motion.p>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="w-48 h-0.5 mt-5 rounded-full overflow-hidden" style={{ background: "hsl(var(--gold) / 0.1)" }}>
        <motion.div className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${dominant}40, ${dominant}${climax > 0.5 ? 'ff' : '90'}, ${dominant}40)` }}
          initial={{ width: "0%" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
      </div>

      {/* Influence cards */}
      <AnimatePresence>
        {showInfluences && (
          <motion.div className="flex flex-wrap justify-center gap-2 mt-5 max-w-sm"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {topInfluences.map((planet, i) => {
              const col = P_COLOR[planet.key] || "#fff";
              return (
                <motion.div key={planet.key}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body"
                  style={{ background: `${col}15`, border: `1px solid ${col}35`, color: col }}
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.12 }}>
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

export default FullChartAstralTransformation;
