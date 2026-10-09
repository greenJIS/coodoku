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
      className="z-60 text-center"
    >
      <h2 className="mb-2 text-[29px] text-ink-900">Change to {diffName}?</h2>
      <p className="mb-6 text-[17px] text-slate-500">
        Start a new game? Current puzzle progress will be lost.
      </p>

      <div
        className="
          flex flex-col items-center justify-center gap-3
          sm:flex-row
        "
      >
        <StickerButton
          variant="soft"
          size="md"
          onClick={handleCancel}
          className="
            w-full
            sm:w-auto
          "
        >
          Keep playing
        </StickerButton>

        <StickerButton
          variant="primary"
          size="md"
          onClick={handleConfirm}
          className="
            w-full
            sm:w-auto
          "
        >
          New game
        </StickerButton>
      </div>
    </Modal>
  );
}
