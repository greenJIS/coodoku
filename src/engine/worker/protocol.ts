import type { Difficulty, Puzzle } from '../types';

export interface WorkerRequest {
  id: number;
  difficulty: Difficulty;
  seed?: number;
  budgetMs?: number;
}

export type WorkerResponse =
  | { id: number; ok: true; result: Puzzle }
  | { id: number; ok: false; error: string };
