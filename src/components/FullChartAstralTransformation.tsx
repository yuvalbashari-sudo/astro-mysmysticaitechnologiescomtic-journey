import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { PLANETS } from "@/components/NatalChartWheel";
import { useLanguage } from "@/i18n/LanguageContext";
import { getPlanetName } from "@/lib/astroLocale";
import type { NatalChartResult } from "@/lib/natalChart";
import type { Language } from "@/i18n/types";

/* ═══════════════════════════════════════════════════════════
   FullChartAstralTransformation — HARD REPLACEMENT
   ═══════════════════════════════════════════════════════════
   This is a completely new component. It does NOT reuse any
   code, paths, or timing from AstralLightReveal.
   ═══════════════════════════════════════════════════════════ */

console.log("NEW ASTRAL SCENE ACTIVE — FullChartAstralTransformation loaded");

interface Props {
  userName?: string;
  chartData: NatalChartResult;
  onComplete: () => void;
}

/* ── Planet colors ── */
const P_COLOR: Record<string, string> = {
  sun: "#F5C842", moon: "#D0D6E0", mercury: "#7FD4A8", venus: "#F28DC7",
  mars: "#E05252", jupiter: "#7B8FE8", saturn: "#C4A86C", uranus: "#5FC8E8",
  neptune: "#6070E8", pluto: "#9060B8",
};

/* ── Influence weights ── */
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

/* ── Scene dimensions ── */
const W = 500;
const H = 700;
const CX = W / 2; // 250
const CHEST_Y = 310;
const CORE_Y = 330;

/* ── Multi-part anatomical human figure ── */
// Head — natural oval skull
const HEAD = "M 250,145 C 237,145 226,155 224,170 C 222,185 226,200 234,208 C 238,212 244,215 250,216 C 256,215 262,212 266,208 C 274,200 278,185 276,170 C 274,155 263,145 250,145 Z";

// Neck
const NECK = "M 242,216 L 242,232 C 242,236 244,238 250,238 C 256,238 258,236 258,232 L 258,216";

// Torso — natural shoulders tapering to waist
const TORSO = "M 250,238 C 260,238 280,240 296,248 C 304,252 308,258 308,266 L 306,310 L 302,358 C 300,370 296,378 288,382 L 270,388 L 250,390 L 230,388 L 212,382 C 204,378 200,370 198,358 L 194,310 L 192,266 C 192,258 196,252 204,248 C 220,240 240,238 250,238 Z";

// Left arm — natural with slight bend, open palm
const LEFT_ARM = "M 192,260 L 178,276 L 164,306 L 156,340 L 152,370 L 148,394 L 142,408 C 140,414 138,418 135,420 C 133,422 131,420 132,416 L 138,398 L 146,370 L 150,338 L 158,306 L 170,278 L 186,258";

// Right arm — mirrored
const RIGHT_ARM = "M 308,260 L 322,276 L 336,306 L 344,340 L 348,370 L 352,394 L 358,408 C 360,414 362,418 365,420 C 367,422 369,420 368,416 L 362,398 L 354,370 L 350,338 L 342,306 L 330,278 L 314,258";

// Left leg
const LEFT_LEG = "M 232,388 L 228,430 L 224,480 L 222,530 L 220,570 L 218,600 L 216,625 C 215,632 214,638 210,640 L 206,642 C 204,643 204,645 208,645 L 224,642 C 228,641 230,638 230,632 L 230,600 L 232,570 L 234,530 L 236,480 L 238,430 L 240,390";

// Right leg — mirrored
const RIGHT_LEG = "M 268,388 L 272,430 L 276,480 L 278,530 L 280,570 L 282,600 L 284,625 C 285,632 286,638 290,640 L 294,642 C 296,643 296,645 292,645 L 276,642 C 272,641 270,638 270,632 L 270,600 L 268,570 L 266,530 L 264,480 L 262,430 L 260,390";

// Internal spine/meridian line
const SPINE = "M 250,210 L 250,240 L 250,280 L 250,320 L 250,360 L 250,390";

