/**
 * Speech text preparation for kids' text-to-speech.
 *
 * Browser voices are built for reading prose, not for a toddler game. They:
 *  - read a lone "B" or "C" inconsistently (or as an abbreviation),
 *  - spell out short ALL-CAPS words ("BOE" -> "B O E"),
 *  - read "A - B - C - D" as "A minus B ...",
 *  - guess wrong on Dutch spellings of loanwords ("Chocomel", "Quiche").
 *
 * Everything here is pure (no DOM / Web Speech APIs) so it can be tested in Node.
 * `prepareSpeechText` is applied to every phrase right before it reaches a voice.
 */

export type SpeechLang = 'en' | 'nl';

/**
 * Letter names written the way each language's TTS reliably pronounces them.
 * Dutch uses the Dutch letter names (a = "aa", b = "bee", ... y = "ie-grek", z = "zet").
 */
export const LETTER_NAMES: Record<SpeechLang, Record<string, string>> = {
  nl: {
    A: 'aa', B: 'bé', C: 'cé', D: 'dé', E: 'ee', F: 'ef', G: 'gé', H: 'haa', I: 'ie',
    J: 'jee', K: 'kaa', L: 'el', M: 'em', N: 'en', O: 'oo', P: 'pé', Q: 'kuu', R: 'er',
    S: 'es', T: 'té', U: 'uu', V: 'vé', W: 'wé', X: 'iks', Y: 'Griekse ij', Z: 'zet',
  },
  en: {
    A: 'ay', B: 'bee', C: 'see', D: 'dee', E: 'ee', F: 'eff', G: 'jee', H: 'aitch', I: 'eye',
    J: 'jay', K: 'kay', L: 'el', M: 'em', N: 'en', O: 'oh', P: 'pee', Q: 'cue', R: 'ar',
    S: 'ess', T: 'tee', U: 'you', V: 'vee', W: 'double you', X: 'ex', Y: 'why', Z: 'zee',
  },
};

/**
 * Words whose normal Dutch/English spelling is read wrongly by common TTS engines.
 * Values are respellings that a Dutch (or English) voice reads the way a native
 * speaker says the word. Matching is case-insensitive and keeps the first-letter case.
 */
const LEXICON: Record<SpeechLang, [RegExp, string][]> = {
  nl: [
    // "ch" in these loanwords is /ʃ/ ("sj"), not the Dutch /x/ ("chocomel" -> "xokomel")
    [/\bchocomel\b/gi, 'sjokomel'],
    [/\bchocolade\b/gi, 'sjokolade'],
    [/\bchocola\b/gi, 'sjokola'],
    [/\bquiche\b/gi, 'kiesj'],
    [/\byoghurt\b/gi, 'jogurt'],
    [/\bxylofoon\b/gi, 'ksielofoon'],
    [/\bhalloween\b/gi, 'hellowien'],
    [/\bwhoosh\b/gi, 'woesj'],
    [/\bswoosh\b/gi, 'swoesj'],
    [/\balphabet lore\b/gi, 'alfabet lor'],
    [/\balphabet\b/gi, 'alfabet'],
  ],
  en: [
    [/\bxylophone\b/gi, 'zy-luh-phone'],
    [/\bquiche\b/gi, 'keesh'],
  ],
};

// Emoji, pictographs, variation selectors, zero-width joiners.
const EMOJI_RE = /[\p{Extended_Pictographic}\u{FE0E}\u{FE0F}\u{200D}\u{20E3}]/gu;

const SINGLE_LETTER_RE = /^[a-z]$/i;

function titleCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function letterName(letter: string, lang: SpeechLang): string {
  return LETTER_NAMES[lang][letter.toUpperCase()] ?? letter;
}

function applyLexicon(text: string, lang: SpeechLang): string {
  let out = text;
  for (const [re, replacement] of LEXICON[lang]) {
    out = out.replace(re, (match: string) => {
      // keep a leading capital ("Quiche" -> "Kiesj")
      const startsUpper = match.charAt(0) !== match.charAt(0).toLowerCase();
      return startsUpper
        ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
        : replacement;
    });
  }
  return out;
}

/**
 * Stretched sounds like "Beeee!" / "Ssssslang!" / "Aaaah!" are decorative on screen but
 * make TTS stumble. Vowel runs are shortened to a long-vowel pair, consonant runs to one letter
 * (so "Ssssslang" becomes the real word "Slang").
 */
function collapseStretchedLetters(text: string): string {
  // `i` flag: the back-reference also matches across case ("S" + "ssss").
  return text.replace(/(\p{L})\1{2,}/giu, (_m, ch: string) => {
    const low = ch.toLowerCase();
    if (low === 'm') return ch + 'mm'; // "Mmmm!" is a happy hum, not the letter "em"
    return /[aeiouyàáâäèéêëìíîïòóôöùúûü]/.test(low) ? ch + low : ch;
  });
}

/**
 * Turn "A - B - C - D" (letters separated by dashes) into spoken letter names with
 * natural pauses: "aa, bee, see, dee".
 */
