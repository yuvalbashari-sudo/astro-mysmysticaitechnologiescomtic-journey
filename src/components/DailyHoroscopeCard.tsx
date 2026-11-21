import { zodiacData, getZodiacSign } from "@/data/zodiacData";
import EntryLayout, { resetCopy } from "./EntryLayout";
import { Link } from "react-router-dom";
import { getSignNameByKey } from "@/lib/astroLocale";
import { accountStorageKey, profileRevision } from "@/lib/accountName";
import { signReading } from "@/data/interpretations";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Heart, Briefcase, Zap, RefreshCw, Star } from "lucide-react";
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
import { getAdminSafeProfile } from "@/lib/adminTestMode";
import { enforceLocale } from "@/lib/localeGuard";
import { localizeName } from "@/lib/nameLocalization";
import { readingAuthorization } from "@/lib/readingAuthorization";
import { useSiteAdmin } from "@/hooks/use-site-admin";
/* ── Zodiac helper ── */
const signArt = import.meta.glob<string>("../assets/zodiac-icons/*.png", { eager: true, import: "default" });

function getZodiacFromDate(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + "T12:00:00");
  if (!Number.isFinite(+date) || date.getDate() !== Number(value.slice(-2))) return null;
  return getZodiacSign(date).name;
}

export function resolveHoroscopeSign(profile: { birthDate?: string; zodiacSign?: string }) {
  return getZodiacFromDate(profile.birthDate || "") || zodiacData[(profile.zodiacSign || "").toLowerCase()]?.name || null;
}

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

/* ── Device fingerprint ── */
function getFingerprint(): string {
  const KEY = accountStorageKey("astrologai_device_fp");
  let fp = localStorage.getItem(KEY);
  if (!fp) {
    fp = crypto.randomUUID();
    localStorage.setItem(KEY, fp);
  }
  return fp;
}

function getTodayStr(): string {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-");
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

interface HoroscopeRequest {
  zodiacSign: string;
  birthDate: string | null;
  userName: string | null;
  language: string;
  gender?: "male" | "female";
}

const dailyRequests = new Map<string, Promise<HoroscopeData>>();
let requestDay = "";

function requestHoroscope(profile: HoroscopeRequest, today: string): Promise<HoroscopeData> {
  if (requestDay !== today) {
    dailyRequests.clear();
    requestDay = today;
  }
  const revision = profileRevision();
  const key = accountStorageKey(JSON.stringify([revision, profile]));
  const existing = dailyRequests.get(key);
  if (existing) return existing;

  const storageKey = accountStorageKey("astrologai_last_daily_horoscope");
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (saved?.key === key && saved.day === today && typeof saved.result?.content === "string" && saved.result.content.trim()) {
      return Promise.resolve(saved.result);
    }
  } catch { /* A fresh reading is available if local storage is unavailable. */ }

  const request = loadHoroscope(profile, today).then(result => {
    try {
      if (storageKey === accountStorageKey("astrologai_last_daily_horoscope") && revision === profileRevision()) {
        localStorage.setItem(storageKey, JSON.stringify({key, day: today, result}));
      }
    } catch { /* Optional cache. */ }
    return result;
  }).catch((error) => {
    if (dailyRequests.get(key) === request) dailyRequests.delete(key);
    throw error;
  });
  dailyRequests.set(key, request);
  return request;
}

async function loadHoroscope(profile: HoroscopeRequest, today: string): Promise<HoroscopeData> {
  const hadFingerprint = !!localStorage.getItem(accountStorageKey("astrologai_device_fp"));
  const fingerprint = getFingerprint();

  if (hadFingerprint) {
    try {
      const { data: cached } = await supabase
        .from("daily_horoscopes")
        .select("content, love_score, career_score, energy_score, zodiac_sign, birth_date, user_name")
        .eq("user_fingerprint", fingerprint)
        .eq("horoscope_date", today)
        .eq("language", profile.language)
        .maybeSingle();
      if (cached && cached.content?.trim() && cached.zodiac_sign === profile.zodiacSign
        && cached.birth_date === profile.birthDate && cached.user_name === profile.userName) {
        const mixedLocale = (profile.language === "he" || profile.language === "ar")
          && (/[A-Za-z]{4,}/.test(cached.content) || /\/[\u05d4\u05d5\u05ea\u05d9\u05dd]/.test(cached.content)
            || /[\u0590-\u06FF]+\s*\/\s*[\u0590-\u06FF]+/.test(cached.content));
        if (!mixedLocale) {
          sessionStorage.setItem("_dbg_horoscope_source", "cached");
          return {
            content: cached.content,
            love_score: cached.love_score ?? 3,
            career_score: cached.career_score ?? 3,
            energy_score: cached.energy_score ?? 3,
          };
        }
      }
    } catch (error) {
      console.warn("[daily-horoscope] cache lookup failed", error);
    }
  }

  const url = import.meta.env.VITE_SUPABASE_URL + "/functions/v1/daily-horoscope";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: readingAuthorization() },
    body: JSON.stringify(profile),
  });
  if (!response.ok) throw new Error("Daily horoscope generation failed");

  const result = await response.json() as HoroscopeData;
  if (typeof result.content !== "string" || !result.content.trim()) {
    throw new Error("Daily horoscope response is empty");
  }
  sessionStorage.setItem("_dbg_horoscope_source", "fresh");
  void supabase.from("daily_horoscopes").insert({
    user_fingerprint: fingerprint,
    horoscope_date: today,
    language: profile.language,
    zodiac_sign: profile.zodiacSign,
    content: result.content,
    love_score: result.love_score,
    career_score: result.career_score,
    energy_score: result.energy_score,
    birth_date: profile.birthDate,
    user_name: profile.userName,
  }).then(() => {});
  return result;
}

