-- ========================================
-- POLÍTICAS DE SEGURANÇA (RLS) - EBD IEAD
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
-- POLÍTICAS PARA IGREJAS
-- ========================================

-- Todos podem ver igrejas ativas (para selects)
CREATE POLICY "Ver igrejas ativas"
ON igrejas FOR SELECT
USING (ativo = true);

-- Apenas Admin (nivel=1) pode inserir igrejas
CREATE POLICY "Admin pode inserir igrejas"
ON igrejas FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
        AND usuarios.nivel = 1
    )
);

-- Apenas Admin pode atualizar igrejas
CREATE POLICY "Admin pode atualizar igrejas"
ON igrejas FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
        AND usuarios.nivel = 1
    )
);

-- Apenas Admin pode deletar igrejas (na prática não usamos DELETE)
CREATE POLICY "Admin pode deletar igrejas"
ON igrejas FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
        AND usuarios.nivel = 1
    )
);

-- ========================================
-- POLÍTICAS PARA USUÁRIOS
-- ========================================

-- Usuários podem ver outros da mesma igreja OU admin vê todos
CREATE POLICY "Ver usuários da mesma igreja ou admin vê todos"
ON usuarios FOR SELECT
USING (
    igreja_id IN (
        SELECT igreja_id FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
    )
    OR EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
        AND usuarios.nivel = 1
    )
);

-- Apenas Admin e Diretoria podem inserir usuários
CREATE POLICY "Admin e Diretoria podem inserir usuários"
ON usuarios FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
        AND usuarios.nivel IN (1, 2)
    )
    OR criado_via_convite = true  -- Permite cadastro via convite
);

-- Apenas Admin e Diretoria podem atualizar usuários da mesma igreja
CREATE POLICY "Admin e Diretoria podem atualizar usuários"
ON usuarios FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM usuarios u
        WHERE u.usuario = current_setting('app.current_user', true)
        AND (
            u.nivel = 1  -- Admin atualiza qualquer um
            OR (u.nivel = 2 AND u.igreja_id = usuarios.igreja_id)  -- Diretoria só da mesma igreja
        )
    )
);

-- Apenas Admin pode deletar usuários
CREATE POLICY "Admin pode deletar usuários"
ON usuarios FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
        AND usuarios.nivel = 1
    )
);

-- ========================================
-- POLÍTICAS PARA LANÇAMENTOS
-- ========================================

-- Ver lançamentos da própria igreja ou admin vê todos
CREATE POLICY "Ver lançamentos da igreja ou admin vê todos"
ON lancamentos FOR SELECT
USING (
    igreja_id IN (
        SELECT igreja_id FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
    )
    OR EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
        AND usuarios.nivel = 1
    )
);

-- Admin e Diretoria podem inserir lançamentos
CREATE POLICY "Admin e Diretoria podem inserir lançamentos"
ON lancamentos FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
        AND usuarios.nivel IN (1, 2)
        AND (usuarios.nivel = 1 OR usuarios.igreja_id = lancamentos.igreja_id)
    )
);

-- Admin e Diretoria podem atualizar lançamentos da própria igreja
CREATE POLICY "Admin e Diretoria podem atualizar lançamentos"
ON lancamentos FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
        AND usuarios.nivel IN (1, 2)
        AND (usuarios.nivel = 1 OR usuarios.igreja_id = lancamentos.igreja_id)
    )
);

-- Admin e Diretoria podem deletar lançamentos
CREATE POLICY "Admin e Diretoria podem deletar lançamentos"
ON lancamentos FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
        AND usuarios.nivel IN (1, 2)
        AND (usuarios.nivel = 1 OR usuarios.igreja_id = lancamentos.igreja_id)
    )
);

-- ========================================
-- POLÍTICAS PARA GRUPOS_PRESENCA
-- ========================================

-- Ver grupos de presença se tiver acesso ao lançamento
CREATE POLICY "Ver grupos de presença vinculados a lançamentos acessíveis"
ON grupos_presenca FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM lancamentos l
        JOIN usuarios u ON (u.igreja_id = l.igreja_id OR u.nivel = 1)
        WHERE l.id = grupos_presenca.lancamento_id
        AND u.usuario = current_setting('app.current_user', true)
    )
);

