import { useGameStore } from '../store/game';
import { EraseIcon } from './icons';
import { TOOLBAR_BUTTON, TOOLBAR_ICON } from './toolbarButton';

export interface EraseButtonProps {
  /** `toolbar`: card in the strip. `pad`: round pill in pad row 2 (compact). */
  variant?: 'toolbar' | 'pad';
  className?: string;
}

// No display utility here: the caller passes `hidden compact:flex`, and two
// display utilities on one element have no guaranteed winner.
const PAD_BUTTON = `
  h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full
  border-2 border-edge bg-cream-50 text-[16px] text-ink-900
  shadow-[0_3px_0_var(--color-edge)] transition-transform duration-90
  hover:border-brand-600 hover:shadow-[0_4px_0_var(--color-brand-600)]
  active:translate-y-0.5 active:shadow-[0_1px_0_var(--color-edge)]
  disabled:pointer-events-none disabled:opacity-40
  dark:bg-cream-100
`;

export function EraseButton({
  variant = 'toolbar',
  className = '',
}: EraseButtonProps) {
  const game = useGameStore((s) => s.game);
  const selected = useGameStore((s) => s.selected);
  const generating = useGameStore((s) => s.generating);
  const erase = useGameStore((s) => s.erase);

  const isSelectedGiven =
    selected !== null && game ? game.givens[selected] !== 0 : true;
  const isDisabled = generating || selected === null || isSelectedGiven;

  return (
    <button
      type="button"
      aria-label="Erase"
      disabled={isDisabled}
      onClick={erase}
      className={`
        ${variant === 'pad' ? PAD_BUTTON : TOOLBAR_BUTTON}
        ${className}
      `}
    >
      <EraseIcon
        size={variant === 'pad' ? 20 : 22}
        className={
          variant === 'pad' ? 'text-board-line' : `${TOOLBAR_ICON} tight:size-5`
        }
      />
      <span>Erase</span>
    </button>
  );
}
