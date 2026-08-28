import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { AGENT_TARGET_APY, type AgentStrategy } from "@/lib/agents";
import { NETWORK } from "@/lib/chain-config";
import { useVaultBalance } from "@/hooks/useVaultTvl";

/**
 * ROI estimate derived from the latest on-chain vault balance plus the user's
 * confirmed net position. Refetches after deposits/withdrawals so the numbers
 * always reflect chain state, never fabricated values.
 */
export function RoiEstimate({
  agent,
  position,
  active,
}: {
  agent: AgentStrategy;
  position: number;
  active: boolean;
}) {
  const { balance, isLoading, error, refetch } = useVaultBalance(agent.vault);
  const apy = AGENT_TARGET_APY[agent.risk];
  const share = balance > 0 ? (position / balance) * 100 : 0;
  const projected = position * (apy / 100);

  if (!agent.vault) {
    return (
      <p className="mt-4 rounded-lg border border-border bg-surface p-3 text-[11px] text-muted-foreground">
        Vault address missing — ROI estimates unavailable until configured.
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
          On-chain ROI estimate
        </p>
        <button
          onClick={() => void refetch()}
          aria-label="Refresh on-chain data"
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>

      {error ? (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-destructive">
          <AlertTriangle className="h-3 w-3" /> RPC read failed — {error.message.slice(0, 60)}
        </p>
      ) : isLoading ? (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin text-primary" /> Reading vault balance…
        </p>
      ) : (
        <dl className="mt-2 space-y-1 text-[11px]">
          <Line label="Vault TVL" value={`${balance.toFixed(4)} ${NETWORK.symbol}`} />
          <Line label="Your share" value={active ? `${share.toFixed(2)}%` : "—"} />
          <Line label="Target APY" value={`${apy}%`} />
          <Line
            label="Projected 1y"
            value={active ? `+${projected.toFixed(4)} ${NETWORK.symbol}` : "deposit to activate"}
          />
        </dl>
      )}
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-display">{value}</dd>
    </div>
  );
}
