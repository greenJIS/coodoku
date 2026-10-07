import { useCallback } from 'react';
import { peers } from '../game/cells';
import { isWrong } from '../game/queries';
import { useGameStore } from '../store/game';
import { useSettingsStore } from '../store/settings';
import { Cell } from './Cell';

interface ConnectedCellProps {
  index: number;
}

function ConnectedCell({ index }: ConnectedCellProps) {
  const value = useGameStore((s) => s.game?.values[index] ?? 0);
  const notes = useGameStore((s) => s.game?.notes[index] ?? 0);
  const isGiven = useGameStore((s) => (s.game?.givens[index] ?? 0) !== 0);
  const isWrongCell = useGameStore((s) =>
    s.game ? isWrong(s.game, index) : false,
  );
  const isSelected = useGameStore((s) => s.selected === index);
  const selectedCell = useGameStore((s) => s.selected);
  const lastEntered = useGameStore((s) => s.lastEntered);
  const select = useGameStore((s) => s.select);

  const highlightPeersSetting = useSettingsStore((s) => s.highlightPeers);
  const highlightSameSetting = useSettingsStore((s) => s.highlightSame);
  const digitSize = useSettingsStore((s) => s.digitSize);

  // Derive highlight flags
  const isPeer =
    highlightPeersSetting &&
    selectedCell !== null &&
    selectedCell !== index &&
    peers(selectedCell).includes(index);

  const selectedValue = useGameStore((s) =>
    s.selected !== null && s.game ? s.game.values[s.selected] : 0,
  );
  const isSameDigit =
    highlightSameSetting &&
    selectedValue !== 0 &&
    value !== 0 &&
    value === selectedValue;

  const isJustEntered = lastEntered === index && value !== 0;

  // Roving tabindex: selected cell has 0, or cell 0 if nothing selected
  const tabIndex = isSelected
    ? 0
    : selectedCell === null && index === 0
      ? 0
      : -1;

  const handleClick = useCallback(
    (cellIndex: number) => {
      select(cellIndex);
    },
    [select],
  );

  return (
    <Cell
      index={index}
      value={value}
      notes={notes}
      isGiven={isGiven}
      isWrong={isWrongCell}
      isSelected={isSelected}
      isPeer={isPeer}
      isSameDigit={isSameDigit}
      isJustEntered={isJustEntered}
      digitSize={digitSize}
      tabIndex={tabIndex}
      onClick={handleClick}
    />
  );
}

export interface BoardProps {
  className?: string;
}

export function Board({ className = '' }: BoardProps) {
  const generating = useGameStore((s) => s.generating);

  return (
    <div
      role="grid"
      aria-label="Sudoku board"
      data-testid="sudoku-board"
      style={{
        gridTemplateRows:
          'repeat(3, minmax(0, 1fr)) 5px repeat(3, minmax(0, 1fr)) 5px repeat(3, minmax(0, 1fr))',
        gridTemplateColumns:
          'repeat(3, minmax(0, 1fr)) 5px repeat(3, minmax(0, 1fr)) 5px repeat(3, minmax(0, 1fr))',
      }}
      className={`relative grid w-full max-w-[600px] aspect-square max-h-[66vh] bg-cream-50 dark:bg-cream-100 border-[3px] border-board-line rounded-[14px] overflow-hidden shadow-[0_6px_0_var(--color-edge)] ${className}`}
    >
      {/* 81 Sudoku cells */}
      {Array.from({ length: 81 }, (_, i) => (
        <ConnectedCell key={i} index={i} />
      ))}

      {/* 3x3 Grid divider bars (5px thick) */}
      <div
        aria-hidden="true"
        style={{ gridArea: '1 / 4 / 12 / 5' }}
        className="bg-board-line pointer-events-none z-10"
      />
      <div
        aria-hidden="true"
        style={{ gridArea: '1 / 8 / 12 / 9' }}
        className="bg-board-line pointer-events-none z-10"
      />
      <div
        aria-hidden="true"
        style={{ gridArea: '4 / 1 / 5 / 12' }}
        className="bg-board-line pointer-events-none z-10"
      />
      <div
        aria-hidden="true"
        style={{ gridArea: '8 / 1 / 9 / 12' }}
        className="bg-board-line pointer-events-none z-10"
      />

      {/* Generating state skeleton overlay */}
      {generating && (
        <div
          data-testid="board-skeleton"
          className="absolute inset-0 z-30 bg-cream-50/70 dark:bg-paper/70 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 animate-pulse"
        >
          <div className="w-12 h-12 rounded-full border-4 border-brand-300 border-t-brand-600 animate-spin" />
          <span className="font-bold text-sm text-slate-500">
            Generating puzzle...
          </span>
        </div>
      )}
    </div>
  );
}
