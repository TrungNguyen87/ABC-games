export type Language = 'en' | 'nl';

export type VoiceStyle = 'soft-lady' | 'sweet-story' | 'cheerful';

export type GameMode =
  | 'menu'
  | 'lore-speller'
  | 'lore-characters'
  | 'letter-friends'
  | 'balloon-pop'
  | 'monster-snack'
  | 'autumn-leaves'
  | 'puddle-splash'
  | 'letter-trace'
  | 'phonics-match'
  | 'music-piano'
  | 'dutch-world'
  | 'sticker-book';

export interface LetterInfo {
  letter: string;
  lower: string;
  phonics: string;
  word: string;
  wordNl?: string; // Dutch word
  phonicsNl?: string; // Dutch phonic sound
  emoji: string;
  color: string;
  shadowColor: string;
  darkColor: string;
  textColor: string;
  pathPoints?: { x: number; y: number }[]; // For tracing guide
  loreCatchphrase?: string;
  loreSoundType?: string;
}

export interface WordItem {
  id: string;
  nl: string;
  en: string;
  emoji: string;
  articleNl: 'de' | 'het';
  category: 'autumn' | 'halloween' | 'animals' | 'food' | 'vehicles' | 'colors' | 'nature';
  color: string;
  soundCue?: string;
}

export interface SpellingWord {
  id: string;
  wordEn: string;
  wordNl: string;
  emoji: string;
  hintEn: string;
  hintNl: string;
  isHalloween?: boolean;
  category?: string;
}

export interface StickerItem {
  id: string;
  letter: string;
  word: string;
  emoji: string;
  unlocked: boolean;
  x?: number;
  y?: number;
  scene?: string;
}

export interface SoundSettings {
  muted: boolean;
  musicEnabled: boolean;
  voiceEnabled: boolean;
  voiceStyle: VoiceStyle;
}
