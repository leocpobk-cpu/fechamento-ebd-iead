-- Migração: Tornar lições globais (sem igreja_id)

-- 1. Remover constraint UNIQUE que inclui igreja_id
ALTER TABLE licoes DROP CONSTRAINT IF EXISTS licoes_data_igreja_id_key;

-- 2. Tornar igreja_id NULL e remover obrigatoriedade
ALTER TABLE licoes ALTER COLUMN igreja_id DROP NOT NULL;

-- 3. Criar nova constraint UNIQUE apenas na data (lição única por domingo)
ALTER TABLE licoes ADD CONSTRAINT licoes_data_unique UNIQUE(data);

-- 4. Limpar lições duplicadas (manter apenas uma por data)
DELETE FROM licoes a USING licoes b 
WHERE a.id > b.id AND a.data = b.data;

-- 5. Atualizar todas lições existentes para igreja_id = NULL (globais)
UPDATE licoes SET igreja_id = NULL;

-- 6. Verificar resultado
SELECT COUNT(*) as total_licoes, 
       COUNT(DISTINCT data) as datas_unicas,
       COUNT(igreja_id) as com_igreja_especifica
FROM licoes;

-- Resultado esperado: 
-- total_licoes = datas_unicas (uma lição por data)
-- com_igreja_especifica = 0 (todas globais)
