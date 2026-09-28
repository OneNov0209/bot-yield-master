import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAccount, useReadContract, useBalance } from "wagmi";
import { formatEther, type Address } from "viem";
import { ShieldAlert, Users, Layers, Activity, Bot, TrendingUp } from "lucide-react";
import { NETWORK } from "@/lib/chain-config";
import { AGENTS } from "@/lib/agents";
import { AUTO_VAULT_ABI } from "@/hooks/useVaultTvl";

const OWNER_ADDRESS = "0xaAD57141504A022af3f4F5764FE3670Ca7af060b".toLowerCase();

export const Route = createFileRoute("/admin")({
  component: Admin,
});

function Admin() {
  const { address, isConnected } = useAccount();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (address && address.toLowerCase() === OWNER_ADDRESS) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
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
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const { address } = useAccount();
  const { data: ownerBalance } = useBalance({ address: address as Address });

  // Baca data dari 3 kontrak
  const v1 = useVaultData(AGENTS[0]?.vault);
  const v2 = useVaultData(AGENTS[1]?.vault);
  const v3 = useVaultData(AGENTS[2]?.vault);

  const totalTVL =
    (v1.balance ?? 0) + (v2.balance ?? 0) + (v3.balance ?? 0);
  const totalYield =
    (v1.yield ?? 0) + (v2.yield ?? 0) + (v3.yield ?? 0);

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            <span className="neon-text">Admin Dashboard</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Owner-only panel · {NETWORK.name} · Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        {/* Stat Cards */}
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
            icon={Bot}
            label="Owner Balance"
            value={`${ownerBalance ? Number(formatEther(ownerBalance.value)).toFixed(4) : "0.0000"} ${NETWORK.symbol}`}
            hint="Wallet for bot funding"
          />
          <StatCard
            icon={Activity}
            label="Active Agents"
            value={`${AGENTS.filter((a) => (a.vault ? true : false)).length}`}
            hint="Total AI Agents configured"
          />
        </div>

        {/* Vault Details */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold">Vault Details</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {AGENTS.map((agent, i) => {
              const v = [v1, v2, v3][i];
              return (
                <div key={agent.id} className="panel card-3d p-6">
                  <h3 className="text-lg font-semibold">{agent.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {agent.vault?.slice(0, 10)}...{agent.vault?.slice(-8)}
                  </p>
                  <div className="mt-4 space-y-3 text-sm">
                    <Row label="Balance" value={`${(v.balance ?? 0).toFixed(4)} ${NETWORK.symbol}`} />
                    <Row label="Total Deposited" value={`${(v.deposited ?? 0).toFixed(4)} ${NETWORK.symbol}`} />
                    <Row label="Total Yield" value={`${(v.yield ?? 0).toFixed(6)} ${NETWORK.symbol}`} />
                    <Row label="Profit Rate" value={`${(v.profitRate ?? 0).toFixed(2)}%`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 panel p-6">
          <h2 className="mb-4 text-lg font-semibold">Info</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Panel ini hanya bisa diakses oleh wallet owner: <code>{OWNER_ADDRESS.slice(0, 10)}...{OWNER_ADDRESS.slice(-8)}</code></li>
            <li>• Data dibaca langsung dari blockchain (real-time).</li>
            <li>• Auto-refresh setiap 30 detik.</li>
            <li>• Untuk detail user & transaksi, gunakan script <code>check-all.js</code> di VPS.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

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
    balance: balance ? Number(formatEther(balance)) : 0,
    deposited: deposited ? Number(formatEther(deposited)) : 0,
    yield: yieldAmount ? Number(formatEther(yieldAmount)) : 0,
    profitRate: profitRate ? Number(profitRate) / 100 : 0,
  };
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
