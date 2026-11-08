import { VoiceStyle } from '../types/game';
import { SpeechEngine } from './speechEngine';
import type { SpeechLang } from './speechText';

/**
 * Zero-dependency Web Audio synthesizer + preschool speech manager.
 *
 * Sound design notes
 *  - Every voice goes through click-free envelopes, a little stereo movement and a short, soft
 *    "room" reverb, so effects sound like objects in a space instead of raw oscillator beeps.
 *  - Bells, xylophone and piano use inharmonic / harmonic partial stacks with their own decay
 *    times, which is what makes them sound like the real instruments.
 *  - Water, leaves and crunches are shaped noise (not tones), as in real life.
 *  - Speech lives in ./speechEngine (voice choice, Dutch letter names, text clean-up).
 */

type Instrument = 'piano' | 'xylophone' | 'bell';

interface ToneOptions {
  freq: number;
  /** Piecewise exponential pitch path [secondsFromStart, Hz][]; overrides freq/endFreq. */
  freqPath?: [number, number][];
  /** Exponential glide target reached after `glideTime` (default: `decay`). */
  endFreq?: number;
  glideTime?: number;
  type?: OscillatorType;
  /** Start offset in seconds from now. */
  at?: number;
  attack?: number;
  /** Seconds until the voice has faded to silence. */
  decay: number;
  gain: number;
  /** Cents. */
  detune?: number;
  /** -1 (left) … 1 (right). */
  pan?: number;
  /** Reverb send, 0 … 1. */
  space?: number;
  /** Static low-pass cutoff in Hz to soften harsh waveforms. */
  lowpass?: number;
  /** Pitch wobble: LFO rate (Hz) and depth (Hz), optionally easing to endDepth. */
  vibrato?: { rate: number; depth: number; endDepth?: number };
}

interface NoiseOptions {
  at?: number;
  duration: number;
  type: BiquadFilterType;
  freq: number;
  endFreq?: number;
  q?: number;
  gain: number;
  attack?: number;
  pan?: number;
  space?: number;
}

const SILENCE = 0.0001;
const MASTER_VOLUME = 0.7;

/** Cubic soft clip: unity-ish for normal levels, rounds peaks smoothly, never exceeds full scale. */
const SoftLimiter = {
  curve(): Float32Array<ArrayBuffer> {
    const n = 2048;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      curve[i] = 1.5 * x - 0.5 * x * x * x;
    }
    return curve;
  },
};
const rand = (min: number, max: number) => min + Math.random() * (max - min);

