import { Routes, Route } from "react-router-dom";
import App from "@/App";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { Relatorio } from "@/features/relatorio/components/relatorio";

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
    </Routes>
  );
}
