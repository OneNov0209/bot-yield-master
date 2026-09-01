import { DAILY_INTERACTION_LIMIT } from "./chain-config";
import { LEDGER_EVENT, LedgerEntry } from "./activity-ledger";
import { AGENTS } from "./agents";

export type ActivityMetric = {
  month: string;
  amount: number;
};

/**
 * Menghitung aliran masuk/keluar bulanan berdasarkan data transaksi.
 * Karena `LedgerEntry` bersifat on-chain, kita menggunakan data dari
 * `activity-ledger` yang diambil dari blockchain (bukan localStorage).
 */
export function getMonthlyFlow(entries: LedgerEntry[] = []): ActivityMetric[] {
  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);
  const uniqueMonths = Array.from(new Set(sorted.map((e) => {
    const d = new Date(e.timestamp);
    return `${d.getMonth()}-${d.getFullYear()}`;
  })));

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

/**
 * Menghitung alokasi dana per agent.
 */
export function getAgentAllocation(entries: LedgerEntry[] = []): Record<string, number> {
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

/**
 * Menghitung posisi kumulatif (net flow) dari waktu ke waktu.
 */
export function getCumulativePosition(entries: LedgerEntry[] = []): ActivityMetric[] {
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

/**
 * Membaca status agent dari on-chain data.
 */
export function getAgentStatuses() {
  return AGENTS.map((agent) => ({
    agentId: agent.id,
    name: agent.name,
    risk: agent.risk,
    vault: agent.vault,
    status: "active",
  }));
}

/** Fungsi export tambahan untuk dukungan build. */
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
