import express from "express";
import { registrarEntrada } from "./services/registrarEntrada.js";
import { prisma } from "./db.js";
import { criarSaidaSchema } from "./schemas/saidaSchema.js";
import { registrarSaida } from "./services/registrarSaida.js";
import { editarSaida } from "./services/editarSaida.js";
import { editarSaidaSchema } from "./schemas/saidaSchema.js";
import { listarSaidas } from "./services/listarSaidas.js";
import { Prisma } from "./generated/prisma/client.js";

const app = express();

// permite que o servidor entenda JSON no corpo das requisições
app.use(express.json());

app.get("/saidas", async (req, res) => {
  try {
    const saidas = await listarSaidas();
    return res.status(200).json(saidas);
  } catch (erro) {
    console.error("Erro ao listar saídas:", erro);
    return res.status(500).json({ erro: "Erro interno ao listar saídas" });
  }
});

// rota de saúde: serve só pra checar se o servidor está de pé
app.get("/", (req, res) => {
  res.json({ status: "ok", mensagem: "API da Barbearia rodando" });
});

app.patch("/saidas/:id", async (req, res) => {
  const { id } = req.params;

  // 1. Rejeita corpo vazio ANTES de validar — nada pra atualizar não faz sentido.
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      erro: "Nenhum campo para atualizar foi enviado",
    });
  }

  // 2. Valida o corpo: campos opcionais, mas nenhum extra permitido.
  const resultado = editarSaidaSchema.safeParse(req.body);

  if (!resultado.success) {
    return res.status(400).json({
      erro: "Dados inválidos",
      detalhes: resultado.error.issues,
    });
  }

  // 3. Atualiza.
  try {
    const saida = await editarSaida(id, resultado.data);
    return res.status(200).json(saida);
  } catch (erro: unknown) {
    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2025"
    ) {
      return res.status(404).json({ erro: "Saída não encontrada" });
    }
    console.error("Erro ao editar saída:", erro);
    return res.status(500).json({ erro: "Erro interno ao editar saída" });
  }
});

// endpoint que registra uma entrada
app.post("/entradas", async (req, res) => {
  try {
    const entrada = await registrarEntrada(req.body);
    res.status(201).json(entrada);
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Erro desconhecido";
    res.status(400).json({ erro: mensagem });
  }
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
  try {
    const servico = await prisma.servico.create({ data: req.body });
    res.status(201).json(servico);
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : "Erro desconhecido";
    res.status(400).json({ erro: mensagem });
  }
});

// listar serviços
app.get("/servicos", async (req, res) => {
  const servicos = await prisma.servico.findMany();
  res.json(servicos);
});

const PORTA = 3333;
app.listen(PORTA, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORTA}`);
});
