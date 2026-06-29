// Estado vazio REAL: nenhum barbeiro ativo. (Dia zerado NÃO cai aqui —
// barbeiros com 0 cortes giram normalmente, a tela é viva.)
// A skill manda: vazio é convite à ação, não lamento.

export function DashboardEmpty() {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <p className="text-2xl font-semibold text-zinc-100">
          Nenhum barbeiro ativo
        </p>
        <p className="max-w-xs text-sm text-zinc-500">
          Cadastre um barbeiro para o painel começar a mostrar os atendimentos do dia.
        </p>
      </div>
    );
  }