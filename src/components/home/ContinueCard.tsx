import type { GameState } from '../../game/types';
import { formatTime } from '../../lib/time';

export interface ContinueCardProps {
  game: GameState;
  onContinue: () => void;
}

export function ContinueCard({ game, onContinue }: ContinueCardProps) {
  const filled = game.values.filter((v) => v !== 0).length;
  const difficulty =
    game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1);

  return (
    <button
      type="button"
      aria-label={`Continue ${game.name}`}
      onClick={onContinue}
      className="
        lift flex w-full cursor-pointer flex-col gap-2 rounded-[18px] border-2
        border-brand-700 bg-brand-500 px-4 py-3 text-left text-brand-900
        shadow-[0_5px_0_var(--color-brand-700)]
        transition-[transform,box-shadow,background-color] duration-100
        hover:-translate-y-0.5 hover:bg-brand-400
        hover:shadow-[0_7px_0_var(--color-brand-700)]
        focus-visible:outline-3 focus-visible:outline-offset-2
        focus-visible:outline-brand-300
        active:translate-y-1.25 active:shadow-none
      "
    >
      <span className="flex items-center justify-between">
        <span className="text-[30px] leading-none">{game.name}</span>
        <span className="text-[24px] leading-none">Continue ▶</span>
      </span>
      <span className="h-2 overflow-hidden rounded-full bg-brand-900/20">
        <span
          className="block h-full rounded-full bg-brand-900"
          style={{ width: `${Math.round((filled / 81) * 100)}%` }}
        />
      </span>
      <span className="flex justify-between text-[18px]">
        <span>{difficulty}</span>
        <span>{filled} / 81 filled</span>
        <span>{formatTime(game.elapsedMs)}</span>
      </span>
    </button>
  );
}
