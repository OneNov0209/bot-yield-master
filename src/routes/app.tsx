import { createFileRoute, Outlet, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { AppShell } from "@/components/AppShell";

const Web3Provider = lazy(() => import("@/components/Web3Provider"));

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "BOT AI Agent Console — Autonomous Yield on BOT Chain" },
      {
        name: "description",
        content:
          "Connect your wallet to deploy AI yield agents, track TVL and manage tBOT positions on BOT Chain.",
      },
      { property: "og:title", content: "BOT AI Agent Console" },
      {
        property: "og:description",
        content: "Deploy AI yield agents and manage tBOT positions on BOT Chain.",
      },
    ],
  }),
  component: AppLayout,
});

function Booting() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="animate-pulse font-display text-sm tracking-widest text-muted-foreground">
        INITIALIZING AGENT CONSOLE…
      </p>
    </div>
  );
}

function AppLayout() {
  return (
    <ClientOnly fallback={<Booting />}>
      <Suspense fallback={<Booting />}>
        <Web3Provider>
          <AppShell>
            <Outlet />
          </AppShell>
        </Web3Provider>
      </Suspense>
    </ClientOnly>
  );
}
