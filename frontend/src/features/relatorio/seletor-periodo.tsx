import { useState } from "react";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { dataParaISO, isoParaData } from "@/lib/data-iso";
import type { Periodo } from "@/types/relatorio";
import type { DateRange } from "react-day-picker";

type Modo = "dia" | "intervalo";

interface SeletorPeriodoProps {
  aberto: boolean;
  periodo: Periodo;
  onFechar: () => void;
  onAplicar: (periodo: Periodo) => void;
}

// Deriva o modo inicial e a seleção inicial a partir do Periodo vigente,
// pra reabrir o sheet já no estado do período aplicado.
function selecaoInicial(periodo: Periodo): {
  modo: Modo;
  dia: Date | undefined;
  intervalo: DateRange | undefined;
} {
  if (periodo.tipo === "dia") {
    return { modo: "dia", dia: isoParaData(periodo.dia), intervalo: undefined };
  }
  return {
    modo: "intervalo",
    dia: undefined,
    intervalo: {
      from: isoParaData(periodo.inicio),
      to: isoParaData(periodo.fim),
    },
  };
}

const AMBER_CELULAS = cn(
  "[&_[data-range-start=true]]:!bg-[#ef9f27] [&_[data-range-start=true]]:!text-amber-950",
  "[&_[data-range-end=true]]:!bg-[#ef9f27] [&_[data-range-end=true]]:!text-amber-950",
  "[&_[data-selected-single=true]]:!bg-[#ef9f27] [&_[data-selected-single=true]]:!text-amber-950",
  "[&_[data-range-middle=true]]:!bg-zinc-700 [&_[data-range-middle=true]]:!text-zinc-100",
);

export function SeletorPeriodo({
  aberto,
  periodo,
  onFechar,
  onAplicar,
}: SeletorPeriodoProps) {
  const inicial = selecaoInicial(periodo);
  const [modo, setModo] = useState<Modo>(inicial.modo);
  const [dia, setDia] = useState<Date | undefined>(inicial.dia);
  const [intervalo, setIntervalo] = useState<DateRange | undefined>(
    inicial.intervalo,
  );

  // Troca de modo reseta a seleção — dia e intervalo não compartilham estado.
  function trocarModo(novo: Modo) {
    if (novo === modo) return;
    setModo(novo);
    setDia(undefined);
    setIntervalo(undefined);
  }

  const podeAplicar =
    modo === "dia"
      ? dia !== undefined
      : Boolean(intervalo?.from && intervalo?.to);

  function aplicar() {
    if (modo === "dia" && dia) {
      onAplicar({ tipo: "dia", dia: dataParaISO(dia) });
      return;
    }
    if (modo === "intervalo" && intervalo?.from && intervalo?.to) {
      onAplicar({
        tipo: "intervalo",
        inicio: dataParaISO(intervalo.from),
        fim: dataParaISO(intervalo.to),
      });
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${aberto ? "" : "pointer-events-none"}`}
      aria-hidden={!aberto}
    >
      <div
        onClick={onFechar}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-250 ${
          aberto ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Selecionar período"
        className={`absolute inset-x-0 bottom-0 mx-auto max-w-md rounded-t-3xl border-t border-zinc-800 bg-zinc-900 px-4 pb-6 pt-2 transition-transform duration-300 ease-out ${
          aberto ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
      >
        <div className="flex justify-center py-2">
          <span className="h-1 w-9 rounded-full bg-zinc-700" />
        </div>

        <div className="flex items-center justify-between pb-3.5">
          <span className="text-[15px] font-medium text-zinc-100">Período</span>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 flex rounded-[10px] bg-zinc-800 p-[3px]">
          {(["dia", "intervalo"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => trocarModo(m)}
              className={`flex-1 rounded-[7px] py-2 text-[13px] transition-colors ${
                modo === m
                  ? "bg-zinc-700 font-medium text-zinc-50"
                  : "text-zinc-400"
              }`}
            >
              {m === "dia" ? "Dia único" : "Intervalo"}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          {modo === "dia" ? (
            <Calendar
              mode="single"
              selected={dia}
              onSelect={setDia}
              disabled={{ after: new Date() }}
              locale={ptBR}
              className={AMBER_CELULAS}
            />
          ) : (
            <Calendar
              mode="range"
              selected={intervalo}
              onSelect={setIntervalo}
              disabled={{ after: new Date() }}
              locale={ptBR}
              className={AMBER_CELULAS}
            />
          )}
        </div>

        <button
          type="button"
          onClick={aplicar}
          disabled={!podeAplicar}
          className="mt-4 w-full rounded-[10px] bg-[#ef9f27] py-3 text-sm font-medium text-amber-950 transition-opacity disabled:opacity-40"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}
