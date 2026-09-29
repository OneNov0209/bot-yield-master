const API_BASE =
  import.meta.env.VITE_API_URL ?? "https://api.botchain-yield.onenov.xyz";

export type VaultSummary = {
  key: string;
  name: string;
  address: string;
  balance: number;
  deposited: number;
  yield: number;
  profitRate: number;
};

export type ActivityItem = {
  user: string;
  type: "deposit" | "withdraw";
  vault: string;
  vaultKey: string;
  vaultName: string;
  amount: number;
  profit: number;
  timestamp: number;
  blockNumber: number;
  txHash: string;
};

export type UserSummary = {
  address: string;
  totalDeposited: number;
  totalWithdrawn: number;
  totalProfit: number;
  depositCount: number;
  withdrawCount: number;
  firstActivity: number;
  lastActivity: number;
  vaultsUsed: string[];
  netBalance: number;
};

export type KeeperStatus = {
  address: string;
  balance: number;
  yieldPerRun: number;
  estimatedRunsLeft: number;
  intervalHours: number;
  status: "healthy" | "low_balance";
};

export type Summary = {
  vaults: VaultSummary[];
  users: UserSummary[];
  activity: ActivityItem[];
  keeper: KeeperStatus;
  totals: {
    tvl: number;
    yield: number;
    deposited: number;
    uniqueUsers: number;
    activityCount: number;
  };
  ts: number;
};

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export const fetchSummary = () => apiFetch<Summary>("/api/summary");
export const fetchVaults = () => apiFetch<VaultSummary[]>("/api/vaults");
export const fetchUsers = () => apiFetch<UserSummary[]>("/api/users");
export const fetchActivity = () => apiFetch<ActivityItem[]>("/api/activity");
export const fetchKeeper = () => apiFetch<KeeperStatus>("/api/keeper");

/* ─────────── OWNER SHARES & WITHDRAW ─────────── */
export type OwnerShares = {
  owner: string;
  vaults: {
    [key: string]: {
      name: string;
      address: string;
      shares: number;
      sharesRaw: string;
      deposited: number;
    };
  };
};

export type WithdrawResult = {
  vaultKey: string;
  vaultName: string;
  status: "success" | "skipped" | "error";
  shares?: number;
  txHash: string | null;
  reason?: string;
  error?: string;
  blockNumber?: number;
  gasUsed?: string;
};

export type WithdrawAllResult = {
  results: WithdrawResult[];
};

export const fetchOwnerShares = () =>
  apiFetch<OwnerShares>("/api/owner-shares");

export async function withdrawFromVault(
  vaultKey: string,
  adminKey: string,
): Promise<WithdrawResult> {
  const res = await fetch(`${API_BASE}/api/withdraw/${vaultKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function withdrawAll(adminKey: string): Promise<WithdrawAllResult> {
  const res = await fetch(`${API_BASE}/api/withdraw-all`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}
