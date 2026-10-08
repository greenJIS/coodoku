import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/game';
import { CARD_BUTTON, CARD_CLASS, Modal } from './Modal';

const PAUSE_BUTTON = `w-full ${CARD_BUTTON}`;
const SOFT = 'bg-hairline text-ink-900';
const ARMED =
  'bg-[#fde2e7] text-[#be123c] dark:bg-[#4a1f2b] dark:text-[#ff8aa5]';

export interface PauseModalProps {
  open: boolean;
  onClose: () => void;
}

export function PauseModal({ open, onClose }: PauseModalProps) {
  const [armedAction, setArmedAction] = useState<'reset' | 'new' | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseBtnRef = useRef<HTMLElement | null>(null);

  const retry = useGameStore((s) => s.retry);
  const newGame = useGameStore((s) => s.newGame);
  const setPaused = useGameStore((s) => s.setPaused);

  useEffect(() => {
    if (open) {
      pauseBtnRef.current = document.getElementById('pauseBtn');
      setArmedAction(null);
    }
  }, [open]);

  const armAction = (action: 'reset' | 'new') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setArmedAction(action);
    timerRef.current = setTimeout(() => {
      setArmedAction(null);
    }, 3000);
  };

  const handleResume = () => {
    setPaused(false);
    onClose();
  };

  const handleReset = () => {
    if (armedAction === 'reset') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setArmedAction(null);
      retry();
      setPaused(false);
      onClose();
    } else {
      armAction('reset');
    }
  };

  const handleNewGame = () => {
    if (armedAction === 'new') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setArmedAction(null);
      void newGame();
      setPaused(false);
      onClose();
    } else {
      armAction('new');
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleResume}
      originRef={pauseBtnRef}
      label="Paused game"
      backdropClassName="bg-[#1c1b1a]/90 backdrop-blur-[16px]"
      className={CARD_CLASS}
    >
      <h2 className="text-[34px] text-ink-900 mb-1.5">Paused</h2>
      <p className="text-slate-500 mb-4">
        Your board is hidden until you're back.
      </p>

      <div className="flex flex-col gap-2.5 min-w-[230px] w-full">
        <button
          type="button"
          onClick={handleResume}
          aria-label="Resume game"
          className={`${PAUSE_BUTTON} bg-brand-500 text-brand-900`}
        >
          Play
        </button>

        <button
          type="button"
          onClick={handleReset}
          aria-label={
            armedAction === 'reset' ? 'Confirm reset puzzle' : 'Reset puzzle'
          }
          className={`${PAUSE_BUTTON} ${armedAction === 'reset' ? ARMED : SOFT}`}
        >
          {armedAction === 'reset' ? 'Tap again to reset' : 'Reset puzzle'}
        </button>

        <button
          type="button"
          onClick={handleNewGame}
          aria-label={armedAction === 'new' ? 'Confirm new game' : 'New game'}
          className={`${PAUSE_BUTTON} ${armedAction === 'new' ? ARMED : SOFT}`}
        >
          {armedAction === 'new' ? 'Tap again to confirm' : 'New game'}
        </button>
      </div>
    </Modal>
  );
}
