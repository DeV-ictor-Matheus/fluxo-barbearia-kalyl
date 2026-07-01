// Barra inferior de navegação da Entradas de hoje. Componente
// burro: recebe callbacks e dispara intenção — não conhece o mecanismo de
// navegação. Entra no fluxo flex da Tela de Entradas (não é fixed), então ocupa espaço
// próprio e a lista encolhe pra caber, sem sobreposição nem padding mágico.

interface BarraInferiorHojeProps {
  onVoltar: () => void;
  onNovaEntrada: () => void;
}

export function BarraInferiorHoje({
  onVoltar,
  onNovaEntrada,
}: BarraInferiorHojeProps) {
  return (
    <div className="shrink-0 border-t border-zinc-900 pt-3">
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={onVoltar}
          aria-label="Voltar ao painel"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 transition-colors hover:bg-zinc-800"
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
        <button
          type="button"
          onClick={onNovaEntrada}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-[15px] font-medium text-zinc-950 transition-colors hover:bg-amber-400"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nova entrada
        </button>
      </div>
    </div>
  );
}
