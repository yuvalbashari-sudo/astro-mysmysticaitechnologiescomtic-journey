import { motion } from "framer-motion";
import { useMemo } from "react";

export type ReadingTheme = "tarot" | "astrology" | "compatibility" | "palm" | "forecast" | "birthChart" | "dailyCard" | "tarotWorld";

interface Props {
  theme: ReadingTheme;
  /** Set false during video phases to reduce GPU load */
  active?: boolean;
}

const THEME_CONFIG: Record<ReadingTheme, {
  nebulaColors: string[];
  accentHue: string;
  particleColor: string;
  smokeOpacity: number;
  glowColor: string;
}> = {
  tarot: {
    nebulaColors: ["hsl(0 50% 15% / 0.15)", "hsl(43 80% 30% / 0.08)", "hsl(270 40% 12% / 0.1)"],
    accentHue: "0 65% 45%",
    particleColor: "var(--gold)",
    smokeOpacity: 0.06,
    glowColor: "hsl(0 50% 40% / 0.08)",
  },
  astrology: {
    nebulaColors: ["hsl(215 70% 20% / 0.2)", "hsl(43 60% 30% / 0.06)", "hsl(240 50% 15% / 0.12)"],
    accentHue: "215 70% 50%",
    particleColor: "var(--celestial)",
    smokeOpacity: 0.05,
    glowColor: "hsl(215 60% 40% / 0.1)",
  },
  compatibility: {
    nebulaColors: ["hsl(340 60% 18% / 0.12)", "hsl(200 50% 18% / 0.1)", "hsl(43 60% 25% / 0.06)"],
    accentHue: "340 60% 50%",
    particleColor: "var(--crimson)",
    smokeOpacity: 0.05,
    glowColor: "hsl(340 50% 40% / 0.08)",
  },
  palm: {
    nebulaColors: ["hsl(43 70% 20% / 0.12)", "hsl(30 50% 15% / 0.1)", "hsl(222 30% 12% / 0.08)"],
    accentHue: "43 80% 55%",
    particleColor: "var(--gold)",
    smokeOpacity: 0.07,
    glowColor: "hsl(43 70% 40% / 0.1)",
  },
  forecast: {
    nebulaColors: ["hsl(260 50% 18% / 0.12)", "hsl(43 50% 25% / 0.06)", "hsl(215 40% 15% / 0.1)"],
    accentHue: "260 50% 50%",
    particleColor: "var(--gold)",
    smokeOpacity: 0.05,
    glowColor: "hsl(260 40% 40% / 0.08)",
  },
  birthChart: {
    nebulaColors: ["hsl(222 50% 15% / 0.15)", "hsl(215 60% 20% / 0.12)", "hsl(43 40% 20% / 0.06)"],
    accentHue: "215 70% 45%",
    particleColor: "var(--celestial)",
    smokeOpacity: 0.06,
    glowColor: "hsl(222 50% 35% / 0.1)",
  },
  dailyCard: {
    nebulaColors: ["hsl(43 70% 18% / 0.1)", "hsl(30 60% 15% / 0.08)", "hsl(280 40% 12% / 0.06)"],
    accentHue: "43 80% 55%",
    particleColor: "var(--gold)",
    smokeOpacity: 0.05,
    glowColor: "hsl(43 60% 40% / 0.1)",
  },
  tarotWorld: {
    nebulaColors: ["hsl(270 45% 15% / 0.12)", "hsl(0 40% 15% / 0.08)", "hsl(43 50% 20% / 0.06)"],
    accentHue: "270 45% 45%",
    particleColor: "var(--gold)",
    smokeOpacity: 0.06,
    glowColor: "hsl(270 40% 35% / 0.08)",
  },
};

const MysticalReadingAtmosphere = ({ theme, active = true }: Props) => {
  const config = THEME_CONFIG[theme];

  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      x: 5 + Math.random() * 90,
      y: 5 + Math.random() * 90,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 6,
      duration: 4 + Math.random() * 5,
      isAccent: i % 4 === 0,
    })),
  []);

  const smokeBlobs = useMemo(() =>
    Array.from({ length: 3 }, (_, i) => ({
      x: 20 + Math.random() * 60,
      y: 30 + Math.random() * 40,
      size: 120 + Math.random() * 100,
      delay: i * 2.5,
    })),
  []);

  if (!active) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl" aria-hidden="true">
      {/* Cosmic nebula gradient layers */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, ${config.nebulaColors[0]}, transparent 60%),
            radial-gradient(ellipse at 80% 80%, ${config.nebulaColors[1]}, transparent 50%),
            radial-gradient(ellipse at 50% 0%, ${config.nebulaColors[2]}, transparent 70%)
          `,
        }}
      />

      {/* Mystical smoke / fog drifting layers */}
      {smokeBlobs.map((blob, i) => (
        <motion.div
          key={`smoke-${i}`}
          className="absolute rounded-full"
          style={{
            width: blob.size,
            height: blob.size,
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, ${config.glowColor}, transparent 70%)`,
            filter: "blur(40px)",
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -15, 10, 0],
            opacity: [config.smokeOpacity, config.smokeOpacity * 2, config.smokeOpacity * 1.5, config.smokeOpacity],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: 12 + i * 3,
            repeat: Infinity,
            delay: blob.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Sacred light beam from top center */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          width: "40%",
          height: "50%",
          background: `linear-gradient(180deg, hsl(${config.accentHue} / 0.06) 0%, transparent 100%)`,
          filter: "blur(30px)",
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating cosmic particles */}
      {particles.map((p, i) => (
        <motion.div
          key={`p-${i}`}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: p.isAccent
              ? `hsl(${config.accentHue} / 0.5)`
              : `hsl(${config.particleColor} / 0.35)`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [0, -(15 + Math.random() * 25)],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Bottom vignette for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, hsl(var(--deep-blue) / 0.3) 0%, transparent 30%, transparent 70%, hsl(var(--deep-blue) / 0.15) 100%)",
        }}
      />
    </div>
  );
};

export default MysticalReadingAtmosphere;
