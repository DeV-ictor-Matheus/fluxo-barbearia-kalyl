// Modo balcão: a tela pública. Roda o carrossel, mostra o barbeiro da vez,
// dots de progresso (K·I·L) e o total do dia no rodapé. ZERO R$ — privacidade
// por design. Recebe o Resumo já carregado; não conhece fetch nem loading.

import type { Resumo } from '@/types/resumo';
import { useCarrossel } from '../use-carrossel';
import { BarbeiroCard } from './barbeiro-card';
import { DashboardEmpty } from './dashboard-empty';

interface BalcaoModeProps {
  resumo: Resumo;
}

// Formata YYYY-MM-DD → "29 jun" sem libs: o backend já garante a data
// Brasília, então split direto é seguro (sem Date/fuso pra não introduzir bug).
const MESES = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

function formatarData(iso: string): string {
  const [, mes, dia] = iso.split('-');
  return `${Number(dia)} ${MESES[Number(mes) - 1]}`;
}

export function BalcaoMode({ resumo }: BalcaoModeProps) {
  const { porBarbeiro, totalAtendimentos, data } = resumo;
  const indice = useCarrossel({ total: porBarbeiro.length });

  // Sem barbeiros ativos = vazio real. (Com barbeiros zerados, o carrossel gira.)
  if (porBarbeiro.length === 0) {
    return <DashboardEmpty />;
  }

  // Clamp defensivo: o hook já mantém o índice válido, mas garantimos aqui
  // que nunca lemos fora do array num render intermediário pós-refetch.
  const barbeiroAtual = porBarbeiro[indice] ?? porBarbeiro[0];
  const totalSingular = totalAtendimentos === 1;

  return (
    <div className="flex h-full flex-col">
      {/* Header discreto: marca + data. Não compete com o número. */}
      <header className="flex items-center justify-between px-2 py-1">
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-500/90">
          Barbearia Kalyl
        </span>
        <span className="text-sm font-medium text-zinc-500">
          {formatarData(data)}
        </span>
      </header>

      {/* Palco — ocupa o espaço todo, número centralizado. */}
      <main className="flex flex-1 items-center justify-center">
        <BarbeiroCard barbeiro={barbeiroAtual} />
      </main>

      {/* Rodapé: dots de progresso + total do dia, ambos discretos. */}
      <footer className="flex flex-col items-center gap-3 pb-2">
        <div className="flex items-center gap-2" role="presentation">
          {porBarbeiro.map((b, i) => (
            <span
              key={b.atendenteId}
              className={
                i === indice
                  ? 'h-2 w-2 rounded-full bg-amber-500'
                  : 'h-2 w-2 rounded-full bg-zinc-700'
              }
            />
          ))}
        </div>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          {totalAtendimentos} {totalSingular ? 'atendimento' : 'atendimentos'} no dia
        </span>
      </footer>
    </div>
  );
}