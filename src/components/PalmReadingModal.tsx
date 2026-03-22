import { useState, useEffect, useRef } from "react";
import CinematicModalShell from "@/components/CinematicModalShell";
import astrologerAvatar from "@/assets/astrologer-avatar-cta.png";
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
import { useReadingContext } from "@/contexts/ReadingContext";

interface Props { isOpen: boolean; onClose: () => void; }

const PalmReadingModal = ({ isOpen, onClose }: Props) => {
  const t = useT();
  const { language } = useLanguage();
  const { setActiveReading } = useReadingContext();
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
      () => { setAiLoading(false); setActiveReading({ type: "palm", label: `${t.readings_type_palm} — ${name}`, summary: aiTextRef.current }); mysticalProfile.recordPalmReading(); readingsStorage.save({ type: "palm", title: `${t.readings_type_palm} — ${name}`, subtitle: t.palm_result_subtitle, symbol: "✋", data: { name, aiReading: aiTextRef.current } }); },
      (err) => { setAiLoading(false); setAiError(err); toast(err); },
      language,
    );
  };

  const handleClose = () => { onClose(); setTimeout(() => { setSubmitted(false); setName(""); setRightPalmImage(null); setLeftPalmImage(null); setIsLoading(false); setAiText(""); setAiLoading(false); setAiError(null); aiTextRef.current = ""; }, 300); };

  useEffect(() => { if (aiLoading && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [aiText, aiLoading]);

  const handleShare = () => { const text = `✋ ${t.readings_type_palm}\n\n🔮 ${window.location.origin}`; window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank"); };
  const handleCopy = async () => { if (!aiText) return; await navigator.clipboard.writeText(`✋ ${t.readings_type_palm} — ${name}\n\n${aiText}`); setCopied(true); toast(t.share_copy_toast); setTimeout(() => setCopied(false), 2000); };

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

  const isDesktopResult = !isMobile && submitted;
  const isDesktopInput = !isMobile && !submitted && !isLoading;

  return (
    <CinematicModalShell isOpen={isOpen} onClose={handleClose} scrollRef={scrollRef as React.RefObject<HTMLDivElement>} fullscreen={isDesktopResult || isDesktopInput} hideAdvisor={isDesktopInput}>
            <AnimatePresence mode="wait">
              {!submitted && !isLoading ? (
                isDesktopInput ? (
                  /* ── Desktop: form on RIGHT side ── */
                  <div className="absolute inset-0" key="input-desktop">
                    {/* Top-right avatar */}
                    <motion.div
                      className="absolute pointer-events-auto z-10"
                      style={{ bottom: 32, right: "4vw", width: 168, height: 168 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                    >
                      <div
                        className="w-full h-full rounded-full overflow-hidden"
                        style={{
                          boxShadow: "0 4px 24px hsl(270 60% 45% / 0.3), 0 0 30px hsl(200 70% 50% / 0.12), 0 0 8px hsl(var(--gold) / 0.2)",
                          border: "2px solid hsl(var(--gold) / 0.35)",
                        }}
                      >
                        <img src={astrologerAvatar} alt="" className="w-full h-full object-cover scale-105" style={{ objectPosition: "center 42%" }} draggable={false} />
                      </div>
                    </motion.div>

                    {/* Form panel — LEFT side */}
                    <motion.div
                      className="absolute pointer-events-auto overflow-y-auto scrollbar-hide"
                      style={{ top: "calc(10vh + 50px)", left: "3vw", width: "min(570px, 39vw)", maxHeight: "80vh" }}
                      initial={{ opacity: 0, x: -40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="text-center">
                        <motion.div className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }}><Hand className="w-6 h-6 text-gold" /></motion.div>
                        <h2 className="font-heading text-2xl gold-gradient-text mb-2" style={{ textShadow: "0 0 30px hsl(222 47% 6%)" }}>{t.palm_title}</h2>
                        <p className="text-foreground/70 font-body text-sm mb-4 leading-relaxed" style={{ textShadow: "0 2px 15px hsl(222 47% 6%)" }}>{t.palm_desc}</p>
                        <div className="mb-4">
                          <label className="block text-sm text-gold/70 font-body mb-2 text-right">{t.palm_name_label}</label>
                          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.palm_name_placeholder} className="mystical-input font-body text-center" dir="rtl" />
                        </div>
                        <div className="mb-4 flex flex-col gap-4" dir="rtl">
                          {renderHandUpload("right", rightPalmImage, setRightPalmImage, rightFileRef, rightCameraRef)}
                          {renderHandUpload("left", leftPalmImage, setLeftPalmImage, leftFileRef, leftCameraRef)}
                        </div>
                        <div className="mb-5 rounded-xl p-3 text-right" style={{ background: "hsl(var(--gold) / 0.04)", border: "1px solid hsl(var(--gold) / 0.1)", backdropFilter: "blur(8px)" }}>
                          <p className="text-gold/60 font-body text-[11px] font-semibold mb-1">{t.palm_tips_title}</p>
                          <ul className="text-foreground/50 font-body text-[10px] space-y-0.5 leading-relaxed">
                            <li>• {t.palm_tip1}</li><li>• {t.palm_tip2}</li><li>• {t.palm_tip3}</li><li>• {t.palm_tip4}</li>
                          </ul>
                        </div>
                        <motion.button onClick={handleSubmit} disabled={!name.trim() || !rightPalmImage || !leftPalmImage} className="btn-gold font-body flex items-center justify-center gap-2 mx-auto disabled:opacity-40 disabled:cursor-not-allowed" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}><Hand className="w-4 h-4" />{t.palm_cta}</motion.button>
                        <p className="text-[11px] text-muted-foreground font-body mt-4" style={{ textShadow: "0 2px 10px hsl(222 47% 6%)" }}>{t.palm_note}</p>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  /* ── Mobile: centered form ── */
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
                )
              ) : isLoading ? (
                <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><MysticalOnboarding onComplete={handleOnboardingComplete} /></motion.div>
              ) : submitted ? (
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
                            {aiLoading && (<motion.div className="flex items-center justify-center gap-2 mt-8" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}><Loader2 className="w-5 h-5 text-gold/60 animate-spin" /><span className="font-body text-sm text-gold/50">{t.palm_loading}</span></motion.div>)}
                          </motion.div>
                        ) : aiError ? (
                          <div className="text-center rounded-xl p-6" style={{ background: "hsl(var(--crimson) / 0.08)", border: "1px solid hsl(var(--crimson) / 0.15)" }}><p className="text-foreground/50 font-body text-sm">{aiError}</p></div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16">
                            <motion.div className="w-16 h-16 rounded-full mb-6" style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.15), transparent)", border: "1px solid hsl(var(--gold) / 0.2)" }} animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }} transition={{ duration: 3, repeat: Infinity }} />
                            <motion.p className="font-body text-gold/70 text-base" style={{ textShadow: "0 2px 15px hsl(222 47% 6%)" }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>{t.palm_loading}</motion.p>
                          </div>
                        )}
                        {!aiLoading && (aiText || aiError) && (
                          <ShareResultSection symbol="✋" title={`${t.palm_title} — ${name}`} />
                        )}
                      </div>
                    </motion.div>

                    {/* RIGHT: Palm images */}
                    <motion.div
                      className="absolute pointer-events-auto flex flex-col items-center gap-4"
                      style={{ top: "calc(10vh + 50px)", right: "3vw", width: "min(300px, 22vw)" }}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="text-center mb-2">
                        <motion.div className="text-5xl mb-3 flex items-center justify-center gap-2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                          <span style={{ textShadow: "0 0 15px hsl(222 47% 6%)" }}>🤚</span>
                          <span className="text-gold text-xl" style={{ textShadow: "0 0 10px hsl(var(--gold) / 0.2)" }}>✦</span>
                          <span style={{ textShadow: "0 0 15px hsl(222 47% 6%)" }}>✋</span>
                        </motion.div>
                        <motion.h3 className="font-heading text-lg gold-gradient-text" style={{ textShadow: "0 0 20px hsl(222 47% 6%)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                          {t.palm_title} — {name}
                        </motion.h3>
                      </div>
                      {/* Palm thumbnails */}
                      <div className="flex gap-3 w-full">
                        {rightPalmImage && (
                          <motion.div className="flex-1 rounded-xl overflow-hidden" style={{ border: "1px solid hsl(var(--gold) / 0.2)", boxShadow: "0 0 30px hsl(var(--gold) / 0.08)" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <img src={rightPalmImage} alt={t.palm_right_label} className="w-full h-32 object-cover" />
                          </motion.div>
                        )}
                        {leftPalmImage && (
                          <motion.div className="flex-1 rounded-xl overflow-hidden" style={{ border: "1px solid hsl(var(--gold) / 0.2)", boxShadow: "0 0 30px hsl(var(--gold) / 0.08)" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <img src={leftPalmImage} alt={t.palm_left_label} className="w-full h-32 object-cover" />
                          </motion.div>
                        )}
                      </div>
                      <motion.div className="flex items-center justify-center gap-3 mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                        <motion.button onClick={handleShare} className="flex items-center gap-3 px-6 py-3 rounded-full text-base font-body" style={{ background: "linear-gradient(135deg, hsl(142 70% 35% / 0.2), hsl(142 70% 35% / 0.1))", border: "1px solid hsl(142 70% 45% / 0.3)", color: "hsl(142 70% 60%)", backdropFilter: "blur(8px)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}><Share2 className="w-5 h-5" />{t.forecast_share}</motion.button>
                        <motion.button onClick={handleCopy} className="flex items-center gap-3 px-6 py-3 rounded-full text-base font-body" style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.08))", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))", backdropFilter: "blur(8px)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}{copied ? t.share_copied : t.share_copy}</motion.button>
                      </motion.div>
                    </motion.div>
                  </div>
                ) : (
                  /* ── Mobile: stacked ── */
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
                )
              ) : null}
            </AnimatePresence>
    </CinematicModalShell>
  );
};

export default PalmReadingModal;
