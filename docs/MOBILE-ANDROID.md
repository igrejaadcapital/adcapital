# App Android — AD Capital (Capacitor)

## Pré-requisitos (Windows)

1. [Node.js](https://nodejs.org/) 20+
2. [Android Studio](https://developer.android.com/studio) (SDK 34+, build-tools)
3. Variável `ANDROID_HOME` configurada (Studio → SDK Manager)
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

## Comandos (na pasta `adcapital-react/`)

```powershell
# Instalar dependências (se ainda não fez)
npm install

# Build web + copiar para Android
npm run cap:sync

# Abrir Android Studio
npm run cap:android

# Ou rodar direto no emulador/dispositivo
npm run cap:run:android
```

## Build para Play Store (AAB)

No Android Studio:

1. **Build → Generate Signed Bundle / APK**
2. Escolha **Android App Bundle (AAB)**
3. Crie/use keystore (guarde senha em local seguro — **não commitar**)
4. Release → assinar → `app-release.aab`

Envie o AAB no [Google Play Console](https://play.google.com/console) (teste interno primeiro).

## Variáveis de build

Crie `adcapital-react/.env.production` local (não commitar secrets):

```env
VITE_API_URL=https://api.adcapitaligreja.com.br/api/v1
VITE_GA_MEASUREMENT_ID=G-7KZ3C5J6TH
```

O Render já define `VITE_API_URL` para o site; o app Android usa o valor **no momento do `npm run build`**.

## CORS

A API já aceita origens Capacitor (`https://localhost`, `http://localhost`). JWT funciona igual ao site.

## Rollback

O app Android é independente do deploy web. Para voltar versão anterior, publique outro AAB na Play Store ou reinstale build antigo.

## Próximo (opcional)

- Push notifications (Firebase + endpoint Django)
- Ícones adaptativos dedicados (mipmap em `android/app/src/main/res`)
