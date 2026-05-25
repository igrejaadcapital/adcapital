/**
 * Alterna capacitor.config.json entre live (site em produção) e bundle (dist no APK).
 * Uso: node scripts/cap-config-mode.cjs live|bundle
 */
const fs = require('fs');
const path = require('path');

const mode = process.argv[2];
const root = path.join(__dirname, '..');
const target = path.join(root, 'capacitor.config.json');

if (mode !== 'live' && mode !== 'bundle') {
  console.error('Uso: node scripts/cap-config-mode.cjs live|bundle');
  process.exit(1);
}

const source = path.join(root, mode === 'bundle' ? 'capacitor.config.bundle.json' : 'capacitor.config.live.json');
fs.copyFileSync(source, target);
console.log(
  mode === 'bundle'
    ? '[cap-config] Modo bundle — front embutido no APK'
    : '[cap-config] Modo live — APK abre https://sistema.adcapitaligreja.com.br'
);
