import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, Coins, Layers, ShieldCheck } from "lucide-react";
import { formatEther } from "viem";
import { useAccount, useBalance, useBlockNumber } from "wagmi";
import { NetworkGuard } from "@/components/NetworkGuard";
import { useLedger } from "@/hooks/useLedger";
import { NETWORK } from "@/lib/chain-config";
import { AGENTS } from "@/lib/agents";
import { useVaultTvl } from "@/hooks/useVaultTvl";
import { ChartFrame } from "@/components/charts";

export const Route = createFileRoute("/app/")({
  component: () => (
    <NetworkGuard>
      <Dashboard />
    </NetworkGuard>
  ),
});

function Dashboard() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { positionFor, usage } = useLedger();
  const { tvl, configured, isLoading: tvlLoading, error: tvlError } = useVaultTvl();

  const activeAgents = AGENTS.filter((a) => positionFor(a.id).active).length;
  const myDeposited = AGENTS.reduce((sum, a) => sum + positionFor(a.id).net, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl">
          <span className="neon-text">Agent Dashboard</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live data from {NETWORK.name} · block #{blockNumber?.toString() ?? "—"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={Layers}
          label="Protocol TVL"
          value={
            !configured
              ? "No vaults configured"
              : tvlError
                ? "RPC unavailable"
                : tvlLoading
                  ? "Loading…"
                  : `${tvl.toFixed(4)} ${NETWORK.symbol}`
          }
          hint="Sum of on-chain vault balances"
        />
        <Stat
          icon={Coins}
          label="Wallet Balance"
          value={`${balance ? Number(formatEther(balance.value)).toFixed(4) : "0.0000"} ${NETWORK.symbol}`}
          hint={address ? `${address.slice(0, 6)}…${address.slice(-4)}` : ""}
        />
        <Stat
          icon={Activity}
          label="My Deposits"
          value={`${myDeposited.toFixed(4)} ${NETWORK.symbol}`}
          hint={`${activeAgents} active agent${activeAgents === 1 ? "" : "s"}`}
        />
        <Stat
          icon={ShieldCheck}
          label="Daily Interactions"
          value={`${usage.used} / ${usage.limit}`}
          hint="Fair-use limit per address"
        />
      </div>

      <div className="panel card-3d p-5">
        <h2 className="text-lg">Agent Status</h2>
        <div className="mt-4 space-y-3">
          {AGENTS.map((agent) => {
            const pos = positionFor(agent.id);
            return (
              <div
                key={agent.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-surface px-4 py-3"
              >
                <div>
                  <p className="font-display text-sm">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.tagline}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {pos.net.toFixed(4)} {NETWORK.symbol}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      pos.active
                        ? "border border-success/50 text-success"
                        : "border border-border text-muted-foreground"
                    }`}
                  >
                    {pos.active ? "Active" : "Idle"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="panel card-3d neon-ring p-5 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-3 font-display text-xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
