// Esqueleto do carregamento da Tela G. Espelha a silhueta real — header,
// número, chips, linhas com avatar — pra não haver "salto" de layout quando
// os dados chegam. Mesmo padrão do DashboardSkeleton (animate-pulse + zinc).

export function EntradasHojeSkeleton() {
  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col bg-zinc-950 px-4 py-3 text-zinc-100">
      <header className="px-1 pt-2">
        <div className="flex items-center justify-between">
          <div className="h-3 w-32 animate-pulse rounded bg-zinc-800/60" />
          <div className="h-3 w-11 animate-pulse rounded bg-zinc-800/40" />
        </div>

        <div className="mt-3.5 flex items-baseline gap-2">
          <div className="h-10 w-14 animate-pulse rounded-lg bg-zinc-800/60" />
          <div className="h-3 w-24 animate-pulse rounded bg-zinc-800/40" />
        </div>

        <div className="mt-4 flex gap-2">
          <div className="h-8 w-16 animate-pulse rounded-full bg-zinc-800/60" />
          <div className="h-8 w-20 animate-pulse rounded-full bg-zinc-800/40" />
          <div className="h-8 w-20 animate-pulse rounded-full bg-zinc-800/40" />
        </div>
      </header>

      <div className="my-4 h-px bg-zinc-900" />

      <div className="flex flex-col gap-3.5 px-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-[42px] w-[42px] animate-pulse rounded-full bg-zinc-800/60" />
            <div className="flex-1">
              <div className="mb-2 h-3 w-20 animate-pulse rounded bg-zinc-800/60" />
              <div className="h-2.5 w-28 animate-pulse rounded bg-zinc-800/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
