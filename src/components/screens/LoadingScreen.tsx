import { useEffect, useState } from 'react';
import { Otter } from '../brand/Otter';

const SOLUTION =
  '534678912672195348198342567859761423426853791713924856961537284287419635345286179';

const TIPS: readonly string[] = [
  'Tip: tap a digit on the pad to light up every match.',
  'Tip: notes mode keeps your guesses out of the way.',
  'Tip: a wrong digit costs a heart. You get five.',
  'Tip: Hard puzzles need exactly one advanced trick.',
];

export interface LoadingScreenProps {
  leaving: boolean;
}

export function LoadingScreen({ leaving }: LoadingScreenProps) {
  const [tip, setTip] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTip((t) => (t + 1) % TIPS.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-paper px-5 text-ink-900 transition-opacity duration-240 ${
        leaving ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <Otter size={84} className="animate-bob" />

      <div className="grid grid-cols-9 w-[min(78vw,306px)] aspect-square bg-cream-50 border-[3px] border-board-line rounded-[10px] overflow-hidden">
        {SOLUTION.split('').map((digit, i) => {
          const row = Math.floor(i / 9);
          const col = i % 9;
          return (
            <div
              key={i}
              data-testid="mini-cell"
              style={{ animationDelay: `${(row + col) * 0.09}s` }}
              className={`grid place-items-center border border-hairline text-[24px] text-user animate-mini-fill ${
                col === 2 || col === 5
                  ? 'border-r-[3px] border-r-board-line'
                  : ''
              } ${
                row === 2 || row === 5
                  ? 'border-b-[3px] border-b-board-line'
                  : ''
              }`}
            >
              {digit}
            </div>
          );
        })}
      </div>

      <p className="text-[34px] leading-none">Shuffling the pebbles…</p>
      <p className="min-h-[44px] max-w-[320px] text-center text-[20px] text-slate-500">
        {TIPS[tip]}
      </p>
      <div className="w-[min(70vw,260px)] h-2.5 rounded-full bg-peer border-2 border-edge overflow-hidden">
        <div className="h-full w-2/5 rounded-full bg-brand-500 animate-slide" />
      </div>
    </div>
  );
}
