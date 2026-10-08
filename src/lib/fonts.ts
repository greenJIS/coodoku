/**
 * Resolve once Patrick Hand is usable. Fontsource faces load lazily, so
 * `document.fonts.ready` can resolve before the font is even requested; ask
 * for it explicitly. Never rejects: a failed load just means the fallback font.
 */
export function loadUiFont(): Promise<unknown> {
  if (!('fonts' in document)) return Promise.resolve();
  return document.fonts.load('1em "Patrick Hand"').catch(() => undefined);
}
