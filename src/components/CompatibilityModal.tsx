import { useState, useEffect, useRef } from "react";
import TextSizeControl, { type TextSize } from "@/components/TextSizeControl";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Heart, Crown, Share2, Copy, Check, Loader2 } from "lucide-react";
import { getSignFromDate, getSignHebrew, getSignSymbol, getCompatibility, getSignElement, getSignModality, getSignRuler, getRisingSign } from "@/data/compatibilityData";
import { Clock } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { readingsStorage } from "@/lib/readingsStorage";
import { streamMysticalReading, renderMysticalText } from "@/lib/aiStreaming";
import { mysticalProfile } from "@/lib/mysticalProfile";
import ShareResultSection from "@/components/ShareResultSection";
import MysticalOnboarding from "@/components/MysticalOnboarding";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { useReadingContext } from "@/contexts/ReadingContext";

interface Props { isOpen: boolean; onClose: () => void; }

const CompatibilityModal = ({ isOpen, onClose }: Props) => {
  const t = useT();
  const { language } = useLanguage();
  const { setActiveReading } = useReadingContext();
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [relation1, setRelation1] = useState("me");
  const [relation2, setRelation2] = useState("partner");
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [time1, setTime1] = useState("");
  const [time2, setTime2] = useState("");
  const [gender1, setGender1] = useState("");
  const [gender2, setGender2] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [matchInfo, setMatchInfo] = useState<{ sign1: string; sign2: string; sign1Name: string; sign2Name: string; sign1Symbol: string; sign2Symbol: string; score: number } | null>(null);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiTextRef = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [textSize, setTextSize] = useState<TextSize>("default");

  const handleSubmit = () => {
    if (!date1 || !date2) return;
    setIsLoading(true);
  };

  const handleOnboardingComplete = () => {
    const s1 = getSignFromDate(new Date(date1));
    const s2 = getSignFromDate(new Date(date2));
    const rising1 = getRisingSign(s1, time1);
    const rising2 = getRisingSign(s2, time2);
    const compat = getCompatibility(s1, s2);
    const info = { sign1: s1, sign2: s2, sign1Name: getSignHebrew(s1), sign2Name: getSignHebrew(s2), sign1Symbol: getSignSymbol(s1), sign2Symbol: getSignSymbol(s2), score: compat.score };
    setMatchInfo(info);
    setIsLoading(false);
    setAiLoading(true);
    aiTextRef.current = "";

    // Record in mystical profile
    mysticalProfile.recordZodiac(info.sign1Name, info.sign1Symbol, getSignElement(s1), date1);
    mysticalProfile.recordCompatibility(info.sign2Name, info.sign2Symbol, info.score);

    streamMysticalReading(
      "compatibility",
      {
        sign1Name: info.sign1Name, sign1Symbol: info.sign1Symbol,
        sign1Element: getSignElement(s1), sign1Modality: getSignModality(s1), sign1Ruler: getSignRuler(s1),
        sign1BirthTime: time1 || null,
        sign1Rising: rising1 ? getSignHebrew(rising1) : null,
        sign1RisingSymbol: rising1 ? getSignSymbol(rising1) : null,
        sign1RisingElement: rising1 ? getSignElement(rising1) : null,
        sign1Gender: gender1 || null,
        sign1PersonName: name1 || null,
        sign1Relation: relation1 || null,
        sign2Name: info.sign2Name, sign2Symbol: info.sign2Symbol,
        sign2Element: getSignElement(s2), sign2Modality: getSignModality(s2), sign2Ruler: getSignRuler(s2),
        sign2BirthTime: time2 || null,
        sign2Rising: rising2 ? getSignHebrew(rising2) : null,
        sign2RisingSymbol: rising2 ? getSignSymbol(rising2) : null,
        sign2RisingElement: rising2 ? getSignElement(rising2) : null,
        sign2Gender: gender2 || null,
        sign2PersonName: name2 || null,
        sign2Relation: relation2 || null,
        score: info.score,
      },
      (delta) => { aiTextRef.current += delta; setAiText(aiTextRef.current); },
      () => {
        setAiLoading(false);
        setActiveReading({ type: "compatibility", label: `${t.readings_type_compatibility} — ${info.sign1Name} + ${info.sign2Name}`, summary: aiTextRef.current });
        readingsStorage.save({
          type: "compatibility",
          title: `${t.readings_type_compatibility} — ${info.sign1Name} + ${info.sign2Name}`,
          subtitle: `${t.compat_score_label}: ${info.score}%`,
          symbol: `${info.sign1Symbol}💕${info.sign2Symbol}`,
          data: { ...info, date1, date2, aiReading: aiTextRef.current },
        });
      },
      (err) => { setAiLoading(false); setAiError(err); toast(err); },
      language,
    );
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setMatchInfo(null); setDate1(""); setDate2(""); setTime1(""); setTime2(""); setGender1(""); setGender2(""); setName1(""); setName2(""); setRelation1("me"); setRelation2("partner"); setIsLoading(false);
      setAiText(""); setAiLoading(false); setAiError(null); aiTextRef.current = "";
    }, 300);
  };

  useEffect(() => {
    if (aiLoading && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [aiText, aiLoading]);

  const handleShare = () => {
    if (!matchInfo) return;
    const text = `💕 ${t.readings_type_compatibility}: ${matchInfo.sign1Name} ${matchInfo.sign1Symbol} + ${matchInfo.sign2Name} ${matchInfo.sign2Symbol}\n${matchInfo.score}%\n\n🔮 ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopy = async () => {
    if (!matchInfo) return;
    await navigator.clipboard.writeText(`💕 ${matchInfo.sign1Name} + ${matchInfo.sign2Name} — ${matchInfo.score}%`);
    setCopied(true); toast(t.share_copy_toast); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={handleClose} />
          <motion.div ref={scrollRef} className="relative z-10 w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl mx-2 sm:mx-auto" style={{ background: "linear-gradient(145deg, hsl(222 40% 8% / 0.97), hsl(222 47% 6% / 0.98))", border: "1px solid hsl(var(--gold) / 0.2)", boxShadow: "0 0 60px hsl(var(--gold) / 0.1)" }} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}>
            <button onClick={handleClose} className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors" style={{ border: "1px solid hsl(var(--gold) / 0.15)" }}><X className="w-4 h-4 text-gold/70" /></button>
            <div className="absolute top-4 right-4 z-20"><span className="px-3 py-1 rounded-full text-[10px] font-bold font-body tracking-wider" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--gold) / 0.1))", border: "1px solid hsl(var(--gold) / 0.3)", color: "hsl(var(--gold))" }}>{t.common_free}</span></div>

            <AnimatePresence mode="wait">
              {!matchInfo && !isLoading ? (
                <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-8 md:p-12 text-center">
                  <motion.div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--crimson) / 0.15), transparent)", border: "1px solid hsl(var(--crimson) / 0.2)" }}>
                    <Heart className="w-7 h-7 text-crimson-light" />
                  </motion.div>
                  <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-3">{t.compat_title}</h2>
                  <p className="text-foreground/70 font-body text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">{t.compat_desc}</p>
                  <div className="max-w-sm mx-auto mb-6">
                    <label className="block text-sm text-gold/70 font-body mb-2 text-right">{t.compat_date1_label}</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} className="mystical-input font-body text-center flex-1" style={{ direction: "ltr" }} />
                      <div className="relative">
                        <input type="time" value={time1} onChange={(e) => setTime1(e.target.value)} className="mystical-input font-body text-center sm:w-[110px]" style={{ direction: "ltr" }} />
                        <Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gold/40 pointer-events-none" />
                      </div>
                    </div>
                    {!time1 && <p className="text-[10px] text-foreground/40 font-body mt-1 text-right">{t.compat_time_optional}</p>}
                    <div className="mt-2">
                      <select value={gender1} onChange={(e) => setGender1(e.target.value)} className="mystical-input font-body text-center w-full text-sm" style={{ direction: language === "en" ? "ltr" : "rtl" }}>
                        <option value="">{t.compat_gender_label} ({t.compat_gender_optional})</option>
                        <option value="woman">{t.compat_gender_woman}</option>
                        <option value="man">{t.compat_gender_man}</option>
                        <option value="nonbinary">{t.compat_gender_nonbinary}</option>
                        <option value="other">{t.compat_gender_other}</option>
                        <option value="prefer_not">{t.compat_gender_prefer_not}</option>
                      </select>
                    </div>
                  </div>
                    <label className="block text-sm text-gold/70 font-body mb-2 text-right">{t.compat_date2_label}</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input type="date" value={date2} onChange={(e) => setDate2(e.target.value)} className="mystical-input font-body text-center flex-1" style={{ direction: "ltr" }} />
                      <div className="relative">
                        <input type="time" value={time2} onChange={(e) => setTime2(e.target.value)} className="mystical-input font-body text-center sm:w-[110px]" style={{ direction: "ltr" }} />
                        <Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gold/40 pointer-events-none" />
                      </div>
                    </div>
                    {!time2 && <p className="text-[10px] text-foreground/40 font-body mt-1 text-right">{t.compat_time_optional}</p>}
                    <div className="mt-2">
                      <select value={gender2} onChange={(e) => setGender2(e.target.value)} className="mystical-input font-body text-center w-full text-sm" style={{ direction: language === "en" ? "ltr" : "rtl" }}>
                        <option value="">{t.compat_gender_label} ({t.compat_gender_optional})</option>
                        <option value="woman">{t.compat_gender_woman}</option>
                        <option value="man">{t.compat_gender_man}</option>
                        <option value="nonbinary">{t.compat_gender_nonbinary}</option>
                        <option value="other">{t.compat_gender_other}</option>
                        <option value="prefer_not">{t.compat_gender_prefer_not}</option>
                      </select>
                    </div>
                  <motion.button onClick={handleSubmit} disabled={!date1 || !date2} className="btn-gold font-body flex items-center justify-center gap-2 mx-auto disabled:opacity-40 disabled:cursor-not-allowed" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}><Sparkles className="w-4 h-4" />{t.compat_cta}</motion.button>
                </motion.div>
              ) : isLoading ? (
                <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <MysticalOnboarding onComplete={handleOnboardingComplete} />
                </motion.div>
              ) : matchInfo ? (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-12 lg:p-14">
                  <div className="text-center mb-10">
                    <motion.div className="text-5xl mb-4 flex items-center justify-center gap-3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                      <span>{matchInfo.sign1Symbol}</span><span className="text-gold">💕</span><span>{matchInfo.sign2Symbol}</span>
                    </motion.div>
                    <motion.h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>{matchInfo.sign1Name} + {matchInfo.sign2Name}</motion.h2>
                    <motion.div className="mt-5 mb-3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }}>
                      <span className="text-5xl md:text-6xl font-heading gold-gradient-text">{matchInfo.score}%</span>
                      <p className="text-gold/60 font-body text-sm mt-2">{t.compat_score_label}</p>
                    </motion.div>
                    <motion.div className="section-divider max-w-[120px] mx-auto mt-5" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.6 }} />
                    <motion.div className="flex items-center justify-center gap-3 mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                      <motion.button onClick={handleShare} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-body" style={{ background: "linear-gradient(135deg, hsl(142 70% 35% / 0.2), hsl(142 70% 35% / 0.1))", border: "1px solid hsl(142 70% 45% / 0.3)", color: "hsl(142 70% 60%)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}><Share2 className="w-4 h-4" />{t.compat_share}</motion.button>
                      <motion.button onClick={handleCopy} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-body" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? t.share_copied : t.share_copy}</motion.button>
                    </motion.div>
                  </div>

                  {aiText ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-prose mx-auto">
                      <div className="flex justify-end mb-6"><TextSizeControl value={textSize} onChange={setTextSize} /></div>
                      {renderMysticalText(aiText, textSize)}
                      {aiLoading && (
                        <motion.div className="flex items-center justify-center gap-2 mt-8" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
                          <Loader2 className="w-5 h-5 text-gold/60 animate-spin" />
                          <span className="font-body text-sm text-gold/50">{t.compat_loading}</span>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : aiError ? (
                    <div className="text-center rounded-xl p-6" style={{ background: "hsl(var(--crimson) / 0.08)", border: "1px solid hsl(var(--crimson) / 0.15)" }}>
                      <p className="text-foreground/50 font-body text-sm">{aiError}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <motion.div className="w-16 h-16 rounded-full mb-6" style={{ background: "radial-gradient(circle, hsl(var(--crimson) / 0.15), transparent)", border: "1px solid hsl(var(--crimson) / 0.2)" }} animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }} transition={{ duration: 3, repeat: Infinity }} />
                      <motion.p className="font-body text-gold/70 text-base" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>{t.compat_loading}</motion.p>
                    </div>
                  )}

                  {!aiLoading && (aiText || aiError) && (
                    <>
                      <ShareResultSection symbol={`${matchInfo.sign1Symbol}💕${matchInfo.sign2Symbol}`} title={`${matchInfo.sign1Name} + ${matchInfo.sign2Name}`} subtitle={`${matchInfo.score}%`} />
                      <div className="section-divider max-w-[200px] mx-auto my-10" />
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center rounded-xl p-8" style={{ background: "linear-gradient(135deg, hsl(var(--crimson) / 0.08), hsl(var(--gold) / 0.05))", border: "1px solid hsl(var(--gold) / 0.12)" }}>
                        <Crown className="w-7 h-7 text-gold mx-auto mb-4" />
                        <h4 className="font-heading text-lg md:text-xl text-gold mb-3">{t.compat_premium_title}</h4>
                        <p className="text-foreground/60 font-body text-sm md:text-base mb-5 max-w-sm mx-auto leading-relaxed">{t.compat_premium_desc}</p>
                        <a href="#premium" onClick={handleClose} className="btn-gold font-body text-sm inline-flex items-center gap-2"><Sparkles className="w-4 h-4" />{t.compat_premium_cta}</a>
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

export default CompatibilityModal;
