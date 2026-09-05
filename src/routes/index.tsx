import { createFileRoute } from "@tanstack/react-router";
import { Bot, Shield, TrendingUp, Wallet, ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BotPriceChart } from "@/components/BotPriceChart";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://raw.githubusercontent.com/OneNov0209/logo/refs/heads/main/BotChain.png"
              alt="BOT Chain Logo"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-lg font-semibold">BOT Yield Master</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
              Home
            </Link>
            <Link to="/faq" className="text-sm text-muted-foreground hover:text-primary">
              FAQ
            </Link>
            <Link to="/docs" className="text-sm text-muted-foreground hover:text-primary">
              Docs
            </Link>
            <Link
              to="/app"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Launch App
            </Link>
          </nav>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="border-t border-border/60 bg-background px-6 py-4 md:hidden">
            <nav className="space-y-4">
              <Link to="/" className="block text-sm text-muted-foreground hover:text-primary">
                Home
              </Link>
              <Link to="/faq" className="block text-sm text-muted-foreground hover:text-primary">
                FAQ
              </Link>
              <Link to="/docs" className="block text-sm text-muted-foreground hover:text-primary">
                Docs
              </Link>
              <Link
                to="/app"
                className="block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Launch App
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-neon/20" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
          {/* Logo BOT Chain - Rounded Circle */}
          <img
            src="https://raw.githubusercontent.com/OneNov0209/logo/refs/heads/main/BotChain.png"
            alt="BOT Chain Logo"
            className="mx-auto mb-6 h-20 w-20 rounded-full border border-primary/30 object-cover shadow-lg"
          />
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

      {/* Live BOT Price Section */}
      <div className="mx-auto max-w-6xl px-6 pb-4 pt-4">
        <BotPriceChart />
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

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/40 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h4 className="font-display text-sm font-semibold text-foreground">Official Links</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href="https://www.botchain.ai" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                    BOT Chain Website
                  </a>
                </li>
                <li>
                  <a href="https://faucet.botchain.ai" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                    Testnet Faucet
                  </a>
                </li>
                <li>
                  <a href="https://dex.botchain.ai/#/swap" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                    DEX
                  </a>
                </li>
                <li>
                  <a href="https://bridge.botchain.ai" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                    Cross-Chain Bridge
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold text-foreground">Resources</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href="https://wallet.botchain.ai" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                    Official Wallet
                  </a>
                </li>
                <li>
                  <a href="https://scan.botchain.ai" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                    Block Explorer
                  </a>
                </li>
                <li>
                  <a href="https://dev-docs.botchain.ai/docs/Developers/quick-guide/" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                    Developer Documentation
                  </a>
                </li>
                <li>
                  <a href="https://github.com/BOTChain-bot" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm font-semibold text-foreground">Token Info</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href="https://www.coingecko.com/en/coins/bot" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                    BOT on CoinGecko
                  </a>
                </li>
                <li>
                  <a href="https://coinmarketcap.com/currencies/bot-chain/" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                    BOT on CoinMarketCap
                  </a>
                </li>
                <li>
                  <a href="https://scan.botchain.ai/token/0xD5452816194a3784dBa983426cCe7c122F4abd30" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                    WBOT Contract
                  </a>
                </li>
                <li>
                  <a href="https://scan.botchain.ai/token/0xaBabc7Ddc03e501d190C676BF3d92ef0e6e87a3C" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                    USDT Contract
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} BOT Yield Master. All rights reserved.</p>
          </div>
        </div>
      </footer>
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
