import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

/* ═══════════════════════════════════════════════════════════
   NEW ASTRAL SCENE — Complete replacement (v2)
   Hard override: zero reuse from previous implementation
   300 frames @ 30fps = 10 seconds
   ═══════════════════════════════════════════════════════════ */

// Debug confirmation
console.log("NEW ASTRAL SCENE ACTIVE");

const W = 1080;
const H = 1920;
const MX = W / 2; // 540
const MY = 780;   // figure vertical center (upper portion)

// ═══════════════════════════════════════
// BRAND NEW HUMAN FIGURE — Da Vinci style
// Vitruvian proportions, ~700px tall
// Completely new geometry
// ═══════════════════════════════════════

// Head: smooth oval, natural skull, no crest
const SKULL = `M 540,440 C 558,440 572,450 578,468 C 584,486 582,510 576,524
  C 572,534 564,542 554,546 L 540,550 L 526,546
  C 516,542 508,534 504,524 C 498,510 496,486 502,468
  C 508,450 522,440 540,440 Z`;

// Neck: clean cylindrical
const NECK_PATH = `M 528,548 C 530,558 532,572 532,580 L 548,580 C 548,572 550,558 552,548`;

// Shoulders + Upper torso: athletic, tapered
const UPPER_TORSO = `M 532,580 C 520,582 490,590 462,608
  C 448,618 440,632 438,650 L 436,680 L 436,720
  C 436,732 438,744 442,754 L 540,754
  L 638,754 C 642,744 644,732 644,720 L 644,680
  L 642,650 C 640,632 632,618 618,608
  C 590,590 560,582 548,580 Z`;

// Lower torso: waist to hips
const LOWER_TORSO = `M 442,754 C 446,772 452,790 460,808
  L 470,830 C 478,844 490,856 504,862
  L 540,870 L 576,862 C 590,856 602,844 610,830
  L 620,808 C 628,790 634,772 638,754 Z`;

// Left arm: natural hang, relaxed hand
const L_ARM = `M 462,608 C 448,616 432,636 420,660
  C 408,688 398,720 392,756 L 388,790
  C 384,818 382,846 381,870 C 380,888 380,902 383,910
  C 385,916 390,920 396,920 L 404,918
  C 410,916 414,910 414,902 L 416,876 L 420,840
  L 428,800 L 436,760 L 438,720`;

// Right arm: mirrored
const R_ARM = `M 618,608 C 632,616 648,636 660,660
  C 672,688 682,720 688,756 L 692,790
  C 696,818 698,846 699,870 C 700,888 700,902 697,910
  C 695,916 690,920 684,920 L 676,918
  C 670,916 666,910 666,902 L 664,876 L 660,840
  L 652,800 L 644,760 L 642,720`;

// Left leg
const L_LEG = `M 504,862 L 500,900 C 496,940 492,980 490,1024
  L 488,1070 L 486,1120 L 484,1160 L 483,1190
  C 483,1200 486,1208 492,1212 L 518,1215
  C 526,1215 530,1210 530,1202 L 529,1180
  L 528,1130 L 528,1080 L 530,1024 L 534,960 L 540,900`;

// Right leg
const R_LEG = `M 576,862 L 580,900 C 584,940 588,980 590,1024
  L 592,1070 L 594,1120 L 596,1160 L 597,1190
  C 597,1200 594,1208 588,1212 L 562,1215
  C 554,1215 550,1210 550,1202 L 551,1180
  L 552,1130 L 552,1080 L 550,1024 L 546,960 L 540,900`;

const BODY_FILLS = [SKULL, UPPER_TORSO, LOWER_TORSO];
const BODY_STROKES = [SKULL, NECK_PATH, UPPER_TORSO, LOWER_TORSO, L_ARM, R_ARM, L_LEG, R_LEG];

// ═══ INTERNAL ENERGY MERIDIANS ═══
const MERIDIANS = [
  // Central channel (sushumna) — crown to root
  `M 540,445 L 540,500 L 540,580 C 540,640 540,700 540,754 L 540,862`,
  // Heart horizontal
  `M 460,700 C 480,690 510,685 540,685 C 570,685 600,690 620,700`,
  // Left arm flow
  `M 540,640 C 510,650 470,670 440,700 C 420,730 400,780 388,830`,
  // Right arm flow
  `M 540,640 C 570,650 610,670 640,700 C 660,730 680,780 692,830`,
  // Left leg flow
  `M 540,862 C 525,890 510,940 495,1020 C 488,1060 485,1110 484,1170`,
  // Right leg flow
  `M 540,862 C 555,890 570,940 585,1020 C 592,1060 595,1110 596,1170`,
  // Solar plexus ring
  `M 465,770 C 490,760 515,756 540,756 C 565,756 590,760 615,770`,
  // Third eye
  `M 520,470 C 528,464 534,462 540,462 C 546,462 552,464 560,470`,
];

