import { formatarCentavos } from "@/lib/format";
import type { Saidas } from "@/types/relatorio";

interface SaidasListaProps {
  saidas: Saidas;
}

// Rótulos legíveis para as categorias do enum CategoriaSaida do backend.
const ROTULOS: Record<string, string> = {
  ALUGUEL: "Aluguel",
  TAXA_CARTAO: "Taxa cartão",
  PRODUTOS: "Produtos",
  ALUGUEL_POS: "Aluguel POS",
  SALARIO: "Salário",
  CONTAS: "Contas",
  MARKETING: "Marketing",
  OUTROS: "Outros",
};

export function SaidasLista({ saidas }: SaidasListaProps) {
  const categorias = Object.entries(saidas.porCategoria);

  if (categorias.length === 0) {
    return (
      <p className="text-sm text-zinc-500">Nenhuma saída neste período.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {categorias.map(([categoria, valor]) => (
        <div key={categoria} className="flex justify-between text-sm">
          <span className="text-zinc-400">
            {ROTULOS[categoria] ?? categoria}
          </span>
          <span className="tabular-nums text-zinc-100">
            {formatarCentavos(valor)}
          </span>
        </div>
      ))}
    </div>
  );
}
