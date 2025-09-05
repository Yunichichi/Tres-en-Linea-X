// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => ({
  // Para GitHub Pages (project pages) usa el nombre del repo como base en producción.
  // Si prefieres una URL absoluta, descomenta la siguiente línea y elimina la base condicional.
  // base: "https://Yunichichi.github.io/Tres-en-Linea-X/",
  base: mode === "production" ? "/Tres-en-Linea-X/" : "/",

  server: {
    host: "::",
    port: 8080,
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