// Internal meridian branches
const MERIDIAN_LEFT = "M 250,280 C 240,290 225,300 215,310";
const MERIDIAN_RIGHT = "M 250,280 C 260,290 275,300 285,310";
const MERIDIAN_DOWN_L = "M 250,370 C 244,390 236,420 230,450";
const MERIDIAN_DOWN_R = "M 250,370 C 256,390 264,420 270,450";

// Chakra positions (along spine)
const CHAKRAS = [
  { cy: 180, color: "#9B59B6", label: "Crown" },      // Crown
  { cy: 200, color: "#5B4FCF", label: "Third Eye" },   // Third eye
  { cy: 248, color: "#3498DB", label: "Throat" },      // Throat
  { cy: 300, color: "#2ECC71", label: "Heart" },        // Heart
  { cy: 345, color: "#F1C40F", label: "Solar" },        // Solar plexus
  { cy: 370, color: "#E67E22", label: "Sacral" },       // Sacral
  { cy: 390, color: "#E74C3C", label: "Root" },          // Root
];

/* ── Zodiac ring positions ── */
function zodiacPositions() {
  const R = 220; // radius from center
  return PLANETS.map((planet, i) => {
    const angle = (i / PLANETS.length) * Math.PI * 2 - Math.PI / 2;
    return {
      key: planet.key,
      symbol: planet.symbol,
      x: CX + Math.cos(angle) * R,
      y: CORE_Y + Math.sin(angle) * (R * 0.75), // slightly elliptical
    };
  });
}

