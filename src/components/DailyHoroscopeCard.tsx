import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Heart, Briefcase, Zap, RefreshCw, Sparkles, Star } from "lucide-react";
import ResultShareBar from "./ResultShareBar";
import { useT, useLanguage } from "@/i18n";
import { formatFullDate } from "@/lib/dateTimeFormat";
import { supabase } from "@/integrations/supabase/client";
import { mysticalProfile } from "@/lib/mysticalProfile";
import astrologerAvatar from "@/assets/astrologer-avatar-cta.png";
import AdvisorChatPanel from "./AdvisorChatPanel";
import TextSizeControl from "./TextSizeControl";
import { useFontScale } from "@/contexts/FontScaleContext";
import { TEXT_SIZE_CLASSES } from "./TextSizeControl";
import MysticalDateInput from "./MysticalDateInput";
import { isAdminTestMode, getAdminSafeProfile, getAdminSafeZodiac } from "@/lib/adminTestMode";
import PremiumUnlockOverlay from "@/components/PremiumUnlockOverlay";
import { usePremiumUnlocked } from "@/lib/premiumUnlock";
/* ── Zodiac helper ── */
const ZODIAC_DATES = [
  { sign: "Capricorn", start: [1, 1], end: [1, 19] },
  { sign: "Aquarius", start: [1, 20], end: [2, 18] },
  { sign: "Pisces", start: [2, 19], end: [3, 20] },
  { sign: "Aries", start: [3, 21], end: [4, 19] },
  { sign: "Taurus", start: [4, 20], end: [5, 20] },
  { sign: "Gemini", start: [5, 21], end: [6, 20] },
  { sign: "Cancer", start: [6, 21], end: [7, 22] },
  { sign: "Leo", start: [7, 23], end: [8, 22] },
  { sign: "Virgo", start: [8, 23], end: [9, 22] },
  { sign: "Libra", start: [9, 23], end: [10, 22] },
  { sign: "Scorpio", start: [10, 23], end: [11, 21] },
  { sign: "Sagittarius", start: [11, 22], end: [12, 21] },
  { sign: "Capricorn", start: [12, 22], end: [12, 31] },
];

function getZodiacFromDate(dateStr: string): string | null {
  try {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    for (const z of ZODIAC_DATES) {
      const [sm, sd] = z.start;
      const [em, ed] = z.end;
      if ((month === sm && day >= sd) || (month === em && day <= ed)) {
        return z.sign;
      }
    }
  } catch {}
  return null;
}

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

/* ── Device fingerprint ── */
function getFingerprint(): string {
  const KEY = "astrologai_device_fp";
  let fp = localStorage.getItem(KEY);
  if (!fp) {
    fp = crypto.randomUUID();
    localStorage.setItem(KEY, fp);
  }
  return fp;
}

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

/* ── Score indicator ── */
const ScoreValue = ({ score, max = 5 }: { score: number; max?: number }) => {
  const out10 = Math.round((score / max) * 10);
  return (
    <span className="text-gold font-heading text-sm font-semibold tabular-nums"
      style={{ textShadow: "0 0 6px hsl(var(--gold) / 0.3)" }}
    >
      {out10}/10
    </span>
  );
};

interface HoroscopeData {
  content: string;
  love_score: number;
  career_score: number;
  energy_score: number;
}

