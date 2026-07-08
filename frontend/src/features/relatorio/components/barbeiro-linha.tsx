import { formatarCentavos } from "@/lib/format";
import type { RelatorioAtendente } from "@/types/relatorio";

interface BarbeiroLinhaProps {
  atendente: RelatorioAtendente;
}

// Um barbeiro tem "movimento" se qualquer valor for diferente de zero.
function temMovimento(a: RelatorioAtendente): boolean {
  return a.casa !== 0 || a.repasse !== 0 || a.gorjeta !== 0 || a.desconto !== 0;
}

export function BarbeiroLinha({ atendente }: BarbeiroLinhaProps) {
  const inicial = atendente.nome.charAt(0).toUpperCase();
  const ativo = temMovimento(atendente);

  if (!ativo) {
    // Empty state por barbeiro: presente (zero-fill do backend) mas esmaecido.
    return (
      <div className="flex items-center gap-3 rounded-xl border border-zinc-800 p-3 opacity-60">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-500">
          {inicial}
        </span>
        <span className="flex-1 text-sm text-zinc-400">{atendente.nome}</span>
        <span className="text-xs text-zinc-500">sem movimento</span>
      </div>
    );
  }

  const dono =
    atendente.repasse === 0 && atendente.gorjeta === 0 && atendente.casa > 0;

  return (
    <div className="rounded-xl border border-zinc-800 p-3">
      <div className="mb-2 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15 text-xs font-medium text-amber-500">
          {inicial}
        </span>
        <span className="flex-1 text-sm font-medium text-zinc-100">
          {atendente.nome}
        </span>
      </div>
      <div className="flex gap-2">
        <Bloco rotulo="CASA" valor={formatarCentavos(atendente.casa)} />
        <Bloco
          rotulo="REPASSE"
          valor={dono ? "—" : formatarCentavos(atendente.repasse)}
          destaque={!dono && atendente.repasse > 0}
        />
        <Bloco
          rotulo="GORJETA"
          valor={dono ? "—" : formatarCentavos(atendente.gorjeta)}
        />
      </div>
    </div>
  );
}

interface BlocoProps {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}

// Repasse com destaque (amber) = "isto você paga ao parceiro".
function Bloco({ rotulo, valor, destaque }: BlocoProps) {
  return (
    <div
      className={`flex-1 rounded-lg p-2 text-center ${destaque ? "bg-amber-500/10" : "bg-zinc-900"}`}
    >
      <p
        className={`text-[10px] ${destaque ? "text-amber-500/80" : "text-zinc-500"}`}
      >
        {rotulo}
      </p>
      <p
        className={`text-xs font-medium tabular-nums ${destaque ? "text-amber-400" : "text-zinc-100"}`}
      >
        {valor}
      </p>
    </div>
  );
}
