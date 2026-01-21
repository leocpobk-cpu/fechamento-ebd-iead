-- Script de Restauração das Tabelas EBD-IEAD
-- 
-- Este script restaura os dados de um backup das tabelas do banco de dados
-- 
-- ATENÇÃO: Este script irá DELETAR todos os dados existentes antes de restaurar!
-- Use com MUITO CUIDADO!
--
-- Para executar: psql -U postgres -d ebd_iead < restore-tabelas.sql

-- ============================================
-- PREPARAÇÃO PARA RESTAURAÇÃO
-- ============================================

-- Desabilitar triggers temporariamente para acelerar inserção
SET session_replication_role = 'replica';

-- ============================================
-- LIMPEZA DAS TABELAS (CUIDADO!)
-- ============================================

-- Desabilitar verificação de chaves estrangeiras temporariamente
ALTER TABLE lancamentos DISABLE TRIGGER ALL;
ALTER TABLE grupos_presenca DISABLE TRIGGER ALL;
ALTER TABLE ofertas DISABLE TRIGGER ALL;
ALTER TABLE licoes DISABLE TRIGGER ALL;
ALTER TABLE convites DISABLE TRIGGER ALL;
ALTER TABLE usuarios DISABLE TRIGGER ALL;
ALTER TABLE igrejas DISABLE TRIGGER ALL;

-- Limpar dados das tabelas (ordem: filhos primeiro, pais depois)
-- Ordem correta: tabelas sem dependências primeiro, depois as que referenciam
TRUNCATE TABLE convites CASCADE;
TRUNCATE TABLE ofertas CASCADE;
TRUNCATE TABLE grupos_presenca CASCADE;
TRUNCATE TABLE lancamentos CASCADE;
TRUNCATE TABLE licoes CASCADE;
TRUNCATE TABLE usuarios CASCADE;
TRUNCATE TABLE igrejas CASCADE;

-- ============================================
-- RESTAURAÇÃO DE DADOS (formato COPY)
-- ============================================

-- Para restaurar os dados, use os comandos abaixo:
-- NOTA: Substitua /caminho/backup/ pelo caminho onde estão seus arquivos CSV

-- \COPY igrejas FROM '/caminho/backup/igrejas.csv' WITH (FORMAT CSV, HEADER true);
-- \COPY usuarios FROM '/caminho/backup/usuarios.csv' WITH (FORMAT CSV, HEADER true);
-- \COPY lancamentos FROM '/caminho/backup/lancamentos.csv' WITH (FORMAT CSV, HEADER true);
-- \COPY grupos_presenca FROM '/caminho/backup/grupos_presenca.csv' WITH (FORMAT CSV, HEADER true);
-- \COPY ofertas FROM '/caminho/backup/ofertas.csv' WITH (FORMAT CSV, HEADER true);
-- \COPY licoes FROM '/caminho/backup/licoes.csv' WITH (FORMAT CSV, HEADER true);
-- \COPY convites FROM '/caminho/backup/convites.csv' WITH (FORMAT CSV, HEADER true);

-- ============================================
-- REATIVAÇÃO DE VERIFICAÇÕES
-- ============================================

-- Reabilitar triggers
ALTER TABLE igrejas ENABLE TRIGGER ALL;
ALTER TABLE usuarios ENABLE TRIGGER ALL;
ALTER TABLE licoes ENABLE TRIGGER ALL;
ALTER TABLE lancamentos ENABLE TRIGGER ALL;
ALTER TABLE grupos_presenca ENABLE TRIGGER ALL;
ALTER TABLE ofertas ENABLE TRIGGER ALL;
ALTER TABLE convites ENABLE TRIGGER ALL;

-- Reabilitar verificação de chaves estrangeiras
SET session_replication_role = 'origin';

-- ============================================
-- ATUALIZAÇÃO DE SEQUÊNCIAS
-- ============================================

-- Atualizar sequências para o próximo valor correto (com proteção para tabelas vazias)
SELECT setval('igrejas_id_seq', COALESCE((SELECT MAX(id) FROM igrejas), 1));
SELECT setval('usuarios_id_seq', COALESCE((SELECT MAX(id) FROM usuarios), 1));
SELECT setval('lancamentos_id_seq', COALESCE((SELECT MAX(id) FROM lancamentos), 1));
SELECT setval('grupos_presenca_id_seq', COALESCE((SELECT MAX(id) FROM grupos_presenca), 1));
SELECT setval('ofertas_id_seq', COALESCE((SELECT MAX(id) FROM ofertas), 1));
SELECT setval('licoes_id_seq', COALESCE((SELECT MAX(id) FROM licoes), 1));

-- ============================================
-- VERIFICAÇÃO PÓS-RESTAURAÇÃO
-- ============================================

-- Verificar totais de registros restaurados
SELECT 
    'igrejas' as tabela, COUNT(*) as total_restaurado FROM igrejas
UNION ALL
SELECT 
    'usuarios' as tabela, COUNT(*) as total_restaurado FROM usuarios
UNION ALL
SELECT 
    'lancamentos' as tabela, COUNT(*) as total_restaurado FROM lancamentos
UNION ALL
SELECT 
    'grupos_presenca' as tabela, COUNT(*) as total_restaurado FROM grupos_presenca
UNION ALL
SELECT 
    'ofertas' as tabela, COUNT(*) as total_restaurado FROM ofertas
UNION ALL
SELECT 
    'licoes' as tabela, COUNT(*) as total_restaurado FROM licoes
UNION ALL
SELECT 
    'convites' as tabela, COUNT(*) as total_restaurado FROM convites;

-- Verificar integridade referencial
SELECT 
    'Verificando integridade referencial...' as status;

-- Verificar se há grupos_presenca órfãos
SELECT COUNT(*) as grupos_presenca_orfaos
FROM grupos_presenca gp
LEFT JOIN lancamentos l ON gp.lancamento_id = l.id
WHERE l.id IS NULL;

-- Verificar se há ofertas órfãs
SELECT COUNT(*) as ofertas_orfas
FROM ofertas o
LEFT JOIN lancamentos l ON o.lancamento_id = l.id
WHERE l.id IS NULL;

-- Verificar se há lancamentos sem igreja
SELECT COUNT(*) as lancamentos_sem_igreja
FROM lancamentos l
LEFT JOIN igrejas i ON l.igreja_id = i.id
WHERE l.igreja_id IS NOT NULL AND i.id IS NULL;

-- Verificar se há usuarios sem igreja
SELECT COUNT(*) as usuarios_sem_igreja
FROM usuarios u
LEFT JOIN igrejas i ON u.igreja_id = i.id
WHERE u.igreja_id IS NOT NULL AND i.id IS NULL;

SELECT 
    '✅ Restauração concluída!' as status;
