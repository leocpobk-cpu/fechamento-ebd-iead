-- Adicionar colunas biblias e revistas na tabela grupos_presenca

-- 1. Adicionar coluna biblias
ALTER TABLE grupos_presenca ADD COLUMN IF NOT EXISTS biblias INTEGER DEFAULT 0;

-- 2. Adicionar coluna revistas  
ALTER TABLE grupos_presenca ADD COLUMN IF NOT EXISTS revistas INTEGER DEFAULT 0;

-- 3. Verificar resultado
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'grupos_presenca'
ORDER BY ordinal_position;

-- Resultado esperado:
-- Deve mostrar as colunas biblias e revistas como INTEGER com DEFAULT 0
