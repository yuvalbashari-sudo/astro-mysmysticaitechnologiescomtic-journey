import { useState, useCallback, useRef } from "react";
import MysticalNameInput from "@/components/MysticalNameInput";
import MysticalDateInput from "@/components/MysticalDateInput";
import CinematicModalShell from "@/components/CinematicModalShell";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Copy, Check, Download, Image as ImageIcon } from "lucide-react";
import html2canvas from "html2canvas";
import { getZodiacSign } from "@/data/zodiacData";
import { getRisingSign } from "@/data/risingSignData";
import { streamMysticalReading, renderMysticalText } from "@/lib/aiStreaming";
import { readingsStorage } from "@/lib/readingsStorage";
import { mysticalProfile } from "@/lib/mysticalProfile";
import ShareResultSection from "@/components/ShareResultSection";
import { toast } from "@/components/ui/sonner";
import { useT, useLanguage } from "@/i18n/LanguageContext";

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
  { symbol: "♅", name: "אורנוס", key: "uranus" },
  { symbol: "♆", name: "נפטון", key: "neptune" },
  { symbol: "♇", name: "פלוטו", key: "pluto" },
];

// Approximate planet positions based on birth date (simplified ephemeris)
function calculatePlanetPositions(birthDate: Date, birthHour: number, birthMinute: number) {
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
  const { language, dir } = useLanguage();
  const [phase, setPhase] = useState<Phase>("form");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [userName, setUserName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">(mysticalProfile.getUserGender() || "");
  const [resultText, setResultText] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const chartContentRef = useRef<HTMLDivElement>(null);

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
      setUserName("");
    }, 300);
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    if (!birthDate || !birthTime || !birthCity.trim()) {
      toast.error(t.birth_chart_error_required);
      return;
    }
    if (userName.trim()) mysticalProfile.recordUserName(userName.trim());

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
      const sign = getZodiacForAngle(angle);
      const degree = Math.floor(angle % 30);
      const house = Math.floor(((angle - ascendantAngle + 360) % 360) / 30) + 1;
      return `${p.name} (${p.symbol}): ${sign} ${degree}° — בית ${house}`;
    }).join("\n");

    const gender = mysticalProfile.getUserGender();

    streamMysticalReading(
      "birthChart",
      {
        birthDate,
        birthTime,
        birthCity: birthCity.trim(),
        sunSign: sunSign.hebrewName,
        sunSymbol: sunSign.symbol,
        sunElement: sunSign.element,
        risingSign: risingData.hebrewName,
        risingSymbol: risingData.symbol,
        risingElement: risingData.element,
        moonSign: moonSignName,
        planetPositions: planetSignsText,
        userName: userName.trim() || undefined,
        language,
        gender: gender || undefined,
      },
      (delta) => setResultText(prev => prev + delta),
      () => {
        setPhase("result");
        readingsStorage.save({
          type: "birth-chart",
          title: `מפת לידה — ${sunSign.hebrewName} ${sunSign.symbol}`,
          subtitle: `☉ ${sunSign.hebrewName} | ⬆ ${risingData.hebrewName} | ☽ ${moonSignName}`,
          symbol: "🌌",
          data: { birthDate, birthTime, birthCity },
        });
      },
      (err) => {
        toast.error(err);
        setPhase("form");
      },
      language,
    );
  }, [birthDate, birthTime, birthCity, t, language]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    toast.success(t.forecast_copied);
    setTimeout(() => setCopied(false), 2000);
  }, [resultText, t]);

  const handleDownloadImage = useCallback(async () => {
    if (!chartContentRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(chartContentRef.current, {
        backgroundColor: "#0a0f1e",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `astrologai-birth-chart-${birthDate}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success(t.toast_image_download_success);
    } catch {
      toast.error(t.toast_image_download_error);
    }
    setDownloading(false);
  }, [birthDate]);

  const handleDownloadPDF = useCallback(async () => {
    if (!chartContentRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(chartContentRef.current, {
        backgroundColor: "#0a0f1e",
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      // Create a printable HTML page with the image
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html dir="${dir}">
          <head>
            <title>${t.birth_chart_pdf_title}</title>
            <style>
              body { margin: 0; padding: 20px; background: #0a0f1e; display: flex; justify-content: center; }
              img { max-width: 100%; height: auto; }
              @media print { body { background: white; } }
            </style>
          </head>
          <body>
            <img src="${imgData}" />
            <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
      toast.success(t.toast_pdf_ready);
    } catch {
      toast.error(t.toast_pdf_error);
    }
    setDownloading(false);
  }, []);

  if (!isOpen) return null;

  return (
    <CinematicModalShell isOpen={isOpen} onClose={handleClose}>
        <div className="p-6 md:p-8">
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
              {/* Name input */}
              <MysticalNameInput value={userName} onChange={setUserName} delay={0.1} />

              {/* Birth Date */}
              <div>
                <label className="block text-gold font-heading text-sm mb-2">
                  {t.birth_chart_date_label}
                </label>
                <MysticalDateInput value={birthDate} onChange={setBirthDate} />
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
              ref={chartContentRef}
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

                {/* Planet positions grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                  {PLANETS.map(p => {
                    const angle = chartData.planetPositions[p.key];
                    const sign = getZodiacForAngle(angle);
                    const degree = Math.floor(angle % 30);
                    const house = Math.floor(((angle - chartData.ascendantAngle + 360) % 360) / 30) + 1;
                    return (
                      <div
                        key={p.key}
                        className="px-3 py-2 rounded-xl text-center"
                        style={{
                          background: "hsl(var(--gold) / 0.04)",
                          border: "1px solid hsl(var(--gold) / 0.1)",
                        }}
                      >
                        <span className="text-base block" style={{ color: "hsl(var(--gold))" }}>{p.symbol}</span>
                        <span className="text-xs font-body block" style={{ color: "hsl(var(--gold) / 0.8)" }}>{p.name}</span>
                        <span className="text-xs font-body block text-muted-foreground">{sign} {degree}°</span>
                        <span className="text-[10px] font-body block text-muted-foreground/60">בית {house}</span>
                      </div>
                    );
                  })}
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
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={handleCopy}
                      className="btn-outline-gold flex items-center gap-3 text-base px-6 py-3"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      {copied ? t.forecast_copied : t.forecast_copy}
                    </button>
                    <button
                      onClick={handleDownloadImage}
                      disabled={downloading}
                      className="btn-outline-gold flex items-center gap-3 text-base px-6 py-3"
                    >
                      {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                      {t.birth_chart_save_image}
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      disabled={downloading}
                      className="btn-outline-gold flex items-center gap-3 text-base px-6 py-3"
                    >
                      {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                      {t.birth_chart_save_pdf}
                    </button>
                  </div>

                  <ShareResultSection
                    symbol="🌌"
                    title={`מפת לידה — ${chartData.sunSign.hebrewName} ${chartData.sunSign.symbol}`}
                    subtitle={`☉ ${chartData.sunSign.hebrewName} | ⬆ ${chartData.risingSign.hebrewName} | ☽ ${chartData.moonSign}`}
                    readingText={resultText || undefined}
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
    </CinematicModalShell>
  );
};

export default BirthChartModal;
