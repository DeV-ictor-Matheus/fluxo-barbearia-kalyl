import { useEffect, useState } from "react";

// Splash de abertura (cold start). Auto-contido: gerencia o próprio timer e
// avisa o pai via onFim quando termina. Aparece UMA vez ao abrir o app, não
// reaparece na navegação entre telas.
//
// SLOT DA LOGO: o bloco de 88px abaixo (tesoura provisória) é o lugar
// reservado da logo real da barbearia. Quando ela existir, troca-se o <svg>
// por <img src="/logo.svg" .../> — nenhuma outra mudança é necessária.

const DURACAO_MS = 1800;
const FADE_MS = 400;

interface SplashProps {
  onFim: () => void;
}

export function Splash({ onFim }: SplashProps) {
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    // Inicia o fade out perto do fim; chama onFim quando o fade termina.
    const inicioFade = setTimeout(() => setSaindo(true), DURACAO_MS - FADE_MS);
    const fim = setTimeout(onFim, DURACAO_MS);
    return () => {
      clearTimeout(inicioFade);
      clearTimeout(fim);
    };
  }, [onFim]);

  return (
    <div
      className={`flex h-dvh flex-col items-center justify-center bg-[#13100E] transition-opacity duration-[400ms] ${
        saindo ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex animate-splash-entra flex-col items-center px-10">
        <img
          src="/logo-splash.webp"
          alt="Barbearia Kalyl"
          className="w-full max-w-[280px]"
          // dimensões explícitas evitam layout shift durante a decodificação
          width={800}
          height={1034}
          decoding="async"
        />
      </div>
    </div>
  );
}
