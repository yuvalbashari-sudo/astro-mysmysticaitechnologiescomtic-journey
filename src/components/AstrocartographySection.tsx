import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, MapPin, Sparkles } from "lucide-react";

const FILTERS = ["אהבה", "קריירה", "מגורים", "התפתחות רוחנית", "שפע"];

const CITIES = [
  { name: "לונדון", x: 50, y: 32 },
  { name: "ניו יורק", x: 26, y: 38 },
  { name: "פריז", x: 51, y: 35 },
  { name: "טוקיו", x: 84, y: 42 },
];

const RECOMMENDATIONS = [
  {
    city: "לונדון",
    planet: "צדק ♃",
    area: "קריירה והזדמנויות",
    blurb: "כאן השער שלכם להתרחבות מקצועית, נראות וצמיחה אישית נפתח לרווחה.",
  },
  {
    city: "ברצלונה",
    planet: "ונוס ♀",
    area: "אהבה ויצירתיות",
    blurb: "הקו הוונוסיאני מעורר רומנטיקה, השראה אמנותית ושמחת חיים עמוקה.",
  },
  {
    city: "באלי",
    planet: "נפטון ♆",
    area: "התפתחות רוחנית",
    blurb: "אדמת הקסם של נפטון — מרחב לריפוי, מדיטציה והתחברות לעצמי הגבוה.",
  },
];

const PLANET_MEANINGS = [
  { symbol: "☉", name: "שמש", meaning: "נראות, ביטחון עצמי, הנהגה וזוהר אישי." },
  { symbol: "☽", name: "ירח", meaning: "רגש, בית, אינטואיציה ותחושת שייכות." },
  { symbol: "♀", name: "ונוס", meaning: "אהבה, יופי, הרמוניה ויצירתיות." },
  { symbol: "♂", name: "מאדים", meaning: "פעולה, תשוקה, אומץ ודחף לצמיחה." },
  { symbol: "♃", name: "צדק", meaning: "שפע, הזדמנויות, הרחבה והצלחה." },
];

