import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { botChain } from "@/lib/chain-config";
import { createWagmiConfig } from "@/lib/wagmi";

export default function Web3Provider({ children }: { children: ReactNode }) {
  const [config] = useState(() => createWagmiConfig());
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={botChain}
          modalSize="wide"
          theme={darkTheme({
            accentColor: "#22c55e",
            accentColorForeground: "#04120a",
            borderRadius: "large",
            overlayBlur: "small",
            fontStack: "system",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
