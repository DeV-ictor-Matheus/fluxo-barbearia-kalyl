export type EstadoLiquido = "lucro" | "prejuizo" | "neutro";

// Deriva o estado visual do líquido a partir do valor em centavos.
// > 0 lucro (verde), < 0 prejuízo (vermelho), 0 neutro (zinc).
export function estadoLiquido(liquidoCentavos: number): EstadoLiquido {
  if (liquidoCentavos > 0) return "lucro";
  if (liquidoCentavos < 0) return "prejuizo";
  return "neutro";
}
