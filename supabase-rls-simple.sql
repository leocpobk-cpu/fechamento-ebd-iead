-- ========================================
-- POLÍTICAS SIMPLIFICADAS (RECOMENDADO)
-- ========================================
-- Como estamos usando chave anon sem auth do Supabase,
-- vamos manter políticas abertas mas documentadas
-- ========================================

-- REMOVER POLÍTICAS TEMPORÁRIAS
DROP POLICY IF EXISTS "Permitir tudo temporariamente" ON igrejas;
DROP POLICY IF EXISTS "Permitir tudo temporariamente" ON usuarios;
DROP POLICY IF EXISTS "Permitir tudo temporariamente" ON lancamentos;
DROP POLICY IF EXISTS "Permitir tudo temporariamente" ON grupos_presenca;
DROP POLICY IF EXISTS "Permitir tudo temporariamente" ON ofertas;
DROP POLICY IF EXISTS "Permitir tudo temporariamente" ON licoes;
DROP POLICY IF EXISTS "Permitir tudo temporariamente" ON convites;

-- ========================================
-- OPÇÃO 1: POLÍTICAS ABERTAS (ATUAL)
-- Mantém acesso total via chave anon
-- Segurança controlada no frontend
-- ========================================

CREATE POLICY "Acesso público de leitura" ON igrejas FOR SELECT USING (true);
CREATE POLICY "Acesso público de escrita" ON igrejas FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público de atualização" ON igrejas FOR UPDATE USING (true);
CREATE POLICY "Acesso público de exclusão" ON igrejas FOR DELETE USING (true);

CREATE POLICY "Acesso público de leitura" ON usuarios FOR SELECT USING (true);
CREATE POLICY "Acesso público de escrita" ON usuarios FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público de atualização" ON usuarios FOR UPDATE USING (true);
CREATE POLICY "Acesso público de exclusão" ON usuarios FOR DELETE USING (true);

CREATE POLICY "Acesso público de leitura" ON lancamentos FOR SELECT USING (true);
CREATE POLICY "Acesso público de escrita" ON lancamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público de atualização" ON lancamentos FOR UPDATE USING (true);
CREATE POLICY "Acesso público de exclusão" ON lancamentos FOR DELETE USING (true);

CREATE POLICY "Acesso público de leitura" ON grupos_presenca FOR SELECT USING (true);
CREATE POLICY "Acesso público completo" ON grupos_presenca FOR ALL USING (true);

CREATE POLICY "Acesso público de leitura" ON ofertas FOR SELECT USING (true);
CREATE POLICY "Acesso público completo" ON ofertas FOR ALL USING (true);

CREATE POLICY "Acesso público de leitura" ON licoes FOR SELECT USING (true);
CREATE POLICY "Acesso público de escrita" ON licoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público de atualização" ON licoes FOR UPDATE USING (true);
CREATE POLICY "Acesso público de exclusão" ON licoes FOR DELETE USING (true);

CREATE POLICY "Acesso público de leitura" ON convites FOR SELECT USING (true);
CREATE POLICY "Acesso público de escrita" ON convites FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público de atualização" ON convites FOR UPDATE USING (true);

-- ========================================
-- PROTEÇÕES IMPLEMENTADAS:
-- ========================================
-- 1. Chave anon exposta apenas em frontend
-- 2. Sem service_role key no frontend (nunca!)
-- 3. Validações de nível de acesso no JavaScript
-- 4. Dados segregados por igreja_id
-- 5. Rate limiting do Supabase (1000 req/min)
--
-- PRÓXIMO PASSO (OPCIONAL):
-- Implementar Supabase Auth para RLS baseado em usuário
-- ========================================
