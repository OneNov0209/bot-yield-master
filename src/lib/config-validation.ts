import { AGENTS } from "@/lib/agents";
import { envVar } from "@/lib/env";

export type ConfigIssue = {
  key: string;
  agent: string;
  reason: "missing" | "invalid";
  message: string;
};

const ENV_KEYS: Record<string, string> = {
  "yields-aggregator": "VITE_VAULT_YIELDS_AGGREGATOR",
  "stable-lp-hunter": "VITE_VAULT_STABLE_LP_HUNTER",
  "delta-neutral-bot": "VITE_VAULT_DELTA_NEUTRAL",
};

const IS_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

/**
 * Startup configuration check for the AI agent vault addresses.
 * Runs on the client at boot so misconfiguration surfaces as a clear message
 * instead of silently disabling deposits.
 */
export function validateVaultConfig(): ConfigIssue[] {
  const issues: ConfigIssue[] = [];

  for (const agent of AGENTS) {
    const key = ENV_KEYS[agent.id] ?? `VITE_VAULT_${agent.id.toUpperCase()}`;
    const raw = envVar(key);

    if (!raw) {
      issues.push({
        key,
        agent: agent.name,
        reason: "missing",
        message: `${key} is not set — deposit and withdraw for "${agent.name}" are disabled.`,
      });
      continue;
    }
    if (!IS_ADDRESS.test(raw)) {
      issues.push({
        key,
        agent: agent.name,
        reason: "invalid",
        message: `${key} is not a valid 20-byte address ("${raw.slice(0, 12)}…") — fix it to enable "${agent.name}".`,
      });
    }
  }

  return issues;
}
