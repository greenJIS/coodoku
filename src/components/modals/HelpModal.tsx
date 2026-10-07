import { CloseIcon } from '../icons';
import { IconButton } from '../ui';
import { Modal } from './Modal';

export interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      label="Help and Rules"
      className="relative text-left"
    >
      <div className="absolute top-4 right-4">
        <IconButton
          icon={<CloseIcon size={16} />}
          size="sm"
          variant="close"
          label="Close help"
          onClick={onClose}
        />
      </div>

      <h2 className="text-xl sm:text-2xl font-extrabold text-ink-900 mb-4 text-center">
        How to Play
      </h2>

      <div className="space-y-4 text-sm font-bold text-slate-600 dark:text-slate-300">
        <section>
          <h3 className="font-extrabold text-ink-900 mb-1">Sudoku Rules</h3>
          <p className="leading-relaxed">
            Fill the 9×9 grid so every row, column, and 3×3 box contains digits
            1 to 9 with no repetition.
          </p>
        </section>

        <section>
          <h3 className="font-extrabold text-ink-900 mb-1">
            Hearts &amp; Hints
          </h3>
          <p className="leading-relaxed">
            You start with 5 hearts and 5 hints. With mistake check on, placing
            a wrong digit costs 1 heart. At 0 hearts the game is lost.
          </p>
        </section>

        <section>
          <h3 className="font-extrabold text-ink-900 mb-1">
            Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <span className="font-extrabold text-ink-900">1 – 9</span>
            <span>Place digit / Note</span>
            <span className="font-extrabold text-ink-900">Arrow keys</span>
            <span>Move selection</span>
            <span className="font-extrabold text-ink-900">Backspace / Del</span>
            <span>Erase cell</span>
            <span className="font-extrabold text-ink-900">N</span>
            <span>Toggle notes mode</span>
            <span className="font-extrabold text-ink-900">Ctrl / Cmd + Z</span>
            <span>Undo last move</span>
            <span className="font-extrabold text-ink-900">H</span>
            <span>Reveal hint</span>
            <span className="font-extrabold text-ink-900">P</span>
            <span>Pause timer</span>
            <span className="font-extrabold text-ink-900">Esc</span>
            <span>Close modal</span>
          </div>
        </section>
      </div>
    </Modal>
  );
}
