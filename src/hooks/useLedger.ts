import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  getDailyUsage,
  getEntries,
  LEDGER_EVENT,
  type LedgerEntry,
} from "@/lib/activity-ledger";

export function useLedger() {
  const { address } = useAccount();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);

  const refresh = useCallback(() => {
    setEntries(getEntries(address));
  }, [address]);

  useEffect(() => {
    refresh();
    window.addEventListener(LEDGER_EVENT, refresh);
    return () => window.removeEventListener(LEDGER_EVENT, refresh);
  }, [refresh]);

  const usage = getDailyUsage(address);

  const positionFor = (agentId: string) => {
    const rows = entries.filter((e) => e.agentId === agentId);
    const net = rows.reduce(
      (sum, e) => sum + (e.type === "deposit" ? Number(e.amount) : -Number(e.amount)),
      0,
    );
    return { net: Math.max(0, net), count: rows.length, active: net > 0 };
  };

  return { entries, usage, positionFor, refresh, address };
}

/** Monthly net inflow per address, derived from confirmed on-chain transactions. */
export function useMonthlyFlow(entries: LedgerEntry[]) {
  const buckets = new Map<string, number>();
  for (const e of entries) {
    const d = new Date(e.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const delta = e.type === "deposit" ? Number(e.amount) : -Number(e.amount);
    buckets.set(key, (buckets.get(key) ?? 0) + delta);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({ month, value: Number(value.toFixed(4)) }));
}
