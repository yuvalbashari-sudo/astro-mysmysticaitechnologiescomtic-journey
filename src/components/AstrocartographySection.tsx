import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, Sparkles, Star, Heart, Briefcase, Home, Flower2, Coins } from "lucide-react";

type LineKey = "love" | "career" | "spirit" | "home" | "abundance";

// Equirectangular projection: lon [-180,180] → x [0,100], lat [85,-85] → y [0,60]
const projX = (lon: number) => ((lon + 180) / 360) * 100;
const projY = (lat: number) => ((85 - lat) / 170) * 60;

type Planet = { key: string; name: string; lon: number; color: string; line: LineKey };

// Mock planet meridian lines (real astrocartography MC lines are vertical at planet's longitude)
const PLANET_LINES: Planet[] = [
  { key: "sun", name: "שמש", lon: -75, color: "hsl(43 90% 60%)", line: "career" },
  { key: "moon", name: "ירח", lon: -20, color: "hsl(210 40% 88%)", line: "home" },
  { key: "venus", name: "ונוס", lon: 25, color: "hsl(340 75% 65%)", line: "love" },
  { key: "mars", name: "מאדים", lon: 70, color: "hsl(0 75% 58%)", line: "abundance" },
  { key: "jupiter", name: "צדק", lon: 130, color: "hsl(270 55% 65%)", line: "spirit" },
  { key: "saturn", name: "שבתאי", lon: 155, color: "hsl(215 30% 60%)", line: "home" },
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

// Equirectangular continent silhouettes (lon -180..180 → x 0..100, lat 85..-85 → y 0..60)
const CONTINENT_PATHS = [
  // North America
  "M 12 9 L 20 7 L 27 9 L 31 13 L 30 18 L 27 22 L 23 26 L 19 28 L 15 26 L 11 22 L 9 16 Z",
  // Greenland
  "M 33 6 L 39 5 L 41 10 L 36 13 L 33 11 Z",
  // Central America
  "M 23 28 L 27 28 L 28 32 L 25 33 L 22 31 Z",
  // South America
  "M 26 32 L 31 31 L 33 36 L 32 44 L 29 50 L 26 52 L 24 49 L 23 42 L 24 36 Z",
  // Europe
  "M 47 13 L 54 12 L 58 14 L 60 18 L 56 21 L 51 22 L 47 19 Z",
  // Africa
  "M 49 23 L 57 22 L 60 27 L 61 33 L 58 41 L 54 47 L 51 47 L 49 42 L 48 34 L 48 27 Z",
  // Middle East
  "M 58 18 L 65 17 L 67 22 L 63 24 L 59 22 Z",
  // Asia main
  "M 60 9 L 72 7 L 84 8 L 90 12 L 91 18 L 86 23 L 80 25 L 73 24 L 67 22 L 62 18 L 60 13 Z",
  // India
  "M 70 24 L 75 24 L 74 32 L 71 33 Z",
  // Indonesia / SE Asia
  "M 78 31 L 84 31 L 86 35 L 82 37 L 78 36 Z",
  // Japan
  "M 86 17 L 89 17 L 89 22 L 87 22 Z",
  // Australia
  "M 82 41 L 90 41 L 92 46 L 88 50 L 83 49 L 81 45 Z",
];

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

const AstrocartographySection = () => {
  const [activeFilter, setActiveFilter] = useState<LineKey>("love");
  const [selectedCityId, setSelectedCityId] = useState<string>("london");
  const [hoveredCityId, setHoveredCityId] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);

  const focusLine: LineKey = useMemo(() => {
    if (hoveredCityId) {
      return CITIES.find((c) => c.id === hoveredCityId)!.line;
    }
    return activeFilter;
  }, [hoveredCityId, activeFilter]);

  const selectedCity = useMemo(
    () => CITIES.find((c) => c.id === selectedCityId) ?? CITIES[0],
    [selectedCityId]
  );

  const sortedRecommendations = useMemo(() => {
    return [...CITIES]
      .map((c) => ({
        ...c,
        relevance: c.line === activeFilter ? c.strength + 100 : c.strength,
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3);
  }, [activeFilter]);

  const topRecommendationId = sortedRecommendations[0]?.id;

  return (
    <section dir="rtl" className="w-full pt-12 md:pt-16 pb-14 md:pb-16 space-y-10 md:space-y-12">
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

      {/* Filters */}
      <div className="md:flex md:flex-wrap md:justify-center md:gap-3 md:px-3">
        <div
          className="flex md:flex-wrap md:justify-center gap-2.5 md:gap-3 overflow-x-auto md:overflow-visible px-5 md:px-0 pb-2 md:pb-0 scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {FILTERS.map((f) => {
            const active = f.key === activeFilter;
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className="shrink-0 px-4 md:px-5 py-2.5 rounded-full text-[13px] md:text-sm font-body transition-all duration-300 flex items-center gap-1.5 md:gap-2 whitespace-nowrap hover:scale-[1.04]"
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
                  minHeight: 40,
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map */}
      <div className="px-4 md:px-0">
        <div
          className="relative w-full overflow-hidden rounded-2xl mystical-card-elevated"
          style={{
            height: "min(48vh, 520px)",
            minHeight: 280,
            boxShadow: "0 0 50px hsl(var(--gold) / 0.18), inset 0 0 80px hsl(222 50% 4% / 0.7)",
            border: "1px solid hsl(var(--gold) / 0.35)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 50%, hsl(215 70% 18% / 0.45) 0%, hsl(222 50% 4%) 75%)",
            }}
          />

          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
            <defs>
              <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(43 80% 65%)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(43 80% 65%)" stopOpacity="0" />
              </radialGradient>
            </defs>

            {[10, 20, 30, 40, 50].map((y) => (
              <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="hsl(var(--gold))" strokeOpacity="0.07" strokeWidth="0.12" />
            ))}
            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((x) => (
              <line key={`v${x}`} x1={x} y1="0" x2={x} y2="60" stroke="hsl(var(--gold))" strokeOpacity="0.07" strokeWidth="0.12" />
            ))}

            {CONTINENT_PATHS.map((d, i) => (
              <path
                key={`c${i}`}
                d={d}
                fill="none"
                stroke="hsl(215 50% 55%)"
                strokeOpacity="0.18"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Planetary lines with focus dimming */}
            {LINES.map((l) => {
              const isFocus = l.key === focusLine;
              return (
                <path
                  key={l.key}
                  d={l.d}
                  fill="none"
                  stroke={LINE_COLORS[l.key]}
                  strokeWidth={isFocus ? 0.85 : 0.45}
                  opacity={isFocus ? 1 : 0.18}
                  style={{
                    filter: isFocus ? `drop-shadow(0 0 1.5px ${LINE_COLORS[l.key]})` : "none",
                    transition: "opacity 0.4s ease, stroke-width 0.4s ease",
                  }}
                />
              );
            })}

            {/* City markers (non-interactive layer for halo/pulse) */}
            {CITIES.map((c) => {
              const isSelected = c.id === selectedCityId;
              const isHover = c.id === hoveredCityId;
              const emphasized = isSelected || isHover;
              return (
                <g key={c.id} className={c.mobile ? "" : "hidden md:block"}>
                  <circle cx={c.x} cy={c.y * 0.6} r={emphasized ? 4.5 : 3} fill="url(#cityGlow)" style={{ transition: "all 0.3s ease" }} />
                  <circle cx={c.x} cy={c.y * 0.6} r={emphasized ? 1.3 : 0.9} fill="hsl(var(--gold))" style={{ transition: "all 0.3s ease" }}>
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={c.x} cy={c.y * 0.6} r={emphasized ? 2.4 : 1.6} fill="none" stroke="hsl(var(--gold))" strokeOpacity={emphasized ? 0.7 : 0.4} strokeWidth="0.18" style={{ transition: "all 0.3s ease" }} />
                </g>
              );
            })}
          </svg>

          {/* Clickable city overlays (HTML for tap targets + Hebrew label) */}
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
                  left: `${c.x}%`,
                  top: `${c.y * 0.6 / 60 * 100}%`,
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
                    color: isSelected ? "hsl(var(--gold))" : "hsl(var(--gold) / 0.85)",
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
