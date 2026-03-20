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
    {/* Top accent line */}
    <div
      className="absolute top-0 left-[10%] right-[10%] h-px"
      style={{ background: `linear-gradient(90deg, transparent, hsl(${accentHue} / 0.25), transparent)` }}
    />
    <div className="p-5">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: `hsl(${accentHue} / 0.1)`,
            border: `1px solid hsl(${accentHue} / 0.2)`,
          }}
        >
          {icon}
        </div>
        <h3
          className="font-heading text-base font-bold tracking-wide"
          style={{ color: `hsl(${accentHue})` }}
        >
          {title}
        </h3>
      </div>
      <p
        className="font-body text-sm leading-[1.9] text-right"
        style={{ color: "hsl(var(--foreground) / 0.85)" }}
      >
        {content}
      </p>
    </div>
  </motion.div>
);

const ZodiacSignModal = ({ isOpen, onClose, signIndex }: Props) => {
  const t = useT();

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
          {/* Symbol */}
          <motion.div
            className="text-5xl leading-none"
            style={{ filter: `drop-shadow(0 0 16px hsl(${elHue} / 0.5))` }}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {sign.symbol}
          </motion.div>

          {/* Name */}
          <h2
            className="font-heading text-3xl md:text-4xl font-bold tracking-wider"
            style={{ color: "hsl(var(--gold))", textShadow: "0 0 24px hsl(var(--gold) / 0.2)" }}
          >
            {sign.hebrewName}
          </h2>

          {/* Meta line */}
          <div className="flex items-center justify-center gap-4 text-sm font-body" style={{ color: "hsl(var(--gold-light) / 0.7)" }}>
            <span>{sign.dateRange}</span>
            <span style={{ color: `hsl(${elHue})` }}>•</span>
            <span
              className="px-3 py-0.5 rounded-full text-xs tracking-widest uppercase"
              style={{
                color: `hsl(${elHue})`,
                background: `hsl(${elHue} / 0.1)`,
                border: `1px solid hsl(${elHue} / 0.2)`,
              }}
            >
              {sign.element}
            </span>
          </div>

          {/* Divider */}
          <div
            className="mx-auto mt-4"
            style={{
              width: 80,
              height: 1,
              background: `linear-gradient(90deg, transparent, hsl(var(--gold) / 0.35), transparent)`,
            }}
          />
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
