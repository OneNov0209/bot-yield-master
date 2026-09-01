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

  // Membaca deposit user dari kontrak
  const { data: totalDeposited, refetch: refetchDeposited } = useReadContract({
    address: AGENTS[0]?.vault,
    abi: AUTO_VAULT_ABI,
    functionName: "getUserDeposited",
    chainId: botChain.id,
    args: address ? [address] : undefined,
    query: { enabled: !!address, retry: 1, refetchInterval: 30_000 },
  });

  // Membaca profit user dari kontrak
  const { data: userProfit, refetch: refetchProfit } = useReadContract({
    address: AGENTS[0]?.vault,
    abi: AUTO_VAULT_ABI,
    functionName: "getUserProfit",
    chainId: botChain.id,
    args: address ? [address] : undefined,
    query: { enabled: !!address, retry: 1, refetchInterval: 30_000 },
  });

  useEffect(() => {
    const onLedger = () => {
      void refetchDeposited();
      void refetchProfit();
    };
    window.addEventListener(LEDGER_EVENT, onLedger);
    return () => window.removeEventListener(LEDGER_EVENT, onLedger);
  }, [refetchDeposited, refetchProfit]);

  // Membuat array entries dari data on-chain (deposit = net)
  const deposited = totalDeposited ? Number(formatEther(totalDeposited)) : 0;
  const profit = userProfit ? Number(formatEther(userProfit)) : 0;

  const netPositions = useMemo(() => {
    return AGENTS.map((agent, i) => ({
      net: i === 0 ? deposited + profit : 0,
      active: (deposited + profit) > 0,
    }));
  }, [deposited, profit]);

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
      return netPositions[index] ?? { net: 0, active: false, shares: 0 };
    },
    status: "reading-onchain",
  };
}

/** Menghitung aliran masuk/keluar bulanan berdasarkan data on-chain. */
export function useMonthlyFlow(entries: any[] = []) {
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
      value: netFlow,
    };
  });
}
