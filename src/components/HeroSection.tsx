import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles, Star, Moon, Eye, Hand } from "lucide-react";
import heroBg from "@/assets/hero-mystical-bg.jpg";
import heroFigure from "@/assets/hero-mystic-figure.jpg";
import crystalBall from "@/assets/crystal-ball.png";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import MonthlyForecastModal from "./MonthlyForecastModal";
import RisingSignModal from "./RisingSignModal";
import CompatibilityModal from "./CompatibilityModal";
import TarotModal from "./TarotModal";
import PalmReadingModal from "./PalmReadingModal";

const menuItems = [
  { icon: Star, label: "תחזית חודשית לפי תאריך לידה", angle: -72 },
  { icon: Moon, label: "המזל העולה לפי שעת לידה", angle: -36 },
  { icon: Sparkles, label: "התאמה זוגית לפי המזלות", angle: 0 },
  { icon: Eye, label: "פתיחת טארוט", angle: 36 },
  { icon: Hand, label: "קריאת כף יד", angle: 72 },
];

// Constellation data - zodiac-inspired star patterns
const constellations = [
  { stars: [[12, 15], [18, 12], [22, 18], [28, 14], [25, 8]], opacity: 0.4 },
  { stars: [[65, 10], [70, 15], [68, 22], [75, 18], [72, 8]], opacity: 0.35 },
  { stars: [[85, 25], [88, 20], [92, 28], [90, 15]], opacity: 0.3 },
  { stars: [[8, 60], [12, 55], [15, 62], [10, 68]], opacity: 0.25 },
  { stars: [[78, 55], [82, 50], [86, 58], [80, 62], [84, 65]], opacity: 0.3 },
];

/* ── Ambient particle ─────────────────────────────── */
const AmbientParticle = ({ type, delay, x, y }: { type: "dust" | "spark" | "orb"; delay: number; x: string; y: string }) => {
  const size = type === "orb" ? "w-2 h-2" : type === "spark" ? "w-0.5 h-0.5" : "w-1 h-1";
  const color = type === "orb" ? "bg-gold/30" : type === "spark" ? "bg-gold/70" : "bg-gold/40";
  const blur = type === "orb" ? "blur-[1px]" : "";

  return (
    <motion.div
      className={`absolute rounded-full ${size} ${color} ${blur}`}
      style={{ left: x, top: y }}
      animate={{
        opacity: [0, type === "orb" ? 0.6 : 1, 0],
        scale: [0, type === "orb" ? 2 : 1.5, 0],
        y: [0, -(20 + Math.random() * 40), -(40 + Math.random() * 60)],
        x: [0, (Math.random() - 0.5) * 30],
      }}
      transition={{
        duration: type === "orb" ? 6 : 4 + Math.random() * 2,
        repeat: Infinity,
        delay,
        ease: "easeOut",
      }}
    />
  );
};

/* ── Constellation component ──────────────────────── */
const Constellation = ({ stars, baseDelay }: { stars: number[][]; baseDelay: number }) => (
  <motion.svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    animate={{ opacity: [0, 0.4, 0.4, 0] }}
    transition={{ duration: 8, repeat: Infinity, delay: baseDelay, ease: "easeInOut" }}
  >
    {/* Lines */}
    {stars.slice(0, -1).map((star, j) => (
      <motion.line
        key={`l-${j}`}
        x1={`${star[0]}%`} y1={`${star[1]}%`}
        x2={`${stars[j + 1][0]}%`} y2={`${stars[j + 1][1]}%`}
        stroke="hsl(43, 80%, 55%)"
        strokeWidth="0.5"
        strokeOpacity="0.15"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: [0, 1, 1, 0] }}
        transition={{ duration: 8, repeat: Infinity, delay: baseDelay + j * 0.3, ease: "easeInOut" }}
      />
    ))}
    {/* Stars */}
    {stars.map((star, j) => (
      <motion.circle
        key={`s-${j}`}
        cx={`${star[0]}%`} cy={`${star[1]}%`}
        r="1.5"
        fill="hsl(43, 80%, 70%)"
        animate={{ opacity: [0, 0.8, 0.8, 0], r: [1, 2, 2, 1] }}
        transition={{ duration: 8, repeat: Infinity, delay: baseDelay + j * 0.2, ease: "easeInOut" }}
      />
    ))}
  </motion.svg>
);

