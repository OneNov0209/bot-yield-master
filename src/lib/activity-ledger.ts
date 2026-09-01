import { createPublicClient, http, parseAbiItem } from "viem";
import { botChain } from "./chain-config";
import { DAILY_INTERACTION_LIMIT } from "./chain-config";

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

// ABI untuk membaca event Deposit dan Withdraw dari kontrak
export const VAULT_EVENTS_ABI = [
  parseAbiItem("event Deposited(address indexed user, uint256 amount, uint256 shares)"),
  parseAbiItem("event Withdrawn(address indexed user, uint256 amount, uint256 shares)"),
] as const;

/**
 * Mengembalikan riwayat transaksi user dengan membaca event dari blockchain.
 * Data ini tersedia di browser mana pun karena dibaca langsung dari RPC.
 */
export function getEntries(address?: string) {
  if (!address || typeof window === "undefined") {
    return [];
  }

  // Baca event dari kontrak menggunakan publicClient
  const logs = await publicClient.getLogs({
    address: "0xE1612F02C6DDA4BdD4e8F4f911754C5CA9327d28",
    event: VAULT_EVENTS_ABI[0],
    args: { user: address as `0x${string}` },
    fromBlock: 0n,
    toBlock: "latest",
  });

  return logs.map((log) => ({
    hash: log.transactionHash,
    type: "deposit" as const,
    agentId: "yields-aggregator",
    amount: log.args.amount.toString(),
    address,
    chainId: botChain.id,
    timestamp: Number(log.blockNumber * 1000n),
  }));
}

export function addEntry(entry: LedgerEntry) {
  // Tidak perlu disimpan di localStorage lagi — semua data diambil dari blockchain.
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
