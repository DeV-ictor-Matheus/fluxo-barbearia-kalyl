// Orquestrador da Entradas de hoje. Lê a lista do dia + o resumo
// (chips de barbeiro, sempre os 3 com zero-fill) e escolhe o estado a
// renderizar. Família "balcão": projeção operacional, sem R$. Loading e
// erro entram em fatia posterior.

import { useEntradasHoje } from "../use-entradas-hoje";
import { useFiltroBarbeiro } from "../use-filtro-barbeiro";
import { useResumo } from "@/features/dashboard/use-resumo";
import { EntradaItem } from "./entrada-item";

export function EntradasHoje() {
  const { data: entradas } = useEntradasHoje();
  const { data: resumo } = useResumo();

  // Hooks SEMPRE no topo, antes de qualquer return condicional (rules-of-hooks).
  // `?? []` evita undefined no loading; o early-return abaixo descarta o render.
  const { selecionado, setSelecionado, entradasFiltradas } = useFiltroBarbeiro(
    entradas ?? [],
  );

  // Espera as DUAS queries (lista + resumo). Loading caprichado vem depois.
  if (!entradas || !resumo) return null;

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col bg-zinc-950 px-4 py-3 text-zinc-100">
      <header className="px-1 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium uppercase tracking-[0.12em] text-amber-500">
            Entradas de hoje
          </span>
          <span className="text-[13px] text-zinc-600">
            {new Date().toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              timeZone: "America/Sao_Paulo",
            })}
          </span>
        </div>

        <div className="mt-3.5 flex items-baseline gap-2">
          <span className="text-[44px] font-medium leading-none text-zinc-100">
            {entradasFiltradas.length}
          </span>
          <span className="text-[14px] uppercase tracking-[0.08em] text-zinc-500">
            {entradasFiltradas.length === 1 ? "atendimento" : "atendimentos"}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelecionado(null)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
              selecionado === null
                ? "bg-amber-500 text-zinc-950"
                : "bg-zinc-900 text-zinc-400"
            }`}
          >
            Todos
          </button>
          {resumo.porBarbeiro.map((b) => (
            <button
              key={b.atendenteId}
              type="button"
              onClick={() => setSelecionado(b.atendenteId)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                selecionado === b.atendenteId
                  ? "bg-amber-500 text-zinc-950"
                  : "bg-zinc-900 text-zinc-400"
              }`}
            >
              {b.nome}{" "}
              <span
                className={
                  selecionado === b.atendenteId ? "opacity-70" : "opacity-50"
                }
              >
                {b.quantidade}
              </span>
            </button>
          ))}
        </div>
      </header>

      <div className="my-4 h-px bg-zinc-900" />

      {entradasFiltradas.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center pb-12 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-zinc-600">
            <svg
              width="20"
              height="20"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M0.949988 4.48455C0.949988 5.34059 1.64395 6.03455 2.49999 6.03455C3.35603 6.03455 4.04999 5.34059 4.04999 4.48455C4.04999 3.6285 3.35603 2.93455 2.49999 2.93455C1.64395 2.93455 0.949988 3.6285 0.949988 4.48455ZM2.49999 6.93455C1.14689 6.93455 0.0499878 5.83764 0.0499878 4.48455C0.0499878 3.13145 1.14689 2.03455 2.49999 2.03455C3.85309 2.03455 4.94999 3.13145 4.94999 4.48455C4.94999 4.80813 4.88726 5.11707 4.77329 5.39985L5.73655 6.04413C5.72943 6.06656 5.72269 6.08914 5.71635 6.11188L5.56288 6.66186L5.21005 6.89773L4.21554 6.23366C3.77357 6.6672 3.168 6.93455 2.49999 6.93455ZM0.949991 10.5C0.949991 9.64394 1.64395 8.94998 2.49999 8.94998C3.35603 8.94998 4.04999 9.64394 4.04999 10.5C4.04999 11.356 3.35603 12.05 2.49999 12.05C1.64395 12.05 0.949991 11.356 0.949991 10.5ZM2.49999 8.04998C1.14689 8.04998 0.0499908 9.14688 0.0499908 10.5C0.0499908 11.8531 1.14689 12.95 2.49999 12.95C3.85309 12.95 4.94999 11.8531 4.94999 10.5C4.94999 10.1803 4.88877 9.87497 4.77743 9.595L15 2.75737L14.0486 2.85737C12.7077 2.9983 11.4091 3.40895 10.231 4.06461L7.15646 5.77564C6.92307 5.90553 6.75134 6.12339 6.67955 6.38066L6.42653 7.28737L4.22437 8.75957C3.78166 8.32091 3.17246 8.04998 2.49999 8.04998ZM7.14435 9.2149L7.15646 9.22176L10.231 10.9328C11.4091 11.5884 12.7077 11.9991 14.0486 12.14L15 12.24L8.81072 8.1003L7.14435 9.2149Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-[14px] text-zinc-500">
            {selecionado === null
              ? "Dia ainda sem movimento"
              : "Nenhuma entrada deste barbeiro hoje"}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5 overflow-y-auto">
          {entradasFiltradas.map((entrada) => (
            <EntradaItem key={entrada.id} entrada={entrada} />
          ))}
        </div>
      )}
    </div>
  );
}
