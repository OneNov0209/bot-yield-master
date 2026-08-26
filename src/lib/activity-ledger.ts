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

const KEY = "bot-ai-agent:ledger:v1";

function read(): LedgerEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LedgerEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: LedgerEntry[]) {
  window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, 500)));
}

export const LEDGER_EVENT = "bot-ai-agent:ledger-updated";

export function getEntries(address?: string): LedgerEntry[] {
  const all = read().sort((a, b) => b.timestamp - a.timestamp);
  if (!address) return all;
  return all.filter((e) => e.address.toLowerCase() === address.toLowerCase());
}

export function addEntry(entry: LedgerEntry) {
  write([entry, ...read()]);
  window.dispatchEvent(new Event(LEDGER_EVENT));
}

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Community rule: max DAILY_INTERACTION_LIMIT signed interactions per address per day. */
export function getDailyUsage(address?: string) {
  const today = startOfDay(Date.now());
  const used = address ? getEntries(address).filter((e) => e.timestamp >= today).length : 0;
  return {
    used,
    limit: DAILY_INTERACTION_LIMIT,
    remaining: Math.max(0, DAILY_INTERACTION_LIMIT - used),
    blocked: used >= DAILY_INTERACTION_LIMIT,
  };
}
