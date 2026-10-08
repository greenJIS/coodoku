import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/game';
import { StickerButton } from '../ui';
import { Modal } from './Modal';

export interface ConfirmDifficultyModalProps {
  open: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function ConfirmDifficultyModal({
  open,
  onConfirm,
  onCancel,
}: ConfirmDifficultyModalProps) {
  const pendingDifficulty = useGameStore((s) => s.pendingDifficulty);
  const confirmDifficulty = useGameStore((s) => s.confirmDifficulty);
  const cancelDifficulty = useGameStore((s) => s.cancelDifficulty);

  const originRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      originRef.current =
        document.getElementById('difficultySelector') ??
        document.getElementById('modes');
    }
  }, [open]);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      cancelDifficulty();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      confirmDifficulty();
    }
  };

  const diffName = pendingDifficulty
    ? pendingDifficulty.charAt(0).toUpperCase() + pendingDifficulty.slice(1)
    : '';

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      originRef={originRef}
      label="Confirm difficulty change"
      className="text-center z-60"
    >
      <h2 className="text-[29px] text-ink-900 mb-2">Change to {diffName}?</h2>
      <p className="text-slate-500 text-[17px] mb-6">
        Start a new game? Current puzzle progress will be lost.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <StickerButton
          variant="soft"
          size="md"
          onClick={handleCancel}
          className="w-full sm:w-auto"
        >
          Keep playing
        </StickerButton>

        <StickerButton
          variant="primary"
          size="md"
          onClick={handleConfirm}
          className="w-full sm:w-auto"
        >
          New game
        </StickerButton>
      </div>
    </Modal>
  );
}
