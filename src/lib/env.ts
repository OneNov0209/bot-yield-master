/**
 * Single typed accessor for Vite client env vars.
 * Using an index-signature record here keeps every call site free of
 * TS4111 dotted index-signature access warnings.
 */
const RAW = import.meta.env as unknown as Record<string, string | undefined>;

export function envVar(key: string): string | undefined {
  const value = RAW[key];
  return value && value.length > 0 ? value : undefined;
}
