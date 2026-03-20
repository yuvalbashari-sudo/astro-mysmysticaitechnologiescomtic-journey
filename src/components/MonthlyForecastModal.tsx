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
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [signInfo, setSignInfo] = useState<{ name: string; symbol: string; dateRange: string; element: string } | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiTextRef = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [textSize, setTextSize] = useState<TextSize>("default");

  const monthLocale = language === "he" ? "he-IL" : language === "ar" ? "ar-SA" : language === "ru" ? "ru-RU" : "en-US";
  const monthName = new Date().toLocaleDateString(monthLocale, { month: "long" });

  const handleSubmit = () => {
    if (!birthDate) return;
    setIsLoading(true);
  };

  const handleOnboardingComplete = () => {
    const date = new Date(birthDate);
    const sign = getZodiacSign(date);
    setSignInfo({ name: sign.hebrewName, symbol: sign.symbol, dateRange: sign.dateRange, element: sign.element });
    setIsLoading(false);
    setAiLoading(true);
    aiTextRef.current = "";

    // Record zodiac in mystical profile
    mysticalProfile.recordZodiac(sign.hebrewName, sign.symbol, sign.element, birthDate);

    streamMysticalReading(
      "forecast",
      { signName: sign.hebrewName, signSymbol: sign.symbol, birthDate, element: sign.element, dateRange: sign.dateRange, monthName },
      (delta) => { aiTextRef.current += delta; setAiText(aiTextRef.current); },
      () => {
        setAiLoading(false);
        setActiveReading({ type: "forecast", label: `${t.readings_type_forecast} — ${sign.hebrewName}`, summary: aiTextRef.current });
        readingsStorage.save({
          type: "forecast",
          title: `${t.readings_type_forecast} — ${sign.hebrewName}`,
          subtitle: sign.dateRange,
          symbol: sign.symbol,
          data: { signName: sign.hebrewName, birthDate, aiReading: aiTextRef.current },
        });
      },
      (err) => { setAiLoading(false); setAiError(err); toast(err); },
      language,
    );
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSignInfo(null); setBirthDate(""); setIsLoading(false);
      setAiText(""); setAiLoading(false); setAiError(null); aiTextRef.current = "";
    }, 300);
  };

  useEffect(() => {
    if (aiLoading && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [aiText, aiLoading]);

  const handleShare = () => {
    if (!signInfo) return;
    const text = `✨ ${t.readings_type_forecast} — ${signInfo.name} ${signInfo.symbol}\n${monthName}\n\n🔮 ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopy = async () => {
    if (!aiText) return;
    await navigator.clipboard.writeText(`✨ ${signInfo?.name} — ${t.readings_type_forecast}\n\n${aiText.slice(0, 300)}...`);
    setCopied(true); toast(t.share_copy_toast); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CinematicModalShell isOpen={isOpen} onClose={handleClose} scrollRef={scrollRef as React.RefObject<HTMLDivElement>}>
            <AnimatePresence mode="wait">
              {!signInfo && !isLoading ? (
                <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-8 md:p-12 text-center">
                  <motion.div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }} animate={{ boxShadow: ["0 0 20px hsl(43 80% 55% / 0.1)", "0 0 40px hsl(43 80% 55% / 0.2)", "0 0 20px hsl(43 80% 55% / 0.1)"] }} transition={{ duration: 3, repeat: Infinity }}>
                    <Calendar className="w-7 h-7 text-gold" />
                  </motion.div>
                  <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-3">{t.forecast_title}</h2>
                  <p className="text-foreground/70 font-body text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">{t.forecast_desc}</p>
                  <div className="max-w-xs mx-auto mb-8">
                    <label className="block text-sm text-gold/70 font-body mb-2 text-right">{t.forecast_birthdate_label}</label>
                    <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mystical-input font-body text-center" style={{ direction: "ltr" }} />
                  </div>
                  <motion.button onClick={handleSubmit} disabled={!birthDate} className="btn-gold font-body flex items-center justify-center gap-2 mx-auto disabled:opacity-40 disabled:cursor-not-allowed" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}><Sparkles className="w-4 h-4" />{t.forecast_cta}</motion.button>
                  <p className="text-[11px] text-muted-foreground font-body mt-6">{t.forecast_note}</p>
                </motion.div>
              ) : isLoading ? (
                <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <MysticalOnboarding onComplete={handleOnboardingComplete} />
                </motion.div>
              ) : signInfo ? (
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
                    <div className="text-center rounded-xl p-6" style={{ background: "hsl(var(--crimson) / 0.08)", border: "1px solid hsl(var(--crimson) / 0.15)" }}>
                      <p className="text-foreground/50 font-body text-sm">{aiError}</p>
                    </div>
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
              ) : null}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MonthlyForecastModal;