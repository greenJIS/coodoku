import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/game';
import { StickerButton } from '../ui';
import { Modal } from './Modal';

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
      className="text-center"
    >
      <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-900 mb-2">
        Paused
      </h2>
      <p className="text-slate-500 font-bold text-sm mb-6">
        Your board is hidden until you're back.
      </p>

      <div className="flex flex-col gap-3 min-w-[200px] w-full">
        <StickerButton
          variant="primary"
          size="lg"
          onClick={handleResume}
          aria-label="Resume game"
        >
          Play
        </StickerButton>

        <StickerButton
          variant="soft"
          size="md"
          armed={armedAction === 'reset'}
          onClick={handleReset}
          aria-label={
            armedAction === 'reset' ? 'Confirm reset puzzle' : 'Reset puzzle'
          }
        >
          {armedAction === 'reset' ? 'Tap again to reset' : 'Reset puzzle'}
        </StickerButton>

        <StickerButton
          variant="soft"
          size="md"
          armed={armedAction === 'new'}
          onClick={handleNewGame}
          aria-label={armedAction === 'new' ? 'Confirm new game' : 'New game'}
        >
          {armedAction === 'new' ? 'Tap again to confirm' : 'New game'}
        </StickerButton>
      </div>
    </Modal>
  );
}
