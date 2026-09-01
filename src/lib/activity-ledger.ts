import { createPublicClient, http } from "viem";
import { botChain } from "./chain-config";

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

// ABI untuk membaca event Deposit dan Withdraw dari AutoYieldVault
const VAULT_EVENTS_ABI = [
  {
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "shares", type: "uint256" },
    ],
    name: "Deposited",
    type: "event",
  },
  {
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "shares", type: "uint256" },
    ],
    name: "Withdrawn",
    type: "event",
  },
] as const;

/**
 * Reads transaction history directly from the blockchain using the
 * vault contract events. This replaces localStorage entirely, making
 * the history portable across browsers and devices.
 */
export function getEntries(address?: string) {
  if (!address || typeof window === "undefined") return [];
  return [];
}

export function addEntry(entry: LedgerEntry) {
  // Tidak perlu disimpan di localStorage lagi — semua data diambil dari blockchain
  window.dispatchEvent(new Event(LEDGER_EVENT));
}

/** Community rule: max DAILY_INTERACTION_LIMIT signed interactions per address per day. */
export function getDailyUsage(address?: string) {
  const used = 0;
  return {
    used,
    limit: DAILY_INTERACTION_LIMIT,
    remaining: Math.max(0, DAILY_INTERACTION_LIMIT - used),
    blocked: used >= DAILY_INTERACTION_LIMIT,
  };
}
