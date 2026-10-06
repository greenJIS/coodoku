import { describe, expect, it } from 'vitest';

import * as engine from './index';

describe('engine public API', () => {
  it('exports exactly the documented values', () => {
    expect(Object.keys(engine).sort()).toEqual([
      'DIFFICULTIES',
      'EngineError',
      'TECHNIQUES',
      'countSolutions',
      'generate',
      'generatePuzzle',
      'gradePuzzle',
      'solve',
    ]);
  });
});
