# ✅ CHECKLIST DE TESTES - MIGRAÇÃO SUPABASE

## 📋 Testes Obrigatórios

### 🔐 **1. AUTENTICAÇÃO**
- [ ] Login com admin/admin123
- [ ] Verificar se carrega dados do Supabase (não localStorage)
- [ ] Logout funciona
- [ ] Tentar login com credenciais inválidas

### 👥 **2. GESTÃO DE USUÁRIOS**
- [ ] Listar usuários (deve mostrar apenas admin inicial)
- [ ] Criar novo usuário
- [ ] Editar usuário existente
- [ ] Resetar senha de usuário
- [ ] Ativar/Desativar usuário
- [ ] Verificar que dados persistem no Supabase

### 🏛️ **3. GESTÃO DE IGREJAS**
- [ ] Listar igrejas (deve mostrar 4 igrejas padrão)
- [ ] Criar nova igreja
- [ ] Editar igreja existente
- [ ] Ativar/Desativar igreja
- [ ] Verificar contagem de usuários por igreja

### 📊 **4. LANÇAMENTOS (HISTÓRICO)**
- [ ] Preencher formulário de presença
- [ ] Salvar no histórico
- [ ] Visualizar histórico salvo
- [ ] Editar lançamento existente
- [ ] Excluir lançamento
- [ ] Verificar dados no Supabase

### 📖 **5. LIÇÕES**
- [ ] Listar lições
- [ ] Adicionar nova lição
- [ ] Editar lição existente
- [ ] Excluir lição
- [ ] Buscar lição por data
- [ ] Buscar lição por número

### 🎁 **6. CONVITES**
- [ ] Gerar link de convite
- [ ] Abrir link em navegador anônimo
- [ ] Processar convite (verificar validade)
- [ ] Finalizar cadastro via convite
- [ ] Verificar que convite foi marcado como usado
- [ ] Tentar usar mesmo convite novamente (deve bloquear)

### 🔄 **7. SINCRONIZAÇÃO CROSS-DEVICE**
- [ ] Fazer lançamento no dispositivo 1
- [ ] Abrir no dispositivo 2 (ou navegador anônimo)
- [ ] Login com mesmo usuário
- [ ] Verificar se dados aparecem
- [ ] **ESTE É O TESTE MAIS IMPORTANTE!**

## 🚨 Erros Esperados (OK se aparecerem):
- "Igreja não identificada" antes do login → **NORMAL**
- Console warnings sobre queries antes de autenticar → **NORMAL**

## ❌ Erros CRÍTICOS (precisam ser corrigidos):
- Erro 401/403 do Supabase → Verificar chave anon
- Erro ao fazer login → Verificar tabela usuarios
- Dados não aparecem após reload → Problema de query
- Convite não funciona entre dispositivos → Verificar URL encoding

## 📊 Como Verificar no Supabase:
1. Acesse: https://supabase.com/dashboard/project/fwmlimudntlrkeukvyjg
2. Vá em "Table Editor"
3. Verifique se os dados aparecem nas tabelas