-- Inserir/Atualizar/Deletar grupos se tiver acesso ao lançamento
CREATE POLICY "Manipular grupos de presença se tiver acesso ao lançamento"
ON grupos_presenca FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM lancamentos l
        JOIN usuarios u ON (u.nivel IN (1,2) AND (u.nivel = 1 OR u.igreja_id = l.igreja_id))
        WHERE l.id = grupos_presenca.lancamento_id
        AND u.usuario = current_setting('app.current_user', true)
    )
);

-- ========================================
-- POLÍTICAS PARA OFERTAS
-- ========================================

-- Ver ofertas se tiver acesso ao lançamento
CREATE POLICY "Ver ofertas vinculadas a lançamentos acessíveis"
ON ofertas FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM lancamentos l
        JOIN usuarios u ON (u.igreja_id = l.igreja_id OR u.nivel = 1)
        WHERE l.id = ofertas.lancamento_id
        AND u.usuario = current_setting('app.current_user', true)
    )
);

-- Manipular ofertas se tiver acesso ao lançamento
CREATE POLICY "Manipular ofertas se tiver acesso ao lançamento"
ON ofertas FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM lancamentos l
        JOIN usuarios u ON (u.nivel IN (1,2) AND (u.nivel = 1 OR u.igreja_id = l.igreja_id))
        WHERE l.id = ofertas.lancamento_id
        AND u.usuario = current_setting('app.current_user', true)
    )
);

-- ========================================
-- POLÍTICAS PARA LIÇÕES
-- ========================================

-- Ver lições da própria igreja ou admin vê todas
CREATE POLICY "Ver lições da igreja ou admin vê todas"
ON licoes FOR SELECT
USING (
    igreja_id IN (
        SELECT igreja_id FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
    )
    OR EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
        AND usuarios.nivel = 1
    )
);

-- Admin e Diretoria podem inserir lições
CREATE POLICY "Admin e Diretoria podem inserir lições"
ON licoes FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
        AND usuarios.nivel IN (1, 2)
        AND (usuarios.nivel = 1 OR usuarios.igreja_id = licoes.igreja_id)
    )
);

-- Admin e Diretoria podem atualizar lições da própria igreja
CREATE POLICY "Admin e Diretoria podem atualizar lições"
ON licoes FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
        AND usuarios.nivel IN (1, 2)
        AND (usuarios.nivel = 1 OR usuarios.igreja_id = licoes.igreja_id)
    )
);

-- Admin e Diretoria podem deletar lições
CREATE POLICY "Admin e Diretoria podem deletar lições"
ON licoes FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
        AND usuarios.nivel IN (1, 2)
        AND (usuarios.nivel = 1 OR usuarios.igreja_id = licoes.igreja_id)
    )
);

-- ========================================
-- POLÍTICAS PARA CONVITES
-- ========================================

-- Ver convites criados por mim ou se sou admin
CREATE POLICY "Ver convites próprios ou admin vê todos"
ON convites FOR SELECT
USING (
    criado_por IN (
        SELECT id FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
    )
    OR EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
        AND usuarios.nivel = 1
    )
);

-- Admin e Diretoria podem criar convites
CREATE POLICY "Admin e Diretoria podem criar convites"
ON convites FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE usuarios.usuario = current_setting('app.current_user', true)
        AND usuarios.nivel IN (1, 2)
    )
);

-- Permitir atualização de convites (marcar como usado)
CREATE POLICY "Atualizar convites ao processar"
ON convites FOR UPDATE
USING (true);  -- Qualquer um pode marcar como usado ao se cadastrar

-- ========================================
-- NOTA IMPORTANTE:
-- ========================================
-- Estas políticas usam current_setting('app.current_user')
-- Para funcionar, o frontend precisa fazer:
-- 
-- await supabase.rpc('set_config', {
--   setting: 'app.current_user',
--   value: usuarioLogado.usuario
-- });
--
-- Alternativamente, podemos simplificar usando auth.uid()
-- se implementarmos autenticação do Supabase (opcional)
-- ========================================
