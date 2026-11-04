import { VoiceStyle } from '../types/game';

/**
 * High-performance, zero-dependency Web Audio synthesizer and preschool SpeechSynthesis manager.
 * Delivers immediate tactile audio feedback and soft, smooth young lady preschool speech.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isVoiceMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicInterval: any = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voiceStyle: VoiceStyle = 'soft-lady'; // Default to soft & smooth young lady voice

  constructor() {
    const savedStyle = localStorage.getItem('abc_kids_voice_style') as VoiceStyle;
    if (savedStyle && ['soft-lady', 'sweet-story', 'cheerful'].includes(savedStyle)) {
      this.voiceStyle = savedStyle;
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
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
    localStorage.setItem('abc_kids_voice_style', style);
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

  // --- Sound Effects using Web Audio API ---

  // Satisfying balloon/bubble pop
  public playPop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450 + Math.random() * 150, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  // Gentle splashing sound for rain puddles
  public playSplash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [420, 680, 920].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + idx * 0.035;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(140, t + 0.14);

        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.14);
      });
    } catch {}
  }

  // Crisp autumn leaf rustle / basket catch
  public playRustle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [360, 520, 720].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + idx * 0.025;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq + (Math.random() * 60 - 30), t);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.11);
      });
    } catch {}
  }

  // Cheerful reward chime
  public playChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const now = this.ctx!.currentTime + i * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      });
    } catch {}
  }

  // Celebration fanfare
  public playCheer() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [
        { f: 523.25, d: 0.12, t: 0 },
        { f: 659.25, d: 0.12, t: 0.12 },
        { f: 783.99, d: 0.12, t: 0.24 },
        { f: 1046.5, d: 0.45, t: 0.36 },
      ];

      notes.forEach((n) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const now = this.ctx!.currentTime + n.t;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.d);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + n.d);
      });
    } catch {}
  }

  // Playful boing sound
  public playBoing() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.1);
      osc.frequency.linearRampToValueAtTime(180, now + 0.25);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  // Spooky cute Halloween "Boo!" sound
  public playSpookyBoo() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.4);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  // Wobbly cute ghost sound
  public playGhost() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.linearRampToValueAtTime(520, now + 0.15);
      osc.frequency.linearRampToValueAtTime(420, now + 0.3);
      osc.frequency.linearRampToValueAtTime(580, now + 0.45);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }

  // Crunchy monster munch
  public playMunch() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + i * 0.08;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160 + Math.random() * 80, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.07);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.07);
      }
    } catch {}
  }

  // Cute baby monster burp
  public playBurp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'square';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.15);
      osc.frequency.linearRampToValueAtTime(140, now + 0.28);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  // Musical note
  public playNote(freq: number, duration: number = 0.4) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  // Sparkle stroke sound for tracing
  public playSparkle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600 + Math.random() * 800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  // Background gentle music box melody
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

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.035, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.38);
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

      // Voice style configuration (softer and smoother young lady tuning)
      if (this.voiceStyle === 'soft-lady') {
        utterance.rate = 0.82; // relaxed, gentle pacing
        utterance.pitch = 1.15; // soft, warm feminine pitch
      } else if (this.voiceStyle === 'sweet-story') {
        utterance.rate = 0.77; // soothing, gentle bedtime tone
        utterance.pitch = 1.08;
      } else {
        utterance.rate = 0.88;
        utterance.pitch = 1.24;
      }

      utterance.lang = lang === 'nl' ? 'nl-NL' : 'en-US';

      // Pick smooth young lady female voice in browser
      const voices = window.speechSynthesis.getVoices();
      let preferredVoice: SpeechSynthesisVoice | undefined;

      if (lang === 'nl') {
        // Preferred soft female Dutch voices (Lotte, Fleur, Ellen, Laura, Sanne, Colette, Fenna, Google Nederlands)
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
        // Preferred soft female English voices (Jenny, Ava, Samantha, Victoria, Serena, Karen, Natural Female)
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
