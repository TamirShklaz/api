import { defineConfig } from "vitest/config";
import * as path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: "./tests/setup.ts",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
