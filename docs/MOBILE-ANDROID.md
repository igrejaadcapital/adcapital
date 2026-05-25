# App Android — AD Capital (Capacitor)

## Pré-requisitos (Windows)

1. [Node.js](https://nodejs.org/) 20+
2. [Android Studio](https://developer.android.com/studio) (SDK 34+, build-tools)
3. Variável `ANDROID_HOME` configurada (Studio → SDK Manager)
4. **Remover `_JAVA_OPTIONS`** se existir (Configurações → Variáveis de ambiente). Esse valor quebra o Gradle no Studio.
5. `JAVA_HOME` = `C:\Program Files\Android\Android Studio\jbr` (ou use o script `adcapital-react/scripts/fix-android-env.ps1` como Administrador)

### Emulador: driver AEHD

Se aparecer *"Android Emulator hypervisor driver is not installed"*:

1. SDK Manager → SDK Tools → **Android Emulator hypervisor driver (installer)**
2. Ou execute como Admin: `%LOCALAPPDATA%\Android\Sdk\extras\google\Android_Emulator_Hypervisor_Driver\silent_install.bat`
3. Reinicie o PC e inicie o emulador de novo no Device Manager

**Alternativa:** celular com **Depuração USB** (não precisa de emulador).
4. **Emulador (opcional):** ver seção [AEHD no Windows](#aehd-no-windows) abaixo — **celular físico** é o caminho mais rápido se o driver falhar

## AEHD no Windows (erro 1061 / 1072 / 1058)

Se o instalador do **Android Emulator Hypervisor Driver** mostrar:

- `ControlService FAILED 1061`
- `DeleteService FAILED 1072` (serviço marcado para exclusão)
- `StartService FAILED 1058` (serviço desabilitado)

Faça **nesta ordem**:

1. **Reinicie o Windows** (obrigatório após erro 1072).
2. **Recursos do Windows** (`optionalfeatures.exe`) — ative:
   - Plataforma de Hypervisor do Windows
   - Plataforma de Máquina Virtual
   - (Se existir e você usa emulador) Hyper-V
3. Reinicie de novo.
4. Abra o **Android Studio como Administrador**.
5. **SDK Manager → SDK Tools** → marque **Android Emulator Hypervisor Driver** → Apply.
6. No **Device Manager**, use **Reinstall AEHD** ou crie um AVD novo (Pixel 7, API 34).

Se ainda falhar, **use o celular** (recomendado):

1. No Android: **Configurações → Sobre o telefone** → toque 7× em “Número da compilação”.
2. **Opções do desenvolvedor** → ative **Depuração USB**.
3. Conecte o cabo USB; aceite “Permitir depuração”.
4. No PC: `adb devices` (deve listar o aparelho).
5. No Android Studio, escolha o **dispositivo físico** no seletor ao lado de Run ▶.

## Erro comum: `getDefaultProguardFile`

Se o Gradle falhar na linha `proguardFiles getDefaultProguardFile(...)` com AGP 9.x:

1. Atualize o projeto (`git pull` na pasta `developer`).
2. Confirme que `android/app/build.gradle` **não** tem mais a linha `proguardFiles getDefaultProguardFile`.
3. Clique **Sync Now** (banner amarelo) ou **File → Sync Project with Gradle Files**.
4. **Build → Rebuild Project**.

## Configuração do projeto

| Item | Valor |
|------|--------|
| App ID | `br.com.adcapitaligreja.sistema` |
| Pasta web | `adcapital-react/dist` |
| API produção | `VITE_API_URL=https://api.adcapitaligreja.com.br/api/v1` |

## APK com atualização automática (recomendado)

Por padrão o app **não embute** o React no APK. Ele abre o site em produção:

`https://sistema.adcapitaligreja.com.br`

| Canal | Atualiza o front quando… |
|-------|-------------------------|
| Navegador (sistema + site) | Você faz deploy no Render |
| **APK (modo live)** | **Mesmo deploy** — sem novo APK |
| APK (modo bundle) | Só ao gerar e redistribuir outro APK |

Fluxo enquanto monta o projeto:

1. Altera o React → commit → push → Render publica.
2. No celular: abre o APK ou o Chrome — **mesma versão**.
3. Só gere APK de novo se mudar ícone nativo, permissões ou plugins Capacitor.

```powershell
npm install
npm run cap:sync          # aplica capacitor.config.ts (modo live)
npm run cap:android       # Run no Studio → instalar APK uma vez
```

Modo **bundle** (front fixo dentro do APK — raramente necessário):

```powershell
npm run cap:sync:bundle
```

## Comandos (na pasta `adcapital-react/`)

```powershell
npm run cap:sync
npm run cap:android
npm run cap:run:android
npm run cap:devices
```

## Build para Play Store (AAB)

No Android Studio:

1. **Build → Generate Signed Bundle / APK**
2. Escolha **Android App Bundle (AAB)**
3. Crie/use keystore (guarde senha em local seguro — **não commitar**)
4. Release → assinar → `app-release.aab`

Envie o AAB no [Google Play Console](https://play.google.com/console) (teste interno primeiro).

## Variáveis de build

O comando `npm run build:mobile` **sempre** aponta para `https://api.adcapitaligreja.com.br/api/v1` (não usa o `127.0.0.1` do seu `.env` local).

| Onde roda | URL da API no build |
|-----------|---------------------|
| Site (Render) | `VITE_API_URL` do painel Render |
| Android (`build:mobile`) | Produção (fixo no script) |

**Erro comum:** build com `127.0.0.1` no APK → no emulador aparece *“Servidor iniciando…”* eterno e *“Erro de conexão”* no login, porque o emulador não alcança o Django no seu PC.

Depois de corrigir: `npm run cap:sync` e **Run** de novo no Studio.

API local no emulador (opcional): `http://10.0.2.2:8000/api/v1` — nunca `127.0.0.1`.

## CORS

A API já aceita origens Capacitor (`https://localhost`, `http://localhost`). JWT funciona igual ao site.

## PWA no navegador (cache e “instalar app”)

- O **APK em modo live não usa** service worker — evita cache duplo.
- No **Chrome**, o `sw.js` foi ajustado para **rede primeiro** em páginas e JS (menos tela antiga após deploy).
- Depois de um deploy: **Ctrl+Shift+R** ou fechar todas as abas do site.
- O banner “Instalar app” **não aparece sempre** (regra do Chrome/iOS). Alternativas:
  - Menu ⋮ → **Instalar aplicativo** / **Adicionar à tela inicial**
  - iPhone Safari → Compartilhar → **Adicionar à Tela de Início**
- Requisitos: HTTPS, `manifest.json`, uso repetido do site.

**Site público** (`adcapitaligreja.com.br`) e **sistema** (`sistema.adcapitaligreja.com.br`) usam o mesmo front; o APK live abre o sistema e segue os links entre domínios permitidos no `capacitor.config.ts`.

## Problemas comuns

| Sintoma | Solução |
|---------|---------|
| `No target device found` | Device Manager → Play no emulador ou USB com depuração |
| `getDefaultProguardFile` / build falha | `app/build.gradle`: em `release`, só `minifyEnabled false` (sem `proguardFiles`) |
| `_JAVA_OPTIONS` detectado | Apagar variável User e Machine; reiniciar Android Studio |
| `JAVA_HOME is not set` | `gradle.properties` já aponta para o JBR do Studio; ou definir `JAVA_HOME` |
| Gradle sync / AGP 8.13 | **File → Sync Project with Gradle Files** |
| Emulador "Booting" infinito | Instalar AEHD (acima) ou usar celular USB |
| **Gradle build cancelled** | Não rode `cap:run` e **Run** do Studio ao mesmo tempo. Pare o terminal (Ctrl+C), **Sync** no Studio, depois só **Run ▶** |
| **System UI isn't responding** | Emulador sobrecarregado: feche o 2º emulador; Device Manager → **Cold Boot Now** no Pixel 7; ou **Wipe Data** |
| App não aparece na gaveta | Build não terminou — ícone: **AD Capital** (`app_name` em `strings.xml`) |

### Fluxo recomendado (evita cancelar o Gradle)

1. **Um** emulador ligado (ex.: Pixel 7).
2. Terminal: `npm run cap:sync` (só copia o build web).
3. Android Studio: **File → Sync Project with Gradle Files** (banner amarelo).
4. **Run ▶** (app + Pixel 7) — **não** use `cap:run` ao mesmo tempo.

Alternativa só no terminal (emulador Pixel 7):

```powershell
npm run cap:run:android
```

Lista dispositivos: `npm run cap:devices`

### `_JAVA_OPTIONS` (importante)

Se o log mostrar `Picked up _JAVA_OPTIONS`, o Gradle pode falhar ou travar:

```powershell
# Como Administrador, na pasta adcapital-react:
powershell -ExecutionPolicy Bypass -File scripts\fix-android-env.ps1
```

Feche e reabra o Android Studio e o terminal depois disso.

## Rollback

O app Android é independente do deploy web. Para voltar versão anterior, publique outro AAB na Play Store ou reinstale build antigo.

## Próximo (opcional)

- Push notifications (Firebase + endpoint Django)
- Ícones adaptativos dedicados (mipmap em `android/app/src/main/res`)
