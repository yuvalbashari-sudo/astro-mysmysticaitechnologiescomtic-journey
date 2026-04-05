import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import BirthDetailsForm, { type BirthDetails } from "@/components/BirthDetailsForm";
import CinematicModalShell from "@/components/CinematicModalShell";
import TextSizeControl, { type TextSize } from "@/components/TextSizeControl";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Sparkles, Crown, Share2, Copy, Check, Loader2 } from "lucide-react";
import { getZodiacSign } from "@/data/zodiacData";
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

interface Props { isOpen: boolean; onClose: () => void; }

const MonthlyForecastModal = ({ isOpen, onClose }: Props) => {
  const t = useT();
  const { language } = useLanguage();
  const { setActiveReading } = useReadingContext();
  const [details, setDetails] = useState<BirthDetails>({
    userName: "", gender: "", birthDate: "", birthTime: "", birthCity: "",
  });
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
  const isMobile = useIsMobile();
  const [advisorOpen, setAdvisorOpen] = useState(false);

  const monthLocale = language === "he" ? "he-IL" : language === "ar" ? "ar-SA" : language === "ru" ? "ru-RU" : "en-US";
  const monthName = new Date().toLocaleDateString(monthLocale, { month: "long" });

  const { userName, gender, birthDate, birthTime, birthCity } = details;
  const updateDetails = (patch: Partial<BirthDetails>) => setDetails(prev => ({ ...prev, ...patch }));

  const handleSubmit = () => {
    setAttempted(true);
    if (!gender || !birthDate) return;
    if (userName.trim()) mysticalProfile.recordUserName(userName.trim());
    if (gender) mysticalProfile.recordGender(gender);
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
      {
        signName: sign.hebrewName, signSymbol: sign.symbol, birthDate, element: sign.element,
        dateRange: sign.dateRange, monthName, gender, birthCity: "",
        risingSign: "", risingSymbol: "", risingElement: "",
        moonSign: "", planetPositions: "", majorAspects: "",
        houseCusps: "", dominantElements: "", dominantHouses: "",
        ascendantAngle: undefined, coordinates: "", timezone: "",
        hasFullChart: false,
      },
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

  const handleClose = () => { onClose(); setTimeout(() => { setSignInfo(null); setRisingInfo(null); setNatalData(null); setDetails({ userName: "", gender: "", birthDate: "", birthTime: "", birthCity: "" }); setAttempted(false); setIsLoading(false); setAiText(""); setAiLoading(false); setAiError(null); aiTextRef.current = ""; }, 300); };

  useEffect(() => { if (aiLoading && scrollRef.current && !aiTextRef.current) scrollRef.current.scrollTop = 0; }, [aiLoading]);

  const hasResult = !!signInfo;

  const handleShare = () => {
    if (signInfo) {
      const text = `✨ ${t.readings_type_forecast} — ${signInfo.name} ${signInfo.symbol}\n${monthName}\n\n🔮 ${window.location.origin}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  const handleCopy = async () => {
    if (!aiText || !signInfo) return;
    await navigator.clipboard.writeText(`✨ ${signInfo.name} — ${t.readings_type_forecast}\n\n${aiText}`);
    setCopied(true); toast(t.share_copy_toast); setTimeout(() => setCopied(false), 2000);
  };

  const isDesktopResult = !isMobile && hasResult;
  const isDesktop = !isMobile;

  /* On mobile: we render a non-scrolling avatar header + scrollable body.
     CinematicModalShell fullscreen gives us an absolute inset-0 overflow-y-auto wrapper,
     but we override that by making our own flex layout inside it. */
  const mobileAvatarHeader = isMobile ? (
    <div
      className="flex-shrink-0 flex justify-center pointer-events-auto"
      style={{ paddingTop: 8, paddingBottom: 4, zIndex: 10 }}
    >
      <AstrologerAvatarButton
        size={73}
        onClick={() => setAdvisorOpen(true)}
        entranceDelay={0.6}
        className="relative"
        style={{
          filter: "drop-shadow(0 0 18px hsl(270 60% 45% / 0.35)) drop-shadow(0 4px 12px hsl(222 47% 6% / 0.5))",
        }}
      />
    </div>
  ) : null;

  /* ── Shared content: all the AnimatePresence phases ── */
  const sharedContent = (
    <AnimatePresence mode="wait">
      {!hasResult && !isLoading ? (
        isDesktop ? (
          /* ── Desktop: 3-column — LEFT form + CENTER oracle + RIGHT text ── */
          <div className="absolute inset-0 flex items-start" style={{ paddingTop: "clamp(100px, 14vh, 160px)" }} key="input-desktop">
            <motion.div
              className="flex flex-col justify-center pointer-events-auto"
              style={{ width: "700px", maxWidth: "48vw", paddingLeft: "4vw" }}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{ padding: "0 24px" }}>
                <BirthDetailsForm
                  values={details}
                  onChange={updateDetails}
                  attempted={attempted}
                  showTime={false}
                  size="large"
                />
                <div style={{ marginTop: "32px" }}>
                  <motion.button onClick={handleSubmit} className="btn-gold font-body w-full flex items-center justify-center" style={{ fontSize: "20px", padding: "14px 0", gap: "10px" }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}><Sparkles className="w-7 h-7" />{t.forecast_cta}</motion.button>
                </div>
              </div>
            </motion.div>
            <div className="flex-1" />
            <motion.div className="flex flex-col justify-center pointer-events-auto overflow-hidden" style={{ width: "52%", maxWidth: "780px", marginRight: "clamp(20px, 3vw, 60px)", marginLeft: "10px" }} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
              <div style={{ padding: "0 40px" }}>
                <motion.div className="w-28 h-28 mb-10 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.12), transparent)", border: "1px solid hsl(var(--gold) / 0.18)" }} animate={{ boxShadow: ["0 0 20px hsl(43 80% 55% / 0.08)", "0 0 40px hsl(43 80% 55% / 0.18)", "0 0 20px hsl(43 80% 55% / 0.08)"] }} transition={{ duration: 3, repeat: Infinity }}><Calendar className="w-12 h-12 text-gold" /></motion.div>
                <h2 className="font-heading gold-gradient-text mb-8" style={{ fontSize: "52px", lineHeight: 1.25, textShadow: "0 2px 30px hsl(222 47% 6%), 0 0 60px hsl(222 47% 6% / 0.85)", wordWrap: "break-word" }}>{t.forecast_title}</h2>
                <p className="font-body leading-relaxed" style={{ fontSize: "32px", lineHeight: 1.7, color: "hsl(var(--foreground) / 0.65)", textShadow: "0 2px 20px hsl(222 47% 6%), 0 0 40px hsl(222 47% 6%)", wordWrap: "break-word" }}>{t.forecast_desc}</p>
                <div className="section-divider max-w-[140px] my-10" />
                <p className="font-body" style={{ fontSize: "24px", lineHeight: 1.6, color: "hsl(var(--foreground) / 0.35)", textShadow: "0 2px 10px hsl(222 47% 6%)", wordWrap: "break-word" }}>{t.forecast_note}</p>
              </div>
            </motion.div>
          </div>
        ) : (
          /* ── Mobile: centered form ── */
          <motion.div key="input-mobile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6 text-center">
            <motion.div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }} animate={{ boxShadow: ["0 0 20px hsl(43 80% 55% / 0.1)", "0 0 40px hsl(43 80% 55% / 0.2)", "0 0 20px hsl(43 80% 55% / 0.1)"] }} transition={{ duration: 3, repeat: Infinity }}><Calendar className="w-7 h-7 text-gold" /></motion.div>
            <h2 className="font-heading text-2xl gold-gradient-text mb-3">{t.forecast_title}</h2>
            <p className="text-foreground/70 font-body text-sm mb-6 max-w-md mx-auto leading-relaxed">{t.forecast_desc}</p>
            <div className="max-w-xs mx-auto text-start">
              <BirthDetailsForm
                values={details}
                onChange={updateDetails}
                attempted={attempted}
                showTime={false}
              />
              <div className="mt-6 flex justify-center">
                <motion.button onClick={handleSubmit} className="btn-gold font-body flex items-center justify-center gap-2" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}><Sparkles className="w-4 h-4" />{t.forecast_cta}</motion.button>
              </div>
              <p className="text-[11px] text-muted-foreground font-body mt-6 text-center">{t.forecast_note}</p>
            </div>
          </motion.div>
        )
      ) : isLoading ? (
        isMobile ? (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><MysticalOnboarding onComplete={handleOnboardingComplete} /></motion.div>
        ) : (
          <div className="absolute inset-0 flex items-start" style={{ paddingTop: "clamp(100px, 14vh, 160px)" }} key="onboarding-desktop">
            <motion.div className="flex flex-col justify-center pointer-events-auto" style={{ width: "42%", maxWidth: "510px", marginLeft: "calc(4vw + 150px)", marginRight: "10px" }} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
              <MysticalOnboarding onComplete={handleOnboardingComplete} />
            </motion.div>
            <div className="flex-1" />
          </div>
        )
      ) : hasResult ? (
        isDesktopResult ? (
          /* ── Desktop 3-zone result ── */
          <div className="absolute inset-0">
            <motion.div ref={scrollRef} className="absolute overflow-y-auto pointer-events-auto scrollbar-hide" style={{ top: "calc(10vh + 56px)", left: "10px", width: "min(720px, 50vw)", maxHeight: "80vh" }} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 100% 80% at 50% 35%, hsl(222 47% 6% / 0.7), transparent 85%)", filter: "blur(50px)" }} />
              <div className="relative" style={{ padding: "0 16px 60px" }}>
                {aiText ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-prose rounded-2xl"
                    style={{
                      background: "linear-gradient(145deg, rgba(10, 10, 25, 0.82), rgba(8, 8, 20, 0.9))",
                      backdropFilter: "blur(24px)",
                      WebkitBackdropFilter: "blur(24px)",
                      border: "1px solid hsl(var(--gold) / 0.18)",
                      boxShadow: "0 12px 48px rgba(0,0,0,0.5), 0 0 1px hsl(var(--gold) / 0.25), inset 0 1px 0 hsl(var(--gold) / 0.08)",
                      padding: "36px 32px",
                    }}
                  >
                    <div className="flex justify-end mb-6"><TextSizeControl value={textSize} onChange={setTextSize} /></div>
                    <div style={{ lineHeight: 1.9 }}>{renderMysticalText(aiText, textSize)}</div>
                    {aiLoading && (<motion.div className="flex items-center justify-center gap-2 mt-8" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}><Loader2 className="w-5 h-5 text-gold/60 animate-spin" /><span className="font-body text-sm text-gold/50">{t.forecast_loading}</span></motion.div>)}
                  </motion.div>
                ) : aiError ? (
                  <div className="text-center rounded-2xl p-6" style={{ background: "hsl(222 40% 10% / 0.75)", backdropFilter: "blur(20px)", border: "1px solid hsl(var(--crimson) / 0.2)" }}><p className="text-foreground/50 font-body text-sm">{aiError}</p></div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <motion.div className="w-16 h-16 rounded-full mb-6" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }} animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }} transition={{ duration: 3, repeat: Infinity }} />
                    <motion.p className="font-body text-gold/70 text-base" style={{ textShadow: "0 2px 15px hsl(222 47% 6%)" }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>{t.forecast_loading}</motion.p>
                  </div>
                )}
                {!aiLoading && (aiText || aiError) && signInfo && (
                  <ShareResultSection symbol={signInfo.symbol} title={`${t.readings_type_forecast} — ${signInfo.name}`} subtitle={monthName} readingText={aiText || undefined} />
                )}
              </div>
            </motion.div>
            <motion.div className="absolute pointer-events-auto flex flex-col items-center" style={{ top: "calc(8vh + 40px)", right: "36px", width: "min(560px, 38vw)" }} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
              <div className="text-center" style={{ padding: "32px 20px" }}>
                {signInfo && (
                  <>
                    <motion.div className="mb-10" style={{ fontSize: "144px", lineHeight: 1, textShadow: "0 0 35px hsl(222 47% 6%)" }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>{signInfo.symbol}</motion.div>
                    <motion.h2 className="font-heading gold-gradient-text mb-6" style={{ fontSize: "44px", lineHeight: 1.2, textShadow: "0 0 30px hsl(222 47% 6%)" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>{signInfo.name}</motion.h2>
                    <motion.p className="text-muted-foreground font-body mb-2" style={{ fontSize: "22px", lineHeight: 1.6, textShadow: "0 2px 15px hsl(222 47% 6%)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>{signInfo.dateRange} • {t.forecast_element_label} {signInfo.element}</motion.p>
                    <motion.p className="text-gold/60 font-body mt-6" style={{ fontSize: "22px", lineHeight: 1.6, textShadow: "0 2px 15px hsl(222 47% 6%)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>{t.forecast_month_label} {monthName}</motion.p>
                  </>
                )}
                <motion.div className="flex items-center justify-center gap-6 mt-12" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <motion.button onClick={handleShare} className="flex items-center gap-3 rounded-full font-body" style={{ fontSize: "18px", height: "56px", padding: "0 32px", background: "linear-gradient(135deg, hsl(142 70% 35% / 0.2), hsl(142 70% 35% / 0.1))", border: "1px solid hsl(142 70% 45% / 0.3)", color: "hsl(142 70% 60%)", backdropFilter: "blur(8px)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}><Share2 style={{ width: 20, height: 20 }} />{t.forecast_share}</motion.button>
                  <motion.button onClick={handleCopy} className="flex items-center gap-3 rounded-full font-body" style={{ fontSize: "18px", height: "56px", padding: "0 32px", background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))", backdropFilter: "blur(8px)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{copied ? <Check style={{ width: 20, height: 20 }} /> : <Copy style={{ width: 20, height: 20 }} />}{copied ? t.forecast_copied : t.forecast_copy}</motion.button>
                </motion.div>
                <motion.button onClick={handleClose} className="font-body text-muted-foreground hover:text-gold/80 transition-colors duration-300 mt-10 block mx-auto" style={{ fontSize: "17px", height: "44px", padding: "0 28px", cursor: "pointer" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} whileHover={{ scale: 1.05 }}>{t.onboarding_skip || "דלג ←"}</motion.button>
              </div>
            </motion.div>
          </div>
        ) : (
          /* ── Mobile: stacked result ── */
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 md:p-12 lg:p-14">
            <div className="text-center mb-10">
              {signInfo && (
                <>
                  <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>{signInfo.symbol}</motion.div>
                  <motion.h2 className="font-heading text-2xl md:text-4xl gold-gradient-text mb-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>{signInfo.name}</motion.h2>
                  <motion.p className="text-muted-foreground font-body text-sm md:text-base" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>{signInfo.dateRange} • {t.forecast_element_label} {signInfo.element}</motion.p>
                  <motion.div className="section-divider max-w-[120px] mx-auto mt-5" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5 }} />
                  <motion.p className="text-gold/60 font-body text-sm mt-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>{t.forecast_month_label} {monthName}</motion.p>
                </>
              )}
              <motion.div className="flex items-center justify-center gap-3 mt-6" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <motion.button onClick={handleShare} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-body" style={{ background: "linear-gradient(135deg, hsl(142 70% 35% / 0.2), hsl(142 70% 35% / 0.1))", border: "1px solid hsl(142 70% 45% / 0.3)", color: "hsl(142 70% 60%)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}><Share2 className="w-4 h-4" />{t.forecast_share}</motion.button>
                <motion.button onClick={handleCopy} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-body" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? t.forecast_copied : t.forecast_copy}</motion.button>
              </motion.div>
            </div>
            {aiText ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-prose mx-auto rounded-2xl"
                style={{
                  background: "linear-gradient(145deg, rgba(10, 10, 25, 0.82), rgba(8, 8, 20, 0.9))",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid hsl(var(--gold) / 0.18)",
                  boxShadow: "0 12px 48px rgba(0,0,0,0.5), 0 0 1px hsl(var(--gold) / 0.25), inset 0 1px 0 hsl(var(--gold) / 0.08)",
                  padding: "24px 18px",
                }}
              >
                <div className="flex justify-end mb-5"><TextSizeControl value={textSize} onChange={setTextSize} /></div>
                <div style={{ lineHeight: 1.9 }}>{renderMysticalText(aiText, textSize)}</div>
                {aiLoading && (<motion.div className="flex items-center justify-center gap-2 mt-8" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}><Loader2 className="w-5 h-5 text-gold/60 animate-spin" /><span className="font-body text-sm text-gold/50">{t.forecast_loading}</span></motion.div>)}
              </motion.div>
            ) : aiError ? (
              <div className="text-center rounded-2xl p-6" style={{ background: "hsl(222 40% 10% / 0.75)", backdropFilter: "blur(20px)", border: "1px solid hsl(var(--crimson) / 0.2)" }}><p className="text-foreground/50 font-body text-sm">{aiError}</p></div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <motion.div className="w-16 h-16 rounded-full mb-6" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }} animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }} transition={{ duration: 3, repeat: Infinity }} />
                <motion.p className="font-body text-gold/70 text-base" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>{t.forecast_loading}</motion.p>
              </div>
            )}
            {!aiLoading && (aiText || aiError) && signInfo && (
              <>
                <ShareResultSection symbol={signInfo.symbol} title={`${t.readings_type_forecast} — ${signInfo.name}`} subtitle={monthName} readingText={aiText || undefined} />
                <div className="section-divider max-w-[200px] mx-auto my-10" />
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="text-center rounded-2xl p-8" style={{ background: "linear-gradient(145deg, hsl(222 40% 10% / 0.75), hsl(222 47% 6% / 0.85))", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid hsl(var(--gold) / 0.12)", boxShadow: "0 8px 40px hsl(222 47% 3% / 0.5), inset 0 1px 0 hsl(var(--gold) / 0.06)" }}>
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
  );

  return (
    <CinematicModalShell isOpen={isOpen} onClose={handleClose} scrollRef={isMobile ? undefined : scrollRef as React.RefObject<HTMLDivElement>} fullscreen hideAdvisor>
      {isMobile ? (
        /* ── Mobile: flex column — non-scrolling avatar + scrollable body ── */
        <div className="flex flex-col h-full">
          {mobileAvatarHeader}
          <div
            ref={scrollRef as React.RefObject<HTMLDivElement>}
            className="flex-1 overflow-y-auto min-h-0"
          >
            {sharedContent}
          </div>
          <AdvisorChatPanel isOpen={advisorOpen} onClose={() => setAdvisorOpen(false)} forceRightAnchor />
        </div>
      ) : (
        <>
          {sharedContent}
          <AvatarHoverTeaser
            disabled={false}
            anchor="left"
            className="fixed flex items-center justify-center pointer-events-auto"
            style={{ bottom: 10, right: 10, zIndex: 200 }}
          >
            <AstrologerAvatarButton
              size={132}
              onClick={() => setAdvisorOpen(true)}
              entranceDelay={0.6}
              className="relative"
              style={{ filter: "drop-shadow(0 0 18px hsl(270 60% 45% / 0.35)) drop-shadow(0 4px 12px hsl(222 47% 6% / 0.5))" }}
            />
          </AvatarHoverTeaser>
          <AdvisorChatPanel isOpen={advisorOpen} onClose={() => setAdvisorOpen(false)} forceRightAnchor />
        </>
      )}
    </CinematicModalShell>
  );
};

export default MonthlyForecastModal;
