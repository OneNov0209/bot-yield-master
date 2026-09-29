import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  Layers,
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Loader2,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Twitter,
  Send,
  Copy,
  Check,
  Scan,
} from "lucide-react";
import { NETWORK, explorerTx, explorerAddress } from "@/lib/chain-config";
import { ChartFrame, SharePie, ActivityLine } from "@/components/charts";
import {
  fetchSummary,
  fetchAnalytics,
  type Summary,
  type Analytics,
} from "@/lib/api";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Protocol Statistics — BOT Yield Master" },
      {
        name: "description",
        content:
          "Live on-chain statistics for BOT Yield Master. Total TVL, users, yield, and vault performance on BOT Chain.",
      },
      { property: "og:title", content: "Protocol Statistics — BOT Yield Master" },
      {
        property: "og:description",
        content: "Live on-chain metrics for BOT Chain AI yield vaults.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StatsPage,
});

/* ─────────────────────────────── */
function StatsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, a] = await Promise.all([fetchSummary(), fetchAnalytics()]);
      setSummary(s);
      setAnalytics(a);
      setLastRefresh(new Date());
    } catch (e: any) {
      setError(e.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  /* ─── Compute totals ─── */
  const totals = summary?.totals;
  const totalDeposits = summary?.activity.filter((a) => a.type === "deposit").length ?? 0;
  const totalWithdrawals = summary?.activity.filter((a) => a.type === "withdraw").length ?? 0;
  const totalTx = totalDeposits + totalWithdrawals;

  /* ─── Chart data ─── */
  const vaultShareData =
    summary?.vaults.map((v) => ({ name: v.name, value: v.balance })).filter((d) => d.value > 0) ?? [];

  const tvlTrendData =
    analytics?.tvlTrend.map((t) => ({ time: t.label, value: t.value })) ?? [];

  const recentActivity = (summary?.activity ?? []).slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://raw.githubusercontent.com/OneNov0209/logo/refs/heads/main/BotChain.png"
              alt="BOT Chain Logo"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-lg font-semibold">BOT Yield Master</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Launch App <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold md:text-4xl">
            <span className="neon-text">Protocol Statistics</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Live on-chain metrics from {NETWORK.name} · Last updated:{" "}
            {lastRefresh.toLocaleTimeString("en-US")}
          </p>
        </div>

        {error && (
          <div className="panel mb-6 border-destructive/40 p-4 text-sm text-destructive">
            ⚠️ {error}
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={Layers}
            label="Total TVL"
            value={`${(totals?.tvl ?? 0).toFixed(4)} ${NETWORK.symbol}`}
            hint={`${summary?.vaults.length ?? 0} active vaults`}
          />
          <StatCard
            icon={TrendingUp}
            label="Total Yield"
            value={`${(totals?.yield ?? 0).toFixed(6)} ${NETWORK.symbol}`}
            hint="All-time accumulated"
          />
          <StatCard
            icon={Users}
            label="Total Users"
            value={`${totals?.uniqueUsers ?? 0}`}
            hint="Unique wallets"
          />
          <StatCard
            icon={ArrowDownToLine}
            label="Deposits"
            value={`${totalDeposits}`}
            hint={`${(totals?.deposited ?? 0).toFixed(4)} ${NETWORK.symbol} total`}
          />
          <StatCard
            icon={ArrowUpFromLine}
            label="Withdrawals"
            value={`${totalWithdrawals}`}
            hint="All-time"
          />
          <StatCard
            icon={Activity}
            label="Total Activity"
            value={`${totalTx}`}
            hint="Confirmed transactions"
          />
        </div>

        {/* Charts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ChartFrame
            title="Protocol TVL Trend"
            subtitle={`Last 30 days · ${analytics?.summary.totalSnapshots ?? 0} snapshot(s)`}
            empty={
              tvlTrendData.length < 2
                ? "Snapshot data will appear here as it accumulates (hourly)."
                : undefined
            }
          >
            <ActivityLine data={tvlTrendData} label={NETWORK.symbol} />
          </ChartFrame>

          <ChartFrame
            title="TVL Distribution by Vault"
            subtitle="Live on-chain balances"
            empty={vaultShareData.length === 0 ? "No TVL yet." : undefined}
          >
            <SharePie data={vaultShareData} />
          </ChartFrame>
        </div>

        {/* Vault Details */}
        <div className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Layers className="h-5 w-5 text-primary" /> Vault Details
          </h2>
          <div className="panel overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
                  <th className="p-4">Vault</th>
                  <th className="p-4 text-right">Balance</th>
                  <th className="p-4 text-right">Deposited</th>
                  <th className="p-4 text-right">Yield</th>
                  <th className="p-4 text-right">Profit Rate</th>
                </tr>
              </thead>
              <tbody>
                {(summary?.vaults ?? []).map((v) => (
                  <tr key={v.key} className="border-b border-border/40 hover:bg-primary/5">
                    <td className="p-4">
                      <p className="font-semibold">{v.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {v.address}
                        </span>
                        <CopyButton text={v.address} />
                        <ScanButton address={v.address} />
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono">
                      {v.balance.toFixed(4)} {NETWORK.symbol}
                    </td>
                    <td className="p-4 text-right font-mono text-muted-foreground">
                      {v.deposited.toFixed(4)} {NETWORK.symbol}
                    </td>
                    <td className="p-4 text-right font-mono text-success">
                      +{v.yield.toFixed(6)}
                    </td>
                    <td className="p-4 text-right font-mono text-warning">
                      {v.profitRate.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Activity className="h-5 w-5 text-primary" /> Recent Activity
          </h2>
          <div className="panel">
            {recentActivity.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">
                No activity yet.
              </p>
            ) : (
              <div className="divide-y divide-border/40">
                {recentActivity.map((a, i) => (
                  <div
                    key={`${a.txHash}-${i}`}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 transition hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                          a.type === "deposit"
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {a.type === "deposit" ? (
                          <ArrowDownToLine className="h-4 w-4" />
                        ) : (
                          <ArrowUpFromLine className="h-4 w-4" />
                        )}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">
                            {a.user.slice(0, 6)}...{a.user.slice(-4)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {a.type}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {a.vaultName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-mono text-sm">
                          {a.amount.toFixed(4)} {NETWORK.symbol}
                        </p>
                        {a.profit > 0 && (
                          <p className="font-mono text-xs text-success">
                            +{a.profit.toFixed(6)} yield
                          </p>
                        )}
                      </div>
                      <a
                        href={explorerTx(a.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        title="View on explorer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-12 panel p-8 text-center">
          <h2 className="text-2xl font-bold">Ready to earn with BOT Yield Master?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Join verified users earning automated yield on BOT Chain.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Launch App <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://x.com/BotYieldMaster"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium hover:border-primary hover:text-primary"
            >
              <Twitter className="h-4 w-4" /> Twitter
            </a>
            <a
              href="https://t.me/BOTYieldMaster"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium hover:border-primary hover:text-primary"
            >
              <Send className="h-4 w-4" /> Telegram
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/40 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-muted-foreground md:px-6">
          <p>© {new Date().getFullYear()} BOT Yield Master · All data on-chain · Verified on BOT Chain</p>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────── */
/* COMPONENTS                     */
/* ─────────────────────────────── */
function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Layers;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="panel card-3d p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-3 font-display text-2xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={label}
      className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
    >
      {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function ScanButton({ address, label = "View on Explorer" }: { address: string; label?: string }) {
  return (
    <a
      href={explorerAddress(address)}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
    >
      <Scan className="h-3 w-3" />
    </a>
  );
}
