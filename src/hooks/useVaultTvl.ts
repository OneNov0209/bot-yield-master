import { useEffect } from "react";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { AGENTS, VAULT_ADDRESSES } from "@/lib/agents";
import { botChain } from "@/lib/chain-config";
import { LEDGER_EVENT } from "@/lib/activity-ledger";

export const AUTO_VAULT_ABI = [
  {
    inputs: [],
    name: "getTotalDeposited",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalYield",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getProfitRate",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function useVaultBalance(address?: `0x${string}` | undefined) {
  const { data, isLoading, isError, error, refetch } = useReadContract({
    address,
    abi: AUTO_VAULT_ABI,
    functionName: "getTotalDeposited",
    chainId: botChain.id,
    query: { enabled: !!address, retry: 1, refetchInterval: 30_000 },
  });

  useEffect(() => {
    const onLedger = () => void refetch();
    window.addEventListener(LEDGER_EVENT, onLedger);
    return () => window.removeEventListener(LEDGER_EVENT, onLedger);
  }, [refetch]);

  return {
    balance: data ? Number(formatEther(data)) : 0,
    isLoading: !!address && isLoading,
    error: isError ? ((error as Error | null) ?? new Error("RPC read failed")) : null,
    refetch,
  };
}

/** Hook untuk membaca total yield dari kontrak */
export function useVaultYield(address?: `0x${string}` | undefined) {
  const { data, isLoading, isError, error, refetch } = useReadContract({
    address,
    abi: AUTO_VAULT_ABI,
    functionName: "getTotalYield",
    chainId: botChain.id,
    query: { enabled: !!address, retry: 1, refetchInterval: 30_000 },
  });

  useEffect(() => {
    const onLedger = () => void refetch();
    window.addEventListener(LEDGER_EVENT, onLedger);
    return () => window.removeEventListener(LEDGER_EVENT, onLedger);
  }, [refetch]);

  return {
    yieldAmount: data ? Number(formatEther(data)) : 0,
    isLoading: !!address && isLoading,
    error: isError ? ((error as Error | null) ?? new Error("RPC read failed")) : null,
    refetch,
  };
}

/** Per-agent yield + deposited, used by the ROI charts on the dashboard. */
export function useVaultYields() {
  const y1 = useVaultYield(AGENTS[0]?.vault);
  const y2 = useVaultYield(AGENTS[1]?.vault);
  const y3 = useVaultYield(AGENTS[2]?.vault);
  const d1 = useVaultBalance(AGENTS[0]?.vault);
  const d2 = useVaultBalance(AGENTS[1]?.vault);
  const d3 = useVaultBalance(AGENTS[2]?.vault);
  const yields = [y1, y2, y3];
  const deposits = [d1, d2, d3];

  const rows = AGENTS.map((agent, i) => {
    const y = yields[i];
    const d = deposits[i];
    const profit = y?.yieldAmount ?? 0;
    const deposited = d?.balance ?? 0;
    return {
      agentId: agent.id,
      name: agent.name,
      profit,
      deposited,
      roi: deposited > 0 ? (profit / deposited) * 100 : 0,
      isLoading: !!y?.isLoading || !!d?.isLoading,
      error: y?.error ?? d?.error ?? null,
    };
  }).filter((r) => !!AGENTS.find((a) => a.id === r.agentId)?.vault);

  const totalProfit = rows.reduce((s, r) => s + r.profit, 0);
  const totalDeposited = rows.reduce((s, r) => s + r.deposited, 0);

  return {
    rows,
    totalProfit,
    totalDeposited,
    totalRoi: totalDeposited > 0 ? (totalProfit / totalDeposited) * 100 : 0,
    isLoading: rows.some((r) => r.isLoading),
    error: rows.find((r) => r.error)?.error ?? null,
  };
}

export function useVaultTvl() {
  const a = useVaultBalance(AGENTS[0]?.vault);
  const b = useVaultBalance(AGENTS[1]?.vault);
  const c = useVaultBalance(AGENTS[2]?.vault);
  const readings = [a, b, c];

  const vaults = AGENTS.map((agent, i) => {
    const r = readings[i] ?? { balance: 0, isLoading: false, error: null };
    return {
      agentId: agent.id,
      name: agent.name,
      address: agent.vault,
      balance: r.balance,
      isLoading: r.isLoading,
      error: r.error,
    };
  });

  const configured = VAULT_ADDRESSES.length > 0;
  const isLoading = readings.some((r) => r.isLoading);
  const error = readings.find((r) => r.error)?.error ?? null;
  const tvl = vaults.reduce((sum, v) => sum + v.balance, 0);

  return { tvl, vaults, configured, isLoading, error };
}

