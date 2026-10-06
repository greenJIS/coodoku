import { afterEach, describe, expect, it, vi } from 'vitest';

import { EngineError } from '../errors';
import { generatePuzzle } from '../generate';
import { isValidSolution } from '../grid';
import type { Puzzle } from '../types';
import { createEngineClient } from './client';
import type { WorkerLike } from './client';
import type { WorkerRequest, WorkerResponse } from './protocol';

class FakeWorker implements WorkerLike {
  onmessage: ((event: MessageEvent<WorkerResponse>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  sent: WorkerRequest[] = [];
  terminated = false;

  postMessage(message: WorkerRequest): void {
    this.sent.push(message);
  }

  terminate(): void {
    this.terminated = true;
  }

  reply(response: WorkerResponse): void {
    this.onmessage?.(new MessageEvent('message', { data: response }));
  }

  crash(message: string): void {
    this.onerror?.(new ErrorEvent('error', { message }));
  }
}

function setup(): {
  workers: FakeWorker[];
  client: ReturnType<typeof createEngineClient>;
} {
  const workers: FakeWorker[] = [];
  const client = createEngineClient(() => {
    const worker = new FakeWorker();
    workers.push(worker);
    return worker;
  });
  return { workers, client };
}

const sample: Puzzle = generatePuzzle({ difficulty: 'easy', seed: 1 });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('engine client with a worker', () => {
  it('sends the request and resolves with the reply', async () => {
    const { workers, client } = setup();
    const promise = client.generate({ difficulty: 'easy', seed: 4 });
    const [worker] = workers;
    expect(worker.sent).toHaveLength(1);
    expect(worker.sent[0]).toMatchObject({ difficulty: 'easy', seed: 4 });
    worker.reply({ id: worker.sent[0].id, ok: true, result: sample });
    await expect(promise).resolves.toBe(sample);
  });

  it('reuses one worker across calls', async () => {
    const { workers, client } = setup();
    const first = client.generate({ difficulty: 'easy' });
    workers[0].reply({ id: workers[0].sent[0].id, ok: true, result: sample });
    await first;
    const second = client.generate({ difficulty: 'easy' });
    workers[0].reply({ id: workers[0].sent[1].id, ok: true, result: sample });
    await second;
    expect(workers).toHaveLength(1);
  });

  it('rejects with EngineError when the worker reports an error', async () => {
    const { workers, client } = setup();
    const promise = client.generate({ difficulty: 'easy' });
    workers[0].reply({ id: workers[0].sent[0].id, ok: false, error: 'boom' });
    await expect(promise).rejects.toBeInstanceOf(EngineError);
    await expect(promise).rejects.toThrow('boom');
  });

  it('rejects with AbortError and restarts the worker on abort', async () => {
    const { workers, client } = setup();
    const controller = new AbortController();
    const promise = client.generate(
      { difficulty: 'expert' },
      { signal: controller.signal },
    );
    controller.abort();
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
    expect(workers[0].terminated).toBe(true);

    const next = client.generate({ difficulty: 'easy' });
    expect(workers).toHaveLength(2);
    workers[1].reply({ id: workers[1].sent[0].id, ok: true, result: sample });
    await expect(next).resolves.toBe(sample);
  });

  it('rejects other pending requests when an abort restarts the worker', async () => {
    const { client } = setup();
    const controller = new AbortController();
    const aborted = client.generate(
      { difficulty: 'expert' },
      { signal: controller.signal },
    );
    const bystander = client.generate({ difficulty: 'hard' });
    controller.abort();
    await expect(aborted).rejects.toMatchObject({ name: 'AbortError' });
    await expect(bystander).rejects.toBeInstanceOf(EngineError);
  });

  it('rejects at once for a signal that is already aborted', async () => {
    const { workers, client } = setup();
    const controller = new AbortController();
    controller.abort();
    await expect(
      client.generate({ difficulty: 'easy' }, { signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(workers).toHaveLength(0);
  });

  it('rejects pending requests and replaces the worker when it crashes', async () => {
    const { workers, client } = setup();
    const promise = client.generate({ difficulty: 'easy' });
    workers[0].crash('worker blew up');
    await expect(promise).rejects.toBeInstanceOf(EngineError);
    expect(workers[0].terminated).toBe(true);

    client.generate({ difficulty: 'easy' }).catch(() => undefined);
    expect(workers).toHaveLength(2);
  });

  it('dispose rejects pending requests and stops the worker', async () => {
    const { workers, client } = setup();
    const promise = client.generate({ difficulty: 'easy' });
    client.dispose();
    await expect(promise).rejects.toBeInstanceOf(EngineError);
    expect(workers[0].terminated).toBe(true);
  });
});

describe('engine client without Worker support', () => {
  it('generates on the main thread', async () => {
    vi.stubGlobal('Worker', undefined);
    const client = createEngineClient();
    const result = await client.generate({ difficulty: 'easy', seed: 3 });
    expect(isValidSolution(result.solution)).toBe(true);
    expect(result.difficulty).toBe('easy');
  });

  it('wraps failures in EngineError', async () => {
    vi.stubGlobal('Worker', undefined);
    const client = createEngineClient();
    await expect(
      // @ts-expect-error deliberately passing a bad runtime value
      client.generate({ difficulty: 'nightmare' }),
    ).rejects.toBeInstanceOf(EngineError);
  });
});
