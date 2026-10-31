import { useEffect } from 'react';
import { useGameStore } from '../store/game';
import { useViewStore } from '../store/view';

export function useGameTimer(): void {
  useEffect(() => {
    let lastTime = performance.now();

    const intervalId = setInterval(() => {
      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;

      const { game, paused } = useGameStore.getState();
      if (
        paused ||
        !game ||
        game.status !== 'playing' ||
        document.hidden ||
        useViewStore.getState().view !== 'game'
      ) {
        return;
      }

      useGameStore.getState().tick(delta);
    }, 250);

    // Leaving the tab or window pauses the game, so the Pause modal is
    // waiting on return.
    const autoPause = () => {
      const { game, setPaused } = useGameStore.getState();
      if (
        game?.status === 'playing' &&
        useViewStore.getState().view === 'game'
      ) {
        setPaused(true);
      }
    };

    const onVisibilityChange = () => {
      lastTime = performance.now();
      if (document.hidden) autoPause();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', autoPause);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', autoPause);
    };
  }, []);
}
