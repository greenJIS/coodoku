import { memo } from 'react';
import { col, hasNote, row } from '../game/cells';

export interface CellProps {
  index: number;
  value: number;
  notes: number;
  isGiven: boolean;
  isWrong: boolean;
  isSelected: boolean;
  isPeer: boolean;
  isSameDigit: boolean;
  isJustEntered: boolean;
  /** Wave delay steps when a completed unit sweeps through this cell. */
  waveStep?: number;
  digitSize?: 'normal' | 'large';
  tabIndex: number;
  onClick: (index: number) => void;
}

export const Cell = memo(function Cell({
  index,
  value,
  notes,
  isGiven,
  isWrong,
  isSelected,
  isPeer,
  isSameDigit,
  isJustEntered,
  waveStep,
  digitSize = 'normal',
  tabIndex,
  onClick,
}: CellProps) {
  const r = row(index);
  const c = col(index);

  // 1-based grid tracks taking 5px dividers at tracks 4 and 8 into account
  const gridRow = r + 1 + Math.floor(r / 3);
  const gridCol = c + 1 + Math.floor(c / 3);

  let ariaLabel = `row ${r + 1}, column ${c + 1}`;
  if (value !== 0) {
    ariaLabel += `, ${value}`;
    if (isGiven) {
      ariaLabel += ', given';
    } else if (isWrong) {
      ariaLabel += ', wrong';
    }
  } else {
    ariaLabel += ', empty';
    if (notes !== 0) {
      const activeNotes = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        .filter((d) => hasNote(notes, d))
        .join(', ');
      ariaLabel += `, notes ${activeNotes}`;
    }
  }

  // Base background & highlight
  let bgClasses = 'bg-cream-50';
  if (isSelected) {
    bgClasses = 'bg-sel';
  } else if (isPeer) {
    bgClasses = 'bg-peer';
  }

  // One animation per cell: the wave beats a wrong-digit shake, which beats
  // the selection pulse
  let motionClasses = '';
  if (waveStep !== undefined) {
    motionClasses = 'animate-wave';
  } else if (isWrong) {
    motionClasses = 'animate-shake';
  } else if (isSelected) {
    motionClasses = 'animate-selpulse';
  }

  // Text color & font styling
  let textClasses = 'font-hand font-normal';
  if (isWrong) {
    textClasses += ' text-error';
  } else if (isGiven) {
    textClasses += ' text-ink-900';
  } else if (value !== 0) {
    textClasses += ' text-user';
  }

  const fontSizeClass =
    digitSize === 'large'
      ? 'text-[calc(min(86vw,66vh,600px)/10.5)]'
      : 'text-[calc(min(86vw,66vh,600px)/13)]';

  return (
    <div
      role="gridcell"
      data-cell={index}
      tabIndex={tabIndex}
      aria-selected={isSelected}
      aria-label={ariaLabel}
      onClick={() => onClick(index)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(index);
        }
      }}
      style={{
        gridRow,
        gridColumn: gridCol,
        animationDelay:
          waveStep === undefined ? undefined : `${waveStep * 45}ms`,
      }}
      className={`relative grid place-items-center cursor-pointer select-none transition-[background-color] duration-[140ms] outline-none
        shadow-[inset_0_0_0_1px_var(--color-hairline)]
        focus-visible:z-20 focus-visible:outline-3 focus-visible:outline-brand-400 focus-visible:outline-offset-[-2px]
        ${bgClasses} ${motionClasses}`}
    >
      {/* Digit value */}
      {value !== 0 && (
        <span
          className={`leading-none select-none ${fontSizeClass} ${textClasses} ${
            isJustEntered ? 'animate-pop' : ''
          }`}
        >
          {value}
        </span>
      )}

      {/* 3x3 Notes subgrid */}
      {value === 0 && notes !== 0 && (
        <div className="absolute inset-[2px] grid grid-cols-3 grid-rows-3 pointer-events-none select-none text-[calc(min(86vw,66vh,600px)/46)] text-slate-500 leading-none">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
            <span key={d} className="grid place-items-center">
              {hasNote(notes, d) ? d : ''}
            </span>
          ))}
        </div>
      )}

      {/* Same-digit magenta leaf outline (the green circle replaces it on the just-entered cell): large radius top-left and bottom-right, small radius top-right and bottom-left */}
      {isSameDigit && !isJustEntered && value !== 0 && (
        <span
          aria-hidden="true"
          className="absolute inset-[3px] border-[3px] border-match rounded-[14px_4px_14px_4px] pointer-events-none z-10 animate-ring"
        />
      )}

      {/* Just-entered green circle outline */}
      {isJustEntered && value !== 0 && (
        <span
          aria-hidden="true"
          className="absolute inset-[3px] border-[3px] border-ok rounded-full pointer-events-none z-10 animate-ring"
        />
      )}
    </div>
  );
});
