import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, Sparkles, Star, Heart, Briefcase, Home, Flower2, Coins } from "lucide-react";
import worldMapNight from "@/assets/world-map-night.jpg";
import type { AstrocartographyData, DerivedPlanetLine } from "@/lib/astrocartography";

type LineKey = "love" | "career" | "spirit" | "home" | "abundance";
type LineType = "MC" | "IC" | "ASC" | "DSC";

// Equirectangular projection: lon [-180,180] → x [0,100], lat [85,-85] → y [0,60]
const projX = (lon: number) => ((lon + 180) / 360) * 100;
const projY = (lat: number) => ((85 - lat) / 170) * 60;

type PlanetLine = {
  key: string;
  symbol: string;
  name: string;
  lon: number;
  lineType: LineType;
  color: string;
  line: LineKey;
  curve?: number; // -3..3 horizontal bow at equator (ASC/DSC are slightly curved)
  mobile?: boolean; // show on mobile
};

// Real astrocartography: MC/IC = vertical meridian at planet's longitude.
// ASC/DSC = curved horizon lines (we approximate with subtle horizontal bow).
const PLANET_LINES: PlanetLine[] = [
  { key: "sun-mc", symbol: "☉", name: "שמש", lon: -75, lineType: "MC", color: "hsl(43 90% 60%)", line: "career", mobile: true },
  { key: "sun-ic", symbol: "☉", name: "שמש", lon: 105, lineType: "IC", color: "hsl(43 90% 60%)", line: "career" },
  { key: "moon-mc", symbol: "☽", name: "ירח", lon: -20, lineType: "MC", color: "hsl(210 35% 88%)", line: "home", mobile: true },
  { key: "venus-asc", symbol: "♀", name: "ונוס", lon: 25, lineType: "ASC", color: "hsl(340 75% 65%)", line: "love", curve: 1.6, mobile: true },
  { key: "venus-mc", symbol: "♀", name: "ונוס", lon: -110, lineType: "MC", color: "hsl(340 75% 65%)", line: "love" },
  { key: "mars-mc", symbol: "♂", name: "מאדים", lon: 70, lineType: "MC", color: "hsl(0 75% 58%)", line: "abundance" },
  { key: "mars-dsc", symbol: "♂", name: "מאדים", lon: -130, lineType: "DSC", color: "hsl(0 75% 58%)", line: "abundance", curve: -1.4 },
  { key: "jupiter-ic", symbol: "♃", name: "צדק", lon: 130, lineType: "IC", color: "hsl(270 55% 68%)", line: "spirit", mobile: true },
  { key: "jupiter-asc", symbol: "♃", name: "צדק", lon: 55, lineType: "ASC", color: "hsl(270 55% 68%)", line: "spirit", curve: 1.2 },
  { key: "saturn-mc", symbol: "♄", name: "שבתאי", lon: 155, lineType: "MC", color: "hsl(215 28% 62%)", line: "home" },
];

const FILTERS: { label: string; key: LineKey; icon: typeof Heart }[] = [
  { label: "אהבה", key: "love", icon: Heart },
  { label: "קריירה", key: "career", icon: Briefcase },
  { label: "מגורים", key: "home", icon: Home },
  { label: "התפתחות רוחנית", key: "spirit", icon: Flower2 },
  { label: "שפע", key: "abundance", icon: Coins },
];

const LINE_COLORS: Record<LineKey, string> = {
  love: "hsl(340 75% 60%)",
  career: "hsl(43 80% 55%)",
  spirit: "hsl(215 70% 60%)",
  home: "hsl(160 55% 55%)",
  abundance: "hsl(43 90% 65%)",
};

type City = {
  id: string;
  name: string;
  country: string;
  lon: number;
  lat: number;
  mobile: boolean;
  planet: string;
  line: LineKey;
  theme: string;
  strength: number;
  blurb: string;
};

