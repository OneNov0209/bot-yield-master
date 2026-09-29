import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useReadContract } from "wagmi";
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
} from "lucide-react";
import { NETWORK } from "@/lib/chain-config";
import { AGENTS } from "@/lib/agents";
import { AUTO_VAULT_ABI } from "@/hooks/useVaultTvl";

const Web3Provider = lazy(() => import("@/components/Web3Provider"));

const OWNER_ADDRESS =
  "0xaad57141504a022af3f4f5764fe3670ca7af060b".toLowerCase();

export const Route = createFileRoute("/admin")({
  component: AdminWrapper,
});

/* ─────────────────────────────────────────────
   BOOTING PLACEHOLDER
   ───────────────────────────────────────────── */
function Booting() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="animate-pulse font-display text-sm tracking-widest text-muted-foreground">
        LOADING ADMIN PANEL…
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   WRAPPER — Web3Provider + mounted gate
   ───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   AUTH GATE — connect wallet + owner check
   ───────────────────────────────────────────── */
function Admin() {
  const { address, isConnected } = useAccount();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    setIsAuthorized(
      !!address && address.toLowerCase() === OWNER_ADDRESS,
    );
  }, [address]);

  /* State 1: Wallet belum connect → tampilkan ConnectButton */
  if (!isConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="panel max-w-md p-8 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-warning" />
          <h1 className="mt-4 text-xl font-bold">Admin Access Required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect your wallet to verify ownership. Only the project owner
            can access this panel.
          </p>

          <div className="mt-6 flex justify-center">
            <ConnectButton
              showBalance={false}
              chainStatus="icon"
              accountStatus="address"
            />
          </div>

          <Link
            to="/app"
            className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to App
          </Link>
        </div>
      </div>
    );
  }

  /* State 2: Connect tapi bukan owner → Access Denied */
  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="panel max-w-md p-8 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-xl font-bold text-destructive">
            Access Denied
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Only the project owner can access this admin panel.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Your wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>

          <div className="mt-6 flex justify-center">
            <ConnectButton
              showBalance={false}
              chainStatus="icon"
              accountStatus="address"
            />
          </div>

          <Link
            to="/app"
            className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to App
          </Link>
        </div>
      </div>
    );
  }

  /* State 3: Owner → Dashboard */
  return <AdminDashboard />;
}

/* ─────────────────────────────────────────────
   DASHBOARD — real-time data dari 3 vault
   ───────────────────────────────────────────── */
