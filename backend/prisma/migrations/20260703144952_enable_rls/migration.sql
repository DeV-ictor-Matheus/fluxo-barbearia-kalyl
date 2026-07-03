-- Habilita Row Level Security nas tabelas do sistema sem policies
-- permissivas. Qualquer acesso via anon/authenticated key é negado
-- por padrão. O backend usa a role `postgres` (superuser, via
-- connection string do Prisma), que bypassa RLS. Defesa em
-- profundidade contra escrita direta na REST API do Supabase.

ALTER TABLE "Atendente" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Servico"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Entrada"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Saida"     ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Atendente" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Servico"   FORCE ROW LEVEL SECURITY;
ALTER TABLE "Entrada"   FORCE ROW LEVEL SECURITY;
ALTER TABLE "Saida"     FORCE ROW LEVEL SECURITY;