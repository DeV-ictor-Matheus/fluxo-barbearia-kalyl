import type { ReactNode } from "react";
import { useAuth } from "../use-auth";
import { LoginForm } from "./login-form";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-500">Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-zinc-950 text-zinc-100">
        {/* Área central: card de login */}
        <div className="flex flex-1 flex-col justify-center px-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="mb-6 flex flex-col items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-950">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ef9f27"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </span>
              <h1 className="text-lg font-semibold text-zinc-100">
                Fluxo Barbearia Kalyl
              </h1>
              <p className="mt-1 text-[13px] text-zinc-500">
                Acesso restrito à equipe
              </p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
