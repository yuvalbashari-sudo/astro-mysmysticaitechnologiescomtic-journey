import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

/* ═══════════════════════════════════════════════════════
   Cinematic Astrology Promo — Reference-matched composition
   Large centered astral figure with zodiac beam system
   6 seconds @ 30fps = 180 frames
   ═══════════════════════════════════════════════════════ */

const CX = 540;   // center X of 1080
const CY = 900;   // center Y — figure centered in upper 2/3
const CHEST_Y = 730; // beam convergence — center of torso

// Zodiac constellations arranged in a wide arc around the figure
// Colors follow a rainbow spectrum matching the reference
const ZODIAC: { name: string; symbol: string; color: string; angle: number; dist: number; stars: [number, number][] }[] = [
  { name: "ARIES",       symbol: "♈", color: "#E8A030", angle: -120, dist: 460, stars: [[0,0],[15,-20],[35,-15],[25,10],[45,-5]] },
  { name: "TAURUS",      symbol: "♉", color: "#40D880", angle: -100, dist: 470, stars: [[0,0],[20,-15],[10,15],[30,5],[-10,20]] },
  { name: "GEMINI",      symbol: "♊", color: "#30E8B0", angle: -75,  dist: 450, stars: [[0,0],[15,20],[-15,20],[20,-10],[-10,-15]] },
  { name: "CANCER",      symbol: "♋", color: "#40C8F0", angle: -55,  dist: 460, stars: [[0,0],[20,10],[-15,15],[10,-20]] },
  { name: "LEO",         symbol: "♌", color: "#A060E0", angle: -35,  dist: 480, stars: [[0,0],[25,-10],[15,15],[-10,20],[30,10]] },
  { name: "VIRGO",       symbol: "♍", color: "#C050D0", angle: -15,  dist: 470, stars: [[0,0],[20,15],[-20,10],[15,-15],[-15,-20],[25,25]] },
  { name: "LIBRA",       symbol: "♎", color: "#E04080", angle: 15,   dist: 470, stars: [[0,0],[20,-15],[-15,-10],[25,10],[-20,15]] },
  { name: "SCORPIO",     symbol: "♏", color: "#E06040", angle: 35,   dist: 480, stars: [[0,0],[15,20],[30,15],[25,-10],[-10,15]] },
  { name: "SAGITTARIUS", symbol: "♐", color: "#D040D0", angle: 55,   dist: 460, stars: [[0,0],[-20,15],[20,10],[-15,-15],[15,-20]] },
  { name: "CAPRICORN",   symbol: "♑", color: "#6080E0", angle: 75,   dist: 450, stars: [[0,0],[20,-10],[-10,-20],[15,15],[-20,10]] },
  { name: "AQUARIUS",    symbol: "♒", color: "#30B0E8", angle: 100,  dist: 470, stars: [[0,0],[25,10],[-15,15],[10,-20],[-20,-10]] },
  { name: "PISCES",      symbol: "♓", color: "#5060E8", angle: 120,  dist: 460, stars: [[0,0],[20,15],[-20,20],[15,-10],[-10,-15]] },
];

// ═══ NEW FULL-BODY ASTRAL FIGURE ═══
// Large dominant figure: head ~500, feet ~1300, ~800px tall
// 7.5-head proportion, centered at CX=540
// Constructed from multiple body-part paths for anatomical clarity

const HEAD = `
M 540,500
C 520,500 505,515 502,535
C 499,555 503,575 515,585
C 520,590 528,594 540,594
C 552,594 560,590 565,585
C 577,575 581,555 578,535
C 575,515 560,500 540,500 Z`;

const NECK = `
M 530,594 L 528,618
M 550,594 L 552,618`;

