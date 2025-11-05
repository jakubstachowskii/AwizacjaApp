import { useEffect, useState } from 'react';

// Prosty polling wagi — zwraca ostatni odczyt (kg) i timestamp
export default function useScaleAutoImport(intervalMs = 3000) {
  const [reading, setReading] = useState(null);

  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      try {
        const r = await window.electronAPI.scaleGetLatest();
        if (mounted && r) setReading({ valueKg: r.value, at: new Date() });
      } catch (e) {
        // ciche błędy (waga może być tymczasowo niedostępna)
      }
    };
    poll();
    const id = setInterval(poll, intervalMs);
    return () => { mounted = false; clearInterval(id); };
  }, [intervalMs]);

  return reading;
}


