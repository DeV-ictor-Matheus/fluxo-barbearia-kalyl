import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/query-client";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/auth-context";
import { AppRoutes } from "./routes/app-routes.tsx";
import { PwaUpdatePrompt } from "@/features/pwa/pwa-update-prompt";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
      {/* Toasts globais (sonner). Fica fora do App para capturar de toda a árvore. */}
      <Toaster richColors position="top-center" />
      {/* Observa o service worker e avisa quando há versão nova (não renderiza UI). */}
      <PwaUpdatePrompt />
      {/* Painel de inspeção do React Query — só aparece em desenvolvimento */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
