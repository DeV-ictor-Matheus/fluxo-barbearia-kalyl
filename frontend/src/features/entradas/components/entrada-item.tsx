// Uma linha da lista da Tela de Entradas: avatar (inicial), nome, serviço e hora.
// O avatar reserva o espaço circular de 42px — quando a foto do barbeiro
// entrar (v2), troca-se a inicial por <img> no mesmo container, sem reflow.

import type { EntradaResumida } from "@/types/entrada";
import { formatarHora } from "@/lib/format";

interface EntradaItemProps {
  entrada: EntradaResumida;
}

export function EntradaItem({ entrada }: EntradaItemProps) {
  const inicial = entrada.atendente.nome.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3.5 rounded-xl px-3 py-3.5">
      <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-full bg-zinc-900">
        <span className="text-[15px] font-medium text-zinc-400">{inicial}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-medium text-zinc-100">
          {entrada.atendente.nome}
        </div>
        <div className="text-[13px] text-zinc-500">{entrada.servico.nome}</div>
      </div>

      <span className="text-[14px] tabular-nums text-zinc-600">
        {formatarHora(entrada.criadoEm)}
      </span>
    </div>
  );
}
