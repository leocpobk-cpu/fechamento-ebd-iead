# 📖 Sistema de Gestão EBD - IEAD

Sistema completo para gerenciamento de Escola Bíblica Dominical com histórico, relatórios e resumos mensais.

## 🌐 Acesso Online

**URL:** https://leocpobk-cpu.github.io/fechamento-ebd-iead/

**Hospedagem:** GitHub Pages (Deploy automático a cada push)

## ✨ Funcionalidades

### 📝 Lançamento
- Seleção automática de domingos
- Registro de lição e tema
- Campos completos: Matriculados, Presentes, Visitantes, Bíblias, Revistas, Ofertas
- Cálculo automático de faltantes e percentuais
- Classe de Professores separada

### 📋 Histórico
- Salva todos os fechamentos
- Visualização de relatórios anteriores
- Exclusão de registros
- Persistência local (localStorage)

### 📊 Resumo Mensal
- Visualização por mês/ano
- Totais agregados do mês
- Média de presença
- Acesso rápido a cada domingo

### 🏆 Rankings
- Top 3 de presença (%)
- Top 3 de ofertas (R$)
- Medalhas visuais

### 📱 Exportação
- WhatsApp otimizado
- PDF/Impressão
- Texto formatado com emojis

## 📱 Dispositivos Suportados

- ✅ Celular (iOS/Android)
- ✅ Tablet
- ✅ Desktop
- ✅ Otimizado para toque

## 🚀 Deploy

O sistema está hospedado no **GitHub Pages** com deploy automático.

Cada push para `main` atualiza o site automaticamente em 1-2 minutos.

## 📁 Estrutura

```
├── index.html                 # Sistema completo
├── staticwebapp.config.json   # Configuração Azure
├── .github/workflows/         # GitHub Actions
└── README.md                  # Este arquivo
```

## 💾 Backup de Dados

O sistema oferece múltiplas opções de backup para garantir a segurança dos seus dados:

### Backup via Interface Web (Recomendado)
1. Clique no ícone 💾 (Exportar dados) no topo da tela
2. Escolha:
   - **OK** = Exportar Excel completo (relatórios)
   - **Cancelar** = Download JSON backup completo (todas as tabelas)
3. O backup JSON inclui:
   - ✅ Todos os lançamentos
   - ✅ Grupos de presença
   - ✅ Ofertas
   - ✅ Lições
   - ✅ Usuários (apenas admin)
   - ✅ Convites (apenas admin)

### Backup SQL (Administradores)
- Use os scripts `backup-tabelas.sql` e `restore-tabelas.sql`
- Consulte o [GUIA-BACKUP.md](GUIA-BACKUP.md) para instruções detalhadas
- Recomendado para backups agendados e recuperação de desastres

## 🔄 Atualizações

**Versão Atual:** 3.6.2  
**Última Atualização:** 21/01/2026

### Histórico de Versões

- **v3.6.2** - Backup completo de todas as tabelas do banco de dados
- **v2.0** - Sistema completo com histórico e resumo mensal
- **v1.5** - Rankings e otimização mobile
- **v1.0** - Versão inicial com lançamento básico

## 📞 Suporte

Em caso de problemas:
1. Limpe o cache do navegador
2. Verifique se tem dados salvos no histórico
3. Atualize a página
4. whatsapp 65 98134-6852 Leonardo 

---

**Desenvolvido para IEAD Cuiabá** Aleluia 🙏
