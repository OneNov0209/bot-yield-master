import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { createWagmiConfig } from "@/lib/wagmi";
import { botChain } from "@/lib/chain-config";
import Web3Provider from "@/components/Web3Provider";

export const Route = createFileRoute("/")({
  component: () => (
    <Web3Provider>
      <Home />
    </Web3Provider>
  ),
});

function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-3xl">Welcome to BOT Yield Master</h1>
    </div>
  );
}