/* ── TIMING (ms) ── */
const T_CONSTELLATION_END = 3500;
const T_BEAM_START = 2000;
const T_ABSORPTION_START = 4000;
const T_ABSORPTION_END = 7000;
const T_CLIMAX_START = 7000;
const T_CLIMAX_PEAK = 8500;
const T_HOLD_END = 11000; // 2.5s hold
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

    // Phase 1: Constellations appear
    const constDelay = T_CONSTELLATION_END / PLANETS.length;
    const constTimer = setInterval(() => {
      setConstellationsLit(c => { if (c >= PLANETS.length) return c; return c + 1; });
    }, constDelay);
    setTimeout(() => clearInterval(constTimer), T_CONSTELLATION_END + 500);

    // Phase 1b: Beams fire
    const beamTimer = setTimeout(() => {
      const bd = 2000 / PLANETS.length;
      const bt = setInterval(() => {
        setBeamsActive(b => { if (b >= PLANETS.length) { clearInterval(bt); return b; } return b + 1; });
      }, bd);
    }, T_BEAM_START);

    // Phase 2: Absorption
    const absTimer = setTimeout(() => {
      const dur = T_ABSORPTION_END - T_ABSORPTION_START;
      const steps = 50;
      let i = 0;
      const at = setInterval(() => { i++; setAbsorption(Math.min(i / steps, 1)); if (i >= steps) clearInterval(at); }, dur / steps);
    }, T_ABSORPTION_START);

    // Phase 3: Climax
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

  const bodyOpacity = 0.15 + absorption * 0.45 + climax * 0.4;
  const strokeOp = 0.3 + absorption * 0.3 + climax * 0.4;
  const glowSize = 4 + absorption * 10 + climax * 25;

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
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() > 0.7 ? 2.5 : 1.5,
              height: Math.random() > 0.7 ? 2.5 : 1.5,
              background: `hsl(var(--gold) / ${0.15 + Math.random() * 0.35})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: 2.5 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 5 }}
          />
        ))}
      </div>

      {/* ═══ MAIN SVG SCENE ═══ */}
      <div className="relative w-full" style={{ maxWidth: 520, aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" className="absolute inset-0" overflow="visible">
          <defs>
            <filter id="fcat-beam-glow">
              <feGaussianBlur stdDeviation="5" result="b1" />
              <feGaussianBlur stdDeviation="10" in="SourceGraphic" result="b2" />
              <feMerge><feMergeNode in="b2" /><feMergeNode in="b1" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="fcat-body-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="fcat-climax-mega">
              <feGaussianBlur stdDeviation="20" result="b1" />
              <feGaussianBlur stdDeviation="8" in="SourceGraphic" result="b2" />
              <feMerge><feMergeNode in="b1" /><feMergeNode in="b2" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="fcat-node-glow">
              <feGaussianBlur stdDeviation="3" />
            </filter>

            {/* Body fill gradient */}
            <linearGradient id="fcat-body-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={dominant} stopOpacity={bodyOpacity * 0.6} />
              <stop offset="30%" stopColor={dominant} stopOpacity={bodyOpacity} />
              <stop offset="60%" stopColor={secondary} stopOpacity={bodyOpacity * 0.7} />
              <stop offset="100%" stopColor={dominant} stopOpacity={bodyOpacity * 0.2} />
            </linearGradient>

            {/* Climax radial */}
            <radialGradient id="fcat-climax-rad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.35 * climax} />
              <stop offset="25%" stopColor={dominant} stopOpacity={0.7 * climax} />
              <stop offset="55%" stopColor={secondary} stopOpacity={0.3 * climax} />
              <stop offset="100%" stopColor={dominant} stopOpacity={0} />
            </radialGradient>
          </defs>

          {/* ─── Zodiac nodes around figure ─── */}
          {zodiac.map((z, idx) => {
            const col = P_COLOR[z.key] || "#fff";
            if (idx >= constellationsLit) return null;
            return (
              <g key={`zn-${z.key}`}>
                <motion.circle
                  cx={z.x} cy={z.y} r={10}
                  fill={col} filter="url(#fcat-node-glow)"
                  initial={{ opacity: 0, r: 3 }}
                  animate={{ opacity: [0, 0.85, 0.7], r: [3, 12, 9] }}
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
                <motion.line
                  x1={z.x} y1={z.y} x2={CX} y2={CHEST_Y}
                  stroke={col}
                  strokeWidth={1.5 + inf * 5}
                  strokeLinecap="round"
                  filter="url(#fcat-beam-glow)"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: [0, 0.85, absorption > 0.5 ? 0.15 : 0.65], pathLength: 1 }}
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

          {/* ─── HUMAN FIGURE — multi-part anatomy ─── */}
          <g style={{ filter: `drop-shadow(0 0 ${glowSize}px ${dominant}${climax > 0.5 ? 'b0' : '60'})` }}>
            {/* Head */}
            <path d={HEAD} fill="url(#fcat-body-fill)" stroke={dominant} strokeWidth={0.6 + climax * 0.5} strokeOpacity={strokeOp} strokeLinejoin="round" />
            {/* Neck */}
            <path d={NECK} fill="none" stroke={dominant} strokeWidth={0.5} strokeOpacity={strokeOp * 0.8} />
            {/* Torso */}
            <path d={TORSO} fill="url(#fcat-body-fill)" stroke={dominant} strokeWidth={0.6 + climax * 0.4} strokeOpacity={strokeOp} strokeLinejoin="round" />
            {/* Arms */}
            <path d={LEFT_ARM} fill="none" stroke={dominant} strokeWidth={0.7 + climax * 0.3} strokeOpacity={strokeOp} strokeLinecap="round" strokeLinejoin="round" />
            <path d={RIGHT_ARM} fill="none" stroke={dominant} strokeWidth={0.7 + climax * 0.3} strokeOpacity={strokeOp} strokeLinecap="round" strokeLinejoin="round" />
            {/* Legs */}
            <path d={LEFT_LEG} fill="none" stroke={dominant} strokeWidth={0.7 + climax * 0.3} strokeOpacity={strokeOp} strokeLinecap="round" strokeLinejoin="round" />
            <path d={RIGHT_LEG} fill="none" stroke={dominant} strokeWidth={0.7 + climax * 0.3} strokeOpacity={strokeOp} strokeLinecap="round" strokeLinejoin="round" />

            {/* White secondary outline for depth */}
            <path d={HEAD} fill="none" stroke="#fff" strokeWidth={0.2} strokeOpacity={0.06 + absorption * 0.06 + climax * 0.1} />
            <path d={TORSO} fill="none" stroke="#fff" strokeWidth={0.2} strokeOpacity={0.06 + absorption * 0.06 + climax * 0.1} />
          </g>

          {/* ─── Internal energy meridians ─── */}
          {absorption > 0 && (
            <g>
              {/* Spine */}
              <motion.path
                d={SPINE} fill="none" stroke={dominant} strokeWidth={1.5}
                strokeLinecap="round" filter="url(#fcat-body-glow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: absorption, opacity: absorption * 0.6 }}
                transition={{ duration: 1.5 }}
              />
              {/* Branch meridians */}
              {[MERIDIAN_LEFT, MERIDIAN_RIGHT, MERIDIAN_DOWN_L, MERIDIAN_DOWN_R].map((d, i) => (
                <motion.path
                  key={`mer-${i}`} d={d} fill="none" stroke={secondary}
                  strokeWidth={0.8} strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: absorption, opacity: absorption * 0.4 }}
                  transition={{ duration: 1.2, delay: 0.3 + i * 0.15 }}
                />
              ))}

              {/* Chakra points */}
              {CHAKRAS.map((ck, ci) => (
                <motion.circle
                  key={`ck-${ci}`} cx={CX} cy={ck.cy} fill={ck.color}
                  filter="url(#fcat-body-glow)"
                  initial={{ r: 0, opacity: 0 }}
                  animate={{
                    r: [0, 4 + absorption * 3, 3 + absorption * 2],
                    opacity: [0, absorption * 0.7, absorption * 0.5],
                  }}
                  transition={{ duration: 1, delay: ci * 0.12 + 0.5 }}
                />
              ))}

              {/* Pulse rings from chest */}
              {[0, 1, 2].map(ring => (
                <motion.circle
                  key={`pulse-${ring}`} cx={CX} cy={CHEST_Y}
                  fill="none" stroke={dominant} strokeWidth={0.8}
                  initial={{ r: 5, opacity: 0 }}
                  animate={{ r: [5, 40 + ring * 18, 60 + ring * 20], opacity: [0.4 * absorption, 0.2 * absorption, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: ring * 0.7, ease: "easeOut" }}
                />
              ))}
            </g>
          )}

          {/* ─── Climax: mega inner light ─── */}
          {climax > 0 && (
            <g>
              <motion.circle
                cx={CX} cy={CORE_Y} fill="url(#fcat-climax-rad)" filter="url(#fcat-climax-mega)"
                animate={{ r: [35 + climax * 35, 50 + climax * 60, 35 + climax * 45] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.circle
                cx={CX} cy={CORE_Y} r={8 + climax * 16} fill="#fff"
                opacity={0.15 + climax * 0.5} filter="url(#fcat-body-glow)"
                animate={climax > 0.6 ? {
                  r: [8 + climax * 14, 8 + climax * 20, 8 + climax * 14],
                  opacity: [0.3 + climax * 0.25, 0.55 + climax * 0.35, 0.3 + climax * 0.25],
                } : undefined}
                transition={{ duration: 1.8, repeat: Infinity }}
              />

              {/* Chakras intensify during climax */}
              {CHAKRAS.map((ck, ci) => (
                <motion.circle
                  key={`ck-clx-${ci}`} cx={CX} cy={ck.cy}
                  fill={ck.color} filter="url(#fcat-body-glow)"
                  animate={{
                    r: [3 + climax * 2, 5 + climax * 4, 3 + climax * 2],
                    opacity: [climax * 0.4, climax * 0.8, climax * 0.4],
                  }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: ci * 0.1 }}
                />
              ))}

              {/* Energy rays from core */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => {
                const rad = (angle - 90) * (Math.PI / 180);
                const inner = 14;
                const outer = 35 + climax * 30;
                return (
                  <motion.line
                    key={`ray-${angle}`}
                    x1={CX + Math.cos(rad) * inner} y1={CORE_Y + Math.sin(rad) * inner}
                    x2={CX + Math.cos(rad) * outer} y2={CORE_Y + Math.sin(rad) * outer}
                    stroke={dominant} strokeWidth={1.5} strokeLinecap="round"
                    animate={{
                      opacity: [0.15 * climax, 0.6 * climax, 0.15 * climax],
                      x2: [CX + Math.cos(rad) * (outer - 10), CX + Math.cos(rad) * (outer + 6), CX + Math.cos(rad) * (outer - 10)],
                      y2: [CORE_Y + Math.sin(rad) * (outer - 10), CORE_Y + Math.sin(rad) * (outer + 6), CORE_Y + Math.sin(rad) * (outer - 10)],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: angle * 0.003 }}
                  />
                );
              })}
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
