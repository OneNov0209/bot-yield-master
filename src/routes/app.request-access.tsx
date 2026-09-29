import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  ShieldCheck,
  Twitter,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Clock,
} from "lucide-react";
import {
  fetchAccessStatus,
  submitAccessRequest,
  type AccessStatus,
} from "@/lib/api";

export const Route = createFileRoute("/app/request-access")({
  component: RequestAccessPage,
});

const TWITTER_URL = "https://x.com/BotYieldMaster";
const TELEGRAM_URL = "https://t.me/BOTYieldMaster";
const OWNER_TWITTER_URL = "https://x.com/OneNov_val";

function RequestAccessPage() {
  const { address, isConnected } = useAccount();
  const [status, setStatus] = useState<AccessStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [tweetUrl, setTweetUrl] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const checkStatus = async (w: string) => {
    setLoadingStatus(true);
    try {
      const s = await fetchAccessStatus(w);
      setStatus(s);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (address) checkStatus(address);
    else setStatus(null);
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitAccessRequest({
        wallet: address,
        twitter,
        telegram,
        tweetUrl: tweetUrl || undefined,
        note: note || undefined,
      });
      setSubmitSuccess(true);
      await checkStatus(address);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* Belum connect */
  if (!isConnected) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="panel p-8 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-2xl font-bold">Request Access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect your wallet terlebih dahulu untuk request akses.
          </p>
          <div className="mt-6 flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  /* Sudah whitelist */
  if (status?.whitelisted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="panel border-success/40 bg-success/5 p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <h1 className="mt-4 text-2xl font-bold text-success">Akses Disetujui</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Wallet kamu sudah bisa mengakses vault dan melakukan deposit.
          </p>
          <Link
            to="/app/vaults"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Buka Vaults
          </Link>
        </div>
      </div>
    );
  }

  /* Pending */
  if (status?.status === "pending" || submitSuccess) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="panel border-warning/40 bg-warning/5 p-8 text-center">
          <Clock className="mx-auto h-12 w-12 text-warning" />
          <h1 className="mt-4 text-2xl font-bold text-warning">
            Menunggu Review
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Request kamu sedang ditinjau oleh owner. Biasanya selesai dalam 1x24 jam.
          </p>
          <div className="mt-4 space-y-1 rounded-lg border border-border bg-background/50 p-3 text-left text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wallet:</span>
              <span className="font-mono">{address}</span>
            </div>
            {status?.twitter && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Twitter:</span>
                <span className="font-mono">@{status.twitter}</span>
              </div>
            )}
            {status?.telegram && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telegram:</span>
                <span className="font-mono">@{status.telegram}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => address && checkStatus(address)}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:border-primary hover:text-primary"
          >
            <Loader2 className={`h-4 w-4 ${loadingStatus ? "animate-spin" : ""}`} />
            Cek Status
          </button>
        </div>
      </div>
    );
  }

  /* Rejected */
  if (status?.status === "rejected") {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="panel border-destructive/40 bg-destructive/5 p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold text-destructive">
            Request Ditolak
          </h1>
          {status.rejectReason && (
            <p className="mt-2 text-sm text-muted-foreground">
              Alasan: {status.rejectReason}
            </p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            Kamu bisa submit ulang setelah 24 jam.
          </p>
        </div>
      </div>
    );
  }

  /* Form */
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        to="/app/vaults"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>

      <div className="panel p-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Request Access</h1>
            <p className="text-sm text-muted-foreground">
              Ikuti langkah-langkah di bawah untuk mendapat akses.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="mt-8 space-y-4">
          <Step n={1} title="Follow Twitter Resmi">
            <p className="text-sm text-muted-foreground">
              Follow akun resmi Bot Yield Master dan owner.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <SocialLink href={TWITTER_URL} icon={Twitter} label="@BotYieldMaster" />
              <SocialLink href={OWNER_TWITTER_URL} icon={Twitter} label="@OneNov_val" />
            </div>
          </Step>

          <Step n={2} title="Join Telegram Channel">
            <p className="text-sm text-muted-foreground">
              Join channel Telegram resmi.
            </p>
            <div className="mt-3">
              <SocialLink href={TELEGRAM_URL} icon={Send} label="BOTYieldMaster" />
            </div>
          </Step>

          <Step n={3} title="Isi Form di Bawah">
            <p className="text-sm text-muted-foreground">
              Masukkan username Twitter & Telegram kamu (tanpa @).
            </p>
          </Step>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
              Wallet (auto)
            </label>
            <input
              type="text"
              value={address ?? ""}
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
              placeholder="@username atau username"
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
              placeholder="@username atau username"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
              Link Tweet Bukti (opsional)
            </label>
            <input
              type="url"
              value={tweetUrl}
              onChange={(e) => setTweetUrl(e.target.value)}
              placeholder="https://x.com/kamu/status/..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Tweet tentang Bot Yield Master + tag akun resmi, biar verify lebih cepat.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
              Catatan (opsional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Kenapa kamu tertarik bergabung?"
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {submitError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              ⚠️ {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !twitter || !telegram}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Mengirim…
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" /> Kirim Request
              </>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Request akan direview oleh owner dalam 1x24 jam.
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
