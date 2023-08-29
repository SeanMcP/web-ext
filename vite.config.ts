import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "WebExt",
      formats: ["iife"],
      fileName: "web-ext",
    },
  },
});
