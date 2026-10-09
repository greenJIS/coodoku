import { LIFT } from './lift';

export function HowToPlayCard({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${LIFT} flex w-full items-center gap-3 rounded-[18px] border-2 border-edge bg-cream-50 dark:bg-cream-100 px-3 py-2.5 text-left shadow-[0_4px_0_var(--color-edge)]`}
    >
      <span
        aria-hidden="true"
        className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-xl border-2 border-edge bg-peer text-[24px] text-user"
      >
        ?
      </span>
      <span className="text-[22px] leading-tight">How to play</span>
    </button>
  );
}
