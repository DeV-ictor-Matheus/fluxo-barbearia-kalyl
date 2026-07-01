// Bottom sheet do Dashboard. Gaveta de acesso operacional (Entradas de
// hoje) e slot reservado do Modo Owner — inerte até o Auth (Fase 7)
// definir o modo autenticado. Componente burro: recebe estado de
// abertura e callbacks, não conhece navegação nem fetch.

interface MenuSheetProps {
  aberto: boolean;
  onFechar: () => void;
  onEntradasHoje: () => void;
}

export function MenuSheet({
  aberto,
  onFechar,
  onEntradasHoje,
}: MenuSheetProps) {
  return (
    <div
      className={`fixed inset-0 z-50 ${aberto ? "" : "pointer-events-none"}`}
      aria-hidden={!aberto}
    >
      {/* Scrim */}
      <div
        onClick={onFechar}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-250 ${
          aberto ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute inset-x-0 bottom-0 mx-auto max-w-md rounded-t-3xl border-t border-zinc-800 bg-zinc-900 px-4 pb-6 pt-2 transition-transform duration-300 ease-out ${
          aberto ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
      >
        {/* Grabber */}
        <div className="flex justify-center py-2">
          <span className="h-1 w-9 rounded-full bg-zinc-700" />
        </div>

        <span className="block px-1 pb-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-600">
          Operação
        </span>

        <button
          type="button"
          onClick={() => {
            onFechar();
            onEntradasHoje();
          }}
          className="mb-2.5 flex w-full items-center gap-3.5 rounded-xl border border-zinc-800 bg-zinc-800/60 p-3.5 text-left transition-colors hover:bg-zinc-800"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-amber-950">
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef9f27"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-medium text-zinc-100">
              Entradas de hoje
            </span>
            <span className="mt-0.5 block text-[12px] text-zinc-500">
              Lista e resumo do dia
            </span>
          </span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-600"
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <span className="block px-1 pb-2.5 pt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-600">
          Administração
        </span>

        {/* Slot Owner — estático, bloqueado até o Auth (Fase 7) */}
        <div className="flex w-full items-center gap-3.5 rounded-xl border border-zinc-900 p-3.5 opacity-75">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-zinc-800">
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-zinc-600"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-medium text-zinc-400">
              Modo Owner
            </span>
            <span className="mt-0.5 block text-[12px] text-zinc-600">
              Financeiro e relatórios
            </span>
          </span>
          <span className="rounded-md border border-zinc-800 bg-zinc-800 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            Em breve
          </span>
        </div>
      </div>
    </div>
  );
}