const CITIES: City[] = [
  { id: "london", name: "לונדון", country: "אנגליה", lon: -0.13, lat: 51.5, mobile: true, planet: "צדק ♃", line: "career", theme: "קריירה והזדמנויות", strength: 92, blurb: "כאן האנרגיה שלכם מתחזקת בתחום הקריירה — שערים של נראות, הכרה והתרחבות מקצועית נפתחים בקלות." },
  { id: "newyork", name: "ניו יורק", country: "ארה״ב", lon: -74, lat: 40.7, mobile: true, planet: "מאדים ♂", line: "abundance", theme: "יוזמה ושפע", strength: 84, blurb: "המקום הזה פותח אצלכם דחף לפעולה, אומץ ליזום ויכולת להפוך חזון לכסף ולהצלחה מוחשית." },
  { id: "barcelona", name: "ברצלונה", country: "ספרד", lon: 2.17, lat: 41.4, mobile: false, planet: "ונוס ♀", line: "love", theme: "אהבה ויצירתיות", strength: 89, blurb: "זהו אזור שמעצים את היכולת שלכם לאהוב, להתאהב וליצור — הלב נפתח והיופי מוצא דרך לזרום." },
  { id: "bali", name: "באלי", country: "אינדונזיה", lon: 115.2, lat: -8.4, mobile: true, planet: "נפטון ♆", line: "spirit", theme: "התפתחות רוחנית", strength: 95, blurb: "כאן האנרגיה שלכם מתחזקת בתחום הרוחני — מרחב לריפוי עמוק, אינטואיציה והתחברות לעצמי הגבוה." },
  { id: "tokyo", name: "טוקיו", country: "יפן", lon: 139.7, lat: 35.7, mobile: false, planet: "שבתאי ♄", line: "home", theme: "מבנה ובית", strength: 78, blurb: "המקום הזה פותח אצלכם משמעת, סדר פנימי ויכולת לבנות בית יציב שמשרת את הצמיחה ארוכת הטווח." },
];

const PLANET_MEANINGS = [
  { symbol: "☉", name: "שמש", meaning: "נראות, ביטוי עצמי, הנהגה וזוהר אישי." },
  { symbol: "☽", name: "ירח", meaning: "רגש, בית, אינטואיציה ותחושת שייכות." },
  { symbol: "♀", name: "ונוס", meaning: "אהבה, הרמוניה, יופי ומשיכה." },
  { symbol: "♂", name: "מאדים", meaning: "תשוקה, פעולה, אומץ ודחף לצמיחה." },
  { symbol: "♃", name: "צדק", meaning: "שפע, הזדמנויות, התרחבות והצלחה." },
];

// CONTINENT_PATHS imported from '@/data/worldMapPaths'


const FILTER_KEYWORDS: Record<LineKey, string[]> = {
  love: ["אהבה", "להתאהב", "הלב", "יופי"],
  career: ["קריירה", "נראות", "הכרה", "מקצועית"],
  spirit: ["רוחני", "ריפוי", "אינטואיציה", "העצמי הגבוה"],
  home: ["בית", "סדר", "יציב", "משמעת"],
  abundance: ["שפע", "כסף", "הצלחה", "יוזם"],
};

