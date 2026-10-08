import { useEffect, useState } from 'react';
import { ChevronIcon, CloseIcon } from '../icons';
import { HeartRow } from '../HeartRow';
import { IconButton } from '../ui';
import { Modal } from './Modal';

export type HelpTopic = 'notes' | 'hint';

export interface HelpModalProps {
  open: boolean;
  onClose: () => void;
  topic?: HelpTopic;
}

interface MiniCell {
  v?: number;
  n?: number[];
  hi?: boolean;
}

interface HelpSlide {
  title: string;
  grid?: MiniCell[];
  hearts?: boolean;
  text: string;
}

const HELP: Record<HelpTopic, HelpSlide[]> = {
  notes: [
    {
      title: 'Not sure yet?',
      grid: [
        { n: [1, 4] },
        { n: [4, 9] },
        { v: 2 },
        { v: 9 },
        { v: 8 },
        { n: [1, 5] },
        { n: [1, 3] },
        { v: 7 },
        { n: [3, 5] },
      ],
      text: 'Turn on Notes to jot down possible digits in a cell. Placing a digit clears matching notes in its row, column, and box.',
    },
  ],
  hint: [
    {
      title: 'Feeling stuck?',
      grid: [
        { v: 7 },
        { hi: true },
        { v: 3 },
        {},
        { v: 1 },
        { v: 9 },
        {},
        {},
        { v: 2 },
      ],
      text: 'Select an empty cell and tap Hint to reveal its correct digit.',
    },
    {
      title: 'Hints are limited',
      hearts: true,
      text: 'You get 5 hints per game. Wrong guesses cost a heart, so use them wisely.',
    },
  ],
};

const NOTE_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function MiniGrid({ cells }: { cells: MiniCell[] }) {
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-px w-[168px] h-[168px] mx-auto my-[14px] bg-hairline border-2 border-board-line rounded-[6px] overflow-hidden">
      {cells.map((c, i) => (
        <div
          key={i}
          className={`relative grid place-items-center text-[29px] ${
            c.hi ? 'bg-[#ffe9b8] dark:bg-cream-50' : 'bg-white dark:bg-cream-50'
          }`}
        >
          {c.v ? (
            c.v
          ) : c.n ? (
            <em className="absolute inset-[2px] grid grid-cols-3 grid-rows-3 not-italic text-[11px] text-slate-500">
              {NOTE_DIGITS.map((k) => (
                <i key={k} className="not-italic grid place-items-center">
                  {c.n?.includes(k) ? k : ''}
                </i>
              ))}
            </em>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function HelpModal({ open, onClose, topic = 'notes' }: HelpModalProps) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (open) setSlide(0);
  }, [open, topic]);

  const pages = HELP[topic];
  const page = pages[Math.min(slide, pages.length - 1)];

  return (
    <Modal
      open={open}
      onClose={onClose}
      label="Help and Rules"
      className="relative w-[min(90vw,380px)]! max-w-none! text-center px-7! pt-[26px]! pb-5!"
    >
      <div className="absolute top-3 right-3">
        <IconButton
          icon={<CloseIcon />}
          size="sm"
          variant="close"
          label="Close help"
          onClick={onClose}
        />
      </div>

      <h3 className="text-[24px] text-ink-900 mb-1">{page.title}</h3>

      {page.hearts ? (
        <HeartRow hearts={3} className="justify-center mt-[22px] mb-6" />
      ) : (
        <MiniGrid cells={page.grid ?? []} />
      )}

      <p className="text-[17px] leading-[1.45] text-slate-500">{page.text}</p>

      {pages.length > 1 && (
        <div className="flex items-center justify-center gap-[14px] mt-[14px]">
          <button
            type="button"
            aria-label="Previous"
            disabled={slide === 0}
            onClick={() => setSlide(slide - 1)}
            className="grid place-items-center w-7 h-7 p-0 rounded-full border-0 bg-slate-100 dark:bg-[#3a2f1e] text-board-line cursor-pointer disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronIcon direction="left" />
          </button>
          <div className="flex gap-1.5">
            {pages.map((_, i) => (
              <i
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === slide ? 'bg-brand-500' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next"
            disabled={slide === pages.length - 1}
            onClick={() => setSlide(slide + 1)}
            className="grid place-items-center w-7 h-7 p-0 rounded-full border-0 bg-slate-100 dark:bg-[#3a2f1e] text-board-line cursor-pointer disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      )}
    </Modal>
  );
}
