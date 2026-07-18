/**
 * Kopiuje ikonę do folderu assets (wymagane przez electron-builder).
 * Uruchamiane przed pack/dist jeśli assets nie istnieją.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const assetsDir = path.join(root, 'assets');
const sources = [
  path.join(root, 'assets', 'icon.png'),
  path.join(root, 'public', 'icon.png')
];

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const target = path.join(assetsDir, 'icon.png');
if (!fs.existsSync(target)) {
  const src = sources.find((p) => fs.existsSync(p) && p !== target);
  if (src) {
    fs.copyFileSync(src, target);
    console.log('Skopiowano ikonę do assets/icon.png');
  } else {
    console.warn('Brak assets/icon.png – electron-builder użyje domyślnej ikony Electron.');
  }
} else {
  console.log('assets/icon.png już istnieje.');
}
