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

// Full set for desktop
const CITIES = [
  { name: "לונדון", x: 49, y: 30, mobile: true },
  { name: "ניו יורק", x: 26, y: 38, mobile: true },
  { name: "ברצלונה", x: 48, y: 38, mobile: false },
  { name: "באלי", x: 76, y: 62, mobile: true },
  { name: "טוקיו", x: 86, y: 40, mobile: false },
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

const CONTINENT_PATHS = [
  "M 18 22 Q 22 18, 26 24 Q 28 32, 24 40 Q 20 46, 22 52 Q 26 56, 24 60",
  "M 46 22 Q 52 20, 54 28 Q 52 34, 50 40 Q 48 50, 50 58",
  "M 60 20 Q 72 18, 82 24 Q 88 30, 86 38 Q 80 42, 76 50 Q 78 58, 74 62",
];

const AstrocartographySection = () => {
  const [activeFilter, setActiveFilter] = useState<string>("אהבה");
  const [legendOpen, setLegendOpen] = useState(false);

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

      {/* Filters - horizontally scrollable on mobile */}
      <div className="md:flex md:flex-wrap md:justify-center md:gap-3 md:px-3">
        <div
          className="flex md:flex-wrap md:justify-center gap-2.5 md:gap-3 overflow-x-auto md:overflow-visible px-5 md:px-0 pb-2 md:pb-0 -mx-1 md:mx-0 scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {FILTERS.map((f) => {
            const active = f.label === activeFilter;
            const Icon = f.icon;
            return (
              <button
                key={f.label}
                onClick={() => setActiveFilter(f.label)}
                className="shrink-0 px-4 md:px-5 py-2.5 rounded-full text-[13px] md:text-sm font-body transition-all duration-300 flex items-center gap-1.5 md:gap-2 whitespace-nowrap"
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

      {/* Map container */}
      <div className="px-4 md:px-0">
        <div
          className="relative w-full overflow-hidden rounded-2xl mystical-card-elevated"
          style={{
            height: "min(48vh, 520px)",
            minHeight: 280,
            boxShadow:
              "0 0 50px hsl(var(--gold) / 0.18), inset 0 0 80px hsl(222 50% 4% / 0.7)",
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

            <path d="M 0 35 Q 25 50, 50 38 T 100 42" fill="none" stroke="url(#lineRose)" strokeWidth="0.55" />
            <path d="M 0 18 Q 30 8, 55 22 T 100 28" fill="none" stroke="url(#lineGold)" strokeWidth="0.6" />
            <path d="M 0 48 Q 35 30, 65 50 T 100 38" fill="none" stroke="url(#lineCelestial)" strokeWidth="0.55" />
            <path d="M 0 12 Q 40 28, 70 14 T 100 20" fill="none" stroke="url(#lineGold)" strokeWidth="0.35" strokeDasharray="0.8 0.6" opacity="0.6" />

            {CITIES.map((c) => (
              <g key={c.name} className={c.mobile ? "" : "hidden md:block"}>
                <circle cx={c.x} cy={c.y * 0.6} r="3" fill="url(#cityGlow)" />
                <circle cx={c.x} cy={c.y * 0.6} r="0.9" fill="hsl(var(--gold))">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx={c.x} cy={c.y * 0.6} r="1.6" fill="none" stroke="hsl(var(--gold))" strokeOpacity="0.4" strokeWidth="0.18" />
              </g>
            ))}
          </svg>

          {CITIES.map((c) => (
            <div
              key={c.name}
              className={`absolute text-[10px] md:text-xs font-body pointer-events-none flex items-center gap-1 ${c.mobile ? "" : "hidden md:flex"}`}
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                transform: "translate(-50%, -180%)",
                color: "hsl(var(--gold))",
                textShadow: "0 0 10px hsl(222 50% 4%), 0 0 6px hsl(222 50% 4%)",
                whiteSpace: "nowrap",
              }}
            >
              <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3" style={{ color: "hsl(var(--gold))" }} />
              <span>{c.name}</span>
            </div>
          ))}

          {/* In-map legend */}
          <div
            dir="rtl"
            className="absolute top-2 right-2 md:top-3 md:right-3 px-2.5 py-2 md:px-3 md:py-2.5 rounded-lg space-y-1 md:space-y-1.5"
            style={{
              background: "hsl(222 50% 4% / 0.7)",
              backdropFilter: "blur(8px)",
              border: "1px solid hsl(var(--gold) / 0.25)",
              maxWidth: "55%",
            }}
          >
            {MAP_LEGEND.map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[11px] font-body" style={{ color: "hsl(var(--gold) / 0.9)" }}>
                <span
                  className="inline-block rounded-full shrink-0"
                  style={{
                    width: 12,
                    height: 2,
                    background: l.color,
                    boxShadow: `0 0 6px ${l.color}`,
                  }}
                />
                {l.label}
              </div>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-3 md:bottom-4 flex items-center justify-center pointer-events-none px-4">
            <div
              className="text-center px-4 py-2 md:px-5 md:py-2.5 rounded-xl"
              style={{
                background: "hsl(222 50% 4% / 0.7)",
                backdropFilter: "blur(8px)",
                border: "1px solid hsl(var(--gold) / 0.22)",
              }}
            >
              <p className="font-heading text-[11px] md:text-sm leading-snug" style={{ color: "hsl(var(--gold) / 0.9)" }}>
                כאן תופיע מפת האסטרו־קרטוגרפיה האישית שלכם
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selected location insight */}
      <div className="px-4 md:px-0">
        <div
          className="mystical-card-elevated p-5 md:p-7 space-y-4 md:space-y-4"
          style={{
            boxShadow: "0 0 30px hsl(var(--gold) / 0.12), inset 0 1px 0 hsl(var(--gold) / 0.1)",
            border: "1px solid hsl(var(--gold) / 0.3)",
          }}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--gold))" }} />
              <h3 className="font-heading text-base md:text-xl leading-snug" style={{ color: "hsl(var(--gold))" }}>
                פירוש המקום עבורך — לונדון
              </h3>
            </div>
            <span className="text-[10px] md:text-xs font-body px-2.5 py-1 rounded-full" style={{
              background: "hsl(var(--gold) / 0.12)",
              color: "hsl(var(--gold) / 0.9)",
              border: "1px solid hsl(var(--gold) / 0.25)",
            }}>
              מקום נבחר לדוגמה
            </span>
          </div>

          {/* Stacked rows on mobile, grid on desktop */}
          <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-3">
            <div className="flex justify-between items-center md:block md:space-y-1 pb-2.5 md:pb-0 border-b md:border-0" style={{ borderColor: "hsl(var(--gold) / 0.12)" }}>
              <div className="text-[11px] md:text-[11px] font-body" style={{ color: "hsl(var(--foreground) / 0.6)" }}>שם המקום</div>
              <div className="font-heading text-sm md:text-sm" style={{ color: "hsl(var(--gold) / 0.95)" }}>לונדון, אנגליה</div>
            </div>
            <div className="flex justify-between items-center md:block md:space-y-1 pb-2.5 md:pb-0 border-b md:border-0" style={{ borderColor: "hsl(var(--gold) / 0.12)" }}>
              <div className="text-[11px] md:text-[11px] font-body" style={{ color: "hsl(var(--foreground) / 0.6)" }}>הקו הדומיננטי</div>
              <div className="font-heading text-sm md:text-sm" style={{ color: "hsl(var(--gold) / 0.95)" }}>צדק ♃</div>
            </div>
            <div className="flex justify-between items-center md:block md:space-y-1 pb-2.5 md:pb-0 border-b md:border-0" style={{ borderColor: "hsl(var(--gold) / 0.12)" }}>
              <div className="text-[11px] md:text-[11px] font-body" style={{ color: "hsl(var(--foreground) / 0.6)" }}>תחום השפעה</div>
              <div className="font-heading text-sm md:text-sm" style={{ color: "hsl(var(--gold) / 0.95)" }}>קריירה והזדמנויות</div>
            </div>
            <div className="space-y-1.5 md:space-y-1 md:col-span-3">
              <div className="text-[11px] font-body" style={{ color: "hsl(var(--foreground) / 0.6)" }}>עוצמת חיבור</div>
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

          <p className="font-body text-[14px] md:text-base leading-[1.85] md:leading-relaxed pt-1" style={{ color: "hsl(var(--foreground) / 0.85)" }}>
            לונדון נושאת עבורכם אנרגיה של התרחבות, נראות מקצועית והכרה. כאן הזדמנויות חדשות נפתחות בקלות וקול הסמכות הפנימית שלכם נשמע ברור יותר.
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-5 md:space-y-6 px-4 md:px-0">
        <h3 className="text-center font-heading text-xl md:text-3xl gold-gradient-text">
          המקומות המומלצים עבורך
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {RECOMMENDATIONS.map((r) => (
            <motion.div
              key={r.city}
              whileHover={{ y: -5 }}
              className="mystical-card p-5 md:p-6 flex flex-col gap-4 h-full"
              style={{
                boxShadow:
                  "0 6px 24px hsl(222 50% 4% / 0.55), inset 0 1px 0 hsl(var(--gold) / 0.1)",
                border: "1px solid hsl(var(--gold) / 0.22)",
              }}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading text-lg md:text-xl" style={{ color: "hsl(var(--gold))" }}>
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

              <div className="space-y-2.5 pt-1 border-t" style={{ borderColor: "hsl(var(--gold) / 0.15)" }}>
                <div className="flex items-center justify-between pt-2.5">
                  <span className="text-[11px] md:text-[11px] font-body" style={{ color: "hsl(var(--foreground) / 0.6)" }}>הקו הדומיננטי</span>
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
                className="font-body text-[14px] md:text-sm leading-[1.8] md:leading-relaxed flex-1"
                style={{ color: "hsl(var(--foreground) / 0.8)" }}
              >
                {r.blurb}
              </p>
              <button className="btn-outline-gold text-sm md:text-xs py-3 md:py-2.5 px-4 mt-auto w-full">
                קראו פירוש מלא
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Collapsible legend */}
      <div className="px-4 md:px-0">
        <div className="mystical-card overflow-hidden" style={{ border: "1px solid hsl(var(--gold) / 0.22)" }}>
          <button
            onClick={() => setLegendOpen((v) => !v)}
            className="w-full flex items-center justify-between p-5 md:p-5 transition-colors"
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
                <div className="px-5 md:px-5 pb-5 pt-2 space-y-4 md:space-y-3">
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
