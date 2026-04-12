import { motion } from "framer-motion";
import { Download, Sparkles } from "lucide-react";
import type { AuraResult, AuraFamily, EnergyModifier } from "@/lib/auraResultBank";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  buildLocalizedTitle,
  getAuraName,
  getAuraSubtitle,
  getAuraMeaning,
  getModifierName,
  getSectionLabels,
} from "@/lib/auraLocale";

/* ── Visual mapping per aura family ── */
const AURA_VISUALS: Record<AuraFamily, { accent: string; glow: string; gradient: string }> = {
  solar_gold:        { accent: "#F5C842", glow: "43 80% 55%",   gradient: "linear-gradient(135deg, #F5C84218, #F5C84208)" },
  moon_silver_blue:  { accent: "#A8C4D8", glow: "205 35% 75%",  gradient: "linear-gradient(135deg, #A8C4D818, #A8C4D808)" },
  healing_green:     { accent: "#7FD4A8", glow: "150 45% 66%",  gradient: "linear-gradient(135deg, #7FD4A818, #7FD4A808)" },
  mystical_purple:   { accent: "#9060B8", glow: "275 40% 55%",  gradient: "linear-gradient(135deg, #9060B818, #9060B808)" },
  vital_red:         { accent: "#E05252", glow: "0 70% 60%",    gradient: "linear-gradient(135deg, #E0525218, #E0525208)" },
  venus_pink:        { accent: "#F28DC7", glow: "330 80% 75%",  gradient: "linear-gradient(135deg, #F28DC718, #F28DC708)" },
  astral_turquoise:  { accent: "#5FC8E8", glow: "195 75% 64%",  gradient: "linear-gradient(135deg, #5FC8E818, #5FC8E808)" },
  deep_indigo:       { accent: "#6070E8", glow: "233 75% 64%",  gradient: "linear-gradient(135deg, #6070E818, #6070E808)" },
  expansive_orange:  { accent: "#E8A040", glow: "33 78% 58%",   gradient: "linear-gradient(135deg, #E8A04018, #E8A04008)" },
  pure_white:        { accent: "#E0DCD4", glow: "36 12% 86%",   gradient: "linear-gradient(135deg, #E0DCD418, #E0DCD408)" },
};

interface Props {
  result: AuraResult;
}

