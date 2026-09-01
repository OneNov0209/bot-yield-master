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

  const vault = AGENTS[0]?.vault;

  const { data: totalDeposited } = useReadContract({
    address: vault,
    abi: AUTO_VAULT_ABI,
    functionName: "getUserDeposited",
    chainId: botChain.id,
    args: address ? [address] : undefined,
    query: { enabled: !!address, retry: 1, refetchInterval: 30_000 },
  });

  const { data: userProfit } = useReadContract({
    address: vault,
    abi: AUTO_VAULT_ABI,
    functionName: "getUserProfit",
    chainId: botChain.id,
    args: address ? [address] : undefined,
    query: { enabled: !!address, retry: 1, refetchInterval: 30_000 },
  });

  useEffect(() => {
    const onLedger = () => {
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
      const net = (totalDeposited ? Number(formatEther(totalDeposited)) : 0) +
                  (userProfit ? Number(formatEther(userProfit)) : 0);
      return {
        net,
        active: net > 0,
        shares: totalDeposited ? Number(formatEther(totalDeposited)) : 0,
      };
    },
    status: "reading-onchain",
  };
}
