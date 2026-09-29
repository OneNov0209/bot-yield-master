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

/* ─────────── ACCESS REQUEST & WHITELIST ─────────── */
export type AccessStatus = {
  wallet: string;
  status: "none" | "pending" | "approved" | "rejected";
  whitelisted: boolean;
  requestId?: number;
  submittedAt?: number;
  reviewedAt?: number;
  rejectReason?: string;
  twitter?: string;
  telegram?: string;
};

export type AccessRequest = {
  id: number;
  wallet: string;
  twitter: string;
  telegram: string;
  tweet_url: string | null;
  note: string | null;
  status: "pending" | "approved" | "rejected";
  submitted_at: number;
  reviewed_at: number | null;
  reviewed_by: string | null;
  reject_reason: string | null;
};

export type WhitelistEntry = {
  wallet: string;
  twitter: string | null;
  telegram: string | null;
  approved_at: number;
  approved_by: string | null;
  request_id: number | null;
};

export const fetchAccessStatus = (wallet: string) =>
  apiFetch<AccessStatus>(`/api/access/status/${wallet}`);

export const fetchWhitelistCheck = (wallet: string) =>
  apiFetch<{ wallet: string; whitelisted: boolean }>(`/api/whitelist/check/${wallet}`);

export async function submitAccessRequest(payload: {
  wallet: string;
  twitter: string;
  telegram: string;
  tweetUrl?: string;
  note?: string;
}): Promise<{ ok: boolean; requestId: number; status: string; message: string }> {
  const res = await fetch(`${API_BASE}/api/access/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data;
}

/* Admin endpoints */
export const fetchPendingRequests = (adminKey: string) =>
  fetchJsonWithAuth<{ count: number; requests: AccessRequest[] }>(
    "/api/access/pending",
    adminKey,
  );

export const fetchAllRequests = (adminKey: string) =>
  fetchJsonWithAuth<{ count: number; requests: AccessRequest[] }>(
    "/api/access/all",
    adminKey,
  );

export const fetchWhitelistAll = (adminKey: string) =>
  fetchJsonWithAuth<{ count: number; whitelist: WhitelistEntry[] }>(
    "/api/whitelist/all",
    adminKey,
  );

export async function approveRequest(id: number, adminKey: string) {
  return postJsonWithAuth(`/api/access/${id}/approve`, adminKey, {});
}

export async function rejectRequest(id: number, adminKey: string, reason?: string) {
  return postJsonWithAuth(`/api/access/${id}/reject`, adminKey, { reason });
}

/* Helper internal */
async function fetchJsonWithAuth<T>(path: string, adminKey: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "x-admin-key": adminKey },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

async function postJsonWithAuth(path: string, adminKey: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}


/* ─────────── ANALYTICS ─────────── */
export type AnalyticsDay = {
  date: string;
  label: string;
  deposits: number;
  withdrawals: number;
  depositAmount: number;
  withdrawAmount: number;
  newUsers: number;
};

export type AnalyticsFunnel = {
  pending: number;
  approved: number;
  rejected: number;
};

export type AnalyticsTrend = {
  label: string;
  value: number;
};

export type VaultStat = {
  name: string;
  depositCount: number;
  withdrawCount: number;
  depositAmount: number;
  withdrawAmount: number;
};

export type Analytics = {
  daily: AnalyticsDay[];
  funnel: AnalyticsFunnel;
  tvlTrend: AnalyticsTrend[];
  cumulativeUsers: AnalyticsTrend[];
  vaultStats: VaultStat[];
  summary: {
    totalUsers: number;
    totalRequests: number;
    totalSnapshots: number;
    avgDailyDeposit: number;
    avgDailyWithdraw: number;
  };
};

export const fetchAnalytics = () => apiFetch<Analytics>("/api/analytics");
