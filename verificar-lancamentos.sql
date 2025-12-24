-- Verificar todos os lançamentos existentes no banco de dados

-- 1. Listar todos os lançamentos com informações básicas
SELECT 
    id,
    data,
    licao,
    tema,
    professor,
    igreja_id,
    created_at,
    updated_at
FROM lancamentos
ORDER BY data DESC;

-- 2. Verificar especificamente o lançamento de 23/11/2024
SELECT 
    id,
    data,
    licao,
    tema,
    professor,
    igreja_id,
    created_at
FROM lancamentos
WHERE data = '2024-11-23'
   OR data = '2025-11-23';

-- 3. Contar total de lançamentos por igreja
SELECT 
    igreja_id,
    COUNT(*) as total_lancamentos
FROM lancamentos
GROUP BY igreja_id;

-- 4. Verificar grupos_presenca relacionados
SELECT 
    l.id as lancamento_id,
    l.data,
    l.licao,
    gp.grupo_id,
    gp.presente,
    gp.ausente,
    gp.visita
FROM lancamentos l
LEFT JOIN grupos_presenca gp ON gp.lancamento_id = l.id
WHERE l.data = '2024-11-23' OR l.data = '2025-11-23'
ORDER BY l.data DESC, gp.grupo_id;

-- 5. Verificar ofertas relacionadas
SELECT 
    l.id as lancamento_id,
    l.data,
    l.licao,
    o.tipo,
    o.valor,
    o.observacao
FROM lancamentos l
LEFT JOIN ofertas o ON o.lancamento_id = l.id
WHERE l.data = '2024-11-23' OR l.data = '2025-11-23'
ORDER BY l.data DESC, o.tipo;
