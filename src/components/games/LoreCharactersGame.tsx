import React, { useState } from 'react';
import { Language } from '../../types/game';
import AlphabetLoreAvatar, { LORE_CHARACTERS, LoreCharacterDef } from '../AlphabetLoreAvatar';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { Volume2, Sparkles, HelpCircle, Moon, Sun, Award, RefreshCw } from 'lucide-react';

interface LoreCharactersGameProps {
  onEarnStar: () => void;
  language: Language;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function LoreCharactersGame({ onEarnStar, language }: LoreCharactersGameProps) {
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [isSpookyHalloween, setIsSpookyHalloween] = useState<boolean>(true);
  const [challengeTarget, setChallengeTarget] = useState<string | null>(null);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);

  const activeLore: LoreCharacterDef = LORE_CHARACTERS[selectedLetter] || LORE_CHARACTERS['A'];

  const handleSelectCharacter = (letter: string) => {
    setSelectedLetter(letter);

    // If challenge mode is active
    if (challengeTarget) {
      if (letter === challengeTarget) {
        sounds.playCheer();
        sounds.playSparkle();
        fireConfettiBurst(isSpookyHalloween ? 'halloween' : 'stars');
        onEarnStar();
        const successMsg =
          language === 'nl'
            ? `Super! Je hebt ${letter} gevonden! ⭐`
            : `Awesome! You found ${letter}! ⭐`;
        setChallengeFeedback(successMsg);
        sounds.speak(successMsg, language);
        setChallengeTarget(null);
      } else {
        sounds.playBoing();
        sounds.speak(
          language === 'nl'
            ? `Dat is ${letter}! Blijf zoeken naar ${challengeTarget}!`
            : `That is ${letter}! Keep looking for ${challengeTarget}!`,
          language
        );
      }
      return;
    }

    // Normal character interaction
    const lore = LORE_CHARACTERS[letter] || LORE_CHARACTERS['A'];
    if (letter === 'F' || isSpookyHalloween) {
      sounds.playGhost();
    } else {
      sounds.playBoing();
    }

    const quote = language === 'nl' ? lore.soundQuoteNl : lore.soundQuote;
    sounds.speak(`${letter}! ${quote}`, language);
  };

  const handleStartChallenge = () => {
    sounds.playPop();
    const randomLetter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    setChallengeTarget(randomLetter);
    setChallengeFeedback(null);

    const prompt =
      language === 'nl'
        ? `Kun jij Alphabet Lore ${randomLetter} vinden? Tik op de letter!`
        : `Can you find Alphabet Lore ${randomLetter}? Tap the letter!`;
    sounds.speak(prompt, language);
  };

