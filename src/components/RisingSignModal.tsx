import { useState, useEffect, useRef } from "react";
import MysticalNameInput from "@/components/MysticalNameInput";
import CinematicModalShell from "@/components/CinematicModalShell";
import TextSizeControl, { type TextSize } from "@/components/TextSizeControl";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Sparkles, Crown, Share2, Copy, Check, Loader2, Calendar } from "lucide-react";
import MysticalDateInput from "@/components/MysticalDateInput";
import { getRisingSign } from "@/data/risingSignData";
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

interface SignInfoState {
  name: string; symbol: string; element: string;
  sunSign: string; sunSymbol: string; sunElement: string;
}

const RisingSignModal = ({ isOpen, onClose }: Props) => {
  const t = useT();
  const { language } = useLanguage();
  const { setActiveReading } = useReadingContext();
  const [birthTime, setBirthTime] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">(""); 
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [signInfo, setSignInfo] = useState<SignInfoState | null>(null);
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

  const handleSubmit = () => { if (!birthTime || !birthDate) return; if (userName.trim()) mysticalProfile.recordUserName(userName.trim()); setIsLoading(true); };

  const handleOnboardingComplete = () => {
    const [h, m] = birthTime.split(":").map(Number);
    const rising = getRisingSign(h, m);
    const sunSign = getZodiacSign(new Date(birthDate));
    setSignInfo({ name: rising.hebrewName, symbol: rising.symbol, element: rising.element, sunSign: sunSign.hebrewName, sunSymbol: sunSign.symbol, sunElement: sunSign.element });
    setIsLoading(false); setAiLoading(true); aiTextRef.current = "";

    mysticalProfile.recordZodiac(sunSign.hebrewName, sunSign.symbol, sunSign.element, birthDate);
    mysticalProfile.recordRising(rising.hebrewName, rising.symbol, rising.element, birthTime);

    streamMysticalReading("rising",
      { signName: rising.hebrewName, signSymbol: rising.symbol, element: rising.element, birthTime, birthDate, sunSignName: sunSign.hebrewName, sunSignSymbol: sunSign.symbol, sunElement: sunSign.element, gender },
      (delta) => { aiTextRef.current += delta; setAiText(aiTextRef.current); },
      () => { setAiLoading(false); setActiveReading({ type: "rising", label: `${t.readings_type_rising} — ${rising.hebrewName}`, summary: aiTextRef.current }); readingsStorage.save({ type: "rising", title: `${t.readings_type_rising} — ${rising.hebrewName}`, subtitle: `${t.rising_sun_label}: ${sunSign.hebrewName}`, symbol: rising.symbol, data: { signName: rising.hebrewName, sunSign: sunSign.hebrewName, birthTime, birthDate, aiReading: aiTextRef.current } }); },
      (err) => { setAiLoading(false); setAiError(err); toast(err); },
      language,
    );
  };

  const handleClose = () => { onClose(); setTimeout(() => { setSignInfo(null); setBirthTime(""); setBirthDate(""); setGender(""); setIsLoading(false); setAiText(""); setAiLoading(false); setAiError(null); aiTextRef.current = ""; }, 300); };

  useEffect(() => { if (aiLoading && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [aiText, aiLoading]);

  const handleShare = () => {
    if (!signInfo) return;
    const text = `✨ ${t.rising_asc_label} — ${signInfo.name} ${signInfo.symbol}\n☀️ ${t.rising_sun_label}: ${signInfo.sunSign} ${signInfo.sunSymbol}\n\n🔮 ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopy = async () => {
    if (!aiText) return;
    await navigator.clipboard.writeText(`✨ ${t.rising_asc_label} — ${signInfo?.name} | ${t.rising_sun_label} — ${signInfo?.sunSign}\n\n${aiText}`);
    setCopied(true); toast(t.share_copy_toast); setTimeout(() => setCopied(false), 2000);
  };

  const isDesktopResult = !isMobile && !!signInfo;
  const isDesktopInput = !isMobile && !signInfo && !isLoading;

  return (
    <CinematicModalShell isOpen={isOpen} onClose={handleClose} scrollRef={scrollRef as React.RefObject<HTMLDivElement>} fullscreen={isDesktopResult || isDesktopInput}>
            <AnimatePresence mode="wait">
              {!signInfo && !isLoading ? (
                isDesktopInput ? (
                  /* ── Desktop: form on RIGHT side ── */
                  <div className="absolute inset-0" key="input-desktop">
                    <motion.div
                      className="absolute pointer-events-auto"
                      style={{ top: "calc(10vh + 50px)", right: "3vw", width: "min(340px, 24vw)" }}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="text-center">
                        <motion.div className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }}><Clock className="w-6 h-6 text-gold" /></motion.div>
                        <h2 className="font-heading text-2xl gold-gradient-text mb-2" style={{ textShadow: "0 0 30px hsl(222 47% 6%)" }}>{t.rising_title}</h2>
                        <p className="text-foreground/70 font-body text-sm mb-6 leading-relaxed" style={{ textShadow: "0 2px 15px hsl(222 47% 6%)" }}>{t.rising_desc}</p>
                        <div className="space-y-4 mb-6">
                          <MysticalNameInput value={userName} onChange={setUserName} delay={0.25} />
                          <div>
                            <label className="block text-sm text-gold/70 font-body mb-2">{t.forecast_gender_label}</label>
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
                          </div>
                          <div>
                            <label className="block text-sm text-gold/70 font-body mb-2 text-start"><Calendar className="w-3.5 h-3.5 inline-block ms-1" />{t.rising_birthdate_label}</label>
                            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mystical-input font-body text-center" style={{ direction: "ltr" }} />
                          </div>
                          <div>
                            <label className="block text-sm text-gold/70 font-body mb-2 text-start"><Clock className="w-3.5 h-3.5 inline-block ms-1" />{t.rising_birthtime_label}</label>
                            <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="mystical-input font-body text-center" style={{ direction: "ltr" }} />
                          </div>
                        </div>
                        <motion.button onClick={handleSubmit} disabled={!birthTime || !birthDate} className="btn-gold font-body flex items-center justify-center gap-2 mx-auto disabled:opacity-40 disabled:cursor-not-allowed" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}><Sparkles className="w-4 h-4" />{t.rising_cta}</motion.button>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  /* ── Mobile: centered form ── */
                  <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-8 md:p-12 text-center">
                    <motion.div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }}><Clock className="w-7 h-7 text-gold" /></motion.div>
                    <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-3">{t.rising_title}</h2>
                    <p className="text-foreground/70 font-body text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">{t.rising_desc}</p>
                    <div className="max-w-xs mx-auto space-y-5 mb-8">
                      <MysticalNameInput value={userName} onChange={setUserName} delay={0.25} />
                      <div>
                        <label className="block text-sm text-gold/70 font-body mb-2">{t.forecast_gender_label}</label>
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
                      </div>
                      <div>
                        <label className="block text-sm text-gold/70 font-body mb-2 text-start"><Calendar className="w-3.5 h-3.5 inline-block ms-1" />{t.rising_birthdate_label}</label>
                        <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mystical-input font-body text-center" style={{ direction: "ltr" }} />
                      </div>
                      <div>
                        <label className="block text-sm text-gold/70 font-body mb-2 text-start"><Clock className="w-3.5 h-3.5 inline-block ms-1" />{t.rising_birthtime_label}</label>
                        <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="mystical-input font-body text-center" style={{ direction: "ltr" }} />
                      </div>
                    </div>
                    <motion.button onClick={handleSubmit} disabled={!birthTime || !birthDate} className="btn-gold font-body flex items-center justify-center gap-2 mx-auto disabled:opacity-40 disabled:cursor-not-allowed" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}><Sparkles className="w-4 h-4" />{t.rising_cta}</motion.button>
                  </motion.div>
                )
              ) : isLoading ? (
                <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><MysticalOnboarding onComplete={handleOnboardingComplete} /></motion.div>
              ) : signInfo ? (
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
                            {aiLoading && (<motion.div className="flex items-center justify-center gap-2 mt-8" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}><Loader2 className="w-5 h-5 text-gold/60 animate-spin" /><span className="font-body text-sm text-gold/50">{t.rising_loading}</span></motion.div>)}
                          </motion.div>
                        ) : aiError ? (
                          <div className="text-center rounded-xl p-6" style={{ background: "hsl(var(--crimson) / 0.08)", border: "1px solid hsl(var(--crimson) / 0.15)" }}><p className="text-foreground/50 font-body text-sm">{aiError}</p></div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16">
                            <motion.div className="w-16 h-16 rounded-full mb-6" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }} animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }} transition={{ duration: 3, repeat: Infinity }} />
                            <motion.p className="font-body text-gold/70 text-base" style={{ textShadow: "0 2px 15px hsl(222 47% 6%)" }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>{t.rising_loading}</motion.p>
                          </div>
                        )}
                        {!aiLoading && (aiText || aiError) && (
                          <ShareResultSection symbol={signInfo.symbol} title={`${signInfo.sunSign} + ${signInfo.name}`} subtitle={`${t.rising_sun_label} + ${t.rising_asc_label}`} />
                        )}
                      </div>
                    </motion.div>

                    {/* RIGHT: Sign info panel */}
                    <motion.div
                      className="absolute pointer-events-auto flex flex-col items-center"
                      style={{ top: "calc(10vh + 50px)", right: "3vw", width: "min(340px, 24vw)" }}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="text-center">
                        <motion.div className="flex items-center justify-center gap-3 text-5xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                          <span style={{ textShadow: "0 0 20px hsl(222 47% 6%)" }}>{signInfo.sunSymbol}</span>
                          <span className="text-gold/40 text-2xl" style={{ textShadow: "0 0 10px hsl(var(--gold) / 0.2)" }}>✦</span>
                          <span style={{ textShadow: "0 0 20px hsl(222 47% 6%)" }}>{signInfo.symbol}</span>
                        </motion.div>
                        <motion.h2 className="font-heading text-2xl gold-gradient-text mb-2" style={{ textShadow: "0 0 30px hsl(222 47% 6%)" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                          {signInfo.sunSign} ☀️ + {signInfo.name} ⬆️
                        </motion.h2>
                        <motion.p className="text-muted-foreground font-body text-sm" style={{ textShadow: "0 2px 15px hsl(222 47% 6%)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                          {t.rising_sun_label}: {signInfo.sunSign} ({signInfo.sunElement}) · {t.rising_asc_label}: {signInfo.name} ({signInfo.element})
                        </motion.p>
                        <motion.div className="flex items-center justify-center gap-3 mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                          <motion.button onClick={handleShare} className="flex items-center gap-3 px-6 py-3 rounded-full text-base font-body" style={{ background: "linear-gradient(135deg, hsl(142 70% 35% / 0.2), hsl(142 70% 35% / 0.1))", border: "1px solid hsl(142 70% 45% / 0.3)", color: "hsl(142 70% 60%)", backdropFilter: "blur(8px)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}><Share2 className="w-5 h-5" />{t.forecast_share}</motion.button>
                          <motion.button onClick={handleCopy} className="flex items-center gap-3 px-6 py-3 rounded-full text-base font-body" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))", backdropFilter: "blur(8px)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}{copied ? t.share_copied : t.share_copy}</motion.button>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  /* ── Mobile: stacked ── */
                  <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-12 lg:p-14">
                    <div className="text-center mb-10">
                      <motion.div className="flex items-center justify-center gap-3 text-5xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}><span>{signInfo.sunSymbol}</span><span className="text-gold/40 text-2xl">✦</span><span>{signInfo.symbol}</span></motion.div>
                      <motion.h2 className="font-heading text-2xl md:text-4xl gold-gradient-text mb-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>{signInfo.sunSign} ☀️ + {signInfo.name} ⬆️</motion.h2>
                      <motion.p className="text-muted-foreground font-body text-sm md:text-base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>{t.rising_sun_label}: {signInfo.sunSign} ({signInfo.sunElement}) · {t.rising_asc_label}: {signInfo.name} ({signInfo.element})</motion.p>
                      <motion.div className="section-divider max-w-[120px] mx-auto mt-5" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5 }} />
                      <motion.div className="flex items-center justify-center gap-3 mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                        <motion.button onClick={handleShare} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-body" style={{ background: "linear-gradient(135deg, hsl(142 70% 35% / 0.2), hsl(142 70% 35% / 0.1))", border: "1px solid hsl(142 70% 45% / 0.3)", color: "hsl(142 70% 60%)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}><Share2 className="w-4 h-4" />{t.forecast_share}</motion.button>
                        <motion.button onClick={handleCopy} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-body" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? t.share_copied : t.share_copy}</motion.button>
                      </motion.div>
                    </div>

                    {aiText ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-prose mx-auto">
                        <div className="flex justify-end mb-6"><TextSizeControl value={textSize} onChange={setTextSize} /></div>
                        {renderMysticalText(aiText, textSize)}
                        {aiLoading && (<motion.div className="flex items-center justify-center gap-2 mt-8" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}><Loader2 className="w-5 h-5 text-gold/60 animate-spin" /><span className="font-body text-sm text-gold/50">{t.rising_loading}</span></motion.div>)}
                      </motion.div>
                    ) : aiError ? (
                      <div className="text-center rounded-xl p-6" style={{ background: "hsl(var(--crimson) / 0.08)", border: "1px solid hsl(var(--crimson) / 0.15)" }}><p className="text-foreground/50 font-body text-sm">{aiError}</p></div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16">
                        <motion.div className="w-16 h-16 rounded-full mb-6" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }} animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }} transition={{ duration: 3, repeat: Infinity }} />
                        <motion.p className="font-body text-gold/70 text-base" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>{t.rising_loading}</motion.p>
                      </div>
                    )}

                    {!aiLoading && (aiText || aiError) && (
                      <>
                        <ShareResultSection symbol={signInfo.symbol} title={`${signInfo.sunSign} + ${signInfo.name}`} subtitle={`${t.rising_sun_label} + ${t.rising_asc_label}`} />
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

export default RisingSignModal;
