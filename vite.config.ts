import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@coinbase/cdp-sdk", "@x402/evm", "@x402/core"],
    },
    build: {
      rollupOptions: {
        external: ["@coinbase/cdp-sdk", "@x402/evm", "@x402/core"],
      },
    },
  },
});
