import { useState } from "react";
import { Dashboard } from "@/features/dashboard/components/dashboard";
import { NovaEntrada } from "@/features/entradas/nova-entrada";
import { EntradasHoje } from "@/features/entradas/components/entradas-hoje";
import { Splash } from "@/components/splash";

// Orquestrador de telas por estado. Substitui o roteamento até o React
// Router entrar (junto com Auth, Fase 7). As telas não conhecem este
// mecanismo — recebem callbacks e disparam intenção de navegar, o que
// mantém a migração futura pro Router trivial (só este arquivo muda).
type Tela = "dashboard" | "nova-entrada" | "entradas-hoje";

export default function App() {
  // Splash de cold start: true só na carga inicial, some após o timer e não
  // reaparece na navegação. Envolve o switch sem virar uma "tela".
  const [mostrarSplash, setMostrarSplash] = useState(true);

  const [tela, setTela] = useState<Tela>("dashboard");

  // "De onde vim" ao abrir a Nova Entrada. Permite devolver o operador à
  // origem correta ao voltar (Dashboard ou Entradas de hoje).
  const [origem, setOrigem] = useState<Tela>("dashboard");

  function abrirNovaEntrada(de: Tela) {
    setOrigem(de);
    setTela("nova-entrada");
  }

  if (mostrarSplash) {
    return <Splash onFim={() => setMostrarSplash(false)} />;
  }

  switch (tela) {
    case "nova-entrada":
      return <NovaEntrada onVoltar={() => setTela(origem)} />;

    case "entradas-hoje":
      return (
        <EntradasHoje
          onVoltar={() => setTela("dashboard")}
          onNovaEntrada={() => abrirNovaEntrada("entradas-hoje")}
        />
      );

    case "dashboard":
    default:
      return <Dashboard onEntradasHoje={() => setTela("entradas-hoje")} />;
  }
}
