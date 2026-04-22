import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, Sparkles, Star, Heart, Briefcase, Home, Flower2, Coins } from "lucide-react";

const FILTERS = [
  { label: "אהבה", icon: Heart },
  { label: "קריירה", icon: Briefcase },
  { label: "מגורים", icon: Home },
  { label: "התפתחות רוחנית", icon: Flower2 },
  { label: "שפע", icon: Coins },
];

const CITIES = [
  { name: "לונדון", x: 49, y: 30 },
  { name: "ניו יורק", x: 26, y: 38 },
  { name: "ברצלונה", x: 48, y: 38 },
  { name: "באלי", x: 76, y: 62 },
  { name: "טוקיו", x: 86, y: 40 },
];

const MAP_LEGEND = [
  { label: "קו אהבה", color: "hsl(340 75% 60%)" },
  { label: "קו קריירה", color: "hsl(43 80% 55%)" },
  { label: "קו התפתחות רוחנית", color: "hsl(215 70% 60%)" },
];

const RECOMMENDATIONS = [
  {
    city: "לונדון",
    country: "אנגליה",
    planet: "צדק ♃",
    theme: "קריירה והזדמנויות",
    strength: 92,
    blurb: "כאן נפתח שער של התרחבות מקצועית, נראות ציבורית וצמיחה עוצמתית.",
  },
  {
    city: "ברצלונה",
    country: "ספרד",
    planet: "ונוס ♀",
    theme: "אהבה ויצירתיות",
    strength: 87,
    blurb: "הקו הוונוסיאני מעורר רומנטיקה, השראה אמנותית ושמחת חיים אמיתית.",
  },
  {
    city: "באלי",
    country: "אינדונזיה",
    planet: "נפטון ♆",
    theme: "התפתחות רוחנית",
    strength: 95,
    blurb: "אדמת קסם נפטונית — מרחב לריפוי עמוק, מדיטציה והתחברות לעצמי הגבוה.",
  },
];

const PLANET_MEANINGS = [
  { symbol: "☉", name: "שמש", meaning: "נראות, ביטוי עצמי, הנהגה וזוהר אישי." },
  { symbol: "☽", name: "ירח", meaning: "רגש, בית, אינטואיציה ותחושת שייכות." },
  { symbol: "♀", name: "ונוס", meaning: "אהבה, הרמוניה, יופי ומשיכה." },
  { symbol: "♂", name: "מאדים", meaning: "תשוקה, פעולה, אומץ ודחף לצמיחה." },
  { symbol: "♃", name: "צדק", meaning: "שפע, הזדמנויות, התרחבות והצלחה." },
];

// Stylized continent silhouettes (very simplified, decorative)
const CONTINENT_PATHS = [
  // Americas
  "M 18 22 Q 22 18, 26 24 Q 28 32, 24 40 Q 20 46, 22 52 Q 26 56, 24 60",
  // Europe/Africa
  "M 46 22 Q 52 20, 54 28 Q 52 34, 50 40 Q 48 50, 50 58",
  // Asia/Oceania
  "M 60 20 Q 72 18, 82 24 Q 88 30, 86 38 Q 80 42, 76 50 Q 78 58, 74 62",
];

