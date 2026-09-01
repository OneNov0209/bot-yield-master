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
import { botChain, CHAIN_IDS, NETWORKS } from "./chain-config";
import { WALLETCONNECT_PROJECT_ID } from "./chain-config";

export function createWagmiConfig() {
  const testnetTransport = fallback(
    [NETWORKS.testnet.rpcUrl, NETWORKS.testnet.fallbackRpcUrl]
      .filter((url): url is string => Boolean(url))
      .map((url) => http(url, { retryCount: 1, timeout: 8_000 })),
  );
  const mainnetTransport = http(NETWORKS.mainnet.rpcUrl, {
    retryCount: 1,
    timeout: 8_000,
  });

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
      [CHAIN_IDS.testnet]: testnetTransport,
      [CHAIN_IDS.mainnet]: mainnetTransport,
    },
    ssr: false,
  });
}
