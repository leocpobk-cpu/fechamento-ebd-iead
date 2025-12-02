# 📚 Gestão EBD - IEAD

Sistema completo de gestão da Escola Bíblica Dominical

## 📦 Versão Atual

**Versão: 3.0.0** | Build: `1283b38` | Data: 02/12/2025

### 🔗 Links

- 🌐 **Site**: https://leocpobk-cpu.github.io/fechamento-ebd-iead/
- 🔍 **Diagnóstico**: [diagnostico.html](diagnostico.html)
- 🧪 **Teste Mobile**: [test-mobile.html](test-mobile.html)

---

## ✨ Funcionalidades

### 🔐 Autenticação e Controle de Acesso
- ✅ Sistema de login com 3 níveis de acesso
- ✅ **Admin**: Acesso total + gerenciamento de usuários
- ✅ **Diretoria EBD**: Lançamento e visualização
- ✅ **Auxiliar**: Apenas visualização
- ✅ Recuperação de senha por email/celular
- ✅ Gestão completa de usuários

### 📊 Recursos Principais
- ✅ Dashboard com gráficos interativos (Chart.js)
- ✅ Lançamento de presença, ofertas e materiais
- ✅ Histórico completo de lançamentos
- ✅ Resumo mensal
- ✅ Gestão de lições com busca automática
- ✅ Rankings de presença e ofertas

### 💾 Exportação e Backup
- ✅ Exportação para Excel (XLSX)
- ✅ Exportação para WhatsApp
- ✅ Impressão/PDF
- ✅ Backup completo em JSON

### 🎨 Interface e UX
- ✅ Modo escuro/claro
- ✅ PWA instalável (funciona offline)
- ✅ Responsivo (mobile, tablet, desktop)
- ✅ **Swipe em mobile** para trocar abas
- ✅ Service Worker para cache

---

## 🚀 Como Usar

### 1️⃣ Acessar o Sistema

Abra: https://leocpobk-cpu.github.io/fechamento-ebd-iead/

### 2️⃣ Fazer Login

Usuários padrão para teste:

| Usuário | Senha | Nível | Permissões |
|---------|-------|-------|------------|
| `admin` | `admin123` | Administrador | Acesso total |
| `diretoria` | `dir123` | Diretoria EBD | Lançamento + Visualização |
| `auxiliar` | `aux123` | Auxiliar | Apenas visualização |

### 3️⃣ Navegar

**Desktop:**
- Clique nas abas superiores

**Mobile:**
- Clique nas abas OU
- 👆 **Arraste horizontalmente** para trocar abas:
  - 👈 Direita → Esquerda = Aba anterior
  - 👉 Esquerda → Direita = Próxima aba

---

## 🔧 Troubleshooting

### ❌ Menu de Usuários não aparece

**Causa:** Você não está logado como Admin

**Solução:**
1. Faça logout (botão 🚪 no canto superior direito)
2. Faça login com: `admin` / `admin123`
3. A aba "👥 Usuários" aparecerá

---

### ❌ Swipe não funciona

**Causa:** Múltiplas possibilidades

**Soluções:**

1. **Verifique se está em mobile:**
   - Largura da tela deve ser ≤ 768px
   - Use DevTools do Chrome (F12) → Toggle Device Toolbar

2. **Limpe o cache:**
   - Abra: [diagnostico.html](diagnostico.html)
   - Clique em "🗑️ Limpar Cache"
   - Recarregue o site

3. **Teste o swipe:**
   - Abra: [test-mobile.html](test-mobile.html)
   - Teste na caixa cinza
   - Veja se detecta o movimento

4. **Verifique se está logado:**
   - Swipe só funciona após fazer login
   - Sistema precisa estar visível

---

### ❌ Versão antiga está no site

**Causa:** Cache do GitHub Pages ou do navegador

**Soluções:**

1. **Forçar atualização:**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Verificar versão:**
   - Olhe no rodapé da tela de login
   - Deve estar: `📦 Versão 3.0.0 | Build 1283b38`

3. **Aguardar deploy:**
   - GitHub Pages pode levar 1-3 minutos
   - Verifique em: https://github.com/leocpobk-cpu/fechamento-ebd-iead/actions

4. **Limpar tudo:**
   - Use a ferramenta de diagnóstico
   - Clique em "🗑️ Limpar Cache"

---

## 🧪 Ferramentas de Diagnóstico

### 1. Diagnóstico Completo

Abra localmente: `diagnostico.html`

**Recursos:**
- ✅ Verifica todos os arquivos
- ✅ Testa funções JavaScript
- ✅ Verifica LocalStorage
- ✅ Testa suporte a Touch
- ✅ Limpa cache completo
- ✅ Log em tempo real

### 2. Teste Mobile

Abra localmente: `test-mobile.html`

**Recursos:**
- ✅ Detecta largura/altura da tela
- ✅ Verifica suporte a Touch
- ✅ Área de teste de swipe
- ✅ Mostra distância do arraste
- ✅ Link direto para o site

---

## 📝 Histórico de Versões

### v3.0.0 (02/12/2025) - Atual
- ✅ Sistema de autenticação completo
- ✅ Gerenciamento de usuários
- ✅ Swipe para mobile (corrigido)
- ✅ Indicador de versão
- ✅ Ferramentas de diagnóstico

### v2.0.0
- ✅ PWA com Service Worker
- ✅ Dashboard com gráficos
- ✅ Modo escuro
- ✅ Exportação Excel

### v1.0.0
- ✅ Sistema básico de lançamento
- ✅ Rankings
- ✅ Histórico

---

## 🐛 Problemas Conhecidos

| Problema | Status | Solução |
|----------|--------|---------|
| Swipe não funciona em desktop | ✅ Normal | Use em mobile ou DevTools |
| Cache do navegador | ⚠️ Comum | Ctrl+Shift+R para atualizar |
| GitHub Pages demora | ⚠️ Normal | Aguarde 1-3 minutos |

---

## 👨‍💻 Desenvolvimento

### Estrutura de Arquivos

```
fechamento-ebd-iead/
├── index.html          # Sistema principal
├── auth.js            # Autenticação e usuários
├── licoes.js          # Dados das lições
├── manifest.json      # Configuração PWA
├── sw.js              # Service Worker
├── icon.svg           # Ícone da aplicação
├── diagnostico.html   # Ferramenta de diagnóstico
├── test-mobile.html   # Teste de swipe
└── README.md          # Este arquivo
```

### Tecnologias

- HTML5, CSS3, JavaScript (Vanilla)
- Chart.js v4.4.0 (gráficos)
- SheetJS v0.18.5 (Excel)
- LocalStorage (persistência)
- Service Worker (PWA)

---

## 📞 Suporte

Se os problemas persistirem:

1. ✅ Verifique a versão no rodapé do login
2. ✅ Use a ferramenta de diagnóstico
3. ✅ Limpe cache e cookies
4. ✅ Teste em modo anônimo do navegador
5. ✅ Verifique o console do navegador (F12)

---

## 📄 Licença

Sistema desenvolvido para IEAD - Igreja Evangélica Assembleia de Deus

**Última atualização:** 02 de dezembro de 2025
