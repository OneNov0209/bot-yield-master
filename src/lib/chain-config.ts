import { defineChain } from "viem";

/**
 * Central network configuration.
 * Switch `ACTIVE_NETWORK` to "mainnet" when BOT Chain mainnet (chainId 677) is live.
 */
export type NetworkKey = "testnet" | "mainnet";

export const ACTIVE_NETWORK: NetworkKey =
  (import.meta.env.VITE_BOT_NETWORK as NetworkKey | undefined) ?? "testnet";

export const NETWORKS = {
  testnet: {
    id: 968,
    name: "BOT Chain Testnet (Bohr)",
    shortName: "Bohr Testnet",
    rpcUrl: "https://rpc.bohr.life",
    explorerUrl: "https://scan.bohr.life",
    symbol: "tBOT",
  },
  mainnet: {
    id: 677,
    name: "BOT Chain",
    shortName: "BOT Mainnet",
    rpcUrl: "https://rpc.bohr.life",
    explorerUrl: "https://scan.bohr.life",
    symbol: "BOT",
  },
} as const;

export const NETWORK = NETWORKS[ACTIVE_NETWORK];

const net = NETWORK;

export const botChain = defineChain({
  id: net.id,
  name: net.name,
  nativeCurrency: { name: net.symbol, symbol: net.symbol, decimals: 18 },
  rpcUrls: { default: { http: [net.rpcUrl] } },
  blockExplorers: { default: { name: "BOT Scan", url: net.explorerUrl } },
  testnet: ACTIVE_NETWORK === "testnet",
});

export const explorerTx = (hash: string) => `${net.explorerUrl}/tx/${hash}`;
export const explorerAddress = (address: string) => `${net.explorerUrl}/address/${address}`;

/** WalletConnect Cloud projectId (publishable value, safe in the client bundle). */
export const WALLETCONNECT_PROJECT_ID =
  (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined) ??
  "3fcc6bba6f1de962d911bb5b5c3dba68";

/** Community anti-abuse rule: max on-chain interactions per address per day. */
export const DAILY_INTERACTION_LIMIT = 20;
