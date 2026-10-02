import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src/apps"),
    },
  },

  server: {
    proxy: {
      "/api": {
        target: "http://16.176.145.4:8084",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },

      "/uploads": {
        target: "http://16.176.145.4:8084",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});