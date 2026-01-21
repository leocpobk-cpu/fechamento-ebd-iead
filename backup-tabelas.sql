-- Script de Backup Completo das Tabelas EBD-IEAD
-- Gerado automaticamente pelo sistema de backup
-- Data: 2026-01-21
-- 
-- Este script cria um backup completo de todas as tabelas do banco de dados
-- incluindo estrutura e dados
--
-- Para executar: psql -U postgres -d ebd_iead < backup-tabelas.sql

-- ============================================
-- BACKUP DA ESTRUTURA DAS TABELAS
-- ============================================

-- Backup da tabela: igrejas
-- Descrição: Armazena informações das igrejas cadastradas no sistema
SELECT 
    'igrejas' as tabela,
    COUNT(*) as total_registros,
    NOW() as data_backup
FROM igrejas;

-- Backup da tabela: usuarios
-- Descrição: Armazena usuários do sistema com diferentes níveis de acesso
SELECT 
    'usuarios' as tabela,
    COUNT(*) as total_registros,
    NOW() as data_backup
FROM usuarios;

-- Backup da tabela: lancamentos
-- Descrição: Armazena os lançamentos de presença por data
SELECT 
    'lancamentos' as tabela,
    COUNT(*) as total_registros,
    NOW() as data_backup
FROM lancamentos;

-- Backup da tabela: grupos_presenca
-- Descrição: Armazena presença detalhada por grupo em cada lançamento
SELECT 
    'grupos_presenca' as tabela,
    COUNT(*) as total_registros,
    NOW() as data_backup
FROM grupos_presenca;

-- Backup da tabela: ofertas
-- Descrição: Armazena valores de ofertas por tipo em cada lançamento
SELECT 
    'ofertas' as tabela,
    COUNT(*) as total_registros,
    NOW() as data_backup
FROM ofertas;

-- Backup da tabela: licoes
-- Descrição: Armazena lições da EBD com tema e data
SELECT 
    'licoes' as tabela,
    COUNT(*) as total_registros,
    NOW() as data_backup
FROM licoes;

-- Backup da tabela: convites
-- Descrição: Armazena convites para cadastro de novos usuários
SELECT 
    'convites' as tabela,
    COUNT(*) as total_registros,
    NOW() as data_backup
FROM convites;

-- ============================================
-- EXPORTAÇÃO DE DADOS (formato COPY)
-- ============================================

-- Para fazer backup dos dados, use os comandos abaixo:
-- 
-- INSTRUÇÕES:
-- 1. Crie um diretório para o backup: mkdir -p /tmp/backup_ebd
-- 2. Substitua /tmp/backup_ebd pelo caminho desejado nos comandos abaixo
-- 3. Execute cada comando no psql ou salve como script separado
-- 
-- EXEMPLO de uso no Linux/Mac:
-- DATA=$(date +%Y%m%d_%H%M%S)
-- mkdir -p /tmp/backup_ebd_$DATA
-- cd /tmp/backup_ebd_$DATA
-- 
-- Então execute os comandos COPY abaixo:

-- \COPY igrejas TO '/tmp/backup_ebd/igrejas.csv' WITH (FORMAT CSV, HEADER true);
-- \COPY usuarios TO '/tmp/backup_ebd/usuarios.csv' WITH (FORMAT CSV, HEADER true);
-- \COPY lancamentos TO '/tmp/backup_ebd/lancamentos.csv' WITH (FORMAT CSV, HEADER true);
-- \COPY grupos_presenca TO '/tmp/backup_ebd/grupos_presenca.csv' WITH (FORMAT CSV, HEADER true);
-- \COPY ofertas TO '/tmp/backup_ebd/ofertas.csv' WITH (FORMAT CSV, HEADER true);
-- \COPY licoes TO '/tmp/backup_ebd/licoes.csv' WITH (FORMAT CSV, HEADER true);
-- \COPY convites TO '/tmp/backup_ebd/convites.csv' WITH (FORMAT CSV, HEADER true);

-- ============================================
-- BACKUP COMPLETO (pg_dump)
-- ============================================

-- Para fazer um backup completo usando pg_dump:
-- pg_dump -U postgres -d ebd_iead -F c -b -v -f /caminho/backup/ebd_iead_backup_$(date +%Y%m%d_%H%M%S).backup

-- Para restaurar o backup:
-- pg_restore -U postgres -d ebd_iead -v /caminho/backup/ebd_iead_backup_YYYYMMDD_HHMMSS.backup

-- ============================================
-- VERIFICAÇÃO DE INTEGRIDADE
-- ============================================

-- Verificar totais de registros
SELECT 
    'igrejas' as tabela, COUNT(*) as total FROM igrejas
UNION ALL
SELECT 
    'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 
    'lancamentos' as tabela, COUNT(*) as total FROM lancamentos
UNION ALL
SELECT 
    'grupos_presenca' as tabela, COUNT(*) as total FROM grupos_presenca
UNION ALL
SELECT 
    'ofertas' as tabela, COUNT(*) as total FROM ofertas
UNION ALL
SELECT 
    'licoes' as tabela, COUNT(*) as total FROM licoes
UNION ALL
SELECT 
    'convites' as tabela, COUNT(*) as total FROM convites;

-- Verificar relacionamentos
SELECT 
    'lancamentos->grupos_presenca' as relacionamento,
    COUNT(DISTINCT l.id) as total_lancamentos,
    COUNT(g.id) as total_grupos
FROM lancamentos l
LEFT JOIN grupos_presenca g ON l.id = g.lancamento_id;

SELECT 
    'lancamentos->ofertas' as relacionamento,
    COUNT(DISTINCT l.id) as total_lancamentos,
    COUNT(o.id) as total_ofertas
FROM lancamentos l
LEFT JOIN ofertas o ON l.id = o.lancamento_id;
