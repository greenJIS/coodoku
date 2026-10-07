export const SETTINGS_KEY = 'coodoku:settings:v1';
export const STATS_KEY = 'coodoku:stats:v1';
export const GAME_KEY = 'coodoku:game:v1';

interface StorageEnvelope<T> {
  v: 1;
  data: T;
}

export function writeKey<T>(key: string, data: T): void {
  try {
    const envelope: StorageEnvelope<T> = { v: 1, data };
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    // Ignore storage quota or disabled errors
  }
}

export function readKey<T>(
  key: string,
  validate: (data: unknown) => T | null,
): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return null;
    }
    const env = parsed as Record<string, unknown>;
    if (env.v !== 1 || !('data' in env)) {
      return null;
    }
    return validate(env.data);
  } catch {
    return null;
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
}
