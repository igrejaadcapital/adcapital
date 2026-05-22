# App Android — AD Capital (Capacitor)

## Pré-requisitos (Windows)

1. [Node.js](https://nodejs.org/) 20+
2. [Android Studio](https://developer.android.com/studio) (SDK 34+, build-tools)
3. Variável `ANDROID_HOME` configurada (Studio → SDK Manager)
4. **Emulador:** instale o driver **AEHD** (Android Emulator Hypervisor Driver) se o aviso aparecer no Device Manager — ou use celular físico com USB debugging

## Erro comum: `getDefaultProguardFile`

Se o Gradle falhar na linha `proguardFiles getDefaultProguardFile(...)` com AGP 9.x, o projeto já está configurado com `minifyEnabled false` **sem** ProGuard. Faça **File → Sync Project with Gradle Files** e **Build → Rebuild Project**.

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
