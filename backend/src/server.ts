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

const app = express();

// permite que o servidor entenda JSON no corpo das requisições
app.use(express.json());

app.get("/saidas", async (req, res) => {
  const saidas = await listarSaidas();
  res.status(200).json(saidas);
});

// rota de saúde: serve só pra checar se o servidor está de pé
app.get("/", (req, res) => {
  res.json({ status: "ok", mensagem: "API da Barbearia rodando" });
});

app.patch("/saidas/:id", async (req, res) => {
  const { id } = req.params;

  // Rejeita corpo vazio ANTES de validar (evita .default mascarar body vazio)
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError("Nenhum campo para atualizar foi enviado");
  }

  const dados = editarSaidaSchema.parse(req.body);
  const saida = await editarSaida(id, dados);
  res.status(200).json(saida);
});

// valida o formato YYYY-MM-DD do query param ?data (opcional)
const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

// resumo do dia para o Dashboard balcão (total + por barbeiro, SEM R$)
app.get("/entradas/resumo", async (req, res) => {
  const { data } = req.query;

  if (
    data !== undefined &&
    (typeof data !== "string" || !FORMATO_DATA.test(data))
  ) {
    throw new AppError("Parâmetro data inválido — use YYYY-MM-DD");
  }

  const resumo = await resumoEntradas(data);
  res.status(200).json(resumo);
});

// lista as entradas de um dia (default: hoje) para a tela "Entradas de hoje"
app.get("/entradas", async (req, res) => {
  const { data } = req.query;

  if (
    data !== undefined &&
    (typeof data !== "string" || !FORMATO_DATA.test(data))
  ) {
    throw new AppError("Parâmetro data inválido — use YYYY-MM-DD");
  }

  const entradas = await listarEntradas(data);
  res.status(200).json(entradas);
});

// endpoint que registra uma entrada
// endpoint que registra uma entrada
app.post("/entradas", async (req, res) => {
  // Valida e extrai os dados já tipados. Se o formato falhar, lança
  // ZodError; se uma regra de negócio falhar (desconto > 50%, etc.),
  // registrarEntrada lança AppError. Ambos sobem pro errorHandler central.
  const dados = criarEntradaSchema.parse(req.body);
  const entrada = await registrarEntrada(dados);
  res.status(201).json(entrada);
});

app.post("/saidas", async (req, res) => {
  // 1. O PORTEIRO: valida o corpo da requisição antes de tudo.
  const resultado = criarSaidaSchema.safeParse(req.body);

  // 2. Se a validação falhou, retorna erro 400 com a resposta e PARA aqui.
  if (!resultado.success) {
    return res.status(400).json({
      erro: "Dados inválidos",
      detalhes: resultado.error.issues,
    });
  }

  // 3. Daqui pra baixo, resultado.data é 100% confiável e tipado.
  try {
    const saida = await registrarSaida(resultado.data);
    return res.status(201).json(saida);
  } catch (erro) {
    console.error("Erro ao registrar saída:", erro);
    return res.status(500).json({ erro: "Erro interno ao registrar saída" });
  }
});

// cadastrar um atendente
app.post("/atendentes", async (req, res) => {
  try {
    const atendente = await prisma.atendente.create({ data: req.body });
    res.status(201).json(atendente);
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Erro desconhecido";
    res.status(400).json({ erro: mensagem });
  }
});

// listar atendentes
app.get("/atendentes", async (req, res) => {
  const atendentes = await prisma.atendente.findMany();
  res.json(atendentes);
});

// cadastrar um serviço
app.post("/servicos", async (req, res) => {
  const dados = criarServicoSchema.parse(req.body);
  const servico = await prisma.servico.create({ data: dados });
  res.status(201).json(servico);
});

// listar serviços
app.get("/servicos", async (req, res) => {
  const servicos = await prisma.servico.findMany();
  res.json(servicos);
});

app.use(errorHandler);

const PORTA = 3333;
app.listen(PORTA, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORTA}`);
});
