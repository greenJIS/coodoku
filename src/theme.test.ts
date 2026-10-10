import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const styles = import.meta.glob<string>('./index.css', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const components = import.meta.glob<string>('./**/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const css = Object.values(styles)[0] || readFileSync('src/index.css', 'utf8');
const darkBlock = /\[data-theme='dark'\]\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';

function token(name: string): string {
  const match = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(
    darkBlock,
  );
  if (!match?.[1]) throw new Error(`dark token --color-${name} not found`);
  return match[1];
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const [r = 0, g = 0, b = 0] = channels;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi = 0, lo = 0] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const SURFACES = ['paper', 'cream-50', 'cream-100', 'cream-200'];

describe('dark palette', () => {
  it.each(['ink-900', 'ink-600', 'ink-500', 'slate-500', 'slate-400'])(
    'text token %s is at least 4.5:1 on every surface',
    (name) => {
      for (const surface of SURFACES) {
        expect(contrast(token(name), token(surface))).toBeGreaterThanOrEqual(
          4.5,
        );
      }
    },
  );

  it('icon and edge are at least 3:1 on cells and page', () => {
    for (const name of ['icon', 'edge']) {
      for (const surface of ['paper', 'cream-50']) {
        expect(contrast(token(name), token(surface))).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('edge is at least 2.8:1 on cards', () => {
    expect(contrast(token('edge'), token('cream-100'))).toBeGreaterThanOrEqual(
      2.8,
    );
  });

  it('digits stay readable on the selected and peer fills', () => {
    expect(contrast(token('ink-900'), token('sel'))).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(contrast(token('user'), token('sel'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token('error'), token('sel'))).toBeGreaterThanOrEqual(3);
    expect(contrast(token('error'), token('peer'))).toBeGreaterThanOrEqual(3);
    expect(contrast(token('ink-900'), token('peer'))).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it('peer fill is visibly lighter than a cell', () => {
    expect(contrast(token('peer'), token('cream-50'))).toBeGreaterThanOrEqual(
      1.4,
    );
  });

  it('defines the icon token in @theme', () => {
    expect(css).toMatch(/--color-icon:\s*var\(--color-brand-700\)/);
  });
});

describe('hardcoded dark colors', () => {
  // Intentionally kept (spec "Intentionally left")
  const ALLOWED = [
    'dark:after:bg-[#fff7e6]',
    'dark:bg-[#4a1f2b]',
    'dark:text-[#ff8aa5]',
  ];

  it('no component uses a dark: variant with a hex literal', () => {
    const offenders: string[] = [];
    for (const [path, source] of Object.entries(components)) {
      if (path.endsWith('.test.tsx')) continue;
      for (const hit of source.match(/dark:[^\s`'"]*\[#[0-9a-fA-F]{3,8}\]/g) ??
        []) {
        if (!ALLOWED.includes(hit)) offenders.push(`${path}: ${hit}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('selected cell draws a dark-only ring pseudo-element', () => {
    const cell = components['./components/Cell.tsx'] ?? '';
    expect(cell).toContain('dark:before:border-brand-500');
  });
});
