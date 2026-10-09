import type { ReactNode } from 'react';
import { EraseIcon, HintIcon, UndoIcon } from '../icons';

export interface MiniCell {
  v?: number;
  n?: number[];
  tone?: 'sel' | 'peer' | 'hit';
  user?: boolean;
}

const NOTE_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const TONE_CLASS: Record<NonNullable<MiniCell['tone']> | 'none', string> = {
  none: 'bg-white dark:bg-cream-50',
  peer: 'bg-peer dark:bg-cream-100',
  sel: 'bg-sel dark:bg-cream-200',
  hit: 'bg-[#ffe9b8] dark:bg-cream-200',
};

export function MiniGrid({ cells }: { cells: MiniCell[] }) {
  return (
    <div
      className="
        grid size-42 grid-cols-3 grid-rows-3 gap-px overflow-hidden rounded-md
        border-2 border-board-line bg-hairline
      "
    >
      {cells.map((c, i) => (
        <div
          key={i}
          className={`
            relative grid place-items-center text-[29px]
            ${TONE_CLASS[c.tone ?? 'none']}
            ${c.user ? 'text-user' : ''}
          `}
        >
          {c.v ? (
            c.v
          ) : c.n ? (
            <em
              className="
                absolute inset-0.5 grid grid-cols-3 grid-rows-3 text-[11px]
                text-slate-500 not-italic
              "
            >
              {NOTE_DIGITS.map((k) => (
                <i key={k} className="grid place-items-center not-italic">
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

const STICKER = `
  rounded-2xl border-2 border-edge bg-cream-50 shadow-[0_3px_0_var(--color-edge)]
  dark:bg-cream-100
`;

export function ToolPreview() {
  const tools: { label: string; icon: ReactNode }[] = [
    { label: 'Undo', icon: <UndoIcon size={26} /> },
    { label: 'Erase', icon: <EraseIcon size={26} /> },
    { label: 'Hint', icon: <HintIcon size={26} /> },
  ];
  return (
    <div className="flex gap-3">
      {tools.map((t) => (
        <div
          key={t.label}
          className={`
            ${STICKER}
            flex w-20 flex-col items-center gap-1 py-3 text-[16px]
          `}
        >
          <span className="text-board-line dark:text-ink-600">{t.icon}</span>
          {t.label}
        </div>
      ))}
    </div>
  );
}

export function TierPreview() {
  const tiers = [
    { name: 'Easy', how: 'singles' },
    { name: 'Medium', how: 'pairs, locked' },
    { name: 'Hard', how: '1 advanced' },
    { name: 'Expert', how: '2+ advanced' },
  ];
  return (
    <div className="grid w-full grid-cols-2 gap-2.5">
      {tiers.map((t) => (
        <div key={t.name} className={`${STICKER} px-3 py-2.5 text-center`}>
          <div className="text-[20px] leading-tight text-ink-900">{t.name}</div>
          <div className="text-[14px] text-slate-500">{t.how}</div>
        </div>
      ))}
    </div>
  );
}

function Key({ children }: { children: ReactNode }) {
  return (
    <kbd
      className="
        inline-grid min-w-8 place-items-center rounded-lg border-2 border-edge
        bg-cream-50 px-1.5 py-0.5 font-[inherit] text-[16px] text-ink-900
        shadow-[0_2px_0_var(--color-edge)]
        dark:bg-cream-100
      "
    >
      {children}
    </kbd>
  );
}

export function KeyPreview() {
  const rows: { keys: string[]; what: string }[] = [
    { keys: ['1', '9'], what: 'place digit' },
    { keys: ['N'], what: 'notes on/off' },
    { keys: ['←', '↑', '↓', '→'], what: 'move' },
    { keys: ['⌫'], what: 'erase' },
    { keys: ['P'], what: 'pause' },
  ];
  return (
    <ul className="m-0 grid w-full list-none gap-1.5 p-0">
      {rows.map((r) => (
        <li
          key={r.what}
          className="flex items-center justify-between text-[16px]"
        >
          <span className="flex gap-1">
            {r.keys.map((k) => (
              <Key key={k}>{k}</Key>
            ))}
          </span>
          <span className="text-slate-500">{r.what}</span>
        </li>
      ))}
    </ul>
  );
}

export function SavePreview() {
  return (
    <div className="grid w-full gap-2.5">
      <div
        className={`
          ${STICKER}
          flex items-center justify-between px-4 py-3 text-[19px]
        `}
      >
        <span>Continue</span>
        <span className="text-slate-500">12:40</span>
      </div>
      <div
        className={`
          ${STICKER}
          flex items-center justify-between px-4 py-3 text-[19px]
        `}
      >
        <span>Best time</span>
        <span className="text-user">4:32</span>
      </div>
    </div>
  );
}
