import { useEffect, useMemo, useState } from "react";
import { formatEther } from "viem";
import { useReadContract, useAccount } from "wagmi";
import { AGENTS } from "@/lib/agents";
import { AUTO_VAULT_ABI } from "@/hooks/useVaultTvl";
import { botChain } from "@/lib/chain-config";
import { LEDGER_EVENT } from "@/lib/activity-ledger";

export function useLedger() {
  const { address } = useAccount();

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

  return {
    deposits: totalDeposited ? Number(formatEther(totalDeposited)) : 0,
    profit: userProfit ? Number(formatEther(userProfit)) : 0,
    status: "reading-onchain",
  };
}

/**
 * Menghitung aliran masuk/keluar bulanan berdasarkan data on-chain.
 * Karena data bersifat on-chain, kami menggunakan kontrak sebagai sumber
 * kebenaran, dan tidak bergantung pada localStorage.
 */
export function useMonthlyFlow() {
  const { address } = useAccount();

  // Membaca deposit bulanan dari kontrak (fictional untuk demo, tapi bisa di-upgrade
  // untuk membaca event on-chain secara langsung).
  const { data: depositData, refetch: refetchDeposit } = useReadContract({
    address: AGENTS[0]?.vault,
    abi: AUTO_VAULT_ABI,
    functionName: "getTotalDeposited",
    chainId: botChain.id,
    query: { enabled: true, retry: 1, refetchInterval: 30_000 },
  });

  useEffect(() => {
    const onLedger = () => {
      void refetchDeposit();
    };
    window.addEventListener(LEDGER_EVENT, onLedger);
    return () => window.removeEventListener(LEDGER_EVENT, onLedger);
  }, [refetchDeposit]);

  const monthlyFlow = useMemo(() => {
    if (!depositData) return [];
    const total = Number(formatEther(depositData));
    return [
      { month: "This Month", amount: total },
    ];
  }, [depositData]);

  return { monthlyFlow };
}
