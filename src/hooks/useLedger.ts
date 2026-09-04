import { useEffect } from "react";
import { formatEther, type Address } from "viem";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, useReadContracts } from "wagmi";
import { AGENTS } from "@/lib/agents";
import { AUTO_VAULT_ABI } from "@/hooks/useVaultTvl";
import { botChain } from "@/lib/chain-config";
import {
  dailyUsageFromEntries,
  fetchEntries,
  LEDGER_EVENT,
  type LedgerEntry,
} from "@/lib/activity-ledger";

export type LedgerPosition = {
  net: number;
  active: boolean;
  shares: number;
  profit: number;
};

const configuredAgents = AGENTS.filter((a) => !!a.vault);

export function useLedger() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const entriesQuery = useQuery({
    queryKey: ["ledger-entries", address ?? "none"],
    queryFn: () => fetchEntries(address),
    enabled: !!address,
    retry: 1,
    refetchInterval: 60_000,
    staleTime: 15_000,
  });

  const contracts = configuredAgents.flatMap((agent) => [
    {
      address: agent.vault as Address,
      abi: AUTO_VAULT_ABI,
      functionName: "getUserDeposited" as const,
      chainId: botChain.id,
      args: [(address ?? "0x0000000000000000000000000000000000000000") as Address] as const,
    },
    {
      address: agent.vault as Address,
      abi: AUTO_VAULT_ABI,
      functionName: "getTotalDeposited" as const,
      chainId: botChain.id,
    },
    {
      address: agent.vault as Address,
      abi: AUTO_VAULT_ABI,
      functionName: "getTotalYield" as const,
      chainId: botChain.id,
    },
  ]);

  const { data: reads, refetch: refetchReads } = useReadContracts({
    contracts,
    query: { enabled: !!address && contracts.length > 0, retry: 1, refetchInterval: 30_000 },
  });

  useEffect(() => {
    const onLedger = () => {
      void entriesQuery.refetch();
      void refetchReads();
      void queryClient.invalidateQueries({ queryKey: ["readContract"] });
    };
    window.addEventListener(LEDGER_EVENT, onLedger);
    return () => window.removeEventListener(LEDGER_EVENT, onLedger);
  }, [entriesQuery, refetchReads, queryClient]);

  const entries: LedgerEntry[] = Array.isArray(entriesQuery.data) ? entriesQuery.data : [];

  const num = (r: unknown) => {
    const res = r as { status?: string; result?: unknown } | undefined;
    return res?.status === "success" ? Number(formatEther(res.result as bigint)) : 0;
  };

  const positions = new Map<string, LedgerPosition>();
  configuredAgents.forEach((agent, i) => {
    const deposited = num(reads?.[i * 3]);
    const totalDeposited = num(reads?.[i * 3 + 1]);
    const totalYield = num(reads?.[i * 3 + 2]);
    const profit = totalDeposited > 0 ? (deposited / totalDeposited) * totalYield : 0;
    positions.set(agent.id, {
      net: deposited,
      active: deposited > 0,
      shares: deposited,
      profit,
    });
  });


  const refresh = () => {
    void entriesQuery.refetch();
    void refetchReads();
  };

  return {
    entries,
    isLoading: entriesQuery.isLoading,
    error: entriesQuery.error as Error | null,
    usage: dailyUsageFromEntries(entries),
    positionFor: (agentId: string): LedgerPosition =>
      positions.get(agentId) ?? { net: 0, active: false, shares: 0, profit: 0 },
    refresh,
    status: "reading-onchain",
  };
}

export function useMonthlyFlow(entries: LedgerEntry[] = []) {
  const safe = Array.isArray(entries) ? entries : [];
  const buckets = new Map<string, number>();

  for (const e of [...safe].sort((a, b) => a.timestamp - b.timestamp)) {
    const d = new Date(e.timestamp);
    const key = d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
    const amount = Number(e.amount) || 0;
    const delta = e.type === "deposit" ? amount : -amount;
    buckets.set(key, (buckets.get(key) ?? 0) + delta);
  }

  return Array.from(buckets.entries()).map(([month, value]) => ({ month, value }));
}
