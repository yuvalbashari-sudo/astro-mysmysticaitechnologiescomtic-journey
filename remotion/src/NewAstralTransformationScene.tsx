import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

console.log("NEW ASTRAL SCENE ACTIVE");

const W = 1080;
const H = 1920;
const CENTER_X = W / 2;
const FIGURE_TOP = 360;
const FIGURE_BOTTOM = 1380;
const CHEST_Y = 710;
const MAP_Y = 1530;

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const polar = (radius: number, angleDeg: number, cx = CENTER_X, cy = 670) => {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  };
};

const zodiac = [
  { label: "ARIES", glyph: "♈", hue: 18, angle: -152 },
  { label: "TAURUS", glyph: "♉", hue: 42, angle: -124 },
  { label: "GEMINI", glyph: "♊", hue: 68, angle: -98 },
  { label: "CANCER", glyph: "♋", hue: 188, angle: -72 },
  { label: "LEO", glyph: "♌", hue: 220, angle: -46 },
  { label: "VIRGO", glyph: "♍", hue: 248, angle: -18 },
  { label: "LIBRA", glyph: "♎", hue: 284, angle: 18 },
  { label: "SCORPIO", glyph: "♏", hue: 320, angle: 46 },
  { label: "SAGITTARIUS", glyph: "♐", hue: 352, angle: 74 },
  { label: "CAPRICORN", glyph: "♑", hue: 160, angle: 102 },
  { label: "AQUARIUS", glyph: "♒", hue: 196, angle: 128 },
  { label: "PISCES", glyph: "♓", hue: 230, angle: 154 },
] as const;

const constellationPatterns: [number, number][][] = [
  [[0, 0], [18, -24], [42, -14], [30, 14], [56, 6]],
  [[0, 0], [20, -20], [10, 20], [28, 12], [-12, 26]],
  [[0, 0], [16, 24], [-16, 24], [22, -14], [-12, -20]],
  [[0, 0], [24, 10], [-20, 18], [14, -22], [34, -4]],
  [[0, 0], [28, -14], [16, 20], [-12, 22], [40, 16]],
  [[0, 0], [22, 18], [-22, 14], [20, -18], [-16, -20], [30, 30]],
  [[0, 0], [20, -18], [-18, -14], [28, 12], [-20, 20]],
  [[0, 0], [18, 24], [34, 20], [26, -14], [-10, 18]],
  [[0, 0], [-22, 18], [24, 12], [-18, -18], [16, -24]],
  [[0, 0], [24, -14], [-10, -24], [18, 18], [-22, 10]],
  [[0, 0], [28, 10], [-18, 18], [12, -22], [-22, -12]],
  [[0, 0], [22, 20], [-20, 22], [16, -12], [-14, -20]],
];

const meridians = [
  `M 540 440 C 540 560 540 660 540 780 C 540 900 540 1050 540 1240`,
  `M 540 705 C 506 700 474 704 438 720 C 408 744 390 786 378 846`,
  `M 540 705 C 574 700 606 704 642 720 C 672 744 690 786 702 846`,
  `M 540 860 C 518 910 500 990 488 1130 C 482 1190 478 1240 478 1294`,
  `M 540 860 C 562 910 580 990 592 1130 C 598 1190 602 1240 602 1294`,
  `M 468 714 C 500 692 520 684 540 684 C 560 684 580 692 612 714`,
  `M 510 520 C 522 512 532 508 540 508 C 548 508 558 512 570 520`,
  `M 500 806 C 516 794 530 790 540 790 C 550 790 564 794 580 806`,
];

const chakraPoints = [
  { y: 446, hue: 278, radius: 7 },
  { y: 508, hue: 228, radius: 6 },
  { y: 596, hue: 196, radius: 6 },
  { y: 706, hue: 152, radius: 8 },
  { y: 804, hue: 48, radius: 7 },
  { y: 892, hue: 24, radius: 6 },
  { y: 978, hue: 2, radius: 6 },
];

