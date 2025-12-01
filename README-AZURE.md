# 🚀 Deploy do Fechamento EBD no Azure

## Opções de Hospedagem

### **Opção 1: Azure Static Web Apps (RECOMENDADO - GRÁTIS)**

#### Vantagens:
- ✅ 100% Gratuito
- ✅ HTTPS automático
- ✅ Deploy automático via GitHub
- ✅ CDN global incluído
- ✅ Domínio personalizado grátis

#### Passos:

1. **Criar conta no Azure**
   - Acesse: https://azure.microsoft.com/free/
   - Crie uma conta gratuita (12 meses de serviços gratuitos)

2. **Criar repositório no GitHub**
   ```bash
   # No terminal, dentro da pasta do projeto:
   git init
   git add .
   git commit -m "Initial commit - Fechamento EBD"
   
   # Criar repositório no GitHub (https://github.com/new)
   # Depois conectar:
   git remote add origin https://github.com/SEU-USUARIO/fechamento-ebd.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy no Azure Static Web Apps**
   - Acesse o Portal Azure: https://portal.azure.com
   - Clique em "Create a resource"
   - Procure por "Static Web App"
   - Preencha:
     - **Subscription**: Sua assinatura
     - **Resource Group**: Criar novo "rg-fechamento-ebd"
     - **Name**: "fechamento-ebd-iead"
     - **Plan type**: Free
     - **Region**: East US 2
     - **Source**: GitHub
     - **Organization**: Seu usuário
     - **Repository**: fechamento-ebd
     - **Branch**: main
   - Clique em "Review + Create"
   - O Azure vai fazer deploy automático!

4. **Acessar aplicação**
   - URL será algo como: `https://fechamento-ebd-iead.azurestaticapps.net`
   - Configurar domínio personalizado (opcional)

---

### **Opção 2: Azure App Service (Plano Gratuito F1)**

#### Vantagens:
- ✅ Gratuito (limitações de recursos)
- ✅ HTTPS automático
- ✅ Fácil configuração

#### Passos:

1. **Via Portal Azure**
   - Acesse: https://portal.azure.com
   - Clique em "Create a resource"
   - Procure por "Web App"
   - Preencha:
     - **Name**: fechamento-ebd-iead
     - **Runtime stack**: HTML
     - **Operating System**: Windows
     - **Region**: Brazil South
     - **Pricing plan**: F1 (Free)
   - Clique em "Review + Create"

2. **Deploy via VS Code**
   - Instale a extensão: "Azure App Service"
   - Clique com botão direito no arquivo HTML
   - Escolha "Deploy to Web App"
   - Selecione sua subscription e web app
   - Pronto!

3. **Deploy via Azure CLI** (alternativa)
   ```powershell
   # Instalar Azure CLI
   winget install Microsoft.AzureCLI
   
   # Login
   az login
   
   # Criar resource group
   az group create --name rg-fechamento-ebd --location brazilsouth
   
   # Criar App Service Plan
   az appservice plan create --name plan-fechamento-ebd --resource-group rg-fechamento-ebd --sku F1
   
   # Criar Web App
   az webapp create --name fechamento-ebd-iead --resource-group rg-fechamento-ebd --plan plan-fechamento-ebd
   
   # Deploy via ZIP
   Compress-Archive -Path "FechamentoEBD.html","web.config" -DestinationPath deploy.zip
   az webapp deployment source config-zip --resource-group rg-fechamento-ebd --name fechamento-ebd-iead --src deploy.zip
   ```

---

### **Opção 3: Azure Blob Storage + CDN (Mais Barato)**

#### Vantagens:
- ✅ Extremamente barato (centavos por mês)
- ✅ Alta performance
- ✅ Escalável

#### Passos:

1. **Criar Storage Account**
   ```powershell
   az storage account create --name fechamentoebdstorage --resource-group rg-fechamento-ebd --location brazilsouth --sku Standard_LRS --kind StorageV2
   ```

2. **Habilitar Static Website**
   ```powershell
   az storage blob service-properties update --account-name fechamentoebdstorage --static-website --index-document FechamentoEBD.html
   ```

3. **Upload dos arquivos**
   ```powershell
   az storage blob upload --account-name fechamentoebdstorage --container-name '$web' --name FechamentoEBD.html --file FechamentoEBD.html --content-type "text/html"
   ```

4. **Acessar**
   - URL: `https://fechamentoebdstorage.z15.web.core.windows.net/`

---

## 🔧 Configurações Adicionais

### Domínio Personalizado
- No portal Azure, vá para sua aplicação
- Custom domains → Add custom domain
- Configure DNS conforme instruções

### HTTPS Forçado
- Já vem habilitado por padrão em todas as opções

### Monitoramento
- Application Insights (opcional)
- Gratuito até 5GB/mês

---

## 📱 Recursos da Aplicação

- ✅ Progressive Web App (PWA) ready
- ✅ Responsivo para mobile
- ✅ LocalStorage para persistência
- ✅ Funciona offline após primeira visita
- ✅ Rankings dinâmicos
- ✅ Exportação para WhatsApp

---

## 💰 Custos Estimados

| Opção | Custo Mensal |
|-------|--------------|
| Static Web Apps | R$ 0,00 (Free tier) |
| App Service F1 | R$ 0,00 (Free tier) |
| Blob Storage | R$ 0,50 - R$ 2,00 |

---

## 🆘 Suporte

Em caso de dúvidas:
- Documentação Azure: https://docs.microsoft.com/azure
- Azure Support: https://azure.microsoft.com/support/
