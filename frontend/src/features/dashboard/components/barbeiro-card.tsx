// Card individual do carrossel — o "palco". Burro, sem estado: recebe um
// BarbeiroResumo e renderiza. A inicial vira marca d'água atrás do número
// gigante (identidade sem ruído). Legível de longe: número domina a tela.

import type { BarbeiroResumo } from '@/types/resumo';

interface BarbeiroCardProps {
  barbeiro: BarbeiroResumo;
}

export function BarbeiroCard({ barbeiro }: BarbeiroCardProps) {
  const inicial = barbeiro.nome.charAt(0).toUpperCase();
  const ehSingular = barbeiro.quantidade === 1;

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Marca d'água: a inicial atrás do número. aria-hidden — é decorativa,
          o nome real é anunciado abaixo. */}
      <span
        aria-hidden
        className="pointer-events-none absolute select-none text-[16rem] font-bold leading-none text-white/[0.03]"
      >
        {inicial}
      </span>

      {/* Número de cortes — protagonista. tabular-nums evita "pulo" de largura
          quando o valor muda durante a rotação. */}
      <span className="relative text-[7rem] font-bold leading-none tabular-nums text-zinc-100">
        {barbeiro.quantidade}
      </span>

      <span className="relative mt-2 text-3xl font-semibold text-zinc-100">
        {barbeiro.nome}
      </span>

      <span className="relative mt-1 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
        {ehSingular ? 'corte hoje' : 'cortes hoje'}
      </span>
    </div>
  );
}