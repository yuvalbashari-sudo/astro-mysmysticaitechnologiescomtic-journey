import { motion } from "framer-motion";

const ZODIAC_SIGNS = [
  { symbol: "♈", name: "Aries", angle: 0 },
  { symbol: "♉", name: "Taurus", angle: 30 },
  { symbol: "♊", name: "Gemini", angle: 60 },
  { symbol: "♋", name: "Cancer", angle: 90 },
  { symbol: "♌", name: "Leo", angle: 120 },
  { symbol: "♍", name: "Virgo", angle: 150 },
  { symbol: "♎", name: "Libra", angle: 180 },
  { symbol: "♏", name: "Scorpio", angle: 210 },
  { symbol: "♐", name: "Sagittarius", angle: 240 },
  { symbol: "♑", name: "Capricorn", angle: 270 },
  { symbol: "♒", name: "Aquarius", angle: 300 },
  { symbol: "♓", name: "Pisces", angle: 330 },
];

export const PLANETS = [
  { symbol: "☉", name: "שמש", nameEn: "Sun", key: "sun", color: "#E8B84B" },
  { symbol: "☽", name: "ירח", nameEn: "Moon", key: "moon", color: "#C4C9D2" },
  { symbol: "☿", name: "כוכב חמה", nameEn: "Mercury", key: "mercury", color: "#8BC4A9" },
  { symbol: "♀", name: "נוגה", nameEn: "Venus", key: "venus", color: "#E88BC4" },
  { symbol: "♂", name: "מאדים", nameEn: "Mars", key: "mars", color: "#C45B5B" },
  { symbol: "♃", name: "צדק", nameEn: "Jupiter", key: "jupiter", color: "#8B9FE8" },
  { symbol: "♄", name: "שבתאי", nameEn: "Saturn", key: "saturn", color: "#A89070" },
  { symbol: "♅", name: "אורנוס", nameEn: "Uranus", key: "uranus", color: "#70C8E8" },
  { symbol: "♆", name: "נפטון", nameEn: "Neptune", key: "neptune", color: "#7088E8" },
  { symbol: "♇", name: "פלוטו", nameEn: "Pluto", key: "pluto", color: "#9070A8" },
];

export const ZODIAC_NAMES_HE = [
  "טלה", "שור", "תאומים", "סרטן", "אריה", "בתולה",
  "מאזניים", "עקרב", "קשת", "גדי", "דלי", "דגים",
];

export function getZodiacForAngle(angle: number): string {
  const idx = Math.floor(((angle % 360 + 360) % 360) / 30);
  return ZODIAC_NAMES_HE[idx];
}

