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
    <div
      className={`
        relative w-[72%] select-none
        narrow:w-[62%]
        ${className}
      `}
    >
      <button
        type="button"
        role="switch"
        aria-checked={notesMode}
        aria-label="Notes mode"
        disabled={generating}
        onClick={toggleNotesMode}
        className={`
          relative block h-21 w-full cursor-pointer rounded-full border-2
          border-edge bg-cream-50 p-0 shadow-[0_4px_0_var(--color-edge)]
          focus-visible:outline-3 focus-visible:outline-offset-2
          focus-visible:outline-brand-400
          disabled:cursor-not-allowed disabled:opacity-40
          dark:bg-cream-100
        `}
      >
        {/* Track groove */}
        <span
          aria-hidden="true"
          className="
            absolute inset-x-12.5 top-1/2 h-4 -translate-y-1/2
            rounded-full bg-brand-800
            shadow-[inset_0_3px_0_var(--color-brand-900)]
            min-[861px]:h-5.5
          "
        />

        {/* Knob */}
        <span
          aria-hidden="true"
          className={`
            absolute top-1/2 z-10 grid size-11.5 -translate-1/2
            place-items-center rounded-full border-2
            [transition:left_.24s_cubic-bezier(.4,1.4,.5,1),background_.2s,color_.2s]
            min-[861px]:size-13.5
            ${
              notesMode
                ? `
                  left-[calc(100%-50px)] border-[#b45309] bg-brand-500
                  text-brand-900 shadow-[0_3px_0_#b45309]
                `
                : `
                  left-12.5 border-edge bg-white text-board-line
                  shadow-[0_3px_0_var(--color-edge)]
                  dark:bg-cream-300
                `
            }
          `}
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
  );
}
