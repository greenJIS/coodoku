export type HapticKind =
  'place' | 'note' | 'erase' | 'mistake' | 'win' | 'lose' | 'tap';

const PATTERNS: Record<HapticKind, number | number[]> = {
  place: 10,
  note: 8,
  erase: 12,
  mistake: [30, 40, 30],
  win: [40, 60, 40, 60, 80],
  lose: [60, 80, 100],
  tap: 10,
};

export const haptics = {
  tap(kind: HapticKind = 'tap', enabled = true): void {
    if (!enabled) return;
    if (
      typeof navigator === 'undefined' ||
      typeof navigator.vibrate !== 'function'
    ) {
      return;
    }
    try {
      const pattern = PATTERNS[kind] ?? 10;
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration error
    }
  },
};
