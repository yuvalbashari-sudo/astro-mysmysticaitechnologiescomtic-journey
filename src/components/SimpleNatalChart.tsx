import { PLANETS } from "@/components/NatalChartWheel";
import { useLanguage } from "@/i18n";
import { getChartLabels } from "@/lib/astroLocale";

interface Props {
  planetPositions?: Record<string, number> | null;
  ascendantAngle?: number | null;
  size?: number;
}

const FALLBACK_PLANET_POSITIONS: Record<string, number> = {
  sun: 42,
  moon: 118,
  mercury: 56,
  venus: 82,
  mars: 196,
  jupiter: 248,
  saturn: 286,
  uranus: 312,
  neptune: 328,
  pluto: 264,
};

const ZODIAC_SIGNS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
const DEFAULT_ASCENDANT = 18;

const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;

const polarToCartesian = (cx: number, cy: number, radius: number, angle: number) => {
  const radians = (angle - 90) * (Math.PI / 180);
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
};

const describeArc = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

const SimpleNatalChart = ({ planetPositions, ascendantAngle, size = 420 }: Props) => {
  const { language } = useLanguage();
  const labels = getChartLabels(language);
  const resolvedAscendant = Number.isFinite(ascendantAngle) ? normalizeAngle(ascendantAngle as number) : DEFAULT_ASCENDANT;
  const resolvedPositions = PLANETS.reduce<Record<string, number>>((acc, planet) => {
    const raw = planetPositions?.[planet.key];
    acc[planet.key] = Number.isFinite(raw) ? normalizeAngle(raw as number) : FALLBACK_PLANET_POSITIONS[planet.key];
    return acc;
  }, {});

  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.45;
  const zodiacRadius = size * 0.36;
  const planetRadius = size * 0.25;
  const innerRadius = size * 0.18;

  return (
    <div
      className="w-full"
      style={{
        minHeight: 400,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
      }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        role="img"
        aria-label={labels.astroWheel}
        style={{ display: "block", width: size, height: size, maxWidth: "100%", overflow: "visible" }}
      >
        <circle cx={cx} cy={cy} r={outerRadius + 10} fill="hsl(var(--deep-blue) / 0.9)" stroke="hsl(var(--gold) / 0.2)" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={outerRadius} fill="hsl(var(--deep-blue-light) / 0.45)" stroke="hsl(var(--gold) / 0.45)" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={zodiacRadius + 20} fill="none" stroke="hsl(var(--gold) / 0.18)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={innerRadius + 34} fill="none" stroke="hsl(var(--gold) / 0.16)" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={innerRadius} fill="hsl(var(--deep-blue) / 0.95)" stroke="hsl(var(--gold) / 0.24)" strokeWidth="1" />

        {Array.from({ length: 12 }).map((_, index) => {
          const angle = resolvedAscendant + index * 30;
          const lineStart = polarToCartesian(cx, cy, innerRadius + 34, angle);
          const lineEnd = polarToCartesian(cx, cy, outerRadius, angle);
          const houseLabel = polarToCartesian(cx, cy, innerRadius + 18, angle + 15);
          const zodiacLabel = polarToCartesian(cx, cy, zodiacRadius + 6, angle + 15);

          return (
            <g key={index}>
              <path
                d={describeArc(cx, cy, outerRadius - 2, angle, angle + 30)}
                fill="none"
                stroke="hsl(var(--gold) / 0.08)"
                strokeWidth="18"
              />
              <line
                x1={lineStart.x}
                y1={lineStart.y}
                x2={lineEnd.x}
                y2={lineEnd.y}
                stroke="hsl(var(--gold) / 0.22)"
                strokeWidth={index % 3 === 0 ? 1.4 : 0.8}
              />
              <text
                x={zodiacLabel.x}
                y={zodiacLabel.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={size * 0.05}
                fill="hsl(var(--gold) / 0.9)"
              >
                {ZODIAC_SIGNS[index]}
              </text>
              <text
                x={houseLabel.x}
                y={houseLabel.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={size * 0.025}
                fill="hsl(var(--foreground) / 0.55)"
              >
                {index + 1}
              </text>
            </g>
          );
        })}

        {PLANETS.map((planet) => {
          const point = polarToCartesian(cx, cy, planetRadius, resolvedPositions[planet.key] + resolvedAscendant);
          return (
            <g key={planet.key}>
              <circle
                cx={point.x}
                cy={point.y}
                r={size * 0.032}
                fill="hsl(var(--deep-blue) / 0.96)"
                stroke="hsl(var(--gold) / 0.55)"
                strokeWidth="1"
              />
              <text
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={size * 0.028}
                fill="hsl(var(--gold) / 0.95)"
              >
                {planet.symbol}
              </text>
            </g>
          );
        })}

        {(() => {
          const start = polarToCartesian(cx, cy, outerRadius - 4, resolvedAscendant);
          const end = polarToCartesian(cx, cy, outerRadius + 18, resolvedAscendant);
          const label = polarToCartesian(cx, cy, outerRadius + 28, resolvedAscendant);
          return (
            <g>
              <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="hsl(var(--destructive))" strokeWidth="2.5" />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={size * 0.03}
                fontWeight="700"
                fill="hsl(var(--destructive))"
              >
                {labels.ascendant}
              </text>
            </g>
          );
        })()}

        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fontSize={size * 0.04}
          fill="hsl(var(--gold) / 0.9)"
          fontWeight="700"
        >
          {labels.birthChart}
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          fontSize={size * 0.022}
          fill="hsl(var(--foreground) / 0.65)"
        >
          {labels.astroWheel}
        </text>
      </svg>
    </div>
  );
};

export default SimpleNatalChart;
