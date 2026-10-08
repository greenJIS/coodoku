import { describe, expect, it } from 'vitest';

const components = import.meta.glob<string>('./**/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const styles = import.meta.glob<string>('./index.css', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const BOLD = /\bfont-(thin|light|medium|semibold|bold|extrabold|black)\b/;

describe('typeface', () => {
  it('uses no bold-family classes (Patrick Hand has one weight)', () => {
    const offenders = Object.entries(components)
      .filter(([path]) => !path.endsWith('.test.tsx'))
      .filter(([, source]) => BOLD.test(source))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });

  it('declares Patrick Hand as the sans font and drops Nunito', async () => {
    let css = Object.values(styles).join('\n');
    if (!css) {
      // @ts-expect-error Node fs in Vitest runner
      const fs = (await import('node:fs')) as {
        readFileSync: (path: string, encoding: string) => string;
      };
      css = fs.readFileSync('src/index.css', 'utf8');
    }
    expect(css).toMatch(/--font-sans:\s*'Patrick Hand'/);
    expect(css).not.toMatch(/Nunito/i);
  });
});
