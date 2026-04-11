import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";

/* ═══════════════════════════════════════════════════════
   Cinematic Astrology Promo Ad — Pure Visual (No Text)
   6 seconds @ 30fps = 180 frames
   Scene 1: 0–60   Space + constellation activation + beams
   Scene 2: 60–120 Energy absorption + climax hold
   Scene 3: 120–180 Map emergence + clean reveal
   ═══════════════════════════════════════════════════════ */

const ZODIAC = [
  { symbol: "♈", color: "#E05252", x: 540, y: 180 },
  { symbol: "♉", color: "#7FD4A8", x: 200, y: 250 },
  { symbol: "♊", color: "#F5C842", x: 880, y: 250 },
  { symbol: "♋", color: "#D0D6E0", x: 120, y: 420 },
  { symbol: "♌", color: "#F5C842", x: 960, y: 420 },
  { symbol: "♍", color: "#7FD4A8", x: 100, y: 620 },
  { symbol: "♎", color: "#F28DC7", x: 980, y: 620 },
  { symbol: "♏", color: "#9060B8", x: 160, y: 800 },
  { symbol: "♐", color: "#E05252", x: 920, y: 800 },
  { symbol: "♑", color: "#C4A86C", x: 250, y: 350 },
  { symbol: "♒", color: "#5FC8E8", x: 830, y: 350 },
  { symbol: "♓", color: "#6070E8", x: 540, y: 130 },
];

const FIGURE_CX = 540;
const FIGURE_CY = 1200;

// Human silhouette path scaled for 1080x1920
const SILHOUETTE = `
M 540,1020 C 540,1020 530,995 540,985 C 550,975 560,995 560,1020
C 563,1030 567,1040 567,1055 C 567,1070 562,1078 557,1085
L 580,1130 L 600,1230 L 590,1233 L 570,1155 L 565,1230
L 585,1400 L 575,1403 L 555,1245 L 550,1403 L 540,1400
L 545,1245 L 535,1403 L 525,1400 L 545,1230 L 538,1155
L 520,1233 L 510,1230 L 530,1130 L 553,1085
C 548,1078 543,1070 543,1055 C 543,1040 547,1030 540,1020 Z`;

