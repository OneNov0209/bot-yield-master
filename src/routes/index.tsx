import { createFileRoute } from "@tanstack/react-router";
import {
  Bot,
  Shield,
  TrendingUp,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Zap,
  Lock,
  Coins,
  LineChart,
  Globe,
  BarChart3,
  Layers,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
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

      {/* FITUR UTAMA */}
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Why Choose BOT Yield Master?</h2>
          <p className="mt-2 text-muted-foreground">
            The future of DeFi is autonomous, transparent, and secure.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon={Bot} title="AI Agents" description="Automated strategies that rebalance and optimize yield in real-time." />
          <FeatureCard icon={Wallet} title="Secure Vault" description="Deposits secured by smart contracts. No intermediaries." />
          <FeatureCard icon={TrendingUp} title="Real-Time ROI" description="Track your portfolio and AI Agent performance live." />
          <FeatureCard icon={Shield} title="Transparent" description="All transactions are on-chain and fully auditable." />
          <FeatureCard icon={Lock} title="Non-Custodial" description="You own your funds at all times. No lock-in periods." />
          <FeatureCard icon={LineChart} title="Auto-Compounding" description="Profits are automatically reinvested to maximize returns." />
        </div>
      </div>

      {/* CARA KERJA (ROADMAP VERTIKAL) */}
      <div id="how-it-works" className="border-y border-border/60 bg-card/50 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="mt-2 text-muted-foreground">
              Start earning in 3 simple steps.
            </p>
          </div>
          <div className="mt-12 space-y-8">
            <StepCard number="01" title="Connect Wallet" description="Connect your wallet and switch to BOT Chain Testnet (Chain ID 968)." />
            <StepCard number="02" title="Deposit tBOT" description="Deposit tBOT into any AI Agent vault. Choose based on your risk preference." />
            <StepCard number="03" title="Earn Automatically" description="AI Agent farms, compounds, and reports yield in real-time." />
            <StepCard number="04" title="Withdraw Anytime" description="Withdraw your principal + profits anytime, with full transparency." />
          </div>
        </div>
      </div>

      {/* STRATEGI */}
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Advanced Yield Strategies</h2>
          <p className="mt-2 text-muted-foreground">
            Three AI Agents, each with different risk profiles.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <StrategyCard icon={Layers} title="Yields Aggregator" description="Medium risk. Rebalances across the deepest BOT Chain pools for high yield." apy="14.2%" risk="Medium" />
          <StrategyCard icon={Coins} title="Stable LP Hunter" description="Low risk. Targets stable-to-stable liquidity pairs with minimal impermanent loss." apy="6.5%" risk="Low" />
          <StrategyCard icon={BarChart3} title="Delta Neutral Bot" description="High risk. Hedged farming with funding-rate capture for maximum returns." apy="23.8%" risk="High" />
        </div>
      </div>

      {/* SMART CONTRACTS */}
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Smart Contract Addresses</h2>
          <p className="mt-2 text-muted-foreground">Verify our contracts on BOT Scan.</p>
        </div>
        <div className="mt-8 space-y-3">
          {[
            { name: "Yields Aggregator", address: "0x72bc0d58453128BCba6F5c891503809C42260C24" },
            { name: "Stable LP Hunter", address: "0x7726659902bD4eB59F9a3b4C76402Cd900714216" },
            { name: "Delta Neutral Bot", address: "0x080010f857C443C58DCfEE3570251321C3211af7" },
          ].map((contract) => (
            <div
              key={contract.name}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/50 px-4 py-3"
            >
              <div>
                <p className="font-display text-sm">{contract.name}</p>
                <a
                  href={`https://scan.bohr.life/address/${contract.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  {contract.address.slice(0, 10)}...{contract.address.slice(-8)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold">Ready to automate your yield?</h2>
          <p className="mt-4 text-muted-foreground">
            Start earning with BOT Yield Master today.
          </p>
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

function FeatureCard({ icon: Icon, title, description }: { icon: typeof Bot; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-6 transition-all hover:border-primary/50 hover:bg-card">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
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

function StrategyCard({ icon: Icon, title, description, apy, risk }: { icon: typeof Layers; title: string; description: string; apy: string; risk: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-6 transition-all hover:border-primary/50">
      <div className="flex items-center justify-between">
        <Icon className="h-8 w-8 text-primary" />
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          {risk} risk
        </span>
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Target APY</span>
        <span className="text-lg font-bold text-neon">{apy}</span>
      </div>
    </div>
  );
}
