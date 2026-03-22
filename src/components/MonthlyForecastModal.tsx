import { useState, useEffect, useRef, useCallback } from "react";
import CinematicModalShell from "@/components/CinematicModalShell";
import TextSizeControl, { type TextSize } from "@/components/TextSizeControl";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Sparkles, Crown, Share2, Copy, Check, Loader2 } from "lucide-react";
import { getZodiacSign } from "@/data/zodiacData";
import { getRisingSign } from "@/data/risingSignData";
import { toast } from "@/components/ui/sonner";
import { readingsStorage } from "@/lib/readingsStorage";
import { streamMysticalReading, renderMysticalText } from "@/lib/aiStreaming";
import { mysticalProfile } from "@/lib/mysticalProfile";
import ShareResultSection from "@/components/ShareResultSection";
import MysticalOnboarding from "@/components/MysticalOnboarding";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { useReadingContext } from "@/contexts/ReadingContext";
import AstrologerAvatarButton from "@/components/AstrologerAvatarButton";
import AvatarHoverTeaser from "@/components/AvatarHoverTeaser";
import AdvisorChatPanel from "@/components/AdvisorChatPanel";

type Mode = "forecast" | "rising";

interface Props { isOpen: boolean; onClose: () => void; }

const MonthlyForecastModal = ({ isOpen, onClose }: Props) => {
  const t = useT();
  const { language } = useLanguage();
  const { setActiveReading } = useReadingContext();
  const [mode, setMode] = useState<Mode>("forecast");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [attempted, setAttempted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [signInfo, setSignInfo] = useState<{ name: string; symbol: string; dateRange: string; element: string } | null>(null);
  const [risingInfo, setRisingInfo] = useState<{ name: string; symbol: string; element: string; sunSign: string; sunSymbol: string; sunElement: string } | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiTextRef = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [textSize, setTextSize] = useState<TextSize>("default");
  const [isMobile, setIsMobile] = useState(false);
  const [advisorOpen, setAdvisorOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const monthLocale = language === "he" ? "he-IL" : language === "ar" ? "ar-SA" : language === "ru" ? "ru-RU" : "en-US";
  const monthName = new Date().toLocaleDateString(monthLocale, { month: "long" });

  const handleSubmit = () => {
    setAttempted(true);
    if (!gender || !birthDate) return;
    if (mode === "rising" && !birthTime) return;
    setIsLoading(true);
  };

  const handleOnboardingComplete = () => {
    const date = new Date(birthDate);
    const sign = getZodiacSign(date);

    if (mode === "forecast") {
      setSignInfo({ name: sign.hebrewName, symbol: sign.symbol, dateRange: sign.dateRange, element: sign.element });
      setIsLoading(false); setAiLoading(true); aiTextRef.current = "";
      mysticalProfile.recordZodiac(sign.hebrewName, sign.symbol, sign.element, birthDate);

      streamMysticalReading(
        "forecast",
        { signName: sign.hebrewName, signSymbol: sign.symbol, birthDate, element: sign.element, dateRange: sign.dateRange, monthName, gender },
        (delta) => { aiTextRef.current += delta; setAiText(aiTextRef.current); },
        () => {
          setAiLoading(false);
          setActiveReading({ type: "forecast", label: `${t.readings_type_forecast} — ${sign.hebrewName}`, summary: aiTextRef.current });
          readingsStorage.save({ type: "forecast", title: `${t.readings_type_forecast} — ${sign.hebrewName}`, subtitle: sign.dateRange, symbol: sign.symbol, data: { signName: sign.hebrewName, birthDate, aiReading: aiTextRef.current } });
        },
        (err) => { setAiLoading(false); setAiError(err); toast(err); },
        language,
      );
    } else {
      // Rising sign mode
      const [h, m] = birthTime.split(":").map(Number);
      const rising = getRisingSign(h, m);
      setRisingInfo({ name: rising.hebrewName, symbol: rising.symbol, element: rising.element, sunSign: sign.hebrewName, sunSymbol: sign.symbol, sunElement: sign.element });
      setIsLoading(false); setAiLoading(true); aiTextRef.current = "";

      mysticalProfile.recordZodiac(sign.hebrewName, sign.symbol, sign.element, birthDate);
      mysticalProfile.recordRising(rising.hebrewName, rising.symbol, rising.element, birthTime);

      streamMysticalReading("rising",
        { signName: rising.hebrewName, signSymbol: rising.symbol, element: rising.element, birthTime, birthDate, sunSignName: sign.hebrewName, sunSignSymbol: sign.symbol, sunElement: sign.element, gender },
        (delta) => { aiTextRef.current += delta; setAiText(aiTextRef.current); },
        () => {
          setAiLoading(false);
          setActiveReading({ type: "rising", label: `${t.readings_type_rising} — ${rising.hebrewName}`, summary: aiTextRef.current });
          readingsStorage.save({ type: "rising", title: `${t.readings_type_rising} — ${rising.hebrewName}`, subtitle: `${t.rising_sun_label}: ${sign.hebrewName}`, symbol: rising.symbol, data: { signName: rising.hebrewName, sunSign: sign.hebrewName, birthTime, birthDate, aiReading: aiTextRef.current } });
        },
        (err) => { setAiLoading(false); setAiError(err); toast(err); },
        language,
      );
    }
  };

  const handleClose = () => { onClose(); setTimeout(() => { setSignInfo(null); setRisingInfo(null); setBirthDate(""); setBirthTime(""); setGender(""); setAttempted(false); setIsLoading(false); setAiText(""); setAiLoading(false); setAiError(null); aiTextRef.current = ""; setMode("forecast"); }, 300); };

  useEffect(() => { if (aiLoading && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [aiText, aiLoading]);

  const resultInfo = mode === "forecast" ? signInfo : risingInfo;
  const hasResult = !!resultInfo;

  const handleShare = () => {
    if (mode === "forecast" && signInfo) {
      const text = `✨ ${t.readings_type_forecast} — ${signInfo.name} ${signInfo.symbol}\n${monthName}\n\n🔮 ${window.location.origin}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    } else if (mode === "rising" && risingInfo) {
      const text = `✨ ${t.rising_asc_label} — ${risingInfo.name} ${risingInfo.symbol}\n☀️ ${t.rising_sun_label}: ${risingInfo.sunSign} ${risingInfo.sunSymbol}\n\n🔮 ${window.location.origin}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  const handleCopy = async () => {
    if (!aiText) return;
    if (mode === "forecast" && signInfo) {
      await navigator.clipboard.writeText(`✨ ${signInfo.name} — ${t.readings_type_forecast}\n\n${aiText}`);
    } else if (mode === "rising" && risingInfo) {
      await navigator.clipboard.writeText(`✨ ${t.rising_asc_label} — ${risingInfo.name} | ${t.rising_sun_label} — ${risingInfo.sunSign}\n\n${aiText}`);
    }
    setCopied(true); toast(t.share_copy_toast); setTimeout(() => setCopied(false), 2000);
  };

  const isDesktopResult = !isMobile && hasResult;
  const isDesktop = !isMobile;

  /* ── Mode toggle tabs ── */
  const ModeToggle = ({ size = "default" }: { size?: "default" | "large" }) => {
    const isLarge = size === "large";
    return (
      <div className="flex rounded-full overflow-hidden" style={{
        background: "hsl(222 47% 8% / 0.6)",
        border: "1px solid hsl(var(--gold) / 0.12)",
        backdropFilter: "blur(8px)",
      }}>
        <motion.button
          type="button"
          className="font-body transition-all duration-300 flex items-center gap-1.5"
          style={{
            padding: isLarge ? "10px 24px" : "8px 16px",
            fontSize: isLarge ? "16px" : "12px",
            borderRadius: "9999px",
            background: mode === "forecast" ? "linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.08))" : "transparent",
            color: mode === "forecast" ? "hsl(var(--gold))" : "hsl(var(--foreground) / 0.45)",
            border: mode === "forecast" ? "1px solid hsl(var(--gold) / 0.3)" : "1px solid transparent",
          }}
          onClick={() => setMode("forecast")}
          whileTap={{ scale: 0.97 }}
        >
          <Calendar style={{ width: isLarge ? 16 : 12, height: isLarge ? 16 : 12 }} />
          {t.forecast_title}
        </motion.button>
        <motion.button
          type="button"
          className="font-body transition-all duration-300 flex items-center gap-1.5"
          style={{
            padding: isLarge ? "10px 24px" : "8px 16px",
            fontSize: isLarge ? "16px" : "12px",
            borderRadius: "9999px",
            background: mode === "rising" ? "linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.08))" : "transparent",
            color: mode === "rising" ? "hsl(var(--gold))" : "hsl(var(--foreground) / 0.45)",
            border: mode === "rising" ? "1px solid hsl(var(--gold) / 0.3)" : "1px solid transparent",
          }}
          onClick={() => setMode("rising")}
          whileTap={{ scale: 0.97 }}
        >
          <Clock style={{ width: isLarge ? 16 : 12, height: isLarge ? 16 : 12 }} />
          {t.rising_title}
        </motion.button>
      </div>
    );
  };

  return (
    <CinematicModalShell isOpen={isOpen} onClose={handleClose} scrollRef={scrollRef as React.RefObject<HTMLDivElement>} fullscreen hideAdvisor>
            <AnimatePresence mode="wait">
              {!hasResult && !isLoading ? (
                isDesktop ? (
                  /* ── Desktop: 3-column — LEFT form + CENTER oracle + RIGHT text ── */
                  <div className="absolute inset-0 flex items-start" style={{ paddingTop: "clamp(100px, 14vh, 160px)" }} key="input-desktop">
                    {/* LEFT: Form panel */}
                    <motion.div
                      className="flex flex-col justify-center pointer-events-auto"
                      style={{ width: "700px", maxWidth: "48vw", paddingLeft: "4vw" }}
                      initial={{ opacity: 0, x: -40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div style={{ padding: "0 24px" }}>
                        {/* Mode toggle */}
                        <div className="flex justify-center mb-8">
                          <ModeToggle size="large" />
                        </div>

                        <div style={{ marginBottom: "28px" }}>
                          <label className="block font-body" style={{ fontSize: "20px", marginBottom: "14px", color: "hsl(var(--gold) / 0.7)" }}>{t.forecast_gender_label}</label>
                          <div className="flex" style={{ gap: "12px" }}>
                            <motion.button type="button" onClick={() => setGender("male")}
                              className="flex-1 rounded-xl font-body transition-all duration-300"
                              style={{ fontSize: "20px", padding: "14px 0", background: gender === "male" ? "linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.08))" : "hsl(222 47% 11% / 0.5)", border: gender === "male" ? "1px solid hsl(var(--gold) / 0.45)" : "1px solid hsl(var(--gold) / 0.1)", color: gender === "male" ? "hsl(var(--gold))" : "hsl(var(--foreground) / 0.5)", backdropFilter: "blur(8px)" }}
                              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            >{t.forecast_gender_male}</motion.button>
                            <motion.button type="button" onClick={() => setGender("female")}
                              className="flex-1 rounded-xl font-body transition-all duration-300"
                              style={{ fontSize: "20px", padding: "14px 0", background: gender === "female" ? "linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.08))" : "hsl(222 47% 11% / 0.5)", border: gender === "female" ? "1px solid hsl(var(--gold) / 0.45)" : "1px solid hsl(var(--gold) / 0.1)", color: gender === "female" ? "hsl(var(--gold))" : "hsl(var(--foreground) / 0.5)", backdropFilter: "blur(8px)" }}
                              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            >{t.forecast_gender_female}</motion.button>
                          </div>
                          {attempted && !gender && <p className="font-body" style={{ fontSize: "14px", marginTop: "8px", color: "hsl(var(--crimson))" }}>{t.forecast_gender_required}</p>}
                        </div>

                        {/* Divider */}
                        <div className="mx-auto mb-7" style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.15), transparent)" }} />

                        <div style={{ marginBottom: mode === "rising" ? "20px" : "32px" }}>
                          <label className="block font-body" style={{ fontSize: "20px", marginBottom: "14px", color: "hsl(var(--gold) / 0.7)" }}>{t.forecast_birthdate_label}</label>
                          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mystical-input font-body text-center" style={{ direction: "ltr", fontSize: "20px", padding: "14px", height: "56px" }} />
                          {attempted && !birthDate && <p className="font-body" style={{ fontSize: "14px", marginTop: "8px", color: "hsl(var(--crimson))" }}>{t.forecast_birthdate_required}</p>}
                        </div>

                        {/* Birth time — only in rising mode */}
                        <AnimatePresence>
                          {mode === "rising" && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              style={{ marginBottom: "32px", overflow: "hidden" }}
                            >
                              <label className="block font-body" style={{ fontSize: "20px", marginBottom: "14px", color: "hsl(var(--gold) / 0.7)" }}>
                                <Clock className="inline-block w-5 h-5 ml-2" />{t.rising_birthtime_label}
                              </label>
                              <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="mystical-input font-body text-center" style={{ direction: "ltr", fontSize: "20px", padding: "14px", height: "56px" }} />
                              {attempted && !birthTime && <p className="font-body" style={{ fontSize: "14px", marginTop: "8px", color: "hsl(var(--crimson))" }}>{t.forecast_birthdate_required}</p>}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <motion.button onClick={handleSubmit} className="btn-gold font-body w-full flex items-center justify-center" style={{ fontSize: "20px", padding: "14px 0", gap: "10px" }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          <Sparkles className="w-7 h-7" />
                          {mode === "forecast" ? t.forecast_cta : t.rising_cta}
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* CENTER: Oracle safe zone */}
                    <div className="flex-1" />

                    {/* RIGHT: Explanation text */}
                    <motion.div
                      className="flex flex-col justify-center pointer-events-auto overflow-hidden"
                      style={{ width: "52%", maxWidth: "780px", marginRight: "clamp(20px, 3vw, 60px)", marginLeft: "10px" }}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div style={{ padding: "0 40px" }}>
                        <motion.div className="w-28 h-28 mb-10 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.12), transparent)", border: "1px solid hsl(var(--gold) / 0.18)" }} animate={{ boxShadow: ["0 0 20px hsl(43 80% 55% / 0.08)", "0 0 40px hsl(43 80% 55% / 0.18)", "0 0 20px hsl(43 80% 55% / 0.08)"] }} transition={{ duration: 3, repeat: Infinity }}>
                          {mode === "forecast" ? <Calendar className="w-12 h-12 text-gold" /> : <Clock className="w-12 h-12 text-gold" />}
                        </motion.div>
                        <h2 className="font-heading gold-gradient-text mb-8" style={{ fontSize: "52px", lineHeight: 1.25, textShadow: "0 2px 30px hsl(222 47% 6%), 0 0 60px hsl(222 47% 6% / 0.85)", wordWrap: "break-word" }}>
                          {mode === "forecast" ? t.forecast_title : t.rising_title}
                        </h2>
                        <p className="font-body leading-relaxed" style={{ fontSize: "32px", lineHeight: 1.7, color: "hsl(var(--foreground) / 0.65)", textShadow: "0 2px 20px hsl(222 47% 6%), 0 0 40px hsl(222 47% 6%)", wordWrap: "break-word" }}>
                          {mode === "forecast" ? t.forecast_desc : t.rising_desc}
                        </p>

                        <div className="section-divider max-w-[140px] my-10" />

                        <p className="font-body" style={{ fontSize: "24px", lineHeight: 1.6, color: "hsl(var(--foreground) / 0.35)", textShadow: "0 2px 10px hsl(222 47% 6%)", wordWrap: "break-word" }}>{t.forecast_note}</p>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  /* ── Mobile: centered form ── */
                  <motion.div key="input-mobile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-8 text-center">
                     <motion.div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }} animate={{ boxShadow: ["0 0 20px hsl(43 80% 55% / 0.1)", "0 0 40px hsl(43 80% 55% / 0.2)", "0 0 20px hsl(43 80% 55% / 0.1)"] }} transition={{ duration: 3, repeat: Infinity }}>
                       {mode === "forecast" ? <Calendar className="w-7 h-7 text-gold" /> : <Clock className="w-7 h-7 text-gold" />}
                     </motion.div>

                     {/* Mode toggle */}
                     <div className="flex justify-center mb-5">
                       <ModeToggle />
                     </div>

                     <h2 className="font-heading text-2xl gold-gradient-text mb-3">{mode === "forecast" ? t.forecast_title : t.rising_title}</h2>
                     <p className="text-foreground/70 font-body text-sm mb-8 max-w-md mx-auto leading-relaxed">{mode === "forecast" ? t.forecast_desc : t.rising_desc}</p>
                     <div className="max-w-xs mx-auto mb-6">
                       <label className="block text-sm text-gold/70 font-body mb-2 text-right">{t.forecast_gender_label}</label>
                       <div className="flex gap-2">
                         <motion.button type="button" onClick={() => setGender("male")} className="flex-1 py-2.5 rounded-xl font-body text-sm transition-all duration-300" style={{ background: gender === "male" ? "linear-gradient(135deg, hsl(var(--gold) / 0.25), hsl(var(--gold) / 0.1))" : "hsl(222 47% 11% / 0.6)", border: gender === "male" ? "1px solid hsl(var(--gold) / 0.5)" : "1px solid hsl(var(--gold) / 0.12)", color: gender === "male" ? "hsl(var(--gold))" : "hsl(var(--foreground) / 0.5)", backdropFilter: "blur(8px)" }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>{t.forecast_gender_male}</motion.button>
                         <motion.button type="button" onClick={() => setGender("female")} className="flex-1 py-2.5 rounded-xl font-body text-sm transition-all duration-300" style={{ background: gender === "female" ? "linear-gradient(135deg, hsl(var(--gold) / 0.25), hsl(var(--gold) / 0.1))" : "hsl(222 47% 11% / 0.6)", border: gender === "female" ? "1px solid hsl(var(--gold) / 0.5)" : "1px solid hsl(var(--gold) / 0.12)", color: gender === "female" ? "hsl(var(--gold))" : "hsl(var(--foreground) / 0.5)", backdropFilter: "blur(8px)" }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>{t.forecast_gender_female}</motion.button>
                       </div>
                       {attempted && !gender && <p className="text-xs mt-1.5 font-body" style={{ color: "hsl(var(--crimson))" }}>{t.forecast_gender_required}</p>}
                     </div>
                     <div className="max-w-xs mx-auto mb-6">
                       <label className="block text-sm text-gold/70 font-body mb-2 text-right">{t.forecast_birthdate_label}</label>
                       <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mystical-input font-body text-center" style={{ direction: "ltr" }} />
                       {attempted && !birthDate && <p className="text-xs mt-1.5 font-body" style={{ color: "hsl(var(--crimson))" }}>{t.forecast_birthdate_required}</p>}
                     </div>

                     {/* Birth time — rising mode only */}
                     <AnimatePresence>
                       {mode === "rising" && (
                         <motion.div
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: "auto" }}
                           exit={{ opacity: 0, height: 0 }}
                           className="max-w-xs mx-auto mb-6 overflow-hidden"
                         >
                           <label className="block text-sm text-gold/70 font-body mb-2 text-right">
                             <Clock className="w-3.5 h-3.5 inline-block ml-1" />{t.rising_birthtime_label}
                           </label>
                           <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="mystical-input font-body text-center" style={{ direction: "ltr" }} />
                           {attempted && !birthTime && <p className="text-xs mt-1.5 font-body" style={{ color: "hsl(var(--crimson))" }}>{t.forecast_birthdate_required}</p>}
                         </motion.div>
                       )}
                     </AnimatePresence>

                     <motion.button onClick={handleSubmit} className="btn-gold font-body flex items-center justify-center gap-2 mx-auto" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                       <Sparkles className="w-4 h-4" />{mode === "forecast" ? t.forecast_cta : t.rising_cta}
                     </motion.button>
                     <p className="text-[11px] text-muted-foreground font-body mt-6">{t.forecast_note}</p>
                   </motion.div>
                )
              ) : isLoading ? (
                isMobile ? (
                  <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><MysticalOnboarding onComplete={handleOnboardingComplete} /></motion.div>
                ) : (
                  /* ── Desktop: onboarding in LEFT zone, oracle center clear ── */
                  <div className="absolute inset-0 flex items-start" style={{ paddingTop: "clamp(100px, 14vh, 160px)" }} key="onboarding-desktop">
                    <motion.div
                      className="flex flex-col justify-center pointer-events-auto"
                      style={{ width: "42%", maxWidth: "510px", marginLeft: "calc(4vw + 150px)", marginRight: "10px" }}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <MysticalOnboarding onComplete={handleOnboardingComplete} />
                    </motion.div>
                    <div className="flex-1" />
                  </div>
                )
              ) : hasResult ? (
                isDesktopResult ? (
                  /* ── Desktop 3-zone ── */
                  <div className="absolute inset-0">
                    {/* LEFT: Interpretation */}
                    <motion.div
                      ref={scrollRef}
                      className="absolute overflow-y-auto pointer-events-auto scrollbar-hide"
                      style={{ top: "calc(10vh + 56px)", left: "10px", width: "min(720px, 50vw)", maxHeight: "80vh" }}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 100% 80% at 50% 35%, hsl(222 47% 6% / 0.7), transparent 85%)", filter: "blur(50px)" }} />
                      <div className="relative" style={{ padding: "0 16px 60px" }}>
                        {aiText ? (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-prose">
                            <div className="flex justify-end mb-6"><TextSizeControl value={textSize} onChange={setTextSize} /></div>
                            <div style={{ textShadow: "0 2px 30px hsl(222 47% 6%), 0 0 60px hsl(222 47% 6% / 0.85), 0 0 10px hsl(222 47% 6%)" }}>
                              {renderMysticalText(aiText, textSize)}
                            </div>
                            {aiLoading && (
                              <motion.div className="flex items-center justify-center gap-2 mt-8" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
                                <Loader2 className="w-5 h-5 text-gold/60 animate-spin" />
                                <span className="font-body text-sm text-gold/50">{mode === "forecast" ? t.forecast_loading : t.rising_loading}</span>
                              </motion.div>
                            )}
                          </motion.div>
                        ) : aiError ? (
                          <div className="text-center rounded-xl p-6" style={{ background: "hsl(var(--crimson) / 0.08)", border: "1px solid hsl(var(--crimson) / 0.15)" }}><p className="text-foreground/50 font-body text-sm">{aiError}</p></div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16">
                            <motion.div className="w-16 h-16 rounded-full mb-6" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }} animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }} transition={{ duration: 3, repeat: Infinity }} />
                            <motion.p className="font-body text-gold/70 text-base" style={{ textShadow: "0 2px 15px hsl(222 47% 6%)" }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>{mode === "forecast" ? t.forecast_loading : t.rising_loading}</motion.p>
                          </div>
                        )}
                        {!aiLoading && (aiText || aiError) && (
                          <ShareResultSection
                            symbol={mode === "forecast" ? signInfo!.symbol : risingInfo!.symbol}
                            title={mode === "forecast" ? `${t.readings_type_forecast} — ${signInfo!.name}` : `${risingInfo!.sunSign} + ${risingInfo!.name}`}
                            subtitle={mode === "forecast" ? monthName : `${t.rising_sun_label} + ${t.rising_asc_label}`}
                          />
                        )}
                      </div>
                    </motion.div>

                    {/* RIGHT: Sign info — scaled up for prominence */}
                    <motion.div
                      className="absolute pointer-events-auto flex flex-col items-center"
                      style={{ top: "calc(8vh + 40px)", right: "36px", width: "min(560px, 38vw)" }}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="text-center" style={{ padding: "32px 20px" }}>
                        {mode === "forecast" && signInfo ? (
                          <>
                            <motion.div className="mb-10" style={{ fontSize: "144px", lineHeight: 1, textShadow: "0 0 35px hsl(222 47% 6%)" }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>{signInfo.symbol}</motion.div>
                            <motion.h2 className="font-heading gold-gradient-text mb-6" style={{ fontSize: "44px", lineHeight: 1.2, textShadow: "0 0 30px hsl(222 47% 6%)" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>{signInfo.name}</motion.h2>
                            <motion.p className="text-muted-foreground font-body mb-2" style={{ fontSize: "22px", lineHeight: 1.6, textShadow: "0 2px 15px hsl(222 47% 6%)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>{signInfo.dateRange} • {t.forecast_element_label} {signInfo.element}</motion.p>
                            <motion.p className="text-gold/60 font-body mt-6" style={{ fontSize: "22px", lineHeight: 1.6, textShadow: "0 2px 15px hsl(222 47% 6%)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>{t.forecast_month_label} {monthName}</motion.p>
                          </>
                        ) : risingInfo ? (
                          <>
                            <motion.div className="flex items-center justify-center gap-3 text-5xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                              <span style={{ textShadow: "0 0 20px hsl(222 47% 6%)", fontSize: "100px" }}>{risingInfo.sunSymbol}</span>
                              <span className="text-gold/40 text-3xl" style={{ textShadow: "0 0 10px hsl(var(--gold) / 0.2)" }}>✦</span>
                              <span style={{ textShadow: "0 0 20px hsl(222 47% 6%)", fontSize: "100px" }}>{risingInfo.symbol}</span>
                            </motion.div>
                            <motion.h2 className="font-heading gold-gradient-text mb-4" style={{ fontSize: "36px", lineHeight: 1.2, textShadow: "0 0 30px hsl(222 47% 6%)" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                              {risingInfo.sunSign} ☀️ + {risingInfo.name} ⬆️
                            </motion.h2>
                            <motion.p className="text-muted-foreground font-body" style={{ fontSize: "18px", textShadow: "0 2px 15px hsl(222 47% 6%)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                              {t.rising_sun_label}: {risingInfo.sunSign} ({risingInfo.sunElement}) · {t.rising_asc_label}: {risingInfo.name} ({risingInfo.element})
                            </motion.p>
                          </>
                        ) : null}
                        <motion.div className="flex items-center justify-center gap-6 mt-12" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                          <motion.button onClick={handleShare} className="flex items-center gap-3 rounded-full font-body" style={{ fontSize: "18px", height: "56px", padding: "0 32px", background: "linear-gradient(135deg, hsl(142 70% 35% / 0.2), hsl(142 70% 35% / 0.1))", border: "1px solid hsl(142 70% 45% / 0.3)", color: "hsl(142 70% 60%)", backdropFilter: "blur(8px)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}><Share2 style={{ width: 20, height: 20 }} />{t.forecast_share}</motion.button>
                          <motion.button onClick={handleCopy} className="flex items-center gap-3 rounded-full font-body" style={{ fontSize: "18px", height: "56px", padding: "0 32px", background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))", backdropFilter: "blur(8px)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{copied ? <Check style={{ width: 20, height: 20 }} /> : <Copy style={{ width: 20, height: 20 }} />}{copied ? t.forecast_copied : t.forecast_copy}</motion.button>
                        </motion.div>
                        <motion.button
                          onClick={handleClose}
                          className="font-body text-muted-foreground hover:text-gold/80 transition-colors duration-300 mt-10 block mx-auto"
                          style={{ fontSize: "17px", height: "44px", padding: "0 28px", cursor: "pointer" }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {t.onboarding_skip || "דלג ←"}
                        </motion.button>
                      </div>
                    </motion.div>

                  </div>
                ) : (
                  /* ── Mobile: stacked ── */
                  <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-12 lg:p-14">
                    <div className="text-center mb-10">
                      {mode === "forecast" && signInfo ? (
                        <>
                          <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>{signInfo.symbol}</motion.div>
                          <motion.h2 className="font-heading text-2xl md:text-4xl gold-gradient-text mb-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>{signInfo.name}</motion.h2>
                          <motion.p className="text-muted-foreground font-body text-sm md:text-base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>{signInfo.dateRange} • {t.forecast_element_label} {signInfo.element}</motion.p>
                          <motion.div className="section-divider max-w-[120px] mx-auto mt-5" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5 }} />
                          <motion.p className="text-gold/60 font-body text-sm mt-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>{t.forecast_month_label} {monthName}</motion.p>
                        </>
                      ) : risingInfo ? (
                        <>
                          <motion.div className="flex items-center justify-center gap-3 text-5xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}><span>{risingInfo.sunSymbol}</span><span className="text-gold/40 text-2xl">✦</span><span>{risingInfo.symbol}</span></motion.div>
                          <motion.h2 className="font-heading text-2xl md:text-4xl gold-gradient-text mb-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>{risingInfo.sunSign} ☀️ + {risingInfo.name} ⬆️</motion.h2>
                          <motion.p className="text-muted-foreground font-body text-sm md:text-base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>{t.rising_sun_label}: {risingInfo.sunSign} ({risingInfo.sunElement}) · {t.rising_asc_label}: {risingInfo.name} ({risingInfo.element})</motion.p>
                          <motion.div className="section-divider max-w-[120px] mx-auto mt-5" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5 }} />
                        </>
                      ) : null}
                      <motion.div className="flex items-center justify-center gap-3 mt-6" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                        <motion.button onClick={handleShare} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-body" style={{ background: "linear-gradient(135deg, hsl(142 70% 35% / 0.2), hsl(142 70% 35% / 0.1))", border: "1px solid hsl(142 70% 45% / 0.3)", color: "hsl(142 70% 60%)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}><Share2 className="w-4 h-4" />{t.forecast_share}</motion.button>
                        <motion.button onClick={handleCopy} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-body" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? t.forecast_copied : t.forecast_copy}</motion.button>
                      </motion.div>
                    </div>

                    {aiText ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-prose mx-auto">
                        <div className="flex justify-end mb-6"><TextSizeControl value={textSize} onChange={setTextSize} /></div>
                        {renderMysticalText(aiText, textSize)}
                        {aiLoading && (
                          <motion.div className="flex items-center justify-center gap-2 mt-8" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
                            <Loader2 className="w-5 h-5 text-gold/60 animate-spin" />
                            <span className="font-body text-sm text-gold/50">{mode === "forecast" ? t.forecast_loading : t.rising_loading}</span>
                          </motion.div>
                        )}
                      </motion.div>
                    ) : aiError ? (
                      <div className="text-center rounded-xl p-6" style={{ background: "hsl(var(--crimson) / 0.08)", border: "1px solid hsl(var(--crimson) / 0.15)" }}><p className="text-foreground/50 font-body text-sm">{aiError}</p></div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16">
                        <motion.div className="w-16 h-16 rounded-full mb-6" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }} animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }} transition={{ duration: 3, repeat: Infinity }} />
                        <motion.p className="font-body text-gold/70 text-base" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>{mode === "forecast" ? t.forecast_loading : t.rising_loading}</motion.p>
                      </div>
                    )}

                    {!aiLoading && (aiText || aiError) && (
                      <>
                        <ShareResultSection
                          symbol={mode === "forecast" ? signInfo!.symbol : risingInfo!.symbol}
                          title={mode === "forecast" ? `${t.readings_type_forecast} — ${signInfo!.name}` : `${risingInfo!.sunSign} + ${risingInfo!.name}`}
                          subtitle={mode === "forecast" ? monthName : `${t.rising_sun_label} + ${t.rising_asc_label}`}
                        />
                        <div className="section-divider max-w-[200px] mx-auto my-10" />
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="text-center rounded-xl p-8" style={{ background: "linear-gradient(135deg, hsl(var(--crimson) / 0.08), hsl(var(--gold) / 0.05))", border: "1px solid hsl(var(--gold) / 0.12)" }}>
                          <Crown className="w-7 h-7 text-gold mx-auto mb-4" />
                          <h4 className="font-heading text-lg md:text-xl text-gold mb-3">{t.forecast_premium_title}</h4>
                          <p className="text-foreground/60 font-body text-sm md:text-base mb-5 max-w-sm mx-auto leading-relaxed">{t.forecast_premium_desc}</p>
                          <a href="#premium" onClick={handleClose} className="btn-gold font-body text-sm inline-flex items-center gap-2"><Sparkles className="w-4 h-4" />{t.forecast_premium_cta}</a>
                        </motion.div>
                      </>
                    )}
                  </motion.div>
                )
              ) : null}
            </AnimatePresence>

            {/* ── Astrologer Avatar — matches Hero placement exactly ── */}
            {!isMobile && (
              <motion.div
                className="fixed z-[110] pointer-events-auto"
                style={{
                  bottom: 10,
                  right: 10,
                  filter: "drop-shadow(0 0 18px hsl(270 60% 45% / 0.35)) drop-shadow(0 4px 12px hsl(222 47% 6% / 0.5))",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                <AvatarHoverTeaser anchor="left">
                  <AstrologerAvatarButton
                    size={132}
                    onClick={() => setAdvisorOpen(true)}
                    entranceDelay={0.6}
                    className="relative"
                  />
                </AvatarHoverTeaser>
              </motion.div>
            )}

            <AdvisorChatPanel isOpen={advisorOpen} onClose={() => setAdvisorOpen(false)} forceRightAnchor />
    </CinematicModalShell>
  );
};

export default MonthlyForecastModal;
