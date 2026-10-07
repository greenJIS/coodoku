import { generate } from '../engine';
import type { GenerateCallOptions, GenerateRequest, Puzzle } from '../engine';

export type EngineGenerator = (
  request: GenerateRequest,
  options?: GenerateCallOptions,
) => Promise<Puzzle>;

let currentGenerator: EngineGenerator = generate;

export const engineClient = {
  generate(
    request: GenerateRequest,
    options?: GenerateCallOptions,
  ): Promise<Puzzle> {
    return currentGenerator(request, options);
  },
  setGenerator(generator: EngineGenerator): void {
    currentGenerator = generator;
  },
  resetGenerator(): void {
    currentGenerator = generate;
  },
};
