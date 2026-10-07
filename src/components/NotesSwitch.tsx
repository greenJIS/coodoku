import { PencilIcon } from './icons';
import { useGameStore } from '../store/game';

export interface NotesSwitchProps {
  onHelp?: () => void;
  className?: string;
}

export function NotesSwitch({ onHelp, className = '' }: NotesSwitchProps) {
  const notesMode = useGameStore((s) => s.notesMode);
  const generating = useGameStore((s) => s.generating);
  const toggleNotesMode = useGameStore((s) => s.toggleNotesMode);

  return (
    <div className={`relative w-[72%] max-w-[240px] select-none ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={notesMode}
        aria-label="Notes mode"
        disabled={generating}
        onClick={toggleNotesMode}
        className={`relative block w-full h-[64px] sm:h-[84px] p-0 rounded-full border-2 border-edge bg-cream-50 dark:bg-cream-100 shadow-[0_4px_0_var(--color-edge)] cursor-pointer transition-[border-color,box-shadow] duration-150
          focus-visible:outline-3 focus-visible:outline-brand-400 focus-visible:outline-offset-2
          disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {/* Track groove */}
        <span
          aria-hidden="true"
          className="absolute top-1/2 -translate-y-1/2 left-[34px] sm:left-[50px] right-[34px] sm:right-[50px] h-[16px] sm:h-[22px] rounded-full bg-linear-to-b from-[#402312] to-[#7a4f08] shadow-[inset_0_3px_0_#1c0d04]"
        />

        {/* Knob */}
        <span
          aria-hidden="true"
          className={`absolute top-1/2 -translate-y-1/2 z-10 w-[46px] sm:w-[54px] h-[46px] sm:h-[54px] rounded-full grid place-items-center transition-[left,background-color,border-color,box-shadow,color] duration-200 ease-[cubic-bezier(0.4,1.4,0.5,1)]
            ${
              notesMode
                ? 'left-[calc(100%-32px)] sm:left-[calc(100%-44px)] -translate-x-1/2 bg-brand-500 text-brand-900 border-2 border-brand-700 shadow-[0_3px_0_var(--color-brand-700)]'
                : 'left-[32px] sm:left-[44px] -translate-x-1/2 bg-white dark:bg-[#4a3c25] text-slate-600 dark:text-slate-300 border-2 border-edge shadow-[0_3px_0_var(--color-edge)]'
            }`}
        >
          <PencilIcon size={22} />
        </span>
      </button>

      {/* Help "?" badge */}
      {onHelp && (
        <button
          type="button"
          aria-label="About notes"
          onClick={onHelp}
          className="absolute -top-1 -right-2 z-20 w-[30px] h-[30px] rounded-full bg-brand-500 text-white font-extrabold text-[17px] leading-[30px] text-center border-0 shadow-[0_2px_0_var(--color-brand-700)] cursor-pointer hover:scale-110 active:scale-95 transition-transform"
        >
          ?
        </button>
      )}
    </div>
  );
}
