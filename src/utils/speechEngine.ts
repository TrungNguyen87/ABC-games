import type { VoiceStyle } from '../types/game';
import { prepareSpeechText, type SpeechLang } from './speechText';
import { pickVoice, rankVoices, voiceQuality, type VoiceQuality } from './voiceSelection';

/**
 * Web Speech wrapper tuned for a preschool game.
 *
 * What it fixes compared with calling `speechSynthesis.speak()` directly:
 *  - Picks the best installed voice for the language (neural > standard > robotic, nl-NL before
 *    nl-BE) and waits for the browser's asynchronous voice list instead of speaking with a default.
 *  - Cleans the text first (letter names, ALL-CAPS words, "A - B - C", Dutch loanwords).
 *  - Doesn't pitch-shift high-quality voices, which makes them sound like a chipmunk.
 *  - Survives browser quirks: dropped utterances after cancel(), utterances garbage-collected
 *    before `onend`, engines that never fire `onend`, a stuck "paused" state, and iOS needing a
 *    touch to unlock speech.
 */

interface Prosody {
  rate: number;
  pitch: number;
}

/** Warm, calm teacher voice – tuned for basic voices, softened automatically for good ones. */
const STYLE_PROSODY: Record<VoiceStyle, Prosody> = {
  'soft-lady': { rate: 0.84, pitch: 1.15 },
  'sweet-story': { rate: 0.78, pitch: 1.08 },
  cheerful: { rate: 0.9, pitch: 1.22 },
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function prosodyFor(style: VoiceStyle, quality: VoiceQuality): Prosody {
  const base = STYLE_PROSODY[style] ?? STYLE_PROSODY['soft-lady'];
  if (quality === 'neural' || quality === 'high') {
    // Good voices already sound natural: speak a touch faster (slow neural speech drags) and keep
    // the pitch almost untouched so they don't turn squeaky.
    return {
      rate: clamp(base.rate + 0.06, 0.7, 1.05),
      pitch: clamp(1 + (base.pitch - 1) * 0.3, 0.9, 1.1),
    };
  }
  return base;
}

const PREF_KEY: Record<SpeechLang, string> = {
  nl: 'abc_kids_voice_nl',
  en: 'abc_kids_voice_en',
};

const LANG_TAG: Record<SpeechLang, string> = { nl: 'nl-NL', en: 'en-US' };

export interface SpeakOptions {
  style: VoiceStyle;
  onEnd?: () => void;
}

export class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private requestId = 0;
  /** Strong references: some browsers garbage-collect an utterance and never fire `onend`. */
  private inFlight = new Set<SpeechSynthesisUtterance>();
  private listeners = new Set<() => void>();
  private preferred: Partial<Record<SpeechLang, string>> = {};
  private voiceWait: Promise<void> | null = null;
  private unlocked = false;

  constructor() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.synth = window.speechSynthesis;

    for (const lang of ['nl', 'en'] as SpeechLang[]) {
      try {
        const saved = localStorage.getItem(PREF_KEY[lang]);
        if (saved) this.preferred[lang] = saved;
      } catch {}
    }

    this.refreshVoices();
    // Chrome/Edge fill the voice list asynchronously; some browsers never fire the event, so poll briefly too.
    try {
      this.synth.addEventListener('voiceschanged', () => this.refreshVoices());
    } catch {
      this.synth.onvoiceschanged = () => this.refreshVoices();
    }
    let tries = 0;
    const poll = window.setInterval(() => {
      this.refreshVoices();
      if (this.voices.length > 0 || ++tries >= 20) window.clearInterval(poll);
    }, 250);

    // Speech must be unlocked by a touch on iOS/Safari; also stop talking when the app is hidden.
    const unlock = () => this.unlock();
    window.addEventListener('pointerdown', unlock, { capture: true, once: true });
    window.addEventListener('keydown', unlock, { capture: true, once: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stop();
    });
  }

  // --- Voice discovery -------------------------------------------------------------------

  private refreshVoices() {
    if (!this.synth) return;
    const list = this.synth.getVoices();
    if (list.length === 0 || list.length === this.voices.length) return;
    this.voices = list;
    this.listeners.forEach((cb) => cb());
  }

  private unlock() {
    if (this.unlocked || !this.synth) return;
    this.unlocked = true;
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      this.synth.speak(u);
    } catch {}
  }

  /** Resolves once the voice list is available (or after `maxMs`, so we never block forever). */
  private waitForVoices(maxMs = 1500): Promise<void> {
    if (this.voices.length > 0) return Promise.resolve();
    if (!this.voiceWait) {
      this.voiceWait = new Promise<void>((resolve) => {
        const done = () => {
          this.listeners.delete(done);
          resolve();
        };
        this.listeners.add(done);
        window.setTimeout(done, maxMs);
      });
    }
    return this.voiceWait;
  }

  /** Voices usable for a language, best first. */
  public getVoicesFor(lang: SpeechLang): SpeechSynthesisVoice[] {
    return rankVoices(this.voices, lang);
  }

  /** The voice that will actually be used for a language (honours the user's explicit choice). */
  public getVoiceFor(lang: SpeechLang): SpeechSynthesisVoice | undefined {
    return pickVoice(this.voices, lang, this.preferred[lang]);
  }

  public hasVoiceFor(lang: SpeechLang): boolean {
    return this.getVoiceFor(lang) !== undefined;
  }

  public isSupported(): boolean {
    return this.synth !== null;
  }

  /** Remember a voice chosen by the parent/teacher. Pass null to go back to automatic. */
  public setPreferredVoice(lang: SpeechLang, voiceURI: string | null) {
    if (voiceURI) this.preferred[lang] = voiceURI;
    else delete this.preferred[lang];
    try {
      if (voiceURI) localStorage.setItem(PREF_KEY[lang], voiceURI);
      else localStorage.removeItem(PREF_KEY[lang]);
    } catch {}
    this.listeners.forEach((cb) => cb());
  }

  public getPreferredVoiceURI(lang: SpeechLang): string | null {
    return this.preferred[lang] ?? null;
  }

  /** Subscribe to voice-list / selection changes. Returns an unsubscribe function. */
  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  // --- Speaking ---------------------------------------------------------------------------

  public speak(text: string, lang: SpeechLang, { style, onEnd }: SpeakOptions) {
    let ended = false;
    const finish = () => {
      if (ended) return;
      ended = true;
      onEnd?.();
    };

    const synth = this.synth;
    if (!synth) return finish();

    const prepared = prepareSpeechText(text, lang);
    if (!prepared) return finish();

    const id = ++this.requestId;
    const wasBusy = synth.speaking || synth.pending;
    if (wasBusy) synth.cancel();
    if (synth.paused) synth.resume();

    const start = () => {
      // A newer phrase arrived while we were waiting: this one is obsolete.
      if (id !== this.requestId) return finish();
      this.say(prepared, lang, style, finish);
    };

    if (this.voices.length === 0) {
      // First phrase before the browser has loaded its voices – wait instead of using a random default.
      this.waitForVoices().then(start);
    } else if (wasBusy) {
      // Chrome can drop an utterance queued in the same tick as cancel().
      window.setTimeout(start, 45);
    } else {
      start();
    }
  }

  private say(text: string, lang: SpeechLang, style: VoiceStyle, finish: () => void) {
    const synth = this.synth;
    if (!synth) return finish();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.getVoiceFor(lang);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang; // must match the voice or Chrome on Android falls back to a default
      } else {
        utterance.lang = LANG_TAG[lang];
      }

      const { rate, pitch } = prosodyFor(style, voice ? voiceQuality(voice) : 'standard');
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1;

      const inFlight = this.inFlight;
      let watchdog = 0;
      const done = () => {
        window.clearTimeout(watchdog);
        inFlight.delete(utterance);
        finish();
      };
      // Some engines never report the end; make sure game logic waiting on onEnd always continues.
      watchdog = window.setTimeout(done, 4000 + (text.length * 160) / rate);
      utterance.onend = done;
      utterance.onerror = done;

      inFlight.add(utterance);
      synth.speak(utterance);
    } catch {
      finish();
    }
  }

  public stop() {
    this.requestId++; // invalidates phrases that are still waiting to start
    try {
      this.synth?.cancel();
    } catch {}
  }
}
