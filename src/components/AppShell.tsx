import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Bot, Vault, History, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { NETWORK } from "@/lib/chain-config";
import logo from "@/assets/botchain-logo.png";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/agents", label: "Agents", icon: Bot },
  { to: "/app/vaults", label: "Vaults", icon: Vault },
  { to: "/app/transactions", label: "Transactions", icon: History },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="BOT Chain logo" className="h-9 w-9" />
            <span className="hidden font-display text-sm tracking-widest text-muted-foreground sm:block">
              BOT CHAIN
            </span>
          </Link>
          <div className="flex-1 text-center">
            <span className="font-display text-base neon-text md:text-lg">BOT AI Agent</span>
          </div>
          <ConnectButton showBalance={{ smallScreen: false, largeScreen: true }} />
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-border/70 p-4 md:block">
          <nav className="space-y-1">
            {NAV.map(({ to, label, icon: Icon, ...rest }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: "exact" in rest }}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                activeProps={{
                  className:
                    "bg-surface-2 text-foreground border border-primary/40 shadow-[var(--glow-neon)]",
                }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="panel mt-6 p-3 text-xs text-muted-foreground">
            <p className="font-display text-[10px] tracking-widest text-neon">NETWORK</p>
            <p className="mt-1 text-foreground">{NETWORK.name}</p>
            <p>Chain ID {NETWORK.id}</p>
            <a
              href={NETWORK.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
            >
              Block explorer <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>

      <nav className="sticky bottom-0 z-40 flex border-t border-border/70 bg-background/90 backdrop-blur md:hidden">
        {NAV.map(({ to, label, icon: Icon, ...rest }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: "exact" in rest }}
            className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground"
            activeProps={{ className: "text-primary" }}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