// Chakra points along central channel
const CHAKRAS = [
  { y: 458, color: "#C070FF", r: 6, name: "Crown" },
  { y: 480, color: "#6060FF", r: 5, name: "ThirdEye" },
  { y: 570, color: "#40C0FF", r: 5, name: "Throat" },
  { y: 690, color: "#40E080", r: 7, name: "Heart" },
  { y: 756, color: "#E0E040", r: 6, name: "Solar" },
  { y: 830, color: "#F0A030", r: 5, name: "Sacral" },
  { y: 862, color: "#E04040", r: 5, name: "Root" },
];

// ═══ ZODIAC RING ═══
const SIGNS: { name: string; sym: string; col: string; angle: number }[] = [
  { name: "ARIES",       sym: "♈", col: "#E8A030", angle: -150 },
  { name: "TAURUS",      sym: "♉", col: "#40D880", angle: -120 },
  { name: "GEMINI",      sym: "♊", col: "#30E8B0", angle: -95 },
  { name: "CANCER",      sym: "♋", col: "#40C8F0", angle: -70 },
  { name: "LEO",         sym: "♌", col: "#A060E0", angle: -45 },
  { name: "VIRGO",       sym: "♍", col: "#C050D0", angle: -20 },
  { name: "LIBRA",       sym: "♎", col: "#E04080", angle: 20 },
  { name: "SCORPIO",     sym: "♏", col: "#E06040", angle: 45 },
  { name: "SAGITTARIUS", sym: "♐", col: "#D040D0", angle: 70 },
  { name: "CAPRICORN",   sym: "♑", col: "#6080E0", angle: 95 },
  { name: "AQUARIUS",    sym: "♒", col: "#30B0E8", angle: 120 },
  { name: "PISCES",      sym: "♓", col: "#5060E8", angle: 150 },
];

const ORBIT_RADIUS = 480;
const BEAM_TARGET_Y = 690; // heart chakra

// Constellation star patterns (small clusters)
const STAR_PATTERNS: [number, number][][] = [
  [[0,0],[18,-22],[38,-12],[28,14],[48,-2]],
  [[0,0],[22,-18],[12,18],[32,8],[-12,22]],
  [[0,0],[16,22],[-16,22],[22,-12],[-12,-18]],
  [[0,0],[22,12],[-18,16],[12,-22]],
  [[0,0],[28,-12],[18,18],[-12,22],[32,12]],
  [[0,0],[22,18],[-22,12],[18,-18],[-18,-22],[28,28]],
  [[0,0],[22,-18],[-18,-12],[28,12],[-22,18]],
  [[0,0],[18,22],[32,18],[28,-12],[-12,18]],
  [[0,0],[-22,18],[22,12],[-18,-18],[18,-22]],
  [[0,0],[22,-12],[-12,-22],[18,18],[-22,12]],
  [[0,0],[28,12],[-18,18],[12,-22],[-22,-12]],
  [[0,0],[22,18],[-22,22],[18,-12],[-12,-18]],
];