const TORSO = `
M 528,618
C 510,622 475,640 458,670
C 445,695 440,730 442,760
L 445,810
C 447,835 455,860 465,880
L 478,920
C 485,932 498,942 515,948
L 525,952 L 540,954 L 555,952 L 565,948
C 582,942 595,932 602,920
L 615,880
C 625,860 633,835 635,810
L 638,760
C 640,730 635,695 622,670
C 605,640 570,622 552,618 Z`;

const LEFT_ARM = `
M 458,670
C 445,678 425,700 410,730
C 395,762 385,800 378,835
L 370,875
C 365,892 360,910 358,925
C 356,938 358,948 365,952
L 375,955
C 382,955 387,950 388,942
L 395,905
L 405,865
L 418,828
L 435,790
L 445,760`;

const RIGHT_ARM = `
M 622,670
C 635,678 655,700 670,730
C 685,762 695,800 702,835
L 710,875
C 715,892 720,910 722,925
C 724,938 722,948 715,952
L 705,955
C 698,955 693,950 692,942
L 685,905
L 675,865
L 662,828
L 645,790
L 635,760`;

const LEFT_LEG = `
M 515,948
L 510,985
C 505,1020 500,1060 497,1100
L 493,1150
L 490,1200
L 488,1250
L 486,1285
C 486,1295 490,1302 498,1305
L 525,1308
C 533,1308 538,1303 538,1295
L 536,1260
L 534,1200
L 533,1150
L 534,1100
L 537,1040
L 540,985`;

const RIGHT_LEG = `
M 565,948
L 570,985
C 575,1020 580,1060 583,1100
L 587,1150
L 590,1200
L 592,1250
L 594,1285
C 594,1295 590,1302 582,1305
L 555,1308
C 547,1308 542,1303 542,1295
L 544,1260
L 546,1200
L 547,1150
L 546,1100
L 543,1040
L 540,985`;

const FIGURE_PARTS = [HEAD, TORSO, LEFT_ARM, RIGHT_ARM, LEFT_LEG, RIGHT_LEG];
const FIGURE_OUTLINE = [HEAD, NECK, TORSO, LEFT_ARM, RIGHT_ARM, LEFT_LEG, RIGHT_LEG];

// Internal energy channels — meridian-like paths through the body
const ENERGY_CHANNELS = [
  // Central spine — crown to root
  `M 540,510 C 540,550 540,600 540,700 C 540,780 540,860 540,954`,
  // Left arm meridian
  `M 540,670 C 520,680 490,700 458,670 C 440,690 410,730 378,835`,
  // Right arm meridian
  `M 540,670 C 560,680 590,700 622,670 C 640,690 670,730 702,835`,
  // Left leg meridian
  `M 540,954 C 530,980 515,1020 497,1100 C 493,1150 490,1200 488,1250`,
  // Right leg meridian
  `M 540,954 C 550,980 565,1020 583,1100 C 587,1150 590,1200 592,1250`,
  // Heart cross-channel
  `M 480,730 C 500,720 520,715 540,718 C 560,715 580,720 600,730`,
  // Solar plexus ring
  `M 475,810 C 490,800 520,795 540,795 C 560,795 590,800 605,810`,
  // Sacral
  `M 500,920 C 515,912 530,910 540,910 C 550,910 565,912 580,920`,
  // Third eye
  `M 525,530 C 530,525 535,523 540,523 C 545,523 550,525 555,530`,
  // Throat
  `M 530,610 C 535,606 540,605 540,605 C 540,605 545,606 550,610`,
];

