import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

/* ── Import all figure assets ── */
import currentFigure from "@/assets/astral-figure.png";
import thinFigure from "@/assets/astral-outline-thin.png";
import mediumFigure from "@/assets/astral-outline-medium.png";
import strongFigure from "@/assets/astral-outline-strong.png";

/* ═══════════════════════════════════════════════════
   TUNABLE PREVIEW CONFIG — adjust freely here
   ═══════════════════════════════════════════════════ */
const PREVIEW_CONFIG = {
  haloRx: 70,
  haloRy: 100,
  haloOpacityMultiplier: 0.5,
  outerGlowBase: 6,
  outerGlowAbsorptionScale: 10,
  outerGlowClimaxScale: 24,
  figBaseOpacity: 0.25,
  figAbsorptionOpacityScale: 0.5,
  figClimaxOpacityScale: 0.25,
};

/* ── Mock aura colors for preview ── */
const MOCK_AURA_COLORS = {
  dominant: "#F5C842",
  dominantGlow: "#F5C84290",
  secondary: "#9B6FD0",
  tertiary: "#5EC090",
};

/* ── Scene constants (matching real component) ── */
const W = 320;
const H = 440;
const FIG_VB_W = 110;
const FIG_VB_H = 175;
const FIG_CX = W / 2;
const FIG_CORE_Y = 240;
const figScale = 1.7;
const figW = FIG_VB_W * figScale;
const figH = FIG_VB_H * figScale;
const figX = FIG_CX - figW / 2;
const figY = 175;

/* ── Timing (matching real) ── */
const TOTAL = 11000;
const CONSTELLATION_PHASE = 4000;
const ABSORPTION_PHASE = 7000;
const CLIMAX_START = 7000;
const CLIMAX_PEAK = 8000;

interface PanelProps {
  label: string;
  figureImg: string;
  useScreenBlend: boolean;
  config: typeof PREVIEW_CONFIG;
  auraColors: typeof MOCK_AURA_COLORS;
  playing: boolean;
  darkBg: boolean;
}

