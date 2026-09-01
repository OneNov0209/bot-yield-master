import { CheckCircle2, ExternalLink, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatEther, parseEther, parseGwei, type Address } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { toast } from "sonner";
import { addEntry, getDailyUsage } from "@/lib/activity-ledger";
import { explorerTx, NETWORK } from "@/lib/chain-config";
import { AGENT_TARGET_APY as ESTIMATED_APY, type AgentStrategy } from "@/lib/agents";
import { useVaultBalance } from "@/hooks/useVaultTvl";

type Mode = "deposit" | "withdraw";
type Step = "amount" | "preview" | "signing" | "done";

const DEFAULT_GAS_LIMIT = 300_000n;
const DEFAULT_MAX_FEE_PER_GAS = parseGwei("30");

export function TxDialog({
  agent,
  mode,
  maxAmount,
  onClose,
}: {
  agent: AgentStrategy;
  mode: Mode;
  maxAmount?: number;
  onClose: () => void;
}) {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const submittedRef = useRef(false);
  const handledHashRef = useRef<string | undefined>(undefined);
  const handledErrorRef = useRef<string | undefined>(undefined);
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const { data: balance } = useBalance({ address });
  const usage = getDailyUsage(address);

  const vault = agent.vault as Address | undefined;
  const value = useMemo(() => {
    try {
      return amount ? parseEther(amount) : undefined;
    } catch {
      return undefined;
    }
  }, [amount]);

  const gasCost = DEFAULT_GAS_LIMIT * DEFAULT_MAX_FEE_PER_GAS;

  const { sendTransaction, data: hash, isPending, error } = useSendTransaction();
  const { data: receipt, isLoading: confirming } = useWaitForTransactionReceipt({ hash });

  const hasSubmitted = step === "signing";

  useEffect(() => {
    if (
      receipt?.status === "success" &&
      hash &&
      address &&
      amount &&
      handledHashRef.current !== hash
    ) {
      handledHashRef.current = hash;
      addEntry({
        hash,
        type: mode,
        agentId: agent.id,
        amount,
        address,
        chainId: NETWORK.id,
        timestamp: Date.now(),
      });
      void queryClient.invalidateQueries();
      setStep("done");

      toast.success("Transaction Confirmed!", {
        description: `Gas used: ${receipt.gasUsed.toString()} | Block: ${receipt.blockNumber.toString()}`,
        action: {
          label: "View Details",
          onClick: () => window.open(explorerTx(hash), "_blank"),
        },
      });
    }

    if (receipt?.status === "reverted" && hash && handledHashRef.current !== hash) {
      handledHashRef.current = hash;
      submittedRef.current = false;
      toast.error("Transaction Failed", {
        description: "The transaction was reverted on-chain.",
        action: {
          label: "View Details",
          onClick: () => window.open(explorerTx(hash), "_blank"),
        },
      });
    }

    if (error && handledErrorRef.current !== error.message) {
      handledErrorRef.current = error.message;
      submittedRef.current = false;
      toast.error("Transaction Failed", {
        description: error.message.slice(0, 160) || "Transaction rejected",
      });
    }
  }, [receipt, hash, address, amount, mode, agent.id, error, queryClient]);

  const numeric = Number(amount);
  const overBalance =
    mode === "deposit"
      ? balance
        ? numeric > Number(formatEther(balance.value))
        : false
      : numeric > (maxAmount ?? 0);
  const validAmount = numeric > 0 && !overBalance && !!value;

  const estYearly = validAmount ? (numeric * ESTIMATED_APY[agent.risk]) / 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="panel glow w-full max-w-md p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-xs tracking-widest text-neon">
              {mode === "deposit" ? "DEPOSIT" : "WITHDRAW"}
            </p>
            <h3 className="mt-1 text-lg">{agent.name}</h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!vault && (
          <p className="mt-4 rounded-lg border border-warning/40 bg-surface p-3 text-xs text-muted-foreground">
            This agent has no vault contract configured for the current deployment, so transactions
            are disabled. Set the vault address in the environment configuration to enable it.
          </p>
        )}

        {usage.blocked ? (
          <p className="mt-4 rounded-lg border border-destructive/40 bg-surface p-3 text-xs text-muted-foreground">
            Daily limit reached: {usage.limit} interactions per address per day. Try again tomorrow.
          </p>
        ) : (
          usage.remaining <= 5 && (
            <p className="mt-4 rounded-lg border border-warning/40 bg-surface p-3 text-xs text-muted-foreground">
              Fair-use warning: only {usage.remaining} of {usage.limit} daily interactions left for
              this address.
            </p>
          )
        )}

        {step === "amount" && (
          <div className="mt-5 space-y-4">
            <label className="block text-xs uppercase tracking-widest text-muted-foreground">
              Amount ({NETWORK.symbol})
            </label>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0.0"
              className="w-full rounded-lg border border-input bg-surface px-3 py-3 font-display text-lg outline-none focus:border-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {mode === "deposit"
                  ? `Wallet: ${balance ? Number(formatEther(balance.value)).toFixed(4) : "0.0000"} ${NETWORK.symbol}`
                  : `Position: ${(maxAmount ?? 0).toFixed(4)} ${NETWORK.symbol}`}
              </span>
              <span>
                Daily usage {usage.used}/{usage.limit}
              </span>
            </div>
            {overBalance && <p className="text-xs text-destructive">Amount exceeds available.</p>}
            <button
              disabled={!validAmount || !vault || usage.blocked}
              onClick={() => setStep("preview")}
              className="w-full rounded-lg bg-primary py-3 font-display text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Simulate transaction
            </button>
          </div>
        )}

        {step === "preview" && (
          <div className="mt-5 space-y-3 text-sm">
            <Row label="Action" value={`${mode === "deposit" ? "Deposit to" : "Withdraw from"} vault`} />
            <Row label="Amount" value={`${numeric} ${NETWORK.symbol}`} />
            <Row
              label="Vault"
              value={`${vault?.slice(0, 6)}…${vault?.slice(-4)}`}
            />
            <Row label="Network" value={`${NETWORK.name} · ${NETWORK.id}`} />
            <Row label="Gas limit" value={`${DEFAULT_GAS_LIMIT.toString()} (fixed cap)`} />
            <Row
              label="Est. network fee"
              value={
                `${Number(formatEther(gasCost)).toFixed(6)} ${NETWORK.symbol} (maximum)`
              }
            />
            <Row
              label="Est. ROI (1y)"
              value={`+${estYearly.toFixed(4)} ${NETWORK.symbol} @ ${ESTIMATED_APY[agent.risk]}% target APY`}
            />
            {error && <p className="text-xs text-destructive">{error.message.slice(0, 160)}</p>}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStep("amount")}
                className="flex-1 rounded-lg border border-border py-3 text-sm"
              >
                Back
              </button>
              <button
                disabled={!vault || !value || isPending || confirming || hasSubmitted}
                onClick={() => {
                  if (!vault || !value || submittedRef.current || isPending || confirming) return;
                  submittedRef.current = true;
                  setStep("signing");
                  sendTransaction({
                    to: vault,
                    value,
                    gas: DEFAULT_GAS_LIMIT,
                    maxFeePerGas: DEFAULT_MAX_FEE_PER_GAS,
                  });
                }}
                className="flex-1 rounded-lg bg-primary py-3 font-display text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {isPending ? "Signing..." : confirming ? "Confirming..." : "Sign & send"}
              </button>
            </div>
          </div>
        )}

        {step === "signing" && (
          <div className="mt-8 space-y-3 text-center">
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {isPending
                ? "Confirm the transaction in your wallet…"
                : confirming
                  ? "Waiting for block confirmation…"
                  : error
                    ? "Transaction rejected."
                    : "Broadcasting…"}
            </p>
            {hash && (
              <a
                href={explorerTx(hash)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View on explorer <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {error && (
              <button
                onClick={() => {
                  submittedRef.current = false;
                  setStep("preview");
                }}
                className="mt-2 rounded-lg border border-border px-4 py-2 text-sm"
              >
                Back
              </button>
            )}
          </div>
        )}

        {step === "done" && (
          <div className="mt-8 space-y-3 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
            <p className="font-display text-sm">
              {mode === "deposit" ? "Agent is now Active" : "Withdrawal confirmed"}
            </p>
            <p className="text-sm text-muted-foreground">
              {numeric} {NETWORK.symbol} {mode === "deposit" ? "deposited to" : "withdrawn from"}{" "}
              {agent.name}.
            </p>
            <RoiBreakdown agent={agent} onChainDelta={numeric} mode={mode} />

            {hash && (
              <a
                href={explorerTx(hash)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View on explorer <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <button
              onClick={onClose}
              className="mt-3 w-full rounded-lg bg-primary py-3 font-display text-sm font-semibold text-primary-foreground"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-2">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-right text-sm">{value}</span>
    </div>
  );
}

function RoiBreakdown({
  agent,
  onChainDelta,
  mode,
}: {
  agent: AgentStrategy;
  onChainDelta: number;
  mode: Mode;
}) {
  const { balance, isLoading, error } = useVaultBalance(agent.vault);
  const apy = ESTIMATED_APY[agent.risk];

  if (isLoading) {
    return (
      <p className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface p-3 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin text-primary" /> Reading updated vault balance…
      </p>
    );
  }
  if (error) {
    return (
      <p className="rounded-lg border border-destructive/40 bg-surface p-3 text-xs text-destructive">
        Could not read updated vault balance — {error.message.slice(0, 80)}
      </p>
    );
  }

  const share = balance > 0 ? (onChainDelta / balance) * 100 : 0;
  const monthly = (onChainDelta * (apy / 100)) / 12;
  const yearly = onChainDelta * (apy / 100);

  return (
    <div className="rounded-lg border border-border bg-surface p-3 text-left">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">ROI breakdown</p>
      <dl className="mt-2 space-y-1 text-[11px]">
        <Row label="Vault TVL (live)" value={`${balance.toFixed(4)} ${NETWORK.symbol}`} />
        <Row label="Target APY" value={`${apy}% (${agent.risk} risk band)`} />
        <Row label="This tx share of TVL" value={`${share.toFixed(2)}%`} />
        <Row
          label="Projected monthly"
          value={`${mode === "deposit" ? "+" : "-"}${monthly.toFixed(6)} ${NETWORK.symbol}`}
        />
        <Row
          label="Projected yearly"
          value={`${mode === "deposit" ? "+" : "-"}${yearly.toFixed(4)} ${NETWORK.symbol}`}
        />
        <Row label="Factors" value={`amount × APY ÷ period · compounding excluded`} />
      </dl>
    </div>
  );
}