export const PromoAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene 1: Constellation activation (0–60) ──
  const constellationProgress = interpolate(frame, [0, 50], [0, 1], { extrapolateRight: "clamp" });
  const beamProgress = interpolate(frame, [20, 55], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // ── Scene 2: Absorption + climax (60–120) ──
  const absorptionRamp = interpolate(frame, [55, 80], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const climaxIntensity = interpolate(frame, [75, 90], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const climaxHold = interpolate(frame, [90, 120], [1, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const beamFade = interpolate(frame, [60, 85], [1, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // ── Scene 3: Map emergence (120–180) ──
  const mapReveal = spring({ frame: frame - 125, fps, config: { damping: 30, stiffness: 80 } });
  const mapOpacity = interpolate(frame, [125, 145], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Background pulse
  const bgPulse = Math.sin(frame * 0.03) * 0.03 + 1;

  // Climax glow radius
  const glowR = 80 + climaxIntensity * 120 + Math.sin(frame * 0.1) * 10 * climaxIntensity;
  const coreGlowOpacity = 0.1 + climaxIntensity * 0.6;

  // Star field
  const stars = Array.from({ length: 80 }, (_, i) => ({
    x: ((i * 137.5) % 1080),
    y: ((i * 97.3 + i * i * 3.7) % 1920),
    r: (i % 3 === 0) ? 2 : 1,
    twinklePhase: i * 0.7,
  }));

  return (
    <AbsoluteFill style={{ backgroundColor: "#05081a" }}>
      {/* Deep space background gradient */}
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs>
            <radialGradient id="space-bg" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#0d1535" />
              <stop offset="50%" stopColor="#080e28" />
              <stop offset="100%" stopColor="#030510" />
            </radialGradient>
            <radialGradient id="nebula1" cx="30%" cy="25%" r="40%">
              <stop offset="0%" stopColor="#1a0a3a" stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <radialGradient id="nebula2" cx="70%" cy="60%" r="35%">
              <stop offset="0%" stopColor="#0a1a3a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <rect width="1080" height="1920" fill="url(#space-bg)" />
          <rect width="1080" height="1920" fill="url(#nebula1)" />
          <rect width="1080" height="1920" fill="url(#nebula2)" />
        </svg>
      </AbsoluteFill>

      {/* Star field */}
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          {stars.map((s, i) => {
            const twinkle = Math.sin(frame * 0.08 + s.twinklePhase) * 0.4 + 0.6;
            return (
              <circle
                key={i}
                cx={s.x}
                cy={s.y}
                r={s.r}
                fill="#ffffff"
                opacity={twinkle * 0.7}
              />
            );
          })}
        </svg>
      </AbsoluteFill>

      {/* Main scene SVG */}
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs>
            {/* Glow filters */}
            <filter id="beam-glow">
              <feGaussianBlur stdDeviation="6" result="b1" />
              <feGaussianBlur stdDeviation="12" in="SourceGraphic" result="b2" />
              <feMerge>
                <feMergeNode in="b2" />
                <feMergeNode in="b1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="constellation-glow">
              <feGaussianBlur stdDeviation="4" />
            </filter>
            <filter id="climax-glow">
              <feGaussianBlur stdDeviation="25" result="b1" />
              <feGaussianBlur stdDeviation="12" in="SourceGraphic" result="b2" />
              <feMerge>
                <feMergeNode in="b1" />
                <feMergeNode in="b2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="body-glow">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Silhouette fill */}
            <linearGradient id="sil-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5C842" stopOpacity={0.1 + absorptionRamp * 0.3 + climaxIntensity * 0.5} />
              <stop offset="40%" stopColor="#F5C842" stopOpacity={0.15 + absorptionRamp * 0.4 + climaxIntensity * 0.6} />
              <stop offset="70%" stopColor="#7B8FE8" stopOpacity={0.08 + absorptionRamp * 0.2 + climaxIntensity * 0.3} />
              <stop offset="100%" stopColor="#F5C842" stopOpacity={0.02} />
            </linearGradient>

            {/* Climax radial */}
            <radialGradient id="climax-radial" cx="50%" cy="62%" r="20%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.4 * climaxIntensity} />
              <stop offset="25%" stopColor="#F5C842" stopOpacity={0.7 * climaxIntensity} />
              <stop offset="60%" stopColor="#7B8FE8" stopOpacity={0.3 * climaxIntensity} />
              <stop offset="100%" stopColor="#F5C842" stopOpacity={0} />
            </radialGradient>

            {/* Map gradient */}
            <radialGradient id="map-glow" cx="50%" cy="35%" r="50%">
              <stop offset="0%" stopColor="#F5C842" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#7B8FE8" stopOpacity="0.08" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            {/* Beam gradients */}
            {ZODIAC.map((z, i) => (
              <linearGradient
                key={`bg-${i}`}
                id={`beam-${i}`}
                x1={z.x} y1={z.y}
                x2={FIGURE_CX} y2={FIGURE_CY - 100}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={z.color} stopOpacity="0.9" />
                <stop offset="50%" stopColor={z.color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={z.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {/* ─── Constellation symbols ─── */}
          {ZODIAC.map((z, i) => {
            const activationDelay = i * (45 / ZODIAC.length);
            const symbolOpacity = interpolate(frame, [activationDelay, activationDelay + 12], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
            const symbolScale = interpolate(frame, [activationDelay, activationDelay + 10], [0.3, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
            const symbolPulse = Math.sin(frame * 0.06 + i * 0.5) * 0.15 + 0.85;

            return (
              <g key={`const-${i}`}>
                {/* Glow behind symbol */}
                <circle
                  cx={z.x} cy={z.y}
                  r={18 * symbolScale}
                  fill={z.color}
                  opacity={symbolOpacity * 0.3 * symbolPulse}
                  filter="url(#constellation-glow)"
                />
                {/* Symbol circle */}
                <circle
                  cx={z.x} cy={z.y}
                  r={14 * symbolScale}
                  fill={z.color}
                  opacity={symbolOpacity * 0.2}
                />
                {/* Symbol text */}
                <text
                  x={z.x} y={z.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize={20 * symbolScale}
                  fontWeight="bold"
                  opacity={symbolOpacity * symbolPulse}
                >
                  {z.symbol}
                </text>
                {/* Decorative dots around symbol */}
                {[0, 90, 180, 270].map((angle) => {
                  const rad = (angle * Math.PI) / 180;
                  const dist = 22 * symbolScale;
                  return (
                    <circle
                      key={angle}
                      cx={z.x + Math.cos(rad) * dist}
                      cy={z.y + Math.sin(rad) * dist}
                      r={1.5}
                      fill={z.color}
                      opacity={symbolOpacity * 0.5}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* ─── Beams from constellations to figure ─── */}
          {ZODIAC.map((z, i) => {
            const beamDelay = 20 + i * (30 / ZODIAC.length);
            const beamOpacity = interpolate(frame, [beamDelay, beamDelay + 8], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }) * beamFade;
            const influence = (12 - i) / 12;

            return (
              <g key={`beam-${i}`}>
                <line
                  x1={z.x} y1={z.y}
                  x2={FIGURE_CX} y2={FIGURE_CY - 100}
                  stroke={`url(#beam-${i})`}
                  strokeWidth={3 + influence * 5}
                  strokeLinecap="round"
                  opacity={beamOpacity}
                  filter="url(#beam-glow)"
                />
                {/* Traveling particle */}
                {beamOpacity > 0.3 && (() => {
                  const particleT = interpolate(frame, [beamDelay + 5, beamDelay + 25], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
                  const px = z.x + (FIGURE_CX - z.x) * particleT;
                  const py = z.y + (FIGURE_CY - 100 - z.y) * particleT;
                  const pOpacity = particleT < 0.9 ? 1 : interpolate(particleT, [0.9, 1], [1, 0]);
                  return (
                    <circle
                      cx={px} cy={py}
                      r={4 + influence * 3}
                      fill={z.color}
                      opacity={pOpacity * beamOpacity}
                      filter="url(#constellation-glow)"
                    />
                  );
                })()}
              </g>
            );
          })}

          {/* ─── Absorption pulse rings ─── */}
          {absorptionRamp > 0 && [0, 1, 2].map((ring) => {
            const pulsePhase = ((frame - 55) * 0.04 + ring * 2.1) % (Math.PI * 2);
            const pulseR = 20 + Math.sin(pulsePhase) * 50 + ring * 30;
            return (
              <circle
                key={`pulse-${ring}`}
                cx={FIGURE_CX} cy={FIGURE_CY - 80}
                r={pulseR}
                fill="none"
                stroke="#F5C842"
                strokeWidth={1}
                opacity={absorptionRamp * 0.3 * (Math.sin(pulsePhase) * 0.5 + 0.5)}
              />
            );
          })}

          {/* ─── Energy veins during absorption ─── */}
          {absorptionRamp > 0.2 && [-15, 0, 15].map((offset, vi) => {
            const veinPulse = Math.sin(frame * 0.12 + vi * 1.2) * 0.3 + 0.7;
            return (
              <line
                key={`vein-${vi}`}
                x1={FIGURE_CX + offset} y1={FIGURE_CY - 180}
                x2={FIGURE_CX + offset} y2={FIGURE_CY + 50}
                stroke="#F5C842"
                strokeWidth={1.5}
                opacity={absorptionRamp * 0.35 * veinPulse}
                filter="url(#body-glow)"
              />
            );
          })}

          {/* ─── Climax mega glow ─── */}
          {climaxIntensity > 0 && (
            <>
              <circle
                cx={FIGURE_CX} cy={FIGURE_CY - 70}
                r={glowR}
                fill="url(#climax-radial)"
                filter="url(#climax-glow)"
                opacity={coreGlowOpacity}
              />
              {/* Inner white-hot core */}
              <circle
                cx={FIGURE_CX} cy={FIGURE_CY - 80}
                r={15 + climaxIntensity * 25 + Math.sin(frame * 0.15) * 5 * climaxIntensity}
                fill="#ffffff"
                opacity={0.2 + climaxIntensity * 0.5}
                filter="url(#body-glow)"
              />
              {/* Core ring */}
              <circle
                cx={FIGURE_CX} cy={FIGURE_CY - 80}
                r={25 + climaxIntensity * 18 + Math.sin(frame * 0.1) * 4}
                fill="none"
                stroke="#F5C842"
                strokeWidth={2.5}
                opacity={climaxIntensity * 0.7}
                filter="url(#constellation-glow)"
              />
              {/* Radiating lines from core */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
                const rad = ((angle - 90) * Math.PI) / 180;
                const innerR = 20;
                const outerR = 50 + climaxIntensity * 40 + Math.sin(frame * 0.08 + angle * 0.02) * 8;
                return (
                  <line
                    key={`ray-${angle}`}
                    x1={FIGURE_CX + Math.cos(rad) * innerR}
                    y1={FIGURE_CY - 80 + Math.sin(rad) * innerR}
                    x2={FIGURE_CX + Math.cos(rad) * outerR}
                    y2={FIGURE_CY - 80 + Math.sin(rad) * outerR}
                    stroke="#F5C842"
                    strokeWidth={2}
                    strokeLinecap="round"
                    opacity={climaxIntensity * (Math.sin(frame * 0.06 + angle * 0.05) * 0.3 + 0.5)}
                  />
                );
              })}
            </>
          )}

          {/* ─── Human silhouette ─── */}
          <path
            d={SILHOUETTE}
            fill="url(#sil-fill)"
            stroke="#F5C842"
            strokeWidth={1 + climaxIntensity * 0.8}
            strokeOpacity={0.3 + absorptionRamp * 0.3 + climaxIntensity * 0.4}
            style={{
              filter: `drop-shadow(0 0 ${8 + absorptionRamp * 12 + climaxIntensity * 25}px rgba(245,200,66,${0.3 + climaxIntensity * 0.4}))`,
            }}
          />

          {/* Heart glow */}
          {absorptionRamp > 0.1 && (
            <circle
              cx={FIGURE_CX} cy={FIGURE_CY - 120}
              r={8 + absorptionRamp * 10 + Math.sin(frame * 0.15) * 3 * absorptionRamp}
              fill="#F5C842"
              opacity={absorptionRamp * 0.35}
              filter="url(#body-glow)"
            />
          )}

          {/* ─── Astrological map emergence (Scene 3) ─── */}
          {frame > 120 && (
            <g opacity={mapOpacity} transform={`translate(0, ${(1 - mapReveal) * 200})`}>
              {/* Map background glow */}
              <ellipse
                cx={FIGURE_CX} cy={1550}
                rx={350} ry={250}
                fill="url(#map-glow)"
                opacity={mapReveal * 0.6}
              />

              {/* Outer zodiac ring */}
              <circle
                cx={FIGURE_CX} cy={1550}
                r={220 * mapReveal}
                fill="none"
                stroke="#F5C842"
                strokeWidth={1.5}
                opacity={mapReveal * 0.5}
              />
              <circle
                cx={FIGURE_CX} cy={1550}
                r={200 * mapReveal}
                fill="none"
                stroke="#F5C842"
                strokeWidth={0.8}
                opacity={mapReveal * 0.3}
              />
              <circle
                cx={FIGURE_CX} cy={1550}
                r={180 * mapReveal}
                fill="none"
                stroke="#7B8FE8"
                strokeWidth={0.5}
                opacity={mapReveal * 0.25}
              />

              {/* House divisions */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 - 90) * (Math.PI / 180);
                const innerR = 60 * mapReveal;
                const outerR = 220 * mapReveal;
                return (
                  <line
                    key={`house-${i}`}
                    x1={FIGURE_CX + Math.cos(angle) * innerR}
                    y1={1550 + Math.sin(angle) * innerR}
                    x2={FIGURE_CX + Math.cos(angle) * outerR}
                    y2={1550 + Math.sin(angle) * outerR}
                    stroke="#F5C842"
                    strokeWidth={0.5}
                    opacity={mapReveal * 0.3}
                  />
                );
              })}

              {/* Zodiac symbols on the map */}
              {ZODIAC.map((z, i) => {
                const angle = (i * 30 - 75) * (Math.PI / 180);
                const dist = 195 * mapReveal;
                const symbolDelay = interpolate(frame, [130 + i * 2, 135 + i * 2], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
                return (
                  <text
                    key={`map-sym-${i}`}
                    x={FIGURE_CX + Math.cos(angle) * dist}
                    y={1550 + Math.sin(angle) * dist}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={z.color}
                    fontSize={14}
                    opacity={symbolDelay * mapReveal * 0.8}
                  >
                    {z.symbol}
                  </text>
                );
              })}

              {/* Inner decorative cross */}
              <line x1={FIGURE_CX} y1={1550 - 50 * mapReveal} x2={FIGURE_CX} y2={1550 + 50 * mapReveal}
                stroke="#F5C842" strokeWidth={0.5} opacity={mapReveal * 0.2} />
              <line x1={FIGURE_CX - 50 * mapReveal} y1={1550} x2={FIGURE_CX + 50 * mapReveal} y2={1550}
                stroke="#F5C842" strokeWidth={0.5} opacity={mapReveal * 0.2} />

              {/* Center glow of map */}
              <circle
                cx={FIGURE_CX} cy={1550}
                r={15 * mapReveal}
                fill="#F5C842"
                opacity={mapReveal * 0.2}
                filter="url(#constellation-glow)"
              />
            </g>
          )}
        </svg>
      </AbsoluteFill>

      {/* Vignette overlay */}
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs>
            <radialGradient id="vignette" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="70%" stopColor="transparent" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
            </radialGradient>
          </defs>
          <rect width="1080" height="1920" fill="url(#vignette)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
