// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Tambahan konfigurasi untuk mengatasi error @coinbase/cdp-sdk
  vite: {
    optimizeDeps: {
      // Kecualikan library Coinbase yang tidak dipakai dan bermasalah
      exclude: ["@coinbase/cdp-sdk", "@x402/evm", "@x402/core"],
    },
    build: {
      rollupOptions: {
        // Kunci agar rollup tidak mencoba bundel library bermasalah
        external: ["@coinbase/cdp-sdk", "@x402/evm", "@x402/core"],
      },
    },
  },
});
