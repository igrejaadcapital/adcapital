# Build e copia APK release (modo live — abre sistema.adcapitaligreja.com.br)
# Uso: powershell -ExecutionPolicy Bypass -File scripts/build-apk.ps1
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Android = Join-Path $Root 'android'
$Releases = Join-Path $Root 'releases'
$Jks = Join-Path $Android 'adcapital-release.jks'
$Props = Join-Path $Android 'keystore.properties'

Set-Location $Root

function Ensure-Keystore {
    if ((Test-Path $Props) -and (Test-Path (Join-Path $Android (Get-Content $Props | Where-Object { $_ -match '^storeFile=' } | ForEach-Object { $_ -replace '^storeFile=', '' })))) {
        Write-Host '[apk] Keystore existente.' -ForegroundColor Green
        return
    }
    $javaHome = $env:JAVA_HOME
    if (-not $javaHome) {
        $studioJbr = 'C:\Program Files\Android\Android Studio\jbr'
        if (Test-Path "$studioJbr\bin\keytool.exe") { $env:JAVA_HOME = $studioJbr }
    }
    $keytool = Join-Path $env:JAVA_HOME 'bin\keytool.exe'
    if (-not (Test-Path $keytool)) {
        throw 'keytool nao encontrado. Defina JAVA_HOME ou instale Android Studio.'
    }
    $pass = 'adcapital-internal-2026'
    Write-Host '[apk] Gerando keystore interno (distribuicao igreja)...' -ForegroundColor Cyan
    & $keytool -genkey -v `
        -keystore $Jks `
        -alias adcapital `
        -keyalg RSA -keysize 2048 -validity 10000 `
        -storepass $pass -keypass $pass `
        -dname 'CN=AD Capital Sistema, OU=Igreja AD Capital, O=AD Capital, L=Brasil, C=BR'
    @"
storePassword=$pass
keyPassword=$pass
keyAlias=adcapital
storeFile=adcapital-release.jks
"@ | Set-Content -Path $Props -Encoding ASCII
}

Write-Host '[apk] Icones Android (logo da igreja)...' -ForegroundColor Cyan
npm run icons:android

Write-Host '[apk] npm run cap:sync...' -ForegroundColor Cyan
npm run cap:sync
Ensure-Keystore

Write-Host '[apk] Gradle assembleRelease...' -ForegroundColor Cyan
Set-Location $Android
$gradlew = Join-Path $Android 'gradlew.bat'
if ($env:JAVA_HOME) {
    & $gradlew assembleRelease --no-daemon
} else {
    $studioJbr = 'C:\Program Files\Android\Android Studio\jbr'
    if (Test-Path $studioJbr) {
        $env:JAVA_HOME = $studioJbr
        & $gradlew assembleRelease --no-daemon
    } else {
        & $gradlew assembleRelease --no-daemon
    }
}

$apk = Join-Path $Android 'app\build\outputs\apk\release\app-release.apk'
if (-not (Test-Path $apk)) {
    $apk = Join-Path $Android 'app\build\outputs\apk\release\app-release-unsigned.apk'
}
if (-not (Test-Path $apk)) {
    throw "APK nao encontrado em app/build/outputs/apk/release/"
}

New-Item -ItemType Directory -Force -Path $Releases | Out-Null
$dest = Join-Path $Releases 'adcapital-sistema-latest.apk'
Copy-Item -Force $apk $dest
$info = Join-Path $Releases 'BUILD_INFO.txt'
@"
AD Capital — APK modo live
Gerado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
URL no app: https://sistema.adcapitaligreja.com.br
API: https://api.adcapitaligreja.com.br/api/v1
Arquivo: adcapital-sistema-latest.apk
"@ | Set-Content $info -Encoding UTF8

Write-Host "[apk] OK: $dest" -ForegroundColor Green
Set-Location $Root
