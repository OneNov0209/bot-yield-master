import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useReadContract, useAccount } from "wagmi";
import { AGENTS } from "@/lib/agents";
import { AUTO_VAULT_ABI } from "@/hooks/useVaultTvl";
import { botChain } from "@/lib/chain-config";
import { LEDGER_EVENT } from "@/lib/activity-ledger";
import { getEntries } from "@/lib/activity-ledger";

export type LedgerPosition = {
  net: number;
  active: boolean;
  shares: number;
};

export function useLedger() {
  const { address } = useAccount();
  const [entries, setEntries] = useState<any[]>([]);

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
    if (address) {
      const timer = setInterval(async () => {
        const newEntries = await getEntries(address);
        setEntries(newEntries);
      }, 30_000);
      return () => clearInterval(timer);
    }
  }, [address]);

  useEffect(() => {
    const onLedger = () => {
      window.dispatchEvent(new Event("force-refetch"));
    };
    window.addEventListener(LEDGER_EVENT, onLedger);
    return () => window.removeEventListener(LEDGER_EVENT, onLedger);
  }, []);

  const refresh = () => {
    window.dispatchEvent(new Event("force-refetch"));
  };

  return {
    entries,
    usage: {
      used: entries.length,
      limit: 20,
      remaining: 20 - entries.length,
      blocked: entries.length >= 20,
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
    refresh,
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
