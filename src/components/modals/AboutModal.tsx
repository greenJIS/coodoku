import { CloseIcon } from '../icons';
import { IconButton } from '../ui';
import { Modal } from './Modal';

export interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

const CREDITS: readonly { name: string; detail: string }[] = [
  { name: 'Otter mascot, icons, sounds', detail: 'Original to Coodoku' },
  {
    name: 'Patrick Hand',
    detail: 'Patrick Wagesreiter, SIL Open Font License 1.1',
  },
];

export function AboutModal({ open, onClose }: AboutModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      label="About Coodoku"
      className="relative w-[min(90vw,380px)]! max-w-none! text-center px-7! pt-[26px]! pb-5!"
    >
      <div className="absolute top-3 right-3">
        <IconButton
          icon={<CloseIcon />}
          size="sm"
          variant="close"
          label="Close about"
          onClick={onClose}
        />
      </div>
      <h3 className="mb-2 text-[28px] text-ink-900">About Coodoku</h3>
      <p className="text-[19px] leading-[1.35] text-slate-500">
        A solo sudoku that runs in your browser. No accounts, no server. Puzzles
        are generated on your device and scores stay in local storage.
      </p>
      <h4 className="mt-4 mb-1.5 text-[18px] uppercase tracking-[0.08em] text-slate-500">
        Credits
      </h4>
      <ul className="flex flex-col gap-1 text-[19px] text-ink-900">
        {CREDITS.map((c) => (
          <li key={c.name}>
            {c.name}
            <span className="block text-[17px] text-slate-500">{c.detail}</span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
