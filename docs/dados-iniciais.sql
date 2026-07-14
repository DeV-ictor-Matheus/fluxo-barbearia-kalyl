-- Estado inicial dos dados de domínio da Barbearia Kalyl.
-- Executado MANUALMENTE no SQL Editor do Supabase. Não roda no pipeline:
-- popular e destruir dado financeiro é ato deliberado, nunca efeito colateral
-- de um deploy.
--
-- Idempotente: pode rodar mais de uma vez sem duplicar nem corromper.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. PAPÉIS
--
-- Igor passa a ser o parceiro com carteira própria (parceiro2): cobra a tabela
-- dele e fica com 100% quando traz o cliente; em walk-in cobra a tabela da casa
-- e divide 50/50.
--
-- Lucas passa a ser parceiro1: só atende cliente da casa, sempre 50/50.
--
-- CASE único em vez de dois UPDATEs: swap atômico, sem estado intermediário.
-- ---------------------------------------------------------------------------
UPDATE "Atendente"
SET papel = CASE nome
  WHEN 'Igor'  THEN 'parceiro2'
  WHEN 'Lucas' THEN 'parceiro1'
END
WHERE nome IN ('Igor', 'Lucas');

-- ---------------------------------------------------------------------------
-- 2. CARDÁPIO
--
-- Valores em CENTAVOS inteiros. precoParceiro2Centavos = tabela do Igor,
-- aplicada apenas em cliente próprio.
--
--   serviço          casa      Igor
--   Barba          R$  60    R$ 35
--   Cabelo         R$  70    R$ 50
--   Cabelo + Barba R$ 110    R$ 70
--
-- ON CONFLICT exige um índice único em "nome" — ver migração que acompanha
-- este PR. Sem ele, rodar duas vezes duplicaria os serviços.
-- ---------------------------------------------------------------------------
INSERT INTO "Servico" (id, nome, "precoCasaCentavos", "precoParceiro2Centavos")
VALUES
  (gen_random_uuid(), 'Barba',          6000, 3500),
  (gen_random_uuid(), 'Cabelo',         7000, 5000),
  (gen_random_uuid(), 'Cabelo + Barba', 11000, 7000)
ON CONFLICT (nome) DO UPDATE SET
  "precoCasaCentavos"      = EXCLUDED."precoCasaCentavos",
  "precoParceiro2Centavos" = EXCLUDED."precoParceiro2Centavos";

COMMIT;