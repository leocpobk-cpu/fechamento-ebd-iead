-- Adicionar campo deleted_at para soft delete em lançamentos

-- 1. Adicionar coluna deleted_at (NULL = ativo, com data = excluído)
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. Adicionar índice para melhorar performance de buscas
CREATE INDEX IF NOT EXISTS idx_lancamentos_deleted_at ON lancamentos(deleted_at);

-- 3. Adicionar coluna deleted_by (quem excluiu)
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES usuarios(id);

-- 4. Verificar resultado
SELECT 
    COUNT(*) as total_lancamentos,
    COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as ativos,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as excluidos
FROM lancamentos;

-- Resultado esperado:
-- total_lancamentos = X
-- ativos = X (todos atualmente)
-- excluidos = 0
