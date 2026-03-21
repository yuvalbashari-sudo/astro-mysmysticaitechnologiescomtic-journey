import { useState, useEffect, useRef } from "react";
import CinematicModalShell from "@/components/CinematicModalShell";
import TextSizeControl, { type TextSize } from "@/components/TextSizeControl";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Sparkles, Crown, Share2, Copy, Check, Loader2 } from "lucide-react";
import { getZodiacSign } from "@/data/zodiacData";
import { toast } from "@/components/ui/sonner";
import { readingsStorage } from "@/lib/readingsStorage";
import { streamMysticalReading, renderMysticalText } from "@/lib/aiStreaming";
import { mysticalProfile } from "@/lib/mysticalProfile";
import ShareResultSection from "@/components/ShareResultSection";
import MysticalOnboarding from "@/components/MysticalOnboarding";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { useReadingContext } from "@/contexts/ReadingContext";

interface Props { isOpen: boolean; onClose: () => void; }

const MonthlyForecastModal = ({ isOpen, onClose }: Props) => {
  const t = useT();
  const { language } = useLanguage();
  const { setActiveReading } = useReadingContext();
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [attempted, setAttempted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [signInfo, setSignInfo] = useState<{ name: string; symbol: string; dateRange: string; element: string } | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiTextRef = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [textSize, setTextSize] = useState<TextSize>("default");
  const [isMobile, setIsMobile] = useState(false);

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
    setIsLoading(true);
  };

  const handleOnboardingComplete = () => {
    const date = new Date(birthDate);
    const sign = getZodiacSign(date);
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
  };

  const handleClose = () => { onClose(); setTimeout(() => { setSignInfo(null); setBirthDate(""); setGender(""); setAttempted(false); setIsLoading(false); setAiText(""); setAiLoading(false); setAiError(null); aiTextRef.current = ""; }, 300); };

  useEffect(() => { if (aiLoading && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [aiText, aiLoading]);

  const handleShare = () => {
    if (!signInfo) return;
    const text = `✨ ${t.readings_type_forecast} — ${signInfo.name} ${signInfo.symbol}\n${monthName}\n\n🔮 ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopy = async () => {
    if (!aiText) return;
    await navigator.clipboard.writeText(`✨ ${signInfo?.name} — ${t.readings_type_forecast}\n\n${aiText}`);
    setCopied(true); toast(t.share_copy_toast); setTimeout(() => setCopied(false), 2000);
  };

  const isDesktopResult = !isMobile && !!signInfo;
  const isDesktopInput = !isMobile && !signInfo && !isLoading;

  return (
    <CinematicModalShell isOpen={isOpen} onClose={handleClose} scrollRef={scrollRef as React.RefObject<HTMLDivElement>} fullscreen>
            <AnimatePresence mode="wait">
              {!signInfo && !isLoading ? (
                isDesktopInput ? (
                  /* ── Desktop: 3-zone – LEFT text + CENTER oracle + RIGHT form ── */
                  <div className="absolute inset-0 flex items-center" key="input-desktop">
                    {/* LEFT: Explanation text */}
                    <motion.div
                      className="hidden md:flex flex-col justify-center pointer-events-auto"
                      style={{ width: "28%", maxWidth: "340px", paddingLeft: "4vw" }}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <motion.div className="w-14 h-14 mb-5 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }} animate={{ boxShadow: ["0 0 20px hsl(43 80% 55% / 0.1)", "0 0 40px hsl(43 80% 55% / 0.2)", "0 0 20px hsl(43 80% 55% / 0.1)"] }} transition={{ duration: 3, repeat: Infinity }}>
                        <Calendar className="w-6 h-6 text-gold" />
                      </motion.div>
                      <h2 className="font-heading text-2xl gold-gradient-text mb-3" style={{ textShadow: "0 0 30px hsl(222 47% 6%)" }}>{t.forecast_title}</h2>
                      <p className="text-foreground/60 font-body text-sm leading-relaxed" style={{ textShadow: "0 2px 15px hsl(222 47% 6%)" }}>{t.forecast_desc}</p>
                      <p className="text-[11px] text-muted-foreground font-body mt-6" style={{ textShadow: "0 2px 10px hsl(222 47% 6%)" }}>{t.forecast_note}</p>
                    </motion.div>

                    {/* CENTER: Oracle safe zone */}
                    <div className="flex-1" />

                    {/* RIGHT: Form panel */}
                    <motion.div
                      className="flex flex-col justify-center pointer-events-auto"
                      style={{ width: "400px", maxWidth: "32vw", paddingRight: "4vw" }}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div
                        className="rounded-2xl p-8"
                        style={{
                          background: "linear-gradient(135deg, hsl(222 47% 8% / 0.75), hsl(222 47% 12% / 0.55))",
                          backdropFilter: "blur(20px)",
                          border: "1px solid hsl(var(--gold) / 0.1)",
                          boxShadow: "0 8px 40px hsl(222 47% 4% / 0.5), inset 0 1px 0 hsl(var(--gold) / 0.05)",
                        }}
                      >
                        {/* Gender Selection */}
                        <div className="mb-6">
                          <label className="block text-base text-gold/70 font-body mb-3">{t.forecast_gender_label}</label>
                          <div className="flex gap-3">
                            <motion.button type="button" onClick={() => setGender("male")}
                              className="flex-1 py-3 rounded-xl font-body text-base transition-all duration-300"
                              style={{
                                background: gender === "male" ? "linear-gradient(135deg, hsl(var(--gold) / 0.25), hsl(var(--gold) / 0.1))" : "hsl(222 47% 11% / 0.6)",
                                border: gender === "male" ? "1px solid hsl(var(--gold) / 0.5)" : "1px solid hsl(var(--gold) / 0.12)",
                                color: gender === "male" ? "hsl(var(--gold))" : "hsl(var(--foreground) / 0.5)",
                                backdropFilter: "blur(8px)",
                              }}
                              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            >{t.forecast_gender_male}</motion.button>
                            <motion.button type="button" onClick={() => setGender("female")}
                              className="flex-1 py-3 rounded-xl font-body text-base transition-all duration-300"
                              style={{
                                background: gender === "female" ? "linear-gradient(135deg, hsl(var(--gold) / 0.25), hsl(var(--gold) / 0.1))" : "hsl(222 47% 11% / 0.6)",
                                border: gender === "female" ? "1px solid hsl(var(--gold) / 0.5)" : "1px solid hsl(var(--gold) / 0.12)",
                                color: gender === "female" ? "hsl(var(--gold))" : "hsl(var(--foreground) / 0.5)",
                                backdropFilter: "blur(8px)",
                              }}
                              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            >{t.forecast_gender_female}</motion.button>
                          </div>
                          {attempted && !gender && <p className="text-xs mt-2 font-body" style={{ color: "hsl(var(--crimson))" }}>{t.forecast_gender_required}</p>}
                        </div>

                        {/* Birth date */}
                        <div className="mb-8">
                          <label className="block text-base text-gold/70 font-body mb-3">{t.forecast_birthdate_label}</label>
                          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mystical-input font-body text-center text-base" style={{ direction: "ltr" }} />
                          {attempted && !birthDate && <p className="text-xs mt-2 font-body" style={{ color: "hsl(var(--crimson))" }}>{t.forecast_birthdate_required}</p>}
                        </div>

                        {/* CTA */}
                        <motion.button onClick={handleSubmit} className="btn-gold font-body text-base w-full flex items-center justify-center gap-2" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}><Sparkles className="w-4 h-4" />{t.forecast_cta}</motion.button>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  /* ── Mobile: centered form ── */
                  <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-8 md:p-12 text-center">
                     <motion.div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }} animate={{ boxShadow: ["0 0 20px hsl(43 80% 55% / 0.1)", "0 0 40px hsl(43 80% 55% / 0.2)", "0 0 20px hsl(43 80% 55% / 0.1)"] }} transition={{ duration: 3, repeat: Infinity }}>
                       <Calendar className="w-7 h-7 text-gold" />
                     </motion.div>
                     <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-3">{t.forecast_title}</h2>
                     <p className="text-foreground/70 font-body text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">{t.forecast_desc}</p>

                     {/* Gender Selection */}
                     <div className="max-w-xs mx-auto mb-6">
                       <label className="block text-sm text-gold/70 font-body mb-2 text-right">{t.forecast_gender_label}</label>
                       <div className="flex gap-2">
                         <motion.button type="button" onClick={() => setGender("male")}
                           className="flex-1 py-2.5 rounded-xl font-body text-sm transition-all duration-300"
                           style={{
                             background: gender === "male" ? "linear-gradient(135deg, hsl(var(--gold) / 0.25), hsl(var(--gold) / 0.1))" : "hsl(222 47% 11% / 0.6)",
                             border: gender === "male" ? "1px solid hsl(var(--gold) / 0.5)" : "1px solid hsl(var(--gold) / 0.12)",
                             color: gender === "male" ? "hsl(var(--gold))" : "hsl(var(--foreground) / 0.5)",
                             backdropFilter: "blur(8px)",
                           }}
                           whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                         >{t.forecast_gender_male}</motion.button>
                         <motion.button type="button" onClick={() => setGender("female")}
                           className="flex-1 py-2.5 rounded-xl font-body text-sm transition-all duration-300"
                           style={{
                             background: gender === "female" ? "linear-gradient(135deg, hsl(var(--gold) / 0.25), hsl(var(--gold) / 0.1))" : "hsl(222 47% 11% / 0.6)",
                             border: gender === "female" ? "1px solid hsl(var(--gold) / 0.5)" : "1px solid hsl(var(--gold) / 0.12)",
                             color: gender === "female" ? "hsl(var(--gold))" : "hsl(var(--foreground) / 0.5)",
                             backdropFilter: "blur(8px)",
                           }}
                           whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                         >{t.forecast_gender_female}</motion.button>
                       </div>
                       {attempted && !gender && <p className="text-xs mt-1.5 font-body" style={{ color: "hsl(var(--crimson))" }}>{t.forecast_gender_required}</p>}
                     </div>

                     <div className="max-w-xs mx-auto mb-8">
                       <label className="block text-sm text-gold/70 font-body mb-2 text-right">{t.forecast_birthdate_label}</label>
                       <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mystical-input font-body text-center" style={{ direction: "ltr" }} />
                       {attempted && !birthDate && <p className="text-xs mt-1.5 font-body" style={{ color: "hsl(var(--crimson))" }}>{t.forecast_birthdate_required}</p>}
                     </div>
                     <motion.button onClick={handleSubmit} className="btn-gold font-body flex items-center justify-center gap-2 mx-auto disabled:opacity-40 disabled:cursor-not-allowed" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}><Sparkles className="w-4 h-4" />{t.forecast_cta}</motion.button>
                     <p className="text-[11px] text-muted-foreground font-body mt-6">{t.forecast_note}</p>
                   </motion.div>
                )
              ) : isLoading ? (
                <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div><MysticalOnboarding onComplete={handleOnboardingComplete} /></div></motion.div>
              ) : signInfo ? (
                isDesktopResult ? (
                  /* ── Desktop 3-zone ── */
                  <div className="absolute inset-0">
                    {/* LEFT: Interpretation */}
                    <motion.div
                      ref={scrollRef}
                      className="absolute overflow-y-auto pointer-events-auto scrollbar-hide"
                      style={{ top: "calc(10vh + 50px)", left: "3vw", width: "min(480px, calc(100vw - 560px))", maxWidth: "480px", maxHeight: "80vh" }}
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
                                <span className="font-body text-sm text-gold/50">{t.forecast_loading}</span>
                              </motion.div>
                            )}
                          </motion.div>
                        ) : aiError ? (
                          <div className="text-center rounded-xl p-6" style={{ background: "hsl(var(--crimson) / 0.08)", border: "1px solid hsl(var(--crimson) / 0.15)" }}><p className="text-foreground/50 font-body text-sm">{aiError}</p></div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16">
                            <motion.div className="w-16 h-16 rounded-full mb-6" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }} animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }} transition={{ duration: 3, repeat: Infinity }} />
                            <motion.p className="font-body text-gold/70 text-base" style={{ textShadow: "0 2px 15px hsl(222 47% 6%)" }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>{t.forecast_loading}</motion.p>
                          </div>
                        )}
                        {!aiLoading && (aiText || aiError) && (
                          <ShareResultSection symbol={signInfo.symbol} title={`${t.readings_type_forecast} — ${signInfo.name}`} subtitle={monthName} />
                        )}
                      </div>
                    </motion.div>

                    {/* RIGHT: Sign info */}
                    <motion.div
                      className="absolute pointer-events-auto flex flex-col items-center"
                      style={{ top: "calc(10vh + 50px)", right: "3vw", width: "min(340px, 24vw)" }}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="text-center">
                        <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} style={{ textShadow: "0 0 25px hsl(222 47% 6%)" }}>{signInfo.symbol}</motion.div>
                        <motion.h2 className="font-heading text-2xl gold-gradient-text mb-2" style={{ textShadow: "0 0 30px hsl(222 47% 6%)" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>{signInfo.name}</motion.h2>
                        <motion.p className="text-muted-foreground font-body text-sm" style={{ textShadow: "0 2px 15px hsl(222 47% 6%)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>{signInfo.dateRange} • {t.forecast_element_label} {signInfo.element}</motion.p>
                        <motion.p className="text-gold/60 font-body text-sm mt-3" style={{ textShadow: "0 2px 15px hsl(222 47% 6%)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>{t.forecast_month_label} {monthName}</motion.p>
                        <motion.div className="flex items-center justify-center gap-3 mt-6" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                          <motion.button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-body" style={{ background: "linear-gradient(135deg, hsl(142 70% 35% / 0.2), hsl(142 70% 35% / 0.1))", border: "1px solid hsl(142 70% 45% / 0.3)", color: "hsl(142 70% 60%)", backdropFilter: "blur(8px)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}><Share2 className="w-4 h-4" />{t.forecast_share}</motion.button>
                          <motion.button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-body" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))", backdropFilter: "blur(8px)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? t.forecast_copied : t.forecast_copy}</motion.button>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  /* ── Mobile: stacked ── */
                  <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-12 lg:p-14">
                    <div className="text-center mb-10">
                      <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>{signInfo.symbol}</motion.div>
                      <motion.h2 className="font-heading text-2xl md:text-4xl gold-gradient-text mb-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>{signInfo.name}</motion.h2>
                      <motion.p className="text-muted-foreground font-body text-sm md:text-base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>{signInfo.dateRange} • {t.forecast_element_label} {signInfo.element}</motion.p>
                      <motion.div className="section-divider max-w-[120px] mx-auto mt-5" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5 }} />
                      <motion.p className="text-gold/60 font-body text-sm mt-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>{t.forecast_month_label} {monthName}</motion.p>
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
                            <span className="font-body text-sm text-gold/50">{t.forecast_loading}</span>
                          </motion.div>
                        )}
                      </motion.div>
                    ) : aiError ? (
                      <div className="text-center rounded-xl p-6" style={{ background: "hsl(var(--crimson) / 0.08)", border: "1px solid hsl(var(--crimson) / 0.15)" }}><p className="text-foreground/50 font-body text-sm">{aiError}</p></div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16">
                        <motion.div className="w-16 h-16 rounded-full mb-6" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }} animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }} transition={{ duration: 3, repeat: Infinity }} />
                        <motion.p className="font-body text-gold/70 text-base" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>{t.forecast_loading}</motion.p>
                      </div>
                    )}

                    {!aiLoading && (aiText || aiError) && (
                      <>
                        <ShareResultSection symbol={signInfo.symbol} title={`${t.readings_type_forecast} — ${signInfo.name}`} subtitle={monthName} />
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
    </CinematicModalShell>
  );
};

export default MonthlyForecastModal;
