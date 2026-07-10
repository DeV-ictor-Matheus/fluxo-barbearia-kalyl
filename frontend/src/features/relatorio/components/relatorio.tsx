import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRelatorio } from "../use-relatorio";
import { SeletorPeriodo } from "../seletor-periodo";
import { hojeBrasilia } from "@/lib/hoje-brasilia";
import { rotuloPeriodo } from "@/lib/rotulo-periodo";
import { formatarCentavos } from "@/lib/format";
import type { Periodo } from "@/types/relatorio";
import { CardLiquido } from "./card-liquido";
import { BarbeiroLinha } from "./barbeiro-linha";
import { SaidasLista } from "./saidas-lista";

export function Relatorio() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<Periodo>({
    tipo: "dia",
    dia: hojeBrasilia(),
  });
  const [seletorAberto, setSeletorAberto] = useState(false);
  // A queryKey do useRelatorio inclui o periodo; trocar o estado revalida sozinho.
  const { data, isPending, isError, refetch } = useRelatorio(periodo);

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col bg-zinc-950 px-4 py-3 text-zinc-100">
      <header className="flex items-center gap-3 px-1 pt-1">
        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="Voltar"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold">Relatório</h1>

        {/* Pill de período — tonal amber, abre o seletor. */}
        <button
          type="button"
          onClick={() => setSeletorAberto(true)}
          className="ml-auto flex items-center gap-2 rounded-full bg-amber-950 py-2 pl-3.5 pr-3 transition-colors hover:bg-amber-900"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fac775"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <span className="max-w-[9rem] truncate text-[13px] font-medium text-amber-200">
            {rotuloPeriodo(periodo)}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#eab308"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </header>

      {isPending ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-zinc-500">Carregando…</p>
        </div>
      ) : isError ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <p className="text-lg font-semibold text-zinc-100">
            Não foi possível carregar o relatório
          </p>
          <p className="text-sm text-zinc-500">
            Verifique a conexão e tente de novo.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-400"
          >
            Tentar de novo
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-6 overflow-y-auto pb-6">
          <CardLiquido
            liquidoCentavos={data.liquido}
            casaCentavos={data.totalEntradas.casa}
            saidasCentavos={data.saidas.total}
          />

          <section>
            <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">
              Por barbeiro
            </h2>
            <div className="flex flex-col gap-2">
              {data.porAtendente.map((a) => (
                <BarbeiroLinha key={a.atendenteId} atendente={a} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">
              Saídas · {formatarCentavos(data.saidas.total)}
            </h2>
            <SaidasLista saidas={data.saidas} />
          </section>
        </div>
      )}

      <SeletorPeriodo
        aberto={seletorAberto}
        periodo={periodo}
        onFechar={() => setSeletorAberto(false)}
        onAplicar={(novo) => {
          setPeriodo(novo);
          setSeletorAberto(false);
        }}
      />
    </div>
  );
}
