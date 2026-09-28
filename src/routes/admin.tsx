import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { formatEther, type Address } from "viem";
import { ShieldAlert, Wallet, Layers, Bot } from "lucide-react";
import { NETWORK } from "@/lib/chain-config";

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
  const { data: ownerBalance, isLoading } = useBalance({ address: address as Address });

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-4xl">
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="panel card-3d p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Owner Balance
              </span>
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 font-display text-xl">
              {isLoading
                ? "Loading..."
                : ownerBalance
                  ? `${Number(formatEther(ownerBalance.value)).toFixed(4)} ${NETWORK.symbol}`
                  : "0.0000"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Wallet for bot funding</p>
          </div>

          <div className="panel card-3d p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Network
              </span>
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 font-display text-xl">{NETWORK.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">Chain ID: {NETWORK.id}</p>
          </div>

          <div className="panel card-3d p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Bot Status
              </span>
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 font-display text-xl text-success">Active</p>
            <p className="mt-1 text-xs text-muted-foreground">Running on VPS</p>
          </div>

          <div className="panel card-3d p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Vault Count
              </span>
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 font-display text-xl">3 Vaults</p>
            <p className="mt-1 text-xs text-muted-foreground">Yields, Stable LP, Delta</p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 panel p-6">
          <h2 className="mb-4 text-lg font-semibold">Info</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Panel ini hanya bisa diakses oleh wallet owner.</li>
            <li>• Untuk data lengkap (TVL, yield, transaksi), gunakan script di VPS:</li>
            <li className="ml-4 font-mono text-xs">
              cd /root/botchain-backend && node check-all.js
            </li>
            <li>• Bot berjalan di VPS dengan frekuensi 24 jam.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
