import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bot, ShieldCheck, Sparkles, Activity } from "lucide-react";
import logo from "@/assets/botchain-logo.png";
import { NETWORK } from "@/lib/chain-config";
import { AGENTS } from "@/lib/agents";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BOT AI Agent — Autonomous Yield on BOT Chain" },
      {
        name: "description",
        content:
          "Autonomous Yield. Intelligent Future. On-chain AI agents that automate yield farming and asset management on BOT Chain.",
      },
      { property: "og:title", content: "BOT AI Agent — Autonomous Yield on BOT Chain" },
      {
        property: "og:description",
        content:
          "On-chain AI agents that automate yield farming and crypto asset management on BOT Chain.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Bot,
    title: "On-chain AI Agents",
    body: "Pick a strategy, deposit tBOT, and let the agent rebalance positions autonomously.",
  },
  {
    icon: Activity,
    title: "Transparent Performance",
    body: "Every metric is derived from confirmed BOT Chain transactions — no simulated numbers.",
  },
  {
    icon: ShieldCheck,
    title: "Fair-Use Guardrails",
    body: "Max 20 interactions per address per day. No self-trading or wash-trading surfaces.",
  },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-25" />

      <header className="relative z-10 flex h-20 items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <img src={logo} alt="BOT Chain logo" className="h-10 w-10" />
          <span className="font-display text-sm tracking-[0.3em] text-muted-foreground">
            BOT CHAIN
          </span>
        </div>
        <Link
          to="/app"
          className="rounded-lg border border-primary/40 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
        >
          Launch App
        </Link>
      </header>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-10 text-center md:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-neon/40 px-3 py-1 text-xs tracking-widest text-neon">
          <Sparkles className="h-3 w-3" /> {NETWORK.name.toUpperCase()} · CHAIN ID {NETWORK.id}
        </span>

        <h1 className="mt-8 text-4xl leading-tight md:text-6xl">
          <span className="neon-text">Autonomous Yield.</span>
          <br />
          Intelligent Future.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          BOT AI Agent deploys autonomous strategies on BOT Chain — aggregating yield, hunting
          stable liquidity, and managing your {NETWORK.symbol} around the clock.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/app"
            className="glow inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            Launch App <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={NETWORK.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-border px-6 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            View Explorer
          </a>
        </div>

        <div className="mt-20 grid gap-4 text-left md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="panel card-3d neon-ring p-5 transition-all">
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 text-base">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-left">
          <h2 className="text-center text-2xl">Available Strategies</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {AGENTS.map((agent) => (
              <div key={agent.id} className="panel card-3d p-5">
                <p className="font-display text-sm text-neon">{agent.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">{agent.tagline}</p>
                <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
                  Risk · {agent.risk}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
