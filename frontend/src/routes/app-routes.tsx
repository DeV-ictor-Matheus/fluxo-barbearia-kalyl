import { Routes, Route } from "react-router-dom";
import App from "@/App";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { Relatorio } from "@/features/relatorio/components/relatorio";
import { NovaSaida } from "@/features/saidas/nova-saida"; // ← adicionar

export function AppRoutes() {
  return (
    <Routes>
      {/* Toda a API exige JWT — o app inteiro fica atrás de login.
          Conta única de balcão, sem distinção de papel. */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      />

      <Route
        path="/relatorio"
        element={
          <ProtectedRoute>
            <Relatorio />
          </ProtectedRoute>
        }
      />

      {/* Lançamento de saída — acessado pelo botão fixo do Relatório.
          Protegido igual às demais: saída é dado financeiro do dono. */}
      <Route
        path="/nova-saida"
        element={
          <ProtectedRoute>
            <NovaSaida />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
