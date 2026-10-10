/** Card button used in the toolbar strip (Undo, Erase, Hint). */
export const TOOLBAR_BUTTON = `
  group flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-2xl
  border-2 border-edge bg-cream-50 px-1.5 py-2.5 text-[14px] text-ink-900
  shadow-[0_4px_0_var(--color-edge)] transition-transform duration-90
  hover:border-brand-600 hover:shadow-[0_4px_0_var(--color-brand-600)]
  active:translate-y-0.75 active:shadow-[0_1px_0_var(--color-edge)]
  disabled:pointer-events-none disabled:transform-none disabled:cursor-default
  dark:bg-cream-100
`;

/** Icon colors shared by Undo and Erase. */
export const TOOLBAR_ICON =
  'text-board-line dark:text-ink-600 dark:group-hover:text-icon';