export function calculatePlanetPositions(birthDate: Date, birthHour: number, birthMinute: number) {
  const dayOfYear = Math.floor((birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const yearFraction = dayOfYear / 365;
  const timeFraction = (birthHour * 60 + birthMinute) / 1440;
  const yearsSince2000 = (birthDate.getFullYear() - 2000) + yearFraction;

  return {
    sun: (yearFraction * 360 + 280) % 360,
    moon: (yearFraction * 360 * 13.37 + timeFraction * 360 + 120) % 360,
    mercury: (yearFraction * 360 * 1.24 + 200) % 360,
    venus: (yearFraction * 360 * 0.615 + 50) % 360,
    mars: (yearFraction * 360 * 0.524 + 320) % 360,
    jupiter: (yearFraction * 360 * 0.0843 + 150) % 360,
    saturn: (yearFraction * 360 * 0.0339 + 240) % 360,
    uranus: ((yearsSince2000 * 360 / 84 + 310) % 360 + 360) % 360,
    neptune: ((yearsSince2000 * 360 / 165 + 305) % 360 + 360) % 360,
    pluto: ((yearsSince2000 * 360 / 248 + 254) % 360 + 360) % 360,
  };
}

interface Props {
  planetPositions: Record<string, number>;
  ascendantAngle: number;
  size?: number;
}

const NatalChartWheel = ({ planetPositions, ascendantAngle, size = 400 }: Props) => {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.44;
  const signR = size * 0.38;
  const innerR = size * 0.32;
  const planetR = size * 0.23;
  const centerR = size * 0.12;

  // Element colors for sign bands
  const elementColors = [
    "hsl(0, 65%, 50%)",    // Aries - Fire
    "hsl(120, 30%, 40%)",  // Taurus - Earth
    "hsl(200, 50%, 55%)",  // Gemini - Air
    "hsl(210, 60%, 50%)",  // Cancer - Water
    "hsl(0, 65%, 50%)",    // Leo - Fire
    "hsl(120, 30%, 40%)",  // Virgo - Earth
    "hsl(200, 50%, 55%)",  // Libra - Air
    "hsl(210, 60%, 50%)",  // Scorpio - Water
    "hsl(0, 65%, 50%)",    // Sagittarius - Fire
    "hsl(120, 30%, 40%)",  // Capricorn - Earth
    "hsl(200, 50%, 55%)",  // Aquarius - Air
    "hsl(210, 60%, 50%)",  // Pisces - Water
  ];

  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0, rotate: -30 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto"
      style={{ width: size, height: size }}
    >
      {/* Outer cosmic glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(43 80% 55% / 0.06) 0%, hsl(43 80% 55% / 0.02) 40%, transparent 70%)",
          filter: "blur(20px)",
          transform: "scale(1.3)",
        }}
      />

      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full relative z-10">
        <defs>
          <radialGradient id="wheelBg">
            <stop offset="0%" stopColor="hsl(222, 47%, 10%)" />
            <stop offset="100%" stopColor="hsl(222, 47%, 6%)" />
          </radialGradient>
          <filter id="planetGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle cx={cx} cy={cy} r={outerR + 8} fill="url(#wheelBg)" />

        {/* Sign band arcs */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const startAngle = (i * 30 - 90 + ascendantAngle) * (Math.PI / 180);
          const endAngle = ((i + 1) * 30 - 90 + ascendantAngle) * (Math.PI / 180);
          const x1o = cx + outerR * Math.cos(startAngle);
          const y1o = cy + outerR * Math.sin(startAngle);
          const x2o = cx + outerR * Math.cos(endAngle);
          const y2o = cy + outerR * Math.sin(endAngle);
          const x1i = cx + innerR * Math.cos(endAngle);
          const y1i = cy + innerR * Math.sin(endAngle);
          const x2i = cx + innerR * Math.cos(startAngle);
          const y2i = cy + innerR * Math.sin(startAngle);

          return (
            <path
              key={`band-${i}`}
              d={`M ${x1o} ${y1o} A ${outerR} ${outerR} 0 0 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${innerR} ${innerR} 0 0 0 ${x2i} ${y2i} Z`}
              fill={elementColors[i]}
              fillOpacity="0.06"
              stroke="hsl(43, 80%, 55%)"
              strokeOpacity="0.12"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="hsl(43, 80%, 55%)" strokeOpacity="0.35" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="hsl(43, 80%, 55%)" strokeOpacity="0.2" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={centerR} fill="none" stroke="hsl(43, 80%, 55%)" strokeOpacity="0.1" strokeWidth="0.5" />

        {/* House lines with numbers */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90 + ascendantAngle) * (Math.PI / 180);
          const x1 = cx + innerR * Math.cos(angle);
          const y1 = cy + innerR * Math.sin(angle);
          const x2 = cx + outerR * Math.cos(angle);
          const y2 = cy + outerR * Math.sin(angle);
          const isCardinal = i % 3 === 0;
          // House number placement
          const houseAngle = ((i * 30 + 15) - 90 + ascendantAngle) * (Math.PI / 180);
          const hx = cx + (centerR + 8) * Math.cos(houseAngle);
          const hy = cy + (centerR + 8) * Math.sin(houseAngle);

          return (
            <g key={`house-${i}`}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="hsl(43, 80%, 55%)"
                strokeOpacity={isCardinal ? "0.4" : "0.12"}
                strokeWidth={isCardinal ? "1.5" : "0.5"}
              />
              <text
                x={hx} y={hy}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.022}
                fill="hsl(43, 80%, 55%)"
                fillOpacity="0.25"
                fontFamily="sans-serif"
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* Zodiac symbols */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const angle = ((i * 30 + 15) - 90 + ascendantAngle) * (Math.PI / 180);
          const x = cx + signR * Math.cos(angle);
          const y = cy + signR * Math.sin(angle);
          return (
            <text
              key={sign.symbol}
              x={x} y={y}
              textAnchor="middle" dominantBaseline="central"
              fontSize={size * 0.04}
              fill="hsl(43, 80%, 55%)"
              fillOpacity="0.75"
              filter="url(#softGlow)"
            >
              {sign.symbol}
            </text>
          );
        })}

        {/* Planets with colored markers */}
        {PLANETS.map((planet) => {
          const pos = planetPositions[planet.key];
          if (pos === undefined) return null;
          const angle = (pos - 90 + ascendantAngle) * (Math.PI / 180);
          const x = cx + planetR * Math.cos(angle);
          const y = cy + planetR * Math.sin(angle);
          const r = size * 0.035;

          return (
            <g key={planet.key} filter="url(#planetGlow)">
              <circle
                cx={x} cy={y} r={r}
                fill="hsl(222, 40%, 10%)"
                stroke={planet.color}
                strokeOpacity="0.6"
                strokeWidth="1"
              />
              <text
                x={x} y={y}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.032}
                fill={planet.color}
              >
                {planet.symbol}
              </text>
              {/* Connection line to ring */}
              <line
                x1={x + r * Math.cos(angle)} y1={y + r * Math.sin(angle)}
                x2={cx + innerR * Math.cos(angle)} y2={cy + innerR * Math.sin(angle)}
                stroke={planet.color}
                strokeOpacity="0.15"
                strokeWidth="0.5"
                strokeDasharray="2,3"
              />
            </g>
          );
        })}

        {/* ASC marker */}
        {(() => {
          const angle = (ascendantAngle - 90) * (Math.PI / 180);
          const x = cx + (outerR + size * 0.04) * Math.cos(angle);
          const y = cy + (outerR + size * 0.04) * Math.sin(angle);
          const arrowX = cx + outerR * Math.cos(angle);
          const arrowY = cy + outerR * Math.sin(angle);
          return (
            <g filter="url(#planetGlow)">
              <line
                x1={arrowX} y1={arrowY}
                x2={x} y2={y}
                stroke="hsl(0, 65%, 55%)"
                strokeWidth="2"
              />
              <text
                x={x + 12 * Math.cos(angle)} y={y + 12 * Math.sin(angle)}
                textAnchor="middle" dominantBaseline="central"
                fontSize={size * 0.028}
                fontWeight="bold"
                fill="hsl(0, 65%, 55%)"
              >
                אופק
              </text>
            </g>
          );
        })()}

        {/* Center ornament */}
        <circle cx={cx} cy={cy} r="4" fill="hsl(43, 80%, 55%)" fillOpacity="0.4" />
        <circle cx={cx} cy={cy} r="2" fill="hsl(43, 80%, 55%)" fillOpacity="0.7" />
      </svg>
    </motion.div>
  );
};

export default NatalChartWheel;
