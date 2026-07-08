import { useNavigate } from "react-router-dom";
import { useRelatorio } from "../use-relatorio";
import { hojeBrasilia } from "@/lib/hoje-brasilia";
import { CardLiquido } from "./card-liquido";
import { BarbeiroLinha } from "./barbeiro-linha";
import { SaidasLista } from "./saidas-lista";

export function Relatorio() {
  const navigate = useNavigate();
  // Período fixo em "hoje" nesta fatia. O seletor de período vem na 5b.4.
  const periodo = { tipo: "dia" as const, dia: hojeBrasilia() };
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
              Saídas · {formatarSaidasTotal(data.saidas.total)}
            </h2>
            <SaidasLista saidas={data.saidas} />
          </section>
        </div>
      )}
    </div>
  );
}

// Import local pra evitar poluir o topo; formatarCentavos já vem do lib.
import { formatarCentavos } from "@/lib/format";
function formatarSaidasTotal(centavos: number): string {
  return formatarCentavos(centavos);
}
