# 💾 Guia de Backup e Restauração - Sistema EBD-IEAD

## 📋 Visão Geral

Este documento descreve os procedimentos de backup e restauração para o Sistema de Gestão EBD-IEAD. O sistema oferece múltiplas opções de backup para garantir a segurança dos dados.

## 🗂️ Tabelas do Sistema

O banco de dados contém as seguintes tabelas:

1. **igrejas** - Cadastro de igrejas
2. **usuarios** - Usuários do sistema com níveis de acesso
3. **lancamentos** - Registros de presença por data
4. **grupos_presenca** - Detalhamento de presença por grupo
5. **ofertas** - Valores de ofertas por tipo
6. **licoes** - Lições da EBD com tema e data
7. **convites** - Convites para novos usuários

## 🔐 Níveis de Backup

### Backup de Usuário (JSON)
- Disponível para todos os usuários
- Exporta dados da igreja do usuário logado
- Inclui: lançamentos, grupos_presenca, ofertas, lições
- Admins também exportam: igreja, usuários, convites

### Backup Administrativo (SQL)
- Apenas para administradores do banco de dados
- Backup completo de todas as tabelas
- Inclui estrutura e dados

## 📤 Como Fazer Backup

### 1. Backup via Interface Web (JSON)

**Passo a passo:**

1. Faça login no sistema
2. Clique no ícone 💾 (Exportar dados) no topo da tela
3. Escolha uma opção:
   - **OK** = Exportar Excel completo (apenas dados históricos)
   - **Cancelar** = Download JSON backup completo

4. O arquivo será baixado automaticamente:
   - Nome: `EBD_Backup_Completo_YYYY-MM-DD.json`
   - Formato: JSON com todos os dados

**O que é incluído no backup JSON:**
- ✅ Todos os lançamentos da igreja
- ✅ Todos os grupos de presença
- ✅ Todas as ofertas
- ✅ Todas as lições (globais)
- ✅ Usuários da igreja (apenas admin)
- ✅ Convites ativos (apenas admin)
- ✅ Dados da igreja (apenas admin)
- ✅ Estatísticas do backup

### 2. Backup via Banco de Dados (SQL)

**Usando o script `backup-tabelas.sql`:**

```bash
# 1. Executar o script de verificação
psql -U postgres -d ebd_iead < backup-tabelas.sql

# 2. Exportar dados em CSV
psql -U postgres -d ebd_iead -c "\COPY igrejas TO '/caminho/backup/igrejas.csv' WITH (FORMAT CSV, HEADER true)"
psql -U postgres -d ebd_iead -c "\COPY usuarios TO '/caminho/backup/usuarios.csv' WITH (FORMAT CSV, HEADER true)"
psql -U postgres -d ebd_iead -c "\COPY lancamentos TO '/caminho/backup/lancamentos.csv' WITH (FORMAT CSV, HEADER true)"
psql -U postgres -d ebd_iead -c "\COPY grupos_presenca TO '/caminho/backup/grupos_presenca.csv' WITH (FORMAT CSV, HEADER true)"
psql -U postgres -d ebd_iead -c "\COPY ofertas TO '/caminho/backup/ofertas.csv' WITH (FORMAT CSV, HEADER true)"
psql -U postgres -d ebd_iead -c "\COPY licoes TO '/caminho/backup/licoes.csv' WITH (FORMAT CSV, HEADER true)"
psql -U postgres -d ebd_iead -c "\COPY convites TO '/caminho/backup/convites.csv' WITH (FORMAT CSV, HEADER true)"
```

**Usando pg_dump (recomendado):**

```bash
# Backup completo binário
pg_dump -U postgres -d ebd_iead -F c -b -v -f /caminho/backup/ebd_iead_backup_$(date +%Y%m%d_%H%M%S).backup

# Backup em SQL legível
pg_dump -U postgres -d ebd_iead -F p -b -v -f /caminho/backup/ebd_iead_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 3. Backup Supabase (Nuvem)

Se estiver usando Supabase, também faça backup via painel:

1. Acesse o painel Supabase
2. Vá em Database > Backups
3. Configure backups automáticos
4. Faça backup manual quando necessário

## 📥 Como Restaurar Backup

### 1. Restaurar Backup JSON

**IMPORTANTE:** Não há função automática de restauração JSON na interface. Este backup serve principalmente para:
- Auditorias
- Análise de dados
- Migração para outro sistema
- Recuperação de desastres

Para restaurar dados do JSON:
1. Abra o arquivo JSON
2. Use o console do navegador para inserir dados manualmente
3. Ou desenvolva um script de importação customizado

### 2. Restaurar Backup SQL

**⚠️ ATENÇÃO: Este processo APAGA todos os dados existentes!**

**Usando o script `restore-tabelas.sql`:**

```bash
# 1. Fazer backup preventivo antes de restaurar
pg_dump -U postgres -d ebd_iead -F c -f /tmp/backup_antes_restauracao.backup

