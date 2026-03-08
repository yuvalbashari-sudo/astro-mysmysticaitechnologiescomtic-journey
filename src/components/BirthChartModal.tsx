import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, Share2, Copy, Check } from "lucide-react";
import { getZodiacSign } from "@/data/zodiacData";
import { getRisingSign } from "@/data/risingSignData";
import { streamMysticalReading, renderMysticalText } from "@/lib/aiStreaming";
import { readingsStorage } from "@/lib/readingsStorage";
import { mysticalProfile } from "@/lib/mysticalProfile";
import ShareResultSection from "@/components/ShareResultSection";
import { toast } from "@/components/ui/sonner";
import { useT } from "@/i18n/LanguageContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ZODIAC_SIGNS = [
  { symbol: "♈", name: "טלה", angle: 0 },
  { symbol: "♉", name: "שור", angle: 30 },
  { symbol: "♊", name: "תאומים", angle: 60 },
  { symbol: "♋", name: "סרטן", angle: 90 },
  { symbol: "♌", name: "אריה", angle: 120 },
  { symbol: "♍", name: "בתולה", angle: 150 },
  { symbol: "♎", name: "מאזניים", angle: 180 },
  { symbol: "♏", name: "עקרב", angle: 210 },
  { symbol: "♐", name: "קשת", angle: 240 },
  { symbol: "♑", name: "גדי", angle: 270 },
  { symbol: "♒", name: "דלי", angle: 300 },
  { symbol: "♓", name: "דגים", angle: 330 },
];

const PLANETS = [
  { symbol: "☉", name: "שמש", key: "sun" },
  { symbol: "☽", name: "ירח", key: "moon" },
  { symbol: "☿", name: "כוכב חמה", key: "mercury" },
  { symbol: "♀", name: "נוגה", key: "venus" },
  { symbol: "♂", name: "מאדים", key: "mars" },
  { symbol: "♃", name: "צדק", key: "jupiter" },
  { symbol: "♄", name: "שבתאי", key: "saturn" },
];

// Approximate planet positions based on birth date (simplified)
function calculatePlanetPositions(birthDate: Date, birthHour: number, birthMinute: number) {
  const dayOfYear = Math.floor((birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const yearFraction = dayOfYear / 365;
  const timeFraction = (birthHour * 60 + birthMinute) / 1440;

  return {
    sun: (yearFraction * 360 + 280) % 360,
    moon: (yearFraction * 360 * 13.37 + timeFraction * 360 + 120) % 360,
    mercury: (yearFraction * 360 * 1.24 + 200) % 360,
    venus: (yearFraction * 360 * 0.615 + 50) % 360,
    mars: (yearFraction * 360 * 0.524 + 320) % 360,
    jupiter: (yearFraction * 360 * 0.0843 + 150) % 360,
    saturn: (yearFraction * 360 * 0.0339 + 240) % 360,
  };
}

function getZodiacForAngle(angle: number): string {
  const idx = Math.floor(((angle % 360 + 360) % 360) / 30);
  return ZODIAC_SIGNS[idx].name;
}

// Zodiac Wheel SVG
const ZodiacWheel = ({ planetPositions, ascendantAngle }: { planetPositions: Record<string, number>; ascendantAngle: number }) => {
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 155;
  const signR = 135;
  const innerR = 115;
  const planetR = 85;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[340px] mx-auto">
      {/* Outer glow */}
      <defs>
        <radialGradient id="chartGlow">
          <stop offset="0%" stopColor="hsl(43, 80%, 55%)" stopOpacity="0.05" />
          <stop offset="70%" stopColor="hsl(43, 80%, 55%)" stopOpacity="0.02" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <filter id="glowFilter">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx={cx} cy={cy} r={outerR + 10} fill="url(#chartGlow)" />

      {/* Outer circle */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="hsl(43, 80%, 55%)" strokeOpacity="0.3" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="hsl(43, 80%, 55%)" strokeOpacity="0.15" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={planetR - 15} fill="none" stroke="hsl(43, 80%, 55%)" strokeOpacity="0.1" strokeWidth="0.5" />

      {/* House lines */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 - 90 + ascendantAngle) * (Math.PI / 180);
        const x1 = cx + innerR * Math.cos(angle);
        const y1 = cy + innerR * Math.sin(angle);
        const x2 = cx + outerR * Math.cos(angle);
        const y2 = cy + outerR * Math.sin(angle);
        return (
          <line
            key={`house-${i}`}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="hsl(43, 80%, 55%)"
            strokeOpacity={i % 3 === 0 ? "0.4" : "0.15"}
            strokeWidth={i % 3 === 0 ? "1.5" : "0.5"}
          />
        );
      })}

      {/* Zodiac signs */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const angle = ((i * 30 + 15) - 90 + ascendantAngle) * (Math.PI / 180);
        const x = cx + signR * Math.cos(angle);
        const y = cy + signR * Math.sin(angle);
        return (
          <text
            key={sign.symbol}
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14"
            fill="hsl(43, 80%, 55%)"
            fillOpacity="0.7"
          >
            {sign.symbol}
          </text>
        );
      })}

      {/* Planets */}
      {PLANETS.map((planet) => {
        const pos = planetPositions[planet.key];
        const angle = (pos - 90 + ascendantAngle) * (Math.PI / 180);
        const x = cx + planetR * Math.cos(angle);
        const y = cy + planetR * Math.sin(angle);
        return (
          <g key={planet.key} filter="url(#glowFilter)">
            <circle cx={x} cy={y} r="12" fill="hsl(222, 40%, 10%)" stroke="hsl(43, 80%, 55%)" strokeOpacity="0.3" strokeWidth="0.5" />
            <text
              x={x} y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="11"
              fill="hsl(43, 80%, 55%)"
            >
              {planet.symbol}
            </text>
          </g>
        );
      })}

      {/* ASC marker */}
      {(() => {
        const angle = (ascendantAngle - 90) * (Math.PI / 180);
        const x = cx + (outerR + 12) * Math.cos(angle);
        const y = cy + (outerR + 12) * Math.sin(angle);
        return (
          <text
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="9"
            fontWeight="bold"
            fill="hsl(0, 65%, 45%)"
            filter="url(#glowFilter)"
          >
            ASC
          </text>
        );
      })()}

      {/* Center point */}
      <circle cx={cx} cy={cy} r="3" fill="hsl(43, 80%, 55%)" fillOpacity="0.5" />
    </svg>
  );
};

