import { useEffect } from "react";
import { formatEther } from "viem";
import { useBalance } from "wagmi";
import { AGENTS, VAULT_ADDRESSES } from "@/lib/agents";
import { botChain } from "@/lib/chain-config";
import { LEDGER_EVENT } from "@/lib/activity-ledger";

type VaultReading = {
  agentId: string;
  name: string;
  address?: `0x${string}` | undefined;
  balance: number;
  isLoading: boolean;
  error: Error | null;
};

/**
 * Reads the native balance of every configured vault contract straight from the
 * BOT Chain RPC. Returns per-vault readings plus aggregate TVL, with explicit
 * loading and error states so the UI never shows a fabricated number.
 */
export function useVaultTvl() {
  const a = useVaultBalance(AGENTS[0]?.vault);
  const b = useVaultBalance(AGENTS[1]?.vault);
  const c = useVaultBalance(AGENTS[2]?.vault);
  const readings = [a, b, c];

  const vaults: VaultReading[] = AGENTS.map((agent, i) => {
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

/** Per-vault native balance for the Vaults page. */
export function useVaultBalance(address?: `0x${string}` | undefined) {
  const { data, isLoading, isError, error, refetch } = useBalance({
    address,
    chainId: botChain.id,
    query: { enabled: !!address, retry: 1, refetchInterval: 60_000 },
  });

  // Auto-refetch as soon as a deposit/withdraw is confirmed, so TVL and ROI
  // cards update without a page refresh.
  useEffect(() => {
    const onLedger = () => void refetch();
    window.addEventListener(LEDGER_EVENT, onLedger);
    return () => window.removeEventListener(LEDGER_EVENT, onLedger);
  }, [refetch]);

  return {
    balance: data ? Number(formatEther(data.value)) : 0,
    isLoading: !!address && isLoading,
    error: isError ? ((error as Error | null) ?? new Error("RPC read failed")) : null,
    refetch,
  };
}
