-- Adicionar colunas tema e professor na tabela lancamentos

-- 1. Adicionar coluna tema (tema da lição)
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS tema TEXT DEFAULT NULL;

-- 2. Adicionar coluna professor (nome do professor principal)
ALTER TABLE lancamentos ADD COLUMN IF NOT EXISTS professor TEXT DEFAULT NULL;

-- 3. Verificar resultado
SELECT 
    id,
    data,
    licao,
    tema,
    professor,
    igreja_id,
    created_at
FROM lancamentos
ORDER BY data DESC
LIMIT 5;

-- Resultado esperado:
-- Deve mostrar as colunas tema e professor (inicialmente NULL para registros antigos)
