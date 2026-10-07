export type SoundKind =
  'place' | 'note' | 'erase' | 'mistake' | 'hint' | 'complete' | 'win' | 'lose';

export interface SoundOptions {
  sound?: boolean;
  volume?: number; // 0..100
}

interface ToneSpec {
  freq: number;
  dur: number;
  type?: OscillatorType;
  vol?: number;
  delay?: number;
}

const SOUND_SPECS: Record<SoundKind, ToneSpec[]> = {
  place: [{ freq: 520, dur: 0.09, type: 'triangle' }],
  note: [{ freq: 840, dur: 0.05, type: 'sine', vol: 0.5 }],
  erase: [{ freq: 300, dur: 0.08, type: 'sine', vol: 0.6 }],
  mistake: [{ freq: 170, dur: 0.2, type: 'sawtooth', vol: 0.7 }],
  hint: [
    { freq: 587, dur: 0.1, type: 'sine', vol: 0.8 },
    { freq: 880, dur: 0.15, type: 'sine', vol: 0.8, delay: 0.08 },
  ],
  complete: [
    { freq: 660, dur: 0.1, type: 'triangle', vol: 1 },
    { freq: 880, dur: 0.14, type: 'triangle', vol: 1, delay: 0.09 },
  ],
  win: [
    { freq: 523, dur: 0.22, type: 'triangle', vol: 1, delay: 0 },
    { freq: 659, dur: 0.22, type: 'triangle', vol: 1, delay: 0.12 },
    { freq: 784, dur: 0.22, type: 'triangle', vol: 1, delay: 0.24 },
    { freq: 1047, dur: 0.22, type: 'triangle', vol: 1, delay: 0.36 },
  ],
  lose: [
    { freq: 220, dur: 0.22, type: 'sawtooth', vol: 0.7, delay: 0 },
    { freq: 196, dur: 0.22, type: 'sawtooth', vol: 0.7, delay: 0.14 },
    { freq: 175, dur: 0.22, type: 'sawtooth', vol: 0.7, delay: 0.28 },
    { freq: 147, dur: 0.22, type: 'sawtooth', vol: 0.7, delay: 0.42 },
  ],
};

let audioCtx: AudioContext | null = null;

function getOrCreateContext(): AudioContext | null {
  if (audioCtx) return audioCtx;
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return null;
  try {
    audioCtx = new AudioContextClass();
    return audioCtx;
  } catch {
    return null;
  }
}

export const sound = {
  setAudioContext(ctx: AudioContext | null): void {
    audioCtx = ctx;
  },

  getAudioContext(): AudioContext | null {
    return audioCtx;
  },

  play(kind: SoundKind, opts?: SoundOptions): void {
    const isEnabled = opts?.sound ?? true;
    const volumePercent = opts?.volume ?? 60;
    if (!isEnabled || volumePercent <= 0) return;
    if (typeof window === 'undefined') return;

    const ctx = getOrCreateContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      const masterVol = volumePercent / 100;
      const specs = SOUND_SPECS[kind] ?? [];

      for (const spec of specs) {
        const delay = spec.delay ?? 0;
        const dur = spec.dur;
        const vol = spec.vol ?? 1;
        const type = spec.type ?? 'sine';

        const t = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(spec.freq, t);

        const targetGain = Math.max(0.0002, 0.25 * vol * masterVol);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(targetGain, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + dur + 0.02);
      }
    } catch {
      // Audio failed or blocked
    }
  },
};
