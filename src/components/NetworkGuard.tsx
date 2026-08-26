import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AlertTriangle, Wallet } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { botChain, NETWORK } from "@/lib/chain-config";

/** Auto-switches (or adds) BOT Chain right after connect, then renders children. */
export function NetworkGuard({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const wrongNetwork = isConnected && chainId !== botChain.id;

  useEffect(() => {
    if (wrongNetwork && !isPending) switchChain({ chainId: botChain.id });
  }, [wrongNetwork, isPending, switchChain]);

  if (!isConnected) {
    return (
      <div className="panel mx-auto mt-10 max-w-md p-8 text-center">
        <Wallet className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-4 text-xl">Connect your wallet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Connect to {NETWORK.name} to deploy AI agents and view your live on-chain positions.
        </p>
        <div className="mt-6 flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (wrongNetwork) {
    return (
      <div className="panel mx-auto mt-10 max-w-md p-8 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-warning" />
        <h2 className="mt-4 text-xl">Switch network</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Approve the network switch in your wallet to continue on {NETWORK.name} (chain ID{" "}
          {NETWORK.id}).
        </p>
        <button
          onClick={() => switchChain({ chainId: botChain.id })}
          disabled={isPending}
          className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {isPending ? "Waiting for wallet…" : `Switch to ${NETWORK.shortName}`}
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
