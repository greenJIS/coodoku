import { LIFT } from './lift';

export function HowToPlayCard({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${LIFT} flex w-full items-center gap-3 rounded-[18px] border-2 border-edge bg-cream-50 dark:bg-cream-100 px-4 py-3.5 text-left shadow-[0_4px_0_var(--color-edge)]`}
    >
      <span
        aria-hidden="true"
        className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl border-2 border-edge bg-peer text-[29px] text-user"
      >
        ?
      </span>
      <span>
        <span className="block text-[26px] leading-tight">How to play</span>
        <span className="block text-[19px] text-slate-500">
          Rules, notes, hints, and the difficulty tiers.
        </span>
      </span>
    </button>
  );
}
