import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";
import { useLanguage } from "@/i18n";
import AdvisorChatPanel from "./AdvisorChatPanel";
import astrologerAvatarCta from "@/assets/astrologer-avatar-cta.png";
import heroFigure from "@/assets/hero-mystic-figure.jpg";

const STORAGE_KEY = "astrologai_ai_insight_dismissed_v1";
const VARIANT_KEY = "astrologai_ai_insight_variant_v1";

type Variant = "A" | "B";

const getOrAssignVariant = (): Variant => {
  try {
    const existing = sessionStorage.getItem(VARIANT_KEY) as Variant | null;
    if (existing === "A" || existing === "B") return existing;
    const next: Variant = Math.random() < 0.5 ? "A" : "B";
    sessionStorage.setItem(VARIANT_KEY, next);
    return next;
  } catch {
    return Math.random() < 0.5 ? "A" : "B";
  }
};

const trackEvent = (name: string, variant: Variant) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (typeof w.gtag === "function") {
      w.gtag("event", name, { variant, surface: "mobile_ai_insight_hero" });
    }
    // Always log for debugging / manual analytics scraping
    console.info("[ai-insight-hero]", name, { variant });
  } catch { /* ignore */ }
};

/**
 * Mobile-only "AI insight" intro screen layered on top of the existing hero.
 * - Single focused CTA → opens Norielle's guided chat.
 * - Dismissible (chevron / scroll cue) so users can still reach the existing
 *   crystal ball + 4-entry menu below.
 * - Desktop is completely untouched (md:hidden).
 */
