import { formatarCentavos } from "@/lib/format";
import { estadoLiquido } from "../estado-liquido";

interface CardLiquidoProps {
  liquidoCentavos: number;
  casaCentavos: number;
  saidasCentavos: number;
}

// Cores por estado. Mantém a identidade zinc/amber do app; emerald/red
// combinam com o fundo escuro sem gritar.
const CORES = {
  lucro: {
    texto: "text-emerald-400",
    fundo: "bg-emerald-500/10",
    rotulo: "text-emerald-500/80",
  },
  prejuizo: {
    texto: "text-red-400",
    fundo: "bg-red-500/10",
    rotulo: "text-red-500/80",
  },
  neutro: {
    texto: "text-zinc-400",
    fundo: "bg-zinc-900",
    rotulo: "text-zinc-500",
  },
} as const;

export function CardLiquido({
  liquidoCentavos,
  casaCentavos,
  saidasCentavos,
}: CardLiquidoProps) {
  const estado = estadoLiquido(liquidoCentavos);
  const cor = CORES[estado];

  return (
    <div className={`rounded-2xl p-5 text-center ${cor.fundo}`}>
      <p className={`text-xs font-medium ${cor.rotulo}`}>Líquido da casa</p>
      <p className={`mt-1 text-4xl font-bold tabular-nums ${cor.texto}`}>
        {formatarCentavos(liquidoCentavos)}
      </p>
      {estado !== "neutro" && (
        <p className={`mt-2 text-xs ${cor.rotulo}`}>
          casa {formatarCentavos(casaCentavos)} − saídas{" "}
          {formatarCentavos(saidasCentavos)}
        </p>
      )}
    </div>
  );
}
