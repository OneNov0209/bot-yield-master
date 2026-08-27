import { formatEther } from "viem";
import { useBalance } from "wagmi";
import { VAULT_ADDRESSES } from "@/lib/agents";

/**
 * Protocol TVL = sum of native balances held by the configured vault contracts.
 * Purely on-chain data; returns configured=false when no vault address is set.
 */
export function useVaultTvl() {
  const a = useBalance({ address: VAULT_ADDRESSES[0], query: { enabled: !!VAULT_ADDRESSES[0] } });
  const b = useBalance({ address: VAULT_ADDRESSES[1], query: { enabled: !!VAULT_ADDRESSES[1] } });
  const c = useBalance({ address: VAULT_ADDRESSES[2], query: { enabled: !!VAULT_ADDRESSES[2] } });

  const results = [a, b, c];
  const tvl = results.reduce(
    (sum, r) => sum + (r.data ? Number(formatEther(r.data.value)) : 0),
    0,
  );

  return {
    tvl,
    configured: VAULT_ADDRESSES.length > 0,
    isLoading: results.some((r) => r.isLoading),
  };
}

/** Per-vault native balance for the Vaults page. */
export function useVaultBalance(address?: `0x${string}`) {
  const { data, isLoading } = useBalance({ address, query: { enabled: !!address } });
  return { balance: data ? Number(formatEther(data.value)) : 0, isLoading };
}
