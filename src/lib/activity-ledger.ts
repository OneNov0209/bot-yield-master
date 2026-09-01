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


export const VAULT_EVENTS_ABI = [
  parseAbiItem("event Deposited(address indexed user, uint256 amount, uint256 shares)"),
  parseAbiItem("event Withdrawn(address indexed user, uint256 amount, uint256 shares)"),
] as const;

export async function getEntries(address?: string) {
  if (!address || typeof window === "undefined") {
    return [];
  }

  
  const logs = await publicClient.getLogs({
    address: "0x9770030AB6A808945D6B4E8BEa599e9cfDc5D1A9",
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
