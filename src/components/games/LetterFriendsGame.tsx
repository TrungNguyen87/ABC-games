import React, { useState, useEffect, useCallback } from 'react';
import { ALPHABET_DATA } from '../../data/alphabetData';
import { LetterInfo, Language } from '../../types/game';
import LetterAvatar from '../LetterAvatar';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { Sparkles, RefreshCw } from 'lucide-react';

interface LetterFriendsGameProps {
  onEarnStar: () => void;
  onUnlockSticker?: (letter: string) => void;
  stars: number;
  language: Language;
}

export default function LetterFriendsGame({
  onEarnStar,
  onUnlockSticker,
  language,
}: LetterFriendsGameProps) {
  const [targetLetter, setTargetLetter] = useState<LetterInfo>(ALPHABET_DATA[0]);
  const [options, setOptions] = useState<LetterInfo[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [wrongLetter, setWrongLetter] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [optionCount, setOptionCount] = useState<number>(3); // 2, 3 or 4

  const startNewRound = useCallback(() => {
    setIsLocked(false);
    setSelectedLetter(null);
    setWrongLetter(null);
    setFeedbackText('');

    // Pick random target
    const randomTarget = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
    setTargetLetter(randomTarget);

    // Pick wrong options
    const others = ALPHABET_DATA.filter((l) => l.letter !== randomTarget.letter);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random());
    const wrongSelected = shuffledOthers.slice(0, optionCount - 1);

    const roundOptions = [...wrongSelected, randomTarget].sort(() => 0.5 - Math.random());
    setOptions(roundOptions);

    // Speak after slight delay: teach the word starting with that letter
    const targetWord = language === 'nl' ? randomTarget.wordNl || randomTarget.word : randomTarget.word;
    setTimeout(() => {
      if (language === 'nl') {
        sounds.speak(`Kun je de ${randomTarget.letter} van ${targetWord} vinden?`, 'nl');
      } else {
        sounds.speak(`Can you find the letter ${randomTarget.letter} for ${targetWord}?`, 'en');
      }
    }, 400);
  }, [optionCount, language]);

  useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  const handleCardClick = (letter: LetterInfo) => {
    if (isLocked) return;

    const targetWord = language === 'nl' ? targetLetter.wordNl || targetLetter.word : targetLetter.word;
    const clickedWord = language === 'nl' ? letter.wordNl || letter.word : letter.word;

    if (letter.letter === targetLetter.letter) {
      // Success!
      setIsLocked(true);
      setSelectedLetter(letter.letter);
      setFeedbackText(
        language === 'nl'
          ? `GOED ZO! ${letter.letter} van ${targetWord}! ${targetLetter.emoji}`
          : `YAY! ${letter.letter} for ${targetWord}! ${targetLetter.emoji}`
      );
      sounds.playChime();
      fireConfettiBurst();

      onEarnStar();
      if (onUnlockSticker) {
        onUnlockSticker(letter.letter);
      }

      if (language === 'nl') {
        sounds.speak(
          `Geweldig! De ${letter.letter} van ${targetWord}!`,
          'nl'
        );
      } else {
        sounds.speak(`Awesome! ${letter.letter} for ${targetWord}!`, 'en');
      }

      setTimeout(() => {
        startNewRound();
      }, 2300);
    } else {
      // Gentle mistake
      setWrongLetter(letter.letter);
      sounds.playBoing();
      if (language === 'nl') {
        sounds.speak(
          `Dat is de ${letter.letter} van ${clickedWord}. Zoek de ${targetLetter.letter} van ${targetWord}!`,
          'nl'
        );
      } else {
        sounds.speak(`That's ${letter.letter} for ${clickedWord}. Find ${targetLetter.letter} for ${targetWord}!`, 'en');
      }
      setTimeout(() => {
        setWrongLetter(null);
      }, 700);
    }
  };

  const handleRepeatVoice = () => {
    if (!isLocked) {
      const targetWord = language === 'nl' ? targetLetter.wordNl || targetLetter.word : targetLetter.word;
      if (language === 'nl') {
        sounds.speak(`Zoek de ${targetLetter.letter} van ${targetWord}!`, 'nl');
      } else {
        sounds.speak(`Find the letter ${targetLetter.letter} for ${targetWord}!`, 'en');
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-2 px-4 max-w-4xl mx-auto">
      {/* Target Letter Prompt Box */}
      <div className="flex flex-col items-center mt-1">
        <div className="flex items-center gap-2 mb-2">
          {/* Difficulty pill selectors */}
          <div className="bg-white/30 backdrop-blur-sm p-1 rounded-full flex gap-1 border border-white/40">
            <button
              onClick={() => {
                setOptionCount(2);
                sounds.playPop();
              }}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                optionCount === 2 ? 'bg-white text-sky-700 shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              {language === 'nl' ? 'Makkelijk (2)' : 'Easy (2)'}
            </button>
            <button
              onClick={() => {
                setOptionCount(3);
                sounds.playPop();
              }}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                optionCount === 3 ? 'bg-white text-sky-700 shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              {language === 'nl' ? 'Klassiek (3)' : 'Classic (3)'}
            </button>
            <button
              onClick={() => {
                setOptionCount(4);
                sounds.playPop();
              }}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                optionCount === 4 ? 'bg-white text-sky-700 shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              {language === 'nl' ? 'Uitdaging (4)' : 'Challenge (4)'}
            </button>
          </div>

          <button
            onClick={startNewRound}
            className="w-8 h-8 rounded-full bg-white/30 hover:bg-white/50 text-white flex items-center justify-center transition-all cursor-pointer"
            title="Ander letter"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Big visual cue for 3-4 year olds showing the word starting with that letter */}
        <div
          onClick={handleRepeatVoice}
          className="flex items-center gap-2 sm:gap-3 bg-white/30 hover:bg-white/40 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border-2 border-white/60 shadow-lg cursor-pointer transition-all active:scale-95"
        >
          <span className="text-xl sm:text-2xl text-white font-extrabold drop-shadow">
            {language === 'nl' ? 'Zoek de' : 'Find the'}
          </span>
          <span
            className="text-3xl sm:text-4xl font-black px-3.5 py-0.5 rounded-xl text-white drop-shadow-md animate-kid-bounce"
            style={{
              backgroundColor: targetLetter.color,
              boxShadow: `0 4px 0 ${targetLetter.shadowColor}`,
            }}
          >
            {targetLetter.letter}
          </span>
          <span className="text-xl sm:text-2xl text-white font-black drop-shadow">
            {language === 'nl'
              ? `van ${targetLetter.wordNl || targetLetter.word}`
              : `for ${targetLetter.word}`}
          </span>
          <span className="text-2xl sm:text-3xl drop-shadow animate-kid-bounce">{targetLetter.emoji}</span>
        </div>
      </div>

      {/* Center: The Letter Cards */}
      <div className="w-full flex-1 flex items-center justify-center my-3">
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 max-w-2xl">
          {options.map((letter) => {
            const isCorrect = selectedLetter === letter.letter;
            const isWrong = wrongLetter === letter.letter;

            return (
              <div
                key={letter.letter}
                className="transform transition-transform duration-200"
              >
                <LetterAvatar
                  letterInfo={letter}
                  size={optionCount === 4 ? 'md' : 'lg'}
                  status={isCorrect ? 'celebrating' : isWrong ? 'wrong' : 'idle'}
                  onClick={() => handleCardClick(letter)}
                  showWord={isCorrect}
                  language={language}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Feedback Banner */}
      <div className="h-16 flex items-center justify-center">
        {feedbackText ? (
          <div className="animate-pop-in bg-yellow-400 text-yellow-950 font-black text-2xl sm:text-3xl px-8 py-2.5 rounded-full shadow-[0_5px_0_#ca8a04] flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-yellow-900 animate-spin" />
            <span>{feedbackText}</span>
          </div>
        ) : (
          <p className="text-white/80 font-bold text-base sm:text-lg drop-shadow">
            {language === 'nl'
              ? `Tik op het kaartje van letter ${targetLetter.letter}!`
              : `Tap the card that matches ${targetLetter.letter}!`}
          </p>
        )}
      </div>
    </div>
  );
}