function expandDashedLetterRuns(text: string, lang: SpeechLang): string {
  return text.replace(
    /(?<![\p{L}\p{N}])[\p{L}](?:\s*[-–—]\s*[\p{L}])+(?![\p{L}\p{N}])/gu,
    (run) =>
      run
        .split(/\s*[-–—]\s*/)
        .map((l) => (SINGLE_LETTER_RE.test(l) ? letterName(l, lang) : l))
        .join(', ')
  );
}

/**
 * Replace standalone letters with their spoken names.
 *
 * Standalone *uppercase* letters ("Plop de letter B!", "Zet de G ...") are always letters.
 * English "A" and "I" are also real words ("A cat", "I know"), so they only count as letters
 * when they stand alone or are clearly addressed as a letter.
 */
function expandStandaloneLetters(text: string, lang: SpeechLang): string {
  // The whole phrase is one letter (any case): "a", "B!", "c."
  const solo = text.match(/^\s*([a-z])\s*[!.?]*\s*$/i);
  if (solo) return letterName(solo[1], lang);

  let out = text;

  // "letter b" / "letters" context: lowercase letters directly after the word letter
  out = out.replace(
    /\b(letter|letters)\s+([a-z])(?![\p{L}\p{N}'’])/giu,
    (_m, word: string, l: string) => `${word} ${letterName(l, lang)}`
  );

  // Standalone uppercase letters. (?<![\p{L}\p{N}'’]) / (?![\p{L}\p{N}'’]) keep "I'm", "A4", "U2" intact.
  out = out.replace(
    /(?<![\p{L}\p{N}'’])([A-Z])(?![\p{L}\p{N}'’])/gu,
    (match: string, l: string, offset: number, whole: string) => {
      if (lang === 'en' && (l === 'A' || l === 'I')) {
        const after = whole.slice(offset + 1);
        const before = whole.slice(0, offset);
        const letterContext =
          /^\s*([!?.,:;]|$)/.test(after) || // "A!" "I." end of phrase
          /\bletter\s*$/i.test(before) || // "letter I"
          /^\s+(and|or)\s+[A-Z](?![\p{L}\p{N}'’])/u.test(after); // "A and B"
        if (!letterContext) return match;
      }
      return letterName(l, lang);
    }
  );

  return out;
}

/**
 * ALL-CAPS words of 2+ letters ("BOE", "KAT", "GHOST") are often spelled out by TTS
 * engines. Spoken text should be a normal word, so lowercase them.
 */
function softenAllCapsWords(text: string): string {
  return text.replace(/(?<![\p{L}\p{N}])[\p{Lu}]{2,}(?![\p{L}\p{N}])/gu, (w) => titleCase(w));
}

/** "ABC" -> spoken letter names in the active language. */
function expandAbc(text: string, lang: SpeechLang): string {
  const abc = ['A', 'B', 'C'].map((l) => letterName(l, lang));
  return text.replace(/\bABC(s?)\b/g, (_m, plural: string) =>
    plural ? `${abc[0]}, ${abc[1]}, ${abc[2]}s` : abc.join(', ')
  );
}

/**
 * "G! Giraf!" -> "gee, Giraf!"  A comma gives the natural short pause between the letter and
 * the example word, instead of two separate shouted sentences.
 */
function joinLetterWithWord(text: string, lang: SpeechLang): string {
  return text.replace(
    /^\s*([a-z])\s*[!.]\s+(?=\S)/i,
    (_m, l: string) => `${letterName(l, lang)}, `
  );
}

function cleanPunctuation(text: string): string {
  return text
    .replace(/[’‘`´]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/&/g, ' ')
    .replace(/[*_~#^|\\/<>=+•→←↑↓★☆♥♡✓✔✨]/g, ' ')
    .replace(/\s[-–—]\s/g, ', ') // spaced dash between words -> pause
    .replace(/\(([^)]*)\)/g, ', $1, ')
    .replace(/([!?.])\1{1,}/g, '$1') // "!!!" -> "!"
    .replace(/\.{2,}/g, '…')
    .replace(/\s*,\s*,+/g, ',')
    .replace(/,\s*([!?.…])/g, '$1')
    .replace(/\s+([!?.,…])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Prepare a phrase for the voice of `lang`. Returns '' when nothing speakable remains.
 */
export function prepareSpeechText(input: string, lang: SpeechLang): string {
  if (!input) return '';
  let text = input.normalize('NFC').replace(EMOJI_RE, ' ');

  text = cleanPunctuation(text);
  text = collapseStretchedLetters(text);
  text = expandAbc(text, lang);
  text = expandDashedLetterRuns(text, lang);
  text = joinLetterWithWord(text, lang);
  text = expandStandaloneLetters(text, lang);
  text = softenAllCapsWords(text);
  text = applyLexicon(text, lang);
  text = cleanPunctuation(text);

  // Nothing readable (e.g. emoji-only)
  if (!/[\p{L}\p{N}]/u.test(text)) return '';
  return text;
}
