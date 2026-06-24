// Tela E — Nova Entrada (FATIA 3: submit). Primeiro write financeiro do
// frontend. Conecta useCriarEntrada. A tela fica aberta para lançamentos
// sequenciais: sucesso limpa o essencial e preserva atendente + pagamento.

import { useState } from "react";
import { toast } from "sonner";
import { useAtendentes } from "@/features/atendentes/use-atendentes";
import { useServicos } from "@/features/servicos/use-servicos";
import { useCriarEntrada } from "./use-criar-entrada";
import { formatarCentavos } from "@/lib/format";
import type { MetodoPagamento } from "@/types/entrada";
import type { Servico } from "@/types/servico";

const PAGAMENTOS: { valor: MetodoPagamento; label: string }[] = [
  { valor: "pix", label: "Pix" },
  { valor: "cartao", label: "Cartão" },
  { valor: "dinheiro", label: "Dinheiro" },
];

function reaisParaCentavos(texto: string): number {
  const normalizado = texto.replace(",", ".").trim();
  if (normalizado === "") return 0;
  const reais = Number(normalizado);
  if (Number.isNaN(reais) || reais < 0) return 0;
  return Math.round(reais * 100);
}

export function NovaEntrada() {
  const atendentes = useAtendentes();
  const servicos = useServicos();
  const criarEntrada = useCriarEntrada();

  const [atendenteId, setAtendenteId] = useState<string | null>(null);
  const [clienteProprio, setClienteProprio] = useState(false);
  const [servicoId, setServicoId] = useState<string | null>(null);
  const [descontoTexto, setDescontoTexto] = useState("");
  const [gorjetaTexto, setGorjetaTexto] = useState("");
  const [metodoPagamento, setMetodoPagamento] =
    useState<MetodoPagamento>("pix");
  // Erro de campo do desconto vindo do backend (400). Raramente dispara
  // porque o front já bloqueia, mas é a defesa dupla decidida no Conselho.
  const [erroDesconto, setErroDesconto] = useState<string | null>(null);

  const carregando = atendentes.isLoading || servicos.isLoading;
  const comErro = atendentes.isError || servicos.isError;

  function tentarNovamente() {
    if (atendentes.isError) atendentes.refetch();
    if (servicos.isError) servicos.refetch();
  }

  function selecionarAtendente(id: string) {
    setAtendenteId(id);
    setClienteProprio(false);
    setDescontoTexto("");
    setErroDesconto(null);
  }

  function selecionarOrigem(proprio: boolean) {
    setClienteProprio(proprio);
    setDescontoTexto("");
    setErroDesconto(null);
  }

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Carregando…</p>
      </div>
    );
  }

  if (comErro) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p>Não foi possível carregar os dados. Verifique a conexão.</p>
        <button onClick={tentarNovamente}>Tentar novamente</button>
      </div>
    );
  }

  const atendenteSelecionado = atendentes.data?.find(
    (a) => a.id === atendenteId,
  );
  const ehParceiro2 = atendenteSelecionado?.papel === "parceiro2";
  const servicoSelecionado = servicos.data?.find((s) => s.id === servicoId);

  function precoExibido(servico: Servico): number {
    const usaTabelaParceiro2 = ehParceiro2 && clienteProprio;
    return usaTabelaParceiro2
      ? servico.precoParceiro2Centavos
      : servico.precoCasaCentavos;
  }

  const precoAtual = servicoSelecionado ? precoExibido(servicoSelecionado) : 0;
  const tetoDescontoCentavos = Math.floor(precoAtual / 2);
  const descontoCentavos = reaisParaCentavos(descontoTexto);
  const gorjetaCentavos = reaisParaCentavos(gorjetaTexto);
  const descontoExcedeTeto = descontoCentavos > tetoDescontoCentavos;

  // Trava do submit: precisa de atendente, serviço e desconto válido.
  // Pagamento já tem default; origem só importa pro parceiro2 e tem default.
  const podeEnviar =
    !!atendenteId &&
    !!servicoId &&
    !descontoExcedeTeto &&
    !criarEntrada.isPending;

  function lancar() {
    if (!atendenteId || !servicoId) return;
    setErroDesconto(null);

    criarEntrada.mutate(
      {
        atendenteId,
        servicoId,
        metodoPagamento,
        clienteProprio,
        descontoCentavos,
        gorjetaCentavos,
      },
      {
        onSuccess: () => {
          toast.success("Lançado ✓");
          // Tela aberta para sequência: preserva atendente + pagamento,
          // reseta o resto (origem é a mais cara de errar, volta ao default).
          setClienteProprio(false);
          setServicoId(null);
          setDescontoTexto("");
          setGorjetaTexto("");
          setErroDesconto(null);
        },
        onError: (error) => {
          // Hook neutro: o componente roteia. 400 = validação (provável teto
          // de desconto) → mostra no campo. Demais → toast genérico.
          if (error.status === 400) {
            setErroDesconto(error.message);
          } else {
            toast.error("Não foi possível lançar. Tente novamente.");
          }
        },
      },
    );
  }

  return (
    <div className="mx-auto max-w-md p-4 pb-24">
      <h1 className="text-xl font-semibold">Nova Entrada</h1>

      {/* CAMPO 1: Atendente */}
      <section className="mt-6">
        <label className="text-sm font-medium">Atendente</label>
        <div className="mt-2 flex flex-wrap gap-3">
          {atendentes.data?.map((atendente) => {
            const selecionado = atendente.id === atendenteId;
            const inicial = atendente.nome.charAt(0).toUpperCase();
            return (
              <button
                key={atendente.id}
                type="button"
                onClick={() => selecionarAtendente(atendente.id)}
                aria-pressed={selecionado}
                className={`flex w-20 flex-col items-center gap-1 rounded-lg border p-2 transition ${
                  selecionado
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
                }`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-semibold">
                  {inicial}
                </span>
                <span className="truncate text-xs">{atendente.nome}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* CAMPO 2: Origem do cliente — só parceiro2 */}
      {ehParceiro2 && (
        <section className="mt-6">
          <label className="text-sm font-medium">Origem do cliente</label>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => selecionarOrigem(false)}
              aria-pressed={!clienteProprio}
              className={`flex-1 rounded-lg border p-3 text-sm transition ${
                !clienteProprio
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-muted"
              }`}
            >
              Da casa (walk-in)
            </button>
            <button
              type="button"
              onClick={() => selecionarOrigem(true)}
              aria-pressed={clienteProprio}
              className={`flex-1 rounded-lg border p-3 text-sm transition ${
                clienteProprio
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-muted"
              }`}
            >
              Meu cliente (próprio)
            </button>
          </div>
        </section>
      )}

      {/* CAMPO 3: Serviço */}
      <section className="mt-6">
        <label className="text-sm font-medium">Serviço</label>
        <div className="mt-2 flex flex-col gap-2">
          {servicos.data?.map((servico) => {
            const selecionado = servico.id === servicoId;
            return (
              <button
                key={servico.id}
                type="button"
                onClick={() => setServicoId(servico.id)}
                aria-pressed={selecionado}
                className={`flex items-center justify-between rounded-lg border p-3 text-sm transition ${
                  selecionado
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
                }`}
              >
                <span>{servico.nome}</span>
                <span className="font-medium">
                  {formatarCentavos(precoExibido(servico))}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* CAMPO 4: Desconto */}
      <section className="mt-6">
        <label className="text-sm font-medium">
          Desconto <span className="text-muted-foreground">(opcional)</span>
        </label>
        <div className="mt-2">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0,00"
            value={descontoTexto}
            onChange={(e) => {
              setDescontoTexto(e.target.value);
              setErroDesconto(null);
            }}
            disabled={!servicoSelecionado}
            className="w-full rounded-lg border border-border bg-transparent p-3 text-sm disabled:opacity-50"
          />
          {erroDesconto ? (
            <p className="mt-1 text-xs text-red-500">{erroDesconto}</p>
          ) : (
            servicoSelecionado && (
              <p
                className={`mt-1 text-xs ${descontoExcedeTeto ? "text-red-500" : "text-muted-foreground"}`}
              >
                {descontoExcedeTeto
                  ? `Máximo permitido: ${formatarCentavos(tetoDescontoCentavos)} (50%).`
                  : `Até ${formatarCentavos(tetoDescontoCentavos)} (50% do serviço).`}
              </p>
            )
          )}
        </div>
      </section>

      {/* CAMPO 5: Pagamento */}
      <section className="mt-6">
        <label className="text-sm font-medium">Pagamento</label>
        <div className="mt-2 flex gap-2">
          {PAGAMENTOS.map((p) => {
            const selecionado = p.valor === metodoPagamento;
            return (
              <button
                key={p.valor}
                type="button"
                onClick={() => setMetodoPagamento(p.valor)}
                aria-pressed={selecionado}
                className={`flex-1 rounded-lg border p-3 text-sm transition ${
                  selecionado
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* CAMPO 6: Gorjeta */}
      <section className="mt-6">
        <label className="text-sm font-medium">
          Gorjeta <span className="text-muted-foreground">(opcional)</span>
        </label>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="0,00"
          value={gorjetaTexto}
          onChange={(e) => setGorjetaTexto(e.target.value)}
          className="mt-2 w-full rounded-lg border border-border bg-transparent p-3 text-sm"
        />
      </section>

      {/* Botão Lançar — fixo no rodapé. isPending trava (defesa anti-duplicata). */}
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background p-4">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={lancar}
            disabled={!podeEnviar}
            className="w-full rounded-lg bg-primary p-3 font-semibold text-primary-foreground transition disabled:opacity-50"
          >
            {criarEntrada.isPending ? "Lançando…" : "Lançar"}
          </button>
        </div>
      </div>
    </div>
  );
}
