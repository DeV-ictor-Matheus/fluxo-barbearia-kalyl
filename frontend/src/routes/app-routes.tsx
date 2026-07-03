import { Routes, Route } from "react-router-dom";
import App from "@/App";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { RelatorioPlaceholder } from "@/features/relatorio/components/relatorio-placeholder";

export function AppRoutes() {
  return (
    <Routes>
      {/* App público: o orquestrador de telas por estado (Dashboard, Nova Entrada, Entradas de hoje) */}
      <Route path="/" element={<App />} />

      {/* Relatório: acesso restrito ao dono. A proteção real de dados fica no backend (fatia futura) */}
      <Route
        path="/relatorio"
        element={
          <ProtectedRoute>
            <RelatorioPlaceholder />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
