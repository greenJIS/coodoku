import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type SoundKind, sound } from './sound';

function createMockAudioContext() {
  const oscillators: Array<{
    type: string;
    freq: number;
    startTime: number;
    stopTime: number;
  }> = [];

  const gains: Array<{
    setValueAtTimeCalls: Array<[number, number]>;
    exponentialRampCalls: Array<[number, number]>;
  }> = [];

  const mockCtx = {
    currentTime: 10,
    state: 'running',
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
    createOscillator: vi.fn(() => {
      const osc = {
        type: 'sine',
        frequency: {
          setValueAtTime: vi.fn((val: number) => {
            oscData.freq = val;
          }),
        },
        connect: vi.fn(),
        start: vi.fn((t: number) => {
          oscData.startTime = t;
        }),
        stop: vi.fn((t: number) => {
          oscData.stopTime = t;
        }),
      };
      const oscData = {
        type: 'sine',
        freq: 0,
        startTime: 0,
        stopTime: 0,
      };
      oscillators.push(oscData);
      return osc;
    }),
    createGain: vi.fn(() => {
      const g = {
        gain: {
          setValueAtTime: vi.fn((v: number, t: number) => {
            gainData.setValueAtTimeCalls.push([v, t]);
          }),
          exponentialRampToValueAtTime: vi.fn((v: number, t: number) => {
            gainData.exponentialRampCalls.push([v, t]);
          }),
        },
        connect: vi.fn(),
      };
      const gainData = {
        setValueAtTimeCalls: [] as Array<[number, number]>,
        exponentialRampCalls: [] as Array<[number, number]>,
      };
      gains.push(gainData);
      return g;
    }),
  } as unknown as AudioContext;

  return { mockCtx, oscillators, gains };
}

describe('sound system', () => {
  beforeEach(() => {
    sound.setAudioContext(null);
  });

  afterEach(() => {
    sound.setAudioContext(null);
    vi.restoreAllMocks();
  });

  it('no-ops when sound is disabled or volume is 0', () => {
    const { mockCtx } = createMockAudioContext();
    sound.setAudioContext(mockCtx);

    sound.play('place', { sound: false, volume: 60 });
    expect(mockCtx.createOscillator).not.toHaveBeenCalled();

    sound.play('place', { sound: true, volume: 0 });
    expect(mockCtx.createOscillator).not.toHaveBeenCalled();
  });

  it('no-ops when AudioContext is unavailable', () => {
    sound.setAudioContext(null);
    const originalCtx = window.AudioContext;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).AudioContext;

    expect(() =>
      sound.play('place', { sound: true, volume: 50 }),
    ).not.toThrow();

    window.AudioContext = originalCtx;
  });

  const ALL_KINDS: SoundKind[] = [
    'place',
    'note',
    'erase',
    'mistake',
    'hint',
    'complete',
    'win',
    'lose',
  ];

  it.each(ALL_KINDS)('schedules oscillators for sound kind: %s', (kind) => {
    const { mockCtx, oscillators, gains } = createMockAudioContext();
    sound.setAudioContext(mockCtx);

    sound.play(kind, { sound: true, volume: 50 });

    expect(oscillators.length).toBeGreaterThan(0);
    expect(gains.length).toBe(oscillators.length);

    // Each oscillator was started and stopped
    for (const osc of oscillators) {
      expect(osc.startTime).toBeGreaterThanOrEqual(10);
      expect(osc.stopTime).toBeGreaterThan(osc.startTime);
    }
  });

  it('resumes suspended audio context on play', () => {
    const { mockCtx } = createMockAudioContext();
    Object.defineProperty(mockCtx, 'state', { value: 'suspended' });
    sound.setAudioContext(mockCtx);

    sound.play('place');
    expect(mockCtx.resume).toHaveBeenCalled();
  });
});
