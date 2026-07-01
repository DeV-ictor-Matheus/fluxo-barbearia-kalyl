import type { Resumo } from "@/types/resumo";
import { useCarrossel } from "../use-carrossel";
import { BarbeiroCard } from "./barbeiro-card";
import { DashboardEmpty } from "./dashboard-empty";

interface BalcaoModeProps {
  resumo: Resumo;
}

export function BalcaoMode({ resumo }: BalcaoModeProps) {
  const { porBarbeiro, totalAtendimentos } = resumo;
  const indice = useCarrossel({ total: porBarbeiro.length });

  if (porBarbeiro.length === 0) {
    return <DashboardEmpty />;
  }

  const barbeiroAtual = porBarbeiro[indice] ?? porBarbeiro[0];
  const totalSingular = totalAtendimentos === 1;

  return (
    <div className="flex h-full flex-col">
      {/* Palco — ocupa o espaço todo, número centralizado. O header (marca +
          data) agora é responsabilidade do Dashboard, dono único do topo. */}
      <main className="flex flex-1 items-center justify-center">
        <BarbeiroCard barbeiro={barbeiroAtual} />
      </main>

      <footer className="flex flex-col items-center gap-3 pb-2">
        <div className="flex items-center gap-2" role="presentation">
          {porBarbeiro.map((b, i) => (
            <span
              key={b.atendenteId}
              className={
                i === indice
                  ? "h-2 w-2 rounded-full bg-amber-500"
                  : "h-2 w-2 rounded-full bg-zinc-700"
              }
            />
          ))}
        </div>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          {totalAtendimentos} {totalSingular ? "atendimento" : "atendimentos"}{" "}
          no dia
        </span>
      </footer>
    </div>
  );
}
