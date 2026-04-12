import { motion } from "framer-motion";
import type { AuraResult, AuraFamily } from "@/lib/auraResultBank";
import { AURA_BANK } from "@/lib/auraResultBank";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── Localized labels ── */
const LABELS: Record<string, { dominant: string; secondary: string }> = {
  he: { dominant: "ההילה הדומיננטית שלך", secondary: "גוונים משניים" },
  en: { dominant: "Your Dominant Aura", secondary: "Secondary tones" },
  ru: { dominant: "Ваша доминирующая аура", secondary: "Вторичные тона" },
  ar: { dominant: "هالتك المهيمنة", secondary: "نغمات ثانوية" },
};

/* ── Visual mapping per aura family ── */
const AURA_VISUALS: Record<AuraFamily, { accent: string; glow: string; gradient: string }> = {
  gold:      { accent: "#F5C842", glow: "43 80% 55%",   gradient: "linear-gradient(135deg, #F5C84218, #F5C84208)" },
  blue:      { accent: "#D0D6E0", glow: "220 20% 85%",  gradient: "linear-gradient(135deg, #D0D6E018, #D0D6E008)" },
  green:     { accent: "#7FD4A8", glow: "150 45% 66%",  gradient: "linear-gradient(135deg, #7FD4A818, #7FD4A808)" },
  purple:    { accent: "#9060B8", glow: "275 40% 55%",  gradient: "linear-gradient(135deg, #9060B818, #9060B808)" },
  red:       { accent: "#E05252", glow: "0 70% 60%",    gradient: "linear-gradient(135deg, #E0525218, #E0525208)" },
  pink:      { accent: "#F28DC7", glow: "330 80% 75%",  gradient: "linear-gradient(135deg, #F28DC718, #F28DC708)" },
  turquoise: { accent: "#5FC8E8", glow: "195 75% 64%",  gradient: "linear-gradient(135deg, #5FC8E818, #5FC8E808)" },
  indigo:    { accent: "#6070E8", glow: "233 75% 64%",  gradient: "linear-gradient(135deg, #6070E818, #6070E808)" },
  orange:    { accent: "#E8A040", glow: "33 78% 58%",   gradient: "linear-gradient(135deg, #E8A04018, #E8A04008)" },
  white:     { accent: "#E0DCD4", glow: "36 12% 86%",   gradient: "linear-gradient(135deg, #E0DCD418, #E0DCD408)" },
};

interface Props {
  result: AuraResult;
}

const AuraResultCard = ({ result }: Props) => {
  const { language } = useLanguage();
  const vis = AURA_VISUALS[result.primaryAura];
  const labels = LABELS[language] || LABELS.en;

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl w-full"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: vis.gradient,
        border: `1px solid ${vis.accent}22`,
        boxShadow: `0 0 40px hsl(${vis.glow} / 0.08), inset 0 1px 0 ${vis.accent}10`,
      }}
    >
      {/* Subtle aura shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 30%, ${vis.accent}0A, transparent 70%)`,
        }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative px-5 py-6 md:px-8 md:py-8 space-y-4">
        {/* Title */}
        <div className="text-center space-y-1.5">
          <motion.p
            className="font-body text-xs md:text-sm uppercase tracking-widest"
            style={{ color: `${vis.accent}88` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {labels.dominant}
          </motion.p>
          <motion.h3
            className="font-heading text-xl md:text-2xl tracking-wide"
            style={{ color: vis.accent }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {result.title}
          </motion.h3>
          <motion.p
            className="font-body text-sm md:text-base italic"
            style={{ color: `${vis.accent}AA` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            {result.subtitle}
          </motion.p>
        </div>

        {/* Divider */}
        <div
          className="mx-auto"
          style={{
            width: "40%",
            height: 1,
            background: `linear-gradient(90deg, transparent, ${vis.accent}30, transparent)`,
          }}
        />

        {/* Short meaning */}
        <motion.p
          className="font-body text-sm md:text-base text-center leading-relaxed"
          style={{
            color: "hsl(var(--foreground) / 0.82)",
            lineHeight: 1.9,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
        >
          {result.shortMeaning}
        </motion.p>

        {/* Visual tone tag */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <span
            className="px-4 py-1.5 rounded-full font-body text-[11px] tracking-wider uppercase"
            style={{
              color: `${vis.accent}CC`,
              background: `${vis.accent}0D`,
              border: `1px solid ${vis.accent}18`,
            }}
          >
            {result.visualTone.split(",")[0].trim()}
          </span>
        </motion.div>

        {/* Secondary auras */}
        {result.secondaryAuras.length > 0 && (
          <motion.p
            className="text-center font-body text-[11px] md:text-xs"
            style={{ color: "hsl(var(--foreground) / 0.4)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            {labels.secondary}: {result.secondaryAuras.slice(0, 3).map(a => AURA_BANK[a].title).join(" • ")}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default AuraResultCard;
