import { useState, useCallback, useRef } from "react";
import CinematicModalShell from "@/components/CinematicModalShell";
import BirthDetailsForm, { type BirthDetails } from "@/components/BirthDetailsForm";
import NatalChartWheel, {
  PLANETS,
  calculatePlanetPositions,
  getZodiacForAngle,
} from "@/components/NatalChartWheel";
import ChartLoadingRitual from "@/components/ChartLoadingRitual";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Loader2, Copy, Check, Download,
  Image as ImageIcon, ChevronDown, Star,
} from "lucide-react";
import html2canvas from "html2canvas";
import { getZodiacSign } from "@/data/zodiacData";
import { getRisingSign } from "@/data/risingSignData";
import { streamMysticalReading, renderMysticalText } from "@/lib/aiStreaming";
import { readingsStorage } from "@/lib/readingsStorage";
import { mysticalProfile } from "@/lib/mysticalProfile";
import ShareResultSection from "@/components/ShareResultSection";
import TextSizeControl, { type TextSize } from "@/components/TextSizeControl";
import { toast } from "@/components/ui/sonner";
import { useT, useLanguage } from "@/i18n/LanguageContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Phase = "form" | "loading" | "chart" | "result";

interface ChartData {
  sunSign: { hebrewName: string; symbol: string; element: string };
  risingSign: { hebrewName: string; symbol: string; element: string };
  moonSign: string;
  planetPositions: Record<string, number>;
  ascendantAngle: number;
}

