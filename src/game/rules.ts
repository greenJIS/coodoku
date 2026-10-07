import { clearBit, hasNote, peers, toggleBit } from './cells';
import type { Change, GameState, GameStatus, RuleOptions } from './types';

export function placeDigit(
  state: GameState,
  cell: number,
  digit: number,
  opts: RuleOptions,
): GameState {
  if (state.status !== 'playing') return state;
  if (cell < 0 || cell >= 81 || digit < 1 || digit > 9) return state;
  if (state.givens[cell] !== 0) return state;
  if (state.values[cell] === digit) return state;
  if (opts.mistakeCheck && state.values[cell] === state.solution[cell]) {
    return state;
  }

  const changes: Change[] = [
    {
      cell,
      prevValue: state.values[cell],
      prevNotes: state.notes[cell],
    },
  ];

  const newValues = [...state.values];
  newValues[cell] = digit;

  const newNotes = [...state.notes];
  newNotes[cell] = 0;

  if (opts.autoRemoveNotes) {
    for (const peerCell of peers(cell)) {
      if (hasNote(newNotes[peerCell], digit)) {
        changes.push({
          cell: peerCell,
          prevValue: newValues[peerCell],
          prevNotes: newNotes[peerCell],
        });
        newNotes[peerCell] = clearBit(newNotes[peerCell], digit);
      }
    }
  }

  let hearts = state.hearts;
  let status: GameStatus = state.status;
  const isCorrect = digit === state.solution[cell];

  if (opts.mistakeCheck && !isCorrect) {
    hearts = Math.max(0, hearts - 1);
    if (hearts === 0) {
      status = 'lost';
    }
  }

  if (status === 'playing') {
    let won = true;
    for (let c = 0; c < 81; c++) {
      if (newValues[c] !== state.solution[c]) {
        won = false;
        break;
      }
    }
    if (won) {
      status = 'won';
    }
  }

  return {
    ...state,
    values: newValues,
    notes: newNotes,
    hearts,
    status,
    history: [...state.history, changes],
  };
}

export function toggleNote(
  state: GameState,
  cell: number,
  digit: number,
): GameState {
  if (state.status !== 'playing') return state;
  if (cell < 0 || cell >= 81 || digit < 1 || digit > 9) return state;
  if (state.values[cell] !== 0) return state;

  const prevNotes = state.notes[cell];
  const nextNotes = toggleBit(prevNotes, digit);
  const newNotes = [...state.notes];
  newNotes[cell] = nextNotes;

  const change: Change = {
    cell,
    prevValue: state.values[cell],
    prevNotes,
  };

  return {
    ...state,
    notes: newNotes,
    history: [...state.history, [change]],
  };
}

export function erase(state: GameState, cell: number): GameState {
  if (state.status !== 'playing') return state;
  if (cell < 0 || cell >= 81) return state;
  if (state.givens[cell] !== 0) return state;
  if (state.values[cell] === 0 && state.notes[cell] === 0) return state;

  const change: Change = {
    cell,
    prevValue: state.values[cell],
    prevNotes: state.notes[cell],
  };

  const newValues = [...state.values];
  newValues[cell] = 0;

  const newNotes = [...state.notes];
  newNotes[cell] = 0;

  return {
    ...state,
    values: newValues,
    notes: newNotes,
    history: [...state.history, [change]],
  };
}

export function undo(state: GameState): GameState {
  if (state.status !== 'playing') return state;
  if (state.history.length === 0) return state;

  const lastMove = state.history[state.history.length - 1];
  const newValues = [...state.values];
  const newNotes = [...state.notes];

  for (const change of lastMove) {
    newValues[change.cell] = change.prevValue;
    newNotes[change.cell] = change.prevNotes;
  }

  return {
    ...state,
    values: newValues,
    notes: newNotes,
    history: state.history.slice(0, -1),
  };
}

export function revealHint(state: GameState, cell: number): GameState {
  if (state.status !== 'playing') return state;
  if (cell < 0 || cell >= 81) return state;
  if (state.hintsLeft <= 0) return state;
  if (state.givens[cell] !== 0) return state;
  if (state.values[cell] === state.solution[cell]) return state;

  const solutionDigit = state.solution[cell];
  const change: Change = {
    cell,
    prevValue: state.values[cell],
    prevNotes: state.notes[cell],
  };

  const newValues = [...state.values];
  newValues[cell] = solutionDigit;

  const newNotes = [...state.notes];
  newNotes[cell] = 0;

  let status: GameStatus = state.status;
  let won = true;
  for (let c = 0; c < 81; c++) {
    if (newValues[c] !== state.solution[c]) {
      won = false;
      break;
    }
  }
  if (won) {
    status = 'won';
  }

  return {
    ...state,
    values: newValues,
    notes: newNotes,
    hintsLeft: state.hintsLeft - 1,
    status,
    history: [...state.history, [change]],
  };
}

export function tick(state: GameState, dtMs: number): GameState {
  if (state.status !== 'playing' || dtMs <= 0) return state;
  return {
    ...state,
    elapsedMs: state.elapsedMs + dtMs,
  };
}
