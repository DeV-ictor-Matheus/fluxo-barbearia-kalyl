import express from "express";
import { registrarEntrada } from "./services/registrarEntrada.js";
import { prisma } from "./db.js";

const app = express();

// permite que o servidor entenda JSON no corpo das requisições
app.use(express.json());

// rota de saúde: serve só pra checar se o servidor está de pé
app.get("/", (req, res) => {
  res.json({ status: "ok", mensagem: "API da Barbearia rodando" });
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
