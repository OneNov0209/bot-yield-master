import { useEffect } from "react";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { AGENTS, VAULT_ADDRESSES } from "@/lib/agents";
import { botChain } from "@/lib/chain-config";
import { LEDGER_EVENT } from "@/lib/activity-ledger";

// ABI untuk kontrak AutoYieldVault
export const AUTO_VAULT_ABI = [
  {
    inputs: [{ name: "_user", type: "address" }],
    name: "getUserDeposited",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalDeposited",
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

/** Per-vault native balance for the Vaults page. */
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

/** Function to return all vault readings + aggregate TVL. */
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
