import { useState, useCallback, useEffect } from "react";
import type { NatalChartResult } from "@/lib/natalChart";

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

/* ── Constants ── */
const ZODIAC_ICONS = [ariesIcon, taurusIcon, geminiIcon, cancerIcon, leoIcon, virgoIcon, libraIcon, scorpioIcon, sagittariusIcon, capricornIcon, aquariusIcon, piscesIcon];
const ZODIAC_COLORS = [
  "#E85D5D", "#6ECB63", "#F0C040", "#6BB5E8", "#F5A623", "#6ECB63",
  "#E8A0BF", "#C75050", "#A855F7", "#7B8794", "#58C4DD", "#8B9DC3",
];

const PLANET_DEFS = [
  { key: "sun",     symbol: "☉", name: "שמש",     color: "#F5A623" },
  { key: "moon",    symbol: "☽", name: "ירח",     color: "#C4C4C4" },
  { key: "mercury", symbol: "☿", name: "מרקורי",  color: "#58C4DD" },
  { key: "venus",   symbol: "♀", name: "ונוס",    color: "#E8A0BF" },
  { key: "mars",    symbol: "♂", name: "מאדים",   color: "#E85D5D" },
  { key: "jupiter", symbol: "♃", name: "יופיטר",  color: "#A855F7" },
  { key: "saturn",  symbol: "♄", name: "שבתאי",   color: "#7B8794" },
  { key: "uranus",  symbol: "♅", name: "אורנוס",  color: "#38BDF8" },
  { key: "neptune", symbol: "♆", name: "נפטון",   color: "#6366F1" },
  { key: "pluto",   symbol: "♇", name: "פלוטו",   color: "#8B5CF6" },
] as const;

const FALLBACK_POSITIONS: Record<string, number> = {
  sun: 42, moon: 118, mercury: 56, venus: 82, mars: 196,
  jupiter: 248, saturn: 286, uranus: 312, neptune: 328, pluto: 264,
};
const DEFAULT_ASC = 18;

/* ── Geometry helpers ── */
const normalizeAngle = (a: number) => ((a % 360) + 360) % 360;

