// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Bloco 1: regras-base do JavaScript (do próprio ESLint)
  eslint.configs.recommended,

  // Bloco 2: regras recomendadas para TypeScript
  ...tseslint.configs.recommended,

  // Bloco 3: o que ignorar (não faz sentido lintar build/deps)
  {
    ignores: ["dist/", "node_modules/", "src/generated/"],
  },
);
