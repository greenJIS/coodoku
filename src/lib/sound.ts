export type SoundKind =
  'place' | 'note' | 'erase' | 'mistake' | 'hint' | 'complete' | 'win' | 'lose';

export interface SoundOptions {
  sound?: boolean;
  volume?: number; // 0..100
}

/** A pitched sine/triangle partial, optionally gliding to a lower pitch. */
interface PartialVoice {
  kind: 'partial';
  freq: number;
  peak: number;
  dur: number;
  type?: OscillatorType;
  glideTo?: number;
  glideDur?: number;
  delay?: number;
}

/** A short burst of band-passed noise: wood tick, paper swish. */
interface NoiseVoice {
  kind: 'noise';
  freq: number;
  q: number;
  peak: number;
  dur: number;
  sweepTo?: number;
  delay?: number;
}

type Voice = PartialVoice | NoiseVoice;

/** Marimba-ish pluck: fundamental, a quick bright partial and a tiny tick. */
function pluck(freq: number, delay = 0, dur = 0.42, level = 1): Voice[] {
  const peak = 0.3 * level;
  return [
    { kind: 'partial', freq, peak, dur, delay },
    {
      kind: 'partial',
      freq: freq * 4,
      peak: peak * 0.28,
      dur: dur * 0.22,
      delay,
    },
    {
      kind: 'noise',
      freq: freq * 3,
      q: 1.2,
      peak: peak * 0.25,
      dur: 0.02,
      delay,
    },
  ];
}

/** Soft bell: inharmonic partials that die away at different speeds. */
function bell(freq: number, delay = 0, dur = 0.9, level = 1): Voice[] {
  const peak = 0.2 * level;
  return [
    { kind: 'partial', freq, peak, dur, delay },
    {
      kind: 'partial',
      freq: freq * 2.76,
      peak: peak * 0.35,
      dur: dur * 0.5,
      delay,
    },
    {
      kind: 'partial',
      freq: freq * 5.4,
      peak: peak * 0.1,
      dur: dur * 0.25,
      delay,
    },
  ];
}

// C major pentatonic: any run of notes stays consonant
const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const A5 = 880;
const C6 = 1046.5;
const G6 = 1568;

const SOUND_SPECS: Record<SoundKind, Voice[]> = {
  // wooden tile set down
  place: [
    {
      kind: 'partial',
      freq: 880,
      peak: 0.28,
      dur: 0.07,
      glideTo: 560,
      glideDur: 0.04,
    },
    { kind: 'noise', freq: 1400, q: 2, peak: 0.12, dur: 0.025 },
  ],
  note: [
    { kind: 'noise', freq: 3200, q: 3, peak: 0.09, dur: 0.018 },
    { kind: 'partial', freq: 1900, peak: 0.06, dur: 0.03 },
  ],
  // paper swish
  erase: [
    { kind: 'noise', freq: 3200, q: 1.1, peak: 0.14, dur: 0.14, sweepTo: 1100 },
  ],
  // gentle thud, not a buzzer
  mistake: [
    {
      kind: 'partial',
      freq: 150,
      peak: 0.4,
      dur: 0.22,
      glideTo: 85,
      glideDur: 0.16,
    },
    {
      kind: 'partial',
      freq: 311,
      peak: 0.1,
      dur: 0.16,
      type: 'triangle',
      glideTo: 220,
      glideDur: 0.14,
      delay: 0.01,
    },
    { kind: 'noise', freq: 400, q: 1, peak: 0.1, dur: 0.04 },
  ],
  hint: [...bell(C6, 0, 0.9, 0.9), ...bell(G6, 0.1, 1, 0.8)],
  complete: [C5, E5, G5].flatMap((f, i) => pluck(f, i * 0.075, 0.38, 0.9)),
  // lead-in lets the placement sound finish before the jingle starts
  win: [
    ...[C5, E5, G5, A5, C6].flatMap((f, i) => pluck(f, 0.3 + i * 0.11, 0.5)),
    ...bell(C6, 0.85, 1.4),
    ...bell(G6, 0.9, 1.4, 0.7),
  ],
  lose: [392, 349.23, 293.66].flatMap((f, i) =>
    pluck(f, 0.3 + i * 0.2, 0.7, 0.8),
  ),
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

const noiseBuffers = new WeakMap<AudioContext, AudioBuffer>();

/** One second of white noise per context, reused by every noise voice. */
function noiseBuffer(ctx: AudioContext): AudioBuffer {
  let buffer = noiseBuffers.get(ctx);
  if (!buffer) {
    buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(ctx, buffer);
  }
  return buffer;
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

      const master = volumePercent / 100;
      const noise = noiseBuffer(ctx);

      for (const voice of SOUND_SPECS[kind] ?? []) {
        const t = ctx.currentTime + (voice.delay ?? 0);
        const gain = ctx.createGain();
        const peak = Math.max(0.0002, voice.peak * master);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(
          peak,
          t + (voice.kind === 'noise' ? 0.003 : 0.004),
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, t + voice.dur);
        gain.connect(ctx.destination);

        if (voice.kind === 'partial') {
          const osc = ctx.createOscillator();
          osc.type = voice.type ?? 'sine';
          osc.frequency.setValueAtTime(voice.freq, t);
          if (voice.glideTo) {
            osc.frequency.exponentialRampToValueAtTime(
              voice.glideTo,
              t + (voice.glideDur ?? 0.05),
            );
          }
          osc.connect(gain);
          osc.start(t);
          osc.stop(t + voice.dur + 0.03);
        } else {
          const src = ctx.createBufferSource();
          const filter = ctx.createBiquadFilter();
          src.buffer = noise;
          filter.type = 'bandpass';
          filter.Q.value = voice.q;
          filter.frequency.setValueAtTime(voice.freq, t);
          if (voice.sweepTo) {
            filter.frequency.exponentialRampToValueAtTime(
              voice.sweepTo,
              t + voice.dur,
            );
          }
          src.connect(filter);
          filter.connect(gain);
          src.start(t);
          src.stop(t + voice.dur + 0.02);
        }
      }
    } catch {
      // Audio failed or blocked
    }
  },
};
