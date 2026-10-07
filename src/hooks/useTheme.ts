import { useEffect } from 'react';
import { useSettingsStore } from '../store/settings';

export function useTheme(): void {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);
}
