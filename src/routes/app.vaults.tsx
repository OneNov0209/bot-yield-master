import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { NetworkGuard } from "@/components/NetworkGuard";
import { AGENTS } from "@/lib/agents";
import { explorerAddress, NETWORK } from "@/lib/chain-config";
import { useVaultBalance, useVaultTvl } from "@/hooks/useVaultTvl";
import { useLedger } from "@/hooks/useLedger";

export const Route = createFileRoute("/app/vaults")({
  head: () => ({
    meta: [
      { title: "Vaults & TVL — BOT AI Agent" },
      {
        name: "description",
        content:
          "Inspect on-chain vault balances, total value locked and your position in each BOT Chain AI agent vault.",
      },
      { property: "og:title", content: "Vaults & TVL on BOT Chain" },
      {
        property: "og:description",
        content: "On-chain vault balances and your positions across AI yield agents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <NetworkGuard>
      <Vaults />
    </NetworkGuard>
  ),
});

function Vaults() {
  const { tvl, configured } = useVaultTvl();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl">
          <span className="neon-text">Vaults</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Total value locked:{" "}
          {configured ? `${tvl.toFixed(4)} ${NETWORK.symbol}` : "no vaults configured"}
        </p>
      </div>

      <div className="space-y-3">
        {AGENTS.map((agent) => (
          <VaultRow key={agent.id} agentId={agent.id} name={agent.name} vault={agent.vault} />
        ))}
      </div>
    </div>
  );
}

function VaultRow({
  agentId,
  name,
  vault,
}: {
  agentId: string;
  name: string;
  vault?: `0x${string}` | undefined;
}) {
  const { balance } = useVaultBalance(vault);
  const { positionFor } = useLedger();
  const pos = positionFor(agentId);

  return (
    <div className="panel flex flex-wrap items-center justify-between gap-4 p-5">
      <div className="min-w-0">
        <p className="font-display text-sm">{name}</p>
        {vault ? (
          <a
            href={explorerAddress(vault)}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {vault.slice(0, 10)}…{vault.slice(-8)} <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            Vault contract not configured for this deployment
          </p>
        )}
      </div>
      <div className="flex gap-8 text-sm">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Vault TVL</p>
          <p className="font-display">
            {vault ? `${balance.toFixed(4)} ${NETWORK.symbol}` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">My position</p>
          <p className="font-display">
            {pos.net.toFixed(4)} {NETWORK.symbol}
          </p>
        </div>
      </div>
    </div>
  );
}
