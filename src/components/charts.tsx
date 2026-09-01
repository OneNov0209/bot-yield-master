import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  color: "var(--color-foreground)",
} as const;

type Datum = { name: string; value: number };

export function ChartFrame({
  title,
  subtitle,
  children,
  empty,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
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
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={donut ? "58%" : 0}
          outerRadius="82%"
          paddingAngle={donut ? 3 : 1}
          stroke="var(--color-background)"
        >
          {data.map((d, i) => (
            <Cell key={d.name} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Legend
          verticalAlign="bottom"
          height={28}
          wrapperStyle={{ fontSize: 11, color: "var(--color-muted-foreground)" }}
        />
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ActivityLine({
  data,
  label,
}: {
  data: { time: string; value: number }[];
  label: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
        <XAxis dataKey="time" stroke="var(--color-muted-foreground)" fontSize={11} />
        <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey="value"
          name={label}
          stroke="var(--color-neon)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--color-primary)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
