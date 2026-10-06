import { generatePuzzle } from '../generate';
import type { WorkerRequest, WorkerResponse } from './protocol';

self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const { id, difficulty, seed, budgetMs } = event.data;
  let response: WorkerResponse;
  try {
    response = {
      id,
      ok: true,
      result: generatePuzzle({ difficulty, seed, budgetMs }),
    };
  } catch (error) {
    response = {
      id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
  self.postMessage(response);
});
