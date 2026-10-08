import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/game';
import { useViewStore } from '../store/view';

export const SHOW_AFTER_MS = 150;
export const MIN_MS = 600;
export const FADE_MS = 240;

type Phase = 'hidden' | 'shown' | 'leaving';

export interface LoadingGate {
  show: boolean;
  leaving: boolean;
}

/**
 * Owns the Loading overlay. It shows immediately at launch, and during puzzle
 * generation only after SHOW_AFTER_MS (a prefetch hit never flashes it). Once
 * shown it stays for MIN_MS, then fades for FADE_MS. All state changes happen
 * in timer callbacks.
 */
export function useLoadingGate(): LoadingGate {
  const launching = useViewStore((s) => s.view === 'loading');
  const generating = useGameStore((s) => s.generating);
  const busy = launching || generating;

  const [phase, setPhase] = useState<Phase>(() =>
    useViewStore.getState().view === 'loading' ? 'shown' : 'hidden',
  );
  const shownAt = useRef(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const show = () => {
      shownAt.current = Date.now();
      setPhase('shown');
    };

    if (phase === 'shown' && shownAt.current === 0) {
      shownAt.current = Date.now(); // launch: shown from the first render
    }

    if (busy) {
      if (phase === 'hidden') {
        timers.push(setTimeout(show, SHOW_AFTER_MS));
      } else if (phase === 'leaving') {
        timers.push(setTimeout(show, 0));
      }
    } else if (phase === 'shown') {
      const wait = Math.max(0, MIN_MS - (Date.now() - shownAt.current));
      timers.push(setTimeout(() => setPhase('leaving'), wait));
    } else if (phase === 'leaving') {
      timers.push(setTimeout(() => setPhase('hidden'), FADE_MS));
    }

    return () => timers.forEach(clearTimeout);
  }, [busy, phase]);

  return { show: phase !== 'hidden', leaving: phase === 'leaving' };
}
