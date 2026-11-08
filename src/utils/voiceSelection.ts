/**
 * Choosing the best text-to-speech voice for a language.
 *
 * Every device ships different voices, and the difference between the worst and the best one is
 * huge: a robotic "compact" voice versus a neural "Natural" one. Instead of matching a handful of
 * hard-coded names, each installed voice gets a score and the highest score wins.
 *
 * Priorities (highest first):
 *  1. Right language *and region* – Dutch kids should hear nl-NL, not Flemish nl-BE or English.
 *  2. Quality – neural / natural / premium / enhanced beat standard, robotic synthesizers lose.
 *  3. A friendly female voice, which suits a preschool teacher tone best.
 *
 * Pure functions only (no DOM) so the logic is unit-testable.
 */

import type { SpeechLang } from './speechText';

/** The subset of SpeechSynthesisVoice we need (lets tests pass plain objects). */
export interface VoiceLike {
  name: string;
  lang: string;
  voiceURI: string;
  localService?: boolean;
}

export type VoiceQuality = 'neural' | 'high' | 'standard' | 'robotic';

const norm = (lang: string) => lang.replace(/_/g, '-').toLowerCase();

/** Language/region fit. -Infinity means "not this language, never use". */
function languageScore(voice: VoiceLike, target: SpeechLang): number {
  const l = norm(voice.lang);
  if (target === 'nl') {
    if (l === 'nl-nl') return 1000;
    if (l === 'nl') return 800; // region unspecified – typically the Netherlands
    if (l === 'nl-be') return 400; // Flemish: understandable, but not the Dutch accent
    if (l.startsWith('nl-')) return 300;
    return -Infinity;
  }
  if (l === 'en-us') return 1000;
  if (l === 'en-gb') return 920;
  if (l === 'en') return 850;
  if (l === 'en-au' || l === 'en-ca') return 760;
  if (l === 'en-ie' || l === 'en-nz' || l === 'en-za') return 680;
  if (l === 'en-in') return 500;
  if (l.startsWith('en-')) return 400;
  return -Infinity;
}

/**
 * Quality tier from the voice name. Browsers don't expose a quality flag, but vendors encode it
 * in the name: Edge "Online (Natural)", Apple "Premium"/"Enhanced", Chrome "Google …".
 */
export function voiceQuality(voice: VoiceLike): VoiceQuality {
  const n = voice.name.toLowerCase();
  if (/espeak|festival|mbrola|flite|pico|robot/.test(n)) return 'robotic';
  if (/natural|neural/.test(n)) return 'neural';
  if (/premium|enhanced|siri|online|google/.test(n)) return 'high';
  if (/compact/.test(n)) return 'robotic';
  return 'standard';
}

const QUALITY_SCORE: Record<VoiceQuality, number> = {
  neural: 220,
  high: 130,
  standard: 0,
  robotic: -250,
};

// Apple's joke/novelty voices – never appropriate for teaching letters.
const NOVELTY = /\b(bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|albert|fred|junior|kathy|ralph|deranged|hysterical|pipe organ)\b/i;

const FEMALE_NAMES =
  /\b(colette|fenna|claire|ellen|lotte|laura|sanne|maaike|fleur|saskia|samantha|ava|allison|susan|victoria|karen|moira|tessa|fiona|serena|kate|zira|jenny|aria|ana|michelle|emma|libby|sonia|sara|nova|shimmer|female|woman|vrouw)\b/i;
const MALE_NAMES =
  /\b(maarten|xander|frank|pim|ronnie|david|mark|daniel|alex|tom|aaron|guy|ryan|christopher|eric|george|james|thomas|rishi|male|man|jongen)\b/i;
// "Google Nederlands" / "Google US English" are female voices without a gender in the name.
const GOOGLE_DEFAULT_FEMALE = /^google (nederlands|us english|uk english female)/i;

function genderScore(voice: VoiceLike): number {
  const n = voice.name;
  if (/\bfemale\b/i.test(n) || FEMALE_NAMES.test(n) || GOOGLE_DEFAULT_FEMALE.test(n)) return 45;
  if (/\bmale\b/i.test(n) || MALE_NAMES.test(n)) return -20;
  return 0;
}

export function scoreVoice(voice: VoiceLike, target: SpeechLang): number {
  const lang = languageScore(voice, target);
  if (lang === -Infinity) return -Infinity;
  if (NOVELTY.test(voice.name)) return -Infinity;

  let score = lang;
  score += QUALITY_SCORE[voiceQuality(voice)];
  score += genderScore(voice);
  if (voice.localService) score += 8; // works offline, starts instantly
  return score;
}

/** Voices usable for `target`, best first. */
export function rankVoices<T extends VoiceLike>(voices: readonly T[], target: SpeechLang): T[] {
  return voices
    .map((v) => ({ v, s: scoreVoice(v, target) }))
    .filter((x) => x.s > -Infinity)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.v);
}

/**
 * Pick the voice to use. A voice the user chose explicitly (`preferredURI`) wins as long as it
 * still exists and belongs to the right language.
 */
export function pickVoice<T extends VoiceLike>(
  voices: readonly T[],
  target: SpeechLang,
  preferredURI?: string | null
): T | undefined {
  const ranked = rankVoices(voices, target);
  if (preferredURI) {
    const chosen = ranked.find((v) => v.voiceURI === preferredURI);
    if (chosen) return chosen;
  }
  return ranked[0];
}