/* ── Energy Pulse ──────────────────────────────────── */
const EnergyPulse = ({ isMobile }: { isMobile: boolean }) => {
  const baseSize = isMobile ? 180 : 280;
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none z-10"
          style={{
            width: baseSize,
            height: baseSize,
            border: "1px solid hsl(var(--gold) / 0.15)",
          }}
          animate={{
            scale: [1, 2.2],
            opacity: [0.4, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1 + 5, // stagger, start after 5s
            repeatDelay: 6,
            ease: "easeOut",
          }}
        />
      ))}
      {/* Burst particles */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <motion.div
            key={`bp-${i}`}
            className="absolute w-1 h-1 rounded-full bg-gold/60 pointer-events-none z-10"
            animate={{
              x: [0, Math.cos(angle) * (isMobile ? 80 : 120)],
              y: [0, Math.sin(angle) * (isMobile ? 80 : 120)],
              opacity: [0, 0.8, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 5,
              repeatDelay: 7,
              ease: "easeOut",
            }}
          />
        );
      })}
    </>
  );
};

/* ── Energy line from tab to crystal ball ──────────── */
const EnergyLine = ({ fromX, fromY, isMobile }: { fromX: number; fromY: number; isMobile: boolean }) => {
  const centerX = isMobile ? 50 : 50;
  return (
    <motion.svg
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
      style={{ overflow: "visible" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.line
        x1={fromX} y1={fromY}
        x2="50%" y2="50%"
        stroke="hsl(43, 80%, 55%)"
        strokeWidth="1"
        strokeOpacity="0.3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 0.4, 0.2] }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </motion.svg>
  );
};

/* ── Main Hero ─────────────────────────────────────── */
const HeroSection = () => {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [forecastOpen, setForecastOpen] = useState(false);
  const [risingOpen, setRisingOpen] = useState(false);
  const [compatibilityOpen, setCompatibilityOpen] = useState(false);
  const [tarotOpen, setTarotOpen] = useState(false);
  const [palmOpen, setPalmOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Mouse tracking
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  // Parallax transforms for layers (depth multiplier)
  const bgX = useTransform(smoothX, [0, 1], [8, -8]);
  const bgY = useTransform(smoothY, [0, 1], [5, -5]);
  const constellationX = useTransform(smoothX, [0, 1], [12, -12]);
  const constellationY = useTransform(smoothY, [0, 1], [8, -8]);
  const smokeX = useTransform(smoothX, [0, 1], [15, -15]);
  const smokeY = useTransform(smoothY, [0, 1], [10, -10]);
  const crystalX = useTransform(smoothX, [0, 1], [20, -20]);
  const crystalY = useTransform(smoothY, [0, 1], [15, -15]);
  const oracleX = useTransform(smoothX, [0, 1], [6, -6]);
  const oracleY = useTransform(smoothY, [0, 1], [4, -4]);

  // Crystal ball inner glow shift
  const glowShiftX = useTransform(smoothX, [0, 1], [-15, 15]);
  const glowShiftY = useTransform(smoothY, [0, 1], [-10, 10]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isMobile || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [isMobile, mouseX, mouseY]);

  const orbRadius = isMobile ? 140 : 240;

  // Generate particles once
  const particles = useMemo(() => {
    const types: Array<"dust" | "spark" | "orb"> = ["dust", "spark", "orb"];
    return [...Array(isMobile ? 20 : 45)].map((_, i) => ({
      type: types[i % 3],
      delay: Math.random() * 6,
      x: `${Math.random() * 100}%`,
      y: `${20 + Math.random() * 70}%`,
    }));
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center"
    >
      {/* ── Layer 1: Background cosmic sky (parallax) ── */}
      <motion.div className="absolute inset-0" style={isMobile ? {} : { x: bgX, y: bgY }}>
        <img src={heroBg} alt="" className="w-full h-full object-cover scale-110" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      </motion.div>

      {/* ── Layer 1.5: Large mystical figure behind content ── */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]"
        style={isMobile ? {} : { x: oracleX, y: oracleY }}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <img
          src={heroFigure}
          alt=""
          className="w-full h-full object-cover object-top"
          style={{
            maskImage: "radial-gradient(ellipse 80% 85% at 50% 40%, black 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 85% at 50% 40%, black 40%, transparent 100%)",
          }}
        />
        {/* Glow behind figure */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 50% 35%, hsl(var(--gold) / 0.08) 0%, transparent 60%)",
          }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* ── Layer 2: Living constellations (parallax) ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={isMobile ? {} : { x: constellationX, y: constellationY }}
      >
        {constellations.map((c, i) => (
          <Constellation key={i} stars={c.stars} baseDelay={i * 3} />
        ))}
      </motion.div>

      {/* ── Layer 3: Smoke / mist (parallax) ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={isMobile ? {} : { x: smokeX, y: smokeY }}
      >
        {/* Primary gold mist */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 50% 60%, hsl(var(--gold) / 0.06) 0%, transparent 50%)",
          }}
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.05, 1], x: [0, 15, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Drifting crimson wisps */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 40% 70%, hsl(var(--crimson) / 0.04) 0%, transparent 40%)",
          }}
          animate={{ opacity: [0.2, 0.5, 0.2], x: [-10, 20, -10], y: [0, -8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        {/* Celestial drift layer */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 60% 50%, hsl(var(--celestial) / 0.04) 0%, transparent 45%)",
          }}
          animate={{ opacity: [0.2, 0.4, 0.2], x: [10, -15, 10], y: [5, -5, 5] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        {/* Slow drifting smoke bands */}
        <motion.div
          className="absolute"
          style={{
            top: "40%",
            left: "-10%",
            width: "120%",
            height: "30%",
            background: "linear-gradient(90deg, transparent 0%, hsl(var(--gold) / 0.03) 30%, hsl(var(--gold) / 0.05) 50%, hsl(var(--gold) / 0.03) 70%, transparent 100%)",
            filter: "blur(40px)",
          }}
          animate={{ x: [-50, 50, -50], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute"
          style={{
            top: "55%",
            left: "-5%",
            width: "110%",
            height: "20%",
            background: "linear-gradient(90deg, transparent 0%, hsl(var(--crimson) / 0.02) 40%, hsl(var(--crimson) / 0.04) 60%, transparent 100%)",
            filter: "blur(50px)",
          }}
          animate={{ x: [30, -40, 30], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
      </motion.div>

      {/* ── Layer 4: Ambient particles ── */}
      {particles.map((p, i) => (
        <AmbientParticle key={i} {...p} />
      ))}

      {/* Content container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-12 md:pt-16">
        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-4 md:mb-6"
        >
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl gold-gradient-text tracking-wider">
            ASTROLOGAI
          </h1>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mb-2 md:mb-4"
        >
          <h2 className="font-body text-xl md:text-2xl lg:text-3xl text-foreground/90 font-light leading-relaxed">
            הכוכבים יודעים את מה שעדיין לא גיליתם
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center text-muted-foreground font-body text-sm md:text-base mb-8 md:mb-6 max-w-xl mx-auto"
        >
          גורל, אהבה, תובנות רוחניות — הכל מחכה לכם בתוך כדור הקריסטל
        </motion.p>

        {/* ── Central mystical scene ── */}
        <div className="relative flex items-center justify-center" style={{ minHeight: isMobile ? "420px" : "520px" }}>

          {/* Oracle is now part of the background image */}

          {/* Crystal ball center (parallax layer) */}
          <motion.div
            className="relative flex items-center justify-center"
            style={isMobile ? {} : { x: crystalX, y: crystalY }}
          >
            {/* Inner glow that follows mouse */}
            {!isMobile && (
              <motion.div
                className="absolute rounded-full z-15 pointer-events-none"
                style={{
                  width: "120px",
                  height: "120px",
                  x: glowShiftX,
                  y: glowShiftY,
                  background: "radial-gradient(circle, hsl(var(--gold) / 0.12) 0%, transparent 70%)",
                }}
              />
            )}

            {/* Outer aura - reacts to hovered tab */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: isMobile ? "220px" : "320px",
                height: isMobile ? "220px" : "320px",
                background: hoveredItem !== null
                  ? hoveredItem === 2
                    ? "radial-gradient(circle, hsl(var(--crimson) / 0.18) 0%, hsl(var(--gold) / 0.1) 40%, transparent 70%)"
                    : hoveredItem === 3
                    ? "radial-gradient(circle, hsl(var(--celestial) / 0.18) 0%, hsl(var(--gold) / 0.08) 40%, transparent 70%)"
                    : "radial-gradient(circle, hsl(var(--gold) / 0.2) 0%, hsl(var(--celestial) / 0.1) 40%, transparent 70%)"
                  : "radial-gradient(circle, hsl(var(--gold) / 0.15) 0%, hsl(var(--celestial) / 0.08) 40%, transparent 70%)",
              }}
              animate={{
                scale: hoveredItem !== null ? [1, 1.2, 1] : [1, 1.15, 1],
                opacity: hoveredItem !== null ? [0.6, 1, 0.6] : [0.5, 0.8, 0.5],
              }}
              transition={{ duration: hoveredItem !== null ? 2.5 : 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Inner shimmer - rotating light refraction */}
            <motion.div
              className="absolute rounded-full pointer-events-none z-15"
              style={{
                width: isMobile ? "140px" : "220px",
                height: isMobile ? "140px" : "220px",
                background: "conic-gradient(from 0deg, transparent 0%, hsl(var(--gold) / 0.08) 15%, transparent 30%, hsl(var(--celestial) / 0.06) 50%, transparent 65%, hsl(var(--crimson) / 0.05) 80%, transparent 100%)",
              }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />

            {/* Inner energy pulse */}
            <motion.div
              className="absolute rounded-full pointer-events-none z-15"
              style={{
                width: isMobile ? "100px" : "160px",
                height: isMobile ? "100px" : "160px",
                background: "radial-gradient(circle, hsl(var(--gold) / 0.1) 0%, transparent 70%)",
              }}
              animate={{
                scale: [0.8, 1.3, 0.8],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Aura distortion ring (reacts to mouse proximity) */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: isMobile ? "240px" : "350px",
                height: isMobile ? "240px" : "350px",
                background: "radial-gradient(circle, transparent 50%, hsl(var(--gold) / 0.04) 70%, transparent 90%)",
              }}
              animate={{ rotate: [0, 360], scale: [1, 1.08, 1] }}
              transition={{ rotate: { duration: 30, repeat: Infinity, ease: "linear" }, scale: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
            />

            {/* Sacred geometry rings */}
            <motion.div
              className="absolute rounded-full mystical-border"
              style={{
                width: isMobile ? "260px" : "380px",
                height: isMobile ? "260px" : "380px",
                borderColor: "hsl(var(--gold) / 0.1)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute rounded-full mystical-border"
              style={{
                width: isMobile ? "300px" : "420px",
                height: isMobile ? "300px" : "420px",
                borderColor: "hsl(var(--gold) / 0.06)",
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            />

            {/* Energy pulse rings */}
            <EnergyPulse isMobile={isMobile} />

            {/* Crystal ball image */}
            <motion.img
              src={crystalBall}
              alt="Crystal Ball"
              className="relative z-20"
              style={{
                width: isMobile ? "180px" : "280px",
                height: isMobile ? "180px" : "280px",
                objectFit: "contain",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: hoveredItem !== null ? [1, 1.03, 1] : 1,
                filter: hoveredItem !== null
                  ? [
                      "drop-shadow(0 0 40px hsl(43 80% 55% / 0.35))",
                      "drop-shadow(0 0 65px hsl(43 80% 55% / 0.55))",
                      "drop-shadow(0 0 40px hsl(43 80% 55% / 0.35))",
                    ]
                  : [
                      "drop-shadow(0 0 35px hsl(43 80% 55% / 0.25))",
                      "drop-shadow(0 0 50px hsl(43 80% 55% / 0.4))",
                      "drop-shadow(0 0 35px hsl(43 80% 55% / 0.25))",
                    ],
              }}
              transition={{
                opacity: { duration: 1, delay: 0.4 },
                scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                filter: { duration: hoveredItem !== null ? 2 : 4, repeat: Infinity, ease: "easeInOut" },
              }}
            />

            {/* ── Floating menu items ── */}
            {menuItems.map((item, i) => {
              const angleRad = (item.angle * Math.PI) / 180;
              const x = Math.sin(angleRad) * orbRadius;
              const y = -Math.cos(angleRad) * orbRadius * 0.55;

              return (
                <motion.div
                  key={i}
                  className="absolute z-30 cursor-pointer"
                  style={{
                    left: `calc(50% + ${x}px - ${isMobile ? 60 : 80}px)`,
                    top: `calc(50% + ${y}px - 20px)`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 + i * 0.15 }}
                  onMouseEnter={() => setHoveredItem(i)}
                  onMouseLeave={() => setHoveredItem(null)}
                  whileHover={{ scale: 1.12, y: -6, zIndex: 50 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { if (i === 0) setForecastOpen(true); if (i === 1) setRisingOpen(true); if (i === 2) setCompatibilityOpen(true); if (i === 3) setTarotOpen(true); if (i === 4) setPalmOpen(true); }}
                >
                  <motion.div
                    className={`
                      relative flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full
                      backdrop-blur-md transition-all duration-300 whitespace-nowrap
                      ${hoveredItem === i
                        ? "bg-gold/20 shadow-[0_0_30px_hsl(var(--gold)/0.35)]"
                        : "bg-muted/20 shadow-[0_0_10px_hsl(var(--gold)/0.1)]"
                      }
                    `}
                    style={{
                      borderWidth: "1px",
                      borderStyle: "solid",
                      borderColor: hoveredItem === i
                        ? "hsl(var(--gold) / 0.6)"
                        : "hsl(var(--gold) / 0.15)",
                    }}
                    animate={{
                      y: [0, -4 - i * 0.5, 0],
                    }}
                    transition={{
                      duration: 3 + i * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.4,
                    }}
                  >
                    <motion.div
                      animate={hoveredItem === i ? {
                        filter: ["drop-shadow(0 0 4px hsl(43 80% 55% / 0.5))", "drop-shadow(0 0 8px hsl(43 80% 55% / 0.8))", "drop-shadow(0 0 4px hsl(43 80% 55% / 0.5))"],
                      } : { filter: "none" }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <item.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 transition-colors duration-300 ${hoveredItem === i ? "text-gold" : "text-gold/60"}`} />
                    </motion.div>
                    <span className={`font-body text-[10px] md:text-xs transition-colors duration-300 ${hoveredItem === i ? "text-gold" : "text-foreground/70"}`}>
                      {item.label}
                    </span>

                    {/* Aura glow */}
                    {hoveredItem === i && (
                      <motion.div
                        className="absolute -inset-2 rounded-full pointer-events-none"
                        style={{
                          background: "radial-gradient(circle, hsl(var(--gold) / 0.08), transparent 70%)",
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: [0, 0.6, 0.3], scale: [0.8, 1.3, 1.1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Oracle on mobile - part of background */}
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6 md:mt-10 pb-8"
        >
          <a href="#free" className="btn-gold font-body flex items-center gap-2 text-sm md:text-base">
            <Sparkles className="w-4 h-4" />
            גלו את ההתחלה המיסטית שלכם
          </a>
          <a
            href="https://wa.me/972500000000"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-gold font-body flex items-center gap-2 text-sm md:text-base"
          >
            💬 דברו איתנו בוואטסאפ
          </a>
        </motion.div>

        {/* Premium badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center pb-6"
        >
          <span className="text-xs text-gold/50 font-body tracking-wider">
            ✦ חוויה מיסטית בלעדית ומותאמת אישית ✦
          </span>
        </motion.div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <MonthlyForecastModal isOpen={forecastOpen} onClose={() => setForecastOpen(false)} />
      <RisingSignModal isOpen={risingOpen} onClose={() => setRisingOpen(false)} />
      <CompatibilityModal isOpen={compatibilityOpen} onClose={() => setCompatibilityOpen(false)} />
      <TarotModal isOpen={tarotOpen} onClose={() => setTarotOpen(false)} />
      <PalmReadingModal isOpen={palmOpen} onClose={() => setPalmOpen(false)} />
    </section>
  );
};

export default HeroSection;
