# Coodoku

A solo sudoku game that runs entirely in the browser. No accounts, no backend: puzzles are generated on your device
and your scores stay in `localStorage`.

**Play:** [greenjis.github.io/coodoku](https://greenjis.github.io/coodoku/)

## Features

- Four difficulties (Easy, Medium, Hard, Expert), graded by the solving technique a puzzle needs, not by clue count.
  Every puzzle has exactly one solution and never needs guessing.
- Notes, hints, undo, five hearts, and a pause screen that hides the board.
- Highlights for peers and matching digits, auto-removal of notes, and an optional mistake check.
- Light and dark themes, large digits, a left-handed layout, and reduced-motion support.
- Synthesized sound effects and vibration, both optional.
- A random name for every game, editable in Settings. Solved counts and best times are kept per difficulty.

## Development

Requires Node 24 (see `.nvmrc`).

```bash
npm install
npm run dev       # dev server
npm test          # tests in watch mode
npm run build     # type-check and production build
npm run bench     # puzzle generation timings
```

Set `VITE_BASE=/coodoku/` when building for a sub-path such as GitHub Pages. The deploy workflow does this itself.

## Stack

React, TypeScript (strict), Vite, Tailwind CSS v4, Zustand, and Vitest. The puzzle engine (solver, generator, technique
grader) is written from scratch in `src/engine/` and runs in a Web Worker.

## Credits

Fonts are Nunito and Patrick Hand under the SIL Open Font License. See [ASSETS.md](ASSETS.md).

## License

[MIT](LICENSE)
