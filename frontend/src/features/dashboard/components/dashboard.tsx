// Orquestrador da Tela F (HOME). Trata os estados da query e escolhe o modo.
// O modo Owner é um SLOT amarrado à Fase 7 (Auth + Relatório OWNER, enforcement
// no backend) — hoje renderiza só o balcão. Quando a auth existir, o branch
// isOwner preenche aqui SEM tocar no BalcaoMode.

import { useResumo } from "../use-resumo";
import { BalcaoMode } from "./balcao-mode";
import { DashboardSkeleton } from "./dashboard-skeleton";

export function Dashboard() {
  const { data: resumo, isPending, isError, refetch } = useResumo();

  // Slot do modo Owner — Fase 7. Hoje sempre balcão.
  // const isOwner = ...  ← virá da sessão Supabase Auth.

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col bg-zinc-950 px-4 py-3 text-zinc-100">
      {isPending ? (
        <DashboardSkeleton />
      ) : isError ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <p className="text-lg font-semibold text-zinc-100">
            Não foi possível carregar o painel
          </p>
          <p className="text-sm text-zinc-500">
            Verifique a conexão e tente de novo.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-400"
          >
            Tentar de novo
          </button>
        </div>
      ) : (
        <BalcaoMode resumo={resumo} />
      )}
    </div>
  );
}
