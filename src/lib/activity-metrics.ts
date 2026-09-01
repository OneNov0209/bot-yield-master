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
export function allocationByAgent(entries: any[] = []) {
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
  return Object.entries(allocation).map(([agentId, amount]) => ({
    agentId,
    amount,
  }));
}

/** Menghitung aliran masuk vs keluar (untuk pie chart). */
export function flowSplit(entries: any[] = []) {
  return [
    { name: "Deposits", value: entries.filter((e) => e.type === "deposit").length },
    { name: "Withdrawals", value: entries.filter((e) => e.type === "withdraw").length },
  ];
}

/** Menghitung posisi kumulatif dari waktu ke waktu. */
export function cumulativeSeries(entries: any[] = []) {
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
      date: new Date(e.timestamp).toISOString(),
      value: runningBalance,
    };
  });
}

/** Menghitung porsi TVL per vault (untuk pie chart). */
export function vaultShare(vaults: { name: string; balance: number }[] = []) {
  const total = vaults.reduce((sum, v) => sum + v.balance, 0);
  if (total === 0) return [];
  return vaults.map((v) => ({
    name: v.name,
    value: v.balance,
    share: (v.balance / total) * 100,
  }));
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
export const agentAllocation = allocationByAgent;
export const cumulativePosition = cumulativeSeries;
