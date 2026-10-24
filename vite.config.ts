import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    watch: false,
    passWithNoTests: true,
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
  },
});
