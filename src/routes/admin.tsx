import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
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
  Key,
  Lock,
  Loader2,
  X,
  AlertOctagon,
} from "lucide-react";
import { NETWORK, explorerTx } from "@/lib/chain-config";
import {
  fetchSummary,
  fetchOwnerShares,
  withdrawFromVault,
  withdrawAll,
  type Summary,
  type UserSummary,
  type ActivityItem,
  type OwnerShares,
} from "@/lib/api";

const Web3Provider = lazy(() => import("@/components/Web3Provider"));

const OWNER_ADDRESS =
  "0xaad57141504a022af3f4f5764fe3670ca7af060b".toLowerCase();

const ADMIN_KEY_STORAGE = "botchain_admin_key";

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
  const [ownerShares, setOwnerShares] = useState<OwnerShares | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Admin key state
  const [adminKey, setAdminKey] = useState<string>("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Withdraw modal state
  const [withdrawTarget, setWithdrawTarget] = useState<string | "ALL" | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<any>(null);

  // Toast state
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; msg: string; txHash?: string } | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_KEY_STORAGE);
    if (saved) setAdminKey(saved);
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 8000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, shares] = await Promise.all([
        fetchSummary(),
        fetchOwnerShares(),
      ]);
      setSummary(data);
      setOwnerShares(shares);
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

  const handleSaveKey = (key: string) => {
    setAdminKey(key);
    sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
    setShowKeyInput(false);
    setToast({ type: "info", msg: "Admin key tersimpan untuk sesi ini" });
  };

  const handleWithdraw = async (target: string | "ALL") => {
    if (!adminKey) {
      setToast({ type: "error", msg: "Admin key belum diisi" });
      return;
    }

    setWithdrawing(true);
    setWithdrawResult(null);

    try {
      if (target === "ALL") {
        const res = await withdrawAll(adminKey);
        setWithdrawResult(res);
        const successCount = res.results.filter((r: any) => r.status === "success").length;
        const skippedCount = res.results.filter((r: any) => r.status === "skipped").length;
        const errorCount = res.results.filter((r: any) => r.status === "error").length;

        if (errorCount > 0) {
          setToast({ type: "error", msg: `Withdraw: ${successCount} sukses, ${skippedCount} skip, ${errorCount} error` });
        } else if (successCount > 0) {
          setToast({ type: "success", msg: `Withdraw sukses dari ${successCount} vault` });
        } else {
          setToast({ type: "info", msg: `Tidak ada shares untuk di-withdraw (${skippedCount} vault skip)` });
        }
      } else {
        const res = await withdrawFromVault(target, adminKey);
        setWithdrawResult(res);
        if (res.status === "success") {
          setToast({ type: "success", msg: `Withdraw sukses: ${res.shares} shares`, txHash: res.txHash });
        } else if (res.status === "skipped") {
          setToast({ type: "info", msg: res.reason || "Tidak ada shares" });
        } else {
          setToast({ type: "error", msg: res.error || "Withdraw gagal" });
        }
      }

      // Refresh data
      await load();
    } catch (e: any) {
      setToast({ type: "error", msg: e.message });
    } finally {
      setWithdrawing(false);
      setTimeout(() => {
        setWithdrawTarget(null);
        setWithdrawResult(null);
      }, 2000);
    }
  };

  const totalShares = ownerShares
    ? Object.values(ownerShares.vaults).reduce((s, v) => s + v.shares, 0)
    : 0;

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
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              onClick={() => setShowKeyInput(true)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                adminKey
                  ? "border-success/40 text-success hover:border-success"
                  : "border-warning/40 text-warning hover:border-warning"
              }`}
            >
              <Key className="h-3 w-3" />
              {adminKey ? "Key Set" : "Set Admin Key"}
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

        {/* Toast */}
        {toast && (
          <div
            className={`mb-4 flex items-start gap-3 rounded-lg border p-4 ${
              toast.type === "success"
                ? "border-success/40 bg-success/5"
                : toast.type === "error"
                ? "border-destructive/40 bg-destructive/5"
                : "border-primary/40 bg-primary/5"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="h-5 w-5 text-success" />}
            {toast.type === "error" && <AlertOctagon className="h-5 w-5 text-destructive" />}
            {toast.type === "info" && <Activity className="h-5 w-5 text-primary" />}
            <div className="flex-1 text-sm">
              <p>{toast.msg}</p>
              {toast.txHash && (
                <a
                  href={explorerTx(toast.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Lihat di explorer <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <button onClick={() => setToast(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

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

        {/* Emergency Withdraw Banner */}
        {totalShares > 0 && (
          <div className="mb-6 panel border-destructive/40 bg-destructive/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 flex-shrink-0 text-destructive" />
                <div>
                  <h2 className="text-lg font-bold text-destructive">
                    ⚠️ Emergency Withdraw All
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Owner memiliki <span className="font-mono text-foreground">{totalShares.toFixed(6)}</span> shares
                    di 3 vault. Klik tombol untuk tarik semua ke wallet owner.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setWithdrawTarget("ALL")}
                disabled={withdrawing || !adminKey}
                className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground transition hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowUpFromLine className="h-4 w-4" />
                WITHDRAW SEMUA SEKARANG
              </button>
            </div>
          </div>
        )}

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

        {/* Vault Details */}
        <div className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Layers className="h-5 w-5 text-primary" /> Vault Details
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {(summary?.vaults ?? []).map((v) => {
              const shares = ownerShares?.vaults[v.key as keyof OwnerShares["vaults"]];
              const hasShares = (shares?.shares ?? 0) > 0;
              return (
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
                    <Row
                      label="Your Shares"
                      value={
                        shares
                          ? `${shares.shares.toFixed(6)}`
                          : "—"
                      }
                    />
                  </div>
                  <button
                    onClick={() => setWithdrawTarget(v.key)}
                    disabled={withdrawing || !adminKey || !hasShares}
                    className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                      hasShares && adminKey
                        ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        : "cursor-not-allowed border border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {withdrawing && withdrawTarget === v.key ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                      </>
                    ) : (
                      <>
                        <ArrowUpFromLine className="h-4 w-4" />
                        {hasShares ? "Withdraw" : "No Shares"}
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* User List */}
        <div className="mt-8 panel p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
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
            <li>• Withdraw dieksekusi oleh backend pakai private key owner.</li>
            <li>• Admin key hanya tersimpan di sesi tab ini (hilang saat close).</li>
            <li>• Rate limit: max 10 withdraw per menit.</li>
          </ul>
        </div>
      </div>

      {/* Admin Key Modal */}
      {showKeyInput && (
        <AdminKeyModal
          initial={adminKey}
          onSave={handleSaveKey}
          onClose={() => setShowKeyInput(false)}
        />
      )}

      {/* Withdraw Confirm Modal */}
      {withdrawTarget && (
        <WithdrawModal
          target={withdrawTarget}
          vaultName={
            withdrawTarget === "ALL"
              ? "Semua Vault (3)"
              : summary?.vaults.find((v) => v.key === withdrawTarget)?.name ?? withdrawTarget
          }
          totalShares={
            withdrawTarget === "ALL"
              ? totalShares
              : ownerShares?.vaults[withdrawTarget as keyof OwnerShares["vaults"]]?.shares ?? 0
          }
          result={withdrawResult}
          processing={withdrawing}
          onConfirm={() => handleWithdraw(withdrawTarget)}
          onClose={() => {
            if (!withdrawing) {
              setWithdrawTarget(null);
              setWithdrawResult(null);
            }
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────── */
function AdminKeyModal({
  initial,
  onSave,
  onClose,
}: {
  initial: string;
  onSave: (k: string) => void;
  onClose: () => void;
}) {
  const [key, setKey] = useState(initial);

  return (
    <Modal onClose={onClose}>
      <div className="mb-4 flex items-center gap-2">
        <Lock className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">Admin API Key</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Masukkan admin key untuk mengaktifkan tombol withdraw. Key hanya tersimpan di sesi tab ini.
      </p>
      <input
        type="password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="Paste admin key di sini…"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs"
      />
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary"
        >
          Batal
        </button>
        <button
          onClick={() => onSave(key.trim())}
          disabled={!key.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Simpan
        </button>
      </div>
    </Modal>
  );
}

function WithdrawModal({
  target,
  vaultName,
  totalShares,
  result,
  processing,
  onConfirm,
  onClose,
}: {
  target: string;
  vaultName: string;
  totalShares: number;
  result: any;
  processing: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const isDone = !!result;
  const success = result?.status === "success" || result?.results?.some((r: any) => r.status === "success");
  const skipped = result?.status === "skipped" || result?.results?.every((r: any) => r.status === "skipped");

  return (
    <Modal onClose={onClose}>
      {!isDone ? (
        <>
          <div className="mb-4 flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-destructive" />
            <h2 className="text-lg font-bold">Konfirmasi Withdraw</h2>
          </div>
          <div className="space-y-2 rounded-lg border border-border p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vault:</span>
              <span className="font-semibold">{vaultName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Shares:</span>
              <span className="font-mono">{totalShares.toFixed(6)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-destructive">
              <span>⚠️ Aksi ini akan transfer dana nyata</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Dana akan ditarik dari vault ke wallet owner <span className="font-mono">0xaAD5...060b</span>.
            Transaksi tidak bisa dibatalkan.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={onClose}
              disabled={processing}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={processing}
              className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="h-4 w-4" /> Konfirmasi Withdraw
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2">
            {success ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : skipped ? (
              <Activity className="h-5 w-5 text-primary" />
            ) : (
              <AlertOctagon className="h-5 w-5 text-destructive" />
            )}
            <h2 className="text-lg font-bold">
              {success ? "✅ Withdraw Sukses" : skipped ? "ℹ️ Tidak Ada Shares" : "❌ Withdraw Gagal"}
            </h2>
          </div>

          {success && result?.txHash && (
            <a
              href={explorerTx(result.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Lihat transaksi <ExternalLink className="h-3 w-3" />
            </a>
          )}

          {result?.results && (
            <div className="mt-4 space-y-2">
              {result.results.map((r: any) => (
                <div
                  key={r.vaultKey}
                  className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                >
                  <span>{r.vaultName}</span>
                  <span
                    className={
                      r.status === "success"
                        ? "text-success"
                        : r.status === "skipped"
                        ? "text-muted-foreground"
                        : "text-destructive"
                    }
                  >
                    {r.status === "success"
                      ? `✅ ${r.shares?.toFixed(4) ?? "OK"}`
                      : r.status === "skipped"
                      ? "— Skip"
                      : `❌ ${r.error ?? "Error"}`}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-6 w-full rounded-lg border border-border px-4 py-2 text-sm hover:border-primary hover:text-primary"
          >
            Tutup
          </button>
        </>
      )}
    </Modal>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md panel relative p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
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
        Belum ada user.
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
            <th className="pb-3 pr-4 text-right">Live Shares</th>
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
              <td className="py-3 pr-4 text-right font-mono">
                {(u as any).liveShares?.toFixed(6) ?? "—"}
              </td>
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
                  href={explorerTx(a.txHash)}
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
