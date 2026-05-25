# Exporta keystore local (gerado por build-apk.ps1) para GitHub Secrets
# Uso: powershell -ExecutionPolicy Bypass -File scripts/export-keystore-for-ci.ps1
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Jks = Join-Path $Root 'android\adcapital-release.jks'
$Props = Join-Path $Root 'android\keystore.properties'

if (-not (Test-Path $Jks)) {
    Write-Host 'Keystore nao encontrado. Rode primeiro: npm run apk:build' -ForegroundColor Yellow
    exit 1
}

$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($Jks))
$pass = (Get-Content $Props | Where-Object { $_ -match '^storePassword=' } | ForEach-Object { $_ -replace '^storePassword=', '' })

Write-Host ''
Write-Host '=== GitHub Secrets (repo igrejaadcapital/adcapital) ===' -ForegroundColor Cyan
Write-Host 'Settings -> Secrets and variables -> Actions -> New repository secret'
Write-Host ''
Write-Host 'APK_KEYSTORE_PASS =' $pass
Write-Host ''
Write-Host 'APK_KEYSTORE_BASE64 = (copie abaixo)' -ForegroundColor Green
Write-Host $b64
Write-Host ''
Write-Host 'Com o secret configurado, o CI usa sempre a mesma assinatura (updates in-place).' -ForegroundColor Gray
