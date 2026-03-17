import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/test-game/",
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  optimizeDeps: {
    include: ["phaser"],
  },
});
