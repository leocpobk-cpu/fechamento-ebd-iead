# 🚀 GUIA DE DEPLOY - SISTEMA EBD IEAD

## ✅ PRÉ-REQUISITOS

### 1️⃣ Verificar Arquivos Críticos
- [x] `index.html` - Interface principal
- [x] `auth.js` - Lógica de autenticação e dados
- [x] `supabase-config.js` - Configuração do Supabase
- [x] `manifest.json` - PWA configurado
- [x] `sw.js` - Service Worker

### 2️⃣ Verificar Configurações do Supabase
- [x] URL: `https://fwmlimudntlrkeukvyjg.supabase.co`
- [x] Chave Anon configurada
- [x] 7 tabelas criadas
- [x] RLS habilitado (políticas abertas por enquanto)
- [x] Dados seed inseridos (4 igrejas + admin)

### 3️⃣ Verificar GitHub Pages
- [x] Repository: `fechamento-ebd-iead`
- [x] Branch: `main`
- [x] GitHub Pages ativo
- [x] URL: `https://leocpobk-cpu.github.io/fechamento-ebd-iead/`

---

## 🔄 PROCESSO DE DEPLOY

### **Método 1: Deploy Automático (Recomendado)**
```powershell
# 1. Commit das alterações
git add .
git commit -m "feat: migração completa para Supabase - pronto para produção"

# 2. Push para main (deploy automático)
git push origin main

# 3. Aguardar GitHub Actions (1-2 minutos)
# Verificar em: https://github.com/leocpobk-cpu/fechamento-ebd-iead/actions
```

### **Método 2: Verificação Manual**
```powershell
# 1. Testar localmente primeiro
python -m http.server 8000

# 2. Abrir http://localhost:8000
# 3. Fazer login com admin/admin123
# 4. Testar todas as funcionalidades
# 5. Verificar Console do navegador (F12)
# 6. Se tudo OK, fazer push
```

---

## 📊 CHECKLIST DE DEPLOY

### **Antes do Deploy:**
- [ ] Todos os testes passando (ver TESTE-MIGRACAO.md)
- [ ] Sem erros no Console do navegador
- [ ] Dados aparecem no Supabase
- [ ] Login funciona
- [ ] Sincronização cross-device OK

### **Durante o Deploy:**
- [ ] Commit com mensagem clara
- [ ] Push para branch main
- [ ] GitHub Actions executou sem erros
- [ ] Deploy concluído (check verde)

### **Após o Deploy:**
- [ ] Abrir URL: https://leocpobk-cpu.github.io/fechamento-ebd-iead/
- [ ] Fazer login com admin/admin123
- [ ] Criar um lançamento de teste
- [ ] Abrir em outro dispositivo/navegador
- [ ] Verificar se dados sincronizam
- [ ] Testar PWA (instalar no celular)

---

## 🔒 SEGURANÇA

### **✅ Implementado:**
- [x] HTTPS via GitHub Pages
- [x] Chave anon (pública) do Supabase
- [x] RLS habilitado no Supabase
- [x] Validações de nível no frontend
- [x] Segregação por igreja_id
- [x] Senhas em texto plano (⚠️ ver abaixo)

### **⚠️ MELHORIAS FUTURAS:**
- [ ] Hash de senhas (bcrypt/argon2)
- [ ] Supabase Auth (substituir sistema atual)
- [ ] RLS baseado em JWT do Supabase
- [ ] Rate limiting customizado
- [ ] Logs de auditoria

### **🔴 IMPORTANTE:**
> **As senhas estão em texto plano no banco!**
> Isso é ACEITÁVEL para ambiente interno/confiável, mas para produção pública recomenda-se:
> 1. Migrar para Supabase Auth OU
> 2. Implementar hash de senhas no backend

---

## 🌐 URLs IMPORTANTES

### **Produção:**
- 🌍 Sistema: https://leocpobk-cpu.github.io/fechamento-ebd-iead/
- 📊 Dashboard Supabase: https://supabase.com/dashboard/project/fwmlimudntlrkeukvyjg
- 📁 Repositório: https://github.com/leocpobk-cpu/fechamento-ebd-iead

### **Desenvolvimento:**
- 💻 Local: http://localhost:8000
- 🔧 Console Supabase: https://supabase.com/dashboard/project/fwmlimudntlrkeukvyjg/editor

---

## 🆘 TROUBLESHOOTING

### **Erro: "Failed to fetch" no Supabase**
```javascript
// Verificar em supabase-config.js:
const SUPABASE_URL = 'https://fwmlimudntlrkeukvyjg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGci...'; // Deve estar completa
```

### **Erro: "Igreja não identificada"**
- Normal antes do login
- Se persistir após login, verificar `getIgrejaUsuarioLogado()`

### **Dados não aparecem**
1. Abrir Console (F12)
2. Verificar erros de rede
3. Testar query manual no Supabase:
```sql
SELECT * FROM usuarios;
SELECT * FROM igrejas;
```

### **GitHub Pages não atualiza**
1. Limpar cache do navegador (Ctrl+Shift+Delete)
2. Forçar reload (Ctrl+F5)
3. Aguardar 2-3 minutos
4. Verificar em modo anônimo

---

## 📱 INSTALAÇÃO DO PWA

### **Android:**
1. Abrir no Chrome
2. Menu → "Adicionar à tela inicial"
3. Ícone aparece como app

### **iOS:**
1. Abrir no Safari
2. Botão de compartilhar
3. "Adicionar à Tela de Início"

### **Desktop:**
1. Chrome/Edge: Ícone de instalação na barra de endereço
2. Ou Settings → Install App

---

## 🎯 PRÓXIMOS PASSOS (PÓS-DEPLOY)

1. **Testar em produção** por 1 semana
2. **Coletar feedback** dos usuários
3. **Monitorar** uso do Supabase (dashboard)
4. **Avaliar** necessidade de Supabase Auth
5. **Implementar** hash de senhas se necessário
6. **Configurar** backup automático
7. **Adicionar** logs de auditoria

---

## 📞 SUPORTE

**Desenvolvedor:** GitHub Copilot + Claude Sonnet 4.5  
**Data:** 02/12/2025  
**Versão:** 3.2.0 (Supabase Migration Complete)

**Issues:** https://github.com/leocpobk-cpu/fechamento-ebd-iead/issues
