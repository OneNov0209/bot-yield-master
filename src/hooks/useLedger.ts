import { useEffect, useMemo, useState } from "react";
import { formatEther } from "viem";
import { useReadContract, useAccount } from "wagmi";
import { AGENTS } from "@/lib/agents";
import { AUTO_VAULT_ABI } from "@/hooks/useVaultTvl";
import { botChain } from "@/lib/chain-config";

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
