import { defineChain } from "viem";
import { envVar } from "./env";

/**
 * Central network configuration.
 * Switch `ACTIVE_NETWORK` (or VITE_BOT_NETWORK) to "mainnet" when BOT Chain
 * mainnet (chainId 677) is live.
 */
export type NetworkKey = "testnet" | "mainnet";

/** Supported chain IDs — the single source of truth for chain-id typing. */
export const CHAIN_IDS = { testnet: 968, mainnet: 677 } as const;
export type SupportedChainId = (typeof CHAIN_IDS)[NetworkKey];

const isNetworkKey = (value: string | undefined): value is NetworkKey =>
  value === "testnet" || value === "mainnet";

const requested = envVar("VITE_BOT_NETWORK");
export const ACTIVE_NETWORK: NetworkKey = isNetworkKey(requested) ? requested : "testnet";

type NetworkConfig = {
  id: SupportedChainId;
  name: string;
  shortName: string;
  rpcUrl: string;
  fallbackRpcUrl?: string;
  explorerUrl: string;
  symbol: string;
};

export const NETWORKS: Record<NetworkKey, NetworkConfig> = {
  testnet: {
    id: CHAIN_IDS.testnet,
    name: "BOT Chain Testnet (Bohr)",
    shortName: "Bohr Testnet",
    rpcUrl: "https://rpc.bohr.life",
    fallbackRpcUrl: "https://rpc-testnet.botchain.ai",
    explorerUrl: "https://scan.bohr.life",
    symbol: "tBOT",
  },
  mainnet: {
    id: CHAIN_IDS.mainnet,
    name: "BOT Chain",
    shortName: "BOT Mainnet",
    rpcUrl: "https://rpc-bot.klips.io",
    explorerUrl: "https://scan.bohr.life",
    symbol: "BOT",
  },
};

export const NETWORK = NETWORKS[ACTIVE_NETWORK];

const net = NETWORK;

export const botChain = defineChain({
  id: net.id,
  name: net.name,
  nativeCurrency: { name: net.symbol, symbol: net.symbol, decimals: 18 },
  rpcUrls: {
    default: { http: [net.rpcUrl, ...(net.fallbackRpcUrl ? [net.fallbackRpcUrl] : [])] },
  },
  blockExplorers: { default: { name: "BOT Scan", url: net.explorerUrl } },
  testnet: ACTIVE_NETWORK === "testnet",
});

export const explorerTx = (hash: string) => `${net.explorerUrl}/tx/${hash}`;
export const explorerAddress = (address: string) => `${net.explorerUrl}/address/${address}`;

/** WalletConnect Cloud projectId (publishable value, safe in the client bundle). */
export const WALLETCONNECT_PROJECT_ID =
  envVar("VITE_WALLETCONNECT_PROJECT_ID") ?? "7f5230a2da0f45798f150d028660356f";

/** Community anti-abuse rule: max on-chain interactions per address per day. */
export const DAILY_INTERACTION_LIMIT = 20;
