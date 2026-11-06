import React, { useState, useEffect, useCallback } from 'react';
import { ALPHABET_DATA } from '../../data/alphabetData';
import { LetterInfo, Language } from '../../types/game';
import { sounds } from '../../utils/soundEffects';
import { fireConfettiBurst } from '../ConfettiCanvas';
import { triggerKidCheer } from '../CheerCelebration';
import { Sparkles } from 'lucide-react';

interface MonsterSnackGameProps {
  onEarnStar: () => void;
  onUnlockSticker?: (letter: string) => void;
  language: Language;
}

export default function MonsterSnackGame({
  onEarnStar,
  onUnlockSticker,
  language,
}: MonsterSnackGameProps) {
  const [targetLetter, setTargetLetter] = useState<LetterInfo>(ALPHABET_DATA[0]);
  const [cookieOptions, setCookieOptions] = useState<LetterInfo[]>([]);
  const [monsterState, setMonsterState] = useState<'hungry' | 'chewing' | 'happy' | 'disgusted'>('hungry');
  const [isLocked, setIsLocked] = useState(false);
  const [speechBubble, setSpeechBubble] = useState<string>('');
  const hasIntroducedRef = React.useRef(false);

  const nextRound = useCallback(() => {
    setIsLocked(false);
    setMonsterState('hungry');

    const target = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
    setTargetLetter(target);

    const wrong = ALPHABET_DATA.filter((l) => l.letter !== target.letter)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);

    const cookies = [...wrong, target].sort(() => 0.5 - Math.random());
    setCookieOptions(cookies);

    const targetWord = language === 'nl' ? target.wordNl || target.word : target.word;
    setSpeechBubble(targetWord);
    // Only speak the introductory phrase once
    if (!hasIntroducedRef.current) {
      hasIntroducedRef.current = true;
      if (language === 'nl') {
        sounds.speak(`Voer het monster! ${targetWord}!`, 'nl');
      } else {
        sounds.speak(`Feed the monster! ${targetWord}!`, 'en');
      }
    } else {
      // Just say the word
      sounds.speak(targetWord, language);
    }
  }, [language]);

  useEffect(() => {
    nextRound();
  }, [nextRound]);

  const handleFeedCookie = (cookie: LetterInfo) => {
    if (isLocked) return;

    const cookieWord = language === 'nl' ? cookie.wordNl || cookie.word : cookie.word;

    if (cookie.letter === targetLetter.letter) {
      // Monster loves it!
      setIsLocked(true);
      setMonsterState('chewing');
      sounds.playMunch();
      setSpeechBubble(cookieWord);

      setTimeout(() => {
        setMonsterState('happy');
        sounds.playBurp();
        sounds.playTada();
        fireConfettiBurst();
        triggerKidCheer({
          message: language === 'nl' ? 'LEKKER GEGETEN!' : 'YUMMY SNACK!',
          emoji: '🍪',
        });
        onEarnStar();
        if (onUnlockSticker) onUnlockSticker(cookie.letter);

        setSpeechBubble(cookieWord);
        // Just say the word, do not spell it
        sounds.speak(cookieWord, language);
      }, 700);

      setTimeout(() => {
        nextRound();
      }, 2100);
    } else {
      // Wrong cookie
      setMonsterState('disgusted');
      sounds.playBoing();
      // Just say the clicked word
      sounds.speak(cookieWord, language);

      setTimeout(() => {
        setMonsterState('hungry');
        setSpeechBubble(targetLetter.wordNl || targetLetter.word);
      }, 700);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-2 px-4 max-w-4xl mx-auto select-none">
      {/* Monster Speech Prompt Bubble */}
      <div className="mt-1 flex flex-col items-center">
        <div
          onClick={() =>
            sounds.speak(
              language === 'nl'
                ? `Voer mij de letter ${targetLetter.letter}!`
                : `Feed me the letter ${targetLetter.letter}!`,
              language
            )
          }
          className="relative bg-white text-slate-800 px-6 py-2 rounded-3xl shadow-xl border-4 border-amber-300 font-black text-xl sm:text-2xl cursor-pointer active:scale-95 transition-transform"
        >
          <span>
            {speechBubble ||
              (language === 'nl'
                ? `Voer mij letter ${targetLetter.letter}!`
                : `Feed me letter ${targetLetter.letter}!`)}
          </span>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-white" />
        </div>
      </div>

      {/* The Animated ABC Monster */}
      <div className="relative flex flex-col items-center my-2">
        <div
          className={`relative w-48 h-48 sm:w-60 sm:h-60 rounded-[4rem] flex flex-col items-center justify-between p-4 transition-all duration-300
            ${monsterState === 'chewing' ? 'animate-kid-bounce bg-emerald-500 scale-105' : ''}
            ${monsterState === 'disgusted' ? 'animate-shake-wrong bg-purple-500' : 'bg-emerald-500'}
            ${monsterState === 'happy' ? 'animate-kid-wiggle bg-emerald-400' : ''}
          `}
          style={{
            boxShadow: '0 12px 0 #047857, 0 25px 30px -10px rgba(0,0,0,0.3)',
          }}
        >
          {/* Monster Fur Horns */}
          <div className="absolute -top-5 left-6 w-8 h-12 bg-amber-400 rounded-full rotate-[-20deg] border-4 border-emerald-700" />
          <div className="absolute -top-5 right-6 w-8 h-12 bg-amber-400 rounded-full rotate-[20deg] border-4 border-emerald-700" />

          {/* Googly Monster Eyes */}
          <div className="flex items-center gap-4 mt-2">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center border-4 border-emerald-800 shadow-inner relative overflow-hidden">
              <div
                className={`w-6 h-6 bg-slate-900 rounded-full transition-transform ${
                  monsterState === 'chewing' ? 'scale-75' : ''
                } ${monsterState === 'disgusted' ? 'translate-x-2' : ''}`}
              >
                <div className="w-2 h-2 bg-white rounded-full ml-1 mt-1" />
              </div>
            </div>

            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center border-4 border-emerald-800 shadow-inner relative overflow-hidden">
              <div
                className={`w-6 h-6 bg-slate-900 rounded-full transition-transform ${
                  monsterState === 'chewing' ? 'scale-75' : ''
                } ${monsterState === 'disgusted' ? '-translate-x-2' : ''}`}
              >
                <div className="w-2 h-2 bg-white rounded-full ml-1 mt-1" />
              </div>
            </div>
          </div>

          {/* Big Monster Mouth */}
          <div
            className={`relative w-36 sm:w-44 bg-rose-950 rounded-full flex items-center justify-center overflow-hidden border-4 border-emerald-800 transition-all duration-200 ${
              monsterState === 'chewing'
                ? 'h-8'
                : monsterState === 'happy'
                ? 'h-24'
                : monsterState === 'disgusted'
                ? 'h-10 rotate-12'
                : 'h-20'
            }`}
          >
            {/* Cartoon Teeth */}
            <div className="absolute top-0 flex gap-2">
              <div className="w-4 h-4 bg-white rounded-b-md" />
              <div className="w-4 h-5 bg-white rounded-b-md" />
              <div className="w-4 h-4 bg-white rounded-b-md" />
            </div>

            {/* Tongue */}
            <div className="absolute bottom-0 w-24 h-10 bg-rose-500 rounded-t-full" />

            {/* Hungry letter cue */}
            {monsterState === 'hungry' && (
              <span className="z-10 text-3xl font-black text-yellow-300 drop-shadow">
                {targetLetter.letter}
              </span>
            )}
          </div>

          {/* Monster Bib */}
          <div className="bg-emerald-600/60 px-4 py-1 rounded-full text-xs font-bold text-white tracking-wide">
            {language === 'nl' ? 'SMUL-MONSTER' : 'YUM-YUM MONSTER'}
          </div>
        </div>
      </div>

      {/* Cookie Plate */}
      <div className="w-full flex flex-col items-center">
        <div className="text-white font-extrabold text-base sm:text-lg drop-shadow mb-2">
          {language === 'nl'
            ? 'Tik op het letterkoekje om het monster te voeren! 🍪'
            : 'Tap the letter cookie to feed the monster! 🍪'}
        </div>

        <div className="bg-white/30 backdrop-blur-md p-3 sm:p-5 rounded-[2.5rem] border-4 border-white/60 shadow-2xl flex items-center justify-center gap-4 sm:gap-8">
          {cookieOptions.map((cookie) => (
            <button
              key={cookie.letter}
              onClick={() => handleFeedCookie(cookie)}
              disabled={isLocked}
              className="group relative w-20 h-20 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center font-black text-white text-4xl sm:text-5xl cursor-pointer transition-all active:scale-90 active:translate-y-2 hover:scale-105"
              style={{
                backgroundColor: cookie.color,
                boxShadow: `0 8px 0 ${cookie.shadowColor}, 0 12px 20px rgba(0,0,0,0.25)`,
              }}
            >
              <div className="absolute top-2 left-4 w-2 h-2 rounded-full bg-white/40" />
              <div className="absolute bottom-3 right-4 w-2.5 h-2.5 rounded-full bg-black/20" />
              <div className="absolute top-3 right-5 w-2 h-2 rounded-full bg-black/20" />

              <span className="drop-shadow-md select-none">{cookie.letter}</span>
              <span className="text-xs sm:text-sm font-bold opacity-90">{cookie.emoji}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