const AstralFigure = ({ frame }: { frame: number }) => {
  const { fps } = useVideoConfig();

  const materialize = spring({ frame: frame - 14, fps, config: { damping: 17, stiffness: 70, mass: 1.1 } });
  const beamAbsorption = interpolate(frame, [56, 132], [0, 1], clamp);
  const climax = interpolate(frame, [112, 172], [0, 1], clamp);
  const stableHold = frame >= 210 ? 1 : interpolate(frame, [160, 210], [0, 1], clamp);

  const glowIntensity = Math.min(1, materialize * 0.35 + beamAbsorption * 0.3 + climax * 0.35 + stableHold * 0.2);
  const figureOpacity = interpolate(materialize, [0, 1], [0, 1]);
  const energyLineOpacity = 0.1 + glowIntensity * 0.8;
  const chestCoreRadius = 26 + beamAbsorption * 34 + climax * 24;
  const outlineOpacity = 0.35 + glowIntensity * 0.55;
  const diagnosticOutlineOpacity = 0.22 + glowIntensity * 0.38 + stableHold * 0.18;

  return (
    <g opacity={figureOpacity}>
      <defs>
        <linearGradient id="new-astral-skin" x1="0" y1={FIGURE_TOP} x2="0" y2={FIGURE_BOTTOM} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(194 88% 82%)" stopOpacity={0.16 + glowIntensity * 0.16} />
          <stop offset="28%" stopColor="hsl(160 78% 72%)" stopOpacity={0.12 + glowIntensity * 0.18} />
          <stop offset="58%" stopColor="hsl(48 88% 74%)" stopOpacity={0.08 + glowIntensity * 0.16} />
          <stop offset="82%" stopColor="hsl(284 72% 72%)" stopOpacity={0.06 + glowIntensity * 0.12} />
          <stop offset="100%" stopColor="hsl(198 90% 86%)" stopOpacity={0.03 + glowIntensity * 0.08} />
        </linearGradient>
        <filter id="new-astral-soft">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="new-astral-glow">
          <feGaussianBlur stdDeviation="18" result="large" />
          <feGaussianBlur stdDeviation="7" in="SourceGraphic" result="small" />
          <feMerge>
            <feMergeNode in="large" />
            <feMergeNode in="small" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="new-astral-heart" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity={0.86} />
          <stop offset="35%" stopColor="hsl(50 92% 74%)" stopOpacity={0.58 + climax * 0.18} />
          <stop offset="65%" stopColor="hsl(170 76% 66%)" stopOpacity={0.24 + climax * 0.18} />
          <stop offset="100%" stopColor="hsl(170 76% 66%)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx={540} cy={430} rx={78} ry={96} fill="url(#new-astral-skin)" filter="url(#new-astral-soft)" />
      <path d="M 510 512 C 512 548 512 576 516 600 L 564 600 C 568 576 568 548 570 512 Z" fill="url(#new-astral-skin)" />
      <path
        d="M 412 580 C 456 534 624 534 668 580 C 664 666 650 748 626 830 C 610 880 586 930 540 978 C 494 930 470 880 454 830 C 430 748 416 666 412 580 Z"
        fill="url(#new-astral-skin)"
        filter="url(#new-astral-soft)"
      />
      <path
        d="M 470 932 C 492 968 510 1008 522 1060 C 532 1114 536 1186 536 1296 L 474 1296 C 476 1188 474 1108 462 1042 C 452 988 432 950 410 918 C 426 914 446 918 470 932 Z"
        fill="url(#new-astral-skin)"
        filter="url(#new-astral-soft)"
      />
      <path
        d="M 610 932 C 588 968 570 1008 558 1060 C 548 1114 544 1186 544 1296 L 606 1296 C 604 1188 606 1108 618 1042 C 628 988 648 950 670 918 C 654 914 634 918 610 932 Z"
        fill="url(#new-astral-skin)"
        filter="url(#new-astral-soft)"
      />
      <path
        d="M 422 596 C 392 660 376 738 370 836 C 366 896 364 948 364 998 C 364 1010 370 1018 380 1022 C 396 1028 414 1026 424 1010 C 432 998 432 978 432 950 C 432 862 438 784 448 716 C 456 664 472 620 492 588 C 468 582 444 584 422 596 Z"
        fill="url(#new-astral-skin)"
      />
      <path
        d="M 658 596 C 688 660 704 738 710 836 C 714 896 716 948 716 998 C 716 1010 710 1018 700 1022 C 684 1028 666 1026 656 1010 C 648 998 648 978 648 950 C 648 862 642 784 632 716 C 624 664 608 620 588 588 C 612 582 636 584 658 596 Z"
        fill="url(#new-astral-skin)"
      />

      <g fill="none" stroke="hsl(190 88% 84%)" opacity={outlineOpacity} strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx={540} cy={430} rx={78} ry={96} strokeWidth={3.6} filter="url(#new-astral-glow)" />
        <path d="M 510 512 C 512 548 512 576 516 600 L 564 600 C 568 576 568 548 570 512 Z" strokeWidth={3} />
        <path d="M 412 580 C 456 534 624 534 668 580 C 664 666 650 748 626 830 C 610 880 586 930 540 978 C 494 930 470 880 454 830 C 430 748 416 666 412 580 Z" strokeWidth={4.2} filter="url(#new-astral-glow)" />
        <path d="M 470 932 C 492 968 510 1008 522 1060 C 532 1114 536 1186 536 1296" strokeWidth={3.8} filter="url(#new-astral-glow)" />
        <path d="M 610 932 C 588 968 570 1008 558 1060 C 548 1114 544 1186 544 1296" strokeWidth={3.8} filter="url(#new-astral-glow)" />
        <path d="M 422 596 C 392 660 376 738 370 836 C 366 896 364 948 364 998" strokeWidth={3.6} filter="url(#new-astral-glow)" />
        <path d="M 658 596 C 688 660 704 738 710 836 C 714 896 716 948 716 998" strokeWidth={3.6} filter="url(#new-astral-glow)" />
      </g>

      <g fill="none" opacity={diagnosticOutlineOpacity} strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx={540} cy={430} rx={88} ry={108} stroke="hsl(188 100% 82%)" strokeWidth={8} filter="url(#new-astral-glow)" />
        <path d="M 412 580 C 456 534 624 534 668 580 C 664 666 650 748 626 830 C 610 880 586 930 540 978 C 494 930 470 880 454 830 C 430 748 416 666 412 580 Z" stroke="hsl(188 100% 82%)" strokeWidth={9.5} filter="url(#new-astral-glow)" />
        <path d="M 470 932 C 492 968 510 1008 522 1060 C 532 1114 536 1186 536 1296" stroke="hsl(188 100% 82%)" strokeWidth={8.5} filter="url(#new-astral-glow)" />
        <path d="M 610 932 C 588 968 570 1008 558 1060 C 548 1114 544 1186 544 1296" stroke="hsl(188 100% 82%)" strokeWidth={8.5} filter="url(#new-astral-glow)" />
        <path d="M 422 596 C 392 660 376 738 370 836 C 366 896 364 948 364 998" stroke="hsl(188 100% 82%)" strokeWidth={7.5} filter="url(#new-astral-glow)" />
        <path d="M 658 596 C 688 660 704 738 710 836 C 714 896 716 948 716 998" stroke="hsl(188 100% 82%)" strokeWidth={7.5} filter="url(#new-astral-glow)" />
      </g>

      <g fill="none" opacity={0.16 + climax * 0.25 + stableHold * 0.2} stroke="hsl(28 96% 72%)" strokeLinecap="round">
        <path d="M 540 446 C 530 520 520 594 540 706 C 558 806 558 888 540 978" strokeWidth={4.2} filter="url(#new-astral-glow)" />
        <path d="M 472 684 C 500 716 520 760 540 820 C 562 760 584 716 612 684" strokeWidth={3.2} filter="url(#new-astral-glow)" />
        <path d="M 470 940 C 500 976 520 1028 532 1106" strokeWidth={2.8} filter="url(#new-astral-glow)" />
        <path d="M 610 940 C 580 976 560 1028 548 1106" strokeWidth={2.8} filter="url(#new-astral-glow)" />
      </g>

      <g fill="none" strokeLinecap="round" opacity={energyLineOpacity}>
        {meridians.map((path, index) => (
          <path
            key={path}
            d={path}
            stroke={index === 0 ? "hsl(50 95% 78%)" : "hsl(184 92% 78%)"}
            strokeWidth={index === 0 ? 3.2 : 2.1}
            filter="url(#new-astral-glow)"
          />
        ))}
      </g>

      {chakraPoints.map((chakra) => (
        <g key={chakra.y}>
          <circle cx={540} cy={chakra.y} r={chakra.radius * 2.7} fill={`hsl(${chakra.hue} 92% 72% / 0.12)`} filter="url(#new-astral-glow)" />
          <circle cx={540} cy={chakra.y} r={chakra.radius} fill={`hsl(${chakra.hue} 92% 74%)`} />
        </g>
      ))}

      <circle cx={540} cy={CHEST_Y} r={chestCoreRadius * 1.8} fill="url(#new-astral-heart)" filter="url(#new-astral-glow)" opacity={0.26 + climax * 0.24 + stableHold * 0.14} />
      <circle cx={540} cy={CHEST_Y} r={chestCoreRadius} fill="url(#new-astral-heart)" opacity={0.56 + climax * 0.18} />
    </g>
  );
};

const AstrologicalMap = ({ frame }: { frame: number }) => {
  const reveal = interpolate(frame, [150, 205], [0, 1], clamp);
  const opacity = interpolate(frame, [150, 205], [0, 0.88], clamp);

  return (
    <g opacity={opacity} transform={`translate(0 ${28 - reveal * 28})`}>
      <defs>
        <radialGradient id="new-map-disk" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(48 92% 70%)" stopOpacity="0.12" />
          <stop offset="46%" stopColor="hsl(206 84% 68%)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="hsl(206 84% 68%)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={CENTER_X} cy={MAP_Y} r={230} fill="url(#new-map-disk)" />
      {[250, 202, 154, 106].map((radius) => (
        <circle key={radius} cx={CENTER_X} cy={MAP_Y} r={radius} fill="none" stroke="hsl(190 54% 74% / 0.3)" strokeWidth={radius === 250 ? 2.4 : 1.2} />
      ))}
      {Array.from({ length: 24 }, (_, index) => {
        const { x, y } = polar(250, index * 15 - 90, CENTER_X, MAP_Y);
        const inner = polar(106, index * 15 - 90, CENTER_X, MAP_Y);
        return <line key={index} x1={inner.x} y1={inner.y} x2={x} y2={y} stroke="hsl(192 60% 74% / 0.28)" strokeWidth={index % 2 === 0 ? 1.4 : 0.8} />;
      })}
      {zodiac.map((sign) => {
        const point = polar(278, sign.angle - 90, CENTER_X, MAP_Y);
        return (
          <text
            key={sign.label}
            x={point.x}
            y={point.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={`hsl(${sign.hue} 86% 74%)`}
            fontFamily="serif"
            fontSize={30}
            opacity={0.82}
          >
            {sign.glyph}
          </text>
        );
      })}
    </g>
  );
};

export const NewAstralTransformationScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const starsAppear = interpolate(frame, [0, 40], [0, 1], clamp);
  const beamAppear = interpolate(frame, [32, 84], [0, 1], clamp);
  const beamFade = frame < 150 ? 1 : interpolate(frame, [150, 210], [1, 0.22], clamp);
  const figureLift = spring({ frame: frame - 10, fps, config: { damping: 18, stiffness: 60, mass: 1.2 } });
  const backgroundGlow = interpolate(frame, [88, 172], [0.14, 0.38], clamp);
  const holdState = frame >= 210;
  const finalStateLabel = interpolate(frame, [180, 220], [0, 1], clamp);

  const backgroundStars = Array.from({ length: 120 }, (_, index) => ({
    x: (index * 137.3) % W,
    y: (index * 91.7 + index * index * 1.9) % H,
    r: index % 7 === 0 ? 2.4 : index % 3 === 0 ? 1.6 : 1,
    alpha: 0.18 + ((index * 17) % 10) / 50,
  }));

  return (
    <AbsoluteFill style={{ background: "hsl(232 56% 5%)" }}>
      <AbsoluteFill>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
          <defs>
            <radialGradient id="new-scene-bg" cx="50%" cy="34%" r="72%">
              <stop offset="0%" stopColor="hsl(226 54% 17%)" />
              <stop offset="54%" stopColor="hsl(230 56% 9%)" />
              <stop offset="100%" stopColor="hsl(234 58% 4%)" />
            </radialGradient>
            <radialGradient id="new-aura-left" cx="20%" cy="30%" r="34%">
              <stop offset="0%" stopColor="hsl(284 86% 62% / 0.22)" />
              <stop offset="100%" stopColor="hsl(284 86% 62% / 0)" />
            </radialGradient>
            <radialGradient id="new-aura-right" cx="78%" cy="46%" r="38%">
              <stop offset="0%" stopColor="hsl(194 90% 64% / 0.18)" />
              <stop offset="100%" stopColor="hsl(194 90% 64% / 0)" />
            </radialGradient>
            {zodiac.map((sign) => {
              const origin = polar(488, sign.angle);
              return (
                <linearGradient
                  key={sign.label}
                  id={`new-beam-${sign.label}`}
                  x1={origin.x}
                  y1={origin.y}
                  x2={CENTER_X}
                  y2={CHEST_Y}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor={`hsl(${sign.hue} 88% 68%)`} stopOpacity="0.94" />
                  <stop offset="52%" stopColor={`hsl(${sign.hue} 88% 68%)`} stopOpacity="0.36" />
                  <stop offset="100%" stopColor="hsl(0 0% 100%)" stopOpacity="0.18" />
                </linearGradient>
              );
            })}
          </defs>

          <rect width={W} height={H} fill="url(#new-scene-bg)" />
          <rect width={W} height={H} fill="url(#new-aura-left)" />
          <rect width={W} height={H} fill="url(#new-aura-right)" />
          <circle cx={CENTER_X} cy={730} r={360} fill={`hsl(190 90% 70% / ${backgroundGlow})`} opacity={0.18 + backgroundGlow * 0.35} />

          {backgroundStars.map((star, index) => (
            <circle key={index} cx={star.x} cy={star.y} r={star.r} fill="hsl(0 0% 100%)" opacity={star.alpha} />
          ))}

          {zodiac.map((sign, index) => {
            const origin = polar(488, sign.angle);
            const pattern = constellationPatterns[index];
            const reveal = interpolate(frame, [index * 3, index * 3 + 18], [0, 1], clamp) * starsAppear;
            return (
              <g key={sign.label} opacity={reveal}>
                <circle cx={origin.x} cy={origin.y} r={52} fill={`hsl(${sign.hue} 84% 66% / 0.07)`} />
                {pattern.map((point, pointIndex) => (
                  <g key={`${sign.label}-${pointIndex}`}>
                    <circle cx={origin.x + point[0] * 2} cy={origin.y + point[1] * 2} r={3.5} fill={`hsl(${sign.hue} 88% 70%)`} opacity={0.94} />
                    {pointIndex > 0 ? (
                      <line
                        x1={origin.x + pattern[pointIndex - 1][0] * 2}
                        y1={origin.y + pattern[pointIndex - 1][1] * 2}
                        x2={origin.x + point[0] * 2}
                        y2={origin.y + point[1] * 2}
                        stroke={`hsl(${sign.hue} 82% 72% / 0.48)`}
                        strokeWidth={1.4}
                      />
                    ) : null}
                  </g>
                ))}
                <text x={origin.x} y={origin.y - 48} fill={`hsl(${sign.hue} 88% 74%)`} textAnchor="middle" fontFamily="serif" fontSize={16} letterSpacing={3} opacity={0.78}>
                  {sign.label}
                </text>
              </g>
            );
          })}

          {zodiac.map((sign, index) => {
            const origin = polar(488, sign.angle);
            const reveal = interpolate(frame, [38 + index * 2, 54 + index * 2], [0, 1], clamp) * beamAppear * beamFade;
            const pulse = holdState ? 0.22 : 0.75;

            return (
              <g key={`beam-${sign.label}`} opacity={reveal}>
                <line
                  x1={origin.x}
                  y1={origin.y}
                  x2={CENTER_X}
                  y2={CHEST_Y}
                  stroke={`hsl(${sign.hue} 88% 68% / ${0.14 + pulse * 0.16})`}
                  strokeWidth={10}
                  strokeLinecap="round"
                />
                <line
                  x1={origin.x}
                  y1={origin.y}
                  x2={CENTER_X}
                  y2={CHEST_Y}
                  stroke={`url(#new-beam-${sign.label})`}
                  strokeWidth={4.2}
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          <AstrologicalMap frame={frame} />

          <g transform={`translate(0 ${18 - figureLift * 18})`}>
            <AstralFigure frame={frame} />
          </g>
        </svg>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          top: 320,
          right: 120,
          padding: "8px 12px",
          borderRadius: 999,
          background: "hsl(230 30% 12% / 0.85)",
          color: "hsl(188 100% 82%)",
          border: "1px solid hsl(188 100% 82% / 0.5)",
          fontFamily: "system-ui, sans-serif",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: 1.2,
          zIndex: 10,
          boxShadow: "0 0 30px hsl(188 100% 82% / 0.25)",
        }}
      >
        NEW ASTRAL SCENE ACTIVE
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 220,
          transform: `translateX(-50%) translateY(${18 - finalStateLabel * 18}px)`,
          opacity: finalStateLabel,
          padding: "10px 18px",
          borderRadius: 999,
          background: "hsl(230 28% 10% / 0.88)",
          color: "hsl(28 96% 72%)",
          border: "1px solid hsl(28 96% 72% / 0.45)",
          fontFamily: "system-ui, sans-serif",
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: 1.4,
          zIndex: 10,
          boxShadow: "0 0 36px hsl(28 96% 72% / 0.2)",
          whiteSpace: "nowrap",
        }}
      >
        FINAL FIGURE SHOULD STILL BE VISIBLE
      </div>
    </AbsoluteFill>
  );
};