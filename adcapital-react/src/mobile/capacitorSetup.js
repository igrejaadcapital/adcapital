import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

export function isNativeApp() {
  return Capacitor.isNativePlatform();
}

export async function initCapacitor() {
  if (!isNativeApp()) {
    return;
  }

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0f172a' });
  } catch (err) {
    console.warn('[Capacitor] StatusBar:', err);
  }

  try {
    await SplashScreen.hide();
  } catch (err) {
    console.warn('[Capacitor] SplashScreen:', err);
  }
}
