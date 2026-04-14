import { motion } from "framer-motion";
import { useMemo } from "react";
import type { AuraFamily } from "@/lib/auraResultBank";

/**
 * MinimalAuraEffect — Lightweight visual layer that replaces the full
 * astral figure when AURA_VISUAL_MODE === "minimal".
 *
 * Renders:
 *  - Soft radial glow based on primaryAura color
 *  - Subtle secondary color accent
 *  - Calm breathing pulse animation
 *  - Very light shimmer particles (CSS-based, low CPU)
 */

const AURA_COLOR: Record<AuraFamily, { primary: string; secondary: string }> = {
  solar_gold:        { primary: "#F5C842", secondary: "#E8A040" },
  moon_silver_blue:  { primary: "#A8C4D8", secondary: "#6070E8" },
  healing_green:     { primary: "#5EC090", secondary: "#7FD4A8" },
  mystical_purple:   { primary: "#9B6FD0", secondary: "#6070E8" },
  vital_red:         { primary: "#E05252", secondary: "#E8A040" },
  venus_pink:        { primary: "#F28DC7", secondary: "#9B6FD0" },
  astral_turquoise:  { primary: "#3CC8C8", secondary: "#5FC8E8" },
  deep_indigo:       { primary: "#4A5AB8", secondary: "#9B6FD0" },
  expansive_orange:  { primary: "#E89040", secondary: "#F5C842" },
  pure_white:        { primary: "#E0E0F0", secondary: "#A8C4D8" },
};

interface Props {
  primaryAura: AuraFamily;
  secondaryAuras: AuraFamily[];
  modifier: string;
  /** 0–1, drives glow intensity ramp */
  intensity: number;
}

const MinimalAuraEffect = ({ primaryAura, secondaryAuras, modifier, intensity }: Props) => {
  const colors = AURA_COLOR[primaryAura];
  const sec = secondaryAuras[0] ? AURA_COLOR[secondaryAuras[0]] : colors;

  // Modifier affects pulse speed: "radiant" faster, "ethereal" slower
  const pulseDuration = useMemo(() => {
    if (modifier === "radiant" || modifier === "blazing") return 3;
    if (modifier === "ethereal" || modifier === "dreamy") return 6;
    return 4.5;
  }, [modifier]);

  // Modifier affects glow scale
  const glowScale = useMemo(() => {
    if (modifier === "radiant" || modifier === "blazing") return 1.15;
    if (modifier === "soft" || modifier === "gentle") return 0.85;
    return 1;
  }, [modifier]);

  const shimmerParticles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      x: 20 + Math.random() * 60,
      y: 15 + Math.random() * 70,
      size: 1 + Math.random() * 1.5,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 3,
    })),
  []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Primary radial glow — centered, aura-colored */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: "50%",
          top: "40%",
          width: `${260 * glowScale}px`,
          height: `${320 * glowScale}px`,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(ellipse at center, ${colors.primary}22 0%, ${colors.primary}10 35%, ${sec.primary}06 60%, transparent 80%)`,
          filter: `blur(30px)`,
        }}
        animate={{
          opacity: [0.4 * intensity, 0.7 * intensity, 0.4 * intensity],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{ duration: pulseDuration, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary ambient glow — offset, softer */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: "50%",
          top: "55%",
          width: `${180 * glowScale}px`,
          height: `${220 * glowScale}px`,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(ellipse at center, ${sec.primary}14 0%, ${sec.primary}08 40%, transparent 70%)`,
          filter: "blur(25px)",
        }}
        animate={{
          opacity: [0.25 * intensity, 0.45 * intensity, 0.25 * intensity],
        }}
        transition={{ duration: pulseDuration * 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />

      {/* Depth shadow layer — prevents flat feeling */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 45%, transparent 30%, hsl(222 47% 4% / 0.3) 100%)`,
        }}
      />

      {/* Very light shimmer particles — CSS-driven */}
      {shimmerParticles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-twinkle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: i % 3 === 0 ? colors.primary : sec.primary,
            opacity: 0.3 * intensity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default MinimalAuraEffect;