const AstrocartographySection = () => {
  const [activeFilter, setActiveFilter] = useState<string>("אהבה");
  const [legendOpen, setLegendOpen] = useState(false);

  return (
    <section dir="rtl" className="w-full pt-16 pb-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 px-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-5 h-5" style={{ color: "hsl(var(--gold))" }} />
          <h2 className="font-heading text-3xl md:text-4xl gold-gradient-text leading-tight">
            מפת אסטרו־קרטוגרפיה
          </h2>
          <Sparkles className="w-5 h-5" style={{ color: "hsl(var(--gold))" }} />
        </div>
        <p
          className="font-body text-base md:text-lg leading-relaxed"
          style={{ color: "hsl(var(--foreground) / 0.8)" }}
        >
          גלו היכן בעולם האנרגיה שלכם מתחזקת בתחומי אהבה, קריירה, מגורים והתפתחות רוחנית.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-3 px-3">
        {FILTERS.map((f) => {
          const active = f.label === activeFilter;
          const Icon = f.icon;
          return (
            <button
              key={f.label}
              onClick={() => setActiveFilter(f.label)}
              className="px-5 py-2.5 rounded-full text-sm font-body transition-all duration-300 flex items-center gap-2"
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
                transform: active ? "translateY(-1px)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.boxShadow = "0 0 16px hsl(var(--gold) / 0.25)";
                  e.currentTarget.style.borderColor = "hsl(var(--gold) / 0.45)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.boxShadow = "0 2px 8px hsl(222 50% 4% / 0.4)";
                  e.currentTarget.style.borderColor = "hsl(var(--gold) / 0.2)";
                }
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Map container */}
      <div
        className="relative w-full overflow-hidden rounded-2xl mystical-card-elevated"
        style={{
          height: "min(65vh, 520px)",
          minHeight: 360,
          boxShadow:
            "0 0 50px hsl(var(--gold) / 0.18), inset 0 0 80px hsl(222 50% 4% / 0.7)",
          border: "1px solid hsl(var(--gold) / 0.35)",
        }}
      >
        {/* Cosmic background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, hsl(215 70% 18% / 0.45) 0%, hsl(222 50% 4%) 75%)",
          }}
        />

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGold" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(43 80% 55%)" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(43 80% 55%)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="hsl(43 80% 55%)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineCelestial" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(215 70% 60%)" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(215 70% 60%)" stopOpacity="0.75" />
              <stop offset="100%" stopColor="hsl(215 70% 60%)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineRose" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(340 75% 60%)" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(340 75% 60%)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(340 75% 60%)" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="cityGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(43 80% 65%)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="hsl(43 80% 65%)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Latitude/longitude grid */}
          {[10, 20, 30, 40, 50].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="hsl(var(--gold))" strokeOpacity="0.07" strokeWidth="0.12" />
          ))}
          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="60" stroke="hsl(var(--gold))" strokeOpacity="0.07" strokeWidth="0.12" />
          ))}

          {/* Continent silhouettes (decorative, soft) */}
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

          {/* Astrocartography lines - love (rose) */}
          <path d="M 0 35 Q 25 50, 50 38 T 100 42" fill="none" stroke="url(#lineRose)" strokeWidth="0.55" />
          {/* Career (gold) */}
          <path d="M 0 18 Q 30 8, 55 22 T 100 28" fill="none" stroke="url(#lineGold)" strokeWidth="0.6" />
          {/* Spiritual (celestial blue) */}
          <path d="M 0 48 Q 35 30, 65 50 T 100 38" fill="none" stroke="url(#lineCelestial)" strokeWidth="0.55" />
          {/* Subtle accent dashed */}
          <path d="M 0 12 Q 40 28, 70 14 T 100 20" fill="none" stroke="url(#lineGold)" strokeWidth="0.35" strokeDasharray="0.8 0.6" opacity="0.6" />

          {/* City markers with halo */}
          {CITIES.map((c) => (
            <g key={c.name}>
              <circle cx={c.x} cy={c.y * 0.6} r="3" fill="url(#cityGlow)" />
              <circle cx={c.x} cy={c.y * 0.6} r="0.9" fill="hsl(var(--gold))">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx={c.x} cy={c.y * 0.6} r="1.6" fill="none" stroke="hsl(var(--gold))" strokeOpacity="0.4" strokeWidth="0.18" />
            </g>
          ))}
        </svg>

        {/* City labels (HTML overlay for Hebrew) */}
        {CITIES.map((c) => (
          <div
            key={c.name}
            className="absolute text-[11px] md:text-xs font-body pointer-events-none flex items-center gap-1"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              transform: "translate(-50%, -180%)",
              color: "hsl(var(--gold))",
              textShadow: "0 0 10px hsl(222 50% 4%), 0 0 6px hsl(222 50% 4%)",
              whiteSpace: "nowrap",
            }}
          >
            <MapPin className="w-3 h-3" style={{ color: "hsl(var(--gold))" }} />
            <span>{c.name}</span>
          </div>
        ))}

        {/* In-map legend (top-left visually = top-right in RTL container, force LTR position) */}
        <div
          dir="rtl"
          className="absolute top-3 right-3 px-3 py-2.5 rounded-lg space-y-1.5"
          style={{
            background: "hsl(222 50% 4% / 0.65)",
            backdropFilter: "blur(8px)",
            border: "1px solid hsl(var(--gold) / 0.25)",
          }}
        >
          {MAP_LEGEND.map((l) => (
            <div key={l.label} className="flex items-center gap-2 text-[10px] md:text-[11px] font-body" style={{ color: "hsl(var(--gold) / 0.9)" }}>
              <span
                className="inline-block rounded-full"
                style={{
                  width: 14,
                  height: 2,
                  background: l.color,
                  boxShadow: `0 0 6px ${l.color}`,
                }}
              />
              {l.label}
            </div>
          ))}
        </div>

        {/* Center caption */}
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center pointer-events-none px-4">
          <div
            className="text-center px-5 py-2.5 rounded-xl"
            style={{
              background: "hsl(222 50% 4% / 0.6)",
              backdropFilter: "blur(8px)",
              border: "1px solid hsl(var(--gold) / 0.22)",
            }}
          >
            <p className="font-heading text-xs md:text-sm" style={{ color: "hsl(var(--gold) / 0.9)" }}>
              כאן תופיע מפת האסטרו־קרטוגרפיה האישית שלכם
            </p>
          </div>
        </div>
      </div>

      {/* Selected location insight */}
      <div
        className="mystical-card-elevated p-6 md:p-7 space-y-4"
        style={{
          boxShadow: "0 0 30px hsl(var(--gold) / 0.12), inset 0 1px 0 hsl(var(--gold) / 0.1)",
          border: "1px solid hsl(var(--gold) / 0.3)",
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" style={{ color: "hsl(var(--gold))" }} />
            <h3 className="font-heading text-lg md:text-xl" style={{ color: "hsl(var(--gold))" }}>
              פירוש המקום עבורך — לונדון
            </h3>
          </div>
          <span className="text-xs font-body px-2.5 py-1 rounded-full" style={{
            background: "hsl(var(--gold) / 0.12)",
            color: "hsl(var(--gold) / 0.9)",
            border: "1px solid hsl(var(--gold) / 0.25)",
          }}>
            מקום נבחר לדוגמה
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <div className="text-[11px] font-body" style={{ color: "hsl(var(--foreground) / 0.55)" }}>שם המקום</div>
            <div className="font-heading text-sm" style={{ color: "hsl(var(--gold) / 0.95)" }}>לונדון, אנגליה</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] font-body" style={{ color: "hsl(var(--foreground) / 0.55)" }}>הקו הדומיננטי</div>
            <div className="font-heading text-sm" style={{ color: "hsl(var(--gold) / 0.95)" }}>צדק ♃</div>
          </div>
          <div className="space-y-1">
            <div className="text-[11px] font-body" style={{ color: "hsl(var(--foreground) / 0.55)" }}>תחום השפעה</div>
            <div className="font-heading text-sm" style={{ color: "hsl(var(--gold) / 0.95)" }}>קריירה והזדמנויות</div>
          </div>
          <div className="space-y-1 col-span-2 md:col-span-3">
            <div className="text-[11px] font-body" style={{ color: "hsl(var(--foreground) / 0.55)" }}>עוצמת חיבור</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--deep-blue-light) / 0.6)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "92%",
                    background: "linear-gradient(90deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
                    boxShadow: "0 0 12px hsl(var(--gold) / 0.6)",
                  }}
                />
              </div>
              <span className="font-heading text-sm" style={{ color: "hsl(var(--gold))" }}>92%</span>
            </div>
          </div>
        </div>

        <p className="font-body text-sm md:text-base leading-relaxed" style={{ color: "hsl(var(--foreground) / 0.82)" }}>
          לונדון נושאת עבורכם אנרגיה של התרחבות, נראות מקצועית והכרה. כאן הזדמנויות חדשות נפתחות בקלות וקול הסמכות הפנימית שלכם נשמע ברור יותר.
        </p>
      </div>

      {/* Recommendations */}
      <div className="space-y-6">
        <h3 className="text-center font-heading text-2xl md:text-3xl gold-gradient-text">
          המקומות המומלצים עבורך
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {RECOMMENDATIONS.map((r) => (
            <motion.div
              key={r.city}
              whileHover={{ y: -5 }}
              className="mystical-card p-6 flex flex-col gap-4 h-full"
              style={{
                boxShadow:
                  "0 6px 24px hsl(222 50% 4% / 0.55), inset 0 1px 0 hsl(var(--gold) / 0.1)",
                border: "1px solid hsl(var(--gold) / 0.22)",
              }}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading text-xl" style={{ color: "hsl(var(--gold))" }}>
                    {r.city}
                  </h4>
                  <span className="text-sm font-body" style={{ color: "hsl(var(--gold) / 0.75)" }}>
                    {r.planet}
                  </span>
                </div>
                <div className="text-xs font-body" style={{ color: "hsl(var(--foreground) / 0.6)" }}>
                  {r.country}
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t" style={{ borderColor: "hsl(var(--gold) / 0.15)" }}>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-body" style={{ color: "hsl(var(--foreground) / 0.55)" }}>הקו הדומיננטי</span>
                  <span className="text-xs font-heading" style={{ color: "hsl(var(--gold) / 0.9)" }}>{r.planet}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-body" style={{ color: "hsl(var(--foreground) / 0.55)" }}>תחום מרכזי</span>
                  <span className="text-xs font-heading" style={{ color: "hsl(var(--gold) / 0.9)" }}>{r.theme}</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-body" style={{ color: "hsl(var(--foreground) / 0.55)" }}>עוצמת חיבור</span>
                    <span className="text-xs font-heading" style={{ color: "hsl(var(--gold))" }}>{r.strength}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--deep-blue-light) / 0.6)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${r.strength}%`,
                        background: "linear-gradient(90deg, hsl(var(--gold-dark)), hsl(var(--gold)))",
                        boxShadow: "0 0 8px hsl(var(--gold) / 0.5)",
                      }}
                    />
                  </div>
                </div>
              </div>

              <p
                className="font-body text-sm leading-relaxed flex-1"
                style={{ color: "hsl(var(--foreground) / 0.78)" }}
              >
                {r.blurb}
              </p>
              <button className="btn-outline-gold text-xs py-2.5 px-4 mt-auto">
                קראו פירוש מלא
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Collapsible legend */}
      <div className="mystical-card overflow-hidden" style={{ border: "1px solid hsl(var(--gold) / 0.22)" }}>
        <button
          onClick={() => setLegendOpen((v) => !v)}
          className="w-full flex items-center justify-between p-5 transition-colors"
          style={{ color: "hsl(var(--gold))" }}
        >
          <span className="font-heading text-base md:text-lg">
            מה המשמעות של הקווים הפלנטריים?
          </span>
          <ChevronDown
            className="w-5 h-5 transition-transform duration-300"
            style={{ transform: legendOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          />
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
              <div className="px-5 pb-5 pt-1 space-y-3">
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
                      <div className="font-heading text-sm md:text-base" style={{ color: "hsl(var(--gold) / 0.95)" }}>
                        {p.name}
                      </div>
                      <div
                        className="font-body text-sm leading-relaxed mt-0.5"
                        style={{ color: "hsl(var(--foreground) / 0.78)" }}
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
    </section>
  );
};

export default AstrocartographySection;
