@echo off
echo Deploying Fechamento EBD application...

:: Verificar se existe o diretório de destino
if not exist "%DEPLOYMENT_TARGET%" (
  echo Creating deployment target directory...
  mkdir "%DEPLOYMENT_TARGET%"
)

:: Copiar arquivos para o destino
echo Copying files...
xcopy /Y "%DEPLOYMENT_SOURCE%\FechamentoEBD.html" "%DEPLOYMENT_TARGET%\"
xcopy /Y "%DEPLOYMENT_SOURCE%\web.config" "%DEPLOYMENT_TARGET%\"

echo Deployment completed successfully!
