import type { Language } from "@/i18n/types";
import { isLocalizedReading } from "@/lib/readingLanguage";
import { accountStorageKey } from "@/lib/accountName";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import html2canvas from "html2canvas";
import { Image as ImageIcon, Loader2, Sparkles, Clock, Shield, Pencil } from "lucide-react";
import ResultShareBar from "./ResultShareBar";

import CinematicModalShell from "@/components/CinematicModalShell";
import BirthDetailsForm, { type BirthDetails } from "@/components/BirthDetailsForm";
import TextSizeControl, { type TextSize } from "@/components/TextSizeControl";
import { subscriptionManager } from "@/lib/subscriptionManager";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage, useT } from "@/i18n/LanguageContext";
import { localizeName } from "@/lib/nameLocalization";
import { getChartLabels, getPlanetName, getSignNameByKey, getElementName, getAspectName } from "@/lib/astroLocale";
import { renderMysticalText } from "@/lib/aiStreaming";
import { readingsStorage } from "@/lib/readingsStorage";
import { mysticalProfile } from "@/lib/mysticalProfile";
import { calculateNatalChart, type NatalChartResult } from "@/lib/natalChart";
import { toast } from "@/components/ui/sonner";
import { isAdminTestMode, ADMIN_DEFAULTS } from "@/lib/adminTestMode";
import { callLocalAi, getLocalFallback } from "@/lib/localAiPipeline";
import { safeErrorText } from "@/lib/localeGuard";

const CHART_DAILY_KEY = "astrologai_birthchart_daily";
const CHART_CACHE_KEY = "astrologai_birthchart_cache";

interface CachedChart {
  calculationVersion?: number;
  readings?: Partial<Record<Language, string>>;
  chartData: NatalChartResult;
  resultText: string;
  details: BirthDetails;
  savedAt: string;
}

function hasUsedChartToday(): boolean {
  try {
    const stored = localStorage.getItem(CHART_DAILY_KEY);
    if (!stored) return false;
    const today = new Date().toISOString().slice(0, 10);
    return stored === today;
  } catch { return false; }
}

function markChartUsedToday(): void {
  try {
    localStorage.setItem(CHART_DAILY_KEY, new Date().toISOString().slice(0, 10));
  } catch { /* ignore */ }
}

function saveCachedChart(data: CachedChart, language: Language): void {
  try {
    if (!isLocalizedReading(data.resultText, language)) return;
    const previous = loadCachedChart();
    const sameChart = previous?.calculationVersion === 2 && (Object.keys(data.details) as (keyof BirthDetails)[])
      .every(key => previous.details[key] === data.details[key]);
    const readings = sameChart ? { ...previous.readings } : {};
    if (sameChart) {
      for (const lang of ["he", "en", "ru", "ar"] as const) {
        if (isLocalizedReading(previous.resultText, lang)) readings[lang] = previous.resultText;
      }
    }
    readings[language] = data.resultText;
    localStorage.setItem(accountStorageKey(CHART_CACHE_KEY), JSON.stringify({ ...data, readings, calculationVersion: 2 }));
  } catch { /* ignore - storage full */ }
}

