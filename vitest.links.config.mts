import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

// Separate config for `npm run cal:links` so this one-off reporting
// script never runs as part of the regular `npm test` suite.
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.print.ts"],
  },
});