function highlightKeywords(text: string, keywords: string[]) {
  if (!keywords.length) return text;
  const pattern = new RegExp(`(${keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    keywords.includes(part) ? (
      <span key={i} className="font-heading" style={{ color: "hsl(var(--gold))" }}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

interface AstrocartographySectionProps {
  /** Personalized lines/strengths derived from the user's birth details. When
   *  omitted, falls back to the static reference set (e.g. previews). */
  data?: AstrocartographyData | null;
}

const AstrocartographySection = ({ data }: AstrocartographySectionProps = {}) => {
  const [activeFilter, setActiveFilter] = useState<LineKey>("love");
  const [selectedCityId, setSelectedCityId] = useState<string>("london");
  const [hoveredCityId, setHoveredCityId] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);

  // Use personalized lines when available; otherwise the editorial fallback.
  const activePlanetLines: (PlanetLine | DerivedPlanetLine)[] = useMemo(
    () => (data?.planetLines && data.planetLines.length ? data.planetLines : PLANET_LINES),
    [data],
  );

  // Apply per-birth strengths to the city catalog.
  const personalizedCities = useMemo<City[]>(() => {
    if (!data?.cityStrength) return CITIES;
    return CITIES.map((c) => ({
      ...c,
      strength: data.cityStrength[c.id] ?? c.strength,
    }));
  }, [data]);

  const focusLine: LineKey = useMemo(() => {
    if (hoveredCityId) {
      return personalizedCities.find((c) => c.id === hoveredCityId)!.line;
    }
    return activeFilter;
  }, [hoveredCityId, activeFilter, personalizedCities]);

  const selectedCity = useMemo(
    () => personalizedCities.find((c) => c.id === selectedCityId) ?? personalizedCities[0],
    [selectedCityId, personalizedCities]
  );

  // Nearest planetary line to the selected city (by longitude distance, wrap-aware)
  const nearestLine = useMemo(() => {
    let best = activePlanetLines[0];
    let bestDist = Infinity;
    for (const p of activePlanetLines) {
      const d = Math.min(
        Math.abs(p.lon - selectedCity.lon),
        360 - Math.abs(p.lon - selectedCity.lon)
      );
      if (d < bestDist) {
        bestDist = d;
        best = p;
      }
    }
    return { line: best, distance: bestDist };
  }, [selectedCity, activePlanetLines]);


  const sortedRecommendations = useMemo(() => {
    return [...personalizedCities]
      .map((c) => ({
        ...c,
        relevance: c.line === activeFilter ? c.strength + 100 : c.strength,
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3);
  }, [activeFilter, personalizedCities]);

  const topRecommendationId = sortedRecommendations[0]?.id;

  return (
    <section dir="rtl" className="w-full pt-12 md:pt-16 pb-14 md:pb-16 space-y-8 md:space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 md:space-y-4 px-5 md:px-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 md:gap-3">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 shrink-0" style={{ color: "hsl(var(--gold))" }} />
          <h2 className="font-heading text-2xl md:text-4xl gold-gradient-text leading-tight">
            מפת אסטרו־קרטוגרפיה
          </h2>
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 shrink-0" style={{ color: "hsl(var(--gold))" }} />
        </div>
        <p
          className="font-body text-[13px] md:text-lg leading-[1.7] md:leading-relaxed max-w-[34ch] md:max-w-none mx-auto"
          style={{ color: "hsl(var(--foreground) / 0.8)" }}
        >
          גלו היכן בעולם האנרגיה שלכם מתחזקת בתחומי אהבה, קריירה, מגורים והתפתחות רוחנית.
        </p>
      </div>

      {/* Filters — mobile: 2 balanced rows (wrap); desktop: single wrap row */}
      <div className="px-4 md:px-3">
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-2.5 md:gap-3 max-w-[340px] md:max-w-none mx-auto">
          {FILTERS.map((f) => {
            const active = f.key === activeFilter;
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className="shrink-0 px-3 md:px-5 py-2 md:py-2.5 rounded-full text-[11px] md:text-sm font-body transition-all duration-300 flex items-center gap-1.5 md:gap-2 whitespace-nowrap hover:scale-[1.04]"
                style={{
                  background: active
                    ? "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))"
                    : "hsl(var(--deep-blue-light) / 0.5)",
                  color: active ? "hsl(var(--deep-blue))" : "hsl(var(--gold) / 0.85)",
                  border: `1px solid hsl(var(--gold) / ${active ? 0.7 : 0.2})`,
                  boxShadow: active
                    ? "0 0 24px hsl(var(--gold) / 0.5), inset 0 1px 0 hsl(0 0% 100% / 0.2)"
                    : "0 2px 8px hsl(222 50% 4% / 0.4)",
                  fontWeight: active ? 700 : 500,
                  minHeight: 34,
                }}
              >
                <Icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map — edge-to-edge, balanced height on mobile. Desktop keeps equirectangular ratio. */}
      <div className="-mx-4 md:mx-0 md:px-0">
        <div
          className="relative w-full overflow-hidden mystical-card-elevated mx-auto rounded-none md:rounded-2xl border-y md:border astro-map-frame"
          style={{
            boxShadow: "0 0 50px hsl(var(--gold) / 0.18), inset 0 0 80px hsl(222 50% 4% / 0.7)",
            borderColor: "hsl(var(--gold) / 0.35)",
          }}
        >
          {/* Inner stage preserves true 100:60 geography. When container is taller than 100:60 of its width,
              the stage scales to fill height and overflows horizontally — image + SVG crop together, identically. */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              height: "100%",
              aspectRatio: "100 / 60",
              minWidth: "100%",
            }}
          >
          <img
            src={worldMapNight}
            alt=""
            aria-hidden="true"
            loading="lazy"
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full pointer-events-none select-none"
            style={{
              // Container matches map ratio → "fill" no longer distorts geography.
              objectFit: "fill",
              opacity: 0.88,
              filter: "saturate(0.75) brightness(0.9) contrast(1.05)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, hsl(222 50% 4% / 0.15) 0%, hsl(222 50% 4% / 0.55) 90%)",
            }}
          />

          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
            <defs>
              <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(43 80% 65%)" stopOpacity="0.55" />
                <stop offset="100%" stopColor="hsl(43 80% 65%)" stopOpacity="0" />
              </radialGradient>
              {PLANET_LINES.map((p) => (
                <linearGradient key={`grad-${p.key}`} id={`band-${p.key}`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor={p.color} stopOpacity="0" />
                  <stop offset="50%" stopColor={p.color} stopOpacity="0.45" />
                  <stop offset="100%" stopColor={p.color} stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>

            {/* Latitude grid (parallels) — every 15° */}
            {[60, 45, 30, 15, -15, -30, -45, -60].map((lat) => (
              <line
                key={`lat${lat}`}
                x1="0"
                y1={projY(lat)}
                x2="100"
                y2={projY(lat)}
                stroke="hsl(215 30% 60%)"
                strokeOpacity="0.06"
                strokeWidth="0.1"
              />
            ))}
            {/* Longitude grid (meridians) — every 30° */}
            {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lon) => (
              <line
                key={`lon${lon}`}
                x1={projX(lon)}
                y1="0"
                x2={projX(lon)}
                y2="60"
                stroke="hsl(215 30% 60%)"
                strokeOpacity={lon === 0 ? 0.16 : 0.06}
                strokeWidth={lon === 0 ? 0.13 : 0.1}
                strokeDasharray={lon === 0 ? "0.8 0.8" : "none"}
              />
            ))}

            {/* Equator + Tropics + Polar circles (subtle astronomy markers) */}
            <line x1="0" y1={projY(0)} x2="100" y2={projY(0)} stroke="hsl(var(--gold))" strokeOpacity="0.22" strokeWidth="0.14" strokeDasharray="0.6 0.6" />
            <line x1="0" y1={projY(23.5)} x2="100" y2={projY(23.5)} stroke="hsl(var(--gold))" strokeOpacity="0.08" strokeWidth="0.08" strokeDasharray="0.4 0.6" />
            <line x1="0" y1={projY(-23.5)} x2="100" y2={projY(-23.5)} stroke="hsl(var(--gold))" strokeOpacity="0.08" strokeWidth="0.08" strokeDasharray="0.4 0.6" />

            {/* Planetary lines: glow influence band + main line.
                MC/IC = vertical meridians; ASC/DSC = subtle bowed lines. */}
            {PLANET_LINES.map((p) => {
              const x = projX(p.lon);
              const isFocus = p.line === focusLine;
              const isMobileLine = p.mobile === true;
              const visibleClass = isMobileLine ? "" : "hidden md:block";
              const curve = p.curve ?? 0;

              // Path: vertical line for MC/IC, slightly curved for ASC/DSC
              const d =
                curve === 0
                  ? `M ${x} 0 L ${x} 60`
                  : `M ${x - curve} 0 Q ${x + curve * 1.2} 30, ${x - curve} 60`;

              return (
                <g key={p.key} className={visibleClass}>
                  {/* Influence glow band — wide, soft */}
                  <path
                    d={d}
                    fill="none"
                    stroke={p.color}
                    strokeWidth={isFocus ? 3.2 : 1.8}
                    opacity={isFocus ? 0.32 : 0.1}
                    strokeLinecap="round"
                    style={{
                      filter: `blur(${isFocus ? 1.6 : 1}px)`,
                      transition: "opacity 0.4s ease, stroke-width 0.4s ease",
                    }}
                  />
                  {/* Main line */}
                  <path
                    d={d}
                    fill="none"
                    stroke={p.color}
                    strokeWidth={isFocus ? 0.45 : 0.25}
                    opacity={isFocus ? 1 : 0.55}
                    strokeDasharray={p.lineType === "IC" || p.lineType === "DSC" ? "1.2 0.6" : "none"}
                    style={{
                      filter: isFocus ? `drop-shadow(0 0 1.4px ${p.color})` : "none",
                      transition: "opacity 0.4s ease, stroke-width 0.4s ease",
                    }}
                  />
                </g>
              );
            })}

            {/* Connector from selected city to its nearest planetary line */}
            {(() => {
              const cx = projX(selectedCity.lon);
              const cy = projY(selectedCity.lat);
              const lx = projX(nearestLine.line.lon);
              return (
                <line
                  x1={cx}
                  y1={cy}
                  x2={lx}
                  y2={cy}
                  stroke={nearestLine.line.color}
                  strokeWidth="0.18"
                  strokeOpacity="0.7"
                  strokeDasharray="0.6 0.6"
                  style={{ filter: `drop-shadow(0 0 1px ${nearestLine.line.color})` }}
                />
              );
            })()}

            {/* City markers (halo/pulse) */}
            {CITIES.map((c) => {
              const cx = projX(c.lon);
              const cy = projY(c.lat);
              const isSelected = c.id === selectedCityId;
              const isHover = c.id === hoveredCityId;
              const emphasized = isSelected || isHover;
              return (
                <g key={c.id} className={c.mobile ? "" : "hidden md:block"}>
                  <circle cx={cx} cy={cy} r={emphasized ? 3.4 : 2.2} fill="url(#cityGlow)" style={{ transition: "all 0.3s ease" }} />
                  <circle cx={cx} cy={cy} r={emphasized ? 1.0 : 0.7} fill="hsl(var(--gold))" style={{ transition: "all 0.3s ease" }}>
                    <animate attributeName="opacity" values="0.55;1;0.55" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={cx} cy={cy} r={emphasized ? 1.9 : 1.2} fill="none" stroke="hsl(var(--gold))" strokeOpacity={emphasized ? 0.8 : 0.4} strokeWidth="0.15" style={{ transition: "all 0.3s ease" }} />
                </g>
              );
            })}
          </svg>

          {/* Planet line labels (HTML for crisp text). Format: "☉ MC" / "♀ ASC" */}
          {PLANET_LINES.map((p) => {
            const isFocus = p.line === focusLine;
            const isMobileLine = p.mobile === true;
            // Stagger vertical position so labels don't overlap
            const lonBucket = Math.floor((p.lon + 180) / 30);
            const topPx = 6 + (lonBucket % 2) * 14;
            return (
              <div
                key={`label-${p.key}`}
                className={`absolute pointer-events-none font-heading whitespace-nowrap transition-all duration-300 ${isMobileLine ? "" : "hidden md:block"}`}
                style={{
                  left: `${projX(p.lon)}%`,
                  top: topPx,
                  transform: "translateX(-50%)",
                  fontSize: 10,
                  letterSpacing: "0.04em",
                  color: p.color,
                  opacity: isFocus ? 1 : 0.65,
                  textShadow: `0 0 8px hsl(222 50% 4%), 0 0 4px hsl(222 50% 4%), 0 0 6px ${p.color}`,
                  zIndex: 4,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "2px 5px",
                  borderRadius: 4,
                  background: isFocus ? "hsl(222 50% 4% / 0.55)" : "transparent",
                  border: isFocus ? `1px solid ${p.color}` : "1px solid transparent",
                }}
              >
                <span style={{ fontSize: 11 }}>{p.symbol}</span>
                <span style={{ fontSize: 9, opacity: 0.85 }}>{p.lineType}</span>
              </div>
            );
          })}


          {/* Clickable city overlays */}
          {CITIES.map((c) => {
            const isSelected = c.id === selectedCityId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCityId(c.id)}
                onMouseEnter={() => setHoveredCityId(c.id)}
                onMouseLeave={() => setHoveredCityId(null)}
                className={`absolute group ${c.mobile ? "" : "hidden md:block"}`}
                style={{
                  left: `${projX(c.lon)}%`,
                  top: `${(projY(c.lat) / 60) * 100}%`,
                  transform: "translate(50%, -50%)",
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "transparent",
                  cursor: "pointer",
                  zIndex: 5,
                }}
                aria-label={c.name}
              >
                <span
                  className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 text-[10px] md:text-xs font-body whitespace-nowrap pointer-events-none transition-all duration-300"
                  style={{
                    bottom: "100%",
                    marginBottom: 6,
                    color: isSelected ? "hsl(var(--gold))" : "hsl(var(--gold) / 0.9)",
                    textShadow: "0 0 10px hsl(222 50% 4%), 0 0 6px hsl(222 50% 4%)",
                    fontWeight: isSelected ? 700 : 500,
                    transform: isSelected ? "translate(-50%, -2px) scale(1.05)" : "translate(-50%, 0) scale(1)",
                  }}
                >
                  <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3" style={{ color: "hsl(var(--gold))" }} />
                  {c.name}
                </span>
              </button>
            );
          })}
          </div>
          {/* /inner stage */}

          {/* In-map legend */}
          <div
            dir="rtl"
            className="absolute top-2 right-2 md:top-3 md:right-3 px-2.5 py-2 md:px-3 md:py-2.5 rounded-lg space-y-1 md:space-y-1.5 pointer-events-none"
            style={{
              background: "hsl(222 50% 4% / 0.7)",
              backdropFilter: "blur(8px)",
              border: "1px solid hsl(var(--gold) / 0.25)",
              maxWidth: "55%",
            }}
          >
            {([
              { key: "love" as LineKey, label: "קו אהבה" },
              { key: "career" as LineKey, label: "קו קריירה" },
              { key: "spirit" as LineKey, label: "קו רוחני" },
            ]).map((l) => (
              <div key={l.key} className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[11px] font-body" style={{ color: "hsl(var(--gold) / 0.9)", opacity: focusLine === l.key ? 1 : 0.55, transition: "opacity 0.3s" }}>
                <span
                  className="inline-block rounded-full shrink-0"
                  style={{
                    width: 12,
                    height: 2,
                    background: LINE_COLORS[l.key],
                    boxShadow: `0 0 6px ${LINE_COLORS[l.key]}`,
                  }}
                />
                {l.label}
              </div>
            ))}
          </div>

          {/* Exploration hint */}
          <div className="absolute inset-x-0 bottom-3 md:bottom-4 flex items-center justify-center pointer-events-none px-4">
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-center px-4 py-2 md:px-5 md:py-2.5 rounded-xl"
              style={{
                background: "hsl(222 50% 4% / 0.7)",
                backdropFilter: "blur(8px)",
                border: "1px solid hsl(var(--gold) / 0.22)",
              }}
            >
              <p className="font-heading text-[11px] md:text-sm leading-snug" style={{ color: "hsl(var(--gold) / 0.9)" }}>
                לחצו על מיקום כדי לגלות את ההשפעה שלכם בעולם ✨
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Selected location insight (dynamic) */}
      <div className="px-4 md:px-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCity.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mystical-card-elevated p-5 md:p-7 space-y-4"
            style={{
              boxShadow: "0 0 30px hsl(var(--gold) / 0.15), inset 0 1px 0 hsl(var(--gold) / 0.1)",
              border: "1px solid hsl(var(--gold) / 0.35)",
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--gold))" }} />
                <h3 className="font-heading text-base md:text-xl leading-snug" style={{ color: "hsl(var(--gold))" }}>
                  פירוש המקום עבורך — {selectedCity.name}
                </h3>
              </div>
              <span
                className="text-[10px] md:text-xs font-body px-2.5 py-1 rounded-full"
                style={{
                  background: "hsl(var(--gold) / 0.12)",
                  color: "hsl(var(--gold) / 0.9)",
                  border: "1px solid hsl(var(--gold) / 0.25)",
                }}
              >
                מקום נבחר
              </span>
            </div>

            <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-3">
              <div className="flex justify-between items-center md:block md:space-y-1 pb-2.5 md:pb-0 border-b md:border-0" style={{ borderColor: "hsl(var(--gold) / 0.12)" }}>
                <div className="text-[11px] font-body" style={{ color: "hsl(var(--foreground) / 0.6)" }}>שם המקום</div>
                <div className="font-heading text-sm" style={{ color: "hsl(var(--gold) / 0.95)" }}>
                  {selectedCity.name}, {selectedCity.country}
                </div>
              </div>
              <div className="flex justify-between items-center md:block md:space-y-1 pb-2.5 md:pb-0 border-b md:border-0" style={{ borderColor: "hsl(var(--gold) / 0.12)" }}>
                <div className="text-[11px] font-body" style={{ color: "hsl(var(--foreground) / 0.6)" }}>הקו הדומיננטי</div>
                <div className="font-heading text-sm" style={{ color: "hsl(var(--gold) / 0.95)" }}>{selectedCity.planet}</div>
              </div>
              <div className="flex justify-between items-center md:block md:space-y-1 pb-2.5 md:pb-0 border-b md:border-0" style={{ borderColor: "hsl(var(--gold) / 0.12)" }}>
                <div className="text-[11px] font-body" style={{ color: "hsl(var(--foreground) / 0.6)" }}>תחום השפעה</div>
                <div className="font-heading text-sm" style={{ color: "hsl(var(--gold) / 0.95)" }}>{selectedCity.theme}</div>
              </div>
              <div className="space-y-1.5 md:col-span-3">
                <div className="text-[11px] font-body" style={{ color: "hsl(var(--foreground) / 0.6)" }}>עוצמת חיבור</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--deep-blue-light) / 0.6)" }}>
                    <motion.div
                      key={`bar-${selectedCity.id}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedCity.strength}%` }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: "linear-gradient(90deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
                        boxShadow: "0 0 12px hsl(var(--gold) / 0.6)",
                      }}
                    />
                  </div>
                  <span className="font-heading text-sm" style={{ color: "hsl(var(--gold))" }}>{selectedCity.strength}%</span>
                </div>
              </div>
            </div>

            <p className="font-body text-[14px] md:text-base leading-[1.85] md:leading-relaxed pt-1" style={{ color: "hsl(var(--foreground) / 0.85)" }}>
              {highlightKeywords(selectedCity.blurb, FILTER_KEYWORDS[selectedCity.line])}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Recommendations (dynamic + reordered) */}
      <div className="space-y-5 md:space-y-6 px-4 md:px-0">
        <h3 className="text-center font-heading text-xl md:text-3xl gold-gradient-text">
          המקומות המומלצים עבורך
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          <AnimatePresence>
            {sortedRecommendations.map((r) => {
              const isTop = r.id === topRecommendationId;
              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  onClick={() => setSelectedCityId(r.id)}
                  className="mystical-card p-5 md:p-6 flex flex-col gap-4 h-full cursor-pointer"
                  style={{
                    boxShadow: isTop
                      ? "0 8px 32px hsl(var(--gold) / 0.25), inset 0 1px 0 hsl(var(--gold) / 0.18)"
                      : "0 6px 24px hsl(222 50% 4% / 0.55), inset 0 1px 0 hsl(var(--gold) / 0.1)",
                    border: `1px solid hsl(var(--gold) / ${isTop ? 0.5 : 0.22})`,
                    transform: isTop ? "scale(1.015)" : "scale(1)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading text-lg md:text-xl flex items-center gap-2" style={{ color: "hsl(var(--gold))" }}>
                        {r.name}
                        {isTop && (
                          <span
                            className="text-[9px] font-body px-2 py-0.5 rounded-full"
                            style={{
                              background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
                              color: "hsl(var(--deep-blue))",
                              fontWeight: 700,
                            }}
                          >
                            מומלץ במיוחד
                          </span>
                        )}
                      </h4>
                      <span className="text-sm font-body" style={{ color: "hsl(var(--gold) / 0.75)" }}>
                        {r.planet}
                      </span>
                    </div>
                    <div className="text-xs font-body" style={{ color: "hsl(var(--foreground) / 0.6)" }}>
                      {r.country}
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-1 border-t" style={{ borderColor: "hsl(var(--gold) / 0.15)" }}>
                    <div className="flex items-center justify-between pt-2.5">
                      <span className="text-[11px] font-body" style={{ color: "hsl(var(--foreground) / 0.6)" }}>הקו הדומיננטי</span>
                      <span className="text-xs font-heading" style={{ color: "hsl(var(--gold) / 0.9)" }}>{r.planet}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-body" style={{ color: "hsl(var(--foreground) / 0.6)" }}>תחום מרכזי</span>
                      <span className="text-xs font-heading" style={{ color: "hsl(var(--gold) / 0.9)" }}>{r.theme}</span>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-body" style={{ color: "hsl(var(--foreground) / 0.6)" }}>עוצמת חיבור</span>
                        <span className="text-xs font-heading" style={{ color: "hsl(var(--gold))" }}>{r.strength}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--deep-blue-light) / 0.6)" }}>
                        <motion.div
                          key={`rec-bar-${r.id}-${activeFilter}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${r.strength}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{
                            background: "linear-gradient(90deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
                            boxShadow: "0 0 8px hsl(var(--gold) / 0.5)",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <p
                    className="font-body text-[14px] md:text-sm leading-[1.8] md:leading-relaxed flex-1"
                    style={{ color: "hsl(var(--foreground) / 0.8)" }}
                  >
                    {r.blurb}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCityId(r.id);
                    }}
                    className="btn-outline-gold text-sm md:text-xs py-3 md:py-2.5 px-4 mt-auto w-full transition-all duration-300 hover:scale-[1.02]"
                  >
                    קראו פירוש מלא
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapsible legend */}
      <div className="px-4 md:px-0">
        <div className="mystical-card overflow-hidden" style={{ border: "1px solid hsl(var(--gold) / 0.22)" }}>
          <button
            onClick={() => setLegendOpen((v) => !v)}
            className="w-full flex items-center justify-between p-5 transition-colors"
            style={{ color: "hsl(var(--gold))", minHeight: 56 }}
            aria-expanded={legendOpen}
          >
            <span className="font-heading text-[15px] md:text-lg text-right leading-snug pr-2">
              מה המשמעות של הקווים הפלנטריים?
            </span>
            <span
              className="shrink-0 flex items-center justify-center rounded-full"
              style={{
                width: 32,
                height: 32,
                background: "hsl(var(--gold) / 0.1)",
                border: "1px solid hsl(var(--gold) / 0.3)",
              }}
            >
              <ChevronDown
                className="w-4 h-4 transition-transform duration-300"
                style={{ transform: legendOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </span>
          </button>
          <AnimatePresence initial={false}>
            {legendOpen && (
              <motion.div
                key="legend-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
                style={{ borderTop: "1px solid hsl(var(--gold) / 0.15)" }}
              >
                <div className="px-5 pb-5 pt-2 space-y-4 md:space-y-3">
                  {PLANET_MEANINGS.map((p) => (
                    <div key={p.name} className="flex items-start gap-4 pt-3">
                      <span
                        className="font-heading text-2xl shrink-0 flex items-center justify-center rounded-full"
                        style={{
                          color: "hsl(var(--gold))",
                          width: "2.25rem",
                          height: "2.25rem",
                          background: "hsl(var(--gold) / 0.08)",
                          border: "1px solid hsl(var(--gold) / 0.25)",
                        }}
                      >
                        {p.symbol}
                      </span>
                      <div className="flex-1">
                        <div className="font-heading text-[15px] md:text-base" style={{ color: "hsl(var(--gold) / 0.95)" }}>
                          {p.name}
                        </div>
                        <div
                          className="font-body text-[14px] md:text-sm leading-[1.85] md:leading-relaxed mt-1 md:mt-0.5"
                          style={{ color: "hsl(var(--foreground) / 0.8)" }}
                        >
                          {p.meaning}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default AstrocartographySection;
