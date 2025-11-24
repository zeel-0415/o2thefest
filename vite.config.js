import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  worker: {
    format: "es", // ← REQUIRED for pdfjs workers
  },

  optimizeDeps: {
    include: ["pdfjs-dist"],
  },
});
