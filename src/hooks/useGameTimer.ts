import { useEffect } from 'react';
import { useGameStore } from '../store/game';

export function useGameTimer(): void {
  useEffect(() => {
    let lastTime = performance.now();

    const intervalId = setInterval(() => {
      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;

      const { game, paused } = useGameStore.getState();
      if (paused || !game || game.status !== 'playing' || document.hidden) {
        return;
      }

      useGameStore.getState().tick(delta);
    }, 250);

    const onVisibilityChange = () => {
      lastTime = performance.now();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);
}
