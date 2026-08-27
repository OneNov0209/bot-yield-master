import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { NetworkGuard } from "@/components/NetworkGuard";
import { getAgent } from "@/lib/agents";
import { explorerTx, NETWORK } from "@/lib/chain-config";
import { useLedger } from "@/hooks/useLedger";

export const Route = createFileRoute("/app/transactions")({
  head: () => ({
    meta: [
      { title: "Transaction History — BOT AI Agent" },
      {
        name: "description",
        content:
          "Confirmed deposits and withdrawals for your wallet, each linked to the BOT Chain block explorer.",
      },
      { property: "og:title", content: "Transaction History — BOT AI Agent" },
      {
        property: "og:description",
        content: "Every confirmed agent deposit and withdrawal with explorer links.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <NetworkGuard>
      <Transactions />
    </NetworkGuard>
  ),
});

function Transactions() {
  const { entries, usage } = useLedger();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl">
          <span className="neon-text">Transactions</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirmed on-chain activity · daily usage {usage.used}/{usage.limit}
        </p>
      </div>

      <div className="panel overflow-x-auto p-0">
        {entries.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No confirmed transactions yet for this wallet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Tx</th>
              </tr>
            </thead>
            <tbody>
              {[...entries]
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((e) => (
                  <tr key={e.hash} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(e.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          e.type === "deposit"
                            ? "rounded-full border border-success/50 px-2 py-0.5 text-xs text-success"
                            : "rounded-full border border-warning/50 px-2 py-0.5 text-xs text-warning"
                        }
                      >
                        {e.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getAgent(e.agentId)?.name ?? e.agentId}</td>
                    <td className="px-4 py-3 font-display">
                      {Number(e.amount).toFixed(4)} {NETWORK.symbol}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={explorerTx(e.hash)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        {e.hash.slice(0, 8)}… <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
