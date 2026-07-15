import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "Barbearia Kalyl",
        short_name: "Kalyl",
        description: "Gestão financeira da Barbearia Kalyl.",
        lang: "pt-BR",
        theme_color: "#13100E",
        background_color: "#13100E",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-maskable-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // ADR-003: só precache do app shell. NENHUM runtimeCaching — nenhuma
        // resposta da API entra no Cache Storage.
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallbackDenylist: [
          /^\/api/,
          /^\/atendentes/,
          /^\/servicos/,
          /^\/entradas/,
          /^\/relatorio/,
          /^\/saidas/,
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Proxy de desenvolvimento: chamadas para /api são redirecionadas ao
  // backend Express (localhost:3333), evitando CORS. O rewrite remove o
  // prefixo /api porque o backend expõe as rotas na raiz (/atendentes etc.).
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3333",
        changeOrigin: true,
        rewrite: (caminho) => caminho.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    // Ambiente mínimo: funções puras (ex.: formatação monetária) não tocam o DOM.
    // Testes que precisarem de DOM declaram `// @vitest-environment jsdom` no topo do arquivo.
    environment: "node",
    // Sem globais: describe/it/expect são importados de "vitest" em cada teste,
    // mantendo coerência com o resto do projeto (imports explícitos, sem barrel).
    globals: false,
  },
});
