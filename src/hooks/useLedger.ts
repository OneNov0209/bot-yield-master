import { useEffect, useMemo, useState } from "react";
import { formatEther } from "viem";
import { useReadContract, useAccount } from "wagmi";
import { AGENTS } from "@/lib/agents";
import { AUTO_VAULT_ABI } from "@/hooks/useVaultTvl";
import { botChain } from "@/lib/chain-config";
import { LEDGER_EVENT } from "@/lib/activity-ledger";

export type LedgerPosition = {
  net: number;
  active: boolean;
  shares: number;
};

export function useLedger() {
  const { address } = useAccount();
  const [entries, setEntries] = useState<any[]>([]);

  // Membaca data dari SEMUA vault
  const deposits = AGENTS.map((agent) => {
    const { data } = useReadContract({
      address: agent.vault,
      abi: AUTO_VAULT_ABI,
      functionName: "getUserDeposited",
      chainId: botChain.id,
      args: address ? [address] : undefined,
      query: { enabled: !!address, retry: 1, refetchInterval: 30_000 },
    });
    return data ? Number(formatEther(data as bigint)) : 0;
  });

  const profits = AGENTS.map((agent) => {
    const { data } = useReadContract({
      address: agent.vault,
      abi: AUTO_VAULT_ABI,
      functionName: "getUserProfit",
      chainId: botChain.id,
      args: address ? [address] : undefined,
      query: { enabled: !!address, retry: 1, refetchInterval: 30_000 },
    });
    return data ? Number(formatEther(data as bigint)) : 0;
  });

  useEffect(() => {
    const onLedger = () => {
      // Trigger refetch semua vault saat ada event
      window.dispatchEvent(new Event("force-refetch"));
    };
    window.addEventListener(LEDGER_EVENT, onLedger);
    return () => window.removeEventListener(LEDGER_EVENT, onLedger);
  }, []);

  return {
    entries,
    usage: {
      used: 0,
      limit: 20,
      remaining: 20,
      blocked: false,
    },
    positionFor: (agentId: string): LedgerPosition => {
      const index = AGENTS.findIndex((a) => a.id === agentId);
      const net = (deposits[index] ?? 0) + (profits[index] ?? 0);
      return {
        net,
        active: net > 0,
        shares: deposits[index] ?? 0,
      };
    },
    status: "reading-onchain",
  };
}
