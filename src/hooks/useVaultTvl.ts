import { useEffect } from "react";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { AGENTS, VAULT_ADDRESSES } from "@/lib/agents";
import { botChain } from "@/lib/chain-config";
import { LEDGER_EVENT } from "@/lib/activity-ledger";

// ABI untuk kontrak AutoYieldVault
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
    name: "getBalance",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_user", type: "address" }],
    name: "getUserProfit",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_user", type: "address" }],
    name: "getUserShares",
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

/** Per-vault native balance for the Vaults page. */
export function useVaultBalanceAndProfit(address?: `0x${string}` | undefined) {
  const { data, isLoading, isError, error, refetch } = useReadContract({
    address,
    abi: AUTO_VAULT_ABI,
    functionName: "getUserProfit",
    chainId: botChain.id,
    args: address ? [address] : undefined,
    query: { enabled: !!address, retry: 1, refetchInterval: 30_000 },
  });

  useEffect(() => {
    const onLedger = () => void refetch();
    window.addEventListener(LEDGER_EVENT, onLedger);
    return () => window.removeEventListener(LEDGER_EVENT, onLedger);
  }, [refetch]);

  return {
    profit: data ? Number(formatEther(data)) : 0,
    isLoading: !!address && isLoading,
    error: isError ? ((error as Error | null) ?? new Error("RPC read failed")) : null,
    refetch,
  };
}
