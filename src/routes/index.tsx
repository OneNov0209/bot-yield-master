import { createFileRoute } from "@tanstack/react-router";
import { Bot, Shield, TrendingUp, Wallet, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-neon/20" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            <Bot className="h-3.5 w-3.5" />
            AI-Powered Yield Automation on BOT Chain
          </span>
          <h1 className="mt-6 text-5xl font-bold md:text-7xl">
            <span className="neon-text">BOT Yield Master</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Deposit BOT, let AI Agents manage your portfolio, and watch your yield grow automatically.
            Transparent, secure, and fully on-chain.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/app"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Launch App <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-4 text-lg font-semibold text-foreground transition-all hover:bg-accent"
            >
              How it works
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Why Choose Us?</h2>
          <p className="mt-2 text-muted-foreground">
            The future of DeFi is autonomous, transparent, and secure.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={Bot} title="AI Agents" description="Automated strategies that rebalance and optimize yield in real-time." />
          <FeatureCard icon={Wallet} title="Secure Vault" description="Deposits secured by smart contracts. No intermediaries." />
          <FeatureCard icon={TrendingUp} title="Real-Time ROI" description="Track your portfolio and AI Agent performance live." />
          <FeatureCard icon={Shield} title="Transparent" description="All transactions are on-chain and fully auditable." />
        </div>
      </div>

      {/* How it works Section */}
      <div id="how-it-works" className="border-y border-border/60 bg-card/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">How it works</h2>
            <p className="mt-2 text-muted-foreground">Start earning in 3 simple steps.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <StepCard step="01" title="Connect Wallet" description="Connect your wallet and switch to BOT Chain." />
            <StepCard step="02" title="Deposit BOT" description="Deposit BOT into any AI Agent vault." />
            <StepCard step="03" title="Earn Automatically" description="AI Agent farms, compounds, and reports yield." />
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold">Ready to automate your yield?</h2>
          <p className="mt-4 text-muted-foreground">
            Start earning with BOT Yield Master today.
          </p>
          <a
            href="/app"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-all hover:bg-primary/90"
          >
            Launch App <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: typeof Bot; title: string; description: string }) {
  return (
    <div className="panel card-3d p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 font-display text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="panel card-3d p-6 text-center">
      <span className="font-display text-4xl font-bold text-neon">{step}</span>
      <h3 className="mt-4 text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
