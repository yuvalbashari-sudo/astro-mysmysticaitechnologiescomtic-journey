import { useState, useCallback } from "react";
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

/* ── Sign name helper (from degree) ── */
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
      }}
    >
      {/* Tooltip */}
      {tooltip && (
        <div
          className="font-body"
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y - 44,
            transform: "translateX(-50%)",
            zIndex: 300,
            pointerEvents: "none",
            padding: "8px 16px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            color: "hsl(var(--gold))",
            background: "hsl(222 47% 7% / 0.92)",
            backdropFilter: "blur(12px)",
            border: "1px solid hsl(var(--gold) / 0.25)",
            boxShadow: "0 4px 20px hsl(222 47% 4% / 0.5)",
            whiteSpace: "nowrap",
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
          <radialGradient id="chart-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(222 47% 10%)" />
            <stop offset="100%" stopColor="hsl(222 47% 5%)" />
          </radialGradient>
          <filter id="gold-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="planet-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background */}
        <circle cx={cx} cy={cy} r={outerR + 14} fill="url(#chart-bg)" />
        <circle cx={cx} cy={cy} r={outerR + 14} fill="none" stroke="hsl(var(--gold) / 0.12)" strokeWidth="1" />

        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="hsl(var(--gold) / 0.5)" strokeWidth="1.5" filter="url(#gold-glow)" />
        {/* Zodiac / house boundary */}
        <circle cx={cx} cy={cy} r={houseR} fill="none" stroke="hsl(var(--gold) / 0.22)" strokeWidth="1" />
        {/* Inner circle */}
        <circle cx={cx} cy={cy} r={innerR} fill="hsl(222 47% 6% / 0.95)" stroke="hsl(var(--gold) / 0.3)" strokeWidth="1" />

        {/* Zodiac segments + house lines */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = asc + i * 30;
          const lineStart = polar(cx, cy, houseR, angle);
          const lineEnd = polar(cx, cy, outerR, angle);
          const zodiacPos = polar(cx, cy, zodiacR, angle + 15);
          const housePos = polar(cx, cy, houseR - (size * 0.06), angle + 15);
          const isCardinal = i % 3 === 0;

          return (
            <g key={i}>
              {/* Subtle segment fill */}
              <path
                d={describeArc(cx, cy, outerR - 1, angle, angle + 30)}
                fill="none"
                stroke={`${ZODIAC_COLORS[i]}15`}
                strokeWidth={size * 0.08}
              />
              {/* House line */}
              <line
                x1={lineStart.x} y1={lineStart.y}
                x2={lineEnd.x} y2={lineEnd.y}
                stroke={isCardinal ? "hsl(var(--gold) / 0.4)" : "hsl(var(--gold) / 0.15)"}
                strokeWidth={isCardinal ? 1.5 : 0.8}
              />
              {/* Zodiac glyph */}
              <text
                x={zodiacPos.x} y={zodiacPos.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.048}
                fill={ZODIAC_COLORS[i]}
                style={{ opacity: 0.9 }}
              >
                {ZODIAC_GLYPHS[i]}
              </text>
              {/* House number */}
              <text
                x={housePos.x} y={housePos.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.022}
                fill="hsl(var(--foreground) / 0.35)"
                fontWeight="500"
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* Planets */}
        {PLANET_DEFS.map((planet) => {
          const deg = positions[planet.key] + asc;
          const pt = polar(cx, cy, planetR, deg);
          const r = size * 0.028;

          return (
            <g
              key={planet.key}
              onMouseEnter={(e) => handlePlanetHover(e, planet)}
              onMouseLeave={handlePlanetLeave}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={pt.x} cy={pt.y} r={r + 4}
                fill="transparent"
              />
              <circle
                cx={pt.x} cy={pt.y} r={r}
                fill="hsl(222 47% 7% / 0.92)"
                stroke={planet.color}
                strokeWidth="1.5"
                filter="url(#planet-glow)"
              />
              <text
                x={pt.x} y={pt.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.026}
                fill={planet.color}
                fontWeight="700"
              >
                {planet.symbol}
              </text>
            </g>
          );
        })}

        {/* Ascendant marker */}
        {(() => {
          const start = polar(cx, cy, outerR - 2, asc);
          const end = polar(cx, cy, outerR + 16, asc);
          const label = polar(cx, cy, outerR + 28, asc);
          return (
            <g filter="url(#gold-glow)">
              <line
                x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                stroke="#E85D5D" strokeWidth="2.5"
              />
              <text
                x={label.x} y={label.y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.026} fontWeight="700"
                fill="#E85D5D"
              >
                ASC
              </text>
            </g>
          );
        })()}

        {/* Center label */}
        <text
          x={cx} y={cy - 4}
          textAnchor="middle"
          fontSize={size * 0.032}
          fill="hsl(var(--gold) / 0.85)"
          fontWeight="700"
          fontFamily="'Cinzel', serif"
        >
          {chartData ? "מפת לידה" : "גלגל אסטרולוגי"}
        </text>
        {chartData?.sunSign && (
          <text
            x={cx} y={cy + size * 0.04}
            textAnchor="middle"
            fontSize={size * 0.02}
            fill="hsl(var(--foreground) / 0.45)"
          >
            {chartData.sunSign.symbol} {chartData.sunSign.hebrewName} • {chartData.risingSign?.symbol} {chartData.risingSign?.hebrewName} עולה
          </text>
        )}
      </svg>
    </div>
  );
};

export default AlwaysVisibleNatalChart;