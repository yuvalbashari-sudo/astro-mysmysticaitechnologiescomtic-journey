import { useState, useEffect, useRef } from "react";
import TextSizeControl, { type TextSize } from "@/components/TextSizeControl";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Hand, Crown, Share2, Copy, Check, Loader2, Camera, Upload, ImageIcon } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { readingsStorage } from "@/lib/readingsStorage";
import { streamMysticalReading, renderMysticalText } from "@/lib/aiStreaming";
import { mysticalProfile } from "@/lib/mysticalProfile";
import ShareResultSection from "@/components/ShareResultSection";
import MysticalOnboarding from "@/components/MysticalOnboarding";
import { useT, useLanguage } from "@/i18n/LanguageContext";

interface Props { isOpen: boolean; onClose: () => void; }

const PalmReadingModal = ({ isOpen, onClose }: Props) => {
  const t = useT();
  const { language } = useLanguage();
  const [name, setName] = useState("");
  const [rightPalmImage, setRightPalmImage] = useState<string | null>(null);
  const [leftPalmImage, setLeftPalmImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiTextRef = useRef("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [textSize, setTextSize] = useState<TextSize>("default");
  const rightFileRef = useRef<HTMLInputElement>(null);
  const leftFileRef = useRef<HTMLInputElement>(null);
  const rightCameraRef = useRef<HTMLInputElement>(null);
  const leftCameraRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (side: "right" | "left") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast(t.palm_upload_error); return; }
    if (file.size > 10 * 1024 * 1024) { toast(t.palm_size_error); return; }
    const reader = new FileReader();
    reader.onload = () => { if (side === "right") setRightPalmImage(reader.result as string); else setLeftPalmImage(reader.result as string); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (!rightPalmImage || !leftPalmImage) { toast(t.palm_both_required); return; }
    setIsLoading(true);
  };

  const handleOnboardingComplete = () => {
    setSubmitted(true); setIsLoading(false); setAiLoading(true); aiTextRef.current = "";
    streamMysticalReading("palm", { name: name.trim(), rightPalmImage, leftPalmImage },
      (delta) => { aiTextRef.current += delta; setAiText(aiTextRef.current); },
      () => { setAiLoading(false); mysticalProfile.recordPalmReading(); readingsStorage.save({ type: "palm", title: `${t.readings_type_palm} — ${name}`, subtitle: t.palm_result_subtitle, symbol: "✋", data: { name, aiReading: aiTextRef.current } }); },
      (err) => { setAiLoading(false); setAiError(err); toast(err); },
      language,
    );
  };

  const handleClose = () => { onClose(); setTimeout(() => { setSubmitted(false); setName(""); setRightPalmImage(null); setLeftPalmImage(null); setIsLoading(false); setAiText(""); setAiLoading(false); setAiError(null); aiTextRef.current = ""; }, 300); };

  useEffect(() => { if (aiLoading && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [aiText, aiLoading]);

  const handleShare = () => { const text = `✋ ${t.readings_type_palm}\n\n🔮 ${window.location.origin}`; window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank"); };
  const handleCopy = async () => { if (!aiText) return; await navigator.clipboard.writeText(`✋ ${t.readings_type_palm} — ${name}\n\n${aiText.slice(0, 300)}...`); setCopied(true); toast(t.share_copy_toast); setTimeout(() => setCopied(false), 2000); };

  const renderHandUpload = (side: "right" | "left", image: string | null, setImage: (v: string | null) => void, fileRef: React.RefObject<HTMLInputElement>, cameraRef: React.RefObject<HTMLInputElement>) => {
    const label = side === "right" ? t.palm_right_label : t.palm_left_label;
    const emoji = side === "right" ? "🤚" : "✋";
    return (
      <div className="flex-1 min-w-0">
        <label className="block text-sm text-gold/70 font-body mb-2 text-right">{emoji} {label}</label>
        {image ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative rounded-xl overflow-hidden" style={{ border: "2px solid hsl(var(--gold) / 0.3)", boxShadow: "0 0 20px hsl(var(--gold) / 0.08)" }}>
            <img src={image} alt={label} className="w-full h-40 object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, hsl(222 40% 8% / 0.4), transparent)" }} />
            <button onClick={() => setImage(null)} className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center bg-background/70 hover:bg-background/90 transition-colors" style={{ border: "1px solid hsl(var(--gold) / 0.2)" }}><X className="w-3 h-3 text-gold/70" /></button>
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-body" style={{ background: "hsl(142 70% 35% / 0.3)", border: "1px solid hsl(142 70% 45% / 0.4)", color: "hsl(142 70% 70%)" }}><Check className="w-2.5 h-2.5 inline mr-0.5" />{t.palm_uploaded}</div>
          </motion.div>
        ) : (
          <motion.div className="rounded-xl p-5 cursor-pointer group transition-all duration-300" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.04), hsl(var(--gold) / 0.02))", border: "2px dashed hsl(var(--gold) / 0.2)" }} whileHover={{ scale: 1.01 }} onClick={() => fileRef.current?.click()}>
            <div className="flex flex-col items-center gap-2">
              <motion.div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.12), transparent)", border: "1px solid hsl(var(--gold) / 0.15)" }} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}><ImageIcon className="w-5 h-5 text-gold/60 group-hover:text-gold/80 transition-colors" /></motion.div>
              <p className="text-foreground/50 font-body text-[11px]">{t.palm_upload_click}</p>
            </div>
          </motion.div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload(side)} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload(side)} />
        {!image && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <motion.button onClick={() => cameraRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-body" style={{ background: "hsl(var(--gold) / 0.08)", border: "1px solid hsl(var(--gold) / 0.15)", color: "hsl(var(--gold))" }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}><Camera className="w-3 h-3" />{t.palm_capture}</motion.button>
            <motion.button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-body" style={{ background: "hsl(var(--foreground) / 0.04)", border: "1px solid hsl(var(--foreground) / 0.1)", color: "hsl(var(--foreground) / 0.6)" }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}><Upload className="w-3 h-3" />{t.palm_gallery}</motion.button>
          </div>
        )}
      </div>
    );
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
              {!submitted && !isLoading ? (
                <motion.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-8 md:p-12 text-center">
                  <motion.div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }}><Hand className="w-7 h-7 text-gold" /></motion.div>
                  <h2 className="font-heading text-2xl md:text-3xl gold-gradient-text mb-3">{t.palm_title}</h2>
                  <p className="text-foreground/70 font-body text-sm md:text-base mb-4 max-w-md mx-auto leading-relaxed">{t.palm_desc}</p>
                  <div className="max-w-xs mx-auto mb-6">
                    <label className="block text-sm text-gold/70 font-body mb-2 text-right">{t.palm_name_label}</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.palm_name_placeholder} className="mystical-input font-body text-center" dir="rtl" />
                  </div>
                  <div className="max-w-lg mx-auto mb-6 flex flex-col md:flex-row gap-4" dir="rtl">
                    {renderHandUpload("right", rightPalmImage, setRightPalmImage, rightFileRef, rightCameraRef)}
                    {renderHandUpload("left", leftPalmImage, setLeftPalmImage, leftFileRef, leftCameraRef)}
                  </div>
                  <div className="max-w-lg mx-auto mb-8 rounded-xl p-4 text-right" style={{ background: "hsl(var(--gold) / 0.04)", border: "1px solid hsl(var(--gold) / 0.1)" }}>
                    <p className="text-gold/60 font-body text-[11px] font-semibold mb-2">{t.palm_tips_title}</p>
                    <ul className="text-foreground/50 font-body text-[11px] space-y-1 leading-relaxed">
                      <li>• {t.palm_tip1}</li><li>• {t.palm_tip2}</li><li>• {t.palm_tip3}</li><li>• {t.palm_tip4}</li>
                    </ul>
                  </div>
                  <motion.button onClick={handleSubmit} disabled={!name.trim() || !rightPalmImage || !leftPalmImage} className="btn-gold font-body flex items-center justify-center gap-2 mx-auto disabled:opacity-40 disabled:cursor-not-allowed" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}><Hand className="w-4 h-4" />{t.palm_cta}</motion.button>
                  <p className="text-[11px] text-muted-foreground font-body mt-6">{t.palm_note}</p>
                </motion.div>
              ) : isLoading ? (
                <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><MysticalOnboarding onComplete={handleOnboardingComplete} /></motion.div>
              ) : submitted ? (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 md:p-12 lg:p-14">
                  <div className="text-center mb-10">
                    <motion.div className="text-6xl mb-4 flex items-center justify-center gap-2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}><span>🤚</span><span className="text-gold text-2xl">✦</span><span>✋</span></motion.div>
                    <motion.h2 className="font-heading text-2xl md:text-4xl gold-gradient-text mb-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>{t.palm_title} — {name}</motion.h2>
                    <motion.p className="text-foreground/50 font-body text-sm md:text-base mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>{t.palm_result_subtitle}</motion.p>
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
                      {aiLoading && (<motion.div className="flex items-center justify-center gap-2 mt-8" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}><Loader2 className="w-5 h-5 text-gold/60 animate-spin" /><span className="font-body text-sm text-gold/50">{t.palm_loading}</span></motion.div>)}
                    </motion.div>
                  ) : aiError ? (
                    <div className="text-center rounded-xl p-6" style={{ background: "hsl(var(--crimson) / 0.08)", border: "1px solid hsl(var(--crimson) / 0.15)" }}><p className="text-foreground/50 font-body text-sm">{aiError}</p></div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <motion.div className="w-16 h-16 rounded-full mb-6" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }} animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }} transition={{ duration: 3, repeat: Infinity }} />
                      <motion.p className="font-body text-gold/70 text-base" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>{t.palm_loading}</motion.p>
                    </div>
                  )}
                  {!aiLoading && (aiText || aiError) && (
                    <>
                      <ShareResultSection symbol="✋" title={`${t.palm_title} — ${name}`} />
                      <div className="section-divider max-w-[200px] mx-auto my-10" />
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center rounded-xl p-8" style={{ background: "linear-gradient(135deg, hsl(var(--crimson) / 0.08), hsl(var(--gold) / 0.05))", border: "1px solid hsl(var(--gold) / 0.12)" }}>
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

export default PalmReadingModal;