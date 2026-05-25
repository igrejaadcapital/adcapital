import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

export function isNativeApp() {
  return Capacitor.isNativePlatform();
}

export async function initCapacitor() {
  if (!isNativeApp()) {
    return;
  }

  document.documentElement.classList.add('capacitor-native');

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0f172a' });
    // Android 14 e anteriores: evita conteúdo sob a status bar
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (err) {
    console.warn('[Capacitor] StatusBar:', err);
  }

  try {
    await SplashScreen.hide();
  } catch (err) {
    console.warn('[Capacitor] SplashScreen:', err);
  }

  try {
    App.addListener('backButton', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        App.minimizeApp();
      }
    });
  } catch (err) {
    console.warn('[Capacitor] App backButton:', err);
  }
}
