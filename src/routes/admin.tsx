import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";
import { formatEther, type Address } from "viem";
import {
  ShieldAlert,
  Wallet,
  Layers,
  Bot,
  Activity,
  TrendingUp,
  ArrowLeft,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { NETWORK } from "@/lib/chain-config";
import { fetchSummary, type Summary, type UserSummary, type ActivityItem } from "@/lib/api";

const Web3Provider = lazy(() => import("@/components/Web3Provider"));

const OWNER_ADDRESS =
  "0xaad57141504a022af3f4f5764fe3670ca7af060b".toLowerCase();

const COLORS = ["#22c55e", "#3b82f6", "#eab308", "#a855f7", "#ef4444"];

export const Route = createFileRoute("/admin")({
  component: AdminWrapper,
});

function Booting() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="animate-pulse font-display text-sm tracking-widest text-muted-foreground">
        LOADING ADMIN PANEL…
      </p>
    </div>
  );
}

function AdminWrapper() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <Booting />;

  return (
    <Suspense fallback={<Booting />}>
      <Web3Provider>
        <Admin />
      </Web3Provider>
    </Suspense>
  );
}

function Admin() {
  const { address, isConnected } = useAccount();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    setIsAuthorized(!!address && address.toLowerCase() === OWNER_ADDRESS);
  }, [address]);

  if (!isConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="panel max-w-md p-8 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-warning" />
          <h1 className="mt-4 text-xl font-bold">Admin Access Required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect your wallet to verify ownership.
          </p>
          <div className="mt-6 flex justify-center">
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
          </div>
          <Link to="/app" className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to App
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="panel max-w-md p-8 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-xl font-bold text-destructive">Access Denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Only the project owner can access this admin panel.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Your wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
          <div className="mt-6 flex justify-center">
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
          </div>
          <Link to="/app" className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to App
          </Link>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

/* ─────────────────────────────── */
function AdminDashboard() {
  const { address } = useAccount();
  const { data: ownerBalance } = useBalance({ address: address as Address });

  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSummary();
      setSummary(data);
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

  const vaultChartData = useMemo(
    () =>
      (summary?.vaults ?? []).map((v) => ({
        name: v.name.replace(" Hunter", "").replace(" Bot", ""),
        tvl: v.balance,
        yield: v.yield,
      })),
    [summary],
  );

  const pieData = useMemo(
    () =>
      (summary?.vaults ?? []).map((v) => ({
        name: v.name,
        value: v.balance,
      })),
    [summary],
  );

  const activityChartData = useMemo(() => {
    const days: Record<string, { day: string; deposit: number; withdraw: number }> = {};
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400_000);
      const key = d.toISOString().slice(0, 10);
      days[key] = {
        day: d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
        deposit: 0,
        withdraw: 0,
      };
    }
    (summary?.activity ?? []).forEach((a) => {
      const key = new Date(a.timestamp * 1000).toISOString().slice(0, 10);
      if (days[key]) {
        if (a.type === "deposit") days[key].deposit += a.amount;
        else days[key].withdraw += a.amount;
      }
    });
    return Object.values(days);
  }, [summary]);

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="neon-text">Admin Dashboard</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Owner-only · {NETWORK.name} · Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>Last updated: {lastRefresh.toLocaleTimeString("id-ID")}</span>
          <span>·</span>
          <span>Auto-refresh 30s</span>
          {error && (
            <>
              <span>·</span>
              <span className="text-destructive">⚠️ {error}</span>
            </>
          )}
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Layers}
            label="Total TVL"
            value={`${(summary?.totals.tvl ?? 0).toFixed(4)} ${NETWORK.symbol}`}
            hint={`${summary?.vaults.length ?? 0} vaults`}
          />
          <StatCard
            icon={TrendingUp}
            label="Total Yield"
            value={`${(summary?.totals.yield ?? 0).toFixed(6)} ${NETWORK.symbol}`}
            hint="Accumulated"
          />
          <StatCard
            icon={Wallet}
            label="Owner Balance"
            value={
              ownerBalance
                ? `${Number(formatEther(ownerBalance.value)).toFixed(4)} ${NETWORK.symbol}`
                : "0.0000"
            }
            hint="Wallet for bot funding"
          />
          <StatCard
            icon={Users}
            label="Unique Users"
            value={`${summary?.totals.uniqueUsers ?? 0}`}
            hint={`${summary?.totals.activityCount ?? 0} activities`}
          />
        </div>

        {/* Keeper Status */}
        {summary?.keeper && (
          <div
            className={`mt-6 panel flex flex-wrap items-center justify-between gap-4 p-4 ${
              summary.keeper.status === "healthy" ? "border-success/40" : "border-destructive/40"
            }`}
          >
            <div className="flex items-center gap-3">
              {summary.keeper.status === "healthy" ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              <div>
                <p className="text-sm font-semibold">
                  Keeper Bot:{" "}
                  <span className={summary.keeper.status === "healthy" ? "text-success" : "text-destructive"}>
                    {summary.keeper.status === "healthy" ? "Healthy" : "Low Balance"}
                  </span>
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {summary.keeper.address.slice(0, 10)}...{summary.keeper.address.slice(-8)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Keeper Balance</p>
                <p className="font-mono">{summary.keeper.balance.toFixed(4)} BOT</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Est. Runs Left</p>
                <p className="font-mono">{summary.keeper.estimatedRunsLeft}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Interval</p>
                <p className="font-mono">{summary.keeper.intervalHours}h</p>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="panel p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Layers className="h-5 w-5 text-primary" /> TVL per Vault
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vaultChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0a0f0a",
                      border: "1px solid #22c55e",
                      borderRadius: 8,
                      color: "#fff",
                    }}
                    formatter={(v: number) => `${v.toFixed(4)} ${NETWORK.symbol}`}
                  />
                  <Bar dataKey="tvl" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Activity className="h-5 w-5 text-primary" /> Distribusi TVL
            </h2>
            <div className="h-72">
              {(summary?.totals.tvl ?? 0) > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      paddingAngle={3}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0a0f0a",
                        border: "1px solid #22c55e",
                        borderRadius: 8,
                        color: "#fff",
                      }}
                      formatter={(v: number) => `${v.toFixed(4)} ${NETWORK.symbol}`}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Belum ada TVL
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 panel p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5 text-primary" /> Aktivitas 7 Hari
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityChartData}>
                <defs>
                  <linearGradient id="cD" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cW" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a0f0a",
                    border: "1px solid #22c55e",
                    borderRadius: 8,
                    color: "#fff",
                  }}
                  formatter={(v: number) => `${v.toFixed(4)} ${NETWORK.symbol}`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="deposit" name="Deposit" stroke="#22c55e" fill="url(#cD)" />
                <Area type="monotone" dataKey="withdraw" name="Withdraw" stroke="#ef4444" fill="url(#cW)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vault Details */}
        <div className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Layers className="h-5 w-5 text-primary" /> Vault Details
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {(summary?.vaults ?? []).map((v) => (
              <div key={v.key} className="panel card-3d p-6">
                <h3 className="text-lg font-semibold">{v.name}</h3>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {v.address.slice(0, 10)}...{v.address.slice(-8)}
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <Row label="Balance" value={`${v.balance.toFixed(4)} ${NETWORK.symbol}`} />
                  <Row label="Deposited" value={`${v.deposited.toFixed(4)} ${NETWORK.symbol}`} />
                  <Row label="Yield" value={`${v.yield.toFixed(6)} ${NETWORK.symbol}`} />
                  <Row label="Profit Rate" value={`${v.profitRate.toFixed(2)}%`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User List */}
        <div className="mt-8 panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Users className="h-5 w-5 text-primary" /> Wallet Users
            </h2>
            <span className="text-xs text-muted-foreground">
              {summary?.users.length ?? 0} unique wallets
            </span>
          </div>
          <UserTable users={summary?.users ?? []} loading={loading} />
        </div>

        {/* Activity Log */}
        <div className="mt-8 panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Activity className="h-5 w-5 text-primary" /> Activity Log
            </h2>
            <span className="text-xs text-muted-foreground">
              {summary?.activity.length ?? 0} events
            </span>
          </div>
          <ActivityTable activity={summary?.activity ?? []} />
        </div>

        {/* Info */}
        <div className="mt-8 panel p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Bot className="h-5 w-5 text-primary" /> Info
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Data diambil dari API backend VPS (real-time).</li>
            <li>• Cache server 30 detik untuk hemat RPC.</li>
            <li>• Activity log mencakup 100.000 blok terakhir.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── */
function UserTable({ users, loading }: { users: UserSummary[]; loading: boolean }) {
  if (loading && users.length === 0)
    return <p className="py-8 text-center text-sm text-muted-foreground">Loading users…</p>;
  if (users.length === 0)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Belum ada user. (Contract belum emit event deposit/withdraw)
      </p>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
            <th className="pb-3 pr-4">#</th>
            <th className="pb-3 pr-4">Wallet</th>
            <th className="pb-3 pr-4 text-right">Deposited</th>
            <th className="pb-3 pr-4 text-right">Withdrawn</th>
            <th className="pb-3 pr-4 text-right">Profit</th>
            <th className="pb-3 pr-4 text-right">Net</th>
            <th className="pb-3 pr-4 text-center">Dep / Wd</th>
            <th className="pb-3 text-right">Last</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.address} className="border-b border-border/40 hover:bg-primary/5">
              <td className="py-3 pr-4 text-xs text-muted-foreground">{i + 1}</td>
              <td className="py-3 pr-4 font-mono text-xs">
                {u.address.slice(0, 6)}...{u.address.slice(-4)}
              </td>
              <td className="py-3 pr-4 text-right font-mono text-success">
                {u.totalDeposited.toFixed(4)}
              </td>
              <td className="py-3 pr-4 text-right font-mono text-destructive">
                {u.totalWithdrawn.toFixed(4)}
              </td>
              <td className="py-3 pr-4 text-right font-mono text-warning">
                +{u.totalProfit.toFixed(6)}
              </td>
              <td className="py-3 pr-4 text-right font-mono">{u.netBalance.toFixed(4)}</td>
              <td className="py-3 pr-4 text-center text-xs">
                <span className="text-success">{u.depositCount}</span> /{" "}
                <span className="text-destructive">{u.withdrawCount}</span>
              </td>
              <td className="py-3 text-right text-xs text-muted-foreground">
                {new Date(u.lastActivity * 1000).toLocaleDateString("id-ID")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActivityTable({ activity }: { activity: ActivityItem[] }) {
  if (activity.length === 0)
    return <p className="py-8 text-center text-sm text-muted-foreground">Belum ada aktivitas.</p>;

  return (
    <div className="max-h-96 overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-background">
          <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
            <th className="pb-3 pr-4">Wallet</th>
            <th className="pb-3 pr-4">Type</th>
            <th className="pb-3 pr-4">Vault</th>
            <th className="pb-3 pr-4 text-right">Amount</th>
            <th className="pb-3 pr-4 text-right">Profit</th>
            <th className="pb-3 pr-4">Time</th>
            <th className="pb-3 text-right">Tx</th>
          </tr>
        </thead>
        <tbody>
          {activity.slice(0, 200).map((a, i) => (
            <tr key={`${a.txHash}-${i}`} className="border-b border-border/40 hover:bg-primary/5">
              <td className="py-3 pr-4 font-mono text-xs">
                {a.user.slice(0, 6)}...{a.user.slice(-4)}
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                    a.type === "deposit"
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {a.type === "deposit" ? (
                    <ArrowDownToLine className="h-3 w-3" />
                  ) : (
                    <ArrowUpFromLine className="h-3 w-3" />
                  )}
                  {a.type}
                </span>
              </td>
              <td className="py-3 pr-4 text-xs text-muted-foreground">{a.vaultName}</td>
              <td className="py-3 pr-4 text-right font-mono">
                {a.amount.toFixed(4)} {NETWORK.symbol}
              </td>
              <td className="py-3 pr-4 text-right font-mono text-success">
                {a.profit > 0 ? `+${a.profit.toFixed(6)}` : "—"}
              </td>
              <td className="py-3 pr-4 text-xs text-muted-foreground">
                {new Date(a.timestamp * 1000).toLocaleString("id-ID")}
              </td>
              <td className="py-3 text-right">
                <a
                  href={`${NETWORK.explorerUrl}/tx/${a.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-3 font-display text-xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