const polar = (cx: number, cy: number, r: number, angle: number) => {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const describeArc = (cx: number, cy: number, r: number, start: number, end: number) => {
  const s = polar(cx, cy, r, end);
  const e = polar(cx, cy, r, start);
  const large = end - start <= 180 ? "0" : "1";
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
};

/* ── Sign name helper ── */
const SIGN_NAMES_HE = ["טלה", "שור", "תאומים", "סרטן", "אריה", "בתולה", "מאזניים", "עקרב", "קשת", "גדי", "דלי", "דגים"];
const signFromDeg = (deg: number) => SIGN_NAMES_HE[Math.floor(normalizeAngle(deg) / 30)];
const degInSign = (deg: number) => Math.round(normalizeAngle(deg) % 30);

/* ── Props ── */
interface Props {
  chartData?: NatalChartResult | null;
  size?: number;
}

const AlwaysVisibleNatalChart = ({ chartData, size: sizeProp }: Props) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 80);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const size = sizeProp || 590;
  const cx = size / 2;
  const cy = size / 2;

  // Expanded ring system for more depth
  const outerR     = size * 0.46;
  const engravingR = size * 0.42;
  const zodiacR    = size * 0.37;
  const houseR     = size * 0.28;
  const planetR    = size * 0.215;
  const innerR     = size * 0.12;

  const asc = chartData?.ascendantAngle != null ? normalizeAngle(chartData.ascendantAngle) : DEFAULT_ASC;

  const positions: Record<string, number> = {};
  for (const p of PLANET_DEFS) {
    const raw = chartData?.planetPositions?.[p.key];
    positions[p.key] = raw != null && Number.isFinite(raw) ? normalizeAngle(raw) : FALLBACK_POSITIONS[p.key];
  }

  const handlePlanetHover = useCallback((e: React.MouseEvent<SVGGElement>, planet: typeof PLANET_DEFS[number]) => {
    const deg = positions[planet.key];
    setTooltip({
      x: e.clientX,
      y: e.clientY,
      text: `${planet.symbol} ${planet.name} — ${signFromDeg(deg)} ${degInSign(deg)}°`,
    });
  }, [positions]);

  const handlePlanetLeave = useCallback(() => setTooltip(null), []);

  return (
    <div
      className="w-full"
      style={{
        minHeight: Math.min(size + 20, 420),
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "visible",
        paddingTop: "clamp(8px, 2vw, 16px)",
        marginBottom: "clamp(8px, 2vw, 20px)",
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1
          ? "scale(1) rotate(0deg)"
          : "scale(0.82) rotate(-12deg)",
        transition: "opacity 1.4s cubic-bezier(0.16,1,0.3,1), transform 1.6s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* Multi-layer ambient aura */}
      <div
        style={{
          position: "absolute",
          inset: "-22%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, rgba(139,92,246,0.08) 25%, rgba(99,102,241,0.04) 45%, transparent 65%)",
          opacity: phase >= 2 ? 1 : 0,
          transition: "opacity 2s ease-out",
          pointerEvents: "none",
          animation: phase >= 3 ? "chartBreathing 8s ease-in-out infinite" : "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "-12%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 50%)",
          opacity: phase >= 3 ? 1 : 0,
          transition: "opacity 2.5s ease-out",
          pointerEvents: "none",
          animation: phase >= 3 ? "chartPulseGlow 5s ease-in-out infinite" : "none",
        }}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="font-body"
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y - 52,
            transform: "translateX(-50%)",
            zIndex: 300,
            pointerEvents: "none",
            padding: "12px 20px",
            borderRadius: 14,
            fontSize: 14,
            fontWeight: 600,
            color: "#F5D98E",
            background: "linear-gradient(145deg, rgba(12,10,28,0.97), rgba(22,18,45,0.97))",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(212,175,55,0.4)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.7), 0 0 24px rgba(212,175,55,0.12), inset 0 1px 0 rgba(245,214,142,0.08)",
            whiteSpace: "nowrap",
            letterSpacing: "0.03em",
          }}
        >
          {tooltip.text}
        </div>
      )}

      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        role="img"
        aria-label="גלגל מפת לידה אסטרולוגית"
        style={{
          display: "block",
          width: "100%",
          maxWidth: size,
          height: "auto",
          minHeight: Math.min(size, 400),
          overflow: "visible",
        }}
      >
        <defs>
          {/* Deep cosmic background */}
          <radialGradient id="chart-bg-premium" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#1e1845" />
            <stop offset="30%" stopColor="#12102a" />
            <stop offset="65%" stopColor="#0a0820" />
            <stop offset="100%" stopColor="#060510" />
          </radialGradient>

          {/* Multi-layer outer aura */}
          <radialGradient id="outer-aura-1" cx="50%" cy="50%" r="52%">
            <stop offset="75%" stopColor="transparent" />
            <stop offset="88%" stopColor="rgba(212,175,55,0.06)" />
            <stop offset="94%" stopColor="rgba(139,92,246,0.05)" />
            <stop offset="100%" stopColor="rgba(212,175,55,0.02)" />
          </radialGradient>
          <radialGradient id="outer-aura-2" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(99,102,241,0.07)" />
            <stop offset="40%" stopColor="rgba(139,92,246,0.03)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Inner core - deep cosmic energy */}
          <radialGradient id="inner-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(212,175,55,0.22)" />
            <stop offset="20%" stopColor="rgba(245,214,142,0.12)" />
            <stop offset="40%" stopColor="rgba(139,92,246,0.1)" />
            <stop offset="70%" stopColor="rgba(15,12,30,0.98)" />
            <stop offset="100%" stopColor="#0a0818" />
          </radialGradient>

          {/* Pulsing center energy */}
          <radialGradient id="center-energy-1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245,214,142,0.28)">
              <animate attributeName="stop-opacity" values="0.18;0.35;0.18" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="30%" stopColor="rgba(212,175,55,0.15)" />
            <stop offset="60%" stopColor="rgba(139,92,246,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="center-energy-2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,235,180,0.15)">
              <animate attributeName="stop-opacity" values="0.08;0.2;0.08" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="40%" stopColor="rgba(212,175,55,0.06)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Gold shimmer for outer ring */}
          <linearGradient id="gold-shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(212,175,55,0.85)">
              <animate attributeName="stop-opacity" values="0.6;0.95;0.6" dur="5s" repeatCount="indefinite" />
            </stop>
            <stop offset="33%" stopColor="rgba(245,230,180,1)">
              <animate attributeName="stop-opacity" values="0.8;1;0.8" dur="5s" repeatCount="indefinite" />
            </stop>
            <stop offset="66%" stopColor="rgba(200,160,40,0.85)" />
            <stop offset="100%" stopColor="rgba(245,214,142,0.9)">
              <animate attributeName="stop-opacity" values="0.7;0.95;0.7" dur="5s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          {/* Secondary gold for inner accents */}
          <linearGradient id="gold-accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(212,175,55,0.5)" />
            <stop offset="50%" stopColor="rgba(245,214,142,0.7)" />
            <stop offset="100%" stopColor="rgba(212,175,55,0.5)" />
          </linearGradient>

          {/* Filters */}
          <filter id="gold-ring-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur1" />
            <feGaussianBlur stdDeviation="8" result="blur2" in="SourceGraphic" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="planet-aura" x="-90%" y="-90%" width="280%" height="280%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="planet-aura-strong" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="asc-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="zodiac-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="engraving-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="center-core-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ═══ BACKGROUND LAYERS ═══ */}
        <circle cx={cx} cy={cy} r={outerR + 30} fill="url(#chart-bg-premium)" />
        <circle cx={cx} cy={cy} r={outerR + 30} fill="url(#outer-aura-2)" />
        <circle cx={cx} cy={cy} r={outerR + 30} fill="url(#outer-aura-1)" />

        {/* Outer mist ring */}
        <circle cx={cx} cy={cy} r={outerR + 22} fill="none" stroke="rgba(139,92,246,0.04)" strokeWidth="12">
          <animate attributeName="stroke-opacity" values="0.02;0.06;0.02" dur="7s" repeatCount="indefinite" />
        </circle>
        <circle cx={cx} cy={cy} r={outerR + 16} fill="none" stroke="rgba(212,175,55,0.03)" strokeWidth="1" />

        {/* ═══ PRESTIGIOUS OUTER RING SYSTEM ═══ */}
        {/* Double outer ring with gold glow */}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="url(#gold-shimmer)" strokeWidth="2.2" filter="url(#gold-ring-glow)" />
        <circle cx={cx} cy={cy} r={outerR - 2} fill="none" stroke="rgba(245,214,142,0.12)" strokeWidth="0.5" />

        {/* Engraving ring — celestial filigree feel */}
        <circle cx={cx} cy={cy} r={engravingR} fill="none" stroke="rgba(212,175,55,0.2)" strokeWidth="0.6" filter="url(#engraving-glow)" />

        {/* Fine engraving tick marks between outer and zodiac rings */}
        {Array.from({ length: 360 }).map((_, i) => {
          if (i % 1 !== 0) return null;
          const angle = asc + i;
          const isMajor = i % 30 === 0;
          const isMid = i % 10 === 0;
          const isMinor = i % 5 === 0;
          if (!isMajor && !isMid && !isMinor) return null;
          const startR = isMajor ? outerR - 8 : isMid ? outerR - 5 : outerR - 3;
          const s = polar(cx, cy, startR, angle);
          const e = polar(cx, cy, outerR, angle);
          return (
            <line
              key={`eng-${i}`}
              x1={s.x} y1={s.y} x2={e.x} y2={e.y}
              stroke={isMajor ? "rgba(212,175,55,0.55)" : isMid ? "rgba(212,175,55,0.2)" : "rgba(212,175,55,0.08)"}
              strokeWidth={isMajor ? 1.2 : isMid ? 0.6 : 0.3}
            />
          );
        })}

        {/* House boundary ring */}
        <circle cx={cx} cy={cy} r={houseR} fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="0.8" />
        <circle cx={cx} cy={cy} r={houseR + 1} fill="none" stroke="rgba(212,175,55,0.08)" strokeWidth="0.3" />

        {/* ═══ LIVING CENTER CORE ═══ */}
        {/* Outer energy corona */}
        <circle cx={cx} cy={cy} r={innerR + 18} fill="none" stroke="rgba(212,175,55,0.04)" strokeWidth="6" filter="url(#center-core-glow)">
          <animate attributeName="stroke-opacity" values="0.02;0.06;0.02" dur="5s" repeatCount="indefinite" />
        </circle>
        {/* Deep cosmic pulse layer */}
        <circle cx={cx} cy={cy} r={innerR + 10} fill="url(#center-energy-2)" stroke="none">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="7s" repeatCount="indefinite" />
        </circle>
        {/* Primary energy pulse */}
        <circle cx={cx} cy={cy} r={innerR + 5} fill="url(#center-energy-1)" stroke="none">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="4.5s" repeatCount="indefinite" />
        </circle>
        {/* Inner core sphere */}
        <circle cx={cx} cy={cy} r={innerR} fill="url(#inner-core)" stroke="url(#gold-accent)" strokeWidth="1.5" />
        {/* Inner shimmer ring */}
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(245,214,142,0.15)" strokeWidth="0.6">
          <animate attributeName="stroke-opacity" values="0.08;0.22;0.08" dur="3.5s" repeatCount="indefinite" />
        </circle>
        {/* Inner glow ring */}
        <circle cx={cx} cy={cy} r={innerR - 2} fill="none" stroke="rgba(212,175,55,0.08)" strokeWidth="0.4">
          <animate attributeName="stroke-opacity" values="0.04;0.12;0.04" dur="5s" repeatCount="indefinite" />
        </circle>

        {/* Decorative dots around inner circle */}
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = i * 10;
          const pt = polar(cx, cy, innerR + 2.5, angle);
          return (
            <circle key={`dot-${i}`} cx={pt.x} cy={pt.y} r={i % 3 === 0 ? 1 : 0.6}
              fill="rgba(212,175,55,0.35)"
            >
              <animate attributeName="opacity" values="0.12;0.45;0.12" dur={`${3.5 + (i % 7) * 0.3}s`} repeatCount="indefinite" />
            </circle>
          );
        })}

        {/* ═══ ZODIAC SEGMENTS + HOUSE LINES ═══ */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = asc + i * 30;
          const lineStart = polar(cx, cy, houseR, angle);
          const lineEnd = polar(cx, cy, outerR, angle);
          const zodiacPos = polar(cx, cy, zodiacR, angle + 15);
          const housePos = polar(cx, cy, houseR - (size * 0.05), angle + 15);
          const isCardinal = i % 3 === 0;

          return (
            <g key={i}>
              {/* Colored segment arc — subtle but present */}
              <path
                d={describeArc(cx, cy, (outerR + engravingR) / 2, angle, angle + 30)}
                fill="none"
                stroke={`${ZODIAC_COLORS[i]}15`}
                strokeWidth={size * 0.06}
              />
              {/* Sign accent glow on segment */}
              <path
                d={describeArc(cx, cy, engravingR + 2, angle + 5, angle + 25)}
                fill="none"
                stroke={`${ZODIAC_COLORS[i]}08`}
                strokeWidth={size * 0.02}
              />
              {/* House division line */}
              <line
                x1={lineStart.x} y1={lineStart.y}
                x2={lineEnd.x} y2={lineEnd.y}
                stroke={isCardinal ? "rgba(212,175,55,0.55)" : "rgba(212,175,55,0.15)"}
                strokeWidth={isCardinal ? 1.8 : 0.6}
                strokeDasharray={isCardinal ? "none" : "3 4"}
              />
              {/* Cardinal cross glow */}
              {isCardinal && (
                <line
                  x1={lineStart.x} y1={lineStart.y}
                  x2={lineEnd.x} y2={lineEnd.y}
                  stroke="rgba(212,175,55,0.08)"
                  strokeWidth="5"
                />
              )}
              {/* Zodiac icon */}
              {(() => {
                const iconSize = size * 0.082;
                return (
                  <image
                    href={ZODIAC_ICONS[i]}
                    x={zodiacPos.x - iconSize / 2}
                    y={zodiacPos.y - iconSize / 2}
                    width={iconSize}
                    height={iconSize}
                    filter="url(#zodiac-glow)"
                    style={{ opacity: 0.95 }}
                  />
                );
              })()}
              {/* House number — refined typography */}
              <text
                x={housePos.x} y={housePos.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.022}
                fill="rgba(212,175,55,0.3)"
                fontWeight="600"
                fontFamily="'Cinzel', serif"
                letterSpacing="0.05em"
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* ═══ PLANET CONNECTOR WEB ═══ */}
        {/* Subtle aspect-like lines between Sun/Moon and ASC */}
        {(() => {
          const sunPt = polar(cx, cy, planetR, positions.sun + asc);
          const moonPt = polar(cx, cy, planetR, positions.moon + asc);
          return (
            <>
              <line x1={sunPt.x} y1={sunPt.y} x2={cx} y2={cy}
                stroke="rgba(245,166,35,0.05)" strokeWidth="0.8" strokeDasharray="3 5"
              >
                <animate attributeName="stroke-opacity" values="0.02;0.07;0.02" dur="6s" repeatCount="indefinite" />
              </line>
              <line x1={moonPt.x} y1={moonPt.y} x2={cx} y2={cy}
                stroke="rgba(196,196,196,0.04)" strokeWidth="0.8" strokeDasharray="3 5"
              >
                <animate attributeName="stroke-opacity" values="0.02;0.06;0.02" dur="7s" repeatCount="indefinite" />
              </line>
            </>
          );
        })()}

        {/* ═══ PLANETS ═══ */}
        {PLANET_DEFS.map((planet) => {
          const deg = positions[planet.key] + asc;
          const pt = polar(cx, cy, planetR, deg);
          const r = size * 0.038;
          const isEmphasis = planet.key === "sun" || planet.key === "moon";
          const isAsc = planet.key === "sun"; // Sun gets extra presence

          return (
            <g
              key={planet.key}
              onMouseEnter={(e) => handlePlanetHover(e, planet)}
              onMouseLeave={handlePlanetLeave}
              style={{ cursor: "pointer" }}
            >
              {/* Outer ambient aura */}
              <circle
                cx={pt.x} cy={pt.y} r={r + (isEmphasis ? 13 : 8)}
                fill={`${planet.color}${isEmphasis ? "0d" : "06"}`}
                stroke="none"
              >
                {isEmphasis && (
                  <animate attributeName="r" values={`${r + 10};${r + 16};${r + 10}`} dur="4s" repeatCount="indefinite" />
                )}
              </circle>
              {/* Hit area */}
              <circle cx={pt.x} cy={pt.y} r={r + 6} fill="transparent" />
              {/* Planet background sphere */}
              <circle
                cx={pt.x} cy={pt.y} r={r}
                fill="rgba(10,8,22,0.96)"
                stroke={planet.color}
                strokeWidth={isEmphasis ? 2.2 : 1.5}
                filter={isEmphasis ? "url(#planet-aura-strong)" : "url(#planet-aura)"}
              />
              {/* Inner glow circle */}
              {isEmphasis && (
                <circle
                  cx={pt.x} cy={pt.y} r={r - 3}
                  fill="none"
                  stroke={`${planet.color}18`}
                  strokeWidth="0.8"
                />
              )}
              {/* Planet symbol */}
              <text
                x={pt.x} y={pt.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * (isEmphasis ? 0.038 : 0.032)}
                fill={planet.color}
                fontWeight="700"
              >
                {planet.symbol}
              </text>
              {/* Connector line to house ring */}
              <line
                x1={pt.x} y1={pt.y}
                x2={polar(cx, cy, houseR + 2, deg).x}
                y2={polar(cx, cy, houseR + 2, deg).y}
                stroke={`${planet.color}${isEmphasis ? "18" : "10"}`}
                strokeWidth={isEmphasis ? 0.7 : 0.4}
                strokeDasharray="2 3"
              />
            </g>
          );
        })}

        {/* ═══ ASCENDANT MARKER ═══ */}
        {(() => {
          const start = polar(cx, cy, outerR - 3, asc);
          const end = polar(cx, cy, outerR + 24, asc);
          const label = polar(cx, cy, outerR + 38, asc);
          const tipAngle = (asc - 90) * (Math.PI / 180);
          const arrowLen = 8;
          const tip = { x: end.x, y: end.y };
          const left = {
            x: tip.x - arrowLen * Math.cos(tipAngle - 0.35),
            y: tip.y - arrowLen * Math.sin(tipAngle - 0.35),
          };
          const right = {
            x: tip.x - arrowLen * Math.cos(tipAngle + 0.35),
            y: tip.y - arrowLen * Math.sin(tipAngle + 0.35),
          };

          return (
            <g filter="url(#asc-glow)">
              {/* Energy line from ASC to center */}
              <line
                x1={start.x} y1={start.y} x2={cx} y2={cy}
                stroke="rgba(232,93,93,0.06)" strokeWidth="1.2"
                strokeDasharray="4 6"
              >
                <animate attributeName="stroke-opacity" values="0.03;0.09;0.03" dur="4.5s" repeatCount="indefinite" />
              </line>
              {/* Wide glow line */}
              <line
                x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                stroke="rgba(232,93,93,0.1)" strokeWidth="8"
              />
              {/* Main ASC line */}
              <line
                x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                stroke="rgba(232,93,93,0.8)" strokeWidth="2"
              />
              <polygon
                points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`}
                fill="rgba(232,93,93,0.9)"
              />
              {/* ASC pulsing dot */}
              <circle cx={end.x} cy={end.y} r="3.5" fill="rgba(232,93,93,0.3)">
                <animate attributeName="r" values="2.5;5;2.5" dur="3.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0.55;0.2" dur="3.5s" repeatCount="indefinite" />
              </circle>
              <text
                x={label.x} y={label.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.026} fontWeight="800"
                fill="rgba(232,93,93,0.9)"
                fontFamily="'Cinzel', serif"
                letterSpacing="0.15em"
              >
                ASC
              </text>
            </g>
          );
        })()}

        {/* ═══ CENTER LABELS ═══ */}
        <text
          x={cx} y={cy - 8}
          textAnchor="middle"
          fontSize={size * 0.038}
          fill="rgba(212,175,55,0.92)"
          fontWeight="700"
          fontFamily="'Cinzel', serif"
          letterSpacing="0.06em"
        >
          {chartData ? "מפת לידה" : "גלגל אסטרולוגי"}
        </text>
        {chartData?.sunSign && (
          <text
            x={cx} y={cy + size * 0.038}
            textAnchor="middle"
            fontSize={size * 0.02}
            fill="rgba(200,190,220,0.5)"
            fontFamily="'Heebo', sans-serif"
            letterSpacing="0.02em"
          >
            {chartData.sunSign.symbol} {chartData.sunSign.hebrewName} • {chartData.risingSign?.symbol} {chartData.risingSign?.hebrewName} עולה
          </text>
        )}

        {/* Slow rotating light sweep — luxurious motion */}
        <circle cx={cx} cy={cy} r={outerR - 5} fill="none"
          stroke="rgba(245,214,142,0.025)" strokeWidth="22"
          strokeDasharray={`${outerR * 0.4} ${outerR * 2.4}`}
        >
          <animateTransform attributeName="transform" type="rotate"
            from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`}
            dur="35s" repeatCount="indefinite" />
        </circle>
        {/* Second counter-rotating sweep for depth */}
        <circle cx={cx} cy={cy} r={houseR + 5} fill="none"
          stroke="rgba(139,92,246,0.015)" strokeWidth="12"
          strokeDasharray={`${houseR * 0.3} ${houseR * 3}`}
        >
          <animateTransform attributeName="transform" type="rotate"
            from={`360 ${cx} ${cy}`} to={`0 ${cx} ${cy}`}
            dur="50s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* CSS keyframes */}
      <style>{`
        @keyframes chartBreathing {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }
        @keyframes chartPulseGlow {
          0%, 100% { opacity: 0.3; transform: scale(0.98); }
          50% { opacity: 0.7; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
};

export default AlwaysVisibleNatalChart;
