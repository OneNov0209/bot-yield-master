import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rabbyWallet,
  trustWallet,
  okxWallet,
  binanceWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { botChain, CHAIN_IDS, NETWORKS, WALLETCONNECT_PROJECT_ID } from "./chain-config";

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
      [CHAIN_IDS.testnet]: http(NETWORKS.testnet.rpcUrl),
      [CHAIN_IDS.mainnet]: http(NETWORKS.mainnet.rpcUrl),
    },
    ssr: true,
  });
}
