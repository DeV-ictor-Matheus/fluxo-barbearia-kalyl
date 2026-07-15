import { useEffect } from "react";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";

// Não renderiza UI própria. Observa o service worker e, quando há versão nova
// esperando (registerType: 'prompt'), dispara um toast persistente com ação de
// atualizar. O usuário decide QUANDO recarregar — nunca no meio de um
// lançamento, onde um reload perderia o estado do formulário.
export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (!needRefresh) return;

    toast("Nova versão disponível", {
      description: "Atualize para receber as últimas melhorias.",
      duration: Infinity, // persistente: só sai quando o usuário decidir
      action: {
        label: "Atualizar",
        onClick: () => updateServiceWorker(true), // ativa o novo SW e recarrega
      },
    });
  }, [needRefresh, updateServiceWorker]);

  return null;
}