const PreviewPanel = ({ label, figureImg, useScreenBlend, config, auraColors, playing, darkBg }: PanelProps) => {
  const [absorptionLevel, setAbsorptionLevel] = useState(0);
  const [climaxLevel, setClimaxLevel] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!playing) {
      setAbsorptionLevel(0.7);
      setClimaxLevel(0.8);
      return;
    }
    setAbsorptionLevel(0);
    setClimaxLevel(0);
    setKey(k => k + 1);

    const S = 0.6; // slightly faster for preview
    const CP = CONSTELLATION_PHASE * S;
    const AP = ABSORPTION_PHASE * S;
    const CS = CLIMAX_START * S;
    const CPK = CLIMAX_PEAK * S;

    const absStart = setTimeout(() => {
      const dur = AP - CP;
      const steps = 40;
      let i = 0;
      const at = setInterval(() => {
        i++;
        setAbsorptionLevel(Math.min(i / steps, 1));
        if (i >= steps) clearInterval(at);
      }, dur / steps);
    }, CP);

    const clxStart = setTimeout(() => {
      const rampDur = CPK - CS;
      const steps = 25;
      let i = 0;
      const ct = setInterval(() => {
        i++;
        setClimaxLevel(Math.min(i / steps, 1));
        if (i >= steps) clearInterval(ct);
      }, rampDur / steps);
    }, CS);

    return () => {
      clearTimeout(absStart);
      clearTimeout(clxStart);
    };
  }, [playing, key]);

  const { dominant, secondary, tertiary } = auraColors;
  const uid = label.replace(/\s+/g, "-").toLowerCase();

  return (
    <div
      className="flex flex-col items-center gap-2 rounded-xl p-3 border"
      style={{
        background: darkBg
          ? `radial-gradient(ellipse 80% 60% at 50% 40%, ${dominant}18, #0a0a1a 70%)`
          : `radial-gradient(ellipse 80% 60% at 50% 40%, ${dominant}18, #1a1a2e 70%)`,
        borderColor: "hsl(var(--border))",
        minWidth: 200,
      }}
    >
      <h3 className="text-sm font-heading text-center" style={{ color: "hsl(var(--foreground))" }}>{label}</h3>

      <div className="relative" style={{ width: 200, height: 260 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" overflow="visible">
          <defs>
            <filter id={`climax-mega-${uid}`}>
              <feGaussianBlur stdDeviation="18" result="b1" />
              <feGaussianBlur stdDeviation="8" in="SourceGraphic" result="b2" />
              <feMerge>
                <feMergeNode in="b1" />
                <feMergeNode in="b2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id={`sil-fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={dominant} stopOpacity={0.08 + absorptionLevel * 0.25 + climaxLevel * 0.35} />
              <stop offset="35%" stopColor={dominant} stopOpacity={0.15 + absorptionLevel * 0.35 + climaxLevel * 0.45} />
              <stop offset="65%" stopColor={secondary} stopOpacity={0.08 + absorptionLevel * 0.2 + climaxLevel * 0.3} />
              <stop offset="100%" stopColor={dominant} stopOpacity={0.02} />
            </linearGradient>

            <radialGradient id={`fig-inner-glow-${uid}`} cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.06 + absorptionLevel * 0.12 + climaxLevel * 0.2} />
              <stop offset="30%" stopColor={dominant} stopOpacity={0.04 + absorptionLevel * 0.08} />
              <stop offset="60%" stopColor={secondary} stopOpacity={0.02 + absorptionLevel * 0.04} />
              <stop offset="100%" stopColor={tertiary} stopOpacity={0} />
            </radialGradient>

            <radialGradient id={`climax-radial-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.2 * climaxLevel} />
              <stop offset="20%" stopColor={dominant} stopOpacity={0.7 * climaxLevel} />
              <stop offset="45%" stopColor={dominant} stopOpacity={0.4 * climaxLevel} />
              <stop offset="65%" stopColor={secondary} stopOpacity={0.15 * climaxLevel} />
              <stop offset="85%" stopColor={tertiary} stopOpacity={0.05 * climaxLevel} />
              <stop offset="100%" stopColor={dominant} stopOpacity={0} />
            </radialGradient>
          </defs>

          {/* ── Halo ellipse behind figure ── */}
          <ellipse
            cx={FIG_CX}
            cy={FIG_CORE_Y + 40}
            rx={config.haloRx}
            ry={config.haloRy}
            fill={`url(#climax-radial-${uid})`}
            opacity={absorptionLevel * config.haloOpacityMultiplier + climaxLevel * 0.3}
          />

          {/* ── Figure image ── */}
          <g
            transform={`translate(${figX}, ${figY}) scale(${figScale})`}
            style={{
              filter: `drop-shadow(0 0 ${config.outerGlowBase + absorptionLevel * config.outerGlowAbsorptionScale + climaxLevel * config.outerGlowClimaxScale}px ${dominant}${climaxLevel > 0.5 ? 'a0' : '50'}) drop-shadow(0 0 ${climaxLevel * 12}px ${secondary}40)`,
            }}
          >
            <image
              href={figureImg}
              x="0"
              y="0"
              width={FIG_VB_W}
              height={FIG_VB_H}
              opacity={config.figBaseOpacity + absorptionLevel * config.figAbsorptionOpacityScale + climaxLevel * config.figClimaxOpacityScale}
              style={{ mixBlendMode: useScreenBlend ? 'screen' : 'normal' }}
            />
            {climaxLevel > 0 && (
              <image
                href={figureImg}
                x="0"
                y="0"
                width={FIG_VB_W}
                height={FIG_VB_H}
                opacity={climaxLevel * 0.4}
                style={{
                  mixBlendMode: useScreenBlend ? 'screen' : 'normal',
                  filter: `blur(${climaxLevel * 3}px) brightness(${1.5 + climaxLevel})`,
                }}
              />
            )}
          </g>

          {/* ── Climax aura overlay ── */}
          {climaxLevel > 0 && (
            <motion.g
              animate={{ opacity: [1, 0.65, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.ellipse
                cx={FIG_CX}
                cy={FIG_CORE_Y + 40}
                fill={`url(#climax-radial-${uid})`}
                filter={`url(#climax-mega-${uid})`}
                animate={{
                  rx: [45 + climaxLevel * 20, 55 + climaxLevel * 30, 45 + climaxLevel * 20],
                  ry: [120 + climaxLevel * 40, 140 + climaxLevel * 55, 120 + climaxLevel * 40],
                  opacity: [climaxLevel * 0.15, climaxLevel * 0.3, climaxLevel * 0.15],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <g transform={`translate(${figX}, ${figY}) scale(${figScale})`}>
                <image
                  href={figureImg}
                  x="-3"
                  y="-4"
                  width={FIG_VB_W + 6}
                  height={FIG_VB_H + 8}
                  opacity={climaxLevel * 0.35}
                  style={{
                    mixBlendMode: useScreenBlend ? 'screen' : 'normal',
                    filter: `blur(8px) brightness(${1.1 + climaxLevel * 0.4})`,
                  }}
                />
              </g>
            </motion.g>
          )}

          {/* ── Alignment crosshair (debug) ── */}
          <line x1={FIG_CX} y1={0} x2={FIG_CX} y2={H} stroke="cyan" strokeWidth="0.5" opacity={0.15} />
          <circle cx={FIG_CX} cy={FIG_CORE_Y + 40} r={3} fill="none" stroke="cyan" strokeWidth="0.5" opacity={0.2} />
        </svg>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   MAIN PREVIEW PAGE
   ═══════════════════════════════════════════════════ */
const AstralPreview = () => {
  const [useScreenBlend, setUseScreenBlend] = useState(true);
  const [darkBg, setDarkBg] = useState(true);
  const [playing, setPlaying] = useState(false);

  /* Tunable config state */
  const [config, setConfig] = useState(PREVIEW_CONFIG);

  const figures = [
    { label: "Current (original)", img: currentFigure },
    { label: "Thin outline", img: thinFigure },
    { label: "Medium outline", img: mediumFigure },
    { label: "Strong outline", img: strongFigure },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "#0a0a1a" }}>
      <h1 className="text-xl font-heading text-center mb-2" style={{ color: "hsl(var(--gold))" }}>
        Astral Figure Preview — Side by Side
      </h1>
      <p className="text-xs text-center mb-6" style={{ color: "hsl(var(--foreground) / 0.5)" }}>
        Temporary preview page — will be removed after final selection
      </p>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Switch checked={useScreenBlend} onCheckedChange={setUseScreenBlend} />
          <Label className="text-xs" style={{ color: "hsl(var(--foreground) / 0.7)" }}>mix-blend-mode: screen</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={darkBg} onCheckedChange={setDarkBg} />
          <Label className="text-xs" style={{ color: "hsl(var(--foreground) / 0.7)" }}>Dark background</Label>
        </div>
        <Button variant="outline" size="sm" onClick={() => setPlaying(p => !p)}>
          {playing ? "⏸ Pause" : "▶ Play Animation"}
        </Button>
      </div>

      {/* Tunable sliders */}
      <div className="max-w-xl mx-auto mb-8 space-y-3">
        <h2 className="text-xs font-heading uppercase tracking-wider text-center" style={{ color: "hsl(var(--foreground) / 0.4)" }}>
          Tunable Parameters
        </h2>
        {([
          ["haloRx", "Halo Rx", 20, 150],
          ["haloRy", "Halo Ry", 30, 200],
          ["haloOpacityMultiplier", "Halo Opacity ×", 0, 1],
          ["outerGlowBase", "Outer Glow Base", 0, 20],
          ["outerGlowAbsorptionScale", "Glow Absorption Scale", 0, 30],
          ["outerGlowClimaxScale", "Glow Climax Scale", 0, 50],
          ["figBaseOpacity", "Figure Base Opacity", 0, 1],
          ["figAbsorptionOpacityScale", "Fig Absorption Opacity", 0, 1],
          ["figClimaxOpacityScale", "Fig Climax Opacity", 0, 1],
        ] as [keyof typeof PREVIEW_CONFIG, string, number, number][]).map(([key, label, min, max]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs w-40 text-right" style={{ color: "hsl(var(--foreground) / 0.5)" }}>{label}</span>
            <Slider
              min={min}
              max={max}
              step={max <= 1 ? 0.01 : 1}
              value={[config[key]]}
              onValueChange={([v]) => setConfig(c => ({ ...c, [key]: v }))}
              className="flex-1"
            />
            <span className="text-xs w-12 text-left font-mono" style={{ color: "hsl(var(--foreground) / 0.6)" }}>
              {config[key].toFixed(max <= 1 ? 2 : 0)}
            </span>
          </div>
        ))}
      </div>

      {/* 4-panel grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {figures.map(f => (
          <PreviewPanel
            key={f.label}
            label={f.label}
            figureImg={f.img}
            useScreenBlend={useScreenBlend}
            config={config}
            auraColors={MOCK_AURA_COLORS}
            playing={playing}
            darkBg={darkBg}
          />
        ))}
      </div>

      {/* Config dump */}
      <div className="mt-8 max-w-xl mx-auto">
        <pre className="text-[10px] p-3 rounded-lg overflow-auto" style={{ background: "hsl(var(--foreground) / 0.05)", color: "hsl(var(--foreground) / 0.4)" }}>
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default AstralPreview;
