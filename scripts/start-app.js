const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BUILD_MARKER = path.join(ROOT, 'build', 'index.html');

// require('electron') poza procesem Electron zwraca ścieżkę do .exe
let ELECTRON_BIN;
try {
  ELECTRON_BIN = require('electron');
} catch (_) {
  ELECTRON_BIN = path.join(ROOT, 'node_modules', 'electron', 'dist', 'electron.exe');
}

function newestMtime(dir, maxMs = 0) {
  if (!fs.existsSync(dir)) return maxMs;
  let latest = maxMs;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name === 'build' || entry.name === '.git') continue;
    try {
      if (entry.isDirectory()) latest = Math.max(latest, newestMtime(full, latest));
      else latest = Math.max(latest, fs.statSync(full).mtimeMs);
    } catch (_) { /* ignore */ }
  }
  return latest;
}

function needsBuild() {
  if (process.env.AWIZAXJA_FORCE_BUILD === '1') return true;
  if (!fs.existsSync(BUILD_MARKER)) {
    console.log('Brak folderu build/ — wymagany build.');
    return true;
  }
  try {
    const buildTime = fs.statSync(BUILD_MARKER).mtimeMs;
    if (newestMtime(path.join(ROOT, 'src')) > buildTime) {
      console.log('Wykryto zmiany w src/ — rebuild…');
      return true;
    }
  } catch (_) {
    return true;
  }
  console.log('Build aktualny — pomijam kompilację.');
  return false;
}

if (needsBuild()) {
  console.log('Budowanie interfejsu (to może potrwać ~20–60 s)…');
  const build = spawnSync('npm run build', {
    shell: true,
    stdio: 'inherit',
    cwd: ROOT,
    env: { ...process.env, NODE_ENV: 'production' }
  });
  if (build.status !== 0) {
    console.error('Build nie powiódł się. Spróbuj: npm run build');
    process.exit(build.status || 1);
  }
}

if (!ELECTRON_BIN || !fs.existsSync(ELECTRON_BIN)) {
  console.error('Nie znaleziono Electron. Uruchom: npm install');
  process.exit(1);
}

console.log('');
console.log('>>> Otwieram Grain Logistics…');
console.log('>>> Jeśli okno nie widać — sprawdź pasek zadań Windows.');
console.log('');

const child = spawn(ELECTRON_BIN, ['.'], {
  cwd: ROOT,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' },
  detached: false,
  windowsHide: false
});

child.on('error', (err) => {
  console.error('Błąd uruchomienia:', err.message);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) console.log('Aplikacja zakończona sygnałem:', signal);
  process.exit(code ?? 0);
});
