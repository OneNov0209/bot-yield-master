import { createPublicClient, http, parseAbiItem } from "viem";
import { botChain } from "./chain-config";
import { DAILY_INTERACTION_LIMIT } from "./chain-config";
import { AGENTS } from "./agents";

export type LedgerEntry = {
  hash: string;
  type: "deposit" | "withdraw";
  agentId: string;
  amount: string;
  address: string;
  chainId: number;
  timestamp: number;
};

const publicClient = createPublicClient({
  chain: botChain,
  transport: http(),
});

export const LEDGER_EVENT = "bot-ai-agent:ledger-updated";

export const VAULT_EVENTS_ABI = [
  parseAbiItem("event Deposited(address indexed user, uint256 amount, uint256 shares)"),
  parseAbiItem("event Withdrawn(address indexed user, uint256 amount, uint256 shares)"),
] as const;

export function getEntries(address?: string): LedgerEntry[] {
  if (!address || typeof window === "undefined") {
    return [];
  }

  return [];
}

export function addEntry(entry: LedgerEntry) {
  window.dispatchEvent(new Event(LEDGER_EVENT));
}

export function getDailyUsage(address?: string) {
  const used = 0;
  return {
    used,
    limit: DAILY_INTERACTION_LIMIT,
    remaining: Math.max(0, DAILY_INTERACTION_LIMIT - used),
    blocked: used >= DAILY_INTERACTION_LIMIT,
  };
}
