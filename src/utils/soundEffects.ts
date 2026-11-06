import { VoiceStyle } from '../types/game';

/**
 * High-performance, zero-dependency Web Audio synthesizer and preschool SpeechSynthesis manager.
 * Delivers studio-quality tactile audio feedback, anti-click envelopes, rich harmonics,
 * celebratory kids cheer effects, and smooth preschool speech.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private isMuted: boolean = false;
  private isVoiceMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicInterval: any = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voiceStyle: VoiceStyle = 'soft-lady';

  constructor() {
    try {
      const savedStyle = localStorage.getItem('abc_kids_voice_style') as VoiceStyle;
      if (savedStyle && ['soft-lady', 'sweet-story', 'cheerful'].includes(savedStyle)) {
        this.voiceStyle = savedStyle;
      }
    } catch {}
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // Dynamics compressor to prevent digital clipping / distortion when multiple sounds overlap
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(24, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(5, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.18, this.ctx.currentTime);

        // Master gain node
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);

        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        // Generate reusable 1-second white noise buffer for water splashes & leaf rustles
        this.buildNoiseBuffer();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private getDestination(): AudioNode | null {
    if (!this.ctx) return null;
    return this.compressor || this.ctx.destination;
  }

  private buildNoiseBuffer() {
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate; // 1 second
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        // Pink-ish noise filter
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.04 * white) / 1.04;
        lastOut = data[i];
      }
      this.noiseBuffer = buffer;
    } catch {}
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.85, now);
    }
    if (muted) {
      this.stopMusic();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }

  public setVoiceMuted(muted: boolean) {
    this.isVoiceMuted = muted;
    if (muted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
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

  // --- High Quality Tactile Sound Effects ---

  /**
   * Super juicy, bubbly pop with soft transient click and warm resonant body
   */
  public playPop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = 520 + Math.random() * 120;

      // Primary resonant pitch sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.09);

      // Smooth attack to eliminate click, fast punchy decay
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.42, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      // Crisp overtone for bright bubble pop
      const overtone = this.ctx.createOscillator();
      const overGain = this.ctx.createGain();
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(baseFreq * 2.2, now);
      overtone.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 0.04);

      overGain.gain.setValueAtTime(0.001, now);
      overGain.gain.linearRampToValueAtTime(0.18, now + 0.003);
      overGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(dest);
      overtone.connect(overGain);
      overGain.connect(dest);

      osc.start(now);
      overtone.start(now);
      osc.stop(now + 0.095);
      overtone.stop(now + 0.045);
    } catch {}
  }

  /**
   * Realistic joyful rain puddle splash with filtered water whoosh & liquid plops
   */
  public playSplash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Water spray whoosh using noise buffer + bandpass filter
      if (this.noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(450, now + 0.22);
        filter.Q.setValueAtTime(2.5, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.001, now);
        noiseGain.gain.linearRampToValueAtTime(0.3, now + 0.015);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(dest);

        noise.start(now);
        noise.stop(now + 0.23);
      }

      // 2. Liquid water droplet plops
      const drops = [
        { f1: 850, f2: 240, delay: 0.01, vol: 0.25 },
        { f1: 1100, f2: 320, delay: 0.045, vol: 0.2 },
        { f1: 680, f2: 180, delay: 0.08, vol: 0.18 },
      ];

      drops.forEach((d) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + d.delay;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(d.f1, t);
        osc.frequency.exponentialRampToValueAtTime(d.f2, t + 0.12);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(d.vol, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + 0.125);
      });
    } catch {}
  }

  /**
   * Crisp autumn leaves rustle using filtered noise & warm multi-tone leaf crinkles
   */
  public playRustle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    try {
      const now = this.ctx.currentTime;

      // Filtered noise flutter
      if (this.noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2200, now);
        filter.frequency.linearRampToValueAtTime(1200, now + 0.16);
        filter.Q.setValueAtTime(3.0, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        noise.start(now);
        noise.stop(now + 0.17);
      }

      // Multi-tone crisp leaf crinkles
      [540, 780, 1120].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + idx * 0.022;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq + (Math.random() * 80 - 40), t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.1);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + 0.105);
      });
    } catch {}
  }

  /**
   * Celestial Glockenspiel / Bell Chime with shimmering overtones
   */
  public playChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    try {
      // C5, E5, G5, C6 arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const now = this.ctx!.currentTime + i * 0.065;

        // Fundamental bell
        const osc1 = this.ctx!.createOscillator();
        const gain1 = this.ctx!.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);

        gain1.gain.setValueAtTime(0.001, now);
        gain1.gain.linearRampToValueAtTime(0.25, now + 0.005);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        // 2.76x celestial bell harmonic
        const osc2 = this.ctx!.createOscillator();
        const gain2 = this.ctx!.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2.756, now);

        gain2.gain.setValueAtTime(0.001, now);
        gain2.gain.linearRampToValueAtTime(0.08, now + 0.004);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc1.connect(gain1);
        gain1.connect(dest);
        osc2.connect(gain2);
        gain2.connect(dest);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.46);
        osc2.stop(now + 0.23);
      });
    } catch {}
  }

  /**
   * Triumphant brass & chime celebration fanfare with rich chords
   */
  public playCheer() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    try {
      const now = this.ctx.currentTime;
      // Fanfare: C5 -> E5 -> G5 -> C6 sustained chord with sparkling top note
      const chords = [
        { f: 523.25, t: 0, d: 0.14 },
        { f: 659.25, t: 0.1, d: 0.14 },
        { f: 783.99, t: 0.2, d: 0.14 },
        { f: 1046.5, t: 0.32, d: 0.65 }, // Final triumphant sustained chord
        { f: 1318.51, t: 0.32, d: 0.65 },
        { f: 1567.98, t: 0.32, d: 0.65 },
      ];

      chords.forEach((c) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + c.t;

        osc.type = c.t >= 0.32 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(c.f, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, t + c.d);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + c.d + 0.01);
      });

      // Cheerful sparkle trail
      this.playSparkle();
    } catch {}
  }

  /**
   * Joyful "Ta-daaa!" brass & bell fanfare kids love
   */
  public playTada() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    try {
      const now = this.ctx.currentTime;

      // "Ta-" (G4)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(392.0, now);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.24, now + 0.006);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc1.connect(gain1);
      gain1.connect(dest);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // "-Daaa!" (C5 + E5 + G5 major chord)
      const t2 = now + 0.16;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t2);

        gain.gain.setValueAtTime(0.001, t2);
        gain.gain.linearRampToValueAtTime(0.2, t2 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t2 + 0.7);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(t2);
        osc.stop(t2 + 0.71);
      });
    } catch {}
  }

  /**
   * Cheerful kids applause / celebration sparkle
   */
  public playKidsCheer() {
    if (this.isMuted) return;
    this.playTada();
    setTimeout(() => {
      this.playSparkle();
    }, 180);
  }

  /**
   * Ascending magic level-up chime
   */
  public playLevelUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    try {
      const now = this.ctx.currentTime;
      const scale = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      scale.forEach((freq, idx) => {
        const t = now + idx * 0.045;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.22, t + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + 0.29);
      });
    } catch {}
  }

  /**
   * Comical cartoon spring boing with pitch vibrato LFO
   */
  public playBoing() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch vibrato LFO for true bouncy cartoon spring
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      lfo.frequency.setValueAtTime(14, now); // 14Hz spring wobble
      lfoGain.gain.setValueAtTime(32, now);
      lfoGain.gain.exponentialRampToValueAtTime(4, now + 0.26);

      lfo.connect(osc.frequency);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(480, now + 0.08);
      osc.frequency.linearRampToValueAtTime(170, now + 0.28);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.32, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(dest);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + 0.29);
      osc.stop(now + 0.29);
    } catch {}
  }

  /**
   * Spooky-cute friendly Halloween Boo sound
   */
  public playSpookyBoo() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.42);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.43);
    } catch {}
  }

  /**
   * Wobbly cute ghost sound with soft tremolo
   */
  public playGhost() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Gentle tremolo
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(8, now);
      lfoGain.gain.setValueAtTime(20, now);
      lfo.connect(osc.frequency);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.linearRampToValueAtTime(520, now + 0.18);
      osc.frequency.linearRampToValueAtTime(420, now + 0.32);
      osc.frequency.linearRampToValueAtTime(600, now + 0.5);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);

      osc.connect(gain);
      gain.connect(dest);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + 0.53);
      osc.stop(now + 0.53);
    } catch {}
  }

  /**
   * Shimmering musical color chime for color grading & shade transitions
   */
  public playColorChime(ratio: number = 0.5) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = 300 + Math.max(0, Math.min(1, ratio)) * 520;

      // Dual harmonic chord
      const freqs = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];
      freqs.forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.exponentialRampToValueAtTime(f * 1.15, now + 0.3);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.18 / (idx + 1), now + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now);
        osc.stop(now + 0.33);
      });
    } catch {}
  }

  /**
   * Crunchy cartoon monster munch
   */
  public playMunch() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    try {
      for (let i = 0; i < 3; i++) {
        const now = this.ctx.currentTime + i * 0.075;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220 + Math.random() * 80, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.065);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.24, now + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now);
        osc.stop(now + 0.07);
      }
    } catch {}
  }

  /**
   * Cute comedic baby monster burp
   */
  public playBurp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(115, now);
      osc.frequency.linearRampToValueAtTime(75, now + 0.14);
      osc.frequency.linearRampToValueAtTime(145, now + 0.28);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.31);
    } catch {}
  }

  /**
   * High-fidelity musical note for piano / xylophone
   */
  public playNote(freq: number, duration: number = 0.45, instrument: 'piano' | 'xylophone' | 'bell' = 'xylophone') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    try {
      const now = this.ctx.currentTime;

      // Fundamental
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = instrument === 'piano' ? 'triangle' : 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.3, now + 0.005);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(gain1);
      gain1.connect(dest);
      osc1.start(now);
      osc1.stop(now + duration + 0.01);

      // Acoustic harmonic overtone
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * (instrument === 'xylophone' ? 3 : 2), now);

      const overtoneDur = duration * 0.45;
      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.linearRampToValueAtTime(0.12, now + 0.003);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + overtoneDur);

      osc2.connect(gain2);
      gain2.connect(dest);
      osc2.start(now);
      osc2.stop(now + overtoneDur + 0.01);
    } catch {}
  }

  /**
   * Fairy dust sparkle cascade (4 rapid crystal micro-chimes)
   */
  public playSparkle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const dest = this.getDestination();
    if (!dest) return;

    try {
      const now = this.ctx.currentTime;
      const pitches = [1046.5, 1318.51, 1567.98, 2093.0]; // C6, E6, G6, C7
      pitches.forEach((freq, idx) => {
        const t = now + idx * 0.035;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + 0.17);
      });
    } catch {}
  }

  // --- Background Music Box Melody ---

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

    // Gentle Twinkle Twinkle / ABC Melody
    const melody = [
      261.63, 261.63, 392.0, 392.0, 440.0, 440.0, 392.0, 0,
      349.23, 349.23, 329.63, 329.63, 293.66, 293.66, 261.63, 0,
      392.0, 392.0, 349.23, 349.23, 329.63, 329.63, 293.66, 0,
      392.0, 392.0, 349.23, 349.23, 329.63, 329.63, 293.66, 0,
    ];

    let noteIdx = 0;
    this.musicInterval = setInterval(() => {
      if (!this.isMusicPlaying || this.isMuted || !this.ctx) return;
      const freq = melody[noteIdx];
      if (freq > 0) {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const now = this.ctx.currentTime;
          const dest = this.getDestination();
          if (!dest) return;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.04, now + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

          osc.connect(gain);
          gain.connect(dest);

          osc.start(now);
          osc.stop(now + 0.42);
        } catch {}
      }
      noteIdx = (noteIdx + 1) % melody.length;
    }, 450);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  // --- Preschool Speech Synthesis: Softer, smoother young lady voice ---

  public speak(text: string, lang: 'en' | 'nl' = 'en', onEnd?: () => void) {
    if (this.isVoiceMuted || this.isMuted) {
      if (onEnd) onEnd();
      return;
    }

    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      // Voice style configuration (softer, calmer, friendly young lady preschool tone)
      if (this.voiceStyle === 'soft-lady') {
        utterance.rate = 0.84; // relaxed, gentle pacing
        utterance.pitch = 1.15; // soft, warm feminine pitch
      } else if (this.voiceStyle === 'sweet-story') {
        utterance.rate = 0.78; // soothing, gentle bedtime tone
        utterance.pitch = 1.08;
      } else {
        utterance.rate = 0.9;
        utterance.pitch = 1.22;
      }

      utterance.lang = lang === 'nl' ? 'nl-NL' : 'en-US';

      // Pick smooth young lady female voice in browser
      const voices = window.speechSynthesis.getVoices();
      let preferredVoice: SpeechSynthesisVoice | undefined;

      if (lang === 'nl') {
        preferredVoice =
          voices.find(
            (v) =>
              (v.lang.startsWith('nl') || v.lang.includes('NL')) &&
              (v.name.includes('Lotte') ||
                v.name.includes('Fleur') ||
                v.name.includes('Ellen') ||
                v.name.includes('Laura') ||
                v.name.includes('Sanne') ||
                v.name.includes('Fenna') ||
                v.name.includes('Colette') ||
                v.name.includes('Maaike') ||
                v.name.toLowerCase().includes('female') ||
                v.name.includes('Google Nederlands'))
          ) ||
          voices.find(
            (v) =>
              v.lang.startsWith('nl') ||
              v.name.toLowerCase().includes('dutch') ||
              v.name.toLowerCase().includes('nederlands')
          );
      } else {
        preferredVoice =
          voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Jenny') ||
                v.name.includes('Ava') ||
                v.name.includes('Samantha') ||
                v.name.includes('Victoria') ||
                v.name.includes('Serena') ||
                v.name.includes('Karen') ||
                v.name.includes('Google UK English Female') ||
                v.name.includes('Natural') ||
                v.name.toLowerCase().includes('female'))
          ) || voices.find((v) => v.lang.startsWith('en'));
      }

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      if (onEnd) {
        utterance.onend = () => onEnd();
        utterance.onerror = () => onEnd();
      }

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const sounds = new SoundManager();
