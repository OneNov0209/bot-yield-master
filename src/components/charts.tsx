import { ReactNode } from "react";

type Datum = { name: string; value: number };

const COLORS = ["#22c55e", "#4ade80", "#a3e635", "#f59e0b", "#ef4444"];

export function ChartFrame({
  title,
  subtitle,
  children,
  empty,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  empty?: string | undefined;
}) {
  return (
    <div className="panel card-3d p-5">
      <h3 className="font-display text-sm">{title}</h3>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-4 h-60">
        {empty ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-xs text-muted-foreground">
            {empty}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

/** Donut (with inner radius) or full pie when donut={false}. */
export function SharePie({ data, donut = true }: { data: Datum[] | Record<string, number>; donut?: boolean }) {
  const list: Datum[] = Array.isArray(data)
    ? data.filter((d) => Number.isFinite(d.value) && d.value > 0)
    : Object.entries(data)
        .filter(([, v]) => Number.isFinite(v) && v > 0)
        .map(([name, value]) => ({ name, value }));

  const total = list.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return <p className="text-center text-sm text-muted-foreground">No data</p>;
  }

  const slices: { name: string; pct: number; from: number; to: number; color: string }[] = [];
  let cursor = 0;
  list.forEach((d, i) => {
    const pct = (d.value / total) * 100;
    slices.push({
      name: d.name,
      pct,
      from: cursor,
      to: cursor + pct,
      color: COLORS[i % COLORS.length] ?? "#22c55e",
    });
    cursor += pct;
  });

  return (
    <div className="flex h-full flex-wrap items-center justify-center gap-4">
      <div
        className="flex h-28 w-28 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${slices
            .map((s) => `${s.color} ${s.from}% ${s.to}%`)
            .join(", ")})`,
        }}
      >
        {donut && (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card text-xs text-muted-foreground">
            {total.toFixed(2)}
          </div>
        )}
      </div>
      <div className="space-y-1">
        {slices.map((s) => (
          <div key={s.name} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span>{s.name}</span>
            <span className="text-muted-foreground">{s.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityLine({
  data,
  label,
}: {
  data: { time: string; value: number }[];
  label: string;
}) {
  const points = (data ?? []).filter((d) => Number.isFinite(d.value));
  if (points.length === 0) {
    return <p className="text-center text-sm text-muted-foreground">No activity to plot yet.</p>;
  }

  const values = points.map((d) => d.value);
  const rawMax = Math.max(...values, 0);
  const rawMin = Math.min(...values, 0);
  const max = rawMax === rawMin ? rawMax + 1 : rawMax;
  const min = rawMin;
  const range = max - min;

  const W = 100;
  const H = 100;
  const x = (i: number) => (points.length === 1 ? W / 2 : (i / (points.length - 1)) * W);
  const y = (v: number) => H - ((v - min) / range) * H;

  const line = points.map((d, i) => `${x(i).toFixed(2)},${y(d.value).toFixed(2)}`).join(" ");
  const area = `0,${H} ${line} ${W},${H}`;

  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id="activity-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={area} fill="url(#activity-fill)" />
          <polyline
            points={line}
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {points.map((d, i) => (
            <circle
              key={i}
              cx={x(i)}
              cy={y(d.value)}
              r="3"
              fill="#4ade80"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex flex-1 justify-between text-[10px] text-muted-foreground">
          {points.map((d, i) => (
            <span key={i} className="truncate">
              {d.time}
            </span>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

