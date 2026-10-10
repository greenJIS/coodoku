import { HintIcon, UndoIcon } from './icons';
import { useGameStore } from '../store/game';
import { EraseButton } from './EraseButton';
import { TOOLBAR_BUTTON, TOOLBAR_ICON } from './toolbarButton';

export interface ToolbarProps {
  onAboutHint?: () => void;
  className?: string;
}

export function Toolbar({ onAboutHint, className = '' }: ToolbarProps) {
  const game = useGameStore((s) => s.game);
  const selected = useGameStore((s) => s.selected);
  const generating = useGameStore((s) => s.generating);
  const undo = useGameStore((s) => s.undo);
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
      className={`
        flex w-full gap-3 select-none
        ${className}
      `}
    >
      {/* Undo Button */}
      <button
        type="button"
        aria-label="Undo"
        disabled={isUndoDisabled}
        onClick={undo}
        className={TOOLBAR_BUTTON}
      >
        <UndoIcon size={22} className={TOOLBAR_ICON} />
        <span>Undo</span>
      </button>

      {/* Erase Button (moves into the pad on compact screens) */}
      <EraseButton className="compact:hidden" />

      {/* Hint Button with optional "?" badge */}
      <div className="relative flex flex-1">
        <button
          type="button"
          aria-label={`Hint, ${hintsLeft} remaining`}
          disabled={isHintDisabled}
          onClick={hint}
          className={`
            ${TOOLBAR_BUTTON}
            ${hintsLeft <= 0 ? `opacity-40` : ''}
          `}
        >
          <HintIcon
            size={22}
            className="text-brand-600 dark:text-ink-600 dark:group-hover:text-icon"
          />
          <span>Hint x{hintsLeft}</span>
        </button>

        {onAboutHint && (
          <button
            type="button"
            aria-label="About hints"
            onClick={onAboutHint}
            className="
              absolute -top-0.75 -right-1.75 z-20 size-7.5 cursor-pointer
              rounded-full border-0 bg-brand-500 text-center text-[20px]
              leading-7.5 text-white shadow-[0_2px_0_var(--color-brand-700)]
              transition-transform duration-100
              hover:scale-110
              active:scale-95
            "
          >
            ?
          </button>
        )}
      </div>
    </div>
  );
}
