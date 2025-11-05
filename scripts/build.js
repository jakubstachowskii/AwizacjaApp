const { spawn } = require('child_process');

// Uruchamiamy przez powłokę, aby poprawnie działało na Windows (cmd /c)
const build = spawn('npx react-scripts build', {
  shell: true,
  env: process.env,
});

let outBuf = '';
let errBuf = '';

const filterOut = (chunk) => {
  const text = chunk.toString();
  const lines = text.split(/\r?\n/);
  const filtered = lines.filter((line) =>
    line.trim().length &&
    !/cra\.link\/deployment/i.test(line) &&
    !/Find out more about deployment here:/i.test(line)
  );
  return filtered.join('\n');
};

// Buforujemy stdout (nie pokazujemy na żywo), by przy sukcesie wypisać tylko krótką informację
build.stdout.on('data', (data) => {
  outBuf += filterOut(data) + '\n';
});

// Buforujemy stderr, pokażemy tylko gdy build się nie powiedzie
build.stderr.on('data', (data) => {
  errBuf += data.toString();
});

build.on('close', (code) => {
  if (code === 0) {
    console.log('Build zakończony pomyślnie. Folder build jest gotowy.');
  } else {
    // Przy błędzie pokaż pełny log, aby ułatwić diagnostykę
    if (outBuf.trim()) {
      process.stdout.write(outBuf + '\n');
    }
    if (errBuf.trim()) {
      process.stderr.write(errBuf + '\n');
    }
    process.exit(code);
  }
});


