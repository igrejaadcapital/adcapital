# iPhone / iOS — AD Capital

## Situação atual (jun/2026)

| Plataforma | Status | Como o usuário acessa |
|------------|--------|------------------------|
| **Android** | App nativo (Capacitor APK) | Instala o APK — funciona |
| **iPhone (iOS)** | **Sem app na App Store** | Navegador Safari ou PWA na tela inicial |

O repositório tem pasta `android/` e `@capacitor/android`, mas **não há** pasta `ios/` nem build publicado para Apple. Por isso usuários de iPhone **não conseguem instalar o mesmo APK** que funciona no Android — o APK é exclusivo do Android.

## Solução imediata (sem Mac, sem App Store)

Oriente membros com iPhone a usar o **site no Safari**:

```
https://sistema.adcapitaligreja.com.br/login
```

### Instalar na Tela de Início (PWA)

1. Abra o link acima no **Safari** (não no Chrome/Firefox do iPhone).
2. Toque em **Compartilhar** (ícone de quadrado com seta).
3. Escolha **Adicionar à Tela de Início**.
4. Confirme o nome **AD Capital** → **Adicionar**.

O ícone na tela inicial abre o sistema em modo quase-app (sem barra do Safari).

**Limitações da PWA no iOS:** Apple restringe alguns recursos (notificações push, armazenamento em segundo plano). Para login e uso pastoral, o fluxo web cobre o dia a dia.

## App nativo iOS (futuro)

Para publicar na **App Store** ou distribuir via **TestFlight**:

| Requisito | Detalhe |
|-----------|---------|
| Hardware | **Mac** com Xcode 15+ |
| Conta | Apple Developer Program (**US$ 99/ano**) |
| Projeto | `npm install @capacitor/ios` + `npx cap add ios` na pasta `adcapital-react` |
| Build | Xcode → Archive → App Store Connect |
| Modo live | Igual ao Android: WebView apontando para `https://sistema.adcapitaligreja.com.br` (atualiza com deploy Render) |

**Não é possível gerar o IPA apenas no Windows** — o build iOS exige Xcode no macOS.

### Passos técnicos (quando houver Mac)

```bash
cd adcapital-react
npm install @capacitor/ios
npx cap add ios
npx cap sync ios
npx cap open ios
```

No Xcode: configurar **Signing & Capabilities** com o Team da igreja, Bundle ID `br.com.adcapitaligreja.sistema` (mesmo do Android).

## O que já está preparado no front

- `index.html`: meta `apple-mobile-web-app-capable`
- `manifest.json`: ícones e tema
- Cookies JWT com domínio `.adcapitaligreja.com.br` (login entre `sistema` e `api`)
- Capacitor **live** no Android — o mesmo padrão serve para iOS quando o projeto `ios/` existir

## Comunicação sugerida à igreja

> No iPhone, use o Safari em **sistema.adcapitaligreja.com.br** e adicione à Tela de Início. O aplicativo Android (APK) não instala no iPhone. Estamos avaliando versão na App Store quando houver Mac e conta Apple Developer.

## Referências

- [MOBILE-ANDROID.md](./MOBILE-ANDROID.md) — APK Android
- [Capacitor iOS](https://capacitorjs.com/docs/ios)
