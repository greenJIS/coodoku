import { generate } from '../engine';
import type { GenerateCallOptions, Puzzle } from '../engine';

export type EngineGenerator = (options: GenerateCallOptions) => Promise<Puzzle>;

let currentGenerator: EngineGenerator = generate;

export const engineClient = {
  generate(options: GenerateCallOptions): Promise<Puzzle> {
    return currentGenerator(options);
  },
  setGenerator(generator: EngineGenerator): void {
    currentGenerator = generator;
  },
  resetGenerator(): void {
    currentGenerator = generate;
  },
};
