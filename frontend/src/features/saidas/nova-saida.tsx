// Tela de Saída — Nova Saída. Write financeiro de despesa.
// Conecta useCriarSaida. A tela fica aberta para lançamentos sequenciais:
// sucesso limpa o essencial e PRESERVA a data (fechamento do mês lança
// várias saídas da mesma competência em sequência).

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { dataParaISO, isoParaData } from "@/lib/data-iso";
import { hojeBrasilia } from "@/lib/hoje-brasilia";
import { useCriarSaida } from "./use-criar-saida";
import type { CategoriaSaida } from "@/types/saida";

// Rótulos de exibição das categorias. A ordem = ordem no dropdown.
// value bate EXATAMENTE com o enum CategoriaSaida (o backend valida em runtime).
const CATEGORIAS: { valor: CategoriaSaida; label: string }[] = [
  { valor: "ALUGUEL", label: "Aluguel" },
  { valor: "TAXA_CARTAO", label: "Taxa de cartão" },
  { valor: "PRODUTOS", label: "Produtos" },
  { valor: "ALUGUEL_POS", label: "Aluguel do POS" },
  { valor: "SALARIO", label: "Salário" },
  { valor: "CONTAS", label: "Contas" },
  { valor: "MARKETING", label: "Marketing" },
  { valor: "OUTROS", label: "Outros" },
];

// Duplicada de propósito (a Tela E também a tem inline); extrair para @/lib
// é débito de refactor, não desta fatia.
function reaisParaCentavos(texto: string): number {
  const normalizado = texto.replace(",", ".").trim();
  if (normalizado === "") return 0;
  const reais = Number(normalizado);
  if (Number.isNaN(reais) || reais < 0) return 0;
  return Math.round(reais * 100);
}

// Amber nas células selecionadas do Calendar — mesmo padrão do seletor-periodo.
// Override via classNames (nunca tocar calendar.tsx nem os tokens globais).
const AMBER_CELULAS = cn(
  "[&_[data-selected-single=true]]:!bg-[#ef9f27] [&_[data-selected-single=true]]:!text-amber-950",
);

// Formata "YYYY-MM-DD" para exibição "DD/MM/YYYY" no gatilho do popover.
function formatarDataBR(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

interface BotaoVoltarProps {
  onVoltar: () => void;
}

// Componente de módulo (não aninhado) — estável entre renders.
function BotaoVoltar({ onVoltar }: BotaoVoltarProps) {
  return (
    <button
      type="button"
      onClick={onVoltar}
      aria-label="Voltar"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  );
}

export function NovaSaida() {
  const navigate = useNavigate();
  const criarSaida = useCriarSaida();

  // categoria começa "" = placeholder "Selecione…". Não é valor válido do
  // enum: força escolha consciente e trava o submit até escolher.
  const [categoria, setCategoria] = useState<CategoriaSaida | "">("");
  const [valorTexto, setValorTexto] = useState("");
  const [descricao, setDescricao] = useState("");
  // Data como string ISO "YYYY-MM-DD" — é o que vai no payload (premissa do
  // rangeUtcPuro no backend: Saida.data nasce de string sem componente de hora).
  const [dataISO, setDataISO] = useState<string>(hojeBrasilia());
  const [calendarioAberto, setCalendarioAberto] = useState(false);

  const valorCentavos = reaisParaCentavos(valorTexto);

  // Trava do submit: categoria escolhida + valor > 0. Data já tem default.
  const podeEnviar =
    categoria !== "" && valorCentavos > 0 && !criarSaida.isPending;

  function selecionarData(data: Date | undefined) {
    if (!data) return;
    setDataISO(dataParaISO(data));
    setCalendarioAberto(false);
  }

  function lancar() {
    if (categoria === "" || valorCentavos <= 0) return;

    criarSaida.mutate(
      {
        categoria,
        valorCentavos,
        data: dataISO,
        descricao: descricao.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Saída lançada ✓");
          // Tela aberta para sequência: preserva a DATA (mesma competência
          // no fechamento do mês) e reseta o resto. Foco volta à categoria.
          setCategoria("");
          setValorTexto("");
          setDescricao("");
        },
        onError: () => {
          // Hook neutro: o componente roteia. Saída não tem erro de campo
          // provável como o teto de desconto da Entrada — toast genérico basta.
          toast.error("Não foi possível lançar. Tente novamente.");
        },
      },
    );
  }

  return (
    <div className="mx-auto max-w-md p-4 pb-24">
      <div className="flex items-center gap-3">
        <BotaoVoltar onVoltar={() => navigate("/relatorio")} />
        <h1 className="text-xl font-semibold">Nova Saída</h1>
      </div>

      {/* CAMPO 1: Categoria */}
      <section className="mt-6">
        <label htmlFor="categoria" className="text-sm font-medium">
          Categoria
        </label>
        <Select
          value={categoria}
          onValueChange={(v) => setCategoria(v as CategoriaSaida)}
        >
          <SelectTrigger id="categoria" className="mt-2 w-full">
            <SelectValue placeholder="Selecione…" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIAS.map((c) => (
              <SelectItem key={c.valor} value={c.valor}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {/* CAMPO 2: Valor */}
      <section className="mt-6">
        <label htmlFor="valor" className="text-sm font-medium">
          Valor
        </label>
        <input
          id="valor"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="0,00"
          value={valorTexto}
          onChange={(e) => setValorTexto(e.target.value)}
          className="mt-2 w-full rounded-lg border border-border bg-transparent p-3 text-sm"
        />
      </section>

      {/* CAMPO 3: Data (competência) */}
      <section className="mt-6">
        <label className="text-sm font-medium">Data (competência)</label>
        <Popover open={calendarioAberto} onOpenChange={setCalendarioAberto}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="mt-2 flex w-full items-center justify-between rounded-lg border border-border bg-transparent p-3 text-sm transition hover:bg-muted"
            >
              <span>{formatarDataBR(dataISO)}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={isoParaData(dataISO)}
              onSelect={selecionarData}
              // Teto = hoje. Saída é fato consumado; despesa a vencer
              // infla o Líquido de um mês que ainda não aconteceu.
              disabled={{ after: isoParaData(hojeBrasilia()) }}
              locale={ptBR}
              className={AMBER_CELULAS}
            />
          </PopoverContent>
        </Popover>
      </section>

      {/* CAMPO 4: Descrição (opcional) */}
      <section className="mt-6">
        <label htmlFor="descricao" className="text-sm font-medium">
          Descrição <span className="text-muted-foreground">(opcional)</span>
        </label>
        <input
          id="descricao"
          type="text"
          placeholder="Ex: aluguel referente a junho"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="mt-2 w-full rounded-lg border border-border bg-transparent p-3 text-sm"
        />
      </section>

      {/* Botão Lançar — fixo no rodapé. isPending trava (anti-duplicata). */}
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background p-4">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={lancar}
            disabled={!podeEnviar}
            className="w-full rounded-lg bg-primary p-3 font-semibold text-primary-foreground transition disabled:opacity-50"
          >
            {criarSaida.isPending ? "Lançando…" : "Lançar saída"}
          </button>
        </div>
      </div>
    </div>
  );
}
