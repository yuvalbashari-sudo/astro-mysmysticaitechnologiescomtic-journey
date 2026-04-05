const zodiacGlyphs = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

const polarToCartesian = (cx: number, cy: number, radius: number, angle: number) => {
  const radians = (angle - 90) * (Math.PI / 180);
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
};

const AlwaysVisibleNatalChart = () => {
  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 178;
  const innerRadius = 110;
  const planetRadius = 84;
  const fallbackPlanets = [
    { symbol: "☉", angle: 20 },
    { symbol: "☽", angle: 74 },
    { symbol: "☿", angle: 118 },
    { symbol: "♀", angle: 156 },
    { symbol: "♂", angle: 210 },
    { symbol: "♃", angle: 258 },
    { symbol: "♄", angle: 302 },
  ];

  return (
    <section
      dir="rtl"
      className="w-full"
      style={{
        minHeight: 400,
        width: "100%",
        display: "block",
        position: "relative",
        overflow: "visible",
        background: "hsl(var(--background))",
        borderBottom: "1px solid hsl(var(--border))",
        zIndex: 999,
      }}
    >
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: 760,
          minHeight: 400,
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          overflow: "visible",
        }}
      >
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "hsl(var(--destructive-foreground))",
            background: "hsl(var(--destructive))",
            padding: "10px 14px",
            borderRadius: 8,
          }}
        >
          CHART IS RENDERING
        </div>

        <div
          className="w-full"
          style={{
            minHeight: 400,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "visible",
          }}
        >
          <svg
            viewBox={`0 0 ${size} ${size}`}
            width={size}
            height={size}
            role="img"
            aria-label="Natal chart fallback wheel"
            style={{
              display: "block",
              width: "min(100%, 420px)",
              height: "auto",
              minHeight: 400,
              overflow: "visible",
            }}
          >
            <rect x="0" y="0" width={size} height={size} fill="hsl(var(--card))" rx="24" />
            <circle cx={cx} cy={cy} r={outerRadius} fill="none" stroke="hsl(var(--primary))" strokeWidth="3" />
            <circle cx={cx} cy={cy} r={innerRadius} fill="none" stroke="hsl(var(--accent))" strokeWidth="2" />
            <circle cx={cx} cy={cy} r={40} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" />

            {Array.from({ length: 12 }).map((_, index) => {
              const angle = index * 30;
              const lineStart = polarToCartesian(cx, cy, innerRadius, angle);
              const lineEnd = polarToCartesian(cx, cy, outerRadius, angle);
              const label = polarToCartesian(cx, cy, 145, angle + 15);

              return (
                <g key={index}>
                  <line
                    x1={lineStart.x}
                    y1={lineStart.y}
                    x2={lineEnd.x}
                    y2={lineEnd.y}
                    stroke="hsl(var(--border))"
                    strokeWidth="1.5"
                  />
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="24"
                    fill="hsl(var(--foreground))"
                  >
                    {zodiacGlyphs[index]}
                  </text>
                </g>
              );
            })}

            {fallbackPlanets.map((planet) => {
              const point = polarToCartesian(cx, cy, planetRadius, planet.angle);
              return (
                <g key={planet.symbol}>
                  <circle cx={point.x} cy={point.y} r="18" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="2" />
                  <text
                    x={point.x}
                    y={point.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="18"
                    fill="hsl(var(--foreground))"
                  >
                    {planet.symbol}
                  </text>
                </g>
              );
            })}

            <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="700" fill="hsl(var(--primary))">
              גלגל אסטרולוגי
            </text>
            <text x={cx} y={cy + 18} textAnchor="middle" fontSize="13" fill="hsl(var(--muted-foreground))">
              Visible fallback chart
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default AlwaysVisibleNatalChart;