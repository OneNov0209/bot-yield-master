import { ReactNode } from "react";

type Datum = { name: string; value: number };

const COLORS = ["#a855f7", "#22d3ee", "#34d399", "#f59e0b", "#ef4444"];

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
export function SharePie({ data, donut = true }: { data: Datum[]; donut?: boolean }) {
  const list = Array.isArray(data) ? data.filter((d) => Number.isFinite(d.value) && d.value > 0) : [];
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
      color: COLORS[i % COLORS.length] ?? "#a855f7",
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
  if (!data || data.length === 0) {
    return <p className="text-center text-sm text-muted-foreground">No activity to plot yet.</p>;
  }

  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return (
    <div className="flex h-full items-end gap-1">
      {data.map((d, i) => {
        const val = d.value;
        const height = Math.max(8, ((val - min) / range) * 100);
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md bg-primary"
              style={{ height: `${height}%` }}
            />
            <p className="text-[10px] text-muted-foreground">{d.time}</p>
          </div>
        );
      })}
      <p className="ml-2 self-center text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
