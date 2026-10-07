import { EraseIcon, HintIcon, UndoIcon } from './icons';
import { useGameStore } from '../store/game';

export interface ToolbarProps {
  onAboutHint?: () => void;
  className?: string;
}

export function Toolbar({ onAboutHint, className = '' }: ToolbarProps) {
  const game = useGameStore((s) => s.game);
  const selected = useGameStore((s) => s.selected);
  const generating = useGameStore((s) => s.generating);
  const undo = useGameStore((s) => s.undo);
  const erase = useGameStore((s) => s.erase);
  const hint = useGameStore((s) => s.hint);

  const hintsLeft = game?.hintsLeft ?? 0;
  const historyLen = game?.history.length ?? 0;

  // Selected cell conditions
  const isSelectedGiven =
    selected !== null && game ? game.givens[selected] !== 0 : true;
  const isSelectedCorrect =
    selected !== null && game
      ? game.values[selected] !== 0 &&
        game.values[selected] === game.solution[selected]
      : false;

  const isUndoDisabled = generating || historyLen === 0;
  const isEraseDisabled = generating || selected === null || isSelectedGiven;
  const isHintDisabled =
    generating ||
    hintsLeft <= 0 ||
    selected === null ||
    isSelectedGiven ||
    isSelectedCorrect;

  return (
    <div
      role="toolbar"
      aria-label="Game controls"
      className={`flex gap-3 w-full select-none ${className}`}
    >
      {/* Undo Button */}
      <button
        type="button"
        aria-label="Undo"
        disabled={isUndoDisabled}
        onClick={undo}
        className="flex-1 flex flex-col items-center gap-1 py-2.5 px-1.5 rounded-2xl border-2 border-edge bg-cream-50 dark:bg-cream-100 text-ink-900 font-bold text-[12px] shadow-[0_4px_0_var(--color-edge)] cursor-pointer transition-transform duration-[90ms] hover:border-brand-600 hover:shadow-[0_4px_0_var(--color-brand-600)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-edge)] disabled:cursor-default disabled:pointer-events-none disabled:transform-none"
      >
        <UndoIcon size={22} className="text-board-line dark:text-ink-600" />
        <span>Undo</span>
      </button>

      {/* Erase Button */}
      <button
        type="button"
        aria-label="Erase"
        disabled={isEraseDisabled}
        onClick={erase}
        className="flex-1 flex flex-col items-center gap-1 py-2.5 px-1.5 rounded-2xl border-2 border-edge bg-cream-50 dark:bg-cream-100 text-ink-900 font-bold text-[12px] shadow-[0_4px_0_var(--color-edge)] cursor-pointer transition-transform duration-[90ms] hover:border-brand-600 hover:shadow-[0_4px_0_var(--color-brand-600)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-edge)] disabled:cursor-default disabled:pointer-events-none disabled:transform-none"
      >
        <EraseIcon size={22} className="text-board-line dark:text-ink-600" />
        <span>Erase</span>
      </button>

      {/* Hint Button with optional "?" badge */}
      <div className="relative flex-1 flex">
        <button
          type="button"
          aria-label={`Hint, ${hintsLeft} remaining`}
          disabled={isHintDisabled}
          onClick={hint}
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-1.5 rounded-2xl border-2 border-edge bg-cream-50 dark:bg-cream-100 text-ink-900 font-bold text-[12px] shadow-[0_4px_0_var(--color-edge)] cursor-pointer transition-transform duration-[90ms] hover:border-brand-600 hover:shadow-[0_4px_0_var(--color-brand-600)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--color-edge)] disabled:cursor-default disabled:pointer-events-none disabled:transform-none ${hintsLeft <= 0 ? 'opacity-40' : ''}`}
        >
          <HintIcon size={22} className="text-brand-600" />
          <span>Hint x{hintsLeft}</span>
        </button>

        {onAboutHint && (
          <button
            type="button"
            aria-label="About hints"
            onClick={onAboutHint}
            className="absolute -top-[3px] -right-[7px] z-20 w-[30px] h-[30px] rounded-full bg-brand-500 text-white font-extrabold text-[17px] leading-[30px] text-center border-0 shadow-[0_2px_0_var(--color-brand-700)] cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-100"
          >
            ?
          </button>
        )}
      </div>
    </div>
  );
}
