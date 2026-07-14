-- Garante no banco a invariante de negócio: existe no máximo um dono ativo.
-- Índice parcial: só indexa linhas com papel = 'dono' AND ativo = true.
-- À prova de corrida (diferente de um count() no handler, que é TOCTOU).
CREATE UNIQUE INDEX "atendente_dono_unico"
  ON "Atendente" ("papel")
  WHERE "papel" = 'dono' AND "ativo" = true;