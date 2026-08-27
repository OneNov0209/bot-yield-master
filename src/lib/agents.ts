import type { Address } from "viem";

export type AgentStrategy = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  risk: "Low" | "Medium" | "High";
  /**
   * Vault contract that receives deposits. Provided per-deployment through env so no
   * address is hardcoded to a live treasury by mistake. Deposits stay disabled while unset.
   */
  vault?: Address | undefined;
};

const env = import.meta.env as Record<string, string | undefined>;

const addr = (value: string | undefined): Address | undefined =>
  value && /^0x[a-fA-F0-9]{40}$/.test(value) ? (value as Address) : undefined;

export const AGENTS: AgentStrategy[] = [
  {
    id: "yields-aggregator",
    name: "Yields Aggregator",
    tagline: "Rebalances across the deepest BOT Chain pools.",
    description:
      "The agent monitors pool depth and emissions every block, then routes capital to the highest risk-adjusted yield available on BOT Chain.",
    risk: "Medium",
    vault: addr(env['VITE_VAULT_YIELDS_AGGREGATOR']),
  },
  {
    id: "stable-lp-hunter",
    name: "Stable LP Hunter",
    tagline: "Low volatility stable pairs, compounding hourly.",
    description:
      "Targets stable-to-stable liquidity pairs only. Impermanent loss stays minimal while fees compound on an hourly cadence.",
    risk: "Low",
    vault: addr(env['VITE_VAULT_STABLE_LP_HUNTER']),
  },
  {
    id: "delta-neutral-bot",
    name: "Delta Neutral Bot",
    tagline: "Hedged farming with funding-rate capture.",
    description:
      "Pairs spot liquidity with short perpetual exposure so the position stays delta neutral while harvesting funding and farm rewards.",
    risk: "High",
    vault: addr(env['VITE_VAULT_DELTA_NEUTRAL']),
  },
];

export const getAgent = (id: string) => AGENTS.find((a) => a.id === id);
export const VAULT_ADDRESSES = AGENTS.map((a) => a.vault).filter(Boolean) as Address[];
