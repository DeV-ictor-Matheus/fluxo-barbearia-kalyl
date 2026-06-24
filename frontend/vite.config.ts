import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
