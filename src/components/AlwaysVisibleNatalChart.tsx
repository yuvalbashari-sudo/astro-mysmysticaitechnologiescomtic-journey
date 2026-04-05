import { useState, useCallback, useEffect } from "react";
import type { NatalChartResult } from "@/lib/natalChart";

/* ── Constants ── */
const ZODIAC_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const size = sizeProp || 460;
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
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.92)",
        transition: "opacity 1.2s cubic-bezier(0.16,1,0.3,1), transform 1.2s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
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
            <stop offset="80%" stopColor="transparent" />
            <stop offset="92%" stopColor="rgba(212,175,55,0.06)" />
            <stop offset="100%" stopColor="rgba(212,175,55,0.02)" />
          </radialGradient>

          {/* Celestial ambient */}
          <radialGradient id="celestial-ambient" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="rgba(99,102,241,0.08)" />
            <stop offset="50%" stopColor="rgba(139,92,246,0.04)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Inner core glow */}
          <radialGradient id="inner-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(212,175,55,0.06)" />
            <stop offset="60%" stopColor="rgba(15,12,30,0.98)" />
            <stop offset="100%" stopColor="#0a0818" />
          </radialGradient>

          {/* Gold line glow filter */}
          <filter id="gold-ring-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Planet glow filter */}
          <filter id="planet-aura" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
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

          {/* Subtle star sparkle */}
          <filter id="sparkle">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* === BACKGROUND LAYERS === */}
        {/* Deep cosmic bg */}
        <circle cx={cx} cy={cy} r={outerR + 22} fill="url(#chart-bg-premium)" />
        {/* Celestial purple ambient */}
        <circle cx={cx} cy={cy} r={outerR + 22} fill="url(#celestial-ambient)" />
        {/* Outer glow aura */}
        <circle cx={cx} cy={cy} r={outerR + 22} fill="url(#outer-glow)" />
        {/* Outer border ring */}
        <circle cx={cx} cy={cy} r={outerR + 16} fill="none" stroke="rgba(212,175,55,0.08)" strokeWidth="0.5" />

        {/* === MAIN RINGS === */}
        {/* Outer gold ring with glow */}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(212,175,55,0.55)" strokeWidth="1.5" filter="url(#gold-ring-glow)" />
        {/* Secondary outer ring */}
        <circle cx={cx} cy={cy} r={outerR - 1} fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="0.5" />

        {/* House boundary ring */}
        <circle cx={cx} cy={cy} r={houseR} fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />

        {/* Inner circle with core glow */}
        <circle cx={cx} cy={cy} r={innerR} fill="url(#inner-core)" stroke="rgba(212,175,55,0.35)" strokeWidth="1" />

        {/* Decorative tick marks on outer ring */}
        {Array.from({ length: 72 }).map((_, i) => {
          const angle = asc + i * 5;
          const isMajor = i % 6 === 0;
          const tickLen = isMajor ? 5 : 2.5;
          const s = polar(cx, cy, outerR - tickLen, angle);
          const e = polar(cx, cy, outerR, angle);
          return (
            <line
              key={`tick-${i}`}
              x1={s.x} y1={s.y} x2={e.x} y2={e.y}
              stroke={isMajor ? "rgba(212,175,55,0.35)" : "rgba(212,175,55,0.12)"}
              strokeWidth={isMajor ? 0.8 : 0.4}
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
              {/* Subtle colored segment arc */}
              <path
                d={describeArc(cx, cy, outerR - 1, angle, angle + 30)}
                fill="none"
                stroke={`${ZODIAC_COLORS[i]}10`}
                strokeWidth={size * 0.07}
              />
              {/* House division line */}
              <line
                x1={lineStart.x} y1={lineStart.y}
                x2={lineEnd.x} y2={lineEnd.y}
                stroke={isCardinal ? "rgba(212,175,55,0.45)" : "rgba(212,175,55,0.15)"}
                strokeWidth={isCardinal ? 1.5 : 0.7}
                strokeDasharray={isCardinal ? "none" : "2 3"}
              />
              {/* Zodiac glyph */}
              <text
                x={zodiacPos.x} y={zodiacPos.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.05}
                fill={ZODIAC_COLORS[i]}
                style={{ opacity: 0.92 }}
                filter="url(#sparkle)"
              >
                {ZODIAC_GLYPHS[i]}
              </text>
              {/* House number */}
              <text
                x={housePos.x} y={housePos.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.02}
                fill="rgba(212,175,55,0.3)"
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
          const r = size * 0.03;

          return (
            <g
              key={planet.key}
              onMouseEnter={(e) => handlePlanetHover(e, planet)}
              onMouseLeave={handlePlanetLeave}
              style={{ cursor: "pointer" }}
            >
              {/* Outer aura */}
              <circle
                cx={pt.x} cy={pt.y} r={r + 6}
                fill={`${planet.color}08`}
                stroke="none"
              />
              {/* Hit area */}
              <circle
                cx={pt.x} cy={pt.y} r={r + 5}
                fill="transparent"
              />
              {/* Planet bg */}
              <circle
                cx={pt.x} cy={pt.y} r={r}
                fill="rgba(12,10,25,0.94)"
                stroke={planet.color}
                strokeWidth="1.5"
                filter="url(#planet-aura)"
              />
              {/* Planet symbol */}
              <text
                x={pt.x} y={pt.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.027}
                fill={planet.color}
                fontWeight="700"
              >
                {planet.symbol}
              </text>
              {/* Connector line to ring */}
              <line
                x1={pt.x} y1={pt.y}
                x2={polar(cx, cy, houseR + 2, deg).x}
                y2={polar(cx, cy, houseR + 2, deg).y}
                stroke={`${planet.color}20`}
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
            </g>
          );
        })}

        {/* === ASCENDANT MARKER === */}
        {(() => {
          const start = polar(cx, cy, outerR - 3, asc);
          const end = polar(cx, cy, outerR + 20, asc);
          const label = polar(cx, cy, outerR + 32, asc);
          // Arrow tip
          const tipAngle = (asc - 90) * (Math.PI / 180);
          const arrowLen = 6;
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
                stroke="#E85D5D" strokeWidth="2"
              />
              <polygon
                points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`}
                fill="#E85D5D"
              />
              <text
                x={label.x} y={label.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.024} fontWeight="700"
                fill="#E85D5D"
                fontFamily="'Cinzel', serif"
                letterSpacing="0.08em"
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
          fontSize={size * 0.03}
          fill="rgba(212,175,55,0.85)"
          fontWeight="700"
          fontFamily="'Cinzel', serif"
        >
          {chartData ? "מפת לידה" : "גלגל אסטרולוגי"}
        </text>
        {chartData?.sunSign && (
          <text
            x={cx} y={cy + size * 0.035}
            textAnchor="middle"
            fontSize={size * 0.018}
            fill="rgba(200,190,220,0.5)"
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
              cx={pt.x} cy={pt.y} r={0.6}
              fill="rgba(212,175,55,0.2)"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default AlwaysVisibleNatalChart;