type Phase = "form" | "loading" | "result";

const BirthChartModal = ({ isOpen, onClose }: Props) => {
  const t = useT();
  const [phase, setPhase] = useState<Phase>("form");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [resultText, setResultText] = useState("");
  const [copied, setCopied] = useState(false);

  // Chart data
  const [chartData, setChartData] = useState<{
    sunSign: { hebrewName: string; symbol: string; element: string };
    risingSign: { hebrewName: string; symbol: string; element: string };
    moonSign: string;
    planetPositions: Record<string, number>;
    ascendantAngle: number;
  } | null>(null);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setPhase("form");
      setResultText("");
      setChartData(null);
      setBirthDate("");
      setBirthTime("");
      setBirthCity("");
    }, 300);
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    if (!birthDate || !birthTime) {
      toast.error(t.birth_chart_error_required);
      return;
    }

    const dateObj = new Date(birthDate);
    const [hour, minute] = birthTime.split(":").map(Number);

    // Calculate zodiac data
    const sunSign = getZodiacSign(dateObj);
    const risingData = getRisingSign(hour, minute);
    const planetPositions = calculatePlanetPositions(dateObj, hour, minute);
    const moonSignName = getZodiacForAngle(planetPositions.moon);
    const ascendantAngle = ((hour * 60 + minute) / 1440) * 360;

    const data = {
      sunSign: { hebrewName: sunSign.hebrewName, symbol: sunSign.symbol, element: sunSign.element },
      risingSign: { hebrewName: risingData.hebrewName.replace(" עולה", ""), symbol: risingData.symbol, element: risingData.element },
      moonSign: moonSignName,
      planetPositions,
      ascendantAngle,
    };
    setChartData(data);

    // Record into mystical profile
    mysticalProfile.recordZodiac(sunSign.hebrewName, sunSign.symbol, sunSign.element, birthDate);
    mysticalProfile.recordRising(risingData.hebrewName, risingData.symbol, risingData.element, birthTime);

    // Start AI interpretation
    setPhase("loading");
    setResultText("");

    const planetSignsText = PLANETS.map(p => {
      const angle = planetPositions[p.key];
      return `${p.name} (${p.symbol}): ${getZodiacForAngle(angle)}`;
    }).join("\n");

    streamMysticalReading(
      "birthChart",
      {
        birthDate,
        birthTime,
        birthCity: birthCity || "לא צוינה",
        sunSign: sunSign.hebrewName,
        sunSymbol: sunSign.symbol,
        sunElement: sunSign.element,
        risingSign: risingData.hebrewName,
        risingSymbol: risingData.symbol,
        risingElement: risingData.element,
        moonSign: moonSignName,
        planetPositions: planetSignsText,
      },
      (delta) => setResultText(prev => prev + delta),
      () => {
        setPhase("result");
        readingsStorage.save({
          type: "birth-chart",
          title: `מפת לידה — ${sunSign.hebrewName} ${sunSign.symbol}`,
          date: new Date().toISOString(),
          snippet: `☉ ${sunSign.hebrewName} | ⬆ ${risingData.hebrewName} | ☽ ${moonSignName}`,
        });
      },
      (err) => {
        toast.error(err);
        setPhase("form");
      }
    );
  }, [birthDate, birthTime, birthCity, t]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    toast.success(t.forecast_copied);
    setTimeout(() => setCopied(false), 2000);
  }, [resultText, t]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0"
          style={{ background: "hsl(var(--deep-blue) / 0.92)", backdropFilter: "blur(12px)" }}
          onClick={handleClose}
        />

        {/* Content */}
        <motion.div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 md:p-8"
          style={{
            background: "linear-gradient(145deg, hsl(var(--deep-blue-light)), hsl(var(--deep-blue)))",
            border: "1px solid hsl(var(--gold) / 0.2)",
            boxShadow: "0 0 60px hsl(var(--gold) / 0.08)",
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full transition-colors"
            style={{ background: "hsl(var(--deep-blue-light) / 0.8)" }}
          >
            <X className="w-5 h-5 text-gold" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <span className="text-3xl mb-2 block">🌌</span>
            <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-2">
              {t.birth_chart_title}
            </h2>
            <p className="text-muted-foreground font-body text-sm max-w-md mx-auto">
              {t.birth_chart_desc}
            </p>
          </div>

          {/* Form phase */}
          {phase === "form" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Birth Date */}
              <div>
                <label className="block text-gold font-heading text-sm mb-2">
                  {t.birth_chart_date_label}
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="mystical-input"
                />
              </div>

              {/* Birth Time */}
              <div>
                <label className="block text-gold font-heading text-sm mb-2">
                  {t.birth_chart_time_label}
                </label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="mystical-input"
                />
              </div>

              {/* Birth City */}
              <div>
                <label className="block text-gold font-heading text-sm mb-2">
                  {t.birth_chart_city_label}
                </label>
                <input
                  type="text"
                  value={birthCity}
                  onChange={(e) => setBirthCity(e.target.value)}
                  placeholder={t.birth_chart_city_placeholder}
                  className="mystical-input"
                  maxLength={100}
                />
              </div>

              {/* Submit button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="btn-gold w-full text-base font-heading"
              >
                <Sparkles className="w-4 h-4 inline-block ml-2" />
                {t.birth_chart_cta}
              </motion.button>

              <p className="text-center text-muted-foreground text-xs font-body">
                {t.birth_chart_note}
              </p>
            </motion.div>
          )}

          {/* Loading / Result phase — show chart + text */}
          {(phase === "loading" || phase === "result") && chartData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Chart summary badges */}
              <div className="flex flex-wrap justify-center gap-3">
                <span className="px-3 py-1.5 rounded-full text-xs font-body" style={{ background: "hsl(var(--gold) / 0.1)", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))" }}>
                  ☉ {t.birth_chart_sun}: {chartData.sunSign.hebrewName} {chartData.sunSign.symbol}
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs font-body" style={{ background: "hsl(var(--crimson) / 0.1)", border: "1px solid hsl(var(--crimson) / 0.2)", color: "hsl(var(--crimson-light))" }}>
                  ⬆ {t.birth_chart_rising}: {chartData.risingSign.hebrewName} {chartData.risingSign.symbol}
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs font-body" style={{ background: "hsl(var(--celestial) / 0.1)", border: "1px solid hsl(var(--celestial) / 0.2)", color: "hsl(215, 70%, 60%)" }}>
                  ☽ {t.birth_chart_moon}: {chartData.moonSign}
                </span>
              </div>

              {/* Zodiac Wheel */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative"
              >
                <div className="animate-pulse-glow rounded-full mx-auto" style={{ width: "fit-content" }}>
                  <ZodiacWheel
                    planetPositions={chartData.planetPositions}
                    ascendantAngle={chartData.ascendantAngle}
                  />
                </div>

                {/* Planet legend */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {PLANETS.map(p => (
                    <span key={p.key} className="text-xs text-muted-foreground font-body">
                      {p.symbol} {p.name}: {getZodiacForAngle(chartData.planetPositions[p.key])}
                    </span>
                  ))}
                </div>
              </motion.div>

              <div className="section-divider max-w-[120px] mx-auto" />

              {/* AI Interpretation */}
              {phase === "loading" && !resultText && (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm font-body">{t.birth_chart_loading}</p>
                </div>
              )}

              {resultText && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mystical-card p-5 md:p-6"
                >
                  {renderMysticalText(resultText)}
                </motion.div>
              )}

              {/* Actions */}
              {phase === "result" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={handleCopy}
                      className="btn-outline-gold flex items-center gap-2 text-xs px-4 py-2"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? t.forecast_copied : t.forecast_copy}
                    </button>
                  </div>

                  <ShareResultSection
                    text={resultText}
                    title={`מפת לידה — ${chartData.sunSign.hebrewName} ${chartData.sunSign.symbol}`}
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BirthChartModal;
