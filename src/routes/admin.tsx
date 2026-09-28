import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
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
} from "lucide-react";
import { NETWORK } from "@/lib/chain-config";

const Web3Provider = lazy(() => import("@/components/Web3Provider"));

const OWNER_ADDRESS =
  "0xaad57141504a022af3f4f5764fe3670ca7af060b".toLowerCase();

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
  // Render wagmi hanya di client — hindari hydration mismatch
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
    setIsAuthorized(
      !!address && address.toLowerCase() === OWNER_ADDRESS,
    );
  }, [address]);

  if (!isConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="panel max-w-md p-8 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-warning" />
          <h1 className="mt-4 text-xl font-bold">Wallet Not Connected</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please connect your wallet to access the admin panel.
          </p>
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

  return <AdminDashboard />;
}

function AdminDashboard() {
  const { address } = useAccount();
  const { data: ownerBalance, isLoading } = useBalance({
    address: address as Address,
  });

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="neon-text">Admin Dashboard</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Owner-only panel · {NETWORK.name} · Wallet:{" "}
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="h-3 w-3" /> Back
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Owner Balance"
            icon={<Wallet className="h-4 w-4 text-primary" />}
            value={
              isLoading
                ? "Loading..."
                : ownerBalance
                ? `${Number(formatEther(ownerBalance.value)).toFixed(4)} ${NETWORK.symbol}`
                : "0.0000"
            }
            sub="Wallet for bot funding"
          />
          <StatCard
            label="Network"
            icon={<Layers className="h-4 w-4 text-primary" />}
            value={NETWORK.name}
            sub={`Chain ID: ${NETWORK.id}`}
          />
          <StatCard
            label="Bot Status"
            icon={<Bot className="h-4 w-4 text-primary" />}
            value="Active"
            sub="Running on VPS"
            valueClass="text-success"
          />
          <StatCard
            label="Vault Count"
            icon={<Layers className="h-4 w-4 text-primary" />}
            value="3 Vaults"
            sub="Yields, Stable LP, Delta"
          />
        </div>

        <div className="mt-8 panel p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Activity className="h-5 w-5 text-primary" />
            Info
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Panel ini hanya bisa diakses oleh wallet owner.</li>
            <li>
              • Untuk data lengkap (TVL, yield, transaksi), gunakan script di
              VPS:
            </li>
            <li className="ml-4 font-mono text-xs">
              cd /root/botchain-backend && node check-all.js
            </li>
            <li>• Bot berjalan di VPS dengan frekuensi 24 jam.</li>
          </ul>
        </div>

        <div className="mt-8 panel p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5 text-primary" />
            Quick Actions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
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
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  icon,
  value,
  sub,
  valueClass = "",
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="panel card-3d p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        {icon}
      </div>
      <p className={`mt-3 font-display text-xl ${valueClass}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