export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  /** Everything (dry voices and the reverb return) is summed here, then soft-limited. */
  private mixBus: GainNode | null = null;
  private dryBus: GainNode | null = null;
  private reverbSend: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private isMuted: boolean = false;
  private isVoiceMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicInterval: ReturnType<typeof setInterval> | null = null;
  private voiceStyle: VoiceStyle = 'soft-lady';
  private readonly speech = new SpeechEngine();

  constructor() {
    try {
      const savedStyle = localStorage.getItem('abc_kids_voice_style') as VoiceStyle;
      if (savedStyle && ['soft-lady', 'sweet-story', 'cheerful'].includes(savedStyle)) {
        this.voiceStyle = savedStyle;
      }
    } catch {}
  }

  // --- Audio graph ---------------------------------------------------------------------------

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx: AudioContext = new AudioCtx();
        this.ctx = ctx;
        const t = ctx.currentTime;

        // Mix bus -> soft limiter -> master. Many sounds can overlap (pop + cheer + confetti), so
        // peaks are rounded off smoothly instead of clipping. (A DynamicsCompressor was avoided on
        // purpose: browsers squash short transients like pops by ~13 dB, making them far too quiet.)
        this.mixBus = ctx.createGain();
        const limiter = ctx.createWaveShaper();
        limiter.curve = SoftLimiter.curve();
        limiter.oversample = '2x';
        this.masterGain = ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : MASTER_VOLUME, t);
        this.mixBus.connect(limiter);
        limiter.connect(this.masterGain);
        this.masterGain.connect(ctx.destination);

        // dry path
        this.dryBus = ctx.createGain();
        this.dryBus.connect(this.mixBus);

        this.buildNoiseBuffer();
        this.buildReverb();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /** True when sound may play now (not muted) and the audio graph exists. */
  private ready(): boolean {
    if (this.isMuted) return false;
    this.initContext();
    return !!this.ctx && !!this.dryBus;
  }

  /** 1 s of white noise. Filtered per use into water, leaves, crunches, claps. */
  private buildNoiseBuffer() {
    if (!this.ctx) return;
    try {
      const size = this.ctx.sampleRate;
      const buffer = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buffer;
    } catch {}
  }

  /**
   * Small, warm, synthetic room: exponentially decaying stereo noise whose highs fade faster than
   * the lows (air absorption). Lends bells, sparkles and fanfares natural "air" and tail.
   */
  private buildReverb() {
    const ctx = this.ctx;
    if (!ctx || !this.mixBus) return;
    try {
      const seconds = 1.5;
      const len = Math.floor(ctx.sampleRate * seconds);
      const ir = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = ir.getChannelData(ch);
        let lp = 0;
        for (let i = 0; i < len; i++) {
          const progress = i / len;
          const damping = 0.35 + 0.55 * progress; // darker as it decays
          const sample = (Math.random() * 2 - 1) * Math.pow(1 - progress, 3);
          lp = lp * damping + sample * (1 - damping);
          data[i] = lp;
        }
      }
      const convolver = ctx.createConvolver();
      convolver.buffer = ir;
      const wet = ctx.createGain();
      wet.gain.value = 1.4;
      this.reverbSend = ctx.createGain();
      this.reverbSend.connect(convolver);
      convolver.connect(wet);
      wet.connect(this.mixBus);
    } catch {
      this.reverbSend = null;
    }
  }

  /** Connect a finished voice to the dry bus, plus the reverb by `space` (0…1) and a pan position. */
  private route(node: AudioNode, space = 0, pan = 0) {
    const ctx = this.ctx!;
    let out: AudioNode = node;
    if (pan !== 0 && typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, pan));
      node.connect(panner);
      out = panner;
    }
    out.connect(this.dryBus!);
    if (space > 0 && this.reverbSend) {
      const send = ctx.createGain();
      send.gain.value = space;
      out.connect(send);
      send.connect(this.reverbSend);
    }
  }

  /** One oscillator voice with a click-free attack/decay envelope. */
  private tone(o: ToneOptions) {
    const ctx = this.ctx!;
    const t = ctx.currentTime + (o.at ?? 0);
    const attack = Math.min(o.attack ?? 0.005, o.decay * 0.5);
    const end = t + o.decay;

    const osc = ctx.createOscillator();
    osc.type = o.type ?? 'sine';
    if (o.freqPath && o.freqPath.length > 0) {
      osc.frequency.setValueAtTime(o.freqPath[0][1], t + o.freqPath[0][0]);
      for (let i = 1; i < o.freqPath.length; i++) {
        osc.frequency.exponentialRampToValueAtTime(o.freqPath[i][1], t + o.freqPath[i][0]);
      }
    } else {
      osc.frequency.setValueAtTime(o.freq, t);
      if (o.endFreq) {
        osc.frequency.exponentialRampToValueAtTime(o.endFreq, t + (o.glideTime ?? o.decay));
      }
    }
    if (o.detune) osc.detune.setValueAtTime(o.detune, t);

    let lfo: OscillatorNode | null = null;
    if (o.vibrato) {
      lfo = ctx.createOscillator();
      const depth = ctx.createGain();
      lfo.frequency.setValueAtTime(o.vibrato.rate, t);
      depth.gain.setValueAtTime(o.vibrato.depth, t);
      if (o.vibrato.endDepth) {
        depth.gain.exponentialRampToValueAtTime(o.vibrato.endDepth, end);
      }
      lfo.connect(depth);
      depth.connect(osc.frequency);
    }

    const env = ctx.createGain();
    env.gain.setValueAtTime(SILENCE, t);
    env.gain.linearRampToValueAtTime(o.gain, t + attack);
    env.gain.exponentialRampToValueAtTime(SILENCE, end);

    if (o.lowpass) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(o.lowpass, t);
      osc.connect(filter);
      filter.connect(env);
    } else {
      osc.connect(env);
    }
    this.route(env, o.space, o.pan);

    osc.start(t);
    osc.stop(end + 0.03);
    if (lfo) {
      lfo.start(t);
      lfo.stop(end + 0.03);
    }
  }

  /** A burst of filtered noise – water spray, leaf crackle, crunch, clap, mallet click. */
  private noise(o: NoiseOptions) {
    const ctx = this.ctx!;
    if (!this.noiseBuffer) return;
    const t = ctx.currentTime + (o.at ?? 0);
    const end = t + o.duration;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = o.type;
    filter.frequency.setValueAtTime(o.freq, t);
    if (o.endFreq) filter.frequency.exponentialRampToValueAtTime(o.endFreq, end);
    filter.Q.setValueAtTime(o.q ?? 1, t);

    const env = ctx.createGain();
    const attack = Math.min(o.attack ?? 0.004, o.duration * 0.5);
    env.gain.setValueAtTime(SILENCE, t);
    env.gain.linearRampToValueAtTime(o.gain, t + attack);
    env.gain.exponentialRampToValueAtTime(SILENCE, end);

    src.connect(filter);
    filter.connect(env);
    this.route(env, o.space, o.pan);

    // random start so repeated bursts never sound identical
    src.start(t, Math.random() * 0.5);
    src.stop(end + 0.02);
  }

  /** Bell / glockenspiel strike: a fundamental plus inharmonic partials that die away faster. */
  private bell(freq: number, at: number, gain: number, decay: number, space = 0.35, pan = 0) {
    const partials: [number, number, number][] = [
      [1, 1, 1],
      [2.756, 0.34, 0.45],
      [5.404, 0.16, 0.22],
    ];
    partials.forEach(([ratio, g, d]) => {
      if (freq * ratio > 12000) return;
      this.tone({
        freq: freq * ratio,
        at,
        gain: gain * g,
        decay: decay * d,
        attack: 0.003,
        space,
        pan,
      });
    });
  }

  // --- Controls ------------------------------------------------------------------------------

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : MASTER_VOLUME, this.ctx.currentTime, 0.015);
    }
    if (muted) {
      this.stopMusic();
      this.speech.stop();
    }
  }

  public setVoiceMuted(muted: boolean) {
    this.isVoiceMuted = muted;
    if (muted) this.speech.stop();
  }

  public setVoiceStyle(style: VoiceStyle) {
    this.voiceStyle = style;
    try {
      localStorage.setItem('abc_kids_voice_style', style);
    } catch {}
  }

  public getVoiceStyle(): VoiceStyle {
    return this.voiceStyle;
  }

  public getMuted() {
    return this.isMuted;
  }

  public getVoiceMuted() {
    return this.isVoiceMuted;
  }

  public getIsMusicPlaying() {
    return this.isMusicPlaying;
  }

  // --- Sound effects -------------------------------------------------------------------------

  /** Bubbly pop: falling body, bright overtone and a tiny "lip" transient. */
  public playPop() {
    if (!this.ready()) return;
    try {
      const base = rand(480, 640);
      const pan = rand(-0.25, 0.25);
      this.tone({ freq: base, endFreq: 90, decay: 0.11, attack: 0.003, gain: 0.5, pan });
      this.tone({
        freq: base * 2.4,
        endFreq: base * 0.9,
        decay: 0.05,
        attack: 0.002,
        gain: 0.14,
        type: 'triangle',
        pan,
      });
      this.noise({ duration: 0.025, type: 'highpass', freq: 3200, gain: 0.16, attack: 0.001, pan });
    } catch {}
  }

  /** Puddle splash: spray hiss and rising water "bloops" (real droplets rise in pitch). */
  public playSplash() {
    if (!this.ready()) return;
    try {
      this.noise({
        duration: 0.38,
        type: 'bandpass',
        freq: 1900,
        endFreq: 500,
        q: 0.9,
        gain: 0.5,
        attack: 0.012,
        space: 0.15,
      });
      this.noise({ duration: 0.13, type: 'highpass', freq: 5200, gain: 0.2, attack: 0.002 });

      const drops = 5;
      for (let i = 0; i < drops; i++) {
        const f = rand(320, 720);
        this.tone({
          at: 0.02 + i * rand(0.035, 0.06),
          freq: f,
          endFreq: f * rand(2, 2.6),
          glideTime: 0.07,
          decay: 0.11,
          attack: 0.004,
          gain: rand(0.2, 0.34),
          space: 0.2,
          pan: rand(-0.5, 0.5),
        });
      }
    } catch {}
  }

  /** Autumn leaves: a handful of dry, bright crackles over a faint rustle. */
  public playRustle() {
    if (!this.ready()) return;
    try {
      this.noise({
        duration: 0.22,
        type: 'bandpass',
        freq: 3200,
        q: 0.6,
        gain: 0.14,
        attack: 0.03,
      });
      const crackles = 8;
      for (let i = 0; i < crackles; i++) {
        this.noise({
          at: rand(0, 0.17),
          duration: rand(0.012, 0.03),
          type: 'bandpass',
          freq: rand(2400, 6000),
          q: 1.4,
          gain: rand(0.24, 0.6),
          attack: 0.001,
          pan: rand(-0.4, 0.4),
        });
      }
    } catch {}
  }

  /** Glockenspiel arpeggio C5–E5–G5–C6 with shimmering bell partials. */
  public playChime() {
    if (!this.ready()) return;
    try {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
        this.bell(f, i * 0.07, 0.26, 1.1, 0.4, (i - 1.5) * 0.18)
      );
    } catch {}
  }

  /** Fanfare: mellow brass run into a sustained, bell-topped C major chord. */
  public playCheer() {
    if (!this.ready()) return;
    try {
      [523.25, 659.25, 783.99].forEach((f, i) =>
        this.tone({
          freq: f,
          at: i * 0.1,
          type: 'sawtooth',
          lowpass: 2200,
          attack: 0.015,
          decay: 0.22,
          gain: 0.08,
          space: 0.2,
        })
      );
      [523.25, 659.25, 783.99, 1046.5].forEach((f) => {
        this.tone({
          freq: f,
          at: 0.32,
          type: 'sawtooth',
          lowpass: 2600,
          attack: 0.02,
          decay: 0.95,
          gain: 0.06,
          space: 0.3,
        });
        this.tone({ freq: f, at: 0.32, attack: 0.01, decay: 0.95, gain: 0.1, space: 0.3 });
      });
      this.bell(2093, 0.34, 0.1, 1.0, 0.5);
      this.playSparkle();
    } catch {}
  }

  /** "Ta-daaa!" – short pickup note, then a full, warm major chord that rings out. */
  public playTada() {
    if (!this.ready()) return;
    try {
      this.tone({
        freq: 392,
        type: 'triangle',
        attack: 0.006,
        decay: 0.15,
        gain: 0.26,
        lowpass: 2800,
        space: 0.15,
      });
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        this.tone({
          freq: f,
          at: 0.17,
          type: 'triangle',
          attack: 0.01,
          decay: 0.95,
          gain: 0.18,
          lowpass: 3200,
          space: 0.3,
          pan: (i - 1.5) * 0.15,
        });
        this.tone({ freq: f, at: 0.17, attack: 0.01, decay: 0.7, gain: 0.07, space: 0.3 });
      });
      this.bell(2093, 0.19, 0.08, 0.9, 0.5);
    } catch {}
  }

  /** Applause: dozens of tiny filtered-noise claps that swell and fade like a small crowd. */
  public playApplause(duration = 1.3, loudness = 1) {
    if (!this.ready()) return;
    try {
      const claps = Math.round(duration * 38);
      for (let i = 0; i < claps; i++) {
        const x = Math.random(); // 0…1 across the applause
        const swell = Math.sin(Math.PI * Math.pow(x, 0.8)); // rises quickly, fades slowly
        if (Math.random() > swell + 0.15) continue;
        this.noise({
          at: x * duration,
          duration: rand(0.012, 0.035),
          type: 'bandpass',
          freq: rand(1100, 3600),
          q: rand(0.5, 1.2),
          gain: rand(0.12, 0.3) * loudness * (0.4 + swell),
          attack: 0.001,
          pan: rand(-0.8, 0.8),
          space: 0.12,
        });
      }
    } catch {}
  }

  /** Kids' celebration: fanfare, sparkles and a short round of applause. */
  public playKidsCheer() {
    if (this.isMuted) return;
    this.playTada();
    this.playApplause(1.2, 0.8);
    setTimeout(() => this.playSparkle(), 180);
  }

  /** Ascending magic level-up arpeggio. */
  public playLevelUp() {
    if (!this.ready()) return;
    try {
      [440, 554.37, 659.25, 880, 1108.73, 1318.51].forEach((f, i) =>
        this.bell(f, i * 0.055, 0.22, 0.7, 0.35, (i - 2.5) * 0.12)
      );
    } catch {}
  }

  /** Cartoon spring: a bouncy pitch arc with a wobble that settles. */
  public playBoing() {
    if (!this.ready()) return;
    try {
      const path: [number, number][] = [
        [0, 220],
        [0.08, 480],
        [0.28, 170],
      ];
      this.tone({
        freq: 220,
        freqPath: path,
        vibrato: { rate: 14, depth: 34, endDepth: 4 },
        attack: 0.006,
        decay: 0.3,
        gain: 0.32,
        space: 0.08,
      });
      this.tone({
        freq: 440,
        freqPath: path.map(([t, f]) => [t, f * 2] as [number, number]),
        type: 'triangle',
        vibrato: { rate: 14, depth: 40, endDepth: 6 },
        attack: 0.006,
        decay: 0.22,
        gain: 0.07,
      });
    } catch {}
  }

  /** Friendly Halloween "Booo!" – a soft rising-then-falling hoot, not scary. */
  public playSpookyBoo() {
    if (!this.ready()) return;
    try {
      const path: [number, number][] = [
        [0, 200],
        [0.12, 560],
        [0.44, 130],
      ];
      this.tone({
        freq: 200,
        freqPath: path,
        attack: 0.012,
        decay: 0.46,
        gain: 0.3,
        lowpass: 1600,
        space: 0.3,
      });
      this.tone({
        freq: 100,
        freqPath: path.map(([t, f]) => [t, f / 2] as [number, number]),
        attack: 0.012,
        decay: 0.46,
        gain: 0.12,
        space: 0.3,
      });
    } catch {}
  }

  /** Wobbly, giggly ghost with a gentle tremolo. */
  public playGhost() {
    if (!this.ready()) return;
    try {
      this.tone({
        freq: 360,
        freqPath: [
          [0, 360],
          [0.18, 520],
          [0.32, 420],
          [0.5, 600],
        ],
        vibrato: { rate: 8, depth: 22 },
        attack: 0.02,
        decay: 0.54,
        gain: 0.4,
        lowpass: 2000,
        space: 0.4,
        pan: rand(-0.3, 0.3),
      });
    } catch {}
  }

  /** Shimmering chord whose pitch follows `ratio` (0 = low, 1 = high) for colour games. */
  public playColorChime(ratio: number = 0.5) {
    if (!this.ready()) return;
    try {
      const base = 300 + Math.max(0, Math.min(1, ratio)) * 520;
      [1, 1.25, 1.5].forEach((m, i) =>
        this.tone({
          freq: base * m,
          endFreq: base * m * 1.12,
          glideTime: 0.3,
          type: i === 0 ? 'sine' : 'triangle',
          attack: 0.008,
          decay: 0.6,
          gain: 0.32 / (i + 1),
          lowpass: 3500,
          space: 0.3,
          pan: (i - 1) * 0.2,
        })
      );
    } catch {}
  }

  /** Crunchy monster munches: noise crunch + soft thump, three bites. */
  public playMunch() {
    if (!this.ready()) return;
    try {
      for (let i = 0; i < 3; i++) {
        const at = i * 0.085;
        this.noise({
          at,
          duration: 0.06,
          type: 'bandpass',
          freq: rand(1200, 2000),
          q: 1.1,
          gain: 0.32,
          attack: 0.002,
        });
        this.noise({ at, duration: 0.025, type: 'highpass', freq: 4000, gain: 0.12, attack: 0.001 });
        this.tone({
          at,
          freq: rand(150, 190),
          endFreq: 60,
          type: 'triangle',
          decay: 0.07,
          attack: 0.003,
          gain: 0.26,
        });
      }
    } catch {}
  }

  /** Cute baby-monster burp: low rumble with a rapid flutter. */
  public playBurp() {
    if (!this.ready()) return;
    try {
      this.tone({
        freq: 130,
        freqPath: [
          [0, 130],
          [0.14, 75],
          [0.3, 150],
        ],
        type: 'sawtooth',
        lowpass: 520,
        vibrato: { rate: 26, depth: 9 },
        attack: 0.012,
        decay: 0.32,
        gain: 0.3,
      });
    } catch {}
  }

  /**
   * Musical note. Each instrument is a stack of partials with its own decay, which is what
   * separates a piano from a xylophone from a bell.
   */
  public playNote(freq: number, duration: number = 0.45, instrument: Instrument = 'xylophone') {
    if (!this.ready()) return;
    try {
      type Partial = [ratio: number, gain: number, decay: number];
      let partials: Partial[];
      let decay = duration;
      let space = 0.12;

      if (instrument === 'piano') {
        // harmonic series, upper partials fade first, plus a slightly detuned unison for body
        partials = [
          [1, 1, 1],
          [2, 0.45, 0.7],
          [3, 0.22, 0.5],
          [4, 0.1, 0.35],
          [5, 0.05, 0.25],
        ];
        decay = Math.max(duration, 0.4) * 1.7;
        this.tone({ freq, detune: 5, gain: 0.12, decay: decay * 0.9, attack: 0.004, space });
        this.noise({ duration: 0.02, type: 'lowpass', freq: 2200, gain: 0.07, attack: 0.001 });
      } else if (instrument === 'bell') {
        partials = [
          [1, 1, 1],
          [2.756, 0.4, 0.5],
          [5.404, 0.2, 0.3],
          [8.93, 0.1, 0.2],
        ];
        decay = Math.max(duration, 0.4) * 2.4;
        space = 0.4;
      } else {
        // wooden bar: strong fundamental, a bright 3rd and 6th partial that vanish quickly
        partials = [
          [1, 1, 1],
          [3, 0.34, 0.3],
          [6, 0.12, 0.15],
        ];
        decay = Math.max(duration, 0.2) * 1.1;
        this.noise({ duration: 0.016, type: 'highpass', freq: 2200, gain: 0.1, attack: 0.001 });
      }

      partials.forEach(([ratio, g, d]) => {
        if (freq * ratio > 12000) return;
        this.tone({
          freq: freq * ratio,
          gain: 0.3 * g,
          decay: decay * d,
          attack: 0.004,
          space,
        });
      });
    } catch {}
  }

  /** Fairy-dust sparkle: four rising crystal pings with a little random shimmer. */
  public playSparkle() {
    if (!this.ready()) return;
    try {
      [1046.5, 1318.51, 1567.98, 2093.0].forEach((f, i) => {
        const at = i * 0.035 + rand(0, 0.01);
        const pan = i % 2 === 0 ? -0.35 : 0.35;
        this.tone({
          freq: f,
          at,
          detune: rand(-8, 8),
          attack: 0.003,
          decay: 0.32,
          gain: 0.2,
          space: 0.5,
          pan,
        });
        this.tone({
          freq: f * 2,
          at,
          type: 'triangle',
          attack: 0.002,
          decay: 0.12,
          gain: 0.05,
          space: 0.5,
          pan,
        });
      });
    } catch {}
  }

  // --- Background music box ------------------------------------------------------------------

  public toggleBackgroundMusic() {
    if (this.isMusicPlaying) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isMusicPlaying;
  }

  public startMusic() {
    if (this.isMuted) return;
    this.stopMusic();
    this.initContext();
    this.isMusicPlaying = true;

    // Gentle Twinkle Twinkle / ABC melody
    const melody = [
      261.63, 261.63, 392.0, 392.0, 440.0, 440.0, 392.0, 0,
      349.23, 349.23, 329.63, 329.63, 293.66, 293.66, 261.63, 0,
      392.0, 392.0, 349.23, 349.23, 329.63, 329.63, 293.66, 0,
      392.0, 392.0, 349.23, 349.23, 329.63, 329.63, 293.66, 0,
    ];

    let noteIdx = 0;
    this.musicInterval = setInterval(() => {
      if (!this.isMusicPlaying || this.isMuted || !this.ctx || !this.dryBus) return;
      const freq = melody[noteIdx];
      noteIdx = (noteIdx + 1) % melody.length;
      if (freq <= 0) return;
      try {
        // music-box tine: soft fundamental plus a quick-fading metallic partial
        this.tone({ freq, gain: 0.05, decay: 0.7, attack: 0.008, space: 0.45 });
        this.tone({ freq: freq * 2.7, gain: 0.012, decay: 0.2, attack: 0.004, space: 0.45 });
      } catch {}
    }, 450);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  // --- Speech --------------------------------------------------------------------------------

  /**
   * Say `text` in Dutch or English. The text is cleaned for the voice (letter names, ALL-CAPS
   * words, "A - B - C", Dutch loanwords) and the best installed voice for the language is used.
   * `onEnd` is always called exactly once – when speech finishes, fails, is replaced or skipped.
   */
  public speak(text: string, lang: SpeechLang = 'en', onEnd?: () => void) {
    if (this.isVoiceMuted || this.isMuted) {
      onEnd?.();
      return;
    }
    this.speech.speak(text, lang, { style: this.voiceStyle, onEnd });
  }

  public stopSpeaking() {
    this.speech.stop();
  }

  /** Voice discovery / selection, used by the voice settings screen. */
  public get voices() {
    return this.speech;
  }
}

export const sounds = new SoundManager();
