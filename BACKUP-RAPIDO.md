# 💾 Guia Rápido de Backup

## Como Fazer Backup

### 📱 Via Interface (Mais Fácil)

1. Abra o sistema EBD-IEAD
2. Clique no ícone **💾** no topo da página
3. Na mensagem que aparecer:
   - Clique **CANCELAR** para backup completo JSON
   - Clique **OK** para exportar apenas Excel
4. Arquivo será baixado automaticamente

**Nome do arquivo:** `EBD_Backup_Completo_YYYY-MM-DD.json`

### 📊 O que está incluído no backup?

✅ Todos os lançamentos (presença)  
✅ Grupos de presença  
✅ Ofertas  
✅ Lições da EBD  
✅ Usuários (somente admin)  
✅ Convites pendentes (somente admin)  
✅ Dados da igreja (somente admin)  

### 🔒 Segurança

- Guarde o arquivo em local seguro
- Faça backup regularmente (semanal recomendado)
- Mantenha cópias em locais diferentes
- Não compartilhe o arquivo (contém dados sensíveis)

### 📅 Frequência Recomendada

| Tipo | Frequência |
|------|------------|
| Usuários | Semanal |
| Administradores | Semanal + antes de qualquer alteração importante |

## ⚠️ Importante

- O backup JSON **NÃO** é restaurado automaticamente
- Use para guardar histórico e segurança
- Em caso de perda de dados, entre em contato: 65 98134-6852

## 📖 Documentação Completa

Para instruções avançadas (SQL, restauração, etc), consulte:
- [GUIA-BACKUP.md](GUIA-BACKUP.md) - Guia completo
- `backup-tabelas.sql` - Script de backup SQL
- `restore-tabelas.sql` - Script de restauração SQL

---

**Sistema EBD-IEAD v3.6.2** 🙏
