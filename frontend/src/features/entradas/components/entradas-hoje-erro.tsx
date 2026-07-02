// Estado de erro da Tela G. Preserva o header pra orientar o usuário e
// oferece uma saída: o botão chama onRetry, que o orquestrador liga ao
// refetch das duas queries (lista + resumo). Componente burro — não decide
// o que revalidar, só dispara o callback. Mensagem sem jargão técnico.

interface EntradasHojeErroProps {
  onRetry: () => void;
}

export function EntradasHojeErro({ onRetry }: EntradasHojeErroProps) {
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
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-12 text-center">
        <div className="mb-3.5 flex h-[46px] w-[46px] items-center justify-center rounded-full bg-red-950/50">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-500"
            aria-hidden="true"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
        </div>

        <p className="text-[15px] font-medium text-zinc-200">
          Não foi possível carregar
        </p>
        <p className="mt-1 max-w-[230px] text-[13px] leading-relaxed text-zinc-500">
          Verifique a conexão e tente novamente.
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-4.5 flex items-center gap-1.5 rounded-full bg-amber-500 px-4.5 py-2.5 text-[13px] font-medium text-zinc-950 transition-colors hover:bg-amber-400 active:scale-[0.98]"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
