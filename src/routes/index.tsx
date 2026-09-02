import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bot, Shield, TrendingUp, Wallet, ArrowRight, CheckCircle2,
  Zap, Lock, Coins, LineChart, Globe, BarChart3, Layers, ExternalLink, FileText
} from "lucide-react";
import { ActivityLine, ChartFrame, SharePie } from "@/components/charts";
import { useVaultTvl } from "@/hooks/useVaultTvl";
import { useLedger, useMonthlyFlow } from "@/hooks/useLedger";
import { AGENTS } from "@/lib/agents";
import { explorerAddress } from "@/lib/chain-config";
import { NETWORK } from "@/lib/chain-config";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { tvl, vaults, configured, isLoading: tvlLoading } = useVaultTvl();
  const { entries, positionFor } = useLedger();
  const flow = useMonthlyFlow(entries);

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-950 via-background to-cyan-950">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <Zap className="h-3.5 w-3.5" />
            AI-Powered Yield Automation on BOT Chain
          </span>
          <h1 className="mt-6 text-5xl font-bold md:text-7xl">
            <span className="neon-text">BOT Yield Master</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Deposit tBOT, let AI Agents manage your portfolio, and watch your yield grow automatically.
            Transparent, secure, and fully on-chain.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Launch App <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-4 text-lg font-semibold text-foreground transition-all hover:bg-accent"
            >
              How it works
            </a>
          </div>
        </div>
      </div>

      {/* LIVE STATS */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Value Locked" value={tvlLoading ? "Loading..." : `${tvl.toFixed(4)} tBOT`} />
          <StatCard label="Active Agents" value={String(AGENTS.length)} />
          <StatCard label="Network" value="BOT Chain Testnet" />
          <StatCard label="Block Explorer" value="BOT Scan" />
        </div>
      </div>

      {/* ABOUT SECTION */}
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">What is BOT Yield Master?</h2>
            <p className="mt-4 text-muted-foreground">
              BOT Yield Master is a decentralized application (dApp) built on the BOT Chain ecosystem [citation:2][citation:14].
              It combines AI-driven automation with DeFi yield strategies to help users optimize their crypto asset management.
            </p>
            <p className="mt-4 text-muted-foreground">
              By leveraging BOT Chain's modular architecture and native AI Agent support (AIDID protocol),
              our platform allows users to deposit tBOT and automatically earn yield from specialized strategies.
            </p>
            <div className="mt-8 space-y-4">
              <FeatureRow icon={CheckCircle2} title="Non-Custodial" description="You own your funds at all times." />
              <FeatureRow icon={CheckCircle2} title="AI-Powered" description="Automated strategies that optimize yield in real-time." />
              <FeatureRow icon={CheckCircle2} title="Fully Transparent" description="All transactions are on-chain and auditable." />
            </div>
          </div>
          <div className="space-y-6">
            {/* Chart Live */}
            <ChartFrame
              title="Live Protocol Performance"
              subtitle="Real-time on-chain data"
              empty="No on-chain activity yet."
            >
              <ActivityLine
                data={flow.map((d) => ({ time: d.month, value: d.value }))}
                label={NETWORK.symbol}
              />
            </ChartFrame>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS (ROADMAP VERTIKAL) */}
      <div id="how-it-works" className="border-y border-border/60 bg-card/50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-2 text-muted-foreground">Start earning in 3 simple steps.</p>
          </div>
          <div className="mt-12 space-y-8">
            <StepCard number="01" title="Connect Wallet" description="Connect your wallet and switch to BOT Chain Testnet (Chain ID 968)." />
            <StepCard number="02" title="Deposit tBOT" description="Deposit tBOT into any AI Agent vault. Choose based on your risk preference." />
            <StepCard number="03" title="Earn Automatically" description="AI Agent farms, compounds, and reports yield in real-time." />
            <StepCard number="04" title="Withdraw Anytime" description="Withdraw your principal + profits anytime, with full transparency." />
          </div>
        </div>
      </div>

      {/* STRATEGIES */}
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Advanced Yield Strategies</h2>
          <p className="mt-2 text-muted-foreground">Three AI Agents, each with different risk profiles.</p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {AGENTS.map((agent) => {
            const pos = positionFor(agent.id);
            return (
              <div key={agent.id} className="rounded-xl border border-border/60 bg-card/50 p-6 transition-all hover:border-primary/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{agent.name}</h3>
                  <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                    {agent.risk} risk
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{agent.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Position</span>
                  <span className="text-lg font-bold text-neon">{pos.net.toFixed(4)} tBOT</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SMART CONTRACTS */}
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Smart Contract Addresses</h2>
          <p className="mt-2 text-muted-foreground">Verify our contracts on BOT Scan.</p>
        </div>
        <div className="mt-8 space-y-3">
          {vaults.map((vault) => (
            <div
              key={vault.agentId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/50 px-4 py-3"
            >
              <div>
                <p className="font-display text-sm">{vault.name}</p>
                {vault.address ? (
                  <a
                    href={explorerAddress(vault.address)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    {vault.address.slice(0, 10)}...{vault.address.slice(-8)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">Not configured</p>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">TVL: {vault.balance.toFixed(4)} tBOT</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold">Ready to automate your yield?</h2>
          <p className="mt-4 text-muted-foreground">Start earning with BOT Yield Master today.</p>
          <Link
            to="/app"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90"
          >
            Launch App <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-6 text-center">
      <p className="text-2xl font-bold text-neon">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function FeatureRow({ icon: Icon, title, description }: { icon: typeof CheckCircle2; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 text-primary" />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary bg-primary/10 text-lg font-bold text-primary">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="absolute left-6 top-14 h-full w-px bg-border" />
    </div>
  );
}
