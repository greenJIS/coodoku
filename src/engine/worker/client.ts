import { EngineError } from '../errors';
import { generatePuzzle } from '../generate';
import type { Difficulty, Puzzle } from '../types';
import type { WorkerRequest, WorkerResponse } from './protocol';

export interface GenerateRequest {
  difficulty: Difficulty;
  seed?: number;
  budgetMs?: number;
}

export interface GenerateCallOptions {
  /** Aborting restarts the worker, because generation cannot be interrupted. */
  signal?: AbortSignal;
}

/** The part of Worker the client uses. Tests supply a fake. */
export interface WorkerLike {
  postMessage(message: WorkerRequest): void;
  terminate(): void;
  onmessage: ((event: MessageEvent<WorkerResponse>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
}

export type WorkerFactory = () => WorkerLike;

export interface EngineClient {
  generate(
    request: GenerateRequest,
    options?: GenerateCallOptions,
  ): Promise<Puzzle>;
  /** Rejects anything still pending and stops the worker. */
  dispose(): void;
}

interface Pending {
  resolve: (puzzle: Puzzle) => void;
  reject: (error: unknown) => void;
}

const createRealWorker: WorkerFactory = () =>
  new Worker(new URL('./generator.worker.ts', import.meta.url), {
    type: 'module',
  });

const abortError = (): DOMException =>
  new DOMException('Generation aborted', 'AbortError');

function toEngineError(error: unknown): EngineError {
  if (error instanceof EngineError) return error;
  const message = error instanceof Error ? error.message : String(error);
  return new EngineError(message, { cause: error });
}

/** Used when no Worker exists (jsdom tests, very old browsers). */
function runOnMainThread(request: GenerateRequest): Promise<Puzzle> {
  return new Promise((resolve, reject) => {
    try {
      resolve(generatePuzzle(request));
    } catch (error) {
      reject(toEngineError(error));
    }
  });
}

/**
 * Promise API over one long-lived worker. `factory` is only for tests; by
 * default it creates the real worker, or runs on the main thread if the
 * environment has no Worker.
 */
export function createEngineClient(factory?: WorkerFactory): EngineClient {
  let worker: WorkerLike | null = null;
  let nextId = 1;
  const pending = new Map<number, Pending>();

  const failAll = (error: Error): void => {
    const entries = [...pending.values()];
    pending.clear();
    for (const entry of entries) entry.reject(error);
  };

  const dropWorker = (): void => {
    worker?.terminate();
    worker = null;
  };

  const ensureWorker = (make: WorkerFactory): WorkerLike => {
    if (worker !== null) return worker;
    const created = make();
    created.onmessage = (event) => {
      const response = event.data;
      const entry = pending.get(response.id);
      if (entry === undefined) return;
      pending.delete(response.id);
      if (response.ok) entry.resolve(response.result);
      else entry.reject(new EngineError(response.error));
    };
    created.onerror = (event) => {
      failAll(new EngineError(event.message || 'Worker crashed'));
      dropWorker();
    };
    worker = created;
    return created;
  };

  const generate = (
    request: GenerateRequest,
    options: GenerateCallOptions = {},
  ): Promise<Puzzle> => {
    const { signal } = options;
    if (signal?.aborted) return Promise.reject(abortError());
    const make =
      factory ?? (typeof Worker === 'undefined' ? null : createRealWorker);
    if (make === null) return runOnMainThread(request);

    return new Promise<Puzzle>((resolve, reject) => {
      const id = nextId++;
      const cleanup = (): void => {
        signal?.removeEventListener('abort', onAbort);
        pending.delete(id);
      };
      const onAbort = (): void => {
        cleanup();
        reject(abortError());
        failAll(new EngineError('Cancelled: the worker was restarted'));
        dropWorker();
      };
      pending.set(id, {
        resolve: (puzzle) => {
          cleanup();
          resolve(puzzle);
        },
        reject: (error) => {
          cleanup();
          reject(error);
        },
      });
      signal?.addEventListener('abort', onAbort, { once: true });
      ensureWorker(make).postMessage({ id, ...request });
    });
  };

  const dispose = (): void => {
    failAll(new EngineError('Engine client disposed'));
    dropWorker();
  };

  return { generate, dispose };
}

const defaultClient = createEngineClient();

/** Generate a puzzle off the main thread. */
export const generate = defaultClient.generate;
