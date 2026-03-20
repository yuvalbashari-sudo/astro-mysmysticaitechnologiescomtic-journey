import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Heart, Briefcase, Coins, Sparkles, Activity, Flame } from "lucide-react";
import CinematicModalShell from "./CinematicModalShell";
import { zodiacData, type ZodiacSign } from "@/data/zodiacData";
import { useT } from "@/i18n";

const ZODIAC_KEYS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

const ELEMENT_COLORS: Record<string, string> = {
  אש: "20 80% 55%",
  אדמה: "85 50% 45%",
  אוויר: "270 60% 60%",
  מים: "210 70% 55%",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  signIndex: number | null;
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  delay: number;
  accentHue: string;
}

const ReadingSection = ({ icon, title, content, delay, accentHue }: SectionProps) => (
  <motion.div
    className="relative rounded-xl overflow-hidden"
    style={{
      background: "linear-gradient(160deg, hsl(var(--deep-blue-light) / 0.6), hsl(var(--deep-blue) / 0.8))",
      border: `1px solid hsl(${accentHue} / 0.12)`,
    }}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    <div className="absolute top-0 left-[10%] right-[10%] h-px" style={{ background: `linear-gradient(90deg, transparent, hsl(${accentHue} / 0.25), transparent)` }} />
    <div className="p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `hsl(${accentHue} / 0.1)`, border: `1px solid hsl(${accentHue} / 0.2)` }}>
          {icon}
        </div>
        <h3 className="font-heading text-base font-bold tracking-wide" style={{ color: `hsl(${accentHue})` }}>{title}</h3>
      </div>
      <p className="font-body text-sm leading-[1.9] text-right" style={{ color: "hsl(var(--foreground) / 0.85)" }}>{content}</p>
    </div>
  </motion.div>
);

const ZodiacSignModal = ({ isOpen, onClose, signIndex }: Props) => {
  const t = useT();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (signIndex === null) return null;

  const key = ZODIAC_KEYS[signIndex];
  const sign: ZodiacSign = zodiacData[key];
  if (!sign) return null;

  const elHue = ELEMENT_COLORS[sign.element] || "43 80% 55%";

  const sections = [
    { icon: <Star className="w-4 h-4" style={{ color: `hsl(${elHue})` }} />, title: "אישיות", content: sign.personality, delay: 0.2 },
    { icon: <Sparkles className="w-4 h-4" style={{ color: `hsl(${elHue})` }} />, title: "אנרגיית החודש", content: sign.monthlyEnergy, delay: 0.3 },
    { icon: <Heart className="w-4 h-4" style={{ color: `hsl(${elHue})` }} />, title: "אהבה", content: sign.love, delay: 0.4 },
    { icon: <Coins className="w-4 h-4" style={{ color: `hsl(${elHue})` }} />, title: "כסף", content: sign.money, delay: 0.5 },
    { icon: <Briefcase className="w-4 h-4" style={{ color: `hsl(${elHue})` }} />, title: "קריירה", content: sign.career, delay: 0.6 },
    { icon: <Activity className="w-4 h-4" style={{ color: `hsl(${elHue})` }} />, title: "בריאות", content: sign.health, delay: 0.7 },
    { icon: <Flame className="w-4 h-4" style={{ color: `hsl(${elHue})` }} />, title: "רוחניות", content: sign.spiritual, delay: 0.8 },
  ];

  if (!isMobile) {
    // Desktop 3-zone: LEFT=reading sections, CENTER=oracle, RIGHT=sign info
    return (
      <CinematicModalShell isOpen={isOpen} onClose={onClose} fullscreen>
        <div className="absolute inset-0">
          {/* LEFT: Reading sections */}
          <motion.div
            className="absolute overflow-y-auto pointer-events-auto scrollbar-hide"
            style={{ top: "calc(8vh + 50px)", left: "3vw", width: "min(520px, calc(100vw - 520px))", maxWidth: "520px", maxHeight: "82vh" }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 100% 80% at 50% 35%, hsl(222 47% 6% / 0.65), transparent 85%)", filter: "blur(50px)" }} />
            <div className="relative space-y-4" style={{ padding: "0 16px 60px" }}>
              {sections.map((s, i) => (
                <ReadingSection key={i} {...s} accentHue={elHue} />
              ))}
            </div>
          </motion.div>

          {/* RIGHT: Sign identity */}
          <motion.div
            className="absolute pointer-events-auto flex flex-col items-center"
            style={{ top: "calc(10vh + 50px)", right: "3vw", width: "min(300px, 22vw)" }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="text-5xl leading-none mb-4"
              style={{ filter: `drop-shadow(0 0 16px hsl(${elHue} / 0.5))`, textShadow: "0 0 25px hsl(222 47% 6%)" }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              {sign.symbol}
            </motion.div>
            <h2 className="font-heading text-3xl font-bold tracking-wider mb-3" style={{ color: "hsl(var(--gold))", textShadow: "0 0 30px hsl(var(--gold) / 0.2), 0 2px 20px hsl(222 47% 6%)" }}>
              {sign.hebrewName}
            </h2>
            <div className="flex items-center justify-center gap-4 text-sm font-body" style={{ color: "hsl(var(--gold-light) / 0.7)" }}>
              <span style={{ textShadow: "0 2px 10px hsl(222 47% 6%)" }}>{sign.dateRange}</span>
              <span style={{ color: `hsl(${elHue})` }}>•</span>
              <span className="px-3 py-0.5 rounded-full text-xs tracking-widest uppercase" style={{ color: `hsl(${elHue})`, background: `hsl(${elHue} / 0.1)`, border: `1px solid hsl(${elHue} / 0.2)`, backdropFilter: "blur(8px)" }}>
                {sign.element}
              </span>
            </div>
          </motion.div>
        </div>
      </CinematicModalShell>
    );
  }

  // Mobile: stacked layout
  return (
    <CinematicModalShell isOpen={isOpen} onClose={onClose}>
      <div className="px-6 py-8 md:px-10 md:py-10 space-y-6">
        {/* Header */}
        <motion.div
          className="text-center space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="text-5xl leading-none"
            style={{ filter: `drop-shadow(0 0 16px hsl(${elHue} / 0.5))` }}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {sign.symbol}
          </motion.div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-wider" style={{ color: "hsl(var(--gold))", textShadow: "0 0 24px hsl(var(--gold) / 0.2)" }}>
            {sign.hebrewName}
          </h2>
          <div className="flex items-center justify-center gap-4 text-sm font-body" style={{ color: "hsl(var(--gold-light) / 0.7)" }}>
            <span>{sign.dateRange}</span>
            <span style={{ color: `hsl(${elHue})` }}>•</span>
            <span className="px-3 py-0.5 rounded-full text-xs tracking-widest uppercase" style={{ color: `hsl(${elHue})`, background: `hsl(${elHue} / 0.1)`, border: `1px solid hsl(${elHue} / 0.2)` }}>
              {sign.element}
            </span>
          </div>
          <div className="mx-auto mt-4" style={{ width: 80, height: 1, background: `linear-gradient(90deg, transparent, hsl(var(--gold) / 0.35), transparent)` }} />
        </motion.div>

        {/* Reading sections */}
        <div className="space-y-4">
          {sections.map((s, i) => (
            <ReadingSection key={i} {...s} accentHue={elHue} />
          ))}
        </div>
      </div>
    </CinematicModalShell>
  );
};

export default ZodiacSignModal;
