import { AGENTS } from "@/lib/agents";
import type { LedgerEntry } from "@/lib/activity-ledger";

/** Net position per agent, for the allocation donut. */
export function allocationByAgent(entries: LedgerEntry[]) {
  return AGENTS.map((a) => {
    const net = entries
      .filter((e) => e.agentId === a.id)
      .reduce((s, e) => s + (e.type === "deposit" ? Number(e.amount) : -Number(e.amount)), 0);
    return { name: a.name, value: Number(Math.max(0, net).toFixed(4)) };
  }).filter((d) => d.value > 0);
}

/** Deposit vs withdraw volume, for the flow pie. */
export function flowSplit(entries: LedgerEntry[]) {
  const sum = (type: LedgerEntry["type"]) =>
    Number(
      entries
        .filter((e) => e.type === type)
        .reduce((s, e) => s + Number(e.amount), 0)
        .toFixed(4),
    );
  return [
    { name: "Deposits", value: sum("deposit") },
    { name: "Withdrawals", value: sum("withdraw") },
  ].filter((d) => d.value > 0);
}

/** Cumulative net position over time, for the activity line chart. */
export function cumulativeSeries(entries: LedgerEntry[]) {
  let running = 0;
  return [...entries]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((e) => {
      running += e.type === "deposit" ? Number(e.amount) : -Number(e.amount);
      return {
        time: new Date(e.timestamp).toLocaleDateString(),
        value: Number(Math.max(0, running).toFixed(4)),
      };
    });
}

/** Per-vault TVL share, for the vaults donut. */
export function vaultShare(vaults: { name: string; balance: number }[]) {
  return vaults
    .map((v) => ({ name: v.name, value: Number(v.balance.toFixed(4)) }))
    .filter((v) => v.value > 0);
}
