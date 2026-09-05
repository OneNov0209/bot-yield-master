import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { AlertTriangle, Loader2, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { ActivityLine } from "@/components/charts";

type Market = {
  current_price: number;
  price_change_percentage_24h: number | null;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  ath: number;
};

type ChartPoint = { time: string; value: number };

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

async function fetchMarket(): Promise<Market> {
  const res = await fetch(MARKET_URL);
  if (!res.ok) throw new Error(`CoinGecko market request failed (${res.status})`);
  const json = (await res.json()) as Market[];
  const first = json[0];
  if (!first) throw new Error("CoinGecko returned no BOT market data");
  return first;
}

async function fetchChart(range: RangeKey): Promise<ChartPoint[]> {
  const res = await fetch(chartUrl(RANGES[range].days));
  if (!res.ok) throw new Error(`CoinGecko chart request failed (${res.status})`);
  const json = (await res.json()) as { prices?: [number, number][] };
  const prices = Array.isArray(json.prices) ? json.prices : [];
  return prices
    .filter((p) => Array.isArray(p) && Number.isFinite(p[1]))
    .map(([ts, value]) => ({ time: fmtTime(ts, range), value }));
}

const usd = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;

function BotPriceChartInner() {
  const market = useQuery({
    queryKey: ["coingecko", "bot", "market"],
    queryFn: fetchMarket,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const chart = useQuery({
    queryKey: ["coingecko", "bot", "chart-30d"],
    queryFn: fetchChart,
    refetchInterval: 300_000,
    staleTime: 120_000,
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
          <Stat label="24h Volume" value={`$${Math.round(market.data.total_volume).toLocaleString("en-US")}`} />
          <Stat label="All-Time High" value={usd(market.data.ath)} />
        </dl>
      )}

      <div className="mt-6 h-64">
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
          <ActivityLine data={chart.data ?? []} label="BOT price (30 days, USD)" />
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
