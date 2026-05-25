# Corrige ambiente Android no Windows (rodar como Administrador para limpar Machine).
# Uso: PowerShell -ExecutionPolicy Bypass -File scripts\fix-android-env.ps1

$jbr = "C:\Program Files\Android\Android Studio\jbr"
if (-not (Test-Path "$jbr\bin\java.exe")) {
    Write-Host "JDK do Android Studio nao encontrado em: $jbr" -ForegroundColor Red
    exit 1
}

# Remove _JAVA_OPTIONS (quebra Gradle/Android Studio em muitos PCs)
[Environment]::SetEnvironmentVariable("_JAVA_OPTIONS", $null, "User")
try {
    [Environment]::SetEnvironmentVariable("_JAVA_OPTIONS", $null, "Machine")
    Write-Host "OK: _JAVA_OPTIONS removido (User + Machine)" -ForegroundColor Green
} catch {
    Write-Host "AVISO: Machine _JAVA_OPTIONS precisa de Admin. Rode este script como Administrador." -ForegroundColor Yellow
    Write-Host $_.Exception.Message
}

# JAVA_HOME para builds no terminal
[Environment]::SetEnvironmentVariable("JAVA_HOME", $jbr, "User")
$env:JAVA_HOME = $jbr
$env:Path = "$jbr\bin;" + [Environment]::GetEnvironmentVariable("Path", "User")
Write-Host "OK: JAVA_HOME = $jbr" -ForegroundColor Green

# Instala driver do emulador (AEHD) se existir no SDK
$aehd = "$env:LOCALAPPDATA\Android\Sdk\extras\google\Android_Emulator_Hypervisor_Driver\silent_install.bat"
if (Test-Path $aehd) {
    Write-Host "Instalando Android Emulator Hypervisor Driver (AEHD)..." -ForegroundColor Cyan
    Start-Process -FilePath $aehd -Verb RunAs -Wait
} else {
    Write-Host "AEHD nao encontrado. Android Studio -> SDK Manager -> SDK Tools -> Android Emulator hypervisor driver" -ForegroundColor Yellow
}

Write-Host "`nProximo passo: Android Studio -> Sync Project with Gradle Files -> Run" -ForegroundColor Cyan
