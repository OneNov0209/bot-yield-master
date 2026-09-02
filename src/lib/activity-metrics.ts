import { DAILY_INTERACTION_LIMIT } from "./chain-config";
import { AGENTS } from "./agents";
import { dailyUsageFromEntries, type LedgerEntry } from "./activity-ledger";

export type Datum = { name: string; value: number };
export type Point = { time: string; value: number };

const safeList = (entries: LedgerEntry[] | undefined): LedgerEntry[] =>
  Array.isArray(entries) ? entries : [];

const signed = (e: LedgerEntry) => {
  const amount = Number(e.amount) || 0;
  return e.type === "deposit" ? amount : -amount;
};

export function allocationByAgent(entries: LedgerEntry[] = []): Datum[] {
  const totals = new Map<string, number>();
  for (const e of safeList(entries)) {
    totals.set(e.agentId, (totals.get(e.agentId) ?? 0) + signed(e));
  }
  return Array.from(totals.entries())
    .map(([agentId, value]) => ({
      name: AGENTS.find((a) => a.id === agentId)?.name ?? agentId,
      value: Math.max(0, value),
    }))
    .filter((d) => d.value > 0);
}

export function flowSplit(entries: LedgerEntry[] = []): Datum[] {
  const list = safeList(entries);
  const deposits = list
    .filter((e) => e.type === "deposit")
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const withdrawals = list
    .filter((e) => e.type === "withdraw")
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  return [
    { name: "Deposits", value: deposits },
    { name: "Withdrawals", value: withdrawals },
  ].filter((d) => d.value > 0);
}

export function cumulativeSeries(entries: LedgerEntry[] = []): Point[] {
  const sorted = [...safeList(entries)].sort((a, b) => a.timestamp - b.timestamp);
  let running = 0;
  return sorted.map((e) => {
    running += signed(e);
    return {
      time: new Date(e.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: running,
    };
  });
}

export function vaultShare(vaults: { name: string; balance: number }[] = []): Datum[] {
  const list = Array.isArray(vaults) ? vaults : [];
  return list.map((v) => ({ name: v.name, value: v.balance })).filter((d) => d.value > 0);
}

export function getAgentStatuses() {
  return AGENTS.map((agent) => ({
    agentId: agent.id,
    name: agent.name,
    risk: agent.risk,
    vault: agent.vault,
  }));
}

export function getDailyUsage(entries: LedgerEntry[] = []) {
  return dailyUsageFromEntries(safeList(entries));
}

export { DAILY_INTERACTION_LIMIT };
