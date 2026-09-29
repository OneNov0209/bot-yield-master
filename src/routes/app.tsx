import { createFileRoute, Outlet, ClientOnly, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  ShieldCheck,
  Clock,
  XCircle,
  Lock,
  Loader2,
  Twitter,
  Send,
  ArrowRight,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ConfigBanner } from "@/components/ConfigBanner";
import {
  fetchAccessStatus,
  submitAccessRequest,
  type AccessStatus,
} from "@/lib/api";

const Web3Provider = lazy(() => import("@/components/Web3Provider"));

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "BOT AI Agent Console — Autonomous Yield on BOT Chain" },
      {
        name: "description",
        content:
          "Connect your wallet to deploy AI yield agents, track TVL and manage tBOT positions on BOT Chain.",
      },
      { property: "og:title", content: "BOT AI Agent Console" },
      {
        property: "og:description",
        content: "Deploy AI yield agents and manage tBOT positions on BOT Chain.",
      },
    ],
  }),
  component: AppLayout,
});

function Booting() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="animate-pulse font-display text-sm tracking-widest text-muted-foreground">
        INITIALIZING AGENT CONSOLE…
      </p>
    </div>
  );
}

function AppLayout() {
  return (
    <ClientOnly fallback={<Booting />}>
      <Suspense fallback={<Booting />}>
        <Web3Provider>
          <AppShell>
            <ConfigBanner />
            <AccessGate>
              <Outlet />
            </AccessGate>
          </AppShell>
        </Web3Provider>
      </Suspense>
    </ClientOnly>
  );
}

/* ──────────────────────────────────────── */
/* ACCESS GATE — blocks /app/* unless       */
/* wallet is whitelisted                     */
/* ──────────────────────────────────────── */
function AccessGate({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const [status, setStatus] = useState<AccessStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async (w: string) => {
    setLoading(true);
    setError(null);
    try {
      const s = await fetchAccessStatus(w);
      setStatus(s);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) checkStatus(address);
    else setStatus(null);
  }, [address]);

  if (!isConnected) return <ConnectPrompt />;

  if (loading && !status) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Checking access status…</p>
        </div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="panel border-destructive/40 p-6 text-center">
          <XCircle className="mx-auto h-10 w-10 text-destructive" />
          <p className="mt-3 text-sm text-destructive">Error: {error}</p>
          <button
            onClick={() => address && checkStatus(address)}
            className="mt-4 rounded-lg border border-border px-4 py-2 text-sm hover:border-primary hover:text-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (status?.whitelisted) return <>{children}</>;

  if (status?.status === "pending") {
    return (
      <PendingPage
        status={status}
        onRefresh={() => address && checkStatus(address)}
        loading={loading}
      />
    );
  }

  if (status?.status === "rejected") return <RejectedPage status={status} />;

  return <RequestForm address={address!} onSuccess={() => checkStatus(address!)} />;
}

/* ──────────────────────────────────────── */
/* CONNECT PROMPT                            */
/* ──────────────────────────────────────── */
function ConnectPrompt() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="panel p-8 text-center">
        <ShieldCheck className="mx-auto h-14 w-14 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Connect Wallet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Connect your wallet to access the Agent Console. Access is limited to
          verified wallets only.
        </p>
        <div className="mt-6 flex justify-center">
          <ConnectButton />
        </div>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────── */
/* PENDING PAGE                              */
/* ──────────────────────────────────────── */
function PendingPage({
  status,
  onRefresh,
  loading,
}: {
  status: AccessStatus;
  onRefresh: () => void;
  loading: boolean;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="panel border-warning/40 bg-warning/5 p-8 text-center">
        <Clock className="mx-auto h-14 w-14 text-warning" />
        <h1 className="mt-4 text-2xl font-bold text-warning">Pending Review</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your request is being reviewed by the owner. This usually takes less
          than 24 hours.
        </p>

        <div className="mt-6 space-y-2 rounded-lg border border-border bg-background/50 p-4 text-left text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Wallet:</span>
            <span className="font-mono">{status.wallet}</span>
          </div>
          {status.twitter && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Twitter:</span>
              <span className="font-mono">@{status.twitter}</span>
            </div>
          )}
          {status.telegram && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telegram:</span>
              <span className="font-mono">@{status.telegram}</span>
            </div>
          )}
          {status.submittedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submitted:</span>
              <span>{new Date(status.submittedAt).toLocaleString("en-US")}</span>
            </div>
          )}
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:border-primary hover:text-primary disabled:opacity-50"
        >
          <Loader2 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Status
        </button>

        <Link to="/" className="mt-6 block text-sm text-muted-foreground hover:text-primary">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────── */
/* REJECTED PAGE                             */
/* ──────────────────────────────────────── */
function RejectedPage({ status }: { status: AccessStatus }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="panel border-destructive/40 bg-destructive/5 p-8 text-center">
        <XCircle className="mx-auto h-14 w-14 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold text-destructive">Request Rejected</h1>
        {status.rejectReason && (
          <p className="mt-3 text-sm text-muted-foreground">
            Reason: <span className="text-foreground">{status.rejectReason}</span>
          </p>
        )}
        <p className="mt-3 text-sm text-muted-foreground">
          You can submit a new request after 24 hours.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────── */
/* REQUEST FORM                              */
/* ──────────────────────────────────────── */
const TWITTER_URL = "https://x.com/BotYieldMaster";
const TELEGRAM_URL = "https://t.me/BOTYieldMaster";
const OWNER_TWITTER_URL = "https://x.com/OneNov_val";

function RequestForm({
  address,
  onSuccess,
}: {
  address: string;
  onSuccess: () => void;
}) {
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [tweetUrl, setTweetUrl] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await submitAccessRequest({
        wallet: address,
        twitter,
        telegram,
        tweetUrl: tweetUrl || undefined,
        note: note || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="panel p-8">
        <div className="flex items-center gap-3">
          <Lock className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Request Access</h1>
            <p className="text-sm text-muted-foreground">
              Agent Console access is limited to verified wallets only.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <Step n={1} title="Follow Official Twitter">
            <p className="text-sm text-muted-foreground">
              Follow the official Bot Yield Master and owner accounts.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <SocialLink href={TWITTER_URL} icon={Twitter} label="@BotYieldMaster" />
              <SocialLink href={OWNER_TWITTER_URL} icon={Twitter} label="@OneNov_val" />
            </div>
          </Step>

          <Step n={2} title="Join Telegram Channel">
            <p className="text-sm text-muted-foreground">Join the official Telegram channel.</p>
            <div className="mt-3">
              <SocialLink href={TELEGRAM_URL} icon={Send} label="BOTYieldMaster" />
            </div>
          </Step>

          <Step n={3} title="Fill the Form Below">
            <p className="text-sm text-muted-foreground">
              Enter your Twitter and Telegram usernames (without @).
            </p>
          </Step>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
              Wallet (auto)
            </label>
            <input
              type="text"
              value={address}
              readOnly
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 font-mono text-xs"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
              Twitter Username *
            </label>
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="@username or username"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
              Telegram Username *
            </label>
            <input
              type="text"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="@username or username"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
              Proof Tweet URL (optional)
            </label>
            <input
              type="url"
              value={tweetUrl}
              onChange={(e) => setTweetUrl(e.target.value)}
              placeholder="https://x.com/you/status/..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Tweet about Bot Yield Master and tag the official account for faster verification.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why are you interested in joining?"
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !twitter || !telegram}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" /> Submit Request
              </>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Your request will be reviewed within 24 hours.
          </p>
        </form>
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
        {n}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

function SocialLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Twitter;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs transition hover:border-primary hover:text-primary"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
