// Charts SVG maison — pas de dépendance externe, rendu serveur.

export function AreaChart({
  data,
  height = 180,
  className = "",
}: {
  data: number[];
  height?: number;
  className?: string;
}) {
  const width = 640;
  const pad = 8;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = (width - pad * 2) / (data.length - 1);

  const points = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (d - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });

  const line = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${points[points.length - 1][0].toFixed(1)},${height} L${pad},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full ${className}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Évolution des tâches automatisées"
    >
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaFill)" />
      <path
        d={line}
        fill="none"
        stroke="var(--brand)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === points.length - 1 ? 4 : 0} fill="var(--brand)" />
      ))}
    </svg>
  );
}

export function Donut({
  data,
  size = 168,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const stroke = 20;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={stroke}
        />
        {data.map((d, i) => {
          const len = (d.value / total) * c;
          const seg = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
          offset += len;
          return seg;
        })}
      </svg>
      <ul className="space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: d.color }}
            />
            <span className="text-foreground">{d.label}</span>
            <span className="ml-auto text-muted">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
