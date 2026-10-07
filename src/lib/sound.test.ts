import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type SoundKind, sound } from './sound';

function createMockAudioContext() {
  const oscillators: Array<{
    type: string;
    freq: number;
    startTime: number;
    stopTime: number;
  }> = [];

  const sources: Array<{ startTime: number; stopTime: number }> = [];
  const filters: Array<{ type: string; q: number }> = [];

  const gains: Array<{
    setValueAtTimeCalls: Array<[number, number]>;
    exponentialRampCalls: Array<[number, number]>;
  }> = [];

  const mockCtx = {
    currentTime: 10,
    state: 'running',
    destination: {},
    sampleRate: 100,
    createBuffer: vi.fn((_ch: number, length: number) => ({
      getChannelData: () => new Float32Array(length),
    })),
    createBufferSource: vi.fn(() => {
      const data = { startTime: 0, stopTime: 0 };
      sources.push(data);
      return {
        buffer: null,
        connect: vi.fn(),
        start: vi.fn((t: number) => {
          data.startTime = t;
        }),
        stop: vi.fn((t: number) => {
          data.stopTime = t;
        }),
      };
    }),
    createBiquadFilter: vi.fn(() => {
      const data = { type: '', q: 0 };
      filters.push(data);
      return {
        set type(v: string) {
          data.type = v;
        },
        Q: {
          set value(v: number) {
            data.q = v;
          },
        },
        frequency: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      };
    }),
    resume: vi.fn().mockResolvedValue(undefined),
    createOscillator: vi.fn(() => {
      const osc = {
        type: 'sine',
        frequency: {
          setValueAtTime: vi.fn((val: number) => {
            oscData.freq = val;
          }),
          exponentialRampToValueAtTime: vi.fn(),
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

  return { mockCtx, oscillators, sources, filters, gains };
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

  it.each(ALL_KINDS)('schedules every voice for sound kind: %s', (kind) => {
    const { mockCtx, oscillators, sources, gains } = createMockAudioContext();
    sound.setAudioContext(mockCtx);

    sound.play(kind, { sound: true, volume: 50 });

    // One gain envelope per oscillator or noise burst
    expect(oscillators.length + sources.length).toBeGreaterThan(0);
    expect(gains.length).toBe(oscillators.length + sources.length);

    for (const voice of [...oscillators, ...sources]) {
      expect(voice.startTime).toBeGreaterThanOrEqual(10);
      expect(voice.stopTime).toBeGreaterThan(voice.startTime);
    }
  });

  it('uses band-passed noise for the wooden tick and paper swish', () => {
    const { mockCtx, sources, filters } = createMockAudioContext();
    sound.setAudioContext(mockCtx);

    sound.play('erase', { sound: true, volume: 50 });

    expect(sources).toHaveLength(1);
    expect(filters).toEqual([{ type: 'bandpass', q: 1.1 }]);
  });

  it('keeps the win jingle and lose motif behind the placement sound', () => {
    for (const kind of ['win', 'lose'] as const) {
      const { mockCtx, oscillators } = createMockAudioContext();
      sound.setAudioContext(mockCtx);

      sound.play(kind, { sound: true, volume: 50 });

      const first = Math.min(...oscillators.map((o) => o.startTime));
      expect(first).toBeGreaterThanOrEqual(10.3);
    }
  });

  it('scales every envelope peak with the volume setting', () => {
    const peak = (volume: number): number => {
      const { mockCtx, gains } = createMockAudioContext();
      sound.setAudioContext(mockCtx);
      sound.play('mistake', { sound: true, volume });
      return gains[0].exponentialRampCalls[0][0];
    };

    expect(peak(100)).toBeCloseTo(peak(50) * 2, 5);
  });

  it('resumes suspended audio context on play', () => {
    const { mockCtx } = createMockAudioContext();
    Object.defineProperty(mockCtx, 'state', { value: 'suspended' });
    sound.setAudioContext(mockCtx);

    sound.play('place');
    expect(mockCtx.resume).toHaveBeenCalled();
  });
});