export const PromoAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene 1: Constellation activation + beams (0–70) ──
  const constellationProg = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp" });
  const beamProg = interpolate(frame, [15, 60], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // ── Scene 2: Absorption + energy fill + climax (50–130) ──
  const absorptionRamp = interpolate(frame, [50, 80], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const climaxIntensity = interpolate(frame, [80, 105], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const beamSustain = interpolate(frame, [60, 180], [1, 0.6], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // ── Scene 3: Map emergence (120–180) ──
  const mapReveal = spring({ frame: frame - 125, fps, config: { damping: 30, stiffness: 80 } });
  const mapOpacity = interpolate(frame, [125, 150], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Figure visibility (fades in with constellations)
  const figureOpacity = interpolate(frame, [5, 30], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Star field
  const stars = Array.from({ length: 120 }, (_, i) => ({
    x: ((i * 137.5) % 1080),
    y: ((i * 97.3 + i * i * 3.7) % 1920),
    r: (i % 4 === 0) ? 2.5 : (i % 3 === 0) ? 1.8 : 1,
    phase: i * 0.7,
  }));

  const coreGlow = 0.15 + climaxIntensity * 0.7;
  const coreR = 30 + climaxIntensity * 80 + Math.sin(frame * 0.1) * 8 * climaxIntensity;

  return (
    <AbsoluteFill style={{ backgroundColor: "#020510" }}>
      {/* Deep space background */}
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs>
            <radialGradient id="space-bg" cx="50%" cy="45%" r="70%">
              <stop offset="0%" stopColor="#0a1030" />
              <stop offset="50%" stopColor="#060a20" />
              <stop offset="100%" stopColor="#020510" />
            </radialGradient>
            <radialGradient id="neb1" cx="25%" cy="30%" r="35%">
              <stop offset="0%" stopColor="#1a0840" stopOpacity="0.35" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <radialGradient id="neb2" cx="75%" cy="55%" r="30%">
              <stop offset="0%" stopColor="#081838" stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <radialGradient id="neb3" cx="60%" cy="25%" r="25%">
              <stop offset="0%" stopColor="#200830" stopOpacity="0.2" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <rect width="1080" height="1920" fill="url(#space-bg)" />
          <rect width="1080" height="1920" fill="url(#neb1)" />
          <rect width="1080" height="1920" fill="url(#neb2)" />
          <rect width="1080" height="1920" fill="url(#neb3)" />
        </svg>
      </AbsoluteFill>

      {/* Star field */}
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          {stars.map((s, i) => {
            const twinkle = Math.sin(frame * 0.06 + s.phase) * 0.35 + 0.65;
            return (
              <circle key={i} cx={s.x} cy={s.y} r={s.r}
                fill="#ffffff" opacity={twinkle * 0.6} />
            );
          })}
        </svg>
      </AbsoluteFill>

      {/* Main composition */}
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs>
            {/* Filters */}
            <filter id="glow-sm"><feGaussianBlur stdDeviation="3" /></filter>
            <filter id="glow-md">
              <feGaussianBlur stdDeviation="6" result="b1" />
              <feGaussianBlur stdDeviation="14" in="SourceGraphic" result="b2" />
              <feMerge><feMergeNode in="b2" /><feMergeNode in="b1" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-lg">
              <feGaussianBlur stdDeviation="20" result="b1" />
              <feGaussianBlur stdDeviation="8" in="SourceGraphic" result="b2" />
              <feMerge><feMergeNode in="b1" /><feMergeNode in="b2" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="body-glow">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>

            {/* Figure fill — translucent with energy */}
            <linearGradient id="fig-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60D0F0" stopOpacity={0.05 + absorptionRamp * 0.15 + climaxIntensity * 0.25} />
              <stop offset="30%" stopColor="#F0C840" stopOpacity={0.08 + absorptionRamp * 0.2 + climaxIntensity * 0.35} />
              <stop offset="60%" stopColor="#50E0A0" stopOpacity={0.06 + absorptionRamp * 0.12 + climaxIntensity * 0.2} />
              <stop offset="100%" stopColor="#8060E0" stopOpacity={0.03 + absorptionRamp * 0.05} />
            </linearGradient>

            {/* Chest core radial */}
            <radialGradient id="chest-core" cx="50%" cy="42%" r="25%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.5 * climaxIntensity} />
              <stop offset="20%" stopColor="#F0E060" stopOpacity={0.6 * climaxIntensity} />
              <stop offset="50%" stopColor="#40D8C0" stopOpacity={0.3 * climaxIntensity} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            {/* Beam gradients */}
            {ZODIAC.map((z, i) => {
              const rad = (z.angle * Math.PI) / 180;
              const sx = CX + Math.cos(rad) * z.dist;
              const sy = CY + Math.sin(rad) * z.dist;
              return (
                <linearGradient key={`bg-${i}`} id={`beam-${i}`}
                  x1={sx} y1={sy} x2={CX} y2={CHEST_Y}
                  gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={z.color} stopOpacity="0.85" />
                  <stop offset="40%" stopColor={z.color} stopOpacity="0.5" />
                  <stop offset="80%" stopColor={z.color} stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
                </linearGradient>
              );
            })}

            {/* Map gradient */}
            <radialGradient id="map-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F0C840" stopOpacity="0.12" />
              <stop offset="60%" stopColor="#6080E0" stopOpacity="0.06" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* ═══ ZODIAC CONSTELLATIONS ═══ */}
          {ZODIAC.map((z, i) => {
            const rad = (z.angle * Math.PI) / 180;
            const cx = CX + Math.cos(rad) * z.dist;
            const cy = CY + Math.sin(rad) * z.dist;
            const delay = i * (35 / 12);
            const opacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
            const pulse = Math.sin(frame * 0.05 + i * 0.5) * 0.15 + 0.85;

            return (
              <g key={`const-${i}`} opacity={opacity}>
                {/* Constellation star pattern */}
                {z.stars.map((s, si) => (
                  <g key={`star-${i}-${si}`}>
                    <circle cx={cx + s[0] * 1.8} cy={cy + s[1] * 1.8} r={3}
                      fill={z.color} opacity={0.9 * pulse} filter="url(#glow-sm)" />
                    {si > 0 && (
                      <line
                        x1={cx + z.stars[si - 1][0] * 1.8} y1={cy + z.stars[si - 1][1] * 1.8}
                        x2={cx + s[0] * 1.8} y2={cy + s[1] * 1.8}
                        stroke={z.color} strokeWidth={1.2} opacity={0.5 * pulse} />
                    )}
                  </g>
                ))}
                {/* Outer glow halo */}
                <circle cx={cx} cy={cy} r={50} fill={z.color} opacity={0.06 * pulse}
                  filter="url(#glow-sm)" />
                {/* Constellation name */}
                <text x={cx} y={cy - 40} textAnchor="middle" fill={z.color}
                  fontSize={16} fontFamily="serif" letterSpacing={3} opacity={0.7 * pulse}>
                  {z.name}
                </text>
              </g>
            );
          })}

          {/* ═══ BEAMS — constellation → chest ═══ */}
          {ZODIAC.map((z, i) => {
            const rad = (z.angle * Math.PI) / 180;
            const sx = CX + Math.cos(rad) * z.dist;
            const sy = CY + Math.sin(rad) * z.dist;
            const beamDelay = 15 + i * (40 / 12);
            const beamOp = interpolate(frame, [beamDelay, beamDelay + 12], [0, 1],
              { extrapolateRight: "clamp", extrapolateLeft: "clamp" }) * beamSustain;

            // Traveling energy particle
            const particleT = interpolate(frame, [beamDelay + 5, beamDelay + 30], [0, 1],
              { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
            // Continuous particles after initial
            const loopT = frame > beamDelay + 30 ? ((frame - beamDelay) % 40) / 40 : particleT;
            const px = sx + (CX - sx) * loopT;
            const py = sy + (CHEST_Y - sy) * loopT;

            return (
              <g key={`beam-${i}`}>
                {/* Wide outer glow beam */}
                <line x1={sx} y1={sy} x2={CX} y2={CHEST_Y}
                  stroke={z.color} strokeWidth={8} strokeLinecap="round"
                  opacity={beamOp * 0.15} filter="url(#glow-md)" />
                {/* Core beam */}
                <line x1={sx} y1={sy} x2={CX} y2={CHEST_Y}
                  stroke={`url(#beam-${i})`} strokeWidth={3}
                  strokeLinecap="round" opacity={beamOp * 0.8}
                  filter="url(#glow-sm)" />
                {/* Bright inner beam */}
                <line x1={sx} y1={sy} x2={CX} y2={CHEST_Y}
                  stroke="#ffffff" strokeWidth={1} strokeLinecap="round"
                  opacity={beamOp * 0.25} />
                {/* Traveling particle */}
                {beamOp > 0.2 && (
                  <circle cx={px} cy={py} r={5}
                    fill={z.color} opacity={0.9} filter="url(#glow-sm)" />
                )}
              </g>
            );
          })}

          {/* ═══ CENTRAL CHEST ENERGY CORE ═══ */}
          {/* Large ambient glow */}
          <circle cx={CX} cy={CHEST_Y} r={coreR * 1.5}
            fill={`rgba(240,200,80,${coreGlow * 0.15})`}
            filter="url(#glow-lg)" />
          {/* Multi-color energy sphere */}
          <circle cx={CX} cy={CHEST_Y} r={coreR * 0.6}
            fill={`rgba(255,255,255,${coreGlow * 0.5})`}
            filter="url(#glow-md)" />
          {/* Hot white core */}
          <circle cx={CX} cy={CHEST_Y}
            r={12 + climaxIntensity * 20 + Math.sin(frame * 0.12) * 4}
            fill="#ffffff" opacity={0.3 + climaxIntensity * 0.5}
            filter="url(#body-glow)" />
          {/* Radiating energy lines from core */}
          {climaxIntensity > 0.1 && Array.from({ length: 16 }).map((_, ri) => {
            const a = (ri * 22.5 * Math.PI) / 180;
            const innerR = 15;
            const outerR = 35 + climaxIntensity * 50 + Math.sin(frame * 0.08 + ri * 0.4) * 10;
            return (
              <line key={`ray-${ri}`}
                x1={CX + Math.cos(a) * innerR} y1={CHEST_Y + Math.sin(a) * innerR}
                x2={CX + Math.cos(a) * outerR} y2={CHEST_Y + Math.sin(a) * outerR}
                stroke="#F0E060" strokeWidth={1.5} strokeLinecap="round"
                opacity={climaxIntensity * (Math.sin(frame * 0.06 + ri * 0.3) * 0.3 + 0.5)} />
            );
          })}

          {/* ═══ HUMAN FIGURE ═══ */}
          <path d={FIGURE_PATH}
            fill="url(#fig-fill)"
            stroke="#60D0F0"
            strokeWidth={1.2 + climaxIntensity * 0.6}
            strokeOpacity={0.25 + absorptionRamp * 0.25 + climaxIntensity * 0.3}
            opacity={figureOpacity}
            style={{
              filter: `drop-shadow(0 0 ${6 + absorptionRamp * 10 + climaxIntensity * 20}px rgba(80,200,240,${0.3 + climaxIntensity * 0.3}))`,
            }}
          />

          {/* ═══ INTERNAL ENERGY CHANNELS ═══ */}
          {absorptionRamp > 0.15 && ENERGY_CHANNELS.map((path, ci) => {
            const channelPulse = Math.sin(frame * 0.1 + ci * 1.3) * 0.3 + 0.7;
            const colors = ["#60D0F0", "#F0C840", "#50E0A0", "#A060E0", "#E06080", "#40D880", "#F0A040"];
            return (
              <path key={`ch-${ci}`} d={path}
                fill="none" stroke={colors[ci % colors.length]}
                strokeWidth={1.5 + climaxIntensity * 0.8}
                strokeLinecap="round"
                opacity={absorptionRamp * 0.4 * channelPulse * figureOpacity}
                filter="url(#body-glow)" />
            );
          })}

          {/* ═══ ABSORPTION PULSE RINGS at chest ═══ */}
          {absorptionRamp > 0 && [0, 1, 2].map((ring) => {
            const phase = ((frame - 50) * 0.05 + ring * 2.1) % (Math.PI * 2);
            const r = 25 + Math.sin(phase) * 40 + ring * 25;
            return (
              <circle key={`pulse-${ring}`} cx={CX} cy={CHEST_Y} r={r}
                fill="none" stroke="#F0E060" strokeWidth={1}
                opacity={absorptionRamp * 0.25 * (Math.sin(phase) * 0.5 + 0.5)} />
            );
          })}

          {/* ═══ BASE ENERGY RINGS (feet platform) ═══ */}
          {figureOpacity > 0.5 && [0, 1, 2].map((ring) => {
            const r = 80 + ring * 40;
            const ringPulse = Math.sin(frame * 0.04 + ring * 1.0) * 0.2 + 0.5;
            return (
              <ellipse key={`base-${ring}`} cx={CX} cy={1180} rx={r} ry={r * 0.3}
                fill="none" stroke="#40D8E0" strokeWidth={1}
                opacity={figureOpacity * 0.2 * ringPulse} />
            );
          })}

          {/* ═══ ASTROLOGICAL MAP (Scene 3) ═══ */}
          {frame > 120 && (
            <g opacity={mapOpacity} transform={`translate(0, ${(1 - mapReveal) * 200})`}>
              <ellipse cx={CX} cy={1550} rx={300} ry={220}
                fill="url(#map-glow)" opacity={mapReveal * 0.5} />
              <circle cx={CX} cy={1550} r={200 * mapReveal}
                fill="none" stroke="#F0C840" strokeWidth={1.5} opacity={mapReveal * 0.4} />
              <circle cx={CX} cy={1550} r={180 * mapReveal}
                fill="none" stroke="#F0C840" strokeWidth={0.8} opacity={mapReveal * 0.25} />
              <circle cx={CX} cy={1550} r={160 * mapReveal}
                fill="none" stroke="#6080E0" strokeWidth={0.5} opacity={mapReveal * 0.2} />
              {/* House divisions */}
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i * 30 - 90) * (Math.PI / 180);
                return (
                  <line key={`h-${i}`}
                    x1={CX + Math.cos(a) * 50 * mapReveal} y1={1550 + Math.sin(a) * 50 * mapReveal}
                    x2={CX + Math.cos(a) * 200 * mapReveal} y2={1550 + Math.sin(a) * 200 * mapReveal}
                    stroke="#F0C840" strokeWidth={0.5} opacity={mapReveal * 0.25} />
                );
              })}
              {/* Zodiac symbols on map */}
              {ZODIAC.map((z, i) => {
                const a = (i * 30 - 75) * (Math.PI / 180);
                const d = 175 * mapReveal;
                const symDelay = interpolate(frame, [132 + i * 2, 138 + i * 2], [0, 1],
                  { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
                return (
                  <text key={`ms-${i}`}
                    x={CX + Math.cos(a) * d} y={1550 + Math.sin(a) * d}
                    textAnchor="middle" dominantBaseline="central"
                    fill={z.color} fontSize={14}
                    opacity={symDelay * mapReveal * 0.7}>
                    {z.symbol}
                  </text>
                );
              })}
              <circle cx={CX} cy={1550} r={12 * mapReveal}
                fill="#F0C840" opacity={mapReveal * 0.2} filter="url(#glow-sm)" />
            </g>
          )}
        </svg>
      </AbsoluteFill>

      {/* Vignette */}
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs>
            <radialGradient id="vig" cx="50%" cy="47%" r="55%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="65%" stopColor="transparent" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.65" />
            </radialGradient>
          </defs>
          <rect width="1080" height="1920" fill="url(#vig)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