export const PromoAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ═══ PHASE 1: Constellation reveal (0–50) ═══
  const starsIn = interpolate(frame, [0, 45], [0, 1], { extrapolateRight: "clamp" });

  // ═══ PHASE 2: Figure materializes (20–60) ═══
  const figAppear = interpolate(frame, [20, 55], [0, 1], { extrapolateRight: "clamp" });

  // ═══ PHASE 3: Beams fire + energy absorption (40–100) ═══
  const beamPower = interpolate(frame, [40, 80], [0, 1], { extrapolateRight: "clamp" });
  const absorption = interpolate(frame, [60, 100], [0, 1], { extrapolateRight: "clamp" });

  // ═══ PHASE 4: Climax — full energy (100–140) ═══
  const climax = interpolate(frame, [100, 130], [0, 1], { extrapolateRight: "clamp" });

  // ═══ PHASE 5: HOLD — persistent final state (140–300) ═══
  // Figure stays at FULL opacity, glowing, alive
  const isHold = frame >= 140;
  const holdPulse = isHold ? Math.sin((frame - 140) * 0.035) * 0.06 : 0;
  const finalGlow = interpolate(frame, [100, 140], [0, 1], { extrapolateRight: "clamp" });

  // Map emerges BELOW figure during hold
  const mapIn = spring({ frame: Math.max(0, frame - 150), fps, config: { damping: 30, stiffness: 60 } });
  const mapOp = interpolate(frame, [150, 180], [0, 1], { extrapolateRight: "clamp" });

  // Beams sustain but soften slightly during hold
  const beamHold = interpolate(frame, [100, 160], [1, 0.6], { extrapolateRight: "clamp" });

  // Body energy intensity
  const bodyEnergy = Math.min(1, absorption * 0.5 + climax * 0.5 + (isHold ? 0.95 + holdPulse : 0));
  const outlineGlow = 0.2 + bodyEnergy * 0.65;

  // Core chest glow radius
  const coreR = 20 + climax * 50 + finalGlow * 30 + (isHold ? Math.sin(frame * 0.08) * 8 : 0);
  const coreOp = 0.1 + climax * 0.5 + finalGlow * 0.4 + holdPulse;

  // Background stars
  const bgStars = Array.from({ length: 140 }, (_, i) => ({
    x: (i * 137.5) % W,
    y: (i * 97.3 + i * i * 3.7) % H,
    r: i % 5 === 0 ? 2.2 : i % 3 === 0 ? 1.5 : 0.8,
    phase: i * 0.7,
  }));

  return (
    <AbsoluteFill style={{ backgroundColor: "#020510" }}>
      {/* ═══ DEEP SPACE BACKGROUND ═══ */}
      <AbsoluteFill>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
          <defs>
            <radialGradient id="v2-space" cx="50%" cy="42%" r="70%">
              <stop offset="0%" stopColor="#0c1235" />
              <stop offset="45%" stopColor="#060a22" />
              <stop offset="100%" stopColor="#020510" />
            </radialGradient>
            <radialGradient id="v2-neb1" cx="20%" cy="28%" r="30%">
              <stop offset="0%" stopColor="#180640" stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <radialGradient id="v2-neb2" cx="80%" cy="50%" r="28%">
              <stop offset="0%" stopColor="#061838" stopOpacity="0.25" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <rect width={W} height={H} fill="url(#v2-space)" />
          <rect width={W} height={H} fill="url(#v2-neb1)" />
          <rect width={W} height={H} fill="url(#v2-neb2)" />
        </svg>
      </AbsoluteFill>

      {/* ═══ STAR FIELD ═══ */}
      <AbsoluteFill>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
          {bgStars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r}
              fill="#fff"
              opacity={(Math.sin(frame * 0.05 + s.phase) * 0.3 + 0.55) * 0.5} />
          ))}
        </svg>
      </AbsoluteFill>

      {/* ═══ MAIN SCENE ═══ */}
      <AbsoluteFill>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
          <defs>
            <filter id="v2-gsm"><feGaussianBlur stdDeviation="3" /></filter>
            <filter id="v2-gmd">
              <feGaussianBlur stdDeviation="6" result="b1" />
              <feGaussianBlur stdDeviation="14" in="SourceGraphic" result="b2" />
              <feMerge><feMergeNode in="b2" /><feMergeNode in="b1" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="v2-glg">
              <feGaussianBlur stdDeviation="18" result="b1" />
              <feGaussianBlur stdDeviation="6" in="SourceGraphic" result="b2" />
              <feMerge><feMergeNode in="b1" /><feMergeNode in="b2" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="v2-body">
              <feGaussianBlur stdDeviation="4" result="bl" />
              <feMerge><feMergeNode in="bl" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>

            {/* Figure body fill — builds energy over time */}
            <linearGradient id="v2-figfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#70D4F8" stopOpacity={0.04 + bodyEnergy * 0.28} />
              <stop offset="25%" stopColor="#E8D060" stopOpacity={0.06 + bodyEnergy * 0.32} />
              <stop offset="55%" stopColor="#50E8A8" stopOpacity={0.04 + bodyEnergy * 0.22} />
              <stop offset="85%" stopColor="#9070E8" stopOpacity={0.03 + bodyEnergy * 0.14} />
              <stop offset="100%" stopColor="#E06090" stopOpacity={0.02 + bodyEnergy * 0.08} />
            </linearGradient>

            {/* Heart core gradient */}
            <radialGradient id="v2-heart" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={coreOp * 0.8} />
              <stop offset="25%" stopColor="#F0E868" stopOpacity={coreOp * 0.6} />
              <stop offset="50%" stopColor="#50E0C0" stopOpacity={coreOp * 0.3} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            {/* Beam gradients */}
            {SIGNS.map((z, i) => {
              const rad = (z.angle * Math.PI) / 180;
              const sx = MX + Math.cos(rad) * ORBIT_RADIUS;
              const sy = MY + Math.sin(rad) * ORBIT_RADIUS;
              return (
                <linearGradient key={`v2bg-${i}`} id={`v2-beam-${i}`}
                  x1={sx} y1={sy} x2={MX} y2={BEAM_TARGET_Y}
                  gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={z.col} stopOpacity="0.9" />
                  <stop offset="50%" stopColor={z.col} stopOpacity="0.4" />
                  <stop offset="85%" stopColor={z.col} stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
                </linearGradient>
              );
            })}

            {/* Map glow */}
            <radialGradient id="v2-mapglow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F0C840" stopOpacity="0.1" />
              <stop offset="60%" stopColor="#5070E0" stopOpacity="0.05" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* ═══ ZODIAC CONSTELLATIONS ═══ */}
          {SIGNS.map((z, i) => {
            const rad = (z.angle * Math.PI) / 180;
            const cx = MX + Math.cos(rad) * ORBIT_RADIUS;
            const cy = MY + Math.sin(rad) * ORBIT_RADIUS;
            const delay = i * 3;
            const op = interpolate(frame, [delay, delay + 18], [0, 1],
              { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
            const pulse = Math.sin(frame * 0.045 + i * 0.52) * 0.12 + 0.88;
            const stars = STAR_PATTERNS[i];

            return (
              <g key={`zc-${i}`} opacity={op * starsIn}>
                {/* Nebula haze */}
                <circle cx={cx} cy={cy} r={55} fill={z.col}
                  opacity={0.05 * pulse} filter="url(#v2-gsm)" />
                {/* Stars + lines */}
                {stars.map((s, si) => (
                  <g key={si}>
                    <circle cx={cx + s[0] * 2} cy={cy + s[1] * 2} r={3.5}
                      fill={z.col} opacity={0.85 * pulse} filter="url(#v2-gsm)" />
                    {si > 0 && (
                      <line
                        x1={cx + stars[si - 1][0] * 2} y1={cy + stars[si - 1][1] * 2}
                        x2={cx + s[0] * 2} y2={cy + s[1] * 2}
                        stroke={z.col} strokeWidth={1.2} opacity={0.4 * pulse} />
                    )}
                  </g>
                ))}
                {/* Label */}
                <text x={cx} y={cy - 45} textAnchor="middle" fill={z.col}
                  fontSize={15} fontFamily="serif" letterSpacing={3}
                  opacity={0.6 * pulse}>
                  {z.name}
                </text>
              </g>
            );
          })}

          {/* ═══ ENERGY BEAMS → Heart ═══ */}
          {SIGNS.map((z, i) => {
            const rad = (z.angle * Math.PI) / 180;
            const sx = MX + Math.cos(rad) * ORBIT_RADIUS;
            const sy = MY + Math.sin(rad) * ORBIT_RADIUS;
            const bDelay = 40 + i * 3;
            const bOp = interpolate(frame, [bDelay, bDelay + 14], [0, 1],
              { extrapolateRight: "clamp", extrapolateLeft: "clamp" }) * beamHold;

            // Traveling particle
            const pCycle = frame > bDelay + 10 ? ((frame - bDelay) % 35) / 35 : 
              interpolate(frame, [bDelay + 5, bDelay + 28], [0, 1],
                { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
            const px = sx + (MX - sx) * pCycle;
            const py = sy + (BEAM_TARGET_Y - sy) * pCycle;

            return (
              <g key={`vb-${i}`}>
                {/* Wide glow */}
                <line x1={sx} y1={sy} x2={MX} y2={BEAM_TARGET_Y}
                  stroke={z.col} strokeWidth={10} strokeLinecap="round"
                  opacity={bOp * 0.12} filter="url(#v2-gmd)" />
                {/* Core beam */}
                <line x1={sx} y1={sy} x2={MX} y2={BEAM_TARGET_Y}
                  stroke={`url(#v2-beam-${i})`} strokeWidth={3.5}
                  strokeLinecap="round" opacity={bOp * 0.75} filter="url(#v2-gsm)" />
                {/* Inner bright */}
                <line x1={sx} y1={sy} x2={MX} y2={BEAM_TARGET_Y}
                  stroke="#ffffff" strokeWidth={1.2} strokeLinecap="round"
                  opacity={bOp * 0.2} />
                {/* Particle */}
                {bOp > 0.15 && (
                  <circle cx={px} cy={py} r={5.5}
                    fill={z.col} opacity={0.85} filter="url(#v2-gsm)" />
                )}
              </g>
            );
          })}

          {/* ═══ CHEST ENERGY CORE ═══ */}
          <circle cx={MX} cy={BEAM_TARGET_Y} r={coreR * 1.6}
            fill={`rgba(240,210,80,${coreOp * 0.12})`} filter="url(#v2-glg)" />
          <circle cx={MX} cy={BEAM_TARGET_Y} r={coreR * 0.7}
            fill={`rgba(255,255,255,${coreOp * 0.45})`} filter="url(#v2-gmd)" />
          <circle cx={MX} cy={BEAM_TARGET_Y}
            r={10 + climax * 18 + finalGlow * 8 + (isHold ? Math.sin(frame * 0.1) * 4 : 0)}
            fill="#ffffff" opacity={0.2 + coreOp * 0.5} filter="url(#v2-body)" />
          {/* Radiating spikes */}
          {(climax > 0.1 || isHold) && Array.from({ length: 14 }).map((_, ri) => {
            const a = (ri * (360 / 14) * Math.PI) / 180;
            const inner = 14;
            const outer = 30 + (climax + finalGlow) * 40 + (isHold ? Math.sin(frame * 0.07 + ri * 0.4) * 8 : 0);
            return (
              <line key={`ray-${ri}`}
                x1={MX + Math.cos(a) * inner} y1={BEAM_TARGET_Y + Math.sin(a) * inner}
                x2={MX + Math.cos(a) * outer} y2={BEAM_TARGET_Y + Math.sin(a) * outer}
                stroke="#F0E868" strokeWidth={1.5} strokeLinecap="round"
                opacity={(climax + finalGlow) * 0.3 * (Math.sin(frame * 0.05 + ri) * 0.3 + 0.7)} />
            );
          })}

          {/* ═══ HUMAN FIGURE — ALWAYS VISIBLE AFTER APPEAR, NEVER FADES ═══ */}
          <g opacity={figAppear} style={{
            filter: `drop-shadow(0 0 ${5 + bodyEnergy * 22}px rgba(90,210,250,${0.25 + bodyEnergy * 0.4}))`,
          }}>
            {/* Body fill */}
            {BODY_FILLS.map((p, pi) => (
              <path key={`bf-${pi}`} d={p} fill="url(#v2-figfill)" stroke="none" />
            ))}
            {/* Outline — all parts */}
            {BODY_STROKES.map((p, pi) => (
              <path key={`bo-${pi}`} d={p}
                fill="none" stroke="#60D8F0"
                strokeWidth={1 + bodyEnergy * 0.8}
                strokeOpacity={outlineGlow}
                strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {/* Torso highlight overlay */}
            <path d={UPPER_TORSO} fill="url(#v2-heart)" stroke="none" opacity={0.5} />
          </g>

          {/* ═══ INTERNAL ENERGY MERIDIANS ═══ */}
          {absorption > 0.1 && MERIDIANS.map((mp, mi) => {
            const mPulse = Math.sin(frame * 0.09 + mi * 1.4) * 0.3 + 0.7;
            const mColors = ["#60D8F0","#F0D040","#50E8A0","#A060E0","#E06888","#40D880","#E0A040","#C060D0"];
            return (
              <path key={`mer-${mi}`} d={mp}
                fill="none" stroke={mColors[mi % mColors.length]}
                strokeWidth={1.4 + climax * 0.6}
                strokeLinecap="round"
                opacity={absorption * 0.35 * mPulse * figAppear}
                filter="url(#v2-body)" />
            );
          })}

          {/* ═══ CHAKRA POINTS ═══ */}
          {absorption > 0.2 && CHAKRAS.map((ch, ci) => {
            const chPulse = Math.sin(frame * 0.08 + ci * 0.9) * 0.2 + 0.8;
            const chOp = absorption * 0.6 * chPulse * figAppear;
            return (
              <g key={`ch-${ci}`}>
                <circle cx={MX} cy={ch.y} r={ch.r + climax * 3}
                  fill={ch.color} opacity={chOp * 0.7} filter="url(#v2-gsm)" />
                <circle cx={MX} cy={ch.y} r={ch.r * 0.5}
                  fill="#ffffff" opacity={chOp * 0.5} />
              </g>
            );
          })}

          {/* ═══ ABSORPTION PULSE RINGS ═══ */}
          {absorption > 0 && [0, 1, 2].map((r) => {
            const ph = ((frame - 60) * 0.05 + r * 2.1) % (Math.PI * 2);
            const radius = 22 + Math.sin(ph) * 35 + r * 22;
            return (
              <circle key={`apr-${r}`} cx={MX} cy={BEAM_TARGET_Y} r={radius}
                fill="none" stroke="#F0E868" strokeWidth={1}
                opacity={absorption * 0.2 * (Math.sin(ph) * 0.5 + 0.5)} />
            );
          })}

          {/* ═══ FEET PLATFORM RINGS ═══ */}
          {figAppear > 0.5 && [0, 1, 2].map((r) => {
            const rr = 75 + r * 38;
            const rp = Math.sin(frame * 0.035 + r) * 0.2 + 0.5;
            return (
              <ellipse key={`fp-${r}`} cx={MX} cy={1220} rx={rr} ry={rr * 0.28}
                fill="none" stroke="#40D8E8" strokeWidth={1}
                opacity={figAppear * 0.18 * rp} />
            );
          })}

          {/* ═══ ASTROLOGICAL MAP — BELOW figure, NEVER replaces it ═══ */}
          {frame > 140 && (
            <g opacity={mapOp} transform={`translate(0, ${(1 - mapIn) * 180})`}>
              <ellipse cx={MX} cy={1500} rx={280} ry={200}
                fill="url(#v2-mapglow)" opacity={mapIn * 0.45} />
              <circle cx={MX} cy={1500} r={190 * mapIn}
                fill="none" stroke="#F0C840" strokeWidth={1.4} opacity={mapIn * 0.35} />
              <circle cx={MX} cy={1500} r={170 * mapIn}
                fill="none" stroke="#F0C840" strokeWidth={0.7} opacity={mapIn * 0.22} />
              <circle cx={MX} cy={1500} r={150 * mapIn}
                fill="none" stroke="#6080E0" strokeWidth={0.5} opacity={mapIn * 0.18} />
              {/* House lines */}
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i * 30 - 90) * Math.PI / 180;
                return (
                  <line key={`hl-${i}`}
                    x1={MX + Math.cos(a) * 45 * mapIn} y1={1500 + Math.sin(a) * 45 * mapIn}
                    x2={MX + Math.cos(a) * 190 * mapIn} y2={1500 + Math.sin(a) * 190 * mapIn}
                    stroke="#F0C840" strokeWidth={0.5} opacity={mapIn * 0.22} />
                );
              })}
              {/* Zodiac symbols on map rim */}
              {SIGNS.map((z, i) => {
                const a = (i * 30 - 75) * Math.PI / 180;
                const d = 168 * mapIn;
                const sOp = interpolate(frame, [150 + i * 2, 158 + i * 2], [0, 1],
                  { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
                return (
                  <text key={`ms-${i}`}
                    x={MX + Math.cos(a) * d} y={1500 + Math.sin(a) * d}
                    textAnchor="middle" dominantBaseline="central"
                    fill={z.col} fontSize={13} opacity={sOp * mapIn * 0.65}>
                    {z.sym}
                  </text>
                );
              })}
              <circle cx={MX} cy={1500} r={10 * mapIn}
                fill="#F0C840" opacity={mapIn * 0.18} filter="url(#v2-gsm)" />
            </g>
          )}
        </svg>
      </AbsoluteFill>

      {/* ═══ VIGNETTE ═══ */}
      <AbsoluteFill>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
          <defs>
            <radialGradient id="v2-vig" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="65%" stopColor="transparent" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
            </radialGradient>
          </defs>
          <rect width={W} height={H} fill="url(#v2-vig)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
