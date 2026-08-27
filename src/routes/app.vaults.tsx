import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { NetworkGuard } from "@/components/NetworkGuard";
import { explorerAddress, NETWORK } from "@/lib/chain-config";
import { useVaultTvl } from "@/hooks/useVaultTvl";
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
  const { tvl, vaults, configured, isLoading, error } = useVaultTvl();
  const { positionFor } = useLedger();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl">
          <span className="neon-text">Vaults</span>
        </h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          Total value locked:{" "}
          {!configured ? (
            "no vaults configured"
          ) : error ? (
            <span className="text-destructive">RPC unavailable</span>
          ) : isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : (
            `${tvl.toFixed(4)} ${NETWORK.symbol}`
          )}
        </p>
      </div>

      {error && (
        <div className="panel flex items-start gap-2 border-destructive/40 p-4 text-xs text-muted-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
          <span>
            Could not read vault balances from {NETWORK.rpcUrl}: {error.message.slice(0, 140)}
          </span>
        </div>
      )}

      <div className="space-y-3">
        {vaults.map((v) => {
          const pos = positionFor(v.agentId);
          return (
            <div key={v.agentId} className="panel flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="font-display text-sm">{v.name}</p>
                {v.address ? (
                  <a
                    href={explorerAddress(v.address)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    {v.address.slice(0, 10)}…{v.address.slice(-8)}{" "}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Vault contract not configured for this deployment
                  </p>
                )}
              </div>
              <div className="flex gap-8 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Vault TVL
                  </p>
                  <p className="font-display">
                    {!v.address ? (
                      "—"
                    ) : v.error ? (
                      <span className="text-destructive">error</span>
                    ) : v.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      `${v.balance.toFixed(4)} ${NETWORK.symbol}`
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    My position
                  </p>
                  <p className="font-display">
                    {pos.net.toFixed(4)} {NETWORK.symbol}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
