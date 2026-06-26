import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    server: {
      deps: {
        inline: ["@tempo-agentgate/core", "@tempo-agentgate/middleware"],
      },
    },
  },
});
