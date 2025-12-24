-- OPCIONAL: Remover colunas de soft delete que não serão mais usadas
-- Execute este script apenas se quiser limpar as colunas deleted_at e deleted_by

-- 1. Remover índice (se existir)
DROP INDEX IF EXISTS idx_lancamentos_deleted_at;

-- 2. Remover colunas de soft delete
ALTER TABLE lancamentos DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE lancamentos DROP COLUMN IF EXISTS deleted_by;

-- 3. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'lancamentos'
ORDER BY ordinal_position;

-- Resultado esperado:
-- Colunas deleted_at e deleted_by não devem mais aparecer
