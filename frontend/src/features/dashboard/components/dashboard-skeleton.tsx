// Esqueleto do carregamento (isPending). Espelha a silhueta do balcão —
// número grande + nome — pra não haver "salto" de layout quando o dado chega.

export function DashboardSkeleton() {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="h-28 w-40 animate-pulse rounded-2xl bg-zinc-800/60" />
        <div className="h-8 w-32 animate-pulse rounded-lg bg-zinc-800/60" />
        <div className="h-3 w-20 animate-pulse rounded bg-zinc-800/40" />
      </div>
    );
  }