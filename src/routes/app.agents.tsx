import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { NetworkGuard } from "@/components/NetworkGuard";
import { TxDialog } from "@/components/TxDialog";
import { AGENTS, type AgentStrategy } from "@/lib/agents";
import { NETWORK } from "@/lib/chain-config";
import { useLedger } from "@/hooks/useLedger";

export const Route = createFileRoute("/app/agents")({
  head: () => ({
    meta: [
      { title: "AI Yield Agents — BOT AI Agent" },
      {
        name: "description",
        content:
          "Pick an on-chain AI strategy — Yields Aggregator, Stable LP Hunter or Delta Neutral Bot — and deposit tBOT on BOT Chain.",
      },
      { property: "og:title", content: "AI Yield Agents on BOT Chain" },
      {
        property: "og:description",
        content: "Deploy autonomous yield strategies and manage positions with tBOT.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <NetworkGuard>
      <Agents />
    </NetworkGuard>
  ),
});

function Agents() {
  const { positionFor } = useLedger();
  const [dialog, setDialog] = useState<{
    agent: AgentStrategy;
    mode: "deposit" | "withdraw";
  } | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl">
          <span className="neon-text">AI Agents</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Autonomous strategies executing on {NETWORK.name}.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {AGENTS.map((agent) => {
          const pos = positionFor(agent.id);
          return (
            <div key={agent.id} className="panel neon-ring flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg">{agent.name}</h2>
                <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                  {agent.risk} risk
                </span>
              </div>
              <p className="mt-1 text-xs text-neon">{agent.tagline}</p>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{agent.description}</p>

              <div className="mt-4 flex items-center justify-between text-sm">
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

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setDialog({ agent, mode: "deposit" })}
                  className="flex-1 rounded-lg bg-primary py-2.5 font-display text-sm font-semibold text-primary-foreground"
                >
                  Deposit
                </button>
                <button
                  disabled={!pos.active}
                  onClick={() => setDialog({ agent, mode: "withdraw" })}
                  className="flex-1 rounded-lg border border-border py-2.5 text-sm disabled:opacity-50"
                >
                  Withdraw
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {dialog && (
        <TxDialog
          agent={dialog.agent}
          mode={dialog.mode}
          maxAmount={positionFor(dialog.agent.id).net}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