function AdminDashboard() {
  const { address } = useAccount();
  const { data: ownerBalance, isLoading: loadingBalance } = useBalance({
    address: address as Address,
  });

  // Baca data dari 3 vault contract
  const v1 = useVaultData(AGENTS[0]?.vault);
  const v2 = useVaultData(AGENTS[1]?.vault);
  const v3 = useVaultData(AGENTS[2]?.vault);
  const vaultData = [v1, v2, v3];

  const totalTVL = vaultData.reduce((sum, v) => sum + (v.balance ?? 0), 0);
  const totalYield = vaultData.reduce((sum, v) => sum + (v.yield ?? 0), 0);
  const activeAgents = AGENTS.filter((a) => a.vault).length;

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header + Connect Button */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="neon-text">Admin Dashboard</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Owner-only panel · {NETWORK.name} · Wallet:{" "}
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ConnectButton
              showBalance={false}
              chainStatus="icon"
              accountStatus="address"
            />
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
          </div>
        </div>

        {/* Stat Cards — 4 kolom */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Layers}
            label="Total TVL"
            value={`${totalTVL.toFixed(4)} ${NETWORK.symbol}`}
            hint="Sum of all vault balances"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Yield"
            value={`${totalYield.toFixed(6)} ${NETWORK.symbol}`}
            hint="Accumulated yield from bot"
          />
          <StatCard
            icon={Wallet}
            label="Owner Balance"
            value={
              loadingBalance
                ? "Loading..."
                : ownerBalance
                ? `${Number(formatEther(ownerBalance.value)).toFixed(4)} ${NETWORK.symbol}`
                : `0.0000 ${NETWORK.symbol}`
            }
            hint="Wallet for bot funding"
          />
          <StatCard
            icon={Activity}
            label="Active Agents"
            value={`${activeAgents}`}
            hint="Total AI Agents configured"
          />
        </div>

        {/* Vault Details */}
        <div className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Layers className="h-5 w-5 text-primary" />
            Vault Details
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {AGENTS.map((agent, i) => {
              const v = vaultData[i];
              if (!agent.vault) return null;
              return (
                <div key={agent.id ?? i} className="panel card-3d p-6">
                  <h3 className="text-lg font-semibold">{agent.name}</h3>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {agent.vault.slice(0, 10)}...{agent.vault.slice(-8)}
                  </p>
                  <div className="mt-4 space-y-3 text-sm">
                    <Row
                      label="Balance"
                      value={`${(v.balance ?? 0).toFixed(4)} ${NETWORK.symbol}`}
                    />
                    <Row
                      label="Total Deposited"
                      value={`${(v.deposited ?? 0).toFixed(4)} ${NETWORK.symbol}`}
                    />
                    <Row
                      label="Total Yield"
                      value={`${(v.yield ?? 0).toFixed(6)} ${NETWORK.symbol}`}
                    />
                    <Row
                      label="Profit Rate"
                      value={`${(v.profitRate ?? 0).toFixed(2)}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 panel p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5 text-primary" />
            Quick Actions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/app/vaults"
              className="panel card-3d flex items-center gap-3 p-4 transition hover:border-primary"
            >
              <Layers className="h-5 w-5 text-primary" />
              <span className="text-sm">Manage Vaults</span>
            </Link>
            <Link
              to="/app/agents"
              className="panel card-3d flex items-center gap-3 p-4 transition hover:border-primary"
            >
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm">Manage Agents</span>
            </Link>
            <Link
              to="/app/transactions"
              className="panel card-3d flex items-center gap-3 p-4 transition hover:border-primary"
            >
              <Activity className="h-5 w-5 text-primary" />
              <span className="text-sm">View Transactions</span>
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 panel p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Bot className="h-5 w-5 text-primary" />
            Info
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Panel ini hanya bisa diakses oleh wallet owner:{" "}
              <code className="font-mono text-xs">
                {OWNER_ADDRESS.slice(0, 10)}...{OWNER_ADDRESS.slice(-8)}
              </code>
            </li>
            <li>• Data dibaca langsung dari blockchain (real-time).</li>
            <li>• Auto-refresh setiap 30 detik.</li>
            <li>
              • Untuk detail user & transaksi, gunakan script{" "}
              <code className="font-mono text-xs">check-all.js</code> di VPS:
            </li>
            <li className="ml-4 font-mono text-xs">
              cd /root/botchain-backend && node check-all.js
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   HOOK — baca data per vault
   ───────────────────────────────────────────── */
function useVaultData(vault?: Address) {
  const { data: balance } = useReadContract({
    address: vault,
    abi: AUTO_VAULT_ABI,
    functionName: "getBalance",
    query: { enabled: !!vault, refetchInterval: 30_000 },
  });

  const { data: deposited } = useReadContract({
    address: vault,
    abi: AUTO_VAULT_ABI,
    functionName: "getTotalDeposited",
    query: { enabled: !!vault, refetchInterval: 30_000 },
  });

  const { data: yieldAmount } = useReadContract({
    address: vault,
    abi: AUTO_VAULT_ABI,
    functionName: "getTotalYield",
    query: { enabled: !!vault, refetchInterval: 30_000 },
  });

  const { data: profitRate } = useReadContract({
    address: vault,
    abi: AUTO_VAULT_ABI,
    functionName: "getProfitRate",
    query: { enabled: !!vault, refetchInterval: 30_000 },
  });

  return {
    balance: balance ? Number(formatEther(balance as bigint)) : 0,
    deposited: deposited ? Number(formatEther(deposited as bigint)) : 0,
    yield: yieldAmount ? Number(formatEther(yieldAmount as bigint)) : 0,
    profitRate: profitRate ? Number(profitRate) / 100 : 0,
  };
}

/* ─────────────────────────────────────────────
   KOMPONEN KECIL
   ───────────────────────────────────────────── */
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
      <p className="mt-3 font-display text-xl">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="text-right">{value}</span>
    </div>
  );
}
