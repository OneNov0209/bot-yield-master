import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  ArrowDownToLine,
  Activity,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  Scan,
} from "lucide-react";
import { NetworkGuard } from "@/components/NetworkGuard";
import { NETWORK, explorerAddress } from "@/lib/chain-config";
import { fetchUsers, type UserSummary } from "@/lib/api";

export const Route = createFileRoute("/app/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — BOT Yield Master" },
      {
        name: "description",
        content:
          "Top earners on BOT Yield Master. See rankings by yield, deposits, and activity.",
      },
      { property: "og:title", content: "Leaderboard — BOT Yield Master" },
      {
        property: "og:description",
        content: "Top earners on BOT Chain AI yield vaults.",
      },
    ],
  }),
  component: () => (
    <NetworkGuard>
      <Leaderboard />
    </NetworkGuard>
  ),
});

type SortKey = "yield" | "deposit" | "activity";

function Leaderboard() {
  const { address } = useAccount();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("yield");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
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

  const sorted = useMemo(() => {
    const list = [...users];
    if (sortBy === "yield") list.sort((a, b) => b.totalProfit - a.totalProfit);
    if (sortBy === "deposit") list.sort((a, b) => b.totalDeposited - a.totalDeposited);
    if (sortBy === "activity")
      list.sort(
        (a, b) =>
          b.depositCount + b.withdrawCount - (a.depositCount + a.withdrawCount),
      );
    return list;
  }, [users, sortBy]);

  const myAddress = address?.toLowerCase();
  const myRank = myAddress
    ? sorted.findIndex((u) => u.address.toLowerCase() === myAddress) + 1
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl">
            <span className="neon-text">Leaderboard</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Top earners on BOT Yield Master · {users.length} participants
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* My Rank Card */}
      {myRank > 0 && (
        <div className="panel card-3d border-primary/40 bg-primary/5 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Your Rank
              </p>
              <p className="mt-1 font-display text-3xl">#{myRank}</p>
            </div>
            <Trophy className="h-10 w-10 text-primary" />
          </div>
        </div>
      )}

      {/* Sort Filter */}
      <div className="flex flex-wrap gap-2">
        <FilterButton active={sortBy === "yield"} onClick={() => setSortBy("yield")}>
          <TrendingUp className="h-3.5 w-3.5" />
          Yield Earned
        </FilterButton>
        <FilterButton active={sortBy === "deposit"} onClick={() => setSortBy("deposit")}>
          <ArrowDownToLine className="h-3.5 w-3.5" />
          Total Deposit
        </FilterButton>
        <FilterButton active={sortBy === "activity"} onClick={() => setSortBy("activity")}>
          <Activity className="h-3.5 w-3.5" />
          Activity
        </FilterButton>
      </div>

      {error && (
        <div className="panel border-destructive/40 p-4 text-sm text-destructive">
          ⚠️ {error}
        </div>
      )}

      {loading && users.length === 0 && (
        <div className="panel p-12 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading leaderboard…</p>
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="panel p-12 text-center">
          <Trophy className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No activity yet. Be the first to deposit!
          </p>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="panel overflow-hidden">
          {/* Top 3 Podium */}
          {sorted.length >= 3 && (
            <div className="border-b border-border/60 bg-gradient-to-b from-primary/5 to-transparent p-6">
              <div className="grid grid-cols-3 items-end gap-2 text-center">
                <PodiumCard user={sorted[1]} rank={2} sortBy={sortBy} />
                <PodiumCard user={sorted[0]} rank={1} sortBy={sortBy} />
                <PodiumCard user={sorted[2]} rank={3} sortBy={sortBy} />
              </div>
            </div>
          )}

          {/* Full Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
                  <th className="p-4 text-center">Rank</th>
                  <th className="p-4">Wallet</th>
                  <th className="p-4 text-right">Yield</th>
                  <th className="p-4 text-right">Deposited</th>
                  <th className="p-4 text-right">Activities</th>
                  <th className="p-4 text-right">Vaults</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((u, i) => {
                  const rank = i + 1;
                  const isMe = myAddress && u.address.toLowerCase() === myAddress;
                  return (
                    <tr
                      key={u.address}
                      className={`border-b border-border/40 transition ${
                        isMe
                          ? "bg-primary/10 hover:bg-primary/15"
                          : "hover:bg-primary/5"
                      }`}
                    >
                      <td className="p-4 text-center">
                        <RankBadge rank={rank} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{u.address}</span>
                          {isMe && (
                            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              YOU
                            </span>
                          )}
                          <CopyButton text={u.address} />
                          <ScanButton address={u.address} />
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono text-success">
                        +{u.totalProfit.toFixed(6)}
                      </td>
                      <td className="p-4 text-right font-mono">
                        {u.totalDeposited.toFixed(4)}
                      </td>
                      <td className="p-4 text-right text-xs">
                        <span className="text-success">{u.depositCount}</span>
                        {" / "}
                        <span className="text-destructive">{u.withdrawCount}</span>
                      </td>
                      <td className="p-4 text-right text-xs text-muted-foreground">
                        {u.vaultsUsed.length}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Last updated: {lastRefresh.toLocaleTimeString("en-US")} · Auto-refresh 30s
      </p>
    </div>
  );
}

/* ─────────────────────────────── */
/* COPY & SCAN                    */
/* ─────────────────────────────── */
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

function ScanButton({
  address,
  label = "View on Explorer",
}: {
  address: string;
  label?: string;
}) {
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

/* ─────────────────────────────── */
function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Medal className="mx-auto h-5 w-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="mx-auto h-5 w-5 text-gray-300" />;
  if (rank === 3) return <Medal className="mx-auto h-5 w-5 text-amber-600" />;
  return <span className="font-mono text-xs text-muted-foreground">#{rank}</span>;
}

function PodiumCard({
  user,
  rank,
  sortBy,
}: {
  user: UserSummary;
  rank: number;
  sortBy: SortKey;
}) {
  const colors = {
    1: { border: "border-yellow-500/40", bg: "bg-yellow-500/10", text: "text-yellow-400" },
    2: { border: "border-gray-400/40", bg: "bg-gray-400/10", text: "text-gray-300" },
    3: { border: "border-amber-600/40", bg: "bg-amber-600/10", text: "text-amber-600" },
  }[rank as 1 | 2 | 3];

  const height = rank === 1 ? "h-40" : rank === 2 ? "h-32" : "h-28";

  const value =
    sortBy === "yield"
      ? `+${user.totalProfit.toFixed(4)}`
      : sortBy === "deposit"
      ? user.totalDeposited.toFixed(4)
      : `${user.depositCount + user.withdrawCount}`;

  const label =
    sortBy === "yield" ? "Yield" : sortBy === "deposit" ? "Deposited" : "Activities";

  return (
    <div className={`${height} flex flex-col justify-end`}>
      <div
        className={`panel ${colors.border} ${colors.bg} p-3 flex flex-col items-center`}
      >
        {rank === 1 && <Trophy className={`h-6 w-6 ${colors.text}`} />}
        {rank === 2 && <Medal className={`h-6 w-6 ${colors.text}`} />}
        {rank === 3 && <Award className={`h-6 w-6 ${colors.text}`} />}
        <p className={`mt-2 font-mono text-[10px] ${colors.text}`}>
          {user.address.slice(0, 8)}...{user.address.slice(-6)}
        </p>
        <p className="mt-1 font-display text-sm font-semibold">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
