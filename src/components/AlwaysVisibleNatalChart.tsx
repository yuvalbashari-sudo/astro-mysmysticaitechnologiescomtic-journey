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
  const [phase, setPhase] = useState(0); // 0=hidden, 1=fade, 2=full

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 60);
    const t2 = setTimeout(() => setPhase(2), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const size = sizeProp || 520;
  const cx = size / 2;
  const cy = size / 2;

  const outerR   = size * 0.44;
  const zodiacR  = size * 0.365;
  const houseR   = size * 0.28;
  const planetR  = size * 0.22;
  const innerR   = size * 0.13;

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

  // Sun/Moon for emphasis
  const sunDeg = positions.sun;
  const moonDeg = positions.moon;

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
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1
          ? "scale(1) rotate(0deg)"
          : "scale(0.88) rotate(-8deg)",
        transition: "opacity 1.6s cubic-bezier(0.16,1,0.3,1), transform 1.6s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* Ambient outer aura */}
      <div
        style={{
          position: "absolute",
          inset: "-15%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, rgba(212,175,55,0.04) 40%, transparent 70%)",
          opacity: phase >= 2 ? 1 : 0,
          transition: "opacity 2s ease-out",
          pointerEvents: "none",
          animation: phase >= 2 ? "chartBreathing 6s ease-in-out infinite" : "none",
        }}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="font-body"
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y - 48,
            transform: "translateX(-50%)",
            zIndex: 300,
            pointerEvents: "none",
            padding: "10px 18px",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            color: "#F5D98E",
            background: "linear-gradient(135deg, rgba(15,12,30,0.96), rgba(25,20,50,0.96))",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(212,175,55,0.35)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(212,175,55,0.15)",
            whiteSpace: "nowrap",
            letterSpacing: "0.02em",
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
          {/* Background gradient */}
          <radialGradient id="chart-bg-premium" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#1a1535" />
            <stop offset="45%" stopColor="#0f0c1e" />
            <stop offset="100%" stopColor="#080614" />
          </radialGradient>

          {/* Outer glow */}
          <radialGradient id="outer-glow" cx="50%" cy="50%" r="50%">
            <stop offset="78%" stopColor="transparent" />
            <stop offset="90%" stopColor="rgba(212,175,55,0.07)" />
            <stop offset="96%" stopColor="rgba(139,92,246,0.05)" />
            <stop offset="100%" stopColor="rgba(212,175,55,0.02)" />
          </radialGradient>

          {/* Celestial ambient */}
          <radialGradient id="celestial-ambient" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="rgba(99,102,241,0.1)" />
            <stop offset="50%" stopColor="rgba(139,92,246,0.05)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Inner core glow */}
          <radialGradient id="inner-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(212,175,55,0.08)" />
            <stop offset="60%" stopColor="rgba(15,12,30,0.98)" />
            <stop offset="100%" stopColor="#0a0818" />
          </radialGradient>

          {/* Gold shimmer gradient for outer ring */}
          <linearGradient id="gold-shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(212,175,55,0.7)">
              <animate attributeName="stop-opacity" values="0.5;0.8;0.5" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="rgba(245,214,142,0.9)">
              <animate attributeName="stop-opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="rgba(212,175,55,0.7)">
              <animate attributeName="stop-opacity" values="0.5;0.8;0.5" dur="4s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          {/* Gold line glow filter */}
          <filter id="gold-ring-glow" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Planet glow filter */}
          <filter id="planet-aura" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Strong planet glow for Sun/Moon */}
          <filter id="planet-aura-strong" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Ascendant glow */}
          <filter id="asc-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Sparkle */}
          <filter id="sparkle">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Zodiac glyph enhanced glow */}
          <filter id="zodiac-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* === BACKGROUND LAYERS === */}
        <circle cx={cx} cy={cy} r={outerR + 26} fill="url(#chart-bg-premium)" />
        <circle cx={cx} cy={cy} r={outerR + 26} fill="url(#celestial-ambient)" />
        <circle cx={cx} cy={cy} r={outerR + 26} fill="url(#outer-glow)" />

        {/* Pulsing outer aura ring */}
        <circle cx={cx} cy={cy} r={outerR + 18} fill="none" stroke="rgba(139,92,246,0.06)" strokeWidth="8">
          <animate attributeName="stroke-opacity" values="0.03;0.08;0.03" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle cx={cx} cy={cy} r={outerR + 12} fill="none" stroke="rgba(212,175,55,0.04)" strokeWidth="0.5" />

        {/* === MAIN RINGS === */}
        {/* Primary outer gold ring with shimmer */}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="url(#gold-shimmer)" strokeWidth="1.8" filter="url(#gold-ring-glow)" />
        {/* Inner accent ring */}
        <circle cx={cx} cy={cy} r={outerR - 1.5} fill="none" stroke="rgba(212,175,55,0.1)" strokeWidth="0.4" />

        {/* House boundary ring */}
        <circle cx={cx} cy={cy} r={houseR} fill="none" stroke="rgba(212,175,55,0.35)" strokeWidth="1" />

        {/* Inner circle with core glow */}
        <circle cx={cx} cy={cy} r={innerR} fill="url(#inner-core)" stroke="rgba(212,175,55,0.4)" strokeWidth="1.2" />

        {/* Decorative tick marks */}
        {Array.from({ length: 72 }).map((_, i) => {
          const angle = asc + i * 5;
          const isMajor = i % 6 === 0;
          const tickLen = isMajor ? 6 : 2.5;
          const s = polar(cx, cy, outerR - tickLen, angle);
          const e = polar(cx, cy, outerR, angle);
          return (
            <line
              key={`tick-${i}`}
              x1={s.x} y1={s.y} x2={e.x} y2={e.y}
              stroke={isMajor ? "rgba(212,175,55,0.45)" : "rgba(212,175,55,0.12)"}
              strokeWidth={isMajor ? 0.9 : 0.4}
            />
          );
        })}

        {/* === ZODIAC SEGMENTS + HOUSE LINES === */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = asc + i * 30;
          const lineStart = polar(cx, cy, houseR, angle);
          const lineEnd = polar(cx, cy, outerR, angle);
          const zodiacPos = polar(cx, cy, zodiacR, angle + 15);
          const housePos = polar(cx, cy, houseR - (size * 0.055), angle + 15);
          const isCardinal = i % 3 === 0;

          return (
            <g key={i}>
              {/* Colored segment arc */}
              <path
                d={describeArc(cx, cy, outerR - 1, angle, angle + 30)}
                fill="none"
                stroke={`${ZODIAC_COLORS[i]}12`}
                strokeWidth={size * 0.07}
              />
              {/* House division line */}
              <line
                x1={lineStart.x} y1={lineStart.y}
                x2={lineEnd.x} y2={lineEnd.y}
                stroke={isCardinal ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.18)"}
                strokeWidth={isCardinal ? 1.6 : 0.7}
                strokeDasharray={isCardinal ? "none" : "2 3"}
              />
              {/* Zodiac icon (matching hero style) */}
              {(() => {
                const iconSize = size * 0.078;
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
              {/* House number */}
              <text
                x={housePos.x} y={housePos.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.024}
                fill="rgba(212,175,55,0.35)"
                fontWeight="500"
                fontFamily="'Cinzel', serif"
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* === PLANETS === */}
        {PLANET_DEFS.map((planet) => {
          const deg = positions[planet.key] + asc;
          const pt = polar(cx, cy, planetR, deg);
          const r = size * 0.036;
          const isEmphasis = planet.key === "sun" || planet.key === "moon";

          return (
            <g
              key={planet.key}
              onMouseEnter={(e) => handlePlanetHover(e, planet)}
              onMouseLeave={handlePlanetLeave}
              style={{ cursor: "pointer" }}
            >
              {/* Outer ambient aura */}
              <circle
                cx={pt.x} cy={pt.y} r={r + (isEmphasis ? 10 : 7)}
                fill={`${planet.color}${isEmphasis ? "0c" : "06"}`}
                stroke="none"
              >
                {isEmphasis && (
                  <animate attributeName="r" values={`${r + 8};${r + 12};${r + 8}`} dur="3s" repeatCount="indefinite" />
                )}
              </circle>
              {/* Hit area */}
              <circle cx={pt.x} cy={pt.y} r={r + 5} fill="transparent" />
              {/* Planet bg */}
              <circle
                cx={pt.x} cy={pt.y} r={r}
                fill="rgba(12,10,25,0.95)"
                stroke={planet.color}
                strokeWidth={isEmphasis ? 2 : 1.5}
                filter={isEmphasis ? "url(#planet-aura-strong)" : "url(#planet-aura)"}
              />
              {/* Planet symbol */}
              <text
                x={pt.x} y={pt.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * (isEmphasis ? 0.036 : 0.031)}
                fill={planet.color}
                fontWeight="700"
              >
                {planet.symbol}
              </text>
              {/* Connector line */}
              <line
                x1={pt.x} y1={pt.y}
                x2={polar(cx, cy, houseR + 2, deg).x}
                y2={polar(cx, cy, houseR + 2, deg).y}
                stroke={`${planet.color}22`}
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
            </g>
          );
        })}

        {/* === ASCENDANT MARKER === */}
        {(() => {
          const start = polar(cx, cy, outerR - 3, asc);
          const end = polar(cx, cy, outerR + 22, asc);
          const label = polar(cx, cy, outerR + 34, asc);
          const tipAngle = (asc - 90) * (Math.PI / 180);
          const arrowLen = 7;
          const tip = { x: end.x, y: end.y };
          const left = {
            x: tip.x - arrowLen * Math.cos(tipAngle - 0.4),
            y: tip.y - arrowLen * Math.sin(tipAngle - 0.4),
          };
          const right = {
            x: tip.x - arrowLen * Math.cos(tipAngle + 0.4),
            y: tip.y - arrowLen * Math.sin(tipAngle + 0.4),
          };

          return (
            <g filter="url(#asc-glow)">
              <line
                x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                stroke="#E85D5D" strokeWidth="2.2"
              />
              <polygon
                points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`}
                fill="#E85D5D"
              />
              <text
                x={label.x} y={label.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.028} fontWeight="700"
                fill="#E85D5D"
                fontFamily="'Cinzel', serif"
                letterSpacing="0.1em"
              >
                ASC
              </text>
            </g>
          );
        })()}

        {/* === CENTER LABEL === */}
        <text
          x={cx} y={cy - 6}
          textAnchor="middle"
          fontSize={size * 0.036}
          fill="rgba(212,175,55,0.9)"
          fontWeight="700"
          fontFamily="'Cinzel', serif"
        >
          {chartData ? "מפת לידה" : "גלגל אסטרולוגי"}
        </text>
        {chartData?.sunSign && (
          <text
            x={cx} y={cy + size * 0.035}
            textAnchor="middle"
            fontSize={size * 0.019}
            fill="rgba(200,190,220,0.55)"
            fontFamily="'Heebo', sans-serif"
          >
            {chartData.sunSign.symbol} {chartData.sunSign.hebrewName} • {chartData.risingSign?.symbol} {chartData.risingSign?.hebrewName} עולה
          </text>
        )}

        {/* Decorative dots around inner circle */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = i * 15;
          const pt = polar(cx, cy, innerR + 2, angle);
          return (
            <circle
              key={`dot-${i}`}
              cx={pt.x} cy={pt.y} r={0.7}
              fill="rgba(212,175,55,0.25)"
            />
          );
        })}
      </svg>

      {/* CSS keyframes for breathing effect */}
      <style>{`
        @keyframes chartBreathing {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
};

export default AlwaysVisibleNatalChart;