function loadCachedChart(): CachedChart | null {
  try {
    const raw = localStorage.getItem(accountStorageKey(CHART_CACHE_KEY));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedChart;
    if (parsed.chartData && typeof parsed.resultText === "string" && /\p{L}/u.test(parsed.resultText) && parsed.details) return parsed;
  } catch { /* ignore */ }
  return null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Phase = "form" | "reading" | "result" | "error" | "limit";

const BirthChartReading = ({ onClose }: Pick<Props, "onClose">) => {
  const { language, dir, isRTL } = useLanguage();
  const t = useT();
  const chartLabels = getChartLabels(language);
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<Phase>("form");
  const [details, setDetails] = useState<BirthDetails>(() => {
    const profile = mysticalProfile.getProfile();
    return {
      userName: profile.userName || "",
      gender: profile.gender || "",
      birthDate: profile.birthDate || "",
      birthTime: profile.birthTime || "",
      birthCity: profile.birthLocation || "",
    };
  });
  const [attempted, setAttempted] = useState(false);
  const [preparingChart, setPreparingChart] = useState(false);
  const [chartData, setChartData] = useState<NatalChartResult | null>(null);
  const [resultText, setResultText] = useState("");
  const [readingError, setReadingError] = useState("");
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  const [downloading, setDownloading] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>("default");
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [authReady, setAuthReady] = useState(subscriptionManager.isAuthReady());
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [restoredFromCache, setRestoredFromCache] = useState(false);
  const chartContentRef = useRef<HTMLDivElement>(null);
  const modalScrollRef = useRef<HTMLDivElement>(null);

  const { userName, gender, birthDate, birthTime, birthCity } = details;
  const showResult = phase !== "form";
  const isAdmin = subscriptionManager.isAdmin();

  useEffect(() => {
    const syncAdminState = () => {
      const ready = subscriptionManager.isAuthReady();
      const admin = subscriptionManager.isAdmin();
      setAuthReady(ready);
      setDailyLimitReached(ready ? (admin ? false : hasUsedChartToday()) : false);
    };

    syncAdminState();
    const unsubscribe = subscriptionManager.onAuthChange(syncAdminState);
    subscriptionManager.onAuthReady(syncAdminState);
    return unsubscribe;
  }, []);

  useEffect(() => {

    const frame = requestAnimationFrame(() => {
      if (modalScrollRef.current) {
        modalScrollRef.current.scrollTop = 0;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [phase]);

  useEffect(() => {
    if (!authReady) return;
    const cached = loadCachedChart();
    if (!cached || !cached.resultText) return;
    setDetails(cached.details);
    // Older interpretations used a second time-zone conversion. Keep the form details.
    if (cached.calculationVersion !== 2) return;
    setChartData(cached.chartData);
    const localized = cached.readings?.[language] ?? cached.resultText;
    if (!isLocalizedReading(localized, language)) {
      const request = new AbortController();
      requestRef.current = request;
      startInterpretation(cached.chartData, cached.details, request);
      return () => request.abort();
    }
    setResultText(localized);
    setRestoredFromCache(true);
    setPhase("result");
    if (isLocalizedReading(localizeName(cached.details.userName, language), language)) {
      setShowWelcomeBack(true);
      const timer = window.setTimeout(() => setShowWelcomeBack(false), 4000);
      return () => window.clearTimeout(timer);
    }
  }, [language, authReady]);

  async function handleSubmit() {
    if (requestRef.current) return;
    setAttempted(true);

    if (!authReady) {
      toast.error(t.common_loading);
      return;
    }

    if (dailyLimitReached && !isAdmin) {
      toast.error(t.chart_daily_limit_toast);
      return;
    }

    // Admin bypass: auto-fill missing fields silently
    const adminMode = isAdminTestMode();
    const effectiveGender = gender || (adminMode ? ADMIN_DEFAULTS.gender : "");
    const effectiveBirthDate = birthDate || (adminMode ? ADMIN_DEFAULTS.birthDate : "");
    const effectiveBirthTime = birthTime || (adminMode ? ADMIN_DEFAULTS.birthTime : "");
    const effectiveBirthCity = birthCity.trim() || (adminMode ? "Tel Aviv" : "");

    if (!effectiveGender || !effectiveBirthDate || !effectiveBirthTime || !effectiveBirthCity) {
      toast.error(t.chart_form_error);
      return;
    }

    if (userName.trim()) mysticalProfile.recordUserName(userName.trim());
    if (effectiveGender) mysticalProfile.recordGender(effectiveGender);
    if (effectiveBirthCity) mysticalProfile.recordBirthLocation(effectiveBirthCity);

    const request = new AbortController();
    requestRef.current = request;
    setPreparingChart(true);

    try {
      const natalChart = await calculateNatalChart({
        birthDate: effectiveBirthDate,
        birthTime: effectiveBirthTime,
        birthPlace: effectiveBirthCity,
      });

      if (request.signal.aborted) return;
      const submitted = { userName, gender: effectiveGender, birthDate: effectiveBirthDate, birthTime: effectiveBirthTime, birthCity: effectiveBirthCity };
      setDetails(submitted);
      setChartData(natalChart);
      mysticalProfile.recordZodiac(getSignNameByKey(natalChart.sunSign.key, language), natalChart.sunSign.symbol, natalChart.sunSign.element, effectiveBirthDate);
      mysticalProfile.recordRising(`${getSignNameByKey(natalChart.risingSign.key, language)} ${chartLabels.rising}`, natalChart.risingSign.symbol, natalChart.risingSign.element, effectiveBirthTime);
      startInterpretation(natalChart, submitted, request);
    } catch (error) {
      if (request.signal.aborted) return;
      requestRef.current = null;
      const msg = error instanceof Error ? error.message : "";
      const geocodeErrors: Record<string, string> = {
        GEOCODE_EMPTY: t.geocode_empty,
        GEOCODE_FETCH_FAILED: t.geocode_fetch_failed,
        GEOCODE_NOT_FOUND: t.geocode_not_found,
      };
      toast.error(geocodeErrors[msg] || t.chart_form_error);
    } finally {
      setPreparingChart(false);
    }
  }

  function startInterpretation(chartData: NatalChartResult, submitted: BirthDetails, request: AbortController) {
    const { birthDate, birthTime, userName, gender } = submitted;
    setPhase("reading");
    setResultText("");
    setReadingError("");
    let text = "";
    let timer: number;
    const fail = (error?: unknown) => {
      if (request.signal.aborted) return;
      request.abort();
      requestRef.current = null;
      if (error === "DAILY_LIMIT_REACHED") {
        setPhase("limit");
        setReadingError(t.chart_daily_limit_toast);
      } else {
        setPhase("error");
        setReadingError(safeErrorText(error, language, "birth-chart"));
      }
    };
    const armTimeout = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fail(), 30_000);
    };
    request.signal.addEventListener("abort", () => window.clearTimeout(timer), { once: true });
    const replaceText = (value: string) => {
      if (request.signal.aborted) return;
      armTimeout();
      text = value;
      if (!text || isLocalizedReading(text, language) && text !== getLocalFallback("error", language)) setResultText(text);
    };
    const elementSummary = chartData.dominantElements.map(({ elementKey, count }) => `${getElementName(elementKey, language)} (${count})`).join(" • ");
    const houseSummary = chartData.dominantHouses.map(({ house, count }) => `${chartLabels.house} ${house} (${count})`).join(" • ");

    const planetLines = chartData.planetPlacements
      .map((planet) => `${planet.symbol} ${getPlanetName(planet.key, language)}: ${getSignNameByKey(planet.signKey, language)} ${planet.degree}° — ${chartLabels.house} ${planet.house}`)
      .join("\n");

    const aspectLines = chartData.aspects.length
      ? chartData.aspects.map((aspect) => {
          const left = aspect.planet1Key === "ascendant" ? chartLabels.ascendant : `${getPlanetName(aspect.planet1Key, language)}`;
          const right = aspect.planet2Key === "ascendant" ? chartLabels.ascendant : `${getPlanetName(aspect.planet2Key, language)}`;
          return `${left} • ${getAspectName(aspect.type, language)} • ${right} — ${aspect.orb}°`;
        }).join("\n")
      : chartLabels.noStrongAspects;

    const houseLines = chartData.houseCusps
      .map((house) => `${chartLabels.house} ${house.house}: ${getSignNameByKey(house.signKey, language)} ${house.degree}°`)
      .join("\n");

    const dominantText = [
      `${chartLabels.dominantElements}: ${elementSummary || chartLabels.notDetected}`,
      `${chartLabels.dominantHouses}: ${houseSummary || chartLabels.notDetected}`,
    ].join("\n");

    armTimeout();
    void callLocalAi({
      mode: "stream",
      endpoint: "mystical-reading",
      promptForGender: false,
      requireComplete: true,
      onProgress: armTimeout,
      signal: request.signal,
      payload: {
        type: "birthChart",
        language,
        birthDate,
        birthTime,
        birthCity: chartData.location.name,
        sunSign: getSignNameByKey(chartData.sunSign.key, language),
        sunSymbol: chartData.sunSign.symbol,
        sunElement: getElementName(chartData.sunSign.elementKey, language),
        risingSign: getSignNameByKey(chartData.risingSign.key, language),
        risingSymbol: chartData.risingSign.symbol,
        risingElement: getElementName(chartData.risingSign.elementKey, language),
        moonSign: getSignNameByKey(chartData.moonSignKey, language),
        planetPositions: planetLines,
        houseCusps: houseLines,
        majorAspects: aspectLines,
        dominantEnergies: dominantText,
        coordinates: `${chartData.location.latitude.toFixed(4)}, ${chartData.location.longitude.toFixed(4)}`,
        timezone: chartData.location.timezone,
        userName: localizeName(userName.trim(), language) || undefined,
        gender,
      },
      onDelta: (delta) => replaceText(text + delta),
      onReplace: replaceText,
      onError: fail,
      onDone: () => {
        if (request.signal.aborted) return;
        if (!isLocalizedReading(text, language) || text === getLocalFallback("error", language)) {
          fail();
          return;
        }
        window.clearTimeout(timer);
        requestRef.current = null;
        setPhase("result");
        if (!isAdmin) {
          markChartUsedToday();
          setDailyLimitReached(true);
        }
        readingsStorage.save({
          type: "birth-chart",
          title: `${chartLabels.birthChart} — ${getSignNameByKey(chartData.sunSign.key, language)} ${chartData.sunSign.symbol}`,
          subtitle: `☉ ${getSignNameByKey(chartData.sunSign.key, language)} | ⬆ ${getSignNameByKey(chartData.risingSign.key, language)} | ☽ ${chartData.moonSignKey ? getSignNameByKey(chartData.moonSignKey, language) : chartData.moonSign}`,
          symbol: "🌌",
          data: { birthDate, birthTime, birthCity: chartData.location.name },
        });
        saveCachedChart({ chartData, resultText: text, details: submitted, savedAt: new Date().toISOString() }, language);
      },
    }).catch(fail);
  }

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

  return (
    <CinematicModalShell
      isOpen
      onClose={onClose}
      scrollRef={modalScrollRef}
      fullscreen={isMobile}
      hideAdvisor={isMobile}
      wide={showResult && !isMobile}
      avatarStyle={{
        top: 80,
        right: 40,
        bottom: "auto",
        left: "auto",
        width: 140,
        height: 140,
      }}
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
                    {t.chart_full_interp_desc}
                  </p>
                </div>

                {dailyLimitReached && !isAdmin ? (
                  <div className="space-y-4">
                    <div
                      className="rounded-xl p-4 text-center"
                      style={{
                        background: "linear-gradient(145deg, hsl(var(--deep-blue-light) / 0.6), hsl(var(--deep-blue) / 0.8))",
                        border: "1px solid hsl(var(--gold) / 0.18)",
                      }}
                    >
                      <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: "hsl(var(--gold) / 0.6)" }} />
                      <p className="font-body text-sm" style={{ color: "hsl(var(--foreground) / 0.7)" }}>
                        {t.chart_daily_limit_reached}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {isAdmin && (
                      <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 mx-auto w-fit rounded-full text-xs font-body" style={{
                        background: "hsl(var(--gold) / 0.08)",
                        border: "1px solid hsl(var(--gold) / 0.2)",
                        color: "hsl(var(--gold))",
                      }}>
                        <Shield className="w-3 h-3" />
                        <span>ADMIN — unlimited</span>
                      </div>
                    )}
                    <BirthDetailsForm
                      values={details}
                      onChange={(patch) => setDetails((prev) => ({ ...prev, ...patch }))}
                      attempted={attempted}
                      showTime
                    />

                    {!isAdmin && (
                      <div className="text-center">
                        <p className="text-xs font-body mb-3" style={{ color: "hsl(var(--gold) / 0.5)" }}>
                          {t.chart_daily_available}
                        </p>
                      </div>
                    )}

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
                )}
              </motion.div>
            )}
              {showResult && (
              <motion.div
                key="result"
                className="space-y-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >

                {/* Welcome back + edit for cached results */}
                {restoredFromCache && (
                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <AnimatePresence>
                      {showWelcomeBack && userName.trim() && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="font-body text-sm"
                          style={{ color: "hsl(var(--gold) / 0.7)" }}
                        >
                          {t.chart_welcome_back.replace("{name}", localizeName(userName.trim(), language) || "")}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <motion.button
                      onClick={() => {
                        setRestoredFromCache(false);
                        setPhase("form");
                        setChartData(null);
                        setResultText("");
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs transition-colors"
                      style={{
                        color: "hsl(var(--gold) / 0.6)",
                        border: "1px solid hsl(var(--gold) / 0.15)",
                        background: "hsl(var(--gold) / 0.05)",
                      }}
                      whileHover={{ scale: 1.03, borderColor: "hsl(var(--gold) / 0.3)" }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Pencil className="w-3 h-3" />
                      {t.chart_edit_details}
                    </motion.button>
                  </motion.div>
                )}

                <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="font-heading text-lg md:text-xl mb-1" style={{ color: "hsl(var(--gold) / 0.8)" }}>{t.chart_full_interp_title}</h3>
                  <p className="font-body text-xs" style={{ color: "hsl(var(--foreground) / 0.35)" }}>
                    {t.chart_full_interp_desc}
                  </p>
                </motion.div>

                <div className="flex justify-end">
                  <TextSizeControl value={textSize} onChange={setTextSize} />
                </div>

                {resultText && (
                  <div className="mobile-reading-surface mystical-card p-5 md:p-8" style={{ textAlign: isRTL ? "right" : "left" }}>
                    {renderMysticalText(resultText, textSize)}
                  </div>
                )}
                {phase === "reading" && !resultText && (
                  <div role="status" className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-gold" />
                    <p>{t.birth_chart_loading}</p>
                  </div>
                )}
                {readingError && (
                  <div className="text-center space-y-3">
                    <p role="alert">{readingError}</p>
                    {phase === "error" && chartData && (
                      <button className="btn-gold" onClick={() => {
                        if (requestRef.current) return;
                        const request = new AbortController();
                        requestRef.current = request;
                        startInterpretation(chartData, details, request);
                      }}>{t.daily_horoscope_retry}</button>
                    )}
                  </div>
                )}
                {phase === "result" && resultText && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-8">
                    <ResultShareBar
                      resultText={resultText}
                      shareTitle={t.chart_title || chartLabels.birthChart}
                    />
                    <div className="flex flex-wrap justify-center gap-3">
                      <button onClick={handleDownloadImage} disabled={downloading} className="btn-outline-gold flex items-center gap-2 text-sm px-5 py-2.5">
                        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                        {t.chart_save_image}
                      </button>
                    </div>
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

const BirthChartModal = ({ isOpen, onClose }: Props) => isOpen ? <BirthChartReading onClose={onClose} /> : null;

export default BirthChartModal;
