-- ⚠️  DESTRUTIVO. NÃO EXECUTAR SEM CERTEZA DO PROJETO.
--
-- Zera o histórico de teste antes de a barbearia começar a usar o app.
-- Rodar UMA VEZ, manualmente, depois de dados-iniciais.sql.
--
-- Ordem obrigatória: Entrada (filha) antes de Servico (pai). A FK impede o
-- inverso — e essa recusa é o banco protegendo o histórico financeiro.

BEGIN;

DELETE FROM "Entrada";

-- Só agora o "Corte" (serviço de teste) pode sair: nenhuma entrada o referencia.
DELETE FROM "Servico"
WHERE nome NOT IN ('Barba', 'Cabelo', 'Cabelo + Barba');

COMMIT;