/**
 * Pronunciation checks for the kids' speech layer. Run with: npm run test:speech
 *
 *  1. speechText   – what text the voice actually receives (Dutch letter names, ALL-CAPS words,
 *                    "A - B - C", stretched sounds, Dutch loanword spellings).
 *  2. voiceSelection – which installed voice wins on Edge / Chrome / macOS / iOS / Linux voice lists.
 *
 * When a child reports a word that sounds wrong, add it to the lexicon in src/utils/speechText.ts
 * and add a line here.
 */
import { prepareSpeechText as p } from '../src/utils/speechText';
import { pickVoice, rankVoices } from '../src/utils/voiceSelection';

let fail = 0;
console.log('== speechText ==');
function eq(input: string, lang: 'nl'|'en', expected: string) {
  const got = p(input, lang);
  const ok = got === expected;
  if (!ok) fail++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} [${lang}] ${JSON.stringify(input)} -> ${JSON.stringify(got)}${ok ? '' : `   (expected ${JSON.stringify(expected)})`}`);
}
// single letters
eq('A', 'nl', 'aa'); eq('C', 'nl', 'see'); eq('G', 'nl', 'gee'); eq('Y', 'nl', 'ie-grek'); eq('Z!', 'nl', 'zet');
eq('b', 'nl', 'bee'); eq('W', 'en', 'double you'); eq('A', 'en', 'ay'); eq('I', 'en', 'eye');
// letter + word
eq('A! Appel!', 'nl', 'aa, Appel!'); eq('G! Giraf!', 'nl', 'gee, Giraf!'); eq('A! Apple!', 'en', 'ay, Apple!');
// in sentences
eq('Plop de letter B!', 'nl', 'Plop de letter bee!');
eq('Super! Letter C!', 'nl', 'Super! Letter see!');
eq('Spring in de plas van D!', 'nl', 'Spring in de plas van dee!');
eq('Zet de G van licht naar donker in Rood!', 'nl', 'Zet de gee van licht naar donker in Rood!');
eq('Find the letter a!', 'en', 'Find the letter ay!');
eq('Hop into letter Q!', 'en', 'Hop into letter cue!');
// English words I / A must stay words
eq("I'm happy", 'en', "I'm happy");
eq('Now I know my ABCs!', 'en', 'Now I know my ay, bee, sees!');
eq('A magical black cat', 'en', 'A magical black cat');
eq("Let's play A and B!", 'en', "Let's play ay and bee!");
// ABC song
eq('A - B - C - D', 'nl', 'aa, bee, see, dee');
eq('W - X - Y en Z!', 'nl', 'wee, iks, ie-grek en zet!');
eq('Q - R - S', 'en', 'cue, ar, ess');
eq('Welkom bij ABC Kids!', 'nl', 'Welkom bij aa, bee, see Kids!');
// all caps words
eq('BOE! Wat roept een lief spookje?', 'nl', 'Boe! Wat roept een lief spookje?');
eq('GHOST', 'en', 'Ghost'); eq('KAT', 'nl', 'Kat');
// stretched sounds
eq('Beeee!', 'en', 'Bee!'); eq('Ssssslang!', 'nl', 'Slang!'); eq('Aaaah!', 'nl', 'Aah!'); eq('Efff!', 'en', 'Ef!'); eq('Mmmm! Lekker!', 'nl', 'Mmm! Lekker!');
eq('Hooooly Ghost!', 'en', 'Hooly Ghost!');
// Dutch loanwords
eq('Warme Chocomel', 'nl', 'Warme Sjokomel'); eq('Quiche', 'nl', 'Kiesj'); eq('Yoghurt', 'nl', 'Jogurt');
eq('Xylofoon', 'nl', 'Ksielofoon'); eq('Whoosh!', 'nl', 'Woesj!');
eq('Kun jij Alphabet Lore B vinden? Tik op de letter!', 'nl', 'Kun jij Alfabet lor bee vinden? Tik op de letter!');
eq('Boo! Welcome to Halloween Word Speller!', 'en', 'Boo! Welcome to Halloween Word Speller!');
eq('Boe! Welkom bij Halloween Woordjes Spellen!', 'nl', 'Boe! Welkom bij Hellowien Woordjes Spellen!');
// emoji / junk
eq('🎃 Pompoen! 🎃', 'nl', 'Pompoen!'); eq('🎃', 'nl', ''); eq('', 'nl', '');
eq('Super!!! Letter A!!', 'nl', 'Super! Letter aa!');
eq('3 puzzelstukjes!', 'nl', '3 puzzelstukjes!');
eq('Tsjoek tsjoek!', 'nl', 'Tsjoek tsjoek!');
eq('Bèèèè!', 'nl', 'Bèè!');


console.log('\n== voiceSelection ==');
const v = (name: string, lang: string, local = true) => ({ name, lang, voiceURI: name, localService: local });
function expectPick(label: string, voices: any[], lang: 'nl'|'en', want: string | RegExp | undefined, pref?: string) {
  const got = pickVoice(voices, lang, pref)?.name;
  const ok = want === undefined ? got === undefined : typeof want === 'string' ? got === want : !!got && want.test(got);
  if (!ok) fail++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label} [${lang}] -> ${got}`);
}
const edge = [
  v('Microsoft Frank - Dutch (Netherlands)', 'nl-NL'), v('Microsoft Zira - English (United States)', 'en-US'),
  v('Microsoft Arnaud Online (Natural) - Dutch (Belgium)', 'nl-BE', false), v('Microsoft Dena Online (Natural) - Dutch (Belgium)', 'nl-BE', false),
  v('Microsoft Maarten Online (Natural) - Dutch (Netherlands)', 'nl-NL', false),
  v('Microsoft Colette Online (Natural) - Dutch (Netherlands)', 'nl-NL', false),
  v('Microsoft Fenna Online (Natural) - Dutch (Netherlands)', 'nl-NL', false),
  v('Microsoft Guy Online (Natural) - English (United States)', 'en-US', false),
  v('Microsoft Jenny Online (Natural) - English (United States)', 'en-US', false),
  v('Microsoft David - English (United States)', 'en-US'),
];
expectPick('Edge', edge, 'nl', /Colette|Fenna/);
expectPick('Edge', edge, 'en', /Jenny/);
const chrome = [v('Google US English', 'en-US', false), v('Google UK English Male', 'en-GB', false), v('Google Nederlands', 'nl-NL', false), v('Google français', 'fr-FR', false)];
expectPick('Chrome desktop', chrome, 'nl', 'Google Nederlands');
expectPick('Chrome desktop', chrome, 'en', 'Google US English');
const mac = [v('Ellen', 'nl-BE'), v('Xander', 'nl-NL'), v('Claire', 'nl-NL'), v('Claire (Premium)', 'nl-NL'), v('Fenna (Enhanced)', 'nl-NL'), v('Zarvox', 'en-US'), v('Fred', 'en-US'), v('Samantha', 'en-US'), v('Samantha (Enhanced)', 'en-US'), v('Daniel', 'en-GB')];
expectPick('macOS/iOS', mac, 'nl', /Claire \(Premium\)|Fenna \(Enhanced\)/);
expectPick('macOS/iOS', mac, 'en', 'Samantha (Enhanced)');
// Flemish only available -> still used as fallback, but real nl-NL always beats it
expectPick('only Flemish', [v('Ellen', 'nl-BE')], 'nl', 'Ellen');
expectPick('NL basic beats BE neural', [v('Microsoft Arnaud Online (Natural)', 'nl-BE'), v('Xander', 'nl-NL')], 'nl', 'Xander');
const linux = [v('English (America)', 'en-US'), v('Dutch', 'nl')];
expectPick('Linux espeak', linux, 'nl', 'Dutch');
expectPick('no Dutch voice at all', chrome.filter(x => !x.lang.startsWith('nl')), 'nl', undefined);
expectPick('Android underscore lang', [v('Dutch Netherlands', 'nl_NL'), v('English United States', 'en_US')], 'nl', 'Dutch Netherlands');
// explicit user choice wins; stale choice is ignored
expectPick('user pref', edge, 'nl', 'Microsoft Fenna Online (Natural) - Dutch (Netherlands)', 'Microsoft Fenna Online (Natural) - Dutch (Netherlands)');
expectPick('user pref wrong language ignored', edge, 'nl', /Colette|Fenna/, 'Microsoft Jenny Online (Natural) - English (United States)');
expectPick('stale pref ignored', edge, 'nl', /Colette|Fenna/, 'gone');
console.log('Edge nl ranking:', rankVoices(edge, 'nl').map(x => x.name.replace('Microsoft ', '')));


console.log(fail ? `\n${fail} FAILED` : '\nall passed');
process.exit(fail ? 1 : 0);
