import React, { useState, useEffect, useCallback } from 'react';
import { ALPHABET_DATA } from '../../data/alphabetData';
import { LetterInfo, Language } from '../../types/game';
import LetterAvatar from '../LetterAvatar';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { Sparkles, RefreshCw } from 'lucide-react';

interface PhonicsMatchGameProps {
  onEarnStar: () => void;
  onUnlockSticker?: (letter: string) => void;
  language: Language;
}

export default function PhonicsMatchGame({
  onEarnStar,
  onUnlockSticker,
  language,
}: PhonicsMatchGameProps) {
  const [targetLetter, setTargetLetter] = useState<LetterInfo>(ALPHABET_DATA[0]);
  const [pictureOptions, setPictureOptions] = useState<LetterInfo[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wrongWord, setWrongWord] = useState<string | null>(null);

  const startRound = useCallback(() => {
    setIsLocked(false);
    setSelectedWord(null);
    setWrongWord(null);

    const target = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
    setTargetLetter(target);

    const wrong = ALPHABET_DATA.filter((l) => l.letter !== target.letter)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    const options = [...wrong, target].sort(() => 0.5 - Math.random());
    setPictureOptions(options);

    setTimeout(() => {
      if (language === 'nl') {
        sounds.speak(`Welk plaatje begint met de letter ${target.letter}?`, 'nl');
      } else {
        sounds.speak(`Which one starts with the letter ${target.letter}?`, 'en');
      }
    }, 400);
  }, [language]);

  useEffect(() => {
    startRound();
  }, [startRound]);

  const handleSelectOption = (item: LetterInfo) => {
    if (isLocked) return;

    const currentWord = language === 'nl' ? item.wordNl || item.word : item.word;

    if (item.letter === targetLetter.letter) {
      // Correct match!
      setIsLocked(true);
      setSelectedWord(currentWord);
      sounds.playChime();
      fireConfettiBurst();
      onEarnStar();
      if (onUnlockSticker) onUnlockSticker(targetLetter.letter);

      if (language === 'nl') {
        sounds.speak(
          `Ja! ${targetLetter.letter} is voor ${currentWord}! ${item.phonicsNl || item.phonics}, ${item.phonicsNl || item.phonics}, ${currentWord}!`,
          'nl'
        );
      } else {
        sounds.speak(
          `Yes! ${targetLetter.letter} is for ${currentWord}! ${item.phonics}, ${item.phonics}, ${currentWord}!`,
          'en'
        );
      }

      setTimeout(() => {
        startRound();
      }, 2400);
    } else {
      // Gentle mismatch
      setWrongWord(currentWord);
      sounds.playBoing();
      if (language === 'nl') {
        sounds.speak(
          `Dat is ${currentWord}. Zoek een woordje dat begint met ${targetLetter.letter}!`,
          'nl'
        );
      } else {
        sounds.speak(
          `That's ${currentWord}. Find what starts with ${targetLetter.letter}!`,
          'en'
        );
      }

      setTimeout(() => {
        setWrongWord(null);
      }, 700);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-2 px-4 max-w-4xl mx-auto select-none">
      {/* Top Question Header */}
      <div className="flex flex-col items-center mt-1">
        <div className="flex items-center gap-3">
          <div
            onClick={() =>
              sounds.speak(
                language === 'nl'
                  ? `Welk plaatje begint met de letter ${targetLetter.letter}?`
                  : `Which one starts with the letter ${targetLetter.letter}?`,
                language
              )
            }
            className="flex items-center gap-3 bg-white/30 hover:bg-white/40 backdrop-blur-md px-6 py-2 rounded-full border-2 border-white/60 shadow-lg cursor-pointer active:scale-95 transition-all"
          >
            <span className="text-xl sm:text-2xl font-black text-white drop-shadow">
              {language === 'nl' ? 'Wat begint met' : 'Which one starts with'}
            </span>
            <span
              className="text-4xl font-black px-4 py-1 rounded-2xl text-white drop-shadow-md"
              style={{ backgroundColor: targetLetter.color }}
            >
              {targetLetter.letter}
            </span>
          </div>

          <button
            onClick={startRound}
            className="w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 text-white flex items-center justify-center transition-all cursor-pointer"
            title="Ander letter"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Target Letter Spotlight */}
      <div className="my-2">
        <LetterAvatar
          letterInfo={targetLetter}
          size="lg"
          status={selectedWord ? 'celebrating' : 'idle'}
          language={language}
        />
      </div>

      {/* 3 Picture Cards */}
      <div className="w-full flex flex-col items-center mb-2">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 w-full max-w-2xl">
          {pictureOptions.map((item) => {
            const wordDisplay = language === 'nl' ? item.wordNl || item.word : item.word;
            const isMatch = selectedWord === wordDisplay;
            const isWrong = wrongWord === wordDisplay;

            return (
              <button
                key={item.letter}
                onClick={() => handleSelectOption(item)}
                disabled={isLocked}
                className={`relative w-28 h-36 sm:w-36 sm:h-44 bg-white rounded-3xl p-3 flex flex-col items-center justify-between shadow-xl border-4 transition-all cursor-pointer active:translate-y-2
                  ${isMatch ? 'border-yellow-400 scale-105 animate-kid-bounce bg-yellow-50' : 'border-white/80 hover:scale-105'}
                  ${isWrong ? 'animate-shake-wrong border-rose-400' : ''}
                `}
                style={{
                  boxShadow: isMatch
                    ? '0 10px 0 #ca8a04, 0 20px 25px rgba(0,0,0,0.2)'
                    : '0 8px 0 rgba(0,0,0,0.15), 0 15px 20px rgba(0,0,0,0.1)',
                }}
              >
                <div className="text-5xl sm:text-6xl my-auto transform transition-transform group-hover:scale-110">
                  {item.emoji}
                </div>

                <div className="w-full bg-slate-100 rounded-xl py-1 text-center font-black text-slate-800 text-base sm:text-lg">
                  <span
                    className="text-2xl font-black underline decoration-4 decoration-amber-400"
                    style={{ color: item.color }}
                  >
                    {wordDisplay[0]}
                  </span>
                  <span>{wordDisplay.slice(1)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom hint */}
      <div className="h-10 text-white font-extrabold text-sm sm:text-base drop-shadow">
        {language === 'nl'
          ? `Tik op het plaatje dat begint met ${targetLetter.letter}!`
          : `Tap the picture that begins with ${targetLetter.letter}!`}
      </div>
    </div>
  );
}
