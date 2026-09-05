import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { AlertTriangle, Loader2, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useRef, useState } from "react";

type Market = {
  current_price: number;
  price_change_percentage_24h: number | null;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  ath: number;
};

type PricePoint = { ts: number; value: number };

const MARKET_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bot&price_change_percentage=24h";

type RangeKey = "minutes" | "hours" | "days" | "months";

const RANGES: Record<RangeKey, { label: string; days: number; hint: string }> = {
  minutes: { label: "24 Jam", days: 1, hint: "per 5 menit" },
  hours: { label: "7 Hari", days: 7, hint: "per jam" },
  days: { label: "30 Hari", days: 30, hint: "per jam" },
  months: { label: "1 Tahun", days: 365, hint: "per hari" },
};

const chartUrl = (days: number) =>
  `https://api.coingecko.com/api/v3/coins/bot/market_chart?vs_currency=usd&days=${days}`;

const fmtTime = (ts: number, range: RangeKey) => {
  const d = new Date(ts);
  if (range === "minutes")
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  if (range === "hours" || range === "days")
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

const fmtTooltipTime = (ts: number, range: RangeKey) => {
  const d = new Date(ts);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (range === "months") return date;
  return `${date}, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
};

async function fetchMarket(): Promise<Market> {
  const res = await fetch(MARKET_URL);
  if (!res.ok) throw new Error(`CoinGecko market request failed (${res.status})`);
  const json = (await res.json()) as Market[];
  const first = json[0];
  if (!first) throw new Error("CoinGecko returned no BOT market data");
  return first;
}

type ChartData = { prices: PricePoint[]; volumes: Map<number, number> };

async function fetchChart(range: RangeKey): Promise<ChartData> {
  const res = await fetch(chartUrl(RANGES[range].days));
  if (!res.ok) throw new Error(`CoinGecko chart request failed (${res.status})`);
  const json = (await res.json()) as {
    prices?: [number, number][];
    total_volumes?: [number, number][];
  };
  const prices = (Array.isArray(json.prices) ? json.prices : [])
    .filter((p) => Array.isArray(p) && Number.isFinite(p[1]))
    .map(([ts, value]) => ({ ts, value }));
  const volumes = new Map<number, number>();
  for (const v of Array.isArray(json.total_volumes) ? json.total_volumes : []) {
    if (Array.isArray(v) && Number.isFinite(v[1])) volumes.set(v[0], v[1]);
  }
  return { prices, volumes };
}

const usd = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;

const usdShort = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const usdVol = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

const GREEN = "#4ade80";
const GREEN_LINE = "#22c55e";

/* ---------------- CoinGecko-style interactive chart ---------------- */

function GeckoChart({ data, volumes, range }: { data: PricePoint[]; volumes: Map<number, number>; range: RangeKey }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const geom = useMemo(() => {
    const W = 1000;
    const H = 260;
    const padY = 14;
    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || max * 0.001 || 1;
    const lo = min - span * 0.05;
    const hi = max + span * 0.08;
    const x = (i: number) => (data.length === 1 ? W / 2 : (i / (data.length - 1)) * W);
    const y = (v: number) => padY + (1 - (v - lo) / (hi - lo)) * (H - padY * 2);
    const line = data.map((d, i) => `${x(i).toFixed(2)},${y(d.value).toFixed(2)}`).join(" ");
    const area = `0,${H} ${line} ${W},${H}`;
    const ticks = [0, 1, 2, 3, 4].map((i) => {
      const v = hi - ((hi - lo) * i) / 4;
      return { v, y: y(v) };
    });
    return { W, H, x, y, line, area, ticks };
  }, [data]);

  if (data.length === 0) {
    return <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No price data available.</p>;
  }

  const last = data[data.length - 1]!;
  const hovered = hover !== null ? data[hover] : null;

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * geom.W;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < data.length; i++) {
      const d = Math.abs(geom.x(i) - px);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    setHover(best);
  };

  const hoverVol = hovered ? (volumes.get(hovered.ts) ?? null) : null;
  const tooltipLeftPct = hovered ? (geom.x(hover!) / geom.W) * 100 : 0;

  return (
    <div className="flex h-full">
      {/* plot area */}
      <div
        ref={ref}
        className="relative min-w-0 flex-1 cursor-crosshair touch-none select-none"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${geom.W} ${geom.H}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id="gecko-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GREEN} stopOpacity="0.35" />
              <stop offset="100%" stopColor={GREEN} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {/* horizontal gridlines */}
          {geom.ticks.map((t, i) => (
            <line
              key={i}
              x1="0"
              x2={geom.W}
              y1={t.y}
              y2={t.y}
              stroke="currentColor"
              className="text-border/50"
              strokeWidth="1"
              strokeDasharray={i === geom.ticks.length - 1 ? "none" : "3 5"}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <polygon points={geom.area} fill="url(#gecko-fill)" />
          <polyline
            points={geom.line}
            fill="none"
            stroke={GREEN_LINE}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* hover crosshair */}
          {hovered && hover !== null && (
            <g>
              <line
                x1={geom.x(hover)}
                x2={geom.x(hover)}
                y1="0"
                y2={geom.H}
                stroke={GREEN}
                strokeOpacity="0.6"
                strokeWidth="1"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={geom.x(hover)}
                cy={geom.y(hovered.value)}
                r="7"
                fill={GREEN}
                fillOpacity="0.25"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={geom.x(hover)}
                cy={geom.y(hovered.value)}
                r="4"
                fill={GREEN}
                stroke="var(--card)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )}
        </svg>

        {/* tooltip */}
        {hovered && (
          <div
            className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-lg"
            style={{
              left: `${Math.min(Math.max(tooltipLeftPct, 12), 88)}%`,
            }}
          >
            <p className="whitespace-nowrap text-muted-foreground">{fmtTooltipTime(hovered.ts, range)}</p>
            <p className="mt-0.5 whitespace-nowrap">
              Price: <span className="font-semibold text-foreground">{usd(hovered.value)}</span>
            </p>
            {hoverVol !== null && (
              <p className="whitespace-nowrap">
                Vol: <span className="font-semibold text-foreground">{usdVol(hoverVol)}</span>
              </p>
            )}
          </div>
        )}

        {/* x labels */}
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          {[0, 0.25, 0.5, 0.75, 1].map((f) => {
            const i = Math.min(data.length - 1, Math.round(f * (data.length - 1)));
            return <span key={f}>{fmtTime(data[i]!.ts, range)}</span>;
          })}
        </div>
      </div>

      {/* right price axis + current price pill */}
      <div className="relative ml-2 w-16 shrink-0">
        {geom.ticks.map((t, i) => (
          <span
            key={i}
            className="absolute right-0 -translate-y-1/2 text-[10px] tabular-nums text-muted-foreground"
            style={{ top: `${(t.y / geom.H) * 100}%` }}
          >
            {usdShort(t.v)}
          </span>
        ))}
        <span
          className="absolute right-0 -translate-y-1/2 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-primary-foreground"
          style={{
            top: `${Math.min(Math.max((geom.y(hovered ? hovered.value : last.value) / geom.H) * 100, 4), 96)}%`,
          }}
        >
          {usdShort(hovered ? hovered.value : last.value)}
        </span>
      </div>
    </div>
  );
}

/* ---------------- main panel ---------------- */

function BotPriceChartInner() {
  const [range, setRange] = useState<RangeKey>("minutes");
  const market = useQuery({
    queryKey: ["coingecko", "bot", "market"],
    queryFn: fetchMarket,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const chart = useQuery({
    queryKey: ["coingecko", "bot", "chart", range],
    queryFn: () => fetchChart(range),
    refetchInterval: 60_000,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const change = market.data?.price_change_percentage_24h ?? null;
  const up = change !== null && change >= 0;

  return (
    <div className="panel card-3d p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            BOT / USD · CoinGecko realtime
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold">
              {market.data ? usd(market.data.current_price) : "—"}
            </span>
            {change !== null && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  up ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                }`}
              >
                {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {up ? "+" : ""}
                {change.toFixed(2)}% 24h
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            void market.refetch();
            void chart.refetch();
          }}
          aria-label="Refresh price data"
          className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {market.data && (
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <Stat label="24h High" value={usd(market.data.high_24h)} />
          <Stat label="24h Low" value={usd(market.data.low_24h)} />
          <Stat label="24h Volume" value={usdVol(market.data.total_volume)} />
          <Stat label="All-Time High" value={usd(market.data.ath)} />
        </dl>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {(Object.keys(RANGES) as RangeKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setRange(key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              range === key
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {RANGES[key].label}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-muted-foreground">
          interval {RANGES[range].hint}
        </span>
      </div>

      <div className="mt-4 h-64">
        {chart.error || market.error ? (
          <p className="flex h-full items-center justify-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {(chart.error ?? market.error)?.message}
          </p>
        ) : chart.isLoading ? (
          <p className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading live price chart…
          </p>
        ) : (
          <GeckoChart
            data={chart.data?.prices ?? []}
            volumes={chart.data?.volumes ?? new Map()}
            range={range}
          />
        )}
      </div>

      <p className="mt-4 text-right text-[11px] text-muted-foreground">
        Source:{" "}
        <a
          href="https://www.coingecko.com/en/coins/bot"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          CoinGecko — BOT
        </a>
        {" · "}auto-refresh 60s
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface p-3">
      <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display text-sm">{value}</dd>
    </div>
  );
}

export function BotPriceChart() {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <BotPriceChartInner />
    </QueryClientProvider>
  );
}
