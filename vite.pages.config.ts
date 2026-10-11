import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL("./github-pages", import.meta.url));
export default defineConfig({
  root,
  base: "/rv-solutions/",
  plugins: [react()],
  resolve: { alias: { "@": resolve(root, "..") } },
  build: {
    outDir: resolve(root, "../pages-dist"),
    emptyOutDir: true,
    rollupOptions: { input: { main: resolve(root, "index.html"), privacy: resolve(root, "privacy.html") } },
  },
});
