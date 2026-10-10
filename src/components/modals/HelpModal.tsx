import { type KeyboardEvent, type ReactNode, useEffect, useState } from 'react';
import { ChevronIcon, CloseIcon } from '../icons';
import { HeartRow } from '../HeartRow';
import { IconButton } from '../ui';
import { Modal } from './Modal';
import {
  KeyPreview,
  MiniGrid,
  SavePreview,
  TierPreview,
  ToolPreview,
} from './HelpVisuals';

export type HelpTopic = 'notes' | 'hint' | 'rules';

export interface HelpModalProps {
  open: boolean;
  onClose: () => void;
  topic?: HelpTopic;
}

interface HelpPage {
  title: string;
  visual: ReactNode;
  text: string;
}

// Every page keeps the same visual and text height, so the card never resizes.
const PAGES: HelpPage[] = [
  {
    title: 'The goal',
    visual: (
      <MiniGrid
        cells={[
          { v: 5 },
          { v: 3 },
          { v: 4 },
          { v: 6 },
          { v: 7 },
          { v: 2 },
          { v: 1 },
          { tone: 'hit' },
          { v: 8 },
        ]}
      />
    ),
    text: 'Every row, column, and 3x3 box holds the digits 1 to 9, once each. This box only misses a 9. Every puzzle has one answer and never needs guessing.',
  },
  {
    title: 'Placing digits',
    visual: (
      <MiniGrid
        cells={[
          {},
          { tone: 'peer', v: 4 },
          {},
          { tone: 'peer', v: 8 },
          { tone: 'sel', v: 6, user: true },
          { tone: 'peer', v: 2 },
          {},
          { tone: 'peer', v: 1 },
          {},
        ]}
      />
    ),
    text: 'Tap a cell, then a digit on the pad, or press 1 to 9. Its row, column, and box light up. A pad digit dims once all nine are placed.',
  },
  {
    title: 'Notes',
    visual: (
      <MiniGrid
        cells={[
          { n: [1, 4] },
          { n: [4, 9] },
          { v: 2 },
          { v: 9 },
          { v: 8 },
          { n: [1, 5] },
          { n: [1, 3] },
          { v: 7 },
          { n: [3, 5] },
        ]}
      />
    ),
    text: 'Turn on Notes (or press N) to jot down possible digits in a cell. Placing a digit clears matching notes in its row, column, and box.',
  },
  {
    title: 'Five hearts',
    visual: <HeartRow hearts={3} className="justify-center" />,
    text: 'A wrong digit costs a heart. Lose all five and the game ends: retry the same puzzle or start a new one. Turn off mistake check in Settings to play without hearts.',
  },
  {
    title: 'Hint, undo, erase',
    visual: <ToolPreview />,
    text: 'Select an empty cell and tap Hint to reveal its digit. You get 5 hints per game. Undo takes back your last move, Erase clears a cell and its notes.',
  },
  {
    title: 'Difficulty',
    visual: <TierPreview />,
    text: 'Difficulty is about technique, not clue count. Harder tiers need trickier deductions such as X-wing or swordfish. Change it any time in Settings.',
  },
  {
    title: 'Keyboard',
    visual: <KeyPreview />,
    text: 'Shortcuts work on the board. Pause stops the timer and hides the board. The timer also stops while Settings or Help is open.',
  },
  {
    title: 'Saving and stats',
    visual: <SavePreview />,
    text: 'Your game saves on every move. Leave any time and tap Continue on Home. Solved counts and best times per difficulty are kept on this device.',
  },
];

const TOPIC_START: Record<HelpTopic, number> = {
  rules: 0,
  notes: 2,
  hint: 4,
};

const NAV_BUTTON = `
  grid size-7 cursor-pointer place-items-center rounded-full border-0
  bg-slate-100 p-0 text-board-line
  disabled:cursor-default disabled:opacity-30
  dark:bg-cream-200
`;

export function HelpModal({ open, onClose, topic = 'notes' }: HelpModalProps) {
  const [slide, setSlide] = useState(TOPIC_START[topic]);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  useEffect(() => {
    if (open) setSlide(TOPIC_START[topic]);
  }, [open, topic]);

  const goTo = (next: number) => {
    if (next < 0 || next >= PAGES.length || next === slide) return;
    setDirection(next > slide ? 'forward' : 'back');
    setSlide(next);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') goTo(slide + 1);
    else if (e.key === 'ArrowLeft') goTo(slide - 1);
  };

  const page = PAGES[slide];

  return (
    <Modal
      open={open}
      onClose={onClose}
      label="Help and Rules"
      className="
        relative w-[min(90vw,380px)]! max-w-none! px-7! pt-6.5! pb-5!
        text-center
      "
    >
      <div role="presentation" onKeyDown={handleKeyDown}>
        <div className="absolute top-3 right-3">
          <IconButton
            icon={<CloseIcon />}
            size="sm"
            variant="close"
            label="Close help"
            onClick={onClose}
          />
        </div>

        <div className="overflow-hidden">
          <div
            key={slide}
            className={
              direction === 'forward'
                ? 'animate-pane-slide-left'
                : 'animate-pane-slide-right'
            }
          >
            <h3 className="m-0 h-8 text-[24px] leading-8 text-ink-900">
              {page.title}
            </h3>
            <div className="grid h-46 place-items-center py-2">
              {page.visual}
            </div>
            <p
              className="
                m-0 h-26 overflow-y-auto text-[17px] leading-[1.45]
                text-slate-500
              "
            >
              {page.text}
            </p>
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-center gap-2">
          <button
            type="button"
            aria-label="Previous"
            disabled={slide === 0}
            onClick={() => goTo(slide - 1)}
            className={NAV_BUTTON}
          >
            <ChevronIcon direction="left" />
          </button>
          <div className="flex">
            {PAGES.map((p, i) => (
              <button
                key={p.title}
                type="button"
                aria-label={`Page ${i + 1}: ${p.title}`}
                aria-current={i === slide}
                onClick={() => goTo(i)}
                className="
                  grid size-4.5 cursor-pointer place-items-center
                  border-0 bg-transparent p-0
                "
              >
                <i
                  className={`
                    size-2 rounded-full transition-colors duration-200
                    ${i === slide ? 'bg-brand-500' : 'bg-slate-300'}
                  `}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Next"
            disabled={slide === PAGES.length - 1}
            onClick={() => goTo(slide + 1)}
            className={NAV_BUTTON}
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
