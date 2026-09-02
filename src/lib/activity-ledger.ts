import { createPublicClient, fallback, formatEther, http, parseAbiItem, type Address } from "viem";
import { botChain, DAILY_INTERACTION_LIMIT } from "./chain-config";
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

export const LEDGER_EVENT = "bot-ai-agent:ledger-updated";

export const DEPOSITED_EVENT = parseAbiItem(
  "event Deposited(address indexed user, uint256 amount, uint256 shares)"
);
export const WITHDRAWN_EVENT = parseAbiItem(
  "event Withdrawn(address indexed user, uint256 amount, uint256 shares)"
);

export const VAULT_EVENTS_ABI = [DEPOSITED_EVENT, WITHDRAWN_EVENT] as const;

const publicClient = createPublicClient({
  chain: botChain,
  transport: fallback(botChain.rpcUrls.default.http.map((url) => http(url, { retryCount: 1 }))),
});

const CHUNK = 9_000n;
const MAX_CHUNKS = 25;

async function logsForVault(vault: Address, user: Address, latest: bigint) {
  const collect = async (fromBlock: bigint, toBlock: bigint) => {
    const [deposits, withdrawals] = await Promise.all([
      publicClient.getLogs({ address: vault, event: DEPOSITED_EVENT, args: { user }, fromBlock, toBlock }),
      publicClient.getLogs({ address: vault, event: WITHDRAWN_EVENT, args: { user }, fromBlock, toBlock }),
    ]);
    return [...deposits, ...withdrawals];
  };

  try {
    return await collect(0n, latest);
  } catch {
    const out: Awaited<ReturnType<typeof collect>> = [];
    let toBlock = latest;
    for (let i = 0; i < MAX_CHUNKS && toBlock > 0n; i += 1) {
      const fromBlock = toBlock > CHUNK ? toBlock - CHUNK : 0n;
      try {
        out.push(...(await collect(fromBlock, toBlock)));
      } catch {
        break;
      }
      if (fromBlock === 0n) break;
      toBlock = fromBlock - 1n;
    }
    return out;
  }
}

export async function fetchEntries(address?: string): Promise<LedgerEntry[]> {
  if (!address) return [];
  const user = address as Address;
  const vaults = AGENTS.filter((a) => !!a.vault);
  if (vaults.length === 0) return [];

  const latest = await publicClient.getBlockNumber();

  const perVault = await Promise.all(
    vaults.map(async (agent) => {
      const logs = await logsForVault(agent.vault as Address, user, latest);
      return logs.map((log) => ({
        log,
        agentId: agent.id,
      }));
    })
  );

  const flat = perVault.flat();
  const blockNumbers = Array.from(new Set(flat.map((f) => f.log.blockNumber).filter((b): b is bigint => b !== null)));
  const blocks = await Promise.all(
    blockNumbers.map(async (blockNumber) => {
      try {
        const block = await publicClient.getBlock({ blockNumber });
        return [blockNumber.toString(), Number(block.timestamp) * 1000] as const;
      } catch {
        return [blockNumber.toString(), 0] as const;
      }
    })
  );
  const timestamps = new Map(blocks);

  return flat
    .map(({ log, agentId }) => {
      const amount = (log.args as { amount?: bigint }).amount ?? 0n;
      return {
        hash: log.transactionHash ?? "",
        type: log.eventName === "Deposited" ? ("deposit" as const) : ("withdraw" as const),
        agentId,
        amount: formatEther(amount),
        address,
        chainId: botChain.id,
        timestamp: timestamps.get((log.blockNumber ?? 0n).toString()) ?? 0,
      };
    })
    .filter((e) => e.hash.length > 0)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function notifyLedgerUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(LEDGER_EVENT));
  }
}

export function dailyUsageFromEntries(entries: LedgerEntry[] = []) {
  const since = Date.now() - 24 * 60 * 60 * 1000;
  const used = entries.filter((e) => e.timestamp >= since).length;
  return {
    used,
    limit: DAILY_INTERACTION_LIMIT,
    remaining: Math.max(0, DAILY_INTERACTION_LIMIT - used),
    blocked: used >= DAILY_INTERACTION_LIMIT,
  };
}
