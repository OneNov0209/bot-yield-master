import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { validateVaultConfig } from "@/lib/config-validation";

/** Startup config validation banner for vault addresses. */
export function ConfigBanner() {
  const issues = useMemo(() => validateVaultConfig(), []);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (issues.length > 0) {
      console.warn(
        "[BOT AI Agent] vault configuration issues:\n" + issues.map((i) => `• ${i.message}`).join("\n"),
      );
    }
  }, [issues]);

  if (issues.length === 0 || dismissed) return null;

  return (
    <div className="panel mb-5 border-warning/40 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-xs tracking-widest text-warning">
            VAULT CONFIGURATION INCOMPLETE
          </p>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {issues.map((i) => (
              <li key={i.key}>{i.message}</li>
            ))}
          </ul>
          <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-success" /> Set the values in your environment
            configuration, then reload the console.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          Hide
        </button>
      </div>
    </div>
  );
}