const MobileAiInsightOverlay = () => {
  const { language, dir } = useLanguage();
  const isRTL = language === "he" || language === "ar";

  const [visible, setVisible] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [variant, setVariant] = useState<Variant>("A");

  // Show on first session only; sessionStorage so it returns next visit.
  useEffect(() => {
    const v = getOrAssignVariant();
    setVariant(v);
    try {
      const dismissed = sessionStorage.getItem(STORAGE_KEY) === "1";
      if (!dismissed) {
        const t = window.setTimeout(() => {
          setVisible(true);
          trackEvent("ai_insight_hero_view", v);
        }, 150);
        return () => window.clearTimeout(t);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
    setVisible(false);
  };

  const copy = useMemo(() => {
    const heVariants: Record<Variant, {
      headline: string; sub: string; cta: string; bubble: string; explore: string;
    }> = {
      A: {
        headline: "מצאתי משהו שחשוב שתראה",
        sub: "תובנה אישית שמבוססת על האנרגיה שלך כרגע",
        cta: "גלה את התובנה שלך",
        bubble: "יש כאן משהו שלא כדאי לפספס",
        explore: "המשך לגלות",
      },
      B: {
        headline: "קבל תובנה אישית להיום",
        sub: "מסר מדויק שיעזור לך להבין מה משפיע עליך עכשיו",
        cta: "קבל תובנה אישית עכשיו",
        bubble: "אני יכולה לעזור לך לראות את זה ברור יותר",
        explore: "המשך לגלות",
      },
    };

    const map: Record<string, {
      headline: string; sub: string; cta: string; bubble: string; explore: string;
    }> = {
      he: heVariants[variant],
      en: {
        headline: "I found something about your path",
        sub: "A personal insight based on your current energy",
        cta: "Reveal My Personal Insight",
        bubble: "There's something important here",
        explore: "Continue exploring",
      },
      ru: {
        headline: "Я нашла кое-что о вашем пути",
        sub: "Личное озарение на основе вашей энергии сейчас",
        cta: "Раскрыть моё личное озарение",
        bubble: "Здесь есть нечто важное для вас",
        explore: "Продолжить исследование",
      },
      ar: {
        headline: "وجدتُ شيئًا عن مسارك",
        sub: "بصيرة شخصية مبنية على طاقتك الحالية",
        cta: "اكشف بصيرتي الشخصية",
        bubble: "هناك شيء مهم هنا",
        explore: "تابع الاستكشاف",
      },
    };
    return map[language] || map.en;
  }, [language, variant]);

  const openChat = (source: "cta" | "bubble" | "avatar") => {
    trackEvent(`ai_insight_hero_${source}_click`, variant);
    setChatOpen(true);
  };

  return (
    <>
      <AdvisorChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      <AnimatePresence>
        {visible && (
          <motion.div
            // md:hidden → mobile only, fully respects desktop visual lock.
            className="fixed inset-0 z-[80] md:hidden flex flex-col items-center justify-between"
            data-ab-variant={variant}
            dir={dir}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: "hsl(225 50% 3%)",
              paddingTop: "calc(env(safe-area-inset-top, 0px) + 24px)",
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 28px)",
              paddingLeft: 24,
              paddingRight: 24,
            }}
          >
            {/* ── Original mystical illustration as background (70% impact) ── */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url(${heroFigure})`,
                backgroundSize: "cover",
                backgroundPosition: "center 30%",
                backgroundRepeat: "no-repeat",
                filter: "brightness(0.95) contrast(1.15) saturate(1.1)",
                opacity: 1,
                transform: "scale(1.04)",
              }}
            />
            {/* ── Very light global wash — keeps illustration vivid ── */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 110% 90% at 50% 45%, transparent 0%, hsl(225 55% 4% / 0.18) 60%, hsl(225 60% 3% / 0.4) 100%)",
              }}
            />
            {/* ── Targeted gradients ONLY behind text zones (top headline + bottom bubble) ── */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 pointer-events-none"
              style={{
                height: "46%",
                background:
                  "linear-gradient(180deg, hsl(225 60% 3% / 0.72) 0%, hsl(225 60% 3% / 0.55) 35%, hsl(225 60% 3% / 0.25) 75%, transparent 100%)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 pointer-events-none"
              style={{
                height: "30%",
                background:
                  "linear-gradient(0deg, hsl(225 60% 3% / 0.78) 0%, hsl(225 60% 3% / 0.5) 50%, transparent 100%)",
              }}
            />
            {/* ── Subtle warm glow behind crystal ball area for magical feel ── */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 50% 30% at 50% 62%, hsl(43 80% 55% / 0.12) 0%, transparent 70%)",
                mixBlendMode: "screen",
              }}
            />

            {/* ── Cosmic depth: stars ── */}
            <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 40 }).map((_, i) => {
                const x = (i * 53) % 100;
                const y = (i * 89) % 100;
                const size = 1 + ((i * 7) % 3);
                const delay = (i % 9) * 0.4;
                const dur = 3 + ((i * 11) % 4);
                return (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: size,
                      height: size,
                      left: `${x}%`,
                      top: `${y}%`,
                      background:
                        i % 7 === 0 ? "hsl(43 80% 70%)" : "hsl(210 100% 95%)",
                      boxShadow:
                        i % 7 === 0
                          ? "0 0 6px hsl(43 80% 60% / 0.7)"
                          : "0 0 4px hsl(210 100% 90% / 0.5)",
                    }}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{
                      duration: dur,
                      delay,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}
            </div>

            {/* ── Top: glowing AI orb mark ── */}
            <motion.div
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="relative flex items-center justify-center rounded-full"
                style={{
                  width: 92,
                  height: 92,
                  background:
                    "radial-gradient(circle at 50% 40%, hsl(43 80% 60% / 0.25) 0%, hsl(215 70% 35% / 0.15) 55%, transparent 75%)",
                  border: "1px solid hsl(var(--gold) / 0.35)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 30px hsl(var(--gold) / 0.18), inset 0 0 20px hsl(215 70% 50% / 0.15)",
                    "0 0 50px hsl(var(--gold) / 0.32), inset 0 0 28px hsl(215 70% 50% / 0.22)",
                    "0 0 30px hsl(var(--gold) / 0.18), inset 0 0 20px hsl(215 70% 50% / 0.15)",
                  ],
                }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles
                  size={32}
                  strokeWidth={1.5}
                  style={{ color: "hsl(var(--gold))" }}
                />
              </motion.div>
              <p
                className="font-body mt-3"
                style={{
                  fontSize: 12,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "hsl(var(--gold) / 0.7)",
                  fontWeight: 500,
                }}
              >
                Norielle • AI
              </p>
            </motion.div>

            {/* ── Center: headline + supporting + CTA ── */}
            <div className="relative z-10 flex flex-col items-center text-center w-full" style={{ maxWidth: 420 }}>
              <motion.h1
                className="font-heading"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: "clamp(30px, 8.4vw, 38px)",
                  lineHeight: 1.18,
                  fontWeight: 600,
                  letterSpacing: "0.005em",
                  background:
                    "linear-gradient(180deg, hsl(43 90% 88%) 0%, hsl(43 80% 65%) 60%, hsl(38 70% 50%) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "0 0 40px hsl(43 80% 50% / 0.15)",
                  margin: 0,
                }}
              >
                {copy.headline}
              </motion.h1>

              <motion.p
                className="font-body"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.7 }}
                style={{
                  marginTop: 18,
                  fontSize: "clamp(15px, 4.2vw, 17px)",
                  lineHeight: 1.55,
                  color: "hsl(var(--foreground) / 0.78)",
                  fontWeight: 400,
                  maxWidth: 340,
                }}
              >
                {copy.sub}
              </motion.p>

              {/* ── Glowing CTA ── */}
              <motion.button
                type="button"
                onClick={() => openChat("cta")}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.85, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                whileTap={{ scale: 0.97 }}
                className="font-heading relative"
                style={{
                  marginTop: 36,
                  width: "100%",
                  maxWidth: 360,
                  minHeight: 64,
                  padding: "18px 28px",
                  borderRadius: 999,
                  border: "1px solid hsl(var(--gold) / 0.55)",
                  background:
                    "linear-gradient(135deg, hsl(43 85% 58%) 0%, hsl(38 90% 48%) 50%, hsl(32 85% 42%) 100%)",
                  color: "hsl(225 50% 8%)",
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {/* Soft outer breathing glow */}
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full pointer-events-none"
                  animate={{
                    boxShadow: [
                      "0 0 24px hsl(var(--gold) / 0.35), 0 8px 30px hsl(38 90% 35% / 0.35)",
                      "0 0 44px hsl(var(--gold) / 0.55), 0 8px 36px hsl(38 90% 35% / 0.45)",
                      "0 0 24px hsl(var(--gold) / 0.35), 0 8px 30px hsl(38 90% 35% / 0.35)",
                    ],
                  }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
                  style={{ borderRadius: 999 }}
                />
                {/* Inner shine */}
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, hsl(43 100% 90% / 0.35) 0%, transparent 45%)",
                    borderRadius: 999,
                  }}
                />
                <span className="relative inline-flex items-center justify-center gap-2">
                  <Sparkles size={18} strokeWidth={2.2} />
                  {copy.cta}
                </span>
              </motion.button>
            </div>

            {/* ── Bottom: Norielle floating guide + dismiss cue ── */}
            <div className="relative z-10 flex flex-col items-center w-full">
              <motion.div
                className="flex items-center gap-3"
                style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.7 }}
              >
                {/* Avatar */}
                <button
                  type="button"
                  onClick={() => openChat("avatar")}
                  aria-label="Norielle"
                  className="relative rounded-full overflow-hidden"
                  style={{
                    width: 56,
                    height: 56,
                    border: "1px solid hsl(var(--gold) / 0.45)",
                    boxShadow:
                      "0 0 22px hsl(var(--gold) / 0.28), inset 0 0 14px hsl(43 60% 30% / 0.2)",
                    background: "hsl(225 45% 10%)",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={astrologerAvatarCta}
                    alt=""
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </button>

                {/* Speech bubble */}
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "relative",
                    padding: "12px 16px",
                    borderRadius: 16,
                    background:
                      "linear-gradient(155deg, hsl(222 47% 11% / 0.92) 0%, hsl(222 50% 7% / 0.94) 100%)",
                    border: "1px solid hsl(var(--gold) / 0.28)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    maxWidth: 220,
                    color: "hsl(var(--foreground) / 0.88)",
                    fontSize: 14,
                    lineHeight: 1.45,
                    textAlign: isRTL ? "right" : "left",
                  }}
                >
                  {copy.bubble}
                  {/* tail */}
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: "50%",
                      [isRTL ? "right" : "left"]: -6,
                      transform: "translateY(-50%) rotate(45deg)",
                      width: 12,
                      height: 12,
                      background:
                        "linear-gradient(155deg, hsl(222 47% 11% / 0.92) 0%, hsl(222 50% 7% / 0.94) 100%)",
                      borderLeft: isRTL ? "none" : "1px solid hsl(var(--gold) / 0.28)",
                      borderBottom: isRTL ? "none" : "1px solid hsl(var(--gold) / 0.28)",
                      borderRight: isRTL ? "1px solid hsl(var(--gold) / 0.28)" : "none",
                      borderTop: isRTL ? "1px solid hsl(var(--gold) / 0.28)" : "none",
                    } as React.CSSProperties}
                  />
                </motion.div>
              </motion.div>

              {/* Dismiss / "continue exploring" cue */}
              <motion.button
                type="button"
                onClick={dismiss}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.6 }}
                className="font-body mt-6 inline-flex flex-col items-center gap-1"
                style={{
                  color: "hsl(var(--foreground) / 0.5)",
                  fontSize: 12,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  padding: "8px 16px",
                }}
                aria-label={copy.explore}
              >
                <span>{copy.explore}</span>
                <motion.span
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  aria-hidden
                >
                  <ChevronDown size={18} strokeWidth={1.5} />
                </motion.span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileAiInsightOverlay;
