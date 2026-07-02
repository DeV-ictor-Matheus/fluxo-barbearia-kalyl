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
      className={`flex h-dvh flex-col items-center justify-center bg-zinc-950 transition-opacity duration-[400ms] ${
        saindo ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex animate-splash-entra flex-col items-center">
        {/* SLOT DA LOGO REAL — trocar este bloco por <img> quando houver logo */}
        <div className="mb-[22px] flex h-22 w-22 items-center justify-center rounded-[24px] border border-zinc-800 bg-zinc-900">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#EF9F27"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <line x1="20" y1="4" x2="8.12" y2="15.88" />
            <line x1="14.47" y1="14.48" x2="20" y2="20" />
            <line x1="8.12" y1="8.12" x2="12" y2="12" />
          </svg>
        </div>

        <div className="pl-[0.22em] text-[34px] font-medium tracking-[0.22em] text-zinc-100">
          KALYL
        </div>
        <div className="mt-2 pl-[0.32em] text-[12px] font-medium tracking-[0.32em] text-zinc-500">
          BARBEARIA
        </div>
      </div>
    </div>
  );
}
