import { useState, useCallback } from 'react';

export function useConfirm() {
  const [state, setState] = useState({ open: false, title: '', message: '', onConfirm: null });

  const ask = useCallback((title, message, onConfirm) => {
    setState({ open: true, title, message, onConfirm });
  }, []);

  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false, onConfirm: null }));
  }, []);

  const confirm = useCallback(() => {
    state.onConfirm?.();
    close();
  }, [state.onConfirm, close]);

  return { confirmState: state, ask, close, confirm };
}