const DailyHoroscopeCard = ({ home = false }: { home?: boolean } = {}) => {
  const t = useT();
  const { language, dir } = useLanguage();
  const [data, setData] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const { scale, setScale } = useFontScale();
  const ts = TEXT_SIZE_CLASSES[scale];

  const adminMode = useSiteAdmin();
  const safeProfile = home ? mysticalProfile.getProfile() : getAdminSafeProfile();
  const birthDate = safeProfile.birthDate;
  const zodiacSign = resolveHoroscopeSign(safeProfile);
  const signKey = zodiacSign?.toLowerCase() || "";
  const sign = zodiacData[signKey];
  const signOverview = sign && signReading(signKey, sign, language)?.personality;
  const userName = localizeName(safeProfile.userName, language);
  const gender = safeProfile.gender;

  const today = getTodayStr();
  const [attempt, setAttempt] = useState(0);

  // Inline setup form state
  const [setupName, setSetupName] = useState(() => mysticalProfile.getUserName() || "");
  const [setupBirthDate, setSetupBirthDate] = useState("");
  const [editingHome, setEditingHome] = useState(false);
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

  const showSetup = editingHome || (needsSetup && !adminMode);
  useEffect(() => {
    if (showSetup || !zodiacSign) return;

    let active = true;
    setData(null);
    setError(false);
    setLoading(true);
    void requestHoroscope({
      zodiacSign,
      birthDate: birthDate || null,
      userName: userName || null,
      language,
      gender: gender === "male" || gender === "female" ? gender : undefined,
    }, today).then((result) => {
      if (active) setData(result);
    }).catch(() => {
      if (active) setError(true);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [showSetup, zodiacSign, birthDate, userName, language, gender, today, attempt]);

  // Format today's date in locale
  const formattedDate = formatFullDate(new Date(), language);

  if (home && zodiacSign && !editingHome) return <EntryLayout>
    <div className="entry-grid entry-return">
      <div className="entry-content">
        <p className="entry-date">{getSignNameByKey(zodiacSign, language)} · {formattedDate}</p>
        <h1>{t.daily_horoscope_title}</h1>
        <article className="entry-forecast" aria-busy={loading}>
          {data ? <>
            <p className={ts.body}>{enforceLocale(data.content, language, undefined, "daily-horoscope")}</p>
            <div className="entry-scores">
              <span>{t.daily_horoscope_love} <ScoreValue score={data.love_score}/></span>
              <span>{t.daily_horoscope_career} <ScoreValue score={data.career_score}/></span>
              <span>{t.daily_horoscope_energy} <ScoreValue score={data.energy_score}/></span>
            </div>
          </> : error ? <><p role="alert">{t.daily_horoscope_error}</p><button className="entry-action" onClick={()=>setAttempt(n=>n+1)}>{t.daily_horoscope_retry}</button></> : <p role="status">{t.daily_horoscope_loading}</p>}
        </article>
        <Link className="entry-action" to="/tarot-start">{t.tarot_world_spread_question_name}</Link>
        <button className="entry-reset" onClick={() => {
          setSetupName("");
          setSetupBirthDate("");
          setEditingHome(true);
        }}>{resetCopy[language].details}</button>
      </div>
      <div className="entry-art" aria-hidden="true"><div className="entry-orbit"/><img className="entry-sky" src={signArt["../assets/zodiac-icons/"+signKey+".png"]} alt=""/></div>
    </div>
  </EntryLayout>;

  if (showSetup) {
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
      setEditingHome(false);
    };

    const form = (
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
            {editingHome && <button className="entry-reset" onClick={() => setEditingHome(false)}>{resetCopy[language].cancel}</button>}
          </div>
        </div>
      </motion.div>
    );
    return editingHome ? <EntryLayout><div className="px-4 py-10">{form}</div></EntryLayout> : form;
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
        className="mobile-reading-surface relative rounded-2xl overflow-hidden backdrop-blur-xl border border-gold/15"
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
          <AnimatePresence>
          {!data && signOverview && (
            <section className="px-5 py-3 text-start">
              <h4 className="font-heading text-gold">{t.seo_section_personality}</h4>
              <p className="font-body text-foreground">{signOverview}</p>
            </section>
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
                  onClick={() => setAttempt((count) => count + 1)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-body text-gold border border-gold/20 hover:bg-gold/10 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {t.daily_horoscope_retry}
                </button>
              </motion.div>
            )}

            {!error && (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                  {data ? (
                    <>
                      <p className={`text-foreground/80 font-body leading-relaxed whitespace-pre-wrap mb-4 ${ts.body}`}>
                        {enforceLocale(data.content, language, undefined, "daily-horoscope")}
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
                    </>
                  ) : (
                    <div role="status" className="flex items-center justify-center py-8 gap-3">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                        <Star className="w-5 h-5 text-gold/50" />
                      </motion.div>
                      <p className="text-foreground/50 text-sm font-body">{t.daily_horoscope_loading}</p>
                    </div>
                  )}

                {data && (
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
