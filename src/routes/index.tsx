import { createFileRoute } from "@tanstack/react-router";
import { Bot, Shield, TrendingUp, Wallet } from "lucide-react";
import { NetworkGuard } from "@/components/NetworkGuard";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <NetworkGuard>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="max-w-4xl text-center">
          <h1 className="text-5xl font-bold text-neon">
            BOT Yield Master
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            AI-Powered Yield Automation on BOT Chain
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon={Bot} title="AI Agents" description="Automated strategies for maximum yield." />
            <FeatureCard icon={Wallet} title="Secure Vault" description="Deposits secured by smart contracts." />
            <FeatureCard icon={TrendingUp} title="Real-Time ROI" description="Monitor performance in real-time." />
            <FeatureCard icon={Shield} title="Transparent" description="All data is on-chain." />
          </div>
          <a
            href="/app"
            className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground"
          >
            Launch App
          </a>
        </div>
      </div>
    </NetworkGuard>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: typeof Bot; title: string; description: string }) {
  return (
    <div className="panel card-3d p-6">
      <Icon className="h-8 w-8 text-primary" />
      <h3 className="mt-3 font-display text-lg">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
