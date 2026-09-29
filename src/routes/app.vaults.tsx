import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Clock,
  XCircle,
  ArrowRight,
  Lock,
} from "lucide-react";
import { NetworkGuard } from "@/components/NetworkGuard";
import { explorerAddress, NETWORK } from "@/lib/chain-config";
import { useVaultTvl } from "@/hooks/useVaultTvl";
import { useLedger } from "@/hooks/useLedger";
import { ActivityLine, ChartFrame, SharePie } from "@/components/charts";
import { cumulativeSeries, vaultShare } from "@/lib/activity-metrics";
import { fetchAccessStatus, type AccessStatus } from "@/lib/api";

export const Route = createFileRoute("/app/vaults")({
  head: () => ({
    meta: [
      { title: "Vaults & TVL — BOT AI Agent" },
      {
        name: "description",
        content:
          "Inspect on-chain vault balances, total value locked and your position in each BOT Chain AI agent vault.",
      },
      { property: "og:title", content: "Vaults & TVL on BOT Chain" },
      {
        property: "og:description",
        content: "On-chain vault balances and your positions across AI yield agents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <NetworkGuard>
      <Vaults />
    </NetworkGuard>
  ),
});

function Vaults() {
  const { tvl, vaults, configured, isLoading, error } = useVaultTvl();
  const { entries, positionFor } = useLedger();
  const { address, isConnected } = useAccount();
  const share = vaultShare(vaults.map((v) => ({ name: v.name, balance: v.balance })));
  const series = cumulativeSeries(entries);

  const [accessStatus, setAccessStatus] = useState<AccessStatus | null>(null);
  const [loadingAccess, setLoadingAccess] = useState(false);

  useEffect(() => {
    if (!address) {
      setAccessStatus(null);
      return;
    }
    setLoadingAccess(true);
    fetchAccessStatus(address)
      .then(setAccessStatus)
      .catch((e) => console.error("access check:", e))
      .finally(() => setLoadingAccess(false));
  }, [address]);

  return (
    <div className="space-y-6">
      {/* Access Status Banner */}
      {isConnected && (
        <AccessBanner status={accessStatus} loading={loadingAccess} />
      )}

      <div>
        <h1 className="text-2xl md:text-3xl">
          <span className="neon-text">Vaults</span>
        </h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          Total value locked:{" "}
          {!configured ? (
            "no vaults configured"
          ) : error ? (
            <span className="text-destructive">RPC unavailable</span>
          ) : isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : (
            `${tvl.toFixed(4)} ${NETWORK.symbol}`
          )}
        </p>
      </div>

      {error && (
        <div className="panel flex items-start gap-2 border-destructive/40 p-4 text-xs text-muted-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
          <span>
            Could not read vault balances from {NETWORK.rpcUrl}: {error.message.slice(0, 140)}
          </span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartFrame
          title="TVL share per vault"
          subtitle="Live native balances read from BOT Chain"
          empty={
            !configured
              ? "No vaults configured."
              : isLoading
                ? "Reading vault balances…"
                : share.length === 0
                  ? "Vaults are currently empty."
                  : undefined
          }
        >
          <SharePie data={share} />
        </ChartFrame>
        <ChartFrame
          title="Your position over time"
          subtitle="Cumulative net balance from confirmed transactions"
          empty={series.length === 0 ? "No activity to plot yet." : undefined}
        >
          <ActivityLine data={series} label={NETWORK.symbol} />
        </ChartFrame>
      </div>

      <div className="space-y-3">
        {vaults.map((v) => {
          const pos = positionFor(v.agentId);
          return (
            <div key={v.agentId} className="panel card-3d flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="font-display text-sm">{v.name}</p>
                {v.address ? (
                  <a
                    href={explorerAddress(v.address)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    {v.address.slice(0, 10)}…{v.address.slice(-8)}{" "}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Vault contract not configured for this deployment
                  </p>
                )}
              </div>
              <div className="flex gap-8 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Vault TVL
                  </p>
                  <p className="font-display">
                    {!v.address ? (
                      "—"
                    ) : v.error ? (
                      <span className="text-destructive">error</span>
                    ) : v.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      `${v.balance.toFixed(4)} ${NETWORK.symbol}`
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    My position
                  </p>
                  <p className="font-display">
                    {pos.net.toFixed(4)} {NETWORK.symbol}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────── */
function AccessBanner({
  status,
  loading,
}: {
  status: AccessStatus | null;
  loading: boolean;
}) {
  if (loading && !status) {
    return (
      <div className="panel flex items-center gap-2 p-4 text-xs text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        Checking access status…
      </div>
    );
  }

  if (!status) return null;

  /* Approved */
  if (status.whitelisted) {
    return (
      <div className="panel flex items-center gap-3 border-success/40 bg-success/5 p-4">
        <ShieldCheck className="h-5 w-5 flex-shrink-0 text-success" />
        <div className="text-sm">
          <p className="font-semibold text-success">Access Approved ✅</p>
          <p className="text-xs text-muted-foreground">
            Your wallet has been verified. You can now deposit to vaults.
          </p>
        </div>
      </div>
    );
  }

  /* Pending */
  if (status.status === "pending") {
    return (
      <div className="panel flex flex-wrap items-center justify-between gap-3 border-warning/40 bg-warning/5 p-4">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 flex-shrink-0 text-warning" />
          <div className="text-sm">
            <p className="font-semibold text-warning">Pending Review ⏳</p>
            <p className="text-xs text-muted-foreground">
              Your request is being reviewed by the owner. Usually within 24 hours.
            </p>
          </div>
        </div>
        <Link
          to="/app/request-access"
          className="inline-flex items-center gap-1 rounded-lg border border-warning/40 px-3 py-1.5 text-xs text-warning hover:border-warning"
        >
          View Status <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  /* Rejected */
  if (status.status === "rejected") {
    return (
      <div className="panel flex flex-wrap items-center justify-between gap-3 border-destructive/40 bg-destructive/5 p-4">
        <div className="flex items-center gap-3">
          <XCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
          <div className="text-sm">
            <p className="font-semibold text-destructive">Request Rejected ❌</p>
            <p className="text-xs text-muted-foreground">
              {status.rejectReason
                ? `Reason: ${status.rejectReason}`
                : "You can submit a new request after 24 hours."}
            </p>
          </div>
        </div>
        <Link
          to="/app/request-access"
          className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs text-destructive hover:border-destructive"
        >
          Details <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  /* No request yet */
  return (
    <div className="panel flex flex-wrap items-center justify-between gap-3 border-primary/40 bg-primary/5 p-4">
      <div className="flex items-center gap-3">
        <Lock className="h-5 w-5 flex-shrink-0 text-primary" />
        <div className="text-sm">
          <p className="font-semibold text-primary">Access Required 🔒</p>
          <p className="text-xs text-muted-foreground">
            To deposit to vaults, you need to request access first.
            Follow our official Twitter accounts & join Telegram, then fill the form.
          </p>
        </div>
      </div>
      <Link
        to="/app/request-access"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Request Access <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