const AstrocartographySection = () => {
  const [activeFilter, setActiveFilter] = useState<string>("אהבה");
  const [legendOpen, setLegendOpen] = useState(false);

  return (
    <section dir="rtl" className="w-full pt-10 pb-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 px-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: "hsl(var(--gold))" }} />
          <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text">
            מפת אסטרו־קרטוגרפיה
          </h2>
          <Sparkles className="w-5 h-5" style={{ color: "hsl(var(--gold))" }} />
        </div>
        <p
          className="font-body text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
          style={{ color: "hsl(var(--foreground) / 0.75)" }}
        >
          גלו היכן בעולם האנרגיה שלכם מתחזקת בתחומי אהבה, קריירה, מגורים והתפתחות רוחנית.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-2 px-2">
        {FILTERS.map((f) => {
          const active = f === activeFilter;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="px-4 py-2 rounded-full text-sm font-body transition-all duration-300"
              style={{
                background: active
                  ? "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))"
                  : "hsl(var(--deep-blue-light) / 0.6)",
                color: active ? "hsl(var(--deep-blue))" : "hsl(var(--gold) / 0.85)",
                border: `1px solid hsl(var(--gold) / ${active ? 0.6 : 0.2})`,
                boxShadow: active ? "0 0 20px hsl(var(--gold) / 0.35)" : "none",
                fontWeight: active ? 700 : 500,
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Map container */}
      <div
        className="relative w-full overflow-hidden rounded-2xl mystical-card-elevated"
        style={{
          height: "min(60vh, 460px)",
          minHeight: 320,
          boxShadow:
            "0 0 40px hsl(var(--gold) / 0.15), inset 0 0 60px hsl(222 50% 4% / 0.6)",
          border: "1px solid hsl(var(--gold) / 0.3)",
        }}
      >
        {/* Background cosmic gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, hsl(215 70% 18% / 0.4) 0%, hsl(222 50% 4%) 70%)",
          }}
        />

        {/* Subtle grid */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGold" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(43 80% 55%)" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(43 80% 55%)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(43 80% 55%)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineCelestial" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(215 70% 60%)" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(215 70% 60%)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="hsl(215 70% 60%)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineCrimson" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(0 65% 55%)" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(0 65% 55%)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(0 65% 55%)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Latitude/longitude faint grid */}
          {[10, 20, 30, 40, 50].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="hsl(var(--gold))" strokeOpacity="0.06" strokeWidth="0.15" />
          ))}
          {[10, 25, 40, 55, 70, 85].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="60" stroke="hsl(var(--gold))" strokeOpacity="0.06" strokeWidth="0.15" />
          ))}

          {/* Astrocartography curved lines */}
          <path d="M 0 18 Q 30 8, 55 22 T 100 28" fill="none" stroke="url(#lineGold)" strokeWidth="0.6" />
          <path d="M 0 35 Q 25 50, 50 38 T 100 42" fill="none" stroke="url(#lineCelestial)" strokeWidth="0.6" />
          <path d="M 0 48 Q 35 30, 65 50 T 100 38" fill="none" stroke="url(#lineCrimson)" strokeWidth="0.5" />
          <path d="M 0 12 Q 40 28, 70 14 T 100 20" fill="none" stroke="url(#lineGold)" strokeWidth="0.4" strokeDasharray="0.8 0.6" />

          {/* City markers */}
          {CITIES.map((c) => (
            <g key={c.name}>
              <circle cx={c.x} cy={c.y * 0.6} r="0.9" fill="hsl(var(--gold))" opacity="0.95">
                <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx={c.x} cy={c.y * 0.6} r="2" fill="none" stroke="hsl(var(--gold))" strokeOpacity="0.3" strokeWidth="0.2" />
            </g>
          ))}
        </svg>

        {/* City labels overlay (HTML for Hebrew text) */}
        {CITIES.map((c) => (
          <div
            key={c.name}
            className="absolute text-[11px] md:text-xs font-body pointer-events-none"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              transform: "translate(-50%, -160%)",
              color: "hsl(var(--gold))",
              textShadow: "0 0 8px hsl(222 50% 4%), 0 0 4px hsl(222 50% 4%)",
              whiteSpace: "nowrap",
            }}
          >
            <MapPin className="w-3 h-3 inline-block ml-1" style={{ color: "hsl(var(--gold))" }} />
            {c.name}
          </div>
        ))}

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="text-center px-6 py-3 rounded-xl"
            style={{
              background: "hsl(222 50% 4% / 0.55)",
              backdropFilter: "blur(6px)",
              border: "1px solid hsl(var(--gold) / 0.2)",
            }}
          >
            <p className="font-heading text-sm md:text-base" style={{ color: "hsl(var(--gold) / 0.9)" }}>
              כאן תופיע מפת האסטרו־קרטוגרפיה האישית שלכם
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-5 pt-2">
        <h3 className="text-center font-heading text-xl md:text-2xl gold-gradient-text">
          המקומות המומלצים עבורך
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RECOMMENDATIONS.map((r) => (
            <motion.div
              key={r.city}
              whileHover={{ y: -4 }}
              className="mystical-card p-5 flex flex-col gap-3"
              style={{
                boxShadow:
                  "0 4px 20px hsl(222 50% 4% / 0.5), inset 0 1px 0 hsl(var(--gold) / 0.08)",
              }}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-heading text-lg" style={{ color: "hsl(var(--gold))" }}>
                  {r.city}
                </h4>
                <span className="text-sm font-body" style={{ color: "hsl(var(--gold) / 0.7)" }}>
                  {r.planet}
                </span>
              </div>
              <div
                className="text-xs font-body inline-block px-2 py-1 rounded-full self-start"
                style={{
                  background: "hsl(var(--gold) / 0.1)",
                  color: "hsl(var(--gold) / 0.85)",
                  border: "1px solid hsl(var(--gold) / 0.2)",
                }}
              >
                {r.area}
              </div>
              <p
                className="font-body text-sm leading-relaxed flex-1"
                style={{ color: "hsl(var(--foreground) / 0.78)" }}
              >
                {r.blurb}
              </p>
              <button className="btn-outline-gold text-xs py-2 px-4 mt-1">
                קראו פירוש מלא
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Collapsible legend */}
      <div className="mystical-card overflow-hidden">
        <button
          onClick={() => setLegendOpen((v) => !v)}
          className="w-full flex items-center justify-between p-4 md:p-5 transition-colors"
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
        {legendOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="px-4 md:px-5 pb-5 space-y-3"
            style={{ borderTop: "1px solid hsl(var(--gold) / 0.15)" }}
          >
            {PLANET_MEANINGS.map((p) => (
              <div key={p.name} className="flex items-start gap-3 pt-3">
                <span
                  className="font-heading text-xl shrink-0"
                  style={{ color: "hsl(var(--gold))", minWidth: "1.75rem" }}
                >
                  {p.symbol}
                </span>
                <div>
                  <div className="font-heading text-sm" style={{ color: "hsl(var(--gold) / 0.95)" }}>
                    {p.name}
                  </div>
                  <div
                    className="font-body text-sm leading-relaxed"
                    style={{ color: "hsl(var(--foreground) / 0.75)" }}
                  >
                    {p.meaning}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default AstrocartographySection;
