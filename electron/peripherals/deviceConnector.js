const net = require('net');

function testTcpConnection(host, port, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    if (!host || !port) {
      reject(new Error('Uzupełnij adres IP i port'));
      return;
    }
    const socket = new net.Socket();
    const timer = setTimeout(() => {
      try { socket.destroy(); } catch (_) { /* ignore */ }
      reject(new Error('Timeout połączenia'));
    }, timeoutMs);
    socket.connect(Number(port), host, () => {
      clearTimeout(timer);
      socket.end();
      resolve();
    });
    socket.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function parseNumericFrame(raw, frameFormat = 'GENERIC') {
  const text = String(raw || '').trim();
  if (!text) return null;

  if (frameFormat === 'RADWAG') {
    const m = text.match(/([+-]?\d+[.,]\d+)\s*(kg|t|g)?/i);
    if (m) return { value: parseFloat(m[1].replace(',', '.')), unit: (m[2] || 'kg').toLowerCase(), stable: /ST/i.test(text) };
  }
  if (frameFormat === 'SART') {
    const m = text.match(/([+-]?\d+[.,]\d+)/);
    if (m) return { value: parseFloat(m[1].replace(',', '.')), unit: 'kg', stable: true };
  }

  const generic = text.match(/([+-]?\d+[.,]\d+|\d+)/);
  if (!generic) return null;
  return { value: parseFloat(generic[1].replace(',', '.')), unit: 'kg', stable: true };
}

function parseLabFrame(raw) {
  const text = String(raw || '').trim();
  if (!text) return null;

  const moisture = text.match(/(?:wilg|moist|H2O)[:\s=]*([+-]?\d+[.,]?\d*)/i);
  if (moisture) {
    return { parameter: 'wilgotnosc', value: moisture[1].replace(',', '.'), unit: '%' };
  }
  const temp = text.match(/(?:temp|°C)[:\s=]*([+-]?\d+[.,]?\d*)/i);
  if (temp) {
    return { parameter: 'temperatura', value: temp[1].replace(',', '.'), unit: '°C' };
  }
  const num = text.match(/([+-]?\d+[.,]\d+)/);
  if (num) {
    return { parameter: 'wartosc', value: num[1].replace(',', '.'), unit: '' };
  }
  return null;
}

class TcpDeviceSession {
  constructor({ host, port, onFrame, reconnectMs = 5000 }) {
    this.host = host;
    this.port = Number(port);
    this.onFrame = onFrame;
    this.reconnectMs = reconnectMs;
    this.socket = null;
    this.buffer = '';
    this.stopped = false;
    this.reconnectTimer = null;
  }

  start() {
    this.stopped = false;
    return new Promise((resolve, reject) => {
      this.socket = new net.Socket();
      this.socket.setEncoding('utf8');

      this.socket.connect(this.port, this.host, () => {
        resolve(true);
      });

      this.socket.on('data', (chunk) => {
        this.buffer += chunk;
        const parts = this.buffer.split(/\r?\n/);
        this.buffer = parts.pop() || '';
        parts.forEach((line) => {
          const trimmed = line.trim();
          if (trimmed && this.onFrame) this.onFrame(trimmed);
        });
      });

      this.socket.on('error', (err) => {
        if (!this.stopped) reject(err);
      });

      this.socket.on('close', () => {
        if (!this.stopped) {
          this.reconnectTimer = setTimeout(() => {
            this.start().catch(() => { /* reconnect silently */ });
          }, this.reconnectMs);
        }
      });
    });
  }

  stop() {
    this.stopped = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      try { this.socket.destroy(); } catch (_) { /* ignore */ }
      this.socket = null;
    }
  }

  isActive() {
    return Boolean(this.socket && !this.socket.destroyed);
  }
}

async function readTcpOnce(host, port, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let data = '';
    const timer = setTimeout(() => {
      try { socket.destroy(); } catch (_) { /* ignore */ }
      reject(new Error('Timeout odczytu'));
    }, timeoutMs);

    socket.setEncoding('utf8');
    socket.connect(Number(port), host, () => {
      socket.write('\r\n');
    });

    socket.on('data', (chunk) => {
      data += chunk;
      if (data.includes('\n') || data.length > 128) {
        clearTimeout(timer);
        socket.end();
        resolve(data.trim());
      }
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    socket.on('close', () => {
      clearTimeout(timer);
      if (data) resolve(data.trim());
      else reject(new Error('Brak danych z urządzenia'));
    });
  });
}

module.exports = {
  testTcpConnection,
  parseNumericFrame,
  parseLabFrame,
  TcpDeviceSession,
  readTcpOnce
};
