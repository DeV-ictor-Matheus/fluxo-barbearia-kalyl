import express from "express";
import { registrarEntrada } from "./services/registrarEntrada.js";
import { prisma } from "./db.js";
import { criarSaidaSchema } from "./schemas/saidaSchema.js";
import { registrarSaida } from "./services/registrarSaida.js";
import { editarSaida } from "./services/editarSaida.js";
import { editarSaidaSchema } from "./schemas/saidaSchema.js";
import { listarSaidas } from "./services/listarSaidas.js";
import { criarEntradaSchema } from "./schemas/entradaSchema.js";
import { listarEntradas } from "./services/listarEntradas.js";
import { resumoEntradas } from "./services/resumoEntradas.js";
import { AppError } from "./errors/app-errors.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { criarServicoSchema } from "./schemas/servicoSchema.js";
import { parseDataQuery } from "./lib/parseDataQuery.js";
import { requireAuth } from "./middlewares/requireAuth.js";
import { parseIntervaloQuery } from "./lib/parseIntervaloQuery.js";
import { relatorioFinanceiro } from "./services/relatorioFinanceiro.js";
import { criarAtendenteSchema } from "./schemas/atendenteSchema.js";
import { Prisma } from "./generated/prisma/client.js";

const app = express();

app.use(express.json());

app.get("/saidas", requireAuth, async (req, res) => {
  const saidas = await listarSaidas();
  res.status(200).json(saidas);
});

// rota de saúde: serve só pra checar se o servidor está de pé
app.get("/", (req, res) => {
  res.json({ status: "ok", mensagem: "API da Barbearia rodando" });
});

app.patch<{ id: string }>("/saidas/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  // Rejeita corpo vazio ANTES de validar (evita .default mascarar body vazio)
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError("Nenhum campo para atualizar foi enviado");
  }

  const dados = editarSaidaSchema.parse(req.body);
  const saida = await editarSaida(id, dados);
  res.status(200).json(saida);
});

// resumo do dia para o Dashboard balcão (total + por barbeiro, SEM R$)
app.get("/entradas/resumo", requireAuth, async (req, res) => {
  const data = parseDataQuery(req.query.data);

  const resumo = await resumoEntradas(data);
  res.status(200).json({ resumo });
});

// lista as entradas de um dia (default: hoje em Brasília), da mais recente
// para a mais antiga — base da Tela G (Entradas de hoje).
app.get("/entradas", requireAuth, async (req, res) => {
  const data = parseDataQuery(req.query.data);

  const entradas = await listarEntradas(data);
  res.status(200).json({ entradas });
});

// endpoint que registra uma entrada
app.post("/entradas", requireAuth, async (req, res) => {
  // Valida e extrai os dados já tipados. Se o formato falhar, lança
  // ZodError; se uma regra de negócio falhar (desconto > 50%, etc.),
  // registrarEntrada lança AppError. Ambos sobem pro errorHandler central.
  const dados = criarEntradaSchema.parse(req.body);
  const entrada = await registrarEntrada(dados);
  res.status(201).json(entrada);
});

app.post("/saidas", requireAuth, async (req, res) => {
  // parse() puro: ZodError sobe para o errorHandler, que traduz em 400 com detalhes.
  // AppError e erros do Prisma também sobem — mesmo padrão de POST /entradas.
  const dados = criarSaidaSchema.parse(req.body);
  const saida = await registrarSaida(dados);
  res.status(201).json(saida);
});

// cadastrar um atendente
app.post("/atendentes", requireAuth, async (req, res, next) => {
  try {
    const dados = criarAtendenteSchema.parse(req.body);

    const atendente = await prisma.atendente.create({ data: dados });
    res.status(201).json(atendente);
  } catch (erro) {
    // P2002 = violação de unique constraint. Aqui só existe um índice único
    // relevante: atendente_dono_unico. Traduz para 409 (conflito de estado),
    // não 400 (payload malformado) — o corpo estava correto, o mundo é que não permite.
    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2002"
    ) {
      return res
        .status(409)
        .json({ erro: "Já existe um dono ativo cadastrado" });
    }
    next(erro);
  }
});

// listar atendentes
app.get("/atendentes", requireAuth, async (req, res) => {
  const atendentes = await prisma.atendente.findMany();
  res.json(atendentes);
});

// cadastrar um serviço
app.post("/servicos", requireAuth, async (req, res) => {
  const dados = criarServicoSchema.parse(req.body);
  const servico = await prisma.servico.create({ data: dados });
  res.status(201).json(servico);
});

// listar serviços
app.get("/servicos", requireAuth, async (req, res) => {
  const servicos = await prisma.servico.findMany();
  res.json(servicos);
});

// Relatório financeiro do dono. Protegido por requireAuth: só acessível com
// um JWT válido do Supabase. parseIntervaloQuery valida a query e monta o
// período (dia único, intervalo, ou default hoje); relatorioFinanceiro
// orquestra as queries e agrega. Erros de query inválida viram AppError(400)
// capturado pelo errorHandler — sem try/catch (Express 5 captura o throw async).
app.get("/relatorio", requireAuth, async (req, res) => {
  const params = parseIntervaloQuery(req.query);
  const relatorio = await relatorioFinanceiro(params);
  res.status(200).json(relatorio);
});

app.use(errorHandler);

const PORTA = 3333;
app.listen(PORTA, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORTA}`);
});
