import { useEffect } from 'react';
import { useSettingsStore } from '../store/settings';

export function useReducedMotion(): void {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-motion', reduceMotion ? 'reduced' : 'normal');
  }, [reduceMotion]);
}