  const handlePlaySoundQuote = () => {
    if (selectedLetter === 'F') {
      sounds.playSpookyBoo();
    } else {
      sounds.playBoing();
    }
    const quote = language === 'nl' ? activeLore.soundQuoteNl : activeLore.soundQuote;
    sounds.speak(`${activeLore.letter}! ${quote}`, language);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-2 sm:p-3 rounded-3xl bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 text-white overflow-y-auto overflow-x-hidden scrollbar-none select-none">
      {/* Halloween Bats / Floating Magic Dots in Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-4 left-6 text-3xl animate-bounce">🦇</div>
        <div className="absolute top-16 right-8 text-3xl animate-kid-float">👻</div>
        <div className="absolute bottom-8 left-12 text-3xl animate-pulse">🎃</div>
        <div className="absolute bottom-16 right-20 text-3xl animate-kid-wiggle">⭐</div>
      </div>

      {/* Top Controls Bar */}
      <div className="relative z-10 w-full max-w-5xl flex flex-wrap items-center justify-between gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 sm:py-2 rounded-2xl border border-white/20 flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Halloween Toggle */}
          <button
            onClick={() => {
              sounds.playPop();
              const next = !isSpookyHalloween;
              setIsSpookyHalloween(next);
              if (next) sounds.playSpookyBoo();
              else sounds.playSparkle();
            }}
            className={`px-3 py-1.5 rounded-full font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md cursor-pointer transition-all ${
              isSpookyHalloween
                ? 'bg-amber-500 text-amber-950 shadow-amber-500/50 hover:bg-amber-400'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            {isSpookyHalloween ? (
              <>
                <Moon className="w-4 h-4 fill-current" />
                <span>🎃 Halloween Stijl AAN</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4" />
                <span>🌟 Normale Lore</span>
              </>
            )}
          </button>
        </div>

        {/* Find Character Challenge Trigger */}
        <div className="flex items-center gap-2">
          {challengeTarget ? (
            <div className="flex items-center gap-2 bg-amber-400 text-amber-950 font-black px-3 py-1 rounded-full text-xs sm:text-sm animate-pulse">
              <span>🔎 {language === 'nl' ? `Zoek letter:` : `Find letter:`}</span>
              <span className="text-base text-red-600 font-extrabold">{challengeTarget}</span>
              <button
                onClick={() => setChallengeTarget(null)}
                className="ml-1 text-xs underline cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartChallenge}
              className="px-3 py-1.5 rounded-full bg-pink-600 hover:bg-pink-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md cursor-pointer animate-kid-bounce"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{language === 'nl' ? 'Zoekspelletje! 🎯' : 'Find Letter Game! 🎯'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Center Showcase Spotlight Stage */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-6 my-1 sm:my-auto w-full max-w-4xl py-1 flex-shrink-0">
        {/* Spotlight Avatar Preview */}
        <div className="relative flex flex-col items-center">
          <div className="relative p-3 sm:p-4 rounded-3xl bg-white/10 backdrop-blur-md border-3 border-white/30 shadow-xl flex flex-col items-center justify-center">
            {/* Glowing Spotlight Base */}
            <div
              className="absolute inset-0 rounded-3xl opacity-30 blur-xl pointer-events-none"
              style={{ backgroundColor: activeLore.color }}
            />

            <AlphabetLoreAvatar
              letter={selectedLetter}
              size="lg"
              isSpookyHalloween={isSpookyHalloween}
              interactive={false}
              language={language}
              className="my-0.5 animate-kid-bounce"
            />

            {/* Tap to speak catchphrase button */}
            <button
              onClick={handlePlaySoundQuote}
              className="mt-3 px-5 py-2 rounded-full font-black text-sm sm:text-base text-white shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              style={{
                backgroundColor: activeLore.color,
                boxShadow: `0 4px 0 ${activeLore.shadowColor}`,
              }}
            >
              <Volume2 className="w-5 h-5" />
              <span>
                {language === 'nl' ? activeLore.soundQuoteNl : activeLore.soundQuote}
              </span>
            </button>
          </div>
        </div>

        {/* Character Info Card & Personality Details */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left bg-black/40 backdrop-blur-md p-4 sm:p-5 rounded-3xl border-2 border-white/20 max-w-md w-full">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              Alphabet Lore Character
            </span>
            {isSpookyHalloween && (
              <span className="text-xs font-black bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full">
                🎃 Spooky Edition
              </span>
            )}
          </div>

          <h2 className="text-3xl sm:text-4xl font-black mt-1 text-white drop-shadow">
            Letter {activeLore.letter}
          </h2>

          <p className="text-sm font-bold text-amber-300 mt-0.5">
            {activeLore.personality}
          </p>

          <p className="text-xs sm:text-sm text-white/80 mt-2 font-medium">
            {language === 'nl'
              ? `Dit is karakter ${activeLore.letter} uit Alphabet Lore! Luister naar zijn leuke geluidje en speel mee met Halloween!`
              : `This is character ${activeLore.letter} from Alphabet Lore! Listen to its signature sound and play along with Halloween!`}
          </p>

          {/* Feedback message if challenge just succeeded */}
          {challengeFeedback && (
            <div className="mt-3 p-2 bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl animate-pop-in">
              {challengeFeedback}
            </div>
          )}

          {/* Toddler Action Buttons */}
          <div className="flex items-center gap-2 mt-3 w-full">
            <button
              onClick={() => {
                sounds.playBoing();
                sounds.speak(`${activeLore.letter} zegt ${language === 'nl' ? activeLore.soundQuoteNl : activeLore.soundQuote}!`, language);
              }}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs sm:text-sm shadow-md cursor-pointer text-center"
            >
              {language === 'nl' ? 'Zeg Kreetje 🗣️' : 'Speak Sound 🗣️'}
            </button>
            <button
              onClick={() => {
                sounds.playSparkle();
                fireConfettiBurst(isSpookyHalloween ? 'halloween' : 'stars');
                onEarnStar();
              }}
              className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-xl font-black text-xs sm:text-sm shadow-md cursor-pointer flex items-center gap-1"
            >
              <Award className="w-4 h-4" />
              <span>{language === 'nl' ? '+1 Ster ⭐' : '+1 Star ⭐'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid of All 26 Alphabet Lore Characters */}
      <div className="relative z-10 w-full max-w-5xl bg-black/40 backdrop-blur-md rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 border-2 border-white/20 flex flex-col items-center flex-shrink-0">
        <span className="text-[11px] sm:text-xs font-black text-white/90 mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          {language === 'nl'
            ? 'Tik op een karakter om te horen en zien (A tot Z):'
            : 'Tap any character to hear & explore (A to Z):'}
        </span>

        {/* Clean Responsive 26-Letter Grid without cutoffs */}
        <div className="w-full flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 flex-wrap p-0.5">
          {ALPHABET.map((char) => {
            const isSelected = selectedLetter === char;
            const isTarget = challengeTarget === char;
            return (
              <div
                key={char}
                className={`relative p-0.5 rounded-xl transition-all ${
                  isSelected
                    ? 'ring-3 sm:ring-4 ring-amber-400 scale-110 z-20'
                    : isTarget
                    ? 'ring-3 sm:ring-4 ring-red-500 animate-pulse scale-105 z-10'
                    : 'hover:scale-105'
                }`}
              >
                <AlphabetLoreAvatar
                  letter={char}
                  size="sm"
                  isSpookyHalloween={isSpookyHalloween}
                  interactive={true}
                  onClick={() => handleSelectCharacter(char)}
                  language={language}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