const BirthChartModal = ({ isOpen, onClose }: Props) => {
  const t = useT();
  const { language, dir } = useLanguage();
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<Phase>("form");
  const [details, setDetails] = useState<BirthDetails>({
    userName: "",
    gender: mysticalProfile.getUserGender() || "",
    birthDate: "",
    birthTime: "",
    birthCity: "",
  });
  const [attempted, setAttempted] = useState(false);
  const [resultText, setResultText] = useState("");
  const [aiStreaming, setAiStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>("default");
  const chartContentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  const { userName, gender, birthDate, birthTime, birthCity } = details;

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setPhase("form");
      setResultText("");
      setChartData(null);
      setDetails({
        userName: "",
        gender: mysticalProfile.getUserGender() || "",
        birthDate: "",
        birthTime: "",
        birthCity: "",
      });
      setAttempted(false);
      setAiStreaming(false);
    }, 300);
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    setAttempted(true);
    if (!birthDate || !birthTime || !birthCity.trim()) {
      toast.error(t.birth_chart_error_required);
      return;
    }
    if (userName.trim()) mysticalProfile.recordUserName(userName.trim());
    if (gender) mysticalProfile.recordGender(gender);

    // Calculate chart data
    const dateObj = new Date(birthDate);
    const [hour, minute] = birthTime.split(":").map(Number);
    const sunSign = getZodiacSign(dateObj);
    const risingData = getRisingSign(hour, minute);
    const planetPositions = calculatePlanetPositions(dateObj, hour, minute);
    const moonSignName = getZodiacForAngle(planetPositions.moon);
    const ascendantAngle = ((hour * 60 + minute) / 1440) * 360;

    setChartData({
      sunSign: { hebrewName: sunSign.hebrewName, symbol: sunSign.symbol, element: sunSign.element },
      risingSign: {
        hebrewName: risingData.hebrewName.replace(" עולה", ""),
        symbol: risingData.symbol,
        element: risingData.element,
      },
      moonSign: moonSignName,
      planetPositions,
      ascendantAngle,
    });

    // Record profile
    mysticalProfile.recordZodiac(sunSign.hebrewName, sunSign.symbol, sunSign.element, birthDate);
    mysticalProfile.recordRising(risingData.hebrewName, risingData.symbol, risingData.element, birthTime);

    // Enter loading phase
    setPhase("loading");
  }, [birthDate, birthTime, birthCity, userName, gender, t]);

  const startAIInterpretation = useCallback(() => {
    if (!chartData) return;
    setPhase("chart");
    setResultText("");
    setAiStreaming(true);

    const dateObj = new Date(birthDate);
    const [hour, minute] = birthTime.split(":").map(Number);
    const planetPositions = chartData.planetPositions;
    const ascendantAngle = chartData.ascendantAngle;

    const planetSignsText = PLANETS.map((p) => {
      const angle = planetPositions[p.key];
      const sign = getZodiacForAngle(angle);
      const degree = Math.floor(angle % 30);
      const house = Math.floor(((angle - ascendantAngle + 360) % 360) / 30) + 1;
      return `${p.name} (${p.symbol}): ${sign} ${degree}° — בית ${house}`;
    }).join("\n");

    const userGender = gender || mysticalProfile.getUserGender();

    streamMysticalReading(
      "birthChart",
      {
        birthDate,
        birthTime,
        birthCity: birthCity.trim(),
        sunSign: chartData.sunSign.hebrewName,
        sunSymbol: chartData.sunSign.symbol,
        sunElement: chartData.sunSign.element,
        risingSign: chartData.risingSign.hebrewName,
        risingSymbol: chartData.risingSign.symbol,
        risingElement: chartData.risingSign.element,
        moonSign: chartData.moonSign,
        planetPositions: planetSignsText,
        userName: userName.trim() || undefined,
        language,
        gender: userGender || undefined,
      },
      (delta) => setResultText((prev) => prev + delta),
      () => {
        setAiStreaming(false);
        setPhase("result");
        readingsStorage.save({
          type: "birth-chart",
          title: `מפת לידה — ${chartData.sunSign.hebrewName} ${chartData.sunSign.symbol}`,
          subtitle: `☉ ${chartData.sunSign.hebrewName} | ⬆ ${chartData.risingSign.hebrewName} | ☽ ${chartData.moonSign}`,
          symbol: "🌌",
          data: { birthDate, birthTime, birthCity },
        });
      },
      (err) => {
        toast.error(err);
        setAiStreaming(false);
        setPhase("form");
      },
      language,
    );
  }, [chartData, birthDate, birthTime, birthCity, userName, gender, language]);

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
  }, [birthDate, t]);

  if (!isOpen) return null;

  const showResult = phase === "chart" || phase === "result";
  const wheelSize = isMobile ? 320 : 420;

  return (
    <CinematicModalShell
      isOpen={isOpen}
      onClose={handleClose}
      fullscreen={isMobile}
      hideAdvisor={isMobile}
    >
      <div
        ref={scrollRef}
        className={showResult ? "overflow-y-auto max-h-[90vh] scrollbar-hide" : ""}
      >
        <div ref={chartContentRef} className="p-4 md:p-8">
          <AnimatePresence mode="wait">
            {/* ════════ FORM PHASE ════════ */}
            {phase === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-lg mx-auto"
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center"
                    style={{
                      background: "radial-gradient(circle, hsl(var(--gold) / 0.12), transparent)",
                      border: "1px solid hsl(var(--gold) / 0.18)",
                    }}
                    animate={{
                      boxShadow: [
                        "0 0 20px hsl(43 80% 55% / 0.08)",
                        "0 0 50px hsl(43 80% 55% / 0.2)",
                        "0 0 20px hsl(43 80% 55% / 0.08)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <span className="text-3xl">🌌</span>
                  </motion.div>
                  <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-3">
                    {t.birth_chart_title}
                  </h2>
                  <p
                    className="font-body text-sm max-w-md mx-auto leading-relaxed"
                    style={{ color: "hsl(var(--foreground) / 0.6)" }}
                  >
                    {t.birth_chart_desc}
                  </p>
                </div>

                {/* Form */}
                <div className="space-y-5">
                  <BirthDetailsForm
                    values={details}
                    onChange={(patch) => setDetails((prev) => ({ ...prev, ...patch }))}
                    attempted={attempted}
                    showTime={true}
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    className="btn-gold w-full text-base font-heading flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    {t.birth_chart_cta}
                  </motion.button>

                  <p
                    className="text-center text-xs font-body"
                    style={{ color: "hsl(var(--foreground) / 0.35)" }}
                  >
                    {t.birth_chart_note}
                  </p>
                </div>
              </motion.div>
            )}

            {/* ════════ LOADING RITUAL ════════ */}
            {phase === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ChartLoadingRitual
                  userName={userName.trim() || undefined}
                  onComplete={startAIInterpretation}
                />
              </motion.div>
            )}

            {/* ════════ CHART + RESULT PHASE ════════ */}
            {showResult && chartData && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* ── Premium Header ── */}
                <div className="text-center">
                  {userName.trim() && (
                    <motion.p
                      className="font-body text-sm mb-2"
                      style={{ color: "hsl(var(--gold) / 0.5)" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {language === "he"
                        ? `מפת הלידה של ${userName.trim()}`
                        : `${userName.trim()}'s Birth Chart`}
                    </motion.p>
                  )}
                  <motion.h2
                    className="font-heading text-2xl md:text-4xl gold-gradient-text mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {t.birth_chart_title}
                  </motion.h2>
                  <motion.p
                    className="font-body text-xs"
                    style={{ color: "hsl(var(--foreground) / 0.4)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {birthCity} • {birthDate} • {birthTime}
                  </motion.p>
                </div>

                {/* ── Triad badges ── */}
                <motion.div
                  className="flex flex-wrap justify-center gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div
                    className="px-4 py-2 rounded-full font-body text-xs flex items-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--gold) / 0.1), hsl(var(--gold) / 0.03))",
                      border: "1px solid hsl(var(--gold) / 0.2)",
                      color: "hsl(var(--gold))",
                    }}
                  >
                    <span>☉</span>
                    {t.birth_chart_sun}: {chartData.sunSign.hebrewName} {chartData.sunSign.symbol}
                  </div>
                  <div
                    className="px-4 py-2 rounded-full font-body text-xs flex items-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--crimson) / 0.08), hsl(var(--crimson) / 0.02))",
                      border: "1px solid hsl(var(--crimson) / 0.2)",
                      color: "hsl(var(--crimson-light))",
                    }}
                  >
                    <span>⬆</span>
                    {t.birth_chart_rising}: {chartData.risingSign.hebrewName} {chartData.risingSign.symbol}
                  </div>
                  <div
                    className="px-4 py-2 rounded-full font-body text-xs flex items-center gap-2"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--celestial) / 0.08), hsl(var(--celestial) / 0.02))",
                      border: "1px solid hsl(var(--celestial) / 0.2)",
                      color: "hsl(215, 70%, 60%)",
                    }}
                  >
                    <span>☽</span>
                    {t.birth_chart_moon}: {chartData.moonSign}
                  </div>
                </motion.div>

                {/* ── Natal Chart Wheel ── */}
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div
                    className="rounded-full p-4"
                    style={{
                      background: "radial-gradient(circle, hsl(222 47% 8% / 0.8), transparent 80%)",
                    }}
                  >
                    <NatalChartWheel
                      planetPositions={chartData.planetPositions}
                      ascendantAngle={chartData.ascendantAngle}
                      size={wheelSize}
                    />
                  </div>
                </motion.div>

                {/* ── Planet positions grid ── */}
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-5 gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  {PLANETS.map((p) => {
                    const angle = chartData.planetPositions[p.key];
                    const sign = getZodiacForAngle(angle);
                    const degree = Math.floor(angle % 30);
                    const house =
                      Math.floor(
                        ((angle - chartData.ascendantAngle + 360) % 360) / 30,
                      ) + 1;
                    return (
                      <div
                        key={p.key}
                        className="px-3 py-2.5 rounded-xl text-center transition-all duration-300 hover:scale-105"
                        style={{
                          background: "linear-gradient(145deg, hsl(222 40% 10% / 0.6), hsl(222 47% 6% / 0.8))",
                          border: `1px solid ${p.color}22`,
                          backdropFilter: "blur(8px)",
                        }}
                      >
                        <span
                          className="text-lg block"
                          style={{ color: p.color, filter: `drop-shadow(0 0 4px ${p.color}44)` }}
                        >
                          {p.symbol}
                        </span>
                        <span
                          className="text-xs font-body block"
                          style={{ color: p.color, opacity: 0.8 }}
                        >
                          {p.name}
                        </span>
                        <span
                          className="text-xs font-body block"
                          style={{ color: "hsl(var(--foreground) / 0.55)" }}
                        >
                          {sign} {degree}°
                        </span>
                        <span
                          className="text-[10px] font-body block"
                          style={{ color: "hsl(var(--foreground) / 0.3)" }}
                        >
                          {language === "he" ? `בית ${house}` : `House ${house}`}
                        </span>
                      </div>
                    );
                  })}
                </motion.div>

                {/* ── Divider ── */}
                <div className="flex items-center justify-center gap-3 py-4">
                  <div
                    className="h-px flex-1 max-w-[80px]"
                    style={{
                      background: "linear-gradient(to right, transparent, hsl(var(--gold) / 0.2))",
                    }}
                  />
                  <Star
                    className="w-4 h-4"
                    style={{ color: "hsl(var(--gold) / 0.25)" }}
                  />
                  <div
                    className="h-px flex-1 max-w-[80px]"
                    style={{
                      background: "linear-gradient(to left, transparent, hsl(var(--gold) / 0.2))",
                    }}
                  />
                </div>

                {/* ── Interpretation heading ── */}
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  <h3
                    className="font-heading text-lg md:text-xl mb-1"
                    style={{ color: "hsl(var(--gold) / 0.8)" }}
                  >
                    {language === "he" ? "הפירוש האישי שלך" : "Your Personal Interpretation"}
                  </h3>
                  <p
                    className="font-body text-xs"
                    style={{ color: "hsl(var(--foreground) / 0.35)" }}
                  >
                    {language === "he"
                      ? "ניתוח מעמיק של כל כוכבי הלכת במפת הלידה שלך"
                      : "In-depth analysis of all planets in your natal chart"}
                  </p>
                </motion.div>

                {/* ── Text size control ── */}
                <div className="flex justify-end">
                  <TextSizeControl value={textSize} onChange={setTextSize} />
                </div>

                {/* ── AI Interpretation ── */}
                {aiStreaming && !resultText && (
                  <div className="text-center py-8">
                    <Loader2
                      className="w-8 h-8 animate-spin mx-auto mb-3"
                      style={{ color: "hsl(var(--gold))" }}
                    />
                    <p
                      className="font-body text-sm"
                      style={{ color: "hsl(var(--foreground) / 0.5)" }}
                    >
                      {t.birth_chart_loading}
                    </p>
                  </div>
                )}

                {resultText && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mystical-card p-5 md:p-8"
                    style={{
                      boxShadow: "0 0 40px hsl(222 47% 6% / 0.5), inset 0 1px 0 hsl(var(--gold) / 0.06)",
                    }}
                  >
                    <div
                      style={{
                        textShadow:
                          "0 2px 20px hsl(222 47% 6%), 0 0 40px hsl(222 47% 6% / 0.6)",
                      }}
                    >
                      {renderMysticalText(resultText, textSize)}
                    </div>
                  </motion.div>
                )}

                {/* ── Action buttons ── */}
                {phase === "result" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5 pb-8"
                  >
                    <div className="flex flex-wrap justify-center gap-3">
                      <button
                        onClick={handleCopy}
                        className="btn-outline-gold flex items-center gap-2 text-sm px-5 py-2.5"
                      >
                        {copied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        {copied ? t.forecast_copied : t.forecast_copy}
                      </button>
                      <button
                        onClick={handleDownloadImage}
                        disabled={downloading}
                        className="btn-outline-gold flex items-center gap-2 text-sm px-5 py-2.5"
                      >
                        {downloading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ImageIcon className="w-4 h-4" />
                        )}
                        {t.birth_chart_save_image}
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
          </AnimatePresence>
        </div>
      </div>
    </CinematicModalShell>
  );
};

export default BirthChartModal;
