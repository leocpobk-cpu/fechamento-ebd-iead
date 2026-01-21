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

## 💾 Backup e Restauração

### Backup Completo

O sistema agora possui funcionalidade de **backup completo** de todos os dados:

**Como fazer backup:**

1. Faça login como administrador (Nível 1)
2. Clique no ícone de exportar (💾) no cabeçalho
3. Escolha a opção de backup JSON
4. Um arquivo será baixado com todos os dados:
   - Dados da igreja
   - Usuários (sem senhas por segurança)
   - Lançamentos com grupos de presença e ofertas
   - Lições
   - Convites

**Formato do backup:** `EBD_Backup_Completo_[Nome_Igreja]_[Data].json`

### Restauração de Backup

**⚠️ APENAS ADMINISTRADORES podem restaurar backups**

**Como restaurar:**

1. Faça login como administrador (Nível 1)
2. Clique no ícone de restaurar (📥) no cabeçalho
3. Selecione o arquivo de backup (.json)
4. Confirme a restauração
5. Os dados serão adicionados ao sistema (dados existentes não são apagados)

**Segurança:**
- Dados duplicados são automaticamente ignorados
- Senhas de usuários não são restauradas (por segurança)
- Sistema detecta e pula registros já existentes

**Recomendação:** Faça backup regularmente antes de operações importantes!

## 🔄 Atualizações

**Versão Atual:** 3.6.2  
**Última Atualização:** 21/01/2026

### Histórico de Versões

- **v3.6.2** - Backup completo e restauração de dados
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