const AuraResultCard = ({ result }: Props) => {
  const { language } = useLanguage();
  const vis = AURA_VISUALS[result.primaryAura];
  const labels = getSectionLabels(language);

  // All display strings from centralized locale
  const title = buildLocalizedTitle(language, result.primaryAura, result.modifier);
  const subtitle = getAuraSubtitle(language, result.primaryAura);
  const meaning = getAuraMeaning(language, result.primaryAura);
  const modifierName = getModifierName(language, result.modifier);
  const auraName = (a: AuraFamily) => getAuraName(language, a);

  // Secondary visuals
  const secondaryVis = result.secondaryAuras.slice(0, 2).map(a => AURA_VISUALS[a]);

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl w-full"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: `linear-gradient(180deg, ${vis.accent}12 0%, ${vis.accent}06 40%, transparent 100%)`,
        border: `1px solid ${vis.accent}22`,
        boxShadow: `0 0 60px hsl(${vis.glow} / 0.12), 0 0 120px hsl(${vis.glow} / 0.06), inset 0 1px 0 ${vis.accent}10`,
      }}
    >
      {/* Animated aura shimmer — pulsing glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 20%, ${vis.accent}14, transparent 70%)`,
        }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary color blending gradients */}
      {secondaryVis.map((sv, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 40% 40% at ${i === 0 ? '20% 70%' : '80% 80%'}, ${sv.accent}0A, transparent 60%)`,
          }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}
        />
      ))}

      <div className="relative px-5 py-7 md:px-8 md:py-10 space-y-6">

        {/* ═══ HERO IDENTITY — locale-aware premium label ═══ */}
        <div className="text-center space-y-2">
          <motion.h2
            className="font-heading text-2xl md:text-3xl tracking-wide font-bold"
            style={{
              color: vis.accent,
              textShadow: `0 0 30px ${vis.accent}60, 0 0 60px ${vis.accent}30`,
            }}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {title}
          </motion.h2>

          {/* Emotional subtitle */}
          <motion.p
            className="font-body text-sm md:text-base italic max-w-[320px] mx-auto"
            style={{ color: `${vis.accent}BB` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Glowing divider */}
        <motion.div
          className="mx-auto"
          style={{
            width: "50%",
            height: 1,
            background: `linear-gradient(90deg, transparent, ${vis.accent}50, transparent)`,
            boxShadow: `0 0 8px ${vis.accent}30`,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        />

        {/* ═══ MEANING — Personal reading ═══ */}
        <motion.p
          className="font-body text-sm md:text-base text-center leading-relaxed max-w-[360px] mx-auto"
          style={{
            color: "hsl(var(--foreground) / 0.82)",
            lineHeight: 1.9,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
        >
          {meaning}
        </motion.p>

        {/* ═══ ENERGY SIGNATURE SECTION ═══ */}
        <motion.div
          className="rounded-xl p-4 space-y-3"
          style={{
            background: `${vis.accent}08`,
            border: `1px solid ${vis.accent}12`,
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles size={14} style={{ color: vis.accent }} />
            <span
              className="font-body text-[11px] uppercase tracking-[0.15em]"
              style={{ color: `${vis.accent}99` }}
            >
              {labels.energySignature}
            </span>
            <Sparkles size={14} style={{ color: vis.accent }} />
          </div>

          {/* Primary */}
          <div className="flex items-center gap-3">
            <motion.div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                background: vis.accent,
                boxShadow: `0 0 10px ${vis.accent}80, 0 0 20px ${vis.accent}40`,
              }}
              animate={{ boxShadow: [`0 0 10px ${vis.accent}80, 0 0 20px ${vis.accent}40`, `0 0 16px ${vis.accent}A0, 0 0 30px ${vis.accent}60`, `0 0 10px ${vis.accent}80, 0 0 20px ${vis.accent}40`] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="flex-1 min-w-0">
              <span className="font-body text-[10px] uppercase tracking-wider block" style={{ color: "hsl(var(--foreground) / 0.4)" }}>
                {labels.primaryLabel}
              </span>
              <span className="font-heading text-sm" style={{ color: vis.accent }}>
                {title}
              </span>
            </div>
          </div>

          {/* Secondary auras */}
          {result.secondaryAuras.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1 pt-1.5 flex-shrink-0">
                {result.secondaryAuras.slice(0, 2).map((a, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: AURA_VISUALS[a].accent,
                      opacity: 0.7,
                      boxShadow: `0 0 6px ${AURA_VISUALS[a].accent}50`,
                    }}
                  />
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-body text-[10px] uppercase tracking-wider block" style={{ color: "hsl(var(--foreground) / 0.4)" }}>
                  {labels.secondaryLabel}
                </span>
                <span className="font-body text-xs" style={{ color: "hsl(var(--foreground) / 0.65)" }}>
                  {result.secondaryAuras.slice(0, 2).map(a => getAuraTitle(a)).join(" · ")}
                </span>
              </div>
            </div>
          )}

          {/* Modifier */}
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${vis.accent}40, ${vis.accent}20)`,
                border: `1px solid ${vis.accent}30`,
              }}
            />
            <div className="flex-1 min-w-0">
              <span className="font-body text-[10px] uppercase tracking-wider block" style={{ color: "hsl(var(--foreground) / 0.4)" }}>
                {labels.modifierLabel}
              </span>
              <span className="font-body text-xs" style={{ color: `${vis.accent}CC` }}>
                {modifierName}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ═══ VISUAL TONE TAG ═══ */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
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

        {/* ═══ SHARE SECTION ═══ */}
        <motion.div
          className="text-center space-y-3 pt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.7 }}
        >
          <p
            className="font-body text-[11px] uppercase tracking-[0.15em]"
            style={{ color: "hsl(var(--foreground) / 0.35)" }}
          >
            {labels.shareTitle}
          </p>
          <motion.button
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-body text-sm tracking-wide cursor-pointer transition-all duration-300"
            style={{
              color: vis.accent,
              background: `${vis.accent}14`,
              border: `1px solid ${vis.accent}28`,
              boxShadow: `0 0 20px ${vis.accent}10`,
            }}
            whileHover={{
              boxShadow: `0 0 30px ${vis.accent}25, 0 0 60px ${vis.accent}10`,
              scale: 1.03,
            }}
            whileTap={{ scale: 0.97 }}
          >
            <Download size={14} />
            {labels.downloadCta}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuraResultCard;
