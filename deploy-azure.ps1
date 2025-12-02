# Script de Deploy para Azure Static Web Apps
# Execute este script após fazer login no Azure CLI

Write-Host "🚀 Iniciando deploy do Fechamento EBD no Azure..." -ForegroundColor Green

# Verificar se Azure CLI está instalado
$azureCliInstalled = Get-Command az -ErrorAction SilentlyContinue
if (-not $azureCliInstalled) {
    Write-Host "❌ Azure CLI não encontrado. Instalando..." -ForegroundColor Yellow
    winget install Microsoft.AzureCLI
    Write-Host "✅ Azure CLI instalado. Por favor, reinicie o terminal e execute o script novamente." -ForegroundColor Green
    exit
}

# Login no Azure
Write-Host "`n🔐 Fazendo login no Azure..." -ForegroundColor Cyan
Write-Host "Uma janela do navegador será aberta para você fazer login com seu e-mail Azure." -ForegroundColor Yellow
az login

# Verificar se o login foi bem-sucedido
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer login. Tente novamente." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Login realizado com sucesso!" -ForegroundColor Green

# Variáveis
$resourceGroup = "rg-fechamento-ebd"
$appName = "fechamento-ebd-iead"
$location = "eastus2"
$githubRepo = "https://github.com/leocpobk-cpu/fechamento-ebd-iead"
$branch = "main"

# Criar Resource Group
Write-Host "`n📦 Criando Resource Group: $resourceGroup..." -ForegroundColor Cyan
az group create --name $resourceGroup --location $location

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Resource Group criado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Resource Group já existe ou erro na criação (continuando...)" -ForegroundColor Yellow
}

# Criar Static Web App
Write-Host "`n🌐 Criando Static Web App: $appName..." -ForegroundColor Cyan
Write-Host "Você será redirecionado para autorizar o acesso ao GitHub..." -ForegroundColor Yellow

az staticwebapp create `
    --name $appName `
    --resource-group $resourceGroup `
    --source $githubRepo `
    --location $location `
    --branch $branch `
    --app-location "/" `
    --login-with-github

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n🎉 Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host "`n📍 Sua aplicação estará disponível em alguns minutos em:" -ForegroundColor Cyan
    Write-Host "   https://$appName.azurestaticapps.net" -ForegroundColor White
    Write-Host "`n💡 Dica: Você pode acompanhar o deploy no GitHub Actions:" -ForegroundColor Yellow
    Write-Host "   https://github.com/leocpobk-cpu/fechamento-ebd-iead/actions" -ForegroundColor White
} else {
    Write-Host "`n❌ Erro ao criar Static Web App." -ForegroundColor Red
    Write-Host "Tente criar manualmente pelo portal: https://portal.azure.com" -ForegroundColor Yellow
}

Write-Host "`n" 
Read-Host "Pressione ENTER para fechar"
