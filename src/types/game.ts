export type Language = 'en' | 'nl';

export type VoiceStyle = 'soft-lady' | 'sweet-story' | 'cheerful';

export type AppTheme = 'sinterklaas' | 'christmas' | 'halloween' | 'autumn' | 'classic';

export type GameMode =
  | 'menu'
  | 'alphabet-puzzle'
  | 'halloween-pop'
  | 'color-grading'
  | 'toddler-counting'
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

export type LetterStyleOption = 'lore' | 'normal';

export interface LetterInfo {
  letter: string;
  lower: string;
  phonics: string;
  word: string;
  wordNl?: string; // Dutch word
  phonicsNl?: string; // Dutch phonic sound
  emoji: string;
  emojiNl?: string; // Dutch-specific matching emoji
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
  category: 'autumn' | 'halloween' | 'sinterklaas' | 'christmas' | 'animals' | 'food' | 'vehicles' | 'colors' | 'nature';
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
  category?: 'halloween' | 'sinterklaas' | 'christmas' | 'fruits' | 'animals' | 'toys' | 'autumn' | 'everyday' | string;
  funSoundEn?: string;
  funSoundNl?: string;
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
