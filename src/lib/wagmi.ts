import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rabbyWallet,
  trustWallet,
  okxWallet,
  binanceWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, fallback, http } from "wagmi";
import { botChain } from "./chain-config";
import { WALLETCONNECT_PROJECT_ID } from "./chain-config";

export function createWagmiConfig() {
  const connectors = connectorsForWallets(
    [
      {
        groupName: "Popular",
        wallets: [
          metaMaskWallet,
          rabbyWallet,
          trustWallet,
          okxWallet,
          binanceWallet,
          walletConnectWallet,
        ],
      },
    ],
    {
      appName: "BOT AI Agent",
      projectId: WALLETCONNECT_PROJECT_ID,
    },
  );

  return createConfig({
    connectors,
    chains: [botChain] as const,
    transports: {
      [botChain.id]: fallback(
        botChain.rpcUrls.default.http.map((url) =>
          http(url, {
            retryCount: 1,
            timeout: 8_000,
          }),
        ),
      ),
    },
    ssr: false,
  });
}
