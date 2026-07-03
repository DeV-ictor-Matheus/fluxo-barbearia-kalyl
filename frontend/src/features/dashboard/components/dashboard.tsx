import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useResumo } from "../use-resumo";
import { BalcaoMode } from "./balcao-mode";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { MenuSheet } from "@/features/entradas/components/menu-sheet";

const MESES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

function formatarData(iso: string): string {
  const [, mes, dia] = iso.split("-");
  return `${Number(dia)} ${MESES[Number(mes) - 1]}`;
}

interface DashboardProps {
  onEntradasHoje: () => void;
}

export function Dashboard({ onEntradasHoje }: DashboardProps) {
  const { data: resumo, isPending, isError, refetch } = useResumo();
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col bg-zinc-950 px-4 py-3 text-zinc-100">
      {/* Header do Dashboard — três zonas: data (esq) / marca (centro) / menu (dir).
          No fluxo (não absolute), então nada se sobrepõe. Dono único do topo:
          o BalcaoMode não renderiza mais header próprio. */}
      <header className="grid grid-cols-3 items-center px-1 pt-1">
        <span className="justify-self-start text-[13px] font-medium text-zinc-500">
          {resumo ? formatarData(resumo.data) : ""}
        </span>
        <span className="justify-self-center text-[15px] font-semibold uppercase tracking-[0.2em] text-amber-500">
          Kalyl
        </span>
        <button
          type="button"
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu"
          className="justify-self-end flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

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

      <MenuSheet
        aberto={menuAberto}
        onFechar={() => setMenuAberto(false)}
        onEntradasHoje={onEntradasHoje}
        onRelatorio={() => navigate("/relatorio")}
      />
    </div>
  );
}
