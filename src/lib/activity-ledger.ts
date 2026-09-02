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

export async function getEntries(address?: string): Promise<LedgerEntry[]> {
  if (!address || typeof window === "undefined") {
    return [];
  }

  const allEntries: LedgerEntry[] = [];

  for (const agent of AGENTS) {
    if (!agent.vault) continue;

    const logs = await publicClient.getLogs({
      address: agent.vault,
      event: VAULT_EVENTS_ABI[0],
      args: { user: address as `0x${string}` },
      fromBlock: 0n,
      toBlock: "latest",
    });

    for (const log of logs) {
      allEntries.push({
        hash: log.transactionHash,
        type: "deposit" as const,
        agentId: agent.id,
        amount: log.args.amount.toString(),
        address,
        chainId: botChain.id,
        timestamp: Number(log.blockNumber * 1000n),
      });
    }
  }

  return allEntries;
}

export function addEntry(entry: LedgerEntry) {
  window.dispatchEvent(new Event(LEDGER_EVENT));
}

export function notifyLedgerUpdated() {
  window.dispatchEvent(new Event(LEDGER_EVENT));
}

export function dailyUsageFromEntries(entries: LedgerEntry[], address?: string) {
  if (!address) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return entries.filter(
    (e) => e.address.toLowerCase() === address.toLowerCase() && e.timestamp >= today.getTime()
  ).length;
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
