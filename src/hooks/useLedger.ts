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

  // Hanya baca dari 1 kontrak (vault pertama)
  const vault = AGENTS[0]?.vault;

  const { data: totalDeposited, refetch: refetchDeposit } = useReadContract({
    address: vault,
    abi: AUTO_VAULT_ABI,
    functionName: "getUserDeposited",
    chainId: botChain.id,
    args: address ? [address] : undefined,
    query: { enabled: !!address, retry: 1, refetchInterval: 30_000 },
  });

  const { data: totalShares, refetch: refetchShares } = useReadContract({
    address: vault,
    abi: AUTO_VAULT_ABI,
    functionName: "getTotalDeposited",
    chainId: botChain.id,
    query: { enabled: true, retry: 1, refetchInterval: 30_000 },
  });

  // Ambil riwayat dari blockchain
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
    void refetchDeposit();
    void refetchShares();
  };

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
      const net = (totalDeposited ? Number(formatEther(totalDeposited)) : 0) +
                  (totalShares ? Number(formatEther(totalShares)) : 0);
      return {
        net,
        active: net > 0,
        shares: totalDeposited ? Number(formatEther(totalDeposited)) : 0,
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
