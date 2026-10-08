/**
 * Movement half of the hover/press effect: lift 2px on hover, sink on press.
 * Disabled and aria-disabled elements get neither. The `lift` marker class
 * lets src/index.css cancel the movement under reduced motion. Components
 * that need their own hover colors or shadow use this alone.
 */
export const LIFT_MOVE =
  'lift cursor-pointer transition-[transform,box-shadow,background-color] duration-100 not-disabled:not-aria-disabled:hover:-translate-y-0.5 not-disabled:not-aria-disabled:active:translate-y-1 not-disabled:not-aria-disabled:active:shadow-none';

/** LIFT_MOVE plus the neutral sticker hover: warm face and a deeper shadow. */
export const LIFT = `${LIFT_MOVE} not-disabled:not-aria-disabled:hover:bg-peer not-disabled:not-aria-disabled:hover:shadow-[0_6px_0_var(--color-edge)]`;
