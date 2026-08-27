import { ExternalLink, Loader2, X } from "lucide-react";
import { formatEther, formatGwei } from "viem";
import { useTransaction, useTransactionReceipt } from "wagmi";
import { explorerAddress, explorerTx, NETWORK } from "@/lib/chain-config";
import { getAgent } from "@/lib/agents";
import type { LedgerEntry } from "@/lib/activity-ledger";

/** Known 4-byte selectors → human readable method, for decoding calldata. */
const SELECTORS: Record<string, string> = {
  "0xd0e30db0": "deposit()",
  "0xb6b55f25": "deposit(uint256)",
  "0x2e1a7d4d": "withdraw(uint256)",
  "0x3ccfd60b": "withdraw()",
  "0xa9059cbb": "transfer(address,uint256)",
};

function decodeMethod(input?: string): string {
  if (!input || input === "0x") return "Native value transfer";
  const selector = input.slice(0, 10).toLowerCase();
  return SELECTORS[selector] ?? `Unknown method (${selector})`;
}

export function TxDetailsDrawer({
  entry,
  onClose,
}: {
  entry: LedgerEntry;
  onClose: () => void;
}) {
  const hash = entry.hash as `0x${string}`;
  const tx = useTransaction({ hash });
  const receipt = useTransactionReceipt({ hash });

  const loading = tx.isLoading || receipt.isLoading;
  const err = tx.error ?? receipt.error;
  const r = receipt.data;
  const t = tx.data;

  const gasCost = r?.gasUsed && r.effectiveGasPrice ? r.gasUsed * r.effectiveGasPrice : undefined;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/70 backdrop-blur-sm">
      <button className="flex-1" aria-label="Close details" onClick={onClose} />
      <aside className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-xs tracking-widest text-neon">TRANSACTION DETAILS</p>
            <h3 className="mt-1 text-lg capitalize">
              {entry.type} · {getAgent(entry.agentId)?.name ?? entry.agentId}
            </h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading && (
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" /> Reading transaction from chain…
          </div>
        )}

        {err && (
          <p className="mt-6 rounded-lg border border-destructive/40 bg-surface p-3 text-xs text-muted-foreground">
            Could not load on-chain details: {err.message.slice(0, 160)}
          </p>
        )}

        <div className="mt-6 space-y-3">
          <Row
            label="Status"
            value={
              r
                ? r.status === "success"
                  ? "Success"
                  : "Reverted"
                : loading
                  ? "…"
                  : "Unknown"
            }
            tone={r?.status === "success" ? "success" : r ? "danger" : "muted"}
          />
          <Row label="Method" value={decodeMethod(t?.input)} />
          <Row
            label="Amount"
            value={`${Number(entry.amount).toFixed(4)} ${NETWORK.symbol}`}
          />
          <Row
            label="On-chain value"
            value={t ? `${Number(formatEther(t.value)).toFixed(6)} ${NETWORK.symbol}` : "—"}
          />
          <Row label="Block" value={r?.blockNumber ? `#${r.blockNumber.toString()}` : "—"} />
          <Row label="Gas used" value={r?.gasUsed ? r.gasUsed.toString() : "—"} />
          <Row
            label="Gas price"
            value={r?.effectiveGasPrice ? `${Number(formatGwei(r.effectiveGasPrice)).toFixed(3)} gwei` : "—"}
          />
          <Row
            label="Fee paid"
            value={gasCost ? `${Number(formatEther(gasCost)).toFixed(6)} ${NETWORK.symbol}` : "—"}
          />
          <Row label="Nonce" value={t?.nonce !== undefined ? String(t.nonce) : "—"} />
          <Row label="Network" value={`${NETWORK.name} · ${entry.chainId}`} />
          <Row label="Time" value={new Date(entry.timestamp).toLocaleString()} />
        </div>

        <div className="mt-6 space-y-2 text-xs">
          {t?.to && (
            <a
              href={explorerAddress(t.to)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              Vault contract {t.to.slice(0, 10)}…{t.to.slice(-8)}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <a
            href={explorerTx(entry.hash)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            View full transaction on BOT Scan <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </aside>
    </div>
  );
}

function Row({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger" | "muted";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "danger"
        ? "text-destructive"
        : tone === "muted"
          ? "text-muted-foreground"
          : "";
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-2">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className={`break-all text-right text-sm ${toneClass}`}>{value}</span>
    </div>
  );
}
