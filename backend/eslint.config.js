// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Bloco 1: regras-base do JavaScript (do próprio ESLint)
  eslint.configs.recommended,

  // Bloco 2: regras recomendadas para TypeScript
  ...tseslint.configs.recommended,

  // Bloco 3: customizações das regras
  {
    rules: {
      // Ignora variáveis/argumentos não usados quando prefixados com "_".
      // Necessário para middlewares de erro do Express, cuja assinatura
      // exige 4 parâmetros (err, _req, res, _next) mesmo sem usar todos.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Bloco 4: o que ignorar (não faz sentido lintar build/deps)
  {
    ignores: ["dist/", "node_modules/", "src/generated/"],
  },
);
