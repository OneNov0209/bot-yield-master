/**
 * Public app configuration entry point.
 * Network + WalletConnect values live in src/lib/chain-config.ts; this file
 * re-exports them so `@/config` stays the single import path for consumers.
 */
export {
  ACTIVE_NETWORK,
  botChain,
  CHAIN_IDS,
  DAILY_INTERACTION_LIMIT,
  explorerAddress,
  explorerTx,
  NETWORK,
  NETWORKS,
  WALLETCONNECT_PROJECT_ID,
} from "@/lib/chain-config";
export type { NetworkKey, SupportedChainId } from "@/lib/chain-config";
