import type { Step } from '../types';
import type { State } from './candidates';
import {
  applyStep,
  createState,
  eliminate,
  hasDeadCell,
  isSolved,
  place,
} from './candidates';

export type { State };
export type GraderState = State;
export type CandidateElimination = { cell: number; digit: number };
export type TechniqueFn = (state: State) => Step | null;

export const createGraderState = createState;

export function cloneGraderState(state: State): State {
  return {
    cells: new Uint8Array(state.cells),
    cands: new Uint16Array(state.cands),
  };
}

export { applyStep, createState, eliminate, hasDeadCell, isSolved, place };
