const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const logo = path.join(root, 'public', 'logo.png');
const assetsDir = path.join(root, 'assets');
const icon = path.join(assetsDir, 'icon.png');

if (!fs.existsSync(logo)) {
  console.error('public/logo.png nao encontrado.');
  process.exit(1);
}

fs.mkdirSync(assetsDir, { recursive: true });
fs.copyFileSync(logo, icon);
console.log('[icons] assets/icon.png atualizado a partir de public/logo.png');
