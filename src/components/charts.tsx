import { formatEther } from "viem";
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
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return <p className="text-center text-sm text-muted-foreground">No data</p>;
  }

  let currentAngle = 0;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {data.map((d, i) => {
          const percentage = (d.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const start = currentAngle;
          currentAngle += angle;

          const largeArc = angle > 180 ? 1 : 0;
          const x1 = 60 + 50 * Math.cos((start * Math.PI) / 180);
          const y1 = 60 + 50 * Math.sin((start * Math.PI) / 180);
          const x2 = 60 + 50 * Math.cos(((start + angle) * Math.PI) / 180);
          const y2 = 60 + 50 * Math.sin(((start + angle) * Math.PI) / 180);

          return (
            <path
              key={d.name}
              d={`M 60 60 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={COLORS[i % COLORS.length]}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
      </svg>
      <div className="space-y-1">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span>{d.name}</span>
            <span className="text-muted-foreground">
              {((d.value / total) * 100).toFixed(1)}%
            </span>
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
        const height = ((val - min) / range) * 100;
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
