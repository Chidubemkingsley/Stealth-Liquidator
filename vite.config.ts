import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { componentTagger } from "lovable-tagger";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig(({ mode }) => {
  return {
    server: {
      host: true,
      port: 8080,
      hmr: { overlay: false },
    },
    plugins: [
      react(),
      wasm(),
      topLevelAwait(),
      mode === "development" ? componentTagger() : undefined,
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Required for Noir/Starknet compatibility
    optimizeDeps: {
      exclude: ["@noir-lang/backend_barretenberg", "@noir-lang/noir_js"]
    },
    define: {
      global: "globalThis",
    },
    build: {
      target: "esnext", // Required for WASM/Top-level await
      rollupOptions: {
        output: {
          manualChunks: {
            starknet: ["starknet", "starknetkit"],
            noir: ["@noir-lang/noir_js", "@noir-lang/backend_barretenberg"],
            react: ["react", "react-dom"],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  };
});