const DailyHoroscopeCard = () => {
  const t = useT();
  const { language, dir } = useLanguage();
  const [data, setData] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const { scale, setScale } = useFontScale();
  const ts = TEXT_SIZE_CLASSES[scale];

  const adminMode = isAdminTestMode();
  const safeProfile = getAdminSafeProfile();
  const birthDate = safeProfile.birthDate;
  const zodiacSign = birthDate ? getZodiacFromDate(birthDate) : (safeProfile.zodiacSign || null);
  const userName = safeProfile.userName;
  const gender = safeProfile.gender;

  // Premium unlock id — one per (sign, day). New day = re-gate.
  const todayKey = new Date().toISOString().slice(0, 10);
  const dailyReadingId = `daily-horoscope:${zodiacSign || "unknown"}:${todayKey}`;
  const dailyUnlocked = usePremiumUnlocked(dailyReadingId);

  // Inline setup form state
  const [setupName, setSetupName] = useState("");
  const [setupBirthDate, setSetupBirthDate] = useState("");
  // Admin users skip setup entirely
  const isReturning = mysticalProfile.isReturningUser();
  const [needsSetup, setNeedsSetup] = useState(!zodiacSign && !adminMode);

  // Show welcome-back greeting for returning users
  useEffect(() => {
    if (isReturning && userName && !needsSetup) {
      setShowWelcomeBack(true);
      const timer = setTimeout(() => setShowWelcomeBack(false), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Tracks whether we've already attempted to load (cache or fresh) for this
  // sign/lang/day combo to avoid double-fetches.
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // Looks up the cached horoscope for today. Safe to call before unlock —
  // it does NOT trigger the AI generation, only reads existing rows.
  const loadCachedHoroscope = useCallback(async () => {
    if (!zodiacSign) return false;
    const fp = getFingerprint();
    const today = getTodayStr();
    try {
      const { data: cached } = await supabase
        .from("daily_horoscopes")
        .select("content, love_score, career_score, energy_score")
        .eq("user_fingerprint", fp)
        .eq("horoscope_date", today)
        .eq("language", language)
        .maybeSingle();
      if (cached) {
        setData({
          content: cached.content,
          love_score: cached.love_score ?? 3,
          career_score: cached.career_score ?? 3,
          energy_score: cached.energy_score ?? 3,
        });
        sessionStorage.setItem("_dbg_horoscope_source", "cached");
        return true;
      }
    } catch (e) {
      console.warn("[daily-horoscope] cache lookup failed", e);
    }
    return false;
  }, [zodiacSign, language]);

  // Generates a fresh horoscope via the edge function. Called only after the
  // user passes the unlock gate (or directly when re-loading an unlocked day).
  const generateHoroscope = useCallback(async () => {
    if (!zodiacSign) return;
    const fp = getFingerprint();
    const today = getTodayStr();
    setLoading(true);
    setError(false);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/daily-horoscope`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          zodiacSign,
          birthDate,
          userName,
          language,
          gender,
        }),
      });

      if (!resp.ok) throw new Error("Failed to generate");

      const result = await resp.json();
      const horoscope: HoroscopeData = {
        content: result.content,
        love_score: result.love_score,
        career_score: result.career_score,
        energy_score: result.energy_score,
      };

      setData(horoscope);
      sessionStorage.setItem("_dbg_horoscope_source", "fresh");

      // Save to DB (fire-and-forget)
      supabase.from("daily_horoscopes").insert({
        user_fingerprint: fp,
        horoscope_date: today,
        language,
        zodiac_sign: zodiacSign,
        content: horoscope.content,
        love_score: horoscope.love_score,
        career_score: horoscope.career_score,
        energy_score: horoscope.energy_score,
        birth_date: birthDate || null,
        user_name: userName || null,
      }).then(() => {});

    } catch (err) {
      console.error("Daily horoscope error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [zodiacSign, birthDate, userName, language, gender]);

  // Backwards-compat shim used by the retry button.
  const fetchHoroscope = useCallback(async () => {
    const hit = await loadCachedHoroscope();
    if (!hit) await generateHoroscope();
  }, [loadCachedHoroscope, generateHoroscope]);

  // On mount / sign change: ALWAYS try the cache (no AI cost). Only generate
  // a fresh horoscope automatically when the user has already passed the
  // unlock gate for this day. Otherwise wait for onUnlockStart.
  useEffect(() => {
    if (!zodiacSign) return;
    let cancelled = false;
    setHasAttemptedLoad(false);
    (async () => {
      const hit = await loadCachedHoroscope();
      if (cancelled) return;
      setHasAttemptedLoad(true);
      if (!hit && dailyUnlocked) {
        // Already unlocked for today — fine to regenerate without re-gating.
        await generateHoroscope();
      }
    })();
    return () => { cancelled = true; };
  }, [zodiacSign, language, dailyUnlocked, loadCachedHoroscope, generateHoroscope]);

  // Format today's date in locale
  const formattedDate = formatFullDate(new Date(), language);

  if (needsSetup) {
    const setupZodiac = setupBirthDate ? getZodiacFromDate(setupBirthDate) : null;
    const canSubmit = setupName.trim().length >= 1 && setupZodiac;

    const handleSetupSubmit = () => {
      if (!canSubmit) return;
      // Save to mystical profile
      mysticalProfile.recordUserName(setupName.trim());
      const ZODIAC_ELEMENTS: Record<string, string> = {
        Aries: "Fire", Taurus: "Earth", Gemini: "Air", Cancer: "Water",
        Leo: "Fire", Virgo: "Earth", Libra: "Air", Scorpio: "Water",
        Sagittarius: "Fire", Capricorn: "Earth", Aquarius: "Air", Pisces: "Water",
      };
      mysticalProfile.recordZodiac(
        setupZodiac!,
        ZODIAC_SYMBOLS[setupZodiac!] || "✦",
        ZODIAC_ELEMENTS[setupZodiac!] || "",
        setupBirthDate
      );
      setNeedsSetup(false);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        dir={dir}
        className="w-full max-w-lg mx-auto"
      >
        <div
          className="relative rounded-2xl overflow-hidden backdrop-blur-xl border border-gold/15"
          style={{
            background: "linear-gradient(145deg, hsl(222 40% 8% / 0.88), hsl(222 47% 6% / 0.92))",
            boxShadow: "0 8px 40px hsl(0 0% 0% / 0.3), inset 0 1px 0 hsl(var(--gold) / 0.08)",
          }}
        >
          {/* Top accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 rounded-b-full"
            style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.4), transparent)" }} />

          <div className="p-5 flex flex-col items-center text-center">
            {/* Zodiac icon */}
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl mb-3"
              style={{
                background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.05))",
                border: "1px solid hsl(var(--gold) / 0.2)",
              }}
            >
              <Sun className="w-6 h-6 text-gold/60" />
            </div>

            <h3 className="text-gold font-heading text-xl font-semibold tracking-wide mb-2">
              {t.daily_horoscope_setup_title}
            </h3>
            <p className="text-foreground/50 text-sm font-body leading-relaxed mb-5 max-w-xs">
              {t.daily_horoscope_setup_desc}
            </p>

            {/* Name input */}
            <div className="w-full mb-3 text-start">
              <label className="block text-xs text-gold/50 font-body mb-1.5 tracking-wider uppercase">
                {t.daily_horoscope_setup_name_label}
              </label>
              <input
                type="text"
                value={setupName}
                onChange={(e) => setSetupName(e.target.value)}
                placeholder={t.daily_horoscope_setup_name_placeholder}
                maxLength={50}
                dir="auto"
                className="w-full py-2.5 px-4 rounded-lg font-body text-sm text-foreground/80 placeholder:text-foreground/25 focus:outline-none transition-all duration-300"
                style={{
                  background: "hsl(var(--deep-blue-light) / 0.3)",
                  border: "1px solid hsl(var(--gold) / 0.12)",
                }}
              />
            </div>

            {/* Birth date input */}
            <div className="w-full mb-5 text-start">
              <label className="block text-xs text-gold/50 font-body mb-1.5 tracking-wider uppercase">
                {t.daily_horoscope_setup_birthdate_label}
              </label>
              <MysticalDateInput
                value={setupBirthDate}
                onChange={setSetupBirthDate}
                className="py-2.5 px-4 rounded-lg font-body text-sm text-foreground/80 placeholder:text-foreground/25"
                style={{
                  background: "hsl(var(--deep-blue-light) / 0.3)",
                  border: "1px solid hsl(var(--gold) / 0.12)",
                }}
              />
            </div>

            {/* Submit button */}
            <motion.button
              onClick={handleSetupSubmit}
              disabled={!canSubmit}
              className="w-full py-3 rounded-xl font-heading text-sm tracking-wide transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: canSubmit
                  ? "linear-gradient(135deg, hsl(var(--gold) / 0.25), hsl(var(--gold) / 0.12))"
                  : "hsl(var(--deep-blue-light) / 0.2)",
                border: `1px solid hsl(var(--gold) / ${canSubmit ? "0.35" : "0.08"})`,
                color: canSubmit ? "hsl(var(--gold))" : "hsl(var(--foreground) / 0.3)",
                boxShadow: canSubmit ? "0 4px 20px hsl(var(--gold) / 0.15)" : "none",
              }}
              whileHover={canSubmit ? { scale: 1.02 } : {}}
              whileTap={canSubmit ? { scale: 0.98 } : {}}
            >
              {t.daily_horoscope_setup_cta}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      dir={dir}
      className="w-full max-w-lg mx-auto"
    >
      <div
        className="relative rounded-2xl overflow-hidden backdrop-blur-xl border border-gold/15"
        style={{
          background: "linear-gradient(145deg, hsl(222 40% 8% / 0.88), hsl(222 47% 6% / 0.92))",
          boxShadow: "0 8px 40px hsl(0 0% 0% / 0.3), inset 0 1px 0 hsl(var(--gold) / 0.08)",
        }}
      >
        {/* Subtle glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 rounded-b-full"
          style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold) / 0.4), transparent)" }} />

        {/* Welcome back greeting */}
        <AnimatePresence>
          {showWelcomeBack && userName && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="px-5 pt-4 pb-1 text-center"
            >
              <p className="text-gold/70 font-body text-sm tracking-wide">
                {t.welcome_back_greeting.replace("{name}", userName)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header — centered layout */}
        <div className="px-5 pt-5 pb-3 flex flex-col items-center text-center">
          {/* Advisor avatar */}
          <motion.button
            className="w-20 h-20 rounded-full overflow-hidden mb-4 cursor-pointer group"
            style={{
              boxShadow: "0 4px 24px hsl(270 60% 45% / 0.3), 0 0 20px hsl(200 70% 50% / 0.12), 0 0 8px hsl(var(--gold) / 0.2)",
              border: "2px solid hsl(var(--gold) / 0.35)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={() => setAdvisorOpen(true)}
            whileHover={{ scale: 1.08, filter: "brightness(1.15)" }}
            whileTap={{ scale: 0.95 }}
            aria-label={t.astrologer_aria_label}
          >
            <img
              src={astrologerAvatar}
              alt={t.astrologer_chat_title}
              className="w-full h-full object-cover scale-105"
              style={{ objectPosition: "center 42%" }}
              draggable={false}
            />
          </motion.button>

          <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3"
            style={{
              background: "linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--gold) / 0.05))",
              border: "1px solid hsl(var(--gold) / 0.2)",
            }}
          >
            {ZODIAC_SYMBOLS[zodiacSign] || "✦"}
          </div>
          <h3 className="text-gold font-heading text-2xl font-semibold tracking-wide">
            {t.daily_horoscope_title}
          </h3>
          <p className="text-foreground/40 text-base font-body mt-1">{formattedDate}</p>
        </div>

        {/* Text size control */}
        <div className="flex justify-center px-5 pb-2">
          <TextSizeControl value={scale} onChange={setScale} />
        </div>

        {/* Content */}
        <div className="px-5 pb-4 min-h-[100px]">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-8 gap-3"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-5 h-5 text-gold/50" />
                </motion.div>
                <p className="text-foreground/50 text-sm font-body">{t.daily_horoscope_loading}</p>
              </motion.div>
            )}

            {error && !loading && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6"
              >
                <p className="text-foreground/50 text-sm font-body mb-3">{t.daily_horoscope_error}</p>
                <button
                  onClick={fetchHoroscope}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body text-gold border border-gold/20 hover:bg-gold/10 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {t.daily_horoscope_retry}
                </button>
              </motion.div>
            )}

            {data && !loading && !error && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <PremiumUnlockOverlay
                  readingId={dailyReadingId}
                  featureKey="monthly_horoscope"
                >
                  <p className={`text-foreground/80 font-body leading-relaxed whitespace-pre-wrap mb-4 ${ts.body}`}>
                    {data.content}
                  </p>

                  {/* Score indicators */}
                  <div className="flex items-center justify-between pt-3 border-t border-foreground/5">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-pink-400/70" />
                      <span className="text-foreground/50 text-xs font-body">{t.daily_horoscope_love}</span>
                      <ScoreValue score={data.love_score} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-blue-400/70" />
                      <span className="text-foreground/50 text-xs font-body">{t.daily_horoscope_career}</span>
                      <ScoreValue score={data.career_score} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-gold/70" />
                      <span className="text-foreground/50 text-xs font-body">{t.daily_horoscope_energy}</span>
                      <ScoreValue score={data.energy_score} />
                    </div>
                  </div>
                </PremiumUnlockOverlay>

                {/* Share / Copy bar — only after unlock */}
                {dailyUnlocked && (
                  <div className="mt-4 pt-3 border-t border-foreground/5">
                    <ResultShareBar
                      resultText={data.content}
                      shareTitle={`${t.daily_horoscope_title} — ${ZODIAC_SYMBOLS[zodiacSign] || "✦"}`}
                      compact
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <AdvisorChatPanel isOpen={advisorOpen} onClose={() => setAdvisorOpen(false)} />
    </motion.div>
  );
};

export default DailyHoroscopeCard;
