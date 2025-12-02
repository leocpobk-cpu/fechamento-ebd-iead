-- ========================================
-- FIX: Resetar usuário admin
-- ========================================

-- 1. Verificar se admin existe
SELECT id, usuario, senha, nome, nivel FROM usuarios WHERE usuario = 'admin';

-- 2. Deletar admin antigo (se existir)
DELETE FROM usuarios WHERE usuario = 'admin';

-- 3. Inserir novo admin com senha correta
INSERT INTO usuarios (usuario, senha, nome, email, celular, nivel, igreja_id, ativo, primeiro_acesso)
VALUES ('admin', 'admin123', 'Administrador Sistema', 'admin@iead.com', '(00) 00000-0000', 1, NULL, true, false);

-- 4. Verificar inserção
SELECT id, usuario, senha, nome, nivel, ativo, primeiro_acesso FROM usuarios WHERE usuario = 'admin';

-- ========================================
-- RESULTADO ESPERADO:
-- usuario: admin
-- senha: admin123
-- nivel: 1 (Administrador)
-- ativo: true
-- primeiro_acesso: false
-- ========================================
