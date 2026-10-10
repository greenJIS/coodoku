import { LIFT } from './lift';

export function HowToPlayCard({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`
        ${LIFT}
        flex w-full items-center gap-3 rounded-[18px] border-2 border-edge
        bg-cream-50 px-3 py-2.5 text-left shadow-[0_4px_0_var(--color-edge)]
        dark:bg-cream-100 max-[380px]:gap-2 max-[380px]:px-2
      `}
    >
      <span
        aria-hidden="true"
        className="
          grid size-8.5 shrink-0 place-items-center rounded-xl border-2
          border-edge bg-peer text-[24px] text-user
        "
      >
        ?
      </span>
      <span className="whitespace-nowrap text-[22px] leading-tight max-[380px]:text-[20px]">
        How to play
      </span>
    </button>
  );
}
