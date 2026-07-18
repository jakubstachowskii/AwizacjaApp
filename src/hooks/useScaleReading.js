import { useCallback, useEffect, useRef, useState } from 'react';

export default function useScaleReading({ autoStart = true, pollMs = 2000 } = {}) {
  const [reading, setReading] = useState(null);
  const [status, setStatus] = useState({ connected: false, mode: 'mock' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const startedRef = useRef(false);

  const refreshStatus = useCallback(async () => {
    if (!window.electronAPI?.scaleGetStatus) return;
    try {
      const s = await window.electronAPI.scaleGetStatus();
      setStatus(s || { connected: false, mode: 'mock' });
      if (s?.latest) setReading(s.latest);
    } catch (_) { /* ignore */ }
  }, []);

  const start = useCallback(async () => {
    if (!window.electronAPI?.scaleStart) return false;
    setLoading(true);
    setError(null);
    try {
      await window.electronAPI.scaleStart();
      startedRef.current = true;
      await refreshStatus();
      return true;
    } catch (err) {
      setError(err.message || 'Błąd uruchomienia wagi');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshStatus]);

  const stop = useCallback(async () => {
    if (window.electronAPI?.scaleStop) await window.electronAPI.scaleStop();
    startedRef.current = false;
    await refreshStatus();
  }, [refreshStatus]);

  const readOnce = useCallback(async () => {
    if (!window.electronAPI?.scaleGetLatest) return null;
    setLoading(true);
    setError(null);
    try {
      const latest = await window.electronAPI.scaleGetLatest();
      if (latest) setReading(latest);
      return latest;
    } catch (err) {
      setError(err.message || 'Błąd odczytu');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (autoStart && !startedRef.current) await start();
      else await refreshStatus();
    };
    init();
    return () => {
      mounted = false;
      if (startedRef.current && window.electronAPI?.scaleStop) {
        window.electronAPI.scaleStop();
        startedRef.current = false;
      }
    };
  }, [autoStart, start, refreshStatus]);

  useEffect(() => {
    if (!pollMs) return undefined;
    const id = setInterval(() => {
      if (window.electronAPI?.scaleGetLatest) {
        window.electronAPI.scaleGetLatest().then((r) => { if (r) setReading(r); }).catch(() => {});
      }
    }, pollMs);
    return () => clearInterval(id);
  }, [pollMs]);

  return { reading, status, loading, error, start, stop, readOnce, refreshStatus };
}
