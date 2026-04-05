import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import html2canvas from "html2canvas";
import { Check, Copy, Image as ImageIcon, Loader2, Sparkles, Star } from "lucide-react";
import CinematicModalShell from "@/components/CinematicModalShell";
import BirthDetailsForm, { type BirthDetails } from "@/components/BirthDetailsForm";
import { PLANETS } from "@/components/NatalChartWheel";
import SimpleNatalChart from "@/components/SimpleNatalChart";
import ChartLoadingRitual from "@/components/ChartLoadingRitual";
import TextSizeControl, { type TextSize } from "@/components/TextSizeControl";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage, useT } from "@/i18n/LanguageContext";
import { getChartLabels } from "@/lib/astroLocale";
import { streamMysticalReading, renderMysticalText } from "@/lib/aiStreaming";
import { readingsStorage } from "@/lib/readingsStorage";
import { mysticalProfile } from "@/lib/mysticalProfile";
import { calculateNatalChart, type NatalChartResult } from "@/lib/natalChart";
import { toast } from "@/components/ui/sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Phase = "form" | "loading" | "chart" | "result";

const PLANET_COLOR_BY_KEY = Object.fromEntries(PLANETS.map((planet) => [planet.key, planet.color]));

const BirthChartModal = ({ isOpen, onClose }: Props) => {
  const { language, dir, isRTL } = useLanguage();
  const t = useT();
  const chartLabels = getChartLabels(language);
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
  const [preparingChart, setPreparingChart] = useState(false);
  const [chartData, setChartData] = useState<NatalChartResult | null>(null);
  const [resultText, setResultText] = useState("");
  const [aiStreaming, setAiStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>("default");
  const chartContentRef = useRef<HTMLDivElement>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);

  const { userName, gender, birthDate, birthTime, birthCity } = details;
  const showResult = phase === "chart" || phase === "result";
  const wheelSize = isMobile ? 300 : 460;

  const houseSummary = useMemo(
    () => (chartData?.dominantHouses || []).slice(0, 3).map(({ house, count }) => `${chartLabels.house} ${house} (${count})`).join(" • "),
    [chartData, chartLabels],
  );

  const elementSummary = useMemo(
    () => (chartData?.dominantElements || []).slice(0, 3).map(({ element, count }) => `${element} (${count})`).join(" • "),
    [chartData],
  );

  useEffect(() => {
    if (!isOpen) return;

    const frame = requestAnimationFrame(() => {
      if (modalScrollRef.current) {
        modalScrollRef.current.scrollTop = 0;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen, phase]);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setPhase("form");
      setDetails({
        userName: "",
        gender: mysticalProfile.getUserGender() || "",
        birthDate: "",
        birthTime: "",
        birthCity: "",
      });
      setAttempted(false);
      setPreparingChart(false);
      setChartData(null);
      setResultText("");
      setAiStreaming(false);
      setCopied(false);
      setTextSize("default");
    }, 300);
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    setAttempted(true);

    if (!gender || !birthDate || !birthTime || !birthCity.trim()) {
      toast.error(t.chart_form_error);
      return;
    }

    if (userName.trim()) mysticalProfile.recordUserName(userName.trim());
    if (gender) mysticalProfile.recordGender(gender);

    setPreparingChart(true);

    try {
      const natalChart = await calculateNatalChart({
        birthDate,
        birthTime,
        birthPlace: birthCity.trim(),
      });

      setChartData(natalChart);
      mysticalProfile.recordZodiac(natalChart.sunSign.hebrewName, natalChart.sunSign.symbol, natalChart.sunSign.element, birthDate);
      mysticalProfile.recordRising(`${natalChart.risingSign.hebrewName} עולה`, natalChart.risingSign.symbol, natalChart.risingSign.element, birthTime);
      setPhase("loading");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t.chart_form_error);
    } finally {
      setPreparingChart(false);
    }
  }, [birthCity, birthDate, birthTime, gender, userName]);

  const startAIInterpretation = useCallback(() => {
    if (!chartData) return;

    setPhase("chart");
    setResultText("");
    setAiStreaming(true);

    const planetLines = chartData.planetPlacements
      .map((planet) => `${planet.symbol} ${planet.name}: ${planet.sign} ${planet.degree}° — ${chartLabels.house} ${planet.house}`)
      .join("\n");

    const aspectLines = chartData.aspects.length
      ? chartData.aspects.map((aspect) => `${aspect.label} — orb ${aspect.orb}°`).join("\n")
      : chartLabels.noStrongAspects;

    const houseLines = chartData.houseCusps
      .map((house) => `${chartLabels.house} ${house.house}: ${house.sign} ${house.degree}°`)
      .join("\n");

    const dominantText = [
      `${chartLabels.dominantElements}: ${elementSummary || chartLabels.notDetected}`,
      `${chartLabels.dominantHouses}: ${houseSummary || chartLabels.notDetected}`,
    ].join("\n");

    streamMysticalReading(
      "birthChart",
      {
        birthDate,
        birthTime,
        birthCity: chartData.location.name,
        sunSign: chartData.sunSign.hebrewName,
        sunSymbol: chartData.sunSign.symbol,
        sunElement: chartData.sunSign.element,
        risingSign: chartData.risingSign.hebrewName,
        risingSymbol: chartData.risingSign.symbol,
        risingElement: chartData.risingSign.element,
        moonSign: chartData.moonSign,
        planetPositions: planetLines,
        houseCusps: houseLines,
        majorAspects: aspectLines,
        dominantEnergies: dominantText,
        coordinates: `${chartData.location.latitude.toFixed(4)}, ${chartData.location.longitude.toFixed(4)}`,
        timezone: chartData.location.timezone,
        userName: userName.trim() || undefined,
        gender,
      },
      (delta) => setResultText((prev) => prev + delta),
      () => {
        setAiStreaming(false);
        setPhase("result");
        readingsStorage.save({
          type: "birth-chart",
          title: `${chartLabels.birthChart} — ${chartData.sunSign.hebrewName} ${chartData.sunSign.symbol}`,
          subtitle: `☉ ${chartData.sunSign.hebrewName} | ⬆ ${chartData.risingSign.hebrewName} | ☽ ${chartData.moonSign}`,
          symbol: "🌌",
          data: { birthDate, birthTime, birthCity: chartData.location.name },
        });
      },
      (error) => {
        toast.error(error);
        setAiStreaming(false);
        setPhase("form");
      },
      language,
    );
  }, [birthDate, birthTime, chartData, chartLabels, elementSummary, gender, houseSummary, language, userName]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(resultText);
    toast.success(t.chart_copied);
    setTimeout(() => setCopied(false), 2000);
    setTimeout(() => setCopied(false), 2000);
  }, [resultText]);

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
      link.download = `birth-chart-${birthDate}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success(t.toast_image_download_success);
    } catch {
      toast.error(t.toast_image_download_error);
    } finally {
      setDownloading(false);
    }
  }, [birthDate]);

  if (!isOpen) return null;

  return (
    <CinematicModalShell
      isOpen={isOpen}
      onClose={handleClose}
      scrollRef={modalScrollRef}
      fullscreen={isMobile}
      hideAdvisor={isMobile}
      wide={showResult && !isMobile}
    >
      <div dir={dir}>
        <div ref={chartContentRef} className="p-4 md:p-8">
          <AnimatePresence mode="sync">
            {phase === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-lg mx-auto"
              >
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
                  <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-3">{t.chart_title}</h2>
                  <p className="font-body text-sm max-w-md mx-auto leading-relaxed" style={{ color: "hsl(var(--foreground) / 0.6)" }}>
                    {t.chart_subtitle}
                  </p>
                </div>

                <div className="space-y-5">
                  <BirthDetailsForm
                    values={details}
                    onChange={(patch) => setDetails((prev) => ({ ...prev, ...patch }))}
                    attempted={attempted}
                    showTime
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={preparingChart}
                    className="btn-gold w-full text-base font-heading flex items-center justify-center gap-2"
                  >
                    {preparingChart ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {preparingChart ? t.chart_form_loading : t.birth_chart_cta}
                  </motion.button>

                  <p className="text-center text-xs font-body" style={{ color: "hsl(var(--foreground) / 0.35)" }}>
                    {t.chart_form_note}
                  </p>
                </div>
              </motion.div>
            )}

            {phase === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ChartLoadingRitual userName={userName.trim() || undefined} onComplete={startAIInterpretation} />
              </motion.div>
            )}

              {showResult && (
              <div key="result" className="space-y-8">
                <div
                  className="w-full"
                  style={{
                    minHeight: wheelSize + 48,
                    display: "block",
                    overflow: "visible",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <div
                    className="mx-auto w-full rounded-[2rem]"
                    style={{
                      maxWidth: wheelSize + (isMobile ? 28 : 64),
                      minHeight: wheelSize + 32,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      background: "radial-gradient(ellipse 80% 70% at 50% 45%, hsl(var(--deep-blue-light) / 0.5), hsl(var(--deep-blue) / 0.96))",
                      border: "1px solid hsl(var(--gold) / 0.14)",
                      boxShadow: "0 0 60px hsl(var(--deep-blue) / 0.55), inset 0 1px 0 hsl(var(--gold) / 0.05)",
                      padding: isMobile ? 10 : 24,
                      overflow: "visible",
                    }}
                  >
                    <SimpleNatalChart
                      planetPositions={chartData?.planetPositions}
                      ascendantAngle={chartData?.ascendantAngle}
                      size={wheelSize}
                    />
                  </div>
                </div>

                <div className="text-center">
                  {userName.trim() && (
                    <p className="font-body text-sm mb-2" style={{ color: "hsl(var(--gold) / 0.5)" }}>
                      {t.chart_of_name} {userName.trim()}
                    </p>
                  )}
                  <h2 className="font-heading text-2xl md:text-4xl gold-gradient-text mb-2">
                    {t.chart_personal_title}
                  </h2>
                  <p className="font-body text-xs" style={{ color: "hsl(var(--foreground) / 0.4)" }}>
                      {chartData ? `${chartData.location.name} • ${birthDate} • ${birthTime}` : t.chart_computing}
                  </p>
                </div>

                {chartData && (
                <div className="grid md:grid-cols-3 gap-3 w-full">
                  <div className="mystical-card p-4 text-center">
                    <div className="text-xs font-body mb-2" style={{ color: "hsl(var(--gold) / 0.55)" }}>{chartLabels.sun}</div>
                    <div className="font-heading text-lg" style={{ color: "hsl(var(--gold))" }}>{chartData.sunSign.symbol} {chartData.sunSign.hebrewName}</div>
                  </div>
                  <div className="mystical-card p-4 text-center">
                    <div className="text-xs font-body mb-2" style={{ color: "hsl(var(--gold) / 0.55)" }}>{t.chart_asc_horizon}</div>
                    <div className="font-heading text-lg" style={{ color: "hsl(var(--gold))" }}>{chartData.risingSign.symbol} {chartData.risingSign.hebrewName}</div>
                  </div>
                  <div className="mystical-card p-4 text-center">
                    <div className="text-xs font-body mb-2" style={{ color: "hsl(var(--gold) / 0.55)" }}>{chartLabels.moon}</div>
                    <div className="font-heading text-lg" style={{ color: "hsl(var(--gold))" }}>☽ {chartData.moonSign}</div>
                  </div>
                </div>
                )}

                {chartData && (
                <div className="grid xl:grid-cols-3 gap-4 w-full">
                  <div className="mystical-card p-4">
                    <div className="font-heading text-base mb-2" style={{ color: "hsl(var(--gold) / 0.85)" }}>{t.chart_birth_location}</div>
                    <p className="font-body text-sm" style={{ color: "hsl(var(--foreground) / 0.78)" }}>{chartData.location.name}</p>
                    <p className="font-body text-xs mt-2" style={{ color: "hsl(var(--foreground) / 0.45)" }}>
                      {chartData.location.latitude.toFixed(4)}°, {chartData.location.longitude.toFixed(4)}° • {chartData.location.timezone}
                    </p>
                  </div>
                  <div className="mystical-card p-4">
                    <div className="font-heading text-base mb-2" style={{ color: "hsl(var(--gold) / 0.85)" }}>{t.chart_dominance}</div>
                    <p className="font-body text-sm" style={{ color: "hsl(var(--foreground) / 0.78)" }}>{chartLabels.elements}: {elementSummary}</p>
                    <p className="font-body text-sm mt-2" style={{ color: "hsl(var(--foreground) / 0.78)" }}>{chartLabels.houses}: {houseSummary}</p>
                  </div>
                  {!!chartData.aspects.length && (
                    <div className="mystical-card p-4">
                      <div className="font-heading text-base mb-2" style={{ color: "hsl(var(--gold) / 0.85)" }}>{t.chart_key_aspects}</div>
                      <div className="space-y-2">
                        {chartData.aspects.slice(0, 4).map((aspect) => (
                          <p key={aspect.label} className="font-body text-sm" style={{ color: "hsl(var(--foreground) / 0.74)" }}>
                            {aspect.label}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                )}

                {chartData && (
                <motion.div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  {chartData.planetPlacements.map((planet) => (
                    <div
                      key={planet.key}
                      className="px-3 py-3 rounded-xl text-center"
                      style={{
                        background: "linear-gradient(145deg, hsl(222 40% 10% / 0.6), hsl(222 47% 6% / 0.8))",
                        border: `1px solid ${(PLANET_COLOR_BY_KEY[planet.key] || "#E8B84B")}22`,
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <span className="text-lg block" style={{ color: PLANET_COLOR_BY_KEY[planet.key] || "#E8B84B" }}>{planet.symbol}</span>
                      <span className="text-xs font-body block" style={{ color: "hsl(var(--foreground) / 0.9)" }}>{planet.name}</span>
                      <span className="text-xs font-body block" style={{ color: "hsl(var(--foreground) / 0.6)" }}>{planet.sign} {planet.degree}°</span>
                      <span className="text-[10px] font-body block" style={{ color: "hsl(var(--foreground) / 0.35)" }}>{chartLabels.house} {planet.house}</span>
                    </div>
                  ))}
                </motion.div>
                )}

                {chartData && (
                <motion.div className="grid md:grid-cols-2 gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="mystical-card p-4">
                    <div className="font-heading text-base mb-3" style={{ color: "hsl(var(--gold) / 0.85)" }}>{t.chart_house_cusps}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {chartData.houseCusps.map((house) => (
                        <div key={house.house} className="rounded-lg px-3 py-2" style={{ background: "hsl(var(--deep-blue-light) / 0.35)" }}>
                          <div className="text-xs font-body" style={{ color: "hsl(var(--foreground) / 0.5)" }}>{chartLabels.house} {house.house}</div>
                          <div className="text-sm font-body" style={{ color: "hsl(var(--foreground) / 0.82)" }}>{house.sign} {house.degree}°</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mystical-card p-4">
                    <div className="font-heading text-base mb-3" style={{ color: "hsl(var(--gold) / 0.85)" }}>{t.chart_gravity_center}</div>
                    <div className="space-y-2">
                      {(chartData.dominantElements || []).slice(0, 4).map((entry) => (
                        <div key={entry.element} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "hsl(var(--deep-blue-light) / 0.35)" }}>
                          <span className="font-body text-sm" style={{ color: "hsl(var(--foreground) / 0.82)" }}>{entry.element}</span>
                          <span className="font-body text-xs" style={{ color: "hsl(var(--gold) / 0.7)" }}>{entry.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
                )}

                <div className="flex items-center justify-center gap-3 py-4">
                  <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(to right, transparent, hsl(var(--gold) / 0.2))" }} />
                  <Star className="w-4 h-4" style={{ color: "hsl(var(--gold) / 0.25)" }} />
                  <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(to left, transparent, hsl(var(--gold) / 0.2))" }} />
                </div>

                <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="font-heading text-lg md:text-xl mb-1" style={{ color: "hsl(var(--gold) / 0.8)" }}>{t.chart_full_interp_title}</h3>
                  <p className="font-body text-xs" style={{ color: "hsl(var(--foreground) / 0.35)" }}>
                    {t.chart_full_interp_desc}
                  </p>
                </motion.div>

                <div className="flex justify-end">
                  <TextSizeControl value={textSize} onChange={setTextSize} />
                </div>

                {aiStreaming && !resultText && (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: "hsl(var(--gold))" }} />
                    <p className="font-body text-sm" style={{ color: "hsl(var(--foreground) / 0.5)" }}>{t.birth_chart_loading}</p>
                  </div>
                )}

                {resultText && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mystical-card p-5 md:p-8" style={{ boxShadow: "0 0 40px hsl(222 47% 6% / 0.5), inset 0 1px 0 hsl(var(--gold) / 0.06)" }}>
                    <div dir={dir} style={{ textAlign: isRTL ? "right" : "left", textShadow: "0 2px 20px hsl(222 47% 6%), 0 0 40px hsl(222 47% 6% / 0.6)" }}>
                      {renderMysticalText(resultText, textSize)}
                    </div>
                  </motion.div>
                )}

                {phase === "result" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-8">
                    <div className="flex flex-wrap justify-center gap-3">
                      <button onClick={handleCopy} className="btn-outline-gold flex items-center gap-2 text-sm px-5 py-2.5">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? t.chart_copied : t.chart_copy_interp}
                      </button>
                      <button onClick={handleDownloadImage} disabled={downloading} className="btn-outline-gold flex items-center gap-2 text-sm px-5 py-2.5">
                        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                        {t.chart_save_image}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </CinematicModalShell>
  );
};

export default BirthChartModal;