# 2. Executar restauração (CSV)
# Edite restore-tabelas.sql com os caminhos corretos
psql -U postgres -d ebd_iead < restore-tabelas.sql

# 3. Verificar integridade após restauração
psql -U postgres -d ebd_iead -c "SELECT 'igrejas' as tabela, COUNT(*) FROM igrejas UNION ALL SELECT 'usuarios', COUNT(*) FROM usuarios UNION ALL SELECT 'lancamentos', COUNT(*) FROM lancamentos"
```

**Usando pg_restore:**

```bash
# Restaurar de backup binário
pg_restore -U postgres -d ebd_iead -v -c /caminho/backup/ebd_iead_backup_YYYYMMDD_HHMMSS.backup

# Restaurar de SQL
psql -U postgres -d ebd_iead < /caminho/backup/ebd_iead_backup_YYYYMMDD_HHMMSS.sql
```

## 📅 Estratégia de Backup Recomendada

### Backups Regulares

| Frequência | Tipo | Método | Retenção |
|------------|------|--------|----------|
| Diário | Automático | Supabase | 7 dias |
| Semanal | Manual | JSON via Web | 30 dias |
| Mensal | Manual | pg_dump | 1 ano |
| Antes de atualizações | Manual | pg_dump | Permanente |

### Checklist de Backup

- [ ] Backup JSON via interface (semanal)
- [ ] Backup pg_dump completo (mensal)
- [ ] Verificar integridade dos backups
- [ ] Testar restauração em ambiente de teste
- [ ] Armazenar backups em local seguro (nuvem + local)
- [ ] Documentar data e conteúdo de cada backup

## 🔒 Segurança dos Backups

1. **Armazenamento:**
   - Mantenha backups em múltiplos locais
   - Use criptografia para backups sensíveis
   - Nunca armazene backups no mesmo servidor

2. **Acesso:**
   - Restrinja acesso aos backups
   - Use senhas fortes nos arquivos
   - Registre quem acessa os backups

3. **Testes:**
   - Teste restauração periodicamente
   - Verifique integridade dos dados
   - Mantenha ambiente de teste

## 🆘 Recuperação de Desastres

### Cenário 1: Perda de Dados Recentes
1. Restaurar último backup diário (Supabase)
2. Recuperar dados faltantes de backups JSON dos usuários

### Cenário 2: Corrupção de Tabela
1. Identificar tabelas afetadas
2. Restaurar apenas as tabelas necessárias do pg_dump
3. Verificar relacionamentos

### Cenário 3: Perda Total do Banco
1. Criar novo banco de dados
2. Restaurar estrutura (schema)
3. Restaurar dados do último pg_dump
4. Validar todas as tabelas
5. Atualizar configurações de conexão

## 📞 Suporte

Em caso de problemas com backup/restauração:

1. Verifique os logs de erro
2. Consulte este documento
3. Entre em contato: WhatsApp 65 98134-6852 (Leonardo)

## 📊 Verificação de Integridade

Execute estas queries após qualquer restauração:

```sql
-- Verificar totais
SELECT 'igrejas' as tabela, COUNT(*) FROM igrejas
UNION ALL SELECT 'usuarios', COUNT(*) FROM usuarios
UNION ALL SELECT 'lancamentos', COUNT(*) FROM lancamentos
UNION ALL SELECT 'grupos_presenca', COUNT(*) FROM grupos_presenca
UNION ALL SELECT 'ofertas', COUNT(*) FROM ofertas
UNION ALL SELECT 'licoes', COUNT(*) FROM licoes
UNION ALL SELECT 'convites', COUNT(*) FROM convites;

-- Verificar relacionamentos
SELECT COUNT(*) as lancamentos_sem_igreja
FROM lancamentos l
LEFT JOIN igrejas i ON l.igreja_id = i.id
WHERE l.igreja_id IS NOT NULL AND i.id IS NULL;

SELECT COUNT(*) as grupos_orfaos
FROM grupos_presenca g
LEFT JOIN lancamentos l ON g.lancamento_id = l.id
WHERE l.id IS NULL;

SELECT COUNT(*) as ofertas_orfas
FROM ofertas o
LEFT JOIN lancamentos l ON o.lancamento_id = l.id
WHERE l.id IS NULL;
```

## 🔄 Histórico de Versões

- **v1.0** (2026-01-21): Primeira versão do guia de backup
  - Backup JSON completo via interface
  - Scripts SQL de backup e restauração
  - Documentação completa

---

**Desenvolvido para IEAD Cuiabá** 🙏
