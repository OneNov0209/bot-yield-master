import { DAILY_INTERACTION_LIMIT } from "./chain-config";
import { AGENTS } from "./agents";

export type ActivityMetric = {
  month: string;
  amount: number;
};

/** Menghitung aliran masuk/keluar bulanan. */
export function getMonthlyFlow(entries: any[] = []): ActivityMetric[] {
  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);
  const uniqueMonths = Array.from(
    new Set(
      sorted.map((e) => {
        const d = new Date(e.timestamp);
        return `${d.getMonth()}-${d.getFullYear()}`;
      })
    )
  );

  return uniqueMonths.map((monthKey) => {
    const monthEntries = sorted.filter((e) => {
      const d = new Date(e.timestamp);
      return `${d.getMonth()}-${d.getFullYear()}` === monthKey;
    });

    const netFlow = monthEntries.reduce((sum, e) => {
      const amount = Number(e.amount);
      return e.type === "deposit" ? sum + amount : sum - amount;
    }, 0);

    return {
      month: monthKey,
      amount: netFlow,
    };
  });
}

/** Menghitung alokasi dana per agent. */
export function getAgentAllocation(entries: any[] = []): Record<string, number> {
  const allocation: Record<string, number> = {};
  for (const e of entries) {
    const agentId = e.agentId;
    const amount = Number(e.amount);
    if (!allocation[agentId]) {
      allocation[agentId] = 0;
    }
    if (e.type === "deposit") {
      allocation[agentId] += amount;
    } else if (e.type === "withdraw") {
      allocation[agentId] -= amount;
    }
  }
  return allocation;
}

/** Menghitung posisi kumulatif dari waktu ke waktu. */
export function getCumulativePosition(entries: any[] = []): ActivityMetric[] {
  const sorted = [...entries].sort((a, b) => a.timestamp - b.timestamp);
  let runningBalance = 0;

  return sorted.map((e) => {
    const amount = Number(e.amount);
    if (e.type === "deposit") {
      runningBalance += amount;
    } else if (e.type === "withdraw") {
      runningBalance -= amount;
    }
    return {
      month: new Date(e.timestamp).toISOString(),
      amount: runningBalance,
    };
  });
}

/** Menghitung aliran masuk vs keluar. */
export function flowSplit(entries: any[] = []) {
  return {
    deposits: entries.filter((e) => e.type === "deposit").length,
    withdrawals: entries.filter((e) => e.type === "withdraw").length,
  };
}

/** Menghitung porsi TVL per agent. */
export function vaultShare(entries: any[] = []) {
  const all = getAgentAllocation(entries);
  const total = Object.values(all).reduce((sum, v) => sum + Math.abs(v), 0);
  if (total === 0) return [];
  return Object.entries(all).map(([agentId, amount]) => ({
    agentId,
    amount: Math.abs(amount),
    share: (Math.abs(amount) / total) * 100,
  }));
}

/** Menghitung alokasi per agent (untuk pie chart). */
export function allocationByAgent(entries: any[] = []) {
  return getAgentAllocation(entries);
}

/** Menghitung posisi kumulatif (untuk line chart). */
export function cumulativeSeries(entries: any[] = []) {
  return getCumulativePosition(entries);
}

/** Membaca status agent. */
export function getAgentStatuses() {
  return AGENTS.map((agent) => ({
    agentId: agent.id,
    name: agent.name,
    risk: agent.risk,
    vault: agent.vault,
    status: "active",
  }));
}

/** Membaca batas interaksi harian. */
export function getDailyUsage(address?: string) {
  const used = 0;
  return {
    used,
    limit: DAILY_INTERACTION_LIMIT,
    remaining: Math.max(0, DAILY_INTERACTION_LIMIT - used),
    blocked: used >= DAILY_INTERACTION_LIMIT,
  };
}

export const monthlyFlow = getMonthlyFlow;
export const agentAllocation = getAgentAllocation;
export const cumulativePosition = getCumulativePosition;
